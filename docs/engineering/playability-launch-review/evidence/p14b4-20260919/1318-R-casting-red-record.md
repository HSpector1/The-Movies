# 1318-R: recorded casting-driver RED on unchanged production

Recorder [1318-casting-red](1318-casting-red.json): `vitest run --project core` over the five adopted RED files
(applied byte-identical from [1315-stage5](1315-stage5/tests/) at 3be5a474), source and HEAD 3be5a474 equal to the
remote at preflight, empty tested diff, bounded guards exact (`allGuardsExact: true`, `fixedSource: true`), exit 1.
Raw: [1318-casting-red.txt](1318-casting-red.txt), 72,033 bytes, sha256
982e5e8f3af104837a364a6e5fc1ba850e0aa6e16646ebb2dbcbb22d1b46d8c2.

**21 failed, 13 passed, 1 skipped**, the count [1315-F](1315-F-parent-red-adoption.md) predicts. The 21 failing and
the passing leaf lines equal those of the scratch dry run [1315-X5](1315-X5-red-r5-dry-run-head.txt) once timings are
stripped. Every failure is its leaf's absent law: `convertV41ToV42` is not a function (4); `LIVE_SAVE_VERSION` is 41 and
the dispatcher names "1 through 41" (2); the competition constants are undefined; no `castingCompetitionLost` or
competition-only edge is minted by a direct or a queue-admitted greenlight (7); the two new driver phrases and the
never-worked-together dormancy copy are absent (2); the contractExpiry detail carries no Inseparable note (3); the
Bridge relationship readers see no competition tie (2). The skipped leaf is the `state.hollywood === null` clause,
which has no lawful route (1315-F disposition 4).

Next: the parent lands the reviewed Save42 draft ([1315-X-production-draft.patch](1315-X-production-draft.patch),
reproduced byte for byte from the dry-run tree), then GREEN on the same five files, an implementation review and the
Save42 pin sweep.
