import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

function BgColorUpdater({ backgroundColor }) {
  const { gl } = useThree()
  useEffect(() => { gl.setClearColor(backgroundColor) }, [gl, backgroundColor])
  return null
}

function generateUVs(geometry) {
  const pos = geometry.attributes.position
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    const i3 = i * 3
    const x = pos.array[i3], y = pos.array[i3 + 1], z = pos.array[i3 + 2]
    const len = Math.sqrt(x * x + y * y + z * z)
    if (len === 0) { uv[i * 2] = 0.5; uv[i * 2 + 1] = 0.5; continue }
    const nx = x / len, ny = y / len, nz = z / len
    uv[i * 2] = 0.5 + Math.atan2(nz, nx) / (Math.PI * 2)
    uv[i * 2 + 1] = 0.5 - Math.asin(ny) / Math.PI
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
}

function BlobMesh({ color, texture, speed, complexity, size, metallic, noiseScale }) {
  const meshRef = useRef()
  const origRef = useRef(null)
  const [loadedTex, setLoadedTex] = useState(null)

  useEffect(() => {
    if (!texture) { setLoadedTex(null); return }
    let active = true
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'
    loader.load(texture, (tex) => { if (active) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 1); setLoadedTex(tex) } }, undefined, () => { if (active) setLoadedTex(null) })
    return () => { active = false }
  }, [texture])

  useEffect(() => {
    if (meshRef.current) {
      const geo = meshRef.current.geometry
      if (!geo.attributes.uv || geo.attributes.uv.count === 0) {
        generateUVs(geo)
      }
      origRef.current = new Float32Array(geo.attributes.position.array)
      geo.userData.original = origRef.current
    }
  }, [complexity, size])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const geo = mesh.geometry
    if (!geo.attributes.position || !geo.userData.original) return
    const positions = geo.attributes.position
    const orig = geo.userData.original
    const t = state.clock.elapsedTime * (speed || 1)
    const s = size || 1.5
    const ns = noiseScale || 2

    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3
      const x = orig[i3]
      const y = orig[i3 + 1]
      const z = orig[i3 + 2]

      const n1 = Math.sin(x * ns + t) * 0.15
      const n2 = Math.cos(y * ns + t * 0.8) * 0.15
      const n3 = Math.sin(z * ns + t * 1.2) * 0.15
      const n4 = Math.sin((x + y) * 0.8 + t * 0.5) * 0.08
      const displacement = n1 + n2 + n3 + n4

      const len = Math.sqrt(x * x + y * y + z * z)
      if (len > 0) {
        const nx = x / len, ny = y / len, nz = z / len
        positions.array[i3] = x + nx * displacement * s
        positions.array[i3 + 1] = y + ny * displacement * s
        positions.array[i3 + 2] = z + nz * displacement * s
      }
    }
    positions.needsUpdate = true
    geo.computeVertexNormals()
  })

  const matProps = useMemo(() => {
    const base = {
      roughness: 0.15,
      metalness: metallic ? 0.7 : 0.1,
      clearcoat: metallic ? 1 : 0.3,
      clearcoatRoughness: 0.3,
      envMapIntensity: 1.5,
    }
    if (loadedTex) {
      return { ...base, map: loadedTex, color: '#ffffff' }
    }
    return { ...base, color }
  }, [color, loadedTex, metallic])

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[size || 1.5, complexity || 3]} />
      <meshPhysicalMaterial {...matProps} />
    </mesh>
  )
}

export default function Blob({
  color = '#7ec8e3',
  backgroundColor = '#000000',
  speed = 1,
  complexity = 3,
  size = 1.5,
  metallic = true,
  noiseScale = 2,
  texture = 'https://wallpapercave.com/wp/wp12409453.jpg',
}) {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        dpr={[1, mobile ? 1.5 : 2]}
        onCreated={({ gl }) => { gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)) }}
        style={{ width: '100%', height: '100%' }}
      >
        <BgColorUpdater backgroundColor={backgroundColor} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={3} />
        <directionalLight position={[-3, 0, 3]} intensity={1} />
        <BlobMesh color={color} texture={texture} speed={speed} complexity={complexity} size={size} metallic={metallic} noiseScale={noiseScale} />
        <Environment blur={0.5}>
          <Lightformer intensity={4} color="white" position={[0, 3, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={2} color="white" position={[-2, -1, 3]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}
