import { useState, useRef, useCallback } from 'react'
import './WarpCard.css'

export default function WarpCard({
  width = 320,
  height = 420,
  glowColor = '#7ec8e3',
  intensity = 15,
  chromatic = true,
  text = 'Warp',
  subtext = 'Move your cursor to bend reality',
  bgColor = '#0a0a0f',
  borderRadius = 16,
}) {
  const cardRef = useRef(null)
  const [warpStyle, setWarpStyle] = useState({
    transform: 'skewX(0deg) skewY(0deg)',
    transformOrigin: '50% 50%',
  })
  const [glowPos, setGlowPos] = useState({ opacity: 0, x: 50, y: 50 })
  const [chromaticStyle, setChromaticStyle] = useState({ textShadow: 'none' })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = (e.clientX - centerX) / (rect.width / 2)
    const dy = (e.clientY - centerY) / (rect.height / 2)

    const skewXVal = dy * intensity
    const skewYVal = dx * intensity

    setWarpStyle({
      transform: `skewX(${skewXVal}deg) skewY(${skewYVal}deg)`,
      transformOrigin: `${50 + dx * 15}% ${50 + dy * 15}%`,
      transition: 'none',
    })

    const relX = ((e.clientX - rect.left) / rect.width) * 100
    const relY = ((e.clientY - rect.top) / rect.height) * 100

    setGlowPos({
      opacity: 0.5,
      x: relX,
      y: relY,
      transition: 'none',
    })

    if (chromatic) {
      setChromaticStyle({
        textShadow: `
          ${dx * 7}px ${dy * 7}px 0 rgba(0, 255, 255, 0.5),
          ${-dx * 7}px ${-dy * 7}px 0 rgba(255, 0, 0, 0.5)
        `,
        transition: 'none',
      })
    }
  }, [intensity, chromatic])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setWarpStyle({
      transform: 'skewX(0deg) skewY(0deg)',
      transformOrigin: '50% 50%',
      transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
    })
    setGlowPos({ opacity: 0, x: 50, y: 50, transition: 'opacity 0.5s' })
    setChromaticStyle({ textShadow: 'none', transition: 'text-shadow 0.5s' })
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  return (
    <div className="warpcard" style={{ width, height }}>
      <div
        ref={cardRef}
        className="warpcard-card"
        style={{ width, height, borderRadius, backgroundColor: bgColor }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <div className="warpcard-grid" style={{ borderRadius }} />
        <div
          className="warpcard-glow"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}77 0%, transparent 60%)`,
            opacity: glowPos.opacity,
            transition: glowPos.transition,
            borderRadius,
          }}
        />
        <div
          className="warpcard-content"
          style={{
            ...warpStyle,
            borderRadius,
          }}
        >
          {isHovered && chromatic && (
            <div className="warpcard-chromatic" style={{ borderRadius }} />
          )}
          <div className="warpcard-text" style={chromaticStyle}>
            <div className="warpcard-title">{text}</div>
            <div className="warpcard-sub">{subtext}</div>
          </div>
        </div>
        <div className="warpcard-grain" style={{ borderRadius }} />
      </div>
    </div>
  )
}
