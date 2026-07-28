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
