import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Search, Sparkles, Shield } from "lucide-react";
import { currentOfficer } from "@/data/db";
import { cn } from "@/lib/utils";
import { LiveBadge } from "@/components/common/LiveBadge";
import { SystemStatus } from "@/components/common/SystemStatus";
import { useShell } from "./ShellContext";

const NAV = [
  { to: "/", label: "Command Center" },
  { to: "/morning-intelligence", label: "Morning Intelligence" },
  { to: "/investigation", label: "Investigation Hub" },
  { to: "/criminal-network", label: "Criminal Network" },
  { to: "/analytics", label: "Crime Analytics" },
] as const;

export function TopNav() {
  const shell = useShell();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = shell.unread;

  return (
    <header className="sticky top-0 z-[1000] border-b border-border bg-panel/95 backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary/15 text-primary">
            <Shield className="h-4 w-4" />
          </div>
          <div className="leading-none">
            <span className="block text-[13px] font-bold tracking-tight text-foreground">
              CrimeSight<span className="text-primary"> AI</span>
            </span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Karnataka State Police
            </span>
          </div>
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
          {NAV.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors",
                  active ? "bg-elevated text-primary" : "text-muted-foreground hover:text-foreground hover:bg-elevated/60"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <SystemStatus className="mr-1" />
          <LiveBadge className="mr-1 hidden sm:flex" />

          <button
            onClick={() => shell.setSearchOpen(true)}
            className="flex items-center gap-2 rounded-sm border border-border bg-elevated px-2.5 py-1.5 text-[12px] text-muted-foreground transition hover:border-border-strong"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden rounded-sm border border-border bg-panel px-1 font-mono text-[10px] md:inline">⌘K</kbd>
          </button>

          <button
            onClick={() => shell.setNotifOpen(true)}
            className="relative flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-elevated text-muted-foreground transition hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[9px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </button>

          <button
            onClick={() => shell.openAI()}
            className="flex items-center gap-1.5 rounded-sm border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[12px] font-semibold text-primary transition hover:bg-primary/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden md:inline">CrimeSight AI</span>
          </button>

          <Link
            to="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-sm font-mono text-[11px] font-semibold text-background"
            style={{ background: `hsl(${currentOfficer.avatarHue} 55% 55%)` }}
            aria-label="Officer profile"
          >
            {currentOfficer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </Link>
        </div>
      </div>
    </header>
  );
}
