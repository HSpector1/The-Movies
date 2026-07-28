// ── Meridian buildings + ground (M3 art pass) ─────────────────────────────────
// Upgrades the M1 greybox to the coherent Meridian language using the
// MeridianEnvironmentKit + shared material library. Building DATA (positions, sizes,
// heights, footprints) is unchanged from layout.ts, so routing and the proven camera
// are preserved. Selection uses a ground RING (not material mutation) because the
// kit shares cached materials. Hover/select still emit intents via the store.

import { type JSX } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Material } from 'three'
import { BUILDINGS, WATER_TOWER, GROUND, TREES, HEDGES, type BuildingSpec } from './layout'
import { state, hover, selectBuilding } from '../app/store'
import { useStoreTick } from '../app/useStore'
import { M, MERIDIAN, mat } from '../env/materials'
import { GateBuilding, AdminBuilding, Soundstage, Theater, Bungalow, Backlot, WaterTower } from '../env/kit'

function KitBuilding({ b }: { b: BuildingSpec }): JSX.Element {
  const [w, d] = b.size
  switch (b.kind) {
    case 'gate':
      return <GateBuilding w={w} d={d} height={b.height} />
    case 'admin':
      return <AdminBuilding w={w} d={d} height={b.height} />
    case 'soundstage':
      return <Soundstage w={w} d={d} height={b.height} number={2} />
    case 'theater':
      return <Theater w={w} d={d} height={b.height} />
    case 'bungalow':
      return <Bungalow w={w} d={d} height={b.height} />
    case 'backlot':
      return <Backlot w={w} d={d} height={b.height} />
    default:
      return <group />
  }
}

// selection/hover cue: a flat emissive ring on the ground (does not touch the shared
// building materials). brass = hover, signature red = selected.
function SelectionRing({ b }: { b: BuildingSpec }): JSX.Element | null {
  useStoreTick()
  const hot = state.hovered === b.id
  const sel = state.selectedBuilding === b.id
  if (!hot && !sel) return null
  const r = Math.max(b.size[0], b.size[1]) * 0.6 + 0.8
  const color = sel ? MERIDIAN.red : MERIDIAN.brass
  return (
    <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r, r + 0.6, 48]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={sel ? 0.9 : 0.45} transparent opacity={0.8} depthWrite={false} />
    </mesh>
  )
}

// Ground overlays are stacked at DISTINCT, increasing y so overlapping regions never
// share a plane (Gate-C defect A: all overlays were coplanar at y=0.02 → z-fighting
// that flickered on the Production transition). Steps of ~0.02 m are imperceptible but
// well above the depth-buffer precision at these camera distances; every overlapping
// pair gets a clear top surface. polygonOffset on the paint layer is belt-and-braces.
function Road({ x, y, z, w, d, m }: { x: number; y: number; z: number; w: number; d: number; m: Material }): JSX.Element {
  return (
    <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={m}>
      <planeGeometry args={[w, d]} />
    </mesh>
  )
}

function MeridianGround(): JSX.Element {
  const g = GROUND
  const bz = (g.boulevard.z0 + g.boulevard.z1) / 2
  const bd = g.boulevard.z1 - g.boulevard.z0
  const paint = mat(MERIDIAN.markings, { rough: 1, polyOffset: -2 })
  return (
    <group>
      {/* base ground (the single authoritative lawn plane) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={M.lawn()}>
        <planeGeometry args={[g.size, g.size]} />
      </mesh>
      {/* y-stack: verge 0.02 < plaza 0.04 < boulevard 0.06 < crossroad 0.08 <
          apron-edge 0.10 < apron 0.12; paint lines sit just above their road */}
      <Road x={g.boulevard.x} y={0.02} z={bz} w={g.boulevard.halfW * 2 + 4} d={bd} m={M.path()} />
      <Road x={-2} y={0.04} z={-11} w={14} d={7} m={M.plaza()} />
      <Road x={g.boulevard.x} y={0.06} z={bz} w={g.boulevard.halfW * 2} d={bd} m={M.asphalt()} />
      <Road x={g.boulevard.x} y={0.13} z={bz} w={0.25} d={bd} m={paint} />
      <Road x={(g.crossRoad.x0 + g.crossRoad.x1) / 2} y={0.08} z={g.crossRoad.z} w={g.crossRoad.x1 - g.crossRoad.x0} d={g.crossRoad.halfW * 2} m={M.asphalt()} />
      {/* loading apron: painted edge (0.10) under warm asphalt (0.12) so the edge shows as a border */}
      <Road x={g.apron.cx} y={0.10} z={g.apron.cz} w={g.apron.w + 0.6} d={g.apron.d + 0.6} m={paint} />
      <Road x={g.apron.cx} y={0.12} z={g.apron.cz} w={g.apron.w} d={g.apron.d} m={M.asphalt()} />
      {/* a small fountain in the plaza */}
      <mesh position={[-2, 0.2, -11]} material={M.plaza()} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.4, 20]} />
      </mesh>
      <mesh position={[-2, 0.45, -11]} material={M.glass()}>
        <cylinderGeometry args={[1.3, 1.3, 0.1, 20]} />
      </mesh>
    </group>
  )
}

// sage shade tree (authored, cheap): trunk + two flat-shaded foliage tiers
function Tree({ pos, h = 6 }: { pos: [number, number, number]; h?: number }): JSX.Element {
  return (
    <group position={pos}>
      <mesh position={[0, h * 0.28, 0]} castShadow material={M.wood()}>
        <cylinderGeometry args={[0.16, 0.24, h * 0.56, 7]} />
      </mesh>
      <mesh position={[0, h * 0.6, 0]} castShadow material={mat(MERIDIAN.lawnEdge, { rough: 1, flatShading: true })}>
        <coneGeometry args={[h * 0.34, h * 0.5, 8]} />
      </mesh>
      <mesh position={[0, h * 0.84, 0]} castShadow material={mat(MERIDIAN.lawn, { rough: 1, flatShading: true })}>
        <coneGeometry args={[h * 0.24, h * 0.42, 8]} />
      </mesh>
    </group>
  )
}

// low sage hedge
function Hedge({ pos, w, d }: { pos: [number, number, number]; w: number; d: number }): JSX.Element {
  return (
    <mesh position={[pos[0], 0.5, pos[2]]} castShadow receiveShadow material={mat(MERIDIAN.lawnEdge, { rough: 1 })}>
      <boxGeometry args={[w, 1, d]} />
    </mesh>
  )
}

function Landscaping(): JSX.Element {
  // Trees + hedges come from layout.TREES / layout.HEDGES — the SAME data the route
  // validator treats as obstacles (Gate-C defect B), so no authored route crosses a
  // trunk or hedge. Positions are kept clear of the ambient loops and the apron cast
  // band (validated by window.__spike.validateRoutes / capture.mjs).
  return (
    <group>
      {TREES.map((p, i) => (
        <Tree key={`bt${i}`} pos={[p[0], 0, p[1]]} h={i % 3 === 0 ? 8 : 6.5} />
      ))}
      {HEDGES.map((h, i) => (
        <Hedge key={`hg${i}`} pos={[h.pos[0], 0, h.pos[1]]} w={h.w} d={h.d} />
      ))}
    </group>
  )
}

export function Buildings(): JSX.Element {
  return (
    <group>
      <MeridianGround />
      <Landscaping />
      <group position={[WATER_TOWER.pos[0], 0, WATER_TOWER.pos[1]]}>
        <WaterTower height={WATER_TOWER.height} />
      </group>
      {BUILDINGS.map((b) => (
        <group
          key={b.id}
          position={[b.pos[0], 0, b.pos[1]]}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
            if (b.selectable) hover(b.id)
          }}
          onPointerOut={() => b.selectable && state.hovered === b.id && hover(null)}
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
            if (b.selectable) selectBuilding(b.id)
          }}
        >
          <KitBuilding b={b} />
          <SelectionRing b={b} />
        </group>
      ))}
    </group>
  )
}
