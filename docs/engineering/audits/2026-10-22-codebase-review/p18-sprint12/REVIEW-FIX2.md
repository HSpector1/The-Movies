# Sprint 12 independent review of FIX-2 — commit 0c306995 (read-only, Opus), 2026-10-28, 03:55 CDT

Verdict: FIX FIRST on finding 1 only (stale projection-66 pins); all four original blocking defects are fixed in code, each with a credible RED except item 3. Then INSTALLABLE PENDING LANE.

## Findings
1. BLOCKING: projection-66 pins missed: tests/bridge-schema.test.ts:81 (projectionVersion 66), :341 (/expected literal 66/), :576 ('ProjectionVersion = 66;'), tests/bridge-p14b6-relationship-read-models.test.ts:119 INCOMING_PROJECTION = 66 (asserted at :797, :802, :823, :824). (The bridge-schema three were measured red in green-r5; p14b6 was not in that run.)
2. SHOULD-FIX: ui/src/lot/snapshot/scriptReview.ts:383-388 admits activities `scripts`/`preparation`, but scriptCapacityView labels a television occupant `'television'` (src/core/scriptReadModel.ts:543), so strictCapacityProjection returns null and StudioLotScreen.tsx:3887 falls back to the generic "Screenplay action completed". Older sibling: a production occupant's `'production-development'` is also missing (own ticket).
3. SHOULD-FIX: ui/src/lot/LotNextEventRail.tsx:~400-426 lists summary buckets and "Net this period" without a television row (same class as L-36 Financing). Check WeeklySummary.tsx.
4. SHOULD-FIX: the equal-wait tie-break case pins SWEEP_KIND_RANK only; a pure advanceManagedProductions call with one production and one season participant at equal waits on one slot would test compareSweepKeys.
5. SHOULD-FIX: cheaper RED for item 3: quoteAbsorption (acquisition.ts:275) needs a stable loan-free rival and a fresh disclosure; fill the other D&C slots with crew films, quote a rival with a production needing D&C, expect noCapacity:development-casting (5710f748 answered seated).
6. NOTE: tvSave.ts:180 `Number(/-(\d+)$/.exec(id)?.[1] ?? NaN)` turns a malformed id into NaN and holderBeforeWrite silently becomes "holder at end of week C"; unreachable today (idNumber proved the format) but should fail by name.
7. NOTE: holderBeforeWrite (rights.ts:698-707) ignores estates; harmless while the grantor must be the player.
8. NOTE: save.ts:11057 passes Object.hasOwn(state,'television') where validateSaveP18 passes {television:true}; same result, mirror the era exactly; comment says "V27 policy" but the refusing policy was rights-p16.
9. NOTE: liveRetirementWriting.ts:21-25 still turns any proof failure into 'rejected' with no reason (the mechanism that hid P18-04); carry the message.
10. NOTE: lane-only values: identity 8bd45eec… (bridge-contract-generator :586/:589, p14b5 :424), roster digests e8e0e202… (p14p4p5 :545) and 13adc010… (p14r2r3 :214), F10/F11 body hashes, hand-written project-studio-bridge.schema.json. Prior identity 58938086… is genuine (in both manifests; fixture and receipt committed).
11. NOTE: case 10 ledger pins hold only if no contract ends inside [C, C+20): tick overhead counts state.contracts.length (tick.ts:1112) while the quote counts contracts with endWeekExclusive > w; a divergence would be a real quote finding.
12. NOTE: case 23 half RED (version pin), absence half control by design; repair-refusal route exists (clone, lower condition, repairSetRefusal); StudioCalendar.tsx:213 still maps unknown owners to 'production'.

## Checked clean
Allocator sweep (greenlight actions.ts:601-616, casting :2693, scripts :2208/:2324/:2485, tick sweep tick.ts:379, productionQueue, technologyProduction, queueAdmission; rival sites use rival facilities; continued-scripts replay reads stored occupiedSlots). scriptCapacityView consumers gate production lookups on owner === 'production'. Period summary optional key safe. Prior registry and the outgoing65/66 cases pinned from the fixture with the version-only lift asserted.

## Per-item (review items 1-12)
1 FIXED (save.ts:11057; REDs in commission and work files). 2 FIXED (studioHistory.ts:69, tvTypes.ts:167 TvReceiptDraft). 3 PARTIAL (code fixed acquisition.ts:205-207, continuedScripts.ts:407-409; no RED). 4 FIXED (rights.ts:698-707, :1298-1301; tvSave.ts:179-183; tenth forgery). 5 FIXED (tvSave.ts:128-132, no RED, disclosed). 6 FIXED (tvCommission.ts:118-137, :259-261; three refusals). 7 FIXED. 8 FIXED (bridge-runtime-checkpoint.test.ts:1228-1231). 9 FIXED. 10 PARTIAL (scriptReview vocabulary, rail bucket). 11 FIXED (disclosure). 12 PARTIAL (strike refusal, placement engagement, constant pin added; stage block, live contest, acquisition, repair not reached).
