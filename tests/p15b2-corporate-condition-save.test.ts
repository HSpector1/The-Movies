// ── P15B Wave 2 — the save step: migration, downgrade, validation and round trip, RED tests (record 1370-ar) ──
//
// Authority: 1357-A §4.1 (validation items 1-7), §4.2 (migration and the save step), §10 S1-S7, as adopted by
// 1357-F Amendment 1 (cross-root allocator rules; RED S3 gains a duplicate sequence across roots, a stale
// `next` and a mismatched phase triple); 1361-F3 ruling 2 (P15B's root stays out of P15_ROOT_KEYS and runs
// the one allocator check itself); the Wave-4 contract §5 (era-gated roots, empty observational migration,
// no lossy downgrade, both phase tables).
//
// RED BY DESIGN at 6510c971: LIVE_SAVE_VERSION is 45, no P15B step exists, and the frozen V45 chain refuses
// the loan ledger kinds and rival money kinds by name.
// r2 (stacked on founding r3): the step is Save48 over founding's Save47 (R8's Save46 below it); the predecessor's
// own reader `validateSaveV47` admits every downgraded envelope here, and the P15B refusal appends the predecessor
// steps' own reasons rather than masking them.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { convertV48ToV49, convertV49ToV48, convertV50ToV49, convertV51ToV50, convertV49ToV50, convertV50ToV51, exportSave, FOUNDING_FUNDING_SAVE_VERSION, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive, migrateToV45, migrateToV46, migrateToV47, P15B_SAVE_VERSION, validateSaveV47 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, GameState } from '../src/core/types.js'
import { base, BASE_WEEK, canon, conditionRoot, drainPlayer, loansOf, PLAYER, R04, raw, recordOf, refuses, rivalClosure, ticks } from './helpers/p15b-live.js'
import { genuineV42Week130 } from './p14d1-rival-shelving-fixtures.js'
import { corporateConditionDowngradeRefusal } from '../src/core/corporateConditionLive.js'
import { studioClosureDowngradeRefusal } from '../src/core/studioClosure.js'
import { EXPECTED_LIVE_SAVE_VERSION, validateLiveSave } from './helpers/live-era.js'
import { LIVE_DOWNGRADE_REFUSAL, rightsStripped } from './helpers/p16-era.js'

// P16 (Save49) is the live step above this one. The P15B step's own downgrade law runs on Save48 controls: the
// never-ticked base's envelope (`rightsStripped`) and the week-133 world (`recorded`), whose public downgrade passes
// the live step because it holds no title and no table-3 row yet. The root validators run inside the live reader
// (`validateLiveSave`, whose predecessor proof is the P15B era's). From the first table-3 row on (a condition event,
// at 134 at the earliest) the public downgrade refuses at the Save49 step first, by one of two named reasons: the
// rights root it would discard (once a rival greenlight or a release minted a title), or else the step's own
// phase-history reason for the table-3 condition events the live writer stamped (helpers/p16-era.ts).

type Save = { saveVersion: number; seed: string; state: Record<string, unknown>; broadcastCache: unknown[] }
type SaveModule = Record<string, (save: unknown) => Save>

async function saveModule(): Promise<SaveModule> {
  return (await import('../src/core/save.js')) as unknown as SaveModule
}
function step<T extends (...a: any[]) => any>(mod: Record<string, unknown>, name: string): T {
  const value = mod[name]
  if (typeof value !== 'function') throw new Error(`RED: src/core/save.ts exports no function '${name}' (the V46 step has not landed)`)
  return value as T
}
const takeLoan = (principal: number): Action => ({ kind: 'takeLoan', principal } as unknown as Action)
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const LOAN_KINDS = ['loanPrincipal', 'loanInstallment', 'claimPayment']

/** A ticked, borrowed, mid-distress state at week 140 (player negative from 131, loan at 134), saved once. */
let borrowedAt140: GameState | null = null
function borrowed(): GameState {
  if (borrowedAt140 === null) {
    const s134 = ticks(drainPlayer(base(), base().studio.cash + 1), 4)
    borrowedAt140 = ticks(applyActions(s134, [takeLoan(390_000)]), 6)
  }
  return borrowedAt140
}
/** Week 133 on the natural route: every evaluated studio has a condition record (first evaluated at 131) and no
 * condition event can exist yet (CORPORATE_WARN_SUSTAIN_WEEKS is 4, so the first warning is 134 at the earliest);
 * lane wave3 measured that this route mints no title through 135. r04 is in R8 cost cutting and disposed a facility
 * at 131. So the live step converts its public downgrade and the P15B step refuses by its own name. */
let recordedAt133: GameState | null = null
function recorded(): GameState {
  if (recordedAt133 === null) recordedAt133 = ticks(base(), 3)
  return recordedAt133
}
/** The P15B step's exact composed refusal of the week-133 control: its condition records, then R8's recovery reasons. */
const recordedRefusal = (state: GameState): RegExp => new RegExp(`^migrateToV${FOUNDING_FUNDING_SAVE_VERSION}: cannot downgrade or discard a corporateCondition record \\(${conditionRoot(state).studios.length} evaluated\\); cannot downgrade or discard recovery authority: costCutting\\.since, facilityDemolitionRefund, facilityDisposed$`)
function tampered(edit: (state: Record<string, unknown>) => void): Save {
  const save = clone(makeSave(borrowed())) as unknown as Save
  edit(save.state)
  return save
}
const root = (state: Record<string, unknown>) => state.corporateCondition as { version: number; recordedFromWeek: number; nextEvent: number; nextLoan: number; studios: Record<string, unknown>[]; events: Record<string, unknown>[]; loans: Record<string, unknown>[] }

describe('p15b2 save step: migration and downgrade (1357-A §4.2; S1-S2)', () => {
  it('condition-root-migration-empty-genuine-v42', async () => {
    const mod = await saveModule()
    const live = migrateToLive(genuineV42Week130() as never)
    expect(live.saveVersion).toBe(LIVE_SAVE_VERSION)
    const state = live.state as unknown as GameState
    expect(canon(conditionRoot(state))).toBe(canon({ version: 1, recordedFromWeek: BASE_WEEK, nextEvent: 1, nextLoan: 1, studios: [], events: [], loans: [] }))
    for (const business of state.hollywood!.businesses) {
      for (const period of business.account.periods) {
        for (const kind of LOAN_KINDS) expect((period.movements as Record<string, number>)[kind], `${business.studioId} ${kind}`).toBe(0)
      }
    }
    expect(state.ledger.some((row) => LOAN_KINDS.includes(row.kind))).toBe(false)
    // The step is explicit: convertToP15BSave of the predecessor projection reproduces the live save byte for byte.
    const convertFromStep = step<(save: unknown) => Save>(mod, 'convertFromP15BSave')
    const convertToStep = step<(save: unknown) => Save>(mod, 'convertToP15BSave')
    const p15b = rightsStripped(live as never) // the same world's Save48 envelope
    const down = convertFromStep(p15b)
    expect(down.saveVersion).toBe(P15B_SAVE_VERSION - 1) // the predecessor, renumbered with P15B_SAVE_VERSION
    expect(canon(convertToStep(down))).toBe(canon(p15b))
    expect(canon(convertV50ToV51(convertV49ToV50(convertV48ToV49(convertToStep(down) as never))))).toBe(canon(live)) // and the live steps lift it back
    // The first tick evaluates its own week and nothing earlier (1352-F2 ruling 1).
    const ticked = tick(state)
    expect(conditionRoot(ticked).studios.every((r) => r.firstEvaluatedWeek === BASE_WEEK + 1)).toBe(true)
  })

  it('condition-root-downgrade', async () => {
    const mod = await saveModule()
    const convertFromStep = step<(save: unknown) => Save>(mod, 'convertFromP15BSave')
    const empty = rightsStripped(makeSave(base()))
    const down = convertFromStep(empty)
    expect(Object.hasOwn(down.state, 'corporateCondition')).toBe(false)
    expect(Object.hasOwn(down.state, 'studioClosure')).toBe(false)
    expect(() => validateSaveV47(down)).not.toThrow() // the predecessor's own reader (founding's Save47)
    for (const business of (down.state.hollywood as { businesses: { account: { periods: { movements: Record<string, number> }[] } }[] }).businesses) {
      for (const period of business.account.periods) for (const kind of LOAN_KINDS) expect(Object.hasOwn(period.movements, kind)).toBe(false)
    }
    // A ticked save holds records: the downgrade refuses by name, at this step, on the week-133 Save48 control.
    expect(conditionRoot(recorded()).events, 'premise: no condition event before 134').toEqual([])
    const ticked = makeSave(recorded())
    // Round 5 (review O1): the exact composed message, not a substring the live step's own phase-history reason shares.
    expect(() => convertFromStep(convertV49ToV48(convertV50ToV49(convertV51ToV50(ticked))))).toThrow(recordedRefusal(recorded()))
    expect(() => migrateToV47(ticked)).toThrow(recordedRefusal(recorded()))
    // ACCEPTANCE OPEN (P16 rebase rounds 4-5): the condition-event and loan refusals ('a corporateCondition event',
    // 'a studio loan', 'a loan or claim ledger row', 'the <kind> movement of <studio>'), and any control combining two or
    // more of this step's own reasons (order: condition, closure, Legacy, movements, ledger). The obstacle: tick.ts:1254
    // calls advanceRightsWeek on every tick and rightsTick.ts:23 throws for an industry with no rights root, so a Save48
    // state cannot be advanced; a ticked Save48 control can only be a rights-era world taken before its first table-3
    // row. The writers stamp `Object.hasOwn(state, 'rights') ? 3 : 2`, so a rights-era world's condition event is
    // table 3, and a loan needs warning or distress (studioLoan.ts loanEligible after CORPORATE_WARN_SUSTAIN_WEEKS low
    // weeks), so an event always precedes it. The borrowed world's public downgrade refuses at the live step first.
    expect(() => convertV49ToV48(convertV50ToV49(convertV51ToV50(makeSave(borrowed()))))).toThrow(LIVE_DOWNGRADE_REFUSAL)
    // The loan kinds are refused below the era: a predecessor envelope carrying one fails the frozen chain.
    const forgedLedger = clone(down)
    ;(forgedLedger.state.ledger as Record<string, unknown>[]).push({ week: BASE_WEEK, kind: 'loanPrincipal', amount: 1000, note: 'forged' })
    ;(forgedLedger.state.studio as { cash: number }).cash += 1000
    refuses(() => validateSaveV47(forgedLedger), 'kind')
    const forgedMovement = clone(down)
    const period = (forgedMovement.state.hollywood as { businesses: { account: { periods: { movements: Record<string, number> }[] } }[] }).businesses[0]!.account.periods[0]!
    period.movements.loanPrincipal = 0
    // r3 (review T14): the frozen chain names the exact movement keys it admits; the loan key is not one of them.
    refuses(() => validateSaveV47(forgedMovement), 'Hollywood save: exact keys required: capacity,signing,payroll,overhead,facilityOpex,development,production,marketing,studioRevenue,technologyAdoption,researchSpend,researchCapacity,technologyRestoration,technologyRefund,termination,facilityDemolitionRefund')
  })

  // r2 (1370-ar, stacked on founding r3): the step over founding's Save47 and R8's Save46.
  it('stacked-step-save48-over-founding-save47', async () => {
    const mod = await saveModule()
    const convertFromStep = step<(save: unknown) => Save>(mod, 'convertFromP15BSave')
    const convertToStep = step<(save: unknown) => Save>(mod, 'convertToP15BSave')
    expect(P15B_SAVE_VERSION, 'one step above the recruitment-fund era').toBe(FOUNDING_FUNDING_SAVE_VERSION + 1)
    expect(LIVE_SAVE_VERSION, 'the live step above it').toBe(EXPECTED_LIVE_SAVE_VERSION)
    // (a) the null-root downgrade is lossless and lands on the predecessor's own reader; every public step below
    // it (founding's fund, R8's recovery, the shared P15 step) admits the empty world, and the live migration lifts
    // each of them back to this step byte for byte.
    const liveEmpty = makeSave(base())
    const empty = rightsStripped(liveEmpty)
    const down = convertFromStep(empty)
    expect(down.saveVersion).toBe(FOUNDING_FUNDING_SAVE_VERSION)
    expect(validateSaveV47(down)).toBe(down)
    expect(canon(convertToStep(down))).toBe(canon(empty))
    expect(migrateToV47(empty).saveVersion).toBe(FOUNDING_FUNDING_SAVE_VERSION)
    expect(migrateToV46(empty).saveVersion).toBe(FOUNDING_FUNDING_SAVE_VERSION - 1)
    expect(migrateToV45(empty).saveVersion).toBe(FOUNDING_FUNDING_SAVE_VERSION - 2)
    for (const older of [migrateToV47(empty), migrateToV46(empty), migrateToV45(empty)]) expect(canon(migrateToLive(older))).toBe(canon(liveEmpty))
    // (b) the predecessor era is gated: a Save47 envelope carrying a P15B root or a loan movement is refused by
    // the frozen chain by name; the roots never leak into an older reader.
    const forgedRoot = clone(down)
    ;(forgedRoot.state as Record<string, unknown>).corporateCondition = clone(empty.state.corporateCondition)
    refuses(() => validateSaveV47(forgedRoot), 'corporateCondition')
    // (c) a ticked state refuses here first, naming this step's reasons before the predecessor steps' own, which are
    // appended rather than masked (founding's convertV47ToV46 pattern): the week-133 control's message names its
    // condition records, then R8's recovery reasons, at the step and through every older migrator. The shared P15
    // step's appended reason is asserted on the Legacy v3 Save48 control (p15b-legacy-v3.test.ts); the loan reason
    // is ACCEPTANCE OPEN (condition-root-downgrade above).
    const state133 = recorded()
    expect(state133.hollywood!.businesses.some((b) => b.costCutting.since !== null), 'premise: R8 cost cutting').toBe(true)
    expect(state133.hollywood!.receipts.some((r) => r.kind === 'facilityDisposed'), 'premise: R8 disposal').toBe(true)
    const live = makeSave(state133)
    const composed = recordedRefusal(state133)
    expect(() => convertFromStep(convertV49ToV48(convertV50ToV49(convertV51ToV50(live))))).toThrow(composed)
    for (const older of [migrateToV47, migrateToV46, migrateToV45]) expect(() => older(live)).toThrow(composed)
    expect(canon(makeSave(recorded()))).toBe(canon(live))
    // The borrowed world (table-3 events and loans) refuses at the live Save49 step first.
    const borrowedLive = makeSave(borrowed())
    for (const older of [migrateToV47, migrateToV46, migrateToV45]) expect(() => older(borrowedLive)).toThrow(LIVE_DOWNGRADE_REFUSAL)
  })
})

describe('p15b2 save step: the root validator (1357-A §4.1; S3-S6)', () => {
  it('condition-validate-records-and-ids', async () => {
    const validateSaveP15B = validateLiveSave as unknown as (save: unknown) => Save // the live reader (Save49; its predecessor proof runs these roots)
    expect(() => validateSaveP15B(makeSave(borrowed()))).not.toThrow()
    expect(root(raw(borrowed())).events.length, 'premise: warning and distress events').toBeGreaterThanOrEqual(2)
    refuses(() => validateSaveP15B(tampered((s) => { root(s).events.push({ ...root(s).events[0]! }) })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { root(s).events[0]!.eventId = 'corporate-event-99' })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { root(s).nextEvent = 1 })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { (root(s).studios[0]!.condition as { week: number }).week -= 1 })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { (root(s).studios[0]!.condition as { lowRun: number }).lowRun = -1 })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { root(s).studios.push({ ...root(s).studios[0]!, studioId: 'studio-aca408ec-r05' }) })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { root(s).version = 2 })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { (root(s) as Record<string, unknown>).extra = 1 })), 'corporateCondition')
    // 1357-F Amendment 1: a duplicate sequence across roots and a stale allocator refuse.
    refuses(() => validateSaveP15B(tampered((s) => { (root(s).events[1]! as { p15DomainSequence: number }).p15DomainSequence = (root(s).events[0]! as { p15DomainSequence: number }).p15DomainSequence })), 'p15DomainSequence')
    refuses(() => validateSaveP15B(tampered((s) => { (s.p15Sequence as { next: number }).next += 1 })), 'p15Sequence')
  })

  it('condition-validate-events', async () => {
    const validateSaveP15B = validateLiveSave as unknown as (save: unknown) => Save // the live reader (Save49; its predecessor proof runs these roots)
    // events[1] is r04's stable→warning at 134; a `from` that is not its chain's stage breaks the chain.
    refuses(() => validateSaveP15B(tampered((s) => { root(s).events[1]!.from = 'recovery' })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { (root(s).events[0]!.causes as { weeks: number }[])[0]!.weeks = 3 })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { root(s).events[0]!.definitionVersion = 'corporate-condition/v9' })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { (root(s).events[0]! as { phaseOrdinal: number }).phaseOrdinal += 1 })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { (root(s).events[0]! as { week: number }).week += 1 })), 'corporateCondition')
  })

  it('loan-validate-reconcile', async () => {
    const validateSaveP15B = validateLiveSave as unknown as (save: unknown) => Save // the live reader (Save49; its predecessor proof runs these roots)
    // The player's one loan (134) is the only loan at 140: r04's natural distress loan falls at 141 on the stacked
    // tree (R8's refund at 131), so the rival leaves below tamper a route where r04 holds a loan (r3, review T14).
    expect(loansOf(borrowed(), PLAYER).length).toBe(1)
    expect(root(raw(borrowed())).loans.map((l) => l.studioId)).toEqual([PLAYER])
    refuses(() => validateSaveP15B(tampered((s) => { (root(s).loans[0]!.installments as number[])[0] += 1 })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { (root(s).loans[0]! as { principal: number }).principal += 1 })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { (root(s).loans[0]! as { contractedWeek: number }).contractedWeek = 132 })), 'corporateCondition')
    refuses(() => validateSaveP15B(tampered((s) => { root(s).loans[0]!.lawVersion = 'studio-loan/v9' })), 'corporateCondition')
    // Money: the principal row and every due installment row must exist exactly once and reconcile.
    refuses(() => validateSaveP15B(tampered((s) => {
      const ledger = s.ledger as { kind: string; amount: number }[]
      const index = ledger.findIndex((row) => row.kind === 'loanPrincipal')
      ledger.splice(index, 1)
      ;(s.studio as { cash: number }).cash -= 390_000
    })), 'loan')
    refuses(() => validateSaveP15B(tampered((s) => {
      const ledger = s.ledger as { kind: string; amount: number }[]
      const index = ledger.findIndex((row) => row.kind === 'loanInstallment')
      ledger.splice(index, 1)
      ;(s.studio as { cash: number }).cash += 8_400
    })), 'loan')
    refuses(() => validateSaveP15B(tampered((s) => {
      const ledger = s.ledger as { week: number; kind: string; amount: number; note: string }[]
      ledger.push({ week: 136, kind: 'loanInstallment', amount: -8_400, note: 'studio loan installment' })
      ;(s.studio as { cash: number }).cash -= 8_400
    })), 'loan')
    // Sign rules: a negative principal row is refused by the frozen chain itself.
    refuses(() => validateSaveP15B(tampered((s) => {
      const row = (s.ledger as { kind: string; amount: number }[]).find((r) => r.kind === 'loanPrincipal')!
      row.amount = -row.amount
      ;(s.studio as { cash: number }).cash -= 2 * 390_000
    })), 'loanPrincipal')
    // A rival period's loan movements must equal the loans root's sums over the weeks it holds: r04 drained by 10M
    // borrows at 138 and has paid eleven installments by 150.
    const holder = rivalClosure(150).get(150)!
    expect(loansOf(holder, R04).map((l) => l.contractedWeek), 'premise: r04 holds its distress loan').toEqual([138])
    const rivalTamper = (edit: (business: { account: { cash: number; periods: { closing: number; movements: Record<string, number> }[] } }) => void): Save => {
      const save = clone(makeSave(holder)) as unknown as Save
      edit((save.state.hollywood as { businesses: { studioId: string; account: { cash: number; periods: { closing: number; movements: Record<string, number> }[] } }[] }).businesses.find((b) => b.studioId === R04)!)
      return save
    }
    expect(() => validateSaveP15B(makeSave(holder))).not.toThrow()
    for (const [kind, delta, named] of [['loanInstallment', -8_400, 'loanInstallment movements do not reconcile with its loan schedule'],
      ['loanInstallment', 8_400, 'loanInstallment movements do not reconcile with its loan schedule'], ['loanPrincipal', 1000, 'loanPrincipal movements do not reconcile with its loans']] as const) {
      refuses(() => validateSaveP15B(rivalTamper((business) => { const period = business.account.periods.at(-1)!; period.movements[kind] += delta; period.closing += delta; business.account.cash += delta })),
        `rival ${R04} ${named}`)
    }
  })

  // r3 (review C2/D2): a rival's boundary loan and the player's own takeLoan in the same week are a lawful pair, and
  // the campaign stays savable. The order law still refuses a rival loan appended after the player's in one week.
  it('loan-same-week-rival-boundary-then-player-action', async () => {
    const validateSaveP15B = validateLiveSave as unknown as (save: unknown) => Save // the live reader (Save49; its predecessor proof runs these roots)
    const s141 = ticks(drainPlayer(base(), base().studio.cash + 1), 11)
    expect(loansOf(s141, R04).map((l) => l.contractedWeek), 'premise: r04 borrows at the 141 boundary').toEqual([141])
    expect(recordOf(s141, PLAYER)!.condition.stage).toBe('distress')
    const both = applyActions(s141, [takeLoan(390_000)])
    expect(root(raw(both)).loans.map((l) => [l.studioId, l.contractedWeek])).toEqual([[R04, 141], [PLAYER, 141]])
    const saved = makeSave(both)
    expect(() => validateSaveP15B(saved)).not.toThrow()
    const reloaded = migrateToLive(importSave(exportSave(saved))).state as unknown as GameState
    expect(canon(reloaded)).toBe(canon(both))
    expect(canon(ticks(reloaded, 2))).toBe(canon(ticks(both, 2)))
    expect(() => makeSave(ticks(reloaded, 2))).not.toThrow()
    const reversed = clone(saved) as unknown as Save
    const loans = root(reversed.state).loans
    const [first, second] = [loans[0]!, loans[1]!]
    loans[0] = { ...second, loanId: first.loanId, p15DomainSequence: first.p15DomainSequence }
    loans[1] = { ...first, loanId: second.loanId, p15DomainSequence: second.p15DomainSequence }
    refuses(() => validateSaveP15B(reversed), 'append order')
  })

  it('condition-law-tables-frozen', async () => {
    const mod = (await import('../src/core/corporateConditionLive.js')) as unknown as Record<string, unknown>
    const conditionLaws = mod.CONDITION_LAWS as Record<string, Record<string, number>>
    const loanLaws = mod.LOAN_LAWS as Record<string, Record<string, number>>
    if (conditionLaws === undefined || loanLaws === undefined) throw new Error('RED: corporateConditionLive.ts exports no CONDITION_LAWS / LOAN_LAWS tables (1357-A §4.1 item 7)')
    const condition = conditionLaws['corporate-condition/v1']!
    for (const key of ['CORPORATE_WARN_COVER_WEEKS', 'CORPORATE_WARN_SUSTAIN_WEEKS', 'CORPORATE_CLEAR_WEEKS', 'CORPORATE_DISTRESS_SUSTAIN_WEEKS', 'CORPORATE_RECOVERY_STABLE_WEEKS', 'CORPORATE_CLOSURE_DISTRESS_WEEKS'] as const) {
      expect(condition[key], key).toBe(TUNING[key])
    }
    const loan = loanLaws['studio-loan/v1']!
    for (const key of ['LOAN_MAX_FIXED_COST_WEEKS', 'LOAN_TERM_WEEKS', 'LOAN_INTEREST_PERCENT', 'LOAN_AMOUNT_STEP'] as const) expect(loan[key], key).toBe(TUNING[key])
    expect(Object.isFrozen(condition) && Object.isFrozen(loan)).toBe(true)
  })
})

describe('p15b2 save step: the round trip (S7)', () => {
  it('condition-round-trip', () => {
    const s140 = borrowed()
    expect(loansOf(s140, PLAYER).length).toBe(1)
    const reloaded = migrateToLive(importSave(exportSave(makeSave(s140)))).state as unknown as GameState
    expect(canon(reloaded)).toBe(canon(s140))
    expect(canon(ticks(reloaded, 20))).toBe(canon(ticks(s140, 20)))
    expect(conditionRoot(ticks(reloaded, 20)).studios.find((r) => r.studioId === PLAYER)!.condition.week).toBe(160)
  })
})

// P16 rebase round 5 (review O3): the P15B roots' own reason strings and their join order, through the exported
// per-root refusals. This pins the strings the step composes, not the step: no lawful Save48 control holds an event,
// a loan, a closure, a claim or an estate event (the ACCEPTANCE OPEN notes above). No capture needed.
describe('p15b2 the P15B roots\' downgrade reason strings (strings and order, not the step)', () => {
  it('each root names its non-empty lists in order, joined by "; ", and an empty root names nothing', () => {
    expect(corporateConditionDowngradeRefusal({ corporateCondition: { studios: [{}], events: [{}, {}], loans: [{}] } }))
      .toBe('cannot downgrade or discard a corporateCondition record (1 evaluated); cannot downgrade or discard a corporateCondition event (2 recorded); cannot downgrade or discard a studio loan (1 contracted)')
    expect(corporateConditionDowngradeRefusal({ corporateCondition: { studios: [], events: [], loans: [] } })).toBeNull()
    expect(studioClosureDowngradeRefusal({ studioClosure: { closures: [{}], claims: [{}, {}], estateEvents: [{}, {}, {}] } }))
      .toBe('cannot downgrade or discard an actual studio closure (1 recorded); cannot downgrade or discard a closure claim (2 recorded); cannot downgrade or discard an estate event (3 recorded)')
    expect(studioClosureDowngradeRefusal({ studioClosure: { closures: [], claims: [], estateEvents: [] } })).toBeNull()
  })
})
