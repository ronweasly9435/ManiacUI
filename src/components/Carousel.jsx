import { useState, useRef, useCallback, useEffect, useMemo } from 'react'

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
  'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=400',
  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
  'https://images.unsplash.com/photo-1636622433525-127afdf3662d?w=400',
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=400',
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=400',
]

const COLORS = [
  '#1a1a3e', '#2e1a3e', '#1a3e2e', '#3e2e1a', '#1a2e3e', '#3e1a2e', '#2e3e1a', '#1a2a2e',
]

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

const DEFAULT_LABELS = ['Explore', 'Create', 'Dream', 'Build', 'Innovate', 'Design', 'Launch', 'Grow']

export default function Carousel({
  images = DEFAULT_IMAGES,
  labels,
  cardWidth = 220,
  cardHeight = 300,
  radius = 380,
  perspective = 1200,
  autoRotate = true,
  autoRotateSpeed = 0.8,
  glare = true,
  reflection = true,
  backgroundColor = '#0a0a0f',
  borderRadius = 16,
  cardBackground = '#1a1a2e',
}) {
  const containerRef = useRef(null)
  const [angle, setAngle] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const dragRef = useRef({ startX: 0, startAngle: 0, velocity: 0, lastX: 0 })
  const rafRef = useRef(null)
  const autoRef = useRef(null)

  const count = images.length
  const step = 360 / count

  const cards = useMemo(() =>
    images.map((img, i) => ({
      img,
      color: COLORS[i % COLORS.length],
      label: labels ? labels[i % labels.length] : DEFAULT_LABELS[i % DEFAULT_LABELS.length],
    })),
    [images, labels]
  )

  const goTo = useCallback((dir) => {
    setAngle(a => a + dir * step * 2)
  }, [step])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    goTo(e.deltaY > 0 ? 1 : -1)
  }, [goTo])

  const handleDragStart = useCallback((e) => {
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    setIsDragging(true)
    dragRef.current.startX = x
    dragRef.current.startAngle = angle
    dragRef.current.velocity = 0
    dragRef.current.lastX = x
    if (autoRef.current) cancelAnimationFrame(autoRef.current)
  }, [angle])

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const dx = x - dragRef.current.lastX
    dragRef.current.velocity = dx * 0.5
    dragRef.current.lastX = x
    const delta = (x - dragRef.current.startX) * 0.35
    setAngle(dragRef.current.startAngle + delta)
  }, [isDragging])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    const vel = dragRef.current.velocity
    if (Math.abs(vel) > 0.5) {
      const start = performance.now()
      const initialVel = vel
      const friction = 0.92

      const momentum = (now) => {
        const elapsed = (now - start) / 16
        const decay = Math.pow(friction, elapsed)
        if (decay < 0.01) return
        setAngle(a => a + initialVel * decay * 0.8)
        rafRef.current = requestAnimationFrame(momentum)
      }
      rafRef.current = requestAnimationFrame(momentum)
    }
  }, [])

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  useEffect(() => {
    if (!autoRotate || isDragging) {
      if (autoRef.current) cancelAnimationFrame(autoRef.current)
      return
    }
    let lastTime = performance.now()
    const tick = (now) => {
      const dt = (now - lastTime) / 16
      lastTime = now
      setAngle(a => a + autoRotateSpeed * dt * 0.3)
      autoRef.current = requestAnimationFrame(tick)
    }
    autoRef.current = requestAnimationFrame(tick)
    return () => { if (autoRef.current) cancelAnimationFrame(autoRef.current) }
  }, [autoRotate, autoRotateSpeed, isDragging])

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const activeIndex = useMemo(() => {
    const normalized = ((angle % 360) + 360) % 360
    const closest = Math.round(normalized / step) % count
    return (count - closest) % count
  }, [angle, step, count])

  const bgRgb = hexToRgb(backgroundColor)
  const tiltX = (mousePos.x - 0.5) * 6
  const tiltY = (mousePos.y - 0.5) * -6

  return (
    <div
      ref={containerRef}
      onMouseDown={handleDragStart}
      onMouseMove={(e) => { handleDragMove(e); handleMouseMove(e) }}
      onMouseUp={handleDragEnd}
      onMouseLeave={() => { if (isDragging) handleDragEnd(); setIsDragging(false) }}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      onWheel={handleWheel}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: backgroundColor,
        position: 'relative',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', width: '70%', height: '70%',
        borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, rgba(126,200,227,0.04) 0%, transparent 70%)`,
        pointerEvents: 'none',
        top: '15%', left: '15%',
      }} />
      <div style={{
        position: 'absolute', width: '50%', height: '50%',
        borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, rgba(126,200,227,0.03) 0%, transparent 70%)`,
        pointerEvents: 'none',
        bottom: '5%', right: '5%',
      }} />

      {/* Particle sparkle dots */}
      {autoRotate && !isDragging && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 3, height: 3,
              borderRadius: '50%',
              background: 'rgba(126,200,227,0.5)',
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animation: `carousel-float ${3 + Math.random() * 4}s ${Math.random() * 3}s infinite`,
              opacity: 0,
            }} />
          ))}
        </div>
      )}

      {/* 3D Stage */}
      <div
        style={{
          perspective,
          perspectiveOrigin: '50% 50%',
          width: cardWidth + 80,
          height: cardHeight + 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotateX(${tiltY}deg) rotateY(${tiltX}deg)`,
          transition: isDragging ? 'none' : 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateY(${angle}deg)`,
            transition: isDragging ? 'none' : 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {cards.map((card, i) => {
            const cardAngle = step * i
            const isActive = i === activeIndex
            const isHovered = i === hoveredIndex
            const zOffset = isActive ? 30 : 0
            const scale = isActive ? 1.12 : isHovered ? 1.06 : 1
            const elevation = isActive ? 20 : 0

            return (
              <div key={i} style={{ position: 'absolute', left: -cardWidth / 2, top: -cardHeight / 2 - elevation, transformStyle: 'preserve-3d' }}>
                {/* Card */}
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius,
                    overflow: 'hidden',
                    position: 'relative',
                    transform: `rotateY(${cardAngle}deg) translateZ(${radius + zOffset}px) scale(${scale})`,
                    transition: isDragging
                      ? 'none'
                      : 'transform 1s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s',
                    boxShadow: isActive
                      ? `0 0 40px rgba(126,200,227,0.25), 0 20px 60px rgba(0,0,0,0.5)`
                      : `0 8px 32px rgba(0,0,0,0.4)`,
                    cursor: 'pointer',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Background image */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `url(${card.img}) center / cover no-repeat`,
                    filter: isActive ? 'brightness(1.1) saturate(1.1)' : 'brightness(0.9)',
                    transition: 'filter 0.6s',
                  }} />
                  {/* Overlay gradient */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 100%)`,
                    zIndex: 1,
                  }} />
                  {isActive && (
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 2,
                      background: 'linear-gradient(135deg, rgba(126,200,227,0.15) 0%, transparent 50%)',
                      pointerEvents: 'none',
                    }} />
                  )}
                  {/* Glare */}
                  {glare && isHovered && (
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 3,
                      background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                      pointerEvents: 'none',
                      transition: 'background 0.15s',
                    }} />
                  )}
                  {/* Active border glow */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', inset: -1, borderRadius: borderRadius + 1, zIndex: 4,
                      background: 'linear-gradient(135deg, rgba(126,200,227,0.4), rgba(126,200,227,0.1), rgba(126,200,227,0.4))',
                      mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                      maskComposite: 'exclude',
                      padding: 1,
                      pointerEvents: 'none',
                    }} />
                  )}
                  {/* Content */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4,
                    padding: '20px 18px 22px',
                    transform: `translateZ(6px)`,
                    transformStyle: 'preserve-3d',
                  }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 2,
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#fff',
                      textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                    }}>
                      {card.label}
                    </div>
                    <div style={{
                      width: 24,
                      height: 2,
                      background: 'rgba(126,200,227,0.6)',
                      marginTop: 10,
                      borderRadius: 1,
                      transition: 'width 0.4s',
                    }} />
                  </div>
                </div>

                {/* Reflection */}
                {reflection && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: cardHeight + 8,
                    width: cardWidth,
                    height: cardHeight * 0.35,
                    borderRadius,
                    overflow: 'hidden',
                    transform: `rotateY(${cardAngle}deg) translateZ(${radius + zOffset}px) scaleY(-1) scale(${scale})`,
                    opacity: 0.15,
                    transition: isDragging ? 'none' : 'transform 1s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                    pointerEvents: 'none',
                  }}>
                    <div style={{
                      width: '100%', height: '100%',
                      background: `url(${card.img}) center / cover no-repeat`,
                    }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(to bottom, rgba(10,10,15,0.4), ${backgroundColor})`,
                    }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation arrows */}
      <button onClick={(e) => { e.stopPropagation(); goTo(-1) }} style={{
        position: 'absolute', left: 24, top: '50%', marginTop: -20,
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: 18, cursor: 'pointer', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(126,200,227,0.15)'; e.currentTarget.style.color = '#7ec8e3'; e.currentTarget.style.borderColor = 'rgba(126,200,227,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
      >&#8249;</button>
      <button onClick={(e) => { e.stopPropagation(); goTo(1) }} style={{
        position: 'absolute', right: 24, top: '50%', marginTop: -20,
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: 18, cursor: 'pointer', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(126,200,227,0.15)'; e.currentTarget.style.color = '#7ec8e3'; e.currentTarget.style.borderColor = 'rgba(126,200,227,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
      >&#8250;</button>

      {/* Dots */}
      <div style={{
        position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8, zIndex: 10,
      }}>
        {cards.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setAngle(a => a + (i - activeIndex) * step) }} style={{
            width: i === activeIndex ? 20 : 6,
            height: 6,
            borderRadius: 3,
            border: 'none',
            background: i === activeIndex ? '#7ec8e3' : 'rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          }} />
        ))}
      </div>
    </div>
  )
}
