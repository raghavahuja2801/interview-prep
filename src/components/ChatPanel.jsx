import { useEffect, useRef, useState, useMemo } from 'react'
import { Send, MessageSquare, RotateCcw, StopCircle, Volume2 } from 'lucide-react'
import InterviewTimer from './InterviewTimer.jsx'
import { marked } from 'marked'
import ChatMessage from './ChatMessage.jsx'
import { streamChatMessage } from '../api/chat.js'
import { sendDiagramChatMessage } from '../api/diagram.js'
import { createConversation, fetchConversation, updateConversation } from '../api/conversations.js'

marked.setOptions({ breaks: true, gfm: true })

// Queue of base64 MP3 clips → sequential playback through a single <audio>.
function createAudioPlayer(onStateChange) {
  let queue = []
  let playing = false
  let audio = null

  function playNext() {
    if (playing || queue.length === 0) return
    const clip = queue.shift()
    playing = true
    onStateChange?.(true)

    audio = new Audio(`data:${clip.mimeType || 'audio/mpeg'};base64,${clip.base64}`)
    audio.onended = () => {
      playing = false
      audio = null
      if (queue.length === 0) {
        onStateChange?.(false)
      } else {
        playNext()
      }
    }
    audio.onerror = () => {
      playing = false
      audio = null
      onStateChange?.(false)
      queue = []
    }
    audio.play().catch(() => {
      playing = false
      audio = null
      onStateChange?.(false)
      queue = []
    })
  }

  return {
    enqueue(clip) {
      queue.push(clip)
      playNext()
    },
    stop() {
      queue = []
      if (audio) {
        audio.pause()
        audio = null
      }
      playing = false
      onStateChange?.(false)
    },
  }
}

export default function ChatPanel({
  problem,
  initialConversationId,
  onConversationChange,
  onInterviewStateChange,
  externalMessage,
  audioEnabled = false,
}) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [conversationId, setConversationId] = useState(initialConversationId || null)
  const [conversationElapsed, setConversationElapsed] = useState(0)
  const [partialReply, setPartialReply] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)
  const audioEnabledRef = useRef(audioEnabled)
  const audioPlayerRef = useRef(null)
  // True while a chat/audio stream is in flight. Used to stop the conversation
  // reload effect from clobbering in-memory messages when the conversation id
  // round-trips through the parent mid-stream (the DB snapshot is stale then).
  const streamingRef = useRef(false)

  // Keep a ref mirror of audioEnabled so async stream/audio callbacks see the
  // latest value without re-subscribing the closures.
  audioEnabledRef.current = audioEnabled

  // Single audio player for the lifetime of the panel.
  if (audioPlayerRef.current === null) {
    audioPlayerRef.current = createAudioPlayer(setSpeaking)
  }

  // Stop playback when the toggle is switched off.
  useEffect(() => {
    if (!audioEnabled) {
      audioPlayerRef.current?.stop()
    }
  }, [audioEnabled])

  // Clean up audio on unmount.
  useEffect(() => () => audioPlayerRef.current?.stop(), [])

  // Load existing conversation if navigating to a past one.
  // While a stream is in flight, the conversation id is propagated up to the
  // parent and back down as initialConversationId. At that point the DB snapshot
  // is stale (the AI reply is only persisted at the end of the stream), so a
  // reload would clobber the live message list. Skip the DB refresh while
  // streaming; just keep the local id in sync.
  useEffect(() => {
    if (streamingRef.current) {
      if (initialConversationId) {
        setConversationId(initialConversationId)
      }
      return
    }

    if (initialConversationId) {
      setConversationId(initialConversationId)
      setLoading(true)
      fetchConversation(initialConversationId)
        .then((conv) => {
          setMessages(conv.messages || [])
          setStarted(true)
          setEnded(conv.completed || false)
          setEvaluation(conv.evaluation || null)
          setConversationElapsed(conv.durationSeconds || 0)
          onInterviewStateChange?.(true)
        })
        .catch(() => {
          setMessages([])
          setStarted(false)
          setEnded(false)
          setEvaluation(null)
          onInterviewStateChange?.(false)
        })
        .finally(() => setLoading(false))
    } else {
      setConversationId(null)
      setMessages([])
      setStarted(false)
      setEnded(false)
      setEvaluation(null)
      onInterviewStateChange?.(false)
    }
    setInput('')
  }, [problem.id, initialConversationId])

  // Handle external message from diagram tab
  const processingRef = useRef(null)

  useEffect(() => {
    if (!externalMessage) return

    const { source, description, ts } = externalMessage
    if (!source) return

    // Guard against double-processing (React strict mode, rapid re-renders)
    if (processingRef.current === ts) return
    processingRef.current = ts

    setStarted(true)
    onInterviewStateChange?.(true)

    const doSend = async () => {
      setLoading(true)
      setPartialReply('')
      streamingRef.current = true
      let streamedText = ''
      try {
        // Show the diagram-bearing user message immediately.
        setMessages((prev) => [...prev, { role: 'user', content: description || 'Attached a diagram' }])

        let streamedConversationId = conversationId
        await sendDiagramChatMessage({
          problemId: problem.id,
          conversationId,
          message: description || '',
          diagramSource: source,
          diagramDescription: description || '',
          event: conversationId ? 'message' : 'start',
          handlers: {
            onMeta: ({ conversationId: cid, diagram }) => {
              if (cid && cid !== streamedConversationId) {
                streamedConversationId = cid
                setConversationId(cid)
                onConversationChange?.(cid)
              }
              // Attach the stored/rendered diagram to the last (user) message.
              if (diagram) {
                setMessages((prev) => {
                  const next = prev.slice()
                  const last = next[next.length - 1]
                  if (last && last.role === 'user') {
                    next[next.length - 1] = {
                      ...last,
                      diagram: {
                        inlineDataUrl: diagram.inlineDataUrl || null,
                        imageKey: diagram.imageKey || null,
                      },
                    }
                  }
                  return next
                })
              }
            },
            onText: (delta) => {
              streamedText += delta
              setPartialReply(streamedText)
            },
            onAudio: (clip) => {
              if (audioEnabledRef.current) audioPlayerRef.current?.enqueue(clip)
            },
          },
        })
        // Commit the streamed reply.
        setMessages((prev) => [...prev, { role: 'assistant', content: streamedText }])
      } catch (err) {
        if (err.message === 'aborted') return
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: err.message || 'Something went wrong.', isError: true },
        ])
      } finally {
        streamingRef.current = false
        setPartialReply('')
        setLoading(false)
      }
    }
    doSend()
  }, [externalMessage])

  const evaluationHtml = useMemo(() => {
    if (!evaluation) return ''
    const raw = marked.parse(evaluation, { async: false })
    return raw.replace(/^<p>(.*?)<\/p>$/s, '$1')
  }, [evaluation])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, evaluation, evaluating, partialReply])

  async function callBackend(newMessage, event, historyForCall) {
    setLoading(true)
    setPartialReply('')
    streamingRef.current = true
    let streamedText = ''
    try {
      await streamChatMessage({
        problemId: problem.id,
        conversationId,
        message: newMessage,
        history: historyForCall,
        event,
        audioEnabled: audioEnabledRef.current,
        handlers: {
          onMeta: ({ conversationId: cid }) => {
            if (cid && cid !== conversationId) {
              setConversationId(cid)
              onConversationChange?.(cid)
            }
          },
          onText: (delta) => {
            streamedText += delta
            setPartialReply(streamedText)
          },
          onAudio: (clip) => {
            if (audioEnabledRef.current) audioPlayerRef.current?.enqueue(clip)
          },
        },
      })

      // Commit the fully streamed reply as a proper assistant message.
      setMessages((prev) => [...prev, { role: 'assistant', content: streamedText }])
    } catch (err) {
      if (err.message === 'aborted') return
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Something went wrong reaching the interviewer.',
          isError: true,
        },
      ])
    } finally {
      streamingRef.current = false
      setPartialReply('')
      setLoading(false)
    }
  }

  function handleStart() {
    setStarted(true)
    onInterviewStateChange?.(true)
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

  async function handleRestart() {
    // Save the current duration before discarding
    if (conversationId && conversationElapsed > 0) {
      try {
        await updateConversation(conversationId, { durationSeconds: conversationElapsed })
      } catch (_) { /* non-critical */ }
    }
    setConversationId(null)
    setMessages([])
    setStarted(false)
    setEnded(false)
    setEvaluation(null)
    setConversationElapsed(0)
    setInput('')
    setPartialReply('')
    audioPlayerRef.current?.stop()
    onInterviewStateChange?.(false)
    onConversationChange?.(null)
  }

  async function handleEnd() {
    if (!conversationId || ended) return
    setEnded(true)
    setEvaluating(true)
    setPartialReply('')
    audioPlayerRef.current?.stop()
    // Save final duration before evaluating
    try {
      await updateConversation(conversationId, { durationSeconds: conversationElapsed })
    } catch (_) { /* non-critical */ }
    try {
      const res = await fetch(`/api/evaluate`, {
        method: 'POST',
        credentials: 'include',
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
          <InterviewTimer
            running={started && !ended}
            initialElapsed={conversationElapsed}
            onElapsedChange={setConversationElapsed}
            onPause={({ elapsed }) => {
              if (conversationId) {
                updateConversation(conversationId, { durationSeconds: elapsed }).catch(() => {})
              }
            }}
          />
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
          <ChatMessage key={i} role={m.role} content={m.content} isError={m.isError} diagram={m.diagram} />
        ))}

        {/* Live-streaming assistant reply */}
        {partialReply && (
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
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                maxWidth: '100%',
              }}
            >
              <span className="chat-markdown" dangerouslySetInnerHTML={{ __html: marked.parse(partialReply, { async: false }) }} />
              {speaking && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 8, fontSize: 11, color: 'var(--accent)', verticalAlign: 'middle' }}>
                  <Volume2 size={12} />
                  speaking
                </span>
              )}
            </div>
          </div>
        )}

        {loading && !partialReply && (
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
