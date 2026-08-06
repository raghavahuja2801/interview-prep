import { useState } from 'react'
import { ChevronDown, KeyRound, LogOut, Users, UserRound } from 'lucide-react'

function getInitials(user) {
  const source = user?.displayName || user?.email || 'U'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export default function UserMenu({ user, onProfile, onInvites, onUsers, onLogout, showAdminTools }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        top: 18,
        right: 18,
        zIndex: 30,
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={onProfile}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: '1px solid var(--border)',
          borderRadius: 999,
          padding: '8px 12px 8px 8px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'var(--shadow-md)',
          color: 'var(--text-primary)',
        }}
        title="Open profile"
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent) 0%, #2840ae 100%)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.3,
          }}
        >
          {getInitials(user)}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
          {user.displayName || user.email}
          <ChevronDown size={14} color="var(--text-tertiary)" />
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            minWidth: 220,
            background: 'rgba(255,255,255,0.98)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 18px 50px rgba(15, 23, 42, 0.14)',
            padding: 8,
          }}
        >
          <button
            type="button"
            onClick={onProfile}
            style={menuButtonStyle}
          >
            <UserRound size={15} />
            Profile
          </button>

          {showAdminTools && (
            <button
              type="button"
              onClick={onInvites}
              style={menuButtonStyle}
            >
              <KeyRound size={15} />
              Invite codes
            </button>
          )}

          {showAdminTools && (
            <button
              type="button"
              onClick={onUsers}
              style={menuButtonStyle}
            >
              <Users size={15} />
              Users
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            style={menuButtonStyle}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

const menuButtonStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  border: 'none',
  background: 'transparent',
  padding: '10px 12px',
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-primary)',
  textAlign: 'left',
}