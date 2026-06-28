import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-3 border-b border-border pb-2", className)}>
      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
