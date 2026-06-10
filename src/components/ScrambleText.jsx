import { useState, useRef, useCallback, useEffect } from 'react'
import './ScrambleText.css'

const SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&?'

function pick(s) {
  return s[Math.floor(Math.random() * s.length)]
}

export default function ScrambleText({
  text = 'Hello World',
  glitch = true,
  speed = 50,
  chars = SET,
  hover = true,
  as: Tag = 'h1',
  fontSize = 48,
  color = '#ffffff',
}) {
  const [display, setDisplay] = useState(() =>
    text.split('').map(ch => ({ char: ch, done: true }))
  )
  const [active, setActive] = useState(false)
  const tgt = useRef(text)
  const iv = useRef(null)
  const timers = useRef([])
  const alive = useRef(true)
  const started = useRef(false)

  useEffect(() => {
    tgt.current = text
    if (!active) {
      setDisplay(text.split('').map(ch => ({ char: ch, done: true })))
    }
  }, [text, active])

  useEffect(() => {
    return () => {
      alive.current = false
      clearInterval(iv.current)
      timers.current.forEach(clearTimeout)
    }
  }, [])

  const scramble = useCallback(() => {
    clearInterval(iv.current)
    iv.current = null
    timers.current.forEach(clearTimeout)
    timers.current = []

    const target = tgt.current
    if (!target || target.length === 0) return

    setActive(true)
    setDisplay(
      target.split('').map(() => ({ char: pick(chars), done: false }))
    )

    iv.current = setInterval(() => {
      if (!alive.current) return
      setDisplay(prev =>
        prev.map(c => (c.done ? c : { ...c, char: pick(chars) }))
      )
    }, speed)

    const settleDelay = 800 + Math.random() * 300
    const stagger = Math.max(25, Math.min(70, 450 / target.length))

    for (let i = 0; i < target.length; i++) {
      const id = setTimeout(() => {
        if (!alive.current) return
        const finalChar = target[i]
        setDisplay(prev => {
          const next = [...prev]
          next[i] = { char: finalChar, done: true }
          const allDone = next.every(c => c.done)
          if (allDone) {
            clearInterval(iv.current)
            iv.current = null
            setActive(false)
          }
          return next
        })
      }, settleDelay + i * stagger)
      timers.current.push(id)
    }
  }, [speed, chars])

  const reset = useCallback(() => {
    clearInterval(iv.current)
    iv.current = null
    timers.current.forEach(clearTimeout)
    timers.current = []
    setActive(false)
    setDisplay(
      tgt.current.split('').map(ch => ({ char: ch, done: true }))
    )
  }, [])

  const handleEnter = useCallback(() => {
    if (!hover || active) return
    scramble()
  }, [hover, active, scramble])

  const handleLeave = useCallback(() => {
    if (!hover) return
    reset()
  }, [hover, reset])

  useEffect(() => {
    if (hover || started.current) return
    started.current = true
    const t = setTimeout(scramble, 300)
    return () => clearTimeout(t)
  }, [hover, scramble])

  useEffect(() => {
    if (hover || active) return
    const t = setTimeout(scramble, 3000)
    return () => clearTimeout(t)
  }, [hover, active, scramble])

  return (
    <div
      className={`st-wrap ${active ? 'st-active' : ''} ${glitch && active ? 'st-glitch' : ''}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ fontSize, color }}
    >
      <Tag className="st-text">
        {display.map((c, i) => (
          <span key={i} className={`st-char ${c.done ? 'st-done' : ''}`}>
            {c.char === ' ' ? '\u00A0' : c.char}
          </span>
        ))}
      </Tag>
      {glitch && (
        <div className="st-glitch-layer" aria-hidden="true">
          <Tag className="st-glitch-el st-glitch-a" aria-hidden="true">
            {display.map((c, i) => (
              <span key={i}>{c.char === ' ' ? '\u00A0' : c.char}</span>
            ))}
          </Tag>
          <Tag className="st-glitch-el st-glitch-b" aria-hidden="true">
            {display.map((c, i) => (
              <span key={i}>{c.char === ' ' ? '\u00A0' : c.char}</span>
            ))}
          </Tag>
        </div>
      )}
    </div>
  )
}
