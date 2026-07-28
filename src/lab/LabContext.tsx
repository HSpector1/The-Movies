// Central control state for the Asset Lab + the window.__lab bridge used by headless capture.
// Implemented as a module-level external store (React 18 useSyncExternalStore) rather than
// React context, because context does NOT cross the react-three-fiber <Canvas> boundary —
// this store is read identically by DOM HUD and in-Canvas scene code.
import { useSyncExternalStore, useEffect, type ReactNode } from 'react'
import type { SceneKey, CameraMode } from '../types'
import { latestStats } from './stats'
import { applyView, type Vec3 } from './cameraBridge'

export interface LabState {
  scene: SceneKey
  cameraMode: CameraMode
  cameraResetNonce: number
  wireframe: boolean
  showBounds: boolean
  showGrid: boolean
  showScaleRef: boolean
  showSkeleton: boolean
  keyLight: number
  ambientLight: number
  visibleDowntown: boolean
  visibleProps: boolean
  visibleCharacter: boolean
  clip: string
  playing: boolean
  loop: boolean
  speed: number
  rootMotion: boolean
}

export const INITIAL: LabState = {
  scene: 'A', cameraMode: 'overview', cameraResetNonce: 0,
  wireframe: false, showBounds: false, showGrid: true, showScaleRef: true, showSkeleton: false,
  keyLight: 2.6, ambientLight: 0.55,
  visibleDowntown: true, visibleProps: true, visibleCharacter: true,
  clip: 'Idle_Loop', playing: true, loop: true, speed: 1, rootMotion: false,
}

let state: LabState = INITIAL
const listeners = new Set<() => void>()
const emit = (): void => { for (const l of listeners) l() }
const subscribe = (fn: () => void): (() => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }
const getState = (): LabState => state

export function setLab<K extends keyof LabState>(k: K, v: LabState[K]): void {
  state = { ...state, [k]: v }
  emit()
}
export function resetCamera(): void {
  state = { ...state, cameraResetNonce: state.cameraResetNonce + 1 }
  emit()
}

export function useLab(): { state: LabState; set: typeof setLab; resetCamera: typeof resetCamera } {
  const s = useSyncExternalStore(subscribe, getState)
  return { state: s, set: setLab, resetCamera }
}

// Deterministic remote control for tools/capture.mjs (mirrors the spike's window.__spike).
export function LabProvider({ children }: { children: ReactNode }): JSX.Element {
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>
    w.__lab = {
      getState,
      getStats: () => ({ ...latestStats }),
      ready: () => !latestStats.loading && latestStats.loadedAssets > 0,
      setScene: (s: SceneKey) => setLab('scene', s),
      setCamera: (m: CameraMode) => setLab('cameraMode', m),
      resetCamera,
      set: setLab,
      setClip: (c: string) => setLab('clip', c),
      view: (pos: Vec3, tgt: Vec3) => applyView(pos, tgt),
    }
    return () => { delete w.__lab }
  }, [])
  return <>{children}</>
}
