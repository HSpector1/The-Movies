// ── P15B Wave 4 RED: the save step for actual closure (closure/v1 §5; contract RED 8) ────────────
// The `studioClosure` root migrates empty, refuses a lossy downgrade, and is validated against the whole
// state: record identity and phase, bidirectional disposition completeness, the digest, claims arithmetic
// and payment reconciliation, the loan stop, the estate window, and the terminal business (no charge after
// C, every interval ended by a `closure` receipt at C).
// r3 (the 1370-ar review): the estate's later transactions are their own sequenced records (`estateEvents`) and the
// closure record never changes after creation; a closure-due record the browser Lot left due saves, reloads and
// closes prospectively at the first closure phase of a surface that presents it (contract §2, review T16).
import { describe, expect, it } from 'vitest'
import { genuineV42Week130 } from './p14d1-rival-shelving-fixtures.js'
import { convertV49ToV48, exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive, migrateToV45 } from '../src/core/save.js'
import { validateLiveSave } from './helpers/live-era.js'
import { ESTATE_OBSERVATION_REFUSAL } from './helpers/p16-era.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { tick } from '../src/core/tick.js'
import { BASE_WEEK, canon, claimsOf, closureOf, closureRoot, eventsOf, PLAYER, PLAYER_CLOSURE_DEFERRED, playerClosure, R04, R04_CLOSURE_WEEK, raw, recordOf, refuses, rivalClosure, ticks } from './helpers/p15b-live.js'

type Save = { saveVersion: number; state: Record<string, unknown> }
type Mod = Record<string, unknown>
async function saveModule(): Promise<Mod> { return (await import('../src/core/save.js')) as unknown as Mod }
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const C = R04_CLOSURE_WEEK
const D = C + TUNING.CLOSURE_ESTATE_WINDOW_WEEKS

function closedAt(week: number): GameState {
  const s = rivalClosure(week).get(week)!
  if (closureOf(s, R04) === undefined) throw new Error(`RED: r04 has no closure record at ${week} (closure/v1 §2); the closure phase has not landed`)
  return s
}
function tampered(week: number, edit: (state: Record<string, unknown>) => void): Save {
  const save = clone(makeSave(closedAt(week))) as unknown as Save
  edit(save.state)
  return save
}
type Root = { version: number; recordedFromWeek: number; nextClosure: number; nextClaim: number; nextEstateEvent: number; closures: Record<string, unknown>[]; claims: Record<string, unknown>[]; estateEvents: Record<string, unknown>[] }
const root = (state: Record<string, unknown>) => state.studioClosure as Root
const record = (state: Record<string, unknown>) => root(state).closures[0] as Record<string, unknown> & { dispositions: Record<string, unknown>[]; loan: Record<string, number>; cash: Record<string, number>; estate: Record<string, unknown> & { lots: Record<string, unknown>[] } }
const business = (state: Record<string, unknown>) => (state.hollywood as { businesses: { studioId: string; account: { cash: number; periods: { movements: Record<string, number>; closing: number }[] }; nextDecisionWeek: number }[] }).businesses.find((b) => b.studioId === R04)!

describe('p15b4 closure save step: migration and downgrade (closure/v1 §5)', () => {
  it('closure-root-migration-empty', () => {
    const live = migrateToLive(genuineV42Week130() as never)
    expect(live.saveVersion).toBe(LIVE_SAVE_VERSION)
    const state = live.state as unknown as GameState
    const empty = { version: 1, recordedFromWeek: BASE_WEEK, nextClosure: 1, nextClaim: 1, nextEstateEvent: 1, closures: [], claims: [], estateEvents: [] }
    expect(canon(closureRoot(state))).toBe(canon(empty))
    // No reconstruction: a predecessor whose condition root is empty has nothing to close, and nothing is backdated.
    expect(canon(closureRoot(ticks(state, 2)))).toBe(canon(empty))
    expect(canon(migrateToLive(migrateToV45(live)))).toBe(canon(live))
  })

  it('closure-root-downgrade-refusals', async () => {
    const mod = await saveModule()
    const closed = makeSave(closedAt(C))
    // P16: the live step (migrateToV48) refuses first, at every older reader, naming the estate the closure opened
    // in its closure week. ACCEPTANCE OPEN (P16 rebase round 4): the P15B step's own 'cannot downgrade or discard an
    // actual studio closure' (and its claim and estate-event reasons). Every Save49 closure opens a closure49 estate,
    // a rights instrument no Save48 envelope carries, and the live tick needs a rights root, so no lawful Save48
    // control holds a closure.
    expect((raw(closedAt(C)).rights as { estates: { origin: { kind: string } }[] }).estates.map((e) => e.origin.kind), 'premise: the closure opened its estate').toContain('closure49')
    expect(() => convertV49ToV48(closed)).toThrow(ESTATE_OBSERVATION_REFUSAL)
    expect(() => migrateToV45(closed)).toThrow(ESTATE_OBSERVATION_REFUSAL)
    expect(() => (mod.migrateToV44 as (save: unknown) => unknown)(closed)).toThrow(ESTATE_OBSERVATION_REFUSAL)
  })
})

describe('p15b4 closure save step: the root validator (closure/v1 §5; contract RED 1, 3, 4, 8)', () => {
  it('closure-validate-record-identity-and-phase', async () => {
    const validateSaveP15B = validateLiveSave as unknown as (save: unknown) => Save // the live reader (Save49; its predecessor proof runs the closure root)
    expect(() => validateSaveP15B(makeSave(closedAt(C + 3)))).not.toThrow()
    const cases: [string, (s: Record<string, unknown>) => void][] = [
      // A forged closure week moves the era's charge boundary, so the frozen chain refuses first on the
      // fact it contradicts (the overhead charged through the real closure week).
      ['overhead', (s) => { record(s).closureWeek = C - 1 }],
      ['studioClosure', (s) => { record(s).causeEventId = 'corporate-event-1' }],
      ['studioClosure', (s) => { record(s).lawVersion = 'closure/v9' }],
      ['studioClosure', (s) => { (record(s).phaseOrdinal as number) += 1 }],
      ['studioClosure', (s) => { record(s).phaseOrderVersion = 1 }],
      ['studioClosure', (s) => { root(s).nextClosure = 1 }],
      ['studioClosure', (s) => { root(s).closures.push(clone(record(s))) }],
      ['studioClosure', (s) => { root(s).version = 2 }],
      ['studioClosure', (s) => { (root(s) as unknown as Record<string, unknown>).extra = 1 }],
      // Erasing the closure erases the era: the frozen chain then reads the terminal business as operating and
      // refuses its frozen decision cadence first.
      ['decision boundary', (s) => { root(s).closures = [] ; root(s).claims = []; root(s).nextClosure = 1; root(s).nextClaim = 1 }],
      ['p15DomainSequence', (s) => { record(s).p15DomainSequence = (s.corporateCondition as { events: { p15DomainSequence: number }[] }).events[0]!.p15DomainSequence }],
      ['p15Sequence', (s) => { (s.p15Sequence as { next: number }).next = record(s).p15DomainSequence as number }],
    ]
    for (const [text, edit] of cases) refuses(() => validateSaveP15B(tampered(C + 3, edit)), text)
  })

  it('closure-validate-dispositions-complete-and-digest', async () => {
    const validateSaveP15B = validateLiveSave as unknown as (save: unknown) => Save // the live reader (Save49; its predecessor proof runs the closure root)
    const closureDigest = (await import('../src/core/studioClosure.js') as unknown as { closureDigest: (id: string, rows: unknown[]) => string }).closureDigest
    const redigest = (s: Record<string, unknown>) => { const r = record(s); r.digest = closureDigest(r.closureId as string, r.dispositions); const counts: Record<string, number> = {}; for (const d of r.dispositions) counts[d.subjectKind as string] = (counts[d.subjectKind as string] ?? 0) + 1; r.counts = counts }
    const cases: [string, (s: Record<string, unknown>) => void][] = [
      // Delete a disposition and recompute its digest and counts: completeness still fails (contract RED 4).
      ['studioClosure', (s) => { record(s).dispositions.splice(record(s).dispositions.findIndex((d) => d.subjectKind === 'employment'), 1); redigest(s) }],
      ['studioClosure', (s) => { record(s).dispositions.splice(record(s).dispositions.findIndex((d) => d.subjectKind === 'facility'), 1); redigest(s) }],
      ['studioClosure', (s) => { record(s).dispositions.splice(record(s).dispositions.findIndex((d) => d.subjectKind === 'title'), 1); redigest(s) }],
      // A duplicate subject, an orphan subject, a stale digest, a bad count.
      ['studioClosure', (s) => { record(s).dispositions.push(clone(record(s).dispositions[0]!)); redigest(s) }],
      ['studioClosure', (s) => { record(s).dispositions.push({ ...clone(record(s).dispositions.find((d) => d.subjectKind === 'facility')!), subjectId: 'facility-ghost' }); redigest(s) }],
      ['studioClosure', (s) => { record(s).digest = '00000000' }],
      ['studioClosure', (s) => { (record(s).counts as Record<string, number>).employment += 1 }],
      ['studioClosure', (s) => { record(s).dispositions[0]!.status = 'pending'; redigest(s) }],
      ['studioClosure', (s) => { record(s).dispositions[0]!.lawVersion = 'closure/v9'; redigest(s) }],
      ['studioClosure', (s) => { const d = record(s).dispositions.find((x) => x.subjectKind === 'employment')!; d.claimId = 'closure-claim-99'; redigest(s) }],
    ]
    for (const [text, edit] of cases) refuses(() => validateSaveP15B(tampered(C + 3, edit)), text)
  })

  it('closure-validate-claims-loan-and-estate', async () => {
    const validateSaveP15B = validateLiveSave as unknown as (save: unknown) => Save // the live reader (Save49; its predecessor proof runs the closure root)
    const cases: [string, (s: Record<string, unknown>) => void][] = [
      ['claim', (s) => { (root(s).claims[0]! as { original: number }).original += 1 }],
      ['claim', (s) => { const c = root(s).claims[0]! as { paid: number; unpaid: number }; c.paid += 1; c.unpaid -= 1 }],
      ['claim', (s) => { (root(s).claims[0]! as { status: string }).status = 'paid' }],
      ['claim', (s) => { root(s).claims.splice(0, 1); root(s).nextClaim -= 1 }],
      ['claim', (s) => { (root(s).claims[0]! as { payments: unknown[] }).payments.push({ week: C, amount: 1, reference: 'forged' }) }],
      ['claim', (s) => { (root(s).claims[0]! as { sourceContractId: string }).sourceContractId = (root(s).claims[1]! as { sourceContractId: string }).sourceContractId }],
      ['loan', (s) => { record(s).loan.stopWeek += 1 }],
      ['loan', (s) => { record(s).loan.paidInstallments += 1 }],
      ['loan', (s) => { record(s).loan.remainder -= 1 }],
      ['cash', (s) => { record(s).cash.closing += 1 }],
      ['cash', (s) => { record(s).cash.distributable = 1 }],
      ['estate', (s) => { (record(s).estate.closesWeek as number) += 1 }],
      ['estate', (s) => { record(s).estate.lots.splice(0, 1) }],
      // r3: the record carries no estate status; a lot with one, or an archival before D, refuses.
      ['estate', (s) => { record(s).estate.lots[0]!.status = 'archived' }],
      ['estate', (s) => { root(s).estateEvents.push({ eventId: 'estate-event-1', closureId: record(s).closureId, studioId: R04, week: C + 3, kind: 'archival', amount: 0, reference: record(s).closureId,
        p15DomainSequence: (s.p15Sequence as { next: number }).next, phaseId: record(s).phaseId, phaseOrdinal: record(s).phaseOrdinal, phaseOrderVersion: record(s).phaseOrderVersion })
        root(s).nextEstateEvent = 2; (s.p15Sequence as { next: number }).next += 1 }],
    ]
    for (const [text, edit] of cases) refuses(() => validateSaveP15B(tampered(C + 3, edit)), text)
    // After archival: a lost or duplicated archival event, an unpaid (not archived) claim all refuse.
    expect(root(raw(closedAt(D + 1))).estateEvents.map((e) => [e.week, e.kind])).toEqual([[D, 'archival']])
    refuses(() => validateSaveP15B(tampered(D + 1, (s) => { root(s).estateEvents = [] })), 'estate')
    refuses(() => validateSaveP15B(tampered(D + 1, (s) => { root(s).estateEvents.push({ ...clone(root(s).estateEvents[0]!), eventId: 'estate-event-2', week: D + 1,
      p15DomainSequence: (s.p15Sequence as { next: number }).next }); root(s).nextEstateEvent = 3; (s.p15Sequence as { next: number }).next += 1 })), 'estate')
    refuses(() => validateSaveP15B(tampered(D + 1, (s) => { (root(s).claims[0]! as { status: string }).status = 'unpaid' })), 'claim')
  })

  it('closure-validate-terminal-business', async () => {
    const validateSaveP15B = validateLiveSave as unknown as (save: unknown) => Save // the live reader (Save49; its predecessor proof runs the closure root)
    // A charge after C, a forged installment after the stop, a `closure` receipt at the wrong week, an interval
    // left open, and a forged payment movement each refuse through the frozen chain or the closure validator.
    const periodAt = (s: Record<string, unknown>, week: number) => business(s).account.periods.find((p) => (p as unknown as { fromWeek: number; throughWeek: number }).fromWeek <= week && week <= (p as unknown as { throughWeek: number }).throughWeek)!
    // The last movement of a closed business is at input week C − 1; a forged charge lands in that period.
    refuses(() => validateSaveP15B(tampered(C + 3, (s) => { const p = periodAt(s, C - 1); p.movements.overhead -= TUNING.OVERHEAD_BASE; p.closing -= TUNING.OVERHEAD_BASE; business(s).account.cash -= TUNING.OVERHEAD_BASE })), 'overhead')
    refuses(() => validateSaveP15B(tampered(C + 3, (s) => { const p = periodAt(s, C - 1); p.movements.loanInstallment -= 1000; p.closing -= 1000; business(s).account.cash -= 1000 })), 'loan')
    refuses(() => validateSaveP15B(tampered(C + 3, (s) => { const p = periodAt(s, C - 1); p.movements.claimPayment -= 1000; p.closing -= 1000; business(s).account.cash -= 1000 })), 'claim')
    refuses(() => validateSaveP15B(tampered(C + 3, (s) => {
      const h = s.hollywood as { employment: { studioId: string; endedWeek: number | null }[]; receipts: { kind: string; reason?: string; studioId: string; week: number }[] }
      const row = h.employment.find((e) => e.studioId === R04 && e.endedWeek === C)!
      row.endedWeek = C - 1
      h.receipts.find((r) => r.kind === 'employment' && r.reason === 'closure' && r.studioId === R04)!.week = C - 1
    })), 'employment')
    refuses(() => validateSaveP15B(tampered(C + 3, (s) => {
      const h = s.hollywood as { receipts: { kind: string; reason?: string; studioId: string }[] }
      h.receipts.find((r) => r.kind === 'employment' && r.reason === 'closure' && r.studioId === R04)!.reason = 'termination'
    })), 'studioClosure') // the closure validator: six claims for five intervals ended by closure
  })

  it('closure-due-save-closes-prospectively (contract §2; review T16)', () => {
    // A closure-due record with no closure: the browser Lot (tick option deferPlayerClosure) records the player's
    // closure due at C and leaves it due. The save carries it, reloads byte for byte, stays due under the Lot, and the
    // first closure phase of a surface that presents closure (a plain tick, as the Bridge runs) closes it then.
    const due = tick(playerClosure().get(C - 1)!, PLAYER_CLOSURE_DEFERRED)
    expect(recordOf(due, PLAYER)!.condition).toMatchObject({ stage: 'closed', since: C, week: C })
    expect(closureOf(due, PLAYER)).toBeUndefined()
    const reloaded = migrateToLive(importSave(exportSave(makeSave(due)))).state as unknown as GameState
    expect(canon(reloaded)).toBe(canon(due))
    const later = tick(reloaded, PLAYER_CLOSURE_DEFERRED)
    expect(closureOf(later, PLAYER)).toBeUndefined()
    expect(recordOf(later, PLAYER)!.condition).toMatchObject({ stage: 'closed', week: C })
    const closed = tick(later)
    expect(closureOf(closed, PLAYER)).toMatchObject({ closureWeek: C + 2, causeEventId: eventsOf(due, PLAYER).find((e) => e.to === 'closed')!.eventId })
    expect(() => makeSave(closed)).not.toThrow()
    expect(closureRoot(importSave(exportSave(makeSave(closed))).state as unknown as GameState).closures.length).toBe(1)
    refuses(() => tick(closed), 'read-only')
  })

  it('closure-round-trip', () => {
    for (const week of [C, C + 3, D, D + 2]) {
      const s = closedAt(week)
      const reloaded = migrateToLive(importSave(exportSave(makeSave(s)))).state as unknown as GameState
      expect(canon(reloaded), `week ${week}`).toBe(canon(s))
      expect(canon(ticks(reloaded, 3)), `week ${week} + 3`).toBe(canon(ticks(s, 3)))
    }
    const archived = closedAt(D + 2)
    expect(claimsOf(archived, 'studio-closure-1').every((c) => c.status === 'unpaidArchived')).toBe(true)
    expect((raw(archived).studioClosure as Root).nextClosure).toBe(2)
  })
})
