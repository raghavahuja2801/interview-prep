import { Router } from 'express'
import Problem from '../models/Problem.js'
import { cacheGet, cacheSet } from '../services/redis.js'

const router = Router()

// Cache key per category filter so HLD and LLD lists are cached separately.
// TTL is 2 days: problems change rarely, and the seed flush clears the cache
// immediately when new data is pushed.
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 2 // 2 days
function listCacheKey(category) {
  return category ? `problems:list:${category}` : 'problems:list:all'
}

// GET /api/problems — list all problems, optional ?category=HLD|LLD
router.get('/', async (req, res) => {
  try {
    const category = req.query.category
    const cacheKey = listCacheKey(category)

    const cached = await cacheGet(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    const filter = {}
    if (category) {
      filter.category = category
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

    await cacheSet(cacheKey, problems, CACHE_TTL_SECONDS)
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
