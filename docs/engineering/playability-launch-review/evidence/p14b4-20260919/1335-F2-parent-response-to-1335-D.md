# 1335-F2: parent response to the U1 implementation review 1335-D

[1335-D](1335-D-ui-u1-review.md) returned REFINE with one required change, a documentation correction; it found no
patch defect. 1335-C and 1335-F stay byte-frozen; this record governs where they differ.

## Required change 1: why `WorldFirstWorldInspectorDefault` gets no M1 edit (corrected here)

1335-C (lines 86-90) says the file "never mounts `App`" and that an M1 edit "would be a no-op on dead code". The first
claim is wrong. The helper `bootLot` (`ui/src/lot/WorldFirstWorldInspectorDefault.test.tsx:827-832`) renders `<App />`
and waits for `studio-lot-screen` with `findBy`'s 1000 ms default. The describe block "M-B — the audition verb is a
first-class retained-planner origin" uses it.

The exclusion still holds, for a different reason. The file imports `StudioLotScreen` eagerly at `:42`
(`import { StudioLotScreen, … } from './StudioLotScreen.tsx'`, a runtime import, not type-only). By the time
`bootLot` runs, the module that `App`'s `lazy(() => import('./lot/StudioLotScreen.tsx'))` (`ui/src/App.tsx:239`)
resolves to is already loaded, so no cold transform races the wait. The three files that received M1 import no
`StudioLotScreen` at all. No gate or solo run recorded a `bootLot` wait failure. The 1334 row "still refuses — and
still never dead-ends …" failed on duplicate `lot-nav-casting-state` elements, the sweep's cascade, not on this wait.
Both `bootLot` leaves pass in the 1335-X dry run. The patch stays as staged.

## Non-blocking notes adopted

- 1335-F says "`}, 30_000)` on the eight named leaves" and then lists seven. The count is **seven**, matching the
  seven M2 rows of the classification.
- M1's `{ timeout: 10_000 }` raises only the `findBy` retry window. It does not raise the Vitest per-test timeout of a
  leaf without an M2 budget, which stays 5000 ms. The fix works because the measured cold mounts (about 1.2-3.4 s)
  stay under both limits. A maintainer should not read 10,000 ms as a ceiling for those leaves.

Next: application (1335-E), then the recorded UI gate.
