"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Sparkles } from "lucide-react";
import { PrismSVG } from "@/components/ui/Logo";
import { useBalance, useInventoryGraded, useProfile } from "@/hooks/useGame";
import { respondLocal, type CoachContext } from "@/lib/ai/coach-engine";

// ── Types ────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Storage ──────────────────────────────────────────────────────────

const STORAGE_KEY = "gf:prism:history.v2";
const HISTORY_CAP = 30;

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return parsed.slice(-HISTORY_CAP);
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(-HISTORY_CAP)),
    );
  } catch {
    // localStorage plein/désactivé — on ignore
  }
}

// ── Fake typing — donne l'illusion d'une réponse pensée ──────────────
// Découpe la réponse en chunks de ~3-6 caractères avec délai ~12 ms entre.
// L'utilisateur peut interrompre via le bouton (état `typing`).
async function typeOut(
  text: string,
  onChunk: (partial: string) => void,
  signal: AbortSignal,
): Promise<void> {
  let i = 0;
  while (i < text.length) {
    if (signal.aborted) return;
    const next = Math.min(i + 3 + Math.floor(Math.random() * 4), text.length);
    onChunk(text.slice(0, next));
    i = next;
    await new Promise((r) => setTimeout(r, 14));
  }
}

// ── Composant principal ──────────────────────────────────────────────

export function CoachWidget() {
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [partial, setPartial] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { balance } = useBalance();
  const { items, totalValue } = useInventoryGraded();
  const { profile } = useProfile();

  // Charge l'historique au mount
  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  // Auto-scroll en bas à chaque nouveau message ou char ajouté
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, partial]);

  // Focus l'input à l'ouverture du panel
  useEffect(() => {
    if (open) {
      setHasNew(false);
      inputRef.current?.focus();
    }
  }, [open]);

  // Cleanup du timer d'animation en unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || typing) return;

    // Top 3 cartes pour personnaliser les suggestions Prism
    const topCards = [...items]
      .sort((a, b) => b.price - a.price)
      .slice(0, 3)
      .map((it) => ({
        name: it.card.nameFr,
        grade: it.grade,
        price: it.price,
      }));

    const ctx: CoachContext = {
      balance,
      inventoryCount: items.length,
      inventoryValue: totalValue,
      username: profile.username || "Dresseur",
      topCards,
    };

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setTyping(true);
    setPartial("");

    // Génère la réponse localement (synchrone, instantané)
    const reply = respondLocal(text, ctx);

    // Anime le texte pour le ressenti — l'utilisateur peut couper
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await typeOut(reply, setPartial, ctrl.signal);
    } finally {
      const finalMessages: ChatMessage[] = [
        ...newMessages,
        { role: "assistant", content: reply },
      ];
      setMessages(finalMessages);
      saveHistory(finalMessages);
      setPartial("");
      setTyping(false);
      abortRef.current = null;
    }
  }, [input, messages, typing, balance, items, totalValue, profile.username]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const skipAnimation = () => abortRef.current?.abort();

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setPartial("");
    saveHistory([]);
  };

  return (
    <>
      {/* ── BULLE FLOTTANTE ────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer Prism" : "Ouvrir Prism (coach IA)"}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 group"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{
            background:
              "linear-gradient(140deg, #0A0E14 0%, #1A0F1F 60%, #0A0E14 100%)",
            border: "2px solid rgba(0,212,255,0.4)",
            boxShadow:
              "0 0 32px rgba(0,212,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {open ? (
            <X size={20} style={{ color: "#00D4FF" }} />
          ) : (
            <PrismSVG size={32} noGlow />
          )}
          {!open && hasNew && (
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full pulse-live"
              style={{ background: "#FFD740", boxShadow: "0 0 8px #FFD740" }}
              aria-hidden
            />
          )}
        </div>
      </button>

      {/* ── PANEL CHAT ─────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-20 right-2 md:bottom-24 md:right-6 z-40 flex flex-col"
          style={{
            width: "min(calc(100vw - 16px), 400px)",
            height: "min(calc(100vh - 120px), 600px)",
            background: "rgba(5,7,16,0.96)",
            borderRadius: 12,
            border: "1px solid rgba(0,212,255,0.25)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* HEADER */}
          <header
            className="flex items-center gap-3 px-4 py-3 border-b"
            style={{ borderColor: "rgba(0,212,255,0.18)" }}
          >
            <PrismSVG size={28} noGlow />
            <div className="flex-1 min-w-0">
              <p
                className="text-[14px] font-extrabold leading-none"
                style={{ fontFamily: "var(--font-display)", color: "white" }}
              >
                Prism
              </p>
              <p
                className="text-[10px] mt-1 leading-none flex items-center gap-1.5"
                style={{ color: "#00FF88" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full pulse-live"
                  style={{
                    background: "#00FF88",
                    boxShadow: "0 0 6px #00FF88",
                  }}
                />
                Coach · local · zéro latence
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={reset}
                className="text-[11px] font-semibold px-2 py-1 rounded transition-colors hover:bg-white/5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Reset
              </button>
            )}
          </header>

          {/* MESSAGES */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.length === 0 && (
              <Greeting
                username={profile.username || "Dresseur"}
                balance={balance}
                inventoryCount={items.length}
                onSuggest={(s) => setInput(s)}
              />
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {partial && (
              <Bubble
                role="assistant"
                content={partial}
                streaming
                onClickSkip={skipAnimation}
              />
            )}
          </div>

          {/* INPUT */}
          <div
            className="px-3 pb-3 pt-2 border-t"
            style={{ borderColor: "rgba(0,212,255,0.18)" }}
          >
            <div
              className="flex items-end gap-2 px-2 py-2 rounded-[var(--radius-sm)]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder={typing ? "Prism répond…" : "Demande à Prism…"}
                disabled={typing}
                rows={1}
                maxLength={4000}
                className="flex-1 bg-transparent text-[13px] outline-none resize-none max-h-32 disabled:opacity-50"
                style={{ color: "white", minHeight: 24 }}
              />
              <button
                onClick={send}
                disabled={typing || !input.trim()}
                aria-label="Envoyer"
                className="flex-shrink-0 w-8 h-8 rounded-[var(--radius-xs)] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                style={{
                  background:
                    typing || !input.trim()
                      ? "rgba(255,255,255,0.06)"
                      : "linear-gradient(135deg, #2A7DFF, #00D4FF)",
                  color: "white",
                  boxShadow:
                    typing || !input.trim()
                      ? "none"
                      : "0 0 12px rgba(0,212,255,0.5)",
                }}
              >
                <Send size={13} />
              </button>
            </div>
            <p
              className="text-[9.5px] mt-1.5 text-center"
              style={{ color: "var(--color-text-subtle)" }}
            >
              Prism tourne en local — vérifie les chiffres importants
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────

function Bubble({
  role,
  content,
  streaming,
  onClickSkip,
}: {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  onClickSkip?: () => void;
}) {
  const isUser = role === "user";
  return (
    <div
      className="flex"
      style={{ justifyContent: isUser ? "flex-end" : "flex-start" }}
    >
      <div
        onClick={streaming ? onClickSkip : undefined}
        className={`max-w-[85%] px-3 py-2 rounded-[var(--radius-sm)] text-[13px] leading-relaxed ${streaming ? "cursor-pointer" : ""}`}
        style={{
          background: isUser
            ? "linear-gradient(135deg, rgba(42,125,255,0.18), rgba(0,212,255,0.10))"
            : "rgba(255,255,255,0.04)",
          border: isUser
            ? "1px solid rgba(42,125,255,0.35)"
            : "1px solid rgba(255,255,255,0.06)",
          color: isUser ? "#E8F1FF" : "var(--color-text-primary)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        title={streaming ? "Cliquer pour passer l’animation" : undefined}
      >
        {content}
        {streaming && (
          <span
            className="inline-block w-2 h-3.5 ml-0.5 align-middle"
            style={{
              background: "#00D4FF",
              animation: "jackpot-flicker 1s ease-in-out infinite",
            }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

function Greeting({
  username,
  balance,
  inventoryCount,
  onSuggest,
}: {
  username: string;
  balance: number;
  inventoryCount: number;
  onSuggest: (s: string) => void;
}) {
  const suggestions = [
    "Quelle caisse j’ouvre ?",
    "Comment marche la roue ?",
    "C’est rentable de re-grader ?",
  ];
  return (
    <div className="flex flex-col gap-3">
      <div
        className="px-3 py-3 rounded-[var(--radius-sm)] text-[13px] leading-relaxed"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "var(--color-text-primary)",
        }}
      >
        <p className="mb-1">
          Salut <strong>{username}</strong> 👋 Je suis <strong>Prism</strong>,
          ton coach.
        </p>
        <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
          T&apos;as ${balance.toFixed(2)} fictifs et {inventoryCount} carte
          {inventoryCount > 1 ? "s" : ""} en inventaire. Pose-moi une question —
          proba, stratégie, choix de caisse, je connais tous les chiffres du
          jeu.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <p
          className="text-[10px] font-semibold uppercase tracking-[1.4px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          Idées pour démarrer
        </p>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="text-left px-2.5 py-2 rounded-[var(--radius-xs)] text-[12px] transition-colors hover:bg-white/5 flex items-center gap-2"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              color: "var(--color-text-secondary)",
            }}
          >
            <Sparkles
              size={11}
              style={{ color: "var(--color-pokemon-yellow)" }}
            />
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
