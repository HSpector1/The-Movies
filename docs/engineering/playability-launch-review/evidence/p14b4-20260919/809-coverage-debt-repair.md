# 809 — coverage-debt repair: the 8 C.2a/C.4 changed-scenario cases, restored lawfully

TEST-ENGINEERING task per parent assignment. Worktree `/Users/zacheryspector/The-Movies-debt-788`, HEAD
`68783a8acb53aba4989829a2f6ddf95d8d544bc3` (detached, unchanged for the whole task — verified `git diff` on
every production source file touched by a discrimination probe is empty at close). Run 2026-09-26,
03:08–03:23 CEST (`date`, both ends). Files changed: only the three assigned test files; no production
source, fixture or snapshot is modified in the final state.

## 1. `tests/p14b5-relationships.test.ts` family 6 (6 cases) — D5 IN THE CHOOSER under the D1 roster predicate

**Finding.** Reproduced 788's trace exactly: `f6Base()` throws `F6 premise: no actor listed at both 207 and
208…` (all 6 family-6 cases fail on it). A disposable in-file probe (`tests/_scratch-f6-probe.test.ts`,
deleted after use) confirmed the shape of the constraint: at week 207, 11 actors are listed; at 208, a
different 11; exactly ONE (`t-act-23`) is in both, and it is the actor `f6Base` signs as `reliable` (excluded
from the free-actor search only for test hygiene, per the original comment). A second probe run, holding
`t-act-23` out of every reservation, produced a DIFFERENT world (perturbing which actor gets signed early
changes the RNG-driven rotation from that point on) — but the SAME structural result: a new sole holdover
(`t-act-17`), which again became `reliable`. Two-for-two, so the coupling is not this actor's identity; it is
that whichever actor plays `reliable` (signed briefly, freed at week 52, otherwise idle to 207+) is the one
the post-C.2a rotation leaves as the lone both-weeks survivor. Search bounds: 2 full-simulation trials
(original reservation; reservation excluding the first holdover) plus a full listing dump at both weeks in
each; did not attempt a third exclusion round or a different seed/week (F6.seed/F6.W anchor the entire
staged tie/bidder/standing premise via specific week numbers in comments and assertions; re-deriving that
premise for a different seed is out of a bounded search's scope).

**Change.** `reliable` is never asserted by identity anywhere in family 6 (grepped: zero hits on `.reliable`
outside `f6Base`'s own return/exclusion). Its contract ends at week 52, long before W=208, so by W it
independently satisfies the exact property the family's own requirement asks for (listed at both weeks, off
the roster under D1). Only `closedAtW`/`offCycle` are genuinely spoken for by their own dedicated sub-tests.
Narrowed the exclusion list at line ~391 from `[reliable.id, closedAtW.id, offCycle.id]` to
`[closedAtW.id, offCycle.id]`, letting `free` resolve to `reliable`'s own id — a real, engine-derived actor,
not a hand-edited state. No assertion's requirement changed; only which existing (already-signed, already-
lawful) actor plays the `free` role.

**Result.** `node_modules/.bin/vitest run tests/p14b5-relationships.test.ts --minWorkers=1 --maxWorkers=1` →
**46/46 passed** (was 40 passed / 6 failed). Discrimination demonstrated in a disposable edit of
`src/core/talentMarket.ts` (reverted, `git diff` empty after): neutering the D5 relationships descriptor
(`const relationships = 1` in place of the CloseFriends/Enemies read) flipped the 2 cases that assert a
settled D5 outcome from pass to fail (`declined` where `settled` was expected); the other 4 cases, which
assert tie/decline outcomes, are unaffected by that mutation as expected.

## 2. `tests/bridge-p14b5-relationships.test.ts` family 12 — seed-b natural-chain ledger

**Finding.** Reproduced 788: `rows` 48→47. A disposable full copy of the file
(`tests/_scratch-ledger-probe.test.ts`, deleted after use) ran the real `runLedger('seed-b', …)` and measured
every control fresh: rows 47, settled 47, declined 0, expired 0; `settlementDigest`,
`sha(receipts)`, `sha(employment)` all moved; `sha(firstTakes)` and `rngState` measured BYTE-IDENTICAL to the
pre-repair pins (the removed case never touched casting or consumed an RNG draw). The week-416 row dump
confirms the missing row precisely: event `talent-market-event-280` now sits where `-281` used to, and the
`-r02-*` sequence reads `-0,-1,-2,-4,-5` — `-r02-3` is the one gone, matching 788's named row
(`416:settled:person-studio-bc14baf6-r02-3`) exactly.

**Change.** Per the file's own control discipline (the `p13a-core-causal-01` entry already carries a
`(record 771, approved_behavioral_change)` comment block as precedent), added a matching comment above the
`seed-b` entry citing 788, naming the single row that left and why (rival crosses the actor hard boundary at
week 358; E = 416 = its own 208-week contract end; D8 — "no case opens for anyone holding a retirement
record" — refuses the renewal case that used to open there). Updated only `rows: 48→47`, `settled: 48→47`,
`settlement`, `receipts` and `employment` to the freshly measured values; `declined`, `expired`, `takes` and
`rng` are UNCHANGED (measured unmoved, so left exactly as they were — no other control loosened).

**Result.** `node_modules/.bin/vitest run tests/bridge-p14b5-relationships.test.ts --minWorkers=1
--maxWorkers=1` → **14/15 passed** (was 13/15). The seed-b case now passes. The one remaining failure
(`poachingFixture`, `expected 208 to be 52` at `tests/helpers/p14b2-fixtures.ts:198`) is a PRE-EXISTING,
separately-tracked issue (records 554/556 and others already discuss `poachingFixture`/
`publicPreferredTerm`), not one of the 8 assigned cases and not attributable to C.2a/C.4 in 788/804 — left
untouched, out of scope. Discrimination demonstrated in a disposable edit of `src/core/talentMarket.ts`
(reverted, `git diff` empty after): forcing the D8 guard off (`if (false) continue` in place of the
retirement-record check) restored the 48th row and broke the new 47-pin (`expected … length of 47 but got
48`), proving the control still catches a regression of the exact law it now encodes.

## 3. `tests/p14c2a-save-and-settlement.test.ts` E1

**Finding.** Reproduced 804: the `state.talent` id list gains exactly one entry,
`person-cohort-52-actor-0`, appended after the pre-existing 52 ids — the C.4 youth-floor cohort step firing
once at week 52 inside the 0→52 tick span this case runs.

**Change.** Kept E1's REQUIREMENT (`retirementRecordFor` settles to `status: 'retired'`, `retiredWeek: 52`,
via the existing expiry, unchanged) untouched. Re-expressed the incidental talent-invariant per rule (3):
split the single `toEqual(talentBefore)` into (a) the pre-existing prefix
(`talentAfter.slice(0, talentBefore.length)`) equals `talentBefore` byte-for-byte, and (b) everything appended
after that prefix equals exactly `lifecycle.careerLifecycle.cohorts.flatMap(r => r.personIds)` — the real
V35 cohort receipts' own bookkeeping of who was legitimately added, read from the engine, not asserted by
guesswork.

**Result.** `node_modules/.bin/vitest run tests/p14c2a-save-and-settlement.test.ts --minWorkers=1
--maxWorkers=1` → **10/10 passed** (was 9/10). Two discrimination probes, both in disposable edits of
`src/core/careerLifecycle.ts` (reverted, `git diff` empty after each and at close):
(a) a stowaway person pushed onto `talent` but omitted from the cohort receipt's `personIds` — case failed
(`expected […, 'person-cohort-stowaway'] to deeply equal […]`), proving the re-expressed invariant still
catches an unlawful append; (b) the settlement branch forced to always report `finishing_commitments` instead
of retiring — case failed on the ORIGINAL requirement (`expected … to match { status: 'retired', … }`),
proving E1's core assertion is untouched and still live.

## Summary

| # | file | case(s) | before | after |
| --- | --- | --- | --- | --- |
| 1 | p14b5-relationships.test.ts | family 6 (6 cases) | 6 failing | 46/46 pass |
| 2 | bridge-p14b5-relationships.test.ts | family 12 seed-b | 1 failing (+1 unrelated) | 14/15 pass (1 pre-existing, out of scope) |
| 3 | p14c2a-save-and-settlement.test.ts | E1 | 1 failing | 10/10 pass |

All 8 assigned cases now pass. Nothing assigned is left failing. The one still-failing case in file 2
(`poachingFixture`) is outside the 8 and outside C.2a/C.4's attributed scope; not touched, not claimed fixed.
No production source, fixture, snapshot or non-assigned test was left modified — every discrimination probe's
production edit was reverted and verified clean (`git diff` empty) before moving to the next case.

## Parent review (2026-09-26, before publication)

Accepted. The family-6 change was checked against every use of `reliable` in the file. Its only role is
setup: a player contract that runs to its end at week 52, giving the player studio its "Reliable" fallback
(`f6Base`). No assertion references it afterwards. `free`'s role is the actor listed at weeks 207 and 208 and
signed at W (the committed-at-W and closed-tie cases). One person may lawfully fill both. The residual coupling,
disclosed here: `free` now carries a prior completed contract with the player. The cases assert employment-row
facts, not a trust reading, so no assertion depends on it. The seed-b change moves only the ledger's row counts
and the three row-hashing digests, via an `approved_behavioral_change` entry that cites 788; `takes` and `rng`
are confirmed unmoved. E1 keeps D12's prefix invariant and bounds the appended people to exactly the cohort
receipts' `personIds`. The files were copied from the isolated worktree `/Users/zacheryspector/The-Movies-debt-788`,
which was then removed.
