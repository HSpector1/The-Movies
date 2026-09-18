import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { exportCurrentState, importSave, migrateToV28 } from '../src/core/save.js'
import * as technology from '../src/core/technology.js'
import { considerRivalSoundPurchase } from '../src/core/technologyRival.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

describe('P13A shared commercial adoption and exact rival cash consequence', () => {
  let released: GameState
  beforeAll(() => { released = advanceTo(p13aGeneratedStudio('p13-public-commercial-adoption'), 416) }, 30_000)

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
      expect(receipt).toMatchObject({route: 'purchase', committedWeek: 416, operationalWeek: null,
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
      // AMENDED (P14A.1 engine, d49cc27): under the ratified law the incumbent's
      // renewal is a proposal settled at the decision week, and staff() skips
      // case subjects — so this rival's founding roster runs to week 208 and is
      // re-signed there for 208 more weeks (208 -> 416); THAT contract's own
      // decision week is 416, so `released` (advanceTo(...,416)) already carries
      // a settlement signing movement in the finance period covering week 416
      // before this test's standalone considerRivalSoundPurchase call ever runs.
      // The period the purchase would open is therefore ALREADY open, and the
      // purchase folds into it instead of opening a new one. This case is about
      // the PURCHASE's own consequence, not the settlement's premise, so every
      // assertion below is expressed relative to `original` (the genuinely
      // observed pre-purchase state), never as a hardcoded absolute.
      expect(selected.account.periods).toHaveLength(original.account.periods.length)
      expect(selected.account.periods.slice(0, -1)).toEqual(original.account.periods.slice(0, -1))
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
    // pinned V25 fact, so it tracks forward to `migrateToV28`.
    const restored = migrateToV28(importSave(exportCurrentState(released))).state
    const committed = tick(released)
    expect(exportCurrentState(tick(restored))).toBe(exportCurrentState(committed))
    const receipt = committed.technology.adoptions.find(row => row.studioId !== committed.hollywood!.playerStudioId && row.route === 'purchase')!
    expect(receipt.committedWeek).toBe(416)
    expect(receipt.operationalWeek).toBeNull()
    const business = committed.hollywood!.businesses.find(row => row.studioId === receipt.studioId)!
    expect(business.operations.facilities).toEqual(released.hollywood!.businesses.find(row => row.studioId === receipt.studioId)!.operations.facilities)
    expect(business.account.periods.reduce((total, period) => total + period.movements.technologyAdoption, 0)).toBe(-1_475_000)
    const operational = advanceTo(committed, 428)
    expect(operational.technology.adoptions.filter(row => row.studioId === receipt.studioId)).toHaveLength(1)
    expect(operational.technology.adoptions.find(row => row.id === receipt.id)).toMatchObject({id: receipt.id, operationalWeek: 428})
    expect(operational.hollywood!.receipts.filter(row => row.kind === 'technologyAdopted' && row.adoptionId === receipt.id)).toHaveLength(1)
    expect(operational.hollywood!.receipts.find(row => row.kind === 'technologyAdopted' && row.adoptionId === receipt.id)).toMatchObject({week: 428, studioId: receipt.studioId})
    expect(exportCurrentState(migrateToV28(importSave(exportCurrentState(operational))).state)).toBe(exportCurrentState(operational))
  }, 30_000)
})
