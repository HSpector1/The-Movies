# 574 — Qualified checkpoint: detached enumerator slice (555 → 574)

2026-09-20. Claude Code parent. The landed candidate of record 560 (with the RED amendment of
record 561) was independently reviewed READ-ONLY by the contract-auditor (574-R, verbatim in §3):
**KEEP, no demonstrated failure, nine record-only observations.** The two source files and the
amended RED are committed with this record; nothing else in source changed. Save29 / rules3 /
projection46 stay live; no receipt, no `rulesVersion`, no kernel/producer/save/projection/index
change; D1, D2 and 515 §6 untouched. Certificates exist only for windows `≤ now + 5` over
filmed/forced/bounded started domains; every ordinary launch window stays
`UNCERTIFIED/domainIncomplete` with the named omission.

## Chain of authority for this slice

553 (first slice qualified; enumerator named as the next bounded step) → 554/556/557 (control
drift attributed and reconciled) → 555-A design (sim-core READ-ONLY) → 555-B review REFINE →
555 adopted brief (fresh-take floor certificate, option β) → 558-T RED (test-author;
missing-module RED, installed at 036ad231) → 560-W ONE sim-core writer (new module + one hunk in
the adapter) → 561-T test-author amendment of the RED only (two TS7022 annotations; addition
(iii) built by real commands) → 562–573 serial fixed-source checks + 575 unamended-RED capture
(parent) → 574-R review KEEP → this commit.

## Committed identity

- `src/core/promiseCapacityEnumerator.ts` (new, 127 lines) SHA256
  `c0be83a91cf15e5bbf779e9336a697bd19c0b65d95f660866ad85d5c80c697d6`; exports exactly
  `FRESH_TAKE_OFFSET` (5, derived from the phase owner and `TUNING.PRODUCTION_TICKS`),
  `FRESH_ADMISSION_OMISSION`, `earliestStartedTakeWeek`, `enumerateOwnerTraces`,
  `classifyEnumeratedOffer`, `type EnumeratedDomain`; not index-exported.
- `src/core/promiseCapacityOwners.ts` (208 lines) SHA256
  `5514d847ef969f026abcd3c8fb5b61e47bbc24bd3d0e5a05139571c2cd6f5820` (+16/−6 in the
  `assembleCapacityInput` neighbourhood, original :145-169: `export type EnumerationCoverage`,
  unexported `NO_ENUMERATION`, fifth `enumeration` parameter, omissions union, canonical `limits`
  re-literal `claims, units, alternatives, work, span`; seven runtime exports unchanged).
- `tests/p14b4-owner-enumerator-slice.test.ts` (783 lines) SHA256
  `b9da9b766f251670a602e4cd51125bfc78d1736f69f56756ec75431a01c110d3` (record 561; installed RED
  `56df4c5b…` + 23/−15 test-only lines).
- Protected patch over base `036ad231` = `16e522edda08ee334501e8129eee51e9e556255986e285c967efc1c7194fa36a`,
  identical in all of 562–573 and re-verified immediately before this commit; the writer-side
  patch (unamended RED) `81d5d7cd61a2fd31e1888a6d8f790bbe7380901cbdb487d86d26a0ebd3c9cc70` is the
  one 575 carries.

## Verification (record 560 table; all fixedSource:true)

562 amended RED 45 PASS (was: fails to load, 559) · 563 first-slice RED 33 PASS · 564 Ready 17
PASS + sole original stale FAIL (:234) · 565 Started 28 PASS · 566 root+UI typecheck PASS · 567
adjacent 203 PASS · 568 bridge tsc sole OLD TS2353 · 569 facts 7 PASS · 570 live-P2/kernel 110
PASS / 83 FAIL, the 83 failing lines and 83 reason lines byte-identical and in order to 549/536 ·
571 B1/B2/B3 + bridge consumers 133 PASS / 1 FAIL (the designated trust-chooser test 6, same
reason as 557) / 2 todo · 572 `bridge-p14b2-trust` 22 PASS · 573 historical saves 137 PASS ·
575 (21:51:52–21:52:03Z) the candidate against the UNAMENDED 558 RED bytes: 44 PASS / 1 FAIL,
the sole failure being the RED's own self-declared `UNCONSTRUCTIBLE` throw at :614 (closes
574-R Q9's caveat; the RED bytes were restored from the hashed snapshot afterwards and re-hashed
`b9da9b76…`, protected patch `16e522ed…`). 625 focused passes plus the identical 110/83 set;
not a whole-suite pass; no Owner-acceptance claim.

## Decision on the owners module header (574-R observation 1)

The header comment at `src/core/promiseCapacityOwners.ts:8-9` still describes the first slice's
fixed coverage. The parent DEFERS the one-line doc correction so the committed bytes are exactly
the reviewed and run bytes (every capture above carries `16e522ed…`); it is carried below for the
next writer release that touches the module.

## Record-only items carried (574-R; none requires a hunk for KEEP)

1. Owners header :8-9 stale (default path only); one-line doc fix at the next writer release.
2. The authorized insertion sits at original :145-149 (type export, constant, doc lines), just
   outside the literal ":151-168" of record 558 but inside its authorized content list; provenance
   range recorded as ":145-169 neighbourhood".
3. Saturation boundary `w_e === limits.work` yields the replay's `work limit before replay
   preparation completed` label, not the enumerator's; flags incomplete and kernel `workLimit`
   either way.
4. `FRESH_TAKE_OFFSET` derives from the phase table while the take fires at operations :1680's
   literal `=== 5`; the :1133 invariant and RED E1's natural-chain LAW tie them; a table change
   alone moves the constant only in the conservative direction.
5. `NOT_ENUMERATED` is a shared unfrozen constant returned by reference (same convention as
   `NO_ENUMERATION`); the kernel copies/sorts omissions; E8 pins repeated-call equality.
6. Live-wiring rule (with 553-R items 1–2): the live path must call `classifyEnumeratedOffer` or
   pass `domain.enumeration` from `enumerateOwnerTraces`, never hand-supply an
   `EnumerationCoverage`; the 5-arity adapter carries a supplied certificate verbatim over an
   empty, uncut producer.
7. Condition (b) does not require `remainingTicks === 5`; a `'scheduled'` task at another
   countdown is unreachable by lawful actions and (a′) covers r = 4.
8. `workflowById` is last-wins while the producer uses first-match; duplicates would violate an
   engine invariant; no lawful divergence.
9. The controlling plan text for the bounded-certificate law is `plans/P14B4-HEADLESS-PLAN.md`
   (:111-116, :124-129, :286-297, :306-321); the parent's brief named `P14-HEADLESS-PLAN.md`.
Plus, carried unchanged from 553-R: items 2–6 (rival gate before the adapter; named-root
issuer/beneficiary tolerance; negative window edges; rival tariff omits P + A; dangling
`promiseId`); the writer decisions 4 (rival `preparationWork 1`, unpinned) and 9 (rival claim
under `limits.work 0` returns the empty shape; kernel still `workLimit`; untested) noted;
`tests/p14b1-trust-chooser.test.ts` test 6 stays failing by design (record 110/554) until the
coordinated tagged-P2 activation.

## Next (bounded)

- Every further certificate needs either D1 (live wiring; 537 §3) or D2 (the Ready admission
  bill; 538-C §2), except one candidate the design left as a named omission: command-timing
  alternatives for an UNFORCED started picture (plan :241-242; today the enumerator emits the
  started-picture omission). Whether that slice can certify under the 200000 cap without D2
  depends on the bill of a second Started attempt on the same world (538 scenario 1 charged
  108265 for one), which nobody has measured. Next bounded step: a READ-ONLY / in-memory
  measurement (instrumentation or test-author probe; no source change, no fixture edit) of the
  Started-alternative bill on the 538 fixtures, then a design note only if the numbers fit.
- Replay reductions C1/C5–C7 (515 §3) remain the parallel track; D1, D2 and 515 §6 stand; no
  live wiring, no `PROMISE_RULES_VERSION`, Save30 or projection movement follows from this record.

## 3. Verbatim contract-auditor hand-back (574-R)

As returned, unedited.

```text
## 574-R — independent READ-ONLY review of the landed enumerator slice (P14B.4 owner adapter, detached track)

**Status: DONE (read-only). Verdict KEEP: no demonstrated failure in the candidate; nine record-only items to carry.** No file created or edited, no command run, no Git, no network, no delegation. Every PASS/FAIL number below is read from the parent's record-check captures or from the writer/test-author scratch reports (labelled as such), never re-executed by me. I cannot hash; identities are "as read".

**Model observed:** the harness identifies this session as Fable 5.1 (`claude-fable-5-1`); not independently verifiable. The lean-ctx MCP tools named in the user CLAUDE.md were not exposed; Read/Glob/Grep only.

### Candidate identity as read

- `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityEnumerator.ts`: read whole, 127 lines (last line 127 is the closing `}` of `classifyEnumeratedOffer`). Untracked. SHA256 not verifiable here; the 562 patch (:113-246) reproduces the file byte-for-byte as far as a line-by-line read can tell (127 `+` lines, identical text).
- `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityOwners.ts`: read whole, 208 lines. The 562 patch (:1-47) shows exactly two hunks in this file, both inside the `assembleCapacityInput` neighbourhood (original :142-155 and :159-170): type export + unexported constant inserted before the doc comment, doc comment reworded, fifth parameter, omissions union from `enumeration.omissions`, flags from `enumeration`, `limits` re-literal. `capacityInputsDigest` (:183-186), `mapCapacityResult` (:188-202), `classifyDetachedOffer` (:204-208), `collectPromiseClaims` (:90-143) untouched.
- `/Users/zacheryspector/The-Movies-headless-program/tests/p14b4-owner-enumerator-slice.test.ts`: read whole, 784 lines by Read numbering (the brief says 783; the Read tool shows a final line 784 as the closing `})` of the last describe; no content discrepancy). The 562 patch (:49-112) shows the three amendment hunks (:45 type import; :305-306 annotations; :603-623 addition (iii) construction). The pinned block :624-638 matches the RED's block as 558 describes it.
- The 562 patch touches exactly three files (`src/core/promiseCapacityOwners.ts`, `tests/p14b4-owner-enumerator-slice.test.ts`, new `src/core/promiseCapacityEnumerator.ts`). No kernel, producer, `promises.ts`, `index.ts`, save, bridge, tuning or other test appears in it. `grep promiseCapacity src/core/index.ts`: no match (not index-exported).
- All captures 562–571 carry `sourceSha 036ad231…`, `testedDiffSha256 16e522ed…`, `untrackedSource ["src/core/promiseCapacityEnumerator.ts"]`, `fixedSource: true` (571's footer not yet written when read; see Q9).

### Sources read (absolute paths under `/Users/zacheryspector/The-Movies-headless-program/` unless noted; line ranges)

- Records: `…/evidence/p14b4-20260919/558-enumerator-red-installed.md` whole (:1-160); `555-enumerator-slice-design-review.md` whole (:1-364; §1 :12-71, §2 :73-80, §3 :82-112, 555-A :118-253, 555-B :255-363); `553-owner-adapter-slice-qualified-checkpoint.md` :36-66 (record-only items) plus grep of its headings; plan `plans/P14B4-HEADLESS-PLAN.md` :90-139 and :250-321 (the brief names `P14-HEADLESS-PLAN.md`; a grep of that file for "minimum countdown", "heuristic search miss", "valid hard upper bound", "charge/cap preprocessing", "could not certify this schedule" finds nothing, so the governing text is the P14B4 plan: :111-116, :124-129, :286-297, :306-321); `evidence/p14bf2-20260919/13-…preparation.md` :101 and `14-…review.md` :19 (grep: "absence cannot prove a maximum/exhaustive", "Incomplete domain enumeration cannot prove exhaustive failure").
- Source: `src/core/promiseCapacityEnumerator.ts` whole; `src/core/promiseCapacityOwners.ts` whole; `src/core/promiseCapacityKernel.ts` :926-1040 (`classifyDomain`, `runCapacity`) plus grep lines :38-40, :50, :65, :72, :91-95, :117, :374-380, :453-461, :977-982, :1013-1014, :1028-1029, :1034; `src/core/promiseCapacityOwnerReplay.ts` :44-123 (types), :245-334 (`Work`, `copyCost`), :665-704 (per-picture bill, `historicallyFilmed`), :2664-2797 (`replayPlans`, cut shapes, exports) plus grep of every `copyCost`/`contextCut`/`preparationWork` site; `src/core/operations.ts` :1650-1699 (skip, phase invariant, the take branch) plus grep `remainingTicks === 5` (:1133, :1680, :1700 only in operations; replay :1145; save :2990); `src/core/productionPhases.ts` :20-105; `src/core/tuning.ts` :59; `src/core/hollywoodTick.ts` :248-262; `src/core/types.ts` :237-248 (`Production`), :740-745 (`ProductionWorkflow`), :2135-2142 (`FirstTakeReceipt`); `src/core/index.ts` grep.
- Tests: `tests/p14b4-owner-enumerator-slice.test.ts` whole; grep of `assembleCapacityInput|classifyDetachedOffer|promiseCapacityOwners|promiseCapacityEnumerator` across `src`, `tests`, `bridge`, `ui`.
- Evidence: `559-enumerator-red.txt`, `562-…red-green.txt`, `562-…red-green.patch`, `563-…first-slice.txt`, `564-…ready.txt`, `565-…started.txt`, `566-…typecheck.txt`, `567-…adjacent.txt` (whole, two reads), `568-…bridge-types.txt`, `569-…independent.txt`, `570-…live-p2.txt` :266417-266426 (8.3 MB; summary and footer only) and grep of `549-adapter-slice-live-p2.txt` summary lines, `571-…b1-b3-controls.txt` :1-400 (in flight at read time; no summary/footer yet). `572-*`, `573-*`: ABSENT at my last glob.
- Context (not evidence): `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/560-W-report.md` whole; `561-T-report.md` whole. The writer's and test-author's run logs were not opened.

### Answers

**1. Law fidelity of the fresh-take floor and the certificate — MET WITH EVIDENCE. KEEP.**

- `FIRST_SHOOTING_TICKS` (enumerator :40-45) scans `TUNING.PRODUCTION_TICKS` (8, tuning :59) down to 1 and returns the first count whose phase is `'shooting'` under `productionPhaseForRemainingTicksOrNull` (productionPhases :77-81 over the table :36-45, shooting at 5 and 4) = 5; it throws loudly if no shooting week exists. `FRESH_TAKE_OFFSET = 1 + (8 − 5) + 1 = 5` (:47). RED E1 (:373-392) pins the value, the phase-owner tie and the formula cells; 562 GREEN.
- `earliestStartedTakeWeek` (:75-80): safe-integer invariant (:76-77); `remainingTicks < 5 → +Infinity` (:78) per 558's resolved ambiguity 1 and 555-B Q2 (replay :690 `historicallyFilmed = remainingTicks < 5`; operations :1680 is the sole take branch, confirmed by grep); formula `now + (startTick >= now ? 1 : 0) + (r − 5) + 1` (:79) = 555 §1 :26. The `+1` skip term matches operations :1658-1661 (a sweep at `currentTick` skips `startTick >= currentTick`), the `(r − 5)` decrements match the one-per-advance law, the trailing `+1` matches the produced-week stamp (555-B Q1 chain, tick :1102-1108 as cited; I did not reopen tick.ts). RED (iv) (:394-402) pins the arms; addition (i)/(ii) pin the chain on real states.
- Conditions (enumerator :99-106): `filmed` = `r < 5 || issuer-matched take` = (a′) exactly (555 §1 :28-29; replay :690-693 uses the same two tests). `forced` = workflow present ∧ `blocker === null` ∧ `shootingTask?.status === 'scheduled'` = (b) (555 §1 :30-32; operations :1683 is the exact negation). `bounded` = `floor >= claims.horizonEndWeek` = (c) (555 §1 :32), half-open correct (a take at week W counts iff `W < dueWeekExclusive`, 555-B Q4; a floor equal to the horizon lies outside). Failure of all three → the started omission with the 555 §1 :33 wording verbatim (:55-56).
- Fresh-admission gate (:107): omission iff `claims.horizonEndWeek > now + FRESH_TAKE_OFFSET`, so both flags are complete only when `horizon ≤ now + 5` (555 §1 :35-37, the 555-B Q4 correction applied to BOTH flags: :118 assigns one `flag` to both). RED E4 (:553-582) pins `now+5` complete and `now+6` both incomplete with exactly `[FRESH_ADMISSION_OMISSION]` under a loud producer precondition; 562 GREEN.
- Direction: the floor is used only negatively (:104 excludes a picture from the omission set when no take can land inside the interval; :107 widens the omission set when a fresh take could). Nothing asserts that a take will occur. This is plan :290-292's "valid hard upper bound" on a sub-domain, not :112's "minimum countdowns are not certified availability". PROVEN_IMPOSSIBLE on addition (i)/(ii) and the ineligible cells comes from the kernel's complete-domain count failure (kernel :944/:952 `complete ? impossible()`), offer-scoped (`scope: 'jointOfferOnly'` :935), never causal. Consistent with p14bf2 13 :101 / 14 :19: the un-enumerated alternatives are excluded by proof (the floor), not by absence.
- Over-certification: `complete` (:115-116) = every attempt complete ∧ no producer omission ∧ no scan omission ∧ (new) `attempts.length > 0`. That is 555 §1's conjunction plus one defensive conjunct. Under-certification: the extra conjunct can only bite when the producer returned zero attempts, and every such early-return shape in `replayPlans` (:2686-2687, :2696-2697, :2709-2710) carries an omission, so the two definitions coincide on every reachable input. I find no path certifying complete where 555 §1 forbids it, nor incomplete where 555 §1 requires complete.

**2. Producer use — MET WITH EVIDENCE.**

- Option β honoured: the only producer import is `replayStartedProductionPlans` (:24); `replayReadyProductionPlans` is never referenced.
- Whole `GameState` as `source` (:110): `StartedOwnerSource<P>` (replay :48-56) is a structural intersection of `Pick<GameState, …>` and fact views that `GameState` satisfies (566 root+UI typecheck EXIT 0; the replay's own `ReadyOwnerReplayInput` :78-80 already declares `source: GameState`). Bill identity: every `copyCost` call site (replay :677 `copyCost(production)`, :1321, :1630, :1656, :1671, :2606 Ready-only) bills a row object or a hold, never `source` or `source.studio`; `production` rows are the same objects whether reached through the state or through the test's pick (:243-251). RED E2 (:427-448) pins trace and holds byte-equal and `preparationWork === reference(seed 0) + domain.work` against a reference run on the pick; E8 (:734-735) repeats the sum; 562 GREEN. The type admits it lawfully.
- `traceKey 'enumerator:started'` (:53): 555-A §4 step 3's proposal; the RED pins non-empty only (:437) and reads the key from the result. Lawful.
- Run to `claims.horizonEndWeek` always (:111); the RED pins every hold's `until` at `{horizon, 0}` for now+2 (E2), now+4 (E6), now+5 and now+6 (E4); 562 GREEN. HORIZON_GUARD (owners :168) is satisfied by construction because `classifyEnumeratedOffer` (:125) passes `claims.horizonEndWeek` as the assembly horizon.

**3. Tariff and saturation — MET WITH EVIDENCE.**

- `w_e = 1 + N + W + N×T` (:92) with N = `studio.activeProductions.length`, W = `operations.workflows.length`, T = `firstTakes.length`, exactly 558's fixed formula (RED :237-241, E8 :730-731). Rival/absent-industry branch `w_e = 1` (:88) precedes the tariff (:87-89), per 555 §1 behaviours (1)→(2).
- Transfer once: `preparationWork: work` (:111) seeds the producer's `Work(limit, initial)` (replay :2681, :247 `used = min(limit, initial)`); the producer returns its cumulative `work.used` (:2775); assembly adds `claims.work` once (owners :176). One monotone sum into the kernel's `Budget` (:980). Plan :316-320 ("Charge/cap preprocessing too… linear inspection of owner collections") covers a linear scan tariff; 555-B Q8 classes it as the accepted 539-B Q6/553-R preprocessing class, not a cap/tariff change.
- Saturation `work > limits.work` (:93) mirrors the replay's own `>` law (:2693) and returns the replay's cut shape with the enumerator's label (:94-95 vs replay :2686-2687). Kernel then throws `WorkLimit` at :982 (`preparationWork >= limits.work`) → `UNCERTIFIED/workLimit`, `workUsed = limit` (:1034). RED (v) (:693-705) pins the shape, both flags incomplete and the kernel result; 562 GREEN.
- The rival shape `{fixedHolds:[], attempts:[], preparationWork:1, omissions:[]}` is lawful: 555 §1 (1) pins only "no producer run, both flags incomplete, no throw"; 558 explicitly leaves `preparationWork` unpinned; the rival omission already rides `claims.coverage.omissions` (owners :110) and is unioned at assembly (:170); RED E7 (:642-664) pins attempts `[]`, `work 1`, both flags incomplete, `RIVAL_OMISSION` in the kernel omissions; 562 GREEN.

**4. Coverage honesty — MET WITH EVIDENCE.**

- Scan omissions are computed before the producer call (:98-107) and returned regardless of a later cut (decision 6); the flags are incomplete on a cut anyway (:115). Truthful, never loosening.
- `complete` requires `attempts.length > 0` (decision 7): no certificate over an empty run.
- Exact wordings: `FRESH_ADMISSION_OMISSION` (:49-50) equals 555 §1 :40-42 and RED :57 character for character; the started omission (:55-56) equals 555 §1 :33 and RED :59-60; `ENUMERATOR_WORK_CUT` (:52) equals 555 §1 :61. E5 (:584-601) pins the started omission naming `w.productionId` on the real pre-`scheduleShootingTake` state; 562 GREEN.
- Dropped omissions: under saturation the scan is skipped, so no started/fresh-admission omission is emitted; that is the point of charging before expansion (plan :316-318), the flags are incomplete, and the kernel's `workLimit` result (:1034) reports `[phase work limit]` rather than coverage omissions in any case. Rival branch emits `[]` because the claims already carry the rival omission. Neither drops information the kernel would otherwise surface.
- Flag reads complete over a cut: impossible through the enumerator (:115). Through the exported 5-arity adapter a caller could hand-supply `COMPLETE` over a cut producer (E10 :766-769 probes this); `claimsAndHolds` is derived, not supplied (owners :169), so the kernel returns `UNCERTIFIED/domainIncomplete` at :1029 before `classifyDomain`. A hand-supplied `COMPLETE` over an EMPTY, uncut producer (surface :366-368) is the one shape the adapter carries verbatim; it is unreachable through `classifyEnumeratedOffer` (decision 7) and is a live-wiring rule (record-only item 6 below).

**5. The owners change — MET WITH EVIDENCE.**

- Fifth parameter with default `NO_ENUMERATION` (:148, :160) = `{incomplete, incomplete, [NO_ENUMERATOR_OMISSION]}`, reproducing the first slice's constants byte-for-byte; the union (:170) replaces the literal with `...enumeration.omissions`; sorted unique via `compareText` unchanged. E10 (:746-753) pins four-arity `toEqual` RED 7's hand assembly; the first-slice RED stays 33/33 (563).
- `limits` re-literal (:177) in the kernel's `MAX_LIMITS`/validation order (`claims, units, alternatives, work, span`; kernel :117, :975). E10 pins canonical key order for 4-arg, 5-arg and a permuted caller literal, value equality, digest equality across permutations, and the caller's object untouched (:771-781); 562 GREEN.
- Digest (:183-186) unchanged: still strips only `preparationWork`; E3 (:527) pins `preparationWork`-independence and (:529) a digest different from the first-slice digest of the same cell (coverage inside the digest).
- Runtime exports: the seven names are unchanged (surface :359-360 pins the RED-11 list; `'NO_ENUMERATION' in ownersModule === false` :361); `EnumerationCoverage` is `export type` (:146), no runtime key.
- Consumers (grep across `src`, `tests`, `bridge`, `ui`): `classifyDetachedOffer` (owners :206, 4-arity, default), the enumerator (:125, 5-arity), `tests/p14b4-owner-adapter-first-slice.test.ts`, `tests/p14b4-owner-enumerator-slice.test.ts`. No bridge, UI or `index.ts` consumer. For a canonical-order caller (both tests use `{claims, units, alternatives, work, span}`) the assembled bytes and digest are identical to the first slice; for a permuted-order caller the digest is now canonical (the intent of 553-R item 1; no such caller exists).

**6. `classifyEnumeratedOffer` and the paper cell — MET WITH EVIDENCE.**

- :122-127 is exactly collect → enumerate → assemble(5) → search → map, reusing `mapCapacityResult` (owners :188-202) with the plan :125-126 string (`UNCERTIFIED_BOTTLENECK` owners :24) and `scope` only on `PROVEN_IMPOSSIBLE` (:198). The module adds no receipt field, no `rulesVersion`/`week` (E3 :520-521 pins their absence), and no new user-facing wording beyond the three 555 §1 strings and two invariant messages.
- The `unbound(support)` cell measuring `IMPOSSIBLE/PROVEN_IMPOSSIBLE/completeCountFailure/jointOfferOnly` (RED :532-544; 562 GREEN; 560-W item "PAPER cell") is a lawful outcome: 555 §3 required the case to report loudly if the class differed and never to loosen; the kernel's only PROVEN_IMPOSSIBLE reason is `completeCountFailure` (:935-936), issued only when the certificate is complete (:952), which on the 2-week `w.ready` cell it lawfully is (Q1). It confirms plan :106 on this fixture; it is a measurement, not a new law, and stays offer-scoped.

**7. Purity and isolation — MET WITH EVIDENCE (by reading; E8 native).**

- No `Math.random`, `Date`, `tick`, `applyActions` or any action/tick import in the 127 lines; the replay's public entry is documented "Never calls tick/actions" (:2787). Imports are exactly the 555 §1 list: kernel, replay, owners, `productionPhases`, `tuning` (runtime) and type-only `promises`/`types` (:23-32). Not index-exported.
- No mutation: a local `Map` (:97), a local `omissions` array, spreads; `state`, `claims`, `limits` are only read or passed through. E8 (:709-736) pins structuredClone equality before/after, repeated-call equality and permutation invariance for promises/firstTakes/proposals; 562 GREEN.
- Loud invariants: :84 `claims were collected on another calendar week` (specific: names the mismatch class); :76-77 `week and countdown must be safe integers`; :44 `the phase owner has no shooting week`. None masks a failure; the messages are prefixed `Promise capacity enumerator:` (:35). A missing workflow (`workflowById.get` undefined at :102) is not swallowed: `forced` is false and the producer throws its own `production has no workflow` invariant (replay :681) on the same call path.

**8. The RED amendment (561-T) — MET WITH EVIDENCE.**

- Test-only (562 patch :49-112). :45 adds `ProductionWorkflow` to a type import; :305-306 annotate two `.find()` results with their natural `T | undefined` types (TS7022 cure); no assertion weakened (the `assert.ok(production && workflow)` narrowing and the loop body are untouched).
- Addition (iii) (:603-638): three real commands through `applyActions` at the same tick (`commissionScript` by the fixture writer; `signContract` of a market writer found via `hiringMarketIds` at `now`, with `expect(signed.market.tick).toBe(now)` :620 ruling out any advance; a second `commissionScript`), and the queue is asserted as the engine's own row (`toMatchObject([{ kind: 'commissionScript', queuedWeek: now }])` :622) with nothing minted (:623). No synthetic queue entry. Two `assert.ok` guards keep the case self-reporting (`UNCONSTRUCTIBLE: …`) on fixture drift. The pinned block :624-638 (producer `cut/unsupportedContext/current queue may admit new work`, both flags incomplete, `FRAGILE`/`UNCERTIFIED_BOTTLENECK`/`domainIncomplete`, the kernel omission string) is unchanged from the RED. The explanatory comment's line citations (tuning :632, occupancy :409-421/:441, scriptDevelopment :289-298/:311, actions :1634-1645, productionQueue :12-16) are the test-author's observed facts; I did not verify them and they are not load-bearing for any assertion.
- Everything 558 lists (surface, floor, certificate, classification, honesty, guards, purity, limits) is still pinned; the only removed text is the three permanently-throwing `UNCONSTRUCTIBLE` branches of the old (iii) body.

**9. Evidence sufficiency — MET WITH EVIDENCE for RED→GREEN and the first slice; the serial groups PARTIAL (in flight).**

- 559: `sourceSha 5e0e90bd…`, untracked = the RED only, exit 1, `Failed to load url ../src/core/promiseCapacityEnumerator.js`, `Tests no tests`. A missing-module RED named as such (558 :19-20).
- 562: `sourceSha 036ad231…` (the 558 publication that committed the RED), protected patch `16e522ed…` = the three-file diff, 45/45, exit 0, `fixedSource: true`. RED→GREEN holds on the amended RED. Caveat: no record-check capture shows the candidate against the UNAMENDED RED bytes; the writer's 44/45 with the sole self-declared `UNCONSTRUCTIBLE` throw is scratch only (560-W run 1/6, logs not opened by me). Since the amendment hunks are confined to :45, :305-306 and :603-623 and the other 44 cases' bytes are identical, I treat the chain as established; the parent may optionally capture the unamended run for the record, not required for KEEP.
- 563: first-slice RED 33/33 on the candidate, `fixedSource: true`. 564: Ready 17 PASS + the sole FAIL at `tests/p14b4-ready-replay-stale-target.test.ts:234` (`expected 'workLimit' to be 'commandRefused'`), the shape the brief attributes to 543/528 (I did not open those). 565: Started 28/28. 566: `npm run typecheck` (root + UI) EXIT 0. 567: adjacent 203/203 across 17 files, EXIT 0. 568: bridge tsc, sole `tests/bridge-p14b4-cast-class.test.ts(364,20): error TS2353`, EXIT 2 (the OLD one). 569: facts 7/7. 570: live-P2 `Test Files 6 failed | 5 passed (11)`, `Tests 83 failed | 110 passed (193)`, EXIT 1, `fixedSource: true`; 549's summary lines read the same totals over the same 11-file command; byte-identity with 549 NOT VERIFIED here (8.3 MB, no diff tool). 571: in flight at read; through :400 every listed file passes except the designated `p14b1-trust-chooser` test 6 (`:439` `expected 'studio-5a47d054-player' to be 'studio-5a47d054-r04'`, 1 failed | 2 skipped); no summary or footer yet, so the pass/fail set and `fixedSource` for 571 are NOT VERIFIED. 572 (bridge-p14b2-trust 22) and 573 (historical saves 137): ABSENT.
- Not verifiable by me: any SHA256; the writer's/test-author's scratch logs; the 561-T probe facts (D&C capacity 2, the writer `t-wri-11` in the market at tick 45); the parent's line counts beyond what Read shows (127 and 208 confirmed by Read).

**10. The ten writer decisions and the header drift — each classified.**

1. Whole `GameState` as `source`: lawful (Q2). Record-only: bill identity rests on the replay never billing `source` keys; E2 would catch a future change.
2. `EnumerationCoverage = Pick<JointTraceCapacityInput['coverage'], …>`: lawful; equivalent to 555-A's literal type, no runtime key, no new import line.
3. `'enumerator:started'`: lawful (555-A proposal; unpinned literal).
4. Rival shape `preparationWork: 1`: lawful; unpinned by design (558 ambiguity 3); consistent with E8's "tariff inside the bill". Record-only.
5. Saturation `>`: lawful (replay :2693 precedent). Record-only: at the exact boundary `w_e === limits.work` the enumerator does not saturate, the producer does (`Work` :247 seeds `used = limit`, :2684-2687), so the omission reads `work limit before replay preparation completed` rather than the enumerator label; flags incomplete and kernel `workLimit` either way. Truthful; not a defect.
6. Scan omissions emitted even under a producer cut: lawful and truthful.
7. `attempts.length > 0` in `complete`: lawful; a stricter-than-555 defensive conjunct with no reachable divergence (Q1).
8. Loud invariants: lawful (Q7).
9. Rival check before tariff: lawful (555 §1 order). Record-only: under `limits.work 0` a rival claim returns the empty shape, then the kernel's `WorkLimit` at :982 still yields `UNCERTIFIED/workLimit`; untested, truthful.
10. Doc comment (owners :150-158) corrected: lawful; the authorized content (type export, unexported constant) necessarily lands just outside the literal :151-168 body range (insertion at original :145, doc lines :148-149), and the parent's brief already lists the doc comment as part of the hunk. The module header at owners :8-9 ("coverage `existingCalendars`/`allOwnerTraces` stay 'incomplete' with the fixed omission") now describes only the default path: stale doc, record-only, one-line fix under parent authorization at commit time. Not a behaviour defect.

**11. Overall — KEEP.**

Prioritised evidence: (1) the certificate is exactly the 555 §1 conjunction, both flags floor-gated, never complete on a cut or empty run (Q1, Q4; E2/E4/E5/E6/(i)/(ii)/(iii)/(v)/E9 GREEN in 562); (2) the floor is derived from the phase owner and used only negatively, with the RED's natural-chain LAW and OBSERVATION both passing (Q1); (3) one Started run, option β, tariff transferred once, kernel budget law intact (Q2, Q3); (4) the adapter hunk is default-preserving and canonicalising, first slice 33/33 unchanged, seven exports unchanged, no live consumer (Q5); (5) purity and isolation by reading and by E8 (Q7); (6) the RED amendment is test-only and lawful (Q8). Nothing here is Owner acceptance, Save30/projection movement, or D1/D2 closure: the slice is detached (not index-exported, no receipt fields, `PROMISE_RULES_VERSION` untouched by the 562 patch), certificates exist only for `horizon ≤ now + 5` over filmed/forced/bounded started domains, and every ordinary launch window remains `UNCERTIFIED/domainIncomplete` with the named omission (555 §2/§3, 13 :104-106).

### Defects (demonstrated failures)

None in the candidate or the amended RED.

### Observations (record-only; no hunk required for KEEP)

1. Owners header :8-9 is stale (describes the fixed-coverage first slice); one-line doc correction at commit, outside the writer's range.
2. The authorized type/constant insertion sits at original :145-148, the doc edit at :148-149: outside the literal ":151-168" but inside the authorized content list; record the range as ":145-169 neighbourhood" for provenance.
3. Saturation boundary `w_e === limits.work` yields the replay's label, not the enumerator's (decision 5); truthful.
4. `FRESH_TAKE_OFFSET` derives from the phase table while the take fires at operations :1680's literal `=== 5`; the engine's :1133 invariant and the RED's E1 natural-chain LAW tie them (555-B Q6 caveat honoured). A table change without a take-branch change would move the constant in the conservative (lower) direction only.
5. `NOT_ENUMERATED` (:54) is a shared unfrozen constant with an empty `omissions` array returned by reference from two branches, the same convention as `NO_ENUMERATION`; the kernel copies/sorts omissions (:461, :933); E8 pins repeated-call equality.
6. Live-wiring rule to carry with 553-R items 1-2: the live path must call `classifyEnumeratedOffer` (or pass `domain.enumeration` from `enumerateOwnerTraces`), never hand-supply an `EnumerationCoverage`; the 5-arity adapter carries a supplied certificate verbatim over an empty producer (surface :366-368), guarded only by decision 7 inside the enumerator.
7. Condition (b) does not require `remainingTicks === 5`; a `'scheduled'` task at another countdown is unreachable by lawful actions (`scheduleShootingTake` needs phase shooting + `'ready'`; :1684/:1692 flip to 4/`completed` atomically), and (a′) covers r = 4.
8. `workflowById` is a last-wins `Map` while the producer uses first-match `find` (:680); duplicate workflows per production would violate an engine invariant; no lawful divergence.
9. Brief slip: the controlling plan text is `plans/P14B4-HEADLESS-PLAN.md` (:111-116, :124-129, :286-297, :306-321), not `P14-HEADLESS-PLAN.md`.

Also carried unchanged from 553-R: items 2-6 (rival gate before the adapter; named-root issuer/beneficiary tolerance; negative window edges; rival tariff omits P + A; dangling `promiseId`).

### Evidence limits

Read-only: nothing executed, hashed or diffed by me. SHA256s, the 561-T probe facts, the writer's 44/45 scratch run and the byte-identity of 570 against 549 are the parent's or the specialists' statements. 571 was mid-run (no summary/footer); 572 and 573 were absent. 564's "as 543/528" was not compared against those captures. The floor chain's tick.ts links (:410-412, :1102-1108) are taken from 555-B Q1's verified citations; I reopened operations, productionPhases, tuning, hollywoodTick, the replay and the kernel only. No native, usability, Save30, projection or Owner-acceptance claim.

### Next concrete action

Parent lets 571 finish and captures 572 (bridge-p14b2-trust, expected 22) and 573 (historical saves, expected 137), confirms 570 byte-identical to 549 and 571's pass/fail set identical to 557 with the sole designated test-6 FAIL, then records 574-R as KEEP and stages exactly `src/core/promiseCapacityEnumerator.ts`, `src/core/promiseCapacityOwners.ts` and the amended `tests/p14b4-owner-enumerator-slice.test.ts` for the enumerator-slice commit, with the owners :8-9 header fix as a separately authorized one-line doc hunk (or deferred). The enumerator's certificates on long windows remain gated by D2 and the Ready staffing slice; D1 stays open; no live wiring follows from this record.
```
