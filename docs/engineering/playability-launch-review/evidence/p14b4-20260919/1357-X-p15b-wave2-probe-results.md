# 1357-X: the P15B Wave 2 measurement probe (1357-P), run at HEAD b0809602

[1357-A](1357-A-p15b-wave2-charter.md) §8 gates P15B Wave 2 on this probe, and
[1357-F](1357-F-parent-p15b-wave2-charter-adoption.md) ("The probe gate") orders the run and this record.

**Result: Re-tune before integration.** On the two p13a seeds, arm B puts 7 of 8 entered rivals at closure due by
1960 and 9 of 9 by 1980. That crosses the Re-tune line on three read-outs. seed-b alone would read Flag. No rival on
any seed records a recovery in arm A. Arm B's loan buys each rival about 20 weeks and changes no checkpoint count.

## How it ran

- **Probe.** [1357-P-condition-probe.ts](1357-P-condition-probe.ts) (sha256 ee1709d8…), byte for byte. It sat in
  `probe/` beside the tree, so its `../tree/` import prefix needed no edit.
- **Tree.** `git archive` of b0809602 (`src`, `generated`, `package.json`, `tsconfig.json`, `tsconfig.src.json`,
  `vitest.config.ts`), with `node_modules` linked. HEAD carries:
  - Wave 1 (1352-L);
  - shelving and Save43 (1344-K);
  - relationship slice A (1348-L).

  P15A.1 Wave 2's market pressure has not landed, so HEAD is the tree §8 names.
- **Runner.** `vite-node`, because the probe header's `tsx` is not installed, under Node v20.20.2. It ran alone in
  the heavy lane under `HEAVY-LANE-LOCK`
  ([run-probe.sh](1357-stage/x/run-probe.sh), launched by `lane-run.sh`):

  ```
  PROBE_TREE_HEAD=b0809602… PROBE_WEEKS=6240 PROBE_SEEDS=p13a-core-causal-01,seed-b,p13a-wait-control-01 \
    ./node_modules/.bin/vite-node ../probe/1357-P-condition-probe.ts
  ```
- **Times, 2026-10-01 CDT** ([runs.meta](1357-stage/x/runs.meta)):
  - a 20-week smoke on one seed ran 22:25:03-22:25:07;
  - the full run ran 22:25:20-22:34:28 and exited 0.
- **Outputs.** The probe writes one JSON document to stdout and progress to stderr. [1357-X-table.py](1357-stage/x/1357-X-table.py)
  fills the §8 table from the JSON.

| File | Bytes | sha256 (first 16) |
|---|---:|---|
| [1357-P-output.json](1357-stage/x/1357-P-output.json) | 92,133 | 5e0f2745d1dc120b |
| [1357-P-progress.txt](1357-stage/x/1357-P-progress.txt) | 1,693 | 4b287c19594f0652 |
| [1357-X-table.json](1357-stage/x/1357-X-table.json) | 5,212 | 6d335e6e05200b95 |

## The §8 table (arm B; the worst seed decides)

| Read-out | p13a-core-causal-01 | seed-b | p13a-wait-control-01 | Band |
|---|---|---|---|---|
| Closure due by 1960 / rivals entered by 1960 | 7/8, 87.5% | 4/8, 50% | 7/8, 87.5% | **Re-tune** (> 50%) |
| Closure due by 2000 / rivals entered by 2000 | 9/9, 100% | 4/9, 44% | 9/9, 100% | **Re-tune** (> 60%) |
| Closure due by 2040 / 9 rivals | 9/9, none left | 4/9, 5 left | 9/9, none left | **Re-tune** (> 75%, fewer than 3 left) |
| Closure due, arm B minus arm A, at any checkpoint | 0 at all four | 0 at all four | 0 at all four | Proceed |
| A rival closure due within 104 weeks of entry | none | none | none | Proceed |

Per seed: p13a-core-causal-01 Re-tune, seed-b Flag, p13a-wait-control-01 Re-tune.

## The paths

Entry weeks are the same on all three seeds: r01-r04 at week 0, then r05 at 520, r06 at 988, r07 at 1560, r08 at
1872 and r09 at 2548.

| Seed | Rival | First below reserve | Arm A: warning, distress, closure due | Arm B: loan (week, principal), closure due |
|---|---|---:|---|---|
| p13a-core-causal-01 | r01 | 281 | 293, 301, 326 | 301, 3,107,000; 345 |
| | r02 | 305 | 322, 330, 355 | 330, 3,081,000; 374 |
| | r03 | 208 | 225, 233, 258 | 233, 2,437,000; 278 |
| | r04 | 115 | 129, 137, 162 | 137, 3,276,000; 182 |
| | r05 | 682 | 696, 704, 729 | 704, 2,583,000; 749 |
| | r06 | 1173 | 1190, 1198, 1223 | 1198, 1,079,000; 1237 |
| | r07 | 1765 | 1781, 1789, 1814 | 1789, 1,795,000; 1834 |
| | r08 | 2083 | 2098, 2106, 2131 | 2106, 3,315,000; 2151 |
| | r09 | 2857 | 2868, 2876, 2901 | 2876, 2,344,000; 2921 |
| seed-b | r01 | 629 | 641, 649, 674 | 649, 3,233,000; 694 |
| | r02 | 596 | 613, 621, 646 | 621, 2,870,000; 670 |
| | r03 | 488 | 507, 515, 540 | 515, 3,535,000; 560 |
| | r04 | 464 | 478, 486, 511 | 486, 2,507,000; 531 |
| | r05-r09 | never | never warn: Thriving in every evaluated week | none |
| p13a-wait-control-01 | r01 | 235 | 247, 255, 280 | 255, 2,752,000; 300 |
| | r02 | 191 | 208, 217, 242 | 217, 1,079,000; 262 |
| | r03 | 112 | 131, 139, 164 | 139, 3,069,000; 184 |
| | r04 | 95 | 109, 117, 142 | 117, 3,068,000; 162 |
| | r05 | 624 | 638, 646, 671 | 646, 3,328,000; 691 |
| | r06 | 1132 | 1149, 1157, 1182 | 1157, 2,709,000; 1202 |
| | r07 | 1794 | 1806, 1814, 1839 | 1814, 2,578,000; 1859 |
| | r08 | 2060 | 2075, 2083, 2108 | 2083, 1,079,000; 2124 |
| | r09 | 2812 | 2823, 2831, 2856 | 2831, 2,744,000; 2876 |

Source: 1357-P-output.json `studios`.

- **Arm A.** Every rival that warns runs one path: stable, warning, distress, closure due. Closure due falls exactly
  25 weeks after distress, the 26th distress week (`CORPORATE_CLOSURE_DISTRESS_WEEKS`). No arm A recovery occurs on
  any seed.
- **Arm B.** Every such rival runs:
  - stable, then warning, then distress, contracting the maximum loan in that week (1357-A §6.2);
  - recovery the next week, on the principal;
  - warning 5-15 weeks later (1352-F Amendment 2: recovery falls as stable does);
  - distress 8 weeks after that;
  - closure due 25 weeks later.

  The loan moves closure 14-24 weeks later and changes no count at any checkpoint.
- **Bands.** Most rivals spend exactly 13 weeks Strained and 13 Stable between Thriving and In the Red. That fits cash
  falling by about one fixed cost a week with no income.
- **Cash path.** A diagnostic beside the probe,
  [1357-X-cash-diag.ts](1357-stage/x/1357-X-cash-diag.ts), ran alone after it on the same tree and Node, from
  22:38:36 to 22:47:05 CDT. Its output is [1357-X-cash-diag.json](1357-stage/x/1357-X-cash-diag.json).
  - On all three seeds, no rival whose cash reaches zero ever holds positive cash again. Its first week at or below
    zero directly follows its last positive week, and no positive week comes after.
  - By 2040 those rivals hold between -144,527,022 and -286,299,780 and employ nobody. Their last weeks with staff fall
    between 207 and 2963.
  - seed-b's r05-r09 never reach zero. They end 2040 holding 674,485,466 to 3,132,547,213, with five or six staff.

## Report-only read-outs (§8)

- **Rival warnings.** Every seed has them, so the "no warning on any seed" flag does not apply. Five seed-b rivals
  never warn.
- **The idle player.** Arm A, on all three seeds:
  - warning at 1333, distress at 1341, closure due at 1366;
  - the closure route takes exactly the 33-negative-week floor, weeks 1334-1366;
  - 20,000,000 at 15,000 a week lasts 1,333 weeks (`tuning.ts:89`).
- **Calibration fact 1** (1352-F, "a chronically Strained studio never warns").
  - Each studio that leaves Thriving spends 13-16 weeks Strained. Nine of those weeks have cover at or above the
    4-week warning line, and twelve for p13a-core-causal-01's r07.
  - No studio stays Strained: each passes through the band on its way to In the Red.
- **Calibration fact 2** (1352-F, reserve gates "stall rival growth before a warning can fire"). Each rival's first
  week below reserve comes 11-19 weeks before its first warning (the table above).
- **Distress entries with fewer than two of {LOAN, RELEASE}: all of them.** 28, 13 and 28 entries, and none has a
  release in progress.
  - Arm A entries, the player's included, hold LOAN only: 10, 5 and 10.
  - Arm B first entries hold LOAN only: 9, 4 and 9.
  - Arm B second entries hold none, because the loan is outstanding: 9, 4 and 9.
  - The probe counts no REDUCE_OBLIGATIONS route, which Wave 3 adds. The rivals' headcount at each entry is in the
    JSON.
- **Size and time.**
  - Events: 57, 27 and 57.
  - Root bytes (arm B, the §4 shape): 19,331, 10,231 and 19,333.
  - Elapsed: 91.5 s, 362.5 s and 91.1 s, which is 14.7, 58.1 and 14.6 ms per tick.

## Consistency with §7

1344-V measured p13a-core-causal-01 to week 520 at 469a9547, before slice A. Rival cash first fell below zero at the
10-week samples for weeks 130 (r04), 230 (r03), 300 (r01) and 330 (r02). From week 262 at the latest, every
evaluation was cash-blocked, and by 520 no rival employed anyone (1344-V flags 3 and 4). This probe, at b0809602,
puts the same rivals' arm A warnings at 129, 225, 293 and 322. The collapse it measures is the stall §7 flagged.

## Next

The parent's response is [1357-F2](1357-F2-parent-response-to-1357-X.md).
