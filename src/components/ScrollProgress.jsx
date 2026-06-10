import { useState, useEffect, useRef, useCallback } from 'react'
import './ScrollProgress.css'

function getScrollParent(node) {
  if (!node || node === document.body || node === document.documentElement) return null
  const overflow = getComputedStyle(node).overflowY
  if (overflow === 'auto' || overflow === 'scroll') return node
  return getScrollParent(node.parentElement)
}

export default function ScrollProgress({
  color = '#7ec8e3',
  height = 3,
  glow = true,
  particles = true,
  particleCount = 20,
  sections = [],
  zIndex = 9999,
  trailing = true,
}) {
  const [progress, setProgress] = useState(0)
  const [bursts, setBursts] = useState([])
  const prevMilestone = useRef(0)
  const activeSections = useRef(new Set())
  const rootRef = useRef(null)
  const scrollRef = useRef(null)

  const secondaryColor = '#a0d8ef'

  useEffect(() => {
    const scrollEl = getScrollParent(rootRef.current) || window
    scrollRef.current = scrollEl

    const handleScroll = () => {
      let p = 0
      if (scrollEl === window) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        p = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
      } else {
        const { scrollTop, scrollHeight, clientHeight } = scrollEl
        const maxScroll = scrollHeight - clientHeight
        p = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
      }
      setProgress(Math.min(100, Math.max(0, p)))
    }

    handleScroll()
    scrollEl.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollEl.removeEventListener('scroll', handleScroll)
  }, [])

  const addBurst = useCallback((x) => {
    if (!particles) return
    const id = Date.now() + Math.random()
    const newParticles = Array.from({ length: particleCount }, (_, i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8
      const dist = 20 + Math.random() * 60
      return {
        id: `${id}-${i}`,
        x: x + (Math.random() - 0.5) * 60,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 0.1,
        color: Math.random() > 0.5 ? color : secondaryColor,
      }
    })
    setBursts(prev => [...prev, ...newParticles])
    setTimeout(() => {
      setBursts(prev => prev.filter(p => !newParticles.find(pp => pp.id === p.id)))
    }, 1200)
  }, [color, particleCount, particles])

  useEffect(() => {
    if (sections.length === 0) return
    const sectionSet = activeSections.current

    const observers = sections.map(sel => {
      const el = typeof sel === 'string' ? document.querySelector(sel) : sel
      if (!el) return null
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!sectionSet.has(sel)) {
              sectionSet.add(sel)
              const rect = entry.boundingClientRect
              addBurst(rect.left + rect.width / 2)
            }
          } else {
            sectionSet.delete(sel)
          }
        }
      }, { threshold: 0.3 })
      observer.observe(el)
      return observer
    }).filter(Boolean)

    return () => observers.forEach(o => o.disconnect())
  }, [sections, addBurst])

  useEffect(() => {
    if (sections.length > 0) return
    const currentMilestone = Math.floor(progress / 20) * 20
    if (currentMilestone >= 20 && currentMilestone !== prevMilestone.current) {
      prevMilestone.current = currentMilestone

      const sc = scrollRef.current
      let barX = 0
      if (sc === window) {
        barX = window.innerWidth * (currentMilestone / 100)
      } else {
        barX = sc.clientWidth * (currentMilestone / 100)
      }
      addBurst(barX)
    }
    if (progress < 20) prevMilestone.current = 0
  }, [progress, sections, addBurst])

  const barStyle = {
    width: `${progress}%`,
    height: `${height}px`,
    background: `linear-gradient(90deg, ${color}, ${secondaryColor}, ${color})`,
    borderRadius: `${height / 2}px`,
    boxShadow: glow ? `0 0 ${4 + progress * 0.08}px ${color}40, 0 0 ${8 + progress * 0.15}px ${color}20` : 'none',
  }

  const trailStyle = {
    width: `${Math.max(0, progress - 6)}%`,
    height: `${height}px`,
    borderRadius: `${height / 2}px`,
    background: `linear-gradient(90deg, ${color}40, ${secondaryColor}40, ${color}40)`,
    transition: 'width 0.3s ease',
  }

  return (
    <div ref={rootRef} className="sp-root" style={{ zIndex, height: `${height}px` }}>
      <div className="sp-track">
        {trailing && <div className="sp-trail" style={trailStyle} />}
        <div className="sp-bar" style={barStyle} />
      </div>
      {bursts.map(p => (
        <div
          key={p.id}
          className="sp-particle"
          style={{
            left: p.x,
            '--sp-dx': `${p.dx}px`,
            '--sp-dy': `${p.dy}px`,
            '--sp-size': `${p.size}px`,
            '--sp-delay': `${p.delay}s`,
            '--sp-color': p.color,
          }}
        />
      ))}
    </div>
  )
}
