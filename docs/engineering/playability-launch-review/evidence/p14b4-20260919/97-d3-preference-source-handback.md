# 97 — D3 public-preference source handback

Date: 2026-09-20. Status: implementation candidate complete; SOURCE FROZEN for parent verification. This is not the P2 activation or full policy closeout.

## Scope and evidence

The parent released only `src/core/talentMarket.ts` against the independent behavioral RED preserved in `67-policy-reconciled-target.txt` and attributed in `67-policy-reconciliation-disposition.md`. That run reached the age-29 P1 settlement and exposed an incorrectly awarded opportunity band; the age-30 P1 case already passed. Later tagged-P2 attachment prerequisites and rival authoring were separately RED and are not corrected here.

The native `.claude/agents/sim-core.md` role was applied: reuse the existing public preference owner, alter only the authorized authoritative scoring seam, preserve settlement facts, and leave verification/publication to the parent.

## Exact source changes

- Import the existing additive `ProfessionalPromiseV30` type; no live alias changes.
- Export pure `promiseMatchesPreferredOpportunity(state, talentId, promise)`, with a typed family/predicate input. P1 matches only `anyCastAppearance`, read through `publicPreferredOpportunity` and its existing shared `isProven` rule. Explicitly tagged P2 `lead` or `leadOrAntagonist` matches either public preference. Count-only historical P2 and other families do not acquire an invented class. Matching uses shape, never a root or evaluator version.
- In `bandsFor`, D3 is one only when the actual attached promise matches and the actual current `attachedFeasibility` receipt is `REASONABLY_ACHIEVABLE`. The feasibility reader is still called for each proposal; the preference filter changes only the opportunity score.

No changes to attachment legality, fee calculation, proposal material/digests, freeze refusal, chooser priorities, winning employment/promise binding, rival authoring, capacity, persistence, rules versions, or projection. A mismatching P1 remains attached and may win on the other descriptors and bind normally.

## Static handback and remaining limits

Scoped source was reread after the patch. No tests, engine probes, typechecks, generators, Git commands, network operations, or descendant agents were run. No test or fixture was edited.

Frozen source SHA-256:

`dd96a993a61ef50395c075a95505d5b7aa3c5c90d5ae4c66925bad4a28062c51`

The canonical Git diff hash is deliberately not claimed: Git execution was prohibited in this writer task and the parent owns its capture. The only production path changed by this task is `src/core/talentMarket.ts`; this handback is the only evidence write.

Parent verification should establish that the age-29 P1 branch now reaches the next unchanged P2 attachment prerequisite, without representing that partial advancement as a passing full matrix. The designated older B2 test in `tests/p14b1-trust-chooser.test.ts` used an unproven person's P1 to change the D3 winner; its prior expectation is intentionally superseded by this adopted preference filter. Preserve its actual failure/evidence and independently migrate that designated pin to a real tagged P2 at coordinated activation. Do not retain the wrong band merely to preserve the old expectation.

Tagged P2 authoring/feasibility, later matching/binding matrix branches, rival policy, live V30/wire activation, and joint-trace kernel implementation remain outside this patch. Trace source authorization remains withheld pending its independent actual RED.
