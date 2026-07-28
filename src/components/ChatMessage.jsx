import { useMemo } from 'react'
import { marked } from 'marked'

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

export default function ChatMessage({ role, content, isError }) {
  const isUser = role === 'user'

  const html = useMemo(() => {
    if (isError || isUser) return null
    return renderMarkdown(content)
  }, [content, isError, isUser])

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

      <div
        style={{
          maxWidth: '82%',
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
        {isUser || isError ? (
          content
        ) : (
          <span
            className="chat-markdown"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  )
}
