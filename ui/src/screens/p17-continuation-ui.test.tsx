// ── P17 Sprint 11 browser slice: parent rights, continuation choice, featured appearances, cost and outcomes ──
//
// RED-first against e35bbacc: this file imports only modules that exist there (the core, the cameo route helper and
// the existing screens), so every case fails by assertion (a missing panel or test id), never by a missing module.
// The world is the cameo route (tests/helpers/p17-cameo-route.ts, GREEN in the core lane): the headless world founded
// at week 1871 and ticked to the 1956 unlock, then one original greenlit and released through the real tick. A
// directSequel of it with one featured guest is greenlit by the core action and released the same way. Built once at
// collection; no hook or timeout is set.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import {
  applyActions,
  continuationQuote,
  continuationWorldOf,
  fatigueAt,
  franchisesOf,
  installmentEdgeFor,
  momentumAt,
  predictProductionId,
  recognitionReported,
  resolveTitles,
  storyPropertyId,
  tick,
} from '../../../src/core/index.ts'
import type { Action, GameState } from '../../../src/core/index.ts'
import { cameoQuote, nominalShootingWeeks } from '../../../src/core/cameoBooking.ts'
import { ask, cameoRoute, freeGuest, greenlight, rootOf } from '../../../tests/helpers/p17-cameo-route.ts'
import { filmCareerImpact } from '../engine/careerImpact.ts'
import { money } from '../format.ts'
import { Assembly } from './Assembly.tsx'
import { Dashboard } from './Dashboard.tsx'
import { ReleaseResult } from './ReleaseResult.tsx'

afterEach(cleanup)

// ── the route ────────────────────────────────────────────────────────────────
const route = cameoRoute('p17-cameo-booking-01')
const { world, a, b, writer } = route
const [conceptA, conceptB, conceptC] = [world.concepts[0]!, world.concepts[1]!, world.concepts[2]!]

/** Run the newest production to Release Ready and commit it; the caller runs the release tick. */
function committed(state: GameState): GameState {
  const id = state.studio.activeProductions.at(-1)!.id
  let s = state
  for (let guard = 0; guard < 16 && s.studio.activeProductions.find((p) => p.id === id)!.remainingTicks > 1; guard++) s = tick(s)
  if (s.studio.activeProductions.find((p) => p.id === id)?.remainingTicks !== 1) throw new Error(`premise: ${id} never reached Release Ready`)
  return applyActions(s, [{ kind: 'commitPictureToRelease', productionId: id }])
}

const original = tick(committed(applyActions(world, [greenlight(world, conceptA, a, writer)])), { develop: true })
const origId = original.studio.releasedFilms.at(-1)!.productionId
if (original.studio.releasedFilms.at(-1)!.conceptId !== conceptA.id) throw new Error('premise: the original did not release')
const property = storyPropertyId(conceptA.id)
const studioId = original.hollywood!.playerStudioId
const W2 = original.market.tick
const principals = new Set([writer, a.director, a.craft, ...a.cast, b.director, b.craft, ...b.cast])
const guest = freeGuest(original, 'director', principals)
const sequelAction = {
  ...greenlight(original, conceptB, a, writer, [ask(guest, W2 + 4)]),
  continuation: { type: 'directSequel', predecessorProductionId: origId },
} as Action
const booked = applyActions(original, [sequelAction])
const sequelId = booked.studio.activeProductions.at(-1)!.id
const preRelease = committed(booked)
const postRelease = tick(preRelease, { develop: true })

// ── driving the real greenlight screen ───────────────────────────────────────
function pickFirstEligible(testId: string): void {
  const button = within(screen.getByTestId(testId))
    .getAllByRole('button')
    .find((c) => c.hasAttribute('aria-pressed') && !(c as HTMLButtonElement).disabled)
  if (!button) throw new Error(`setup: no eligible candidate in ${testId}`)
  fireEvent.click(button)
}

/** Mount the legacy wizard on `state` and walk it to Review with `conceptId` and the first eligible people. */
function reviewStep(state: GameState, conceptId: string) {
  const onGreenlit = vi.fn()
  render(<Assembly state={state} onGreenlit={onGreenlit} onCancel={() => {}} />)
  fireEvent.click(screen.getByTestId(`concept-${conceptId}`))
  for (let i = 0; i < 3; i++) fireEvent.click(screen.getByTestId('assembly-next'))
  for (const picker of ['picker-writer', 'picker-director', 'picker-lead', 'picker-antagonist', 'picker-support', 'picker-craft']) pickFirstEligible(picker)
  fireEvent.click(screen.getByTestId('assembly-next'))
  fireEvent.click(screen.getByTestId('assembly-next'))
  expect(screen.getByTestId('step-review')).toHaveClass('active')
  return onGreenlit
}

/** A whole-dollar figure as the screen prints it ($1,234,567 or -$1,234). */
const dollars = (el: HTMLElement) => Number((el.textContent ?? '').replace(/[^0-9-]/g, ''))

const plainQuote = (state: GameState, request: { type: 'directSequel' | 'reboot' | 'remake'; predecessorProductionId: string }) =>
  continuationQuote(continuationWorldOf(state), { studioId, productionId: predictProductionId(state), request })

describe('P17 browser slice — the continuation choice on the greenlight screen', () => {
  it('offers the core\'s lawful continuations of the released original, names the right relied on, and carries the chosen one', () => {
    const onGreenlit = reviewStep(original, conceptB.id)
    expect(screen.getByTestId(`continuation-property-${property}`)).toHaveTextContent('Title held')
    // no continuation recorded yet: the property meters are not invented, each choice carries the core's read
    expect(screen.getByTestId(`continuation-meters-${property}`)).toHaveTextContent('No continuation recorded yet')
    const choice = screen.getByTestId(`continuation-choice-directSequel-${origId}`) as HTMLInputElement
    expect(choice.disabled).toBe(false)
    const quote = plainQuote(original, { type: 'directSequel', predecessorProductionId: origId })
    if (!quote.ok) throw new Error(`premise: the core refuses the directSequel: ${quote.reason}`)
    const line = screen.getByTestId(`continuation-choice-directSequel-${origId}-quote`)
    expect(line).toHaveTextContent('Relies on the held title (sequel use)')
    expect(line).toHaveTextContent(`Recognition ${quote.recognition.toFixed(1)}`)
    expect(line).toHaveTextContent(`Fatigue ${quote.fatigue.toFixed(1)}`)

    fireEvent.click(choice)
    fireEvent.click(screen.getByTestId('greenlight'))
    expect(onGreenlit).toHaveBeenCalledTimes(1)
    const next = onGreenlit.mock.calls[0]![0] as GameState
    const edge = installmentEdgeFor(franchisesOf(next), next.studio.activeProductions.at(-1)!.id)
    expect(edge?.property.storyPropertyId).toBe(property)
    expect(edge?.edge).toMatchObject({ type: 'directSequel', parentProductionId: origId, studioId })
  })

  it('quotes the locked sequel too: a remake of unreleased work is refused by name, reboot legality and the meters come from the core', () => {
    reviewStep(booked, conceptC.id)
    const remake = screen.getByTestId(`continuation-choice-remake-${sequelId}`) as HTMLInputElement
    expect(remake.disabled).toBe(true)
    // the core's own words, with the film's id shown by its title
    expect(screen.getByTestId(`continuation-choice-remake-${sequelId}-refusal`)).toHaveTextContent(
      `a remake cites exactly one RELEASED film; ${conceptB.title} is not released`,
    )
    const recorded = franchisesOf(booked).properties.find((p) => p.storyPropertyId === property)!
    expect(screen.getByTestId(`continuation-meters-${property}`)).toHaveTextContent(
      `Recognition ${recognitionReported(recorded.meter, booked.market.tick).toFixed(1)} · Fatigue ${fatigueAt(recorded.meter, booked.market.tick).toFixed(1)}`,
    )
    const reboot = plainQuote(booked, { type: 'reboot', predecessorProductionId: origId })
    if (reboot.ok) expect(screen.getByTestId(`continuation-choice-reboot-${origId}-quote`)).toHaveTextContent(`Recognition ${reboot.recognition.toFixed(1)}`)
    else expect(screen.getByTestId(`continuation-choice-reboot-${origId}-refusal`)).toHaveTextContent(reboot.reason.split(origId).join(conceptA.title))
  })
})

describe('P17 browser slice — featured appearances and their cost', () => {
  it('lists eligible guests with the quoted fee, at most two; the fee joins the commitment and the booking rides the greenlight', () => {
    const onGreenlit = reviewStep(original, conceptB.id)
    const workWeek = nominalShootingWeeks(W2)[0]!
    expect((screen.getByTestId('guest-work-week') as HTMLSelectElement).value).toBe(String(workWeek))
    const boxes = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-testid^="guest-feature-"]'))
    expect(boxes.length).toBeGreaterThan(0)
    const first = boxes[0]!.dataset.testid!.replace('guest-feature-', '')
    const quote = cameoQuote(original, { talentId: first, workWeek })
    if (!quote.ok) throw new Error(`premise: the core refuses the listed guest: ${quote.reason}`)
    expect(screen.getByTestId(`guest-fee-${first}`)).toHaveTextContent(money(quote.fee))
    expect(boxes.length, 'premise: at least three eligible guests, so the capacity of two is observable').toBeGreaterThanOrEqual(3)
    const commitmentBefore = dollars(screen.getByTestId('release-commitment'))
    const cashAfterBefore = dollars(screen.getByTestId('release-cash-after'))
    fireEvent.click(boxes[0]!)
    fireEvent.click(boxes[1]!)
    expect(boxes.slice(2).every((x) => x.disabled)).toBe(true) // capacity two
    fireEvent.click(boxes[1]!)
    expect(screen.getByTestId('guest-cost-total')).toHaveTextContent(`add ${money(quote.fee)}`)
    // one screen, one total: the commitment line and the cash after greenlight both carry the fee the core charges
    expect(dollars(screen.getByTestId('release-commitment'))).toBe(commitmentBefore + quote.fee)
    expect(dollars(screen.getByTestId('release-cash-after'))).toBe(cashAfterBefore - quote.fee)

    fireEvent.click(screen.getByTestId('greenlight'))
    const next = onGreenlit.mock.calls[0]![0] as GameState
    expect(rootOf(next)?.bookings).toEqual([expect.objectContaining({ talentId: first, fee: quote.fee, basis: quote.basis, workWeek, status: 'reserved' })])
    expect(next.studio.cash).toBeLessThan(original.studio.cash)
    // the default choice is an original: no lineage is written
    expect(next.franchises).toBeUndefined()
  })

  it('before the 1956 unlock the guest panel discloses why, and a studio with no released work is offered no continuation', () => {
    reviewStep(route.before, conceptA.id)
    expect(screen.getByTestId('guest-unavailable')).toHaveTextContent('unlock at week 1872')
    expect(document.querySelectorAll('input[data-testid^="guest-feature-"]')).toHaveLength(0)
    expect(screen.getByTestId('continuation-none')).toBeInTheDocument()
  })

  it('the production screen shows the reserved booking with its retained-charge disclosure and an explicit cancel control', () => {
    const booking = rootOf(booked)!.bookings[0]!
    expect(booking.status).toBe('reserved')
    const onCancel = vi.fn()
    render(
      <Dashboard
        state={booked}
        onCancelCameoBooking={onCancel}
        onAdvance={() => {}}
        onAssemble={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )
    expect(screen.getByTestId(`booking-cancel-disclosure-${booking.bookingId}`)).toHaveTextContent(
      `retains ${money(booking.retained)} of the ${money(booking.fee)} fee and refunds ${money(booking.fee - booking.retained)}`,
    )
    fireEvent.click(screen.getByTestId(`booking-cancel-${booking.bookingId}`))
    expect(onCancel).toHaveBeenCalledWith(booking.bookingId)
  })
})

describe('P17 browser slice — the released film\'s outcome', () => {
  it('shows the lineage edge, the meters before and after the release, and the credited guest, from the core records', () => {
    const film = postRelease.studio.releasedFilms.find((f) => f.productionId === sequelId)
    expect(film).toBeDefined()
    const booking = rootOf(postRelease)!.bookings.find((x) => x.productionId === sequelId)!
    expect(booking.careerEvent).not.toBeNull()
    render(
      <ReleaseResult
        preTick={preRelease}
        postTick={postRelease}
        postTickStanding={postRelease.studio.standing}
        released={[film!]}
        careerImpactFor={(pid) => filmCareerImpact(postRelease, pid)}
        onOpenAutopsy={() => {}}
        onContinue={() => {}}
      />,
    )
    const propertyTitle = resolveTitles(postRelease).properties.find((p) => p.propertyId === property)?.title ?? conceptA.title
    expect(screen.getByTestId(`release-lineage-${sequelId}`)).toHaveTextContent(`Direct sequel of ${conceptA.title} in ${propertyTitle}, on the main continuity`)
    const edge = installmentEdgeFor(franchisesOf(postRelease), sequelId)!.edge
    const readings = (s: GameState) => {
      const p = franchisesOf(s).properties.find((x) => x.storyPropertyId === property)!
      const w = s.market.tick
      return [recognitionReported(p.meter, w), momentumAt(p.branches.find((b) => b.branchId === edge.branchId)!, w), fatigueAt(p.meter, w)].map((n) => n.toFixed(1))
    }
    const rows = within(screen.getByTestId(`release-meters-${sequelId}`)).getAllByRole('row')
    const cells = (row: HTMLElement) => within(row).getAllByRole('cell').map((c) => c.textContent)
    expect(within(rows[1]!).getByRole('rowheader')).toHaveTextContent('Before this release')
    expect(cells(rows[1]!)).toEqual(readings(preRelease))
    expect(within(rows[2]!).getByRole('rowheader')).toHaveTextContent('After this release')
    expect(cells(rows[2]!)).toEqual(readings(postRelease))
    expect(screen.getByTestId(`release-guest-${booking.bookingId}`)).toHaveTextContent(
      `credited; star power ${booking.careerEvent!.starPowerBefore.toFixed(1)} → ${booking.careerEvent!.starPowerAfter.toFixed(1)}`,
    )
  })
})
