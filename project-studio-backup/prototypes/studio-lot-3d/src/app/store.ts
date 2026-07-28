// ── Tiny imperative store ─────────────────────────────────────────────────────
// Mutable state read directly by per-frame code (camera rig, vignette, highlight)
// so animation never triggers React re-renders. React overlays (character card,
// dev panel) subscribe via useSyncExternalStore on a version counter.

import type { StudioLotSnapshot, BuildingId, CharacterInfo } from '../types/snapshot'
import type { LotIntent } from '../renderer/StudioLotRenderer'
import { BUILDINGS, CAMERA_PRESETS, type Vec3 } from '../scene/layout'
import { MERIDIAN_ESTABLISHED } from '../fixtures/meridian'

export type CameraGoal = { pos: Vec3; target: Vec3 }
export type Vignette = { active: boolean; t: number; paused: boolean; duration: number }

type State = {
  snapshot: StudioLotSnapshot
  hovered: BuildingId | string | null
  selectedBuilding: BuildingId | null
  selectedCharacter: CharacterInfo | null
  cameraGoal: CameraGoal
  cameraInstant: boolean
  cameraToken: number
  vignette: Vignette
  fps: number
  dev: boolean
}

export const state: State = {
  snapshot: MERIDIAN_ESTABLISHED,
  hovered: null,
  selectedBuilding: null,
  selectedCharacter: null,
  cameraGoal: { pos: CAMERA_PRESETS.overview.pos, target: CAMERA_PRESETS.overview.target },
  cameraInstant: false,
  cameraToken: 0,
  vignette: { active: false, t: 0, paused: false, duration: 22 },
  fps: 0,
  dev: false,
}

let onIntent: ((e: LotIntent) => void) | undefined
export function setIntentSink(cb?: (e: LotIntent) => void): void {
  onIntent = cb
}
function intent(e: LotIntent): void {
  onIntent?.(e)
}

// ── React subscription (version-based) ────────────────────────────────────────
let version = 0
const listeners = new Set<() => void>()
export function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
export function getVersion(): number {
  return version
}
function bump(): void {
  version++
  listeners.forEach((l) => l())
}

// ── camera goals ──────────────────────────────────────────────────────────────
function goalTo(g: CameraGoal, instant = false): void {
  state.cameraGoal = g
  state.cameraInstant = instant
  state.cameraToken++
}
export function setCameraPreset(name: keyof typeof CAMERA_PRESETS, instant = false): void {
  goalTo({ pos: CAMERA_PRESETS[name].pos, target: CAMERA_PRESETS[name].target }, instant)
}

// ── public API used by the renderer + dev/debug ───────────────────────────────
export function setSnapshot(s: StudioLotSnapshot): void {
  state.snapshot = s
  bump()
}

export function hover(id: BuildingId | string | null): void {
  if (state.hovered !== id) {
    state.hovered = id
    bump()
  }
}

export function selectBuilding(id: BuildingId, instant = false): void {
  clearCharacter(true)
  state.selectedBuilding = id
  // frame the building: a 3/4 view offset from its position + height
  const b = BUILDINGS.find((x) => x.id === id)
  if (b) {
    const target: Vec3 = [b.pos[0], b.height * 0.4, b.pos[1]]
    const dist = Math.max(b.size[0], b.size[1], b.height) * 1.9 + 10
    goalTo({ pos: [b.pos[0] + dist * 0.7, b.height * 0.9 + 6, b.pos[1] + dist * 0.7], target }, instant)
    const available = state.snapshot.buildings.find((x) => x.id === id)?.available ?? true
    intent({ type: 'building-selected', info: { id, label: b.label, available } })
  }
  bump()
}

export function selectCharacter(info: CharacterInfo, worldPos?: Vec3, instant = false): void {
  state.selectedBuilding = null
  state.selectedCharacter = info
  if (worldPos) {
    goalTo({ pos: [worldPos[0] - 6, 3.2, worldPos[2] + 8], target: [worldPos[0], 1.5, worldPos[2]] }, instant)
  }
  intent({ type: 'character-selected', info })
  bump()
}

export function clearCharacter(silent = false): void {
  if (state.selectedCharacter) {
    state.selectedCharacter = null
    if (!silent) intent({ type: 'character-selected', info: null })
    bump()
  }
}

export function returnToOverview(instant = false): void {
  state.selectedBuilding = null
  clearCharacter(true)
  setCameraPreset('overview', instant)
  intent({ type: 'return-to-overview' })
  bump()
}

export function triggerBuildingAction(id: BuildingId, action: string): void {
  intent({ type: 'building-action', id, action })
}

// ── vignette clock ────────────────────────────────────────────────────────────
export function playVignette(): void {
  state.vignette = { ...state.vignette, active: true, paused: false, t: 0 }
  bump()
}
export function pauseVignette(p: boolean): void {
  state.vignette = { ...state.vignette, paused: p }
  bump()
}
export function seekVignette(t: number): void {
  state.vignette = { ...state.vignette, active: true, paused: true, t }
  bump()
}
export function setFps(fps: number): void {
  state.fps = fps
}
export function ready(): void {
  intent({ type: 'ready' })
}
