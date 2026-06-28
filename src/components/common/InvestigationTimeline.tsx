import {
  FileText,
  Camera,
  MessageSquareText,
  Car,
  Fingerprint,
  UserCheck,
  ScrollText,
  Gavel,
  Check,
  Loader2,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { officerById, type CaseRecord } from "@/data/db";
import { shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PhaseDef {
  key: string;
  label: string;
  icon: LucideIcon;
  detail: string;
}

const PHASES: PhaseDef[] = [
  { key: "fir", label: "FIR Registered", icon: FileText, detail: "First Information Report logged at jurisdiction station" },
  { key: "evidence", label: "Evidence Collected", icon: Camera, detail: "Physical & digital exhibits seized and sealed" },
  { key: "witness", label: "Witness Statement", icon: MessageSquareText, detail: "Statements recorded u/s 161 CrPC" },
  { key: "vehicle", label: "Vehicle Recovery", icon: Car, detail: "Suspect vehicle traced via ANPR and impounded" },
  { key: "forensic", label: "Forensic Report", icon: Fingerprint, detail: "FSL analysis of seized exhibits" },
  { key: "arrest", label: "Arrest", icon: UserCheck, detail: "Accused apprehended and produced before magistrate" },
  { key: "chargesheet", label: "Charge Sheet", icon: ScrollText, detail: "Final report filed u/s 173 CrPC" },
  { key: "court", label: "Court Submission", icon: Gavel, detail: "Case committed to sessions court for trial" },
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** How many phases are complete, derived deterministically from case status. */
function completedThrough(c: CaseRecord): number {
  const base =
    c.status === "closed"
      ? 8
      : c.status === "investigating"
        ? 5
        : c.status === "pending"
          ? 4
          : 2; // open
  if (c.status === "closed") return 8;
  const jitter = hash(c.id) % 2; // -0/+1 wobble, keep within bounds
  return Math.max(1, Math.min(7, base + (jitter ? 1 : 0)));
}

const OFFICER_FALLBACK = ["Insp. R. Gowda", "SI M. Patil", "FSL Bengaluru", "ASI K. Reddy", "PI S. Nair"];

export function InvestigationTimeline({ c }: { c: CaseRecord }) {
  const lead = officerById(c.officerId);
  const done = completedThrough(c);
  const opened = new Date(c.opened).getTime();
  const DAY = 86400000;

  return (
    <ol className="relative ml-2 border-l border-border-strong">
      {PHASES.map((p, i) => {
        const completed = i < done;
        const active = i === done && c.status !== "closed";
        const seed = hash(c.id + p.key);
        const date = new Date(opened + (i * 3 + (seed % 3)) * DAY).toISOString();
        const officer =
          i === 0 || i === 5
            ? lead?.name ?? "Investigating Officer"
            : p.key === "forensic"
              ? "FSL " + (c.district || "Bengaluru")
              : OFFICER_FALLBACK[seed % OFFICER_FALLBACK.length];
        const Icon = p.icon;
        const StatusIcon = completed ? Check : active ? Loader2 : Clock;
        const statusLabel = completed ? "Completed" : active ? "In Progress" : "Pending";

        return (
          <li
            key={p.key}
            className={cn("relative pb-4 pl-6 last:pb-0", !completed && !active && "opacity-45")}
          >
            <span
              className={cn(
                "absolute -left-[11px] top-0 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-background",
                completed ? "bg-primary text-primary-foreground" : active ? "bg-elevated text-primary" : "bg-elevated text-muted-foreground",
              )}
            >
              <Icon className="h-3 w-3" />
            </span>

            <div
              className={cn(
                "rounded-sm border px-3 py-2",
                completed
                  ? "border-border-strong bg-elevated"
                  : active
                    ? "border-primary/40 bg-elevated"
                    : "border-border bg-background",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className={cn("text-[13px] font-medium", completed || active ? "text-foreground" : "text-muted-foreground")}>
                  {p.label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide",
                    completed
                      ? "bg-primary/15 text-primary"
                      : active
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-muted/40 text-muted-foreground",
                  )}
                >
                  <StatusIcon className={cn("h-2.5 w-2.5", active && "animate-spin")} />
                  {statusLabel}
                </span>
              </div>

              <p className="mt-0.5 text-[11px] text-muted-foreground">{p.detail}</p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] text-muted-foreground">
                <span>{completed || active ? shortDate(date) : "Awaiting"}</span>
                <span className="text-border-strong">·</span>
                <span>{completed || active ? officer : "Unassigned"}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
