import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Ollama } from "ollama";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const ollama = new Ollama({
  host: "https://ollama.com",
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  },
});

const MODEL = process.env.OLLAMA_MODEL || "llama3.1";

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests, please wait a moment." },
});
app.use("/api/chat", limiter);

// ── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a chatbot representing Rabita Amin, a professional Software Engineer.
ONLY use the following context to answer questions about them.
Answer in first-person as if you ARE them.

CONTEXT:
Name: Rabita Amin
Location: Dhaka, Bangladesh
Current Role: Software Engineer
Experience:
- 2 years in Software development
- Previously at Bangladesh Japan Information & Technology (BJIT) Limited as Full Stack Software Developer
- Completed Web Technology Training (MERN) at BJIT Academy (achieved 3rd place)
Technical Skills:
Frontend:
- React.js, Next.js
- TypeScript, JavaScript
- Tailwind CSS, SCSS, Bootstrap
- HTML, CSS
- Redux (state management), RTK Query
- React Router, Atomic Design principles
- Chart.js for data visualization

Backend:
- Node.js, Express.js (with TypeScript)
- PHP, Laravel
- JWT-based authentication
- RESTful API design & documentation (Swagger)
- Docker containerization

Databases:
- MongoDB (schema design, modeling)
- PostgreSQL
- MySQL
- Redis (caching)
- Upstash

Dev Tools & Infrastructure:
- RabbitMQ (message broker for async operations)
- Redis (caching)
- Slack Bolt (Slack app development)
- Jira REST API
- Socket.IO (real-time communication)
- Git & GitHub
- AWS S3 (media storage)
- Docker
- Teams

Education:
- Bachelor of Science (B.Sc.) in Information Technology
  Jahangirnagar University | Feb 2018 - May 2023
  CGPA: 3.54

- Higher Secondary Certificate (HSC)
  Birshreshtha Noor Mohammad Public College | 2015-2017

- Secondary School Certificate (SSC)
  Kamrunnesa Govt. Girls' High School, Dhaka | 2009-2015

Notable Projects:
- SWAPIverse: Full-stack Star Wars character explorer with search, detailed views, and Redis caching. Built with Node.js, Express, TypeScript (backend) and React, Vite, RTK Query. Deployed via Render, Vercel, and Upstash.
- Image Processor: Developed an image compression application using Node.js, Express.js, and Next.js with RabbitMQ for task handling and Socket.IO for real-time user notifications.
- LearnWave: Full-stack e-learning platform featuring course management, enrollment, progress tracking, and secure user/admin dashboards. Integrated AWS S3 for media storage.

RULES:
1. Only answer questions about my professional background, skills, experience, projects, or education.
2. If the question is NOT related to my professional background — regardless of how it is phrased — you MUST respond with this EXACT message and nothing else: "That's outside my area! 😊 I'm only here to answer questions about Rabita's professional background. Try asking about her skills, projects, or experience!"
3. Keep on-topic answers to 2-3 sentences.
4. Be friendly and professional.
5. Use occasional emojis (1 per response max).
6. If asked for contact info and it's not provided above, say: "You can reach out through my portfolio contact form."

OUT-OF-CONTEXT EXAMPLES — always use the fallback message for these:
- Weather, news, sports, general trivia
- Jokes, riddles, poems, stories
- Cooking, travel, lifestyle questions
- Coding help unrelated to Rabita's own projects or stack
- Any topic that has nothing to do with Rabita Amin's career`;

// ── Out-of-context handling constants ────────────────────────────────────────
const OUT_OF_CONTEXT_REPLY =
  "That's outside my area! 😊 I'm only here to answer questions about Rabita's professional background. Try asking about her skills, projects, or experience!";

// Expanded signals for better detection
const OFF_TOPIC_SIGNALS = [
  // AI disclaimer signals
  "i'm not able to",
  "i cannot",
  "as an ai",
  "as an artificial intelligence",
  "i don't have personal",
  "i'm just a language model",
  "that's not something i",
  "i don't have access to",
  "i'm not programmed to",
  "i don't know about",
  "i'm not familiar with",
  "i don't have information about",
  "i don't have the ability to",
  "i wasn't trained on",
  "i don't have knowledge about",

  // Common off-topic topics
  "weather",
  "sports scores",
  "news article",
  "recipe",
  "joke",
  "riddle",
  "poem",
  "stock price",
  "cooking",
  "movie",
  "music",
  "celebrity",
  "politics",
  "history",
  "geography",
  "science fact",

  // Refusal patterns
  "i cannot answer",
  "i cannot provide",
  "i'm not allowed to",
  "i'm not designed to",
  "that's beyond my scope",
  "that's outside my scope",
];

// Signals that indicate the reply IS on-topic (about Rabita)
const ON_TOPIC_SIGNALS = [
  "rabita",
  "my experience",
  "my project",
  "my skill",
  "i worked on",
  "i developed",
  "i built",
  "my role",
  "software engineer",
  "dhaka",
  "jahangirnagar university",
  "bjit",
  "swapiverse",
  "image processor",
  "learnwave",
  "react",
  "node.js",
  "mongodb",
  "redis",
  "rabbitmq",
  "socket.io",
];

// ── Helper function to check if reply is out of context ─────────────────────
function isOutOfContext(reply) {
  const replyLower = reply.toLowerCase();

  // If it contains on-topic signals, it's likely relevant
  const hasOnTopicSignals = ON_TOPIC_SIGNALS.some((signal) =>
    replyLower.includes(signal.toLowerCase())
  );

  // If it has strong on-topic signals, consider it on-topic
  if (hasOnTopicSignals) {
    return false;
  }

  // Check for off-topic signals
  const hasOffTopicSignals = OFF_TOPIC_SIGNALS.some((signal) =>
    replyLower.includes(signal)
  );

  // If it has off-topic signals and no on-topic signals, it's out of context
  if (hasOffTopicSignals) {
    return true;
  }

  // Check if the reply is too short/generic (might be a refusal)
  if (
    reply.length < 30 &&
    (replyLower.includes("sorry") ||
      replyLower.includes("apologize") ||
      replyLower.includes("can't") ||
      replyLower.includes("cannot"))
  ) {
    return true;
  }

  return false;
}

// ── Chat Endpoint ────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message.trim() },
      ],
      options: {
        num_predict: 150, // max tokens to generate
        temperature: 0.7,
      },
      stream: false,
    });

    const reply = response.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ error: "Empty response from model." });
    }

    // ── Out-of-context safety net ─────────────────────────────────────────
    // If the model ignores the system prompt and answers off-topic anyway,
    // we detect it and override with the canonical fallback.
    const finalReply = isOutOfContext(reply) ? OUT_OF_CONTEXT_REPLY : reply;

    res.json({ reply: finalReply });
  } catch (err) {
    console.error("Ollama error:", err.message);

    if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
      return res
        .status(401)
        .json({ error: "Invalid Ollama API key. Check your OLLAMA_API_KEY." });
    }
    if (err.message?.includes("429") || err.message?.includes("rate limit")) {
      return res
        .status(429)
        .json({ error: "Ollama cloud rate limit reached. Try again shortly." });
    }
    if (err.message?.includes("404") || err.message?.includes("not found")) {
      return res.status(404).json({
        error: `Model "${MODEL}" not found. Check OLLAMA_MODEL in your .env.`,
      });
    }

    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_, res) =>
  res.json({ status: "ok", model: MODEL, provider: "ollama-cloud" })
);

app.listen(PORT, () =>
  console.log(
    `Server running on port ${PORT} | Model: ${MODEL} | Provider: Ollama Cloud`
  )
);
