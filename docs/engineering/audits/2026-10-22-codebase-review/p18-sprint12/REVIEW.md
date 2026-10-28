# Sprint 12 independent review — candidate 5710f748 (read-only, Opus), 2026-10-28, 03:30 CDT

Verdict: FIX FIRST. Four blocking defects (one a false FIXED claim for P18-04), nine should-fix items, twelve notes. The reviewer edited nothing and ran nothing; the 123 package post-images match the commit blobs byte for byte. Items are forwarded to the FIX-2 round; resolution is recorded in RESULTS.md per item.

## Blocking
1. P18-04 not fixed; failure swallowed. save.ts:11055 validatedLiveProfessionContext strips the television root but builds its proof context with p15bEraOf(state, true) (no television flag), so the chain reaches V27 under the "rights-p16" ledger policy and refuses tvAdvance / tvProductionSpend / tvMilestonePayment rows; liveRetirementWriting.ts:21-25 catches and returns 'rejected'. Every commissioned world silently loses retirement-writing authority in tick and actions. Fix: p15bEraOf(state, true, undefined, true); RED: a commissioned world with a retiring writer still proves.
2. Will not compile: Omit does not distribute over the TvReceipt union (tvCommission.ts:209 appendTvReceipt); TS2353 at tvCommission.ts:258,259 and tvSeason.ts:245,250,254,282,284. Fix: distributive omit. (Confirmed by green-r2 root tsc.)
3. Acquisition and continued-script allocators cannot see television holds (contract §4): acquisition.ts:197-205 occupied set feeds seatTargetProductions :231, scriptOperations :371, bindContinuedWork :586, bindContinuedScripts :587; continuedScripts.ts:406 rewriteContinuedScript. A season holding the first free slot makes absorption pick it; actions.ts:3339 then throws the occupancy invariant while the quote reported "seated". Fix: add televisionOccupiedFacilitySlots(state.television) to both sets; RED.
4. Validator lets forged television authority through: validateGrant (tvSave.ts:172-181) and the counterparty branch of validateRightsRoot (rights.ts:1216, 1276-1281) never check that the producer/grantor held R1 at week C; a forged root with a non-holder grant, a zero transaction and a +120,000 tvAdvance row reconciles. Fix: require holderAt(resolveTitles(rest), rest.rights.estates, {right:'R1', propertyId}, commitWeek) to be the producer and equal the grantor; tenth forgery case.

## Should fix
5. tvSave.ts:100 checks engagements against busyTalentIds only; admission uses assignmentBlockedTalentIds(state, C, C+20) (reserved cameo weeks). Fix: validate with assignmentBlockedTalentIds(rest, commitWeek, finalWeek).
6. tvCommission.ts:241 spreads the payload roster, so extra keys survive and makeSave later refuses (tvSave.ts:118); a missing roster/cast throws a bare TypeError. Fix: build the roster from the six ids; exact-key-check the request.
7. Missed sweep site: tests/p14r3-save-v41.test.ts:395 convertV50ToV49 on a makeSave envelope (now 51). Fix: wrap in convertV51ToV50.
8. tests/bridge-runtime-checkpoint.test.ts:1226 "P17-build (Save50) current64 checkpoint" now feeds a Save51 slot as the 'p17' slot. Fix: convertV51ToV50(migrateToLive(...)).
9. Case 23 is not RED at ecbc42c9 (control, relabel or add a version/names assertion). Cases 10 and 11 check the quote against its own fields; pin each component against the summed ledger rows of a 20-week tick without a commission.
10. UI: adapter.ts:6204 missing case; StudioLotSnapshot.ts:734 LotFacilityEngagement lacks the TV kind; StudioCalendar.tsx:209 labels a television occupant "production" silently; nextEvent.ts:399-418 copySummary drops television; scriptReview.ts:376 and auditionPlanning.ts:655 reject a TV occupant on the Annex.
11. Undisclosed permanent capacity lock: a gated season (tvSeason.ts:162) keeps its reservations indefinitely until Sprint 13 cancellation. Disclose.
12. Coverage gaps against the contract's required REDs: TV blocking a film on the stage; the equal-wait tie-break; acquisition and continued scripts; setHeldByTelevision strike and repair refusals; placement engagements. (filmRoster unused: superseded by FIX-1 crews.)

## Notes
13. The licence production-authority branch is unreachable (grantor is always the player, tvCommission.ts:90 → :140 grantorNotHolder) yet tvSave.ts:180 accepts via:'licence' with only a grantee check.
14. SWEEP_KIND_RANK (operations.ts:1496-1500) cites "decision D15", not in the contract; films ahead of seasons on equal waits is a policy choice → name it (ACCEPTANCE OPEN).
15. tvSeason.ts:193 re-derives scenery load-in at `week` where film step 0.7 evaluates at week + 1; parity unverified.
16. Two set safeguards hold only because every soundstage has capacity 1 (tvSeason.ts:99; findDoubleBookedResourceSlot ignores set claims).
17. FinanceTotals and PeriodSummary gain television: 0 for every world (economyView.ts:463, 483, 614): read models are not byte-identical without a season.
18. Hard-coded 51 pins returned: p16a-valuation.test.ts:235, 252; p17-p16-rights.test.ts:87, 89; p17-cameo-booking.test.ts:75 → EXPECTED_LIVE_SAVE_VERSION.
19. tvCommissionPreview not exported from index.ts.
20. tvSave.ts:210 requires agreement terms to equal live TUNING: a retune invalidates saves with a live season.
21. Case 29 asserts only /^frozen49/; pin the R4 rule text.
22. Lane time: hooks allow 240 s and 300 s; case 30 runs 18 full-chain validations in one it. Dynamic import at p18-route.ts:184-189 would fail every file if the transform rejected it. The player can sell the R1 title mid-season (licence.ts:66 blockingEncumbrance ignores TV): permanent rights stall, disclose.

## Checks out
No scope leaks (Sprint 13 data carried frozen, no behaviour); no invented rival policy; the commissioner's licence is minted by P16's own mintLicence with the disclosed zero; producer authority from a live permissionFor read; no RNG; step 7.8 after 7.7; film sweep order unchanged; the money reconciles (one advance row, 25,000 units, scripts pays 0, picture lock pays 240,000).

## Sweep spot-check (23 files)
OK: live-era.ts, p16-era.ts, p16-estate-current49-rollback, p16-estate-d-join-negative, p16-r2-validator, p09a-w0-founding-regime, p13b-s3-save-v23, p1364-late-founding, p17-cameo-booking (literal 51), p15b2-corporate-condition-save, p16a-save-v46, p16a-valuation (literal 51), p17-p16-rights (literal 51), p14d2-rival-facility-disposal, p17-save-step, p16b-licence, p16-r2-authority, p16b-asset-sale, p14c3-save-v38, p14c3-profession-history, p14c2b-save-v36. MEANING CHANGED: bridge-runtime-checkpoint.test.ts:1226 (item 8). MISSED: p14r3-save-v41.test.ts (item 7).
