# InsightAI

InsightAI is a modern, AI-powered news aggregator built with React (Vite), Node.js (Express) and the Google Gemini API. It provides a premium dark-mode UI, topic searching, and on-demand article summarization.

---

## Features

- AI-Powered Summaries: Generates concise 5–6 line summaries using the Google Gemini API.
- Premium UI/UX: Responsive dark-mode interface (black / yellow / gray) with Tailwind CSS, custom animations, and Lucide icons.
- Dynamic News Feeds: Fetches top headlines from NewsAPI.org by category (General, Tech, Sports, etc.).
- Dedicated BBC Source: Special category to fetch news directly from BBC.
- Powerful Search: `/api/search` endpoint for searching across millions of articles.
- Secure & Scalable: React frontend with an Express backend that stores API keys securely.

---

## Tech Stack

- Frontend: React (Vite), Tailwind CSS, lucide-react, @tailwindcss/typography, @tailwindcss/line-clamp
- Backend: Node.js, Express.js, NewsAPI.org, Google Gemini API
- Utilities: axios, cheerio, dotenv, cors

---

## Project Architecture

InsightAI uses a client-server model:

- React Client (frontend) — no direct calls to external news or AI APIs.
- Node Server (backend) — holds secret API keys and communicates with NewsAPI.org and Google Gemini API.

Data flows:

1. Fetching news:
   React → Node Server (/api/news) → NewsAPI.org → Node Server → React
2. Generating an AI summary:
   React (article URL) → Node Server (/api/summarize) → Cheerio scrape → Gemini API → Node Server → React

---

## Prerequisites

- Node.js v18+ (recommended)
- npm (comes with Node.js)

---

## Mandatory: API Key Configuration

Create a `.env` file in the server folder before running the project.

Example `/server/.env`:

```env
# /server/.env
NEWSAPI_API_KEY=YOUR_NEWSAPI_KEY_HERE
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

Get keys from:

- NewsAPI: https://newsapi.org/
- Google Gemini: https://aistudio.google.com/ (or your Gemini provider)

---

## Installation & Launch

You need two terminals to run backend and frontend simultaneously.

Terminal 1 — Backend (Server)

1. Clone the repository and enter the project root:

   - git clone https://github.com/your-username/insight-ai.git
   - cd insight-ai

2. Start backend:

   - cd server
   - npm install
   - (create `/server/.env` as above)
   - node server.js

   Backend runs on: http://localhost:8000

Terminal 2 — Frontend (Client)

1. In a new terminal:

   - cd insight-ai
   - cd client (or `frontend` if your folder is named that)

2. Install and start frontend:

   - npm install
   - npm install lucide-react
   - npm install -D @tailwindcss/typography @tailwindcss/line-clamp tailwind-scrollbar-hide
   - npm run dev

   Frontend runs on: http://localhost:5173

---

## Backend API Endpoints

- GET /api/news

  - Fetches top headlines.
  - Query: `?category=<string>`
  - Example: `/api/news?category=technology`
  - Special: `?category=bbc` fetches from `bbc-news` source.

- GET /api/search

  - Searches NewsAPI articles.
  - Query: `?q=<string>`
  - Example: `/api/search?q=tesla`

- POST /api/summarize
  - Generates an AI summary for a provided article URL.
  - Request body (JSON):
    {
    "url": "https://www.example.com/article-to-summarize"
    }
  - Success response (JSON):
    {
    "summary": "This is the 5-6 line summary from the AI..."
    }
  - Error response (JSON):
    {
    "message": "Failed to extract article text."
    }

---

## Notes

- Ensure API keys are set in `/server/.env` before starting the backend.
- Adjust folder names (`client` vs `frontend`) in commands to match your repository layout.
- For development, keep backend and frontend running in separate terminals.

---
