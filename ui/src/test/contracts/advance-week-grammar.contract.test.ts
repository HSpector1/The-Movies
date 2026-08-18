// ── PF1-M2 CONTRACT SUITE — the plain-advance grammar (cuesForAdvanceWeek) ───
// Written from the PM's frozen M2 addendum (the additive exports, approved and
// folded into the contract) plus PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M2 / §2 —
// NOT from the implementation. If the implementation disagrees with what is
// pinned here, the implementation is wrong and the disagreement is reported.
//
// THE FROZEN SEMANTICS, restated as this file's obligations:
//   1. released non-empty → the primary cue is the 'release' tier-table row
//      (tier 1, 'sting-release', 'held-beat'), its id stable per week.
//   2. constructionCompletion present → the completion cue (tier 1,
//      'sting-completion', 'emphasis') is carried orthogonally, exactly once.
//   3. both → BOTH cues, release first.
//   4. neither → exactly one cue: the week-advance row (tier 2, 'select', 'none').
//   5. an eventful advance never ALSO emits the quiet tick.
//   6. determinism: same inputs → identical cues; punctuateAdvanceWeek through an
//      unlocked RecordingSink emits exactly the non-null sounds in cue order;
//      muted / pre-unlock → no plays, no throws.
//
// Governing charter law behind them:
//   • "Co-tick law: the orthogonal constructionCompletion beside a primary stop
//      reason punctuates exactly once, primary keeps priority."      (§5-M2)
//   • "Audio must not narrate skipped time: a multi-week batch is one stop and
//      one punctuation, never per-week theater."                        (§2)
//
// ID LAWS: pinned as OBSERVABLE laws (stable per week, moving with the week),
// never as literal strings — the same discipline as event-grammar.contract.ts.
//
// DETERMINISM: no Math.random, no Date.now, no timers, no real playback.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cueForWeekAdvance,
  cuesForAdvanceWeek,
  cuesForSimResult,
} from '../../presentation/eventGrammar.ts'
import type { CueMotion, CueTier, PresentationCue } from '../../presentation/eventGrammar.ts'
import { punctuateAdvanceWeek } from '../../presentation/punctuate.ts'
import { RecordingSink } from '../../audio/sink.ts'
import type { RecordedAudioCall } from '../../audio/sink.ts'
import { SOUND_ASSETS } from '../../audio/tokens.ts'
import type { CueSoundToken } from '../../audio/tokens.ts'
import { getAudioService, initAudioService } from '../../audio/audioService.ts'
import { newGame } from '../../engine/adapter.ts'
import type {
  ConstructionCompletionSummary,
  GameState,
  PeriodSummary,
  SimResult,
} from '../../engine/adapter.ts'

// ── Ambient forced mute (harness note: see punctuate.contract.test.ts) ───────
const FORCED_MUTE =
  (process.env.VITE_AUDIO_MUTED ??
    (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_AUDIO_MUTED) === '1'

// ── The three rows this surface may speak in ─────────────────────────────────
type TierRow = { tier: CueTier; sound: CueSoundToken | null; motion: CueMotion }

const RELEASE_ROW: TierRow = { tier: 1, sound: 'sting-release', motion: 'held-beat' }
const COMPLETION_ROW: TierRow = { tier: 1, sound: 'sting-completion', motion: 'emphasis' }
const WEEK_ADVANCE_ROW: TierRow = { tier: 2, sound: 'select', motion: 'none' }

const MOTION_VOCABULARY: readonly CueMotion[] = ['none', 'emphasis', 'held-beat', 'count-up']
const TIER_VOCABULARY: readonly CueTier[] = [1, 2, 3]

function row(cue: PresentationCue): TierRow {
  return { tier: cue.tier, sound: cue.sound, motion: cue.motion }
}

// Shape-agnostic reader — see the CONTRACT AMBIGUITY note in
// punctuate.contract.test.ts. The cues and their ORDER are what is pinned.
function toCueList(produced: PresentationCue | readonly PresentationCue[]): PresentationCue[] {
  return Array.isArray(produced) ? [...produced] : [produced as PresentationCue]
}

// ── The AdvanceResult-shaped input, built as a plain object ──────────────────
// The frozen signature takes only `{ toWeek, released, constructionCompletion }`,
// so this surface needs no GameState at all: every fixture below is literal.
type AdvanceFacts = {
  toWeek: number
  released?: readonly unknown[]
  constructionCompletion?: unknown
}

function advance(facts: AdvanceFacts): {
  toWeek: number
  released: readonly unknown[]
  constructionCompletion: unknown
} {
  return {
    toWeek: facts.toWeek,
    released: facts.released ?? [],
    constructionCompletion:
      facts.constructionCompletion === undefined ? null : facts.constructionCompletion,
  }
}

function completionSummary(week: number): ConstructionCompletionSummary {
  return {
    projectId: 'placement-0011',
    facilityId: 'soundStage',
    name: 'Sound Stage',
    completedWeek: week,
    message: 'The Sound Stage is finished and open for work.',
  }
}

/** One released film, opaque to the grammar by contract (`readonly unknown[]`). */
const ONE_FILM: readonly unknown[] = [{ productionId: 'prod-0001', title: 'The Long Afternoon' }]
const THREE_FILMS: readonly unknown[] = [
  { productionId: 'prod-0001' },
  { productionId: 'prod-0002' },
  { productionId: 'prod-0003' },
]

// ── Sink reading ─────────────────────────────────────────────────────────────
let sink: RecordingSink

function plays(log: readonly RecordedAudioCall[]): Extract<RecordedAudioCall, { call: 'play' }>[] {
  return log.filter((entry): entry is Extract<RecordedAudioCall, { call: 'play' }> => entry.call === 'play')
}

function playedAssets(): string[] {
  return plays(sink.log).map((entry) => entry.assetId)
}

/** The assets a cue list is contractually required to sound, in order. */
function expectedAssets(cues: readonly PresentationCue[]): string[] {
  return cues.filter((cue) => cue.sound !== null).map((cue) => SOUND_ASSETS[cue.sound!])
}

function unlockedService(): void {
  sink = new RecordingSink()
  initAudioService(sink)
  getAudioService().unlock()
  sink.clear()
}

function lockedService(): void {
  sink = new RecordingSink()
  initAudioService(sink)
}

beforeEach(() => {
  unlockedService()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

// ── Law 1 — a release advance ────────────────────────────────────────────────
describe('PF1-M2 contract — advance grammar, law 1: a release is a release', () => {
  it('released non-empty → exactly one cue, the release row', () => {
    const cues = cuesForAdvanceWeek(advance({ toWeek: 14, released: ONE_FILM }))
    expect(cues).toHaveLength(1)
    expect(row(cues[0]!)).toEqual(RELEASE_ROW)
  })

  it('a batch of releases is still ONE cue (§2: skipped time is never narrated per item)', () => {
    const cues = cuesForAdvanceWeek(advance({ toWeek: 14, released: THREE_FILMS }))
    expect(cues, 'three films opening on one tick is one moment, not three').toHaveLength(1)
    expect(row(cues[0]!)).toEqual(RELEASE_ROW)
  })

  it('the release id is stable for a week and moves with the week', () => {
    const first = cuesForAdvanceWeek(advance({ toWeek: 14, released: ONE_FILM }))[0]!
    const again = cuesForAdvanceWeek(advance({ toWeek: 14, released: ONE_FILM }))[0]!
    const later = cuesForAdvanceWeek(advance({ toWeek: 15, released: ONE_FILM }))[0]!
    expect(again.id).toBe(first.id)
    expect(later.id).not.toBe(first.id)
    expect(row(later), 'only the id moves — the row belongs to the event').toEqual(row(first))
  })

  it('the release id does not depend on WHICH films released — only on the fact and the week', () => {
    const one = cuesForAdvanceWeek(advance({ toWeek: 14, released: ONE_FILM }))[0]!
    const three = cuesForAdvanceWeek(advance({ toWeek: 14, released: THREE_FILMS }))[0]!
    expect(three.id).toBe(one.id)
  })
})

// ── Law 2 — an orthogonal completion ─────────────────────────────────────────
describe('PF1-M2 contract — advance grammar, law 2: a completion rides once', () => {
  it('a completion with no release → exactly one cue, the completion row', () => {
    const cues = cuesForAdvanceWeek(
      advance({ toWeek: 20, constructionCompletion: completionSummary(20) }),
    )
    expect(cues).toHaveLength(1)
    expect(row(cues[0]!)).toEqual(COMPLETION_ROW)
  })

  it('treats BOTH null and undefined as "no completion"', () => {
    const asNull = cuesForAdvanceWeek({ toWeek: 20, released: [], constructionCompletion: null })
    const asUndefined = cuesForAdvanceWeek({
      toWeek: 20,
      released: [],
      constructionCompletion: undefined,
    })
    expect(row(asNull[0]!), 'null means nothing was finished').toEqual(WEEK_ADVANCE_ROW)
    expect(asNull).toHaveLength(1)
    expect(asUndefined, 'undefined means nothing was finished either').toEqual(asNull)
  })

  it('the completion id is stable for a week and moves with the week', () => {
    const first = cuesForAdvanceWeek(
      advance({ toWeek: 20, constructionCompletion: completionSummary(20) }),
    )[0]!
    const again = cuesForAdvanceWeek(
      advance({ toWeek: 20, constructionCompletion: completionSummary(20) }),
    )[0]!
    const later = cuesForAdvanceWeek(
      advance({ toWeek: 21, constructionCompletion: completionSummary(21) }),
    )[0]!
    expect(again.id).toBe(first.id)
    expect(later.id).not.toBe(first.id)
    expect(row(later)).toEqual(row(first))
  })
})

// ── Law 3 — the co-tick ──────────────────────────────────────────────────────
describe('PF1-M2 contract — advance grammar, law 3: release + completion, release first', () => {
  it('emits BOTH cues, in priority order, exactly once each', () => {
    const cues = cuesForAdvanceWeek(
      advance({ toWeek: 31, released: ONE_FILM, constructionCompletion: completionSummary(31) }),
    )
    expect(cues).toHaveLength(2)
    expect(row(cues[0]!), 'the primary keeps priority').toEqual(RELEASE_ROW)
    expect(row(cues[1]!), 'the orthogonal completion rides second').toEqual(COMPLETION_ROW)
    expect(cues[0]!.id).not.toBe(cues[1]!.id)
  })

  it('the co-tick reuses the same two ids the single-event advances produce', () => {
    const both = cuesForAdvanceWeek(
      advance({ toWeek: 31, released: ONE_FILM, constructionCompletion: completionSummary(31) }),
    )
    const releaseOnly = cuesForAdvanceWeek(advance({ toWeek: 31, released: ONE_FILM }))[0]!
    const completionOnly = cuesForAdvanceWeek(
      advance({ toWeek: 31, constructionCompletion: completionSummary(31) }),
    )[0]!
    // Sharing a tick must not change what either event IS — otherwise a caller
    // could not dedupe the co-tick against the same event seen anywhere else.
    expect(both[0]!.id).toBe(releaseOnly.id)
    expect(both[1]!.id).toBe(completionOnly.id)
  })
})

// ── Laws 4 and 5 — the quiet tick, and when it must NOT sound ────────────────
describe('PF1-M2 contract — advance grammar, laws 4 & 5: the quiet tick', () => {
  it('an uneventful advance is exactly one cue: the week-advance row', () => {
    const cues = cuesForAdvanceWeek(advance({ toWeek: 7 }))
    expect(cues).toHaveLength(1)
    expect(row(cues[0]!)).toEqual(WEEK_ADVANCE_ROW)
  })

  it('the quiet tick is stable for a week and moves with the week', () => {
    expect(cuesForAdvanceWeek(advance({ toWeek: 7 }))[0]!.id).toBe(
      cuesForAdvanceWeek(advance({ toWeek: 7 }))[0]!.id,
    )
    expect(cuesForAdvanceWeek(advance({ toWeek: 7 }))[0]!.id).not.toBe(
      cuesForAdvanceWeek(advance({ toWeek: 8 }))[0]!.id,
    )
  })

  it('an EVENTFUL advance never also emits the quiet tick', () => {
    const eventful = [
      advance({ toWeek: 12, released: ONE_FILM }),
      advance({ toWeek: 12, released: THREE_FILMS }),
      advance({ toWeek: 12, constructionCompletion: completionSummary(12) }),
      advance({ toWeek: 12, released: ONE_FILM, constructionCompletion: completionSummary(12) }),
    ]
    const quietId = cuesForAdvanceWeek(advance({ toWeek: 12 }))[0]!.id
    for (const result of eventful) {
      const cues = cuesForAdvanceWeek(result)
      expect(
        cues.some((cue) => cue.id === quietId),
        'a week that produced news is not also a quiet tick',
      ).toBe(false)
      expect(
        cues.some((cue) => JSON.stringify(row(cue)) === JSON.stringify(WEEK_ADVANCE_ROW)),
        'the week-advance ROW must not appear on an eventful advance either',
      ).toBe(false)
    }
  })

  it('the four shapes produce exactly the four contracted cue counts', () => {
    expect(cuesForAdvanceWeek(advance({ toWeek: 12 }))).toHaveLength(1)
    expect(cuesForAdvanceWeek(advance({ toWeek: 12, released: ONE_FILM }))).toHaveLength(1)
    expect(
      cuesForAdvanceWeek(advance({ toWeek: 12, constructionCompletion: completionSummary(12) })),
    ).toHaveLength(1)
    expect(
      cuesForAdvanceWeek(
        advance({ toWeek: 12, released: ONE_FILM, constructionCompletion: completionSummary(12) }),
      ),
    ).toHaveLength(2)
  })
})

// ── Law 6 (grammar half) — determinism and purity ────────────────────────────
describe('PF1-M2 contract — advance grammar, law 6: same inputs → identical cues', () => {
  const shapes = (week: number) => [
    advance({ toWeek: week }),
    advance({ toWeek: week, released: ONE_FILM }),
    advance({ toWeek: week, constructionCompletion: completionSummary(week) }),
    advance({ toWeek: week, released: ONE_FILM, constructionCompletion: completionSummary(week) }),
  ]

  it('two independently built inputs yield byte-identical cue lists', () => {
    const first = shapes(18).map((result) => cuesForAdvanceWeek(result))
    const second = shapes(18).map((result) => cuesForAdvanceWeek(result))
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
  })

  it('asking twice for the same result returns the identical list (no counter, no clock)', () => {
    for (const result of shapes(18)) {
      expect(cuesForAdvanceWeek(result)).toEqual(cuesForAdvanceWeek(result))
    }
  })

  it('every cue stays inside the closed tier / motion / sound vocabularies', () => {
    for (const result of shapes(18)) {
      for (const cue of cuesForAdvanceWeek(result)) {
        expect(TIER_VOCABULARY).toContain(cue.tier)
        expect(MOTION_VOCABULARY).toContain(cue.motion)
        expect(typeof cue.id).toBe('string')
        expect(cue.id.trim().length).toBeGreaterThan(0)
        if (cue.sound !== null) expect(Object.keys(SOUND_ASSETS)).toContain(cue.sound)
      }
    }
  })

  it('does not mutate the result it is handed', () => {
    const result = advance({
      toWeek: 18,
      released: ONE_FILM,
      constructionCompletion: completionSummary(18),
    })
    const before = JSON.stringify(result)
    cuesForAdvanceWeek(result)
    expect(JSON.stringify(result)).toBe(before)
  })
})

// ── DERIVED cross-surface law (flagged: implied by dedup, not stated verbatim) ─
// A week's advance can be observed through EITHER surface. If the same real event
// carried two different ids depending on which adapter call the UI happened to
// make, a caller could not dedupe it — and the charter's exact-once /
// no-double-announce law would rest on nothing. Pinned here, and reported as a
// derived law rather than a quoted one.
describe('PF1-M2 contract — advance grammar agrees with the other cue surfaces', () => {
  const FIXTURE_WORLD: GameState = newGame('pf1-m2-advance-fixture')

  function emptySummary(fromWeek: number, toWeek: number): PeriodSummary {
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

  function releaseSimResult(toWeek: number, completion: ConstructionCompletionSummary | null): SimResult {
    const fromWeek = toWeek - 1
    return {
      preTick: FIXTURE_WORLD,
      next: FIXTURE_WORLD,
      released: [],
      completedRuns: [],
      fromWeek,
      toWeek,
      weeks: 1,
      stopReason: 'release',
      productionDecision: null,
      scriptDecision: null,
      castingDecision: null,
      constructionCompletion: completion,
      stopMessage: 'Stopped at a governed event.',
      guardHit: false,
      summary: emptySummary(fromWeek, toWeek),
    }
  }

  it('the quiet tick is the SAME cue cueForWeekAdvance produces for that week', () => {
    expect(cuesForAdvanceWeek(advance({ toWeek: 26 }))).toEqual([cueForWeekAdvance(26)])
  })

  it('a release seen through advanceWeek is the same event as one seen through a SimResult', () => {
    const viaAdvance = cuesForAdvanceWeek(advance({ toWeek: 26, released: ONE_FILM }))[0]!
    const viaSim = cuesForSimResult(releaseSimResult(26, null))[0]!
    expect(viaAdvance.id, 'one release at week 26 is one event, however it was observed').toBe(
      viaSim.id,
    )
    expect(row(viaAdvance)).toEqual(row(viaSim))
  })

  it('a completion seen through advanceWeek is the same event as one seen beside a stop', () => {
    const viaAdvance = cuesForAdvanceWeek(
      advance({ toWeek: 26, constructionCompletion: completionSummary(26) }),
    )[0]!
    const viaSim = cuesForSimResult(releaseSimResult(26, completionSummary(26)))[1]!
    expect(viaAdvance.id).toBe(viaSim.id)
    expect(row(viaAdvance)).toEqual(row(viaSim))
  })
})

// ── Law 6 (audio half) — punctuateAdvanceWeek ────────────────────────────────
describe('PF1-M2 contract — punctuateAdvanceWeek returns the grammar verbatim', () => {
  it('returns exactly cuesForAdvanceWeek for all four shapes', () => {
    for (const result of [
      advance({ toWeek: 9 }),
      advance({ toWeek: 9, released: ONE_FILM }),
      advance({ toWeek: 9, constructionCompletion: completionSummary(9) }),
      advance({ toWeek: 9, released: ONE_FILM, constructionCompletion: completionSummary(9) }),
    ]) {
      expect(toCueList(punctuateAdvanceWeek(result))).toEqual(cuesForAdvanceWeek(result))
    }
  })
})

describe.skipIf(FORCED_MUTE)('PF1-M2 contract — punctuateAdvanceWeek → playCue, in cue order', () => {
  it('an uneventful advance sounds the quiet tick, once', () => {
    punctuateAdvanceWeek(advance({ toWeek: 9 }))
    expect(playedAssets()).toEqual([SOUND_ASSETS.select])
  })

  it('a release advance sounds the release sting, once — and no tick', () => {
    punctuateAdvanceWeek(advance({ toWeek: 9, released: ONE_FILM }))
    expect(playedAssets()).toEqual([SOUND_ASSETS['sting-release']])
  })

  it('a completion advance sounds the completion sting, once — and no tick', () => {
    punctuateAdvanceWeek(advance({ toWeek: 9, constructionCompletion: completionSummary(9) }))
    expect(playedAssets()).toEqual([SOUND_ASSETS['sting-completion']])
  })

  it('a co-tick sounds the release first, then the completion — exactly twice', () => {
    punctuateAdvanceWeek(
      advance({ toWeek: 9, released: ONE_FILM, constructionCompletion: completionSummary(9) }),
    )
    expect(playedAssets()).toEqual([
      SOUND_ASSETS['sting-release'],
      SOUND_ASSETS['sting-completion'],
    ])
  })

  it('sounds exactly the non-null sounds of the cues it returned, in cue order', () => {
    for (const result of [
      advance({ toWeek: 9 }),
      advance({ toWeek: 9, released: ONE_FILM }),
      advance({ toWeek: 9, constructionCompletion: completionSummary(9) }),
      advance({ toWeek: 9, released: ONE_FILM, constructionCompletion: completionSummary(9) }),
    ]) {
      unlockedService()
      const cues = toCueList(punctuateAdvanceWeek(result))
      expect(playedAssets()).toEqual(expectedAssets(cues))
    }
  })

  it('stays on the effects bus and starts no loops', () => {
    punctuateAdvanceWeek(
      advance({ toWeek: 9, released: ONE_FILM, constructionCompletion: completionSummary(9) }),
    )
    for (const entry of sink.log) {
      expect(entry.call).toBe('play')
      if (entry.call === 'play') expect(entry.channel).toBe('effects')
    }
  })

  it('holds no state: the same advance twice sounds twice', () => {
    punctuateAdvanceWeek(advance({ toWeek: 9 }))
    punctuateAdvanceWeek(advance({ toWeek: 9 }))
    expect(playedAssets()).toEqual([SOUND_ASSETS.select, SOUND_ASSETS.select])
  })

  it('a scripted run of advances reaches the hardware deterministically', () => {
    const script = () => {
      unlockedService()
      punctuateAdvanceWeek(advance({ toWeek: 1 }))
      punctuateAdvanceWeek(advance({ toWeek: 2, constructionCompletion: completionSummary(2) }))
      punctuateAdvanceWeek(advance({ toWeek: 3 }))
      punctuateAdvanceWeek(advance({ toWeek: 4, released: ONE_FILM }))
      punctuateAdvanceWeek(
        advance({ toWeek: 5, released: THREE_FILMS, constructionCompletion: completionSummary(5) }),
      )
      return JSON.stringify(sink.log)
    }
    const first = script()
    const second = script()
    expect(second).toBe(first)
    expect(JSON.parse(first)).toHaveLength(6) // 1 + 1 + 1 + 1 + 2
  })
})

// ── Law 6 — muted and pre-unlock ─────────────────────────────────────────────
describe('PF1-M2 contract — punctuateAdvanceWeek under mute', () => {
  beforeEach(() => {
    unlockedService()
    getAudioService().setMuted(true)
    sink.clear()
  })

  it('returns the cues and plays nothing', () => {
    const result = advance({
      toWeek: 9,
      released: ONE_FILM,
      constructionCompletion: completionSummary(9),
    })
    expect(toCueList(punctuateAdvanceWeek(result))).toEqual(cuesForAdvanceWeek(result))
    expect(plays(sink.log), 'a muted studio is silent, not cue-less').toEqual([])
  })

  it('nothing sounds through mute from any of the four shapes', () => {
    punctuateAdvanceWeek(advance({ toWeek: 9 }))
    punctuateAdvanceWeek(advance({ toWeek: 9, released: ONE_FILM }))
    punctuateAdvanceWeek(advance({ toWeek: 9, constructionCompletion: completionSummary(9) }))
    punctuateAdvanceWeek(
      advance({ toWeek: 9, released: ONE_FILM, constructionCompletion: completionSummary(9) }),
    )
    expect(plays(sink.log)).toEqual([])
  })
})

describe('PF1-M2 contract — punctuateAdvanceWeek before the first gesture', () => {
  beforeEach(() => {
    lockedService()
  })

  it('plays nothing and throws nothing', () => {
    expect(() => {
      punctuateAdvanceWeek(advance({ toWeek: 1 }))
      punctuateAdvanceWeek(advance({ toWeek: 2, released: ONE_FILM }))
      punctuateAdvanceWeek(
        advance({ toWeek: 3, released: ONE_FILM, constructionCompletion: completionSummary(3) }),
      )
    }).not.toThrow()
    expect(sink.log, 'no gesture yet — the studio is simply silent').toEqual([])
  })

  it('still returns the full cue list, so the visual surfaces are never gated on audio', () => {
    const cues = toCueList(
      punctuateAdvanceWeek(
        advance({ toWeek: 3, released: ONE_FILM, constructionCompletion: completionSummary(3) }),
      ),
    )
    expect(cues).toHaveLength(2)
    expect(cues.map((cue) => cue.tier)).toEqual([1, 1])
  })

  it('never queues: a dropped advance does not replay after unlock', () => {
    punctuateAdvanceWeek(advance({ toWeek: 1, released: ONE_FILM }))
    punctuateAdvanceWeek(advance({ toWeek: 2, constructionCompletion: completionSummary(2) }))
    expect(plays(sink.log)).toEqual([])

    getAudioService().unlock()
    sink.clear()
    if (FORCED_MUTE) return
    punctuateAdvanceWeek(advance({ toWeek: 3 }))
    expect(playedAssets(), 'only the post-unlock advance — never the dropped ones').toEqual([
      SOUND_ASSETS.select,
    ])
  })
})
