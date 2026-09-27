# 1119-B — Independent complete-suite review

This is the independent review of the actual final core/UI observations, not an all-green qualification. Both runs are closed and the author's frozen1119-A report has been cross-checked. Disposition: **KEEP the complete observations and bounded cause attribution; full passing qualification remains unestablished.** Review work used source reads, Git reads and standard-library-only log/JSON/hash analysis; no project code, tests, compiler, simulation, producer or maintenance helper was executed, and no consumed source or index was changed.

## Closed core identity and independent comparison

Record `1100-c3-final-core` ran the exact whole-core command `node_modules/.bin/vitest run --project core` on `6e63f4c82a286dc67271cce0d53a0e586a6b523b`. The recorder closes 2026-09-27 08:30:52.885–09:41:26.460 UTC, 4,233.575 seconds, child1, fixedSource:true, empty consumed diff, no untracked source, null signal and error. The raw 683,789 bytes independently hash to `5e2e00ea5278d420b318ec0f0c1635f2cb067998acbf9ba7fa1512de54469ac6`; its 630-byte record hashes to `7161ad41323aeadf527654d41f78e107ab6c7773dedb4f8ba5fd35ae40acf0f9`.

Actual totals are 399 files (365 PASS, 34 FAIL) and 4,685 cases (4,591 PASS, 83 FAIL, 11 TODO). The detailed failure parser independently resolves 83 unique identities, 63 diagnostic groups and seven shared-header groups. No unhandled-error/rejection/uncaught-exception marker was found. Thirteen failures have no printed source frame; no internal failing operation can be inferred from the absence of a frame.

The matched baseline is the actual full 927 run, with the same command, 376 files/4,446 cases, 4,377 PASS, 58 FAIL and 11 TODO. Its raw 1,324,620 bytes independently hash to `3b704aa3f1f4e16ad2e7dcff63590c08f572657f65616e8788ae9d89f35e7997`. The later 932/934/936 dispositions remain a full observation plus separate focused repairs, not an invented full run with 55 failures.

I independently parsed both raw logs rather than deriving the result from summary counts. Consecutive detailed FAIL headers sharing a diagnostic receive the entire body individually. Primary comparison trims only outer/per-line trailing whitespace and ends before the first printed frame; complete tails, source excerpts and first frames are considered separately. No title/path/number normalization entered the strict sets.

| Strict identity/primary comparison | Count |
| --- | ---: |
| New identities | 28 |
| Vanished identities | 3 |
| Common identities with identical complete primary | 53 |
| Common identities with changed complete primary | 2 |

This reproduces the independent author's complete comparison artifact `1119-A-core-comparison.json`, 2,224,747 bytes / `5b8b1bb00b23d59f4a5b1c54c499c1c3c6bd07010f592df1ef66f8ec6c19e35c`. The artifact retains all exact identities, bodies, shared groups, first frames and full tails; the compact table below is a source-cause index, not a substitute for those raw diagnostics.

One changed body differs only in the previously allowed scenery exporter's exact temporary `--output` suffix, `studio-scenery-export-yHJHNJ` versus `studio-scenery-export-QfgVby`. Replacing that single bounded suffix in each body makes the entire primary equal. No other path, number, source frame or error is normalized. The second changed body is materially different: campaign-library legacy recovery previously timed out at 5,000ms and now refuses inconsistent age/provenance before creating its runtime. It stays a changed cause.

Therefore the 83 are 54 inherited primary causes including that named exporter exception, one changed inherited cause, three separately recorded C.3 failures and 25 newly observed fixture/boundary failures. They are not 83 inherited failures.

## Source verification of the newly exposed boundaries

The following checks independently follow the actual first frames into current test/helper and validator source. They identify why the observed assertion was not reached; they do not claim later assertions pass, approve a repair, or establish a new production defect.

| Source and affected leaves | Independent finding |
| --- | --- |
| `tests/bridge-p13b-r07-setup.test.ts:587` (1) | Successful current save is38; the assertion still expects37. The subsequent current reload message is masked. This is a current literal, not a historical fixture pin. |
| `tests/helpers/p14c2rm-fixtures.ts:212`/`:217`, called by both alumni leaves at `bridge-p14c2rm-retirement.test.ts:289`/`:314` (2) | The actual film release and retirement156 are admitted first. The helper then eagerly substitutes the released Writer credit and admits the synthetic variant before returning either branch. That changes C.3 retained transition context after the recorded evaluation; `professionHistory.ts:190` correctly refuses it. Thus even the natural read-model leaf is masked by the separate synthetic setup. Do not rewrite the recorded evaluation or weaken evidence reconciliation. |
| `tests/c2a-m2-sets-save.test.ts:227`/`:309` (2) | Native founding/operations includes current entrant authority, but `v13TwinOf` attempts to discard it. The exact `_v14Contract.ts:469` semantic-loss guard now refuses. The downstream manually built live carrier is not yet reached. The appropriate future remedy is an admitted old substrate for the old milestone, not deleting entry authority or relaxing the twin guard. |
| `tests/casting-sessions-save-v10.test.ts:130` and old-builder calls (5) | `managedState` changes the generated current clock and operations/script/casting roots before historical projection. Three leaves hit stale age at week1; two hit placement/operations mode disagreement. None of those first failures contradicts frozen V9/V10 persistence or the intended old validator's negative causes. |
| `tests/d12-economy.test.ts:236`, `d14-star-power.test.ts:242`, `production-operations-save-v8.test.ts:218`, `ruling-a-development-in-play.test.ts:423` (4) | Each strips younger roots, including operations, from a carrier still bearing current C.3 authority, before calling a frozen builder. Current full admission reaches the nested V25 missing-operations refusal. The old gross/fame/forecast/development oracle is downstream. |
| `tests/frozen-save-builder-projection.test.ts:52` (1) | The unknown `futureV11State` field is put on a current38 carrier before old projection. Current full proof rejects the unknown root. Preserve unknown-root omission tests on an admitted historical substrate; do not admit the unknown root into current saves. |
| `tests/p11-finance-report.test.ts:60`/`:80`, `p12-starting-world.test.ts:31`, `roster-wall-artifacts.test.ts:255` (4) | The current generated/founded clock is changed to20,519 or196 before V10/V18 builders. Stored ages cease to match immutable provenance. Partial cash coverage, old company-entry boundaries and the artifact counterfeit's intended refusal are masked. Broadening the counterfeit regex to accept the unrelated age error would weaken the test. |
| `tests/p13b-s1-validation.test.ts:55`/`:68`, `p13b-s2-validation.test.ts:98` (3) | Scientist mutants copy only `.talentProvenance` from the canonical append owner. `withTalentProvenance` also returns `careerLifecycle` with the entrant anchor (`src/core/aging.ts:262`); dropping that return causes person/anchor coverage refusal before the intended employment/capacity negative. Preserve the complete canonical append and the original fault. |
| `tests/p13b-s8-finance.test.ts:188` (1) | Fresh Hollywood initialization created real entrant authority. Recasting age-provenance rows does not make that authority losslessly representable in V26; actual downgrade correctly refuses. A genuine historical movement substrate must precede migration, rather than relabelling/deleting current creation facts. |
| `tests/p14b4-cast-class-policy.test.ts:36`/`:228`/`:264` (2) | The labelled synthetic age input recreates provenance at week196, moving an entrant's entryWeek while leaving the actual profession anchor at its original week. The exact entrant chronology guard (`professionHistory.ts:152`) refuses. Preserve the deliberately varied age and histories while retaining the original creation date in any later reviewed repair. |
| `tests/bridge-p12-campaign-library.test.ts:217`/`:219` (1 changed cause) | Different-world old-slot setup changes generated clocks to53/520 before V18 projection. The first53 carrier now fails stored36/derived37. This occurs before runtime construction and is neither an observed recovery defect nor a proven timeout improvement. |

The rows marked as new total25 failing identities. The campaign-library row is the separate changed identity. The common production boundary is intentional: `save.ts:6138` performs complete Save38 proof before an old builder discards reconstructible C.3 scaffolding, and `professionHistory.ts:59` refuses semantic loss first. These guards must remain strict. Fixture repair requires an actually admitted intact source and appropriate old envelope before old-only mutations; merely deleting six fields or patching a modern carrier around its next error is not sufficient.

## Preserved execution and inherited limits

The three vanished927 leaves are not credited solely because they are absent from the failure list: their complete current files actually execute31/31 (`bridge-contract-generator`),68/68 (`bridge-runtime-checkpoint`) and22/22 (`bridge-schema`) PASS. The checkpoint file has one added case. The other23 added core files execute238 cases,235 PASS/3 known C.3 FAIL, so4,446+238+1=4,685, with no removed baseline file or new skip explaining the changed scope.

All23 matched inherited failures from1094/1118 recur with identical complete primaries. The three B2 poaching failures still have the208-versus52 first cause at helper198, matching991. The precise full diagnostics remain the authority, not a family-wide allowance.

The two canonical098 L failures match1031's `noCatalogue` terminal607/no-hire premise. K transition evidence passes; actual passive Writer hiring, payment and subsequent work remain unproved because the cached premise stops those assertions. The new R8 identity matches1043's complete5,000ms timeout text. Standalone1050 proved the original coordinator sequence with two actual advances and an in-memory store, but did not pass Vitest or establish latency, real-disk endurance or native behavior. Those limitations are retained.

FU-2 recurs with the20,000ms timeout primary identical to927. Its earlier isolated931 pass remains separate. A timeout without operation markers does not prove the same await stalled or select a particular source operation; displayed leaf durations do not supply that attribution. No timeout increase, automatic retry, environment-noise explanation or performance claim is authorized by this review.

Among55 common identities,54 first printed frames match. Forty-nine complete tails match; the six different tails are campaign's actual changed cause, the exporter path, three B2 caller line shifts and one B5 caller line shift. B2/B5 retain their original first helper frame and primary body. Full tails remain preserved rather than silently discarded as “same error.”

The separate completed type/generator/fixture review is frozen in1119-C. It does not turn this core child1 into child0.

## Closed UI identity and independent comparison

Record `1101-c3-final-ui` ran exact `npm run test:ui` at the same6e63f4c8 source, 2026-09-27 09:42:30.909–09:57:11.194 UTC, 880.285 seconds, child1, fixedSource:true, empty consumed diff/untracked lists, null signal/error. Its raw423,106 bytes independently hash to `40e4eec4bceea1850c78cb31686ec8fcaf385a4dec68dc7c2c93bdcd611fb645`; record595 bytes hashes to `0346f4b88d67777f5e9191a42216767dec56e304a9ffec910c56ebb3da83a710`.

Actual totals are203 files (191 PASS/12 FAIL),2,695 cases (2,651 PASS/39 FAIL/5 skipped), plus one separately reported unhandled exception. The failure parser independently resolves39 unique identities/36 groups/one shared group. The comparison is against the actual713 whole UI run: same command,201 files/2,690 cases,2,655 PASS/30 FAIL/5 skipped, plus one unhandled exception. Its raw350,073 bytes hashes to `3e94533ca03dacda12c427ca1cd87b37c78640776cd5a68da86dc6c2bd5bbd31`.

| Strict UI comparison to713 | Count |
| --- | ---: |
| New identities | 16 |
| Vanished identities | 7 |
| Common identities with identical complete primary | 15 |
| Common identities with changed complete primary | 8 |

All23 common identities retain the same first printed frame;15 complete tails match. The eight changed bodies are not silently normalized away:

- Three `authored-rgba-export` leaves differ only in one exact temporary image path each: `rgba-export-WZtzvn`→`rgba-export-EWPnmw`, `rgba-export-det-bosU39`→`rgba-export-det-84e2Jj`, and `png8-still-l0MXyw`→`png8-still-q3yudB`. All other primary lines, including the actual Python/PIL refusal, match. These are explicitly bounded path-only differences, preserved in the strict changed set.
- Five `WorldFirstWorldInspectorDefault` leaves retain the duplicate-query errors for `lot-nav-writers`/`lot-nav-casting`, but their printed DOM differs in selected/aria-current state, attention status/text and cash. These actual DOM differences are retained; neither generic number normalization nor the shared first line makes the complete body identical. They remain within the individually documented FU-1 investigation, not a blanket inherited exemption.

Git comparison of713 source to6e63 shows no edits to any existing UI test file. The only added UI files are `StudioCalendar.retirement.test.tsx` (2/2 PASS) and `StudioCalendar.career.test.tsx` (3/3 PASS). All201 prior files remain, with unchanged individual case counts; the same five skips belong to the same56-case audio-service contract file. Thus2,690+5=2,695. The seven vanished failed identities were executed and passed in this observation; they were not removed or skipped. This is evidence about this run, not evidence that a fluctuating UI failure has been repaired.

## UI first-cause source review

| New UI identities | Count | Evidence and limit |
| --- | ---: | --- |
| `engine/d17-save-migration` two leaves; `engine/film-chronicle-adapter` chronology reload; `lot/snapshot/v14SetHolderBoundary` roundtrip; `saves` exact roundtrip; `session` three V5/V8 restore leaves | 8 | Each actual current writer/import produces38, but a current-boundary assertion still expects31. The old fixture version and subsequent migration/disclosure/byte assertions must be preserved; only the observed stale current pin is demonstrated here. |
| `saves.test.tsx` three migration-disclosure leaves | 3 | `legacyV8SaveJson` at73 removes `scriptDevelopment` from an otherwise current carrier before calling V8 builder. The unchanged complete-current proof now reaches the nested V12 required-field refusal. The UI navigation assertions are not reached. Use admitted historical substrate before the intentional old omission; do not weaken whole38 admission. |
| `WorldFirstLotNativeCastingReviewApp` two blocked mount leaves and imported replacement; `WorldFirstLotNativeCastingReviewAppAuthority` blocked accepted successor | 4 | Both `blockedReviewState` helpers rewrite every Director's current primary role toActor without anchored change history. The explicit replacement export atReviewApp616 throws the exact profession-history guard. The three mount leaves ignore `saveActiveSession`'s boolean (`renderStudio`/`mountStudio`); `session.ts:39` catches that serialization refusal and returnsfalse, and the observed DOM is the New Studio front door. This is a source-demonstrated shared malformed-fixture chain, not a FU-1 timing attribution. The returnedfalse was not separately instrumented in this run; the explicit export error, exact fixture mutation, catch path and front-door DOM are the supporting evidence. |
| `WorldFirstLotNativeNextEventApp` rejected-import/declined-restart reaction preservation | 1 | Its second `openSavesFromExactReaction` call waits for `dashboard-releases-heading` at1929/1971, while the printed DOM retains the Lot with next-event-reaction focus. This exact identity does not fail in673,713-X's unchanged-source full rerun or713. The later1102 isolation reproduces its complete diagnostic, as recorded below. No source-supported internal causal diagnosis has yet been established. It remains a new unresolved observation; membership in a file named byFU-1 does not classify it as noise or inherited. |

No current blocked fixture may be made valid by falsifying profession history, and no old-save negative may be made green by broadening its refusal regex. A separately labelled historical blocker input or a genuinely reachable current blocker requires its own precise premise and independent assertions. No such candidate is evaluated by this attribution review.

## Unhandled error and reliability disposition

The unhandled body is literally identical to713, including source frame and origin:

`TypeError: viewRef.current?.hollywoodPerformance is not a function`, `StudioLotScreen.tsx:4854:37`, then Node timer frames. Vitest names `StudioLotIdentityReview.test.tsx` and the latest test `each mode drives setIdentityMode / setReducedMotion correctly`. This is one unhandled exception in addition to39 failed cases; it is not folded into or excused by the case count. The recorder's null process error does not mean no application/test unhandled error occurred.

Record719 remains controlling forFU-1: aggregate pass/fail count has no reliable source-change signal, but individual failures are real evidence. The original673/unchanged-source713-X/713 totals26/32/30 and14 intermittent identities do not pre-authorize these new failures. The required three consecutive full UI observations at unchanged source with identical counts/identities have not occurred; this run does not closeFU-1. Assertions, skips, retries and thresholds remain intact. The historical phrase “UI not rerun” no longer describes current evidence; UI was rerun and failed as recorded, while the reliability issue remains open.

Core and UI both completed under fixed-source guards and both exited1. The complete observations are suitable for cause-specific follow-up and recoverable checkpoints, not a claim of all-green full qualification or a closure of the named runtime/market/reliability gaps.

## Separate closed navigation isolation

Parent's single original-leaf isolation `1102-c3-ui-reaction-isolation` ran after the full UI closure on documentation-only successor `bc2492be0c6b4a0e32c1496c5bdff1344fb0c9d2`, unchanged consumed source. Exact original selector and default timeout are recorded; 2026-09-27 10:01:01.122–10:01:12.652 UTC,11.530 seconds, child1/fixedSource:true/empty diff/untracked lists. It observed one FAIL and35 filtered peers, not a new full-file or full-UI result. Raw30,483 bytes hashes to `db3ccb7d8445fa1aacb5f1cc789cb4b4891b7edfb4279e59da900c1e10d94b01`.

Independent parsing confirms the selected identity's entire primary **and complete diagnostic tail** are literally equal to1101, including the second open at1929/caller1971. The first open, rejected import, restored rail/focus and retained accepted bytes were asserted before that point. No later declined-restart assertion is qualified. The relevant original test, rail and Lot-screen bytes are unchanged since713; that fact bounds the source investigation but does not prove an environment cause or absolve a reachable changed dependency.

Disposition: retain this new reproduced navigation failure separately from the fixture maintenance and knownFU-1 variations. A defensible next bounded diagnosis observes the actual second-click callback and its guard/result path with the original assertions intact; source presence of a virtual-tail or presentation guard alone does not identify which guard ran. No speculative production fix, assertion weakening, retry-to-green or threshold change follows from this record.

## Separate temporary observational trace and restoration

I reviewed parent's exact `1124-next-event-diagnostic.patch` (1,852 bytes / `e096196a907e3dfc6d6b81852f4d90e74c807e11f42511876d985d61edd34066`) and manifest (835 bytes / `16ffa272cc48e7eb1fdf45473898b15dcb7e48fd674ed43fd0afb3936fb5357d`) before application. Read-only in-memory reconstruction matched both declared postimages. The patch adds exactly four console observations: rail reset, pre-guard click, post-claim activation, and App details pre-guard. No branch, ref write, timer, test, receipt or game state changes; additional owner/receipt comparisons are pure. I explicitly limited source KEEP to one diagnostic, with logging's potential timing effect preserved.

The actual `1103-c3-ui-reaction-trace` closes 10:05:03.231–10:05:14.308 UTC,11.077 seconds, child0/fixedSource:true atbc2492be with exact instrumented diff `f5f843afc211c9abf246982c553b21756f3acc9dd071db07d62cbaffac4771df`. It observes one PASS/35 filtered peers. Raw2,723 bytes / `5b54e8118de1e473cd4b59e79c3c23983cbdbbe689910cb31af7713e145b0e04`; record788 bytes / `4a74507582616ff4eb9bb47f82c58338d28c5af32a551bb2f85e95312d5a20b3`.

Both observed deep clicks have detail0, no suspension/hidden/disabled/claimed/held-key/virtual-tail barrier and no captured token. Both reach activation and App, where owner/rendered/accepted/session/receipt checks all pass. Reset0→1 is observed on each return. **No failing guard was observed.** A pass with observation code cannot prove an unmodified pass, causal correction, cleared race or latency improvement. The original full1101 and unmodified1102 failures remain untouched.

Parent reversed only this exact temporary patch. I independently reread both live files and matched original preimages: `LotNextEventRail.tsx`35,569 bytes / `8ed9f372c14aeb359782ca4bc9b0405c43566c938c4cd4634c3c1b6c04195379`; `App.tsx`208,747 bytes / `f33655b5af305834052e5dc092c2dbad96bb85e77d0dab538a0fc733e207d940`. Restoration audit1,618 bytes / `d5e2482fdfb3ae139074672cee7abfac96180ea0c58092c31a04a02c9d780308` embeds the closed record and records empty consumed diff/untracked source. No diagnostic production change remains.

## Frozen report cross-check and final bounded disposition

The final1119-A report is27,157 bytes / `48f4823c31af5215921a4fad1b78a5249ecccc436303d7706f975976587c1d91`. Its preceding26,662-byte identity `31d56fa1eeb58a521337395b115987c09730d1966ca46d25f7aebf992138611e` is explicitly retained in its revision note. Its core comparison is pinned above; UI comparison is629,402 bytes / `71d3637d2ca78cbece1e53b2f0fa5c1407bab66709c4083873b2ff0443265514`; isolation comparison41,160 bytes / `0308186290db76fc8b24d8ddcf149d0c590e034ac7d66cfc2c5555bcdd67003c`. An independent raw parser matched **every** core/UI identity, primary byte string/hash, complete tail, first frame and strict comparison set against both machine artifacts. The report's through1102 cutoff remains separate from my later1124 trace review above.

The final1119-A corrects exactly one prose point: the NextEvent printed DOM is a recovery-notice banner **plus the mounted Lot** with next-event-reaction focus, not the New Studio front door seen in the three blocked-Casting fixture failures. I mechanically reversed that sentence and removed only the appended revision note in memory, reconstructing the exact prior26,662-byte hash. The strict comparison artifacts and causal disposition remain unchanged.

KEEP the records as accurate fixed-source observations, the matched-baseline comparison and the source-supported fixture/version attribution. Do not assert an all-green core or UI run. Subsequent staged fixture repairs require their own independent source review and actual cause-matched checks; this review does not credit those unexecuted assertions.

After such repairs, a bounded C.3 component disposition can cite its actually qualified persistence, lifecycle, projections, focused UI and mixed-source endurance evidence while explicitly retaining canonical098 passive Writer-work absence, R8/FU-2 timing failures, FU-1 instability/unhandled error and the newly reproduced navigation failure. That would not establish general UI reliability, all natural-world routes, complete P14 readiness or a passing full suite. Current evidence supplies no basis to change C.3 law or to make a speculative production UI fix; the unresolved navigation diagnosis remains a separate engineering obligation with its original failure visible.
