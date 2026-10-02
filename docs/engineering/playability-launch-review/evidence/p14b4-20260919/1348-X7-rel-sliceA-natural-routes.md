# 1348-X7: slice A leaves the four §7 natural routes byte-identical

[1344-V](1344-V-s7-shelving-verification.md) measured the natural routes at 469a9547, before relationship slice A
landed (section 10, ruling 1). This run repeats them at HEAD, which carries slice A
([1348-L](1348-L-rel-sliceA-landing.md)). **Every output file equals the §7 candidate's, byte for byte, on all four
seeds.** Slice A does not move these routes, so 1344-V's natural-route numbers also describe HEAD.

## How it ran

- **Script.** [run-1348-X7.sh](1348-stage/x7/run-1348-X7.sh), alone in the heavy lane under `HEAVY-LANE-LOCK`
  (`lane-run.sh`), on 2026-10-01 from 22:53:19 to 22:56:50 CDT, Node v20.20.2 (the §7 run's version).
- **Tree.** An archive of e7f075ce, whose `src` and `generated` equal b0809602's (the script checks this), with
  the 1327-C path list and links to `docs`, `node_modules`, `art`, `tools` and `tests/fixtures`. After the runs
  `git status` reads empty.
- **Probes.** The §7 kit's `s7-lib.ts` and `s7-natural-route.test.ts`, copied unchanged as `tests/zz-s7-*`, with
  `S7_TREE=candidate`. They write to the kit's output root under the new run names `h-*`, which the kit refuses to
  overwrite.
- **Logs.** The [1348-stage/x7/](1348-stage/x7/) folder holds them as `.txt`: one per run, the run summary and the lane
  meta.

## Result

| Seed | Run | ms | `finalStateSha256` (state) | §7 candidate run | Files equal |
|---|---|---:|---|---|---|
| p13a-core-causal-01 | h-p13a | 35,460 | 4e9c0d75… | c-p13a-1 | 5 of 5 |
| seed-b | h-seedb | 50,151 | 759943bd… | c-seedb | 5 of 5 |
| p13b-s8-bridge-probe-01 | h-ledger-p13b | 52,716 | e8f534bb… | c-ledger-p13b | 5 of 5 |
| p13-public-commercial-adoption | h-ledger-p13pub | 42,735 | 4db7734b… | c-ledger-p13pub | 5 of 5 |

- **The five files.** `natural-chain.jsonl`, `rival-economy.jsonl`, `weekly.jsonl`, `final-state.json` and
  `s7.json`. `cmp` finds each equal to the §7 run's file.
- **The shelving counts** match 1344-V: 14, 60, 6 and 22.
- **Each final-state file hash** equals its line in
  [final-state-sha256.txt](1344-stage/s7/out/final-state-sha256.txt): fe78e4ab…, c7a30778…, 48ad8023… and
  89e42265….

## Consequence

- 1344-V ruling 1 left slice A's effect on natural routes unmeasured. On these four routes it is none.
- [1357-X](1357-X-p15b-wave2-probe-results.md) ran at b0809602, and its agreement with §7's p13a timings is
  consistent with this result.
- Slice A's closure still needs its broad core and UI gates, which ride with the next broad run (1348-L).
