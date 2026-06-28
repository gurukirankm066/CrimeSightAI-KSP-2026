import type { District } from "./db";

export interface MapLayerDef {
  id: string;
  label: string;
  color: string;
  /** 0-100 intensity for a district. */
  value: (d: District) => number;
  /** Human-readable unit suffix for tooltips/legend. */
  unit: string;
}

/** Deterministic 0-100 hash so mock layer values stay stable per district. */
function seeded(seed: string, min = 0, max = 100): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const norm = (h >>> 0) / 4294967295;
  return Math.round(min + norm * (max - min));
}

/** All toggleable map layers. "hotspots" is the existing crime overlay. */
export const MAP_LAYERS: MapLayerDef[] = [
  {
    id: "hotspots",
    label: "Crime Hotspots",
    color: "#e5484d",
    unit: "index",
    value: (d) => d.crimeIndex,
  },
  {
    id: "population",
    label: "Population Density",
    color: "#f5a623",
    unit: "/km²",
    value: (d) => Math.min(100, Math.round(d.population / 90000)),
  },
  {
    id: "urbanization",
    label: "Urbanization",
    color: "#8b5cf6",
    unit: "%",
    value: (d) => seeded(d.id + "urb", 28, 96),
  },
  {
    id: "literacy",
    label: "Literacy",
    color: "#2dd4de",
    unit: "%",
    value: (d) => seeded(d.id + "lit", 62, 97),
  },
  {
    id: "income",
    label: "Income Index",
    color: "#22c55e",
    unit: "pts",
    value: (d) => seeded(d.id + "inc", 35, 92),
  },
  {
    id: "cctv",
    label: "CCTV Coverage",
    color: "#3aa0c4",
    unit: "%",
    value: (d) => seeded(d.id + "cctv", 18, 88),
  },
];

export const DEFAULT_LAYERS = new Set<string>(["hotspots"]);
