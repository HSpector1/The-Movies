# 1303-I: attribution of every failure in closed broad UI gate 1303

Task 1303-I, mode VERIFY (evidence reading and stdlib parsing only; no vitest/tsc/node/vite-node
executed; no tests/src/bridge/ui/generated/scripts/config paths written). Executed source
`42f216e8f1fa0a9f706640c783f19bf67c9c1e57`; records published at
`5627fd1147e067dc92ed5827545250fc195ee47f`. Companion machine-readable record:
`1303-I-failures.json` (one row per failing case, plus a `vanishedFromBaseline` array), sha256
`75f35cea9616f1c1c5e995bb01b59edd4b7eb16c1515c28c859a4cdf42510eb9`, 59,242 bytes.

## Raw evidence parsed (sha256, as read)

| File | Bytes | SHA256 |
| --- | ---: | --- |
| `1303-p4p5-broad-ui.txt` | 384,582 | `2c539640f056583bfed701df87da55995cdb35d70b93045f43dc42acbdf81e95` |
| `1303-p4p5-broad-ui.json` | 52,288 | `7bfcec52fddc509b1cd28565c8350fffb8affe0cec934d70426addcfb68c5ff9` |
| `1303-p4p5-broad-ui-preflight.json` | 114,021 | `e1b7ce96e4175497ea7f80857e16b4e8a7e933ae7c5d411e248aca1115968831` |
| `1303-p4p5-broad-ui-postflight.json` | 114,682 | `38f92059cf244f2ff513e17cab752b9bc886e847e506f52d4a03b133ac4aa33b` |
| `1101-c3-final-ui.txt` (baseline) | 423,106 | `40e4eec4bceea1850c78cb31686ec8fcaf385a4dec68dc7c2c93bdcd611fb645` |
| `1119-A-c3-final-full-attribution.md` (cross-checked, quoted sha inside `1120-A` matches) | 27,157 | `48f4823c31af5215921a4fad1b78a5249ecccc436303d7706f975976587c1d91` |

`1303-p4p5-broad-ui.json`'s wrapper metadata confirms `sourceSha`/`sourceShaAtEnd` =
`42f216e8f1fa0a9f706640c783f19bf67c9c1e57`, `command` = `["node_modules/.bin/vitest","run","--project","ui"]`,
`exitCode` = 1, `testedDiffSha256` = the empty-tree sha (no untracked source). The preflight/postflight
guard-scope JSON both report `head` = `42f216e8f1fa0a9f706640c783f19bf67c9c1e57` and
`allGuardsExact: true`. These match the task's stated identity exactly.

The raw `.txt` begins with a one-line JSON `guardScope` header (43,963 bytes) followed by the
plain vitest terminal capture. The capture contains zero ANSI cursor-movement escape codes
(checked programmatically over the full byte stream, only `ESC[...m` SGR color codes appear,
9,838 of them); the "Failed Tests" section's structure below is genuine vitest reporter output,
not a rendering artifact of ANSI stripping.

## Gate totals (raw-file self-consistency check)

Both sources of truth inside the raw txt agree exactly with the task's stated summary:

- Final tally line: `Test Files  10 failed | 194 passed (204)` / `Tests  31 failed | 2661 passed | 5 skipped (2697)`.
- Independent per-file dashboard (10 `❯ |ui| <file> (N tests | M failed)` lines), failed-count sum = 31:
  NextEventApp 2, CastingReviewAppAuthority 1, WorldInspectorDefault 10, CastingReviewApp 1,
  p05a-w2-closed-production 2, livingTurn.scheduler 1, livingTurn.parity 1, authored-stage-a 4,
  authored-rgba-export 6, StudioCalendar.career 3. Sum = 31, files = 10. Matches.
- Count of `" FAIL |ui|"` header lines in the file: 31 (grep-confirmed).

## Raw-capture structural note (read this before the per-case table)

Vitest's "Failed Tests 31" block does **not** print one numbered divider per failing case. It
collapses **consecutive failing cases that share exactly one printed error/stack** into a single
block: several `" FAIL |ui|"` header lines followed by ONE error body. This happened twice in
1303:

1. The un-numbered lead block, before divider `[1/31]`: 7 cases (CastingReviewApp "greenlights...",
   CastingReviewAppAuthority "never lets stale...", NextEventApp "orients a cash stop..." and
   "clears every next-event transient...", WorldInspectorDefault "reaches the canonical deep
   screen..." and "never lets any place print its blocks...", livingTurn.scheduler "auto-pauses on
   the FIRST PAUSE-class stop...") all share literally `Error: Test timed out in 5000ms.` with
   **no printed source frame** (no `❯` line into `ui/src` or `tests/`).
2. The block after divider `[20/31]`: 3 `StudioCalendar.career.test.tsx` cases (U1, U2, U3) share
   one `AssertionError: expected 40 to be 38 // Object.is equality` at
   `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17:29`.

There are only 23 numbered divider blocks (`[1/31]` .. `[23/31]`, one of which is a trailing
closer with no content) covering 31 cases, exactly because of this collapsing. `1303-I-failures.json`
marks every affected row `sharedErrorBlock: true` with a `siblingsInBlock` list so this is not
mistaken for 31 independently-diagnosed causes: the raw evidence genuinely provides only ONE
diagnosed cause for each of those two groups, not one per case.

## Unhandled errors: the baseline TypeError did NOT recur

Baseline `1101-c3-final-ui.txt` has an `⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯` section (1 uncaught
exception): `TypeError: viewRef.current?.hollywoodPerformance is not a function`, first frame
`ui/src/lot/StudioLotScreen.tsx:4854:37`, originating in `StudioLotIdentityReview.test.tsx`
during "each mode drives setIdentityMode / setReducedMotion correctly", plus a trailing
`Errors  1 error` summary line.

`1303-p4p5-broad-ui.txt` has **none of this**: no `Unhandled Errors` heading, no `Uncaught
Exception` block, no `Errors  N error` summary line, and the literal string `hollywoodPerformance`
does not appear anywhere in the file (grep-confirmed over the full 384,582-byte capture). The
baseline unhandled TypeError did not recur in 1303.

## Comparison to baseline (1119-A method)

Case identity = the exact string on the `" FAIL |ui|"` line (`file > describe-chain > test
name`). RETAINED = identical id in both runs; CHANGED = identical id, differing primary error or
first frame; NEW = id only in 1303; VANISHED = id only in 1101.

| Category | Count |
| --- | ---: |
| RETAINED (byte-identical primary error + frame) | 23 |
| CHANGED (same id, different primary error/frame) | 0 |
| NEW | 8 |
| VANISHED | 16 |

23 + 8 = 31 (current total). 23 + 16 = 39 (baseline total). Both check out.

## Clusters (all 31 current cases; NEW/CHANGED cause-classed as required, RETAINED included for completeness)

| Cluster | Cases | Status split | Cause class | Notes |
| --- | ---: | --- | --- | --- |
| C1 `Test timed out in 5000ms` (no frame) | 7 | 4 RETAINED / 3 NEW | FU1/FU2 inherited (timeout) | See "Timeout cluster" below. |
| C2 WorldInspectorDefault `Found multiple elements [data-testid="lot-nav-*"]` | 7 | 7 RETAINED | FU1/FU2 inherited (Inspector body / duplicate testid) | Byte-identical primary + frame vs baseline at every one of the 7 lines (635/663/697/711/733/760/770). Named "FU-1 family" and left open in `1119-A`/`1120-A`. |
| C3 `authored-rgba-export.test.ts` missing PIL | 6 | 6 RETAINED | missing-PIL/environment | `ModuleNotFoundError: No module named 'PIL'` inside `execFileSync('python3', ...)` at `authored-rgba-export.test.ts:43` and `:119`. Environment gap, not a source defect. |
| C4 `authored-stage-a.test.ts` missing PIL | 4 | 4 RETAINED | missing-PIL/environment | Same PIL cause, `authored-stage-a.test.ts:64`. |
| C5 `p05a-w2-closed-production` Gate Hiring throw | 2 | 2 RETAINED | apparent production defect with a concrete trace, retained (not new) | `Error: studioLotSnapshot: invalid or ambiguous Gate Hiring authority`, thrown at `ui/src/engine/adapter.ts:7264:11` (production source, not test code), reached via `managedSnapshot` on the wrapped-waiting fixture. Byte-identical to baseline; not fixed or touched between 1101 and 1303. |
| C6 WorldInspectorDefault `TypeError: ... reading 'options'` | 1 | 1 NEW | FU1/FU2 inherited, new failure mode | See "Recurrence of a previously-named unstable identity" below. |
| C7 `livingTurn.parity.test.tsx` DOM race | 1 | 1 NEW | unknown, flagged for independent review | No prior record anywhere in 1101/1119-A/1120-A/1123/1124. See below. |
| C8 `StudioCalendar.career.test.tsx` stale V38 literal | 3 | 3 NEW | stale literal / fixture-version boundary, missed by the 1301 sweep | See below. |

7+7+6+4+2+1+1+3 = 31.

### C1/C6: recurrence of a previously-named "FU-1" unstable identity family, not a new regression from tested source

Cross-checking `1119-A-c3-final-full-attribution.md`'s own comparison of an *earlier* baseline
(`713`) against `1101` turns up this exact language for the 7 identities that were VANISHED
between 713 and 1101 (i.e. passing at 1101, after failing at 713): *"Casting Review's six
event-owned observations; Next Event's accepted same-seed/week replacement; World Inspector's
generic inspector, all-nine-place navigation, explicit details action and canvas/semantic
routing; and the Living Turn first PAUSE-class stop."* `1120-A` subsequently records this family
as still open: *"Writer, R8, FU1/FU2, mixed-source endurance ... remain."*

Every one of the 4 NEW cases in C1 and the 1 NEW case in C6 is an exact-name match to that
previously-flagged-and-since-cleared family, now failing again:

- NextEventApp "clears every next-event transient across an accepted same-seed same-week
  whole-studio replacement" = "Next Event's accepted same-seed/week replacement".
- WorldInspectorDefault "reaches the canonical deep screen ONLY through the explicit details
  action" = "explicit details action".
- WorldInspectorDefault "routes canvas intent and semantic companion activation to the same
  owner" = "canvas/semantic routing" (now a `TypeError` instead of a timeout, a different
  failure mode of the same previously-named identity, worth independent attention).
- `livingTurn.scheduler.test.tsx` "auto-pauses on the FIRST PAUSE-class stop..." = "Living Turn
  first PAUSE-class stop".

Confirming there is no tested-source explanation: `git diff --stat` between baseline
`6e63f4c8` and executed `42f216e8`, restricted to `ui/src/lot/*.ts(x)` **production** files
(excluding `*.test.ts(x)`), is empty: zero production Lot files changed in that range. None of
`WorldFirstWorldInspectorDefault.test.tsx`, `livingTurn.scheduler.test.tsx`,
`WorldFirstLotNativeNextEventApp.test.tsx` were touched by any commit in the range either. This
is a recurrence of pre-existing, already-disclosed flakiness/timing-sensitivity in the Lot-mount
/ next-event / scheduler test harness family, not a regression introduced by the tested source
change. Its "reliability condition is still open" per `1120-A`; this record does not close it.

### C7: `livingTurn.parity.test.tsx`, genuinely new identity, flagged for independent review

`ui/src/lot/livingTurn.parity.test.tsx > C2a-M5 — four-way time parity: the same twelve weeks,
four ways > (a) by hand at the seam — the manual verb, pressed twelve times` fails with
`TestingLibraryElementError: Unable to find an element by: [data-testid="studio-lot-screen"]` at
`ui/src/lot/livingTurn.parity.test.tsx:110:16` inside a `mountLot` test helper (`await
screen.findByTestId('studio-lot-screen')`). The captured DOM at failure shows a
`data-testid="recovery-notice"` card ("Continuing your studio — Week 2") plus
`data-testid="studio-lot-lazy-loading"` ("Opening the Studio Lot…"); the lazy-loaded Lot had not
finished mounting when the query's timeout elapsed.

This exact file/describe/test identity does not appear anywhere in `1101`, `1119-A`, `1120-A`,
`1123-A/B` or `1124-A` (grep-confirmed across all five). `git log` shows **zero** commits touching
`livingTurn.parity.test.tsx` and **zero** commits touching any production `ui/src/lot/*.tsx(x)`
file between `6e63f4c8` and `42f216e8`. So this is not explained by any in-range source diff
either. It is either the same underlying Lot-mount timing race as C1/C6 surfacing in a
not-previously-observed test, or a distinct new race. Cause class: **unknown**. This is the
single case in this gate with the weakest evidentiary basis; recommend an isolated unchanged-source
rerun (the `1102`/`1124` pattern already used for the NextEvent identity) before deciding whether
it is flaky or a genuine defect, rather than retrying or adjusting a timeout to obtain a pass.

### C8: `StudioCalendar.career.test.tsx`, stale V38 literal missed by the 1301 sweep

All 3 new cases share one error: `AssertionError: expected 40 to be 38 // Object.is equality` at
`tests/helpers/p14c3-genuine-evidence-fixtures.ts:17:29`, inside the shared helper
`acceptedEvidence(state)`:

```
export function acceptedEvidence(state: GameState): void {
  const before = stableStringify(state), saved = makeSave(state)
  expect(saved.saveVersion).toBe(38)
  ...
```

Direct read of `src/core/save.ts` at the executed source (`42f216e8`) confirms `makeSave()` (line
6542) returns `SaveFileV40` with `saveVersion: 40`: production has already moved to V40 as part
of the ongoing P3 work (3 commits touched `src/core/save.ts` between baseline and 1303: "Add
initial P3 Director offers and strict Save39 boundary", "Support Director promise cancellation
and forward waivers", "wip: checkpoint core opportunity predicates and prospective take
subjects"). This is an **intended P3 version bump**, not a defect.

The gap is that `tests/helpers/p14c3-genuine-evidence-fixtures.ts` still pins `.toBe(38)`.
`grep` over `1301-live-pin-maintenance-final.patch` (the reviewed, applied, KEEP-verdict
live-version-pin sweep; `1301-E-parent-application.json` reports 74 files / 188 changed line
pairs applied) finds **no** occurrence of `p14c3-genuine-evidence-fixtures` or
`p14c3-surface-fixtures`; this helper file was not part of that sweep's 74-file inventory, and
is not mentioned in either `1301-live-pin-classification.json`,
`1301-live-pin-classification-addendum.json`, or `1301-C`/`1301-C2`/`1301-D` as a deliberately
deferred item. It appears to be a plain gap in the sweep's file inventory, not a reviewed
exclusion. Cause class: **stale literal / fixture-version boundary**. Recommended next increment:
add `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17` (and its sibling `validateSaveV38(saved)`
call on the next line, which may also need attention once the literal is corrected) to a follow-up
live-pin sweep, using the same digit-only-diff discipline as `1301`.

### C5: retained production throw, not new, but worth keeping visible

`Error: studioLotSnapshot: invalid or ambiguous Gate Hiring authority`, thrown from **production**
source `ui/src/engine/adapter.ts:7264:11` (`throw new Error(...)` inside `studioLotSnapshot`,
guarded by `if (gateHiringCards === null)`), reached via the test's `managedSnapshot` helper on
the "wrapped-waiting" oracle/P06D fixture. This is byte-identical to the baseline failure (same
message, same frame) and RETAINED, not new in this gate. It is a genuine production-code
throw, not test-infra or environment noise, and it has been retained unfixed across at least
`1101` → `1303`. It is already covered by the "canonical L1/L2 premise" family named in `1301-A`'s
scope list. Surfacing it again here so it is not lost inside the RETAINED bucket.

## VANISHED (16 cases present at baseline `1101`, absent from `1303`)

15 of 16 have a concrete fixing commit; 1 is marked unknown as required.

| Cases | Fixing record |
| ---: | --- |
| 8 ("`AssertionError: expected 38 to be 31`" across `saves.test.tsx` ×1, `session.test.tsx` ×3, `engine/d17-save-migration.test.ts` ×2, `engine/film-chronicle-adapter.test.ts` ×1, `lot/snapshot/v14SetHolderBoundary.test.ts` ×1) | `ab9f4923` "Repair reviewed C3 historical test boundaries and fixture ownership" (applies the reviewed `1123-A`/`1123-B` maintenance staging). Diff-confirmed: each site's literal changed `.toBe(31)` → `.toBe(38)` verbatim, matching the exact line numbers baseline failed at. |
| 3 (`saves.test.tsx` migration-disclosure leaves, "validateSaveV37 chain") | Same `ab9f4923`. Diff-confirmed: `legacyV8SaveJson` previously stripped `scriptDevelopment` before calling `makeSaveV8`, causing the frozen migration chain to reject; the fix stopped stripping the field (`return exportSave(makeSaveV8(live))` instead of the destructured, stripped copy). |
| 3 (`WorldFirstLotNativeCastingReviewApp.test.tsx`: 2 "Unable to find studio-lot-screen" + 1 "validateSaveV38 profession changed") | Same `ab9f4923`. Diff-confirmed: the local `blockedReviewState`/`fixtureState` helper was rewritten to admit a properly-sourced historical V13 fixture (via `validateSaveV13`) and alter only primary roles there, instead of mutating an already-migrated current state and reaching a serializer rejection that `ui/src/engine/session.ts:46` silently swallowed. |
| 1 (`WorldFirstLotNativeCastingReviewAppAuthority.test.tsx` "keeps a blocked accepted successor...") | Same `ab9f4923` (same fixture-repair family, this file also has a 64-line diff in that commit). |
| 1 (`WorldFirstLotNativeNextEventApp.test.tsx` "preserves the exact live-world reaction after a rejected import or declined restart") | **UNKNOWN.** `git log` shows zero commits touching this test file between `6e63f4c8` and `42f216e8`, and zero commits touching any production `ui/src/lot` file in that range either. `1119-A` previously recorded an isolated unchanged-source rerun (`1102`) that reproduced this exact identity byte-for-byte, i.e. it was not flaky at that time. With no source diff anywhere relevant and a prior reproducibility claim, its disappearance now cannot be attributed to any recorded change. Marked unknown, not assumed fixed. |

8+3+3+1+1 = 16.

## Possible-regression flags for independent review

1. **`livingTurn.parity.test.tsx` (C7)**: strongest candidate. Genuinely new identity, no prior
   record anywhere in the evidence trail, no relevant source diff to explain it either way (so it
   is not obviously "just" the known FU-1 family, but shares its DOM-race symptom).
2. **WorldInspectorDefault "canvas/semantic routing" (C6)**: same previously-named identity as
   before, but its failure *mode* changed from a plain 5000ms timeout to a `TypeError: Cannot read
   properties of undefined (reading 'options')` at line 361. Worth checking whether this is the
   same race manifesting differently or a second, distinct defect layered on the first.
3. **VANISHED NextEventApp "preserves the exact live-world reaction..."**: disappeared with zero
   explaining diff, contradicting a prior claim of non-flaky reproducibility. Not a regression by
   definition (it is a pass now), but the contradiction itself is worth independent attention
   before treating this identity as reliably fixed.

None of the 8 NEW cases are attributable to a production-code change in this range for the files
directly involved (C1/C6/C7 files: zero production diffs; C8: the relevant production change is
the intended P3 `saveVersion` bump, and the actual gap is a missed test-fixture literal).

## Limits of this evidence pass

- This is VERIFY-mode static parsing of one raw capture per run; no test was re-executed, no
  isolated rerun was performed, and no flakiness claim here is confirmed by repetition.
- Two "cause=timeout" groups (C1's 7 members, C8's 3 members) share exactly one printed
  error/frame per group in the raw capture; the JSON records this explicitly rather than inventing
  7 (or 3) independent diagnoses that the evidence does not actually contain.
- "Unknown / candidate new regression" (C7) and the one unknown VANISHED case are genuine gaps,
  not resolved here; they need an isolated unchanged-source rerun, which is outside this VERIFY-mode
  assignment's authorized commands (no vitest execution permitted).
- Historical FU-1/FU-2/R8 naming is reused from `1119-A`/`1120-A`/`1029-A` by exact-string and
  exact-test-name cross-reference; this record does not re-derive those names' original root
  cause, only whether the *current* failures match previously-disclosed identities.

Author note: Sonnet 5 (claude-sonnet-5), test-author role, VERIFY mode, no em dashes used above.
