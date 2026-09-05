// P10A W0 — the player-safe people projection (projection 18).
//
// R1 privacy: the serialized people section carries none of the hidden roots
//    (actual skills, ceilings, devRate, actual genre experience, the seed).
// R2 fresh clones: mutating a served projection never reaches GameState or the
//    next projection.
// R3 the five employment states are published as they are, never invented.
// R4 same-name people stay distinct by talentId; the wire says the name is shared.
// R5 an ambiguous assignment join fails closed (kind 'ambiguous', BLOCKING attention).
// R6 provenance: a legacy film without captured participants is `notRecorded`;
//    a credit without a frozen career event is `partial`; frozen rows are verbatim.
// R7 estimates and OVRs carry their wording / discipline; Star Power is fame.
// R8 the roster is every known person with population classes and one attention
//    reason; grouped attention lists each person at most once.
// R9 the session serves the section under the projection-18 schema id and the
//    runtime-checkpoint acceptance list still admits the projection-17 identity.
// R10 a large roster (≥ 60 known people) projects deterministically.
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  makeSaveV16,
  migrateToV18,
  tick,
} from '../src/core/index.js'
import type { CreativeRole, GameState } from '../src/core/index.js'
import { peopleProjection, POTENTIAL_NOTICE, STAR_POWER_DEFINITION, WORK_ETHIC_EFFECT } from '../bridge/people.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { projectStudioProjectionBundle } from '../bridge/schema/runtime.ts'
import { snapshotBuildContextFor } from '../bridge/snapshot-build-context.ts'
import { SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'

function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  for (const t of [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function serialized(state: GameState): string {
  return JSON.stringify(peopleProjection(state))
}

const HIDDEN_KEYS = ['"actual"', '"ceilings"', '"devRate"', '"seed"', '"skills"', '"rngState"'] as const

describe('P10A W0 — people projection', () => {
  it('R1 privacy: nothing hidden crosses; every profile is a stable Talent record', () => {
    const state = foundStudio('p10-w0-privacy')
    const text = serialized(state)
    for (const key of HIDDEN_KEYS) expect(text, key).not.toContain(key)
    const projection = peopleProjection(state)
    expect(projection.profiles.length).toBe(state.talent.length)
    for (const p of projection.profiles) {
      expect(state.talent.some((t) => t.id === p.talentId)).toBe(true)
      expect(['actor', 'director', 'writer', 'craft']).toContain(p.profession)
      expect(p.disciplines).toHaveLength(4)
      for (const d of p.disciplines) {
        expect(d.isEstimate).toBe(true)
        expect(d.potentialLow).toBeLessThanOrEqual(d.potentialHigh)
        expect(d.potentialHigh).toBeGreaterThanOrEqual(d.ovr) // the estimate is clamped at or above the current OVR
      }
      expect(p.potentialNotice).toBe(POTENTIAL_NOTICE)
      expect(p.starPowerDefinition).toBe(STAR_POWER_DEFINITION)
      expect(p.workEthicEffect).toBe(WORK_ETHIC_EFFECT)
    }
    // No profile for anything but Talent: the presence people are a subset of the profiles.
    const ids = new Set(projection.profiles.map((p) => p.talentId))
    for (const row of projection.roster.rows) expect(ids.has(row.talentId)).toBe(true)
  })

  it('R2 fresh clones: mutating a served projection changes neither GameState nor the next call', () => {
    const state = foundStudio('p10-w0-clone')
    const before = JSON.stringify(state)
    const served = peopleProjection(state)
    served.profiles[0]!.name = 'MUTATED'
    served.profiles[0]!.career.rows.push({} as never)
    served.roster.rows.length = 0
    served.attention.cohorts.push({ key: 'x', label: 'x', tier: 'info', talentIds: [] })
    expect(JSON.stringify(state)).toBe(before)
    const again = peopleProjection(state)
    expect(again.profiles[0]!.name).not.toBe('MUTATED')
    expect(again.roster.rows.length).toBe(again.profiles.length)
    expect(again.attention.cohorts.some((c) => c.key === 'x')).toBe(false)
  })

  it('R3 employment states are published as they are — contracted people are employed, the rest are freelancers or known', () => {
    const state = foundStudio('p10-w0-states')
    const projection = peopleProjection(state)
    const contracted = new Set(state.contracts.map((c) => c.talentId))
    for (const p of projection.profiles) {
      if (contracted.has(p.talentId)) {
        expect(p.employment.status).toBe('contracted')
        expect(p.employment.contract).not.toBeNull()
        expect(p.employment.contract!.termWeeks).toBe(156)
        expect(p.employment.contract!.renewalLine).toMatch(/^(Not open|Opens in \d+ weeks|Renewal open)$/)
        expect(p.employment.contract!.guaranteedRemaining).toBeGreaterThan(0)
      } else {
        expect(['engagedFreelancer', 'availableFreelancer', 'freeAgent', 'unavailable']).toContain(p.employment.status)
        expect(p.employment.contract).toBeNull()
      }
      expect(p.employment.statusLabel.length).toBeGreaterThan(0)
    }
    const employed = projection.roster.rows.filter((r) => r.population === 'employed')
    expect(employed.length).toBe(contracted.size)
    expect(projection.roster.counts.employed).toBe(contracted.size)
    expect(projection.roster.counts.employed + projection.roster.counts.freelancer + projection.roster.counts.known).toBe(
      projection.roster.rows.length,
    )
  })

  it('R4 same-name people stay distinct by talentId and the wire says the name is shared', () => {
    const base = foundStudio('p10-w0-names')
    const [a, b] = base.talent
    const state: GameState = {
      ...base,
      talent: base.talent.map((t) => (t.id === b!.id ? { ...t, name: a!.name } : t)),
    }
    const projection = peopleProjection(state)
    const shared = projection.profiles.filter((p) => p.name === a!.name)
    expect(shared.map((p) => p.talentId).sort()).toEqual([a!.id, b!.id].sort())
    for (const p of shared) expect(p.nameShared).toBe(true)
    expect(projection.profiles.filter((p) => p.nameShared).length).toBe(2)
    const rows = projection.roster.rows.filter((r) => r.name === a!.name)
    expect(new Set(rows.map((r) => r.talentId)).size).toBe(2)
  })

  it('R5 an ambiguous assignment join fails closed: kind ambiguous, BLOCKING attention, no guess', () => {
    const base = foundStudio('p10-w0-ambiguous')
    // Two active productions claiming the same director is the hostile shape the
    // assignment gate refuses to resolve (talentAssignmentContext → ambiguous).
    const director = base.talent.find((t) => t.role === 'director' && base.contracts.some((c) => c.talentId === t.id))!
    const fake = (id: string) => ({
      id,
      conceptId: base.concepts[0]!.id,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: base.concepts[0]!.baselineStrength as never,
      writerId: director.id,
      directorId: director.id,
      craftIds: [] as string[],
      cast: { lead: director.id, antagonist: director.id, support: director.id },
      remainingTicks: 5,
      budget: 1,
    })
    const hostile = {
      ...base,
      studio: { ...base.studio, activeProductions: [fake('prod-a'), fake('prod-b')] as never[] },
    } as GameState
    const projection = peopleProjection(hostile)
    const profile = projection.profiles.find((p) => p.talentId === director.id)!
    expect(profile.work.kind).toBe('ambiguous')
    expect(profile.work.assignmentId).toBeNull()
    expect(profile.work.reason).toContain('could not be determined')
    expect(profile.attention.tier).toBe('blocking')
    const row = projection.roster.rows.find((r) => r.talentId === director.id)!
    expect(row.currentWork).toBe('Unknown')
    expect(row.availability).toBe('Unknown')
    const cohort = projection.attention.cohorts.find((c) => c.key === 'work-ambiguous')!
    expect(cohort.tier).toBe('blocking')
    expect(cohort.talentIds).toContain(director.id)
  })

  it('R6 provenance: legacy films without participants say Not recorded; frozen rows are verbatim; a credit without an event is partial', () => {
    const base = foundStudio('p10-w0-provenance')
    const someone = base.talent.find((t) => base.contracts.some((c) => c.talentId === t.id))!
    // A legacy release with NO captured participants (M0A shape) and no career event.
    const legacyFilm = {
      productionId: 'legacy-1',
      releaseTick: 3,
      delivered: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 },
      cohesion: 0.5,
      craft: 0.5,
      criticMean: 50,
      conceptId: base.concepts[0]!.id,
    }
    const legacy = { ...base, studio: { ...base.studio, releasedFilms: [legacyFilm as never] } } as GameState
    const p1 = peopleProjection(legacy).profiles.find((p) => p.talentId === someone.id)!
    expect(p1.career.provenance).toBe('notRecorded')
    expect(p1.career.uncapturedFilms).toBe(1)
    expect(p1.career.provenanceNotice).toContain('Not recorded')
    expect(p1.career.rows).toHaveLength(0)
    // A captured credit with NO frozen career event → partial attribution.
    const participant = (id: string, name: string, role: string, discipline: string) => ({
      talentId: id, name, role, discipline, greenlightOVR: 40, greenlightFit: 0.5,
      greenlightEP: { low: 30, high: 60, expected: 45 }, freelancer: false,
    })
    const other = base.talent.find((t) => t.id !== someone.id)!
    const capturedFilm = {
      ...legacyFilm,
      productionId: 'captured-1',
      participants: {
        writer: participant(someone.id, someone.name, 'writer', 'writing'),
        director: participant(other.id, other.name, 'director', 'directing'),
        cast: {
          lead: participant(other.id, other.name, 'lead', 'acting'),
          antagonist: participant(other.id, other.name, 'antagonist', 'acting'),
          support: participant(other.id, other.name, 'support', 'acting'),
        },
        craft: [],
      },
    }
    const partial = { ...base, studio: { ...base.studio, releasedFilms: [capturedFilm as never] } } as GameState
    const p2 = peopleProjection(partial).profiles.find((p) => p.talentId === someone.id)!
    expect(p2.career.provenance).toBe('partial')
    expect(p2.career.creditsWithoutEvents).toBe(1)
    expect(p2.career.provenanceNotice).toContain('Partial attribution')
    // A frozen career event rides verbatim and links the result by exact film id.
    const event = {
      eventId: `captured-1:${someone.id}`,
      talentId: someone.id,
      filmId: 'captured-1',
      filmTitle: 'The Captured Picture',
      releaseWeek: 3,
      genre: 'drama',
      role: 'writer',
      billingWeight: 0.6,
      discipline: 'writing',
      ovrBefore: 40,
      ovrAfter: 42,
      skillsBefore: {},
      skillsAfter: {},
      skillDeltas: {},
      genreExpBefore: 10,
      genreExpAfter: 14,
      workHistoryBefore: 0,
      workHistoryAfter: 1,
      starPowerBefore: 20,
      starPowerAfter: 23,
      starPowerDelta: 3,
      realizedOpening: 1,
      realizedTotal: 2,
      audienceScore: 55,
      criticScore: 50,
      forecastComparator: 1,
      reasonCodes: ['credited-work'],
    }
    const recorded = { ...partial, careerEvents: [event as never] } as GameState
    const p3 = peopleProjection(recorded).profiles.find((p) => p.talentId === someone.id)!
    expect(p3.career.provenance).toBe('recorded')
    expect(p3.career.rows).toHaveLength(1)
    const row = p3.career.rows[0]!
    expect(row).toMatchObject({
      eventId: event.eventId, filmId: 'captured-1', filmTitle: 'The Captured Picture', releaseWeek: 3,
      roleLabel: 'Writer', discipline: 'writing', ovrBefore: 40, ovrAfter: 42, starPowerDelta: 3, resultAvailable: true,
    })
    expect(row.reasonCodes).toEqual(['credited-work'])
    // No prose classification ever rides with a row.
    expect(JSON.stringify(row)).not.toMatch(/breakout|decline|legend|typecast/i)
  })

  it('R7 OVR carries its discipline, the estimate its wording, Star Power is fame; the roster row shows the same discipline it sorts by', () => {
    const state = foundStudio('p10-w0-ovr')
    const projection = peopleProjection(state)
    for (const p of projection.profiles) {
      const talent = state.talent.find((t) => t.id === p.talentId)!
      expect(p.starPower).toBe(talent.fame)
      expect(p.workEthic).toBe(talent.workEthic)
      const primary = p.disciplines.find((d) => d.isPrimary)!
      expect(primary.discipline).toBe(p.primaryDiscipline)
      const row = projection.roster.rows.find((r) => r.talentId === p.talentId)!
      expect(row.ovr).toBe(primary.ovr)
      expect(row.ovrDiscipline).toBe(primary.discipline)
      expect(row.ovrByDiscipline).toHaveLength(4)
      expect(row.specialtyLine).toMatch(/^(No clear specialty|Top specialty: .+)$/)
    }
  })

  it('R8 grouped attention lists each person at most once, by the highest tier; contract horizons come from the contract alone', () => {
    let state = foundStudio('p10-w0-attention')
    // Advance to the final 12 weeks of the 156-week founding contracts: the renewal window.
    for (let i = 0; i < 150; i++) state = tick(state)
    const projection = peopleProjection(state)
    const seen = new Set<string>()
    for (const cohort of projection.attention.cohorts) {
      for (const id of cohort.talentIds) {
        expect(seen.has(id), `${id} listed twice`).toBe(false)
        seen.add(id)
      }
    }
    const renewal = projection.attention.cohorts.find((c) => c.key === 'renewal-open')
    const contracted = projection.profiles.filter((p) => p.employment.status === 'contracted')
    if (contracted.length > 0) {
      expect(renewal, 'renewal window open for the founding cohort').toBeDefined()
      expect(renewal!.tier).toBe('decision')
      for (const p of contracted) {
        expect(p.employment.contract!.renewalOpen).toBe(true)
        expect(p.attention.tier).toBe('decision')
        expect(p.attention.reason).toContain('Renewal window open')
      }
    }
    // Nothing invented: no morale/relationship/training cohort can exist.
    for (const cohort of projection.attention.cohorts)
      expect(cohort.key).toMatch(/^(work-ambiguous|presence-blocked|renewal-open|contract-ends-26|contract-ends-52)$/)
  })

  it('R9 the served section is projection 18 and the projection-17 identity stays accepted', () => {
    const state = foundStudio('p10-w0-schema')
    expect(PROJECTION_VERSION).toBe(18)
    expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-18')
    const context = snapshotBuildContextFor(state)
    const bundle = projectStudioProjectionBundle({ ...context.lotSnapshot(), development: context.development(), casting: context.casting(), release: context.release(), history: context.history(), talent: context.people() })
    expect(bundle.talent.talent.profiles.length).toBe(state.talent.length)
    expect(bundle.talent.talent.roster.rows.length).toBe(state.talent.length)
    expect(bundle.talent.talent.attention.currentWeek).toBe(state.market.tick)
    const text = JSON.stringify(bundle.talent)
    for (const key of HIDDEN_KEYS) expect(text, key).not.toContain(key)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get('sha256:18de162d1a9da3034378f71cec3d3b3f109ea91df8c1a8d40469924108b36e78')).toBe('projection-v17')
  })

  it('R10 a large roster projects deterministically and survives the V16 → V18 strip-and-migrate', () => {
    const state = foundStudio('p10-w0-large')
    expect(state.talent.length).toBeGreaterThanOrEqual(60)
    const a = createHash('sha256').update(serialized(state)).digest('hex')
    const b = createHash('sha256').update(serialized(state)).digest('hex')
    expect(a).toBe(b)
    const migrated = migrateToV18(makeSaveV16(state as never)).state
    const after = peopleProjection(migrated)
    expect(after.profiles.length).toBe(state.talent.length)
    for (const p of after.profiles) expect(['recorded', 'partial', 'notRecorded', 'none']).toContain(p.career.provenance)
  })
})
