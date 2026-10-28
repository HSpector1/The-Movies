// ── P17 Sprint 11 browser slice, Fix 1: the explicit cancel of a reserved featured appearance, end to end ──
//
// Drives the new boundary action (`cancelCameoBookingAction`, ui/src/engine/continuation.ts), so this file is RED at T
// by missing module, not by assertion; it is kept apart so p17-continuation-ui.test.tsx stays RED by assertion. The world
// is the cameo route with one reserved booking on a greenlit picture (no state surgery). Built once at collection.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { applyActions } from '../../../src/core/index.ts'
import { ask, cameoRoute, freeGuest, greenlight, rootOf } from '../../../tests/helpers/p17-cameo-route.ts'
import { cancelCameoBookingAction } from '../engine/continuation.ts'
import { money } from '../format.ts'
import { Dashboard } from './Dashboard.tsx'

afterEach(cleanup)

const { world, a, b, writer } = cameoRoute('p17-cameo-booking-01')
const guest = freeGuest(world, 'director', new Set([writer, a.director, a.craft, ...a.cast, b.director, b.craft, ...b.cast]))
const booked = applyActions(world, [greenlight(world, world.concepts[0]!, a, writer, [ask(guest, world.market.tick + 4)])])

describe('P17 browser slice — cancelling a reserved appearance', () => {
  it('the cancel action refunds fee less the retained charge, the card shows it, and a second cancel is refused verbatim in studio language', () => {
    const booking = rootOf(booked)!.bookings[0]!
    const cancelled = cancelCameoBookingAction(booked, booking.bookingId)
    if (!cancelled.ok) throw new Error(`premise: the reserved booking cancels: ${cancelled.error}`)
    expect(cancelled.next.studio.cash - booked.studio.cash).toBe(booking.fee - booking.retained)
    const again = cancelCameoBookingAction(cancelled.next, booking.bookingId)
    expect(again).toEqual({ ok: false, error: `applyActions: cancelCameoBooking rejected — ${booking.bookingId} is already cancelled` })

    // the stale card (still showing the reservation) hands the refusal back; the card voices it, never a raw notice
    const onCancel = vi.fn(() => again)
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
    fireEvent.click(screen.getByTestId(`booking-cancel-${booking.bookingId}`))
    const refusal = screen.getByTestId('booking-cancel-refusal')
    expect(refusal).toHaveAttribute('role', 'alert')
    expect(refusal.textContent ?? '').toContain(again.ok ? '' : again.error) // the raw note sits in the disclosure
    cleanup()

    // the cancelled booking on the production screen shows its refund and retained charge
    render(
      <Dashboard
        state={cancelled.next}
        onAdvance={() => {}}
        onAssemble={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )
    expect(screen.getByTestId(`booking-${booking.bookingId}`)).toHaveTextContent(
      `Cancelled (cancelled by the studio); refunded ${money(booking.fee - booking.retained)}, retained ${money(booking.retained)}`,
    )
    expect(screen.queryByTestId(`booking-cancel-${booking.bookingId}`)).not.toBeInTheDocument()
  })
})
