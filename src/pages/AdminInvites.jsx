import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Clock3, Copy, KeyRound, Trash2, UserRound } from 'lucide-react'
import { createInvite, deleteInvite, listInvites } from '../api/auth.js'

export default function AdminInvites({ user, onBackHome, onOpenProfile }) {
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [expiresInDays, setExpiresInDays] = useState(30)
  const [displayName, setDisplayName] = useState('')
  const [creating, setCreating] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const data = await listInvites()
      setInvites(data.invites || [])
    } catch (err) {
      setError(err.message || 'Failed to load invites.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sortedInvites = useMemo(
    () =>
      [...(invites || [])].sort((a, b) => {
        // Unused first, then most recently created
        if (Boolean(a.claimedAt) !== Boolean(b.claimedAt)) {
          return Boolean(a.claimedAt) ? 1 : -1
        }
        return new Date(b.createdAt) - new Date(a.createdAt)
      }),
    [invites]
  )

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await createInvite({
        expiresInDays: Number(expiresInDays) || 30,
        displayName: displayName.trim() || undefined,
      })
      setCreateOpen(false)
      setDisplayName('')
      setExpiresInDays(30)
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to create invite.')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(code) {
    setError('')
    try {
      await deleteInvite(code)
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to delete invite.')
    }
  }

  async function handleCopy(code) {
    setError('')
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(''), 1500)
    } catch (_) {
      setError('Copy failed. Select and copy the code manually.')
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: 16 }}>Admin access required.</p>
        <button type="button" onClick={onBackHome} style={linkButtonStyle}>
          ← Back to home
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px 80px' }}>
        <button type="button" onClick={onBackHome} style={backButtonStyle}>
          <ArrowLeft size={14} />
          Back to home
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: 0.6, marginBottom: 6 }}>
              Admin
            </div>
            <h1 style={{ margin: 0, fontSize: 30, letterSpacing: -0.8 }}>Invite codes</h1>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 14.5 }}>
              Create invitations and track which ones have been used.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={onOpenProfile} style={secondaryButtonStyle}>
              <UserRound size={14} />
              Profile
            </button>
            <button type="button" onClick={() => setCreateOpen((value) => !value)} style={primaryButtonStyle}>
              <KeyRound size={14} />
              New invite
            </button>
          </div>
        </div>

        {createOpen && (
          <form onSubmit={handleCreate} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 22, display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(140px, 0.6fr)', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Optional name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  type="text"
                  placeholder="Name to prefill on register"
                  style={inputStyle}
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
                  style={inputStyle}
                />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setCreateOpen(false)} style={secondaryButtonStyle}>
                Cancel
              </button>
              <button type="submit" disabled={creating} style={{ ...primaryButtonStyle, opacity: creating ? 0.75 : 1 }}>
                {creating ? 'Creating...' : 'Create invite'}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div style={{ fontSize: 13, color: 'var(--danger)', background: 'var(--danger-soft)', border: '1px solid rgba(209, 69, 59, 0.14)', borderRadius: 12, padding: '10px 12px', marginBottom: 18 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading invites...</div>
        ) : sortedInvites.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border)', borderRadius: 16 }}>
            No invites yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {sortedInvites.map((invite) => (
              <InviteRow key={invite.code} invite={invite} copied={copiedCode === invite.code} onCopy={() => handleCopy(invite.code)} onDelete={() => handleDelete(invite.code)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InviteRow({ invite, copied, onCopy, onDelete }) {
  const used = Boolean(invite.claimedAt)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16, background: 'var(--bg)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, padding: '5px 9px', background: 'rgba(54,82,217,0.08)', borderRadius: 8, wordBreak: 'break-all' }}>{invite.code}</code>
          <StatusPill used={used} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'grid', gap: 5 }}>
          <span>Name: {invite.displayName || 'not set'}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Clock3 size={13} />
            {formatTimeLeft(invite.expiresAt)}
          </span>
          <span>Created: {formatDate(invite.createdAt)}</span>
          <span>{used ? `Used by: ${formatDate(invite.claimedAt)}` : 'Unused'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button type="button" onClick={onCopy} title="Copy invite code" style={iconButtonStyle({ color: 'var(--text-secondary)' })}>
          {copied ? <Check size={14} color="var(--easy)" /> : <Copy size={14} />}
        </button>
        {!used && (
          <button type="button" onClick={onDelete} title="Delete unused invite" style={iconButtonStyle({ color: 'var(--danger)' })}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

function StatusPill({ used }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.2,
        padding: '4px 8px',
        borderRadius: 999,
        color: used ? 'var(--text-secondary)' : 'var(--easy)',
        background: used ? 'var(--bg-hover)' : 'var(--easy-soft)',
      }}
    >
      {used ? 'Used' : 'Unused'}
    </span>
  )
}

function formatTimeLeft(expiresAt) {
  if (!expiresAt) return 'No expiration'
  const diffMs = new Date(expiresAt).getTime() - Date.now()
  if (Number.isNaN(diffMs)) return 'No expiration'
  if (diffMs <= 0) return 'Expired'
  const totalMinutes = Math.floor(diffMs / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

function formatDate(value) {
  if (!value) return 'n/a'
  return new Date(value).toLocaleString()
}

const backButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  border: '1px solid var(--border)',
  borderRadius: 999,
  padding: '10px 14px',
  background: 'var(--bg-subtle)',
  color: 'var(--text-primary)',
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 24,
}

const linkButtonStyle = {
  border: 'none',
  background: 'none',
  color: 'var(--accent)',
  fontWeight: 700,
  fontSize: 14,
}

const primaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  border: 'none',
  borderRadius: 12,
  background: 'var(--accent)',
  color: '#fff',
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 700,
  boxShadow: 'var(--shadow-sm)',
}

const secondaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  border: '1px solid var(--border)',
  borderRadius: 12,
  background: 'var(--bg-subtle)',
  color: 'var(--text-primary)',
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 700,
}

const inputStyle = {
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '11px 13px',
  background: 'var(--bg)',
  fontSize: 14,
  fontFamily: 'var(--font-mono)',
}

function iconButtonStyle({ color }) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    border: '1px solid var(--border)',
    borderRadius: 10,
    background: 'var(--bg)',
    color,
  }
}
