import { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import './GridMorph.css'

export default function GridMorph({
  gridSize = 12,
  cellGap = 2,
  cellRadius = 2,
  color = '#7ec8e3',
  bgColor = '#0a0a0f',
  hoverColor = '#ffffff',
  intensity = 1,
  responsive = true,
}) {
  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999, inGrid: false })
  const [size, setSize] = useState(gridSize)

  useEffect(() => {
    if (!responsive) { setSize(gridSize); return }
    const check = () => {
      const w = window.innerWidth
      if (w < 480) setSize(Math.min(gridSize, 8))
      else if (w < 768) setSize(Math.min(gridSize, 10))
      else setSize(gridSize)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [gridSize, responsive])

  const cells = useMemo(() =>
    Array.from({ length: size * size }, (_, i) => ({
      row: Math.floor(i / size),
      col: i % size,
      delay: (Math.floor(i / size) + i % size) * 0.02,
    })),
    [size]
  )

  const cellWidth = useMemo(() => `calc((100% - ${cellGap * (size - 1)}px) / ${size})`, [size, cellGap])

  const handleMouseMove = useCallback((e) => {
    mouseRef.current.x = e.clientX
    mouseRef.current.y = e.clientY
    mouseRef.current.inGrid = true
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const container = containerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const mx = mouseRef.current.x - rect.left
        const my = mouseRef.current.y - rect.top
        const cells = container.querySelectorAll('.gm-cell')
        const radius = rect.width / 2

        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i]
          const cx = cell.offsetLeft + cell.offsetWidth / 2
          const cy = cell.offsetTop + cell.offsetHeight / 2
          const dx = mx - cx
          const dy = my - cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          const effect = Math.max(0, 1 - dist / radius) * intensity

          cell.style.setProperty('--tx', `${dx}px`)
          cell.style.setProperty('--ty', `${dy}px`)
          cell.style.setProperty('--dist', dist.toFixed(0))
          cell.style.setProperty('--effect', effect.toFixed(3))
        }
      })
    }
  }, [intensity])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.inGrid = false
    const container = containerRef.current
    if (!container) return
    const cells = container.querySelectorAll('.gm-cell')
    for (let i = 0; i < cells.length; i++) {
      cells[i].style.setProperty('--effect', '0')
      cells[i].style.setProperty('--dist', '9999')
    }
  }, [])

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const colorVal = color.startsWith('#') ? color : `#${color}`
  const hoverColorVal = hoverColor.startsWith('#') ? hoverColor : `#${hoverColor}`

  return (
    <div
      ref={containerRef}
      className="gm-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--gm-size': size,
        '--gm-gap': `${cellGap}px`,
        '--gm-radius': `${cellRadius}px`,
        '--gm-color': colorVal,
        '--gm-bg': bgColor,
        '--gm-hover': hoverColorVal,
        '--gm-intensity': intensity,
        '--gm-cell-width': cellWidth,
      }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          className="gm-cell"
          style={{
            '--cell-delay': `${cell.delay}s`,
            '--row': cell.row,
            '--col': cell.col,
          }}
        />
      ))}
    </div>
  )
}
