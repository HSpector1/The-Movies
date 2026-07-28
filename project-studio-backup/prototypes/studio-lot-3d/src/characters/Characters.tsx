// ── Greybox characters (M1) ───────────────────────────────────────────────────
// Placeholder figures (capsule + head + role prop), distinguishable by silhouette/
// colour/prop, with minimal deterministic motion. Ambient roam small loops; five
// vignette actors are driven by the deterministic director. Click to inspect
// (cosmetic card only). NOT final art. No Math.random.

import { useRef, type ReactNode, type JSX } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Group, PointLight, Mesh } from 'three'
import { state, selectCharacter } from '../app/store'
import { sampleVignette } from '../vignette/director'
import { STAGE_A, propPos, APRON_CREW, TRAILER_POS } from '../scene/layout'
import type { CharacterInfo } from '../types/snapshot'
import { Crew } from '../m3/Crew'
import { CHARACTER_ROOT_SCALE } from '../env/scale'
import { M, MERIDIAN, mat } from '../env/materials'

// role → wardrobe tint (multiplied onto the Kenney texture for base differentiation;
// role identity is then reinforced by hats, carried props, clip/stance, and grouping)
const ROLE = {
  crew: '#7c8596',
  grip: '#8a7a5c',
  office: '#b09468',
  talent: '#ece3d0',
  director: '#5a4a38',
  photographer: '#6a6258',
  driver: '#9a6a48',
}

// A person = the normalized Kenney crew (reads as a human at 1.8 m) + optional hat.
// `color` is the wardrobe tint; `clip` the stance/motion. Kept named `Figure` so the
// ambient/vignette/apron call sites are unchanged.
function Figure({
  color,
  hat,
  scale = 1,
  clip = 'idle',
}: {
  color: string
  hat?: string
  scale?: number
  clip?: string
}): JSX.Element {
  return (
    <group>
      <Crew position={[0, 0, 0]} clip={clip} tint={color} scale={CHARACTER_ROOT_SCALE * scale} />
      {hat && (
        <group position={[0, 1.62 * scale, 0]}>
          <mesh castShadow material={mat(hat, { rough: 0.9 })}>
            <cylinderGeometry args={[0.16, 0.18, 0.16, 12]} />
          </mesh>
          <mesh position={[0, -0.06, 0]} castShadow material={mat(hat, { rough: 0.9 })}>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 12]} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// carried props use the SHARED material cache (mat()) so ~14 crew don't each allocate
// fresh materials.
function Prop({ role }: { role: keyof typeof ROLE }): JSX.Element | null {
  switch (role) {
    case 'office':
      return (
        <mesh position={[0.32, 1.0, 0.18]} castShadow material={mat('#f1e6cc', { rough: 0.8 })}>
          <boxGeometry args={[0.04, 0.32, 0.24]} />
        </mesh>
      )
    case 'photographer':
      return (
        <mesh position={[0.2, 1.5, 0.28]} castShadow material={mat('#1c1712', { rough: 0.6, metal: 0.2 })}>
          <boxGeometry args={[0.34, 0.24, 0.24]} />
        </mesh>
      )
    case 'grip':
      return (
        <group position={[0.5, 0, 0.1]}>
          <mesh position={[0, 0.45, 0]} castShadow material={mat('#2b2620', { rough: 0.9 })}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
          </mesh>
          <mesh position={[0, 0.16, 0]} material={mat('#6d6459', { rough: 0.8 })}>
            <boxGeometry args={[0.6, 0.08, 0.5]} />
          </mesh>
        </group>
      )
    default:
      return null
  }
}

type LoopPt = { x: number; z: number }
function AmbientChar({
  id,
  role,
  path,
  speed,
  phase,
}: {
  id: string
  role: keyof typeof ROLE
  path: LoopPt[]
  speed: number
  phase: number
}): JSX.Element {
  const ref = useRef<Group>(null)
  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime * speed + phase
    // total loop length
    let total = 0
    for (let i = 0; i < path.length; i++) total += dist(path[i], path[(i + 1) % path.length])
    let d = ((t % total) + total) % total
    let seg = 0
    while (d > dist(path[seg], path[(seg + 1) % path.length])) {
      d -= dist(path[seg], path[(seg + 1) % path.length])
      seg = (seg + 1) % path.length
    }
    const a = path[seg]
    const b = path[(seg + 1) % path.length]
    const segLen = dist(a, b) || 1
    const u = d / segLen
    const x = a.x + (b.x - a.x) * u
    const z = a.z + (b.z - a.z) * u
    ref.current.position.set(x, Math.sin(s.clock.elapsedTime * 6 + phase) * 0.03, z)
    ref.current.rotation.y = Math.atan2(b.x - a.x, b.z - a.z)
  })
  return (
    <group ref={ref}>
      <Selectable info={{ id, role: label(role), activity: 'On the lot' }}>
        <Figure color={ROLE[role]} hat={hatFor(role)} clip="walk" />
        <Prop role={role} />
      </Selectable>
    </group>
  )
}

function VignetteActor({
  which,
  id,
  role,
  production,
}: {
  which: 'director' | 'actorA' | 'actorB' | 'slate' | 'approacher'
  id: string
  role: string
  production: string
}): JSX.Element {
  const ref = useRef<Group>(null)
  useFrame((s) => {
    if (!ref.current) return
    const f = sampleVignette(state.vignette.t)
    const a = f[which]
    ref.current.visible = a.visible
    if (!a.visible) return
    // slate "clap" pop at the flash; director/actors small idle sway during take
    const bob = which === 'slate' && f.flash > 0 ? f.flash * 0.15 : Math.sin(s.clock.elapsedTime * 5 + a.x) * 0.03
    ref.current.position.set(a.x, bob, a.z)
    ref.current.rotation.y = a.face + Math.PI / 2
  })
  const roleKey: keyof typeof ROLE =
    which === 'director' ? 'director' : which === 'slate' || which === 'approacher' ? 'crew' : 'talent'
  const clip = which === 'director' ? 'gesture' : which === 'approacher' ? 'walk' : which === 'slate' ? 'gesture' : 'idle'
  return (
    <group ref={ref} visible={false}>
      <Selectable info={{ id, role, activity: 'On set', production, building: 'Soundstage A' }}>
        <Figure color={ROLE[roleKey]} hat={hatFor(roleKey)} clip={clip} />
        {which === 'slate' && (
          <mesh position={[0.3, 1.15, 0.2]} castShadow>
            <boxGeometry args={[0.05, 0.3, 0.36]} />
            <meshStandardMaterial color="#241a12" roughness={0.7} />
          </mesh>
        )}
      </Selectable>
    </group>
  )
}

function Van(): JSX.Element {
  const ref = useRef<Group>(null)
  useFrame(() => {
    if (!ref.current) return
    const f = sampleVignette(state.vignette.t)
    ref.current.visible = f.van.visible
    if (!f.van.visible) return
    ref.current.position.set(f.van.x, 0, f.van.z)
    ref.current.rotation.y = f.van.face + Math.PI / 2
  })
  return (
    <group ref={ref} visible={false}>
      <Selectable info={{ id: 'char-van', role: 'Studio Driver', activity: 'Delivering to the stage', production: 'Gilded Horizon', building: 'Soundstage A' }}>
        <mesh position={[0, 1.1, 0]} castShadow material={mat('#9c4a3a', { rough: 0.7 })}>
          <boxGeometry args={[2.2, 1.6, 4.2]} />
        </mesh>
        <mesh position={[0, 1.9, 1.0]} castShadow material={M.stucco()}>
          <boxGeometry args={[2.0, 1.0, 1.6]} />
        </mesh>
        {/* MERIDIAN crest-red door panel */}
        <mesh position={[1.11, 1.1, -0.6]} material={mat(MERIDIAN.creamStucco, { rough: 0.8 })}>
          <boxGeometry args={[0.02, 0.9, 1.6]} />
        </mesh>
        {[-1.0, 1.0].map((dx) =>
          [-1.4, 1.4].map((dz) => (
            <mesh key={`${dx},${dz}`} position={[dx, 0.4, dz]} castShadow material={mat('#1c1712', { rough: 0.8 })}>
              <cylinderGeometry args={[0.4, 0.4, 0.3, 12]} />
            </mesh>
          )),
        )}
      </Selectable>
    </group>
  )
}

function StageFx(): JSX.Element {
  const light = useRef<PointLight>(null)
  const bulb = useRef<Group>(null)
  const flash = useRef<PointLight>(null)
  const spill = useRef<PointLight>(null)
  const doorL = useRef<Mesh>(null)
  const doorR = useRef<Mesh>(null)
  const glow = useRef<Mesh>(null)
  useFrame((s) => {
    const f = sampleVignette(state.vignette.t)
    const on = f.recording && state.vignette.active
    // doors are physically open ONLY during the take; closed the rest of the time.
    // characters may enter (actorA/B doorway keys) only while this is true.
    const open = f.doorOpen && state.vignette.active
    if (light.current) light.current.intensity = on ? 6 + Math.sin(s.clock.elapsedTime * 6) * 2 : 0
    if (bulb.current) bulb.current.visible = on
    if (flash.current) flash.current.intensity = state.vignette.active ? f.flash * 40 : 0
    // closed door leaves cover the opening; interior spill + warm glow only when open
    if (doorL.current) doorL.current.visible = !open
    if (doorR.current) doorR.current.visible = !open
    if (glow.current) glow.current.visible = open
    if (spill.current) spill.current.intensity = open ? 3.8 : 0
  })
  const [dx, , dz] = STAGE_A.doorCentre
  // recess opening on the −X face: ~8 m tall, ~12 m wide, centred at y≈4.4
  const leafH = 8
  const leafW = 6
  const leafY = 4.4
  return (
    <group>
      <group ref={bulb} position={[dx - 0.4, 9.2, dz]} visible={false}>
        <mesh>
          <sphereGeometry args={[0.35, 12, 8]} />
          <meshStandardMaterial color="#e64b3c" emissive="#e64b3c" emissiveIntensity={2} />
        </mesh>
      </group>
      {/* warm interior glow panel — visible only when the door is open (reads as a lit
          stage from overview + fills the dark door void up close) */}
      <mesh ref={glow} position={[dx - 0.35, leafY, dz]} visible={false}>
        <boxGeometry args={[0.1, leafH - 1, leafW - 0.4]} />
        <meshStandardMaterial color="#f6e4a6" emissive="#f6e4a6" emissiveIntensity={0.95} toneMapped={false} />
      </mesh>
      {/* two sliding door leaves — shown (closed) unless the door is open for the take */}
      <mesh ref={doorL} position={[dx - 0.06, leafY, dz - leafW / 2]} castShadow>
        <boxGeometry args={[0.3, leafH, leafW]} />
        <meshStandardMaterial color="#c7bd9a" roughness={0.92} />
      </mesh>
      <mesh ref={doorR} position={[dx - 0.06, leafY, dz + leafW / 2]} castShadow>
        <boxGeometry args={[0.3, leafH, leafW]} />
        <meshStandardMaterial color="#c2b892" roughness={0.92} />
      </mesh>
      <pointLight ref={light} position={[dx - 1, 6, dz]} color="#ff5a3c" intensity={0} distance={22} />
      {/* warm interior spill just inside the open doors (only when open) */}
      <pointLight ref={spill} position={[dx - 1.2, 4, dz]} color="#f6e4a6" intensity={0} distance={14} />
      <pointLight ref={flash} position={[dx - 1.5, 2.2, dz + 1.5]} color="#fff4d0" intensity={0} distance={16} />
    </group>
  )
}

// production gear cluster (static props on the apron during the slice) — placed at
// the authored apron-prop position (registered as a route obstacle in layout.ts)
function Gear(): JSX.Element {
  const [gx, gz] = propPos('gear')
  return (
    <group position={[gx, 0, gz]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#2b2620" roughness={0.9} />
      </mesh>
      <mesh position={[1, 0.3, 0.4]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.9]} />
        <meshStandardMaterial color="#5e6b6a" roughness={0.8} />
      </mesh>
      {/* light stand */}
      <mesh position={[-0.9, 1.1, 0.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 8]} />
        <meshStandardMaterial color="#4a443c" roughness={0.7} />
      </mesh>
      <mesh position={[-0.9, 2.2, 0.2]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.3]} />
        <meshStandardMaterial color="#f6e6b0" emissive="#f6e6b0" emissiveIntensity={0.3} />
      </mesh>
      {/* cones */}
      {[-2, 2].map((cx) => (
        <mesh key={cx} position={[cx, 0.25, -1]} castShadow material={mat('#c86a3c', { rough: 0.9 })}>
          <coneGeometry args={[0.22, 0.5, 8]} />
        </mesh>
      ))}
    </group>
  )
}

// talent trailer — parked on the apron CLEAR of the human-camera sightline (the M1
// STAGE_A.trailer anchor at (7,12) sat inside the human camera at (5.5,3.4,14),
// occluding the whole shot). Meridian palette.
function Trailer(): JSX.Element {
  return (
    <group position={[TRAILER_POS[0], 0, TRAILER_POS[2]]} rotation={[0, 0.15, 0]}>
      <mesh position={[0, 1.7, 0]} castShadow receiveShadow material={M.stucco()}>
        <boxGeometry args={[2.4, 2.6, 5.2]} />
      </mesh>
      <mesh position={[0, 3.05, 0]} castShadow material={M.metal()}>
        <boxGeometry args={[2.5, 0.2, 5.3]} />
      </mesh>
      {/* signature-red stripe + window */}
      <mesh position={[1.21, 2.0, 0]} material={M.red()}>
        <boxGeometry args={[0.02, 0.5, 5.2]} />
      </mesh>
      <mesh position={[1.21, 1.9, 1.4]} material={M.glass()}>
        <boxGeometry args={[0.03, 0.9, 1.1]} />
      </mesh>
      {[-1.7, 1.7].map((z) => (
        <mesh key={z} position={[0, 0.4, z]} castShadow material={mat('#22201c', { rough: 0.9 })}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 14]} />
        </mesh>
      ))}
    </group>
  )
}

function Selectable({ info, children }: { info: CharacterInfo; children: ReactNode }): JSX.Element {
  return (
    <group
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        const p = e.eventObject.getWorldPosition(e.eventObject.position.clone())
        selectCharacter(info, [p.x, p.y, p.z])
      }}
    >
      {children}
    </group>
  )
}

// Authored ambient loops. Every segment must stay clear of building footprints
// (validated by window.__spike.validateRoutes / tools/capture.mjs). crew2 runs the
// far service edge (x=30, outside the stage x∈[12,28]); grip hauls along the −X
// apron approach (x=6). This is authored routing, NOT a traffic/path sim.
export type AmbientRoute = { id: string; role: keyof typeof ROLE; speed: number; phase: number; path: LoopPt[] }
export const AMBIENT_ROUTES: AmbientRoute[] = [
  { id: 'char-crew1', role: 'crew', speed: 1.1, phase: 0, path: [{ x: -2, z: -6 }, { x: 6, z: -6 }, { x: 6, z: -1 }] },
  { id: 'char-crew2', role: 'crew', speed: 0.9, phase: 2, path: [{ x: 30, z: -4 }, { x: 30, z: 6 }] },
  { id: 'char-grip', role: 'grip', speed: 0.8, phase: 1, path: [{ x: 6, z: 12 }, { x: 6, z: 18 }] },
  { id: 'char-office', role: 'office', speed: 1.0, phase: 3, path: [{ x: -8, z: 12 }, { x: -2, z: 12 }, { x: -2, z: 18 }, { x: -8, z: 18 }] },
  { id: 'char-talent', role: 'talent', speed: 0.7, phase: 1.5, path: [{ x: -6, z: 5 }, { x: -11, z: -1 }] },
  { id: 'char-photog', role: 'photographer', speed: 0.9, phase: 2.5, path: [{ x: -2, z: 19 }, { x: 4, z: 19 }] },
]

export function Characters(): JSX.Element {
  return (
    <group>
      {/* ambient roles (always present) — see AMBIENT_ROUTES */}
      {AMBIENT_ROUTES.map((r) => (
        <AmbientChar key={r.id} id={r.id} role={r.role} speed={r.speed} phase={r.phase} path={r.path} />
      ))}

      {/* deterministic vignette cast */}
      <Van />
      <VignetteActor which="director" id="char-director" role="Director" production="Gilded Horizon" />
      <VignetteActor which="actorA" id="char-actorA" role="Actor" production="Gilded Horizon" />
      <VignetteActor which="actorB" id="char-actorB" role="Actor" production="Gilded Horizon" />
      <VignetteActor which="slate" id="char-slate" role="Crew — slating" production="Gilded Horizon" />
      {/* approacher: demonstrates a closed door blocking entry (waits, then reroutes) */}
      <VignetteActor which="approacher" id="char-approacher" role="Production Crew" production="Gilded Horizon" />

      <Gear />
      <Trailer />
      <ApronCrew />
      <FilmCamera />
      <ProductionRig />
      <StageFx />
    </group>
  )
}

// tall filming apparatus that reads as PRODUCTION from overview distance (Gate-C
// correction): a camera crane/boom + lighting stands + a monitor, on the apron
// (x<12, clear of footprints/routes). This is what makes the active stage legible
// as "a shoot" from the management view, not just via the highlight ring.
function ProductionRig(): JSX.Element {
  const dark = mat('#2b2620', { rough: 0.7 })
  const [cx, cz] = propPos('crane')
  const [m1x, m1z] = propPos('monitor')
  return (
    <group>
      {/* camera crane (Gate-C defect D: taller mast + longer boom + clearer head +
          counterweight so it reads as filming apparatus from overview). Base is a
          registered route obstacle; the boom reaches OVER the apron toward the stage
          door (head stays clear of the stage wall at x=12), well above head height. */}
      <group position={[cx, 0, cz]} rotation={[0, 1.15, 0]}>
        <mesh position={[0, 0.4, 0]} castShadow material={dark}>
          <boxGeometry args={[1.4, 0.8, 1.4]} />
        </mesh>
        {/* vertical mast/pedestal */}
        <mesh position={[0, 1.9, 0]} castShadow material={M.metal()}>
          <boxGeometry args={[0.34, 2.2, 0.34]} />
        </mesh>
        <mesh position={[0, 3.0, 0]} castShadow material={dark}>
          <cylinderGeometry args={[0.36, 0.42, 0.5, 10]} />
        </mesh>
        {/* boom pivots ~3 m up and rakes up over the apron */}
        <group position={[0, 3.0, 0]} rotation={[0.5, 0, 0]}>
          <mesh position={[0, 0, 2.4]} castShadow material={M.metal()}>
            <boxGeometry args={[0.2, 0.2, 5.4]} />
          </mesh>
          {/* camera head + lens */}
          <mesh position={[0, 0, 5.2]} castShadow material={dark}>
            <boxGeometry args={[0.7, 0.7, 1.0]} />
          </mesh>
          <mesh position={[0, 0, 5.85]} rotation={[Math.PI / 2, 0, 0]} castShadow material={dark}>
            <cylinderGeometry args={[0.16, 0.2, 0.5, 12]} />
          </mesh>
          {/* counterweight on the short arm */}
          <mesh position={[0, 0, -1.1]} castShadow material={dark}>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
          </mesh>
        </group>
      </group>
      {/* tall lighting stands with warm lamp heads (read at overview) */}
      {(['light1', 'light2'] as const).map((id, i) => {
        const [x, z] = propPos(id)
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 2, 0]} castShadow material={dark}>
              <cylinderGeometry args={[0.05, 0.09, 4, 8]} />
            </mesh>
            <mesh position={[0, 4, 0]} castShadow material={M.metal()}>
              <boxGeometry args={[0.75, 0.75, 0.45]} />
            </mesh>
            <mesh position={[0, 4, 0.24]} material={M.litWindow()}>
              <boxGeometry args={[0.55, 0.55, 0.06]} />
            </mesh>
            <pointLight position={[0, 4, 0.6]} intensity={1.6} distance={9} color={MERIDIAN.litWindow} />
          </group>
        )
      })}
      {/* a low video monitor / cart by the crane */}
      <mesh position={[m1x, 0.6, m1z]} castShadow material={dark}>
        <boxGeometry args={[0.7, 1.1, 0.5]} />
      </mesh>
    </group>
  )
}

// static working-stage crew (always at the active stage) — Gate-A correction:
// makes "a crew is filming" read from people, not only the recording light.
function ApronCrew(): JSX.Element {
  // all spots stay at x<12 — in front of the doors, never inside the stage footprint.
  // Spread toward the human-camera target (≈[12,1.5,6.5]) so the human-scale view
  // frames a crew, not a bare wall.
  const spots = APRON_CREW
  return (
    <group>
      {spots.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, Math.atan2(11.9 - x, 0 - z), 0]}>
          <Selectable info={{ id: `char-crew-apron-${i}`, role: 'Production Crew', activity: 'On set', production: 'Gilded Horizon', building: 'Soundstage A' }}>
            <Figure color={ROLE.crew} hat="#4a3f30" clip="idle" />
          </Selectable>
        </group>
      ))}
    </group>
  )
}

// film camera on a tripod near the doors — a clear "we are filming" silhouette.
function FilmCamera(): JSX.Element {
  const [fx, fz] = propPos('filmCamera')
  return (
    <group position={[fx, 0, fz]} rotation={[0, Math.PI / 2, 0]}>
      {[-0.35, 0.35].map((dx) => (
        <mesh key={dx} position={[dx, 0.7, 0.2]} rotation={[0.28, 0, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.5, 8]} />
          <meshStandardMaterial color="#2b2620" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.7, -0.35]} rotation={[-0.28, 0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.5, 8]} />
        <meshStandardMaterial color="#2b2620" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.7]} />
        <meshStandardMaterial color="#1c1712" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.55, 0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.4, 12]} />
        <meshStandardMaterial color="#0e0b07" roughness={0.4} />
      </mesh>
      {/* film reel on top */}
      <mesh position={[0, 1.85, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
        <meshStandardMaterial color="#2b2620" roughness={0.6} />
      </mesh>
    </group>
  )
}

function dist(a: LoopPt, b: LoopPt): number {
  return Math.hypot(b.x - a.x, b.z - a.z)
}
function label(role: keyof typeof ROLE): string {
  return { crew: 'Production Crew', grip: 'Grip', office: 'Office Staff', talent: 'Talent', director: 'Director', photographer: 'Publicity Photographer', driver: 'Studio Driver' }[role]
}
function hatFor(role: keyof typeof ROLE): string | undefined {
  if (role === 'crew') return '#d8b04a'
  if (role === 'director') return '#2f2419'
  if (role === 'photographer') return '#2f2a22'
  return undefined
}
