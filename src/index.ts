import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

const port = 3001;
console.log(`[debug] Server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
