// Save38's prospective profession-history boundary (942/946). Historical
// readers never infer this authority from extra fields on an older envelope.
import { ageAt } from './aging.js'
import { roleTier } from './talentSummary.js'
import { TUNING } from './tuning.js'
import { productionCompanyTalentIds } from './productionPeople.js'
import { chooseProfessionTransition, nextTransitionWeek, retainedTransitionEvidence, TRANSITION_POTENTIAL_TIERS, transitionInputsDigest } from './professionTransitions.js'
import type { CareerLifecycleRootV38, CreativeRole, GameState, IndustryRetirement, ProfessionChange, RetirementKey, TransitionDue, TransitionEvaluation, TransitionInputs } from './types.js'

export const TRANSITION_ROOT_FIELDS = ['transitionBoundaryWeek', 'professionAnchors', 'transitionEvaluations',
  'professionChanges', 'industryRetirements', 'transitionDue'] as const

export const compareProfessionText = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0
export const compareTransitionDue = (a: TransitionDue, b: TransitionDue): number =>
  a.week - b.week || compareProfessionText(a.personId, b.personId)

export type ProfessionValidationContext = Readonly<{
  originalProfession(personId: string): CreativeRole | undefined
  professionAtWeek(personId: string, week: number): CreativeRole | undefined
  entrantWeek(personId: string): number | undefined
}>

export function scheduleProfessionReconciliation(state: GameState): GameState {
  const root = state.careerLifecycle
  if (state.hollywood === null || root === undefined || root.transitionBoundaryWeek === undefined) return state
  const opening = Math.max(root.transitionBoundaryWeek, state.hollywood.originWeek)
  const seen = new Set([...root.transitionDue, ...root.transitionEvaluations, ...root.industryRetirements]
    .map(row => row.personId))
  const due = root.records.filter(record => record.status === 'retired' && record.retiredWeek !== null
    && record.retiredWeek <= opening && !seen.has(record.personId))
    .map(record => ({ personId: record.personId, week: opening + 1 }))
  return due.length === 0 ? state : { ...state, careerLifecycle: { ...root,
    transitionDue: [...root.transitionDue, ...due].sort(compareTransitionDue) } }
}

export function stripProfessionHistory(raw: Record<string, unknown>): Record<string, unknown> {
  const root = raw.careerLifecycle as Record<string, unknown>
  return { ...raw, careerLifecycle: Object.fromEntries(Object.entries(root)
    .filter(([key]) => !TRANSITION_ROOT_FIELDS.includes(key as typeof TRANSITION_ROOT_FIELDS[number]))) }
}

function fail(message: string): never { throw new Error(`validateSaveV38: ${message}`) }
function object(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return fail(`${label} must be an object`)
  if (Object.keys(value).sort().join(',') !== [...keys].sort().join(',')) return fail(`${label} must carry exactly ${keys.join(', ')}`)
  return value as Record<string, unknown>
}
function integer(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) return fail(`${label} must be a safe nonnegative integer`)
  return value
}
function rows(value: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(value)) return fail(`${label} must be an array`)
  return value
}

/** Loss is checked BEFORE an old builder projects fields away. Even a same-week
 * entrant records actual creation; only existing boundary scaffolding may strip. */
export function assertProfessionHistoryDowngrade(state: object, caller: string): boolean {
  const root = (state as { careerLifecycle?: unknown }).careerLifecycle
  if (root === null || typeof root !== 'object' || !TRANSITION_ROOT_FIELDS.some(key => Object.hasOwn(root, key))) return false
  const value = root as Record<string, unknown>
  if (!Array.isArray(value.professionAnchors) || ['transitionEvaluations', 'professionChanges', 'industryRetirements']
    .some(key => !Array.isArray(value[key]) || (value[key] as unknown[]).length !== 0)
    || value.professionAnchors.some(anchor => anchor === null || typeof anchor !== 'object'
      || (anchor as { kind?: unknown }).kind !== 'existing')) {
    throw new Error(`${caller}: cannot downgrade or discard profession transition, industry retirement or entrant authority`)
  }
  return true
}

function identity(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) return fail(`${label} must be a nonempty identity`)
  return value
}
function profession(value: unknown, label: string): CreativeRole {
  if (!['actor', 'director', 'writer', 'craft', 'scientist'].includes(value as string)) return fail(`${label} is not a profession`)
  return value as CreativeRole
}
function same(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b)
    && a.length === b.length && a.every((item, index) => same(item, b[index]))
  const left = a as Record<string, unknown>, right = b as Record<string, unknown>
  const keys = Object.keys(left)
  return keys.length === Object.keys(right).length && keys.every(key => Object.hasOwn(right, key) && same(left[key], right[key]))
}
const episodeKey = (personId: string, role: CreativeRole): string => JSON.stringify([personId, role])
function retirementKey(value: unknown, personId: string): RetirementKey {
  const row = object(value, ['personId', 'profession'], 'retirement source')
  if (row.personId !== personId) fail('retirement source person must match its subject')
  return { personId, profession: profession(row.profession, 'retirement source profession') }
}
function checkInputs(value: unknown): TransitionInputs {
  const input = object(value, ['age', 'actingFirstTakes', 'leadFirstTakes', 'actingWitnesses', 'targets'], 'transition inputs')
  integer(input.age, 'input age')
  const acting = integer(input.actingFirstTakes, 'actingFirstTakes'), lead = integer(input.leadFirstTakes, 'leadFirstTakes')
  if (lead > acting) fail('leadFirstTakes exceeds actingFirstTakes')
  const witnesses = rows(input.actingWitnesses, 'actingWitnesses')
  if (witnesses.length !== Math.min(acting, TUNING.PROFESSION_TRANSITION_MIN_ACTING_TAKES)) fail('acting witness count differs from bounded evidence')
  witnesses.forEach(id => identity(id, 'acting witness'))
  const targets = rows(input.targets, 'transition targets')
  if (targets.length !== 2) fail('transition inputs need exactly director and writer targets')
  targets.forEach((value, index) => {
    const target = object(value, ['profession', 'capability', 'roleTier', 'workHistory', 'proven', 'potentialTier',
      'contextCount', 'contextBand', 'contextWitness'], `transition targets[${index}]`)
    if (target.profession !== (index === 0 ? 'director' : 'writer')) fail('transition target order must be director, writer')
    const capability = integer(target.capability, 'target capability'), history = integer(target.workHistory, 'target workHistory')
    if (capability < 1 || capability > 99) fail('target capability must be within1..99')
    if (target.roleTier !== roleTier(capability)) fail('target roleTier disagrees with its public capability')
    if (target.proven !== (capability >= TUNING.CAPABILITY_OVR_MIN && history > 0)) fail('target proven disagrees with capability/workHistory snapshot')
    if (!TRANSITION_POTENTIAL_TIERS.includes(target.potentialTier as never)) fail('unknown public potential tier')
    const count = integer(target.contextCount, 'target contextCount')
    if (target.contextBand !== Math.min(2, count)) fail('target contextBand disagrees with exact count')
    const witness = object(target.contextWitness, ['counterpartId', 'pictures'], 'contextWitness')
    if (count === 0 ? witness.counterpartId !== null : typeof witness.counterpartId !== 'string' || witness.counterpartId.length === 0) fail('context counterpart must exist exactly with context')
    const pictures = rows(witness.pictures, 'context witness pictures')
    if (pictures.length !== Math.min(count, TUNING.PROFESSION_TRANSITION_MIN_CONTEXT_PICTURES)) fail('context witness length is not the bounded count')
    pictures.forEach(value => {
      const picture = object(value, ['studioId', 'pictureId'], 'context picture')
      identity(picture.studioId, 'context studio'); identity(picture.pictureId, 'context picture id')
    })
  })
  return input as unknown as TransitionInputs
}

/** Prove all new authority before any private historical delegate sees it. The
 * returned closures capture copied scalar facts, never caller-owned mutable rows. */
export function validateProfessionHistory(raw: Record<string, unknown>): ProfessionValidationContext {
  const root = object(raw.careerLifecycle, ['boundaryWeek', 'records', 'cohorts', ...TRANSITION_ROOT_FIELDS], 'careerLifecycle')
  const tick = integer((raw.market as { tick?: unknown } | undefined)?.tick, 'market.tick')
  const boundary = integer(root.transitionBoundaryWeek, 'careerLifecycle.transitionBoundaryWeek')
  if (boundary > tick || boundary < integer(root.boundaryWeek, 'careerLifecycle.boundaryWeek')) fail('transition boundary is outside recorded campaign history')
  const talent = rows(raw.talent, 'talent') as readonly { id: string; role: CreativeRole }[]
  const anchors = rows(root.professionAnchors, 'professionAnchors')
  if (anchors.length !== talent.length) fail('professionAnchors must name every person once in talent order')
  const originals = new Map<string, CreativeRole>(), entrantWeeks = new Map<string, number>()
  const state = raw as unknown as GameState
  const provenance = new Map(state.talentProvenance.rows.map(row => [row.personId, row]))
  for (const [index, value] of anchors.entries()) {
    const anchor = object(value, ['personId', 'profession', 'recordedWeek', 'kind'], `professionAnchors[${index}]`)
    const person = talent[index]!
    if (identity(anchor.personId, 'profession anchor person') !== person.id || originals.has(person.id)) fail('professionAnchors identity or order mismatch')
    const role = profession(anchor.profession, 'anchor profession'), week = integer(anchor.recordedWeek, 'profession anchor recordedWeek')
    const row = provenance.get(person.id)
    if (!row) fail('profession anchor has no age provenance')
    if (anchor.kind === 'existing') {
      if (week !== boundary) fail('existing profession anchor must equal transition boundary')
      if (integer(row.kind === 'authored_exact_week' ? row.entryWeek : row.migrationWeek, 'profession anchor presence') > boundary) fail('existing profession anchor predates the person’s observed presence')
    } else if (anchor.kind === 'entrant') {
      if (week < boundary || week > tick || row.kind !== 'authored_exact_week' || row.entryWeek !== week) fail('entrant profession anchor must match actual entry provenance')
      entrantWeeks.set(person.id, week)
    } else fail('unknown profession anchor kind')
    originals.set(person.id, role)
  }
  const dated = (value: unknown, label: string) => {
    const week = integer(value, label)
    if (week <= boundary || week > tick) fail(`${label} must be after the transition boundary and at/before the campaign week`)
    return week
  }
  const known = (value: unknown) => {
    const id = identity(value, 'profession history person')
    if (!originals.has(id)) fail(`profession history names unknown person ${id}`)
    return id
  }
  const present = (personId: string, week: number) => {
    if ((entrantWeeks.get(personId) ?? 0) > week) fail('profession event precedes the person’s actual creation')
  }
  const ordered = (prior: { week: number; personId: string } | undefined, row: { week: number; personId: string }, label: string) => {
    if (prior && compareTransitionDue(prior, row) >= 0) fail(`${label} must follow actual week/person processing order`)
  }
  const evaluations: TransitionEvaluation[] = []
  const evaluationsByPerson = new Map<string, TransitionEvaluation[]>()
  for (const [ordinal, value] of rows(root.transitionEvaluations, 'transitionEvaluations').entries()) {
    const row = object(value, ['id', 'ordinal', 'week', 'personId', 'source', 'rulesVersion', 'inputs', 'inputsDigest', 'outcome', 'selected', 'reason'], `transitionEvaluations[${ordinal}]`)
    const personId = known(row.personId), week = dated(row.week, 'evaluation week')
    present(personId, week)
    if (row.ordinal !== ordinal || row.id !== `transition-evaluation-${ordinal}` || row.rulesVersion !== 1) fail('evaluation ordinal/id/rulesVersion mismatch')
    const source = retirementKey(row.source, personId)
    if (source.profession !== 'actor' || originals.get(personId) !== 'actor') fail('transition catalogue requires original actor retirement')
    const inputs = checkInputs(row.inputs)
    if (inputs.age !== ageAt(provenance.get(personId)!, week)) fail('evaluation age differs from immutable provenance')
    const evidence = retainedTransitionEvidence(state, personId, week)
    if (inputs.actingFirstTakes !== evidence.actingFirstTakes || inputs.leadFirstTakes !== evidence.leadFirstTakes
      || !same(inputs.actingWitnesses, evidence.actingWitnesses)) fail('acting counts or bounded witness differ from retained evidence')
    for (const target of inputs.targets) {
      const actual = evidence[target.profession]
      if (target.contextCount !== actual.contextCount || target.contextBand !== actual.contextBand
        || !same(target.contextWitness, actual.contextWitness)) fail('target context count or bounded witness differs from retained evidence')
    }
    if (typeof row.inputsDigest !== 'string' || !/^[0-9a-f]{16}$/.test(row.inputsDigest)
      || row.inputsDigest !== transitionInputsDigest(personId, week, source, inputs)) fail('transition inputsDigest differs from the canonical recorded question')
    const choice = chooseProfessionTransition(inputs)
    if (!same({ outcome: row.outcome, selected: row.selected, reason: row.reason }, choice)) fail('transition outcome/selection/reason differs from deterministic public choice')
    const evaluation = row as unknown as TransitionEvaluation
    ordered(evaluations.at(-1), evaluation, 'transition evaluations')
    evaluations.push(evaluation)
    const list = evaluationsByPerson.get(personId) ?? []
    list.push(evaluation); evaluationsByPerson.set(personId, list)
  }
  const changes: ProfessionChange[] = [], changeOf = new Map<string, ProfessionChange>()
  for (const [ordinal, value] of rows(root.professionChanges, 'professionChanges').entries()) {
    const row = object(value, ['id', 'ordinal', 'week', 'personId', 'from', 'to', 'evaluationId'], `professionChanges[${ordinal}]`)
    const personId = known(row.personId), week = dated(row.week, 'profession change week')
    present(personId, week)
    if (row.ordinal !== ordinal || row.id !== `profession-change-${ordinal}` || row.from !== 'actor'
      || row.to !== 'director' && row.to !== 'writer' || originals.get(personId) !== 'actor') fail('invalid profession change catalogue/ordinal/id')
    if (changeOf.has(personId)) fail('a person cannot change profession twice')
    const evaluation = evaluations.find(candidate => candidate.id === row.evaluationId)
    if (!evaluation || evaluation.personId !== personId || evaluation.week !== week || evaluation.outcome !== 'chosen' || evaluation.selected !== row.to) fail('profession change has no matching chosen evaluation')
    const change = row as unknown as ProfessionChange
    ordered(changes.at(-1), change, 'profession changes'); changes.push(change); changeOf.set(personId, change)
  }
  for (const person of talent) {
    if (person.role !== (changeOf.get(person.id)?.to ?? originals.get(person.id))) fail('current profession changed without its anchored change history')
  }
  const finalOf = new Map<string, IndustryRetirement>(), finals: IndustryRetirement[] = []
  for (const value of rows(root.industryRetirements, 'industryRetirements')) {
    const row = object(value, ['personId', 'week', 'profession', 'source', 'cause', 'evaluationId'], 'industry retirement')
    const personId = known(row.personId), week = dated(row.week, 'industry retirement week'), role = profession(row.profession, 'industry retirement profession')
    present(personId, week)
    const source = retirementKey(row.source, personId)
    if (source.profession !== role || role !== (changeOf.get(personId)?.to ?? originals.get(personId)) || finalOf.has(personId)) fail('industry retirement episode/identity mismatch')
    if (row.cause === 'noCatalogue') {
      if (role === 'actor' || row.evaluationId !== null) fail('noCatalogue finality requires a non-actor and no evaluation')
    } else {
      if (row.cause !== 'declinedAll' && row.cause !== 'ageBoundary' || role !== 'actor') fail('unknown industry finality cause')
      const evaluation = evaluations.find(candidate => candidate.id === row.evaluationId)
      if (!evaluation || evaluation.personId !== personId || evaluation.week !== week || evaluation.outcome !== row.cause) fail('industry retirement has no matching final evaluation')
    }
    const finality = row as unknown as IndustryRetirement
    ordered(finals.at(-1), finality, 'industry retirements'); finals.push(finality); finalOf.set(personId, finality)
  }
  const records = rows(root.records, 'careerLifecycle.records') as CareerLifecycleRootV38['records']
  const recordOf = new Map<string, typeof records[number]>()
  for (const record of records) {
    const personId = known(record.personId), role = profession(record.profession, 'retirement profession'), key = episodeKey(personId, role)
    if (recordOf.has(key)) fail('duplicate person/profession retirement episode')
    recordOf.set(key, record)
  }
  const h = state.hollywood
  const opening = h === null ? null : Math.max(boundary, integer(h.originWeek, 'hollywood.originWeek'))
  if (opening !== null && opening > tick) fail('industry reconciliation opening is after the current week')
  if (opening === null && (evaluations.length || changes.length || finals.length)) fail('dormant industry cannot carry executed profession decisions')
  const expectedDue: TransitionDue[] = []
  for (const record of records) {
    if (record.status !== 'retired' || record.retiredWeek === null || opening === null) continue
    const retiredWeek = integer(record.retiredWeek, 'completed profession retirement week'), personId = record.personId
    let due = retiredWeek <= opening ? opening + 1 : retiredWeek
    if (record.profession === 'actor') {
      let terminal = false
      for (const evaluation of evaluationsByPerson.get(personId) ?? []) {
        if (terminal || evaluation.week !== due) fail('evaluation is outside its exact retirement/recheck chronology')
        if (evaluation.outcome === 'deferred') due = nextTransitionWeek(state, personId, evaluation.week)
        else {
          terminal = true
          if (evaluation.outcome === 'chosen') {
            if (changeOf.get(personId)?.evaluationId !== evaluation.id) fail('chosen evaluation is missing its one profession change')
          } else if (finalOf.get(personId)?.evaluationId !== evaluation.id) fail('final evaluation is missing its industry retirement')
        }
      }
      if (!terminal) {
        if (due <= tick) fail('completed acting retirement is missing its due evaluation')
        expectedDue.push({ personId, week: due })
      }
    } else {
      const finality = finalOf.get(personId)
      if (due <= tick) {
        if (!finality || finality.cause !== 'noCatalogue' || finality.week !== due || finality.profession !== record.profession) fail('non-catalogue retirement is missing its exact finality')
      } else {
        if (finality) fail('industry retirement is premature')
        expectedDue.push({ personId, week: due })
      }
    }
  }
  for (const evaluation of evaluations) {
    const record = recordOf.get(episodeKey(evaluation.personId, 'actor'))
    if (record?.status !== 'retired' || record.retiredWeek === null || record.retiredWeek > evaluation.week) fail('evaluation lacks completed acting retirement predecessor')
  }
  for (const finality of finals) {
    const record = recordOf.get(episodeKey(finality.personId, finality.profession))
    if (record?.status !== 'retired' || record.retiredWeek === null || record.retiredWeek > finality.week) fail('industry retirement lacks a completed profession predecessor')
  }
  const due = rows(root.transitionDue, 'transitionDue').map((value, index) => {
    const row = object(value, ['personId', 'week'], `transitionDue[${index}]`)
    const personId = known(row.personId), week = integer(row.week, 'transitionDue.week')
    if (week <= tick) fail('transitionDue must be strictly after the current week')
    return { personId, week }
  })
  if (!same(due, expectedDue.sort(compareTransitionDue))) fail('transitionDue differs from exact prospective reconciliation or deferred schedule')
  // A retained old binding cannot straddle a change. Later new-role intervals
  // starting at/after that change are legitimate and remain independently capped.
  for (const change of changes) {
    const intervals = [...state.contracts.filter(row => row.talentId === change.personId)
      .map(row => ({ start: row.startWeek, end: row.endWeekExclusive })),
      ...(h?.employment ?? []).filter(row => row.terms.talentId === change.personId)
        .map(row => ({ start: row.terms.startWeek, end: row.endedWeek ?? row.terms.endWeekExclusive }))]
    if (intervals.some(row => row.start < change.week && row.end > change.week)) fail('profession change straddles an existing employment obligation')
    const productions = [...state.studio.activeProductions, ...(h?.businesses ?? []).flatMap(b => b.productions)]
    if (productions.some(p => p.startTick < change.week && productionCompanyTalentIds([p]).has(change.personId))) {
      fail('profession change straddles a retained production obligation')
    }
    // A retained first take and later release prove a company seat was occupied
    // across the change. Credits alone, including permanent writer credits, do not.
    for (const take of state.firstTakes) {
      if (take.week >= change.week || (take.directorId !== change.personId && !Object.values(take.cast).includes(change.personId))) continue
      const release = take.studioId === h?.playerStudioId
        ? state.studio.releasedFilms.find(f => f.productionId === take.productionId)?.releaseTick
        : h?.films.find(f => f.studioId === take.studioId && f.filmId === take.productionId && f.provenance === 'simulation/v1')
      const releaseWeek = typeof release === 'number' ? release : release?.provenance === 'simulation/v1' ? release.result.releaseTick : undefined
      if (releaseWeek !== undefined && releaseWeek > change.week) fail('profession change straddles a retained completed production obligation')
    }
    // Commission dates establish the start of an unfinished original draft.
    // They do not date a later rewrite or a secondary writer's pool admission,
    // either of which may lawfully begin after a change.
    const scripts = [state.scriptDevelopment, ...(h?.businesses ?? []).map(b => b.development)]
    if (scripts.some(d => d.projects.some(p => p.status === 'drafting' && p.commissionedWeek < change.week
      && p.writerId === change.personId))) fail('profession change straddles a retained original drafting obligation')
  }
  // Only copied scalar facts escape. No reader receives mutable source rows or
  // a general exemption from its own identity/chronology/financial validation.
  const immutableChanges = new Map(changes.map(row => [row.personId, Object.freeze({ week: row.week, to: row.to })]))
  return Object.freeze({
    originalProfession: (personId: string) => originals.get(personId),
    professionAtWeek: (personId: string, week: number) => {
      const change = immutableChanges.get(personId)
      return change && change.week <= week ? change.to : originals.get(personId)
    },
    entrantWeek: (personId: string) => entrantWeeks.get(personId),
  })
}
