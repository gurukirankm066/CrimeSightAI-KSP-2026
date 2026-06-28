import { useEffect, useMemo, useState } from "react";
import { TrendingUp, ShieldAlert } from "lucide-react";
import { DB } from "@/data/db";
import { cn } from "@/lib/utils";

// Statewide threat hero widget for the Command Center. Deterministic score
// derived from the synthetic district crime indices. Animates the gauge in
// on mount and reports a live "updated Ns ago" stamp.
function computeThreat() {
  const districts = DB.districts;
  const avg = districts.reduce((s, d) => s + d.crimeIndex, 0) / districts.length;
  const trendAvg = districts.reduce((s, d) => s + d.trend, 0) / districts.length;
  const score = Math.min(100, Math.round(avg + districts.filter((d) => d.crimeIndex >= 70).length * 1.2));
  const level = score >= 80 ? "CRITICAL" : score >= 65 ? "HIGH" : score >= 45 ? "ELEVATED" : "GUARDED";
  return { score, level, trend: Math.round(trendAvg) };
}

const LEVEL_TONE: Record<string, string> = {
  CRITICAL: "text-destructive",
  HIGH: "text-warning",
  ELEVATED: "text-warning",
  GUARDED: "text-success",
};
const LEVEL_BAR: Record<string, string> = {
  CRITICAL: "bg-destructive",
  HIGH: "bg-warning",
  ELEVATED: "bg-warning",
  GUARDED: "bg-success",
};

export function ThreatLevelWidget({ className }: { className?: string }) {
  const { score, level, trend } = useMemo(computeThreat, []);
  const [fill, setFill] = useState(0);
  const [updatedAt] = useState(() => Date.now());
  const [, setTick] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFill(score));
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, [score]);

  const updatedSecs = Math.floor((Date.now() - updatedAt) / 1000);
  const tone = LEVEL_TONE[level];

  return (
    <div className={cn("rounded-md border border-border-strong bg-panel p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-sm bg-elevated", tone)}>
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">State Threat Level</p>
            <p className={cn("mt-1 text-2xl font-bold tracking-tight", tone)}>{level}</p>
          </div>
        </div>

        <div className="flex items-end gap-6">
          <div className="leading-none">
            <p className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">Threat Score</p>
            <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground">
              {Math.round(fill)}<span className="text-sm text-muted-foreground"> / 100</span>
            </p>
          </div>
          <div className="leading-none">
            <p className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">7-day Trend</p>
            <p className={cn("mt-1 flex items-center gap-1 font-mono text-xl font-semibold tabular-nums", trend > 0 ? "text-destructive" : "text-success")}>
              <TrendingUp className={cn("h-4 w-4", trend <= 0 && "rotate-180")} />
              {trend > 0 ? "+" : ""}{trend}%
            </p>
          </div>
          <div className="leading-none">
            <p className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">Last Updated</p>
            <p className="mt-1 font-mono text-[12px] text-foreground">{updatedSecs}s ago</p>
          </div>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-elevated">
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none", LEVEL_BAR[level])}
          style={{ width: `${fill}%` }}
        />
      </div>
    </div>
  );
}
