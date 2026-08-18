import { Router } from 'express'
import requireAuth from '../middleware/requireAuth.js'
import {
  listMessages,
  saveMessage,
  publishMessage,
  markTyping,
  getOnlineUsers,
} from '../services/discussion.js'

const router = Router()
router.use(requireAuth)

// GET /api/discussion/:problemId/messages?limit=200
// Persistent chat history for a problem, oldest first.
router.get('/:problemId/messages', async (req, res) => {
  try {
    const messages = await listMessages(req.params.problemId, { limit: req.query.limit })
    return res.json({ messages })
  } catch (err) {
    console.error('Discussion history error:', err)
    return res.status(500).json({ error: 'Failed to load discussion history' })
  }
})

// POST /api/discussion/:problemId/messages
// Body: { body }
// Persists the message to Postgres, then publishes it to Redis so every
// backend instance (and every connected client) receives it in real time.
router.post('/:problemId/messages', async (req, res) => {
  const body = String(req.body?.body || '').trim()
  if (!body) {
    return res.status(400).json({ error: 'message body is required' })
  }
  if (body.length > 2000) {
    return res.status(400).json({ error: 'message must be 2000 characters or fewer' })
  }

  try {
    const message = await saveMessage({ problemId: req.params.problemId, user: req.user, body })
    await publishMessage(req.params.problemId, message)
    return res.status(201).json({ message })
  } catch (err) {
    console.error('Discussion send error:', err)
    return res.status(500).json({ error: 'Failed to send message' })
  }
})

// GET /api/discussion/:problemId/online
// Current online users for a problem (from the Redis presence zset).
router.get('/:problemId/online', async (req, res) => {
  try {
    const online = await getOnlineUsers(req.params.problemId)
    return res.json({ online })
  } catch (err) {
    console.error('Discussion online error:', err)
    return res.status(500).json({ error: 'Failed to load online users' })
  }
})

// POST /api/discussion/:problemId/typing
// Lightweight "someone is typing" signal, fanned out via Redis.
router.post('/:problemId/typing', async (req, res) => {
  try {
    await markTyping(req.params.problemId, req.user)
    return res.json({ ok: true })
  } catch (err) {
    console.error('Discussion typing error:', err)
    return res.status(500).json({ error: 'Failed to send typing indicator' })
  }
})

export default router
