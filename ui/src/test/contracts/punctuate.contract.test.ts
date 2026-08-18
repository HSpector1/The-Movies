// ── PF1-M2 CONTRACT SUITE — punctuate (grammar → the one audio service) ──────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M2 / §5-M1 / §2 and the frozen
// M2 interface, NOT from the implementation.
//
// Governing charter law exercised by this file:
//   • punctuate* "call getAudioService().playCue for non-null sounds, return the
//      cues, hold no state."                            (frozen M2 interface)
//   • "Cues emitted before unlock are dropped silently, never queued, never
//      thrown. Silence, not a crash — and no nag."                   (§5-M1)
//   • "Co-tick law: the orthogonal constructionCompletion beside a primary stop
//      reason punctuates exactly once, primary keeps priority."      (§5-M2)
//   • "Tier 3 — none: bookkeeping stays bookkeeping."                (§5-M2)
//   • "Presentation state … lives outside GameState."                   (§2)
//
// The double-backing is the M1 seam: RecordingSink logs, nothing ever plays.
// DETERMINISM: no Math.random, no Date.now, no timers, no real playback.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RecordingSink } from '../../audio/sink.ts'
import type { RecordedAudioCall } from '../../audio/sink.ts'
import { SOUND_ASSETS } from '../../audio/tokens.ts'
import { getAudioService, initAudioService } from '../../audio/audioService.ts'
import {
  cueForActionCommit,
  cueForFormation,
  cueForRefusal,
  cueForWeekAdvance,
  cuesForSimResult,
} from '../../presentation/eventGrammar.ts'
import type { CommitKind, PresentationCue } from '../../presentation/eventGrammar.ts'
import {
  punctuateCommit,
  punctuateFormation,
  punctuateRefusal,
  punctuateSimResult,
  punctuateWeekAdvance,
} from '../../presentation/punctuate.ts'
import { newGame } from '../../engine/adapter.ts'
import type {
  ConstructionCompletionSummary,
  GameState,
  PeriodSummary,
  SimResult,
  SimStopReason,
} from '../../engine/adapter.ts'

// ── Ambient forced mute (same harness note as the M1 audio-service suite) ────
// `import.meta.env.VITE_AUDIO_MUTED` is a member expression Vite replaces at
// TRANSFORM time, so it cannot be stubbed from inside a test. The flag is a
// PROCESS-level condition; blocks that assert audible output are therefore
// skipped when the whole run is hard-muted, and the mute LAW is asserted below
// through the player-facing `setMuted` path, which is stubbable.
const FORCED_MUTE =
  (process.env.VITE_AUDIO_MUTED ??
    (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_AUDIO_MUTED) === '1'

const ALL_COMMIT_KINDS = [
  'commission',
  'build-commit',
  'move-commit',
  'demolish-commit',
  'auditions-planned',
  'draft-accepted',
  'publicity',
  'package-step',
] as const satisfies readonly CommitKind[]

// ── Fixtures (see event-grammar.contract.test.ts for why the world is real) ──
const FIXTURE_WORLD: GameState = newGame('pf1-m2-punctuate-fixture')

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

function completionSummary(week: number): ConstructionCompletionSummary {
  return {
    projectId: 'placement-0007',
    facilityId: 'soundStage',
    name: 'Sound Stage',
    completedWeek: week,
    message: 'The Sound Stage is finished and open for work.',
  }
}

function simResult(
  stopReason: SimStopReason,
  toWeek = 12,
  completion: ConstructionCompletionSummary | null = null,
): SimResult {
  const fromWeek = toWeek - 2
  return {
    preTick: FIXTURE_WORLD,
    next: FIXTURE_WORLD,
    released: [],
    completedRuns: [],
    fromWeek,
    toWeek,
    weeks: toWeek - fromWeek,
    stopReason,
    productionDecision: null,
    scriptDecision: null,
    castingDecision: null,
    constructionCompletion: completion,
    stopMessage: 'Stopped at a governed event.',
    guardHit: false,
    summary: emptySummary(fromWeek, toWeek),
  }
}

// ── Cue-shape normalisation ──────────────────────────────────────────────────
// CONTRACT AMBIGUITY, deliberately not resolved here: the frozen interface says
// every punctuate* "return[s] the cues" (plural) while the grammar's own
// single-receipt entry points are named `cueForActionCommit` / `cueForRefusal` /
// `cueForFormation` / `cueForWeekAdvance` (singular). Whether punctuateCommit
// hands back a `PresentationCue` or a one-element array is therefore genuinely
// unstated. This reader accepts either and then asserts the SEMANTICS exactly —
// the cues, and their order, are pinned; only the wrapper is left open.
function toCueList(produced: PresentationCue | readonly PresentationCue[]): PresentationCue[] {
  return Array.isArray(produced) ? [...produced] : [produced as PresentationCue]
}

// ── Sink reading ─────────────────────────────────────────────────────────────
let sink: RecordingSink

function plays(log: readonly RecordedAudioCall[]): Extract<RecordedAudioCall, { call: 'play' }>[] {
  return log.filter((entry): entry is Extract<RecordedAudioCall, { call: 'play' }> => entry.call === 'play')
}

/** The ordered asset ids actually asked of the hardware. */
function playedAssets(): string[] {
  return plays(sink.log).map((entry) => entry.assetId)
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
  // ui/src/test/setup.ts clears localStorage before every test, so each service
  // is built over the shipped default prefs (unmuted).
  unlockedService()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

// ── punctuate returns exactly the grammar's cues ─────────────────────────────
describe('PF1-M2 contract — punctuate returns the grammar verbatim', () => {
  it('punctuateSimResult returns cuesForSimResult, unchanged', () => {
    const result = simResult('release', 31, completionSummary(31))
    expect(toCueList(punctuateSimResult(result))).toEqual(cuesForSimResult(result))
  })

  it('punctuateCommit / Refusal / Formation / WeekAdvance return their cueFor* descriptor', () => {
    for (const kind of ALL_COMMIT_KINDS) {
      expect(toCueList(punctuateCommit(kind, 9))).toEqual(toCueList(cueForActionCommit(kind, 9)))
    }
    expect(toCueList(punctuateRefusal(9))).toEqual(toCueList(cueForRefusal(9)))
    expect(toCueList(punctuateFormation(9))).toEqual(toCueList(cueForFormation(9)))
    expect(toCueList(punctuateWeekAdvance(9))).toEqual(toCueList(cueForWeekAdvance(9)))
  })

  it('punctuate adds nothing of its own — no extra cue, no reordering', () => {
    const result = simResult('release', 31, completionSummary(31))
    expect(toCueList(punctuateSimResult(result)).map((cue) => cue.id)).toEqual(
      cuesForSimResult(result).map((cue) => cue.id),
    )
  })
})

// ── What actually reaches the hardware ───────────────────────────────────────
describe.skipIf(FORCED_MUTE)('PF1-M2 contract — punctuate → playCue, exactly once, in order', () => {
  it('a release sting sounds exactly once, on the effects bus', () => {
    punctuateSimResult(simResult('release', 20))
    expect(playedAssets()).toEqual([SOUND_ASSETS['sting-release']])
    expect(plays(sink.log)[0]!.channel).toBe('effects')
  })

  it('a co-tick sounds the primary first, then the completion — exactly two cues', () => {
    punctuateSimResult(simResult('release', 31, completionSummary(31)))
    expect(playedAssets()).toEqual([
      SOUND_ASSETS['sting-release'],
      SOUND_ASSETS['sting-completion'],
    ])
  })

  it('a constructionCompleted stop sounds its completion sting ONCE, never twice', () => {
    punctuateSimResult(simResult('constructionCompleted', 31, completionSummary(31)))
    expect(playedAssets()).toEqual([SOUND_ASSETS['sting-completion']])
  })

  it('a tier-3 stop is silent: a null sound emits nothing at all', () => {
    const cues = toCueList(punctuateSimResult(simResult('limit', 44)))
    expect(cues).toHaveLength(1)
    expect(cues[0]!.sound).toBeNull()
    expect(sink.log, 'bookkeeping stays bookkeeping').toEqual([])
  })

  it('a tier-3 stop that shares its tick with a completion still sounds the completion once', () => {
    punctuateSimResult(simResult('limit', 44, completionSummary(44)))
    expect(playedAssets()).toEqual([SOUND_ASSETS['sting-completion']])
  })

  it('every commit kind sounds its own family, exactly once', () => {
    for (const kind of ALL_COMMIT_KINDS) {
      unlockedService()
      const cue = toCueList(punctuateCommit(kind, 12))[0]!
      expect(cue.sound, `${kind} carries a sound`).not.toBeNull()
      expect(playedAssets(), `${kind}`).toEqual([SOUND_ASSETS[cue.sound!]])
    }
  })

  it('a build commit is heard as CONSTRUCTION STARTED', () => {
    punctuateCommit('build-commit', 12)
    expect(playedAssets()).toEqual([SOUND_ASSETS['construction-started']])
  })

  it('a refusal, a formation and a week advance each sound exactly once', () => {
    punctuateRefusal(12)
    expect(playedAssets()).toEqual([SOUND_ASSETS.refusal])

    unlockedService()
    punctuateFormation(12)
    expect(playedAssets()).toEqual([SOUND_ASSETS['sting-greenlight']])

    unlockedService()
    punctuateWeekAdvance(12)
    expect(playedAssets()).toEqual([SOUND_ASSETS.select])
  })

  it('holds no state: the same call twice sounds twice and returns the same cue twice', () => {
    const first = toCueList(punctuateWeekAdvance(12))
    const second = toCueList(punctuateWeekAdvance(12))
    expect(second).toEqual(first)
    expect(playedAssets()).toEqual([SOUND_ASSETS.select, SOUND_ASSETS.select])
  })

  it('a mixed sequence reaches the hardware in call order', () => {
    punctuateWeekAdvance(1)
    punctuateCommit('commission', 1)
    punctuateSimResult(simResult('scriptReview', 3))
    punctuateFormation(3)
    punctuateRefusal(3)
    punctuateSimResult(simResult('release', 9, completionSummary(9)))
    expect(playedAssets()).toEqual([
      SOUND_ASSETS.select,
      SOUND_ASSETS.commit,
      SOUND_ASSETS.select,
      SOUND_ASSETS['sting-greenlight'],
      SOUND_ASSETS.refusal,
      SOUND_ASSETS['sting-release'],
      SOUND_ASSETS['sting-completion'],
    ])
  })

  it('never touches music or ambience — punctuation is an effects-bus concern', () => {
    punctuateSimResult(simResult('release', 20, completionSummary(20)))
    punctuateCommit('build-commit', 20)
    punctuateFormation(20)
    for (const entry of sink.log) {
      expect(entry.call, 'punctuation starts no loops and moves no gains').toBe('play')
      if (entry.call === 'play') expect(entry.channel).toBe('effects')
    }
  })
})

// ── Muted ────────────────────────────────────────────────────────────────────
describe('PF1-M2 contract — a muted studio still gets its cues, silently', () => {
  beforeEach(() => {
    unlockedService()
    getAudioService().setMuted(true)
    sink.clear()
  })

  it('punctuate returns the cues (the visual/aria surfaces still fire) and plays nothing', () => {
    const cues = toCueList(punctuateSimResult(simResult('release', 31, completionSummary(31))))
    expect(cues, 'the grammar is unaffected by the mixer').toEqual(
      cuesForSimResult(simResult('release', 31, completionSummary(31))),
    )
    expect(plays(sink.log), 'a muted studio is silent, not cue-less').toEqual([])
  })

  it('nothing sounds through mute from any punctuate entry point', () => {
    for (const kind of ALL_COMMIT_KINDS) punctuateCommit(kind, 5)
    punctuateRefusal(5)
    punctuateFormation(5)
    punctuateWeekAdvance(5)
    for (const stopReason of ['release', 'runCompleted', 'cashNegative', 'limit'] as const) {
      punctuateSimResult(simResult(stopReason, 7, completionSummary(7)))
    }
    expect(plays(sink.log)).toEqual([])
  })

  it('unmuting restores sound without replaying anything that was muted', () => {
    punctuateFormation(5)
    expect(plays(sink.log)).toEqual([])
    getAudioService().setMuted(false)
    sink.clear()
    if (FORCED_MUTE) return // the QA flag is not the player's setting and never lifts
    punctuateWeekAdvance(6)
    expect(playedAssets(), 'only the cue asked for AFTER unmute').toEqual([SOUND_ASSETS.select])
  })
})

// ── Before unlock ────────────────────────────────────────────────────────────
describe('PF1-M2 contract — before the first gesture: silence, no throw, no queue', () => {
  beforeEach(() => {
    lockedService()
  })

  it('punctuates without throwing and without a single sink call', () => {
    expect(() => {
      punctuateWeekAdvance(1)
      punctuateCommit('commission', 1)
      punctuateRefusal(1)
      punctuateFormation(1)
      punctuateSimResult(simResult('release', 3, completionSummary(3)))
    }).not.toThrow()
    expect(sink.log, 'no gesture yet — the studio is simply silent').toEqual([])
  })

  it('still returns the full cue list, so the visual/aria surfaces are never gated on audio', () => {
    const cues = toCueList(punctuateSimResult(simResult('release', 3, completionSummary(3))))
    expect(cues).toHaveLength(2)
    expect(cues.map((cue) => cue.tier)).toEqual([1, 1])
  })

  it('never queues: a dropped cue does not replay when a later cue arrives after unlock', () => {
    punctuateFormation(1)
    punctuateSimResult(simResult('release', 3))
    expect(plays(sink.log)).toEqual([])

    getAudioService().unlock()
    sink.clear()
    if (FORCED_MUTE) return
    punctuateWeekAdvance(4)
    expect(playedAssets(), 'only the post-unlock cue — never the dropped ones').toEqual([
      SOUND_ASSETS.select,
    ])
  })
})

// ── The module holds no state ────────────────────────────────────────────────
describe('PF1-M2 contract — punctuate holds no state of its own', () => {
  it('re-initialising the service redirects every later cue to the NEW sink', () => {
    punctuateWeekAdvance(1)
    const firstSink = sink
    const firstCount = plays(firstSink.log).length

    unlockedService()
    punctuateWeekAdvance(2)

    expect(plays(firstSink.log).length, 'the old sink is not written to again').toBe(firstCount)
    if (FORCED_MUTE) return
    expect(playedAssets(), 'punctuate resolves the service per call, holding no reference').toEqual([
      SOUND_ASSETS.select,
    ])
  })

  it('returns an ordinary array the caller may keep — punctuate does not reuse one buffer', () => {
    const first = toCueList(punctuateSimResult(simResult('release', 10, completionSummary(10))))
    const second = toCueList(punctuateSimResult(simResult('runCompleted', 12)))
    expect(first).toHaveLength(2)
    expect(second).toHaveLength(1)
    expect(first[0]!.sound, 'the first list was not mutated by the second call').toBe('sting-release')
  })
})
