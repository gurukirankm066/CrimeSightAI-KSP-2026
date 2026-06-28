import type { Severity } from "@/data/db";

export function timeAgo(iso: string): string {
  const diff = Date.now() - +new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export const severityMeta: Record<Severity, { label: string; text: string; bg: string; dot: string }> = {
  critical: { label: "CRITICAL", text: "text-destructive", bg: "bg-destructive/12 border-destructive/40", dot: "bg-destructive" },
  high: { label: "HIGH", text: "text-warning", bg: "bg-warning/12 border-warning/40", dot: "bg-warning" },
  medium: { label: "MEDIUM", text: "text-primary", bg: "bg-primary/10 border-primary/30", dot: "bg-primary" },
  low: { label: "LOW", text: "text-muted-foreground", bg: "bg-muted border-border", dot: "bg-muted-foreground" },
};

export function heatColor(value: number): string {
  // value 0-100 -> cyan (low) to amber to red (high), operational scale
  if (value >= 80) return "#e5484d";
  if (value >= 65) return "#f5683a";
  if (value >= 50) return "#f5a623";
  if (value >= 35) return "#3aa0c4";
  return "#2dd4de";
}
