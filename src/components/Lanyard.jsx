import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'

extend({ MeshLineGeometry, MeshLineMaterial })

function makeStrapTex(bandColor = '#ffffff') {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 64
  const ctx = c.getContext('2d')
  ctx.fillStyle = bandColor
  ctx.fillRect(0, 0, 256, 64)
  for (let y = 0; y < 64; y += 3) {
    ctx.strokeStyle = y % 6 === 0 ? `rgba(0,0,0,0.12)` : `rgba(0,0,0,0.06)`
    ctx.lineWidth = 0.5
    ctx.beginPath()
    for (let x = 0; x <= 256; x += 2) {
      const yy = y + Math.sin(x * 0.06 + y * 0.04) * 1.2
      x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 1)
  t.anisotropy = 4
  t.needsUpdate = true
  return t
}

function makeCardTex(cardColor = '#ffffff', cardText = 'CLOBE', cardSubtext = 'EMPLOYEE') {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 320
  const ctx = c.getContext('2d')

  const isDark = (() => {
    const r = parseInt(cardColor.slice(1,3), 16)
    const g = parseInt(cardColor.slice(3,5), 16)
    const b = parseInt(cardColor.slice(5,7), 16)
    return r * 0.299 + g * 0.587 + b * 0.114 < 128
  })()

  ctx.fillStyle = cardColor
  ctx.fillRect(0, 0, 512, 320)

  const borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#e0e0e0'
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1
  ctx.strokeRect(16, 16, 480, 288)

  const textColor = isDark ? 'rgba(255,255,255,0.9)' : '#666'
  const subColor = isDark ? 'rgba(255,255,255,0.6)' : '#999'

  ctx.fillStyle = textColor
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(cardText, 256, 160)
  ctx.fillStyle = subColor
  ctx.font = '14px Arial'
  ctx.fillText(cardSubtext, 256, 230)

  const t = new THREE.CanvasTexture(c)
  t.needsUpdate = true
  return t
}

function makeCardTexFromImage(cardColor, img, fit = 'cover') {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 320
  const ctx = c.getContext('2d')

  const s = fit === 'cover'
    ? Math.max(512 / img.width, 320 / img.height)
    : Math.min(512 / img.width, 320 / img.height)
  const w = img.width * s
  const h = img.height * s
  const x = (512 - w) / 2
  const y = (320 - h) / 2

  if (cardColor && fit === 'contain') {
    ctx.fillStyle = cardColor
    ctx.fillRect(0, 0, 512, 320)
  }

  ctx.drawImage(img, x, y, w, h)

  const t = new THREE.CanvasTexture(c)
  t.needsUpdate = true
  return t
}

function BgColorUpdater({ backgroundColor }) {
  const { gl } = useThree()
  useEffect(() => { gl.setClearColor(backgroundColor) }, [gl, backgroundColor])
  return null
}

export default function Lanyard({
  bandColor = '#ffffff',
  cardImage = 'https://wallpapercave.com/wp/wp12409453.jpg',
  cardImageBack = null,
  cardImageFit = 'contain',
  cardText = 'CLOBE',
  cardSubtext = 'EMPLOYEE',
  cardColor = '#ffffff',
  backgroundColor = '#000000',
}) {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', background: backgroundColor }}>
      <Canvas
        camera={{ position: [0, 0, 20], fov: 20 }}
        dpr={[1, mobile ? 1.5 : 2]}
        onCreated={({ gl }) => { gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)) }}
        style={{ width: '100%', height: '100%' }}
      >
        <BgColorUpdater backgroundColor={backgroundColor} />
        <ambientLight intensity={Math.PI} />
        <Physics gravity={[0, -40, 0]} timeStep={mobile ? 1 / 30 : 1 / 60}>
          <Band mobile={mobile} bandColor={bandColor} cardImage={cardImage} cardImageBack={cardImageBack} cardImageFit={cardImageFit} cardText={cardText} cardSubtext={cardSubtext} cardColor={cardColor} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}

function Band({ mobile = false, bandColor, cardImage, cardImageBack, cardImageFit = 'contain', cardText, cardSubtext, cardColor }) {
  const band = useRef()
  const fixed = useRef()
  const j1 = useRef()
  const j2 = useRef()
  const j3 = useRef()
  const card = useRef()
  const vec = useRef(new THREE.Vector3())
  const dir = useRef(new THREE.Vector3())
  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)
  const strapTex = useMemo(() => makeStrapTex(bandColor), [bandColor])
  const [cardTex, setCardTex] = useState(() => makeCardTex(cardColor, cardText, cardSubtext))
  const [backTex, setBackTex] = useState(null)

  useEffect(() => {
    let active = true
    if (cardImage) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => { if (active) setCardTex(makeCardTexFromImage(cardColor, img, cardImageFit)) }
      img.onerror = () => { if (active) setCardTex(makeCardTex(cardColor, cardText, cardSubtext)) }
      img.src = cardImage
    } else {
      setCardTex(makeCardTex(cardColor, cardText, cardSubtext))
    }
    return () => { active = false }
  }, [cardImage, cardColor, cardText, cardSubtext, cardImageFit])

  useEffect(() => {
    let active = true
    if (cardImageBack) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => { if (active) setBackTex(makeCardTexFromImage(cardColor, img, cardImageFit)) }
      img.onerror = () => { if (active) setBackTex(null) }
      img.src = cardImageBack
    } else {
      setBackTex(null)
    }
    return () => { active = false }
  }, [cardImageBack, cardColor, cardImageFit])

  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(), new THREE.Vector3(),
    new THREE.Vector3(), new THREE.Vector3(),
  ]))

  const segProps = useMemo(() => ({
    type: 'dynamic', canSleep: true, colliders: false,
    angularDamping: 4, linearDamping: 4,
  }), [])

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => { document.body.style.cursor = 'auto' }
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged) {
      vec.current.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.current.copy(vec.current).sub(state.camera.position).normalize()
      vec.current.add(dir.current.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vec.current.x - dragged.x,
        y: vec.current.y - dragged.y,
        z: vec.current.z - dragged.z,
      })
    }
    if (fixed.current) {
      ;[j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        const d = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
        ref.current.lerped.lerp(ref.current.translation(), delta * (0 + d * 50))
      })
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(mobile ? 16 : 32))
    }
  })

  curve.curveType = 'chordal'

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[1.0, 1.6, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => {
              e.target.setPointerCapture(e.pointerId)
              const t = card.current.translation()
              drag(new THREE.Vector3(e.point.x - t.x, e.point.y - t.y, e.point.z - t.z))
            }}
          >
            <CardBody cardTex={cardTex} backTex={backTex} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={mobile ? [640, 1280] : [1280, 1280]}
          useMap
          map={strapTex}
          repeat={[-5, 1]}
          lineWidth={1.2}
        />
      </mesh>
    </>
  )
}

function CardBody({ cardTex, backTex }) {
  const { nodes } = useMemo(() => {
    const s = new THREE.Shape()
    const w = 0.5, h = 0.7, r = 0.04
    s.moveTo(-w + r, -h)
    s.lineTo(w - r, -h)
    s.quadraticCurveTo(w, -h, w, -h + r)
    s.lineTo(w, h - r)
    s.quadraticCurveTo(w, h, w - r, h)
    s.lineTo(-w + r, h)
    s.quadraticCurveTo(-w, h, -w, h - r)
    s.lineTo(-w, -h + r)
    s.quadraticCurveTo(-w, -h, -w + r, -h)

    const extrudeSettings = { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.005, bevelSegments: 4 }
    const geo = new THREE.ExtrudeGeometry(s, extrudeSettings)
    geo.center()
    geo.computeVertexNormals()

    const backShape = new THREE.Shape()
    const bw = 0.49, bh = 0.69, br = 0.035
    backShape.moveTo(-bw + br, -bh)
    backShape.lineTo(bw - br, -bh)
    backShape.quadraticCurveTo(bw, -bh, bw, -bh + br)
    backShape.lineTo(bw, bh - br)
    backShape.quadraticCurveTo(bw, bh, bw - br, bh)
    backShape.lineTo(-bw + br, bh)
    backShape.quadraticCurveTo(-bw, bh, -bw, bh - br)
    backShape.lineTo(-bw, -bh + br)
    backShape.quadraticCurveTo(-bw, -bh, -bw + br, -bh)
    const backGeo = new THREE.ShapeGeometry(backShape)

    const postGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.5, 6)
    const clipGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8)
    const ringGeo = new THREE.TorusGeometry(0.05, 0.008, 8, 16, Math.PI)

    return {
      nodes: {
        card: new THREE.Mesh(geo),
        back: new THREE.Mesh(backGeo),
        post: new THREE.Mesh(postGeo),
        clip: new THREE.Mesh(clipGeo),
        ring: new THREE.Mesh(ringGeo),
      }
    }
  }, [])

  return (
    <>
      <mesh geometry={nodes.card.geometry}>
        <meshPhysicalMaterial
          map={cardTex}
          roughness={0.9}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.15}
        />
      </mesh>
      {backTex && (
        <mesh geometry={nodes.back.geometry} position={[0, 0, -0.019]}>
          <meshPhysicalMaterial
            map={backTex}
            roughness={0.9}
            metalness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <mesh geometry={nodes.post.geometry} position={[0, 0.95, 0]}>
        <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh geometry={nodes.clip.geometry} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh geometry={nodes.ring.geometry} position={[0, 1.15, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#bbb" metalness={0.7} roughness={0.3} />
      </mesh>
    </>
  )
}
