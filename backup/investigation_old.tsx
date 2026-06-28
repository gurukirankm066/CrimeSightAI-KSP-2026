import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Phone, MapPin, ShieldAlert, Fingerprint, Activity, Users, Gavel } from "lucide-react";
import { DB, officerById, type CaseRecord, type CaseStatus, type Severity } from "@/data/db";
import { shortDate } from "@/lib/format";
import { Panel } from "@/components/common/Panel";
import { SeverityTag } from "@/components/common/SeverityTag";
import { InvestigationTimeline } from "@/components/common/InvestigationTimeline";
import { EvidenceCard } from "@/components/common/EvidenceCard";
import { GraphPanel } from "@/components/common/GraphPanel";
import { OfficerCard } from "@/components/common/OfficerCard";
import { CaseAIInsights } from "@/components/common/CaseAIInsights";
import { cn } from "@/lib/utils";
import { useShell } from "@/components/shell/ShellContext";
import { getCases, getCase } from "@/services/api";

export const Route = createFileRoute("/investigation")({
  head: () => ({
    meta: [
      { title: "Investigation Hub — CrimeSight AI" },
      { name: "description", content: "Case management and investigation workspace for the Karnataka State Police: filterable case table, timelines, victims, accused, evidence and AI insights." },
    ],
  }),
  component: InvestigationHub,
});

const PRIORITIES: (Severity | "all")[] = ["all", "critical", "high", "medium", "low"];
const STATUSES: (CaseStatus | "all")[] = ["all", "open", "investigating", "pending", "closed"];
const TABS = ["Overview", "Timeline", "Victims", "Accused", "Evidence", "Related", "Graph", "AI Insights"] as const;

// ---- deterministic synthetic detail derivations (stable per case/person) ----
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}
function pickFrom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}
const AREAS = ["Jayanagar", "Whitefield", "Vijayanagar", "Hebbal", "Kuvempunagar", "Gokul Road", "Aland Road", "Camp", "Tilakwadi", "Vinoba Nagar"];
const STATEMENT = ["Recorded u/s 161", "Pending", "Recorded u/s 164", "Re-statement scheduled"];
const SUPPORT = ["Victim compensation initiated", "Counselling assigned", "Witness protection review", "No assistance required"];
const PRIOR_TYPES = ["Theft", "Assault", "NDPS", "Forgery", "Robbery", "House-break"];
const CUSTODY = ["Judicial custody", "Police custody", "Out on bail", "Absconding", "Notice served"];

function maskedPhone(seed: number): string {
  return `+91 ${90 + (seed % 9)}XXX X${(seed % 9000 + 1000)}`;
}
function InvestigationHub() {
  const shell = useShell();

  const [apiCases, setApiCases] = useState<any[]>([]);
  const [priority, setPriority] = useState<Severity | "all">("all");
  const [status, setStatus] = useState<CaseStatus | "all">("all");
  const [activeId, setActiveId] = useState("");
  const [activeCase, setActiveCase] = useState<any>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  useEffect(() => {
    async function loadCases() {
      try {
        const res = await getCases();
        if (res.success) {
          setApiCases(res.data || []);
          if (res.data.length > 0) setActiveId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadCases();
  }, []);

  useEffect(() => {
    if (!activeId) return;

    async function loadCase() {
      try {
        const res = await getCase(activeId);

        if (res.success) {
          setActiveCase(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadCase();
  }, [activeId]);

  const filtered = useMemo(() => {

    if (apiCases.length === 0) {
      return [];
    }

    return apiCases.filter((c: any) => {

      const priorityMatch =
        priority === "all" ||
        c.priority === priority;

      const statusMatch =
        status === "all" ||
        c.status === status;

      return priorityMatch && statusMatch;

    });

  }, [apiCases, priority, status]);
  const active =
    filtered.find((c: any) => c.id === activeId) ||
    filtered[0];
  useEffect(() => {
    if (active && !activeId) {
      setActiveId(active.id);
    }
  }, [active]);
  const caseData = activeCase || active;
  if (!active) {
    return (
      <div className="p-6 text-white">
        Loading cases...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Investigation Hub</h1>
          <p className="text-xs text-muted-foreground">
            {apiCases.length} cases
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[460px_1fr] gap-3">
        {/* Table */}
        <Panel flush className="self-start overflow-hidden">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border p-2.5">
            <FilterGroup label="Priority" value={priority} options={PRIORITIES} onChange={(v) => setPriority(v as Severity | "all")} />
            <FilterGroup label="Status" value={status} options={STATUSES} onChange={(v) => setStatus(v as CaseStatus | "all")} />
          </div>
          <div className="max-h-[820px] overflow-y-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-elevated">
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 font-semibold">Case</th>
                  <th className="px-2 py-2 font-semibold">Priority</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn("cursor-pointer border-t border-border transition hover:bg-elevated", c.id === caseData.id && "bg-elevated")}
                  >
                    <td className="px-3 py-2">
                      <p className="text-[12px] font-medium leading-tight text-foreground">{c.title}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">FIR {c.fir} · {c.district}</p>
                    </td>
                    <td className="px-2 py-2"><SeverityTag severity={c.priority} /></td>
                    <td className="px-2 py-2"><StatusTag status={c.status} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={3} className="px-3 py-8 text-center text-[12px] text-muted-foreground">No cases match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Detail */}
        <div className="flex flex-col gap-3">
          <Panel>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold text-foreground">{caseData.title}</h2>
                  <SeverityTag severity={caseData.priority} />
                  <StatusTag status={caseData.status} />
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  {caseData.id} · FIR {caseData.fir} · {caseData.station} · opened {shortDate(caseData.opened)}
                </p>
              </div>
              <button
                onClick={() => shell.openAI(`Generate intelligence report for ${caseData.title}`)}
                className="shrink-0 rounded-sm bg-primary px-3 py-2 text-[12px] font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Generate Intelligence Report
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1 border-b border-border">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "border-b-2 px-2.5 py-1.5 text-[12px] font-medium transition",
                    tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "Related" ? "Related Cases" : t === "Graph" ? "Relationship Graph" : t}
                </button>
              ))}
            </div>

            <div className="pt-3">
              <CaseTab tab={tab} c={caseData} openAI={shell.openAI} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function CaseTab({ tab, c, openAI }: { tab: (typeof TABS)[number]; c: CaseRecord; openAI: (q: string) => void }) {
  const officer = c.officerId ? officerById(c.officerId) : null;
  switch (tab) {
    case "Overview": {
      const arrested = c.accused.filter((a) => a.status === "arrested").length;
      const progress = Math.min(96, 20 + c.evidence.length * 9 + arrested * 14 + c.timeline.length * 4);
      return (
        <div className="space-y-3">
          <p className="text-[13px] leading-relaxed text-foreground/90">{c.summary}</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Type" value={c.type} />
            <Stat label="District" value={c.district} />
            <Stat label="Lead Officer" value={officer?.name ?? "—"} />
            <Stat label="Last Update" value={shortDate(c.updated)} />
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <MiniStat icon={Users} label="Victims" value={`${c.victims.length}`} />
            <MiniStat icon={Gavel} label="Accused" value={`${c.accused.length} · ${arrested} arr.`} />
            <MiniStat icon={Fingerprint} label="Evidence" value={`${c.evidence.length} items`} />
            <MiniStat icon={Activity} label="Events" value={`${c.timeline.length} logged`} />
          </div>
          <div className="rounded-sm border border-border bg-elevated p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Investigation Progress</p>
              <span className="font-mono text-[11px] font-semibold text-primary">{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted-foreground">
              <span>FIR registered</span>
              <span className={c.timeline.length > 2 ? "text-foreground" : ""}>Investigation</span>
              <span className={arrested > 0 ? "text-foreground" : ""}>Arrests</span>
              <span className={c.status === "closed" ? "text-success" : ""}>Charge sheet</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="rounded-sm border border-border bg-elevated p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Lead Investigation Officer</p>
              {officer ? <OfficerCard officer={officer} /> : <span className="text-[12px] text-muted-foreground">Unassigned</span>}
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">{officer?.station} · caseload {officer?.caseload}</p>
            </div>
            <div className="rounded-sm border border-border bg-elevated p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Latest Activity</p>
              {c.timeline.slice(-3).reverse().map((t, i) => (
                <div key={i} className="flex items-baseline justify-between gap-2 py-0.5">
                  <span className="truncate text-[12px] text-foreground">{t.label}</span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{shortDate(t.time)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case "Timeline":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-sm border border-border bg-elevated px-3 py-2">
            <span className="text-[12px] text-foreground">{c.timeline.length} chronological events</span>
            <span className="font-mono text-[10px] text-muted-foreground">{shortDate(c.timeline[0].time)} → {shortDate(c.timeline[c.timeline.length - 1].time)}</span>
          </div>
          <InvestigationTimeline c={c} />
        </div>
      );
    case "Victims":
      return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {c.victims.map((v, i) => {
            const seed = hash(c.id + v.name);
            return (
              <div key={i} className="rounded-sm border border-border bg-elevated p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground">{v.name}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{v.gender} · {v.age}y</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> <span className="font-mono">{maskedPhone(seed)}</span></p>
                  <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {pickFrom(AREAS, seed)}, {c.district}</p>
                  <p className="text-foreground/80">Statement: {pickFrom(STATEMENT, seed >> 3)}</p>
                  <p>{pickFrom(SUPPORT, seed >> 5)}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    case "Accused":
      return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {c.accused.map((a, i) => {
            const seed = hash(c.id + a.name);
            const priors = seed % 7;
            const risk = 40 + (seed % 58);
            return (
              <div key={i} className="rounded-sm border border-border bg-elevated p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-warning" />
                    <span className="text-[13px] font-medium text-foreground">{a.name}</span>
                  </div>
                  <span className="rounded-sm border border-border bg-panel px-1.5 py-0.5 font-mono text-[10px] capitalize text-muted-foreground">{a.status}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <KV label="Risk" value={`${risk}`} accent={risk > 75} />
                  <KV label="Priors" value={`${priors}`} />
                  <KV label="Age" value={`${22 + (seed % 35)}`} />
                </div>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  {pickFrom(CUSTODY, seed >> 2)} · {priors > 0 ? `prior: ${pickFrom(PRIOR_TYPES, seed >> 4)}` : "no priors"}
                </p>
              </div>
            );
          })}
        </div>
      );
    case "Evidence":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <KV label="Total" value={`${c.evidence.length}`} />
            <KV label="At Lab" value={`${c.evidence.filter((e) => e.chain === "Lab").length}`} />
            <KV label="Sealed" value={`${c.evidence.filter((e) => e.chain === "Sealed").length}`} />
          </div>
          {c.evidence.map((e) => (
            <EvidenceCard key={e.id} evidence={e} />
          ))}
        </div>
      );
    case "Related":
      return (
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground">{c.related.length} cases linked by suspect, vehicle or modus operandi.</p>
          {c.related.map((id) => {
            const rc = DB.cases.find((x) => x.id === id);
            if (!rc) return null;
            const seed = hash(c.id + id);
            return (
              <div key={id} className="flex items-center justify-between rounded-sm border border-border bg-elevated px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-foreground">{rc.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">FIR {rc.fir} · linked via {pickFrom(["shared suspect", "common vehicle", "same MO", "proximity"], seed)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusTag status={rc.status} />
                  <SeverityTag severity={c.priority} />
                </div>
              </div>
            );
          })}
          {c.related.length === 0 && (
            <div className="rounded-sm border border-border bg-elevated px-3 py-6 text-center text-[12px] text-muted-foreground">No linked cases identified yet.</div>
          )}
        </div>
      );
    case "Graph":
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
            <Legend color="#2dd4de" label="Person" />
            <Legend color="#f5a623" label="Vehicle" />
            <Legend color="#3dd68c" label="Location" />
            <Legend color="#9aa5b5" label="FIR" />
          </div>
          <div className="h-[360px] overflow-hidden rounded-sm border border-border">
            <GraphPanel nodes={DB.nodes} links={DB.links} timeline={100} />
          </div>
        </div>
      );
    case "AI Insights":
      return <CaseAIInsights c={c} openAI={openAI} />;
  }
}



function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border bg-elevated p-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-[12px] font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function KV({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-sm border border-border bg-panel p-2 text-center">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("font-mono text-[13px] font-semibold", accent ? "text-warning" : "text-foreground")}>{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-elevated p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-medium text-foreground">{value}</p>
    </div>
  );
}

function StatusTag({ status }: { status: CaseStatus }) {
  const color: Record<CaseStatus, string> = {
    open: "text-primary",
    investigating: "text-warning",
    pending: "text-muted-foreground",
    closed: "text-success",
  };
  return <span className={cn("font-mono text-[10px] font-semibold uppercase", color[status])}>{status}</span>;
}

function FilterGroup<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex gap-0.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-sm px-1.5 py-0.5 text-[10px] font-medium capitalize transition",
              value === o ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

