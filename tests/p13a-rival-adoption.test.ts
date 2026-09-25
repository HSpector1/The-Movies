import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { exportCurrentState, importSave, migrateToLive } from '../src/core/save.js'
import * as technology from '../src/core/technology.js'
import { considerRivalSoundPurchase } from '../src/core/technologyRival.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

// ── RE-EXPRESSED (test-author, P14A.1 T2, against the landed settlement law
// a2d59e0) ─────────────────────────────────────────────────────────────────
//
// Ruling (coordinator, T2 log): "p13a-rival-adoption case 46 is a test premise
// falsified by the pinned law (the rival roster now settles at 208 instead of
// auto-renewing at 196, so the 416 period pre-exists the sound purchase)."
// Diagnosis (docs/engineering/playability-launch-review/evidence/p14a1-20260918/
// 14-settlement-decline-diagnosis.txt): under the landed law, ALL 24 of a
// rival's founding-roster cases now decide at week 208 (11 settle, 13
// decline), and every settlement pays a signing bonus out of that rival's
// cash — the market existing at all moves the natural chain (§ "ON 288 vs
// 293"). CORRECTED (test-author, evidence 18: docs/engineering/
// playability-launch-review/evidence/p14a1-20260918/18-rival-cash-diagnosis.txt):
// this file previously read that cash effect as the CAUSE of the founding
// rivals' insolvency and the missed week-416 purchase. Evidence 18 refutes
// that: at the S8 close `ef9ff76` (no talent market in the build at all) this
// same seed already had r03 at -14,726,582 and r04 at -9,584,173, both at
// roster 0, by week 416 — the insolvency is INHERITED and pre-market. The
// market's WHOLE measured effect on r02 is +5.0% weekly payroll (96,779 ->
// 101,617, the premium tiers) and +93,490 of extra signing bonuses by week
// 416, which costs r02 the §48 purchase gate by exactly 348,487 — r02 stood
// 251,911 CLEAR of the gate before the market existed and misses it by
// -348,487 under the market — so the first purchase falls from r02 at week
// 416 to a LATER-ENTERING fifth rival at week 520; this is the "11 rival
// re-signings at 208 move rival cash" mechanism named in the assigning
// instruction, sized exactly by evidence 18, not a cause of r03/r04's
// insolvency. The commercial-purchase WEEK GATE itself (`commercialWeek:
// 416` in `technologyCatalogue.ts`) is untouched by the settlement fix — it
// is a fixed catalogue constant, not derived from any rival's cash — so
// week 416 remains the EARLIEST legal week; what moved is WHICH studio can
// first afford it and WHEN. Rather than re-pin a second guessed number, this
// file DERIVES the natural week/studio from the chain's own receipts: it
// walks `tick()` forward from week 416 (the earliest legal week — no
// per-tick search below that is possible by law) until a 'purchase'-route
// adoption appears in `state.technology.adoptions`, and uses the state ONE
// tick before that as `released` — exactly the original fixture's semantics
// (`market.tick` denotes "not yet processed"; see M1 in `tick.ts`: "market.tick
// is incremented as the FINAL step"). Measured once, for the record: this
// lands at week 520, and the eligible studio is a LATER-ENTERING fifth rival
// (a scheduled founding after week 208, so its cash was never touched by the
// week-208 settlement round) — not one of the original four. That the
// original four founding rivals no longer reach this purchase at all by
// week ~500 in this fixture is INHERITED pre-market insolvency (evidence 18,
// see above), a genuine, separate product fact surfaced by this
// re-expression, not fixed here (out of this test-author's scope).
function naturalPurchaseSnapshot(seed: string): GameState {
  let prev = advanceTo(p13aGeneratedStudio(seed), 416) // the fixed catalogue commercialWeek floor
  let state = prev
  while (!state.technology.adoptions.some((row) => row.route === 'purchase')) {
    prev = state
    state = tick(state)
  }
  return prev // ONE tick before the natural commit — see M1 tick semantics above
}

describe('P13A shared commercial adoption and exact rival cash consequence', () => {
  let released: GameState
  beforeAll(() => { released = naturalPurchaseSnapshot('p13-public-commercial-adoption') }, 120_000)

  it('uses the shared player/rival eligibility function and debits only technology adoption without new plant or RNG draws', () => {
    const input = exportCurrentState(released)
      let player = applyActions(released, [{kind: 'purchaseTechnology', technologyId: 'synchronized-sound'}])
      const own = player.hollywood!.playerStudioId
      const ownStage = player.operations.facilities.find(facility => facility.capability === 'soundstage')!
      const ownPost = player.operations.facilities.find(facility => facility.capability === 'post')!
      expect(technology.commercialAccessRefusal(released, own)).toBeNull()
      expect(technology.adoptionRefusal(released, own, ownStage.id, ownPost.id)).toBe('Complete synchronized-sound research or purchase access after commercial release.')
      expect(technology.adoptionRefusal(player, own, ownStage.id, ownPost.id)).toBeNull()
      player = applyActions(player, [{kind: 'adoptSynchronizedSound', stageFacilityId: ownStage.id, postFacilityId: ownPost.id}])

      const hollywood = structuredClone(released.hollywood)!
      let result = released.technology
      let selected = hollywood.businesses[0]!
      for (const business of hollywood.businesses) {
        result = considerRivalSoundPurchase(released, hollywood, business)
        if (result !== released.technology) { selected = business; break }
      }
      expect(result).not.toBe(released.technology)
      const original = released.hollywood!.businesses.find(business => business.studioId === selected.studioId)!
      const receipt = result.adoptions.find(row => row.studioId === selected.studioId)!
      expect(receipt).toMatchObject({route: 'purchase', committedWeek: released.market.tick, operationalWeek: null,
        equipmentCost: 300_000, installationCost: 975_000, physicalProjectIds: [], prototypeProjectId: null})
      expect(technology.commercialAccessRefusal(released, selected.studioId)).toBeNull()
      expect(technology.adoptionRefusal(released, selected.studioId, receipt.stageFacilityId, receipt.postFacilityId)).toBe('Complete synchronized-sound research or purchase access after commercial release.')
      const rivalCommitted = {...released, hollywood, technology: result}
      expect(technology.commercialAccessRefusal(rivalCommitted, selected.studioId)).toBe(technology.commercialAccessRefusal(player, own))
      expect(technology.adoptionRefusal(rivalCommitted, selected.studioId, receipt.stageFacilityId, receipt.postFacilityId)).toBe(technology.adoptionRefusal(player, own, ownStage.id, ownPost.id))
      expect(technology.adoptionRefusal(rivalCommitted, selected.studioId, 'missing-stage', receipt.postFacilityId)).toBe(technology.adoptionRefusal(player, own, 'missing-stage', ownPost.id))
      expect(technology.adoptionRefusal(rivalCommitted, selected.studioId, receipt.stageFacilityId, 'missing-post')).toBe(technology.adoptionRefusal(player, own, ownStage.id, 'missing-post'))
      expect(selected.account.cash - original.account.cash).toBe(-1_475_000)
      expect({...selected, account: original.account}).toEqual(original)
      // RE-EXPRESSED (test-author, P14A.1 T2, see file header): the settlement
      // fix moved WHICH studio and WHEN — `selected` is now measured live from
      // `released` rather than assumed to be one of the original four at a
      // hardcoded week, so this file no longer knows in advance whether the
      // purchase's own finance period is a fresh one or folds into one already
      // open. Both are lawful; only the PURCHASE's own consequence is pinned,
      // expressed relative to `original` (the genuinely observed pre-purchase
      // state), never as a hardcoded absolute or a hardcoded period count.
      expect(selected.account.periods.length).toBeGreaterThanOrEqual(original.account.periods.length)
      expect(selected.account.periods.slice(0, original.account.periods.length - 1))
        .toEqual(original.account.periods.slice(0, -1))
      const period = selected.account.periods.at(-1)!
      const originalPeriod = original.account.periods.at(-1)!
      expect(Object.keys(period).sort()).toEqual(['closing', 'fromWeek', 'movements', 'opening', 'throughWeek'])
      expect(period.fromWeek).toBe(originalPeriod.fromWeek)
      expect(period.throughWeek).toBe(originalPeriod.throughWeek)
      expect(period.opening).toBe(originalPeriod.opening)
      expect(period.closing).toBe(originalPeriod.closing - 1_475_000)
      // The purchase's own consequence, and nothing else: technologyAdoption
      // moves by exactly -1,475,000 in this period; every OTHER movement kind
      // equals whatever `original` already carried in that same period (P13B-S8
      // sweep: all fourteen keys present either way).
      expect(period.movements).toEqual({...originalPeriod.movements, technologyAdoption: originalPeriod.movements.technologyAdoption - 1_475_000})
      const duplicateBefore = JSON.stringify(hollywood)
      expect(considerRivalSoundPurchase({...released, technology: result}, hollywood, selected)).toBe(result)
      expect(JSON.stringify(hollywood)).toBe(duplicateBefore)
      expect(exportCurrentState(released)).toBe(input)
      expect(player.rngState).toBe(released.rngState)
      const replayHollywood = structuredClone(released.hollywood)!
      const replayBusiness = replayHollywood.businesses.find(business => business.studioId === selected.studioId)!
      expect(considerRivalSoundPurchase(released, replayHollywood, replayBusiness)).toEqual(result)
      expect(replayBusiness).toEqual(selected)
  })

  it('replays the actual weekly commercial purchase, reconciles its debit and creates one dated operational receipt', () => {
    // P13B-S8 sweep: by week 416 one rival has already INVENTED sound in its own
    // Laboratory and deployed it. The P13A fact this case tracks is the
    // COMMERCIAL consequence, which has not happened yet.
    expect(released.technology.adoptions.filter(row => row.route === 'purchase')).toEqual([])
    // AMENDED (P13B-S6 live-version sweep, 2026-09-17): `migrateToV25` refuses
    // to downgrade a live envelope now that live has moved to V26 — this is
    // the identity lift through whichever version is CURRENTLY live, not a
    // pinned V25 fact, so it tracks forward to `migrateToV31`.
    // AMENDED AGAIN (735-T, P14B.7 live-version sweep, 2026-09-23): tracks
    // forward again, to `migrateToLive`.
    const restored = migrateToLive(importSave(exportCurrentState(released))).state
    const committed = tick(released)
    expect(exportCurrentState(tick(restored))).toBe(exportCurrentState(committed))
    const receipt = committed.technology.adoptions.find(row => row.studioId !== committed.hollywood!.playerStudioId && row.route === 'purchase')!
    expect(receipt.committedWeek).toBe(released.market.tick) // RE-EXPRESSED: derived, not pinned 416 — see file header
    expect(receipt.operationalWeek).toBeNull()
    const business = committed.hollywood!.businesses.find(row => row.studioId === receipt.studioId)!
    expect(business.operations.facilities).toEqual(released.hollywood!.businesses.find(row => row.studioId === receipt.studioId)!.operations.facilities)
    expect(business.account.periods.reduce((total, period) => total + period.movements.technologyAdoption, 0)).toBe(-1_475_000)
    // RE-EXPRESSED: the operational week is derived by ticking until the
    // installation actually completes, not pinned to a hardcoded +12 (see
    // file header — the install duration itself is unaffected by the
    // settlement fix, but deriving it here needs no second magic number).
    let operational = committed
    while (operational.technology.adoptions.find(row => row.id === receipt.id)!.operationalWeek === null) {
      operational = tick(operational)
    }
    const operationalWeek = operational.technology.adoptions.find(row => row.id === receipt.id)!.operationalWeek!
    expect(operational.technology.adoptions.filter(row => row.studioId === receipt.studioId)).toHaveLength(1)
    expect(operational.technology.adoptions.find(row => row.id === receipt.id)).toMatchObject({id: receipt.id, operationalWeek})
    expect(operational.hollywood!.receipts.filter(row => row.kind === 'technologyAdopted' && row.adoptionId === receipt.id)).toHaveLength(1)
    expect(operational.hollywood!.receipts.find(row => row.kind === 'technologyAdopted' && row.adoptionId === receipt.id)).toMatchObject({week: operationalWeek, studioId: receipt.studioId})
    expect(exportCurrentState(migrateToLive(importSave(exportCurrentState(operational))).state)).toBe(exportCurrentState(operational))
  }, 120_000)
})
