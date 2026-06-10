import { useState, useRef, useCallback } from 'react'

const styles = {
  container: {
    perspective: '1000px',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'relative',
    width: 300,
    height: 400,
    borderRadius: 16,
    transformStyle: 'preserve-3d',
    cursor: 'pointer',
    transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    pointerEvents: 'none',
    zIndex: 2,
  },
  shine: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    pointerEvents: 'none',
    zIndex: 3,
    transition: 'opacity 0.3s',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    textAlign: 'center',
    boxSizing: 'border-box',
  },
}

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
}) {
  const cardRef = useRef(null)
  const [style, setStyle] = useState({
    transform: 'rotateX(0deg) rotateY(0deg)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  })
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 })
  const [shinePos, setShinePos] = useState({ opacity: 0 })
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
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
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
  }, [tiltDegree, glare])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setStyle({
      transform: 'rotateX(0deg) rotateY(0deg)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
    })
    setGlareStyle({ opacity: 0, transition: 'opacity 0.5s' })
    setShinePos({ opacity: 0, transition: 'opacity 0.5s' })
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const bgRgb = hexToRgb(backgroundColor)
  const fgRgb = hexToRgb(foregroundColor)

  return (
    <div style={styles.container}>
      <div
        ref={cardRef}
        style={{
          ...styles.card,
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
        <div
          style={{
            ...styles.content,
            background: image
              ? `url(${image}) center / ${imageFit} no-repeat`
              : `linear-gradient(135deg, ${backgroundColor}, rgb(${bgRgb.r * 0.6},${bgRgb.g * 0.6},${bgRgb.b * 0.6}))`,
            borderRadius,
          }}
        >
          {image && (
            <div style={{ position: 'absolute', inset: 0, borderRadius, background: 'rgba(0,0,0,0.45)', zIndex: 0, pointerEvents: 'none' }} />
          )}
          {isHovered && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius,
                background: `radial-gradient(circle at 50% 0%, ${foregroundColor}11 0%, transparent 60%)`,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          )}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: foregroundColor,
                marginBottom: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transform: 'translateZ(40px)',
                transformStyle: 'preserve-3d',
                textShadow: `0 2px 20px ${foregroundColor}44`,
              }}
            >
              {text}
            </div>
            <div
              style={{
                fontSize: 13,
                color: `rgba(${fgRgb.r},${fgRgb.g},${fgRgb.b},0.7)`,
                lineHeight: 1.6,
                maxWidth: 220,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transform: 'translateZ(24px)',
                transformStyle: 'preserve-3d',
              }}
            >
              {subtext}
            </div>
          </div>
        </div>
        {glare && (
          <div
            style={{
              ...styles.glow,
              background: glareStyle.background || 'none',
              opacity: glareStyle.opacity ?? 0,
              transition: glareStyle.transition,
              borderRadius,
            }}
          />
        )}
        <div
          style={{
            ...styles.shine,
            background: shinePos.background || 'none',
            opacity: shinePos.opacity ?? 0,
            transition: shinePos.transition,
            borderRadius,
          }}
        />
      </div>
    </div>
  )
}
