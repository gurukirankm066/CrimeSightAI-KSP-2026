import { useEffect, useState, type ReactNode } from "react";

/** Renders children only after mount — guards browser-only libs (Leaflet, canvas) from SSR. */
export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback ?? null}</>;
  return <>{children}</>;
}
