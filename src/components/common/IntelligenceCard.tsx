import type { ReactNode } from "react";
import { Panel } from "./Panel";

export function IntelligenceCard({
  what,
  why,
  next,
  action,
  onAction,
  footer,
}: {
  what: string;
  why?: string;
  next?: string;
  action?: string;
  onAction?: () => void;
  footer?: ReactNode;
}) {
  return (
    <Panel className="flex flex-col gap-2.5">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">What happened</span>
        <p className="mt-0.5 text-[13px] font-medium leading-snug text-foreground">{what}</p>
      </div>
      {why && (
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Why it matters</span>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{why}</p>
        </div>
      )}
      {next && (
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">What to do next</span>
          <p className="mt-0.5 text-[12px] leading-relaxed text-foreground/90">{next}</p>
        </div>
      )}
      {footer}
      {action && (
        <button
          onClick={onAction}
          className="mt-0.5 self-start rounded-sm border border-primary/40 bg-primary/10 px-3 py-1.5 text-[12px] font-semibold text-primary transition hover:bg-primary/20"
        >
          {action} →
        </button>
      )}
    </Panel>
  );
}
