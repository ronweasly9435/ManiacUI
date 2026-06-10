import { useState, useRef, useCallback } from 'react'
import './TiltCard.css'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 }
}

export default function TiltCard({
  backgroundColor = '#1a1a2e',
  foregroundColor = '#ffffff',
  text = 'Hover Me',
  subtext = 'Move your cursor over the card',
  glare = true,
  tiltDegree = 15,
  borderRadius = 16,
  width = 300,
  height = 400,
  image = 'https://wallpapercave.com/wp/wp12409453.jpg',
  imageFit = 'cover',
  glowColor = '#7ec8e3',
  parallax = true,
  scale = 1.02,
}) {
  const cardRef = useRef(null)
  const [style, setStyle] = useState({
    transform: 'rotateX(0deg) rotateY(0deg) scale(1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  })
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 })
  const [shinePos, setShinePos] = useState({ opacity: 0 })
  const [glowPos, setGlowPos] = useState({ opacity: 0, x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    const rotateY = (mouseX / (rect.width / 2)) * tiltDegree
    const rotateX = -(mouseY / (rect.height / 2)) * tiltDegree

    setStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
      boxShadow: `${-mouseX * 0.08}px ${-mouseY * 0.08}px 40px rgba(0,0,0,0.4)`,
      transition: 'box-shadow 0.1s',
    })

    const relX = ((e.clientX - rect.left) / rect.width) * 100
    const relY = ((e.clientY - rect.top) / rect.height) * 100

    if (glare) {
      setGlareStyle({
        opacity: 0.25,
        background: `radial-gradient(circle at ${relX}% ${relY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
        transition: 'none',
      })
    }

    setShinePos({
      opacity: 0.35,
      background: `radial-gradient(circle at ${relX}% ${relY}%, rgba(255,255,255,0.08) 0%, transparent 50%)`,
      transition: 'none',
    })

    setGlowPos({
      opacity: 0.6,
      x: relX,
      y: relY,
      transition: 'none',
    })
  }, [tiltDegree, glare, scale])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setStyle({
      transform: 'rotateX(0deg) rotateY(0deg) scale(1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
    })
    setGlareStyle({ opacity: 0, transition: 'opacity 0.5s' })
    setShinePos({ opacity: 0, transition: 'opacity 0.5s' })
    setGlowPos({ opacity: 0, x: 50, y: 50, transition: 'opacity 0.5s' })
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const bgRgb = hexToRgb(backgroundColor)
  const fgRgb = hexToRgb(foregroundColor)

  return (
    <div className="tiltcard" style={{ width, height }}>
      <div
        ref={cardRef}
        className="tiltcard-card"
        style={{
          transform: style.transform,
          boxShadow: style.boxShadow,
          transition: style.transition,
          width,
          height,
          borderRadius,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <div className="tiltcard-border" style={{ borderRadius }} />
        <div
          className="tiltcard-glow"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}88 0%, transparent 60%)`,
            opacity: glowPos.opacity,
            transition: glowPos.transition,
            borderRadius,
          }}
        />
        <div
          className="tiltcard-content"
          style={{
            background: image
              ? `url(${image}) center / ${imageFit} no-repeat`
              : `linear-gradient(135deg, ${backgroundColor}, rgb(${bgRgb.r * 0.6},${bgRgb.g * 0.6},${bgRgb.b * 0.6}))`,
            borderRadius,
          }}
        >
          {image && (
            <div className="tiltcard-overlay" style={{ borderRadius }} />
          )}
          {isHovered && (
            <div
              className="tiltcard-light"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${foregroundColor}11 0%, transparent 60%)`,
              }}
            />
          )}
          <div className="tiltcard-layers">
            {parallax && (
              <div className="tiltcard-deco" style={{ color: foregroundColor }}>
                &#9670;
              </div>
            )}
            <div
              className="tiltcard-title"
              style={{
                color: foregroundColor,
                textShadow: `0 2px 20px ${foregroundColor}44`,
                transform: parallax ? 'translateZ(40px)' : 'none',
              }}
            >
              {text}
            </div>
            <div
              className="tiltcard-subtitle"
              style={{
                color: `rgba(${fgRgb.r},${fgRgb.g},${fgRgb.b},0.7)`,
                transform: parallax ? 'translateZ(24px)' : 'none',
              }}
            >
              {subtext}
            </div>
          </div>
        </div>
        {glare && (
          <div
            className="tiltcard-glare"
            style={{
              background: glareStyle.background || 'none',
              opacity: glareStyle.opacity ?? 0,
              transition: glareStyle.transition,
              borderRadius,
            }}
          />
        )}
        <div
          className="tiltcard-shine"
          style={{
            background: shinePos.background || 'none',
            opacity: shinePos.opacity ?? 0,
            transition: shinePos.transition,
            borderRadius,
          }}
        />
        <div className="tiltcard-grain" style={{ borderRadius }} />
      </div>
    </div>
  )
}
