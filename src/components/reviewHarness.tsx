// Asset Lab 05E — Scene-G OWNER CHARACTER REVIEW HARNESS (additive presentation).
//
// A dedicated NEUTRAL review area shown only for non-production review views. It re-instantiates
// the EXISTING crew GLBs (no asset/rig/anim/LOD/material change) into clean, consistently-framed
// lineups + a LOD comparison, on a neutral mid-value floor under controlled neutral lighting, with
// small in-canvas labels (so they appear in screenshots). The production Scene G composition is
// rendered elsewhere and is never touched by this file.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, OrthographicCamera, Billboard, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { CREW_URL } from './studioSlice'
import { getReviewView, G_REVIEW_LOD_ROLE, type GReviewView } from '../lab/cameraBridge'
import { useLab } from '../lab/LabContext'

const HERO_URL = '/assets/studio/characters/electric_hero_05f.glb'
const heroLodUrl = (n: 0 | 1 | 2): string => (n === 0 ? HERO_URL : HERO_URL.replace('.glb', `_LOD${n}.glb`))
// Asset Lab 05G — the surgical-correction hero (additive; 05F GLB above is untouched)
const HERO_05G_URL = '/assets/studio/characters/electric_hero_05g.glb'
const hero05gLodUrl = (n: 0 | 1 | 2): string => (n === 0 ? HERO_05G_URL : HERO_05G_URL.replace('.glb', `_LOD${n}.glb`))

// Asset Lab 05H — the authored-base hero (additive; 05G GLB above is untouched)
const HERO_05H_URL = '/assets/studio/characters/electric_hero_05h.glb'
const hero05hLodUrl = (n: 0 | 1 | 2): string => (n === 0 ? HERO_05H_URL : HERO_05H_URL.replace('.glb', `_LOD${n}.glb`))

// Asset Lab 05I — the corrective-pass hero (additive; 05H GLB above is untouched)
const HERO_05I_URL = '/assets/studio/characters/electric_hero_05i.glb'
const hero05iLodUrl = (n: 0 | 1 | 2): string => (n === 0 ? HERO_05I_URL : HERO_05I_URL.replace('.glb', `_LOD${n}.glb`))

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
// Asset Lab 05I §7: when state.neutralEval is set, switch to a strictly NEUTRAL-WHITE, balanced setup
// (equal-RGB lights + neutral floor) so actual material colour can be judged honestly, without the slight
// cool tint of the standard review env. Off = the existing review env (unchanged for 05E–05H captures).
function ReviewEnv(): JSX.Element {
  const { state } = useLab()
  if (state.neutralEval) {
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color={'#4a4a4a'} roughness={0.98} metalness={0} />
        </mesh>
        <ambientLight intensity={0.55} color={'#ffffff'} />
        <hemisphereLight intensity={0.7} color={'#ffffff'} groundColor={'#4a4a4a'} />
        <directionalLight position={[6, 12, 9]} intensity={1.05} color={'#ffffff'} castShadow
          shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8}
          shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0004} />
        <directionalLight position={[-8, 7, -6]} intensity={0.4} color={'#ffffff'} />
      </group>
    )
  }
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

// ===== Asset Lab 05H — 05G hero ↔ 05H authored-base hero comparison (05G LEFT x<0, 05H RIGHT x>0) =====
function Hero05HCompare({ clip, frozen }: { clip: string; frozen: boolean }): JSX.Element {
  return (
    <group>
      <ReviewEnv />
      <ReviewChar url={HERO_05G_URL} clip={clip} frozen={frozen} pos={[-0.55, 0, 0]} rotY={0} />
      <ReviewChar url={HERO_05H_URL} clip={clip} frozen={frozen} pos={[0.55, 0, 0]} rotY={0} />
      <Label lines={['05G Hero']} position={[-0.55, 2.05, 0]} lineWorld={0.10} />
      <Label lines={['05H Hero']} position={[0.55, 2.05, 0]} lineWorld={0.10} />
    </group>
  )
}

function Hero05HLODChar({ lod, pos }: { lod: 0 | 1 | 2; pos: [number, number, number] }): JSX.Element {
  const { scene } = useGLTF(hero05hLodUrl(lod))
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
      <Label lines={[`05H Hero · LOD${lod}`, `${stats.tris.toLocaleString()} tris`, `${stats.materials} materials`, `${stats.joints} joints`]}
        position={[0, 2.16, 0]} lineWorld={0.085} />
    </group>
  )
}

function Hero05HLOD(): JSX.Element {
  return (
    <group>
      <ReviewEnv />
      <Hero05HLODChar lod={0} pos={[-1.95, 0, 0]} />
      <Hero05HLODChar lod={1} pos={[0, 0, 0]} />
      <Hero05HLODChar lod={2} pos={[1.95, 0, 0]} />
      <Label lines={['05H Hero LOD comparison — same pose, scale & lighting']} position={[0, 2.62, 0]} lineWorld={0.1} />
    </group>
  )
}

// ===== Asset Lab 05I — 05H hero ↔ 05I corrective pass (05H LEFT x<0, 05I RIGHT x>0) =====
function Hero05ICompare({ clip, frozen }: { clip: string; frozen: boolean }): JSX.Element {
  return (
    <group>
      <ReviewEnv />
      <ReviewChar url={HERO_05H_URL} clip={clip} frozen={frozen} pos={[-0.55, 0, 0]} rotY={0} />
      <ReviewChar url={HERO_05I_URL} clip={clip} frozen={frozen} pos={[0.55, 0, 0]} rotY={0} />
      <Label lines={['05H Hero']} position={[-0.55, 2.05, 0]} lineWorld={0.10} />
      <Label lines={['05I Hero']} position={[0.55, 2.05, 0]} lineWorld={0.10} />
    </group>
  )
}

function Hero05ILODChar({ lod, pos }: { lod: 0 | 1 | 2; pos: [number, number, number] }): JSX.Element {
  const { scene } = useGLTF(hero05iLodUrl(lod))
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
      <Label lines={[`05I Hero · LOD${lod}`, `${stats.tris.toLocaleString()} tris`, `${stats.materials} materials`, `${stats.joints} joints`]}
        position={[0, 2.16, 0]} lineWorld={0.085} />
    </group>
  )
}

function Hero05ILOD(): JSX.Element {
  return (
    <group>
      <ReviewEnv />
      <Hero05ILODChar lod={0} pos={[-1.95, 0, 0]} />
      <Hero05ILODChar lod={1} pos={[0, 0, 0]} />
      <Hero05ILODChar lod={2} pos={[1.95, 0, 0]} />
      <Label lines={['05I Hero LOD comparison — same pose, scale & lighting']} position={[0, 2.62, 0]} lineWorld={0.1} />
    </group>
  )
}

// ===== Asset Lab 05H FINAL REVIEW — FIXED-ISOMETRIC MANAGEMENT-CAMERA VIGNETTES (Question B) =====
// A representative orthographic isometric management rig (see cameraBridge.G_MGMT for the documented
// assumption — this repo has no real D1 camera) over NEUTRAL review geometry: a procedural stage-
// massing box + concrete apron + cart / film-light / crate props, with the worker source swappable
// at capture time (05g / 05h / pre-rendered sprite / none) and animation frozen under reduced motion.
// Evidence-only: NOT a D1 import, NOT production, NO GameState. It answers "does live skinned 3D add
// enough value at the management camera to justify its cost?" across a range of framings & elevations.

// pre-rendered iso card (generated in the review pass). Lives under the committed studio/ subtree so the
// harness runs on a fresh checkout (public/assets/* is otherwise gitignored except public/assets/studio/).
const SPRITE_URL = '/assets/studio/review/05h_sprite.png'

// One fixed orthographic isometric camera. `pos` sets the iso DIRECTION only (ortho ignores distance);
// `zoom` sets framing; the rig looks at `tgt`. Owns the default camera while a mgmt view is active.
function ManagementCameraRig({ pos, tgt, zoom }: { pos: [number, number, number]; tgt: [number, number, number]; zoom: number }): JSX.Element {
  const ref = useRef<THREE.OrthographicCamera>(null)
  useEffect(() => {
    const cam = ref.current
    if (!cam) return
    cam.position.set(pos[0], pos[1], pos[2])
    cam.zoom = zoom
    cam.near = 0.1
    cam.far = 4000
    cam.up.set(0, 1, 0)
    cam.lookAt(new THREE.Vector3(tgt[0], tgt[1], tgt[2]))
    cam.updateProjectionMatrix()
    cam.updateMatrixWorld()
  }, [pos[0], pos[1], pos[2], tgt[0], tgt[1], tgt[2], zoom])
  return <OrthographicCamera ref={ref} makeDefault near={0.1} far={4000} />
}

// ---- procedural neutral vignette props (boxes only — scale, framing & contrast matter, not art) ----
function StageMassing(): JSX.Element {
  return (
    <group position={[0, 0, -6.2]}>
      <mesh position={[0, 3.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[13, 7.2, 6]} /><meshStandardMaterial color={'#4a4f57'} roughness={0.95} metalness={0} />
      </mesh>
      {/* roll-up stage door on the camera-facing (+Z) side */}
      <mesh position={[0, 2.3, 3.02]}><boxGeometry args={[5.2, 4.4, 0.12]} /><meshStandardMaterial color={'#31353c'} roughness={1} /></mesh>
      {/* open-door warm interior spill — implies an active / occupied stage */}
      <mesh position={[0, 2.2, 3.09]}><planeGeometry args={[3.4, 3.6]} /><meshBasicMaterial color={'#c79a5a'} toneMapped={false} /></mesh>
      <pointLight position={[0, 2.4, 2.2]} intensity={6} distance={9} color={'#e7b070'} />
      <mesh position={[3.9, 5.3, 3.02]}><boxGeometry args={[1.3, 1.0, 0.08]} /><meshStandardMaterial color={'#20242a'} roughness={1} /></mesh>
    </group>
  )
}
function MgmtCart({ pos }: { pos: [number, number, number] }): JSX.Element {
  return (
    <group position={pos}>
      <mesh position={[0, 0.62, 0]} castShadow><boxGeometry args={[1.3, 0.9, 0.72]} /><meshStandardMaterial color={'#565c65'} roughness={0.85} metalness={0.1} /></mesh>
      <mesh position={[0, 1.12, 0]} castShadow><boxGeometry args={[1.1, 0.12, 0.6]} /><meshStandardMaterial color={'#3a3f47'} roughness={0.9} /></mesh>
    </group>
  )
}
function MgmtLight({ pos }: { pos: [number, number, number] }): JSX.Element {
  return (
    <group position={pos}>
      <mesh position={[0, 1.1, 0]} castShadow><cylinderGeometry args={[0.05, 0.07, 2.2, 8]} /><meshStandardMaterial color={'#2e333a'} roughness={0.8} metalness={0.3} /></mesh>
      <mesh position={[0, 2.2, 0.12]} castShadow><boxGeometry args={[0.5, 0.5, 0.34]} /><meshStandardMaterial color={'#3d424b'} roughness={0.6} metalness={0.2} /></mesh>
      <mesh position={[0, 2.2, 0.31]}><planeGeometry args={[0.36, 0.36]} /><meshBasicMaterial color={'#d9c38f'} toneMapped={false} /></mesh>
    </group>
  )
}
function MgmtCrate({ pos, s = 0.8 }: { pos: [number, number, number]; s?: number }): JSX.Element {
  return <mesh position={[pos[0], s / 2, pos[2]]} castShadow receiveShadow><boxGeometry args={[s, s, s]} /><meshStandardMaterial color={'#6a6253'} roughness={0.95} /></mesh>
}
function MgmtApron(): JSX.Element {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -0.5]} receiveShadow>
      <planeGeometry args={[18, 16]} /><meshStandardMaterial color={'#565b62'} roughness={0.97} metalness={0} />
    </mesh>
  )
}

// ---- pre-rendered sprite worker: a camera-facing card, the 2.5D alternative to live skinned 3D ----
function SpriteWorker({ pos }: { pos: [number, number, number] }): JSX.Element {
  const tex = useTexture(SPRITE_URL)
  return (
    <Billboard position={[pos[0], 0.9, pos[2]]}>
      <mesh><planeGeometry args={[1.15, 1.9]} /><meshBasicMaterial map={tex} transparent alphaTest={0.5} toneMapped={false} /></mesh>
    </Billboard>
  )
}

// ---- per-vignette worker layouts + which neutral props to show ----
type MgmtWorker = { pos: [number, number, number]; rotY: number; clip?: string }
const MGMT_LAYOUTS: Record<string, { workers: MgmtWorker[]; props: Array<'stage' | 'apron' | 'cart' | 'light' | 'crate'> }> = {
  one:   { workers: [{ pos: [0.9, 0, 1.4], rotY: 0.1 }], props: ['apron', 'stage', 'light'] },
  two:   { workers: [{ pos: [-0.95, 0, 0.7], rotY: 0.7, clip: 'Idle_Talking_Loop' }, { pos: [0.95, 0, 0.5], rotY: -0.6, clip: 'Idle_Talking_Loop' }], props: ['apron', 'cart', 'light'] },
  four:  { workers: [{ pos: [-2.6, 0, 1.5], rotY: 0.3 }, { pos: [-0.6, 0, 0.3], rotY: -0.2, clip: 'Idle_Talking_Loop' }, { pos: [1.7, 0, 1.1], rotY: 0.5, clip: 'PickUp_Table' }, { pos: [3.0, 0, -0.5], rotY: -0.6 }], props: ['apron', 'stage', 'cart', 'light', 'crate'] },
  walk:  { workers: [{ pos: [-2.4, 0, 0.5], rotY: 1.3, clip: 'Walk_Loop' }], props: ['apron', 'crate'] },
  seat:  { workers: [{ pos: [0, 0, 0.3], rotY: 0.05, clip: 'Sitting_Idle_Loop' }], props: ['apron'] },
  kneel: { workers: [{ pos: [0, 0, 0.5], rotY: 0.1, clip: 'Fixing_Kneeling' }], props: ['apron', 'light'] },
}

function MgmtWorkerNode({ w, source, frozen, phase }: { w: MgmtWorker; source: string; frozen: boolean; phase: number }): JSX.Element | null {
  if (source === 'none') return null
  if (source === 'sprite') return <SpriteWorker pos={w.pos} />
  const url = source === '05g' ? HERO_05G_URL : HERO_05H_URL
  return <ReviewChar url={url} clip={w.clip ?? 'Idle_Loop'} frozen={frozen} phase={phase} pos={w.pos} rotY={w.rotY} />
}

function ManagementScene({ view }: { view: GReviewView }): JSX.Element {
  const { state } = useLab()
  const layout = MGMT_LAYOUTS[view.mgmt ?? 'one'] ?? MGMT_LAYOUTS.one
  const source = state.mgmtWorker || '05h'
  const frozen = state.reducedMotion
  const zoom = (view.zoom ?? 40) * (state.mgmtZoomMul || 1)
  return (
    <group>
      <ManagementCameraRig pos={view.pos} tgt={view.tgt} zoom={zoom} />
      <ReviewEnv />
      {layout.props.includes('apron') && <MgmtApron />}
      {layout.props.includes('stage') && <StageMassing />}
      {layout.props.includes('cart') && <MgmtCart pos={[0, 0, 0]} />}
      {layout.props.includes('light') && <MgmtLight pos={[-2.2, 0, -1.6]} />}
      {layout.props.includes('crate') && <><MgmtCrate pos={[2.4, 0, 1.6]} s={0.8} /><MgmtCrate pos={[2.9, 0, 1.9]} s={0.55} /></>}
      {view.mgmt === 'seat' && (
        <mesh position={[0, 0.26, 0.28]} castShadow receiveShadow><boxGeometry args={[0.7, 0.5, 0.7]} /><meshStandardMaterial color={'#5a5048'} roughness={0.95} /></mesh>
      )}
      {layout.workers.map((w, i) => (
        <MgmtWorkerNode key={i} w={w} source={source} frozen={frozen} phase={i * 0.53 + 0.2} />
      ))}
    </group>
  )
}

// ----- dispatch on the active review view's kind -----
export function ReviewArea({ view }: { view: string }): JSX.Element | null {
  const v = getReviewView(view)
  if (!v || v.kind === 'production') return null
  if (v.kind === 'mgmt') return <ManagementScene view={v} />
  if (v.kind === 'hero05ilod') return <Hero05ILOD />
  if (v.kind === 'hero05icompare' || v.kind === 'hero05isingle')
    return <Hero05ICompare clip={v.clip ?? 'Idle_Loop'} frozen={!v.clip} />
  if (v.kind === 'lod') return <ReviewLOD />
  if (v.kind === 'herolod') return <HeroLOD />
  if (v.kind === 'hero05glod') return <Hero05GLOD />
  if (v.kind === 'hero05hlod') return <Hero05HLOD />
  // 05H comparison views: 05G hero + 05H authored-base hero, same clip/time/scale/lighting.
  if (v.kind === 'hero05hcompare' || v.kind === 'hero05hsingle')
    return <Hero05HCompare clip={v.clip ?? 'Idle_Loop'} frozen={!v.clip} />
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
useGLTF.preload(HERO_05H_URL);
[1, 2].forEach((n) => useGLTF.preload(hero05hLodUrl(n as 1 | 2)))
useGLTF.preload(HERO_05I_URL);
[1, 2].forEach((n) => useGLTF.preload(hero05iLodUrl(n as 1 | 2)))
// Preload the mgmt sprite so it is cache-warm before SpriteWorker renders — otherwise the drei loading
// manager (useProgress in StatsCollector) fires a progress update during SpriteWorker's render (a benign
// but real React "setState during render" console warning). Warming it here keeps the review console-clean.
useTexture.preload(SPRITE_URL)
