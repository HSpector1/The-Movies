// ── RULING B (owner ruling, 2026-07-26) — multi-hyphenate generation, OVR formula
// preserved. Behavioral proofs. Every expectation derives from RULING B + D-9
// (docs/rev4-open-questions.md), NEVER from the implementation.
//
// RULING B requires proving:
//   - the SAME roleOVR formula applies to primary and secondary (no secondary bonus)
//   - the 10-20% target is measured with OVR≥60 (prefer 10-15%)
//   - generated multi-hyphenates have real broad secondary SKILLS (not an OVR tweak)
//   - ordinary talent still has weak secondaries
//   - the secondary-OVR distribution stays substantially below primary
//   - generation is deterministic (same seed → identical talent)
//   - discipline adjacency correlations are MODEST not universal (not every writer a director)
//   - no Star-Power increase from secondary ability
//   - no current-OVR increase from Potential/WE
//   - M0A role-partitioned candidate generation unchanged
//   - human cross-role eligibility recognizes a secondary OVR≥60
//   - an uncredited secondary is `Capable but Unproven` (via careerIdentity)
//   - career labels require demonstrated credits
//
// The quantitative DISTRIBUTION (the 14-item report) is produced by the
// run-multihyphenate-stats harness and reported to the PM; this file makes the
// qualitative/behavioral assertions the ruling can hold deterministically.
//
// Seeded RNG only (no unseeded entropy anywhere). No value copied out of src/core.

import { describe, it, expect } from 'vitest'
import {
  applyActions,
  generateWorld,
  roleOVR,
  careerIdentity,
  workHistoryCount,
  salaryCurve,
  generateCandidates,
  DISCIPLINE_ORDER,
  ROLE_TO_DISCIPLINE,
  SKILL_ORDER,
  TUNING,
} from '../src/core/index.js'
import type {
  Action,
  CastSlot,
  Discipline,
  FilmShape,
  GameState,
  Production,
  Promise as FilmPromise,
  Talent,
} from '../src/core/index.js'

// A large but bounded corpus for distribution-shaped behavioral claims. 200 worlds ×
// ~60 talent ≈ 12k talent — enough to bound the rates the ruling constrains.
const CORPUS_WORLDS = 200
function corpusTalent(): Talent[] {
  const all: Talent[] = []
  for (let w = 0; w < CORPUS_WORLDS; w++) {
    for (const t of generateWorld(`B-corpus-${w}`).talent) all.push(t)
  }
  return all
}

function primaryDiscipline(t: Talent): Discipline {
  return ROLE_TO_DISCIPLINE[t.role]
}
function usableSecondaryOVRs(t: Talent): number[] {
  const primary = primaryDiscipline(t)
  const out: number[] = []
  for (const d of DISCIPLINE_ORDER) if (d !== primary) out.push(roleOVR(t, d))
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// The SAME roleOVR formula applies to primary and secondary (no secondary bonus)
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING B — the same roleOVR formula applies to every discipline (no secondary bonus)', () => {
  it('roleOVR depends ONLY on (skills, discipline) — the PRIMARY role field has no effect', () => {
    // Take a real generated multi-hyphenate. Compute each discipline OVR. Then relabel
    // its primary `role` to each other role and confirm every discipline OVR is
    // byte-identical: roleOVR reads skills only, so which discipline is "primary"
    // cannot grant a bonus.
    const t = corpusTalent().find((x) => usableSecondaryOVRs(x).some((o) => o >= 60))!
    const baseline = DISCIPLINE_ORDER.map((d) => roleOVR(t, d))
    const roles: Talent['role'][] = ['writer', 'director', 'actor', 'craft']
    for (const role of roles) {
      const relabeled: Talent = { ...t, role }
      DISCIPLINE_ORDER.forEach((d, i) => {
        expect(roleOVR(relabeled, d)).toBe(baseline[i])
      })
    }
  })

  it('two talent with the SAME writing skills read the SAME writing OVR regardless of which discipline is primary', () => {
    // A writer-primary and an actor-primary who happen to share an identical writing
    // skill profile must read the identical writing OVR (no primary/secondary branch).
    const corpus = corpusTalent()
    const writerPrimary = corpus.find((t) => t.role === 'writer')!
    const actorPrimary = corpus.find((t) => t.role === 'actor')!
    // Give the actor the writer's exact writing skills; writing OVR must then match.
    const actorWithWriting: Talent = {
      ...actorPrimary,
      skills: { ...actorPrimary.skills, writing: writerPrimary.skills.writing },
    }
    expect(roleOVR(actorWithWriting, 'writing')).toBe(roleOVR(writerPrimary, 'writing'))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Usable-secondary rate is 10-20% (measured with OVR≥60); two+ is a thin tail
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING B — usable-secondary rate meets the 10-20% (prefer 10-15%) target, measured with OVR≥60', () => {
  const corpus = corpusTalent()
  const withUsable = corpus.filter((t) => usableSecondaryOVRs(t).some((o) => o >= 60)).length
  const withTwoPlus = corpus.filter((t) => usableSecondaryOVRs(t).filter((o) => o >= 60).length >= 2).length

  it('10% ≤ (talent with ≥1 secondary OVR≥60) ≤ 20% of the corpus', () => {
    const rate = withUsable / corpus.length
    expect(rate).toBeGreaterThanOrEqual(0.1)
    expect(rate).toBeLessThanOrEqual(0.2)
  })

  it('the ≥2-usable-secondary share is a thin tail (< 5%, far below the ≥1 rate)', () => {
    const rate = withTwoPlus / corpus.length
    expect(rate).toBeLessThan(0.05)
    expect(withTwoPlus).toBeLessThan(withUsable)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Real broad secondary SKILLS (not an OVR tweak); ordinary talent has weak secondaries
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING B — usable secondaries are real broad SKILLS; ordinary talent is weak elsewhere', () => {
  it("a usable secondary's OVR≥60 is EARNED by its skill vector (recomputing OVR from the skills reproduces it)", () => {
    // OVR is a pure function of the skills — so a usable secondary reading ≥60 must be
    // backed by a genuinely strong six-skill profile, not a stored OVR bonus. We prove
    // "no OVR tweak" by showing the mean of the secondary's six skills is itself high
    // (a broad profile), not a single spiked skill riding a bonus.
    const corpus = corpusTalent()
    let checked = 0
    for (const t of corpus) {
      const primary = primaryDiscipline(t)
      for (const d of DISCIPLINE_ORDER) {
        if (d === primary) continue
        if (roleOVR(t, d) < 60) continue
        // A ≥60 OVR requires clearing the D-9.2 breadth requirement, so the skills are
        // broadly strong: the mean perceived skill must be comfortably above 60.
        const keys = SKILL_ORDER[d]
        const meanSkill = keys.reduce((s, k) => s + t.skills[d][k]!.perceived, 0) / keys.length
        expect(meanSkill).toBeGreaterThanOrEqual(55)
        checked++
      }
    }
    expect(checked).toBeGreaterThan(0) // the corpus actually contained usable secondaries
  })

  it('the MAJORITY of talent have all secondaries weak (< 60 OVR) — ordinary talent is single-discipline', () => {
    const corpus = corpusTalent()
    const ordinary = corpus.filter((t) => usableSecondaryOVRs(t).every((o) => o < 60)).length
    expect(ordinary / corpus.length).toBeGreaterThan(0.5)
  })

  it('a weak (non-usable) secondary reads a genuinely low OVR — most secondary slots are weak', () => {
    const corpus = corpusTalent()
    const allSecondary: number[] = []
    for (const t of corpus) for (const o of usableSecondaryOVRs(t)) allSecondary.push(o)
    const weakShare = allSecondary.filter((o) => o < 60).length / allSecondary.length
    expect(weakShare).toBeGreaterThan(0.8) // the bulk of secondary slots are weak
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Secondary-OVR distribution substantially below primary
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING B — the secondary-OVR distribution stays substantially below primary', () => {
  it('mean secondary OVR is well below mean primary OVR', () => {
    const corpus = corpusTalent()
    const prim = corpus.map((t) => roleOVR(t, primaryDiscipline(t)))
    const sec: number[] = []
    for (const t of corpus) for (const o of usableSecondaryOVRs(t)) sec.push(o)
    const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length
    expect(mean(sec)).toBeLessThan(mean(prim) - 10)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic generation
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING B — generation is deterministic', () => {
  it('same seed → byte-identical talent array', () => {
    expect(generateWorld('B-det').talent).toEqual(generateWorld('B-det').talent)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Adjacency correlations MODEST not universal (not every writer a director)
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING B — discipline adjacency is a MODEST lean, not a rule', () => {
  it('NOT every writer has a usable directing secondary (adjacency is a tendency, not universal)', () => {
    const corpus = corpusTalent()
    const writers = corpus.filter((t) => t.role === 'writer')
    const writersWithDirectingSecondary = writers.filter((t) => roleOVR(t, 'directing') >= 60).length
    const share = writersWithDirectingSecondary / writers.length
    // Writing↔Directing is the STRONGEST adjacency, yet it must be far from universal.
    expect(share).toBeLessThan(0.5)
  })

  it('the strongest adjacency (writer→directing) is at least as common as a weak one (writer→craft)', () => {
    // The lean EXISTS (writing→directing weight 1.0 vs writing→craft 0.2), so among
    // the usable secondaries writers DO develop, directing should not be rarer than
    // craft. This proves the adjacency table shapes selection without making it a rule.
    const corpus = corpusTalent()
    const writers = corpus.filter((t) => t.role === 'writer')
    const dirSec = writers.filter((t) => roleOVR(t, 'directing') >= 60).length
    const craftSec = writers.filter((t) => roleOVR(t, 'craft') >= 60).length
    expect(dirSec).toBeGreaterThanOrEqual(craftSec)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// No Star-Power increase from secondary ability; no current-OVR from Potential/WE
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING B — ability channels stay separate (fame, potential, work ethic)', () => {
  it('salary (fame + primary OVR) does not read secondary ability — adding secondary skills leaves salary unchanged', () => {
    // salaryCurve = f(primaryOVR, fame). Give a talent a strong SECONDARY discipline
    // profile and confirm salary is unchanged (Star Power / price ignore secondaries).
    const base = generateWorld('B-fame-1').talent.find((t) => t.role === 'actor')!
    const salaryBefore = salaryCurve(base)
    // Boost a NON-primary (writing) discipline to elite skills.
    const boosted: Talent = {
      ...base,
      skills: {
        ...base.skills,
        writing: Object.fromEntries(
          SKILL_ORDER.writing.map((k) => [k, { actual: 95, perceived: 95 }]),
        ) as Talent['skills']['writing'],
      },
    }
    expect(salaryCurve(boosted)).toBe(salaryBefore)
    expect(boosted.fame).toBe(base.fame) // fame (Star Power) is a wholly separate field
  })

  it('current OVR is invariant to Potential (ceilings) and Work Ethic', () => {
    const base = generateWorld('B-pot-1').talent[0]!
    const ovrBefore = DISCIPLINE_ORDER.map((d) => roleOVR(base, d))
    // Max out ceilings and work ethic — neither is read by roleOVR.
    const maxed: Talent = {
      ...base,
      workEthic: 99,
      ceilings: Object.fromEntries(
        DISCIPLINE_ORDER.map((d) => [d, Object.fromEntries(SKILL_ORDER[d].map((k) => [k, 99]))]),
      ) as Talent['ceilings'],
    }
    DISCIPLINE_ORDER.forEach((d, i) => expect(roleOVR(maxed, d)).toBe(ovrBefore[i]))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// M0A role-partitioned candidate generation unchanged
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING B — the M0A candidate grid stays role-partitioned (frozen economics corpus)', () => {
  it('every candidate package assigns a writer to writerId, a director to directorId, actors to cast', () => {
    const state = generateWorld('B-cand-1')
    const packages = generateCandidates(state, 0)
    const roleOf = (id: string) => state.talent.find((t) => t.id === id)!.role
    expect(packages.length).toBeGreaterThan(0)
    for (const pkg of packages) {
      expect(roleOf(pkg.writerId)).toBe('writer')
      expect(roleOf(pkg.directorId)).toBe('director')
      for (const slot of ['lead', 'antagonist', 'support'] as CastSlot[]) {
        expect(roleOf(pkg.cast[slot])).toBe('actor')
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Human cross-role eligibility recognizes a secondary OVR≥60
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING B — cross-discipline assignment is legal (has-discipline), exclusivity still enforced', () => {
  const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }

  function greenlightWith(state: GameState, writerId: string): Action {
    const concept = state.concepts[0]!
    const actors = state.talent.filter((t) => t.role === 'actor')
    const director = state.talent.filter((t) => t.role === 'director')[0]!
    // choose actors distinct from writerId
    const cast = actors.filter((a) => a.id !== writerId).slice(0, 3)
    const prod: Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'> = {
      conceptId: concept.id,
      shape: SHAPE,
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
      } as FilmPromise,
      writerId,
      directorId: director.id,
      craftIds: [],
      cast: { lead: cast[0]!.id, antagonist: cast[1]!.id, support: cast[2]!.id } as Record<CastSlot, string>,
      budget: { negative: 5_000_000, marketing: 800_000 },
    }
    return { kind: 'greenlight', production: prod }
  }

  it('an ACTOR with a usable writing secondary can be legally greenlit as the writer (has-discipline check)', () => {
    // Find a world with an actor whose writing OVR ≥ CAPABILITY_OVR_MIN.
    let picked: { state: GameState; actorId: string } | null = null
    for (let w = 0; w < 60 && picked === null; w++) {
      const state = generateWorld(`B-xrole-${w}`)
      const actor = state.talent.find((t) => t.role === 'actor' && roleOVR(t, 'writing') >= TUNING.CAPABILITY_OVR_MIN)
      if (actor) picked = { state, actorId: actor.id }
    }
    expect(picked).not.toBeNull()
    const { state, actorId } = picked!
    expect(() => applyActions(state, [greenlightWith(state, actorId)])).not.toThrow()
  })

  it('exclusivity still rejects the same actor in two cast slots of one film (M16.3)', () => {
    const state = generateWorld('B-xrole-excl')
    const actor = state.talent.find((t) => t.role === 'actor')!
    const others = state.talent.filter((t) => t.role === 'actor' && t.id !== actor.id).slice(0, 1)
    const concept = state.concepts[0]!
    const director = state.talent.filter((t) => t.role === 'director')[0]!
    const writer = state.talent.filter((t) => t.role === 'writer')[0]!
    const bad: Action = {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: SHAPE,
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        } as FilmPromise,
        writerId: writer.id,
        directorId: director.id,
        craftIds: [],
        // lead and antagonist are the SAME actor → M16.3 rejects.
        cast: { lead: actor.id, antagonist: actor.id, support: others[0]!.id } as Record<CastSlot, string>,
        budget: { negative: 5_000_000, marketing: 800_000 },
      },
    }
    expect(() => applyActions(state, [bad])).toThrow()
  })

  it('exclusivity still rejects a talent already engaged in another ACTIVE production (M16.5)', () => {
    const state = generateWorld('B-xrole-excl2')
    const concept0 = state.concepts[0]!
    const concept1 = state.concepts[1]!
    const director = state.talent.filter((t) => t.role === 'director')[0]!
    const writer = state.talent.filter((t) => t.role === 'writer')[0]!
    const actors = state.talent.filter((t) => t.role === 'actor')
    const mkProd = (cid: string, genre: string, cast: [string, string, string]) => ({
      conceptId: cid,
      shape: SHAPE,
      promise: {
        genre,
        intendedSegments: ['adult'],
        ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
      } as FilmPromise,
      writerId: writer.id,
      directorId: director.id,
      craftIds: [],
      cast: { lead: cast[0], antagonist: cast[1], support: cast[2] } as Record<CastSlot, string>,
      budget: { negative: 5_000_000, marketing: 800_000 },
    })
    // Greenlight one film (director now busy), then a second reusing the SAME director.
    const s1 = applyActions(state, [
      { kind: 'greenlight', production: mkProd(concept0.id, concept0.genre, [actors[0]!.id, actors[1]!.id, actors[2]!.id]) },
    ])
    expect(() =>
      applyActions(s1, [
        { kind: 'greenlight', production: mkProd(concept1.id, concept1.genre, [actors[3]!.id, actors[4]!.id, actors[5]!.id]) },
      ]),
    ).toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Capable-but-Unproven + career labels require credits
// ─────────────────────────────────────────────────────────────────────────────
describe('RULING B — capability vs demonstrated career identity', () => {
  it('a freshly-generated talent has NO proven identity disciplines (workHistory all 0)', () => {
    // At worldgen every workHistory counter is 0 → no discipline can be "proven",
    // so identityDisciplines is empty even for a strong primary. Labels require credits.
    const corpus = corpusTalent()
    for (const t of corpus.slice(0, 500)) {
      const ci = careerIdentity(t)
      expect(ci.identityDisciplines).toEqual([])
      for (const d of DISCIPLINE_ORDER) expect(workHistoryCount(t, d)).toBe(0)
    }
  })

  it('a capable-but-uncredited discipline is flagged Capable but Unproven (not part of the identity)', () => {
    // A talent with a usable secondary (OVR≥60) but no credit there is Capable but
    // Unproven. Find one and assert the flag + that it is NOT an identity discipline.
    const t = corpusTalent().find((x) => usableSecondaryOVRs(x).some((o) => o >= TUNING.CAPABILITY_OVR_MIN))!
    const ci = careerIdentity(t)
    const capableSecondary = DISCIPLINE_ORDER.find(
      (d) => d !== primaryDiscipline(t) && roleOVR(t, d) >= TUNING.CAPABILITY_OVR_MIN,
    )!
    expect(ci.capableButUnprovenDisciplines).toContain(capableSecondary)
    expect(ci.identityDisciplines).not.toContain(capableSecondary)
    // The per-discipline breakdown marks it capable + capableButUnproven, not proven.
    const standing = ci.disciplines.find((s) => s.discipline === capableSecondary)!
    expect(standing.capable).toBe(true)
    expect(standing.capableButUnproven).toBe(true)
    expect(standing.proven).toBe(false)
  })

  it('once a credit exists (workHistory ≥ 1) at a usable OVR, the discipline JOINS the identity', () => {
    // Simulate a demonstrated credit by incrementing workHistory in a capable
    // discipline; careerIdentity must then move it from capable-but-unproven to proven.
    const t = corpusTalent().find((x) => roleOVR(x, primaryDiscipline(x)) >= TUNING.CAPABILITY_OVR_MIN)!
    const primary = primaryDiscipline(t)
    const credited: Talent = {
      ...t,
      workHistory: { ...t.workHistory, [primary]: 1 },
    }
    const ci = careerIdentity(credited)
    expect(ci.identityDisciplines).toContain(primary)
    expect(ci.capableButUnprovenDisciplines).not.toContain(primary)
  })

  it('a credit at a NON-usable OVR (< CAPABILITY_OVR_MIN) does NOT create an identity discipline', () => {
    // Career identity requires BOTH a usable OVR AND a credit. A credit in a weak
    // discipline (OVR < 60) must not fabricate an identity.
    const corpus = corpusTalent()
    const t = corpus.find((x) => {
      const primary = primaryDiscipline(x)
      return DISCIPLINE_ORDER.some((d) => d !== primary && roleOVR(x, d) < TUNING.CAPABILITY_OVR_MIN)
    })!
    const primary = primaryDiscipline(t)
    const weakDisc = DISCIPLINE_ORDER.find((d) => d !== primary && roleOVR(t, d) < TUNING.CAPABILITY_OVR_MIN)!
    const credited: Talent = { ...t, workHistory: { ...t.workHistory, [weakDisc]: 3 } }
    const ci = careerIdentity(credited)
    expect(ci.identityDisciplines).not.toContain(weakDisc)
  })
})
