# 1344-C: RED staging for the rival screenplay shelving law (D-1329-1)

Role: independent test engineer (test-author). Repository
`/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`.
Base commit `c214094478f47c3e861d757ef568a124cbf3bd71` (`git rev-parse HEAD` confirmed equal at
start). Authority: 1344-A (charter), 1344-F (parent adoption, governs where it differs — Amendments
1-3), 1340-O D-1329-1, 1329-A (the measured stall). Genuine inputs: 1344-P's
`tests/fixtures/p14/genuine-v42-pre-shelving/` (minted at the last Save42 writer before the writer
moved, per 1344-F "Next").

## Base check and end-of-task HEAD

- BASE at start: `c214094478f47c3e861d757ef568a124cbf3bd71` — matched `git rev-parse HEAD`.
- HEAD at the end of this task: `02677d935fd54d58d5c173a08dbfdd337e382e7c`. The parent committed
  several unrelated records meanwhile (P15A.1 RED work, a relationship-slice RED, etc. — 10 commits,
  `git log --oneline c214094478..02677d935`).
- `git diff --name-only c214094478 02677d935 -- src/ bridge/ ui/ tests/` returns exactly one path:
  `ui/src/lot/StudioLotIdentityReview.test.tsx`. That file was touched by commit `8b984d12`
  ("test(ui): identity-review fake view models hollywoodPerformance, ending gate 1343's unhandled
  error (U3, 1349-E)") — a different, already-recorded task (1349-E), not this one. I did not touch
  the real working tree at any point in this task; every edit happened in the scratch tree below, and
  the only writes to the real repository are the four handback files listed under Method.

## Method actually used

Followed the brief's 1327-C scratch method verbatim:

```
BASE=c214094478f47c3e861d757ef568a124cbf3bd71
T=/private/tmp/claude-501/.../scratchpad/1344-work/tree
mkdir -p $T && cd /Users/zacheryspector/The-Movies-headless-program
git archive $BASE src bridge ui generated scripts package.json package-lock.json tsconfig.json \
  tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md \
  | tar -x -C $T
git archive $BASE tests ':!tests/fixtures' | tar -x -C $T
for d in docs node_modules art tools; do ln -s .../$d $T/$d; done
ln -s .../tests/fixtures $T/tests/fixtures
cd $T && git init -q && git add -A . && git commit -q -m base
```

New test files were written directly into `$T/tests/`. Two short exploratory scratch probes (not
part of the deliverable, deleted before the final run) used the SAME scratch tree's unmodified
`tick()`/`p13aGeneratedStudio` to derive two real facts used later (see "Exploration facts" below);
neither wrote outside the scratch tree.

Ran only the new files and the root type gate, exactly as instructed:
- `node_modules/.bin/vitest run --project core tests/p14d1-rival-shelving.test.ts`
- `node_modules/.bin/vitest run --project core tests/p14d1-rival-shelving-save-v43.test.ts`
- `node_modules/.bin/vitest run --project core tests/p14d1-rival-shelving-natural.test.ts`
- `node_modules/.bin/tsc --noEmit -p tsconfig.json`

No broad suite was run. `tests/fixtures` is a read-only symlink; nothing was written under it.

Handback, written only in the real repo:
- `$E/1344-stage/1344-shelving-red.patch` (tests only — a `git diff --cached` of the four new files
  against the scratch tree's `base` commit, which equals BASE's tree for every path it touches)
- `$E/1344-stage/1344-shelving-red-classification.json` (43 rows, one per leaf)
- `$E/1344-C-shelving-red-handback.md` (this file)
- Temporary-index apply check (below)

## Files and leaf count

| File | Purpose | Leaves |
|---|---:|---:|
| `tests/p14d1-rival-shelving-fixtures.ts` | shared fixture loader (not a test file; imported by the three below) | — |
| `tests/p14d1-rival-shelving.test.ts` | tests 1,2,3,4,5,6,7,8,10 + API-decision existence guard | 23 |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | test 9 (save-v43-shelving) + its own API-decision guard | 15 |
| `tests/p14d1-rival-shelving-natural.test.ts` | tests 11,12 | 5 |
| **Total** | | **43** |

Line counts: 670 / 244 / 128 / 82 (1124 total). Git blob shas of the staged files (from the
temp-index apply check, reproducible from the patch): `9af3467c…` (fixtures), `2ce70fd7…` (natural),
`5f40e092…` (save-v43), `c6864558…` (main).

## Temporary-index apply check (scratch `GIT_INDEX_FILE` only, real working tree untouched)

```
cd /Users/zacheryspector/The-Movies-headless-program
BASE=c214094478f47c3e861d757ef568a124cbf3bd71
export GIT_INDEX_FILE=$(mktemp /tmp/1344-apply-check-index.XXXXXX)
git read-tree $BASE
git apply --check "$PATCH"   # -> OK
git apply --cached "$PATCH"  # -> OK
git ls-tree -r $(git write-tree) -- tests/p14d1-rival-shelving*.ts
rm -f "$GIT_INDEX_FILE"
```
Result: the patch applies cleanly against BASE's tree with `git apply --check` and `--cached`,
producing the four blobs above. `git status --short` on the real working tree before and after
shows no change from this check (only the parent's other untracked evidence directories, e.g.
`1351-stage/`, which are not mine).

## RED summary

**File 1** (`tests/p14d1-rival-shelving.test.ts`): 19 failed, 4 passed (23 total). Duration 25.47s
(tests 16.98s).
**File 2** (`tests/p14d1-rival-shelving-save-v43.test.ts`): 15 failed, 0 passed (15 total).
Duration 9.47s (tests 3.50s).
**File 3** (`tests/p14d1-rival-shelving-natural.test.ts`): 4 failed, 1 passed (5 total). Duration
48.75s (tests 43.02s).

**Total: 38 failed, 5 control-passes, 43 leaves.** Every leaf's classification, requirement citation
and exact reason is in `1344-shelving-red-classification.json`. Representative exact failure texts
(verbatim from the vitest run, full logs available in the scratch tree run at HEAD `02677d935`):

```
API decisions > save.ts LIVE_SAVE_VERSION is 43, ...
AssertionError: expected 42 to be 43 // Object.is equality

shelving-stalled-route > a stalled rival ... shelves after exactly 13 ...
AssertionError: route/RED premise: studio-aca408ec-r01 shelves within 16 weeks of week 130:
expected null not to be null

shelving-blocked-weeks-hold > staffingBlocked weeks ...
TypeError: Cannot read properties of undefined (reading 'rejections')

shelving-viable-control > genesis to week 100: ...
TypeError: mods.convertV42ToV43 is not a function

shelving-retry > a viable retry re-enters the slot and greenlights, removing the shelved entry
Error: Unhandled Industry identity: [object Object]
 ❯ Module.persistedProductionIds src/core/productionIdentity.ts:111:57
 ❯ decide src/core/hollywoodTick.ts:233:83

shelving-retry > an unviable retry advances retryWeek and stays shelved ...
AssertionError: expected 130 to be NaN // Object.is equality

shelving-feasibility-readers > a shelved screenplay changes the feasibility digest ...
AssertionError: ... expected 'ed297b3951d28bec' not to be 'ed297b3951d28bec'
(both digests are identical — see "Findings" below)

shelving-feasibility-readers > opportunity paths mark a shelved screenplay impossible ...
AssertionError: expected 'REASONABLY_ACHIEVABLE' to be 'IMPOSSIBLE'

save-v43-shelving: validator rejects ... > rejects a shelved entry naming an ordinal that is ALSO active
AssertionError: expected [Function] to throw error matching /shelv/i but got
'mods(...).validateSaveV43 is not a function'

shelving-natural-route > at least one screenplayShelved receipt occurs
AssertionError: route/RED premise: at least one shelving in 130 weeks from the genuine stalled
fixture: expected 0 to be greater than or equal to 1
```

### The 5 control-passes leaves (PITFALL classification, none silently dropped)

1. **`shelving-retry > no retry before retryWeek`.** BASE's `tick()` never reads or writes
   `RivalBusiness.screenplayShelving` at all (it is an unknown extra property, carried through
   unchanged by every object-spread `hollywoodTick.ts` does). This leaf hand-inserts a
   shelved-and-not-due entry via the file's own `markShelved()` test helper, ticks 3 times, and
   checks the entry is unchanged — which holds trivially today because nothing touches it, not
   because any real "wait for retryWeek" law exists.
2. **`shelving-retry > no retry without a free slot`.** Same root cause.
3. **`shelving-retry > at most one retry per decision`.** Same root cause.
4. **`shelving-player-symmetry`.** No `screenplayShelved` receipt of any kind exists yet, so "never
   for the player" holds vacuously across a 60-week genesis route.
5. **`determinism`.** `tick()`'s determinism does not depend on the shelving law; two independent
   130-week runs are already byte-identical at BASE.

All five remain meaningful as GREEN-time regression guards (1, 2, 3 will catch a retry
implementation that fires early / without a slot / more than once per decision, once retry logic
exists to violate them; 4 and 5 guard invariants that must keep holding). None were altered to force
a RED status — the classification documents the honest reason instead, per the brief's PITFALL note.

### An unplanned, genuine RED discovery

`shelving-retry > a viable retry ...` does NOT fail on a missing field — it crashes inside
production code: `persistedProductionIds` (`src/core/productionIdentity.ts:111`, the exhaustive
`switch` on `IndustryReceipt.kind` that 1344-A §2 cites) throws `Unhandled Industry identity` when it
iterates the hand-inserted `screenplayShelved` receipt during a genuine greenlight this route
reaches (derived from a real exploration, not invented — see below). This independently confirms,
by execution rather than by reading, that `productionIdentity.ts`'s switch needs a new case for the
new receipt kind, exactly as 1344-A §2 states.

## Type gate

`node_modules/.bin/tsc --noEmit -p tsconfig.json` — **exit 0, zero errors**, ~96s wall clock
(whole-project check, not just these files). This was reached deliberately: every not-yet-existing
export/field/receipt-kind is read through a local future-shape type (`ScreenplayShelving`,
`ScreenplayShelvedReceipt`, `ShelvedBusiness`) and an explicit `as unknown as ...` cast at each
read/write boundary, exactly once per concept (a `shelving()` accessor, a `shelvedReceiptsOf()`
filter+cast helper, a `markShelved()` writer, a `TUNING_FUTURE` cast for the three new constants, a
`mods()`/`V43ModuleShape` cast for the four new save.ts exports) — the same technique
`tests/p14b9-save-v42.test.ts` used for `SaveFileV42`/`convertV41ToV42` when those did not exist.
Two mechanical difficulties were resolved along the way, both worth recording:
- A `r is IndustryReceipt & ScreenplayShelvedReceipt` type predicate is unsatisfiable (`.filter()`
  narrows to `never`, cascading into dozens of `Property does not exist on type 'never'` errors).
- A `r is ScreenplayShelvedReceipt` predicate (dropping the intersection) instead fails TS2677
  ("a type predicate's type must be assignable to its parameter's type") because
  `ScreenplayShelvedReceipt` is genuinely not a member of the current `IndustryReceipt` union.
  Fixed by using a plain boolean predicate and casting the **filtered array**, once, in one helper
  (`shelvedReceiptsOf`), rather than per call site.

If the type gate is re-run with these casts stripped (i.e. reading the new field/kind bare), the
project-wide result would instead show the expected `TS2339: Property 'screenplayShelving' does not
exist on type 'RivalBusiness'` / `Property 'HOLLYWOOD_SHELVE_AFTER_REJECTIONS' does not exist` family
of errors at each of those call sites — I chose not to leave the file in that noisier state, per the
brief's PITFALL note being about runtime vacuous-pass risk, not about maximizing visible tsc errors.

## Measured durations (RED; GREEN will very likely take longer for the leaves that currently fail
fast on a route/API premise before doing any real work)

| Leaf (file) | Duration | Budget given | Reason for explicit budget |
|---|---:|---:|---|
| `shelving-stalled-route` (1) | 2840ms | 20s | up to 16 genuine ticks over the full hollywood/talent/promise pipeline |
| `shelving-chart-output` (1) | 2996ms | 20s | up to 40 genuine ticks |
| `shelving-viable-control` case 1 (1) | not measured (fails at setup) | 30s | 100 genuine ticks from genesis |
| `shelving-commission-hold` (1) | 1603ms | 30s | up to 16+30 = 46 genuine ticks |
| `shelving-natural-route`, each of 4 leaves (3) | 5.9-9.0s | 60s | 130 genuine ticks per leaf |
| `determinism` (3) | 16.1s | 120s | 2 x 130 genuine ticks |
| everything else | <1s | default 5s | ordinary weekly-tick counts (≤20) |

All measured durations are comfortably inside their budgets. The four `shelving-natural-route` leaves
and `determinism` each independently re-run the full 130-tick route (I chose independent routes per
leaf/run for isolation, matching this file's/AI's own no-shared-mutable-state convention) rather than
sharing one precomputed result; the total wall time across file 3 (48.75s) reflects six such routes
(4 + 2 for determinism).

## Findings against the API decisions (none proved infeasible or contradicted the authority; five
interpretation choices are flagged for the parent's confirmation)

1. **`hollywoodPolicy.searchIndustryPackages` is checked only for existence, never called directly.**
   Constructing a real `ReceptionInputs` argument requires replicating `hollywoodTick.ts`'s private
   `inputsFor()` helper (not exported); I judged that duplication too risky to get right blind and
   instead exercised the searched-for staffing/cash/economic-rejection distinction indirectly,
   through `decide()`'s effects on `screenplayShelving.rejections` (tests 1, 2, 6). This is a
   coverage choice, not evidence the decision is infeasible.
2. **Test 7(c) — "`authorRivalPromise` excludes shelved screenplays from its project candidates" —
   is NOT covered by any test in this suite.** `authorRivalPromise` is private to `talentMarket.ts`.
   Two exploratory natural-route probes against the unmodified BASE `tick()` (not part of the
   deliverable, described for reproducibility): (a) genesis, 80 weeks, watching every rival studio:
   **0** `SPECIFIC_PROJECT` promises issued by any rival; (b) the genuine week-130 r01 fixture ticked
   to week 230 (crossing the `HIRING_RENEWAL_WINDOW_WEEKS` window for r01's contracts, which all end
   at week 208): exactly 2 rival promises authored for r01 in that window, both `APPEARANCE_COUNT`/
   `DIRECTING_COUNT` (the count-family candidates that `authorRivalPromise` tries before its two
   `SPECIFIC_PROJECT` candidates), 0 `SPECIFIC_PROJECT`. Reproducing the exact negotiation-trigger
   path deterministically (bypassing `openCasesAt`/`rivalProposalTrigger`'s probabilistic gates) was
   judged out of scope for this assignment's effort budget. Reported here as the brief instructs
   ("report it as a finding") rather than shipped as a weak or vacuous test.
3. **Test 1's "no money moves beyond ordinary movements, compare against a control week"** is
   implemented as: the shelving week's non-zero rival-money-movement-kind set must equal the
   immediately-preceding week's non-zero-kind set (the last pure economic-rejection week, re-derived
   independently from week 130 for isolation). The charter does not name which control week to use;
   this is the most literal, narrowest reading ("a control week" = the adjacent one) and is an
   interpretation choice, not a contract requirement quoted verbatim.
4. **Test 3's Amendment-2 "second case"** ("a run whose every evaluation is viable keeps the empty
   state") is scoped to "a business with at least one recorded greenlight and zero economic
   rejections in the first 20 weeks of genesis" rather than a formal proof that *every* evaluation
   that business ever made was viable (not cheaply provable from public state). This is narrower than
   the charter's literal wording but is the same scenario the charter's own §6 item 1 language
   describes ("a viable package greenlights ... and never counts").
5. **Test 8's "the state validates"** calls `validateSaveV43(makeSave(state))`. `makeSave`'s eventual
   V43 behavior is not itself named in the brief's PARENT API DECISIONS list; I inferred it will stamp
   `LIVE_SAVE_VERSION` (43) as it has for every prior version, which is well-supported by the existing
   pattern (`makeSave` -> `makeSaveV42` today) but is an inference beyond the literal decision list,
   flagged for the parent to confirm or correct.

## Receipts-derived facts (tests 1 and 11, the brief's explicit requirement)

**Test 1 (`shelving-stalled-route`)** never hard-codes a week. It ticks the genuine week-130 input
forward in a bounded loop (16 iterations — 13 required + 3 margin, chosen because 1329-A's own
measurement shows the viability gate never binds through week 520 on this seed, so no staffing-driven
recovery is expected inside 16 weeks either), and at each tick diffs
`after.hollywood.receipts.slice(before.hollywood.receipts.length)` for a fresh `kind==='screenplayShelved'`
receipt naming `studioId===RIVAL_R01`. The week is whatever `before.market.tick` equals at the first
tick where such a receipt appears — a pure function of the receipts stream, never a literal. The
receipt's own `.rejections` field and the immediately-preceding tick's
`screenplayShelving.rejections.find(ordinal).count` are cross-checked against each other
(count-before-shelving must equal `TUNING_FUTURE.HOLLYWOOD_SHELVE_AFTER_REJECTIONS - 1`) and against
the receipt's own carried value (must equal `TUNING_FUTURE.HOLLYWOOD_SHELVE_AFTER_REJECTIONS`) — two
independent state facts, not one number asserted twice. **Observed at RED:** the search loop runs the
full 16 iterations every time (2840ms measured); zero `screenplayShelved` receipts are ever found, so
the route/premise assertion is what actually fails (not a downstream invariant) — the correct,
earliest possible failure point given the law does not exist.

**Test 11 (`shelving-natural-route`)** ticks the genuine week-130 input 130 times (to week 260, chosen
as at least two full 52-week windows past the fixture and well over 1344-F's own derived worst-case
27-week single-studio re-shelve cycle), collecting one `GameState` snapshot per week. From the final
state's full receipts array it collects every `screenplayShelved` receipt (week and studioId read
directly off the receipt, never assumed); from consecutive weekly snapshots it derives "a commission
happened for studio S at week w" as `development.projects.length` growth for that studio between week
w and w+1 (the only durable state trace of a commission — there is no dedicated receipt kind for it,
an explicit modeling choice, not a source fact). The 13-week no-commission-after-shelving check and
the 52-week/4-shelving-window check are both computed directly from these two derived lists, never
from a pinned outcome. **Observed at RED:** all four route leaves independently find **0**
`screenplayShelved` receipts across the full 130-week route (5.9-9.0s measured per leaf), so each
leaf's own internal `>= 1` guard is what fails — this is itself the first, and expected, receipts-derived
fact this route currently produces.

## Summary

Files: `tests/p14d1-rival-shelving-fixtures.ts` (helper), `tests/p14d1-rival-shelving.test.ts`,
`tests/p14d1-rival-shelving-save-v43.test.ts`, `tests/p14d1-rival-shelving-natural.test.ts`.
43 leaves: 38 fail for a real, documented reason (missing export/field/receipt-kind, a wrong value,
or — in one case — a genuine production crash in `productionIdentity.ts`'s exhaustive switch); 5
control-pass, all classified with an honest reason in the JSON, none silently dropped. Type gate: 0
errors, exit 0. No broad suite was run. No production file was touched. Findings: one coverage gap
(test 7c, `authorRivalPromise`, not independently testable within this assignment's effort at a
non-vacuous confidence level) and five documented interpretation choices for the parent to confirm.
