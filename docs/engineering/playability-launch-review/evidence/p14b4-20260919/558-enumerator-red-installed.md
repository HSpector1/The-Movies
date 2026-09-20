# 558 — RED installed: enumerator slice of the owner adapter (T1)

2026-09-20. Claude Code parent. The test-author authored the requirement-based RED for the slice
adopted in record 555 (§1 design, §3 brief). ONE new file, nothing else changed:
`tests/p14b4-owner-enumerator-slice.test.ts`, SHA256
`56df4c5ba8ae9cd2bc1d0fe3720b3ba921ac02d2f82b5d7b417b2800703875ac`, 775 lines, 21 `it`
declarations / 45 runtime cases in eight groups (surface; floor; certificate; classification;
honesty; guards; purity; limits). The module under test (`src/core/promiseCapacityEnumerator.ts`)
does not exist yet and the adapter's fifth parameter is not landed; the file is RED for exactly
that reason and says so.

## Identity

- Parent run under `record-check.mjs`: `559-enumerator-red.{txt,json,patch}`; HEAD
  `5e0e90bdb462987734f6a58caec05ca6b20a8dd1` (docs only since `e33022fb`; source = first slice +
  556 fixture reconciliation); protected capture = the untracked RED file only
  (`testedDiffSha256` `e2293b466978…`); fixedSource:true; 21:13:00.828–21:13:05.619Z; exit 1;
  `Test Files 1 failed (1)`, `Tests no tests`, `Error: Failed to load url
  ../src/core/promiseCapacityEnumerator.js … Does the file exist?`. Per the T1 law this is a
  MISSING-MODULE RED, named as such; no assertion has executed. The file parses.
- Test-author's own run (exit 1, 21:09:11–21:09:14Z) preceded the parent run.
- The file is INSTALLED with this record, so the writer implements against committed bytes.

## What the file pins (summary; the verbatim hand-back in §3 has the per-case detail)

Surface (exact five runtime exports of the new module; the adapter's key list unchanged;
`NO_ENUMERATION` not exported; the exact fresh-admission omission wording; five-arity assembly);
floor (E1: `FRESH_TAKE_OFFSET === 5` tied to the phase owner and `PRODUCTION_TICKS`; the formula
cells; the `remainingTicks < 5 → +Infinity` arm (iv); the natural-chain law `take.week >= now+5`
on a real greenlight, with the `=== now+5` observation as a separate reporting case);
certificate (E2 on the 13 cells: complete/complete/[], one complete Started attempt byte-equal to a
reference run, holds to `claims.horizonEndWeek`, tariff transferred once; E6; additions (i) and
(ii)); classification (E3: eligible → FRAGILE/PROVEN_FRAGILE/achievableProbeFailed; ineligible and
the conflicting case → IMPOSSIBLE/PROVEN_IMPOSSIBLE/completeCountFailure with `scope
'jointOfferOnly'`; the paper `unbound(support)` cell reports loudly, never loosens; digest
composition and independence from `preparationWork`); honesty (E4 at `now+5` complete and at
`now+6` BOTH flags incomplete with the fresh-admission omission, loud producer-completeness
preconditions; E5 `unscheduled` → the started-picture omission naming the production; addition
(iii) queue via a real commission, self-reporting UNCONSTRUCTIBLE if the door refuses); guards
(E7 rival / absent industry; E9 cap 200001 → the producer's own throw; span 1 → `sizeLimit`;
addition (v) `w_e` saturation shape); purity (E8); limits (E10: four-arity byte-identical to the
first slice's RED 7 hand assembly; five-arity carries the certificate; canonical `limits` key
order and digest invariance under a permuted caller literal).

Ambiguities the test-author resolved (writer must honour; hand-back "Other ambiguities"):
`w_e = 1 + N + W + N×T` (N `studio.activeProductions.length`, W `operations.workflows.length`,
T `firstTakes.length`; rival branch `w_e = 1`); `earliestStartedTakeWeek` returns
`Number.POSITIVE_INFINITY` for `remainingTicks < 5`; under saturation `domain.work` is the charged
tariff while `producer.preparationWork === limits.work`; the enumerator's traceKey is read from
its result (only non-empty is pinned); "run to `claims.horizonEndWeek`" is pinned through every
fixed hold's `until`; canonical `limits` order `claims, units, alternatives, work, span`.

## Writer release (T2; ONE sim-core writer, record 560)

Writable: `src/core/promiseCapacityEnumerator.ts` (new) and `src/core/promiseCapacityOwners.ts`
lines 151–168 only (fifth `enumeration` parameter with the UNEXPORTED `NO_ENUMERATION` default,
`export type EnumerationCoverage`, the canonical `limits` re-literal; nothing else in that file).
Not writable: this test, any other test, fixtures, kernel, producers, `promises.ts`, `index.ts`,
save, bridge, tuning, docs. The writer runs only the new file, the first-slice RED (must stay
33/33) and the typechecks, one process at a time; the parent runs the 555 §3 serial groups under
record-check afterwards, then an independent review of the landed module. If a loud precondition
(a Started run cutting at `now+4/5/6`, the commission queue) fails, the writer reports the
observed cut with its reason and does not weaken the test.

## 3. Verbatim test-author hand-back (558-T)

As returned, unedited.

```text
## 558-T (T1) — RED for the enumerator slice: DONE

**Status: DONE.** One new file created; no existing file edited; no Git state change (read-only `git status`/`rev-parse`/`log`/`diff --stat` only); no network, installs or delegation. Exactly one vitest process run, on my file only.

**Model observed:** the harness identifies this session as Fable 5.1 (`claude-fable-5-1`); not independently verifiable. The lean-ctx MCP tools named in the user CLAUDE.md were not exposed; I used Read/Bash(read-only)/Write/Edit.

**Identity discrepancy to record:** the assignment named HEAD `267b7dc6`; at run time `git rev-parse HEAD` = `5e0e90bdb462987734f6a58caec05ca6b20a8dd1` ("Headers: 554-556 attribution ... NEXT558 RED"), one commit above `267b7dc6`. `git diff --stat 267b7dc6 HEAD -- src tests` is EMPTY (6 docs files changed, 129+/30-). Source identity is therefore exactly the assigned one (first slice `e753da22` + 556 fixture reconciliation). Working tree: only my untracked file. My file header still names `267b7dc6` as the source identity; both statements ("module absent") hold at both commits.

### File
- Path: `/Users/zacheryspector/The-Movies-headless-program/tests/p14b4-owner-enumerator-slice.test.ts`
- SHA256: `56df4c5ba8ae9cd2bc1d0fe3720b3ba921ac02d2f82b5d7b417b2800703875ac`
- 775 lines, 59592 bytes (target was ~750; the `world()` copy with `unscheduled` is ≈110 lines). 8 `describe` groups (surface; floor; certificate; classification; honesty; guards; purity; limits), 21 `it` declarations, 45 runtime cases (two `it.each` over the 13 cells). No `.skip`/`.todo`, no `Math.random`, no `Date.now`, no file writes; `live()`/`makeSave` only on the three REAL fixture states (`opened`, `unscheduled`, `ready`), never on a tagged variant.

### Run (the one authorized process)
`node_modules/.bin/vitest run --project core tests/p14b4-owner-enumerator-slice.test.ts` from the repo root. vitest v2.1.9. START `2026-09-20T21:09:11Z`, END `2026-09-20T21:09:14Z`, EXIT `1`. Log: `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/558-T-run1.log`. RED for the intended reason (module missing). Verbatim first failure lines:
'''
 FAIL |core|  tests/p14b4-owner-enumerator-slice.test.ts [ tests/p14b4-owner-enumerator-slice.test.ts ]
Error: Failed to load url ../src/core/promiseCapacityEnumerator.js (resolved id: ../src/core/promiseCapacityEnumerator.js) in /Users/zacheryspector/The-Movies-headless-program/tests/p14b4-owner-enumerator-slice.test.ts. Does the file exist?
 ❯ loadAndTransform node_modules/vitest/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51969:17
'''
Summary lines: `Test Files  1 failed (1)`, `Tests  no tests`, `Duration  2.70s`.

### Case list → E-number / addition / 555-B refinement → what it pins
**surface**
1. `surface (E10)`: typeof pins for `FRESH_TAKE_OFFSET` (number), `FRESH_ADMISSION_OMISSION` (string), `earliestStartedTakeWeek`/`enumerateOwnerTraces`/`classifyEnumeratedOffer` (functions) plus the adapter's `assembleCapacityInput`/`collectPromiseClaims`/`capacityInputsDigest`/`NO_ENUMERATOR_OMISSION`, each reported by name if missing; `Object.keys(enumeratorModule).sort()` === exactly `['FRESH_ADMISSION_OMISSION','FRESH_TAKE_OFFSET','classifyEnumeratedOffer','earliestStartedTakeWeek','enumerateOwnerTraces']`; owners' RED 11 key list unchanged; `'NO_ENUMERATION' in ownersModule === false`; `FRESH_ADMISSION_OMISSION` === the 555 §1 exact wording; 5-arity behaviour probe (a supplied complete certificate over `EMPTY_PRODUCER` yields complete flags and drops `NO_ENUMERATOR_OMISSION`).

**floor**
2. `E1 (555-B Q7)`: `FRESH_TAKE_OFFSET === 5`; tied to the phase owner (`productionPhaseForRemainingTicksOrNull`: highest count in 'shooting' is 5) and `TUNING.PRODUCTION_TICKS`: `1 + (8 − 5) + 1`; formula cells `(now, 8) → now+5`, `(now−1, 5) → now+1`, `(now−1, 6) → now+2`, `(now−1, 8) → now+4`, `(now−3, 7) → now+3`, and the generalised `now + (r − 5) + 1` over r ∈ 5..8, s < now. `WEEKS_TO_FIRST_TAKE` equality deliberately NOT asserted (comment only).
3. `addition (iv) (555-B Q2)`: r ∈ {4,3,2,1} on plain `Pick` inputs → `Number.POSITIVE_INFINITY`; r = 5 boundary still `now+1`.
4. `E1 natural chain LAW`: real `greenlightScriptProject` of the first Ready script on `w.opened` at `now`, first-take test's assign/schedule loop (no setup recipe), `take.week >= now + FRESH_TAKE_OFFSET` and `>= earliestStartedTakeWeek(now, film)`; the admitted picture is `{startTick: now, remainingTicks: 8}`, queue empty.
5. `E1 natural chain OBSERVATION` (separate `it`, message reports the observed week): `take.week === now + 5`.

**certificate**
6. `E2` ×13 cells: `floors === {freshTakeWeek: now+5}`; `work === w_e`; one `complete` attempt, no producer omission; trace and `fixedHolds` byte-equal to a reference Started run using the ENUMERATOR's own traceKey seeded with `domain.work`; `preparationWork === reference(seed 0) + domain.work` (tariff transferred, one sum) and ≤ 200000; every fixed hold `until === {now+2, 0}` (run to `claims.horizonEndWeek`); `enumeration` toEqual `{complete, complete, []}`.
7. `E6 (555-B Q7)`: antagonist due `now+4`, target lead `now+2` → `claims.horizonEndWeek === now+4`; loud `requireComplete`; holds `until {now+4,0}`; certificate complete; FRAGILE/PROVEN_FRAGILE/achievableProbeFailed.
8. `addition (i)`: the admitted-this-week state from the natural chain, unbound 2-week P1 draft on the lead → `earliestStartedTakeWeek === now+5`, complete → IMPOSSIBLE/PROVEN_IMPOSSIBLE/completeCountFailure/jointOfferOnly (loud producer precondition).
9. `addition (ii)`: `tick(w.ready)` (r = 4, receipt, roots SATISFIED), fresh unbound 2-week draft → helper `+Infinity`, complete → IMPOSSIBLE (loud precondition).

**classification**
10. `E3` ×13 cells: eligible (mask any, or lead slot, or leadOrAntagonist in antagonist) and the three joint targets → FRAGILE/PROVEN_FRAGILE/achievableProbeFailed with a named bottleneck ≠ `UNCERTIFIED_BOTTLENECK`; ineligible and the conflicting case → IMPOSSIBLE/PROVEN_IMPOSSIBLE/completeCountFailure/`scope 'jointOfferOnly'`; `kernel.omissions === []`; `workUsed ≤ 200000` and `> producer.preparationWork`; no `rulesVersion`/`week`; composition law (`assembleCapacityInput(claims, domain.producer, claims.horizonEndWeek, LIMITS, domain.enumeration)` digest === `inputsDigest`, `preparationWork` +1 same digest, `assembled.preparationWork === producer.preparationWork + claims.work`), and digest ≠ the first-slice `classifyDetachedOffer` digest of the same cell.
11. `E3 (PAPER, plan :106)`: `unbound(support)` on the joint variant → `IMPOSSIBLE`, the failure message reports the observed class/status/reason loudly ("DO NOT LOOSEN").

**honesty**
12. `E4 (555-B Q4)` due `now+5`: still complete (half-open), holds `until {now+5,0}`, PROVEN_FRAGILE; loud precondition.
13. `E4 (555-B Q4)` due `now+6`: loud precondition that the Started attempt is `complete` FIRST; then `enumeration` toEqual `{incomplete, incomplete, [FRESH_ADMISSION_OMISSION]}`; FRAGILE/`UNCERTIFIED_BOTTLENECK`/domainIncomplete; kernel omissions contain the fresh-admission string and NOT `NO_ENUMERATOR_OMISSION`; no throw.
14. `E5 (555-B Q7)`: `w.unscheduled` (real state captured immediately before `scheduleShootingTake`; status `ready`, blocker null, r = 5, no take) with the 2-week lead cell → `enumeration` toEqual `{incomplete, incomplete, ['started picture <w.productionId>: lawful command timings and facility acquisition are not enumerated']}`; UNCERTIFIED/domainIncomplete; no throw; loud producer precondition (added beyond the mandated E4/E6 because the class pin depends on it).
15. `addition (iii)`: real `commissionScript` (third concept, the fixture writer) behind the admitted-this-week picture; if it throws at the door or is admitted at once the case throws `UNCONSTRUCTIBLE: <observed reason>`; else `productionQueue` length 1 → producer attempt `{cut, unsupportedContext, 'current queue may admit new work'}`, both flags incomplete, UNCERTIFIED/domainIncomplete, kernel omissions contain `'unsupportedContext: current queue may admit new work'`.

**guards**
16. `E7`: rival issuer and `hollywood: null` → claims incomplete with the rival omission; `enumerateOwnerTraces` never throws, `attempts []`, `work === 1`, both flags incomplete, `floors` still `now+5`; classify → FRAGILE/UNCERTIFIED/domainIncomplete, omissions contain `RIVAL_OMISSION`.
17. `E9` 200001: both entry points throw a message matching `/limits may only lower the published caps/` and NOT `/work limit exceeds the governed maximum/`; `LIMITS` does not throw.
18. `E9` span 1 on the 2-week cell: producer `attempts []`, omissions toEqual `['sizeLimit', 'replay span exceeds limit']` (RED 15 shape), flags incomplete, kernel UNCERTIFIED/sizeLimit, omissions contain the replay string.
19. `addition (v)`: `limits.work: 1` (precondition `w_e > 1`) → producer toMatchObject `{fixedHolds: [], attempts: [], preparationWork: 1}`, the union of producer+enumeration omissions contains `'work limit before enumeration completed'`, flags incomplete, `domain.work === w_e`; classify → UNCERTIFIED/workLimit with `workUsed === 1`.

**purity**
20. `E8`: clones of state/draft/LIMITS/claims/domain equal after `enumerateOwnerTraces` and `classifyEnumeratedOffer`; repeated calls `toEqual`; reversed promises/firstTakes/proposals → identical domain and classification; `work === 1 + N + W + N×T` written out; `producer.preparationWork >= work` and `=== reference(seed 0) + work`; `Object.keys(LIMITS)` canonical.

**limits**
21. `E10 (555-B Q6/Q7)`: 4-arg assembly `toEqual` RED 7's hand assembly (copied verbatim); 5-arg carries supplied flags/omissions and drops `NO_ENUMERATOR_OMISSION`; everything but `coverage` byte-identical; omissions are the sorted unique union; a cut producer with the 5th arg still makes `claimsAndHolds` incomplete and carries `'sizeLimit: replay span exceeds limit'`; `limits` re-literal: `Object.keys(input.limits)` === `['claims','units','alternatives','work','span']` for 4-arg, 5-arg and a permuted caller literal, `toEqual(LIMITS)`, permuted-literal digest === canonical digest, the caller's object untouched; `classifyEnumeratedOffer(state, draft, permuted).inputsDigest === (…, LIMITS).inputsDigest`.

### The `w_e` formula fixed (555 §1 item 2 "formula fixed by the RED"; precedent 540's `1 + P + A + M×T`)
`w_e = 1 + N + W + N×T` with N = `studio.activeProductions.length` (every row is the issuer's own picture; rival pictures live under hollywood businesses, `hollywoodTick.ts:252-259`), W = `operations.workflows.length` (the condition-(b) workflow lookup), T = `firstTakes.length` (the condition-(a′) issuer-matched take scan, once per picture). Rival/absent-industry claims (`claimsAndHolds !== 'complete'`): `w_e = 1`. Charged and compared with `limits.work` before any run; seeded into the Started producer's `preparationWork` (so `producer.preparationWork = bill + w_e`, `Work` :247-250 is linear in the seed).

### Other ambiguities resolved (controlling line)
1. `earliestStartedTakeWeek` for `remainingTicks < 5` returns `Number.POSITIVE_INFINITY` (min over an empty set of lawful take weeks): 555-B Q2 fold of (a′), replay :690, operations :1680 sole take branch; makes (c) `floor ≥ horizon` absorb the (a′) arm. Pinned in addition (iv) and (ii).
2. Under `w_e` saturation, `domain.work` is the CHARGED tariff (formula) while `producer.preparationWork === limits.work` (555 §1 item 2's cut shape); pinned in (v).
3. Rival branch: `attempts []`, `work === 1`; `producer.preparationWork` deliberately NOT pinned (555-A's "producer: EMPTY" vs "work already inside producer.preparationWork" conflict; 555 §1 behaviour (1) names only "no producer run, both flags incomplete, no throw").
4. E2 "byte-equal" is realised against a reference Started run that uses the ENUMERATOR's own traceKey (read from its result) and its seed, not `started(w)` with this file's key: the traceKey is inside the bill (`work.text(plan.traceKey)` replay :557) and the hold tokens (:1646). The key literal itself is not pinned (555 §1 leaves it unnamed; 555-A proposed `'enumerator:started'`); only non-empty.
5. "Producer run to `claims.horizonEndWeek`" pinned through every `fixedHolds[*].until === {horizon, 0}` (replay :542, :755; RED 7's no-clipping pin), not via `projection.week` (absent from `ProducerResult`).
6. Canonical `limits` order `['claims','units','alternatives','work','span']`: 553-R item 1's literal (553 :107) and the kernel's `MAX_LIMITS`/validation order (kernel :117, :975).
7. E1 `===` observation is a separate `it` from the `>=` law case, with a message that reports the observed week (555-B Q7 E1).
8. Loud `requireComplete` preconditions (cut reason + producer omissions in the message) on E4 (both), E6, E5, E3 (all 13 + paper), (i), (ii): every case whose class pin depends on a Started run completing.
9. E10's contradictory input (complete certificate over a cut producer): only `claimsAndHolds: 'incomplete'` and the cut omission are pinned; the two flags are the enumerator's responsibility (555 §1 "never assert completeness on a cut"), not the adapter's.
10. Copied builders: `world()` from the first slice verbatim plus `unscheduled` (captured before `scheduleShootingTake`, then `live()`) and `writerId`; `variantsOn(base, …)` generalises `variants` so `unscheduled` can host the 2-week cell; `commissionPayload` factored from `readyScript` so addition (iii) commissions with the identical shape.

### Unconstructible cases
None declared unconstructible up front. Addition (iii) (555-B's candidate) is authored as a real `it` that constructs the queue by a real `commissionScript` behind the admitted-this-week picture and throws `UNCONSTRUCTIBLE: …` with the observed reason if the door throws or a second Development & Casting slot admits it at once (`scriptDevelopment.ts:311` is the only queueable commission refusal). Its constructibility is unknown until the module lands (I cannot run probes).

### Sources read (line ranges)
Records: 555 whole (:1-364); 538 :25-70; 553 :38/:107/:152/:165 (grep); 540-installed :36-48. Tests: `p14b4-owner-adapter-first-slice.test.ts` whole (:1-782); `p14b4-cast-class-capacity.test.ts` :80-300; `p14b4-ready-replay-first-take.test.ts` :60-240; `p14b4-started-owner-replay.test.ts` :95-220; `helpers/p14b2-fixtures.ts` export list. Source: `promiseCapacityOwners.ts` whole (:1-198); `promiseCapacityOwnerReplay.ts` :40-130, :245-300, :534-560, :608-630, :684-700, :736-760, :1626-1660, :2664-2700, :2780-2797 (+ grep of cut/omission strings); `promiseCapacityKernel.ts` :60-124, :117, :495-524, :920-1047; `operations.ts` :622-640, :1640-1712; `productionPhases.ts` :25-100 (+ exports); `tuning.ts` :55-64; `actions.ts` :286-350, :1590-1700, :1960-1992, :2284-2372; `productionAdmission.ts` :98-133; `productionQueue.ts` :113-116 (+ grep); `scriptDevelopment.ts` :296-316; `hollywoodTick.ts` :250-262; `types.ts` :237-251 (`Production`); `vitest.config.ts`, `vitest.workspace.ts`.

### Evidence limits
- RED only: no case body executed (the suite fails at load). No typecheck run (not authorized); any TS-level mismatch in my file (e.g. the `Cell.material` cast, `hollywood: null` on `GameState`, the `EnumerationCoverage`/`EnumeratedDomain` type names) surfaces only when the writer runs it.
- Fixture facts I could not verify here: a real greenlight on `w.opened` is lawful (538 scenario 0/parent reading :60, not native); whether a commission queues behind the admitted picture (self-reporting); whether the Started producer completes to now+4/5/6 on `w.ready`, to now+2 on `unscheduled`, on the admitted-this-week state and on `tick(w.ready)` (all guarded by loud preconditions per 555-B Q7).
- The 13-cell kernel classes and the `unbound(support)` IMPOSSIBLE are 538's observed results / plan :106 paper, pinned as law of the certificate; the paper cell reports rather than loosens.
- 775 lines vs the ~750 target. No native, usability, Save30, projection or Owner-acceptance claim.

### Next concrete action
Parent records 558-T (path, SHA256 above, the run log) and releases T2, ONE sim-core writer, on `src/core/promiseCapacityEnumerator.ts` (new) and `src/core/promiseCapacityOwners.ts` :151-168 (5th parameter with unexported `NO_ENUMERATION`, `export type EnumerationCoverage`, canonical `limits` re-literal) against this file, with the 555 §3 serial checks. The first GREEN attempt will also settle: addition (iii)'s constructibility, the E1 `===` observation, and the four unmeasured Started-run preconditions.
```
