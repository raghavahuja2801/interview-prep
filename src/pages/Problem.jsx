import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Gauge, History, Trash2, Play, BarChart3, PenSquare, MessageSquare, Volume2, VolumeX, MessageCircle } from 'lucide-react'
import { fetchProblemById } from '../api/problems.js'
import { fetchConversations, deleteConversation, fetchConversation } from '../api/conversations.js'
import DifficultyTag from '../components/DifficultyTag.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import DiagramPanel from '../components/DiagramPanel.jsx'
import EvaluationDialog from '../components/EvaluationDialog.jsx'
import DiscussionPanel from '../components/DiscussionPanel.jsx'

export default function Problem({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pastConversations, setPastConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [evalDialog, setEvalDialog] = useState(null) // { evaluation, score }
  const [discussionOpen, setDiscussionOpen] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(() => {
    // Persist the audio toggle across sessions on this browser.
    return localStorage.getItem('interview_audio_enabled') === '1'
  })

  function handleToggleAudio() {
    setAudioEnabled((prev) => {
      const next = !prev
      localStorage.setItem('interview_audio_enabled', next ? '1' : '0')
      return next
    })
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchProblemById(id)
      .then((data) => {
        if (!cancelled) setProblem(data)
      })
      .catch(() => {
        if (!cancelled) navigate('/', { replace: true })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  // Determine the category for back-navigation
  const backPath = problem?.category === 'LLD' ? '/?category=LLD' : '/'

  // Load past conversations whenever problem or active conversation changes
  useEffect(() => {
    fetchConversations(id)
      .then(setPastConversations)
      .catch(() => {})
  }, [id, activeConversationId])

  function handleSelectConversation(convId) {
    setActiveConversationId(convId)
  }

  function handleStartFresh() {
    setActiveConversationId(null)
  }

  function handleShowEvaluation(convId, e) {
    e.stopPropagation()
    fetchConversation(convId).then((conv) => {
      if (conv.evaluation) {
        setEvalDialog({ evaluation: conv.evaluation, score: conv.score })
      }
    }).catch(() => {})
  }

  async function handleDeleteConversation(convId, e) {
    e.stopPropagation()
    await deleteConversation(convId)
    setPastConversations((prev) => prev.filter((c) => c._id !== convId))
    if (activeConversationId === convId) {
      setActiveConversationId(null)
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHrs = Math.floor(diffMin / 60)
    if (diffHrs < 24) return `${diffHrs}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 6,
        }}
      >
        <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
        <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
        <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
      </div>
    )
  }

  if (!problem) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>That problem doesn't exist.</p>
        <Link to="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          ← Back to all problems
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* topbar */}
      <div
        style={{
          flexShrink: 0,
          borderBottom: '1px solid var(--border)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <button
          onClick={() => navigate(backPath)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 13,
            padding: '6px 4px',
          }}
        >
          <ArrowLeft size={15} />
          All problems
        </button>
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <span style={{ fontSize: 18 }}>{problem.icon}</span>
        <h1 style={{ fontSize: 14.5, fontWeight: 600, margin: 0 }}>{problem.title}</h1>
        <DifficultyTag level={problem.difficulty} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-tertiary)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 5,
            padding: '2px 7px',
            letterSpacing: 0.2,
          }}
        >
          {problem.category}
        </span>

        {/* Discussion — per-problem real-time chat */}
        <button
          type="button"
          onClick={() => setDiscussionOpen(true)}
          title="Open the discussion for this problem"
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '6px 12px',
            background: 'var(--bg-subtle)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          <MessageCircle size={15} />
          Discussion
        </button>

        {/* Audio toggle — voices the interviewer's replies */}
        <button
          type="button"
          onClick={handleToggleAudio}
          title={audioEnabled ? 'Turn off voice replies' : 'Turn on voice replies'}
          aria-pressed={audioEnabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '6px 12px',
            background: audioEnabled ? 'var(--accent-soft)' : 'var(--bg-subtle)',
            color: audioEnabled ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          {audioEnabled ? 'Voice on' : 'Voice off'}
        </button>
      </div>

      {/* split content */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* left: problem statement */}
        <div
          style={{
            flex: '1 1 55%',
            maxWidth: 640,
            overflowY: 'auto',
            padding: '36px 44px 60px',
            borderRight: '1px solid var(--border)',
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 16px', letterSpacing: -0.3 }}>
            {problem.title}
          </h2>

          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-primary)', margin: '0 0 32px' }}>
            {problem.statement}
          </p>

          <Section title="Functional requirements">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {problem.functionalRequirements.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: 9, fontSize: 14, lineHeight: 1.5 }}>
                  <CheckCircle2 size={16} color="var(--easy)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Non-functional requirements">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {problem.nonFunctionalRequirements.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: 9, fontSize: 14, lineHeight: 1.5 }}>
                  <Gauge size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Scale & constraints">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {problem.constraints.map((c, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12.5,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '5px 10px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Tags">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {problem.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 12.5,
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    borderRadius: 6,
                    padding: '5px 10px',
                    fontWeight: 500,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>

          {/* Past conversations */}
          {pastConversations.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <h3
                style={{
                  fontSize: 11.5,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  color: 'var(--text-tertiary)',
                  margin: '0 0 10px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <History size={12} strokeWidth={2} />
                Past attempts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pastConversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSelectConversation(conv._id) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: activeConversationId === conv._id ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                      border: `1px solid ${activeConversationId === conv._id ? 'var(--accent-soft-strong)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      fontSize: 12.5,
                      color: 'var(--text-primary)',
                      transition: 'background 120ms ease, border-color 120ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
                        {formatDate(conv.startedAt)}
                        {conv.completed && (
                          <span style={{ color: 'var(--text-tertiary)', marginLeft: 6, fontSize: 11 }}>
                            · completed
                          </span>
                        )}
                        {activeConversationId === conv._id && (
                          <span style={{ color: 'var(--accent)', marginLeft: 6, fontSize: 11 }}>
                            · viewing
                          </span>
                        )}
                      </span>
                      {conv.score != null && (
                        <span
                          onClick={(e) => handleShowEvaluation(conv._id, e)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleShowEvaluation(conv._id, e) }}
                          title="View full evaluation"
                          style={{
                            flexShrink: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: '1px 7px',
                            borderRadius: 999,
                            background:
                              conv.score >= 7 ? 'var(--easy-soft)' : conv.score >= 4 ? 'var(--medium-soft)' : 'var(--hard-soft)',
                            color:
                              conv.score >= 7 ? 'var(--easy)' : conv.score >= 4 ? 'var(--medium)' : 'var(--hard)',
                            cursor: 'pointer',
                          }}
                        >
                          <BarChart3 size={11} strokeWidth={2.5} />
                          {conv.score}/10
                        </span>
                      )}
                    </div>
                    <span
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleDeleteConversation(conv._id, e) }}
                      title="Delete conversation"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 2,
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        opacity: 0,
                        transition: 'opacity 120ms ease',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <Trash2 size={12} strokeWidth={2} />
                    </span>
                  </div>
                ))}
                {activeConversationId && (
                  <button
                    onClick={handleStartFresh}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      background: 'none',
                      border: `1px dashed var(--border)`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '7px 10px',
                      fontSize: 12,
                      color: 'var(--accent)',
                      fontWeight: 500,
                    }}
                  >
                    <Play size={11} strokeWidth={2.5} />
                    Start a fresh interview
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* right: chat + diagram tabs */}
        <div style={{ flex: '1 1 45%', minWidth: 380, display: 'flex', flexDirection: 'column' }}>
          <RightPanel
            problem={problem}
            initialConversationId={activeConversationId}
            onConversationChange={setActiveConversationId}
            audioEnabled={audioEnabled}
          />
        </div>
      </div>

      {/* Evaluation dialog */}
      {evalDialog && (
        <EvaluationDialog
          evaluation={evalDialog.evaluation}
          score={evalDialog.score}
          onClose={() => setEvalDialog(null)}
        />
      )}

      {/* Discussion dialog */}
      {discussionOpen && problem && (
        <DiscussionPanel
          problemId={problem.id}
          currentUser={user}
          onClose={() => setDiscussionOpen(false)}
        />
      )}
    </div>
  )
}

function RightPanel({ problem, initialConversationId, onConversationChange, audioEnabled }) {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatConversationId, setChatConversationId] = useState(initialConversationId)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [diagrams, setDiagrams] = useState([])
  const [diagramToSend, setDiagramToSend] = useState(null)

  // Sync conversationId when parent changes
  useEffect(() => {
    setChatConversationId(initialConversationId)
  }, [initialConversationId])

  // Load diagrams when conversation changes
  useEffect(() => {
    if (chatConversationId) {
      fetchConversation(chatConversationId)
        .then((conv) => {
          if (conv.diagrams) setDiagrams(conv.diagrams)
        })
        .catch(() => {})
    } else {
      setDiagrams([])
    }
  }, [chatConversationId])

  function handleConversationChange(id) {
    setChatConversationId(id)
    onConversationChange(id)
  }

  function handleSendDiagramToChat({ source, description }) {
    // Use timestamp as a unique key so React always detects a new value
    setDiagramToSend({ source, description, ts: Date.now() })
    setActiveTab('chat')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          padding: '0 2px',
        }}
      >
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '12px 0 10px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'chat' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'chat' ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 600,
            transition: 'color 120ms ease, border-color 120ms ease',
          }}
        >
          <MessageSquare size={14} />
          AI Interviewer
        </button>
        {interviewStarted && (
          <button
            onClick={() => setActiveTab('diagram')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '12px 0 10px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'diagram' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'diagram' ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              transition: 'color 120ms ease, border-color 120ms ease',
            }}
          >
            <PenSquare size={14} />
            Diagram
          </button>
        )}
      </div>

      {/* Tab content — keep both panels mounted to preserve timer state across tab switches */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <div style={{ display: activeTab === 'chat' ? 'contents' : 'none' }}>
          <ChatPanel
            problem={problem}
            initialConversationId={chatConversationId}
            onConversationChange={handleConversationChange}
            onInterviewStateChange={setInterviewStarted}
            externalMessage={diagramToSend}
            audioEnabled={audioEnabled}
          />
        </div>
        <div style={{ display: activeTab === 'diagram' ? 'contents' : 'none', height: '100%' }}>
          <DiagramPanel
            problem={problem}
            conversationId={chatConversationId}
            onSendToChat={handleSendDiagramToChat}
            existingDiagrams={diagrams}
          />
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <h3
        style={{
          fontSize: 11.5,
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          color: 'var(--text-tertiary)',
          margin: '0 0 12px',
          fontWeight: 600,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}
