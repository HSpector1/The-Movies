# Save45 sweep — final independent measured review

**Verdict: PROCEED with the reviewed sweep in the ordered Save45 landing.** No unresolved sweep defect or unexpected Save45 failure remains in the measured candidate. This approves the sweep under 1361-N Units step 5; it does not declare Save45 landed or replace the required recorded landing gates. The disk precondition is presently unmet and must be satisfied before the recorded workflow.

Reviewer: Codex, acting as the independent reviewer in place of the historical Sonnet role. Review completed on 2026-10-03 after x3 ended at 16:55:24 CDT. No tests, Node/tsc commands, heavy jobs, agents, fixture access or Owner-save access were used by this reviewer. This report is the only write in this final review.

## Candidate and review continuity

- Candidate: `ee289de67e453ce269c98d840a48799265c62993`, from repository archive `8719cde18f7398b8baacab870f1105a0720db6e1`, at `/Users/zacheryspector/studio-scratch/1361-sweep/x3/tree`. Independently checked HEAD and clean porcelain status after the run; [x.meta](x3/x.meta) also records clean start and finish, Node v20.20.2, and the exact patch inputs.
- Inputs: production through `p15c-c-r1`, sibling r2, hygiene comment, H/G1/G4a/G4b r2 and G2/G3/G5 r1. All seven unit patch hashes independently match both scratch and staged files against [final-candidate-sha256.txt](units/final-candidate-sha256.txt). All 417 final unit-patch hunks' resulting lines and context match the actual x3 candidate.
- The [58-row static sample](review-x2-static.md) covers every unit and S1–S10/T, including live versus historical envelopes, assertion strength, sentinel changes, historical chains, shape guards, literal expected roots, titles and the preserved digest. The [r2 delta review](review-r2-static.md) adds the 17 exact S9 replacements across 11 files and records resolution of all three comment findings.
- The [guard-message review](review-guard-messages.md) attributes all 343 observations, independently matched to the original diagnostic log. Its four required S8 pins were subsequently reviewed in source: the three C3 cases use optional `firstGuard`, and the writer future-announcement case uses optional `saveRefusal`. Each conditional retains exactly one assertion, the unaffected bare cases, positive controls, live-caller refusals and immutability checks. The four exact regexes match the observed messages, and x3 now confirms them.
- No diagnostic observer was added by the reviewed landing patches. The sweep changes no production file, fixture payload, tsconfig, generated artifact or P15 RED assertion. The separately authorized hygiene change remains a comment-only input.

## Independently verified measurement

Read [1361-X7](../../1361-X7-sweep-x3-confirmation.md), the preserved x3 metadata/logs and all attribution products. Independently recomputed the identity/message comparisons below rather than relying only on summary counts. The original core/UI log SHA-256 values match their attribution metadata; the preserved core/UI/d16 gzip contents are byte-identical to their original scratch logs.

| Check | Verified result | Interpretation |
|---|---|---|
| Root, UI and Bridge TypeScript gates | All three exit 0 | Required type errors cleared. |
| Both Bridge generator checks | Both exit 0 | No schema/generated-output sweep required. |
| Core | 448 files; 137 failed, 5,114 passed, 3 skipped, 11 todo; 5,265 total | The approved residual set, not an all-green claim. |
| Core against 1358-I | SAME 78, CHANGED 7, NEW 52, GONE 0 | All 85 baseline identities retained. |
| Declared P15A.1 leaves | Exactly 45 identities and complete primary messages match the declared TSV, without normalization | 40 integration, four atomicity, one phases; expected b-r2 REDs preserved. |
| Other NEW core failures | Seven `bridge-supervisor` rows only | Three Fake Unity “started”, three “health”, one “helper” environment failures. No new sweep row. |
| x2→x3 | Exactly 18 removed, zero added, zero changed primary messages after only x2/x3 absolute-tree-prefix replacement | Precisely the deferred S9 fallout disappears. |
| UI | 204 files; 2,692 passed, five skipped; zero failures and zero unhandled errors | NEW 0 against 1358-I2; the same three historical RGBA/PNG pipeline failures are GONE under the already adopted environment correction. |
| d16 | 12 failed, 164 passed; 176 total | Independently compared all 12 identities and full failure-message arrays: exact equality after replacing only each candidate's absolute tree prefix. |

The seven changed baseline core messages are fully accounted for: C20 changes the live-version digit from 44 to 45; six r3n1 rows retain ENOENT with only the scratch-tree path different. Those six are part of the baseline 85 and are not counted again among the seven NEW environment rows. No retained identity disappeared, including R8.

Evidence: [core comparison](x3/attr/x3-core-vs1358I.json), [declared-45 comparison](x3/attr/x3-declared45.json), [x2→x3 comparison](x3/attr/x3-vsx2.json), [UI comparison](x3/attr/x3-ui-vs1358I.json), [d16 comparison](x3/attr/x3-d16-vsbase.json), [type log](x3/x-tsc.txt), [generator log](x3/x-generate.txt).

## Deferred assertions and production-stop checks

The previously provisional 17 S9 pins are now confirmed, including later calls and loop variants masked by x2's first failures. The unchanged surrounding premises and assertions still run. The relevant passing suites include writer continuation 64/64, scientist retirement 15/15, save-v36 14/14, cohort transition 9/9, dual extensions 12/12, off-menu extensions 8/8, profession history 15/15, transitions 35/35, opportunities 10/10 and save-v41 17/17. Directing-promises retains only D07/D18; its revised leaves pass. Save-v38 retains only C20; its revised mutation leaves pass. The earlier two S9 pins in save-v27 also pass with that suite's 8/8 result.

The named production-stop surfaces pass without weakening: `tests/p13a-causal-core.test.ts` is 8/8 and `tests/contracts/v14-byte-parity.contract.test.ts` is 6/6. The measured run reveals no new refusal of lawful ticked Power Ranking saves at those surfaces. The sibling test is 5/5. These are bounded measured claims, not a claim that every possible live state has been exercised.

The guarded relationship digest remains `9702aa6869cf80f82d5133f68137427a0ed44c07ce987e8fe2be66bbb60f3d78`; the literal was not repinned. Its family-1 assertion is not among the three retained relationship failures. Root stripping remains behind `p15Rows` and allocator checks except for the explicit F8 reader-only Scientist exception and the separately ruled, individually checked week-93 comparison. Literal expected roots remain independent of production's initializer; historical V44 readers/stamps remain historical.

Each unit's deferred/handback completion addendum appropriately supersedes author-time pending text without deleting provenance. The addenda distinguish reached assertions from retained premise failures and separate this approval from recorded landing gates. No additional blocker was found in those status updates or 1361-X7's claims. Comments saying the follow-up “must confirm” describe the author-time requirement; this measured review supplies that confirmation without changing the tested candidate.

## Coverage limits retained in the approval

1. Fifteen existing P14B.1 terminal-reference leaves still stop in their standing shared-take premise before the mutants: one positive round-trip, six receipt variants and eight evidence variants. Their mutant guards are not claimed as measured or fixed by this sweep.
2. Twenty-six frozen workflow-carrier observations first reach existing V14 studio-history refusal. They do not isolate workflow-binding/blocker guards. No observed loose S9 assertion was newly masked by P15; the governed decision to keep those existing patterns therefore stands.
3. The four new S8 pins explicitly document earlier guards: remaining-row continuity for two C3 removals, actor/cause eligibility for Scientist `declinedAll`, and market-case retirement coherence for the writer's future announcement. They do not claim isolated proof of the masked later predicate.
4. Historical own-era coverage limits remain disclosed. There is no used-extension own-era input; the termination movement-only leaf stops in reconciliation, while the staged same-leaf V41 assertion covers the receipt guard. Commissioned and finishing writer controls cover different predicates. None of those limitations was erased to obtain this verdict.
5. A passing retained regex proves its pattern, not a complete exact message. Full messages were observed where needed for bare/loose first-guard attribution, and all newly repinned cases are exact. The guard diagnostic observes writer full-save controls, not the separate live-entrypoint messages.

These are existing or expressly ruled limits, not unresolved Save45 sweep defects. This review does not authorize changing retained failures, fixtures, or production to conceal them.

## Landing boundary

The measured sweep meets 1361-N's dry-run success line, including the independent sample and follow-up review. **PROCEED** applies to the exact hashed patches and candidate reviewed here.

Save45 has not landed. The ordered production/sibling/hygiene/sweep commits, landing checks, push, four recorded runs and recorded broad gates under 1361-L/1361-M3 remain required; x3 is not a substitute for them. Any subsequent code or assertion change needs its corresponding review and measurement.

Disk is an operational blocker to the recorded workflow, not a rejected sweep: this review's `df -k /` observed 4,056,096 KiB available (about 3.87 GiB), below the required 5 GiB. 1361-X7's nearby reading of 4,059,864 KiB has the same implication. Satisfy that precondition, preserve the single-heavy-lane and recorder index/cleanliness rules, then continue the authorized ordered landing. No additional Owner decision is requested by this review.
