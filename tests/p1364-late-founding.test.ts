// ── 1364: the two late-founding invariants (1364-A as adopted by 1362-O's third response) ──
//
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/): 1364-R (the
// reachability check: the browser's supported save import accepts an open draft past week 0 and
// routes it to the founding screen), 1362-O "The third response" (the Owner: that path counts as
// reachable; fix both invariant failures; preserve week-0 founding and existing supported saves;
// invent no payment, backdate nothing, charge nothing twice, weaken no validator), 1364-A §2-§5
// (the bounded correction: a dedicated recruitment-fund authority `foundingFunding` in a new save
// era, and a tick refusal while a draft is open).
//
// RED at r1 against 6510c971 + 1365 (no `foundingFunding` root, no save step, no tick guard), measured
// in the 1370-AR package (red-1364.json; RED-FIRST-EVIDENCE §3): 40 of 42 leaves failed, but 35 of
// them failed at the shared import premise `converted` (the save-version bump), not at the invariant
// each names; 5 failed at their own requirement. r4 moved that premise into its own leaf
// (founding-import-premise), so each leaf's first failing assertion is its own, or the missing root
// for a leaf that reads it. The CONTROL leaves pin today's behaviour.
//
// Inputs: tests/fixtures/p1364/generated-v45-late-draft/ (MANIFEST.json): generated, clearly
// labelled V45 engine inputs minted at the V45 writer (1364-A §4). They exercise the supported
// import surface; they are not proof that an old browser build wrote them.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { beginFounding, beginFoundingHistoricalControl, FOUNDING_MINIMUMS } from '../src/core/employment.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { contractOfferOptions, hiringMarketView } from '../src/core/index.js'
import * as saveModule from '../src/core/save.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { generateWorld } from '../src/core/worldgen.js'
import { recordFoundingFund } from '../src/core/foundingFunding.js'
import { TUNING } from '../src/core/tuning.js'
import type { FoundingRegime, GameState, LedgerEntry } from '../src/core/types.js'
// R8's genuine Save45 predecessor (1363, landed as Save46): the step below this one.
import { recoveryPredecessor45 } from './helpers/1367-recovery-predecessors.js'
import { historicalHashState } from '../src/harness/roster-wall/historical-control.js'
import { EXPECTED_LIVE_SAVE_VERSION, validateLiveSave } from './helpers/live-era.js'
import { predecessorSave } from './helpers/p15-roots.js'
import { LIVE_DOWNGRADE_REFUSAL, NONDEFAULT_MARKET_PROJECTION } from './helpers/p16-era.js'

// ── the supported entry surfaces, as the adapter wraps them (ui/src/engine/adapter.ts) ─────
// The browser's `newGame`, `importSaveJson`, `foundManagedStudioAction` and `advanceWeek` are thin
// wrappers over these core calls; the core project cannot import the adapter (its own tsconfig), so
// this file calls the same core sequence the adapter does. The bridge's no-advance check lives in
// tests/bridge-p1364-founding-no-advance.test.ts.
const newGame = (seed: string, options?: { regime?: FoundingRegime }): GameState => beginFounding(generateWorld(seed, options))
type ImportOutcome = { ok: true; state: GameState; converted: boolean } | { ok: false; error: string }
function importSaveJson(json: string): ImportOutcome {
  try {
    const save = importSave(json)
    return { ok: true, state: migrateToLive(save).state as GameState, converted: save.saveVersion !== saveModule.LIVE_SAVE_VERSION }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
type ActionOutcome = { ok: true; next: GameState } | { ok: false; error: string }
function foundManagedStudioAction(state: GameState): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'foundStudio' }, { kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
const advanceWeek = (state: GameState): GameState => tick(state, { develop: true })

// ── the new root, typed locally so this file compiles before it exists (1364-A §3) ──────
type Allocation = { contractId: string; week: number; amount: number }
type Fund = {
  provenance: 'opened' | 'observed-open-draft'; budget: number; spentAtRecording: number; spentBonus: number
  openingEmploymentCount: number; closedWeek: number | null; closingEmploymentCount: number | null; allocations: Allocation[]
}
type FundingRoot = { version: 1; recordedFromWeek: number; fund: Fund | null }
type Envelope = { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
/** The step's one named constant (save.ts); the integrator renumbers it at landing (1370-AS review). */
const FOUNDING_STEP: number = saveModule.FOUNDING_FUNDING_SAVE_VERSION
const TICK_REFUSAL = /^tick: complete studio founding before advancing the campaign$/
const FUND_DOWNGRADE = /cannot downgrade or discard the recorded founding fund/
/** The live reader's exact funding refusal, `validateSaveV<step>: foundingFunding <body>`; contract ids as ID. */
const fundingRefusal = (body: string): RegExp => new RegExp(`^validateSaveV${FOUNDING_STEP}: foundingFunding ${body}$`)
const ID = String.raw`\S+`
const PAYMENT_GUARD = /Hollywood save: employment start lacks its actual player signing payment$/
const DOUBLE_PAYMENT = /Hollywood save: founding signature of \S+ at week 26 also carries a cash signing payment \(double payment\)$/

function fundingRoot(state: GameState): FundingRoot {
  const root = (state as unknown as Record<string, unknown>).foundingFunding
  if (root === undefined) throw new Error('RED: GameState has no `foundingFunding` root (1364-A §3); the 1364 step has not landed')
  return root as FundingRoot
}
function fundOf(state: GameState): Fund {
  const fund = fundingRoot(state).fund
  if (fund === null) throw new Error('premise: the fund is null')
  return fund
}
function saveFn(name: string): (save: unknown) => Envelope {
  const fn = (saveModule as unknown as Record<string, unknown>)[name]
  if (typeof fn !== 'function') throw new Error(`RED: save.ts does not export ${name} (the founding step is ${FOUNDING_STEP})`)
  return fn as (save: unknown) => Envelope
}
const canon = (value: unknown): string => stableStringify(JSON.parse(JSON.stringify(value)))
const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const bytesOf = (state: GameState): string => exportSave(makeSave(state))
const detached = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const withRoot = (state: GameState, root: FundingRoot): GameState => ({ ...state, foundingFunding: root }) as unknown as GameState
const withFund = (state: GameState, edit: (fund: Fund) => void): GameState => {
  const root = detached(fundingRoot(state))
  edit(root.fund!)
  return withRoot(state, root)
}

// ── the generated V45 inputs (1364-A §4) ───────────────────────────────────────────
const FIXTURES = 'fixtures/p1364/generated-v45-late-draft/'
type Manifest = { inputs: { name: string; saveVersion: number; bytes: number; sha256: string; week: number }[] }
function fixtureText(name: string): string {
  const manifest = JSON.parse(readFileSync(new URL(`./${FIXTURES}MANIFEST.json`, import.meta.url), 'utf8')) as Manifest
  const entry = manifest.inputs.find((input) => input.name === name)
  if (entry === undefined) throw new Error(`no fixture ${name}`)
  const text = readFileSync(new URL(`./${FIXTURES}${name}.json`, import.meta.url), 'utf8')
  expect(Buffer.byteLength(text)).toBe(entry.bytes)
  expect(sha256(text)).toBe(entry.sha256)
  expect(entry.saveVersion).toBe(45)
  return text
}
/** The predecessor validates the input before any migration (1364-A §4 "prove its predecessor validation succeeds"). */
function predecessorValidated(name: string): string {
  const text = fixtureText(name)
  expect(() => saveModule.validateSaveV45(JSON.parse(text))).not.toThrow()
  return text
}
/** The import a leaf builds on. Whether it converted is the premise leaf `founding-import-premise`
 * asserts once, so no leaf's RED is attributed to the save-version bump (1370-AR r3 review item 8). */
function imported(name: string): GameState {
  const outcome = importSaveJson(predecessorValidated(name))
  if (!outcome.ok) throw new Error(`import refused: ${outcome.error}`)
  return outcome.state
}

// ── the deterministic minimum lawful roster from offered choices (1364-A §5 item 1) ──────
function signMinimum(start: GameState): { state: GameState; signed: { talentId: string; bonus: number; contractId: string }[] } {
  let state = start
  const signed: { talentId: string; bonus: number; contractId: string }[] = []
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    let count = 0
    for (const id of start.founding!.applicantIds) {
      if (count === FOUNDING_MINIMUMS[role]) break
      const person = state.talent.find((t) => t.id === id)!
      if (person.role !== role) continue
      const offer = contractOfferOptions(state, id)[0]
      if (offer === undefined) continue
      const before = state.hollywood?.employment.length ?? 0
      state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: offer.termWeeks }])
      const row = state.hollywood?.employment[before]
      signed.push({ talentId: id, bonus: state.contracts[state.contracts.length - 1]!.signingBonus, contractId: row?.contractId ?? `headless:${id}` })
      count++
    }
    if (count !== FOUNDING_MINIMUMS[role]) throw new Error(`premise: the draft offers no ${count === 0 ? '' : 'further '}lawful ${role}`)
  }
  return { state, signed }
}
const signingRows = (state: GameState): LedgerEntry[] => state.ledger.filter((row) => row.kind === 'signingBonus')
const playerRows = (state: GameState) => state.hollywood!.employment.filter((e) => e.studioId === state.hollywood!.playerStudioId)

/** A fully valid corrected late-founded campaign: import, sign the minimum, found, in one week. */
let lateMemo: { founded: GameState; draft: GameState; signed: { talentId: string; bonus: number; contractId: string }[] } | null = null
function lateFounded() {
  if (lateMemo === null) {
    const draft = imported('late-draft-week26-unsigned')
    const { state, signed } = signMinimum(draft)
    const outcome = foundManagedStudioAction(state)
    if (!outcome.ok) throw new Error(`founding refused: ${outcome.error}`)
    lateMemo = { founded: outcome.next, draft, signed }
  }
  return lateMemo
}
const HEAVY = 240_000
let headless3: GameState | null = null
/** A never-founded headless campaign advanced to week 3: no draft, no industry, no engaged economy. */
function headlessAtWeek3(): GameState {
  if (headless3 === null) {
    let world = generateWorld('p1364-opened-01')
    while (world.market.tick < 3) world = tick(world)
    headless3 = world
  }
  return headless3
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2.B — the engine-only open draft (1364-A §5 item 3). NOT UI-reachable: the founding screen
// offers no advance (1364-R §2.2) and the bridge withholds advanceWeek (1364-R §2.3).
// ═══════════════════════════════════════════════════════════════════════════════
describe('1364 invariant B: a tick refuses an open founding draft (engine boundary only)', () => {
  it('founding-tick-refuses-week-zero-draft: a valid week-0 draft fails tick immediately, input unchanged; advanceWeek fails on the same premise', () => {
    const draft = newGame('p1364-w0-draft-01')
    expect(draft.founding).not.toBeNull()
    const before = canon(draft)
    expect(() => tick(draft)).toThrow(TICK_REFUSAL)
    expect(() => advanceWeek(draft)).toThrow(TICK_REFUSAL)
    expect(canon(draft)).toBe(before)
  })

  it('founding-tick-refuses-late-draft: the accepted generated week-26 draft fails tick immediately with the named refusal; deep input, RNG, receipts, cash and technology unchanged', () => {
    const draft = imported('late-draft-week26-unsigned')
    expect(draft.market.tick).toBe(26)
    expect(draft.founding).not.toBeNull()
    expect(draft.hollywood?.origin).toBe('migration')
    const before = canon(draft)
    expect(() => tick(draft)).toThrow(TICK_REFUSAL)
    expect(() => advanceWeek(draft)).toThrow(TICK_REFUSAL)
    expect(canon(draft)).toBe(before)
    expect(draft.rngState).toBe(JSON.parse(before).rngState)
  }, HEAVY)

  it('founding-tick-controls-advance: a world with no draft still advances; a founded player advances into real rival method locks and saves validly [control]', () => {
    let world = generateWorld('p1364-control-01')
    for (let i = 0; i < 3; i++) world = tick(world)
    expect(world.market.tick).toBe(3)
    const outcome = foundManagedStudioAction(signMinimum(newGame('p1364-control-01')).state)
    if (!outcome.ok) throw new Error(outcome.error)
    let founded = outcome.next
    expect(founded.founding).toBeNull()
    let firstLock: number | null = null
    for (let week = 0; week < 60 && firstLock === null; week++) {
      founded = tick(founded)
      if (founded.technology.productions.length > 0) firstLock = founded.market.tick
    }
    expect(firstLock, 'premise: a rival locks a production method within 60 weeks').not.toBeNull()
    expect(() => makeSave(founded)).not.toThrow()
  }, HEAVY)
})

// ═══════════════════════════════════════════════════════════════════════════════
// §2.A — the supported import, late signing and founding (1364-A §5 items 1, 2)
// ═══════════════════════════════════════════════════════════════════════════════
describe('1364 invariant A: a supported late import signs from its recruitment fund, founds, saves and reloads', () => {
  it('founding-import-premise: both generated V45 inputs convert on import through the genuine 45 -> 46 -> 47 step chain, the premise every import leaf builds on', () => {
    for (const name of ['late-draft-week26-unsigned', 'late-draft-week26-observed-spent']) {
      const outcome = importSaveJson(predecessorValidated(name))
      if (!outcome.ok) throw new Error(`import refused: ${outcome.error}`)
      expect(outcome.converted, name).toBe(true)
      expect(makeSave(outcome.state).saveVersion, name).toBe(saveModule.LIVE_SAVE_VERSION)
    }
  }, HEAVY)

  it('founding-late-import-observes-fund:the migrated late draft records an observed-open-draft fund with no invented allocation', () => {
    const draft = imported('late-draft-week26-unsigned')
    const root = fundingRoot(draft)
    expect(root.version).toBe(1)
    expect(root.recordedFromWeek).toBe(26)
    const fund = fundOf(draft)
    expect(fund.provenance).toBe('observed-open-draft')
    expect(fund.budget).toBe(draft.founding!.budget)
    expect(fund.spentAtRecording).toBe(0)
    expect(fund.spentBonus).toBe(0)
    expect(fund.openingEmploymentCount).toBe(draft.hollywood!.employment.length)
    expect(fund.closedWeek).toBeNull()
    expect(fund.closingEmploymentCount).toBeNull()
    expect(fund.allocations).toEqual([])
    // Migration is idempotent and does not touch its input.
    const text = fixtureText('late-draft-week26-unsigned')
    const once = migrateToLive(importSave(text))
    const twice = migrateToLive(once)
    expect(exportSave(twice)).toBe(exportSave(once))
    expect(once.saveVersion).toBe(saveModule.LIVE_SAVE_VERSION) // 1370-ar r2: the live step stacks above the founding step
    expect(sha256(text)).toBe(sha256(fixtureText('late-draft-week26-unsigned')))
  }, HEAVY)

  it('founding-late-sign-found-save-reload: every offered signature and the founding succeed in the same week, and the campaign is valid at each step and after reload', () => {
    const { draft, signed, founded } = lateFounded()
    expect(signed.length).toBe(Object.values(FOUNDING_MINIMUMS).reduce((a, b) => a + b, 0))
    // Each signature leaves a valid save and one allocation for the recorder's own contract id.
    let state = draft
    for (const [i, s] of signed.entries()) {
      const offer = contractOfferOptions(state, s.talentId)[0]!
      state = applyActions(state, [{ kind: 'signContract', talentId: s.talentId, termWeeks: offer.termWeeks }])
      expect(() => makeSave(state)).not.toThrow()
      const fund = fundOf(state)
      expect(fund.allocations.length).toBe(i + 1)
      const allocation = fund.allocations[i]!
      expect(allocation.contractId).toBe(s.contractId)
      expect(allocation.week).toBe(26)
      expect(allocation.amount).toBe(s.bonus)
      expect(fund.spentBonus).toBe(state.founding!.spentBonus)
      const row = state.hollywood!.employment.find((e) => e.contractId === s.contractId)!
      expect(row.reason).toBe('player-contract')
      expect(row.terms.startWeek).toBe(26)
    }
    expect(founded.market.tick).toBe(26)
    expect(founded.founding).toBeNull()
    const fund = fundOf(founded)
    expect(fund.closedWeek).toBe(26)
    expect(fund.closingEmploymentCount).toBe(founded.hollywood!.employment.length)
    const bytes = bytesOf(founded)
    const loaded = migrateToLive(importSave(bytes)).state as GameState
    expect(bytesOf(loaded)).toBe(bytes)
    // The founded campaign advances (the engine refusal is gone with the draft) and stays valid.
    expect(() => makeSave(tick(loaded))).not.toThrow()
  }, HEAVY)

  it('founding-late-accounting: recruitment spending equals the exact bonuses; operating cash and the cash signing ledger do not move; receipts are exact; founding closes once; replay allocates once', () => {
    const { draft, signed, founded } = lateFounded()
    const fund = fundOf(founded)
    const total = signed.reduce((sum, s) => sum + s.bonus, 0)
    expect(fund.allocations.map((a) => a.amount).reduce((a, b) => a + b, 0)).toBe(total)
    expect(fund.spentBonus).toBe(total)
    expect(fund.spentBonus).toBeLessThanOrEqual(fund.budget)
    expect(founded.studio.cash).toBe(draft.studio.cash)
    expect(signingRows(founded)).toEqual(signingRows(draft))
    expect(new Set(fund.allocations.map((a) => a.contractId)).size).toBe(fund.allocations.length)
    for (const s of signed) {
      const receipts = founded.hollywood!.receipts.filter((r) => r.kind === 'employment' && r.contractId === s.contractId)
      expect(receipts.length).toBe(1)
      expect(receipts[0]).toMatchObject({ week: 26, reason: 'player-contract', talentId: s.talentId })
    }
    expect(() => applyActions(founded, [{ kind: 'foundStudio' }])).toThrow(/no founding draft is open/)
    // Replay: the same actions on the same import give the same bytes.
    const again = foundManagedStudioAction(signMinimum(imported('late-draft-week26-unsigned')).state)
    if (!again.ok) throw new Error(again.error)
    expect(bytesOf(again.next)).toBe(bytesOf(founded))
  }, HEAVY)

  it('founding-late-zero-bonus-allocation: the pure validator accepts a zero-cost funded signature with its one zero allocation', () => {
    const { founded, signed } = lateFounded()
    const s = signed[0]!
    const zero = detached(founded)
    for (const c of zero.contracts) if (c.talentId === s.talentId) c.signingBonus = 0
    for (const e of zero.hollywood!.employment) if (e.contractId === s.contractId) e.terms.signingBonus = 0
    const root = fundingRoot(zero)
    root.fund!.allocations = root.fund!.allocations.map((a) => (a.contractId === s.contractId ? { ...a, amount: 0 } : a))
    root.fund!.spentBonus -= s.bonus
    expect(() => makeSave(zero)).not.toThrow()
  }, HEAVY)

  it('founding-opened-provenance: a public beginFounding after week 0 on a never-founded campaign records an opened fund (its week, nothing spent, the interval from the register length); the open, signed and closed campaign each round-trip through save and load', () => {
    const draft = beginFounding(headlessAtWeek3())
    expect(fundingRoot(draft).recordedFromWeek).toBe(3)
    const fund = fundOf(draft)
    expect(fund.provenance).toBe('opened')
    expect([fund.budget, fund.spentAtRecording, fund.spentBonus, fund.closedWeek, fund.closingEmploymentCount]).toEqual([draft.founding!.budget, 0, 0, null, null])
    expect(fund.openingEmploymentCount).toBe(draft.hollywood!.employment.length)
    expect(fund.allocations).toEqual([])
    const roundTrips = (state: GameState): void => {
      const bytes = bytesOf(state)
      expect(bytesOf(migrateToLive(importSave(bytes)).state as GameState)).toBe(bytes)
    }
    roundTrips(draft)
    const { state: signed, signed: rows } = signMinimum(draft)
    expect(fundOf(signed).allocations.map((a) => a.contractId)).toEqual(rows.map((r) => r.contractId))
    roundTrips(signed)
    const outcome = foundManagedStudioAction(signed)
    if (!outcome.ok) throw new Error(outcome.error)
    expect([fundOf(outcome.next).closedWeek, fundOf(outcome.next).closingEmploymentCount]).toEqual([3, outcome.next.hollywood!.employment.length])
    roundTrips(outcome.next)
  }, HEAVY)

  it('founding-reentry-noop: beginFounding over an open draft is a no-op that keeps its fund (opened, opened after a signature, observed)', () => {
    const opened = beginFounding(headlessAtWeek3())
    const first = opened.founding!.applicantIds.find((id) => contractOfferOptions(opened, id).length > 0)!
    const signedOnce = applyActions(opened, [{ kind: 'signContract', talentId: first, termWeeks: contractOfferOptions(opened, first)[0]!.termWeeks }])
    expect(fundOf(signedOnce).allocations.length, 'premise: one funded signature').toBe(1)
    for (const state of [opened, signedOnce, imported('late-draft-week26-unsigned')]) {
      const before = canon(state)
      expect(canon(beginFounding(state))).toBe(before)
      expect(canon(state)).toBe(before)
    }
  }, HEAVY)
})

// ═══════════════════════════════════════════════════════════════════════════════
// Legacy observation and week-zero compatibility (1364-A §5 items 4, 5, 10)
// ═══════════════════════════════════════════════════════════════════════════════
describe('1364 observation: older open drafts, closed campaigns, week-zero founding, the historical control', () => {
  it('founding-legacy-observed-spent: a valid older open draft with a pre-boundary observed balance migrates to an observational fund with zero invented rows, and a new signature in the same week sits beside the old one', () => {
    const draft = imported('late-draft-week26-observed-spent')
    const fund = fundOf(draft)
    expect(fund.provenance).toBe('observed-open-draft')
    expect(fund.spentAtRecording).toBe(draft.founding!.spentBonus)
    expect(fund.spentBonus).toBe(draft.founding!.spentBonus)
    expect(fund.spentAtRecording).toBeGreaterThan(0)
    expect(fund.allocations).toEqual([])
    const observed = playerRows(draft)
    expect(observed.length).toBe(1)
    expect(observed[0]!.reason).toBe('existing-player-contract')
    expect(fund.openingEmploymentCount).toBe(draft.hollywood!.employment.length)
    const text = fixtureText('late-draft-week26-observed-spent')
    expect(exportSave(migrateToLive(importSave(text)))).toBe(exportSave(migrateToLive(migrateToLive(importSave(text)))))
    // A new signature at the same observed week: one allocation, the observed row untouched.
    const actor = draft.founding!.applicantIds.map((id) => draft.talent.find((t) => t.id === id)!)
      .find((t) => t.role === 'director' && contractOfferOptions(draft, t.id).length > 0)!
    const next = applyActions(draft, [{ kind: 'signContract', talentId: actor.id, termWeeks: contractOfferOptions(draft, actor.id)[0]!.termWeeks }])
    expect(fundOf(next).allocations.length).toBe(1)
    expect(fundOf(next).spentBonus).toBe(next.founding!.spentBonus)
    expect(playerRows(next)[0]).toEqual(observed[0])
    expect(() => makeSave(next)).not.toThrow()
  }, HEAVY)

  it('founding-week-zero-unchanged: endowed and bare-lot new games sign and found through their real wrappers with a null fund, no invented ledger row, and save/reload [control]', () => {
    for (const regime of ['endowed', 'bare-lot'] as const) {
      const draft = newGame(`p1364-w0-${regime}`, { regime })
      expect(fundingRoot(draft).fund).toBeNull()
      const { state } = signMinimum(draft)
      expect(signingRows(state)).toEqual([])
      const outcome = foundManagedStudioAction(state)
      if (!outcome.ok) throw new Error(outcome.error)
      expect(fundingRoot(outcome.next).fund).toBeNull()
      expect(signingRows(outcome.next)).toEqual([])
      const bytes = bytesOf(outcome.next)
      expect(bytesOf(migrateToLive(importSave(bytes)).state as GameState)).toBe(bytes)
      // Managed activation's atomic failure: an incomplete roster refuses and the draft is untouched.
      const refused = foundManagedStudioAction(draft)
      expect(refused.ok).toBe(false)
      expect(canon(draft)).toBe(canon(newGame(`p1364-w0-${regime}`, { regime })))
    }
  }, HEAVY)

  it('founding-historical-control-unchanged: the headless sign -> close -> migration-initialize route keeps its observations, invents no allocation and saves validly [control]', () => {
    let state = beginFoundingHistoricalControl(generateWorld('p1364-historical-01'))
    expect(state.hollywood).toBeNull()
    state = signMinimum(state).state
    state = applyActions(state, [{ kind: 'foundStudio' }])
    expect(state.founding).toBeNull()
    const industry = initializeHollywood(state, 'migration')
    expect(playerRows(industry).every((e) => e.reason === 'existing-player-contract')).toBe(true)
    expect(fundingRoot(industry).fund).toBeNull()
    expect(() => makeSave(industry)).not.toThrow()
  }, HEAVY)

  it('founding-historical-hash-control: the roster-wall historical hash discards a control\'s null funding root, so a ticked control and its SaveFileV18 replay hash equal (the Week-196 entry harvest); a recorded fund is never discarded (1370-AR r5 item H.1)', () => {
    // The harvest (src/harness/roster-wall/campaign.ts harvestSave) writes the live control through the
    // frozen V18 builder, re-imports it and compares `historicalHashState` of both. The frozen builder strips
    // the null funding root; the hash projection must drop it too, as it drops the empty P15 roots.
    let control = signMinimum(beginFoundingHistoricalControl(generateWorld('p1364-historical-hash-01'))).state
    control = applyActions(control, [{ kind: 'foundStudio' }])
    for (let i = 0; i < 3; i++) control = tick(control)
    expect([control.hollywood, fundingRoot(control).fund, control.market.tick]).toEqual([null, null, 3])
    const replay = saveModule.validateSaveV18(importSave(exportSave(saveModule.makeSaveV18(structuredClone(control)))))
    expect('foundingFunding' in replay.state, 'premise: the frozen V18 era carries no funding root').toBe(false)
    expect(stableStringify(historicalHashState(replay.state))).toBe(stableStringify(historicalHashState(control)))
    // Hash projection refuses every authority family and malformed initial metadata without mutation.
    for (const [key, edits, message] of [
      ['corporateCondition', ['studios', 'events', 'loans'], /^Historical hash cannot discard corporate-condition authority$/],
      ['studioClosure', ['closures', 'claims', 'estateEvents'], /^Historical hash cannot discard studio-closure authority$/],
    ] as const) {
      for (const field of [...edits, 'nextCounter', 'recordedFromWeek', 'version', 'foreign']) {
        const forged = detached(control) as unknown as Record<string, unknown>
        const root = forged[key] as Record<string, unknown>
        if ((edits as readonly string[]).includes(field)) root[field] = [{}]
        else if (field === 'nextCounter') root[key === 'corporateCondition' ? 'nextEvent' : 'nextClosure'] = 2
        else if (field === 'recordedFromWeek') root[field] = control.market.tick + 1
        else root[field] = 2
        const before = canon(forged)
        expect(() => historicalHashState(forged), `${key}.${field}`).toThrow(message)
        expect(canon(forged)).toBe(before)
      }
    }
    const recorded = withRoot(control, { version: 1, recordedFromWeek: 3, fund: { provenance: 'opened', budget: TUNING.HIRING_FOUNDING_BUDGET, spentAtRecording: 0, spentBonus: 0, openingEmploymentCount: 0, closedWeek: null, closingEmploymentCount: null, allocations: [] } })
    expect(() => historicalHashState(recorded)).toThrow(/^Historical hash cannot discard recruitment-fund authority$/)
  }, HEAVY)
})

// ═══════════════════════════════════════════════════════════════════════════════
// Unsupported and malformed input (1364-A §4, §5 item 6)
// ═══════════════════════════════════════════════════════════════════════════════
describe('1364 refusals: unsupported historical input and malformed funding fail before gameplay mutation', () => {
  it('founding-unsupported-missing-cash-payment: a predecessor (V46) input carrying a late signature with no cash row keeps its exact old refusal, before migration and without a synthesized allocation', () => {
    const { draft, signed } = lateFounded()
    const offer = contractOfferOptions(draft, signed[0]!.talentId)[0]!
    const signedOnce = applyActions(draft, [{ kind: 'signContract', talentId: signed[0]!.talentId, termWeeks: offer.termWeeks }])
    // 1370-ar r2: the predecessor envelope (tests/helpers/p15-roots.ts) carries no P15B root or loan kind, so the
    // V46 shape below is genuine once the fund root leaves it.
    const live = detached(predecessorSave(signedOnce)) as unknown as Record<string, unknown>
    const state = { ...(live.state as Record<string, unknown>) }
    delete state.foundingFunding
    const predecessorText = stableStringify({ ...live, saveVersion: FOUNDING_STEP - 1, state })
    expect(() => saveFn(`validateSaveV${FOUNDING_STEP - 1}`)(JSON.parse(predecessorText))).toThrow(/employment start lacks its actual player signing payment/)
    const outcome = importSaveJson(predecessorText)
    expect(outcome.ok).toBe(false)
    if (!outcome.ok) expect(outcome.error).toMatch(/employment start lacks its actual player signing payment/)
  }, HEAVY)

  it('founding-technology-invalid-draft: an open late draft carrying a rival method lock keeps the predecessor\'s technology refusal at its reader and at import, input untouched and every lock kept; an accepted import never deletes rival locks (1364-A §5 case 6)', () => {
    const draft = imported('late-draft-week26-unsigned')
    // The 1356-X state: rivals lock a production method while the player's draft stays open. The engine
    // no longer ticks an open draft (invariant B), so the locks are made by the live engine with the draft
    // closed in memory (no founding, a null fund), and the draft is re-opened at the lock week.
    let locked = withRoot({ ...draft, founding: null } as GameState, { version: 1, recordedFromWeek: draft.market.tick, fund: null })
    while (locked.technology.productions.length === 0 && locked.market.tick < draft.market.tick + 60) locked = tick(locked)
    const locks = locked.technology.productions.length
    expect(locks, 'premise: a rival locks a production method within 60 weeks').toBeGreaterThan(0)
    // Explicit historical control, not a lossless downgrade of evaluated P15B facts.
    // Project while still valid, admit V47 then convert/admit V46 BEFORE reopening the draft.
    const baseline = saveFn(`convertV${FOUNDING_STEP}ToV${FOUNDING_STEP - 1}`)(predecessorSave(locked))
    expect(() => saveFn(`validateSaveV${FOUNDING_STEP - 1}`)(baseline)).not.toThrow()
    const state = { ...detached(baseline.state), founding: detached(draft.founding) }
    const text = stableStringify({ ...baseline, state })
    const parsed = JSON.parse(text) as { state: { technology: { productions: unknown[] } } }
    const TECHNOLOGY = /Technology save: unfounded or non-player corpus cannot hold technology authority$/
    expect(() => saveFn(`validateSaveV${FOUNDING_STEP - 1}`)(parsed)).toThrow(TECHNOLOGY)
    const outcome = importSaveJson(text)
    expect(outcome.ok).toBe(false)
    if (!outcome.ok) expect(outcome.error).toMatch(TECHNOLOGY)
    expect(stableStringify(parsed), 'the parsed input is not mutated').toBe(text)
    expect(parsed.state.technology.productions.length, 'no rival lock is deleted').toBe(locks)
    // An accepted import keeps every rival lock: the late-founded campaign advanced to its first locks.
    let founded = lateFounded().founded
    while (founded.technology.productions.length === 0 && founded.market.tick < 26 + 60) founded = tick(founded)
    expect(founded.technology.productions.length, 'premise: a rival locks a method after the late founding').toBeGreaterThan(0)
    const loaded = importSaveJson(bytesOf(founded))
    if (!loaded.ok) throw new Error(loaded.error)
    expect(canon(loaded.state.technology.productions)).toBe(canon(founded.technology.productions))
  }, HEAVY)

  it('founding-malformed-funding-refused-before-replacement: forged allocations and spending bounds refuse at import; the input is untouched and the draft is not cleared', () => {
    const { founded } = lateFounded()
    const forgeries: [string, (fund: Fund) => void, RegExp][] = [
      ['a forged extra allocation', (f) => { f.allocations.push({ ...f.allocations[0]! }) }, fundingRefusal(`duplicate allocation for contract ${ID}`)],
      ['spending above budget', (f) => { f.spentBonus = f.budget + 1 }, fundingRefusal(String.raw`fund\.spentBonus \d+ exceeds the budget \d+`)],
      ['a negative amount', (f) => { f.allocations[0]!.amount = -1 }, fundingRefusal(`allocation ${ID} amount must be a finite non-negative amount`)],
      ['a future closure', (f) => { f.closedWeek = 27 }, fundingRefusal(String.raw`fund\.closedWeek 27 is not a week in \[26, 26\]`)],
    ]
    for (const [title, forge, refusal] of forgeries) {
      // The forged bytes are written around the validator: a valid save, detached, then edited.
      const save = detached(makeSave(founded)) as unknown as { state: { foundingFunding: FundingRoot } }
      forge(save.state.foundingFunding.fund!)
      const text = stableStringify(save)
      const parsed = JSON.parse(text) as unknown
      const before = canon(parsed)
      const outcome = importSaveJson(text)
      expect(outcome.ok, title).toBe(false)
      if (!outcome.ok) expect(outcome.error, title).toMatch(refusal)
      expect(canon(parsed), `${title}: the parsed input is not mutated`).toBe(before)
    }
  }, HEAVY)
})

// ═══════════════════════════════════════════════════════════════════════════════
// The second grant (parent ruling 2026-10-11 R-B; 1370-AR r3 review finding 1). A campaign whose
// player studio has founded, at any week, never opens another founding draft or receives another
// founding grant. The action and the save validator both enforce it on the campaign's founding fact,
// not on the fund: a week-0 founding records no fund (R-A), so a fund-based guard missed it.
// R-D (2026-10-11, on r5's R1): conservation wins. A save founded before studio history recorded keeps
// no landmark, no fund and no fresh industry. No supported surface opens a founding on it or on a
// never-founded campaign that signed outside a draft, so both refuse on the fact they share: an economy
// engaged outside any open draft (R-E item 4: the over-refusal rests on that unreachability alone).
// R-E (2026-10-11): the reader holds the lawful-history invariants I1 to I4 on every campaign with a
// recorded fund or an open draft.
// ═══════════════════════════════════════════════════════════════════════════════
const STEM = 'a founded campaign never opens a second founding draft or receives a second founding grant'
/** The genuine V15 owner saves (P05A): founded at week 0, before P08A studio history recorded a landmark. */
const OWNER_SAVES = ['p05a1-owner-profile-rev2', 'p05a3-owner-profile-rev10'] as const
const SECOND_GRANT = new RegExp(STEM)
/** The action's exact R-B refusal (employment.ts beginFoundingDraft, behind both public openers). */
const ACTION_SECOND_GRANT = new RegExp(`^beginFounding: the player studio has already founded; ${STEM}$`)
/** R-D's own refusal for a campaign that records no founding but engaged outside a draft (r6 M5). */
const ACTION_ENGAGED = new RegExp(String.raw`^beginFounding: the campaign records no founding, but its economy engaged outside a founding draft \(a founding before studio history recorded, or a signing outside any draft\); a campaign whose economy engaged outside a founding draft never opens one \(parent ruling R-D\)$`)
/** R-E I1: a fund closes in its recording week, and an open fund stays in it. */
const CLOSED_LATE = (recorded: number, closed: number): RegExp => fundingRefusal(String.raw`a fund recorded from week ${recorded} closed at week ${closed} \(foundStudio closes a fund in its recording week, and a tick refuses an open draft\): ${STEM}`)
const OPEN_LATE = (recorded: number, week: number): RegExp => fundingRefusal(String.raw`an open fund recorded from week ${recorded} at week ${week} \(a tick refuses an open draft, so an open fund stays in its recording week\): ${STEM}`)
let weekZeroMemo: { founded: GameState; week30: GameState } | null = null
function weekZeroFounded() {
  if (weekZeroMemo === null) {
    const outcome = foundManagedStudioAction(signMinimum(newGame('p1364-second-grant-01')).state)
    if (!outcome.ok) throw new Error(`premise: the week-0 founding refused: ${outcome.error}`)
    let week30 = outcome.next
    while (week30.market.tick < 30) week30 = tick(week30)
    weekZeroMemo = { founded: outcome.next, week30 }
  }
  return weekZeroMemo
}
/** The r3 second grant injected by hand into a founded campaign: a draft re-opened with an `opened`
 * fund, one funded (cash-free) signature, then a second founding. These are the facts r3's public
 * beginFounding let the actions build (the refuter's probe second-grant-patched.ts). */
function injectSecondGrant(founded: GameState): { open: GameState; closed: GameState; talentId: string } {
  const h = founded.hollywood!
  const busy = new Set(h.activeEmploymentOrdinals.map((i) => h.employment[i]!.terms.talentId))
  const talentId = founded.talent.find((t) => !busy.has(t.id) && !founded.contracts.some((c) => c.talentId === t.id) && contractOfferOptions(founded, t.id).length > 0)?.id
  if (talentId === undefined) throw new Error('premise: a free signable talent for the injected draft')
  const reopened = { ...founded, founding: { applicantIds: [talentId], budget: TUNING.HIRING_FOUNDING_BUDGET, spentBonus: 0 } } as GameState
  const funded = withRoot(reopened, recordFoundingFund(reopened, 'opened') as FundingRoot)
  const open = applyActions(funded, [{ kind: 'signContract', talentId, termWeeks: contractOfferOptions(funded, talentId)[0]!.termWeeks }])
  return { open, closed: applyActions(open, [{ kind: 'foundStudio' }]), talentId }
}
const liveText = (state: GameState): string => stableStringify({ saveVersion: saveModule.LIVE_SAVE_VERSION, seed: state.seed, state, broadcastCache: state.broadcastItems })
const landmarkWeeks = (state: GameState): number[] => state.studioHistory.rows.filter((row) => row.kind === 'studioFounded').map((row) => row.week)
/** A forged save refuses by `refusal` at the live reader and at import, and the parsed input is not mutated. */
function expectRefused(title: string, forged: GameState, refusal: RegExp): void {
  const text = liveText(forged)
  const parsed = JSON.parse(text) as unknown
  expect(() => validateLiveSave(parsed), title).toThrow(refusal)
  const reloaded = importSaveJson(text)
  expect(reloaded.ok, title).toBe(false)
  if (!reloaded.ok) expect(reloaded.error, title).toMatch(refusal)
  expect(canon(parsed), `${title}: the parsed input is not mutated`).toBe(canon(JSON.parse(text)))
}
const ticksTo = (start: GameState, week: number): GameState => { let state = start; while (state.market.tick < week) state = tick(state); return state }
const isCharge = (row: LedgerEntry): boolean => row.kind === 'payroll' || row.kind === 'overhead'
const keepLandmarks = (state: GameState, keep: (week: number) => boolean): GameState =>
  ({ ...state, studioHistory: { ...state.studioHistory, rows: state.studioHistory.rows.filter((row) => row.kind !== 'studioFounded' || keep(row.week)) } }) as GameState
/** Talent employed nowhere (no contract, no active industry interval) with an offer, in talent order. */
function freeTalent(state: GameState): string[] {
  const h = state.hollywood
  const busy = new Set([...(h === null ? [] : h.activeEmploymentOrdinals.map((i) => h.employment[i]!.terms.talentId)), ...state.contracts.map((c) => c.talentId)])
  return state.talent.filter((t) => !busy.has(t.id) && contractOfferOptions(state, t.id).length > 0).map((t) => t.id)
}

describe('1364 R-B: a founded campaign never opens a second founding draft or receives a second grant (parent ruling 2026-10-11)', () => {
  it('founding-second-grant-week-zero: a week-0-founded campaign refuses beginFounding by name at week 0 and at week 30 (the refuter\'s probe); the state is unchanged and no fund is recorded', () => {
    const { founded, week30 } = weekZeroFounded()
    expect(landmarkWeeks(week30), 'premise: the campaign founded once, at week 0').toEqual([0])
    expect(fundingRoot(week30).fund, 'premise: a week-0 founding records no fund (R-A)').toBeNull()
    // r5: the fresh industry is itself a founding fact (its week-0 draft closes only by founding), so the
    // refusal survives an in-memory strip of the landmark too.
    const stripped = { ...week30, studioHistory: { ...week30.studioHistory, rows: week30.studioHistory.rows.filter((row) => row.kind !== 'studioFounded') } } as GameState
    expect(stripped.hollywood!.origin, 'premise: the week-0 draft minted a fresh industry').toBe('fresh')
    for (const state of [founded, week30, stripped]) {
      const before = canon(state)
      expect(() => beginFounding(state)).toThrow(ACTION_SECOND_GRANT)
      expect(canon(state)).toBe(before)
    }
    // The historical control opens through the same draft opener: a headless founded campaign refuses too.
    const headless = applyActions(signMinimum(beginFoundingHistoricalControl(generateWorld('p1364-second-grant-02'))).state, [{ kind: 'foundStudio' }])
    expect(headless.hollywood, 'premise: founded before any industry exists').toBeNull()
    expect(() => beginFoundingHistoricalControl(headless)).toThrow(ACTION_SECOND_GRANT)
  }, HEAVY)

  it('founding-second-grant-pre-history: R-D (1): each genuine V15 owner save founded at week 0 before studio history recorded keeps no landmark, no fund and no fresh industry, yet refuses beginFounding by R-D\'s own message; the reader refuses the second grant r5 let the actions build on it, open and closed, by the payroll its founded studio paid from week 0, and refuses the r6 verification\'s two-edit forms (probe-f, probe-e) by R-E I2 and refuter2-opening\'s relabelled form by R-E I4', () => {
    for (const name of OWNER_SAVES) {
      const text = readFileSync(new URL(`./fixtures/${name}.save.json`, import.meta.url), 'utf8')
      expect((JSON.parse(text) as { saveVersion: number }).saveVersion, `${name}: premise: a genuine V15 save`).toBe(15)
      const outcome = importSaveJson(text)
      if (!outcome.ok) throw new Error(`premise: ${name} imports: ${outcome.error}`)
      const state = outcome.state
      const week = state.market.tick
      // Premise (r5 R1): every founding fact r5 read is absent, though the week-0 draft paid all seven contracts.
      expect([landmarkWeeks(state), fundingRoot(state).fund, state.hollywood!.origin, state.founding, state.economyEngagedEver], name).toEqual([[], null, 'migration', null, true])
      expect([state.contracts.map((c) => c.startWeek), signingRows(state)], name).toEqual([[0, 0, 0, 0, 0, 0, 0], []])
      const firstCharge = state.ledger.find(isCharge)
      expect([firstCharge?.kind, firstCharge?.week], name).toEqual(['payroll', 0])
      const before = canon(state)
      expect(() => beginFounding(state), name).toThrow(ACTION_ENGAGED)
      expect(canon(state), name).toBe(before)
      // The second grant r5's opener built on this save (r5 R1): the same opener with the engaged fact hidden,
      // one free applicant signed from the new fund, then a second founding.
      const open = beginFounding({ ...state, economyEngagedEver: false })
      expect([fundOf(open).provenance, fundingRoot(open).recordedFromWeek, open.economyEngagedEver], name).toEqual(['opened', week, true])
      const busy = new Set(open.hollywood!.activeEmploymentOrdinals.map((i) => open.hollywood!.employment[i]!.terms.talentId))
      const talentId = open.founding!.applicantIds.find((id) => !busy.has(id) && contractOfferOptions(open, id).length > 0)
      if (talentId === undefined) throw new Error(`premise: ${name}: a free applicant in the second draft`)
      const closed = applyActions(open, [{ kind: 'signContract', talentId, termWeeks: contractOfferOptions(open, talentId)[0]!.termWeeks }, { kind: 'foundStudio' }])
      expect([fundOf(closed).allocations.length, fundOf(closed).closedWeek, landmarkWeeks(closed), closed.studio.cash - state.studio.cash], name).toEqual([1, week, [week], 0])
      const charged = fundingRefusal(String.raw`a fund recorded from week ${week} on a campaign whose ledger charged payroll at week 0 before the draft opened \(a tick charges only a studio operating outside a draft\): ${STEM}`)
      expectRefused(`${name} open`, open, charged)
      expectRefused(`${name} closed`, closed, charged)
      // The r6 verification's two-edit forms on the closed grant (probe-f: the opening count lowered to 0; probe-e:
      // the seven pre-fund bonuses and their contracts zeroed), each with the pre-draft charges re-dated to the draft
      // week (cash untouched) or erased (cash given back). r6 accepted all four; R-E I2 refuses each: the seven
      // migration-observed rows still precede the opened fund's first signature.
      const redate = (s: GameState): GameState => ({ ...s, ledger: s.ledger.map((row) => (isCharge(row) && row.week < week ? { ...row, week } : row)) })
      const erase = (s: GameState): GameState => {
        const gone = s.ledger.filter((row) => isCharge(row) && row.week < week)
        return { ...s, ledger: s.ledger.filter((row) => !gone.includes(row)), studio: { ...s.studio, cash: s.studio.cash - gone.reduce((sum, row) => sum + row.amount, 0) } }
      }
      const openingZero = (s: GameState): GameState => withFund(s, (f) => { f.openingEmploymentCount = 0 })
      const zeroPreFund = (s: GameState): GameState => {
        const h = detached(s.hollywood!)
        const keys = new Set<string>()
        for (const e of h.employment.slice(0, fundOf(s).openingEmploymentCount)) if (e.studioId === h.playerStudioId) { keys.add(`${e.terms.talentId}:${e.terms.startWeek}`); e.terms.signingBonus = 0 }
        return { ...s, hollywood: h, contracts: s.contracts.map((c) => (keys.has(`${c.talentId}:${c.startWeek}`) ? { ...c, signingBonus: 0 } : c)) } as GameState
      }
      const precedes = fundingRefusal(String.raw`an opened fund recorded from week ${week} on a campaign whose player employment row \d+ \(existing-player-contract\) precedes the fund's first founding signature \(beginFounding opens a fund only on a campaign that never engaged\): ${STEM}`)
      const forms: [string, GameState][] = [
        ['probe-f: opening 0 + charges re-dated', redate(openingZero(closed))],
        ['probe-f: opening 0 + charges erased', erase(openingZero(closed))],
        ['probe-e: charges re-dated + pre-fund bonuses zeroed', zeroPreFund(redate(closed))],
        ['probe-e: charges erased + pre-fund bonuses zeroed', zeroPreFund(erase(closed))],
      ]
      for (const [title, forged] of forms) expectRefused(`${name} ${title}`, forged, precedes)
      // refuter2-opening's three-edit form: the fund relabelled observed with the seven pre-fund bonuses as its
      // spending at recording, and the pre-draft charges re-dated to the draft week. I2 binds only an opened fund;
      // R-E I4 refuses the charges dated at the current week.
      const h = closed.hollywood!
      const employed = h.employment.slice(0, fundOf(closed).openingEmploymentCount).filter((e) => e.studioId === h.playerStudioId).reduce((sum, e) => sum + e.terms.signingBonus, 0)
      expect(employed, `${name}: premise: the seven pre-fund signatures carry bonuses`).toBeGreaterThan(0)
      const relabelled = withFund(redate(closed), (f) => { f.provenance = 'observed-open-draft'; f.spentAtRecording = employed; f.spentBonus += employed })
      expectRefused(`${name} refuter2-opening: relabelled observed with the pre-fund spending + charges re-dated`, relabelled,
        fundingRefusal(String.raw`the ledger charged payroll at week ${week}, not before the current week ${week} \(a tick charges the week it advances from\)`))
    }
  }, HEAVY)

  it('founding-operated-campaign-refused: R-D (3), a declared over-refusal: a never-founded campaign that signed outside any draft shares the one fact the pre-history saves keep (an economy engaged outside a draft) and no supported surface opens a founding on it, so both openers refuse by R-D\'s own message (it never founded, and the message does not say it did) and the reader refuses the first grant r5 let the actions build; the same campaign before it signed still opens its first late founding', () => {
    const world = headlessAtWeek3()
    const hire = hiringMarketView(world).find((c) => contractOfferOptions(world, c.talentId).length > 0)
    if (hire === undefined) throw new Error('premise: the headless hiring market offers somebody signable')
    const signed = applyActions(world, [{ kind: 'signContract', talentId: hire.talentId, termWeeks: contractOfferOptions(world, hire.talentId)[0]!.termWeeks }])
    // Premise: an operating-phase signing engaged the economy and paid cash; no other founding fact exists.
    expect([signed.economyEngagedEver, signed.founding, signed.hollywood, landmarkWeeks(signed), fundingRoot(signed).fund]).toEqual([true, null, null, [], null])
    const bonus = signed.contracts[0]!.signingBonus
    expect(signingRows(signed).map((row) => [row.talentId, row.amount])).toEqual([[hire.talentId, -bonus]])
    const before = canon(signed)
    expect(() => beginFounding(signed)).toThrow(ACTION_ENGAGED)
    expect(() => beginFoundingHistoricalControl(signed)).toThrow(ACTION_ENGAGED)
    expect(canon(signed)).toBe(before)
    // The first grant r5's opener built over it (db3fc572 and r3 allowed it too): the same opener with the engaged fact hidden.
    const opened = beginFounding({ ...signed, economyEngagedEver: false })
    expect([fundOf(opened).provenance, fundingRoot(opened).recordedFromWeek, opened.hollywood!.origin]).toEqual(['opened', 3, 'migration'])
    expect(playerRows(opened).map((e) => [e.reason, e.terms.talentId])).toEqual([['existing-player-contract', hire.talentId]])
    const outcome = foundManagedStudioAction(signMinimum(opened).state)
    if (!outcome.ok) throw new Error(`premise: the r5 first founding: ${outcome.error}`)
    const refusal = fundingRefusal(`a fund recorded from week 3 on a campaign whose player employment recorded before the fund carries signing bonuses of ${bonus}, more than the 0 its draft had spent by then: ${STEM}`)
    expectRefused('open', opened, refusal)
    expectRefused('closed', outcome.next, refusal)
    // Control: never engaged, the same campaign at the same week opens its first late founding.
    expect(fundOf(beginFounding(world)).provenance).toBe('opened')
  }, HEAVY)

  it('founding-second-grant-unmanaged-closed-fund: a closed fund is a founding fact; with economyEngagedEver false and the landmark gone, the action refuses a new draft and the reader refuses the closed fund without its landmark, input untouched', () => {
    const { founded } = lateFounded()
    const unmanaged = { ...founded, economyEngagedEver: false, studioHistory: { ...founded.studioHistory, rows: founded.studioHistory.rows.filter((row) => row.kind !== 'studioFounded') } } as GameState
    expect([fundOf(unmanaged).closedWeek, landmarkWeeks(unmanaged), unmanaged.economyEngagedEver, unmanaged.founding]).toEqual([26, [], false, null])
    const before = canon(unmanaged)
    expect(() => beginFounding(unmanaged)).toThrow(ACTION_SECOND_GRANT)
    expect(canon(unmanaged)).toBe(before)
    const refusal = fundingRefusal(`a fund closed at week 26 without its own studioFounded landmark: ${STEM}`)
    const text = liveText(unmanaged)
    const parsed = JSON.parse(text) as unknown
    expect(() => validateLiveSave(parsed)).toThrow(refusal)
    const outcome = importSaveJson(text)
    expect(outcome.ok).toBe(false)
    if (!outcome.ok) expect(outcome.error).toMatch(refusal)
    expect(canon(parsed)).toBe(canon(JSON.parse(text)))
  }, HEAVY)

  it('founding-second-grant-late: the late-founded campaign refuses beginFounding after closure by name; its closed fund is untouched', () => {
    const { founded } = lateFounded()
    const before = canon(founded)
    expect(() => beginFounding(founded)).toThrow(SECOND_GRANT)
    expect(canon(founded)).toBe(before)
  }, HEAVY)

  it('founding-second-grant-forged-save: a save carrying a second draft or grant on a founded campaign refuses by its exact name at the live reader and at import, input untouched, whatever the forger does to the landmarks or the provenance; Save46 refuses the same cash-free signatures', () => {
    const { founded, week30 } = weekZeroFounded()
    const { open, closed, talentId } = injectSecondGrant(week30)
    // Premise: these are the r3 second-grant facts: an opened fund at week 30 holding one cash-free
    // signature, over the fresh industry the week-0 founding minted, which has paid payroll since week 0.
    const fund = fundOf(closed)
    expect([fund.provenance, fund.closedWeek, fund.allocations.length]).toEqual(['opened', 30, 1])
    expect(signingRows(closed).some((row) => row.talentId === talentId)).toBe(false)
    expect(landmarkWeeks(closed)).toEqual([0, 30])
    const firstCharge = closed.ledger.find((row) => row.kind === 'payroll' || row.kind === 'overhead')
    expect([closed.hollywood!.origin, firstCharge?.kind, firstCharge?.week]).toEqual(['fresh', 'payroll', 0])
    const observed = (state: GameState): GameState => withFund(state, (f) => { f.provenance = 'observed-open-draft' })
    const redated = { ...closed, studioHistory: { ...closed.studioHistory, rows: keepLandmarks(closed, (week) => week !== 30).studioHistory.rows.map((row) => (row.kind === 'studioFounded' ? { ...row, week: 30 } : row)) } } as GameState
    expect(landmarkWeeks(redated), 'premise: B5b keeps one landmark, at the closure').toEqual([30])
    const reopenedAtWeekZero = { ...founded, founding: { applicantIds: [], budget: TUNING.HIRING_FOUNDING_BUDGET, spentBonus: 0 } } as GameState
    const earlier = fundingRefusal(`a fund recorded from week 30 on a campaign that founded at week 0: ${STEM}`)
    const withoutOwnLandmark = fundingRefusal(`a fund closed at week 30 without its own studioFounded landmark: ${STEM}`)
    const openedOverFresh = fundingRefusal(String.raw`an opened fund recorded from week 30 over a fresh-origin industry \(beginFounding opens a fund only over a migration-origin industry\): ${STEM}`)
    const operatedBefore = fundingRefusal(String.raw`a fund recorded from week 30 on a campaign whose ledger charged payroll at week 0 before the draft opened \(a tick charges only a studio operating outside a draft\): ${STEM}`)
    const forgeries: [string, GameState, RegExp][] = [
      ['the closed second grant (two founding landmarks)', closed, fundingRefusal(String.raw`the campaign founded more than once \(studioFounded at weeks 0, 30\): ${STEM}`)],
      ['the open second draft with its funded signature', open, earlier],
      ['the closed second grant without its own landmark', keepLandmarks(closed, (week) => week !== 30), earlier],
      ['a week-0 draft re-opened on the founded campaign (no fund at week 0, R-A)', reopenedAtWeekZero, fundingRefusal(`an open founding draft on a campaign that founded at week 0: ${STEM}`)],
      // r5: the r4 verification's forgeries, which also edit the landmarks or the provenance.
      ['B5 = A: the week-0 landmark deleted; the opened fund keeps its own week-30 landmark', keepLandmarks(closed, (week) => week !== 0), openedOverFresh],
      ['B5b: the week-0 landmark re-dated to the closure week, the second one dropped', redated, openedOverFresh],
      ['B6 = C: every landmark deleted, provenance opened', keepLandmarks(closed, () => false), withoutOwnLandmark],
      ['D: every landmark deleted, relabelled observed-open-draft (the r4.d form)', observed(keepLandmarks(closed, () => false)), withoutOwnLandmark],
      ['B5c: the week-0 landmark deleted, relabelled observed-open-draft', observed(keepLandmarks(closed, (week) => week !== 0)), operatedBefore],
      ['B10: the open second draft with every landmark deleted', keepLandmarks(open, () => false), openedOverFresh],
    ]
    for (const [title, forged, refusal] of forgeries) {
      const text = liveText(forged)
      const parsed = JSON.parse(text) as unknown
      expect(() => validateLiveSave(parsed), title).toThrow(refusal)
      const outcome = importSaveJson(text)
      expect(outcome.ok, title).toBe(false)
      if (!outcome.ok) expect(outcome.error, title).toMatch(refusal)
      expect(canon(parsed), `${title}: the parsed input is not mutated`).toBe(canon(JSON.parse(text)))
    }
    // The fund is the only thing that exempted the signature from cash: Save46 refuses it as the old law does.
    // P16 rebase round 7: the week-30 world has no predecessor envelope (its market history holds nondefault Save49
    // table-3 assessments, which `rightsStripped` refuses to relabel), so the same second grant is injected two weeks
    // after the week-0 founding. No assessment exists before week 8 (fresh rivals start with no productions, and a
    // production runs TUNING.PRODUCTION_TICKS = 8), and founding-downgrade-null-fund-lossless projects the same
    // construction (another seed) after two ticks.
    expect(() => predecessorSave(week30)).toThrow(NONDEFAULT_MARKET_PROJECTION)
    const early = ticksTo(founded, 2)
    {
      const { closed } = injectSecondGrant(early) // the same injection, two weeks after the founding
      // Admit the valid pre-forgery own-era baseline first. Never send the forged grant through
      // predecessorSave: its strict V47 guard would mask the V46 cash-payment assertion.
      const baseline = saveFn(`convertV${FOUNDING_STEP}ToV${FOUNDING_STEP - 1}`)(predecessorSave(early))
      expect(() => saveFn(`validateSaveV${FOUNDING_STEP - 1}`)(baseline)).not.toThrow()
      const predecessorState = detached(baseline.state)
      // Transfer only the injected cash-free signature and second landmark; retain V46 account schema.
      predecessorState.contracts = detached(closed.contracts)
      predecessorState.freeAgents = detached(closed.freeAgents)
      predecessorState.studioHistory = detached(closed.studioHistory)
      predecessorState.hollywood = { ...predecessorState.hollywood!,
        employment: detached(closed.hollywood!.employment),
        activeEmploymentOrdinals: detached(closed.hollywood!.activeEmploymentOrdinals),
        receipts: detached(closed.hollywood!.receipts), nextReceipt: closed.hollywood!.nextReceipt }
      expect(predecessorState.hollywood.nextReceipt).toBe(predecessorState.hollywood.receipts.length)
      expect(new Set(predecessorState.hollywood.receipts.map(r => r.eventId)).size).toBe(predecessorState.hollywood.receipts.length)
      expect(predecessorState.studioHistory.nextEventId).toBe(closed.studioHistory.nextEventId)
      expect(canon(predecessorState.ledger)).toBe(canon(baseline.state.ledger))
      expect(predecessorState.studio.cash).toBe(baseline.state.studio.cash)
      const hostile = { ...baseline, state: predecessorState }
      const hostileBytes = canon(hostile)
      expect(() => saveFn(`validateSaveV${FOUNDING_STEP - 1}`)(hostile))
        .toThrow(/employment start lacks its actual player signing payment/)
      expect(canon(hostile)).toBe(hostileBytes)
    }
  }, HEAVY)

  it('founding-fund-lifetime: R-E I1, a fund closes in its recording week and an open fund stays in it; the r6 verification\'s forms refuse by name: the week-40 refill of a closed fund (probe-c, opened and observed), an ordinary week-30 cash signing relabelled as funded (D1) and a legacy founding re-opened a week later (D2)', () => {
    // probe-c: a late founding at week 26 operates to week 40; in memory the fund and a draft re-open, three free
    // applicants sign from the fund's remainder for no cash, the studio founds again and the week-26 landmark goes.
    const refill = (founded: GameState, title: string): void => {
      const operated = ticksTo(founded, 40)
      expect(() => makeSave(operated), `${title}: premise: the operated campaign validates`).not.toThrow()
      const root = detached(fundingRoot(operated))
      root.fund!.closedWeek = null
      root.fund!.closingEmploymentCount = null
      let state = { ...withRoot(operated, root), founding: { applicantIds: freeTalent(operated).slice(0, 3), budget: root.fund!.budget, spentBonus: root.fund!.spentBonus } } as GameState
      const cash = state.studio.cash
      for (const id of state.founding!.applicantIds) state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: contractOfferOptions(state, id)[0]!.termWeeks }])
      const refounded = applyActions(state, [{ kind: 'foundStudio' }])
      expect([fundOf(refounded).closedWeek, refounded.studio.cash - cash, landmarkWeeks(refounded)], title).toEqual([40, 0, [26, 40]])
      expectRefused(title, keepLandmarks(refounded, (week) => week !== 26), CLOSED_LATE(26, 40))
    }
    const opened = foundManagedStudioAction(signMinimum(beginFounding(ticksTo(generateWorld('p1364-r7-refill-01'), 26))).state)
    if (!opened.ok) throw new Error(`premise: the opened late founding: ${opened.error}`)
    expect(fundOf(opened.next).provenance).toBe('opened')
    refill(opened.next, 'probe-c refill of the opened fund')
    refill(lateFounded().founded, 'probe-c refill of the observed fund')
    // D1, a pure JSON edit: an ordinary cash signing at week 30 relabelled as a founding signature of the week-26
    // fund (cash row removed and given back, allocation added, closure and landmark moved to week 30).
    let operated = ticksTo(lateFounded().founded, 30)
    const hire = hiringMarketView(operated).find((c) => contractOfferOptions(operated, c.talentId).length > 0)
    if (hire === undefined) throw new Error('premise: the week-30 hiring market offers somebody signable')
    operated = ticksTo(applyActions(operated, [{ kind: 'signContract', talentId: hire.talentId, termWeeks: contractOfferOptions(operated, hire.talentId)[0]!.termWeeks }]), 34)
    expect(() => makeSave(operated), 'D1 premise: the lawful campaign at week 34 validates').not.toThrow()
    const d1 = detached(operated)
    const h = d1.hollywood!
    const ordinal = h.employment.findIndex((e) => e.studioId === h.playerStudioId && e.terms.talentId === hire.talentId && e.terms.startWeek === 30)
    const row = h.employment[ordinal]!
    d1.ledger.splice(d1.ledger.findIndex((l) => l.kind === 'signingBonus' && l.talentId === hire.talentId && l.week === 30), 1)
    d1.studio.cash += row.terms.signingBonus
    const fund = fundOf(d1)
    fund.allocations.push({ contractId: row.contractId, week: 30, amount: row.terms.signingBonus })
    fund.spentBonus += row.terms.signingBonus
    fund.closedWeek = 30
    fund.closingEmploymentCount = ordinal + 1
    for (const landmark of d1.studioHistory.rows) if (landmark.kind === 'studioFounded') (landmark as { week: number }).week = 30
    expectRefused('D1 week-30 cash signing relabelled as funded', d1, CLOSED_LATE(26, 30))
    // D2: a legacy-operations founding at week 26 (foundStudio alone) operated a week, then the fund and the draft
    // re-opened at week 27 with every landmark deleted.
    const draft = imported('late-draft-week26-unsigned')
    const legacy = ticksTo(applyActions(signMinimum(draft).state, [{ kind: 'foundStudio' }]), 27)
    expect(() => makeSave(legacy), 'D2 premise: the legacy campaign at week 27 validates').not.toThrow()
    const root = detached(fundingRoot(legacy))
    root.fund!.closedWeek = null
    root.fund!.closingEmploymentCount = null
    const d2 = keepLandmarks({ ...withRoot(legacy, root), founding: { applicantIds: draft.founding!.applicantIds, budget: root.fund!.budget, spentBonus: root.fund!.spentBonus } } as GameState, () => false)
    expectRefused('D2 legacy founding re-opened at week 27', d2, OPEN_LATE(26, 27))
  }, HEAVY)

  it('founding-interval-and-charges: R-E I3, the fund\'s interval holds only its draft\'s signatures (so the opening count is pinned), and R-E I4, the ledger charges payroll and overhead once a week and never at or after the current week; renewal waits for the founding as release does, so an open draft adds no row its fund does not allocate', () => {
    const outside = (ordinal: number, end: number): RegExp => fundingRefusal(String.raw`employment row ${ordinal} \(rival \S+\) lies inside the fund's interval \[${ordinal}, ${end}\), which holds only its draft's founding signatures`)
    const { founded } = lateFounded()
    const observed = fundOf(founded)
    expectRefused('I3 observed fund: opening lowered by one', withFund(founded, (f) => { f.openingEmploymentCount = observed.openingEmploymentCount - 1 }), outside(observed.openingEmploymentCount - 1, observed.closingEmploymentCount!))
    expectRefused('I3 observed fund: opening 0 (the r4 widened interval alone)', withFund(founded, (f) => { f.openingEmploymentCount = 0 }), outside(0, observed.closingEmploymentCount!))
    // An opened fund: the never-engaged campaign's late founding at week 3 (no player row precedes it, so I2 holds).
    const late = foundManagedStudioAction(signMinimum(beginFounding(headlessAtWeek3())).state)
    if (!late.ok) throw new Error(`premise: the week-3 late founding: ${late.error}`)
    const opened = fundOf(late.next)
    expect(() => makeSave(late.next), 'premise: the opened late founding validates').not.toThrow()
    expectRefused('I3 opened fund: opening lowered by one', withFund(late.next, (f) => { f.openingEmploymentCount = opened.openingEmploymentCount - 1 }), outside(opened.openingEmploymentCount - 1, opened.closingEmploymentCount!))
    // I4 on the observed campaign two weeks after its founding.
    const ran = ticksTo(founded, 28)
    expect(() => makeSave(ran), 'premise: the campaign at week 28 validates').not.toThrow()
    const charges = ran.ledger.filter(isCharge)
    expect(charges.every((row) => row.week >= 26 && row.week < 28) && charges.length > 0, 'premise: charges only for weeks 26 and 27').toBe(true)
    const last = charges.at(-1)!
    expectRefused('I4: a charge dated at the current week', { ...ran, ledger: ran.ledger.map((row) => (row === last ? { ...row, week: 28 } : row)) } as GameState,
      fundingRefusal(String.raw`the ledger charged ${last.kind} at week 28, not before the current week 28 \(a tick charges the week it advances from\)`))
    const payroll = ran.ledger.find((row) => row.kind === 'payroll' && row.week === 27)
    if (payroll === undefined) throw new Error('premise: a week-27 payroll charge')
    expectRefused('I4: a payroll charge repeated in its week', { ...ran, ledger: [...ran.ledger, { ...payroll }], studio: { ...ran.studio, cash: ran.studio.cash + payroll.amount } } as GameState,
      fundingRefusal(String.raw`the ledger charged payroll twice at week 27 \(a tick charges it once a week\)`))
    // The writer side of I3: a contract inside its renewal window renews, except while a founding draft is open.
    let worker = generateWorld('p1364-r7-renewal-01')
    const pick = hiringMarketView(worker).find((c) => contractOfferOptions(worker, c.talentId).length > 0)
    if (pick === undefined) throw new Error('premise: the headless hiring market offers somebody signable')
    worker = ticksTo(applyActions(worker, [{ kind: 'signContract', talentId: pick.talentId, termWeeks: contractOfferOptions(worker, pick.talentId)[0]!.termWeeks }]), 41)
    const renew = [{ kind: 'renewContract', talentId: pick.talentId, termWeeks: contractOfferOptions(worker, pick.talentId)[0]!.termWeeks }] as const
    expect(() => applyActions(worker, [...renew]), 'control: inside its window the contract renews').not.toThrow()
    const drafting = { ...worker, founding: { applicantIds: [], budget: TUNING.HIRING_FOUNDING_BUDGET, spentBonus: 0 } } as GameState
    const before = canon(drafting)
    expect(() => applyActions(drafting, [...renew])).toThrow(/^applyActions: renewContract rejected — the founding draft is still open; renewal waits until the studio is founded \(1364 R-E\)$/)
    expect(canon(drafting)).toBe(before)
  }, HEAVY)

  it('founding-null-fund-week-zero-contracts: r6\'s witness under an open draft with no fund refuses by its exact message a week-0 founded campaign re-opened with nothing spent: its contracts carry bonuses the draft never paid; with legacy operations nothing else refuses it, so deleting the branch admits a second grant (RED-FIRST-EVIDENCE r7)', () => {
    const founded = applyActions(signMinimum(newGame('p1364-r7-week0-legacy-01')).state, [{ kind: 'foundStudio' }])
    expect([founded.market.tick, founded.operations.mode, landmarkWeeks(founded)], 'premise: a legacy-operations founding at week 0').toEqual([0, 'legacy', [0]])
    const bonuses = founded.contracts.reduce((sum, c) => sum + c.signingBonus, 0)
    const reopened = keepLandmarks({ ...founded, founding: { applicantIds: freeTalent(founded).slice(0, 40), budget: TUNING.HIRING_FOUNDING_BUDGET, spentBonus: 0 } } as GameState, () => false)
    expect([reopened.market.tick, fundingRoot(reopened).fund, landmarkWeeks(reopened)], 'premise: a week-0 draft, no fund, no landmark').toEqual([0, null, []])
    expectRefused('week-0 founded campaign re-opened', reopened, fundingRefusal(`an open founding draft on a campaign whose player contracts carry signing bonuses of ${bonuses}, more than the 0 its draft has spent: ${STEM}`))
  }, HEAVY)

  it('founding-null-fund-headless-charge: r6\'s witness under an open draft with no fund refuses by its exact message a headless founded campaign re-opened after it operated: its ledger charged payroll; deleting the branch turns this red (RED-FIRST-EVIDENCE r7)', () => {
    const headless = ticksTo(applyActions(signMinimum(beginFoundingHistoricalControl(generateWorld('p1364-r7-headless-01'))).state, [{ kind: 'foundStudio' }]), 3)
    const charge = headless.ledger.find(isCharge)
    if (charge === undefined) throw new Error('premise: the headless founded studio was charged')
    const reopened = keepLandmarks({ ...headless, founding: { applicantIds: [], budget: TUNING.HIRING_FOUNDING_BUDGET, spentBonus: 0 } } as GameState, () => false)
    expect([reopened.hollywood, fundingRoot(reopened).fund, landmarkWeeks(reopened), charge.week], 'premise: no industry, no fund, no landmark, charged from week 0').toEqual([null, null, [], 0])
    expectRefused('headless founded campaign re-opened', reopened, fundingRefusal(String.raw`an open founding draft on a campaign whose ledger charged ${charge.kind} at week 0 \(a tick charges only a studio operating outside a draft\): ${STEM}`))
  }, HEAVY)
})

// ═══════════════════════════════════════════════════════════════════════════════
// Mutant isolation (1364-A §5 item 7): one invariant at a time from a fully valid corrected save
// ═══════════════════════════════════════════════════════════════════════════════
describe('1364 mutants: each funding invariant refuses by name and the unmutated state validates', () => {
  // Every refusal is pinned to its exact message (1370-AR r3 review item 11). A premise that does not
  // hold fails the leaf; it never warns and returns (item 6).
  const cases: [string, (state: GameState) => GameState, RegExp][] = [
    ['duplicate allocation', (s) => withFund(s, (f) => { f.allocations.push({ ...f.allocations[1]! }); f.spentBonus += f.allocations[1]!.amount }), fundingRefusal(`duplicate allocation for contract ${ID}`)],
    ['missing allocation, balance kept', (s) => withFund(s, (f) => { f.allocations.splice(2, 1) }), fundingRefusal(`founding signature ${ID} has no recruitment allocation`)],
    ['missing allocation, balance adjusted (interval completeness)', (s) => withFund(s, (f) => { const [gone] = f.allocations.splice(2, 1); f.spentBonus -= gone!.amount }), fundingRefusal(`founding signature ${ID} has no recruitment allocation`)],
    ['wrong contract (a rival row)', (s) => withFund(s, (f) => { f.allocations[0]!.contractId = s.hollywood!.employment.find((e) => e.studioId !== s.hollywood!.playerStudioId)!.contractId }), fundingRefusal(String.raw`allocation ${ID} names no player founding signature in the fund's interval \[\d+, \d+\)`)],
    ['wrong contract (unknown)', (s) => withFund(s, (f) => { f.allocations[0]!.contractId = 'studio-nobody:contract:x:26:player-0' }), fundingRefusal(String.raw`allocation studio-nobody:contract:x:26:player-0 names no player founding signature in the fund's interval \[\d+, \d+\)`)],
    ['wrong amount', (s) => withFund(s, (f) => { f.allocations[0]!.amount += 1; f.spentBonus += 1 }), fundingRefusal(String.raw`allocation ${ID} amount \d+ differs from the contract's signing bonus \d+`)],
    ['wrong week', (s) => withFund(s, (f) => { f.allocations[0]!.week = 25 }), fundingRefusal(String.raw`allocation ${ID} week 25 is outside the fund's life \[26, 26\]`)],
    ['allocations out of signing order', (s) => withFund(s, (f) => { f.allocations.reverse() }), fundingRefusal(`allocations are out of signing order at ${ID}`)],
    ['spending arithmetic', (s) => withFund(s, (f) => { f.spentBonus += 1 }), fundingRefusal(String.raw`fund\.spentBonus \d+ must equal spentAtRecording plus the allocations \(\d+\)`)],
    ['opened fund with recorded spending', (s) => withFund(s, (f) => { f.provenance = 'opened'; f.spentAtRecording = 1; f.spentBonus += 1 }), fundingRefusal(String.raw`an opened fund records no spending at recording \(spentAtRecording must be 0\)`)],
    ['unknown provenance', (s) => withFund(s, (f) => { (f as unknown as { provenance: string }).provenance = 'forged' }), fundingRefusal(String.raw`fund\.provenance forged is unknown`)],
    ['closure before recording', (s) => withFund(s, (f) => { f.closedWeek = 25 }), fundingRefusal(String.raw`fund\.closedWeek 25 is not a week in \[26, 26\]`)],
    ['closure after the current week', (s) => withFund(s, (f) => { f.closedWeek = 27 }), fundingRefusal(String.raw`fund\.closedWeek 27 is not a week in \[26, 26\]`)],
    ['half-closed fund', (s) => withFund(s, (f) => { f.closingEmploymentCount = null }), fundingRefusal(String.raw`fund\.closedWeek and fund\.closingEmploymentCount must both be null \(open\) or both be set \(closed\)`)],
    ['closing count below opening', (s) => withFund(s, (f) => { f.closingEmploymentCount = f.openingEmploymentCount - 1 }), fundingRefusal(String.raw`fund\.closingEmploymentCount \d+ is not within \[\d+, \d+\]`)],
    ['opening count beyond the register', (s) => withFund(s, (f) => { f.openingEmploymentCount = s.hollywood!.employment.length + 1 }), fundingRefusal(String.raw`fund\.openingEmploymentCount \d+ is not within the employment register \(0\.\.\d+\)`)],
    ['root shape: extra key', (s) => withRoot(s, { ...fundingRoot(s), extra: 1 } as unknown as FundingRoot), fundingRefusal('root must have exactly the keys fund, recordedFromWeek, version')],
    ['root shape: unknown version', (s) => withRoot(s, { ...fundingRoot(s), version: 2 as unknown as 1 }), fundingRefusal('version 2 is unknown')],
    ['recordedFromWeek after the current week', (s) => withRoot(s, { ...fundingRoot(s), recordedFromWeek: 27 }), fundingRefusal(String.raw`recordedFromWeek 27 is not a week in \[0, 26\]`)],
    ['a fund recorded at week 0 (parent ruling 2026-10-11 R-A)', (s) => withRoot(s, { ...fundingRoot(s), recordedFromWeek: 0 }), fundingRefusal(String.raw`a fund is recorded only for a draft after week 0 \(a week-0 draft keeps the ordinary cash path\)`)],
    ['closed fund with a draft still open', (s) => ({ ...withFund(s, () => {}), founding: { applicantIds: [], budget: 0, spentBonus: 0 } }) as GameState, fundingRefusal('a closed fund requires a closed founding draft')],
    ['open fund with no draft', (s) => withFund(s, (f) => { f.closedWeek = null; f.closingEmploymentCount = null }), fundingRefusal('an open fund requires an open founding draft')],
    ['double payment: a surplus cash row for a funded signature', (s) => {
      const a = fundOf(s).allocations[0]!
      const row = s.hollywood!.employment.find((e) => e.contractId === a.contractId)!
      const entry = { week: 26, kind: 'signingBonus', amount: -a.amount, talentId: row.terms.talentId, note: 'contract signing bonus' } as unknown as LedgerEntry
      return { ...s, ledger: [...s.ledger, entry], studio: { ...s.studio, cash: s.studio.cash - a.amount } }
    }, DOUBLE_PAYMENT],
    ['allocation for a rival row inside a widened interval (owner mismatch)', (s) => {
      // A lawful interval holds only the draft week's player signatures: no tick runs while a draft is
      // open, so no rival row lands inside it. Lowering openingEmploymentCount to 0 widens the interval
      // over the industry's opening rival rows. R-E I3 refuses that edit alone (founding-interval-and-charges);
      // the allocation's join to a player signature is read first, so this mutant keeps its own message.
      const widened = withFund(s, (f) => { f.openingEmploymentCount = 0 })
      const rival = s.hollywood!.employment.slice(0, fundOf(s).closingEmploymentCount!).find((e) => e.studioId !== s.hollywood!.playerStudioId)
      if (rival === undefined) throw new Error('premise: no rival row inside the widened interval')
      return withFund(widened, (f) => { f.allocations[0]!.contractId = rival.contractId })
    }, fundingRefusal(String.raw`allocation ${ID} names no player founding signature in the fund's interval \[0, \d+\)`)],
  ]
  it('founding-mutant-premise: the fully valid corrected late-founded save validates', () => {
    expect(() => makeSave(lateFounded().founded)).not.toThrow()
    expect(fundOf(lateFounded().founded).allocations.length).toBeGreaterThanOrEqual(3)
  }, HEAVY)
  for (const [title, mutate, refusal] of cases) {
    it(`founding-mutant: ${title} refuses by name`, () => {
      const { founded } = lateFounded()
      const mutant = mutate(detached(founded))
      expect(() => makeSave(mutant)).toThrow(refusal)
      expect(() => makeSave(founded)).not.toThrow()
    }, HEAVY)
  }

  it('founding-mutant: a draft open after week 0 without a fund refuses; a week-0 draft keeps its null fund', () => {
    const draft = imported('late-draft-week26-unsigned')
    expect(() => makeSave(withRoot(draft, { ...fundingRoot(draft), fund: null }))).toThrow(/requires an open recruitment fund/)
    expect(() => makeSave(draft)).not.toThrow()
    expect(() => makeSave(newGame('p1364-w0-draft-02'))).not.toThrow()
  }, HEAVY)

  it('founding-mutant: ordinary same-week signing after closure needs ordinary cash; its row is not mistaken for double payment', () => {
    const { founded } = lateFounded()
    const hire = hiringMarketView(founded).find((c) => contractOfferOptions(founded, c.talentId).length > 0)
    if (hire === undefined) throw new Error('premise: the week-26 hiring market offers somebody signable')
    const offer = contractOfferOptions(founded, hire.talentId)[0]!
    const signed = applyActions(founded, [{ kind: 'signContract', talentId: hire.talentId, termWeeks: offer.termWeeks }])
    const rows = signingRows(signed)
    expect(rows.length).toBe(1)
    expect(rows[0]!.week).toBe(26)
    expect(fundOf(signed).allocations.length).toBe(fundOf(founded).allocations.length)
    expect(() => makeSave(signed)).not.toThrow()
    // Delete the ordinary payment: the old law refuses the ordinary signature by name.
    const unpaid = { ...signed, ledger: signed.ledger.filter((row) => row !== rows[0]), studio: { ...signed.studio, cash: signed.studio.cash - rows[0]!.amount } }
    expect(() => makeSave(unpaid)).toThrow(PAYMENT_GUARD)
  }, HEAVY)

  it('founding-group-reconciliation: the same funded talent\'s paid release and ordinary re-signing in the founding week consume exactly one cash row (route-proven; 1364-A §3 bullet 9); an extra unmatched cash row refuses as double payment; the ordinary interval without its cash row refuses', () => {
    const { founded } = lateFounded()
    const fund = fundOf(founded)
    const funded = founded.hollywood!.employment.find((e) => e.contractId === fund.allocations[0]!.contractId)!
    const talentId = funded.terms.talentId
    const released = applyActions(founded, [{ kind: 'releaseTalent', talentId }])
    const resigned = applyActions(released, [{ kind: 'signContract', talentId, termWeeks: contractOfferOptions(released, talentId)[0]!.termWeeks }])
    // Premise: one talent/week group holding the funded interval (ended by the paid release) and an ordinary one.
    const h = resigned.hollywood!
    const group = h.employment.filter((e) => e.studioId === h.playerStudioId && e.terms.talentId === talentId && e.terms.startWeek === 26)
    expect(group.map((e) => [e.contractId === funded.contractId, e.reason, e.endedWeek])).toEqual([[true, 'player-contract', 26], [false, 'player-contract', null]])
    expect(resigned.ledger.filter((row) => row.kind === 'termination' && row.talentId === talentId && row.week === 26).length, 'premise: the release was paid').toBe(1)
    const cash = resigned.ledger.filter((row) => row.kind === 'signingBonus' && row.talentId === talentId && row.week === 26)
    expect(cash.map((row) => row.amount)).toEqual([-group[1]!.terms.signingBonus])
    expect(fundOf(resigned).allocations).toEqual(fund.allocations)
    // The ordinary interval consumes the one cash row; the funded interval needs none.
    expect(() => makeSave(resigned)).not.toThrow()
    // A genuinely extra cash row: nothing ordinary is left to consume it, so it pays the funded interval twice.
    const extra = { ...resigned, ledger: [...resigned.ledger, { ...cash[0]! }], studio: { ...resigned.studio, cash: resigned.studio.cash + cash[0]!.amount } }
    expect(() => makeSave(extra)).toThrow(DOUBLE_PAYMENT)
    // The ordinary interval without its cash row: the old law refuses it.
    const unpaid = { ...resigned, ledger: resigned.ledger.filter((row) => row !== cash[0]), studio: { ...resigned.studio, cash: resigned.studio.cash - cash[0]!.amount } }
    expect(() => makeSave(unpaid)).toThrow(PAYMENT_GUARD)
  }, HEAVY)

  it('founding-group-distinct-rows: two ordinary re-signings of a funded talent in the founding week need two distinct cash rows; with one of two equal rows removed the per-row rule still matches both, and the group loop refuses by name (1364-A §3 bullet 9: no single row discharges two obligations)', () => {
    const { founded } = lateFounded()
    const fund = fundOf(founded)
    const funded = founded.hollywood!.employment.find((e) => e.contractId === fund.allocations[0]!.contractId)!
    const talentId = funded.terms.talentId
    const resign = (state: GameState): GameState => {
      const released = applyActions(state, [{ kind: 'releaseTalent', talentId }])
      return applyActions(released, [{ kind: 'signContract', talentId, termWeeks: contractOfferOptions(released, talentId)[0]!.termWeeks }])
    }
    const twice = resign(resign(founded))
    // Premise: one talent/week group holding the funded interval and two ordinary ones with equal bonuses.
    const h = twice.hollywood!
    const group = h.employment.filter((e) => e.studioId === h.playerStudioId && e.terms.talentId === talentId && e.terms.startWeek === 26)
    expect(group.map((e) => [e.contractId === funded.contractId, e.reason])).toEqual([[true, 'player-contract'], [false, 'player-contract'], [false, 'player-contract']])
    const cash = twice.ledger.filter((row) => row.kind === 'signingBonus' && row.talentId === talentId && row.week === 26)
    expect(cash.map((row) => row.amount)).toEqual([-group[1]!.terms.signingBonus, -group[2]!.terms.signingBonus])
    expect(cash[0]!.amount, 'premise: equal bonuses, so one row matches both intervals').toBe(cash[1]!.amount)
    expect(() => makeSave(twice)).not.toThrow()
    const oneRow = { ...twice, ledger: twice.ledger.filter((row) => row !== cash[1]), studio: { ...twice.studio, cash: twice.studio.cash - cash[1]!.amount } }
    // Premise: the per-row rule (an equal row exists for each interval) holds, so only the group's distinct-row check can refuse.
    for (const e of group.slice(1)) expect(oneRow.ledger.some((row) => row.kind === 'signingBonus' && row.talentId === talentId && row.week === 26 && row.amount === -e.terms.signingBonus)).toBe(true)
    expect(() => makeSave(oneRow)).toThrow(PAYMENT_GUARD)
  }, HEAVY)
})

// ═══════════════════════════════════════════════════════════════════════════════
// Persistence boundaries and access (1364-A §5 items 8, 9)
// ═══════════════════════════════════════════════════════════════════════════════
describe('1364 persistence: the step, its downgrade and the frozen reader', () => {
  it('founding-step-live: the live writer stamps the founding step and the step functions exist by name', () => {
    // 1370-ar r2: the P15B step (Save48) stacks above the founding step; P16 rebase: the P16 step (Save49) is live above it.
    expect(saveModule.P15B_SAVE_VERSION).toBe(FOUNDING_STEP + 1)
    expect(saveModule.LIVE_SAVE_VERSION).toBe(EXPECTED_LIVE_SAVE_VERSION)
    expect(makeSave(newGame('p1364-step-01')).saveVersion).toBe(saveModule.LIVE_SAVE_VERSION)
    for (const name of [`validateSaveV${FOUNDING_STEP}`, `convertV${FOUNDING_STEP - 1}ToV${FOUNDING_STEP}`, `convertV${FOUNDING_STEP}ToV${FOUNDING_STEP - 1}`, `migrateToV${FOUNDING_STEP}`]) saveFn(name)
  })

  it('founding-step-preserves-save46-gates: a Save46 recovery fact passes through the Save47 step unchanged; every downgrade below 46 refuses with the Save46 reason, and the Save47 reader refuses a Save46 violation', () => {
    // R8's genuine week-0 predecessor through both steps: 45 -> 46 (R8's zero initialisation) -> 47 (the null fund).
    const old = recoveryPredecessor45(0) as unknown as Envelope
    const era46 = saveModule.convertV45ToV46(old as never) as unknown as Envelope
    const live = saveModule.convertV46ToV47(era46 as never) as unknown as Envelope
    expect(live.saveVersion).toBe(FOUNDING_STEP)
    expect(canon(fundingRoot(live.state as GameState))).toBe(canon({ version: 1, recordedFromWeek: 0, fund: null }))
    expect(canon(saveFn(`convertV${FOUNDING_STEP}ToV${FOUNDING_STEP - 1}`)(live))).toBe(canon(era46))
    // R8's own synthetic policy-state control (p14d2-save46-migration withSince): an idle owner enters cost cutting now.
    // 1370-ar r2: the live writer is the P15B step, so the state is lifted once more (its two empty roots, zero loan kinds).
    const state = JSON.parse(JSON.stringify(migrateToLive(live as never).state)) as GameState
    const owner = state.hollywood!.businesses.find((b) => b.productions.length === 0 && b.runs.length === 0
      && !state.talentMarket.proposals.some((p) => p.issuerStudioId === b.studioId))
    expect(owner, 'premise: a genuine week-zero idle owner').toBeDefined()
    ;(owner as unknown as { costCutting: { version: 1; since: number | null } }).costCutting.since = state.market.tick
    const cutting = makeSave(state) as unknown as Envelope // the live writer admits R8's valid recovery fact
    expect(cutting.saveVersion).toBe(saveModule.LIVE_SAVE_VERSION)
    // 1370-ar r2: nothing is evaluated at week 0, so the P15B step's empty roots strip losslessly down to the founding step.
    // P16 rebase round 6: the chain runs through the live P16 step first, which converts this world losslessly: at week 0
    // no greenlight or release minted a title, no rights instrument, rights money or rights ledger row exists, the
    // cutover anchors are unchanged, and no P15 or P15B row carries phase table 3.
    const atStep = saveFn(`convertV${saveModule.P15B_SAVE_VERSION}ToV${FOUNDING_STEP}`)(saveModule.convertV49ToV48(saveModule.convertV50ToV49(saveModule.convertV51ToV50(cutting as never))) as unknown as Envelope)
    expect(atStep.saveVersion).toBe(FOUNDING_STEP)
    const r8 = /^migrateToV45: cannot downgrade or discard recovery authority: costCutting\.since$/
    const down46 = saveFn(`convertV${FOUNDING_STEP}ToV${FOUNDING_STEP - 1}`)(atStep) // 47 -> 46 keeps the fact
    expect(down46.saveVersion).toBe(FOUNDING_STEP - 1)
    expect((down46.state.hollywood!.businesses.find((b) => b.studioId === owner!.studioId) as unknown as { costCutting: { since: number | null } }).costCutting.since).toBe(state.market.tick)
    expect(() => saveModule.convertV46ToV45(down46 as never)).toThrow(r8)
    expect(() => saveModule.migrateToV45(cutting as never)).toThrow(r8) // the Save47 dispatch row hands R8's row the same input
    expect(() => saveModule.migrateToV44(cutting as never)).toThrow(r8)
    expect(() => saveModule.makeSaveV18(cutting.state as never)).toThrow(/^makeSaveV18: cannot downgrade or discard recovery authority: costCutting\.since$/) // frozen builder: the null fund strips, R8's refusal stands
    // A Save46 violation is refused by the Save47 reader with R8's own reason: the predecessor's law runs inside the step.
    const violating = JSON.parse(JSON.stringify(atStep)) as Envelope
    ;(violating.state.hollywood!.businesses.find((b) => b.studioId === owner!.studioId) as unknown as { costCutting: { since: number } }).costCutting.since = state.market.tick + 1
    expect(() => saveModule.validateSaveV47(violating)).toThrow(/cost cutting: future entry/)
    const { foundingFunding: _f, ...rest } = violating.state as unknown as Record<string, unknown>
    expect(() => saveModule.validateSaveV46({ ...violating, saveVersion: 46, state: rest })).toThrow(/cost cutting: future entry/)
  })

  it('founding-downgrade-null-fund-lossless: a null fund strips and round-trips; the empty root is added back at the save\'s own week', () => {
    const outcome = foundManagedStudioAction(signMinimum(newGame('p1364-step-02')).state)
    if (!outcome.ok) throw new Error(outcome.error)
    let state = outcome.next
    for (let i = 0; i < 2; i++) state = tick(state)
    expect(fundingRoot(state).fund).toBeNull()
    // 1370-ar r2: the two ticks evaluated the condition, which the P15B step refuses to discard; the founding step's
    // own round trip starts from the predecessor envelope the test helper builds (tests/helpers/p15-roots.ts).
    const live = predecessorSave(state) as unknown as Envelope
    const below = saveFn(`convertV${FOUNDING_STEP}ToV${FOUNDING_STEP - 1}`)(live)
    expect(below.saveVersion).toBe(FOUNDING_STEP - 1)
    expect(Object.hasOwn(below.state, 'foundingFunding')).toBe(false)
    const again = saveFn(`convertV${FOUNDING_STEP - 1}ToV${FOUNDING_STEP}`)(below)
    expect(canon(fundingRoot(again.state))).toBe(canon({ version: 1, recordedFromWeek: state.market.tick, fund: null }))
    const { foundingFunding: _f, ...rest } = again.state as unknown as Record<string, unknown>
    expect(canon(rest)).toBe(canon(below.state))
  }, HEAVY)

  it('founding-downgrade-refuses-recorded-fund: a closed fund and an open fund refuse by name, appending the P15 refusals rather than masking them', () => {
    const { founded, draft } = lateFounded()
    const down = saveFn(`convertV${FOUNDING_STEP}ToV${FOUNDING_STEP - 1}`)
    // 1370-ar r2: the founding step's converter takes the predecessor envelope (tests/helpers/p15-roots.ts); the live
    // dispatch row below refuses first by the P15B reasons and appends the fund's, so the same regex matches both.
    expect(() => down(predecessorSave(founded))).toThrow(FUND_DOWNGRADE)
    expect(() => down(predecessorSave(draft))).toThrow(FUND_DOWNGRADE)
    expect(() => saveModule.migrateToV44(makeSave(founded) as never)).toThrow(FUND_DOWNGRADE)
    // A recorded P15 row joins the same message after the fund's reason.
    let ticked = founded
    for (let i = 0; i < 14; i++) ticked = tick(ticked)
    const snapshots = (ticked as unknown as { powerRanking: { snapshots: unknown[] } }).powerRanking.snapshots.length
    expect(snapshots, 'premise: a quarter was recorded').toBeGreaterThan(0)
    // ACCEPTANCE OPEN (P16 rebase round 6): convertV47ToV46's fund refusal with the shared P15 step's 'cannot downgrade
    // or discard a recorded Power Ranking quarter' appended. A quarter recorded by a live tick carries table 3, and
    // the 14 ticks also wrote nondefault table-3 market assessments, which `rightsStripped` refuses to relabel; no
    // Save48-era world holds a fund and a recorded quarter. The fund refusal itself is asserted above (founded, draft).
    expect(() => saveModule.migrateToV44(makeSave(ticked) as never)).toThrow(LIVE_DOWNGRADE_REFUSAL)
    expect(() => down(predecessorSave(ticked))).toThrow(NONDEFAULT_MARKET_PROJECTION)
  }, HEAVY)

})
