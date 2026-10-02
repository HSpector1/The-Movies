# 1359-X4: the P15C Wave 2 measurement probe G-P, run at HEAD 975e72a1

[1359-A](1359-A-p15c-wave2-charter.md) §9 gates P15C Wave 2 production on G-P: "An evaluated archetype held by every
studio in every seed, or by none in any seed, returns §5.5 of 1353-A to retuning."

**Result: two archetypes trigger the retune.** `artistic-voice` and `commercial-engine` are evaluated and held by no
studio on either seed. Under the second reading of "none in any seed", `audience-institution` also triggers: it is
held on seed-b (5 of 10) but by nobody on p13a. No adapter or law refusal occurred after the disclosed F1 bridge.

## How it ran

- **Probe.** [1359-GP-probe.ts](1359-stage/gp/1359-GP-probe.ts) (sha256 f0f0c0f6…), written by an agent for this
  gate, with notes in [1359-GP-notes.md](1359-stage/gp/1359-GP-notes.md).
  - It ticks `p13aGeneratedStudio(seed)` to week 6240.
  - It runs 1359-A §3's adapter inline (Wave 2 production has not landed it) into the landed law
    `campaign-legacy/v1`.
  - It writes one JSON document to stdout and nothing to disk.
  - It matches the reference adapter (`1359-p15c-wave2-reference-r3.patch` :344-467) on every branch it implements.
- **The F1 bridge, disclosed.**
  - The landed law refuses an authored film's null `settledWeek` (`src/core/campaignLegacy.ts:351`), which 1359-F2 F1
    relaxes only in Wave 2 production.
  - The probe records the refusal, prints an `F1 BRIDGE` line, and reruns the law on a copy where the 8 authored films
    read `settledWeek` 0.
  - It stops by name unless the same copy with 6239 gives identical bytes. The law reads that field only in the
    refusing check.
- **Tree.** An archive of 975e72a1 (`src` equals b0809602's), no patch, `node_modules` linked, Node v20.20.2.
- **Seeds.** p13a-core-causal-01 and seed-b. The charter names none. 1355-A :173 names these two routes, and 1357-A
  :256-257 runs them through `p13aGeneratedStudio`.
- **Lane.** Alone under `HEAVY-LANE-LOCK`, on 2026-10-01 CDT:
  - a 20-week smoke from 23:14:42 to 23:14:46;
  - the full run from 23:14:58 to 23:22:25, exit 0
  ([runs.meta](1359-stage/gp/runs.meta), [run-probe.sh](1359-stage/gp/run-probe.sh)).
- **Outputs:** [1359-GP-output.json](1359-stage/gp/1359-GP-output.json) (124,706 bytes, sha256 37043956…) and
  [1359-GP-progress.txt](1359-stage/gp/1359-GP-progress.txt).

## Per seed

| Read-out | p13a-core-causal-01 | seed-b |
|---|---|---|
| Route to 6240 | 87.8 s (14.1 ms per tick) | 355.8 s |
| Adapter refusals; law refusal | none; none | none; none |
| F1 stand-in films | 8 | 8 |
| Freeze: adapter, law, total | 2, 13, 15 ms | 10, 35, 45 ms |
| Manifest bytes | 35,014 | 55,015 |
| Domain table | seven array domains `complete`; `powerRanking`, `corporateCondition` and `marketAssessments` `notRecorded` | the same |

**Holders per archetype** (10 studios per seed: the idle player and nine rivals):

| Archetype | Status | p13a | seed-b | Retune (none in every seed) | Retune (none in some seed) |
|---|---|---:|---:|---|---|
| `artistic-voice` | evaluated | 0 | 0 | **yes** | yes |
| `audience-institution` | evaluated | 0 | 5 | no | **yes** |
| `commercial-engine` | evaluated | 0 | 0 | **yes** | yes |
| `technology-pioneer` | evaluated | 1 | 5 | no | no |
| `talent-foundry` | evaluated | 2 | 5 | no | no |
| `genre-specialist` | evaluated | 4 | 3 | no | no |
| `resilient-survivor` | exempt (P15B absent) | 0 | 0 | no | no |
| `awards-dynasty` | not evaluated | 0 | 0 | no | no |

No archetype is held by every studio, because the idle player holds nothing on either seed.

## Why the two archetypes go unheld

The manifests record each studio's qualifying and contrary counts. Against the §5.5 rules (1353-A :160, :162; landed
values `src/core/tuning.ts:1042-1048`):

- **`artistic-voice`** needs `a ≥ 5` and `a ≥ 25%` of releases, where `a` counts releases with critic ≥ 70.
  - seed-b's prolific late entrants qualify by count but not by share. r07 holds 36 acclaimed of 404 releases, 8.9%.
    r06 holds 14 of 419.
  - p13a's rivals have no acclaimed release at all; they made 2-15 films each.
- **`commercial-engine`** needs `h ≥ 5` and `h ≥ 25%` of settled releases, where a hit grosses at least 90% of
  `baseMarketValue`.
  - No studio on either seed has more than 2 hits. The five thriving seed-b rivals made 273-464 films each, with 0-2
    hits and 16-125 flops.
- **`audience-institution`:** the five thriving seed-b rivals hold it, with 7-10 qualifying entries each. On p13a no
  rival has more than one qualifying entry.

## Context

p13a's rivals stop filming 3-7 years after entry ([1357-X](1357-X-p15b-wave2-probe-results.md),
[1357-R](1357-R-rival-stall-diagnosis.md)), so its holders reflect that collapse. seed-b's five late entrants thrive
and still hold neither archetype, so the two triggers do not come from the collapse alone.

## Next

The parent's response is [1359-F5](1359-F5-parent-response-to-1359-X4.md).
