// Asset Lab 02 — visible studio life (contract §5). Lightweight CC0 character instances,
// each a SkeletonUtils clone with its own mixer + a deterministic clip. VISUAL ONLY:
// no simulation, no schedules, no needs — just "is the lot inhabited at management distance?"
import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'

const CHAR_URL = '/assets/animation/UAL1_Standard.glb'
useGLTF.preload(CHAR_URL)

// Deterministic crew: fixed positions, rotations, clips, and tints (no RNG).
export interface WorkerSpec { pos: [number, number, number]; rotY: number; clip: string; tint: string; startAt: number }

// A muted, warm crew palette (shirts) so the lot reads as populated, not cloned.
const TINTS = ['#c96f4a', '#4a6c8c', '#7a8a4a', '#b7975a', '#8a5a6c', '#5f7d6a', '#9c6b45', '#6a6f7a']

function Worker({ spec }: { spec: WorkerSpec }): JSX.Element {
  const { scene, animations } = useGLTF(CHAR_URL)
  const obj = useMemo(() => {
    const c = skeletonClone(scene)
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.frustumCulled = false
        // clone materials so a per-worker tint doesn't leak across instances
        const src = m.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
        const one = Array.isArray(src) ? src.map((x) => x.clone()) : src.clone()
        m.material = one
        for (const mm of Array.isArray(one) ? one : [one]) mm.color.multiplyScalar(0.8).lerp(new THREE.Color(spec.tint), 0.55)
      }
    })
    return c
  }, [scene, spec.tint])

  const mixer = useMemo(() => new THREE.AnimationMixer(obj), [obj])
  useEffect(() => {
    const clip = animations.find((a) => a.name === spec.clip) ?? animations[0]
    const action = mixer.clipAction(clip)
    action.reset().play()
    action.time = spec.startAt % (clip.duration || 1) // deterministic phase offset so crew isn't in lockstep
    return () => { mixer.stopAllAction() }
  }, [mixer, animations, spec.clip, spec.startAt])
  useFrame((_, dt) => mixer.update(dt))

  return <group position={spec.pos} rotation={[0, spec.rotY, 0]}><primitive object={obj} /></group>
}

export function Workers({ specs }: { specs: WorkerSpec[] }): JSX.Element {
  return <>{specs.map((s, i) => <Worker key={i} spec={{ ...s, tint: s.tint || TINTS[i % TINTS.length] }} />)}</>
}

export { TINTS }
