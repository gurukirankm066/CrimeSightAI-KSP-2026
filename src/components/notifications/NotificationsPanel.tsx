import { useState } from "react";
import { Car, User, ScanLine, Map, BadgeCheck, FileText, Sparkles, TrendingUp, X, Check, CheckCheck, Trash2, type LucideIcon } from "lucide-react";
import { timeAgo } from "@/lib/format";
import { SeverityTag } from "@/components/common/SeverityTag";
import { useShell } from "@/components/shell/ShellContext";
import { KIND_META, type Notification } from "@/data/notifications";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  car: Car,
  user: User,
  scan: ScanLine,
  map: Map,
  badge: BadgeCheck,
  file: FileText,
  sparkles: Sparkles,
  trend: TrendingUp,
};

type FilterKey = "all" | "critical" | "assigned" | "ai";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "assigned", label: "Assigned" },
  { key: "ai", label: "AI" },
];

function matches(n: Notification, f: FilterKey): boolean {
  if (f === "all") return true;
  if (f === "critical") return n.severity === "critical";
  if (f === "assigned") return n.kind === "assignment";
  if (f === "ai") return n.kind === "ai";
  return true;
}

export function NotificationsPanel() {
  const shell = useShell();
  const [filter, setFilter] = useState<FilterKey>("all");

  if (!shell.notifOpen) return null;

  const items = shell.notifications.filter((n) => matches(n, filter));

  return (
    <div className="fixed inset-0 z-[1150]" onClick={() => shell.setNotifOpen(false)}>
      <div
        className="absolute right-3 top-14 w-[400px] animate-slide-in-right overflow-hidden rounded-md border border-border-strong bg-panel shadow-2xl motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Notification Center</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {shell.unread} unread · {shell.notifications.length} active
              </p>
            </div>
          </div>
          <button onClick={() => shell.setNotifOpen(false)} className="text-muted-foreground transition hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex items-center justify-between gap-1 border-b border-border px-2.5 py-2">
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors",
                  filter === f.key ? "bg-primary/15 text-primary" : "bg-elevated text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={shell.markAllRead}
              className="flex items-center gap-1 rounded-sm px-1.5 py-1 font-mono text-[10px] text-muted-foreground transition hover:text-primary"
              title="Mark all read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={shell.clearAll}
              className="flex items-center gap-1 rounded-sm px-1.5 py-1 font-mono text-[10px] text-muted-foreground transition hover:text-destructive"
              title="Clear all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="max-h-[64vh] divide-y divide-border overflow-y-auto">
          {items.length === 0 && (
            <p className="px-3 py-8 text-center text-[12px] text-muted-foreground">No notifications in this category.</p>
          )}
          {items.map((n) => {
            const Icon = ICONS[n.icon] ?? FileText;
            const read = shell.isRead(n.id);
            return (
              <div key={n.id} className={cn("group flex gap-3 px-3 py-2.5 transition-colors hover:bg-elevated", !read && "bg-primary/[0.04]")}>
                <span className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-elevated text-primary">
                  <Icon className="h-3.5 w-3.5" />
                  {!read && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-panel" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-[13px]", read ? "font-medium text-muted-foreground" : "font-semibold text-foreground")}>{n.title}</p>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{timeAgo(n.time)}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{n.body}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <SeverityTag severity={n.severity} />
                      <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">{KIND_META[n.kind].label}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      {!read && (
                        <button
                          onClick={() => shell.markRead(n.id)}
                          className="flex items-center gap-1 rounded-sm bg-elevated px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground transition hover:text-primary"
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" /> Read
                        </button>
                      )}
                      <button
                        onClick={() => shell.clear(n.id)}
                        className="flex items-center gap-1 rounded-sm bg-elevated px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground transition hover:text-destructive"
                        title="Clear"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
