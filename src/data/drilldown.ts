import { DB, stationsForDistrict } from "./db";
import type { AIRecommendation, CaseRecord, District, FIR, Alert, PoliceStation } from "./db";

/** Deterministic string hash (stable across renders). */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface DrillScope {
  district?: District;
  station?: PoliceStation;
}

function stationIndex(station: PoliceStation): number {
  const list = stationsForDistrict(station.districtId);
  return Math.max(0, list.findIndex((s) => s.id === station.id));
}

/** Round-robin distribution of a district's records across its stations. */
function partitionToStation<T extends { id: string }>(records: T[], station: PoliceStation): T[] {
  const list = stationsForDistrict(station.districtId);
  const idx = stationIndex(station);
  const out = records.filter((_, i) => i % list.length === idx);
  return out.length ? out : records.slice(0, 2);
}

export function casesFor(scope: DrillScope): CaseRecord[] {
  if (!scope.district) return DB.cases;
  const inDistrict = DB.cases.filter((c) => c.district === scope.district!.name);
  if (!scope.station) return inDistrict.length ? inDistrict : DB.cases.slice(0, 4);
  const base = inDistrict.length ? inDistrict : DB.cases.slice(0, 6);
  return partitionToStation(base, scope.station);
}

export function firsFor(scope: DrillScope): FIR[] {
  if (!scope.district) return DB.firs;
  const inDistrict = DB.firs.filter((f) => f.district === scope.district!.name);
  if (!scope.station) return inDistrict.length ? inDistrict : DB.firs.slice(0, 6);
  const base = inDistrict.length ? inDistrict : DB.firs.slice(0, 8);
  return partitionToStation(base, scope.station);
}

export function alertsFor(scope: DrillScope): Alert[] {
  if (!scope.district) return DB.alerts;
  const inDistrict = DB.alerts.filter((a) => a.district === scope.district!.name);
  return inDistrict.length ? inDistrict : DB.alerts.slice(0, 3);
}

export interface TrendPoint {
  day: string;
  incidents: number;
}

export function trendFor(scope: DrillScope): TrendPoint[] {
  const key = scope.station?.id ?? scope.district?.id ?? "STATE";
  const base = scope.station?.crimeIndex
    ?? scope.district?.crimeIndex
    ?? Math.round(DB.districts.reduce((s, d) => s + d.activeCases, 0) / 12);
  let s = hash(key) || 7;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1000) / 1000;
  };
  return Array.from({ length: 14 }, (_, i) => {
    const day = new Date(2026, 5, 14 + i);
    const drift = i > 8 ? rand() * base * 0.25 : 0;
    return {
      day: `${day.getDate()}/${day.getMonth() + 1}`,
      incidents: Math.max(2, Math.round(base * 0.35 + rand() * base * 0.5 + drift)),
    };
  });
}

function buildRec(scopeName: string, crimeIndex: number, trend: number, seed: string): AIRecommendation {
  const high = crimeIndex >= 65;
  const focus = trend > 0 ? "rising" : "stabilising";
  return {
    id: `AI-${seed}`,
    title: `${high ? "Surge patrols in" : "Maintain coverage at"} ${scopeName}`,
    summary: `Crime index at ${scopeName} is ${crimeIndex}/100 with an overnight trend of ${trend > 0 ? "+" : ""}${trend}%. Activity is ${focus} relative to the rolling baseline.`,
    confidence: Math.min(95, 60 + Math.round(crimeIndex / 4)),
    evidence: [
      `${Math.max(2, Math.round(crimeIndex / 12))} FIRs in last 6 hrs`,
      `${Math.max(1, Math.round(crimeIndex / 30))} ANPR hits`,
      trend > 0 ? "Recent hotspot" : "Historical crime similarity",
      "Repeat offender detected",
    ],
    action: high ? "Dispatch patrol" : "Schedule beat review",
    why: `${scopeName} is showing a ${focus} pattern with a ${crimeIndex}/100 index. Pre-positioning resources now disrupts the active window before the next likely incident.`,
    riskFactors: [
      ...(trend > 0 ? ["Night Hours", "Recent Hotspot"] : ["High Population Density"]),
      "Transit Hub",
      ...(crimeIndex >= 70 ? ["Repeat Offender"] : []),
    ],
    reasoning: [
      `Local crime index measured at ${crimeIndex}/100 across recent FIRs.`,
      `Overnight trend of ${trend > 0 ? "+" : ""}${trend}% versus the rolling baseline.`,
      `Spatial-temporal clustering matches a known ${focus} signature.`,
      `Forecast model places the next likely incident within this ${scopeName} jurisdiction.`,
    ],
    predictedImpact: `~${high ? 35 : 22}% reduction in ${scopeName} incidents within 72 hours if actioned.`,
  };
}

export function recommendationsFor(scope: DrillScope): AIRecommendation[] {
  if (scope.station) {
    return [buildRec(scope.station.name, scope.station.crimeIndex, scope.station.trend, scope.station.id)];
  }
  if (scope.district) {
    const matched = DB.recommendations.filter((r) => r.title.includes(scope.district!.name) || r.summary.includes(scope.district!.name));
    const generated = buildRec(scope.district.name, scope.district.crimeIndex, scope.district.trend, scope.district.id);
    return [generated, ...matched];
  }
  return DB.recommendations;
}
