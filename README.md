# AI-SUPPORT

Full-stack AI support chat application with a React + Vite frontend and a Hono + Prisma + PostgreSQL backend. The backend routes user messages to support, order, or billing agents and can stream responses over SSE.

## Repo Structure

- `frontend/` - React + TypeScript UI
- `backend/` - Hono API, Prisma ORM, PostgreSQL

## Prerequisites

- Node.js 18+ (recommended)
- npm (comes with Node)
- PostgreSQL 14+

## Frontend (first)

### Tech Stack

- React 19 + TypeScript
- Vite
- Material UI (MUI) + Emotion
- Zustand for state
- React Router

### Key Files

- `frontend/src/main.tsx` - App bootstrap
- `frontend/src/App.tsx` - Router provider
- `frontend/src/app/routes.tsx` - Route definitions
- `frontend/src/pages/chat/ChatPage.tsx` - Chat page entry
- `frontend/src/components/` - UI components (chat + layout)
- `frontend/src/store/` - Zustand stores
- `frontend/src/services/` - API calls + streaming helpers

### Environment Variables

Create `frontend/.env` if you want to override defaults:

```bash
VITE_API_BASE="http://localhost:8080/api"
VITE_HEALTH_URL="http://localhost:8080/api/health"
```

Defaults used if not set:

- `VITE_API_BASE` defaults to `/api`
- `VITE_HEALTH_URL` defaults to `/api/health`

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server starts on the Vite default (usually `http://localhost:5173`).

### Frontend Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - TypeScript build + Vite build
- `npm run lint` - ESLint
- `npm run preview` - Preview production build

## Backend (second)

### Tech Stack

- Hono (HTTP API)
- Prisma ORM
- PostgreSQL
- Hugging Face Router for LLM responses

### Key Files

- `backend/src/server.ts` - Server entry (port 8080)
- `backend/src/app.ts` - Hono app + route mounting
- `backend/src/routes/` - `chat`, `agents`, `health` routes
- `backend/src/controllers/` - Route handlers
- `backend/src/services/` - Agent logic + AI integration
- `backend/src/tools/` - Data access helpers
- `backend/src/data/faq.json` - FAQ data
- `backend/prisma/schema.prisma` - DB schema
- `backend/prisma/seed.ts` - DB seeding

### Environment Variables

Create `backend/.env`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_support"
HF_API_KEY="your_hf_key"
HF_MODEL="Qwen/Qwen3-Coder-Next:novita"
# Optional override
# HF_URL="https://router.huggingface.co/v1/chat/completions"
```

### Install & Run

```bash
cd backend
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Apply migrations (fresh DB):

```bash
npx prisma migrate dev --name init
```

Seed sample data:

```bash
npm run seed
```

Start the dev server:

```bash
npm run dev
```

Backend listens on `http://localhost:8080`.

### Backend Scripts

- `npm run dev` - Start API with nodemon
- `npm run build` - Compile TypeScript to `dist/`
- `npm run start` - Run compiled server
- `npm run seed` - Seed orders, invoices, conversations

## API Endpoints

Base URL: `http://localhost:8080`

- `GET /api/health`
  - DB connectivity check
  - Response: `{ "status": "ok", "db": "connected" }`

- `GET /api/agents`
  - Lists agent types and descriptions

- `GET /api/agents/:type/capabilities`
  - Returns tools used by the agent

- `POST /api/chat/messages`
  - Body: `{ "conversationId": "optional", "message": "..." }`
  - Response: `{ "conversationId": "<id>", "response": "<text>" }`

- `POST /api/chat/messages?stream=true` (SSE)
  - Accept header: `text/event-stream`
  - Events: `typing`, `message`, `done`

- `GET /api/chat/conversations`
  - Lists conversations (id/title/createdAt)

- `GET /api/chat/conversations/:id`
  - Returns conversation with messages

- `DELETE /api/chat/conversations/delete/:id`
  - Deletes conversation + messages

## Notes / Known Issues

- Frontend currently calls `DELETE /api/chat/conversations/:id`, but the backend route is `DELETE /api/chat/conversations/delete/:id`. Update one side to match if deletes fail.
- Streaming uses SSE and expects `event:` + `data:` lines, separated by blank lines.

## Typical Dev Flow

1. Start the backend (`npm run dev`) and confirm `GET /api/health`.
2. Start the frontend (`npm run dev`).
3. Chat in the UI; streaming responses appear in real time.
