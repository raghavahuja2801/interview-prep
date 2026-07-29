import { Router } from 'express'
import Problem from '../models/Problem.js'
import Conversation from '../models/Conversation.js'
import { getEvaluation } from '../services/evaluator.js'
import { syncInterviewToNotion } from '../services/notion.js'

const router = Router()

// POST /api/evaluate — score a completed interview
router.post('/', async (req, res) => {
  try {
    const { conversationId } = req.body

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' })
    }

    const conversation = await Conversation.findById(conversationId).lean()
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    const problem = await Problem.findOne({ id: conversation.problemId }).lean()
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    const evaluation = await getEvaluation({
      problem,
      messages: conversation.messages || [],
    })

    // Extract score from the evaluation text (looks for "**X/10**" or "X/10")
    const scoreMatch = evaluation.match(/(\d+)\s*\/\s*10/)
    const score = scoreMatch ? Math.min(Math.max(parseInt(scoreMatch[1], 10), 0), 10) : null

    // Save evaluation and score on the conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        completed: true,
        evaluation,
        score,
        lastActivityAt: new Date(),
      },
    })

    // Sync to Notion (non-blocking — failures are logged, not returned)
    syncInterviewToNotion({
      problem,
      conversation: { score, evaluation, problemId: problem.id },
    })

    res.json({ evaluation, score })
  } catch (err) {
    console.error('Evaluation error:', err)
    res.status(500).json({ error: err.message || 'Failed to evaluate interview' })
  }
})

export default router
