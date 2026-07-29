import { useMemo } from 'react'
import { marked } from 'marked'
import { getDiagramUrl } from '../api/diagram.js'

// Configure marked for safety and cleanliness
marked.setOptions({
  breaks: true,
  gfm: true,
})

function renderMarkdown(text) {
  const raw = marked.parse(text, { async: false })
  // Remove the wrapping <p> if the entire result is a single paragraph
  return raw.replace(/^<p>(.*?)<\/p>$/s, '$1')
}

function stripDiagramSource(text) {
  // Remove plantuml code blocks prepended by the backend
  let cleaned = text.replace(/```plantuml\n[\s\S]*?\n```\n*/, '').trim()
  // Remove the backend-generated caption (e.g. "**Diagram — ...:**" or "**Attached diagram:**")
  // The colon is inside the bold markers, e.g. **Diagram — text:**\n
  cleaned = cleaned.replace(/\*\*Diagram[\s\S]*?\*\*\n*/, '').trim()
  cleaned = cleaned.replace(/\*\*Attached diagram:\*\*\n*/, '').trim()
  return cleaned
}

export default function ChatMessage({ role, content, isError, diagram }) {
  const isUser = role === 'user'

  // Only show the diagram image in the user's bubble (they drew it)
  const diagramSrc = isUser
    ? diagram?.inlineDataUrl || (diagram?.imageKey ? getDiagramUrl(diagram.imageKey) : null)
    : null

  // Clean user message: remove the raw PlantUML code, show a label instead
  const displayContent = isUser && diagram
    ? (stripDiagramSource(content) || 'Attached a diagram')
    : content

  const html = useMemo(() => {
    if (isError) return null
    return renderMarkdown(displayContent)
  }, [displayContent, isError])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 26,
          height: 26,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10.5,
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          background: isUser ? 'var(--text-primary)' : 'var(--accent)',
          color: '#fff',
        }}
      >
        {isUser ? 'Y' : 'AI'}
      </div>

      <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {diagramSrc && (
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={diagramSrc}
              alt="Diagram"
              style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 4 }}
            />
          </div>
        )}
        <div
          style={{
            background: isError ? 'var(--danger-soft)' : isUser ? 'var(--accent-soft)' : 'var(--bg)',
            border: `1px solid ${isError ? 'var(--danger)' : isUser ? 'var(--accent-soft-strong)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '9px 13px',
            fontSize: 14,
            lineHeight: 1.55,
            color: isError ? 'var(--danger)' : 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {isError ? (
            displayContent
          ) : (
            <span
              className="chat-markdown"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
