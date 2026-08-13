# Facilities & Construction Research Evidence

Status: research evidence complete; no production construction behavior authorized

Date: 2026-08-13

Authority: [Facilities & Construction Research Contract](./FACILITIES-CONSTRUCTION-RESEARCH-CONTRACT.md)

## Decision headline

The retained evidence supports all three frozen capacity findings at the current operating scale:

- **H1 supported:** Development & Casting is the only current capability with observed unmet demand.
- **H2 supported:** one additional shared Development & Casting slot materially reduces real rejected
  workflow attempts. The bounded V1 asset is one **non-stackable Development & Casting Annex**.
- **H3 supported at the current demand boundary:** soundstage, scenery, and post show no rejected work
  or production holds. They do not justify construction choices now.

The timing sensitivity selects a **13-week construction clock** as the longest tested clock that
retains a meaningful ordinary-player use case. The direct third-to-fourth-slot sensitivity finds a
real fourth-slot marginal only for the most aggressive scaled policy. That marginal belongs to a
future studio scale tier; it does not justify a repeatable V1 Annex menu.

The full cost grid selects **$780,000 capex, 13 weeks, and $0 marginal weekly opex** for a bounded
implementation contract. This is a transparent initial game calibration, not a bill of materials,
guaranteed return, or macroeconomic sink. Zero marginal opex means only that the current game has no
new attributable worker, utility, site service, or other operating resource to charge. It is not a
claim that a richer future facility system must remain free to operate.

## Corpus and provenance

### Primary capacity corpus

- Observer schema: `facilities-observer-v1`.
- Source commit: `76ac00abae30e6b95349c8a5e1c437aa74f0c8bb`.
- Source tree: `dba18410e283851da551a1603653448b3e7a3347`.
- Source state: `worktreeDirty: false` in every row.
- Runtime: Node `v26.3.1`; SaveFileV10; managed operations.
- Corpus: 25 seeds × 3 policies × 2 arms = 150 runs / 75 pairs through visible Week 260.
- Raw rows: 142,474 total: 39,150 weekly, 102,349 intent, 600 staffing, and 375 shadow.
- Every arm contains Weeks 0–259 as measured intervals, the Week-260 arrival, and exactly four
  Week-208 staffing-boundary rows.
- The paired arms share initial-save and initial-state hashes for all 75 seed/policy bases.
- Maximum absolute cash-reconciliation error is `5.960464477539063e-8`; there are no failures above
  `1e-6`.
- Calendar occupancy, idle-capacity, owner-union, payroll-window, and overhead-window reconciliation
  have zero mismatches.
- All 375 one-boundary shadows test the exact rejected Development & Casting action, consume no RNG
  during configuration, and admit that action.

### Timing and fourth-slot corpus

- Observer schema: `facilities-observer-v2`.
- Source commit: `ccb243f218dfce1c83e8d069f05d9e0d6e4d44af`.
- Source tree: `5a0daf2f8390cb2e05d9a2ac15482bb066b53a67`.
- Source state: `worktreeDirty: false` in every row.
- Runtime and operating identity remain Node `v26.3.1`, SaveFileV10, managed operations,
  `MAX_CONCURRENT_PRODUCTIONS = 2`, and the authoritative eight-week production allocation law.
- Each timing corpus contains 25 seeds × 3 policies × 2 arms = 150 runs / 75 pairs through Week 260.
- The fourth-slot corpus contains current, +1, and +2 arms for the same 75 seed/policy bases: 214,080
  reconciled rows.
- No intent, behavior, or RNG divergence occurs before the configured availability week. Whenever
  the added slot is occupied, the original two-slot Development & Casting building is already full.

### Artifact identities

| Corpus | Rows | `rows.jsonl` SHA-256 | `summary.json` SHA-256 | `summary.md` SHA-256 |
| --- | ---: | --- | --- | --- |
| primary +1 | 142,474 | `c5c4a8654b46b234cd677f1c5de2504bde048a9c34a825c0fbc43e6bfd798917` | `ba59c51e9b3d872aff9d4226c76048e647b49fdf80587b5e02a7a7fe83a56745` | `a9cd2bf7bf54fc61e238d54b9f0997a5078c88e2b87363334406e7e87e2c2f6a` |
| +1 at Week 1 | 142,267 | `724de3cd835331662b7d0eb24fcf14c32eefa163bfca38ed8c328c143bf51a81` | `38c3c4fadac9e38b0c9dfb492f4700aa03cc703e31e44ca230290f42e7b14258` | `2bee1f7915d5703aafbb70f329bbbb69a7ba83fc5c4619d5b6390721f3e590e5` |
| +1 at Week 8 | 142,663 | `af88a57f05772a35b9db84e6735ae48d6a14f11f4f7e66cb847f92b42f3f824f` | `2ab44152b22e207cc0b2a32a2fd64a0df9fbbb267f94dd3138da97bb555d1c45` | `8c6b4c121c02d855ec3ec84945345195d05682a890a580f2f561b5ed02734a4a` |
| +1 at Week 13 | 142,560 | `67879f793965930b1a180f5cea5d395245ec783736930efc2007ed45a25f61d8` | `b1a65f2423657d3567ef4a953ecb02f5a1050125dfc828c3187f1244f52b7403` | `545bf1df8f423408e2c7e1a090cc066a3c307704ca5ed818c36f7046674789f4` |
| +1 at Week 26 | 142,573 | `b0c7b9af56afe0648cccd8248e9cb6b75aa4ebf06b6ba85697799d1859519e24` | `14110246e31f14a884ecf94bc2de160ce6f59515ba9ac057a1cd49d7dd3bc4a3` | `46539cb61b4d41820d06b3fcd618961034d6f3118fa2da0f0551054f91e45939` |
| +2 / fourth-slot | 214,080 | `992dd682e26d02d03bba90393b14a1832fd21f998de0901e4a1e1b11ecc80e0e` | `2ab0766b1142fcbcb85215c70300f49c2916ed8f1ace96ff1c82dcd8103e2bb5` | `a6342967809aec32acf30e7f3238327e5dc2c005b0c719225c85cc309235852e` |

The ignored primary corpus and the selected Week-13 corpus were independently rerun. For each, all
three files passed byte comparison:

```bash
cmp -s <artifact>/rows.jsonl <rerun>/rows.jsonl
cmp -s <artifact>/summary.json <rerun>/summary.json
cmp -s <artifact>/summary.md <rerun>/summary.md
shasum -a 256 <artifact>/*
```

This replay proves deterministic artifact generation. The long-running capacity arms may still
diverge in ordinary reception RNG after different admitted work changes later release order; the
one-boundary shadows, not long-run cash deltas, carry the clean marginal-capacity claim.

## H1 — organic bottleneck

H1 is supported.

| Policy | Current D&C rejection attempts | Per-seed median [min, max] | Other-capability rejections |
| --- | ---: | ---: | ---: |
| direct-package | 0 | 0 [0, 0] | 0 |
| development-casting | 145 | 6 [4, 8] | 0 |
| scaled-two-team | 230 | 8 [5, 23] | 0 |

The rejection categories are exact:

- Development/casting: 123 screenplay commissions and 22 casting sessions.
- Scaled two-team: 209 screenplay commissions and 21 casting sessions.
- No rewrite or production-transition rejection occurred.

This is burst contention, not a utilization headline. Development/casting occupies 1,147 of 13,000
available current-arm D&C slot-weeks and is full for 479 of 6,500 studio-weeks. Scaled two-team
occupies 2,453 of 13,000 and is full for 1,031 studio-weeks. Direct-package is full for 469 weeks but
has zero rejected intent. That null control demonstrates why saturation alone is not bottleneck
evidence.

### Retry exposure is not unique lost work

The 145 and 230 values are controller retry attempts, not counts of permanently lost projects or
unique player decisions:

- Development/casting: 145 attempts represent 71 seed-local owner identities—50 screenplay
  concepts and 21 casting projects.
- Scaled two-team: 230 attempts represent 115 seed-local owner identities—95 concepts and 20
  casting projects.
- Every blocked owner identity eventually succeeds in its current arm.

The measured value is therefore shorter workflow friction and earlier admission, not rescue of 375
films that would otherwise vanish. The same retry-versus-owner distinction applies to the timing and
Week-208 renewal totals below.

## H2 — the third slot

H2 is strongly supported at the exact decision boundary.

| Policy | Current rejections | Immediate +1 | Reduction | Per-pair result |
| --- | ---: | ---: | ---: | --- |
| direct-package | 0 | 0 | 0 | 25/25 unchanged |
| development-casting | 145 | 7 | 138 / 95.17% | all 25 improve; median 6 fewer, range 3–8 |
| scaled-two-team | 230 | 69 | 161 / 70.00% | all 25 improve; median 6 fewer, range 1–21 |
| development policies combined | 375 | 76 | 299 / 79.73% | 50/50 pairs improve |

All 375 current rejection boundaries admit the exact attempted action in a one-slot shadow. The
immediate arm uses its third slot for 78 development/casting slot-weeks and 288 scaled slot-weeks;
the direct-package control never uses it. That makes one extra shared slot the smallest proven
capacity increment.

The long-run results do not prove profit or throughput:

| Policy | Release delta median [min, max] | Signs − / 0 / + | Cash delta median [min, max] | Signs − / 0 / + |
| --- | ---: | ---: | ---: | ---: |
| direct-package | 0 [0, 0] | 0 / 25 / 0 | $0 [$0, $0] | 0 / 25 / 0 |
| development-casting | 0 [−10, 13] | 8 / 10 / 7 | −$294,774 [−$13.324m, $16.692m] | 13 / 2 / 10 |
| scaled-two-team | −1 [−13, 13] | 13 / 5 / 7 | $981,278 [−$7.315m, $20.493m] | 10 / 0 / 15 |

Those outcomes occur after policy and RNG feedback. They cannot price the Annex, promise more
releases, or establish a return on investment.

## Construction timing matrix

The v2 timing study makes the additional slot operational at the start of the named week and proves
identical current/counterfactual behavior before that boundary.

| Operational week | Development after opening | Scaled after opening | Attempts removed | Added-slot use | Runs using slot |
| ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 120 → 4 | 205 → 89 | 232 | 280 slot-weeks | development 25/25; scaled 25/25 |
| 8 | 22 → 5 | 82 → 9 | 90 | 81 slot-weeks | development 10/25; scaled 23/25 |
| **13** | **19 → 5** | **56 → 4** | **66** | **62 slot-weeks** | **development 10/25; scaled 16/25** |
| 26 | 5 → 0 | 41 → 4 | 42 | 34 slot-weeks | development 3/25; scaled 11/25 |

The full exposure before each availability week is identical between paired arms. For example, the
Week-13 pair has 126/126 pre-opening attempts in development/casting and 174/174 in scaled two-team;
only the inclusive Week-13-and-later interval changes.

Week 13 is the longest defensible tested construction clock:

- it retains 66 removed retry attempts and 62 genuinely occupied added-slot weeks;
- it still produces use in 26 of the 50 development-policy runs;
- its ownership is narrow and intelligible: 14 casting slot-weeks in development/casting, plus 35
  script and 13 casting slot-weeks in scaled two-team; and
- Week 26 is boundary-sensitive: both policy medians are zero improvement, and only 14 of 50 runs
  use the slot.

Week 8 preserves more contention relief, but Week 13 supplies the longer visible capital-project
clock while retaining measured value. It therefore supersedes Week 8 for the bounded candidate.
No timing corpus has a production hold, and every timing-arm median release delta is zero. The clock
does not authorize a faster-film or profit promise.

## Direct third-to-fourth-slot marginal

The fourth slot was tested directly as the same-seed +1-to-+2 marginal at Week 1.

| Policy | +1 rejections | +2 rejections | Fourth-slot result |
| --- | ---: | ---: | --- |
| direct-package | 0 | 0 | Never used; no outcome changes. |
| development-casting | 29 | 25 | Four retry attempts removed in four seeds; no script, casting, greenlight, release, total D&C occupancy, or cash change. |
| scaled-two-team | 114 | 28 | 86 attempts removed; all 25 pairs improve; fourth slot used for 78 slot-weeks across all seeds. |

The scaled fourth-slot result is real, but it is not stable downstream evidence. Its release delta
has median −1, range −22 to 19, and signs 14 negative / 3 zero / 8 positive. Its cash delta has
median +$1.311m, range −$13.985m to +$17.922m, and signs 8 negative / 2 zero / 15 positive.

Ruling: V1 may add one non-stackable Annex only. A fourth D&C slot remains a measured candidate for a
future scaled-studio tier after that tier has authoritative demand and economics. It is not a V1
repeat purchase.

## H3 — no other current capacity demand

H3 is supported at the present production ceiling:

- zero soundstage rejection attempts;
- zero scenery rejection attempts;
- zero post rejection attempts; and
- zero production hold-weeks or unique held studio-weeks in all primary and timing arms.

The scaled current runs do occasionally saturate these facilities—49 total soundstage full weeks and
12 each for scenery and post—but saturation creates no rejected action or hold. The research did not
run optional +soundstage, +scenery, or +post structural arms because there was no unmet boundary to
admit. The scoped result is **no observed current operating demand**, not a claim that future
production tiers can never need those facilities.

## Week-208 staffing separation

The Week-208 roster wall remains a separate open system. The primary corpus reports it independently:

| Policy / arm, 25 runs | Initial cohort | Retained at 208 | Released at 208 | Rejected renewal retry attempts | Aggregate weekly payroll drop |
| --- | ---: | ---: | ---: | ---: | ---: |
| direct current / +1, each | 175 | 74 | 101 | 1,212 | $420,090 |
| development current | 200 | 192 | 8 | 96 | $28,317 |
| development +1 | 200 | 184 | 16 | 192 | $76,954 |
| scaled current | 325 | 65 | 260 | 3,120 | $1,449,157 |
| scaled +1 | 325 | 104 | 221 | 2,652 | $1,207,733 |

Renewal totals are weekly retries through expiry, not unique contract owners. For example, one
fully rejected 13-person scaled cohort produces `13 × 12 = 156` rejected attempts. Across the
separate 12-week pre- and post-expiry windows, facility-capacity blocked intents are zero and D&C
occupancy around the wall is effectively zero. Retention differences between long-running capacity
arms follow already-diverged cash and policy histories; they are not evidence that an Annex repairs
the synchronized roster wall.

## Candidate economic scales

The economic grid uses named repository scales and selected-corpus observations:

- opening cash: $20,000,000;
- 1,009 accepted current-arm greenlights;
- accepted film commitment: median $3,013,337.98875, range $2,007,259.91875–$4,695,563.58;
- `OVERHEAD_BASE`: $15,000/week;
- `OVERHEAD_PER_EMPLOYEE`: $1,500/week;
- opening weekly burn median across all policies: $65,378;
- scaled opening weekly burn median: $108,673; and
- Week-13 current-arm cash median: $16,550,434.73, range $12,557,949.79–$21,702,878.09.

The capex candidates are deliberately simple multiples of the existing base-overhead scale:

| Capex | Named anchor | Opening cash | Median accepted film |
| ---: | --- | ---: | ---: |
| $390,000 | 26 × $15,000 | 1.95% | 12.94% |
| **$780,000** | **52 × $15,000** | **3.90%** | **25.89%** |
| $1,560,000 | 104 × $15,000 | 7.80% | 51.77% |
| $3,120,000 | 208 × $15,000 | 15.60% | 103.54% |

The opex candidates are $0, $1,500/week, and $15,000/week, annualizing to $0, $78,000,
and $780,000. The two positive values are sensitivities only: no facility employee or second base
studio currently exists to make either charge attributable.

## Full 36-tuple candidate grid

Every Cartesian tuple of four capex values, three completion weeks, and three weekly opex values is
listed below. A positive-opex tuple is rejected regardless of its other axes because it invents an
operating resource. Week-26 zero-opex tuples are rejected as late and boundary-sensitive.

| Capex | Complete | $0/week | $1,500/week | $15,000/week |
| ---: | ---: | --- | --- | --- |
| $390,000 | Week 8 | **REJECT — too-light capital signal** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| $390,000 | Week 13 | **REJECT — too-light capital signal** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| $390,000 | Week 26 | **REJECT — late/boundary-sensitive** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| $780,000 | Week 8 | **REJECT — superseded by longer useful clock** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| **$780,000** | **Week 13** | **SELECT — bounded V1 calibration** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| $780,000 | Week 26 | **REJECT — late/boundary-sensitive** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| $1,560,000 | Week 8 | **REJECT — unjustified premium** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| $1,560,000 | Week 13 | **REJECT — unjustified premium** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| $1,560,000 | Week 26 | **REJECT — late/boundary-sensitive** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| $3,120,000 | Week 8 | **REJECT — unjustified premium** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| $3,120,000 | Week 13 | **REJECT — unjustified premium** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |
| $3,120,000 | Week 26 | **REJECT — late/boundary-sensitive** | **REJECT — unsupported opex** | **REJECT — unsupported opex** |

The selected $780,000 is 52 current base-overhead weeks, 3.90% of opening cash, and 25.89% of the
corpus-median accepted film commitment. It signals a capital decision without equaling another
ordinary film. $390,000 is too light for the sole lot expansion; $1.56m and $3.12m charge an
unsupported premium for the identical one-slot effect. This relative-scale selection is explicit
calibration uncertainty—not physical construction-cost evidence.

Measured avoided production-hold cost is exactly $0 because there are no production holds.
Break-even from avoided holds is therefore undefined, and long-run paired cash cannot replace it.
The selected tuple has no guaranteed payback and may not be presented as one.

## Review and verification record

- The final v1 observatory rereview reported no remaining P1–P3 findings after root-discovery,
  structured-hold, exposure-deduplication, and per-pair distribution repairs.
- Focused observatory verification passed 15/15 tests with TypeScript and diff checks.
- The v2 sensitivity core and statistical rereviews reported no remaining P1–P3 findings after
  delayed-exposure labels, direct +1-to-+2 marginal reporting, and shadow-configuration identity
  were corrected; 19/19 focused tests and TypeScript passed.
- Independent primary, timing, and fourth-slot audits reconciled raw rows and upheld the causal
  interpretation boundary.
- The earlier player review correctly withheld implementation on timing, cost, fourth-slot, and
  physical-identity grounds. Timing, cost, and fourth-slot evidence are now supplied. Physical
  identity remains a required acceptance property of the separate implementation contract; no
  production asset exists yet.

## Economic and scope boundary

D-17B remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the Week-208 synchronized roster wall, P5 dominance,
world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal G12
timing remain open.

The Annex is not financing, rescue, a bailout, a restructuring mechanism, a failure ladder, or an
arbitrary cash sink. This evidence does not authorize construction behavior, SaveFileV11, actions,
ledger kinds, recap buckets, a parcel lifecycle, UI, art, or any production constant. It authorizes
one bounded implementation contract to specify and prove those surfaces without changing the
accepted D-17B economy.
