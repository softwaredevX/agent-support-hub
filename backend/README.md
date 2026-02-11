# AI Support Backend

TypeScript backend using Hono, Prisma, and PostgreSQL to route customer messages to support, order, or billing agents. Includes streaming AI responses, conversation persistence, and a static FAQ dataset.

**Status**: Local development only (no auth, no rate limiting).

## Requirements

- Node.js 18+ (recommended)
- PostgreSQL 14+
- npm (comes with Node)

## Project Structure

- `src/server.ts` - HTTP server entrypoint (port 8080)
- `src/app.ts` - Hono app wiring and route mounting
- `src/routes` - HTTP routes
- `src/controllers` - Request handlers
- `src/services` - Agent routing and agent implementations
- `src/tools` - Data access helpers (Prisma)
- `src/data/faq.json` - Static FAQ data
- `prisma/schema.prisma` - Database schema

## Setup (Step by Step)

1. Install dependencies.
   ```bash
   npm install
   ```

2. Create a PostgreSQL database.
   Example local setup:
   - Database name: `ai_support`
   - User: `postgres`
   - Password: `postgres`

3. Create a `.env` file at the project root.
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_support"
   HF_API_KEY="your_hf_key"
   HF_MODEL="Qwen/Qwen3-Coder-Next:novita"
   # Optional override
   # HF_URL="https://router.huggingface.co/v1/chat/completions"
   ```

4. Generate the Prisma client.
   ```bash
   npx prisma generate
   ```

5. Apply database migrations.
   If this is a fresh database, create the initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```

6. Start the dev server.
   ```bash
   npm run dev
   ```

7. Verify the server is running.
   The server listens on `http://localhost:8080`.

## API Endpoints

Base URL: `http://localhost:8080`

- `GET /api/health`
  - Checks DB connectivity.
  - Response: `{ "status": "ok", "db": "connected" }`

- `GET /api/agents`
  - Lists available agents with descriptions.
  - Response:
    ```json
    [
      { "type": "support", "description": "General support, FAQs, troubleshooting" },
      { "type": "order", "description": "Order status, tracking, modifications, cancellations" },
      { "type": "billing", "description": "Payments, refunds, invoices, subscriptions" }
    ]
    ```

- `GET /api/agents/:type/capabilities`
  - Example: `/api/agents/support/capabilities`
  - Response:
    ```json
    { "type": "support", "tools": ["conversation-history", "faq-search"] }
    ```

- `POST /api/chat/messages`
  - Body:
    ```json
    {
      "conversationId": "optional-existing-id",
      "message": "I need help with my order"
    }
    ```
  - Response:
    ```json
    {
      "conversationId": "<id>",
      "response": "<agent response>"
    }
    ```
  - Streaming (SSE):
    - `POST /api/chat/messages?stream=true`
    - Header: `Accept: text/event-stream`
    - Events: `typing`, `message`, `done`

- `   
  - Lists conversations.

- `GET /api/chat/conversations/:id`
  - Fetches conversation history.

- `DELETE /api/chat/conversations/:id`
  - Deletes a conversation and its messages.

## Notes

- The intent classifier is keyword-based (see `src/utils/intentClassifier.ts`).
- Agents fetch tool data (orders, invoices, conversation history, FAQ) and then generate responses via Hugging Face Router.
- Conversation messages are stored in PostgreSQL via Prisma models in `prisma/schema.prisma`.
- FAQ data lives in `src/data/faq.json`.

## Scripts

- `npm run dev` - Start with nodemon
- `npm run build` - Compile TypeScript to `dist/`
- `npm run start` - Run compiled server (`dist/server.js`)
- `npm run seed` - Seed sample orders, invoices, and conversations
