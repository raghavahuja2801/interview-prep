import { Router } from 'express'
import Conversation from '../models/Conversation.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

router.use(requireAuth)

// POST /api/conversations — create a new conversation
router.post('/', async (req, res) => {
  try {
    const { problemId } = req.body
    if (!problemId) {
      return res.status(400).json({ error: 'problemId is required' })
    }
    const conversation = await Conversation.create({
      ownerUserId: req.user.id,
      problemId,
      messages: [],
      diagrams: [],
      startedAt: new Date(),
      lastActivityAt: new Date(),
    })
    res.status(201).json(conversation)
  } catch (err) {
    console.error('Error creating conversation:', err)
    res.status(500).json({ error: 'Failed to create conversation' })
  }
})

// GET /api/conversations?problemId=xxx — list past conversations (summary)
router.get('/', async (req, res) => {
  try {
    const filter = {}
    filter.ownerUserId = req.user.id
    if (req.query.problemId) {
      filter.problemId = req.query.problemId
    }
    const conversations = await Conversation.find(filter)
      .select('problemId completed score startedAt lastActivityAt durationSeconds totalPausedSeconds')
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
    const conversation = await Conversation.findOne({ _id: req.params.id, ownerUserId: req.user.id }).lean()
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }
    res.json(conversation)
  } catch (err) {
    console.error('Error fetching conversation:', err)
    res.status(500).json({ error: 'Failed to fetch conversation' })
  }
})

// PATCH /api/conversations/:id — mark as completed, update duration, etc.
router.patch('/:id', async (req, res) => {
  try {
    const updates = {}
    if (typeof req.body.completed === 'boolean') {
      updates.completed = req.body.completed
    }
    if (typeof req.body.durationSeconds === 'number') {
      updates.durationSeconds = req.body.durationSeconds
    }
    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, ownerUserId: req.user.id },
      { $set: updates },
      { new: true, select: 'problemId completed durationSeconds startedAt lastActivityAt' }
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
    const conversation = await Conversation.findOneAndDelete({ _id: req.params.id, ownerUserId: req.user.id }).lean()
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
