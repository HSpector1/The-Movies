import { throws } from 'node:assert/strict'
// ── P16 r2: the Save49 era in tests, both directions ──
//
// `withP16Era` (review F54 sweep of the bridge files r1 never ran): the expected shape of an older save lifted to the
// live era observes actual boundary provenance through the cutover helper and gains what `convertV48ToV49` adds: no minted rights records with observational frontier recorded from the save's own week and a
// zero movement of each P16 money kind on every rival period. Callers pass the same week they pass `withEmptyP15Roots`.
//
// `rightsStripped` (review F32): a live world that greenlit or released anything holds recorded titles, so every
// downgrade of it refuses first at the rights root (`migrateToV48: cannot downgrade or discard a recorded rights
// root`). The guards older eras pin are still law; a test that pins one hands this helper its live save to get the
// predecessor-era save WITHOUT the rights root. It refuses when any rights instrument or rights money exists: only
// titles the predecessor era derives anyway (from the greenlights and releases the state still holds) may be dropped.

import { P16_PREDECESSOR_SAVE_VERSION, P16_SAVE_VERSION, P17_SAVE_VERSION, P18_SAVE_VERSION, convertV49ToV48, convertV50ToV49, convertV51ToV50, validateSaveV48, type SaveFileV48 } from '../../src/core/save.js'
import { validateSharedMarketRoot } from '../../src/core/marketIntegration.js'
import { cutoverRightsRoot } from '../../src/core/rights.js'
import type { GameState } from '../../src/core/types.js'

// Keep the complete current rival-period extension; predecessor readers retain exact keys.
const P16_MONEY_KINDS = ['rightsConsideration', 'dueDiligenceFee', 'acquisitionOutlay', 'estateSaleProceeds'] as const

type Periods = { account: { periods: { movements: Record<string, unknown> }[] } }

export function withP16Era<T extends object>(state: T, week: number): T {
  if ((state as unknown as GameState).market?.tick !== week) throw new Error('withP16Era: cutover expectation needs actual state at its own week')
  const hollywood = (state as { hollywood?: { businesses: Periods[] } | null }).hollywood
  const lifted = hollywood === null || hollywood === undefined ? hollywood : { ...hollywood, businesses: hollywood.businesses.map((business) => ({
    ...business, account: { ...business.account, periods: business.account.periods.map((period) => ({
      ...period, movements: { ...period.movements, ...Object.fromEntries(P16_MONEY_KINDS.map((kind) => [kind, 0])) } })) } })) }
  return { ...state, ...(hollywood === undefined ? {} : { hollywood: lifted }),
    rights: cutoverRightsRoot(state as unknown as GameState) }
}

export function rightsStripped(save: { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown }): SaveFileV48 {
  // P17 (Save50): a live envelope steps down through the P17 step first; any recorded franchise refuses there, by name.
  // P18 (Save51): first through the P18 step; any recorded television refuses there, by name.
  if (save.saveVersion === P18_SAVE_VERSION) save = convertV51ToV50(save as never) as unknown as typeof save
  if (save.saveVersion === P17_SAVE_VERSION) save = convertV50ToV49(save as never) as unknown as typeof save
  if (save.saveVersion !== P16_SAVE_VERSION) throw new Error(`rightsStripped: expects a Save${P16_SAVE_VERSION} envelope, got ${save.saveVersion}`)
  // Every deep historical guard retains proof of the real public P16 first boundary.
  const originalRoot = save.state.rights
  if (originalRoot.properties.length + originalRoot.filmTitles.length + originalRoot.titleEvents.length > 0) {
    throws(() => convertV49ToV48(save as never), /^Error: migrateToV48: cannot downgrade or discard a recorded rights root$/)
  }
  const state = JSON.parse(JSON.stringify(save.state)) as GameState
  const root = state.rights as GameState['rights']
  if (root.licences.length + root.offers.length + root.transactions.length + root.diligence.length + root.estates.length > 0) {
    throw new Error('rightsStripped: a rights instrument exists; dropping it would hide real authority')
  }
  if (state.ledger.some((row) => (P16_MONEY_KINDS as readonly string[]).includes(row.kind))) {
    throw new Error('rightsStripped: a rights ledger row exists')
  }
  for (const business of state.hollywood?.businesses ?? []) {
    for (const period of business.account.periods) {
      const movements = period.movements as Record<string, number>
      for (const kind of P16_MONEY_KINDS) {
        if ((movements[kind] ?? 0) !== 0) throw new Error(`rightsStripped: ${business.studioId} moved rights money (${kind})`)
        delete movements[kind]
      }
    }
  }
  // Historical test operand only, never a product downgrade: table3's market slot
  // is unchanged from table2. Only the already-admitted zero/default assessment
  // class may use its predecessor metadata; every fact/ID/date/digest stays put.
  if (root.absorptions.length !== 0) throw new Error('rightsStripped: an absorption exists')
  validateSharedMarketRoot(state as unknown as Record<string, unknown>, 'rightsStripped', true)
  for (const row of state.sharedMarket.assessments) {
    if (row.phaseOrderVersion <= 2) continue
    if (row.phaseOrderVersion !== 3 || row.phaseId !== 'p15a1.marketBatch' || row.phaseOrdinal !== 1
      || row.pressure !== 0 || row.factor !== 1 || row.windowTerm !== 0 || row.stockTerm !== 0) {
      throw new Error('rightsStripped: a nondefault current market assessment cannot be projected')
    }
    row.phaseOrderVersion = 2
  }
  const refuseCurrentPhaseHistory = (value: unknown): void => {
    if (Array.isArray(value)) { value.forEach(refuseCurrentPhaseHistory); return }
    if (value === null || typeof value !== 'object') return
    const row = value as Record<string, unknown>
    if (typeof row.phaseOrderVersion === 'number' && row.phaseOrderVersion > 2) {
      throw new Error('rightsStripped: current phase history cannot be projected')
    }
    Object.values(row).forEach(refuseCurrentPhaseHistory)
  }
  const { rights: _rights, ...predecessor } = state
  refuseCurrentPhaseHistory(predecessor)
  return validateSaveV48({ saveVersion: P16_PREDECESSOR_SAVE_VERSION, seed: save.seed, state: predecessor, broadcastCache: save.broadcastCache })
}

// The live step's named first refusals (convertV49ToV48, `p16DowngradeRefusal` in save.ts), for suites whose
// older guard moved because a ticked P16 world has no Save48 projection: a world that recorded a title, and a
// world whose closure opened an estate (every Save49 closure does, in its closure week).
export const RIGHTS_ROOT_REFUSAL = new RegExp(`^migrateToV${P16_PREDECESSOR_SAVE_VERSION}: cannot downgrade or discard a recorded rights root$`)
// A ticked world that recorded no title refuses at the live step's phase-history reason instead: the first P15 or P15B
// root (allocator order) holding a row the live writers stamped with phase table 3.
export const PHASE_HISTORY_REFUSAL = new RegExp(`^migrateToV${P16_PREDECESSOR_SAVE_VERSION}: cannot downgrade or discard current phase history \\((?:sharedMarket|powerRanking|campaignLegacy|corporateCondition|studioClosure)\\)$`)
// The one live-downgrade pattern for a ticked world whose title count the lane has not measured: exactly one of the
// two named refusals above.
export const LIVE_DOWNGRADE_REFUSAL = new RegExp(`${RIGHTS_ROOT_REFUSAL.source}|${PHASE_HISTORY_REFUSAL.source}`)
export const ESTATE_OBSERVATION_REFUSAL = new RegExp(`^migrateToV${P16_PREDECESSOR_SAVE_VERSION}: cannot discard unique estate observation or current closure provenance$`)
// Why the older guard moved: `rightsStripped` refuses, by name, to relabel table-3 history it cannot prove neutral.
export const NONDEFAULT_MARKET_PROJECTION = /^rightsStripped: a nondefault current market assessment cannot be projected$/
export const PHASE_HISTORY_PROJECTION = /^rightsStripped: current phase history cannot be projected$/
