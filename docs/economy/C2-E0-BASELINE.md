# C2 — E0 Economy Baseline (charter §9 gate E0)

**This is the pre-C2 baseline every later E-gate diffs against.** E1 (post-catalog),
E2 (post-throughput), E3 (post-Flip) and E4 (seal) each re-derive their figures and
compare them to the numbers recorded here. A movement in any figure below that C2 did
not *intend* is a defect, not a new measurement — that is the whole point of taking the
baseline before the first `src/core/` change lands.

Nothing was tuned and nothing was fixed to produce this record. No tuning constant, no
engine source and no script was changed by this lane.

## Provenance

| Fact | Value |
| --- | --- |
| Baseline HEAD | `6da574337be7aee4add2184e4f5d21e4e20f3ccc` |
| Branch | `c2a-implementation` |
| Worktree | `/Users/bruce/The Movies - C2 Implementation` |
| Generating command | `node_modules/.bin/vite-node scripts/measure-c1-economy.mts` |
| Script state | **unchanged** — re-pinned exactly as C1 sealed it (charter §9: "re-pin the C1 script unchanged") |
| Exit code | 0 · wrote 17,855 bytes |
| Root typecheck | `npx tsc --noEmit -p tsconfig.json` → clean |

The C1 artifact this re-pin reproduces is `docs/economy/C1-ECONOMY-SNAPSHOT.md`,
originally generated at HEAD `c1e7cb09dfec819e019f8eaa69ecd74ec8714d65`.

## 1. The re-pin result — what moved

**Every measured economic figure reproduced byte-identically. Only the two provenance
lines moved.** The complete diff of the regenerated artifact against the committed one:

```diff
-| Generated at HEAD | `c1e7cb09dfec819e019f8eaa69ecd74ec8714d65` |
-| Last commit touching `src/` or `ui/src/` | `63339cdb42ee59d58d9553b2b29e5978f4dfdbfb` |
+| Generated at HEAD | `6da574337be7aee4add2184e4f5d21e4e20f3ccc` |
+| Last commit touching `src/` or `ui/src/` | `d95d6a6c95e7dc569016e96197beee73fb5f5942` |
```

2 insertions, 2 deletions, in a 227-line artifact. Sections §1 through §7 — every
table, every dollar, every share, every flag — are unchanged.

**On the artifact itself:** the regeneration was performed and the diff reviewed, then
`docs/economy/C1-ECONOMY-SNAPSHOT.md` was restored byte-for-byte to its committed state,
because this lane's ownership is *additions* to `docs/economy/**`. The C1 artifact
therefore still carries the `c1e7cb09` provenance stamp, and the complete delta is
preserved verbatim above rather than in that file. Re-stamping it is a one-line decision
for the integrator; E1 re-stamps it anyway, since `measure-c2-economy.mts` extends the C1
script and regenerates the C1 sections.

### Is that expected? Yes, and here is why

The C1 script's own honesty clause says a run at a later HEAD "differs only in that
first provenance line unless the economy itself moved"
(`scripts/measure-c1-economy.mts:31-33`). The second provenance line is the one to read,
and it *did* move. Main advanced **18 commits touching `src/` or `ui/src/`** between the
two provenance points. Their composition explains the null result exactly:

| Movement | Commits | Touches economy arithmetic? |
| --- | --- | --- |
| PF1 presentation floor (audio service, motion/punctuation, commercial shell, topbar compaction, red-team pins) | 12 | No — UI/presentation only |
| C1-M8 facility catalog repairs | 6 | No — placement/refusal legality and catalog ordering, not pricing |

Only 3 of the 18 commits touch `src/core/` at all (`f693324`, `3f829db`, `fb11401`), and
all three are C1-M8 rulings about
*which* building may be placed on *which* ground and what a quote may promise — refusal
predicates, not prices, opex, or reception. `src/core/tuning.ts` is **byte-unchanged**
between the two provenance points:

```
git diff --stat 63339cdb d95d6a6c -- src/core/tuning.ts   →  (empty)
```

So the expected result was "no figure moves", and no figure moved. E0 passes.

## 2. The baseline figures

Copied from the artifact regenerated at this HEAD. Direct-measurement seed
`c1-economy-001`; capacity study over seeds `c1-economy-001` … `005`, 104 weeks per arm.

### 2.1 The slate, one blueprint at a time (figure 1)

| Blueprint | Capital | Weeks to open | Weekly opex (ledger) | Refund | Refund / capital |
| --- | --- | --- | --- | --- | --- |
| Development & Casting Annex | $780,000 | 13 | $3,500 | $390,000 | 50.0% |
| Development & Casting Hall | $1,400,000 | 20 | $6,000 | $700,000 | 50.0% |
| Development Office II | $600,000 | 8 | $2,500 | $300,000 | 50.0% |
| Development Office III | $1,200,000 | 12 | $4,000 | $600,000 | 50.0% |
| Craft Services Annex | $400,000 | 6 | $2,000 | $200,000 | 50.0% |

Every capital debit equals its catalog price and its single `constructionCapex` ledger
row; every refund matches its `facilityDemolitionRefund` row; every measured build clock
equals its quote. Refund ratio is 50.0% across the whole slate.

### 2.2 Founding vs built out (figures 2 and 4)

| Fact | Founding | Built out |
| --- | --- | --- |
| Placed facilities | 0 | 5 |
| Weekly facility opex — projection | $0 | $18,000 |
| Weekly facility opex — ledger | $0 | $18,000 |
| Capital committed | $0 | $4,380,000 |
| Cash | $20,000,000 | $13,545,857 |
| Week the estate was complete | Week 0 | Week 20 |

Projection and ledger agree. Full demolition recovers $2,190,000 of $4,380,000 (50.0%).

### 2.3 Weekly outflow composition at Week 20 (figure 3)

| Ledger kind | Outflow | Share |
| --- | --- | --- |
| `facilityOpex` | $18,000 | 16.1% |
| `overhead` | $27,000 | 24.1% |
| `payroll` | $66,983 | 59.8% |
| **Total** | **$111,983** | 100% |

This four-row table is the single most reusable figure in the C1 snapshot and the
template R2 extends at every C2 estate size.

### 2.4 Development Office uplift, A/B on one seed

All three arms aligned on Week 20, same concept, writer, shape, promise and budget
($4,781,571 negative, $652,058 marketing), with `rngState` **byte-identical at the
commission week** — which is what makes the delta a measurement of the office rather
than of a diverged random stream.

| Arm | EST (perceived) | Δ EST | Studio revenue | Δ revenue |
| --- | --- | --- | --- | --- |
| No development office | 65.7212 | — | $6,867,545 | — |
| Office II (open Week 8) | 69.7212 | +4.0000 | $7,005,476 | +$137,931 |
| Offices II + III (III open Week 20) | 74.7212 | +9.0000 | $7,180,036 | +$312,491 |

Tiers replace rather than stack: Office III is +9, never +13.

### 2.5 Throughput at the 2-production ceiling (figures 5, 6, 8 — partial)

| Configuration | Releases (mean) | Final cash (mean) | Idle D&C slot-weeks | D&C refusals (mean) |
| --- | --- | --- | --- | --- |
| +0 · founding capacity | 18.8 | $6,247,907 | 89.6 | 9.6 |
| +1 · Annex (Week 13) | 19.0 | $5,924,375 | 178.0 | 7.2 |
| +2 · Hall (Week 20) | 19.0 | $5,924,375 | 255.0 | 7.4 |

**Release cadence: 5.53 weeks per picture** at the 2-production ceiling — the figure
that converts per-picture economics into per-week economics, and the one C2's throughput
arithmetic is measured against.

4 of 5 seeds are byte-identical across all three arms. The marginal slot is worth
**+0.20 releases and −$323,532 of final cash**, *before* charging the building's own
capital and opex. Founding capacity was refused 48 times across the 5 founding-capacity
arms; **35 of those refusals occur before Week 13**, the earliest week any purchased slot
can stand, so they are unreachable by construction.

### 2.6 Craft Services Annex

Observed freelancer discount **15.00%**, mean saving **$30,517** per hire; capital pays
back after **13.1 freelancer hires**. Measured benefit for a studio that staffs from its
own contracted roster is exactly zero.

### 2.7 The two standing C1 flags (carried forward, unresolved)

Both remain FLAGGED at this HEAD, unchanged, and both are C2 questions rather than C1
ones:

- **Office III is the worst-value office** — 4.17 EST points per $1M marginal against
  Office II's 6.67; payback 43.5 weeks against 26.7.
- **The Hall never pays back** — given its two slots for free it still finished a 104-week
  run $323,532 *poorer* on the mean. The constraint it relieves is not the constraint the
  studio is under: the studio is under the 2-production ceiling, and slots are not what
  that ceiling is made of.

C2 raises that ceiling (owner law 1). **These two flags are therefore the C1 figures most
likely to change meaning at E2, and they are the reason E0 exists.**

## 3. The charter §9 guards, at baseline

### G-B — the weeklyBurn truth repair: premise confirmed at this HEAD

The charter states facilityOpex is invisible to `weeklyBurn`/runway and overstates runway
by ~19%. Verified in source, not assumed:

```ts
// src/core/economyView.ts:60-63
export function weeklyBurn(state: GameState): number {
  if (state.founding !== null) return 0
  return weeklyPayroll(state) + weeklyOverhead(state)
}
```

`facilityOpex` is not a term. Against §2.3's measured Week-20 rows:

| Quantity | Value |
| --- | --- |
| True weekly outflow | **$111,983** |
| Shown by `weeklyBurn` (payroll + overhead) | **$93,983** |
| Omitted | $18,000 (`facilityOpex`, 16.1%) |
| Runway overstatement | **×1.192 — 19.2%** |

Both charter figures ($111,983 true, $93,983 shown) reproduce exactly at this HEAD. The
C2 snapshot regenerates both.

### G-A — the gap this baseline cannot close

G-A requires every economy artifact to report runaway and distress rates with the
threshold in force printed beside them. **The C1 script measures neither**, so this
baseline cannot report them without changing the script — which E0 forbids. The C1
artifact contains no runaway rate, no distress rate, and no threshold.

**E1 is the first gate that can satisfy G-A**, and `measure-c2-economy.mts` must add
figures 9–11 to do it. Recorded here so the omission is a known debt rather than a
silent one.

### The 18-figure coverage map

What the pre-C2 baseline actually supplies, against lane 10 §5.2's non-negotiable list:

| # | Figure | At baseline |
| --- | --- | --- |
| 1 | Per-blueprint capex / weeks / opex / refund / ratio | **Supplied** (5 blueprints) |
| 2 | Weekly opex per estate size, projection + ledger | **Partial** — 2 of 4 estate sizes (founding, C1 built-out) |
| 3 | Weekly outflow composition by ledger kind | **Partial** — one estate size, Week 20 |
| 4 | Capital committed + build-out horizon | **Supplied** ($4,380,000 / 20 weeks) |
| 5 | Releases per 104 / 208 weeks per ceiling | **Partial** — 104 weeks, ceiling 2 only |
| 6 | Release cadence in weeks | **Partial** — 5.53 wk at ceiling 2 only |
| 7 | Pictures-in-flight + binding-constraint histogram | **Absent** |
| 8 | Refusals, and separately queue entries/depth | **Partial** — refusals only; no queue exists in C1 |
| 9 | Runaway rate with threshold printed | **Absent** (G-A debt) |
| 10 | Distress / terminal-decline / durable-recovery rates | **Absent** (G-A debt) |
| 11 | Top-decile end-cash-vs-opening (immortality) | **Absent** |
| 12 | Marginal per-film contribution, fixed vs variable | **Absent** — the instrument does not exist (lane 10 §5.3) |
| 13 | Weekly burn at 1…N concurrent productions | **Absent** |
| 14 | Marginal weekly cost of the Nth production | **Absent** |
| 15 | Queue-idle payroll dollars and share | **Absent** — no queue |
| 16 | Mean / p90 queue wait by constraint kind | **Absent** — no queue |
| 17 | Flip build-out runway and cash trough | **Absent** — no Flip |
| 18 | Cash-negative before first revenue | **Absent** — no Flip |

Six figures are supplied whole or in part; twelve are C2 obligations. **No figure C2 owes
is silently inherited from C1.**

## 4. R9 — is the accepted D-17B engine state contained in this tree?

### Verdict: **CONTAINED**

The charter records this as "unverified to date". It verifies clean.

D-17B closure records the accepted candidate as
`51ec93e33e261b70a68c0acd20f4da5708930179` on branch
`d17-economy-truth-equilibrium`, **"not merged; not pushed"**
(`docs/D-17B-CLOSURE.md:7-9`). That is the state at *closure*; it has since been
integrated. Evidence, in ascending order of strength:

### 4.1 Ancestry

Every commit in the D-17B lineage is an ancestor of this HEAD:

| Commit | Role | At HEAD |
| --- | --- | --- |
| `79a9ab3` | accepted D-17A (`d17a-decision-truth`) | ancestor |
| `52c5f0c` | D-17B analysis base | ancestor |
| `b388167` | recovery starting HEAD | ancestor |
| `33eb33ae` | main at recovery | ancestor |
| **`51ec93e`** | **accepted implementation candidate** | **ancestor** |

Ancestry alone is weak evidence — a later commit could have reverted the constants — so
it is not relied on.

### 4.2 The tuning constants D-17B changed, at HEAD

Every accepted value present and exact, each still carrying its `[D-17B §…]` annotation:

| Closure item | Accepted value | At HEAD | Source |
| --- | --- | --- | --- |
| §1/E1 reach split | engaged `.45`, disengaged `.58` | `AWARENESS_REACH_NEUTRAL_ENGAGED: 0.45`, `AWARENESS_REACH_NEUTRAL: 0.58` | `tuning.ts:88,71` |
| §1 counter-flow | `.04 · max(0, A−35)` at tick 5.5 | `AWARENESS_DRIFT_RATE: 0.04`, `AWARENESS_DRIFT_ANCHOR: 35` | `tuning.ts:101-102` |
| §2 publicity Whisper | $1.2M / 18 / 8 | `{ cost: 1_200_000, maxLift: 18, cooldownWeeks: 8 }` | `tuning.ts:119` |
| §2 publicity Push | $3.6M / 30 / 12 | `{ cost: 3_600_000, maxLift: 30, cooldownWeeks: 12 }` | `tuning.ts:120` |
| §2 publicity Blitz | $8M / 42 / 20 | `{ cost: 8_000_000, maxLift: 42, cooldownWeeks: 20 }` | `tuning.ts:121` |
| §2 shape / cooldown | exponent 6, global cooldown 6 | `PUBLICITY_SHAPE_EXP: 6`, `PUBLICITY_GLOBAL_COOLDOWN_WEEKS: 6` | `tuning.ts:123-124` |
| §3 D-13 BALANCED tuple | `.375 / 4 / 1.5 / .30 / 1.8` | `DISC_SUPPORT_THRESHOLD: 0.375`, `DISC_SPREAD: 4.0`, `DISC_SUPPORT_EXP: 1.5`, `DISC_FLOOR: 0.3`, `DISC_CEIL: 1.8` | `tuning.ts:466-470` |
| §4 marketing menu | `round(capacity × {1.3, 2.4, 3.7})` | `MARKETING_MENU_MULTIPLIERS: [1.3, 2.4, 3.7]` | `tuning.ts:142` |
| §3 RNG channel | `discovery-v1` retained | `discovery-v1` stream retained, not re-keyed | `tuning.ts:451,461` |

**Decisive check** — the diff of `src/core/tuning.ts` from the accepted candidate to this
HEAD, filtered to every D-17B economy key, is empty:

```
git diff 51ec93e HEAD -- src/core/tuning.ts | grep -E '^[-+].*(AWARENESS_REACH|AWARENESS_DRIFT|PUBLICITY_|DISC_|MARKETING_MENU)'   →  (empty)
```

Not one D-17B constant has been touched since acceptance.

### 4.3 Named tests, run at this HEAD

```
npx vitest run tests/d17b-awareness-counterflow.test.ts tests/d17b-disc-shape.test.ts \
  tests/d17b-marketing-menu.test.ts tests/d17b-publicity.test.ts tests/d17b-save-v7.test.ts \
  tests/replay.test.ts tests/save.test.ts
→ Test Files 7 passed (7) · Tests 107 passed (107)

npx vitest run --config src/harness/d16/vitest.d16.config.ts
→ Test Files 10 passed (10) · Tests 176 passed (176)
```

The harness result **reproduces D-17B closure §2 exactly**: "D-16/D-17 harness 10/10
files, 176/176 tests using `src/harness/d16/vitest.d16.config.ts`". Same file count, same
test count, **336 commits after the accepted candidate**.

### 4.4 File and schema containment

- All **84** paths in D-17B closure Appendix A are present at HEAD; none missing.
- `src/core/marketingMenu.ts` and `src/core/publicity.ts` — the two files the recovery
  report classified as "partial but salvageable" — are present and complete.
- The V7 publicity envelope is frozen and carried forward, not dropped: `save.ts:202`
  documents "the D-17B V7 envelope — the FROZEN GameStateV7 (V6 + publicity cooldown
  state, E4)", and the publicity clock shape is still validated inside the current V13
  lineage (`save.ts:660-690`).

### 4.5 The one caveat

D-17B closure item 47 records **"P16 end cash remains exactly $9,831,504"**. That figure
appears at HEAD only in prose (`D-17B-CLOSURE.md:106`,
`D-17B-OWNER-EVIDENCE.md:50`); **no test pins it**. Re-deriving it needs a D-16 corpus run
producing ignored `out/` artifacts, which is outside E0's scope (re-pin the C1 script,
change nothing).

This does not weaken the verdict — item 47 is a corpus *observation*, not one of R9's
named signatures (tuning constants changed, named tests passing), and both named signature
classes verify clean. It is recorded so a later gate does not mistake an unpinned prose
number for a live invariant. **If C6 intends to rely on the P16 figure, it needs a pin.**

## 5. Standing instruction

These figures are the pre-C2 baseline. E1, E2, E3 and E4 each diff against them.

- A C1 figure that moves **without an intended C2 cause** is a regression — read the
  second provenance line first.
- A C1 figure that moves **with** an intended C2 cause (raised ceiling, new opex kinds,
  the Flip) must be named, attributed to the change that moved it, and carried into the
  C2 snapshot rather than overwritten.
- §2.7's two flags will change meaning at E2 by design. That is expected, and it must be
  *stated* at E2, not discovered later.
