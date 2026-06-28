import { useState } from "react";
import { ChevronDown, TrendingDown } from "lucide-react";
import type { AIRecommendation } from "@/data/db";
import { Panel } from "./Panel";

export function AIRecommendationCard({
  rec,
  onAction,
  compact,
}: {
  rec: AIRecommendation;
  onAction?: (r: AIRecommendation) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Panel elevated className="flex flex-col gap-2 border-l-2 border-l-primary">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[13px] font-semibold leading-snug text-foreground">{rec.title}</h4>
        <span className="shrink-0 rounded-sm bg-primary/12 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
          {rec.confidence}%
        </span>
      </div>
      <p className="text-[12px] leading-relaxed text-muted-foreground">{rec.summary}</p>

      {/* Why this recommendation */}
      <div className="rounded-sm border border-border bg-panel p-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Why this recommendation</span>
        <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">{rec.why}</p>
      </div>

      {!compact && (
        <>
          {/* Evidence used */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Evidence used</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {rec.evidence.map((e, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-sm border border-border bg-panel px-1.5 py-0.5 font-mono text-[10px] text-foreground/80"
                >
                  <span className="text-primary">▪</span>
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* Risk factors */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Risk factors</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {rec.riskFactors.map((r, i) => (
                <span
                  key={i}
                  className="rounded-sm border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* AI reasoning (collapsible) */}
          <div className="rounded-sm border border-border bg-panel">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between px-2 py-1.5 text-left"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                How CrimeSight AI reached this conclusion
              </span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <ul className="space-y-1 border-t border-border px-2 py-2">
                {rec.reasoning.map((step, i) => (
                  <li key={i} className="flex gap-1.5 text-[11px] leading-relaxed text-foreground/80">
                    <span className="font-mono text-primary">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Predicted impact */}
          <div className="flex items-start gap-1.5 rounded-sm border border-success/40 bg-success/10 p-2">
            <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-success">Predicted impact</span>
              <p className="mt-0.5 text-[11px] leading-relaxed text-foreground/80">{rec.predictedImpact}</p>
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => onAction?.(rec)}
        className="mt-0.5 rounded-sm bg-primary px-2.5 py-1.5 text-[12px] font-semibold text-primary-foreground transition hover:opacity-90"
      >
        {rec.action}
      </button>
    </Panel>
  );
}
