// The three demonstrations (contract §7). Data-driven from the runtime manifest.
//   Scene A — studio-lot scale + materials proof (Downtown CC0)
//   Scene B — furnished set proof (FBX props, LICENSE-UNCLEAR)
//   Scene C — animation viewer (Quaternius CC0 character + 43 clips)
import { Suspense } from 'react'
import { useLab } from './lab/LabContext'
import { ModelGLB, ModelFBX, Character } from './components/models'
import { HumanScaleRef } from './components/env'
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
