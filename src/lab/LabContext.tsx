// Central control state for the Asset Lab + the window.__lab bridge used by headless capture.
// Implemented as a module-level external store (React 18 useSyncExternalStore) rather than
// React context, because context does NOT cross the react-three-fiber <Canvas> boundary —
// this store is read identically by DOM HUD and in-Canvas scene code.
import { useSyncExternalStore, useEffect, type ReactNode } from 'react'
import type { SceneKey, CameraMode } from '../types'
import { latestStats } from './stats'
import { applyView, type Vec3 } from './cameraBridge'
import { installErrorTracker, getErrorCount, getLastError } from './errors'

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
  showCharacters: boolean
  showLandscaping: boolean
  showDressing: boolean
  showApron: boolean
  showShadows: boolean
  atmosphere: boolean
  softShadows: boolean
  postFx: boolean
  clip: string
  playing: boolean
  loop: boolean
  speed: number
  rootMotion: boolean
  showHud: boolean
  gReview: string        // Lab 05E: active Scene-G character-review view (see cameraBridge.G_REVIEW)
  // Asset Lab 05H final review — fixed-isometric management-camera vignette controls (Question B):
  reducedMotion: boolean // freeze worker animation in mgmt vignettes (reduced-motion evidence)
  mgmtWorker: '' | '05g' | '05h' | 'sprite' | 'none'  // worker source in mgmt vignettes ('' = default 05h)
  mgmtZoomMul: number    // framing sweep multiplier over the preset's orthographic zoom (1 = default)
  neutralEval: boolean   // Asset Lab 05I: neutral evaluation-light setup (honest material judgement, §7)
}

export const INITIAL: LabState = {
  scene: 'G', cameraMode: 'overview', cameraResetNonce: 0,
  wireframe: false, showBounds: false, showGrid: false, showScaleRef: false, showSkeleton: false,
  keyLight: 3.0, ambientLight: 0.6,
  visibleDowntown: true, visibleProps: true, visibleCharacter: true,
  showCharacters: true, showLandscaping: true, showDressing: true, showApron: true,
  showShadows: true, atmosphere: true, softShadows: false, postFx: false,
  clip: 'Idle_Loop', playing: true, loop: true, speed: 1, rootMotion: false,
  showHud: true,
  gReview: 'Full Scene Overview',   // default = the existing production Scene G composition (unchanged)
  reducedMotion: false, mgmtWorker: '', mgmtZoomMul: 1,   // Lab 05H mgmt-camera review defaults
  neutralEval: false,   // Lab 05I neutral evaluation lighting (off = existing review env)
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
    installErrorTracker()
    const w = window as unknown as Record<string, unknown>
    // Sustained-FPS probe (Lab 05E owner review): sample the live rolling FPS every 250 ms for
    // `seconds`, then report min / median / steady-state (median of the last half) + draw calls +
    // triangles. Honest about software rendering — SwiftShader FPS is diagnostic, not M3 acceptance.
    const perfProbe = (seconds = 20) => new Promise((resolve) => {
      const fps: number[] = []
      const t0 = performance.now()
      const id = setInterval(() => {
        if (!latestStats.loading && latestStats.fps > 0) fps.push(latestStats.fps)
        if (performance.now() - t0 >= seconds * 1000) {
          clearInterval(id)
          const sorted = [...fps].sort((a, b) => a - b)
          const median = (a: number[]) => (a.length ? a[Math.floor(a.length / 2)] : 0)
          const half = sorted.length ? fps.slice(Math.floor(fps.length / 2)) : []
          resolve({
            samples: fps.length, seconds,
            min: sorted[0] ?? 0, max: sorted[sorted.length - 1] ?? 0, median: median(sorted),
            steadyState: median([...half].sort((a, b) => a - b)),
            drawCalls: latestStats.drawCalls, triangles: latestStats.triangles,
            sceneTriangles: latestStats.sceneTriangles, sceneMeshes: latestStats.sceneMeshes,
            renderer: latestStats.renderer, isSoftware: latestStats.isSoftware,
          })
        }
      }, 250)
    })
    w.__lab = {
      getState,
      getStats: () => ({ ...latestStats }),
      ready: () => !latestStats.loading && latestStats.loadedAssets > 0,
      setScene: (s: SceneKey) => setLab('scene', s),
      setCamera: (m: CameraMode) => setLab('cameraMode', m),
      setReview: (v: string) => setLab('gReview', v),   // Lab 05E: select a Scene-G review view
      resetCamera,
      set: setLab,
      setClip: (c: string) => setLab('clip', c),
      view: (pos: Vec3, tgt: Vec3) => applyView(pos, tgt),
      perfProbe,
      getErrorCount, getLastError,
    }
    return () => { delete w.__lab }
  }, [])
  return <>{children}</>
}
