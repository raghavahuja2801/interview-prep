import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Problem from './pages/Problem.jsx'
import Profile from './pages/Profile.jsx'
import AdminInvites from './pages/AdminInvites.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import Auth from './pages/Auth.jsx'
import UserMenu from './components/UserMenu.jsx'
import { fetchCurrentUser, logout } from './api/auth.js'

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
        <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
        <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
        <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const showHomeControls = location.pathname === '/'

  useEffect(() => {
    let cancelled = false

    fetchCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser?.user || null)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    try {
      await logout()
    } catch (_) {
      // Ignore logout network failures and clear the local session anyway.
    } finally {
      setUser(null)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Auth onAuthenticated={setUser} />
  }

  return (
    <>
      {showHomeControls && (
        <UserMenu
          user={user}
          onProfile={() => navigate('/profile')}
          onInvites={() => navigate('/admin/invites')}
          onUsers={() => navigate('/admin/users')}
          onLogout={handleLogout}
          showAdminTools={user.role === 'admin'}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problem/:id" element={<Problem user={user} />} />
        <Route
          path="/profile"
          element={
            <Profile
              user={user}
              onBackHome={() => navigate('/')}
              onOpenInvites={() => navigate('/admin/invites')}
              onOpenUsers={() => navigate('/admin/users')}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/admin/invites" element={<AdminInvites user={user} onBackHome={() => navigate('/')} onOpenProfile={() => navigate('/profile')} />} />
        <Route path="/admin/users" element={<AdminUsers user={user} onBackHome={() => navigate('/')} onOpenProfile={() => navigate('/profile')} />} />
      </Routes>
    </>
  )
}
