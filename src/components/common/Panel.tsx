import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  elevated,
  flush,
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  flush?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border",
        elevated ? "bg-elevated" : "bg-panel",
        !flush && "p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
