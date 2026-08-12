# D-17A — Decision Truth & Defect Closure — Implementation Contract

**Authority:** `docs/D-16-OWNER-RULINGS.md` (Owner rulings R1–R12, 2026-08-12). D-17A is the only
authorized implementation slice; D-17B is not authorized. This contract is derived from those
rulings and the D-16 evidence (`docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md`,
`docs/D-16-ENGINE-ECONOMY-SOURCE-MATRIX.md`). Where this contract and the rulings conflict, the
rulings win. Base: `d17-economy-truth-equilibrium @ c679f88` (= final D-16 HEAD; `src/core/**`
byte-identical to production `main @ 33eb33ae`).

## 1. Deliverables (the 18 authorized items, grouped)

**T1 — One runway.** A single authoritative player-facing runway definition (current fixed-burn
basis per D-12 §16), used by every surface. Retire/reconcile the three near-copies
(`economyView.ts:78-85, :90-94, :123-126`) and the roster-screen payroll-only variant (the
186wk-vs-72wk contradiction). Fix the latent §5.10 divergence (unguarded `weeklyPayroll` during
founding in `weeklyBurn`).

**T2 — One headline profit/break-even convention (R7).** Player-facing HEADLINE = cycle-inclusive
/ studio-economic. Film Contribution (Studio Revenue − direct commitment) is retained as labelled
direct-cost DETAIL (D-12 §3/§8 terminology preserved: payroll/overhead are never silently folded
into per-film Contribution; the cycle-inclusive figure is a labelled managerial measure). No
surface may show a green "Profit" band for a package whose studio-economic branch is negative
without simultaneously showing the studio-economic truth.

**T3 — Cycle-inclusive break-even with reconciling attribution (R7 safeguard).** One selector
family in `src/core/economyView.ts`:
- *Prospective (per candidate package):* `cycleFixedCost = (PRODUCTION_TICKS + THEATRICAL_WEEKS) ×
  currentWeeklyBurn ÷ expectedConcurrency`, displayed with its assumption named; the DEFAULT
  headline uses sole-occupancy (`concurrency = 1`, conservative when the studio is poorest —
  exactly the D-16 failure case) and states so.
- *Retrospective (managerial):* per-week pro-rata allocation of actual ledger payroll+overhead
  across the productions/runs active that week; unallocated idle burn reported separately.
- *Reconciliation invariant (property-tested):* over any window, Σ per-film allocated fixed cost +
  unallocated idle burn ≡ Σ ledger `payroll` + `overhead` for that window, to the cent. If this
  cannot be satisfied, STOP and report (do not invent a convention).

**T4 — Prospective commitment truth.** At Assembly/greenlight-review time, from player-visible
values only: cash required now; expected studio-economic break-even; expected range (the existing
true forecast band, correctly signed); remaining cash after commitment; ongoing fixed burn; runway
consequence (runway-after-greenlight including the film's own expected run revenue only via the
existing conservative convention, with its conservatism stated); major exposure/risk (T6).
Affordability scopes (bare-minimum / standard / recent-typical, already parity-tested) promoted to
Dashboard + Assembly, no longer gated behind the recap.

**T5 — Contract-obligation truth at signing (item 8).** At contract offer/renewal time: the full
remaining guaranteed obligation (weekly salary × term + signing bonus) and its runway consequence,
from the same engine helpers the tick uses.

**T6 — Quantified discoverability exposure (item 9).** Replace the prose-only discovery warning
with a numeric band using only player-visible/currently legal information: whether the package is
exposed (support below threshold), the 0.2×/1.8× clip bounds, and what they do to the displayed
range. Fix the proxy that silently misses 14.5% of exposed packages by computing exposure with the
same rule `resolveReception` uses (Lesson AC: same-rule parity, not a parallel approximation). No
future draw information, no oracle values.

**T7 — Marketing truth (R6, D-17A half).** Truthful copy/read-models; remove steering language
that calls high-awareness spend "wasted" where measured marginal return > 1; label rung
capacity/efficiency from the existing engine values. NO grid-constant change.

**T8 — Honest standing copy (R8).** Remove the financier fiction; label prestige and confidence
as non-commercial standing (their real drivers per D-6); disclose that awareness is the only
commercially connected channel. NO mechanical change.

**T9 — Greenlight discipline legibility (item 13).** Name the skill: surface the locked forecast
center (studio-economic sign) at decision time, with plain language that a negative-center
package is expected to lose money before fixed costs. NO auto-play: no sorting by "optimal", no
recommendation engine, no hidden information (D-11.15 perceived-only stands).

**T10 — Engagement-cliff closure (R2).** Persist engagement as an explicit monotonic boolean on
`GameState`, set at founding (and by migration for saves with engaged history), never cleared.
`economyEngaged()` reads the persisted fact. SaveFileV6 + `convertV5ToV6` ONLY after the migration
proof (§3). Natural-expiry and fire-everyone no longer switch the economy off; active runs keep
paying; the solvency gate stays enforced; overhead continues.

**T11 — `releaseTalent` closure (R3).** Keep ungated; amend D-12.11's text
(`docs/D-12-economy-contract.md` §11) with the explicit exception and rationale; add a regression
test proving a release below-cash is intended behavior.

**T12 — Stale-certification truth (item 17).** Re-run the standing gate corpora at HEAD; record
honest current status (the D-12 integrated gates FAIL at HEAD — a D-17B target, not silently
re-certified); adopt Lesson BC's re-run-at-close rule for this and future milestones.

**T13 — D-15 recap consistency (item 18).** Recap wording/read-models updated to the new headline
convention (its film Contribution remains, labelled; the managerial allocation from T3 feeds any
studio-level per-film view); action-parity preserved.

## 2. Forbidden (verbatim from the rulings)

No change to: `AWARENESS_REACH_NEUTRAL`; `DISC_*` constants; marketing grid constants; awareness
dynamics; publicity mechanics; film revenue; studio share; payroll amounts; overhead amounts;
salary curves; production costs; talent mechanics; standing formulas; reception; forecast
formulas; RNG; production cadence. No financing/failure systems. No macroeconomic tuning. No merge
to `main`.

## 3. R2 migration safeguard (gate before T10's converter)

Prove from the V5 schema whether historical engagement is reconstructible for every existing save
class (M0A/headless, legacy V1→V5 upgrades, real player saves, post-cliff saves). Candidate
predicate (to be proven, not assumed): `founding !== null || contracts.length > 0 || ledger
contains any engaged-only kind (payroll, overhead, signingBonus, termination, freelancerFee,
studioRevenue) || any theatricalRun with economyModelVersion ≥ 1`. If the proof fails: STOP the
converter subtask and return explicit migration alternatives; other D-17A work continues only
where safely isolated from V6.

## 4. Quality requirements (Part V, binding)

- **A. Action parity:** every "can do X" claim uses the authoritative action rules (extend
  `recap-parity`-style tests to every new claim surface).
- **B. Accounting conservation:** T3's reconciliation invariant is property-tested, including
  overlapping/concurrent productions and idle periods.
- **C. Information discipline:** no hidden actual talent, no future discoverability draws, no
  realized future outcomes, no oracle values, no secret recommendation engine.
- **D. Prospective truth without fake precision:** ranges stay ranges; assumptions are named.
- **E. Save migration:** per §3; deterministic, idempotent, `rngState` carried unchanged,
  `validateSave` loudly rejects unknown versions; session-autosave compatibility addressed.
- **F. Regression:** full suite; d16 harness (102); D-12 economy gates re-run (status recorded
  honestly); D-13/D-14/D-15 regression suites; replay/save determinism; M0A byte-identity. The
  D-16 corpus must be **statistically unchanged** except the intentional removal of the
  engagement-cliff exploit/regime defect; any other drift = STOP AND INVESTIGATE, never tune.

## 5. Phases and stop boundary

Phase 0 audits (finance-source, migration proof, accounting design) → PM gate → Phase E
(engine + save + core read-models) → independent test authorship → Phase U (UI + copy) →
reviews (adversarial, UX/information-integrity, accounting, save/migration, governance) →
regression + corpus invariance → Owner evidence package → lessons → closure recommendation.
D-17A ends there. No D-17B work of any kind.

## 6. Phase-0 gate decisions (PM, 2026-08-12 — audits complete, no STOP triggered)

**Migration (T10) — proof HOLDS; converter cleared.** Field `economyEngagedEver: boolean` on
`GameState`; `SaveFileV5` re-anchored to a new frozen `GameStateV5` alias (house precedent);
predicate = `founding !== null ∨ contracts.length > 0 ∨ ledger has any engaged-only kind
{payroll, overhead, signingBonus, termination, freelancerFee, studioRevenue} ∨ any theatricalRun
with economyModelVersion ≥ 1` (proven exact for all five save classes; `boxOffice` and
`production` kinds excluded by proof). Setters at exactly the three false→true flip sites
(`beginFounding`, founding-phase sign, ops-phase sign); `generateWorld` seeds `false`;
`economyEngaged()` returns the persisted fact; `employmentEngaged()` unchanged (roster surfaces).
Core regime reads repointed: `actions.ts:391/:403/:467`, `studioRunRecap.ts:612`; adapter regime
reads repointed in Phase U (`:770, :1609, :2844-2845, :2869, :3078`). `validateSaveV6` carries ONE
documented field check (`economyEngagedEver` must be boolean — a missing value would silently
disengage a real studio, the exact R2 failure). `TUNING.ECONOMY_MODEL_VERSION ≥ 1` invariant test.
Session-autosave key NOT bumped; `adapter.ts:1803/:1804` + legacy import chains updated.
**Declined:** optional `FilmResult.startTick` hardening (derivation proven exact; cadence changes
are forbidden anyway; keep V6 minimal). **The d16 harness INSTRUMENT is not touched** — every
instrument file (`driver.ts`, `view.ts` including `:409`, `policies.ts`, `packages.ts`,
`run-d16-corpus.ts`, `states.ts`, `stats.ts`, `experiment.ts`, `luck.ts`) stays byte-identical,
because it is what makes corpus results comparable. *Narrowed by Owner ruling R2 (commit
`acbf449`):* the two EXPLOIT-ASSERTION test files — `isolation.test.ts` and `packages.test.ts` —
were re-specified to the closed-cliff truth. Those tests asserted that shedding every contract
reverted a studio to the legacy 100%-of-gross path; R2 makes `economyEngaged` persisted and
monotonic, so that path is unreachable and the assertions were documenting a defect. Assertions
only, no instrument change: the corpus comparability instrument is unchanged.

**Accounting (T3) — design satisfies R7.** Prospective basis = the contract-literal
`14 × currentWeeklyBurn` on a founding-guarded basis (the contract-expiry-aware forward sum is
REJECTED: it smuggles a "renew nobody" assumption). Headline = sole-occupancy; shared-occupancy
(÷2) shown as a named second line; no blended-occupancy scalar ever. Retrospective allocation =
per-week pro-rata partition of ACTUAL ledger `payroll`+`overhead` (never recomputed from
contracts — C1), equal split, largest-remainder with ascending-`productionId` plain-`<` order,
integer dollars end-to-end (C2), window convention `[releaseTick−8, releaseTick−1] ∪
[releaseTick, releaseTick+totalWeeks−1]`; idle burn reported separately and rendered.
`contribution`/`classifyContribution`/existing recap fields untouched (C3); recap gains additive
`allocatedFixedCost / allocatedWeeks / studioEconomicResult / allocationBasis:'ledgerProRata'` +
studio-level `totalAllocatedFixedCost / idleFixedCost / totalLedgerFixedCost` with a visible
reconciliation line.

**Finance inventory corrections adopted:** T1 covers SIX burn/runway sites (adds `financeView`'s
inline burn and the adapter `payrollSummary` roster runway — the visible 186/72 contradiction);
T2 covers FOUR profit definitions (adds `adapter.ts:1625-1626` `explainRelease` with its
`productionCommittedCost` fallback basis); T6's same-rule operands are `computeBoxOffice(...)
.awarenessFactor` + `forecastCenters(...).starDraw` (LINEAR draw, not `starDrawOpening`),
recomputed display-side with `TUNING.DISC_*` — no core signature change; the flawed proxy at
`filmPackage.ts:592-610` is replaced by the same-rule computation (widening magnitude logic
retained, driven by the correct shortfall); `filmPackage.ts:615`'s ceiling copy re-gated on
capacity, not absolute spend. The D-16 "14.5%" and "186wk/72wk" figures are NOT citable at this
HEAD (analysis dir absent) — the evidence package re-derives current-HEAD equivalents.

**Agreed core API surface (binding for builders and the independent test author):**
`economyView`: founding-guarded `weeklyBurn`; `runway`; `prospectiveCycleFixedCost(state, opts?)
→ {weeks, weeklyBurn, concurrency, amount}`; `cycleInclusiveBreakEvenGross(state, committedCost,
opts?) → {direct, cycleInclusive, fixedCost}`; `affordabilityScopes(state) → {cheapest, standard,
recentTypical}` (each `{commitment, affordable, shortfall}`, action-parity); `offerObligation` +
`postSigningRunway` selector family. New `src/core/fixedCostAllocation.ts`:
`allocateFixedCosts(state, window?) → {perFilm, idle, total}` (per-week partition invariant).
`filmPackage`: exported `discoveryExposure(...)` same-rule read-model → `{reachSupport, exposed,
shortfall, floor, ceil}`.

### 6a. Fix-pass adjudications (post-review, 2026-08-12)

A five-lens adversarial review (correctness, UX/information-integrity, accounting,
save/migration, governance) returned 1 BLOCKER, 5 MAJOR and 5 MINOR against the T1–T13 build.
The fix pass closed all eleven. These rulings amend §6; where one reverses an earlier §6
decision, it says so.

1. **Roster/assignment selectors REPOINTED — reverses the Phase-U decision to leave them.**
   §6 above records five adapter regime reads repointed and "the 5 roster/assignment reads
   correctly left". That was wrong: `applyGreenlight` branches on the PERSISTED
   `economyEngaged`, so after the engagement cliff the wizard staffed and priced from the
   retired D-1 open pool while the engine enforced D-11.12 — `canAssemble: true` for a state in
   which no package the screen could build was greenlightable (action-parity violation,
   Quality Requirement A), quoted at the D-1 salary instead of the 1.5× freelancer fee.
   `assemblyAvailability`, `studioPool`, `freelancerPool`, `assignmentProjectCost` and the
   Assembly wizard's staffing/craft gate now read `economyEngaged` (`isEconomyEngaged`).
   `isEmploymentEngaged` survives ONLY on purely roster-informational surfaces. A studio that
   genuinely cannot field a crew now reports `canAssemble: false` with named missing roles —
   that is the true state, and rendering it is the point.

2. **Regime share = 1.0 on the never-engaged path.** T2's "one revenue basis" was delivered for
   the engaged economy only. The D-1 path opens no theatrical run and credits the FULL gross in
   one lump (`tick.ts:238-247`), yet `explainRelease`, `forecastProfitRange`,
   `cycleInclusiveBreakEvenGross`, `GreenlightDiscipline` and the recap's no-run fallback all
   applied `STUDIO_RENTAL_BLENDED` there. Measured on a never-engaged imported save: the
   Dashboard read $30,101,628 and the Release/Autopsy screens $15,652,846 for the same film,
   and a $1,000,000 package headlined a $1,923,077 break-even against a true $1,000,000. The
   share is now stated once (`economyView.regimeStudioShare`) and threaded, and
   `ForecastProfitRange.studioRevenueIsFullBoxOffice` REPORTS the basis instead of asserting a
   constant one. The engaged path is byte-unchanged, and the d16 corpus carries 415 film rows
   of which **none** is priced on the disengaged path, so corpus comparability is untouched.
   `explainRelease`'s earlier justification for hardcoding 0.52 ("reachable ONLY on the engaged
   economy") was false — reachability is gated on `preTick.studio.activeProductions`.

3. **Discovery band = shortfall-derived, regime-gated.** `discoveryExposure` reported
   `exposed: true` regardless of regime, but `reception.ts:643` zeroes the spread when not
   engaged, so the multiplier is identically 1 there; `exposed` is now `engaged && shortfall > 0`
   and `DiscoveryExposure.tsx` renders nothing on the disengaged path (mirroring the marketing
   block's gating). The displayed band is now derived rather than clipped-by-default:
   `spread = DISC_SPREAD · shortfall^DISC_SUPPORT_EXP`,
   `bandLow = max(DISC_FLOOR, exp(−spread·z))`, `bandHigh = min(DISC_CEIL, exp(+spread·z))`
   with `z = DISC_FORECAST_LOW_Z = 1.28` (the engine's own forecast-band z, the same one the
   ForecastDisplay's low edge uses). The hard 0.2×/1.8× clips are named only when the band
   reaches them. Measured bands: 2% shortfall → [0.99×, 1.01×]; 11% → [0.85×, 1.18×]; 22% →
   [0.63×, 1.60×]. Support and threshold render at enough precision that "45% is below 45%"
   cannot occur, and a shortfall too small to move the opening by 1% says so instead of quoting
   a band. `reachSupport`/`shortfall` are byte-identical — the adversarial same-rule suite still
   pins them against the engine's own operands.

4. **Retrospective profit/break-even labels name their basis.** R7's safeguard held; its mandate
   ("no competing headline meanings of profit") did not. Retrospectively "Profit" meant
   direct-cost-positive while the greenlight screen's "Profit" is studio-economic — on the
   review's own fixture a film read Contribution +$879,243 and studio-economic −$541,597 and was
   labelled "Profit" on the Dashboard, the Film Record and the recap slate, with no
   studio-economic figure on two of those three screens. Both release tables now head that
   column **"Result (direct costs)"**; the Film Record's metric is **"Direct profit / loss
   (before studio fixed costs)"**; the autopsy's profit sentence and both break-even sentences
   name the direct basis (the same film headlined $6.12M cycle-inclusive at greenlight and
   $2.31M in its autopsy). No number changed anywhere — labels only.

5. **T5 reaches the founding draft.** §6 scoped T5 to "contract offer/renewal time" and the
   build delivered the hiring market and the roster but not founding — the one moment a studio
   signs five or six contracts at once. Each founding offer now renders its term obligation
   (`offerObligation`) and the weekly payroll it adds to the projected post-founding burn
   (testids `founding-obligation-*`). NO per-offer runway pair: `postSigningRunway` legitimately
   short-circuits while a founding draft is open, so both edges would print the same number;
   the aggregate `founding-runway` preview remains that screen's runway surface. Separately,
   `postSigningRunway` now adds `TUNING.OVERHEAD_BASE` when the studio is not yet engaged,
   because the signing itself flips the regime and switches overhead on — the omission
   understated a never-engaged studio's first signing by exactly $15,000/wk.

6. **ACCEPTED AS DESIGNED — the save validator's ledger-integer gap** (accounting finding #4).
   A hand-edited or corrupted V6 import carrying a fractional `payroll`/`overhead` ledger amount
   passes `validateSaveV6` and then throws out of `fixedCostAllocation` when the recap is
   opened. This is the intended failure mode and is not being changed: the allocator throws
   LOUDLY rather than leaking a float into an integer partition, `DevErrorBoundary`
   (`ui/src/App.tsx:136-146`) contains it as an error screen rather than a white screen, and the
   engine cannot emit such a ledger (`weeklySalary` rounds; overhead is `15000 + 1500n`). Adding
   a whole-ledger scan to the validator would trade a loud, contained, unreachable-in-practice
   failure for a slower load on every real save.

7. **Instrument comment left stale, deliberately.** `src/harness/d16/policies.ts:684` still says
   "`economyEngaged` flips false", which R2 made impossible. It is NOT corrected: instrument
   byte-identity governs, and a comment edit would break the corpus-comparability guarantee for
   no behavioural gain. Recorded here instead.
