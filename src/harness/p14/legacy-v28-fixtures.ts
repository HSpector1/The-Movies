/**
 * P14A.2-T0 legacy-fixture generator. Run at the P14A.1 FINAL WRITER (the live save
 * writer last moved at `daaf95f` — `dropped[]` on receipts; `dee8fc1` carries the same
 * writer) and BEFORE any P14A.2 source change, so the emitted saves are genuine V28
 * originals for the A.3/P14B migration and load proofs. A later engine emits ITS version,
 * not V28; `tests/fixtures/p13b/PROVENANCE.md` is the authority for what was minted.
 *
 *   npx vite-node src/harness/p14/legacy-v28-fixtures.ts
 *
 * Every envelope here is written by the engine's own writer (`makeSave` / `migrateToV28`)
 * and re-read through `validateSave` before it is accepted. Nothing is hand-built.
 *
 * FROZEN AT P14B.1. The live writer has moved to V29, so `makeSave` here now writes a
 * V29 envelope and this generator REFUSES it at its own `revalidated.saveVersion !== 28`
 * guard rather than emitting a V29 file under a `legacy-v28-` name. The committed
 * fixtures stay exactly as minted at their V28 writer (`206223f` for `shooting-5`,
 * `31971bf` for the other three); re-running this file is not a way to remint them.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { gunzipSync, gzipSync } from 'node:zlib'
import { applyActions } from '../../core/actions.js'
import { hiringMarketIds } from '../../core/employment.js'
import { exportSave, makeSave, migrateToV28, validateSave } from '../../core/save.js'
import type { LiveSaveFile, SaveFileV28, SaveFileV29, SaveFileV30, SaveFileV31, SaveFileV32, SaveFileV33 } from '../../core/save.js'
import { caseForTalent, currentProposals, submitProposal } from '../../core/talentMarket.js'
import { tick } from '../../core/tick.js'
import { TUNING } from '../../core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../p13a/fixtures.js'
import { operationsStudio, productionPayload, withCash } from '../../../tests/contracts/_contractFixtures.js'
import type { GameState } from '../../core/types.js'

const out = new URL('../../../tests/fixtures/p14/', import.meta.url)
mkdirSync(out, { recursive: true })

/**
 * Write one fixture and PROVE it is re-readable: gzip round trip, then
 * load -> validateSave -> re-serialise must equal the file byte for byte.
 */
function emit(file: string, save: SaveFileV28 | SaveFileV29 | SaveFileV30 | SaveFileV31 | SaveFileV32 | SaveFileV33 | LiveSaveFile, week: number): void {
  const json = exportSave(save)
  const bytes = Buffer.from(json, 'utf8')
  writeFileSync(new URL(file, out), gzipSync(bytes, { level: 9 }))
  const reread = gunzipSync(readFileSync(new URL(file, out))).toString('utf8')
  if (reread !== json) throw new Error(`${file}: gzip round trip is not byte-stable`)
  const revalidated = validateSave(JSON.parse(reread))
  if (revalidated.saveVersion !== 28) throw new Error(`${file}: re-validated as saveVersion ${revalidated.saveVersion}, not 28`)
  if (exportSave(revalidated) !== json) throw new Error(`${file}: validateSave -> re-serialise is not byte-stable`)
  console.log(`${file} saveVersion=${save.saveVersion} week=${week} bytes=${bytes.length} sha256(json)=${createHash('sha256').update(bytes).digest('hex')} revalidated=byte-stable`)
}

function signWeekZeroActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const talentId = hiringMarketIds(state, 0).map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (talentId === undefined) throw new Error('premise failed: no actor in the week-0 hiring market')
  return { state: applyActions(state, [{ kind: 'signContract', talentId, termWeeks }]), talentId }
}

// ── (a) the OPEN case at week 45: both proposals submitted, nothing settled ──
// The tests/p14a1-settlement.test.ts construction exactly: a week-0 52-week signing
// (decision week 52), advanced to 45, the player's premium proposal and one entered
// rival's floor proposal submitted through `submitProposal`.
{
  const { state: signed, talentId } = signWeekZeroActor(p13aGeneratedStudio(), 52)
  const at45 = advanceTo(signed, 45)
  const playerStudioId = at45.hollywood!.playerStudioId
  const rival = at45.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)
  if (rival === undefined) throw new Error('premise failed: no entered rival at week 45')
  let state = submitProposal(at45, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
  state = submitProposal(state, { talentId, issuerStudioId: rival.studioId, termWeeks: 52, premiumTier: 1.0 })

  const view = caseForTalent(state, talentId, state.market.tick)
  if (view === null) throw new Error('premise failed: no case for the subject at week 45')
  const proposals = currentProposals(state, talentId)
  if (proposals.length !== 2) throw new Error(`premise failed: ${proposals.length} current proposals, expected 2`)
  if (view.status !== 'proposals_open') throw new Error(`premise failed: case status "${view.status}", expected proposals_open`)
  if (view.decisionWeek !== 52) throw new Error(`premise failed: decision week ${view.decisionWeek}, expected 52`)
  if (state.talentMarket.receipts.some((r) => r.kind === 'settled' || r.kind === 'declined')) throw new Error('premise failed: the case is already terminal')

  emit('legacy-v28-open-case-45.json.gz', makeSave(state), state.market.tick)
  const kinds: Record<string, number> = {}
  for (const r of state.talentMarket.receipts) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1
  console.log(`  subject=${talentId} subjectStudio=${view.subjectStudioId} status=${view.status} decisionWeek=${view.decisionWeek} openedWeek=${view.openedWeek}`)
  console.log(`  cases=${state.talentMarket.cases.length} currentProposals=${proposals.length} ` +
    proposals.map((p) => `[${p.issuerStudioId === playerStudioId ? 'player' : 'rival'} tier=${p.premiumTier} term=${p.termWeeks} start=${p.startWeek} submitted=${p.submittedWeek} representation=${String(p.representation)}]`).join(' '))
  console.log(`  receiptKinds=${JSON.stringify(kinds)} legacyTerminations=${state.talentMarket.legacyTerminations.length}`)
}

// ── (b) the SETTLED synchronized expiry at week 208, carrying dropped[] ──────
// tests/p14a1-seat-budget.test.ts case A's construction exactly: seed
// 'p13-public-commercial-adoption', advanced to 209 — no commitPlacement, no player
// action at all (that test builds the world with `advanceTo(p13aGeneratedStudio(seed), 209)`
// and nothing else). The natural founding-roster expiry synchronizes at 208.
{
  const state = advanceTo(p13aGeneratedStudio('p13-public-commercial-adoption'), 209)
  const receipts208 = state.talentMarket.receipts.filter((r) => r.week === 208)
  const settled208 = receipts208.filter((r) => r.kind === 'settled')
  const seatSentences = receipts208.flatMap((r) => r.dropped).filter((s) => s.toLowerCase().includes('seat'))
  const receiptsWithSeatDrop = receipts208.filter((r) => r.dropped.some((s) => s.toLowerCase().includes('seat')))
  const droppedTotal = receipts208.reduce((n, r) => n + r.dropped.length, 0)
  console.log(`legacy-v28-settled-208: week208Receipts=${receipts208.length} settled=${settled208.length} droppedSentences=${droppedTotal} seatDropSentences=${seatSentences.length} receiptsCarryingASeatDrop=${receiptsWithSeatDrop.length}`)
  if (settled208.length !== 24) throw new Error(`premise failed: ${settled208.length} settled receipts at week 208, expected 24`)
  if (seatSentences.length !== 36) throw new Error(`premise failed: ${seatSentences.length} seat-drop sentences at week 208, expected 36`)

  emit('legacy-v28-settled-208.json.gz', makeSave(state), state.market.tick)
  const kinds: Record<string, number> = {}
  for (const r of state.talentMarket.receipts) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1
  console.log(`  cases=${state.talentMarket.cases.length} closedAt208=${state.talentMarket.cases.filter((c) => c.closedWeek === 208).length} receiptKinds=${JSON.stringify(kinds)}`)
  console.log(`  firstSeatDropSentence=${JSON.stringify(seatSentences[0])}`)
}

// ── (c) the LIFTED legacy-termination state ─────────────────────────────────
// GENUINE, not forged: `tests/fixtures/p13b/legacy-v27-player-termination-20.json.gz`
// was minted in a throwaway worktree at the FINAL V27 WRITER `ef9ff76`, whose own
// `terminationCost` is `iround(HIRING_TERMINATION_FRACTION x guaranteedComp)` — the 50%
// law actually charged that campaign's ledger. Here that genuine V27 file is loaded and
// lifted, so `talentMarket.legacyTerminations` records the amount THAT era really paid.
{
  const source = new URL('../../../tests/fixtures/p13b/legacy-v27-player-termination-20.json.gz', import.meta.url)
  const json = gunzipSync(readFileSync(source)).toString('utf8')
  console.log(`legacy-v28-legacy-terminations: source=legacy-v27-player-termination-20.json.gz sha256(json)=${createHash('sha256').update(json).digest('hex')}`)
  const parsed = JSON.parse(json) as { saveVersion: number }
  const asV27 = validateSave(parsed)
  if (asV27.saveVersion !== 27) throw new Error(`premise failed: source validated as V${asV27.saveVersion}, not 27`)

  const lifted = migrateToV28(parsed)
  const rows = lifted.state.talentMarket.legacyTerminations
  if (rows.length !== 1) throw new Error(`premise failed: ${rows.length} legacyTerminations rows, expected 1`)
  const row = rows[0]!
  const ledgerRow = lifted.state.ledger.find((r) => r.kind === 'termination')
  if (ledgerRow === undefined || -ledgerRow.amount !== row.amountPaid) throw new Error('premise failed: the recorded amount is not the ledger row actually charged')
  if (lifted.state.talentMarket.cases.length !== 0 || lifted.state.talentMarket.proposals.length !== 0 || lifted.state.talentMarket.receipts.length !== 0) {
    throw new Error('premise failed: the lift fabricated market authority')
  }

  emit(`legacy-v28-legacy-terminations-${lifted.state.market.tick}.json.gz`, lifted, lifted.state.market.tick)
  console.log(`  legacyTerminations[0]=${JSON.stringify(row)} ledgerAmount=${ledgerRow.amount} cash=${lifted.state.studio.cash} cases=0 proposals=0 receipts=0`)
}

// ── (d) P14B.1-T0 — the FIRST SHOOTING WEEK, remainingTicks 5, a credited S5-R07 setup ──
// tests/p13b-r07-controls.test.ts's `conventionalBallroomAtRehearsal` construction
// verbatim (richFoundedStudio + activateStudioOperations via `operationsStudio`, a
// grand-ballroom Set struck-and-rebuilt on facility-soundstage-07, greenlit, walked to
// rehearsal at week 11), then that same file's "occupied-stage competition" case's
// Production A: a setup recipe (`ballroom-reveal-lighting-01`, conventional route, 4
// units) selected during rehearsal so the S5-R07 gate genuinely holds and credits
// before Shooting entry. `withCash` only lifts the studio's starting purse to the SAME
// 30,000,000 headroom that proven recipe uses — a cash bootstrap before any production
// choice is made, not a fact about the picture, its cast or its setup; nothing about
// the shooting state itself is hand-authored. The loop below stops at the FIRST tick
// that reads remainingTicks === 5 — derived from state, never a hardcoded week.
//
// There is no phaseEntered-independent "first take" fact anywhere in a V28 save: the
// only two authorities a reader has for "this is the first, not-yet-completed Shooting
// week" are `production.remainingTicks === 5` and `workflow.shootingTask` (created but
// not yet `scheduled`/`completed`). The P14B first-take receipt this fixture exists to
// exercise fires at the 5 -> 4 advance, which this save deliberately stops BEFORE.
{
  const STAGE_7 = 'facility-soundstage-07'
  let state = withCash(operationsStudio('p14b1-shooting-5'), 30_000_000)
  state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-0' }])
  state = applyActions(state, [
    { kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_7 } },
  ])
  for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, 0) }])
  state = tick(state) // greenlight tick: skip
  state = tick(state) // Development -> Pre-production
  state = tick(state) // Pre-production -> Rehearsal

  const productionId = state.studio.activeProductions[0]!.id
  const workflowAtRehearsal = state.operations.workflows.find((w) => w.productionId === productionId)
  if (workflowAtRehearsal === undefined) throw new Error('premise failed: no workflow for the greenlit production at rehearsal')
  if (workflowAtRehearsal.phase !== 'rehearsal') {
    throw new Error(`premise failed: phase "${workflowAtRehearsal.phase}" at week ${String(state.market.tick)}, expected rehearsal`)
  }

  state = applyActions(state, [
    {
      kind: 'setProductionSetupRecipe',
      productionId,
      recipeId: 'ballroom-reveal-lighting-01',
      expectedPlanRevision: workflowAtRehearsal.planRevision,
    },
  ])

  let production = state.studio.activeProductions.find((p) => p.id === productionId)!
  let guard = 0
  while (production.remainingTicks !== 5) {
    state = tick(state)
    production = state.studio.activeProductions.find((p) => p.id === productionId)!
    guard += 1
    if (guard > 40) {
      throw new Error(`premise failed: remainingTicks never reached 5 within ${String(guard)} weeks (stuck at ${String(production.remainingTicks)})`)
    }
  }

  const workflow = state.operations.workflows.find((w) => w.productionId === productionId)!
  if (workflow.phase !== 'shooting') throw new Error(`premise failed: phase "${workflow.phase}" at remainingTicks 5, expected shooting`)
  const setup = workflow.setup
  if (setup === null) throw new Error('premise failed: no setup record on the shooting-entry workflow')
  if (setup.completedWeek === null || setup.creditedUnits !== setup.requiredUnits) {
    throw new Error(
      `premise failed: setup not completed (credited ${String(setup.creditedUnits)}/${String(setup.requiredUnits)}, completedWeek ${String(setup.completedWeek)})`,
    )
  }
  if (workflow.shootingTask === null) throw new Error('premise failed: no shootingTask at Shooting entry')

  emit('legacy-v28-shooting-5.json.gz', makeSave(state), state.market.tick)
  console.log(
    `  productionId=${productionId} week=${state.market.tick} remainingTicks=${production.remainingTicks} phase=${workflow.phase} shootingTaskStatus=${workflow.shootingTask.status}`,
  )
  console.log(
    `  directorId=${production.directorId} writerId=${production.writerId} cast=${JSON.stringify(production.cast)} craftIds=${JSON.stringify(production.craftIds)}`,
  )
  console.log(
    `  setup: recipe=${setup.recipeId} route=${setup.route} requiredUnits=${setup.requiredUnits} creditedUnits=${setup.creditedUnits} admittedWeek=${setup.admittedWeek} completedWeek=${setup.completedWeek}`,
  )
  console.log('  no phaseEntered-independent first-take fact exists in this save at V28 — remainingTicks and shootingTask are the only authorities')
}
