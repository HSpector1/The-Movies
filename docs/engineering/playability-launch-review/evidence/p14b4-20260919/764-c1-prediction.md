# 764 — the C.1 prediction, written BEFORE the writer reports

Written at `fb83f927` while the writer is still working, so this cannot be retrofitted to whatever the
run produces. Prediction 754 was falsified on its case count and the cause was the parent's
arithmetic; that error is corrected here by deriving the baseline from the run rather than from
memory, and by checking the data-driven class that caused it.

## Baseline

Run `755-b8-full-core`, source `3cae7c93`: **10 failed / 347 passed (357) test files; 25 failed /
4060 passed / 8 todo (4093) cases**, 50 distinct failure lines.

`git diff --stat 3cae7c93..HEAD -- tests/` is exactly twelve files: eleven corpus fixture artifacts,
which register no case, and `tests/p14c1-materialized-aging.test.ts`, which registers 45.

## The numbers

| | predicted |
| --- | --- |
| test files | 357 + 1 = **358** |
| cases | 4093 + 45 = **4138** |
| todo | **8**, unchanged |

**The data-driven class that falsified 754 is checked, not assumed.** That was
`bridge-runtime-checkpoint.test.ts:758`, `it.each(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.entries())`,
one case per registered prior identity. **C.1 does not bump the projection, so no prior identity is
registered and that generator adds nothing.** Every other `it.each` over save or migration data was
read: all iterate static fixture lists or literal tuples, and none scales with `LIVE_SAVE_VERSION`.

The writer is forbidden from adding or removing any `it(`, so no other case may appear.

## The prediction that matters, and it is not a count

**I predict a NONZERO and possibly large number of NEW failures in existing tests, concentrated in
assertions on exact money, salary and offer values.** This is C.1's intended consequence, not a
regression, and the reasoning is arithmetic rather than a hunch:

`ageFactor` (`src/core/employment.ts:263-267`) is a smooth quadratic bell, `prime 34`, `spread 22`,
floor `0.85`. It is flat only outside `(12, 56)`. Worldgen draws ages in `[20, 70]`. So **most people
in every world sit inside the live band**, and `offerForTalent` prices them through it.

Contract §12 F3's consequence is that a fresh V33 campaign stores INTEGER ages from genesis: the
validator forces `talent[i].age === ageAt(row, market.tick)`, so `43.40522…` is stored as `43`. Every
in-process world built by `generateWorld` or `p13aGeneratedStudio` therefore prices differently than
it does today, by a small amount, for most of its people.

Expansion 758 Traps 1 and 2 named this in advance: "Every test pinning a fractional age moves" and
"A world ticked far enough will price contracts differently than it does today. That is the intended
consequence." The scale is the part that was never estimated, and this record estimates it as LARGE.

**The disposition, decided now rather than under pressure later.** The writer REPORTS what moved and
adjusts nothing. Re-pinning a moved number is test authoring, it belongs to a test author, it happens
in a separate pass, and it is done from evidence. The Owner's directive is explicit: do not adjust
existing expectations solely to recover old outcomes.

## The falsifiers

1. **A file count other than 358.**
2. **A case count other than 4138.**
3. **Any of run 755's 50 distinct failure NAMES vanishing.** C.1 fixing an inherited failure by
   accident would need explaining, not celebrating.
4. **Any failure inside `tests/p14c1-materialized-aging.test.ts`.** The RED must be 45 of 45. A single
   failing case there means C.1 is not done.
5. **A new failure in a file that derives nothing from `talent.age`.** That is the falsifier that
   separates "the intended economic consequence" from "the writer broke something", and it is the one
   I expect to have to work hardest to evaluate.
6. **Any `it(` added or removed under `tests/` by the writer.** Counted independently by the parent.
7. **A historical hash moving** (contract §12 F4). Reported, never re-pinned.

## What this record does not predict

It does not predict WHICH files move on economics, because that depends on which assertions pin
absolute values rather than relative ones, and no static reading tells me that. The attribution is
done against the run, per file, as B.8's was.
