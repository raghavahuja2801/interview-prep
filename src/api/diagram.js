const API_BASE = import.meta.env.VITE_API_URL || '/api'

/**
 * Renders a PlantUML diagram and stores it in MinIO.
 * @param {Object} params
 * @param {string} params.source - PlantUML source code (including @startuml/@enduml)
 * @param {string} [params.conversationId] - Optional conversation to attach to
 * @param {'svg'|'png'} [params.format] - Output format, defaults to 'svg'
 * @returns {Promise<{imageKey: string, diagramIndex: number|null, format: string}>}
 */
export async function renderDiagram({ source, conversationId, format = 'svg' }) {
  const res = await fetch(`${API_BASE}/diagram/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, conversationId, format }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Diagram API responded with ${res.status}`)
  }

  return res.json()
}

/**
 * Sends a chat message with an attached PlantUML diagram.
 * The diagram source is sent to the AI for review; the rendered image
 * is stored and served from MinIO for the user to view.
 *
 * @param {Object} params
 * @param {string} params.problemId
 * @param {string} [params.conversationId]
 * @param {string} params.message - User's message describing/explaining the diagram
 * @param {string} params.diagramSource - The PlantUML source code
 * @param {string} [params.diagramDescription] - Optional short description
 * @param {Array<{role, content}>} [params.history]
 * @param {'start'|'message'} params.event
 * @returns {Promise<{reply: string, conversationId: string, diagram: {imageKey: string, format: string, index: number}|null}>}
 */
export async function sendDiagramChatMessage({
  problemId,
  conversationId,
  message,
  diagramSource,
  diagramDescription,
  history,
  event,
}) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      problemId,
      conversationId,
      message: message || '',
      history,
      diagram: {
        source: diagramSource,
        description: diagramDescription || '',
        format: 'svg',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Chat API responded with ${res.status}`)
  }

  return res.json()
}

/**
 * Returns the URL to load a diagram image from the backend proxy.
 * @param {string} imageKey - The MinIO object key
 * @returns {string}
 */
export function getDiagramUrl(imageKey) {
  return `${API_BASE}/diagram/${encodeURIComponent(imageKey)}`
}
