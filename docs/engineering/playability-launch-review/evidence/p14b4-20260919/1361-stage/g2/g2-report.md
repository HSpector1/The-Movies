# 1361-G2 report

Overall: **Retune**. Route: tuning: an amendment with its own record and review, then G1 and G2 again (1355-A:205-206), while P15A.1 takes its fallback step (1361-F2 ruling 3); a storage fix before Wave 3, not tuning (1355-A:196). The gate reads the cumulative rows at every read-out and K1-K5.

Rows below Proceed, each with its route:

- p13a-core-causal-01 week 520 industryGross: Retune; route: tuning: an amendment with its own record and review, then G1 and G2 again (1355-A:205-206), while P15A.1 takes its fallback step (1361-F2 ruling 3)
- p13a-core-causal-01 week 520 rivalStallWeeks: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 1560 industryGross: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 1560 rivalStallWeeks: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 3120 releasesWithFAtMost095: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 3120 industryGross: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 3120 rivalStallWeeks: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 4680 releasesWithFAtMost095: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 4680 industryGross: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 4680 rivalStallWeeks: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 6240 releasesWithFAtMost095: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 6240 industryGross: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- p13a-core-causal-01 week 6240 rivalStallWeeks: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- seed-b week 520 industryGross: Flag; route: (c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)
- seed-b week 520 rivalStallWeeks: Retune; route: tuning: an amendment with its own record and review, then G1 and G2 again (1355-A:205-206), while P15A.1 takes its fallback step (1361-F2 ruling 3)
- seed-b week 520 rivalWeeksBelowZero: Retune; route: tuning: an amendment with its own record and review, then G1 and G2 again (1355-A:205-206), while P15A.1 takes its fallback step (1361-F2 ruling 3)
- seed-b week 520 rootShare: Retune; route: a storage fix before Wave 3, not tuning (1355-A:196)
- seed-b week 1560 rivalStallWeeks: Retune; route: tuning: an amendment with its own record and review, then G1 and G2 again (1355-A:205-206), while P15A.1 takes its fallback step (1361-F2 ruling 3)
- seed-b week 1560 rootShare: Retune; route: a storage fix before Wave 3, not tuning (1355-A:196)
- seed-b week 3120 rivalStallWeeks: Retune; route: tuning: an amendment with its own record and review, then G1 and G2 again (1355-A:205-206), while P15A.1 takes its fallback step (1361-F2 ruling 3)
- seed-b week 3120 rootShare: Retune; route: a storage fix before Wave 3, not tuning (1355-A:196)
- seed-b week 4680 rivalStallWeeks: Retune; route: tuning: an amendment with its own record and review, then G1 and G2 again (1355-A:205-206), while P15A.1 takes its fallback step (1361-F2 ruling 3)
- seed-b week 4680 rootShare: Retune; route: a storage fix before Wave 3, not tuning (1355-A:196)
- seed-b week 6240 rivalStallWeeks: Retune; route: tuning: an amendment with its own record and review, then G1 and G2 again (1355-A:205-206), while P15A.1 takes its fallback step (1361-F2 ruling 3)
- seed-b week 6240 rootShare: Retune; route: a storage fix before Wave 3, not tuning (1355-A:196)

Control e4be3e5ca536b74977be0212009cff0cda93c016 (Save44); candidate c5249114ae3c5e52253625210a9512b1e5cf19ac (Save45), 2 run(s); K4 c5249114ae3c5e52253625210a9512b1e5cf19ac with the penalty at 0; RED_JSON /Users/zacheryspector/studio-scratch/1361-prod/x/r2c/p15a1.json, from p15a1-c-r1 c524911. Probe sha256 30dd9edd567b1f2adc6aadf8fdf5712a876549d39516c6dd71bb68ce0ade32f9; report sha256 2729fa18dc45b55bace8c1d4ce9773d64efb5159d19025705f6d356e5ba496b0. State digests leave out p15Sequence, powerRanking, sharedMarket, campaignLegacy.

## Threshold rows, cumulative to each read-out (1355-A:187-196)

Each cell holds the value and its band: P Proceed, F Flag, R Retune, - no releases. "c/k" is candidate over control;
"n" is the lowest genre's release count in the scope.

| Seed | Week | Median f | p10 f | Lowest genre mean f | Share f ≤ 0.95 | Industry gross c/k | Rival stall weeks c, k | Rival weeks below 0 c, k | Root / save |
|---|---:|---|---|---|---|---|---|---|---|
| p13a-core-causal-01 | 520 | 0.982 P | 0.924 P | 0.947 romance n=13 P | 16.7% P | 0.875 R | 1521, 1485 (+2.4%, 2 earlier last filming) F | 1158, 1111 (+4.2%) P | 1.58% P |
| p13a-core-causal-01 | 1560 | 0.984 P | 0.945 P | 0.954 romance n=15 P | 12.1% P | 0.904 F | 6655, 6619 (+0.5%, 2 earlier last filming) F | 6557, 6505 (+0.8%) P | 1.27% P |
| p13a-core-causal-01 | 3120 | 0.992 P | 0.960 P | 0.957 romance n=16 P | 9.3% F | 0.924 F | 17451, 17416 (+0.2%, 2 earlier last filming) F | 18537, 18478 (+0.3%) P | 1.03% P |
| p13a-core-causal-01 | 4680 | 0.992 P | 0.960 P | 0.957 romance n=16 P | 9.3% F | 0.924 F | 29931, 29896 (+0.1%, 2 earlier last filming) F | 32577, 32518 (+0.2%) P | 0.79% P |
| p13a-core-causal-01 | 6240 | 0.992 P | 0.960 P | 0.957 romance n=16 P | 9.3% F | 0.924 F | 42411, 42376 (+0.1%, 2 earlier last filming) F | 46617, 46558 (+0.1%) P | 0.63% P |
| seed-b | 520 | 0.971 P | 0.868 P | 0.901 romance n=41 P | 40.4% P | 0.933 F | 751, 668 (+12.4%, 1 new streaks, 2 stopped, 3 earlier last filming) R | 234, 55 (+325.5%) R | 2.33% R |
| seed-b | 1560 | 0.985 P | 0.890 P | 0.949 romance n=103 P | 18.7% P | 1.041 P | 4921, 4776 (+3.0%, 2 stopped, 3 earlier last filming) R | 4352, 4001 (+8.8%) P | 2.45% R |
| seed-b | 3120 | 0.973 P | 0.892 P | 0.955 horror n=227 P | 25.2% P | 1.068 P | 11342, 11438 (-0.8%, 2 stopped, 3 earlier last filming) R | 10592, 10241 (+3.4%) P | 3.02% R |
| seed-b | 4680 | 0.971 P | 0.890 P | 0.949 horror n=399 P | 28.9% P | 1.039 P | 18296, 18615 (-1.7%, 2 stopped, 3 earlier last filming) R | 16832, 16481 (+2.1%) P | 3.12% R |
| seed-b | 6240 | 0.971 P | 0.893 P | 0.950 horror n=549 P | 27.0% P | 1.070 P | 26802, 27474 (-2.4%, 4 stopped, 6 earlier last filming) R | 23072, 22721 (+1.5%) P | 3.02% R |

## K1-K5 (1355-A:161-169, :197)

| Control | Band | Route | Evidence |
|---|---|---|---|
| K1 | Proceed | (c) stays in the shared Save45 step (1361-F ruling 11) | both (K1) leaves passed in /Users/zacheryspector/studio-scratch/1361-prod/x/r2c/p15a1.json |
| K2 | Proceed | (c) stays in the shared Save45 step (1361-F ruling 11) | both (K2) leaves passed in /Users/zacheryspector/studio-scratch/1361-prod/x/r2c/p15a1.json |
| K3 | Proceed | (c) stays in the shared Save45 step (1361-F ruling 11) | p13a-core-causal-01: Save44 at week 520 equals the control through week 547; week 548 differs only in the chain of studio-aca408ec-r05:film:1 / seed-b: Save44 at week 520 equals the control through week 574; week 575 differs only in the chain of studio-bc14baf6-r05:film:4 |
| K4 | Proceed | (c) stays in the shared Save45 step (1361-F ruling 11) | every week equals the control on p13a-core-causal-01 and seed-b; the era-guard leaf failed on the penalty in the K4 tree and passed on the candidate, as it should |
| K5 | Proceed | (c) stays in the shared Save45 step (1361-F ruling 11) | both runs wrote identical digests every week, identical read-out saves and identical rows |

## Report-only rows at week 6240 (cumulative)

| Seed | Row | Candidate | Control |
|---|---|---|---|
| p13a-core-causal-01 | releases | 86 | 91 |
| p13a-core-causal-01 | rival weeks below reserve | 46773 | 46699 |
| p13a-core-causal-01 | player cash | -73600000 | -73600000 |
| p13a-core-causal-01 | player Standing (awareness, prestige, confidence) | 35.00, 40.00, 50.00 | 35.00, 40.00, 50.00 |
| p13a-core-causal-01 | greenlights | 86 | 91 |
| p13a-core-causal-01 | shelvings | 38 | 39 |
| p13a-core-causal-01 | retries | viable 0, cashBlocked 341, economicRejection 68, staffingBlocked 8996 | viable 0, cashBlocked 99, economicRejection 69, staffingBlocked 5044 |
| p13a-core-causal-01 | decide outcomes, ready loop | viable 86, cashBlocked 2029, economicRejection 521, staffingBlocked 77896 | viable 91, cashBlocked 2026, economicRejection 544, staffingBlocked 75816 |
| p13a-core-causal-01 | longest no-greenlight streak (rival) | 6208 (studio-aca408ec-r04) | 6162 (studio-aca408ec-r04) |
| p13a-core-causal-01 | last filming week per rival | r01 257, r02 233, r03 130, r04 35, r05 600, r06 1114, r07 1693, r08 2047, r09 2664 | r01 257, r02 229, r03 133, r04 81, r05 600, r06 1114, r07 1693, r08 2047, r09 2664 |
| p13a-core-causal-01 | gross ratio per studio | player -, r01 0.989, r02 0.935, r03 0.904, r04 0.461, r05 0.997, r06 0.990, r07 0.991, r08 0.988, r09 1.000 | |
| p13a-core-causal-01 | save bytes (root rows) | 6135961 (86) | 5440949 |
| p13a-core-causal-01 | tick ms, median and p95 | 12.1, 24.8 | 13.1, 32.1 |
| seed-b | releases | 2141 | 1952 |
| seed-b | rival weeks below reserve | 23138 | 22787 |
| seed-b | player cash | -73600000 | -73600000 |
| seed-b | player Standing (awareness, prestige, confidence) | 35.00, 40.00, 50.00 | 35.00, 40.00, 50.00 |
| seed-b | greenlights | 2142 | 1953 |
| seed-b | shelvings | 348 | 484 |
| seed-b | retries | viable 19, cashBlocked 23, economicRejection 2547, staffingBlocked 77 | viable 28, cashBlocked 30, economicRejection 3783, staffingBlocked 126 |
| seed-b | decide outcomes, ready loop | viable 2123, cashBlocked 1199, economicRejection 4570, staffingBlocked 46459 | viable 1925, cashBlocked 1349, economicRejection 6316, staffingBlocked 45491 |
| seed-b | longest no-greenlight streak (rival) | 6061 (studio-bc14baf6-r04) | 5982 (studio-bc14baf6-r04) |
| seed-b | last filming week per rival | r01 418, r02 375, r03 376, r04 182, r05 4817, r06 5944, r07 5930, r08 6232, r09 5251 | r01 444, r02 461, r03 354, r04 261, r05 6036, r06 5718, r07 5535, r08 6238, r09 5599 |
| seed-b | gross ratio per studio | player -, r01 1.178, r02 0.844, r03 0.911, r04 0.799, r05 1.784, r06 1.192, r07 1.012, r08 0.910, r09 0.725 | |
| seed-b | save bytes (root rows) | 36948537 (2141) | 32581072 |
| seed-b | tick ms, median and p95 | 35.2, 139.8 | 45.2, 154.8 |

Every read-out, every window and every rival are in g2-report.json.

## Run files, kept in scratch (1361-G2-F ruling 2)

| File | Bytes | sha256 |
|---|---:|---|
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/control/digests-p13a-core-causal-01.jsonl | 7538018 | d271a901d9f749c0e23de6cd83f631fe3a4a7ada06f87002a406f237badf197f |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/control/digests-seed-b.jsonl | 7538018 | a693bc9d9ffe3aa25f1b667f502cccb40c9dbe5a9970684b4e4b4d591bc046b4 |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/control/g2-run.json | 302847 | f469057b65f4a7e9e089f5aee7215836507350c45a8d684aa3c9b1a0e93b6598 |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/control/k3-save-p13a-core-causal-01.json | 1435630 | c3fd6b07f372b0735d403599dfe6ddca08e141b47475a3add8d8867dc1651b01 |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/control/k3-save-seed-b.json | 2322198 | efddf5be2330a90d0a4070c1da421cd0bfac97122a9f7cbc054aed0d21a2f9d8 |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/control/progress.txt | 3205 | 25448f83e5ccfc8d1dac36e99ae8d634b56b94d1655c474bd003e519fc8e76ad |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-1/digests-p13a-core-causal-01.jsonl | 7538018 | 12cbaab1de98c45a5cc929aab610f6a885c87db75e2905a2d3128486df73edc1 |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-1/digests-seed-b.jsonl | 7538018 | e14049ebd1d79af5e3f43657b5bb8fe1305a05fbcf08ba08cf631aafbadce071 |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-1/g2-run.json | 544540 | 143c59434189bad6e6aed6217e21ced37d4afcaa3ba66a9a965bb91e76a40a3a |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-1/k3-digests-p13a-core-causal-01.jsonl | 35003 | 0f071a13610e97e56b6fd1d6a7a2df5cbb7c0565f0a49dc9dda5d96f0299674f |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-1/k3-digests-seed-b.jsonl | 67592 | 70aed7a0fd18a9f1836363ea13b9ec5c09769383f8adeb5dfab8338229010a5b |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-1/progress.txt | 3516 | 18467c5e03809d9296df1b8643a71afe8aeb877ac54b2d406c3ba8a75a0aedb3 |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-2/digests-p13a-core-causal-01.jsonl | 7538018 | 12cbaab1de98c45a5cc929aab610f6a885c87db75e2905a2d3128486df73edc1 |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-2/digests-seed-b.jsonl | 7538018 | e14049ebd1d79af5e3f43657b5bb8fe1305a05fbcf08ba08cf631aafbadce071 |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-2/g2-run.json | 544479 | c20bebfa1848708f31a36802c375f6f6491e604eae1d88fb31277b6407fd227d |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-2/k3-digests-p13a-core-causal-01.jsonl | 35003 | 0f071a13610e97e56b6fd1d6a7a2df5cbb7c0565f0a49dc9dda5d96f0299674f |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-2/k3-digests-seed-b.jsonl | 67592 | 70aed7a0fd18a9f1836363ea13b9ec5c09769383f8adeb5dfab8338229010a5b |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/candidate-2/progress.txt | 3517 | 276efc7e876a5c2fd7361f182df76e4a2b517ddd993ab2ef7d6261e79ae61b1b |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/k4/digests-p13a-core-causal-01.jsonl | 7538018 | d271a901d9f749c0e23de6cd83f631fe3a4a7ada06f87002a406f237badf197f |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/k4/digests-seed-b.jsonl | 7538018 | a693bc9d9ffe3aa25f1b667f502cccb40c9dbe5a9970684b4e4b4d591bc046b4 |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/k4/g2-run.json | 478020 | 1fb7af5d4bffa207f7d9926ea7396eda486b78595086c88e78fb8611d91cdaca |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/k4/progress.txt | 3017 | ca97ee54b0df906a5c57a18cec2fe0becd6be3b0f33bb51a9b1e6ef9efc5743b |
| /Users/zacheryspector/studio-scratch/1361-prod/x/r2c/p15a1.json | 25772 | 4af3183c8b85997343d794a71a4a915104314c72ddfeb0b0aadddd93463c8076 |
| /Users/zacheryspector/studio-scratch/1361-prod/x/r2c/run.meta | 876 | cc1c11af1ea959fe67ad2b5b14fd977c792e9dd3c5f7df6f56c5eef3813f46ed |
| /Users/zacheryspector/studio-scratch/1361-g2/run/out/era-guard.json | 22645 | 761e2d26fe88198f7a8881be019fa771c10a63f1842a9d4a8f9c5c29d9f419ab |
