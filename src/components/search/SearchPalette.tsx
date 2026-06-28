import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { FileText, Car, User, MapPin, Shield, Briefcase, FlaskConical, Clock, Search as SearchIcon, X } from "lucide-react";
import { DB } from "@/data/db";
import { useShell } from "@/components/shell/ShellContext";

const RECENT_KEY = "crimesight.recent-searches";
const RECENT_MAX = 6;

interface RecentEntry {
  label: string;
  meta?: string;
  to: string;
  kind: string;
}

function loadRecent(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentEntry[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(entries: RecentEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(entries.slice(0, RECENT_MAX)));
  } catch {
    /* ignore */
  }
}

export function SearchPalette() {
  const shell = useShell();
  const navigate = useNavigate();
  const [recent, setRecent] = useState<RecentEntry[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        shell.setSearchOpen(!shell.searchOpen);
      }
      if (e.key === "Escape") shell.setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shell]);

  useEffect(() => {
    if (shell.searchOpen) setRecent(loadRecent());
  }, [shell.searchOpen]);

  // Flatten evidence across all cases for searchability.
  const evidence = useMemo(
    () =>
      DB.cases.flatMap((c) =>
        c.evidence.map((e) => ({
          id: e.id,
          label: e.label,
          meta: `${e.type} · ${c.fir} · ${e.chain}`,
        }))
      ),
    []
  );

  if (!shell.searchOpen) return null;

  const go = (entry: RecentEntry) => {
    const next = [entry, ...recent.filter((r) => !(r.label === entry.label && r.to === entry.to))].slice(0, RECENT_MAX);
    setRecent(next);
    saveRecent(next);
    shell.setSearchOpen(false);
    navigate({ to: entry.to });
  };

  const clearRecent = () => {
    setRecent([]);
    saveRecent([]);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-start justify-center bg-background/60 pt-[12vh]" onClick={() => shell.setSearchOpen(false)}>
      <div className="w-full max-w-xl px-4" onClick={(e) => e.stopPropagation()}>
        <Command className="overflow-hidden rounded-md border border-border-strong bg-panel shadow-2xl" loop>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Search FIRs, cases, vehicles, officers, suspects, districts, evidence…"
              className="flex-1 bg-transparent py-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded-sm border border-border bg-elevated px-1 font-mono text-[10px] text-muted-foreground">ESC</kbd>
          </div>
          <Command.List className="max-h-[55vh] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-[13px] text-muted-foreground">No grounded records found.</Command.Empty>

            {recent.length > 0 && (
              <Command.Group
                heading={
                  <span className="flex items-center justify-between">
                    <span>Recent</span>
                    <button onClick={clearRecent} className="flex items-center gap-1 text-[10px] normal-case tracking-normal text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" /> clear
                    </button>
                  </span>
                }
                className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
              >
                {recent.map((r, i) => (
                  <Row key={`recent-${i}`} icon={<Clock className="h-3.5 w-3.5" />} value={`recent ${r.label} ${r.meta ?? ""}`} label={r.label} meta={r.meta} onSelect={() => go(r)} />
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Cases" className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {DB.cases.map((c) => (
                <Row key={c.id} icon={<Briefcase className="h-3.5 w-3.5" />} value={`case ${c.id} ${c.title} ${c.fir} ${c.type} ${c.district}`} label={c.title} meta={`FIR ${c.fir}`} onSelect={() => go({ label: c.title, meta: `FIR ${c.fir}`, to: "/investigation", kind: "case" })} />
              ))}
            </Command.Group>

            <Command.Group heading="FIRs" className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {DB.firs.map((f) => (
                <Row key={f.id} icon={<FileText className="h-3.5 w-3.5" />} value={`fir ${f.number} ${f.type} ${f.district} ${f.station}`} label={`FIR ${f.number}`} meta={`${f.type} · ${f.district}`} onSelect={() => go({ label: `FIR ${f.number}`, meta: `${f.type} · ${f.district}`, to: "/investigation", kind: "fir" })} />
              ))}
            </Command.Group>

            <Command.Group heading="Suspects" className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {DB.suspects.map((s) => (
                <Row key={s.id} icon={<User className="h-3.5 w-3.5" />} value={`suspect ${s.name} ${s.alias} ${s.district} ${s.status}`} label={s.name} meta={`alias "${s.alias}" · risk ${s.riskScore}`} onSelect={() => go({ label: s.name, meta: `alias "${s.alias}" · risk ${s.riskScore}`, to: "/criminal-network", kind: "suspect" })} />
              ))}
            </Command.Group>

            <Command.Group heading="Vehicles" className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {DB.vehicles.map((v) => (
                <Row key={v.id} icon={<Car className="h-3.5 w-3.5" />} value={`vehicle ${v.plate} ${v.model} ${v.color} ${v.flag}`} label={v.plate} meta={`${v.model} · ${v.flag}`} onSelect={() => go({ label: v.plate, meta: `${v.model} · ${v.flag}`, to: "/criminal-network", kind: "vehicle" })} />
              ))}
            </Command.Group>

            <Command.Group heading="Evidence" className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {evidence.map((e) => (
                <Row key={e.id} icon={<FlaskConical className="h-3.5 w-3.5" />} value={`evidence ${e.label} ${e.meta}`} label={e.label} meta={e.meta} onSelect={() => go({ label: e.label, meta: e.meta, to: "/investigation", kind: "evidence" })} />
              ))}
            </Command.Group>

            <Command.Group heading="Districts" className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {DB.districts.map((d) => (
                <Row key={d.id} icon={<MapPin className="h-3.5 w-3.5" />} value={`district ${d.name}`} label={d.name} meta={`crime index ${d.crimeIndex}`} onSelect={() => go({ label: d.name, meta: `crime index ${d.crimeIndex}`, to: "/analytics", kind: "district" })} />
              ))}
            </Command.Group>

            <Command.Group heading="Officers" className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {DB.officers.map((o) => (
                <Row key={o.id} icon={<Shield className="h-3.5 w-3.5" />} value={`officer ${o.name} ${o.badge} ${o.rank} ${o.district}`} label={o.name} meta={`${o.rank} · ${o.badge}`} onSelect={() => go({ label: o.name, meta: `${o.rank} · ${o.badge}`, to: "/profile", kind: "officer" })} />
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function Row({ icon, label, meta, value, onSelect }: { icon: React.ReactNode; label: string; meta?: string; value: string; onSelect: () => void }) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] text-foreground aria-selected:bg-elevated"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {meta && <span className="truncate font-mono text-[10px] text-muted-foreground">{meta}</span>}
    </Command.Item>
  );
}
