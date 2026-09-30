# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), Wed Sep 30 14:50 EDT 2026 (20:50 CEST)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ d9e253ad plus the commit that updates this file, pushed: yes (remote verified by `git ls-remote`). The working tree is clean.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`: the top `## CURRENT` block.
  3. `/Users/zacheryspector/studio-scratch/1344-merge/x2.meta` (dry-run progress), then `/Users/zacheryspector/studio-scratch/1344-sweep/g6/handback.md` and `/Users/zacheryspector/studio-scratch/1344-sweep/s10/declarations.md`.
  4. `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-N-save43-pin-sweep-plan.md` (classes S1-S10, process, success criteria).

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: the Save43 pin sweep (1344-C5) and P14 closure 1344-K; relationship slices A and B; the P15 Wave 2 REDs (P15C Wave 2 is unblocked).
- Closed, do not reopen: the 1340-O and 1342-O rulings; U2 (1341-K); P15B Wave 1 (1352-L); P15A.1 and P15A.2 Wave 1; the P15C Wave 1 landing (1353-L; broad gates still pending with the sweep).

## State
- Done this session (all pushed):
  - P15C Wave 1 landed (1353-L): RED r4 c7f3cb76; recorded RED 72 failed / 6 passed of 78; production 321a4378; recorded GREEN 78/78 (d7c417a5). Both fixedSource, every guard exact. Type gates 19/2/2, identical to 1352-L.
  - Save43 sweep authored in full: helpers and g1-g6 DONE (g6 finished by a continuation agent; audit of its first 6 files clean). Handbacks: `/Users/zacheryspector/studio-scratch/1344-sweep/<group>/handback.md`.
  - Sweep merged in `/Users/zacheryspector/studio-scratch/1344-merge/tree` (its own git repo; base 3a606df4): commits helpers 048f62c, g1 eb8d902, g2 558cd49, g3 9310d5a, g4 3c0a5c5, g5 0b738b3, parent f8c48ec (24 `saveApi('validateSaveV42')` callers in 4 files follow the helper's renamed live key, S1), parent becafce (UI section of 1344-M2: 8 live-writer literals in 5 files, S2), g6 a318722. All seven patches disjoint and clean. The four helpers no group owned need no edit (they call swept helpers). Type gates at becafce (before g6): root, UI and Bridge exit 0.
  - Disk 4.5 → about 6.2 GB free (merged or expendable scratch deleted by literal path).
- In flight:
  - **x2, the parent dry run of the full merge at a318722**, detached (own session; survives this Claude session): PID in `/Users/zacheryspector/studio-scratch/1344-merge/x2.pid` (61353), started 14:48 EDT. Stages: three type gates → `x2-tsc.txt`; full core, 433 files (`core-list.txt`: the 1344-M 429-file allowlist plus the P15B/P15C files), `.venv` on PATH → `x2-core.txt`; UI project → `x2-ui.txt`. Progress and exit codes: `/Users/zacheryspector/studio-scratch/1344-merge/x2.meta` (it ends with a line "ui exit N; end"). Expected finish about 17:20 EDT if the Mac stays awake; `caffeinate -is` holds idle sleep, a closed lid on battery still sleeps and pauses it. Check: `cat /Users/zacheryspector/studio-scratch/1344-merge/x2.meta; kill -0 $(cat /Users/zacheryspector/studio-scratch/1344-merge/x2.pid) && echo running`.
  - Nothing else. The g6 and S10 agents finished.
- S10 pre-declarations DONE (not run): `/Users/zacheryspector/studio-scratch/1344-sweep/s10/declarations.md` (parts a-f per row) and five probes in `/Users/zacheryspector/studio-scratch/1344-sweep/s10/probes/` (`.txt`, rename to run). Attributed to shelving: row 4 (family 12, `p13a-core-causal-01`: r01 shelves at week 93, before settlement week 208), row 6 (`p14b5-relationships:372`: r01 shelves `script-0006` at week 208; its replacement repeat take may fall outside the 40-tick guard, and then the row returns under the no-widening rule), row 7 (`p14b1-trust-chooser:683`: an oracle fix, the test's candidate list still includes the screenplay r01 shelves at week 93). Uncertain until a probe finds a shelving: row 1 (seating, seed-b), rows 2-3 (family 12, seed-b and `p13-public-commercial-adoption`; row 2 fails at :530, not :529). Family 12 moves up to seven pins per seed. Not S10: row 5 (`p14b5-relationships:596`): Save43's per-studio field moved the digest; extend its strip list with a guard and keep the pinned value (the 1332-A precedent). Slice A RED r5 edits the same file as rows 5 and 6.
- Claims limits: the sweep edits are authored without test runs by design. x1 (partial, stopped at 29 files, before g6) is superseded by x2; its early files already dropped toward 1338 counts (p14b5-relationships 20→5, relationship read-models 18→6, p14p4p5-opportunities 6→1). Nothing is verified until x2 is attributed.

## Next step
1. Check x2. While it runs, start no other test process and never edit `/Users/zacheryspector/studio-scratch/1344-merge/tree`: the run reads it.
   - If x2's PID is gone and `x2.meta` lacks "end": it died. Check `ps` for orphan vitest workers, then relaunch detached as x3: `cd /Users/zacheryspector/studio-scratch/1344-merge && python3 -c 'import os,sys; os.setsid(); os.execvp("bash", ["bash"]+sys.argv[1:])' /Users/zacheryspector/studio-scratch/1344-merge/run-dry-run.sh x3 </dev/null >/dev/null 2>&1 &` (the script refuses to overwrite a name).
   - If the Mac slept during x2, timeouts in x2 are environment: re-run those files alone before attributing them.
2. When x2 ends, attribute from the repo root (both scripts refuse to overwrite):
   - `python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1321-I-attribution.py /Users/zacheryspector/studio-scratch/1344-merge/x2-core.txt /Users/zacheryspector/studio-scratch/1344-merge/x2-core-failures.json`
   - `python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-I-compare.py /Users/zacheryspector/studio-scratch/1344-merge/x2-core-failures.json docs/engineering/playability-launch-review/evidence/p14b4-20260919/1338-I-failures.json /Users/zacheryspector/studio-scratch/1344-merge/x2-vs1338.json`
   - UI: `python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1317-I-attribution.py /Users/zacheryspector/studio-scratch/1344-merge/x2-ui.txt /Users/zacheryspector/studio-scratch/1344-merge/x2-ui-failures.json`, then `python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-I-compare.py /Users/zacheryspector/studio-scratch/1344-merge/x2-ui-failures.json docs/engineering/playability-launch-review/evidence/p14b4-20260919/1343-I-failures.json /Users/zacheryspector/studio-scratch/1344-merge/x2-ui-vs1343.json` (the 1344-M2 method).
   - Success (1344-N): core failing identities equal 1338's 79 minus the gone exporter row (the seven masked rows restored, the S10 rows attributed); UI equal 1343's 10; no new identity. Expected residue: S8/S9 refusal-message rows the S1 fixes unmasked (1344-N expects about 25), the S10 rows, g6's three open items (`p14b4-cast-class-policy:485` model row, `p14c3-transitions:169,198` guard order, `p14c3-second-episode-writing:144`), g5's Q2 anomaly (`p14c3-queued-writing-proof` 56/129/154), and 1320-X's scratch artifacts (bridge-supervisor "Fake Unity", C17 ENOENT scratch paths).
3. Author the S8/S9 edits from measured messages as new commits in the merge tree (after x2 ends), with classification rows.
4. S10: rule on the open parent decision below (1344-F4); an independent reviewer checks `/Users/zacheryspector/studio-scratch/1344-sweep/s10/declarations.md` before any probe runs; run the probes one at a time after x2; apply only what the verified receipts and the ruling support. Row 5 takes the strip-list fix; row 7 the oracle fix.
5. Stage the cumulative patch: `git -C /Users/zacheryspector/studio-scratch/1344-merge/tree diff 6c54d5e..HEAD > docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-stage/1344-save43-sweep.patch`, plus a merged classification JSON (all groups' rows plus the parent commits) and a handback; check with `git apply --check --cached` under a temporary index. Then review 1344-D4, apply, recorded core and UI gates alone on a quiet machine, attribution vs 1338/1343, §7 (stalled route, C8), closure 1344-K.

## Open decision for the parent (not the Owner)
- Re-pinning S10 rows 1-4 would turn rows that failed at 1338 green, while 1344-N says the 79 retained rows keep their causes and lists "the four S10 rows attributed" among the failing identities. Recommend following 1344-N literally: the sweep attributes these rows (the probes prove the shelving receipts) and leaves them failing; a re-pin that clears a retained row belongs to that row's own repair track, not to the sweep. Record the ruling as 1344-F4 before any re-pin.

## Open decisions for the Owner
- numpy for the three rgba-export tool-contract rows: recommend a scoped `.venv` install beside Pillow, because the rows otherwise stay permanent environment failures (1345-E).
- P16: the nine questions in 1354-Q, open until the Owner answers.

## Blockers and warnings
- The earlier session (fda2743f, PID 95233) may still be open in another terminal. Close it; two sessions writing this worktree collide.
- `~/Downloads/project-studio-p13-owner-direction-inputs-01` is a superseded P13 input kit. It holds only a pointer HANDOFF.md to this file.
- Scratch lives in `/Users/zacheryspector/studio-scratch/`: 1344-sweep (group trees and outputs, s10), 1344-merge (merge tree, dry-run outputs, `run-dry-run.sh`, `core-list.txt`), 1348-x5, 1358-work, save-review.py. Trees link real `docs`, `node_modules`, `art`, `tools` and `tests/fixtures`: use `ln -sfn`, never write under a link, delete with `rm -rf` on literal paths without a trailing slash.
- If an agent returns `401 OAuth access token has been revoked`, the Owner runs `/login`.
- No commits during a recorded run or its postflight. The x2 dry run is not a recorded run: repo commits are safe during it. Hook stamps to the HANDOFF.md AUTO block are harmless.
- The machine has 4 CPUs and 8 GB RAM. One heavy test process at a time; x2 is that process until it ends. The Workflow cap is 2 agents.
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
