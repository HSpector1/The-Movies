# B4 detached capacity kernel — independent source review

Native contract-auditor, 2026-09-20. Verdict: KEEP for this detached finite-kernel
candidate and the bounded extension70 test contract. No concrete proof-soundness
blocker was found in the reviewed source. This is not approval of an unimplemented
owner adapter, live P2 policy, version cutover or full B4 acceptance.

Read all741 lines of `src/core/promiseCapacityKernel.ts`, complete handback64,
definitive interface49/clarification56, the reviewed B4 feasibility appendix and
the complete independent70 draft/brief. Original57 was reviewed in69 and remains
byte-identical. Reviewer ran no tests, typechecks, engine imports/probes, Git,
network or delegated work; no source/test/config/fixture edits were made. This
report is the sole authorized write.

## Exact candidate and evidence

- Parent-supplied base: `17247843921781e3ad873db2e45d1737520a5623`.
- Kernel file SHA256: `43f9471bb796ac517fe72690e72da7b83bf6231108ed4e7e95efe38691702e83`.
- Handback64 SHA256: `327172a146b7c7a3a01af14bd5013f578219f9f1e025c58a87fd5ff63728226a`.
- Original57 installed test: `076f5050aed93c33c269e00ef9d4f6477c3df9da775bc4c2b44022309eab291f`.
- Extension70 draft: `b2a48307aeb3c8856a22def4076a662757ffc121111a15ec97b97fbb2cd00ead`.
- Extension70 installed: `21be846759c7c9c647d36cec0ef631bf6febcbe205d7a03ba49db18b6ee9d33a`.
- Extension brief: `a4132ecec05112cb94cc3813d8514ee9cf74aae6d60a74fb28df8b50c93ec186`.

Independently verified extension installation is one provenance line followed by
the exact frozen draft. Read complete66 raw output and final metadata, not merely
the parent summary. It ran one worker, 23:25:28.221–23:25:32.490Z, exit0,
fixedSource:true, base1724784 at both ends and identical protected patch
`f9aaf3c555912b5211843aa55c98fd7d293ca8f60191305f9cf52c9d374462e5`.
Actual result is41 original plus5 extension cases PASS, two files,46 total;
Vitest2.55s and482ms test bodies. No failed suite, unhandled error or timeout
appears in the complete log. Raw SHA256:
`846160aafd637f6c6e5417a56bf45674f041d4a327d80e826c3893c67f876607`;
metadata: `c4cd0605e8e641e05029b1f7104f3eddc06d53af5dca277e5be98e4798d053ce`.

The earlier62 missing-module run remains zero-body prerequisite RED;66 is the
first reached GREEN evidence for these46 cases. It is not a full-suite result.
Later policy/typecheck stages are not inferred from it.

## Contract findings

### MET WITH EVIDENCE — detached types, identity and purity

The module imports nothing and exposes only the agreed detached types and search
entry. No GameState, action, tick, save, rules version, RNG, chooser or outcome
owner is referenced. Public results are copied data, not a mutable cache or a
real allocation. The internal validation beginning at line216 enforces legal masks,
safe counts/calendars, distinct cast people, path exclusivity identity, local
preselected prior claims, fixed-hold uniqueness and replacement ownership.
Malformed internal identities/calendars throw input Errors rather than a gameplay
classification. This is not a replacement for any save validator.

Foreign rows are structurally checked, then lines672–676 apply different-issuer,
same-target-person, self exclusion, positive remainder and the exact half-open
source-window filter. Source identity/window survive normalization; retained
debits become separate generic local demands in the target window. Real OPEN/
CURRENT versus abandoned/terminal provenance still belongs to the adapter, as56
requires. No invented foreign event or fulfillment is returned.

### MET WITH EVIDENCE — whole paths, exact ledgers and credit accounting

`prepare` retains alternatives with hold replacements even when their event is
null. Uncredited alternatives without a replacement can only add constraints and
are safely omitted. One selected alternative per path and one actual distinct
cast seat per credit prevent duplicate production and same-person/event planning
payments. All prior/debit counters remain required; there is no winner selection
or dropping an inconvenient beneficiary.

At lines479–497 early compatibility checks use selected additional holds and ONLY
each fixed hold's immutable prefix. They do not reject against an unresolved
replaceable suffix before a later continuation can be selected. Full ledger
construction at lines498–516 applies the exact selected replacements and retains
every other hold. A failed ledger when counters are already met continues search
for a later release-only continuation (lines560–574). Thus neither incoming array
order nor null-event path order creates the earlier false-impossibility risk.
Null events earn no eligibility, profile unit or target boundary.

The explicit path stack rolls back credits, profile buckets, selection and added
holds after each branch. It avoids depth proportional to1024 paths on the JS call
stack. Optimistic suffix bounds ignore conflicts and therefore only prune a branch
whose remaining counters exceed even that upper bound; they do not prove a false
physical refusal from a greedy assignment.

### MET WITH EVIDENCE — protected optimum and proof classes

`priorUpperProfile` at lines408–438 computes independent optimistic distinct-path
bounds per demand, including cumulative existing-event boundaries. These are not
asserted achievable. Reaching every component with a lawful prior witness proves
the full optimum when the existing domain is complete; otherwise complete finite
enumeration is required. Aggregate optimization maximizes existing credit units
and then the complete earliest profile, without committing a particular person's
seat. Re-running target probes under that profile keeps equivalent assignments
available instead of freezing the first witness.

Lines715–735 separate protected X, unoptimized joint X and same-witness B. The B
witness contains all prior/debit obligations and the full target buffer; sorted
first-X existing paths and exact eight-week slack are checked on that one witness.
Failed protected X with lawful reallocation yields prior-protection FRAGILE only
after the relevant complete search. Complete unoptimized joint failure is scoped
`jointOfferOnly`, never target-specific causal BROKEN.

Missing holds cannot yield a positive certificate. Missing future alternatives
can still permit a constructive certificate only with a proved full prior
optimum; incomplete negative searches and unproved optima return UNCERTIFIED.
The zero-prior profile is trivially zero but still needs a lawful joint ledger
and B witness. Actual bound remaining0 returns only ALREADY_MET, without writing
an outcome. No guessed maximum is emitted.

### MET WITH EVIDENCE — bounded and canonical work contract

The shared budget starts with preparation work. The pre-scan at lines148–165
charges scalar/string inspection, array visits, bounded sorting allowances and
containers before normalization. Merge sorting and normalized semantic keys
remove input-array order from later search traversal. Search setup, branch,
compatibility, counter/profile and witness work use that same counter.
Exhaustion always returns the explicit work-limit uncertainty; partial best
results are not promoted to a certificate.

Limits remain32 rows,64 units including B,1024 alternatives,200000 logical work
and220-week span. Large counts are rejected conservatively before B/count
expansion; week comparisons use ordered pairs rather than packed arithmetic.
The optional direct certified-upper-bound variant is currently not emitted.
Returning size uncertainty on such larger domains is an explicit implementation
limit, not a discovered physical impossibility or a save-admission restriction.
This is a bounded logical-work contract, not a wall-clock/performance theorem.

## Extension70 — KEEP and reached evidence

The paper-derived fixture is internally consistent: six fixed holds plus the
selected F continuation's one Post hold and G/Q's five holds each total17.
F shortens only its person and stage0 suffixes, at14/12 respectively, retaining
prefixes and the four immutable holds. G can then seat T/A/B at18, Q supplies
T's spare at28. The expected profile is exactly two existing prior units at18;
four credits and F+G+Q are necessary. The local checker verifies all of those
facts without searching or importing the kernel's helpers.

Nonempty fixed holds, both replacements, additional holds, prior masks/rows,
alternatives and omissions are reversed. Full-result/work equality and literal
positive witnesses passed in66. Tiny budgets are forced by an independent string
character lower bound; budget2048 compares disposition without inventing a phase
threshold. This closes69's named nonempty fixed/replacement permutation gap for
this fixture, not a universal correctness proof. Multiple-foreign-row ordering,
arbitrary owner-proof packets and broader adversarial domains are not newly
claimed by the five-case extension.

## PARTIAL / NOT VERIFIED — explicit integration limits

The kernel necessarily trusts detached owner attestations for real staffing,
membership, full alternatives and every relevant person/resource hold. Those
attestations are not created or validated against engine owners here. The actual
owner adapter, mandatory transition calendars, lawful commission/admission paths,
digest integration, ordinary/natural-chain cost, shared live P1/P2 activation and
target-specific causal outcome proof remain separate implementation/verification
work. A small mathematical domain passing46 cases cannot close those obligations.

Next: retain this source/test identity through parent typechecks and checkpoint;
then implement and independently verify the owner adapter under the existing
contract. Preserve original evidence and investigate any newly reached failures
without weakening validators, budgets, timeouts or genuine fixture provenance.
