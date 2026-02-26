# 🚀 Rabita Amin — Portfolio Chatbot

A production-ready portfolio website with an AI-powered chatbot, built with React + Vite (frontend) and Node.js + Express (backend), powered by OpenAI GPT-3.5-turbo.

---

## 📁 Project Structure

```
portfolio-chatbot/
├── frontend/          # React + Vite + TailwindCSS + Framer Motion
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWidget.jsx      # Main chat panel
│   │   │   ├── ChatIcon.jsx        # Floating button
│   │   │   ├── MessageBubble.jsx   # Message display
│   │   │   └── TypingIndicator.jsx # Animated dots
│   │   ├── App.jsx                 # Landing page
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
└── backend/
    ├── server.js      # Express API + OpenAI
    ├── package.json
    ├── .env           # ← Add your API key here
    └── render.yaml    # Render deployment config
```

---

## ⚡ Quick Start

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Set up environment variables

In `backend/.env`:

```
OPENAI_API_KEY=sk-your-openai-api-key-here
FRONTEND_URL=http://localhost:5173
PORT=3001
```

In `frontend/.env.local` (for production deployment):

```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

### 3. Run locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open: http://localhost:5173

---

## 🌐 Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Connect the repo on [render.com](https://render.com)
3. Set environment variables: `OPENAI_API_KEY`, `FRONTEND_URL`
4. Deploy

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Import on [vercel.com](https://vercel.com)
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

---

## 🤖 Chatbot Capabilities

The bot answers questions about Rabita's:

- ✅ Current role and experience
- ✅ Skills and tech stack
- ✅ Notable projects (SWAPIverse, Image Processor, LearnWave)
- ✅ Education background
- ✅ Contact information

Politely refuses off-topic questions (weather, jokes, etc.)

---

## 🛡️ Rate Limiting

10 requests per minute per IP address. Returns a 429 status with a descriptive error message when exceeded.
