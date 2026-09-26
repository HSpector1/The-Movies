// 1018-A G2: one genuine2600→3162 chain, no authored due/age/receipt values.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it } from 'vitest'
import { ageAt } from '../src/core/aging.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { DEFERRED_ACTOR, person } from './helpers/p14c3-fixtures.js'
import { acceptedEvidence, deferredEvidence, evidenceTickCount, subjectEvaluations } from './helpers/p14c3-genuine-evidence-fixtures.js'

const annual = [2601, 2653, 2705, 2757, 2809, 2861, 2913, 2965, 3017, 3069, 3121]
const allWeeks = [...annual, 3161]
let observedFinalityWeek: number | null = null
afterAll(() => console.info(JSON.stringify({ phase: '1020-genuine-route-observation', group: 'G2',
  tickCalls: evidenceTickCount('deferred'), finalityWeek: observedFinalityWeek })))

describe('C.3 genuine fractional-provenance deferred chain', () => {
  it('D1 records eleven exact annual deferrals and no intervening weekly retries', () => {
    const f = deferredEvidence(), original = retirementRecordFor(f.origin, DEFERRED_ACTOR, 'actor')
    observedFinalityWeek = f.atAge.careerLifecycle.industryRetirements.find(row => row.personId === DEFERRED_ACTOR)?.week ?? null
    expect(f.origin.market.tick).toBe(2600)
    expect(f.origin.talent).toHaveLength(182)
    expect(original).toMatchObject({ profession: 'actor', status: 'retired', retiredWeek: 2433 })
    expect(subjectEvaluations(f.origin, DEFERRED_ACTOR)).toEqual([])
    const rows = subjectEvaluations(f.beforeAge, DEFERRED_ACTOR)
    expect(rows.map(row => row.week)).toEqual(annual)
    expect(rows.length).toBeGreaterThan(5)
    for (const row of rows) {
      expect(row).toMatchObject({ personId: DEFERRED_ACTOR, rulesVersion: 1,
        source: { personId: DEFERRED_ACTOR, profession: 'actor' }, outcome: 'deferred', selected: null, reason: 'noEligibleTarget' })
      expect(row.inputs).toMatchObject({ actingFirstTakes: 0, leadFirstTakes: 0, actingWitnesses: [] })
      expect(row.inputsDigest).toMatch(/^[0-9a-f]{16}$/)
    }
    const between = f.observations.filter(row => row.week <= 3160)
    expect(between).toHaveLength(560)
    for (const observation of between) {
      const reached = annual.filter(week => week <= observation.week), last = reached.at(-1)!
      expect(observation, `actual weekly observation${observation.week}`).toMatchObject({ evaluations: reached.length,
        lastWeek: last, due: [Math.min(last + 52, 3161)], finalities: 0, changes: 0,
        free: false, takes: 0, busy: false, contracted: false, employed: false })
    }
    expect(retirementRecordFor(f.beforeAge, DEFERRED_ACTOR, 'actor')).toEqual(original)
    expect(evidenceTickCount('deferred')).toBe(562)
  })

  it('D2 clips the annual due at the actual fractional75 crossing and writes one linked finality', () => {
    const f = deferredEvidence()
    const provenance = f.origin.talentProvenance.rows.find(row => row.personId === DEFERRED_ACTOR)
    assert.ok(provenance?.kind === 'authored_exact_week')
    expect(provenance).toMatchObject({ ageAtEntry: 23.21459235740464, entryWeek: 468 })
    const crossing = Math.ceil(provenance.entryWeek + (75 - provenance.ageAtEntry) * 52)
    expect(crossing).toBe(3161)
    expect(Math.floor(provenance.ageAtEntry + (3160 - provenance.entryWeek) / 52)).toBe(74)
    expect(Math.floor(provenance.ageAtEntry + (3161 - provenance.entryWeek) / 52)).toBe(75)
    expect(ageAt(provenance, 3160)).toBe(74)
    expect(ageAt(provenance, 3161)).toBe(75)
    expect(person(f.beforeAge, DEFERRED_ACTOR).age).toBe(74)
    expect(person(f.atAge, DEFERRED_ACTOR).age).toBe(75)
    expect(f.observations.find(row => row.week === 3121)?.due).toEqual([3161])
    expect(3121 + 52).toBe(3173)
    const rows = subjectEvaluations(f.atAge, DEFERRED_ACTOR)
    expect(rows.map(row => row.week)).toEqual(allWeeks)
    expect(rows.slice(0, 11)).toEqual(subjectEvaluations(f.beforeAge, DEFERRED_ACTOR))
    const last = rows[11]!
    expect(last).toMatchObject({ week: crossing, outcome: 'ageBoundary', reason: 'waitingAgeReached', selected: null,
      source: { personId: DEFERRED_ACTOR, profession: 'actor' }, inputs: { age: 75, actingFirstTakes: 0 } })
    expect(f.atAge.careerLifecycle.industryRetirements.filter(row => row.personId === DEFERRED_ACTOR))
      .toEqual([{ personId: DEFERRED_ACTOR, week: 3161, profession: 'actor',
        source: { personId: DEFERRED_ACTOR, profession: 'actor' }, cause: 'ageBoundary', evaluationId: last.id }])
    expect(f.atAge.careerLifecycle.transitionDue.filter(row => row.personId === DEFERRED_ACTOR)).toEqual([])
    expect(f.atAge.careerLifecycle.professionChanges.filter(row => row.personId === DEFERRED_ACTOR)).toEqual([])
    expect(f.atAge.freeAgents).not.toContain(DEFERRED_ACTOR)
    acceptedEvidence(f.beforeAge)
    acceptedEvidence(f.atAge)
  })

  it('D3 reopens the actual final save and advances once without replacing old questions or reopening due work', () => {
    const f = deferredEvidence(), rows = subjectEvaluations(f.atAge, DEFERRED_ACTOR)
    const finalities = f.atAge.careerLifecycle.industryRetirements.filter(row => row.personId === DEFERRED_ACTOR)
    expect(rows).toHaveLength(12)
    expect(finalities).toHaveLength(1)
    expect(f.loaded.market.tick).toBe(3161)
    expect(f.after.market.tick).toBe(3162)
    for (const state of [f.loaded, f.after]) {
      acceptedEvidence(state)
      expect(subjectEvaluations(state, DEFERRED_ACTOR)).toEqual(rows)
      expect(retirementRecordFor(state, DEFERRED_ACTOR, 'actor')).toEqual(retirementRecordFor(f.origin, DEFERRED_ACTOR, 'actor'))
      expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === DEFERRED_ACTOR)).toEqual(finalities)
      expect(state.careerLifecycle.professionChanges.filter(row => row.personId === DEFERRED_ACTOR)).toEqual([])
      expect(state.careerLifecycle.transitionDue.filter(row => row.personId === DEFERRED_ACTOR)).toEqual([])
      expect(state.freeAgents).not.toContain(DEFERRED_ACTOR)
      expect(person(state, DEFERRED_ACTOR).role).toBe('actor')
      expect(state.talentProvenance.rows.find(row => row.personId === DEFERRED_ACTOR))
        .toEqual(f.origin.talentProvenance.rows.find(row => row.personId === DEFERRED_ACTOR))
    }
    expect(f.observations).toHaveLength(562)
    expect(evidenceTickCount('deferred')).toBe(562)
  })
})
