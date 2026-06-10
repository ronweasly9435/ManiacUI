import { useEffect, useRef, useState, useMemo } from 'react'
import './NoiseBorder.css'

function useResizeObserver(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

export default function NoiseBorder({
  color = '#7ec8e3',
  width = 2,
  noise = 0.03,
  speed = 1,
  intensity = 15,
  borderRadius = 12,
  padding = 20,
  glow = true,
  children,
}) {
  const wrapperRef = useRef(null)
  const size = useResizeObserver(wrapperRef)
  const seedRef = useRef(0)
  const [freq, setFreq] = useState(noise)
  const rafRef = useRef(null)

  useEffect(() => {
    seedRef.current = 0
    function animate() {
      seedRef.current += 0.005 * speed
      setFreq(noise + Math.sin(seedRef.current) * 0.008)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [noise, speed])

  const filterId = useMemo(() => `nb-filter-${Math.random().toString(36).slice(2, 9)}`, [])

  const { width: w, height: h } = size

  return (
    <div ref={wrapperRef} className="nb-wrapper" style={{ padding }}>
      <svg
        className="nb-svg"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ borderRadius }}
      >
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={freq}
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={intensity}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            {glow && (
              <feGaussianBlur stdDeviation={width * 0.8} result="glow" />
            )}
            {glow && (
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            )}
          </filter>
        </defs>
        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          rx={borderRadius}
          fill="none"
          stroke={color}
          strokeWidth={width}
          filter={`url(#${filterId})`}
        />
      </svg>
      <div className="nb-content" style={{ borderRadius: Math.max(0, borderRadius - 4) }}>
        {children}
      </div>
    </div>
  )
}
