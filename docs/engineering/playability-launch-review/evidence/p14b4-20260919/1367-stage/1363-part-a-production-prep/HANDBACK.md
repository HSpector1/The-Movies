# 1363 Part A production patch preparation

Status: production-only patch authored in scratch against live HEAD `2eaa697effc38538c37da28b486786ce267a2284`. Not applied to the repository. No Node, tests, typecheck, build, fixture payload access, index/git mutation or nested agents. Independent static review is requested; runtime integration remains gated on the genuine A8 capture and measured REDs.

Authority read: E/1363-A §3, adopted amendments in E/1363-F (especially ruling 10), E/1363-A2 §2, and the reviewed E/1367-stage/part-a-red patch, handback and independent review. E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.

## Artifacts and scope

- `part-a-production.patch` changes only `src/core/hollywoodPolicy.ts` and `src/core/hollywoodTick.ts`.
- `base/` contains the exact two source files read at the stated HEAD; `candidate/` contains their proposed replacements.
- `SHA256.json` records the base identity, exact patch hash and before/after hashes for both files.

No Part B/C fields or behavior, save/version step, catalogue ordering, tuning, test re-pin, new test, fixture or projection change is included. The patch does not itself authorize landing.

## Implementation

`IndustryPackageOptions` gains optional `diagnoseUnaffordableViability`. It is effective only when `lockScreenplay` is also true. The result adds optional `unaffordableViable` only on that enabled diagnostic path; ordinary search results retain the identical four-key object shape and key order.

The cash predicate still increments exactly one of `affordable` and `unaffordable`. A skipped candidate continues immediately unless the diagnostic is enabled. Enabled skipped candidates then pass through the **same existing forecast, operating-margin arithmetic and viability gate** as affordable candidates. No second copied scoring formula or cash-free algebraic simplification is introduced. After passing the gate, a skipped candidate increments only `unaffordableViable` and continues before affordable `viable`, promised-person preference comparison, best score or choice can change.

This preserves the original floating-point operation order and strict viability boundary. Candidate enumeration, shapes, billing order, marketing menu, negative-cost scales, perceived inputs, promise masks and tie-breaking are unchanged. The diagnostic does not select an unaffordable package or propose a new greenlight.

In `decide().evaluate()`, the original chooser receives exactly the original arguments with no diagnostic option. Only after that chooser returns null does the existing refusal re-search receive a copied options object with `diagnoseUnaffordableViability: true`. The refusal is `cashBlocked` only if `unaffordableViable > 0`; otherwise it is `economicRejection`. The optional return value is read with a zero fallback; the actual caller always supplies locked screenplay plus the explicit opt-in, so a real search returns a count including zero.

## Consequential callsites inspected

Source search found these production uses:

| Base locator | Treatment |
|---|---|
| `hollywoodPolicy.ts:83–84`, chooser wrapper | Body unchanged; simply returns the search's choice. |
| `hollywoodTick.ts:233`, ready-screenplay chooser | Call/args unchanged. Successful choices never perform diagnostic work. |
| `hollywoodTick.ts:236`, refused ready-screenplay re-search | Sole production opt-in. Same input, policy, seed/key, reserve-adjusted cash, weekly cost and promise masks. |
| `hollywoodTick.ts:324–326`, new-screenplay commission chooser | Unchanged, `lockScreenplay: false`; no added forecast calls or diagnostic result field, even if a future caller accidentally supplies the option on an unlocked search. |
| `hollywoodTick.ts:259` onward, active rejection handling and shelved retry evaluation | No edits. Both consume the common evaluate outcome, so hopeless retries can progress under the newly authorized classifier while genuine cash-blocked retries stay held. Existing shelving/promise/hold/retry laws are not rewritten. |

Read-only searches also identified existing tests and helper spies around the chooser/search. The staged independent RED interface uses this exact option name and permits the ordinary result's new property to be absent. No test files were copied, edited or run for this preparation.

## Purity, RNG and default-path preservation

The search only updates local counters/choice. `perceivedPlanningInputs` already creates the planning view; candidate options and budgets are new local objects. The added diagnostic writes no GameState, account, screenplay, receipt, input option or promise-mask map. The re-search options spread leaves the original chooser options untouched. Refusal itself never books money or creates a production; downstream count/shelving changes are the intended law change.

`forecast.ts:392–408` constructs `stream(seed, 'forecast', productionId)` for each forecast. Diagnostic candidates use exactly the existing seed, key, director ID, empty released-film history and singleton concept context, with the same two true mode flags. There is no access to the simulation RNG stream or new random key. Static source reasoning therefore supports RNG neutrality; A9 still must measure additional forecast calls, input immutability and unchanged simulation RNG on real execution.

With the option absent/false, and on every unlocked search, skipped candidates are still never forecast. Affordable candidates follow the original arithmetic and choice update. The ordinary search's output shape, existing counts and chooser result remain unchanged. This is a claim about semantic output and forecast-call cost, not an unmeasured claim that every CPU instruction or tick duration is identical: the boolean diagnostic guard/local counter exist, and enabled refusals perform more forecasts. The measured runtime budget remains the adopted 1363/1356 gate, not a new ceiling.

When the classifier stays the same, no downstream policy behavior changes. When it changes, shelving/retry/commission timing and later campaigns may change; do not call entire campaigns byte-identical or re-pin affected history without the adopted capture rules.

## Required parent-controlled verification and unresolved facts

1. Verify the live two source blobs still match `SHA256.json` before any application; refresh rather than applying over an unrelated production edit. Current base is exactly the requested HEAD.
2. Apply the independently reviewed Part A RED patch in the parent-controlled test tree, establish intended RED failures before this production patch, then typecheck and measure GREEN. The two authorized old-law re-pins remain a separate patch; the Part B mixed-sequence leaf is untouched.
3. A8 is mandatory: mint and review its genuine pre-amendment Save45 count-12 capture/consumer before Part A landing. This patch does not supply one or claim that the bounded capture route succeeded. If shelving now precedes the old week-93 comparison, preserve that capture and mint the separately governed earlier old-source control.
4. Observe A6's valid-state, actual viable/hopeless route and retry-order premises. Observe A9's actual increased forecast work and RNG/input invariants. No masked unrelated failure may qualify these leaves.
5. Run appropriate fallout/broad gates and measured tick cost under the parent's adopted sequence. This preparation proves no runtime type compatibility, natural campaign premise, end-to-end performance or final landing readiness.

No unresolved implementation choice was deferred within Part A's authorized rule. The outstanding items are genuine execution/capture/gate evidence, not new product questions.
