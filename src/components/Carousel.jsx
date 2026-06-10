import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import './Carousel.css'

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

const DEFAULT_LABELS = ['Explore', 'Create', 'Dream', 'Build', 'Innovate', 'Design', 'Launch', 'Grow']

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

export default function Carousel({
  images = DEFAULT_IMAGES,
  labels,
  cardWidth = 220,
  cardHeight = 300,
  radius = 380,
  autoRotate = true,
  autoRotateSpeed = 0.8,
  glare = true,
  reflection = true,
  backgroundColor = '#0a0a0f',
  borderRadius = 16,
  accent = '#7ec8e3',
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
      label: labels ? labels[i % labels.length] : DEFAULT_LABELS[i % DEFAULT_LABELS.length],
    })),
    [images, labels]
  )

  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, () => ({
      top: 20 + Math.random() * 60,
      left: 10 + Math.random() * 80,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 4,
    })),
    []
  )

  const goTo = useCallback((dir) => {
    setAngle(a => a + dir * step * 2)
  }, [step])

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

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    goTo(e.deltaY > 0 ? 1 : -1)
  }, [goTo])

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

  const accentRgb = hexToRgb(accent)
  const tiltX = (mousePos.x - 0.5) * 6
  const tiltY = (mousePos.y - 0.5) * -6

  return (
    <div
      ref={containerRef}
      className="carousel"
      style={{
        background: backgroundColor,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleDragStart}
      onMouseMove={(e) => { handleDragMove(e); handleMouseMove(e) }}
      onMouseUp={handleDragEnd}
      onMouseLeave={() => { if (isDragging) handleDragEnd(); setIsDragging(false) }}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      onWheel={handleWheel}
    >
      <div
        className="carousel-ambient carousel-ambient-large"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accent}0a 0%, transparent 70%)` }}
      />
      <div
        className="carousel-ambient carousel-ambient-small"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accent}08 0%, transparent 70%)` }}
      />

      {autoRotate && !isDragging && (
        <div className="carousel-sparkles">
          {sparkles.map((s, i) => (
            <div
              key={i}
              className="carousel-sparkle"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                background: accent,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="carousel-stage"
        style={{
          width: cardWidth + 80,
          height: cardHeight + 80,
          transform: `rotateX(${tiltY}deg) rotateY(${tiltX}deg)`,
          transition: isDragging ? 'none' : 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <div
          className="carousel-track"
          style={{
            transform: `rotateY(${angle}deg)`,
            transition: isDragging ? 'none' : 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {cards.map((card, i) => {
            const cardAngle = step * i
            const isActive = i === activeIndex
            const isHovered = i === hoveredIndex
            const distFromActive = Math.min(Math.abs(i - activeIndex), count - Math.abs(i - activeIndex))
            const blurAmount = distFromActive * 1.5
            const brightnessVal = 1 - distFromActive * 0.08
            const zOffset = isActive ? 30 : 0
            const scale = isActive ? 1.12 : isHovered ? 1.06 : 1
            const elevation = isActive ? 20 : 0

            return (
              <div
                key={i}
                className="carousel-card-wrapper"
                style={{ left: -cardWidth / 2, top: -cardHeight / 2 - elevation }}
              >
                <div
                  className="carousel-card"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius,
                    transform: `rotateY(${cardAngle}deg) translateZ(${radius + zOffset}px) scale(${scale})`,
                    transition: isDragging
                      ? 'none'
                      : 'transform 1s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s',
                    boxShadow: isActive
                      ? `0 0 40px ${accent}44, 0 20px 60px rgba(0,0,0,0.5)`
                      : `0 8px 32px rgba(0,0,0,0.4)`,
                  }}
                >
                  <div
                    className="carousel-card-image"
                    style={{
                      backgroundImage: `url(${card.img})`,
                      filter: `blur(${isActive ? 0 : blurAmount}px) brightness(${brightnessVal})`,
                    }}
                  />
                  <div className="carousel-card-overlay" />
                  {isActive && (
                    <div
                      className="carousel-card-accent-overlay"
                      style={{ background: `linear-gradient(135deg, ${accent}26 0%, transparent 50%)` }}
                    />
                  )}
                  {glare && isHovered && (
                    <div
                      className="carousel-card-glare"
                      style={{
                        background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                      }}
                    />
                  )}
                  {isActive && (
                    <div
                      className="carousel-card-border-glow"
                      style={{
                        inset: -1,
                        borderRadius: borderRadius + 1,
                        background: `linear-gradient(135deg, ${accent}66, ${accent}1a, ${accent}66)`,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'exclude',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        padding: 1,
                      }}
                    />
                  )}
                  <div className="carousel-card-content" style={{ transform: `translateZ(6px)` }}>
                    <div className="carousel-card-number">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="carousel-card-label">
                      {card.label}
                    </div>
                    <div
                      className="carousel-card-accent-line"
                      style={{
                        background: `${accent}99`,
                        width: isActive ? 40 : 24,
                      }}
                    />
                  </div>
                </div>

                {reflection && (
                  <div
                    className="carousel-reflection"
                    style={{
                      left: 0,
                      top: cardHeight + 8,
                      width: cardWidth,
                      height: cardHeight * 0.35,
                      borderRadius,
                      transform: `rotateY(${cardAngle}deg) translateZ(${radius + zOffset}px) scaleY(-1) scale(${scale})`,
                      opacity: 0.15,
                      transition: isDragging
                        ? 'none'
                        : 'transform 1s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s',
                    }}
                  >
                    <div
                      className="carousel-reflection-image"
                      style={{ backgroundImage: `url(${card.img})` }}
                    />
                    <div
                      className="carousel-reflection-fade"
                      style={{ background: `linear-gradient(to bottom, rgba(10,10,15,0.4), ${backgroundColor})` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <button
        className="carousel-nav carousel-nav-left"
        onClick={(e) => { e.stopPropagation(); goTo(-1) }}
        onMouseEnter={e => { e.currentTarget.style.background = `${accent}26`; e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = `${accent}4d` }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
      >
        &#8249;
      </button>
      <button
        className="carousel-nav carousel-nav-right"
        onClick={(e) => { e.stopPropagation(); goTo(1) }}
        onMouseEnter={e => { e.currentTarget.style.background = `${accent}26`; e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = `${accent}4d` }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
      >
        &#8250;
      </button>

      <div className="carousel-dots">
        {cards.map((_, i) => (
          <button
            key={i}
            className="carousel-dot"
            onClick={(e) => { e.stopPropagation(); setAngle(a => a + (i - activeIndex) * step) }}
            style={{
              width: i === activeIndex ? 20 : 6,
              background: i === activeIndex ? accent : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
