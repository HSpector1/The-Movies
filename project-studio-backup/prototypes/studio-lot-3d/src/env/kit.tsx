// ── MeridianEnvironmentKit ────────────────────────────────────────────────────
// Reusable, code-authored Three.js geometry modules for the hero Meridian buildings
// (Tier-1). No DCC, no external models — Shape/Extrude + primitives, sharing the
// Meridian material library. Composed building components render CENTRED at local
// origin, sized to the M1 layout footprint (w × d) and scale-sheet height, so the M1
// footprints, routing, and camera stay unchanged. Doc: docs/M3-MATERIAL-LIBRARY.md.

import { useMemo, type JSX } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { M, MERIDIAN } from './materials'
import { SCALE } from './scale'

// ── small reusable primitives ─────────────────────────────────────────────────

function Box({ w, h, d, pos = [0, 0, 0], mat: m, rotY = 0 }: { w: number; h: number; d: number; pos?: [number, number, number]; mat: THREE.Material; rotY?: number }): JSX.Element {
  return (
    <mesh position={pos} rotation={[0, rotY, 0]} material={m} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
    </mesh>
  )
}

/** vertical Deco fins across a façade (brass-tipped pilasters) */
function DecoFins({ w, h, d, n = 5 }: { w: number; h: number; d: number; n?: number }): JSX.Element {
  const fins = []
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (i + 0.5) * (w / n)
    fins.push(<Box key={i} w={0.3} h={h} d={0.25} pos={[x, h / 2, d / 2]} mat={M.stuccoShadow()} />)
    fins.push(<Box key={`t${i}`} w={0.34} h={0.5} d={0.3} pos={[x, h - 0.25, d / 2]} mat={M.brass()} />)
  }
  return <group>{fins}</group>
}

/** stepped Deco crown (ziggurat cap) */
function SteppedCrown({ w, d, base = 0, steps = 3, unit = 0.6 }: { w: number; d: number; base?: number; steps?: number; unit?: number }): JSX.Element {
  const s = []
  for (let i = 0; i < steps; i++) {
    const sw = w * (1 - i * 0.22)
    const sd = d * (1 - i * 0.22)
    s.push(<Box key={i} w={sw} h={unit} d={sd} pos={[0, base + unit / 2 + i * unit, 0]} mat={i === steps - 1 ? M.brass() : M.taupe()} />)
  }
  return <group>{s}</group>
}

function Windows({ w, h, rows, cols, z, lit = false }: { w: number; h: number; rows: number; cols: number; z: number; lit?: boolean }): JSX.Element {
  const items = []
  const mw = (w * 0.7) / cols
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = -w * 0.35 + (c + 0.5) * ((w * 0.7) / cols)
      const y = h * 0.28 + r * (h * 0.5 / Math.max(1, rows))
      items.push(<Box key={`${r},${c}`} w={mw * 0.7} h={h * 0.22} d={0.1} pos={[x, y, z]} mat={lit && (r + c) % 3 === 0 ? M.litWindow() : M.glass()} />)
    }
  }
  return <group>{items}</group>
}

/** terracotta hip/gable roof (a shallow pyramid) */
function TerracottaRoof({ w, d, h = 1.8, y }: { w: number; d: number; h?: number; y: number }): JSX.Element {
  return (
    <mesh position={[0, y + h / 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow material={M.terracotta()}>
      <coneGeometry args={[Math.max(w, d) * 0.66, h, 4]} />
    </mesh>
  )
}

// ── crest (the Meridian mark — a lion-free original: a brass "M" on a red shield) ─
function MeridianCrest({ size = 1.4, z = 0 }: { size?: number; z?: number }): JSX.Element {
  const shield = useMemo(() => {
    const s = new THREE.Shape()
    const w = size,
      h = size * 1.2
    s.moveTo(-w / 2, h / 2)
    s.lineTo(w / 2, h / 2)
    s.lineTo(w / 2, -h / 6)
    s.quadraticCurveTo(w / 2, -h / 2, 0, -h / 2)
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2, -h / 6)
    s.lineTo(-w / 2, h / 2)
    return new THREE.ShapeGeometry(s)
  }, [size])
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={shield} material={M.red()} />
      <mesh geometry={shield} scale={0.82} position={[0, 0, 0.02]} material={M.brass()} />
      <Text position={[0, 0, 0.05]} fontSize={size * 0.82} color="#2a2018" anchorX="center" anchorY="middle" fontWeight="bold">
        M
      </Text>
    </group>
  )
}

// ── composed hero buildings ───────────────────────────────────────────────────

/** Meridian gate: two Deco piers + an arched header with MERIDIAN PICTURES lettering,
 *  banners, and a guard booth. Spans X (w), thin in Z (d). Clearance ~5 m. */
export function GateBuilding({ w, d, height }: { w: number; d: number; height: number }): JSX.Element {
  const pierW = 1.6
  const arch = useMemo(() => {
    const clearance = SCALE.GATE_CLEARANCE
    const span = w - pierW * 2
    const s = new THREE.Shape()
    s.moveTo(-span / 2, 0)
    s.lineTo(-span / 2, clearance - 1)
    s.quadraticCurveTo(0, clearance + 1.2, span / 2, clearance - 1)
    s.lineTo(span / 2, 0)
    s.lineTo(span / 2 - 0.1, 0)
    s.quadraticCurveTo(0, clearance + 0.6, -span / 2 + 0.1, 0)
    s.closePath()
    return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false })
  }, [w, d])
  return (
    <group>
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * (w / 2 - pierW / 2), 0, 0]}>
          <Box w={pierW} h={height} d={d + 0.6} pos={[0, height / 2, 0]} mat={M.stucco()} />
          <SteppedCrown w={pierW} d={d + 0.6} base={height} steps={2} unit={0.5} />
          <MeridianCrest size={1.2} z={d / 2 + 0.35} />
        </group>
      ))}
      {/* header band across the top with the arch cutout */}
      <Box w={w - pierW * 1.2} h={1.9} d={d} pos={[0, height - 1.4, 0]} mat={M.stucco()} />
      <mesh geometry={arch} position={[0, 0, -d / 2]} material={M.stuccoShadow()} />
      <Text position={[0, height - 1.4, d / 2 + 0.06]} fontSize={0.92} color={MERIDIAN.brassDark} anchorX="center" anchorY="middle" letterSpacing={0.02} fontWeight="bold" maxWidth={w}>
        MERIDIAN PICTURES
      </Text>
      {/* guard booth just inside a pier */}
      <group position={[-w / 2 + pierW + 1.2, 0, -d]}>
        <Box w={1.6} h={2.6} d={1.6} pos={[0, 1.3, 0]} mat={M.stucco()} />
        <Box w={1.8} h={0.3} d={1.8} pos={[0, 2.7, 0]} mat={M.terracotta()} />
      </group>
      {/* signature-red banners on the piers */}
      {[-1, 1].map((sx) => (
        <Box key={sx} w={0.8} h={3} d={0.1} pos={[sx * (w / 2 - pierW / 2), height - 3, d / 2 + 0.3]} mat={M.red()} />
      ))}
    </group>
  )
}

/** Deco administration: symmetrical mass, central stepped tower, brass fins + string
 *  courses, forecourt steps + crest. */
export function AdminBuilding({ w, d, height }: { w: number; d: number; height: number }): JSX.Element {
  const bodyH = height * 0.62
  const towerW = w * 0.34
  return (
    <group>
      {/* wings */}
      <Box w={w} h={bodyH} d={d} pos={[0, bodyH / 2, 0]} mat={M.stucco()} />
      <Windows w={w} h={bodyH} rows={2} cols={8} z={d / 2 + 0.05} lit />
      {/* brass string course */}
      <Box w={w + 0.2} h={0.28} d={d + 0.2} pos={[0, bodyH, 0]} mat={M.brass()} />
      {/* central tower */}
      <Box w={towerW} h={height} d={d * 0.8} pos={[0, height / 2, -d * 0.05]} mat={M.stucco()} />
      <DecoFins w={towerW * 0.9} h={height * 0.9} d={d * 0.8} n={5} />
      <SteppedCrown w={towerW} d={d * 0.8} base={height} steps={3} unit={0.7} />
      <MeridianCrest size={2.0} z={d * 0.4 + 0.06} />
      {/* entrance + forecourt steps */}
      <Box w={2.4} h={bodyH * 0.5} d={0.3} pos={[0, bodyH * 0.25, d / 2 + 0.1]} mat={M.darkInterior()} />
      {[0, 1, 2].map((i) => (
        <Box key={i} w={w * 0.5 - i} h={0.3} d={1} pos={[0, 0.15 + i * 0.3, d / 2 + 1.6 - i * 0.5]} mat={M.plaza()} />
      ))}
    </group>
  )
}

/** Buff barrel-vault soundstage: battened walls, a recessed elephant-door opening on
 *  the −X face (the ANIMATED leaves + spill are owned by StageFx in Characters.tsx,
 *  aligned to STAGE_A.doorCentre), a STAGE number on the door face + a gable sign
 *  readable from overview, and rooftop vents. Keeps the M1 footprint/vault transform. */
export function Soundstage({ w, d, height, number = 2 }: { w: number; d: number; height: number; number?: number }): JSX.Element {
  const wallH = height * 0.6
  const battens = []
  const nb = Math.round(d / 1.4)
  for (let i = 0; i < nb; i++) {
    const z = -d / 2 + (i + 0.5) * (d / nb)
    battens.push(<Box key={i} w={0.12} h={wallH} d={0.12} pos={[-w / 2 - 0.02, wallH / 2, z]} mat={M.buffShadow()} />)
    battens.push(<Box key={`b${i}`} w={0.12} h={wallH} d={0.12} pos={[w / 2 + 0.02, wallH / 2, z]} mat={M.buffShadow()} />)
  }
  return (
    <group>
      {/* body */}
      <Box w={w} h={wallH} d={d} pos={[0, wallH / 2, 0]} mat={M.buff()} />
      {battens}
      {/* barrel vault (unchanged M1 transform) */}
      <mesh position={[0, wallH, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={M.buff()}>
        <cylinderGeometry args={[w / 2, w / 2, d, 28, 1, false, 0, Math.PI]} />
      </mesh>
      {/* recessed elephant-door opening on −X face (StageFx supplies the moving leaves,
          ≈12 w × 8 h centred at y≈4.4). Just the dark opening + a thin brass frame —
          NOT a big flat surround (the near-horizontal human camera looks straight into
          this face, so a large flat wall would read as a blank plane). */}
      <Box w={0.3} h={8} d={12} pos={[-w / 2, 4.4, 0]} mat={M.darkInterior()} />
      {/* thin frame around the opening */}
      <Box w={0.34} h={0.4} d={12.6} pos={[-w / 2 - 0.02, 8.4, 0]} mat={M.brassDark()} />
      {[-6.2, 6.2].map((z) => (
        <Box key={z} w={0.34} h={8.4} d={0.4} pos={[-w / 2 - 0.02, 4.2, z]} mat={M.brassDark()} />
      ))}
      {/* STAGE number on the −X (door) face, above the opening */}
      <Box w={0.2} h={2} d={3.4} pos={[-w / 2 - 0.12, wallH - 0.4, 0]} mat={M.red()} />
      <Text position={[-w / 2 - 0.24, wallH - 0.4, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={1.5} color={MERIDIAN.litWindow} anchorX="center" anchorY="middle" fontWeight="bold">
        {String(number)}
      </Text>
      <Text position={[-w / 2 - 0.24, wallH + 1.1, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.55} color={MERIDIAN.creamStucco} anchorX="center" anchorY="middle">
        STAGE
      </Text>
      {/* gable sign on +Z face — the studio cue readable from the overview camera */}
      <Box w={5} h={1.7} d={0.2} pos={[0, wallH * 0.66, d / 2 + 0.06]} mat={M.red()} />
      <Text position={[0, wallH * 0.66, d / 2 + 0.18]} fontSize={1.05} color={MERIDIAN.litWindow} anchorX="center" anchorY="middle" fontWeight="bold" letterSpacing={0.02}>
        STAGE {number}
      </Text>
      {/* rooftop vents */}
      {[-0.25, 0.05, 0.35].map((f, i) => (
        <Box key={i} w={1.2} h={1.2} d={1.2} pos={[w * f * 0.5, height + 0.4, d * (i - 1) * 0.28]} mat={M.metal()} />
      ))}
    </group>
  )
}

/** cream stucco bungalow with terracotta hip roof, porch, windows */
export function Bungalow({ w, d, height }: { w: number; d: number; height: number }): JSX.Element {
  return (
    <group>
      <Box w={w} h={height} d={d} pos={[0, height / 2, 0]} mat={M.stucco()} />
      <TerracottaRoof w={w} d={d} y={height} h={1.6} />
      <Windows w={w} h={height} rows={1} cols={3} z={d / 2 + 0.05} />
      {/* porch: two posts + a small terracotta awning */}
      {[-w * 0.28, w * 0.28].map((x) => (
        <Box key={x} w={0.2} h={height * 0.8} d={0.2} pos={[x, height * 0.4, d / 2 + 1]} mat={M.wood()} />
      ))}
      <Box w={w * 0.7} h={0.18} d={1.2} pos={[0, height * 0.8, d / 2 + 0.7]} mat={M.terracotta()} />
      <Box w={1.2} h={height * 0.55} d={0.15} pos={[0, height * 0.275, d / 2 + 0.05]} mat={M.wood()} />
    </group>
  )
}

/** screening theater: cream mass + brass marquee canopy + vertical blade sign */
export function Theater({ w, d, height }: { w: number; d: number; height: number }): JSX.Element {
  return (
    <group>
      <Box w={w} h={height} d={d} pos={[0, height / 2, 0]} mat={M.stucco()} />
      <SteppedCrown w={w * 0.5} d={d * 0.5} base={height} steps={2} unit={0.5} />
      {/* marquee canopy */}
      <Box w={w * 0.9} h={1.2} d={2.2} pos={[0, height * 0.42, d / 2 + 1.1]} mat={M.brass()} />
      <Box w={w * 0.9} h={0.5} d={2.2} pos={[0, height * 0.42 - 0.6, d / 2 + 1.1]} mat={M.litWindow()} />
      {/* blade sign */}
      <Box w={0.5} h={height} d={1} pos={[w / 2 - 0.5, height * 0.9, d / 2 + 0.4]} mat={M.red()} />
      <Text position={[w / 2 - 0.23, height * 0.9, d / 2 + 0.4]} rotation={[0, 0, Math.PI / 2]} fontSize={0.7} color={MERIDIAN.litWindow} anchorX="center" anchorY="middle">
        MERIDIAN
      </Text>
    </group>
  )
}

/** short exterior backlot street set: varied standing façades + visible rear bracing */
export function Backlot({ w, height }: { w: number; d: number; height: number }): JSX.Element {
  const items: JSX.Element[] = []
  const n = 4
  const faceMats = [M.stucco(), M.taupe(), M.buff(), M.stuccoShadow()]
  for (let i = 0; i < n; i++) {
    const fx = -w / 2 + (i + 0.5) * (w / n)
    const fh = height * (0.68 + 0.32 * (i % 2 === 0 ? 1 : 0.55))
    const fw = w / n - 0.4
    items.push(
      <group key={i} position={[fx, 0, 0]}>
        <Box w={fw} h={fh} d={0.6} pos={[0, fh / 2, 0]} mat={faceMats[i % faceMats.length]} />
        {/* cornice */}
        <Box w={fw + 0.2} h={0.4} d={0.8} pos={[0, fh, 0]} mat={M.brassDark()} />
        <Windows w={fw} h={fh} rows={2} cols={2} z={0.35} />
        {/* rear bracing */}
        <Box w={0.16} h={fh * 1.15} d={0.16} pos={[-fw * 0.3, fh * 0.55, -1]} mat={M.wood()} rotY={0} />
        <mesh position={[fw * 0.2, fh * 0.5, -0.7]} rotation={[0.5, 0, 0]} material={M.wood()}>
          <boxGeometry args={[0.14, fh * 1.2, 0.14]} />
        </mesh>
      </group>,
    )
  }
  return <group>{items}</group>
}

/** water tower + Meridian crest on the tank — the tallest identity landmark */
export function WaterTower({ height }: { height: number }): JSX.Element {
  const tank = height * 0.3
  const legH = height - tank
  return (
    <group>
      {[-2.2, 2.2].map((dx) =>
        [-2.2, 2.2].map((dz) => (
          <mesh key={`${dx},${dz}`} position={[dx, legH / 2, dz]} castShadow material={M.metal()}>
            <cylinderGeometry args={[0.22, 0.28, legH, 8]} />
          </mesh>
        )),
      )}
      {/* cross bracing */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, legH * (0.3 + i * 0.25), 2.2]} material={M.metal()}>
          <boxGeometry args={[4.4, 0.1, 0.1]} />
        </mesh>
      ))}
      {/* tank */}
      <mesh position={[0, legH + tank / 2, 0]} castShadow material={M.buff()}>
        <cylinderGeometry args={[2.8, 2.8, tank, 20]} />
      </mesh>
      <mesh position={[0, legH + tank + 1, 0]} castShadow material={M.metal()}>
        <coneGeometry args={[2.9, 2.2, 20]} />
      </mesh>
      {/* crest band on the tank */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <MeridianCrest size={2.4} z={2.82} />
        </group>
      ))}
    </group>
  )
}
