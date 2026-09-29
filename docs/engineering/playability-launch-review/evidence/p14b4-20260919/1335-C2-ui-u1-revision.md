# 1335-C2 — UI repair U1 revision 2 (drop the Authority file's M1 edit)

Role: independent test engineer, same scratch tree as 1335-C
(`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1335-work/tree`).
Per the coordinator's revision request, adopting `E/1335-F-parent-u1-handback-adoption.md`.
Revision 1 (`1335-C-ui-u1-handback.md`, `1335-stage/1335-ui-u1.patch`,
`1335-stage/1335-ui-u1-classification.json`) is committed byte-frozen at the real repo's
`995f0fd1fe5aad2843adb3735e4ebc1811469da9` and left untouched — this record does not edit or
restate it, only the one amendment below.

## The change

Confirmed the amendment's premise against source before editing:
`WorldFirstLotNativeCastingReviewAppAuthority.test.tsx:99` does
`vi.mock('./StudioLotScreen.tsx', async () => { ... })`, and the mock's own render sets
`'data-testid': 'mock-casting-authority-lot'` (`:128`). `mountStudio`'s wait on that testid
therefore resolves against the mock component the test itself supplies, not against the real
lazily-loaded chunk `ui/src/App.tsx:239` imports in production — the "cold transform can exceed
[findBy's 1000ms default]" mechanism the revision-1 comment named does not hold in this file. This
matches 1335-F's finding.

Removed exactly the one M1 hunk (the comment and the `{}, { timeout: 10_000 }` argument) from
`mountStudio` in this file, restoring its `findByTestId` call to the unedited base form. No other
line in this file, and no line in any of the other five files, was touched.

```diff
--- a/ui/src/lot/WorldFirstLotNativeCastingReviewAppAuthority.test.tsx
+++ b/ui/src/lot/WorldFirstLotNativeCastingReviewAppAuthority.test.tsx
@@ -334,11 +334,7 @@ async function mountStudio(state: GameState) {
   authorityProbe.acknowledgeCalls.length = 0
   const mounted = render(<App />)
   authorityProbe.unmountApp = mounted.unmount
-  // M1: this file's first mount races App's lazily loaded StudioLotScreen chunk
-  // (ui/src/App.tsx:239) against findBy's 1000ms default; the cold transform can
-  // exceed it. An explicit timeout on this wait only, never a change to what is
-  // asserted.
-  const lot = await screen.findByTestId('mock-casting-authority-lot', {}, { timeout: 10_000 })
+  const lot = await screen.findByTestId('mock-casting-authority-lot')
   await waitFor(() => expect(activeSessionBytes()).toBe(exportSaveJson(state)))
   authorityProbe.trace.length = 0
   authorityProbe.acknowledgeCalls.length = 0
```

The file's M2 budget (`}, 30_000)` on "never lets stale Casting review closures...", now at line
994 after the four removed lines, was not touched — `git diff` (below) confirms exactly one hunk
remains for this file.

## Other five files: byte-identical to revision 1

Confirmed by extracting each file's hunk from the current staged diff and diffing it against the
corresponding hunk in revision 1's frozen `1335-ui-u1.patch`:

```
WorldFirstLotNativeCastingReviewApp.test.tsx                    → IDENTICAL to r1
WorldFirstLotNativeNextEventApp.test.tsx                        → IDENTICAL to r1
WorldFirstWorldInspectorDefault.test.tsx                        → IDENTICAL to r1
livingTurn.scheduler.test.tsx                                   → IDENTICAL to r1
ui/src/test/contracts/p05a-w2-closed-production.contract.test.ts → IDENTICAL to r1
```
(byte-for-byte diff of each extracted hunk against revision 1's patch, all five `diff` invocations
exited empty/0.)

## Run results (the changed file, whole, twice)

```
node_modules/.bin/vitest run --project ui ui/src/lot/WorldFirstLotNativeCastingReviewAppAuthority.test.tsx --reporter=verbose
  run 1 → Test Files 1 passed (1) / Tests 15 passed (15)   Duration 27.33s
    first leaf ("commits the clear successor...", mount now on the unedited default findBy):
      1395ms — well under the unedited 1000ms *default*'s own headroom is not literal (1395 > 1000
      would normally time out), but no timeout occurred: `mock-casting-authority-lot` is rendered
      synchronously by the vi.mock stub once React resolves the mocked lazy import, well inside
      whatever testing-library's real per-assertion retry loop allows in practice — confirmed
      empirically by the clean pass, consistent with 1335-F's point that this file never failed in
      any recorded gate or solo run.
    target M2 leaf ("never lets stale Casting review closures...", :994, 30_000ms budget): 4322ms.
  run 2 → Test Files 1 passed (1) / Tests 15 passed (15)   Duration 26.41s
    first leaf: 1437ms. Target M2 leaf: 3973ms.
```
15/15 both runs; no leaf failed; no assertion changed (only the removed comment/timeout argument).

## UI type gate

```
node_modules/.bin/tsc --noEmit -p ui/tsconfig.json
  → exit 0, empty output
```

## `git diff --stat` (scratch tree, cumulative, against its own base commit `14d02a43`)

```
 ui/src/lot/WorldFirstLotNativeCastingReviewApp.test.tsx                    |  8 ++++++--
 ui/src/lot/WorldFirstLotNativeCastingReviewAppAuthority.test.tsx           |  2 +-
 ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx                        | 10 +++++++---
 ui/src/lot/WorldFirstWorldInspectorDefault.test.tsx                        |  4 ++--
 ui/src/lot/livingTurn.scheduler.test.tsx                                   |  8 ++++++--
 ui/src/test/contracts/p05a-w2-closed-production.contract.test.ts           | 12 ++++++++++--
 6 files changed, 32 insertions(+), 12 deletions(-)
```
(Revision 1 was 37 insertions(+)/13 deletions(-); revision 2 drops 5 insertions/1 deletion — the
4-line comment plus the 1-line-changed-to-1-line `findByTestId` call — exactly the one hunk.)

## Temporary-index check (against the current repository HEAD)

The real repository's `HEAD` advanced twice during this task (both by the parent/coordinator, not
by me): from the assigned base `100000e3e34dfac35190dd6639cc032eb0059d92` to
`6028d78b12e2dd32201da0ec9c13d1120297010f` (a docs-only commit, reported in 1335-C), then to
`995f0fd1fe5aad2843adb3735e4ebc1811469da9` (`git show --stat`: stages 1335-C, 1335-F and the
revision-1 patch/classification under `docs/.../1335-stage/` — 4 files, 663 insertions, all under
`docs/`; confirms exactly what the coordinator's message described). Neither commit touches `ui/`,
`src/`, `tests/`, or any config file, so the revision-2 patch (built on my unmodified scratch tree,
based on the original assigned base) still applies cleanly to both:

```
BASE=100000e3e34dfac35190dd6639cc032eb0059d92
TMPIDX=$(mktemp); GIT_INDEX_FILE="$TMPIDX" git read-tree $BASE                       → exit 0
GIT_INDEX_FILE="$TMPIDX" git apply --cached --check 1335-ui-u1-r2.patch              → exit 0

# against the current repo HEAD 995f0fd1:
TMPIDX=$(mktemp); GIT_INDEX_FILE="$TMPIDX" git read-tree HEAD                        → exit 0
GIT_INDEX_FILE="$TMPIDX" git apply --cached --check 1335-ui-u1-r2.patch              → exit 0

git status --short (real repo, both checks)                                         → empty
```

## Deliverables (in `1335-work/out/`)

- **`1335-ui-u1-r2.patch`** — cumulative `git diff` of the scratch tree against its own base commit
  (`14d02a43`), all six files, 32 insertions(+) / 12 deletions(-). Verified against both the
  assigned base and the current repo HEAD (`995f0fd1`), both clean. 8330 bytes. sha256:
  `3466694daee7f4d354d0f44685951c2590dd7dc4a85456453f63aa16acab2b1e`
- **`1335-ui-u1-r2-classification.json`** — 13 rows (revision 1's 14 rows minus the removed M1 row
  for `WorldFirstLotNativeCastingReviewAppAuthority.test.tsx`; the file's M2 row's line number
  updated 998→994 to match the post-removal file). 4596 bytes. sha256:
  `2b90d654ba001e3e96eeaae22a3f350a3ff82719433334f558fc3b26fe2f3f7a`
- This file (`1335-C2-ui-u1-revision.md`).

Real repository `tests/`, `src/`, `ui/` and config files were never modified by me at any point in
either revision — `git status --short` on the real repository was empty at every check in this
task. No commit was made by me in the real repository.
