import { useState } from "react";
import { motion } from "framer-motion";
import ChatWidget from "./components/ChatWidget";
import ChatIcon from "./components/ChatIcon";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// Quick-prompt chips — clicking one pre-fills and sends a message
export const QUICK_PROMPTS = [
  { label: "🛠 Skills", text: "What are your technical skills?" },
  { label: "💼 Experience", text: "Where have you worked?" },
  { label: "🚀 Projects", text: "Tell me about your projects" },
  { label: "🎓 Education", text: "What's your educational background?" },
];

export default function App() {
  const [chatOpen, setChatOpen] = useState(true);
  const [quickPrompt, setQuickPrompt] = useState(null); // passed down to ChatWidget

  const fireQuickPrompt = (text) => {
    setChatOpen(true); // open on mobile if closed
    setQuickPrompt(text); // ChatWidget watches this and auto-sends
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* ════════════════════════════════
          LEFT HALF — Intro
      ════════════════════════════════ */}
      <div className="relative w-full md:w-1/2 flex items-center justify-center px-8 sm:px-14 py-16 md:py-0 overflow-hidden">
        {/* Animated ambient orb */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-20 blur-[80px] animate-float-orb"
          style={{
            background:
              "radial-gradient(circle, #818cf8 0%, #6366f1 40%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-10 blur-[60px]"
          style={{
            background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)",
            animationDelay: "4s",
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-sm w-full"
        >
          {/* Status pill */}
          <motion.div variants={itemVariants} className="mb-7">
            <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3.5 py-1.5 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
              Available · Dhaka, BD
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={itemVariants}
            className="font-sans font-extrabold tracking-tight leading-[1.0] mb-4"
            style={{ fontSize: "clamp(3.2rem, 6vw, 5rem)" }}
          >
            <span className="text-slate-100">Rabita</span>
            <br />
            <span className="text-shimmer">Amin</span>
          </motion.h1>

          {/* Designation */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 font-mono text-sm text-slate-400 bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Software Engineer
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </span>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="w-12 h-px bg-gradient-to-r from-indigo-500 to-transparent mb-8"
          />

          {/* Quick-prompt chips */}
          <motion.div variants={itemVariants}>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
              Ask about →
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map(({ label, text }) => (
                <motion.button
                  key={label}
                  onClick={() => fireQuickPrompt(text)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="text-xs font-medium text-slate-300 bg-slate-800/70 hover:bg-indigo-500/15 hover:text-indigo-300 hover:border-indigo-500/40 border border-slate-700/50 rounded-full px-3.5 py-1.5 transition-all duration-150 cursor-pointer"
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Desktop nudge */}
          <motion.p
            variants={itemVariants}
            className="hidden md:flex items-center gap-2 mt-10 text-xs text-slate-600 font-mono"
          >
            <span>Chat is open on the right</span>
            <svg
              className="w-3.5 h-3.5 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.p>

          {/* Mobile nudge */}
          <motion.p
            variants={itemVariants}
            className="md:hidden mt-8 text-xs text-slate-600 font-mono"
          >
            Chat is open below 👇
          </motion.p>
        </motion.div>
      </div>

      {/* ════════════════════════════════
          Vertical divider (desktop)
      ════════════════════════════════ */}
      <div className="hidden md:block w-px shrink-0 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

      {/* ════════════════════════════════
          RIGHT HALF — Inline Chat (desktop)
      ════════════════════════════════ */}
      <div className="hidden md:flex w-1/2 items-center justify-center px-10 py-10">
        <ChatWidget
          variant="inline"
          isOpen={true}
          onClose={() => {}}
          quickPrompt={quickPrompt}
          onQuickPromptConsumed={() => setQuickPrompt(null)}
        />
      </div>

      {/* ════════════════════════════════
          MOBILE — Floating chat + icon
      ════════════════════════════════ */}
      <div className="md:hidden">
        <ChatWidget
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          quickPrompt={quickPrompt}
          onQuickPromptConsumed={() => setQuickPrompt(null)}
        />
        <ChatIcon isOpen={chatOpen} onClick={() => setChatOpen((v) => !v)} />
      </div>
    </div>
  );
}
