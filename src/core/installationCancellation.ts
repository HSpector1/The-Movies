// ── Installation cancellation, receipts and restoration (P13B-S6) ────────────
//
// THE QUESTION THIS MODULE ANSWERS: "we have changed our minds about this
// installation — what have we already paid for, what comes back, and what does it
// cost to put the building right?"
//
// COMPONENT PROGRESS IS DERIVED, NEVER STORED. A committed installation carries
// one clock (`placedWeek`, `completesWeek`) and its blueprint carries the authored
// component list; component k therefore spans `[start_k, start_k + weeks_k)` from
// `placedWeek`, and at the cancel week w each component reads as `completed` (its
// end ≤ w — paid in full), `inProgress` (start < w < end — `w − start` whole weeks
// worked, paid pro rata rounded DOWN, the remainder refunded) or `unstarted` (paid
// nothing, refunded in full). Nothing about progress is persisted before a cancel,
// so no save can carry a forged half-built component, and a save written mid-work
// reloads and cancels identically.
//
// THE RECEIPT IS WRITTEN ONCE. `CancellationReceipt` is stamped on the placement
// record at the cancel week and never recomputed: a later tuning correction can
// change what a NEW cancellation costs and can never rewrite what this studio was
// actually charged. Its refund total is the amount of the ONE `constructionRefund`
// ledger row the cancellation writes, correlated by the same `constructionProjectId`
// the capex row carries — so the whole capital life of a cancelled job (committed,
// part-worked, refunded) is one auditable trail.
//
// RESTORATION IS THE COST OF CANCELLING, NOT A CHOICE. Cancelling work that had
// already begun tearing up its target body owes a restoration job on that exact
// body, auto-committed in the same action, paid in full at its own commit on its
// own project id. It takes the body offline under S4's existing `takesTargetOffline`
// law and gives it back at completion, and `cancelInstallation` refuses it.
//
// Pure and deterministic: no RNG, no I/O, no clock of its own. Every week it reads
// comes from the state it was handed.

import { blueprintById, reservePlacementIdentity, withConversionDowntime } from './placement.js'
import { isRestorationBlueprint, restorationBlueprintIdFor, RESTORATION_BLUEPRINTS } from './tuning.js'
import type { CancellationReceipt, GameState, LedgerEntry, PlacedFacility } from './types.js'

export { RESTORATION_BLUEPRINTS, isRestorationBlueprint, restorationBlueprintIdFor }

/** The canonical note every cancellation refund row carries. */
export const INSTALLATION_CANCELLATION_LEDGER_NOTE = 'cancellation refund'

/** One priced line of a cancellation, in the blueprint's own authored order. */
export type CancellationComponent = CancellationReceipt['components'][number]

/** What a cancellation would cost and return, before anything is committed. */
export type CancellationQuote = {
  ok: boolean
  /** The engine-primary reason, or null. The S4 disclosure pattern. */
  refusal: string | null
  rejections: string[]
  components: CancellationComponent[]
  /** Σ of the refunded column — the exact amount of the refund row a commit writes. */
  refund: number
  /** Whether site work had begun, so this cancellation owes a restoration job. */
  restorationRequired: boolean
  /** Every project this cancellation would stop, in placement-record order. */
  projectIds: string[]
}

export type CancellationTarget = { projectId: string } | { adoptionId: string }

/**
 * The per-component derivation. PURE: it knows only an authored component list and
 * how many whole weeks the work has been running, which is what makes it testable
 * on a component no blueprint authors and reusable by the quote, the commit and
 * the validator without three copies of the rounding rule.
 *
 * Rounding on a part-worked component goes toward the STUDIO's favour: the paid
 * share is floored, so the refunded remainder carries the odd dollar. Every
 * authored component today divides evenly; the rule exists so the first one that
 * does not cannot quietly round against the player.
 */
export function componentProgress(
  components: readonly { label: string; cost: number; weeks: number }[],
  elapsedWeeks: number,
): CancellationComponent[] {
  const elapsed = Math.max(0, Math.trunc(elapsedWeeks))
  const progress: CancellationComponent[] = []
  let start = 0
  for (const component of components) {
    // A ZERO-WEEK component is delivered WITH the component authored before it (the
    // sound capture package ships with the equipment it plugs into), so it is paid
    // exactly when that component has completed — and a LEADING zero-week component
    // is delivered at commit, so it is paid outright. It occupies no week, so it
    // never moves the clock for the components after it.
    if (component.weeks === 0) {
      const previous = progress[progress.length - 1]
      const delivered = previous === undefined || previous.status === 'completed'
      progress.push({
        label: component.label, cost: component.cost, weeks: 0,
        status: delivered ? 'completed' : 'unstarted',
        paid: delivered ? component.cost : 0,
        refunded: delivered ? 0 : component.cost,
      })
      continue
    }
    const end = start + component.weeks
    if (end <= elapsed) {
      progress.push({ label: component.label, cost: component.cost, weeks: component.weeks, status: 'completed', paid: component.cost, refunded: 0 })
    } else if (start < elapsed) {
      const worked = elapsed - start
      const paid = Math.floor((component.cost * worked) / component.weeks)
      progress.push({ label: component.label, cost: component.cost, weeks: component.weeks, status: 'inProgress', paid, refunded: component.cost - paid })
    } else {
      progress.push({ label: component.label, cost: component.cost, weeks: component.weeks, status: 'unstarted', paid: 0, refunded: component.cost })
    }
    start = end
  }
  return progress
}

/**
 * The COMMITTED component list of one placement: the blueprint's authored labels
 * and weeks, priced against the capex row this exact project was actually charged.
 *
 * The price comes from the ledger rather than from the catalogue because an Office
 * conversion's price depends on the standard it was quoted from (P13B-S4) — the
 * authored line is one component whose cost is the quote's, and the row that was
 * charged is the only record of which quote that was. A single authored component
 * therefore takes the whole charged amount; a multi-component blueprint keeps its
 * authored split, which always reconciles with its own capex.
 */
function committedComponents(state: GameState, placed: PlacedFacility): { label: string; cost: number; weeks: number }[] {
  const blueprint = blueprintById(placed.blueprintId)
  const authored = blueprint?.installationComponents ?? []
  const capex = state.ledger.find(
    (entry) => entry.kind === 'constructionCapex' && entry.constructionProjectId === placed.projectId,
  )
  const charged = capex === undefined ? null : -capex.amount
  const committedWeeks = placed.completesWeek - placed.placedWeek
  if (authored.length === 1 && charged !== null) {
    return [{ label: authored[0]!.label, cost: charged, weeks: committedWeeks }]
  }
  return authored.map((component) => ({ ...component }))
}

/** Whether a cancelled placement of this blueprint owes a restoration, given its own progress. */
function restorationOwed(blueprintId: string, components: readonly CancellationComponent[]): string | null {
  const restoration = restorationBlueprintIdFor(blueprintId)
  if (restoration === null) return null
  // The FIRST authored component is the site work for every blueprint that owes a
  // restoration: nothing is torn up until it starts, and everything is torn up once
  // it has. A blueprint with no restoration mapping authors no site work at all.
  return components[0] !== undefined && components[0].status !== 'unstarted' ? restoration : null
}

function refusalQuote(refusal: string): CancellationQuote {
  return { ok: false, refusal, rejections: [refusal], components: [], refund: 0, restorationRequired: false, projectIds: [] }
}

/** Every reason this exact placement may not be cancelled, engine-primary first. */
function placementRejections(placed: PlacedFacility | undefined, projectId: string): string[] {
  if (placed === undefined) return [`No installation is committed under project "${projectId}".`]
  const rejections: string[] = []
  if (placed.installation === undefined) rejections.push('Only installation work inside an existing building can be cancelled.')
  if (isRestorationBlueprint(placed.blueprintId)) rejections.push('Restoration is the cost of a cancellation, not work you may cancel.')
  if (placed.status === 'cancelled') rejections.push(`That work was already cancelled in Week ${String(placed.cancellation?.week ?? placed.placedWeek)}.`)
  else if (placed.status === 'operational') rejections.push('That work is already finished. Cancelling it would not undo it.')
  return rejections
}

/** One placement's own quote, with its committed components priced at the cancel week. */
function placementQuote(state: GameState, placed: PlacedFacility): CancellationQuote {
  const components = componentProgress(committedComponents(state, placed), state.market.tick - placed.placedWeek)
  return {
    ok: true, refusal: null, rejections: [], components,
    refund: components.reduce((total, component) => total + component.refunded, 0),
    restorationRequired: restorationOwed(placed.blueprintId, components) !== null,
    projectIds: [placed.projectId],
  }
}

/** Every placement of one adoption that is still cancellable, in record order. */
function adoptionCancellable(state: GameState, adoptionId: string): PlacedFacility[] {
  const adoption = state.technology.adoptions.find((row) => row.id === adoptionId)
  if (adoption === undefined) return []
  return state.placement.facilities.filter(
    (placed) => adoption.physicalProjectIds.includes(placed.projectId) && placed.status === 'underConstruction',
  )
}

/**
 * What cancelling this project — or every remaining piece of this adoption's
 * physical work — would pay, refund and restore. A PRE-COMMIT read, in the shape
 * S5's `adoptionQuote` already established: a refused request has no price, its
 * `refusal` is the engine-primary reason and `rejections` is the whole list.
 */
export function cancellationQuote(state: GameState, target: CancellationTarget): CancellationQuote {
  if ('projectId' in target) {
    const placed = state.placement.facilities.find((candidate) => candidate.projectId === target.projectId)
    const rejections = placementRejections(placed, target.projectId)
    if (rejections.length > 0) return { ok: false, refusal: rejections[0]!, rejections, components: [], refund: 0, restorationRequired: false, projectIds: [] }
    return placementQuote(state, placed!)
  }
  const adoption = state.technology.adoptions.find((row) => row.id === target.adoptionId)
  if (adoption === undefined) return refusalQuote(`No adoption is committed under "${target.adoptionId}".`)
  if (adoption.studioId !== state.hollywood?.playerStudioId) return refusalQuote('That adoption belongs to another studio.')
  if (adoption.cancelledWeek !== null) return refusalQuote(`That adoption was already cancelled in Week ${String(adoption.cancelledWeek)}.`)
  const cancellable = adoptionCancellable(state, target.adoptionId)
  if (cancellable.length === 0) return refusalQuote('Every part of that adoption is already finished or cancelled.')
  const quotes = cancellable.map((placed) => placementQuote(state, placed))
  return {
    ok: true, refusal: null, rejections: [],
    components: quotes.flatMap((quote) => quote.components),
    refund: quotes.reduce((total, quote) => total + quote.refund, 0),
    restorationRequired: quotes.some((quote) => quote.restorationRequired),
    projectIds: quotes.flatMap((quote) => quote.projectIds),
  }
}

/**
 * Cancel ONE committed installation. Byte-neutral on a refused request, exactly as
 * every other commit helper in this engine is: the ACTION layer owns the refusal
 * sentence, and the pure helper returns the state it was given.
 */
export function cancelInstallation(state: GameState, projectId: string): GameState {
  const quote = cancellationQuote(state, { projectId })
  return quote.ok ? applyCancellation(state, quote.projectIds) : state
}

/** Cancel every remaining physical component of one adoption, in one action. */
export function cancelAdoption(state: GameState, adoptionId: string): GameState {
  const quote = cancellationQuote(state, { adoptionId })
  return quote.ok ? applyCancellation(state, quote.projectIds) : state
}

/**
 * The ONE mutation. Every cancelled project gets its receipt, its single refund
 * row and — where its site work had begun — its restoration job; every adoption
 * that owned any of that work is stamped cancelled and lets go of its equipment.
 */
function applyCancellation(state: GameState, projectIds: readonly string[]): GameState {
  const week = state.market.tick
  const receipts = new Map<string, CancellationReceipt>()
  const ledger: LedgerEntry[] = []
  let facilities = [...state.placement.facilities]
  let nextPlacementId = state.placement.nextPlacementId
  let cash = state.studio.cash

  for (const projectId of projectIds) {
    const index = facilities.findIndex((placed) => placed.projectId === projectId)
    if (index < 0) continue
    const placed = facilities[index]!
    const components = componentProgress(committedComponents(state, placed), week - placed.placedWeek)
    const refund = components.reduce((total, component) => total + component.refunded, 0)
    const restorationBlueprintId = restorationOwed(placed.blueprintId, components)

    let restorationProjectId: string | null = null
    if (restorationBlueprintId !== null) {
      const blueprint = blueprintById(restorationBlueprintId)
      if (blueprint === null) {
        throw new Error(`installation cancellation: unknown restoration blueprint "${restorationBlueprintId}"`)
      }
      const identity = reservePlacementIdentity(
        { ...state, placement: { ...state.placement, facilities, nextPlacementId } },
        blueprint,
      )
      const restoration: PlacedFacility = {
        id: identity.id, blueprintId: blueprint.id, parcelId: placed.parcelId, origin: { ...placed.origin }, cells: [],
        facilityId: identity.facilityId, projectId: identity.projectId,
        status: 'underConstruction', placedWeek: week, completesWeek: week + blueprint.buildWeeks,
        installation: { targetFacilityId: placed.installation!.targetFacilityId },
        cancellation: null,
      }
      facilities = [...facilities, restoration]
      nextPlacementId = identity.id + 1
      restorationProjectId = restoration.projectId
      // Paid in full at its own commit, on its own project id, exactly as every
      // other installation is. It is a forced cost, so it is charged whatever the
      // balance says: a studio that cannot afford to put the building right still
      // owes the work it started.
      cash -= blueprint.capex
      ledger.push({ week, kind: 'constructionCapex', amount: -blueprint.capex, constructionProjectId: restoration.projectId, note: blueprint.ledgerNote })
    }

    const receipt: CancellationReceipt = { projectId, week, components, refund, restorationProjectId }
    receipts.set(projectId, receipt)
    facilities[index] = { ...placed, status: 'cancelled', cancellation: receipt }
    cash += refund
    ledger.push({ week, kind: 'constructionRefund', amount: refund, constructionProjectId: projectId, note: INSTALLATION_CANCELLATION_LEDGER_NOTE })
  }
  if (receipts.size === 0) return state

  // A cancelled placement breaks its adoption's chain for good: the adoption is
  // stamped, keeps every component row and project reference it ever had as
  // history, and lets go of its equipment so the asset can be reused at $0 by a
  // restart. The asset row itself — its source, cost and acquisition week — is
  // never touched: the studio still owns what it bought.
  const cancelledAdoptionIds = new Set<string>()
  const adoptions = state.technology.adoptions.map((adoption) => {
    if (adoption.cancelledWeek !== null || !adoption.physicalProjectIds.some((id) => receipts.has(id))) return adoption
    cancelledAdoptionIds.add(adoption.id)
    return { ...adoption, cancelledWeek: week }
  })
  const equipment = cancelledAdoptionIds.size === 0 ? state.technology.equipment : state.technology.equipment.map(
    (asset) => (asset.holderAdoptionId !== null && cancelledAdoptionIds.has(asset.holderAdoptionId) ? { ...asset, holderAdoptionId: null } : asset),
  )

  const placement = { ...state.placement, nextPlacementId, facilities }
  return {
    ...state,
    studio: { ...state.studio, cash },
    ledger: [...state.ledger, ...ledger],
    placement,
    // A restoration CLOSES its target the moment it starts, and a cancelled
    // conversion stops closing it the moment it is cancelled — one derivation, run
    // once, so the registry that comes back is exactly the one that went away.
    operations: withConversionDowntime(placement, state.operations),
    technology: { ...state.technology, adoptions, equipment },
  }
}

/**
 * The V26 cancellation law over a whole state: every receipt reconciles with the
 * money that actually moved, every cancelled record is dead in the same three ways,
 * and nothing claims a restoration it never owed. Returns EVERY violation it finds,
 * in state order, so a forged save reports the fact it broke rather than the first
 * check that happened to run.
 */
export function validateInstallationCancellation(state: GameState): string[] {
  const violations: string[] = []
  const refundRows = state.ledger.filter((entry) => entry.kind === 'constructionRefund')
  const cancelledProjectIds = new Set<string>()

  for (const placed of state.placement.facilities) {
    const label = `placed facility ${String(placed.id)}`
    if (!Object.hasOwn(placed, 'cancellation')) { violations.push(`${label} is missing its cancellation leaf`); continue }
    const receipt = placed.cancellation
    if ((placed.status === 'cancelled') !== (receipt !== null)) {
      violations.push(`${label} carries ${receipt === null ? 'no cancellation receipt for a cancelled record' : 'a cancellation receipt without being cancelled'}`)
      continue
    }
    if (receipt === null) continue
    if (isRestorationBlueprint(placed.blueprintId)) violations.push(`${label} is a restoration job, which can never be cancelled`)
    cancelledProjectIds.add(placed.projectId)

    if (receipt.projectId !== placed.projectId) violations.push(`${label} receipt names project "${receipt.projectId}"`)
    if (!Number.isInteger(receipt.week) || receipt.week < placed.placedWeek || receipt.week > state.market.tick) {
      violations.push(`${label} receipt week is outside its own committed life`)
    }
    if (receipt.week >= placed.completesWeek) violations.push(`${label} receipt cancels work that had already completed`)

    const authored = blueprintById(placed.blueprintId)?.installationComponents ?? []
    if (receipt.components.length !== authored.length) violations.push(`${label} receipt does not mirror its blueprint's authored components`)
    let cost = 0, paid = 0, refunded = 0
    for (const component of receipt.components) {
      if (!Number.isSafeInteger(component.cost) || component.cost < 0 || !Number.isSafeInteger(component.paid) || component.paid < 0 ||
        !Number.isSafeInteger(component.refunded) || component.refunded < 0) {
        violations.push(`${label} receipt line "${component.label}" carries a negative or invalid figure`)
      }
      if (component.paid + component.refunded !== component.cost) {
        violations.push(`${label} receipt line "${component.label}" does not reconcile: ${String(component.paid)} paid + ${String(component.refunded)} refunded is not ${String(component.cost)}`)
      }
      if (!['completed', 'inProgress', 'unstarted'].includes(component.status)) violations.push(`${label} receipt line "${component.label}" has an unknown status`)
      cost += component.cost; paid += component.paid; refunded += component.refunded
    }
    if (receipt.refund !== refunded) violations.push(`${label} receipt refund ${String(receipt.refund)} is not the refunded column ${String(refunded)}`)
    if (paid + refunded !== cost) violations.push(`${label} receipt does not reconcile with its own component costs`)
    const capex = state.ledger.find((entry) => entry.kind === 'constructionCapex' && entry.constructionProjectId === placed.projectId)
    if (capex === undefined) violations.push(`${label} was cancelled without a capital row to refund`)
    else if (cost !== -capex.amount) violations.push(`${label} receipt prices work this project was never charged for`)

    const rows = refundRows.filter((entry) => entry.constructionProjectId === placed.projectId)
    if (rows.length !== 1) violations.push(`${label} has ${String(rows.length)} cancellation refund rows; exactly one is lawful`)
    else if (rows[0]!.amount !== receipt.refund || rows[0]!.week !== receipt.week || rows[0]!.note !== INSTALLATION_CANCELLATION_LEDGER_NOTE) {
      violations.push(`${label} cancellation refund row disagrees with its receipt`)
    }

    const owed = restorationOwed(placed.blueprintId, receipt.components)
    if ((receipt.restorationProjectId !== null) !== (owed !== null)) {
      violations.push(owed === null
        ? `${label} claims a restoration its own work never made necessary`
        : `${label} began site work and owes a restoration its receipt does not name`)
    } else if (receipt.restorationProjectId !== null) {
      const restoration = state.placement.facilities.find((candidate) => candidate.projectId === receipt.restorationProjectId)
      if (restoration === undefined || restoration.blueprintId !== owed || restoration.installation?.targetFacilityId !== placed.installation?.targetFacilityId) {
        violations.push(`${label} names a restoration that does not stand on its own target`)
      }
    }
  }

  for (const entry of refundRows) {
    if (!cancelledProjectIds.has(entry.constructionProjectId)) {
      violations.push(`cancellation refund "${entry.constructionProjectId}" refunds work no cancelled placement owns`)
    }
    if (!Number.isSafeInteger(entry.amount) || entry.amount < 0) violations.push(`cancellation refund "${entry.constructionProjectId}" is not a positive whole-dollar credit`)
  }

  for (const adoption of state.technology.adoptions) {
    if (!Object.hasOwn(adoption, 'cancelledWeek')) { violations.push(`adoption "${adoption.id}" is missing its cancelledWeek leaf`); continue }
    const broken = adoption.physicalProjectIds.some((id) => cancelledProjectIds.has(id))
    if (adoption.cancelledWeek === null) {
      if (broken) violations.push(`adoption "${adoption.id}" keeps cancelled physical work without being cancelled`)
      continue
    }
    if (!Number.isInteger(adoption.cancelledWeek) || adoption.cancelledWeek < adoption.committedWeek || adoption.cancelledWeek > state.market.tick) {
      violations.push(`adoption "${adoption.id}" was cancelled outside its own life`)
    }
    if (!broken) violations.push(`adoption "${adoption.id}" is cancelled with no cancelled physical work`)
    if (adoption.operationalWeek !== null) violations.push(`adoption "${adoption.id}" is cancelled and operational`)
  }

  // "An asset is unheld exactly while its adoption is cancelled", in BOTH
  // directions, asked of the HOLDER relationship rather than of every historical
  // reference: a cancelled adoption keeps naming the asset it paid for forever, and
  // a restart may lawfully be holding that same asset (S5's reuse at $0), so the
  // rule is about who HOLDS it now.
  //   * an asset whose holder is a cancelled adoption is refused — cancelling is
  //     what lets go of it, and a stuck asset would deny the studio the reuse it
  //     paid for;
  //   * an UNHELD asset that a live adoption still names is refused — that adoption
  //     is working, so the set is in use and cannot also be free for the next one.
  for (const asset of state.technology.equipment) {
    if (asset.holderAdoptionId === null) {
      for (const adoption of state.technology.adoptions) {
        if (adoption.equipmentAssetId === asset.id && adoption.cancelledWeek === null) {
          violations.push(`equipment asset "${asset.id}" is unheld while adoption "${adoption.id}" still owns it`)
        }
      }
      continue
    }
    const holder = state.technology.adoptions.find((adoption) => adoption.id === asset.holderAdoptionId)
    if (holder !== undefined && holder.cancelledWeek !== null) {
      violations.push(`equipment asset "${asset.id}" is still held by cancelled adoption "${holder.id}"`)
    }
  }
  return violations
}
