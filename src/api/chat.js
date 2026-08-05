const API_BASE = import.meta.env.VITE_API_URL || '/api'

/**
 * @param {Object} params
 * @param {string} params.problemId
 * @param {string} [params.conversationId] - existing conversation to continue (undefined for new)
 * @param {string} params.message - the latest user message ("" for the opening kickoff)
 * @param {Array<{role: 'user'|'assistant', content: string}>} params.history - prior turns, oldest first
 * @param {'start'|'message'} params.event
 * @returns {Promise<{reply: string, conversationId: string}>}
 */
export async function sendChatMessage({ problemId, conversationId, message, history, event }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      problemId,
      conversationId,
      message,
      history,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Chat API responded with ${res.status}`)
  }

  return res.json()
}
