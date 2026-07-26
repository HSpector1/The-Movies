// ── Entry point ───────────────────────────────────────────────────────────────
// Wires the presentation surface (StudioLotView) to the host chrome. This file is
// the "application": it holds the current snapshot, swaps between the two fixture
// states, and routes navigation intents to prototype panels (here, the action log).
//
// The dashed data-flow the spike set out to prove:
//   StudioLotSnapshot → StudioLotView → building selected / navigation event

import { StudioLotView, type LotActionEvent, type SelectionInfo } from './StudioLotView'
import { createHost } from './ui/host'
import { FIXTURES, type FixtureKey } from './snapshot/fixtures'
import type { BuildingId } from './snapshot/StudioLotSnapshot'

const app = document.getElementById('app')!
const stage = document.getElementById('lot-stage')!

let mode: FixtureKey = 'struggling'

const host = createHost(app, mode, {
  onMode: (k) => setMode(k),
  onReset: () => view.resetCamera(),
  onAction: (id: BuildingId) => view.triggerAction(id),
  onClosePanel: () => view.clearSelection(),
})

const view = new StudioLotView({
  parent: stage as HTMLElement,
  snapshot: FIXTURES[mode],
  onSelect: (sel: SelectionInfo | null) => host.showSelection(sel),
  onAction: (e: LotActionEvent) => {
    host.logAction(labelFor(e.buildingId), e.action)
    // Prototype navigation: a real host would open the Phase 5 screen here.
    debugRecord(e)
  },
  onReady: () => host.setTopBar(FIXTURES[mode]),
})

host.setTopBar(FIXTURES[mode])

function setMode(k: FixtureKey): void {
  mode = k
  host.setActiveMode(k)
  host.setTopBar(FIXTURES[k])
  view.setSnapshot(FIXTURES[k])
}

const LABELS: Record<BuildingId, string> = {
  admin: 'Administration',
  writers: "Writers' Building",
  casting: 'Casting Office',
  'stage-a': 'Soundstage A',
  'stage-b': 'Soundstage B',
  post: 'Post-Production',
  theater: 'Screening Theater',
  gate: 'Studio Gate',
  expansion: 'Open Lot',
}
function labelFor(id: BuildingId): string {
  return LABELS[id]
}

// ── verification hook ─────────────────────────────────────────────────────────
// A tiny window-level record so the headless screenshot/interaction script can
// drive the view and assert behavior. Harmless in normal use.
type DebugApi = {
  events: LotActionEvent[]
  setMode: (k: FixtureKey) => void
  select: (id: BuildingId) => void
  clearSelection: () => void
  triggerAction: (id: BuildingId) => void
  camera: (preset: 'overview' | 'production' | 'wide' | 'entrance') => void
  debugState: () => ReturnType<StudioLotView['getDebugState']>
  recreate: () => void
}
const debug: DebugApi = {
  events: [],
  setMode,
  select: (id) => view.select(id),
  clearSelection: () => view.clearSelection(),
  triggerAction: (id) => view.triggerAction(id),
  camera: (preset) => view.camera(preset),
  debugState: () => view.getDebugState(),
  recreate: () => view.recreate(),
}
function debugRecord(e: LotActionEvent): void {
  debug.events.push(e)
}
;(window as unknown as { __lot: DebugApi }).__lot = debug
