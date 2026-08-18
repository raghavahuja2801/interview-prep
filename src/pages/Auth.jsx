import { useEffect, useMemo, useState } from 'react'
import { MessageSquare, BarChart3, History, LogIn, UserPlus, ArrowRight, ClipboardPaste } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { fetchInvite, login, register } from '../api/auth.js'

const TABS = {
  LOGIN: 'login',
  REGISTER: 'register',
}

export default function Auth({ onAuthenticated }) {
  const [searchParams] = useSearchParams()
  const inviteFromQuery = searchParams.get('code') || ''
  const [tab, setTab] = useState(TABS.LOGIN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState(inviteFromQuery)
  const [loading, setLoading] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setInviteCode(inviteFromQuery)
  }, [inviteFromQuery])

  useEffect(() => {
    if (!inviteCode) return

    let cancelled = false
    setInviteLoading(true)
    fetchInvite(inviteCode)
      .then((data) => {
        if (cancelled) return
        const invite = data.invite || null
        if (invite?.displayName) {
          setDisplayName(invite.displayName)
        }
        if (!invite?.displayName) {
          setDisplayName('')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDisplayName('')
        }
      })
      .finally(() => {
        if (!cancelled) setInviteLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [inviteCode])

  const title = useMemo(() => (tab === TABS.LOGIN ? 'Welcome back' : 'Join the practice room'), [tab])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = { email, password }
      const response =
        tab === TABS.LOGIN
          ? await login(payload)
          : await register({ ...payload, displayName, inviteCode })

      onAuthenticated?.(response.user)
    } catch (err) {
      setError(err.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  function handleInviteCodeChange(value) {
    const nextCode = value.trim()
    setInviteCode(nextCode)

    if (!nextCode) {
      setDisplayName('')
    }
  }

  async function handlePasteInviteCode() {
    try {
      const clipboardText = await navigator.clipboard.readText()
      handleInviteCodeChange(clipboardText)
    } catch (_) {
      setError('Paste failed. Please allow clipboard access or paste the code manually.')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.05fr) minmax(340px, 0.95fr)',
        background:
          'radial-gradient(circle at top left, rgba(54, 82, 217, 0.12), transparent 32%), radial-gradient(circle at bottom right, rgba(47, 158, 100, 0.08), transparent 28%), var(--bg)',
      }}
    >
      <div style={{ padding: '72px 64px', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 560 }}>
          <h1 style={{ margin: '0 0 14px', fontSize: 54, lineHeight: 1, letterSpacing: -2.1 }}>
            Practice system design interviews before the real thing.
          </h1>
          <p style={{ margin: '0 0 28px', maxWidth: 520, fontSize: 17, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
            An AI interviewer walks you through HLD and LLD design problems the same way a real one would, then scores you with detailed feedback.
          </p>

          <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
            {[
              {
                icon: MessageSquare,
                title: 'A realistic interview',
                body: 'Requirements, estimation, architecture, then deep dives. Same flow as the real thing.',
              },
              {
                icon: BarChart3,
                title: 'A score, with reasons',
                body: 'After every session you get a score and a write-up of what to improve.',
              },
              {
                icon: History,
                title: 'Kept on your profile',
                body: 'Every session is saved, so you can look back at how you\'ve improved.',
              },
            ].map((item) => (
              <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 14, background: 'rgba(255, 255, 255, 0.76)' }}>
                <item.icon size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: 14.5, fontWeight: 700, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.5 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 'min(440px, 100%)', background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(251,251,250,0.98))', border: '1px solid var(--border)', borderRadius: 24, boxShadow: '0 30px 90px rgba(15, 23, 42, 0.12)', overflow: 'hidden' }}>
          <div style={{ padding: 22, borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 24, letterSpacing: -0.7 }}>{title}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14.5, lineHeight: 1.55 }}>
              {tab === TABS.LOGIN
                ? 'Sign in to pick up where you left off.'
                : 'To join, grab an invite code from a friend.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6, padding: 10, background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setTab(TABS.LOGIN)}
              style={{
                flex: 1,
                border: '1px solid',
                borderColor: tab === TABS.LOGIN ? 'var(--border-strong)' : 'transparent',
                background: tab === TABS.LOGIN ? 'var(--bg)' : 'transparent',
                borderRadius: 12,
                padding: '11px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                color: tab === TABS.LOGIN ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <LogIn size={14} />
              Log in
            </button>
            <button
              type="button"
              onClick={() => setTab(TABS.REGISTER)}
              style={{
                flex: 1,
                border: '1px solid',
                borderColor: tab === TABS.REGISTER ? 'var(--border-strong)' : 'transparent',
                background: tab === TABS.REGISTER ? 'var(--bg)' : 'transparent',
                borderRadius: 12,
                padding: '11px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                color: tab === TABS.REGISTER ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <UserPlus size={14} />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 22, display: 'grid', gap: 14 }}>
            {tab === TABS.REGISTER && (
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Invite code</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                  <input
                    value={inviteCode}
                    onChange={(e) => handleInviteCodeChange(e.target.value)}
                    type="text"
                    placeholder="Paste your invite code"
                    autoComplete="off"
                    style={{
                      flex: 1,
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      background: 'var(--bg)',
                      fontSize: 14,
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handlePasteInviteCode}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '0 14px',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <ClipboardPaste size={14} />
                    Paste
                  </button>
                </div>
                {inviteLoading && (
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Loading invite details...</span>
                )}
              </label>
            )}

            {tab === TABS.REGISTER && (
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Display name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    background: 'var(--bg)',
                    fontSize: 14,
                  }}
                />
              </label>
            )}

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  background: 'var(--bg)',
                  fontSize: 14,
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                autoComplete={tab === TABS.LOGIN ? 'current-password' : 'new-password'}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  background: 'var(--bg)',
                  fontSize: 14,
                }}
              />
            </label>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--danger)', background: 'var(--danger-soft)', border: '1px solid rgba(209, 69, 59, 0.14)', borderRadius: 12, padding: '10px 12px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                border: 'none',
                borderRadius: 14,
                background: 'linear-gradient(135deg, var(--accent) 0%, #2840ae 100%)',
                color: '#fff',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 700,
                boxShadow: '0 10px 28px rgba(54, 82, 217, 0.24)',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? 'Working...' : tab === TABS.LOGIN ? 'Sign in' : 'Create account'}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}