import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const INITIAL_MESSAGE = {
  id: "init",
  role: "bot",
  content: "Hi! 👋 Ask me about Rabita's experience, skills, or projects!",
  time: new Date(),
};

const panelVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.97,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * variant="floating" — fixed overlay, bottom-right (mobile default)
 * variant="inline"   — static panel filling parent column (desktop)
 *
 * quickPrompt / onQuickPromptConsumed — lets App.jsx fire a message
 * by clicking a quick-prompt chip on the left panel.
 */
export default function ChatWidget({
  isOpen,
  onClose,
  variant = "floating",
  quickPrompt,
  onQuickPromptConsumed,
}) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-focus
  useEffect(() => {
    if (variant === "floating" && isOpen)
      setTimeout(() => inputRef.current?.focus(), 300);
    if (variant === "inline") setTimeout(() => inputRef.current?.focus(), 500);
  }, [isOpen, variant]);

  // Click-outside (floating only)
  useEffect(() => {
    if (variant !== "floating" || !isOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        if (!e.target.closest("[data-chat-icon]")) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, variant]);

  // Consume quick-prompt chips fired from App.jsx
  useEffect(() => {
    if (!quickPrompt) return;
    sendMessage(quickPrompt);
    onQuickPromptConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickPrompt]);

  const sendMessage = useCallback(
    async (textOverride) => {
      const text = (textOverride ?? input).trim();
      if (!text || isLoading) return;

      const userMsg = {
        id: Date.now(),
        role: "user",
        content: text,
        time: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      if (!textOverride) setInput("");
      setIsLoading(true);

      try {
        const res = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "bot",
            content: data.reply,
            time: new Date(),
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "bot",
            content: err.message.includes("Too many")
              ? "Slow down a bit! You've hit the rate limit. Try again in a moment. ⏱️"
              : "Hmm, something went wrong. Please try again!",
            time: new Date(),
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── SHARED PANEL UI ────────────────────────────────────────────────────────
  const ChatPanel = (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden glass-strong relative noise">
      {/* ── Header ── */}
      <div className="relative shrink-0 px-4 py-3.5 overflow-hidden">
        {/* Header gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-violet-600/90" />
        <div className="absolute inset-0 bg-glass-shine" />
        {/* Decorative glow line at bottom of header */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex items-center justify-between">
          {/* Left: avatar + title */}
          <div className="flex items-center gap-3">
            {/* Bot avatar */}
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.402 2.798H4.2c-1.432 0-2.402-1.798-1.402-2.798L4.2 15.3"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                Rabita's AI
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse" />
                <span className="text-white/60 text-[10px] font-mono">
                  online
                </span>
              </div>
            </div>
          </div>

          {/* Right: minimize (floating only) */}
          {variant === "floating" && (
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
              aria-label="Minimize"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 12H4"
                />
              </svg>
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Message area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin min-h-0">
        {messages.map((msg, i) => {
          // Show timestamp only when role changes or it's the last message
          const showTime =
            i === messages.length - 1 || messages[i + 1]?.role !== msg.role;
          return (
            <MessageBubble key={msg.id} message={msg} showTime={showTime} />
          );
        })}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 px-3 pb-3 pt-2 border-t border-white/[0.06]">
        <div className="flex items-end gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 focus-within:border-indigo-500/50 focus-within:bg-indigo-500/5 transition-all duration-200">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask me anything…"
            maxLength={300}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none disabled:opacity-40 resize-none leading-relaxed py-0.5"
          />
          {/* Char counter — appears when typing */}
          <AnimatePresence>
            {input.length > 200 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`text-[10px] font-mono shrink-0 ${
                  input.length > 270 ? "text-rose-400" : "text-slate-500"
                }`}
              >
                {300 - input.length}
              </motion.span>
            )}
          </AnimatePresence>
          {/* Send button */}
          <motion.button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0 btn-glow"
            aria-label="Send"
          >
            {isLoading ? (
              <svg
                className="w-3.5 h-3.5 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </motion.button>
        </div>
        {/* Footer hint */}
        <p className="text-center text-slate-700 text-[10px] mt-2 font-mono tracking-wide">
          Powered by Ollama · Press Enter to send
        </p>
      </div>
    </div>
  );

  // ── INLINE (desktop) ──────────────────────────────────────────────────────
  if (variant === "inline") {
    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        className="w-full max-w-[440px]"
        style={{ height: "min(620px, calc(100vh - 80px))" }}
      >
        {ChatPanel}
      </motion.div>
    );
  }

  // ── FLOATING (mobile) ─────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-24 right-4 z-50 w-[340px] max-sm:w-[calc(100vw-20px)] max-sm:right-2.5"
          style={{ maxHeight: 520 }}
        >
          {ChatPanel}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
