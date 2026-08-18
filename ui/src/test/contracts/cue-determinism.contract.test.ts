// ── PF1-M2 CONTRACT SUITE — cue determinism ──────────────────────────────────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M2 / §7 / §2, NOT from the
// implementation.
//
// Governing charter law exercised by this file:
//   • "Determinism: same seed + same action script → identical cue-token
//      sequence, asserted determinism-suite-style."                  (§5-M2)
//   • "Determinism: same seed + same actions → identical cue-token log."  (§7)
//   • "The presentation layer makes no RNG draws from the sim stream and no
//      Math.random() calls. Sensory variation, if any, derives from stable
//      authoritative data."                                             (§2)
//
// The assertion is byte equality of the ORDERED sink log (JSON.stringify), which
// is the strongest available statement of "the same script sounds the same".
// DETERMINISM: no Math.random, no Date.now, no timers, no real playback.

import { describe, expect, it } from 'vitest'
import { RecordingSink } from '../../audio/sink.ts'
import { getAudioService, initAudioService } from '../../audio/audioService.ts'
import {
  punctuateCommit,
  punctuateFormation,
  punctuateRefusal,
  punctuateSimResult,
  punctuateWeekAdvance,
} from '../../presentation/punctuate.ts'
import type { PresentationCue } from '../../presentation/eventGrammar.ts'
import { newGame } from '../../engine/adapter.ts'
import type {
  ConstructionCompletionSummary,
  GameState,
  PeriodSummary,
  SimResult,
  SimStopReason,
} from '../../engine/adapter.ts'

const FIXTURE_WORLD: GameState = newGame('pf1-m2-determinism-fixture')

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
    projectId: 'placement-0003',
    facilityId: 'castingAnnex',
    name: 'Casting Annex',
    completedWeek: week,
    message: 'The Casting Annex is finished and open for work.',
  }
}

function simResult(
  stopReason: SimStopReason,
  toWeek: number,
  completion: ConstructionCompletionSummary | null = null,
): SimResult {
  const fromWeek = Math.max(0, toWeek - 2)
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
    stopMessage: `Stopped at Week ${toWeek}.`,
    guardHit: false,
    summary: emptySummary(fromWeek, toWeek),
  }
}

// ── THE SCRIPT ───────────────────────────────────────────────────────────────
// Twelve mixed punctuations covering every entry point, both tiers that sound,
// the tier that does not, and the co-tick. Fixed inputs, fixed order, no clock.
type Run = { log: string; cueIds: string[]; cues: PresentationCue[] }

function runScript(): Run {
  const sink = new RecordingSink()
  initAudioService(sink)
  getAudioService().unlock()
  sink.clear()

  const cues: PresentationCue[] = []
  // Shape-agnostic: see the CONTRACT AMBIGUITY note in punctuate.contract.test.ts
  // — the frozen interface leaves singular-vs-array unstated for the single-receipt
  // entry points, so both readings are accepted and the ORDER is what is pinned.
  const push = (produced: PresentationCue | readonly PresentationCue[]): void => {
    if (Array.isArray(produced)) cues.push(...produced)
    else cues.push(produced as PresentationCue)
  }

  push(punctuateWeekAdvance(1)) //  1  quiet tick
  push(punctuateCommit('commission', 1)) //  2  commit family
  push(punctuateSimResult(simResult('scriptReview', 3))) //  3  tier 2 / select
  push(punctuateCommit('draft-accepted', 3)) //  4  commit family
  push(punctuateFormation(4)) //  5  tier 1 sting
  push(punctuateSimResult(simResult('productionDecision', 6))) //  6  tier 2 / select
  push(punctuateRefusal(6)) //  7  tier 2, no motion
  push(punctuateCommit('build-commit', 7)) //  8  construction started
  push(punctuateSimResult(simResult('release', 11, completionSummary(11)))) //  9  co-tick (two cues)
  push(punctuateSimResult(simResult('limit', 13))) // 10  tier 3 — silent
  push(punctuateSimResult(simResult('constructionCompleted', 15, completionSummary(15)))) // 11 once
  push(punctuateWeekAdvance(16)) // 12  quiet tick

  return {
    log: JSON.stringify(sink.log),
    cueIds: cues.map((cue) => cue.id),
    cues,
  }
}

// ui/src/test/setup.ts clears localStorage before every test, so every run below
// starts from the shipped default prefs (unmuted).

describe('PF1-M2 contract — the same script sounds byte-identically', () => {
  it('two fresh service+sink pairs produce byte-identical ordered sink logs', () => {
    const first = runScript()
    const second = runScript()
    expect(second.log).toBe(first.log)
  })

  it('the run is not vacuous: the script actually reached the hardware', () => {
    const run = runScript()
    const entries = JSON.parse(run.log) as { call: string }[]
    const played = entries.filter((entry) => entry.call === 'play')
    // 12 punctuations → 13 cues (the co-tick adds one) → 12 of them carry sound
    // (only the tier-3 `limit` is silent).
    expect(run.cues).toHaveLength(13)
    expect(run.cues.filter((cue) => cue.sound === null)).toHaveLength(1)
    if (played.length === 0) return // the whole run is hard-muted (VITE_AUDIO_MUTED=1)
    expect(played).toHaveLength(12)
  })

  it('the ordered cue-id sequence is identical across runs', () => {
    const first = runScript()
    const second = runScript()
    expect(second.cueIds).toEqual(first.cueIds)
    expect(JSON.stringify(second.cues)).toBe(JSON.stringify(first.cues))
  })

  it('a third run, after other work has run the service, still matches the first', () => {
    const first = runScript()
    // Interleave unrelated punctuation on a throwaway service: nothing about the
    // grammar or punctuate may carry over between sessions.
    const noise = new RecordingSink()
    initAudioService(noise)
    getAudioService().unlock()
    punctuateFormation(99)
    punctuateSimResult(simResult('cashNegative', 101))
    punctuateCommit('publicity', 101)

    const third = runScript()
    expect(third.log).toBe(first.log)
    expect(third.cueIds).toEqual(first.cueIds)
  })

  it('every id in the script is a stable, non-empty string', () => {
    const run = runScript()
    for (const id of run.cueIds) {
      expect(typeof id).toBe('string')
      expect(id.trim().length).toBeGreaterThan(0)
    }
  })
})
