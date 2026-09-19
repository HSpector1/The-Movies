# P14B.3 — existing P1 quote-to-commit integration (bounded expansion draft)

Status: written during B2 T2, audited KEEP in13; NOT implemented/closed. B2 qualified closeout
is the implementation gate. This extends the existing B3 preparation, not a new
feature choice. Refresh exact B2 source identity before RED/writer release.

Authority: current logic-first continuation; P14 companion §§4.1–4.4 and R5;
P14 plan B1 T2b ruling; `../p14b1-20260919-t4/14-b3-preparation.md` with bounded
contract-auditor abandonment ruling. Parent inspected immutable source6d23466 for
promise accounting and unchanged contract/session owners. No mutable B2 writer
source was used as accepted law.

## Contract

The existing P1 promise draft on `quoteMarketProposal` becomes a real, atomic
proposal attachment. No family, waiver, relationship, lifecycle or chooser law
is added. A quote is pure and repeatable; successful commit uses the same engine
preparation and publishes only its final successfully attached state. No signing
money moves at proposal commit; actual winning settlement binds to its real new
employment contract under existing B1 law.

Only the player's issuer is accepted from the wire. Retain canonical draft VALUES
(including nested promise) in conversion and pending intent, not a caller-owned
mutable object. All promise material terms affect opaque intent identity. Keep
state-digest, session/revision, quote invalidation, command replay and 16-entry
pending-quote bound. Direct conversion/apply also revalidates the current state.

Revision first uses the real `submitProposal` replacement (clears the prior
attachment), then attaches the new draft. Quote feasibility must see that exact
intermediate immutable state, not count the old self attachment against its own
replacement. Removal submits without a promise; withdrawal removes the proposal.
Historical unbound roots remain unchanged; none becomes outcome/trust/history.

Non-REASONABLY_ACHIEVABLE promises make the WHOLE quote noncommittable. Preserve
the engine's classification/bottleneck and both contract-window edges. Prefer an
accepted quote with outer `ok:false`, nested promise verdict/message and no
registered commit intent, using the existing schema. Do not invent a refusal enum
or mislabel it with an unrelated existing refusal. Source proves current outer
`ok` only checks base refusal and pending registration ignores nested promise
verdict; both must be corrected together. An apply failure returns no `next`;
original proposals, receipts, promise counter/roots, cash, RNG, revision and saved
slot remain unchanged. A temporary immutable reducer result is not a commit.

## Prerequisite F1 — abandoned reservations, already reviewed narrow correction

An active seat-reserving root is OPEN and either bound to a contract OR referenced
by a CURRENT proposal. An unbound abandoned/revised/withdrawn/losing root is not
active; retain it as evidence, but it reserves no seat. Use ONE membership rule
in `reservedByActivePromises` and `feasibilityInputs`; preserve self exclusion,
beneficiary/overlap/count/progress arithmetic, current attached drafts and all
bound-open promises. Do not make reservations bound-only. No old feasibility
receipt is recomputed or rewritten on load; the bug correction applies to new
classification/digest reads, not fabricated historical facts.

**Dated traceability amendment (2026-09-19, bounded independent review):** advance
the evaluator's rules revision from1 to2 for this observable correction. Criterion:
increment when newly evaluated receipts can differ for identical lawful inputs,
including implementation corrections to settled law; output-equivalent refactors
retain the revision. Only newly minted roots and newly evaluated receipts use2.
Do not rewrite existing root versions or stored receipts on load. A legitimate
later freeze may write a fresh revision2 receipt on an original revision1 root.
This is a delegated traceability decision, not new product policy or a save/wire
shape change. Positive historical version numbers are not future predicate tags.

Independent regression must reproduce the defect using real submit/attach/revise
or withdraw calls BEFORE correction, with lawful pipeline constraints. Preserve
the second-overlapping-active-promise refusal. Re-express only the older synthetic
unlinked-active fixture with a real bound/current attachment, explaining the old
premise; don't weaken its capacity assertion. B2's real poaching construction
corroborates the bug, but is not a substitute for a minimal independent RED.

Separate product boundary remains OPEN: competing CURRENT proposals for one
person are mutually exclusive, but present reservation accounting sums them across
issuers. Preserve that behavior here; no new cross-issuer optimization policy.

## Independent acceptance

1. Pure repeatable quote and exact state/receipt/RNG/cash preservation; draft
   values retained after caller mutation; each material promise field changes ID.
2. Actual BridgeSession commit attaches exactly one P1 at the real live ordinal,
   correct issuer/person/current proposal/digest; revision increments once; no
   immediate cash movement. Base proposals without promises still work.
3. Whole-quote FRAGILE and IMPOSSIBLE refusal (real constrained pipeline), lower
   and upper contract edges, no registered intent, no partial effects on direct
   apply or session submit. Nested error remains visible to the consumer.
4. Replacement, removal, withdrawal retain old unbound evidence without phantom
   reservations/outcomes; genuine other bound/current overlapping promises still
   reserve; abandoned-only differences do not perturb feasibility input digest.
5. Wrong session, stale revision, changed state/expired intent and same-command
   replay preserve established envelope outcomes and exactly-once mutation.
6. Two sessions with the same campaign seed/IDs share neither pending draft nor
   state; one session's successful proposal cannot authorize/mutate the other.
7. Legal quote→commit→actual winning settlement binds the new real employment row;
   one real kept or broken outcome → valid V29 reload and B2 public/private surfaces.
   No forged settlement flag or contract ID. B2 real fixtures may be reused without
   deleting abandoned roots. Rejected/malformed input never mints a historical fact.
8. Revision continuity: new evaluator/root/receipt revision2 is independently
   pinned; genuine revision1 roots and receipts load byte-unchanged; a later real
   settlement/freeze retains root.version1 while recording a fresh revision2
   receipt and actual employment binding. Historical root versions never have to
   equal the current evaluator. Mint the genuine input BEFORE changing the writer.

New independent files: `tests/p14b3-reservations.test.ts` and
`tests/bridge-p14b3-promise-command.test.ts`, plus the dated traceability amendment's
`tests/p14b3-rule-revision.test.ts`; any additive helper is separately
owned by test-author. Because the functions already exist, initial RED may be a
behavioral assertion; do not create a fake missing export. Main bridge integration
RED must fail for missing real attachment/refusal, not fixture invalidity.

## Tasks and scope ownership

T0: after B2 closeout, confirm exact source and schema. Expected Save29/projection46
unchanged if wire shape stays identical; no save/runtime schema migration is
expected in that case.
Preserve a small genuine old-evaluator corpus at the qualified B2 writer BEFORE
B3's evaluator moves: real current/withdrawn P1 and real refused non-actor P1
staging, including original revision1 receipts/root versions. This additional
continuity evidence is not a save-version bump. A guarded minter draft is being
prepared outside checkout; execute only after B2's publication gate. Reuse the
old non-actor record for the separately reconciled post-B3 eligibility correction.
If an actual wire change is needed, first allocate the next projection, freeze a
genuine outgoing runtime checkpoint and record the exact reason; no restamping.
T1: test-author independent reservation and command-route RED, serialized runtime.
T2: sim-core sole production writer: narrow promise active membership; then shared
quote/apply preparation in `bridge/contract.ts` and `bridge/session.ts`. Only if
needed, a new bridge helper or narrow existing `bridge/promises.ts` reuse; avoid
duplicate feasibility law. No schema/save/chooser changes assumed.
T3: affected B1/B2/B3/market/session/replay/isolation tests, root/UI+bridge
typechecks, both contract checks, native contract-auditor read-only review.
T4: committed fixed-source serial full core/bridge pass, exact inherited-failure
attribution and any corrective rechecks; qualified logic label, backlog, records,
commit/push/exact remote verification. No timeout/validator weakening.

Planning forecast at this amendment: B3 roughly2–3hours including fixture/RED,
implementation/targeted checks and the observed~90minute serialized full pass;
unexpected real regressions are additional, not permission to weaken a gate.
This carries prior programme usage forward, not a fresh allowance. B-F2's separate
boundary is budgeted in its own expansion; no broad P2 estimate is asserted yet.

Unity obligation: remove B1 preview-only caveat only after engine integration is
verified; client must honor outer quote `ok`, show nested refusal, submit exactly
the emitted intent, display bound/outcome history and preserve UNKNOWN rival
terms. Native/rendering/Owner acceptance remain deferred and never inferred.

Next after B3: the narrow, now-reconciled has-discipline correction B-F2 in the
P14 plan (existing authority; not a new Owner choice), then separately expand
remaining P2–P5/waiver/relationships/P14C under
their accepted requirements and genuine unresolved-decision boundaries. Do not
silently call this P1 route completion all of P14B or the whole P14 package.
