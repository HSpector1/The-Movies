# CODEX continuation — Project Studio

## Current engineering checkpoint — 2026-09-19

This section supersedes the transfer-only status below; the older recovery record
is preserved as provenance. Native Codex accepted write ownership from the clean,
remotely verified `d19c45b2d873653b4cd4488608e4e411f15a2c34` recovery point on
`wip/headless-program-20260916-ts`. No reset, recreation, Claude invocation or
overlapping writer. Recovered T3 `e78dbc0` is retained, not rebuilt.

**P14B.1 T4 IN PROGRESS / UNITY NOT VERIFIED.** Independent test-author REDs
exposed lower-window, state-sensitive feasibility digest, retained freeze receipt
and exact V29 reference defects; sim-core corrected their shared owners. A second
review identified a terminal promise incorrectly accepting a later real contract
for the same parties; independent RED `10-later-contract-red` reproduced that edge
before the final chronology guards. All evidence is under
`evidence/p14b1-20260919-t4/`. The initial corrected candidate passed 80 tests with
the three existing todos unchanged; the final candidate (`11`) passed **81 tests /
three unchanged todos**, and the bounded final review is KEEP (`12`). Full T4 is
still pending.

Next: commit/push corrected source and evidence → fixed-source serialized T4
runner (both typechecks, both bridge contract
checks, full core then full bridge) → individual failure attribution and qualified
closeout → P14B.2 per `plans/P14-HEADLESS-PLAN.md`, then remaining P14/P15/P16 and
sufficiently specified P17/P18. Do not treat a passing targeted subset as T4.
Runner preserved at `evidence/p14b1-20260919-t4/run-fixed-source.mjs`; invoke with
`node <runner-path> p14b1-20260919-t4-final`. Use a fresh evidence directory and
keep source/tests frozen throughout. Heavy tests are serialized on this Mac.

Save V29 / projection 45 remain unchanged. The bridge promise quote is preview
only; promise attachment at the consumer submit command remains an explicit
integration gap. Unity/native rendering/UI verification and Owner acceptance are
deferred in `UNITY-INTEGRATION-BACKLOG.md`. Max two native specialists, one
production writer; reuse the Fable role bodies with no Claude invocation.
The Owner reaffirmed broad project authorization and no routine approval requests.

## Historical recovered handoff (unchanged below)

## Branch and worktree
- Repository: HSpector1/The-Movies
- Worktree: /Users/zacheryspector/The-Movies-headless-program
- Branch: wip/headless-program-20260916-ts
- HEAD at publication: c5c81c1
- Remote: origin -> https://github.com/HSpector1/The-Movies.git

## What is finished and preserved
- The recovered headless worktree was preserved without reset or re-clone.
- The live branch retains the recovered P14B.1 bridge/projection history, including the bridge handback and the later evidence commit chain.
- The current preserved head is:
  - c5c81c1 — evidence(p14b1): 15 — bridge projection 45 GREEN (raw checks)
  - e78dbc0 — p14b1 T3: bridge projection 45 — the thin Core promise surface
  - c10c4bd — records(p14b1): T2d DONE …
- The branch remains the authoritative recovered state for the logic-first program.

## What remains
- This transfer-only handoff does not claim T4 completion or Owner acceptance.
- The still-open work is the remaining logic-first implementation and verification sequence beyond the recovered bridge handback.
- Unity/native render work remains deferred and is tracked in the backlog, not claimed as verified here.
- The preserved P14B.1 evidence is a strong handoff point, not a completion certificate.

## Evidence and status
- Last known targeted verification command from the recovered work:
  - npx vitest run tests/p14b1-first-take.test.ts tests/p14b1-promises.test.ts tests/p14b1-save-v29.test.ts tests/p14b1-leak.test.ts tests/p14b1-trust-chooser.test.ts tests/bridge-p14b1-promises.test.ts --reporter=basic
- Result recorded in the recovered session: 6 files passed, 46 tests passed, 3 todo.
- This is evidence for the recovered bridge handback and thin promise surface, but it does not establish T4 completion.

## Exact next task
- Continue from the preserved branch and commit chain above.
- The next engineering task is the remaining P14B.1 logic work after the recovered bridge handback, with the actual T4 validation and attribution done in a fresh implementation pass.
- The path to resume is the current repo on wip/headless-program-20260916-ts at the preserved HEAD above.

## Ownership and handoff note
- This file is the publication-safe handoff for the recovery state.
- Write ownership is yielded after safe publication; no code correction or test-run expansion was performed under this transfer-only phase.
- The authoritative records remain in the existing repo history and the project progress files under docs/engineering/playability-launch-review/.
