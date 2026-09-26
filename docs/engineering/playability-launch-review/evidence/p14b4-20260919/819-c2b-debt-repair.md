# 819 — coverage-debt repair: the 4 C.2b changed-scenario cases, restored lawfully

TEST-ENGINEERING task per parent assignment (817 §4). Main worktree
`/Users/zacheryspector/The-Movies-headless-program`, HEAD `1b244006` at start, `e4426466` at
close (parent committed docs — 816/817/821 evidence and two backlog docs — meanwhile; `git diff
1b244006 e4426466 --stat` touches only `docs/` files, no production source). Run 2026-09-26,
06:56–07:14 CEST (`date`, both ends). Files changed: only the three assigned test files; no
production source, fixture or snapshot is modified in the final state.

## 1. `tests/bridge-p14b5-relationships.test.ts` family 12 seed-b — the row returns

**Finding.** Reproduced 817 §2 exactly. A disposable copy of the file
(`tests/_scratch-819-seedb-measure.test.ts`, deleted after use) ran the real `runLedger('seed-b',
…)` and printed every control fresh, bypassing the stale pins: rows 48, settled 48, declined 0,
expired 0; `settlementDigest`, `sha(receipts)` and `sha(employment)` all moved; `sha(firstTakes)`
and `rngState` measured BYTE-IDENTICAL to the pre-C.2b (788) pins — the extension settled by the
sole incumbent proposer, consuming no RNG draw and casting no one, exactly as 817 predicted. The
sole new sentence across all 48 rows is `["they accepted the one final extension before
retiring"]`, on event `talent-market-event-296` — matching 817 §2's named row and
`817-seedb-settlement-rows-at-1b244006.json` exactly.

**Change.** Added a matching `approved_behavioral_change` comment block above the `seed-b` entry
citing 817, in the style of the existing 771/788 blocks: names the returning row, the cause (806
§4/§8.1's one lawful extension), the E 416→468 move, the +2 event-id shift, and that `takes`/`rng`
are confirmed unmoved. Updated `rows: 47→48`, `settled: 47→48`, `settlement`, `receipts` and
`employment` to the freshly measured values; `declined`, `expired`, `takes` and `rng` left exactly
as pinned (measured unmoved). Added a named `KNOWN_EXTENSION_ROW` constant (seed, eventId,
sentence) and replaced the blanket `expect(rows.flatMap(r => r.newSentences)).toEqual([])` with a
filtered check that exempts ONLY that one exact (seed, eventId, sentence) triple — every other row,
on this seed or any other, still fails loud on an unexpected sentence. `FROZEN_REASONS` itself is
untouched (still the pre-C.2b eight).

**Result.** `node_modules/.bin/vitest run tests/bridge-p14b5-relationships.test.ts --minWorkers=1
--maxWorkers=1` → **14/15 passed** (was 14/15 with a different failure). The seed-b case now
passes. The one remaining failure (`poachingFixture`, `expected 208 to be 52` at
`tests/helpers/p14b2-fixtures.ts:198`) is the SAME pre-existing, separately-tracked issue 809
already excluded (records 554/556 and others) — untouched, out of scope, unrelated to C.2b.

**Discrimination.** Copied the edited file into the verified `8e84bb59` extraction at
`/private/tmp/claude-501/pre-c2b-baseline` as `tests/_scratch-819-bridge-baseline.test.ts` (deleted
after use) and ran the seed-b case alone: **fails** — `expected [...] to have a length of 48 but
got 47` (the pre-C.2b tree still sits at 788's 47-row chain; no extension mechanic exists there).
Confirms the restated assertion is genuinely new, not vacuous.

## 2. `tests/p14c2a-consumers.test.ts` C2 — restated to name the C.2b extension case

**Finding.** Reproduced 817 §3.1. A probe (`tests/_scratch-819-c2-b4a-probe.test.ts`, deleted
after use) against the real `genuine-v33-c2-contract-and-case` fixture (week 48; `authored-0000`,
208-week contract, E=208) measured exactly one case on the person through the ticked window: `{
variant: 'retirementExtension', subjectStudioId: <player>, openedWeek: 196, outcome: 'expired',
closedWeek: 208, reason: 'no proposal was submitted' }`; zero `proposalSubmitted` receipts and zero
open proposals for the person at close. No `expiry`-variant case ever opens.

**Change.** Kept the natural tick route (`advanceTo` through 196–208) untouched. Restated the
requirement: asserts no case with `variant === 'expiry'` exists for the person; asserts exactly one
case exists and it is `{ variant: 'retirementExtension', openedWeek: 196, outcome: 'expired',
closedWeek: 208 }`; asserts no `proposalSubmitted` receipt was ever written for the person. Added
`readExtensionUsed, retirementRecordFor` to the existing `careerLifecycle.js` import (used by B4a
below; C2 itself needs neither).

**Result.** Case passes; file **17/17 passed**.

**Discrimination.** Copied the edited file into the `8e84bb59` baseline as
`tests/_scratch-819-c2a-baseline.test.ts` (deleted after use) and ran C2 alone: **fails** —
`expected [] to have a length of 1 but got +0` (no case of any variant ever opens on the
pre-implementation tree; the C.2b extension-discovery pass does not exist there).

## 3. `tests/p14c2a-consumers.test.ts` B4a — restated to the settled extension, not an absence

**Finding.** Reproduced 817 §3.2. Same probe: for the shortened (E=13) director world, exactly one
case opens: `{ variant: 'retirementExtension', subjectStudioId: r01, openedWeek: 1, outcome:
'settled', closedWeek: 13 }`. The retirement record: `effectiveWeek: 65, extensionUsed: true,
extendedFromWeek: 13`. Employment rows for the person: two total — the original `[0, 13)` (ended),
and exactly one live row `[13, 65)` (`reason: 'replacement'`, written by the same
`commitRivalWinner` path an ordinary rival win uses, talentMarket.ts :1008-1053). No row with
`endWeekExclusive === 221` (13 + 208, the old `staff()` fresh-hire trap) exists.

**Change.** Kept the shortened-contract construction and the 16-tick natural route untouched.
Restated the requirement from a bare absence check to: exactly one case, matching the settled
extension shape above; the record's `extensionUsed` true and `effectiveWeek` exactly
`contractEnd + TUNING.RETIREMENT_NOTICE_WEEKS` (65); exactly one live employment row, matching `[13,
65)`; and explicitly, no row anywhere with `endWeekExclusive === contractEnd + 208` (221).

**Result.** Case passes; file **17/17 passed** (same run as §2).

**Discrimination.** Same baseline copy, B4a alone: **fails** — `expected [] to have a length of 1
but got +0` (no case of any variant ever opens on the pre-implementation tree; the person is simply
never re-hired at all there — B4a's ORIGINAL 773-era assertion, "must never be true", still holds
at `8e84bb59`, but the NEW C.2b-restated assertion, "exactly one settled extension case", is false
there since no case exists).

## 4. `tests/p14c4-save-v35.test.ts` D3 "with two receipts…" — rebuilt on an extension-free world

**Finding.** Reproduced 817 §3.3 exactly. Probed (`tests/_scratch-819-d3-probe.test.ts`, then
`_scratch-819-d3-probe2.test.ts`/`_scratch-819-d3-probe3.test.ts`, all deleted after use):
`genuine-v34-c4-cohort-week` ticked to 208 carries an extension case `{ talentId:
person-studio-67adeee5-r01-2, openedWeek: 196, outcome: settled, closedWeek: 208 }` — the SAME week
as the world's own second cohort receipt (156, 208). Since `convertV36ToV35` (save.ts :9944-9963)
refuses on ANY `retirementExtension` case, open or settled, no week is ever "after the second
receipt but before the extension settles" on this world — the two events coincide. Measured all 5
other C.4 corpus worlds through their own second cohort receipt: `genuine-v34-c4-mid-year` also
coincides (extension opens 196, settles 208, second receipt 208); the other four
(`genuine-v34-c4-all-statuses`, `-null-hollywood`, `-migrated-chain`, `-deep-deficit`) carry NO
retirementExtension case at all through their own second receipt.

**Change.** Per 817 §4's fallback ("otherwise pick another genuine C.4 corpus world with no
extension by then"), rebuilt the case on `genuine-v34-c4-all-statuses` (start week 227) instead of
`genuine-v34-c4-cohort-week`. Measured its own two cohort weeks by natural ticking: 260, 312 (was
156, 208). Kept the C.4 requirement verbatim ("the downgrade refusal names the FIRST one's week,
not the second's") and added an explicit assertion that no `retirementExtension` case exists on
this world through week 312, disclosing why the world changed. No other D3 case, no D4/D5 case, and
no helper in `tests/helpers/p14c4-fixtures.ts` was touched (out of the writable scope; that file's
`liveEnvelope` comment — "None of these C.4 worlds ever open or settle a retirement extension" — is
now stale for `genuine-v34-c4-cohort-week`/`-mid-year` specifically, disclosed here, not fixed here).

**Result.** `node_modules/.bin/vitest run tests/p14c4-save-v35.test.ts --minWorkers=1
--maxWorkers=1` → **28/28 passed** (full file, was 27/28 with this one case masked).

**Baseline check (not a discrimination requirement for a C.4 case; requested anyway).** Copied the
edited file into the `8e84bb59` extraction as `tests/_scratch-819-d3-baseline.test.ts` (deleted
after use) and ran the case alone: **passes** there too. Expected: C.4 (cohorts) predates C.2b
entirely, and the rebuilt world carries no extension-related behavior either way — this case simply
exercises the same lossless-downgrade law on both trees.

## Summary

| # | file | case(s) | at HEAD (`e4426466`, descendant of `1b244006`) | at `8e84bb59` |
| --- | --- | --- | --- | --- |
| 1 | bridge-p14b5-relationships.test.ts | family 12 seed-b | pass (14/15; 1 pre-existing, out of scope) | FAILS (restated assertion; 47 vs required 48) |
| 2 | p14c2a-consumers.test.ts | C2 | pass (17/17) | FAILS (no case opens at all) |
| 3 | p14c2a-consumers.test.ts | B4a | pass (17/17, same run) | FAILS (no case opens at all) |
| 4 | p14c4-save-v35.test.ts | D3 "with two receipts…" | pass (28/28) | passes (C.4-only law, unaffected either way) |

## sha256 of the three changed files (at close, HEAD `e4426466`)

```
dc2dc00153b6c4c9f954cc0e6497207a18e0c9e9fa22d4faa6a6d979bc9f24fa  tests/bridge-p14b5-relationships.test.ts
c2646fc50012ce5983e9b9e649fcf688428fb740981ef745fc75e214560073a2  tests/p14c2a-consumers.test.ts
a3074f3b5d722bbbaebd5bb3c33fae030d3c6a4046cd723eba8653b1608eed69  tests/p14c4-save-v35.test.ts
```

## Typecheck

- `./node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` → 0 errors.
- `./node_modules/.bin/tsc -p tsconfig.bridge.json` (`npm run typecheck:bridge`) → 0 errors.

## What contradicted 817

Nothing in 817's own findings was contradicted. One instruction in the assigned return path (817
§4 / task item 4) could not be followed as its FIRST branch literally states: D3's world
(`genuine-v34-c4-cohort-week`) has its extension settle in the SAME week as its own second cohort
receipt (208), so no week exists "after the second receipt and before the first extension settles"
on that world — the two return-path branches are mutually exclusive here, not sequential options,
and 817 §3.3 already shows the two events coincide (it does not claim otherwise). Took the
documented fallback (a different, extension-free corpus world) as designed for exactly this case.
All four discrimination probes and the fresh seed-b measurement matched 817's own numbers exactly
(the 296-event id, the 47→48 row count, the coincident 196/208 extension window) with no surprises.
