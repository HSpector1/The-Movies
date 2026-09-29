# 1322-I: attribution of the recorded broad UI gate after the Save42 sweep

## Run identity

`vitest run --project ui`, recorded as [1322-save42-broad-ui](1322-save42-broad-ui.json) at source and HEAD 29273d7f
(source equal to 25501835; docs-only commit between), 01:56:12Z to 02:10:25Z, exit 1, empty tested diff, bounded
guards exact. Raw [1322-save42-broad-ui.txt](1322-save42-broad-ui.txt), 378,358 bytes, sha256
860c45f7ec1ef65a8fb4bcdee36db05879ef5993f91921cd205a73403d39b762. Tally: **8 failed files, 25 failed tests, 2667
passed, 5 skipped** (2697); no unhandled error.

## Result ([1322-I-failures.json](1322-I-failures.json), script [1317-I-attribution.py](1317-I-attribution.py))

Against 1303: 24 RETAINED-SAME (C1 timeout 5, C2 World Inspector duplicate test id 7, C3 PIL 6, C4 PIL 4, C5 Gate
Hiring 2), 1 NEW, 7 of 1303's 31 no longer fail (C8 3, fixed by the 1309 sweep; C7 1, C6 1 and C1 2, passing this
run). Against 1317: the same NEW row; 9 gone, all timing rows (the five `livingTurn.scheduler` cascade rows, the
NextEventApp first-mount row, two C1 rows and the C6 row).

The one row new against both baselines is `StudioLotScreen` "moves Hollywood keyboard focus to each successor and
announces the final take" (`:930`, `expect(element).toHaveFocus()`). It is intermittent and predates Save42:

- it failed in the 1309-X5 scratch run on the pre-Save42 tree ([extract](1309-X5-ui-extract.txt) line 13);
- it passed in the recorded 1317 gate (pre-Save42) and in the 1320-X scratch dry run (post-Save42);
- it passed run alone with its file in 1309-X5 (74 of 74).

So it follows run conditions, not the source under test; it is attributed to the C1 time-budget family 1317-I
describes (focus assertions after asynchronous successor mounts under full-suite load). No UI row is attributable to
Save42 or its sweep.
