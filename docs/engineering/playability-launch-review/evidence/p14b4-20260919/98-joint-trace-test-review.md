# 98 — independent joint-trace test-contract review

Disposition: **REFINE one incidental ordering assertion in95; KEEP100's narrow
mode-discrimination supplement.** The remaining reviewed mathematical fixtures,
literal profiles and proof checks have no identified contract contradiction.
This is a source-free, pre-execution test review, not a solver or owner-adapter
acceptance and not a report of actual RED/GREEN.

## Exact scope and identities

Read all660 lines of95, its complete brief, matrix92 and the applicable91/94
contract. Also read all82 lines and the complete brief of the separately frozen
100 supplement. Independently computed SHA-256:

| Artifact | SHA-256 |
| --- | --- |
| 95 draft | `b094de96394d4478d000c79ec7600643fcff0b63872c460cf9fa190fe94ada99` |
| 95 brief | `8b3822c972b6fced066c3a49c666f847f97003cbdf728c0830c36875c899af01` |
| 100 draft | `135ce653c336258b412cf1e69c8c358fe9fc6549a8a3d08329a9bb049e950ad2` |
| 100 brief | `5abb55eafec23ec543be2bdbccf10b4b4134a8d218e20234974a7cd20549caf7` |

No implementation was inspected for this review. No tests, typechecks, engine
imports/probes, Git/network operations, source/test edits or delegation occurred.
Only this authorized review file was written.

## Required narrow refinement

95:324 compares `countWitness.executedPathKeys` directly with `['G', 'W']`.
91:163–170 requires the complete chosen trace's path identities and canonical
output, but does not prescribe lexicographic ordering of this list. A canonical
background-before-picture formatter could lawfully return `['W', 'G']`.

Compare `sorted(result.countWitness.executedPathKeys)` with the same exact list,
as95:308 already does for its larger compulsory ledger. Keep the exact membership,
uniqueness and witness reconstruction checks, and keep the full-result permutation
equality checks that independently enforce canonical ordering. This removes an
unsettled representation-order assumption, not a required proof assertion.

## Original negative-premise gap and supplement disposition

95:651–658 supplies a trace input without the required old49 `alternatives` array
or old coverage shape to the old entry. Its throw cannot distinguish an explicit
mode/tag guard from an ordinary malformed-old-input refusal. It remains a valid
general misuse check, but is PARTIAL evidence for91:87–90 mode separation.

100 resolves this gap without changing95 or any old tests. Each case first calls
the complete original49 control and requires its literal FRAGILE classification,
zero prior profile at10 and exact single-P target count witness (100:38–55).
Only then does one case add top-level `mode:'jointOwnerTraces'` (59–66), and the
other add picture kind/trace tags (69–80). The latter retains its lawful nonnull
release14 and empty per-picture hold/replacement arrays. Both retain all original
fields. Missing arrays or a missing old function therefore cannot satisfy these
negative premises. KEEP as an independent supplement; those control calls have
not yet been executed in this review.

## Met at test-contract level

- The proof checker joins exactly one trace and reconstructs all compulsory
  fixed/replaced/additional holds and executed paths separately from credited
  pictures. Uncredited background/null paths cannot silently disappear. Actual
  slots, windows, person/path uniqueness and full demand counts are checked.
- The full-ledger fixture's17 effective holds and four credits are consistent on
  paper. The continuation case preserves the other-owner overlap negative and
  does not turn a background path into a film credit.
- The global early-prior and equivalent-optimum cases use common cuts across
  traces. Their literal profiles discriminate a per-trace classification or
  prematurely discarded equivalent assignment. X/B certification remains one
  joint witness; the split-trace case cannot combine events from different traces.
- The94 unknown-release negatives isolate a missing tail even without later
  overlap, then separately exercise overlap, internal gaps and wrong path joins.
  Adjacent coverage, local-prior horizon extension and foreign-source nonextension
  have positive/discriminating counterparts. No hold is repaired by the checker.
- Completeness and zero-prior tests distinguish constructive positive proof,
  complete negative proof and UNCERTIFIED. Header/background row accounting,
  shared preparation/work exhaustion and long-leaf normalization are exercised
  without claiming an arbitrary intermediate work threshold must certify.
- Permutations include nonempty fixed holds, replacements, added holds, paths,
  traces, multi-slot masks and fact references; they compare the whole result and
  work count. Filtered foreign rows exercise normalization/filter permutation,
  not a claim that every possible foreign-demand allocation was enumerated.
- New-entry positive/refusal helpers explicitly check function existence before
  invocation (95:200 onward and233 onward). A missing API TypeError cannot make
  malformed-input tests pass. Inputs are frozen and independently compared;
  no engine production/history value is fabricated or cast into admission.

## Limits and next action

95 describes38 intended cases and100 adds2; actual collection, typing, runtime
constructibility, work-limit outcomes and implementation behavior remain NOT
VERIFIED. Finite examples and a one-witness checker do not establish solver
completeness, real owner replay, adapter domain coverage, gameplay performance,
save compatibility, full B4 completion, native verification or Owner acceptance.

Preserve95's reviewed bytes, apply the single transparent sorted-list refinement
as an independently identifiable installation change, retain100 separately, then
let the parent record actual RED before the sole kernel writer is released.
