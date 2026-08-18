// ── C2a-M3 — the authored screenplay vocabulary (charter §3.5) ───────────────
//
// Two authored tables carry the whole of "genre supplies the skeleton": the
// seven-beat templates and the genre-keyed title leads. What this suite protects
// is not arithmetic — it is the EVIDENCE DISCIPLINE. A recovered beat name that
// drifts, an authored template that stops saying it was authored, or a lead word
// that is not one of the shipped 48 are all failures of the same kind: a claim
// about the corpus that stopped being true.

import { describe, expect, it } from 'vitest'
import {
  BEAT_TEMPLATES,
  BEATS_PER_BLUEPRINT,
  CONCEPT_DISTRIBUTIONS,
  GENRE_ORDER,
  SET_TYPES,
  SLOT_ORDER,
  TITLE_LEAD,
  TITLE_LEAD_BY_GENRE,
  TITLE_NOUN,
  TUNING,
  UNUSED_RECOVERED_BEAT_SHAPES,
  generateWorld,
} from '../src/core/index.js'

describe('C2a-M3 — the six genre beat templates', () => {
  it('covers every genre in the vocabulary, with exactly seven beats each', () => {
    for (const genre of GENRE_ORDER) {
      const template = BEAT_TEMPLATES[genre]
      expect(template, genre).toBeDefined()
      expect(template.genre).toBe(genre)
      expect(template.beats).toHaveLength(BEATS_PER_BLUEPRINT)
    }
    expect(Object.keys(BEAT_TEMPLATES)).toHaveLength(GENRE_ORDER.length)
  })

  it('transcribes comedy, romance and horror VERBATIM from the corpus (Bible §5.5)', () => {
    // [CORPUS Bible §5.5 "The Hollywood Scriptwriting Templates" — OFFICIAL
    // manual pp.28-30]. These three exist in the original AND in our vocabulary,
    // so they are transcription, not design. If this test ever needs editing, the
    // corpus is what has to have changed.
    expect(BEAT_TEMPLATES.comedy.beats.map((beat) => beat.name)).toEqual([
      'Intro',
      'Problem',
      'Pursuit',
      'Challenge',
      'Preparation',
      'Conflict',
      'Resolution',
    ])
    expect(BEAT_TEMPLATES.romance.beats.map((beat) => beat.name)).toEqual([
      'Intro',
      'Meeting',
      'Problem',
      'Time Apart',
      'Reunion',
      'Argument',
      'Resolution',
    ])
    expect(BEAT_TEMPLATES.horror.beats.map((beat) => beat.name)).toEqual([
      'Intro',
      'Shock',
      'Pursuit',
      'Encounter',
      'Preparation',
      'Big Fight',
      'Resolution',
    ])
    for (const genre of ['comedy', 'romance', 'horror'] as const) {
      expect(BEAT_TEMPLATES[genre].provenance).toBe('recovered')
      expect(BEAT_TEMPLATES[genre].source).toMatch(/Bible §5\.5/)
    }
  })

  it('LABELS drama, crime and adventure as authored, because no original template exists', () => {
    for (const genre of ['drama', 'crime', 'adventure'] as const) {
      expect(BEAT_TEMPLATES[genre].provenance, genre).toBe('authored')
      expect(BEAT_TEMPLATES[genre].source, genre).toMatch(/AUTHORED/)
    }
  })

  it('does not import the original’s Action and Sci-Fi shapes into our vocabulary', () => {
    // They are RECORDED so the recovery is not lost, and consumed nowhere: the
    // corpus does not license mapping them onto drama/crime/adventure, and the
    // 6-vs-5 genre question belongs to C4.
    expect(Object.keys(UNUSED_RECOVERED_BEAT_SHAPES).sort()).toEqual(['action', 'sciFi'])
    const authoredNames = new Set(
      GENRE_ORDER.flatMap((genre) => BEAT_TEMPLATES[genre].beats.map((beat) => beat.name)),
    )
    // The reference shapes are not silently re-used as a whole: no genre's beat
    // list equals either of them.
    for (const shape of Object.values(UNUSED_RECOVERED_BEAT_SHAPES)) {
      for (const genre of GENRE_ORDER) {
        expect(BEAT_TEMPLATES[genre].beats.map((beat) => beat.name)).not.toEqual([...shape])
      }
    }
    expect(authoredNames.has('Skirmish')).toBe(false)
  })

  it('asks only for locations the SET_TYPES vocabulary can build (owner law 2)', () => {
    const vocabulary = new Set<string>(SET_TYPES)
    for (const genre of GENRE_ORDER) {
      for (const beat of BEAT_TEMPLATES[genre].beats) {
        expect(vocabulary.has(beat.requiredSetType), `${genre}/${beat.name}`).toBe(true)
      }
    }
  })

  it('gives every genre real set VARIETY — never one location for seven beats', () => {
    for (const genre of GENRE_ORDER) {
      const distinct = new Set(BEAT_TEMPLATES[genre].beats.map((beat) => beat.requiredSetType))
      expect(distinct.size, genre).toBeGreaterThanOrEqual(3)
      expect(distinct.size, genre).toBeLessThanOrEqual(BEATS_PER_BLUEPRINT)
    }
  })

  it('names beats in filmmaking words and stays ERA-CLEAN (G15)', () => {
    for (const genre of GENRE_ORDER) {
      for (const beat of BEAT_TEMPLATES[genre].beats) {
        expect(beat.name.trim()).toBe(beat.name)
        expect(beat.name.length).toBeGreaterThan(0)
        // A player reads these. No engine ids, no decades, no technology.
        expect(beat.name).not.toMatch(/\d/)
        expect(beat.name).not.toMatch(/-/)
        expect(beat.name[0]).toBe(beat.name[0]!.toUpperCase())
      }
    }
  })
})

describe('C2a-M3 — the genre-keyed title leads', () => {
  it('adds NOT ONE new authored word — every lead is one of the shipped 48', () => {
    const authored = new Set(TITLE_LEAD)
    for (const genre of GENRE_ORDER) {
      for (const lead of TITLE_LEAD_BY_GENRE[genre]) {
        expect(authored.has(lead), `${genre}: ${lead}`).toBe(true)
      }
    }
    expect(TITLE_LEAD).toHaveLength(48)
    expect(TITLE_NOUN).toHaveLength(60)
  })

  it('gives every genre a subset big enough to vary and small enough to flavour', () => {
    for (const genre of GENRE_ORDER) {
      const leads = TITLE_LEAD_BY_GENRE[genre]
      expect(leads.length, genre).toBeGreaterThanOrEqual(8)
      expect(leads.length, genre).toBeLessThan(TITLE_LEAD.length)
      expect(new Set(leads).size, genre).toBe(leads.length)
    }
  })

  it('is ERA-CLEAN: no lead names a year, a decade, or a technology (G15)', () => {
    for (const genre of GENRE_ORDER) {
      for (const lead of TITLE_LEAD_BY_GENRE[genre]) {
        expect(lead).not.toMatch(/\d/)
      }
    }
  })

  it('actually differs by genre — the subsets are not one list six times', () => {
    const signatures = new Set(
      GENRE_ORDER.map((genre) => [...TITLE_LEAD_BY_GENRE[genre]].sort().join('|')),
    )
    expect(signatures.size).toBe(GENRE_ORDER.length)
  })
})

describe('C2a-M3 — the shared concept distributions', () => {
  it('is the SAME table worldgen draws its own premises from', () => {
    // The charter's requirement is that a minted screenplay is a premise of
    // unknown quality exactly like a world premise. That is only mechanically
    // true if there is one table, so this asserts the shipped values AND that a
    // generated world's concepts land inside them.
    expect(CONCEPT_DISTRIBUTIONS.baselineStrength).toEqual({
      mean: 60,
      sd: 15,
      min: 20,
      max: 95,
    })
    expect(CONCEPT_DISTRIBUTIONS.originalityRaw).toEqual({ mean: 55, sd: 20, min: 5, max: 100 })
    expect(CONCEPT_DISTRIBUTIONS.baseNegativeCost).toEqual({
      mean: 4_500_000,
      sd: 1_500_000,
      min: 2_000_000,
      max: 9_000_000,
    })
    expect(CONCEPT_DISTRIBUTIONS.roleTargetAxis).toEqual({ min: -1, max: 1 })
    expect(CONCEPT_DISTRIBUTIONS.roleTolerance).toEqual({ min: 0.8, max: 1.8 })

    const world = generateWorld('m3-distributions')
    for (const concept of world.concepts) {
      expect(concept.baselineStrength).toBeGreaterThanOrEqual(
        CONCEPT_DISTRIBUTIONS.baselineStrength.min,
      )
      expect(concept.baselineStrength).toBeLessThanOrEqual(
        CONCEPT_DISTRIBUTIONS.baselineStrength.max,
      )
      expect(concept.baseNegativeCost).toBeGreaterThanOrEqual(
        CONCEPT_DISTRIBUTIONS.baseNegativeCost.min,
      )
      expect(concept.baseNegativeCost).toBeLessThanOrEqual(
        CONCEPT_DISTRIBUTIONS.baseNegativeCost.max,
      )
      expect(concept.requiredSlots).toEqual([...SLOT_ORDER])
    }
  })
})

describe('C2a-M3 — the draft-week TUNING family, bounded', () => {
  it('states every term at its authored value and keeps the family coherent', () => {
    expect(TUNING.SCRIPT_DRAFT_WEEKS_POOL).toBe(1)
    expect(TUNING.SCRIPT_DRAFT_WEEKS_BASE).toBe(3)
    expect(TUNING.SCRIPT_DRAFT_WEEKS_MIN).toBe(1)
    expect(TUNING.SCRIPT_DRAFT_WEEKS_MAX).toBe(6)
    expect(TUNING.SCRIPT_DRAFT_RICHNESS_WEEKS_PER_OFFICE_TIER).toBe(1)
    expect(TUNING.SCRIPT_DRAFT_EXPERIENCE_WEEKS_MAX).toBe(2)
    expect(TUNING.SCRIPT_DRAFT_WEEKS_PER_EXTRA_WRITER).toBe(0.5)
    expect(TUNING.SCRIPT_DRAFT_MAX_WRITERS).toBe(5)
    expect(TUNING.SCREENPLAY_TITLE_MAX_LENGTH).toBe(64)

    // THE LAWS BETWEEN THEM.
    // A draft is never instant and never open-ended.
    expect(TUNING.SCRIPT_DRAFT_WEEKS_MIN).toBeGreaterThanOrEqual(1)
    expect(TUNING.SCRIPT_DRAFT_WEEKS_MAX).toBeGreaterThan(TUNING.SCRIPT_DRAFT_WEEKS_MIN)
    // The pool clock is the C1 clock, and it is the floor.
    expect(TUNING.SCRIPT_DRAFT_WEEKS_POOL).toBe(TUNING.SCRIPT_DRAFT_WEEKS_MIN)
    // The base plus the richest office still fits inside the ceiling, so the
    // clamp is a guard rather than a silent truncation of the authored design.
    expect(
      TUNING.SCRIPT_DRAFT_WEEKS_BASE + 2 * TUNING.SCRIPT_DRAFT_RICHNESS_WEEKS_PER_OFFICE_TIER,
    ).toBeLessThanOrEqual(TUNING.SCRIPT_DRAFT_WEEKS_MAX)
    // Neither speed lever alone can reach the floor from the base — a fast writer
    // still needs a week, which is what makes pooling worth doing.
    expect(TUNING.SCRIPT_DRAFT_EXPERIENCE_WEEKS_MAX).toBeLessThan(
      TUNING.SCRIPT_DRAFT_WEEKS_BASE,
    )
    expect(
      TUNING.SCRIPT_DRAFT_WEEKS_PER_EXTRA_WRITER * (TUNING.SCRIPT_DRAFT_MAX_WRITERS - 1),
    ).toBeLessThan(TUNING.SCRIPT_DRAFT_WEEKS_BASE)
    // The corpus number, verbatim.
    expect(TUNING.SCRIPT_DRAFT_MAX_WRITERS).toBe(5)
  })
})
