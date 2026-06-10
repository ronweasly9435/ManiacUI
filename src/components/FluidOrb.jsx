import { useState, useRef, useCallback, useEffect } from 'react'
import './FluidOrb.css'

export default function FluidOrb({
  color = '#7ec8e3',
  secondaryColor = '#6a5acd',
  size = 300,
  speed = 1,
  intensity = 1,
  blur = 40,
}) {
  const orbRef = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMove = useCallback((e) => {
    const el = orbRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    setPos({ x: dx * intensity * 15, y: dy * intensity * 15 })
  }, [intensity])

  const handleLeave = useCallback(() => {
    setHovered(false)
    setPos({ x: 0, y: 0 })
  }, [])

  const handleEnter = useCallback(() => {
    setHovered(true)
  }, [])

  return (
    <div
      ref={orbRef}
      className="fluid-orb"
      style={{
        width: size,
        height: size,
        '--orb-blur': `${blur}px`,
        '--orb-speed': speed,
        '--orb-color': color,
        '--orb-secondary': secondaryColor,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={handleEnter}
    >
      <div
        className="fluid-orb-goo"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: hovered
            ? 'transform 0.08s linear'
            : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <div className="fluid-orb-blob fluid-orb-blob--a" />
        <div className="fluid-orb-blob fluid-orb-blob--b" />
        <div className="fluid-orb-blob fluid-orb-blob--c" />
      </div>
      <div
        className="fluid-orb-shine"
        style={{
          opacity: hovered ? 0.35 : 0,
          transform: `translate(${pos.x * 2.5}px, ${pos.y * 2.5}px)`,
          transition: hovered
            ? 'transform 0.08s linear, opacity 0.25s'
            : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.6s',
        }}
      />
      <div className="fluid-orb-noise" />
      <div className="fluid-orb-glow" />
    </div>
  )
}
