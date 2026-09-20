# 244 — three bounded pre-execution oracle corrections

2026-09-20. FROZEN, INERT, UNEXECUTED. Seven cases / 440 lines; intended
`tests/p14b4-ready-owner-replay.test.ts`. No runtime, probe, typecheck, protected
source/test edit, Git/network operation or replay-implementation inspection.

Corrected draft: `244-ready-admission.test-draft.ts`

SHA256: `242d6f92cfcf4fa2aeb7e08a510439b07af1f3a98e56842e51e19e4d730f7bda`.

Original242 remains byte-identical, SHA256
`ade2d742bb935d0d84e43ff42590a9837bb1040e9505d94271b485af5273e71c`.
Its original brief, scope, real-action fixture provenance, unexecuted guards and
remaining coverage apply unchanged. The historical242 labels inside the copied
draft are intentionally retained; this document supplies correction provenance.

## Exact correction set authorized after243 REFINE

1. Original A's trace greenlight retains `{week:old.startTick,step:0}`, not the
   replay's current week. Added strict fixture guards `now===2` and
   `old.startTick===1`; new B remains admitted at `(now,1)`. Original production
   path identity and source-now fixed-hold interval are unchanged.
2. The existing kernel result discriminator is `status:'UNCERTIFIED'`, not
   `kind`. Exact `reason:'domainIncomplete'`, work and purity assertions stay.
3. Work0/1 assert `preparationWork===work`, no complete attempt, and nonempty
   omissions. Work0 additionally requires empty fixedHolds and attempts, matching
   the fixed administrative response before named-plan reads. All five observed
   owner-call counts stay zero. No mandatory named cut is fabricated when no
   allowance exists to read/identify a plan. This matches176 and existing182.

The independently read existing182 zero/tiny assertions confirm the last
contract. Parent supplied the final243 three-finding disposition. Plain `diff -u`
confirms only these four hunks (including the two fixture guards); it exits1
because these expected differences exist. No assertion/fixture/cap/default
timeout outside the three corrections changed.

No behavioral RED or GREEN is claimed. Parent may compare/install these exact
bytes and record the real missing-export/body reach before releasing a writer.
