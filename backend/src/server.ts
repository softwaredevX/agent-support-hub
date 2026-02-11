// src/server.ts
import { serve } from "@hono/node-server";
import { app } from "./app";

const PORT = 8080;

serve({
  fetch: app.fetch,
  port: PORT,
},()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});

