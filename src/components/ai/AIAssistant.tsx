import { useEffect, useMemo, useRef, useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { Sparkles, X, Send, ShieldAlert, ArrowRight } from "lucide-react";
import { aiAnswer, routeLabel, type AIResponse } from "@/data/ai";
import { useShell } from "@/components/shell/ShellContext";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "ai";
  text?: string;
  res?: AIResponse;
}

const SUGGESTIONS = [
  "Summarize overnight activity",
  "Tell me about Bengaluru",
  "Who is the highest-risk suspect?",
  "Vehicle theft trend",
];

export function AIAssistant() {
  const shell = useShell();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPrefill = useRef<string | null>(null);

  // Route briefing updates automatically with the current page.
  const routeAnswer = useMemo(() => aiAnswer(pathname), [pathname]);

  useEffect(() => {
    if (shell.aiOpen && shell.aiPrefill && shell.aiPrefill !== lastPrefill.current) {
      lastPrefill.current = shell.aiPrefill;
      send(shell.aiPrefill);
    }
    if (!shell.aiOpen) lastPrefill.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shell.aiOpen, shell.aiPrefill]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (shell.aiOpen) inputRef.current?.focus();
  }, [shell.aiOpen]);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    const res = aiAnswer(pathname, q);
    setMsgs((m) => [...m, { role: "user", text: q }, { role: "ai", res }]);
    setInput("");
    inputRef.current?.focus();
  }

  function runAction(res: AIResponse) {
    if (res.actionTo) navigate({ to: res.actionTo });
  }

  return (
    <>
      {/* dim layer is non-blocking so the assistant stays persistent over any page */}
      {shell.aiOpen && <div className="fixed inset-0 z-[1100] bg-background/40" onClick={shell.closeAI} />}
      <aside
        className={cn(
          "fixed right-0 top-0 z-[1101] flex h-screen w-full max-w-[420px] flex-col border-l border-border bg-panel transition-transform duration-200",
          shell.aiOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!shell.aiOpen}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-none">
              <p className="text-[13px] font-semibold text-foreground">CrimeSight AI</p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                Context · {routeLabel(pathname)}
              </p>
            </div>
          </div>
          <button onClick={shell.closeAI} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          <AIBlock res={routeAnswer} intro onAction={runAction} />
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] rounded-md rounded-br-none border border-border bg-elevated px-3 py-2 text-[13px] text-foreground">
                {m.text}
              </div>
            ) : (
              <AIBlock key={i} res={m.res!} onAction={runAction} />
            )
          )}
        </div>

        <div className="shrink-0 border-t border-border p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-sm border border-border bg-elevated px-2 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 rounded-sm border border-border bg-elevated px-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a district, suspect, FIR…"
              className="flex-1 bg-transparent py-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="text-primary disabled:text-muted-foreground" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function AIBlock({ res, intro, onAction }: { res: AIResponse; intro?: boolean; onAction: (res: AIResponse) => void }) {
  return (
    <div className="rounded-md rounded-bl-none border border-l-2 border-l-primary border-border bg-elevated p-3">
      {intro && (
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Route briefing</p>
      )}
      {res.insufficient ? (
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div>
            <p className="text-[12px] font-semibold text-warning">Insufficient Evidence</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{res.summary}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Summary</p>
            {res.confidence !== null && (
              <span className="shrink-0 rounded-sm bg-primary/12 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                {res.confidence}% conf
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-foreground">{res.summary}</p>
        </>
      )}

      {res.evidence.length > 0 && (
        <div className="mt-2.5 rounded-sm border border-border bg-panel p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Evidence</p>
          <ul className="mt-1 space-y-0.5">
            {res.evidence.map((e, i) => (
              <li key={i} className="flex gap-1.5 font-mono text-[11px] text-foreground/80">
                <span className="text-primary">▪</span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!res.insufficient && (
        <div className="mt-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Recommendation</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-foreground/90">{res.recommendation}</p>
        </div>
      )}

      {res.action && (
        <div className="mt-2.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Primary Action</p>
          <button
            onClick={() => onAction(res)}
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-2.5 py-1.5 text-[12px] font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {res.action}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
