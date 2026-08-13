# D-17A — Owner Evidence Package (measured read-model values)

**Measured at:** `d17-economy-truth-equilibrium @ ab8f721` (post-fix-pass HEAD; the only commit
after the fix pass, `ab8f721`, changes `docs/LESSONS-LEARNED.md` only).
**Suite at that HEAD:** `npx vitest run` → **106 files / 1385 tests passed**, exit 0.
**Owner save:** `/Users/bruce/The Movies - Economy Recovery Lab/out/d16-economy-lab/week86-owner-save.json`
— `saveVersion: 5`, seed `studio-001`. Read with `fs.readFileSync`, migrated **V5 → V6 in memory**
through `importSave` → `migrateToV6`. **Nothing was written to it, or to any save file.**

> **D-17B remeasurement (2026-08-13):** D-17B deliberately changes discoverability, the engaged
> marketing menu, and awareness dynamics. The accepted D-17A figures remain below as historical
> evidence at `ab8f721`; the required current-stack replacements are recorded in §3.4, §4.1 and
> §7(b), measured at `a48862b` after the independent implementation review. They supersede the
> corresponding D-17A figures for current product behavior; they do not rewrite D-17A history.

## How to read this

Every figure below is the output of a probe that was actually executed against this HEAD. The
probes import the shipped read-models (`src/core/economyView.ts`, `src/core/fixedCostAllocation.ts`,
`src/core/filmPackage.ts`, `src/core/studioRunRecap.ts`, `ui/src/engine/adapter.ts`), render the
real screen components into jsdom with `@testing-library/react`, and read the text content of the
element carrying each `data-testid`. **This evidence is numeric read-model output — the exact
strings and values the screens render, addressed by testid — not screenshots.** A "value" column
therefore shows the rendered text verbatim (including the `money()` / `moneyExact()` rounding the
player actually sees); where the underlying unrounded number matters it is given beside it. Every
table names the save or fixture it was measured on. Fixtures described as *driven* are deterministic
engine states built from a named seed through the public actions — they are not the Owner's save.

---

## 1. Dashboard on the Week-86 Owner save

**Measured on:** the Owner save (`studio-001`, week 86), migrated in memory. State after migration:
`economyEngagedEver: true`, 6 contracts, 9 released films, 0 active productions, 9 theatrical runs
(all completed — `fin-active-runs` reads 0).

### 1.1 The ONE runway, and the weekly cost side

| Surface | testid | Rendered value |
|---|---|---|
| Dashboard | `dash-week` | `86` |
| Dashboard | `dash-cash` | `$2.83M` (raw `2,833,923.166178771`) |
| Dashboard · Finances | `fin-cash` | `$2.83M` |
| Dashboard · Finances | **`fin-runway`** | **`72 wk`** |
| Dashboard · Finances | `fin-payroll` | `$15K` (raw `15,174`) |
| Dashboard · Finances | `fin-overhead` | `$24K` (raw `24,000`) |
| Dashboard · Finances | **`fin-burn`** | **`$39K`** (raw `39,174`) |
| Dashboard · Finances | `fin-run-revenue` | `$0` |
| Dashboard · Finances | `fin-net-weekly` | `-$39K` |
| Dashboard · Finances | `fin-active-runs` | `0` |
| Dashboard · Finances | `fin-pipeline` | `$0` |

`financeCard(state).runway` raw: `{ netWeeklyCash: -39174, weeks: 72, infinite: false }`.
Burn = payroll `15,174` + overhead `24,000` = `39,174`; runway = ⌊2,833,923.17 ÷ 39,174⌋ = 72.

### 1.2 Affordability scopes, against the D-15 closure's recorded figures

| Surface | testid | Rendered value | D-15 closure recorded |
|---|---|---|---|
| Dashboard | `dash-affordability-cheapest` | `$2,015,391 — affordable` | ≈ **$2.02M**, affordable |
| Dashboard | `dash-affordability-standard` | `$3,544,173 — short $710,250` | ≈ **$3.54M**, unaffordable |
| Dashboard | `dash-affordability-typical` | `$4,422,115 — short $1,588,191` | ≈ **$4.42M**, unaffordable |
| Dashboard | `dash-affordability-disclosure` | "Estimates from your current concepts and contracted team, checked against the same solvency rule a greenlight enforces — not a guaranteed quote." | — |

All three agree with the D-15 closure (`docs/D-15-studio-run-recap-closure.md` §7) to the dollar
once rounded as that document rounds. `cheapestBreakdown` raw: negative `1,915,390.8894375`
+ minimum marketing `100,000` + freelancer fees `0` (`contractedRosterCanFieldFilm: true`).
`standardBreakdown` raw: negative `3,144,173` + marketing `400,000`.

### 1.3 Standing channel meanings (the new truthful copy, verbatim)

| testid | Value | Rendered meaning |
|---|---|---|
| `standing-audienceAwareness` | `12` (raw `12.306192647411297`) | "How visible the studio is to audiences (driven by box-office reach and star attention). **The only channel that affects box office.**" |
| `standing-industryPrestige` | `95` (raw `95.30851345911556`) | "The studio's critical reputation (driven by critic scores alone). **It has no commercial effect today.**" |
| `standing-commercialConfidence` | `49` (raw `49.35347954737732`) | "An industry reputation signal tracking full-gross returns against committed cost, plus budget discipline. **It is not money and has no mechanical effect today.**" |

No financier language appears in any of the three.

### 1.4 Recent releases — the `Result (direct costs)` column

| Surface | testid | Rendered value |
|---|---|---|
| Dashboard · releases table header | `releases-result-header` | **`Result (direct costs)`** |

The six most recent rows as rendered (Contribution / Result / Studio Rev / ROI):

| productionId | Week | `-contribution` | `-result` | `-studiorev` | `-roi` |
|---|---|---|---|---|---|
| `prod-0072` | 80 | `-$3.42M` | `Loss` | `$299K` | `-92%` |
| `prod-0063` | 71 | `-$3.02M` | `Loss` | `$2.27M` | `-57%` |
| `prod-0054` | 62 | `$1.55M` | `Profit` | `$5.97M` | `35%` |
| `prod-0045` | 53 | `-$3.01M` | `Loss` | `$1.38M` | `-69%` |
| `prod-0036` | 44 | `$530K` | `Profit` | `$6.81M` | `8%` |
| `prod-0027` | 35 | `-$3.04M` | `Loss` | `$1.34M` | `-69%` |

---

## 2. Roster / signing on the Week-86 Owner save

### 2.1 The closed 186 wk / 72 wk contradiction

Both figures below were read off rendered screens in the same probe, on the same migrated state.

| Surface | testid | Rendered value |
|---|---|---|
| Dashboard · Finances | `fin-runway` | **`72 wk`** |
| Studio Roster · Payroll & runway | **`roster-runway`** | **`72 wk`** |

`payrollSummary(state).runway` raw `{ netWeeklyCash: -39174, weeks: 72, infinite: false }` — deep-equal
to `financeCard(state).runway`. The retired payroll-only rule, recomputed **inside the probe only** to
size the gap that was closed: ⌊`2,833,923.166178771` ÷ `15,174`⌋ = **186**. The product no longer
contains that rule anywhere; weekly and annual payroll remain as cost lines:

| Surface | testid | Rendered value |
|---|---|---|
| Studio Roster | `roster-cash` | `$2.83M` |
| Studio Roster | `roster-weekly` | `$15K` (raw `15,174`) |
| Studio Roster | `roster-annual` | `$789K` (raw `789,012`) |
| Studio Roster | `roster-obligations` | `$1.85M` (raw `1,851,228`) |
| Studio Roster | `roster-renewals` | `0` |

### 2.2 A real Hiring-Market offer — obligation and runway before/after

**Measured on:** the Owner save, first card the Hiring Market renders (8 cards; sorted by OVR) —
`t-wri-10`, Conrad Hartwell, writer. All four terms, as rendered.

| testid | Rendered value |
|---|---|
| `hiring-sign-t-wri-10-52` | `Sign 1 yr · $406K/yr · $73K bonus` |
| `offer-obligation-t-wri-10-52` | `Commits $478,611 over 52 weeks — $405,600 guaranteed salary ($8K/wk) plus $73,011 paid now.` |
| **`offer-runway-t-wri-10-52`** | **`Runway 72 wk → 56 wk`** |
| `offer-obligation-t-wri-10-104` | `Commits $818,795 over 104 weeks — $751,192 guaranteed salary ($7K/wk) plus $67,603 paid now.` |
| `offer-runway-t-wri-10-104` | `Runway 72 wk → 57 wk` |
| `offer-obligation-t-wri-10-156` | `Commits $1,134,539 over 156 weeks — $1,070,316 guaranteed salary ($7K/wk) plus $64,223 paid now.` |
| `offer-runway-t-wri-10-156` | `Runway 72 wk → 58 wk` |
| `offer-obligation-t-wri-10-208` | `Commits $1,412,843 over 208 weeks — $1,352,000 guaranteed salary ($6K/wk) plus $60,843 paid now.` |
| `offer-runway-t-wri-10-208` | `Runway 72 wk → 58 wk` |

`signOfferTruth` raw for the 1-year term: obligation `{ weeklySalary: 7800, guaranteedComp: 405600,
signingBonus: 73011, total: 478611 }`; runway `{ before: 72 wk, after: 56 wk, burnAfter: 48474,
cashAfter: 2760912.166178771 }`. `burnAfter` = 39,174 + 7,800 weekly salary + 1,500
`OVERHEAD_PER_EMPLOYEE` (a new seat), and no `OVERHEAD_BASE` step because this studio is already
engaged. `bonusAffordable: true` on every term.

### 2.3 A renewal

**On the Owner save, no renewal window is open.** All six contracts run to week 208
(`remainingWeeks: 122`), and `renewalWindowOpen` requires `0 < remaining ≤ 12`
(`HIRING_RENEWAL_WINDOW_WEEKS = 12`); `roster-renewals` therefore renders `0`. The read-model still
states what a renewal would commit — for `authored-0000` (Zach, actor) on the Owner save:

| Term | `offerObligation` raw | `postSigningRunway` raw |
|---|---|---|
| 52 wk | weekly `3,824`, guaranteed `198,848`, bonus `35,789`, **total `234,637`** | 72 wk → **68 wk** (burnAfter `40,659`) |
| 104 wk | weekly `3,540`, guaranteed `368,160`, bonus `33,138`, **total `401,298`** | 72 wk → **69 wk** (burnAfter `40,375`) |
| 156 wk | weekly `3,363`, guaranteed `524,628`, bonus `31,481`, **total `556,109`** | 72 wk → **69 wk** (burnAfter `40,198`) |
| 208 wk | weekly `3,186`, guaranteed `662,688`, bonus `29,824`, **total `692,512`** | 72 wk → **70 wk** (burnAfter `40,021`) |

A renewal is priced as a **replacement**, not a new seat: the burn moves by the weekly-salary delta
only (3,824 − 2,339 = 1,485 for the 1-year term), which is why the runway barely moves.

**Rendered renewal** — *driven fixture*, seed `evidence-renewal`: a 12-strong founding roster on
52-week contracts advanced to week 45, which puts all 12 contracts in their renewal window. Target
`t-wri-03` (Gene Halberstam, writer; contract ends week 52, 7 weeks left, termination cost `27,237`):

| testid | Rendered value |
|---|---|
| `roster-runway` | `77 wk` |
| `roster-renew-t-wri-03-52` | `Renew 1 yr · $405K/yr · $73K bonus` |
| `offer-obligation-t-wri-03-52` | `Commits $477,502 over 52 weeks — $404,664 guaranteed salary ($8K/wk) plus $72,838 paid now.` |
| `offer-runway-t-wri-03-52` | `Runway 77 wk → 76 wk` |
| `offer-obligation-t-wri-03-208` | `Commits $1,409,578 over 208 weeks — $1,348,880 guaranteed salary ($6K/wk) plus $60,698 paid now.` |
| `offer-runway-t-wri-03-208` | `Runway 77 wk → 77 wk` |

### 2.4 Release-confirm termination cost

**Measured on:** the Owner save, `authored-0000`, after clicking `roster-release-authored-0000`.

| Surface | testid | Rendered value |
|---|---|---|
| Studio Roster | `roster-termcost-authored-0000` | `$143K` |
| Studio Roster | **`roster-confirm-release-authored-0000`** | **`Confirm release · costs $143K`** |

`employmentInfo(state, 'authored-0000').contract.terminationCost` raw = `142,679`. All six rendered
termination costs: `$143K / $158K / $167K / $157K / $147K / $154K` (raw `142,679`, `158,234`,
`166,652`, `157,319`, `146,705`, `154,025`).

---

## 3. Assembly on the Week-86 Owner save — the bare-minimum package

**Measured on:** the Owner save, driven through the **real Assembly wizard** (the same clicks a
player makes): concept list sorted by base cost ascending → first card (`c-00`); the minimum-demand
shape `slowSetup / revelation / ambiguous` (`budgetDemandMultiplier` `0.8122499999999999`, the
minimum over all 36 legal shapes — the one `cheapestPackage` prices); the six contracted roster
members in every role; Production Budget rung 0 (Lean 0.75×); Marketing rung 0 ($100K).
This reproduces `affordabilityScopes.cheapest` exactly: rendered `committed-cost` `$2,015,391`
against the read-model's `commitment: 2015391`, with `salaries` `$0` (no freelancer fee).

### 3.1 Cash required now, remaining cash, post-greenlight runway

| Surface | testid | Rendered value |
|---|---|---|
| Assembly · Budget | `required-negative` | `$2.55M` |
| Assembly · Budget | **`committed-cost`** | **`$2,015,391`** |
| Assembly · Budget | `salaries` (freelancer fees) | `$0` |
| Assembly · Budget | `budget-solvency` | `Pass` |
| Assembly · Budget | `budget-capital-committed` | `$2,015,391 · 71% of current cash` |
| Assembly · Budget | `budget-exposure` | `Extreme` |
| Assembly · Budget | **`budget-cash-after`** | **`$818,532`** |
| Assembly · Budget | **`budget-runway`** | **`20 wk`** |
| Assembly · Budget | `budget-exposure-note` | "This greenlight is solvent, but it commits 71% of your current cash — a extreme-exposure bet. One weak result could leave the studio thin. Consider a smaller Production Budget or Marketing." |
| Assembly · Review | `release-commitment` | `$2,015,391` |
| Assembly · Review | `release-cash-after` | `$818,532` |
| Assembly · Review | `release-runway` | `20 wk` |
| Assembly · Review | `release-gate` | `Solvency gate` / `Pass ✓` |
| Assembly · Review | `release-exposure` | `Capital exposure (71% of cash)` / `Extreme` |

The runway falls from 72 wk to 20 wk because cash falls to `818,532` while burn stays `39,174`
(a greenlight is a one-time debit; it does not change weekly burn).

### 3.2 Direct vs cycle-inclusive break-even — the understatement, made visible

| Surface | testid | Rendered value |
|---|---|---|
| Assembly · Budget/Review | **`budget-breakeven` / `release-breakeven`** (headline) | **`$4.93M`** |
| Assembly · Budget/Review | `budget-breakeven-direct` / `release-breakeven-direct` | `$3.88M against this film's direct costs only.` |
| Assembly · Budget/Review | **`budget-breakeven-shared` / `release-breakeven-shared`** | **`$4.40M if a second film shares those 14 weeks.`** |
| Assembly · Budget/Review | `budget-breakeven-assumption` / `release-breakeven-assumption` | "The headline assumes this film alone carries all 14 weeks of studio fixed costs — 8 weeks in production plus 6 weeks in release — at today's $39K per week of payroll and overhead, which is $548K." |

Raw, from `cycleInclusiveBreakEvenGross(state, 2_015_391)`:

| Quantity | Value |
|---|---|
| direct break-even gross | `3,875,751.923076923` |
| **cycle-inclusive break-even gross (headline)** | **`4,930,436.538461538`** |
| shared occupancy (`concurrency: 2`) | `4,403,094.230769231` |
| `fixedCost` | `{ weeks: 14, weeklyBurn: 39174, concurrency: 1, amount: 548436 }` |
| `regimeStudioShare` | `0.52` (`STUDIO_RENTAL_BLENDED`) |
| **delta (cycle-inclusive − direct)** | **`$1,054,684.62`** |

**The understatement.** On this package the direct-only figure is **27.21% below** the
studio-economic requirement (`4,930,436.54 / 3,875,751.92 = 1.2721`) — equivalently, it understates
the true break-even by **21.39% of that true figure**. The ratio is `fixedCost ÷ committed` =
`548,436 ÷ 2,015,391`, so it grows as the package gets cheaper: on the same save at a $1M campaign
(committed `$2,915,391`) the same fixed cost is an 18.8% uplift.

### 3.3 Post-greenlight runway and greenlight discipline

| Surface | testid | Rendered value |
|---|---|---|
| Assembly · Budget | `budget-expected-gross` | `$1.95M` |
| Assembly · Budget/Review | **`greenlight-discipline-value`** | **`-$1.55M`** |
| Assembly · Budget/Review | `greenlight-discipline-verdict` | "This package's central forecast **does not cover** its direct costs and 14 weeks of studio fixed costs." |
| Assembly · Budget/Review | `greenlight-discipline-working` | "Expected gross $1.95M × your 52% rental share is $1.02M of Studio Revenue, less $2.02M committed now and $548K of payroll and overhead across the cycle." |
| Assembly · Review · forecast | `fc-total` | `$1.95M` |
| Assembly · Review · forecast | `fc-opening` | `$1.05M` |
| Assembly · Review · forecast | `fc-critic` | `54.6` |
| Assembly · Review · forecast | `fc-confidence` | `Low confidence` |

**The Owner's 9/9 negative-centre story, made legible.** The nine films already on this save are
each measurable against their own **locked** greenlight forecast (`forecastTotal`), the commitment
they actually made, and the fixed cost they actually consumed (`allocatedFixedCost`, the
retrospective ledger allocation over the 14 weeks each occupied):

| productionId | Week | forecastTotal | × 0.52 | committed | allocated | centre (direct) | **centre (studio-economic)** |
|---|---|---|---|---|---|---|---|
| `prod-0000` | 8 | `11,680,408` | `6,073,812` | `10,924,529` | `450,501` | `-4,850,716` | **`-5,301,217`** |
| `prod-0009` | 17 | `13,446,529` | `6,992,195` | `10,991,554` | `352,566` | `-3,999,359` | **`-4,351,925`** |
| `prod-0018` | 26 | `4,398,254` | `2,287,092` | `5,439,736` | `352,566` | `-3,152,644` | **`-3,505,210`** |
| `prod-0027` | 35 | `8,101,053` | `4,212,548` | `4,387,140` | `352,566` | `-174,592` | **`-527,158`** |
| `prod-0036` | 44 | `7,262,612` | `3,776,558` | `6,281,448` | `352,566` | `-2,504,890` | **`-2,857,456`** |
| `prod-0045` | 53 | `6,836,504` | `3,554,982` | `4,387,140` | `352,566` | `-832,158` | **`-1,184,724`** |
| `prod-0054` | 62 | `6,359,814` | `3,307,103` | `4,422,115` | `352,566` | `-1,115,012` | **`-1,467,578`** |
| `prod-0063` | 71 | `4,150,340` | `2,158,177` | `5,299,952` | `352,566` | `-3,141,775` | **`-3,494,341`** |
| `prod-0072` | 80 | `2,868,873` | `1,491,814` | `3,719,903` | `450,501` | `-2,228,089` | **`-2,678,590`** |

**9 of 9** had a negative forecast centre — on the direct basis *and* on the studio-economic basis.
Before D-17A no screen stated that number at decision time; `greenlight-discipline-value` now does,
in one signed figure, before the greenlight button. (Caveat: `allocatedFixedCost` is the *actual*
ledger fixed cost each film carried, used here in place of the weekly burn current at each
greenlight, which the save does not retain.)

### 3.4 Discovery-exposure band, with its real numbers

**D-17B current-stack remeasurement (`a48862b`; supersedes the historical table below):** on the
same Week-86 save and cheapest legal package, reach support is `0.12531161103660085` against the
new `0.375` threshold (`shortfall 0.6658357039023978`). The shipped band is **0.3×–1.8×**, with
both clips reached: worst opening `$381,865`, best opening `$2,291,193`, expected opening
`$1,272,885`. The package remains exposed. The production constants are
`threshold=.375 / spread=4 / exp=1.5 / floor=.30 / ceil=1.8`; RNG key `discovery-v1` is unchanged.
The following D-17A table is retained only to show the pre-D-17B state:

| Surface | testid | Rendered value |
|---|---|---|
| Assembly · Budget | `budget-discovery-exposure` | "**Discoverability exposure.** Reach support is 11% against the 45% this film needs to open reliably. Its opening turnout can land anywhere between 0.2× and 1.8× the expected level — worst case $210K, best case $1.89M against an expected $1.05M. That band runs into the engine's hard 0.2×/1.8× clip. Awareness, marketing and cast draw are what move reach support." |
| Assembly · Review | `release-discovery-exposure` | identical text |

The band reaches the hard clips here because the shortfall is severe; §7(b) shows a package whose
shortfall is milder and whose band is therefore *not* quoted at the clips.

### 3.5 Marketing truth — measured capacity against each rung

Each row is the rendered `marketing-capacity` / `marketing-reach` line after clicking that rung,
on the same Week-86 bare-minimum package.

| Rung | Rendered rung label | `marketing-capacity` | Opening reach (`marketing-reach`) | `committed-cost` | `budget-solvency` |
|---|---|---|---|---|---|
| 0 | `Small campaign $100K` | `$100K against a measured efficient capacity of $150K — 67% of capacity.` | converts to 40% of buyable reach → **13%** total | `$2,015,391` | **`Pass`** |
| 1 | `Standard campaign $400K` | `$400K against a measured efficient capacity of $150K — 266% of capacity.` | converts to 73% → **18%** total | `$2,315,391` | `Pass` |
| 2 | `Wide campaign $1.00M` | `$1.00M against a measured efficient capacity of $150K — 666% of capacity.` | converts to 87% → **21%** total | **`$2,915,391`** | **`Blocked`** |

`marketing-overexposure` renders **nothing** on all three rungs — the engine's own `overexposure`
value is zero here, and the copy is emitted only when it is above zero. Every rung's marginal
reach is positive and diminishing (13% → 18% → 21%); the retired "most of this campaign is wasted"
steering is gone. **The $1M rung is not affordable on this save**: `$2,915,391` against
`$2,833,923.17` of cash — the solvency metric flips to `Blocked`, and it is the affordability
statement, not a claim about the spend's productivity, that stops it.

---

## 4. Distressed vs healthy — the same surfaces on both

**DISTRESSED:** the Owner save (`studio-001`, week 86), migrated in memory.
**HEALTHY (driven fixture):** seed `healthy-d` — founding draft opened, the founding minimums signed
for the **most famous** applicants on 104-week terms, studio founded, 2 weeks advanced, then a film
greenlit through the **real Assembly wizard** (cheapest concept; shape `immediateAction / escalation
/ triumph`; the contracted roster by fame; Production Budget rung 1 = 1.0×; Marketing rung 1 =
$400K), then 20 weeks advanced so the film completes production and its whole theatrical run.

### 4.1 Dashboard, side by side

**D-17B current-stack remeasurement (`a48862b`; supersedes changed values in the historical table
below):** the distressed Week-86 save remains at week 86, cash `$2,833,923.17`, burn `$39,174/wk`
and runway `72 wk`; its awareness is `12.306192647411297`. Capacity-anchored affordability is now
cheapest **`$2,110,606 — affordable`**, standard **`$3,574,271 — short $740,348`**, typical
**`$4,422,115 — short $1,588,191`**. The reconstructed `healthy-d` state is week 22, cash
`$22,012,347.52`, burn `$116,782/wk`, runway `188 wk`, awareness `36.692629340252374`; all scopes
remain affordable: cheapest `$1,968,819`, standard `$3,467,942`, typical `$4,350,803`. The latest
healthy release has gross `$17,177,605.27`, Studio Revenue `$8,932,354.74`, and Film Contribution
`+$4,581,551.52`. The historical D-17A table follows for provenance:

| testid | DISTRESSED (Week-86) | HEALTHY (driven, week 22) |
|---|---|---|
| `dash-week` | `86` | `22` |
| `dash-cash` | `$2.83M` | `$21.64M` |
| **`fin-runway`** | **`72 wk`** | **`185 wk`** |
| `fin-payroll` | `$15K` | `$93K` |
| `fin-overhead` | `$24K` | `$24K` |
| `fin-burn` | `$39K` | `$117K` |
| `fin-run-revenue` | `$0` | `$0` |
| `fin-net-weekly` | `-$39K` | `-$117K` |
| `fin-active-runs` | `0` | `0` |
| `dash-affordability-cheapest` | `$2,015,391 — affordable` | `$1,480,400 — affordable` |
| **`dash-affordability-standard`** | **`$3,544,173 — short $710,250`** | **`$2,665,969 — affordable`** |
| **`dash-affordability-typical`** | **`$4,422,115 — short $1,588,191`** | **`$3,527,037 — affordable`** |
| `assemble-blocked-reason` | (absent) | (absent) |
| most recent release `-contribution` / `-result` | `prod-0072` `-$3.42M` / `Loss` | `prod-0002` `$4.21M` / `Profit` |

The healthy studio carries **nearly three times** the distressed one's weekly burn (`117K` against
`39K`) and still shows a longer runway and three affordable scopes — the contrast is cash and
revenue, not thrift.

### 4.2 Assembly, side by side

Distressed row = §3's bare-minimum package; healthy row = the wizard-driven package above.

| testid | DISTRESSED (Week-86, bare minimum) | HEALTHY (driven) |
|---|---|---|
| `committed-cost` | `$2,015,391` | `$3,527,037` |
| `budget-solvency` | `Pass` | `Pass` |
| `budget-capital-committed` | `$2,015,391 · 71% of current cash` | `$3,527,037 · 18% of current cash` |
| **`budget-exposure`** | **`Extreme`** | **`Low`** |
| `budget-cash-after` | `$818,532` | `$16,239,399` |
| **`budget-runway`** | **`20 wk`** | **`139 wk`** |
| `budget-expected-gross` | `$1.95M` | `$14.70M` |
| **`budget-breakeven`** (headline) | **`$4.93M`** | **`$9.93M`** |
| `budget-breakeven-direct` | `$3.88M …direct costs only.` | `$6.78M …direct costs only.` |
| `budget-breakeven-shared` | `$4.40M if a second film shares those 14 weeks.` | `$8.35M if a second film shares those 14 weeks.` |
| `budget-breakeven-assumption` (fixed cost) | `…$39K per week…, which is $548K.` | `…$117K per week…, which is $1.63M.` |
| **`greenlight-discipline-value`** | **`-$1.55M`** | **`+$2.48M`** |
| `greenlight-discipline-verdict` | "…**does not cover** its direct costs and 14 weeks of studio fixed costs." | "…**covers** its direct costs and 14 weeks of studio fixed costs." |
| `budget-discovery-exposure` | "Discoverability exposure. Reach support is 11% against the 45%…" | "**Reach-supported.** Reach support 48% meets the 45% this film needs, so its opening carries no discoverability variance." |
| `marketing-capacity` | `$100K against a measured efficient capacity of $150K — 67% of capacity.` | `$400K against a measured efficient capacity of $515K — 78% of capacity.` |
| `pkg-studio-economic` (Review) | Downside `-$2.36M · Loss` / Expected `-$1.55M · Loss` / Upside `-$486K · Loss` | Downside `-$1.17M · Loss` / Expected `$2.48M · Profit` / Upside `$7.07M · Profit` |

### 4.3 Outcome and recap position

| Surface | testid | DISTRESSED (Week-86) | HEALTHY (driven) |
|---|---|---|---|
| Recap | `recap-recovery` | **`Severe recovery position`** | **`Constrained but recoverable`** |
| Recap | `recap-fixedcost-identity` | `$3,368,964 allocated + $0 idle = $3,368,964 paid.` | `$1,634,948 allocated + $934,256 idle = $2,569,204 paid.` |
| Recap · per film | `recap-studio-economic-…-contribution` | `prod-0072` `-$3.42M` | `prod-0002` `+$4.21M` |
| Recap · per film | `recap-studio-economic-…-allocated` | `−$450,501 over 14 wk` | `−$1,634,948 over 14 wk` |
| Recap · per film | `recap-studio-economic-…-result` | `-$3.87M` | **`+$2.57M`** |

Healthy raw: committed `3,527,037.22` → studio revenue `7,733,481.82` → contribution `4,206,444.60`
→ allocated fixed cost `1,634,948` over 14 weeks → **studio-economic result `+2,571,496.60`**.
Position: cash `21,637,240.60`, burn `116,782`, fixed-cost runway `185` wk, recovery `constrained`.

---

## 5. Concurrent-production accounting

**Measured on:** *driven fixture*, seed `evidence-overlap` — a 12-strong founding roster on 52-week
contracts, founded after 3 founding ticks; greenlight A at week 3 and greenlight B at **week 6**, so
their 8-week production windows overlap; 20 weeks advanced, then a further 12 (weeks **20–37** are
**idle** — nothing in production, nothing in release); greenlight C at week 38; 5 further weeks,
leaving C **in flight** at week 43.

Occupancy windows (`filmOccupancyWindows`, inclusive weeks):
`prod-0003 [3, 16]`, `prod-0006 [6, 19]`, `prod-0038 [38, 45]`.
Weeks with **two** occupants: `6…16` — **11 weeks**.

### 5.1 Per film

| productionId | `allocatedFixedCost` | `allocatedWeeks` | Contribution | **`studioEconomicResult`** |
|---|---|---|---|---|
| `prod-0003` (City of Cornerstone, released wk 11) | `1,370,999` | `14` | `2,486,285.16` | **`1,115,286.16`** |
| `prod-0006` (Return to Wilderness, released wk 14) | `1,370,999` | `14` | `1,538,166.50` | **`167,167.50`** |
| `prod-0038` (in flight) | `806,470` | `5` | — (not released) | — |

The two overlapping films carry **identical** allocations (`1,370,999` each) because the overlap is
symmetric under the equal-split/largest-remainder rule, and each still occupied 14 weeks in total.

### 5.2 The rendered reconciliation line

| Surface | testid | Rendered value |
|---|---|---|
| Studio Run Recap | `recap-fixedcost-total` | `$6,451,760` |
| Studio Run Recap | `recap-fixedcost-allocated` | `$3,548,468` |
| Studio Run Recap | `recap-fixedcost-idle` | `$2,903,292` |
| Studio Run Recap | **`recap-fixedcost-identity`** | **"$3,548,468 allocated + $2,903,292 idle = $6,451,760 paid.** Allocation includes films still in production, so it is not the sum of the released films below. Payroll and overhead remain studio costs; attributing them to films is a labelled managerial convention (per-week pro-rata over the signed ledger), never a charge against a film." |

**Exact, to the dollar:** `1,370,999 + 1,370,999 + 806,470 = 3,548,468`; `3,548,468 + 2,903,292 =
6,451,760`; and `6,451,760` is `−Σ` of the ledger's `payroll` + `overhead` entries over the window.
The in-flight film is included in the allocation, which is why the identity is written against
`totalAllocatedFixedCost` and not against the released-film rows.

---

## 6. Recap on the Week-86 Owner save

### 6.1 Per-film three-line block

Every one of the nine films, as rendered (`recap-studio-economic-<id>-contribution` /
`-allocated` / `-result`):

| productionId | Title | Contribution (direct) | Allocated share | **Studio-economic result** |
|---|---|---|---|---|
| `prod-0000` | The Wayward Locomotive | `+$8K` (raw `8,333.62`) | `−$450,501 over 14 wk` | **`-$442K`** (raw `-442,167.38`) |
| `prod-0009` | The Reluctant Vineyard | `+$1.60M` | `−$352,566 over 14 wk` | **`+$1.25M`** |
| `prod-0018` | The Restless Reckoning | `-$4.98M` | `−$352,566 over 14 wk` | **`-$5.33M`** |
| `prod-0027` | Rumors of Smuggler | `-$3.04M` | `−$352,566 over 14 wk` | **`-$3.40M`** |
| `prod-0036` | The Restless Reckoning | `+$530K` | `−$352,566 over 14 wk` | **`+$177K`** |
| `prod-0045` | Rumors of Smuggler | `-$3.01M` | `−$352,566 over 14 wk` | **`-$3.36M`** |
| `prod-0054` | Rumors of Smuggler | `+$1.55M` | `−$352,566 over 14 wk` | **`+$1.19M`** |
| `prod-0063` | The Reluctant Vineyard | `-$3.02M` | `−$352,566 over 14 wk` | **`-$3.38M`** |
| `prod-0072` | Rumors of Smuggler | `-$3.42M` | `−$450,501 over 14 wk` | **`-$3.87M`** |

`allocationBasis` on every row: `ledgerProRata`. **A representative row:** `prod-0000` is
direct-cost `+$8,334` — the slate tags it `Break-even` under the `Result (direct costs)` header —
and **studio-economically `-$442,167`**. Both figures now sit on the same screen, each naming its
basis, which is the whole point of the block.

### 6.2 The reconciliation block

| Surface | testid | Rendered value |
|---|---|---|
| Studio Run Recap | `recap-fixedcost-total` | `$3,368,964` |
| Studio Run Recap | `recap-fixedcost-allocated` | `$3,368,964` |
| Studio Run Recap | `recap-fixedcost-idle` | `$0` |
| Studio Run Recap | `recap-fixedcost-identity` | "$3,368,964 allocated + $0 idle = $3,368,964 paid. …" |
| Studio Run Recap | `recap-weekly-burn` | `$39,174 / wk` |
| Studio Run Recap | `recap-capital-contribution` | `-$13.80M` (raw `-13,797,112.83`) |
| Studio Run Recap | `recap-slate-result-header` | **`Result (direct costs)`** |
| Studio Run Recap | `recap-studio-economic-basis` | "The studio's payroll and overhead for a given week are split evenly between the films occupying it that week (production or release); weeks with no film carry their cost as idle, above. An even split is a convention, not a measurement — a film does not cause a fixed cost." |

Ledger check: `financeTotals` gives payroll `-1,304,964` + overhead `-2,064,000` = `-3,368,964`;
`allocateFixedCosts` gives `total 3,368,964`, `idle 0`, and 9 per-film entries summing to
`3,368,964`. **Idle is exactly zero on this save** — the studio released a film every 9 weeks for
86 weeks, so no week was unoccupied.

### 6.3 Fixed-cost runway

| Surface | Metric | Rendered value |
|---|---|---|
| Studio Run Recap · Where you stand | **Fixed-cost runway** | **`72 wks`** |

`position` raw: cash `2,833,923.17`, weekly payroll `15,174`, weekly overhead `24,000`, burn
`39,174`, active-run revenue `0`, `fixedCostRunwayWeeks: 72`, contracts expire in `122` weeks,
`contractsOutliveRunway: true`, recovery `severe`. The recap's fixed-cost runway, the Dashboard's
`fin-runway` and the Roster's `roster-runway` are the same `72` from the same rule.

---

## 7. Closed-defect demonstrations

### 7(a) The wrong-sign case — a green "Profit" over a studio-economic loss

**Measured on:** the Owner save, the §3 bare-minimum package (rebuilt with the wizard's own default
promise — centre index 1 = −0.25, width index 1 = 0.8 ⇒ `[-0.65, 0.15]` on every axis — so it is the
identical package). `assessProfitRange` raw: `{ low: -1,812,224.73, expected: -999,560.07,
high: +62,166.71 }`; `prospectiveCycleFixedCost` `{ weeks: 14, weeklyBurn: 39174, amount: 548436 }`.
The **upside** branch is direct-positive (`+62,167`) and studio-economically negative (`-486,269`).

`FilmPackageSummary` is rendered twice on those same engine assessments. Omitting `cycleFixedCost`
is the pre-D-17A behaviour, preserved and documented in the component (`fixedCost = 0` ⇒
studio-economic ≡ contribution):

| Render | testid | Rendered value | CSS class |
|---|---|---|---|
| **OLD** (no `cycleFixedCost`) | `pkg-profit-contribution-upside` | **`Upside $62K · Profit`** | **`money pos`** (green) |
| **OLD** | `pkg-studio-economic` | *(element absent)* | — |
| **NEW** (with `cycleFixedCost`) | `pkg-profit-contribution-upside` | **`Upside $62K · Covers direct costs` `-$486K after studio fixed costs`** | **`mono`** (neutral) |
| **NEW** | `pkg-studio-economic-upside` | **`Upside -$486K · Loss`** | `money neg` |
| **NEW** | `pkg-studio-economic-disclosure` | "Film Contribution is Studio Revenue minus this film's own direct costs. The studio-economic result also subtracts $548K — the payroll and overhead the studio pays across the 14 weeks this film occupies it, at today's $39K per week. Payroll and overhead remain studio costs; this is a labelled managerial measure, not a charge against the film." | — |
| **NEW** | `pkg-profit-breakeven` | `$3.88M` (labelled "Break-even theatrical gross (direct costs only)") | — |

The word and the colour both changed; the number `$62K` did not. The same construction appears on
the **healthy** fixture's *downside* branch (§4.2): `Downside $464K · Covers direct costs`
`-$1.17M after studio fixed costs` — so the rule is symmetric, not a distress-only special case.

### 7(b) The discovery proxy — the two adversarial shapes

**D-17B current-stack remeasurement (`a48862b`; supersedes the D-17A threshold/bands below):**

| Fixture | Retired proxy | Current engine/read-model | Current result |
|---|---:|---:|---|
| top-heavy support cast (A55, $400K, fame 2/2/99) | `0.501` supported | support `0.3081930719371594`; shortfall `0.17815180816757495` | **exposed**, band `0.6804539035751012×–1.4696072647184553×` |
| old capacity-collapsed fixture (A45, $2M, fame 30/30/30) | `0.465` supported | support `0.38375856532079095`; shortfall `0` | **supported**, band `1×–1×` — it correctly ceased to be adversarial at threshold `.375` |
| replacement capacity-collapsed fixture (A35, $2M, fame 25/25/25) | `0.3875` supported | support `0.32391883513718117`; shortfall `0.13621643963418353` | **exposed**, band `0.773056314200815×–1.293566822533232×` |

The replacement fixture is committed in `tests/d17a-adv-discovery.test.ts`; it preserves the
original defect proof under the new production tuple: the retired proxy says supported while the
authoritative engine and shipped read-model both say exposed, bit-for-bit. The original D-17A
measurements below remain the accepted historical record at threshold `.45`:

**Measured on:** the two fixtures from `tests/d17a-adv-discovery.test.ts`, reproduced here with the
retired proxy (`filmPackage.ts` @ base `c679f88`) reimplemented verbatim in the probe and the
engine's own rule (`reception.ts:633-642`) reassembled from exported functions only.
`DISC_SUPPORT_THRESHOLD = 0.45`, `DISC_SUPPORT_AWARENESS = 0.55`, `DISC_SUPPORT_STAR = 0.45`,
`DISC_FLOOR = 0.2`, `DISC_CEIL = 1.8`.

**(i) Top-heavy support cast** — awareness 55, marketing $400K, cast fames lead 2 / antagonist 2 /
support 99:

| Source | `reachSupport` | `shortfall` | `exposed` |
|---|---|---|---|
| RETIRED proxy (unweighted cast mean + flat marketing bump) | `0.5010000000000001` | `0` | **`false` — "supported"** |
| ENGINE rule (`awarenessFactor` + CAST_WEIGHTED linear `starDraw`) | `0.3081930719371594` | `0.3151265068063125` | **`true` — exposed** |
| SHIPPED `discoveryExposure` read-model | `0.3081930719371594` | `0.3151265068063125` | **`true`** |

Shipped band: `spread 0.6191493870480725`, `bandZ 1.28`, `bandLow 0.4527065230550271`,
`bandHigh 1.8`, `clippedLow false`, `clippedHigh true`.

**(ii) Capacity-collapsed maximum campaign** — awareness 45, marketing $2.00M, cast fames 30/30/30:

| Source | `reachSupport` | `shortfall` | `exposed` |
|---|---|---|---|
| RETIRED proxy | `0.465` | `0` | **`false` — "supported"** |
| ENGINE rule | `0.38375856532079095` | `0.14720318817602016` | **`true` — exposed** |
| SHIPPED `discoveryExposure` | `0.38375856532079095` | `0.14720318817602016` | **`true`** |

Shipped band: `spread 0.19767141388075385`, `bandLow 0.7764528109090473`,
`bandHigh 1.2879082745920265`, **neither clip reached** — so this package's copy quotes
`[0.78×, 1.29×]` and does **not** name the 0.2×/1.8× clips, unlike §3.4's severe case.

In both shapes the retired proxy told the player the film was reach-supported while the engine was
about to apply discoverability variance to its opening. The shipped read-model sides with the
engine, to the last bit.

### 7(c) Post-cliff truth — the fired-everyone studio

**Measured on:** *driven fixture*, seed `evidence-cliff` — a 12-strong founding roster on 52-week
contracts, founded, 2 weeks advanced, then **every contract released**.

| Fact | Before firing | After firing everyone |
|---|---|---|
| contracts | `12` | `0` |
| cash | `19,696,654` | `16,729,829` (terminations charged) |
| `economyEngaged` (persisted) | `true` | **`true`** — never cleared |
| `isEmploymentEngaged` | `true` | `false` (roster-informational only) |
| weekly burn | `151,673` | `15,000` |
| weekly overhead | `33,000` | **`15,000`** — `OVERHEAD_BASE` continues |

| Surface | testid | Rendered value |
|---|---|---|
| Dashboard | `fin-payroll` | `$0` |
| Dashboard | **`fin-overhead`** | **`$15K`** |
| Dashboard | `fin-burn` | `$15K` |
| Dashboard | `fin-runway` | `1115 wk` |
| Dashboard | **`assemble-blocked-reason`** | **"No Actor is currently available — you have too few Actors under contract. Sign another Actor, hire an available freelancer, or wait for the film to finish."** |
| Dashboard | `assemble-film` | **disabled** |

`assemblyAvailability(state)` raw: `{ canAssemble: false, missingRoles: ["actor"], reason: … }`.

**Overhead really continues:** ticking once after the cliff debits cash `16,729,829 → 16,714,829`
and writes the ledger entry `{ week: 2, kind: "overhead", amount: -15000, note: "weekly studio
overhead" }`.

**Engine agreement (no D-11.12 surprise).** A greenlight assembled from the retired D-1 open pool
now fails at the engine with:
`applyActions: greenlight rejected — talent "t-wri-00" is neither studio-contracted nor an available
freelancer (D-11.12)` — and the screen no longer offers it, so the player never reaches that error.

**The exploit is dead.** From the D-16 300-seed × 208-week corpus at this HEAD
(`out/d16-economy-lab/corpus/`):

| Policy | Baseline median end cash | After | Baseline p10 / p90 | After p10 / p90 | Baseline films | After films |
|---|---|---|---|---|---|---|
| `P15_exploitDisengage` | **`$146.22M`** | **`$16.03M`** | `$36.90M` / `$270.01M` | `$15.81M` / `$16.24M` | **`44`** | **`0`** |

Its "rejected actions" column goes from **`0` at baseline to `60,600` at this HEAD**, with the top
rejection reason `greenlight: talent "t-wri-06" is neither studio-contracted nor an availa…` ×730 —
the policy still tries the exploit, is refused every time, and makes no films.

### 7(d) Never-engaged regime truth — one 100% basis everywhere

**Measured on:** *driven fixture*, seed `evidence-regime` — `generateWorld` (never engaged; no
founding draft), exported as a **literal V5 envelope** and reimported through `importSaveJson`,
exactly as "Load save" does. After import: `economyEngaged: false`, `founding: null`,
`regimeStudioShare: 1` (against `STUDIO_RENTAL_BLENDED = 0.52`).

**Prospective (Assembly break-even chain)** on committed `2,698,966.177868303`:

| Quantity | Value |
|---|---|
| direct break-even gross | `2,698,966.177868303` |
| cycle-inclusive break-even gross | `2,698,966.177868303` |
| `fixedCost` | `{ weeks: 14, weeklyBurn: 0, concurrency: 1, amount: 0 }` |
| what the retired constant 0.52 basis would have demanded | `5,190,319.5728236595` (**1.92× the truth**) |

**Retrospective**, after greenlighting an open-pool package and advancing to release
(`prod-0000`, gross `6,717,437.413904969`, `theatricalRuns.length === 0`, single-lump ledger credit
`{ week: 8, kind: "boxOffice", amount: 6717437.413904969, productionId: "prod-0000" }`):

| Read-model | Studio Revenue | Contribution / profit |
|---|---|---|
| `releaseScorecard` (Dashboard) | `6,717,437.413904969` | `3,108,746.2398631955` (`roi 0.8614608704189464`, label `Profit`) |
| `explainRelease` (Release / Autopsy) | `6,717,437.413904969` | `3,108,746.2398631955` (committed `3,608,691.174041773`) |
| the RETIRED 52% basis on the same film | `3,493,067.455230584` | — |

| Surface | testid | Rendered value |
|---|---|---|
| Dashboard | `release-prod-0000-studiorev` | `$6.72M` |
| Dashboard | `release-prod-0000-contribution` | `$3.11M` |
| Dashboard | `release-prod-0000-result` | `Profit` |
| Dashboard | `fin-overhead` | `$0` |
| Dashboard | `fin-burn` | `$0` |

Scorecard, release narrative and both break-evens now agree on the same number. Before the fix the
Dashboard and the Release/Autopsy screens differed by a factor of 1.92 on the same film.

---

## 8. Caveats

1. **This is read-model-level evidence, not screenshots.** Every value is the text content of the
   element carrying the named `data-testid`, read after rendering the real component into jsdom, or
   the raw selector output that feeds it. It proves what the screens *compute and emit*; it does not
   prove typography, layout, colour rendering, or that the element is visible on a given viewport.
   Where colour carries meaning (§7(a)) the CSS class is reported instead of the pixel.

2. **P15's corpus rows are now EMPTY, not merely shifted.** The exploit policy makes **0 films** at
   this HEAD (baseline: 44) and ends on `$16.03M` (baseline: `$146.22M`), with p10/p90 collapsed
   from `$36.90M / $270.01M` to `$15.81M / $16.24M`. Its per-film and per-run statistics read `n/a`
   because there are no films to compute them over. **The invariance claim covers the 14 player
   policies plus the oracle**, whose rows are identical between the baseline and after corpora — a
   full `diff` of the two `summary.md` files changes exactly: the title line, the P15 row in each of
   five tables, and the *all-arms* win-share line (where the exploit's share falls from 60% to 29%
   and the oracle's rises from 29% to 56%, purely because the exploit stopped winning). The
   **player-only** win-share matrix is unchanged.

3. **The D-16 report's "14.5%" and "186wk/72wk" figures are re-derived here, not quoted.** The D-16
   analysis directory those numbers came from is absent at this HEAD, so the contract (§6) rules
   them non-citable. In their place:
   - the runway contradiction is re-derived directly on the Owner save (§2.1): the shipped ONE
     runway renders `72 wk` on both screens, and the retired payroll-only rule, recomputed inside
     the probe, gives `186`;
   - the discovery-proxy miss rate is replaced by the two adversarial shapes (§7(b)) with their
     actual shortfalls (`0.315` and `0.147`), which demonstrate the *kind* of package the proxy
     missed rather than a population percentage. No population miss-rate is claimed here.

4. **Section 3's "understatement" percentage is package-specific.** `fixedCost ÷ committed` is
   `27.21%` for the Week-86 bare-minimum package and falls as the commitment grows (18.8% at the
   $1M-marketing rung on the same save). The figure is a property of the package and the studio's
   current burn, not a constant.

5. **§3's 9/9 negative-centre table uses `allocatedFixedCost` in place of the burn current at each
   greenlight.** The save does not retain the historical weekly burn, so each film is charged the
   fixed cost it *actually* consumed over its 14 occupied weeks. Both the direct and the
   studio-economic centres are negative for all nine films, so the substitution does not change the
   count.

6. **Driven fixtures are not the Owner's save.** §2.3 (rendered renewal), §4 (healthy contrast), §5
   (concurrent overlap), §7(c) (post-cliff) and §7(d) (never-engaged) are deterministic states built
   from named seeds through the public actions, because the Owner save does not contain those
   situations (no open renewal window, no overlapping productions, no cliff, an engaged economy).
   Each table names its seed and the exact sequence used.

7. **The Owner's save was never modified.** It is read once per probe with `fs.readFileSync` and
   migrated V5 → V6 in memory. No probe writes to it, and no probe writes anywhere inside this
   repository — the probe scripts live outside the worktree.
