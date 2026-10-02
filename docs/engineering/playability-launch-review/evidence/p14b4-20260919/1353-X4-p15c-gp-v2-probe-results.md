# 1353-X4: G-P on the 1353-F6 values (`campaign-legacy/v2`)

[1353-F6](1353-F6-parent-rulings-on-1353-T.md) ruling 5 ordered G-P again on the ruled values, and
[1353-F7](1353-F7-parent-response-to-1353-U.md) ruling 5 added 1353-U's expectation. **Every row matches the
expectation.** No evaluated archetype is held by none in every seed or by every studio in every seed, so G-P's trigger
(1359-A §9) does not fire.

## How it ran

- **Probe.** The unchanged 1359-GP probe ([1359-GP-probe.ts](1359-stage/gp/1359-GP-probe.ts), sha256 f0f0c0f6…), in
  `/Users/zacheryspector/studio-scratch/1353-x4/probe/`.
- **Tree.** `/Users/zacheryspector/studio-scratch/1353-x4/tree` holds an archive of HEAD bc2f6007 (`src` equals
  b0809602's) with `node_modules` linked. One tree commit, 6874387, applies the ruled values
  ([1353-X4-tree-edits.patch](1353-stage/x4/1353-X4-tree-edits.patch)):
  - `LEGACY_CRITIC_ACCLAIM_MIN` 60, `LEGACY_MIN_SHARE_PERCENT` 20 and `LEGACY_HIT_REACH_PERCENT` 49
    (`tuning.ts:1042`, :1046, :1047);
  - `CAMPAIGN_LEGACY_DEFINITION` `campaign-legacy/v2` (`campaignLegacy.ts:72`).

  Comments were left alone, since the probe reads only values. The other twelve Legacy values keep v1's.
- **Lane.** [run-x4.sh](1353-stage/x4/run-x4.sh) ran alone under `HEAVY-LANE-LOCK` on 2026-10-02 CDT, Node v20.20.2:
  - a 20-week smoke on p13a-core-causal-01 from 02:17:49 to 02:17:52;
  - the full routes to week 6240 on p13a-core-causal-01 and seed-b from 02:17:52 to 02:24:48, exit 0
    ([runs.meta](1353-stage/x4/runs.meta), [x4.lane.meta](1353-stage/x4/x4.lane.meta)).
- **Outputs:** [gp-v2.json](1353-stage/x4/gp-v2.json) (131,105 bytes, sha256 6eff3903…) and
  [gp-v2.err](1353-stage/x4/gp-v2.err).
- **The F1 bridge** (1359-X4) applied as before. The landed law refuses an authored film's null `settledWeek`, so the
  probe reran the law on a copy where the 8 authored films read `settledWeek` 0.

## Results

The JSON records `law: 'campaign-legacy/v2'` and the fifteen Legacy values above.

| Read-out | p13a-core-causal-01 | seed-b |
|---|---|---|
| Route to 6240 | 81.3 s (13.0 ms per tick) | 332.9 s |
| Adapter refusals; law refusal | none; none | none; none |
| Freeze: adapter, law, total | 2, 8, 10 ms | 8, 35, 43 ms |
| Manifest bytes; sha256 | 35,139; 94d55c76… | 60,492; e71fdb5c… |

**Holders per archetype**, 10 studios per seed:

| Archetype | p13a | seed-b | Expected (1353-F6, 1353-U) | Retune (none in every seed) |
|---|---:|---:|---|---|
| `artistic-voice` | 0 | 2: r06, r07 | 0 and 2 (r06, r07) | no |
| `commercial-engine` | 0 | 2: r06, r07 | 0 and 2 (r06, r07) | no |
| `audience-institution` | 0 | 5 | as 1359-X4: 0 and 5 | no |
| `technology-pioneer` | 1 | 5 | as 1359-X4: 1 and 5 | no |
| `talent-foundry` | 2 | 5 | as 1359-X4: 2 and 5 | no |
| `genre-specialist` | 4 | 3 | as 1359-X4: 4 and 3 | no |
| `resilient-survivor` | exempt: 0 | 0 | exempt | no |
| `awards-dynasty` | not evaluated: 0 | 0 | not evaluated | no |

- `retuneCheck` reads `retune: false` for every archetype.
- `retuneSomeSeedReading` is true for `artistic-voice`, `audience-institution` and `commercial-engine`, as 1353-U
  predicted. 1359-F5 ruling 1 rejected that reading.
- Every manifest hash differs from 1359-X4's, as 1353-T §4.3 predicted: the definition string and the qualifying refs
  changed.

## Limits

- **No shared-market pressure.** These grosses carry no P15A.1 factor. 1353-F7 ruling 2 records r06's thin margin
  under pressure (1.9% beyond the 1355-G1 factors) and the next value, 48.
- **Not the gating run.** 1353-F7 ruling 5 makes the gating run the one on the tree Wave 2 production lands on, after
  slice B's Save44 production and with P15A.1 Wave 2 when that lands first or together. The probe first needs a
  branch for the sibling P15 roots.
- **Two seeds.** The p13a seed reflects the rival stall (1357-R). The calibration rests on seed-b's five careers
  (1353-T §6.2).
