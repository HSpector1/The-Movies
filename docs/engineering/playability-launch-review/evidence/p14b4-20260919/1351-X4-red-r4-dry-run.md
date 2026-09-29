# 1351-X4: parent dry run of the Power Ranking RED r4 (1351-C4)

Scratch tree from HEAD 5dddfebe (the 1327-C method). The patch
[1351-p15a2-red-r4.patch](1351-stage/1351-p15a2-red-r4.patch), sha256 3190a76d…, applies cleanly.

| Run | Result |
|---|---|
| r4 alone ([output](1351-runs/1351-X4-red-r4.txt)) | 34 fail, 1 control passes |
| r4 over production v1 ([1351-p15a2-production.patch](1351-stage/1351-p15a2-production.patch), sha256 964c5072…; [output](1351-runs/1351-X4-red-r4-over-production-v1.txt)) | 34 pass, 1 fails: `compute-power-ranking-authored-pre-campaign-film-counts-in-no-lane`, "expected 95 to be +0" |

Over v1, the F1 and F2 leaves now pass, which confirms the writer's diagnosis in
[1351-E](1351-E-p15a2-production-handback.md). The only failure is the F3 ruling of
[1351-F](1351-F-parent-response-to-1351-E.md): v1 scores the authored film in the Films lane, 95 tenths where the
test expects 0.

The production revision 1351-E2 adds that one condition to the Films lane, and nothing else. It goes to the single
writer when the current revision (1346-E2) hands back.
