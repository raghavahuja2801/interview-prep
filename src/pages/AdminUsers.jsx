import { useEffect, useState } from 'react'
import { ArrowLeft, Mail, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { deleteUser, listUsers, updateUser } from '../api/auth.js'

export default function AdminUsers({ user, onBackHome, onOpenProfile }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const data = await listUsers()
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleRoleChange(id, nextRole) {
    setError('')
    try {
      await updateUser(id, { role: nextRole })
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to update role.')
    }
  }

  async function handleDelete(id, email) {
    setError('')
    const confirmed = window.confirm(`Delete user ${email}? This removes their account and revokes their sessions.`)
    if (!confirmed) return
    try {
      await deleteUser(id)
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to delete user.')
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
            <h1 style={{ margin: 0, fontSize: 30, letterSpacing: -0.8 }}>Users</h1>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 14.5 }}>
              Manage accounts, roles, and metadata.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={onOpenProfile} style={secondaryButtonStyle}>
              <UserRound size={14} />
              Profile
            </button>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 13, color: 'var(--danger)', background: 'var(--danger-soft)', border: '1px solid rgba(209, 69, 59, 0.14)', borderRadius: 12, padding: '10px 12px', marginBottom: 18 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border)', borderRadius: 16 }}>
            No users yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {users.map((u) => (
              <UserRow
                key={u.id}
                u={u}
                isSelf={u.id === user.id}
                onRoleChange={handleRoleChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UserRow({ u, isSelf, onRoleChange, onDelete }) {
  const isAdmin = u.role === 'admin'

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16, background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{u.displayName || u.email}</span>
            {isSelf && <span style={selfBadgeStyle}>You</span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'grid', gap: 5 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Mail size={13} />
              {u.email}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={13} />
              Role: {u.role}
            </span>
            <span>Joined: {formatDate(u.createdAt)}</span>
            <span>Last login: {formatDate(u.lastLoginAt)}</span>
            {u.createdInviteCount > 0 && <span>Invites created: {u.createdInviteCount}</span>}
            {u.claimedInviteCount > 0 && <span>Invites used: {u.claimedInviteCount}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          <select
            value={u.role}
            onChange={(e) => onRoleChange(u.id, e.target.value)}
            disabled={isSelf}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '8px 10px',
              background: 'var(--bg)',
              fontSize: 13,
              fontWeight: 600,
              color: isAdmin ? 'var(--easy)' : 'var(--text-primary)',
            }}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="button"
            onClick={() => onDelete(u.id, u.email)}
            disabled={isSelf}
            title={isSelf ? 'You cannot delete your own account here' : 'Delete user'}
            style={{
              ...iconButtonStyle,
              opacity: isSelf ? 0.4 : 1,
              pointerEvents: isSelf ? 'none' : 'auto',
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(value) {
  if (!value) return 'n/a'
  return new Date(value).toLocaleString()
}

const selfBadgeStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.2,
  padding: '3px 7px',
  borderRadius: 999,
  color: 'var(--accent)',
  background: 'var(--accent-soft)',
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

const iconButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  border: '1px solid var(--border)',
  borderRadius: 10,
  background: 'var(--bg)',
  color: 'var(--danger)',
}
