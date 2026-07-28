// ── M2 test scene (Low-Poly Asset Compatibility Survey) ───────────────────────
// Isolated survey harness — NOT the M1 slice, NOT shipped art. Places a small
// coordinated Kenney (CC0) sample at native scale beside a 1.8 m human reference,
// under Meridian golden-hour light, with a restyle toggle (original ↔ Meridian
// palette-swap) and the rigged character playing mapped clips. Answers: does this
// family import cleanly, sit at a workable scale, read coherently, and accept the
// Meridian art direction? Evidence for Gate B.

import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Text, OrbitControls } from '@react-three/drei'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { M2_ASSETS, CLIP_MAP, type M2Asset } from './assets'
import { meridianizeImage, MERIDIAN_TINT } from './restyle'

// preload the sample
M2_ASSETS.forEach((a) => useGLTF.preload(a.url))

// ── restyle plumbing ──────────────────────────────────────────────────────────
const texCache = new Map<string, THREE.Texture>()
function meridianTexture(src: THREE.Texture): THREE.Texture {
  const img = src.image as HTMLImageElement | ImageBitmap
  const key = (img as HTMLImageElement).src ?? String((img as ImageBitmap).width) + 'x' + String((img as ImageBitmap).height)
  const cached = texCache.get(key)
  if (cached) return cached
  const w = (img as HTMLImageElement).naturalWidth ?? (img as ImageBitmap).width
  const h = (img as HTMLImageElement).naturalHeight ?? (img as ImageBitmap).height
  const canvas = meridianizeImage(img, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.flipY = src.flipY
  tex.colorSpace = src.colorSpace
  tex.wrapS = src.wrapS
  tex.wrapT = src.wrapT
  tex.magFilter = src.magFilter
  tex.minFilter = src.minFilter
  tex.needsUpdate = true
  texCache.set(key, tex)
  return tex
}

/** Apply (or leave original) the Meridian restyle to a cloned object graph. */
function applyRestyle(root: THREE.Object3D, on: boolean, type: string): void {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const cloned = mats.map((m) => {
      const src = m as THREE.MeshStandardMaterial
      const mat = src.clone()
      if (on) {
        if (src.map) {
          mat.map = meridianTexture(src.map)
          mat.color = new THREE.Color('#ffffff')
        } else {
          // map-less (vertex-coloured) asset → tint toward the type's anchor
          mat.color = new THREE.Color(MERIDIAN_TINT[type] ?? '#c9bfa2')
        }
      }
      mat.roughness = 0.9
      mat.metalness = 0
      mat.needsUpdate = true
      return mat
    })
    mesh.material = cloned.length === 1 ? cloned[0] : cloned
    mesh.castShadow = true
    mesh.receiveShadow = true
  })
}

function box(obj: THREE.Object3D): THREE.Vector3 {
  return new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3())
}

// ── a single placed sample (static) ───────────────────────────────────────────
function Sample({ asset, x, restyle, onMeasure }: { asset: M2Asset; x: number; restyle: boolean; onMeasure: (k: string, dims: [number, number, number]) => void }): JSX.Element {
  const { scene } = useGLTF(asset.url)
  const group = useMemo(() => {
    const objs: THREE.Object3D[] = []
    const n = asset.count ?? 1
    for (let i = 0; i < n; i++) objs.push(skeletonClone(scene))
    return objs
  }, [scene, asset.count])

  useEffect(() => {
    group.forEach((o) => applyRestyle(o, restyle, asset.type))
    const dims = box(group[0])
    onMeasure(asset.key, [round(dims.x), round(dims.y), round(dims.z)])
  }, [group, restyle, asset.type, asset.key, onMeasure])

  const spread = 1.4
  return (
    <group position={[x, 0, 0]}>
      {group.map((o, i) => (
        <primitive key={i} object={o} position={[(i - (group.length - 1) / 2) * spread, 0, i % 2 ? 0.6 : 0]} />
      ))}
      <Text position={[0, -0.6, 0]} fontSize={0.42} color="#3a2f22" anchorX="center" anchorY="top">
        {asset.label}
      </Text>
      <Text position={[0, -1.15, 0]} fontSize={0.28} color="#8a7a5c" anchorX="center" anchorY="top">
        {asset.pack}
      </Text>
    </group>
  )
}

// ── the rigged, animated character ────────────────────────────────────────────
function AnimatedCrew({ x, restyle, clip, onMeasure, onClips }: { x: number; restyle: boolean; clip: string; onMeasure: (k: string, d: [number, number, number]) => void; onClips: (names: string[]) => void }): JSX.Element {
  const asset = M2_ASSETS.find((a) => a.type === 'humanoid')!
  const { scene, animations } = useGLTF(asset.url)
  const obj = useMemo(() => skeletonClone(scene), [scene])
  const ref = useRef<THREE.Group>(null)
  const { actions, names } = useAnimations(animations, ref)

  useEffect(() => {
    applyRestyle(obj, restyle, 'humanoid')
    onMeasure('humanoid', ((d) => [round(d.x), round(d.y), round(d.z)] as [number, number, number])(box(obj)))
  }, [obj, restyle, onMeasure])

  useEffect(() => {
    onClips(names)
  }, [names, onClips])

  useEffect(() => {
    const target = CLIP_MAP[clip] ?? clip
    const a = actions[target] ?? actions[names[0]]
    if (!a) return
    a.reset().fadeIn(0.2).play()
    return () => {
      a.fadeOut(0.2)
    }
  }, [actions, names, clip])

  return (
    <group position={[x, 0, 0]}>
      <group ref={ref}>
        <primitive object={obj} />
      </group>
      <Text position={[0, -0.6, 0]} fontSize={0.42} color="#3a2f22" anchorX="center" anchorY="top">
        {asset.label}
      </Text>
      <Text position={[0, -1.15, 0]} fontSize={0.28} color="#8a7a5c" anchorX="center" anchorY="top">
        {`${asset.pack} · clip: ${clip}`}
      </Text>
    </group>
  )
}

// 1.8 m human reference so scale compatibility reads at a glance
function HumanReference({ x }: { x: number }): JSX.Element {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.85, 6, 12]} />
        <meshStandardMaterial color="#7a2f2a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color="#e8caa8" roughness={0.9} />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.42} color="#3a2f22" anchorX="center" anchorY="top">
        1.8 m reference
      </Text>
    </group>
  )
}

function Ground(): JSX.Element {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#8a9a6b" roughness={1} />
      </mesh>
      {/* warm-asphalt apron the assets stand on */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.3]} receiveShadow>
        <planeGeometry args={[76, 8]} />
        <meshStandardMaterial color="#6b5f52" roughness={1} />
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
    l.shadow.camera.left = -40
    l.shadow.camera.right = 40
    l.shadow.camera.top = 20
    l.shadow.camera.bottom = -20
    l.shadow.camera.far = 120
    l.shadow.bias = -0.0005
  }, [])
  return (
    <group>
      <hemisphereLight args={['#f3e6c4', '#5a5340', 0.55]} />
      <ambientLight intensity={0.25} color="#fff2d6" />
      <directionalLight ref={key} position={[-24, 26, 16]} intensity={2.5} color="#ffd9a0" castShadow />
      <directionalLight position={[20, 10, -12]} intensity={0.35} color="#bcd0e0" />
    </group>
  )
}

// drives capture: camera presets + slow orbit
function CaptureCam({ view }: { view: string }): JSX.Element {
  const controls = useRef<import('three-stdlib').OrbitControls>(null)
  useFrame(({ camera }) => {
    const target = VIEWS[view] ?? VIEWS.lineup
    camera.position.lerp(new THREE.Vector3(...target.pos), 0.12)
    if (controls.current) {
      controls.current.target.lerp(new THREE.Vector3(...target.target), 0.12)
      controls.current.update()
    }
  })
  return <OrbitControls ref={controls} enablePan enableZoom makeDefault />
}

const VIEWS: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
  lineup: { pos: [0, 9, 26], target: [0, 1.2, 0] },
  closeBuilding: { pos: [-14, 4, 10], target: [-16, 2, 0] },
  closeVehicle: { pos: [2, 3, 9], target: [0, 1, 0] },
  closeCrew: { pos: [16, 2.6, 8], target: [15, 1.1, 0] },
  // recognition-probe framings (studio mode)
  studioOverview: { pos: [1, 17, 35], target: [-2, 2.5, -4] },
  studioGround: { pos: [-15, 3.4, 16], target: [-3, 1.6, 0] },
}

const round = (n: number): number => Math.round(n * 100) / 100

const urlOf = (key: string): string => M2_ASSETS.find((a) => a.key === key)!.url

// headless-readable fps (software WebGL under swiftshader — a FLOOR, not a verdict)
function FpsMeter({ onFps }: { onFps: (n: number) => void }): null {
  const acc = useRef({ t: 0, n: 0 })
  useFrame((_, dt) => {
    const a = acc.current
    a.t += dt
    a.n += 1
    if (a.t >= 0.5) {
      onFps(Math.round(a.n / a.t))
      a.t = 0
      a.n = 0
    }
  })
  return null
}

// one placed, restyled clone of a sampled asset (scale/pivot/material as authored here)
function Placed({ url, type, pos, rotY = 0, scale = 1, restyle, skinned = false }: {
  url: string
  type: string
  pos: [number, number, number]
  rotY?: number
  scale?: number | [number, number, number]
  restyle: boolean
  skinned?: boolean
}): JSX.Element {
  const { scene } = useGLTF(url)
  const obj = useMemo(() => (skinned ? skeletonClone(scene) : scene.clone(true)) as THREE.Object3D, [scene, skinned])
  useEffect(() => {
    applyRestyle(obj, restyle, type)
  }, [obj, restyle, type])
  return <primitive object={obj} position={pos} rotation={[0, rotY, 0]} scale={scale} />
}

// ── recognition PROBE (studio mode) ───────────────────────────────────────────
// The SAME sampled Kenney family — scaled and arranged into a rough production-street
// corner, seen from overview distance. Answers the owner's binding Gate-A concern
// ("does it read as a movie studio, not a fire station, from the world itself?").
// This is a SURVEY probe, NOT final art and NOT the M3 coherent art pass. The
// soundstage / gate / water-tower identity is deliberately ABSENT — those are the
// documented custom landmarks (see ASSET-POLICY "must remain original"); their
// absence is itself part of the finding.
function StudioCorner({ restyle }: { restyle: boolean }): JSX.Element {
  const B = urlOf('building')
  const H = urlOf('hangar')
  const V = urlOf('vehicle')
  const C = urlOf('car')
  const T = urlOf('vegetation')
  const P = urlOf('prop')
  const K = urlOf('humanoid')
  return (
    <group>
      {/* warm-asphalt apron / production street */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0.02, 3]} receiveShadow>
        <planeGeometry args={[66, 17]} />
        <meshStandardMaterial color="#6b5f52" roughness={1} />
      </mesh>
      {/* office / bungalow row — city-kit piece scaled up (kit architecture is modular/undersized) */}
      <Placed url={B} type="building" pos={[-21, 0, -7]} scale={3.4} restyle={restyle} />
      <Placed url={B} type="building" pos={[-14, 0, -7]} rotY={0.06} scale={3.0} restyle={restyle} />
      <Placed url={B} type="building" pos={[-7.5, 0, -8]} scale={3.2} restyle={restyle} />
      {/* stage-adjacent industrial mass — a big block as a stage-shell PLACEHOLDER (the real
          soundstage is a required custom landmark) + a vertical factory element */}
      <Placed url={P} type="hangar" pos={[11, 0, -10]} scale={[8, 13, 10]} restyle={restyle} />
      <Placed url={H} type="hangar" pos={[3.5, 0, -8]} scale={4.2} restyle={restyle} />
      {/* production vehicles on the apron */}
      <Placed url={V} type="vehicle" pos={[-6, 0, 3]} rotY={-0.5} restyle={restyle} />
      <Placed url={V} type="vehicle" pos={[0.5, 0, 5.5]} rotY={0.5} restyle={restyle} />
      <Placed url={C} type="car" pos={[-11.5, 0, 5]} rotY={0.25} restyle={restyle} />
      {/* equipment cases near the stage */}
      <Placed url={P} type="prop" pos={[6, 0, 0.6]} restyle={restyle} />
      <Placed url={P} type="prop" pos={[7.2, 0, 1.5]} rotY={0.4} restyle={restyle} />
      <Placed url={P} type="prop" pos={[5.1, 0, 1.7]} rotY={-0.3} restyle={restyle} />
      {/* sage landscaping */}
      {([[-24, -2], [-17.5, -1.5], [-10.5, -2], [16, -3], [18, 1], [-2.5, -3]] as [number, number][]).map(([x, z], i) => (
        <Placed key={i} url={T} type="vegetation" pos={[x, 0, z]} scale={1.5 + (i % 3) * 0.35} restyle={restyle} />
      ))}
      {/* crew (native scale — reads ~human height; bind pose) */}
      <Placed url={K} type="humanoid" pos={[3.6, 0, 2]} rotY={2.4} restyle={restyle} skinned />
      <Placed url={K} type="humanoid" pos={[4.7, 0, 2.7]} rotY={-2.0} restyle={restyle} skinned />
      <Placed url={K} type="humanoid" pos={[-4.5, 0, 4]} rotY={0.8} restyle={restyle} skinned />
    </group>
  )
}

export function M2Scene(): JSX.Element {
  const [restyle, setRestyle] = useState(false)
  const [clip, setClip] = useState('idle')
  const [view, setView] = useState('lineup')
  const [mode, setMode] = useState<'lineup' | 'studio'>('lineup')
  const [fps, setFps] = useState(0)
  const [measures, setMeasures] = useState<Record<string, [number, number, number]>>({})
  const [clips, setClips] = useState<string[]>([])

  const onMeasure = useMemo(() => (k: string, d: [number, number, number]) => setMeasures((m) => (m[k] && m[k].join() === d.join() ? m : { ...m, [k]: d })), [])
  const onClips = useMemo(() => (n: string[]) => setClips(n), [])
  const onFps = useMemo(() => (n: number) => setFps(n), [])

  // window hook for the headless Gate-B capture harness
  useEffect(() => {
    ;(window as unknown as { __m2: unknown }).__m2 = {
      setRestyle,
      setClip,
      setView,
      setMode,
      state: () => ({ restyle, clip, view, mode, fps, measures, clips, assets: M2_ASSETS.map((a) => a.key) }),
    }
  }, [restyle, clip, view, mode, fps, measures, clips])

  const statics = M2_ASSETS.filter((a) => a.type !== 'humanoid')
  const step = 4.6
  const startX = (-(statics.length + 1) * step) / 2 // + human ref + crew

  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 42, position: [0, 9, 26] }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <color attach="background" args={['#efe4cf']} />
        <fog attach="fog" args={['#efe4cf', 40, 90]} />
        <GoldenHour />
        <Ground />
        <FpsMeter onFps={onFps} />
        <Suspense fallback={null}>
          {mode === 'lineup' ? (
            <>
              <HumanReference x={startX} />
              {statics.map((a, i) => (
                <Sample key={a.key} asset={a} x={startX + (i + 1) * step} restyle={restyle} onMeasure={onMeasure} />
              ))}
              <AnimatedCrew x={startX + (statics.length + 1) * step} restyle={restyle} clip={clip} onMeasure={onMeasure} onClips={onClips} />
            </>
          ) : (
            <StudioCorner restyle={restyle} />
          )}
        </Suspense>
        <CaptureCam view={view} />
      </Canvas>
      <Panel restyle={restyle} setRestyle={setRestyle} clip={clip} setClip={setClip} view={view} setView={setView} mode={mode} setMode={setMode} fps={fps} measures={measures} clips={clips} />
    </>
  )
}

function Panel({ restyle, setRestyle, clip, setClip, view, setView, mode, setMode, fps, measures, clips }: {
  restyle: boolean
  setRestyle: (b: boolean) => void
  clip: string
  setClip: (c: string) => void
  view: string
  setView: (v: string) => void
  mode: 'lineup' | 'studio'
  setMode: (m: 'lineup' | 'studio') => void
  fps: number
  measures: Record<string, [number, number, number]>
  clips: string[]
}): JSX.Element {
  const btn: CSSProperties = { display: 'block', width: '100%', margin: '2px 0', padding: '4px 8px', background: '#2c2418', color: '#e8dcc0', border: '1px solid #4a3e2a', borderRadius: 4, font: '11px system-ui', cursor: 'pointer', textAlign: 'left' }
  return (
    <div style={{ position: 'absolute', top: 10, right: 10, width: 220, zIndex: 10, background: 'rgba(24,20,14,0.9)', border: '1px solid #4a3e2a', borderRadius: 6, padding: 8, color: '#cbb98f', font: '11px system-ui' }}>
      <div style={{ letterSpacing: 1, opacity: 0.8, marginBottom: 4 }}>M2 · ASSET SURVEY · {fps} fps*</div>
      <button style={btn} onClick={() => setRestyle(!restyle)}>{restyle ? '● Meridian restyle (ON)' : '○ Meridian restyle (off)'}</button>
      <div style={{ marginTop: 6, opacity: 0.7 }}>mode</div>
      {(['lineup', 'studio'] as const).map((m) => (
        <button key={m} style={{ ...btn, borderColor: m === mode ? '#b98' : '#4a3e2a' }} onClick={() => setMode(m)}>{m === 'studio' ? 'studio (recognition probe)' : 'lineup'}</button>
      ))}
      <div style={{ marginTop: 6, opacity: 0.7 }}>view</div>
      {Object.keys(VIEWS).map((v) => (
        <button key={v} style={{ ...btn, borderColor: v === view ? '#b98' : '#4a3e2a' }} onClick={() => setView(v)}>{v}</button>
      ))}
      <div style={{ marginTop: 6, opacity: 0.7 }}>crew clip</div>
      {['idle', 'walk', 'gesture', 'carrying', 'reacting'].map((c) => (
        <button key={c} style={{ ...btn, borderColor: c === clip ? '#b98' : '#4a3e2a' }} onClick={() => setClip(c)}>{c}</button>
      ))}
      <div style={{ marginTop: 6, opacity: 0.7 }}>measured height (m)</div>
      {Object.entries(measures).map(([k, d]) => (
        <div key={k} style={{ opacity: 0.85 }}>{k}: {d[0]}×{d[1]}×{d[2]}</div>
      ))}
      <div style={{ marginTop: 6, opacity: 0.55 }}>{clips.length} clips on rig</div>
      <div style={{ marginTop: 4, opacity: 0.4, fontSize: 10 }}>*fps: real GPU in-browser; software floor under headless capture — not a hardware verdict</div>
    </div>
  )
}
