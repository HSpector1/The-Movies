# Sprint 26 — the combined playtest candidate (2026-10-30, 09:37 CDT to 11:47 CDT, CLOSED)

Entry: ENTRY.md. Candidate: engine p18-season-20261028 at 6ddeeb00, tag p18-sprint26-candidate-20261030 (pushed, remote-verified; object f1c483b3) × Unity sprint15-consumer-20261028 at e7dcfc3 (STATIC-UNRUN). No source change in this sprint. Integrated report: ../INTEGRATED-REPORT.md.

## Reconciliation

- Playtest feedback: none (PR #20 zero comments and zero reviews at entry). Consequential regressions: none known beyond the one Sprint 24 found and fixed. origin/main ab65eb20 unchanged and an ancestor: no merge, no sparse-input recheck for a merge; the lane's bind verified 2,283 source entries at 6ddeeb00 (Sprint 21: 2,280; the three new files are the Sprint 24 journeys), known-missing inputs 3 (the untracked r3n1 fixtures, as every baseline).
- Browser loop on 6ddeeb00 in installed Chrome: smoke (new studio → assemble → greenlight → release → autopsy → save round-trip) 32.0 s, D-12 economy 14.7 s, P17 continuation 22.8 s, P18 season 18.4 s, astra19 portability 1.5 min: 5 of 5 (local/s26-journeys-r1.json); astra24-acquisition 29.2 s, astra24-estate 40.4 s and astra18 rights desk 20.5 s on the same tree in Sprint 24 (sprint24/local/). Eight of eight. Firefox and WebKit unavailable on this host (unrun).

## The final full gate: full-tree-s26-r1 (lane/full-tree-s26-r1/)

Bound 6ddeeb00 (2,283 entries), preflight launchAllowed (AC, 5.9 GiB free, no heavy process), launched 09:41:41 CDT through launch.sh and lane-run-r8.sh with the global lock, `end, exit 1; 11:44:24 CDT` (inherited failures present), lock released by the owner. Stages: root-ui-types 0 (128 s), bridge-types 0 (41 s), bridge-contract 0, bridge-fixture-contract 0, build 0 (25 s), full-core-including-bridge exit 1 (6,190 s), full-ui exit 1 (972 s), final-source-integrity 0.

| Class (compare-full.py, by file + full name, first failure line) | Core: 6,253 tests, 570 files: 6,138 passed, 101 failed, 3 skipped, 11 todo | UI: 2,763 tests, 212 files: 2,755 passed, 3 failed, 5 skipped |
|---|---|---|
| against full-tree-s21-r2 (the Sprint 21 gate at 9f6103f3) | NEW 0; INHERITED-SAME 94; INHERITED-CHANGED 1 (p15c2 legacy-root-downgrade 227 s against its 120 s budget; 204 s in s21, 226 s in s17); MISSING-INPUT 6 (the three untracked r3n1 fixtures, two cases each); LOAD-FAILURE 0; BASELINE-NOT-REPRODUCED 3 (s21's three NEW rows now pass: the p14d1 era pin fixed in 6c82214f, the bridge-p13b-s7 and p15c1 timing rows); OVER-BUDGET-PASS 693 (lane load) | NEW 0; INHERITED-SAME 3; OVER-BUDGET-PASS 50 |
| against full-tree-s17-r1 (the program baseline at ac697d84) | NEW 0; INHERITED-SAME 93; INHERITED-CHANGED 2 (the owner-ux projection pin 53 sees 70, was 69; p15c2 227 s, was 226 s); MISSING-INPUT 6; BASELINE-NOT-REPRODUCED 0 | NEW 1: WorldFirstStudioHome topbar-focus row timed out at 30 s under lane load (the same row s21 classified NEW timing); measured alone on 6ddeeb00 after the lane: PASS 17.6 s, file 33 of 33 (local/s26-alone-ui-world-first-home.json); INHERITED-SAME 2 |
| NEW behaviour defects | 0 | 0 |
| Timing | no waiver, budgets unchanged (decision D): the p15c2 downgrade budget row and the WorldFirstStudioHome row are measured lane-load effects, the second passing alone | |

Reading: the candidate carries exactly the pre-program inherited baseline (95 core cases in 24 files and 2 ui cases, by identity, plus the six missing-input cases), repaired none of it and added no new failure of behaviour or of a test pin; the one row NEW against the program baseline is a UI timing row that passes alone at 17.6 s. Original run and the single corrective measurement are reported apart; nothing was subtracted.

## Evidence

lane/full-tree-s26-r1/: SELECTION.json, MISSING-INPUTS.txt, run.sh, launch.sh, bind.py, compare-full.py (recovered from the records history, p16-sprint10/tools), lane.log.gz, lane.log.meta, launch-at.txt, preflight.SUMMARY.txt, core-including-bridge.json, ui.json, COMPARE-core-vs-s21-r2.txt, COMPARE-core-vs-s17-r1.txt, COMPARE-ui-vs-s21-r2.txt, COMPARE-ui-vs-s17-r1.txt. local/: s26-journeys-r1.json and .log, s26-alone-ui-world-first-home.json, s26-pr20-body-before.md (the PR description before the refresh).

## Not claimed

Owner acceptance; promotion; a green suite; native execution; Firefox or WebKit.
