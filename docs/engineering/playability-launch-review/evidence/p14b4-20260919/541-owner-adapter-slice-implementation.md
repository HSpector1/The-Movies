# 541 — Owner-adapter first slice implemented (T2) and checked on fixed source

2026-09-20. Claude Code parent. ONE sim-core writer implemented the detached owner-adapter first
slice against the installed RED (record 540) under the adopted design (record 539 §1/§3). The
candidate is FROZEN and UNCOMMITTED pending the independent review 553-R; it is fully captured
in the evidence patches below and in a hash-verified snapshot outside the worktree
(`~/The-Movies-recovery-snapshots/20260920T195000Z-541-adapter-candidate/`, SHA256SUMS).

## Candidate identity (parent-verified)

- Base HEAD `e790b5c7df2eabc90e54486b5bcf25dafbd6e14b` (the 540 publication; source identical to
  `69d16f8` plus the installed RED).
- NEW `src/core/promiseCapacityOwners.ts`, 198 lines, SHA256
  `2f6af5c706d8680f0ab184e1069e0fde854c8ff8df2111861720f41454aca390`; imports only `./math.js`,
  `./promises.js`, `./promiseCapacityKernel.js` and (type-only) `./types.js`.
- `src/core/promises.ts` SHA256 `0ce9ab0334ae0114cf576021dd34b27f34ce451021cddc2ec322b07de1c2360a`;
  `git diff --stat` = `1 file changed, 2 insertions(+), 2 deletions(-)`: line 548
  `export function promiseCastSlots(promise: Pick<ProfessionalPromiseV30, 'predicate'>)` and line
  555 `export function qualifyingTakes(`; zero body change (parent read the diff).
- Protected patch (record-check capture: tracked diff + untracked module)
  `8910c27482ce3d090a0187fb06529c4bf7b6b2fe5350ed965cbbc33b19ff3daf`, identical in every run
  below and equal to the parent's independent capture before the runs.
- No test, fixture, kernel, producer, save, bridge, tuning, config or doc file changed by the
  writer; the RED file's SHA256 is unchanged (`07d1ad47…754b`).

## Fixed-source checks — serial, one process at a time, all fixedSource:true on e790b5c7 + 8910c274…

| Record | Group | UTC interval | Result | Baseline |
| --- | --- | --- | --- | --- |
| 542 | the installed RED file | 19:51:21.696–19:51:30.275 | 33 PASS (was: fails to load, 540) | RED→GREEN |
| 543 | six Ready replay files | 19:51:30.493–19:51:46.368 | 17 PASS; sole original stale-target FAIL at `tests/p14b4-ready-replay-stale-target.test.ts:234` (`expected 'workLimit' to be 'commandRefused'`) | identical to 528 |
| 544 | six Started replay files | 19:51:46.636–19:52:03.582 | 28 PASS | identical to 529 |
| 545 | root + UI typecheck | 19:52:03.884–19:53:31.219 | PASS | identical to 530 |
| 546 | seventeen adjacent/caller files (incl. `p14bf2-acting-discipline`) | 19:53:31.450–19:54:09.583 | 203 PASS | identical to 531 |
| 547 | bridge types | 19:54:34.909–19:55:03.590 | exit 2; sole OLD TS2353 at `tests/bridge-p14b4-cast-class.test.ts(364,20)` | identical to 532 |
| 548 | facts + employment lookup | 19:55:03.807–19:55:11.037 | 7 PASS | identical to 533 |
| 549 | eleven live-P2 / kernel groups (the 536 command) | 19:55:11.235–19:57:35.661 | 110 PASS / 83 FAIL; failing-case set AND every `→` reason line byte-identical to 536 (parent diff) | identical to 536 |
| 550 | B1/B2/B3 controls + bridge consumers (12 files) | 19:57:35.880–19:59:03.982 | 132 PASS / 2 FAIL / 2 todo | see 552 |
| 551 | twelve historical save files (record 25 command) | 19:59:04.224–20:00:04.403 | 137 PASS | identical to 25 |
| 552 | the two 550 failing files on CLEAN HEAD (candidate set aside; empty patch `e3b0c442…`) | 20:00:42.482–20:01:08.376 | the SAME 2 FAIL / 14 PASS / 2 todo, identical reasons | pre-existing |

Writer's own runs (not evidence): the RED file 33/33 at 19:47:31–19:47:39Z; root+UI typecheck
PASS; bridge typecheck the sole OLD TS2353.

After 552 the candidate was restored from the snapshot by copy; both file hashes and the
protected patch hash were re-verified identical (`2f6af5c7…`, `0ce9ab03…`, `8910c274…`).

## Findings

- The slice does exactly what 539 adopted and nothing else moves: 636 focused passes plus the
  110/83 live-P2 set byte-identical; not a whole-suite pass; no Owner-acceptance claim.
- **Pre-existing control drift (record-only, disposition owed, NOT caused by this slice):** two
  natural-chain pins fail on clean HEAD `e790b5c7`: `tests/p14b1-trust-chooser.test.ts:439`
  ("test 6 … opportunity changes the winner of an otherwise compensation-versus-incumbency 1-1
  tie": expected `studio-5a47d054-r04`, received `studio-5a47d054-player`) and
  `tests/p14b2-fixture-preconditions.test.ts:22` via `tests/helpers/p14b2-fixtures.ts:42`
  ("wins a real rival-owned case…": `expected null not to be null`, the poaching fixture is
  unbound). Neither is listed as an inherited failure in the headers; the two files last changed
  on 2026-09-19 (`957d2de`, `425170e`, `3b978d7`). A later law that moved natural-chain outcomes
  is the likely cause (the same failure class as the memory rule "derive natural-chain pins from
  receipts"); attribution needs a bounded bisect over those two files and belongs to a separate
  record. The parent did not touch the tests.
- The writer's nine design decisions beyond 539 §1 (dangling `promiseId` throw; malformed-target
  scope; rival-branch contents; `scope` only on PROVEN_IMPOSSIBLE; verbatim bottleneck wordings;
  tariff `scans`; module-private rival/horizon strings; key-order-sensitive digest; exclusion
  order) are submitted to 553-R for review; the parent adopts none of them before that verdict.

## Next

553-R independent review of the landed module (contract-auditor, READ-ONLY on the frozen bytes)
→ KEEP: commit the two source files with a qualified checkpoint record; REFINE: one bounded
correction by the same writer, re-checked on fixed source; REJECT: candidate withdrawn from the
worktree (snapshot retained). Then the enumerator slice is designed separately; D1/D2/515 §6
unchanged.

## Verbatim writer hand-back (541-W)

As returned, unedited.

```text
# 541-W — detached owner-adapter first slice: DONE

**Status: DONE.** The installed RED `tests/p14b4-owner-adapter-first-slice.test.ts` (SHA256 unchanged `07d1ad47d916df9b61524028b9c2a3496e9fd882be8b69f72f74751e85cf754b`) is GREEN, 33/33, on the first run. Root+UI typecheck clean; bridge typecheck unchanged with its sole OLD TS2353. No Git (nothing added/committed), no network, no installs, no test or fixture touched, no path outside the two writable ones.

**Model observed:** the harness identifies this session as Fable 5.1 (`claude-fable-5-1`); not independently verifiable. The lean-ctx MCP tools named in the user CLAUDE.md were not available; Read/Write/Bash only.

**Worktree/HEAD:** `/Users/zacheryspector/The-Movies-headless-program` at `e790b5c7df2eabc90e54486b5bcf25dafbd6e14b` (matches the brief); tree was clean before my edits.

## Files changed (exactly two)

`git diff --stat` + `git status --short`:
'''
 src/core/promises.ts | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
 M src/core/promises.ts
?? src/core/promiseCapacityOwners.ts
'''
1. NEW `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityOwners.ts` — 198 lines, SHA256 `2f6af5c706d8680f0ab184e1069e0fde854c8ff8df2111861720f41454aca390`. Imports only `./math.js`, `./promises.js`, `./promiseCapacityKernel.js`, `./types.js` (type-only). Runtime exports exactly the 7 adopted names (`UNCERTIFIED_BOTTLENECK`, `NO_ENUMERATOR_OMISSION`, `collectPromiseClaims`, `assembleCapacityInput`, `capacityInputsDigest`, `mapCapacityResult`, `classifyDetachedOffer`); types `ClaimSource`, `CapacityLimits`, `CollectedClaims`, `ProducerResult`, `DetachedOfferClassification`. Header comment names 539/540 and the non-goals (no enumerator, no live importer, no version stamp/receipt, no Save/projection/kernel/producer change).
2. `/Users/zacheryspector/The-Movies-headless-program/src/core/promises.ts` — the two heads only, zero body change (asserted the exact bytes of :548 and :555 before the sed; diff verified):
   - :548 `function promiseCastSlots(promise: ProfessionalPromiseV30)` → `export function promiseCastSlots(promise: Pick<ProfessionalPromiseV30, 'predicate'>)`
   - :555 `function qualifyingTakes(` → `export function qualifyingTakes(`
   The `Pick` was needed: the RED calls `promiseCastSlots({ predicate: … })` with literals and the adapter calls it with a `PromiseDraft`; `tests/**/*.ts` is inside the root tsconfig, so without it `npm run typecheck` would fail.

## Checks run (one process at a time, worktree root; raw logs in the scratchpad)

1. `node_modules/.bin/vitest run --project core tests/p14b4-owner-adapter-first-slice.test.ts` — START 2026-09-20T19:47:31Z, END 19:47:39Z, EXIT 0 (log `…/scratchpad/541-run1.log`); this single run is the final run (no edit after it). Verbatim:
'''
 ✓ |core| tests/p14b4-owner-adapter-first-slice.test.ts (33 tests) 3454ms
 Test Files  1 passed (1)
      Tests  33 passed (33)
   Start at  21:47:32
   Duration  6.40s (transform 1.78s, setup 0ms, collect 2.39s, tests 3.45s, environment 0ms, prepare 110ms)
'''
   (`Start at` is the local clock, UTC+2.) The `surface` case passed first as required; all 13 RED 9 cells reached the kernel within budget through the adapter and mapped `UNCERTIFIED/domainIncomplete` (observed, not paper).
2. `npm run typecheck` (root `tsc --noEmit` + `ui/tsconfig.json`) — 19:47:53Z–19:49:00Z, EXIT 0, no output beyond the script echo (log `541-typecheck.log`). This also typechecks the RED file under the root config.
3. `npm run typecheck:bridge` — 19:49:00Z–19:49:24Z, EXIT 2, sole diagnostic, unchanged and not mine: `tests/bridge-p14b4-cast-class.test.ts(364,20): error TS2353: Object literal may only specify known properties, and 'kind' does not exist in type '{ count: number; }'.` (log `541-typecheck-bridge.log`).

Nothing else was run (the serial fixed-source groups are the parent's, per the brief).

## RED cases whose pin I consider wrong under 539 §1

None. Every pin was satisfiable inside the writable paths without a kernel/producer change, a test edit or a synthetic value.

## Design decisions beyond 539 §1 / 540's six choices (each with its controlling line)

1. **Dangling `draft.promiseId`** (names no root in `state.promises`) → named throw `target promiseId "…" names no minted root`. 539 is silent; `PromiseDraft.promiseId`'s doc (promises.ts:196-198) says it is set only for an ALREADY-MINTED promise, so a dangling id is a caller fault, and the fail-loud rule forbids a silent "unbound" fallback. No RED case exercises it.
2. **Malformed-target invariant scope**: refuses a non-safe-integer window edge as well as empty/reversed window and count < 1 / non-integer (539-B Q4 clarification 1 lists "non-integer"; the kernel's `integer()` :147 would refuse the edges anyway). Both messages contain `target`, as RED addition (v) pins. The precondition runs BEFORE the rival guard (a malformed draft throws for any issuer); not pinned either way.
3. **Rival branch contents** (539 §1 pins only empty lists + incomplete + the named omission; RED 13 adds `issuerId`): `target` is still built from the draft (bound/`actualQualifiedCount` from the named root), `claimPersonIds: [draft.beneficiaryPersonId]`, `horizonEndWeek: target due`, `work: 1 + scans×T` (P and A are not charged because promises/proposals are not scanned in that branch).
4. **`kernel.scope`** is carried ONLY on PROVEN_IMPOSSIBLE (typed `scope?: 'jointOfferOnly'`, conditional spread; `exactOptionalPropertyTypes` forbids `scope: undefined`). RED 11 pins its presence there; RED 10 does not mention it elsewhere.
5. **PROVEN_* bottleneck wordings** are 539-A's mapping-table strings verbatim (routine under 539-B Q5; RED 10 pins only non-empty, ≠ the UNCERTIFIED string, protection ≠ probeFailed). `certifiedUpperBound` is mapped although `classifyDomain` never emits it today (typed in the kernel result).
6. **Tariff accounting**: `scans` counts actual `qualifyingTakes` calls (bound target + bound local priors), i.e. 540 choice 1's `M`; `P = promises.length`, `A = Σ proposals[].promises.length`, `T = firstTakes.length`; RED 1/3/5/14 pin the formula.
7. **`RIVAL_OMISSION` and the horizon-guard message are module-private constants** (RED 11 pins the exact 7 runtime exports, so they cannot be exported; the RED carries its own copy of the rival string).
8. **Digest** is `fnv1a64(JSON.stringify(input minus preparationWork))`, the same primitive as `receipt()` (promises.ts:211-218), hence key-order sensitive; the adapter always emits the assembled input in one fixed key order, so equal inputs digest equal (RED 12/14 hold). A caller hand-building an input with another key order would get a different digest; no canonicalisation was added (not in 539 §1).
9. **Zero-demand exclusion** (empty window or count < 1) is applied after the membership/overlap test; order does not change the result, and it is exact (no omission), as 539 §1 states.

## Left out and why

Nothing from the brief. No `index.ts` re-export (539 §1: not re-exported, like the kernel and producers). No second vitest run (deterministic module; RED 14 pins repeat-call determinism inside the run); the parent's evidence runner re-executes anyway.

## Evidence limits

- One vitest run of the RED file only; the serial groups of 539 §3 (kernel 41, hold-order, sort, replay, material, `p14b1-*`/`p14b2-*`/`p14b3-*`/`p14bf2-*`, bridge consumers, twelve historical saves, six B4 live-P2 groups) were NOT run by me and remain the parent's step. The `promises.ts` change is two `export` keywords plus a `Pick` narrowing on a parameter whose body already narrows on `'kind' in`, so I expect no pass/fail-set movement, but that is a reading, not a result.
- Typecheck evidence is exit codes + the single bridge diagnostic; no `tsc` listing of files beyond that.
- Not native, not usability, no Save30/projection/Owner-acceptance claim; no receipt/`rulesVersion` was produced (D1 stays open).

## Next concrete action

Parent stages exactly `src/core/promiseCapacityOwners.ts` and `src/core/promises.ts`, records 541 with the two SHA256s above and the three logs, runs the 539 §3 serial fixed-source groups under record-check, then dispatches the independent review of the landed module against 539-A + 539-B + 13/14 before any enumerator slice.
```
