# 723-C — independent read-only audit of the P14B.7 expansion, and the parent's disposition

Auditor: contract-auditor, Read/Glob/Grep only, no write tools and no shell. Document under audit:
`720-b7-waiver-expansion.md` at its first draft. Source at audit: `152ee9a4`.

The plan's standing rule is that an expansion is audited before its slice begins. Nothing was
implemented when this ran, so every defect it found was free to fix.

**Verdict: REFINE.** Five findings at HIGH, four at MODERATE, four at LOW or INFO.

## The parent's disposition

EVERY finding was re-verified against the source by the parent before acceptance. None was taken
on the auditor's word. All five HIGH findings reproduce exactly as reported. Record 720 is amended
in place and its §10 carries the full log; this record holds what the audit is worth beyond the
edits.

## The finding that mattered most, and it was the parent's own defect

720's first draft cited `reclassifyPromise` (`promises.ts:459-471`) to the writer as "a working
shape to copy" for judging whether the substitute is achievable over the remaining interval.

It is a trap, for a reason the function itself documents. `promiseFeasibility` refuses a window
that overruns its contract at `:406-409`, and both refusals read `draft.startWeek` and
`draft.termWeeks`, documented at `:203` as "the PROPOSED CONTRACT interval the window must lie
inside". `reclassifyPromise` passes the promise's OWN window as that interval, so both refusals
become `w < w` and `d > d` and neither can ever fire. Its comment says why that is right for it:
"a live promise no longer asks whether it fits inside a contract it already rode in on"
(`:449-451`). A live promise's window was checked when it attached.

The waiver's substitute is a brand-new promise whose window has never been checked against
anything. A writer following 720 as drafted would have shipped a `waiverAccepted` that accepts a
substitute overrunning the real employment contract, and the player would have met it later as an
opaque save-validator crash (`:1070`) instead of the clean published refusal the feature is for.

Two aggravating facts the parent missed and the audit did not: `reclassifyPromise` has NO
production caller (its own comment records the grep over `src/ bridge/ ui/`), and it survives only
for `index.ts` and one RED's premises. The draft pointed the writer at dead code as a template.

## The finding with the widest blast radius

720 claimed B.7 needs NO PROJECTION STEP because `WAIVED` is already on the wire enum. True for
the surface it meant, and incomplete in general. Two bridge surfaces change behaviour with ZERO
code edit the moment a WAIVED promise can exist:

- `bridge/trust.ts:68` gates the attention row on `SATISFIED || BROKEN`, so a waived promise mints
  no row. The player who negotiates a waiver would get LESS feedback than one who lets the promise
  break, inverting the incentive the feature exists to create.
- `bridge/industry.ts:136` filters the public activity fold the same way, so a WAIVED
  `promiseOutcome` receipt is dropped at `:141`, silently falsifying the module's own invariant two
  lines above (`:133-134`, "one PUBLIC activity per exact outcome receipt").

And `bridge/schema/industry-schema.ts:147` closes `outcomeKind` to
`optional(enumeration(['promiseKept','promiseBroken']))`. There is no legal third value, so
announcing waivers publicly WOULD need a projection bump.

720 §6 now decides both: B.7 fixes the attention row, because B.7 creates that defect; and B.7
does NOT announce waivers publicly, because a waiver is a private renegotiation and promise terms
are private to their issuer throughout this codebase. Under that recommendation no enum widens and
projection stays 49, but the fold's comment must be corrected so the exclusion is a decision on the
record rather than an accident that happens to read well.

**The conclusion survived, the reasoning did not.** That distinction is the point of auditing
before implementing, and the claim was already published into the five header files, so it is
corrected there too rather than quietly restated.

## The finding the parent was most wrong-headed about

720 sent three product choices up as open questions. The audit showed two are already decided:
mask inclusion is forced by the single-authority rule this module enforces everywhere, and freeze
re-classification cannot reach a substitute that has no proposal, which is 720's own architecture.
Only the substitute's count is genuinely open.

Isolating a settled matter as an Owner question wastes attention as surely as deciding a real one
alone. The parent has been careful about the second failure and was not watching for the first.

## Three more the writer would have hit

- The substitute's `feasibilityReceipt` was never named as required output. It is an exact-key
  mandatory field (`:1012`) validated member by member (`:1047-1061`). A writer could have
  satisfied every original item and met a save-validator crash.
- Nothing refused waiving a promise that is not `evaluable()`. Waiving a TERMINAL promise would
  re-invoke `settle()` and overwrite a terminal outcome, breaking the "TERMINAL and emitted ONCE"
  law (`:705-706`), which the exact-key validator cannot catch because it checks final state and
  not the transition. Waiving an UNBOUND promise contradicts `:588-593`: "B.1 mints no outcome for
  an offer nobody took."
- `progress` and `evidenceRefs` on the waived original were undecided, and `settle()`'s `next` is
  `Partial` so existing callers genuinely disagree. 720 now preserves them, which is what its own
  count rule already depended on.

## What the audit could not do

It had no git or shell access, so the commit shas in 720 §8 are NOT verified by it. The parent
verified them. It read no tests and ran nothing; this was a pure static read-through, which is the
correct shape for a pre-implementation audit and is also its limit.

## Consequence for the slice

T1 does not start against the first draft. The RED suite is authored against the amended 720,
because the amendment changes what the suite must assert: the substitute's window source, the
non-`evaluable()` refusals, the identical-substitute refusal, the stored feasibility receipt, and
the attention row.
