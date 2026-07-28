// Asset Lab 02 — bespoke greybox geometry for the studio district (contract §4).
// Simple original geometry + the art-directed material family (no protected designs/logos).
// Everything is grounded at local y=0 and placed by the scene via position/rotationY.
import { useMemo } from 'react'
import * as THREE from 'three'
import { M, signMaterial, PALETTE } from '../lab/materials'

type V3 = [number, number, number]
const R = ([x, y, z]: V3, r = 0): { position: V3; rotation: [number, number, number] } => ({ position: [x, y, z], rotation: [0, r, 0] })

/** box helper */
function B({ size, pos = [0, 0, 0], mat, rotY = 0, cast = true, recv = true }:
  { size: V3; pos?: V3; mat: THREE.Material; rotY?: number; cast?: boolean; recv?: boolean }): JSX.Element {
  return (
    <mesh position={pos} rotation={[0, rotY, 0]} castShadow={cast} receiveShadow={recv} material={mat}>
      <boxGeometry args={size} />
    </mesh>
  )
}
function Cyl({ r = 0.2, h = 1, pos = [0, 0, 0], mat, seg = 16, rot = [0, 0, 0], cast = true }:
  { r?: number; h?: number; pos?: V3; mat: THREE.Material; seg?: number; rot?: [number, number, number]; cast?: boolean }): JSX.Element {
  return (
    <mesh position={pos} rotation={rot} castShadow={cast} receiveShadow material={mat}>
      <cylinderGeometry args={[r, r, h, seg]} />
    </mesh>
  )
}

// ---------------------------------------------------------------- ground / paving
export function LotGround({ size = 120 }: { size?: number }): JSX.Element {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow material={M.foliage}>
        <planeGeometry args={[size, size]} />
      </mesh>
    </group>
  )
}
export function Paving({ size = [40, 30], pos = [0, 0, 0] }: { size?: [number, number]; pos?: V3 }): JSX.Element {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pos[0], pos[1] + 0.005, pos[2]]} receiveShadow material={M.concrete}>
      <planeGeometry args={size} />
    </mesh>
  )
}
export function Road({ from, to, width = 6 }: { from: V3; to: V3; width?: number }): JSX.Element {
  const dx = to[0] - from[0], dz = to[2] - from[2]
  const len = Math.hypot(dx, dz)
  const ang = Math.atan2(dx, dz)
  const cx = (from[0] + to[0]) / 2, cz = (from[2] + to[2]) / 2
  return (
    <group>
      <mesh position={[cx, 0.01, cz]} rotation={[-Math.PI / 2, 0, -ang]} receiveShadow material={M.asphalt}>
        <planeGeometry args={[width, len]} />
      </mesh>
    </group>
  )
}
export function Sidewalk({ size = [3, 8], pos = [0, 0, 0], rotY = 0 }: { size?: [number, number]; pos?: V3; rotY?: number }): JSX.Element {
  return <B size={[size[0], 0.12, size[1]]} pos={[pos[0], 0.06, pos[2]]} rotY={rotY} mat={M.sidewalk} />
}

// ---------------------------------------------------------------- soundstage (hero mass)
export function Soundstage({ pos = [0, 0, 0], rotY = 0, w = 26, d = 18, h = 12, number = '1' }:
  { pos?: V3; rotY?: number; w?: number; d?: number; h?: number; number?: string }): JSX.Element {
  const doorMat = useMemo(() => M.soundstageDoor, [])
  const stageSign = useMemo(() => signMaterial('STAGE ' + number, { bg: PALETTE.signDark, fg: PALETTE.signCream, w: 512, h: 512, font: '700 300px ui-sans-serif, sans-serif' }), [number])
  const nameSign = useMemo(() => signMaterial('SOUND STAGE', { bg: PALETTE.accentTerracotta, fg: PALETTE.signCream, w: 1024, h: 200 }), [])
  return (
    <group {...R(pos, rotY)}>
      {/* main hall */}
      <B size={[w, h, d]} pos={[0, h / 2, 0]} mat={M.soundstage} />
      {/* barrel roof (classic soundstage arch) */}
      <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={M.roofFelt}>
        <cylinderGeometry args={[d / 2, d / 2, w, 24, 1, false, 0, Math.PI]} />
      </mesh>
      {/* big sliding loading door with ribs */}
      <B size={[8.4, 8.4, 0.3]} pos={[-w / 4, 4.3, d / 2 + 0.02]} mat={doorMat} recv={false} />
      {[...Array(6)].map((_, i) => <B key={i} size={[0.14, 8, 0.14]} pos={[-w / 4 - 3.5 + i * 1.4, 4.3, d / 2 + 0.2]} mat={M.darkMetal} cast={false} recv={false} />)}
      {/* personnel door */}
      <B size={[1.2, 2.4, 0.2]} pos={[w / 4, 1.2, d / 2 + 0.02]} mat={doorMat} recv={false} />
      {/* STAGE number plaque + name band */}
      <mesh position={[w / 4, 6.4, d / 2 + 0.12]} material={stageSign} castShadow>
        <boxGeometry args={[2.4, 2.4, 0.15]} />
      </mesh>
      <mesh position={[-w / 4, 9.6, d / 2 + 0.12]} material={nameSign} castShadow>
        <boxGeometry args={[9, 1.6, 0.15]} />
      </mesh>
      {/* rooftop vents + HVAC */}
      {[-6, 0, 6].map((x) => <B key={x} size={[2.2, 1.4, 2.2]} pos={[x, h + 2.2, -2]} mat={M.darkMetal} />)}
      <Cyl r={0.5} h={2.2} pos={[8, h + 2.6, 4]} mat={M.darkMetal} />
    </group>
  )
}

// ---------------------------------------------------------------- production office (identity, medium-rise)
export function ProductionOffice({ pos = [0, 0, 0], rotY = 0, name = 'ADMINISTRATION' }:
  { pos?: V3; rotY?: number; name?: string }): JSX.Element {
  const sign = useMemo(() => signMaterial(name, { bg: PALETTE.signDark, fg: PALETTE.signGold, w: 1024, h: 200 }), [name])
  const w = 12, d = 9, h = 7
  return (
    <group {...R(pos, rotY)}>
      <B size={[w, h, d]} pos={[0, h / 2, 0]} mat={M.wallCream} />
      {/* parapet roofline */}
      <B size={[w + 0.6, 0.6, d + 0.6]} pos={[0, h + 0.3, 0]} mat={M.wallWarm} />
      {/* two window bands */}
      {[2.4, 4.9].map((y) => [...Array(4)].map((_, i) =>
        <B key={y + '-' + i} size={[1.6, 1.2, 0.15]} pos={[-4.2 + i * 2.8, y, d / 2 + 0.02]} mat={M.glass} cast={false} recv={false} />))}
      {/* entrance canopy + door + steps */}
      <B size={[4, 0.3, 2.2]} pos={[0, 3, d / 2 + 1]} mat={M.accent} />
      <Cyl r={0.12} h={3} pos={[-1.6, 1.5, d / 2 + 1.9]} mat={M.brass} />
      <Cyl r={0.12} h={3} pos={[1.6, 1.5, d / 2 + 1.9]} mat={M.brass} />
      <B size={[2, 2.6, 0.2]} pos={[0, 1.3, d / 2 + 0.05]} mat={M.accent} />
      <B size={[3.4, 0.2, 1.4]} pos={[0, 0.1, d / 2 + 0.9]} mat={M.concrete} />
      {/* name sign over the door */}
      <mesh position={[0, 3.5, d / 2 + 0.12]} material={sign} castShadow>
        <boxGeometry args={[7, 1.1, 0.14]} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------- entrance gate + guard booth + barrier
export function EntranceGate({ pos = [0, 0, 0], rotY = 0, studio = 'MERIDIAN', sub = 'PICTURES' }:
  { pos?: V3; rotY?: number; studio?: string; sub?: string }): JSX.Element {
  const sign = useMemo(() => signMaterial(studio, { bg: PALETTE.signDark, fg: PALETTE.signGold, w: 1024, h: 320, sub, font: '700 150px Georgia, ui-serif, serif' }), [studio, sub])
  return (
    <group {...R(pos, rotY)}>
      {/* two piers */}
      <B size={[1.2, 4.2, 1.2]} pos={[-4.5, 2.1, 0]} mat={M.wallWarm} />
      <B size={[1.2, 4.2, 1.2]} pos={[4.5, 2.1, 0]} mat={M.wallWarm} />
      <B size={[1.5, 0.4, 1.5]} pos={[-4.5, 4.4, 0]} mat={M.brass} />
      <B size={[1.5, 0.4, 1.5]} pos={[4.5, 4.4, 0]} mat={M.brass} />
      {/* sign beam across */}
      <B size={[8.4, 0.5, 0.6]} pos={[0, 5, 0]} mat={M.darkMetal} />
      <mesh position={[0, 5.9, 0.05]} material={sign} castShadow>
        <boxGeometry args={[6.5, 2, 0.2]} />
      </mesh>
    </group>
  )
}
export function GuardBooth({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      <B size={[2.2, 2.6, 2.2]} pos={[0, 1.3, 0]} mat={M.wallCream} />
      <B size={[1.4, 1, 0.12]} pos={[0, 1.7, 1.11]} mat={M.glass} cast={false} />
      <B size={[3, 0.2, 3]} pos={[0, 2.8, 0]} mat={M.accent} />
      {/* boom barrier */}
      <Cyl r={0.15} h={1} pos={[1.6, 0.5, 0]} mat={M.darkMetal} />
      <mesh position={[4, 1.05, 0]} castShadow material={M.curbPaint}>
        <boxGeometry args={[5, 0.16, 0.16]} />
      </mesh>
    </group>
  )
}

/** Iconic studio water tower — the memorable silhouette (contract §4). */
export function WaterTower({ pos = [0, 0, 0], label = 'MERIDIAN' }: { pos?: V3; label?: string }): JSX.Element {
  const band = useMemo(() => signMaterial(label, { bg: PALETTE.accentTerracotta, fg: PALETTE.signCream, w: 1024, h: 256, font: '700 150px ui-sans-serif, sans-serif' }), [label])
  return (
    <group position={pos}>
      {/* splayed legs */}
      <group>
        <mesh position={[1.4, 5, 1.4]} rotation={[0.14, 0, -0.14]} castShadow material={M.darkMetal}><cylinderGeometry args={[0.12, 0.16, 10.3, 8]} /></mesh>
        <mesh position={[-1.4, 5, 1.4]} rotation={[0.14, 0, 0.14]} castShadow material={M.darkMetal}><cylinderGeometry args={[0.12, 0.16, 10.3, 8]} /></mesh>
        <mesh position={[1.4, 5, -1.4]} rotation={[-0.14, 0, -0.14]} castShadow material={M.darkMetal}><cylinderGeometry args={[0.12, 0.16, 10.3, 8]} /></mesh>
        <mesh position={[-1.4, 5, -1.4]} rotation={[-0.14, 0, 0.14]} castShadow material={M.darkMetal}><cylinderGeometry args={[0.12, 0.16, 10.3, 8]} /></mesh>
      </group>
      {/* cross-braces */}
      <B size={[3.4, 0.1, 0.1]} pos={[0, 3.5, 1.3]} mat={M.darkMetal} cast={false} />
      <B size={[3.4, 0.1, 0.1]} pos={[0, 6.5, 1.3]} mat={M.darkMetal} cast={false} />
      {/* tank */}
      <Cyl r={2.2} h={3.2} pos={[0, 11.6, 0]} mat={M.wallWarm} seg={20} />
      {/* label band */}
      <mesh position={[0, 11.6, 0]} material={band} castShadow>
        <cylinderGeometry args={[2.24, 2.24, 1.6, 20, 1, true]} />
      </mesh>
      {/* conical roof + finial */}
      <mesh position={[0, 13.7, 0]} castShadow material={M.accent}><coneGeometry args={[2.4, 1.6, 20]} /></mesh>
      <Cyl r={0.06} h={0.9} pos={[0, 14.9, 0]} mat={M.darkMetal} />
    </group>
  )
}

// ---------------------------------------------------------------- production dressing
export function Crate({ pos = [0, 0, 0], s = 1, rotY = 0, mat = M.crate }: { pos?: V3; s?: number; rotY?: number; mat?: THREE.Material }): JSX.Element {
  return <B size={[s, s, s]} pos={[pos[0], pos[1] + s / 2, pos[2]]} rotY={rotY} mat={mat} />
}
export function CrateStack({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      <Crate pos={[0, 0, 0]} s={1.1} />
      <Crate pos={[1.2, 0, 0.1]} s={0.9} rotY={0.3} />
      <Crate pos={[0.1, 1.1, 0]} s={0.9} rotY={0.15} mat={M.tarp} />
    </group>
  )
}
export function Cart({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      <B size={[1.6, 0.7, 0.9]} pos={[0, 0.75, 0]} mat={M.darkMetal} />
      <B size={[1.4, 0.5, 0.7]} pos={[0, 1.3, 0]} mat={M.crate} />
      <Cyl r={0.22} h={0.14} pos={[-0.6, 0.22, 0.5]} mat={M.darkMetal} rot={[Math.PI / 2, 0, 0]} seg={12} />
      <Cyl r={0.22} h={0.14} pos={[0.6, 0.22, 0.5]} mat={M.darkMetal} rot={[Math.PI / 2, 0, 0]} seg={12} />
      <Cyl r={0.22} h={0.14} pos={[-0.6, 0.22, -0.5]} mat={M.darkMetal} rot={[Math.PI / 2, 0, 0]} seg={12} />
      <Cyl r={0.22} h={0.14} pos={[0.6, 0.22, -0.5]} mat={M.darkMetal} rot={[Math.PI / 2, 0, 0]} seg={12} />
    </group>
  )
}
export function FilmLight({ pos = [0, 0, 0], rotY = 0, on = true }: { pos?: V3; rotY?: number; on?: boolean }): JSX.Element {
  const lens = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff2d0', emissive: new THREE.Color(on ? '#ffcf87' : '#20201c'), emissiveIntensity: on ? 1.4 : 0, roughness: 0.4 }), [on])
  return (
    <group {...R(pos, rotY)}>
      <Cyl r={0.05} h={0.02} pos={[0, 0.02, 0]} mat={M.darkMetal} />
      {[[0.5, 0.4], [-0.5, 0.4], [0, -0.6]].map(([x, z], i) =>
        <mesh key={i} position={[x / 2, 1, z / 2]} rotation={[z * 0.5, 0, -x * 0.5]} castShadow material={M.darkMetal}><cylinderGeometry args={[0.04, 0.04, 2.2, 6]} /></mesh>)}
      <Cyl r={0.06} h={0.8} pos={[0, 2.1, 0]} mat={M.darkMetal} />
      <B size={[0.7, 0.55, 0.5]} pos={[0, 2.4, 0.05]} rotY={0} mat={M.darkMetal} />
      <mesh position={[0, 2.4, 0.32]} material={lens}><cylinderGeometry args={[0.22, 0.22, 0.06, 16]} /></mesh>
    </group>
  )
}
export function Bench({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      <B size={[2, 0.1, 0.5]} pos={[0, 0.45, 0]} mat={M.trunk} />
      <B size={[2, 0.5, 0.1]} pos={[0, 0.7, -0.2]} mat={M.trunk} />
      <B size={[0.1, 0.45, 0.5]} pos={[-0.9, 0.22, 0]} mat={M.darkMetal} />
      <B size={[0.1, 0.45, 0.5]} pos={[0.9, 0.22, 0]} mat={M.darkMetal} />
    </group>
  )
}
export function ProductionTruck({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const logo = useMemo(() => signMaterial('MERIDIAN', { bg: PALETTE.wallCream, fg: PALETTE.accentTerracotta, w: 1024, h: 512, font: '700 160px ui-sans-serif, sans-serif' }), [])
  return (
    <group {...R(pos, rotY)}>
      <B size={[3.4, 2.2, 2.2]} pos={[0, 1.7, 0]} mat={M.wallCream} />
      <mesh position={[0, 1.7, 1.12]} material={logo} castShadow><boxGeometry args={[2.8, 1.6, 0.05]} /></mesh>
      <B size={[1.4, 1.5, 2.1]} pos={[2.2, 1.1, 0]} mat={M.accent} />
      <B size={[1.2, 0.6, 1.9]} pos={[2.3, 1.7, 0]} mat={M.glass} cast={false} />
      {[[1.4, 1], [1.4, -1], [-1.2, 1], [-1.2, -1]].map(([x, z], i) =>
        <Cyl key={i} r={0.42} h={0.3} pos={[x, 0.42, z]} mat={M.darkMetal} rot={[Math.PI / 2, 0, 0]} seg={14} />)}
    </group>
  )
}
export function Tree({ pos = [0, 0, 0], s = 1 }: { pos?: V3; s?: number }): JSX.Element {
  return (
    <group position={pos} scale={s}>
      <Cyl r={0.16} h={1.6} pos={[0, 0.8, 0]} mat={M.trunk} seg={7} />
      <mesh position={[0, 2, 0]} castShadow material={M.foliage}><icosahedronGeometry args={[1, 0]} /></mesh>
      <mesh position={[0.5, 2.6, 0.2]} castShadow material={M.foliageLight}><icosahedronGeometry args={[0.7, 0]} /></mesh>
      <mesh position={[-0.4, 2.5, -0.3]} castShadow material={M.foliage}><icosahedronGeometry args={[0.6, 0]} /></mesh>
    </group>
  )
}
export function Planter({ pos = [0, 0, 0] }: { pos?: V3 }): JSX.Element {
  return (
    <group position={pos}>
      <B size={[1.2, 0.6, 1.2]} pos={[0, 0.3, 0]} mat={M.wallWarm} />
      <mesh position={[0, 0.9, 0]} castShadow material={M.foliageLight}><icosahedronGeometry args={[0.55, 0]} /></mesh>
    </group>
  )
}

// ---------------------------------------------------------------- backlot suggestion
export function BacklotFacade({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const store = useMemo(() => signMaterial('CAFE', { bg: PALETTE.accentTerracotta, fg: PALETTE.signCream, w: 512, h: 256, font: '700 150px Georgia, serif' }), [])
  return (
    <group {...R(pos, rotY)}>
      {/* painted storefront flat */}
      <B size={[8, 5, 0.3]} pos={[0, 2.5, 0]} mat={M.wallWarm} />
      <B size={[8.4, 0.5, 0.5]} pos={[0, 5.2, 0.1]} mat={M.accent} />
      <mesh position={[0, 3.8, 0.18]} material={store} castShadow><boxGeometry args={[2.6, 1, 0.1]} /></mesh>
      {[-2.4, 2.4].map((x) => <B key={x} size={[1.6, 1.8, 0.1]} pos={[x, 1.6, 0.18]} mat={M.glass} cast={false} />)}
      <B size={[1.4, 2.4, 0.1]} pos={[0, 1.2, 0.18]} mat={M.trunk} />
      {/* wooden braces behind (reveals it's a flat) */}
      <mesh position={[-2.5, 2, -0.9]} rotation={[0.5, 0, 0]} castShadow material={M.trunk}><boxGeometry args={[0.14, 5, 0.14]} /></mesh>
      <mesh position={[2.5, 2, -0.9]} rotation={[0.5, 0, 0]} castShadow material={M.trunk}><boxGeometry args={[0.14, 5, 0.14]} /></mesh>
    </group>
  )
}
export function SceneryFlat({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      <B size={[5, 3.5, 0.15]} pos={[0, 1.75, 0]} mat={M.wallCream} />
      <mesh position={[0, 1.6, -0.6]} rotation={[0.55, 0, 0]} castShadow material={M.trunk}><boxGeometry args={[0.12, 3.6, 0.12]} /></mesh>
    </group>
  )
}
export function Banner({ pos = [0, 0, 0], rotY = 0, text = 'NOW FILMING', bg = PALETTE.accentTerracotta }: { pos?: V3; rotY?: number; text?: string; bg?: string }): JSX.Element {
  const mat = useMemo(() => signMaterial(text, { bg, fg: PALETTE.signCream, w: 1024, h: 256, font: '700 130px ui-sans-serif, sans-serif' }), [text, bg])
  return (
    <group {...R(pos, rotY)}>
      <Cyl r={0.06} h={3.4} pos={[-1.6, 1.7, 0]} mat={M.darkMetal} />
      <Cyl r={0.06} h={3.4} pos={[1.6, 1.7, 0]} mat={M.darkMetal} />
      <mesh position={[0, 2.6, 0]} material={mat} castShadow><boxGeometry args={[3, 0.9, 0.05]} /></mesh>
    </group>
  )
}
export function StagingMark({ pos = [0, 0, 0] }: { pos?: V3 }): JSX.Element {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pos[0], pos[1] + 0.02, pos[2]]} receiveShadow material={M.curbPaint}>
      <ringGeometry args={[2.6, 2.9, 40]} />
    </mesh>
  )
}
