import type { Severity } from "@/data/db";
import { severityMeta } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SeverityTag({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {

  const m = severityMeta[severity] ?? severityMeta.low;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider",
        m.bg,
        m.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}