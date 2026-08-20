import { Router } from 'express'
import Problem from '../models/Problem.js'
import Conversation from '../models/Conversation.js'
import { streamInterviewerReply } from '../services/interviewer.js'
import { synthesizeReply, splitIntoSentences } from '../services/tts.js'
import { renderSvg, renderPng } from '../services/plantuml.js'
import { storeDiagram } from '../services/minio.js'
import crypto from 'crypto'
import requireAuth from '../middleware/requireAuth.js'
import { rateLimit } from '../services/redis.js'

const router = Router()

router.use(requireAuth)

// Per-user chat rate limit (configurable via env, defaults below).
// A fixed window of N chat requests per W seconds, keyed by user id so one
// user hammering the LLM can't burn through the DeepSeek budget for everyone.
const CHAT_RATE_LIMIT = Number(process.env.CHAT_RATE_LIMIT || 20)
const CHAT_RATE_WINDOW_SECONDS = Number(process.env.CHAT_RATE_WINDOW_SECONDS || 600) // 10 min

router.post('/', async (req, res) => {
  // Enforce the per-user rate limit before doing any LLM work.
  const limit = await rateLimit({
    key: `chat:rl:${req.user.id}`,
    limit: CHAT_RATE_LIMIT,
    windowSeconds: CHAT_RATE_WINDOW_SECONDS,
  })
  if (!limit.allowed) {
    res.set('Retry-After', String(limit.retryAfterSeconds))
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait before continuing your interview.',
      retryAfterSeconds: limit.retryAfterSeconds,
    })
  }

  // Abort the upstream DeepSeek fetch if the client disconnects mid-stream.
  const controller = new AbortController()
  const onClose = () => controller.abort()
  req.on('close', onClose)

// Write a single SSE frame: `event: <name>\ndata: <json>\n\n`
function sseWrite(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

  try {
    const { problemId, conversationId, message, history, event, diagram, audioEnabled } = req.body

    if (!problemId) {
      return res.status(400).json({ error: 'problemId is required' })
    }

    const problem = await Problem.findOne({ id: problemId }).lean()
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }

    // --- Get or create the conversation ---
    let conversation

    if (event === 'start') {
      conversation = await Conversation.create({
        ownerUserId: req.user.id,
        problemId,
        messages: [],
        diagrams: [],
        startedAt: new Date(),
        lastActivityAt: new Date(),
      })
    } else if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, ownerUserId: req.user.id })
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' })
      }
    } else {
      return res.status(400).json({ error: 'conversationId is required for non-start events' })
    }

    // --- Build the user message content ---
    // If a diagram is included, prepend the PlantUML source as a code block
    let userContent = message || ''
    let attachedDiagram = null

    if (diagram && diagram.source) {
      // Render and store the diagram
      const format = diagram.format || 'svg'
      let body, contentType
      if (format === 'png') {
        body = await renderPng(diagram.source)
        contentType = 'image/png'
      } else {
        body = await renderSvg(diagram.source)
        contentType = 'image/svg+xml'
      }

      const key = `diagrams/${conversation._id}/${crypto.randomUUID()}.${format}`
      let diagramSaved = false

      try {
        await storeDiagram(key, body, contentType)
        conversation.diagrams.push({
          source: diagram.source,
          imageKey: key,
          format,
          createdAt: new Date(),
        })
        attachedDiagram = {
          imageKey: key,
          format,
          index: conversation.diagrams.length - 1,
        }
        diagramSaved = true
      } catch (storeErr) {
        console.warn('MinIO store skipped (local dev):', storeErr.message)
      }

      if (!diagramSaved) {
        // Fallback: inline data URL so the frontend can still show it
        const buf = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf-8')
        const base64 = buf.toString('base64')
        attachedDiagram = {
          inlineDataUrl: `data:${contentType};base64,${base64}`,
          format,
          index: null,
        }
        // Still attach source to conversation for history
        conversation.diagrams.push({
          source: diagram.source,
          imageKey: null,
          format,
          createdAt: new Date(),
        })
      }

      // Prepend diagram source to the message so the AI can review it
      const diagramBlock = `\`\`\`plantuml\n${diagram.source}\n\`\`\``
      const caption = diagram.description
        ? `\n\n**Diagram — ${diagram.description}:**\n`
        : '\n\n**Attached diagram:**\n'
      userContent = userContent
        ? `${diagramBlock}${caption}${userContent}`
        : `${diagramBlock}${caption}`
    }

    // --- Persist the user message (if any) ---
    if (userContent) {
      const userMessage = { role: 'user', content: userContent }
      if (attachedDiagram) {
        userMessage.diagram = {
          imageKey: attachedDiagram.imageKey || null,
          inlineDataUrl: attachedDiagram.inlineDataUrl || null,
          format: attachedDiagram.format,
        }
      }
      conversation.messages.push(userMessage)
    }

    // --- Build the conversation history from stored messages (source of truth) ---
    // Condense old diagram code blocks to short references so the AI isn't
    // re-sent the same full PlantUML source on every turn. Only the current
    // message (userContent) retains its full diagram source.
    const storedHistory = conversation.messages
      .filter((m) => m.role !== 'system')
      .map(({ role, content }, idx, arr) => {
        // Keep the full source only for the most recent message (the one we
        // just pushed). Older diagram code blocks become a brief reference.
        const isLatest = idx === arr.length - 1
        const condensed = isLatest
          ? content
          : content.replace(
              /```plantuml\n[\s\S]*?\n```\n*/g,
              '[Diagram source omitted — already reviewed above]\n'
            )
        return { role, content: condensed }
      })

    // --- Get AI reply using the DB-stored history, NOT the client-passed history ---
    // Switch the response into Server-Sent Events streaming mode. Text deltas
    // from DeepSeek are pushed as `text` events; when audio is enabled, the
    // synthesized MP3 follows as an `audio` event once the reply completes.
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    res.flushHeaders()

    // Send conversation id + any attached diagram metadata up front so the
    // frontend can wire up navigation and bubble rendering while text streams.
    sseWrite(res, 'meta', {
      conversationId: conversation._id.toString(),
      diagram: attachedDiagram || null,
    })

    let reply = ''
    // Audio is emitted per completed sentence while text keeps streaming.
    // Serialise the emissions so the clips arrive in order.
    let audioChain = Promise.resolve()
    let sentenceBuffer = ''
    const enqueueSentenceAudio = (sentence) => {
      if (!audioEnabled) return
      audioChain = audioChain.then(async () => {
        try {
          const { base64, mimeType } = await synthesizeReply(sentence)
          if (!res.writableEnded) {
            sseWrite(res, 'audio', { base64, mimeType })
          }
        } catch (ttsErr) {
          if (!res.writableEnded) {
            console.warn('Fish Audio TTS skipped:', ttsErr.message)
          }
        }
      })
    }

    try {
      for await (const chunk of streamInterviewerReply({
        problem,
        history: storedHistory.slice(0, -1), // exclude the just-pushed user message
        message: userContent || '',
        signal: controller.signal,
      })) {
        if (chunk.type === 'delta') {
          reply += chunk.text
          sseWrite(res, 'text', { delta: chunk.text })

          // Accumulate sentences and synthesise each once it completes.
          sentenceBuffer += chunk.text
          const trailingBoundary = /(?<=[.!?])\s+$|\n+$/.test(sentenceBuffer)
          const sentences = splitIntoSentences(sentenceBuffer)
          if (trailingBoundary) {
            for (const s of sentences) enqueueSentenceAudio(s)
            sentenceBuffer = ''
          } else if (sentences.length > 1) {
            for (const s of sentences.slice(0, -1)) enqueueSentenceAudio(s)
            sentenceBuffer = sentences[sentences.length - 1]
          }
        } else if (chunk.type === 'done') {
          break
        }
      }
    } catch (err) {
      // The client aborted (e.g. left the page) — clean shutdown.
      if (err.name === 'AbortError' || res.writableEnded) {
        return
      }
      throw err
    }

    // Flush any trailing partial sentence as the final audio clip.
    for (const s of splitIntoSentences(sentenceBuffer)) {
      enqueueSentenceAudio(s)
    }

    if (!reply) {
      throw new Error('DeepSeek returned an empty response')
    }

    // --- Persist the AI reply ---
    // NOTE: We intentionally do NOT attach the diagram ref to the AI message.
    // The diagram image is shown only in the user's bubble — the AI references
    // the design through text, and the image would be duplicate clutter.
    const aiMessage = { role: 'assistant', content: reply }
    conversation.messages.push(aiMessage)
    conversation.lastActivityAt = new Date()
    await conversation.save()

    // --- Stream audio if requested ---
    // Wait for any in-flight per-sentence audio to flush before closing.
    if (audioEnabled) {
      await audioChain
    }

    sseWrite(res, 'done', { reply, conversationId: conversation._id.toString() })
    res.end()
  } catch (err) {
    console.error('Chat error:', err)
    // If we've already started streaming, push an SSE error frame instead of JSON.
    if (res.headersSent) {
      try {
        sseWrite(res, 'error', { error: err.message || 'Failed to get AI response' })
        res.end()
      } catch (_) {
        // Response already closed — nothing to do.
      }
      return
    }
    res.status(500).json({ error: err.message || 'Failed to get AI response' })
  }
})

export default router
