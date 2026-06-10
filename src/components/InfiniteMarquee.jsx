import { useMemo } from 'react'
import './InfiniteMarquee.css'

const DEFAULT_ITEMS = [
  'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'Solid', 'Qwik',
  'TypeScript', 'Node.js', 'Rust', 'Go', 'Python', 'Tailwind', 'GraphQL',
  'Docker', 'Kubernetes', 'AWS', 'Redis', 'Postgres',
]

export default function InfiniteMarquee({
  items = DEFAULT_ITEMS,
  speed = 30,
  rows = 3,
  direction = [],
  pauseOnHover = true,
  fontSize = 14,
  color = 'rgba(255,255,255,0.4)',
  gap = 60,
}) {
  const dirs = useMemo(() =>
    Array.from({ length: rows }, (_, i) => direction[i] || (i % 2 === 0 ? 'left' : 'right')),
    [rows, direction]
  )

  const rowData = useMemo(() =>
    Array.from({ length: rows }, (_, i) => {
      const zOffset = i - Math.floor(rows / 2)
      const zDepth = zOffset * 80
      const scale = 1 - Math.abs(zOffset) * 0.08
      return { zDepth, scale, duration: speed * (i + 1) * 0.7 }
    }),
    [rows, speed]
  )

  return (
    <div className="im-wrapper" style={{ '--im-font-size': `${fontSize}px`, '--im-color': color, '--im-gap': `${gap}px` }}>
      <div className="im-bg-glow" />
      {rowData.map((row, i) => (
        <div
          key={i}
          className={`im-row ${dirs[i] === 'right' ? 'im-row--right' : ''} ${pauseOnHover ? 'im-row--pausable' : ''}`}
          style={{
            transform: `translateZ(${row.zDepth}px) scale(${row.scale})`,
            '--im-duration': `${row.duration}s`,
          }}
        >
          <div className="im-track">
            {[...items, ...items].map((item, j) => (
              <span key={j} className="im-item">
                {item}
                <span className="im-dot" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
