import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { GraphLink, GraphNode } from "@/data/db";

const KIND_COLOR: Record<GraphNode["kind"], string> = {
  person: "#2dd4de",
  vehicle: "#f5a623",
  location: "#3dd68c",
  fir: "#9aa5b5",
};

export interface GraphInnerProps {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedId?: string;
  timeline: number; // 0-100, show edges with appears <= timeline
  onSelect?: (n: GraphNode) => void;
}

export default function GraphInner({ nodes, links, selectedId, timeline, onSelect }: GraphInnerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 400 });

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => {
    const visibleLinks = links.filter((l) => l.appears <= timeline);
    return {
      nodes: nodes.map((n) => ({ ...n })),
      links: visibleLinks.map((l) => ({ ...l })),
    };
  }, [nodes, links, timeline]);

  const neighborIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const set = new Set<string>([selectedId]);
    data.links.forEach((l) => {
      const s = typeof l.source === "object" ? (l.source as GraphNode).id : (l.source as string);
      const t = typeof l.target === "object" ? (l.target as GraphNode).id : (l.target as string);
      if (s === selectedId) set.add(t);
      if (t === selectedId) set.add(s);
    });
    return set;
  }, [selectedId, data.links]);

  return (
    <div ref={wrapRef} className="h-full w-full">
      <ForceGraph2D
        width={size.w}
        height={size.h}
        graphData={data}
        backgroundColor="#0b0d10"
        nodeRelSize={5}
        linkColor={(l) => {
          const s = typeof l.source === "object" ? (l.source as GraphNode).id : (l.source as string);
          const t = typeof l.target === "object" ? (l.target as GraphNode).id : (l.target as string);
          if (selectedId && (s === selectedId || t === selectedId)) return "#2dd4de";
          return "#2a3038";
        }}
        linkWidth={(l) => Math.max(0.5, ((l as GraphLink).weight || 1) * 0.7)}
        linkDirectionalParticles={0}
        onNodeClick={(n) => onSelect?.(n as unknown as GraphNode)}
        nodeCanvasObject={(node, ctx, scale) => {
          const n = node as unknown as GraphNode & { x: number; y: number };
          const dim = selectedId ? !neighborIds.has(n.id) : false;
          const base = 4 + (n.risk / 100) * 5;
          ctx.globalAlpha = dim ? 0.25 : 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, base, 0, 2 * Math.PI);
          ctx.fillStyle = KIND_COLOR[n.kind];
          ctx.fill();
          if (n.id === selectedId || n.pinned) {
            ctx.lineWidth = 1.5 / scale;
            ctx.strokeStyle = n.id === selectedId ? "#e6eaf0" : "#f5a623";
            ctx.stroke();
          }
          if (scale > 1.3 || n.id === selectedId) {
            ctx.font = `${10 / scale}px 'IBM Plex Mono', monospace`;
            ctx.fillStyle = "#8a93a3";
            ctx.textAlign = "center";
            ctx.fillText(n.label, n.x, n.y + base + 8 / scale);
          }
          ctx.globalAlpha = 1;
        }}
      />
    </div>
  );
}
