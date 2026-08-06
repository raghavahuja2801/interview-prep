const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      return null
    }
    throw new Error(`Failed to fetch current user: ${res.status}`)
  }

  return res.json()
}

export async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Login failed with ${res.status}`)
  }

  return res.json()
}

export async function register({ email, password, inviteCode, displayName }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, inviteCode, displayName }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Registration failed with ${res.status}`)
  }

  return res.json()
}

export async function logout() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Logout failed with ${res.status}`)
  }

  return res.json()
}

export async function createInvite({ expiresInDays = 30, displayName }) {
  const res = await fetch(`${API_BASE}/auth/invites`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresInDays, displayName }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Invite creation failed with ${res.status}`)
  }

  return res.json()
}

export async function fetchInvite(code) {
  const res = await fetch(`${API_BASE}/auth/invites/${encodeURIComponent(code)}`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Invite lookup failed with ${res.status}`)
  }

  return res.json()
}

export async function listInvites() {
  const res = await fetch(`${API_BASE}/auth/invites`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Invite list failed with ${res.status}`)
  }

  return res.json()
}

export async function deleteInvite(code) {
  const res = await fetch(`${API_BASE}/auth/invites/${encodeURIComponent(code)}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Invite delete failed with ${res.status}`)
  }

  return res.json()
}

export async function listUsers() {
  const res = await fetch(`${API_BASE}/auth/users`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `User list failed with ${res.status}`)
  }

  return res.json()
}

export async function updateUser(id, updates) {
  const res = await fetch(`${API_BASE}/auth/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `User update failed with ${res.status}`)
  }

  return res.json()
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/auth/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `User delete failed with ${res.status}`)
  }

  return res.json()
}