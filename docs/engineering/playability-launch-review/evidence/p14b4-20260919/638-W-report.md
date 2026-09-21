# 638-W report — text-only doc-comment pass (record 637 NEXT637 (c); 600-R Q2/R-8; 616 R-8; 629-R Q6)

Status: DONE. Worktree /Users/zacheryspector/The-Movies-headless-program, HEAD 438f302a (clean at start).
Git read-only (log/show/diff/status only; git auto-gc printed background "Auto packing" notices during `git log -S`, no ref or index change by me).
Nothing executed: no vitest/tsc/npm/node. Comment lines only; no code token, string, assertion, import, fixture or version literal.

Patch: /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/638-W.patch (git diff HEAD -- src/, 52 lines, sha256 prefix 456a099e448f5c4f).
`git diff HEAD --stat`: src/core/promiseCapacityOwners.ts 16 (+11/-5), src/core/promises.ts 14 (+10/-4); 2 files, 21 insertions, 9 deletions.
`git diff HEAD -U0 | grep '^[-+]' | grep -v '^[-+][-+]' | grep -Ev '^[-+][[:space:]]*(\*|//|/\*\*)'` -> 0 lines (every changed line is a comment line).

## Change table

### 1. src/core/promiseCapacityOwners.ts :8-12 -> :8-18 (574-R item 1; 600-R Q9 carry / R-8; 616 R-8)
Old (:8-12):
  * NOT in this slice (539 §2): no enumerator over owner alternatives (coverage
  * `existingCalendars`/`allOwnerTraces` stay 'incomplete' with the fixed
  * omission), no live importer (not re-exported from index.ts), no version stamp
  * or receipt fields (`rulesVersion`/`week` are deliberately absent), no
  * Save/projection change, no kernel or producer change.
New (:8-18):
  * Still NOT here after the later slices (539 §2 as they left it): no enumerator
  * in this module — the ENUMERATOR slice (record 555; `promiseCapacityEnumerator.ts`)
  * imports it, runs ONE Started plan through `promiseCapacityOwnerReplay.ts`
  * (bills reduced and re-measured at records 583/597) and hands its certificate
  * to the 5-arity `assembleCapacityInput`, while the 4-arity default
  * (`classifyDetachedOffer`) still carries `existingCalendars`/`allOwnerTraces`
  * 'incomplete' with the fixed omission; no live importer (neither this module
  * nor the enumerator is re-exported from index.ts; the live evaluator 4 of
  * record 600 lives in promises.ts); no version stamp or receipt fields
  * (`rulesVersion`/`week` remain absent from `DetachedOfferClassification`); no
  * Save/projection change; no kernel or producer change from this module.
Reason: the old paragraph described the FIRST slice's fixed coverage as if no enumerator existed; the enumerator slice (record 555/558, qualified 574) now supplies the certificate through this module's 5-arity adapter.
Grep facts each clause rests on:
  - Enumerator imports this module: src/core/promiseCapacityEnumerator.ts:25-28 imports assembleCapacityInput, capacityInputsDigest, collectPromiseClaims, mapCapacityResult, EnumerationCoverage, ProducerResult from './promiseCapacityOwners.js'.
  - ONE Started plan through the replay: enumerator :24 imports replayStartedProductionPlans from './promiseCapacityOwnerReplay.js'; :110-114 calls it with plans: [{ traceKey: 'enumerator:started', commands: [] }]; replay exports at promiseCapacityOwnerReplay.ts:2800 (Started) and :2807 (Ready).
  - Certificate to the 5-arity adapter: enumerator :125 `assembleCapacityInput(claims, domain.producer, claims.horizonEndWeek, limits, domain.enumeration)`; owners :159-160 signature with `enumeration: EnumerationCoverage = NO_ENUMERATION`.
  - 4-arity default still 'incomplete' with the fixed omission: owners :148 `NO_ENUMERATION = { existingCalendars: 'incomplete', allOwnerTraces: 'incomplete', omissions: [NO_ENUMERATOR_OMISSION] }`; :204-207 classifyDetachedOffer calls the 4-arity form.
  - No live importer: `grep -n "promiseCapacityOwners\|promiseCapacityEnumerator\|promiseCapacityOwnerReplay\|promiseCapacityKernel" src/core/index.ts` -> no match; `grep -rn promiseCapacityOwners src/ bridge/ ui/` -> only the enumerator :28; `grep -rn promiseCapacityEnumerator src/ bridge/ ui/` -> no importer.
  - Evaluator 4 lives in promises.ts: promises.ts :434 "Evaluator 4 (record 600): active reservations are subtracted ..." inside promiseFeasibility.
  - rulesVersion/week absent: owners :67-77 DetachedOfferClassification has classification/bottleneck/inputsDigest/kernel only; `grep -n "rulesVersion\|\bweek\b"` in owners hits only comments (:11, :51, :67), the HORIZON_GUARD string (:28) and Boundary.week (:98, :115), never a result field.
  - Never runs a producer (kept :5-6): `grep -n "replayStartedProductionPlans\|replayReadyProductionPlans\|promiseCapacityOwnerReplay" src/core/promiseCapacityOwners.ts` -> no match.
  - Records 583/597: 583-bill-reductions-implementation.md (replay C6+C7 bill reductions on promiseCapacityOwnerReplay.ts ONLY); 597-post-*-probe.* are the re-measurement probe captures.
Lines :1-7 kept: every clause still true (collects claims :90, assembles :159, digests :183, maps :188; no producer import; no cash/RNG/history read in the module).

### 2. src/core/promises.ts :449-452 -> :449-458 (629-R Q6 item 1)
Old (:449-452):
  /** Re-classification of an ALREADY-MINTED promise against committed state — the
   * freeze step (§2.1.8) and the studio-caused-event step (§4.4) share it. The
   * window itself is the interval: a live promise no longer asks whether it fits
   * inside a contract it already rode in on. */
New (:449-458):
  /** Re-classification of an ALREADY-MINTED promise against committed state
   * through `promiseFeasibility`. The window itself is the interval: a live
   * promise no longer asks whether it fits inside a contract it already rode in
   * on. History: p14b1's §4.4 studio-caused-event step (`breakPromisesOnCancel`)
   * broke a promise on this read's IMPOSSIBLE; since record 630 that seam judges
   * by `targetSpecificImpossibility` instead. The §2.1.8 freeze step never used
   * it: talentMarket's own `attachedFeasibility` reads `promiseFeasibility` over
   * the PROPOSAL's interval. No production caller remains (grep src/ bridge/ ui/);
   * the export stays for index.ts and the RED's premises
   * (tests/p14b4-cancel-causal-proof.test.ts). */
Reason: the doc claimed two production callers share the function; neither does now. Signature (:459) and body (:460-471) byte-identical (the -U0 diff touches only the four doc lines).
Grep facts:
  - Callers: `grep -rn reclassifyPromise src/ bridge/ ui/ tests/` -> src/core/promises.ts:453 (definition), src/core/index.ts:1401 (export), tests/p14b4-cancel-causal-proof.test.ts (:10, :38, :71 import, :96, and 13 expect sites :327-711). No other production site.
  - Cancel seam: promises.ts :779 breakPromisesOnCancel calls targetSpecificImpossibility (:788); targetSpecificImpossibility defined :661 (doc :641-660 "the SEPARATE target-specific physical proof ... the cancel seam"). History: `git log -S reclassifyPromise -- src/core/promises.ts` -> c5a2ecd (629-W S1, record 630: caller removed) and 8bb5738 (p14b1 T2: added; `git show 8bb5738:src/core/promises.ts` :595 was the only caller, inside the cancel step).
  - Freeze step: talentMarket.ts :761 `function attachedFeasibility(...)` calls promiseFeasibility with the proposal's startWeek/termWeeks (:773-774); used at :805 (bandsFor D3, "still REASONABLY ACHIEVABLE at freeze") and :1127 (§2.1.8 settlement freeze predicate). `git log -S reclassifyPromise -- src/core/talentMarket.ts` -> empty: the freeze step never called reclassifyPromise, so the old "share it" clause was inaccurate about the freeze path as well as stale about the cancel path.

### 3. src/core/promises.ts :90 — NOT touched (record-only)
`throw new Error('promises: the Save V29 roots are missing — migrate this state to V29 before acting on it')` is a thrown STRING inside requirePromiseRoots (:88-92). Left byte-identical per the text-only rule; 600-R Q9 already classifies it as imprecise, not wrong (the V29 roots are still the roots). Any change is a code-token change for a later writer release with its own RED.

## Items on the list found accurate as written
None left unchanged on the list except item 3 (out of scope by rule). All of :1-7 in the owners header verified true and kept.

## Evidence limits
- Nothing run. Correctness of the comment text rests on the greps above and the read source at HEAD 438f302a; the parent's typecheck under record-check is the only executed check.
- Record numbers 583/597 are cited as the parent named them; 583's title confirms the replay bill reductions, 597's artifacts are probe captures (no 597 .md narrative was read).
- Line numbers cited in this report are pre-edit for the old text and post-edit for the new text; the owners header grew by 6 lines (:14 import is now :20) and the promises.ts doc by 6 lines (reclassifyPromise definition :453 is now :459), so any line-pinned record referring to later lines in these two files shifts by +6.
