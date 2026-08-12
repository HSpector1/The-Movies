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
