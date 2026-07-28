// Asset Lab 04 — REFINED STUDIO LOT (isolated Scene F). Takes the Lab 02 greybox lot concept and
// makes it architecturally believable + VARIED + less boxy, still stylized. The "less boxy" win
// lives in GEOMETRY: many distinct roof languages (barrel+monitor, sawtooth north-light, stepped
// Deco parapet, gable, hipped pyramid, monopitch shed, curved parapet, marquee) + massing moves
// (L/stepped/wings/annex) + facade articulation (pilasters, cornices, plinths, porticos, docks).
// Self-contained: new geometry + the new lot material family; reuses the warm rig, ACES, the
// iconic water tower + dressing. Deterministic — no Math.random (seeded mulberry32 only).
import { useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { LM, LOT, signMaterial, lotPractical, mulberry32 } from '../lab/lotMaterials'
import { WaterTower, ProductionTruck, Cart, FilmLight, CrateStack, Bench, Planter } from './greybox'
import { Workers, type WorkerSpec } from './Workers'

type V3 = [number, number, number]
const R = ([x, y, z]: V3, r = 0): { position: V3; rotation: [number, number, number] } => ({ position: [x, y, z], rotation: [0, r, 0] })

function B({ size, pos = [0, 0, 0], mat, rotY = 0, rot, cast = true, recv = true }:
  { size: V3; pos?: V3; mat: THREE.Material; rotY?: number; rot?: [number, number, number]; cast?: boolean; recv?: boolean }): JSX.Element {
  return (
    <mesh position={pos} rotation={rot ?? [0, rotY, 0]} castShadow={cast} receiveShadow={recv} material={mat}>
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

// double-sided roof materials (shared) so custom prism geometry always renders regardless of winding
const dbl = (m: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial => { const c = m.clone(); c.side = THREE.DoubleSide; return c }
const RM = { tile: dbl(LM.tile), shingle: dbl(LM.shingle), wood: dbl(LM.wood), metal: dbl(LM.roofMetal), teal: dbl(LM.teal) }

// ---------------------------------------------------------------- roof-form kit
/** Gable (pitched) roof: a flat-shaded triangular prism, ridge along Z (depth), base w × d, height hr. */
function gableGeo(w: number, d: number, hr: number): THREE.BufferGeometry {
  const hw = w / 2, hd = d / 2
  const p = new Float32Array([
    -hw, 0, -hd, 0, hr, -hd, 0, hr, hd, -hw, 0, -hd, 0, hr, hd, -hw, 0, hd,     // left slope
    hw, 0, -hd, hw, 0, hd, 0, hr, hd, hw, 0, -hd, 0, hr, hd, 0, hr, -hd,        // right slope
    -hw, 0, -hd, hw, 0, -hd, 0, hr, -hd,                                        // gable end back
    -hw, 0, hd, 0, hr, hd, hw, 0, hd,                                          // gable end front
  ])
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(p, 3))
  g.computeVertexNormals()
  return g
}
function GableRoof({ w, d, hr, pos, rotY = 0, mat = RM.tile, eave = 0.4 }:
  { w: number; d: number; hr: number; pos: V3; rotY?: number; mat?: THREE.Material; eave?: number }): JSX.Element {
  const geo = useMemo(() => gableGeo(w + eave * 2, d + eave * 2, hr), [w, d, hr, eave])
  return <mesh geometry={geo} position={pos} rotation={[0, rotY, 0]} material={mat} castShadow receiveShadow />
}
/** Hipped pyramid roof (4-sided cone), footprint w × d, height hr. */
function HipRoof({ w, d, hr, pos, rotY = 0, mat = RM.tile }: { w: number; d: number; hr: number; pos: V3; rotY?: number; mat?: THREE.Material }): JSX.Element {
  return (
    <mesh position={pos} rotation={[0, rotY + Math.PI / 4, 0]} scale={[w * 0.707, hr, d * 0.707]} material={mat} castShadow receiveShadow>
      <coneGeometry args={[1, 1, 4]} />
    </mesh>
  )
}
/** Half-cylinder barrel roof, radius d/2, length w. */
function BarrelRoof({ w, d, pos, rotY = 0, mat = LM.roofMetal }: { w: number; d: number; pos: V3; rotY?: number; mat?: THREE.Material }): JSX.Element {
  return (
    <mesh position={pos} rotation={[0, rotY, Math.PI / 2]} castShadow receiveShadow material={mat}>
      <cylinderGeometry args={[d / 2, d / 2, w, 28, 1, false, 0, Math.PI]} />
    </mesh>
  )
}

// ---------------------------------------------------------------- facade kit
function Pilasters({ n, spanW, h, zFace, xC = 0, mat, depth = 0.18, wide = 0.35 }:
  { n: number; spanW: number; h: number; zFace: number; xC?: number; mat: THREE.Material; depth?: number; wide?: number }): JSX.Element {
  return (
    <group>
      {[...Array(n)].map((_, i) => {
        const x = xC - spanW / 2 + (spanW / (n - 1)) * i
        return <B key={i} size={[wide, h, depth]} pos={[x, h / 2, zFace + depth / 2]} mat={mat} cast={false} />
      })}
    </group>
  )
}
function Cornice({ w, d, y, pos = [0, 0, 0], mat, proud = 0.18, tall = 0.28 }:
  { w: number; d: number; y: number; pos?: V3; mat: THREE.Material; proud?: number; tall?: number }): JSX.Element {
  return <B size={[w + proud * 2, tall, d + proud * 2]} pos={[pos[0], y, pos[2]]} mat={mat} cast={false} />
}
function WindowBand({ n, spanW, y, zFace, mat, ww = 1.3, wh = 1.4 }:
  { n: number; spanW: number; y: number; zFace: number; mat: THREE.Material; ww?: number; wh?: number }): JSX.Element {
  return (
    <group>
      {[...Array(n)].map((_, i) => {
        const x = -spanW / 2 + (spanW / (n - 1)) * i
        return (
          <group key={i}>
            <B size={[ww + 0.24, wh + 0.24, 0.12]} pos={[x, y, zFace + 0.02]} mat={LM.trim} cast={false} recv={false} />
            <B size={[ww, wh, 0.08]} pos={[x, y, zFace - 0.04]} mat={mat} cast={false} recv={false} />
          </group>
        )
      })}
    </group>
  )
}
function LoadingDock({ w, zFace, mat = LM.concrete, doors = 3 }: { w: number; zFace: number; mat?: THREE.Material; doors?: number }): JSX.Element {
  return (
    <group>
      <B size={[w, 1.1, 3]} pos={[0, 0.55, zFace + 1.6]} mat={mat} />
      {[...Array(doors)].map((_, i) => {
        const x = -w / 2 + (w / doors) * (i + 0.5)
        return <B key={i} size={[2.4, 3, 0.15]} pos={[x, 2.6, zFace + 0.02]} mat={LM.darkMetal} cast={false} recv={false} />
      })}
      <B size={[w + 0.6, 0.2, 2.4]} pos={[0, 4.4, zFace + 1.2]} mat={LM.galv} cast={false} />
      {[-w / 2 + 0.4, 0, w / 2 - 0.4].map((x, i) => <Cyl key={i} r={0.06} h={4.2} pos={[x, 2.2, zFace + 2.3]} mat={LM.darkMetal} seg={6} cast={false} />)}
    </group>
  )
}
function Plinth({ w, d, mat = LM.concrete, h = 0.7 }: { w: number; d: number; mat?: THREE.Material; h?: number }): JSX.Element {
  return <B size={[w + 0.3, h, d + 0.3]} pos={[0, h / 2, 0]} mat={mat} />
}

// ============================================================================ SOUNDSTAGE (barrel + monitor, varied)
export function LotSoundstage({ pos = [0, 0, 0], rotY = 0, w = 24, d = 18, h = 12, number = '1' }:
  { pos?: V3; rotY?: number; w?: number; d?: number; h?: number; number?: string }): JSX.Element {
  const num = useMemo(() => signMaterial(number, { bg: LOT.stuccoWarm, fg: '#2b2620', w: 512, h: 512, font: '800 380px ui-sans-serif, sans-serif' }), [number])
  const band = useMemo(() => signMaterial('STAGE ' + number, { bg: LOT.terracotta, fg: '#efe4cc', w: 1024, h: 200 }), [number])
  const rnd = useMemo(() => mulberry32(0x100 + number.charCodeAt(0)), [number])
  return (
    <group {...R(pos, rotY)}>
      <Plinth w={w} d={d} mat={LM.concrete} h={0.8} />
      {/* corrugated hall + shadowed lower band */}
      <B size={[w, h, d]} pos={[0, h / 2, 0]} mat={LM.wallCorrugated} />
      <B size={[w + 0.2, 3, d + 0.2]} pos={[0, 1.5, 0]} mat={LM.darkMetal} recv />
      {/* expressed structural buttress pilasters on the long walls */}
      <Pilasters n={6} spanW={w - 2} h={h} zFace={d / 2} mat={LM.wallCorrugated} depth={0.25} wide={0.4} />
      <Pilasters n={6} spanW={w - 2} h={h} zFace={-d / 2 - 0.25} mat={LM.wallCorrugated} depth={0.25} wide={0.4} />
      {/* barrel roof + full-length monitor/clerestory riding the ridge */}
      <BarrelRoof w={w} d={d} pos={[0, h, 0]} />
      <B size={[w * 0.62, 1.6, 2.2]} pos={[0, h + d / 2 - 0.4, 0]} mat={LM.galv} />
      {[-1, 1].map((s) => <B key={s} size={[w * 0.6, 0.9, 0.08]} pos={[0, h + d / 2 - 0.4, s * 1.1]} mat={LM.glass} cast={false} />)}
      {/* lean-to annex (dressing rooms) on the front-left, breaks the sheer wall */}
      <B size={[w * 0.45, 3.4, 4]} pos={[-w * 0.24, 1.7, d / 2 + 2]} mat={LM.stucco} />
      <mesh position={[-w * 0.24, 3.5, d / 2 + 2]} rotation={[0.18, 0, 0]} material={RM.metal} castShadow><boxGeometry args={[w * 0.46, 0.1, 4.4]} /></mesh>
      {/* giant stencil number + name band on the front gable */}
      <mesh position={[w * 0.28, h * 0.62, d / 2 + 0.12]} material={num} castShadow><boxGeometry args={[3.4, 3.4, 0.06]} /></mesh>
      <mesh position={[w * 0.05, h - 1.4, d / 2 + 0.12]} material={band} castShadow><boxGeometry args={[8, 1.3, 0.12]} /></mesh>
      {/* elephant door (recessed) */}
      <B size={[6, 6.2, 0.3]} pos={[w * 0.05, 3.1, d / 2 - 0.15]} mat={LM.barnRed} recv={false} />
      <B size={[6.6, 0.7, 0.5]} pos={[w * 0.05, 6.5, d / 2 + 0.05]} mat={LM.darkMetal} />
      {/* rooftop HVAC scatter (seeded, so no two stages match) */}
      {[...Array(3)].map((_, i) => <B key={i} size={[1.6 + rnd(), 1.2, 1.6]} pos={[(rnd() - 0.5) * w * 0.5, h + 1.2, (rnd() - 0.5) * d * 0.4]} mat={LM.darkMetal} />)}
    </group>
  )
}

// ============================================================================ ADMINISTRATION (Deco, stepped, L-plan)
export function AdminBuilding({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const sign = useMemo(() => signMaterial('ADMINISTRATION', { bg: '#241f1a', fg: '#c9a24a', w: 1024, h: 160, font: '700 92px Georgia, serif' }), [])
  const blade = useMemo(() => signMaterial('MERIDIAN', { bg: '#241f1a', fg: '#c9a24a', w: 256, h: 1024, font: '700 120px Georgia, serif' }), [])
  return (
    <group {...R(pos, rotY)}>
      <Plinth w={24} d={12} mat={LM.terracotta} h={0.7} />
      {/* front bar + return wing (L-plan) around a shallow forecourt */}
      <B size={[24, 7, 8]} pos={[0, 3.5, 0]} mat={LM.stucco} />
      <B size={[8, 6.5, 10]} pos={[-12, 3.25, 7]} mat={LM.stucco} />
      {/* mid-wall string course + top cornice (classical bands) */}
      <Cornice w={24} d={8} y={4.1} mat={LM.decoBand} proud={0.12} tall={0.22} />
      <Cornice w={24} d={8} y={7.1} mat={LM.trim} proud={0.22} tall={0.4} />
      {/* stepped-Deco center pavilion crown (3 tiers, rising) */}
      <B size={[9, 3.5, 8.4]} pos={[0, 8.6, 0]} mat={LM.stucco} />
      <B size={[6, 2.6, 6]} pos={[0, 11.3, 0]} mat={LM.stucco} />
      <B size={[3.4, 1.8, 3.6]} pos={[0, 13.3, 0]} mat={LM.stucco} />
      {[[4.5, 8.6, 9], [3, 11.3, 6.2], [1.7, 13.3, 3.8]].map(([sw, cy, cd], i) => <Cornice key={i} w={sw * 2} d={cd} y={cy + [1.9, 1.5, 1.1][i]} pos={[0, 0, 0]} mat={LM.trim} proud={0.15} tall={0.3} />)}
      {/* vertical Deco reveals on the center pavilion */}
      {[-2.2, 0, 2.2].map((x, i) => <B key={i} size={[0.5, 3.2, 0.2]} pos={[x, 9.2, 4.25]} mat={LM.decoBand} cast={false} />)}
      {/* flagpole crown */}
      <Cyl r={0.06} h={3} pos={[0, 15.7, 0]} mat={LM.darkMetal} seg={8} />
      {/* pilasters + window rhythm on the front bar */}
      <Pilasters n={9} spanW={22} h={7} zFace={4} mat={LM.stucco} depth={0.16} wide={0.3} />
      <WindowBand n={5} spanW={17} y={2.6} zFace={4.03} mat={LM.glass} />
      <WindowBand n={5} spanW={17} y={5.1} zFace={4.03} mat={LM.glass} />
      {/* portico entrance in the inside corner of the L */}
      <group position={[-8, 0, 4]}>
        <B size={[5, 0.3, 3]} pos={[0, 3.4, 1.4]} mat={LM.terracotta} />
        {[-2, 2].map((x) => <Cyl key={x} r={0.16} h={3.4} pos={[x, 1.7, 2.6]} mat={LM.trim} seg={10} />)}
        <B size={[2.4, 3, 0.2]} pos={[0, 1.5, 0.05]} mat={LM.teal} recv={false} />
        <B size={[4, 0.2, 1.6]} pos={[0, 0.1, 1.6]} mat={LM.sidewalk} />
        <mesh position={[0, 4, 0.14]} material={sign} castShadow><boxGeometry args={[6, 0.9, 0.12]} /></mesh>
      </group>
      {/* vertical blade sign at the corner */}
      <mesh position={[12.15, 5.5, 3]} material={blade} castShadow><boxGeometry args={[0.14, 4, 1]} /></mesh>
    </group>
  )
}

// ============================================================================ COMMISSARY (streamline, curved parapet, awning)
export function Commissary({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const sign = useMemo(() => signMaterial('COMMISSARY', { bg: '#241f1a', fg: '#e8b23a', w: 1024, h: 220, font: '700 120px Georgia, serif' }), [])
  return (
    <group {...R(pos, rotY)}>
      <Plinth w={16} d={10} mat={LM.terracotta} h={0.5} />
      <B size={[16, 5, 10]} pos={[0, 2.5, 0]} mat={LM.stuccoWarm} />
      {/* rounded streamline corner */}
      <Cyl r={3} h={5} pos={[8, 2.5, 5]} mat={LM.coral} seg={20} />
      {/* curved parapet cap along the front + a small central sign pylon (rooftop drum) */}
      <Cornice w={16} d={10} y={5.2} mat={LM.trim} proud={0.2} tall={0.35} />
      <mesh position={[8, 5.2, 5]} rotation={[Math.PI / 2, 0, 0]} material={LM.trim} castShadow><cylinderGeometry args={[3.2, 3.2, 0.4, 20, 1, false, 0, Math.PI]} /></mesh>
      <Cyl r={1.6} h={2.4} pos={[0, 6.2, 0]} mat={LM.stuccoWarm} seg={18} />
      <mesh position={[0, 6.6, 1.62]} material={sign} castShadow><boxGeometry args={[2.6, 1.4, 0.08]} /></mesh>
      {/* striped awning over the road-facing windows */}
      <mesh position={[0, 4, 5.6]} rotation={[0.4, 0, 0]} material={LM.teal} castShadow><boxGeometry args={[12, 0.1, 1.8]} /></mesh>
      <WindowBand n={5} spanW={11} y={2.6} zFace={5.03} mat={LM.glass} ww={1.6} wh={1.8} />
      {/* patio: low planter wall + benches + umbrellas */}
      <group position={[0, 0, 8.5]}>
        <B size={[10, 0.5, 0.3]} pos={[0, 0.25, 0]} mat={LM.terracotta} cast={false} />
        <Bench pos={[-3, 0, -0.6]} rotY={Math.PI} />
        <Bench pos={[3, 0, -0.6]} rotY={Math.PI} />
        {[-2.5, 2.5].map((x, i) => (
          <group key={i} position={[x, 0, 1]}>
            <Cyl r={0.06} h={2.4} pos={[0, 1.2, 0]} mat={LM.trunk} seg={6} />
            <mesh position={[0, 2.5, 0]} material={LM.terracotta} castShadow><coneGeometry args={[1.4, 0.6, 12]} /></mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// ============================================================================ MILL / SCENE SHOP (sawtooth north-light roof)
export function Mill({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const sign = useMemo(() => signMaterial('MILL', { bg: '#241f1a', fg: '#efe4cc', w: 512, h: 256, font: '700 150px ui-sans-serif, sans-serif' }), [])
  const w = 22, d = 14, h = 8, teeth = 5
  return (
    <group {...R(pos, rotY)}>
      <Plinth w={w} d={d} mat={LM.concrete} h={0.7} />
      <B size={[w, h, d]} pos={[0, h / 2, 0]} mat={LM.brick} />
      <Pilasters n={6} spanW={w - 2} h={h} zFace={d / 2} mat={LM.brick} depth={0.2} wide={0.4} />
      {/* SAWTOOTH north-light roof: N units of (opaque slope + vertical glazed face) */}
      {[...Array(teeth)].map((_, i) => {
        const tw = w / teeth
        const x = -w / 2 + tw * (i + 0.5)
        return (
          <group key={i} position={[x, h, 0]}>
            <mesh position={[0, 1, 0]} rotation={[0, 0, -0.5]} material={RM.metal} castShadow receiveShadow><boxGeometry args={[tw, 0.12, d]} /></mesh>
            <B size={[0.15, 2, d]} pos={[tw / 2 - 0.1, 1, 0]} mat={LM.glass} cast={false} />
            <B size={[0.2, 0.2, d]} pos={[-tw / 2, 0.1, 0]} mat={LM.darkMetal} cast={false} />
          </group>
        )
      })}
      {/* loading dock + roll-up doors + timber doors, scene-dock lean-to */}
      <LoadingDock w={w * 0.7} zFace={d / 2} doors={3} />
      <mesh position={[0, h - 1, d / 2 + 0.1]} material={sign} castShadow><boxGeometry args={[3, 1.4, 0.1]} /></mesh>
      {/* scene-dock lean-to (open bay with stacked flats) at one end */}
      <group position={[-w / 2 - 3, 0, 0]}>
        <mesh position={[0, 4, 0]} rotation={[0, 0, 0.3]} material={RM.metal} castShadow><boxGeometry args={[6, 0.12, d * 0.8]} /></mesh>
        {[-1.5, 1.5].map((z, i) => <Cyl key={i} r={0.12} h={4} pos={[-2.5, 2, z * 2]} mat={LM.darkMetal} seg={6} />)}
        {[0, 1, 2].map((i) => <mesh key={i} position={[-1 + i * 0.3, 2.2, -2 + i]} rotation={[0, 0.2, -0.15]} material={LM.woodBrace} castShadow><boxGeometry args={[0.1, 4, 2.6]} /></mesh>)}
      </group>
    </group>
  )
}

// ============================================================================ WAREHOUSE (gable + dock + buttresses)
export function Warehouse({ pos = [0, 0, 0], rotY = 0, label = 'PROPERTY' }: { pos?: V3; rotY?: number; label?: string }): JSX.Element {
  const sign = useMemo(() => signMaterial(label, { bg: LOT.brick, fg: '#efe4cc', w: 1024, h: 200, font: '700 130px ui-sans-serif, sans-serif' }), [label])
  const w = 22, d = 11, h = 6
  return (
    <group {...R(pos, rotY)}>
      <Plinth w={w} d={d} mat={LM.concrete} h={0.6} />
      <B size={[w, h, d]} pos={[0, h / 2, 0]} mat={LM.brickPale} />
      <B size={[w, 2, d]} pos={[0, h + 0.6, 0]} mat={LM.wallCorrugated} />   {/* cream corrugated upper */}
      <GableRoof w={w} d={d} hr={2.6} pos={[0, h + 1.6, 0]} mat={RM.metal} eave={0.5} />
      <Pilasters n={8} spanW={w - 1.5} h={h} zFace={d / 2} mat={LM.brickPale} depth={0.22} wide={0.45} />
      <LoadingDock w={w * 0.8} zFace={d / 2} doors={4} />
      <mesh position={[0, h - 1.2, d / 2 + 0.1]} material={sign} castShadow><boxGeometry args={[6, 1.2, 0.1]} /></mesh>
    </group>
  )
}

// ============================================================================ SCREENING THEATER (marquee + blade)
export function ScreeningTheater({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const blade = useMemo(() => signMaterial('MERIDIAN', { bg: '#2b2620', fg: '#e8b23a', w: 256, h: 1024, font: '700 130px Georgia, serif' }), [])
  const marquee = useMemo(() => lotPractical('#e8b23a', '#e8b23a', 0.6, true), [])
  return (
    <group {...R(pos, rotY)}>
      <Plinth w={10} d={14} mat={LM.terracotta} h={0.5} />
      {/* stepped mass: lower lobby front + taller fly-tower rear */}
      <B size={[10, 5, 4]} pos={[0, 2.5, 5]} mat={LM.stucco} />
      <B size={[10, 8, 10]} pos={[0, 4, -2]} mat={LM.stucco} />
      <B size={[10.4, 1, 4.4]} pos={[0, 5.3, 5]} mat={LM.aubergine} cast={false} />   {/* marquee band */}
      <Cornice w={10} d={10} y={8.2} pos={[0, 0, -2]} mat={LM.trim} proud={0.18} tall={0.35} />
      {/* projecting marquee canopy (warm-lit underside) */}
      <B size={[8, 0.4, 3]} pos={[0, 4.4, 8.4]} mat={LM.aubergine} />
      <mesh position={[0, 4.2, 8.4]} material={marquee}><boxGeometry args={[7.6, 0.1, 2.6]} /></mesh>
      {[...Array(9)].map((_, i) => <Cyl key={i} r={0.06} h={0.1} pos={[-3.6 + i * 0.9, 4.15, 9.6]} mat={marquee} rot={[Math.PI / 2, 0, 0]} seg={8} cast={false} />)}
      {/* vertical blade fin on the front corner */}
      <mesh position={[5.2, 6, 6]} material={blade} castShadow><boxGeometry args={[0.16, 5, 1.2]} /></mesh>
      <B size={[2.6, 2.6, 0.2]} pos={[0, 2.6, 7.05]} mat={LM.teal} recv={false} />   {/* doors */}
    </group>
  )
}

// ============================================================================ BUNGALOW (pitched roofs, porch, chimney)
export function Bungalow({ pos = [0, 0, 0], rotY = 0, wall = LM.stuccoOchre, roof = RM.tile, hip = false }:
  { pos?: V3; rotY?: number; wall?: THREE.Material; roof?: THREE.Material; hip?: boolean }): JSX.Element {
  const w = 7, d = 6, h = 3.4
  return (
    <group {...R(pos, rotY)}>
      <B size={[w, h, d]} pos={[0, h / 2, 0]} mat={wall} />
      {hip
        ? <HipRoof w={w + 0.8} d={d + 0.8} hr={2.4} pos={[0, h, 0]} mat={roof} />
        : <GableRoof w={w} d={d} hr={2.2} pos={[0, h, 0]} mat={roof} eave={0.5} />}
      {/* projecting gabled entry porch on posts */}
      <group position={[0, 0, d / 2 + 0.9]}>
        <GableRoof w={2.6} d={2.2} hr={0.9} pos={[0, 2.4, 0]} mat={roof} eave={0.3} />
        {[-1, 1].map((x) => <Cyl key={x} r={0.09} h={2.4} pos={[x, 1.2, 0.6]} mat={LM.trim} seg={8} />)}
        <B size={[1, 2.2, 0.15]} pos={[0, 1.1, -0.9]} mat={LM.woodBrace} recv={false} />
      </group>
      {/* shuttered windows + brick chimney */}
      {[-2, 2].map((x, i) => (
        <group key={i} position={[x, 1.7, d / 2 + 0.02]}>
          <B size={[1, 1.1, 0.1]} pos={[0, 0, 0]} mat={LM.glass} cast={false} />
          <B size={[0.24, 1.2, 0.08]} pos={[-0.65, 0, 0.02]} mat={LM.teal} cast={false} />
          <B size={[0.24, 1.2, 0.08]} pos={[0.65, 0, 0.02]} mat={LM.teal} cast={false} />
        </group>
      ))}
      <B size={[0.8, 4.5, 0.8]} pos={[w / 2 - 1, 2.2, -1]} mat={LM.brick} />
    </group>
  )
}

// ============================================================================ BACKLOT FALSE-FRONT (with exposed bracing)
export function BacklotFront({ pos = [0, 0, 0], rotY = 0, w = 8, h = 6, wall = LM.woodRed, sign = 'HOTEL', parapet = 'stepped' }:
  { pos?: V3; rotY?: number; w?: number; h?: number; wall?: THREE.Material; sign?: string; parapet?: 'stepped' | 'cornice' | 'gable' }): JSX.Element {
  const board = useMemo(() => signMaterial(sign, { bg: '#241f1a', fg: '#e8b23a', w: 512, h: 200, font: '700 110px Georgia, serif' }), [sign])
  const floors = Math.max(1, Math.round(h / 3))
  return (
    <group {...R(pos, rotY)}>
      {/* thin painted flat */}
      <B size={[w, h, 0.3]} pos={[0, h / 2, 0]} mat={wall} recv={false} />
      {/* false parapet top (variety) */}
      {parapet === 'stepped' && <>
        <B size={[w, 0.6, 0.5]} pos={[0, h + 0.3, 0.05]} mat={wall} />
        <B size={[w * 0.4, 0.9, 0.5]} pos={[0, h + 0.6, 0.05]} mat={wall} />
      </>}
      {parapet === 'cornice' && <B size={[w + 0.4, 0.5, 0.6]} pos={[0, h + 0.25, 0.1]} mat={LM.trim} />}
      {parapet === 'gable' && <GableRoof w={w} d={0.4} hr={1.4} pos={[0, h, 0]} mat={RM.wood} eave={0.2} />}
      {/* storefront windows + awning + sign board */}
      {[...Array(floors)].map((_, f) => [-1, 1].map((s) => <B key={f + '-' + s} size={[w * 0.28, 1.3, 0.1]} pos={[s * w * 0.24, 1.6 + f * (h / floors), 0.18]} mat={LM.glass} cast={false} />))}
      <mesh position={[0, 3, 0.4]} rotation={[0.5, 0, 0]} material={LM.terracotta} castShadow><boxGeometry args={[w * 0.7, 0.08, 1]} /></mesh>
      <mesh position={[0, h - 0.9, 0.18]} material={board} castShadow><boxGeometry args={[w * 0.6, 0.9, 0.06]} /></mesh>
      {/* EXPOSED timber A-frame bracing behind (reveals it is a set) */}
      {[-w * 0.3, 0, w * 0.3].map((x, i) => (
        <group key={i}>
          <mesh position={[x, h / 2, -0.9]} rotation={[0.5, 0, 0]} castShadow material={LM.woodBrace}><boxGeometry args={[0.14, h + 1, 0.14]} /></mesh>
          <mesh position={[x, h * 0.35, -0.5]} rotation={[-0.6, 0, 0]} castShadow material={LM.woodBrace}><boxGeometry args={[0.12, h * 0.8, 0.12]} /></mesh>
        </group>
      ))}
    </group>
  )
}

// ============================================================================ MARQUEE GATE (arched sign over the drive) + hex booth
export function MarqueeGate({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const sign = useMemo(() => signMaterial('MERIDIAN PICTURES', { bg: '#efe4cc', fg: '#b45f3c', w: 1280, h: 220, font: '700 118px Georgia, serif' }), [])
  return (
    <group {...R(pos, rotY)}>
      {/* two masonry piers + pyramidal caps */}
      {[-4.5, 4.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <B size={[1.6, 4.4, 1.6]} pos={[0, 2.2, 0]} mat={LM.stucco} />
          <B size={[1.9, 0.4, 1.9]} pos={[0, 4.5, 0]} mat={LM.terracotta} />
          <mesh position={[0, 5, 0]} rotation={[0, Math.PI / 4, 0]} material={LM.terracotta} castShadow><coneGeometry args={[1.1, 1, 4]} /></mesh>
        </group>
      ))}
      {/* arched overhead sign header spanning the drive */}
      <B size={[10.5, 0.5, 0.7]} pos={[0, 5.4, 0]} mat={LM.darkMetal} />
      <mesh position={[0, 5.4, 0]} rotation={[0, 0, 0]} material={LM.darkMetal} castShadow><cylinderGeometry args={[5.2, 5.2, 0.4, 24, 1, true, Math.PI, Math.PI]} /></mesh>
      <mesh position={[0, 6.1, 0.06]} material={sign} castShadow><boxGeometry args={[8.5, 1.4, 0.15]} /></mesh>
      {/* boom barrier */}
      <mesh position={[2, 1.1, 0]} castShadow material={LM.curbPaint}><boxGeometry args={[5, 0.16, 0.16]} /></mesh>
      {/* hex guard booth with a hipped pyramid roof + eave */}
      <group position={[7.5, 0, 1]}>
        <mesh position={[0, 1.4, 0]} material={LM.stucco} castShadow receiveShadow><cylinderGeometry args={[1.5, 1.5, 2.8, 6]} /></mesh>
        <B size={[1.2, 1, 0.1]} pos={[0, 1.8, 1.4]} mat={LM.glass} cast={false} />
        <mesh position={[0, 3.4, 0]} rotation={[0, Math.PI / 6, 0]} material={RM.teal} castShadow><coneGeometry args={[2.1, 1.4, 6]} /></mesh>
      </group>
    </group>
  )
}

// ============================================================================ MOTOR POOL (open monopitch shed)
export function MotorPoolShed({ pos = [0, 0, 0], rotY = 0 }: { pos?: V3; rotY?: number }): JSX.Element {
  const w = 18, d = 7
  return (
    <group {...R(pos, rotY)}>
      <B size={[w, 0.1, d]} pos={[0, 0.05, 0]} mat={LM.concrete} />
      {/* monopitch roof on exposed columns (open front) */}
      <mesh position={[0, 4, -0.3]} rotation={[0.28, 0, 0]} material={RM.metal} castShadow receiveShadow><boxGeometry args={[w + 0.6, 0.12, d + 1.4]} /></mesh>
      {[-w / 2 + 0.5, -w / 6, w / 6, w / 2 - 0.5].map((x, i) => <Cyl key={'f' + i} r={0.12} h={4.5} pos={[x, 2.25, d / 2 - 0.3]} mat={LM.darkMetal} seg={6} />)}
      {[-w / 2 + 0.5, w / 2 - 0.5].map((x, i) => <Cyl key={'b' + i} r={0.12} h={3.1} pos={[x, 1.55, -d / 2 + 0.3]} mat={LM.darkMetal} seg={6} />)}
      {/* enclosed tool-crib end bay */}
      <B size={[3, 3, d]} pos={[w / 2 - 1.5, 1.5, 0]} mat={LM.wallCorrugated} />
      {/* painted bay stripes */}
      {[-5, -1.5, 2, 5.5].map((x, i) => <B key={i} size={[0.12, 0.02, d - 1]} pos={[x, 0.11, 0]} mat={LM.curbPaint} cast={false} />)}
    </group>
  )
}

// ============================================================================ LANDSCAPING
function Palm({ pos = [0, 0, 0], s = 1 }: { pos?: V3; s?: number }): JSX.Element {
  return (
    <group position={pos} scale={s}>
      <Cyl r={0.16} h={5.4} pos={[0, 2.7, 0]} mat={LM.trunk} seg={7} />
      {[...Array(7)].map((_, i) => {
        const a = (i / 7) * Math.PI * 2
        return <mesh key={i} position={[Math.sin(a) * 0.6, 5.4, Math.cos(a) * 0.6]} rotation={[Math.cos(a) * 0.5, a, -0.4 + Math.sin(a) * 0.5]} castShadow material={LM.foliage}><boxGeometry args={[0.35, 0.06, 2.4]} /></mesh>
      })}
      <mesh position={[0, 5.5, 0]} material={LM.foliageLight}><icosahedronGeometry args={[0.4, 0]} /></mesh>
    </group>
  )
}
function LotTree({ pos = [0, 0, 0], s = 1 }: { pos?: V3; s?: number }): JSX.Element {
  return (
    <group position={pos} scale={s}>
      <Cyl r={0.18} h={1.8} pos={[0, 0.9, 0]} mat={LM.trunk} seg={6} />
      <mesh position={[0, 2.4, 0]} castShadow material={LM.foliage}><icosahedronGeometry args={[1.4, 0]} /></mesh>
      <mesh position={[0.6, 3, 0.3]} castShadow material={LM.foliageLight}><icosahedronGeometry args={[0.9, 0]} /></mesh>
    </group>
  )
}
function Hedge({ pos = [0, 0, 0], len = 6, rotY = 0 }: { pos?: V3; len?: number; rotY?: number }): JSX.Element {
  return <B size={[len, 0.8, 0.7]} pos={[pos[0], 0.4, pos[2]]} rotY={rotY} mat={LM.foliage} />
}

// ============================================================================ REFINED LOT (composition)
const LOT_CREW: WorkerSpec[] = [
  { pos: [-2, 0, 12], rotY: 0.4, clip: 'Idle_Talking_Loop', tint: '', startAt: 0.0 },   // avenue pair
  { pos: [-0.6, 0, 13.2], rotY: -2.0, clip: 'Idle_Talking_Loop', tint: '', startAt: 1.4 },
  { pos: [22, 0, 12], rotY: 2.6, clip: 'Sitting_Idle_Loop', tint: '', startAt: 0.7 },     // commissary patio
  { pos: [5, 0, -8], rotY: 0.2, clip: 'Fixing_Kneeling', tint: '', startAt: 2.1 },         // stage 1 door
  { pos: [3, 0, 4], rotY: -1.4, clip: 'PickUp_Table', tint: '', startAt: 0.4 },            // avenue cart
  { pos: [0.5, 0, 18], rotY: 0.0, clip: 'Walk_Loop', tint: '', startAt: 0.9 },             // entrance drive
  { pos: [-14, 0, -22], rotY: 1.1, clip: 'Idle_Loop', tint: '', startAt: 1.8 },            // mill yard
  { pos: [38, 0, -6], rotY: -1.6, clip: 'Idle_Talking_Loop', tint: '', startAt: 2.4 },     // backlot street
]

export function RefinedLot({ dressing = true, crew = true, landscaping = true }:
  { dressing?: boolean; crew?: boolean; landscaping?: boolean }): JSX.Element {
  return (
    <group>
      <Ground />

      {/* ---------- entrance / front office ---------- */}
      <MarqueeGate pos={[0, 0, 38]} />
      <AdminBuilding pos={[-16, 0, 22]} rotY={1.36} />
      <Commissary pos={[21, 0, 16]} rotY={-0.35} />
      <ScreeningTheater pos={[33, 0, 9]} rotY={-0.7} />

      {/* ---------- numbered stage row (staggered heights + one rotated) ---------- */}
      <LotSoundstage pos={[4, 0, -20]} rotY={0} w={26} d={20} h={13} number="1" />
      <LotSoundstage pos={[-22, 0, -17]} rotY={Math.PI / 2} w={20} d={16} h={11} number="2" />
      <LotSoundstage pos={[29, 0, -15]} rotY={0} w={16} d={14} h={10} number="3" />

      {/* ---------- mill / water tower / service (NW) ---------- */}
      <WaterTower pos={[-42, 0, -4]} label="MERIDIAN" />
      <Mill pos={[-40, 0, -26]} rotY={0} />
      <Warehouse pos={[-18, 0, -39]} rotY={0} label="PROPERTY" />
      <Warehouse pos={[4, 0, -41]} rotY={0} label="WARDROBE" />
      <MotorPoolShed pos={[16, 0, -36]} rotY={0} />

      {/* ---------- writers' bungalow cluster (SW garden) ---------- */}
      <Bungalow pos={[-34, 0, 16]} rotY={0.2} wall={LM.stuccoOchre} roof={RM.tile} />
      <Bungalow pos={[-33, 0, 8]} rotY={-0.3} wall={LM.stuccoSage} roof={RM.shingle} hip />
      <Bungalow pos={[-40, 0, 11]} rotY={0.5} wall={LM.stucco} roof={RM.tile} />

      {/* ---------- backlot false-front street (east, uneven skyline) ---------- */}
      <BacklotFront pos={[40, 0, 8]} rotY={-Math.PI / 2 - 0.12} w={9} h={7} wall={LM.brickPale} sign="HOTEL" parapet="cornice" />
      <BacklotFront pos={[40.5, 0, -2]} rotY={-Math.PI / 2 + 0.1} w={7} h={5} wall={LM.woodRed} sign="SALOON" parapet="stepped" />
      <BacklotFront pos={[40, 0, -12]} rotY={-Math.PI / 2 - 0.05} w={8} h={9} wall={LM.woodGreen} sign="GENERAL STORE" parapet="gable" />
      <BacklotFront pos={[40.5, 0, -22]} rotY={-Math.PI / 2 + 0.15} w={6} h={4.5} wall={LM.wood} sign="BANK" parapet="cornice" />

      {/* ---------- landscaping ---------- */}
      {landscaping && (
        <group>
          {/* formal palm avenue down the entrance drive (repetition = ceremonial) */}
          {[10, 16, 22, 28, 34].map((z, i) => (
            <group key={i}>
              <Palm pos={[-4.6, 0, z]} s={0.95 + (i % 2) * 0.1} />
              <Palm pos={[4.6, 0, z]} s={0.95 + ((i + 1) % 2) * 0.1} />
            </group>
          ))}
          {/* informal avenue street-trees (offset, never paired) */}
          <LotTree pos={[-30, 0, 6]} s={1.1} /><LotTree pos={[-8, 0, 7]} s={0.9} />
          <LotTree pos={[12, 0, 6.5]} s={1.2} /><LotTree pos={[34, 0, 5.5]} s={1.0} />
          {/* front-office planting + hedges */}
          <Hedge pos={[-16, 0, 15]} len={12} rotY={1.36} />
          <Planter pos={[-8, 0, 17]} /><Planter pos={[-24, 0, 18]} />
          {/* commissary quad lawn + shade trees */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[24, 0.008, 9]} receiveShadow material={LM.foliage}><planeGeometry args={[12, 8]} /></mesh>
          <LotTree pos={[20, 0, 6]} s={1.0} /><LotTree pos={[27, 0, 11]} s={0.9} />
          {/* service screening along the mill/back edge */}
          {[-30, -24, -12].map((x, i) => <LotTree key={i} pos={[x, 0, -33]} s={0.9 + (i % 2) * 0.2} />)}
        </group>
      )}

      {/* ---------- production dressing (reuse Lab 02 props) ---------- */}
      {dressing && (
        <group>
          <ProductionTruck pos={[10, 0, -34]} rotY={0.3} />
          <ProductionTruck pos={[20, 0, -37]} rotY={-0.4} />
          <Cart pos={[2, 0, 3]} rotY={0.5} /><Cart pos={[6, 0, -6]} rotY={-1.0} />
          <FilmLight pos={[7, 0, -7]} rotY={0.3} /><FilmLight pos={[2.5, 0, -6]} rotY={-0.8} />
          <CrateStack pos={[45, 0, -18]} rotY={0.4} /><CrateStack pos={[-30, 0, -30]} rotY={-0.3} />
          <CrateStack pos={[46, 0, -24]} rotY={0.2} />
        </group>
      )}

      {/* ---------- visible studio life ---------- */}
      {crew && <Suspense fallback={null}><Workers specs={LOT_CREW} /></Suspense>}
    </group>
  )
}

// ============================================================================ GROUND / ROADS
function Ground(): JSX.Element {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, -0.02, 0]} receiveShadow material={LM.asphalt}><planeGeometry args={[150, 150]} /></mesh>
      {/* concrete working apron over the built core (lighter than the asphalt periphery; roads overlay as darker lanes) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.006, -8]} receiveShadow material={LM.concrete}><planeGeometry args={[104, 74]} /></mesh>
      {/* entrance forecourt (warm concrete) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 26]} receiveShadow material={LM.concrete}><planeGeometry args={[16, 26]} /></mesh>
      {/* main avenue (E-W) + entrance drive (N-S) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0.012, 2]} receiveShadow material={LM.asphalt}><planeGeometry args={[100, 8]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 20]} receiveShadow material={LM.asphalt}><planeGeometry args={[7, 40]} /></mesh>
      {/* stage-row service lane + backlot street */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, 0.012, -8]} receiveShadow material={LM.asphalt}><planeGeometry args={[6, 24]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[36, 0.012, -8]} receiveShadow material={LM.sidewalk}><planeGeometry args={[5, 44]} /></mesh>
    </group>
  )
}
