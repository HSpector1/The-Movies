// ── M3 scale-reference lineup (validation harness) ────────────────────────────
// Owner-mandated first M3 task: prove the crew is no longer oversized. A left→right
// ground-line lineup at the Meridian scene-scale standard: 1.8 m adult (normalized
// Kenney crew) · 2.2 m doorway · production van · passenger car · trailer · equipment
// case · 7 m soundstage elephant door. Authored primitives fix the reference heights
// exactly; the Kenney adult/van/car are scaled to the standard. The adult must read
// shorter than the doorway and van, taller than the car's roofline. Validation-only —
// not the hero scene.

import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type JSX } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Text, OrbitControls } from '@react-three/drei'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { SCALE, CHARACTER_ROOT_SCALE } from '../env/scale'
import { MERIDIAN, M, mat } from '../env/materials'

const CHAR_URL = 'm2-assets/character/character-a.glb'
const VAN_URL = 'm2-assets/car-kit/delivery.glb'
const CAR_URL = 'm2-assets/car-kit/sedan.glb'
;[CHAR_URL, VAN_URL, CAR_URL].forEach((u) => useGLTF.preload(u))

const round = (n: number): number => Math.round(n * 100) / 100
function heightOf(o: THREE.Object3D): number {
  return round(new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()).y)
}

function Label({ children, y = -0.5 }: { children: string; y?: number }): JSX.Element {
  return (
    <Text position={[0, y, 0]} fontSize={0.34} color="#3a2f22" anchorX="center" anchorY="top" maxWidth={4.2} textAlign="center">
      {children}
    </Text>
  )
}

// a GLB scaled uniformly to a target standing height; reports its scaled height.
// native height is measured in useMemo on the DETACHED clone (before any scale is
// applied) so the report is not double-counted by the primitive's own scale.
function ScaledGLB({ url, target, onH, label }: { url: string; target: number; onH: (k: string, h: number) => void; label: string }): JSX.Element {
  const { scene } = useGLTF(url)
  const { obj, s, scaled } = useMemo(() => {
    const o = scene.clone(true)
    o.traverse((m) => {
      const mesh = m as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    const native = heightOf(o) // detached ⇒ local (unscaled) height
    const scale = native > 0 ? target / native : 1
    return { obj: o, s: scale, scaled: round(native * scale) }
  }, [scene, target])
  useEffect(() => {
    onH(label, scaled)
  }, [scaled, onH, label])
  return <primitive object={obj} scale={s} />
}

// normalized Kenney adult (idle/walk) — reports native + scaled height
function AdultRef({ clip, onH }: { clip: string; onH: (k: string, h: number) => void }): JSX.Element {
  const { scene, animations } = useGLTF(CHAR_URL)
  const obj = useMemo(() => skeletonClone(scene), [scene])
  const ref = useRef<THREE.Group>(null)
  const { actions, names } = useAnimations(animations, ref)
  useEffect(() => {
    obj.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
      }
    })
    const native = heightOf(obj)
    onH('adultNative', native)
    onH('adultScaled', round(native * CHARACTER_ROOT_SCALE))
  }, [obj, onH])
  useEffect(() => {
    const a = actions[clip] ?? actions[names[0]]
    if (!a) return
    a.reset().fadeIn(0.2).play()
    return () => {
      a.fadeOut(0.2)
    }
  }, [actions, names, clip])
  return (
    <group scale={CHARACTER_ROOT_SCALE}>
      <group ref={ref}>
        <primitive object={obj} />
      </group>
    </group>
  )
}

// authored 1.8 m human silhouette marker (exact reference)
function Marker(): JSX.Element {
  return (
    <group>
      <mesh position={[0, 0.62, 0]} castShadow material={mat(MERIDIAN.red, { rough: 0.95 })}>
        <capsuleGeometry args={[0.24, 0.72, 6, 12]} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow material={mat('#e8caa8', { rough: 0.9 })}>
        <sphereGeometry args={[0.2, 16, 12]} />
      </mesh>
      {/* a 1.8 m height rod so the eye can measure */}
      <mesh position={[0.5, SCALE.ADULT / 2, 0]} material={mat(MERIDIAN.brassDark, { rough: 0.5, metal: 0.5 })}>
        <boxGeometry args={[0.04, SCALE.ADULT, 0.04]} />
      </mesh>
    </group>
  )
}

// authored 2.2 m doorway (jambs + lintel + dark opening)
function Doorway(): JSX.Element {
  const h = SCALE.DOORWAY
  const w = 1.2
  return (
    <group>
      {[-w / 2 - 0.12, w / 2 + 0.12].map((x) => (
        <mesh key={x} position={[x, h / 2, 0]} castShadow receiveShadow material={M.stucco()}>
          <boxGeometry args={[0.24, h, 0.5]} />
        </mesh>
      ))}
      <mesh position={[0, h + 0.15, 0]} castShadow material={M.stucco()}>
        <boxGeometry args={[w + 0.72, 0.3, 0.5]} />
      </mesh>
      <mesh position={[0, h / 2, -0.1]} material={M.darkInterior()}>
        <boxGeometry args={[w, h, 0.1]} />
      </mesh>
    </group>
  )
}

// authored 3.0 m talent trailer
function Trailer(): JSX.Element {
  const h = SCALE.TRAILER
  return (
    <group>
      <mesh position={[0, h / 2 + 0.4, 0]} castShadow receiveShadow material={M.stucco()}>
        <boxGeometry args={[5, h, 2.4]} />
      </mesh>
      <mesh position={[0, h + 0.3, 0]} castShadow material={M.metal()}>
        <boxGeometry args={[5.1, 0.2, 2.5]} />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 0.4, 0]} castShadow material={mat('#22201c', { rough: 0.9 })}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        </mesh>
      ))}
      <mesh position={[1.6, h / 2 + 0.4, 1.25]} material={M.glass()}>
        <boxGeometry args={[0.8, 1.0, 0.05]} />
      </mesh>
    </group>
  )
}

// authored 1.0 m equipment / road case
function EquipmentCase(): JSX.Element {
  const h = SCALE.EQUIPMENT_CASE
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow material={mat('#3b3630', { rough: 0.7 })}>
        <boxGeometry args={[0.8, h, 0.55]} />
      </mesh>
      <mesh position={[0, h * 0.62, 0]} material={M.metal()}>
        <boxGeometry args={[0.84, 0.05, 0.59]} />
      </mesh>
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, h * 0.62, 0.29]} material={M.brass()}>
          <boxGeometry args={[0.1, 0.12, 0.04]} />
        </mesh>
      ))}
    </group>
  )
}

// authored 7 m soundstage elephant door (buff wall fragment + big sliding door)
function ElephantDoor(): JSX.Element {
  const h = SCALE.ELEPHANT_DOOR
  return (
    <group>
      <mesh position={[0, (h + 1.5) / 2, -0.3]} castShadow receiveShadow material={M.buff()}>
        <boxGeometry args={[7, h + 1.5, 0.6]} />
      </mesh>
      <mesh position={[0, h / 2, 0.05]} material={M.darkInterior()}>
        <boxGeometry args={[5, h, 0.1]} />
      </mesh>
      {/* battened door leaf pushed aside */}
      <mesh position={[3.1, h / 2, 0.2]} castShadow material={M.buffShadow()}>
        <boxGeometry args={[2.4, h, 0.15]} />
      </mesh>
      <mesh position={[0, h + 1.1, 0]} material={M.red()}>
        <boxGeometry args={[1.6, 0.7, 0.1]} />
      </mesh>
      <Text position={[0, h + 1.1, 0.08]} fontSize={0.5} color="#f6e4a6" anchorX="center" anchorY="middle">
        7
      </Text>
    </group>
  )
}

function Ground(): JSX.Element {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={M.lawn()}>
        <planeGeometry args={[80, 40]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.01, 1.2]} receiveShadow material={M.path()}>
        <planeGeometry args={[74, 6]} />
      </mesh>
    </group>
  )
}

function GoldenHour(): JSX.Element {
  const key = useRef<THREE.DirectionalLight>(null)
  useEffect(() => {
    const l = key.current
    if (!l) return
    l.shadow.mapSize.set(2048, 2048)
    Object.assign(l.shadow.camera, { left: -40, right: 40, top: 24, bottom: -12, far: 140 })
    l.shadow.bias = -0.0005
    l.shadow.camera.updateProjectionMatrix()
  }, [])
  return (
    <group>
      <hemisphereLight args={['#f3e6c4', '#5a5340', 0.5]} />
      <ambientLight intensity={0.28} color="#fff2d6" />
      <directionalLight ref={key} position={[-26, 30, 18]} intensity={2.6} color="#ffd9a0" castShadow />
      <directionalLight position={[22, 12, -14]} intensity={0.32} color="#bcd0e0" />
    </group>
  )
}

const ITEMS: { x: number; label: string }[] = [
  { x: -16, label: '1.8 m adult (ref)' },
  { x: -11, label: 'adult — normalized crew' },
  { x: -6, label: 'doorway 2.2 m' },
  { x: -0.5, label: 'production van' },
  { x: 4.5, label: 'car' },
  { x: 9.5, label: 'trailer 3.0 m' },
  { x: 14, label: 'equipment case 1 m' },
  { x: 19, label: 'soundstage door 7 m' },
]

function CaptureCam(): JSX.Element {
  const controls = useRef<import('three-stdlib').OrbitControls>(null)
  useFrame(({ camera }) => {
    camera.position.lerp(new THREE.Vector3(1.5, 7, 27), 0.1)
    if (controls.current) {
      controls.current.target.lerp(new THREE.Vector3(1.5, 1.7, 0), 0.1)
      controls.current.update()
    }
  })
  return <OrbitControls ref={controls} enablePan enableZoom makeDefault />
}

export function ScaleRef(): JSX.Element {
  const [clip, setClip] = useState('idle')
  const [h, setH] = useState<Record<string, number>>({})
  const onH = useMemo(() => (k: string, v: number) => setH((m) => (m[k] === v ? m : { ...m, [k]: v })), [])

  useEffect(() => {
    ;(window as unknown as { __m3scale: unknown }).__m3scale = {
      setClip,
      rootScale: round(CHARACTER_ROOT_SCALE),
      measure: () => ({ ...h, rootScale: round(CHARACTER_ROOT_SCALE), standard: SCALE }),
    }
  }, [h])

  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 42, position: [1.5, 7, 27] }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <color attach="background" args={['#efe4cf']} />
        <fog attach="fog" args={['#efe4cf', 55, 110]} />
        <GoldenHour />
        <Ground />
        <Suspense fallback={null}>
          {ITEMS.map((it) => (
            <group key={it.label} position={[it.x, 0, 0]}>
              {it.label.startsWith('1.8') && <Marker />}
              {it.label.startsWith('adult —') && <AdultRef clip={clip} onH={onH} />}
              {it.label.startsWith('doorway') && <Doorway />}
              {it.label.startsWith('production van') && <ScaledGLB url={VAN_URL} target={SCALE.PRODUCTION_VAN} onH={onH} label="van" />}
              {it.label === 'car' && <ScaledGLB url={CAR_URL} target={SCALE.STUDIO_CAR} onH={onH} label="car" />}
              {it.label.startsWith('trailer') && <Trailer />}
              {it.label.startsWith('equipment') && <EquipmentCase />}
              {it.label.startsWith('soundstage') && <ElephantDoor />}
              <Label>{it.label}</Label>
            </group>
          ))}
        </Suspense>
        <CaptureCam />
      </Canvas>
      <Panel clip={clip} setClip={setClip} h={h} />
    </>
  )
}

function Panel({ clip, setClip, h }: { clip: string; setClip: (c: string) => void; h: Record<string, number> }): JSX.Element {
  const btn: CSSProperties = { display: 'block', width: '100%', margin: '2px 0', padding: '4px 8px', background: '#2c2418', color: '#e8dcc0', border: '1px solid #4a3e2a', borderRadius: 4, font: '11px system-ui', cursor: 'pointer', textAlign: 'left' }
  const ok = h.adultScaled != null && Math.abs(h.adultScaled - SCALE.ADULT) <= 0.25
  return (
    <div style={{ position: 'absolute', top: 10, right: 10, width: 232, zIndex: 10, background: 'rgba(24,20,14,0.9)', border: '1px solid #4a3e2a', borderRadius: 6, padding: 8, color: '#cbb98f', font: '11px system-ui' }}>
      <div style={{ letterSpacing: 1, opacity: 0.8, marginBottom: 4 }}>M3 · SCALE REFERENCE</div>
      <div style={{ opacity: 0.7, marginTop: 4 }}>adult clip</div>
      {['idle', 'walk', 'carry', 'gesture'].map((c) => (
        <button key={c} style={{ ...btn, borderColor: c === clip ? '#b98' : '#4a3e2a' }} onClick={() => setClip(c)}>{c}</button>
      ))}
      <div style={{ marginTop: 6, opacity: 0.7 }}>measured (m)</div>
      <div>adult native: {h.adultNative ?? '—'}</div>
      <div style={{ color: ok ? '#9fd08a' : '#e0b06a' }}>adult normalized: {h.adultScaled ?? '—'} (target {SCALE.ADULT})</div>
      <div>root scale: {round(CHARACTER_ROOT_SCALE)}</div>
      <div>van: {h.van ?? '—'} · car: {h.car ?? '—'}</div>
      <div style={{ marginTop: 6, opacity: 0.55 }}>authored refs: doorway {SCALE.DOORWAY} · trailer {SCALE.TRAILER} · case {SCALE.EQUIPMENT_CASE} · stage door {SCALE.ELEPHANT_DOOR}</div>
    </div>
  )
}
