import { useState } from 'react'
import { Send, Eye, AlertCircle, History } from 'lucide-react'
import { getDiagramUrl } from '../api/diagram.js'

export default function DiagramPanel({ problem, conversationId, onSendToChat, existingDiagrams }) {
  const [source, setSource] = useState(`@startuml\n\n' Drag and drop classes here\n\n@enduml`)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewError, setPreviewError] = useState(null)
  const [description, setDescription] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  function handleRender() {
    if (!source || !source.trim()) {
      setPreviewError('No PlantUML source to render.')
      return
    }
    setPreviewError(null)
    fetch('/api/diagram/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, format: 'svg' }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Render failed')
        return res.json()
      })
      .then((data) => {
        if (data.inlineDataUrl) {
          setPreviewUrl(data.inlineDataUrl)
        } else if (data.imageKey) {
          setPreviewUrl(getDiagramUrl(data.imageKey))
        }
        setPreviewError(null)
      })
      .catch((err) => {
        setPreviewError(err.message)
      })
  }

  function handleSendToChat() {
    if (!source || !source.trim()) return
    onSendToChat({
      source,
      description: description || undefined,
      message: description,
    })
  }

  function validateSource(src) {
    const errors = []
    if (!src.includes('@startuml')) errors.push('Missing @startuml')
    if (!src.includes('@enduml')) errors.push('Missing @enduml')
    return errors
  }

  const validationErrors = source ? validateSource(source) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Source editor + Preview split */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Source editor */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: 'var(--text-tertiary)',
                fontWeight: 600,
              }}
            >
              PlantUML
            </span>
            {validationErrors.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--hard)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={11} />
                {validationErrors.length} issue{validationErrors.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handleRender()
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: '12px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              background: 'var(--bg-subtle)',
              tabSize: 2,
            }}
            placeholder={`@startuml\n\n' Drag and drop classes here\n\n@enduml`}
          />
        </div>

        {/* Preview */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', minHeight: 0, borderTop: '1px solid var(--border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Eye size={11} />
              Preview
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {existingDiagrams && existingDiagrams.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 5,
                    padding: '3px 8px',
                    fontSize: 10.5,
                    color: showHistory ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  <History size={11} />
                  History ({existingDiagrams.length})
                </button>
              )}
              <button
                onClick={handleRender}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 5,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Render
              </button>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              overflow: 'auto',
              background: '#fff',
            }}
          >
            {previewError ? (
              <div style={{ textAlign: 'center', color: 'var(--hard)', fontSize: 13, maxWidth: 300 }}>
                <AlertCircle size={20} style={{ margin: '0 auto 8px', display: 'block' }} />
                {previewError}
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="PlantUML diagram preview"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={() => setPreviewError('Failed to load preview. Check your PlantUML syntax and try again.')}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                <Eye size={24} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
                Click <strong>Render</strong> to preview your diagram
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History panel (collapsible) */}
      {showHistory && existingDiagrams && existingDiagrams.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            maxHeight: 200,
            overflowY: 'auto',
            padding: 12,
            background: 'var(--bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {existingDiagrams.map((d, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 10,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <img
                  src={d.inlineDataUrl || getDiagramUrl(d.imageKey)}
                  alt={`Diagram ${i + 1}`}
                  style={{ width: 120, height: 'auto', borderRadius: 3, flexShrink: 0, border: '1px solid var(--border)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      #{i + 1}
                    </span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
                      {d.createdAt ? new Date(d.createdAt).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <details>
                    <summary style={{ fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Source
                    </summary>
                    <pre style={{ margin: '4px 0 0', padding: 6, fontSize: 11, fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', borderRadius: 3, maxHeight: 100, overflow: 'auto' }}>
                      {d.source}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description (e.g., 'Class diagram for Parking Lot')"
          style={{
            flex: 1,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '7px 10px',
            fontSize: 13,
            outline: 'none',
            background: 'var(--bg)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={handleSendToChat}
          disabled={!source || !source.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: source?.trim() ? 'var(--accent)' : 'var(--bg-hover)',
            color: source?.trim() ? '#fff' : 'var(--text-tertiary)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '7px 14px',
            fontSize: 12.5,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <Send size={13} />
          Send to interviewer
        </button>
      </div>
    </div>
  )
}
