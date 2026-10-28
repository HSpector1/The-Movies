// ── P17 Shape A on a live engaged studio: bookings, one week of work, fees, cancellation and employment law ──
//
// Authority: 1367-stage/p17-prep/P17-CAMEO-CONTRACT.md (adopted, provisional rules) §2 capability, §3 credits, §4
// quote/commit/one-week work/fee/cancellation/employment exit, §5 persistence, §6 RED items 1, 2, 5, 6, 7 and 8. Scope
// of Sprint 11: existing eligible film professionals only, the real employment/availability/lifecycle owners, lawful
// fees, the three-principal shape with at most two featured guests, cancellation and its obligations.
//
// RED-first against the parent 2c50c9df (tag p17-sprint10-checkpoint-20261027): this file imports only modules the
// parent has, so each case fails there by assertion — the parent ignores `cameos`, refuses nothing, charges nothing and
// keeps no root. Every case opens with an assertion on the booking it needs, so no case reaches a TypeError at the
// parent. The world is built once at collection (tests/helpers/p17-cameo-route.ts); no hook carries it.
//
// Fix 1 (against fd2cc2e0): the stale-basis case is RED at fd2cc2e0 too (the basis was re-derived silently); the
// closure case and the split validator cases are RED at 2c50c9df by assertion and GREEN at fd2cc2e0 by design.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { hiringMarketView } from '../src/core/castingPackageReadModel.js'
import { busyTalentIds, hiringMarketIds } from '../src/core/employment.js'
import { studioEmployerId } from '../src/core/hollywood.js'
import { convertV50ToV49, exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveP17 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, GameState } from '../src/core/types.js'
import { ask, cameoRoute, closureRoute, closuresOf, expectedFee, freeGuest, greenlight, releaseNewest, rootOf, UNLOCK_WEEK, type Booking } from './helpers/p17-cameo-route.js'

const route = cameoRoute('p17-cameo-booking-01')
const { world, a, b, writer } = route
const W = world.market.tick
const principals = new Set([writer, a.director, a.craft, ...a.cast, b.director, b.craft, ...b.cast])
const guest = freeGuest(world, 'director', principals)
const guest2 = freeGuest(world, 'writer', new Set([...principals, guest.id]))
const conceptA = world.concepts[0]!
const conceptB = world.concepts[1]!
const SHOOT = W + 4 // legacy schedule: the 5 → 4 advance runs in the tick of week W + 4
const feeRows = (s: GameState, talentId: string) => s.ledger.filter((e) => e.kind === 'freelancerFee' && e.talentId === talentId).map((e) => [e.week, e.amount, /cameo/i.test(e.note)])
const bookingOf = (s: GameState, talentId: string): Booking | undefined => rootOf(s)?.bookings.find((x) => x.talentId === talentId)
/** No retirement record (current profession or actor episode) can refuse this person first. */
const unretired = (s: GameState, id: string) => retirementRecordFor(s, id) === undefined && retirementRecordFor(s, id, 'actor') === undefined
const unchanged = (fn: () => GameState, pattern: RegExp) => {
  const before = stableStringify(world)
  expect(fn).toThrow(pattern)
  expect(stableStringify(world)).toBe(before)
}

describe('P17 Shape A — capability, identity and an atomic, charged booking', () => {
  it('week 1871 has no featured capability; week 1872 books one; zero bookings write no root and keep every byte', () => {
    expect(W).toBe(UNLOCK_WEEK)
    const at1871 = route.before
    expect(() => applyActions(at1871, [greenlight(at1871, at1871.concepts[0]!, a, writer, [ask(guest, at1871.market.tick + 4)])])).toThrow(/unlock at week 1872 .* week 1871 has no capability/)
    const booked = applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, SHOOT)])])
    expect(rootOf(booked)?.bookings).toHaveLength(1)
    const plain = applyActions(world, [greenlight(world, conceptA, a, writer)])
    const empty = applyActions(world, [greenlight(world, conceptA, a, writer, [])])
    expect(Object.hasOwn(plain, 'cameos')).toBe(false)
    expect(exportSave(makeSave(empty))).toBe(exportSave(makeSave(plain)))
  })

  it('charges the quoted fee once as a direct production cost, reserves the week, stamps basis and profession, and locks the guest into the forecast', () => {
    const booked = applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, SHOOT)])])
    const plain = applyActions(world, [greenlight(world, conceptA, a, writer)])
    const x = bookingOf(booked, guest.id)
    expect(x).toMatchObject({ bookingId: 'cameo-1', status: 'reserved', workWeek: SHOOT, bookedWeek: W, basis: 'freelance', profession: 'director', fee: expectedFee(guest) })
    expect(x!.retained).toBe(Math.round(x!.fee * 0.25))
    expect(x!.studioId).toBe(world.hollywood!.playerStudioId)
    expect(plain.studio.cash - booked.studio.cash).toBe(x!.fee)
    expect(feeRows(booked, guest.id)).toEqual([[W, -x!.fee, true]])
    const film = booked.studio.activeProductions.find((p) => p.id === x!.productionId)!
    expect(booked.ledger.filter((e) => e.productionId === film.id && e.talentId === guest.id)).toHaveLength(1)
    // three principals stay required and unchanged; the guest takes no seat
    expect(film.cast).toEqual(plain.studio.activeProductions.at(-1)!.cast)
    expect(JSON.stringify(film.participants)).not.toContain(guest.id)
    expect(film.forecastSnapshot).not.toEqual(plain.studio.activeProductions.at(-1)!.forecastSnapshot)
    expect(makeSave(booked).saveVersion).toBe(50)
  })

  it('refuses a third guest, a credited principal, a week outside the span, the same person twice, a stale fee and another studio\'s employee, each atomically', () => {
    const credited = applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, SHOOT)])])
    expect(rootOf(credited)?.bookings).toHaveLength(1)
    const third = freeGuest(world, 'actor', new Set([...principals, guest.id, guest2.id]))
    unchanged(() => applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, SHOOT), ask(guest2, SHOOT), ask(third, SHOOT)])]), /at most 2 guests per production/)
    unchanged(() => applyActions(world, [greenlight(world, conceptA, a, writer, [{ talentId: a.director, workWeek: SHOOT, fee: 1, basis: 'freelance' }])]), /already credited on this picture/)
    unchanged(() => applyActions(world, [greenlight(world, conceptA, a, writer, [{ talentId: writer, workWeek: SHOOT, fee: 1, basis: 'freelance' }])]), /already credited on this picture/)
    unchanged(() => applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, W)])]), /work week .* must satisfy/)
    unchanged(() => applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, W + TUNING.PRODUCTION_TICKS + 1)])]), /work week .* must satisfy/)
    unchanged(() => applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, SHOOT), ask(guest, SHOOT + 1)])]), /requested twice/)
    unchanged(() => applyActions(world, [greenlight(world, conceptA, a, writer, [{ ...ask(guest, SHOOT), fee: expectedFee(guest) + 1 }])]), /stale cameo quote/)
    const rivalEmployee = world.talent.find((t) => { const e = studioEmployerId(world, t.id); return e !== null && e !== world.hollywood!.playerStudioId && unretired(world, t.id) })!
    expect(rivalEmployee).toBeDefined()
    unchanged(() => applyActions(world, [greenlight(world, conceptA, a, writer, [ask(rivalEmployee, SHOOT)])]), /holds actual work|another studio's employee/)
    // the span's last lawful week books
    expect(bookingOf(applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, W + TUNING.PRODUCTION_TICKS)])]), guest.id)?.workWeek).toBe(W + TUNING.PRODUCTION_TICKS)
  })
})

describe('P17 Shape A — one actual week of work, the missed week, the release credit', () => {
  const booked = applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, SHOOT), ask(guest2, W + 2)])])
  let s = booked
  for (let i = 0; i < 3; i++) s = tick(s) // weeks W, W+1, W+2: the W+2 advance is pre-production, not shooting
  const afterMiss = s
  s = tick(s) // W+3: rehearsal
  s = tick(s) // W+4: shooting, the booked week
  const afterWork = s
  const released = releaseNewest(s)

  it('a booked week with no shooting work cancels once with the 25% retained charge and one linked refund', () => {
    const missed = bookingOf(afterMiss, guest2.id)
    expect(missed).toMatchObject({ status: 'cancelled', cancelReason: 'missedWork', cancelledWeek: W + 2 })
    expect(missed!.refund).toBe(missed!.fee - Math.round(missed!.fee * 0.25))
    expect(feeRows(afterMiss, guest2.id)).toEqual([[W, -missed!.fee, true], [W + 2, missed!.refund, true]])
    expect(bookingOf(afterMiss, guest.id)?.status).toBe('reserved')
  })

  it('real shooting work in the booked week completes the appearance and freezes its execution; no payment fires and no counter moves', () => {
    const done = bookingOf(afterWork, guest.id)
    expect(done).toMatchObject({ status: 'completed', completedWeek: SHOOT, releasedWeek: null, careerEvent: null })
    expect(typeof done!.completedExecution).toBe('number')
    expect(feeRows(afterWork, guest.id)).toEqual([[W, -done!.fee, true]])
    // the completed-production counter is a picture's, not a one-week appearance's
    expect(afterWork.talent.find((t) => t.id === guest.id)!.workHistory).toEqual(booked.talent.find((t) => t.id === guest.id)!.workHistory)
    expect(exportSave(migrateToLive(importSave(exportSave(makeSave(afterWork)))))).toBe(exportSave(makeSave(afterWork)))
  })

  it('the release credits the completed appearance once through the career pipeline at the cameo weight; the missed guest earns nothing', () => {
    const credited = bookingOf(released, guest.id)!
    const film = released.studio.releasedFilms.at(-1)!
    expect(credited.releasedWeek).toBe(film.releaseTick)
    expect(credited.careerEvent).toMatchObject({ eventId: `${film.productionId}:${guest.id}`, role: 'cameo', billingWeight: 0.1, discipline: 'acting',
      starPowerBefore: afterWork.talent.find((t) => t.id === guest.id)!.fame, starPowerAfter: released.talent.find((t) => t.id === guest.id)!.fame })
    expect(bookingOf(released, guest2.id)?.careerEvent).toBeNull()
    // the frozen V8 list, the participant record, the first take and every principal promise never name the guest
    expect(released.careerEvents.some((e) => e.talentId === guest.id)).toBe(false)
    expect(JSON.stringify(film.participants)).not.toContain(guest.id)
    expect(JSON.stringify(released.firstTakes)).not.toContain(guest.id)
    expect(exportSave(migrateToLive(importSave(exportSave(makeSave(released)))))).toBe(exportSave(makeSave(released)))
  })
})

describe('P17 Shape A — cancellation obligations', () => {
  const booked = applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, SHOOT)])])
  const id = booked.studio.activeProductions.at(-1)!.id

  it('cancelling the picture before the work week refunds the unperformed booking once', () => {
    expect(bookingOf(booked, guest.id)?.status).toBe('reserved')
    const cancelled = applyActions(booked, [{ kind: 'cancel', productionId: id }])
    const x = bookingOf(cancelled, guest.id)!
    expect(x).toMatchObject({ status: 'cancelled', cancelReason: 'productionCancelled', cancelledWeek: W })
    expect(cancelled.studio.cash - booked.studio.cash).toBe(x.fee - x.retained)
    expect(feeRows(cancelled, guest.id)).toEqual([[W, -x.fee, true], [W, x.fee - x.retained, true]])
  })

  it('cancelling the picture after the completed week keeps the work and its earned fee', () => {
    let s = booked
    for (let i = 0; i < 5; i++) s = tick(s)
    expect(bookingOf(s, guest.id)?.status).toBe('completed')
    const after = applyActions(s, [{ kind: 'cancel', productionId: id }])
    expect(bookingOf(after, guest.id)).toEqual(bookingOf(s, guest.id))
    expect(after.studio.cash).toBe(s.studio.cash)
    expect(feeRows(after, guest.id)).toEqual(feeRows(s, guest.id))
  })

  it('an explicit cancellation closes one unperformed booking once; a second, an unknown or a completed one refuses', () => {
    expect(bookingOf(booked, guest.id)?.bookingId).toBe('cameo-1')
    const cancel = { kind: 'cancelCameoBooking', bookingId: 'cameo-1' } as Action
    const once = applyActions(booked, [cancel])
    expect(bookingOf(once, guest.id)).toMatchObject({ status: 'cancelled', cancelReason: 'explicit', refund: bookingOf(booked, guest.id)!.fee - bookingOf(booked, guest.id)!.retained })
    expect(() => applyActions(once, [cancel])).toThrow(/already cancelled/)
    expect(() => applyActions(booked, [{ kind: 'cancelCameoBooking', bookingId: 'cameo-9' } as Action])).toThrow(/no booking cameo-9/)
    let s = booked
    for (let i = 0; i < 5; i++) s = tick(s)
    expect(() => applyActions(s, [cancel])).toThrow(/completed work/)
  })
})

describe('P17 Shape A — availability and employment obligations', () => {
  const booked = applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, SHOOT)])])

  it('a reserved week blocks a whole-film seat and a second appearance that week; another week books; seated people are not guests', () => {
    expect(bookingOf(booked, guest.id)?.status).toBe('reserved')
    const asDirector = { ...b, director: guest.id }
    expect(() => applyActions(booked, [greenlight(booked, conceptB, asDirector, writer)])).toThrow(new RegExp(`"${guest.id}" holds a reserved guest appearance in week ${SHOOT}`))
    expect(() => applyActions(booked, [greenlight(booked, conceptB, b, writer, [ask(guest, SHOOT)])])).toThrow(new RegExp(`already holds a guest reservation for week ${SHOOT}`))
    const both = applyActions(booked, [greenlight(booked, conceptB, b, writer, [ask(guest, SHOOT + 1)])])
    expect(rootOf(both)!.bookings.filter((x) => x.talentId === guest.id).map((x) => [x.workWeek, x.status])).toEqual([[SHOOT, 'reserved'], [SHOOT + 1, 'reserved']])
    // a principal seated on the first picture holds actual work
    expect(() => applyActions(booked, [greenlight(booked, conceptB, b, writer, [{ talentId: a.cast[0], workWeek: SHOOT, fee: 1, basis: 'freelance' }])])).toThrow(/holds actual work/)
  })

  it('a freelance booking is disclosed to a new employer and survives the signing; an own-employee exit cancels with the standard refund', () => {
    const market = new Set(hiringMarketIds(world))
    const busy = busyTalentIds(world)
    const freelancer = world.talent.find((t) => market.has(t.id) && !principals.has(t.id) && t.id !== guest.id && !busy.has(t.id) && unretired(world, t.id)
      && studioEmployerId(world, t.id) === null && studioEmployerId(world, t.id, SHOOT) === null)!
    expect(freelancer).toBeDefined()
    const fb = applyActions(world, [greenlight(world, conceptA, a, writer, [ask(freelancer, SHOOT)])])
    expect(bookingOf(fb, freelancer.id)?.basis).toBe('freelance')
    expect(hiringMarketView(fb).find((v) => v.talentId === freelancer.id)?.availabilityLabel).toMatch(new RegExp(`reserved for a guest appearance in week ${SHOOT}`))
    const signed = applyActions(fb, [{ kind: 'signContract', talentId: freelancer.id, termWeeks: TUNING.CONTRACT_MIN_WEEKS }])
    expect(bookingOf(signed, freelancer.id)).toEqual(bookingOf(fb, freelancer.id))
    // own employee: a second-package actor, contracted and unseated, books as an employee appearance
    const employee = world.talent.find((t) => t.id === b.cast[0])!
    const eb = applyActions(world, [greenlight(world, conceptA, a, writer, [ask(employee, SHOOT, 'employee')])])
    const x = bookingOf(eb, employee.id)!
    expect(x.basis).toBe('employee')
    const exited = applyActions(eb, [{ kind: 'releaseTalent', talentId: employee.id }])
    expect(bookingOf(exited, employee.id)).toMatchObject({ status: 'cancelled', cancelReason: 'employmentExit', refund: x.fee - x.retained, cancelledWeek: W })
    expect(feeRows(exited, employee.id)).toEqual([[W, -x.fee, true], [W, x.fee - x.retained, true]])
  })

  it('an employment change makes the quote stale: a freelancer signed in the same batch refuses as freelance and books as employee', () => {
    const market = new Set(hiringMarketIds(world))
    const busy = busyTalentIds(world)
    const freelancer = world.talent.find((t) => market.has(t.id) && !principals.has(t.id) && t.id !== guest.id && !busy.has(t.id) && unretired(world, t.id)
      && studioEmployerId(world, t.id) === null && studioEmployerId(world, t.id, SHOOT) === null)!
    expect(freelancer).toBeDefined()
    const sign: Action = { kind: 'signContract', talentId: freelancer.id, termWeeks: TUNING.CONTRACT_MIN_WEEKS }
    unchanged(() => applyActions(world, [sign, greenlight(world, conceptA, a, writer, [ask(freelancer, SHOOT)])]), /stale cameo quote .* the basis is now employee, not the accepted freelance/)
    const employed = applyActions(world, [sign, greenlight(world, conceptA, a, writer, [ask(freelancer, SHOOT, 'employee')])])
    expect(bookingOf(employed, freelancer.id)?.basis).toBe('employee')
  })
})

describe('P17 Shape A — persistence in the Save50 step (additive, absent by default)', () => {
  const booked = applyActions(world, [greenlight(world, conceptA, a, writer, [ask(guest, SHOOT)])])
  type Forged = { state: GameState & { cameos: Root & Record<string, unknown> } }
  type Root = { bookings: (Booking & Record<string, unknown>)[] }

  it('round-trips byte for byte and refuses a downgrade by name while a booking exists', () => {
    expect(rootOf(booked)?.bookings).toHaveLength(1)
    const save = makeSave(booked), bytes = exportSave(save)
    expect(exportSave(migrateToLive(importSave(bytes)))).toBe(bytes)
    expect(() => convertV50ToV49(save)).toThrow(/^migrateToV49: cannot downgrade or discard 1 recorded cameo booking\(s\)$/)
    expect(exportSave(save)).toBe(bytes)
  })

  const save = makeSave(booked)
  const refuse = (edit: (f: Forged) => void, pattern: RegExp) => {
    expect(rootOf(booked)?.bookings).toHaveLength(1)
    const forged = JSON.parse(JSON.stringify(save)) as Forged
    edit(forged)
    expect(() => validateSaveP17(forged)).toThrow(pattern)
  }
  it('the validator refuses an empty root', () => refuse((f) => { f.state.cameos.bookings = [] }, /an empty cameo root is written as absence/))
  it('the validator refuses an unknown root key', () => refuse((f) => { f.state.cameos.extra = 1 }, /expected exactly keys/))
  it('the validator refuses a forged fee', () => refuse((f) => { f.state.cameos.bookings[0]!.fee += 1 }, /is not the frozen quote's fee/))
  it('the validator refuses a foreign studio', () => refuse((f) => { f.state.cameos.bookings[0]!.studioId = world.hollywood!.identities[1]!.studioId }, /is not the player studio/))
  it('the validator refuses a completion that never happened', () => refuse((f) => { f.state.cameos.bookings[0]!.status = 'completed' }, /completed work records its week and frozen execution/))
})

describe('P17 Shape A — the player\'s closure while a booking is reserved', () => {
  // Built at collection like every route here (no case timeout carries it); a premise failure fails THIS case by name
  // instead of the whole file.
  let closing: ReturnType<typeof closureRoute> | Error
  try { closing = closureRoute(world, a, writer, principals) } catch (error) { closing = error instanceof Error ? error : new Error(String(error)) }

  it('the closure cancels the unperformed booking once with its refund before the money step; the closure validator replays it', () => {
    if (closing instanceof Error) throw closing
    const { booked, closed, guest: g, week } = closing
    const x = bookingOf(booked, g.id)
    expect(x).toMatchObject({ status: 'reserved', workWeek: week + 4, bookedWeek: week })
    expect(booked.studio.cash).toBe(0)
    const closure = closuresOf(closed).find((c) => c.studioId === closed.hollywood!.playerStudioId)
    expect(closure).toBeDefined()
    expect(bookingOf(closed, g.id)).toMatchObject({ status: 'cancelled', cancelReason: 'productionCancelled', cancelledWeek: closure!.closureWeek, refund: x!.fee - x!.retained })
    expect(feeRows(closed, g.id)).toEqual([[week, -x!.fee, true], [closure!.closureWeek, x!.fee - x!.retained, true]])
    expect(() => validateSaveP17(makeSave(closed))).not.toThrow()
    expect(exportSave(migrateToLive(importSave(exportSave(makeSave(closed)))))).toBe(exportSave(makeSave(closed)))
  })
})
