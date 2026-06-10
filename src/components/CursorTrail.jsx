import { useEffect, useRef } from 'react'
import './CursorTrail.css'

function lerp(a, b, t) { return a + (b - a) * t }

export default function CursorTrail({
  color = '#7ec8e3',
  secondaryColor = '#6a5acd',
  size = 14,
  trailLength = 14,
  smoothing = 0.12,
  glow = 25,
  fade = true,
  mixMode = 'screen',
  interactive = true,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const rafRef = useRef(null)
  const propsRef = useRef({ color, secondaryColor, size, trailLength, smoothing, glow, fade, mixMode, interactive })
  propsRef.current = { color, secondaryColor, size, trailLength, smoothing, glow, fade, mixMode, interactive }

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const ctx = canvas.getContext('2d')

    let alive = true

    const st = {
      mouse: { x: -1000, y: -1000 },
      active: false,
      points: Array.from({ length: trailLength }, () => ({ x: 0, y: 0 })),
      sparkles: [],
      residue: [],
      flare: 0,
      time: 0,
      idleTimer: null,
    }
    stateRef.current = st

    function resize() {
      const rect = container.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const dpr = window.devicePixelRatio || 1
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      st._w = w
      st._h = h
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    function toLocal(clientX, clientY) {
      const rect = container.getBoundingClientRect()
      return { x: clientX - rect.left, y: clientY - rect.top }
    }

    function handleMove(e) {
      const p = toLocal(e.clientX, e.clientY)
      st.mouse = p
      st.active = true
      clearTimeout(st.idleTimer)
      st.idleTimer = setTimeout(() => { st.active = false }, 800)
    }

    function handleLeave() {
      st.active = false
      clearTimeout(st.idleTimer)
    }

    function handleClick(e) {
      st.flare = 1
    }

    container.addEventListener('pointermove', handleMove)
    container.addEventListener('pointerleave', handleLeave)
    container.addEventListener('pointerdown', handleClick)

    function tick() {
      if (!alive) return
      const p = propsRef.current
      const s = stateRef.current
      if (!s) return

      s.time += 0.016
      const pulse = 0.5 + 0.5 * Math.sin(s.time * 2.5)
      const w = s._w || 300
      const h = s._h || 300

      if (s.active) {
        s.points[0].x = lerp(s.points[0].x, s.mouse.x, p.smoothing)
        s.points[0].y = lerp(s.points[0].y, s.mouse.y, p.smoothing)
        for (let i = 1; i < s.points.length; i++) {
          s.points[i].x = lerp(s.points[i].x, s.points[i - 1].x, p.smoothing * 1.1)
          s.points[i].y = lerp(s.points[i].y, s.points[i - 1].y, p.smoothing * 1.1)
        }
      }

      // Sparkle emission
      if (s.active && Math.random() < 0.2) {
        const last = s.points[Math.min(2, s.points.length - 1)]
        s.sparkles.push({
          x: last.x + (Math.random() - 0.5) * 8,
          y: last.y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3 - 0.5,
          life: 1,
          decay: 0.02 + Math.random() * 0.025,
          r: 1.5 + Math.random() * 2.5,
        })
      }

      // Residue
      if (p.fade && s.active && Math.random() < 0.25) {
        const pt = s.points[Math.floor(Math.random() * 3)]
        s.residue.push({
          x: pt.x, y: pt.y, life: 1,
          decay: 0.004 + Math.random() * 0.01,
          r: p.size * (0.3 + Math.random() * 0.5),
        })
      }

      if (s.flare > 0) s.flare = Math.max(0, s.flare - 0.025)

      // Update sparkles
      s.sparkles = s.sparkles.filter(sp => {
        sp.x += sp.vx; sp.y += sp.vy
        sp.vy += 0.025
        sp.life -= sp.decay
        return sp.life > 0
      })

      // Update residue
      s.residue = s.residue.filter(r => { r.life -= r.decay; return r.life > 0 })

      // Limit arrays
      if (s.sparkles.length > 80) s.sparkles = s.sparkles.slice(-80)
      if (s.residue.length > 40) s.residue = s.residue.slice(-40)

      // Clear — fading bg for trail
      if (p.fade) {
        ctx.fillStyle = 'rgba(10,10,14,0.06)'
        ctx.fillRect(0, 0, w, h)
      } else {
        ctx.clearRect(0, 0, w, h)
      }

      const flareSize = p.size * (1 + s.flare * 3)
      const currentGlow = p.glow * (1 + s.flare * 2)

      // Render main trail
      for (let i = s.points.length - 1; i >= 0; i--) {
        const t = i / s.points.length
        const r = flareSize * (1 - t * 0.7) * (1 + pulse * 0.04)
        const a = (1 - t) * 0.85

        const g = ctx.createRadialGradient(
          s.points[i].x, s.points[i].y, 0,
          s.points[i].x, s.points[i].y, r
        )
        g.addColorStop(0, (p.color) + Math.round(a * 255).toString(16).padStart(2, '0'))
        g.addColorStop(0.4, `rgba(100,180,220,${a * 0.5})`)
        g.addColorStop(1, `rgba(60,40,120,0)`)

        ctx.globalCompositeOperation = p.mixMode
        ctx.filter = currentGlow > 0 ? `blur(${currentGlow * (1 - t * 0.3)}px)` : 'none'
        ctx.beginPath()
        ctx.arc(s.points[i].x, s.points[i].y, r, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }
      ctx.filter = 'none'
      ctx.globalCompositeOperation = 'source-over'

      // Sparkles
      for (const sp of s.sparkles) {
        ctx.globalCompositeOperation = 'screen'
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, sp.r * sp.life, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${sp.life * 0.7})`
        ctx.fill()
      }

      // Residue blobs
      for (const rItem of s.residue) {
        ctx.globalCompositeOperation = p.mixMode
        const r2 = rItem.r * rItem.life
        const g = ctx.createRadialGradient(rItem.x, rItem.y, 0, rItem.x, rItem.y, r2)
        g.addColorStop(0, `rgba(100,180,220,${rItem.life * 0.25})`)
        g.addColorStop(1, `rgba(60,40,120,0)`)
        ctx.beginPath()
        ctx.arc(rItem.x, rItem.y, r2, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      alive = false
      ro.disconnect()
      clearTimeout(st.idleTimer)
      cancelAnimationFrame(rafRef.current)
      stateRef.current = null
      container.removeEventListener('pointermove', handleMove)
      container.removeEventListener('pointerleave', handleLeave)
      container.removeEventListener('pointerdown', handleClick)
    }
  }, [trailLength])

  return (
    <div ref={containerRef} className="ct-wrap">
      <canvas ref={canvasRef} className="ct-canvas" />
    </div>
  )
}
