# 732-W — parent brief: the B.7 writer's second pass (THE LAW and the V32 bump)

Source `8fad77c8`. Your first pass landed at `14a1489c` and is intact; this is additive.

## The contract, now two files

| file | sha256 | state |
| --- | --- | --- |
| `tests/p14b7-promise-waiver.test.ts` | `09c9f09b…`, 651 lines | engine-only |
| `tests/bridge-p14b7-promise-waiver.test.ts` | `e6c7ae4d…`, 185 lines | bridge-only, NEW |

Together: **31 passed / 2 failed (33)**. Exactly two cases are red and they are your work:

1. `group6` — *"THE LAW: a substitute window opening ON (or before) the waiver week must be
   refused: expected null not to be null"*.
2. `group9` — *"expected 31 to be 32"*.

You own neither file. Do not edit them. If you believe a case pins the wrong thing, STOP and report
it with evidence.

## 1. THE LAW, which closes the exploit you found

**`waiverAccepted` refuses when `substitute.windowStartWeek <= waiverWeek`**, with a stated reason.

You offered the narrower rule, refusing a window that already contains a qualifying take. The
parent chose the comparison instead, and the reason is worth carrying: a take scheduled to land
later in the SAME week would still be credited to a window opening at `waiverWeek`, so the scan
closes the instance and the comparison closes the class. It also states the true thing, that a
substitute is a FORWARD obligation. One comparison, no scan over `firstTakes`.

Your own measurement is what established the defect, and record 720 item 17 was wrong until you
ran it. The pin now in `group6` proves its own premise before asserting the outcome: it calls
production `qualifyingTakes` directly to confirm the root cause, so it cannot later pass for the
wrong reason.

## 2. The V31 → V32 bump, which the corrected pin now requires

`group9` pins `LIVE_SAVE_VERSION === 32`. Your first pass correctly refused to move it while the
suite pinned 31; the suite has been fixed and the bump is now in scope. Land the half you named as
unimplementable:

- `LIVE_SAVE_VERSION = 32`, `makeSave` stamping 32 through `validateSaveV32`.
- `supersededByPromiseId` **set on the WAIVED original**, naming its substitute. This is the typed
  link the slice exists to create; `outcomeCause` prose was the right stopgap and does not
  discharge item 11.
- `SaveFileV32` into the `SaveFile` union, `validateSaveV32`, `migrateToV32`, the dispatch sentinel
  to "1 through 32 only", and the downgrade refusals, following the V30 → V31 step in `save.ts` as
  the precedent.
- `convertV32ToV31` still REFUSES a non-null `supersededByPromiseId` rather than dropping it,
  through the `projectPromisesPreV32` helper you already wrote, called BEFORE envelope validation.
- `PROJECTION_VERSION` stays **49**. No wire change. If you conclude otherwise, STOP and report it.

**The live-version sweep is NOT yours.** A save bump moves literal pins across many test files
(`saveVersion: 31`, `toBe(31)`, the sentinel string, frozen builders, id rosters). That is the
test-author's separate values-only patch, exactly as the V30 → V31 step was done. Do not touch a
test file to make one pass. Report what the bump breaks; do not fix it.

## 3. Reason strings must be distinct and stable

`waiverAccepted` returns `string | null` so a refusal can be inspected. A follow-up pass will
assert WHICH reason each refusal returns, because THE LAW now overlaps the identical-substitute
rule: an identical substitute carries the original's window, which has necessarily already opened,
so both rules fire on it. Give every refusal branch its own distinct, stable sentence. Do not reuse
one string across two branches, and do not compose a reason from a shared prefix that a truncation
could collapse. The B.6 slice lost a day to precisely that.

## Boundaries

- No test file, no fixture. `git status --porcelain tests/` must be empty when you finish.
- Commit nothing, push nothing. Do not run the evidence runner. Do not run the full suite.
- `npx tsc --noEmit` is at **0** errors and must stay there. Check it.
- Archive any probe's text per record 726; do not silently delete it.

## Report

`733-W-b7-second-pass.md`: files and hunks with one-line reasons, both suite files' sha256 re-read
from disk at the END to prove you did not touch them, the two suites' final result, typecheck
counts, what the save bump breaks elsewhere (listed, not fixed), and anything in 720 or this brief
you find to be wrong. 720 has been wrong three times and you found the third.
