# Joint-trace interface91 — independent bounded review

Native contract-auditor, 2026-09-20. Verdict: REFINE one horizon-definition
inconsistency before definitive independent test authoring. The remaining reviewed
types, joins, proof distinctions and accounting are KEEP as an engineering
contract. No implementation or actual owner-trace correctness is claimed.

Read all295 lines of frozen91 against89, the five90 precision requirements and
unchanged49/56. No source/test/plan91 edit, runtime, typecheck, engine import/probe,
Git, network or delegation occurred. Only this report was written. The parallel
author's mutable92 matrix was not inspected.

Reviewed91 SHA256:
`7c0a75a8ce78fcd4f4e590540db875e542fa272d8a7949c5afab1f8ba424f7f7`.
Reference89: `9b4843850b254ff3b24c90089cf0c526963ba92d2b8c22a3f3adac00b714bbc6`;
reference90: `063d01e2917f288970ac01b34028e31d68538f6e07b99df72c223453d77241ca`.

## Required refinement — effective horizon must govern unknown-release holds

At91 lines110–114, the requirement correctly says compulsory occupancy covers
the analyzed horizon, but the clipping example names `(horizonEndWeek,0)`.
Lines230–231 instead inherit49's span through the latest relevant due/horizon.
Those boundaries differ when the raw input horizon is smaller than a target or
prior due. A test author must not choose one silently.

Minimal discriminant: raw `horizonEndWeek=20`, target window[0,40), known take at10
with `personRelease:null`. The effective analysis still reaches40. Clipping T's
unknown-release hold at20 would leave an apparent free interval and could admit
another T picture/take at30 even though no owner-certified release occurred.
This is a contract wording hazard, NOT an observed kernel/adapter runtime bug.

Use the same exact rule as49/current optional kernel:

`H = max(input.horizonEndWeek, target.window.dueWeekExclusive,
         ...relevantPrior.window.dueWeekExclusive)`.

All unknown-release retained occupancy must cover effective H, not a smaller raw
horizon field. Retain the existing distinction that clipping occupancy at H is
NOT a release and cannot justify a fixed-hold suffix replacement. A foreign
debit's original source due does not extend H after its local planning window is
normalized to the target window. No type/API rename or new gameplay choice is
needed. Parent acknowledged this correction and will record a separate94
clarification; frozen91 remains unchanged for exact review provenance.

Independent tests should pair the raw20/target40 input with T held through40 and
an attempted T reuse at30. A claimed complete trace containing the overlapping
reuse is an invalid producer ledger/Error, not a count IMPOSSIBLE proof; a lawful
trace lacking that reuse may still supply whatever credits it genuinely has.
Do not manufacture `personRelease:20` or40 to repair the premise.

### Required producer/kernel responsibility precision

The lower API must NEVER auto-clip, stretch or synthesize an input hold. General
execution/provenance remains the producer's attestation, but known cast plus
`personRelease:null` permits a small mechanical coverage check in the NEW trace
mode. Recommended exact invariant for94:

- Let start be the lexicographic maximum of input.now and picture.greenlight;
  let end be `(H,0)`. If start<end, each of that picture's three actual cast
  people must have continuous coverage of `[start,end)` in the trace's effective
  compulsory ledger by person holds with ownerPathKey equal to this picture's
  physical pathKey. Adjacent segments may compose; effective fixed/replaced and
  additional holds all count. Another path's hold or a null-owner-path external
  hold is not evidence of this picture's required occupancy.
- A missing tail or internal gap is an invalid producer certificate/input Error
  when validated, not gameplay IMPOSSIBLE or a repaired/synthetic interval. A
  raw20 hold for an unknown-release cast member with H40 is therefore invalid
  even WITHOUT an attempted later reuse. The separately supplied complete hold
  through40 makes reuse30 fail ordinary ledger overlap. Independent tests should
  distinguish these two failures instead of letting overlap mask missing-tail
  coverage.
- This applies only to the new trace mode and the explicit unknown-release
  picture semantics. It does not rewrite49 optional-picture admission, invent
  non-picture cast/release fields or purport to prove owner execution from prose.
  The producer supplies truthful intervals; the kernel checks this known
  structural implication plus ordinary joins/compatibility.
- Existing work-limit precedence remains: immediate preparation exhaustion or
  inability to complete inspection within the governed budget returns the
  appropriate work-limit uncertainty. The Error obligation is not permission
  for unbounded validation after budget exhaustion.

This precision makes91's already-required occupancy-through-analysis statement
testable without requiring the kernel to execute game owners or guess release.
It still needs explicit94 adoption; no such validator is claimed implemented.

## KEEP — resolved representation and identity requirements

The separate `searchPromiseCapacityTraces(JointTraceCapacityInput)` entry and
`mode:'jointOwnerTraces'` distinguish compulsory execution from49's optional
alternatives. Mixed-mode fields, untagged/new trace rows in the old mode and
per-picture hold payloads are explicit errors. Governed old49 inputs/results
remain intact; only explicit new-mode misuse is newly refused.

The picture/background union avoids inventing cast, film or release data for
writing/research/other relevant activity. Nonnull future takes retain actual
cast/staffing/time invariants. A picture with an honest known take and unknown
release can retain that credit; its occupancy proof remains separate. A linked
script/production is one physical path, not two event units. Path identity and
issuer/existing status persist across trace variants; picture occurrence keys
remain unique across the supplied domain.

All trace holds/replacements are compulsory independently of credits. Replacement
authority now joins the fixed hold's exact ownerPathKey to one certified local
trajectory, including non-picture/null-event background paths. Prefix, owner,
subject, slot and other-owner holds survive. Null/unrepresented owner paths
cannot authorize release. Conditional additional IDs can repeat in exclusive
traces but cannot collide within a ledger or with fixed IDs. Self-conflicting
claimed complete ledgers are input Errors, not gameplay impossibility evidence.

Both positive AND count witnesses identify the complete trace, canonical fact
references, every executed path and effective hold, separately from credited
picture occurrences. Credit rows join only actual nonnull pictures of that
chosen trace and keep the person/path single-payment rule. No ambiguous optional
selection list can erase uncredited mandatory work.

## KEEP — global proof and bounded accounting

All traces use one sorted union of existing-event profile cuts with zero entries.
Prior/debit optimization is global; every equivalent maximizing trace and credit
assignment remains available. X/B search cannot compose different traces or use
per-trace optima/fresh public-kernel budgets. One B witness must also satisfy
existing-first-X and slack. Failed protected X requires global unoptimized joint
X; reallocation and complete joint failure retain their distinct FRAGILE versus
jointOfferOnly IMPOSSIBLE meanings, never target-specific BROKEN.

Coverage flags are global and explicitly include future choices that can change
existing calendars through contention. Inventorying existing IDs is insufficient.
Complete negative/exhaustive proofs require complete relevant domains. Positive
proof with nonzero priors and incomplete future-only choices requires complete
existing calendars plus a fully attained sound global profile upper bound,
deduplicated by physical path. Zero prior/debit demand has an identically zero
optimum even at unobserved cuts; it may support a lawful B witness with complete
claims/holds without inventing timestamps. Incomplete failed probes stay unknown.

32 claim rows and64 units including B are shared obligations, not multiplied or
reset per trace. Domain cost is exact: every trace header plus every path row,
including null/background/empty-context rows, consumes the1024-row allowance.
All owner enumeration, abandoned candidates and coverage work enter preparation
work before replay; normalization, ledger validation and every global probe then
share the remaining200000 counter. Span220 and safe large-integer checks remain.
This is finite deterministic work, not a wall-clock guarantee or permission to
raise test timeouts. Work accounting and canonical permutations remain directly
testable requirements, not obligations discharged by prose.

## Finite examples and scope

The three examples have consistent paper outcomes: separated P/Q traces cannot
be spliced into B2; an earlier global prior profile blocks a later per-trace
achievement while an equivalent optimum must remain usable; a real background
release can enable G without becoming a film/credit. Their keys, class masks and
full intervals must be supplied explicitly in tests. The equivalent-optimum
example is a separate flexible-prior variant, not permission to change a claim's
mask opportunistically during one search.

After94 resolves the single named horizon issue, these names and semantics are
sufficient for independent detached tests and a separately reviewed shared-kernel
extension. The real owner producer, truthful complete trace enumeration, safe
owner-step charging, ordinary-case usefulness/performance and end-to-end P2 law
remain unimplemented/unverified by this interface review.
