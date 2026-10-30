import type { GameState, Standing } from './types.js'
import type { RivalBusiness } from './hollywoodTypes.js'
import type { AbsorptionRecord } from './rights.js'
import { isUnshotContinuationPhase, productionPhaseForRemainingTicks } from './productionPhases.js'
import { productionCompanyTalentIds } from './productionPeople.js'
import { releaseStandingDrivers, STANDING_FORMULA_VERSION, updateStanding } from './standing.js'
import { standingChanged, standingDeltas } from './studioHistory.js'

function fail(why: string): never { throw new Error(`continued work: ${why}`) }
function exact(value: unknown, keys: readonly string[]): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || Object.keys(value).sort().join() !== [...keys].sort().join()) fail('unknown or missing fields')
}
function same(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b)
    && a.length === b.length && a.every((v, i) => same(v, b[i]))
  const left = a as Record<string, unknown>, right = b as Record<string, unknown>
  return Object.keys(left).length === Object.keys(right).length
    && Object.keys(left).every(k => Object.hasOwn(right, k) && same(left[k], right[k]))
}
function finite(value: number, min = 0, max = Infinity): void {
  if (!Number.isFinite(value) || value < min || value > max) fail('invalid recorded scalar')
}
function standing(value: Standing): void {
  exact(value, ['audienceAwareness', 'industryPrestige', 'commercialConfidence'])
  for (const n of Object.values(value)) finite(n, 0, 100)
}

/** Current49 proof of the actual paid-source/native-buyer work owner. Structural Production and
 * workflow validation, and cumulative buyer capacity, run through their existing owners in save.ts.
 * This joins durable input-week observations to those actual sources; it never simulates old weeks. */
export function validateContinuedWork(state: GameState, business: RivalBusiness, a: AbsorptionRecord): void {
  const h = state.hollywood
  if (!h || a.targetId !== business.studioId) fail('wrong actual work owner')
  if (![a.continuedProductions, a.buyerWorkflows, a.workSteps, a.workReleases, a.workCancellations].every(Array.isArray)) fail('missing work arrays')
  const player=a.buyerId===h.playerStudioId
  const buyer=player?undefined:h.businesses.find(b=>b.studioId===a.buyerId)
  if(!player && !buyer)fail('actual rival operator missing')
  if(!player && (a.continuedProductions.length>1 || a.workCancellations.length!==0))fail('rival multiple/manual work producer is not admitted')
  const buyerOperations=player?state.operations:buyer!.operations

  const links = a.continuedProductions
  const ids = new Set(links.map(row => row.productionId))
  if (ids.size !== links.length || new Set(links.map(row => row.scriptProjectId)).size !== links.length
    || links.some(row => a.stoppedProductions.some(stop => stop.productionId === row.productionId))) fail('duplicate or both stopped and continued work')
  let priorCancelWeek = -1, priorCancelId = -1
  for (const cancellation of a.workCancellations) {
    exact(cancellation, ['id', 'productionId', 'week', 'remainingTicks'])
    const match = /^absorbed-work-cancel-(\d+)$/.exec(cancellation.id)
    if (!match || Number(match[1]) <= priorCancelId || !ids.has(cancellation.productionId)
      || !Number.isSafeInteger(cancellation.week) || cancellation.week < a.week || cancellation.week > state.market.tick
      || cancellation.week < priorCancelWeek || !Number.isSafeInteger(cancellation.remainingTicks) || cancellation.remainingTicks < 1
      || a.workReleases.some(r => r.productionId === cancellation.productionId)) fail('invalid actual manual cancellation receipt')
    priorCancelWeek = cancellation.week; priorCancelId = Number(match[1])
  }
  if (new Set(a.workCancellations.map(c => c.productionId)).size !== a.workCancellations.length) fail('manual cancellation replay')
  const cancelledIds = new Set(a.workCancellations.map(c => c.productionId))
  const closure = state.studioClosure.closures.find(c => c.studioId === a.buyerId)
  const buyerEnd = closure?.closureWeek ?? state.market.tick
  const liveIds = new Set(business.productions.filter(p => ids.has(p.id) && !cancelledIds.has(p.id)).map(p => p.id))
  if (a.buyerWorkflows.length !== liveIds.size || new Set(a.buyerWorkflows.map(w => w.productionId)).size !== a.buyerWorkflows.length
    || a.buyerWorkflows.some(w => !liveIds.has(w.productionId))) fail('canonical buyer workflow bijection differs')
  if (business.operations.workflows.some(w => ids.has(w.productionId))
    || h.businesses.some(b=>b!==business && b.operations.workflows.some(w=>ids.has(w.productionId)))
    || state.operations.workflows.some(w => ids.has(w.productionId))
    || state.studio.activeProductions.some(p => ids.has(p.id))) fail('continued work claims a second production or allocation owner')

  // Every post-C creator release must come from this transaction; dropping both a link and its
  // release row cannot shrink the expected set. Original source paid-project order is authoritative.
  const afterClose = h.films.filter(f => f.provenance === 'simulation/v1' && f.studioId === a.targetId && f.result.releaseTick >= a.week)
  if (afterClose.some(f => !ids.has(f.filmId)) || new Set(a.workReleases.map(r => r.productionId)).size !== a.workReleases.length
    || a.workReleases.length !== afterClose.length || a.workReleases.some(r => !afterClose.some(f => f.filmId === r.productionId))) fail('actual creator release/continuation bijection differs')
  const paidOrder = business.projects.filter(p => p.productionId !== null && ids.has(p.productionId)).map(p => p.productionId)
  if (!same(links.map(row => row.productionId), paidOrder)) fail('original paid production order differs')
  let priorWeek = -1, priorId = 0
  for (const step of a.workSteps) {
    exact(step, ['id', 'productionId', 'week', 'beforeRemaining', 'afterRemaining'])
    if (typeof step.id !== 'string' || !/^absorbed-work-[1-9][0-9]*$/.test(step.id)) fail('invalid allocated work identity')
    const n = Number(step.id.slice('absorbed-work-'.length))
    if (!Number.isSafeInteger(n) || n <= priorId || !Number.isSafeInteger(step.week) || step.week < priorWeek
      || !ids.has(step.productionId)) fail('work observations lost producer order or actual subject')
    priorId = n; priorWeek = step.week
  }
  const expectedSteps: { productionId: string; week: number }[] = []
  let priorReleaseWeek = -1
  for (const release of a.workReleases) {
    exact(release, ['productionId', 'week', 'titleEventId', 'standingBefore', 'standingAfter', 'standingContext', 'benchmarks'])
    if (!Number.isSafeInteger(release.week) || release.week < a.week || release.week >= state.market.tick
      || release.week >= buyerEnd || release.week < priorReleaseWeek) fail('release outside actual operating boundary')
    priorReleaseWeek = release.week
  }

  for (const row of links) {
    exact(row, ['productionId', 'scriptProjectId', 'originalProduction', 'originalWorkflow', 'originalReleaseCommitment', 'buyerPostFacilityId'])
    const original = row.originalProduction, originalWorkflow = row.originalWorkflow
    const script = business.development.projects.find(p => p.id === row.scriptProjectId)
    const cost = business.projects.find(p => p.productionId === row.productionId)
    const current = business.productions.find(p => p.id === row.productionId)
    const film = afterClose.find(f => f.filmId === row.productionId)
    const release = a.workReleases.find(r => r.productionId === row.productionId)
    const cancellation = a.workCancellations.find(r => r.productionId === row.productionId)
    if (cancellation && closure && cancellation.week >= closure.closureWeek) fail('manual cancellation outside buyer operating boundary')
    if (!script || !cost || cost.scriptProjectId !== row.scriptProjectId || script.productionId !== row.productionId
      || original.id !== row.productionId || original.conceptId !== script.conceptId || cost.conceptId !== original.conceptId
      || original.startTick !== cost.announcedWeek || original.startTick > a.week || script.writerId !== original.writerId
      || cost.production !== original.budget.negative || cost.marketing !== original.budget.marketing
      || !same(script.shape, original.shape) || !same(script.promise, original.promise)) fail('original costed screenplay/production differs')
    const phase = productionPhaseForRemainingTicks(original.remainingTicks)
    const earlier=isUnshotContinuationPhase(phase)
    const completedTake=phase==='shooting' && original.remainingTicks===4
    const initialTake=phase==='shooting' && original.remainingTicks===5
    const buyerFirstTake=earlier || initialTake
    if ((!earlier && !completedTake && !initialTake && phase !== 'postProduction' && phase !== 'releaseReady') || originalWorkflow.productionId !== original.id
      || originalWorkflow.phase !== phase || originalWorkflow.setup !== null || earlier && originalWorkflow.bindings.requiresSetBinding!==false
      || state.technology.productions.some(p => p.productionId === original.id && p.method !== 'silent')) fail('unsupported original phase/setup/technology')
    if(initialTake){
      const locks=state.technology.productions.filter(p=>p.productionId===original.id)
      if(originalWorkflow.bindings.requiresSetBinding!==false || originalWorkflow.shootingTask?.status!=='unassigned'
        || originalWorkflow.shootingTask.directorId!==original.directorId || locks.length!==1
        || locks[0]!.studioId!==a.targetId || locks[0]!.method!=='silent' || locks[0]!.adoptionId!==null
        || locks[0]!.lockedWeek===null || locks[0]!.lockedWeek>a.week)fail('initial take lost original silent source authority')
    }
    if(completedTake){
      const locks=state.technology.productions.filter(p=>p.productionId===original.id)
      if(originalWorkflow.bindings.requiresSetBinding!==false || originalWorkflow.shootingTask?.status!=='completed'
        || originalWorkflow.shootingTask.directorId!==original.directorId || locks.length!==1
        || locks[0]!.studioId!==a.targetId || locks[0]!.method!=='silent' || locks[0]!.adoptionId!==null
        || locks[0]!.lockedWeek===null || locks[0]!.lockedWeek>a.week)fail('completed take lost original silent source authority')
    }
    if (row.buyerPostFacilityId !== null && (typeof row.buyerPostFacilityId !== 'string'
      || !buyerOperations.facilities.some(f => f.id === row.buyerPostFacilityId && f.capability === 'post'))) fail('original buyer post facility missing')
    const end = Math.min(state.market.tick, buyerEnd, cancellation?.week ?? Infinity, release ? release.week + 1 : Infinity)
    const steps = a.workSteps.filter(s => s.productionId === original.id)
    if(!player)for(const own of buyer!.projects) {
      if(own.productionId===null || own.announcedWeek===null)continue
      const released=h.films.find(f=>f.provenance==='simulation/v1' && f.studioId===a.buyerId && f.filmId===own.productionId)
      const body=buyer!.productions.find(p=>p.id===own.productionId)
      const until=released?.provenance==='simulation/v1'?released.result.releaseTick+1:body?(closure?.closureWeek??state.market.tick+1):Infinity
      if(own.announcedWeek<Math.max(a.week+1,end) && until>a.week)fail('rival native production overlaps actual continued operation')
    }
    if (steps.length !== end - a.week) fail('complete actual input-week work sequence missing')
    let remaining = original.remainingTicks
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!, week = a.week + i
      if (step.week !== week || !Number.isSafeInteger(step.beforeRemaining) || !Number.isSafeInteger(step.afterRemaining)
        || step.beforeRemaining !== remaining || remaining < 1
        || (step.afterRemaining !== remaining && step.afterRemaining !== remaining - 1)) fail('work counter skips or invents native progress')
      expectedSteps.push({ productionId: original.id, week })
      remaining = step.afterRemaining
    }
    const takes=state.firstTakes.filter(t=>t.productionId===original.id)
    const firstStep=steps.find(step=>step.beforeRemaining===5 && step.afterRemaining===4)
    const expectedTake=buyerFirstTake?firstStep!==undefined:true
    if(takes.length!==(expectedTake?1:0))fail('actual first-take/work boundary bijection differs')
    if(expectedTake){const take=takes[0]!
      if(take.studioId!==(buyerFirstTake?a.buyerId:a.targetId) || (buyerFirstTake?take.week!==firstStep!.week+1:take.week>a.week)
        || take.directorId!==original.directorId || !same(take.cast,original.cast))fail('actual operator/creator first take differs')
      const subject=state.firstTakeSubjects.facts.find(f=>f.eventId===take.eventId)
      if(buyerFirstTake && !subject || subject && (subject.conceptId!==original.conceptId || subject.scriptProjectId!==row.scriptProjectId))fail('first-take creator screenplay subject differs')
    }
    if(earlier){
      const entered=steps.find(step=>step.beforeRemaining===6 && step.afterRemaining===5)
      const loadouts=state.technology.productions.filter(p=>p.productionId===original.id)
      if(loadouts.length!==(entered?1:0))fail('silent lock/actual phase-entry bijection differs')
      if(entered){const lock=loadouts[0]!
        if(lock.studioId!==a.buyerId || lock.method!=='silent' || lock.adoptionId!==null || lock.lockedWeek!==entered.week)fail('silent lock belongs to wrong actual operator/boundary')
      }
    }
    if (buyerFirstTake || completedTake) {
      const wrapStep = steps.find(s => s.beforeRemaining === 4 && s.afterRemaining === 3)
      const wraps = state.studioEvents.rows.filter(e => e.kind === 'wrapped' && e.productionId === original.id)
      if(player ? (wrapStep ? wraps.length!==1 || wraps[0]!.week!==wrapStep.week : wraps.length!==0) : wraps.length!==0)fail('buyer native wrap differs from actual shooting completion')
    }
    if (release ? remaining !== 0 || !film || current !== undefined : remaining < 1 || !current || film !== undefined) fail('actual counter/release/source production partition differs')
    if (current && (!same(current, { ...original, remainingTicks: remaining }) || script.status !== 'inProduction')) fail('retained paid production mutated outside its real counter')
    if (cancellation && (cancellation.remainingTicks !== remaining || !current || film || release || a.buyerWorkflows.some(w => w.productionId === original.id))) fail('manual cancellation lost frozen paid source or capacity disposition')
    if (film && (film.provenance !== 'simulation/v1' || script.status !== 'produced' || film.scriptProjectId !== script.id
      || film.studioId !== a.targetId || film.result.releaseTick !== release!.week || film.result.productionId !== original.id
      || film.conceptId !== original.conceptId || film.result.directorId !== original.directorId
      || !same(film.result.participants, original.participants)
      || film.directCommitment !== cost.development + cost.production + cost.marketing)) fail('actual creator release lost paid source/participants')

    // A real commitment already present at C survives. Otherwise the buyer must use the actual
    // public release action, whose permanent event proves when it was accepted. Ready work may
    // hold for any number of genuine input weeks; acquisition never invents a release decision.
    const inherited = row.originalReleaseCommitment
    const commitment = business.releaseAuthority.commitments.find(c => c.productionId === original.id)
    const commitEvents = state.studioEvents.rows.filter(e => e.kind === 'releaseCommitted' && e.productionId === original.id)
    let committedAt: number | null = null
    if (inherited !== null) {
      exact(inherited, ['productionId', 'commitmentId', 'committedAtWeek'])
      if (inherited.productionId !== original.id || inherited.commitmentId !== `release-commitment-${original.id}`
        || !Number.isSafeInteger(inherited.committedAtWeek) || inherited.committedAtWeek < original.startTick
        || inherited.committedAtWeek > a.week || original.remainingTicks !== 1 || commitEvents.length !== 0) fail('carried release commitment differs from actual original ready work')
      committedAt = inherited.committedAtWeek
    } else if(!player) {
      // The native rival commits and publishes in the same input pass. Its
      // canonical 1→0 step, actual creator film and releaseCommitmentId retain
      // that decision without minting a player-only action/history row.
      if(commitEvents.length!==0)fail('rival commitment polluted player events')
      const committed=steps.find(step=>step.beforeRemaining===1 && step.afterRemaining===0)
      if(committed) {
        if(!release || release.week!==committed.week || film?.provenance!=='simulation/v1' || film.releaseCommitmentId!==`release-commitment-${original.id}`)fail('rival automatic commitment lacks actual release')
        committedAt=committed.week
      }
    } else {
      if (commitEvents.length > 1) fail('buyer release commitment duplicated')
      const event = commitEvents[0]
      if (event) {
        if (event.week < a.week || event.week > state.market.tick || (closure && event.week >= closure.closureWeek)) fail('buyer release commitment outside operating boundary')
        const atCommit = steps.filter(s => s.week < event.week).at(-1)?.afterRemaining ?? original.remainingTicks
        if (atCommit !== 1) fail('buyer release commitment preceded actual Release Ready')
        committedAt = event.week
      }
    }
    if (cancellation && (committedAt !== null || commitment !== undefined)) fail('manual cancellation rewrote irreversible release obligation')
    if (release) {
      if (committedAt === null || committedAt > release.week || commitment !== undefined) fail('release lacks actual commitment or retained pruned authority')
    } else if (committedAt === null) {
      if (commitment !== undefined) fail('automatic or orphan buyer release commitment')
    } else if (!commitment || commitment.productionId !== original.id
      || commitment.commitmentId !== `release-commitment-${original.id}` || commitment.committedAtWeek !== committedAt) fail('live release authority differs from carried or public commitment')

    // Credited writer retention is an admission fact; actual company seats remain employed until
    // the final operated input week (or are ended by real buyer closure), never through all future time.
    const company = productionCompanyTalentIds([original])
    for (const talentId of new Set([original.writerId, ...company])) {
      const retained = a.contracts.find(c => c.talentId === talentId && c.buyerContractId !== null)
      const contract = h.employment.find(e => e.contractId === retained?.buyerContractId)
      const through = cancellation?.week === a.week ? a.week - 1 : company.has(talentId) ? Math.max(a.week, end - 1) : a.week - 1
      if (!retained || !contract || contract.studioId !== a.buyerId || contract.terms.talentId !== talentId
        || contract.terms.startWeek !== a.week || Math.min(contract.endedWeek ?? Infinity, contract.terms.endWeekExclusive) <= through) fail('actual retained employment does not cover operated work')
    }
    if (closure && !release && !cancellation) {
      const production = closure.dispositions.filter(d => d.subjectKind === 'production' && d.subjectId === original.id)
      const screenplay = closure.dispositions.filter(d => d.subjectKind === 'screenplay' && d.subjectId === (player?row.scriptProjectId:`${a.targetId}:${row.scriptProjectId}`))
      if (production.length !== 1 || screenplay.length !== 1 || production[0]!.status !== 'applied' || screenplay[0]!.status !== 'applied'
        || production[0]!.prior !== `remainingTicks ${remaining}` || screenplay[0]!.prior !== 'inProduction'
        || production[0]!.result !== `cancelled terminally at week ${closure.closureWeek}; footage, participants and spend frozen in place; no release`
        || screenplay[0]!.result !== `work stopped at week ${closure.closureWeek}; authored material, progress and spend retained; no completion`) fail('buyer closure omitted actual continued production/screenplay')
    }
    if (!release || !film || film.provenance !== 'simulation/v1') continue
    standing(release.standingBefore); standing(release.standingAfter)
    const ctx = release.standingContext, benchmarks = release.benchmarks
    exact(ctx, ['castFames', 'actualNegative', 'requiredNegative', 'baseMarketValue', 'marketing', 'salaries', 'engaged'])
    exact(ctx.castFames, ['lead', 'antagonist', 'support'])
    for (const fame of Object.values(ctx.castFames)) finite(fame, 0, 100)
    for (const n of [ctx.actualNegative, ctx.requiredNegative, ctx.baseMarketValue, ctx.marketing, ctx.salaries]) finite(n)
    if (ctx.engaged !== true || ctx.actualNegative !== original.budget.negative || ctx.marketing !== original.budget.marketing) fail('release context contradicts actual paid source')
    exact(benchmarks, ['expectedOpening', 'expectedTotal', 'expectedCriticScore'])
    const expectedBenchmarks = { expectedOpening: original.forecastSnapshot.expectedOpening,
      expectedTotal: original.forecastSnapshot.expectedTotal, expectedCriticScore: original.forecastSnapshot.expectedCriticScore }
    if (!same(benchmarks, expectedBenchmarks) || !same(film.result.forecast, expectedBenchmarks)
      || !same(updateStanding(release.standingBefore, film.result, benchmarks, ctx), release.standingAfter)) fail('actual release Standing or forecast differs')
    const sourceReceipts = h.receipts.filter(r => r.kind === 'filmReleased' && r.productionId === original.id)
    const sourceReceipt = sourceReceipts[0]
    if (sourceReceipts.length !== 1 || !sourceReceipt || sourceReceipt.kind !== 'filmReleased'
      || sourceReceipt.studioId !== a.targetId || sourceReceipt.week !== release.week
      || !same(sourceReceipt.before, sourceReceipt.after) || !same(sourceReceipt.after, business.standing)) fail('creator received buyer operating Standing or lacks exact release receipt')
    const history = state.studioHistory.rows.filter(r => r.kind === 'standingChanged' && r.source.kind === 'releaseResult' && r.source.productionId === original.id)
    const changed = standingChanged(release.standingBefore, release.standingAfter)
    if (history.length !== (player && changed ? 1 : 0)) fail('buyer Standing receipt missing, duplicated or invented')
    if (player && changed) {
      const receipt = history[0]!
      if (receipt.kind !== 'standingChanged' || receipt.week !== release.week
        || !same(receipt.before, release.standingBefore) || !same(receipt.after, release.standingAfter)
        || !same(receipt.deltas, standingDeltas(release.standingBefore, release.standingAfter))
        || receipt.formulaVersion !== STANDING_FORMULA_VERSION
        || !same(receipt.facts, { kind: 'releaseResult', ...releaseStandingDrivers(film.result, ctx) })
        || !same(receipt.subjects, [{ kind: 'film', productionId: original.id }])) fail('buyer Standing history differs from actual release')
    }
    if (typeof release.titleEventId !== 'string') fail('public release lacks its actual title transfer')
    const events = state.rights.titleEvents.filter(e => e.subject.right === 'R2' && e.subject.filmId === original.id)
    const transfer = events.find(e => e.id === release.titleEventId), genesis = events.find(e => e.cause === 'genesis')
    if (!genesis || genesis.newHolder !== a.targetId || genesis.date.kind !== 'campaign' || genesis.date.week !== release.week
      || !transfer || transfer.cause !== 'absorbedWorkRelease' || transfer.source.kind !== 'absorbedWorkRelease'
      || transfer.source.absorptionId !== a.id || transfer.source.productionId !== original.id
      || transfer.priorHolder !== a.targetId || transfer.newHolder !== a.buyerId || transfer.date.kind !== 'campaign'
      || transfer.date.week !== release.week || transfer.ordinal !== genesis.ordinal + 1) fail('future R2 genesis/transfer is not the actual creator release')
  }
  expectedSteps.sort((x, y) => x.week - y.week || links.findIndex(p => p.productionId === x.productionId) - links.findIndex(p => p.productionId === y.productionId))
  if (!same(a.workSteps.map(s => ({ productionId: s.productionId, week: s.week })), expectedSteps)) fail('native work step order differs')
}
