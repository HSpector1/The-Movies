# 1353-T: notes for the distributions probe

`1353-T-distributions-probe.ts` answers item 1 of 1359-F5's Next list: the distributions behind the 1353-A §5.5 retune
of `artistic-voice` and `commercial-engine`. It ticks three seeds to week 6240 and reads every campaign release the
way the landed law `campaign-legacy/v1` reads it. It then checks that reading against the law's own manifest and
prints one JSON document. I wrote it read-only at HEAD 975e72a1 and ran no vitest, tsc, node, tsx or vite-node.
The probe's sha256 is `5d1c10e7b5cb624109cf67756f6a10da99e179e87710175fd6849401557d0bd4`.

References:

- E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.
- "law :N" is `src/core/campaignLegacy.ts` line N.
- "GP :N" is `E/1359-stage/gp/1359-GP-probe.ts` line N. The probe carries GP :44-246 as its own lines 61-263, so GP
  line N is probe line N + 17. `diff` shows one changed line in that block, the F1 BRIDGE progress tag (probe :242).
- "r3 :N" is `E/1359-stage/1359-p15c-wave2-reference-r3.patch` line N, the reference adapter.

## 1. Run

**Tree.** Use the 1359-GP scratch tree as it stands: `/Users/zacheryspector/studio-scratch/p15-probes/tree`, a
`git archive` of 975e72a1 (`tree-head.txt`) with `node_modules` linked. Its `src` equals b0809602's. I compared
sha256 for every `src` file the probe imports, plus `hollywoodTick.ts`, and each matches b0809602 and this worktree.
The probe needs no patch. Put it in `p15-probes/probe/` beside `tree/`, so the `../tree/` prefix needs no edit, with
Node v20.20.2 first on PATH.

Smoke, one seed, 20 weeks:

```
PROBE_TREE_HEAD=<tree HEAD> PROBE_WEEKS=20 PROBE_SEEDS=p13a-core-causal-01 \
  ./node_modules/.bin/vite-node ../probe/1353-T-distributions-probe.ts > smoke.json 2> smoke.err
```

Full run, three seeds:

```
PROBE_TREE_HEAD=<tree HEAD> PROBE_WEEKS=6240 PROBE_SEEDS=p13a-core-causal-01,seed-b,p13a-wait-control-01 \
  ./node_modules/.bin/vite-node ../probe/1353-T-distributions-probe.ts > 1353-T-output.json 2> 1353-T-progress.txt
```

`p15-probes/run-probe.sh` wraps either form: `run-probe.sh 1353-T-distributions-probe.ts <tag> <weeks> <seeds>`.
Unset, PROBE_SEEDS falls back to the three seeds, PROBE_WEEKS to 6240 and PROBE_TREE_HEAD to `unrecorded`, as in
1359-GP.

| Run | Estimate | Basis |
|---|---:|---|
| Smoke | about 5 s | 1359-GP's 20-week smoke took 4 s (`E/1359-stage/gp/runs.meta`) |
| p13a-core-causal-01 to 6240 | about 88 s | 1359-GP: 87.8 s |
| seed-b to 6240 | about 356 s | 1359-GP: 355.8 s |
| p13a-wait-control-01 to 6240 | about 91 s | 1357-P: 91 s (`E/1357-stage/x/1357-P-progress.txt`) |
| Full run | about 9 minutes | The sum plus start-up. The reading, the law call and the check add under a second per seed: 1359-GP's whole freeze took 15 ms on p13a and 45 ms on seed-b |

The output should come to about 0.7 MB. 1359-GP and 1355-G1 count 91 releases on p13a and 1,952 on seed-b, all
settled at 6240; expect wait-control near p13a.

## 2. What the parent checks first

1. **Smoke exit code and stderr.** Expect exit 0, an `F1 BRIDGE` line, and this summary line:
   `smoke endOfRun at week 20: 4 releases, 4 settled; held: artistic-voice 0, commercial-engine 0, of 5 studios; law check pass (52 comparisons)`.
   1359-GP's smoke manifest (`p15-probes/out/smoke-gp.json`) shows one settled release each for r01-r04 at week 20.
2. **Smoke JSON.** Top-level `lawCheck` reads `pass`, `f1.standInFilms` is 8, and `manifestSha256` equals 1359-GP's
   smoke hash, `12ccd97a6ee85ef2545aceb0c79289b67f73a49ec0675047f2070e257e559161`.
3. **Full run exit code.** Exit 1 means a seed had a law-check mismatch, a law refusal or an adapter refusal. stderr
   names the seed under `FAILED`, and each `LAW CHECK MISMATCH` line names the studio, the field and both values. Do
   not use that seed's numbers; send the output back to me.
4. **The route.** Each seed's `finalWeek` is 6240, `mode` is `full`, and `routeMs` sits near §1's times.
5. **The law check.** Top-level `lawCheck` reads `pass`. Each seed's `lawCheck` shows 10 studios, 102 comparisons
   and an empty `mismatches`.
6. **Identity with 1359-X4.** `manifestSha256` equals 1359-GP's on the two seeds it ran
   (`E/1359-stage/gp/1359-GP-output.json`):
   - p13a-core-causal-01: `59d529631cd4220a57ee404305d05c0f74114afe7383321261917ec05cdc1106`;
   - seed-b: `0c95337764199504d5908d69b1880ac60bf85cda54c8bf708b692ab9d5463da2`.

   Equal hashes mean the same route, the same facts and the same manifest as 1359-X4.
7. **The 1359-X4 counts.** On seed-b, r07 reads `a` 36 of `n` 404, and r06 reads 14 of 419. No studio on p13a or
   seed-b has `h` above 2, and no studio holds either rule.
8. **The values.** `tuning` reads `LEGACY_CRITIC_ACCLAIM_MIN` 70, `LEGACY_CRITIC_PAN_BELOW` 35, `LEGACY_MIN_FILMS` 5,
   `LEGACY_MIN_SHARE_PERCENT` 25, `LEGACY_HIT_REACH_PERCENT` 90 and `LEGACY_FLOP_REACH_PERCENT` 30.

Then send me the output path for stage 2.

## 3. Output fields

**Top level.** `probe`, `purpose`, `mode` (`full` at 6240, else `smoke`), `treeHead`, `weeks`, `boundaryWeek`,
`law` (`campaign-legacy/v1`), `tuning` (the fifteen `LEGACY_*` values), `quantile` (the definition; choice 1),
`lawCheck` (`pass`, or `FAIL:` with the failing seeds), `seeds`, `releaseColumns` and `releaseRows`.

**Per seed, `seeds[]`.**

| Field | Content |
|---|---|
| `seed`, `finalWeek`, `routeMs`, `msPerTick` | The route, comparable with 1359-GP and 1357-X |
| `playerStudioId` | `hollywood.playerStudioId`, the source of `role` |
| `adapterRefusals`, `lawRefusal`, `f1` | As in 1359-GP: the adapter's refusal, any law refusal other than F1, and the F1 bridge record |
| `manifestSha256` | sha256 of `stableStringify(manifest)`, the value 1359-GP prints (GP :292, :313) |
| `lawCheck` | `{studios, releases, comparisons, mismatches}` (§5); null without a manifest |
| `baseMarketValue` | The one value the law reads (law :272-273; GP :143) |
| `allRivals.critic`, `allRivals.reach` | Quantiles over every rival release on the seed; `reach` covers the settled ones |
| `studios[]` | One entry per manifest studio, in the law's order (law :512-514) |

An adapter refusal leaves a seed with only its route fields, `adapterRefusals`, `lawRefusal` and `lawCheck`.

**Per studio, `seeds[].studios[]`.**

| Field | Content | Law |
|---|---|---|
| `studioId`, `role`, `row`, `enteredWeek` | Identity. `role` is not a law input | :512-514 |
| `artisticVoice.n` | Releases | :591 |
| `artisticVoice.a` | Releases with critic ≥ `LEGACY_CRITIC_ACCLAIM_MIN` | :586, :590 |
| `artisticVoice.sharePercent` | 100a ÷ n, null when n is 0. For reading only | |
| `artisticVoice.held` | a ≥ `LEGACY_MIN_FILMS` and 100a ≥ `LEGACY_MIN_SHARE_PERCENT` × n | :591 |
| `artisticVoice.panned` | Releases with critic < `LEGACY_CRITIC_PAN_BELOW`, the contrary count | :588 |
| `commercialEngine.s` | Settled releases | :616 |
| `commercialEngine.h` | Settled releases with 100 × gross ≥ `LEGACY_HIT_REACH_PERCENT` × `baseMarketValue` | :618, :622 |
| `commercialEngine.sharePercent` | 100h ÷ s, null when s is 0. For reading only | |
| `commercialEngine.held` | h ≥ `LEGACY_MIN_FILMS` and 100h ≥ `LEGACY_MIN_SHARE_PERCENT` × s | :623 |
| `commercialEngine.flops` | Settled releases with 100 × gross < `LEGACY_FLOP_REACH_PERCENT` × `baseMarketValue`, the contrary count | :620 |
| `critic` | Quantiles of critic score over the n releases | :586 |
| `reach` | Quantiles of gross ÷ `baseMarketValue` over the s settled releases | :616-618 |

Every distribution reads `{count, min, p50, p75, p90, p95, p99, max}`, and each point is null when `count` is 0.

**Per release.** `releaseRows[seed]` holds one array per release, in `releaseColumns` order: `filmId`, `studioId`,
`role`, `releaseWeek`, `settled`, `criticScore`, `audienceScore`, `grossSettled`, `reach`. Rows follow the law's studio
order, then release week, then film id (law :567, :763).

## 4. The lines each release fact mirrors

The law builds each studio's release list in `readFacts` (law :404-417) from the facts the adapter produces. Probe
lines appear in parentheses after GP lines.

| Column | What the law reads | Adapter: GP line (probe line) | 1359-A | r3 |
|---|---|---|---|---|
| `filmId`, `studioId` | Releases grouped by the film's `studioId` (:411) | Player :88-89 (105-106); rival :101 (118) | :49 | :361, :371 |
| `role` | Nothing: the law takes no role flag (1353-A :152-153) | `hollywood.playerStudioId`, as GP :259-263 | | |
| `releaseWeek` | A campaign film released before B (:408-409) | :90 (107); :102 (119) | :50 | :362, :372 |
| `settled` | Status settled and `settledWeek` < B (:416) | Player :85-86, :92 (102-103, 109); rival :99, :104 (116, 121) | :53 | :358-359, :363; :369, :373 |
| `criticScore` | `r.film.criticScore` (:586, :588) | Player `film.criticScore` :91 (108); rival `film.result.criticScore` :103 (120) | :52 | :362, :372 |
| `audienceScore` | The score on the film's first career event, null for a film with none (:410, :415). Events that disagree refuse (:396-402) | :121-124, :146-149 (138-141, 163-166) | :56 | :386-393 |
| `grossSettled` | Read only for a settled release (:616-617); null otherwise | Player `boxOffice.total` :93 (110); rival `result.boxOffice.total` :105 (122) | :54 | :364, :374 |
| `reach` | Nothing: the probe derives `grossSettled ÷ baseMarketValue` | `baseMarketValue` :143 (160) | §3.1 names no source; GP :143 follows RED r5 :1255 | :431 |

- `baseMarketValue` is one number per seed. The law reads `facts.baseMarketValue` once (law :272-273), and world
  generation fixes it (1353-A :155-156), so the probe records it on `seeds[]` instead of on each row. 100 ×
  `grossSettled` ÷ `baseMarketValue` from a row and its seed gives the reach in percent that the law compares with 90
  and 30.
- Authored pre-1920 films never become releases (law :408; 1353-A :147-148), so no row carries one.
- The probe reads the adapter's own facts, not the F1 copy. The copy changes only the authored films' `settledWeek`,
  which no release reads.

## 5. The law check

The probe runs the landed law on the same facts through 1359-GP's F1 bridge (GP :184-234). For each manifest studio
it then compares:

- the catalog lens's `releases` and `settled` (law :721-726) with `n` and `s`;
- `artistic-voice`'s outcome, its `qualifyingCount` with `a`, and its `contraryCount` with `panned` (law :585-593);
- `commercial-engine`'s outcome, its `qualifyingCount` with `h`, and its `contraryCount` with `flops` (law :615-625);
- `audience-institution`'s `qualifyingCount` and `contraryCount` with the audience decades and other eligible
  decades the probe derives from its `audienceScore` column (law :595-613). This pair checks the audience reading.

It also compares the studio order, and the releases read for every studio with the releases of manifest studios,
which catches a release the law would drop. That makes 2 comparisons per seed plus 10 per studio. The manifest's
counts are exact (law :577-581), so any mismatch means the probe's reading departs from the law's. The probe reports
every mismatch on stderr and in `lawCheck.mismatches`, prints the rest of the document, and exits 1.

## 6. Choices

1. **Quantiles.** Type 7, linear between order statistics, from `src/harness/d16/stats.ts:8-19`. That file holds the
   lab's one definition, and 1355-G1 uses it too. `min` and `max` are its q 0 and q 1. A type 7 quantile can fall
   between two releases' values, so stage 2 counts holders from `releaseRows`, never from the quantiles.
2. **What each distribution covers.** Critic quantiles cover all n releases, settled or not, as artistic voice counts
   them. Reach quantiles cover the s settled releases, the only ones whose gross the law reads. `allRivals` leaves out
   the player, which made no release on either seed in 1359-X4.
3. **Exact arithmetic.** The counts use the law's products, `100 × gross ≥ P × baseMarketValue` (law :618, :620),
   never the `reach` quotient. The JSON carries each double at full precision, so Python's
   `100 * gross >= P * bmv` on the rows reproduces the law's comparison for any candidate P.
4. **Seeds.** p13a-core-causal-01 and seed-b, as 1359-GP ran them, plus p13a-wait-control-01, the third seed 1357-A
   :256-257 adds through `p13aGeneratedStudio`. 1357-X found the same entry weeks on all three seeds, so each should
   report 10 studios.
5. **The F1 bridge, inherited.** The landed law refuses an authored film's null `settledWeek` (law :351), and 1359-F2
   F1 relaxes that only in Wave 2 production. The probe keeps 1359-GP's bridge unchanged: the law runs on a copy where
   the 8 authored films read `settledWeek` 0, and the probe stops by name unless the copy at 6239 gives identical
   bytes.
6. **No market pressure.** P15A.1 Wave 2 has not landed, and the sibling-root guard refuses a `sharedMarket` root
   (GP :50-57). No gross here carries the shared-market factor. 1357-A :259-260 sends P15B's probe to the pressure
   tree if pressure lands first, because pressure lowers grosses; a hit line set from these quantiles carries the same
   dependency.
7. **Output on failure.** As in 1359-GP, the probe prints the whole document before it exits 1, so one run shows
   every seed. A tick error or a probe fault throws and stops the run.

## 7. What it does not do

- It writes nothing to disk and reads no save, fixture, doc or Owner file.
- It evaluates no candidate value. Stage 2 computes candidates from `releaseRows`.
- It writes no root and applies no stamp.
