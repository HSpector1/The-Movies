// P09 §15A — the ORDINARY-PLAYER SOLVENCY LEDGER from a sparse start through the
// first theatrical receipts. Everything here is the engine's own arithmetic:
//   • the founding roster is the exact player MINIMUM (3 Actors / 1 Director /
//     1 Writer / 1 Craft Lead) signed from the ordinary founding draft, taking
//     the CHEAPEST legal applicant per role (no special hire, no proof-only staff);
//   • payroll, overhead, screenplay, greenlight, production, marketing, release
//     and receipts are played with the shipped actions on a founded studio and
//     read back from the ledger (no number is typed in);
//   • the bare-lot construction plant is overlaid from FACILITY_BLUEPRINTS
//     (capex at commit, opex from completion), scheduled the way an ordinary
//     player would sequence it (office first; scenery/stage/post while the
//     screenplay is written), with the first picture's start gated on the
//     office completing — the bare-lot regime does not exist yet, so the
//     capacity TIMING is modelled here and proven by the automated journey once
//     P09 Wave 1 lands.
// No hidden cash, no free facility, no waived payroll, no artificial revenue.
//
// RUN: node_modules/.bin/vite-node scripts/p09-solvency-preflight.mts
import { applyActions, beginFounding, generateWorld, tick, FOUNDING_MINIMUMS, contractOffer, nextStudioDecision } from '../src/core/index.ts'
import type { GameState, CreativeRole } from '../src/core/index.ts'
import { FACILITY_BLUEPRINTS, TUNING } from '../src/core/tuning.ts'
import { freePackage, commissionFor } from '../tests/_m4Fixtures.ts'

const SEED = 'p09-solvency-preflight-v1'
const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`

// ── 1. found with the exact minimum roster, cheapest legal applicant per role ──
let state: GameState = beginFounding(generateWorld(SEED))
const cashAtStart = state.studio.cash
const applicants = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
const roster: { role: CreativeRole; name: string; annual: number; bonus: number }[] = []
for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
  const pool = applicants.filter((t) => t.role === role)
    .map((t) => ({ t, offer: contractOffer(state, t.id, 104) }))
    .sort((a, b) => a.offer.annualSalary - b.offer.annualSalary)
  for (const { t, offer } of pool.slice(0, FOUNDING_MINIMUMS[role])) {
    state = applyActions(state, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    roster.push({ role, name: t.name, annual: offer.annualSalary, bonus: offer.signingBonus })
  }
}
const bonusTotal = roster.reduce((s, r) => s + r.bonus, 0)
state = applyActions(state, [
  { kind: 'foundStudio' },
  { kind: 'activateStudioOperations' },
  { kind: 'activateScriptDevelopment' },
  { kind: 'activateCastingSessions' },
])
const cashAfterFounding = state.studio.cash
const weeklyPayroll = roster.reduce((s, r) => s + Math.round(r.annual / 52), 0)
const weeklyOverhead = TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * state.contracts.length

console.log('=== P09 §15A ORDINARY-PLAYER SOLVENCY LEDGER (engine arithmetic) ===')
console.log(`seed ${SEED}; starting cash ${money(cashAtStart)} (TUNING.INITIAL_CASH)`)
console.log(`founding roster (cheapest legal applicants, 104-week terms):`)
for (const r of roster) console.log(`  ${r.role.padEnd(8)} ${r.name.padEnd(22)} annual ${money(r.annual).padStart(12)}  signing bonus ${money(r.bonus).padStart(10)} (recruitment fund)`)
console.log(`  signing bonuses ${money(bonusTotal)} paid from the ${money(TUNING.HIRING_FOUNDING_BUDGET)} recruitment fund; cash after founding ${money(cashAfterFounding)} (fund is not cash: ${cashAfterFounding === cashAtStart ? 'cash unchanged' : 'cash changed'})`)
console.log(`  weekly payroll ${money(weeklyPayroll)}; weekly overhead ${money(weeklyOverhead)} (base ${money(TUNING.OVERHEAD_BASE)} + ${state.contracts.length} × ${money(TUNING.OVERHEAD_PER_EMPLOYEE)})`)

// ── 2. play the ordinary first picture on the founded (endowed) studio to READ its costs ──
const ledgerAt = (s: GameState) => s.ledger.length
const start = ledgerAt(state)
const commission = commissionFor(state, 0, 0)
const concept = state.concepts.find((c) => c.id === commission.conceptId)!
state = applyActions(state, [{ kind: 'commissionScript', project: commission }])
let weeks = 0
const drive = (s: GameState) => {
  let dec = nextStudioDecision(s); let guard = 0
  while (dec !== null && dec.kind === 'productionOperation' && guard++ < 50) { s = applyActions(s, [dec.command]); dec = nextStudioDecision(s) }
  return s
}
let releaseWeek = -1, greenlightWeek = -1, scriptReadyWeek = -1, productionId: string | null = null
for (; weeks < 120; weeks++) {
  state = drive(state)
  for (const project of state.scriptDevelopment.projects) {
    if (project.status === 'review') { state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }]); scriptReadyWeek = state.market.tick }
    if (project.status === 'ready' && productionId === null && state.studio.activeProductions.length === 0) {
      state = applyActions(state, [{ kind: 'greenlightScriptProject', production: freePackage(state, project.id) }])
      productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
      greenlightWeek = state.market.tick
    }
  }
  if (productionId !== null) {
    const production = state.studio.activeProductions.find((p) => p.id === productionId)
    if (production !== undefined && production.remainingTicks === 1 && !state.releaseAuthority.commitments.some((c) => c.productionId === productionId))
      state = applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])
  }
  state = tick(state)
  if (productionId !== null && releaseWeek < 0 && state.studio.releasedFilms.some((f) => f.productionId === productionId)) releaseWeek = state.market.tick
  if (releaseWeek >= 0 && state.theatricalRuns.find((r) => r.productionId === productionId)?.status === 'completed') break
}
const runWeeks = state.theatricalRuns.find((r) => r.productionId === productionId)?.status === 'completed' ? state.market.tick - releaseWeek : -1
const byKind = new Map<string, number>()
for (const row of state.ledger.slice(start)) byKind.set(row.kind, (byKind.get(row.kind) ?? 0) + row.amount)
console.log(`\nordinary first picture on the founded studio (concept "${concept.title}", base negative ${money(concept.baseNegativeCost)}):`)
console.log(`  screenplay commissioned week ${commission ? state.ledger[start]?.week ?? 0 : 0}, accepted week ${scriptReadyWeek}, greenlit week ${greenlightWeek}, released week ${releaseWeek}, run complete after ${runWeeks} weeks (clock now ${state.market.tick})`)
console.log('  ledger by kind over the journey:')
for (const [kind, amount] of [...byKind.entries()].sort((a, b) => a[1] - b[1])) console.log(`    ${kind.padEnd(26)} ${money(amount).padStart(14)}`)
const receipts = state.ledger.slice(start).filter((r) => r.amount > 0)
const firstReceiptWeek = receipts.length > 0 ? Math.min(...receipts.map((r) => r.week)) : -1
const totalReceipts = receipts.reduce((s, r) => s + r.amount, 0)
console.log(`  first receipt week ${firstReceiptWeek}; total receipts through run completion ${money(totalReceipts)}`)
const productionSpend = [...byKind.entries()].filter(([k]) => !['payroll', 'overhead', 'facilityOpex'].includes(k)).reduce((s, [, v]) => s + (v < 0 ? v : 0), 0)
console.log(`  picture-specific spend (everything except payroll/overhead/opex): ${money(productionSpend)}`)

// ── 3. the bare-lot plant overlay: capex at commit, opex from completion ──
const bp = (id: string) => FACILITY_BLUEPRINTS.find((b) => b.id === id)!
const office = bp('development-casting-office'), scenery = bp('scenery-shop'), stage = bp('stage-standard'), post = bp('post-building')
const plan = [
  { b: office, commit: 0 },
  { b: scenery, commit: 0 },
  { b: stage, commit: 0 },
  { b: post, commit: 0 },
]
const capexTotal = plan.reduce((s, p) => s + p.b.capex, 0)
const opexTotal = plan.reduce((s, p) => s + p.b.weeklyOperatingCost, 0)
console.log(`\nbare-lot minimum plant (FACILITY_BLUEPRINTS, ordinary sequence: all four committed at founding while cash allows):`)
for (const p of plan) console.log(`  ${p.b.name.padEnd(30)} capex ${money(p.b.capex).padStart(12)}  ${String(p.b.buildWeeks).padStart(2)} wks  opex ${money(p.b.weeklyOperatingCost).padStart(8)}/wk  +${p.b.capacity} ${p.b.capability}  footprint ${p.b.footprint.width}×${p.b.footprint.depth}`)
console.log(`  capex total ${money(capexTotal)}; opex total ${money(opexTotal)}/wk once all four stand; house set commission $150,000 (SET_BLUEPRINTS set-house-generic, ${TUNING.SET_BUILD_WEEKS_BAND_LOW} wks)`)

// ── 4. week-by-week cash projection on the bare-lot timeline ──
// Timeline law (ordinary player, no shortcuts): the office completes at week 14
// (nothing can be commissioned before); the picture then follows EXACTLY the
// measured journey offsets (commission→accept→greenlight→release→first receipt);
// the stage/post/scenery are ready by week 16/14/11, before shooting needs them.
const officeDone = office.buildWeeks
const journeyOffsetToRelease = releaseWeek - 0 // measured from week 0 commission on the endowed studio
const journeyOffsetToFirstReceipt = firstReceiptWeek - 0
const bareRelease = officeDone + journeyOffsetToRelease
const bareFirstReceipt = officeDone + journeyOffsetToFirstReceipt
const horizon = Math.max(bareFirstReceipt + 8, state.market.tick + officeDone)
let cash = cashAfterFounding
let minCash = cash, minWeek = 0
const spendByWeek = new Map<number, number>()
for (const row of state.ledger.slice(start)) {
  if (['payroll', 'overhead', 'facilityOpex'].includes(row.kind)) continue
  const w = row.week + officeDone // shift the picture's own cash events by the office wait
  spendByWeek.set(w, (spendByWeek.get(w) ?? 0) + row.amount)
}
const rows: string[] = []
for (let w = 0; w < horizon; w++) {
  let delta = -(weeklyPayroll + weeklyOverhead)
  for (const p of plan) { if (w === p.commit) delta -= p.b.capex; if (w >= p.commit + p.b.buildWeeks) delta -= p.b.weeklyOperatingCost }
  if (w === officeDone + 1) delta -= 150_000 // house set commissioned once scenery capacity exists (week 11) and a stage stands (week 16) — charged conservatively early
  delta += spendByWeek.get(w) ?? 0
  cash += delta
  if (cash < minCash) { minCash = cash; minWeek = w }
  if (w % 4 === 0 || w === bareRelease || w === bareFirstReceipt) rows.push(`    week ${String(w).padStart(3)}  cash ${money(cash).padStart(14)}  Δ ${money(delta).padStart(12)}${w === officeDone ? '  ← office operational' : ''}${w === bareRelease ? '  ← RELEASE' : ''}${w === bareFirstReceipt ? '  ← first receipt' : ''}`)
}
console.log(`\nbare-lot projection (payroll + overhead every week from founding; capex at commit; opex from completion; the picture's measured cash events shifted by the ${officeDone}-week office wait):`)
for (const r of rows) console.log(r)
console.log(`  cash floor ${money(minCash)} at week ${minWeek}; release at week ${bareRelease}; first receipt at week ${bareFirstReceipt}`)
const verdict = minCash > 0 ? 'SOLVENT' : 'INSOLVENT'
console.log(`\nVERDICT: ${verdict} — ordinary minimum-roster bare-lot route ${minCash > 0 ? 'never' : 'DOES'} go below zero before first receipts (floor ${money(minCash)}).`)
console.log('Caveats: capacity timing is modelled (office gate) until the bare-lot regime exists; the picture\'s own costs are the engine\'s measured ledger on this seed; overhead and payroll are the engine\'s; nothing is subsidised.')
process.exit(minCash > 0 ? 0 : 1)
