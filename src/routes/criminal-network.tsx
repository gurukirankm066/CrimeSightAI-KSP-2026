import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DB, type GraphNode } from "@/data/db";
import { GraphPanel } from "@/components/common/GraphPanel";
import { CriminalDossier } from "@/components/common/CriminalDossier";
import { useShell } from "@/components/shell/ShellContext";

export const Route = createFileRoute("/criminal-network")({
  head: () => ({
    meta: [
      { title: "Criminal Network — CrimeSight AI" },
      { name: "description", content: "Force-directed criminal relationship graph for the Karnataka State Police: persons, vehicles, locations and FIRs with risk scoring, timeline replay and suspect dossiers." },
    ],
  }),
  component: CriminalNetwork,
});

const KIND_LABEL: Record<GraphNode["kind"], string> = {
  person: "Person",
  vehicle: "Vehicle",
  location: "Location",
  fir: "FIR",
};
const KIND_COLOR: Record<GraphNode["kind"], string> = {
  person: "#2dd4de",
  vehicle: "#f5a623",
  location: "#3dd68c",
  fir: "#9aa5b5",
};

function CriminalNetwork() {
  const shell = useShell();
  const [selected, setSelected] = useState<GraphNode | undefined>(DB.nodes.find((n) => n.pinned));
  const [timeline, setTimeline] = useState(100);

  const associates = useMemo(() => {
    if (!selected) return [];
    const ids = new Set<string>();
    DB.links.forEach((l) => {
      const s = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
      const t = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
      if (s === selected.id) ids.add(t);
      if (t === selected.id) ids.add(s);
    });
    return DB.nodes.filter((n) => ids.has(n.id));
  }, [selected]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-foreground">Criminal Network Analysis</h1>
          <p className="font-mono text-[10px] text-muted-foreground">
            {DB.nodes.length} nodes · {DB.links.filter((l) => l.appears <= timeline).length} active links
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[10px] font-mono">
            {(Object.keys(KIND_LABEL) as GraphNode["kind"][]).map((k) => (
              <span key={k} className="flex items-center gap-1 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: KIND_COLOR[k] }} /> {KIND_LABEL[k]}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Timeline</span>
            <input type="range" min={0} max={100} value={timeline} onChange={(e) => setTimeline(+e.target.value)} className="w-40 accent-primary" />
            <span className="w-8 font-mono text-[10px] text-primary">{timeline}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <GraphPanel nodes={DB.nodes} links={DB.links} selectedId={selected?.id} timeline={timeline} onSelect={setSelected} />
          <div className="pointer-events-none absolute left-3 top-3 rounded-sm border border-border bg-panel/90 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
            Drag to pan · scroll to zoom · click a node for dossier
          </div>
        </div>

        {/* Dossier */}
        <aside className="w-[340px] shrink-0 overflow-y-auto border-l border-border bg-panel">
          {selected ? (
            <CriminalDossier
              selected={selected}
              neighbors={associates}
              links={DB.links}
              onSelectEntity={setSelected}
              openAI={shell.openAI}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-[12px] text-muted-foreground">
              Select a node to open its dossier.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
