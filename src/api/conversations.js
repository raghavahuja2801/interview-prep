const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function createConversation({ problemId }) {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId }),
  })
  if (!res.ok) throw new Error(`Failed to create conversation: ${res.status}`)
  return res.json()
}

export async function fetchConversations(problemId) {
  const params = problemId ? `?problemId=${problemId}` : ''
  const res = await fetch(`${API_BASE}/conversations${params}`)
  if (!res.ok) throw new Error(`Failed to fetch conversations: ${res.status}`)
  return res.json()
}

export async function fetchConversation(id) {
  const res = await fetch(`${API_BASE}/conversations/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch conversation: ${res.status}`)
  return res.json()
}

export async function updateConversation(id, data) {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update conversation: ${res.status}`)
  return res.json()
}

export async function deleteConversation(id) {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`Failed to delete conversation: ${res.status}`)
  return res.json()
}
