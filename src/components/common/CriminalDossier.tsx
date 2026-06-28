import { useMemo } from "react";
import {
  Pin, Send, Car, Phone, MapPin, Users, FileText, Clock,
  Plane, Layers, Crosshair, TrendingUp, Link2,
} from "lucide-react";
import { type GraphNode, type GraphLink } from "@/data/db";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<GraphNode["kind"], string> = {
  person: "Person", vehicle: "Vehicle", location: "Location", fir: "FIR",
};
const KIND_COLOR: Record<GraphNode["kind"], string> = {
  person: "#2dd4de", vehicle: "#f5a623", location: "#3dd68c", fir: "#9aa5b5",
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function pick<T>(arr: T[], seed: number): T { return arr[(((seed % arr.length) + arr.length) % arr.length)]; }
function rng(seed: number, min: number, max: number): number { const n = max - min + 1; return min + (((seed % n) + n) % n); }

const AREAS = ["Jayanagar", "Whitefield", "Hebbal", "KR Market", "Vijayanagar", "Gokul Road", "Camp", "Majestic", "Electronic City", "Banashankari", "Yeshwantpur", "Tilakwadi"];
const CATEGORIES = ["Property Crime", "Vehicle Theft", "Burglary", "Assault", "Narcotics", "Cyber Fraud", "Extortion", "Counterfeiting"];
const MO = [
  "Targets parked two-wheelers after midnight",
  "Uses cloned plates to evade ANPR",
  "Operates via WhatsApp burner numbers",
  "Coordinates 2-3 member getaway teams",
  "Strikes during festival crowd surges",
  "Fences goods through second-hand markets",
];
const PHONE_STATUS = ["Active", "Active", "Switched off", "Last seen 3d ago"];

function Confidence({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-1 w-12 overflow-hidden rounded-full bg-border">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </span>
      <span className="font-mono text-[9px] font-semibold text-primary">{value}%</span>
    </span>
  );
}

function Block({ icon: Icon, title, count, children }: { icon: typeof Car; title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {count !== undefined ? `${title} (${count})` : title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function EntityRow({ node, onSelect }: { node: GraphNode; onSelect: (n: GraphNode) => void }) {
  return (
    <button
      onClick={() => onSelect(node)}
      className="flex w-full items-center justify-between rounded-sm border border-border bg-elevated px-2.5 py-1.5 text-left transition hover:border-primary/40"
    >
      <span className="flex items-center gap-2 truncate text-[12px] text-foreground">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: KIND_COLOR[node.kind] }} />
        <span className="truncate">{node.label}</span>
      </span>
      <span className="ml-2 shrink-0 font-mono text-[10px] text-muted-foreground">{node.id}</span>
    </button>
  );
}

export function CriminalDossier({
  selected, neighbors, links, onSelectEntity, openAI,
}: {
  selected: GraphNode;
  neighbors: GraphNode[];
  links: GraphLink[];
  onSelectEntity: (n: GraphNode) => void;
  openAI: (q: string) => void;
}) {
  const seed = hash(selected.id);
  const vehicles = neighbors.filter((n) => n.kind === "vehicle");
  const locations = neighbors.filter((n) => n.kind === "location");
  const firs = neighbors.filter((n) => n.kind === "fir");
  const associates = neighbors.filter((n) => n.kind === "person");

  const phones = useMemo(() =>
    Array.from({ length: rng(seed, 1, 3) }).map((_, i) => {
      const s = hash(selected.id + "ph" + i);
      return { number: `+91 ${rng(s, 70, 99)}${String(rng(s >> 3, 10000000, 99999999)).slice(0, 8)}`, status: pick(PHONE_STATUS, s >> 6), conf: rng(s >> 8, 62, 94) };
    }), [seed, selected.id]);

  const addresses = useMemo(() =>
    Array.from({ length: rng(seed >> 1, 1, 2) }).map((_, i) => {
      const s = hash(selected.id + "ad" + i);
      return `#${rng(s, 1, 240)}, ${pick(AREAS, s >> 3)}, Karnataka`;
    }), [seed, selected.id]);

  const timeline = useMemo(() => {
    const events = [
      { t: "First flagged in network", k: "node" },
      { t: `Linked to ${pick(AREAS, seed)} incident`, k: "loc" },
      { t: `Associated with ${vehicles[0]?.label ?? "a vehicle"}`, k: "veh" },
      { t: `Connected to ${firs[0]?.label ?? "a filing"}`, k: "fir" },
      { t: `Co-offender contact established`, k: "per" },
    ];
    return events.map((e, i) => ({ ...e, day: `Day ${rng(hash(selected.id + i), 1, 90)}` }));
  }, [seed, selected.id, vehicles, firs]);

  const travel = useMemo(() => Array.from(new Set(Array.from({ length: 4 }).map((_, i) => pick(AREAS, hash(selected.id + "tv" + i))))), [selected.id]);
  const categories = useMemo(() =>
    Array.from(new Set(Array.from({ length: 3 }).map((_, i) => pick(CATEGORIES, hash(selected.id + "ct" + i)))))
      .map((c) => ({ c, conf: rng(hash(selected.id + c), 55, 92) })), [selected.id]);
  const mo = useMemo(() => Array.from(new Set([pick(MO, seed), pick(MO, seed >> 3), pick(MO, seed >> 5)])), [seed]);

  const riskTrend = useMemo(() => {
    const pts: number[] = [];
    let v = rng(seed, 30, 55);
    for (let i = 0; i < 8; i++) { v = Math.max(10, Math.min(98, v + rng(hash(selected.id + "rt" + i), 0, 30) - 12)); pts.push(v); }
    pts[pts.length - 1] = selected.risk;
    return pts;
  }, [seed, selected.id, selected.risk]);
  const trendDelta = riskTrend[riskTrend.length - 1] - riskTrend[0];

  const strength = useMemo(() => {
    return associates.map((a) => {
      const link = links.find((l) => {
        const s = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
        const t = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
        return (s === selected.id && t === a.id) || (t === selected.id && s === a.id);
      });
      const w = link ? Math.round(link.weight * 100) : rng(hash(selected.id + a.id), 30, 90);
      return { a, w: Math.min(100, w) };
    }).sort((x, y) => y.w - x.w);
  }, [associates, links, selected.id]);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{KIND_LABEL[selected.kind]} dossier</p>
          <h2 className="text-[15px] font-semibold text-foreground">{selected.label}</h2>
          <p className="font-mono text-[10px] text-muted-foreground">{selected.id}</p>
        </div>
        {selected.pinned && <Pin className="h-3.5 w-3.5 text-warning" />}
      </div>

      {/* Risk score */}
      <div className="mt-3 rounded-sm border border-border bg-elevated p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Risk Score</span>
          <span className="font-mono text-lg font-semibold text-foreground">{selected.risk}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-sm bg-panel">
          <div className={cn("h-full rounded-sm", selected.risk > 75 ? "bg-destructive" : selected.risk > 50 ? "bg-warning" : "bg-primary")} style={{ width: `${selected.risk}%` }} />
        </div>
      </div>

      {/* Risk trend */}
      <Block icon={TrendingUp} title="Risk Trend">
        <div className="rounded-sm border border-border bg-elevated p-3">
          <div className="flex items-center justify-between">
            <Sparkline pts={riskTrend} />
            <span className={cn("font-mono text-[11px] font-semibold", trendDelta >= 0 ? "text-destructive" : "text-success")}>
              {trendDelta >= 0 ? "▲" : "▼"} {Math.abs(trendDelta)}
            </span>
          </div>
          <p className="mt-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">8-period risk trajectory</p>
        </div>
      </Block>

      {/* Known Vehicles */}
      <Block icon={Car} title="Known Vehicles" count={vehicles.length}>
        <div className="space-y-1">
          {vehicles.map((v) => <EntityRow key={v.id} node={v} onSelect={onSelectEntity} />)}
          {vehicles.length === 0 && <Empty text="No vehicles linked." />}
        </div>
      </Block>

      {/* Known Phones */}
      <Block icon={Phone} title="Known Phones" count={phones.length}>
        <div className="space-y-1">
          {phones.map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-sm border border-border bg-elevated px-2.5 py-1.5">
              <span className="font-mono text-[12px] text-foreground">{p.number}</span>
              <span className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{p.status}</span>
                <Confidence value={p.conf} />
              </span>
            </div>
          ))}
        </div>
      </Block>

      {/* Known Addresses */}
      <Block icon={MapPin} title="Known Addresses" count={addresses.length}>
        <div className="space-y-1">
          {addresses.map((a, i) => (
            <div key={i} className="rounded-sm border border-border bg-elevated px-2.5 py-1.5 text-[12px] text-foreground">{a}</div>
          ))}
        </div>
      </Block>

      {/* Known Associates */}
      <Block icon={Users} title="Known Associates" count={associates.length}>
        <div className="space-y-1">
          {associates.map((a) => <EntityRow key={a.id} node={a} onSelect={onSelectEntity} />)}
          {associates.length === 0 && <Empty text="No co-offenders linked." />}
        </div>
      </Block>

      {/* Linked FIRs */}
      <Block icon={FileText} title="Linked FIRs" count={firs.length}>
        <div className="space-y-1">
          {firs.map((f) => <EntityRow key={f.id} node={f} onSelect={onSelectEntity} />)}
          {firs.length === 0 && <Empty text="No FIRs linked." />}
        </div>
      </Block>

      {/* Relationship Strength */}
      <Block icon={Link2} title="Relationship Strength">
        <div className="space-y-1.5">
          {strength.map(({ a, w }) => (
            <button key={a.id} onClick={() => onSelectEntity(a)} className="block w-full text-left">
              <div className="flex items-center justify-between">
                <span className="truncate text-[12px] text-foreground">{a.label}</span>
                <span className="font-mono text-[10px] text-primary">{w}%</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-border">
                <div className={cn("h-full rounded-full", w > 70 ? "bg-destructive" : w > 45 ? "bg-warning" : "bg-primary")} style={{ width: `${w}%` }} />
              </div>
            </button>
          ))}
          {strength.length === 0 && <Empty text="No measurable associations." />}
        </div>
      </Block>

      {/* Timeline */}
      <Block icon={Clock} title="Timeline">
        <div className="space-y-2 border-l border-border pl-3">
          {timeline.map((e, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[1.05rem] top-1 h-2 w-2 rounded-full bg-primary" />
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{e.day}</p>
              <p className="text-[12px] text-foreground/90">{e.t}</p>
            </div>
          ))}
        </div>
      </Block>

      {/* Travel Pattern */}
      <Block icon={Plane} title="Travel Pattern">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {travel.map((t, i) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="rounded-sm border border-border bg-elevated px-2 py-0.5 font-mono text-foreground">{t}</span>
              {i < travel.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>
      </Block>

      {/* Crime Categories */}
      <Block icon={Layers} title="Crime Categories">
        <div className="space-y-1.5">
          {categories.map(({ c, conf }) => (
            <div key={c} className="flex items-center justify-between rounded-sm border border-border bg-elevated px-2.5 py-1.5">
              <span className="text-[12px] text-foreground">{c}</span>
              <Confidence value={conf} />
            </div>
          ))}
        </div>
      </Block>

      {/* Modus Operandi */}
      <Block icon={Crosshair} title="Modus Operandi">
        <ul className="space-y-1">
          {mo.map((m) => (
            <li key={m} className="flex items-start gap-2 text-[12px] text-foreground/90">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />{m}
            </li>
          ))}
        </ul>
      </Block>

      <button
        onClick={() => openAI(`Investigate ${selected.label}`)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-3 py-2 text-[12px] font-semibold text-primary-foreground transition hover:opacity-90"
      >
        <Send className="h-3.5 w-3.5" /> Send to Investigation
      </button>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-[12px] text-muted-foreground">{text}</p>;
}

function Sparkline({ pts }: { pts: number[] }) {
  const w = 120, h = 28, max = Math.max(...pts), min = Math.min(...pts);
  const span = Math.max(1, max - min);
  const d = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / span) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={d} fill="none" stroke="#2dd4de" strokeWidth={1.5} />
      {pts.map((p, i) => (
        <circle key={i} cx={(i / (pts.length - 1)) * w} cy={h - ((p - min) / span) * h} r={i === pts.length - 1 ? 2.5 : 1.5} fill={i === pts.length - 1 ? "#e5484d" : "#2dd4de"} />
      ))}
    </svg>
  );
}
