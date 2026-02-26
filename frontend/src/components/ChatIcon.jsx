import { motion, AnimatePresence } from "framer-motion";

export default function ChatIcon({ isOpen, onClick }) {
  return (
    <motion.button
      data-chat-icon
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isOpen ? "Close chat" : "Open chat"}
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 btn-glow"
      style={{
        background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
      }}
    >
      {/* Pulse ring */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-indigo-500" />
      )}

      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.svg
            key="close"
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 45, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </motion.svg>
        ) : (
          <motion.svg
            key="chat"
            initial={{ rotate: 45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -45, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
