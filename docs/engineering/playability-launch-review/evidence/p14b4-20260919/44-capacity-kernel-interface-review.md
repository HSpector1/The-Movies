# B4 detached capacity interface — independent bounded review

2026-09-20. **REFINE the existing-path continuation/hold contract before
independent kernel tests.** The detached architecture and central proof rules
are otherwise KEEP guidance. This is not implemented solver/adapter acceptance
and does not authorize a source release or claim runtime constructibility.

Read all274 lines of `42-capacity-kernel-interface.md`, SHA256
`ba3816c8e2890f762736b66caa7f7d9574c3d8bac5b0665ff478842449c1f8db`;
the complete relevant B4 capacity appendix at plan382252; prior owner map13 and
review14; and actual `activePromiseReservations`, `reservedByActivePromises`
and classifier call sites. Parent reports checkpointfbe2d28 with publication in
progress; no independent Git/network check was performed. This review is the
only edit; no source/test/runtime/probe/engine-import/typecheck/delegation work.

## Required concrete correction: no-event continuations and hold replacement

Interface42 lines42–50 require a `firstTake: Boundary` on EVERY alternative.
Lines100–113 correctly require an already-recorded picture to provide no new
event while its holds remain authoritative and an actual release action may
later free people. The proposed shape does not explicitly represent that
necessary release-only continuation or define how selecting it changes the
fixed-hold ledger.

Minimal counterexample: an already-filmed production still holds actor T through
release and a future picture needs T. The committed hold conservatively extends
through the horizon; a lawful owner-certified release action would free T at14,
allowing the next picture at15. Omitting the first production from alternatives
leaves T blocked throughout. Treating its historical take as a new alternative
event risks counting old evidence. Simply ignoring same-owner interval overlap
does not shorten the fixed horizon hold against the NEXT picture, and globally
discarding that hold would invent release even when no continuation is selected.

Required mechanical refinement, without changing gameplay law:

- Explicitly represent a whole continuation with **no new qualifying event**,
  for example nullable `firstTake` or a discriminated zero-event alternative.
  It may be selected to establish release/resource transitions but earns no
  event credit, existing-path credit or target boundary. No fake receipt needed.
- Name the exact fixed hold(s) whose future suffix a selected owner-certified
  continuation replaces. Preserve immutable committed prefixes, owner/path and
  person/resource/slot identity, and all other owners' holds. No selected
  continuation means the unresolved original hold remains to the horizon.
- Specify the effective ledger construction before compatibility checks. Two
  alternatives of that same path remain mutually exclusive; selecting a later
  picture cannot itself release the earlier path. Equal owner keys are not a
  blanket waiver for inconsistent intervals or absent release provenance.

Owner map13/review14 and the B4 appendix already require these distinctions;
this is representation/proof clarification, not a new release policy. Add a
small detached release-only/unresolved-hold/other-owner-conflict test contract.
Its fixtures remain mathematical scheduling inputs, not invented engine saves.

## Foreign debit disposition

The proposed normalization is **supportable as an explicit conservative rules4
mechanical hypothesis**, not proof of historical physical calendars or exact
classification equivalence to B3. Actual `promises.ts` filters OPEN, bound OR
CURRENT-linked, self-excluded SAME-beneficiary roots with
`due > max(now, target.start)` and `start < target.due`, then sums each remaining
count. It does not filter issuer or allocate a foreign film/date/class.
The old classifier also places `reserved + X` against existing-path capacity
and uses that ordinal for the target's last-event/slack check.

Representing an overlapping foreign same-person remainder as generic local
opportunity withheld from the target window retains that conservative count
debit without pretending to fulfill the foreign promise. Putting it into the
same prior protection preserves the intended earlier-path debit. Rules4's
actual staffing/calendar and residual B probe are separately adopted changes;
do not describe their outputs as the unchanged scalar evaluator.

Keep the following explicit before implementation:

- Original source identity/window determines membership and digest inputs;
  the synthetic token's target-window normalization does not rewrite that fact.
  Full remaining debit applies even to a partial overlap, as the old filter did.
- Exclude self, abandoned, terminal, half-open nonoverlap and foreign OTHER
  beneficiaries; deduplicate by source promise identity. Do not retain the old
  same-beneficiary filter for new same-issuer class claims: that intentional B4
  extension must include competing local people.
- Tokens have no foreign seat class/date, recorded fulfillment, real allocation
  or causal BROKEN authority. Existing actual foreign employment/person holds
  remain separate owner facts; CURRENT competing offers are not employment.
- A person's event cannot pay both debit and target planning demand; the debit
  may share a real picture with another person's distinct lawful seat. Do not
  consume an entire picture or bypass whole-picture staffing/resource limits.

Independent finite tests should include one foreign debit using the earlier
existing T event, target X on the next existing T event and a later spare in
one joint witness; removing that next existing path must not let a future-only
target claim pass the existing-path condition. Add partial-overlap and exact
nonoverlap/membership neutrality checks. No invented foreign film is required.

## Proof and boundedness requirements retained

- **KEEP:** lower-level detached readonly inputs, invocation-local search state,
  whole staffed alternatives, path deduplication, explicit ordered boundaries,
  caller-specific admission/busy rules, and genuine mode/calendar distinctions.
  An adapter must establish that these compatibility facts cover ALL relevant
  cross-path interactions; a staffing-reference string alone certifies nothing.
- **KEEP:** satisfy every prior claim, maximize aggregate existing credits and
  then the declared aggregate time profile, retain equivalent assignments.
  No arbitrary beneficiary winner or greedy permanent lead assignment. Pin the
  profile's exact credit-count definition and canonical demand-key namespace in
  final types so the independent witness checker has an unambiguous oracle.
- **KEEP:** protected X and B=X+ceil(X/3) use the same proved prior optimum;
  achievable requires one compatible witness with first X existing and8-week
  slack. An optimum cannot be inferred from a best-so-far search. Incomplete
  future domains permit a positive result only with a lawful full witness and
  proved prior optimum; complete/saturated existing-domain bounds must genuinely
  prove the whole profile, not merely its first component.
- **KEEP:** failed protected search is not physical impossibility. The separate
  unoptimized all-obligation witness/failure distinguishes prior-protection
  FRAGILE from joint-offer IMPOSSIBLE. Incomplete negative/optimization proof is
  UNCERTIFIED. No kernel result is target-specific causal BROKEN authority.
- **KEEP with explicit implementation criterion:** safe arithmetic before
  expansion, target/prior/B unit counting,220-week owner-derived ordinary span,
  one shared preprocessing/search budget, and no best-effort false maximum.
  Known sound direct legal/upper-bound proofs need not be mislabeled uncertainty
  merely because a more general expansion would exceed a cap. Caps are not save
  validity rules or permission to disable every ordinary offer.
- **Clarify deterministic charging:** array-permutation invariance must include
  cap disposition, not only the witness found without a cap. Normalization/
  sorting must use a deterministic bounded charge (or equivalent specified
  accounting); order-sensitive comparison counts must not make the same domain
  certify in one input order and exhaust in another. All later traversal and
  proof serialization remains canonical, without selecting a gameplay winner.

The three proposed examples are sound finite obligations under their stated
complete domains, not sufficient owner-adapter or full solver coverage. Resolve
the continuation representation and the named mechanical definitions, then
independent tests can target this internal interface. No broader product choice
or whole-project audit is requested by this disposition.
