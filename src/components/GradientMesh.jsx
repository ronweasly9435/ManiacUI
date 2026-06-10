import { useEffect, useRef, useMemo, useCallback } from 'react'
import './GradientMesh.css'

function fbm(x, y, t) {
  let v = 0, amp = 1, freq = 1, total = 0, w = 1
  for (let i = 0; i < 4; i++) {
    const a = x * freq * 0.007 + t * w * 0.14
    const b = y * freq * 0.007 + t * w * 0.10
    v += amp * (Math.sin(a + b) * 0.5 + Math.sin(a - b * 1.3 + t * 0.06 * w) * 0.3 + Math.cos(a * 0.7 - b * 1.1) * 0.2)
    total += amp
    amp *= 0.45
    freq *= 2.1
    w *= 1.4
  }
  return v / total
}

function hexToRgb(h) {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function lerp(a, b, t) { return a + (b - a) * t }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)) }

export default function GradientMesh({
  rows = 12,
  cols = 16,
  cellSize = 38,
  speed = 1,
  amplitude = 28,
  color1 = '#7ec8e3',
  color2 = '#6a5acd',
  color3 = '#ff6b6b',
  bgColor = '#0a0a0f',
  glowPoints = true,
  strokeWidth = 0,
  fill = true,
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const propsRef = useRef({ rows, cols, cellSize, speed, amplitude, color1, color2, color3, bgColor, glowPoints, strokeWidth, fill })
  propsRef.current = { rows, cols, cellSize, speed, amplitude, color1, color2, color3, bgColor, glowPoints, strokeWidth, fill }
  const mouseRef = useRef({ x: -1, y: -1 })
  const rafRef = useRef(null)
  const gridRef = useRef(null)

  const grid = useMemo(() => {
    const verts = []
    for (let r = 0; r <= rows; r++)
      for (let c = 0; c <= cols; c++)
        verts.push({ x: c * cellSize, y: r * cellSize })
    gridRef.current = verts
    return verts
  }, [rows, cols, cellSize])

  const quads = useMemo(() => {
    const q = []
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        q.push({
          tl: r * (cols + 1) + c,
          tr: r * (cols + 1) + c + 1,
          bl: (r + 1) * (cols + 1) + c,
          br: (r + 1) * (cols + 1) + c + 1,
        })
    return q
  }, [rows, cols])

  const handleMouse = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1, y: -1 }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const container = containerRef.current

    let alive = true
    let cw, ch
    function resize() {
      const rect = container.getBoundingClientRect()
      cw = rect.width
      ch = rect.height
      const dpr = window.devicePixelRatio || 1
      canvas.width = cw * dpr
      canvas.height = ch * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    function animate(t) {
      if (!alive) return
      const p = propsRef.current
      const pxTime = t * 0.001 * p.speed
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const amp = p.amplitude

      const c1 = hexToRgb(p.color1)
      const c2 = hexToRgb(p.color2)
      const c3 = hexToRgb(p.color3)

      const gridVerts = gridRef.current
      if (!gridVerts) return

      const cols = p.cols
      const rows = p.rows
      const cSize = p.cellSize
      const totalW = cols * cSize
      const totalH = rows * cSize

      const scaleX = cw / totalW
      const scaleY = ch / totalH
      const s = Math.min(scaleX, scaleY) * 0.92
      const ox = (cw - totalW * s) / 2
      const oy = (ch - totalH * s) / 2

      const displaced = gridVerts.map((v, i) => {
        const nx = fbm(v.x + 100, v.y, pxTime)
        const ny = fbm(v.x, v.y + 100, pxTime * 0.85)
        let dx = nx * amp
        let dy = ny * amp

        if (mx >= 0 && my >= 0) {
          const vx = v.x / totalW
          const vy = v.y / totalH
          const rx = vx - mx
          const ry = vy - my
          const dist = Math.sqrt(rx * rx + ry * ry)
          if (dist < 0.35) {
            const inf = (1 - dist / 0.35) * 1.2
            const ang = Math.atan2(ry, rx)
            dx += Math.cos(ang) * inf * amp * 0.6
            dy += Math.sin(ang) * inf * amp * 0.6
          }
        }

        return {
          x: v.x * s + ox + dx * s,
          y: v.y * s + oy + dy * s,
        }
      })

      const hueShift = Math.sin(pxTime * 0.03) * 0.1 + Math.cos(pxTime * 0.02) * 0.06
      const colors = displaced.map((_, i) => {
        const r = i / displaced.length
        const phase = Math.sin(pxTime * 0.05 + r * 6.28) * 0.5 + 0.5
        const t1 = clamp(r + phase * 0.15 + hueShift, 0, 1)
        const t2 = clamp(1 - r * 0.5 + (1 - phase) * 0.15 - hueShift, 0, 1)
        const t3 = clamp(Math.sin(r * 6.28 + pxTime * 0.03) * 0.5 + 0.5, 0, 1)
        return [
          lerp(lerp(c1[0], c2[0], t1), c3[0], t3 * 0.5),
          lerp(lerp(c1[1], c2[1], t1), c3[1], t3 * 0.5),
          lerp(lerp(c1[2], c2[2], t1), c3[2], t3 * 0.5),
        ]
      })

      ctx.clearRect(0, 0, cw, ch)

      if (p.fill) {
        ctx.filter = `blur(${cSize * s * 0.5}px)`
        const blurR = cSize * s * 1.4
        for (let i = 0; i < displaced.length; i++) {
          const v = displaced[i]
          const cc = colors[i]
          ctx.beginPath()
          ctx.arc(v.x, v.y, blurR, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${cc[0]|0},${cc[1]|0},${cc[2]|0},0.6)`
          ctx.fill()
        }
        ctx.filter = 'none'
      }

      if (p.strokeWidth > 0) {
        ctx.strokeStyle = `rgba(255,255,255,0.06)`
        ctx.lineWidth = p.strokeWidth
        for (let i = 0; i < quads.length; i++) {
          const q = quads[i]
          const tl = displaced[q.tl], tr = displaced[q.tr]
          const br = displaced[q.br], bl = displaced[q.bl]
          ctx.beginPath()
          ctx.moveTo(tl.x, tl.y)
          ctx.lineTo(tr.x, tr.y)
          ctx.lineTo(br.x, br.y)
          ctx.lineTo(bl.x, bl.y)
          ctx.closePath()
          ctx.stroke()
        }
      }

      if (p.glowPoints) {
        for (let i = 0; i < displaced.length; i++) {
          const v = displaced[i]
          const pulse = 0.6 + 0.4 * Math.sin(pxTime * 1.8 + i * 0.9)
          const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(pxTime * 1.3 + i * 0.6))
          const r = 2.5 * pulse + 0.5
          const cc = colors[i]

          const g = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, r * 6)
          g.addColorStop(0, `rgba(${cc[0]|0},${cc[1]|0},${cc[2]|0},${alpha * 0.5})`)
          g.addColorStop(0.3, `rgba(${cc[0]|0},${cc[1]|0},${cc[2]|0},${alpha * 0.15})`)
          g.addColorStop(1, `rgba(${cc[0]|0},${cc[1]|0},${cc[2]|0},0)`)
          ctx.beginPath()
          ctx.arc(v.x, v.y, r * 6, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()

          ctx.beginPath()
          ctx.arc(v.x, v.y, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.85})`
          ctx.fill()

          ctx.beginPath()
          ctx.arc(v.x, v.y, r * 0.6, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${cc[0]|0},${cc[1]|0},${cc[2]|0},${alpha * 0.6})`
          ctx.fill()
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      alive = false
      ro.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [grid, quads])

  return (
    <div
      ref={containerRef}
      className="gradient-mesh-container"
      style={{ background: bgColor }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="gradient-mesh-canvas" />
    </div>
  )
}
