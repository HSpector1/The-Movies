// The three demonstrations (contract §7). Data-driven from the runtime manifest.
//   Scene A — studio-lot scale + materials proof (Downtown CC0)
//   Scene B — furnished set proof (FBX props, LICENSE-UNCLEAR)
//   Scene C — animation viewer (Quaternius CC0 character + 43 clips)
import { Suspense } from 'react'
import { useLab } from './lab/LabContext'
import { ModelGLB, ModelFBX, Character } from './components/models'
import { HumanScaleRef } from './components/env'
import { Workers, type WorkerSpec } from './components/Workers'
import {
  LotGround, Paving, Road, Sidewalk, Soundstage, ProductionOffice, EntranceGate, GuardBooth,
  WaterTower, CrateStack, Cart, FilmLight, Bench, ProductionTruck, Tree, Planter,
  BacklotFacade, SceneryFlat, Banner, StagingMark,
} from './components/greybox'
import { HeroSoundstage, ProductionApron, GroundDecals, WorldEdge, HeroWorkers, type HeroCrewSpec } from './components/hero'
import { RefinedLot } from './components/refinedLot'
import { StudioSet, StudioCrew, type StudioCrewSpec } from './components/studioSlice'
import { HM } from './lab/heroMaterials'
import type { RuntimeManifest, RuntimeAsset } from './types'

const by = (m: RuntimeManifest, id: string): RuntimeAsset | undefined => m.assets.find((a) => a.id === id)

function Ground({ size = 80, color = '#171b21' }: { size?: number; color?: string }): JSX.Element {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  )
}

function Wall({ pos, size, rotY = 0 }: { pos: [number, number, number]; size: [number, number, number]; rotY?: number }): JSX.Element {
  return (
    <mesh position={pos} rotation={[0, rotY, 0]} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={'#2b303a'} roughness={0.9} />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
export function SceneA({ manifest }: { manifest: RuntimeManifest }): JSX.Element {
  const { state } = useLab()
  const g = (id: string) => by(manifest, 'downtown/' + id)
  type Opts = { rotY?: number; centerXZ?: boolean; matte?: boolean }
  const M = (id: string, pos: [number, number, number], o: Opts = {}) => {
    const a = g(id)
    return a ? <ModelGLB key={id + pos.join(',')} asset={a} position={pos} rotationY={o.rotY ?? 0} centerXZ={o.centerXZ ?? false} matte={o.matte ?? false} /> : null
  }
  const swZ = [-6, -3, 0, 3, 6]
  return (
    <group>
      <Ground size={120} />
      {state.visibleDowntown && (
        <group>
          {/* road down the middle (matte pavement — avoids mirror reflections) */}
          {M('Street_2Lane', [0, 0, -6], { matte: true })}
          {M('Street_2Lane', [0, 0, 6], { matte: true })}
          {/* sidewalks both sides (plain, opaque, matte), lifted 2 cm above the road */}
          {swZ.map((z) => M('Sidewalk_Straight_3m', [4.5, 0.02, z], { matte: true }))}
          {swZ.map((z) => M('Sidewalk_Straight_3m', [-4.5, 0.02, z], { matte: true }))}
          {M('Sidewalk_Corner_Round_3m', [4.5, 0.02, 9], { matte: true })}
          {/* assembled buildings, spread out and facing the road */}
          {M('Building_Small_1', [16, 0, -12], { rotY: -Math.PI / 2, centerXZ: true })}
          {M('Building_Medium_2_001', [17, 0, 11], { rotY: -Math.PI / 2, centerXZ: true })}
          {M('Building_Large_2', [-17, 0, -1], { rotY: Math.PI / 2, centerXZ: true })}
          {/* street props */}
          {M('Prop_Bollard', [4.6, 0, -3], { centerXZ: true })}
          {M('Prop_Planter_Single', [4.9, 0, 3], { centerXZ: true })}
          {M('Prop_ManholeCover', [1.4, 0.02, -3], { centerXZ: true, matte: true })}
          {M('Prop_Drain', [2.6, 0.02, 6], { centerXZ: true, matte: true })}
          {M('Prop_ACUnit', [9, 0, -12], { centerXZ: true })}
          {/* kit-of-parts lineup (modularity proof) on a display strip behind */}
          <group position={[0, 0, -20]}>
            {['Brick_Plain_1', 'Brick_Window_Square_Single', 'Brick_CornerColumn_Center', 'Brick_TopTrim',
              'Cornice_Brick_Center', 'Trim_FirstFloor_Wall', 'Trim_FirstFloor_Window_001', 'Roof_Slate_Center',
              'Roof_Slate_Corner', 'Door_1', 'DoorFrame_Wooden', 'Metal_FullWindow'].map((id, i) =>
              M(id, [(i - 5.5) * 3, 0, 0], { centerXZ: true }))}
          </group>
        </group>
      )}
      {state.showScaleRef && <>
        <HumanScaleRef position={[4.5, 0, 0]} />
        <HumanScaleRef position={[-2, 0, -20]} />
      </>}
    </group>
  )
}

// ---------------------------------------------------------------------------
export function SceneB({ manifest }: { manifest: RuntimeManifest }): JSX.Element {
  const { state } = useLab()
  const p = (name: string) => by(manifest, 'props/' + name)
  const F = (name: string, pos: [number, number, number], rotY = 0) => {
    const a = p(name)
    return a ? <ModelFBX key={name} asset={a} position={pos} rotationY={rotY} /> : null
  }
  return (
    <group>
      <Ground size={30} color={'#241d16'} />
      {/* room shell: two walls forming a corner */}
      <Wall pos={[0, 1.3, -3.4]} size={[8, 2.6, 0.12]} />
      <Wall pos={[-3.9, 1.3, 0]} size={[0.12, 2.6, 7]} />
      {state.visibleProps && (
        <group>
          {F('Carpet_1', [0.4, 0, 0])}
          {F('Couch_Medium1', [0, 0, -2.5], 0)}
          {F('Table_RoundSmall', [0.3, 0, -0.7])}
          {F('Chair_1', [1.7, 0, -0.6], -1.3)}
          {F('NightStand_1', [-1.7, 0, -2.6])}
          {F('Light_Desk', [-1.7, 0, -2.6])}
          {F('Light_Floor1', [2.6, 0, -2.7])}
          {F('Bookshelf', [-3.4, 0, -1.8], Math.PI / 2)}
          {F('Shelf_1', [-3.4, 0, 0.6], Math.PI / 2)}
          {F('Fireplace', [2.7, 0, -3.1], 0)}
          {F('Bathroom_Mirror1', [-3.6, 0, 1.8], Math.PI / 2)}
          {F('Houseplant_3', [3.0, 0, 1.7])}
        </group>
      )}
      {state.showScaleRef && <HumanScaleRef position={[1.6, 0, 1.4]} />}
    </group>
  )
}

// ---------------------------------------------------------------------------
export function SceneC(): JSX.Element {
  const { state } = useLab()
  return (
    <group>
      <Ground size={16} color={'#191d24'} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]} receiveShadow>
        <circleGeometry args={[1.6, 48]} />
        <meshStandardMaterial color={'#20252e'} roughness={0.8} metalness={0.1} />
      </mesh>
      {state.visibleCharacter && (
        <Suspense fallback={null}>
          <Character />
        </Suspense>
      )}
      {state.showScaleRef && <HumanScaleRef position={[1.15, 0, 0]} />}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Scene D — Studio Greybox Target (contract §4-§6). A small, art-directed studio district.
const WORKERS: WorkerSpec[] = [
  { pos: [-11, 0, 2], rotY: 1.2, clip: 'Idle_Talking_Loop', tint: '', startAt: 0.0 },   // talking pair, office
  { pos: [-9.6, 0, 3.3], rotY: -1.9, clip: 'Idle_Talking_Loop', tint: '', startAt: 1.4 },
  { pos: [-1.6, 0, 11.4], rotY: 0.0, clip: 'Sitting_Idle_Loop', tint: '', startAt: 0.7 },  // sitting, bench
  { pos: [5.2, 0, -5], rotY: 0.3, clip: 'Fixing_Kneeling', tint: '', startAt: 2.1 },        // repair, soundstage
  { pos: [5.4, 0, 4.4], rotY: -1.5, clip: 'PickUp_Table', tint: '', startAt: 0.4 },         // carry/interact, cart
  { pos: [3.6, 0, -4], rotY: 0.1, clip: 'Idle_Loop', tint: '', startAt: 1.1 },              // waiting, stage door
  { pos: [10, 0, -4.2], rotY: -0.4, clip: 'Idle_Talking_Loop', tint: '', startAt: 1.8 },    // waiting 2
  { pos: [0.4, 0, 9], rotY: 0.0, clip: 'Walk_Loop', tint: '', startAt: 0.9 },               // walking, drive
  { pos: [3, 0, 15.5], rotY: -0.5, clip: 'Idle_Loop', tint: '', startAt: 2.6 },             // standing, entrance
]

export function SceneD({ manifest }: { manifest: RuntimeManifest }): JSX.Element {
  const { state } = useLab()
  const cc0 = (id: string) => by(manifest, 'downtown/' + id)
  const CC = (id: string, pos: [number, number, number], rotY = 0) => {
    const a = cc0(id)
    return a ? <ModelGLB key={id + pos.join(',')} asset={a} position={pos} rotationY={rotY} centerXZ matte /> : null
  }
  return (
    <group>
      {/* ---------- ground, paving, roads, walks ---------- */}
      <LotGround size={140} />
      <Paving size={[40, 34]} pos={[2, 0, 2]} />
      <Road from={[0, 0, 30]} to={[0, 0, 8]} width={7} />
      <Road from={[-16, 0, -3]} to={[22, 0, -3]} width={6} />
      <Sidewalk size={[2.4, 22]} pos={[4.4, 0, 16]} />
      <Sidewalk size={[2.4, 22]} pos={[-4.4, 0, 16]} />
      <StagingMark pos={[2.5, 0, 1]} />

      {/* ---------- identity structures ---------- */}
      <EntranceGate pos={[0, 0, 21]} studio="MERIDIAN" sub="PICTURES" />
      <GuardBooth pos={[6.2, 0, 20]} rotY={-0.15} />
      <WaterTower pos={[-15, 0, 15]} label="MERIDIAN" />
      <ProductionOffice pos={[-17.5, 0, 1]} rotY={Math.PI / 2} name="ADMINISTRATION" />
      <Soundstage pos={[7, 0, -15]} rotY={0} w={22} d={18} h={12} number="1" />

      {/* ---------- backlot suggestion (east) ---------- */}
      <BacklotFacade pos={[23, 0, -12]} rotY={-Math.PI / 2} />
      <SceneryFlat pos={[23, 0, -5]} rotY={-Math.PI / 2 + 0.2} />
      <CrateStack pos={[24, 0, -18]} rotY={0.4} />

      {/* ---------- CC0 pipeline assets (reuse) ---------- */}
      {CC('Prop_Bollard', [3.3, 0, 24])}
      {CC('Prop_Bollard', [-3.3, 0, 24])}
      {CC('Prop_Planter_Single', [-3.6, 0, 17])}
      {CC('Prop_Planter_Single', [3.6, 0, 17])}

      {/* ---------- production dressing ---------- */}
      {state.showDressing && (
        <group>
          <ProductionTruck pos={[13, 0, 6]} rotY={-2.3} />
          <Cart pos={[4, 0, 4.4]} rotY={0.5} />
          <Cart pos={[-2, 0, 7.5]} rotY={-1.0} />
          <FilmLight pos={[1.5, 0, -1.5]} rotY={0.3} />
          <FilmLight pos={[7, 0, 0.5]} rotY={-0.8} />
          <FilmLight pos={[-4.5, 0, 2]} rotY={1.2} />
          <CrateStack pos={[10.5, 0, -1.5]} rotY={0.4} />
          <CrateStack pos={[-6.5, 0, 6]} rotY={-0.3} />
          <Bench pos={[-2, 0, 12]} rotY={0} />
          <Bench pos={[9, 0, 10]} rotY={-0.5} />
          <Banner pos={[0, 0, 6]} rotY={0} text="NOW FILMING" />
          <Banner pos={[6.5, 0, -5.5]} rotY={0.2} text="QUIET  STAGE 1" bg="#3f5c74" />
        </group>
      )}

      {/* ---------- landscaping ---------- */}
      {state.showLandscaping && (
        <group>
          <Tree pos={[-14, 0, 9]} s={1.2} />
          <Tree pos={[17, 0, 11]} s={1.0} />
          <Tree pos={[-9, 0, 18]} s={0.9} />
          <Tree pos={[15, 0, -2]} s={1.1} />
          <Planter pos={[-4.4, 0, 20]} />
          <Planter pos={[4.4, 0, 20]} />
          <Planter pos={[-10.5, 0, -2]} />
        </group>
      )}

      {/* ---------- visible studio life ---------- */}
      {state.showCharacters && (
        <Suspense fallback={null}><Workers specs={WORKERS} /></Suspense>
      )}

      {state.showScaleRef && <HumanScaleRef position={[-1, 0, 5]} />}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Scene E — HERO SOUNDSTAGE (Asset Lab 03). ONE facility at production fidelity: articulated
// Stage 1 + its active grip/electric apron. Isolated: new hero materials/geometry only; Scene D
// stays the untouched greybox baseline for the greybox⇄hero comparison.
const HERO_CREW: HeroCrewSpec[] = [
  { pos: [-7.6, 0, 12.2], rotY: -0.6, clip: 'Fixing_Kneeling', role: 'gaffer', startAt: 1.3 },   // gaffer tying in feeder at distro
  { pos: [6.2, 0, 13.8], rotY: 2.6, clip: 'PickUp_Table', role: 'grip', startAt: 0.5 },          // grip lifting a case off the cart
  { pos: [7.0, 0, 14.9], rotY: 3.4, clip: 'Idle_Talking_Loop', role: 'camera', startAt: 0.0 },   // DP at video village
  { pos: [8.7, 0, 15.2], rotY: 3.0, clip: 'Idle_Talking_Loop', role: 'director', startAt: 1.7 }, // director at video village
  { pos: [-2.2, 0, 11.8], rotY: 3.1, clip: 'Idle_Loop', role: 'electric', startAt: 2.2 },        // electrician standing by a hero light
  { pos: [2.4, 0, 18.5], rotY: -2.4, clip: 'Walk_Loop', role: 'pa', startAt: 0.9 },              // PA crossing the apron
]

export function SceneE(): JSX.Element {
  const { state } = useLab()
  return (
    <group>
      {/* broad procedural-asphalt ground + the concrete production apron slab in front of the doors */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, -0.02, 6]} receiveShadow material={HM.asphalt}>
        <planeGeometry args={[140, 140]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0.005, 11]} receiveShadow material={HM.concrete}>
        <planeGeometry args={[44, 32]} />
      </mesh>

      <HeroSoundstage pos={[0, 0, -3]} number="1" />

      {state.showApron && <><ProductionApron /><GroundDecals /><WorldEdge /></>}

      {state.showCharacters && (
        <Suspense fallback={null}><HeroWorkers specs={HERO_CREW} /></Suspense>
      )}

      {state.showScaleRef && <HumanScaleRef position={[1.5, 0, 10]} />}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Scene F — REFINED STUDIO LOT (Asset Lab 04). The Lab 02 greybox lot concept made architecturally
// believable + varied + less boxy (many roof languages + massing + facade articulation), still
// stylized. Isolated new module; Scenes D (greybox lot) and E (hero soundstage) stay untouched
// baselines — D⇄F is the boxy-vs-articulated comparison.
export function SceneF(): JSX.Element {
  const { state } = useLab()
  return (
    <group>
      <RefinedLot dressing={state.showDressing} crew={state.showCharacters} landscaping={state.showLandscaping} />
      {state.showScaleRef && <HumanScaleRef position={[0, 0, 12]} />}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Scene G — BLENDER ART VERTICAL SLICE (Asset Lab 05). Everything visible here is authored by
// the Blender production factory: the hero SET (soundstage from the modular kit + apron + props)
// and the crew — original characters built to the 65-bone UAL Mannequin, each playing a CC0 clip
// from the shared 43-clip library. Proves the factory output runs in the real runtime and that
// the crew retarget the CC0 animation library unchanged. Scenes A-F stay untouched baselines.
const STUDIO_CREW: StudioCrewSpec[] = [
  { role: 'Grip',      pos: [-1.6, 0, 8.0],  rotY: 0.2,  clip: 'Fixing_Kneeling',   startAt: 1.3 },
  { role: 'Electric',  pos: [-5.4, 0, 10.6], rotY: 0.7,  clip: 'Idle_Loop',         startAt: 2.2 },
  { role: 'CameraDP',  pos: [3.4, 0, 8.0],   rotY: -0.4, clip: 'Idle_Talking_Loop', startAt: 0.0 },
  { role: 'Director',  pos: [5.2, 0, 11.6],  rotY: -0.8, clip: 'Idle_Talking_Loop', startAt: 1.7 },
  { role: 'PA',        pos: [1.2, 0, 13.5],  rotY: 3.0,  clip: 'Walk_Loop',         startAt: 0.9 },
  { role: 'Carpenter', pos: [-3.6, 0, 12.4], rotY: 1.2,  clip: 'PickUp_Table',      startAt: 0.4 },
]

export function SceneG(): JSX.Element {
  const { state } = useLab()
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 4]} receiveShadow material={HM.asphalt}>
        <planeGeometry args={[160, 160]} />
      </mesh>
      <Suspense fallback={null}><StudioSet /></Suspense>
      {state.showCharacters && (
        <Suspense fallback={null}><StudioCrew specs={STUDIO_CREW} /></Suspense>
      )}
      {state.showScaleRef && <HumanScaleRef position={[0, 0, 9]} />}
    </group>
  )
}
