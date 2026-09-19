# B4 bounded public preference, fixture and kernel-refinement review

Native contract-auditor, 2026-09-20. Separate verdicts below are KEEP within
their stated scopes. No tests, typechecks, engine imports/probes, Git operations,
source edits or delegation were performed by this reviewer. The sole write is
this report. This is not B4 acceptance or an implemented solver audit.

## Pure public reader — KEEP

Inspected the six-line addition in `src/core/talentMarket.ts`, the unchanged
`isProven`/public priority/term readers, and recorded patch52. Source file SHA256:
`fc87b0fa529ee110e4f7aa81aeab040345f9d24ebfb3089a957e2cb27b23e759`.
Candidate is source `c7ef8c398e0887af4ab63405db17df9925d1c7b0` plus protected patch
`cf4a2787be26ace295cc86b77d2a43c8da6fe15b94f25a97a82c1f35ae3f6b2b`.

`publicPreferredOpportunity` directly uses the existing `isProven`: usable
career identity in any discipline OR age >=30 yields `anyCastAppearance`;
the other branch yields `significantCastRole`. It does not infer identity from
priority-array position or equate every nonzero historical credit with usable
identity. No RNG, mutable cache, new personality root, persisted field, receipt,
authoring, chooser, eligibility or wire change is present. Unknown-person behavior
inherits the existing false archetype rather than introducing another rule.

Read completed evidence43,52,53 and54 metadata; also read complete55 raw output:

- 43 was seven failures on the prior source: the three direct accessor cases
  reached a missing-function error; the passive credit search and two zero-history
  guards failed before their intended policy assertions; rival authoring reached
  an actual P1 versus required tagged P2 mismatch. These are distinct failures.
- 52 is fixed-source exit0: three selected reader cases PASS; four other policy
  cases were deliberately unselected, not demonstrated passing.
- 53 is fixed-source exit0: 15 PASS across two neighboring files, with three
  unchanged TODOs. These cover existing priority/P1/trust behavior, not new P2 D3.
- 54 root/UI typecheck is fixed-source exit0, 22:51:26.742–22:53:15.934Z.
- 55 bridge typecheck is fixed-source exit2, not green: unused `Envelope` at
  `tests/bridge-p14b4-cast-class.test.ts:30` and still-count-only attachment typing
  rejecting `kind` at line365. These diagnostics do not establish a reader defect;
  they remain explicit test-hygiene/future-activation obligations.

No new D3 class matching, rival fallback, bridge exposure or full-policy pass is
claimed by this source verdict.

## Fixture investigation and completed diagnostic — KEEP

Read the full investigation46 and two-case inert diagnostic, including original
market pass-through capture, founding/release actions and all guards. SHA256:

- Investigation: `e3f96eb4d09446a5f3eb4b175af7647a2573393d50af63238966eea4a4cde7b7`.
- Diagnostic draft: `99bfbe5e223f61e59a09c7c840f0fd23070fcad7a4e33a8393bd57b54e40cd0a`.

The controlled pre-market diagnostic preserves actual existing history and uses
only the disclosed age contrast; the real-credit diagnostic uses ordinary
founding, six distinct real hires, greenlight, explicit release and actual ticks.
It neither invents a credit/event nor bypasses managed admission. Exact event,
participant, history, strict-save and next-tick idempotence guards are retained.
The mechanism uses existing public priority/term APIs, not the new accessor.

After handback, read the complete executed58 raw output, final metadata and59.
58 is one worker, two PASS, exit0, fixedSource:true, source c7ef8c3 at both ends,
22:55:29.296–22:55:40.468Z. Its protected patch additionally includes the diagnostic:
`815392ab923ca1f6700b638fa4a670bcf9c10c419a0f4796ecfbcd7d0135ed44`.
Raw SHA256: `42c0ecb85bafc6d3f4a257cfc166e3a3704c413df648c4cc3c031f1155a4aed5`;
metadata: `e5d9d57753c14d0d8c7f2c978b60c992e946ce01b5bfbb5f4c75be5a280add65`.

Actual controlled subject has 13 acting credits, perceived acting OVR11 and no
identity discipline. Eleven actual release events join that retained history.
The age-only29/30 variants passed their whole-person/history preservation and
existing preference guards. The false zero-credit premise can be replaced with
the actual usable-identity predicate; no credit may be erased.

Actual normal founding supplies actor `t-act-07`, age21.343701228323155, OVR64,
zero credits. Its real film `prod-0000` releases at week8 (observed tick9), and
its own event records acting history0→1 and OVR64→65. Strict-save/event joins
and repeat-tick guards passed. This supplies the previously missing constructive
under30 usable-credit fixture without fabricated career or money facts.

This confirms fixture constructibility only. The permanent policy test has not
yet been reconciled and rerun; new accessor credit coverage, D3 settlement and
all four natural rival-policy witnesses remain separate. It is not a managed
first-take result. Parent59 records byte-checked cleanup of only the temporary
diagnostic; source46, patch58 and complete execution evidence preserve it.

## Kernel interface correction44→49 — KEEP with explicit selection boundary

Read frozen49 in full, restricting re-review to the requested corrections of44.
49 SHA256: `c6ee951c0f69c0a435792fd43e639bbc59489566d5a3dd7f5d2a9b07261e8d6b`.
Original42/44 remain historical evidence; this verdict does not certify an
unwritten kernel, adapter or complete production-domain enumeration.

The concrete earlier representation blocker is resolved: `firstTake:null`
represents an already-filmed continuation and earns no event/profile/target
credit. A selected continuation may shorten only its exact path's explicitly
replaceable fixed-hold suffix. Its immutable prefix, identity and other owners'
holds survive; without selection the full hold survives. Equal owner labels do
not waive incompatibility. The fourth finite fixture discriminates all of these.

The correction also defines individual existing credit units and complete
boundary profiles, namespaced demand keys, foreign source-window retention and
full partial-overlap debit, canonical input/branch ordering, shared charged
preparation/normalization/probes and deterministic cap disposition. The explicit
foreign debit is a conservative rules4 mechanism, not a claim of identical B3
physical classification. Protected/joint offer proofs remain separate from
target-specific causal BROKEN authority; missing relevant holds do not certify.

Record the parent's clarified test/implementation boundary here so test57 does
not have to invent it:

- `PriorClaim` rows are already adapter-selected OPEN bound-or-CURRENT,
  same-issuer, self-excluded and overlapping claims. Terminal/abandoned selection
  is an adapter responsibility: these states are not representable in this API.
- The kernel defensively filters structurally valid `ForeignDebit` rows by
  different issuer, same target person, non-self identity and the exact half-open
  overlap `source.due > max(now.week,target.start)` AND
  `source.start < target.due`. Remaining0 is neutral. Original identity/window
  facts still belong to the adapter's digest; filtering does not rewrite them.
- Membership `bound|current` is the supplied adapter attestation, not evidence
  that the detached kernel can reconstruct OPEN/current membership. Kernel
  tests for the representable foreign filters and adapter tests for real
  membership are distinct obligations.
- Malformed internal identities, cross-owner hold replacement or immutable-prefix
  violations throw an input/implementation Error. Tests may require `toThrow`
  without fixing prose. They must never become PROVEN_IMPOSSIBLE or BROKEN.

This boundary is consistent with49's selection and input-invariant rules, adds
no beneficiary preference and resolves the foreign-input filtering ambiguity.
No remaining concrete blocker was found in the bounded correction delta.

Next obligations remain independent kernel tests, separately authorized kernel
implementation and owner-adapter proof/coverage work; then policy reconciliation,
live/wire activation and required verification. None is implied complete here.
