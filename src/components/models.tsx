// Model loaders. Downtown = optimized GLB (authored in metres). Props = FBX loaded
// directly (contract §9) with defensive normalization for unit/origin quirks. Character =
// animation GLB with clip selector / play / loop / speed / skeleton / root-motion (§7 Scene C).
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject, type MutableRefObject } from 'react'
import { useThree } from '@react-three/fiber'
import { useGLTF, useFBX, useAnimations, useHelper } from '@react-three/drei'
import * as THREE from 'three'
import { useLab } from '../lab/LabContext'
import type { RuntimeAsset } from '../types'

/** Bounds of an object in ITS OWN local frame (independent of parent transform). */
function localBounds(obj: THREE.Object3D): THREE.Box3 {
  obj.updateMatrixWorld(true)
  const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert()
  const box = new THREE.Box3()
  const tmp = new THREE.Box3()
  const m = new THREE.Matrix4()
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.isMesh && mesh.geometry) {
      mesh.geometry.computeBoundingBox()
      if (mesh.geometry.boundingBox) {
        tmp.copy(mesh.geometry.boundingBox)
        m.multiplyMatrices(inv, mesh.matrixWorld)
        tmp.applyMatrix4(m)
        box.union(tmp)
      }
    }
  })
  return box
}

/** Adds/removes a world-space Box3 helper when `show` is true. */
function useBoundsHelper(ref: RefObject<THREE.Object3D>, show: boolean, color = '#4ade80'): void {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    if (!show || !ref.current) return
    ref.current.updateWorldMatrix(true, true)
    const helper = new THREE.Box3Helper(new THREE.Box3().setFromObject(ref.current), new THREE.Color(color))
    scene.add(helper)
    return () => { scene.remove(helper); helper.geometry.dispose() }
  }, [show, scene, color, ref])
}

/** Normalize an object to rest on y=0, optionally centre X/Z, optionally cm->m auto-scale. */
function normalize(obj: THREE.Object3D, opts: { ground: boolean; centerXZ: boolean; autoScale: boolean }): void {
  const b = localBounds(obj)
  if (!isFinite(b.min.x)) return
  const size = b.getSize(new THREE.Vector3())
  const s = opts.autoScale && Math.max(size.x, size.y, size.z) > 8 ? 0.01 : 1 // FBX often authored in cm
  obj.scale.setScalar(s)
  const cx = opts.centerXZ ? ((b.min.x + b.max.x) / 2) * s : 0
  const cz = opts.centerXZ ? ((b.min.z + b.max.z) / 2) * s : 0
  const gy = opts.ground ? b.min.y * s : 0
  obj.position.set(-cx, -gy, -cz)
}

export function ModelGLB({ asset, position, rotationY = 0, ground = true, centerXZ = false, matte = false }:
  { asset: RuntimeAsset; position: [number, number, number]; rotationY?: number; ground?: boolean; centerXZ?: boolean; matte?: boolean }): JSX.Element {
  const { scene } = useGLTF(asset.url)
  const obj = useMemo(() => scene.clone(true), [scene])
  const ref = useRef<THREE.Group>(null)
  const { state } = useLab()
  useLayoutEffect(() => {
    normalize(obj, { ground, centerXZ, autoScale: false })
    obj.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      m.castShadow = true; m.receiveShadow = true
      // Flat pavement is authored metalness=1 (mirror). Under IBL it reflects the red-brick
      // buildings — force it matte so ground reads as concrete/asphalt, not a red mirror.
      if (matte) for (const mm of Array.isArray(m.material) ? m.material : [m.material]) {
        const s = mm as THREE.MeshStandardMaterial
        // Fully diffuse: metalness 0 + no environment reflection at all — pavement can no
        // longer mirror the red-brick buildings even at grazing angles.
        if (s && 'metalness' in s) { s.metalness = 0; s.roughness = 1; s.envMapIntensity = 0; s.needsUpdate = true }
      }
    })
  }, [obj, ground, centerXZ, matte])
  useBoundsHelper(ref, state.showBounds, '#4ade80')
  return <group ref={ref} position={position} rotation={[0, rotationY, 0]}><primitive object={obj} /></group>
}

export function ModelFBX({ asset, position, rotationY = 0 }:
  { asset: RuntimeAsset; position: [number, number, number]; rotationY?: number }): JSX.Element {
  const fbx = useFBX(asset.url)
  const obj = useMemo(() => fbx.clone(true), [fbx])
  const ref = useRef<THREE.Group>(null)
  const { state } = useLab()
  useLayoutEffect(() => {
    normalize(obj, { ground: true, centerXZ: true, autoScale: true })
    obj.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true; m.receiveShadow = true
        // Untextured props: ensure a lit, non-black standard material.
        const mat = m.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
        for (const mm of Array.isArray(mat) ? mat : [mat]) {
          if (mm && (mm as THREE.Material).type === 'MeshPhongMaterial') {
            const src = mm as unknown as THREE.MeshPhongMaterial
            m.material = new THREE.MeshStandardMaterial({ color: src.color, roughness: 0.7, metalness: 0.05 })
          }
        }
      }
    })
  }, [obj])
  useBoundsHelper(ref, state.showBounds, '#f59e0b')
  return <group ref={ref} position={position} rotation={[0, rotationY, 0]}><primitive object={obj} /></group>
}

export function Character(): JSX.Element {
  const { state } = useLab()
  const url = state.rootMotion ? '/assets/animation/UAL1_Standard_RM.glb' : '/assets/animation/UAL1_Standard.glb'
  const { scene, animations } = useGLTF(url)
  const ref = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, ref)

  // (Re)start the selected clip on clip/loop/rootMotion change.
  useEffect(() => {
    for (const a of Object.values(actions)) a?.stop()
    const act = actions[state.clip]
    if (act) {
      act.reset()
      act.setLoop(state.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity)
      act.clampWhenFinished = !state.loop
      act.timeScale = state.speed
      act.play()
      act.paused = !state.playing
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, state.clip, state.loop, state.rootMotion])

  useEffect(() => { const a = actions[state.clip]; if (a) a.paused = !state.playing }, [state.playing, actions, state.clip])
  useEffect(() => { const a = actions[state.clip]; if (a) a.timeScale = state.speed }, [state.speed, actions, state.clip])

  useBoundsHelper(ref, state.showBounds, '#22d3ee')
  useHelper(state.showSkeleton ? (ref as unknown as MutableRefObject<THREE.Object3D>) : null, THREE.SkeletonHelper)

  useLayoutEffect(() => {
    scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.frustumCulled = false } })
  }, [scene])

  return <group ref={ref}><primitive object={scene} /></group>
}

// Preload the two animation libraries so Scene C is instant.
useGLTF.preload('/assets/animation/UAL1_Standard.glb')
useGLTF.preload('/assets/animation/UAL1_Standard_RM.glb')
