# 1351-C5: P15A.2 Wave 1 RED revision -- error-handling block

Role: independent test engineer (test-author). Task: small revision to the Power Ranking RED
suite, same scratch tree, same base, adding regression coverage for the fail-loud validation
paths found unguarded by implementation review [1351-J](1351-J-p15a2-implementation-review.md)
(blocking defect 2) and directed by parent response
[1351-F2](1351-F2-parent-response-to-1351-J.md) point 2 (plus points 3 for the deep-freeze leaf).

## Authority read

Read the production candidate `1351-stage/1351-p15a2-production-r2.patch` directly to learn the
exact throw conditions and verbatim messages (quoted below), rather than guessing from the
charter prose. Ten distinct `throw new Error(...)` statements exist across the two exported
functions:

| # | Function | Guard (r2 patch line) | Message (verbatim) |
|---|---|---|---|
| 1 | `financialStrengthBand` | `:97` `!Number.isFinite(cash)` | `power ranking: cash must be finite` |
| 2 | `financialStrengthBand` | `:98-100` `!Number.isFinite(weeklyFixedCost) \|\| weeklyFixedCost < 0` | `power ranking: weekly fixed cost must be finite and non-negative` |
| 3 | `computePowerRanking` | `:121-123` `!Number.isInteger(week) \|\| !Number.isInteger(originWeek)` | `` power ranking: weeks must be integers (week ${week}, origin ${originWeek}) `` |
| 4 | `computePowerRanking` | `:124` `!Number.isFinite(baseMarketValue)` | `power ranking: baseMarketValue must be finite` |
| 5 | `computePowerRanking` | `:130` `seenStudios.has(s.studioId)` | `` power ranking: studio ${s.studioId} appears twice `` |
| 6 | `computePowerRanking` | `:131` `!Number.isInteger(s.enteredWeek)` | `` power ranking: studio ${s.studioId} has a non-integer entry week `` |
| 7 | `computePowerRanking` | `:139` `seenFilms.has(f.filmId)` | `` power ranking: film ${f.filmId} appears twice `` |
| 8 | `computePowerRanking` | `:141` `!Number.isInteger(f.releaseTick)` | `` power ranking: film ${f.filmId} has a non-integer release tick `` |
| 9 | `computePowerRanking` | `:142` `!(f.criticScore >= 0 && f.criticScore <= 100)` | `` power ranking: film ${f.filmId} critic score is outside 0..100 `` |
| 10 | `computePowerRanking` | `:143` `!(Number.isFinite(f.totalGross) && f.totalGross >= 0)` | `` power ranking: film ${f.filmId} gross must be finite and non-negative `` |

Condition 3 fires identically for a bad `week` or a bad `originWeek` (one combined check); the
parent's directive names both as separate conditions to test ("a non-integer week, originWeek,
enteredWeek or releaseTick"), so two leaves exercise this one guard, each isolating a single bad
field.

## New leaves (13), all inside a new `describe('p15a2 power ranking: error handling (1351-C5)')`
block appended at the end of `tests/p15a2-power-ranking.test.ts`

**One leaf per named throw condition (11 leaves)**, each asserting `toThrow(<message-specific
substring>)`, never a bare `toThrow()`:

1. `error-handling-non-integer-week` -- `toThrow('weeks must be integers')`
2. `error-handling-non-integer-origin-week` -- same guard, isolated on `originWeek` only
3. `error-handling-non-integer-entered-week` -- `toThrow('has a non-integer entry week')`
4. `error-handling-non-integer-release-tick` -- `toThrow('has a non-integer release tick')`
5. `error-handling-non-finite-base-market-value` -- `toThrow('baseMarketValue must be finite')`
6. `error-handling-non-finite-cash` -- tests `financialStrengthBand(NaN, ...)` and
   `financialStrengthBand(Infinity, ...)` directly, plus `computePowerRanking` end-to-end with a
   studio carrying `cash: NaN` (every row calls `financialStrengthBand(s.cash, s.weeklyFixedCost)`,
   r2:169) -- `toThrow('cash must be finite')`
7. `error-handling-duplicate-studio-id` -- two studios both `'DUP'` --
   `toThrow('studio DUP appears twice')` (the `'studio '` prefix distinguishes this from #8)
8. `error-handling-duplicate-film-id` -- two films both `'DUP'` --
   `toThrow('film DUP appears twice')`
9. `error-handling-critic-score-outside-range` -- tested at `-1`, `101`, and `NaN`
   (`NaN >= 0` is `false`, so `NaN` is caught by the same range guard, worth pinning explicitly)
   -- `toThrow('critic score is outside 0..100')`
10. `error-handling-non-finite-or-negative-total-gross` -- tested at `-1`, `Infinity`, `NaN`
    (all three collapse to the one guard) -- `toThrow('gross must be finite and non-negative')`
11. `error-handling-non-finite-or-negative-weekly-fixed-cost` -- tested at `-1`, `Infinity`, `NaN`
    directly via `financialStrengthBand`, plus end-to-end via `computePowerRanking` with a studio
    carrying `weeklyFixedCost: -1` -- `toThrow('weekly fixed cost must be finite and non-negative')`

Every fixture isolates exactly one broken field, using the existing `studio()`/`film()` default
builders for every other field (already-valid defaults), and every guard's ordering in the
production source was checked by hand so no *earlier* guard could pre-empt the one under test
(e.g. the two-studios-named-`'DUP'` fixture relies on the first occurrence passing its own
`enteredWeek` check via the default `enteredWeek: 0` before the second occurrence's duplicate
check fires; the per-film validations run before the window/authored skip, so no studio entry
in `input.studios` is needed at all for the film-level guards).

**One leaf for the no-private-balance-in-messages requirement** (mirrors the existing
`compute-power-ranking-no-private-balance-probe-cash-not-in-payload` leaf's probe values, `987654321`
and `123456789`, but over *thrown message text* instead of the snapshot payload):
`error-handling-no-private-balance-in-thrown-messages`. Forces four distinct throws and asserts
none of the four captured messages contain either probe substring:
- `financialStrengthBand(NaN, 123456789)` (cash invalid; fixed cost carries the probe)
- `financialStrengthBand(987654321, -1)` (fixed cost invalid; cash carries the probe)
- `computePowerRanking` with a studio carrying both probes, duplicated (an *unrelated* throw
  reason -- condition 5 above never interpolates cash/weeklyFixedCost)
- the same probed studio with a non-integer `enteredWeek` (condition 6, also unrelated to finance)

This proves the guarantee holds across throw paths that never mention finance at all, not only
the two guards whose job is literally to validate a finance field.

**One leaf for input immutability** (1351-F2 point 3 / 1351-J non-blocking note 1):
`error-handling-deep-frozen-input-survives-call-byte-identical`. A local `deepFreeze` helper
recursively `Object.freeze`s a full `RankingInput` (studios, films, and the input object itself);
the leaf asserts the call to `computePowerRanking` does not throw, the input's canonicalized JSON
is identical before and after, and `Object.isFrozen` still holds on the top-level input, a studio,
and a film after the call. Freezing (not merely deep-cloning and comparing) is deliberate: in
strict mode, any in-place assignment into a frozen object throws immediately, so this leaf would
fail loudly (not silently pass) if production ever attempted a mutation, not just if the *visible*
JSON happened to end up unchanged by coincidence.

## Every other leaf unchanged

Confirmed by diff: only new lines appended at the end of `tests/p15a2-power-ranking.test.ts` (235
insertions, 0 deletions -- pure addition, no existing line touched).
`tests/p15a2-power-ranking-harness.test.ts` is byte-identical across r1-r5 (identical hunk in
every patch).

## RED run (against the missing module)

Command (same as every prior record, from the scratch tree):

```
node_modules/.bin/vitest run --project core tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts
```

Result: **2 test files failed, 47 tests failed, 1 passed (48 total).** All 13 new leaves fail for
the exact module-load reason, guaranteed by construction (`await loadPowerRanking()` is each
leaf's first statement):

```
p15a2 power ranking: error handling (1351-C5) > error-handling-non-integer-week
p15a2 power ranking: error handling (1351-C5) > error-handling-non-integer-origin-week
p15a2 power ranking: error handling (1351-C5) > error-handling-non-integer-entered-week
p15a2 power ranking: error handling (1351-C5) > error-handling-non-integer-release-tick
p15a2 power ranking: error handling (1351-C5) > error-handling-non-finite-base-market-value
p15a2 power ranking: error handling (1351-C5) > error-handling-non-finite-cash
p15a2 power ranking: error handling (1351-C5) > error-handling-duplicate-studio-id
p15a2 power ranking: error handling (1351-C5) > error-handling-duplicate-film-id
p15a2 power ranking: error handling (1351-C5) > error-handling-critic-score-outside-range
p15a2 power ranking: error handling (1351-C5) > error-handling-non-finite-or-negative-total-gross
p15a2 power ranking: error handling (1351-C5) > error-handling-non-finite-or-negative-weekly-fixed-cost
p15a2 power ranking: error handling (1351-C5) > error-handling-no-private-balance-in-thrown-messages
p15a2 power ranking: error handling (1351-C5) > error-handling-deep-frozen-input-survives-call-byte-identical
  -> each: Error: Failed to load url ../src/core/powerRanking.js ... Does the file exist?
```

Every prior leaf's status is unchanged from r4: 34 failed for their original stated reasons (33
module-load, 1 genuine `TUNING` value mismatch), and
`compute-power-ranking-standing-independence-no-standing-field-in-type` still passes as the same
documented `control-passes` case. No new control-passing leaf: every new leaf calls the missing
module like every other leaf.

Full per-leaf mapping for all 48 leaves is in `1351-stage/1351-p15a2-red-r5-classification.json`
(r4's 35 rows unmodified, plus the 13 new rows appended at the end, matching the new
`describe` block's actual position in the file).

## Run over production r2, in a throwaway copy (never the handback patch)

Per the brief's instruction, applied `1351-stage/1351-p15a2-production-r2.patch` in a **separate
throwaway copy** of the scratch tree
(`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1351-work/throwaway-r5-over-production-r2`,
created by `cp -R` of the r5 scratch tree, `git apply` of the production patch on top). The
handback patch below (`1351-p15a2-red-r5.patch`) remains tests-only, diffed against the scratch
tree's own BASE commit -- production was never applied to the tree the patch comes from.

```
cd throwaway-r5-over-production-r2
git apply --check .../1351-p15a2-production-r2.patch   # APPLY-CHECK-EXIT=0
git apply .../1351-p15a2-production-r2.patch
node_modules/.bin/vitest run --project core tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts --reporter=verbose
```

Result: **Test Files 2 passed (2), Tests 48 passed (48).** Every leaf passes, including all 13
new error-handling leaves and the pre-existing 35. Full raw output captured at
`/private/tmp/claude-501/.../scratchpad/1351-work/1351-work/../` scratchpad path
`/tmp/r5-over-prod.txt` in this session (ephemeral, reproducible by re-running the two commands
above against a fresh copy). No leaf failed; nothing to name.

Also ran the root type gate inside the same throwaway copy (against the real, now-present
`src/core/powerRanking.ts`): `node_modules/.bin/tsc --noEmit -p tsconfig.json`, exit code 0, no
output (clean) -- confirming the new leaves' TypeScript also type-checks correctly against the
real exported function signatures, not only against the `any`-typed dynamic-import stand-ins used
at RED.

## Type gate (on my own RED-only tree, module still absent)

Command: `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Exit code 2, exactly the same two
errors as every prior revision, no new errors from the 13 added leaves:

```
tests/p15a2-power-ranking-harness.test.ts(19,24): error TS2307: Cannot find module '../src/core/powerRanking.js' or its corresponding type declarations.
tests/p15a2-power-ranking.test.ts(31,24): error TS2307: Cannot find module '../src/core/powerRanking.js' or its corresponding type declarations.
```

## Patch verification and drift

`git diff <base>..HEAD -- tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts`
in the scratch tree (base = the scratch tree's own root commit, content-identical to the real
repo's `c01b3d7919692946323cc6d487ed5d0eb24ec01f`) is the full diff for both files, written to
`1351-stage/1351-p15a2-red-r5.patch`.

**Drift since BASE, reported honestly (unlike prior revisions, this window is NOT empty):**
`git diff --stat c01b3d79..<current real HEAD> -- src bridge ui tests` now shows a real change --
the sibling P15A.1 package has landed: `src/core/sharedMarket.ts` (new, 401 lines),
`src/core/tuning.ts` (+13 lines, P15A.1's own TUNING keys), and its two RED test files
(`tests/p15a1-shared-market.test.ts`, `tests/p15a1-shared-market-harness.test.ts`, now committed
into the real `tests/` directory). This is an unrelated sibling module (P15A.1's shared-market
law, not P15A.2's Power Ranking) and does not touch `src/core/powerRanking.ts` or either
`tests/p15a2-power-ranking*.test.ts` file. Confirmed the scratch apply-check still succeeds
cleanly against the real current HEAD despite this drift:

```
CURRENT=<real repo HEAD at time of this check>
SCRATCH_INDEX=$(mktemp)
GIT_INDEX_FILE=$SCRATCH_INDEX git read-tree $CURRENT
GIT_INDEX_FILE=$SCRATCH_INDEX git apply --cached --check 1351-stage/1351-p15a2-red-r5.patch
# APPLY-CHECK-EXIT = 0
rm -f "$SCRATCH_INDEX"
```

Also re-verified against the original BASE (`c01b3d79`) directly: exit 0. `src/core/powerRanking.ts`
is still absent at the real current HEAD (`git show <HEAD>:src/core/powerRanking.ts` fails to
resolve) -- Power Ranking production has not landed; only the TUNING-range comment fix (1351-F2
point 1) and this RED revision remain before landing, per 1351-F2's stated order.

## Base/HEAD

Real-repo HEAD at the end of this revision: `8cecfd621b907dcea017f52b43b9e2cd540c47cf`. Recent
commits between BASE and this HEAD include sibling P15A.1 landing work (`src/core/sharedMarket.ts`,
noted above) and P15B charter review records -- none touch P15A.2's files. `git status --short`
shows only my own untracked r5 artifacts.

## Summary

- Added 13 leaves in a new `describe('error handling')` block: 11 one-per-condition throw leaves
  (message-specific `toThrow` patterns, read verbatim from the production r2 patch), 1
  no-private-balance-in-thrown-messages leaf, 1 deep-frozen-input-survives-the-call leaf. Every
  other leaf byte-for-byte unchanged (pure 235-line addition, 0 deletions).
- RED status: 47/48 failed, all new leaves for the module-load reason (guaranteed by
  construction); 1 passed (the same pre-existing, documented `control-passes` leaf; no new
  control introduced).
- **Run over production r2 (throwaway copy, not the handback patch): 48/48 GREEN**, including
  every new leaf. Root type gate in that same throwaway copy: exit 0, no output.
- Type gate (RED-only tree): exactly the same 2 `TS2307` errors as every prior revision.
- Patch apply-checked clean against both the real current HEAD (`8cecfd62`, with unrelated
  sibling-package drift honestly reported and shown not to conflict) and the original BASE.
- Handback artifacts: `1351-stage/1351-p15a2-red-r5.patch` (full diff vs BASE, tests-only),
  `1351-stage/1351-p15a2-red-r5-classification.json` (48 rows), this file. r1-r4's own
  patch/classification files are left in place, unmodified, as the historical record.
