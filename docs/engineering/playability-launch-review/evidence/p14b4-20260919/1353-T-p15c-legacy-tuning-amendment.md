# 1353-T: P15C Legacy tuning amendment for `artistic-voice` and `commercial-engine` (1353-A §5.5)

**Status.** A proposal. An independent review comes next, then G-P again on the amended values (1359-F5, Next items
2-3). An agent wrote it read-only on 2026-10-02 (CDT) at HEAD 85ffc6bc, whose `src`, `bridge` and `ui/src` equal
b0809602's. No node ran; python3 read the probe output and printed to stdout.

References: E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`. "Law :N" is
`src/core/campaignLegacy.ts` line N. `dist.json` is the probe output named in §2.1.

## 1. At a glance

1359-X4 found `artistic-voice` and `commercial-engine` held by no studio on either seed, and 1359-F5 returned 1353-A
§5.5 to retuning for both. This record changes three values, keeps the count floor and the share floor of each
archetype, and bumps the law's definition.

| Key | v1 | 1353-T |
|---|---:|---:|
| `LEGACY_CRITIC_ACCLAIM_MIN` | 70 | **60** |
| `LEGACY_HIT_REACH_PERCENT` | 90 | **50** |
| `LEGACY_MIN_SHARE_PERCENT` | 25 | **20** |
| `LEGACY_MIN_FILMS` | 5 | 5 |
| `LEGACY_CRITIC_PAN_BELOW` | 35 | 35 |
| `LEGACY_FLOP_REACH_PERCENT` | 30 | 30, with a new reason |
| `CAMPAIGN_LEGACY_DEFINITION` | `campaign-legacy/v1` | **`campaign-legacy/v2`** |

The two new lines sit at the same height of the measured rival pool: on seed-b, 16.8% of rival releases reach
critic 60 and 16.4% gross half of `baseMarketValue`. A holder needs one release in five above its line, so it must
beat the industry's rate by about a fifth, and it still needs five such releases.

Expected holders on the amended tree (§4): `artistic-voice` 0, 2 and 0 of 10 studios on p13a-core-causal-01, seed-b
and p13a-wait-control-01; `commercial-engine` 0, 1 and 0. Under 1359-F5's reading, neither archetype triggers a
retune. No other archetype reads a changed key (§5).

One risk needs a ruling. On 1355-G1's measured market factors, the sole `commercial-engine` holder falls one release
short at a hit line of 50, so shared-market pressure from P15A.1 Wave 2 would likely leave it unheld. §6.1
pre-computes 49 as the contingency.

## 2. The evidence

### 2.1 The run

| Item | Value |
|---|---|
| Probe | `/Users/zacheryspector/studio-scratch/1353-t/1353-T-distributions-probe.ts`, sha256 `5d1c10e7b5cb624109cf67756f6a10da99e179e87710175fd6849401557d0bd4`; the parent's copy in `p15-probes/probe/` has the same hash |
| Run | The parent ran it alone in the heavy lane under Node v20.20.2, on the 975e72a1 scratch tree (`src` equals b0809602), from 2026-10-01 23:51:34 to 23:59:30 CDT, exit 0 (`p15-probes/out/runs.meta`) |
| Output | `/Users/zacheryspector/studio-scratch/p15-probes/out/dist.json`, 534,719 bytes, sha256 `6ee10685d45d0f97fbee3d18a6c7b5ee1b55c5097d8e47ceea536fea0e27346c`; progress in `dist.err`, sha256 `c69082bb79cdde0788640011383896fc1fa3074b7d202e148b905f6bfff48691` |
| Law check | `lawCheck: "pass"`; each seed compared 10 studios in 102 comparisons with no mismatch (`seeds[i].lawCheck`) |
| Identity with 1359-X4 | `seeds[0].manifestSha256` (59d52963…) and `seeds[1].manifestSha256` (0c953377…) equal 1359-GP's |
| Seeds | p13a-core-causal-01 (`seeds[0]`), seed-b (`seeds[1]`), p13a-wait-control-01 (`seeds[2]`); `baseMarketValue` 35,646,915, 71,160,383 and 27,148,939 |
| Releases | 91, 1,952 and 13, every one settled at 6240; all rival, since the idle player releases nothing |

The counts and quantiles below come from `dist.json` through `1353-T-holders.py` (§9), which first asserts two
things. Its rules give the probe's v1 counts for all 30 studios (n, a, panned and held; s, h, flops and held). Its
type 7 quantiles equal the JSON's, bit for bit. The probe had already matched the same counts against the law's
manifest.

### 2.2 Rival distributions

Critic score covers every release; reach is gross ÷ `baseMarketValue` over settled releases (law :616-618). Quantiles
are type 7 (`src/harness/d16/stats.ts:8-19`).

| Pool | Source | n | Critic p50 | p75 | p90 | p95 | p99 | max | Reach p50 | p75 | p90 | p95 | p99 | max |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| p13a-core-causal-01 | `seeds[0].allRivals` | 91 | 45.37 | 50.41 | 55.99 | 57.46 | 61.13 | 65.46 | 0.199 | 0.229 | 0.284 | 0.316 | 0.413 | 0.422 |
| seed-b | `seeds[1].allRivals` | 1,952 | 50.89 | 57.27 | 63.75 | 67.99 | 75.57 | 83.36 | 0.390 | 0.457 | 0.549 | 0.613 | 0.741 | 1.038 |
| p13a-wait-control-01 | `seeds[2].allRivals` | 13 | 46.88 | 55.46 | 65.53 | 67.56 | 69.60 | 70.12 | 0.191 | 0.254 | 0.318 | 0.331 | 0.339 | 0.341 |
| All three seeds | computed from `releaseRows` | 2,056 | 50.60 | 57.04 | 63.48 | 67.88 | 75.23 | 83.36 | 0.384 | 0.453 | 0.542 | 0.609 | 0.735 | 1.038 |

Seed-b supplies 1,952 of the 2,056 releases, so the pooled row follows it.

### 2.3 Who makes the films

- **seed-b's late entrants carry the sample.** r05-r09 entered between 1930 and 1969 and released 273-464 films each
  over 58-106 years, about 56 a decade at full pace. r01-r04 stopped by 1928 after 22-30 films.
- **p13a's rivals stop within about five years of entry.** Each released 2-15 films; r01 ran longest, from 1920 to
  1925. 1357-R traces the stall to the rivals' reserve gates and the cash-blocked shelving count (its summary items
  2 and 5).
- **p13a-wait-control-01's rivals stop sooner still.** Six of nine released anything, 13 films in all: r01 five, r08
  four, and four rivals one each.

### 2.4 Per studio on seed-b

From `seeds[1].studios[k]`, where k = 1-9 is r01-r09. Counts at the lines come from `releaseRows["seed-b"]`.

| Studio | Years | n | Critic p50 | p75 | p90 | ≥ 70 | ≥ 60 | Reach p50 | p75 | p90 | ≥ 0.90 | ≥ 0.50 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| r01 | 1920-1928 | 26 | 46.0 | 51.4 | 56.1 | 0 | 1 (3.8%) | 0.136 | 0.199 | 0.215 | 0 | 0 |
| r02 | 1920-1928 | 30 | 40.3 | 45.2 | 48.6 | 0 | 1 (3.3%) | 0.153 | 0.193 | 0.237 | 0 | 0 |
| r03 | 1920-1926 | 29 | 43.7 | 47.2 | 49.3 | 0 | 0 | 0.142 | 0.187 | 0.268 | 0 | 0 |
| r04 | 1920-1925 | 22 | 48.5 | 51.1 | 57.6 | 0 | 2 (9.1%) | 0.086 | 0.197 | 0.275 | 0 | 0 |
| r05 | 1930-2036 | 273 | 49.8 | 55.5 | 61.1 | 2 (0.7%) | 36 (13.2%) | 0.330 | 0.438 | 0.526 | 0 | 39 (14.3%) |
| r06 | 1939-2030 | 419 | 53.0 | 59.3 | 65.5 | 14 (3.3%) | 95 (22.7%) | 0.417 | 0.486 | 0.600 | 2 (0.5%) | 93 (22.2%) |
| r07 | 1950-2026 | 404 | 53.1 | 61.4 | 69.2 | 36 (8.9%) | 110 (27.2%) | 0.404 | 0.469 | 0.561 | 1 (0.2%) | 76 (18.8%) |
| r08 | 1956-2039 | 464 | 51.4 | 56.9 | 62.7 | 8 (1.7%) | 68 (14.7%) | 0.400 | 0.456 | 0.530 | 1 (0.2%) | 72 (15.5%) |
| r09 | 1969-2027 | 285 | 49.2 | 54.5 | 58.1 | 1 (0.4%) | 15 (5.3%) | 0.377 | 0.432 | 0.528 | 0 | 41 (14.4%) |

On p13a no rival release reaches critic 70. Two reach 60, both r04's (2 of 8), and the highest reach is 0.422. On
p13a-wait-control-01, r01's five films have a critic median of 64.2: three reach 60 and one reaches 70. No release
there reaches 0.35.

### 2.5 Why v1 holds nobody

- **Critic 70** sits above seed-b's rival p95 (67.99). It admits 61 of 1,952 releases (3.1%) and none of p13a's 91.
  The best studio, r07, reaches 8.9%; a 25% floor asks for 2.8 times that.
- **Reach 0.90** sits above seed-b's rival p99 (0.741). It admits 4 of 1,952 releases (0.2%), so no share floor can
  find a pattern there. 1353-A :192 took 90 from the "pooled p90 reach" of the D-6 corpus (`tuning.ts:101-108`),
  which pooled two player agents' films; the rivals' p90 is 0.549.

## 3. The proposed values and their reasons

### 3.1 `LEGACY_CRITIC_ACCLAIM_MIN`: 70 to 60

- **Anchor.** 60 is the floor of the lot's critic reception band "hit" (`receptionVerdict.ts:34`,
  `CRITIC_BAND_THRESHOLDS.mixedBelow`), the band the lot snapshot and the bridge `reception` enum carry. The law keeps
  1353-A's method: it copies a shipped presentation boundary, so a presentation retune cannot move a Legacy.
- **Height.** On seed-b's rival pool, 60 sits between p83 (59.95) and p84 (60.46): 328 of 1,952 releases (16.8%). The
  D-6 corpus put 60 above its p90 (`tuning.ts:182-184`), so "acclaimed" still marks an upper tail for rivals and players.
- **Effect.** r07 (27.2%) and r06 (22.7%) clear the 20% floor; r08 (14.7%) and r05 (13.2%) do not.

### 3.2 `LEGACY_HIT_REACH_PERCENT`: 90 to 50

- **Anchor.** A hit grosses at least half of `baseMarketValue`. The law still compares one exact product,
  `100 × gross ≥ 50 × baseMarketValue` (law :618; 1353-A :155-156).
- **Height.** On seed-b's rival pool, 0.50 sits between p83 (0.4966) and p84 (0.5035): 321 of 1,952 releases (16.4%),
  the same height as the critic line.
- **Effect.** r06 (22.2%) clears the 20% floor. r07 (18.8%) falls 5 releases short, r08 (15.5%) 21 short.

### 3.3 `LEGACY_MIN_SHARE_PERCENT`: 25 to 20

- **Reason.** One release in five. Both lines admit about one rival release in six on seed-b (16.8% and 16.4%), so a
  20% floor asks a holder to beat the industry's rate by about a fifth (1.19 and 1.22 times). A share floor keeps
  volume from qualifying: a studio's count matters only up to the count floor.
- **Why it moves.** At 25%, `commercial-engine` finds a holder only at a hit line of 48 or lower (§4.2), which 20.2%
  of the pool reaches. Lines of equal height then sit near the pool's p80: critic 59 (19.4%) and 48% of
  `baseMarketValue`. There the critic line leaves its shipped anchor, and r06's commercial margin of 9 becomes a
  shortfall of 5 under the measured market factors (§6.1). At 20%, both lines sit on their anchors at about p83, the
  artistic margins grow to 11 and 29, and the shortfall under the factors shrinks to 1.
- **Shared.** `artistic-voice` and `commercial-engine` both read it (law :591, :623), and §4 counts both.

### 3.4 Kept values

- **`LEGACY_MIN_FILMS` 5.** The count floor still stops a short career from qualifying on a few films. Under a 20%
  share floor it binds below 25 releases. p13a-wait-control-01's r01 shows it working: three of its five films reach
  critic 60 (60%), and it does not hold.
- **`LEGACY_CRITIC_PAN_BELOW` 35.** The critic tier "pan" ceiling. It feeds only the contrary side (law :588); 63 of
  seed-b's 1,952 rival releases (3.2%) fall below it.
- **`LEGACY_FLOP_REACH_PERCENT` 30.** It feeds only the contrary side (law :620). 1353-A's reason, "a third of a hit",
  no longer holds at a hit line of 50. The new reason: 435 of seed-b's 1,952 rival releases (22.3%) gross below 30%
  of `baseMarketValue`, under the pool's p25 of 0.320. Keeping 30 also keeps the Wave 1 flop fixture valid (§7.3).

### 3.5 The pattern test

| Line, seed-b | Pool rate at the line | Floor | Floor ÷ pool rate | Holders' rates |
|---|---:|---:|---:|---|
| Critic ≥ 60 | 16.8% | 20% | 1.19 | r07 27.2%, r06 22.7% |
| 100 × gross ≥ 50 × `baseMarketValue` | 16.4% | 20% | 1.22 | r06 22.2% |

A holder's own share must clear the floor. On seed-b, where a studio's own share still clears 20%, the highest
ratios to the pool's rate are 2.15 for critic (r07 at 64) and 1.49 for hits (r06 at 52). r06's hit share never
exceeds 1.8 times the pool's rate at any line from 45% to 60% of `baseMarketValue`, and its own share falls from
37.5% to 10.0% across that range. v1's hit line asked for 2.5 times the D-6 corpus's rate, a 25% floor over its top
decile; the rival industry offers no commercial pattern that strong. The proposal asks for about 1.2 times the pool's
rate at both lines and keeps margins of 9 releases or more (§4.1).

### 3.6 Alternatives considered (seed-b; margins in releases)

| Option (critic / hit / share) | `artistic-voice` | `commercial-engine` | Why not chosen |
|---|---|---|---|
| v1: 70 / 90 / 25 | none | none | The gate fails |
| Keep critic 70, share 8 | r07 +3 | None at 90; all five of r05-r09 at 50 | The shared floor turns `commercial-engine` into volume |
| Newspaper "favorable" floor 55, share 20 | All five of r05-r09 | (a critic option only) | 33.9% of the pool reaches 55, above the floor |
| The pool's p90 lines, 64 / 55 / 20 | r07 +3 | none | `commercial-engine` stays unheld |
| Share kept at 25, lines at the pool's p80: 59 / 48 / 25 | r06 +6, r07 +19 | r06 +9 | Neither line sits on an anchor; r06 falls 5 short under the G1 factors |
| 60 / 49 / 20 | r06 +11, r07 +29 | r06 +15, r07 +3 | 49 has no anchor; it is the contingency in §6.1 |
| **1353-T: 60 / 50 / 20** | **r06 +11, r07 +29** | **r06 +9** | Proposed |

## 4. Expected holders per archetype per seed

### 4.1 The two retuned archetypes

A margin counts releases above (+) or below (−) the binding floor, max(`LEGACY_MIN_FILMS`, ⌈share × n ÷ 100⌉).

| Seed | v1 `artistic-voice` | v1 `commercial-engine` | 1353-T `artistic-voice` | 1353-T `commercial-engine` |
|---|---|---|---|---|
| p13a-core-causal-01 | 0/10 | 0/10 | 0/10; nearest r04, 2/8 (−3) | 0/10; no release reaches 0.50 |
| seed-b | 0/10 | 0/10 | **2/10: r06 95/419 (+11), r07 110/404 (+29)** | **1/10: r06 93/419 (+9)** |
| p13a-wait-control-01 | 0/10 | 0/10 | 0/10; nearest r01, 3/5 (−2) | 0/10; no release reaches 0.50 |

Under 1353-T, seed-b's other studios fall short: for `artistic-voice` r05 −19, r08 −25, r09 −42 and r01-r04 −3 to −6;
for `commercial-engine` r07 −5, r05 −16, r09 −16, r08 −21 and r01-r04 −5 to −6. The idle player holds nothing on any
seed.

### 4.2 Neighbourhood on seed-b

| Critic line | Share 20 | Share 25 |
|---|---|---|
| 58 | r06 +44, r07 +51, r08 +1 | r06 +23, r07 +31 |
| 59 | r06 +27, r07 +39 | r06 +6, r07 +19 |
| **60** | **r06 +11, r07 +29** | r07 +9 |
| 61 | r07 +23 | r07 +3 |
| 62 | r07 +16 | none |

| Hit line | Share 20 | Share 25 |
|---|---|---|
| 47 | r06 +42, r07 +19, r08 +11 | r06 +21 |
| 48 | r06 +30, r07 +7, r08 +4 | r06 +9 |
| 49 | r06 +15, r07 +3 | none |
| **50** | **r06 +9** | none |
| 51 | r06 +6 | none |
| 52 | r06 +2 | none |

At a 20% floor, `artistic-voice` keeps the same two holders at critic 59 and 60, and r06 holds `commercial-engine` at
every hit line from 47 to 52, alone from 50 up.

### 4.3 Every archetype, and the G-P prediction

| Archetype | p13a-core-causal-01 | seed-b | p13a-wait-control-01 | Source |
|---|---:|---:|---:|---|
| `artistic-voice` | 0 | 2 | 0 | §4.1 |
| `audience-institution` | 0 | 5 | 0 | 1359-X4; wait-control from the rows (law :595-611), and the script reproduces 0 and 5 on the other two seeds |
| `commercial-engine` | 0 | 1 | 0 | §4.1 |
| `technology-pioneer` | 1 | 5 | not measured | 1359-X4 |
| `talent-foundry` | 2 | 5 | not measured | 1359-X4 |
| `genre-specialist` | 4 | 3 | 0 | 1359-X4; on wait-control no studio has the 8 releases the rule needs |
| `resilient-survivor` | exempt | exempt | exempt | P15B absent |
| `awards-dynasty` | not evaluated | not evaluated | not evaluated | v1 and v2 alike |

G-P on the amended tree should read the two retuned rows exactly as above; a different count means the tree or this
record's reimplementation differs. Under 1359-F5's reading, no evaluated archetype is held by none in every seed, and
the idle player keeps "every studio" out of reach. Every manifest hash changes, since the definition string and the
qualifying refs change.

## 5. Effect on the other archetypes

The two shared keys are shared only between the two retuned archetypes. In `src`, `bridge` and `ui/src`, outside
`tuning.ts`, the changed keys appear only at these law lines:

| Key | Read at | Archetype |
|---|---|---|
| `LEGACY_CRITIC_ACCLAIM_MIN` | law :586 | `artistic-voice` |
| `LEGACY_MIN_FILMS` (unchanged) | law :591, :623 | `artistic-voice`, `commercial-engine` |
| `LEGACY_MIN_SHARE_PERCENT` | law :591, :623 | `artistic-voice`, `commercial-engine` |
| `LEGACY_HIT_REACH_PERCENT` | law :618 | `commercial-engine` |

`audience-institution`, `technology-pioneer`, `talent-foundry`, `genre-specialist`, `resilient-survivor` and
`awards-dynasty` keep their outcomes on every seed. No lens reads a changed key (law :711-755). The contrary counts of
both retuned archetypes stay as they are, since `LEGACY_CRITIC_PAN_BELOW` and `LEGACY_FLOP_REACH_PERCENT` keep their
values. The qualifying lists change: more releases qualify, and each list still shows at most 12 refs (law :580).

## 6. Caveats

### 6.1 No shared-market pressure in these grosses

P15A.1 Wave 2 has not landed, and the probe's guard refuses a `sharedMarket` root, so no gross here carries the
shared-market factor. 1357-A :259-260 records that pressure lowers grosses. 1355-G1 measured a factor for every
release on p13a-core-causal-01 and seed-b, open loop: seed-b's median is 0.976 and its p10 0.909 (1355-X4). The script
joins each `dist.json` release to its 1355-G1 row by id, checks that week and gross agree, and multiplies the gross
by the factor:

| Hit line, share 20, seed-b | Without the factors | With the factors |
|---|---|---|
| 48 | r06 +30, r07 +7, r08 +4 | r06 +16 |
| 49 | r06 +15, r07 +3 | r06 +6 |
| **50** | **r06 +9** | **none: r06 83/419 (−1)** |

The estimate is first order: in a closed loop, lower grosses would also change the rivals' later choices. Critic scores
carry no factor, so `artistic-voice` does not move. **Contingency:** if G-P runs on a tree with P15A.1 Wave 2 and finds
`commercial-engine` unheld, a hit line of 49 is the pre-computed answer; it keeps r06 by 6 on the factors and by 15
without them.

### 6.2 Thin samples on the p13a seeds

p13a's rivals stop filming within about five years of entry (1357-X; 1357-R), and wait-control's sooner, so the two
p13a seeds hold only 91 and 13 releases. No studio there can show a pattern under any count floor of 5 near these
lines: the most acclaimed rival has 2 releases at critic 60 on p13a and 3 on wait-control, and no release reaches
0.43 of `baseMarketValue`. A market factor only lowers a gross, so pressure cannot add a holder there either. The
calibration therefore rests on five careers on one seed. 1357-R ties the difference to seed-b's `baseMarketValue`,
about twice p13a's, which lets its rivals stay solvent. If Owner question 1357-Q1 changes the rival economy, G-P runs
again on that tree (1359-F5 ruling 4).

### 6.3 The player is unmeasured

The idle player releases nothing on these routes, so no player distribution backs these values. The only player
evidence is the D-6 corpus of two agents (`tuning.ts:95-108`, `:182-184`; `docs/rev4-open-questions.md:215-216`,
`:245-247`), which predates later economy rulings. It put critic 60 above its p90 and its median at 46.5. It put reach
0.90 at its p90, with the Random agent near 0.42 and the Oracle near 0.81 (their reach_norm of 0.47 and 0.9, times
the 0.9 scale).

- **`artistic-voice` at 60 / 20%** asks a player for about twice that corpus's top-decile rate, which takes a quality
  focus.
- **`commercial-engine` at 50 / 20%** sits between the two agents' typical reach. If players resemble that corpus, most
  who release five or more films may hold it.

The Owner playtest judges both (1353-A §5.5 heading; `tuning.ts:1037-1039`). The playtest brief should carry this
paragraph.

### 6.4 Thin margins

r06 holds `commercial-engine` by 9 releases (2.2 points of share) and `artistic-voice` by 11. Any change to the rival
economy can move either by that much, which is why every changed tree gets G-P again.

## 7. Landing: the lines that change

### 7.1 `src/core/tuning.ts`

| Line | Now | After 1353-T |
|---|---|---|
| 1036 | ``// P15C Legacy law `campaign-legacy/v1` (src/core/campaignLegacy.ts; charter 1353-A §5.5,`` | ``// P15C Legacy law `campaign-legacy/v2` (src/core/campaignLegacy.ts; charter 1353-A §5.5,`` |
| 1037 | `// adopted in 1353-F). PROVISIONAL TUNING under Owner rulings 5 and 6 of 1342-O, which` | `// adopted in 1353-F, amended by 1353-T). PROVISIONAL TUNING under Owner rulings 5 and 6 of 1342-O, which` (rewrap as needed) |
| 1042 | `LEGACY_CRITIC_ACCLAIM_MIN: 70, // positive integer; critic tier "strong" floor (receptionVerdict.ts), copied so a presentation retune cannot move a Legacy` | `LEGACY_CRITIC_ACCLAIM_MIN: 60, // positive integer; critic band "hit" floor (receptionVerdict.ts), copied so a presentation retune cannot move a Legacy (1353-T)` |
| 1046 | `LEGACY_MIN_SHARE_PERCENT: 25, // positive integer; one release in four, so volume alone cannot qualify` | `LEGACY_MIN_SHARE_PERCENT: 20, // positive integer; one release in five, above the rival rate at either line, so volume alone cannot qualify (1353-T)` |
| 1047 | `LEGACY_HIT_REACH_PERCENT: 90, // positive integer; a hit grosses at least 90% of baseMarketValue (pooled p90 reach)` | `LEGACY_HIT_REACH_PERCENT: 50, // positive integer; a hit grosses at least half of baseMarketValue, the rival pool's upper sixth (1353-T)` |
| 1048 | `LEGACY_FLOP_REACH_PERCENT: 30, // positive integer; a flop grosses below 30% of baseMarketValue, a third of a hit` | `LEGACY_FLOP_REACH_PERCENT: 30, // positive integer; a flop grosses below 30% of baseMarketValue, under the rival pool's lower quartile (1353-T)` |

Lines 1043-1045 and 1049-1056 stay. Every value stays a positive integer, the range `tuning-legacy-bounded-terms`
asserts.

### 7.2 The definition bump

`tuning.ts:1040-1041` says any change changes the law and bumps `CAMPAIGN_LEGACY_DEFINITION`. So law :72 becomes
`'campaign-legacy/v2'`, and the header at law :1 names v2. 1359-A :177-181 versions the validator by era: "A v2 adds
an entry and leaves v1 untouched." G-P gates Wave 2 production (1359-A §9), and v1's values fail it, so no save will
store a v1 manifest. **For the parent:** whether Wave 2's definitions table keeps a v1 entry that no save can carry.
1359-F's "Versioned by era" assumed v1 would ship.

### 7.3 Tests that pin v1

- **`tests/p15c1-campaign-legacy.test.ts` (Wave 1, landed).**
  - Pins to change: the title at :1; the restated literals at :313 (70), :317 (25) and :318 (90); the definition at
    :336; and the bounded-terms leaf at :1894 (70), :1898 (25) and :1899 (90).
  - Comments that restate v1 arithmetic: :382 (critic 80 against 70) and :629-630 and :642-643 (n = 20).
  - Fixtures that stay on their side of the new lines:
    - critic literals 10, 20, 50, 90 and 99, and the default of 50;
    - grosses 0, 500, 123,456 and `BMV` against a fixture `BMV` of 1,000,000;
    - `(HIT + 5)%` of `BMV`, which becomes 55%;
    - `(FLOP − 25)%`, which stays 5% because FLOP stays 30;
    - the exact-share leaf's n = 100 × 5 ÷ 20 = 25, a whole number.
- **The Wave 2 RED r5 (`E/1359-stage/1359-p15c-wave2-red-r5.patch`, in flight).** C11,
  `legacy-definition-era-guard` (:1715-1765), pins v1's fifteen literals (:1736-1741) and
  `CAMPAIGN_LEGACY_DEFINITION === 'campaign-legacy/v1'` as the live definition (:1754).
  `legacy-old-law-fixture-v1-validates-after-retune` (:1829) retunes from v1. With this amendment the live definition
  is v2, so C11's live pin and its table move before the recorded RED, on the parent's ruling under §7.2.

### 7.4 G-P again

The 1359-GP probe needs no change: it reads TUNING and the definition from the tree. Run it on a scratch tree with
§7.1 and §7.2 applied, on the seeds the parent names, and compare with §4.3.

## 8. Review checklist

1. **Reproduce.** Run `python3 /Users/zacheryspector/studio-scratch/1353-t/1353-T-holders.py`. It reads `dist.json`
   and the 1355-G1 output and writes nothing. Both `check:` lines must print, and the tables must match §2.2, §4 and
   §6.1.
2. **Data provenance.** Confirm the sha256 of `dist.json` and the probe (§2.1), `lawCheck: "pass"` with 102
   comparisons per seed, and the two manifest hashes equal to 1359-GP's.
3. **The rules.** Compare the script's `rule()` with law :586, :588, :591, :616-618, :620 and :623: the products
   `100a ≥ S × n` and `100 × gross ≥ P × baseMarketValue`, with grosses read only for settled releases.
4. **The anchors.** Check `receptionVerdict.ts:34` (critic band "hit" from 60), `tuning.ts:182-184` (D-6: 60 above
   about p90) and the pool heights in §3.1-§3.2.
5. **The pattern test.** On seed-b each share floor exceeds the pool's rate at its line (§3.5), and each holder's
   rate exceeds the floor. Judge whether a floor 1.2 times the pool's rate meets "a pattern, not volume".
6. **Other archetypes.** Grep the four keys in §5's table in `src`, `bridge` and `ui/src`; only law :586, :591, :618
   and :623 should read them, besides `tuning.ts`.
7. **Pressure.** Check the 1355-G1 join (the script asserts id, week and gross) and decide whether to take 49 now
   instead of holding it as the contingency (§6.1).
8. **The player.** Decide whether the playtest brief carries §6.3.
9. **Thin seeds.** Confirm that p13a and wait-control cannot hold either archetype near these lines (§6.2).
10. **Landing.** Check §7: the six `tuning.ts` lines, the bump to v2, the Wave 1 pins and comments, the fixtures
    that stay on their side, and the RED C11 consequence.
11. **Alternatives.** Check that §3.6's rows follow from §4.2 and §6.1.

## 9. Files

| File | sha256 |
|---|---|
| `/Users/zacheryspector/studio-scratch/1353-t/1353-T-holders.py` | `0e30cf395a907e3e8c467ffbb4ad67bcadaf134401b17fae25ff261796bad9ce` |
| `/Users/zacheryspector/studio-scratch/1353-t/1353-T-distributions-probe.ts` | `5d1c10e7b5cb624109cf67756f6a10da99e179e87710175fd6849401557d0bd4` |
| `/Users/zacheryspector/studio-scratch/1353-t/1353-T-probe-notes.md` | `798add0e91a0790cf17d38164b64b66db07b3126f56e03156eadc1ed22fe8f5d` |
| `/Users/zacheryspector/studio-scratch/p15-probes/out/dist.json` | `6ee10685d45d0f97fbee3d18a6c7b5ee1b55c5097d8e47ceea536fea0e27346c` |
