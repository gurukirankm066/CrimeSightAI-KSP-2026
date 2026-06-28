import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function istNow(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

export function SystemStatus({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);
  const [syncedAt] = useState(Date.now());

  useEffect(() => {
    setMounted(true);

    const t = setInterval(() => {
      setTick((v) => v + 1);
    }, 1000);

    return () => clearInterval(t);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("hidden items-center gap-3 xl:flex", className)}>
        <span className="font-mono text-[12px] text-muted-foreground">
          Loading...
        </span>
      </div>
    );
  }

  const d = istNow();

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");

  const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

  const syncedSecs = Math.floor((Date.now() - syncedAt) / 1000) % 60;

  return (
    <div
      className={cn("hidden items-center gap-3 xl:flex", className)}
      title="Live system status"
    >
      <div className="flex flex-col items-end leading-none">
        <span className="font-mono text-[12px] font-semibold tabular-nums text-foreground">
          {hh}:{mm}
          <span className="text-muted-foreground">:{ss}</span>
          <span className="text-[10px] text-muted-foreground"> IST</span>
        </span>

        <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
          {dateStr}
        </span>
      </div>

      <div className="h-7 w-px bg-border" />

      <div className="flex flex-col items-start leading-none">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-success">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>

          System Healthy
        </span>

        <span className="font-mono text-[9px] tracking-wide text-muted-foreground">
          Synced {syncedSecs}s ago
        </span>
      </div>
    </div>
  );
}