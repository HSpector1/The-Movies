// ── C2a-M3 — THE WRITER-SPEED LAW (owner ruling `00E`.9) ─────────────────────
//
// The ruling REVERSES what C1 shipped, so this suite is written as the successor
// to a deleted claim rather than as a new feature's tests:
//
//   PREDECESSOR (C1): draft strength was `0.6·baselineStrength + 0.4·writerSkill`
//   and the draft clock was the constant one week.
//   SUCCESSOR (`00E`.9): *writer experience affects WRITING SPEED, not script
//   quality; the Script Office tier owns the achievable quality ceiling;
//   additional writers may accelerate completion via bounded pooling.*
//
// The corpus is the authority and it is developer-reviewed: "The more experience
// a scriptwriter has, the faster scripts will be completed. Scriptwriter
// experience has no bearing on the quality of the script. To speed the writing of
// scripts, put multiple writers on the project." [CORPUS Prima, verbatim;
// Bible §5.4, §12.]

import { describe, expect, it } from 'vitest'
import {
  GENRE_ORDER,
  TUNING,
  assessFirstDraft,
  developmentOfficeRichnessTier,
  generateWorld,
  screenplayDraftConsequence,
  scriptDraftWeeks,
  writingPaceExperience,
} from '../src/core/index.js'
import type { Genre, Talent } from '../src/core/index.js'

const NOVICE = 0
const VETERAN = 100

function writerWith(base: Talent, genre: Genre, perceived: number): Talent {
  const writer = structuredClone(base)
  writer.genreExperience.writing[genre] = { actual: 0, perceived }
  return writer
}

describe('C2a-M3 — quality: the writer term is gone, and nothing replaced it', () => {
  it('assesses a first draft from premise + office only', () => {
    const world = generateWorld('m3-quality-law')
    for (const concept of world.concepts.slice(0, 6)) {
      const plain = assessFirstDraft(concept)
      expect(plain.actualStrength).toBeCloseTo(concept.baselineStrength, 12)
      expect(plain.perceivedStrength).toBe(plain.actualStrength)

      const lifted = assessFirstDraft(concept, 9)
      expect(lifted.actualStrength).toBeCloseTo(Math.min(100, concept.baselineStrength + 9), 12)
      expect(lifted.perceivedStrength).toBe(lifted.actualStrength)
    }
  })

  it('keeps both strengths inside 0..100 at the extremes of the office lever', () => {
    const world = generateWorld('m3-quality-bounds')
    for (const concept of world.concepts) {
      for (const uplift of [0, 4, 9, 1000]) {
        const assessment = assessFirstDraft(concept, uplift)
        expect(assessment.actualStrength).toBeGreaterThanOrEqual(0)
        expect(assessment.actualStrength).toBeLessThanOrEqual(100)
        expect(assessment.perceivedStrength).toBeGreaterThanOrEqual(0)
        expect(assessment.perceivedStrength).toBeLessThanOrEqual(100)
      }
    }
  })
})

describe('C2a-M3 — speed: bounded, deterministic, and pool concepts unaffected', () => {
  const original = {
    origin: 'original' as const,
    officeTierAtMint: 'development-casting-annex',
    writerExperience: NOVICE,
    writerCount: 1,
  }

  it('holds a POOL concept at the classic one-week clock, unconditionally', () => {
    // THE BLAST-RADIUS BOUND. Every C1 path was measured against this constant,
    // and no combination of the new levers may move it.
    for (const officeTierAtMint of [
      'development-casting-annex',
      'development-office-2',
      'development-office-3',
    ]) {
      for (const writerExperience of [NOVICE, 50, VETERAN]) {
        for (const writerCount of [1, 3, 5]) {
          expect(
            scriptDraftWeeks({ origin: 'pool', officeTierAtMint, writerExperience, writerCount }),
          ).toBe(TUNING.SCRIPT_DRAFT_WEEKS_POOL)
        }
      }
    }
    expect(TUNING.SCRIPT_DRAFT_WEEKS_POOL).toBe(1)
  })

  it('stays inside [MIN, MAX] for every combination of every term', () => {
    for (const officeTierAtMint of [
      'development-casting-annex',
      'development-office-2',
      'development-office-3',
      'a-tier-that-does-not-exist',
    ]) {
      for (let experience = -20; experience <= 120; experience += 10) {
        for (let writerCount = 0; writerCount <= 8; writerCount++) {
          const weeks = scriptDraftWeeks({
            origin: 'original',
            officeTierAtMint,
            writerExperience: experience,
            writerCount,
          })
          expect(Number.isInteger(weeks)).toBe(true)
          expect(weeks).toBeGreaterThanOrEqual(TUNING.SCRIPT_DRAFT_WEEKS_MIN)
          expect(weeks).toBeLessThanOrEqual(TUNING.SCRIPT_DRAFT_WEEKS_MAX)
        }
      }
    }
  })

  it('makes experience STRICTLY faster, never slower — and it is the writer’s only lever', () => {
    const novice = scriptDraftWeeks(original)
    const veteran = scriptDraftWeeks({ ...original, writerExperience: VETERAN })
    expect(veteran).toBeLessThan(novice)
    // Monotone: more experience never costs weeks.
    let previous = Number.POSITIVE_INFINITY
    for (let experience = 0; experience <= 100; experience += 5) {
      const weeks = scriptDraftWeeks({ ...original, writerExperience: experience })
      expect(weeks).toBeLessThanOrEqual(previous)
      previous = weeks
    }
  })

  it('makes each extra writer help, up to the corpus cap of five', () => {
    let previous = Number.POSITIVE_INFINITY
    for (let writerCount = 1; writerCount <= TUNING.SCRIPT_DRAFT_MAX_WRITERS; writerCount++) {
      const weeks = scriptDraftWeeks({ ...original, writerCount })
      expect(weeks).toBeLessThanOrEqual(previous)
      previous = weeks
    }
    // A sixth hand buys nothing: the cap is the cap.
    expect(scriptDraftWeeks({ ...original, writerCount: 9 })).toBe(
      scriptDraftWeeks({ ...original, writerCount: TUNING.SCRIPT_DRAFT_MAX_WRITERS }),
    )
    expect(scriptDraftWeeks({ ...original, writerCount: 1 })).toBeGreaterThan(
      scriptDraftWeeks({ ...original, writerCount: TUNING.SCRIPT_DRAFT_MAX_WRITERS }),
    )
  })

  it('makes a richer office SLOWER, because a richer script is a longer one', () => {
    // [CORPUS Prima per-tier descriptions: Basic scripts "take the shortest time
    // to write"; every tier above "take[s] longer to write".]
    const baseline = scriptDraftWeeks(original)
    const tierTwo = scriptDraftWeeks({ ...original, officeTierAtMint: 'development-office-2' })
    const tierThree = scriptDraftWeeks({ ...original, officeTierAtMint: 'development-office-3' })
    expect(tierTwo).toBeGreaterThan(baseline)
    expect(tierThree).toBeGreaterThan(tierTwo)
    expect(developmentOfficeRichnessTier('development-casting-annex')).toBe(0)
    expect(developmentOfficeRichnessTier('development-office-2')).toBe(1)
    expect(developmentOfficeRichnessTier('development-office-3')).toBe(2)
    // An unknown tier is the baseline, never a crash and never a bonus.
    expect(developmentOfficeRichnessTier('facility-that-does-not-exist')).toBe(0)
  })

  it('is a pure function of its four inputs — same inputs, same weeks, always', () => {
    for (let i = 0; i < 50; i++) {
      expect(scriptDraftWeeks({ ...original, writerExperience: 37, writerCount: 2 })).toBe(
        scriptDraftWeeks({ ...original, writerExperience: 37, writerCount: 2 }),
      )
    }
  })
})

describe('C2a-M3 — the pace is set by the most experienced hand', () => {
  it('reads PERCEIVED genre experience, and takes the best of the pool', () => {
    const world = generateWorld('m3-pace')
    const base = world.talent.find((person) => person.role === 'writer')!
    for (const genre of GENRE_ORDER) {
      const novice = writerWith(base, genre, 5)
      const veteran = writerWith(base, genre, 90)
      expect(writingPaceExperience([novice], genre)).toBe(5)
      expect(writingPaceExperience([novice, veteran], genre)).toBe(90)
      expect(writingPaceExperience([veteran, novice], genre)).toBe(90)
      // Order-independent, so a pool is a set and not a queue.
      expect(writingPaceExperience([veteran, novice], genre)).toBe(
        writingPaceExperience([novice, veteran], genre),
      )
    }
    expect(writingPaceExperience([], 'drama')).toBe(0)
  })

  it('never reads the hidden ACTUAL experience — a schedule cannot leak the truth', () => {
    const world = generateWorld('m3-pace-hidden')
    const base = world.talent.find((person) => person.role === 'writer')!
    const secretlyGreat = structuredClone(base)
    secretlyGreat.genreExperience.writing.drama = { actual: 99, perceived: 3 }
    const secretlyPoor = structuredClone(base)
    secretlyPoor.genreExperience.writing.drama = { actual: 1, perceived: 3 }
    expect(writingPaceExperience([secretlyGreat], 'drama')).toBe(
      writingPaceExperience([secretlyPoor], 'drama'),
    )
  })
})

describe('C2a-M3 — the sentence the player reads stays true', () => {
  it('says one week for a one-week draft, in the exact words C1 shipped', () => {
    expect(screenplayDraftConsequence(1)).toBe(
      'One week passes while the writer and one Development & Casting slot are occupied; payroll and studio overhead continue.',
    )
  })

  it('counts the real weeks for a longer draft, and stays grammatical', () => {
    expect(screenplayDraftConsequence(3)).toBe(
      'Three weeks pass while the writer and one Development & Casting slot are occupied; payroll and studio overhead continue.',
    )
    for (let weeks = TUNING.SCRIPT_DRAFT_WEEKS_MIN; weeks <= TUNING.SCRIPT_DRAFT_WEEKS_MAX; weeks++) {
      const sentence = screenplayDraftConsequence(weeks)
      // A player never reads a bare number where a word belongs (`00F` floor).
      expect(sentence).not.toMatch(/\d/)
      expect(sentence.endsWith('.')).toBe(true)
      expect(sentence).toContain(
        'the writer and one Development & Casting slot are occupied',
      )
    }
  })
})
