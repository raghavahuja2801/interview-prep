import { Router } from 'express'
import Problem from '../models/Problem.js'
import Conversation from '../models/Conversation.js'
import { getInterviewerReply } from '../services/interviewer.js'
import { renderSvg, renderPng } from '../services/plantuml.js'
import { storeDiagram } from '../services/minio.js'
import crypto from 'crypto'

const router = Router()

// POST /api/chat — send a message in an interview
router.post('/', async (req, res) => {
  try {
    const { problemId, conversationId, message, history, event, diagram } = req.body

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
        problemId,
        messages: [],
        diagrams: [],
        startedAt: new Date(),
        lastActivityAt: new Date(),
      })
    } else if (conversationId) {
      conversation = await Conversation.findById(conversationId)
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
    const reply = await getInterviewerReply({
      problem,
      history: storedHistory.slice(0, -1), // exclude the just-pushed user message
      message: userContent || '',
    })

    // --- Persist the AI reply ---
    // NOTE: We intentionally do NOT attach the diagram ref to the AI message.
    // The diagram image is shown only in the user's bubble — the AI references
    // the design through text, and the image would be duplicate clutter.
    const aiMessage = { role: 'assistant', content: reply }
    conversation.messages.push(aiMessage)
    conversation.lastActivityAt = new Date()
    await conversation.save()

    res.json({
      reply,
      conversationId: conversation._id.toString(),
      diagram: attachedDiagram,
    })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: err.message || 'Failed to get AI response' })
  }
})

export default router
