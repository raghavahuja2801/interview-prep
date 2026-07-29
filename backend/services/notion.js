import Conversation from '../models/Conversation.js'

const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

async function notionFetch(path, options = {}) {
  const token = process.env.NOTION_API_TOKEN
  if (!token) return null

  const res = await fetch(`${NOTION_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`[notion] ${res.status} on ${path}: ${body}`)
    return null
  }

  return res.json()
}

/**
 * Find an existing Notion database row by problem title.
 */
async function findExistingPage(title) {
  const dbId = process.env.NOTION_DATABASE_ID
  if (!dbId) return null

  const data = await notionFetch(`/databases/${dbId}/query`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        property: 'Problem',
        title: { equals: title },
      },
      page_size: 1,
    }),
  })

  return data?.results?.[0] || null
}

/**
 * Synchronise a completed interview to Notion.
 *
 * - Creates a database row per problem (if not already present)
 * - Updates properties on existing rows (status, attempts, score)
 * - Appends a child attempt page with the AI evaluation
 */
export async function syncInterviewToNotion({ problem, conversation }) {
  if (!process.env.NOTION_API_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.log('[notion] Not configured — skipping sync')
    return
  }

  try {
    const existing = await findExistingPage(problem.title)

    // Count all completed conversations for this problem
    const attemptCount = await Conversation.countDocuments({
      problemId: problem.id,
      completed: true,
    })

    let parentPageId

    if (!existing) {
      // ── Create the problem row ──
      const created = await notionFetch('/pages', {
        method: 'POST',
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DATABASE_ID },
          properties: {
            Problem: {
              title: [{ type: 'text', text: { content: problem.title } }],
            },
            Status: { status: { name: 'In progress' } },
            Difficulty: { select: { name: problem.difficulty } },
            'Concept Used': {
              multi_select: problem.tags.map((t) => ({ name: t })),
            },
            Type: { select: { name: problem.category } },
            Attempts: { number: attemptCount },
            Score: { number: conversation.score },
          },
          children: buildProblemBlocks(problem),
        }),
      })

      if (!created?.id) {
        console.error('[notion] Failed to create problem page')
        return
      }
      parentPageId = created.id
      console.log(`[notion] Created problem page for "${problem.title}"`)
    } else {
      // ── Update existing row ──
      parentPageId = existing.id

      await notionFetch(`/pages/${parentPageId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          properties: {
            Status: { status: { name: 'In progress' } },
            Attempts: { number: attemptCount },
            Score: { number: conversation.score },
          },
        }),
      })
    }

    // ── Create child attempt page ──
    const scoreLabel =
      conversation.score != null
        ? `${conversation.score}/10`
        : 'Unscored'
    const attemptTitle = `Attempt ${attemptCount} — ${scoreLabel}`

    const attemptResult = await notionFetch('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { page_id: parentPageId },
        properties: {
          title: {
            title: [{ type: 'text', text: { content: attemptTitle } }],
          },
        },
        children: buildEvaluationBlocks(conversation.evaluation),
      }),
    })

    if (attemptResult) {
      console.log(
        `[notion] Synced attempt ${attemptCount} for "${problem.title}" (${scoreLabel})`
      )
    }
  } catch (err) {
    // Non-blocking — Notion sync should never fail the interview
    console.error('[notion] Sync error:', err.message)
  }
}

// ─── Block builders ───

function buildProblemBlocks(problem) {
  const blocks = [
    h2(problem.title),
    p(problem.summary),
    h3('Statement'),
    p(problem.statement),
    h3('Functional Requirements'),
    ...problem.functionalRequirements.map((r) => bullet(r)),
    h3('Non-Functional Requirements'),
    ...problem.nonFunctionalRequirements.map((r) => bullet(r)),
  ]

  if (problem.constraints?.length) {
    blocks.push(h3('Constraints'))
    blocks.push(...problem.constraints.map((c) => bullet(c)))
  }

  return blocks
}

function buildEvaluationBlocks(evaluation) {
  if (!evaluation) {
    return [p('No evaluation available.')]
  }

  const lines = evaluation.split('\n').filter(Boolean)
  const blocks = []

  for (const line of lines) {
    const trimmed = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim()
    if (!trimmed) continue

    if (line.startsWith('### ')) {
      blocks.push(h3(trimmed))
    } else if (line.startsWith('## ')) {
      blocks.push(h2(trimmed))
    } else if (line.startsWith('# ')) {
      blocks.push(h1(trimmed))
    } else {
      blocks.push(p(trimmed))
    }
  }

  return blocks.length > 0 ? blocks : [p('No evaluation available.')]
}

// ─── Helpers ───

function textBlock(text) {
  return [{ type: 'text', text: { content: text } }]
}

function h1(text) {
  return {
    object: 'block',
    type: 'heading_1',
    heading_1: { rich_text: textBlock(text) },
  }
}

function h2(text) {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: textBlock(text) },
  }
}

function h3(text) {
  return {
    object: 'block',
    type: 'heading_3',
    heading_3: { rich_text: textBlock(text) },
  }
}

function p(text) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: textBlock(text) },
  }
}

function bullet(text) {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: textBlock(text) },
  }
}
