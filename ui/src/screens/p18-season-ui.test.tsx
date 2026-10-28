// ── P18 Sprint 13 browser slice: commission a season on Assembly, follow, cancel and settle it on the Dashboard ──
//
// RED-first against d174d667: this file imports only modules that exist there (the core, the P18 route helper and the
// existing screens), so every case fails by assertion (a missing panel or test id), never by a missing module. The
// world is the P18 route (tests/helpers/p18-route.ts, GREEN in the core lane), built once at collection; the live,
// first-unit, cancelled, owed and delivered worlds come from the core actions and the real tick. No hook or timeout.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { applyActions, tvStallText } from '../../../src/core/index.ts'
import type { GameState } from '../../../src/core/index.ts'
import { FIGURES, agreement, attempt, request, season, seasonRoute, tickUntil, withCash, type CommissionLocal } from '../../../tests/helpers/p18-route.ts'
import { moneyExact } from '../format.ts'
import { Assembly } from './Assembly.tsx'
import { Dashboard } from './Dashboard.tsx'

afterEach(cleanup)

const route = seasonRoute()
const C = route.state.market.tick
const accepted = attempt(route.state, request(route))
if (accepted.error !== undefined) throw new Error(`premise: the lawful commission is accepted: ${accepted.error}`)
const live = accepted.state
const seasonId = season(live).seasonId
const firstUnit = tickUntil(live, (s) => season(s).work.creditedUnits >= 1, 4, 'the first credited unit')
const delivered = tickUntil(firstUnit, (s) => season(s).status === 'delivered', 24, 'delivery')

/** The core action behind the panel's commit, as App wires it: the outcome the surface shows. */
const commitAt = (state: GameState) => (commission: CommissionLocal) => {
  const result = attempt(state, commission)
  return result.error === undefined ? { ok: true as const, next: result.state } : { ok: false as const, error: result.error }
}
const actOn = (state: GameState, action: Parameters<typeof applyActions>[1][number]) => {
  try { return { ok: true as const, next: applyActions(state, [action]) } } catch (e) { return { ok: false as const, error: (e as Error).message } }
}

function dashboard(state: GameState, handlers: Partial<Parameters<typeof Dashboard>[0]> = {}) {
  return render(
    <Dashboard state={state} onAdvance={() => {}} onAssemble={() => {}} onSimToEvent={() => {}} onCreateTalent={() => {}}
      onSaves={() => {}} onOpenAutopsy={() => {}} {...handlers} />,
  )
}

describe('P18 browser slice — the Assembly "Commission a season" panel', () => {
  it('shows the core quote, names every refusal and dispatches the commission the core accepts', () => {
    const onCommission = vi.fn(commitAt(route.state))
    render(<Assembly state={route.state} onGreenlit={() => {}} onCancel={() => {}} {...{ onCommissionTvSeason: onCommission }} />)
    expect(screen.queryByTestId('season-open'), 'Assembly offers the season panel').not.toBeNull()
    fireEvent.click(screen.getByTestId('season-open'))
    const quote = screen.getByTestId('season-quote')
    expect(quote).toHaveTextContent(`Work floor (twelve units): ${moneyExact(FIGURES.floor)}`)
    expect(quote).toHaveTextContent(`Fixed obligations over the next ${FIGURES.quoteWeeks} weeks`)
    expect(quote).toHaveTextContent(`Cancellation provision: ${moneyExact(FIGURES.provision)}`)
    expect(screen.getByTestId('season-quote-advance')).toHaveTextContent(`The advance of ${moneyExact(FIGURES.advance)} arrives on acceptance`)
    // An empty title: the core's own refusal by name, and the commit stays disabled.
    expect(screen.getByTestId('season-refusal')).toHaveTextContent('a new series needs a non-empty title')
    expect(screen.getByTestId('season-commission')).toBeDisabled()
    fireEvent.change(screen.getByTestId('season-title'), { target: { value: 'The Long Night' } })
    expect(screen.queryByTestId('season-refusal')).toBeNull()
    // An unchosen writer: the shape refusal, verbatim.
    const writer = (screen.getByTestId('season-writerId') as HTMLSelectElement).value
    fireEvent.change(screen.getByTestId('season-writerId'), { target: { value: '' } })
    expect(screen.getByTestId('season-refusal')).toHaveTextContent('every roster id must be a non-empty string')
    fireEvent.change(screen.getByTestId('season-writerId'), { target: { value: writer } })
    expect(screen.getByTestId('season-commission')).toBeEnabled()
    fireEvent.click(screen.getByTestId('season-commission'))
    expect(onCommission).toHaveBeenCalledTimes(1)
    const sent = onCommission.mock.calls[0]![0]
    expect(sent).toMatchObject({ seriesTitle: 'The Long Night', propertyId: route.propertyId, adoptionId: route.adoptionId })
    expect(onCommission.mock.results[0]!.value).toMatchObject({ ok: true })
    expect(screen.queryByTestId('season-commit-refusal')).toBeNull()
  })

  it('voices a refusal at commit in the player\'s words, with the core\'s own sentence behind the disclosure, never a generic message', () => {
    // The panel quoted on the pre-commission world; the commit lands on a world where a season is already live.
    const onCommission = vi.fn(commitAt(live))
    render(<Assembly state={route.state} onGreenlit={() => {}} onCancel={() => {}} {...{ onCommissionTvSeason: onCommission }} />)
    expect(screen.queryByTestId('season-open'), 'Assembly offers the season panel').not.toBeNull()
    fireEvent.click(screen.getByTestId('season-open'))
    fireEvent.change(screen.getByTestId('season-title'), { target: { value: 'The Long Night' } })
    fireEvent.click(screen.getByTestId('season-commission'))
    const outcome = onCommission.mock.results[0]!.value as { ok: false; error: string }
    expect(outcome.ok).toBe(false)
    expect(outcome.error).toContain(`one active season per studio: "${seasonId}" is live`)
    const refusal = screen.getByTestId('season-commit-refusal')
    expect(refusal).toHaveAttribute('role', 'alert')
    // FIX-S13B-1 item 2: the voiced line names the series, never the developer prefix or the season id.
    const line = screen.getByTestId('season-commit-refusal-line')
    expect(line).toHaveTextContent('Not available: one active season per studio: "The Long Night" is live')
    expect(line.textContent ?? '').not.toContain('applyActions')
    expect(line.textContent ?? '').not.toContain(seasonId)
    // The core's own sentence stays one click away, verbatim.
    expect(screen.getByTestId('season-commit-refusal-raw')).toHaveTextContent(outcome.error)
  })
})

describe('P18 browser slice — labels and stall text in the player\'s words (FIX-S13B-1 item 3)', () => {
  it('labels the sound chain by its stage and Post names, voices a rights stall, and never falls back to an id', () => {
    render(<Assembly state={route.state} onGreenlit={() => {}} onCancel={() => {}} {...{ onCommissionTvSeason: vi.fn() }} />)
    expect(screen.queryByTestId('season-open'), 'Assembly offers the season panel').not.toBeNull()
    fireEvent.click(screen.getByTestId('season-open'))
    const adoption = route.state.technology.adoptions.find((a) => a.id === route.adoptionId)!
    const facility = (id: string) => route.state.operations.facilities.find((f) => f.id === id)!.name
    const chain = screen.getByTestId('season-adoption') as HTMLSelectElement
    expect(chain.selectedOptions[0]!.textContent).toBe(`${facility(adoption.stageFacilityId)} with ${facility(adoption.postFacilityId!)}`)
    expect(chain.textContent ?? '').not.toContain(route.adoptionId)
    const rival = firstUnit.hollywood!.identities.find((x) => x.studioId !== firstUnit.hollywood!.playerStudioId)!
    expect(tvStallText(firstUnit, { kind: 'rights', reason: `production: noAuthority:${rival.studioId}` }))
      .toBe(`the producer's production permission does not hold: the right is held by ${rival.name}`)
    expect(() => tvStallText(firstUnit, { kind: 'participant', talentId: 'no-such-person' })).toThrow('tv view: no talent record for no-such-person')
  })
})

describe('P18 browser slice — the Dashboard season row', () => {
  it('shows the live season: block, units credited, next milestone and due/final weeks', () => {
    dashboard(firstUnit)
    expect(screen.queryByTestId(`season-row-${seasonId}`), 'the Dashboard lists the season').not.toBeNull()
    expect(screen.getByTestId(`season-progress-${seasonId}`)).toHaveTextContent(
      `Season scripts · 1 of 12 units credited · due week ${C + FIGURES.dueWeeks}, final week ${C + FIGURES.finalWeeks}`)
    expect(screen.getByTestId(`season-milestone-${seasonId}`)).toHaveTextContent(`Next: Scripts milestone ${moneyExact(FIGURES.scripts)} at unit 3`)
    expect(screen.getByTestId(`season-state-${seasonId}`)).toHaveTextContent('In production')
  })

  it('cancel shows the settlement before the confirm, dispatches only on confirm, and the row turns terminal', () => {
    const onCancel = vi.fn((id: string) => actOn(firstUnit, { kind: 'cancelTvSeason', seasonId: id }))
    dashboard(firstUnit, { onCancelTvSeason: onCancel })
    expect(screen.queryByTestId(`season-cancel-${seasonId}`), 'the live row offers Cancel').not.toBeNull()
    fireEvent.click(screen.getByTestId(`season-cancel-${seasonId}`))
    expect(onCancel).not.toHaveBeenCalled()
    expect(screen.getByTestId(`season-cancel-settlement-${seasonId}`)).toHaveTextContent(
      `Cancelling now returns the unearned advance ${moneyExact(FIGURES.advance)} and charges ${moneyExact(120_000)}: `
      + `${moneyExact(FIGURES.advance)} refunded and ${moneyExact(120_000)} charged from cash now, $0 left owed.`)
    fireEvent.click(screen.getByTestId(`season-cancel-confirm-${seasonId}`))
    expect(onCancel).toHaveBeenCalledWith(seasonId)
    const outcome = onCancel.mock.results[0]!.value
    if (!outcome.ok) throw new Error(`premise: the live season cancels: ${outcome.error}`)
    cleanup()
    dashboard(outcome.next)
    expect(screen.getByTestId(`season-state-${seasonId}`)).toHaveTextContent(`Cancelled at week ${firstUnit.market.tick} (cancelled by the studio)`)
    expect(screen.queryByTestId(`season-cancel-${seasonId}`)).toBeNull()
    expect(screen.queryByTestId(`season-settle-${seasonId}`)).toBeNull()
  })

  it('offers no Settle verb at zero cash, the owed figure still shown (FIX-S13B-1 item 6)', () => {
    const broke = applyActions(withCash(firstUnit, 50_000), [{ kind: 'cancelTvSeason', seasonId }])
    dashboard(broke, { onSettleTvObligations: vi.fn() })
    expect(screen.queryByTestId(`season-row-${seasonId}`), 'the Dashboard lists the season').not.toBeNull()
    expect(screen.queryByTestId(`season-settle-${seasonId}`)).toBeNull()
    expect(screen.getByTestId(`season-money-${seasonId}`)).toHaveTextContent(`owed ${moneyExact(190_000)}`)
  })

  it('offers Settle when a cancellation left obligations owed and dispatches the payable amount against the balance shown', () => {
    const owed = withCash(applyActions(withCash(firstUnit, 50_000), [{ kind: 'cancelTvSeason', seasonId }]), 100_000)
    const onSettle = vi.fn((agreementId: string, expectedRemaining: number, amount: number) =>
      actOn(owed, { kind: 'settleTvObligations', agreementId, expectedRemaining, amount }))
    dashboard(owed, { onSettleTvObligations: onSettle })
    expect(screen.queryByTestId(`season-settle-${seasonId}`), 'the owed row offers Settle').not.toBeNull()
    expect(screen.getByTestId(`season-settle-${seasonId}`)).toHaveTextContent(`Settle ${moneyExact(100_000)} of ${moneyExact(190_000)} owed`)
    fireEvent.click(screen.getByTestId(`season-settle-${seasonId}`))
    expect(onSettle).toHaveBeenCalledWith(agreement(owed).agreementId, 190_000, 100_000)
    expect(onSettle.mock.results[0]!.value).toMatchObject({ ok: true })
  })

  it('the delivered season card shows its delivered state and the commissioner\'s window', () => {
    const at = season(delivered).deliveredWeek!
    dashboard(delivered)
    expect(screen.queryByTestId(`season-state-${seasonId}`), 'the Dashboard lists the delivered season').not.toBeNull()
    expect(screen.getByTestId(`season-state-${seasonId}`)).toHaveTextContent(`Delivered at week ${at}`)
    expect(screen.getByTestId(`season-state-${seasonId}`)).toHaveTextContent(`through week ${at + FIGURES.distributionWeeks - 1}`)
    expect(screen.queryByTestId(`season-cancel-${seasonId}`)).toBeNull()
  })
})
