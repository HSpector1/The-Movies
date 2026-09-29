# 1335-C — UI retained-defect repair U1 (UI tests only): handback

Role: independent test engineer. Repo `/Users/zacheryspector/The-Movies-headless-program`,
branch `wip/headless-program-20260916-ts`, assigned base commit
`100000e3e34dfac35190dd6639cc032eb0059d92` (verified equal to `git rev-parse HEAD` at task
start — no drift then). Contract: `E/1335-A-ui-retained-repair-u1-plan.md` (rules 1-7),
reviewed ACCEPT in `E/1335-B-u1-plan-review.md`, whose three non-blocking notes are adopted
below (explicit pre/post count target; each M1 edit marked reactive/preventive; C6 treated
observed-only). Measurements: `E/1335-measure/`. Method/handback precedent:
`E/1332-C-retained-r3-handback.md`, `E/1327-C-retained-r2-handback.md`.

**Drift during the task (report per the assignment).** The real repository's `HEAD` advanced
once during this session, from the assigned base `100000e3e34dfac35190dd6639cc032eb0059d92` to
`6028d78b12e2dd32201da0ec9c13d1120297010f` — one commit
(`docs(p14): close repair R3 LOGIC VERIFIED, not GREEN (1332-K); review of both R3 gates KEEP
(1333-J); handoff CURRENT block with lessons`), made by the parent/coordinator (the repo's sole
writer), not by me or the concurrent read-only reviewer. `git show --stat 6028d78b` confirms it
touches only `docs/engineering/playability-launch-review/...` paths (8 files, 495 insertions,
0 deletions) — no `ui/`, `src/`, `tests/`, or `vitest.*` file. My scratch tree was archived from
the assigned base at task start (verified equal to `HEAD` at that moment) and was never rebuilt,
so none of my measurements are affected. The final patch-apply check (below) was re-verified
against both the assigned base and the drifted current `HEAD`; both succeed cleanly. The real
repository's `tests/`, `src/`, `ui/` and config files were never modified by me — `git status
--short` on the real repo was empty throughout.

Tests only; no production code, fixture payload, `vitest.workspace.ts`, `vitest.config.ts` or
`ui/src/test/setup.ts` change — verified by `git diff --stat` below (6 files, exactly the six
named in the task). No other test file touched. No assertion was weakened, removed or skipped;
every edit is either a fixture load-path correction (C5, no assertion touched) or a budget/wait
timeout (M1/M2, which measures time and asserts nothing about the Lot's behaviour).

## Method actually used

Scratch tree built exactly per the task's Method section, at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1335-work/tree`:
```
BASE=100000e3e34dfac35190dd6639cc032eb0059d92
git archive $BASE src bridge ui generated scripts package.json package-lock.json tsconfig.json \
  tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md \
  | tar -x -C <tree>
git archive $BASE tests ':!tests/fixtures' | tar -x -C <tree>
ln -s <repo>/tests/fixtures <tree>/tests/fixtures   # read-only
ln -s <repo>/docs <tree>/docs                        # read-only
ln -s <repo>/node_modules <tree>/node_modules        # read-only
ln -s <repo>/art <tree>/art                          # read-only
ln -s <repo>/tools <tree>/tools                      # read-only (present but unused)
cd <tree> && git init -q && git add -A && git commit -q -m "1335-C scratch base at $BASE"
```
`ui/e2e/` came with the `ui` archive automatically (contains the fixture the C5 leaves read).
Base commit in the scratch tree: `14d02a436be207c9b652f079631932bdf00862fd`. One tree only, all
edits made there with the `Edit`/`Read` tools; the real repository's `ui/` tree was never touched.
One `vitest` process at a time throughout (confirmed by running each command to completion before
starting the next — no `run_in_background` used for any vitest invocation). No production code,
no fixture payload, no `vitest.*`/`ui/src/test/setup.ts` file was read-write touched in the
scratch tree beyond the six named test files. Tree retained for evidence per the writable-role
instruction (deliverables live under `1335-work/out/`, not the repo evidence dir, per this task's
explicit instruction).

## Rule 4 mechanism choice

**Explicit `findBy` timeout on the mount helper's first `studio-lot-screen` wait** (the first
option rule 4 offers, not the `beforeAll`-awaits-the-lazy-module alternative). Applied identically
in all four named files, as one edit to each file's single shared mount helper (`renderStudio` in
`WorldFirstLotNativeCastingReviewApp.test.tsx` and `WorldFirstLotNativeNextEventApp.test.tsx`,
`mountStudio` in `WorldFirstLotNativeCastingReviewAppAuthority.test.tsx`, `mountLot` in
`livingTurn.scheduler.test.tsx`): `screen.findByTestId(<testid>, {}, { timeout: 10_000 })`.
`WorldFirstLotNativeCastingReviewAppAuthority.test.tsx` mocks `StudioLotScreen` behind its own
testid (`mock-casting-authority-lot`, not the literal string `studio-lot-screen`); the same
mechanism is applied to that file's own "the Lot has mounted" wait, which is the file's actual
M1 race point (App's lazy `StudioLotScreen` import still resolves before this testid can appear,
mocked or not). `10_000` ms was chosen as the same order of magnitude as the M2 budget's headroom
philosophy (an order of magnitude over the 1000 ms default) without adopting the M2 value itself,
since M1 bounds only the cold module-transform/import cost, not a rendered-body's work; the
post-edit measurements below show every first mount landing at 1.3–3.4 s, comfortably inside it.
No existing precedent for a `findBy` timeout override exists elsewhere in the codebase (checked:
`grep -rn "timeout:" ui/src | grep -i "findBy\|waitFor"` — no matches) — this is new, but the
codebase's own `}, 15_000)`/`}, 30_000)` per-leaf-timeout form is the direct precedent for "a
budget only bounds time, never behaviour."

`livingTurn.scheduler.test.tsx`: `findByTestId('studio-lot-screen', ...)` stays strictly before
`vi.useFakeTimers()` — only the timeout argument was added to the existing call; the call's
position in the function was not moved. Verified by reading the edited file (`mountLot` at
`:204-219`) and by the file's own comment above the function, unchanged, explaining why the order
matters (the lazy chunk resolves via the module loader, not a timer).

`WorldFirstWorldInspectorDefault.test.tsx` does **not** get an M1 edit, matching the task's
explicit scope (only the two M2 per-leaf budgets are assigned to it). Confirmed independently:
this file never mounts `App`; it renders `StudioLotScreen` directly (imported eagerly at the top
of the file) with `StudioLotView` mocked via `vi.mock`, so there is no lazy-chunk import to race —
applying M1 here would be a no-op on dead code, not a defect fix.

## Changes by file (see `1335-ui-u1-classification.json` for the full row list)

1. **`ui/src/test/contracts/p05a-w2-closed-production.contract.test.ts`** (C5, rule 2) — added
   `migrateToLive` to the existing `src/core/index.ts` import; both leaves changed
   `(loadSave(raw) as { state: GameState }).state` to `migrateToLive(loadSave(raw)).state`, with a
   comment citing `ui/src/engine/adapter.ts:3796` (`importSaveJson`'s own load path). No assertion
   changed.
2. **`ui/src/lot/WorldFirstWorldInspectorDefault.test.tsx`** (rule 3/M2) — `}, 30_000)` on
   `:355` ("reaches the canonical deep screen ONLY through the explicit details action") and
   `:629` ("never lets any place print its blocks out of the canonical order", the sweep leaf).
   C6's leaf (`:357`, "routes canvas intent and semantic companion activation to the same owner")
   and `StudioLotScreen.test.tsx:930` were not touched, per rule 7.
3. **`ui/src/lot/WorldFirstLotNativeCastingReviewApp.test.tsx`** — M1 on `renderStudio`'s
   `studio-lot-screen` wait (`:254`); M2 `}, 30_000)` on `:499` ("greenlights the canonical
   Package...").
4. **`ui/src/lot/WorldFirstLotNativeCastingReviewAppAuthority.test.tsx`** — M1 on `mountStudio`'s
   `mock-casting-authority-lot` wait (`:341`); M2 `}, 30_000)` on `:998` ("never lets stale Casting
   review closures...").
5. **`ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx`** — M1 on `renderStudio`'s
   `studio-lot-screen` wait (`:563`); M2 `}, 30_000)` on `:1709` ("orients a cash stop to
   Administration...") and `:2080` ("clears every next-event transient...").
6. **`ui/src/lot/livingTurn.scheduler.test.tsx`** — M1 on `mountLot`'s `studio-lot-screen` wait
   (`:211`, still strictly before `vi.useFakeTimers()`); M2 `}, 30_000)` on `:466` ("auto-pauses on
   the FIRST PAUSE-class stop...").

## Reactive vs. preventive (1335-B note 2)

All 14 edits are classified in `1335-ui-u1-classification.json`. 13 are **reactive** — each fixes
a leaf independently observed failing in a recorded gate (1331-I and/or 1334-I) or, for the M1
mount-helper edits in `WorldFirstLotNativeCastingReviewApp.test.tsx` and
`WorldFirstLotNativeNextEventApp.test.tsx`, a first leaf 1335-A names as measured failing solo, and
for `livingTurn.scheduler.test.tsx`'s M1 edit, the file's own C1 row plus 1317-I's documented
`mountLot`-`:207` cascade mechanism. One is **preventive**:
`WorldFirstLotNativeCastingReviewAppAuthority.test.tsx`'s M1 edit — this file's first leaf
("commits the clear successor...") passes in every recorded gate and every solo measurement in
`1335-measure/`; 1335-A's own M1-measured list names only `WorldFirstLotNativeCastingReviewApp`,
`WorldFirstLotNativeNextEventApp` and `livingTurn.scheduler`'s first leaves as failing, not this
file's. It receives the same uniform mechanism (rule 4: "applies it the same way in every named
file") without having been independently observed failing.

## Re-measurement before editing (step 1)

Ran each of the two files with pre-existing recorded baselines once, in this tree, before any
edit (the other four files' baselines were taken directly from `1335-measure/u1-solo-*.txt`,
already re-measured independently by the reviewed plan — re-confirmed identical in shape by my
own post-edit runs' pass counts matching 26 − (defect rows) exactly, see below):

```
node_modules/.bin/vitest run --project ui ui/src/test/contracts/p05a-w2-closed-production.contract.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 2 failed | 11 passed (13)
  → both failures: "studioLotSnapshot: invalid or ambiguous Gate Hiring authority" at
    ui/src/engine/adapter.ts:7264, via managedSnapshot :86, at test lines :335 and :363 — exact
    match to 1335-A's cited C5 mechanism and to 1334-I's C5-p05a-w2-gate-hiring-throw rows.

node_modules/.bin/vitest run --project ui ui/src/lot/WorldFirstWorldInspectorDefault.test.tsx --reporter=verbose
  → Test Files 1 failed (1) / Tests 4 failed | 24 passed (28)
  → sweep leaf ("never lets any place...") timed out at 5132ms; three of the four following leaves
    ("offers Development the Commission verb...", "routes the Commission verb...", "F4: offers the
    Commission verb...") failed with "Found multiple elements by: [data-testid=...]" cascades — the
    same C2 cascade mechanism 1335-A describes, though the exact cascade width (3 of the file's 7
    C2 rows, not all 7) differs from the recorded-gate width, consistent with the mechanism being
    load/timing-dependent (a timed-out body keeps rendering; how many subsequent leaves it pollutes
    before the next `unmount()`/`cleanup()` varies run to run). This does not change the fix (the
    sweep leaf's own budget), only the observed cascade width before it.
```

## Per-file post-edit runs (step 2 — each touched file whole, twice)

```
p05a-w2-closed-production.contract.test.ts
  run 1: Test Files 1 passed (1) / Tests 13 passed (13)   Duration 8.29s
  run 2: Test Files 1 passed (1) / Tests 13 passed (13)   Duration 7.85s
  Both C5 leaves pass: "the guidance card agrees with the rail..." 833ms/— ,
  "the rail, the world Stage card..." 668ms/—.

WorldFirstWorldInspectorDefault.test.tsx
  run 1: Test Files 1 passed (1) / Tests 28 passed (28)   Duration 26.97s
  run 2: Test Files 1 passed (1) / Tests 28 passed (28)   Duration 30.44s
  Sweep leaf ("never lets any place...", :629, 30_000ms budget): 5803ms / 6305ms — comfortably
  inside budget. "reaches the canonical deep screen..." (:355, 30_000ms budget): 2192ms / (not
  re-logged individually in run 2's grep, file passed whole). C6's leaf ("routes canvas intent...",
  untouched) passes both runs (363ms run 1) — consistent with 1335-A cause 4's cascade hypothesis:
  once the sweep leaf no longer overruns, C6 no longer inherits a stray route. All 28 leaves pass
  both runs, including the file's own "NEW" 1334-I row ("still refuses — and still never
  dead-ends...") which was a same-mechanism cascade not individually named in 1335-A.

WorldFirstLotNativeCastingReviewApp.test.tsx
  run 1: Test Files 1 passed (1) / Tests 10 passed (10)   Duration 29.02s
  run 2: Test Files 1 passed (1) / Tests 10 passed (10)   Duration 29.07s
  First leaf (M1 mount, :254 budget 10_000ms): 3357ms / 3423ms. Target M2 leaf ("greenlights the
  canonical Package...", :499 budget 30_000ms): 3374ms / 3414ms.

WorldFirstLotNativeCastingReviewAppAuthority.test.tsx
  run 1: Test Files 1 passed (1) / Tests 15 passed (15)   Duration 27.94s
  run 2: Test Files 1 passed (1) / Tests 15 passed (15)   Duration 26.68s
  First leaf (M1 mount, :341 budget 10_000ms): 1520ms / (file passed whole, not re-logged).
  Target M2 leaf ("never lets stale Casting review closures...", :998 budget 30_000ms):
  4534ms / 4358ms.

WorldFirstLotNativeNextEventApp.test.tsx
  run 1: Test Files 1 FAILED (1) / Tests 1 failed | 35 passed (36)   Duration 54.46s
  run 2: Test Files 1 passed (1) / Tests 36 passed (36)              Duration 52.52s
  run 3 (diagnostic, see below): Test Files 1 FAILED (1) / Tests 1 failed | 35 passed (36)  Duration 54.23s
  Both named M2 leaves pass in every run: "orients a cash stop to Administration..." (:1709,
  30_000ms budget) 7961ms (run 2); "clears every next-event transient..." (:2080, 30_000ms budget)
  2997ms (run 2). The single failure in runs 1 and 3 is NOT a named leaf of this task — see
  "Unassigned leaf observed failing" below.

livingTurn.scheduler.test.tsx
  run 1: Test Files 1 passed (1) / Tests 13 passed (13)   Duration 24.50s
  run 2: Test Files 1 passed (1) / Tests 13 passed (13)   Duration 25.14s
  First leaf (M1 mount, :211 budget 10_000ms, "offers hold/roll..."): 1320ms / 1360ms. Target M2
  leaf ("auto-pauses on the FIRST PAUSE-class stop...", :466 budget 30_000ms): 2163ms / 2182ms.
```

Every named leaf in this task's scope (all 6 files' M1/M2/C5 assignments) passed in every run it
was measured in. No named leaf was forced, weakened or skipped to reach these results.

## Unassigned leaf observed failing (report, not fixed — out of scope)

`WorldFirstLotNativeNextEventApp.test.tsx`'s **"preserves the exact live-world reaction after a
rejected import or declined restart"** leaf failed in 2 of my 3 runs of this file (run 1: 2629ms,
`TestingLibraryElementError: Unable to find an element by: [data-testid="dashboard-releases-heading"]`
at `openSavesFromExactReaction`'s own `findByTestId` call, `:1933` in the edited file, default
1000ms timeout; run 3: 2664ms, identical primary and frame). It passed clean in run 2 (2057ms).
This leaf is **not named anywhere in 1335-A's cause list**, not one of this task's six assigned
edits, and `openSavesFromExactReaction` is a separate, locally-scoped async helper that my M1 edit
(to the file's `renderStudio` mount helper, a different function) does not touch or call. It does
**not** appear in either recorded-gate baseline I checked (1331-I's 34 or 1334-I's 26 failing
identities) — it passed in both. It **does** match a previously-documented, independently
unresolved intermittent defect: `E/1124-A-next-event-diagnostic-result.md` (dated 2026-09-27,
against published `bc2492be`) records this exact leaf failing at this exact
line/testid/helper (`:1929`/`:1971` in that record's line numbering, the second call to
`openSavesFromExactReaction`) with the conclusion "The original failure remains unresolved. No
production or test correction is retained." This is a pre-existing, previously-known, unresolved
race — not something introduced by U1's edits, not fixable within this task's authorized scope
(this task authorizes only the six named files' M1/M2/C5 edits, not this leaf), and left untouched
per the task's "No other test file... No assertion weakened" boundary. **I flag it because it may
make the next recorded UI gate's failing count non-deterministic (25, 26 or 27 depending on this
one flake) independent of whether U1 itself is correct** — this is a remaining defect distinct
from anything U1 claims to fix, and the parent/next reviewer should not attribute its presence or
absence in the next gate to U1.

## UI type gate

```
node_modules/.bin/tsc --noEmit -p ui/tsconfig.json
  → exit 0, empty output
```

## `git diff --stat` (scratch tree, against its own base commit `14d02a43`)

```
 ui/src/lot/WorldFirstLotNativeCastingReviewApp.test.tsx                    |  8 ++++++--
 ui/src/lot/WorldFirstLotNativeCastingReviewAppAuthority.test.tsx           |  8 ++++++--
 ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx                        | 10 +++++++---
 ui/src/lot/WorldFirstWorldInspectorDefault.test.tsx                        |  4 ++--
 ui/src/lot/livingTurn.scheduler.test.tsx                                   |  8 ++++++--
 ui/src/test/contracts/p05a-w2-closed-production.contract.test.ts           | 12 ++++++++++--
 6 files changed, 37 insertions(+), 13 deletions(-)
```
Exactly the six files named in this task's scope; no production code, fixture payload, or
`vitest.*`/`ui/src/test/setup.ts` file appears.

## Consumer sweep

None of the six edited symbols is exported (`grep -n "^export"` across all six files: no matches);
`renderStudio`/`mountStudio`/`mountLot` are file-local `const`/`function` declarations. No other
file in `ui/src` or `tests/` references any of the six touched test files by path (checked with a
`grep -rl` of each file's own basename against both trees). Each edit's effect is contained to its
own file.

## Temporary-index patch verification

```
BASE=100000e3e34dfac35190dd6639cc032eb0059d92   # assigned base
TMPIDX=$(mktemp); GIT_INDEX_FILE="$TMPIDX" git read-tree $BASE            → exit 0
GIT_INDEX_FILE="$TMPIDX" git apply --cached --check 1335-ui-u1.patch      → exit 0

# re-checked against the real repo's current (drifted) HEAD 6028d78b:
TMPIDX=$(mktemp); GIT_INDEX_FILE="$TMPIDX" git read-tree HEAD             → exit 0
GIT_INDEX_FILE="$TMPIDX" git apply --cached --check 1335-ui-u1.patch      → exit 0

git status --short (real repo, both checks)                              → empty
```
Run twice against the assigned base (identical result both times) and once against the drifted
current `HEAD` (also clean) — the patch is valid against either commit since the intervening
commit touched only `docs/`.

## Explicit expected gate count (1335-B note 1)

Latest recorded gate on this UI-project source is **1334-I** (26 failing identities; the earlier
**1331-I** recorded 34). Both are cited by the task. Cluster breakdowns, read directly from
`1334-I-failures.json`/`1331-I-failures.json`, not copied from prose:

- **1334 (26) → expected 10 after U1.** `byCluster1303`: `C1-timeout-5000ms: 6` (all 6 identities
  are exactly this task's six M1/M2-targeted leaves — confirmed row-for-row against my own
  per-file passing runs above), `C2-worldinspector-duplicate-testid: 7` (all 7 are
  `WorldFirstWorldInspectorDefault.test.tsx` cascades of the sweep leaf, confirmed gone by my
  28/28 run), `NEW: 1` (the same file's `:821` cascade row, also confirmed gone by the same 28/28
  run, though not individually named in 1335-A), `C5-p05a-w2-gate-hiring-throw: 2` (both fixed,
  confirmed 13/13). Untouched: `C3-missing-pil-rgba-export: 6`, `C4-missing-pil-stage-a: 4` — PIL
  environment gap, out of scope. **10 = 6+4, expected to remain exactly.** 26 − 6 − 7 − 1 − 2 = 10.
- **1331 (34) → expected 11 after U1, if the C6 hypothesis holds (confirmed independently here).**
  `byCluster1303`: `NEW: 7` (1335-A: 1 is `StudioLotScreen.test.tsx:930`, untouched/intermittent,
  stays; 1 is `WorldFirstLotNativeCastingReviewApp`'s first-leaf M1 cold-mount row, fixed,
  confirmed 10/10; 5 are `livingTurn.scheduler` M1 cascades, fixed, confirmed 13/13),
  `C1-timeout-5000ms: 7` (fixed), `C6-worldinspector-typeerror-options: 1` (not edited, but
  confirmed passing in my own run — matches 1334-I's own `vanishedByCluster` record that this
  exact C6 identity already vanished independently of U1 between 1303 and 1334), `C2: 7` (fixed),
  `C3: 6`/`C4: 4` (untouched), `C5: 2` (fixed). 34 − 7(NEW, 6 fixed/1 stays) − 7(C1) − 1(C6, gone)
  − 7(C2) − 2(C5) = 34 − 6 − 7 − 1 − 7 − 2 = 11 (10 PIL + 1 `StudioLotScreen:930`).
- **Caveat, both projections.** These are my own scratch-tree, file-level re-runs, not a recorded
  gate. The next recorded gate also re-runs every other UI-project file (outside this task's six),
  which I did not re-verify (out of scope; the parent's dry run covers the whole UI project). The
  unassigned `WorldFirstLotNativeNextEventApp.test.tsx` flake above is not part of either baseline
  count and could add 0 or 1 to whatever the next gate records, independent of U1.

## Deliverables (in `1335-work/out/`)

- **`1335-ui-u1.patch`** — cumulative `git diff` of the scratch tree against its own base commit
  (`14d02a43`, itself `git archive` of the assigned base `100000e3`), 6 files, 37 insertions(+) /
  13 deletions(-). Verified twice against the assigned base and once against the real repo's
  drifted current `HEAD` (all three `--check` runs exit 0; `git status --short` on the real repo
  empty each time). 9118 bytes. sha256:
  `54261c9de7c82851101ac9011413db414be18d470b8b2a4da071da875fa74a4a`
- **`1335-ui-u1-classification.json`** — 14 rows (`file, line, leaf, mechanism, status, old, new`),
  one per discrete edit location across the six files (C5: 3 rows — import + 2 leaves; M1: 4 rows,
  one per mount helper; M2: 7 rows, one per named leaf). 5040 bytes. sha256:
  `63cceb82fa81eefef95bdc2e7fc83c3936b64e834fc04be23478c0c7ac705ba0`
- This file (`1335-C-ui-u1-handback.md`).

## Cleanup

Scratch tree at `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1335-work/tree`
retained at the end of this task (writable-role evidence preservation), with the six edits
committed to the scratch tree's own local git index (`git add -A`, no further commit made beyond
staging) — the diff exists as the staged patch file above. The real repository's `tests/`, `src/`,
`ui/` and config files were never modified — `git status --short` on the real repository, checked
throughout this task, shows nothing. No commit was made in the real repository; the parent is the
only committer to the real repository. This task did not write anything under the repository's own
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/` directory — all deliverables
are under the scratch `1335-work/out/` path per the task's explicit instruction.
