import { useState, useEffect, useRef } from 'react'
import { Play, Pause } from 'lucide-react'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function InterviewTimer({ running, initialElapsed = 0, onElapsedChange, onPause }) {
  const [elapsed, setElapsed] = useState(initialElapsed)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)

  // Sync when a past conversation is loaded with saved duration
  useEffect(() => {
    setElapsed(initialElapsed)
  }, [initialElapsed])

  // Tick
  useEffect(() => {
    if (!running || paused) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      return
    }

    intervalRef.current = setInterval(() => {
      setElapsed((s) => {
        const next = s + 1
        onElapsedChange?.(next)
        return next
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [running, paused, onElapsedChange])

  // Reset when interview stops or restarts
  useEffect(() => {
    if (!running) {
      setElapsed(initialElapsed || 0)
      setPaused(false)
    }
  }, [running, initialElapsed])

  function handleTogglePause() {
    setPaused((prev) => {
      const next = !prev
      // Report the current elapsed + new pause state so ChatPanel can save
      onPause?.({ elapsed, paused: next })
      return next
    })
  }

  return (
    <div
      style={{
        display: !running && !initialElapsed ? 'none' : 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 12.5,
        fontWeight: 600,
        color: 'var(--text-secondary)',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '3px 8px',
      }}
    >
      <span>{formatTime(elapsed)}</span>
      <button
        onClick={handleTogglePause}
        title={paused ? 'Resume timer' : 'Pause timer'}
        style={{
          background: 'none',
          border: 'none',
          padding: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: paused ? 'var(--accent)' : 'var(--text-tertiary)',
          cursor: 'pointer',
        }}
      >
        {paused ? <Play size={11} strokeWidth={2.5} /> : <Pause size={11} strokeWidth={2.5} />}
      </button>
    </div>
  )
}
