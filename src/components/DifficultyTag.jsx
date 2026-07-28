const MAP = {
  Easy: { color: 'var(--easy)', bg: 'var(--easy-soft)' },
  Medium: { color: 'var(--medium)', bg: 'var(--medium-soft)' },
  Hard: { color: 'var(--hard)', bg: 'var(--hard-soft)' },
}

export default function DifficultyTag({ level }) {
  const style = MAP[level] || MAP.Easy
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px 3px 7px',
        borderRadius: 999,
        background: style.bg,
        color: style.color,
        fontSize: 12.5,
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        letterSpacing: 0.2,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: style.color,
          display: 'inline-block',
        }}
      />
      {level}
    </span>
  )
}
