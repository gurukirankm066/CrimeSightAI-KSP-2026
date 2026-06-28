// Deterministic operational notification feed — no backend, fully synthetic.
// Produces a stable backlog plus a deterministic stream of new signals that
// "arrive" over time so the bell feed feels live across the session.
import { DB, type Severity } from "@/data/db";

export type NotifKind = "fir" | "assignment" | "anpr" | "ai" | "spike";

export interface Notification {
  id: string;
  kind: NotifKind;
  icon: string;
  title: string;
  body: string;
  severity: Severity;
  time: string; // ISO
  ref?: string;
}

export const KIND_META: Record<NotifKind, { label: string; icon: string }> = {
  fir: { label: "New FIR", icon: "file" },
  assignment: { label: "Officer Assignment", icon: "badge" },
  anpr: { label: "ANPR Hit", icon: "scan" },
  ai: { label: "AI Alert", icon: "sparkles" },
  spike: { label: "Crime Spike", icon: "trend" },
};

// Independent seeded RNG so this stream is reproducible and stable.
let _s = 0x1f2e3d4c;
function rng(): number {
  _s ^= _s << 13;
  _s ^= _s >>> 17;
  _s ^= _s << 5;
  return ((_s >>> 0) % 100000) / 100000;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function int(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

let _counter = 0;

function build(kind: NotifKind, time: string): Notification {
  _counter += 1;
  const id = `NTF-${_counter}`;
  const icon = KIND_META[kind].icon;

  switch (kind) {
    case "fir": {
      const f = pick(DB.firs);
      return {
        id,
        kind,
        icon,
        title: `New FIR ${f.number} registered`,
        body: `${f.type} reported at ${f.station}, ${f.district}.`,
        severity: f.type === "Murder" || f.type === "Robbery" ? "critical" : pick(["high", "medium"]),
        time,
        ref: f.number,
      };
    }
    case "assignment": {
      const o = pick(DB.officers);
      const c = pick(DB.cases);
      return {
        id,
        kind,
        icon,
        title: `${o.rank} ${o.name} assigned`,
        body: `Tasked to ${c.title} (FIR ${c.fir}) — ${c.district}.`,
        severity: "low",
        time,
        ref: c.id,
      };
    }
    case "anpr": {
      const v = pick(DB.vehicles);
      const d = pick(DB.districts);
      return {
        id,
        kind,
        icon,
        title: `ANPR hit — ${v.plate}`,
        body: `${v.flag} ${v.model} captured near ${d.name} toll gantry.`,
        severity: v.flag === "Stolen" || v.flag === "Watchlist" ? "high" : "medium",
        time,
        ref: v.plate,
      };
    }
    case "ai": {
      const r = pick(DB.recommendations);
      return {
        id,
        kind,
        icon,
        title: r.title,
        body: `AI confidence ${r.confidence}% — ${r.action} recommended.`,
        severity: r.confidence >= 85 ? "critical" : "high",
        time,
        ref: r.id,
      };
    }
    case "spike": {
      const d = pick(DB.districts);
      const type = pick(["Vehicle Theft", "Chain Snatching", "Burglary", "Cyber Fraud", "Robbery"]);
      const jump = int(18, 64);
      return {
        id,
        kind,
        icon,
        title: `${type} spike — ${d.name}`,
        body: `Incidents up ${jump}% over baseline in the last 6 hours.`,
        severity: jump >= 45 ? "critical" : "high",
        time,
        ref: d.id,
      };
    }
  }
}

const KINDS: NotifKind[] = ["fir", "assignment", "anpr", "ai", "spike"];

// Deterministic backlog: most-recent first, spread across the past few hours.
export function buildBacklog(count = 14): Notification[] {
  const now = Date.now();
  const out: Notification[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(KINDS);
    const minsAgo = (i + 1) * int(3, 11);
    out.push(build(kind, new Date(now - minsAgo * 60000).toISOString()));
  }
  return out;
}

// Deterministic "next live signal" — called by the feed timer to append new
// notifications stamped at the current time. Sequence is reproducible.
export function nextSignal(): Notification {
  return build(pick(KINDS), new Date().toISOString());
}
