import { useState, useRef, useCallback } from 'react'
import './ShockButton.css'

export default function ShockButton({
  label = 'Click Me',
  color = '#7ec8e3',
  size = 'md',
  variant = 'primary',
  glow = true,
  onClick,
}) {
  const btnRef = useRef(null)
  const [rings, setRings] = useState([])
  const idRef = useRef(0)

  const handleClick = useCallback((e) => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = ++idRef.current

    const batch = [0, 120, 260].map((delay, i) => ({
      key: `${id}-${i}`,
      x,
      y,
      delay,
      size: 16 + i * 14,
    }))

    setRings(prev => [...prev, ...batch])
    setTimeout(() => setRings(prev => prev.filter(r => !batch.find(b => b.key === r.key))), 900)

    onClick?.(e)
  }, [onClick])

  return (
    <button
      ref={btnRef}
      className={`shock-btn shock-btn--${variant} shock-btn--${size}${glow ? ' shock-btn--glow' : ''}`}
      style={{ '--shock-color': color }}
      onClick={handleClick}
    >
      <span className="shock-btn-shimmer" />
      <span className="shock-btn-label">{label}</span>
      {rings.map(r => (
        <span
          key={r.key}
          className="shock-ring"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            animationDelay: `${r.delay}ms`,
          }}
        />
      ))}
    </button>
  )
}
