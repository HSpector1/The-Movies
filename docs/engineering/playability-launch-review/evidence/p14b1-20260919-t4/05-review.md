# P14B.1 T4 independent review — 2026-09-19

Candidate: `d19c45b2d873653b4cd4488608e4e411f15a2c34`.
Native Codex specialist `t4_contract_auditor` applied the repository's
`.claude/agents/contract-auditor.md` role body as a bounded read-only review.
No Claude was invoked. No reviewer tests or writes. Parent persisted this report.
Verdict: **REFINE — T4 remains IN PROGRESS / UNITY NOT VERIFIED.**

## Blocking corrections

1. `src/core/promises.ts:324` checks only the window's closing edge. Companion
   §4.3.1 and B.1 scope require the entire window inside the proposed contract.
   Existing outcome test at `tests/p14b1-promises.test.ts:632` attaches [45,75)
   to [52,104), positively exercising this defect. Add the lower-bound refusal;
   re-express legal outcome scenarios with the actual proposal start, keeping
   their original outcome protections.
2. `promises.ts:316` hashes only draft/week for `inputsDigest`. Pipeline and
   reservation changes can change classification without changing its evidence
   digest. Include relevant committed inputs; preserve deterministic/RNG-free reads.
3. `talentMarket.ts:735` discards the freeze receipt after reading its class;
   `commitWinningPromise` at 1075 stores only the binding. Scope item (5) requires
   persisting the actual freeze receipt with the winning promise.
4. `save.ts:8579` strips V29 roots/proposal leaves before frozen validation,
   while `validatePromiseRoots` at 738 never validates the proposal `promises`
   leaf, resolves a bound contract, resolves an outcome receipt, or resolves
   qualifying evidence. Terminal null outcome IDs also pass. Add exact-reference
   regressions and correct this owner without weakening the frozen validators.
5. The known SATISFIED test fixture at `p14b1-promises.test.ts:579` guesses
   `player:contract:${cast.lead}`. Replace it with the existing helper's real
   employment row ID and assert the person/studio binding.

Positive coverage required: a populated V29 save with several beneficiaries
sharing one first take but distinct promise outcome receipts must round-trip.

## Confirmed protections and precise limitations

- `bridge/promises.ts:96` is already viewer-scoped and bound-only. Reuse it.
- Own terms/competing UNKNOWN remain at `bridge/people.ts:952`.
- Unbound promises are not evaluated; the prior shared outcome-ID bug is fixed.
- Existing save tests cover empty-root lifts and unbound promises, not the full
  terminal-reference claim above.
- Correct stale T3a prose: the B.1 carrier is absent when there is **no case**;
  `caseForTalent` also returns terminal cases. It is not limited to open cases.
- Existing three chooser todos remain visible: D3 contested outcome, the literal
  both-non-incumbent tie, and unavailable rival early termination. No new todo.
- The bridge previews promise drafts; its existing submit handler does not attach
  the promise. Keep this deferred consumer/command integration gap explicit.
- No broad capacity redesign finding was established by this bounded review.
- P2–P5, WAIVED/VOIDED reachability, relationships, calendar/Upcoming, B.2 trust
  disclosure, Unity/native verification and Owner acceptance remain open.

## Preliminary verification disposition

The original-source verification began at 10:49:07Z. Root/UI `npm run typecheck`
passed (exit 0) at 10:50:50Z. The parent then terminated only its own recorder,
npm bridge typecheck and child tsc processes after identifying these blockers,
before either full suite started. Tool session exited 143 (SIGTERM); the partial
bridge typecheck has no completed runner exit and makes no pass claim. Its raw
log and `00-run.json` are preserved unchanged as the interrupted attempt.
The final T4 pass must use the corrected fixed source and a separate run record.

## Independent RED follow-through

Native test-author observed the required failures on unchanged `d19c45b`
production, single worker: `06-targeted-initial-RED.txt` exit 1, 15 failed / 24
unselected (9.22 s); `07-terminal-references-RED.txt` exit 1, 13 failed / 1 passed /
14 unselected (9.54 s). “Unselected” is the explicit command name filter in these
two diagnostic runs, not newly skipped tests. The natural shared-take terminal
round-trip is the positive case that passed. Sim-core began production corrections
only after the second run completed and source ownership was released.

Implementation ruling: `attachPromise` remains a draft-staging entry that may
carry a non-offerable classification; the recovered digest/refusal tests rely on
this deliberately. Shared feasibility classifies an out-of-contract window as
IMPOSSIBLE, the quote refuses it, and freeze drops it. T4 adds no new attachment
policy. Supported old V29 records retain their truthful submission-time receipt
and historical window on load; the reader must not invent a past freeze receipt.
The corrected writer enforces the new-window and persisted-freeze guarantees.
