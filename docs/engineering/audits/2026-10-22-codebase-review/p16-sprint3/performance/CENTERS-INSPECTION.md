# Same-operation forecast-center reuse: source proof

Read-only inspection at `481fd444befc8c4743fedad0a842aff98ed8dddb`. No runtime, repository writes, delegation or implementation. Coordinator profile: worker30473, `profile/CPU.20261025.185513.30473.0.001.cpuprofile`; reported inclusive costs search3.248s, centers2.332s, deterministic core1.861s within8.85s instrumented leaf. These nested costs are not additive; this report establishes equivalence conditions, not measured savings.

**Finding: the complete ForecastCenters value is invariant when only budget.marketing changes.** Sharing it locally within one existing negative-budget loop is supported by source.

| Computation | Dependencies relevant to this hypothesis |
| --- | --- |
| `forecast.ts:78–252` deterministic core | Talent, concept, shape/effects, promise, market forces and engaged flag. Its only budget reads are **negative** at145–155, affecting budget adequacy and craft. Skill helpers receive explicit talent/concept/shape/promise arguments (`talentSummary.ts:250–268,304–323`), never budget. |
| `reception.ts:473–548` segment appeal | Delivered expression, craft, timeliness, promise ranges/specificity, cast fame, concept strength, segment tastes, shape affinities and fame flag. No budget read. |
| `forecast.ts:269–280` centers | Only the two computations above; allocates results, draws no RNG and mutates no input. |
| `marketingMenu.ts:87–95` capacity | Centers’ opening appeal, segment shares, standing awareness and engaged flag through existing reception helpers. No marketing read. |
| `forecast.ts:467–477` / `reception.ts:665,721` box office | **Does** read each candidate’s marketing for reach and overexposure. Must still execute per candidate. |

`hollywoodPolicy.ts:63–74` currently computes one center result for the capacity menu, then computes it again for each evaluated marketing rung. For a fully evaluated three-rung group this is four identical calculations; ordinary cash rejection already avoids the corresponding forecast. The valid reuse lifetime is exactly one fixed **shape, billing, updated promise, negative budget and flags**. The unlocked-policy preliminary center at58 precedes promise replacement and cannot supply the later full centers. Never carry results across negative choices, cast permutations, other calls/ticks or changed inputs.

Preserve the current per-candidate `computeForecast` path, confidence/causal output construction, fresh output arrays, and box-office arithmetic. Its Gaussian at407–408 must still execute once per evaluated candidate, including engaged forecasts where the draw is ignored at418. It uses a freshly derived `(seed, forecast, productionId)` stream, not simulation RNG (`rng.ts:9–19`); centers themselves consume none. No arithmetic reassociation is needed, so full Forecast values can remain exactly equal. Centers are only read downstream; sharing them does not make returned Forecast arrays alias across calls.

Keep shape/billing/negative/menu order, strict-greater winner selection, the cash check **before** candidate forecasting, diagnostic opt-in, all counters and every admission/validation call. Computing centers once at the current menu position retains the existing first evaluation/throw position. Marketing-specific downstream execution is retained. Do not add a caller-supplied stale-center escape hatch to game/save admission or persist/cache anything.

Nearest existing evidence to reuse:

- `tests/d17b-marketing-menu.test.ts:50–70`: menu capacity equals the production box-office capacity; exact rounding and regime split elsewhere in the file.
- `tests/forecast-independence.test.ts:51–108,167–203`: deterministic centers, derived-stream offset, simulation independence. No direct marketing-center invariance or prepared-forecast equivalence test was found.
- `tests/p14d2-binding-cash.test.ts:119–145,205–218`: independent enumeration, opt-in/opt-out result equality, zero/partial/full affordability; explicitly spies that ordinary **computeForecast call count equals affordable**, and that diagnostics add calls without moving simulation RNG or mutating input. Preserve those assertions.
- `tests/p14b4-rival-seating-preference.test.ts:135–155,218–235,459–475`: independent fresh-forecast oracle checks exact chosen budget/margin and billing/preference ordering; do not change that oracle to consume the optimized preparation.

Small missing regression: one focused comparison of complete reused-versus-fresh forecasts across the three marketing values, with a second negative budget and both economy regimes, also asserting input purity. Existing search-oracle/call-count cases then cover policy equivalence. Root owns implementation shape, required runtime selection and original-budget qualification; source proof alone does not establish a timing pass.
