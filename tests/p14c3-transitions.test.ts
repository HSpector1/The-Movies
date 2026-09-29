// 963/967 independent Stage A. Genuine history drives state-level assertions;
// explicitly synthetic public snapshots exercise the pure comparison contract.
import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import * as core from '../src/core/index.js'
import { ageAt, nextBirthdayWeek } from '../src/core/aging.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42ToV41, exportSave, importSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { CreativeRole, GameState } from '../src/core/types.js'
import { CONTINUOUS208, DEFERRED_ACTOR, FOCUS, PRE207, RUNTIME208, SCIENTIST,
  api, bytes, chosen, clone, deferredBoundary, envelope38, expectFocusChosen,
  expectedFocusInputs, migrated, person, root38, scientistBoundary,
  syntheticInputs } from './helpers/p14c3-fixtures.js'
import type { Choice, Inputs, Root38, TargetInput } from './helpers/p14c3-fixtures.js'

const chosenDirector: Choice = { outcome: 'chosen', selected: 'director', reason: 'onlyEligibleTarget' }
const chosenWriter: Choice = { outcome: 'chosen', selected: 'writer', reason: 'onlyEligibleTarget' }
const deferred: Choice = { outcome: 'deferred', selected: null, reason: 'noEligibleTarget' }
const equal: Choice = { outcome: 'declinedAll', selected: null, reason: 'equalPublicTuples' }
const ageBoundary: Choice = { outcome: 'ageBoundary', selected: null, reason: 'waitingAgeReached' }
const stronger = (selected: 'director' | 'writer'): Choice => ({ outcome: 'chosen', selected, reason: 'strongerPublicTuple' })
type ComparisonCase = { name: string; director?: Partial<TargetInput>; writer?: Partial<TargetInput>;
  base?: Partial<Omit<Inputs, 'targets'>>; expected: Choice }
const comparisons: ComparisonCase[] = [
  { name: 'capability59 on both is insufficient', director: { capability: 59 }, writer: { capability: 59 }, expected: deferred },
  { name: 'capability60 first makes director eligible', director: { capability: 60 }, expected: chosenDirector },
  { name: 'capability60 first makes writer eligible', director: { capability: 59 }, writer: { capability: 60 }, expected: chosenWriter },
  { name: 'two actual acting takes are insufficient', base: { actingFirstTakes: 2 }, expected: deferred },
  { name: 'three actual acting takes suffice with qualifying context', expected: chosenDirector },
  { name: 'one shared picture does not prove repeated context', director: { contextCount: 1 }, expected: deferred },
  { name: 'two shared pictures prove repeated context', director: { contextCount: 2 }, expected: chosenDirector },
  { name: 'a proven target needs no repeat context', director: { workHistory: 1, contextCount: 0 }, expected: chosenDirector },
  { name: 'capable but unproven without context remains deferred', director: { workHistory: 0, contextCount: 0 }, expected: deferred },
  { name: 'exact eligible tuples decline both without a target-order tie break', writer: {}, expected: equal },
  { name: 'proven director beats a higher-tier unproven writer', director: { capability: 60, workHistory: 1, contextCount: 0 }, writer: { capability: 95 }, expected: stronger('director') },
  { name: 'proven writer beats a higher-tier unproven director', director: { capability: 95 }, writer: { capability: 60, workHistory: 1, contextCount: 0 }, expected: stronger('writer') },
  { name: 'director role tier precedes later tuple fields', director: { capability: 80, potentialTier: 'Limited' }, writer: { capability: 79, potentialTier: 'Generational Upside' }, expected: stronger('director') },
  { name: 'writer role tier precedes later tuple fields', director: { capability: 79, potentialTier: 'Generational Upside' }, writer: { capability: 80, potentialTier: 'Limited' }, expected: stronger('writer') },
  { name: 'director context band precedes public potential', director: { workHistory: 1, contextCount: 2, potentialTier: 'Limited' }, writer: { workHistory: 1, contextCount: 1, potentialTier: 'Generational Upside' }, expected: stronger('director') },
  { name: 'writer context band precedes public potential', director: { workHistory: 1, contextCount: 1, potentialTier: 'Generational Upside' }, writer: { workHistory: 1, contextCount: 2, potentialTier: 'Limited' }, expected: stronger('writer') },
  { name: 'director public potential resolves an otherwise equal tuple', director: { potentialTier: 'Steady' }, writer: { potentialTier: 'Limited' }, expected: stronger('director') },
  { name: 'writer public potential resolves an otherwise equal tuple', director: { potentialTier: 'Limited' }, writer: { potentialTier: 'Steady' }, expected: stronger('writer') },
  { name: 'raw OVR does not break a tie inside the same role tier', director: { capability: 70 }, writer: { capability: 79 }, expected: equal },
  { name: 'raw context above two does not break a context-band tie', director: { contextCount: 2 }, writer: { contextCount: 7 }, expected: equal },
  { name: 'raw work history does not rank two already-proven targets', director: { workHistory: 1 }, writer: { workHistory: 9 }, expected: equal },
  { name: 'two Limited-upside targets are eligible and can tie', director: { potentialTier: 'Limited' }, writer: { potentialTier: 'Limited' }, expected: equal },
  { name: 'Limited upside does not veto the sole eligible target', director: { potentialTier: 'Limited' }, expected: chosenDirector },
  { name: 'age74 still allows a choice', base: { age: 74 }, expected: chosenDirector },
  { name: 'age75 overrides an otherwise eligible winner', base: { age: 75 }, expected: ageBoundary },
  { name: 'age75 overrides no-eligible deferral', director: { capability: 59 }, base: { age: 75 }, expected: ageBoundary },
  { name: 'older actors cannot reopen target choice', base: { age: 76 }, expected: ageBoundary },
]

function assertEventIdentity(root: Root38): void {
  root.transitionEvaluations.forEach((row, ordinal) => {
    expect(row.ordinal).toBe(ordinal)
    expect(row.id).toBe(`transition-evaluation-${ordinal}`)
    expect(row.inputsDigest).toMatch(/^[0-9a-f]{16}$/)
  })
  root.professionChanges.forEach((row, ordinal) => {
    expect(row.ordinal).toBe(ordinal)
    expect(row.id).toBe(`profession-change-${ordinal}`)
    expect(root.transitionEvaluations.find(evaluation => evaluation.id === row.evaluationId))
      .toMatchObject({ week: row.week, personId: row.personId, outcome: 'chosen', selected: row.to })
  })
}

describe('C.3 A07/A08 pure public choice law', () => {
  it('publishes transition rule1 and its four delegated constants without changing existing rule versions', () => {
    expect((core as unknown as Record<string, unknown>).TRANSITION_RULES_VERSION).toBe(1)
    expect(TUNING).toMatchObject({ PROFESSION_TRANSITION_MIN_ACTING_TAKES: 3,
      PROFESSION_TRANSITION_MIN_CONTEXT_PICTURES: 2, PROFESSION_TRANSITION_RECHECK_WEEKS: 52,
      PROFESSION_TRANSITION_WAIT_AGE_MARGIN: 5 })
  })

  it.each(comparisons)('$name', row => {
    const inputs = syntheticInputs(row.director ?? {}, row.writer ?? { capability: 20 }, row.base ?? {})
    const before = stableStringify(inputs), choose = api('chooseProfessionTransition')
    expect(choose(inputs)).toEqual(row.expected)
    expect(choose(clone(inputs))).toEqual(row.expected)
    expect(stableStringify(inputs), 'public choice is pure').toBe(before)
  })
})

describe('C.3 A03/A04 genuine retirement choices through existing tick', () => {
  it('retires the two genuine207 actors into director and writer at208 with real bounded evidence', () => {
    const before = migrated(PRE207), immutable = stableStringify(before)
    for (const id of Object.values(FOCUS)) {
      expect(person(before, id)).toMatchObject({ role: 'actor', age: 71 })
      expect(before.careerLifecycle.records.find(row => row.personId === id))
        .toMatchObject({ profession: 'actor', status: 'announced', effectiveWeek: 208, retiredWeek: null })
      const inputs = expectedFocusInputs(before, id)
      expect(inputs.actingFirstTakes).toBe(3)
      expect(inputs.targets.find(row => row.profession === (id === FOCUS.director ? 'director' : 'writer')))
        .toMatchObject({ capability: 80, proven: false, contextCount: 3, contextBand: 2 })
    }
    const after = chosen(PRE207) // actual tick; first assertion is actual Talent.role
    const root = expectFocusChosen(after, 208)
    assertEventIdentity(root)
    for (const id of Object.values(FOCUS)) {
      expect(root.records.find(row => row.personId === id && row.profession === 'actor'))
        .toMatchObject({ status: 'retired', retiredWeek: 208, effectiveWeek: 208 })
      const evaluation = root.transitionEvaluations.find(row => row.personId === id)!
      expect(evaluation.inputs).toEqual(expectedFocusInputs(after, id))
      expect(evaluation.inputs.age).toBe(72)
      expect(evaluation.inputs.actingWitnesses).toHaveLength(3)
      expect(evaluation.inputs.targets.find(row => row.profession === evaluation.selected)!.contextWitness.pictures).toHaveLength(2)
    }
    expect(stableStringify(before)).toBe(immutable)
  })

  it.each([CONTINUOUS208, RUNTIME208])('reconciles actual retired %s prospectively at209 without backdating or rewriting old receipts', filename => {
    const before = migrated(filename), immutable = stableStringify(before)
    expect(before.market.tick).toBe(208)
    for (const id of Object.values(FOCUS)) {
      expect(person(before, id).role).toBe('actor')
      expect(before.careerLifecycle.records.find(row => row.personId === id))
        .toMatchObject({ profession: 'actor', status: 'retired', retiredWeek: 208 })
    }
    const after = chosen(filename), root = expectFocusChosen(after, 209)
    expect(root38(before).transitionEvaluations).toEqual([])
    expect(root38(before).professionChanges).toEqual([])
    expect(root38(before).industryRetirements).toEqual([])
    for (const id of Object.values(FOCUS)) {
      expect(root38(before).transitionDue).toContainEqual({ personId: id, week: 209 })
      expect(root.records.find(row => row.personId === id && row.profession === 'actor')?.retiredWeek).toBe(208)
      expect(root.transitionEvaluations.find(row => row.personId === id)?.week).toBe(209)
    }
    assertEventIdentity(root)
    expect(stableStringify(before), 'load and continuation leave the old input, including its own historical receipt digests, unchanged').toBe(immutable)
    expect(exportSave(importSave(bytes(after)))).toBe(bytes(after))
  })
})

describe('C.3 A05/A06 public profession history, current evidence and repeat safety', () => {
  it('derives the exact current public input without mutation and refuses past-week reconstruction', () => {
    const state = migrated(), immutable = stableStringify(state), read = api('transitionInputsFor')
    for (const id of Object.values(FOCUS)) {
      const expected = expectedFocusInputs(state, id)
      expect(read(state, id, 207)).toEqual(expected)
      expect(read(clone(state), id, 207)).toEqual(expected)
      expect(() => read(state, id, 206)).toThrow()
      expect(() => read(state, id, 208)).toThrow()
    }
    expect(stableStringify(state)).toBe(immutable)
  })

  it('uses inclusive change weeks and current-versus-explicit retirement lookup after save and reload', () => {
    const state = chosen(), at = api('professionAtWeek')
    const record = retirementRecordFor as (state: GameState, personId: string, profession?: CreativeRole) => ReturnType<typeof retirementRecordFor>
    const reopened = migrateToLive(importSave(bytes(state))).state
    for (const [target, id] of Object.entries(FOCUS)) {
      expect(at(reopened, id, 0)).toBe('actor')
      expect(at(reopened, id, 207)).toBe('actor')
      expect(at(reopened, id, 208)).toBe(target)
      expect(record(reopened, id)).toBeUndefined()
      expect(record(reopened, id, 'actor')).toMatchObject({ profession: 'actor', status: 'retired', retiredWeek: 208 })
    }
    expect(bytes(reopened)).toBe(bytes(state))
    const immutable = bytes(reopened), repeated = api('advanceProfessionTransitions')(reopened, [])
    expect(bytes(repeated), 'repeat due processing adds no choice, finality, queue or other write').toBe(immutable)
    expect(bytes(reopened)).toBe(immutable)
    const next = tick(reopened, { develop: true })
    expect(root38(next).transitionEvaluations).toEqual(root38(reopened).transitionEvaluations)
    expect(root38(next).professionChanges).toEqual(root38(reopened).professionChanges)
    for (const [target, id] of Object.entries(FOCUS)) expect(at(next, id, 209)).toBe(target)
    expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42ToV41(envelope38(reopened) as never)))))).toThrow(/downgrade|transition|discard|profession/i)
  })
})

describe('C.3 A09/A10 genuine prospective finality and deferred reconciliation', () => {
  it('records Scientist noCatalogue finality at671 once, preserving the actual670 profession retirement', () => {
    const before = scientistBoundary()
    expect(before.market.tick).toBe(670)
    expect(person(before, SCIENTIST).role).toBe('scientist')
    expect(before.careerLifecycle.records.find(row => row.personId === SCIENTIST))
      .toMatchObject({ profession: 'scientist', status: 'retired', retiredWeek: 670 })
    const after = tick(before, { develop: true })
    // Existing public tick is the tested boundary, before any new-export call.
    expect((after.careerLifecycle as Partial<Root38>).industryRetirements)
      .toEqual(expect.arrayContaining([{ personId: SCIENTIST, week: 671, profession: 'scientist',
        source: { personId: SCIENTIST, profession: 'scientist' }, cause: 'noCatalogue', evaluationId: null }]))
    expect(root38(before).industryRetirements).toEqual([])
    expect(root38(before).transitionDue).toContainEqual({ personId: SCIENTIST, week: 671 })
    const root = root38(after)
    expect(root.industryRetirements.filter(row => row.personId === SCIENTIST)).toHaveLength(1)
    expect(root.transitionEvaluations.filter(row => row.personId === SCIENTIST)).toEqual([])
    expect(root.professionChanges.filter(row => row.personId === SCIENTIST)).toEqual([])
    expect(root.transitionDue.filter(row => row.personId === SCIENTIST)).toEqual([])
    expect(root.records.find(row => row.personId === SCIENTIST)?.retiredWeek).toBe(670)
    expect(after.freeAgents).not.toContain(SCIENTIST)
    const reopened = migrateToLive(importSave(bytes(after))).state
    const next = tick(reopened, { develop: true })
    expect(root38(next).industryRetirements.filter(row => row.personId === SCIENTIST))
      .toEqual(root.industryRetirements.filter(row => row.personId === SCIENTIST))
    expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42ToV41(envelope38(reopened) as never)))))).toThrow(/downgrade|retirement|discard|profession/i)
  })

  it('defers the real retired cohort actor at2601 and schedules the exact annual-or-age deadline, never the next week', () => {
    const before = deferredBoundary(), immutable = stableStringify(before)
    const after = tick(before, { develop: true }), week = 2601
    expect(after.market.tick).toBe(week)
    const evaluations = (after.careerLifecycle as Partial<Root38>).transitionEvaluations
    expect(evaluations, 'existing tick must create the first prospective evaluation').toBeDefined()
    const rows = evaluations!.filter(row => row.personId === DEFERRED_ACTOR)
    expect(rows).toHaveLength(1)
    const evaluation = rows[0]!
    expect(evaluation).toMatchObject({ week, personId: DEFERRED_ACTOR, rulesVersion: 1,
      source: { personId: DEFERRED_ACTOR, profession: 'actor' }, ...deferred })
    expect(evaluation.inputs.actingFirstTakes).toBe(0)
    expect(evaluation.inputs.actingWitnesses).toEqual([])
    const provenance = after.talentProvenance.rows.find(row => row.personId === DEFERRED_ACTOR)
    assert.ok(provenance)
    expect(evaluation.inputs.age).toBe(ageAt(provenance, week))
    const expectedDue = Math.min(week + 52, nextBirthdayWeek(provenance, 74))
    expect(expectedDue).toBeGreaterThan(week + 1)
    expect(root38(before).transitionDue).toContainEqual({ personId: DEFERRED_ACTOR, week })
    expect(root38(after).transitionDue.filter(row => row.personId === DEFERRED_ACTOR))
      .toEqual([{ personId: DEFERRED_ACTOR, week: expectedDue }])
    expect(root38(after).professionChanges.filter(row => row.personId === DEFERRED_ACTOR)).toEqual([])
    expect(root38(after).industryRetirements.filter(row => row.personId === DEFERRED_ACTOR)).toEqual([])
    expect(after.freeAgents).not.toContain(DEFERRED_ACTOR)
    expect(person(after, DEFERRED_ACTOR).role).toBe('actor')
    const saved = envelope38(after), next = tick(migrateToLive(importSave(exportSave(saved))).state, { develop: true })
    expect(root38(next).transitionEvaluations.filter(row => row.personId === DEFERRED_ACTOR)).toEqual(rows)
    expect(root38(next).transitionDue.filter(row => row.personId === DEFERRED_ACTOR))
      .toEqual([{ personId: DEFERRED_ACTOR, week: expectedDue }])
    expect(stableStringify(before)).toBe(immutable)
  })
})
