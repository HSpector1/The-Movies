// P14C.3, reviewed942/946. Choices consume recorded work and existing public P10
// summaries. No RNG, employer offer, payment, new credit or discipline skill write.
import { ageAt, nextBirthdayWeek } from './aging.js'
import { activeContract, busyTalentIds } from './employment.js'
import { fnv1a64 } from './math.js'
import { expectedPotentialTier, roleOVR, roleTier, workHistoryCount } from './talentSummary.js'
import { TUNING } from './tuning.js'
import { salaryCurve } from './worldgen.js'
import { compareProfessionText, compareTransitionDue } from './professionHistory.js'
import type { CreativeRole, GameState, IndustryRetirement, ProfessionChange, RetirementKey,
  TransitionContextWitness, TransitionDue, TransitionEvaluation, TransitionInputs, TransitionPictureRef,
  TransitionPotentialTier, TransitionRoleTier, TransitionTarget, TransitionTargetInput } from './types.js'

export const TRANSITION_RULES_VERSION = 1 as const
export const TRANSITION_ROLE_TIERS: readonly TransitionRoleTier[] = ['Highly unproven', 'Raw prospect',
  'Limited-or-developing', 'Strong', 'Major-studio', 'Elite', 'Generational']
export const TRANSITION_POTENTIAL_TIERS: readonly TransitionPotentialTier[] = ['Limited', 'Steady',
  'Promising', 'High Upside', 'Exceptional Upside', 'Generational Upside']
export const transitionWaitingAge = (): number => TUNING.RETIREMENT_WINDOWS.actor.hard + TUNING.PROFESSION_TRANSITION_WAIT_AGE_MARGIN
const comparePicture = (a: TransitionPictureRef, b: TransitionPictureRef) =>
  compareProfessionText(a.studioId, b.studioId) || compareProfessionText(a.pictureId, b.pictureId)
const pictureKey = (studioId: string, pictureId: string) => JSON.stringify([studioId, pictureId])

export function professionAtWeek(state: Pick<GameState, 'careerLifecycle'>, personId: string, week: number): CreativeRole {
  const anchor = state.careerLifecycle.professionAnchors.find(row => row.personId === personId)
  if (!anchor) throw new Error(`professionAtWeek: unknown person ${personId}`)
  const change = state.careerLifecycle.professionChanges.find(row => row.personId === personId)
  return change && change.week <= week ? change.to : anchor.profession
}

type Context = { contextCount: number; contextBand: 0 | 1 | 2; contextWitness: TransitionContextWitness }
type Evidence = Pick<TransitionInputs, 'actingFirstTakes' | 'leadFirstTakes' | 'actingWitnesses'> & {
  director: Context; writer: Context
}
type PicturesByCounterpart = Map<string, Map<string, TransitionPictureRef>>
function addPicture(context: PicturesByCounterpart, counterpart: string, studioId: string, pictureId: string): void {
  let pictures = context.get(counterpart)
  if (!pictures) context.set(counterpart, pictures = new Map())
  pictures.set(pictureKey(studioId, pictureId), { studioId, pictureId })
}
function strongestContext(context: PicturesByCounterpart): Context {
  let counterpartId: string | null = null, pictures: TransitionPictureRef[] = []
  for (const [id, facts] of context) {
    if (facts.size > pictures.length || facts.size === pictures.length && (counterpartId === null || compareProfessionText(id, counterpartId) < 0)) {
      counterpartId = id; pictures = [...facts.values()].sort(comparePicture)
    }
  }
  return { contextCount: pictures.length, contextBand: Math.min(2, pictures.length) as 0 | 1 | 2,
    contextWitness: { counterpartId, pictures: pictures.slice(0, TUNING.PROFESSION_TRANSITION_MIN_CONTEXT_PICTURES) } }
}

/** Historical counts use only retained dated facts. Public skills, potential and
 * work-history snapshots deliberately do not come from this reconstruction. */
export function retainedTransitionEvidence(state: Pick<GameState, 'firstTakes' | 'studio' | 'hollywood'>,
  personId: string, week: number): Evidence {
  const all = state.firstTakes.filter(take => take.week <= week && Object.values(take.cast).includes(personId))
    .sort((a, b) => a.week - b.week || compareProfessionText(a.studioId, b.studioId)
      || compareProfessionText(a.productionId, b.productionId) || compareProfessionText(a.eventId, b.eventId))
  const distinct = new Map<string, typeof all[number]>()
  for (const take of all) {
    const key = pictureKey(take.studioId, take.productionId)
    if (!distinct.has(key)) distinct.set(key, take)
  }
  const takes = [...distinct.values()]
    .sort((a, b) => a.week - b.week || compareProfessionText(a.studioId, b.studioId)
      || compareProfessionText(a.productionId, b.productionId) || compareProfessionText(a.eventId, b.eventId))
  const leads = takes.filter(take => take.cast.lead === personId)
  const directing: PicturesByCounterpart = new Map(), writing: PicturesByCounterpart = new Map()
  for (const take of leads) addPicture(directing, take.directorId, take.studioId, take.productionId)
  const h = state.hollywood
  if (h !== null) {
    for (const film of state.studio.releasedFilms) {
      if (film.releaseTick > week || !film.participants) continue
      if (Object.values(film.participants.cast).some(credit => credit.talentId === personId)) {
        addPicture(writing, film.participants.writer.talentId, h.playerStudioId, film.productionId)
      }
    }
    const entered = new Map(h.identities.map(studio => [studio.studioId, studio.enteredWeek]))
    for (const film of h.films) {
      const entry = entered.get(film.studioId)
      if (entry == null || entry > week || film.provenance === 'simulation/v1' && film.result.releaseTick > week) continue
      if (!film.credits.some(credit => credit.talentId === personId && ['lead', 'antagonist', 'support'].includes(credit.role))) continue
      for (const writer of film.credits.filter(credit => credit.role === 'writer')) addPicture(writing, writer.talentId, film.studioId, film.filmId)
    }
  }
  return { actingFirstTakes: takes.length, leadFirstTakes: leads.length,
    actingWitnesses: takes.slice(0, TUNING.PROFESSION_TRANSITION_MIN_ACTING_TAKES).map(take => take.eventId),
    director: strongestContext(directing), writer: strongestContext(writing) }
}

export function transitionInputsFor(state: GameState, personId: string, week: number): TransitionInputs {
  if (week !== state.market.tick) throw new Error('transitionInputsFor: public inputs are available only for the current week')
  const person = state.talent.find(row => row.id === personId)
  const provenance = state.talentProvenance.rows.find(row => row.personId === personId)
  if (!person || !provenance) throw new Error(`transitionInputsFor: unknown person or provenance ${personId}`)
  const { director, writer, ...evidence } = retainedTransitionEvidence(state, personId, week)
  const target = (profession: TransitionTarget, context: Context): TransitionTargetInput => {
    const discipline = profession === 'director' ? 'directing' : 'writing'
    const capability = roleOVR(person, discipline), workHistory = workHistoryCount(person, discipline)
    return { profession, capability, roleTier: roleTier(capability) as TransitionRoleTier, workHistory,
      proven: capability >= TUNING.CAPABILITY_OVR_MIN && workHistory > 0,
      potentialTier: expectedPotentialTier(person, discipline, state.seed) as TransitionPotentialTier, ...context }
  }
  return { age: ageAt(provenance, week), ...evidence, targets: [target('director', director), target('writer', writer)] }
}

type Choice = Pick<TransitionEvaluation, 'outcome' | 'selected' | 'reason'>
export function chooseProfessionTransition(inputs: TransitionInputs): Choice {
  if (inputs.age >= transitionWaitingAge()) return { outcome: 'ageBoundary', selected: null, reason: 'waitingAgeReached' }
  const eligible = inputs.targets.filter(target => inputs.age < TUNING.RETIREMENT_WINDOWS[target.profession].hard
    && target.capability >= TUNING.CAPABILITY_OVR_MIN
    && inputs.actingFirstTakes >= TUNING.PROFESSION_TRANSITION_MIN_ACTING_TAKES
    && (target.proven || target.contextCount >= TUNING.PROFESSION_TRANSITION_MIN_CONTEXT_PICTURES))
  if (eligible.length === 0) return { outcome: 'deferred', selected: null, reason: 'noEligibleTarget' }
  if (eligible.length === 1) return { outcome: 'chosen', selected: eligible[0]!.profession, reason: 'onlyEligibleTarget' }
  const tuple = (target: TransitionTargetInput) => [Number(target.proven), TRANSITION_ROLE_TIERS.indexOf(target.roleTier),
    target.contextBand, TRANSITION_POTENTIAL_TIERS.indexOf(target.potentialTier)]
  const left = tuple(eligible[0]!), right = tuple(eligible[1]!)
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) return { outcome: 'chosen', selected: eligible[left[i]! > right[i]! ? 0 : 1]!.profession, reason: 'strongerPublicTuple' }
  }
  return { outcome: 'declinedAll', selected: null, reason: 'equalPublicTuples' }
}

export function transitionInputsDigest(personId: string, week: number, source: RetirementKey, inputs: TransitionInputs): string {
  return fnv1a64(JSON.stringify([TRANSITION_RULES_VERSION, personId, week, [source.personId, source.profession],
    [inputs.age, inputs.actingFirstTakes, inputs.leadFirstTakes, inputs.actingWitnesses,
      inputs.targets.map(target => [target.profession, target.capability, target.roleTier, target.workHistory,
        target.proven, target.potentialTier, target.contextCount, target.contextBand,
        [target.contextWitness.counterpartId, target.contextWitness.pictures.map(picture => [picture.studioId, picture.pictureId])]])]]))
}

export function nextTransitionWeek(state: Pick<GameState, 'talentProvenance'>, personId: string, week: number): number {
  const row = state.talentProvenance.rows.find(candidate => candidate.personId === personId)
  if (!row) throw new Error(`profession transition: missing provenance for ${personId}`)
  return Math.min(week + TUNING.PROFESSION_TRANSITION_RECHECK_WEEKS, nextBirthdayWeek(row, transitionWaitingAge() - 1))
}

export function advanceProfessionTransitions(state: GameState, newlyRetiredKeys: readonly RetirementKey[]): GameState {
  if (state.hollywood === null) return state
  const root = state.careerLifecycle, week = state.market.tick
  const dueNow = root.transitionDue.filter(row => row.week <= week)
  if (dueNow.some(row => row.week < week)) throw new Error('profession transition: overdue reconciliation queue')
  if (dueNow.length === 0 && newlyRetiredKeys.length === 0) return state
  const people = new Map(state.talent.map(person => [person.id, person]))
  const finalIds = new Set(root.industryRetirements.map(row => row.personId))
  const subjects = new Set(dueNow.map(row => row.personId))
  for (const key of newlyRetiredKeys) {
    if (people.get(key.personId)?.role !== key.profession || finalIds.has(key.personId)) continue
    const record = root.records.find(row => row.personId === key.personId && row.profession === key.profession)
    if (record?.status === 'retired' && record.retiredWeek === week) subjects.add(key.personId)
  }
  if (subjects.size === 0) return state
  const busy = busyTalentIds(state), evaluations: TransitionEvaluation[] = [], changes: ProfessionChange[] = [], finals: IndustryRetirement[] = []
  const due: TransitionDue[] = root.transitionDue.filter(row => !subjects.has(row.personId))
  const lastEvaluation = new Map(root.transitionEvaluations.map(row => [row.personId, row]))
  let freeAgents = [...state.freeAgents]
  for (const personId of [...subjects].sort(compareProfessionText)) {
    const person = people.get(personId)
    if (!person || finalIds.has(personId)) throw new Error(`profession transition: invalid due subject ${personId}`)
    const record = root.records.find(row => row.personId === personId && row.profession === person.role)
    if (record?.status !== 'retired' || record.retiredWeek === null || record.retiredWeek > week) throw new Error(`profession transition: ${personId} has not completed the current profession`)
    if (busy.has(personId) || activeContract(state, personId, week) || state.hollywood.employment.some(row => row.terms.talentId === personId
      && row.terms.startWeek <= week && week < (row.endedWeek ?? row.terms.endWeekExclusive))) throw new Error(`profession transition: ${personId} still holds work or employment`)
    const source: RetirementKey = { personId, profession: person.role }
    if (person.role !== 'actor') {
      finals.push({ personId, week, profession: person.role, source, cause: 'noCatalogue', evaluationId: null })
      freeAgents = freeAgents.filter(id => id !== personId)
      continue
    }
    const last = lastEvaluation.get(personId)
    if (last && last.outcome !== 'deferred') throw new Error(`profession transition: ${personId} already made a terminal choice`)
    if (last && last.week === week) { due.push(...root.transitionDue.filter(row => row.personId === personId)); continue }
    const inputs = transitionInputsFor(state, personId, week), choice = chooseProfessionTransition(inputs)
    const ordinal = root.transitionEvaluations.length + evaluations.length, id = `transition-evaluation-${ordinal}`
    evaluations.push({ id, ordinal, week, personId, source, rulesVersion: TRANSITION_RULES_VERSION, inputs,
      inputsDigest: transitionInputsDigest(personId, week, source, inputs), ...choice })
    if (choice.outcome === 'chosen') {
      const destination = { ...person, role: choice.selected! }
      destination.skill = roleOVR(destination, destination.role === 'director' ? 'directing' : 'writing')
      destination.salary = salaryCurve(destination)
      people.set(personId, destination)
      const ordinal = root.professionChanges.length + changes.length
      changes.push({ id: `profession-change-${ordinal}`, ordinal, week, personId, from: 'actor', to: choice.selected!, evaluationId: id })
      if (!freeAgents.includes(personId)) freeAgents.push(personId)
    } else if (choice.outcome === 'deferred') {
      due.push({ personId, week: nextTransitionWeek(state, personId, week) })
      freeAgents = freeAgents.filter(id => id !== personId)
    } else {
      finals.push({ personId, week, profession: 'actor', source, cause: choice.outcome, evaluationId: id })
      freeAgents = freeAgents.filter(id => id !== personId)
    }
  }
  return { ...state, talent: state.talent.map(person => people.get(person.id)!), freeAgents,
    careerLifecycle: { ...root, transitionDue: due.sort(compareTransitionDue), transitionEvaluations: [...root.transitionEvaluations, ...evaluations],
      professionChanges: [...root.professionChanges, ...changes], industryRetirements: [...root.industryRetirements, ...finals] } }
}
