"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { GiftItem, WizardSubmission } from "@/types/recommendation";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export interface AiChatProps {
  items: GiftItem[];
  submission: WizardSubmission | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const CHIP_POOL = [
  "Hangisi en kişisel hediye olur?",
  "Bütçeme en uygun hangisi?",
  "En uzun ömürlü hediye hangisi?",
  "Hangisi en sürpriz olur?",
  "Listede en orijinal hediye hangisi?",
  "Fiyat-performans açısından en iyi hangisi?",
  "Hangisi en az tahmin edilebilir olur?",
  "Neden birinci sıraya koydun onu?",
  "Son dakika için önerin hangisini?",
  "Hangisi en çok beğenilir?",
  "Sence en uygun hangisi ve neden?",
  "Hangisi daha uzun süre hatırlanır?",
] as const;

function pickChips(n: number): string[] {
  const pool = [...CHIP_POOL] as string[];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

const PANEL_HEIGHT_VH = 66;

// ─── SSE stream parser ─────────────────────────────────────────────────────────

async function* readStream(response: Response): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        const token: string | undefined = parsed.choices?.[0]?.delta?.content;
        if (token) yield token;
      } catch {
        // Ignore malformed SSE chunks
      }
    }
  }
}

// ─── Typing dots ───────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <span
      style={{
        display: "inline-flex",
        gap: "3px",
        alignItems: "center",
        height: "16px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "9999px",
            background: "rgba(186,223,219,0.70)",
            animation: "ai-dot-pulse 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </span>
  );
}

// ─── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg, isNew }: { msg: Message; isNew?: boolean }) {
  const isUser = msg.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "10px",
        animation: isNew
          ? "ai-msg-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both"
          : "none",
      }}
    >
      {!isUser && (
        <div
          aria-hidden="true"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "9999px",
            background: "rgba(186,223,219,0.15)",
            border: "1px solid rgba(186,223,219,0.30)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: "#BADFDB",
            marginRight: "8px",
            marginTop: "1px",
            flexShrink: 0,
          }}
        >
          ✦
        </div>
      )}
      <div
        style={{
          maxWidth: "82%",
          padding: "9px 13px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
          background: isUser
            ? "rgba(255,189,189,0.12)"
            : "#FFFDF3",
          border: isUser
            ? "1px solid rgba(255,189,189,0.22)"
            : "1px solid oklch(0 0 0 / 8%)",
          color: "oklch(0.20 0.04 30)",
          fontSize: "13px",
          lineHeight: "1.56",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {msg.streaming && msg.content === "" ? <TypingDots /> : msg.content}
        {msg.streaming && msg.content !== "" && (
          <span
            style={{
              display: "inline-block",
              width: "2px",
              height: "12px",
              background: "rgba(186,223,219,0.75)",
              marginLeft: "2px",
              verticalAlign: "text-bottom",
              animation: "ai-cursor-blink 0.85s step-end infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function AiChat({ items, submission }: AiChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsgIds, setNewMsgIds] = useState<Set<string>>(new Set());
  const [chips] = useState<string[]>(() => pickChips(3));
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // ── Drag handlers ───────────────────────────────────────────────────────────

  function onHandlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = e.clientY;
    setDragY(0);
    setIsDragging(true);
  }

  function onHandlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const delta = e.clientY - dragStart.current;
    // Only allow dragging downward (to dismiss)
    setDragY(Math.max(0, delta));
  }

  function onHandlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    const panelH = panelRef.current?.offsetHeight ?? 400;
    if (dragY > panelH * 0.35) {
      // Animate out then close
      setDragY(panelH + 40);
      setTimeout(() => {
        setDragY(0);
        setOpen(false);
      }, 280);
    } else {
      // Snap back
      setDragY(0);
    }
  }

  // ── Context builder ─────────────────────────────────────────────────────────

  const buildContext = useCallback(
    () => ({
      answers: submission?.answers ?? {},
      items: items.map((g) => ({
        id: g.id,
        name: g.name,
        price: g.price,
        category: g.category,
        reason: g.reason,
        brand: g.brand,
        score: g.score,
      })),
    }),
    [items, submission],
  );

  // ── Send ────────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      setError(null);
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);
      setNewMsgIds((s) => new Set([...s, userMsg.id, assistantId]));
      setInput("");
      setStreaming(true);

      const history = [...messages, userMsg].map(({ role, content }) => ({
        role,
        content,
      }));

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, context: buildContext() }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          let detail = "Sunucu hatası.";
          try {
            const j = await res.json();
            detail = j.error ?? detail;
          } catch {
            /* ignore */
          }
          throw new Error(detail);
        }

        let accumulated = "";
        for await (const token of readStream(res)) {
          accumulated += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulated, streaming: true }
                : m,
            ),
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m,
          ),
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message ?? "Bağlantı hatası.");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setStreaming(false);
      }
    },
    [streaming, messages, buildContext],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleClose() {
    abortRef.current?.abort();
    // Animate out
    setDragY((panelRef.current?.offsetHeight ?? 500) + 40);
    setTimeout(() => {
      setDragY(0);
      setOpen(false);
    }, 260);
  }

  function handleOpen() {
    setDragY(0);
    setOpen(true);
  }

  const hasMessages = messages.length > 0;

  // Transition style: instant during drag, spring on release
  const panelTransition = isDragging
    ? "none"
    : "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <>
      {/* ── Keyframes ──────────────────────────────────────────── */}
      <style>{`
        @keyframes ai-dot-pulse {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes ai-cursor-blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes ai-panel-up {
          from { transform: translateY(110%); }
          to   { transform: translateY(0);   }
        }
        @keyframes ai-trigger-in {
          from { transform: translateY(20px) scale(0.88); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        @keyframes ai-msg-in {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes ai-chip-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes ai-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .ai-trigger-btn {
          animation: ai-trigger-in 0.36s cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 180ms ease,
                      background 180ms ease;
        }
        .ai-trigger-btn:hover {
          transform: scale(1.06) translateY(-1px);
          box-shadow: 0 8px 32px oklch(0 0 0 / 0.12),
                      0 0 0 1px rgba(186,223,219,0.30),
                      0 0 20px rgba(186,223,219,0.08);
        }
        .ai-trigger-btn:active { transform: scale(0.96); }
        .ai-chip {
          animation: ai-chip-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: background 140ms ease, border-color 140ms ease,
                      transform 140ms cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 140ms ease;
        }
        .ai-chip:hover:not(:disabled) {
          transform: translateY(-1px);
          background: rgba(255,189,189,0.17) !important;
          border-color: rgba(255,189,189,0.38) !important;
          box-shadow: 0 4px 12px rgba(255,189,189,0.08);
        }
        .ai-chip:active:not(:disabled) { transform: scale(0.96); }
        .ai-send-btn {
          transition: background 140ms ease, color 140ms ease, transform 140ms ease;
        }
        .ai-send-btn:hover:not(:disabled) {
          background: #FFA4A4 !important;
          color: #2D2D2D !important;
          transform: scale(1.06);
        }
        .ai-send-btn:active:not(:disabled) { transform: scale(0.94); }
        .ai-handle-area {
          cursor: grab;
          touch-action: none;
          -webkit-user-select: none;
          user-select: none;
        }
        .ai-handle-area:active { cursor: grabbing; }
        .ai-handle-pip {
          transition: background 200ms ease, width 200ms ease, transform 200ms ease;
        }
        .ai-handle-area:hover .ai-handle-pip,
        .ai-handle-area:active .ai-handle-pip {
          background: rgba(186,223,219,0.45) !important;
          width: 44px !important;
        }
        /* ── Desktop: constrain panel width, center it ── */
        .ai-panel-positioner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 47;
          pointer-events: none;
        }
        .ai-panel-positioner > * {
          pointer-events: auto;
        }
        @media (min-width: 1024px) {
          .ai-panel-positioner {
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            width: min(64rem, calc(100vw - 3rem));
            bottom: 16px;
          }
          .ai-panel-inner {
            border-radius: 22px !important;
            border-bottom: 1px solid oklch(1 0 0 / 10%) !important;
            box-shadow: 0 8px 48px oklch(0 0 0 / 0.55),
                        inset 0 1px 0 oklch(1 0 0 / 0.07) !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ai-trigger-btn, .ai-chip, .ai-send-btn { animation: none !important; transition: none !important; }
          [style*="ai-panel-up"]                  { animation: none !important; }
        }
      `}</style>

      {/* ── Floating trigger ────────────────────────────────────── */}
      {!open && items.length > 0 && (
        <button
          type="button"
          id="ai-chat-trigger"
          onClick={handleOpen}
          aria-label="AI danışmanını aç"
          className="ai-trigger-btn"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "20px",
            zIndex: 45,
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "10px 18px",
            borderRadius: "9999px",
            background: "rgba(252,249,234,0.96)",
            border: "1px solid rgba(186,223,219,0.35)",
            color: "#BADFDB",
            fontSize: "13px",
            fontWeight: "600",
            backdropFilter: "blur(16px) saturate(140%)",
            boxShadow:
              "0 4px 20px oklch(0 0 0 / 0.38), 0 0 0 1px oklch(0.78 0.14 75 / 0.05)",
            cursor: "pointer",
            letterSpacing: "0.01em",
          }}
        >
          <span style={{ fontSize: "12px", lineHeight: 1 }}>✦</span>
          AI Danışman
        </button>
      )}

      {/* ── Backdrop ────────────────────────────────────────────── */}
      {open && (
        <div
          aria-hidden="true"
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 46,
            background: "oklch(0 0 0 / 48%)",
            backdropFilter: "blur(3px)",
            animation: "ai-backdrop-in 0.22s ease both",
          }}
        />
      )}

      {/* ── Chat panel ──────────────────────────────────────────── */}
      {open && (
        <div className="ai-panel-positioner">
          <div
            ref={panelRef}
            id="ai-chat-panel"
            role="dialog"
            aria-modal="true"
            aria-label="AI Hediye Danışmanı"
            className="ai-panel-inner"
            style={{
              height: `${PANEL_HEIGHT_VH}svh`,
              maxHeight: "580px",
              display: "flex",
              flexDirection: "column",
              borderRadius: "22px 22px 0 0",
              background: "rgba(252,249,234,0.97)",
              backdropFilter: "blur(28px) saturate(120%)",
              border: "1px solid oklch(0 0 0 / 8%)",
              borderBottom: "none",
              boxShadow:
                "0 -8px 32px oklch(0 0 0 / 0.12), 0 -1px 0 oklch(0 0 0 / 0.04), inset 0 1px 0 oklch(1 0 0 / 0.8)",
              transform: `translateY(${dragY}px)`,
              transition: panelTransition,
              animation:
                dragY === 0
                  ? "ai-panel-up 0.32s cubic-bezier(0.22, 1, 0.36, 1) both"
                  : "none",
              willChange: "transform",
            }}
          >
            {/* ── Drag handle ─────────────────────────────────────── */}
            <div
              className="ai-handle-area"
              onPointerDown={onHandlePointerDown}
              onPointerMove={onHandlePointerMove}
              onPointerUp={onHandlePointerUp}
              onPointerCancel={onHandlePointerUp}
              aria-label="Paneli kaydırarak kapat"
              style={{
                padding: "12px 16px 6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
              }}
            >
              {/* Pip */}
              <div
                className="ai-handle-pip"
                style={{
                  width: "36px",
                  height: "4px",
                  borderRadius: "9999px",
                  background: "oklch(0 0 0 / 10%)",
                }}
              />

              {/* Header row */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "7px" }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#BADFDB",
                      lineHeight: 1,
                    }}
                  >
                    ✦
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "oklch(0.22 0.04 30)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    AI Danışman
                  </span>
                  {streaming && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "oklch(0.55 0.04 40)",
                      }}
                    >
                      yazıyor...
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Danışmanı kapat"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    borderRadius: "9999px",
                    background: "oklch(0 0 0 / 5%)",
                    border: "none",
                    color: "oklch(0.55 0.02 40)",
                    cursor: "pointer",
                    transition: "background 140ms ease, color 140ms ease",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "oklch(0 0 0 / 9%)";
                    e.currentTarget.style.color = "oklch(0.30 0.04 30)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "oklch(0 0 0 / 5%)";
                    e.currentTarget.style.color = "oklch(0.55 0.02 40)";
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "oklch(0 0 0 / 5%)",
                flexShrink: 0,
              }}
            />

            {/* ── Messages ─────────────────────────────────────────── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px 14px 6px",
                scrollbarWidth: "thin",
                scrollbarColor: "oklch(0.70 0.05 80 / 30%) transparent",
              }}
            >
              {!hasMessages ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: "16px",
                    paddingBottom: "8px",
                    gap: "14px",
                    textAlign: "center",
                  }}
                >
                  {/* Icon */}
                  <div
                    aria-hidden="true"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "rgba(186,223,219,0.12)",
                      border: "1px solid rgba(186,223,219,0.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      color: "#BADFDB",
                      animation:
                        "ai-msg-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both",
                    }}
                  >
                    ✦
                  </div>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "oklch(0.55 0.04 40)",
                      lineHeight: "1.5",
                      maxWidth: "230px",
                      animation:
                        "ai-msg-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both",
                    }}
                  >
                    Listendeki hediyeler hakkında ne merak ediyorsan sor.
                  </p>

                  {/* Starter chips */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "7px",
                      justifyContent: "center",
                    }}
                  >
                    {chips.map((chip, i) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => sendMessage(chip)}
                        disabled={streaming}
                        className="ai-chip"
                        style={{
                          animationDelay: `${0.24 + i * 0.07}s`,
                          padding: "7px 13px",
                          borderRadius: "9999px",
                          background: "rgba(186,223,219,0.10)",
                          border: "1px solid rgba(186,223,219,0.25)",
                          color: "#2D2D2D",
                          fontSize: "12px",
                          fontWeight: "500",
                          cursor: "pointer",
                          letterSpacing: "0.005em",
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isNew={newMsgIds.has(msg.id)}
                  />
                ))
              )}

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  style={{
                    margin: "6px 0 10px",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    background: "rgba(255,189,189,0.10)",
                    border: "1px solid rgba(255,189,189,0.22)",
                    color: "#FFBDBD",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      const lastUser = [...messages]
                        .reverse()
                        .find((m) => m.role === "user");
                      if (lastUser) sendMessage(lastUser.content);
                    }}
                    style={{
                      flexShrink: 0,
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#FFBDBD",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                      textUnderlineOffset: "2px",
                    }}
                  >
                    Tekrar dene
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ────────────────────────────────────────────── */}
            <div
              style={{
                flexShrink: 0,
                padding: "10px 12px 16px",
                borderTop: "1px solid oklch(0 0 0 / 7%)",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                ref={inputRef}
                id="ai-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming}
                placeholder="Bir şey sor..."
                autoComplete="off"
                style={{
                  flex: 1,
                  padding: "9px 13px",
                  borderRadius: "11px",
                  background: "#F0EDD8",
                  border: "1px solid oklch(0 0 0 / 10%)",
                  color: "oklch(0.20 0.04 30)",
                  fontSize: "13px",
                  outline: "none",
                  transition: "border-color 150ms ease, box-shadow 150ms ease",
                  minWidth: 0,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(186,223,219,0.50)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(186,223,219,0.10)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "oklch(0 0 0 / 10%)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                id="ai-chat-send"
                onClick={() => sendMessage(input)}
                disabled={streaming || !input.trim()}
                aria-label="Mesaj gönder"
                className="ai-send-btn"
                style={{
                  flexShrink: 0,
                  width: "37px",
                  height: "37px",
                  borderRadius: "11px",
                  background:
                    streaming || !input.trim()
                      ? "#F0EDD8"
                      : "rgba(255,164,164,0.15)",
                  border: "1px solid oklch(0 0 0 / 10%)",
                  color:
                    streaming || !input.trim()
                      ? "oklch(0.60 0.02 40)"
                      : "#FFA4A4",
                  cursor:
                    streaming || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path
                    d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
