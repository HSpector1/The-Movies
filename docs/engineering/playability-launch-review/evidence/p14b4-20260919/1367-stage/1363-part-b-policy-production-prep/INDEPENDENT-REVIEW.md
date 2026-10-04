# Independent review: Part B pure policy proposal

Verdict: **PROCEED for parent-controlled application after the reviewed Part A predecessor and subsequent measurement.** No blocking static defect found in this bounded proposal. This is not approval of integrated Part B, Save46, or any measured RED/GREEN result.

Reviewed by `/root/founding_charter` on 2026-10-04. No Node, runtime, typecheck, tests, fixture payload reads, live source edits or index changes were performed. This report is the only write.

## Exact review identity

- `part-b-policy-production.patch`: `5c92dd24a8c7f9413259e7212a8570242b22c252ebbb9bd81b8307bba7b0efe4`
- `HANDBACK.md`: `56d94cc1e8ec2279c24ef612772aaca384d424616b2b393eae5151833487da07`
- Candidate `hollywoodPolicy.ts`: `ea2994dbb980aa60ce70d1e53ecc6c2a0acf1365145f0e6aad148e5cd0a9bce1`
- Candidate `employment.ts`: `ad7f32db9f5a5ed6b5d11a26a25604ab71df07daba0e273214336e92d8c0f1bf`

All six entries in `SHA256.json`, including the two base files, were independently verified. The stated predecessor is published `2eaa697effc38538c37da28b486786ce267a2284` plus reviewed Part A patch `2b11a5c13259b69ddcea3476b826c6eba690b7ea82facfa11e2aff03352bd5d9`. Apply the additive patch in that order; a changed predecessor requires refresh. The candidate file is not a replacement instruction for live source.

Authority checked: 1363-A §4, 1363-F adoption, 1363-A2 retained entry/release rules and 1367-H combined B+C Save46 allocation. Proposed interfaces and expected behavior were compared with approved Part B RED patch `aaf3788ecbb0dc550dc5369f6e5cf91b836a9fb02ba7c85dfd274c531ca72b6a`.

## Static findings

1. **Entry conjunction is preserved.** A scheduled decision must run, with no production, run, greenlight, commission or script work. Cash below reserve independently qualifies once those prerequisites hold. The other branches require an unaffordable commission package, an actual cash-refused unfilled film slot, or nonempty full-index outcomes that are all cash blocked or causally cash-blocked staffing. A renewal refusal and an unrelated Scientist refusal do not substitute for the film-slot fact. Holds, busy writers and economic rejection alone do not qualify. Exact reserve alone does not qualify. The signatures match the reviewed RED interface.

2. **Release keeps R3 and the adopted payback inequality.** Production, writing, unreleased research seats and open promises refuse release; exactly 26 or fewer remaining weeks refuse it. The charge uses the existing rounded weekly salary and current capped termination law. Saving includes that salary plus the existing 1,500 employee overhead. Both post-release reserve and `charge × current operating cost <= current cash × weekly saving` are required, with equality allowed. Static arithmetic agrees with the independent controls: salary 5,000, charge 130,000, saving 6,500, cost 100,000 and cash 2,000,000 give equal products of 13,000,000,000; one dollar less fails payback while the separate reserve still passes. The distinct 330,000 cash / 20-week reserve control passes payback but fails reserve. No division or premature rounding is introduced.

3. **Player and historical termination law are unchanged.** `terminationCost` changes only its parameter's required structural fields to `Pick<Contract, 'annualSalary' | 'endWeekExclusive'>`; its body is byte-for-byte unchanged in the patch. Existing full contracts remain admissible. No player caller, frozen pre-V28 law, tuning value, mutation or receipt producer is changed. Existing Part A search behavior is untouched.

4. **Initialization risk is identified, not dismissed.** The new runtime import from `employment` reaches the existing employment/Hollywood dependency cycle and may alter evaluation order for consumers of the policy module. The new predicates call the imported functions only when invoked; they introduce no top-level call or eager read of those functions' results. Targeted inspection of employment, Hollywood, technology and policy initialization found no new eager policy callback. This supports static acceptance, but does not prove every runtime entrypoint initializes successfully. Required typechecking and module-initialization/runtime gates remain with the parent.

## Limits and required follow-through

These functions are policies over valid supplied facts, not validators or producers. Caller integration must prove scheduled-decision timing, the actual full index and its evaluated outcomes, causal film-slot cash refusal, occupied seats and promises, and fresh cash/cost for each release in employment order. The nonempty array guard alone does not establish the full-index premise. Renewal and Scientist adapter negatives still need their separately reviewed actual-path controls and measured results; their explicit fields are intentionally not positive entry signals.

No persistence, migration, exit, commitment suppression, research/market behavior or caller ordering is implemented by this patch. Save46 and Part C obligations remain separate and mandatory. The payback check protects only the stated local operating-cost boundary; it is not a survival claim or protection against later research spending or loan installments. Preserve the unchanged-Save45 capture gates, measure the approved RED controls before production application, then typecheck and measure the appropriate GREEN and initialization gates. No expected answer or historical input was changed by this review.
