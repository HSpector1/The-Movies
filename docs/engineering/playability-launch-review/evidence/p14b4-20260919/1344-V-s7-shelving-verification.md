# 1344-V: §7 verification of rival screenplay shelving (D-1329-1) on 469a9547

No thresholds are specified: report, attribute, flag the rest to the Owner.

An agent drafted this record from the run outputs. The parent checked it against those outputs and ruled on its open
points (section 10). Authority: [1344-A](1344-A-rival-screenplay-shelving-charter.md) §7 (:172-185),
[1344-F](1344-F-parent-shelving-charter-adoption.md) (:38-39, Amendments 2-3),
[1344-F3](1344-F3-parent-rulings-on-1344-E.md) (:16-17, ruling 4), and
[1344-F5](1344-F5-parent-rulings-row6-and-s7-definitions.md) Part B, items 1-20, which settle every open item of the
kit's [NOTES.md](1344-stage/s7/NOTES.md). The kit is [1344-stage/s7/](1344-stage/s7/), and every output cited here is
under [1344-stage/s7/out/](1344-stage/s7/out/).

**Result.**
- All four anchors read EQUAL. Controls (a)-(d) all PASS.
- On every seed the trees agree up to the tick after the first shelving, with every rival account equal there and
  no movement before it.
- The rule-based attribution ([1344-V-attribute.py](1344-V-attribute.py), output
  [1344-V-movements.json](1344-V-movements.json)) attributes all 231 film and commission movements to the shelving law.
  It flags all 154 promise movements: each changes a promise's existence or binding, which the film rule cannot
  explain. The shelving law causes them, but the outputs do not name the path (section 10, ruling 2; flag 6).
- The 50 C8, C1 and UNRESOLVED rows all still fail. Four are attributed through X10, one keeps its 1338 cause and 45
  stay open with measured causes ([1344-V-c8-worksheet.md](1344-V-c8-worksheet.md)).
- On p13a-core-causal-01 the rivals film again after shelving: 61 films at week 520 against 1329's 53. The last
  rival take falls at week 258. From week 262 every evaluation the decide-diag records is cash-blocked.

## 1. Run identity

- **Candidate** 469a9547f1a3b53b7c9985ec53beaa55e2a65587, `src` tree db80ca312211a70b54fcb75cb80480ad5e8dc867.
  **Old source** ff803032, `src` tree 347cfcce5602570eaa39137e6490d7e6fa0228eb, equal to 133aca7a's, the source
  1329-A measured. `src` and `generated` are unchanged since 9fc79624 ([out/trees.txt](1344-stage/s7/out/trees.txt);
  `build-trees.sh` refuses otherwise). So the only source difference between the trees is the shelving law and the
  pure P15 modules no tick path imports (F5 item 15).
- **Runner.** [run-s7.sh](1344-stage/s7/run-s7.sh) (sha256 b3207367…) runs the RUNBOOK's steps 0-10 with its STOP
  checks. [chain-after-gates.sh](1344-stage/s7/chain-after-gates.sh) (sha256 78700bdf…) started it when the
  sweep's recorded gates ended: "gates ended; starting run-s7.sh 469a9547…; 2026-10-01 21:39:19 CDT"
  ([out/chain.log](1344-stage/s7/out/chain.log)). The run started at 21:39:19 and ended at 21:51:30 CDT on
  2026-10-01 ([out/s7.meta](1344-stage/s7/out/s7.meta) lines 1 and 76).
- **Node v20.20.2**, at `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin/node` (s7.meta:1), pinned by
  run-s7.sh:8-10 to match the baselines (1329's probes, 1338, 1343, 1344-M). The sweep's recorded gates ran v22.23.2
  ([1344-M3](1344-M3-save43-sweep-recorded-gates.md), "Node").
- **Kit.** [out/kit-sha256.txt](1344-stage/s7/out/kit-sha256.txt) lists 13 files. The published kit under
  1344-stage/s7/ hashes to the same values (rechecked for this record). run-s7.sh and chain-after-gates.sh were
  written after the kit and are not in that list.
- **Trees.** build-trees.sh built `tree/` and `old-tree/` with scratch commits c6b501e and 1ac575f (trees.txt). The
  probes were copied in as `tests/zz-s7-*` at step 4 and removed at step 9. `git status` read empty in both trees
  (s7.meta:55-56), and empty after the C8 run (s7.meta:20).
- **Quiet machine.** The runner took `HEAVY-LANE-LOCK` before step 0 and held it to the end (run-s7.sh:28-30). Its
  wait loop found no vitest or tsc at start: s7.meta has no "waiting for" line. No per-step `pgrep` record exists;
  the lock is the evidence for the later steps. Free disk at start: 5.5 GiB (s7.meta:2).
- **Final states.** The `final-state.json` files stay in scratch. Their sha256 values are in
  [out/final-state-sha256.txt](1344-stage/s7/out/final-state-sha256.txt). Those hash the file, which is the key-sorted
  state plus a newline (s7-natural-route.test.ts:262). The `finalStateSha256` on each `S7` line hashes the state alone
  (:243). For all 11 files, the sha256 of the file without its last byte equals its run's `S7` value.

| Step | Run | Tree | Seed, weeks | Exit | ms (`S7` line) | Outputs |
|---|---|---|---|---|---:|---|
| 2 | C8 re-run | candidate | six files | 1 (expected) | none; Vitest 245.85 s | c8/run.txt, run.json, failures.json |
| 3 | control-a | candidate | test 3, two leaves | 0 | none; Vitest 8.28 s | control-a.log |
| 5 | smoke-c-route | candidate | p13a, 20 | 0 | 2,195 | natural-chain, rival-economy, weekly, s7.json |
| 5 | smoke-o-route | old | p13a, 20 | 0 | 1,477 | same four |
| 5 | smoke-c-diag | candidate | p13a, 20 | 0 | 1,282 | decide-diag.jsonl, summary (8 rows) |
| 5 | smoke-o-diag | old | p13a, 20 | 0 | 1,147 | same (8 rows) |
| 5 | smoke-c-po | candidate | corpus, 4 | 0 | none; test 678 ms | player-only.json, .cmp.json |
| 5 | smoke-o-po | old | corpus, 4 | 0 | none; test 1,009 ms | same |
| 6 | c-p13a-1 | candidate | p13a, 520 | 0 | 33,746 | four files; 14 shelvings, integrity 0 |
| 6 | c-p13a-2 | candidate | p13a, 520 | 0 | 30,754 | four files; 14 shelvings, integrity 0 |
| 6 | o-p13a | old | p13a, 520 | 0 | 24,742 | four files; integrity 0 |
| 6 | c-seedb | candidate | seed-b, 520 | 0 | 46,503 | 60 shelvings, integrity 0 |
| 6 | o-seedb | old | seed-b, 520 | 0 | 37,677 | integrity 0 |
| 6 | c-ledger-p13b | candidate | p13b-s8-bridge-probe-01, 520 | 0 | 45,422 | 6 shelvings, integrity 0 |
| 6 | o-ledger-p13b | old | p13b-s8-bridge-probe-01, 520 | 0 | 45,656 | integrity 0 |
| 6 | c-ledger-p13pub | candidate | p13-public-commercial-adoption, 520 | 0 | 39,038 | 22 shelvings, integrity 0 |
| 6 | o-ledger-p13pub | old | p13-public-commercial-adoption, 520 | 0 | 38,176 | integrity 0 |
| 7 | c-diag | candidate | p13a, 520 | 0 | 9,018 | 1,172 rows |
| 7 | o-diag | old | p13a, 216 | 0 | 7,856 | 756 rows |
| 8 | c-player-only | candidate | corpus, 52 | 0 | none; test 3,605 ms | player-only.json, .cmp.json |
| 8 | o-player-only | old | corpus, 52 | 0 | none; test 2,290 ms | same |
| 10 | compare.py, check.py, worksheet.py | | | 0, 0, 0 | | compare.json, controls.json, c8/worksheet.* |

Sources: the `S7`, `Tests` and `exit=` lines of each `out/<run>.log`, also copied into s7.meta:32-53. The player-only
and C8 runs print no `S7` line, so their times are Vitest's. Every natural-route run also wrote `final-state.json`.

## 2. Anchors

Every anchor reads EQUAL ([compare.json](1344-stage/s7/out/compare.json) `anchors`; s7.meta:58-61).

- **Natural chain, old against 1329:** EQUAL, 9,860 bytes. The old tree's `natural-chain.jsonl` equals
  `1329-c8/natural-chain-head-133aca7a.jsonl` byte for byte.
- **Rival economy, first 31 lines:** EQUAL, 16,844 bytes, against `1329-c8/rival-economy-head-133aca7a.jsonl`.
- **Decide-diag, old against 1329 (r01, r02, weeks 103-215):** EQUAL. 1329's file holds 423 rows (r01 219, r02 204),
  the old run holds 423 in that window, with 0 mismatches and 0 extra rows.
- **Decide-diag does not perturb the candidate chain:** EQUAL. c-diag's `stateAtEndSha256` and c-p13a-1's
  `finalStateSha256` are both 4e9c0d75eb7559b702fbfc2d106b68d80ac9d1558a9c4dc11b6cb41505af9dcb.
- **Smoke:** the three route files agree across trees through week 20, and the player-only comparison through week 4
  (s7.meta:38, "four smoke comparisons equal").

The old tree reproduces 1329, so every comparison below between the candidate and 1329 stands on that anchor.

## 3. The measured stalled route (1344-A §7 bullet 1), p13a-core-causal-01, 520 weeks

### 1329 beside the old tree and the candidate

| Measure | 1329 (133aca7a) | old (ff803032) | candidate (469a9547) |
|---|---|---|---|
| Promises at the week-200 and week-520 samples | 26, 26 | 26, 26 | 25, 25 |
| Families at 520 | APPEARANCE_COUNT 24, DIRECTING_COUNT 2 | same | APPEARANCE_COUNT 24, DIRECTING_COUNT 1 |
| Outcomes at 520 | 19 open, 7 BROKEN | 19 open, 7 BROKEN | 21 open, 4 BROKEN |
| `firstRivalOpen` / `firstRivalSatisfied` / `firstShared` | 196 / -1 / -1 | 196 / -1 / -1 | 196 / -1 / -1 |
| `firstTakes` at 140, 200, 300, 520 | 45, 45, 45, 45 | 45, 45, 45, 45 | 45, 48, 53, 53 |
| Industry films at 140, 200, 300, 520 | 53, 53, 53, 53 | 53, 53, 53, 53 | 53, 56, 61, 61 |
| r01 at week 300: cash, films, ready screenplays | -1,409,590; 12; 2 | same | -822,040; 17; 9 (7 shelved) |
| r02 at week 300: cash, films, ready screenplays | -15,522; 14; 2 | same | 2,612,826; 17; 8 (6 shelved) |
| Decide-diag, r01 | 54 packages per screenplay, all unviable; best contribution -180,586 (script-0006) and -115,976 (script-0011), then -393,483 and -309,225 in weeks 208-215 (1329-A :42-43, :50-51) | identical rows in weeks 103-215 | script-0006: 13 rejections by week 93 (best -155,059 at 93), shelved; at its first retry, week 130, best -180,586. script-0011: 13 rejections in weeks 118-130 at -115,976 each, shelved at 130 |

Sources: compare.json `p13a.chain` and `p13a.economyWeek300`; the ready counts include shelved screenplays, whose status
stays `ready` (s7.json `series`: r01 active 2 and shelved 7 at week 300, r02 active 2 and shelved 6). Decide-diag:
`1329-c8/decide-diag-head-133aca7a.jsonl`, `o-diag` and `c-diag` rows. Every package count in all three is 54
(affordable plus unaffordable).

The 1329 probe defect (NOTES.md item 17) is inert here, as F5 item 17 asks the record to show. On all eight 520-week
routes, both trees, the player issues no promise (`issuedPromisesAtEnd` 0) and holds no proposal with promises in any
week (`proposalWeeksWithPromises` 0) (s7.json `player`).

### Per studio (F5 items 1, 2, 5, 6)

| Rival | Cash at 520, old / cand | Films, old / cand | `firstTakes`, old / cand | Shelvings (weeks) | Retries, primary: viable / rejected | Cash-blocked retries (diag) | Cash-blocked ready-loop evaluations (diag) | After the first shelving: greenlight, first take, release |
|---|---:|---|---|---|---|---:|---:|---|
| r01 | -20,748,410 / -20,319,780 | 12 / 17 | 10 / 15 | 7: 93, 130, 133, 178, 185, 222, 225 | 0 / 12 | 2 | 306 | 109, 114, 117 (film:10) |
| r02 | -18,568,562 / -15,659,958 | 14 / 17 | 12 / 15 | 6: 123, 130, 166, 169, 197, 200 | 0 / 7 | 1 | 341 | 145, 150, 153 (film:14) |
| r03 | -21,322,045 / -22,130,410 | 17 / 17 | 15 / 15 | 1: 150 | 0 / 0 | 0 | 106 | none through 519 |
| r04 | -22,811,219 / -22,811,219 | 10 / 10 | 8 / 8 | none | 0 / 0 | 0 | 135 | no shelving |
| r05 | 17,642,436 / 17,642,436 | 0 / 0 | 0 / 0 | none | | | | excluded (F5 item 6) |

Sources: compare.json `p13a.studios` (cash rounded, films, `firstTakes`, shelvings, retries, `afterFirstShelving`);
c-diag `decide-diag-summary.json` `countsByStudio` (`retry:cashBlocked`, `ready:cashBlocked`). The 10-week cash series
is in each run's s7.json `series` and rival-economy.jsonl.

- **Retries (F5 item 1).** The primary measure counts retries that change state. No retry on this route is viable.
  r01's 12 and r02's 7 rejected retries each set `retryWeek` to their week plus 26, as all 248 rejected retries on
  the four seeds do (s7.json `retryRejected`). The decide-diag adds 3 cash-blocked retry attempts as the secondary
  measure: r01 at 250 (script-0011) and 262 (script-0006), r02 at 234 (script-0011). Staffing-blocked retries never
  call the chooser (hollywoodTick.ts:225), so no public export sees them.
- **r05** enters at week 520 with no history. It is listed and excluded from per-studio judgements (F5 item 6).
- The old-tree diag stops at week 216, so the cash-blocked counts have no full old-tree counterpart. In weeks 0-215 the
  old tree records r03 111 and r04 135 cash-blocked evaluations, and none for r01 or r02 (o-diag summary).

**Films again, per shelving (F5 item 2; primary: first take).** The first take at or after each shelving's week
(s7.json `filmsAgain`):

| Rival | Shelving week → first take (film) |
|---|---|
| r01 | 93 → 114 (film:10); 130 and 133 → 154 (film:13); 178 and 185 → 206 (film:17); 222 and 225 → 246 (film:20) |
| r02 | 123 and 130 → 150 (film:14); 166, 169, 197 and 200 → 221 (film:19) |
| r03 | 150 → none |

### What the data shows

On p13a the rivals film again after shelving. Industry first takes rise from 45 at the week-140 sample to 53 at the
week-260 sample, and films from 53 to 61 at the week-270 sample. Both then stay flat through week 520 (c-p13a-1
s7.json `series`). The last rival greenlight is r01's film:22 at week 253, its take at 258 and its release at 261
(s7.json events).

The decide-diag shows the evaluations turning cash-blocked. Every evaluation is cash-blocked from week 262 for r01, 247
for r02, 151 for r03 and 86 for r04, through each studio's last chooser call: week 415 for r01 and r02, week 207 for
r03 and r04 (c-diag; 1344-V-movements.json `p13aDiagByStudio`). A cash-blocked evaluation leaves the rejection count
unchanged (hollywoodTick.ts:267), so those screenplays never shelve. r01 holds script-0021 and script-0023 and r02
holds script-0021 and script-0022 in the active index (c-diag rows from 265 and 247), so the full index blocks
commissions (:301) and retries (:286-287). After the last chooser call the diag records nothing. Staffing-blocked
evaluations never reach the chooser (:225; F5 item 1). Employee counts fall in the weeks when 208-week contracts end
(tuning.ts:36): r03 from 6 to 4 and r04 from 6 to 0 between the week-200 and week-210 samples, and r01 from 10 to 4,
r02 from 6 to 0 and r03 from 4 to 0 between 410 and 420. At week 520 every rival r01-r04 employs nobody, on both
trees (rival-economy.jsonl `emp`).

Rival cash is first below zero at the week-300 sample for r01 (old: 290), 330 for r02 (old: 300), 230 for r03 and 130
for r04 (both trees; s7.json `series`). This section reports a measurement. §7 sets no threshold (F5 item 20).

## 4. 1344-F additions

**Industry films after week 140 (F5 item 3).** HEAD's 53 is 1329's `hollywood.films.length` at 133aca7a on p13a.

| Seed | Films at 520 (primary), cand / old | Films added from week 140, cand / old |
|---|---|---|
| p13a-core-causal-01 | 61 / 53 (1329: 53) | 8 / 0 (1329: 0) |
| seed-b | 115 / 106 | 47 / 38 |
| p13b-s8-bridge-probe-01 | 222 / 222 | 154 / 154 |
| p13-public-commercial-adoption | 132 / 122 | 68 / 58 |

Source: each run's s7.json `industryFilms`. The old tree reproduces 53 and 0 on p13a, the anchor F5 item 3 asks for.
53 belongs to p13a alone; the other seeds compare with their own old runs.

**Shelvings per studio per year (F5 item 4).** Year = floor(week / 52), the rival finance period (hollywood.ts:44).
1344-F Amendment 3 bounds the most in any 52 weeks at four.

| Seed | Rival | Shelvings | Per year (year: count) | Most in any 52 weeks |
|---|---|---:|---|---:|
| p13a | r01 | 7 | 1: 1, 2: 2, 3: 2, 4: 2 | 4 |
| p13a | r02 | 6 | 2: 2, 3: 4 | 4 |
| p13a | r03 | 1 | 2: 1 | 1 |
| seed-b | r01 | 18 | 4: 2, 5: 4, 6: 4, 7: 2, 8: 4, 9: 2 | 4 |
| seed-b | r02 | 16 | 4: 1, 5: 3, 6: 2, 7: 4, 8: 2, 9: 4 | 4 |
| seed-b | r03 | 12 | 4: 2, 5: 2, 6: 2, 7: 4, 8: 2 | 4 |
| seed-b | r04 | 14 | 3: 2, 4: 2, 5: 3, 6: 3, 7: 4 | 4 |
| p13b | r04 | 6 | 8: 3, 9: 3 | 4 |
| p13pub | r01 | 6 | 8: 4, 9: 2 | 4 |
| p13pub | r02 | 4 | 7: 2, 8: 2 | 3 |
| p13pub | r03 | 4 | 3: 2, 4: 2 | 4 |
| p13pub | r04 | 8 | 2: 4, 3: 2, 4: 2 | 4 |

Rivals not listed never shelve. Source: compare.json `p13a.studios.candidate` and `seeds.<seed>.candidateStudios`.
No studio exceeds four in any 52-week window. Ten of the twelve shelving studios reach four.

## 5. Natural-route movements from week 93 (1344-F3; F5 item 18)

### The basis, per seed

| Seed | First shelving | First different tick | Equal to week + 1 | Rival accounts at that tick | Movements before the first shelving | Movements | Promise movements |
|---|---|---:|---|---|---:|---:|---:|
| p13a-core-causal-01 | r01 script-0006 at 93 | 94 | yes | r01-r04 EQUAL | 0 | 56 | 50 |
| seed-b | r04 script-0019 at 195 | 196 | yes | r01-r04 EQUAL | 0 | 108 | 27 |
| p13b-s8-bridge-probe-01 | r04 script-0044 at 428 | 429 | yes | r01-r04 EQUAL | 0 | 6 | 0 |
| p13-public-commercial-adoption | r04 script-0011 at 118 | 119 | yes | r01-r04 EQUAL | 0 | 61 | 77 |

Source: compare.json `seeds.<seed>.divergence`. F3 expects r01 script-0006 at week 93 and the first difference at
tick 94 on p13a, and the run shows exactly that. The states are equal up to the first shelving, and the only source
difference is the shelving law (F5 item 15), so every movement follows from that law. The rules below name its path.

### How each row is attributed

[1344-V-attribute.py](1344-V-attribute.py) reads compare.json, the c-diag and o-diag rows, each run's s7.json and
natural-chain.jsonl, and writes [1344-V-movements.json](1344-V-movements.json), one row per movement and per promise
movement. The law is hollywoodTick.ts at 469a9547:
- :277 a shelved ordinal leaves `activeScriptOrdinals`, which frees its slot;
- :280 sets `commissionHoldUntilWeek` to the week plus 13, and :302 allows no commission before it;
- :301 allows no commission while two screenplays hold the index or cash is below the reserve;
- :286-299 is the retry path: only with no production and a free slot; a viable retry re-enters the index and
  greenlights (:292-295); a rejection advances `retryWeek` by 26 (:296-297).

Each film or commission row names the studio's latest shelving at or before its week, from
`sameStudioLawEventsAtOrBefore`. compare.py keeps only the last three law events (compare.py:189). Where those three
hold no shelving (41 seed-b rows), the script takes the same studio's shelvings from s7.json and says so in the row.
The row's mechanism comes from the law:

| Mechanism | Rule | p13a | seed-b | p13b | p13pub |
|---|---|---:|---:|---:|---:|
| Slot freed, hold over | commission added at or after the latest shelving's week + 13 | 24 | 67 | 6 | 31 |
| Hold blocks | commission removed inside the latest shelving's 13-week hold | 2 | 0 | 0 | 0 |
| Commissioned earlier | commission removed because the candidate commissioned the same screenplay earlier | 0 | 2 | 0 | 0 |
| Film of a moved commission | greenlight, take or release of a screenplay whose commission week differs between trees | 30 | 27 | 0 | 30 |
| Own screenplay shelved | film removed because the candidate shelved its own screenplay | 0 | 6 | 0 | 0 |
| Viable retry | film added through a viable retry of its shelved screenplay | 0 | 6 | 0 | 0 |
| Flagged | no rule explains the row | 0 | 0 | 0 | 0 |

The script checks the hold on every added commission. None falls inside a hold. 51 of the 128 added commissions fall
in the exact week the hold ends: p13a 8 of 24, seed-b 29 of 67, p13b 3 of 6, p13pub 11 of 31.

### p13a-core-causal-01: every movement, with the candidate decide-diag

"Law event" is the latest same-studio shelving at or before the week. "Diag" gives the c-diag rows for that studio
in that week: screenplay, outcome, best contribution. When the studio has no row that week, it gives the latest
earlier week's rows. Film rows give the greenlight row of the film's screenplay, and the old tree's (o-diag) where
it falls in weeks 0-215.

| Week | Rival | Kind | Id | Change | Law event | Mechanism | Diag |
|---:|---|---|---|---|---|---|---|
| 93 | r01 | commission | script-0010 | removed | script-0006 at 93 | hold blocks | w93: script-0006 economicRejection -155,059 |
| 96 | r01 | greenlight | film:10 | removed | script-0006 at 93 | film of a moved commission | cand greenlight w109: script-0010 viable 45,708; old greenlight w96: script-0010 viable 45,708 |
| 101 | r01 | first take | film:10 | removed | script-0006 at 93 | film of a moved commission | as w96 |
| 104 | r01 | release | film:10 | removed | script-0006 at 93 | film of a moved commission | as w96 |
| 105 | r01 | commission | script-0011 | removed | script-0006 at 93 | hold blocks | none at w105; w93: script-0006 economicRejection -155,059 |
| 106 | r01 | commission | script-0010 | added | script-0006 at 93 | slot freed, hold over (first week allowed) | none at w106; w93 as above |
| 109 | r01 | greenlight | film:10 | added | script-0006 at 93 | film of a moved commission | w109: script-0010 viable 45,708 |
| 109 | r01 | commission | script-0011 | added | script-0006 at 93 | slot freed, hold over | w109: script-0010 viable 45,708 |
| 114 | r01 | first take | film:10 | added | script-0006 at 93 | film of a moved commission | greenlight w109 |
| 117 | r01 | release | film:10 | added | script-0006 at 93 | film of a moved commission | greenlight w109 |
| 118 | r01 | commission | script-0012 | added | script-0006 at 93 | slot freed, hold over | w118: script-0011 economicRejection -115,976 |
| 143 | r02 | commission | script-0014 | added | script-0013 at 130 | slot freed, hold over (first week allowed) | none at w143; w130: script-0013 economicRejection -39,019 |
| 145 | r02 | greenlight | film:14 | added | script-0013 at 130 | film of a moved commission | w145: script-0014 viable 765,544 |
| 145 | r02 | commission | script-0015 | added | script-0013 at 130 | slot freed, hold over | w145: script-0014 viable 765,544 |
| 146 | r01 | commission | script-0013 | added | script-0012 at 133 | slot freed, hold over (first week allowed) | none at w146; w133: script-0012 economicRejection -12,296 |
| 149 | r01 | greenlight | film:13 | added | script-0012 at 133 | film of a moved commission | w149: script-0013 viable 233,959 |
| 149 | r01 | commission | script-0014 | added | script-0012 at 133 | slot freed, hold over | w149: script-0013 viable 233,959 |
| 150 | r02 | first take | film:14 | added | script-0013 at 130 | film of a moved commission | greenlight w145 |
| 153 | r02 | release | film:14 | added | script-0013 at 130 | film of a moved commission | greenlight w145 |
| 154 | r01 | first take | film:13 | added | script-0012 at 133 | film of a moved commission | greenlight w149 |
| 154 | r02 | commission | script-0016 | added | script-0013 at 130 | slot freed, hold over | w154: script-0015 economicRejection -142,255; script-0011 retry economicRejection -152,465 |
| 157 | r01 | release | film:13 | added | script-0012 at 133 | film of a moved commission | greenlight w149 |
| 158 | r01 | commission | script-0015 | added | script-0012 at 133 | slot freed, hold over | w158: script-0014 economicRejection -32,582; script-0006 retry economicRejection -169,358 |
| 161 | r01 | greenlight | film:15 | added | script-0012 at 133 | film of a moved commission | w161: script-0015 viable 656,681 |
| 163 | r03 | commission | script-0017 | added | script-0015 at 150 | slot freed, hold over (first week allowed) | w163: script-0016 cashBlocked -128,959 |
| 166 | r01 | first take | film:15 | added | script-0012 at 133 | film of a moved commission | greenlight w161 |
| 169 | r01 | release | film:15 | added | script-0012 at 133 | film of a moved commission | greenlight w161 |
| 170 | r01 | commission | script-0016 | added | script-0012 at 133 | slot freed, hold over | w170: script-0014 economicRejection -92,744; script-0011 retry economicRejection -169,994 |
| 182 | r02 | commission | script-0017 | added | script-0016 at 169 | slot freed, hold over (first week allowed) | none at w182; w180: script-0011 retry economicRejection -152,465 |
| 185 | r02 | commission | script-0018 | added | script-0016 at 169 | slot freed, hold over | w185: script-0017 economicRejection -102,104 |
| 198 | r01 | commission | script-0017 | added | script-0016 at 185 | slot freed, hold over (first week allowed) | none at w198; w196: script-0011 retry economicRejection -169,994 |
| 201 | r01 | greenlight | film:17 | added | script-0016 at 185 | film of a moved commission | w201: script-0017 viable 220,099 |
| 201 | r01 | commission | script-0018 | added | script-0016 at 185 | slot freed, hold over | w201: script-0017 viable 220,099 |
| 206 | r01 | first take | film:17 | added | script-0016 at 185 | film of a moved commission | greenlight w201 |
| 209 | r01 | release | film:17 | added | script-0016 at 185 | film of a moved commission | greenlight w201 |
| 210 | r01 | commission | script-0019 | added | script-0016 at 185 | slot freed, hold over | w210: script-0018 economicRejection -539,080; script-0006 retry economicRejection -509,415 |
| 213 | r02 | commission | script-0019 | added | script-0018 at 200 | slot freed, hold over (first week allowed) | none at w213; w206: script-0011 retry economicRejection -152,465 |
| 216 | r02 | greenlight | film:19 | added | script-0018 at 200 | film of a moved commission | w216: script-0019 viable 965,015 |
| 216 | r02 | commission | script-0020 | added | script-0018 at 200 | slot freed, hold over | w216: script-0019 viable 965,015 |
| 221 | r02 | first take | film:19 | added | script-0018 at 200 | film of a moved commission | greenlight w216 |
| 224 | r02 | release | film:19 | added | script-0018 at 200 | film of a moved commission | greenlight w216 |
| 225 | r02 | greenlight | film:20 | added | script-0018 at 200 | film of a moved commission | w225: script-0020 viable 707,575 |
| 226 | r02 | commission | script-0021 | added | script-0018 at 200 | slot freed, hold over | none at w226; w225: script-0020 viable 707,575 |
| 230 | r02 | first take | film:20 | added | script-0018 at 200 | film of a moved commission | greenlight w225 |
| 233 | r02 | release | film:20 | added | script-0018 at 200 | film of a moved commission | greenlight w225 |
| 234 | r02 | commission | script-0022 | added | script-0018 at 200 | slot freed, hold over | w234: script-0021 cashBlocked -248,420; script-0011 retry cashBlocked -320,822 |
| 238 | r01 | commission | script-0020 | added | script-0019 at 225 | slot freed, hold over (first week allowed) | none at w238; w236: script-0006 retry economicRejection -509,415 |
| 241 | r01 | greenlight | film:20 | added | script-0019 at 225 | film of a moved commission | w241: script-0020 viable 32,389 |
| 241 | r01 | commission | script-0021 | added | script-0019 at 225 | slot freed, hold over | w241: script-0020 viable 32,389 |
| 246 | r01 | first take | film:20 | added | script-0019 at 225 | film of a moved commission | greenlight w241 |
| 249 | r01 | release | film:20 | added | script-0019 at 225 | film of a moved commission | greenlight w241 |
| 250 | r01 | commission | script-0022 | added | script-0019 at 225 | slot freed, hold over | w250: script-0021 cashBlocked -233,639; script-0011 retry cashBlocked -542,794 |
| 253 | r01 | greenlight | film:22 | added | script-0019 at 225 | film of a moved commission | w253: script-0022 viable 276,588 |
| 258 | r01 | first take | film:22 | added | script-0019 at 225 | film of a moved commission | greenlight w253 |
| 261 | r01 | release | film:22 | added | script-0019 at 225 | film of a moved commission | greenlight w253 |
| 262 | r01 | commission | script-0023 | added | script-0019 at 225 | slot freed, hold over | w262: script-0021 cashBlocked -304,871; script-0006 retry cashBlocked -653,372 |

The only p13a film that exists in both trees and moved is film:10. Its screenplay's commission moved from week 93 to
106 under the hold of the week-93 shelving, and its greenlight from 96 to 109, with the same best contribution
(45,708) in both trees. The other 24 film rows belong to the 8 films only the candidate makes: r01's film:13, 15, 17,
20 and 22, and r02's film:14, 19 and 20.

### The other seeds

The full rows are in 1344-V-movements.json. Rows outside the two common mechanisms:

- **seed-b, r04 film:21.** The old tree greenlit script-0021 at 210 (take 215, release 218). The candidate shelved it at
  202 and greenlit it at 231 through a viable retry (take 236, release 239). That gives six rows: three removed, own
  screenplay shelved; three added, viable retry.
- **seed-b, r01 film:24.** The old tree greenlit script-0024 at 416 (take 421, release 424). The candidate shelved it at
  226 and never greenlit it: three rows removed, own screenplay shelved.
- **seed-b, r01 film:35.** The candidate commissioned script-0035 at 378, shelved it at 399 and greenlit it at 440
  through a viable retry (take 445, release 448): three rows added. The old tree never commissioned it.
- **seed-b, commissions moved earlier.** r04's script-0022 at 215 in the candidate against 219 in the old tree (the hold
  of the week-202 shelving ends at 215), and r01's script-0025 at 239 against 425.
- **p13b-s8-bridge-probe-01.** Six r04 commissions (weeks 450, 453, 481, 484, 512, 515) follow its shelvings from week
  428. No film moves, and industry films stay 222 in both trees.

### Promise movements: all 154 flagged

The rule reads each promise movement through its issuer's film movements inside the window [start, due). That rule
explains a changed outcome of one promise that is bound in both trees. No promise movement on any seed has that
shape. 1344-V-movements.json gives each row's contract flags in both trees (from natural-chain.jsonl
`promiseDetail`), its counterpart in the other tree, and the issuer's film movements in its window.

| Seed | Rows | Present in one tree only | Bound in one tree only | Promises authored, cand / old | Bound, cand / old | SATISFIED, cand / old | BROKEN, cand / old |
|---|---:|---:|---:|---|---|---|---|
| p13a | 50 | 49 | 1 | 25 / 26 | 4 / 7 | 0 / 0 | 4 / 7 |
| seed-b | 27 | 27 | 0 | 75 / 98 | 12 / 24 | 6 / 8 | 6 / 6 |
| p13b | 0 | | | 102 / 102 | 26 / 26 | 15 / 15 | 5 / 5 |
| p13pub | 77 | 76 | 1 | 28 / 100 | 8 / 23 | 6 / 4 | 2 / 7 |

Sources: compare.json `promiseMovements`; the summary line of each natural-chain.jsonl.

- **p13a.** The issuers shift. On the old tree r02 issues 23 promises, r01 2 and r03 1. On the candidate r03 issues
  23 and r02 2. The one binding row is r02's APPEARANCE_COUNT promise to `person-studio-aca408ec-r01-0`: bound and
  BROKEN at 416 on the old tree, unbound and open on the candidate. X10's ledger probe records the matching
  settlement: at week 208 (talent-market-event-96) that person signs with r02 on 1338's source and with r03 on the
  candidate source, "their compensation band ranked above the others"
  (`1344-stage/s10/out/ledger.p13a-core-causal-01.predicates.json`, `P1_d1_d2_C2_first_moved_row_after_Ws`).
- **seed-b.** The 416 cohort shrinks from 46 promises (11 bound) to 23 (none bound). Two old-tree outcomes fall in the
  week of a removed take: r04's DIRECTING_COUNT promise to `person-studio-bc14baf6-r01-1`, SATISFIED at 215 by film:21's
  old take, and r01's DIRECTING_COUNT promise to the same person, SATISFIED at 421 by film:24's old take. On the
  candidate the first promise does not exist. That person declines at week 208, "could not separate 2 equally ranked
  proposals" (X10 seed-b ledger, talent-market-event-121). On the old tree that promise is the only rival outcome at
  215, and the six SATISFIED at 216 exist in both trees, so `firstRivalSatisfied` moves from 215 to 216.
- **p13pub.** The candidate authors 28 promises against 100: the 208 cohort falls from 48 to 25, the 416 cohort from 48
  to 3, and the 473 cohort from 4 to 0. Its binding row is r01's DIRECTING_COUNT promise to
  `person-studio-5a47d054-r01-1` for [208, 416): bound and SATISFIED at 216 on the candidate, unbound on the old tree.
  One candidate-only promise, r01's DIRECTING_COUNT for [416, 624), is SATISFIED at 476, the week of the added take of
  r01's film:48.

The outputs do not show why a promise's authoring or binding moved. The charter names the law paths that can move
them: shelved screenplays leave promise feasibility (`unproducedScripts`) and rival promise authoring (1344-A §3.6).
Case outcomes also read each studio's standing and offers, which the shelving moves. These are leads. The rows stay
flagged for the parent.

## 6. Controls

Every control reads PASS ([out/controls.json](1344-stage/s7/out/controls.json); s7.meta:68-71).

- **(a) Test 3's HEAD-equality run (F5 item 8): PASS.** `controls/a-test3.sh` ran `tests/p14d1-rival-shelving.test.ts
  -t "shelving-viable-control"` in the candidate tree: `exit=0`, "2 passed | 26 skipped (28)"
  ([control-a.log](1344-stage/s7/out/control-a.log)). The first leaf compares the genesis-to-week-93 state, with
  `screenplayShelving` deleted from every business, against the genuine e62c944f week-93 mint migrated by
  convertV42ToV43, as key-sorted JSON, with identical receipts (3,209 ms). The second leaf keeps the empty shelving
  state on a business with greenlights and no economic rejection in 5 weeks (483 ms). The per-tick supplement against
  ff803032 shows the first difference at the first shelving's week plus one on all four seeds (section 5).
- **(b) Player-only saves (F5 item 9): PASS.**
  - (i) The Oracle and Random corpus routes, 52 weeks each, keep `hollywood` null every week in both trees
    (`hollywoodNullEveryWeek` true). Their `player-only.cmp.json` files are byte-identical across trees
    (`playerOnlyWorldsByteIdenticalAcrossTrees` true). On the candidate each live export is Save43
    (`liveSaveVersion` 43) and differs from its V42 export only in the version stamp
    (`liveDiffersFromV42OnlyInVersionStamp` true).
    The candidate's V42 export hashes equal the old tree's live export hashes: 178979983ef0… (Oracle) and
    5761f1e560ad… (Random).
  - (ii) On all four candidate routes, 520 weeks each, no shelving receipt names the player
    (`playerInRivalWorlds.*.shelvingReceipts` 0) and the player's development has no shelving key
    (`developmentHasShelvingKey` false).
- **(c) No refund or ledger movement at shelving (F5 item 10): PASS.** `shelvingsChecked` 102 (14 + 60 + 6 + 22),
  `failing` empty.
  - Every rival account is EQUAL across trees at each seed's first different tick (94, 196, 429 and 119), and each
    of those ticks is the first shelving's (`firstShelvingExact`: `isFirstShelvingTick` true, `accounts` all EQUAL).
  - At all 102 shelvings every one of the nine derived checks holds, and `makeSave` passes. The deltas in a shelving
    week are payroll, overhead and facility opex in all 102, studio revenue in 3 (positive) and research spend in 1.
    No shelving week has a same-week greenlight, so the production and marketing deltas are zero
    (s7.json `controlC`). No positive movement other than studio revenue appears, so nothing awaits the parent's
    attribution.
- **(d) Determinism across two runs (F5 item 11): PASS.** c-p13a-1 and c-p13a-2 ran as separate Vitest processes. Their
  five files compare byte for byte with no difference (`differ` empty): natural-chain.jsonl, rival-economy.jsonl,
  weekly.jsonl, s7.json and the key-sorted final-state.json (fe78e4ab… for both in final-state-sha256.txt). Their
  `S7` lines carry the same `finalStateSha256`.

## 7. The 42 C8 rows, the C1 row and the 7 UNRESOLVED rows

The filled worksheet is [1344-V-c8-worksheet.md](1344-V-c8-worksheet.md). Its inputs are
[out/c8/worksheet.md](1344-stage/s7/out/c8/worksheet.md), [run.txt](1344-stage/s7/out/c8/run.txt) and
[failures.json](1344-stage/s7/out/c8/failures.json).

- **Counts.** All 50 rows FAILED on the candidate, and none passes. The run exited 1, as the RUNBOOK expects: 56
  failed, 64 passed and 1 todo across the six files.
- **Primaries.** 46 rows keep 1338's primary. Four changed, rows 6, 7, 9 and 36, which are S10 rows 4, 2, 3 and 1.
  Each changed primary equals X10's candidate-source anchor, and each 1338 primary equals X10's old-source anchor.
  All 50 candidate primaries and frames equal the sweep's recorded core gate at 469a9547
  (1344-I3-core-failures.json), which ran under Node v22.23.2. The six other failures in these files (C16 x5,
  inherited x1) keep their 1338 primaries.
- **Attribution (F5 items 12-14).**
  - Attributed through X10 (item 13): rows 6, 7, 9, 36.
  - Retained cause (item 14, clause 2): row 8, family 12 on `p13b-s8-bridge-probe-01`. Its chain is equal through tick
    428 and its leaf reads through 416. The primary is unchanged; its frame moved from :530 to :540 only because the
    sweep added 10 lines at :67-76 of the test file. Shelving cannot reach this row, so 1338's UNRESOLVED cause stands.
  - Open with measured cause (item 14, clause 3): 45 rows, the 42 C8 rows, C1 row 2, and UNRESOLVED rows 35 and 41.
    Each chain moves inside the leaf's bound and the primary does not.
    - The 21 p13a natural searches still lack their premise. No rival promise is SATISFIED in 520 weeks
      (`firstRivalSatisfied` -1, `firstShared` -1). The four bound promises are all r03's and BREAK at 416, while
      r03 has no take after week 134.
    - Row 50 fails because r01 holds no promise on the candidate.
    - Rows 35 and 41 receive the same values as at 1338. The full diffs are identical: run.txt:977-1027 against
      1338-t1-broad-core.txt:4454-4504, and run.txt:1095-1107 against 4572-4584.
    - The 21 seed-b C8 rows fail on their decision-level premise, which the kit does not measure.
- No test was changed and no hiring was forced. Step 2 ran the landed tests in the pristine tree before any probe
  entered it, and the probes tick naturally.

## 8. Recorded gates

§7 runs no gate of its own and adopts the sweep's recorded core and UI gates (F5 item 19):
[1344-M3](1344-M3-save43-sweep-recorded-gates.md), both at 469a9547, the candidate measured here.

- **Core.** 85 failed: 1338's 79 retained identities minus the exporter row, plus the seven declared exceptions of
  1344-F6. Against 1338: SAME 73, CHANGED 5 (the four S10 rows and the C20 version-literal row), NEW 7 (the declared
  exceptions), GONE 1 (the exporter row).
- **UI.** 3 failed, the numpy rows. Against 1343: CHANGED 3, GONE 7 (the Pillow rows), NEW 0.
- **The C8 re-run against the gate.** This record's C8 re-run, under Node v20.20.2, reproduces the core gate's
  primaries and frames for all 56 failures in its six files.
- **Review: REFINE, then CONFIRMED.** [1344-J3](1344-J3-save43-sweep-gates-attribution-review.md) returned REFINE
  with two text defects and no wrong number. M3 r2 applies it, [1344-J4](1344-J4-m3-revision-confirmation.md)
  CONFIRMED r2, and M3 r3 applies J4's wording residuals with no count changed.

## 9. Flags to the Owner

These are measured behaviour with no threshold (F5 item 20). None is a failure.

1. **Retries that never succeed.** Viable retries: p13a 0 of 19 state-changing retries, with 3 more cash-blocked
   attempts (section 3); seed-b 2 of 199 (r04 script-0021 at 231, r01 script-0035 at 440); p13b 0 of 6; p13pub 0 of
   26 (compare.json `retriesViable` and `retriesEconomicRejection`). Every rejected retry sets `retryWeek` 26 weeks
   out. On p13a, r01 and r02 hold two screenplays in their index from their last commissions (weeks 262 and 234)
   through 520, so their due retries are never attempted (:286-287). No greenlight, shelving or retry follows those
   commissions (s7.json events), and the `series` samples read `active` 2 from week 270 to 520. Their last retry
   attempts fall at weeks 262 and 234 (c-diag). r03's one shelved screenplay, script-0015 (`retryWeek` 176), is never
   retried: from week 166 its index holds script-0016 and script-0017 (c-diag).
2. **Shelved lists that only grow.** Screenplays shelved at week 520: p13a 14 (r01 7, r02 6, r03 1); seed-b 58 (r01 17,
   r02 16, r03 12, r04 13); p13b 6 (r04); p13pub 22 (r01 6, r02 4, r03 4, r04 8) (`shelvedAtEnd`). Only seed-b's two
   viable retries ever remove an entry; v1 has no pruning (1344-E finding 4).
3. **Rival cash below zero (P15B scope).** At week 520 (compare.json `endCash`, candidate / old):
   - p13a: all four, r01 -20,319,780 / -20,748,410, r02 -15,659,958 / -18,568,562, r03 -22,130,410 / -21,322,045,
     r04 -22,811,219 / -22,811,219;
   - seed-b: r03 -1,661,052 / -1,730,488 and r04 -4,017,621 / -6,750,384;
   - p13pub: r02 -3,634,714 / -2,820,651, r03 -19,156,692 / -20,540,936 and r04 -11,146,364 / -12,348,302;
   - p13b: none.
4. **The post-300 stall on p13a.** Films and first takes rise after shelving, then stay flat: 61 films and 53 first
   takes from the week-270 sample through 520, with the last take at week 258. From weeks 262 (r01), 247 (r02), 151
   (r03) and 86 (r04), every evaluation the diag sees is cash-blocked. Cash-blocked evaluations never count toward
   shelving (hollywoodTick.ts:267). r01, r02 and r03 each hold two screenplays in the index from their last
   commissions (weeks 262, 234 and 163) through 520, which blocks commissions and retries (:286-287, :301). Both of
   those screenplays are ready, and every evaluation of them is cash-blocked, from week 265 for r01, 247 for r02 and
   166 for r03 (c-diag). r04 holds one, and its cash,
   below zero from the week-130 sample, stays under the reserve that :301 requires. After weeks 415 (r01, r02) and 207
   (r03, r04) no evaluation reaches the chooser, and by week 520 no rival employs anyone, on both trees (section 3).
5. **Seed `p15a1-w2-market-01` (1355-X2, "For P14's §7"; source 1355-C4).** Measured in 1355-C4's probe B, run 1, on
   the P15A.1 Wave 2 reference source (ref3's `src`). Through week 159 the four rivals greenlight nothing, with or
   without the player's slate. With r4's slate or with none, they shelve 28 screenplays from week 15 on the
   economic-rejection path. Under r3's slate they shelve none, because that slate holds their staff. r04's cash
   reaches -4,575,084 at week 160 (1355-C4:137-155, :209-219). Which forecast input sinks every package is
   UNVERIFIED. 1355-C4's lead is the seed's base market value: 23,554,590, against 42,486,846 on `-02` and
   64,574,534 on `-03`. The §7 kit did not run this seed. The Owner decides whether it is in scope.

6. **Promise movements (section 5).** 154 promise rows move: 50 on p13a, 27 on seed-b, 77 on p13pub and none on p13b.
   Each changes whether a promise exists or binds. Rival promise authoring falls on two seeds: p13pub authors 28
   against 100, and seed-b 75 against 98. The shelving law causes these movements (section 10, ruling 2), but no
   output names the path. Section 5 gives the leads. The strongest is X10's settlement receipts at week 208.

Every NOTES.md item has a parent ruling (F5 Part B, items 1-20); none stays open.

## 10. Parent verification and rulings

**Checked against the outputs.** On 2026-10-01 the parent read the committed outputs under
[1344-stage/s7/out/](1344-stage/s7/out/):
- compare.json:
  - the four anchors are EQUAL;
  - per seed: the first shelving (weeks 93, 195, 428, 118); the first different tick (94, 196, 429, 119), with every
    rival account EQUAL there; no movement before the first shelving;
  - 56, 108, 6 and 61 movements, and 50, 27, 0 and 77 promise movements.
- compare.json `p13a.studios` and `endCash`: section 3's per-studio table and flag 3.
- Each run's s7.json `industryFilms`: section 4's first table.
- controls.json: (a)-(d) PASS, with 102 shelvings checked.
- c8/run.txt: 56 failed, 64 passed and 1 todo (121).
- 1344-V-attribute.py, run again from the repository: it writes a movements file byte-identical to
  [1344-V-movements.json](1344-V-movements.json) (sha256 1f552c6b…).
  - The 56 rows of section 5's p13a table equal its p13a rows on week, rival, kind, id, change, law event and
    mechanism.
  - Its mechanism counts equal section 5's table.

**Rulings.**
1. **The candidate (F5 item 15).**
   - §7 ran from 21:39:19 to 21:51:30 CDT on 469a9547, whose `src` tree db80ca31 is the sweep's landed source.
   - Slice A's production commits carry 22:16:12 CDT, after the run ended (`git log 469a9547..b0809602`).
   - Item 15 stops §7 only if behaviour-changing production lands first, and none did.
   - This record describes the shelving landing, and 1344-K closes on it.
   - Whether slice A moves a natural route lies outside §7. The parent measures it for slice A's closure
     ([1348-L](1348-L-rel-sliceA-landing.md)), beside its broad gates: the four 520-week natural routes at HEAD,
     against this record's final-state hashes.
2. **The 154 promise movements: cause established, path unnamed.**
   - The shelving law causes them. On every seed the trees hold equal states until the first shelving, the sources
     differ only by that law (item 15), and the runs are deterministic (control d).
   - The outputs do not name the path from a shelving to a promise's existence or binding.
   - The rows go to the Owner as flag 6, with section 5's leads.
3. **Row 8** stays open with 1338's UNRESOLVED cause (F5 item 14, clause 2), because shelving cannot reach it on its
   seed.
4. **r05 on seed-b** stays excluded (F5 item 6).
   - It enters at 520 with 17,454,843 on the candidate against 17,554,252 on the old tree, a difference of 99,409.
   - Its cash matches across trees on the other three seeds.
   - The record keeps the difference as a measurement.
5. **Run time.** The RUNBOOK expected c-diag to be the longest run. It took 9,018 ms, against 24,742-46,503 ms for the
   520-week natural routes. The estimate was not a check, so this changes nothing.
6. **Cleanup.** The parent ran RUNBOOK step 12 after these checks.
   - It removed the five links from each tree, then `tree/` and `old-tree/`.
   - The outputs stay under 1344-stage/s7/out/.
   - The `final-state.json` files stay in scratch, with their hashes in final-state-sha256.txt.
