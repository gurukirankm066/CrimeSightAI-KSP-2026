import type { Officer } from "@/data/db";
import { cn } from "@/lib/utils";

export function OfficerCard({ officer, className }: { officer: Officer; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm font-mono text-xs font-semibold text-background"
        style={{ background: `hsl(${officer.avatarHue} 55% 55%)` }}
      >
        {officer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-foreground">{officer.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {officer.rank} · <span className="font-mono">{officer.badge}</span>
        </p>
      </div>
    </div>
  );
}
