import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import DifficultyTag from './DifficultyTag.jsx'

export default function ProblemCard({ problem }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/problem/${problem.id}`)}
      className="problem-card"
      style={{
        textAlign: 'left',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'border-color 120ms ease, transform 120ms ease, box-shadow 120ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
          }}
        >
          {problem.icon}
        </div>
        <DifficultyTag level={problem.difficulty} />
      </div>

      <div>
        <h3 style={{ margin: '0 0 6px', fontSize: 15.5, fontWeight: 600, color: 'var(--text-primary)' }}>
          {problem.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {problem.summary}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {problem.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-tertiary)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 5,
                padding: '2px 6px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)', fontSize: 12 }}>
          <Clock size={12} strokeWidth={2} />
          {problem.estimatedTime}
        </div>
      </div>
    </button>
  )
}
