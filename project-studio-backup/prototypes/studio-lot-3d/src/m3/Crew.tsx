// ── Reusable Meridian crew character ──────────────────────────────────────────
// One shared Kenney "Blocky Characters" rig (CC0), normalized to the Meridian 1.8 m
// adult unit (root scale ≈0.67 — Gate-B owner correction). Multiple crew reuse the
// SAME loaded GLB via SkeletonUtils.clone (shared geometry/skeleton; per-instance
// mixer + optional wardrobe tint). Ground contact is preserved: the rig root is at the
// feet, so scaling the group keeps feet at y=0. Treat as SUPPORTING/background crew
// per Gate B (not a human-scale hero) until the M3 review proves otherwise.

import { useEffect, useMemo, useRef, type JSX } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { CHARACTER_ROOT_SCALE } from '../env/scale'

const CHAR_URL = 'm2-assets/character/character-a.glb'
useGLTF.preload(CHAR_URL)

// map the brief's motion needs → clip names present on the Kenney rig
export const CREW_CLIPS: Record<string, string> = {
  idle: 'idle',
  walk: 'walk',
  gesture: 'emote-yes',
  carry: 'holding-both',
  react: 'emote-no',
  sit: 'sit',
  drive: 'drive',
}

export type CrewProps = {
  position: [number, number, number]
  rotationY?: number
  clip?: string
  /** overall scale; defaults to the normalized adult root */
  scale?: number
  /** wardrobe tint (multiplies the texture) for role identity */
  tint?: string
  castShadow?: boolean
}

export function Crew({ position, rotationY = 0, clip = 'idle', scale = CHARACTER_ROOT_SCALE, tint, castShadow = true }: CrewProps): JSX.Element {
  const { scene, animations } = useGLTF(CHAR_URL)
  const obj = useMemo(() => skeletonClone(scene), [scene])
  const ref = useRef<THREE.Group>(null)
  const { actions, names } = useAnimations(animations, ref)

  useEffect(() => {
    const owned: THREE.Material[] = [] // per-instance tint clones to dispose on cleanup
    obj.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      m.castShadow = castShadow
      m.receiveShadow = true
      // SkinnedMesh bind-pose bounds are inaccurate → they get wrongly frustum-culled
      // in close camera views (present at overview, gone up close). Disable culling for
      // the crew (cheap at this count) so people always render.
      m.frustumCulled = false
      if (tint) {
        const apply = (src: THREE.Material): THREE.Material => {
          const c = (src as THREE.MeshStandardMaterial).clone()
          c.color = new THREE.Color(tint)
          c.needsUpdate = true
          owned.push(c)
          return c
        }
        // preserve single-vs-array shape (a 1-element array needs geometry groups and
        // would render nothing on a single-material skinned mesh)
        m.material = Array.isArray(m.material) ? m.material.map(apply) : apply(m.material)
      }
    })
    return () => {
      owned.forEach((mm) => mm.dispose()) // dispose per-instance tint clones on unmount/retint
    }
  }, [obj, tint, castShadow])

  useEffect(() => {
    const target = CREW_CLIPS[clip] ?? clip
    const a = actions[target] ?? actions[names[0]]
    if (!a) return
    a.reset().fadeIn(0.2).play()
    return () => {
      a.fadeOut(0.2)
    }
  }, [actions, names, clip])

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <group ref={ref}>
        <primitive object={obj} />
      </group>
    </group>
  )
}
