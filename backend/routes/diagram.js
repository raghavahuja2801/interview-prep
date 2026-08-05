import { Router } from 'express'
import crypto from 'crypto'
import Conversation from '../models/Conversation.js'
import Problem from '../models/Problem.js'
import { renderSvg, renderPng } from '../services/plantuml.js'
import { storeDiagram, getDiagram } from '../services/minio.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

router.use(requireAuth)

/**
 * POST /api/diagram/render
 * Accepts PlantUML source, renders via PlantUML server, stores in MinIO,
 * and optionally attaches it to a conversation.
 *
 * Body: { source, conversationId?, format? }
 *   source          - required, PlantUML source including @startuml/@enduml
 *   conversationId  - optional, if provided the diagram is linked to this conversation
 *   format          - optional, "svg" (default) or "png"
 */
router.post('/render', async (req, res) => {
  try {
    const { source, conversationId, format = 'svg' } = req.body

    if (!source || !source.trim()) {
      return res.status(400).json({ error: 'PlantUML source is required' })
    }

    // 1. Render the diagram
    let body, contentType
    if (format === 'png') {
      body = await renderPng(source)
      contentType = 'image/png'
    } else {
      body = await renderSvg(source)
      contentType = 'image/svg+xml'
    }

    // 2. Try to store in MinIO (local dev may not have it)
    let key = null
    let diagramIndex = null
    let inlineDataUrl = null

    try {
      key = `diagrams/${conversationId || 'standalone'}/${crypto.randomUUID()}.${format}`
      await storeDiagram(key, body, contentType)

      // 3. Optionally link to conversation
      if (conversationId) {
        const conversation = await Conversation.findOne({ _id: conversationId, ownerUserId: req.user.id })
        if (conversation) {
          conversation.diagrams.push({
            source,
            imageKey: key,
            format,
            createdAt: new Date(),
          })
          await conversation.save()
          diagramIndex = conversation.diagrams.length - 1
        }
      }
    } catch (storeErr) {
      console.warn('MinIO store skipped (local dev?):', storeErr.message)
      // Fallback: return as inline data URL so the frontend can still show it
      // body may be a string (SVG) or Buffer (PNG) — normalize to Buffer for base64
      const buf = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf-8')
      const base64 = buf.toString('base64')
      inlineDataUrl = `data:${contentType};base64,${base64}`
    }

    res.json({
      imageKey: key,
      inlineDataUrl,
      diagramIndex,
      format,
    })
  } catch (err) {
    console.error('Diagram render error:', err)
    res.status(500).json({ error: err.message || 'Failed to render diagram' })
  }
})

/**
 * GET /api/diagram/:key
 * Proxies the stored diagram from MinIO to the client.
 */
router.get('/:key(*)', async (req, res) => {
  try {
    const { body, contentType } = await getDiagram(req.params.key)
    res.set('Content-Type', contentType)
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(body)
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      return res.status(404).json({ error: 'Diagram not found' })
    }
    console.error('Diagram fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch diagram' })
  }
})

export default router
