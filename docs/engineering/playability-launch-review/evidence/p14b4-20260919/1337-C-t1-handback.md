# 1337-C — timing-budget repair T1 (test files only): handback

Role: independent test engineer. Repo `/Users/zacheryspector/The-Movies-headless-program`, branch
`wip/headless-program-20260916-ts`, assigned base commit `fca1f70060e4989b2bf64a7ca3000b212c4f6432`
(verified equal to `git rev-parse HEAD` at task start — no drift; re-checked at the end, still
equal, `git status --short` on the real repo empty throughout). Contract:
`E/1337-A-timing-budget-t1-plan.md` (rules 1-5), reviewed ACCEPT in `E/1337-B-t1-plan-review.md`,
whose two non-blocking notes are adopted as comment requirements (below). Method/handback
precedent: `E/1335-C-ui-u1-handback.md`, `E/1332-C-retained-r3-handback.md`.

Test files only; no production code, fixture, config, or setup change — verified by `git diff
--stat` below (2 files, exactly the two named in the task). No assertion changed, removed or
skipped in either file: the D17 edit is a constant-value bump plus a comment; the parity edit adds
a `findBy` timeout option to an existing wait and a comment, with no change to the wait's position
relative to `vi.useFakeTimers()`.

## Method actually used

Scratch tree built exactly per the task's Method section (the 1327-C method), at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1337-work/tree`:
```
BASE=fca1f70060e4989b2bf64a7ca3000b212c4f6432
git archive $BASE src bridge ui generated scripts package.json package-lock.json tsconfig.json \
  tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md \
  | tar -x -C <tree>
git archive $BASE tests ':!tests/fixtures' | tar -x -C <tree>
ln -s <repo>/tests/fixtures <tree>/tests/fixtures   # read-only
ln -s <repo>/docs <tree>/docs                        # read-only
ln -s <repo>/node_modules <tree>/node_modules        # read-only
ln -s <repo>/art <tree>/art                          # read-only
ln -s <repo>/tools <tree>/tools                      # read-only (present but unused)
cd <tree> && git init -q && git add -A && git commit -q -m "1337-C scratch base at $BASE"
```
Base commit in the scratch tree: `01ee4bb96fefd0fcb305606bdd33c6557858ad74`. One tree only, both
edits made there with the `Edit`/`Read` tools; the real repository's `tests/` and `ui/` trees were
never touched (confirmed at the end — `git status --short` on the real repo shows nothing modified;
this task's only new content is under the scratch `1337-work/out/` path). One `vitest` process at a
time throughout — each run below was started only after the previous one finished; no
`run_in_background` was used for any vitest invocation.

Before editing, both target files were diffed byte-for-byte against the real repo's current copies
(`diff <scratch-file> <repo-file>`, both files reported identical) to confirm the scratch tree
carries the unmodified base content before any edit, and both target line numbers (`:30`, `:110`)
were confirmed to match 1337-A/1337-B's citations by direct read.

## Changes by file (see `1337-t1-classification.json` for the full row list)

1. **`tests/bridge-p14p3-directing-promises.test.ts:30`** — `const TIMEOUT = 60_000` becomes
   `const TIMEOUT = 300_000`, with a six-line comment above it. The comment states the 1333
   durations (139,426 / 116,959 / 118,597 ms), the exact old error text, the mechanism (D15/D16 are
   synchronous and ran past the old budget without being cut off; Vitest's timer can only preempt at
   a yield point a synchronous body never gives it), and adopts 1337-B's non-blocking note 1
   verbatim in substance: the constant is currently enforced only for D17 (the async leaf), so a
   future conversion of D15/D16 to `async` should reconsider whether they need their own budget. No
   other line in the file changed; `TIMEOUT` still bounds D15 (`:507`, shifted from `:501` by the
   six comment lines), D16 (`:592`, from `:586`) and D17 (`:677`, from `:671`) via the same shared
   constant, unchanged relative structure.
2. **`ui/src/lot/livingTurn.parity.test.tsx:110`** — `await screen.findByTestId('studio-lot-screen')`
   becomes `await screen.findByTestId('studio-lot-screen', {}, { timeout: 10_000 })`, with a
   five-line comment above it. The comment cites the U1 M1 precedent value (1335-A/1335-C), the
   three sibling files it was validated against under full-suite load, and adopts 1337-B's
   non-blocking note 2 verbatim in substance: this figure is precedent-analogical for this specific
   file (RTL's `findBy` failure reports no elapsed time, so there is no direct worst-case
   measurement here, unlike D17), and the recorded UI gate after this change is the actual
   confirmation step, not this edit alone. The wait stays strictly before `vi.useFakeTimers()`
   (`:112` in the edited file, still the next statement after the `waitFor` line) — only the
   timeout argument was added; the call's line position and its place in the function body were not
   moved. `mountLot` is a file-local `async function`, used by all seven leaves in the file (four
   parity arms, the byte-identical-export leaf, and the theater READ/never-read leaf); no other
   line changed.

Both `TIMEOUT` and `mountLot` are file-local (`grep -n "^export"` on both files: no match on either
symbol) — no consumer sweep needed, each edit's effect is contained to its own file.

## Commands actually run, with actual outputs

**Core D17 file, once, whole** (rule 5):
```
node_modules/.bin/vitest run --project core tests/bridge-p14p3-directing-promises.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 3 passed (3)
  → Duration 159.69s (transform 2.75s, setup 0ms, collect 3.71s, tests 155.30s, environment 0ms, prepare 132ms)
  D15 "commits genuine public directing commands with closed private authority":  63800ms
  D16 "discloses Director and legacy cast terms truthfully without private inputs": 50383ms
  D17 "migrates outgoing53 independently and isolates current55 campaigns":         41116ms
```
All three leaves pass, comfortably inside the new 300,000ms budget (solo/scratch-tree durations are
well below the cited full-suite-load durations from 1333, consistent with the precedent's own solo
D17 measurements of ~97–100s vs. the 118,597ms full-suite figure). `1174-P3-WIRE`,
`1174-P3-DISCLOSURE`, `1174-P3-RUNTIME`, and `1174-P3-BRIDGE-COUNTERS` diagnostic lines all printed
with the expected shape (`week:52`, `boundWeek:52`, `originalWeek:52/branchWeek:54`,
`aggregateVerifiedAdvances:9` etc.), matching a genuine pass, not a masked hang.

**UI parity file, twice, whole** (rule 5):
```
Run 1: node_modules/.bin/vitest run --project ui ui/src/lot/livingTurn.parity.test.tsx --reporter=verbose
  → Test Files 1 passed (1) / Tests 7 passed (7)
  → Duration 32.14s (transform 4.51s, setup 382ms, collect 5.42s, tests 23.78s, environment 1.97s, prepare 119ms)
  (a) by hand at the seam — the manual verb, pressed twelve times:                        3592ms
  (b) by the living loop at 1× — one press of Roll, then nothing at all:                  4160ms
  (b′) by the living loop at 4× — the same weeks, a quarter of the wall time:              3369ms
  (c) paused and resumed arbitrarily, including mid-week:                                  4554ms
  (d) batch-skipped — and the skip is genuine, not a hand walk in disguise:          (no ms printed, sub-reporter-threshold)
  exports FOUR byte-identical saves from four different ways of spending time:             7914ms
  runs byte-identically with the theater READ every week and with it never read:    (no ms printed, sub-reporter-threshold)

Run 2: node_modules/.bin/vitest run --project ui ui/src/lot/livingTurn.parity.test.tsx --reporter=verbose
  → Test Files 1 passed (1) / Tests 7 passed (7)
  → Duration 29.91s (transform 4.18s, setup 128ms, collect 4.89s, tests 23.68s, environment 621ms, prepare 137ms)
  (a):    3633ms
  (b):    4047ms
  (b′):   3458ms
  (c):    4492ms
  (d):    (no ms printed)
  exports FOUR byte-identical saves...:  7871ms
  theater READ/never-read:               (no ms printed)
```
All 7 leaves pass in both runs, per-leaf durations consistent between runs (within ~150ms on the
four printed non-mount leaves), all comfortably inside the file's own `MOUNTED_ARM_TIMEOUT_MS =
60_000` per-arm budget (unchanged, out of this task's scope) and the new 10,000ms mount wait.

## Type gates

```
node_modules/.bin/tsc --noEmit -p tsconfig.json
  → exit 0, empty output

node_modules/.bin/tsc --noEmit -p ui/tsconfig.json
  → exit 0, empty output
```
(Both run in the scratch tree, against the edited sources.)

## `git diff --stat` (scratch tree, against its own base commit `01ee4bb9`)

```
 tests/bridge-p14p3-directing-promises.test.ts | 8 +++++++-
 ui/src/lot/livingTurn.parity.test.tsx         | 7 ++++++-
 2 files changed, 13 insertions(+), 2 deletions(-)
```
Exactly the two files named in this task's scope; no production code, fixture, config, or
`ui/src/test/setup.ts` file appears.

## Temporary-index patch verification against the repo's current HEAD

```
BASE=fca1f70060e4989b2bf64a7ca3000b212c4f6432   # assigned base == real repo HEAD at both
                                                  # task start and task end (no drift)
TMPIDX=$(mktemp); GIT_INDEX_FILE="$TMPIDX" git read-tree $BASE         → exit 0
GIT_INDEX_FILE="$TMPIDX" git apply --cached --check 1337-t1.patch      → exit 0
git status --short (real repo)                                        → empty
```
No drift occurred during this task — the real repository's `HEAD` was `fca1f70060e4989b2bf64a7ca3000b212c4f6432`
at task start and remains `fca1f70060e4989b2bf64a7ca3000b212c4f6432` now, so only one check
(against the assigned base, which is also current `HEAD`) was needed; both are the same commit.

## Deliverables (in `1337-work/out/`)

- **`1337-t1.patch`** — cumulative `git diff` of the scratch tree against its own base commit
  (`01ee4bb9`, itself `git archive` of the assigned base `fca1f700`), 2 files, 13 insertions(+) / 2
  deletions(-). Verified to apply cleanly (`--check`) against the real repo's current, undrifted
  HEAD via a temporary index. 2391 bytes. sha256:
  `dc06e85cf157e8e43bc39c5ae6e9d4cdc052857666b6310b8c742f1566034d60`
- **`1337-t1-classification.json`** — 2 rows (`file, line, leaf, old, new, cause`), one per edit
  location, each row's `leaf` field naming every leaf the constant/wait actually governs. 2171
  bytes. sha256: `09095a70704ce6eb54a6a0e1f440bbe93c8779693eed44d67f1db6f45f56c1dc`
- This file (`1337-C-t1-handback.md`).

## Cleanup

Scratch tree at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1337-work/tree`
retained at the end of this task (writable-role evidence preservation), with the two edits made
directly in its working tree (not yet committed beyond the base commit — `git diff` against the
base is the source of the patch above). The real repository's `tests/`, `src/`, `ui/` and config
files were never modified — `git status --short` on the real repository, checked at task start and
task end, shows nothing. No commit was made in the real repository; the parent is the only
committer to the real repository. This task did not write anything under the repository's own
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/` directory — all deliverables
are under the scratch `1337-work/out/` path per the task's explicit instruction.
