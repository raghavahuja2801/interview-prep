import { Router } from 'express'
import Problem from '../models/Problem.js'
import Conversation from '../models/Conversation.js'
import { getInterviewerReply } from '../services/interviewer.js'

const router = Router()

// POST /api/chat — send a message in an interview
router.post('/', async (req, res) => {
  try {
    const { problemId, conversationId, message, history, event } = req.body

    if (!problemId) {
      return res.status(400).json({ error: 'problemId is required' })
    }

    const problem = await Problem.findOne({ id: problemId }).lean()
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    // --- Get or create the conversation ---
    let conversation

    if (event === 'start') {
      conversation = await Conversation.create({
        problemId,
        messages: [],
        startedAt: new Date(),
        lastActivityAt: new Date(),
      })
    } else if (conversationId) {
      conversation = await Conversation.findById(conversationId)
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' })
      }
    } else {
      return res.status(400).json({ error: 'conversationId is required for non-start events' })
    }

    // --- Persist the user message (if any) ---
    if (message) {
      conversation.messages.push({ role: 'user', content: message })
    }

    // --- Build the conversation history from stored messages (source of truth) ---
    // The stored messages include everything up to this point (user msg already pushed above)
    const storedHistory = conversation.messages
      .filter((m) => m.role !== 'system')
      .map(({ role, content }) => ({ role, content }))

    // --- Get AI reply using the DB-stored history, NOT the client-passed history ---
    const reply = await getInterviewerReply({
      problem,
      history: storedHistory.slice(0, -1), // exclude the just-pushed user message
      message: message || '',
    })

    // --- Persist the AI reply ---
    conversation.messages.push({ role: 'assistant', content: reply })
    conversation.lastActivityAt = new Date()
    await conversation.save()

    res.json({ reply, conversationId: conversation._id.toString() })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: err.message || 'Failed to get AI response' })
  }
})

export default router
