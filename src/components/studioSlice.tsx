// Asset Lab 05 — Scene G: the Blender-authored art vertical slice. Loads the hero SET GLB
// (soundstage assembled from the modular kit + apron + dressed props, all authored in Blender)
// and a crew of the Blender-authored characters, each playing a CC0 clip from the SAME 43-clip
// UAL library — proving the whole factory output runs in the real runtime and that the crew
// characters (built to the 65-bone Mannequin) retarget the CC0 animation library unchanged.
import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const SET_URL = '/assets/studio/scenes/studio_hero_set.glb'
const CLIP_URL = '/assets/animation/UAL1_Standard.glb'   // the 43 CC0 clips (Quaternius UAL)

export const CREW_URL: Record<string, string> = {
  PA: '/assets/studio/characters/Char_PA_Standard.glb',
  Grip: '/assets/studio/characters/Char_Grip_Standard.glb',
  Electric: '/assets/studio/characters/Char_Electric_Heavy.glb',
  Maintenance: '/assets/studio/characters/Char_Maintenance_Heavy.glb',
  Office: '/assets/studio/characters/Char_Office_Standard.glb',
  CameraDP: '/assets/studio/characters/Char_CameraDP_Standard.glb',
  Director: '/assets/studio/characters/Char_Director_Standard.glb',
  Carpenter: '/assets/studio/characters/Char_Carpenter_Heavy.glb',
}

useGLTF.preload(SET_URL)
useGLTF.preload(CLIP_URL)
Object.values(CREW_URL).forEach((u) => useGLTF.preload(u))

export interface StudioCrewSpec { role: keyof typeof CREW_URL; pos: [number, number, number]; rotY: number; clip: string; startAt: number }

export function StudioSet(): JSX.Element {
  const { scene } = useGLTF(SET_URL)
  const obj = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) { m.castShadow = true; m.receiveShadow = true }
    })
    return c
  }, [scene])
  return <primitive object={obj} />
}

function StudioChar({ spec }: { spec: StudioCrewSpec }): JSX.Element {
  const { scene } = useGLTF(CREW_URL[spec.role])       // Blender-authored crew mesh + 65-bone rig
  const { animations } = useGLTF(CLIP_URL)             // CC0 clip library
  const obj = useMemo(() => {
    const c = skeletonClone(scene)
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) { m.castShadow = true; m.frustumCulled = false }
    })
    return c
  }, [scene])
  const mixer = useMemo(() => new THREE.AnimationMixer(obj), [obj])
  useEffect(() => {
    // clips bind to our rig by BONE NAME — the character shares the exact 65-bone UAL skeleton
    const clip = animations.find((a) => a.name === spec.clip) ?? animations[0]
    const action = mixer.clipAction(clip)
    action.reset().play()
    action.time = spec.startAt % (clip.duration || 1)
    return () => { mixer.stopAllAction() }
  }, [mixer, animations, spec.clip, spec.startAt])
  useFrame((_, dt) => mixer.update(dt))
  return <group position={spec.pos} rotation={[0, spec.rotY, 0]}><primitive object={obj} /></group>
}

export function StudioCrew({ specs }: { specs: StudioCrewSpec[] }): JSX.Element {
  return <>{specs.map((s, i) => <StudioChar key={i} spec={s} />)}</>
}
