// ── PF1-M2 wiring proofs ─────────────────────────────────────────────────────
//
// The pure grammar and the dispatcher are pinned by the contract suite in
// `ui/src/test/contracts/`. These are the things a contract test CANNOT reach: whether
// the call sites are actually attached, whether the promoted announcements really became
// visible without growing a second live region, whether the receipt strip really expires,
// and whether the cash readout can ever show a figure that is not the studio's.

import { useState } from 'react'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  advanceWeek,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  signContractAction,
  startDevelopmentCastingAnnexAction,
} from '../engine/adapter.ts'
import type { CreativeRole, GameState } from '../engine/adapter.ts'
import { saveActiveSession } from '../engine/session.ts'
import { setStudioLotOverviewOverride } from '../flags.ts'
import { initAudioService } from '../audio/audioService.ts'
import { RecordingSink } from '../audio/sink.ts'
import { App } from '../App.tsx'
import { StudioLotScreen } from '../lot/StudioLotScreen.tsx'
import { CashReadout } from './CashReadout.tsx'

// A renderer double thin enough to be honest and rich enough to emit one activity line —
// the shortest genuine route to the receipt strip that does not fabricate its state.
const rendererSpy = vi.hoisted(() => {
  const emitters: Array<(text: string | null) => void> = []
  class FakeView {
    constructor(options: { onReady?: () => void; onActivity?: (text: string | null) => void }) {
      if (options.onActivity) emitters.push(options.onActivity)
      queueMicrotask(() => options.onReady?.())
    }
    setSnapshot() {}
    select() {}
    selectHollywoodAnnexPlace() { return true }
    clearSelection() {}
    clearHollywoodPlaceSelection() {}
    clearHollywoodPersonSelection() {}
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    worldSelection() { return { placeId: null, productionId: null, personId: null } }
    camera() {}
    destroy() {}
  }
  return { emitters, FakeView }
})

vi.mock('../lot/StudioLotView.ts', () => ({ StudioLotView: rendererSpy.FakeView }))

const COUNTS: Record<CreativeRole, number> = { actor: 3, director: 1, writer: 2, craft: 1 }

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

let sink: RecordingSink

function played(): string[] {
  return sink.log
    .filter((call): call is Extract<typeof call, { call: 'play' }> => call.call === 'play')
    .map((call) => call.assetId)
}

beforeEach(() => {
  localStorage.clear()
  rendererSpy.emitters.length = 0
  sink = new RecordingSink()
  // The studio is already unlocked in these proofs: the autoplay gate is M1's contract,
  // and a locked service would make every assertion below trivially pass on silence.
  initAudioService(sink).unlock()
  sink.log.length = 0
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  setStudioLotOverviewOverride(false)
})

// ── The receipt strip is news, not furniture ─────────────────────────────────

describe('PF1-M2 — the transient notice lifecycle', () => {
  function Harness({ initialEpoch = 0 }: { initialEpoch?: number }) {
    const [epoch, setEpoch] = useState(initialEpoch)
    const [state] = useState(() => managedStudio('pf1-m2-strip'))
    return (
      <>
        <button type="button" data-testid="bump" onClick={() => { setEpoch((e) => e + 1) }}>
          another action
        </button>
        <StudioLotScreen
          state={state}
          noticeEpoch={epoch}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => {}}
        />
      </>
    )
  }

  function emit(text: string) {
    act(() => {
      for (const emitter of rendererSpy.emitters) emitter(text)
    })
  }

  it('keeps the announcement through the action that produced it', async () => {
    render(<Harness />)
    await screen.findByTestId('studio-lot-screen')
    emit('A renderer route finished.')
    expect(screen.getByTestId('hollywood-activity-message')).toHaveTextContent(
      'A renderer route finished.',
    )
    // An ordinary repaint is not a new action.
    emit('A renderer route finished.')
    expect(screen.getByTestId('hollywood-activity-message')).toBeInTheDocument()
  })

  it('expires the announcement on the next player action, keeping its live region mounted', async () => {
    render(<Harness />)
    await screen.findByTestId('studio-lot-screen')
    emit('A renderer route finished.')
    const owner = screen.getByTestId('hollywood-activity-announcement')

    act(() => { fireEvent.click(screen.getByTestId('bump')) })

    expect(screen.queryByTestId('hollywood-activity-message')).not.toBeInTheDocument()
    // The polite region itself is never unmounted (law 26): only its child goes.
    expect(screen.getByTestId('hollywood-activity-announcement')).toBe(owner)
    expect(owner).toHaveAttribute('aria-live', 'polite')
    expect(owner).toHaveTextContent('')
  })

  it('keeps an announcement made in the SAME commit as the action that bumped the epoch', async () => {
    render(<Harness />)
    await screen.findByTestId('studio-lot-screen')
    // The publicity ordering: the Lot announces inside the same click that replaced the
    // authoritative state. The notice belongs to the NEW epoch, not the old one.
    act(() => {
      fireEvent.click(screen.getByTestId('bump'))
      for (const emitter of rendererSpy.emitters) emitter('Accepted in the same stack.')
    })
    expect(screen.getByTestId('hollywood-activity-message')).toHaveTextContent(
      'Accepted in the same stack.',
    )
    // …and it still expires on the NEXT one.
    act(() => { fireEvent.click(screen.getByTestId('bump')) })
    expect(screen.queryByTestId('hollywood-activity-message')).not.toBeInTheDocument()
  })
})

// ── The promoted announcements ───────────────────────────────────────────────

describe('PF1-M2 — aria-only promotion', () => {
  function renderLot(state: GameState, week: number) {
    return render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        advanceFeedback={{ week, constructionCompletion: null }}
      />,
    )
  }

  it('makes the week update a visible notice in the SAME region, once', async () => {
    const state = managedStudio('pf1-m2-week-notice')
    renderLot(state, 7)
    await screen.findByTestId('studio-lot-screen')

    const regions = screen.getAllByTestId('lot-week-update-announcement')
    expect(regions).toHaveLength(1) // one element, one announcement, zero double-announce
    const region = regions[0]!
    expect(region).not.toHaveClass('visually-hidden')
    expect(region).toHaveClass('lot-notice')
    expect(region).toHaveAttribute('role', 'status')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveAttribute('aria-atomic', 'true')
    // The composed copy is carried verbatim — promotion replaces nothing accessible.
    // PF1-M3 VOICE PASS re-pin (charter §3): the week notice now reads "Week N on the lot."
    // Once M2 made this region visible, "Week N. Studio Lot updated." became copy the player
    // reads every week, and a routine week gets a quiet line, not a bulletin. Structure is
    // untouched — same single element, role, aria-live, aria-atomic, testid — so this suite
    // still proves exactly what it proved: one region, one announcement, copy carried verbatim.
    expect(region).toHaveTextContent('Week 7 on the lot.')
  })

  it('costs the column NOTHING: both promoted strips are an overlay on the stage', async () => {
    // PF1-M4 layout-neutrality pin. M2 put these strips in the `.lot-screen` COLUMN, above
    // the topbar, where a visible notice added its own height to a column that is already
    // `min-height: 100vh`. That pushed the world and every panel anchored inside it past
    // the governed viewport, the document scrolled, and two reachability specs read a
    // context panel at a negative top (`lot.spec.ts` @ 960x540) and below the bottom edge
    // (`publicity-campaign-v1.spec.ts` @ 200% zoom).
    //
    // jsdom has no layout engine, so this pins the two facts that CAUSE layout neutrality
    // and can be checked here: the strips are not column children, and the stylesheet takes
    // them out of flow without letting them take a click. Geometry itself stays where it
    // belongs — in the governed-viewport browser specs.
    const state = managedStudio('pf1-m4-layout-neutral')
    renderLot(state, 5)
    await screen.findByTestId('studio-lot-screen')

    for (const testid of ['lot-week-update-announcement', 'lot-annex-operational-announcement']) {
      const region = screen.getByTestId(testid)
      expect(region.parentElement, `${testid} sits inside the stage`).toHaveClass('lot-stage-wrap')
      expect(
        region.closest('.lot-screen > *')?.classList.contains('lot-notice'),
        `${testid} is not a direct child of the column`,
      ).toBe(false)
    }

    const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'lot', 'lot.css'), 'utf8')
    const block = /\.lot-notice\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(block, 'the strips are declared out of flow').toContain('position: absolute')
    expect(block, 'and non-interactive: they carry no control').toContain('pointer-events: none')
    expect(block, 'the M2 flex-item declaration is gone with the defect').not.toContain('flex:')
  })

  it('keeps the topbar to ONE ROW by compacting Saves and Settings, losing nothing', async () => {
    // PF1-M4 addendum 2 intent pin. M3 added these two entries to a flex row that was
    // already full, so below ~1120px the row wrapped and the topbar went 63px → 119.5px —
    // the height that pushed the anchored panels out of the governed viewport
    // (`lot.spec.ts` context top -80.5 @ 960x540; `publicity-campaign-v1.spec.ts` bottom
    // 805.5 in a 768-tall viewport). Below the breakpoint they compact to their glyph.
    //
    // C2a-M5 RE-PIN, with the measurement behind it. Living Turn V1 put the studio's
    // TRANSPORT in the same row (charter §4.1), and the row was already full. Measured on
    // a real browser run at HEAD, `.lot-topbar` height at the governed widths:
    //   1280×900  63 shipped → 119.5 with the transport;  1120×720  63 → 115.
    // The 56px is the same regression this pin exists to prevent, so the BAND the addendum
    // defined widens from 1120px to 1400px and the two MANUAL ADVANCE VERBS join Saves and
    // Settings as compactable entries — the two the charter itself demotes ("the ruling
    // demotes [Advance Week] from required heartbeat to option", `08A` §4). After it:
    //   1440 63 · 1280 63 · 1120 63 · 960 115 (960 is IDENTICAL to the shipped bar, which
    //   already wrapped there and which every panel assertion is written against).
    // Nothing is weakened: the pin now covers FOUR entries instead of two, and the same
    // four properties are asserted on each.
    //
    // jsdom has no layout engine and evaluates no media query, so this pins what it CAN
    // see: nothing was hidden or renamed, the handlers and testids are untouched, and the
    // stylesheet's compact rules say what they must. Geometry stays with the browser specs.
    const state = managedStudio('pf1-m4-topbar-one-row')
    const navigations: unknown[] = []
    const settingsOpened: number[] = []
    render(
      <StudioLotScreen
        state={state}
        onNavigate={(route) => navigations.push(route)}
        onExit={() => {}}
        onAdvance={() => {}}
        onOpenSettings={() => settingsOpened.push(1)}
      />,
    )
    await screen.findByTestId('studio-lot-screen')

    for (const [testid, name, treatment] of [
      ['lot-open-saves', 'Saves', 'ghost'],
      ['lot-open-settings', 'Settings', 'ghost'],
      ['lot-advance-week', 'Advance one week', 'primary'],
      ['lot-sim-to-next-event', 'Sim to next event', 'accent'],
    ] as const) {
      const control = screen.getByTestId(testid)
      expect(control.tagName, `${name} is still a button`).toBe('BUTTON')
      expect(control, `${name} keeps its treatment`).toHaveClass(treatment)
      expect(control, `${name} is compactable`).toHaveClass('lot-topbar-compactable')
      // The full name is spoken whichever span is painted.
      expect(control).toHaveAttribute('aria-label', name)
      expect(control.getAttribute('title')?.length ?? 0, `${name} has a tooltip`).toBeGreaterThan(0)
      // The words are still in the document, and the mark is decorative.
      expect(control.querySelector('.lot-topbar-label')).toHaveTextContent(name)
      const mark = control.querySelector('.lot-topbar-mark')
      expect(mark, `${name} carries a glyph`).not.toBeNull()
      expect(mark).toHaveAttribute('aria-hidden', 'true')
      expect((mark?.textContent ?? '').trim().length, `${name} glyph is not empty`).toBeGreaterThan(0)
      // Accessible-name lookup still finds it, under the same name as before.
      expect(screen.getByRole('button', { name })).toBe(control)
    }

    // The handlers are the ones they always were.
    fireEvent.click(screen.getByTestId('lot-open-saves'))
    expect(navigations).toEqual([{ kind: 'saves' }])
    fireEvent.click(screen.getByTestId('lot-open-settings'))
    expect(settingsOpened).toHaveLength(1)

    const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'lot', 'lot.css'), 'utf8')
    const compact = /@media \(max-width: 1400px\) \{([\s\S]*?)\n\}/.exec(css)?.[1] ?? ''
    expect(compact, 'the breakpoint exists').not.toBe('')
    expect(compact, 'the glyph appears below it').toContain('.lot-topbar-mark')
    expect(compact, 'and the words are clipped, never display:none').toContain('clip: rect(0, 0, 0, 0)')
    expect(compact).not.toMatch(/\.lot-topbar-label\s*\{[^}]*display:\s*none/)
    expect(compact, 'the hit target never drops below 44px').toContain('min-width: 44px')
    expect(compact).toContain('min-height: 44px')
    // The studio's own focus ring is untouched and still reaches these buttons.
    expect(css).toContain('.lot-screen :focus-visible')
    // And the blocked-state reason can no longer make the bar taller.
    const reason = /\.lot-next-event-disabled-reason \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(reason, 'the explainer line hangs below the bar instead of growing it').toContain(
      'position: absolute',
    )
  })

  it('leaves the three already-visible announcements screen-reader-only', async () => {
    const state = managedStudio('pf1-m2-unpromoted')
    renderLot(state, 3)
    await screen.findByTestId('studio-lot-screen')

    for (const testid of [
      'lot-casting-review-announcement',
      'lot-production-formation-announcement',
      'lot-script-review-announcement',
    ]) {
      expect(screen.getByTestId(testid)).toHaveClass('visually-hidden')
    }
  })

  it('animates the promoted notice, and does not under reduced motion', async () => {
    const state = managedStudio('pf1-m2-motion')
    const full = renderLot(state, 4)
    await screen.findByTestId('studio-lot-screen')
    expect(
      full.getByTestId('lot-week-update-announcement').querySelector('.lot-notice-line'),
    ).toHaveAttribute('data-motion', 'emphasis')
    cleanup()

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    const reduced = renderLot(state, 4)
    await screen.findByTestId('studio-lot-screen')
    expect(reduced.getByTestId('studio-lot-screen')).toHaveClass('lot-reduced-motion')
    expect(
      reduced.getByTestId('lot-week-update-announcement').querySelector('.lot-notice-line'),
    ).toHaveAttribute('data-motion', 'none')
    // The copy is identical either way: reduced motion removes movement, never information.
    expect(reduced.getByTestId('lot-week-update-announcement')).toHaveTextContent(
      'Week 4 on the lot.',
    )
  })
})

// ── The cash readout ─────────────────────────────────────────────────────────

describe('PF1-M2 — the cash count-up', () => {
  function stubFrames() {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.push(cb)
      return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    return frames
  }

  it('never counts on arrival', () => {
    stubFrames()
    const { container, getByTestId } = render(
      <CashReadout cash={250_000} reducedMotion={false} />,
    )
    expect(getByTestId('lot-cash')).toHaveTextContent('$250,000')
    expect(container.querySelector('.lot-cash-countup')).toBeNull()
  })

  it('swaps instantly under reduced motion — no overlay at all', () => {
    stubFrames()
    const { container, getByTestId, rerender } = render(
      <CashReadout cash={100_000} reducedMotion={true} />,
    )
    rerender(<CashReadout cash={40_000} reducedMotion={true} />)
    expect(getByTestId('lot-cash')).toHaveTextContent('$40,000')
    expect(container.querySelector('.lot-cash-countup')).toBeNull()
    expect(container.querySelector('.lot-cash-slot')).not.toHaveAttribute('data-counting')
  })

  it('counts over a fixed duration while the testid keeps the authoritative figure', () => {
    const frames = stubFrames()
    const { container, getByTestId, rerender } = render(
      <CashReadout cash={100_000} reducedMotion={false} />,
    )
    rerender(<CashReadout cash={200_000} reducedMotion={false} />)

    const overlay = container.querySelector('.lot-cash-countup')
    expect(overlay).not.toBeNull()
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.lot-cash-slot')).toHaveAttribute('data-counting', 'true')
    // MID-COUNT: the readout the accessible name and every test reads is already final.
    expect(getByTestId('lot-cash')).toHaveTextContent('$200,000')

    act(() => { frames[frames.length - 1]!(0) })
    expect(overlay!.textContent).not.toBe('$200,000') // it is genuinely travelling
    expect(getByTestId('lot-cash')).toHaveTextContent('$200,000')

    // One fixed duration later — never a week-paced one — it settles and unmounts.
    act(() => { frames[frames.length - 1]!(500) })
    expect(container.querySelector('.lot-cash-countup')).toBeNull()
    expect(container.querySelector('.lot-cash-slot')).not.toHaveAttribute('data-counting')
    expect(getByTestId('lot-cash')).toHaveTextContent('$200,000')
  })

  it('formats a negative studio exactly as the topbar always did', () => {
    stubFrames()
    const { getByTestId } = render(<CashReadout cash={-1_500} reducedMotion={true} />)
    expect(getByTestId('lot-cash')).toHaveTextContent('-$1,500')
  })
})

// ── The call sites are actually attached ─────────────────────────────────────

describe('PF1-M2 — punctuation at App’s advance gates', () => {
  it('gives an ordinary week the quiet tick', async () => {
    setStudioLotOverviewOverride(true)
    saveActiveSession(managedStudio('pf1-m2-advance-tick'))

    render(<App />)
    await screen.findByTestId('studio-lot-screen')
    sink.log.length = 0

    fireEvent.click(screen.getByTestId('lot-advance-week'))
    expect(played()).toEqual(['cue-select.m4a'])
  })

  it('gives a facility completion its sting instead of the tick', async () => {
    setStudioLotOverviewOverride(true)
    let state = managedStudio('pf1-m2-completion-sting')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 12; i++) state = advanceWeek(state).next
    saveActiveSession(state)

    render(<App />)
    await screen.findByTestId('studio-lot-screen')
    sink.log.length = 0

    fireEvent.click(screen.getByTestId('lot-advance-week'))
    expect(played()).toEqual(['cue-sting-completion.m4a'])
    expect(screen.getByTestId('annex-completion-summary')).toBeInTheDocument()
  })

  it('says nothing at all on a plain load — a reloaded studio replays no stings', async () => {
    setStudioLotOverviewOverride(true)
    saveActiveSession(managedStudio('pf1-m2-quiet-load'))

    render(<App />)
    await screen.findByTestId('studio-lot-screen')
    expect(played()).toEqual([])
  })
})
