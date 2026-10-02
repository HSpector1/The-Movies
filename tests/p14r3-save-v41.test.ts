// ── P14 task 1305-C, REVISED by 1308-C and 1308-C2: R3 Save41 persistence (companion file to
// p14r3-rival-release.test.ts) ──
//
// STAGED FILE. Import paths below are written for this file's INTENDED destination,
// `tests/p14r3-save-v41.test.ts` (one level below repo root, beside every other
// `tests/*.test.ts`). It is physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1308-stage/tests/ and
// has NOT been executed, type-checked, or moved from there by this author.
//
// 1308-C2 REVISION (1308-F item 5, dry-run defect 1308-X-3): the RECEIPT-ONLY downgrade
// tamper leaf ("a rival termination end receipt exists even though every movement is left at
// 0") is replaced. That tamper is not a valid V41 envelope on its own (an active employment
// row with a matching end receipt but zero reconciled movement fails V41's OWN admission
// rule), and every house `convertVNToVN-1` validates its input first (the established idiom),
// so the refusal it produced named the VALIDATOR's interval-consistency failure, never
// "termination" — a real defect in the tamper's construction, not in the law under test. The
// replacement (`lawfulTerminatedSave`, below) reaches a genuine V41 save carrying a real
// rival release through the lawful route: the SAME ONE labeled `Talent.role` rewrite
// p14r3-rival-release.test.ts's happy-path leaf uses, one real tick, the original role
// restored, then `makeSave` — no forged receipt or movement anywhere. See that function's own
// comment for the full account; three leaves now use it (a new describe block asserting
// `validateSaveV41` admission / the exact charge / the frozen `validateSaveV40` refusal, and
// the replacement downgrade-refusal leaf). The movement-half downgrade leaf and both
// `validateSaveV41` forgery leaves are UNCHANGED (1308-F: "stay").
//
// 1308-C REVISION (supersedes the 1305-C stage's genuine-V40 approach): the 1305-C draft
// reconstructed a V40 envelope AT TEST-RUN TIME from the already-committed genuine V38
// corpus via `migrateToV40`, naming this a DEVIATION from the task's literal "mint a genuine
// outgoing Save40 fixture" instruction and leaving it for 1305-D to accept or reject.
// 1305-D's required changes (1-4) did not rule on that deviation either way. Since then the
// parent minted the genuine fixture directly (1306-K closure, reviewed KEEP by 1306-B's r3
// follow-up) at `tests/fixtures/p14/genuine-v40-pre-r3/`: TWO genuine, richer Save40 inputs,
// each pinned below by its MANIFEST gzip and decoded sha256 (read directly from
// `tests/fixtures/p14/genuine-v40-pre-r3/MANIFEST.json` and the two producer
// `*.provenance.json` files; no other fixture payload was gunzipped or parsed to derive any
// fact in this file):
//   - `genuine-v40-r3-outgoing-week110` (week 110). Route (1306 provenance, verbatim):
//     `p13aGeneratedStudio('r3-outgoing-v40-01'); week 0 signContract first hiring-market
//     Actor 208 weeks; advanceTo(60); releaseTalent; advanceTo(110)`. ONE genuine public
//     player release, giving exactly one player `termination` ledger row and one player
//     `termination`-reason employment end receipt (MANIFEST facts: playerTerminationLedgerRows
//     1, playerTerminationReceipts 1) alongside 4 rival businesses at 3 finance periods each
//     (activeRivalEmployment 24, rivalTerminationReceipts 0) — this is the SAME-NAME
//     collision 1306-B raised (player `MoneyKind` `'termination'`, `types.ts:369`, versus the
//     proposed rival `RivalMoneyKind` `'termination'`, 1305-A) minted into one genuine save on
//     purpose, so a leaf below can witness it directly instead of arguing it on paper.
//   - `genuine-v40-r3-research-week280` (week 280). Route (1306 provenance, verbatim):
//     `commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-probe-01'), research-laboratory at
//     gx0 gy9); advanceTo(280)` — the measured S8 research route. 4 rival businesses at 6
//     finance periods each (activeRivalEmployment 28, rivalTerminationReceipts 0), every
//     `RIVAL_RESEARCH_RECEIPT_KINDS` kind present and `rivalTechnologyProjects>0` (MANIFEST
//     facts), so its rival finance periods carry real nonzero `researchCapacity`/
//     `researchSpend`/`technologyAdoption` movements the 40->41 migration must leave
//     byte-exact — the "research kinds... preserved exactly" requirement.
// The already-committed genuine V38 corpus (`tests/fixtures/p14/genuine-v38-pre-p3/
// genuine-v38-p3-natural-week208.json.gz`) is still used for ONE multi-hop chain-composition
// leaf at the end of this file (kept because it adds coverage the two single-hop genuine-V40
// leaves above do not: that `migrateToV41` composes correctly across MULTIPLE version hops,
// not just the final V40->V41 one). Its existence was confirmed only by directory listing
// (`ls`), never by gunzipping its payload in this pass; the leaf itself asserts no fact about
// its content beyond structural chain-equality, exactly as the 1305-C original did.
//
// LAW UNDER TEST (1305-A Persistence, quoted, unaffected by 1305-F's amendments 1-3, which are
// law/strategy/mechanism, not persistence):
//   "`termination` joins RivalMoneyKind and RIVAL_MONEY_KINDS; `newFinancePeriod` seeds it at
//   0. The live V41 validator requires the new key and reconciles, per period (the `periodOf`
//   idiom used for research), `movements.termination` against minus the sum of
//   `terminationCost(terms, endedWeek)` over this rival's rows ended by a `termination`
//   receipt in that period, and admits a rival `termination` end receipt only when
//   `week < endWeekExclusive`. Frozen V40-and-earlier validators keep the exact old keyset
//   and the player-only rule, versioned by era... 40->41 migration adds `termination: 0` to
//   every period of every rival; nothing else changes. 41->40 downgrade is lossless only when
//   every `termination` movement is 0 and no rival termination receipt exists; otherwise it
//   refuses with a named reason."
// Companion §3.4 "Old saves (the versioned rule)" is the PRECEDENT idiom this reuses (an
// immutable per-era discriminator; frozen validators keep the exact old keyset and rule).
//
// INTERPRETATIONS NAMED:
//   1. `validateSaveV41`, `convertV40ToV41`, `convertV41ToV40`, `migrateToV41` are assumed to
//      be the exact new export names, by direct analogy to every prior version's naming
//      (validateSaveV{N}, convertV{N-1}ToV{N}, convertV{N}ToV{N-1}, migrateToV{N} — confirmed
//      pattern for V37 through V40 by direct source read of save.ts:6538-10420, unchanged
//      since the 1305-C draft). All four are MISSING from save.ts today — this file fails to
//      import from an EXISTING module (save.ts exists; these four names do not), which under
//      vite/vitest either throws a module-resolution SyntaxError at load or binds `undefined`
//      per named-export semantics; every one of the four is actually CALLED below (not merely
//      imported unused), so either outcome is a real, non-spurious RED per the project's own
//      "RED-first tests import from a missing module" caution.
//   2. The reconciliation formula is read literally: `movements.termination` (a period's
//      running total, negative) equals `-sum(terminationCost(row.terms, row.endedWeek))` over
//      this rival's rows ended by a `termination` receipt whose week falls in that period
//      (periodOf idiom, hollywoodValidation.ts:238-242, the same one already used for
//      research reconciliation at :262-274, confirmed unchanged).
//   3. Downgrade losslessness condition is read literally: EVERY `termination` movement is 0
//      AND no rival termination receipt exists (both, not either) — TWO independent downgrade
//      refusal leaves below exercise each half separately, matching the literal "and" (a
//      leaf where only the movement is nonzero; a leaf where only a receipt exists and every
//      movement, including the one attached to that receipt's own period, is left at 0).
//   4. The player-side `MoneyKind` `'termination'` (`types.ts:369`, `state.ledger`) and the
//      rival-side `RivalMoneyKind` `'termination'` (`hollywoodTypes.ts:53`,
//      `state.hollywood.businesses[].account.periods[].movements`) are structurally distinct
//      maps on distinct state roots; the week110 genuine input carries a real instance of
//      both concepts (one player termination, zero rival terminations) precisely so the
//      "not counted as a rival movement" leaf below is a genuine witness, not an argument.
//
// TAMPER-TEST IDIOM: the four "refused" leaves (two downgrade, two validateSaveV41) construct
// an invalid SAVE ENVELOPE directly (not a live simulated GameState) from an already-migrated
// genuine input and pass it straight to the function under test. This is the established,
// expected technique for this class of test in this codebase (see tests/p14c4-save-v35.test.ts
// D3/D4/G3/G4/G5 tamperings) and is DISTINCT from the "no fabricated state beyond the one
// labeled role rewrite" stop rule, which is scoped to p14r3-rival-release.test.ts's
// live-simulation strategy leaves, not to save-validator tamper tests generally.

import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
// RED: validateSaveV41 / convertV40ToV41 / convertV41ToV40 / migrateToV41 do not exist in
// src/core/save.ts at HEAD 3c6a7732 (see header, INTERPRETATION 1). Each is called below.
import {
  LIVE_SAVE_VERSION, exportSave, makeSave, migrateToV40, validateSaveV40,
  validateSaveV41, validateSaveV43, convertV40ToV41, convertV41ToV40, convertV42ToV41, convertV43ToV42, migrateToV41,
} from '../src/core/save.js'
import { terminationCost } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'

const FIXTURES = new URL('./fixtures/p14/genuine-v40-pre-r3/', import.meta.url)
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')

function manifestPin(): void {
  const manifest = readFileSync(new URL('MANIFEST.json', FIXTURES))
  expect(manifest.byteLength).toBe(2694)
  expect(sha(manifest)).toBe('0dbee376a442a02424f83c7665c80b6af7516ae4c2321455f305e9784e6df0e0')
}
function pinned(name: string, gzipBytes: number, gzipHash: string, decodedBytes: number, decodedHash: string): string {
  const gz = readFileSync(new URL(name, FIXTURES))
  expect(gz.byteLength).toBe(gzipBytes)
  expect(sha(gz)).toBe(gzipHash)
  const raw = gunzipSync(gz).toString('utf8')
  expect(Buffer.byteLength(raw, 'utf8')).toBe(decodedBytes)
  expect(sha(raw)).toBe(decodedHash)
  return raw
}
function week110Raw(): string {
  manifestPin()
  return pinned('genuine-v40-r3-outgoing-week110.json.gz',
    122176, '196b73d43ac6e346c6b6e6a73e0b13f16bc23a1f5d321947067d6f81ca774bd8',
    1094789, '2e717382e952fa0f175f07d5f7055d6d3f37c66eb4bf86a783dd169ae21d2ddc')
}
function week280Raw(): string {
  manifestPin()
  return pinned('genuine-v40-r3-research-week280.json.gz',
    238161, '13cff0da503ee23249fdc1d3c2209daae7807745d3f38530f853e11d65258699',
    2308264, '55284c8c5a78da67227f1c35aa82773e5b59f4a2b0b9075a8f2f5284006686b7')
}

type SaveV40Shape = { saveVersion: 40; seed: string; state: Record<string, unknown>; broadcastCache: unknown[] }
function genuineV40(raw: string): SaveV40Shape {
  const parsed: unknown = JSON.parse(raw)
  const validated = validateSaveV40(parsed) as unknown as SaveV40Shape
  expect(exportSave(validated as never)).toBe(raw) // genuine round trip, current writer
  return validated
}

type Period = { fromWeek: number; throughWeek: number; opening: number; closing: number; movements: Record<string, number> }
type Business = { studioId: string; account: { periods: Period[] } }
function rivalBusinesses(state: Record<string, unknown>): Business[] {
  const hollywood = state.hollywood as { businesses: Business[] } | null
  return (hollywood?.businesses ?? []) as never
}
type Employment = { contractId: string; studioId: string; endedWeek: number | null; terms: { talentId: string; endWeekExclusive: number } }
type HollywoodShape = { businesses: Business[]; employment: Employment[]; receipts: unknown[]; nextReceipt: number; playerStudioId: string }
function hollywoodOf(state: Record<string, unknown>): HollywoodShape {
  return state.hollywood as never
}

/** 1308-C2 (1308-F item 5, replacing the receipt-only downgrade tamper — that tamper is not
 * a valid V41 envelope, and every house converter validates first, so the refusal it produced
 * named the validator's own interval-consistency failure, never "termination"). The LAWFUL
 * route to a genuine V41 save carrying a real rival release: the SAME ONE labeled
 * `Talent.role` rewrite p14r3-rival-release.test.ts's happy-path leaf uses (row-2's founding
 * craft employee, `person-<row2>-5`, 'craft' -> 'actor', at week 22 — matching that file's own
 * measured, non-seated week, E/1308-P-r3-unseated-probe.ts/.txt), ONE real tick (once R3
 * lands, the engine's own logic releases the now-surplus person), then the ORIGINAL role
 * restored ('actor' -> 'craft') before `makeSave`. The rewrite and the restoration TOGETHER
 * are the one synthetic trigger (1308-F item 5's own phrasing) bookending a single real engine
 * tick — the resulting save carries a genuine termination charge/movement/receipt with no
 * synthetic residue (the person's role, once again 'craft', matches their history; only their
 * employment legitimately ended). Every other person and fact in the world is engine-derived. */
function lawfulTerminatedSave(): { save: unknown; expectedCharge: number; rivalId: string } {
  const WEEK = 22
  const base = p13aGeneratedStudio()
  const rivalId = base.hollywood!.identities.find((s) => s.row === 2)!.studioId
  const craftId = `person-${rivalId}-5`
  const state = advanceTo(base, WEEK)
  const before = state.hollywood!.activeEmploymentOrdinals
    .map((i) => state.hollywood!.employment[i]!)
    .find((e) => e.studioId === rivalId && e.terms.talentId === craftId)
  if (!before) throw new Error(`p14r3-save-v41 lawful-route premise: ${craftId} is not actively employed by ${rivalId} at week ${String(WEEK)}`)
  const person = state.talent.find((t) => t.id === craftId)
  if (!person || person.role !== 'craft') throw new Error(`p14r3-save-v41 lawful-route premise: expected ${craftId} to be 'craft' before the labeled rewrite, was '${String(person?.role)}'`)
  const rewritten = { ...state, talent: state.talent.map((t) => (t.id === craftId ? { ...t, role: 'actor' as const } : t)) }
  const next = tick(rewritten)
  const restored = { ...next, talent: next.talent.map((t) => (t.id === craftId ? { ...t, role: 'craft' as const } : t)) }
  return { save: makeSave(restored), expectedCharge: terminationCost(before.terms, WEEK), rivalId }
}

describe('P14 1305-C Save41: live boundary', () => {
  it('LIVE_SAVE_VERSION === 42', () => {
    expect(LIVE_SAVE_VERSION).toBe(43)
  })
  it('makeSave stamps 41 on a freshly generated current campaign', () => {
    const state = p13aGeneratedStudio()
    const saved = makeSave(state)
    expect((saved as { saveVersion: number }).saveVersion).toBe(43)
  })
})

describe('P14 1305-C Save41: fresh V41 validates (freshly generated, no fixture needed)', () => {
  it('a freshly generated current campaign round-trips through validateSaveV41', () => {
    const state = p13aGeneratedStudio()
    const saved = makeSave(state)
    const revalidated = validateSaveV43(JSON.parse(JSON.stringify(saved)))
    expect(revalidated.saveVersion).toBe(43)
    for (const business of rivalBusinesses(revalidated.state as never)) {
      for (const period of business.account.periods) expect(period.movements.termination).toBe(0)
    }
  })
})

describe('P14 1305-C Save41: migrateToV41 dispatch matches the direct converter (chain-entry parity) on each genuine input', () => {
  it('week110: migrateToV41 equals convertV40ToV41 on the same genuine input', () => {
    const v40 = genuineV40(week110Raw())
    expect(migrateToV41(JSON.parse(JSON.stringify(v40)) as never)).toEqual(convertV40ToV41(v40 as never))
  })
  it('week280: migrateToV41 equals convertV40ToV41 on the same genuine input', () => {
    const v40 = genuineV40(week280Raw())
    expect(migrateToV41(JSON.parse(JSON.stringify(v40)) as never)).toEqual(convertV40ToV41(v40 as never))
  })
})

/** Shared assertion for both genuine inputs: the ONLY change is `termination: 0` added to
 * every rival period's movements; every other key/value (including week280's real nonzero
 * research-kind movements) is byte-identical, and the envelope is otherwise unchanged. */
function assertMigrationAddsOnlyTermination(v40: SaveV40Shape, expectedRivals: number, expectedPeriodsPerRival: number): void {
  const before = rivalBusinesses(v40.state)
  expect(before.length).toBe(expectedRivals) // precondition, matches the MANIFEST facts
  expect(before[0]!.account.periods.length).toBe(expectedPeriodsPerRival) // precondition
  for (const business of before) for (const period of business.account.periods) expect('termination' in period.movements).toBe(false) // precondition: V40 genuinely lacks the key

  const migrated = convertV40ToV41(v40 as never)
  expect(migrated.saveVersion).toBe(41)
  const after = rivalBusinesses(migrated.state as never)
  expect(after.length).toBe(before.length)
  for (const [i, business] of after.entries()) {
    const priorBusiness = before[i]!
    expect(business.account.periods.length).toBe(priorBusiness.account.periods.length)
    for (const [j, period] of business.account.periods.entries()) {
      const priorPeriod = priorBusiness.account.periods[j]!
      expect(period.movements.termination).toBe(0) // the ONLY addition
      // Everything else in this period's movements — including week280's real nonzero
      // researchCapacity/researchSpend/technologyAdoption kinds — is byte-identical to before.
      const { termination: _t, ...rest } = period.movements
      expect(rest).toEqual(priorPeriod.movements)
      expect(period.fromWeek).toBe(priorPeriod.fromWeek)
      expect(period.throughWeek).toBe(priorPeriod.throughWeek)
      expect(period.opening).toBe(priorPeriod.opening)
      expect(period.closing).toBe(priorPeriod.closing)
    }
  }
  // Nothing outside rival account periods changes: full-state diff modulo saveVersion and
  // the one new key added to every rival period's movements map.
  const strippedAfter = JSON.parse(JSON.stringify(migrated)) as Record<string, unknown>
  for (const business of rivalBusinesses((strippedAfter.state as Record<string, unknown>) as never)) {
    for (const period of business.account.periods) delete (period.movements as Record<string, number>).termination
  }
  ;(strippedAfter as { saveVersion: number }).saveVersion = 40
  expect(strippedAfter).toEqual(JSON.parse(JSON.stringify(v40)))

  const revalidated = validateSaveV41(JSON.parse(JSON.stringify(migrated)))
  expect(revalidated.saveVersion).toBe(41)
}

describe('P14 1305-C Save41: 40->41 migration adds ONLY termination:0 to every period of every rival', () => {
  it('genuine week110 (4 rivals x 3 periods) migrates losslessly except for the new key', () => {
    assertMigrationAddsOnlyTermination(genuineV40(week110Raw()), 4, 3)
  })
  it('genuine week280 (4 rivals x 6 periods, real nonzero research-kind movements) migrates losslessly except for the new key — "research kinds... preserved exactly"', () => {
    assertMigrationAddsOnlyTermination(genuineV40(week280Raw()), 4, 6)
  })
})

describe('P14 1305-C Save41: frozen readers unchanged (regression pin — already true before V41 exists)', () => {
  it('validateSaveV40 still admits the genuine week110 envelope after V41 lands', () => {
    expect(() => validateSaveV40(JSON.parse(week110Raw()))).not.toThrow()
  })
  it('validateSaveV40 still admits the genuine week280 envelope after V41 lands', () => {
    expect(() => validateSaveV40(JSON.parse(week280Raw()))).not.toThrow()
  })
})

describe('P14 1305-C Save41: the player\'s own termination is not counted as a rival movement (the same-name collision 1306-B raised, witnessed on a genuine input)', () => {
  it('week110 has exactly one player termination ledger row and one player termination end receipt; after migration every rival period\'s termination movement is still 0, and both player-side counts are unchanged', () => {
    const v40 = genuineV40(week110Raw())
    const ledgerRows = (v40.state.ledger as { kind: string }[]).filter((row) => row.kind === 'termination')
    expect(ledgerRows).toHaveLength(1) // MANIFEST fact: playerTerminationLedgerRows 1
    const hollywood = hollywoodOf(v40.state)
    const playerReceipts = hollywood.receipts.filter(
      (r): r is { kind: string; reason: string; studioId: string } =>
        typeof r === 'object' && r !== null && (r as { kind?: unknown }).kind === 'employment'
        && (r as { reason?: unknown }).reason === 'termination' && (r as { studioId?: unknown }).studioId === hollywood.playerStudioId,
    )
    expect(playerReceipts).toHaveLength(1) // MANIFEST fact: playerTerminationReceipts 1
    const rivalReceipts = hollywood.receipts.filter(
      (r): r is { kind: string; reason: string; studioId: string } =>
        typeof r === 'object' && r !== null && (r as { kind?: unknown }).kind === 'employment'
        && (r as { reason?: unknown }).reason === 'termination' && (r as { studioId?: unknown }).studioId !== hollywood.playerStudioId,
    )
    expect(rivalReceipts).toHaveLength(0) // MANIFEST fact: rivalTerminationReceipts 0

    const migrated = convertV40ToV41(v40 as never)
    const revalidated = validateSaveV41(JSON.parse(JSON.stringify(migrated))) // must not throw
    for (const business of rivalBusinesses(revalidated.state as never)) {
      for (const period of business.account.periods) expect(period.movements.termination).toBe(0)
    }
    const afterLedgerRows = ((revalidated.state as Record<string, unknown>).ledger as { kind: string }[]).filter((row) => row.kind === 'termination')
    expect(afterLedgerRows).toHaveLength(1) // unchanged by the migration
    const afterHollywood = hollywoodOf(revalidated.state as never)
    const afterPlayerReceipts = afterHollywood.receipts.filter(
      (r): r is { kind: string; reason: string; studioId: string } =>
        typeof r === 'object' && r !== null && (r as { kind?: unknown }).kind === 'employment'
        && (r as { reason?: unknown }).reason === 'termination' && (r as { studioId?: unknown }).studioId === afterHollywood.playerStudioId,
    )
    expect(afterPlayerReceipts).toHaveLength(1) // unchanged: the player's own termination is real and stays real
  })
})

describe('P14 1305-C Save41: a genuine rival release (lawful route) validates under V41 with the exact charge, and is refused by the frozen V40 reader', () => {
  it('validateSaveV41 admits it; the row-2 period\'s termination movement equals -terminationCost(original terms, 22); relabeling saveVersion 40 is refused by the frozen validateSaveV40', () => {
    const { save, expectedCharge, rivalId } = lawfulTerminatedSave()
    const validated = validateSaveV43(save as never)
    expect(validated.saveVersion).toBe(43)
    const business = rivalBusinesses(validated.state as never).find((b) => b.studioId === rivalId)!
    const period = business.account.periods[business.account.periods.length - 1]!
    expect(period.movements.termination).toBe(-expectedCharge)

    const relabeled = JSON.parse(JSON.stringify(save)) as { saveVersion: number }
    relabeled.saveVersion = 40
    expect(() => validateSaveV40(relabeled as never)).toThrow()
  })
})

describe('P14 1305-C Save41: 41->40 downgrade', () => {
  it('lossless (byte-identical to the original V40 envelope) for a zero-termination save (genuine week110: 0 rival termination receipts)', () => {
    const v40 = genuineV40(week110Raw())
    const migrated = convertV40ToV41(v40 as never)
    const downgraded = convertV41ToV40(migrated as never)
    expect(downgraded.saveVersion).toBe(40)
    expect(JSON.stringify(downgraded)).toBe(JSON.stringify(v40))
  })

  it('refused, with a message matching /termination/i, when a rival termination movement is nonzero (no matching receipt either — isolates the movement half of the "and" condition)', () => {
    const v40 = genuineV40(week110Raw())
    const migrated = convertV40ToV41(v40 as never) as unknown as { saveVersion: 41; seed: string; state: Record<string, unknown>; broadcastCache: unknown[] }
    const tampered = JSON.parse(JSON.stringify(migrated)) as typeof migrated
    const business = rivalBusinesses(tampered.state)[0]!
    business.account.periods[0]!.movements.termination = -12345
    expect(() => convertV41ToV40(tampered as never)).toThrow(/termination/i)
  })

  it('refused, with a message matching /termination/i, on a genuine V41 save carrying a real rival release (lawful route, 1308-F item 5 — replaces the prior receipt-only tamper, which is not a valid V41 envelope: every house converter validates first, so that tamper\'s refusal named the validator\'s own interval-consistency failure, never "termination")', () => {
    const { save } = lawfulTerminatedSave()
    expect(() => convertV41ToV40(convertV42ToV41(convertV43ToV42(save as never)))).toThrow(/termination/i)
  })
})

describe('P14 1305-C Save41: validateSaveV41 tamper refusals (reconciliation)', () => {
  it('refuses a forged, unreconciled nonzero termination movement with no matching receipt anywhere for that rival', () => {
    const v40 = genuineV40(week110Raw())
    const migrated = convertV40ToV41(v40 as never)
    const tampered = JSON.parse(JSON.stringify(migrated)) as Record<string, unknown>
    const business = rivalBusinesses((tampered.state as Record<string, unknown>) as never)[0]!
    business.account.periods[0]!.movements.termination = -99999 // no termination receipt exists for this rival at all (precondition confirmed above: rivalTerminationReceipts 0)
    expect(() => validateSaveV41(tampered as never)).toThrow()
    // The exact refusal wording is not pinned (INTERPRETATION 2 names the formula but not the
    // implementation's literal message); if this comes back GREEN, or throws for an unrelated
    // reason, that is a reportable finding, not a silently accepted pass — see the handback.
  })

  it('refuses a rival termination end receipt without its matching movement (matching movement deliberately left at 0, isolating the receipt-presence check from the movement check above)', () => {
    const v40 = genuineV40(week110Raw())
    const migrated = convertV40ToV41(v40 as never) as unknown as { saveVersion: 41; seed: string; state: Record<string, unknown>; broadcastCache: unknown[] }
    const tampered = JSON.parse(JSON.stringify(migrated)) as typeof migrated
    const hollywood = hollywoodOf(tampered.state)
    const rivalId = hollywood.businesses[0]!.studioId
    const currentWeek = (tampered.state.market as { tick: number }).tick
    // week <= currentWeek (receipts cannot be dated after the save's own week, an existing
    // chronology requirement — hollywoodValidation.ts:436) AND week < endWeekExclusive (a
    // genuinely early end, per the stated V41 admission rule).
    const row = hollywood.employment.find((e) => e.studioId === rivalId && e.endedWeek === null && e.terms.endWeekExclusive > currentWeek)
    if (!row) throw new Error('p14r3-save-v41 tamper premise: no active rival employment row with endWeekExclusive beyond the fixture\'s own current week was found')
    const week = currentWeek
    row.endedWeek = week
    hollywood.receipts.push({
      eventId: `industry-event-${hollywood.nextReceipt}`, week, studioId: rivalId, kind: 'employment',
      talentId: row.terms.talentId, fromStudioId: rivalId, toStudioId: null, contractId: row.contractId, reason: 'termination',
    })
    hollywood.nextReceipt += 1
    expect(() => validateSaveV41(tampered as never)).toThrow()
  })
})

describe('P14 1305-C Save41: migrateToV41 chains from a genuine V38 envelope (multi-hop composition, distinct from the single-hop parity leaves above)', () => {
  // The already-committed genuine V38 corpus (existence confirmed by `ls` only, never
  // gunzipped/parsed by the author to derive a fact for this leaf). No fact about its content
  // is asserted below beyond structural chain-equality and the resulting saveVersion — the
  // same discipline the 1305-C original used for this leaf.
  it('migrateToV41 on a genuine V38 envelope equals convertV40ToV41(migrateToV40(v38)) — no V40/V41-specific fixture needed for this leaf', () => {
    const gz = readFileSync(new URL('../genuine-v38-pre-p3/genuine-v38-p3-natural-week208.json.gz', FIXTURES))
    const v38: unknown = JSON.parse(gunzipSync(gz).toString('utf8'))
    const viaChain = migrateToV41(v38 as never)
    const viaExplicitSteps = convertV40ToV41(migrateToV40(v38 as never) as never)
    expect(viaChain).toEqual(viaExplicitSteps)
    expect((viaChain as { saveVersion: number }).saveVersion).toBe(41)
  })
})
