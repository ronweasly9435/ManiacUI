import { useState, useRef, useCallback, useEffect } from 'react'
import './MagneticStack.css'

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function interpolateColor(c1, c2, t) {
  const r = Math.round(c1.r + (c2.r - c1.r) * t)
  const g = Math.round(c1.g + (c2.g - c1.g) * t)
  const b = Math.round(c1.b + (c2.b - c1.b) * t)
  return { r, g, b }
}

const PURPLE = { r: 160, g: 50, b: 200 }

export default function MagneticStack({
  count = 5,
  colors,
  width = 280,
  height = 180,
  borderRadius = 16,
  intensity = 20,
  fanRadius = 120,
  glare = true,
  accent = '#7ec8e3',
  stagger = 0.15,
}) {
  const containerRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [fanned, setFanned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const rafRef = useRef(null)

  const accentRgb = hexToRgb(accent)

  const cardColors = colors || Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 0
    const c = interpolateColor(accentRgb, PURPLE, t)
    return `rgb(${c.r},${c.g},${c.b})`
  })

  const posRef = useRef(
    Array.from({ length: count }, (_, i) => ({
      x: (count - 1 - i) * 3,
      y: (count - 1 - i) * 3,
      rot: (count - 1 - i) * 2,
    }))
  )
  const [positions, setPositions] = useState(() => posRef.current.map(p => ({ ...p })))

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 })
    setHovered(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
  }, [])

  const toggleFan = useCallback(() => {
    setFanned(f => !f)
  }, [])

  useEffect(() => {
    const loop = () => {
      const current = posRef.current
      let changed = false

      for (let i = 0; i < count; i++) {
        let tx, ty, trot

        if (fanned) {
          const spread = 0.6 * Math.PI
          const angle = -spread / 2 + (count > 1 ? i / (count - 1) : 0.5) * spread
          tx = Math.cos(angle) * fanRadius
          ty = Math.sin(angle) * fanRadius - fanRadius * 0.3
          trot = angle * (180 / Math.PI) * 0.3
        } else {
          const baseX = (count - 1 - i) * 3
          const baseY = (count - 1 - i) * 3
          const baseRot = (count - 1 - i) * 2
          const factor = Math.max(0, 1 - i * 0.15)
          tx = baseX + mousePos.x * intensity * factor
          ty = baseY + mousePos.y * intensity * factor
          trot = baseRot + mousePos.x * intensity * 0.02 * factor
        }

        const lerp = Math.max(0.02, stagger * Math.max(0.05, 1 - i * 0.1))
        current[i].x += (tx - current[i].x) * lerp
        current[i].y += (ty - current[i].y) * lerp
        current[i].rot += (trot - current[i].rot) * lerp

        if (Math.abs(current[i].x - tx) > 0.05 || Math.abs(current[i].y - ty) > 0.05) {
          changed = true
        }
      }

      setPositions(current.map(p => ({ ...p })))
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [count, mousePos, fanned, intensity, fanRadius, stagger])

  return (
    <div
      ref={containerRef}
      className="magnetic"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={toggleFan}
    >
      <div
        className="magnetic-glow"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accent}22 0%, transparent 60%)` }}
      />

      <div className="magnetic-stack">
        {Array.from({ length: count }, (_, i) => {
          const pos = positions[i] || { x: 0, y: 0, rot: 0 }
          const zIndex = fanned ? i + 1 : count - i
          const scale = hovered && i === 0 ? 1.02 : 1

          return (
            <div
              key={i}
              className={`magnetic-card ${glare ? 'glare' : ''} ${fanned ? 'fanned' : ''}`}
              style={{
                width,
                height,
                borderRadius,
                zIndex,
                transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rot}deg) scale(${scale})`,
                background: `linear-gradient(135deg, ${cardColors[i]}, rgba(0,0,0,0.3))`,
              }}
            >
              <div
                className="magnetic-gradient-border"
                style={{
                  borderRadius: borderRadius + 1,
                  background: `conic-gradient(from 0deg, transparent, ${accent}, transparent 60%, ${accent}, transparent)`,
                }}
              />
              <div className="magnetic-glass" style={{ borderRadius }} />
              {glare && (
                <div
                  className="magnetic-glare"
                  style={{
                    background: `radial-gradient(circle at ${50 + mousePos.x * 20}% ${50 + mousePos.y * 20}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
                    borderRadius,
                    opacity: hovered ? 1 : 0,
                  }}
                />
              )}
              <div className="magnetic-content">
                <div className="magnetic-number">#{i + 1}</div>
                <div className="magnetic-label">{fanned ? 'Click to retract' : 'Click to fan'}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="magnetic-hint" style={{ opacity: hovered && !fanned ? 1 : 0 }}>
        Click to fan out
      </div>
    </div>
  )
}
