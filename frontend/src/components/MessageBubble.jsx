import { motion } from "framer-motion";

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
      <svg
        className="w-3.5 h-3.5 text-white"
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
  );
}

function UserAvatar() {
  return (
    <div className="w-7 h-7 rounded-xl bg-slate-700/80 border border-slate-600/40 flex items-center justify-center shrink-0">
      <svg
        className="w-3.5 h-3.5 text-slate-300"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </div>
  );
}

function formatTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message, showTime }) {
  const isBot = message.role === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-2.5 ${
        isBot ? "items-end" : "items-end flex-row-reverse"
      }`}
    >
      {/* Avatar — only shown on last message in a group */}
      {
        showTime ? (
          isBot ? (
            <BotAvatar />
          ) : (
            <UserAvatar />
          )
        ) : (
          <div className="w-7 shrink-0" />
        ) /* spacer to keep alignment */
      }

      <div
        className={`flex flex-col gap-1 max-w-[78%] ${
          isBot ? "items-start" : "items-end"
        }`}
      >
        {/* Bubble */}
        <div
          className={`px-3.5 py-2.5 text-sm leading-relaxed ${
            isBot
              ? "bg-white/[0.06] border border-white/[0.08] text-slate-200 rounded-2xl rounded-bl-sm"
              : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-indigo-500/20"
          } ${
            message.isError
              ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
              : ""
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp — shown when role changes or it's the last message */}
        {showTime && message.time && (
          <span className="text-[10px] font-mono text-slate-600 px-1">
            {formatTime(message.time)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
