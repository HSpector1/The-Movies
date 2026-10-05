# Historical H1+A: Part A adaptation preparation

**Ready for independent static review; not executed or measurement-ready.** This directory contains only the two exact historical base files, their Part A candidate replacements, a minimal patch, compatibility evidence and pins. No archive, observer, Node, typecheck, test, fixture, live-source/index change or nested agent was used. Parent remains the sole live production writer.

Authority: 1363-F ruling 9 and adopted 1363-A2 §7.6 require Part A on historical H1 against H0, separately from the current recovery comparison. The route/output implementation map is `S/1363-measurement-prep/IMPLEMENTATION-MAP.md`; this preparation supplies only its historical Part A source component.

## Exact bases and compatibility result

| Identity | Pin |
|---|---|
| H1, v1 shelving | `469a9547f1a3b53b7c9985ec53beaa55e2a65587` |
| H1 `src` tree | `db80ca312211a70b54fcb75cb80480ad5e8dc867` |
| H0, comparison only | `ff803032e073a2c512192240ded2817b84632945` |
| H0 `src` tree | `347cfcce5602570eaa39137e6490d7e6fa0228eb` |
| Reviewed modern Part A patch | `S/1363-part-a-production-prep/part-a-production.patch`, SHA-256 `2b11a5c13259b69ddcea3476b826c6eba690b7ea82facfa11e2aff03352bd5d9` |

Read both historical files via `git show H1:<path>`. The H1 policy file is byte-identical to the reviewed modern base. The **whole tick file is not**: the modern base adds the later `factorById` argument to `advanceHollywoodWeek` and uses it to insert `competitionFactor` at the rival reception site. `CURRENT-BASE-DIFFERENCES.diff` records exactly those two later hunks. Neither belongs in H1+A.

Every original Part A hunk nevertheless matches H1 at its exact original line position with exact context. A Python text transformation checked each removed/context line and hunk length, then produced the two historical candidates. Re-deriving their unified diff yielded a patch **byte-identical to the reviewed modern patch**. Thus no code-level adaptation is necessary, but copying the entire modern candidate tick file would be wrong: it would import the two later shared-market changes. This package instead retains the complete H1 file around the one Part A tick hunk.

`historical-part-a.patch` SHA-256 is `2b11a5c13259b69ddcea3476b826c6eba690b7ea82facfa11e2aff03352bd5d9`. It changes only `src/core/hollywoodPolicy.ts` and `src/core/hollywoodTick.ts`. H0 is not changed. The historical Save43 writer remains untouched; no save version, schema, B/C behavior, research, catalogue, market, fixture or test is imported from intervening production.

| File | H1 base SHA-256 | Historical candidate SHA-256 |
|---|---|---|
| `src/core/hollywoodPolicy.ts` | `843131da845b609ad133259ee82035bc129aad4b75394b757d5ac66341efd234` | `cfdde050a2aa2955bdea15f69a9600d7b57017eb09828c01109df03ea7b3695a` |
| `src/core/hollywoodTick.ts` | `5fde94ee7d41d2e6fae441add74d907ff3348f835c486f7aa282966b6c667bb2` | `547ffb90ab8b951b5f1fb554a471af27e57f590dabdaff8e453485e058c1df31` |

`SHA256.json` also records Git blob identities, the modern comparison hashes and exact hunk counts. Candidate blob hashes are calculated from bytes without writing Git objects. No candidate commit or complete candidate tree was minted; its current identity is the fixed H1 base tree plus this patch and the two candidate hashes. Parent must bind the eventual assembled source tree before measurement.

## Historical API and behavior

The original H1 APIs and callers already match Part A's required interface:

- `hollywoodPolicy.ts:32–35`: private structural options containing seed/key, cash available, weekly cost, `lockScreenplay` and optional promised masks. The candidate adds optional `diagnoseUnaffordableViability`.
- `searchIndustryPackages` at H1 `:40`: candidate adds optional `unaffordableViable` only when both `lockScreenplay` and explicit diagnostic opt-in are true. The ordinary return retains exactly `choice`, `affordable`, `unaffordable`, `viable`, including order.
- `hollywoodTick.ts:230–234`: the real ready-screenplay chooser continues to receive its original arguments, reserve-adjusted cash, masks, seed/key and no opt-in. A successful choice returns immediately.
- Only the existing null-choice re-search at H1 `:235–236` opts in. Its label is `cashBlocked` iff at least one skipped package passes the unchanged viability law; otherwise `economicRejection`.
- The H1 chooser wrapper (`hollywoodPolicy.ts:83–84`) and unlocked commission search (`hollywoodTick.ts:324–326`) remain unchanged. A scoped historical `git grep` of `src` found no additional production chooser/search callers. Active rejection and shelved retry handling continue to use the shared evaluate result; their clocks, promise deferrals and storage are not rewritten.

The diagnostic uses the same actual H1 forecast and scoring block for skipped packages. It preserves `expectedIncrementalContribution = expectedTotal × STUDIO_RENTAL_BLENDED − negative − marketing`, the existing hold/operating-margin addition order, and the marketing-posture preference subtraction. The locked viability boundary remains strictly `score > holdOperatingMargin`. There is no duplicated or algebraically simplified scoring formula that could change floating-point boundary behavior.

An unaffordable diagnostic candidate increments only `unaffordableViable` after passing that gate, then continues before affordable viability/benefit/best-choice updates. It cannot become the chosen package, spend money or move a promise. Candidate enumeration, rounded budgets, shape/billing/marketing order, promised-person benefit preference and strict tie resolution remain historical. Absent/false opt-in or unlocked search still skips unaffordable forecasts immediately; no extra result property appears.

Refusal re-search creates only local candidate objects/counters and a copied options object. H1 `forecast.ts:392–408` derives its forecast stream from the same seed/production key; it does not consume the simulation stream. This supports static input/RNG neutrality. Actual forecast-call counts, input immutability, historical type compatibility and full-route RNG/state behavior remain runtime observations to make later. Enabled diagnostic work costs more; no unmeasured performance claim is made.

## Measurement interface and remaining prerequisites

Use this candidate only as **H1+A**, retaining H1's other source/generated inputs. First reproduce H1 versus H0's original 154 promise movement keys/counts; then compare H1+A versus H0 with the reviewed driver and future observer changes. Preserve the four exact historical seeds, state-week-520 end save and legacy week-521 summary convention described in the implementation map. Do not import the modern driver assumptions, Save45/46 migrations, current market-factor seam, fixture re-pins or B/C to make the historical arm compile or run.

No observer is authored here. The existing `searchIndustryPackages` result can expose the diagnostic count to a later transparent observer, while actual caller/market path observation still requires its own reviewed implementation. Missing historical driver/API compatibility is a preparation issue to resolve explicitly, not a causal finding or invitation to merge later production. Current candidate versus H0 remains confounded totals only.

Next gates belong to parent: independently review these pinned two-file replacements; assemble an isolated H1 source with exactly this patch; bind its full tree/runtime/generated inputs and reviewed arm-aware driver; typecheck and verify the relevant law/default-path/RNG behavior; then execute the bounded equal-basis measurement and causal tracing. No new Part A rule or product decision is unresolved. No claim is made that the 154 rows have been reproduced or explained.
