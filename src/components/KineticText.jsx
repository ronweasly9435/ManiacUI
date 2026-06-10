import { useRef, useEffect, useCallback } from 'react'
import './KineticText.css'

export default function KineticText({
  text = 'Kinetic',
  fontSize = 36,
  color = '#ffffff',
  accent = '#7ec8e3',
  repulsion = 120,
  force = 8,
  spring = 0.08,
  damping = 0.92,
  wobble = 0.3,
  width = 600,
  height = 200,
  bgColor = 'transparent',
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animRef = useRef(null)
  const explodingRef = useRef(false)

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const trailColor = bgColor === 'transparent' ? 'rgba(0,0,0,0.12)' : bgColor + '1e'
    canvas.dataset.trailColor = trailColor

    ctx.font = `bold ${fontSize}px 'SF Mono','Fira Code','Consolas',monospace`
    const chars = text.split('')
    const positions = []
    let x = 0

    for (let i = 0; i < chars.length; i++) {
      const metrics = ctx.measureText(chars[i])
      const charWidth = metrics.width
      positions.push({
        char: chars[i],
        tx: x + charWidth / 2,
        ty: 0,
      })
      x += charWidth + 2
    }

    const totalWidth = x - 2
    const offsetX = (width - totalWidth) / 2
    const y = height / 2 + fontSize * 0.3

    particlesRef.current = positions.map(() => ({
      char: '',
      x: 0,
      y,
      vx: 0,
      vy: 0,
      tx: 0,
      ty: y,
      rot: 0,
      hueOffset: (Math.random() - 0.5) * 40,
    }))

    particlesRef.current = positions.map(p => ({
      char: p.char,
      x: p.tx + offsetX,
      y,
      vx: 0,
      vy: 0,
      tx: p.tx + offsetX,
      ty: y,
      rot: 0,
      hueOffset: (Math.random() - 0.5) * 40,
    }))

    mouseRef.current = { x: -1000, y: -1000 }
  }, [text, fontSize, width, height, bgColor])

  useEffect(() => {
    initParticles()
  }, [initParticles])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const trailColor = canvas.dataset.trailColor || 'rgba(0,0,0,0.12)'
    const particles = particlesRef.current
    const mouse = mouseRef.current

    const loop = () => {
      ctx.fillStyle = trailColor
      ctx.fillRect(0, 0, width, height)

      for (const p of particles) {
        const dx = p.tx - p.x
        const dy = p.ty - p.y
        p.vx += dx * spring
        p.vy += dy * spring

        p.vx *= damping
        p.vy *= damping

        p.vx += (Math.random() - 0.5) * wobble
        p.vy += (Math.random() - 0.5) * wobble

        const mdx = p.x - mouse.x
        const mdy = p.y - mouse.y
        const dist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (dist < repulsion && dist > 0) {
          const f = (1 - dist / repulsion) * force
          p.vx += (mdx / dist) * f
          p.vy += (mdy / dist) * f
        }

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) { p.x = 0; p.vx *= -0.5 }
        if (p.x > width) { p.x = width; p.vx *= -0.5 }
        if (p.y < 0) { p.y = 0; p.vy *= -0.5 }
        if (p.y > height) { p.y = height; p.vy *= -0.5 }

        p.rot = p.vx * 0.02

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)

        ctx.font = `bold ${fontSize}px 'SF Mono','Fira Code','Consolas',monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 1) {
          ctx.shadowColor = accent
          ctx.shadowBlur = Math.min(speed * 2, 20)
        }

        ctx.fillStyle = speed > 2 ? accent : color
        ctx.fillText(p.char, 0, 0)

        ctx.restore()
      }

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [text, fontSize, color, accent, repulsion, force, spring, damping, wobble, width, height])

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 }
  }, [])

  const handleClick = useCallback(() => {
    if (explodingRef.current) return
    explodingRef.current = true
    const particles = particlesRef.current
    for (const p of particles) {
      p.vx += (Math.random() - 0.5) * 25
      p.vy += (Math.random() - 0.5) * 25 - 12
    }
    setTimeout(() => { explodingRef.current = false }, 600)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="kt-canvas"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ background: bgColor === 'transparent' ? undefined : bgColor, cursor: 'pointer' }}
    />
  )
}
