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
    // Custom sort: Easy → Medium → Hard, then by id within each
    const SORT_ORDER = { Easy: 1, Medium: 2, Hard: 3 }
    const problems = await Problem.find(filter).lean()
    problems.sort((a, b) => {
      const da = SORT_ORDER[a.difficulty] || 99
      const db = SORT_ORDER[b.difficulty] || 99
      if (da !== db) return da - db
      return a.id.localeCompare(b.id)
    })
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
