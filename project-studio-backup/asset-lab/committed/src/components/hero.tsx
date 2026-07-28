// Asset Lab 03 — HERO soundstage + its immediate production apron (isolated Scene E).
//
// This is ONE building + its apron at production fidelity. It is SELF-CONTAINED: it uses the
// new hero material family (src/lab/heroMaterials.ts) and does NOT touch the Lab 02 greybox
// (src/components/greybox.tsx) or the shared Lab 02 materials — Scene D stays the byte-identical
// greybox baseline for side-by-side comparison. Same "STAGE 1 / MERIDIAN / SOUND STAGE"
// identity, same warm golden-hour rig; the delta is silhouette articulation + procedural PBR +
// grounded contact shadows + an active grip/electric apron. All deterministic — no Math.random.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { HM, HERO, practical, signMaterial, hazardTexture, markTexture } from '../lab/heroMaterials'

type V3 = [number, number, number]
const R = ([x, y, z]: V3, r = 0): { position: V3; rotation: [number, number, number] } => ({ position: [x, y, z], rotation: [0, r, 0] })

function B({ size, pos = [0, 0, 0], mat, rotY = 0, cast = true, recv = true }:
  { size: V3; pos?: V3; mat: THREE.Material; rotY?: number; cast?: boolean; recv?: boolean }): JSX.Element {
  return (
    <mesh position={pos} rotation={[0, rotY, 0]} castShadow={cast} receiveShadow={recv} material={mat}>
      <boxGeometry args={size} />
    </mesh>
  )
}
function Cyl({ r = 0.2, h = 1, pos = [0, 0, 0], mat, seg = 12, rot = [0, 0, 0], cast = true }:
  { r?: number; h?: number; pos?: V3; mat: THREE.Material; seg?: number; rot?: [number, number, number]; cast?: boolean }): JSX.Element {
  return (
    <mesh position={pos} rotation={rot} castShadow={cast} receiveShadow material={mat}>
      <cylinderGeometry args={[r, r, h, seg]} />
    </mesh>
  )
}
/** A thin ground decal plane above the apron paving (avoids z-fight; polygonOffset for software). */
function Decal({ size, pos, rotY = 0, tex, color, opacity = 1 }:
  { size: [number, number]; pos: V3; rotY?: number; tex?: THREE.Texture; color?: string; opacity?: number }): JSX.Element {
  return (
    <mesh rotation={[-Math.PI / 2, 0, rotY]} position={pos} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial map={tex} color={color} transparent opacity={opacity} roughness={0.95} metalness={0}
        polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} depthWrite={false} />
    </mesh>
  )
}

// ============================================================================ HERO SOUNDSTAGE
export function HeroSoundstage({ pos = [0, 0, 0], rotY = 0, w = 22, d = 18, h = 12, number = '1' }:
  { pos?: V3; rotY?: number; w?: number; d?: number; h?: number; number?: string }): JSX.Element {
  const stageSign = useMemo(() => signMaterial('STAGE ' + number, { bg: HERO.darkMetal, fg: '#efe4cc', w: 1024, h: 512, font: '700 230px ui-sans-serif, sans-serif' }), [number])
  const nameSign = useMemo(() => signMaterial('SOUND STAGE', { bg: '#b45f3c', fg: '#efe4cc', w: 1024, h: 200 }), [])
  const bigNum = useMemo(() => signMaterial(number, { bg: '#8f8a7c', fg: '#efe4cc', w: 512, h: 512, font: '800 400px ui-sans-serif, sans-serif' }), [number])
  const meridian = useMemo(() => signMaterial('MERIDIAN PICTURES', { bg: HERO.darkMetal, fg: '#c9a24a', w: 1280, h: 220, font: '700 108px Georgia, serif' }), [])
  const keepOut = useMemo(() => signMaterial('KEEP OUT', { bg: '#241f1a', fg: '#d1622a', w: 512, h: 220, sub: 'WHEN FLASHING' }), [])
  const loading = useMemo(() => signMaterial('LOADING', { bg: '#241f1a', fg: '#d8b14a', w: 1024, h: 200, font: '700 118px ui-sans-serif, sans-serif' }), [])
  const redEyeOn = useMemo(() => practical('#3a0a06', HERO.redEye, 1.6, true), [])
  const workLight = useMemo(() => practical('#2a2620', '#ffd9a0', 1.1, true), [])

  const roofR = d / 2
  const doorCx = -3.5          // elephant door centred left-of-centre (front/left hero quadrant)
  const openW = 6, openH = 6.6, reveal = 0.45
  const zf = d / 2             // front wall plane (doors face +z)

  return (
    <group {...R(pos, rotY)}>
      {/* ---------- main hall (corrugated painted-steel box) ---------- */}
      <B size={[w, h, d]} pos={[0, h / 2, 0]} mat={HM.wall} />
      {/* plinth / water-table band grounding the wall */}
      <B size={[w + 0.3, 1.2, d + 0.3]} pos={[0, 0.6, 0]} mat={HM.pilaster} />

      {/* ---------- parapet ring (squares off the roofline; roof rises behind) ---------- */}
      {[[0, zf, w + 0.2, 0.4], [0, -zf, w + 0.2, 0.4], [w / 2, 0, 0.4, d], [-w / 2, 0, 0.4, d]].map(([x, z, sx, sz], i) =>
        <B key={i} size={[sx, 1.0, sz]} pos={[x, h + 0.5, z]} mat={HM.wall} />)}
      {/* cornice cap oversailing the parapet — the bright top-edge line that reads "architected" */}
      {[[0, zf + 0.1, w + 0.7, 0.5], [0, -zf - 0.1, w + 0.7, 0.5], [w / 2 + 0.1, 0, 0.5, d + 0.6], [-w / 2 - 0.1, 0, 0.5, d + 0.6]].map(([x, z, sx, sz], i) =>
        <B key={i} size={[sx, 0.3, sz]} pos={[x, h + 1.05, z]} mat={HM.cornice} />)}

      {/* ---------- barrel roof (metal, ribbed) rising behind the parapet ---------- */}
      <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={HM.roof}>
        <cylinderGeometry args={[roofR, roofR, w, 40, 1, false, 0, Math.PI]} />
      </mesh>
      {/* ridge monitor / clerestory ventilator along the crown (breaks the "toy tube" arc) */}
      <group position={[0, h + roofR - 0.2, 0]}>
        <B size={[14, 1.2, 1.7]} pos={[0, 0.6, 0]} mat={HM.galv} />
        <B size={[14.4, 0.28, 2.1]} pos={[0, 1.25, 0]} mat={HM.darkMetal} />
        {/* louver slats on the long sides */}
        {[...Array(13)].map((_, i) => <B key={'a' + i} size={[0.9, 0.75, 0.06]} pos={[-6 + i, 0.55, 0.87]} mat={HM.darkMetal} cast={false} />)}
        {[...Array(13)].map((_, i) => <B key={'b' + i} size={[0.9, 0.75, 0.06]} pos={[-6 + i, 0.55, -0.87]} mat={HM.darkMetal} cast={false} />)}
      </group>
      {/* rooftop HVAC air-handler peeking over the parapet */}
      <group position={[6, h + 0.6, -4]}>
        <B size={[3, 0.3, 2.4]} pos={[0, 0.15, 0]} mat={HM.darkMetal} />
        <B size={[2.8, 1.7, 2.2]} pos={[0, 1.1, 0]} mat={HM.galv} />
        <mesh position={[0, 2.0, 0]} material={HM.darkMetal} castShadow><cylinderGeometry args={[0.55, 0.55, 0.25, 16]} /></mesh>
        {[[1.2, 0.9], [-1.2, 0.9], [1.2, -0.9], [-1.2, -0.9]].map(([x, z], i) =>
          <Cyl key={i} r={0.12} h={0.3} pos={[x, 0.15, z]} mat={HM.darkMetal} />)}
      </group>

      {/* ---------- front facade: recessed elephant door with man-door ---------- */}
      {/* dark recess backing (interior darkness read) */}
      <B size={[openW + 0.4, openH + 0.3, 0.2]} pos={[doorCx, openH / 2, zf - reveal - 0.1]} mat={HM.glassDark} recv={false} />
      {/* reveal jambs (thick-wall read) + header + sill */}
      <B size={[0.5, openH + 0.6, reveal + 0.2]} pos={[doorCx - openW / 2 - 0.25, (openH + 0.6) / 2, zf - reveal / 2]} mat={HM.pilaster} />
      <B size={[0.5, openH + 0.6, reveal + 0.2]} pos={[doorCx + openW / 2 + 0.25, (openH + 0.6) / 2, zf - reveal / 2]} mat={HM.pilaster} />
      {/* header / track box carrying the top guide rail */}
      <B size={[openW + 1.4, 0.7, 0.6]} pos={[doorCx, openH + 0.35, zf + 0.06]} mat={HM.header} />
      <mesh position={[doorCx, openH + 0.75, zf + 0.28]} rotation={[0, 0, Math.PI / 2]} material={HM.darkMetal} castShadow>
        <cylinderGeometry args={[0.05, 0.05, openW + 1.2, 8]} /></mesh>
      {/* two biparting leaves, slightly open (~0.5 gap) so the recess reads */}
      {[-1, 1].map((s) => {
        const leafW = (openW - 0.5) / 2
        const cx = doorCx + s * (0.25 + leafW / 2)
        return (
          <group key={s} position={[cx, openH / 2, zf - reveal + 0.08]}>
            <B size={[leafW, openH, 0.16]} pos={[0, 0, 0]} mat={HM.doorLeaf} recv={false} />
            {/* vertical rib battens */}
            {[...Array(4)].map((_, i) => <B key={i} size={[0.1, openH - 0.3, 0.1]} pos={[-leafW / 2 + 0.3 + i * (leafW - 0.6) / 3, 0, 0.12]} mat={HM.doorRib} cast={false} recv={false} />)}
            {/* trolley hangers to the rail */}
            <B size={[0.14, 0.5, 0.14]} pos={[-0.6, openH / 2 + 0.35, 0.2]} mat={HM.darkMetal} cast={false} />
            <B size={[0.14, 0.5, 0.14]} pos={[0.6, openH / 2 + 0.35, 0.2]} mat={HM.darkMetal} cast={false} />
          </group>
        )
      })}
      {/* man-door (wicket) cut into the LEFT leaf */}
      <group position={[doorCx - 1.5, 0, zf - reveal + 0.2]}>
        <B size={[1.0, 2.3, 0.06]} pos={[0, 1.15, 0]} mat={HM.doorRib} recv={false} />
        <B size={[0.9, 2.1, 0.05]} pos={[0, 1.1, 0.04]} mat={HM.galv} recv={false} cast={false} />
        <Cyl r={0.04} h={0.28} pos={[0.32, 1.05, 0.09]} mat={HM.brass} rot={[Math.PI / 2, 0, 0]} cast={false} />
      </group>
      {/* worn threshold grime band across the opening */}
      <Decal size={[openW + 0.6, 2.2]} pos={[doorCx, 0.02, zf + 0.6]} color={'#4c463c'} opacity={0.7} />

      {/* ---------- signage ---------- */}
      {/* big painted stage number high on the parapet, front-left */}
      <mesh position={[doorCx, h + 0.5, zf + 0.32]} material={bigNum}><boxGeometry args={[3.4, 3.4, 0.06]} /></mesh>
      {/* MERIDIAN PICTURES (studio identity — top of the hierarchy) over SOUND STAGE (facility) */}
      <mesh position={[7, 9.5, zf + 0.12]} material={meridian} castShadow><boxGeometry args={[10, 1.7, 0.14]} /></mesh>
      <mesh position={[7, 7.75, zf + 0.12]} material={nameSign} castShadow><boxGeometry args={[7.2, 1.05, 0.12]} /></mesh>
      {/* STAGE 1 plaque — LEFT of the door to balance the right-side SOUND STAGE / MERIDIAN block */}
      <mesh position={[-9, 4.3, zf + 0.12]} material={stageSign} castShadow><boxGeometry args={[2.7, 1.35, 0.14]} /></mesh>

      {/* ---------- red-eye stage warning light ---------- */}
      <group position={[doorCx + openW / 2 + 1.1, 3.4, zf + 0.15]}>
        <B size={[0.4, 0.4, 0.4]} pos={[0, 0, 0]} mat={HM.darkMetal} />
        <mesh position={[0, 0, 0.28]} material={redEyeOn}><sphereGeometry args={[0.16, 16, 16]} /></mesh>
        <Cyl r={0.03} h={0.7} pos={[0, 0.5, -0.1]} mat={HM.darkMetal} />        {/* gooseneck conduit stub */}
        <mesh position={[0, -0.55, 0.05]} material={keepOut} castShadow><boxGeometry args={[0.7, 0.32, 0.05]} /></mesh>
      </group>
      {/* stage-entrance work light over the man-door */}
      <group position={[doorCx - 1.5, 2.6, zf + 0.35]}>
        <Cyl r={0.03} h={0.5} pos={[0, 0, -0.15]} mat={HM.darkMetal} rot={[Math.PI / 2.6, 0, 0]} />
        <B size={[0.4, 0.22, 0.3]} pos={[0, 0.12, 0.18]} mat={HM.darkMetal} />
        <mesh position={[0, 0.06, 0.34]} material={workLight}><cylinderGeometry args={[0.13, 0.13, 0.05, 14]} /></mesh>
      </group>

      {/* ---------- exterior services: conduit + downspouts + junction box ---------- */}
      {[-w / 2 + 0.3, w / 2 - 0.3].map((x) => (
        <group key={x}>
          <Cyl r={0.09} h={h} pos={[x, h / 2, zf + 0.12]} mat={HM.galv} seg={8} cast={false} />
          <B size={[0.4, 0.3, 0.4]} pos={[x, 0.15, zf + 0.2]} mat={HM.pilaster} />   {/* splash block */}
        </group>
      ))}
      {/* horizontal power conduit run + junction box near the door */}
      <mesh position={[doorCx + 4.5, 4.2, zf + 0.14]} rotation={[0, 0, Math.PI / 2]} material={HM.galv} castShadow><cylinderGeometry args={[0.05, 0.05, 7, 8]} /></mesh>
      <B size={[0.45, 0.6, 0.24]} pos={[doorCx + openW / 2 + 1.1, 1.5, zf + 0.16]} mat={HM.darkMetal} />
      <Cyl r={0.04} h={2.6} pos={[doorCx + openW / 2 + 1.1, 3.0, zf + 0.14]} mat={HM.galv} seg={8} cast={false} />

      {/* ---------- structural wall rhythm: pilaster buttresses on the long side walls ---------- */}
      {[1, -1].map((s) => [0, 1, 2, 3].map((i) => {
        const z = -d / 2 + 3 + i * ((d - 6) / 3)
        return <B key={s + '-' + i} size={[0.5, h - 0.4, 1.0]} pos={[s * (w / 2 + 0.15), (h - 0.4) / 2, z]} mat={HM.pilaster} />
      }))}
      {/* roof eave drip trim where the barrel springs off the front/back walls */}
      {[zf, -zf].map((z) => <B key={z} size={[w + 0.2, 0.28, 0.4]} pos={[0, h + 0.02, z * 0.985]} mat={HM.darkMetal} cast={false} />)}

      {/* ---------- caged maintenance ladder to the roof (right side, rear) ---------- */}
      <group position={[w / 2 + 0.22, 0, -d / 2 + 2.6]}>
        {[-0.22, 0.22].map((z) => <Cyl key={z} r={0.04} h={h + 0.5} pos={[0, (h + 0.5) / 2, z]} mat={HM.darkMetal} seg={6} />)}
        {[...Array(20)].map((_, i) => <B key={i} size={[0.1, 0.05, 0.5]} pos={[0, 0.7 + i * 0.55, 0]} mat={HM.darkMetal} cast={false} recv={false} />)}
        {[0, 1, 2, 3].map((i) => <mesh key={'c' + i} position={[0.34, 3.6 + i * 1.9, 0]} rotation={[0, Math.PI / 2, 0]} material={HM.darkMetal}><torusGeometry args={[0.36, 0.02, 5, 9, Math.PI]} /></mesh>)}
      </group>

      {/* ---------- exterior gooseneck work lights on the facade (practicals) ---------- */}
      {[[-9.2, 5.4], [10.4, 6.2]].map(([x, y], i) => (
        <group key={i} position={[x, y, zf + 0.12]}>
          <Cyl r={0.03} h={0.5} pos={[0, 0.05, -0.12]} mat={HM.darkMetal} rot={[Math.PI / 2.4, 0, 0]} cast={false} />
          <B size={[0.3, 0.15, 0.24]} pos={[0, 0.14, 0.16]} mat={HM.darkMetal} />
          <mesh position={[0, 0.08, 0.3]} rotation={[Math.PI / 2, 0, 0]} material={workLight}><cylinderGeometry args={[0.1, 0.1, 0.04, 12]} /></mesh>
        </group>
      ))}

      {/* operational LOADING sign over the dock bay (hierarchy level 3) */}
      <mesh position={[8.5, 5.6, zf + 0.12]} material={loading} castShadow><boxGeometry args={[3.8, 0.8, 0.12]} /></mesh>

      {/* ---------- loading dock offset to the right of the elephant door ---------- */}
      <group position={[8, 0, zf + 1.6]}>
        <B size={[6, 1.1, 3]} pos={[0, 0.55, 0]} mat={HM.dock} />
        {/* rubber dock bumpers on the face */}
        {[-2, 0, 2].map((x) => <B key={x} size={[0.4, 0.3, 0.2]} pos={[x, 0.35, 1.55]} mat={HM.rubber} />)}
        {/* switchback steel stair down the right side */}
        {[...Array(5)].map((_, i) => <B key={i} size={[1.3, 0.22, 0.5]} pos={[3.5, 0.1 + i * 0.22, 1.2 - i * 0.5]} mat={HM.darkMetal} />)}
      </group>
    </group>
  )
}

// ============================================================================ APRON PROPS
/** Hero 5K fresnel on a stand: yoke, barn doors, scrim, emissive lens, power cable tail. */
export function HeroFilmLight({ pos = [0, 0, 0], rotY = 0, on = true, height = 2.6 }:
  { pos?: V3; rotY?: number; on?: boolean; height?: number }): JSX.Element {
  const lens = useMemo(() => practical('#fff2d0', '#ffcf87', 1.3, on), [on])
  return (
    <group {...R(pos, rotY)}>
      {/* 3-leg base */}
      {[0, 2.1, 4.2].map((a, i) => <Cyl key={i} r={0.03} h={0.9} pos={[Math.sin(a) * 0.4, 0.06, Math.cos(a) * 0.4]} mat={HM.darkMetal} rot={[0.35 * Math.cos(a), a, 0.35 * Math.sin(a)]} seg={6} />)}
      <Cyl r={0.04} h={height} pos={[0, height / 2, 0]} mat={HM.darkMetal} seg={8} />
      {/* yoke + head */}
      <group position={[0, height + 0.05, 0]}>
        <B size={[0.44, 0.4, 0.46]} pos={[0, 0, 0]} mat={HM.darkMetal} />
        <mesh position={[0, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]} material={lens}><cylinderGeometry args={[0.18, 0.18, 0.06, 16]} /></mesh>
        {/* barn doors (4 angled flaps) */}
        <B size={[0.44, 0.02, 0.22]} pos={[0, 0.24, 0.34]} rotY={0} mat={HM.darkMetal} cast={false} />
        <B size={[0.44, 0.02, 0.22]} pos={[0, -0.24, 0.34]} mat={HM.darkMetal} cast={false} />
        <B size={[0.02, 0.44, 0.22]} pos={[0.24, 0, 0.34]} mat={HM.darkMetal} cast={false} />
        <B size={[0.02, 0.44, 0.22]} pos={[-0.24, 0, 0.34]} mat={HM.darkMetal} cast={false} />
      </group>
    </group>
  )
}

/** C-stand with a flag and a draped sandbag on the leg. */
export function CStand({ pos = [0, 0, 0], rotY = 0, flag = true }: { pos?: V3; rotY?: number; flag?: boolean }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      {[0, 2.1, 4.2].map((a, i) => <Cyl key={i} r={0.02} h={0.9} pos={[Math.sin(a) * 0.35, 0.05, Math.cos(a) * 0.35]} mat={HM.darkMetal} rot={[0.4 * Math.cos(a), a, 0.4 * Math.sin(a)]} seg={6} />)}
      <Cyl r={0.022} h={2.4} pos={[0, 1.2, 0]} mat={HM.darkMetal} seg={6} />
      {flag && <>
        <Cyl r={0.015} h={1.0} pos={[0.5, 2.2, 0]} mat={HM.darkMetal} rot={[0, 0, Math.PI / 2]} seg={6} />
        <B size={[0.62, 0.46, 0.02]} pos={[0.95, 2.2, 0]} mat={HM.rubber} cast />
        <B size={[0.07, 0.07, 0.07]} pos={[0.5, 2.2, 0]} mat={HM.darkMetal} cast={false} />
      </>}
      <Sandbag pos={[0.18, 0, 0.18]} />
    </group>
  )
}

export function Sandbag({ pos = [0, 0, 0], rotY = 0, worn = false }: { pos?: V3; rotY?: number; worn?: boolean }): JSX.Element {
  const m = worn ? HM.sandbagWorn : HM.sandbag
  return (
    <group {...R(pos, rotY)}>
      <B size={[0.22, 0.13, 0.44]} pos={[-0.12, 0.07, 0]} mat={m} />
      <B size={[0.22, 0.13, 0.44]} pos={[0.12, 0.07, 0]} mat={m} />
      <B size={[0.1, 0.09, 0.3]} pos={[0, 0.11, 0]} mat={m} cast={false} />
    </group>
  )
}
export function SandbagPile({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      <Sandbag pos={[0, 0, 0]} />
      <Sandbag pos={[0.28, 0, 0.1]} rotY={0.4} worn />
      <Sandbag pos={[0.14, 0.14, 0.02]} rotY={0.2} />
    </group>
  )
}

/** Apple-box stack (full/half/quarter — grip footprint 0.51 x 0.30). */
export function AppleStack({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      <B size={[0.51, 0.2, 0.3]} pos={[0, 0.1, 0]} mat={HM.crate} />
      <B size={[0.51, 0.1, 0.3]} pos={[0.03, 0.25, 0.02]} mat={HM.crate} rotY={0.12} />
      <B size={[0.51, 0.05, 0.3]} pos={[-0.02, 0.325, -0.02]} mat={HM.crate} rotY={-0.08} />
    </group>
  )
}

/** Distro/lunchbox on legs with Bates outlet stubs. */
export function Distro({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const face = useMemo(() => signMaterial('DISTRO', { bg: HERO.darkMetal, fg: '#d1622a', w: 512, h: 256, font: '700 120px ui-sans-serif, sans-serif' }), [])
  return (
    <group {...R(pos, rotY)}>
      {[[0.18, 0.14], [-0.18, 0.14], [0.18, -0.14], [-0.18, -0.14]].map(([x, z], i) => <Cyl key={i} r={0.02} h={0.55} pos={[x, 0.27, z]} mat={HM.darkMetal} seg={6} />)}
      <B size={[0.46, 0.34, 0.3]} pos={[0, 0.72, 0]} mat={HM.darkMetal} />
      <mesh position={[0, 0.72, 0.16]} material={face}><boxGeometry args={[0.4, 0.26, 0.02]} /></mesh>
      {[-0.12, 0, 0.12].map((x) => <Cyl key={x} r={0.03} h={0.06} pos={[x, 0.58, 0.16]} mat={HM.brass} rot={[Math.PI / 2, 0, 0]} seg={8} cast={false} />)}
    </group>
  )
}

/** A cable as a single tube along a floor-snaking curve (one draw call). */
export function Cable({ points, r = 0.03 }: { points: V3[]; r?: number }): JSX.Element {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), [points])
  return (
    <mesh material={HM.cable} castShadow receiveShadow>
      <tubeGeometry args={[curve, Math.max(12, points.length * 6), r, 6, false]} />
    </mesh>
  )
}

/** Yellow cable-crossover ramp. */
export function CableRamp({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      <B size={[0.92, 0.1, 0.48]} pos={[0, 0.05, 0]} mat={HM.orange} />
      {[-0.3, -0.1, 0.1, 0.3].map((x) => <B key={x} size={[0.04, 0.02, 0.48]} pos={[x, 0.11, 0]} mat={HM.rubber} cast={false} />)}
    </group>
  )
}

/** Towable generator at the apron edge. */
export function Genny({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const badge = useMemo(() => signMaterial('MERIDIAN POWER', { bg: HERO.darkMetal, fg: '#c9a24a', w: 1024, h: 256, font: '700 94px ui-sans-serif, sans-serif' }), [])
  return (
    <group {...R(pos, rotY)}>
      <B size={[2.6, 0.25, 1.5]} pos={[0, 0.5, 0]} mat={HM.darkMetal} />       {/* trailer deck */}
      <B size={[2.4, 1.2, 1.4]} pos={[0, 1.2, 0]} mat={HM.galv} />              {/* body */}
      <mesh position={[0, 1.2, 0.71]} material={badge}><boxGeometry args={[1.8, 0.55, 0.03]} /></mesh>
      {/* louver panel */}
      {[...Array(6)].map((_, i) => <B key={i} size={[0.05, 0.8, 0.6]} pos={[-1.21, 1.2, -0.4 + i * 0.16]} mat={HM.darkMetal} cast={false} />)}
      <Cyl r={0.08} h={0.6} pos={[0.7, 2.1, -0.3]} mat={HM.darkMetal} seg={8} />  {/* exhaust */}
      {[-0.9, 0.9].map((x) => <Cyl key={x} r={0.35} h={0.24} pos={[x, 0.35, 0.8]} mat={HM.rubber} rot={[Math.PI / 2, 0, 0]} seg={14} />)}
      <Cyl r={0.05} h={1.4} pos={[-1.9, 0.55, 0]} mat={HM.darkMetal} rot={[0, 0, Math.PI / 2.2]} seg={8} />  {/* drawbar */}
    </group>
  )
}

/** Flatbed grip cart loaded with road cases. */
export function FlatbedCart({ pos = [0, 0, 0], rotY = 0, loaded = true }: { pos?: V3; rotY?: number; loaded?: boolean }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      <B size={[1.6, 0.12, 0.9]} pos={[0, 0.5, 0]} mat={HM.darkMetal} />
      {[[0.7, 0.38], [0.7, -0.38], [-0.7, 0.38], [-0.7, -0.38]].map(([x, z], i) => <Cyl key={i} r={0.1} h={0.08} pos={[x, 0.1, z]} mat={HM.rubber} rot={[Math.PI / 2, 0, 0]} seg={12} />)}
      <Cyl r={0.02} h={0.6} pos={[0.85, 0.85, 0]} mat={HM.darkMetal} rot={[Math.PI / 2.4, 0, 0]} seg={6} />   {/* push handle */}
      {loaded && <RoadCase pos={[0.1, 0.56, 0]} label="GRIP" />}
      {loaded && <RoadCase pos={[-0.4, 0.56, 0.1]} label="LAMPS" rotY={0.15} h={0.4} />}
    </group>
  )
}
export function RoadCase({ pos = [0, 0, 0], rotY = 0, label = 'GRIP', h = 0.5 }: { pos?: V3; rotY?: number; label?: string; h?: number }): JSX.Element {
  const lid = useMemo(() => signMaterial(label, { bg: '#17161a', fg: '#c9a24a', w: 512, h: 256, font: '700 120px ui-sans-serif, sans-serif' }), [label])
  return (
    <group {...R([pos[0], pos[1] + h / 2, pos[2]], rotY)}>
      <B size={[0.8, h, 0.6]} pos={[0, 0, 0]} mat={HM.cable} />
      <mesh position={[0, h / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} material={lid}><planeGeometry args={[0.7, 0.5]} /></mesh>
      {[[0.4, 0.3], [-0.4, 0.3], [0.4, -0.3], [-0.4, -0.3]].map(([x, z], i) => <B key={i} size={[0.06, h, 0.06]} pos={[x, 0, z]} mat={HM.darkMetal} cast={false} />)}
    </group>
  )
}

export function Cone({ pos = [0, 0, 0] }: { pos?: V3 }): JSX.Element {
  return (
    <group position={pos}>
      <B size={[0.34, 0.03, 0.34]} pos={[0, 0.015, 0]} mat={HM.orange} />
      <mesh position={[0, 0.24, 0]} castShadow material={HM.orange}><coneGeometry args={[0.15, 0.45, 12]} /></mesh>
      <mesh position={[0, 0.28, 0]} material={HM.cornice}><cylinderGeometry args={[0.115, 0.13, 0.06, 12]} /></mesh>
    </group>
  )
}
export function Bollard({ pos = [0, 0, 0] }: { pos?: V3 }): JSX.Element {
  return (
    <group position={pos}>
      <Cyl r={0.1} h={0.9} pos={[0, 0.45, 0]} mat={HM.darkMetal} seg={12} />
      <mesh position={[0, 0.9, 0]} material={HM.orange}><cylinderGeometry args={[0.1, 0.1, 0.12, 12]} /></mesh>
    </group>
  )
}
export function FireExtinguisher({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      <Cyl r={0.09} h={0.5} pos={[0, 0.3, 0]} mat={HM.red} seg={12} />
      <Cyl r={0.03} h={0.12} pos={[0, 0.6, 0]} mat={HM.brass} seg={8} cast={false} />
      <mesh position={[0.08, 0.55, 0.05]} material={HM.rubber}><torusGeometry args={[0.06, 0.02, 6, 12]} /></mesh>
    </group>
  )
}

/** Director's chair + rolling video-village monitor. */
export function VideoVillage({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const back = useMemo(() => signMaterial('DIRECTOR', { bg: HERO.canvasTan, fg: '#efe4cc', w: 512, h: 128, font: '700 64px Georgia, serif' }), [])
  const screen = useMemo(() => practical('#12242c', '#1c4a5c', 0.3, true), [])
  return (
    <group {...R(pos, rotY)}>
      {/* chair */}
      <group position={[0, 0, 0]}>
        {[[-0.25, 0.25], [0.25, 0.25], [-0.25, -0.25], [0.25, -0.25]].map(([x, z], i) => <Cyl key={i} r={0.02} h={0.6} pos={[x, 0.3, z]} mat={HM.trunk} seg={6} />)}
        <B size={[0.55, 0.04, 0.5]} pos={[0, 0.62, 0]} mat={HM.canvasTan} />
        <mesh position={[0, 0.9, -0.24]} material={back}><boxGeometry args={[0.55, 0.28, 0.04]} /></mesh>
      </group>
      {/* monitor on rolling stand */}
      <group position={[0.9, 0, 0.2]}>
        <Cyl r={0.03} h={1.4} pos={[0, 0.7, 0]} mat={HM.darkMetal} seg={8} />
        {[0, 2.1, 4.2].map((a, i) => <Cyl key={i} r={0.015} h={0.4} pos={[Math.sin(a) * 0.25, 0.04, Math.cos(a) * 0.25]} mat={HM.darkMetal} rot={[0.5 * Math.cos(a), a, 0.5 * Math.sin(a)]} seg={6} />)}
        <B size={[0.6, 0.42, 0.05]} pos={[0, 1.45, 0]} mat={HM.darkMetal} />
        <mesh position={[0, 1.45, 0.03]} material={screen}><boxGeometry args={[0.54, 0.36, 0.01]} /></mesh>
      </group>
    </group>
  )
}

/** Short dolly-track section with a dolly platform. */
export function DollyTrack({ pos = [0, 0, 0], rotY = 0, len = 3 }: { pos?: V3; rotY?: number; len?: number }): JSX.Element {
  return (
    <group {...R(pos, rotY)}>
      {[-0.31, 0.31].map((z) => <Cyl key={z} r={0.04} h={len} pos={[0, 0.12, z]} mat={HM.darkMetal} rot={[Math.PI / 2, 0, 0]} seg={10} />)}
      {[...Array(5)].map((_, i) => <B key={i} size={[0.9, 0.08, 0.12]} pos={[-len / 2 + 0.3 + i * (len - 0.6) / 4, 0.04, 0]} mat={HM.trunk} />)}
      <group position={[0.4, 0, 0]}>
        <B size={[0.8, 0.16, 0.7]} pos={[0, 0.28, 0]} mat={HM.darkMetal} />
        {[[0.3, 0.31], [-0.3, 0.31], [0.3, -0.31], [-0.3, -0.31]].map(([x, z], i) => <Cyl key={i} r={0.06} h={0.06} pos={[x, 0.14, z]} mat={HM.brass} rot={[Math.PI / 2, 0, 0]} seg={10} />)}
      </group>
    </group>
  )
}

// ============================================================================ GROUND STORY
export function GroundDecals(): JSX.Element {
  const fireLane = useMemo(() => { const t = hazardTexture('', 256); t.repeat.set(10, 1); return t }, [])
  const chalk1 = useMemo(() => markTexture('1'), [])
  const arrow = useMemo(() => markTexture('▸'), [])
  const lampsBox = useMemo(() => markTexture('LAMPS', '#cfc4ad'), [])
  const gripBox = useMemo(() => markTexture('GRIP', '#cfc4ad'), [])
  const trucks = useMemo(() => markTexture('TRUCKS', '#d8b14a'), [])
  return (
    <group>
      {/* fire-lane along the apron edge (nothing parked on it) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.02, 16]} receiveShadow>
        <planeGeometry args={[20, 0.9]} />
        <meshStandardMaterial map={fireLane} transparent roughness={0.9} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} depthWrite={false} />
      </mesh>
      {/* hazard hatch at the door threshold */}
      <Decal size={[6.5, 2.4]} pos={[-3.5, 0.024, 11]} tex={useMemo(() => { const t = hazardTexture('', 256); t.repeat.set(4, 1); return t }, [])} />
      {/* set-mark tape T's near the dolly track / door */}
      {[[-5.5, 13, '#e4d7a0'], [-2, 12.5, '#b45f3c'], [1, 13.5, '#4a6c8c']].map(([x, z, c], i) => (
        <group key={i}>
          <Decal size={[0.5, 0.08]} pos={[x as number, 0.024, z as number]} color={c as string} />
          <Decal size={[0.08, 0.4]} pos={[x as number, 0.024, z as number]} color={c as string} />
        </group>
      ))}
      {/* chalk stage number + load-in arrow on the concrete beside the door */}
      <Decal size={[0.8, 0.8]} pos={[0.5, 0.024, 11.5]} tex={chalk1} opacity={0.7} />
      <Decal size={[0.9, 0.9]} pos={[1.4, 0.024, 11.6]} tex={arrow} rotY={-Math.PI / 2} opacity={0.6} />
      {/* department staging outline box */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.5, 0.024, 14]} receiveShadow>
        <planeGeometry args={[2.2, 1.6]} />
        <meshStandardMaterial map={lampsBox} transparent opacity={0.7} roughness={0.95} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} depthWrite={false} />
      </mesh>

      {/* --- Iteration 2: ground organization (curb/sidewalk, drainage, loading markings, surface variation) --- */}
      {/* pedestrian sidewalk + curb, right edge — separates foot traffic from the loading apron */}
      <mesh position={[15, 0.09, 14.5]} receiveShadow castShadow material={HM.dock}><boxGeometry args={[2.6, 0.18, 16]} /></mesh>
      <mesh position={[13.55, 0.11, 14.5]} receiveShadow material={HM.pilaster}><boxGeometry args={[0.22, 0.22, 16]} /></mesh>
      {/* GRIP department staging zone (equipment reads organized, not scattered) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.4, 0.024, 12.8]} receiveShadow>
        <planeGeometry args={[2.6, 2.2]} />
        <meshStandardMaterial map={gripBox} transparent opacity={0.65} roughness={0.95} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} depthWrite={false} />
      </mesh>
      {/* trench drain across the apron (drainage read) with light channel edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0.02, 22.6]} receiveShadow material={HM.darkMetal}><planeGeometry args={[27, 0.45]} /></mesh>
      <Decal size={[27, 0.07]} pos={[1, 0.021, 22.36]} color={'#8f897d'} opacity={0.6} />
      <Decal size={[27, 0.07]} pos={[1, 0.021, 22.84]} color={'#8f897d'} opacity={0.6} />
      {/* truck stop line + directional stencil at the dock approach */}
      <Decal size={[7, 0.3]} pos={[8, 0.024, 14.8]} color={'#e4d7a0'} opacity={0.9} />
      <Decal size={[3, 0.9]} pos={[8, 0.026, 17.2]} tex={trucks} opacity={0.85} />
      {/* asphalt patches + tire-scrub marks on the outer drive (breaks the flat asphalt) */}
      {([[-13, 26, 3.6, 2.4], [16, 25, 3, 2]] as const).map(([x, z, sx, sz], i) =>
        <Decal key={'p' + i} size={[sx, sz]} pos={[x, 0.018, z]} color={'#2c2822'} opacity={0.55} />)}
      {([[-2.5, 26, 0.5], [3.5, 27, -0.4]] as const).map(([x, z, r], i) =>
        <Decal key={'t' + i} size={[0.35, 6.5]} pos={[x, 0.02, z]} rotY={r} color={'#201d18'} opacity={0.45} />)}
    </group>
  )
}

// ============================================================================ APRON COMPOSITION
// The immediate production/staging area in front of Stage 1's open elephant doors, dressed as an
// ACTIVE film set. Everything is hand-placed (deterministic); nothing sits on the fire-lane (z≈16.8)
// or blocks the door threshold. Door centre is world x≈-3.5, front wall at world z≈6.
export function ProductionApron(): JSX.Element {
  return (
    <group>
      {/* --- grip/electric: hero lights firing INTO the open doors --- */}
      <HeroFilmLight pos={[-6.5, 0, 11]} rotY={Math.PI - 0.25} height={2.7} />
      <HeroFilmLight pos={[-1, 0, 12.6]} rotY={Math.PI + 0.15} height={2.5} />
      <HeroFilmLight pos={[3.6, 0, 10.2]} rotY={Math.PI * 0.72} height={2.9} on={false} />

      {/* --- C-stands + flags --- */}
      <CStand pos={[-8.4, 0, 13]} rotY={0.5} />
      <CStand pos={[0.8, 0, 14]} rotY={-1.2} />
      <CStand pos={[-4.6, 0, 9.6]} rotY={2.4} flag={false} />

      {/* --- power: genny → distro → lights, with cable ramps at crossings --- */}
      <Genny pos={[-12, 0, 17]} rotY={0.5} />
      <Distro pos={[-8.6, 0, 11.6]} rotY={0.3} />
      <Cable points={[[-11, 0.06, 16.4], [-10, 0.1, 14.5], [-9.2, 0.06, 12.8], [-8.6, 0.06, 11.9]]} r={0.045} />
      <Cable points={[[-8.4, 0.06, 11.4], [-7.4, 0.05, 11.2], [-6.5, 0.06, 11.1]]} />
      <Cable points={[[-8.3, 0.06, 11.8], [-5, 0.05, 12.4], [-2, 0.05, 12.8], [-1, 0.06, 12.5]]} />
      <Cable points={[[-8.2, 0.06, 11.5], [-3, 0.05, 10.6], [1, 0.05, 10.4], [3.6, 0.06, 10.3]]} />
      <CableRamp pos={[-7.2, 0, 14]} rotY={0.3} />
      <CableRamp pos={[1.5, 0, 13.4]} rotY={-0.2} />

      {/* --- set logistics --- */}
      <FlatbedCart pos={[7, 0, 13.2]} rotY={-0.5} />
      <FlatbedCart pos={[-9.6, 0, 12.4]} rotY={0.4} loaded={false} />
      <AppleStack pos={[-4.4, 0, 10.6]} rotY={0.2} />
      <AppleStack pos={[1.7, 0, 9.5]} rotY={-0.5} />
      <RoadCase pos={[-9.6, 0, 13.4]} rotY={0.4} label="DISTRO" />
      <DollyTrack pos={[-1, 0, 15]} rotY={0.08} len={3.4} />
      <VideoVillage pos={[8, 0, 16]} rotY={Math.PI + 0.15} />

      {/* --- safety / site --- */}
      <SandbagPile pos={[-9, 0, 15.2]} rotY={0.3} />
      <SandbagPile pos={[6.6, 0, 15]} rotY={-0.4} />
      <SandbagPile pos={[-2, 0, 9.2]} rotY={0.8} />
      {[[-6, 16.8], [-2, 16.8], [2, 16.8], [6, 16.8]].map(([x, z], i) => <Bollard key={i} pos={[x, 0, z]} />)}
      {[[-7.2, 13.4], [2.6, 15], [-2.8, 15.4]].map(([x, z], i) => <Cone key={i} pos={[x, 0, z]} />)}
      <FireExtinguisher pos={[4.2, 0, 11.4]} rotY={0.4} />
    </group>
  )
}

// ============================================================================ WORLD EDGE
// Lightweight background context so the hero stage reads as part of a working lot, not a floating
// object. LOW detail, kept back, partly in fog; the hero stays the focus. NOT a surrounding city.
export function WorldEdge(): JSX.Element {
  const officeSign = useMemo(() => signMaterial('ADMINISTRATION', { bg: HERO.darkMetal, fg: '#c9a24a', w: 1024, h: 160, font: '700 88px Georgia, serif' }), [])
  const flatSign = useMemo(() => signMaterial('MERIDIAN  BACKLOT', { bg: '#7a5a3c', fg: '#efe4cc', w: 1024, h: 200, font: '700 96px Georgia, serif' }), [])
  const win = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8fb0bd', roughness: 0.2, metalness: 0.1, envMapIntensity: 1.2 }), [])
  const foliage = useMemo(() => new THREE.MeshStandardMaterial({ color: '#566637', roughness: 1 }), [])
  const foliage2 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6d7d44', roughness: 1 }), [])
  const chain = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6a6c70', roughness: 0.9, transparent: true, opacity: 0.13, side: THREE.DoubleSide }), [])
  const Tree = ({ p, s = 1 }: { p: V3; s?: number }): JSX.Element => (
    <group position={p} scale={s}>
      <Cyl r={0.18} h={2} pos={[0, 1, 0]} mat={HM.trunk} seg={6} />
      <mesh position={[0, 2.6, 0]} castShadow material={foliage}><icosahedronGeometry args={[1.2, 0]} /></mesh>
      <mesh position={[0.5, 3.1, 0.2]} castShadow material={foliage2}><icosahedronGeometry args={[0.8, 0]} /></mesh>
    </group>
  )
  const Hedge = ({ p, w = 4 }: { p: V3; w?: number }): JSX.Element => (
    <mesh position={[p[0], 0.6, p[2]]} castShadow receiveShadow material={foliage}><boxGeometry args={[w, 1.2, 0.9]} /></mesh>
  )
  return (
    <group>
      {/* nearby office context (left) — low detail, greybox vocabulary, pushed back so it reads
          as context, not a rival to the hero */}
      <group position={[-28, 0, -12]} rotation={[0, 0.55, 0]}>
        <B size={[14, 8, 11]} pos={[0, 4, 0]} mat={HM.pilaster} />
        <B size={[14.6, 0.6, 11.6]} pos={[0, 8.3, 0]} mat={HM.cornice} />
        {[3, 5.6].map((y) => [0, 1, 2, 3].map((i) => <B key={y + '-' + i} size={[1.8, 1.3, 0.15]} pos={[-4.8 + i * 3.2, y, 5.55]} mat={win} cast={false} recv={false} />))}
        <mesh position={[0, 6.9, 5.62]} material={officeSign} castShadow><boxGeometry args={[7, 1.0, 0.14]} /></mesh>
      </group>
      {/* adjacent soundstage (right) — a second barrel-roof mass implying a lot of stages */}
      <group position={[26, 0, -21]}>
        <B size={[20, 11, 16]} pos={[0, 5.5, 0]} mat={HM.wallPlain} />
        <mesh position={[0, 11, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={HM.roof}><cylinderGeometry args={[8, 8, 20, 24, 1, false, 0, Math.PI]} /></mesh>
      </group>
      {/* perimeter fence (back) — posts + rails + faint chain-link panel = lot boundary */}
      {[...Array(24)].map((_, i) => <Cyl key={'f' + i} r={0.06} h={2.4} pos={[-34 + i * 3, 1.2, -25]} mat={HM.darkMetal} seg={5} cast={false} />)}
      <B size={[70, 0.06, 0.06]} pos={[1, 2.2, -25]} mat={HM.darkMetal} cast={false} />
      <B size={[70, 0.06, 0.06]} pos={[1, 0.5, -25]} mat={HM.darkMetal} cast={false} />
      <mesh position={[1, 1.2, -25]} material={chain}><planeGeometry args={[70, 2.2]} /></mesh>
      {/* trees + hedges along the lot edge (atmospheric depth) */}
      <Tree p={[-18, 0, -22]} s={1.1} />
      <Tree p={[17, 0, -21]} s={1.2} />
      <Tree p={[-28, 0, -16]} s={1.0} />
      <Hedge p={[-15, 0, 22]} w={6} />
      <Hedge p={[25, 0, 15]} w={7} />
      {/* backlot false-front flat behind (implies the backlot beyond the stage) */}
      <group position={[-20, 0, -22]} rotation={[0, 0.5, 0]}>
        <B size={[10, 6, 0.3]} pos={[0, 3, 0]} mat={HM.wallPlain} />
        <mesh position={[0, 4.4, 0.18]} material={flatSign} castShadow><boxGeometry args={[6, 1.1, 0.1]} /></mesh>
        <mesh position={[-3, 3, -0.9]} rotation={[0.5, 0, 0]} castShadow material={HM.trunk}><boxGeometry args={[0.14, 6, 0.14]} /></mesh>
        <mesh position={[3, 3, -0.9]} rotation={[0.5, 0, 0]} castShadow material={HM.trunk}><boxGeometry args={[0.14, 6, 0.14]} /></mesh>
      </group>
    </group>
  )
}

// ============================================================================ HERO CREW
// Role-differentiated CC0 crew: reuses the existing Quaternius rig + clips (no new characters),
// adds role-based tints, deterministic height variation, and a head-bone-tracked hard hat.
// Self-contained here so the shared Workers.tsx (used by Scene D) stays byte-unchanged.
export interface HeroCrewSpec { pos: V3; rotY: number; clip: string; role: string; startAt: number }
const CHAR_URL = '/assets/animation/UAL1_Standard.glb'
useGLTF.preload(CHAR_URL)
const TMP_V = new THREE.Vector3()
// Every role gets headwear (hard hat for site crew, soft cap for DP/director) so the crew read
// consistently. The rig's "Head" bone tilts, so the hat is NOT parented to it (that caused the
// float/tilt defect); instead it tracks the head's WORLD position each frame and stays upright.
const ROLE: Record<string, { tint: string; hat: string; brim: boolean }> = {
  gaffer: { tint: '#b7975a', hat: '#e2c04a', brim: true },
  grip: { tint: '#4a4c54', hat: '#d1622a', brim: true },
  electric: { tint: '#43618a', hat: '#e2c04a', brim: true },
  camera: { tint: '#606a74', hat: '#2b2f36', brim: false },
  director: { tint: '#7a5040', hat: '#3a2a20', brim: false },
  pa: { tint: '#c96f4a', hat: '#e8e2d4', brim: true },
}

function makeHat(color: string, brim: boolean): THREE.Group {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 })
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat)
  dome.castShadow = true; g.add(dome)
  if (brim) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 14), mat); b.position.y = 0.006; g.add(b) }
  return g
}

function HeroWorker({ spec, index }: { spec: HeroCrewSpec; index: number }): JSX.Element {
  const { scene, animations } = useGLTF(CHAR_URL)
  const role = ROLE[spec.role] ?? ROLE.grip
  const height = 0.94 + ((index * 37) % 13) / 100        // deterministic 0.94..1.06
  const group = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Object3D | null>(null)
  const hatRef = useRef<THREE.Group>(null)
  const obj = useMemo(() => {
    const c = skeletonClone(scene)
    let head: THREE.Object3D | null = null
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true; m.frustumCulled = false
        const src = m.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
        const one = Array.isArray(src) ? src.map((x) => x.clone()) : src.clone()
        m.material = one
        for (const mm of Array.isArray(one) ? one : [one]) mm.color.multiplyScalar(0.82).lerp(new THREE.Color(role.tint), 0.5)
      }
      if ((o as THREE.Bone).isBone && /head/i.test(o.name) && !head) head = o
    })
    headRef.current = head
    return c
  }, [scene, spec.role, role.tint])
  const hat = useMemo(() => makeHat(role.hat, role.brim), [role.hat, role.brim])
  const mixer = useMemo(() => new THREE.AnimationMixer(obj), [obj])
  useEffect(() => {
    const clip = animations.find((a) => a.name === spec.clip) ?? animations[0]
    const action = mixer.clipAction(clip)
    action.reset().play()
    action.time = spec.startAt % (clip.duration || 1)
    return () => { mixer.stopAllAction() }
  }, [mixer, animations, spec.clip, spec.startAt])
  useFrame((_, dt) => {
    mixer.update(dt)
    const h = headRef.current, ht = hatRef.current, gr = group.current
    if (h && ht && gr) {
      h.updateWorldMatrix(true, false)
      h.getWorldPosition(TMP_V)
      gr.worldToLocal(TMP_V)
      ht.position.set(TMP_V.x, TMP_V.y + 0.17, TMP_V.z)     // seat on the crown, always upright
    }
  })
  return (
    <group ref={group} position={spec.pos} rotation={[0, spec.rotY, 0]} scale={height}>
      <primitive object={obj} />
      <primitive ref={hatRef} object={hat} />
    </group>
  )
}

export function HeroWorkers({ specs }: { specs: HeroCrewSpec[] }): JSX.Element {
  return <>{specs.map((s, i) => <HeroWorker key={i} spec={s} index={i} />)}</>
}
