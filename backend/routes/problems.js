import { Router } from 'express'
import Problem from '../models/Problem.js'

const router = Router()

// GET /api/problems — list all problems, optional ?category=HLD|LLD
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.category) {
      filter.category = req.query.category
    }
    const problems = await Problem.find(filter).sort({ difficulty: 1, id: 1 }).lean()
    res.json(problems)
  } catch (err) {
    console.error('Error fetching problems:', err)
    res.status(500).json({ error: 'Failed to fetch problems' })
  }
})

// GET /api/problems/:id — single problem by slug id
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findOne({ id: req.params.id }).lean()
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }
    res.json(problem)
  } catch (err) {
    console.error('Error fetching problem:', err)
    res.status(500).json({ error: 'Failed to fetch problem' })
  }
})

export default router
