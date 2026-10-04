# Independent F6 ruling 4 quality review

Reviewer: Codex /root/sweep_review, 2026-10-04. Verdict: PROCEED to parent-controlled RED then GREEN after the current Save45 recorded gates; no runtime qualification claimed.

## Reviewed artifacts

- test-red.patch: SHA-256 `6d6913cfeffd10a8b58a57b3095d936ddf9f91561ee38f972476811cdbdb15be`.
- production-quality.patch: SHA-256 `7be9bbd6b99e828824679d12303e2f73bd56dc5490d72409bbbd9215e65e0a03`.

Read both patches and HANDBACK.md. Checked isRow, validateCampaignLegacy refusal construction/lens path, validateSaveV45 call chain and boundary-freeze wrapper against reviewed Save45 candidate ee289de67e453ce269c98d840a48799265c62993. Parent names source95ddf564 with production unchanged at19d5d06e; parent retains actual-source parity verification at application.

## Findings

No blocking static finding. The sole executable change checks isRow before exactKeys on each lens. isRow excludes null, undefined, numbers, strings and arrays, matching all five mutant inputs. The existing explicitly never-returning refuse binding produces exactly `validateSaveV45: campaignLegacy.official.studios[0].lenses[0] must be an object`; the test anchors that complete message. It first validates a genuine route-generated baseline, mutates only one lens, verifies the rejected input remains unchanged, and revalidates the original baseline afterward.

This is stricter error classification for already-invalid shape, not an archetype evaluator, catalogue, frozen definition, valid-state result or replay-law change. The four comments describe the pure unstamped freeze versus tick allocator, replay dependency rule, combined downgrade refusal, and validation-before-downgrade ordering. F6 ruling2's outstanding frozen-capture/pin obligation remains intact; this patch does not satisfy or waive it.

Minor wording suggestion, nonblocking: the comment saying catalogue/evaluators are “frozen by 1361-F6 ruling2” could say “held fixed by the rule in 1361-F6 ruling2” to distinguish governance from an implemented frozen-copy architecture. Present wording explicitly cites the rule and does not require a scope expansion.

## Execution limits

No tests/typecheck/build or fixture reads were performed. RED must attribute its actual failure to the lens refusal, and GREEN must exercise the named guard rather than a preceding unrelated failure. Runtime must establish route availability and the first studio's nonempty lenses. The synchronous route is not externally bounded by Vitest timeout alone; use the established bounded heavy-lane wrapper as handback requires. Existing coherent type/generator and affected P15C checks remain parent-owned. Do not apply or stage either patch during active recorded runs.

Only this review file was written under explicit parent authorization; no source, repository index, fixture or candidate was modified.
