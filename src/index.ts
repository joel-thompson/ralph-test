import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.post('/math/add', async (c) => {
  const body = await c.req.json()
  const { a, b } = body

  if (typeof a !== 'number' || typeof b !== 'number') {
    return c.json({ error: 'Invalid input: both a and b must be numbers' }, 400)
  }

  const result = a + b
  return c.json({ result })
})

app.post('/math/subtract', async (c) => {
  const body = await c.req.json()
  const { a, b } = body

  if (typeof a !== 'number' || typeof b !== 'number') {
    return c.json({ error: 'Invalid input: both a and b must be numbers' }, 400)
  }

  const result = a - b
  return c.json({ result })
})

app.post('/math/multiply', async (c) => {
  const body = await c.req.json()
  const { a, b } = body

  if (typeof a !== 'number' || typeof b !== 'number') {
    return c.json({ error: 'Invalid input: both a and b must be numbers' }, 400)
  }

  const result = a * b
  return c.json({ result })
})

const port = 3001
console.log(`[debug] Server starting on port ${port}`)
serve({
  fetch: app.fetch,
  port
})
console.log(`[debug] Server is running on http://localhost:${port}`)
