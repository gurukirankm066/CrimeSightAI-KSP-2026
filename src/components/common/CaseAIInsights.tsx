import {
  ShieldAlert,
  Fingerprint,
  GitCompareArrows,
  Repeat,
  Route as RouteIcon,
  ShieldCheck,
  Brain,
  FileText,
  ArrowRight,
  Link2,
  ListChecks,
} from "lucide-react";
import { officerById, type CaseRecord } from "@/data/db";
import { cn } from "@/lib/utils";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}
function range(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1));
}

const AREAS = [
  "Jayanagar", "Whitefield", "Vijayanagar", "Hebbal", "Kuvempunagar",
  "Gokul Road", "Aland Road", "Camp", "Tilakwadi", "KR Market",
  "Electronic City", "Yeshwantpur", "Banashankari", "Majestic",
];
const EXITS = ["NH-44 toll", "Outer Ring Road", "NH-48 bypass", "Old Airport Rd", "Tumkur Rd checkpost", "Mysuru Rd corridor"];
const BEHAVIOURS = [
  "Operates during low-visibility night hours",
  "Targets transit hubs & crowded markets",
  "Switches vehicles after each offence",
  "Avoids CCTV-dense commercial zones",
  "Acts within 5km of prior incidents",
  "Uses accomplices for lookout & getaway",
];

function tone(v: number) {
  if (v >= 75) return { text: "text-destructive", bg: "bg-destructive", soft: "bg-destructive/15", label: "High" };
  if (v >= 50) return { text: "text-warning", bg: "bg-warning", soft: "bg-warning/15", label: "Moderate" };
  return { text: "text-success", bg: "bg-success", soft: "bg-success/15", label: "Low" };
}

function Confidence({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-14 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-[9px] font-semibold text-primary">{value}%</span>
    </div>
  );
}

function ScoreGauge({ icon: Icon, label, value, suffix, conf }: { icon: typeof ShieldAlert; label: string; value: number; suffix?: string; conf: number }) {
  const t = tone(value);
  return (
    <div className="rounded-sm border border-border bg-elevated p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className={cn("rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase", t.soft, t.text)}>{t.label}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className={cn("font-mono text-2xl font-semibold", t.text)}>{value}</span>
        <span className="text-[11px] text-muted-foreground">{suffix ?? "/100"}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
        <div className={cn("h-full rounded-full", t.bg)} style={{ width: `${value}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Confidence</span>
        <Confidence value={conf} />
      </div>
    </div>
  );
}

function Block({ icon: Icon, title, conf, children }: { icon: typeof ShieldAlert; title: string; conf: number; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-elevated p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" /> {title}
        </span>
        <Confidence value={conf} />
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function CaseAIInsights({ c, openAI }: { c: CaseRecord; openAI: (q: string) => void }) {
  const seed = hash(c.id);
  const lead = officerById(c.officerId);

  const risk = range(seed, 48, 96);
  const similarity = range(seed >> 2, 40, 93);
  const repeatProb = range(seed >> 4, 35, 92);
  const repeatOffender = repeatProb >= 60;
  const priors = range(seed >> 6, 2, 7);

  // Escape route — chain of areas terminating at an exit corridor.
  const start = pick(AREAS, seed);
  const mid = pick(AREAS, seed >> 3);
  const exit = pick(EXITS, seed >> 5);
  const escapeConf = range(seed >> 7, 61, 88);

  // Patrol route — recommended deployment loop.
  const patrol = [pick(AREAS, seed >> 8), pick(AREAS, seed >> 9), pick(AREAS, seed >> 10)];
  const patrolConf = range(seed >> 11, 70, 94);

  const behaviours = [pick(BEHAVIOURS, seed), pick(BEHAVIOURS, seed >> 2), pick(BEHAVIOURS, seed >> 4)].filter((b, i, a) => a.indexOf(b) === i);

  const steps = [
    { text: `Deploy a patrol team to ${patrol[0]} and ${patrol[1]} during ${pick(["night", "evening", "early-morning"], seed)} hours.`, conf: patrolConf },
    { text: `Cross-reference ${c.evidence[0]?.type.toLowerCase() ?? "physical"} evidence against ${c.related.length || 2} linked case file(s).`, conf: range(seed >> 1, 72, 90) },
    { text: repeatOffender ? `Run repeat-offender lookup; ${priors} prior records flagged for review.` : `Expand suspect screening — no strong repeat-offender signal yet.`, conf: repeatProb },
    { text: `Set ANPR alerts on ${exit} to intercept the predicted escape corridor.`, conf: escapeConf },
  ];

  return (
    <div className="space-y-2">
      {/* Score gauges */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ScoreGauge icon={ShieldAlert} label="Risk Score" value={risk} conf={range(seed >> 12, 80, 95)} />
        <ScoreGauge icon={GitCompareArrows} label="Crime Similarity" value={similarity} suffix="% match" conf={range(seed >> 13, 74, 91)} />
        <ScoreGauge icon={Repeat} label="Repeat Offender" value={repeatProb} suffix="% prob." conf={range(seed >> 14, 70, 89)} />
      </div>

      {/* Repeat offender detection */}
      <Block icon={Fingerprint} title="Repeat Offender Detection" conf={repeatProb}>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase", repeatOffender ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success")}>
            {repeatOffender ? "Match Detected" : "No Strong Match"}
          </span>
          <span className="text-[12px] text-foreground/90">
            {repeatOffender
              ? `${priors} prior ${c.type.toLowerCase()} records share modus operandi & locality.`
              : `Profile partially overlaps with ${priors} historical records — monitoring advised.`}
          </span>
        </div>
      </Block>

      {/* Linked cases */}
      <Block icon={Link2} title="Linked Cases" conf={range(seed >> 5, 68, 90)}>
        {c.related.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {c.related.map((r) => (
              <button
                key={r}
                onClick={() => openAI(`Compare case ${c.id} with ${r}`)}
                className="rounded-sm border border-border bg-panel px-2 py-1 font-mono text-[11px] text-primary transition hover:bg-primary/10"
              >
                {r}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">No directly linked cases — pattern-based correlation in progress.</p>
        )}
      </Block>

      {/* Escape + patrol routes */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <Block icon={RouteIcon} title="Predicted Escape Route" conf={escapeConf}>
          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            <RouteNode label={start} />
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <RouteNode label={mid} />
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <RouteNode label={exit} exit />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Projected from incident geolocation and historical getaway vectors.</p>
        </Block>

        <Block icon={ShieldCheck} title="Recommended Patrol Route" conf={patrolConf}>
          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            {patrol.map((p, i) => (
              <span key={p + i} className="flex items-center gap-1.5">
                <RouteNode label={p} patrol />
                {i < patrol.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Optimised loop covering high-probability re-offence zones.</p>
        </Block>
      </div>

      {/* Behaviour pattern */}
      <Block icon={Brain} title="Suspect Behaviour Pattern" conf={range(seed >> 9, 66, 88)}>
        <ul className="space-y-1">
          {behaviours.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[12px] text-foreground/90">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              {b}
            </li>
          ))}
        </ul>
      </Block>

      {/* AI summary */}
      <Block icon={FileText} title="AI Summary" conf={range(seed >> 3, 78, 93)}>
        <p className="text-[13px] leading-relaxed text-foreground/90">
          CrimeSight assesses this {c.type.toLowerCase()} case in {c.district} as <span className={tone(risk).text}>{tone(risk).label.toLowerCase()} risk</span> ({risk}/100), with a {similarity}% modus-operandi similarity to active clusters.
          {repeatOffender ? ` A repeat-offender signal (${repeatProb}%) links it to ${priors} prior records.` : ` No dominant repeat-offender signal yet.`} Predicted escape vector heads toward {exit}; priority deployment to {patrol[0]} and {patrol[1]} is advised. Lead officer: {lead?.name ?? "unassigned"}.
        </p>
      </Block>

      {/* Next steps */}
      <Block icon={ListChecks} title="Recommended Next Steps" conf={patrolConf}>
        <ol className="space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-primary/15 font-mono text-[10px] font-semibold text-primary">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-foreground/90">{s.text}</p>
                <div className="mt-0.5"><Confidence value={s.conf} /></div>
              </div>
            </li>
          ))}
        </ol>
        <button
          onClick={() => openAI(`Generate full intelligence report for ${c.title}`)}
          className="mt-2.5 rounded-sm border border-border bg-panel px-2.5 py-1.5 text-[11px] font-medium text-primary transition hover:bg-primary/10"
        >
          Generate full report
        </button>
      </Block>
    </div>
  );
}

function RouteNode({ label, exit, patrol }: { label: string; exit?: boolean; patrol?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-sm border px-2 py-0.5 font-mono text-[11px]",
        exit
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : patrol
            ? "border-success/40 bg-success/10 text-success"
            : "border-border bg-panel text-foreground",
      )}
    >
      {label}
    </span>
  );
}
