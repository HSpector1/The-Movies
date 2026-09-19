# CODEX continuation — Project Studio

## Current engineering checkpoint — 2026-09-19

**P14B.1 T4 CLOSED — LOGIC VERIFIED · UNITY NOT VERIFIED.**
Production source `ee91913e41b9baa30bcda8eef8c8195da7bfd1cc`; final test-correction
source `a93bf7776a41df3702c78ae5225a2e7c303ec9da`. The recovered `d19c45b`
chain and T3 `e78dbc0` are preserved. Branch `wip/headless-program-20260916-ts`,
worktree `/Users/zacheryspector/The-Movies-headless-program`. Native coordinator
owns implementation; no overlapping writer, reset, recreation or Claude invocation.

Qualified closeout: `evidence/p14b1-20260919-t4-final/16-attribution.md`.
The full fixed-source run completed 11:22:39Z–12:51:55Z: core **3253 passed /
29 failed / 7 todo**; bridge **717 passed / 12 failed / 2 todo**. Exact identifier
AND diagnostic comparisons attribute 22 core and all 12 bridge failures to the
historical baseline. Seven new core test-compatibility failures and one test-only
typing error were corrected WITHOUT changing production, validators or fixtures.
Fresh 13-file verification: **170 passed / three unchanged todos**; root/UI and
bridge typechecks and both contract checks pass. Independent reviews KEEP.
This is NOT an all-green full-suite rerun on the later test commit.

**P14B.2 T1 IN PROGRESS**, following published/remote-verified T4 closeout
`e37cd2330be8c9129b0193a2bf8e84258e851307`. Test-author owns tests and the sole
heavy runtime slot originally; parent now owns serialized verification. Ownership/next actions:
`evidence/p14b2-20260919/00-start.md`. Independent lawful fixture work exposed
inherited **B2-F1**: completed setup loses its live stage at
wrap correctly, but save validation refuses the retained history. Dedicated
independent RED (three positive failures / ten negative passes) and genuine45
checkpoint are preserved. F1 CLOSED at `af455ef838b8c2227d784ebdc8bafb89e7a6835b`:
17 files /179 passed /three unchanged todos, root/UI and bridge typechecks PASS,
bounded review KEEP. Exact fixed-source records and limits: `evidence/p14b2-20260919/08-f1-closeout.md`.
Checkpoint forward RED has the two intended failures at projection45 (`09`).
Main B2 test draft is independently authored outside the checkout; install next
for absent-module RED. No active runtime. Diagnosis: `evidence/p14b2-20260919/03-setup-wrap-review.md`.
After this prerequisite, resume B2 bridge test 11 RED and read models per
`plans/P14-HEADLESS-PLAN.md`. Preparation:
`evidence/p14b1-20260919-t4/13-b2-test-preparation.md`. The literal contract-ID
fixture issue mentioned there is already fixed in T4. Preserve real retention
`ranToEnd` history; the actual poaching winner has now been proved in probe `02g`.
Then projection 46 read models, D3 causal test, bounded review and qualified full
verification. Save V29 stays; no outgoing SAVE-version fixture mint is required
(a genuine projection-45 runtime checkpoint is frozen). Continue
remaining P14 → P15 → P16 → sufficiently specified P17/P18 without routine prompts.
B3 P1 command-route preparation is `14-b3-preparation.md`; not part of B2.

Save V29 / projection 45 currently. The B1 quote is preview-only; command attachment
remains a B3 integration obligation. Unity/rendering/native/Owner acceptance stays
deferred in `UNITY-INTEGRATION-BACKLOG.md`. Max two native specialists, one production
writer; test-author independent, contract-auditor read-only. Parent coordinates the
serialized heavy-test slot, currently held by parent. T4 has no remaining
runtime. Existing usage carries
forward; the full runner took ~89 minutes versus the older ~75-minute forecast.

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
