# 1331-I: attribution of the recorded broad UI gate after repair R2

## Run identity

`vitest run --project ui`, recorded as [1331-r2-broad-ui](1331-r2-broad-ui.json) at source and HEAD 58c89932 (equal
to the remote at preflight), 10:22:52Z to 10:39:26Z, exit 1, empty tested diff, bounded guards exact
(`allGuardsExact: true`, `fixedSource: true`). Raw [1331-r2-broad-ui.txt](1331-r2-broad-ui.txt), 432,809 bytes, sha256
69b3d82cadd01445e79f69089ef8bc97f37e263dd5d0231b42161681ee60c963. Tally: **9 failed files, 34 failed tests, 2658
passed, 5 skipped** (2697); no unhandled error.

## What changed under the UI project since 1326

Nothing it runs. Between 11bd3f89 (the 1326 source) and 58c89932, `git diff` over `src`, `bridge`, `ui`,
`generated`, `scripts`, the package files, the configs and `AUDIO-PROVENANCE.md` is empty; 1326-I records the same
for 29273d7f (the 1322 source) to 11bd3f89. The only non-docs change is the seven R2 core test files under `tests/`,
which the UI project does not include (`ui/**` only). 1322, 1326 and 1331 therefore ran byte-identical UI-project
source.

## Result ([1331-I-failures.json](1331-I-failures.json), script [1317-I-attribution.py](1317-I-attribution.py) unchanged)

- Against 1303: 26 RETAINED-SAME, 1 RETAINED-CHANGED (the C6 World Inspector row, changed as at 1317), 7 NEW.
- Against 1326: 31 of its 32 identities fail again. One does not: the `WorldFirstLotNativeNextEventApp` first leaf
  (`keeps an exact non-release stop on one mounted world`), a C1 timing row per 1317-I. Three fail beyond 1326:
  - `WorldFirstWorldInspectorDefault` "reaches the canonical deep screen ONLY through the explicit details action"
    (C1, 5000 ms timeout) and "routes canvas intent and semantic companion activation to the same owner" (C6
    RETAINED-CHANGED); both are in the 1317 set;
  - `WorldFirstLotNativeCastingReviewApp` "reviews all six event-owned observations in the Lot, keeps deep detail
    optional, then hands the clear successor to Package": 5000 ms timeout, stacked with seven C1 rows under one error
    (raw lines 3959-3967; corrected per 1331-J item 1).
- Against 1317 and 1322 together: **33 of the 34 identities are in one of the two recorded sets.** The one outside
  both is the `WorldFirstLotNativeCastingReviewApp` leaf above.

## The one identity outside every recorded set

The leaf is its file's first test, so it performs the worker's first, cold mount of the lazily loaded Studio Lot.
It passed in 1317, 1322 and 1326.

Measured on HEAD 089431d8 after the gate, the file run by itself twice
([run 1](1331-I-solo-castingreview-run1.txt), [run 2](1331-I-solo-castingreview-run2.txt)): the leaf fails both
times (2457 ms, 2202 ms) with "Unable to find an element by: [data-testid="studio-lot-screen"]". The DOM printed at
the failure holds the recovery notice and the lazy placeholder `studio-lot-lazy-loading`, "Opening the Studio
Lot…". The Lot chunk had not resolved within `findBy`'s 1000 ms default. The other nine leaves pass both times.

1317-I recorded this mechanism: the cold first mount of a worker (measured there at 1161 ms and 1275 ms) races
`findBy`'s 1000 ms default, and under full-suite load a slow leaf exceeds its 5000 ms budget. The placeholder is the
state that race leaves on screen. The source is byte-identical to the runs where the leaf passed, so the outcome
depends on timing, not on the source under test. The row is attributed to the C1 time-budget family, a retained 1303
cause. The fix 1317-I names (an explicit budget for the first `findBy` of a cold mount) stays outside this increment.

The isolation evidence differs in shape from the earlier C1 members (1331-J section 4). Those rows passed when their
files ran alone (74 of 74 in 1309-X5), so their failures depended on full-suite load. This leaf fails alone as well, at
its own cold mount. The attribution to C1 rests on the placeholder state and the unchanged source, not on a solo pass.

## Disposition

Repair R2 does not change the UI gate's cause: the UI project ran byte-identical source, and every failing identity
belongs to a recorded retained cluster (C1 time budget, C2, C3/C4 missing `PIL`, C5, C6). The run-to-run variation is
the C1 timing family, which now also reaches the Casting Review first leaf. The 34 failures stay open with their
causes.
