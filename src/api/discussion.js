const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function fetchDiscussionMessages(problemId, { limit = 200 } = {}) {
  const res = await fetch(`${API_BASE}/discussion/${encodeURIComponent(problemId)}/messages?limit=${limit}`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to load discussion: ${res.status}`)
  }

  return res.json()
}

export async function sendDiscussionMessage(problemId, body) {
  const res = await fetch(`${API_BASE}/discussion/${encodeURIComponent(problemId)}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to send message: ${res.status}`)
  }

  return res.json()
}

export async function fetchOnlineUsers(problemId) {
  const res = await fetch(`${API_BASE}/discussion/${encodeURIComponent(problemId)}/online`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to load online users: ${res.status}`)
  }

  return res.json()
}

export async function notifyTyping(problemId) {
  const res = await fetch(`${API_BASE}/discussion/${encodeURIComponent(problemId)}/typing`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) return
}

/**
 * WebSocket URL for a problem's discussion channel.
 * The dev server proxies /ws to the backend (see vite.config.js); in
 * production the ingress/nginx route /ws the same way.
 */
export function getDiscussionSocketUrl(problemId) {
  const base = import.meta.env.VITE_WS_URL || ''
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = base || window.location.host
  return `${protocol}//${host}/ws/discussion/${encodeURIComponent(problemId)}`
}
