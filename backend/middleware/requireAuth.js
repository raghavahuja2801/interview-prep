import { getAuthenticatedUser } from '../services/auth.js'

export default async function requireAuth(req, res, next) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('Auth lookup error:', err)
    res.status(500).json({ error: 'Failed to verify session' })
  }
}