interface TimelineItem {
  time: string;
  label: string;
  actor?: string;
}

import { clockTime, shortDate } from "@/lib/format";

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative ml-2 border-l border-border-strong">
      {items.map((it, i) => (
        <li key={i} className="relative pb-4 pl-5 last:pb-0">
          <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[13px] font-medium text-foreground">{it.label}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {shortDate(it.time)} · {clockTime(it.time)}
            </span>
          </div>
          {it.actor && <span className="text-[11px] text-muted-foreground">by {it.actor}</span>}
        </li>
      ))}
    </ol>
  );
}
