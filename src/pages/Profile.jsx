import { ArrowLeft, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react'

export default function Profile({ user, onBackHome, onOpenInvites, onOpenUsers, onLogout }) {
  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px 80px' }}>
        <button
          type="button"
          onClick={onBackHome}
          style={{
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
          }}
        >
          <ArrowLeft size={14} />
          Back to home
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)', gap: 18 }}>
          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={avatarStyle}>
                <UserRound size={20} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: 0.6 }}>
                  Profile
                </div>
                <h1 style={{ margin: '4px 0 0', fontSize: 28, letterSpacing: -0.8 }}>{user.displayName || 'Your account'}</h1>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <InfoRow icon={<Mail size={15} />} label="Email" value={user.email} />
              <InfoRow icon={<ShieldCheck size={15} />} label="Role" value={user.role} />
              <InfoRow icon={<UserRound size={15} />} label="User ID" value={user.id} mono />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onLogout}
                style={primaryButtonStyle}
              >
                Logout
              </button>
            </div>
          </section>

          <aside style={cardStyle}>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: 0.6, marginBottom: 8 }}>
              Admin tools
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Admin pages</h2>
            <p style={{ margin: '0 0 18px', color: 'var(--text-secondary)', fontSize: 14.5, lineHeight: 1.6 }}>
              Invite codes and user accounts now live on dedicated admin pages.
            </p>
            <button
              type="button"
              onClick={onOpenInvites}
              style={{
                ...primaryButtonStyle,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
              }}
            >
              <KeyRound size={15} />
              Open invite page
            </button>

            <button
              type="button"
              onClick={onOpenUsers}
              style={{
                ...primaryButtonStyle,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                marginTop: 10,
              }}
            >
              <UserRound size={15} />
              Open users page
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value, mono = false }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '18px 110px minmax(0, 1fr)', gap: 12, alignItems: 'center' }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontSize: 14, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}

const cardStyle = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(251,251,250,0.98))',
  border: '1px solid var(--border)',
  borderRadius: 20,
  padding: 22,
  boxShadow: 'var(--shadow-sm)',
}

const avatarStyle = {
  width: 46,
  height: 46,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
  background: 'linear-gradient(135deg, var(--accent) 0%, #2840ae 100%)',
}

const primaryButtonStyle = {
  border: 'none',
  borderRadius: 14,
  background: 'var(--accent)',
  color: '#fff',
  padding: '11px 14px',
  fontSize: 13,
  fontWeight: 700,
  boxShadow: 'var(--shadow-sm)',
}