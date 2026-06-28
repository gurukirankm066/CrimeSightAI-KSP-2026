import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, AlertTriangle, ChevronRight, FileWarning, Gauge, MapPin, Building2, ArrowLeft } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from "recharts";
import { DB, stationsForDistrict } from "@/data/db";
import type { District, PoliceStation } from "@/data/db";
import { casesFor, firsFor, alertsFor, trendFor, recommendationsFor } from "@/data/drilldown";
import { timeAgo } from "@/lib/format";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Panel } from "@/components/common/Panel";
import { MetricCard } from "@/components/common/MetricCard";
import { AlertFeed } from "@/components/common/AlertFeed";
import { AIRecommendationCard } from "@/components/common/AIRecommendationCard";
import { SeverityTag } from "@/components/common/SeverityTag";
import { LiveBadge } from "@/components/common/LiveBadge";
import { HeatMapPanel } from "@/components/common/HeatMapPanel";
import { ThreatLevelWidget } from "@/components/common/ThreatLevelWidget";
import { useShell } from "@/components/shell/ShellContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — CrimeSight AI" },
      { name: "description", content: "Statewide live crime command center for the Karnataka State Police: priority intelligence, geospatial heatmap, live alerts and AI recommendations." },
    ],
  }),
  component: CommandCenter,
});

function CommandCenter() {
  const shell = useShell();
  const navigate = useNavigate();
  const [district, setDistrict] = useState<District | undefined>(undefined);
  const [station, setStation] = useState<PoliceStation | undefined>(undefined);

  const scope = { district, station };
  const stations = useMemo(() => (district ? stationsForDistrict(district.id) : []), [district]);

  const cases = useMemo(() => casesFor(scope), [district, station]);
  const firs = useMemo(() => firsFor(scope), [district, station]);
  const alerts = useMemo(() => alertsFor(scope), [district, station]);
  const trend = useMemo(() => trendFor(scope), [district, station]);
  const recs = useMemo(() => recommendationsFor(scope), [district, station]);

  const scopeActiveCases = station ? station.activeCases : district ? district.activeCases : DB.districts.reduce((s, d) => s + d.activeCases, 0);
  const scopeIndex = station ? station.crimeIndex : district ? district.crimeIndex : Math.round(DB.districts.reduce((s, d) => s + d.crimeIndex, 0) / DB.districts.length);
  const scopeTrend = station ? station.trend : district ? district.trend : 8;
  const critical = alerts.filter((a) => a.severity === "critical").length;

  function selectDistrict(d: District) {
    setDistrict(d);
    setStation(undefined);
  }
  function resetState() {
    setDistrict(undefined);
    setStation(undefined);
  }

  const subtitle = station ? `Police Station view · ${station.name}` : district ? `District view · ${district.name}` : "Click a district to focus";

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Command Center</h1>
          {/* Breadcrumb */}
          <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <button onClick={resetState} className={`transition hover:text-foreground ${!district ? "text-foreground" : ""}`}>Karnataka</button>
            {district && (
              <>
                <ChevronRight className="h-3 w-3" />
                <button onClick={() => setStation(undefined)} className={`transition hover:text-foreground ${district && !station ? "text-foreground" : ""}`}>{district.name}</button>
              </>
            )}
            {station && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{station.name}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {district && (
            <button onClick={resetState} className="flex items-center gap-1.5 rounded-sm border border-border bg-panel px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-elevated">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to State
            </button>
          )}
          <LiveBadge label="LIVE FEED" />
        </div>
      </div>

      {!district && <ThreatLevelWidget className="mb-3" />}

      {/* Priority intelligence strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Active Cases" value={scopeActiveCases.toLocaleString()} delta={scopeTrend} icon={<FileWarning className="h-4 w-4" />} accent />
        <MetricCard label="Critical Alerts" value={critical} delta={14} icon={<AlertTriangle className="h-4 w-4" />} />
        <MetricCard label={station ? "Station Crime Index" : district ? "District Crime Index" : "State Crime Index"} value={scopeIndex} unit="/100" delta={scopeTrend} icon={<Gauge className="h-4 w-4" />} />
        <MetricCard label="Live Incidents (24h)" value={alerts.length} delta={-6} icon={<Activity className="h-4 w-4" />} />
      </div>

      <div className="mt-3 grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_360px]">
        {/* Map */}
        <div className="flex flex-col gap-3">
          <Panel flush className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <SectionHeader title="Karnataka Crime Heatmap" subtitle={subtitle} className="border-0 pb-0" />
              <LiveBadge />
            </div>
            <div className="h-[440px]">
              <HeatMapPanel
                districts={DB.districts}
                stations={stations}
                selectedId={district?.id}
                selectedStationId={station?.id}
                onSelect={selectDistrict}
                onSelectStation={setStation}
              />
            </div>
          </Panel>

          {/* Bottom row */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Context list: districts -> stations */}
            <Panel flush>
              <SectionHeader title={district ? "Police Stations" : "Emerging Hotspots"} className="px-3 pt-3" />
              <div className="max-h-[210px] divide-y divide-border overflow-y-auto">
                {district
                  ? stations.map((s) => (
                      <button key={s.id} onClick={() => setStation(s)} className={`flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-elevated ${station?.id === s.id ? "bg-elevated" : ""}`}>
                        <span className="flex items-center gap-2 text-[13px] text-foreground">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                          {s.name.replace(" Police Station", "")}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground">{s.crimeIndex}</span>
                          <span className={s.trend > 0 ? "font-mono text-[11px] text-destructive" : "font-mono text-[11px] text-success"}>{s.trend > 0 ? "▲" : "▼"}{Math.abs(s.trend)}%</span>
                        </span>
                      </button>
                    ))
                  : [...DB.districts].sort((a, b) => b.crimeIndex - a.crimeIndex).slice(0, 6).map((d) => (
                      <button key={d.id} onClick={() => selectDistrict(d)} className="flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-elevated">
                        <span className="flex items-center gap-2 text-[13px] text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {d.name}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground">{d.crimeIndex}</span>
                          <span className={d.trend > 0 ? "font-mono text-[11px] text-destructive" : "font-mono text-[11px] text-success"}>{d.trend > 0 ? "▲" : "▼"}{Math.abs(d.trend)}%</span>
                        </span>
                      </button>
                    ))}
              </div>
            </Panel>

            {/* Crime trends */}
            <Panel flush className="overflow-hidden">
              <SectionHeader title="Crime Trend (14d)" subtitle={station ? station.name.replace(" Police Station", "") : district ? district.name : "Statewide"} className="px-3 pt-3" />
              <div className="h-[170px] px-1 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2dd4de" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#2dd4de" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1c222b" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 9 }} tickLine={false} axisLine={false} width={28} />
                    <RTooltip contentStyle={{ background: "#11151b", border: "1px solid #2f3744", fontSize: 11 }} labelStyle={{ color: "#e6eaf0" }} />
                    <Area type="monotone" dataKey="incidents" stroke="#2dd4de" strokeWidth={2} fill="url(#trendFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Recent crime activity */}
            <Panel flush>
              <SectionHeader title="Recent Crime Activity" className="px-3 pt-3" />
              <div className="max-h-[210px] divide-y divide-border overflow-y-auto">
                {firs.slice(0, 8).map((f) => (
                  <div key={f.id} className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-foreground">{f.type}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{timeAgo(f.date)}</span>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">FIR {f.number} · {f.district}</p>
                  </div>
                ))}
                {firs.length === 0 && <p className="px-3 py-4 text-center text-[12px] text-muted-foreground">No recent activity in scope.</p>}
              </div>
            </Panel>
          </div>

          {/* Investigation list */}
          <Panel flush>
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <SectionHeader title="Active Investigations" subtitle={`${cases.length} cases in scope`} className="border-0 pb-0" />
              <button onClick={() => navigate({ to: "/investigation" })} className="text-[11px] font-medium text-primary transition hover:underline">Open Investigation Hub →</button>
            </div>
            <div className="max-h-[260px] overflow-y-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-1.5 font-normal">Case</th>
                    <th className="px-3 py-1.5 font-normal">Type</th>
                    <th className="px-3 py-1.5 font-normal">Station</th>
                    <th className="px-3 py-1.5 font-normal">Priority</th>
                    <th className="px-3 py-1.5 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.slice(0, 8).map((c) => (
                    <tr key={c.id} className="cursor-pointer border-b border-border/60 transition hover:bg-elevated" onClick={() => navigate({ to: "/investigation" })}>
                      <td className="px-3 py-2 font-mono text-[11px] text-foreground">{c.fir}</td>
                      <td className="px-3 py-2 text-[12px] text-foreground">{c.type}</td>
                      <td className="px-3 py-2 text-[12px] text-muted-foreground">{station ? station.name.replace(" Police Station", "") : c.station}</td>
                      <td className="px-3 py-2"><SeverityTag severity={c.priority} /></td>
                      <td className="px-3 py-2 font-mono text-[11px] capitalize text-muted-foreground">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-1.5rem)]">
          <Panel flush className="shrink-0">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <SectionHeader title="Live Intelligence Alerts" className="border-0 pb-0" />
              <LiveBadge />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <AlertFeed alerts={alerts.slice(0, 6)} onAction={(a) => shell.openAI(`Tell me about ${a.district}`)} />
            </div>
          </Panel>

          <div className="flex min-h-0 flex-1 flex-col">
            <SectionHeader title="AI Recommendations" className="mb-2 shrink-0" right={<span className="font-mono text-[10px] text-muted-foreground">CrimeSight AI</span>} />
            <div className="flex flex-col gap-2.5 overflow-y-auto pr-0.5 lg:min-h-0 lg:flex-1">
              {recs.map((r) => (
                <AIRecommendationCard key={r.id} rec={r} onAction={() => shell.openAI(r.title)} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
