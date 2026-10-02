<!-- 1356-D4: confirmation review (read-only) of P15A.2 slice 2a RED r4, saved verbatim by the parent -->

# 1356-D4: confirmation of the slice 2a RED r4

**Verdict: CONFIRMED.** r4 answers 1356-F5. All five checks are MET, and I found no defect.

**Scope.**
- I read at repo HEAD 4947f231. HEAD moved to 954a373e during the review (note 5). The `src` tree is db80ca31 at ff05430d, 85764cd5 and 954a373e.
- I ran read-only git, grep, sed, diff, shasum, and python3 that printed to stdout. I ran no vitest, tsc, node, tsx or vite-node, and I wrote no file.
- **H** is `tests/p15a2-power-ranking-archive-harness.test.ts` at r4 (blob d3503ce). **A** is `tests/p15a2-power-ranking-archive.test.ts` at r4 (blob a8cae3b).
- Both blobs are the same in the author's commit fb7a38e (`studio-scratch/1356-red/tree`) and in X3's commit c7e661f, "red-r4" (`studio-scratch/1356-x3/tree`).

## 1. F5 D-1, the ceiling can fire: MET

- **The tick check.** After each `tick` (H:51) and the week-13 probe (H:52), `campaign()` computes `performance.now() - started`. Once that exceeds `CEILING_MS`, it throws `CEILING: week <W> reached after <N> ms, past CEILING_MS 300000 (1356-F5)` (H:53-56). `started` (H:48) is the same mark `campaignMilliseconds` uses (H:58).
- **The sum assertion.** After `validate(save)` (H:83), H:91-93 asserts that `campaignMilliseconds + saveMilliseconds + validatorMilliseconds` is `toBeLessThanOrEqual(CEILING_MS)`. Its message names each part. The proof line (H:86-89) prints first, as C4 choice 2 says.
- **The timeout.** `CEILING_MS = 300_000` (H:42) is still the `it` timeout (H:95).
- **The RED failure.** It is still the week-13 `archiveOf` error, because H:52 throws before H:53 runs in the same iteration.
- **Why the checks can fire.** Both run inside the synchronous body, so neither depends on vitest's timer.
  - `runWithTimeout` calls the body at `node_modules/@vitest/runner/dist/index.js:39` and creates the timer only at :42 (v2.1.9, `node_modules/@vitest/runner/package.json:4`).
  - In x3-red.json, the stack shows the leaf running from `runWithTimeout (index.js:39:7)`.
  - x3-red.txt:10-19 shows a throw from this loop (H:52) failing the leaf with its own message. A throw at H:55 takes the same path.

## 2. The archive note: MET

- **One hunk.** `git diff a5bd03c fb7a38e` on A has one hunk, `@@ -43,6 +43,11 @@`. It adds five comment lines (A:46-50) inside the header, before the imports at A:52.
  - The blob changes from 211bb18 to a8cae3b, and the file grows from 1,402 to 1,407 lines.
  - The diff of the staged patches agrees.
- **The note is accurate.** A:47-50 says three things: `HEAVY` and `MEDIUM` are vitest timeouts, not budgets; neither can stop a synchronous body; and no leaf declares a budget. The file bears this out:
  - `HEAVY` and `MEDIUM` are at A:184-185 (A:179-180 in r3).
  - A does not import `performance`.
  - Outside the note, the only "budget" in A is the game field `budgetPerWeek` (A:266).
- **No stale rows.** No classification row cites a line number in A, so the five-line shift stales nothing.

## 3. No other change: MET

- **Staged r3 patch against r4, file by file:**
  - `tests/helpers/p15-roots.ts`: identical (blob b852c0b, 35 lines).
  - `tests/p15a2-power-ranking-archive-isolation.test.ts`: identical (blob 1a1c414, 154 lines).
  - H: blob ebd03de becomes d3503ce, and 84 lines become 96. There are three hunks: the BUDGET note (H:15-23), the CEILING check (H:53-56), and the sum assertion with its comment (H:90-93).
  - A: only the change in check 2.
- **Author tree.** `git diff a5bd03c fb7a38e` touches the same two files, +21/-4. In that tree:
  - `45b2782..main` hashes to 32397525…, the staged r4 patch (C4:34);
  - `45b2782..a5bd03c` hashes to 95ac4605…, the r3 patch;
  - `45b2782..ref` hashes to 83cb2a59…, the reference patch, unchanged.
- **Classification** (ad40421c…, C4:35):
  - It keeps 72 rows in r3's order, with the same two controls: `rank-fixed-cost-rival-research-window-premise` and `rank-root-frozen-builder-headless-control`.
  - A text diff changes line 502 only. That line is the `rank-bounded-harness` row, whose `charterClause` gains `1356-F5 :6-14 (…)`. F5:6-14 is F5's "Required in r4" section.
  - That row's `expectedFailureToday` still names the week-13 `archiveOf` message.

## 4. The measurement agrees: MET

- **The run tree holds what X3 says.**
  - Base commit 3c56aba is "base 85764cd5…", with `src` tree db80ca31.
  - `git diff 3c56aba c7e661f` hashes to 32397525…, the staged r4 patch.
  - `git diff c7e661f bfc9443` hashes to 83cb2a59…, the staged reference patch.
  - The byte counts and hash prefixes of all five outputs match X3:15-21, and run.log:9 shows a clean tree.
- **RED run (x3-red.txt:4-5, :10-19).** The leaf fails in 751 ms with `RED: the state at week 13 has no top-level powerRanking root (1356-A §5)`.
  - The error is thrown in `archiveOf` at H:37:36, called from `campaign` at H:52:37, called from the leaf at H:66:19.
  - These line numbers fit r4's H only. In r3 they were :33, :48 and :58.
- **Reference run (x3-ref.txt:5, :7).** The proof line reads 6,240 weeks and 480 records.
  - `campaignMs` 56,892 + `makeSaveMs` 528 + `validateSaveMs` 290 = 57,710 ms, which is 19.2 percent of `CEILING_MS` 300,000.
  - The leaf passes in 58,028 ms, so H:91-93 ran and held.
- **Type gate at RED (x3-red-tsc.txt:1-4; exit 2 at run.log:6).** There are four TS2307 errors. Each is an `await import(...)` of a module that production adds:
  - `../src/core/powerRankingArchive.js`, at isolation :66 and A:85;
  - `../src/core/p15Phases.js`, at A:97 and A:348.

  Neither module exists at HEAD, and the reference commit bfc9443 adds both. H and p15-roots.ts add no error, so H compiles at r4; C4:45 had left that UNVERIFIED. 1356-X:58-60 lists the reference's root errors, and none is TS2307.
- **The convention.** RED at the type level is accepted in this program:
  - 1348-C5:169-190: a RED-only gate exits 2 with a TS2307 for a missing module, "by design";
  - 1358-C:75-83: "the expected, RED-at-type-level mirror", citing "the 1348-C5 convention".

## 5. F5's correction to F4: MET, r4 owes nothing for it

- F5:6-17 is the only section that orders anything of r4. F5:19-41 corrects F4's facts and orders nothing. F5:43-46 orders r4, the X3 run and this review.
- r4 leaves the founding code byte-identical to r3 (check 3). No classification row cites 1356-F4, and A cites neither F4 nor H8.
- The `foundMidGame` comment (A:232-236) already states both rules the way F5 corrects them:
  - signings "made after the industry exists" lack a ledger payment (hollywoodValidation.ts:568-569);
  - an open draft refuses technology rows (technology.ts:897).
- F5's citations hold at HEAD: employment.ts:569, technology.ts:897, hollywoodValidation.ts:568-569, tests/helpers/p14c3-history-boundary-fixtures.ts:107-112 and save.ts:8048-8053.

## Defects

None.

## Non-blocking notes

1. **The error's name.** The CEILING error is a plain `Error`. Its `CEILING:` prefix and the constant's name identify it. The sibling 1358 r3 also sets `name: 'BaseWorldBudgetExceeded'` (E/1358-stage/1358-rel-sliceB-red-r3.patch:812-813). X3:35-36 accepts r4's message as failing "by name".
2. **The sum's scope.** H:91 sums the three parts F5 names. The record checks and the two `stableStringify` calls (H:67-77, :85) fall outside the sum. At X3 they took 318 ms (58,028 ms for the leaf against 57,710 ms for the sum).
3. **What the check cannot stop.** H:53-56 runs between ticks, so a single `tick`, `makeSave` or `validate` call that never returns still hangs the worker. No check inside a synchronous body can stop that. A slow campaign now fails by name at the first tick past 300,000 ms.
4. **X3's wording.** "The ceiling now fires" (X3:31) means the ceiling can fire. Neither check tripped (X3:35). The run shows that both checks pass at the reference. That they can fire comes from reading the code and from x3-red.txt:10-19.
5. **HEAD moved during the review.** It went from 4947f231 to 7c1d1fe7 (docs), then to 954a373e (1348 slice A RED r5, tests only).
   - No 1356 file and no `src` file changed.
   - r4's four paths are new files and are still absent at 954a373e, so by inspection the patch still applies.
   - A root type gate at 954a373e would also show the 1348 RED's own type-level errors (1348-C5:169-190) next to r4's four.
