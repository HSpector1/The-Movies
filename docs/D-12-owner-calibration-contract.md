# D-12 Owner Calibration Implementation Contract

**Authority:** owner ruling "IMPLEMENT D-12 OWNER ECONOMY CALIBRATION P2" (2026-07-28).
**Governs:** the implementation of calibration package **P2** on branch `phase-5.2-economy`.
**Study of record:** `docs/D-12-owner-economy-calibration-study.md` (commit `0edfd9f`).
**Frozen at:** starting implementation HEAD `0edfd9f`.

This contract is the source of truth for what the P2 implementation may and may not touch.
Where instinct and this contract disagree, the contract wins.

---

## Accepted diagnosis (`[H]`/`[I]`, from the accepted study)

- Competent studios reached **~2.35×–2.46×** starting cash after four ordinary films.
- p90 results approached **~3.8×–4.0×**.
- Routine film **Contribution was too large relative to direct commitment** (114–164% of commitment).
- Actual film losses were **too rare** (competent loss/film 3–9%).
- Forecast **downside almost never crossed zero**.
- **Maximum Marketing was universally optimal** (fails the reject gate).
- **Lean Production Budget was universally / near-universally profit-maximizing** (higher tiers = pure downside; adequacy saturates too cheaply → a fake choice).
- **Payroll and overhead were NOT the root cause** (annual burn ≈ one film's contribution; salary ×2 / overhead ×3 barely move the four-film multiple).
- **Starting cash was NOT the root cause** (lowering it *worsens* the ratio).
- **Studio share was NOT the preferred first lever.**

Dominant root cause: **base opening/gross scale too high.**

## Accepted architecture — PRESERVE (do not redesign)

- Six-week conserved theatrical run (`Σ weeklyGross === opening × legs`).
- Studio Revenue vs Theatrical Gross distinction.
- Blended studio share **0.52**.
- Fame Hill **K = 50**.
- Fame saturation isolated to **opening reach** only.
- Existing **legs** and **audience-response** architecture.
- Payroll · overhead · solvency gate.
- **SaveFileV4** and V3→V4 migration.
- Deterministic forecast snapshots (Review == persisted == realized).
- **M0A gating** (`economyEngaged ≡ employmentEngaged`) and **byte identity**.

## Approved implementation levers (the ONLY things P2 may change)

1. **Economy-engaged routine opening/gross scale** — one canonical constant `ECONOMY_BOX_OFFICE_SCALE`, applied once, economy-gated, to both forecast and realized paths at the same conceptual point (after creative/talent/Fame/Marketing determine opening; before schedule generation; before the share). Candidate values evaluated in **0.65–0.70**; select the **highest** exact value that still passes the four-film gates after the Marketing change.
2. **Awareness-conditioned Marketing efficiency** — replace the universally-optimal Marketing response with an awareness-scaled efficient-capacity + diminishing-return curve, built from **existing** pre-Marketing awareness signals only. One canonical engine helper; no UI duplication. First implementation is reach-saturation + full Marketing cost only (no new critic penalty / RNG / backlash / Promise-mismatch mechanic without separate owner approval).
3. **Existing Production Budget adequacy calibration — ONLY where needed to prevent a fake choice**, and only via bounded adjustment to existing adequacy thresholds / ambition-cost requirements / diminishing-return constants / execution-confidence response / downside-reliability response. No new production system. Production Budget buys realization ability, execution reliability, downside protection, technical fulfillment — **never guaranteed profit**. If the existing architecture cannot meet the choice-quality shape without a structural redesign: **stop, do not improvise, return a focused design proposal.**

## Explicitly FROZEN (P2 must not change any of these)

- Studio share (0.52) · Fame K (50) · salary curves · overhead · starting cash ·
  theatrical-run length · forecast randomness (must not be widened merely to add losses) ·
  save schema · production slots · contracts · reception architecture · M0A behavior.
- No facilities, scripts, rivals, loans, residuals, secondary markets, eras, scene-level costs,
  production incidents, reshoots, debt, new production stages, or any direct guaranteed
  budget-to-box-office multiplier.

## Required evidence labels (continue distinguishing)

`[H]` human playtest · `[I]` integrated engine · `[S]` structural harness · `[D]` diagnostic override · `[P]` production implementation.

## Controlling acceptance gates (from the ruling)

- **Four-film (competent):** median final cash ~1.0×–1.6×; p90 generally < ~2.0×–2.25×; some competent runs finish below start; 3×–4× generally requires a genuine breakout; ≥1 loss in four is meaningfully plausible; negative cash possible but not routine; studio recoverable.
- **Ordinary competent film:** modest expected Contribution vs commitment (design guidance ~$0.5M–$3M); downside frequently crosses zero; meaningful loss rate; major forecast misses can create real losses. Stronger film ~$2M–$6M; breakout ~$10M–$25M+ and rare. **Do not distort package quality to hit dollar targets.**
- **Marketing:** maximum Marketing profit-optimal in **no more than ~25%–35%** of packages; ≥2 different tiers optimal across the representative set; low/standard optimal for many low-awareness films; max still rational for some high-awareness event films; expected gross non-decreasing with spend; marginal Studio Revenue per Marketing $ declines.
- **Production Budget:** no single tier expected-Contribution optimal in **> ~70%** of packages; ≥2 tiers rationally optimal in clearly different package types; Generous credibly improves downside/realization for some ambitious films; Lean credible for some contained films; expensive can still waste money when misapplied. **No forced equality.**
- **Capability:** competent viable; star-heavy viable-but-demanding; bargain a stress lane; highest-OVR not dominant; Fame + Fit remain valuable; tentpoles possible with upside AND downside; no strategy wins through inactivity; no routine package has guaranteed profit; payroll visible without becoming an arbitrary tax.
- **Accounting/determinism:** six-week gross conservation; share applied exactly once; no duplicate payments; forecast == persisted snapshot; save/reload == continuous play; Sim-to-Next-Event ordering; V3→V4 migration; M0A corpus + replay byte-identical.

---

## CLOSURE STATUS (2026-07-28) — all three levers implemented within contract

The calibration closure (owner ruling "COMPLETE D-12 MARKETING AND PRODUCTION-BUDGET CALIBRATION") implemented all three approved levers, economy-ENGAGED-gated, M0A byte-identical:

1. **Routine gross scale** — `ECONOMY_BOX_OFFICE_SCALE = 0.70` (retained; the repaired Marketing/Budget systems brought the routes into target at 0.70).
2. **Awareness-conditioned Marketing** — Stage A effective-reach ceiling + Stage B deterministic overexposure (legs-only, delivery-conditioned, no RNG, no critic effect). Maximum Marketing is no longer universally optimal (33% of representative packages; 3 tiers).
3. **Production Budget** — a NEW engaged-only realization/reliability craft delta (`budgetRealizationDelta`) added ON TOP of the FROZEN M0A `budgetAdequacy` (unchanged). Contained→Lean, ordinary→Adequate, demanding→Generous; budget affects gross only via craft, never a direct multiplier.

Frozen constants (share 0.52, K 50, salaries, overhead, starting cash, run length, forecast RNG, save schema, production slots, contracts) remain byte-identical. No new RNG; no non-goal entered scope. See the study's "D-12 CALIBRATION CLOSURE" section for the full record. Adversarial review SOUND (one forecast/realized divergence found + fixed + regression-tested); contract audit CONFORMS. **Not merged** — pending the owner's final human balance re-test.

---

## FINAL DOWNSIDE CLOSURE STATUS (2026-07-28)

The final downside/legs/forecast-truth closure fixed three defects from the human playtest, all economy-ENGAGED-gated (M0A byte-identical), within the permitted low-end levers:
1. **Autopsy forecast truth** — `greenlightAssessment` threads `engaged` into `forecastProfitRange`; Expected Studio Revenue now = Expected Gross × 0.52 and reconciles with the persisted snapshot (was ~1/0.70× too high).
2. **Legs retention reshape** — engaged-only `LEGS_MIN_ENGAGED(1.2) + (LEGS_MAX−1.2)·(WAS/100)^1.4` replaces the M0A linear curve's 1.8 floor for engaged films; weak delivery now collapses retention (genuine bombs possible). FROZEN `LEGS_MIN`/`LEGS_MAX` unchanged.
3. **Production Demand read model + UI** — engine-derived category/funding-status/drivers/consequence in Budget & Forecast.

`ECONOMY_BOX_OFFICE_SCALE` retained at 0.70 (the corrections lowered competent profitability, so no scale reduction was warranted). No new RNG; frozen constants byte-identical; critic not a box-office multiplier. Weakest legal film loss ~73%; rational competent median ~1.16×. Adversarial review SOUND; contract audit CONFORMS. **Not merged** — pending the owner's final human balance re-test.

---

## SESSION & OWNER-TRUTH CLOSURE STATUS (2026-07-28)

Owner directive "D-12 SESSION RECOVERY, LIVE FORECAST TRUTH, AND FINAL DECISION-UX CLOSURE". Three sequential phases, all economy-ENGAGED-gated where they touch the engine (M0A byte-identical), no new RNG, frozen constants unchanged.

**Phase A — session recovery (commit `1ba1458`).** Root cause: the authoritative `GameState` lived only in React memory; any reload / HMR / dev-server restart discarded it (no browser storage anywhere in `ui/src`). Fix: a versioned active-session autosave (`ui/src/engine/session.ts`) writing `exportSaveJson(state)` to the namespaced key `project-studio.active-session.v4`, driven by a single `useEffect([state])` in `App.tsx` so every authoritative transition persists. On startup the app restores before founding and shows a dismissible "Recovered your studio from Week X." notice; a corrupt payload fails safe and is quarantined to `…v4.corrupt`; **New Studio** is now an explicit confirmed destructive action that clears the autosave. Round-trip is exact (re-serialization byte-identical, incl. runs/ledger/cash), proven across founded / active-production / two-concurrent / mid-theatrical-run / completed-release states, plus App-mount restore and two Playwright reload specs.

**Phase B — live Commercial-Outlook truth.** Per the evidence rule (one production id/title/package/snapshot), the suspected live-forecast arithmetic failure does **not** reproduce — live invariants hold and are property-tested (`ui/src/screens/d12-live-forecast-truth.test.tsx`): Expected Studio Revenue = Expected Gross × 0.52; Film Contribution = Studio Revenue − direct commitment (negative + marketing + freelancer fees; **never** payroll/overhead — contracted talent returns 0 per-film); Studio Revenue ≤ gross; assembling film B while A is active uses B's own forecast (no cross-film mixing). The real arithmetic defect (autopsy `forecastProfitRange` engaged-threading) was the one fixed in `a8402e4`. **B8:** the greenlight forecast band was symmetric, so a weak package's downside was too narrow; added engaged-only asymmetric downside widening `FORECAST_DOWNSIDE_WIDEN { high: 0, medium: 7, low: 16 }` — `low = estimate − width − (engaged ? widen[confidence] : 0)`, `high` unchanged. Uncertainty now matches greenlight knowledge (no new RNG; not a global widen). The weak "Letters-from-Vineyard" profile's forecast downside now crosses below zero even at Generous budget (`tests/d12-final-downside.test.ts`).

**B7 reproduction (160 seeds).** weakest-legal (cheapest, Generous budget, small mkt): contribution p10 −$4.59M / median −$1.49M / p90 +$1.56M, **loss 73 %** — inside the 65–90 % target. **Finding (flagged, not tuned):** weak-commercial as defined in the harness (cheapest talent + demanding shape + standard mkt) lands at **loss 87 %**, above the 35–65 % expectation. Mechanism: pairing the cheapest talent with a high-Production-Demand, execution-risky demanding shape is a *worse* bet than the cheapest talent on an ordinary shape, so the ordering inverts. This is model-consistent (spectacle without craft), and per the one rule I did **not** change a frozen constant to force the band. Proposed clarification for owner: a faithful "weak but commercially-positioned" comparator should use **mid-tier** talent (commercial positioning = the shape, weakness = execution), not the cheapest tier — a harness-definition choice, left unchanged pending owner input.

**Phase C — owner decision UX (bounded).**
- **C1 solvency ≠ exposure.** The single reassuring "Affordable ✓" tick is gone. The Budget step and the Review step now show **Solvency** (Pass/Blocked), **Capital committed** (money + % of current cash), **Exposure** (Low < 25 % / Moderate 25–40 % / High 40–60 % / Extreme > 60 %, never green for High/Extreme), remaining liquidity (Cash After Greenlight) and runway. A solvent-but-aggressive bet is labelled, not congratulated.
- **C2 Shape explanation.** Each Shape option carries an engine-derived plain-English summary (creative direction, reach emphasis, craft/execution tradeoff, Production Demand category) alongside the actual `resolveShape` deltas — prose never contradicts the numbers.
- **C3 script browsing.** The concept step gains sort-by-cost, genre filter, and title search, with the current selection preserved across re-sorts and an empty state.
- **C4 starting talent — AUDIT, generation UNCHANGED.** Corrected audit of the founding applicant pool (seed `studio-001` + neighbours): **all 24 applicants carry genre experience** (actual 14–16 in genres), **~10/24 have Fame ≥ 40**, OVR spans ~10–92, salaries span to ~$500k — the market already contains working professionals. The owner's "everyone unproven" impression is a **UI-framing artifact** (the founding "unproven" badge = no track record *in your studio* yet) plus a weak-seed tail (studio-001 directors OVR ~10), **not** a generation defect. Because the desired market shape already exists and any seeding change would destabilise the just-validated four-film balance and edge toward the deferred talent-career system, generation is left **unchanged** (directive's escape clause). Four-film balance unaffected (best-route median ~1.16×, ~29 % loss/film — unchanged).

Frozen constants (share 0.52, K 50, salaries, overhead, starting cash, six-week run, LEGS_MIN/MAX, MARKETING_HALF_SATURATION, save schema/migration, production slots, contracts, critic-not-a-multiplier) remain byte-identical. Full suite 848 pass; M0A acceptance corpus + replay + fame-isolation + V3→V4 migration byte-identical; 9 Playwright specs pass; production build clean. **Not merged; next milestone not begun; Gate D not opened** — pending the owner's final human re-test.
