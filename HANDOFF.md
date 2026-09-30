# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), Wed Sep 30 08:12 CEST 2026

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ 8d729f58cd987f241329d2acc185d20d7108c349 plus the commit that adds this file, pushed: yes (remote verified by `git ls-remote`)
- Resume: `claude --resume fda2743f-a621-4100-9f06-e0c38e36295b` from the repo root.
- Required reading, in order:
  1. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`: the top `## CURRENT` block
  2. The newest K record in `docs/engineering/playability-launch-review/06-FABLE-ADOPTION-AND-FRESH-SESSION-HANDOFF.md`: 1341-K (`evidence/p14b4-20260919/1341-K-parent-u2-closure.json`)

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: Save43 pin sweep and P14 closure 1344-K; P15C Wave 1 landing; relationship slices A and B; the P15 Wave 2 REDs.
- Closed, do not reopen: the 1340-O and 1342-O rulings (rival shelving before live shared-market pressure); U2 (1341-K); P15B Wave 1 (1352-L); P15A.1 and P15A.2 Wave 1.

## State
- Done this session: see the CURRENT block. Latest: 1344-M2 (UI Save43 attribution), 1353-X3 (P15C RED 72/72, GREEN 78/78), 1353-J KEEP.
- In flight: Workflow run `wf_93dac5b7-da4` (Save43 sweep authoring). g5 and g6 are writing in scratch `1344-sweep/g5` and `1344-sweep/g6`, and the other five groups are done. It dies when the laptop sleeps. Resume paths are in the CURRENT block.
- Claims limits: sweep patches are authored without test runs (by design); nothing is verified until the parent dry run. The UI deep-route intermittent is unattributed.

## Next step
Land P15C Wave 1:
1. `git apply --index evidence/p14b4-20260919/1353-stage/1353-p15c-red-r4.patch`, commit, push.
2. Recorded RED over `tests/p15c1-campaign-legacy.test.ts` and `tests/p15c-wave-r-retention.test.ts`, with the bounded runner (`run-bounded-source-guards.py pre` / `run-bounded-source-c2.mjs` / `post`, lowercase run name).
3. Apply `1353-p15c1-production.patch`, commit, push.
4. Recorded GREEN; expect 78/78.

Then collect the g5/g6 handbacks and merge the sweep.

## Open decisions for the Owner
- numpy for the three rgba-export tool-contract rows: recommend a scoped `.venv` install beside Pillow, because the rows otherwise stay permanent environment failures (1345-E).
- P16: the nine questions in 1354-Q, open until the Owner answers.

## Blockers and warnings
- No commits during a recorded run or its postflight. None is active at this writing.
- Disk is at 4.5 GB free, under the 5 GB floor. Delete merged scratch trees by literal path before any recorded run.
- The machine has 4 CPUs and 8 GB RAM. Run recorded suites alone. The Workflow cap is 2 agents.
- Scratch trees link real `docs`, `node_modules`, `art`, `tools` and `tests/fixtures`. Use `ln -sfn`, and never write under a link.
- Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
<!-- AUTO:END -->
