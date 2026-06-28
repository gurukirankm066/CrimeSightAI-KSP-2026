import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronRight } from "lucide-react";
import { DB, type District } from "@/data/db";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Panel } from "@/components/common/Panel";
import { HeatMapPanel } from "@/components/common/HeatMapPanel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Crime Analytics — CrimeSight AI" },
      { name: "description", content: "Geospatial crime analytics for the Karnataka State Police: drill-down map, crime trends, time-of-day heat, forecasting and district comparison." },
    ],
  }),
  component: CrimeAnalytics,
});

type Level = "state" | "district" | "station";

const TREND_COLORS = ["#2dd4de", "#f5a623", "#3dd68c", "#e5484d"];

function CrimeAnalytics() {
  const [district, setDistrict] = useState<District | undefined>(undefined);
  const level: Level = district ? "district" : "state";
  const trendKeys = useMemo(() => DB.districts.slice(0, 4).map((d) => d.name), []);
  const maxHour = Math.max(...DB.hourlyHeat.map((h) => h.value));

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Crime Analytics</h1>
          <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <button onClick={() => setDistrict(undefined)} className={cn(level === "state" ? "text-primary" : "hover:text-foreground")}>Karnataka State</button>
            {district && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-primary">{district.name}</span>
                <ChevronRight className="h-3 w-3" />
                <span>{district.name} City PS</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[1.4fr_1fr]">
        {/* Map — primary emphasis */}
        <Panel flush className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <SectionHeader title="Geospatial Crime Distribution" subtitle="Click a district to drill down" className="border-0 pb-0" />
          </div>
          <div className="min-h-[560px] flex-1">
            <HeatMapPanel districts={DB.districts} selectedId={district?.id} onSelect={setDistrict} />
          </div>
        </Panel>


        {/* Charts — secondary */}
        <div className="flex flex-col gap-3">
          <Panel>
            <SectionHeader title="Crime Trends" subtitle="14-day incident counts · top 4 districts (annotates map hotspots)" className="mb-2" />
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={DB.trendSeries} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#232833" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#232833" }} />
                <YAxis tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#161a21", border: "1px solid #232833", fontSize: 11 }} />
                {trendKeys.map((k, i) => (
                  <Line key={k} type="monotone" dataKey={k} stroke={TREND_COLORS[i]} strokeWidth={1.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel>
            <SectionHeader title="Forecast" subtitle="Actual vs predicted incidents (next 7 days projected)" className="mb-2" />
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={DB.forecastSeries} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#232833" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#232833" }} />
                <YAxis tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#161a21", border: "1px solid #232833", fontSize: 11 }} />
                <Area type="monotone" dataKey="actual" stroke="#2dd4de" fill="#2dd4de22" strokeWidth={1.5} />
                <Area type="monotone" dataKey="predicted" stroke="#f5a623" fill="#f5a62318" strokeWidth={1.5} strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <Panel>
            <SectionHeader title="District Comparison" subtitle="Crime index by district" className="mb-2" />
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={DB.districts} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#232833" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#8a93a3", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "#232833" }} interval={0} angle={-20} textAnchor="end" height={42} />
                <YAxis tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#161a21", border: "1px solid #232833", fontSize: 11 }} cursor={{ fill: "#161a2155" }} />
                <Bar dataKey="crimeIndex" fill="#2dd4de" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </div>

      {/* Time-of-day heat */}
      <Panel className="mt-3">
        <SectionHeader title="Time-of-Day Crime Heat" subtitle="Incident intensity by hour (annotates night-hour concentration on map)" className="mb-2" />
        <div className="flex items-end gap-1">
          {DB.hourlyHeat.map((h) => (
            <div key={h.hour} className="group flex flex-1 flex-col items-center gap-1">
              <div className="relative w-full">
                <div
                  className="w-full rounded-sm"
                  style={{ height: `${(h.value / maxHour) * 80 + 6}px`, background: h.value > maxHour * 0.7 ? "#e5484d" : h.value > maxHour * 0.45 ? "#f5a623" : "#2dd4de", opacity: 0.85 }}
                />
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">{h.hour}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Extended analytics grid */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Panel>
          <SectionHeader title="Crime Type Distribution" subtitle="Incidents by category (12 months)" className="mb-2" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DB.crimeTypeDistribution} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="#232833" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="type" tick={{ fill: "#8a93a3", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "#232833" }} width={92} />
              <Tooltip contentStyle={{ background: "#161a21", border: "1px solid #232833", fontSize: 11 }} cursor={{ fill: "#161a2155" }} />
              <Bar dataKey="value" fill="#2dd4de" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <SectionHeader title="Monthly Crime Trend" subtitle="Incidents vs resolved (rolling 12 months)" className="mb-2" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={DB.monthlyTrend} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#232833" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#232833" }} />
              <YAxis tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#161a21", border: "1px solid #232833", fontSize: 11 }} />
              <Line type="monotone" dataKey="incidents" stroke="#2dd4de" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="resolved" stroke="#3dd68c" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <SectionHeader title="Weapon Usage" subtitle="Weapon type across reported incidents" className="mb-2" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DB.weaponUsage} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="#232833" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="weapon" tick={{ fill: "#8a93a3", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "#232833" }} width={104} />
              <Tooltip contentStyle={{ background: "#161a21", border: "1px solid #232833", fontSize: 11 }} cursor={{ fill: "#161a2155" }} />
              <Bar dataKey="value" fill="#f5a623" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <SectionHeader title="Victim Age Distribution" subtitle="Victims grouped by age band" className="mb-2" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DB.victimAgeDistribution} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#232833" vertical={false} />
              <XAxis dataKey="band" tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#232833" }} />
              <YAxis tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#161a21", border: "1px solid #232833", fontSize: 11 }} cursor={{ fill: "#161a2155" }} />
              <Bar dataKey="value" fill="#2dd4de" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <SectionHeader title="Crime by Weekday" subtitle="Incident distribution across the week" className="mb-2" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DB.crimeByWeekday} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#232833" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#232833" }} />
              <YAxis tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#161a21", border: "1px solid #232833", fontSize: 11 }} />
              <Area type="monotone" dataKey="value" stroke="#3dd68c" fill="#3dd68c22" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <SectionHeader title="Repeat Crime Frequency" subtitle="Offence count per offender" className="mb-2" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DB.repeatCrimeFrequency} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#232833" vertical={false} />
              <XAxis dataKey="band" tick={{ fill: "#8a93a3", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "#232833" }} interval={0} angle={-15} textAnchor="end" height={40} />
              <YAxis tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#161a21", border: "1px solid #232833", fontSize: 11 }} cursor={{ fill: "#161a2155" }} />
              <Bar dataKey="value" fill="#f5a623" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel className="md:col-span-2">
          <SectionHeader title="Top 10 Police Stations" subtitle="By active caseload" className="mb-2" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={DB.topStations} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="#232833" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#8a93a3", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#8a93a3", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "#232833" }} width={150} />
              <Tooltip contentStyle={{ background: "#161a21", border: "1px solid #232833", fontSize: 11 }} cursor={{ fill: "#161a2155" }} />
              <Bar dataKey="value" fill="#2dd4de" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <SectionHeader title="Crime Severity Distribution" subtitle="Incidents by severity level" className="mb-2" />
          <div className="space-y-2.5 pt-1">
            {(() => {
              const total = DB.severityDistribution.reduce((s, d) => s + d.value, 0);
              const colors: Record<string, string> = { critical: "#e5484d", high: "#f5a623", medium: "#2dd4de", low: "#3dd68c" };
              return DB.severityDistribution.map((d) => {
                const pct = Math.round((d.value / total) * 100);
                return (
                  <div key={d.severity}>
                    <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
                      <span className="capitalize text-foreground">{d.severity}</span>
                      <span className="text-muted-foreground">{d.value} · {pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-sm bg-secondary">
                      <div className="h-full rounded-sm" style={{ width: `${pct}%`, background: colors[d.severity] }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </Panel>
      </div>
    </div>
  );
}

