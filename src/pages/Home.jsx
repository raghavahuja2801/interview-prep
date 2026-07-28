import { useState, useEffect } from 'react'
import { fetchProblems } from '../api/problems.js'
import ProblemCard from '../components/ProblemCard.jsx'

const CATEGORIES = ['HLD', 'LLD']

export default function Home() {
  const [category, setCategory] = useState('HLD')
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchProblems(category)
      .then((data) => {
        if (!cancelled) setProblems(data)
      })
      .catch(() => {
        if (!cancelled) setProblems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [category])

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              color: 'var(--text-tertiary)',
              letterSpacing: 0.3,
            }}
          >
            SYSTEM DESIGN PRACTICE
          </span>
        </div>

        <h1 style={{ fontSize: 32, margin: '0 0 10px', fontWeight: 700, letterSpacing: -0.5 }}>
          Pick a problem to start
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 32px', maxWidth: 560 }}>
          Each problem opens into a live session with an AI interviewer. Read the brief,
          gather requirements, and talk through your design the way you would in a real
          interview.
        </p>

        {/* category toggle */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 28,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 3,
            width: 'fit-content',
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                fontWeight: 600,
                letterSpacing: 0.3,
                padding: '6px 16px',
                border: 'none',
                borderRadius: 5,
                background: category === cat ? 'var(--bg)' : 'transparent',
                color: category === cat ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: category === cat ? 'var(--shadow-sm)' : 'none',
                transition: 'background 120ms ease, color 120ms ease',
              }}
            >
              {cat === 'HLD' ? 'High-Level Design' : 'Low-Level Design'}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 0',
              gap: 6,
            }}
          >
            <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
            <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
            <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', display: 'inline-block' }} />
          </div>
        ) : problems.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', textAlign: 'center', padding: '60px 0' }}>
            No problems found for this category.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}
          >
            {problems.map((p) => (
              <ProblemCard key={p.id} problem={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
