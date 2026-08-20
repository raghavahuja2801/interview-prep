import Redis from 'ioredis'

// ---------------------------------------------------------------------------
// Shared Redis client + small helpers used by the problems cache and the
// chat rate limiter. The discussion chat (services/discussion.js) keeps its
// own pub/sub clients; this module owns the plain get/set/INCR client.
//
// Redis is intentionally optional at runtime: if it is unreachable, the cache
// degrades to a no-op (always a miss) and the rate limiter fails open, so a
// Redis outage never takes down problem listing or chat.
// ---------------------------------------------------------------------------

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

const client = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
})

client.on('error', (err) => {
  console.warn('Redis client error:', err.message)
})

// Best-effort connect on import; failures are non-fatal.
client.connect().catch((err) => {
  console.warn('Redis connect skipped:', err.message)
})

/**
 * Read a cached value. Returns parsed JSON or null on miss / failure.
 */
export async function cacheGet(key) {
  try {
    const raw = await client.get(key)
    if (raw == null) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Store a value with a TTL (seconds). Failures are non-fatal.
 */
export async function cacheSet(key, value, ttlSeconds) {
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    // Cache unavailable — skip.
  }
}

/**
 * Flush a single cache key (used on re-seed so new data is visible).
 */
export async function cacheDel(key) {
  try {
    await client.del(key)
  } catch {
    // Cache unavailable — skip.
  }
}

// Rate limiting --------------------------------------------------------------

/**
 * Fixed-window per-user rate limiter.
 *
 * Uses INCR + EXPIRE: the first request in a window creates the key with a
 * TTL, every request increments it, and once the count exceeds `limit` the
 * user is blocked until the window rolls over.
 *
 * Fails open: if Redis is unreachable, requests are allowed through rather
 * than being blocked by a broken limiter.
 *
 * Returns { allowed, remaining, retryAfterSeconds }.
 */
export async function rateLimit({ key, limit, windowSeconds }) {
  try {
    const current = await client.incr(key)
    if (current === 1) {
      // First hit in this window — start the clock.
      await client.expire(key, windowSeconds)
    }

    const remaining = Math.max(0, limit - current)
    if (current > limit) {
      const ttl = await client.ttl(key)
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
      }
    }

    return { allowed: true, remaining, retryAfterSeconds: 0 }
  } catch {
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 }
  }
}

export default client
