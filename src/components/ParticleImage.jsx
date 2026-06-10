import { useRef, useEffect, useCallback, useState } from 'react'
import './ParticleImage.css'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function samplePixels(ctx, width, height, gap) {
  const particles = []
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const i = (y * width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      if (a > 128) {
        particles.push({
          x, y,
          origX: x, origY: y,
          vx: 0, vy: 0,
          color: `rgba(${r},${g},${b},1)`,
          size: 1,
        })
      }
    }
  }
  return particles
}

export default function ParticleImage({
  src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFic3RyYWN0fGVufDB8fDB8fHww',
  dotSize = 2,
  gap = 4,
  explodeRadius = 80,
  explodeForce = 8,
  friction = 0.92,
  returnSpeed = 0.08,
  wobble = 0.5,
  width = 400,
  height = 300,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: -9999, y: -9999, inside: false })
  const rafRef = useRef(null)
  const imgLoadedRef = useRef(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    imgLoadedRef.current = false
    ;(async () => {
      setLoading(true)
      try {
        const img = await loadImage(src)
        if (cancelled) return
        const offscreen = document.createElement('canvas')
        offscreen.width = width
        offscreen.height = height
        const offCtx = offscreen.getContext('2d')
        offCtx.drawImage(img, 0, 0, width, height)
        const particles = samplePixels(offCtx, width, height, gap)
        if (cancelled) return
        particlesRef.current = particles
        imgLoadedRef.current = true
        setLoading(false)
      } catch {
        if (!cancelled) {
          imgLoadedRef.current = false
          setLoading(false)
        }
      }
    })()
    return () => { cancelled = true }
  }, [src, width, height, gap])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const loop = () => {
      if (!imgLoadedRef.current) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      const particles = particlesRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const inside = mouseRef.current.inside

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        const dx = p.origX - p.x
        const dy = p.origY - p.y
        p.vx += dx * returnSpeed
        p.vy += dy * returnSpeed

        const distToMouse = Math.hypot(p.x - mx, p.y - my)
        if (inside && distToMouse < explodeRadius) {
          const angle = Math.atan2(p.y - my, p.x - mx)
          const force = (explodeRadius - distToMouse) / explodeRadius * explodeForce
          p.vx += Math.cos(angle) * force
          p.vy += Math.sin(angle) * force
        }

        p.vx *= friction
        p.vy *= friction

        if (!inside) {
          p.vx += (Math.random() - 0.5) * wobble * 0.2
          p.vy += (Math.random() - 0.5) * wobble * 0.2
        }

        p.x += p.vx
        p.y += p.vy

        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, dotSize, dotSize)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [width, height, dotSize, explodeRadius, explodeForce, friction, returnSpeed, wobble])

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      inside: true,
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999, inside: false }
  }, [])

  return (
    <div className="pi-container" style={{ width, height }}>
      {loading && (
        <div className="pi-skeleton">
          <div className="pi-skeleton-shimmer" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="pi-canvas"
        style={{ opacity: loading ? 0 : 1 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}
