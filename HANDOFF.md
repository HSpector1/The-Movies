# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), Wed Sep 30 20:28 CEST 2026 (14:28 EDT)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ d7c417a562d64f7646de86d8e3b53e487b26c8eb plus the commit that updates this file, pushed: yes (remote verified by `git ls-remote`)
- Resume: `claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1`, run from `~/Downloads/project-studio-p13-owner-direction-inputs-01` (the session started there; it works in this repo).
- Required reading, in order:
  1. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`: the top `## CURRENT` block
  2. `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1353-L-p15c1-wave1-landing.md`
  3. `/Users/zacheryspector/studio-scratch/1344-sweep/<group>/handback.md` for helpers and g1-g6

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: Save43 pin sweep and P14 closure 1344-K; relationship slices A and B; the P15 Wave 2 REDs (P15C Wave 2 now unblocked).
- Closed, do not reopen: the 1340-O and 1342-O rulings; U2 (1341-K); P15B Wave 1 (1352-L); P15A.1 and P15A.2 Wave 1; the P15C Wave 1 landing (1353-L; broad gates still pending with the sweep).

## State
- Done this session:
  - P15C Wave 1 landed (1353-L). RED r4 c7f3cb76; recorded RED `1353-p15c1-red-recorded` 72 failed / 6 passed of 78 (91c09aea); production 321a4378; recorded GREEN `1353-p15c1-green-recorded` 78/78 (d7c417a5). Both fixedSource, every guard exact. Type gates 19/2/2, error lines identical to 1352-L. All four landed blobs equal the 1353-X3 dry-run tree.
  - Verified the old session's move of the scratch trees to `/Users/zacheryspector/studio-scratch/`. Deleted the merged `1353-x3` tree and the expendable trees in the old session scratchpad (1353-prod, 1353-x, 1344x, 1344-p2x, c8diag, c8old). Disk 4.5 → 6.35 GB free.
- In flight: one background agent (Sonnet, general-purpose with the test-author rules) continues g6 audit-first in `/Users/zacheryspector/studio-scratch/1344-sweep/g6/`: audit files 1-6 (PROGRESS counts 4 edits for file 6, classification.json has 3 rows), then files 7-23, no test runs, one scratch commit per file. It stops if this session ends; then continue from its last commit and PROGRESS.txt.
- Claims limits: recorded runs and type gates are measured. The broad core and UI gates are not run. Sweep patches are authored without test runs by design; nothing in them is verified until the parent dry run.

## Next step
When g6 returns: read its handback, check its start-sha audit and the file-6 reconciliation. Then read every handback verbatim (helpers, g1-g6), merge the disjoint patch.diff files (all built on 644b9038; tests changed since only by the two new P15C files) in a scratch tree at HEAD, add the 1344-M2 UI sites to 1344-N, and route the deferred rows: helper rows outside the helpers group (e.g. `tests/helpers/p14c3-queued-writing-fixtures.ts`, `tests/helpers/p14b2-fixtures.ts:122,244,259` from g6), g5's three p14b5-relationships rows (declare attribution first), and S8/S9/S10. Then parent dry run, review 1344-D4, apply, recorded core and UI gates alone on a quiet machine, §7 (stalled route, C8), closure 1344-K.

## Open decisions for the Owner
- numpy for the three rgba-export tool-contract rows: recommend a scoped `.venv` install beside Pillow, because the rows otherwise stay permanent environment failures (1345-E).
- P16: the nine questions in 1354-Q, open until the Owner answers.

## Blockers and warnings
- The previous session (fda2743f, PID 95233) is still open and idle in its terminal. Close it; two sessions writing this worktree collide.
- `~/Downloads/project-studio-p13-owner-direction-inputs-01` is a superseded P13 input kit with no work pending. It only hosts this session's transcript.
- Scratch trees live in `/Users/zacheryspector/studio-scratch/` (1344-sweep, 1348-x5, 1358-work, save-review.py). They link real `docs`, `node_modules`, `art`, `tools` and `tests/fixtures`. Use `ln -sfn`, never write under a link, and delete with `rm -rf` on literal paths without a trailing slash.
- If an agent returns `401 OAuth access token has been revoked`, the Owner runs `/login`.
- No commits during a recorded run or its postflight. Hook stamps to the HANDOFF.md AUTO block are harmless: HANDOFF.md is outside the guarded source paths.
- The machine has 4 CPUs and 8 GB RAM. Run recorded suites alone. The Workflow cap is 2 agents.
- Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-09-30 14:20 EDT by **claude** on SessionEnd (session 6cee540f-aa45-4020-970d-2ba0f7a06b7a)
- Branch: `wip/headless-program-20260916-ts` @ `c7f3cb76c2089cd862c36e1c6258e5687dd0db08`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 4
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1353-p15c1-red-recorded-preflight.json`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1353-p15c1-red-recorded.json`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1353-p15c1-red-recorded.patch`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1353-p15c1-red-recorded.txt`
- Last commits:
  - c7f3cb76 test(p15c): Wave 1 RED r4 — campaign-legacy/v1 and Wave R retention, 78 leaves (1353-C4; reviews 1353-D, 1353-D2; dry run 1353-X3)
  - 556c69ac docs(handoff): scratch trees moved to ~/studio-scratch; sweep g5 done, g6 partial on 401; resume points
  - 01f07d97 docs(handoff): repo-root paths; absolute scratch path; restart-loss blocker
  - 1056ec85 docs(handoff): 08:12 state — sweep 5 of 7 groups authored; root HANDOFF.md for resume
  - 8d729f58 docs(handoff): CURRENT block — UI Save43 attributed (1344-M2), P15C dry run clean (1353-X3), sweep paused; resume points
<!-- AUTO:END -->
