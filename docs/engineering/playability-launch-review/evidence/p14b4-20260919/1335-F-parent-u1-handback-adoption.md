# 1335-F: parent adoption of the U1 handback, with one amendment

The parent read [1335-C](1335-C-ui-u1-handback.md), its patch [1335-ui-u1.patch](1335-stage/1335-ui-u1.patch) (9,118
bytes, sha256 54261c9d…) and classification (5,040 bytes, sha256 63cceb82…) in full. The patch applies to HEAD
6028d78b in a temporary index. 1335-C stays byte-frozen; this record governs where they differ.

## Adopted as reported

- C5: both fixture reads use `migrateToLive(loadSave(raw)).state`, citing `ui/src/engine/adapter.ts:3796`; the
  import gains `migrateToLive`. The file passes 13 of 13 twice.
- M2: `}, 30_000)` on the eight named leaves: the World Inspector sweep and "reaches the canonical deep screen …";
  Casting Review "greenlights …"; Authority "never lets stale …"; NextEvent "orients a cash stop …" and "clears every
  next-event transient …"; `livingTurn.scheduler` "auto-pauses …". No assertion changes.
- M1: an explicit `{ timeout: 10_000 }` on the first `studio-lot-screen` wait in the mount helpers of
  `WorldFirstLotNativeCastingReviewApp`, `WorldFirstLotNativeNextEventApp` and `livingTurn.scheduler`. In the
  scheduler the wait stays before `vi.useFakeTimers()`.
- The unassigned NextEvent leaf "preserves the exact live-world reaction after a rejected import or declined restart"
  failed 2 of 3 runs in the author's tree at `openSavesFromExactReaction`'s `findByTestId('dashboard-releases-heading')`,
  the unresolved intermittent failure of [1124-A](1124-A-next-event-diagnostic-result.md). U1 does not touch it. If
  it appears in the recorded gate, its attribution is 1124-A, not U1.

## Amendment: drop the Authority file's M1 edit

`WorldFirstLotNativeCastingReviewAppAuthority.test.tsx` mocks `./StudioLotScreen.tsx` (`:99-130`); its mount helper
waits for `mock-casting-authority-lot`, which the mock renders. The added comment says the wait "races App's lazily
loaded StudioLotScreen chunk … the cold transform can exceed it". In this file the lazy import resolves to the mock,
so the mechanism the comment names does not apply. The handback classifies the edit as preventive: the file's first
leaf never failed in a recorded gate or a solo run. An edit whose stated reason does not hold in its file should not
land. The author removes that one hunk (the helper at `:337`) and keeps the file's M2 budget. The author issues
revision 2 (patch and classification) with a short revision record 1335-C2, re-runs that file twice and the UI type
gate, and repeats the temporary-index check.
