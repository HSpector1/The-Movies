// 1041/1047/1053: one real2600→3329 route; only the initial disclosed funding
// arrangement is synthetic. No alternate subject, rescue or replay trajectory.
import assert from 'node:assert/strict'
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { contractEndRefusal, retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds, canAfford, hiringMarketIds } from '../../src/core/employment.js'
import { convertV35ToV36, convertV36ToV37, exportSave, importSave, makeSave, migrateToLive,
  stableStringify, validateSaveV35, validateSaveV37 } from '../../src/core/save.js'
import { caseForTalent, openMarketCaseFor, playerOffer, submitProposal } from '../../src/core/talentMarket.js'
import { careerIdentity } from '../../src/core/talentSummary.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import type { Action, FilmCreativeRole, GameState, TalentMarketCaseV36 } from '../../src/core/types.js'
import { c2bFixture, liveEnvelope } from './p14c2b-fixtures.js'
import { clone, person, sha } from './p14c3-fixtures.js'
import { acceptedEvidence, greenlightEvidence } from './p14c3-genuine-evidence-fixtures.js'

export const COHORT_SUBJECT = 'person-cohort-832-actor-0'
export const COHORT_STAGE = 'facility-soundstage-07'
export const RENEWALS = [
  { open: 2796, decision: 2808, term: 208, end: 3016 },
  { open: 3004, decision: 3016, term: 208, end: 3224 },
  { open: 3212, decision: 3224, term: 52, end: 3276 },
] as const
type Cached<T> = { ok: true; value: T } | { ok: false; error: unknown }
const cache = new Map<string, Cached<unknown>>()
let calls = 0
const observations: Record<string, unknown> = {}
function memo<T>(key: string, build: () => T): T {
  const prior = cache.get(key) as Cached<T> | undefined
  if (prior) { if (!prior.ok) throw prior.error; return clone(prior.value) }
  try { const value = build(); cache.set(key, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(key, { ok: false, error }); throw error }
}
export function recordCohortRoute(name: string, value: unknown): void { observations[name] = clone(value) }
export function cohortRouteAccounting() { return { calls, maximumCalls: 729, maximumWeek: 3329, observations: clone(observations) } }
function step(state: GameState): GameState {
  assert.ok(calls < 729, '1053 single-route729-call ceiling')
  expect(state.market.tick).toBe(2600 + calls)
  assert.ok(state.market.tick < 3329, '1053 maximum world3329')
  calls++
  const next = tick(state, { develop: true })
  expect(next.market.tick).toBe(2600 + calls)
  if (next.market.tick < 3231) expect(retirementRecordFor(next, COHORT_SUBJECT, 'actor'), 'no premature idle notice during real retention').toBeUndefined()
  if (next.market.tick < 3283) {
    expect(person(next, COHORT_SUBJECT).role).toBe('actor')
    expect(next.careerLifecycle.transitionEvaluations.filter(row => row.personId === COHORT_SUBJECT)).toEqual([])
  }
  return next
}
function toWeek(state: GameState, week: number): GameState {
  assert.ok(Number.isSafeInteger(week) && week >= state.market.tick && week <= 3329)
  while (state.market.tick < week) state = step(state)
  return state
}
function act(state: GameState, action: Action): GameState { return applyActions(state, [action]) }
export function reloadCohort(state: GameState): GameState {
  acceptedEvidence(state)
  const raw = exportSave(makeSave(state)), loaded = migrateToLive(importSave(raw)).state
  expect(exportSave(makeSave(loaded))).toBe(raw)
  acceptedEvidence(loaded)
  return loaded
}
export function cohortEmployment(state: GameState, start: number, end: number) {
  assert.ok(state.hollywood)
  const rows = state.hollywood.employment.filter(row => row.studioId === state.hollywood!.playerStudioId
    && row.terms.talentId === COHORT_SUBJECT && row.terms.startWeek === start && row.terms.endWeekExclusive === end)
  expect(rows).toHaveLength(1)
  return rows[0]!
}
export function cohortCase(state: GameState, opened: number, variant: TalentMarketCaseV36['variant']) {
  const cases = state.talentMarket.cases.filter(row => row.talentId === COHORT_SUBJECT && row.openedWeek === opened && row.variant === variant)
  expect(cases).toHaveLength(1)
  return cases[0]!
}
function hire(state: GameState, id: string, termWeeks: 52 | 208): GameState {
  const week = state.market.tick, quote = playerOffer(state, id, termWeeks, week)
  expect(hiringMarketIds(state)).toContain(id)
  expect(activeContract(state, id)).toBeUndefined()
  expect(canAfford(state, quote.signingBonus).ok).toBe(true)
  const next = act(state, { kind: 'signContract', talentId: id, termWeeks })
  expect(activeContract(next, id)).toMatchObject({ talentId: id, startWeek: week, endWeekExclusive: week + termWeeks,
    termWeeks, annualSalary: quote.annualSalary, signingBonus: quote.signingBonus })
  expect(next.studio.cash).toBe(state.studio.cash - quote.signingBonus)
  expect(next.ledger.slice(state.ledger.length)).toEqual([
    expect.objectContaining({ kind: 'signingBonus', talentId: id, week, amount: -quote.signingBonus }),
  ])
  const entries = next.hollywood!.employment.filter(row => row.terms.talentId === id && row.terms.startWeek === week)
  expect(entries).toHaveLength(1)
  expect(entries[0]).toMatchObject({ studioId: next.hollywood!.playerStudioId, endedWeek: null, reason: 'player-contract' })
  expect(entries[0]!.terms).toEqual(activeContract(next, id))
  acceptedEvidence(next)
  return next
}
function addYoung(state: GameState, role: FilmCreativeRole, term: 52 | 208, label: string) {
  const six = (n: number) => [n, n, n, n, n, n], discipline = { actor: 'acting', director: 'directing', writer: 'writing', craft: 'craft' }[role]
  const skills = { acting: six(20), directing: six(20), writing: six(20), craft: six(20), research: six(1) }
  const primary = role === 'actor' ? 'acting' : role === 'director' ? 'directing' : role === 'writer' ? 'writing' : 'craft'
  skills[primary] = six(75)
  let next = act(state, { kind: 'createCustomTalent', talent: { name: `1053 ${label}`, role, age: 30,
    workEthic: 55, fame: 25, actual: { warmth: 0, gravity: 0, physicality: 0.2 }, skills } })
  expect(next.talent).toHaveLength(state.talent.length + 1)
  const id = next.talent.at(-1)!.id
  expect(state.talent.some(row => row.id === id)).toBe(false)
  expect(next.talent.slice(0, state.talent.length)).toEqual(state.talent)
  expect(next.careerLifecycle.professionAnchors.slice(0, state.talent.length)).toEqual(state.careerLifecycle.professionAnchors)
  expect(next.talentProvenance.rows.slice(0, state.talentProvenance.rows.length)).toEqual(state.talentProvenance.rows)
  expect(next.careerLifecycle.professionAnchors.at(-1)).toEqual({ personId: id, profession: role, kind: 'entrant', recordedWeek: state.market.tick })
  expect(next.talentProvenance.rows.at(-1)).toEqual({ personId: id, kind: 'authored_exact_week', ageAtEntry: 30, entryWeek: state.market.tick })
  expect(careerIdentity(person(next, id)).disciplines.find(row => row.discipline === discipline)?.workHistory).toBe(0)
  next = hire(next, id, term)
  return { state: next, id }
}
function refreshSet(state: GameState): GameState {
  const start = state.market.tick, mounted = state.sets.filter(row => row.mountedOn === COHORT_STAGE && row.status !== 'retired')
  expect(mounted.length).toBeLessThanOrEqual(1)
  if (mounted[0]) state = act(state, { kind: 'strikeSet', setId: mounted[0].id })
  state = act(state, { kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: COHORT_STAGE } })
  expect(TUNING.SET_BUILD_WEEKS_BAND_HIGH).toBe(8)
  state = toWeek(state, start + 8)
  expect(state.sets.filter(row => row.mountedOn === COHORT_STAGE && row.status === 'standing')).toHaveLength(1)
  acceptedEvidence(state)
  return state
}
type Team = { directorId: string; writerId: string; craftId: string; cast: { lead: string; antagonist: string; support: string } }
function greenlight(state: GameState, team: Team) {
  for (const id of [team.directorId, team.writerId, team.craftId, ...Object.values(team.cast)]) {
    expect(activeContract(state, id)).toBeDefined()
    expect(busyTalentIds(state).has(id)).toBe(false)
  }
  const made = greenlightEvidence(state, { directorId: team.directorId, writerId: team.writerId, craftIds: [team.craftId], cast: team.cast })
  expect(made.state.studio.activeProductions.find(row => row.id === made.productionId))
    .toMatchObject({ directorId: team.directorId, writerId: team.writerId, craftIds: [team.craftId], cast: team.cast })
  return made
}
function release(input: GameState, productionId: string, team: Team, limit: 32 | 40): GameState {
  let state = input
  for (let i = 0; i < limit; i++) {
    const workflow = state.operations.workflows.find(row => row.productionId === productionId)
    if (workflow?.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned')
      state = act(state, { kind: 'assignShootingDirector', productionId, directorId: team.directorId })
    if (state.operations.workflows.find(row => row.productionId === productionId)?.shootingTask?.status === 'ready')
      state = act(state, { kind: 'scheduleShootingTake', productionId })
    if (state.studio.activeProductions.find(row => row.id === productionId)?.remainingTicks === 1)
      state = act(state, { kind: 'commitPictureToRelease', productionId })
    state = step(state)
    const film = state.studio.releasedFilms.find(row => row.productionId === productionId)
    if (film) {
      expect(film.participants).toMatchObject({ director: { talentId: team.directorId }, writer: { talentId: team.writerId },
        cast: { lead: { talentId: team.cast.lead }, antagonist: { talentId: team.cast.antagonist }, support: { talentId: team.cast.support } } })
      const takes = state.firstTakes.filter(row => row.productionId === productionId && row.studioId === state.hollywood!.playerStudioId)
      expect(takes).toHaveLength(1)
      expect(takes[0]).toMatchObject({ directorId: team.directorId, cast: team.cast })
      acceptedEvidence(state)
      recordCohortRoute(`film${state.studio.releasedFilms.length}`, { productionId, take: takes[0]!.week, release: film.releaseTick,
        returnedWeek: state.market.tick, calls: i + 1, directorId: team.directorId, writerId: team.writerId })
      return state
    }
  }
  throw new Error(`1053 actual release premise absent after${limit} calls; no extra route permitted`)
}
export function cohortSetup() {
  return memo('setup2600', () => {
    const old = liveEnvelope(c2bFixture('genuine-v35-c2b-rival-incumbent-cohorts')), oldBytes = stableStringify(old)
    expect(validateSaveV35(old)).toBe(old)
    const old37 = convertV36ToV37(convertV35ToV36(old))
    expect(validateSaveV37(old37)).toBe(old37)
    const untouched = migrateToLive(old).state, id = COHORT_SUBJECT
    acceptedEvidence(untouched)
    expect(untouched.market.tick).toBe(2600)
    expect(person(untouched, id)).toMatchObject({ name: 'Carole Brandt', role: 'actor', age: 57, workEthic: 77 })
    expect(untouched.talentProvenance.rows.find(row => row.personId === id))
      .toEqual({ personId: id, kind: 'authored_exact_week', entryWeek: 832, ageAtEntry: 23.874552652348545 })
    expect(untouched.careerLifecycle.professionAnchors.find(row => row.personId === id))
      .toEqual({ personId: id, profession: 'actor', kind: 'existing', recordedWeek: 2600 })
    const publicCareer = careerIdentity(person(untouched, id))
    expect(publicCareer.disciplines.find(row => row.discipline === 'directing')).toMatchObject({ ovr: 69, workHistory: 0, proven: false })
    expect(publicCareer.disciplines.find(row => row.discipline === 'writing')).toMatchObject({ ovr: 13, workHistory: 0, proven: false })
    expect(untouched.hollywood!.employment.filter(row => row.terms.talentId === id)).toEqual([])
    expect(untouched.hollywood!.films.filter(row => row.credits.some(credit => credit.talentId === id))).toEqual([])
    expect(untouched.firstTakes.filter(row => Object.values(row.cast).includes(id))).toEqual([])
    expect(untouched.careerEvents.filter(row => row.talentId === id)).toEqual([])
    expect(untouched.careerLifecycle.records.filter(row => row.personId === id)).toEqual([])
    expect(untouched.freeAgents).toContain(id); expect(hiringMarketIds(untouched)).toContain(id)
    expect(contractEndRefusal(untouched, id, 2652)).toBeNull()
    expect(untouched.studio.cash).toBe(-19_000_000)
    expect(untouched.contracts).toEqual([]); expect(untouched.studio.releasedFilms).toEqual([])
    expect(untouched.scriptDevelopment.mode).toBe('legacy')
    expect(untouched.concepts.filter(row => !untouched.studio.activeProductions.some(film => film.conceptId === row.id)
      && !untouched.studio.releasedFilms.some(film => film.conceptId === row.id)
      && !untouched.scriptDevelopment.projects.some(project => project.conceptId === row.id)).length).toBeGreaterThanOrEqual(4)
    const funded: GameState = { ...clone(untouched), studio: { ...untouched.studio, cash: 30_000_000 },
      ledger: [...untouched.ledger, { week: 2600, kind: 'studioRevenue', amount: 49_000_000,
        note: '1053 disclosed test bootstrap; not earned revenue; one initial funding arrangement only' }] }
    expect(stableStringify({ ...funded, studio: { ...funded.studio, cash: untouched.studio.cash }, ledger: untouched.ledger })).toBe(stableStringify(untouched))
    acceptedEvidence(funded)
    recordCohortRoute('funding', { untouchedCanonicalSha256: sha(stableStringify(untouched)),
      fundedCanonicalSha256: sha(stableStringify(funded)), oldCash: -19_000_000, cash: 30_000_000, delta: 49_000_000 })
    let state = hire(funded, id, 208)
    const director = addYoung(state, 'director', 208, 'initial Director'); state = director.state
    const writer = addYoung(state, 'writer', 208, 'initial Writer'); state = writer.state
    const craft = addYoung(state, 'craft', 208, 'initial Craft'); state = craft.state
    const antagonist = addYoung(state, 'actor', 208, 'initial antagonist'); state = antagonist.state
    const support = addYoung(state, 'actor', 208, 'initial support'); state = support.state
    const team: Team = { directorId: director.id, writerId: writer.id, craftId: craft.id,
      cast: { lead: id, antagonist: antagonist.id, support: support.id } }
    expect(stableStringify(old)).toBe(oldBytes)
    acceptedEvidence(state)
    return { old, old37, untouched, funded, state, team }
  })
}
export function cohortThreeFilms() {
  return memo('three-films', () => {
    const setup = cohortSetup(), { team } = setup
    let state = refreshSet(setup.state)
    const pictureIds: string[] = []
    for (let n = 0; n < 3; n++) {
      const made = greenlight(state, team)
      state = release(made.state, made.productionId, team, 40)
      pictureIds.push(made.productionId)
    }
    expect(state.market.tick).toBeLessThanOrEqual(2728)
    expect(new Set(pictureIds).size).toBe(3)
    const publicCareer = careerIdentity(person(state, COHORT_SUBJECT))
    expect(publicCareer.disciplines.find(row => row.discipline === 'directing')!.ovr).toBeGreaterThanOrEqual(60)
    expect(publicCareer.disciplines.find(row => row.discipline === 'writing')!.ovr).toBeLessThan(60)
    return { state, team, pictureIds }
  })
}
function renew(prior: GameState, spec: typeof RENEWALS[number]) {
  const id = COHORT_SUBJECT
  expect(Math.max(...TUNING.MARKET_PREMIUM_TIERS)).toBe(1.25)
  let state = toWeek(prior, spec.open)
  const opened = clone(state), current = activeContract(state, id)
  assert.ok(current)
  expect(current.endWeekExclusive).toBe(spec.decision)
  expect(retirementRecordFor(state, id, 'actor')).toBeUndefined()
  const kase = cohortCase(state, spec.open, 'expiry')
  expect(kase).toMatchObject({ subjectStudioId: state.hollywood!.playerStudioId,
    contractId: cohortEmployment(state, current.startWeek, spec.decision).contractId, outcome: null, closedWeek: null })
  expect(openMarketCaseFor(state, id)).toEqual(kase)
  expect(caseForTalent(state, id)).toMatchObject({ openedWeek: spec.open, decisionWeek: spec.decision })
  state = submitProposal(state, { talentId: id, issuerStudioId: state.hollywood!.playerStudioId,
    termWeeks: spec.term, premiumTier: 1.25 })
  expect(state.contracts).toEqual(opened.contracts); expect(state.ledger).toEqual(opened.ledger)
  expect(state.studio.cash).toBe(opened.studio.cash); expect(state.hollywood!.employment).toEqual(opened.hollywood!.employment)
  const own = state.talentMarket.proposals.filter(row => row.talentId === id && row.issuerStudioId === state.hollywood!.playerStudioId)
  expect(own).toEqual([expect.objectContaining({ submittedWeek: spec.open, startWeek: spec.decision,
    termWeeks: spec.term, premiumTier: 1.25, promises: [], representation: null })])
  acceptedEvidence(state)
  const submitted = clone(state)
  state = toWeek(state, spec.decision - 1)
  const beforeDecision = clone(state)
  state = toWeek(state, spec.decision)
  expect(activeContract(state, id), 'actual player win is required; no forced owner or retry')
    .toMatchObject({ startWeek: spec.decision, endWeekExclusive: spec.end, termWeeks: spec.term })
  expect(cohortCase(state, spec.open, 'expiry')).toMatchObject({ outcome: 'settled', closedWeek: spec.decision })
  expect(state.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([])
  expect(retirementRecordFor(state, id, 'actor')).toBeUndefined()
  acceptedEvidence(state)
  recordCohortRoute(`renewal${spec.decision}`, { ...spec, salary: activeContract(state, id)!.annualSalary,
    signingBonus: activeContract(state, id)!.signingBonus, cash: state.studio.cash })
  return { opened, submitted, beforeDecision, state, spec, previousStart: current.startWeek }
}
export function cohortRenewalOne() { return memo('renewal2808', () => renew(cohortThreeFilms().state, RENEWALS[0])) }
export function cohortRenewalTwo() { return memo('renewal3016', () => renew(cohortRenewalOne().state, RENEWALS[1])) }
export function cohortRenewalThree() { return memo('renewal3224', () => renew(cohortRenewalTwo().state, RENEWALS[2])) }
export function cohortNoticeGap() {
  return memo('notice-and-gap3282', () => {
    const id = COHORT_SUBJECT
    let state = toWeek(cohortRenewalThree().state, 3230)
    expect(retirementRecordFor(state, id, 'actor')).toBeUndefined()
    const beforeNotice = clone(state)
    state = toWeek(state, 3231)
    expect(person(state, id).age).toBe(70)
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ profession: 'actor', status: 'announced', cause: 'hardBoundary',
      announcedWeek: 3231, ageAtAnnouncement: 70, effectiveWeek: 3283, extensionUsed: false, extendedFromWeek: null })
    acceptedEvidence(state)
    const notice = clone(state)
    state = toWeek(state, 3271)
    expect(cohortCase(state, 3271, 'retirementExtension')).toMatchObject({ subjectStudioId: state.hollywood!.playerStudioId,
      contractId: cohortEmployment(state, 3224, 3276).contractId, outcome: null, closedWeek: null })
    expect(caseForTalent(state, id)).toMatchObject({ decisionWeek: 3276, openedWeek: 3271 })
    expect(3283 + 52 - 3276).toBe(59)
    expect(state.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([])
    const window = clone(state)
    state = toWeek(state, 3276)
    expect(cohortCase(state, 3271, 'retirementExtension')).toMatchObject({ outcome: 'expired', closedWeek: 3276 })
    expect(activeContract(state, id)).toBeUndefined(); expect(busyTalentIds(state).has(id)).toBe(false)
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'announced', effectiveWeek: 3283, extensionUsed: false })
    acceptedEvidence(state)
    const expired = clone(state), beforeAttempt = stableStringify(state)
    expect(() => act(state, { kind: 'signContract', talentId: id, termWeeks: 52 })).toThrow(/retirementAnnounced/)
    expect(stableStringify(state)).toBe(beforeAttempt)
    state = toWeek(state, 3282)
    expect(activeContract(state, id)).toBeUndefined(); expect(busyTalentIds(state).has(id)).toBe(false)
    acceptedEvidence(state)
    recordCohortRoute('retirementNotice', { announced: 3231, age: 70, effective: 3283, window: 3271, decision: 3276,
      offered: false, expired: 3276, gap: 7 })
    return { beforeNotice, notice, window, expired, state }
  })
}
export function cohortChosen() {
  return memo('chosen3283', () => {
    const before = cohortNoticeGap().state, state = toWeek(before, 3283), id = COHORT_SUBJECT
    expect(person(state, id)).toMatchObject({ role: 'director', age: 71 })
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 3283,
      effectiveWeek: 3283, extensionUsed: false })
    expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
      .toEqual([expect.objectContaining({ week: 3283, outcome: 'chosen', selected: 'director', reason: 'onlyEligibleTarget' })])
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id))
      .toEqual([expect.objectContaining({ week: 3283, from: 'actor', to: 'director' })])
    expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
    expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
    expect(activeContract(state, id)).toBeUndefined()
    acceptedEvidence(state)
    recordCohortRoute('chosen', { week: 3283, age: 71, profession: 'director', calls })
    return { before, state }
  })
}
export function cohortLaterWork() {
  return memo('later-director-work', () => {
    const chosen = cohortChosen().state, loaded = reloadCohort(chosen), id = COHORT_SUBJECT
    let state = hire(loaded, id, 52)
    const writer = addYoung(state, 'writer', 52, 'new3283 Writer'); state = writer.state
    const craft = addYoung(state, 'craft', 52, 'new3283 Craft'); state = craft.state
    const lead = addYoung(state, 'actor', 52, 'new3283 lead'); state = lead.state
    const antagonist = addYoung(state, 'actor', 52, 'new3283 antagonist'); state = antagonist.state
    const support = addYoung(state, 'actor', 52, 'new3283 support'); state = support.state
    const team: Team = { directorId: id, writerId: writer.id, craftId: craft.id,
      cast: { lead: lead.id, antagonist: antagonist.id, support: support.id } }
    const hired = clone(state)
    state = refreshSet(state)
    expect(state.market.tick).toBe(3291)
    const prepared = clone(state), beforeRefusal = stableStringify(state)
    // All six participants are distinct and contracted; the young lead also has
    // a directing profile, so this detached cast attempt isolates old acting law.
    expect(person(state, lead.id).skills.directing).toBeDefined()
    expect(() => greenlight(state, { ...team, directorId: lead.id, cast: { ...team.cast, lead: id } }))
      .toThrow(/retiredFromProfession/)
    expect(stableStringify(state)).toBe(beforeRefusal)
    const made = greenlight(state, team)
    state = release(made.state, made.productionId, team, 32)
    expect(state.market.tick).toBeLessThanOrEqual(3323)
    expect(careerIdentity(person(state, id)).disciplines.find(row => row.discipline === 'directing'))
      .toMatchObject({ workHistory: 1, proven: true })
    acceptedEvidence(state)
    return { loaded, hired, prepared, state, team, productionId: made.productionId }
  })
}
export function cohortFinalBoundary() {
  return memo('cohort3328-and-loaded3329', () => {
    let state = toWeek(cohortLaterWork().state, 3327)
    const before = clone(state)
    state = toWeek(state, 3328)
    acceptedEvidence(state)
    const cohort = clone(state), loaded = reloadCohort(state)
    state = toWeek(loaded, 3329)
    acceptedEvidence(state)
    expect(calls).toBe(729)
    recordCohortRoute('final', { cohort: 3328, loaded: 3328, final: state.market.tick, calls })
    return { before, cohort, loaded, state }
  })
}
