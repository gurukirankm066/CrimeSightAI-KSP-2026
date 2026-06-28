import type { Alert } from "@/data/db";
import { timeAgo } from "@/lib/format";
import { SeverityTag } from "./SeverityTag";

export function AlertFeed({ alerts, onAction }: { alerts: Alert[]; onAction?: (a: Alert) => void }) {
  return (
    <div className="divide-y divide-border">
      {alerts.map((a) => (
        <div key={a.id} className="group px-3 py-2.5 transition-colors hover:bg-elevated">
          <div className="flex items-center justify-between gap-2">
            <SeverityTag severity={a.severity} />
            <span className="font-mono text-[10px] text-muted-foreground">{timeAgo(a.timestamp)}</span>
          </div>
          <p className="mt-1.5 text-[13px] font-medium leading-snug text-foreground">{a.title}</p>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="text-primary">{a.district}</span>
            <span className="text-border-strong">·</span>
            <span className="font-mono">{a.source}</span>
          </div>
          <button
            onClick={() => onAction?.(a)}
            className="mt-2 w-full rounded-sm border border-border bg-elevated px-2 py-1 text-[11px] font-medium text-foreground opacity-80 transition hover:border-primary/50 hover:text-primary group-hover:opacity-100"
          >
            {a.action} →
          </button>
        </div>
      ))}
    </div>
  );
}
