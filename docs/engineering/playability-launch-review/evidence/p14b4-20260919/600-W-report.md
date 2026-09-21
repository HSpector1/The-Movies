# 600-W — ONE production writer, coordinated P14B.4 core/save/runtime/wire cutover

Worktree /Users/zacheryspector/The-Movies-headless-program, branch wip/headless-program-20260916-ts,
HEAD c9ed1fc437d4a8e166bfc82379c513a99f7bb3cf (tree clean at start). No commit/stash/checkout/add.
Scratchpad S = /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad.
Every command run strictly one at a time; full outputs tee'd to S/600-W-<STEP>-<check>.log.

## S1 — core (src/core/types.ts, src/core/promises.ts)

Files + hunks (post-edit line numbers):
- src/core/types.ts :2231-2234 — comment rewritten; `ProfessionalPromise = ProfessionalPromiseV30`, `GameState = GameStateV30`.
- src/core/promises.ts
  - :32-35 import gains `CastRoleCountPredicate` (S1.2).
  - :39-45 `PROMISE_RULES_VERSION = 4` with the doc line naming the law and evaluator 5 as later (S1.7).
  - :192-208 `export type PromisePredicate = { count: number } | CastRoleCountPredicate`; `PromiseDraft.predicate: PromisePredicate` (S1.2).
  - :211-217 `NOT_OFFERED_IN_B1`: ONLY the P2 line deleted; two-line doc note above; P3–P5 lines byte-identical (S1.5).
  - :268-282 `seatedPreFirstTake(state, studioId, personId, slots)` — mask parameter; recorded-take exclusion unchanged (S1.4).
  - :340-341 inputs digest: `...('kind' in draft.predicate ? [[draft.predicate.kind, draft.predicate.seatClass]] : [])` appended at the END of the tuple, only when tagged (S1.6).
  - :354 `expectedFirstTakeWeek` passes `promiseCastSlots(draft)` (S1.4).
  - :390-398 two shape refusals immediately after the `notOffered` check, before the numeric/window checks (S1.5).
  - :424 `existingPath` passes `promiseCastSlots(draft)` (S1.4); :429-434 buffer test `reserved + X > nMax - promiseBuffer(nMax)` (S1.5, R2/C12); :421-422 IMPOSSIBLE bounds unchanged.
  - :464-469 `PromiseAttachment.predicate: PromisePredicate` (S1.2).
  - :508-514 attach-time throw for a tagged non-P2 draft, after the at-most-one refusal and BEFORE feasibility (S1.3).
  - :525-551 root mint: `base` + two typed branches (tagged → family literal P2 + full detached `{kind,count,seatClass}`; count-only → `{count}`); `version: PROMISE_RULES_VERSION` (S1.3, 600-B REFINE).
  - :615-624 `type PromiseSettlement = Partial<Pick<ProfessionalPromise, 'progress'|'evidenceRefs'|'outcome'|'outcomeCause'|'outcomeEventId'>>`; `settle(..., next: PromiseSettlement, ...)` (S1.8).
  Untouched: promiseDigest/attachedPromiseDigest/proposalDigest, promiseCastSlots/qualifyingTakes, advancePromisesWeek, breakPromisesOnTermination/OnCancel, both validator branches, projectPromisesPreV29, trust, promiseBuffer/slack/loop bound.

Refusal sentences chosen (C11 meanings kept):
- classless P2 at quote/freeze (replaces ONLY the deleted P2 NOT_OFFERED line; classification IMPOSSIBLE as before):
  `a seat-class promise needs its seat class selected (lead, or lead-or-antagonist); without one it is not offered`
  (deviation from the note's `... ; count-only P2 is not offered`: plain-English per 600-B Q11 REFINE; same meaning).
- tagged non-P2 read refusal: `a selected seat class applies only to a seat-class promise` (note wording).
- attach-time throw: `promises: a selected seat class is legal only on a LEAD_OR_SIGNIFICANT_ROLE_COUNT promise, not "<family>"` (note wording).

Self-checks (exact commands; logs in S):
1. `npm run typecheck` → exit 0, clean. S/600-W-S1-typecheck.log
2. `npm run typecheck:bridge` → exit 0, clean (the OLD TS2353 at tests/bridge-p14b4-cast-class.test.ts:364 cleared; nothing new). S/600-W-S1-typecheck-bridge.log
3. `node_modules/.bin/vitest run --project core tests/p14bf2-acting-discipline.test.ts tests/p14b3-rule-revision.test.ts` → 13/13 + 6/6 PASS (19 passed). S/600-W-S1-bf2-b3.log
4. `node_modules/.bin/vitest run --project core tests/p14b4-cast-class-capacity.test.ts tests/p14b4-cast-class-capacity-evaluator5.test.ts` → 14 failed | 1 passed | 1 todo. PASS: "class changes material and feasibility digests…". The 13 other live cases stop at `validateSaveV29: state.promises[n].predicate.kind is not a field of this record` (lines :241 ×6, :257, :306 ×2, :319, :350 ×3); the evaluator-5 case stops at the same V29 refusal (evaluator5.test.ts:238). Exactly C1. S/600-W-S1-capacity.log
5. `node_modules/.bin/vitest run --project core tests/p14b4-material-evidence-core.test.ts tests/p14b4-d3-matching.test.ts` → 17 + 8 PASS (25). S/600-W-S1-material-d3.log
6. `node_modules/.bin/vitest run --project core tests/p14b1-promises.test.ts` → 15/15 PASS. S/600-W-S1-b1-promises.log

Movements observed: none (no classification, bottleneck, winner, digest or count outside the expected set).
Cumulative patch: S/600-W-cum-S1.patch (11538 bytes); status S/600-W-status-S1.txt (`M src/core/promises.ts`, `M src/core/types.ts`; no untracked files).

## S3 — save (src/core/save.ts, src/core/index.ts, src/harness/p14/legacy-v28-fixtures.ts)

Files + hunks:
- src/core/save.ts :497-498 `SaveFileV30` doc comment refreshed (no longer "Live gameplay remains V29"); :6396 `LIVE_SAVE_VERSION = 30 as const`; :6398-6405 `makeSave(state): SaveFileV30` via `validateSaveV30({ saveVersion: 30, … })`, validation-before-detachment unchanged; :8712-8713 `migrateToV30` doc comment refreshed (now the live load-to-play route). `validateSaveV29`, converters, `migrateToV29`, `validateSaveV30`, dispatch and the downgrade refusals untouched.
- src/core/index.ts :1292 comment only ("P14B.4 — live V29 → NEW V30 + migrateToV30 …").
- src/harness/p14/legacy-v28-fixtures.ts :25 import adds `SaveFileV30`; :40 `emit(... save: SaveFileV28 | SaveFileV29 | SaveFileV30 ...)` — exactly two type-only lines; header :13-17 and guard :47 byte-identical (C7).

Self-checks:
1. `npm run typecheck` → exit 2; diagnostics ONLY: tests/contracts/cross-owner-refusal.contract.test.ts(73,3), tests/contracts/determinism-floor.contract.test.ts(125,12), tests/contracts/phase-table-agreement.contract.test.ts(105,3), tests/legacy-parcel-ground.test.ts(356,5), tests/save.test.ts(232,3) — all TS2322 `SaveFileV30` not assignable to `SaveFileV29`; every line inside the C2 ranges; nothing in src/ui/bridge. Full output S/600-W-S3-typecheck.log. Because `&&` short-circuits the ui half, ALSO ran `node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` → exit 0 clean (S/600-W-S3-typecheck-ui-half.log).
2. `npm run typecheck:bridge` → exit 0 clean. S/600-W-S3-typecheck-bridge.log
3. `node_modules/.bin/vitest run --project core tests/p14b4-save-v30-compatibility.test.ts` → 36/36 PASS. S/600-W-S3-save-v30.log
4. `node_modules/.bin/vitest run --project core tests/p14b4-cast-class-capacity.test.ts tests/p14b4-cast-class-capacity-evaluator5.test.ts` → live 14/14 PASS; evaluator-5 case RED at :239 (`expected 'FRAGILE' to be 'IMPOSSIBLE'`); 1 todo. Exactly as expected. S/600-W-S3-capacity.log
5. `node_modules/.bin/vitest run --project core tests/p14b4-cast-class-outcomes.test.ts` → 13 passed | 10 failed (23). Nine rival cases stop at `rivalWorlds()` "UNEXECUTED natural rival prerequisites absent by350" (:346, :364 ×6, :374, :395) — expected until S2 + natural occurrence. The tenth, "two genuinely bound beneficiaries share one completed take but receive DISTINCT own outcome receipts exactly once", stops at :438 `UNEXECUTED prerequisite: actual second bound OPEN beneficiary is not in antagonist; never invent a binding`. Cause (verified by reading the fixture bytes, not by any hunk of mine): `playerPayload` seats the FIRST available non-beneficiary actor in antagonist; in `genuine-v29-bound-open-p1` the available actors in contract order are t-act-12, t-act-13, t-act-09, t-act-08, so antagonist = t-act-12 while the fixture's second bound OPEN beneficiary is t-act-08 (promise-1). No feasibility read, promise evaluator or save law is on that path (player stock greenlight + fixture contract order). Natural-premise/fixture finding for the test-author (600-A §4.1 G6 "with fixture prerequisites"); not fixed, no test touched. S/600-W-S3-outcomes.log

Movements observed: none beyond the :438 fixture-premise miss above.
Cumulative patch: S/600-W-cum-S3.patch; status S/600-W-status-S3.txt (5 modified tracked files; no untracked).

## S4 — load/runtime (bridge/session.ts, bridge/runtime/campaign-library.ts, ui/src/engine/adapter.ts, src/harness/d16/run-d17b-*.ts, bridge/runtime-checkpoint.ts)

Files + hunks (token moves `migrateToV29` → `migrateToV30`, `SaveFileV29` → `SaveFileV30`):
- bridge/session.ts :41 import; :136 `migrateToV30(save).state`.
- bridge/runtime/campaign-library.ts :5 import; :48; :127.
- ui/src/engine/adapter.ts :112 import; :3796 normal arm; :3808 V2 arm; :3822 V1 arm.
- src/harness/d16/run-d17b-continuation.ts :37, :183; src/harness/d16/run-d17b-week86.ts :35, :124 (C6).
- bridge/runtime-checkpoint.ts :6-7 import (`migrateToV30`, `type SaveFileV30`); :439 `type CurrentEnvelopeSave = SaveFileV30`; :454-458 strict `!== 30` with messages "must be a current V30 save, received V…" and "must preserve the canonical V30 save bytes exactly"; :843-846 `SaveFileV30['state']`, `let migrated: SaveFileV30`, `migrateToV30(importSave(json))`; :992 R05 annotation `SaveFileV30['state']` (type only; guard not widened). Registry line NOT added here (C3 → S5).

Self-checks:
1. `npm run typecheck` → exit 2; same five root residuals as S3 (cross-owner-refusal :73, determinism-floor :125, phase-table-agreement :105, legacy-parcel-ground :356, save.test :232); nothing new; nothing in src/ui/bridge. S/600-W-S4-typecheck.log. UI half separately: `node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` → exit 0 (S/600-W-S4-typecheck-ui-half.log).
2. `npm run typecheck:bridge` → exit 2; ONLY tests/bridge-p06-checkpoint-recovery.test.ts(167,50) and (174,50) TS2345 `SaveFileV30` → `SaveFileV29` parameter. Exactly C2. S/600-W-S4-typecheck-bridge.log
3. `node_modules/.bin/vitest run --project core tests/bridge-p14b4-cast-class.test.ts` → 12 passed | 16 failed (28). `base()` passes (every session case reaches its first envelope). G1 "accepts explicit lead/leadOrAntagonist" RED at :147 (46 grammar refuses `seatClass`); G2 "P2 missing class" RED at :158 (46 grammar still accepts classless P2); the eleven BAD_PROMISES refusals + ":165 keeps no-promise…" PASS; the session cases stop at the 46 grammar `$.draft.promise.seatClass: additional properties are not allowed` (:182, :219, :234, :283, :306 ×2, :357, :421 ×2); :266 `expected 'IMPOSSIBLE' to be 'REASONABLY_ACHIEVABLE'` (contract.ts still converts count-only P2 until S5 → classless refusal); G8 :387 and :409 ×2 RED (fields absent until S5). All expected at S4. S/600-W-S4-bridge-cast-class.log

Movements observed: none.
Cumulative patch: S/600-W-cum-S4.patch; status S/600-W-status-S4.txt (11 modified tracked files; no untracked).

## S2 — policy (src/core/talentMarket.ts, authorRivalPromise ONLY; disclosure hunks deferred to S5 per C4)

Files + hunks:
- src/core/talentMarket.ts :37 `import type { PromiseAttachment } from './promises.js'` (new line, type-only); :1253-1294 `authorRivalPromise` doc block rewritten (delegated hypothesis named) and body: `window`, `p1` (APPEARANCE_COUNT/count 1), `flexible` (LEAD_OR_SIGNIFICANT_ROLE_COUNT, `{kind:'castRoleCount', count:1, seatClass:'leadOrAntagonist'}`), loop `isProven(state, talentId) ? [p1] : [flexible, p1]`, each read on the SAME unchanged state via `promiseFeasibility`, `attachPromise` on the first REASONABLY_ACHIEVABLE, else `return state`. Read draft keys exactly {family, predicate, issuerStudioId, beneficiaryPersonId, startWeek, termWeeks, windowStartWeek, dueWeekExclusive}; attach draft exactly {family, predicate, windowStartWeek, dueWeekExclusive}. No RNG, no count escalation, no lead-only selection. `isProven` :680 reused unchanged.

Self-checks:
1. `npm run typecheck` → exit 2; same five root residuals as S3/S4, nothing new. S/600-W-S2-typecheck.log; UI half `node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` → exit 0 (S/600-W-S2-typecheck-ui-half.log).
2. `node_modules/.bin/vitest run --project core tests/p14b4-cast-class-policy.test.ts` → 6 passed | 1 failed (7). The G9 case "observes flexible-first, actual P1 fallback, proven P1, and a genuine zero-attachment refusal without extra RNG" ran the full 220-tick natural search with EVERY in-loop assertion passing (read/attach draft shapes, same-state reads, receipt identity, root shape) and stopped ONLY at the final witness set :529: `expected [ 'flexibleP2', 'neither', 'provenP1' ] to deeply equal [ 'P1fallback', 'flexibleP2', 'neither', 'provenP1' ]`. Missing natural witness: `P1fallback` (an unproven person whose FLEX read is not ACHIEVABLE while P1 is — needs e.g. a support seat on a running rival picture with no rival Ready script; 600-A §4.1 G9 / 600-B Q6(c) "plausible, UNVERIFIED"). Fixture finding for the test-author; not fixed. S/600-W-S2-policy.log
3. `node_modules/.bin/vitest run --project core tests/p14b4-d3-matching.test.ts` → 8/8 PASS. S/600-W-S2-d3.log

Movements observed: none beyond the missing G9 witness above.
Cumulative patch: S/600-W-cum-S2.patch; status S/600-W-status-S2.txt (12 modified tracked files; no untracked).

## S5 — wire (bridge/schema/bridge-schema.ts, bridge/promises.ts, bridge/contract.ts, bridge/people.ts, src/core/talentMarket.ts disclosure, bridge/runtime-checkpoint.ts registry, generator run)

Files + hunks:
- bridge/schema/bridge-schema.ts :221-233 projection-47 header paragraph + `PROJECTION_VERSION = 47 as const`; :1765-1792 `PROMISE_SEAT_CLASSES`, `COUNT_ONLY_PROMISE_FAMILIES`, `promiseDraftTerms`, `StudioMarketProposalCastClassPromiseDraftPayload` (family literal P2 + REQUIRED `seatClass` enum), `StudioMarketProposalCountPromiseDraftPayload` (four count-only families), `StudioMarketProposalPromiseDraftPayload = union(...)` (name kept, so :1802 `promise: optional(reference(...))` and the exported TS type are unchanged); :2253-2256 `StudioMarketPromiseSnapshot.seatClass: nullable(enum)`; :2266-2268 `StudioMarketPromiseHistoryRow.seatClass: nullable(enum)`; :2325-2328 `StudioMarketPreferencesSnapshot.preferredOpportunity: enumeration(['significantCastRole','anyCastAppearance'])`; :3301-3302 definitions entries for the two members. `PROMISE_FAMILIES` unchanged for snapshot/history rows; undisclosed row untouched.
- bridge/promises.ts :22-29 imports (`PromiseAttachment` type, `BridgeMarketProposalPromiseDraftPayload`; `PromiseFamily` import dropped as unused); :41-59 `WirePromiseDraft`, `corePredicateOf` (the ONE wire→core conversion), `PromiseQuoteDraft = WirePromiseDraft & { startWeek; termWeeks }`; :108 `promiseHistoryFor` row `seatClass: 'kind' in promise.predicate ? promise.predicate.seatClass : null`; :136 `promiseQuoteSnapshot` `predicate: corePredicateOf(draft)`.
- bridge/contract.ts :51-52 imports (`corePredicateOf`, `WirePromiseDraft`; `PromiseFamily` import dropped as unused); :335-339 `MarketPromiseDraft = WirePromiseDraft`; :467 attach `predicate: corePredicateOf(draft.promise)`. `copyMarketProposalDraft`/`playerProposalDraft` unchanged (already spread the nested draft).
- bridge/people.ts :42 import `publicPreferredOpportunity`; :989-990 `preferredOpportunity: publicPreferredOpportunity(state, talentId)` on the one preferences emitter (`line` unchanged).
- src/core/talentMarket.ts :461-464 `DisclosedPromise.seatClass: 'lead' | 'leadOrAntagonist' | null`; :547 `disclosedPromise` sets it from the stored shape (C4).
- bridge/runtime-checkpoint.ts :60-63 registry entry `['sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c', 'projection-v46']` with a three-line comment in the registry's style (C3; 35 entries).
- Generator (R4, ONCE, no `--unity-project`): `npm run generate:bridge-contract` rewrote exactly bridge/schema/project-studio-bridge.schema.json, generated/unity/StudioBridgeDtos.Generated.cs, generated/unity/project-studio-bridge.contract-manifest.json (S/600-W-S5-generate.log; before/after hashes S/600-W-S5-generated-before.sha / -after.sha). Manifest: schemaId `sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538`, projectionVersion 47, protocolVersion 4, generatorSourceSha256 `17da544bbdfb404c07668e45f47677ab217bf082ca7cf84359eae156df1fc148`, typescriptGeneratedContractSha256 `5df92d48e231e6e2dcd53534f7789c5b55925a36e6d49096b907d25f0e6bb2c0`. Generated C# shape as predicted: `abstract partial class StudioMarketProposalPromiseDraftPayload` (:6667) with sealed `…CastClassPromiseDraftPayload` (:6570) and `…CountPromiseDraftPayload` (:6607) members and `StudioMarketProposalPromiseDraftPayloadJsonConverter` (:9887) registered at :283 — Unity backlog (abstract base + converter).

Self-checks (order run):
1. `npm run typecheck:bridge` → exit 2; residuals: tests/bridge-p06-checkpoint-recovery.test.ts(167,50),(174,50) [C2] PLUS ONE NEW test-side diagnostic: `tests/bridge-p14b3-promise-command.test.ts(155,47): error TS2322: Type '"LEAD_OR_SIGNIFICANT_ROLE_COUNT"' is not assignable to type '"APPEARANCE_COUNT" | "DIRECTING_COUNT" | "PREFERRED_GENRE_OPPORTUNITY" | "SPECIFIC_PROJECT"'`. MOVEMENT (reported, not fixed): that B3 test builds a "refused variant" classless P2 `{ ...base.promise!, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' }` typed as the wire payload; under the projection-47 closed union a classless P2 is not a wire shape (600-A S5.1 / 600-B Q4: G2 → INVALID_COMMAND), so the type error is the law stated at the type level. It is inherent to the reviewed design (S5.4 `MarketPromiseDraft = WirePromiseDraft`, which the RED :196 narrowing requires), not to a spelling choice; 600-B listed "no additional bridge-tsc diagnostic" as NOT VERIFIED. Test-author moved premise (the file is already in the 600-A §4.2 sweep list). Nothing in src/ui/bridge. S/600-W-S5-typecheck-bridge.log
2. `npm run typecheck` → exit 2; same five root residuals as S3/S4/S2; nothing new. S/600-W-S5-typecheck.log; UI half `node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` → exit 0 (S/600-W-S5-typecheck-ui-half.log).
3. `npm run generate:bridge-contract` → exit 0 (above).
4. `npm run check:bridge-contract` → exit 0, three artifacts verified. S/600-W-S5-check-bridge-contract.log
5. `npm run check:bridge-contract:fixtures` → exit 0, generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs verified unchanged; `git status` shows nothing under tests/. S/600-W-S5-check-bridge-contract-fixtures.log
6. `node_modules/.bin/vitest run --project core tests/bridge-p14b4-cast-class.test.ts` → 28/28 PASS (the natural premise "player wins t-act-09 at 52" held in both quote→binding→termination cases). S/600-W-S5-bridge-cast-class.log
7. `node_modules/.bin/vitest run --project core tests/bridge-p14b4-runtime47-compatibility.test.ts` → 6/6 PASS. S/600-W-S5-runtime47.log
8. `node_modules/.bin/vitest run --project core tests/bridge-contract-generator.test.ts` → 2 failed | 29 passed (31): EXACTLY "F10 emits sound request and response union shapes without changing schema identity" at :555 (projection-46 identity pin `584bdd…`) and "pins exact positive output identities and deterministic rerendering" at :665 (the F10/F11 declaration-hash pins :656-657, `9edf6d…` → actual `53058c23075427647bf9e24052128cd4f7ad0…`). Test-author repins. Nothing else. S/600-W-S5-generator-test.log
9. `node_modules/.bin/vitest run --project core tests/bridge-contract-consumer-lock.test.ts` → 77/77 PASS. S/600-W-S5-consumer-lock.log
(Bridge test files run under the `core` vitest project: vitest.workspace.ts includes `tests/**/*.test.ts` there; `npm run test:bridge` would additionally run the two contract checks first. Command used: `node_modules/.bin/vitest run --project core <file>`.)

Movements observed at S5: the one new bridge-tsc diagnostic above. No classification, winner, digest or count movement.
Cumulative patch: S/600-W-cum-S5.patch; status S/600-W-status-S5.txt (19 modified tracked files incl. the generator's three; no untracked files).

## Cumulative patches (git diff HEAD --binary, from c9ed1fc4)

| Patch | Bytes | SHA256 |
|---|---:|---|
| 600-W-cum-S1.patch | 11538 | 28eebc7252bf3b668bd3a73d7d64459be5c8bdf5caa7795076c11798d6187e26 |
| 600-W-cum-S3.patch | 16081 | be396dba16186a0b0859b997fcce52aef9ac74cb7014ac5cb4f87e6b0439bb1d |
| 600-W-cum-S4.patch | 26526 | 02859a7938f4796fa6d5296aa810bb9d4c04d497d9470314963a3cdf88544132 |
| 600-W-cum-S2.patch | 30923 | a53586bc47f0c9a1f9055cbd62629f9196d03fd01fed12c4423afd7d32ef5bc3 |
| 600-W-cum-S5.patch | 514197 | fee048b5b1d42e1142d5508637aee10cb5980f38804ad1f8f92d71af09c74b43 |

Order of application: S1 → S3 → S4 → S2 → S5 (each cumulative from HEAD). Final tree: 19 files changed, 590 insertions(+), 211 deletions(-).

## Typecheck residuals observed vs C2
- Root `tsc --noEmit` after S3 and unchanged through S5: cross-owner-refusal.contract.test.ts:73, phase-table-agreement.contract.test.ts:105, determinism-floor.contract.test.ts:125 (no diagnostic at :84 — fewer than the range, inside it), legacy-parcel-ground.test.ts:356, save.test.ts:232. All within C2; nothing outside.
- `tsc -p ui/tsconfig.json`: clean at every step.
- Bridge `tsc` after S4: exactly bridge-p06-checkpoint-recovery.test.ts:167,174 (C2). After S5: those two PLUS bridge-p14b3-promise-command.test.ts:155 (movement above, outside C2's list).

## Evidence limits
- Every count above is from a single serialized vitest run per file on this working tree (not record-check, not fixed-source, not full-suite); no native/Unity run; no Owner-acceptance claim.
- The G9 `P1fallback` witness and the outcomes `:438` antagonist premise are natural-chain/fixture misses observed once; no fixture was decoded beyond the contract-order/focus read in S3.
- The S1–S4-only trees were exercised only by the listed self-checks (C5).
- Nothing committed, stashed, checked out, added or pushed; tests/fixtures/generated untouched except the generator's three artifacts through the generator.
