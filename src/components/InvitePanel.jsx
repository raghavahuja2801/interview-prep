import { useEffect, useState } from 'react'
import { Copy, KeyRound, X } from 'lucide-react'
import { createInvite } from '../api/auth.js'

export default function InvitePanel({ open, onClose, onCreated }) {
  const [expiresInDays, setExpiresInDays] = useState(30)
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setDisplayName('')
      setInviteCode('')
      setExpiresAt('')
      setError('')
      setLoading(false)
    }
  }, [open])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await createInvite({
        expiresInDays: Number(expiresInDays) || 30,
        displayName: displayName.trim() || undefined,
      })
      setInviteCode(data.inviteCode)
      setExpiresAt(data.expiresAt ? new Date(data.expiresAt).toLocaleString() : 'No expiration')
      onCreated?.(data)
    } catch (err) {
      setError(err.message || 'Failed to create invite.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
    } catch (_) {
      setError('Copy failed. Select and copy the code manually.')
    }
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 24, 32, 0.48)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 60,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(560px, 100%)',
          background: 'linear-gradient(180deg, #fff 0%, #fbfbfa 100%)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          boxShadow: '0 24px 80px rgba(17, 24, 39, 0.22)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <KeyRound size={16} color="var(--accent)" />
              <h2 style={{ margin: 0, fontSize: 16, letterSpacing: -0.2 }}>Generate invite code</h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              Mint a new invite for a friend or peer to register.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'var(--bg-subtle)',
              borderRadius: 10,
              width: 34,
              height: 34,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--text-secondary)',
            }}
            aria-label="Close invite panel"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Optional name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              type="text"
              placeholder="Name to prefill on register"
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
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Expires in days</span>
            <input
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              type="number"
              min="1"
              step="1"
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

          {inviteCode && (
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 14, padding: 14, display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Invite code generated</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 14, padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  {inviteCode}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    borderRadius: 10,
                    padding: '8px 11px',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                Expires: {expiresAt}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-tertiary)' }}>
              Share the code once. New users will use it to register.
            </p>
            <button
              type="submit"
              disabled={loading}
              style={{
                border: 'none',
                borderRadius: 12,
                background: 'var(--accent)',
                color: '#fff',
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)',
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? 'Creating...' : 'Create invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}