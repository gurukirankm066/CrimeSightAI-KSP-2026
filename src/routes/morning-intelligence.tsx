import { createFileRoute } from "@tanstack/react-router";
import { Download, Sunrise } from "lucide-react";
import { DB } from "@/data/db";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Panel } from "@/components/common/Panel";
import { MetricCard } from "@/components/common/MetricCard";
import { IntelligenceCard } from "@/components/common/IntelligenceCard";
import { SeverityTag } from "@/components/common/SeverityTag";
import { useShell } from "@/components/shell/ShellContext";

export const Route = createFileRoute("/morning-intelligence")({
  head: () => ({
    meta: [
      { title: "Morning Intelligence — CrimeSight AI" },
      { name: "description", content: "Overnight crime briefing for the Karnataka State Police: what happened overnight, crime spikes, emerging trends, district comparison and suggested actions." },
    ],
  }),
  component: MorningIntelligence,
});

function MorningIntelligence() {
  const shell = useShell();
  const spikes = [...DB.districts].filter((d) => d.trend > 0).sort((a, b) => b.trend - a.trend).slice(0, 4);
  const compared = [...DB.districts].sort((a, b) => b.activeCases - a.activeCases);
  const maxCases = compared[0].activeCases;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sunrise className="h-5 w-5 text-warning" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Morning Intelligence</h1>
            <p className="text-xs text-muted-foreground">Briefing for 27 Jun 2026 · Overnight window 00:00–06:00 IST</p>
          </div>
        </div>
        <button
          onClick={() => shell.openAI("Export briefing pack")}
          className="flex items-center gap-2 rounded-sm bg-primary px-3 py-2 text-[12px] font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Download className="h-3.5 w-3.5" /> Export Briefing Pack
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Overnight Incidents" value={41} delta={18} accent />
        <MetricCard label="Spiking Districts" value={spikes.length} delta={12} />
        <MetricCard label="Arrests Logged" value={9} delta={-4} />
        <MetricCard label="Alerts Threshold Breach" value={2} delta={100} />
      </div>

      <div className="mt-3 grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-3">

          <Panel>
            <SectionHeader title="Overnight Summary" right={<span className="font-mono text-[10px] text-muted-foreground">AI narrative · 81% conf</span>} className="mb-2" />
            <p className="text-[13px] leading-relaxed text-foreground/90">
              Between 00:00 and 06:00, <span className="text-foreground">41 incidents</span> were logged statewide, up{" "}
              <span className="text-destructive">18%</span> on the 7-day average. The increase was driven by{" "}
              <span className="text-foreground">vehicle theft</span> and <span className="text-foreground">chain snatching</span>,
              concentrated in Bengaluru East and Hubballi market wards. Cyber fraud held steady. Two districts crossed the alert
              threshold and have been escalated to their respective SPs. No major incidents of violent crime were reported.
            </p>
          </Panel>

          <Panel flush>
            <SectionHeader title="Crime Spikes" subtitle="Districts with the largest overnight increase" className="px-4 pt-3" />
            <div className="divide-y divide-border">
              {spikes.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{d.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{d.activeCases} active cases · index {d.crimeIndex}</p>
                  </div>
                  <span className="font-mono text-[13px] font-semibold text-destructive">▲ {d.trend}%</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel flush>
            <SectionHeader title="District Comparison" subtitle="Active caseload across monitored districts" className="px-4 pt-3" />
            <div className="space-y-2 p-4">
              {compared.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-[12px] text-foreground">{d.name}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-sm bg-elevated">
                    <div className="h-full rounded-sm bg-primary/70" style={{ width: `${(d.activeCases / maxCases) * 100}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-[11px] text-muted-foreground">{d.activeCases}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-1.5rem)]">
          <Panel flush className="shrink-0">
            <SectionHeader title="Emerging Trends" className="px-4 pt-3" />
            <div className="divide-y divide-border">
              {DB.alerts.slice(0, 5).map((a) => (
                <div key={a.id} className="px-4 py-2.5">
                  <SeverityTag severity={a.severity} />
                  <p className="mt-1.5 text-[13px] text-foreground">{a.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{a.district} · {a.source}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div className="flex min-h-0 flex-1 flex-col">
            <SectionHeader title="Suggested Actions" className="mt-1 shrink-0" />
            <div className="mt-3 flex flex-col gap-3 overflow-y-auto pr-0.5 lg:min-h-0 lg:flex-1">
              {DB.recommendations.map((r) => (
                <IntelligenceCard
                  key={r.id}
                  what={r.title}
                  why={r.summary}
                  next={`Confidence ${r.confidence}%. ${r.evidence[0]}.`}
                  action="Investigate"
                  onAction={() => shell.openAI(r.title)}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
