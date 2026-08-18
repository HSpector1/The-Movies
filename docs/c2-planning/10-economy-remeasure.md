# LANE 10 — ECONOMY MEASUREMENT & C2 IMPACT

> C2 advance planning, 2026-08-18. Worktree `/Users/bruce/The Movies - C2 Planning`,
> branch `c2-sets-throughput-plan`, base = sealed C1 `main` @ `f294077`.
> **PLANNING ONLY.** Nothing in this document is implemented, and no tuning value is
> changed by it. Where this lane proposes a number, a name, or a policy it is tagged
> `[PROPOSAL]` and belongs to the Owner / Engine PM to rule on.

**Tag legend.** `[CODE]` = observed in this worktree's source at the cited `file:line`.
`[DOC]` = stated in a governing repository document at the cited file + section/line.
`[CORPUS]` = recovered evidence from the read-only corpus at
`/Users/bruce/Desktop/Big Swing Art/`, cited file + row/section. `[DERIVED]` = arithmetic
this lane performed on cited `[CODE]`/`[DOC]` figures — the inputs are evidence, the
product is not. `[PROPOSAL]` = a recommendation, not an observation.

**Owner-law dependency.** This lane's whole risk analysis hangs on binding Owner law 1
(`docs/c2-planning/00-C2-PLANNING-BRIEF.md:21-24`): the `MAX_CONCURRENT_PRODUCTIONS: 2`
ceiling is transitional and throughput must emerge from physical capacity. Every C1
economy measurement on record was taken **at that ceiling**, and several of them are
explicitly ceiling results rather than facility results. Raising the ceiling therefore
does not merely add data points to the C1 snapshot — it invalidates the frame the C1
snapshot's headline answers were computed in. That is the core finding of this lane.

---

## 1. Digest — `docs/economy/C1-ECONOMY-SNAPSHOT.md`

### 1.1 What it is, and the discipline it holds

The snapshot is a **measured record, not a tuning pass**. Its opening law: "Every figure
below was produced by running the engine, not by reading a tuning table. No tuning value
was changed to produce it and none is proposed here: where a number looks wrong it is
**FLAGGED** and left alone." `[DOC C1-ECONOMY-SNAPSHOT.md:3-6]`. Its closing law repeats
it: "**No tuning value was changed by this study, and none is recommended by it.**"
`[DOC C1-ECONOMY-SNAPSHOT.md:226]`.

This is the discipline C2's remeasurement must inherit verbatim. C2 measures; **C6
closes** (see §2.4).

### 1.2 Method and provenance

| Fact | Value | Citation |
|---|---|---|
| Generating command | `node_modules/.bin/vite-node scripts/measure-c1-economy.mts` | `[DOC :11]` |
| Generated at HEAD | `c1e7cb09dfec819e019f8eaa69ecd74ec8714d65` | `[DOC :12]` |
| Last commit touching `src/` or `ui/src/` | `63339cdb42ee59d58d9553b2b29e5978f4dfdbfb` | `[DOC :13]` |
| Direct-measurement seed | `c1-economy-001` | `[DOC :14]` |
| Capacity-study seeds | `c1-economy-001` … `-005` (5) | `[DOC :15]` |
| Capacity-study horizon | 104 weeks per arm | `[DOC :16]` |
| Founding roster | 4 actors · 1 director · 2 writers · 1 craft, 208-week terms | `[DOC :17]` |
| Construction path | public adapter/engine actions only — nothing hand-edited | `[DOC :18]` |
| Determinism | no clock, no `Math.random`; two runs at one HEAD are byte-identical | `[DOC :19]` |

The honesty mechanics are worth naming because C2 must reproduce them: every studio is
founded and built through the **same public actions the browser calls**
(`placeFacilityAction`, `commissionScriptAction`, `greenlightScriptProject`,
`runProductionCommand`, `demolishFacilityAction`, `advanceWeek`); capital, opex and
refunds are read from the **studio's own cash and ledger** and then cross-checked against
the catalog the player sees; the uplift A/B asserts `rngState` is **byte-identical**
across arms at the commission week `[CODE scripts/measure-c1-economy.mts:17-33]`. The
diff line is the *second* provenance row, not the first: while the last `src/`-touching
commit is unchanged every figure reproduces exactly `[DOC :22-24]`.

**Provenance discrepancy (minor, recorded not resolved).** The launching brief for this
lane calls the snapshot "the C1-M6 remeasure"; the generating script's own header calls
it "C1-M7 — THE CAMPAIGN 1 ECONOMY SNAPSHOT"
`[CODE scripts/measure-c1-economy.mts:1]`, and the C1 campaign log records the built-out
figures under a later milestone `[DOC LOT-CONTENT-EXPANSION-LOG.md:400]`. The artifact is
unambiguous; the milestone label is not. Use the file path, not the milestone number.

### 1.3 Harness entry points that produce economy evidence

The economy evidence surface is **five independent runners plus the snapshot script**.
C2's protocol (§5) reuses them; it does not build a sixth family.

| Runner | Entry point | What it produces |
|---|---|---|
| C1 economy snapshot | `scripts/measure-c1-economy.mts` `[CODE :1-5]` | the slate one blueprint at a time; founding vs built-out; the development-office A/B; capacity at the ceiling; the Craft Annex discount. Writes `docs/economy/C1-ECONOMY-SNAPSHOT.md`. |
| Facilities & Construction observatory | `src/harness/facilities/index.ts` — `runFacilitiesArm` `[CODE :2448]`, `runFacilitiesCorpus` `[CODE :2805]`; CLI `src/harness/run-facilities-observatory.ts` | per-arm releases, final cash, **idle slot-weeks**, **capacity refusals**, staffing windows, delay exposure, one-boundary shadows. Default horizon 260 weeks `[CODE facilities/index.ts:57]`. Writes ignored evidence under `out/facilities-construction-research/<run-name>/` `[CODE run-facilities-observatory.ts:3-4]`. |
| D-16/D-17 economy lab corpus | `src/harness/d16/run-d16-corpus.ts` `[CODE :5-30]` | the macro corpus: distress, terminal decline, **runaway**, durable recovery, policy tournament, slice-weeks 52/104/208. Output `out/d16-economy-lab/corpus/<runName>/{rows.jsonl,summary.json,summary.md}`. |
| D-17B continuation | `src/harness/d16/run-d17b-continuation.ts` `[CODE :1,16-26]` | recovery and **runaway** tail continuations from saved distressed/runaway states, accounted to the resumed state's own opening cash. |
| D-17B Week-86 replay | `src/harness/d16/run-d17b-week86.ts` `[CODE :18]` | the single Owner save replayed forward against `runawayCash(openingCash)`, never pooled as a rate. |
| Roster-wall observatory | `src/harness/run-roster-wall-observatory.ts` + `src/harness/roster-wall/` | the Week-208 synchronized roster wall (an open D-17B residual, §2.2). |

Secondary balance studies also live in `src/harness/` and are economy-adjacent
(`run-economy-balance-study.ts`, `run-final-balance.ts`, `run-integrated-balance.ts`,
`run-capital-risk-reward-audit.ts`, `run-microbudget-dominance-audit.ts`,
`run-owner-calibration-study.ts`, `run-writer-bottleneck-study.ts`,
`run-roster-balance-study.ts`). Several of them already read
`TUNING.MAX_CONCURRENT_PRODUCTIONS` directly to size their slot-idle denominators — e.g.
`run-final-balance.ts:222,277`, `run-writer-bottleneck-study.ts:202,302`,
`run-integrated-balance.ts:143-144`, `run-roster-balance-study.ts:214`,
`d16/driver.ts:399,443`, `d16/policies.ts:334`, `facilities/index.ts:2876` `[CODE]`. **Every
one of those call sites changes meaning the moment concurrency stops being a constant**
(see §7, risk R3).

The harness test gate is its own governed config: `src/harness/d16/vitest.d16.config.ts`,
which the D-17B closure records as 10 files / 176 tests `[DOC D-17B-CLOSURE.md:136-138]`.

### 1.4 Headline figures

**(a) The slate, per blueprint** `[DOC C1-ECONOMY-SNAPSHOT.md:32-38]`

| Blueprint | Capital | Weeks to open | Weekly opex | Demolition refund | Refund/capital | Cells | Shared slots |
|---|---:|---:|---:|---:|---:|---:|---:|
| Development & Casting Annex | $780,000 | 13 | $3,500 | $390,000 | 50.0% | 6 | +1 |
| Development & Casting Hall | $1,400,000 | 20 | $6,000 | $700,000 | 50.0% | 12 | +2 |
| Development Office II | $600,000 | 8 | $2,500 | $300,000 | 50.0% | 6 | — |
| Development Office III | $1,200,000 | 12 | $4,000 | $600,000 | 50.0% | 6 | — |
| Craft Services Annex | $400,000 | 6 | $2,000 | $200,000 | 50.0% | 6 | — |

Refunds are a flat 50% of original capital `[CODE src/core/tuning.ts:786
FACILITY_DEMOLITION_REFUND_FRACTION = 0.5]`; relocation is free
`[CODE src/core/tuning.ts:770 FACILITY_MOVE_COST = 0]`. Build-then-demolish is therefore
always a strict loss, and the loss sizes to 100–150 weeks of the building's own opex
`[DOC :51-57]`.

**(b) Founding vs built-out** `[DOC C1-ECONOMY-SNAPSHOT.md:66-73]`

| Fact | Founding | Built out |
|---|---:|---:|
| Placed facilities | 0 | 5 |
| Weekly facility opex (projection = ledger) | $0 | $18,000 |
| Capital committed | $0 | $4,380,000 |
| Cash | $20,000,000 | $13,545,857 |
| Estate complete | Week 0 | Week 20 |

Week-20 outflow composition `[DOC :79-83]`: `facilityOpex` $18,000 (16.1%), `overhead`
$27,000 (24.1%), `payroll` $66,983 (59.8%). Those three shares sum to 100.0%, so the
whole non-production weekly outflow of a fully built C1 studio is **$111,983/week**
`[DERIVED from :79-83]`. The snapshot's own verdict: "a real carrying cost … nowhere near
a death spiral against a founding bank of $20,000,000" `[DOC :85]`.

**(c) The development-office uplift, A/B on one seed** `[DOC :95-116]` — +4 EST for
Office II, +9 for II+III (tiers replace, never stack); revenue deltas $137,931 and
$312,491 per picture; $229,885 vs $145,467 of revenue per $1M of capital.

**(d) Shared slots at the ceiling — the load-bearing negative result** `[DOC :131-135]`

| Configuration | Releases (mean) | Final cash (mean) | Idle D&C slot-weeks | D&C refusals |
|---|---:|---:|---:|---:|
| +0 · founding capacity | 18.8 | $6,247,907 | 89.6 | 9.6 |
| +1 · Annex (open Wk 13) | 19.0 | $5,924,375 | 178.0 | 7.2 |
| +2 · Hall (open Wk 20) | 19.0 | $5,924,375 | 255.0 | 7.4 |

On **4 of 5 seeds every arm released the same pictures and finished with the same cash,
to the byte** `[DOC :145]`. Averaged, the marginal slot buys **+0.20 releases and
−$323,532 of final cash** — *before* charging the building's capital or opex, which the
counterfactual does not charge `[DOC :157]`. "Not one arm on any seed finished richer
than its founding-capacity twin" `[DOC :157]`.

The snapshot is explicit that this is a **ceiling result, not a slot result**: a picture
holds one shared D&C slot at a time and the studio may hold at most 2 pictures, so two
pictures need two slots and the founding building already supplies them `[DOC :161-166]`.

**(e) Payback horizons** `[DOC :192-198]` — cadence one release every **5.53 weeks** at
the ceiling (18.8 releases / 104 weeks, 5 seeds) `[DOC :190]`. Office II pays back in 26.7
weeks; Office III in 43.5; the Annex and the Hall **never**. The snapshot names the
reason and hands the decision forward: "Raising the ceiling is explicitly out of Campaign
1 scope; this is the measurement that says what that decision is worth when someone takes
it." `[DOC :204-205]`.

**(f) The two standing PM flags** `[DOC :207-227]` — (a) Office III is the worst-value
office but not the weakest slate entry; (b) the Hall's 20-week build "can never pay back
… because its measured benefit is not merely small — it is negative before the building is
even paid for", and the 20-week clock is "the second problem, not the first". One honest
counterweight is preserved: extra slots are worth nothing in RELEASES today and "not
worth nothing in FEEL" `[DOC :221-224]`.

### 1.5 What the C1 snapshot does *not* measure

Recorded because C2's protocol has to fill exactly these holes:

1. **No stage, set, scenery, rehearsal, queue, or premiere cost exists to measure.** The
   entire production-operations module is cash-free: `src/core/operations.ts` contains no
   `ledger` and no `cash` reference anywhere in the file `[CODE — verified by grep over
   src/core/operations.ts]`, and the frozen Scenery Load-In V1 contract states the Engine
   "remains the sole owner of whether load-in is [blocked]" while listing economy, ledger
   and reception among the surfaces it does not touch
   `[DOC WORLD-FIRST-SCENERY-LOAD-IN-V1-CONTRACT.md:57,468,492]`.
2. **No founding-building opex exists.** The nine founding buildings are
   `PropertyStructure` entries with roles `landmark`/`founding`
   `[CODE src/core/lot.ts:194-263]`, and the C1 design froze them at "**no capex ledger,
   zero opex** — representation change must be economy-byte-neutral"
   `[DOC LOT-CONTENT-EXPANSION-LOG.md:70]`. Weekly opex sums only over **placed**
   facilities' blueprints `[CODE src/core/placement.ts:368-379]`. A founding studio's two
   soundstages, D&C building, post building and scenery shop
   `[CODE src/core/operations.ts:21-32]` are free forever.
3. **No multi-production burn profile.** Every figure is taken at ≤2 concurrent pictures.
4. **No fresh-start build-out runway.** There is no Flip, so there is no "can a founding
   bank finance the core build-out" measurement.

---

## 2. The open D-17B residuals

### 2.1 Status of record

D-17B is **ACCEPTED as a bounded repair, not a macroeconomic certification**
`[DOC D-17B-CLOSURE.md:3,15-18]`. Accepted candidate `51ec93e3…`, branch
`d17-economy-truth-equilibrium`, **not merged, not pushed** `[DOC D-17B-CLOSURE.md:7-9]`.
Gate disposition: **2 PASS / 5 PARTIAL or mixed / 5 FAIL**, Owner-accepted; "No clean
sweep is claimed" `[DOC D-17B-CLOSURE.md:86-87]`.

The Recovery Report is the provenance spine, not a findings document: it records the
takeover HEAD `b388167`, the four-file inherited marketing-CAP unit
(`tuning.ts`, `reception.ts`, `marketingMenu.ts`, `candidates.ts`), the classification
"partial but salvageable", the rejection of the `saturation:1` corpus as evidence while
preserving it, and the rule that "no failure is being waived"
`[DOC D-17B-RECOVERY-REPORT.md:12-89]`. Its one live warning for any future harness run:
the recovery machine's default Node runtime broke UI/Art suites on `localStorage`, so the
full suite "must be rerun using the repository-compatible/bundled runtime … before any
gate is reported as passing" `[DOC D-17B-RECOVERY-REPORT.md:83-85]`.

### 2.2 The nine residuals, exactly as ruled

Owner ruling E3 — **ACCEPT AS BOUNDED D-17B REPAIR** — accepts the awareness/reach repair
*despite the disclosed worsening cash tail*, and lists what stays open with the
instruction "**Do not conceal or reclassify them**"
`[DOC D-17B-OWNER-RULINGS.md:26-46]`:

1. cash runaway; 2. top-studio economic immortality; 3. week-208 synchronized roster wall;
4. P5 dominance; 5. world-led variance; 6. cheap-film purpose; 7. premium-film purpose;
8. remaining menu breadth; 9. formal G12 timing.

The two this lane owns:

**Cash runaway — NOT FIXED, MEASURABLY WORSE.** "Awareness ceiling absorption is **0
across all 24 arms**: the stock tail is bounded. Cash runaway is not. The 14-player-arm
mean runaway rate rises **11.1% → 19.6–19.7%**; worlds in which no arm runs away fall
**55.0% → 46.7%**. P5 reaches 51%, P4 39%, P11 44.7%, Q3 52%."
`[DOC D-17B-OWNER-EVIDENCE.md:174-179]`. World share of runaway variance rose
0.240 → 0.312 against policy share 0.188 → 0.202 `[DOC D-17B-OWNER-EVIDENCE.md:158-160;
D-17B-CLOSURE.md:72]`. The named cause of the shape is Lesson BK: "awareness runaway fixed
does not equal cash runaway fixed" `[DOC D-17B-OWNER-EVIDENCE.md:179]`.

**Top-studio economic immortality — NOT FIXED.** "Economic immortality at the top
(**0/720 top-decile runs end below opening**, every arm/horizon/grid)"
`[DOC D-17B-CANDIDATE-DESIGN-CONTRACT.md:236-237]`. Once a studio reaches the top decile
it has never, under any measured configuration, ended poorer than it started.

**The measurement definition (this is the number C2 must not redefine).** Runaway is
`maxCash ≥ RUNAWAY_MULTIPLE × openingCash` with `RUNAWAY_MULTIPLE = 3`
`[CODE src/harness/d16/states.ts:138-141,154,170]` — i.e. **$60,000,000** for a fresh
start, since `INITIAL_CASH = 20_000_000` `[CODE src/core/tuning.ts:51]`. The threshold is
a *function* reading TUNING at call time, deliberately, so a swept `INITIAL_CASH` binds
`[CODE states.ts:157-169]` — and it takes the run's **own** opening cash so a Week-86
resume at $2.83M is not judged against a $60M bar it never had. **If C2's Founding Flip
changes starting cash (lane 4), the runaway bar moves with it automatically, and every
pre-Flip runaway rate on record becomes non-comparable.** That is a measurement
discontinuity, not a bug, and §5 handles it.

Distress, the mirror tail, is `state ∈ {bareMinOnly, insolvent…}` — the standard package
is unaffordable `[CODE src/harness/d16/states.ts:253-255,279-280]`. Representative
production distress rates: P1 89%, P3 45.7%, P4 71.3%, P5 37.3%, P11 46.0%, Q3 37.0%,
Q6 42.0% `[DOC D-17B-CLOSURE.md:73-74]`.

### 2.3 The per-film contribution numbers C2 inherits

These are the calibrated per-picture figures C2's throughput arithmetic must run on
`[DOC D-17B-CLOSURE.md:62-65]`:

| Policy family | Median film contribution | End cash | Distress | Terminal decline |
|---|---:|---:|---:|---:|
| P1 cheap | **−$0.815M** | −$2.290M | 89% | 87.7% |
| P3 standard | **+$1.232M** | $9.379M | 45.7% | 42.0% |
| P4 premium | **+$2.942M** | $11.770M | 71.3% | 46.3% |

The sign of per-film contribution **flips by strategy**. That single fact is what makes
the throughput question two-sided (§4).

### 2.4 What C6 owns, in the Owner's own words

The next economic charter is **authorized for investigation only**:

> "**Next economic charter AUTHORIZED:** instrument and research the week-208 roster wall
> and a believable size-scaling cash sink, then re-measure once the richer operating
> studio exists. Do not introduce financing, loans, bailouts, restructuring or the failure
> ladder; **do not invent an arbitrary sink before authoritative facility/capacity/
> construction systems are understood**." `[DOC D-17B-CLOSURE.md:127-130]`

Restated in the closure's disposition: it "must begin with instrumentation and research,
must account for upcoming authoritative facility/capacity/construction systems, and must
not introduce financing, loans, bailouts, restructuring or the failure ladder"
`[DOC D-17B-OWNER-EVIDENCE.md:262-265]`.

The master plan assigns closure to **Campaign 6**: "close cash-runaway/top-studio
immortality against the real capex/opex of a fully populated studio — catalog, sets, land,
landscaping, star salaries and amenities all existing first (D-17B charter); remeasure
week-208 at true scale" `[DOC THE-MOVIES-PARITY-MASTER-PLAN.md §7 item 6]`.

**Reading, stated plainly.** C2 is the campaign that *creates* the authoritative
facility/capacity/construction systems D-17B said must exist before a sink is designed.
C2 therefore owes C6 the instrumentation and the evidence — and owes it *nothing else*.
C2 must not design the cash sink. But C2 **is** the campaign whose new opex surfaces are
the leading candidate to *become* that sink, which is why §5 records their magnitude as a
first-class output rather than a side effect.

### 2.5 The interim guard the master plan already allows

The master plan states the risk and the permission in one paragraph:

> "*Risk, honestly stated:* the cash-runaway residual persists through five campaigns of
> long-horizon playtesting and can distort tuning judgments. Mitigation: the per-campaign
> economy snapshots (C1-M6 onward) keep a measured record; C3's land and landscaping
> purchases add natural sinks that partially self-correct before formal closure; **any
> campaign may take a bounded interim guard (e.g. visible runaway instrumentation) without
> invoking full closure**." `[DOC THE-MOVIES-PARITY-MASTER-PLAN.md §7, PM recommendation]`

The exemplar the plan itself names is **visible runaway instrumentation** — a measurement
and truth-surface guard, not a balance lever. §4.4 proposes exactly that and nothing more.

---

## 3. C2's new economic surfaces

Every row below is a surface that **does not exist in the engine today**. The "today"
column is the verified `[CODE]` baseline; the "C2 question" column is what must be decided
and then measured. Lane 4 owns the Flip's starting-cash *value*; this lane owns the
*measurement plan* for it and references without duplicating.

### 3.1 Stage construction — capex, opex, clock

**Today.** Two soundstages exist as founding `PropertyStructure`s (`stage-a` → Soundstage 7,
`stage-b` → Soundstage 12) with capacity 1 each `[CODE src/core/lot.ts:239-254;
src/core/operations.ts:30-31]`, **charging no capex and no opex ever**
`[CODE src/core/placement.ts:368-379 sums placed facilities only;
DOC LOT-CONTENT-EXPANSION-LOG.md:70]`. There is no soundstage blueprint: the whole catalog
is five development/casting/craft entries `[CODE src/core/tuning.ts:748-754]`.

**C2 adds.** A buildable Soundstage class (master plan §6 classification table:
`stage-a`/`stage-b` → **CONVERT** → buildable Soundstage class, "Conversion lands in
**Campaign 2** with Sets, where stage construction belongs"
`[DOC THE-MOVIES-PARITY-MASTER-PLAN.md §6]`), which the existing blueprint schema already
accommodates: `capex`, `buildWeeks`, `weeklyOperatingCost`, `footprint`, `clearanceRing`,
`requiresRoadAccess`, `maxInstances`, `requires` `[CODE src/core/tuning.ts:598-627]`.

**Corpus shape.** The original's engine carried **three independent cost channels per
object** — `[finance] purchasecost / annualcost / dailyrate` — and
"**annualcost/dailyrate are 0 in every example found this pass**"; "No facility or set in
this collection uses a nonzero annualcost/dailyrate"
`[CORPUS THE-MOVIES-2005-TECHNICAL-ARTIFACTS/schema_fields.csv, TECH-SCHEMA-001]`. It also
carried `[maintenance] decaytime / repairwork / buildingwork / rebuildingwork`
`[CORPUS schema_fields.csv, TECH-SCHEMA-003]` and `availableindebt` on a small set of
core-loop facilities only, so "the game guarantees the player can always build the minimum
viable studio even while in debt" `[CORPUS schema_fields.csv, TECH-SCHEMA-004]`.

**Honest divergence, flagged not resolved.** The original had **no buildable soundstage at
all** — the shooting location *was* the Set, and "Stage (generic)" is a **set** row costed
"n/a (pre-built)" `[CORPUS THE-MOVIES-2005-ORIGINAL-DATA/set_catalog.csv, row
`SET_STAGE_GENERIC`]`. The recovered 28-row facility catalog contains no soundstage entry
`[CORPUS facility_catalog.csv, rows 2-29]`. C2's stage/set split is therefore a
**modernization with no parity precedent to price against**. Original numeric values are
evidence, not spec `[DOC 00-C2-PLANNING-BRIEF.md:94-97]` — but here there is no value to
be evidence *of*. Stage pricing is an invention that must be justified by measurement, and
this lane says so out loud rather than dressing a guess as recovery.

### 3.2 Set construction and maintenance

**Today.** Nothing. `set-scenery` is a *capability* served by the founding Scenery Shop
(capacity 2) `[CODE src/core/operations.ts:29]`. There is no Set entity, no set catalog,
no decay, no novelty.

**C2 adds.** Buildable, placeable, reservable, genre-weighted Sets (Owner law 3,
`[DOC 00-C2-PLANNING-BRIEF.md:27-29]`).

**Corpus shape — recovered, and cheap.** The 39-row set catalog gives 11 rows with settled
costs `[CORPUS set_catalog.csv]`:

| Set | Cost | Hidden quality (1–100) | Boredom factor | Attractiveness | Practice genre |
|---|---:|---:|---:|---:|---|
| War: Battlefield | $5,000 | 0 | 32 | −60 | Action |
| Wild West: Desert | $7,000 | 15 | 38 | −40 | Action |
| Wild West: Saloon | $8,000 | 35 | 34 | −55 | Romance |
| Wild West: Bank | $16,000 | 53 | 30 | −40 | Comedy |
| Rural: Forest | $22,222 | 50 | 38 | −25 | Horror |
| Wild West: Jail | $23,000 | 38 | 35 | −60 | Action |
| Sci-Fi: Starship Bridge 3 | $56,618 | 53 | 20 | n/a | Sci-Fi |
| Suburban: Diner | $58,804 | 25 | 24 | n/a | Romance |
| War: Bombed Street | $74,000 | 95 | 24 | −55 | Action |
| Wild West: Street | $80,000 | 80 | 25 | −40 | Action |
| Suburban: School Library | $99,999 | 55 | 24 | n/a | Comedy |

Three structural facts C2 should carry, and one it must not:

- **Sets are an order of magnitude cheaper than facilities.** Set costs span $5,000–$99,999
  `[CORPUS set_catalog.csv]` against a facility catalog spanning $3,000–$77,777
  `[CORPUS facility_catalog.csv rows 2-29]` — comparable in the original, but our C1
  facilities are priced $400,000–$1,400,000 `[CODE src/core/tuning.ts:598-746]`, i.e. **4–5
  orders of magnitude above the original's absolute dollars**. Any attempt to import
  original set prices literally would make Sets economically invisible. Rebalance in our
  own economy (`[DOC 00-C2-PLANNING-BRIEF.md:94-97]`) is not optional here; it is forced.
- **Decay is real and disables.** Buildings and sets decay and "will eventually become
  unusable if they do not receive maintenance or repair by your staff" (toggleable off via
  "Buildings Don't Decay") `[CORPUS THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md:665,
  citing manual p.4, p.20]`, with the decay rate a real per-object field `decaytime`
  `[CORPUS schema_fields.csv TECH-SCHEMA-003]`. Decay in the original is therefore a
  **labor/availability cost**, not a cash line.
- **Sets impose an attractiveness cost by existing.** Negative attractiveness values run
  −25 to −60 in the set catalog, and "nearly every facility has a small NEGATIVE base
  attractiveness (Lot Prestige cost of merely existing)"
  `[CORPUS schema_fields.csv TECH-SCHEMA-002; set_catalog.csv]`. **That is C3's system,
  not C2's** (§7 R7) — recorded so C2 does not build a prestige hook by accident.
- **What C2 must not carry:** the original's own upkeep field was **zero on every observed
  object** `[CORPUS schema_fields.csv TECH-SCHEMA-001]`. If C2 charges set opex it is
  inventing a recurring cost the original did not have. That may well be right for our
  economy — it is the only credible size-scaling sink we own — but it must be **declared as
  an invention**, exactly as C1 declared `PLACEMENT_ANNEX_WEEKLY_OPERATING_COST` "The one
  genuinely NEW number this milestone" `[CODE src/core/tuning.ts:569-576]`.

**Novelty and decay rates — design decisions, not recoveries.** Novelty "depletes per movie
released but is locked for the duration of a single production already underway"
`[CORPUS Bible:796; also Bible §4 "Novelty value", moderate confidence, no Prima
corroboration]`. Whether a second physical copy of the same set type resets novelty
independently, and whether novelty tracks per-instance or studio-wide, is **explicitly
unresolved** `[CORPUS THE-MOVIES-2005-ORIGINAL-DATA/ACTIVE-UNRESOLVED-QUESTIONS.csv,
Q013 — status ACTIVE]`. C2 must decide it; it cannot recover it.

### 3.3 Scenery / load-in costs

**Today.** A `scenery-load-in` blocker exists on the shooting task and is cleared by a
player command `[CODE src/core/operations.ts:278,292-296,512-513,527]`. It is explicitly
**not** a capacity queue `[CODE src/core/presence.ts:144,449]`. It costs nothing: the
frozen contract disclaims economy, ledger and reception surfaces
`[DOC WORLD-FIRST-SCENERY-LOAD-IN-V1-CONTRACT.md:57,468,492]`.

**C2 question.** Does moving scenery onto a stage cost cash, time, crew, or a combination?
`[PROPOSAL]` The cleanest instrumented form is **time + crew occupancy, priced through
existing payroll**, with an explicit cash line only if the measurement shows the time cost
is economically invisible. A cash charge here is the easiest place in C2 to manufacture a
sink by accident, which D-17B forbade `[DOC D-17B-CLOSURE.md:129-130]`.

### 3.4 Rehearsal costs

**Today.** `rehearsal` is a real production phase at `remainingTicks === 6`, reserving a
`soundstage` `[CODE src/core/operations.ts:63,84-87,534; productionPhaseForRemainingTicks
at :56-77]`, with a labelled world beat `[CODE src/core/firstFilmJourney.ts:135,144]`. It
costs nothing beyond the payroll that would be paid anyway.

**Corpus.** Rehearsal in the original is the "Practice Genre" mechanic — an actor practicing
on a vacant set gains proficiency in that set's associated genre, and every set carries a
named `practice_genre` field `[CORPUS Bible:750-756; set_catalog.csv column
`practice_genre`]`. It is a *skill-accrual* mechanic, and the original charged nothing for
it.

**C2 question.** Rehearsal's cost is naturally **stage-occupancy opportunity cost** once
stages are scarce — the rehearsing production is holding a stage another production wants.
`[PROPOSAL]` Instrument that as **stage-weeks consumed by rehearsal vs shooting**, and add
a cash line only if measurement shows occupancy alone does not create a decision.

### 3.5 Queue idle time — **DESIGN DECISION, FLAGGED**

**Today, verified.** Waiting already burns payroll, unconditionally:

- `weeklyPayroll` sums **every active contract's** weekly salary with no reference to
  whether that person is working `[CODE src/core/employment.ts:140-146]`.
- The tick debits it every week for a founded studio `[CODE src/core/tick.ts:637-643]`.
- Overhead scales with **contract count**, not with production count
  `[CODE src/core/tick.ts:648-654; src/core/tuning.ts:400-401]`.

So the answer to "does waiting burn payroll?" is: **it already does, structurally, and
nobody decided it — it falls out of time-based salary.** Today that is invisible because
`MAX_CONCURRENT_PRODUCTIONS: 2` `[CODE src/core/tuning.ts:50]` means there is barely a
queue. Under Owner law 2 ("QUEUE, DON'T MAGICALLY FORBID"
`[DOC 00-C2-PLANNING-BRIEF.md:25-27]`) the queue becomes the *normal* state of a busy
studio, and this implicit cost becomes a headline mechanic by accident.

**The decision the Owner must take** (this lane does not take it):

| Option | Shape | Economic consequence |
|---|---|---|
| **A — status quo** | queued work costs full payroll; a queued production is simply a production that started later | Idle capacity is punished exactly as hard as active capacity. Deep queues become a pure loss; the correct play is to under-commit. |
| **B — queued productions do not accrue** | payroll charged only while a production is in an occupied phase | Queues become free to hold. Removes the pressure that makes a bottleneck legible — arguably breaks Owner law 2's "know what is waiting … and how to relieve the bottleneck". |
| **C — reduced idle rate** | a named fraction of payroll accrues while queued | A tuning surface, defensible, but **a new cash lever invented inside C2** — precisely the shape D-17B told the next charter not to invent unmeasured `[DOC D-17B-CLOSURE.md:129-130]`. |

`[PROPOSAL]` **Take option A for C2 and measure it.** It requires no new constant, it is
what the engine already does, and it makes "queue-idle cost" a *measurable* figure
(§5.4) rather than a designed one. If the measurement shows deep queues are ruinous, C6
has the evidence to price option C. Shipping C now would be inventing the sink D-17B
prohibited, in the campaign least equipped to calibrate it.

### 3.6 Premiere Night V1 — cost/effect

**Today.** Nothing. `grep -rni premiere` over `src/` and `ui/src/` returns **zero matches**
`[CODE — verified]`. The only occurrences in the whole worktree are in this planning
folder's own brief `[DOC 00-C2-PLANNING-BRIEF.md:38,61]`.

**Owner law 7.** "Premiere Night V1 belongs to C2. No movie footage yet."
`[DOC 00-C2-PLANNING-BRIEF.md:38]`.

**The economic hazard, and the existing anchor.** If Premiere Night carries a *cash cost
with an awareness or box-office effect*, it lands in the exact same design space as the
D-17B publicity action — `whisper $1,200,000 / maxLift 18 / cooldown 8`,
`push $3,600,000 / 30 / 12`, `blitz $8,000,000 / 42 / 20`, global cooldown 6 weeks,
shape exponent 6 `[CODE src/core/tuning.ts:118-124]` — a system the Owner has already
accepted **with a disclosed failing gate**: "for competent play the measured mechanic is
effectively one rung and the ladder is presentational"
`[CODE src/core/tuning.ts:115-117]`, and production usage was Whisper/Push/Blitz
`7,781 / 7,349 / 851` `[DOC D-17B-CLOSURE.md:50-51]`. Adding a second awareness-purchase
surface on top of an already-degenerate one, in a campaign that cannot recalibrate the
first, is a real risk (§7 R5).

`[PROPOSAL]` **Premiere Night V1 should be a ZERO-CASH ceremony in C2** — a legible,
world-native release beat that reads the film's *already-determined* outcome (Owner law 5:
"Engine state owns reservations and outcomes. Animation is evidence only."
`[DOC 00-C2-PLANNING-BRIEF.md:31-32]`), with no cash line and no awareness lift. If a
priced tier is later wanted, C6 prices it against a calibrated awareness economy. If the
Owner rules it must carry cost/effect in C2, then §5.5 defines the minimum measurement
that must accompany it, and the constant names are in §6.

### 3.7 The Founding Flip's starting-cash rebalance — measurement scope only

Lane 4 owns the value. **This lane owns three things lane 4 must be handed:**

1. **The Flip flips the sign of facility opex for the whole studio.** Today a founding
   studio pays **$0/week** for all five founding facilities
   `[CODE src/core/lot.ts:194-263; src/core/placement.ts:368-379;
   DOC LOT-CONTENT-EXPANSION-LOG.md:70]`. After the Flip those same five buildings become
   *player-built placements* `[DOC THE-MOVIES-PARITY-MASTER-PLAN.md §6 staging, "Campaign 2
   — buildable core + THE FOUNDING FLIP"]` and every one of them starts charging weekly
   opex. **The C1 built-out estate is $18,000/week for five buildings**
   `[DOC C1-ECONOMY-SNAPSHOT.md:70]`; a Flip studio must fund an equivalent-or-larger
   estate's opex *plus* its capex out of the founding bank. This is a structural cost
   increase that arrives with the Flip whether or not anyone prices it deliberately.
2. **The runaway bar moves with starting cash, silently.** `runawayCash()` is
   `3 × openingCash` evaluated at call time `[CODE src/harness/d16/states.ts:154,170]`.
   Changing `INITIAL_CASH` changes the bar, which means **pre-Flip and post-Flip runaway
   rates are not comparable** and must never be tabled side by side without the bar printed
   next to them.
3. **The Flip breaks the corpus neutrality invariant.** See §7 R2 — this is the single
   highest-severity engineering consequence in this lane.

---

## 4. The throughput × revenue interaction, honestly

### 4.1 The setup, in one sentence

Owner law 1 raises the concurrency ceiling; the C1 snapshot's own cadence figure says a
studio at the current ceiling releases a picture every **5.53 weeks** `[DOC
C1-ECONOMY-SNAPSHOT.md:190]`; D-17B's own figures say the median picture's contribution is
**−$0.815M / +$1.232M / +$2.942M** depending on strategy `[DOC D-17B-CLOSURE.md:62-65]`;
and the cash-runaway residual is **open and worsening** `[DOC D-17B-OWNER-EVIDENCE.md:
174-179]`. Multiplying throughput multiplies whichever of those three numbers the player is
producing.

### 4.2 The arithmetic `[DERIVED]`

Inputs, all cited above: cadence 9.4 releases/year at the 2-production ceiling (18.8 / 104
weeks) `[DOC :190]`; fully-built C1 non-production outflow $111,983/week = **$5,823,116/year**
`[DERIVED from DOC :79-83]`; runaway bar $60,000,000 from a $20,000,000 start, so **+$40M**
of cash accumulation `[CODE tuning.ts:51; states.ts:154,170]`.

Method and its limits, stated before the table: this holds fixed costs constant, scales
releases linearly with the ceiling, and applies a *median* per-film contribution to every
film. Real distributions have flops, distress interruptions, and capacity that does not
scale linearly. **These are bounds and direction, not forecasts** — the calibrated anchor
remains D-17B's measured 19.6–19.7% runaway rate at the current ceiling
`[DOC D-17B-OWNER-EVIDENCE.md:177]`.

| Per-film contribution (source) | Annual net @ ceiling 2 (9.4 films) | Weeks to the $60M runaway bar | Annual net @ ceiling 4 (18.8 films) | Weeks to bar | Change |
|---|---:|---:|---:|---:|---:|
| **+$1,433,916** — snapshot §3b no-office arm, seed `c1-economy-001` `[DOC :110 + :89]` | +$7,655,694 | **272** | +$21,134,505 | **98** | **2.8× faster** |
| **+$1.232M** — D-17B P3 standard median `[DOC D-17B-CLOSURE.md:63]` | +$5,757,684 | **361** | +$17,338,484 | **120** | **3.0× faster** |
| **+$2.942M** — D-17B P4 premium median `[DOC D-17B-CLOSURE.md:64]` | +$21,831,684 | **95** | +$49,486,484 | **42** | **2.3× faster** |
| **−$0.815M** — D-17B P1 cheap median `[DOC D-17B-CLOSURE.md:62]` | −$13,484,116 | *insolvent in 77 wk* | −$21,145,116 | *insolvent in 49 wk* | **1.6× faster to zero** |

Working for row 1: snapshot §3 header gives the committed package $4,781,571 negative +
$652,058 marketing = $5,433,629 `[DOC :89]`; §3b gives studio revenue $6,867,545 for the
no-office arm `[DOC :110]`; contribution = $1,433,916.

### 4.3 What the arithmetic actually says

1. **The risk is two-sided, and C2 widens the distribution rather than shifting it.**
   Doubling the ceiling roughly **halves the time to the top tail *and* halves the time to
   insolvency**. D-17B already recorded the same shape from a different direction: world
   share of end-cash variance rose while policy share fell `[DOC D-17B-OWNER-EVIDENCE.md:
   158-160]`. C2 will make that worse before any C6 lever exists to make it better.
2. **Top-studio immortality is the residual C2 damages most.** 0/720 top-decile runs end
   below opening `[DOC D-17B-CANDIDATE-DESIGN-CONTRACT.md:236-237]`. A studio that reaches
   the top decile *faster* has more weeks of immortality per campaign, and the immortality
   result is already at 100%. There is no headroom left to absorb the change.
3. **C2's own new opex cannot plausibly absorb the gain — and this is the number C6 needs.**
   The *extra* annual contribution from doubling the ceiling is 9.4 × per-film contribution.
   Expressed as a weekly figure against the entire fully-built C1 estate's $18,000/week
   `[DOC :70]`:

   | Per-film contribution | Extra annual contribution | Extra per week | Multiple of the whole C1 estate's weekly opex |
   |---|---:|---:|---:|
   | +$1,232,000 (P3) | $11,580,800 | $222,708 | **12.4×** |
   | +$1,433,916 (§3b) | $13,478,810 | $259,208 | **14.4×** |
   | +$2,942,000 (P4) | $27,654,800 | $531,823 | **29.5×** |

   `[DERIVED]` To neutralize a doubled ceiling on opex alone, C2's stage-and-set estate
   would have to run at **12–30× the weekly cost of every building C1 ships**. That is not
   a believable maintenance bill; it is a punitive tax wearing a maintenance costume.
   **Conclusion for C6: the size-scaling cash sink cannot be stage/set opex at any
   defensible price.** C2's job is to *record that number*, not to solve it.

4. **The honest counterweight, recorded loudly.** The snapshot's *measured* arms at the
   current ceiling **lost money**: mean final cash $6,247,907 from a $20,000,000 start over
   104 weeks `[DOC :132]` = **−$132,135/week all-in** `[DERIVED]`, i.e. −$731,486 per
   release across 18.8 releases. That is the opposite sign to the §3b single-picture
   contribution *in the same document*. Both are honest; they measure different things (one
   controlled picture at a fixed budget vs. a scripted policy choosing its own packages over
   two years). But it means **no single "net per film" number exists today**, and any C2
   claim built on one is built on sand. Isolating marginal per-film contribution net of the
   marginal cost of making it is a **required C2 instrument** (§5.3), not a nice-to-have.

### 4.4 What C2 must instrument (not fix)

Closure is C6 `[DOC THE-MOVIES-PARITY-MASTER-PLAN.md §7 item 6]`. C2's obligations:

**I1 — Runaway and distress rates re-measured at every ceiling C2 ships.** The corpus
already computes `runawaySuccess`, `distressEntryWeek`, `terminalDecline`, `durableAt103`
`[CODE src/harness/d16/states.ts:127-150]`. C2 adds *concurrency* as a reported dimension
and the *runaway threshold in force* printed beside every rate.

**I2 — Marginal per-film contribution, fixed and variable separated.** Today
`fixedCostAllocation.ts` allocates only `payroll` + `overhead`
`[CODE src/core/fixedCostAllocation.ts:134]` and the recap asserts
`totalLedgerFixedCost === totalPayroll + totalOverhead`
`[CODE src/core/studioRunRecap.ts:318]`. **`facilityOpex` is excluded from film
attribution entirely** even though the finance totals report it inside the `overhead`
bucket `[CODE src/core/economyView.ts:470,525-536]`. Two surfaces, two different
definitions of "overhead". C2 must close that gap or the marginal-contribution figure is
wrong by exactly the amount C2 adds to the world.

**I3 — Concurrency utilisation, not slot utilisation.** The existing observatory reports
**idle slot-weeks** and the snapshot shows exactly why that metric misleads at a binding
ceiling: extra capacity "converted entirely into idle slot-weeks and changed nothing else"
`[DOC :145]`. C2 needs *pictures-in-flight per week*, *the binding constraint per week*, and
*queue depth per week* — the physical quantities Owner law 2 promises the player.

**I4 — The Flip runway** (§5.6).

**I5 — Queue-idle cost** (§5.4).

**Bounded interim guard the master plan already permits `[PROPOSAL]`.** The plan names
"visible runaway instrumentation" as an example of a guard any campaign may take without
invoking closure `[DOC THE-MOVIES-PARITY-MASTER-PLAN.md §7, PM recommendation]`. Proposed
C2 guard, in full and deliberately minimal:

- **G1 — a reported runaway/distress dimension on every C2 economy artifact**, with the
  threshold in force printed beside it. *Measurement only. No engine change.*
- **G2 — the truth-surface repair in §7 R1** — fold `facilityOpex` into `weeklyBurn` so the
  player-facing runway stops overstating survival. This is a **truth fix, not a balance
  lever**: it changes no cash flow, only what the player is told about cash flows that are
  already happening. It is defensible under C2 precisely because C2 multiplies the size of
  the lie.
- **Explicitly NOT permitted to C2:** any new recurring cash sink sized to suppress the
  runaway tail; any financing, loan, bailout, restructuring or failure-ladder mechanic
  `[DOC D-17B-CLOSURE.md:129-130]`; any change to `RUNAWAY_MULTIPLE`, `INITIAL_CASH` (beyond
  the Flip rebalance lane 4 owns), `OVERHEAD_BASE`, `OVERHEAD_PER_EMPLOYEE`,
  `STUDIO_RENTAL_BLENDED`, `ECONOMY_BOX_OFFICE_SCALE`, or the publicity tiers.

---

## 5. The C2 economy remeasurement protocol `[PROPOSAL]`

Design law inherited from C1: **the snapshot is generated by a deterministic script through
public actions, is byte-reproducible at a HEAD, and flags rather than fixes**
`[DOC C1-ECONOMY-SNAPSHOT.md:3-6,226; CODE scripts/measure-c1-economy.mts:9-33]`. C2's
artifact is `docs/economy/C2-ECONOMY-SNAPSHOT.md`, generated by
`scripts/measure-c2-economy.mts`, structured as an *extension* of the C1 script so the C1
sections keep reproducing and any movement in them is itself evidence.

### 5.0 Milestone gates

| Gate | When | Runs | Artifact |
|---|---|---|---|
| **E0 — baseline re-pin** | first C2 commit that touches `src/core/` | re-run the C1 script unchanged; assert every §1–§6 figure reproduces or record the delta | `C1-ECONOMY-SNAPSHOT.md` regenerated, diff reviewed |
| **E1 — post-stage/set catalog** | stages + Sets buildable, ceiling still 2 | R1, R2 | `C2-ECONOMY-SNAPSHOT.md` §1–§2 |
| **E2 — post-throughput** | concurrency emerges from physical capacity | R1, R2, R3, R4 | §3–§5 |
| **E3 — post-Flip fresh start** | Founding Flip shipped | R2 (Flip fixture), R4, R5 | §6–§7 |
| **E4 — C2 seal** | before closure | full set, plus the C6 handoff table | complete artifact |

E0 is not ceremonial. If the C1 figures move before C2 has intentionally changed anything,
the second provenance line has already told you why `[DOC C1-ECONOMY-SNAPSHOT.md:22-24]`.

### 5.1 The runs

**R1 — the C2 slate, one blueprint at a time.** The C1 §1 method extended over every new
stage and Set blueprint: found a studio, commit exactly one blueprint, run to open, pay one
week of running cost, demolish. Read capital / weeks / opex / refund **from the studio's own
cash and ledger**, cross-check against the catalog `[CODE scripts/measure-c1-economy.mts:
257-370]`. Records for each entry: capex, buildWeeks, weeklyOperatingCost, refund,
refund/capital, footprint cells, capacity contributed, and — new for Sets —
genre weights, starting novelty, decay rate, and maintenance cost per week.

**R2 — founding vs built-out, at three estate sizes.** The C1 §2 method
`[CODE :371-455]` run at (a) founding, (b) the C1 five-building estate, (c) a C2
"minimum shooting studio" (core + 1 stage + 1 Set), (d) a C2 "multi-production studio"
sized to whatever ceiling E2 ships. Records weekly opex, capital committed, cash, week
complete, **and the full weekly outflow composition by ledger kind** — the four-row table
at `[DOC C1-ECONOMY-SNAPSHOT.md:79-83]` is the template, and its share column is the single
most useful number in the C1 snapshot.

**R3 — the throughput corpus.** `runFacilitiesCorpus` `[CODE facilities/index.ts:2805]` at
≥5 seeds × the C1 104-week horizon *and* a 208-week horizon (the roster-wall boundary
`[DOC D-17B-CLOSURE.md:88-89]`), one arm per shipped ceiling. Reports releases, final cash,
**pictures-in-flight per week**, **binding constraint per week**, **queue depth per week**,
capacity refusals — and keeps idle slot-weeks only as a *diagnostic*, never as a headline
(§4.4 I3).

**R4 — the macro corpus at the C2 ceiling.** `run-d16-corpus.ts` at the governed seed count
and 208-week horizon `[CODE d16/run-d16-corpus.ts:5-10]`, producing runaway, distress,
durable-recovery and terminal-decline rates **per ceiling**, with the runaway threshold in
force printed on every row. This is the run that tells C6 how much worse C2 made the
residual, in the residual's own units.

**R5 — the Flip fresh-start run.** A brand-new studio under the Flip founding condition
(Gate + Admin + road + vacant parcels `[DOC THE-MOVIES-PARITY-MASTER-PLAN.md §6, "Minimum
starting lot"]`) driven to its first greenlight and its first release, with cash and runway
sampled every week.

### 5.2 Figures the C2 snapshot MUST record

Non-negotiable list, so C6 inherits clean evidence:

**Estate and slate**
1. Per-blueprint capex / buildWeeks / weekly opex / refund / refund-ratio, from the ledger.
2. Weekly opex of each estate size, **projection and ledger, cross-checked** (the C1 table's
   two-column form at `[DOC :69-70]` is what caught nothing and is therefore worth keeping).
3. Weekly outflow composition by ledger kind at each estate size, with shares.
4. Total capital committed and the estate's build-out horizon in weeks.

**Throughput**
5. Releases per 104 and per 208 weeks, per ceiling, per seed and mean.
6. **Release cadence in weeks** (the C1 §6 figure `[DOC :190]`) per ceiling — the single
   number that translates per-picture economics into per-week economics.
7. Pictures-in-flight distribution, and the **binding constraint histogram** (stage / Set /
   D&C slot / crew / talent / post) — Owner law 2's promise, in numbers.
8. Capacity refusals and, separately, **queue entries and queue depth**. A refusal and a
   queue are not the same event and must never be summed.

**The two tails**
9. Runaway rate per ceiling **with the threshold in force printed beside it**.
10. Distress rate, terminal-decline rate, durable-recovery rate per ceiling.
11. Top-decile end-cash-vs-opening (the immortality figure, `0/720` today
    `[DOC D-17B-CANDIDATE-DESIGN-CONTRACT.md:236-237]`) per ceiling.
12. **Marginal per-film contribution, fixed and variable separated**, at each ceiling —
    including `facilityOpex` in the fixed side (§4.4 I2).

**Multi-production weekly burn** (explicitly requested by this lane's charter)
13. Weekly burn at 1, 2, 3, … N concurrent productions, decomposed into payroll / overhead /
    facilityOpex / set maintenance / scenery / any new C2 kind, as dollars and as shares.
14. The **marginal weekly cost of the Nth concurrent production** — the number that says
    whether physical throughput has a real price.

**Queue-idle cost** (§5.4)
15. Queue-idle payroll dollars per campaign, and as a share of total payroll.
16. Mean and p90 queue wait in weeks, by constraint kind.

**Flip fresh-start build-out runway** (§5.6)
17. Founding cash, total capex of the minimum shooting studio, weeks to first greenlight,
    weeks to first release, **minimum cash reached before first revenue**, and the runway in
    weeks at the trough.
18. Whether the studio ever goes cash-negative before first revenue, on how many seeds, and
    by how much.

### 5.3 Marginal per-film contribution — the instrument that does not exist

Required because §4.3 item 4 shows the two existing figures disagree in sign. The instrument
must report, per film: committed cost (negative + marketing + freelancer fees), studio
revenue, contribution, **allocated fixed cost including `facilityOpex`**, and net. The
allocator today excludes `facilityOpex` at `[CODE src/core/fixedCostAllocation.ts:134]`
while the finance view folds it into `overhead` at `[CODE src/core/economyView.ts:470]`.
C2 must either extend the allocator or state in the snapshot, in the figure's own caption,
exactly which costs the number excludes. Silently inheriting the C1 definition into a world
with ten times the opex would be the exact class of error the snapshot's discipline exists
to prevent.

### 5.4 Queue-idle cost — how to measure it without designing it

Under proposed option A (§3.5) no new constant is needed. The measurement is:

> **queue-idle payroll** = Σ over weeks of (weekly payroll attributable to contracted talent
> assigned to a production that is *queued rather than occupying* a facility slot).

Reported as absolute dollars, as a share of total payroll, and as a share of total outflow —
the same three-way presentation the C1 snapshot used for facility opex `[DOC :79-85]`, which
is what let the PM see at a glance that $18,000/week was 16.1% and therefore real but not
fatal. If queue-idle payroll lands in single-digit percent it is texture. If it lands above
the C1 estate's 16.1% it is a mechanic, and C6 has the evidence to price option C.

### 5.5 If Premiere Night is ruled to carry cost/effect

Minimum accompanying measurement, non-negotiable if the Owner overrules §3.6's proposal:
(a) uptake rate per policy arm — the publicity ladder's own usage `7,781/7,349/851`
`[DOC D-17B-CLOSURE.md:50-51]` is the cautionary baseline; (b) awareness lift delivered vs
awareness lift purchased, against the practical A-band of roughly 0–57
`[DOC D-17B-CLOSURE.md:44; D-17B-CANDIDATE-DESIGN-CONTRACT.md:245-247]`; (c) an A/B on one
fixed seed with byte-identical `rngState` at the decision week, exactly as the C1 uplift A/B
does `[CODE scripts/measure-c1-economy.mts:26-29]`; (d) the effect on runaway rate, isolated.

### 5.6 The Flip fresh-start runway — the E3 headline

The single figure E3 exists to produce:

> **Can a studio founded under the Flip finance its own core build-out and reach first
> revenue without going cash-negative — on how many seeds, with how much margin, and how
> many weeks does it take?**

Sub-figures: founding cash (lane 4's value); total capex of the minimum shooting studio;
build-out horizon in weeks (C1's whole-estate horizon was **20 weeks**, set by build clocks
and not by money `[DOC :75]` — the Flip's will be longer and may be set by money); minimum
cash before first revenue; weeks-to-first-greenlight; weeks-to-first-release.

**Method warning.** The player-facing runway is computed by `runway()` from `weeklyBurn`
`[CODE src/core/economyView.ts:60-63,125-127]`, which is **payroll + overhead only** — it
excludes `facilityOpex` entirely (§7 R1). The Flip measurement must use **ledger-derived
actual outflow**, never `weeklyBurn`, or it will report a runway the studio does not have.

### 5.7 Determinism and honesty rules the C2 script must inherit verbatim

1. Public actions only; nothing hand-edited; no cash written directly
   `[CODE scripts/measure-c1-economy.mts:17-22]`.
2. Figures read from the studio's own cash and ledger, then cross-checked against the
   catalog the player sees `[CODE :20-22]`.
3. A/B arms assert byte-identical `rngState` at the decision week `[CODE :26-29]`.
4. No clock, no `Math.random`, fixed-precision formatting; provenance = HEAD + last commit
   touching `src/`/`ui/src/` `[CODE :30-33; DOC :11-24]`.
5. Flag; do not fix. No tuning value changed to produce the artifact `[DOC :3-6,226]`.
6. Run the harness on the repository-compatible runtime, not the machine default
   `[DOC D-17B-RECOVERY-REPORT.md:83-85]`.

---

## 6. TUNING inventory `[PROPOSAL]` — names and intent, not values

Repo law: "Constants live in `TUNING` (section 16). Never inline a magic number that has a
name in the contract," and "Every bounded term in the contract gets a unit test asserting
its stated range" `[DOC CLAUDE.md, Conventions]`. C1's existing pattern is the template:
scalar knobs as `TUNING.*` keys `[CODE src/core/tuning.ts:565-581]`, per-entry catalog
objects as module-level `*_BLUEPRINT` constants that *reference* those keys
`[CODE src/core/tuning.ts:598-746]`, and the catalog as a frozen list
`[CODE src/core/tuning.ts:748-754]`.

**No values are proposed here.** Every entry below is a name, an intent, and the measurement
that must set it.

### 6.1 Stage construction

| Name | Intent | Set by |
|---|---|---|
| `STAGE_BASIC_CAPEX` | capital for the entry-tier buildable soundstage | R1 + R5 (must be affordable from the Flip bank) |
| `STAGE_BASIC_BUILD_WEEKS` | commit → operational clock | R5 (sets the Flip's opening act length) |
| `STAGE_BASIC_WEEKLY_OPERATING_COST` | weekly running cost while operational | R2 §13/§14 |
| `STAGE_BASIC_CAPACITY` | concurrent productions one stage can host (expected 1) | Owner ruling, §8 D1 |
| `STAGE_BASIC_FOOTPRINT_WIDTH` / `_DEPTH` / `_CLEARANCE_RING` | ground cost, mirroring the Annex keys `[CODE tuning.ts:578-580]` | lot-geometry lane |
| `STAGE_LARGE_*` | the same six keys for a higher tier, if a tier ships | R1 |
| `STAGE_BLUEPRINTS` | the frozen catalog list, mirroring `FACILITY_BLUEPRINTS` `[CODE :748]` | — |

### 6.2 Set construction, maintenance, decay, novelty

| Name | Intent | Set by |
|---|---|---|
| `SET_BLUEPRINT_CAPEX_BAND_MIN` / `_MAX` | the band Set prices are authored within, so no single Set can be priced outside a stated range a test asserts | R1 |
| `SET_<id>_CAPEX` | per-Set capital (authored per catalog entry) | R1 |
| `SET_BUILD_WEEKS_BAND_MIN` / `_MAX` | Set build clocks are short relative to facilities; the band is the law | R1 |
| `SET_WEEKLY_MAINTENANCE_COST` | recurring upkeep per standing Set. **An invention** — the original's `annualcost` was zero on every observed object `[CORPUS schema_fields.csv TECH-SCHEMA-001]` — and must be labelled as one in its own comment, exactly as `PLACEMENT_ANNEX_WEEKLY_OPERATING_COST` is `[CODE tuning.ts:569-576]` | R2 §13/§14 |
| `SET_DECAY_RATE_PER_WEEK` | condition lost per standing week; corpus shape is a per-object `decaytime` field `[CORPUS TECH-SCHEMA-003]` | R2 |
| `SET_DECAY_UNUSABLE_THRESHOLD` | condition below which a Set cannot be reserved — the original's "eventually become unusable" `[CORPUS Bible:665]`. A **bounded term**: needs a range test |
| `SET_REPAIR_COST` / `SET_REPAIR_WEEKS` | price and clock of restoring condition; corpus separates `repairwork` from `buildingwork` `[CORPUS TECH-SCHEMA-003]` | R1 |
| `SET_NOVELTY_INITIAL` | novelty of a newly built Set. **Bounded 0..1 or 0..100** — needs a range test |
| `SET_NOVELTY_DEPLETION_PER_RELEASE` | novelty lost per released film that used the Set. Corpus: depletes per *release*, and is **locked for the duration of a production already underway** `[CORPUS Bible:796]` | R3 + reception A/B |
| `SET_NOVELTY_SCOPE` | `'per-instance' \| 'studio-wide'` — **a decision, not a recovery**: explicitly unresolved in the corpus `[CORPUS ACTIVE-UNRESOLVED-QUESTIONS.csv Q013, status ACTIVE]` | Owner ruling, §8 D3 |
| `SET_GENRE_WEIGHT_*` | per-genre numeric weights + a priority genre; the corpus resolves the *schema* (`genre_action = 0.7`, `priority1`) but explicitly **not** the vanilla values `[CORPUS TECH-SET-008; Bible:687]` | design |
| `SET_BLUEPRINTS` | the frozen Set catalog list | — |

### 6.3 Scenery / load-in

| Name | Intent | Set by |
|---|---|---|
| `SCENERY_LOAD_IN_WEEKS` | how long a load-in occupies the stage | R3 |
| `SCENERY_LOAD_IN_COST` | cash charge per load-in. **`[PROPOSAL]` author at 0**, exactly as `FACILITY_MOVE_COST = 0` `[CODE tuning.ts:770]` — a named, invariant-checked, ledger-routed zero, so introducing a real fee later is a one-line tuning change on a path the tests already prove | R3 |

### 6.4 Rehearsal

| Name | Intent | Set by |
|---|---|---|
| `REHEARSAL_WEEKS` | phase length (today implicit at `remainingTicks === 6` `[CODE operations.ts:63]`) | R3 |
| `REHEARSAL_STAGE_OCCUPANCY` | whether rehearsal holds a stage exclusively | Owner ruling, §8 D2 |
| `REHEARSAL_COST` | cash charge. **`[PROPOSAL]` author at 0**, same named-zero pattern | R3 |

### 6.5 Queue policy

| Name | Intent | Set by |
|---|---|---|
| `QUEUE_MAX_DEPTH` | how many productions may wait; `0`/absent = unbounded | R3 §16 |
| `QUEUE_IDLE_PAYROLL_FRACTION` | fraction of payroll accrued while queued. **`[PROPOSAL]` author at 1.0** — the status quo (§3.5 option A), named so it is *visible and measurable* rather than emergent, and so C6 can price option C without a new code path | Owner ruling, §8 D4 + R3 §15 |
| `QUEUE_PRIORITY_POLICY` | `'fifo' \| 'player-ordered'` — Owner law 2 requires the player know what is waiting and why | Owner ruling |

### 6.6 Premiere Night

Author **only if** the Owner overrules §3.6:

| Name | Intent |
|---|---|
| `PREMIERE_NIGHT_COST` | cash charge (`[PROPOSAL]` 0) |
| `PREMIERE_NIGHT_AWARENESS_LIFT` | awareness delta (`[PROPOSAL]` 0). If nonzero it must be sized **against**, not beside, `PUBLICITY_TIERS` `[CODE tuning.ts:118-122]` |
| `PREMIERE_NIGHT_COOLDOWN_WEEKS` | if priced, it needs the same anti-spam guard the publicity action has `[CODE tuning.ts:124]` |

### 6.7 Flip starting cash — **lane 4 owns the values; named here for completeness only**

| Name | Intent | Note |
|---|---|---|
| `INITIAL_CASH` (existing `[CODE tuning.ts:51]`) | the Flip's founding bank | **Changing it silently moves the runaway bar** `[CODE states.ts:170]`. Any change must be recorded in the snapshot's provenance block, and pre/post rates never tabled without the bar. |
| `HIRING_FOUNDING_BUDGET` (existing `[CODE tuning.ts:352]`) | recruitment fund, not cash | Unchanged by C2 unless lane 4 says otherwise. |
| `FLIP_STARTING_STRUCTURES` | the Gate/Admin/road/parcels the Flip studio begins with | `[DOC master plan §6]` |

### 6.8 Constants C2 must NOT touch

`RUNAWAY_MULTIPLE` `[CODE states.ts:154]`; `OVERHEAD_BASE` / `OVERHEAD_PER_EMPLOYEE`
`[CODE tuning.ts:400-401]`; `STUDIO_RENTAL_BLENDED`, `ECONOMY_BOX_OFFICE_SCALE`,
`THEATRICAL_*` `[CODE tuning.ts:394-402]`; `PUBLICITY_TIERS` and its shape/cooldown
`[CODE tuning.ts:118-124]`; the D-13 discoverability tuple `[DOC D-17B-CLOSURE.md:52]`;
`FACILITY_DEMOLITION_REFUND_FRACTION` `[CODE tuning.ts:786]`. Every one of them is either an
accepted D-17B/D-17A ruling or the measurement basis C6 needs held still.

---

## 7. Risks, gaps and contradictions

**R1 — `weeklyBurn` excludes `facilityOpex`; the player-facing runway overstates survival.
`[CODE, HIGH]`**
`weeklyBurn` returns `weeklyPayroll(state) + weeklyOverhead(state)`
`[CODE src/core/economyView.ts:60-63]`, and `runway()` divides cash by that burn
`[CODE :125-127]`. But the tick debits a **third** weekly charge, `facilityOpex`, at step 7.6
`[CODE src/core/tick.ts:664-675]`. For a fully built C1 estate that is **$18,000/week — 16.1%
of the week's outflow** `[DOC C1-ECONOMY-SNAPSHOT.md:79-83]` that the runway does not see.
The UI states the wrong thing out loud: Assembly renders "at today's {weeklyBurn} per week of
payroll and [overhead]" `[CODE ui/src/screens/Assembly.tsx:1341]`, and the Dashboard finance
card renders the same figure `[CODE ui/src/screens/Dashboard.tsx:448]`, while build mode shows
per-facility opex in a completely separate surface `[CODE ui/src/lot/buildMode.ts:306,320,337]`.
The two never meet. **C2 multiplies the error by every stage and Set it ships.** This is the
one item in this lane that argues for a bounded C2 repair (§4.4 G2) rather than pure
instrumentation — it is a truth fix that changes no cash flow.

**R2 — the Founding Flip breaks the D-16 corpus neutrality invariant. `[CODE, HIGH]`**
The lab's acceptance gate is a hash: `run-d16-corpus.ts 300 208 all` "must produce a
rows.jsonl whose SHA-256 is `6692662642906b91ab00e83046be9b5462eb1f43db44fafc4f943235fc4bc45c`
(= d17a-final-300x208)" `[CODE src/harness/d16/run-d16-corpus.ts:31-36]`. That invariant holds
today only because corpus arms never build: `facilityOpex` is charged only when there is an
operational **placed** facility `[CODE src/core/tick.ts:664-666]`, and `constructionCapex` only
when someone commits. **After the Flip a fresh studio starts with nothing and must build, so
every corpus arm acquires construction capex and facility opex, and the hash changes.** This is
not a defect C2 can avoid — it is what the Flip *is*. It must be handled deliberately: either
the corpus is pinned to a **pre-Flip founding fixture** retained as a permanent regression
(which the master plan already anticipates for FMJ: "the pre-Flip fixture … is retained as a
permanent regression suite" `[DOC THE-MOVIES-PARITY-MASTER-PLAN.md §6, item 3]`), or the
invariant is formally re-based with a recorded ruling. **Silently letting the hash drift would
destroy the comparability of every D-16/D-17 figure C6 needs.**

**R3 — `MAX_CONCURRENT_PRODUCTIONS` is a load-bearing denominator in nine harness files.
`[CODE, MEDIUM-HIGH]`**
Slot-idle and slot-utilisation metrics divide by it: `run-final-balance.ts:222,277`,
`run-writer-bottleneck-study.ts:202,302`, `run-integrated-balance.ts:143-144`,
`run-roster-balance-study.ts:214`, `d16/driver.ts:399,443`, `d16/policies.ts:334`,
`d16/experiment.ts:146`, `facilities/index.ts:2876`, plus `tests/agents.test.ts:145` `[CODE]`.
When throughput stops being a constant, every one of those metrics changes meaning, and some
become undefined. C2 must audit all of them; several are *policy gates* (`policies.ts:334`,
`driver.ts:443`) whose behaviour changes, not just their arithmetic.

**R4 — CONTRADICTION: the accepted Annex contract mandates $0/week opex; shipped C1 charges
$3,500/week. `[DOC vs CODE, MEDIUM — report, do not resolve]`**
The frozen Development & Casting Annex V1 contract states "Marginal operating cost | **$0 per
week**" `[DOC DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:75]` and "This contract selects exactly
`$780,000 / Week 13 / $0`. **All positive-opex tuples are rejected**"
`[DOC :136]`; its closure repeats "The measured marginal Annex operating cost remains exactly
$0/week because V1 owns no attributable facility worker, utility, maintenance, floor-area, or
[resource]" `[DOC DEVELOPMENT-CASTING-ANNEX-V1-CLOSURE.md:31-32]`. The research closure is
stronger still: "The supported marginal facility opex is **$0/week** … **No employee-overhead
or duplicate base-overhead charge may be invented**"
`[DOC FACILITIES-CONSTRUCTION-RESEARCH-CLOSURE.md:33-35]`. Shipped C1 charges **$3,500/week**
`[CODE src/core/tuning.ts:577]`, introduced at Placement Core V12 with its own reasoning
`[CODE src/core/tuning.ts:569-576]`. Either the later milestone deliberately superseded the
earlier ruling (likely) or a frozen contract was violated (possible). **The distinction matters
to C2 specifically**, because C2 is about to author opex on stages and Sets and needs to know
whether it is following precedent or repeating an unratified deviation. **Owner ruling
required** (§8 D5).

**R5 — Premiere Night risks a second degenerate awareness-purchase surface. `[DOC, MEDIUM]`**
The publicity ladder is already presentational in competent play — "for competent play the
measured mechanic is effectively one rung and the ladder is presentational"
`[CODE src/core/tuning.ts:115-117]`, usage `7,781/7,349/851` `[DOC D-17B-CLOSURE.md:50-51]`,
G-gates on menu breadth still open `[DOC D-17B-OWNER-RULINGS.md:41]`. C2 cannot recalibrate
the first ladder (that is C6), so adding a second is additive risk with no corrective lever.

**R6 — the C1 snapshot contains two per-film economics that disagree in sign. `[DOC, MEDIUM]`**
§3b's controlled picture contributes **+$1,433,916** `[DOC :89,110]`; §4's measured arms lose
**−$731,486 per release** all-in `[DERIVED from DOC :132]`. Both are honest and they measure
different things, but there is currently **no single defensible "net per film" figure**, and
C2's throughput argument needs one. §5.3 is the fix.

**R7 — set attractiveness is C3's system, and the corpus will tempt C2 into it.
`[CORPUS, LOW-MEDIUM]`**
Sets carry negative attractiveness (−25 to −60) `[CORPUS set_catalog.csv]`, and "nearly every
facility has a small NEGATIVE base attractiveness (Lot Prestige cost of merely existing)"
`[CORPUS schema_fields.csv TECH-SCHEMA-002]`. Lot Prestige / landscaping is **Campaign 3**
`[DOC THE-MOVIES-PARITY-MASTER-PLAN.md §7 item 3]`. C2 should author the field as data if the
schema wants it, wire nothing to it, and say so.

**R8 — the original had no buildable soundstage; stage pricing has no parity anchor.
`[CORPUS, MEDIUM]`**
"Stage (generic)" is a *set* row costed "n/a (pre-built)"
`[CORPUS set_catalog.csv, SET_STAGE_GENERIC]`, and no soundstage appears in the 28-row facility
catalog `[CORPUS facility_catalog.csv]`. Stage capex/opex is therefore invention. Not a
blocker — the brief already rules original numerics are evidence, not spec
`[DOC 00-C2-PLANNING-BRIEF.md:94-97]` — but the *absence of a shape* is different from a
rebalanced value, and this lane records the difference.

**R9 — the D-17B branch is unmerged; its residual figures describe code that is not on `main`.
`[DOC, MEDIUM]`**
D-17B was accepted on `d17-economy-truth-equilibrium`, "**not merged; not pushed**"
`[DOC D-17B-CLOSURE.md:9]`, and its measurements were taken at candidate `51ec93e3…`. The C1
snapshot was taken at HEAD `c1e7cb09…` `[DOC C1-ECONOMY-SNAPSHOT.md:12]`. **Whether the sealed
C1 `main` @ `f294077` contains the accepted D-17B engine changes was not verified by this lane**
and is a prerequisite for R4's macro corpus being comparable to D-17B's published rates. C2
must establish it at E0 before quoting any D-17B rate as a baseline.

**R10 — `facilityOpex` has two conflicting homes in the reporting layer. `[CODE, MEDIUM]`**
`KIND_FIELD` maps `facilityOpex → 'overhead'` for finance totals
`[CODE src/core/economyView.ts:470]` with an explicit case in the aggregator
`[CODE :525-536]`, but the fixed-cost allocator skips it entirely
`[CODE src/core/fixedCostAllocation.ts:134]` and the recap's contract asserts
`totalLedgerFixedCost === totalPayroll + totalOverhead`
`[CODE src/core/studioRunRecap.ts:318]`. So "overhead" means one thing on the finance card and
another in per-film attribution. C1 could live with a 16.1% discrepancy; C2 cannot.

**R11 — corpus gaps that are genuine unknowns, not lookup failures. `[CORPUS, LOW]`**
Novelty scope per-instance vs studio-wide is ACTIVE/unresolved
`[CORPUS ACTIVE-UNRESOLVED-QUESTIONS.csv Q013]`; the full base-game set roster beyond the 39
recovered rows is unresolved with costs incomplete on most rows `[CORPUS Q040; set_catalog.csv
— 28 of 39 rows carry `$?`]`; whether vanilla sets used multiple non-zero genre weights is
resolved at the *schema* level only `[CORPUS Bible:687; TECH-SET-008]`. These are decisions C2
must take, and the report must not present them as recoveries.

**R12 — minor provenance discrepancy: "C1-M6" vs "C1-M7".** See §1.2.

---

## 8. Owner decisions this lane surfaces

| # | Decision | Why it is the Owner's | Blocking |
|---|---|---|---|
| **D1** | **Target concurrency range at mature build-out, and which constraint binds first** (stages / Sets / D&C slots / crew / talent). Already on the master plan's "still required" list as the ruling C2 owns `[DOC THE-MOVIES-PARITY-MASTER-PLAN.md §10, "Still required" item 1]`. | Every number in §4 and §5 is parameterised by it. | **C2 freeze** |
| **D2** | **Does rehearsal hold a stage exclusively?** | Determines whether stage count or Set count binds first, which determines what C2's economy is *about*. | E2 |
| **D3** | **Set novelty scope: per-instance or studio-wide** `[CORPUS Q013 ACTIVE]`. | Not recoverable from the corpus; it is a game-design ruling with direct economic consequence (studio-wide makes Set variety a purchase; per-instance makes Set *count* a purchase). | E1 |
| **D4** | **Queue-idle payroll policy** — §3.5 options A / B / C. This lane recommends **A (status quo, measured)**. | Option C invents a cash lever inside C2, which D-17B's charter forbids doing before measurement `[DOC D-17B-CLOSURE.md:129-130]`. | E2 |
| **D5** | **Ruling on R4** — did Placement Core V12 legitimately supersede the $0-opex Annex contract, or is shipped C1 in violation? | C2 is about to author opex on every stage and Set; it needs to know which precedent it is following. | E1 |
| **D6** | **Premiere Night V1: zero-cash ceremony (this lane's proposal) or priced action?** | Directly touches the publicity economy the Owner accepted with a disclosed failing gate. | E3 |
| **D7** | **How the D-16 corpus neutrality invariant is handled across the Flip** — pin a pre-Flip fixture, or formally re-base the hash with a recorded ruling (R2). | Comparability of every macro figure C6 inherits depends on it. | **E3** |
| **D8** | **Is the §4.4 G2 truth repair (fold `facilityOpex` into `weeklyBurn`) in C2 scope**, or deferred to C6 with the discrepancy documented? | It is a bounded interim guard of exactly the kind §7 of the master plan permits, but it is still an engine change inside a planning-frozen scope. | E1 |

---

## 9. Handoff summary — what C6 inherits from C2

If §5 executes as specified, C6 opens with:

1. A `C2-ECONOMY-SNAPSHOT.md` in the C1 artifact's discipline, byte-reproducible at a HEAD.
2. Runaway / distress / durable-recovery / top-decile-immortality rates **per concurrency
   ceiling**, each printed with the threshold in force.
3. A defensible marginal per-film contribution with fixed and variable costs separated, and
   `facilityOpex` on the correct side of the line.
4. A multi-production weekly burn curve, and the marginal weekly cost of the Nth production.
5. Queue-idle payroll as dollars, share of payroll, and share of outflow.
6. A Flip fresh-start runway with the minimum-cash trough on every seed.
7. **The number that says the cash sink cannot be stage/set opex** — §4.3 item 3's 12–30×
   multiple — which is a genuine negative result and saves C6 from designing the wrong thing.
8. No new cash sink, no financing, no failure ladder, and no residual reclassified.
