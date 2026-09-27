# 1106-B — Independent C failure and artifact review

Disposition: **KEEP the closed failure evidence; C is not qualified.** The first complete-authority comparison failure is detected at week 1352 after last qualified boundary 1300. The retained release history independently locates an earlier numerical difference in a film released at 1311 (observed on return at 1312). A bounded source correction and independent RED are needed; this review does not execute or authorize a rerun, relax equality, or modify production.

## Closed record and inventory

`1070-c3-endurance-c-recording-v1.json` closed child **1**, `fixedSource: true`, from **2026-09-27 04:31:47.568Z to 04:34:35.092Z**, **167.524s**. Both source guards identify `c362bab94678a21b8d9ecb98bed5d6635a664d27`, the empty consumed diff and no untracked consumed source. Revised producer `909e822e…`, original A baseline and completed B predecessor remain the pinned recording lineage. Guard and artifact failures are null; the failure is the actual complete-save identity mismatch.

C completed **1,352 attempts/ticks**, **247 commands/engine calls**, six creators, 29 commissions, 28 greenlights/releases, five set commands, 14 attachments, **26 successful read groups** and zero runtime samples. Its metadata reports last qualified week **1300**. The phase text `week1352/command246/slot-28-commission` retains the latest policy-command context; it is not evidence that commissioning caused the difference.

Independent data-only hashing checked every inventoried artifact and the exact six-file directory, totalling **5,991,725 bytes**:

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `metadata.json` | 1,127,977 | `f3bc8dd69ddba92b54fd76f42a8bb88c0f997c31031b3227ad4b65357038b4d0` |
| `authority-failure.json` | 3,799,064 | `f1a7a70941b1d2804efd9173359a72d78330284c968afa53a9fbad26ecda085a` |
| `checkpoints.jsonl` | 260,382 | `126ec59f486a544d46bf23bed244ec293076222044c4531239e059368f90aa60` |
| `commands.jsonl` | 79,582 | `5f269de5e712452af8a0d87fe3464f5c984266174920b606984181007114ebf2` |
| `failure.json` | 428 | `68a6c2418c5e1ab8d4050d37cd417682fbe45c775e1d3cd685cb3923dc109110` |
| `observations.jsonl` | 724,292 | `c6afcc2f16571bcabba532318e0d2221e2f63d7c489df3f0ad1a4d6c8d7db62d` |

The failure artifact explicitly separates a last-qualified Save38 JSON string from an **unvalidated observed state**. Independent data reconstruction verifies that the retained 1300 save is 1,658,932 UTF-8 bytes, SHA256 `da9b59ba6c453fa07c17560aa3001bbe9a9ce6ebb3d12695471b7fecbbd71d5d`, equal to A's checkpoint identity. All 40 roots reconstructed from the observed state match the failed 1352 checkpoint's recorded identities; reconstructing its canonical envelope also matches that detected hash. This checks captured evidence integrity, not runtime save admission or qualified replay of the observed state.

## Independent decoded and semantic comparisons

A separate file-only parser checked canonical complete JSONL rows, sequential unique focus definitions, immediate use, known references, no stranded definitions and physical/dictionary bounds. The **29 definitions**, **135,851 dictionary bytes** reconstruct **2,135 logical rows**, **1,969,518 bytes**, SHA256 `516184e6b1a695aaa7a5c50d53430207f335535241b9b4ad15685cf216af0bfd`. No prepared codec or project module was imported.

All **247 command semantic rows** match A's prefix exactly, excluding measured elapsed time. All **26 complete checkpoints at 0–1300** match A's complete-save and all 40-root identities. Their counts and focus values agree. At 1352, counts and focus value trees still agree; their object insertion order differs after actual loads, which is not itself the numerical mismatch.

The first failed canonical save is **1,718,093 bytes** in both runs: A `cd4b1891e567b479f329555f14a1773370b0f31fd081f11d5deb2862e8b28bee`, C `6b499ded1228bfbd7d427367f0a4a131679dcb1d53434360023a60052e14b6aa`. Exactly four root identities differ: **careerEvents, studio, studioHistory and talent**. The other 36 root identities, including RNG, market, promises, careerLifecycle and scriptDevelopment, match A exactly.

All retained semantic observation prefixes match A: **28 release observations, 26 cohort rows, 18 people-append rows, 283 lifecycle-boundary rows and 15 promise-feasibility rows**. The release observations record identities, dates and participants, not complete reception results, so their equality does not contradict the numerical film-result difference below. All 1,352 per-tick non-timing observations also agree. However, `tick-timing.rootsBefore` contains only three **counts** (`people`, `due`, `marketCases`), not complete root hashes. It cannot prove byte equality at each intervening week or identify the first state-value divergence.

The recorded **152 actual import replacements** follow the exact prescribed cadence: weeks 1–104 inclusive, then every 26 weeks through 1352. Each has a matching export timing; the actual producer checks strict Save38 admission and exact exported bytes at replacement. At the last boundary, the 1352 import occurs before the scheduled complete-save comparison. Prior equality at 1300, and recorded replacements at 1326/1352, do not prove the difference originated at either replacement.

All 26 completed read observations have PASS/null failure, matching A input and post-read authority identities, counts, privacy checks and schema checks. They contain **569 projection calls**. No 1352 read group runs after the failed checkpoint.

## Earliest retained numerical witness

Independent comparison of C's retained immutable prefixes with A's actual week-3120 authority finds the earliest changed film at index **27**, `prod-1303`, **Echoes of Frontier**, `releaseTick: 1311`; the driver records its actual release observation after the tick returns **1312**. Earlier retained film, career-event and studio-history prefixes agree. This establishes an earlier dated witness than detection at1352, not a full byte-level first-divergence proof for every intervening state.

Exactly **11 scalar differences** occur across those compared immutable prefixes:

| Field | A continuous value | C cadence value |
| --- | ---: | ---: |
| film27 `criticMean` | 66.97542585609143 | 66.97542585609145 |
| film27 `criticScore` | 52.82440066110527 | 52.82440066110529 |
| career events162–167 `criticScore` (six fields) | 52.82440066110527 | 52.82440066110529 |
| career event163 `genreExpAfter` | 23.524533073458816 | 23.52453307345882 |
| career event165 `genreExpAfter` | 30.871050511056783 | 30.871050511056787 |
| studio history87 `facts.criticScore` | 52.82440066110527 | 52.82440066110529 |

All other fields in those compared prefixes agree, including participants, sampled review variance and the stored forecast for this film. The two changed genre-experience values are actual downstream growth facts; the defect must not be labelled purely cosmetic or history-only. Current talent is not directly compared with A3120 talent as though ages and later development were unchanged.

## Source explanation and bounded next proof

`worldgen.ts:118–128` explicitly declares the canonical force sequence **escapism, patriotism, realism, darkness, optimism, spectacle**, and `generateMarket` builds that insertion order. Both `reception.ts:393` and `forecast.ts:218` currently accumulate force weights and aligned contributions using `Object.keys(forces)`. Canonical JSON loading can change record insertion order while preserving every mathematical input value; floating addition order can therefore change the least significant bits.

There is an existing source precedent: `hollywoodTick.ts:36–40` reconstructs `industryMarket` in the declared FORCE_ORDER specifically to prevent load/key-order accumulation drift, and its rival forecast/reception callers use that adapter. The shared player arithmetic remains exposed. This is a concrete, source-supported causal hypothesis consistent with the observed critic-mean/score and propagated growth differences. The already retained bytes alone do not execute an order-permutation proof or exclude every other arithmetic path.

The narrow next contract can retain the exact established FORCE_ORDER, move its owner to tuning with the existing worldgen import/re-export preserved, and use that order in both shared sums. Independent nonuniform-force permutation RED and a bounded genuine 1300-through-release route should prove the cause and preserve the continuous A result. No sorting of game law, float tolerance, rounding, root normalization, historic result rewrite or altered expected digest is justified. Forecast's identical stored value in this observed film remains a passed fact; its order-sensitive source is a necessary companion seam, not an invented second observed failure.

**Final disposition: C FAIL preserved; bounded attribution KEEP.** D remains pending. A/B retain their actual original-source qualifications. Any changed-source endurance continuation requires an explicit precise lineage amendment and full stated comparisons; no original producer/source identity may be silently reused or described as four same-source qualified variants. The separate 1107 contract and independent source/test reviews govern further work.
