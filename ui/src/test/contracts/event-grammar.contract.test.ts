// ── PF1-M2 CONTRACT SUITE — the pure cue grammar ─────────────────────────────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M2 / §7 / §2 and the frozen
// M2 interface, NOT from the implementation. If the implementation disagrees
// with what is pinned here, the implementation is wrong.
//
// Governing charter law exercised by this file:
//   • "A pure cue grammar — ui/src/presentation/eventGrammar.ts, a total function
//      from authoritative inputs (SimResult, action receipts, the formation
//      receipt) to cue descriptors … No React, no timers, no audio calls. An
//      exhaustiveness test iterates the SimStopReason union so an 11th member
//      fails the suite instead of producing silence."               (§5-M2)
//   • "Tier discipline (the cue descriptor's motion field is a closed vocabulary
//      — none | emphasis | held-beat | count-up — so the pinned tier table is
//      checkable)."                                                  (§5-M2)
//   • "Co-tick law: the orthogonal constructionCompletion beside a primary stop
//      reason punctuates exactly once, primary keeps priority
//      (adapter.ts:2236-2240 is the spec)."                          (§5-M2)
//   • "Punctuation and audio fire from authoritative receipts … never from
//      renderer motion, timers, or React-inferred state."               (§2)
//   • "The presentation layer makes no RNG draws from the sim stream and no
//      Math.random() calls."                                            (§2)
//
// DETERMINISM: no Math.random, no Date.now, no timers, no audio, no React.
//
// HOW THE 11th-MEMBER GATE WORKS (two independent teeth, as required):
//   TOOTH 1 (compile) — STOP_REASON_TIERS is `satisfies Record<SimStopReason, …>`
//     and ALL_STOP_REASONS is proved to cover the union by AssertNever below. A
//     new union member makes BOTH fail `tsc`, immediately.
//   TOOTH 2 (test) — the count and the key-set are pinned at 10 literal members,
//     so the moment somebody silences tooth 1 by adding a row, this suite fails
//     until the new member's tier row is a deliberate, reviewed decision.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  cueForActionCommit,
  cueForFormation,
  cueForRefusal,
  cueForWeekAdvance,
  cuesForSimResult,
} from '../../presentation/eventGrammar.ts'
import type {
  CommitKind,
  CueMotion,
  CueTier,
  PresentationCue,
} from '../../presentation/eventGrammar.ts'
import { newGame } from '../../engine/adapter.ts'
import type {
  ConstructionCompletionSummary,
  GameState,
  PeriodSummary,
  SimResult,
  SimStopReason,
} from '../../engine/adapter.ts'
import { SOUND_ASSETS } from '../../audio/tokens.ts'
import type { CueSoundToken } from '../../audio/tokens.ts'

// ── The frozen tier table, restated literally on the test side ───────────────
type TierRow = { tier: CueTier; sound: CueSoundToken | null; motion: CueMotion }

const STOP_REASON_TIERS = {
  release: { tier: 1, sound: 'sting-release', motion: 'held-beat' },
  constructionCompleted: { tier: 1, sound: 'sting-completion', motion: 'emphasis' },
  scriptReview: { tier: 2, sound: 'select', motion: 'emphasis' },
  castingReview: { tier: 2, sound: 'select', motion: 'emphasis' },
  productionDecision: { tier: 2, sound: 'select', motion: 'emphasis' },
  runCompleted: { tier: 2, sound: 'positive', motion: 'emphasis' },
  contractExpired: { tier: 2, sound: 'warning', motion: 'emphasis' },
  renewalWindow: { tier: 2, sound: 'warning', motion: 'emphasis' },
  cashNegative: { tier: 2, sound: 'warning', motion: 'emphasis' },
  limit: { tier: 3, sound: null, motion: 'none' },
} satisfies Record<SimStopReason, TierRow>

/** The orthogonal construction-completion cue, wherever it rides. */
const COMPLETION_ROW: TierRow = { tier: 1, sound: 'sting-completion', motion: 'emphasis' }

const COMMIT_TIERS = {
  commission: { tier: 2, sound: 'commit', motion: 'emphasis' },
  'build-commit': { tier: 2, sound: 'construction-started', motion: 'emphasis' },
  'move-commit': { tier: 2, sound: 'commit', motion: 'emphasis' },
  'demolish-commit': { tier: 2, sound: 'commit', motion: 'emphasis' },
  'auditions-planned': { tier: 2, sound: 'commit', motion: 'emphasis' },
  'draft-accepted': { tier: 2, sound: 'commit', motion: 'emphasis' },
  // PF1-M4 (additive): the founding screen was firing `draft-accepted`. Its own row
  // carries the identical generic-commit shape — a relabel, never a re-tiering.
  founding: { tier: 2, sound: 'commit', motion: 'emphasis' },
  publicity: { tier: 2, sound: 'commit', motion: 'emphasis' },
  'package-step': { tier: 2, sound: 'commit', motion: 'emphasis' },
} satisfies Record<CommitKind, TierRow>

const REFUSAL_ROW: TierRow = { tier: 2, sound: 'refusal', motion: 'none' }
const FORMATION_ROW: TierRow = { tier: 1, sound: 'sting-greenlight', motion: 'held-beat' }
const WEEK_ADVANCE_ROW: TierRow = { tier: 2, sound: 'select', motion: 'none' }

/**
 * TOOTH 1, the array half. A compile error at any `coverageProof<…>([])` call
 * below means one of the literal arrays is missing a union member: the type
 * argument is only `never` while the array names the union exhaustively.
 */
function coverageProof<T extends never>(_uncovered: T[]): void {
  /* the proof is entirely in the type argument */
}

// The stop-reason union, spelled out.
const ALL_STOP_REASONS = [
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
] as const satisfies readonly SimStopReason[]

const ALL_COMMIT_KINDS = [
  'commission',
  'build-commit',
  'move-commit',
  'demolish-commit',
  'auditions-planned',
  'draft-accepted',
  'founding', // PF1-M4
  'publicity',
  'package-step',
] as const satisfies readonly CommitKind[]

const MOTION_VOCABULARY: readonly CueMotion[] = ['none', 'emphasis', 'held-beat', 'count-up']
const TIER_VOCABULARY: readonly CueTier[] = [1, 2, 3]
const SOUND_TOKENS = new Set<string>(Object.keys(SOUND_ASSETS))

// ── SimResult fixtures ───────────────────────────────────────────────────────
// Everything below the two GameState slots is a plain object built here. The two
// GameState slots are a real, seeded, brand-new world: a GameState cannot be
// honestly fabricated field-by-field, and the grammar is contractually forbidden
// to read one anyway (it derives from receipt facts only), so one shared world is
// both sufficient and the least fictional option available.
const FIXTURE_WORLD: GameState = newGame('pf1-m2-grammar-fixture')

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

type SimFacts = {
  stopReason: SimStopReason
  fromWeek?: number
  toWeek?: number
  completion?: ConstructionCompletionSummary | null
  stopMessage?: string
}

function simResult(facts: SimFacts): SimResult {
  const fromWeek = facts.fromWeek ?? 10
  const toWeek = facts.toWeek ?? 12
  return {
    preTick: FIXTURE_WORLD,
    next: FIXTURE_WORLD,
    released: [],
    completedRuns: [],
    fromWeek,
    toWeek,
    weeks: toWeek - fromWeek,
    stopReason: facts.stopReason,
    productionDecision: null,
    scriptDecision: null,
    castingDecision: null,
    constructionCompletion: facts.completion === undefined ? null : facts.completion,
    stopMessage: facts.stopMessage ?? 'Stopped at a governed event.',
    guardHit: false,
    summary: emptySummary(fromWeek, toWeek),
  }
}

/**
 * The result the engine would actually hand over for this stop reason: a
 * `constructionCompleted` stop always carries the summary that caused it, so the
 * row tests below are pinned against reachable receipts, never against a shape
 * the adapter never emits. (Totality over the unreachable shape is asserted once,
 * on its own, further down.)
 */
function realistic(stopReason: SimStopReason, fromWeek = 10, toWeek = 12): SimResult {
  return simResult({
    stopReason,
    fromWeek,
    toWeek,
    completion: stopReason === 'constructionCompleted' ? completionSummary(toWeek) : null,
  })
}

function row(cue: PresentationCue): TierRow {
  return { tier: cue.tier, sound: cue.sound, motion: cue.motion }
}

// ── Exhaustiveness ───────────────────────────────────────────────────────────
describe('PF1-M2 contract — SimStopReason exhaustiveness (the 11th-member gate)', () => {
  it('names exactly the ten SimStopReason members the engine declares', () => {
    // TOOTH 1: these two calls stop compiling the moment a union member is added.
    coverageProof<Exclude<SimStopReason, (typeof ALL_STOP_REASONS)[number]>>([])
    coverageProof<Exclude<CommitKind, (typeof ALL_COMMIT_KINDS)[number]>>([])
    // TOOTH 2. An 11th member cannot reach production without failing here, even
    // after the compile-time teeth above have been satisfied by a new table row.
    expect(ALL_STOP_REASONS).toHaveLength(10)
    expect([...ALL_STOP_REASONS].sort()).toEqual(Object.keys(STOP_REASON_TIERS).sort())
  })

  it('produces at least one cue for every member — no stop reason falls into silence', () => {
    for (const stopReason of ALL_STOP_REASONS) {
      const cues = cuesForSimResult(realistic(stopReason))
      expect(Array.isArray(cues), `${stopReason} must yield an array of cues`).toBe(true)
      expect(cues.length, `${stopReason} must yield a primary cue`).toBeGreaterThanOrEqual(1)
      expect(cues[0], `${stopReason} must yield a defined primary cue`).toBeDefined()
    }
  })

  it('pins the full tier-table row for every SimStopReason member', () => {
    for (const stopReason of ALL_STOP_REASONS) {
      const cues = cuesForSimResult(realistic(stopReason))
      expect(cues, `${stopReason} without a co-tick emits exactly one cue`).toHaveLength(1)
      expect(row(cues[0]!), `${stopReason} tier row`).toEqual(STOP_REASON_TIERS[stopReason])
    }
  })

  it('is total: a constructionCompleted stop with no summary attached still returns one cue', () => {
    // Defensive totality — the charter calls the grammar "a total function", so a
    // shape the adapter does not currently emit must still be silence-free, never
    // an `undefined` cue or a throw.
    const cues = cuesForSimResult(simResult({ stopReason: 'constructionCompleted', completion: null }))
    expect(cues).toHaveLength(1)
    expect(row(cues[0]!)).toEqual(STOP_REASON_TIERS.constructionCompleted)
  })

  it('keeps every cue inside the closed tier/motion/sound vocabularies', () => {
    for (const stopReason of ALL_STOP_REASONS) {
      for (const cue of cuesForSimResult(simResult({ stopReason, completion: completionSummary(12) }))) {
        expect(TIER_VOCABULARY, `${stopReason}: tier`).toContain(cue.tier)
        expect(MOTION_VOCABULARY, `${stopReason}: motion`).toContain(cue.motion)
        if (cue.sound !== null) {
          expect(SOUND_TOKENS.has(cue.sound), `${stopReason}: ${cue.sound} is a minted M1 token`).toBe(true)
        }
      }
    }
  })
})

// ── Tier discipline ──────────────────────────────────────────────────────────
describe('PF1-M2 contract — tier discipline (§5-M2)', () => {
  it('tier 3 is bookkeeping: no sound and no motion', () => {
    const everyRow: TierRow[] = [
      ...Object.values(STOP_REASON_TIERS),
      ...Object.values(COMMIT_TIERS),
      COMPLETION_ROW,
      REFUSAL_ROW,
      FORMATION_ROW,
      WEEK_ADVANCE_ROW,
    ]
    for (const tierRow of everyRow) {
      if (tierRow.tier !== 3) continue
      expect(tierRow.sound).toBeNull()
      expect(tierRow.motion).toBe('none')
    }
    // And the grammar itself, not just the table.
    const limit = cuesForSimResult(simResult({ stopReason: 'limit' }))[0]!
    expect(limit.tier).toBe(3)
    expect(limit.sound).toBeNull()
    expect(limit.motion).toBe('none')
  })

  it('tier 1 is reserved and few: exactly release and constructionCompleted among stop reasons', () => {
    const tierOne = ALL_STOP_REASONS.filter((r) => STOP_REASON_TIERS[r].tier === 1)
    expect([...tierOne].sort()).toEqual(['constructionCompleted', 'release'])
    for (const stopReason of tierOne) {
      const cue = cuesForSimResult(realistic(stopReason))[0]!
      expect(cue.tier).toBe(1)
      expect(['held-beat', 'emphasis']).toContain(cue.motion)
      expect(String(cue.sound).startsWith('sting-'), 'a tier-1 cue carries a sting').toBe(true)
    }
  })

  it('every commit is tier 2 — a commit receipt is minor by law', () => {
    for (const kind of ALL_COMMIT_KINDS) {
      expect(cueForActionCommit(kind, 7).tier, `${kind} is tier 2`).toBe(2)
    }
  })
})

// ── The co-tick law ──────────────────────────────────────────────────────────
describe('PF1-M2 contract — co-tick law (adapter.ts:2236-2240 is the spec)', () => {
  it('release + a construction completion yields exactly two cues, release first', () => {
    const cues = cuesForSimResult(
      simResult({ stopReason: 'release', toWeek: 31, completion: completionSummary(31) }),
    )
    expect(cues).toHaveLength(2)
    expect(row(cues[0]!), 'the primary keeps priority').toEqual(STOP_REASON_TIERS.release)
    expect(row(cues[1]!), 'the orthogonal completion rides second').toEqual(COMPLETION_ROW)
    expect(cues[0]!.id).not.toBe(cues[1]!.id)
  })

  it('constructionCompleted with its own completion summary yields exactly ONE cue', () => {
    const cues = cuesForSimResult(
      simResult({
        stopReason: 'constructionCompleted',
        toWeek: 31,
        completion: completionSummary(31),
      }),
    )
    expect(cues, 'the completion is its own primary — it must not punctuate twice').toHaveLength(1)
    expect(row(cues[0]!)).toEqual(COMPLETION_ROW)
  })

  it('every OTHER stop reason carries the completion exactly once, after its primary', () => {
    for (const stopReason of ALL_STOP_REASONS) {
      if (stopReason === 'constructionCompleted') continue
      const cues = cuesForSimResult(
        simResult({ stopReason, toWeek: 44, completion: completionSummary(44) }),
      )
      expect(cues, `${stopReason} + completion emits primary + completion`).toHaveLength(2)
      expect(row(cues[0]!), `${stopReason} primary`).toEqual(STOP_REASON_TIERS[stopReason])
      expect(row(cues[1]!), `${stopReason} completion`).toEqual(COMPLETION_ROW)
      expect(cues[0]!.id, `${stopReason}: the two cues are distinguishable`).not.toBe(cues[1]!.id)
    }
  })

  it('a null constructionCompletion adds nothing at all', () => {
    for (const stopReason of ALL_STOP_REASONS) {
      expect(
        cuesForSimResult(realistic(stopReason)),
        `${stopReason} with no completion emits one cue`,
      ).toHaveLength(1)
    }
  })

  it('the completion cue is the same row wherever it rides', () => {
    const rows = ALL_STOP_REASONS.filter((r) => r !== 'constructionCompleted').map((stopReason) =>
      row(cuesForSimResult(simResult({ stopReason, completion: completionSummary(9) }))[1]!),
    )
    for (const tierRow of rows) expect(tierRow).toEqual(COMPLETION_ROW)
  })
})

// ── Id stability ─────────────────────────────────────────────────────────────
describe('PF1-M2 contract — cue ids are stable and derived from receipt facts only', () => {
  it('every cue carries a non-empty string id', () => {
    for (const stopReason of ALL_STOP_REASONS) {
      for (const cue of cuesForSimResult(simResult({ stopReason, completion: completionSummary(12) }))) {
        expect(typeof cue.id).toBe('string')
        expect(cue.id.trim().length, `${stopReason}: id must not be blank`).toBeGreaterThan(0)
      }
    }
  })

  it('same receipt facts → identical ids, from two independently built results', () => {
    for (const stopReason of ALL_STOP_REASONS) {
      const first = cuesForSimResult(simResult({ stopReason, toWeek: 21, completion: completionSummary(21) }))
      const second = cuesForSimResult(simResult({ stopReason, toWeek: 21, completion: completionSummary(21) }))
      expect(second.map((c) => c.id), `${stopReason}: ids are a function of the facts`).toEqual(
        first.map((c) => c.id),
      )
      expect(second, `${stopReason}: the whole cue list is a function of the facts`).toEqual(first)
    }
  })

  it('asking twice for the same result returns the identical cue list (no counter, no nonce)', () => {
    const result = simResult({ stopReason: 'release', toWeek: 18, completion: completionSummary(18) })
    expect(cuesForSimResult(result)).toEqual(cuesForSimResult(result))
    expect(cuesForSimResult(result)).toEqual(cuesForSimResult(result))
  })

  it('a different week → a different id (the week is part of the receipt identity)', () => {
    for (const stopReason of ALL_STOP_REASONS) {
      const early = cuesForSimResult(realistic(stopReason, 10, 12))[0]!
      const late = cuesForSimResult(realistic(stopReason, 40, 42))[0]!
      expect(late.id, `${stopReason}: two weeks are two events`).not.toBe(early.id)
      // …and only the id moves: the tier row is a property of the reason, not the week.
      expect(row(late)).toEqual(row(early))
    }
  })

  it('the commit / refusal / formation / week-advance ids all move with the week', () => {
    for (const kind of ALL_COMMIT_KINDS) {
      expect(cueForActionCommit(kind, 3).id).not.toBe(cueForActionCommit(kind, 4).id)
      expect(cueForActionCommit(kind, 3).id).toBe(cueForActionCommit(kind, 3).id)
    }
    expect(cueForRefusal(3).id).not.toBe(cueForRefusal(4).id)
    expect(cueForFormation(3).id).not.toBe(cueForFormation(4).id)
    expect(cueForWeekAdvance(3).id).not.toBe(cueForWeekAdvance(4).id)
  })

  it('two different receipts in the SAME week never share an id (dedup needs distinguishability)', () => {
    const week = 26
    // Every action-receipt cue the same week can produce.
    const receiptIds = [
      ...ALL_COMMIT_KINDS.map((kind) => cueForActionCommit(kind, week).id),
      cueForRefusal(week).id,
      cueForFormation(week).id,
      cueForWeekAdvance(week).id,
    ]
    expect(new Set(receiptIds).size, 'each commit kind / refusal / formation / tick is its own event').toBe(
      receiptIds.length,
    )

    // Every PRIMARY stop-reason cue the same week can produce. (The orthogonal
    // completion cue is deliberately excluded: it is one authoritative fact and
    // constructionCompleted's primary IS that fact, so its id legitimately recurs
    // — that recurrence is what makes the co-tick dedup possible.)
    const primaryIds = ALL_STOP_REASONS.map(
      (stopReason) => cuesForSimResult(realistic(stopReason, week - 1, week))[0]!.id,
    )
    expect(new Set(primaryIds).size, 'each stop reason is its own event').toBe(primaryIds.length)
  })
})

// ── The action-receipt rows ──────────────────────────────────────────────────
describe('PF1-M2 contract — action commits, refusal, formation, week advance', () => {
  it('pins the full row for every CommitKind', () => {
    // 8 at M2; 9 from PF1-M4, which gave founding its own name (see ALL_COMMIT_KINDS).
    expect(ALL_COMMIT_KINDS).toHaveLength(9)
    expect([...ALL_COMMIT_KINDS].sort()).toEqual(Object.keys(COMMIT_TIERS).sort())
    for (const kind of ALL_COMMIT_KINDS) {
      expect(row(cueForActionCommit(kind, 12)), `${kind} tier row`).toEqual(COMMIT_TIERS[kind])
    }
  })

  it('a build commit says CONSTRUCTION STARTED, not the generic commit sound', () => {
    expect(cueForActionCommit('build-commit', 12).sound).toBe('construction-started')
    for (const kind of ALL_COMMIT_KINDS) {
      if (kind === 'build-commit') continue
      expect(cueForActionCommit(kind, 12).sound, `${kind} uses the commit family`).toBe('commit')
    }
  })

  it('a refusal is heard, never animated', () => {
    expect(row(cueForRefusal(12))).toEqual(REFUSAL_ROW)
  })

  it('PICTURE FORMED gets its held beat', () => {
    expect(row(cueForFormation(12))).toEqual(FORMATION_ROW)
  })

  it('a week advance is a quiet tick — a sound, no motion (law 3: skipped weeks are not narrated)', () => {
    expect(row(cueForWeekAdvance(12))).toEqual(WEEK_ADVANCE_ROW)
    // One advance, one cue, however many weeks the batch covered: the grammar is
    // given the arriving week and nothing per-week to iterate.
    expect(row(cueForWeekAdvance(99))).toEqual(WEEK_ADVANCE_ROW)
  })
})

// ── Purity ───────────────────────────────────────────────────────────────────
// The charter's "no React, no timers, no audio calls" and §2's "no Math.random()"
// are properties of the MODULE, so they are asserted against its source text on
// the established comment-stripping walk (ui/src/hygiene.test.tsx idiom).
describe('PF1-M2 contract — the grammar is pure (§5-M2, §2)', () => {
  const grammarPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'presentation',
    'eventGrammar.ts',
  )

  function executableSource(path: string): string {
    return readFileSync(path, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
  }

  const FORBIDDEN: readonly { name: string; pattern: RegExp }[] = [
    { name: 'Math.random', pattern: /\bMath\s*\.\s*random\b/ },
    { name: 'Date.now', pattern: /\bDate\s*\.\s*now\b/ },
    { name: 'new Date', pattern: /\bnew\s+Date\b/ },
    { name: 'setTimeout', pattern: /\bsetTimeout\b/ },
    { name: 'setInterval', pattern: /\brequestAnimationFrame\b|\bsetInterval\b/ },
    { name: 'react', pattern: /from\s+['"]react/ },
    { name: 'the audio service', pattern: /getAudioService|initAudioService|\bplayCue\b/ },
    { name: 'localStorage', pattern: /\blocalStorage\b/ },
  ]

  it('names no clock, no RNG, no React and no audio call', () => {
    const src = executableSource(grammarPath)
    expect(src.trim().length, 'the walk must not pass on an empty read').toBeGreaterThan(0)
    const found = FORBIDDEN.filter(({ pattern }) => pattern.test(src)).map(({ name }) => name)
    expect(found, 'eventGrammar.ts is a pure total function over receipt facts').toEqual([])
  })

  it('does not mutate the SimResult it is handed', () => {
    const result = simResult({ stopReason: 'release', toWeek: 18, completion: completionSummary(18) })
    const before = {
      stopReason: result.stopReason,
      fromWeek: result.fromWeek,
      toWeek: result.toWeek,
      completion: { ...result.constructionCompletion! },
      stopMessage: result.stopMessage,
    }
    cuesForSimResult(result)
    expect(result.stopReason).toBe(before.stopReason)
    expect(result.fromWeek).toBe(before.fromWeek)
    expect(result.toWeek).toBe(before.toWeek)
    expect(result.stopMessage).toBe(before.stopMessage)
    expect({ ...result.constructionCompletion! }).toEqual(before.completion)
  })
})
