# 730-T — parent brief: patch the B.7 requirement suite on three findings

Source `14a1489c`. You own `tests/p14b7-promise-waiver.test.ts` (sha256 `68c76efe…`, 619 lines,
29/29 green against the landed implementation). The writer did not touch it and will not.

Three findings came out of W. The parent has decided all three. Two of them change the suite; the
third splits it. Nothing here weakens a pin.

## FINDING 1 — a live exploit your suite does not catch, and the law that closes it

Measured by W on `genuine-v31-part-served-p1` using YOUR group6 draft, no new picture, no new take:

```
today=113 | original window [104,194], count 2, progress 1
substitute AT MINT: window [113,173], count 1, progress 0, evidenceRefs []   <- looks correct
substitute qualifyingTakes ALREADY: [["first-take-event-42", 113]]
after ONE advancePromisesWeek: substitute progress 1, outcome SATISFIED
```

Promise two, deliver one, waive for a one-picture substitute opening on the week your take landed,
owe nothing further, and collect a `promiseKept` trust driver. That is exactly what the Owner's
approved rule forbids: "without erasing completed work or counting it again toward the substitute."

Cause, confirmed in source: `qualifyingTakes` (`promises.ts:637-641`) rejects a take only when
`take.week < promise.windowStartWeek`, so a take AT the window's first week qualifies.

**THE LAW, decided by the parent: `substitute.windowStartWeek > waiverWeek`, refused with a stated
reason.** Not "no qualifying take inside the window", which W offered and which is narrower. The
structural rule is chosen for a reason worth knowing: a take scheduled to land later in the SAME
week would still be credited to a window opening at `waiverWeek`, so the scan closes the instance
and the comparison closes the class. It also says the true thing plainly, that a substitute is a
FORWARD obligation. One comparison, no scan.

**What this costs your suite.** Every draft opening at `today` or earlier now refuses for the
window. Group6's acceptance draft moves to `today + 1`. Group5's isolation premise (window 60 at
today 70) currently rests on a PAST-opening window and must move too, or it will refuse for the
window rather than for trust and its stated isolation will be false. Check every other draft.

**And pin the exploit itself.** Item 17's substitute half is pinned NOWHERE in the current suite,
which is why this reached the writer. Add a case that fails if a substitute is ever credited with a
take that predates its own window: mint it, advance a week, and assert `progress` is still 0 and
`outcome` still null.

## FINDING 2 — a pin of the parent's making that blocks the slice's own save step

Your `:529-531` pins `LIVE_SAVE_VERSION === 31`. Record 720 item 11 has always said **V31 → V32**,
and T0 minted nine "genuine OUTGOING V31" fixtures precisely because V32 was coming. So the pin,
not the bump, is the anomaly, and with it in place a promise row cannot carry
`supersededByPromiseId` at all: the exact-key validator refuses a 17th key and every save breaks.

This is the parent's fault, not yours. The T1 brief said to verify the constant was unmoved BY YOU
and to say so in the report. You turned a self-check into a requirement, which was a reasonable
reading of badly-worded instructions.

**Change it:** keep `PROJECTION_VERSION === 49`, which IS a real B.7 constraint the slice must not
move, and pin `LIVE_SAVE_VERSION === 32`. That case goes RED until the writer lands the bump, which
is the correct RED-first shape.

## FINDING 3 — the suite breaks `npm run typecheck`, and the parent published that

Measured by the parent: **131 errors with your file included, ZERO with only your file excluded.**
Your file imports `bridge/*.ts` by path, dragging the bridge into the ROOT `tsconfig.json`, which
already excludes `tests/bridge*.test.ts` for exactly this reason.

**Split it, following the convention the exclude glob exists to express.** Bridge-touching
assertions (the `trust.ts` attention row, the `industry.ts` fold exclusion, anything importing
`bridge/`) move to a new `tests/bridge-p14b7-promise-waiver.test.ts`, which the existing exclude
covers. Engine-only assertions stay where they are and keep their typecheck coverage. Do NOT
"solve" this by adding your file to the exclude list: that buys a green typecheck by removing the
file from it.

While you are in there: remove the 7 unused locals (TS6133), and fix two header-prose defects W
reported — the header announces a "New group12" that does not exist in the body, and describes
item 18's row text as pinned in group10 when group10 pins only the row's existence and a non-empty
reason. Pin the row TEXT, since mislabelling a waiver as "broken" is the hazard.

## Boundaries

- Change NO production file. The writer owns those and will run again after you.
- Weaken no existing pin. Every change here either moves a draft's week, splits a file, or ADDS
  coverage.
- `git status --porcelain` on `src/` and `bridge/` must be empty when you finish.
- Commit nothing. Do not run the evidence runner or the full suite.
- Archive any probe's text per record 726; do not silently delete it.

## Report

`731-T-b7-red-patch.md`: both files' sha256 and line counts, the case list with what moved and why,
the RED result for the cases that must now be red (the V32 pin, the new exploit pin), `npx tsc
--noEmit` error count on the whole repo, and anything you find that this brief gets wrong.
