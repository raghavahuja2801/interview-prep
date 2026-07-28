import { useEffect, useRef, useState, useMemo } from 'react'
import { Send, MessageSquare, RotateCcw, StopCircle } from 'lucide-react'
import { marked } from 'marked'
import ChatMessage from './ChatMessage.jsx'
import { sendChatMessage } from '../api/chat.js'
import { fetchConversation } from '../api/conversations.js'

marked.setOptions({ breaks: true, gfm: true })

export default function ChatPanel({ problem, initialConversationId, onConversationChange }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [conversationId, setConversationId] = useState(initialConversationId || null)
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)

  // Load existing conversation if navigating to a past one
  useEffect(() => {
    if (initialConversationId) {
      setConversationId(initialConversationId)
      setLoading(true)
      fetchConversation(initialConversationId)
        .then((conv) => {
          setMessages(conv.messages || [])
          setStarted(true)
        })
        .catch(() => {
          // fall back to fresh start
          setMessages([])
          setStarted(false)
        })
        .finally(() => setLoading(false))
    } else {
      setConversationId(null)
      setMessages([])
      setStarted(false)
    }
    setInput('')
  }, [problem.id, initialConversationId])

  const evaluationHtml = useMemo(() => {
    if (!evaluation) return ''
    const raw = marked.parse(evaluation, { async: false })
    return raw.replace(/^<p>(.*?)<\/p>$/s, '$1')
  }, [evaluation])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, evaluation, evaluating])

  async function callBackend(newMessage, event, historyForCall) {
    setLoading(true)
    try {
      const data = await sendChatMessage({
        problemId: problem.id,
        conversationId,
        message: newMessage,
        history: historyForCall,
        event,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId)
        onConversationChange?.(data.conversationId)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Something went wrong reaching the interviewer.',
          isError: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleStart() {
    setStarted(true)
    callBackend('', 'start', [])
  }

  function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const history = messages.map(({ role, content }) => ({ role, content }))
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    callBackend(text, 'message', history)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    }
  }

  function handleRestart() {
    setConversationId(null)
    setMessages([])
    setStarted(false)
    setEnded(false)
    setEvaluation(null)
    setInput('')
    onConversationChange?.(null)
  }

  async function handleEnd() {
    if (!conversationId || ended) return
    setEnded(true)
    setEvaluating(true)
    try {
      const res = await fetch(`/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      })
      const data = await res.json()
      setEvaluation(data.evaluation)
    } catch (err) {
      setEvaluation(`**Evaluation failed:** ${err.message || 'Something went wrong.'}`)
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={12} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>AI Interviewer</span>
        </div>
        {started && !ended && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleEnd}
              title="End interview and get scored"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'none',
                border: '1px solid var(--hard)',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 12,
                color: 'var(--hard)',
              }}
            >
              <StopCircle size={12} />
              End
            </button>
            <button
              onClick={handleRestart}
              title="Restart interview"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 12,
                color: 'var(--text-secondary)',
              }}
            >
              <RotateCcw size={12} />
              Restart
            </button>
          </div>
        )}
      </div>

      {/* messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {!started && (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              maxWidth: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquare size={20} color="var(--accent)" strokeWidth={2} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600 }}>Ready when you are</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Start the interview and the AI will kick things off — treat it like a real
                system design round.
              </p>
            </div>
            <button
              onClick={handleStart}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '9px 18px',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              Start interview
            </button>
          </div>
        )}

        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} isError={m.isError} />
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div
              style={{
                flexShrink: 0,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10.5,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >
              AI
            </div>
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 14px',
                display: 'flex',
                gap: 4,
              }}
            >
              <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
              <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
              <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
            </div>
          </div>
        )}

        {/* Evaluation result */}
        {evaluation && (
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                color: 'var(--text-tertiary)',
                marginBottom: 10,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <StopCircle size={13} color="var(--hard)" strokeWidth={2} />
              Interview complete · Evaluation
            </div>
            <span className="chat-markdown" dangerouslySetInnerHTML={{ __html: evaluationHtml }} />
          </div>
        )}

        {evaluating && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0',
              gap: 6,
              color: 'var(--text-tertiary)',
              fontSize: 13,
            }}
          >
            <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
            <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
            <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }}
            />
            <span style={{ marginLeft: 4 }}>Scoring your interview...</span>
          </div>
        )}
      </div>

      {/* input */}
      {started && !ended && (
        <div style={{ borderTop: '1px solid var(--border)', padding: 12, flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 8px 8px 14px',
              background: 'var(--bg)',
            }}
          >
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Answer, ask a clarifying question, or propose your design..."
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 14,
                lineHeight: 1.5,
                color: 'var(--text-primary)',
                maxHeight: 160,
                padding: '4px 0',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                flexShrink: 0,
                width: 30,
                height: 30,
                borderRadius: 8,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: input.trim() && !loading ? 'var(--accent)' : 'var(--bg-hover)',
                color: input.trim() && !loading ? '#fff' : 'var(--text-tertiary)',
                transition: 'background 120ms ease',
              }}
            >
              <Send size={14} strokeWidth={2.2} />
            </button>
          </div>
          <p style={{ margin: '7px 2px 0', fontSize: 11, color: 'var(--text-tertiary)' }}>
            Enter to send · Shift + Enter for a new line
          </p>
        </div>
      )}
    </div>
  )
}
