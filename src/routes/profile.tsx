import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Settings, Shield, Users, Bell, Activity, KeyRound, Lock, History } from "lucide-react";
import { DB, currentOfficer } from "@/data/db";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Panel } from "@/components/common/Panel";
import { OfficerCard } from "@/components/common/OfficerCard";
import { shortDate, clockTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Officer Profile & Administration — CrimeSight AI" },
      { name: "description", content: "Officer profile and platform administration for the Karnataka State Police: personnel directory, role access, alert preferences, activity logs, roles, permissions and audit history." },
    ],
  }),
  component: Profile,
});

const TABS = ["Profile", "Personnel", "Access Control", "Preferences", "Activity Logs", "Roles", "Permissions", "Audit History"] as const;
type Tab = (typeof TABS)[number];

const TAB_ICON: Record<Tab, typeof Shield> = {
  Profile: Shield,
  Personnel: Users,
  "Access Control": Shield,
  Preferences: Bell,
  "Activity Logs": Activity,
  Roles: KeyRound,
  Permissions: Lock,
  "Audit History": History,
};

// ---- deterministic synthetic data ----
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function ts(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60000).toISOString();
}

const ACTIVITY_ACTIONS = [
  ["Viewed case", "CASE-512 · Vehicle Theft", "read"],
  ["Generated intelligence report", "Chain Snatching — Hubballi", "create"],
  ["Updated case status", "CASE-507 → investigating", "update"],
  ["Searched suspect", "alias 'Tiger'", "read"],
  ["Exported analytics", "District crime trends (14d)", "export"],
  ["Assigned officer", "Insp. Gowda → CASE-518", "update"],
  ["Acknowledged alert", "ANPR hit — Whitefield", "update"],
  ["Opened relationship graph", "Mysuru burglary cell", "read"],
  ["Logged in", "SCRB console · 2FA verified", "auth"],
  ["Sealed evidence", "EV-330 · CCTV footage", "create"],
  ["Closed case", "CASE-499 · Burglary", "update"],
  ["Escalated alert", "Crime hotspot — Kalaburagi Ward 12", "update"],
];

const ROLES = [
  { name: "Director General", users: 1, scope: "Statewide", desc: "Full command authority across all modules and districts." },
  { name: "Inspector General", users: 4, scope: "Range", desc: "Range-level oversight, intelligence and personnel management." },
  { name: "Superintendent (SP)", users: 31, scope: "District", desc: "District command, case assignment and investigation review." },
  { name: "Deputy SP (DySP)", users: 58, scope: "Sub-division", desc: "Sub-divisional supervision and case escalation." },
  { name: "Inspector", users: 214, scope: "Station", desc: "Station-house case handling and evidence custody." },
  { name: "Sub-Inspector", users: 487, scope: "Station", desc: "Field investigation, FIR registration and beat intelligence." },
  { name: "Cyber Cell Analyst", users: 22, scope: "Specialised", desc: "Digital forensics, cyber-fraud pattern analysis." },
  { name: "SCRB Administrator", users: 6, scope: "Platform", desc: "Platform configuration, audit access and user provisioning." },
];

const MODULES = ["Command Center", "Morning Intelligence", "Investigation Hub", "Criminal Network", "Crime Analytics", "Administration"];
const PERM_ACTIONS = ["View", "Create", "Edit", "Delete", "Export"];
// permission level per module per action for the current role (DGP) and a sample SI for contrast
const PERM_MATRIX: Record<string, boolean[]> = {
  "Command Center": [true, true, true, true, true],
  "Morning Intelligence": [true, true, true, false, true],
  "Investigation Hub": [true, true, true, true, true],
  "Criminal Network": [true, true, true, false, true],
  "Crime Analytics": [true, true, false, false, true],
  Administration: [true, true, true, true, true],
};

const AUDIT_EVENTS = [
  ["Permission granted", "SCRB Admin granted 'Delete' on Investigation Hub to DySP role", "config", "critical"],
  ["Role modified", "Cyber Cell Analyst scope expanded to include Network module", "config", "high"],
  ["User provisioned", "New Sub-Inspector account KSP-4471 activated (Belagavi)", "user", "medium"],
  ["Failed login blocked", "5 failed 2FA attempts on KSP-3320 — account locked", "security", "high"],
  ["Data export", "District crime trends exported by SP Reddy (Mysuru)", "data", "medium"],
  ["Access revoked", "Admin access removed from KSP-2210 on transfer", "user", "high"],
  ["Policy change", "Session timeout reduced 30m → 15m statewide", "config", "medium"],
  ["Bulk update", "142 closed cases archived to SCRB cold storage", "data", "low"],
  ["Credential reset", "Password reset forced for 18 Inspector accounts", "security", "medium"],
  ["Audit export", "Quarterly audit log exported by SCRB Administrator", "data", "low"],
];

function Profile() {
  const [tab, setTab] = useState<Tab>("Profile");
  const [prefs, setPrefs] = useState({ critical: true, daily: true, network: false, forecast: true });

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Officer Profile & Administration</h1>
          <p className="text-xs text-muted-foreground">State Crime Records Bureau · access level: Director General</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
        <Panel flush className="h-fit overflow-hidden">
          {TABS.map((t) => {
            const Icon = TAB_ICON[t];
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex w-full items-center gap-2 border-l-2 px-3 py-2.5 text-left text-[13px] transition",
                  tab === t ? "border-primary bg-elevated text-primary" : "border-transparent text-muted-foreground hover:bg-elevated/60 hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t}
              </button>
            );
          })}
        </Panel>

        <div>
          {tab === "Profile" && <ProfileTab />}
          {tab === "Personnel" && <PersonnelTab />}
          {tab === "Access Control" && <AccessControlTab />}
          {tab === "Preferences" && <PreferencesTab prefs={prefs} setPrefs={setPrefs} />}
          {tab === "Activity Logs" && <ActivityLogsTab />}
          {tab === "Roles" && <RolesTab />}
          {tab === "Permissions" && <PermissionsTab />}
          {tab === "Audit History" && <AuditHistoryTab />}
        </div>
      </div>
    </div>
  );
}

const PROFILE_PERMISSIONS = [
  "Statewide command authority",
  "User provisioning & role assignment",
  "Audit log access (read / export)",
  "Case reassignment across districts",
  "Intelligence report generation",
  "Platform configuration",
];

const SERVICE_HISTORY = [
  ["2022 — Present", "Director General of Police", "State Crime Records Bureau"],
  ["2017 — 2022", "Additional DGP (Law & Order)", "State HQ, Bengaluru"],
  ["2012 — 2017", "Inspector General", "Southern Range, Mysuru"],
  ["2005 — 2012", "Superintendent of Police", "Mangaluru District"],
  ["1998 — 2005", "Deputy SP", "Belagavi Sub-division"],
  ["1991 — 1998", "Probationary IPS / ASP", "Karnataka Police Academy"],
];

const SEV_DOT: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-primary",
  low: "bg-success",
};

function ProfileTab() {
  const assignedCases = useMemo(() => DB.cases.filter((c) => c.status !== "closed").slice(0, 6), []);
  const completedCases = useMemo(() => DB.cases.filter((c) => c.status === "closed").slice(0, 6), []);
  const openCount = DB.cases.filter((c) => c.status !== "closed").length;
  const closedCount = DB.cases.filter((c) => c.status === "closed").length;

  return (
    <div className="space-y-3">
      <Panel>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-sm font-mono text-xl font-semibold text-background" style={{ background: `hsl(${currentOfficer.avatarHue} 55% 55%)` }}>
            {currentOfficer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-foreground">{currentOfficer.name}</h2>
            <p className="text-[13px] text-muted-foreground">{currentOfficer.rank}</p>
            <p className="font-mono text-[11px] text-primary">{currentOfficer.badge} · {currentOfficer.station}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Field label="Role" value="Director General" />
          <Field label="Access Level" value="TS / SCI · Tier 1" />
          <Field label="Department" value="State Crime Records Bureau" />
          <Field label="Jurisdiction" value={currentOfficer.district} />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Field label="Service ID" value="IPS-1991-KA-014" />
          <Field label="Joined" value="12 Aug 1991" />
          <Field label="Last login" value="Today · 06:12 IST" />
          <Field label="2FA Status" value="Enabled · TOTP" />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Permissions */}
        <Panel>
          <SectionHeader title="Permissions" subtitle="Effective grants for this account" className="mb-2" />
          <div className="space-y-1.5">
            {PROFILE_PERMISSIONS.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-success">●</span>
                <p className="text-[12px] text-foreground">{p}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Access & security summary */}
        <Panel>
          <SectionHeader title="Access & Security" subtitle="Current session posture" className="mb-2" />
          <div className="divide-y divide-border">
            <SecurityRow label="Role" value="Director General" tone="default" />
            <SecurityRow label="Access Level" value="TS / SCI · Tier 1" tone="default" />
            <SecurityRow label="2FA Status" value="Enabled (TOTP)" tone="success" />
            <SecurityRow label="Last Login" value="Today · 06:12 IST · 10.4.12.9" tone="default" />
            <SecurityRow label="Session Timeout" value="15 minutes" tone="default" />
            <SecurityRow label="Department" value="State Crime Records Bureau" tone="default" />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Assigned cases */}
        <Panel flush>
          <SectionHeader title="Assigned Cases" subtitle={`${openCount} active under command oversight`} className="px-4 pt-3" />
          <div className="divide-y divide-border">
            {assignedCases.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", SEV_DOT[c.priority])} />
                    <p className="truncate text-[13px] text-foreground">{c.title}</p>
                  </div>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">{c.fir} · {c.district}</p>
                </div>
                <span className="shrink-0 rounded-sm border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] uppercase text-warning">{c.status}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Completed cases */}
        <Panel flush>
          <SectionHeader title="Completed Cases" subtitle={`${closedCount} closed / archived`} className="px-4 pt-3" />
          <div className="divide-y divide-border">
            {completedCases.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", SEV_DOT[c.priority])} />
                    <p className="truncate text-[13px] text-foreground">{c.title}</p>
                  </div>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">{c.fir} · closed {shortDate(c.updated)}</p>
                </div>
                <span className="shrink-0 rounded-sm border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] uppercase text-success">closed</span>
              </div>
            ))}
            {completedCases.length === 0 && (
              <p className="px-4 py-4 text-[12px] text-muted-foreground">No closed cases on record.</p>
            )}
          </div>
        </Panel>
      </div>

      {/* Service history */}
      <Panel flush>
        <SectionHeader title="Service History" subtitle="Career postings · 33 years of service" className="px-4 pt-3" />
        <div className="divide-y divide-border">
          {SERVICE_HISTORY.map((s) => (
            <div key={s[0]} className="flex items-start justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">{s[1]}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{s[2]}</p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-primary">{s[0]}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Audit history (recent) */}
      <ProfileAuditHistory />
    </div>
  );
}

function SecurityRow({ label, value, tone }: { label: string; value: string; tone: "default" | "success" }) {
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className={cn("font-mono text-[11px]", tone === "success" ? "text-success" : "text-foreground")}>{value}</p>
    </div>
  );
}

function ProfileAuditHistory() {
  const rows = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const e = AUDIT_EVENTS[i % AUDIT_EVENTS.length];
        const seed = hash("pad" + i);
        return { title: e[0], detail: e[1], kind: e[2], time: ts(i * 180 + (seed % 90)) };
      }),
    []
  );
  return (
    <Panel flush>
      <SectionHeader title="Audit History" subtitle="Recent account-linked changes" className="px-4 pt-3" />
      <div className="divide-y divide-border">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("font-mono text-[9px] uppercase tracking-wider", AUDIT_KIND_COLOR[r.kind])}>{r.kind}</span>
                <p className="text-[13px] font-medium text-foreground">{r.title}</p>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{r.detail}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] text-muted-foreground">{shortDate(r.time)}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{clockTime(r.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}


function PersonnelTab() {
  return (
    <Panel flush>
      <SectionHeader title="Personnel Directory" subtitle={`${DB.officers.length} officers across ${DB.districts.length} districts`} className="px-4 pt-3" />
      <div className="max-h-[560px] divide-y divide-border overflow-y-auto">
        {DB.officers.map((o) => (
          <div key={o.id} className="flex items-center justify-between px-4 py-2.5">
            <OfficerCard officer={o} />
            <div className="text-right">
              <p className="text-[12px] text-foreground">{o.district}</p>
              <p className="font-mono text-[10px] text-muted-foreground">caseload {o.caseload}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AccessControlTab() {
  return (
    <Panel flush>
      <SectionHeader title="Role Access Matrix" subtitle="Module permissions by rank" className="px-4 pt-3" />
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-2 font-semibold">Role</th>
            <th className="px-2 py-2 font-semibold">Command</th>
            <th className="px-2 py-2 font-semibold">Investigation</th>
            <th className="px-2 py-2 font-semibold">Network</th>
            <th className="px-2 py-2 font-semibold">Admin</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["DGP / IGP", true, true, true, true],
            ["SP / DySP", true, true, true, false],
            ["Inspector", true, true, true, false],
            ["Sub-Inspector", true, true, false, false],
            ["ASI", true, false, false, false],
          ].map((row) => (
            <tr key={row[0] as string} className="border-b border-border">
              <td className="px-4 py-2 text-foreground">{row[0]}</td>
              {row.slice(1).map((v, i) => (
                <td key={i} className="px-2 py-2">
                  <span className={v ? "font-mono text-[11px] text-success" : "font-mono text-[11px] text-muted-foreground"}>{v ? "● allow" : "○ deny"}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function PreferencesTab({ prefs, setPrefs }: { prefs: Record<string, boolean>; setPrefs: React.Dispatch<React.SetStateAction<{ critical: boolean; daily: boolean; network: boolean; forecast: boolean }>> }) {
  return (
    <Panel>
      <SectionHeader title="Alert Preferences" className="mb-2" />
      <div className="divide-y divide-border">
        {[
          ["critical", "Critical alerts", "Immediate push for critical-severity intelligence"],
          ["daily", "Daily briefing", "Morning intelligence pack at 06:00 IST"],
          ["network", "Network changes", "Notify when a watchlist node gains new links"],
          ["forecast", "Forecast warnings", "Predictive hotspot alerts 48h ahead"],
        ].map(([key, title, desc]) => (
          <div key={key} className="flex items-center justify-between py-3">
            <div>
              <p className="text-[13px] font-medium text-foreground">{title}</p>
              <p className="text-[11px] text-muted-foreground">{desc}</p>
            </div>
            <button
              onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
              className={cn("relative h-5 w-9 rounded-full transition", prefs[key] ? "bg-primary" : "bg-elevated")}
            >
              <span className="absolute top-0.5 h-4 w-4 rounded-full bg-background transition" style={{ left: prefs[key] ? "18px" : "2px" }} />
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const KIND_COLOR: Record<string, string> = {
  read: "text-primary",
  create: "text-success",
  update: "text-warning",
  export: "text-primary",
  auth: "text-muted-foreground",
};

function ActivityLogsTab() {
  const rows = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = ACTIVITY_ACTIONS[i % ACTIVITY_ACTIONS.length];
        const seed = hash("act" + i);
        return { action: a[0], detail: a[1], kind: a[2], time: ts(i * 37 + (seed % 30)), ip: `10.${seed % 255}.${(seed >> 4) % 255}.${(seed >> 8) % 255}` };
      }),
    []
  );
  return (
    <Panel flush>
      <SectionHeader title="Activity Logs" subtitle="Your recent session activity · last 14 days" className="px-4 pt-3" />
      <div className="max-h-[600px] divide-y divide-border overflow-y-auto">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("font-mono text-[9px] uppercase tracking-wider", KIND_COLOR[r.kind])}>{r.kind}</span>
                <p className="truncate text-[13px] text-foreground">{r.action}</p>
              </div>
              <p className="truncate font-mono text-[10px] text-muted-foreground">{r.detail} · IP {r.ip}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] text-muted-foreground">{timeAgo(r.time)}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{clockTime(r.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RolesTab() {
  return (
    <Panel flush>
      <SectionHeader title="Roles" subtitle={`${ROLES.length} roles · ${ROLES.reduce((s, r) => s + r.users, 0)} provisioned accounts`} className="px-4 pt-3" />
      <div className="divide-y divide-border">
        {ROLES.map((r) => (
          <div key={r.name} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                <p className="text-[13px] font-medium text-foreground">{r.name}</p>
                <span className="rounded-sm border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{r.scope}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{r.desc}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-[14px] font-semibold text-foreground">{r.users}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">users</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PermissionsTab() {
  return (
    <Panel flush>
      <SectionHeader title="Permissions" subtitle={`Effective grants · ${currentOfficer.rank}`} className="px-4 pt-3" />
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-2 font-semibold">Module</th>
            {PERM_ACTIONS.map((a) => (
              <th key={a} className="px-2 py-2 font-semibold">{a}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODULES.map((m) => (
            <tr key={m} className="border-b border-border">
              <td className="px-4 py-2 text-foreground">{m}</td>
              {PERM_MATRIX[m].map((v, i) => (
                <td key={i} className="px-2 py-2">
                  <span className={v ? "font-mono text-[11px] text-success" : "font-mono text-[11px] text-muted-foreground"}>{v ? "● grant" : "○ —"}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-3 text-[11px] text-muted-foreground">Permissions are inherited from assigned roles. Director General holds an unrestricted statewide grant.</p>
    </Panel>
  );
}

const AUDIT_KIND_COLOR: Record<string, string> = {
  config: "text-warning",
  user: "text-primary",
  security: "text-destructive",
  data: "text-success",
};

function AuditHistoryTab() {
  const rows = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const e = AUDIT_EVENTS[i % AUDIT_EVENTS.length];
        const seed = hash("aud" + i);
        const actors = ["SCRB Administrator", "DGP Gowda", "SP Reddy", "IGP Patil", "System"];
        return { title: e[0], detail: e[1], kind: e[2], actor: actors[seed % actors.length], time: ts(i * 220 + (seed % 120)) };
      }),
    []
  );
  return (
    <Panel flush>
      <SectionHeader title="Audit History" subtitle="Immutable platform change log · SCRB tamper-evident" className="px-4 pt-3" />
      <div className="max-h-[600px] divide-y divide-border overflow-y-auto">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("font-mono text-[9px] uppercase tracking-wider", AUDIT_KIND_COLOR[r.kind])}>{r.kind}</span>
                <p className="text-[13px] font-medium text-foreground">{r.title}</p>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{r.detail}</p>
              <p className="font-mono text-[10px] text-muted-foreground">by {r.actor}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] text-muted-foreground">{shortDate(r.time)}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{clockTime(r.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-elevated p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-foreground">{value}</p>
    </div>
  );
}
