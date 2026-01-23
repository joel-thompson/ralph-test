import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

const port = 3001
console.log(`[debug] Server starting on port ${port}`)
serve({
  fetch: app.fetch,
  port
})
console.log(`[debug] Server is running on http://localhost:${port}`)
