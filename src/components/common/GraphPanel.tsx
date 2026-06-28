import { lazy, Suspense } from "react";
import type { GraphLink, GraphNode } from "@/data/db";
import { ClientOnly } from "./ClientOnly";
import type { GraphInnerProps } from "./GraphInner";

const GraphInner = lazy(() => import("./GraphInner"));

function GraphSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Building relationship graph…
      </span>
    </div>
  );
}

export function GraphPanel(props: {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedId?: string;
  timeline: number;
  onSelect?: (n: GraphNode) => void;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <ClientOnly fallback={<GraphSkeleton />}>
        <Suspense fallback={<GraphSkeleton />}>
          <GraphInner {...(props as GraphInnerProps)} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
