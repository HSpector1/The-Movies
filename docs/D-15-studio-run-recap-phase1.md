# D-15 Phase 1 — Studio Run Recap: source matrix & read-model design

**Branch:** `phase-5.3-studio-run-recap-v1` (off `main` `e87c34f`). **Read-only, additive, no merge.**
Design doc for the Phase-1 owner review. The recap explains an existing run; it changes **no**
economy, save schema, or D-14 progression.

## Persistence decision — NO new core persistence

Every recap value is reconstructable from the live `GameState` (`SaveFileV5.state`): `studio.cash`,
`ledger` (signed, per-kind, per-`productionId`), `theatricalRuns` (per-film Studio Revenue),
`studio.releasedFilms` (`FilmResult` frozen), `careerEvents` (frozen `TalentCareerEvent`),
`contracts`, `concepts`, `market.tick`. The D-14 closure (§13) and the workflow audit both confirm
"needs no new core persistence." **Ruling: reconstruct; add no field, bump no save version.** The one
irreducible limitation is recorded under *Evidence limitations* below — no value is fabricated to fill
it.

## Canonical definitions (from `docs/D-12-economy-contract.md` §3, §8, §16)

- **Theatrical gross** = `FilmResult.boxOffice.total` (= `opening × legs`).
- **Studio Revenue** = `Σ weeklyGross × STUDIO_RENTAL_BLENDED(0.52)`; the credited cash lives on
  `TheatricalRun.cumulativeStudioRevenuePaid` and as `studioRevenue` ledger entries.
- **Committed cost** (per film) = `−Σ ledger[kind∈{production,freelancerFee}, productionId]`
  (`filmCommittedCost`). Payroll & overhead are **NOT** allocated per film (§8).
- **Film contribution** = **Studio Revenue − committed cost** (§3). This is the only "contribution."
  (Note: `standing.ts` ROI uses full box-office gross for the reputation channel — a DIFFERENT basis;
  the recap never uses it for money.)
- **Weekly burn** = `weeklyPayroll + weeklyOverhead` (one-time greenlight debits are excluded, §16).
- **Runway** (§16) = `⌊cash / max(ε, burn − expectedWeeklyRunRevenue)⌋`; `—` when net-cash-positive.

## Field-by-field source matrix

Legend — **F** = frozen record, **D** = derived selector (pure, deterministic), **C** = recap-owned
construction (documented convention). "Reuse" names an existing selector.

| Recap value | Authoritative source | Derivation / reuse | F/D/C | Persist? |
|---|---|---|---|---|
| throughWeek | `state.market.tick` | `selectWeek` | F | no |
| startingCash | `TUNING.INITIAL_CASH` ⋈ `cash − Σledger` | reconciliation invariant (cross-checked) | D | no |
| currentCash | `state.studio.cash` | `selectCash` | F | no |
| cashChange | current − starting | subtract | D | no |
| totalCommitments | `ledger` kind `production` | `−financeTotals.production` | D | no |
| totalStudioRevenue | `ledger` kind `studioRevenue` | `financeTotals.studioRevenue` | D | no |
| totalFilmContribution | above | `studioRevenue + production` (prod is −) | D | no |
| totalPayroll / totalOverhead | `ledger` kinds | `−financeTotals.{payroll,overhead}` | D | no |
| currentWeeklyPayroll / Overhead / Burn | contracts + tuning | `weeklyPayroll` / `weeklyOverhead` / `weeklyBurn` | D | no |
| per-film commitment | `ledger` by `productionId` | `filmCommittedCost` | D | no |
| per-film studioRevenue | `TheatricalRun.cumulativeStudioRevenuePaid` | run lookup (actual credited) | F | no |
| per-film contribution / roi / class | above + scorecard | `releaseScorecard` (`resultLabel` Profit/Loss/Break-even) | D | no |
| per-film gross / critic / audience / forecast | `FilmResult` (+ `forecast?`) | frozen fields; `releaseScorecard` | F | no |
| avg critic / audience | released films | mean of frozen scores | D | no |
| talent development | `state.careerEvents` (frozen) | aggregate per `talentId` (NO recompute) | F | no |
| current OVR / Star Power | `Talent` + events | `roleOVR`; `fame`; begin = first event's `*Before` | F/D | no |
| concentration (genre/lead/team/budget/cadence) | films + participants + ledger | counts / shares over released films | D | no |
| currentWeeklyBurn / activeRunRevenue / runway | economyView | `financeView` / `runway` | D | no |
| cheapestLegalCommitment | `concepts` + `SHAPE_OPTIONS` + grid + era | `0.75 × min(baseNeg × minDemand × costScale) + $100k`, contracted roster ⇒ talent 0 | C | no |
| typicalRecentCommitment | `ledger` by `productionId` | median of the most recent K released films' commitments | C | no |
| affordability / shortfall (cheapest & typical) | economyView solvency | `commitmentPreview(state, amount)` → `affordable`, `cashAfter` (shortfall = −cashAfter) | D | no |
| weeksUntilContractsExpire | `contracts.endWeekExclusive` | `min(endWeekExclusive) − tick` (+ range) | F | no |
| waiting impact | runway net | `netWeeklyCash = expectedWeeklyRunRevenue − burn` | D | no |
| recovery classification | all of the above | explicit rule table (below) | C | no |
| inflection points | `ledger` cash timeline + films | peak/trough/first-loss/streak/first-unaffordable/best/worst/talent | D | no |
| warnings | derived conditions | bounded rule set (below) | C | no |

## Read-model contract — `src/core/studioRunRecap.ts` (pure)

One immutable function `studioRunRecap(state: GameState): StudioRunRecap`. Pure, deterministic, never
mutates state, never advances RNG, never recomputes a film outcome or a D-14 career event — it reads
frozen records and reuses `economyView` / `releaseScorecard` math. Lives in core (like `economyView`,
`talentSummary`, `filmPackage`); the UI reaches it only through `ui/src/engine/adapter.ts`.

Sections returned: `summary` (A), `capital` (B), `films` (C), `talent` (D), `concentration` (E),
`position` (F) with `recovery` classification, `inflectionPoints`, `warnings`, `evidenceLimitations`.

### Recovery classification (explicit, derived — never promises success)

- **E — incomplete**: engine not engaged / no released films / missing frozen data → show what exists,
  suppress advice.
- **D — normal production unavailable**: the cheapest legal film is **not** affordable (cash < cheapest
  commitment).
- **C — severe**: cheapest affordable, but typical recent **not** affordable **and** no active revenue
  **and** runway is finite (burning) → recovery needs cheap films/time.
- **B — constrained but recoverable**: cheapest affordable, typical **not** affordable, but either
  active revenue exists **or** runway is long/positive.
- **A — healthy**: a typical recent film is affordable **and** net-cash-positive (or no burn pressure).

Each returns explicit `reasons[]`. Distinguishes: a legal action exists · a reasonable path exists ·
a normal recent production is affordable · waiting helps/hurts · active revenue exists.

### Warnings (bounded, evidence-linked, non-deterministic about future randomness)

`cashPositiveButNormalUnaffordable`, `noActiveRevenue`, `waitingBurnsCash`, `optionsBelowTypical`,
`repeatedLosses`, `highGenreConcentration`, `highLeadConcentration`, `oneMoreFailureNarrowsOptions`
(phrased "another loss similar to your recent losses would reduce normal production options further" —
never "you will fail").

## Evidence limitations (honest)

1. **Active-run contribution is to-date.** For a still-earning run, per-film Studio Revenue is the
   credited amount so far (`cumulativeStudioRevenuePaid`); the projected total (`gross × share`) is shown
   separately. At Week 86 all 9 runs are complete, so this is not exercised.
2. **Cheapest legal / typical recent are recap conventions**, not engine invariants (no engine budget
   floor; no stored per-film budget). Documented above; computed deterministically.
3. **Legacy/M0A films** fold salaries into a single `production` ledger entry; commitment reconstruction
   differs from engaged mode. The Week 86 save is fully engaged (V5) → unaffected.
4. **No routing/URL** (App uses a `Screen` union) — the recap is reached from Dashboard, not bookmarkable.

---

## Phase-1 bounded revision (owner gameplay review)

The owner accepted the architecture/data and requested bounded presentation + classification
corrections. Applied on this branch (no economy/persistence/save change):

### Break-even classification (exact rule)

A film is **Break-even** when `|contribution| ≤ max($25,000, 1% × committed cost)` — a negligible
return relative to the commitment. Otherwise the sign decides Profit/Loss. Rationale: a rounded-0%-ROI
film (e.g. **The Wayward Locomotive**, +$8,334 on a $10.92M commitment ≈ 0.076%) is not a meaningful
success; the next-closest Week 86 film (+$530K ≈ 8.4%) is comfortably outside the band, and no loss
(all worse than −57%) is misclassified. Week 86 slate → **3 profit / 1 break-even / 5 loss**. Actual
contribution and ROI values are unchanged; only the label changes. Constants: `BREAKEVEN_ABS = 25_000`,
`BREAKEVEN_FRACTION = 0.01` in `studioRunRecap.ts`; exported helper `classifyContribution`.

### Cash-timeline convention (explicit)

- **Opening balance** = cash **before any commitments** = `INITIAL_CASH` ($20M) = the run's true peak
  start. Exposed as `capital.openingBalance` and always the first Key Moment.
- **End of Week N** = the running cash **after** that week's ledger (`capital.cashTimeline`). So "End of
  Week 0" (~$9.04M) is post-commitment and correctly below the opening balance — the two are no longer
  both labelled "Week 0".
- **Highest cash** surfaces a separate `peakCash` inflection **only if** some end-of-week close exceeded
  the opening balance; otherwise the opening balance *is* the peak (Week 86: no false "Week 0 peak").
- `firstTypicalUnaffordable` uses the same end-of-week series (Week 86: Week 54).

### Recovery + affordability language

- Recovery `severe` copy narrowed: a legal path exists but waiting alone worsens the position; when
  `contractsOutliveRunway` (contract expiry > fixed-cost runway, Week 86: 122wk > 72wk) the studio cannot
  wait contracts out. New `CurrentPosition` flags: `waitingAloneWorsens`, `contractsOutliveRunway`.
- Player labels: **"Lowest estimated production commitment"** ("Estimated from currently available
  production inputs.") and **"Recent typical commitment"** ("Median production commitment of your last
  three released films."). Formulas stay in this doc, not the default player view.

### Presentation (UI)

Read-model returns **structured numbers**; the screen formats every player-facing value with the shared
`money()`/`signed()` formatters (no raw integers). Inflection sentences and warning text are composed in
the UI. Cash-over-time is a compact inline **SVG line chart** (opening reference, current, low point;
axis labels; `role="img"` + text caption; not colour-only) — the 86-row table is collapsed behind
**"View weekly cash data"**. Warnings are **prioritised**: `RecapWarning { code, severity:
important|caution|observation, priority }`; the screen shows the **top 3** and collapses the rest under
**"More strategic observations"**. Methodology moved to a collapsed **"How these figures are calculated"**.

### Final visual polish (owner review 3)

- **Chart annotations** are right-aligned inside a reserved right margin (`text-anchor="end"`), so
  "Opening $20.00M" / "Now …" / "Low …" never clip at any viewport or 125% zoom (verified by an e2e
  bounding-box check). Axis endpoints read **"End Wk 0" / "End Wk 85"**.
- **Timeline wording** is one convention: heading "Cash history through Week 86"; caption "Opening
  balance was $20.00M … 86 recorded weekly closing balances, from the end of Week 0 through the end of
  Week 85"; collapsed control "View 86 weekly closing balances". 86 observations are never called "85
  weeks".
- **Result pills** use `white-space: nowrap` ("BREAK-EVEN" stays on one line); the film table scrolls in
  an `overflow-x:auto` container so the page never overflows.
- **No repository path** appears in the player UI; the methodology explains figures in plain language
  (the doc/formulas live here, not on screen).
