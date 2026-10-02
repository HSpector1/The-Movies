# 1344-V worksheet: the 42 C8 rows, the C1 row and the 7 UNRESOLVED rows on 469a9547

Draft for the parent's verification. It fills the attribution and cause columns that
[c8/worksheet.py](1344-stage/s7/c8/worksheet.py) left as "TO FILL" in
[out/c8/worksheet.md](1344-stage/s7/out/c8/worksheet.md).

## Sources

- The C8 re-run: [run.txt](1344-stage/s7/out/c8/run.txt), [run.json](1344-stage/s7/out/c8/run.json) and
  [failures.json](1344-stage/s7/out/c8/failures.json), from RUNBOOK step 2 in the pristine candidate tree.
- The generated worksheet: [worksheet.json](1344-stage/s7/out/c8/worksheet.json) (rows, 1338 primaries, evidence).
- The chains: [compare.json](1344-stage/s7/out/compare.json) `seeds.<seed>.divergence`, the four candidate and four
  old `natural-chain.jsonl` summaries, and [1344-V-movements.json](1344-V-movements.json).
- The 1338 record: [1338-I-failures.json](1338-I-failures.json) and the raw
  [1338-t1-broad-core.txt](1338-t1-broad-core.txt).
- The sweep's recorded core gate at 469a9547: [1344-I3-core-failures.json](1344-I3-core-failures.json).
- The S10 probes: [1344-X10](1344-X10-s10-probe-results.md) and [1344-stage/s10/out/](1344-stage/s10/out/).

## Rules applied

- **F5 item 12.** The 42 rows of 1338-I's C8 cluster are re-run. Row 2, `bridge-p14b2-trust:363`, which 1338-I files
  under C1, is carried as a separate natural-route row and is not counted in the 42.
- **F5 item 13.** §7 adopts X10's attribution for S10 rows 1-4, which are worksheet rows 36, 7, 9 and 6. It re-runs and
  attributes the other three UNRESOLVED rows: 8, 35 and 41.
- **F5 item 14.** A row is *attributed* when its chain reproduces both recorded values, its state is equal up to the
  first shelving, and its first moved value comes after that shelving and is explained by receipts. A row whose
  chain and primary are both unchanged across sources *keeps its retained cause*. Every other row *stays open with
  its measured cause*.

"The chain is unchanged" means the leaf's search ends before the first tick at which the stripped states differ
(`firstDifferentTick` in compare.json, which equals the first shelving's week plus one on all four seeds).

## Counts

- All 50 rows FAILED on the candidate (worksheet.json `counts`: `{"FAILED": 50}`). None passes, none is skipped.
- 46 rows keep 1338's primary. Four changed: rows 6, 7, 9 and 36, the S10 rows.
- Every one of the 50 candidate primaries and frames equals the sweep's recorded core gate at the same commit
  (1344-I3-core-failures.json), which ran under Node v22.23.2 while this re-run pinned v20.20.2.
- The six other failures in these six files (C16 x5, inherited x1) keep their 1338 primaries and equal the recorded
  gate's (worksheet.json `otherFailuresInTheseFiles`).
- Run totals: 56 failed, 64 passed, 1 todo (121); `exit=1`, the expected exit; Vitest duration 245.85 s
  (run.txt, last lines).

| Attribution (F5 item) | Rows | Count |
|---|---|---:|
| Attributed: X10 adopted (item 13) | 6, 7, 9, 36 | 4 |
| Retained cause: chain and primary unchanged (item 14, clause 2) | 8 | 1 |
| Open, measured cause (item 14, clause 3) | 1-5, 10-35, 37-50 | 45 |

The 45 open rows are the 42 C8 rows, the C1 row 2, and UNRESOLVED rows 35 and 41.

## Measured causes

- **K1. The p13a natural-search premise (rows 1-5, 10-25).** On the candidate no rival promise is SATISFIED in 520
  weeks: `firstRivalSatisfied` -1 and `firstShared` -1 (c-p13a-1 natural-chain summary; the old tree and 1329 read
  the same). The candidate authors 25 promises, all with window [208, 416). Four are bound, all four are r03's, and all
  four BREAK at 416 with "the window closed before the promised pictures began filming" (c-p13a-1 natural-chain
  `promiseDetail`). r03's last take is week 134 and its last chooser call week 207 (c-p13a-1 s7.json; c-diag). The
  studios that film inside [208, 416) hold no bound promise: r01 (takes at 246 and 258) holds none, and r02 (takes at
  221 and 230) holds two unbound ones. The chain differs from tick 94, inside both bounds (230 and 240), and the
  primary does not move. On the old tree the same shape holds with other studios: the 7 bound promises are r02's and
  r01's, and neither films after week 111.
- **K2. The p13a seam witness (row 50).** No picture through tick 350 seats a promised person. r01, the leaf's studio,
  issues no promise on the candidate; the only bound promises are r03's, and r03 makes no picture after week 134.
- **K3. Row 35, p13a decisions with members.** The leaf expects two r01 decisions at week 208 that admit
  `person-studio-aca408ec-r02-0` (promise-12) and receives `[]` on both sources. The full diff is identical in
  1338-t1-broad-core.txt:4454-4504 and c8/run.txt:977-1027. On the old tree r01's only bound promise is a
  DIRECTING_COUNT promise to its director r01-1; on the candidate r01 issues no promise. The expected member, r02-0,
  holds no r01 promise in either tree (natural-chain summaries).
- **K4. Row 41, seed-b w202 offers.** The first w202 decision the leaf finds is r02's on both sources, and the leaf
  expects r01's.
  The diff is identical in 1338-t1-broad-core.txt:4572-4584 and c8/run.txt:1095-1107. The chain differs from tick
  196, before w202, and this value does not move.
- **K5. The seed-b premise (rows 26-34, 37-40, 42-49).** The candidate fails with 1338's primary: the natural
  premise is absent by tick 350. The chain differs from tick 196 (r04 shelves script-0019 at 195), inside the bound.
  The kit does not measure the leaf's decision-level premise. Context from c-seedb natural-chain: rival promises are
  SATISFIED from week 216 and a shared take exists from week 216 (old: 215 and 216), so the missing piece is the
  decision the leaf names. 1329-A :18-20 keeps the pre-shelving disposition (P14C.1 records 770/771); §7 does not
  re-measure it.
- **K6. Row 8, p13b ledger.** The p13b chain is equal on both sources through tick 428; its first shelving is r04
  script-0044 at week 428 and the first difference is tick 429 (compare.json). The leaf reads through 416. The
  primary is unchanged: "expected [ { week: 208, …(11) }, …(42) ] to have a length of 48 but got 43". The frame moved
  from :530:54 to :540:54 only because the sweep inserted 10 lines at :67-76 of the test file
  (`git diff ff803032 469a9547`). The shelving law cannot reach this row inside its bound, so 1338's UNRESOLVED filing
  stands and D-1329-1 does not resolve it.
- **X10 rows (6, 7, 9, 36).** X10 reports every gate true for S10 rows 1-4. The §7 re-run reproduces X10's
  candidate values, and 1338's primaries equal X10's old-source anchors:
  - row 6: candidate digest `8a4df62fdd64…` equals X10's p13a head settlement; 1338's `4a047502216f…` equals its old
    anchor (ledger.p13a-core-causal-01.predicates.json `C1_head_anchor`, `C1_old_anchor`);
  - row 7: the candidate's 41 settled rows (pin 48) equal X10's seed-b head anchor; 1338's single unexpected sentence
    (talent-market-event-297) equals its old anchor (ledger.seed-b.predicates.json);
  - row 9: candidate digest `62c9fd5d2d78…` equals X10's head settlement; 1338's 35 settled rows (pin 36) equal its
    old anchor (ledger.p13-public-commercial-adoption.predicates.json);
  - row 36: candidate digest `d32e68f685f6…` equals X10's head digest; 1338's `9eeb62f640c8…` equals its old anchor
    (row1.predicates.json).
  - X10's first shelving weeks (93, 195, 118) equal the kit's on the same seeds.

## The rows

Short forms: "W93 r01 s0006" is the first shelving (week, studio, screenplay); "T94" is the first different tick;
"premise c/o/1329" lists `firstRivalSatisfied` and `firstShared` on the candidate, the old tree and 1329's record.
Full identities are in [WORKSHEET-TEMPLATE.md](1344-stage/s7/c8/WORKSHEET-TEMPLATE.md).

| # | group | seed, bound | frame 1338 → candidate | leaf | primary | evidence | attribution | cause |
|---:|---|---|---|---|---|---|---|---|
| 1 | C8 rivalFixture | p13a, 240 | trust:253:15 | does not publish another studio's real bound history … | same: no natural rival-only promise outcome by 240 | W93 r01 s0006; T94 inside bound; premise c/o/1329: -1/-1/-1, -1/-1/-1 | open (14c) | K1 |
| 2 | C1, rivalFixture primary | p13a, 240 | trust:363:19 | ignores real withdrawn unbound drafts near due … | same | as row 1 | open (14c); outside the 42 (item 12) | K1 |
| 3 | C8 rivalFixture | p13a, 240 | trust:386:15 | keeps open rival proposal terms literal UNKNOWN … | same | as row 1 | open (14c) | K1 |
| 4 | C8 rivalFixture | p13a, 240 | trust:398:15 | publishes the real rival kept outcome … | same | as row 1 | open (14c) | K1 |
| 5 | C8 rivalFixture | p13a, 240 | trust:412:15 | is semantically unchanged when only hidden terminal terms vary … | same | as row 1 | open (14c) | K1 |
| 6 | UNRESOLVED ledger (S10 row 4) | p13a, 416 | relationships:550:37 → :560:37 | p13a-core-causal-01: chain digests, row counts … | changed: digest `4a047502…` → `8a4df62f…`, both against `706e54c6…` | W93 r01 s0006; T94 | attributed (item 13, X10 row 4) | X10 |
| 7 | UNRESOLVED ledger (S10 row 2) | seed-b, 416 | relationships:547:36 → :540:54 | seed-b: chain digests, row counts … | changed: one unexpected sentence `[ { …(2) } ]` → 41 settled against the pinned 48 | W195 r04 s0019; T196 | attributed (item 13, X10 row 2) | X10 |
| 8 | UNRESOLVED ledger | p13b, 416 | relationships:530:54 → :540:54 | p13b-s8-bridge-probe-01: chain digests, row counts … | same: 43 settled against the pinned 48 | W428 r04 s0044; T429, after the bound | retained (14b) | K6 |
| 9 | UNRESOLVED ledger (S10 row 3) | p13pub, 416 | relationships:530:54 → :560:37 | p13-public-commercial-adoption: chain digests … | changed: 35 settled against the pinned 36 → digest `62c9fd5d…` against `c034f2fb…` | W118 r04 s0011; T119 | attributed (item 13, X10 row 3) | X10 |
| 10 | C8 T4 sharedTakeOutcomes | p13a, 230 | t4:283:9 | round-trips several beneficiaries sharing one real take … | same: no multi-beneficiary promise outcome from a shared real take within 230 weeks | W93 r01 s0006; T94 inside bound; premise as row 1 | open (14c) | K1 |
| 11 | C8 T4 | p13a, 230 | t4:283:9 | rejects missing outcome receipt references | same | as row 10 | open (14c) | K1 |
| 12 | C8 T4 | p13a, 230 | t4:283:9 | rejects null outcome receipt references | same | as row 10 | open (14c) | K1 |
| 13 | C8 T4 | p13a, 230 | t4:283:9 | rejects unknown outcome receipt references | same | as row 10 | open (14c) | K1 |
| 14 | C8 T4 | p13a, 230 | t4:283:9 | rejects wrong receipt kind outcome receipt references | same | as row 10 | open (14c) | K1 |
| 15 | C8 T4 | p13a, 230 | t4:283:9 | rejects another beneficiary outcome receipt references | same | as row 10 | open (14c) | K1 |
| 16 | C8 T4 | p13a, 230 | t4:283:9 | rejects wrong outcome week outcome receipt references | same | as row 10 | open (14c) | K1 |
| 17 | C8 T4 | p13a, 230 | t4:283:9 | rejects missing take qualifying evidence | same | as row 10 | open (14c) | K1 |
| 18 | C8 T4 | p13a, 230 | t4:283:9 | rejects non-take receipt qualifying evidence | same | as row 10 | open (14c) | K1 |
| 19 | C8 T4 | p13a, 230 | t4:283:9 | rejects wrong studio or cast qualifying evidence | same | as row 10 | open (14c) | K1 |
| 20 | C8 T4 | p13a, 230 | t4:283:9 | rejects empty qualifying evidence | same | as row 10 | open (14c) | K1 |
| 21 | C8 T4 | p13a, 230 | t4:283:9 | rejects duplicate qualifying evidence | same | as row 10 | open (14c) | K1 |
| 22 | C8 T4 | p13a, 230 | t4:283:9 | rejects outside window qualifying evidence | same | as row 10 | open (14c) | K1 |
| 23 | C8 T4 | p13a, 230 | t4:283:9 | rejects wrong progress qualifying evidence | same | as row 10 | open (14c) | K1 |
| 24 | C8 T4 | p13a, 230 | t4:283:9 | rejects unbound outcome qualifying evidence | same | as row 10 | open (14c) | K1 |
| 25 | C8 rivalFixture | p13a, 240 | preconditions:27:15 | produces a rival-only open promise and public kept outcome … | same | as row 1 | open (14c) | K1 |
| 26 | C8 cast-class rivalWorlds | seed-b, 350 | cast-class:247:9 | RIVAL: a genuinely naturally authored tagged commitment binds … | same: UNEXECUTED natural rival prerequisites absent by350 | W195 r04 s0019; T196 inside bound | open (14c) | K5 |
| 27 | C8 cast-class | seed-b, 350 | cast-class:247:9 | 'rival' 'lead' with actual 'lead' seat: qualification=true | same | as row 26 | open (14c) | K5 |
| 28 | C8 cast-class | seed-b, 350 | cast-class:247:9 | 'rival' 'lead' with actual 'antagonist' seat: qualification=false | same | as row 26 | open (14c) | K5 |
| 29 | C8 cast-class | seed-b, 350 | cast-class:247:9 | 'rival' 'lead' with actual 'support' seat: qualification=false | same | as row 26 | open (14c) | K5 |
| 30 | C8 cast-class | seed-b, 350 | cast-class:247:9 | 'rival' 'leadOrAntagonist' with actual 'lead' seat: qualification=true | same | as row 26 | open (14c) | K5 |
| 31 | C8 cast-class | seed-b, 350 | cast-class:247:9 | 'rival' 'leadOrAntagonist' with actual 'antagonist' seat: qualification=true | same | as row 26 | open (14c) | K5 |
| 32 | C8 cast-class | seed-b, 350 | cast-class:247:9 | 'rival' 'leadOrAntagonist' with actual 'support' seat: qualification=false | same | as row 26 | open (14c) | K5 |
| 33 | C8 cast-class | seed-b, 350 | cast-class:247:9 | rival support qualifies for P1 and shape-legacy count-only P2 … | same | as row 26 | open (14c) | K5 |
| 34 | C8 cast-class | seed-b, 350 | cast-class:247:9 | rival half-open window counts start … | same | as row 26 | open (14c) | K5 |
| 35 | UNRESOLVED seating decisions | p13a, 350 | seating:483:78 | p13a-core-causal-01: every real film decision without members … | same: `[]` against two w208 r01 decisions | W93 r01 s0006; T94 inside bound | open (14c) | K3 |
| 36 | UNRESOLVED seating decisions (S10 row 1) | seed-b, 350 | seating:498:20 | seed-b: every real film decision without members … | changed: digest `9eeb62f6…` → `d32e68f6…`, both against `f9cd2a86…` | W195 r04 s0019; T196 | attributed (item 13, X10 row 1) | X10 |
| 37 | C8 seating natural witness | seed-b, 350 | seating:343:10 | search table: the first seed-b decision whose seating matters … | same: UNEXECUTED natural premise: no rival film decision on 'seed-b' within 350 ticks holds >= 2 pool members whose seating matters | W195 r04 s0019; T196 inside bound | open (14c) | K5 |
| 38 | C8 seating natural witness | seed-b, 350 | seating:343:10 | RED: the real seating serves the maximal DISTINCT-beneficiary count … | same | as row 37 | open (14c) | K5 |
| 39 | C8 seating natural witness | seed-b, 350 | seating:343:10 | CONFLICT: the ordinary economic score prefers a two-beneficiary permutation … | same | as row 37 | open (14c) | K5 |
| 40 | C8 seating natural witness | seed-b, 350 | seating:343:10 | TIE FALLBACK (labeled reception-input variant) … | same | as row 37 | open (14c) | K5 |
| 41 | UNRESOLVED current unaccepted offers | seed-b, 350 | seating:622:66 | CURRENT unaccepted offers never count: seed-b w202 … | same: received r02 at w202, expected r01 | W195 r04 s0019; T196 inside bound | open (14c) | K4 |
| 42 | C8 seating natural witness | seed-b, 350 | seating:343:10 | another issuer's promise never counts … | same | as row 37 | open (14c) | K5 |
| 43 | C8 seating natural witness | seed-b, 350 | seating:343:10 | a met promise never counts (r01 chain …) | same | as row 37 | open (14c) | K5 |
| 44 | C8 seating natural witness | seed-b, 350 | seating:343:10 | a promise whose window excludes the prospective take never counts (window starts after …) | same | as row 37 | open (14c) | K5 |
| 45 | C8 seating natural witness | seed-b, 350 | seating:343:10 | a promise whose window excludes the prospective take never counts (window ends before …) | same | as row 37 | open (14c) | K5 |
| 46 | C8 seating natural witness | seed-b, 350 | seating:343:10 | mask derivation through the shared reader (tagged lead stays exact …) | same | as row 37 | open (14c) | K5 |
| 47 | C8 seating natural witness | seed-b, 350 | seating:343:10 | mask derivation through the shared reader (legacy count-only …) | same | as row 37 | open (14c) | K5 |
| 48 | C8 seating natural witness | seed-b, 350 | seating:343:10 | mask derivation through the shared reader (APPEARANCE_COUNT is generic cast) | same | as row 37 | open (14c) | K5 |
| 49 | C8 seating natural witness | seed-b, 350 | seating:343:10 | promised non-primary-actor beneficiaries … are never seated | same | as row 37 | open (14c) | K5 |
| 50 | C8 seating seam witness | p13a, 350 | seating:807:12 | the positive seam witness (plan :225-227, :233; record 621 R2 / G10-b) | same: UNEXECUTED natural premise: no picture on 'p13a-core-causal-01' within 350 ticks seats a promised person outside the historical first three | W93 r01 s0006; T94 inside bound | open (14c) | K2 |

File short names: trust = `tests/bridge-p14b2-trust.test.ts`, relationships = `tests/bridge-p14b5-relationships.test.ts`,
t4 = `tests/p14b1-t4-regressions.test.ts`, preconditions = `tests/p14b2-fixture-preconditions.test.ts`, cast-class =
`tests/p14b4-cast-class-outcomes.test.ts`, seating = `tests/p14b4-rival-seating-preference.test.ts`. Seed short names:
p13a = `p13a-core-causal-01`, p13b = `p13b-s8-bridge-probe-01`, p13pub = `p13-public-commercial-adoption`.

## Method limits

- No test changed and no hiring was forced. Step 2 ran the landed tests in the pristine candidate tree before any
  probe file entered it, and `git status` read empty afterwards (s7.meta:20). The kit's probes use natural ticks only.
- The kit measures the 1329 premise fields (`firstRivalSatisfied`, `firstShared`) for the 21 p13a natural searches.
  It does not measure the decision-level premises of the seed-b rows or of row 50, so K2 and K5 rest on the leaves'
  own failure messages plus the chain facts named.
- The worksheet's `premise.head1329` values are constants in worksheet.py:130. compare.json `p13a.chain.head1329`
  reads the same values from 1329's recorded file.
