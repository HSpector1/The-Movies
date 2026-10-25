# C-03 pending: focused static findings and draft

Candidate read: `f3b1d09d498462359365a306e53e8a0d472133ca` in `p16-rebase-20261024-wt`. STATIC-UNRUN. No runtime, Node, npm, compiler, Vitest, Git mutation, source edit, fixture edit, budget change or repository write performed. Only this directory contains new drafts. No source defect is established by this inspection.

## 1. Authentic active-work closure route is available, with a necessary provenance limit

`P16_ORIGINAL48_R03_CAPTURE_ROOT` is already bound by `wave3-final/scripts/lane/p16-env.sh`. Its original48 manifest SHA is `feb38e3397da84f3e3353207fdc58e339ed98708476968083089cba73e270a2e`. The manifest names original producer HEAD `1436436c154c94744a927dc30d3f10f5781b3050`, source tree `476b387d65a4c427dc0f6120724e946cf22d7969`, and **“existing disclosedcondition/finance R03transaction fixture; notnaturalcampaign”**. Preserve that exact limit in all result reporting.

Raw capture inspection, not runtime validation:

| Bound capture | SHA-256 | Recorded facts |
| --- | --- | --- |
| `r03-week130.save48.json` | `f3a4ba519a87a62f5d170d11709070c2ec986541a1a2913a2f4477d03015d80e` | No closure yet; R03 has one production and one run. |
| `r03-week131.save48.json` | `107c095c05ed1cd2c3fafd6bf7f3236c26f561f548d24c76487f1e53c58dfbad` | Actual R03 closure at C131; film14 production retained at remainingTicks7, concept14; film13 run at weekIndex3/6. Both real closure dispositions exist. |
| `r03-week132.save48.json` | `6c2d21b44b718bf33c9c8f019c0d737f59cd02a53573f4a31c29c0b21d6b0f25` | Run advances to weekIndex4/6. |
| `r03-week134.save48.json` | `677b0615a7a0a7e54bd6865c6f526d0f7b773d7c28d77ff739c6deca33a9653a` | Run has settled; production retained unchanged. |
| `r03-week144.save48.json` | `c4d319f62d97c9e667fbca2dee8cf87fa21f7a9169192ed7ed1bed9dac40e89b` | Original D144 archival; production retained unchanged. |

Existing `tests/p16-r03-observed-migration.test.ts` and `tests/p16-estate-run-continuation.test.ts` already reuse the later captures. The new draft imports the fixed earlier130 capture through `validateSaveP15B` and `convertV48ToV49`, then advances normally to current49 closure131 and D144. It does not call the setup that forged condition history or drained cash; it does not describe that inherited setup as natural gameplay.

The exact natural-premise limitation is documented by `tests/helpers/p15b-live.ts:233–242`: the original fixture's production8 + run6 duration is shorter than the 33 negative weeks leading to closure, and the distressed studio cannot afford a package. The same helper at245–266 shows `forgedConditionRoot` and `drainRival`. This is evidence about this existing scenario, not proof that no future legal campaign can ever close with active work. The R04 pre162/current163 route has zero productions, zero runs and no production/run closure dispositions, so it cannot substitute for this active-work law.

## 2. Replacement draft for original estate case43

`p16-c03-active-pending.test.ts` contains one complete default-budget leaf. Integrate it as the explicitly mapped replacement for the old `tests/p16-r2-estate.test.ts:43` law; retain old failure evidence. Do not mark the old law covered before this leaf and the affected complete files pass with original budgets. No test-budget argument or global hook is introduced. All capture reading, migration and ticks occur inside the leaf.

The pass-through `vi.spyOn(estateApi, 'openEstate')` observes the real current49 closure producer's call, returns the unchanged real implementation result, and is restored in `finally`. This supplies authentic phase arguments for the two negative handoff guard checks. Those two checks are predicate/transaction seams; the admitted closure and D continuation are ordinary aggregate ticks. The phase state is not advertised as a publishable save. No published estate is deleted to reach a guard.

| Original43 assertion | Draft equivalent |
| --- | --- |
| Active-run lot returns exact `lotEncumbered:activeRun:<subject>` | Real C131 R03 film13 pending entry is moved into a deliberately invalid handoff request only; exact refusal asserted against the authentic captured phase. |
| Active-production lot returns exact `lotEncumbered:activeProduction:<subject>` | Same request-only mutation for real R03 concept14. |
| `openEstate` throws named active-run refusal | Calls saved real `openEstate` with the invalid request and default bound readers; asserts named refusal. Production throw added too. |
| Both pending reasons appear and valid handoff is admitted | Exact C131 `buildEstateHandoff` output supplied by the real closure call; exact two entries and null refusal asserted. |
| Claims context equals producer references | Six actual R03 claims sorted in the same documented sourceContractId/claimId order, with actual closure.lawVersion. The invented old `closure-claim-1/2` list is replaced by the real closure's authoritative references. |
| Published pending status is `pending` | Both exact subjects/reasons/statuses asserted in actual closure49 record. |
| Active-run holder remains closed studio, nontradeable, unarchived, estate lotId null | Full holder equality at131 for both pending subjects. |
| Opening is a lawful save | `makeSave(opened)` on the normal tick result. |
| Pending subjects archive at D | Natural131→143, then public `resolveEstate(143, estateId, 144)`; all pending archived and both holders are `estate:R03`. |
| No estate sale transaction | Full `estateSale` transaction filter remains empty. |

Additional checks retain closure disposition proof, immutable prior/phase/D−1 inputs, unchanged stopped production, unchanged closure record, one archival, and final full save validation. `instrumentRefusal` verifies both preclosure bilateral guard names without changing bidder eligibility. These are direct instrument-law seams, not paid-sale campaigns.

## 3. Original estate case68: later production encumbrance remains OPEN

The law is still implemented: `estate.ts:364–386` rechecks `blockingEncumbrance` at D; an encumbered lot disqualifies each candidate by the original name, then archival belongs to the P15 closure phase. `resolveEstate` at474–485 now requires the genuine D−1 input, actual readers and `makeSave`, followed by an ordinary tick. Therefore editing another production's concept and jumping the clock is not an admitted route.

Under contract §3, another operator needs a pre-existing lawful R3 licence or the R1 title to start work on the closing studio's property. Estate title is nontradeable while the lot is open (`rights.ts` holder fold); `licenceGrantRefusal` at102–104 rejects grants on estate/nontradeable title and R3 grants already touching active production. So a later licensed continuation requires a licence bought **before** closure on a then-clean property, followed by a lawful work producer after opening. No such work start exists in the bound captures.

The candidate has a P17 seam `linkContinuationAtGreenlight` (`rights.ts:834–851`) but no production caller in `src`; its only calls are direct unit tests. P17 is inactive under this order. The existing public player `greenlight` resolves the concept from the player's `state.concepts`; R03/R04 captured properties use rival concepts. The rival decision path selects its own ready screenplay from its own projects. Adding a new gameplay route or changing concept/source facts to force the branch is outside this draft. A future lawful preclosure grant plus genuine admitted production is possible in principle; it has not been supplied here.

Do not retire original68's three assertions: exact bid disqualification, archived lot, and no price debit. The last must eventually be compared against the same ordinary D tick without the sale, because ordinary costs may change cash. A phase-only test with a fabricated production would prove the branch but not this legal campaign, and is deliberately not supplied as equivalent coverage.

## 4. Original authority case83: licence on explicit pending property remains OPEN

Original83 asserts a licensed R1 is deliberately omitted from offered lots, appears pending, retains the licensee's authority, and reads as the closed studio's nontradeable unarchived estate title with `lotId:null`. The arbitrary old `notOffered` setup does not describe the current producer policy.

`buildEstateHandoff` (`estate.ts:95–112`) emits `activeProduction`/`activeRun` for actual blocking facts, or `notOffered` only when `subjectValueV1` is unavailable. Every clean held subject with an available valuation becomes a lot. `validateEstateJoins` at189–197 compares exact lot/pending classification at C. Thus manually removing a clean licensed property from its lot and calling it `notOffered` can pass the narrow handoff shape predicate but cannot pass the authoritative full save at C. This is why a partial guard seam must not masquerade as an admitted pending campaign.

Raw bound R03 pre130 and R04 pre162 have no rights/licences root in Save48, and all film critic scores used by valuation lie in[0,100]. Their current49 migration begins with no paid licence. R03's real pending R1 is concept14, already production-encumbered at130: a new exclusive R3 grant is refused by `licenceGrantRefusal` with `activeProductionEncumbrance`. A licence cannot be manufactured historically. The fixed paid R04 concept0 licence route already implemented in `p16-rebase-estate-licence-survival.test.ts` remains a clean, available property and is correctly offered as a lot at163; it does not meet the pending premise. No real unavailable valuation or pre-existing licensed active R1 appears in these bound captures.

A genuine replacement needs either (a) an admitted earlier grant on a clean property followed by lawful active work and actual closure, or (b) an authentic unavailable-valuation pending property whose earlier lawful grant remains live. There is no authoring or Owner-policy decision to make here: neither premise is available in the inspected bindings. Preserve original83's pending membership, permission equality, and full holder equality as ACCEPTANCE OPEN. The round8 offered-lot licence survival test remains useful but is not equivalent.

## Coordinator verification

The draft was reviewed statically for current imports/signatures and restored-spy lifetime only. Run the leaf in the sole lane with the existing R03 environment binding; then run affected complete files as the existing acceptance order requires. Preserve original5000ms. If current130→131 rejects the recorded predecessor or the leaf exceeds its budget, report the exact first failure/unreached assertions; do not repair the capture, choose a different seed, inject STABLE or change the deadline. No runtime success is claimed.
