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

/**
 * Parse a single SSE frame from a buffer split into lines.
 * Handles the `event:` and `data:` fields; blank line terminates a frame.
 *
 * The caller strips the trailing blank line before invoking this (frames are
 * split on `\n\n`), so we must also flush any accumulated frame once the chunk
 * is exhausted — relying only on the empty line would drop every event.
 */
export function parseSseChunk(chunk) {
  const events = []
  let currentEvent = 'message'
  let dataLines = []

  const pushFrame = () => {
    if (dataLines.length > 0) {
      const data = dataLines.join('\n')
      events.push({ event: currentEvent, data })
    }
    currentEvent = 'message'
    dataLines = []
  }

  const lines = chunk.split('\n')
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line === '') {
      pushFrame()
    } else if (line.startsWith('event:')) {
      currentEvent = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  }

  // Flush the last frame (no trailing blank line in the chunk).
  pushFrame()

  return events
}

/**
 * Reads a `/api/chat` SSE response body and invokes frame handlers.
 * Shared by `streamChatMessage` and the diagram message path.
 *
 * @param {Response} res - fetch response whose body is text/event-stream
 * @param {Object} [handlers] - onMeta/onText/onAudio/onDone/onError callbacks
 * @param {AbortSignal} [signal]
 * @returns {Promise<{reply: string, conversationId: string, diagram: Object|null}>}
 */
export async function consumeChatStream(res, handlers = {}, signal) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const result = { reply: '', conversationId: null, diagram: null }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Feed complete frames (ending in a blank line) to the parser.
      let idx
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)
        for (const { event: evtName, data } of parseSseChunk(frame)) {
          if (evtName === 'meta') {
            const parsed = JSON.parse(data)
            result.conversationId = parsed.conversationId
            result.diagram = parsed.diagram || null
            handlers.onMeta?.(parsed)
          } else if (evtName === 'text') {
            const parsed = JSON.parse(data)
            result.reply += parsed.delta || ''
            handlers.onText?.(parsed.delta || '')
          } else if (evtName === 'audio') {
            const parsed = JSON.parse(data)
            handlers.onAudio?.(parsed)
          } else if (evtName === 'done') {
            const parsed = JSON.parse(data)
            result.reply = parsed.reply ?? result.reply
            result.conversationId = parsed.conversationId ?? result.conversationId
            handlers.onDone?.(parsed)
          } else if (evtName === 'error') {
            const parsed = JSON.parse(data)
            throw new Error(parsed.error || 'Chat stream failed')
          }
        }
      }
    }
  } catch (err) {
    if (signal?.aborted || err?.name === 'AbortError') {
      throw new Error('aborted')
    }
    throw err
  }

  return result
}

/**
 * Streams an interview chat message over Server-Sent Events.
 *
 * The backend emits frames in order:
 *   - `meta`  -> { conversationId, diagram }
 *   - `text`  -> { delta } repeated as the reply types out
 *   - `audio` -> { base64, mimeType } when audio is enabled
 *   - `done`  -> { reply, conversationId }
 *   - `error` -> { error }
 *
 * @param {Object} params
 * @param {string} params.problemId
 * @param {string} [params.conversationId]
 * @param {string} params.message
 * @param {Array} [params.history]
 * @param {'start'|'message'} params.event
 * @param {boolean} [params.audioEnabled]
 * @param {Object} [params.handlers] - onMeta/onText/onAudio/onError/onDone callbacks
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<{reply: string, conversationId: string, diagram: Object|null}>}
 */
export async function streamChatMessage({
  problemId,
  conversationId,
  message,
  history,
  event,
  audioEnabled = false,
  handlers = {},
  signal,
}) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      event,
      problemId,
      conversationId,
      message,
      history,
      audioEnabled,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Chat API responded with ${res.status}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('text/event-stream')) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Chat API did not return a stream')
  }

  return consumeChatStream(res, handlers, signal)
}
