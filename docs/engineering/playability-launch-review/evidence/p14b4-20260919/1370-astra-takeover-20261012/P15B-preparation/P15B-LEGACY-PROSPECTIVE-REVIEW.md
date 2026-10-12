# Targeted prospective Legacy amendment review

Reviewer: GPT-6.1 Sol, Codex-native `founding_review_sol`, 2026-10-12. Exact reviewed proposal is the final section "Prospective Legacy implementation amendment for independent review" in `P15B-TERMINAL-COMPATIBILITY.md`, including the author's three confirmed clarifications at lines54,66,92. Current source was read in `/Users/zacheryspector/studio-specialists/p15b` at base `8cecf5aa8a7073fdad8a02534fe40d67ba54558e` plus preserved recovered draft. Parent remains sole production integrator/live gate owner. No tests/compiler/jobs, source/production/package edits or delegation; only this assigned scratch review written.

**KEEP — supports parent adoption of this bounded prospective implementation amendment under1367-G. This is design/contract review, not implementation verification or permission to enable a null hook without the specified source/type/reader/transaction work. No unresolved new gameplay/threshold decision identified.**

## Requirements and dispositions

| Requirement | Proposal disposition and source basis |
|---|---|
| Save48-only terminal persisted authority | MET IN PROPOSAL. `EndedLegacy` retains common manifest payload and five existing stamp fields, adds exactly closureId, requires kind=endOfRun, null postFinaleMode, cutoffC+1 and bidirectional manifest/closure link. No duplicate cash/state/history payload or new global save era is proposed. Existing current string|null closure link is reused. |
| Frozen official v1/v2 manifests/readers | MET IN PROPOSAL. Existing thresholds/evaluator/catalogue/domain/ref paths remain exact; persisted definition selects replay. Modern Save48 context alone admits new authority. Clarification at proposal:54 explicitly excludes officialv3 from frozen45/46/47 even when endOfRun=null and makes v3 official a downward refusal. This prevents an expanded global definition union from accidentally widening old public readers. Current old Legacy null-only gate is `campaignLegacy.ts:1213`; new live admission must be deliberate. |
| Prospective actual-closure semantics | MET IN PROPOSAL. New v3 adapter/resolver source domain studioClosures joins closureId, actual week, global sequence and recording coverage. v1/v2 old adapter still derives its old definition's closedWeek from condition events (`campaignLegacy.ts:1047-1062`); frozen replay is not reinterpreted. New v3 uses actual closure, and due-only never becomes terminal evidence. This matches adopted Wave4:26,30,60. |
| Evaluator/lens selection, not just changed field | MET AFTER CLARIFICATION. Current resilientSurvivor independently treats condition.to=closed as terminal (`campaignLegacy.ts:711-715`); current resilience lens counts such events as closures (`:760-765`). Proposal:66 explicitly selects v3 archetype AND lens behavior, preserving distress/recovery owner facts but counting/citing actual closure rows and including the new domain in limited/notRecorded semantics. No absence of recorded closure history is treated as proof of continued operation. v1/v2 shared helpers remain unchanged. |
| Newly written official versus ended definitions | MET IN PROPOSAL. Future eligible official and ended writers select frozen v3 explicitly; imported/stored official v1/v2 bytes/IDs remain untouched. v3 retains frozen v2 threshold arithmetic, archetype/lens identities and unaffected law. Late import with no eligible official does not retroactively create one. An ended assessment is campaign-common-builder output linked to actual player closure, not a new per-rival end-run product. |
| C6240 official/ended order | MET IN PROPOSAL. All boundary closures/dispositions complete first; finale emits eligible official cutoff6240 before ended cutoff6241, without advancing market.tick. This preserves that boundary's Ranking and excludes actual closureC from official's strict closureWeek<B source while including it in ended. Adopted Wave4:36,40 and1367-G require these distinctions. |
| One allocator and atomic publication | MET IN PROPOSAL. It expressly replaces the current hook choreography rather than turning on the constant. Private prepared closure rows consume allocator, then finale uses returned next; later same-boundary rival closures may consume intervening values. No stale playerN+1 write, duplicate sequence or partial publication. Final full-state validation and failure rollback required. Existing source hazards are `studioClosure.ts:385,391,398-399` and `tick.ts:1217-1219`. |
| Actual47 predecessor compatibility | RESOLVED SCOPE, retained. Proposal:92 supersedes the earlier broad "essential undecided prior-due" claim. Genuine Save47 initializes empty P15B history and ordinary future notices/remedies; unsupported due-only unlanded draft transfer remains explicitly gated. No new grace, loan/reset or historical notice is proposed. See sibling `P15B-COMPATIBILITY-REVIEW.md`; this review does not reopen it. |

## Corrected actionable points from first proposal read

All three were incorporated before KEEP:

1. Explicit frozen-reader exclusion of official.definition=v3, including endOfRun=null, plus named v3-only downgrade refusal.
2. Explicit version selection for resilience lens closure counts/refs and closure-domain recording coverage, in addition to the resilient-survivor archetype.
3. Remove obsolete unresolved-Owner-grace framing for the actual current predecessor; retain parent scope gate for unsupported due-only draft transfer.

No extra representation/governance framework, new acquisition scope, survival threshold, recovery product or studio lifecycle policy is required by this proposal. v3/domain naming and the closureId link are routine representation choices for parent adoption, not an Owner gameplay question.

## Required implementation proof, still absent

- Separate frozen v1/v2 type/reader/catalogue allowance from Save48's modern official/ended allowance; adding a union member or table entry alone is insufficient. Validate old official bytes/IDs across migration and later closure without recomputation. New live context must not spoof a predecessor state by changing endOfRun to null.
- Prove actual-versus-due distinction in BOTH archetype and lens, actual closure before/after its due cause, exact new closure references/watermarks and recording limits. Verify v3-only header/domain/ref/definition tamper refusals and frozen-era rejection.
- Prove closureC before/exactly/after6240, eligible/ineligible official, existing frozen official retained, same-boundary multiple closures, correct Ranking/source cutoffs and no extra simulation week. TableN+1/N+2 notation is conditional on no intervening closure allocations, as the proposal explicitly states.
- Prove official then ended use unique globally ascending sequences and the existing finale phase triple; both campaignLegacy manifests counted once by the shared allocator; player closure link joins exactly its actual ended snapshot, rivals gain no separate ended assessment.
- Prove failure during closure preparation or either manifest/adapter/ref/allocator validation preserves full caller input, cash, ledger, RNG, claim/closure IDs, existing official bytes and next sequence. No private prepared state may reach UI/autosave or a direct action return.
- Prove once-only save/load/replay, read-only terminal commands, and composed downward refusal preserving founding/recovery/P15 reasons. Null-hook tests remain historical evidence, not coverage for the completed path.

Once parent adoption is recorded, implementation can proceed within the already-authorized P15B slice; this KEEP does not claim source completion, measured GREEN, full6240/recovery qualification or Owner gameplay acceptance.
