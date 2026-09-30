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
- In flight (started 20:28-20:40 CEST; all stop if this session ends):
  - g6 continuation agent (Sonnet) in `/Users/zacheryspector/studio-scratch/1344-sweep/g6/`: audit files 1-6, then files 7-23, no test runs. On death: continue from its last scratch commit and PROGRESS.txt.
  - S10 pre-declaration agent (Opus), read-only, output `/Users/zacheryspector/studio-scratch/1344-sweep/s10/declarations.md` (+ `probes/`, not executed): the seven S10/S10-like rows (1344-N's four plus three undeclared families in p14b5-relationships and p14b1-trust-chooser), each with the one movable assertion, attribution traced to shelving, receipt predicates, and a probe.
  - Core dry run x1 in the merge tree `/Users/zacheryspector/studio-scratch/1344-merge/tree` at becafce (base 3a606df4 + helpers, g1-g5, parent commits f8c48ec and becafce): 433 files (the 1344-M 429-file allowlist plus the P15B/P15C files), `.venv` on PATH, output `/Users/zacheryspector/studio-scratch/1344-merge/x1-core.txt`, start/exit in `x1-core.meta`. About 85 min on a quiet machine. Not a recorded run. Type gates on becafce: root, UI and Bridge all exit 0 (`/Users/zacheryspector/studio-scratch/1344-merge/tsc-pre-g6.txt`).
- Claims limits: recorded runs and type gates are measured. The broad core and UI gates are not run. Sweep patches are authored without test runs by design; nothing in them is verified until the parent dry run.

## Next step
1. When x1 finishes: attribute with `python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1321-I-attribution.py /Users/zacheryspector/studio-scratch/1344-merge/x1-core.txt /Users/zacheryspector/studio-scratch/1344-merge/x1-core-failures.json`, then `1344-I-compare.py /Users/zacheryspector/studio-scratch/1344-merge/x1-core-failures.json <E>/1338-I-failures.json /Users/zacheryspector/studio-scratch/1344-merge/x1-vs1338.json` (both from the repo root; they refuse to overwrite). Expected residue: g6's 23 files still fail on Save43 pins, S8/S9 refusal-message rows unmasked by the S1 fixes (1344-N expects about 25), the S10 rows, and the scratch artifacts 1320-X names (bridge-supervisor "Fake Unity", C17 ENOENT scratch paths).
2. When g6 returns: read its handback, then `git -C /Users/zacheryspector/studio-scratch/1344-merge/tree apply --index /Users/zacheryspector/studio-scratch/1344-sweep/g6/patch.diff` and commit; re-run the type gates and g6's 23 files.
3. Author S8/S9 edits from measured messages; hand S10 declarations to an independent reviewer before any S10 probe or re-pin runs.
4. Stage the cumulative `1344-stage/1344-save43-sweep.patch` (base..HEAD of the merge tree), UI dry run (`vitest run --project ui`, alone), review 1344-D4, apply, recorded core and UI gates alone on a quiet machine, attribution vs 1338/1343, §7 (stalled route, C8), closure 1344-K.
Merge facts so far: the six finished patches are disjoint and apply cleanly at HEAD. Helpers renamed the `saveApi` live key to `validateSaveV43`; the parent commit f8c48ec renames its 24 callers in 4 files. The four "unowned" helpers need no edit (they call swept helpers). The UI section (1344-M2) is 8 sites in 5 files, commit becafce; the StudioCalendar rows ride the helper.

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
