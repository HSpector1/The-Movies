import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useLab } from '../lab/LabContext'
import { registerApplyView } from '../lab/cameraBridge'
import type { SceneKey, CameraMode } from '../types'

// Overview + inspection camera presets per scene, with reset (contract §8).
type Preset = { pos: [number, number, number]; tgt: [number, number, number] }
const PRESETS: Record<SceneKey, Record<CameraMode, Preset>> = {
  A: { overview: { pos: [34, 46, 44], tgt: [0, 0, -5] }, inspection: { pos: [10, 3.4, 13], tgt: [2, 2.2, 0] } },
  B: { overview: { pos: [6.8, 5.2, 7.8], tgt: [0, 1, 0] }, inspection: { pos: [2.9, 1.7, 3.3], tgt: [0, 1, -1] } },
  C: { overview: { pos: [3.0, 1.9, 3.4], tgt: [0, 1.0, 0] }, inspection: { pos: [1.5, 1.45, 1.9], tgt: [0, 1.15, 0] } },
  D: { overview: { pos: [42, 34, 48], tgt: [2, 2, -1] }, inspection: { pos: [-3.5, 1.75, 11], tgt: [3, 1.4, 2] } },
  E: { overview: { pos: [34, 20, 42], tgt: [-2, 5, -1] }, inspection: { pos: [23, 9, 27], tgt: [-2, 6, 3] } },
  F: { overview: { pos: [72, 48, 78], tgt: [0, 4, -6] }, inspection: { pos: [46, 22, 8], tgt: [2, 8, -22] } },
}

export function CameraController(): null {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update: () => void } | null
  const { state } = useLab()

  // Register an imperative applier for tools/capture.mjs (window.__lab.view).
  useEffect(() => {
    registerApplyView((pos, tgt) => {
      camera.position.set(...pos)
      if (controls) { controls.target.set(...tgt); controls.update() }
      else camera.lookAt(new THREE.Vector3(...tgt))
    })
  }, [camera, controls])

  useEffect(() => {
    const p = PRESETS[state.scene][state.cameraMode]
    camera.position.set(...p.pos)
    if (controls) { controls.target.set(...p.tgt); controls.update() }
    else camera.lookAt(new THREE.Vector3(...p.tgt))
  }, [state.scene, state.cameraMode, state.cameraResetNonce, camera, controls])
  return null
}
