// P14B.2 — pure, issuer-scoped promise reads and public evidence-backed trust.
// No new promise law or durable facts: the engine owns the descriptor and progress.
import { campaignDate } from '../src/core/calendar.ts'
import { PROMISE_SLACK_WEEKS, trustDescriptor } from '../src/core/promises.ts'
import type { GameState, PromiseOutcome } from '../src/core/types.ts'
import { promiseHistoryFor, type MarketPromiseHistoryRow } from './promises.ts'
import type { BridgeMarketAttentionRowSnapshot, BridgeTrustBlock } from './schema/bridge-schema.ts'

/** Display/reminder hypothesis: the same eight weeks as the published promise slack. */
export const PROMISE_ATTENTION_WEEKS = PROMISE_SLACK_WEEKS

/** The word each settled outcome is reported to its ISSUER by. An outcome with no
 * entry mints no attention row at all, which is why this is a table and not a
 * ternary: silence is correct for an outcome this surface has no word for, and a
 * wrong word is a false report. */
const PROMISE_OUTCOME_WORD: Partial<Record<PromiseOutcome, string>> = {
  SATISFIED: 'kept',
  BROKEN: 'broken',
  WAIVED: 'waived',
  VOIDED: 'voided',
}

export function trustBlockFor(
  state: GameState,
  talentId: string,
  viewerStudioId: string,
  week: number = state.market.tick,
): BridgeTrustBlock {
  const descriptor = trustDescriptor(state, talentId, viewerStudioId, week)
  const drivers = descriptor.drivers.map((driver) => ({ ...driver, dateLabel: campaignDate(driver.week).label }))
  return {
    label: descriptor.label,
    scope: descriptor.scope,
    drivers,
    line: drivers.length === 0 ? 'No record yet'
      : drivers.map((driver) => `${driver.reason} · ${String(campaignDate(driver.week).year)}`).join(' · '),
  }
}

/** The same issuer-only bound history on every carrier; history is not week-filtered. */
export function promiseRowsForPerson(
  state: GameState,
  talentId: string,
  viewerStudioId: string,
  _week: number = state.market.tick,
): MarketPromiseHistoryRow[] {
  return promiseHistoryFor(state, talentId, viewerStudioId)
}

/**
 * A promise outlives its market case. Scan promises directly, without a case,
 * proposal or former-employer guard. The optional person narrows the Profile
 * carrier; the workspace visits every bound promise this viewer issued.
 */
export function promiseAttentionRows(
  state: GameState,
  viewerStudioId: string,
  week: number = state.market.tick,
  talentId?: string,
): BridgeMarketAttentionRowSnapshot[] {
  const rows: BridgeMarketAttentionRowSnapshot[] = []
  const seen = new Set<string>()
  const names = new Map(state.talent.map((person) => [person.id, person.name]))
  for (const promise of state.promises) {
    if (promise.issuerStudioId !== viewerStudioId || promise.contractId === null) continue
    if (talentId !== undefined && promise.beneficiaryPersonId !== talentId) continue
    const personId = promise.beneficiaryPersonId
    const name = names.get(personId) ?? personId
    const add = (cause: BridgeMarketAttentionRowSnapshot['cause'], reason: string): void => {
      const key = `${cause}:${personId}`
      if (seen.has(key)) return
      seen.add(key)
      rows.push({ cause, talentId: personId, reason })
    }
    if (promise.outcome === null && promise.progress === 0
      && promise.dueWeekExclusive - week <= PROMISE_ATTENTION_WEEKS) {
      add('promiseDue', `Promise to ${name} due Week ${String(promise.dueWeekExclusive)} — filming has not begun`)
    }
    // P14B.7: the gate and the WORD move together. This was a two-way ternary
    // with no third arm, so admitting WAIVED at the gate alone would have
    // published a settlement the person ACCEPTED as "broken" — a breach that did
    // not happen. C.2c adds the issuer-only VOIDED word for retirement, with its
    // own cause and no implication that the studio broke its promise.
    const word = promise.outcome === null ? undefined : PROMISE_OUTCOME_WORD[promise.outcome]
    if (promise.outcomeWeek === week && word !== undefined) {
      add('promiseOutcome', `Promise to ${name} ${word} — ${promise.outcomeCause}`)
    }
  }
  return rows
}
