// ── Entry point (isolated spike) ──────────────────────────────────────────────
// Mounts the Three renderer over a FIXTURE snapshot. Records intents. Installs a
// dev-only window.__spike hook so the headless harness can drive deterministic
// capture. Owns no simulation truth.

import { ThreeStudioLotRenderer } from '../renderer/ThreeStudioLotRenderer'
import { MERIDIAN_ESTABLISHED } from '../fixtures/meridian'
import type { LotIntent } from '../renderer/StudioLotRenderer'
import type { BuildingId } from '../types/snapshot'
import {
  state,
  setCameraPreset,
  selectBuilding,
  selectCharacter,
  returnToOverview,
  playVignette,
  pauseVignette,
  seekVignette,
} from './store'
import { sampleVignette, doorOpen } from '../vignette/director'
import { inFootprint, segClear, inObstacle, obstacleSegClear, APRON_CREW } from '../scene/layout'
import { AMBIENT_ROUTES } from '../characters/Characters'

const container = document.getElementById('root')!
const intents: LotIntent[] = []

// ── deterministic route validation (authored routes, NOT a pathfinder) ────────
// Re-derives the actual runtime positions from the pure vignette sampler and the
// authored ambient loops, then checks them against the real building footprints.
// A footprint may be touched ONLY at the stage door and ONLY while it is open.
type RouteViolation = { who: string; t?: number; x: number; z: number; hit: string }
type RouteReport = {
  ok: boolean
  vanClear: boolean // the production vehicle never enters any building
  doorwayEntriesOnlyWhenOpen: boolean // stage-a contact ⇒ door open + at the doorway
  approacherBlockedWhenClosed: boolean // approacher never crosses the closed door
  ambientClear: boolean // every ambient loop segment is footprint-clear
  vegetationClear: boolean // no character route crosses a tree/hedge footprint
  propsClear: boolean // no character route crosses a production-prop footprint
  crewSpacingOk: boolean // apron crew are spaced + clear of obstacles (no stacking)
  violations: RouteViolation[]
}

function validateRoutes(): RouteReport {
  const violations: RouteViolation[] = []
  let vanClear = true
  let doorwayEntriesOnlyWhenOpen = true
  let approacherBlockedWhenClosed = true
  let vegetationClear = true
  let propsClear = true
  const PAD = 0.15 // half of a character's plan radius; van centre stays well clear
  const atDoorway = (x: number) => x >= 11.7 && x <= 12.3 // the −X door plane at x=12
  const isVeg = (id: string) => id.startsWith('tree-') || id.startsWith('hedge@')

  // sample the full 22 s vignette at 0.1 s resolution — checks the interpolated
  // path, not just keyframes.
  for (let t = 0; t <= 22.0001; t += 0.1) {
    const tt = Math.round(t * 100) / 100
    const f = sampleVignette(tt)
    const open = doorOpen(tt)
    const actors: Array<[string, typeof f.van]> = [
      ['van', f.van],
      ['director', f.director],
      ['actorA', f.actorA],
      ['actorB', f.actorB],
      ['slate', f.slate],
      ['approacher', f.approacher],
    ]
    for (const [who, a] of actors) {
      if (!a.visible) continue
      // Gate-C defect B: no actor path crosses a tree/hedge or a production-prop footprint
      const obs = inObstacle(a.x, a.z, PAD)
      if (obs) {
        violations.push({ who, t: tt, x: Math.round(a.x * 100) / 100, z: Math.round(a.z * 100) / 100, hit: obs })
        if (isVeg(obs)) vegetationClear = false
        else propsClear = false
      }
      const hit = inFootprint(a.x, a.z, PAD)
      if (!hit) continue
      // the only legal footprint contact: an actor stepping through the OPEN stage door
      const legal = hit === 'stage-a' && open && atDoorway(a.x) && who !== 'van' && who !== 'approacher'
      if (!legal) {
        violations.push({ who, t: tt, x: Math.round(a.x * 100) / 100, z: Math.round(a.z * 100) / 100, hit })
        if (who === 'van') vanClear = false
        if (who === 'approacher' && hit === 'stage-a') approacherBlockedWhenClosed = false
        if (hit === 'stage-a') doorwayEntriesOnlyWhenOpen = false
      }
    }
  }

  // ambient loops: every segment must be clear of building footprints AND obstacles
  let ambientClear = true
  for (const r of AMBIENT_ROUTES) {
    for (let i = 0; i < r.path.length; i++) {
      const a = r.path[i]
      const b = r.path[(i + 1) % r.path.length]
      if (!segClear(a.x, a.z, b.x, b.z, 0.2)) {
        ambientClear = false
        const hit = inFootprint(a.x, a.z, 0.2) ?? inFootprint(b.x, b.z, 0.2) ?? 'unknown'
        violations.push({ who: r.id, x: a.x, z: a.z, hit })
      }
      if (!obstacleSegClear(a.x, a.z, b.x, b.z, 0.2)) {
        const hit = inObstacle(a.x, a.z, 0.2) ?? inObstacle(b.x, b.z, 0.2) ?? 'obstacle'
        if (isVeg(hit)) vegetationClear = false
        else propsClear = false
        violations.push({ who: r.id, x: a.x, z: a.z, hit })
      }
    }
  }

  // apron crew: spaced (no stacking) + clear of obstacles (Gate-C defect C)
  let crewSpacingOk = true
  const MIN_SPACING = 1.6
  for (let i = 0; i < APRON_CREW.length; i++) {
    const [cx, cz] = APRON_CREW[i]
    const obs = inObstacle(cx, cz, 0.25)
    if (obs) {
      crewSpacingOk = false
      violations.push({ who: `apron-crew-${i}`, x: cx, z: cz, hit: obs })
    }
    for (let j = i + 1; j < APRON_CREW.length; j++) {
      const [ox, oz] = APRON_CREW[j]
      if (Math.hypot(cx - ox, cz - oz) < MIN_SPACING) {
        crewSpacingOk = false
        violations.push({ who: `apron-crew-${i}/${j}`, x: cx, z: cz, hit: 'too-close' })
      }
    }
  }

  return {
    ok: violations.length === 0,
    vanClear,
    doorwayEntriesOnlyWhenOpen,
    approacherBlockedWhenClosed,
    ambientClear,
    vegetationClear,
    propsClear,
    crewSpacingOk,
    violations,
  }
}

function makeRenderer(): ThreeStudioLotRenderer {
  const r = new ThreeStudioLotRenderer({
    snapshot: MERIDIAN_ESTABLISHED,
    dev: true,
    onIntent: (e) => {
      intents.push(e)
      if (e.type === 'ready') playVignette() // the lot is alive by default
    },
  })
  r.mount(container)
  return r
}

let renderer = makeRenderer()

// ── dev/test hooks (never in an owner-facing build) ───────────────────────────
type SpikeApi = {
  intents: LotIntent[]
  camera: (preset: 'overview' | 'production' | 'human', instant?: boolean) => void
  focusBuilding: (id: BuildingId, instant?: boolean) => void
  focusCharacter: (id: string) => void
  returnToOverview: (instant?: boolean) => void
  playVignette: () => void
  pauseVignette: (p: boolean) => void
  seekVignette: (t: number) => void
  selectDirector: () => void
  validateRoutes: () => RouteReport
  debugState: () => {
    fps: number
    vignette: { active: boolean; t: number; paused: boolean }
    selectedBuilding: BuildingId | null
    selectedCharacter: string | null
    cameraToken: number
    canvases: number
  }
  recreate: () => void
}

const api: SpikeApi = {
  intents,
  camera: (preset, instant) => setCameraPreset(preset, instant),
  focusBuilding: (id, instant) => selectBuilding(id, instant),
  focusCharacter: (id) => renderer.focusCharacter(id),
  returnToOverview: (instant) => returnToOverview(instant),
  playVignette: () => playVignette(),
  pauseVignette: (p) => pauseVignette(p),
  seekVignette: (t) => seekVignette(t),
  selectDirector: () => {
    // deterministic character-selection for capture: the director at t=13 (a take)
    seekVignette(13)
    const d = sampleVignette(13).director
    selectCharacter(
      { id: 'char-director', role: 'Director', activity: 'On set', production: 'Gilded Horizon', building: 'Soundstage A' },
      [d.x, 1.5, d.z],
      true,
    )
  },
  validateRoutes,
  debugState: () => ({
    fps: state.fps,
    vignette: { active: state.vignette.active, t: Math.round(state.vignette.t * 100) / 100, paused: state.vignette.paused },
    selectedBuilding: state.selectedBuilding,
    selectedCharacter: state.selectedCharacter?.id ?? null,
    cameraToken: state.cameraToken,
    canvases: document.querySelectorAll('#root canvas').length,
  }),
  recreate: () => {
    renderer.destroy()
    renderer = makeRenderer()
  },
}
;(window as unknown as { __spike: SpikeApi }).__spike = api
