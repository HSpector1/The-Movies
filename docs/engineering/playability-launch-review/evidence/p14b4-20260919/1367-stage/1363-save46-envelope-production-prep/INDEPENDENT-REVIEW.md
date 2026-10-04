# Independent review: Save46 envelope and private-era fragment

Reviewer: `/root/recovery_charter`, 2026-10-04. **PROCEED as a bounded component for later coherent B+C assembly.** No blocking static defect found within the declared envelope/plumbing layer. This is not runtime readiness, full Save46 validation approval, permission to expose the partial era, or a substitute for capture/RED/GREEN gates. The Hollywood owner and current-commitment restrictions remain explicitly unwritten.

## Identity

| Artifact | SHA256 |
|---|---|
| `save46-envelope-production.patch` | `08a5e12ca3b57d7af3b3630cf03928fff06caea1f0cd39b866c0115ccbc2a3ec` |
| `base/src/core/save.ts` | `cc8998793df2dfe16bd6d8ec8a8bd3ad4d98f45de7ff83afe85dc6187f5e9a7f` |
| `candidate/src/core/save.ts` | `9286781eb562fcc9bf961c85eb226176c1dab74b79e8dbbc08333c09531e5332` |
| `HANDBACK.md` | `b05f25fedcd7c7ae4d25f3e2d2d5ffd50e3dd84f5f32381e18770dbdb1ce659d` |

Independently verified all manifest hashes, exact byte equality of this base with the independently reviewed shape candidate, and reproduction of the complete patch from base/candidate. This is a delta on the shape proposal, not directly on live source. Governing authority is adopted 1363-A/F/A2 and allocation 1367-H; the migration RED's declared aggregate diagnostics and implementation map were checked. All line references below identify this exact candidate.

## Findings within the drafted layer

1. **Envelope and public boundary are consistently moved.** SaveFileV46 joins the union, dispatcher and live alias; the writer validates 46 before detachment, the unknown-version message handles 1 through 46, and `migrateToLive` delegates to `migrateToV46`. The latter validates an existing 46 input and otherwise crosses the genuine 45 boundary. Public validators 43, 44 and 45 keep their own version checks through new private wrappers and default both recovery flags false. No public old reader infers permissive eras from saved keys.

2. **Both flags survive every actual descending edge.** Reviewed declarations and callsites, not just the top-level signature. The full route is:

   `46 → 45Era → 44Era → 43Era → 42Era → proveProfessionSave(41) → 37WithProfession → 36WithPolicy → 35WithPolicy → 34WithPolicy → 33WithWriting → 32WithWriting → 31WithWriting → 30WithWriting → 28WithWriting → 27WithLaw → 26WithPolicy → 25WithPolicy → 24WithPolicy → 19WithPolicy → validateHollywood`.

   The two flags keep their order throughout; existing shelving, termination, directing-promise, retirement-writing and profession arguments retain their positions. Public historical entrypoints omit the new flags, leaving false defaults. Both true flags enter only through public46; the mixed pair used by the trusted internal proof is explicit. No new P15 root or allocator is introduced. The 45 private path still validates each P15 owner and calls the one allocator once after the frozen descent.

3. **The direct profession view preserves disposal authority.** At lines 10609–10615 it shallow-copies Hollywood and each business, removes only each `costCutting` key, preserves accounts/refund movements, receipts, plans and absent bodies, and uses `(shelving=true, cutting=false, disposal=true)`. The existing P15/relationship projection stays intact. This is an internal proof view, not a public V41 envelope migration. No JSON round trip or mutation of the caller is used to hide invalid authority. The remaining owner must actually implement the mixed pair; passing through these arguments alone proves no disposed state valid.

4. **Every lower migration uses one governed recovery downgrade.** Independently enumerated exactly all 42 exported targets V4 through V45. Each new version46 branch calls `convertV46ToV45` before its original lower chain. Nonempty recovery therefore refuses at the same named boundary before older P15/profession authority can mask it; empty recovery returns to the unchanged predecessor law. No arbitrary lower-era success is promised.

5. **Validation precedes both initialization and loss.** `convertV45ToV46` first invokes the unchanged public45 reader, detaches the admitted envelope, adds exactly version1/null on every business and zero refund movement to every historical period, then admits46. It creates no receipt or cash/history change. `convertV46ToV45` admits46 first, runs the shared refusal, then detaches and removes only the empty additions before public45 admission. Up-migration detaches nested accounts/periods/history from the source. Existing46 migration is byte-idempotent validation, consistent with the test's value requirement; it need not invent a new object for that no-op.

6. **Aggregate refusal and frozen-builder order match the adopted contract.** The three reasons appear once each in fixed order: `costCutting.since`, `facilityDemolitionRefund`, `facilityDisposed`. All periods are inspected. Downward refusal names `migrateToV45`; builders name their actual caller. Their detection helper selects strict46 admission when any recognizable recovery business/money/receipt shape is present; it does not bless partial/malformed recovery or relax an old public reader. After successful validation and an empty-authority check, recursion uses the detached stripped state and resumes existing P15/profession/technology/Hollywood refusal order. All 18 frozen builders call this shared guard. Invalid inputs remain subject to validation before the aggregate authority diagnostic. Positive refund and valid disposal are inseparable in a lawful state; this helper does not claim impossible independent valid witnesses.

7. **Projection retains key order and input neutrality.** JSON detachment occurs only after the relevant validation; property deletion removes the two additions without reconstructing old business/period keys or sorting them. Up-migration appends the additions; removing them restores old key order. Neither refusal nor projection mutates original accounts, history or receipts. No fake body recreation or refund erasure occurs on a nonempty downgrade.

## Integration seam and small documentation finding

**Current proposals need an owner at a boundary that still has them.** At candidate lines 9093–9095, V28 removes `talentMarket` before descending to Hollywood; only its termination law is carried alongside. `validateHollywood` consequently cannot enforce the set-since/current-proposal restriction from its existing state and arguments. The future restriction implementation must check it at a validated full-state boundary before that strip, or explicitly carry the required authority. Technology/adoption and physical-plan authority already travel separately, but that does not supply market proposals. This is a concrete requirement within the declared unwritten owner work, not an invented new rule or a dropped boolean in this patch. Re-review whichever boundary is added and test it with admitted proposal controls.

**Low documentation correction:** the V44 comment at lines 10890–10891 says “no flag is threaded below V44.” Qualify it as no *relationship* flag, because recovery flags now pass below that layer. This does not alter current behavior or block the bounded fragment verdict.

## Limits retained

The final `validateHollywood` call presently supplies arguments the unchanged owner does not yet declare. Its exact business/movement/receipt laws, positive-money whitelist, chronological/current-commitment restrictions, disposal proof and `[O,D)` accounting are absent from this fragment. This known partial state is not an executable save era. Other validators and live producers must also respect absent-body authority and historical staging before full integration can pass. The shape review's old-period rollover warning remains open.

Public index exports, coherent combined source/types, actual old-reader strictness, malformed-input behavior, direct mixed-era proof, genuine migration captures, all lower/frozen runtime outcomes, intended RED/GREEN, B/C callers, fallout and broad gates still require their own assembly and measurement. The reviewed migration tests are expected to exercise these interfaces once the complete owner exists; no missing-API/schema result is counted as behavioral RED here. Keep source unchanged during active recorded gates and preserve capture prerequisites before applying the assembled candidate.

Only lightweight source/diff/hash inspection was used. No Node, tests, typecheck, runtime, fixture payload access, active recorded-log inspection, source/index change or nested agent. This report is the only write.
