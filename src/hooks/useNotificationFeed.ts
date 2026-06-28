import { useEffect, useRef, useState } from "react";
import { buildBacklog, nextSignal, type Notification } from "@/data/notifications";

const TICK_MS = 7000;

// Live operational feed: seeds a deterministic backlog, then appends new
// deterministic signals on an interval so the bell feed updates over time.
// Tracks per-item read and cleared state so the panel supports mark-as-read
// and clear interactions with an auto-updating unread badge count.
export function useNotificationFeed() {
  const [all, setAll] = useState<Notification[]>(() => buildBacklog());
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [clearedIds, setClearedIds] = useState<Set<string>>(() => new Set());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setAll((prev) => [nextSignal(), ...prev].slice(0, 60));
    }, TICK_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const items = all.filter((n) => !clearedIds.has(n.id));
  const unread = items.filter((n) => !readIds.has(n.id)).length;

  const isRead = (id: string) => readIds.has(id);
  const markRead = (id: string) =>
    setReadIds((prev) => new Set(prev).add(id));
  const markAllRead = () => setReadIds(new Set(all.map((n) => n.id)));
  const clear = (id: string) =>
    setClearedIds((prev) => new Set(prev).add(id));
  const clearAll = () => setClearedIds(new Set(all.map((n) => n.id)));

  return { items, unread, isRead, markRead, markAllRead, clear, clearAll };
}
