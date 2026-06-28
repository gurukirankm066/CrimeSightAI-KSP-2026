import type { CaseRecord } from "@/data/db";
import { shortDate } from "@/lib/format";
import { Panel } from "./Panel";

export function EvidenceCard({ evidence }: { evidence: CaseRecord["evidence"][number] }) {
  return (
    <Panel elevated className="flex items-center gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/12 font-mono text-[10px] font-semibold text-primary">
        {evidence.type.slice(0, 3).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">{evidence.label}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {evidence.id} · collected {shortDate(evidence.collected)}
        </p>
      </div>
      <span className="shrink-0 rounded-sm border border-border bg-panel px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        {evidence.chain}
      </span>
    </Panel>
  );
}
