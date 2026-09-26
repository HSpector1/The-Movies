# 815 — P14C.2b independent source review (contract-auditor), persisted by the parent

Candidate: HEAD `b4b47070`, production source identical to `25e8fc11` (the implementation `8cf6bed2` plus the
follow-up), scaffold base `ddd88d3c`. Reviewer: the contract-auditor role contract run through a general-purpose
agent (roles not registered), model Sonnet, read-only. Brief: the parent's scratchpad `c2b-source-review-brief.md`
(checks A–J against 806 FINAL, 780 §5/§6, and 777/782/793 where touched). Returned 2026-09-26 about 04:57 CEST.

## The reviewer's report, verbatim

TOOL SET: Read only (no Bash/Edit/Write/git). Glob and Grep were NOT in my toolset (confirmed: Glob call errored "no such tool"; Grep never appeared). Per the brief, I read every cited file in full (as 798 did), including reading all ~9971 lines of save.ts across multiple calls, and used offset guessing (no directory listing) to locate evidence files — 782 (C.4 task expansion) could not be located this way and was NOT read; all its content I needed was covered by 793/798 citations instead.

VERDICT: KEEP

A. Tick order — MET. careerLifecycle.ts:250-252 (intent then settlement), tick.ts:1156 (`advanceLifecycleSettlement(advanceTalentMarketWeek(advanceLifecycleIntent(...)))`). Intent writes `effectiveWeek >= w+52` (careerLifecycle.ts:202); settlement reads `effectiveWeek <= w` (careerLifecycle.ts:229).
B. Discovery — MET. talentMarket.ts:1320-1328 (announced+unused+`w===E-12`+employment row in force), dedupe on (contractId,variant) at :1311/:1326. `readExtensionUsed` throw at careerLifecycle.ts:377-384 names the person; cannot fire on a migrated state since `convertV35ToV36` (save.ts:9921-9936) stamps `extensionUsed:false` on every record.
C. Eligibility/proposal — MET. marketEligibility talentMarket.ts:84-105; submitProposal narrowing + term rule (`decisionWeek+termWeeks===effectiveWeek+52`) at :424-441; attachPromise refusal promises.ts:511-515; authorRivalPromise skip talentMarket.ts:1401-1402.
D. Freeze — MET. Cap admits only extensionAdmitted() talentMarket.ts:1643-1648/:1143-1144; belowRetirementReservation after belowAsk, iround, equality accepts :1169-1172; every other predicate (trust/Nemeses/seat/startWeek/digest) unchanged, same function.
E. Accept order — MET. settleCase talentMarket.ts:1236-1242: commitRetirementExtension → commit(Player/Rival)Winner → closeCase, no try/catch (no partial write-back).
F. Rival — MET. talentMarket.ts:1341-1352 (subject-only), term=E+52-decisionWeek, extensionTier() :1657-1660 (lowest ≥1.10, undefined→no proposal), no rivalProposalTrigger, no promise.
G. Pricing — MET. employment.ts:279-282 (largest catalogue term ≤ term). tests/p14c2a-consumers.test.ts B1(line 73)/B2(line 89) do price 110 weeks; CONTRACT_LENGTH_FACTOR[104]=1.0 (tuning.ts:384) equals old `??1.0` fallback — confirmed unchanged, no regression.
H. Save V36 — MET. save.ts:9820-9970 mirrors V35 exactly; validateSaveV36→stripV36Extension→validateSaveV35 (:9903-9917); convertV36ToV35 refuses before envelope validation (:9944-9964, check at :9952 precedes validateSaveV36 call at :9961). Guard/arm count: I sampled ~10 sites (migrateToV20 :9783, V24 :8129, V25 :8358 — full unconditional-throw cascades; migrateToV26/27/28/29/30/31/32 — conditional recursive arms) and found the "36" (and "35") case correctly added at every site checked, none missing. I did not individually enumerate all 18+10 the way 798 did — bounded confidence, not exhaustive. convertV27ToV28 confirmed writing its own V28 literal, not calling the live `initialTalentMarket` opener (save.ts:8736-8745, comment: "FROZEN (P14C.2b): the V28 literal, never the live opener") — 811 §4 item 10 confirmed fixed at source.
I. Presentation — MET except one open cosmetic gap. bridge/market.ts caseEntries excludes (:81), people.ts marketAttentionRows/marketCaseProjection exclude (:927/:973), world.ts personWorldRoute excludes (:63), bridge/promises.ts promiseRowsFor excludes (:85), industry.ts pulseSettlementFold excludes (:204-206), contract.ts renewalRefusal/marketProposalQuoteSnapshot reworded (:140-148/:565-568). Could NOT verify "ui/src holds no case reader" or "Projection 50 unmoved" (no grep/dir listing). MINOR DEFECT (disclosed, unfixed): `contractTermLabel` (contract.ts:74-77) only special-cases exactly 1 year; a live open extension quote at a non-catalogue term (e.g. 58 weeks) still reaches it via marketProposalQuoteSnapshot (contract.ts:567) and would print "1.1153846153846154 years" — 811 §6 item 2 flags this as an open risk but it is not fixed.
J. Invented/missing — none found beyond the disclosed 811 §4 items.

811 §4 (1-11): all ACCEPTABLE. (1) iround reservation fix — sound. (2) §5/§8.1 tier resolved, agree under (1). (3) openMarketCaseFor optional week param — harmless, matches sibling readers. (4) chooser bypass for one-issuer case — correct, CANDIDATE wording only. (5) bridge exclusion scope — under-scoped in first pass, corrected in follow-up (world/promises/contract/industry all now excluded/reworded). (6) named consumer gaps — all resolved in follow-up. (7) discovery via hollywood.employment only — reasoned, disclosed limit (extension only reachable via bridge when D=E). (8) inequality vs strict equality for "announced at openedWeek" — matches save.ts validator (:9873-9876). (9) superseded by follow-up's fail-loud throw. (10) frozen-conversion/live-opener fix — confirmed at source (H above). (11) commitRetirementExtension preconditions — defensive, confirmed careerLifecycle.ts:401-408.

DEFECTS RANKED: only one, minor/cosmetic — item I's contractTermLabel non-catalogue-term formatting, governing requirement 806 §6/consumers-presentation quality; disclosed by the writer as an open risk, not silently introduced.

NOT VERIFIED: exhaustive 18+10 guard/arm count (sampled only); "ui/src holds no case reader"; "Projection 50 stays unmoved" (no PROJECTION_VERSION constant read); record 782 (C.4 task expansion) itself — filename not locatable without Glob/Grep, substituted its cited content via 793/798.

## Parent addendum: the three NOT VERIFIED items, closed by shell at `5a287ca4` (production source unchanged)

1. **Guards and arms, exhaustive.** `grep -cE '=== 35\) throw'` = 18 and `'=== 36\) throw'` = 18. `'=== 35\) return'`
   lists 11 lines, and each has a `36` sibling on the adjacent line (dispatch `save.ts:5368/5369`; downgrade arms
   `:8529/8530, 8686/8687, 8774/8775, 8878/8879, 8929/8930, 9009/9010, 9099/9100, 9354/9355, 9569/9570,
   9754/9755`). The twelfth `36` arm is `migrateToV36`'s own (`:9968`). None is missing.
2. **`ui/src` holds no case reader.** `grep -rnE "talentMarket\b|\.cases\b|retirementExtension|marketCase" ui/src`
   (non-test files) returns nothing.
3. **Projection 50 unmoved.** `bridge/schema/bridge-schema.ts:269` `PROJECTION_VERSION = 50`; `git status
   --porcelain generated/` is empty.

The one defect (the non-catalogue term label) was sent to the writer as Follow-up 2 before the matched pass;
see 811.
