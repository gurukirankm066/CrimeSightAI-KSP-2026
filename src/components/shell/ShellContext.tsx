import { createContext, useContext, useState, type ReactNode } from "react";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import type { Notification } from "@/data/notifications";

interface ShellState {
  aiOpen: boolean;
  searchOpen: boolean;
  notifOpen: boolean;
  aiPrefill: string | null;
  openAI: (prefill?: string) => void;
  closeAI: () => void;
  setSearchOpen: (v: boolean) => void;
  setNotifOpen: (v: boolean) => void;
  notifications: Notification[];
  unread: number;
  isRead: (id: string) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: (id: string) => void;
  clearAll: () => void;
}

const Ctx = createContext<ShellState | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpenState] = useState(false);
  const [aiPrefill, setAiPrefill] = useState<string | null>(null);
  const feed = useNotificationFeed();

  const setNotifOpen = (v: boolean) => {
    setNotifOpenState(v);
  };

  return (
    <Ctx.Provider
      value={{
        aiOpen,
        searchOpen,
        notifOpen,
        aiPrefill,
        openAI: (prefill) => {
          setAiPrefill(prefill ?? null);
          setAiOpen(true);
        },
        closeAI: () => setAiOpen(false),
        setSearchOpen,
        setNotifOpen,
        notifications: feed.items,
        unread: feed.unread,
        isRead: feed.isRead,
        markRead: feed.markRead,
        markAllRead: feed.markAllRead,
        clear: feed.clear,
        clearAll: feed.clearAll,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useShell() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}
