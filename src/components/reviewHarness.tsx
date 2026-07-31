// Asset Lab 05E — Scene-G OWNER CHARACTER REVIEW HARNESS (additive presentation).
//
// A dedicated NEUTRAL review area shown only for non-production review views. It re-instantiates
// the EXISTING crew GLBs (no asset/rig/anim/LOD/material change) into clean, consistently-framed
// lineups + a LOD comparison, on a neutral mid-value floor under controlled neutral lighting, with
// small in-canvas labels (so they appear in screenshots). The production Scene G composition is
// rendered elsewhere and is never touched by this file.
import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { CREW_URL } from './studioSlice'
import { getReviewView, G_REVIEW_LOD_ROLE } from '../lab/cameraBridge'

const HERO_URL = '/assets/studio/characters/electric_hero_05f.glb'
const heroLodUrl = (n: 0 | 1 | 2): string => (n === 0 ? HERO_URL : HERO_URL.replace('.glb', `_LOD${n}.glb`))
// Asset Lab 05G — the surgical-correction hero (additive; 05F GLB above is untouched)
const HERO_05G_URL = '/assets/studio/characters/electric_hero_05g.glb'
const hero05gLodUrl = (n: 0 | 1 | 2): string => (n === 0 ? HERO_05G_URL : HERO_05G_URL.replace('.glb', `_LOD${n}.glb`))

const CLIP_URL = '/assets/animation/UAL1_Standard.glb'
const ROLES = ['PA', 'Grip', 'Electric', 'Maintenance', 'Office', 'CameraDP', 'Director', 'Carpenter'] as const
const ROLE_LABEL: Record<string, string> = {
  PA: 'Production Assistant', Grip: 'Grip', Electric: 'Electric', Maintenance: 'Maintenance',
  Office: 'Office / Admin', CameraDP: 'Camera / DP', Director: 'Director', Carpenter: 'Carpenter',
}
const SPACING = 1.15
const IDLE_FREEZE_T = 1.2   // a clean standing frame of Idle_Loop for the static lineups
const lodUrl = (role: string, n: 0 | 1 | 2): string =>
  n === 0 ? CREW_URL[role] : CREW_URL[role].replace('.glb', `_LOD${n}.glb`)

// ----- in-canvas label (sprite + canvas texture): visible in headless screenshots, billboarded -----
function useLabelSprite(lines: string[], lineWorld = 0.14): THREE.Sprite {
  return useMemo(() => {
    const fontPx = 46, lineH = 58, pad = 20
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d')!
    ctx.font = `600 ${fontPx}px ui-monospace, Menlo, monospace`
    const w = Math.ceil(Math.max(...lines.map((l) => ctx.measureText(l).width)) + pad * 2)
    const h = lines.length * lineH + pad * 2
    c.width = w; c.height = h
    const cx = c.getContext('2d')!
    cx.font = `600 ${fontPx}px ui-monospace, Menlo, monospace`
    cx.fillStyle = 'rgba(14,18,24,0.82)'
    const r = 14
    cx.beginPath()
    cx.moveTo(r, 0); cx.arcTo(w, 0, w, h, r); cx.arcTo(w, h, 0, h, r); cx.arcTo(0, h, 0, 0, r); cx.arcTo(0, 0, w, 0, r)
    cx.closePath(); cx.fill()
    cx.textBaseline = 'top'; cx.textAlign = 'left'
    lines.forEach((l, i) => { cx.fillStyle = i === 0 ? '#eaf2fa' : '#a8c6dc'; cx.fillText(l, pad, pad + i * lineH) })
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; tex.anisotropy = 4
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
    const sp = new THREE.Sprite(mat)
    sp.scale.set((w / h) * lineWorld * lines.length, lineWorld * lines.length, 1)
    return sp
  }, [lines.join('|'), lineWorld])
}

function Label({ lines, position, lineWorld }: { lines: string[]; position: [number, number, number]; lineWorld?: number }): JSX.Element {
  const sprite = useLabelSprite(lines, lineWorld)
  return <primitive object={sprite} position={position} renderOrder={999} />
}

// ----- one reviewed character: existing GLB, cloned, playing (or frozen at) a clip -----
function ReviewChar({ url, clip, frozen, phase = 0, pos, rotY = 0 }:
  { url: string; clip: string; frozen: boolean; phase?: number; pos: [number, number, number]; rotY?: number }): JSX.Element {
  const { scene } = useGLTF(url)
  const { animations } = useGLTF(CLIP_URL)
  const obj = useMemo(() => {
    const c = skeletonClone(scene)
    c.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.frustumCulled = false } })
    return c
  }, [scene])
  const mixer = useMemo(() => new THREE.AnimationMixer(obj), [obj])
  useEffect(() => {
    const c = animations.find((a) => a.name === clip) ?? animations[0]
    const action = mixer.clipAction(c)
    action.reset().play()
    action.time = frozen ? IDLE_FREEZE_T : (phase % (c.duration || 1))
    mixer.update(0)            // apply the pose immediately (so a frozen lineup is posed, not bind-pose)
    return () => { mixer.stopAllAction() }
  }, [mixer, animations, clip, frozen, phase])
  useFrame((_, dt) => { if (!frozen) mixer.update(dt) })
  return <group position={pos} rotation={[0, rotY, 0]}><primitive object={obj} /></group>
}

// ----- neutral review environment: mid-value floor + controlled neutral lighting (no overexposure) -----
function ReviewEnv(): JSX.Element {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={'#3f444b'} roughness={0.98} metalness={0} />
      </mesh>
      <ambientLight intensity={0.5} color={'#eef1f4'} />
      <hemisphereLight intensity={0.7} color={'#e8ecf0'} groundColor={'#3a3d42'} />
      <directionalLight position={[6, 12, 9]} intensity={1.0} color={'#f4f6f8'} castShadow
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8}
        shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0004} />
      <directionalLight position={[-8, 7, -6]} intensity={0.35} color={'#dfe6ee'} />
    </group>
  )
}

// ----- the whole-crew lineup (static idle) or animation review (all roles perform ONE clip) -----
function ReviewLineup({ clip, frozen }: { clip: string; frozen: boolean }): JSX.Element {
  return (
    <group>
      <ReviewEnv />
      {ROLES.map((role, i) => {
        const x = (i - (ROLES.length - 1) / 2) * SPACING
        return (
          <group key={role}>
            <ReviewChar url={CREW_URL[role]} clip={clip} frozen={frozen} phase={i * 0.37} pos={[x, 0, 0]} rotY={0} />
            <Label lines={[ROLE_LABEL[role]]} position={[x, 2.08, 0]} lineWorld={0.12} />
          </group>
        )
      })}
    </group>
  )
}

// ----- LOD comparison: same role, same pose/scale/lighting, three tiers, with live counts -----
function meshStats(root: THREE.Object3D): { tris: number; materials: number; joints: number } {
  let tris = 0, joints = 0
  const mats = new Set<string>()
  root.traverse((o) => {
    const m = o as THREE.Mesh & { isSkinnedMesh?: boolean; skeleton?: THREE.Skeleton }
    if (m.isMesh && m.geometry) {
      const g = m.geometry
      tris += (g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0)) / 3
      const mm = m.material
      for (const x of Array.isArray(mm) ? mm : [mm]) if (x) mats.add((x as THREE.Material).uuid)
    }
    if (m.isSkinnedMesh && m.skeleton) joints = Math.max(joints, m.skeleton.bones.length)
  })
  return { tris: Math.round(tris), materials: mats.size, joints }
}

function ReviewLODChar({ role, lod, pos }: { role: string; lod: 0 | 1 | 2; pos: [number, number, number] }): JSX.Element {
  const url = lodUrl(role, lod)
  const { scene } = useGLTF(url)
  const { animations } = useGLTF(CLIP_URL)
  const obj = useMemo(() => {
    const c = skeletonClone(scene)
    c.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.frustumCulled = false } })
    return c
  }, [scene])
  const stats = useMemo(() => meshStats(obj), [obj])
  const mixer = useMemo(() => new THREE.AnimationMixer(obj), [obj])
  useEffect(() => {
    const c = animations.find((a) => a.name === 'Idle_Loop') ?? animations[0]
    const action = mixer.clipAction(c); action.reset().play(); action.time = IDLE_FREEZE_T; mixer.update(0)
    return () => { mixer.stopAllAction() }
  }, [mixer, animations])
  // LOD copies are frozen at the identical pose for an honest comparison.
  return (
    <group position={pos}>
      <primitive object={obj} />
      <Label
        lines={[`${role} · LOD${lod}`, `${stats.tris.toLocaleString()} tris`, `${stats.materials} materials`, `${stats.joints} joints`]}
        position={[0, 2.16, 0]} lineWorld={0.085} />
    </group>
  )
}

function ReviewLOD(): JSX.Element {
  const role = G_REVIEW_LOD_ROLE
  return (
    <group>
      <ReviewEnv />
      <ReviewLODChar role={role} lod={0} pos={[-1.95, 0, 0]} />
      <ReviewLODChar role={role} lod={1} pos={[0, 0, 0]} />
      <ReviewLODChar role={role} lod={2} pos={[1.95, 0, 0]} />
      <Label lines={['LOD comparison — same role, pose, scale & lighting']} position={[0, 2.62, 0]} lineWorld={0.1} />
    </group>
  )
}

// ===== Asset Lab 05F — 05E Electric ↔ 05F hero comparison (accepted 05E on the LEFT, hero on RIGHT) =====
function HeroCompare({ clip, frozen }: { clip: string; frozen: boolean }): JSX.Element {
  return (
    <group>
      <ReviewEnv />
      <ReviewChar url={CREW_URL.Electric} clip={clip} frozen={frozen} pos={[-0.55, 0, 0]} rotY={0} />
      <ReviewChar url={HERO_URL} clip={clip} frozen={frozen} pos={[0.55, 0, 0]} rotY={0} />
      <Label lines={['05E Electric']} position={[-0.55, 2.05, 0]} lineWorld={0.10} />
      <Label lines={['05F Hero']} position={[0.55, 2.05, 0]} lineWorld={0.10} />
    </group>
  )
}

function HeroLODChar({ lod, pos }: { lod: 0 | 1 | 2; pos: [number, number, number] }): JSX.Element {
  const { scene } = useGLTF(heroLodUrl(lod))
  const { animations } = useGLTF(CLIP_URL)
  const obj = useMemo(() => {
    const c = skeletonClone(scene)
    c.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.frustumCulled = false } })
    return c
  }, [scene])
  const stats = useMemo(() => meshStats(obj), [obj])
  const mixer = useMemo(() => new THREE.AnimationMixer(obj), [obj])
  useEffect(() => {
    const c = animations.find((a) => a.name === 'Idle_Loop') ?? animations[0]
    const action = mixer.clipAction(c); action.reset().play(); action.time = IDLE_FREEZE_T; mixer.update(0)
    return () => { mixer.stopAllAction() }
  }, [mixer, animations])
  return (
    <group position={pos}>
      <primitive object={obj} />
      <Label lines={[`05F Hero · LOD${lod}`, `${stats.tris.toLocaleString()} tris`, `${stats.materials} materials`, `${stats.joints} joints`]}
        position={[0, 2.16, 0]} lineWorld={0.085} />
    </group>
  )
}

function HeroLOD(): JSX.Element {
  return (
    <group>
      <ReviewEnv />
      <HeroLODChar lod={0} pos={[-1.95, 0, 0]} />
      <HeroLODChar lod={1} pos={[0, 0, 0]} />
      <HeroLODChar lod={2} pos={[1.95, 0, 0]} />
      <Label lines={['05F Hero LOD comparison — same pose, scale & lighting']} position={[0, 2.62, 0]} lineWorld={0.1} />
    </group>
  )
}

// ===== Asset Lab 05G — 05F hero ↔ 05G surgical-correction comparison (05F LEFT x<0, 05G RIGHT x>0) =====
function Hero05GCompare({ clip, frozen }: { clip: string; frozen: boolean }): JSX.Element {
  return (
    <group>
      <ReviewEnv />
      <ReviewChar url={HERO_URL} clip={clip} frozen={frozen} pos={[-0.55, 0, 0]} rotY={0} />
      <ReviewChar url={HERO_05G_URL} clip={clip} frozen={frozen} pos={[0.55, 0, 0]} rotY={0} />
      <Label lines={['05F Hero']} position={[-0.55, 2.05, 0]} lineWorld={0.10} />
      <Label lines={['05G Hero']} position={[0.55, 2.05, 0]} lineWorld={0.10} />
    </group>
  )
}

function Hero05GLODChar({ lod, pos }: { lod: 0 | 1 | 2; pos: [number, number, number] }): JSX.Element {
  const { scene } = useGLTF(hero05gLodUrl(lod))
  const { animations } = useGLTF(CLIP_URL)
  const obj = useMemo(() => {
    const c = skeletonClone(scene)
    c.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.frustumCulled = false } })
    return c
  }, [scene])
  const stats = useMemo(() => meshStats(obj), [obj])
  const mixer = useMemo(() => new THREE.AnimationMixer(obj), [obj])
  useEffect(() => {
    const c = animations.find((a) => a.name === 'Idle_Loop') ?? animations[0]
    const action = mixer.clipAction(c); action.reset().play(); action.time = IDLE_FREEZE_T; mixer.update(0)
    return () => { mixer.stopAllAction() }
  }, [mixer, animations])
  return (
    <group position={pos}>
      <primitive object={obj} />
      <Label lines={[`05G Hero · LOD${lod}`, `${stats.tris.toLocaleString()} tris`, `${stats.materials} materials`, `${stats.joints} joints`]}
        position={[0, 2.16, 0]} lineWorld={0.085} />
    </group>
  )
}

function Hero05GLOD(): JSX.Element {
  return (
    <group>
      <ReviewEnv />
      <Hero05GLODChar lod={0} pos={[-1.95, 0, 0]} />
      <Hero05GLODChar lod={1} pos={[0, 0, 0]} />
      <Hero05GLODChar lod={2} pos={[1.95, 0, 0]} />
      <Label lines={['05G Hero LOD comparison — same pose, scale & lighting']} position={[0, 2.62, 0]} lineWorld={0.1} />
    </group>
  )
}

// ----- dispatch on the active review view's kind -----
export function ReviewArea({ view }: { view: string }): JSX.Element | null {
  const v = getReviewView(view)
  if (!v || v.kind === 'production') return null
  if (v.kind === 'lod') return <ReviewLOD />
  if (v.kind === 'herolod') return <HeroLOD />
  if (v.kind === 'hero05glod') return <Hero05GLOD />
  // 05G comparison views: 05F hero + 05G hero, same clip/time/scale/lighting. Static (frozen idle) for the
  // structural/region views; live for the animation-comparison views (those carry a `clip`).
  if (v.kind === 'hero05gcompare' || v.kind === 'hero05gsingle')
    return <Hero05GCompare clip={v.clip ?? 'Idle_Loop'} frozen={!v.clip} />
  // 05F comparison views: both characters, same clip/time/scale/lighting. Static (frozen idle) for the
  // structural/region views; live for the animation-comparison views (those carry a `clip`).
  if (v.kind === 'herocompare' || v.kind === 'herosingle')
    return <HeroCompare clip={v.clip ?? 'Idle_Loop'} frozen={!v.clip} />
  // Lineups animate Idle_Loop LIVE (so the sixth required clip, Idle_Loop, is shown performing —
  // the 26-camera list has no separate Idle camera). Close-ups freeze the idle for clean anatomy
  // inspection; animation views play their clip live.
  if (v.kind === 'anim') return <ReviewLineup clip={v.clip ?? 'Idle_Loop'} frozen={false} />
  return <ReviewLineup clip="Idle_Loop" frozen={v.kind === 'closeup'} />
}

// preload the LOD variants + the hero so switching views doesn't stall
;[1, 2].forEach((n) => useGLTF.preload(lodUrl(G_REVIEW_LOD_ROLE, n as 1 | 2)))
useGLTF.preload(HERO_URL);
[1, 2].forEach((n) => useGLTF.preload(heroLodUrl(n as 1 | 2)))
useGLTF.preload(HERO_05G_URL);
[1, 2].forEach((n) => useGLTF.preload(hero05gLodUrl(n as 1 | 2)))
