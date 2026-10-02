// 963/967 Stage A foundations. Exact946 migration/downgrade law; independent
// expectations use retained old facts, never a new production output/hash dump.
import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import * as saveModule from '../src/core/save.js'
import { applyActions } from '../src/core/actions.js'
import { generateWorld } from '../src/core/worldgen.js'
import { LIFECYCLE_INTENT_RULES_VERSION } from '../src/core/careerLifecycle.js'
import { PROMISE_RULES_VERSION } from '../src/core/promises.js'
import { tick } from '../src/core/tick.js'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive, migrateToV37, stableStringify } from '../src/core/save.js'
import { CONTINUOUS208, FOCUS, FUTURE_ROOT_KEYS, PRE207, RUNTIME208, SCIENTIST, c3Raw, chosen, clone, compareText,
  envelope38, historical37, migrated, obligationControls, person, root38, saveApi, scientistBoundary } from './helpers/p14c3-fixtures.js'
import type { Evaluation, Save38 } from './helpers/p14c3-fixtures.js'

// 1309-X3 ruling 4: convertV40ToV41 (src/core/save.ts:10479) adds a zero
// `termination` movement to every rival finance period; the OLD state never
// carried it, so an expected migrated-state comparison must build it the
// same way, never a bare `old.state`.
type WithRivalBusinesses = { hollywood: { businesses: readonly { account: { periods: readonly { movements: Record<string, number> }[] } }[] } | null }
function withRivalTermination<T extends WithRivalBusinesses>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, account: { ...business.account, periods: business.account.periods.map((period) => ({
      ...period, movements: { ...period.movements, termination: 0 } })) },
  })) } }
}
// 1320-A S5: Save42 gives every relationship edge a `sharedCompetitions` counter
// (convertV41ToV42); a genuine V37 old.state never carried it.
type WithRelationships = { relationships: readonly { sharedCompetitions?: number }[] }
function withSharedCompetitions<T extends WithRelationships>(state: T): T {
  return { ...state, relationships: state.relationships.map(edge => ({ ...edge, sharedCompetitions: 0 })) }
}
// 1324-C / C20: convertV39ToV40 (src/core/save.ts:10493) adds a top-level
// `firstTakeSubjects` root, built from the state's own already-written
// `firstTakes` root (`{version:1, cutoverOrdinal: firstTakes.length, facts:[]}`);
// a genuine V37 old.state never carried it either.
type WithFirstTakes = { firstTakes: readonly unknown[]; firstTakeSubjects?: unknown }
function withFirstTakeSubjects<T extends WithFirstTakes>(state: T): T {
  return { ...state, firstTakeSubjects: { version: 1, cutoverOrdinal: state.firstTakes.length, facts: [] } }
}
// Save43 (convertV42ToV43, save.ts:10678-10686) gives every rival business an
// empty screenplayShelving root; a genuine V37 old.state never carried it.
function withEmptyScreenplayShelving<T extends WithRivalBusinesses>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, screenplayShelving: { version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 0 } })) } }
}
// 1358-N S5: Save44 (convertV43ToV44, save.ts:10776-10781) gives every relationship edge an
// empty `competitions` log and a null `romance`; a genuine V37 old.state never carried either.
function withEmptyCompetitionsAndRomance<T extends WithRelationships>(state: T): T {
  return { ...state, relationships: state.relationships.map(edge => ({ ...edge, competitions: [], romance: null })) }
}

describe('C.3 A01/A02 exact Save38 opening', () => {
  it('moves the existing live writer and fresh root together while preserving intent1 and promise4', () => {
    const world = generateWorld('967-fresh-root'), saved = makeSave(world)
    expect(saved.saveVersion, 'existing makeSave must write the governed new envelope').toBe(44)
    expect(LIVE_SAVE_VERSION).toBe(44)
    expect(LIFECYCLE_INTENT_RULES_VERSION).toBe(1)
    expect(PROMISE_RULES_VERSION).toBe(4)
    const root = root38(saved.state)
    expect(root.transitionBoundaryWeek).toBe(world.market.tick)
    expect(root.professionAnchors).toEqual(world.talent.map(talent => ({ personId: talent.id,
      profession: talent.role, recordedWeek: world.market.tick, kind: 'existing' })))
    expect(root.transitionEvaluations).toEqual([])
    expect(root.professionChanges).toEqual([])
    expect(root.industryRetirements).toEqual([])
    expect(root.transitionDue).toEqual([])
    expect(exportSave(importSave(exportSave(saved)))).toBe(exportSave(saved))
  })

  it.each(['genuine-v37-c3-created-week0.json.gz', PRE207, CONTINUOUS208, RUNTIME208])(
    'migrates genuine %s losslessly except for explicit prospective38 scaffolding', filename => {
      const raw = c3Raw(filename), old = historical37(filename), before = stableStringify(old)
      const upgraded = migrateToLive(old)
      expect(upgraded.saveVersion, 'actual migration must change the current envelope').toBe(44)
      const root = root38(upgraded.state), week = old.state.market.tick
      expect(root.transitionBoundaryWeek).toBe(week)
      expect(root.professionAnchors).toEqual(old.state.talent.map(talent => ({ personId: talent.id,
        profession: talent.role, recordedWeek: week, kind: 'existing' })))
      expect(root.transitionEvaluations).toEqual([])
      expect(root.professionChanges).toEqual([])
      expect(root.industryRetirements).toEqual([])
      const expectedDue = old.state.hollywood === null ? [] : old.state.careerLifecycle.records
        .filter(record => record.status === 'retired')
        .map(record => ({ personId: record.personId, week: week + 1 }))
        .sort((a, b) => a.week - b.week || compareText(a.personId, b.personId))
      expect(root.transitionDue, 'actual completed retirements reconcile prospectively, not on load').toEqual(expectedDue)
      const stripped = { ...upgraded.state, careerLifecycle: Object.fromEntries(
        Object.entries(root).filter(([key]) => !FUTURE_ROOT_KEYS.includes(key as typeof FUTURE_ROOT_KEYS[number]))) }
      expect(stableStringify(stripped), 'every old field, receipt, clock and RNG value survives migration').toBe(stableStringify(withEmptyCompetitionsAndRomance(withEmptyScreenplayShelving(withRivalTermination(withSharedCompetitions(withFirstTakeSubjects(old.state)))))))
      expect(stableStringify(old), 'converter never mutates its genuine input').toBe(before)
      expect(exportSave(importSave(raw))).toBe(raw)
      expect(c3Raw(filename)).toBe(raw)
      expect(exportSave(importSave(exportSave(upgraded)))).toBe(exportSave(upgraded))
    })

  it('exposes matching strict38 conversion, validation and current migration over a genuine37 save', () => {
    const old = historical37(), original = stableStringify(old)
    const converted = saveApi('convertV37ToV38')(old)
    expect(converted.saveVersion).toBe(38)
    expect(saveApi('validateSaveV38')(converted)).toBe(converted)
    expect(stableStringify(saveApi('migrateToV38')(old))).toBe(stableStringify(converted))
    expect(stableStringify(migrateToLive(old))).toBe(stableStringify(converted))
    expect(stableStringify(old)).toBe(original)
  })
})

// Every rejection family first validates an actual accepted control. All mutants
// below are detached malformed inputs, never historical fixture generation.
type Negative = { name: string; mutate: (save: Save38) => void }
const set = (object: object, key: string, value: unknown) => { (object as Record<string, unknown>)[key] = value }
const drop = (object: object, key: string) => { Reflect.deleteProperty(object, key) }
function rejectMutations(control: Save38, cases: Negative[]): void {
  const validate = saveApi('validateSaveV44'), immutable = stableStringify(control)
  expect(validate(control), 'required accepted38 positive before malformed-input assertions').toBe(control)
  for (const row of cases) {
    const mutated = clone(control)
    row.mutate(mutated)
    expect(() => validate(mutated), row.name).toThrow()
  }
  expect(stableStringify(control)).toBe(immutable)
}
function focusEvaluation(saved: Save38): Evaluation {
  const result = saved.state.careerLifecycle.transitionEvaluations.find(row => row.personId === FOCUS.director)
  assert.ok(result, 'genuine chosen actor has a real recorded evaluation')
  return result
}
let chosenControl: Save38 | undefined
function acceptedChosen(): Save38 {
  chosenControl ??= envelope38(chosen())
  return clone(chosenControl)
}
let scientistControl: Save38 | undefined
function acceptedScientist(): Save38 {
  if (scientistControl === undefined) {
    const current = envelope38(tick(scientistBoundary(), { develop: true }))
    expect(current.state.careerLifecycle.industryRetirements.find(row => row.personId === SCIENTIST))
      .toEqual({ personId: SCIENTIST, week: 671, profession: 'scientist',
        source: { personId: SCIENTIST, profession: 'scientist' }, cause: 'noCatalogue', evaluationId: null })
    scientistControl = current
  }
  return clone(scientistControl)
}

describe('C.3 A12 exact root, anchored identity and due authority', () => {
  it('rejects every omitted new root field and an unrecognized root authority', () => {
    rejectMutations(envelope38(migrated()), [
      ...FUTURE_ROOT_KEYS.map(key => ({ name: `missing ${key}`, mutate: (saved: Save38) => drop(saved.state.careerLifecycle, key) })),
      { name: 'unknown root key', mutate: saved => set(saved.state.careerLifecycle, 'allowRoleMismatch', true) },
      { name: 'events cannot be null', mutate: saved => set(saved.state.careerLifecycle, 'transitionEvaluations', null) },
      { name: 'queue cannot be an object', mutate: saved => set(saved.state.careerLifecycle, 'transitionDue', {}) },
    ])
  })

  it('requires a finite safe nonnegative boundary at or before the actual clock', () => {
    const current = envelope38(migrated())
    rejectMutations(current, [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, current.state.market.tick + 1].map(value => ({
      name: `invalid boundary ${String(value)}`, mutate: saved => { saved.state.careerLifecycle.transitionBoundaryWeek = value },
    })))
  })

  it('requires exact, ordered, unique person anchors at their authoritative recording dates', () => {
    rejectMutations(envelope38(migrated()), [
      { name: 'missing person anchor', mutate: saved => { saved.state.careerLifecycle.professionAnchors.pop() } },
      { name: 'duplicate person anchor', mutate: saved => { saved.state.careerLifecycle.professionAnchors.push(clone(saved.state.careerLifecycle.professionAnchors[0]!)) } },
      { name: 'wrong anchor order', mutate: saved => { saved.state.careerLifecycle.professionAnchors.reverse() } },
      { name: 'unknown person', mutate: saved => { saved.state.careerLifecycle.professionAnchors[0]!.personId = 'missing-person' } },
      { name: 'invalid kind', mutate: saved => set(saved.state.careerLifecycle.professionAnchors[0]!, 'kind', 'imported') },
      { name: 'unknown profession', mutate: saved => set(saved.state.careerLifecycle.professionAnchors[0]!, 'profession', 'producer') },
      { name: 'existing anchor before boundary', mutate: saved => { saved.state.careerLifecycle.professionAnchors[0]!.recordedWeek -= 1 } },
      { name: 'anchor after current clock', mutate: saved => { saved.state.careerLifecycle.professionAnchors[0]!.recordedWeek += 1 } },
      { name: 'unknown anchor field', mutate: saved => set(saved.state.careerLifecycle.professionAnchors[0]!, 'permission', true) },
      { name: 'missing anchor field', mutate: saved => drop(saved.state.careerLifecycle.professionAnchors[0]!, 'profession') },
      { name: 'role rewrite without a change', mutate: saved => { person(saved.state, FOCUS.director).role = 'director' } },
    ])
  })

  it('cannot relabel a genuinely later-created person as an existing person before their entry', () => {
    const before = chosen(), boundary = root38(before).transitionBoundaryWeek
    expect(before.market.tick).toBeGreaterThan(boundary)
    const created = applyActions(before, [{ kind: 'createTalent', talent: { name: '967 Later actual entrant',
      role: 'actor', age: 30, actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } }])
    expect(created.talent).toHaveLength(before.talent.length + 1)
    const entrant = created.talent.at(-1)!, control = envelope38(created)
    expect(control.state.careerLifecycle.professionAnchors.find(row => row.personId === entrant.id))
      .toEqual({ personId: entrant.id, profession: 'actor', recordedWeek: created.market.tick, kind: 'entrant' })
    expect(created.talentProvenance.rows.find(row => row.personId === entrant.id))
      .toMatchObject({ kind: 'authored_exact_week', entryWeek: created.market.tick })
    rejectMutations(control, [{ name: 'existing anchor cannot grant presence before genuine creation', mutate: saved => {
      const anchor = saved.state.careerLifecycle.professionAnchors.find(row => row.personId === entrant.id)!
      anchor.kind = 'existing'; anchor.recordedWeek = boundary
    } }])
  })

  it('requires the complete sorted prospective queue and strictly future exact due dates', () => {
    const control = envelope38(migrated(CONTINUOUS208)), due = control.state.careerLifecycle.transitionDue
    expect(due.some(row => row.personId === FOCUS.director)).toBe(true)
    expect(due.some(row => row.personId === FOCUS.writer)).toBe(true)
    rejectMutations(control, [
      { name: 'missing due person', mutate: saved => { saved.state.careerLifecycle.transitionDue.shift() } },
      { name: 'duplicate due person', mutate: saved => { saved.state.careerLifecycle.transitionDue.push(clone(saved.state.careerLifecycle.transitionDue[0]!)) } },
      { name: 'wrong queue order', mutate: saved => { saved.state.careerLifecycle.transitionDue.reverse() } },
      { name: 'due today is stale', mutate: saved => { saved.state.careerLifecycle.transitionDue[0]!.week = saved.state.market.tick } },
      { name: 'arbitrary future week is not the exact next due', mutate: saved => { saved.state.careerLifecycle.transitionDue[0]!.week += 1 } },
      { name: 'fractional week', mutate: saved => { saved.state.careerLifecycle.transitionDue[0]!.week += 0.5 } },
      { name: 'unknown due person', mutate: saved => { saved.state.careerLifecycle.transitionDue[0]!.personId = 'missing-person' } },
      { name: 'extra due property', mutate: saved => set(saved.state.careerLifecycle.transitionDue[0]!, 'reason', 'synthetic') },
      { name: 'missing due date', mutate: saved => drop(saved.state.careerLifecycle.transitionDue[0]!, 'week') },
    ])
  })
})

describe('C.3 A12 actual chosen receipts and their dated joins', () => {
  it('checks exact keys on evaluation, input, target, context, picture and source objects', () => {
    const control = acceptedChosen()
    rejectMutations(control, [
      { name: 'extra evaluation key', mutate: saved => set(focusEvaluation(saved), 'silentApproval', true) },
      { name: 'missing rules version', mutate: saved => drop(focusEvaluation(saved), 'rulesVersion') },
      { name: 'extra inputs key', mutate: saved => set(focusEvaluation(saved).inputs, 'hiddenCeiling', 99) },
      { name: 'extra target key', mutate: saved => set(focusEvaluation(saved).inputs.targets[0], 'odds', 1) },
      { name: 'extra context key', mutate: saved => set(focusEvaluation(saved).inputs.targets[0].contextWitness, 'approval', true) },
      { name: 'extra picture key', mutate: saved => set(focusEvaluation(saved).inputs.targets[0].contextWitness.pictures[0]!, 'count', 3) },
      { name: 'extra source key', mutate: saved => set(focusEvaluation(saved).source, 'episode', 0) },
    ])
  })

  it('rejects invalid rules, ordinal identity, source retirement and event chronology', () => {
    rejectMutations(acceptedChosen(), [
      { name: 'rules version2', mutate: saved => set(focusEvaluation(saved), 'rulesVersion', 2) },
      { name: 'negative ordinal', mutate: saved => { focusEvaluation(saved).ordinal = -1 } },
      { name: 'noncontiguous ordinal', mutate: saved => { focusEvaluation(saved).ordinal += 1 } },
      { name: 'id not derived from ordinal', mutate: saved => { focusEvaluation(saved).id = 'transition-evaluation-999999' } },
      { name: 'duplicate evaluation', mutate: saved => { saved.state.careerLifecycle.transitionEvaluations.push(clone(focusEvaluation(saved))) } },
      { name: 'unknown person', mutate: saved => { focusEvaluation(saved).personId = 'missing-person' } },
      { name: 'source names another person', mutate: saved => { focusEvaluation(saved).source.personId = FOCUS.writer } },
      { name: 'source is not an actor retirement', mutate: saved => { focusEvaluation(saved).source.profession = 'writer' } },
      { name: 'evaluation before actual retirement', mutate: saved => { focusEvaluation(saved).week = 207 } },
      { name: 'evaluation after current week', mutate: saved => { focusEvaluation(saved).week = 209 } },
      { name: 'nonfinite event week', mutate: saved => { focusEvaluation(saved).week = NaN } },
      { name: 'uncompleted source', mutate: saved => {
        const record = saved.state.careerLifecycle.records.find(row => row.personId === FOCUS.director && row.profession === 'actor')!
        set(record, 'status', 'announced'); set(record, 'retiredWeek', null)
      } },
    ])
  })

  it('checks snapshot ranges, consistency, target order and digest integrity without claiming reconstructed historical skill truth', () => {
    rejectMutations(acceptedChosen(), [
      { name: 'age disagrees with immutable provenance', mutate: saved => { focusEvaluation(saved).inputs.age += 1 } },
      { name: 'unsafe total', mutate: saved => { focusEvaluation(saved).inputs.actingFirstTakes = Number.MAX_SAFE_INTEGER + 1 } },
      { name: 'negative lead count', mutate: saved => { focusEvaluation(saved).inputs.leadFirstTakes = -1 } },
      { name: 'capability zero', mutate: saved => { focusEvaluation(saved).inputs.targets[0].capability = 0 } },
      { name: 'capability100', mutate: saved => { focusEvaluation(saved).inputs.targets[0].capability = 100 } },
      { name: 'fractional capability', mutate: saved => { focusEvaluation(saved).inputs.targets[0].capability = 80.5 } },
      { name: 'invalid potential enum', mutate: saved => set(focusEvaluation(saved).inputs.targets[0], 'potentialTier', 'Guaranteed') },
      { name: 'tier disagrees with capability', mutate: saved => { focusEvaluation(saved).inputs.targets[0].roleTier = 'Raw prospect' } },
      { name: 'proven disagrees with zero work', mutate: saved => { focusEvaluation(saved).inputs.targets[0].proven = true } },
      { name: 'context band outside closed enum', mutate: saved => set(focusEvaluation(saved).inputs.targets[0], 'contextBand', 3) },
      { name: 'wrong target order', mutate: saved => { focusEvaluation(saved).inputs.targets.reverse() } },
      { name: 'missing target', mutate: saved => { focusEvaluation(saved).inputs.targets.pop() } },
      { name: 'missing acting witness', mutate: saved => { focusEvaluation(saved).inputs.actingWitnesses.pop() } },
      { name: 'unknown acting witness', mutate: saved => { focusEvaluation(saved).inputs.actingWitnesses[0] = 'invented-take' } },
      { name: 'wrong context witness', mutate: saved => { focusEvaluation(saved).inputs.targets[0].contextWitness.pictures[0]!.pictureId = 'invented-picture' } },
      { name: 'malformed digest', mutate: saved => { focusEvaluation(saved).inputsDigest = 'not-a-digest' } },
      { name: 'different well-shaped digest', mutate: saved => {
        const row = focusEvaluation(saved); row.inputsDigest = `${row.inputsDigest[0] === '0' ? '1' : '0'}${row.inputsDigest.slice(1)}`
      } },
    ])
  })

  it('recomputes the outcome separately from the unchanged question digest', () => {
    rejectMutations(acceptedChosen(), [
      { name: 'valid digest cannot authorize wrong selected target', mutate: saved => { focusEvaluation(saved).selected = 'writer' } },
      { name: 'valid digest cannot authorize wrong outcome', mutate: saved => { focusEvaluation(saved).outcome = 'deferred' } },
      { name: 'valid digest cannot authorize wrong reason', mutate: saved => { focusEvaluation(saved).reason = 'strongerPublicTuple' } },
      { name: 'unknown outcome', mutate: saved => set(focusEvaluation(saved), 'outcome', 'accepted') },
      { name: 'noncatalogue selection', mutate: saved => set(focusEvaluation(saved), 'selected', 'scientist') },
    ])
  })

  it('requires exactly one correctly linked same-week change and no remaining queue for a chosen person', () => {
    rejectMutations(acceptedChosen(), [
      { name: 'missing chosen change', mutate: saved => { saved.state.careerLifecycle.professionChanges = saved.state.careerLifecycle.professionChanges.filter(row => row.personId !== FOCUS.director) } },
      { name: 'missing predecessor evaluation', mutate: saved => { saved.state.careerLifecycle.transitionEvaluations = saved.state.careerLifecycle.transitionEvaluations.filter(row => row.personId !== FOCUS.director) } },
      { name: 'duplicate profession change', mutate: saved => { saved.state.careerLifecycle.professionChanges.push(clone(saved.state.careerLifecycle.professionChanges[0]!)) } },
      { name: 'unknown evaluation reference', mutate: saved => { saved.state.careerLifecycle.professionChanges[0]!.evaluationId = 'transition-evaluation-999999' } },
      { name: 'change person disagrees with evaluation', mutate: saved => { saved.state.careerLifecycle.professionChanges[0]!.personId = 'missing-person' } },
      { name: 'change date disagrees with evaluation', mutate: saved => { saved.state.careerLifecycle.professionChanges[0]!.week += 1 } },
      { name: 'change ordinal not contiguous', mutate: saved => { saved.state.careerLifecycle.professionChanges[0]!.ordinal += 1 } },
      { name: 'change id not derived from ordinal', mutate: saved => { saved.state.careerLifecycle.professionChanges[0]!.id = 'profession-change-999999' } },
      { name: 'change cannot originate in a writer', mutate: saved => set(saved.state.careerLifecycle.professionChanges[0]!, 'from', 'writer') },
      { name: 'extra change field', mutate: saved => set(saved.state.careerLifecycle.professionChanges[0]!, 'bonus', 1000) },
      { name: 'current role omits actual change', mutate: saved => { person(saved.state, FOCUS.director).role = 'actor' } },
      { name: 'chosen person still queued', mutate: saved => { saved.state.careerLifecycle.transitionDue.push({ personId: FOCUS.director, week: 260 }) } },
    ])
  })
})

describe('C.3 A11/A12 industry finality and frozen strict readers', () => {
  it('requires exact noncatalogue finality identity, chronology and source without inventing an evaluation', () => {
    const control = acceptedScientist()
    const finality = (saved: Save38) => saved.state.careerLifecycle.industryRetirements.find(row => row.personId === SCIENTIST)!
    rejectMutations(control, [
      { name: 'missing finality', mutate: saved => { saved.state.careerLifecycle.industryRetirements = saved.state.careerLifecycle.industryRetirements.filter(row => row.personId !== SCIENTIST) } },
      { name: 'duplicate finality', mutate: saved => { saved.state.careerLifecycle.industryRetirements.push(clone(finality(saved))) } },
      { name: 'retroactive finality at migration', mutate: saved => { finality(saved).week = 670 } },
      { name: 'future finality', mutate: saved => { finality(saved).week = 672 } },
      { name: 'wrong final profession', mutate: saved => { finality(saved).profession = 'actor' } },
      { name: 'wrong source person', mutate: saved => { finality(saved).source.personId = 'missing-person' } },
      { name: 'wrong source profession', mutate: saved => { finality(saved).source.profession = 'actor' } },
      { name: 'noCatalogue cannot reference an evaluation', mutate: saved => { finality(saved).evaluationId = 'transition-evaluation-0' } },
      { name: 'declinedAll requires its actual evaluation', mutate: saved => { finality(saved).cause = 'declinedAll' } },
      { name: 'unknown finality cause', mutate: saved => set(finality(saved), 'cause', 'age') },
      { name: 'extra finality field', mutate: saved => set(finality(saved), 'payout', 1) },
      { name: 'missing finality key', mutate: saved => drop(finality(saved), 'evaluationId') },
      { name: 'final person cannot remain queued', mutate: saved => { saved.state.careerLifecycle.transitionDue.push({ personId: SCIENTIST, week: 723 }) } },
    ])
    expect(() => saveApi('convertV38ToV37')(control)).toThrow(/downgrade|retirement|discard|profession/i)
  })

  it('keeps the genuine public37 reader strict even when a caller adds current authority or strips its evidence', () => {
    const old = historical37(), oldBytes = exportSave(old), current = acceptedChosen()
    expect(saveModule.validateSaveV37(old)).toBe(old)
    expect(saveApi('validateSaveV44')(current)).toBe(current)
    const extraAuthority = clone(old)
    Object.assign(extraAuthority.state.careerLifecycle, current.state.careerLifecycle)
    expect(() => saveModule.validateSaveV37(extraAuthority)).toThrow()
    const stripped = clone(current)
    set(stripped, 'saveVersion', 37)
    for (const key of FUTURE_ROOT_KEYS) drop(stripped.state.careerLifecycle, key)
    expect(() => saveModule.validateSaveV37(stripped), 'old role/retirement rules receive no hidden current permission').toThrow()
    expect(exportSave(old)).toBe(oldBytes)
  })

  it.each(Array.from({ length: 18 }, (_, index) => index + 1))(
    'makeSaveV%i validates current authority before stripping a malformed null-Hollywood root', version => {
      const current = envelope38(generateWorld(`967-frozen-builder-${version}`))
      expect(current.state.hollywood).toBeNull()
      expect(saveApi('validateSaveV44')(current)).toBe(current)
      const builder = (saveModule as unknown as Record<string, (state: unknown) => { saveVersion: number }>)[`makeSaveV${version}`]
      expect(typeof builder).toBe('function'); assert.ok(builder)
      expect(builder(current.state).saveVersion, 'valid empty current authority may still project to the frozen boundary').toBe(version)
      for (const defect of ['missing-anchor', 'extra-authority', 'wrong-current-role'] as const) {
        const mutated = clone(current)
        if (defect === 'missing-anchor') mutated.state.careerLifecycle.professionAnchors.pop()
        if (defect === 'extra-authority') set(mutated.state.careerLifecycle, 'allowHistoricalRewrite', true)
        if (defect === 'wrong-current-role') {
          const row = mutated.state.talent[0]!
          row.role = row.role === 'actor' ? 'director' : 'actor'
        }
        expect(() => builder(mutated.state), `builder${version} cannot discard ${defect} before validation`).toThrow()
      }
    })
})

describe('C.3 979 retained dated obligations stay narrow', () => {
  it('admits actual post-change director work and ordinary new-role employment', () => {
    const f = obligationControls('production'), current = envelope38(f.laterProduction!)
    expect(saveApi('validateSaveV44')(current)).toBe(current)
    const production = current.state.studio.activeProductions.find(row => row.id === f.laterProductionId)!
    expect(production).toMatchObject({ startTick: 208, directorId: FOCUS.director })
    expect(current.state.contracts.find(row => row.talentId === FOCUS.director))
      .toMatchObject({ startWeek: 208, endWeekExclusive: 260 })
    expect(current.state.careerLifecycle.records.find(row => row.personId === FOCUS.director && row.profession === 'actor'))
      .toMatchObject({ retiredWeek: 208, effectiveWeek: 208 })
  })

  it('refuses a detached player-production date that puts the actual company seat across its change', () => {
    const f = obligationControls('production'), current = envelope38(f.laterProduction!)
    expect(saveApi('validateSaveV44')(current)).toBe(current)
    const malformed = clone(current)
    malformed.state.studio.activeProductions.find(row => row.id === f.laterProductionId)!.startTick = 207
    expect(() => saveApi('validateSaveV44')(malformed)).toThrow(/straddles a retained production obligation/)
  })

  it('admits an actual later release but refuses a first-take date claiming completed work across the change', () => {
    const f = obligationControls('production'), productionId = f.laterProductionId!
    let state = f.laterProduction!
    for (let count = 0; count < 40; count++) {
      const workflow = state.operations.workflows.find(row => row.productionId === productionId)
      if (workflow?.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
        state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId: FOCUS.director }])
      }
      if (state.operations.workflows.find(row => row.productionId === productionId)?.shootingTask?.status === 'ready') {
        state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
      }
      if (state.studio.activeProductions.find(row => row.id === productionId)?.remainingTicks === 1) {
        state = applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])
      }
      state = tick(state, { develop: true })
      if (state.studio.releasedFilms.some(row => row.productionId === productionId)) break
    }
    const film = state.studio.releasedFilms.find(row => row.productionId === productionId)
    assert.ok(film, 'actual later picture must release within40 normal public ticks')
    expect(film.releaseTick).toBeGreaterThan(208)
    const takes = state.firstTakes.filter(row => row.productionId === productionId)
    expect(takes).toHaveLength(1)
    expect(takes[0]!.directorId).toBe(FOCUS.director)
    expect(takes[0]!.week).toBeGreaterThanOrEqual(208)
    expect(Object.values(takes[0]!.cast)).not.toContain(FOCUS.director)
    expect(Object.values(takes[0]!.cast)).not.toContain(FOCUS.writer)
    const current = envelope38(state)
    expect(saveApi('validateSaveV44')(current)).toBe(current)
    // Only this detached receipt date is malformed. The subject directed the
    // real new film, so neither subject's old acting/context evidence changes.
    const malformed = clone(current)
    set(malformed.state.firstTakes.find(row => row.productionId === productionId)!, 'week', 207)
    expect(() => saveApi('validateSaveV44')(malformed)).toThrow(/straddles a retained completed production obligation/)
  })

  it('refuses a detached rival company-seat substitution against an otherwise accepted actual world', () => {
    const current = acceptedChosen()
    expect(saveApi('validateSaveV44')(current)).toBe(current)
    const before = stableStringify(current), malformed = clone(current)
    const production = malformed.state.hollywood!.businesses.flatMap(row => row.productions).find(row => row.startTick < 208)
    assert.ok(production, 'genuine rival has an actual retained pre208 production')
    expect(production.directorId).not.toBe(FOCUS.director)
    production.directorId = FOCUS.director
    expect(() => saveApi('validateSaveV44')(malformed)).toThrow(/straddles a retained production obligation/)
    expect(stableStringify(current)).toBe(before)
    // This deliberately malformed snapshot tests the rival guard. It does not
    // claim the player subject was genuinely hired/worked by that rival.
  })

  it('admits actual later original drafting but refuses a claimed pre-change original commission', () => {
    const f = obligationControls('draft'), current = envelope38(f.originalDraft!)
    expect(saveApi('validateSaveV44')(current)).toBe(current)
    const project = current.state.scriptDevelopment.projects.find(row => row.id === f.draftId)!
    expect(project).toMatchObject({ commissionedWeek: 208, status: 'drafting', writerId: FOCUS.writer })
    const malformed = clone(current)
    malformed.state.scriptDevelopment.projects.find(row => row.id === f.draftId)!.commissionedWeek = 207
    expect(() => saveApi('validateSaveV44')(malformed)).toThrow(/straddles a retained original drafting obligation/)
  })

  it('admits actual secondary-writer pool joining after the change despite an earlier original commission', () => {
    const f = obligationControls('pool'), current = envelope38(f.pool!)
    expect(saveApi('validateSaveV44')(current)).toBe(current)
    const project = current.state.scriptDevelopment.projects.find(row => row.id === f.poolId)!
    expect(project.commissionedWeek).toBe(207)
    expect(project.status).toBe('drafting')
    expect(project.writerId).not.toBe(FOCUS.writer)
    expect(project.writerIds).toContain(FOCUS.writer)
    expect(person(current.state, FOCUS.writer).role).toBe('writer')
  })

  it('admits a real post-change rewrite of a screenplay completed before acting retirement', () => {
    const f = obligationControls('rewrite'), current = envelope38(f.rewrite!)
    expect(saveApi('validateSaveV44')(current)).toBe(current)
    const project = current.state.scriptDevelopment.projects.find(row => row.id === f.rewriteId)!
    expect(project).toMatchObject({ commissionedWeek: 206, status: 'rewriting', writerId: FOCUS.writer })
    expect(project.dueWeek).toBeGreaterThan(current.state.market.tick)
    expect(current.state.careerLifecycle.professionChanges.find(row => row.personId === FOCUS.writer)?.week).toBe(208)
  })

  it('admits an actual pre-change production whose permanent credited writer occupies no company seat', () => {
    const f = obligationControls('past'), current = envelope38(f.creditedWriter!)
    expect(saveApi('validateSaveV44')(current)).toBe(current)
    const production = current.state.studio.activeProductions.find(row => row.id === f.creditedProductionId)!
    expect(production).toMatchObject({ startTick: 207, writerId: FOCUS.writer })
    expect([production.directorId, ...Object.values(production.cast), ...production.craftIds]).not.toContain(FOCUS.writer)
    expect(person(current.state, FOCUS.writer).role).toBe('writer')
    expect(current.state.careerLifecycle.professionChanges.find(row => row.personId === FOCUS.writer)?.week).toBe(208)
  })
})

describe('C.3 A11 lossless empty-boundary downgrade and actual entrant authority', () => {
  it.each([PRE207, CONTINUOUS208])('downgrades untouched %s exactly, including its unexecuted prospective queue', filename => {
    const raw = c3Raw(filename), current = envelope38(migrated(filename))
    const before = stableStringify(current)
    const downgraded = migrateToV37(current)
    expect(downgraded.saveVersion).toBe(37)
    expect(exportSave(downgraded)).toBe(raw)
    expect(stableStringify(current)).toBe(before)
  })

  it('refuses loss of a genuine entrant created at the same week as the38 opening', () => {
    const boundary = migrated(PRE207), root = root38(boundary), beforeCount = boundary.talent.length
    const created = applyActions(boundary, [{ kind: 'createTalent', talent: { name: '967 Same-week entrant',
      role: 'actor', age: 30, actual: { warmth: 0, gravity: 0, physicality: 0.2 },
      potentialTier: 'Steady', workEthic: 55 } }])
    expect(created.talent).toHaveLength(beforeCount + 1)
    const entrant = created.talent.at(-1)!, current = envelope38(created)
    expect(person(created, entrant.id).role).toBe('actor')
    expect(current.state.careerLifecycle.professionAnchors.filter(anchor => anchor.personId === entrant.id))
      .toEqual([{ personId: entrant.id, profession: 'actor', recordedWeek: root.transitionBoundaryWeek, kind: 'entrant' }])
    expect(created.market.tick).toBe(root.transitionBoundaryWeek)
    expect(() => saveApi('convertV38ToV37')(current)).toThrow(/downgrade|entrant|discard/i)
    expect(boundary.talent).toHaveLength(beforeCount)
  })
})
