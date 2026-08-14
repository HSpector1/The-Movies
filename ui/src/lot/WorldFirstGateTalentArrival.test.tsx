import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generateWorld } from '../../../src/core/index.ts'
import type { GameState } from '../engine/adapter.ts'
import {
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import type { HollywoodGateVisitorPresentation } from './hollywood/HollywoodScene.ts'
import { resetLotSelectedBuilding } from './snapshot/selectedBuildingSession.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'
import type {
  LotGateHiringCandidate,
  StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'
import type { GateCandidateOwnerIntent } from './snapshot/gateHiring.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'

const adapterBoundary = vi.hoisted(() => ({
  transform: null as null | ((snapshot: unknown) => unknown),
}))

vi.mock('../engine/adapter.ts', async () => {
  const actual = await vi.importActual<typeof import('../engine/adapter.ts')>('../engine/adapter.ts')
  return {
    ...actual,
    studioLotSnapshot(state: Parameters<typeof actual.studioLotSnapshot>[0]) {
      const snapshot = actual.studioLotSnapshot(state)
      return (adapterBoundary.transform?.(snapshot) ?? snapshot) as ReturnType<
        typeof actual.studioLotSnapshot
      >
    },
  }
})

const renderer = vi.hoisted(() => {
  type BuildingSelection = { buildingId: string } | null
  type PlaceSelection = {
    id: string
    buildingId: string
    label: string
    affordances: string[]
  }
  type GateVisitorSelection = { talentId: string }
  type Options = {
    snapshot: unknown
    onSelect?: (selection: BuildingSelection) => void
    onReady?: () => void
    onHollywoodFailure?: (reason: string) => void
    onHollywoodPlace?: (place: PlaceSelection) => void
    onHollywoodGateVisitor?: (visitor: GateVisitorSelection) => void
  }

  const controls = {
    autoReady: true,
    gateSelectable: true,
    visitorAccepted: true,
  }
  const instances: FakeView[] = []

  class FakeView {
    readonly opts: Options
    readonly snapshots: unknown[] = []
    readonly gateVisitors: Array<HollywoodGateVisitorPresentation | null> = []
    gateSelections = 0
    gateFocuses = 0
    placeSelection: string | null = null
    placeClears = 0
    pauses = 0
    resumes = 0
    inputSuspended: boolean[] = []
    destroyed = false

    constructor(opts: Options) {
      this.opts = opts
      this.snapshots.push(opts.snapshot)
      instances.push(this)
      if (controls.autoReady) queueMicrotask(() => opts.onReady?.())
    }

    ready() { this.opts.onReady?.() }
    fail() { this.opts.onHollywoodFailure?.('renderer-context-lost') }
    emitNativeGateSelection() { this.opts.onSelect?.({ buildingId: 'gate' }) }
    emitPlace(place: PlaceSelection) {
      // HollywoodScene paints a physical place before emitting its semantic event.
      this.placeSelection = place.id
      this.opts.onHollywoodPlace?.(place)
    }
    emitGateVisitor(talentId: string) {
      this.opts.onHollywoodGateVisitor?.({ talentId })
    }
    setSnapshot(snapshot: unknown) { this.snapshots.push(snapshot) }
    setHollywoodGateVisitor(visitor: HollywoodGateVisitorPresentation | null) {
      this.gateVisitors.push(visitor === null
        ? null
        : { ...visitor, offerTermWeeks: [...visitor.offerTermWeeks] })
      return visitor === null || controls.visitorAccepted
    }
    selectHollywoodGatePlace() {
      this.gateSelections += 1
      if (controls.gateSelectable) this.placeSelection = 'studio-gate'
      return controls.gateSelectable
    }
    focusHollywoodGate() {
      this.gateFocuses += 1
      return controls.gateSelectable
    }
    setInputSuspended(value: boolean) { this.inputSuspended.push(value) }
    select() {}
    clearSelection() {}
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {
      this.placeClears += 1
      this.placeSelection = null
    }
    selectHollywoodPerson() {}
    selectHollywoodProduction() { return true }
    selectHollywoodSceneryLoadIn() { return true }
    selectHollywoodAnnexPlace() { return true }
    selectHollywoodPublicityPlace() { return true }
    focusHollywoodPlace() {}
    pause() { this.pauses += 1 }
    resume() { this.resumes += 1 }
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() {}
    showHollywoodPublicity() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    destroy() { this.destroyed = true }
  }

  return { controls, FakeView, instances }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

function candidate(
  index: number,
  overrides: Partial<LotGateHiringCandidate> = {},
): LotGateHiringCandidate {
  const roles: LotGateHiringCandidate['creativeRole'][] = [
    'actor',
    'director',
    'writer',
    'craft',
  ]
  return {
    talentId: `gate-talent-${String(index)}`,
    name: `Gate Candidate ${String(index)}`,
    creativeRole: roles[index % roles.length]!,
    employmentStatus: 'freeAgent',
    offerTermWeeks: [52, 104, 156],
    ...overrides,
  }
}

function projectGate(
  candidates: LotGateHiringCandidate[],
  options: { week?: number; sceneSeed?: string } = {},
): void {
  adapterBoundary.transform = (value) => {
    const snapshot = value as StudioLotSnapshot
    const count = candidates.length
    return {
      ...snapshot,
      week: options.week ?? snapshot.week,
      sceneSeed: options.sceneSeed ?? snapshot.sceneSeed,
      people: snapshot.people.filter(
        (person) => !candidates.some((entry) => entry.talentId === person.id),
      ),
      buildings: snapshot.buildings.map((building) => building.id === 'gate'
        ? {
            ...building,
            available: true,
            attention: count === 0 ? 'empty' : 'active',
            attentionReason: count === 0
              ? 'No candidates with current contract terms'
              : `${String(count)} candidate${count === 1 ? '' : 's'} with current contract terms`,
          }
        : building),
      gateHiringMarket: { candidates },
    }
  }
}

type RenderOptions = {
  onProfile?: (intent: GateCandidateOwnerIntent) => boolean
  onHiring?: (intent: GateCandidateOwnerIntent) => boolean
  worldInputSuspended?: boolean
  entryFocus?: 'gate-arrivals' | 'gate-candidate'
  entryGateCandidate?: GateCandidateOwnerIntent
  openTalentProfileId?: string | null
  onCloseTalentProfile?: (talentId: string) => void
}

function lotElement(state: GameState, options: RenderOptions = {}) {
  return (
    <StudioLotScreen
      state={state}
      onNavigate={() => {}}
      onExit={() => {}}
      onAdvance={() => {}}
      {...(options.onProfile ? { onOpenGateCandidateProfile: options.onProfile } : {})}
      {...(options.onHiring ? { onOpenGateCandidateHiring: options.onHiring } : {})}
      {...(options.worldInputSuspended === undefined
        ? {}
        : { worldInputSuspended: options.worldInputSuspended })}
      {...(options.entryFocus ? { entryFocus: options.entryFocus } : {})}
      {...(options.entryGateCandidate
        ? { entryGateCandidate: options.entryGateCandidate }
        : {})}
      {...(options.openTalentProfileId === undefined
        ? {}
        : { openTalentProfileId: options.openTalentProfileId })}
      {...(options.onCloseTalentProfile
        ? { onCloseTalentProfile: options.onCloseTalentProfile }
        : {})}
    />
  )
}

function renderLot(state: GameState, options: RenderOptions = {}) {
  return render(lotElement(state, options))
}

async function latestView(): Promise<InstanceType<typeof renderer.FakeView>> {
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  return renderer.instances[0]!
}

function enterGateFromCompanion(): HTMLElement {
  fireEvent.click(screen.getByTestId('lot-nav-gate'))
  return screen.getByTestId('hollywood-gate-context')
}

function selectCandidate(talentId: string): HTMLElement {
  fireEvent.click(screen.getByTestId(`hollywood-gate-select-${talentId}`))
  return screen.getByTestId('hollywood-gate-visitor')
}

function profileButton(talentId: string): HTMLButtonElement {
  return screen.getByTestId(`hollywood-gate-open-profile-${talentId}`) as HTMLButtonElement
}

function hiringButton(talentId: string): HTMLButtonElement {
  return screen.getByTestId(`hollywood-gate-open-hiring-${talentId}`) as HTMLButtonElement
}

function expectedIntent(
  selected: LotGateHiringCandidate,
  studioSeed = 'gate-screen-studio',
): GateCandidateOwnerIntent {
  return {
    talentId: selected.talentId,
    studioSeed,
    name: selected.name,
    creativeRole: selected.creativeRole,
  }
}

const state = generateWorld('world-first-gate-screen')

beforeEach(() => {
  localStorage.clear()
  resetLotSelectedBuilding()
  resetLotStageAssignment()
  adapterBoundary.transform = null
  renderer.instances.length = 0
  renderer.controls.autoReady = true
  renderer.controls.gateSelectable = true
  renderer.controls.visitorAccepted = true
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  resetLotSelectedBuilding()
  resetLotStageAssignment()
  adapterBoundary.transform = null
  renderer.instances.length = 0
  renderer.controls.autoReady = true
  renderer.controls.gateSelectable = true
  renderer.controls.visitorAccepted = true
  setStudioLotOverviewOverride(false)
  setOperationHollywoodOverride(false)
  vi.restoreAllMocks()
})

describe('World-First Studio Gate Talent Arrival V1 — StudioLotScreen contract', () => {
  it('opens the neutral chooser from the exact physical Gate without choosing a visitor', async () => {
    const slate = [candidate(1), candidate(2)]
    projectGate(slate, { week: 13, sceneSeed: 'gate-screen-studio' })
    renderLot(state)
    const view = await latestView()
    const clearsBefore = view.placeClears

    act(() => view.emitPlace({
      id: 'studio-gate',
      buildingId: 'gate',
      label: 'Studio Gate',
      affordances: ['gate-security', 'arrival'],
    }))

    expect(screen.getByTestId('hollywood-gate-context')).toHaveTextContent('STUDIO GATE · WEEK 13')
    expect(screen.getByTestId('hollywood-gate-candidates')).toHaveTextContent(slate[0]!.name)
    expect(screen.queryByTestId('hollywood-gate-visitor')).not.toBeInTheDocument()
    expect(screen.getByTestId(`hollywood-gate-select-${slate[0]!.talentId}`)).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(view.gateVisitors.filter((visitor) => visitor !== null)).toEqual([])
    expect(view.placeSelection).toBe('studio-gate')
    expect(view.placeClears).toBe(clearsBefore)
    expect(screen.getByTestId('hollywood-gate-physical-status')).toHaveTextContent(
      'Selected in the living lot',
    )
  })

  it('opens the same neutral chooser through native building selection and companion control', async () => {
    const slate = [candidate(1), candidate(2)]
    projectGate(slate, { sceneSeed: 'gate-screen-studio' })
    renderLot(state)
    const view = await latestView()

    act(() => view.emitNativeGateSelection())
    expect(screen.getByTestId('hollywood-gate-candidates')).toBeInTheDocument()
    expect(screen.queryByTestId('hollywood-gate-visitor')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-nav-admin'))
    fireEvent.click(screen.getByTestId('lot-nav-gate'))
    expect(screen.getByTestId('hollywood-gate-candidates')).toBeInTheDocument()
    expect(screen.queryByTestId('hollywood-gate-visitor')).not.toBeInTheDocument()
    expect(view.gateSelections).toBeGreaterThan(0)
  })

  it('creates one distinct world visitor only after explicit selection and accepts identity-only canvas selection', async () => {
    const selected = candidate(3, { name: 'Mara Voss', creativeRole: 'director' })
    projectGate([candidate(1), selected], { week: 13, sceneSeed: 'gate-screen-studio' })
    renderLot(state)
    const view = await latestView()
    enterGateFromCompanion()

    const visitor = selectCandidate(selected.talentId)
    expect(visitor).toHaveTextContent('Mara Voss')
    expect(visitor).toHaveTextContent('Director')
    expect(screen.getByTestId(`hollywood-gate-select-${selected.talentId}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByTestId(`hollywood-select-person-${selected.talentId}`)).not.toBeInTheDocument()
    expect(view.gateVisitors.at(-1)).toEqual({
      talentId: selected.talentId,
      name: selected.name,
      marketRole: 'director',
      presentationRole: 'director',
      employmentStatus: 'freeAgent',
      studioSeed: 'gate-screen-studio',
      marketWeek: 13,
      offerTermWeeks: [52, 104, 156],
      placeId: 'studio-gate',
    })

    act(() => view.emitGateVisitor('not-the-selected-visitor'))
    expect(screen.getByTestId('hollywood-gate-visitor-heading')).toHaveTextContent('Mara Voss')
    act(() => view.emitGateVisitor(selected.talentId))
    await waitFor(() => expect(screen.getByTestId('hollywood-gate-visitor-heading')).toHaveFocus())
  })

  it('selects one candidate at most once across held-key repetition and its synthetic click', async () => {
    const selected = candidate(3, { name: 'Mara Voss', creativeRole: 'director' })
    projectGate([selected], { week: 13, sceneSeed: 'gate-screen-studio' })
    renderLot(state)
    const view = await latestView()
    enterGateFromCompanion()
    const button = screen.getByTestId(`hollywood-gate-select-${selected.talentId}`)
    const gateSelectionsBefore = view.gateSelections

    fireEvent.keyDown(button, { key: 'Enter', repeat: false })
    fireEvent.keyDown(button, { key: 'Enter', repeat: true })
    fireEvent.keyDown(button, { key: ' ', repeat: false })
    fireEvent.click(button, { detail: 0 })

    expect(view.gateSelections).toBe(gateSelectionsBefore + 1)
    expect(screen.getByTestId('hollywood-gate-visitor-heading')).toHaveTextContent('Mara Voss')
  })

  it('closes one stale Gate-origin profile, restores fresh Gate focus, and never resurrects it', async () => {
    const selected = candidate(3, { name: 'Mara Voss', creativeRole: 'director' })
    const replacement = candidate(4, { name: 'Inez North', creativeRole: 'writer' })
    const onCloseTalentProfile = vi.fn()
    const onProfile = vi.fn((_intent: GateCandidateOwnerIntent) => true)
    projectGate([selected], { week: 13, sceneSeed: 'gate-screen-studio' })
    const rendered = renderLot(state, { onCloseTalentProfile, onProfile })
    await latestView()
    enterGateFromCompanion()
    selectCandidate(selected.talentId)
    fireEvent.click(profileButton(selected.talentId), { detail: 0 })
    expect(onProfile).toHaveBeenCalledOnce()

    rendered.rerender(lotElement(state, {
      onCloseTalentProfile,
      onProfile,
      openTalentProfileId: selected.talentId,
      worldInputSuspended: true,
    }))
    projectGate([replacement], { week: 14, sceneSeed: 'gate-screen-studio' })
    rendered.rerender(lotElement({ ...state }, {
      onCloseTalentProfile,
      onProfile,
      openTalentProfileId: selected.talentId,
      worldInputSuspended: true,
    }))

    await waitFor(() => expect(onCloseTalentProfile).toHaveBeenCalledOnce())
    expect(onCloseTalentProfile).toHaveBeenCalledWith(selected.talentId)
    expect(screen.queryByTestId('hollywood-gate-visitor')).not.toBeInTheDocument()

    rendered.rerender(lotElement({ ...state }, {
      onCloseTalentProfile,
      onProfile,
      openTalentProfileId: null,
      worldInputSuspended: false,
    }))
    await waitFor(() => expect(screen.getByTestId('hollywood-gate-heading')).toHaveFocus())

    projectGate([selected], { week: 15, sceneSeed: 'gate-screen-studio' })
    rendered.rerender(lotElement({ ...state }, {
      onCloseTalentProfile,
      onProfile,
      openTalentProfileId: null,
      worldInputSuspended: false,
    }))
    expect(onCloseTalentProfile).toHaveBeenCalledOnce()
    expect(screen.queryByTestId('hollywood-gate-visitor')).not.toBeInTheDocument()
    expect(screen.getByTestId(`hollywood-gate-select-${selected.talentId}`)).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('focuses the exact retained visitor after a typed Gate return commits its inspector', async () => {
    const selected = candidate(3, { name: 'Mara Voss', creativeRole: 'director' })
    projectGate([selected], { week: 13, sceneSeed: 'gate-screen-studio' })
    renderLot(state, {
      entryFocus: 'gate-candidate',
      entryGateCandidate: expectedIntent(selected),
    })
    await latestView()

    await waitFor(() => expect(screen.getByTestId('hollywood-gate-visitor-heading')).toHaveFocus())
    expect(screen.getByTestId('hollywood-gate-visitor-heading')).toHaveTextContent('Mara Voss')
  })

  it('keeps the semantic visitor but discloses live physical rejection', async () => {
    const selected = candidate(3, { name: 'Mara Voss', creativeRole: 'director' })
    projectGate([selected], { week: 13, sceneSeed: 'gate-screen-studio' })
    renderer.controls.visitorAccepted = false
    renderLot(state)
    await latestView()
    enterGateFromCompanion()

    selectCandidate(selected.talentId)

    expect(screen.getByTestId('hollywood-gate-visitor-heading')).toHaveTextContent('Mara Voss')
    expect(screen.getByTestId('hollywood-gate-physical-status')).toHaveTextContent(
      'physical Gate is unavailable',
    )
  })

  it('feeds delayed renderer readiness the latest snapshot and visitor fields', async () => {
    const selected = candidate(4, { name: 'Inez North', offerTermWeeks: [26, 52] })
    projectGate([selected], { week: 7, sceneSeed: 'gate-screen-studio' })
    renderer.controls.autoReady = false
    const rendered = renderLot(state)
    const view = await latestView()
    enterGateFromCompanion()
    selectCandidate(selected.talentId)

    const fresh = { ...selected, offerTermWeeks: [26, 52, 104] }
    projectGate([fresh], { week: 8, sceneSeed: 'gate-screen-studio' })
    rendered.rerender(lotElement({ ...state }))

    await waitFor(() => expect(view.snapshots.at(-1)).toMatchObject({ week: 8 }))
    expect(view.gateVisitors.at(-1)).toMatchObject({
      talentId: fresh.talentId,
      marketWeek: 8,
      offerTermWeeks: [26, 52, 104],
    })

    act(() => view.ready())
    await waitFor(() => expect(screen.getByTestId('hollywood-gate-physical-status')).toHaveTextContent(
      'Selected in the living lot',
    ))
    expect(view.snapshots.at(-1)).toMatchObject({ week: 8 })
    expect(view.gateVisitors.at(-1)).toMatchObject({ marketWeek: 8 })
  })

  it('keeps complete semantic Gate play available after renderer failure', async () => {
    const selected = candidate(1)
    const onProfile = vi.fn((_intent: GateCandidateOwnerIntent) => true)
    projectGate([selected], { sceneSeed: 'gate-screen-studio' })
    renderLot(state, { onProfile })
    const view = await latestView()
    enterGateFromCompanion()

    act(() => view.fail())
    expect(screen.getByTestId('hollywood-gate-physical-status')).toHaveTextContent(
      'physical Gate is unavailable',
    )
    selectCandidate(selected.talentId)
    fireEvent.click(profileButton(selected.talentId), { detail: 0 })
    expect(onProfile).toHaveBeenCalledOnce()
    expect(onProfile).toHaveBeenCalledWith(expectedIntent(selected))
    expect(screen.getByTestId('hollywood-gate-context')).toBeInTheDocument()
  })

  it.each(['profile', 'hiring'] as const)(
    'hands off the exact current candidate to %s at most once',
    async (destination) => {
      const selected = candidate(2, { name: 'Inez North', creativeRole: 'writer' })
      const onProfile = vi.fn((_intent: GateCandidateOwnerIntent) => true)
      const onHiring = vi.fn((_intent: GateCandidateOwnerIntent) => true)
      projectGate([selected], { sceneSeed: 'gate-screen-studio' })
      renderLot(state, { onProfile, onHiring })
      await latestView()
      enterGateFromCompanion()
      selectCandidate(selected.talentId)

      const button = destination === 'profile'
        ? profileButton(selected.talentId)
        : hiringButton(selected.talentId)
      fireEvent.click(button, { detail: 0 })
      fireEvent.click(button, { detail: 0 })

      const expectedOwner = destination === 'profile' ? onProfile : onHiring
      const otherOwner = destination === 'profile' ? onHiring : onProfile
      expect(expectedOwner).toHaveBeenCalledOnce()
      expect(expectedOwner).toHaveBeenCalledWith(expectedIntent(selected))
      expect(otherOwner).not.toHaveBeenCalled()
    },
  )

  it('rejects a stale pointer token after retained-candidate terms and week change', async () => {
    const original = candidate(1, { offerTermWeeks: [52, 104] })
    const fresh = candidate(1, { offerTermWeeks: [26, 52, 104, 208] })
    const onProfile = vi.fn((_intent: GateCandidateOwnerIntent) => true)
    projectGate([original], { week: 13, sceneSeed: 'gate-screen-studio' })
    const rendered = renderLot(state, { onProfile })
    const view = await latestView()
    enterGateFromCompanion()
    selectCandidate(original.talentId)
    fireEvent.pointerDown(profileButton(original.talentId))

    projectGate([fresh], { week: 14, sceneSeed: 'gate-screen-studio' })
    rendered.rerender(lotElement({ ...state }, { onProfile }))
    await waitFor(() => expect(screen.getByTestId('hollywood-gate-context')).toHaveTextContent(
      'STUDIO GATE · WEEK 14',
    ))
    expect(screen.getByTestId('hollywood-gate-visitor')).toHaveTextContent(
      '4 terms · 26 weeks · 52 weeks · 104 weeks · 208 weeks',
    )

    // Compatibility mousedown belongs to the old physical gesture and cannot
    // replace its captured Week-13/terms token with freshly rendered truth.
    fireEvent.mouseDown(profileButton(original.talentId))
    fireEvent.click(profileButton(original.talentId), { detail: 1 })
    expect(onProfile).not.toHaveBeenCalled()
    expect(screen.getByTestId('hollywood-activity-message')).toHaveTextContent(
      'Gate visitor details changed',
    )
    expect(view.gateVisitors.at(-1)).toMatchObject({
      talentId: fresh.talentId,
      marketWeek: 14,
      offerTermWeeks: [26, 52, 104, 208],
    })
    expect(screen.getByTestId('hollywood-gate-visitor-heading')).toHaveTextContent(fresh.name)
  })

  it('clears a replaced candidate to the neutral Gate without selecting a substitute', async () => {
    const original = candidate(1, { name: 'Original Visitor' })
    const replacement = candidate(2, { name: 'Replacement Visitor' })
    const onProfile = vi.fn((_intent: GateCandidateOwnerIntent) => true)
    projectGate([original], { week: 13, sceneSeed: 'gate-screen-studio' })
    const rendered = renderLot(state, { onProfile })
    await latestView()
    enterGateFromCompanion()
    selectCandidate(original.talentId)
    fireEvent.pointerDown(profileButton(original.talentId))

    projectGate([replacement], { week: 14, sceneSeed: 'gate-screen-studio' })
    rendered.rerender(lotElement({ ...state }, { onProfile }))

    await waitFor(() => expect(screen.queryByTestId('hollywood-gate-visitor')).not.toBeInTheDocument())
    expect(screen.getByTestId(`hollywood-gate-select-${replacement.talentId}`)).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByTestId('hollywood-gate-candidates')).toHaveTextContent('Replacement Visitor')
    expect(onProfile).not.toHaveBeenCalled()

    // The late click from the invalidated original gesture is consumed even if
    // the player has meanwhile made the replacement an explicit world visitor.
    selectCandidate(replacement.talentId)
    fireEvent.click(profileButton(replacement.talentId), { detail: 1 })
    expect(onProfile).not.toHaveBeenCalled()
    fireEvent.pointerDown(profileButton(replacement.talentId))
    fireEvent.click(profileButton(replacement.talentId), { detail: 1 })
    expect(onProfile).toHaveBeenCalledOnce()
    expect(onProfile).toHaveBeenCalledWith(expectedIntent(replacement))
  })

  it('retains the same candidate identity while refreshing visible week, terms, and canvas truth', async () => {
    const original = candidate(1, { name: 'Retained Visitor', offerTermWeeks: [52] })
    const fresh = candidate(1, { name: 'Retained Visitor', offerTermWeeks: [26, 52, 104] })
    projectGate([original], { week: 7, sceneSeed: 'gate-screen-studio' })
    const rendered = renderLot(state)
    const view = await latestView()
    enterGateFromCompanion()
    selectCandidate(original.talentId)

    projectGate([fresh], { week: 8, sceneSeed: 'gate-screen-studio' })
    rendered.rerender(lotElement({ ...state }))

    await waitFor(() => expect(screen.getByTestId('hollywood-gate-context')).toHaveTextContent(
      'STUDIO GATE · WEEK 8',
    ))
    expect(screen.getByTestId('hollywood-gate-visitor')).toHaveTextContent(
      '3 terms · 26 weeks · 52 weeks · 104 weeks',
    )
    expect(screen.getByTestId(`hollywood-gate-select-${fresh.talentId}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(view.gateVisitors.at(-1)).toMatchObject({
      talentId: fresh.talentId,
      marketWeek: 8,
      offerTermWeeks: [26, 52, 104],
    })
  })

  it('returns a stale exact-candidate entry to a neutral current slate without substitution', async () => {
    const stale = candidate(1, { name: 'Departed Visitor' })
    const current = candidate(2, { name: 'Current Visitor' })
    projectGate([current], { week: 14, sceneSeed: 'gate-screen-studio' })
    renderLot(state, {
      entryFocus: 'gate-candidate',
      entryGateCandidate: expectedIntent(stale),
    })
    await latestView()

    const context = await screen.findByTestId('hollywood-gate-context')
    expect(context).toHaveTextContent('Current Visitor')
    expect(context).not.toHaveTextContent('Departed Visitor')
    expect(screen.queryByTestId('hollywood-gate-visitor')).not.toBeInTheDocument()
    expect(screen.getByTestId(`hollywood-gate-select-${current.talentId}`)).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await waitFor(() => expect(screen.getByTestId('hollywood-gate-heading')).toHaveFocus())
  })

  it('cancels a begun pointer gesture across a modal and accepts only a fresh boundary', async () => {
    const selected = candidate(1)
    const onProfile = vi.fn((_intent: GateCandidateOwnerIntent) => true)
    projectGate([selected], { sceneSeed: 'gate-screen-studio' })
    const rendered = renderLot(state, { onProfile })
    await latestView()
    enterGateFromCompanion()
    selectCandidate(selected.talentId)
    fireEvent.pointerDown(profileButton(selected.talentId))

    rendered.rerender(lotElement(state, { onProfile, worldInputSuspended: true }))
    rendered.rerender(lotElement(state, { onProfile }))
    fireEvent.click(profileButton(selected.talentId), { detail: 1 })
    expect(onProfile).not.toHaveBeenCalled()

    fireEvent.pointerDown(profileButton(selected.talentId))
    fireEvent.click(profileButton(selected.talentId), { detail: 1 })
    expect(onProfile).toHaveBeenCalledOnce()
  })

  it('cancels a begun pointer gesture while hidden and keeps fresh visible activation exact-once', async () => {
    const selected = candidate(1)
    const onHiring = vi.fn((_intent: GateCandidateOwnerIntent) => true)
    projectGate([selected], { sceneSeed: 'gate-screen-studio' })
    renderLot(state, { onHiring })
    const view = await latestView()
    enterGateFromCompanion()
    selectCandidate(selected.talentId)
    fireEvent.pointerDown(hiringButton(selected.talentId))

    let hidden = true
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    document.dispatchEvent(new Event('visibilitychange'))
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    fireEvent.click(hiringButton(selected.talentId), { detail: 1 })
    expect(onHiring).not.toHaveBeenCalled()
    expect(view.pauses).toBeGreaterThan(0)
    expect(view.resumes).toBeGreaterThan(0)

    fireEvent.pointerDown(hiringButton(selected.talentId))
    fireEvent.click(hiringButton(selected.talentId), { detail: 1 })
    expect(onHiring).toHaveBeenCalledOnce()
  })

  it('allows one fresh virtual-AT click after pointer cancellation', async () => {
    const selected = candidate(1)
    const onProfile = vi.fn((_intent: GateCandidateOwnerIntent) => true)
    projectGate([selected], { sceneSeed: 'gate-screen-studio' })
    renderLot(state, { onProfile })
    await latestView()
    enterGateFromCompanion()
    selectCandidate(selected.talentId)
    const button = profileButton(selected.talentId)

    fireEvent.pointerDown(button)
    fireEvent.pointerCancel(button)
    fireEvent.click(button, { detail: 0 })
    fireEvent.click(button, { detail: 0 })

    expect(onProfile).toHaveBeenCalledOnce()
  })

  it('allows at most one owner call across held-key repetition and synthetic click', async () => {
    const selected = candidate(1)
    const onHiring = vi.fn((_intent: GateCandidateOwnerIntent) => true)
    projectGate([selected], { sceneSeed: 'gate-screen-studio' })
    renderLot(state, { onHiring })
    await latestView()
    enterGateFromCompanion()
    selectCandidate(selected.talentId)
    const button = hiringButton(selected.talentId)

    fireEvent.keyDown(button, { key: 'Enter', repeat: false })
    fireEvent.keyDown(button, { key: 'Enter', repeat: true })
    fireEvent.click(button, { detail: 0 })
    fireEvent.click(button, { detail: 2 })

    expect(onHiring).toHaveBeenCalledOnce()
    expect(onHiring).toHaveBeenCalledWith(expectedIntent(selected))
  })

  it('does not retry a rejected keyboard owner through its synthetic click', async () => {
    const selected = candidate(1)
    const onHiring = vi.fn((_intent: GateCandidateOwnerIntent) => false)
    projectGate([selected], { sceneSeed: 'gate-screen-studio' })
    renderLot(state, { onHiring })
    await latestView()
    enterGateFromCompanion()
    selectCandidate(selected.talentId)
    const button = hiringButton(selected.talentId)

    fireEvent.keyDown(button, { key: 'Enter', repeat: false })
    fireEvent.click(button, { detail: 0 })

    expect(onHiring).toHaveBeenCalledOnce()
    expect(onHiring).toHaveBeenCalledWith(expectedIntent(selected))
  })

  it('blocks a second held key but permits a fresh rejected-key retry after keyup without a click', async () => {
    const selected = candidate(1)
    const onHiring = vi.fn((_intent: GateCandidateOwnerIntent) => false)
    projectGate([selected], { sceneSeed: 'gate-screen-studio' })
    renderLot(state, { onHiring })
    await latestView()
    enterGateFromCompanion()
    selectCandidate(selected.talentId)
    const button = hiringButton(selected.talentId)

    fireEvent.keyDown(button, { key: 'Enter', repeat: false })
    fireEvent.keyDown(button, { key: ' ', repeat: false })
    expect(onHiring).toHaveBeenCalledOnce()

    fireEvent.keyUp(document, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ', repeat: false })
    fireEvent.keyUp(document, { key: ' ' })
    expect(onHiring).toHaveBeenCalledTimes(2)
    expect(onHiring).toHaveBeenNthCalledWith(2, expectedIntent(selected))
  })

  it('keeps more than eight arrivals as complete native semantic controls', async () => {
    const slate = Array.from({ length: 10 }, (_, index) => candidate(index + 1))
    projectGate(slate, { sceneSeed: 'gate-screen-studio' })
    renderLot(state)
    await latestView()
    enterGateFromCompanion()

    const group = screen.getByRole('group', {
      name: '10 candidates with current contract terms',
    })
    const controls = within(group).getAllByRole('button')
    expect(controls).toHaveLength(10)
    for (const [index, control] of controls.entries()) {
      expect(control.tagName).toBe('BUTTON')
      expect(control).toHaveAttribute('aria-pressed', 'false')
      expect(control).toHaveAccessibleName(
        `${slate[index]!.name} · ${['Director', 'Writer', 'Craft', 'Actor'][index % 4]!}`,
      )
    }

    fireEvent.click(controls[9]!)
    expect(controls[9]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('hollywood-gate-visitor-heading')).toHaveTextContent(slate[9]!.name)
  })
})
