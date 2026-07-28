const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function fetchProblems(category) {
  const params = category ? `?category=${category}` : ''
  const res = await fetch(`${API_BASE}/problems${params}`)
  if (!res.ok) throw new Error(`Failed to fetch problems: ${res.status}`)
  return res.json()
}

export async function fetchProblemById(id) {
  const res = await fetch(`${API_BASE}/problems/${id}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Failed to fetch problem: ${res.status}`)
  }
  return res.json()
}
