import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Panel } from "./Panel";

export function MetricCard({
  label,
  value,
  unit,
  delta,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <Panel className={cn("flex flex-col gap-1", accent && "border-primary/30")}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-2xl font-semibold text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {delta !== undefined && (
        <span
          className={cn(
            "font-mono text-[11px]",
            delta > 0 ? "text-destructive" : delta < 0 ? "text-success" : "text-muted-foreground"
          )}
        >
          {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta)}% overnight
        </span>
      )}
    </Panel>
  );
}
