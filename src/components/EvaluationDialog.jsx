import { useMemo } from 'react'
import { marked } from 'marked'
import { X } from 'lucide-react'

marked.setOptions({ breaks: true, gfm: true })

export default function EvaluationDialog({ evaluation, score, onClose }) {
  const html = useMemo(() => {
    if (!evaluation) return ''
    const raw = marked.parse(evaluation, { async: false })
    return raw.replace(/^<p>(.*?)<\/p>$/s, '$1')
  }, [evaluation])

  if (!evaluation) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Interview evaluation"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 680,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '28px 32px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
        }}
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11.5,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                color: 'var(--text-tertiary)',
                fontWeight: 600,
              }}
            >
              Interview Evaluation
            </span>
            {score != null && (
              <span
                style={{
                  marginLeft: 12,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 20,
                  fontWeight: 700,
                  color: score >= 7 ? 'var(--easy)' : score >= 4 ? 'var(--medium)' : 'var(--hard)',
                }}
              >
                {score}/10
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              background: 'var(--bg-subtle)',
              color: 'var(--text-tertiary)',
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* evaluation body */}
        <div
          className="chat-markdown"
          style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-primary)' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
