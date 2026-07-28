# D-12 — Studio Economy and Theatrical Runs (design contract)

**Status:** authored for owner checkpoint review; **NOT yet implemented** (Phase 5.2A Cycle-4B / Commit 2 is gated on owner approval).
**Branch:** `phase-5.2-economy`, authored above Cycle-4A commit `0f9e4bd` (current HEAD). The Fable research reviewed the tree at `b6f378a`; nothing economy-relevant changed between `b6f378a` and `0f9e4bd` (Cycle-4A is non-financial UX). Main `eb9dd43`.
**Source of authority:** the owner rulings in the Cycle-4A/D-12 prompt (2026-07-27) + the Hill fame-saturation ruling; the Fable synthesis `~/Desktop/studio-economy-review/FINAL-REPORT.md` and specialist reports 01–07 are the accepted research; repository code + prior D-rulings are evidence of current behavior.

Every value below is tagged exactly one of: **[OWNER]** owner decision · **[DERIVED]** derived from current code · **[DR]** design recommendation · **[ICH]** initial calibration hypothesis · **[DEF]** deferred.

---

## 0. Executive summary

Today Studio Revenue **= 100% of box-office gross**, credited as a **single lump** at the release tick (`tick.ts:206`, ruling D-11.18). This one fact is the proven root cause of both failing balance-study checks (`payrollMatters`, `bestStrategyNotAlwaysHighestOVR`) and every owner playtest complaint (flat cash, single-event income). D-12 replaces it with the **Blended-Share Theatrical Run**: gross is *conserved* but **paid out over 6 weeks**, the studio keeps a **blended ~52% rental share**, a **Hill fame-saturation** flattens star dominance, and **light weekly overhead** gives roster size a cost. All new behavior is **additive and gated** behind the existing `employmentEngaged` seam, so the frozen M0A corpus stays **byte-identical**. A new **SaveFileV4** persists active runs. Negative cash keeps its no-game-over meaning (D-1/D-11.5); a new **solvency gate** blocks only *voluntary* commitments that would overdraw immediately.

---

## 1. Authority and supersession

**D-12.1 [OWNER].** D-12 lifts the distribution-economics deferral in **D-11.18 / D-11.20** *for this milestone only*, authorizing: (a) a blended studio-rental share of theatrical gross, (b) multi-week theatrical runs, (c) light studio overhead, and (d) a Fame→opening-reach saturation surface. It supersedes **only** the conflicting deferral language; all other D-11 provisions stand. **D-1 (negative cash carries no mechanical consequence; no game-over) and D-11.5 are PRESERVED** and constrain D-12 (see §11–12).

**D-12.2 [OWNER].** The following remain **deferred / non-goals** (§24): persistent scripts & Co-Writers, script market, filmmaker pitches, facilities, Acting School, loans/debt/investors/taxes, streaming/TV/library revenue, acquisitions, rival studios, era progression, studio-lot integration, Gate D, and **week-varying** studio shares.

---

## 2. Economy principles (normative)

1. **Gross is attendance; Studio Revenue is money.** `FilmResult.boxOffice.total` stays the total theatrical **gross** (it feeds `standing.ts:99` awareness — overwriting it breaks M0A byte-identity). Studio Revenue is a **new derived quantity**. [OWNER, ruling H]
2. **Conserve the total; change only the timing and the share.** Σ weekly gross over the run = `opening × legs` (today's `boxOffice.total`), up to documented rounding. [DERIVED/OWNER]
3. **Additive and gated.** Every new behavior fires only when `economyEngaged(state)` (≡ `employmentEngaged` this milestone); the headless corpus never engages it. [DR]
4. **No new sim-stream draws, ever.** The sim stream advances exactly one gaussian per release (the critic draw). The weekly schedule is **closed-form**; any future variance uses a NEW derived stream keyed by `productionId`, never `state.rngState`. [DERIVED]
5. **Blended percentages, not accounting waterfalls.** One studio-rental share; one disclosure line; no exhibitor/distributor line items in the player's face. [OWNER, ruling G]
6. **Every displayed number drives a decision;** replace the lying runway before adding numbers; show only next-week bands, never the deterministic future curve. [DR]
7. **Downside scales with ambition** (the share haircut makes the revenue ceiling proportional while budgets are paid in full). **Failure hurts for weeks but never kills by rule** (D-1/D-11.5). [OWNER]
8. **Ratios era-invariant, dollars era-scalable** — splits/decays/legs dimensionless; every new nominal constant routes through `TUNING` for a future `era.revenueScale`. [DR]
9. **Frozen saves stay frozen** — behavior change ⇒ explicit new save version. [OWNER]

---

## 3. Definitions

- **Theatrical gross** — `opening × legs`, exactly as `computeBoxOffice` produces it today (`reception.ts:462-464`). Stored on `FilmResult.boxOffice.total` and as the run's cumulative gross. [DERIVED]
- **Studio Revenue** — `Σ (weekly gross × STUDIO_RENTAL_BLENDED)`; the only quantity that changes studio cash from a release. [OWNER]
- **Production cost / marketing** — committed in full at greenlight (`negative + marketing`, + freelancer fees engaged) (`actions.ts:379-436`). [DERIVED]
- **Contribution / profit** — `Studio Revenue − committed cost − (attributable overhead is NOT allocated per film; see §8)`. Records/UX distinguish gross · Studio Revenue · production cost · marketing · profit. [OWNER, ruling H]

---

## 4. Active theatrical runs (state)

**D-12.4 [OWNER — clarification 4].** Add ONE additive collection to `GameState` — a **history**, not an active-only list (empty on M0A/legacy → byte-identical):

```ts
theatricalRuns: TheatricalRun[]   // ALL runs, ever — completed records are retained, never deleted

type TheatricalRunStatus = 'active' | 'completed' | 'legacyCompleted'

TheatricalRun = {
  productionId: string          // ties the run to its FilmResult (immutable)
  conceptId: string             // for display without touching mutable state
  releaseTick: number           // week the run opened
  totalWeeks: number            // N_WEEKS modeled (6); 1 for a legacyCompleted single historical payout
  weekIndex: number             // weeks credited so far (0-based); === totalWeeks when finished
  weeklyGross: number[]         // locked gross per week, length totalWeeks (Σ = opening×legs)
  studioShare: number           // blended rental share LOCKED at release (1.0 for legacyCompleted)
  cumulativeGrossPaid: number   // running Σ weekly gross credited so far (display)
  cumulativeStudioRevenuePaid: number  // running Σ Studio Revenue ACTUALLY credited to cash
  economyModelVersion: number   // 1 = D-12 blended; 0 = legacy full-gross (migrated V3)
  status: TheatricalRunStatus
}
```

- **`status` is the source of truth, not deletion.** A run is `active` while `weekIndex < totalWeeks`, becomes `completed` when `weekIndex === totalWeeks`; completed records **remain immutable and available for film history**. The UI derives "active runs" by **filtering `status === 'active'`** — never by removing records. [OWNER]
- The run is **locked at release**: `weeklyGross`, `studioShare`, `economyModelVersion` are computed once from already-resolved reception outputs (opening, legs) + `TUNING`, never recalculated from live talent/market state. [DR]
- `FilmResult` stays **terminal and immutable**; `FilmResult.boxOffice.total` remains the conserved gross (= `Σ weeklyGross` for D-12 runs). History is preserved (north-star constraint). [OWNER]
- **Multiple active runs may earn in the same week** (active runs iterated in stable `productionId` order in tick step 3.5). [DR]
- **`legacyCompleted`** runs (from V3 migration, §20) are historical placeholders: `economyModelVersion = 0`, `studioShare = 1.0`, `totalWeeks = 1`, `weekIndex = 1`, `weeklyGross = [gross]`, `cumulativeStudioRevenuePaid = the full gross actually credited under V3`, **never paid again** (no remaining payable), and clearly identify the legacy full-gross model. [OWNER — clarification 4]

---

## 5. Weekly gross schedule (formula + conservation)

**D-12.5.** At release (engaged only), build `weeklyGross[]` deterministically (one pure helper, `theatricalSchedule(opening, legs)`):

- `N_WEEKS = 6` modeled weeks. **[ICH]** (red team: 4 suffices; 6 expresses slow-burns; PM resolution 6.)
- **Week 1 gross = `boxOffice.opening`** (the authoritative opening; unchanged). **[DERIVED]**
- Weeks distributed by geometric hold `h = HOLD_BASE + HOLD_LEGS_COEF × (legs − LEGS_MIN)`, i.e. `raw[w] = h^w`, `w = 0..N-1`. **[ICH]** `HOLD_BASE = 0.42`, `HOLD_LEGS_COEF = 0.09`, `LEGS_MIN = 1.8` [DERIVED].
- Normalize `raw` to sum to gross, apply a **`TAIL_FLOOR = 0.05`** per-week floor (each week ≥ 5% of gross), then **re-normalize so the total is conserved exactly** to `opening × legs`. **[ICH]** for TAIL_FLOOR.
- **Conservation property (tested):** `abs(Σ weeklyGross − opening × legs) ≤ ε` (rounding only). Week-1 share of gross = `1/legs` (front-loaded blockbuster ≈ 56% wk1; legs-3.7 sleeper ≈ 27% wk1). **[DERIVED consequence]**
- **No RNG.** The schedule is closed-form from `opening`+`legs`; reload-exact by construction (persisted data). [DERIVED]

---

## 6. Studio Revenue share

**D-12.6 [OWNER + ICH].** Each earning week credits `weeklyGross[weekIndex] × STUDIO_RENTAL_BLENDED` to cash. `STUDIO_RENTAL_BLENDED = 0.52` (sweep range 0.42–0.62; **[ICH]**, harness-tuned). **One blended share throughout the run** — the week-varying rental array is **[DEF] dropped** (red-team C1: it silently raised the effective share to ~0.55 and broke every headline break-even). The same share applies to every week of a given run and is **locked** on the run at release. Only Studio Revenue changes cash; **100% of gross is never credited** in the engaged path.

---

## 7. Fame saturation (the Hill ruling)

**D-12.7 [OWNER — surface & form; ICH — constant].** One canonical pure helper:

```ts
fameReach(fame) = clamp(fame, 0, 100) / (clamp(fame, 0, 100) + FAME_REACH_HALF_SAT)
```

- `FAME_REACH_HALF_SAT = 50` — **[SELECTED CALIBRATION VALUE — subject to final integrated harness and owner playtest]** (owner 2026-07-27; harness-tuned across {25, 35, 50, 65, 80, 100}; no longer an unresolved form-level decision). At K=50: fame 0→0.00, 20→0.29, 50→0.50, 68→0.58, 100→0.67. K < 25 is **rejected** — it compresses moderate-to-high Fame too aggressively (f50→f90 only +0.12) and would optimize the spread metric at the expense of the intended fantasy; K=50 keeps unknowns at zero, low Fame meaningfully above zero, moderate and high Fame both valuable, diminishing marginal returns at the extreme, a legible commercial hierarchy, and star-heavy no longer dominant.
- **Properties (tested):** monotonic, strictly increasing for valid fame, concave (marginal gain 10→20 > 80→90), continuous, no hard cap, deterministic. It is **only the fame-driven component of opening reach** — NOT total awareness/reach, audience quality, film quality, an audience cap, or a marketing replacement. **Do NOT normalize to 1.0 at fame 100.** [OWNER]
- **Integration — OPENING-REACH ISOLATION (owner clarification 1; resolved).** Today `starDraw` (the `fame/100`-driven aggregate, `reception.ts:385-392`) feeds `segmentAppeal`, which drives **both** the opening-reach path AND `weightedAudienceScore` (legs). The owner ruling targets **opening reach only**. D-12 therefore performs a **bounded decomposition** so the Hill saturation applies to **exactly one** quantity — the Fame-driven component of *opening reach/awareness* — while:
  - the existing **linear Star Power contribution to segment appeal and to legs is UNCHANGED**;
  - the greenlight **forecast and the realized opening** both call the same canonical `fameReach` helper;
  - saturation is applied **exactly once** (no double application across forecast/realized or across opening sub-terms);
  - the **ungated / M0A path retains the current linear behavior** → byte-identical.
  - Concretely: `segmentAppeal` keeps its current linear `0.25·starDraw` (feeding both reach and legs). The **opening** computation additionally scales its Fame-driven reach share by `fameReach(fame)/(fame/100)` (i.e. substitutes the saturated fame term for the linear one) **only in the opening/awareness aggregation** (`computeBoxOffice` opening path + the forecast's opening estimate), gated on `economyEngaged`. Legs (`weightedAudienceScore`), critic, cohesion, craft, OVR, salary, Fit, and stored Star Power are **untouched**. The decomposition is a bounded, gated addition to the opening aggregation — it does not restructure `computeSegmentAppeal`.
- **Identifiability control [OWNER].** Evaluate the Hill transform at the **currently approved fame-channel weight** (the `0.25·starDraw` share of segment appeal and `CAST_WEIGHT`, unchanged). Tune **only K**. If the channel weight itself must change, report it as a **separate** tuning decision with before/after sensitivity. Do not mask an ineffective curve by shrinking the whole fame channel.
- **Unchanged [OWNER]:** stored/displayed Star Power, OVR, professional skill, salary formulas, audience reception (segments/legs), critic response, Project Fit. Only the fame→opening-reach contribution changes.

---

## 8. Marketing, overhead, payroll, production cash flow

- **Marketing [OWNER/DERIVED].** Keep the single existing channel `marketingQuality = mkt/(mkt+400k)` (`reception.ts:437`) **exactly** — already diminishing-returns. Committed at greenlight, **sunk**, **cannot be increased after greenlight**; no late push / phases / reactive marketing this milestone [OWNER, ruling C]. Downside is emergent (marketing buys opening height, never legs; an oversold high-mismatch film opens big and collapses). Surfaced as a deliberate decision on the Release Strategy screen (§16). No new reception formula.
- **Overhead [ICH].** `weeklyOverhead = OVERHEAD_BASE + OVERHEAD_PER_EMPLOYEE × headcount`, `OVERHEAD_BASE = 15_000`, `OVERHEAD_PER_EMPLOYEE = 1_500` (per contracted employee). New ledger kind `overhead`, tick step 7.5, **gated**; absent from legacy/M0A. A legibility/roster-sizing lever (moves Y3 medians ~2–4%), not a balance lever. **No facilities / active-production overhead** this milestone [OWNER/DEF].
- **Payroll [DERIVED].** Mechanic unchanged (`round(annualSalary/52)` weekly, `tick.ts:346-358`). It starts to matter because revenue shrinks toward the cost basis.
- **Production cash flow [DERIVED].** Full commitment at greenlight retained; **no** per-tick production spend or milestone payments this milestone (the revenue schedule fixes the flat-weeks feel from the income side). Freelancer fees unchanged (one-off at greenlight). **Overhead/payroll are NOT allocated to any single film's contribution** unless a future D-ruling defines such managerial accounting. [DR]

---

## 9. Weekly tick order (insertions; no reordering)

The 8 numbered steps are unchanged except two gated insertions. **The sim stream is still advanced only by the RECEPTION critic draw.**

| # | Step | New economy work (gated on `economyEngaged`) |
|---|---|---|
| 1 | PRODUCTION advance | unchanged |
| 2 | RELEASE collect | unchanged |
| 3 | RECEPTION resolve + **open run** | **CHANGE (gated):** instead of the single `cash += total` lump (`tick.ts:206`), **open a `TheatricalRun`** with `status:'active'`, `weekIndex:0`, locked `weeklyGross`+`studioShare`+`economyModelVersion:1`. **Release resolution credits NO Studio Revenue itself** (no "week 0" payment) — the run's first week is paid by step 3.5 in this same overall tick. NOT engaged → unchanged single-lump `boxOffice` credit (byte-identical). Critic draw untouched. |
| **3.5 NEW** | **WEEKLY THEATRICAL REVENUE** | For each run with `status:'active'` (stable `productionId` order, INCLUDING a run just opened in step 3 this tick): credit `weeklyGross[weekIndex]×studioShare`, push **exactly one** `studioRevenue` entry, add to `cumulativeGrossPaid`/`cumulativeStudioRevenuePaid`, advance `weekIndex`; set `status:'completed'` when `weekIndex === totalWeeks` (record RETAINED, never deleted). No sim stream. Empty when not engaged. |
| 4 | STANDING | unchanged (still keys off the release event / gross, not weekly revenue) |
| 5 | BROADCAST | unchanged (inert) |
| 6 | DEVELOPMENT (gated OFF) | unchanged |
| 7 | PAYROLL | unchanged |
| **7.5 NEW** | **STUDIO OVERHEAD** | `if economyEngaged: debit weeklyOverhead; push kind:'overhead'`. Same guard shape as payroll → byte-identical when not engaged. |
| 8 | CONTRACT EXPIRATION | unchanged |
| — | FINALIZE | thread `theatricalRuns` through the returned state spread (like `contracts/ledger`) |

---

## 10. Ledger

**D-12.10 [DR].** `LedgerEntry` shape unchanged (`types.ts:338`). **Add two kinds** to the `LedgerKind` union (`types.ts:330`): `studioRevenue` (weekly Studio Revenue cash receipt, engaged path) and `overhead` (weekly studio overhead). The legacy/M0A single-lump credit keeps kind `boxOffice`. **Ledger records cash movements only** — the weekly **gross** lives on `TheatricalRun.weeklyGross` (display), NOT as a cash-moving entry (resolves the FINAL-REPORT PM decision vs the arch agent's offset-entries variant; avoids double counting). The reconciliation invariant **`studio.cash ≈ INITIAL_CASH + Σ ledger.amount`** (`types.ts:328`) holds unchanged and is the double-charge safety net. A purely-informational gross ledger record is **[DEF]** (would complicate the invariant; gross is fully auditable via the run/film record).

---

## 11. Solvency gate

**D-12.11 [OWNER].** One centralized helper `canAfford(state, amount): {ok} | {ok:false, reason}` used consistently by contract signing, renewal, freelancer engagement, production greenlight, marketing commitment, and any other **voluntary immediate** expense. A voluntary commitment is **rejected** when its immediate transaction would leave cash **below zero**. **Engine actions reject illegal commitments** (not a UI-only gate); the UI shows the reason and disables the action. **Unavoidable debits (payroll, overhead, existing production/theatrical commitments) may still push cash below zero** — they are never gated. A studio in negative cash may advance time, collect theatrical revenue, release employees, let contracts expire, inspect records, and recover. **No loans / emergency financing.**

---

## 12. Negative-cash recovery (D-1/D-11.5 preserved)

**D-12.12 [OWNER].** There is **no forced bankruptcy or game-over**. Negative cash is harmless by rule; it simply blocks new voluntary spending (§11) until Studio Revenue and time restore a positive balance. Low-budget films are the natural recovery tool. Late-game cash **compounding** (Y3–5) is an **accepted known limitation** this milestone — **measure and disclose** it; do **not** introduce premature money sinks (acquisitions/facilities/financing/debt/taxes/awards) to eliminate future wealth [OWNER, ruling D].

---

## 13–17. Financial UX (composes with Cycle-4A)

- **§13 Dashboard "Studio finances" card [DR]:** current cash; **Net-this-week** (the single "is money moving?" number); weekly payroll; weekly overhead; projected net weekly burn; active theatrical runs; expected upcoming weekly Studio Revenue (band); committed production/marketing; upcoming renewals; **runway (redefined — §16)**.
- **§14 Weekly report [DR]:** after every manual/simulated advance — opening cash · payroll · overhead · Studio Revenue · other debits/credits · net change · closing cash.
- **§15 Theatrical-run view [DR]:** per active release — week of run · weekly gross · weekly Studio Revenue · cumulative gross · cumulative Studio Revenue · remaining expected run (next-week band only; never the full deterministic curve or the locked total).
- **§16 Runway — CURRENT COMMITMENTS ONLY (owner clarification 2; resolved).** Dashboard runway answers *"how long can the studio survive under its CURRENT commitments?"* and **must NOT reserve cash for any hypothetical future greenlight.** `runway = cash / max(ε, currentWeeklyBurn − expectedWeeklyRunRevenue)`, where `currentWeeklyBurn = existing payroll + existing overhead + existing committed expenses (in-flight production commitments already made)` and `expectedWeeklyRunRevenue = Σ next-week Studio Revenue across ALREADY-ACTIVE theatrical runs`. Shows "—" when net-cash-positive. This supersedes the Cycle-4A-era `payrollSummary.runwayWeeks` (`cash/weeklyPayroll`). **Hypothetical future projects are NEVER mixed into Dashboard runway.** The Release Strategy screen (§17) separately shows the post-greenlight picture: cash after the proposed production + marketing commitment, projected post-greenlight burn, projected post-greenlight runway, and whether the proposed action passes the solvency gate.
- **§17 Release Strategy [OWNER].** After confirming cast + Production/Craft Lead, the film routes to a dedicated **Release Strategy** screen (a film may **not** greenlight from the staffing screen; a generic *Continue* may not bypass it). It shows: production cost · required minimum budget · budget adequacy · marketing commitment (a visible, adjustable decision) · current cash · cash after immediate commitment · Fame/reach contribution + **saturation explanation** (§7, truthful) · expected gross range · expected Studio Revenue range · expected contribution/profit range · **break-even theatrical gross** and **break-even Studio Revenue** · major upside · major downside. All values reuse the authoritative forecast/package mechanics (**no new cosmetic master score**). The final action is explicitly **`Greenlight Film`**; it preserves the locked greenlight assessment + permanent participant history.
- **§ Newspaper & autopsy [OWNER, ruling H].** Update both to distinguish **gross · Studio Revenue · production cost · marketing · profit**; the D-11.C "Studio Revenue = full box office" disclosure becomes the **real split** ("Studio Revenue = blended studio-rental share of gross; distributor/exhibitor economics abstracted"). Neither the newspaper nor the accessible autopsy (D-11.D) is removed.

---

## 18. Sim to Next Event

**D-12.18 [OWNER].** Two controls: **`Advance 1 Week`** and **`Sim to Next Event`**. Sim-to-Next-Event processes **every** weekly tick **in order** (never by editing the week number), applying payroll, overhead, theatrical revenue, production progress, active-run progress, contract countdowns, renewal windows, and all existing deterministic weekly behavior. It **stops before any blocking player decision**: a release, a run ending, a contract renewal/expiry, a **cash low-water crossing**, or a production about to release. Ordinary weekly earnings are **not** an event (they accrue silently, reported as an aggregate at the next stop — otherwise it degenerates into Advance Week). On stop it returns a summary: weeks advanced · payroll · overhead · theatrical Studio Revenue · other modeled cash movement · completed productions · releases · completed theatrical runs · current cash. **No weekly event applies twice or is omitted; a reloaded skip equals continuous play** (§21).

---

## 19. SaveFileV4

**D-12.19 [OWNER/DR].** Introduce an explicit **`SaveFileV4` (saveVersion: 4)**. **V1/V2/V3 stay FROZEN** (validators + shapes untouched); `validateSave` gains one `if (saveVersion === 4)` branch and keeps loudly rejecting unknowns. V4 persists: `theatricalRuns` (the full run HISTORY — locked `weeklyGross`/`studioShare` schedules, cumulative paid gross/revenue, `economyModelVersion`, and `status` per run), the new ledger entries, and any locked marketing/revenue forecast fields required for replay. Add `SaveFileV4` type, `validateSaveV4`, `makeSaveV4`. Revenue **timing** is a behavior change (not a readable-field addition), so V3 must **not** be silently reinterpreted — the version bump is mandatory.

---

## 20. V3→V4 migration

**D-12.20 [OWNER — clarification 4].** `convertV3ToV4` mirrors `convertV2ToV3`: never mutate input; carry `rngState` UNCHANGED; **deterministic + idempotent** (byte-identical under `stableStringify` on repeat). Chain `importLegacyV1ToV4` / `V2ToV4` / `V3ToV4`. **V3 migration rule:** for **each already-released film** in the migrated V3 save, create a `legacyCompleted` `TheatricalRun` (`economyModelVersion: 0`, `studioShare: 1.0`, `totalWeeks: 1`, `weekIndex: 1`, `weeklyGross: [film.boxOffice.total]`, `cumulativeGrossPaid: film.boxOffice.total`, `cumulativeStudioRevenuePaid: film.boxOffice.total` — **the amount ACTUALLY credited under V3, i.e. the full gross**). These have **zero remaining payable**, are **never paid again**, and clearly identify the legacy full-gross model. **Do NOT silently restate historical V3 revenue as though it had used the new 52% share.** Unreleased/active productions carry **no** run and transition to the D-12 model only at their *next* new-economy release. Reload-vs-continuous equivalence is tested **from the point of conversion**.

---

## 21. M0A and determinism

**D-12.21 [OWNER/DERIVED].** Preserve official M0A **byte identity** via the existing `economyEngaged` (≡ `employmentEngaged`) seam — the headless corpus never engages, so it keeps the D-1 single-lump path and draws zero economy randomness. Requirements: no new `state.rngState` draws; **no `Math.random`**; stable iteration order; deterministic weekly schedules; no duplicate revenue/overhead/payroll/migration payment; exact save replay; locked immutable film history. **Do NOT retune D-6; do NOT alter reception/OVR to fix economy balance** — the *only* authorized reception touch is the gated Fame→opening-reach saturation (§7), which does not change critic/craft/cohesion/legs/OVR and is byte-identical when not engaged. Proof: re-run the full M0A corpus in a `/tmp` copy; the summary must be byte-identical and all 8 flags unchanged.

---

## 22. Determinism / reload equivalence (key new test)

**D-12.22 [DR].** For a seed sample: run continuously to `K+N`; export `makeSaveV4(state@K)`, re-import, tick to `K+N`; assert `stableStringify` byte-identical to the uninterrupted run — with an **active theatrical run straddling K** and a **production mid-flight**. This is the single most important new test.

---

## 23. Balance harness (strategies + acceptance gates)

**D-12.23 [DR/ICH].** A repository-standard, deterministic harness in `src/harness/` writing to a **new `out/economy-balance/`** (never touching `out/m0a/`). **Fix the disclosed harness bug** (`studio.mjs:99` freelancer fill is empty-slot-only → invalidates the freelancer-heavy & fire-all rows) by modeling freelancer **upgrades** before gating those strategies. Simulate horizons **1 / 3 / 5 years**, ≥ **500 seeds** each, models `{current-regression, chosen, chosen+saturation}`.

**Strategies:** lean specialist · balanced · star-heavy · prospect-heavy · freelancer-heavy · depth roster · minimum legal roster · fire-all · low-budget volume · one-film-per-year · maximum budget · maximum marketing · minimum marketing · **disciplined capital-building tentpole** (owner-added 2026-07-27: builds cash on affordable films, holds a reserve, swings for a max-budget film once affordable by *strategy choice*, then keeps operating) · simultaneous releases · delayed production.

**Measure:** cash distribution; deep-negative-cash frequency; recovery; weekly burn; payroll; overhead; production cost; marketing; theatrical gross; Studio Revenue; studio-share ratio; per-film profitability; roster quality; freelancer usage; films made; active runs; idle weeks; strategy spread; late-game compounding; **affordable marketing sensitivity** (controlled: identical film + state, only spend varies, all levels affordable); **tentpole viability** (first-tentpole timing, % reaching by Y1/3/5, cost/gross/Studio-Revenue/contribution, profit + severe-loss rate, recovery, survival, follow-on production).

**Pass/fail gates [OWNER 2026-07-27 — supersedes the initial ICH].** The original universal gate — *best-active ÷ worst-active Y3 median spread ≤ 2.0×* — is **[SUPERSEDED]**. It was an Initial Calibration Hypothesis that proved **conceptually overbroad**: it wrongly treated the legitimate earnings difference between a large, fully utilized studio and a minimum-scale studio as equivalent to dominant-strategy failure. It is **not** a failed owner requirement; it is a hypothesis that a wider study showed to be the wrong shape. The controlling gates are now:

1. **Comparable-strategy dominance** — for the principal fully operating strategies (star-heavy · balanced · large-depth): highest ÷ lowest median **≤ 1.15×**; **no** strategy wins > **50%** of seeds at any primary horizon; the highest-OVR strategy is **not** the winner at every horizon; the highest-payroll strategy's advantage must be explainable by performance, not by Fame overpowering cost. *(Result 2026-07-27: comparable spread 1.04–1.10×; top win 28–34%; Y1 winner = tentpole, not star; **PASS**.)*
2. **Star-dominance** — star-heavy Y3 win share **≤ 45%** (calibration target), **hard reject if > 50%**; star-heavy median advantage over the next-best comparable strategy **≤ 10%**; Fame monotonic and commercially meaningful; Fame 90–100 does **not** guarantee profitability. *(Result: Y3 star win 31.7%; adv −9%/+3%/+5%; **PASS**.)*
3. **Small-studio viability** — minimum-scale, lean, and prospect studios: positive Y3 cash in **≥ 95%** of disciplined runs; Y3 **p10 > 0**; no frequent permanent collapse from one median failure; continued ability to produce films; **≥ 1** credible strategic advantage (flexibility · lower burn · specialist Fit · recovery speed). A minimum-scale studio is **not required to earn as much as a large studio**. *(Result: p10 $137M/$227M/$169M; 100% positive; 38 films; **PASS**.)*
4. **Global scale-spread diagnostic (secondary, NOT the dominance gate)** — retain disciplined-strategy global spread: **target ≤ 2.6×**, **hard review threshold > 2.75×**. A ~2.5× gap between a productive large studio and a minimal studio is acceptable when both remain playable and recoverable, the large studio carries greater payroll/commitment risk, and the difference does not come from an automatic highest-OVR advantage. *(Result: Y3 2.588× ≤ 2.6 ✓; Y5 2.767× nudges the review band — accepted late-game compounding, ruling D.)*

Plus the invariant gates (unchanged): `bestStrategyNotAlwaysHighestOVR` · `payrollMatters` · deep-negative < 5% for disciplined strategies · reconciliation invariant across the corpus · M0A byte-identical.

**Marketing gate [OWNER 2026-07-27].** Zero-film output from an *unaffordable* commitment is classified as **strategy failure, not marketing-concavity evidence** (the max-marketing exploit strategy is retained only as an exploit probe). The concavity claim is proven instead by an **affordable controlled experiment** (min/low/moderate/high/max-affordable spend on identical films): require reach **monotonic** in spend, **decreasing** marginal reach and marginal expected Studio Revenue, max marketing **not always** profit-maximal, min marketing **not** dominant, and **≥ 1** rational middle allocation. *(Result: profit-max = **moderate** ($3M); marginal Studio-Revenue/$ 10.4→1.2→0.27→0.09; **PASS**.)*

**Tentpole gate [OWNER 2026-07-27].** The turn-one max-budget bot measures only that the solvency gate correctly blocks an unaffordable first action — **not** tentpole viability. Viability is measured by the disciplined capital-building strategy. Expected shape: tentpoles are **not** reasonable opening moves for a new \$20M studio; become available after successful capital accumulation; offer substantial upside; carry material downside; are **viable but not required**; and are **not automatically optimal**. **Escalate only** if disciplined studios **almost never** become able to make one, or if tentpoles are **almost always** destructive or **almost always** superior. *(Result: 100% reach one (median swing mid-Y1, after building cash — not turn 1); 37% profit / 27% severe-loss per swing; 100% keep operating; strategy final cash competitive but not dominant; **within the intended envelope**.)*

**Reject the model when:** comparable large-studio strategies exceed the dominance gates · star-heavy returns to automatic dominance · Fame must be made commercially irrelevant to pass · small studios become nonviable · affordable marketing has no rational middle range · disciplined tentpoles are effectively impossible · tentpoles become automatically dominant · one median failure commonly causes permanent collapse · migrated saves duplicate revenue · an owner-level mechanic must change. **Do not manipulate the harness to force a pass.** **Do not stop solely because the global disciplined-strategy spread is between 2.0× and 2.6× (owner 2026-07-27).**

**Harness fidelity [OWNER 2026-07-27].** The harness is approved for **structural and relative** calibration only. Its inflated absolute cash totals must **not** be used to retune starting cash, production costs, payroll, film count, or player-facing forecasts. Before final D-12 approval, the balance gates are re-run through the **most integrated simulation path available**, and the final report distinguishes **structural-harness**, **integrated-engine**, and **human-playtest** findings.

---

## 24. Non-goals (this milestone)

Persistent scripts / Co-Writers / script market / filmmaker pitches; facilities; Acting School; loans/debt/investors/taxes; streaming/TV/library/long-tail revenue; acquisitions; rival studios / competition schedules; era progression; studio-lot integration; Gate D; **week-varying** studio shares; per-tick production spend; distributor/exhibitor line items; a planned-greenlight runway reserve (open owner decision).

---

## 25. Tuning constants (all named + provenance)

| Constant | Value | Provenance |
|---|---|---|
| `STUDIO_RENTAL_BLENDED` | 0.52 (sweep 0.42–0.62) | [ICH] |
| `N_WEEKS` (run length) | 6 | [ICH] (red team: 4 ok; PM: 6) |
| `HOLD_BASE` / `HOLD_LEGS_COEF` | 0.42 / 0.09 (per (legs−1.8)) | [ICH] |
| `TAIL_FLOOR` | 0.05 / week | [ICH] |
| Week-1 gross ≡ `boxOffice.opening`; total conserved = `opening × legs` | — | [DERIVED] |
| `FAME_REACH_HALF_SAT` (Hill K) | 50 (sweep 25/35/50/65/80/100) | [OWNER surface/form] + **[SELECTED 2026-07-27]** value (subject to integrated harness + playtest) |
| `OVERHEAD_BASE` / `OVERHEAD_PER_EMPLOYEE` | \$15,000 / \$1,500 per wk | [ICH] |
| Runway redefinition | cash ÷ max(ε, projected burn − expected revenue) | [DR] |
| Ledger kinds added | `studioRevenue`, `overhead` | [DR] |
| Save version | V4 (+ `convertV3ToV4`) | [OWNER/DR] |
| Economy gate | `economyEngaged` ≡ `employmentEngaged` | [DR] |
| Week-varying rental array; mid-flight marketing; per-tick production spend; financing; facilities | — | [DEF] |
| Marketing channel, legs formula, salary curve, INITIAL_CASH, PRODUCTION_TICKS, MAX_CONCURRENT=2, standing/D-6, OVR, reception (except gated §7) | unchanged | [DERIVED — preserve list] |

---

## 26. Required tests (acceptance)

Gross conservation (Σ weekly = opening×legs); studio-share arithmetic; Hill helper properties (§7 tests 1–10 from the ruling: fame 0 → 0 reach, 100 > 99, non-negative deltas, decreasing marginal value, no hard cap < 100, forecast==realized helper, marketing & fame separate channels, Fit/OVR unaffected, M0A byte-identical, harness K-sensitivity); overhead per-week + ledger; solvency gate (voluntary blocked when it would overdraw; unavoidable debits still allowed negative); Sim-to-Next-Event once-per-week processing + stop conditions + reload==continuous; SaveFileV4 round-trip + V1/V2/V3 still validate; V3→V4 migration (idempotent, no duplicate payout for released films); reload-vs-continuous with a straddling run; M0A byte-identity re-run; balance-harness gates; newspaper/autopsy gross-vs-Studio-Revenue fields. Every bounded new term gets a range test (CLAUDE.md).

---

## 27. Contradiction & architecture audit (independent pass)

**No blocking contradictions.** Findings, each resolved or surfaced:

1. **D-11.18 / D-11.20 distribution deferral vs the milestone's purpose** — the milestone *is* the deferred lever. **Resolved by owner ruling (D-12.1 lifts the deferral for this milestone only).** This is the one authorial gate; it is now granted.
2. **§5 reception is on the preserve-list / D-6 protected, but D-12 saturates the fame→reach term.** **Surfaced, not silently done:** this is the single authorized reception touch, explicitly granted by the Hill ruling (§7), gated on `economyEngaged` (M0A byte-identical), touching only the fame→opening-reach component — not OVR/critic/craft/cohesion/legs. Plus the flagged nuance that `starDraw` feeds both opening and legs (implementation must isolate the opening path; global-saturation is the owner-selectable fallback).
3. **D-1 / D-11.5 negative-cash-no-consequence vs a new solvency gate.** **Resolved:** the gate blocks only *voluntary* commitments that would immediately overdraw; unavoidable debits still go negative; no game-over. Fully consistent.
4. **D-3 forecast confidence / locked greenlight vs a new Studio-Revenue forecast.** **Resolved:** the Release-Strategy Studio-Revenue forecast reuses the deterministic forecast pipeline and is **locked** into `forecastSnapshot` (never recomputed live), preserving locked-greenlight.
5. **D-11.C newspaper "Studio Revenue = full box office" disclosure becomes false.** **Intended change:** the disclosure is updated to the real blended split; the newspaper/autopsy add the gross-vs-Studio-Revenue distinction (ruling H). Immutable per-film clippings/records are preserved.
6. **Cycle-4A runway display vs D-12 runway redefinition.** **Resolved:** D-12's net-burn runway supersedes the current `cash/weeklyPayroll`; the redefinition wins over any cosmetic relabel (composes with the already-committed Cycle-4A UX). One **open owner decision**: planned-greenlight reserve in runway.
7. **Ledger doubling (arch agent's offset entries vs FINAL-REPORT PM cash-only).** **Resolved:** cash-only ledger (`studioRevenue`/`overhead`), gross on the run record, reconciliation invariant intact.
8. **Save immutability (V1/V2/V3 frozen).** **Resolved:** explicit V4; frozen versions untouched; unknown versions still rejected loudly.
9. **M0A byte-identity.** **Resolved:** every new behavior gated on `economyEngaged`; corpus never engages; no new sim-stream draws; re-run proof required.
10. **Permanent film history.** **Resolved:** `FilmResult` stays terminal/immutable; `activeRuns` is a separate transient collection; `boxOffice.total` remains the conserved gross.

**Architecture verdict:** the milestone is a **fill-in, not a rewrite** — every primitive (signed ledger + reconciliation invariant, version-dispatch save machine, derived-RNG streams, the engagement gate, numbered tick slots) already exists. **Implementation-ready pending owner approval of this contract.**

**Owner decisions — RESOLVED by the D-12 authorization clarifications (2026-07-27):** (1) fame saturation = **opening-reach isolation** (NOT global `starDraw`); existing linear Star Power keeps its segment-appeal/legs contribution (§7). (2) Dashboard runway = **current commitments only**, no hypothetical-greenlight reserve; Release Strategy shows the post-greenlight picture separately (§16). (3) release-week Studio Revenue is paid **exactly once** by tick step 3.5 (no separate "week 0" release credit) (§9). (4) runs are kept in a **`theatricalRuns` history** with `status` (active/completed/legacyCompleted); V3-migrated releases become `legacyCompleted` at the actual full-gross amount and are never repaid (§4/§20). **The contract is implementation-ready; all remaining tuning numbers are Initial Calibration Hypotheses unless marked [OWNER].**
