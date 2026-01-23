import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/math/add", async (c) => {
  const body = await c.req.json();
  const { a, b } = body;

  if (typeof a !== "number" || typeof b !== "number") {
    return c.json({ error: "Invalid input: both 'a' and 'b' must be numbers" }, 400);
  }

  const result = a + b;
  return c.json({ operation: "add", a, b, result });
});

app.post("/math/subtract", async (c) => {
  const body = await c.req.json();
  const { a, b } = body;

  if (typeof a !== "number" || typeof b !== "number") {
    return c.json({ error: "Invalid input: both 'a' and 'b' must be numbers" }, 400);
  }

  const result = a - b;
  return c.json({ operation: "subtract", a, b, result });
});

app.post("/math/multiply", async (c) => {
  const body = await c.req.json();
  const { a, b } = body;

  if (typeof a !== "number" || typeof b !== "number") {
    return c.json({ error: "Invalid input: both 'a' and 'b' must be numbers" }, 400);
  }

  const result = a * b;
  return c.json({ operation: "multiply", a, b, result });
});

app.post("/math/divide", async (c) => {
  const body = await c.req.json();
  const { a, b } = body;

  if (typeof a !== "number" || typeof b !== "number") {
    return c.json({ error: "Invalid input: both 'a' and 'b' must be numbers" }, 400);
  }

  if (b === 0) {
    return c.json({ error: "Division by zero is not allowed" }, 400);
  }

  const result = a / b;
  return c.json({ operation: "divide", a, b, result });
});

app.post("/math/power", async (c) => {
  const body = await c.req.json();
  const { base, exponent } = body;

  if (typeof base !== "number" || typeof exponent !== "number") {
    return c.json({ error: "Invalid input: both 'base' and 'exponent' must be numbers" }, 400);
  }

  const result = Math.pow(base, exponent);
  return c.json({ operation: "power", base, exponent, result });
});

const port = 3002;
console.log(`[debug] Server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
