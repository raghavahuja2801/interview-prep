import { Router } from 'express'
import Conversation from '../models/Conversation.js'

const router = Router()

// GET /api/conversations?problemId=xxx — list past conversations (summary)
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.problemId) {
      filter.problemId = req.query.problemId
    }
    const conversations = await Conversation.find(filter)
      .select('problemId completed score startedAt lastActivityAt')
      .sort({ lastActivityAt: -1 })
      .lean()
    res.json(conversations)
  } catch (err) {
    console.error('Error listing conversations:', err)
    res.status(500).json({ error: 'Failed to list conversations' })
  }
})

// GET /api/conversations/:id — full conversation with messages
router.get('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).lean()
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }
    res.json(conversation)
  } catch (err) {
    console.error('Error fetching conversation:', err)
    res.status(500).json({ error: 'Failed to fetch conversation' })
  }
})

// PATCH /api/conversations/:id — mark as completed, etc.
router.patch('/:id', async (req, res) => {
  try {
    const updates = {}
    if (typeof req.body.completed === 'boolean') {
      updates.completed = req.body.completed
    }
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, select: 'problemId completed startedAt lastActivityAt' }
    ).lean()
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }
    res.json(conversation)
  } catch (err) {
    console.error('Error updating conversation:', err)
    res.status(500).json({ error: 'Failed to update conversation' })
  }
})

// DELETE /api/conversations/:id
router.delete('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id).lean()
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }
    res.json({ deleted: true })
  } catch (err) {
    console.error('Error deleting conversation:', err)
    res.status(500).json({ error: 'Failed to delete conversation' })
  }
})

export default router
