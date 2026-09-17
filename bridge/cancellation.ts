/**
 * P13B-S6's read side for installation cancellation. The engine's
 * `cancellationQuote` is the ONE authority for what a cancellation pays back and
 * what it owes; this module only shapes that answer for the wire and writes the
 * sentence a player reads, so the three surfaces that own a running installation
 * (Laboratory, Office, plans) publish the SAME facts in the same words.
 *
 * Two things are derived here rather than read from the receipt, and both are
 * derived from authored data alone:
 *   * per-component `kind`, through S5's own label classifier, NULL for an authored
 *     label it has no mapping for (the Office conversion's single component) — the
 *     gap is disclosed, never defaulted;
 *   * the restoration's `{blueprintId, cost, weeks}`, from the restoration
 *     blueprint the engine itself would commit.
 */
import { cancellationQuote, restorationBlueprintIdFor, type CancellationTarget } from '../src/core/installationCancellation.js'
import { blueprintById } from '../src/core/placement.js'
import { physicalKindOrNull } from '../src/core/technologyAdoption.js'
import type { Action, GameState } from '../src/core/types.js'
import type { IndustryPage } from './schema/industry-schema.ts'

type LaboratoryPage = NonNullable<IndustryPage['laboratory']>
/** The shared action-row quote: an `adopt-*` row's members, or a `cancel-*` row's. */
type ActionQuoteRow = NonNullable<LaboratoryPage['actions'][number]['quote']>
type Restoration = NonNullable<ActionQuoteRow['restoration']> | null

/**
 * Exactly what a `cancel-*` row fills. The adoption-only members of the shared row
 * (`total`, `reusedPostFacilityId`, `reusedEquipmentAssetId`) stay ABSENT rather than
 * being defaulted to a zero or a null this verb never priced.
 */
export type CancellationQuoteRow = {
  components: {
    kind: NonNullable<ActionQuoteRow['components'][number]['kind']> | null
    label: string; cost: number; weeks: number
    status: 'completed' | 'inProgress' | 'unstarted'
    paid: number; refunded: number
  }[]
  refund: number
  restoration: Restoration
  rejections: string[]
  refusal: string | null
}

export type CancellationAction = Extract<Action, { kind: 'cancelInstallation' } | { kind: 'cancelAdoption' }>

/** A cancellation verb is neither research, nor a plan, nor an installation commit. */
export const isCancellationAction = (action: { kind: string }): boolean =>
  action.kind === 'cancelInstallation' || action.kind === 'cancelAdoption'

const money = (value: number) => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })

/**
 * The restoration this cancellation would commit, or null. Asked of each stopped
 * project in the engine's own order, through the engine's own per-placement quote,
 * so "site work had begun" is decided exactly once — in `cancellationQuote`.
 */
function restorationOf(state: GameState, projectIds: readonly string[]): Restoration {
  for (const projectId of projectIds) {
    const placed = state.placement.facilities.find(candidate => candidate.projectId === projectId)
    if (placed === undefined || !cancellationQuote(state, { projectId }).restorationRequired) continue
    const restorationId = restorationBlueprintIdFor(placed.blueprintId)
    const blueprint = restorationId === null ? null : blueprintById(restorationId)
    if (blueprint === null) continue
    return {
      blueprintId: blueprint.id, cost: blueprint.capex,
      weeks: (blueprint.installationComponents ?? []).reduce((total, component) => total + component.weeks, 0),
    }
  }
  return null
}

/** The engine's quote as the wire carries it: no `ok`, no `projectIds`, `kind` derived. */
export function cancellationQuoteRow(state: GameState, target: CancellationTarget): CancellationQuoteRow {
  const quote = cancellationQuote(state, target)
  return {
    components: quote.components.map(component => ({
      kind: physicalKindOrNull(component.label), label: component.label, cost: component.cost,
      weeks: component.weeks, status: component.status, paid: component.paid, refunded: component.refunded,
    })),
    refund: quote.refund,
    restoration: restorationOf(state, quote.projectIds),
    rejections: [...quote.rejections],
    refusal: quote.refusal,
  }
}

const STATUS_WORD = { completed: 'completed', inProgress: 'part-worked', unstarted: 'not started' } as const

/** What the studio gets back, line by line, and what putting the building right costs. */
export function cancellationDetail(state: GameState, quote: CancellationQuoteRow): string {
  const lines = quote.components.map(component =>
    `${component.label} (${STATUS_WORD[component.status]}): ${money(component.paid)} paid, ${money(component.refunded)} returned`)
  const restoration = quote.restoration
  const name = restoration === null ? null : blueprintById(restoration.blueprintId)?.name ?? restoration.blueprintId
  return `${money(quote.refund)} of committed capital is returned. Completed work stays paid and is not undone. ` +
    `${lines.join('; ')}. ` +
    (restoration === null
      ? 'No restoration is owed: this work had not begun on the building itself.'
      : `${name} is committed in the same decision: ${money(restoration.cost)} charged now for ${String(restoration.weeks)} ` +
        `week${restoration.weeks === 1 ? '' : 's'} of work, and the building stays closed until it is done.`) +
    ` Cash after this decision: ${money(state.studio.cash + quote.refund - (restoration?.cost ?? 0))}.`
}
