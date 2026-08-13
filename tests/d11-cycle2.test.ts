// ── D-11.A cycle-2 corrections — INDEPENDENT acceptance tests ─────────────────
// Every expectation is hand-derived from ruling D-11.A (docs/rev4-open-questions.md):
// unique production ids, immutable film-specific participant history, 3-actor founding
// minimum, founding-aware/free-agent custom creation, and Full Custom creation. Imports
// ONLY the public core surface. Seeded RNG only.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  exportSave,
  FOUNDING_MINIMUMS,
  generateWorld,
  importSave,
  isContracted,
  makeSave,
  previewCustomTalent,
  roleOVR,
  ROLE_TO_DISCIPLINE,
  rosterTalent,
  tick,
  TUNING,
} from '../src/core/index.js'
import type {
  CastSlot,
  CreativeRole,
  CustomTalentInput,
  Discipline,
  GameState,
  Talent,
} from '../src/core/index.js'

// ── helpers ──
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const

// A generously-founded studio: enough roster (8 actors, 2 directors, 3 writers, 2 craft)
// to stage TWO concurrent films. Deterministic per seed.
function founded(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const pick = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [...pick('actor', 8), ...pick('director', 2), ...pick('writer', 3), ...pick('craft', 2)]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function greenlight(
  s: GameState,
  ids: { writerId: string; directorId: string; cast: Record<CastSlot, string>; craftId: string },
): GameState {
  const concept = s.concepts[0]!
  return applyActions(s, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: SHAPE,
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: {
            intimacy: [-0.4, 0.4],
            tonalWeight: [-0.4, 0.4],
            kineticEnergy: [-0.4, 0.4],
          },
        },
        writerId: ids.writerId,
        directorId: ids.directorId,
        cast: ids.cast,
        craftIds: [ids.craftId],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}

function rosterByRole(s: GameState, role: CreativeRole): Talent[] {
  return rosterTalent(s).filter((t) => t.role === role)
}

function advance(s: GameState, n: number, develop = false): GameState {
  let cur = s
  for (let i = 0; i < n; i++) cur = tick(cur, { develop })
  return cur
}

// ── D-11.A A4 — unique production ids (root cause of the duplicated autopsy) ───
describe('D-11.A — production ids are unique even for same-tick greenlights', () => {
  it('two films greenlit in the SAME week get DISTINCT ids', () => {
    const s0 = founded('c2-ids')
    const a = rosterByRole(s0, 'actor')
    const w = rosterByRole(s0, 'writer')
    const d = rosterByRole(s0, 'director')
    const cr = rosterByRole(s0, 'craft')
    let s = greenlight(s0, {
      writerId: w[0]!.id,
      directorId: d[0]!.id,
      cast: { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id },
      craftId: cr[0]!.id,
    })
    s = greenlight(s, {
      writerId: w[1]!.id,
      directorId: d[1]!.id,
      cast: { lead: a[3]!.id, antagonist: a[4]!.id, support: a[5]!.id },
      craftId: cr[1]!.id,
    })
    const ids = s.studio.activeProductions.map((p) => p.id)
    expect(ids.length).toBe(2)
    expect(new Set(ids).size).toBe(2) // distinct
    expect(ids).toContain('prod-0000')
    expect(ids).toContain('prod-0000-1')
  })

  it('a single greenlight keeps the base id (M0A byte-identity: prod-0000)', () => {
    const s0 = founded('c2-ids-single')
    const a = rosterByRole(s0, 'actor')
    const s = greenlight(s0, {
      writerId: rosterByRole(s0, 'writer')[0]!.id,
      directorId: rosterByRole(s0, 'director')[0]!.id,
      cast: { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id },
      craftId: rosterByRole(s0, 'craft')[0]!.id,
    })
    expect(s.studio.activeProductions[0]!.id).toBe('prod-0000')
  })
})

// ── D-11.A A4 — immutable film-specific participant history ────────────────────
describe('D-11.A — each released film keeps its OWN immutable participants', () => {
  // Two DIFFERENT films (different writer/director/cast/craft), released, then inspected.
  function twoFilms(seed: string) {
    const s0 = founded(seed)
    const a = rosterByRole(s0, 'actor')
    const w = rosterByRole(s0, 'writer')
    const d = rosterByRole(s0, 'director')
    const cr = rosterByRole(s0, 'craft')
    const filmA = {
      writerId: w[0]!.id,
      directorId: d[0]!.id,
      cast: { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id },
      craftId: cr[0]!.id,
    }
    const filmB = {
      writerId: w[1]!.id,
      directorId: d[1]!.id,
      cast: { lead: a[3]!.id, antagonist: a[4]!.id, support: a[5]!.id },
      craftId: cr[1]!.id,
    }
    let s = greenlight(s0, filmA)
    s = greenlight(s, filmB)
    // Advance to release both (PRODUCTION_TICKS = 8; both greenlit at tick 0).
    s = advance(s, TUNING.PRODUCTION_TICKS + 2, true)
    const released = s.studio.releasedFilms
    return { s, released, filmA, filmB }
  }

  it('film A and film B use different writers/directors/actors/craft and each records its own', () => {
    const { released, filmA, filmB } = twoFilms('c2-part-1')
    expect(released.length).toBe(2)
    const A = released.find((f) => f.participants!.writer.talentId === filmA.writerId)!
    const B = released.find((f) => f.participants!.writer.talentId === filmB.writerId)!
    expect(A).toBeDefined()
    expect(B).toBeDefined()
    // A's record is exactly A's talent.
    expect(A.participants!.director.talentId).toBe(filmA.directorId)
    expect(A.participants!.cast.lead.talentId).toBe(filmA.cast.lead)
    expect(A.participants!.craft[0]!.talentId).toBe(filmA.craftId)
    // B's record is exactly B's talent — and DISJOINT from A.
    expect(B.participants!.director.talentId).toBe(filmB.directorId)
    expect(B.participants!.cast.lead.talentId).toBe(filmB.cast.lead)
    expect(B.participants!.craft[0]!.talentId).toBe(filmB.craftId)
    expect(A.participants!.writer.talentId).not.toBe(B.participants!.writer.talentId)
    expect(A.participants!.cast.lead.talentId).not.toBe(B.participants!.cast.lead.talentId)
  })

  it('participants carry greenlight name/OVR/Fit/EP and contracted status', () => {
    const { released, filmA } = twoFilms('c2-part-2')
    const A = released.find((f) => f.participants!.writer.talentId === filmA.writerId)!
    const w = A.participants!.writer
    expect(typeof w.name).toBe('string')
    expect(w.name.length).toBeGreaterThan(0)
    expect(w.discipline).toBe('writing')
    expect(w.greenlightOVR).toBeGreaterThan(0)
    expect(w.greenlightEP.high).toBeGreaterThanOrEqual(w.greenlightEP.low)
    expect(w.freelancer).toBe(false) // signed roster writer
    expect(A.participants!.craft[0]!.role).toBe('craft')
  })

  it('later development does NOT rewrite an older film\'s locked greenlight OVR/name', () => {
    const { s, released, filmA } = twoFilms('c2-part-3')
    const A = released.find((f) => f.participants!.writer.talentId === filmA.writerId)!
    const lockedLead = { ...A.participants!.cast.lead }
    // Advance many weeks WITH development; talent skills evolve.
    const s2 = advance(s, 20, true)
    const A2 = s2.studio.releasedFilms.find((f) => f.productionId === A.productionId)!
    expect(A2.participants!.cast.lead.greenlightOVR).toBe(lockedLead.greenlightOVR)
    expect(A2.participants!.cast.lead.name).toBe(lockedLead.name)
    expect(A2.participants!.cast.lead.talentId).toBe(lockedLead.talentId)
  })

  it('releasing a participant does NOT remove them from an older film\'s record', () => {
    const { s, released, filmA } = twoFilms('c2-part-4')
    const A = released.find((f) => f.participants!.writer.talentId === filmA.writerId)!
    // Release film A's lead from the studio.
    const leadId = A.participants!.cast.lead.talentId
    const s2 = applyActions(s, [{ kind: 'releaseTalent', talentId: leadId }])
    expect(isContracted(s2, leadId)).toBe(false)
    const A2 = s2.studio.releasedFilms.find((f) => f.productionId === A.productionId)!
    expect(A2.participants!.cast.lead.talentId).toBe(leadId) // still in the film's history
  })

  it('save/reload (V3) preserves each film\'s distinct participant history', () => {
    const { s } = twoFilms('c2-part-5')
    const reloaded = importSave(exportSave(makeSave(s)))
    if (reloaded.saveVersion !== 10) throw new Error('expected V10') // Casting Sessions V1.
    const before = s.studio.releasedFilms.map((f) => f.participants!.writer.talentId).sort()
    const after = reloaded.state.studio.releasedFilms.map((f) => f.participants!.writer.talentId).sort()
    expect(after).toEqual(before)
    // byte-identical round-trip including participants
    expect(exportSave(makeSave(reloaded.state))).toBe(exportSave(makeSave(s)))
  })
})

// ── D-11.A A1 — three-actor founding minimum ──────────────────────────────────
describe('D-11.A — founding minimum is 3 actors', () => {
  it('FOUNDING_MINIMUMS.actor is 3', () => {
    expect(FOUNDING_MINIMUMS.actor).toBe(3)
  })

  function signN(seed: string, actors: number) {
    let s = beginFounding(generateWorld(seed))
    const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
    const pick = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
    for (const t of [...pick('actor', actors), ...pick('director', 1), ...pick('writer', 2), ...pick('craft', 1)]) {
      s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    }
    return s
  }

  it('exactly 3 actors + 1 director + 2 writers + 1 craft founds legally', () => {
    const founded3 = applyActions(signN('c2-min-3', 3), [{ kind: 'foundStudio' }])
    expect(founded3.founding).toBeNull()
  })

  it('two actors are insufficient', () => {
    expect(() => applyActions(signN('c2-min-2', 2), [{ kind: 'foundStudio' }])).toThrow()
  })

  it('additional actors remain legal', () => {
    const founded5 = applyActions(signN('c2-min-5', 5), [{ kind: 'foundStudio' }])
    expect(founded5.founding).toBeNull()
  })

  it('three roster actors can legally staff a film (3 distinct cast slots)', () => {
    const s0 = applyActions(signN('c2-min-staff', 3), [{ kind: 'foundStudio' }])
    const a = rosterByRole(s0, 'actor')
    expect(a.length).toBe(3)
    const s = greenlight(s0, {
      writerId: rosterByRole(s0, 'writer')[0]!.id,
      directorId: rosterByRole(s0, 'director')[0]!.id,
      cast: { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id },
      craftId: rosterByRole(s0, 'craft')[0]!.id,
    })
    expect(s.studio.activeProductions.length).toBe(1)
  })
})

// ── D-11.A A2 — created talent employment status + signing ─────────────────────
describe('D-11.A — custom-created talent are not auto-employed', () => {
  const CUSTOM: CustomTalentInput = {
    name: 'Ada Cinematographer',
    role: 'craft',
    age: 40,
    actual: { warmth: 0, gravity: 0.2, physicality: 0 },
    workEthic: 80,
    fame: 55,
    skills: {
      acting: [40, 40, 40, 40, 40, 40],
      writing: [40, 40, 40, 40, 40, 40],
      directing: [40, 40, 40, 40, 40, 40],
      craft: [90, 88, 86, 84, 82, 80],
    },
  }

  it('created DURING founding → joins the applicant pool (not employed), signable, counts toward minimum', () => {
    let s = beginFounding(generateWorld('c2-create-founding'))
    s = applyActions(s, [{ kind: 'createCustomTalent', talent: { ...CUSTOM } }])
    const created = s.talent.find((t) => t.name === CUSTOM.name)!
    expect(created).toBeDefined()
    expect(isContracted(s, created.id)).toBe(false) // NOT auto-employed
    expect(s.founding!.applicantIds).toContain(created.id) // in the applicant pool
    // Sign the custom craft as the founding Production/Craft Lead (counts toward minimum).
    s = applyActions(s, [{ kind: 'signContract', talentId: created.id, termWeeks: 104 }])
    expect(isContracted(s, created.id)).toBe(true)
  })

  it('created DURING operations → a Free Agent, not employed, then signable', () => {
    let s = founded('c2-create-ops')
    const before = s.contracts.length
    s = applyActions(s, [{ kind: 'createCustomTalent', talent: { ...CUSTOM, name: 'Ops Custom' } }])
    const created = s.talent.find((t) => t.name === 'Ops Custom')!
    expect(isContracted(s, created.id)).toBe(false) // not auto-employed
    expect(s.freeAgents).toContain(created.id) // free agent, signable via hiring market
    expect(s.contracts.length).toBe(before) // creating added no contract
    s = applyActions(s, [{ kind: 'signContract', talentId: created.id, termWeeks: 104 }])
    expect(isContracted(s, created.id)).toBe(true)
  })

  it('a created Production/Craft Lead can be signed and assigned to a film', () => {
    let s = founded('c2-create-assign')
    s = applyActions(s, [{ kind: 'createCustomTalent', talent: { ...CUSTOM, name: 'Assignable Lead' } }])
    const created = s.talent.find((t) => t.name === 'Assignable Lead')!
    s = applyActions(s, [{ kind: 'signContract', talentId: created.id, termWeeks: 104 }])
    const a = rosterByRole(s, 'actor')
    const g = greenlight(s, {
      writerId: rosterByRole(s, 'writer')[0]!.id,
      directorId: rosterByRole(s, 'director')[0]!.id,
      cast: { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id },
      craftId: created.id, // the custom craft as the Production/Craft Lead
    })
    expect(g.studio.activeProductions[0]!.craftIds).toContain(created.id)
  })
})

// ── D-11.A A3 — Full Custom creation ──────────────────────────────────────────
describe('D-11.A — Full Custom creation (direct skills; OVR derived; bounds enforced)', () => {
  it('creates a talent from direct skills; OVR derives from the skills', () => {
    const s0 = founded('c2-full-1')
    const input: CustomTalentInput = {
      name: 'Custom Star',
      role: 'actor',
      age: 30,
      actual: { warmth: 0.4, gravity: 0.1, physicality: 0.3 },
      workEthic: 70,
      fame: 92,
      skills: {
        acting: [95, 96, 94, 90, 93, 97],
        writing: [30, 30, 30, 30, 30, 30],
        directing: [30, 30, 30, 30, 30, 30],
        craft: [30, 30, 30, 30, 30, 30],
      },
    }
    // Derived preview OVR reflects the high acting skills.
    const preview = previewCustomTalent(input, s0.seed)
    const actingOVR = roleOVR(preview, 'acting' as Discipline)
    expect(actingOVR).toBeGreaterThan(85)
    const s = applyActions(s0, [{ kind: 'createCustomTalent', talent: input }])
    const created = s.talent.find((t) => t.name === 'Custom Star')!
    expect(roleOVR(created, ROLE_TO_DISCIPLINE.actor)).toBe(actingOVR)
  })

  it('a deliberately powerful custom talent (all 99) can be created', () => {
    const s0 = founded('c2-full-2')
    const input: CustomTalentInput = {
      name: 'Maxed Out',
      role: 'director',
      age: 45,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
      workEthic: 99,
      fame: 100,
      skills: {
        acting: [99, 99, 99, 99, 99, 99],
        writing: [99, 99, 99, 99, 99, 99],
        directing: [99, 99, 99, 99, 99, 99],
        craft: [99, 99, 99, 99, 99, 99],
      },
    }
    const s = applyActions(s0, [{ kind: 'createCustomTalent', talent: input }])
    const created = s.talent.find((t) => t.name === 'Maxed Out')!
    expect(roleOVR(created, 'directing' as Discipline)).toBeGreaterThanOrEqual(94)
  })

  it('out-of-range values are clamped/rejected (never NaN/Infinity/>99)', () => {
    const s0 = founded('c2-full-3')
    // Non-finite fame is rejected loudly.
    expect(() =>
      applyActions(s0, [
        {
          kind: 'createCustomTalent',
          talent: {
            name: 'Bad',
            role: 'actor',
            age: 30,
            actual: { warmth: 0, gravity: 0, physicality: 0 },
            workEthic: 50,
            fame: Number.POSITIVE_INFINITY,
            skills: {
              acting: [50, 50, 50, 50, 50, 50],
              writing: [50, 50, 50, 50, 50, 50],
              directing: [50, 50, 50, 50, 50, 50],
              craft: [50, 50, 50, 50, 50, 50],
            },
          },
        },
      ]),
    ).toThrow()
    // Over-99 skills are CLAMPED (defensive), never stored above 99.
    const s = applyActions(s0, [
      {
        kind: 'createCustomTalent',
        talent: {
          name: 'Clamped',
          role: 'actor',
          age: 30,
          actual: { warmth: 0, gravity: 0, physicality: 0 },
          workEthic: 50,
          fame: 60,
          skills: {
            acting: [150, 150, 150, 150, 150, 150],
            writing: [50, 50, 50, 50, 50, 50],
            directing: [50, 50, 50, 50, 50, 50],
            craft: [50, 50, 50, 50, 50, 50],
          },
        },
      },
    ])
    const created = s.talent.find((t) => t.name === 'Clamped')!
    for (const sk of Object.values(created.skills.acting)) {
      expect(sk.actual).toBeLessThanOrEqual(99)
      expect(sk.actual).toBeGreaterThanOrEqual(1)
    }
  })

  it('two creations get distinct ids (no duplicate talent id)', () => {
    let s = founded('c2-full-4')
    const mk = (name: string): CustomTalentInput => ({
      name,
      role: 'writer',
      age: 35,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
      workEthic: 60,
      fame: 30,
      skills: {
        acting: [40, 40, 40, 40, 40, 40],
        writing: [70, 70, 70, 70, 70, 70],
        directing: [40, 40, 40, 40, 40, 40],
        craft: [40, 40, 40, 40, 40, 40],
      },
    })
    s = applyActions(s, [{ kind: 'createCustomTalent', talent: mk('One') }])
    s = applyActions(s, [{ kind: 'createCustomTalent', talent: mk('Two') }])
    const ids = s.talent.filter((t) => t.name === 'One' || t.name === 'Two').map((t) => t.id)
    expect(ids.length).toBe(2)
    expect(new Set(ids).size).toBe(2)
  })
})
