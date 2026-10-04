# Independent Part B commitment guard review

Reviewer: Codex /root/sweep_review, 2026-10-04.
Production patch SHA-256: `b4303c5670ccf3ad289102a7b3f6f949af6f84782290b888e2b8e08c6fb0642e`.
Historical callers patch SHA-256: `8a95be91469de3949724173d4e1cfb7fc8908957f13501e0f341b1e3e21d45cb`.
Handback SHA-256: `dcf256527e547350a4945631dba87a712e6272d1fb419f741e3803fdf48a7101`.
Base: `2eaa697effc38538c37da28b486786ce267a2284`.

Verdict: PROCEED for parent-controlled combined Save46 integration and subsequent RED/GREEN verification. No blocking static guard-placement or historical-caller defect found. This patch alone is not complete Part B or executable on the unmodified Save45 schema.

## Identity and scope

Verified every SHA256.json entry, all four base files against current live source, and both complete patches against reconstructed base/candidate diffs. Production changes only rivalResearch.ts, technologyRival.ts and talentMarket.ts. The separate historical test patch changes only two arguments in p13b-s8-save-v27.test.ts; assertions and input authority remain unchanged.

## Guard assessment

- Scientist demand returns zero before considering new research capacity demand on a cutting live business. Existing staffing still needs its separately reviewed no-hire/no-renewal integration.
- Public plan admission defaults to strict recovery mode. Its explicit pre-recovery argument preserves already validated historical staging rather than inferring an old era from missing fields. The internal weekly admission has no historical switch and refuses new plans while cutting.
- The research guard encloses only interests, new seat assignment and new project starts. The independent loop over already active projects remains unchanged, including real advanceRivalResearchWeek calls and positive-cost debits through moveRivalMoney. No pause, project cancellation, lost progress or free research is introduced.
- Commercial purchase/adoption guard returns the original technology root before any new commitment. Existing adoption completion and production selection are outside this guarded function and unchanged. Prior commitments may still become operational; the future validator must check commitment dates rather than operational dates.
- Market withdrawal is after the engagement guard and before invalidation, discovery, rival proposal evaluation or settlement. Hollywood therefore exists on this path. withdrawProposal has no proposal-window restriction and simply removes the existing issuer/person pair, without a new receipt. Iteration over the original proposal array is safe for a valid root with unique pairs; each returned state retains previous removals. The new per-business guard precedes decision timing, duplicate-proposal checks and the extension bypass, so retirement-extension cases cannot evade cutting policy.
- Guards read the actual current cutting field. A malformed live state does not silently acquire old-era permission. Save46 initialization and public validation remain prerequisites; this does not add a permissive save reader.

## Caller census and historical compatibility

Read source/test call sites excluding fixture trees, plus bounded scripts/bridge/UI TypeScript searches. No additional direct historical caller was identified for the newly guarded Scientist-demand, research-step or commercial-adoption functions. Their inspected tests construct generated/current worlds or migrate current state; they retain live defaults. Active policy entry functions remain internal weekly callers.

The two changed historical admission calls are correctly distinct: the staged receipt control explicitly lifts to V27, while the later genuine-usage control validates its raw V26 envelope and directly stages admission on that older shape. Both are already validated historical sources and need the explicit pre-recovery argument. Neither needs fabricated costCutting keys or migration to live46.

The reviewed but unlanded 1367 own-era test addition contains one further historical admission call. Its eventual integration must pass pre-recovery too, as the handback expressly states. It is not a missing change to an already landed file, and its earlier reviewed patch remains preserved. Do not overlook that adaptation when assembling the combined candidate.

The explicit public era parameter is a trusted producer staging contract, not authority for accepting recovery-bearing data through a frozen save reader. Actual live call sites must never select pre-recovery to bypass policy. Preserve this distinction in tests and subsequent API use.

## Required verification and limits

Integrate the actual Save46 schema, null/zero migration, era-specific validation, direct profession proof and Part C accounting before execution. These strict dereferences intentionally depend on that shape. Parent must merge overlapping rivalResearch edits once, retaining active research and completion law.

Measure distinguishing controls for current proposal withdrawal at a real settlement boundary, retirement-extension suppression, no new seats/project starts, positive continuing active research spend, pending adoption/plan completion, Scientist demand, strict live admission and both validated historical staging calls. An absent natural producer premise cannot establish the guard merely by returning unchanged state. Preserve actual pre-entry-week allowances and the no-new-commitment law after entry.

Natural commercial-adoption and research routes may change after recovery; do not label a lost control witness as an accepted re-pin without attribution. Existing broad failures remain separately classified. This review does not establish runtime types, valid-state admission, all new caller semantics, performance or full recovery readiness.

No Node, tests, typecheck, runtime simulation, fixture payload access, source edits, repository/index mutation or nested agents occurred. Only this authorized independent review report was written.
