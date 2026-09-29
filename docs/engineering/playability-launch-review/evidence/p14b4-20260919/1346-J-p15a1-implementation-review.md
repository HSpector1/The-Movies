<!-- 1346-J: independent implementation review (contract-auditor, read-only) of 1346-E, saved verbatim by the parent at HEAD c8c15e48 from the agent's final text -->

# Independent review 1346-J — P15A.1 Wave 1 production (`src/core/sharedMarket.ts` + `src/core/tuning.ts`)

**Verdict: KEEP**

Scope reviewed: `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-stage/1346-p15a1-production.patch` (398-line `src/core/sharedMarket.ts` + 13-line `src/core/tuning.ts` addition, unlanded — confirmed absent from `src/core/` at HEAD) against `1323-A §3` as amended by `1323-F`, Owner ruling **D-1323-1** (quoted verbatim below from `1340-O`), and the parent's API decisions in `1346-X`/`1346-F`/`1346-X4`. Tests: `1346-stage/1346-p15a1-red-r3.patch` (33 leaves). Independently re-derived line numbers below are the patch's own new-file line numbers (sharedMarket.ts: patch line − 6; tuning.ts: patch line + 574), not re-run — I read source and evidence files only (read-only role, no shell/tsc/vitest available to me).

D-1323-1, quoted exactly (`1340-O` lines 47–57):
> "Approve the complete 1323-A formula as amended by 1323-F: four-week weights 1.00/0.55/0.55/0.20; stock 0.20 from R+4, half-life 13 weeks, retired at R+26; one unit per release; per-studio same-genre window cap; factor 1 - 0.25 * (1 - exp(-P/2)). Retain self-exclusion, same-week symmetry and all specified boundaries. Treat the constants as provisional tuning, with the planned Wave 4 KEEP/REVISE/REJECT playtest."

## 1. Law, line by line

| Requirement (1323-A §3 / D-1323-1) | Status | Evidence |
|---|---|---|
| Window weights 1.00/0.55/0.55/0.20, offsets 0–3 | MET WITH EVIDENCE | `sharedMarket.ts:79-94` (`exposureWeight`) reads `TUNING.SHARED_MARKET_WINDOW_WEIGHTS`; `tuning.ts:993` = `[1, 0.55, 0.55, 0.2]`. Confirmed GREEN on `market-exposure-weight-window-lane-offsets`, `market-decay-boundaries-r3-r4`. |
| Stock `0.20·2^(−age/13)` from R+4 | MET WITH EVIDENCE | `sharedMarket.ts:93-97`; `tuning.ts:994-995`. Independently hand-verified continuity at R+4 (0.20↔0.20) and R+25 (≈0.0653) against `market-decay-boundaries-r3-r4/-r25-r26`, plus a dedicated `assessBatch`-level stock check (`market-stock-term-through-assess-batch`) closing 1346-D Blocking 1. |
| Retirement at t ≥ R+26 | MET WITH EVIDENCE | `sharedMarket.ts:98-99`; `tuning.ts:996`. `market-reduce-exposures-retire-boundary` distinguishes offset 25 (kept) from offset 26 (retired) exactly. |
| One unit per release | MET WITH EVIDENCE (functionally); see gap below | Contribution is exactly the lane weight, no double counting. |
| Per-(studio, genre) window clamp at 1.0, exactly-1.00-not-clamped | MET WITH EVIDENCE | `sharedMarket.ts:221-262` (`assessSubject`/`foldWindow`); clamp test is `studio.raw > cap` (strict). Hand-traced against `market-studio-window-clamp` scenario 1 (2×0.55 → clamped, pressure 1.0) and scenario 2 (1×1.00 same-week peer → not clamped) — both traces match the GREEN result exactly. |
| Unclamped stock | MET WITH EVIDENCE | `sharedMarket.ts:208-211` sums `stockTerm` with no cap; `market-stock-term-unclamped-same-studio` puts 6 same-studio stock exposures (raw sum > 1.0) and asserts no clamp — GREEN. |
| Factor `f(P)=1−0.25(1−e^(−P/2))` | MET WITH EVIDENCE | `sharedMarket.ts:97-113`; `tuning.ts:997-998`. |
| Self-exclusion | MET WITH EVIDENCE | `sharedMarket.ts:221-236` (subject's own count subtracted from its own studio before re-clamping); `book.sameWeekSources.filter(s.releaseId !== member.releaseId)` at `:245`. `market-one-player-one-rival`'s solo case (pressure 0) confirms. |
| Same-week batch: pre-batch snapshot + each other, neither early | MET WITH EVIDENCE | `assessBatch` (`:149-219`) builds all genre "books" from the full exposure list and the full member list *before* any subject is derived — no per-member ordering dependency. `market-same-week-batch`, `market-order-reversal`, `market-owner-swap`, `market-id-swap` all GREEN. |
| Genre eligibility (own-genre only counts; non-catalogue genre) | MET WITH EVIDENCE / minor note | `market-different-genre` passes (off-genre exposure and off-genre peer both contribute 0, result is `NO_PRESSURE`). Non-catalogue genre values are rejected by `requireRelease` (`:389-395`) with a thrown error rather than a "typed ineligibility reason" — reasonable given `Genre` is a closed TS union and this is a caller-bug case, consistent with the writer's disclosed "fail loud on malformed input" design (handback item 7), unchallenged by any reviewer. Not a defect. |
| Canonical `(week, releaseId)` ordering, no studio/owner/enumeration order in the formula | MET WITH EVIDENCE | `canonicalMembers` (`:367-369`) sorts by `releaseId` (week is batch-constant); all aggregation uses integer counts per fixed offset folded in a fixed order (`laneSum`, `:308-313`), not raw floating sums in arrival order. `market-order-reversal`/`-owner-swap`/`-id-swap` GREEN at 1e-9 tolerance (the charter's "exactly" is operationalized at that tolerance by the accepted RED; the writer's own claim of bit-for-bit `Object.is` invariance under permutation is a throwaway probe, not in the committed evidence — see NOT VERIFIED note below). |
| Reasons: codes/≤5/one-per-code/value=full sum/sourceReleaseIds≤5 heaviest-first, ties ascending | MET WITH EVIDENCE (impl.), test gap noted — see §5 | `sharedMarket.ts:239-263` (`reason()`, `assessSubject`); `keepHeaviest`/`compareSources` (`:319-327`) sort descending weight, ascending id tie-break, capped via `MARKET_REASON_SOURCE_LIMIT`. Confirmed by `market-reason-source-ids-ordering` and `-window-releases` (exact array equality, including a genuine tie), and the writer's M4 defect-injection (insertion-order regression) was caught by the r3 leaf. |
| `reduceExposures`: append at W, retire at t≥R+26, transitions only for pre-existing exposures | MET WITH EVIDENCE | `sharedMarket.ts:341-363`. Hand-traced `market-reduce-exposures-lane-transition` (window→stock at R+4, stock→retired at R+26) and `-append`/`-retire-boundary` against the code — all match. Appended members never enter the transitions loop (`:356` iterates only `exposures`), matching 1346-F's "appended members report no transition." |
| No studio flag or owner in the formula | MET WITH EVIDENCE | `studioId` used only as an opaque grouping key; no "isPlayer"/owner branch anywhere in the file. |

**Gap found, not previously flagged by any reviewer:** 1323-A §3 (unamended by 1323-F, which states "1323-A stays byte-frozen" except where it explicitly differs) reads: *"Contribution. c = 1 per eligible release in v1... the scaling seam is one named function returning 1 in v1."* No such named function exists in the delivered code — the "1" is baked directly into the window/stock weight computation with no distinct, forward-compatible seam. Functionally this is inert (the computed numbers are identical either way) and untested by any of the 33 leaves, but it is a literal, unamended clause of the frozen charter text that the patch does not implement. **Non-blocking**, but should be named for the record.

## 2. Purity

MET WITH EVIDENCE. No `Math.random`, no `Date`, no I/O anywhere in `sharedMarket.ts` (confirmed by full read). Inputs are never mutated: `exposures` is only iterated; `canonicalMembers` copies before sorting (`:367`); `reduceExposures` returns kept exposures by reference without touching them (`:341-363`). Determinism is independently confirmed, not just self-reported: the parent's own dry-run log (`1346-X4-green-run.txt`) shows the two harness leaves (`market-harness-normal-stream-bounded-active-set-and-determinism`, two full 6,240-week runs byte-identical; `market-harness-hostile-batch-work-bound-and-active-set`, second run over deep-cloned inputs byte-identical) passing at `33 of 33`, and the three type gates (`1346-X4-tsc-root.txt`, `-tsc-ui.txt`, `-tsc-bridge.txt`) are empty files, consistent with the claimed exit-0/no-output result.

**NOT VERIFIED (informational only):** the writer's stronger claim of bit-for-bit (`Object.is`) invariance under studio-id/release-id bijection plus array shuffle, and the O(n²) naive-reference cross-check, are described in `1346-E` as "throwaway probes, never in the patch" with no committed script, hash, or log in the evidence directory. The charter-level symmetry requirement *is* met (at the 1e-9 tolerance the accepted RED actually pins), but the stronger claim rests on an unreproduced self-report per the project's evidence-hierarchy convention (a single self-run claim is not the same as an independently reproduced one).

## 3. Work bound (1323-F Amendment 3)

MET WITH EVIDENCE — the step counter is honest. Traced `assessBatch`/`assessSubject`/`foldWindow` in full: `step()` fires exactly once per exposure (`:183`, before the retired-lane `continue`, so retired exposures still count), once per member (`:201`), once per subject (`:216`) — giving `steps.count === exposures.length + 2·members.length` **exactly** (confirmed by 1346-E: 5,024 on the 512-member/4,000-exposure hostile batch, matching the harness leaf's asserted bound `ACTIVE_COUNT + 2*hostileMembers.length`). Everything the writer names as "outside the counter" is genuinely bounded and does not hide input-size-dependent work:
- The canonical member sort is `O(m log m)` once per batch — sub-quadratic, disclosed in the module header (`sharedMarket.ts:26-31`), not something Amendment 3's "rather than O(batch²)" language rules out.
- The per-genre stock finish (`:208-213`) is `O(genres × stock-offsets) = O(6×22)`, a fixed constant independent of batch/exposure size.
- Every per-subject and per-fold data structure (`studio.sources`, `book.sameWeekSources`, `book.windowSources`, `book.stockSources`, `book.clampedTop`) is incrementally maintained at a hard-capped size (≤6 or ≤7 entries) via `keepHeaviest`, so the sorts inside `foldWindow`/`assessSubject` are `O(1)` regardless of active-set or batch size — there is no hidden per-subject loop over `active` or `members`.

This satisfies the substance of Amendment 3 (ruling out `O(batch²)`), and the counter itself is a faithful, non-under-counting proxy for the actual work performed.

## 4. Ruling F1 — the one-ULP floor (`sharedMarket.ts:97-113`)

Sound and honestly documented: the deviation is disclosed in-line (`:109-110`, "the law returns the next double above it") immediately beside `nextDoubleAbove` (`:115-119`), matches the parent's own KEEP ruling in `1346-X4`, and the magnitude (1.1e-16) is immaterial to any money computation.

**My recommendation: drop the floor, keep the plain formula, and loosen the RED assertion to `toBeGreaterThanOrEqual(0.75)` (or test only realistic P, e.g. ≤20).** Reasoning: `1 − 0.25·(1 − e^(−P/2))` reaching exactly `0.75` in float64 for `P ≳ 72` is not a bug — it's correctly-rounded behavior of an asymptotic curve, and no plausible P15A pressure value (charter examples top out at P=4, ≈0.78) comes remotely close to that regime. The ULP nudge manufactures a value the closed-form Owner-approved formula never produces, adds bit-manipulation code (`Float64Array`/`BigUint64Array` reinterpretation) whose only purpose is satisfying a strict-inequality test derived from prose that describes an asymptote rather than a runtime invariant, and is a slight (if immaterial) literal deviation from the exact D-1323-1 formula text for extreme P. This is a low-stakes, non-blocking style disagreement, not a reason to withhold KEEP — the parent has already ruled and explicitly invited this review to challenge it; I am recording the challenge, not overriding the ruling.

## 5. F5 — one-reason-per-code

**Not asserted anywhere in the 33 leaves in a way that distinguishes it from a "one reason per contributing studio/source" alternative.** Verified independently by reading `market-reasons-capped-at-five` (r3 patch, the leaf engineered to hit all four non-`NO_PRESSURE` codes): every code in that scenario happens to have exactly one contributing studio/source, so `reasons.length===4` and set-of-codes equality would pass equally under a per-code model or a per-studio model. Confirmed by the writer's own M-column history: their r1-era per-studio-reason implementation passed r1's (weaker) suite 27/27.

Production itself **does** correctly implement the parent's binding "one entry per applicable code" decision — confirmed by code reading: `SAME_WEEK_RELEASES` is pushed once, aggregating all same-week peers' weight via a single `laneSum(counts,0,1)` call (`sharedMarket.ts:244-246`), not once per contributing studio.

**Yes, an assertion is required** before Wave 2 treats this shape as load-bearing: add one leaf with two same-week peers from two *different* studios, asserting exactly one `SAME_WEEK_RELEASES` reason whose `sourceReleaseIds` contains both ids and whose `value` is their summed weight (exactly the leaf the writer already proposed in `1346-E`'s F5). This is a test-suite completeness gap, not a defect in the reviewed production code, and does not block this record's KEEP.

## 6. TUNING block

MET WITH EVIDENCE. Exactly seven `SHARED_MARKET_*` keys (`tuning.ts:993-999`): `SHARED_MARKET_WINDOW_WEIGHTS`, `_STOCK_START`, `_STOCK_HALF_LIFE_WEEKS`, `_RETIRE_AFTER_WEEKS`, `_FACTOR_MAX_PENALTY`, `_PRESSURE_SCALE`, `_STUDIO_WINDOW_CAP`. The preceding comment (`tuning.ts:988-992`) names `p15a1-market-v1`, cites 1323-A §3/1323-F, cites **D-1323-1 (record 1340-O)** by name, states "PROVISIONAL TUNING," and names the Wave 4 KEEP/REVISE/REJECT playtest — matches CLAUDE.md's "Constants live in TUNING" convention exactly, and no law constant is inlined elsewhere in `sharedMarket.ts`. **F4's definition-version rule is recorded in source**, verbatim: "A revision changes the law: bump `SHARED_MARKET_DEFINITION` with it" (`tuning.ts:991-992`). `MARKET_REASON_SOURCE_LIMIT = 5` is correctly kept *out* of TUNING and exported as a law constant instead (`sharedMarket.ts:34`), per 1346-F's explicit ruling that it "bounds a record's size, not a market outcome" — a documented, deliberate exception, not an oversight.

## 7. Out-of-scope touch check

MET WITH EVIDENCE — clean. The patch touches exactly two files: new `src/core/sharedMarket.ts` and a 13-line addition to `src/core/tuning.ts`. No `GameState`, save, Bridge, `tick.ts`, `hollywoodTick.ts`, `reception.ts`, UI, or `src/core/index.ts` change (confirmed both by reading the patch and by `git`-glob confirming `src/core/sharedMarket.ts` is absent from the current tree). This matches Wave 1's charter boundary and 1340-O's execution order ("integrating shared-market pressure into the live economy" waits for rival-shelving verification, per D-1323-1's EXECUTION clause and the "Prioritize the rival-shelving correction" line) — nothing here crosses that line.

## Blocking defects

**None.** No file:line in `sharedMarket.ts` or `tuning.ts` requires a code change to close this record.

## Non-blocking notes (prioritized)

1. **Reach-scaling seam missing** (§1 above) — 1323-A §3 (frozen, unamended) calls for "one named function returning 1 in v1" as the contribution seam; not present. Recommend a one-line named function before Wave 2 needs reach scaling, for literal fidelity to the frozen charter text. No test currently checks for it.
2. **F5 assertion gap** (§5) — add the two-different-studios `SAME_WEEK_RELEASES` leaf before Wave 2 treats "one reason per code" as a pinned invariant. Production is already correct; this closes a coverage hole, not a code defect.
3. **F1 floor** (§4) — recommend dropping `nextDoubleAbove` and loosening the test bound; low-stakes, already ruled on by the parent, recorded here as the requested independent challenge.
4. **F2 (`STUDIO_CLAMPED.value`) and F3 (index export)** — both correctly and explicitly deferred by `1346-X4` to Wave 2 / optional follow-up; no objection.
5. Determinism-under-permutation at the bit level (as opposed to the charter's tested 1e-9 tolerance) rests on an unreproduced writer probe — flagged NOT VERIFIED, informational only, not required for this record.

## Evidence limits

This is a source-and-document review only: I read the patch, the RED r3 suite, the handback, the parent's dry-run/rulings records, and the recorded `tsc`/`vitest` output files directly (three `tsc` files are empty, consistent with the claimed exit-0/no-output result; the green run log shows `33 of 33` across the two named test files). I did not execute any command myself — no shell, no vitest, no tsc are in my tool set. All GREEN/type-gate claims above are attributed to the parent's own recorded dry run (`1346-X4`), not to my own execution, and all formula/clamp/reducer traces above are hand-verified against the source text I read, not run.

Relevant paths (absolute):
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-stage/1346-p15a1-production.patch`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-stage/1346-p15a1-red-r3.patch`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-E-p15a1-production-handback.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-X4-p15a1-production-dry-run.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-X4-green-run.txt`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1323-A-p15a1-wave0-and-wave1-charter.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1323-F-parent-p15a1-charter-adoption.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1340-O-owner-rulings-20260929.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-X-p15a1-red-dry-run-and-adoption.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-F-parent-response-to-1346-D.md`
- `/Users/zacheryspector/The-Movies-headless-program/src/core/tuning.ts` (existing `GENRE_ORDER`, confirmed six-genre catalogue consumed by the patch)
