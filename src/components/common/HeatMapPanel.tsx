import { lazy, Suspense } from "react";
import type { District, PoliceStation } from "@/data/db";
import { ClientOnly } from "./ClientOnly";
import type { HeatMapInnerProps } from "./HeatMapInner";

const HeatMapInner = lazy(() => import("./HeatMapInner"));

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Initializing geospatial layer…
      </span>
    </div>
  );
}

export function HeatMapPanel(props: {
  districts: District[];
  stations?: PoliceStation[];
  selectedId?: string;
  selectedStationId?: string;
  onSelect?: (d: District) => void;
  onSelectStation?: (s: PoliceStation) => void;
  height?: number | string;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-border bg-background">
      <ClientOnly fallback={<MapSkeleton />}>
        <Suspense fallback={<MapSkeleton />}>
          <HeatMapInner {...(props as HeatMapInnerProps)} />
        </Suspense>
      </ClientOnly>
      <div className="pointer-events-none absolute bottom-2 left-2 z-[400] flex items-center gap-2 rounded-sm border border-border bg-panel/90 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
        <span className="h-2 w-2 rounded-full" style={{ background: "#2dd4de" }} /> low
        <span className="h-2 w-2 rounded-full" style={{ background: "#f5a623" }} /> elevated
        <span className="h-2 w-2 rounded-full" style={{ background: "#e5484d" }} /> critical
      </div>
    </div>
  );
}
