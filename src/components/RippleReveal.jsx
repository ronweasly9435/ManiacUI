import { useRef, useEffect, useCallback } from 'react'
import './RippleReveal.css'

export default function RippleReveal({
  surfaceColor = '#0a0a0f',
  revealGradient = 'linear-gradient(135deg, #7ec8e3, #6a5acd)',
  width = '100%',
  height = 400,
  rippleCount = 3,
  duration = 2000,
  color = '#7ec8e3',
  text = 'Click anywhere',
  textReveal = 'You found it!',
  fontSize = 32,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const ripplesRef = useRef([])
  const rafRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0 })

  const addRipple = useCallback((x, y) => {
    const maxR = Math.max(sizeRef.current.w, sizeRef.current.h) * 1.5
    ripplesRef.current.push({ x, y, startTime: performance.now(), maxRadius: maxR })
  }, [])

  const handleClick = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    addRipple(e.clientX - rect.left, e.clientY - rect.top)
  }, [addRipple])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext('2d')

    const loop = (now) => {
      const rect = container.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      sizeRef.current = { w, h }

      ctx.fillStyle = surfaceColor
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, w / 2, h / 2)

      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      for (let ri = ripplesRef.current.length - 1; ri >= 0; ri--) {
        const r = ripplesRef.current[ri]
        const elapsed = now - r.startTime
        const progress = Math.min(elapsed / duration, 1)
        const radius = progress * r.maxRadius

        ctx.beginPath()
        ctx.arc(r.x, r.y, Math.max(radius, 1), 0, Math.PI * 2)
        ctx.fill()

        r._progress = progress
        if (progress >= 1) {
          ripplesRef.current.splice(ri, 1)
        }
      }
      ctx.restore()

      ctx.save()
      for (const r of ripplesRef.current) {
        const p = r._progress || 0
        const radius = p * r.maxRadius
        const ringAlpha = Math.sin(p * Math.PI) * (1 - p) * 0.8

        for (let i = 0; i < rippleCount; i++) {
          const rr = radius - (i * r.maxRadius) / (rippleCount * 2.5)
          if (rr < 3) continue

          ctx.strokeStyle = color
          ctx.globalAlpha = ringAlpha * (1 - i / rippleCount)
          ctx.lineWidth = Math.max(0.5, 2.5 - p * 2)

          ctx.beginPath()
          const segs = 64
          for (let s = 0; s <= segs; s++) {
            const a = (s / segs) * Math.PI * 2
            const disp = Math.sin(a * 6 + p * Math.PI * 4) * 5
            const pr = Math.max(0, rr + disp)
            const px = r.x + Math.cos(a) * pr
            const py = r.y + Math.sin(a) * pr
            s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
          }
          ctx.stroke()
        }
      }
      ctx.restore()

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [surfaceColor, revealGradient, width, height, rippleCount, duration, color, text, fontSize])

  const containerStyle = {
    width: width === '100%' ? '100%' : width,
    height,
  }

  return (
    <div
      ref={containerRef}
      className="rr-container"
      style={containerStyle}
      onClick={handleClick}
    >
      <div
        className="rr-revealed-bg"
        style={{ background: revealGradient }}
      />
      <span className="rr-revealed-text">{textReveal}</span>
      <canvas ref={canvasRef} className="rr-canvas" />
    </div>
  )
}
