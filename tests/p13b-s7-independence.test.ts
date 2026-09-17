// ── P13B-S7 test 2: forecast/announcements are independent of rival facts ───
//
// Requirement-derived from "S7 — Forecast/replacement disclosure", the
// "Refinement" block's invariant: "the forecast and announcements are
// byte-identical across two campaigns at the same week that differ only in
// rival facts (adoptions, receipts, employment) — S8 inherits it", and the
// restated "Tests" item 2: "rival-independence (identical wire
// forecast/announcement rows across two states differing only in rival
// facts — necessarily PARTIAL until S8 exists: today only rival adoptions,
// receipts and employment can be varied; the pure signature carries the
// rest)."
//
// SCOPE — PARTIAL BY THE PLAN'S OWN WORDING: `technologyForecast(entry,
// week)` and `technologyAnnouncements(week)` never take a `GameState`
// argument at all (P13B-S7-T1 assignment law) — independence from rival
// facts is therefore carried by the FUNCTION SIGNATURE itself, not by this
// file's assertions. What this file adds beyond the signature: it builds two
// GENUINELY DIVERGENT GameStates (same week, differing only in which rival
// has adopted synchronized sound and that rival's cash/ledger — never the
// player's own `operations`/`placement`), derives `week` from EACH state
// independently, and shows the derived results agree — closing the gap
// between "the signature can't see rival facts" and "an engine caller who
// only has a state in hand still gets the same answer no matter which
// divergent world it came from". Player research/employment cannot yet be
// varied independently of the world seed in this engine (no rival research
// exists — S8), so per the plan's own qualifier this file is PARTIAL: it
// exercises rival technology ADOPTION divergence only, and names rival
// RESEARCH/EMPLOYMENT divergence as the S8 gap this file does not close.
//
// RED-by-design: `src/core/technologyDisclosure.ts` does not exist yet.
// `technologyForecast`/`technologyAnnouncements` are the ONLY imports from
// that new module — the whole file fails at module resolution before any
// test body runs. Every other import is a real, existing module
// (`technologyCatalogue.js`, `technologyRival.js`, the p13a harness).
//
// INTERPRETATION NAMED: the divergent-rival pair is built with the EXACT
// technique `tests/p13a-rival-adoption.test.ts` already uses and depends on
// (`considerRivalSoundPurchase` looped over `hollywood.businesses` on a
// `structuredClone`d hollywood root, spread back as `{...state, hollywood,
// technology}`) — a real, already-proven-reachable production code path, not
// a hand-forged state. `advanceTo` (real ticks) is used to move BOTH
// divergent states to a later shared week; `market.tick` is a plain integer
// counter untouched by which rival owns what, so both branches reach the
// identical week by construction regardless of anything rival-side.
//
// CORRECTION (post-S7-T2, engine measured — evidence 08-engine-s7.txt, this
// file's own case 5 originally at line ~121): `considerRivalSoundPurchase`
// admits at most one rival adoption per campaign and `advanceHollywoodWeek`
// runs it on EVERY tick (`hollywoodTick.ts:225`); the base world's own tick
// at week 416 mints byte-for-byte the same purchase this file applies
// manually (same business, same `committedWeek`), so `base`/`rivalVariant`
// re-converge to JSON-identical states from week 417 on and a week-900
// "not.toEqual" precondition on the UNCHANGED pair is vacuous. Case 5 below
// instead layers ONE ADDITIONAL rival-only fact, local to that case (`base`
// and `rivalVariant` themselves, and cases 1-4 above, are untouched): a
// leading no-op `RivalFinancePeriod` (`newFinancePeriod`, the real
// production helper — opening===closing, every `RivalMoneyKind` movement
// zero) spliced before one rival business's real `account.periods`, at that
// business's own entry week. `hollywoodValidation.ts` sums every money kind
// ACROSS periods (a zero period changes no sum) except the one PER-PERIOD
// check ("technology adoption movements do not reconcile with receipts",
// `inPeriod` against `technology.access`/`adoptions`) — placing the synthetic
// period at the business's entry week (years before any technology event)
// avoids that overlap. VERIFIED with the real validator
// (`save.exportCurrentState`, which round-trips through `validateHollywood`):
// accepted both immediately after construction and after `advanceTo(900)`
// (measured via `vite-node`, not committed — see the case's own inline
// assertion, which is the persisted proof). The forged period is never
// detected or reconciled away by any tick, so the pair stays genuinely
// divergent (`not.toEqual`) through week 900 while `operations`, `placement`
// and `technology.access` (the player-visible roots) stay byte-identical.

import { beforeAll, describe, expect, it } from 'vitest'
import { newFinancePeriod } from '../src/core/hollywood.js'
import * as save from '../src/core/save.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { considerRivalSoundPurchase } from '../src/core/technologyRival.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/technologyDisclosure.ts does not exist yet — see
// this file's header. `technologyForecast`/`technologyAnnouncements` are the
// ONLY imports from the new module.
import { technologyAnnouncements, technologyForecast } from '../src/core/technologyDisclosure.js'

const SEED = 'p13b-s7-independence-01'

/** Real rival commercial sound purchase, looped exactly as tests/p13a-rival-adoption.test.ts does. */
function withRivalPurchase(state: GameState): GameState {
  const hollywood = structuredClone(state.hollywood)!
  let result = state.technology
  for (const business of hollywood.businesses) {
    result = considerRivalSoundPurchase(state, hollywood, business)
    if (result !== state.technology) break
  }
  if (result === state.technology) {
    throw new Error('p13b-s7-independence fixture: no rival business purchased sound technology at week 416 — widen the seed/business pool')
  }
  return { ...state, hollywood, technology: result }
}

describe('P13B-S7 rival-independence: identical forecast/announcements across states differing only in rival facts (test 2, PARTIAL until S8)', () => {
  let base: GameState
  let rivalVariant: GameState

  beforeAll(() => {
    base = advanceTo(p13aGeneratedStudio(SEED), 416)
    rivalVariant = withRivalPurchase(base)
  }, 30_000)

  it('precondition: the rival-purchase variant genuinely differs from the base world in rival facts only, at the identical week', () => {
    expect(rivalVariant.market.tick).toBe(base.market.tick)
    expect(rivalVariant.technology.adoptions.length).toBeGreaterThan(base.technology.adoptions.length)
    expect(rivalVariant).not.toEqual(base)
    // Player-owned roots untouched — only rival (`hollywood`) and the shared
    // `technology` root (which now carries the rival's adoption row) differ.
    expect(rivalVariant.operations).toEqual(base.operations)
    expect(rivalVariant.placement).toEqual(base.placement)
  })

  it('lighting forecast (windowed) is byte-identical across the two rival-divergent states at week 416', () => {
    const entry = technologyEntry('lighting-control-01')
    const fromBase = technologyForecast(entry, base.market.tick)
    const fromRivalVariant = technologyForecast(entry, rivalVariant.market.tick)
    expect(fromRivalVariant).toEqual(fromBase)
    expect(JSON.stringify(fromRivalVariant)).toBe(JSON.stringify(fromBase))
    expect(fromBase).toEqual({ kind: 'window', fromWeek: 884, toWeek: 988 })
  })

  it('sound forecast (exact) is byte-identical across the two rival-divergent states at week 416', () => {
    const entry = technologyEntry('synchronized-sound')
    const fromBase = technologyForecast(entry, base.market.tick)
    const fromRivalVariant = technologyForecast(entry, rivalVariant.market.tick)
    expect(fromRivalVariant).toEqual(fromBase)
    expect(fromBase).toEqual({ kind: 'exact', commercialWeek: 416, announcedWeek: 416 })
  })

  it('technologyAnnouncements(416) is byte-identical (both empty — lighting has not announced yet) across the two states', () => {
    const fromBase = technologyAnnouncements(base.market.tick)
    const fromRivalVariant = technologyAnnouncements(rivalVariant.market.tick)
    expect(fromRivalVariant).toEqual(fromBase)
    expect(fromBase).toEqual([])
  })

  it('advanced independently to week 900 (past the lighting announcement), a rival-only fact the engine PRESERVES past ticks keeps the pair genuinely divergent, and forecasts/announcements still publish byte-identical', () => {
    // The precondition pair from beforeAll re-converges by week 417 (see this
    // file's header "CORRECTION"): the tick itself mints the identical rival
    // purchase this fixture applies manually. Layer ONE additional rival-only
    // fact, local to THIS case only — `base`/`rivalVariant` (used unchanged by
    // cases 1-4 above) are never mutated.
    const target = rivalVariant.hollywood!.businesses[0]!
    const leadingWeek = target.account.periods[0]!.fromWeek // the business's own entry week — years before any technology event
    const hollywood = {
      ...rivalVariant.hollywood!,
      businesses: rivalVariant.hollywood!.businesses.map(b =>
        b.studioId === target.studioId
          ? { ...b, account: { ...b.account, periods: [newFinancePeriod(leadingWeek, b.account.openingBalance), ...b.account.periods] } }
          : b),
    }
    const rivalVariantForged: GameState = { ...rivalVariant, hollywood }

    // Verify with the real validator (round-trips through `validateHollywood`)
    // before trusting this fixture — a leading zero-movement period changes no
    // reconciled sum, so it is accepted, not merely unchecked.
    expect(() => save.exportCurrentState(rivalVariantForged)).not.toThrow()

    const base900 = advanceTo(base, 900)
    const rivalVariant900 = advanceTo(rivalVariantForged, 900)
    expect(base900.market.tick).toBe(900)
    expect(rivalVariant900.market.tick).toBe(900)
    // Still genuinely divergent — the independence claim is not vacuous.
    expect(rivalVariant900).not.toEqual(base900)
    // ...but confined to the rival side: the player-visible roots the plan's
    // own invariant names (a rival adoption/receipt/employment fact, never a
    // player one) are untouched.
    expect(rivalVariant900.operations).toEqual(base900.operations)
    expect(rivalVariant900.placement).toEqual(base900.placement)
    expect(rivalVariant900.technology.access).toEqual(base900.technology.access)
    // The forged fact itself survived every tick from 416 to 900, unreconciled.
    expect(() => save.exportCurrentState(rivalVariant900)).not.toThrow()

    const entry = technologyEntry('lighting-control-01')
    const forecastFromBase = technologyForecast(entry, base900.market.tick)
    const forecastFromRivalVariant = technologyForecast(entry, rivalVariant900.market.tick)
    expect(forecastFromRivalVariant).toEqual(forecastFromBase)
    expect(forecastFromBase).toEqual({ kind: 'exact', commercialWeek: 936, announcedWeek: 884 })

    const announcementsFromBase = technologyAnnouncements(base900.market.tick)
    const announcementsFromRivalVariant = technologyAnnouncements(rivalVariant900.market.tick)
    expect(announcementsFromRivalVariant).toEqual(announcementsFromBase)
    expect(announcementsFromBase).toEqual([{ technologyId: 'lighting-control-01', week: 884 }])
  }, 30_000)
})
