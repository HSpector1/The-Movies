# 1326-I: attribution of the recorded broad UI gate after repair R1

## Run identity

`vitest run --project ui`, recorded as [1326-r1-broad-ui](1326-r1-broad-ui.json) at source and HEAD 11bd3f89 (equal
to the remote at preflight), 06:09:44Z to 06:25:01Z, exit 1, empty tested diff, bounded guards exact. Raw
[1326-r1-broad-ui.txt](1326-r1-broad-ui.txt), 433,032 bytes, sha256
7f1c04257c2b55f9198a54d13d768fa2e62b50ef774d2388e20d4c307fda1f69. Tally: **9 failed files, 32 failed tests, 2660
passed, 5 skipped** (2697); no unhandled error.

## What changed under the UI project since 1322

Nothing it runs. Between 29273d7f (the 1322 source) and 11bd3f89, `git diff` over `src`, `bridge`, `ui`, `generated`,
`scripts`, the package files and the configs is empty. The only non-docs change is the seven R1 core test files under
`tests/`, which the UI project does not include (`ui/**` only) and no UI test imports (1324-X).

## Result ([1326-I-failures.json](1326-I-failures.json), script [1317-I-attribution.py](1317-I-attribution.py) unchanged)

- Against 1303: 25 RETAINED-SAME (C1 timeout 6, C2 World Inspector duplicate test id 7, C3 PIL 6, C4 PIL 4, C5 Gate
  Hiring 2) and 7 NEW.
- Against 1322: the 25 rows 1322 recorded all fail again (none gone), plus 7.
- Against 1317 and 1322 together: **every one of the 32 identities is in one of the two recorded sets; none is outside
  both.**

The 7 rows beyond 1322 are the timing rows [1317-I](1317-I-broad-ui-attribution.md) measured and 1322-I recorded as
passing in that run:

- `livingTurn.scheduler`: the C1 5000 ms timeout on "auto-pauses on the FIRST PAUSE-class stop", then "a
  NOTIFY-class wrap reaches the bulletin" (`:476`) and four later leaves failing at the first Lot mount (`:207`,
  "Unable to find … studio-lot-screen"), the cascade 1317-I items 1-3 attributed to the C1 time-budget family (the
  files pass alone, 74 of 74);
- `WorldFirstLotNativeNextEventApp` "keeps an exact non-release stop on one mounted world" (`:559`), the same file's
  first-mount row in 1317-I.

`StudioLotScreen` `:930` (focus), the intermittent row 1322-I attributed to the same family, is among the 25 and fails
again here.

## Disposition

The UI gate is unchanged in cause by repair R1: the UI project ran byte-identical source, and every failing identity
belongs to a recorded retained cluster (C1 time budget, C2, C3/C4 missing `PIL`, C5). The run-to-run variation is the
C1 timing family. The 32 failures stay open with their causes.
