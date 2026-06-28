import { cn } from "@/lib/utils";

export function LiveBadge({ label = "LIVE", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-success", className)}>
      <span className="live-pulse h-1.5 w-1.5 rounded-full bg-success" />
      {label}
    </span>
  );
}
