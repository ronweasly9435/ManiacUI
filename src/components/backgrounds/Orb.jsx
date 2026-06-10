import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function OrbMesh({ color, count, speed, size }) {
  const meshRef = useRef()
  const [positions, setPositions] = useState(null)
  const [sizes, setSizes] = useState(null)
  const offsets = useRef([])
  const phases = useRef([])

  useEffect(() => {
    const pos = []
    const sz = []
    const off = []
    const ph = []
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 4
      pos.push(r * Math.sin(phi) * Math.cos(theta))
      pos.push(r * Math.sin(phi) * Math.sin(theta))
      pos.push(r * Math.cos(phi))
      sz.push(0.3 + Math.random() * 0.7)
      off.push(Math.random() * 100)
      ph.push(Math.random() * Math.PI * 2)
    }
    setPositions(new Float32Array(pos))
    setSizes(new Float32Array(sz))
    offsets.current = off
    phases.current = ph
  }, [count])

  useFrame((state) => {
    if (!meshRef.current || !positions) return
    const t = state.clock.elapsedTime * speed
    const pos = meshRef.current.geometry.attributes.position
    const arr = pos.array
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const idx = i
      const theta = phases.current[idx] + t * 0.3 + offsets.current[idx] * 0.01
      const phi = phases.current[idx] * 0.5 + t * 0.1 + offsets.current[idx] * 0.005
      const r = 2 + Math.sin(offsets.current[idx] + t * 0.5) * 1.5
      arr[i3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i3 + 2] = r * Math.cos(phi)
    }
    pos.needsUpdate = true
  })

  if (!positions) return null

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes || new Float32Array(count)}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function BgUpdater({ backgroundColor }) {
  const { gl } = useThree()
  useEffect(() => { gl.setClearColor(backgroundColor) }, [gl, backgroundColor])
  return null
}

export default function Orb({
  color = '#7ec8e3',
  backgroundColor = '#000000',
  count = 60,
  speed = 0.5,
  size = 0.08,
  className,
  style,
}) {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, mobile ? 1 : 2]}
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true }}
      >
        <BgUpdater backgroundColor={backgroundColor} />
        <OrbMesh color={color} count={count} speed={speed} size={size} />
      </Canvas>
    </div>
  )
}
