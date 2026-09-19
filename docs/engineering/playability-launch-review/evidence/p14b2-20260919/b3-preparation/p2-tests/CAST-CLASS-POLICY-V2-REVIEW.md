# B4 policy v2 — independent observation-boundary re-review

2026-09-19 UTC / 2026-09-20 Europe/Berlin. **KEEP the narrow v2 repair.**
The original source-proven lifecycle overconstraint is removed without weakening
the four mandatory authoring witnesses. No further concrete defect was found in
the reviewed delta. This is inert test-contract review, not runtime evidence.

Read the complete draft/brief deltas against the original artifacts preserved
at7022ade72a3f22ab555e225e36c528563eb6fba7 and the relevant unchanged
`advanceTalentMarketWeek` / `settleCase` / `commitWinningPromise` / `closeCase`
semantics. Independently verified exact v2 SHA256 values:

- Draft, 450 lines /7 cases:
  `3d4ce58c83b1193b0e90f79f550332885f1a5e6a0a78ba6052ca57a0ab358ac3`.
- Brief:
  `7bb63a2a07ced836f58ea1e41d480ca157038671c76effb0e7ac07a03b88fb1e`.

## Correction verified

- Positive author-time proposal, material digest, exact appended root,
  unbound/OPEN state and feasibility receipt now come from the original
  `attachPromise` call's immediate observed output. Those assertions are not
  incorrectly deferred until after a possible same-pass freeze and commitment.
- Every observed submission is still processed. An open final case must equal
  its original case and retain its exact current authored/unattached proposal.
  A closed case must resolve to the same real employment-backed case, reach its
  decision week, have a new same-week settled/declined receipt, and leave no
  CURRENT proposal. `expired` cannot follow a real submitted proposal in this
  pass; early invalidation runs before authoring, so the asserted closed-outcome
  subset matches the existing owner ordering.
- A settled case requires newly committed actual employment. If this new root
  wins, its final binding resolves to that issuer/person/current-week contract;
  only contractId and feasibilityReceipt may differ from its authored root.
  The final receipt must equal an actual achievable pre-commit observed read,
  whose input still contains the original unbound root and lacks the eventual
  contract. This is not a self-referential receipt-equality escape: the receipt
  is independently joined to the transparent original evaluator observation.
- Losing, declined or still-open new roots remain exact; prior pair roots
  remain exact. The latter matches the phase order: weekly promise outcomes
  precede authoring, and this market pass does not re-evaluate those old roots.
  There must still be exactly one new pair root for successful authoring.
- Both-refused cases still require zero attachment calls and exact unchanged
  pair roots, including when the case legitimately closes afterward. No late
  proposal is skipped to avoid assertions.
- All four unconditional witnesses remain: achievable flexible P2, actual
  P2-refusal→P1-success fallback, proven P1, and unproven both-refused/no-write.
  Exact candidate order, fullterm/count1, identical fallback input, no-RNG state,
  actual-call pass-through and finally-restoration are retained. The public
  archetype and six D3 comparisons are untouched. No timeout or skip was added.

The brief accurately identifies source-supported same-pass closure as still
UNEXECUTED rather than claiming this seed produces it. Natural four-witness
constructibility, controlled D3 guards, eventual typechecking, future derived
accessor implementation and separately owed final seating/bridge behavior remain
the original review's limits. KEEP does not certify whole B4 policy coverage.

Read-only source/diff/hash access only; no runtime, probes, engine imports,
typechecks, protected edits, Git writes, network or delegation. This review is
the sole edit; original v1 review remains intact. Parent may separately authorize
installation and recorded serial execution under the appropriate later release.
