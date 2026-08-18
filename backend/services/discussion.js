import { WebSocketServer, WebSocket } from 'ws'
import Redis from 'ioredis'
import { getAuthenticatedUser } from './auth.js'
import { pool } from './postgres.js'

// ---------------------------------------------------------------------------
// Per-problem discussion chat.
//
// Storage split (per requirements):
//   - PostgreSQL  → durable chat history (chat_messages) + presence snapshot
//   - Redis       → real-time fan-out (PUBLISH/SUBSCRIBE) + live online zset
//
// Every backend instance maintains its own Map<ws, { userId }> of locally
// connected sockets and delivers only to *its* connections; cross-instance
// fan-out happens over Redis pub/sub (each instance subscribes to every
// problem channel it has seen via SUBSCRIBE ... problem:*:chat).
//
// Online users are tracked in a Redis sorted set keyed by timestamp per
// problem. A periodic sweeper prunes stale members (> ONLINE_TTL_MS) so a
// dropped socket or crashed backend never leaves a phantom online user.
// ---------------------------------------------------------------------------

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const ONLINE_TTL_MS = 60 * 1000 // a heartbeat is considered stale after 60s
const SWEEP_INTERVAL_MS = 30 * 1000
const HEARTBEAT_INTERVAL_MS = 30 * 1000

const CHANNEL_PREFIX = 'problem:'
const SUFFIX_CHAT = ':chat'
const SUFFIX_PRESENCE = ':presence'
const SUFFIX_TYPING = ':typing'
const ZSET_SUFFIX = ':online'

// Problem id -> WebSocket.Server. One server per problem, attached to the
// same HTTP server under a unique path so the single shared WebSocketServer
// can route by URL.
const problemServers = new Map()
const socketsByProblem = new Map() // problemId -> Set<ws>

// Problem id -> { timer, count } heartbeat ping timer per WebSocket.Server.
const serverTimers = new Map()

// Redis pub/sub (duplex): a single subscriber receives chat/presence/typing
// broadcasts; the publisher is lazily created per publish so a short-lived
// instance that never publishes still works.
let sub = null
let pub = null

function chatChannel(problemId) {
  return `${CHANNEL_PREFIX}${problemId}${SUFFIX_CHAT}`
}
function presenceChannel(problemId) {
  return `${CHANNEL_PREFIX}${problemId}${SUFFIX_PRESENCE}`
}
function typingChannel(problemId) {
  return `${CHANNEL_PREFIX}${problemId}${SUFFIX_TYPING}`
}
function onlineKey(problemId) {
  return `${CHANNEL_PREFIX}${problemId}${ZSET_SUFFIX}`
}

function getPub() {
  if (!pub) {
    pub = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 })
    pub.connect().catch((err) => {
      console.warn('Discussion Redis publisher connect error:', err.message)
    })
  }
  return pub
}

function ensureSubscribed(problemId) {
  if (!sub) {
    sub = new Redis(REDIS_URL, { lazyConnect: true })
    sub.on('message', onRedisMessage)
    sub.connect().catch((err) => {
      console.warn('Discussion Redis subscriber connect error:', err.message)
    })
  }

  // ioredis subscribes are idempotent; keep the set so we can re-subscribe
  // after a reconnect.
  sub.subscribe(chatChannel(problemId), presenceChannel(problemId), typingChannel(problemId)).catch((err) => {
    console.warn(`Discussion subscribe ${problemId} error:`, err.message)
  })
}

function onRedisMessage(_channel, message) {
  let event
  try {
    event = JSON.parse(message)
  } catch {
    return
  }

  const { type, problemId } = event
  if (!type || !problemId) return

  const sockets = socketsByProblem.get(problemId)
  if (!sockets) return

  const payload = JSON.stringify(event)
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload)
    }
  }
}

function addSocket(problemId, ws) {
  if (!socketsByProblem.has(problemId)) {
    socketsByProblem.set(problemId, new Set())
  }
  socketsByProblem.get(problemId).add(ws)
}

function removeSocket(problemId, ws) {
  const sockets = socketsByProblem.get(problemId)
  if (!sockets) return
  sockets.delete(ws)
  if (sockets.size === 0) {
    socketsByProblem.delete(problemId)
    const timer = serverTimers.get(problemId)
    if (timer) {
      clearInterval(timer)
      serverTimers.delete(problemId)
    }
  }
}

// Presence helpers -----------------------------------------------------------

async function refreshPresence(problemId, user) {
  const now = Date.now()

  await Promise.allSettled([
    getPub().zadd(onlineKey(problemId), now, user.id),
    pool.query(
      `
        INSERT INTO problem_presence (problem_id, user_id, display_name, last_seen)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (problem_id, user_id)
        DO UPDATE SET display_name = EXCLUDED.display_name, last_seen = NOW()
      `,
      [problemId, user.id, user.displayName || user.email || null]
    ),
  ])
}

async function clearPresence(problemId, userId) {
  await Promise.allSettled([
    getPub().zrem(onlineKey(problemId), userId),
    pool.query(
      `DELETE FROM problem_presence WHERE problem_id = $1 AND user_id = $2`,
      [problemId, userId]
    ),
  ])
}

async function sweepPresence(problemId) {
  const cutoff = Date.now() - ONLINE_TTL_MS
  const stale = await getPub().zrangebyscore(onlineKey(problemId), '-inf', cutoff)

  if (stale.length > 0) {
    await getPub().zrem(onlineKey(problemId), ...stale)
    await Promise.allSettled(
      stale.map((userId) =>
        pool.query(
          `DELETE FROM problem_presence WHERE problem_id = $1 AND user_id = $2`,
          [problemId, userId]
        )
      )
    )
  }
}

function buildPresenceEvent(type, problemId, user) {
  return {
    type,
    problemId,
    userId: user.id,
    displayName: user.displayName || user.email || 'Anonymous',
    ts: Date.now(),
  }
}

function broadcastPresence(problemId, event) {
  getPub().publish(presenceChannel(problemId), JSON.stringify(event)).catch(() => {})
}

// REST-backed helpers (used by routes/discussion.js) -------------------------

export async function listMessages(problemId, { limit = 200 } = {}) {
  const result = await pool.query(
    `
      SELECT
        id,
        user_id AS "userId",
        display_name AS "displayName",
        body,
        created_at AS "createdAt"
      FROM chat_messages
      WHERE problem_id = $1
      ORDER BY created_at ASC, id ASC
      LIMIT $2
    `,
    [problemId, Math.min(Math.max(Number(limit) || 200, 1), 1000)]
  )
  return result.rows
}

export async function saveMessage({ problemId, user, body }) {
  const result = await pool.query(
    `
      INSERT INTO chat_messages (problem_id, user_id, display_name, body)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        user_id AS "userId",
        display_name AS "displayName",
        body,
        created_at AS "createdAt"
    `,
    [problemId, user.id, user.displayName || user.email || null, body]
  )
  return result.rows[0]
}

export async function publishMessage(problemId, message) {
  const event = {
    type: 'message',
    problemId,
    message,
    ts: Date.now(),
  }
  await getPub().publish(chatChannel(problemId), JSON.stringify(event))
}

export async function markTyping(problemId, user) {
  const event = {
    type: 'typing',
    problemId,
    userId: user.id,
    displayName: user.displayName || user.email || 'Anonymous',
    ts: Date.now(),
  }
  await getPub().publish(typingChannel(problemId), JSON.stringify(event))
}

export async function getOnlineUsers(problemId) {
  await sweepPresence(problemId)
  const ids = await getPub().zrange(onlineKey(problemId), 0, -1)
  if (ids.length === 0) return []

  const result = await pool.query(
    `
      SELECT user_id AS "userId", display_name AS "displayName"
      FROM problem_presence
      WHERE problem_id = $1 AND user_id = ANY($2::text[])
    `,
    [problemId, ids]
  )
  return result.rows
}

// WebSocket hub --------------------------------------------------------------

export function initDiscussionHub(server) {
  const wss = new WebSocketServer({ noServer: true })
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost')
    const match = url.pathname.match(/^\/ws\/discussion\/([^/]+)\/?$/)
    if (!match) return ws.close(4000, 'Invalid discussion path')

    const problemId = decodeURIComponent(match[1])

    getAuthenticatedUser(req)
      .then((user) => {
        if (!user) {
          ws.close(4001, 'Authentication required')
          return
        }

        const sockets = socketsByProblem.get(problemId)
        if (sockets && sockets.size >= 4) {
          ws.close(4002, 'Discussion is full')
          return
        }

        ws.problemId = problemId
        ws.userId = user.id
        addSocket(problemId, ws)

        // Make sure this instance is subscribed to the problem's channels.
        ensureSubscribed(problemId)

        // Register this user as online and announce the join to peers.
        refreshPresence(problemId, user).catch(() => {})
        broadcastPresence(problemId, buildPresenceEvent('join', problemId, user))

        // Heartbeat so dropped TCP connections (proxies, sleep) get pruned.
        if (!serverTimers.has(problemId)) {
          serverTimers.set(
            problemId,
            setInterval(() => {
              sweepPresence(problemId).catch(() => {})
              for (const sock of socketsByProblem.get(problemId) || []) {
                if (sock.readyState === WebSocket.OPEN && !sock.isAlive) {
                  sock.terminate()
                } else if (sock.readyState === WebSocket.OPEN) {
                  sock.isAlive = false
                  sock.ping()
                }
              }
            }, HEARTBEAT_INTERVAL_MS)
          )
        }
        ws.isAlive = true
        ws.on('pong', () => {
          ws.isAlive = true
        })

        // Broadcast the current online list so newly-joined clients can render
        // presence without a round-trip.
        getOnlineUsers(problemId)
          .then((online) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'presence:init',
                  problemId,
                  online: online.map((u) => ({
                    userId: u.userId,
                    displayName: u.displayName || u.userId,
                  })),
                })
              )
            }
          })
          .catch(() => {})

        ws.on('close', () => {
          removeSocket(problemId, ws)
          clearPresence(problemId, ws.userId).catch(() => {})
          broadcastPresence(
            problemId,
            buildPresenceEvent('leave', problemId, {
              id: ws.userId,
              displayName: ws.displayName || 'Anonymous',
              email: '',
            })
          )
        })
      })
      .catch(() => ws.close(4001, 'Authentication required'))
  })

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url, 'http://localhost')
    const match = url.pathname.match(/^\/ws\/discussion\/([^/]+)\/?$/)
    if (!match) {
      socket.destroy()
      return
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req)
    })
  })

  return wss
}
