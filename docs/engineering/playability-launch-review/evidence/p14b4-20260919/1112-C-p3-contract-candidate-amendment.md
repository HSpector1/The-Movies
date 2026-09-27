# 1112-C — P3 candidate membership, rival seats and downgrade amendment

This docs-only amendment clarifies three bounded parts of frozen 1112-A
(`a6d89a9b88b20cb168240f18470306b9a43c5309b328b14b1c1217e4cba778c4`).
1112-A remains unchanged. These are proposed implementation details for the
existing candidate; C.3 qualification still precedes any P3 source or test
release. No new product rule, execution or additional test-route budget is
authorized here.

## Open reservation membership precedes person filtering

For a draft evaluated at `evaluationWeek`, use
`from = max(draft.windowStartWeek, evaluationWeek)`. Scan all retained promises
with this explicit membership rule:

```text
outcome === null
AND (contractId !== null OR currentlyAttachedPromiseIds.has(promiseId))
AND promiseId !== draft.promiseId
AND dueWeekExclusive > from
AND windowStartWeek < draft.dueWeekExclusive
```

`currentlyAttachedPromiseIds` comes from the actual current proposal rows.
Neither attachment nor a bound contract overrides the terminal-outcome
exclusion. An abandoned unbound root remains history without reserving work.

Only after that membership scan, select rows sharing the draft's beneficiary
**or** issuer. A tagged P3 in this selected set activates receipt revision 6 for
P1/P2 too, even when its beneficiary differs. The existing
`activePromiseReservations` helper already filters by beneficiary, so its result
alone cannot implement the wider selector. A fresh explicit Director draft also
selects revision 6 without a neighboring commitment. A legacy count-only P3
does not select the Director domain.

In revision 6, deduplicate the selected union by promise ID and charge each
positive remaining count under 1112-A's conservative sequential rule. Membership,
scope selection, reservation arithmetic and digest inputs must use the same
selected facts. Outside this scope, retain the exact existing P1/P2 revision-4
input tuple, arithmetic, classification, text and digest. Reserved evaluator 5
remains deferred.

Settlement freeze may legitimately replace a P1/P2 feasibility receipt with a
revision-4 or revision-6 receipt as actual neighboring commitments enter or leave
scope. It must retain the root's original attachment version. Load and migration
do not reevaluate, restamp or rewrite either value.

Within D04/D09, require separate same-issuer/different-beneficiary and
same-beneficiary/different-issuer positives; a row sharing neither must not
activate the scope. Terminal bound/attached, abandoned unbound, own-draft and
nonoverlapping rows are excluded. Include actual settlement selector changes
where lawfully reachable, retaining root version and unrelated stored receipts. Any
reader-only discriminator must be labelled separately from genuine gameplay.

## A promised Director cannot also enter either cast list

Rival P3 fulfillment can choose a directing-capable primary Actor. That chosen
Director must be excluded from both the promised-cast list and the ordinary
Actor fallback list for that film. Current `hollywoodTick.decide` applies its
`taken` exclusion to promised cast, but the ordinary Actor fallback lacks the
corresponding Director exclusion.

The proposed amendment adds that chosen-Director identity exclusion to ordinary
fallback while preserving its current employee order, eligibility and all other
lawful unpromised choices. Retain the existing writer/director/craft exclusions
on promised cast and the full same-film identity invariant. Do not replace the
ordinary cast policy or exclude unrelated Actors. If three distinct lawful cast
members are unavailable, the normal package path must decline rather than place
one person in both Director and Actor seats.

Within D07/D18, require the real promised Actor-director to occur where ordinary
fallback would otherwise select them; prove their Director seat and absence
from every cast slot. Cover promised-cast membership as a separate subcontrol,
preserve deterministic ordering among the remaining people, and retain an
unpromised control. These controls use the existing bounded rival route; a
missing natural premise remains an explicit failure, not an injected roster or
promise.

## Exact admission governs Save 39 to frozen V38 conversion

The conversion sequence is:

1. Admit the complete input through the current Save 39 reader. Malformed
   current facts cannot escape through an older builder or null Hollywood.
2. Reject every retained new Director-tagged promise authority, including
   unbound, bound, terminal and waived roots. Refuse any other new semantic fact
   that cannot be represented by V38; never strip, recast or retag it.
3. Change only the envelope version for the candidate old save and require its
   otherwise unchanged payload to pass the public frozen V38 reader. Preserve
   every scalar root version and receipt rulesVersion, as well as material,
   progress, evidence and outcome history, exactly.
4. Keep all existing downstream C.3 and older downgrade guards unchanged.

Frozen promise validation admits positive safe-integer root and receipt
versions; numeric 6 alone does not prove an unsupported predicate or its origin.
Therefore there is no blanket `version === 6` or `rulesVersion === 6` refusal,
and no `6 -> 4` rewrite. Exact frozen V38 admission remains mandatory. A
synthetic old-shaped scalar-6 control may prove reader compatibility and a
lossless 38 -> 39 -> 38 roundtrip; it does not prove that genuine P3 history can
disappear. Promise roots are append-only, so a genuine ended or waived tagged
P3 still triggers the retained-authority refusal.

Within D13/D14, keep whole-current positives before negatives, all tagged-root
states, exact unchanged numeric versions on representable old-shaped controls,
and frozen-reader refusal of residual unsupported facts. Predicate shape remains
the semantic discriminant throughout. D04's settlement receipt changes also
check that the root attachment version is not silently synchronized with the
new receipt.

This amendment preserves the 18-row matrix, outgoing Save 38 / projection 53
capture requirement, proposed Save 39 / projection 54 boundary, privacy rules
and all previously declared route caps. No source, tests, fixtures, staged
maintenance or frozen endurance artifacts were changed; no project code was
executed.
