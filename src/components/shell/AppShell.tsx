import { Outlet } from "@tanstack/react-router";
import { ShellProvider } from "./ShellContext";
import { TopNav } from "./TopNav";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { SearchPalette } from "@/components/search/SearchPalette";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";

export function AppShell() {
  return (
    <ShellProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <TopNav />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <SearchPalette />
      <NotificationsPanel />
      <AIAssistant />
    </ShellProvider>
  );
}
