# 540 — RED installed: detached owner-adapter first slice (T1)

2026-09-20. Claude Code parent. The test-author authored the requirement-based RED for the slice
adopted in record 539 (§1 design, §3 brief). ONE new file, nothing else changed:
`tests/p14b4-owner-adapter-first-slice.test.ts`, SHA256
`07d1ad47d916df9b61524028b9c2a3496e9fd882be8b69f72f74751e85cf754b`, 781 lines. The module
under test (`src/core/promiseCapacityOwners.ts`) does not exist yet, and `promiseCastSlots` /
`qualifyingTakes` are still module-private in `promises.ts`; the file is RED for exactly that
reason and says so.

## Identity

- Parent run under `record-check.mjs`: `540-owner-adapter-red.{txt,json,patch}`; HEAD
  `3c870039bb779a88640b77e47ba085694e50b15d` (docs only since `69d16f8`; source identical);
  protected capture = the untracked RED file only (`testedDiffSha256`
  `54068e05e39fc6d0397f91149c2b72852b96ae60ed0ad71a1a6459bdbff2c690`); fixedSource:true;
  19:38:43.298–19:38:47.708Z; exit 1. Result: `Test Files 1 failed (1)`, `Tests no tests`,
  `Error: Failed to load url ../src/core/promiseCapacityOwners.js … Does the file exist?`.
  Per the T1 law this is a MISSING-MODULE RED, named as such; no assertion has executed and no
  reached-assertion coverage is claimed. The file parses (esbuild transform completed).
- Test-author's own runs (two, exit 1, final 19:36:59–19:37:03Z) preceded the parent run; one
  over-pinning line was removed between them (documented in the hand-back).
- The file is INSTALLED with this record (T1: independent test-author RED against the accepted
  design), so the writer implements against committed bytes.

## What the file pins (summary; the verbatim hand-back in §3 has the per-case detail)

Surface case first (every export of the new module and the two `promises.js` helpers must exist
with the expected runtime type; a missing export is reported by name, never a spurious pass);
then claims (RED 1–6, additions (i)/(iv)), assembly (RED 7–8), digest (RED 12/14), mapping
(RED 9–11, addition (ii)), guards (RED 13/15, additions (iii)/(v)). In-memory tagged variants
only; `world()` copied from the capacity test; the Started producer on `w.ready` supplies the
byte-identity, cash/RNG and 2-week cells; the Ready producer on `w.opened` supplies the
`workLimit` cut case (538 facts); the kernel test's five status fixtures supply the mapping
table. Nothing asserts `rulesVersion`, Save30, PROVEN_* under assumed coverage, or
REASONABLY_ACHIEVABLE on the 40-week baseline. Measured numbers are pinned as inequalities, not
as expectations.

Six ambiguity resolutions the writer must honour (hand-back "Choices"): tariff
`M = bound local prior claims + (target bound ? 1 : 0)` with `P = promises.length`,
`A = Σ proposals[].promises.length`, `T = firstTakes.length`; exact rival omission string and
horizon-guard message; `kernel.scope 'jointOfferOnly'` on PROVEN_IMPOSSIBLE; `claims.issuerId`
echoes the draft issuer even for a rival; `<` string ordering for priors/debits/ids/omissions
(identical to the kernel's `compareText`); an empty `ProducerResult` is a lawful input.

## Writer release (T2; ONE sim-core writer, record 541)

Writable: `src/core/promiseCapacityOwners.ts` (new) and `src/core/promises.ts` lines 548/555
(`export` + `Pick` parameter type, zero body change). Not writable: this test, any other test,
fixtures, kernel, producers, `index.ts`, save, bridge, tuning, docs. The writer runs only the new
file and the typechecks, one process at a time; the parent runs the serial fixed-source groups
(539 §3 check list) under record-check afterwards, then an independent review of the landed
module against 539-A + 539-B + 13/14.

## 3. Verbatim test-author hand-back (540-T)

As returned, unedited.

```text
# 540-T — RED file for the detached owner-adapter first slice

**Status: DONE.** One file created, nothing else touched. No Git, no network, no installs, no typecheck, no other test run. Two runs of my own file (one process each; the second after removing one over-pinning line, see below).

**Model observed:** the harness identifies this session as Fable 5.1 (`claude-fable-5-1`); not independently verifiable. lean-ctx MCP tools named in the user CLAUDE.md were not available; Read/Bash only.

## Deliverable
- File: `/Users/zacheryspector/The-Movies-headless-program/tests/p14b4-owner-adapter-first-slice.test.ts`
- SHA256: `07d1ad47d916df9b61524028b9c2a3496e9fd882be8b69f72f74751e85cf754b`
- 781 lines (over the ~650 target: `world()` copy 105, verbatim kernel fixtures ~60, the RED 3 detached `ClaimSource` fixture ~55, RED 10's five-status table ~35; every case carries its pins, none is decorative. Cut candidates if the parent wants ~650: fold addition (i) into RED 4, drop the `kernelResults()` precondition block (8 lines) and the digest/coverage/fnv extras in RED 12.)
- Git: `?? tests/p14b4-owner-adapter-first-slice.test.ts` is the only change. HEAD at work time is `3c870039bb779a88640b77e47ba085694e50b15d` ("Headers: 538/538-C/539 state…"), not the `1b5ba08` named in the brief; `git diff --stat 1b5ba08 HEAD -- src tests` is EMPTY (docs only: HEADLESS-PROGRESS, UNITY-INTEGRATION-BACKLOG, 00-start, P14-HEADLESS-PLAN), so source identity is unchanged.

## Run identity (verbatim first failure lines)
Command: `node_modules/.bin/vitest run --project core tests/p14b4-owner-adapter-first-slice.test.ts` from the worktree root; node v20.20.2, vitest 2.1.9 darwin-x64.
- Run 1: START 2026-09-20T19:35:44Z, END 19:35:48Z, EXIT 1 (log `…/scratchpad/540-T-run1.log`).
- Run 2 (final, after the one-line removal): START 2026-09-20T19:36:59Z, END 2026-09-20T19:37:03Z, EXIT 1 (log `…/scratchpad/540-T-run2.log`):
'''
 FAIL |core|  tests/p14b4-owner-adapter-first-slice.test.ts [ tests/p14b4-owner-adapter-first-slice.test.ts ]
Error: Failed to load url ../src/core/promiseCapacityOwners.js (resolved id: ../src/core/promiseCapacityOwners.js) in /Users/zacheryspector/The-Movies-headless-program/tests/p14b4-owner-adapter-first-slice.test.ts. Does the file exist?
 ❯ loadAndTransform node_modules/vitest/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51969:17
 Test Files  1 failed (1)
      Tests  no tests
   Duration  2.69s (transform 1.61s, …)
'''
RED for the intended reason: the module is missing, so the whole file fails to load (0 tests reached). The transform phase completed (1.61s), so the file parses under esbuild; NO assertion in it has executed. Once a module exists, the FIRST case (`surface`) reports any missing export as `MISSING EXPORT: <module>.<name>` by name (typeof pin against vite's undefined binding), and the two `promises.js` helpers are covered the same way.

## Case list (describe → it), mapped to RED numbers / refinements / additions
**module surface**
- `surface` — all 7 runtime exports of `promiseCapacityOwners.js` + `promiseCastSlots`/`qualifyingTakes` from `promises.js` exist with runtime type; `UNCERTIFIED_BOTTLENECK === 'bounded capacity analysis could not certify this schedule'` (plan :125-126).

**claims** (`collectPromiseClaims`)
- RED 1 — w.ready lead-root target: target `{promiseId, personId, mask ANY, window [start,start+52), bound, count 1, actualQualifiedCount 0}`; priors antagonist+support bound/ANY/remaining 1 sorted by promiseId; foreignDebits []; claimPersonIds = 3 actors sorted; horizonEndWeek start+52; coverage complete/[]; `work === 1+P+A+M×T`; asserts the 24 recorded takes are rivals'.
- RED 2 — unbound same draft → lead root is a third prior, target `promiseId null/unbound`; attach-then-`withdrawProposal` on w.opened (capacity :290-308 shape) → current claim present before, absent after; `tick(w.ready)` → all three SATISFIED → priors [] for a later draft.
- RED 3 (539-B refined) — (a) V29-lawful P1 count-2 attachment on the ANTAGONIST is a `current`/ANY/remaining 2 prior for the LEAD person's offer (cross-beneficiary widening), horizon start+40; (b) detached in-memory `ClaimSource` (never saved, labelled): rival bound root + rival current root (carried by a rival proposal) on the target → two `ForeignDebit`s with `sourceWindow`, `remaining = count` although a rival take exists inside the window; rival root on ANOTHER person dropped; a player current root on the antagonist with a qualifying player take → `remaining = count` (refinement 3); foreign windows do not extend `horizonEndWeek` (Q4 clarification 2).
- RED 4 (mirrors capacity :279-288) — 2-week in-memory variant, lead AND antagonist tagged `['lead']`, target support → both priors mask `['lead']`; as lead target mask `['lead']`; direct pins of `promiseCastSlots` for the three shapes.
- addition (i) — count-only `LEAD_OR_SIGNIFICANT_ROLE_COUNT` root → mask ANY as prior and as target.
- RED 5 — lead root count 2 in memory, real `tick` → take at now+1, root open `progress 1`, `qualifyingTakes` = that take, prior `remaining 1`, bound target `actualQualifiedCount 1`; second half labelled ARITHMETIC PIN ONLY, NOT A LIVE STATE: outcome forced null on the settled root → prior `remaining 0` EMITTED.
- RED 6 — empty-window and count-0 attachments (staged by `attachPromise`) demand nothing: priors [], coverage complete, no omission.
- addition (iv) — `windowStartWeek === target.due` and `dueWeekExclusive === max(now, target.start)` excluded; one week inside included, horizon extends.

**assembly** (`assembleCapacityInput`)
- RED 7 (539-B Q8.7 Started alternative) — `toEqual` the first-take hand assembly (:314-321) with coverage derived (`claimsAndHolds 'complete'`, calendars/traces `'incomplete'`, omissions `[NO_ENUMERATOR_OMISSION]`), `preparationWork = producer + claims.work`, key set identical, holds unclipped.
- RED 8 — one no-command Ready plan on w.opened at now+1: producer cut `['workLimit','shared replay work limit']`, `preparationWork 200000`, omission `'work limit; remaining plan suffixes unexecuted'` (538 scenario 0/2 facts); assembly → traces [], claimsAndHolds incomplete, omissions sorted-unique containing `'workLimit: shared replay work limit'`, the producer omission and `NO_ENUMERATOR_OMISSION`; guard exempt (no complete trace though now+1 < claims.horizonEndWeek); `classifyDetachedOffer` → FRAGILE, exact bottleneck, `kernel {UNCERTIFIED, workLimit, workUsed 200000}`; digest equals `capacityInputsDigest(assembled)`. Explicitly NOT asserted: REASONABLY_ACHIEVABLE on `opened`.

**digest**
- RED 12 (refined) — mask `['lead']` vs `['lead','antagonist']` → different digest; extra prior mask change → different; `preparationWork ± 1` → SAME digest (Q6); `limits`/`coverage` changes → different; 16-hex fnv shape; cash (`studio.cash+1` + ledger row) and `rngState '1,2,3,4'` variants in memory each through their OWN Started run → identical producer result, identical claims, identical classification.
- RED 14 — structuredClone before/after for state, draft, producer result, LIMITS, assembled input, claims, kernel result; repeat-call determinism; reversed `promises`/`proposals`/`firstTakes` → identical claims/assembly/classification; `work === 1 + P + A + 3×T` on the support-target 2-week state.

**mapping**
- RED 9 (`it.each`, 13 cells: 9 matrix + 3 joint + the RED 4 conflicting cell) — through the cached Started result at now+2: `UNCERTIFIED/domainIncomplete`, `kernel.omissions [NO_ENUMERATOR_OMISSION]`, `workUsed` in (producer.preparationWork, 200000], FRAGILE + exact string. NOT asserted: the installed capacity RED's IMPOSSIBLE/FRAGILE outcomes.
- RED 10 — all five statuses from the kernel test's own fixtures (`shared()` :194-197 CERTIFIED; :206 probeFailed; :245-250 priorPathProtection; :209 IMPOSSIBLE; :292-299 ALREADY_MET; :414-416 / :458-460 / :465-470 UNCERTIFIED ×3), fixture statuses asserted as preconditions; mapping table per 539 §1; `bottleneck null iff REASONABLY_ACHIEVABLE`; `kernel {status, reason|null, workUsed, omissions}` passthrough; no `rulesVersion`/`week`; UNCERTIFIED bottleneck never contains omission text; the priorPathProtection bottleneck differs from the probeFailed one (plan :300-302 presence, wording free).
- RED 11 — PROVEN_IMPOSSIBLE keeps `kernel.status`, `reason` and `scope 'jointOfferOnly'` (539 §1); `Object.keys(module).sort()` equals exactly the 7 adopted runtime exports.
- addition (ii) — `tick(w.ready)`, lead root SATISFIED with the real take, as bound target `actualQualifiedCount 1`, other roots terminal → priors []; through the trace route with an EMPTY producer result → `ALREADY_MET` → REASONABLY_ACHIEVABLE / null.

**guards**
- RED 13 — rival issuer and `hollywood: null` → empty claims, `claimsAndHolds 'incomplete'`, omission exactly `'claims are collected for the player studio only; rival policy is not replayed'`; Started producer for the rival cuts `rivalPolicyUnsupported` with omissions `['rivalPolicyUnsupported','rival weekly policy is not replayed']`; `classifyDetachedOffer` does not throw → FRAGILE + exact string, `domainIncomplete`, omissions carry both.
- RED 15 — (a) cached complete trace at now+2 with a claims horizon start+52 → `assembleCapacityInput`/`classifyDetachedOffer` throw `/producer horizon precedes the latest relevant due week/`; (b) unbound draft due now+221, Started producer at now+221 cuts `['sizeLimit','replay span exceeds limit']` with attempts [] → no throw, `kernel.reason 'sizeLimit'`, FRAGILE + exact string.
- addition (iii) — `limits.work 200001` through the adapter throws `/work limit exceeds the governed maximum/` (kernel :977), same call with 200000 does not.
- addition (v) — empty window, reversed window, count 0, count 1.5 → `toThrow(/target/)`; the well-formed draft does not throw.

## Choices the writer must know (my fixes of ambiguities, all recorded in the file)
1. Tariff `M` in `1 + P + A + M×T`: under refinement 3 only LOCAL bound members scan takes, so `M = bound prior claims + (target bound ? 1 : 0)`; P = `promises.length`, A = Σ `proposals[].promises.length`, T = `firstTakes.length`. 539-A's original M (all priors + foreign debits + bound target) is superseded by the refined remaining law.
2. Wording pinned beyond the plan string: rival omission exact (539-A 1.1, KEEP by 539-B Q7); horizon guard regex `producer horizon precedes the latest relevant due week` (539-A assembly bullet, KEEP by Q4); malformed target only `/target/`. PROVEN_* bottlenecks pinned as non-empty, ≠ UNCERTIFIED string, protection ≠ probeFailed; no exact wording.
3. `kernel.scope: 'jointOfferOnly'` on PROVEN_IMPOSSIBLE is pinned (539 §1 adopted it; 539-A's type lacked it).
4. The rival case pins `claims.issuerId === draft.issuerStudioId` (the rival id) alongside the empty lists.
5. Sorting: priors/debits by `promiseId`, `claimPersonIds` and omissions by default string order; the file's `byId`/`.sort()` use `<` ordering, identical to the kernel's `compareText`.
6. Empty `ProducerResult` fixture (`{fixedHolds:[],attempts:[],preparationWork:0,omissions:[]}`) is used for ALREADY_MET and the 200001 refusal: lawful because the adapter consumes results (539 §1), and it avoids the kernel's `validateTraces` horizon invariant on a 43-week horizon.

## Unconstructible cases
None. Every listed item is a real `it`; no `.skip`/`.todo`/`UNCONSTRUCTIBLE` bodies.

## Removed after run 1
One line in RED 15 (`assembleCapacityInput(long, result, long.horizonEndWeek, …)).not.toThrow()`) pinned a non-throw at a horizon the producer never ran to, which constrains the writer beyond the adopted guard; RED 7/9/12/14 already pin the passing boundary at `horizonEndWeek === claims.horizonEndWeek`. Run 2 is the final identity above.

## Sources read (line ranges)
- Record 539 (whole, 1-402: §1-§3, 539-A §1-§6, 539-B Q1-Q10, defects); record 538 `538-capacity-budget-measurement.md` :1-102 headings + verbatim lines 50-53, 76-81 (scenario 0/1/2/3 facts: w.ready now 60, start 52, 24 rival takes, 3 roots, Started 108265 complete; w.opened now 45, 0 roots, Ready plan cut workLimit 200000); `538-capacity-budget-measurement.patch` (whole, 489 lines).
- Tests: `p14b4-cast-class-capacity.test.ts` 1-366 (whole); `p14b4-ready-replay-first-take.test.ts` 1-120, 180-330; `p14b4-capacity-kernel.test.ts` 1-140, 160-310, 400-486; `p14b4-material-evidence-core.test.ts` 1-60, 200-300; `p14b4-started-owner-replay.test.ts` 1-60, 100-220; `helpers/p14b2-fixtures.ts` 1-30 + export grep.
- Source (read only): `promiseCapacityKernel.ts` 1-330, 383-470, 500-520, 960-1047; `promiseCapacityOwnerReplay.ts` 1-330, 540-560, 600-630, 745-765, 2670-2797; `promises.ts` 1-60, 140-300, 360-420, 460-600, 600-709; `types.ts` 2049-2065, 2115-2254, 380-388; `hollywoodTypes.ts` 120-140; `math.ts` 85-98; `vitest.config.ts`, `vitest.workspace.ts`, `package.json` scripts.

## Evidence limits
- No assertion has executed: the file is proven to parse (esbuild transform) and to fail at module resolution; every pinned value is paper-derived from the law and the installed fixtures/538 measurements, not observed through the adapter. `world()` construction cost and the Started/Ready producer runs are known to work only from 538's executed patch (same source).
- The 13 RED 9 cells assume 538's "every cell UNCERTIFIED/domainIncomplete under supplied coverage" carries over when `claimsAndHolds` is derived complete by the adapter (it matches the supplied coverage's `claimsAndHolds 'complete'`).
- Not read: plan lines :60-339 directly (relied on 539's citations), kernel search internals :522-960, `admitReady`, the V29/V30 validators. No typecheck run: TS narrowing of the in-memory `Patch` spreads is by reading.
- Not native, not usability, no Save30/projection/Owner-acceptance claim.

## Next concrete action
Parent records 540-T (file path + SHA256 above) and releases ONE sim-core writer with 539 §3/§4 paths (`src/core/promiseCapacityOwners.ts` new; `promises.ts` :548/:555 `export` + `Pick` only) and the extended check list; the writer should read the six "choices" above before implementing, and run this file first (expect the surface case GREEN before any other).
```
