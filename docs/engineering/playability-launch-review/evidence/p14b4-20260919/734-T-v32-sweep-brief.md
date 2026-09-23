# 734-T — parent brief: the values-only Save V31 → V32 live-version sweep

Source `020496b0`. `LIVE_SAVE_VERSION` is now **32**. The production step is landed and is NOT
yours. This is the separate values-only test patch the V30 → V31 step used (662-T2, 121 files), and
it is the last thing standing between B.7 and a full core run that means anything.

## The measured scope

| class | files (parent-measured) |
| --- | --- |
| `migrateToV31` | 47 |
| `toBe(31)` | 48 |
| `validateSaveV31` | 41 |
| `SaveFileV31` | 17 |
| `"1 through 31"` | 12 |
| `saveVersion: 31` | 7 |
| **distinct files across all classes** | **103** |
| files importing `tests/helpers/p14b2-fixtures.ts` | **56** |

`npx tsc --noEmit` is at **186 errors, ZERO of them outside `tests/`**. Production is clean; every
error is a pin awaiting you.

## Start here, because it is the highest-leverage line in the sweep

`tests/helpers/p14b2-fixtures.ts:122` calls
`validateSaveV31(JSON.parse(JSON.stringify(makeSave(state))))`. `makeSave` now stamps 32, so that
line fails, and **56 test files import this helper.** One token fixes the largest share of the
sweep. Fix it first and re-measure before touching anything else; the remaining list will be much
shorter than 103 and you should not plan the work off the pre-fix number.

Second: `tests/bridge-p14b7-promise-waiver.test.ts`'s `boundOpenP1()` feeds a raw V31 state to a
live path, failing with `validateSaveV32: state.promises[1].supersededByPromiseId is missing`. The
writer deliberately did NOT soften that refusal, because reading a missing field as null would let
`makeSave` stamp V32 onto 16-key rows. The fix is on the fixture side:
`convertV31ToV32(validateSaveV31(...)).state`.

## The sweep classes, and the two that will bite

Work by class, not file by file:

1. **Literals**: `saveVersion: 31`, `toBe(31)`, `SaveFileV31` annotations.
2. **Sentinels**: `"1 through 31 only"` → `"1 through 32 only"`, and any sentinel `it` that pins the
   NEXT version moves 32 → 33.
3. **Frozen builders and harness**: `tests/contracts/_v14Contract.ts`'s strip chain,
   `src/harness/roster-wall/historical-control.ts`, `src/harness/p14/legacy-v28-fixtures.ts`, the
   `d16` runners.
4. **Live load routes**: `migrateToV31` → `migrateToV32` where the caller is LIVE.
5. **Id rosters and size bounds** of any widened table.

**BITE 1: not every `toBe(31)` is a save version.** 48 files carry that literal and some of them
are weeks, counts, prices or ids. A blind replace corrupts premises that have nothing to do with
this bump. Read each one.

**BITE 2: a frozen-corpus reader stays on its frozen validator.** A test that loads a genuine V29
or V30 fixture and calls `validateSaveV29`/`validateSaveV30` is CORRECT and must not move. The V30
→ V31 sweep's own rule was "every frozen-corpus validator left on its own frozen reader". Moving
one converts a real compatibility proof into a tautology. `tests/p14b4-save-v30-compatibility.test.ts`
and `tests/bridge-p14b5-relationships.test.ts` are in that class; there are others.

## The process rule that is not optional

**Grep every consumer of a helper you change and RUN them before you designate the failing set.**
This repo has been burned by exactly this: a two-file checkpoint left sibling suites red for 50
commits because the shared-fixture consumers were never enumerated. With 56 importers on one
helper, an unenumerated change here would be worse.

## What you may not do

- Change NO production file. `git status --porcelain src/ bridge/ ui/` must be EMPTY at finish.
- Weaken NO premise. This is values-only. If a test cannot be re-expressed at V32 without losing
  what it asserts, STOP and report it as a CANNOT-MOVE item rather than softening it. The V30 → V31
  sweep reported its cannot-move residue as empty; yours may not be, and an honest residue is a
  result, not a failure.
- Do not delete or skip a failing case to clear the list.
- Commit nothing. Do not run the evidence runner. Do not run the full suite; the parent owns that
  run and will make it against a pre-registered prediction once you are done.
- Archive any probe's text per record 726.

## Report

`735-T-v32-sweep.md`: the files touched by class with counts, the shared-helper consumer
enumeration and their run results, `npx tsc --noEmit` before and after, the two B.7 suites' final
result, any CANNOT-MOVE residue with the reason, and anything this brief gets wrong. Record 720 has
been wrong four times and every correction came from someone running the thing.
