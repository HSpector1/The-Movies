// ── OPUS-REDTEAM (PF1-M4) — the announcement law, attacked ───────────────────
//
// Charter §8: "Announcement law: double-announce hunting across promoted aria regions,
// the completion notice, and new punctuation; stop-priority order preserved under
// punctuation."
// Charter §5-M2: "each promoted announcement carries the existing composed copy verbatim,
// attaches at the same one-owner gates, and REPLACES nothing accessible … no
// double-announce"; "Co-tick law: the orthogonal constructionCompletion beside a primary
// stop reason punctuates exactly once, primary keeps priority."
//
// Written findings-only. PF1-M4 FIX WAVE (OPUS-FIX): the double-announce finding was ruled
// and fixed — the live-region child is keyed on the SENTENCE, never on the punctuation
// serial — and its two pinned tests are re-pinned below to the corrected behaviour. The
// live-region contract (role / aria-live / aria-atomic / testid / one element) is
// untouched, and the fix is DOM-only: no renderer call, so no structural tuple can move.

import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../../src/core/index.ts'
import type { GameState } from '../../../../src/core/index.ts'
import { newFoundedGame } from '../founding.ts'
import { StudioLotScreen } from '../../lot/StudioLotScreen.tsx'
import { initAudioService } from '../../audio/audioService.ts'
import { RecordingSink } from '../../audio/sink.ts'
import {
  cueForWeekAdvance,
  cuesForAdvanceWeek,
  cuesForSimResult,
} from '../../presentation/eventGrammar.ts'
import type { ConstructionCompletionSummary, PeriodSummary, SimResult, SimStopReason } from '../../engine/adapter.ts'
import { advanceWeek, newGame, startDevelopmentCastingAnnexAction } from '../../engine/adapter.ts'

const renderer = vi.hoisted(() => {
  type Opts = { onReady?: () => void; onSelect?: (sel: unknown) => void }
  class FakeView {
    readonly opts: Opts
    constructor(opts: Opts) {
      this.opts = opts
      queueMicrotask(() => opts.onReady?.())
    }
    setSnapshot() {}
    select() {}
    clearSelection() {}
    triggerAction() {}
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    setInputSuspended() {}
    camera() {}
    resetCamera() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    worldSelection() { return { placeId: null, productionId: null, personId: null } }
    destroy() {}
  }
  return { FakeView }
})

vi.mock('../../lot/StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

let sink: RecordingSink

beforeEach(() => {
  sink = new RecordingSink()
  initAudioService(sink).unlock()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function managed(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

// ── The promoted week notice ─────────────────────────────────────────────────

describe('REDTEAM — the promoted week notice is ONE element, announced once', () => {
  const state = managed('rt-week-notice')

  function lot(props: Record<string, unknown>) {
    return (
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        cadenceFeedback={{ kind: 'week', week: 7, constructionCompletion: null }}
        {...props}
      />
    )
  }

  it('exactly one node in the whole document carries the week sentence', () => {
    const { container } = render(lot({}))
    const matches = Array.from(container.querySelectorAll('*')).filter(
      (node) => node.textContent?.trim() === 'Week 7 on the lot.',
    )
    // The region and its one child span both hold the string; nothing ELSE may.
    const liveOwners = matches.filter((node) => node.getAttribute('aria-live') !== null)
    expect(liveOwners, 'exactly one live region owns this sentence').toHaveLength(1)
    expect(liveOwners[0]!.getAttribute('data-testid')).toBe('lot-week-update-announcement')
    expect(matches.length, 'the region plus its single line, and nothing else').toBeLessThanOrEqual(2)
  })

  it('the visible copy and the announced copy are the same string by construction', () => {
    const { getByTestId } = render(lot({}))
    const region = getByTestId('lot-week-update-announcement')
    expect(region).toHaveTextContent('Week 7 on the lot.')
    expect(region.getAttribute('aria-live')).toBe('polite')
    expect(region.getAttribute('aria-atomic')).toBe('true')
    expect(region.className, 'no longer visually-hidden: it is a visible notice').not.toContain(
      'visually-hidden',
    )
  })

  it('the completion week suppresses the week line entirely (no two notices for one tick)', () => {
    const completion: ConstructionCompletionSummary = {
      projectId: 'placement-0001',
      facilityId: 'castingAnnex',
      name: 'Casting Annex',
      completedWeek: 7,
      message: 'The Casting Annex is finished and open for work.',
    }
    const { getByTestId } = render(
      lot({ cadenceFeedback: { kind: 'week', week: 7, constructionCompletion: completion } }),
    )
    expect(getByTestId('lot-week-update-announcement')).toHaveTextContent('')
  })

  it('an UNRELATED punctuation does NOT remount the still-showing notice line', () => {
    // FIXED (PF1-M4). This pinned the defect: the React key embedded the punctuation
    // serial, so an unrelated committed action replaced the live-region child with a new
    // node carrying identical text — which an aria-atomic polite region re-reads. The key
    // is the sentence now; the serial moved to `data-punctuation` on the region wrapper,
    // where the stylesheet can restart the beat without touching the announced subtree.
    const { getByTestId, rerender } = render(lot({ punctuation: { key: 1, motion: 'emphasis' } }))
    const region = getByTestId('lot-week-update-announcement')
    const before = region.firstElementChild
    expect(before?.textContent).toBe('Week 7 on the lot.')
    expect(region.getAttribute('data-punctuation')).toBe('1')

    // Same week, same sentence — only the punctuation serial moved (App bumps it on any
    // committed action, e.g. a build receipt landing while the week line is still up).
    rerender(lot({ punctuation: { key: 2, motion: 'emphasis' } }))
    const after = getByTestId('lot-week-update-announcement').firstElementChild
    expect(after?.textContent).toBe('Week 7 on the lot.')
    expect(
      after === before,
      'the same sentence is the same node: already-announced copy is not announced twice',
    ).toBe(true)
    expect(
      getByTestId('lot-week-update-announcement').getAttribute('data-punctuation'),
      'and the serial still reaches the DOM, on the wrapper, where CSS restarts the beat',
    ).toBe('2')
  })

  it('a NEW sentence is still a new node, so genuine news is still announced', () => {
    const { getByTestId, rerender } = render(lot({ punctuation: { key: 1, motion: 'emphasis' } }))
    const before = getByTestId('lot-week-update-announcement').firstElementChild
    rerender(
      lot({
        cadenceFeedback: { kind: 'week', week: 8, constructionCompletion: null },
        punctuation: { key: 1, motion: 'emphasis' },
      }),
    )
    const after = getByTestId('lot-week-update-announcement').firstElementChild
    expect(after?.textContent).toBe('Week 8 on the lot.')
    expect(after === before, 'a different week is a different node').toBe(false)
  })

  it('the same notice does NOT remount when nothing punctuates', () => {
    const { getByTestId, rerender } = render(lot({ punctuation: { key: 3, motion: 'emphasis' } }))
    const before = getByTestId('lot-week-update-announcement').firstElementChild
    rerender(lot({ punctuation: { key: 3, motion: 'emphasis' } }))
    expect(getByTestId('lot-week-update-announcement').firstElementChild === before).toBe(true)
  })
})

// ── The promoted OPERATIONAL notice — where the remount is actually reachable ─
//
// The week notice is cleared by the same state replacement that bumps the punctuation
// serial (`replaceAuthoritativeState` calls `setLotCadenceFeedback(null)`), so its
// remount is theoretical. The OPERATIONAL announcement is derived from GameState and
// survives that replacement, so a committed action lands a new punctuation serial while
// the sentence is still on screen. That is the reachable case.

describe('REDTEAM — the operational announcement across a committed action', () => {
  function operationalStudio(seed: string): GameState {
    let state = managed(seed)
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 13; i++) state = advanceWeek(state).next
    return state
  }

  it('a committed action does NOT remount the live-region line with identical text', async () => {
    const state = operationalStudio('rt-operational-remount')
    function lot(epoch: number, key: number) {
      return (
        <StudioLotScreen
          state={state}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => {}}
          noticeEpoch={epoch}
          punctuation={{ key, motion: 'emphasis' }}
        />
      )
    }
    const { getByTestId, rerender } = render(lot(0, 1))
    await waitFor(() =>
      expect(getByTestId('lot-annex-operational-announcement')).toHaveTextContent(
        'Development & Casting Annex is Operational.',
      ),
    )
    const region = getByTestId('lot-annex-operational-announcement')
    const before = region.firstElementChild!
    const text = before.textContent

    // React commits the DOM, THEN runs passive effects, so the transient-notice expiry
    // lands in a later commit than the remount. `act()` flushes both before control
    // returns, so the intermediate DOM is only visible through the mutation record —
    // which is exactly what an assistive technology observes.
    const observer = new MutationObserver(() => {})
    observer.observe(region, { childList: true, subtree: true })

    // Exactly what App does on a committed build: bump the epoch AND the punctuation
    // serial in the same commit.
    rerender(lot(1, 2))

    const records = observer.takeRecords()
    observer.disconnect()
    const addedSameSentence = records.flatMap((record) =>
      Array.from(record.addedNodes).filter((node) => node.textContent === text),
    )
    // FIXED (PF1-M4). This was the REACHABLE form of the double-announce: the operational
    // sentence is derived from GameState and survives the state replacement that bumps the
    // punctuation serial, so a committed build re-inserted an identical node into an
    // aria-atomic polite region and a screen reader read the whole thing again.
    // (The epoch bump then expires the notice in a later commit, so the region ends this
    // gesture empty — a REMOVAL, which announces nothing. What matters is that nothing was
    // re-inserted; `before` is captured only to prove the identity comparison is real.)
    expect(
      addedSameSentence.map((node) => node.textContent),
      'no NEW node carrying an already-announced sentence enters the live region',
    ).toEqual([])
    expect(before.textContent, 'and the sentence under test really was the announced one').toBe(text)
  })

  it('and the epoch then expires it — one action of life, exactly as designed', async () => {
    const state = operationalStudio('rt-operational-expiry')
    function lot(epoch: number) {
      return (
        <StudioLotScreen
          state={state}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => {}}
          noticeEpoch={epoch}
        />
      )
    }
    const { getByTestId, rerender } = render(lot(0))
    await waitFor(() =>
      expect(getByTestId('lot-annex-operational-announcement')).toHaveTextContent(
        'Development & Casting Annex is Operational.',
      ),
    )
    rerender(lot(1))
    await waitFor(() =>
      expect(getByTestId('lot-annex-operational-announcement')).toHaveTextContent(''),
    )
  })

  it('a FRESH mount of a studio whose annex finished long ago replays no sting', async () => {
    const state = operationalStudio('rt-operational-no-sting')
    sink.clear()
    render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} onAdvance={() => {}} />,
    )
    await waitFor(() => expect(sink.log.length).toBeGreaterThan(0)) // the ambience bed starts
    expect(
      sink.log.filter((call) => call.call === 'play'),
      'load/hydration must punctuate nothing (charter §2)',
    ).toEqual([])
  })
})

// ── Motion gating on the promoted notices ────────────────────────────────────

describe('REDTEAM — reduced motion reaches the promoted notices', () => {
  const state = managed('rt-week-motion')

  it('data-motion reads "none" under an OS reduced-motion request', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const { getByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        cadenceFeedback={{ kind: 'week', week: 3, constructionCompletion: null }}
        punctuation={{ key: 1, motion: 'held-beat' }}
      />,
    )
    const line = getByTestId('lot-week-update-announcement').firstElementChild
    expect(line?.getAttribute('data-motion')).toBe('none')
  })

  it('and reads the grammar’s chosen strength when motion is allowed', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const { getByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        cadenceFeedback={{ kind: 'week', week: 3, constructionCompletion: null }}
        punctuation={{ key: 1, motion: 'held-beat' }}
      />,
    )
    const line = getByTestId('lot-week-update-announcement').firstElementChild
    expect(line?.getAttribute('data-motion')).toBe('held-beat')
  })
})

// ── Co-tick, both paths, exactly once ────────────────────────────────────────

const WORLD = newGame('rt-cotick')

function summary(fromWeek: number, toWeek: number): PeriodSummary {
  return {
    fromWeek,
    toWeekInclusive: toWeek,
    weeks: Math.max(0, toWeek - fromWeek),
    payroll: 0,
    overhead: 0,
    studioRevenue: 0,
    boxOfficeLump: 0,
    production: 0,
    publicity: 0,
    construction: 0,
    otherCash: 0,
    netCash: 0,
    releases: 0,
    completedRuns: 0,
  }
}

function completion(week: number): ConstructionCompletionSummary {
  return {
    projectId: 'placement-0009',
    facilityId: 'castingAnnex',
    name: 'Casting Annex',
    completedWeek: week,
    message: 'The Casting Annex is finished and open for work.',
  }
}

function simResult(
  stopReason: SimStopReason,
  toWeek: number,
  co: ConstructionCompletionSummary | null,
): SimResult {
  return {
    preTick: WORLD,
    next: WORLD,
    released: [],
    completedRuns: [],
    fromWeek: Math.max(0, toWeek - 3),
    toWeek,
    weeks: 3,
    stopReason,
    stopMessage: 'redteam fixture',
    summary: summary(Math.max(0, toWeek - 3), toWeek),
    constructionCompletion: co,
  } as unknown as SimResult
}

describe('REDTEAM — the co-tick law under both result shapes', () => {
  const everyStopReason: SimStopReason[] = [
    'release',
    'constructionCompleted',
    'scriptReview',
    'castingReview',
    'productionDecision',
    'runCompleted',
    'contractExpired',
    'renewalWindow',
    'cashNegative',
    'limit',
  ]

  it('SimResult: a completion beside ANY primary stop is carried exactly once', () => {
    for (const reason of everyStopReason) {
      const cues = cuesForSimResult(simResult(reason, 40, completion(40)))
      const completions = cues.filter((cue) => cue.id === 'constructionCompleted:40')
      expect(completions.length, `${reason}: never two completions`).toBeLessThanOrEqual(1)
      expect(cues[0]!.id.startsWith(reason), `${reason}: the primary keeps priority`).toBe(true)
      expect(new Set(cues.map((cue) => cue.id)).size, `${reason}: no duplicate ids`).toBe(cues.length)
    }
  })

  it('SimResult: when the completion IS the stop reason the two collapse to ONE cue', () => {
    const cues = cuesForSimResult(simResult('constructionCompleted', 14, completion(14)))
    expect(cues).toHaveLength(1)
    expect(cues[0]!.id).toBe('constructionCompleted:14')
  })

  it('AdvanceResult: release + completion is two cues, release first, completion once', () => {
    const cues = cuesForAdvanceWeek({
      toWeek: 22,
      released: [{}],
      constructionCompletion: completion(22),
    })
    expect(cues.map((cue) => cue.id)).toEqual(['release:22', 'constructionCompleted:22'])
    expect(cues[0]!.tier).toBe(1)
  })

  it('AdvanceResult: undefined and null completion behave identically (a hostile shape)', () => {
    const withNull = cuesForAdvanceWeek({ toWeek: 5, released: [], constructionCompletion: null })
    const withUndefined = cuesForAdvanceWeek({
      toWeek: 5,
      released: [],
      constructionCompletion: undefined,
    })
    expect(withNull).toEqual(withUndefined)
    expect(withNull).toEqual([cueForWeekAdvance(5)])
  })

  it('a plain week is silent for the EYES: the quiet tick carries motion "none"', () => {
    expect(cueForWeekAdvance(9).motion).toBe('none')
    expect(cueForWeekAdvance(9).tier).toBe(2)
  })

  it('the grammar is a pure function: the same input twice gives byte-identical cues', () => {
    const a = JSON.stringify(cuesForSimResult(simResult('release', 31, completion(31))))
    const b = JSON.stringify(cuesForSimResult(simResult('release', 31, completion(31))))
    expect(a).toBe(b)
  })
})
