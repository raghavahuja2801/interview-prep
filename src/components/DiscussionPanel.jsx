import { useState, useRef, useEffect } from 'react'
import { Send, X, WifiOff, Users, MessageCircle } from 'lucide-react'
import { useDiscussion } from '../hooks/useDiscussion.js'
import { sendDiscussionMessage } from '../api/discussion.js'

function initials(name) {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const AVATAR_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function avatarColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function timeLabel(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function TypingBubble({ label }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
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
          color: '#fff',
          background: avatarColor(label),
        }}
      >
        {initials(label)}
      </div>
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '11px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
        aria-label={`${label} is typing`}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--text-tertiary)',
              display: 'inline-block',
              animation: `typing-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function DiscussionPanel({ problemId, currentUser, onClose }) {
  const {
    messages,
    onlineUsers,
    typingUsers,
    connected,
    loading,
    historyLoaded,
    error,
    setError,
    sendTyping,
  } = useDiscussion(problemId, currentUser)

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)

  const typingRef = useRef(false)
  const typingTimerRef = useRef(null)
  const inputRef = useRef('')

  // Keep a ref mirror of input for the sendTyping callback.
  inputRef.current = input

  // Auto-scroll to the newest message whenever the list changes.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typingUsers, loading])

  // Reset input state when the problem changes.
  useEffect(() => {
    setInput('')
    setSending(false)
  }, [problemId])

  // Focus the textarea once history loads.
  useEffect(() => {
    if (historyLoaded && !loading) {
      textareaRef.current?.focus()
    }
  }, [historyLoaded, loading])

  function handleInputChange(value) {
    setInput(value)
    sendTyping()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleSend() {
    const body = input.trim()
    if (!body || sending) return

    setSending(true)
    setError(null)
    try {
      await sendDiscussionMessage(problemId, body)
      setInput('')
      textareaRef.current?.focus()
    } catch (err) {
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const otherTyping = typingUsers.filter((u) => !currentUser || u.userId !== currentUser.id)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        padding: 24,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: 'min(480px, 100%)',
          height: 'min(620px, 86vh)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
        }}
        role="dialog"
        aria-label="Discussion"
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <MessageCircle size={17} color="var(--accent)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Discussion</div>
            <div
              style={{
                fontSize: 11.5,
                color: connected ? 'var(--text-tertiary)' : 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {connected ? (
                <>
                  <Users size={11} />
                  {onlineUsers.length === 0
                    ? 'You are the only one here'
                    : `${onlineUsers.length} online · ${onlineUsers
                        .map((u) => u.displayName || u.userId)
                        .slice(0, 3)
                        .join(', ')}${onlineUsers.length > 3 ? '…' : ''}`}
                </>
              ) : (
                <>
                  <WifiOff size={11} />
                  Reconnecting…
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close discussion"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 999,
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: 'var(--bg-subtle)',
          }}
        >
          {loading && (
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--text-tertiary)',
                textAlign: 'center',
                padding: '24px 0',
              }}
            >
              Loading discussion…
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-tertiary)',
                textAlign: 'center',
                padding: '24px 0',
                lineHeight: 1.6,
              }}
            >
              No messages yet.
              <br />
              Start the conversation about this problem.
            </div>
          )}

          {messages.map((m) => {
            const mine = currentUser && m.userId === currentUser.id
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: mine ? 'row-reverse' : 'row',
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
                    color: '#fff',
                    background: avatarColor(m.displayName || m.userId),
                  }}
                >
                  {initials(m.displayName || m.userId)}
                </div>
                <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: mine ? 'var(--accent)' : 'var(--text-tertiary)',
                      textAlign: mine ? 'right' : 'left',
                    }}
                  >
                    {m.displayName || m.userId}
                    {m.createdAt ? (
                      <span style={{ fontWeight: 400, marginLeft: 6 }}>{timeLabel(m.createdAt)}</span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      background: mine ? 'var(--accent-soft)' : 'var(--bg)',
                      border: `1px solid ${mine ? 'var(--accent-soft-strong)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '9px 13px',
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {m.body}
                  </div>
                </div>
              </div>
            )
          })}

          {otherTyping.map((u) => (
            <TypingBubble key={u.userId} label={u.displayName || u.userId} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              fontSize: 12.5,
              color: 'var(--danger)',
              background: 'var(--danger-soft)',
              borderTop: '1px solid var(--danger)',
            }}
          >
            {error}
          </div>
        )}

        {/* Composer */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            padding: '12px 14px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share a thought about this problem…"
            rows={1}
            maxLength={2000}
            style={{
              flex: 1,
              resize: 'none',
              maxHeight: 120,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '9px 12px',
              fontSize: 14,
              fontFamily: 'inherit',
              lineHeight: 1.45,
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !input.trim()}
            title="Send message"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 999,
              border: 'none',
              background: input.trim() && !sending ? 'var(--accent)' : 'var(--border-strong)',
              color: input.trim() && !sending ? '#fff' : 'var(--text-tertiary)',
              cursor: input.trim() && !sending ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
