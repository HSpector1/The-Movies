# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), Wed Sep 30 20:20 CEST 2026

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ 01f07d97604e1b90f69f1fa37a5b0d18fa4ac7fd plus the commit that updates this file, pushed: yes (remote verified by `git ls-remote`)
- Resume: `claude --resume fda2743f-a621-4100-9f06-e0c38e36295b` from the repo root.
- Required reading, in order:
  1. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`: the top `## CURRENT` block
  2. The newest K record in `docs/engineering/playability-launch-review/06-FABLE-ADOPTION-AND-FRESH-SESSION-HANDOFF.md`: 1341-K (`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1341-K-parent-u2-closure.json`)

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: Save43 pin sweep and P14 closure 1344-K; P15C Wave 1 landing; relationship slices A and B; the P15 Wave 2 REDs.
- Closed, do not reopen: the 1340-O and 1342-O rulings (rival shelving before live shared-market pressure); U2 (1341-K); P15B Wave 1 (1352-L); P15A.1 and P15A.2 Wave 1.

## State
- Done this session: see the CURRENT block. Latest: 1344-M2 (UI Save43 attribution), 1353-X3 (P15C RED 72/72, GREEN 78/78), 1353-J KEEP.
- In flight: nothing. Workflow run `wf_93dac5b7-da4` (Save43 sweep authoring) ended. helpers and g1-g5 are DONE with handback.md and patch.diff; g5 wrote all its deliverables, then its return failed on `401 OAuth access token has been revoked`. g6 died on the same 401 after 6 of 23 files (tree clean at a5c1606, diff base..HEAD sha256 0d9aa9a7…). Per group: `/Users/zacheryspector/studio-scratch/1344-sweep/<group>/` (tree, PROGRESS.txt, classification.json, deferred.json, patch.diff, handback.md).
- Claims limits: sweep patches are authored without test runs (by design); nothing is verified until the parent dry run. The UI deep-route intermittent is unattributed.

## Next step
Land P15C Wave 1:
1. `git apply --index docs/engineering/playability-launch-review/evidence/p14b4-20260919/1353-stage/1353-p15c-red-r4.patch`, commit, push.
2. Recorded RED over `tests/p15c1-campaign-legacy.test.ts` and `tests/p15c-wave-r-retention.test.ts`, with the bounded runner (`docs/engineering/playability-launch-review/evidence/p14b4-20260919/run-bounded-source-guards.py pre` / `docs/engineering/playability-launch-review/evidence/p14b4-20260919/run-bounded-source-c2.mjs` / `post`, lowercase run name).
3. Apply `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1353-stage/1353-p15c1-production.patch`, commit, push.
4. Recorded GREEN; expect 78/78.

Then finish g6: an audit-first continuation from `/Users/zacheryspector/studio-scratch/1344-sweep/g6/tree` (files 7-23 of its PROGRESS.txt, args in `/Users/zacheryspector/studio-scratch/1344-sweep/sweep-groups-args.json`), never a restart. Then read every handback, merge the patches, and route the deferred helper rows. g1, g2 and g5 found helpers outside the helpers group, e.g. `tests/helpers/p14c3-queued-writing-fixtures.ts`.

## Open decisions for the Owner
- numpy for the three rgba-export tool-contract rows: recommend a scoped `.venv` install beside Pillow, because the rows otherwise stay permanent environment failures (1345-E).
- P16: the nine questions in 1354-Q, open until the Owner answers.

## Blockers and warnings
- Scratch trees now live in `/Users/zacheryspector/studio-scratch/` (1344-sweep, 1353-x3, 1348-x5, 1358-work, plus save-review.py), moved from /private/tmp at 20:16 on the same disk, with all links checked. Other trees left in the session scratchpad are expendable.
- Subagents failed with `401 OAuth access token has been revoked` while the laptop was off. If an agent returns 401, the Owner runs `/login`.
- No commits during a recorded run or its postflight. None is active at this writing.
- Disk is at 4.5 GB free, under the 5 GB floor. Delete merged scratch trees by literal path before any recorded run.
- The machine has 4 CPUs and 8 GB RAM. Run recorded suites alone. The Workflow cap is 2 agents.
- Scratch trees link real `docs`, `node_modules`, `art`, `tools` and `tests/fixtures`. Use `ln -sfn`, and never write under a link.
- Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
<!-- AUTO:END -->
