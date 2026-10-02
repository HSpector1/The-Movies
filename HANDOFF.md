# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-01 21:41 CDT (the Mac runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ 469a9547 plus the commit that adds 1344-M3 and updates this file, pushed: yes.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. The heavy-lane logs: `S/1344-s7/out/s7.meta` (§7), `S/post-s7-queue/queue.meta` (type gates at HEAD, 1359-X2, 1356-X3), `S/1358-x/run.log.meta` (1348-X6 and 1358-X).
  3. `E/1344-M3-save43-sweep-recorded-gates.md`: the recorded gates, with the success line held.
  4. `E/1344-stage/s7/RUNBOOK.md` (step 11 and the report template) and `E/1344-F5-parent-rulings-row6-and-s7-definitions.md` Part B (the §7 definitions).
  5. `E/1344-F6-parent-ruling-declared-exceptions.md` and `E/1344-N-save43-pin-sweep-plan.md` (success line :80-82).
  6. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`, top `## CURRENT` block (refreshed at c8c2872b; this file is newer).

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope:
  - §7 and the P14 closure 1344-K;
  - the P15 Wave 1 closures (1346-L with 1351-L, 1352-L, 1353-L) on the same gates;
  - relationship slices A and B;
  - the P15 Wave 2 reference runs and confirmations;
  - then the P15 queue.
- Closed, do not reopen:
  - the 1340-O and 1342-O rulings;
  - U2 (1341-K);
  - P15B Wave 1 production (1352-L) and P15A.1, P15A.2 and P15C Wave 1 production;
  - the three P15 Wave 2 RED reviews (1356-D2, 1355-D3 and 1359-D3);
  - the Save43 sweep's recorded gates (1344-M3; review J3 pending).

## State
- Done this session (all in E; pushed with this file):
  - **The recorded gates at 469a9547** (the sweep cec3902c plus docs), each `fixedSource` true and `allGuardsExact` true:
    - core: 85 failed of 4,959 (433 files);
    - UI: 3 failed of 2,697.
  - **Attribution:**
    - core against 1338 (I3): SAME 73, CHANGED 5 (four S10 rows, C20), NEW 7 (exactly the F6 exceptions), GONE 1 (the exporter);
    - UI against 1343 (I4): CHANGED 3 (numpy), GONE 7 (Pillow), NEW 0.
  - **The success line holds:** `E/1344-M3-check.py` passes all ten checks.
  - **Node:** the gates ran v22.23.2 against baselines on v20.20.2. No row moved.
  - **Published but unmeasured at their final commits:**
    - P15 r4s: 1359-C4 (RED r4, a lawful route L by migration-origin founding, plus reference r3) and 1356-C4 (self-timed harness ceiling);
    - slice B r2 and r3 (1358-C2, 1358-C3) under the parent's rulings 1358-F2. The producer now sits at `E/1358-P-save43-producer.ts`.
- In flight (as of 21:41 CDT, 2026-10-01). Each job holds `S/HEAVY-LANE-LOCK` and runs alone, chained in this order:
  1. **§7:** `S/1344-s7/run-s7.sh 469a9547…`.
     - Process: PID 27580, which `chain-after-gates.sh` replaced via exec.
     - Started 21:39:19 on Node v20.20.2. Trees are built, and the C8 re-run (step 2) is running.
     - Ends with an `end` line or a `STOP:` line in `s7.meta`.
     - No record times a 520-week chain, and the decide-diag is the longest run.
  2. **Queue 1:** `S/post-s7-queue/run-queue.sh`, PID 29222. It runs the type gates at HEAD (to `typegates-HEAD.txt`), then `S/1359-x2/run-1359-X2.sh`, then `S/1356-x3/run-1356-X3.sh`. Log: `queue.meta`.
  3. **Then** `S/heavy-queue/lane-run.sh`, PID 35832, running `S/1358-x/run-1348-X6-1358-X.sh`:
     - slice A r5 and step 3 at the post-sweep HEAD;
     - slice B r3 over them;
     - the 1358-P producer dry run in a tree with a real `tests/fixtures`.
- Claims limits:
  - §7, the type gates at HEAD, the P15 r4s and slice B r3 are unmeasured.
  - The type gates were clean at x3, whose tree equals the applied one.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits during a recorded run; free disk ≥ 5 GB before a recorded run; recorded runs pin Node v20.20.2.

1. **1344-J3.** Save the independent review of M3 verbatim as `E/1344-J3-save43-sweep-gates-attribution-review.md` and act on any blocking defect. The brief is in this session's scratchpad (`1344-J3-brief.md`); a new session writes one from M3's checklist.
2. **§7 report (1344-V).** When `s7.meta` says `end`:
   - read the outputs per RUNBOOK step 11;
   - write 1344-V from the RUNBOOK's template, with the F5 Part B definitions, and add 1355-X2's seed `-01` stall as one flagged observation;
   - copy the runner scripts and the outputs into `E/1344-stage/s7/`, using `git add -f` for `out/` and logs. Large `final-state.json` files stay in scratch, cited by sha256.
   - On a `STOP:` line: read the log, fix the kit, and re-run under new names as the RUNBOOK says.
3. **Queue 1 results.**
   - `typegates-HEAD.txt` goes into 1344-K.
   - 1359-X2: record it, then run the confirmation review 1359-D4, which also sets the route and extension budgets.
   - 1356-X3: record it, then run the confirmation review 1356-D4.
4. **Closures.**
   - 1344-K on the 1319-K pattern, closing P14:
     - the application commit cec3902c, with appliedEqualsDryRunTree true;
     - M3 and J3; the type gates at HEAD; the §7 result;
     - the seven F6 exceptions;
     - open items: X12's V39 family, 1356-X F-2 and the 1344-J follow-ups.
   - The Wave 1 closures on the same gates: 1346-L with 1351-L, 1352-L and 1353-L.
   - Then add the K entry atop 06, refresh the CURRENT blocks, and update this file.
5. **Slices.**
   - Slice A, after 1348-X6: recorded RED on r5, then apply steps 1-3 as incremental commits, then recorded GREEN.
   - Slice B, after 1358-X: r4 per 1358-F2 §7 (budgets from the measurement, the `rosterWorld()` budget, the third-party leaf guard), then review 1358-D, then the recorded mint 1358-P once slice A has landed, then production.
6. **Queue after that.** P15B probe 1357-P (1357-X), probes G1 and G-P, the P15 recorded REDs, and the writers in order (slice B, P15A.2 slice 2a, then the P15A.1, P15B and P15C Wave 2 productions).

Agents: the user allows as many subagents as help (2026-10-01). Agents author and review; only the parent runs broad or heavy tests.

## Open decisions for the Owner
- **numpy** for the three rgba-export tool-contract rows. Recommend a scoped `.venv` install beside Pillow, because the rows otherwise stay permanent environment failures (1345-E).
- **P16:** the nine questions in 1354-Q, open until the Owner answers.
- **The seven declared exceptions** that 1344-K lists (1344-F6: row 6 ×3, promise rows ×4). Recommend accepting them as they stand: both probes found no lawful re-witness in the fixtures.
- **1356-X F-2,** as 1356-F5 restates it. A public founding after week 0 reaches no valid save once the player signs the roster, or ticks with the draft open after rivals lock methods. Recommend checking reachability through the bridge first, then one charter for both rules if the path is reachable.
- **X12's V39-masking family.** Five downgrade leaves pass without reaching the guard they name, and have since before Save43. Recommend a small RED that gives each an input whose first refusal is its own guard.

## Blockers and warnings
- **Node.** Recorded runs pin v20.20.2: put `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin` first on PATH. The session's nvm default is v22.23.2, and the baselines 1338, 1343 and 1344-M ran v20.20.2.
- **Heavy lane.** Take `S/HEAVY-LANE-LOCK` first, then wait out any running vitest or tsc. Match on the `node` command name, so shell waiters whose text says "vitest" do not count. `S/heavy-queue/lane-run.sh` does this.
- **The superseded kit folder.** `~/Downloads/project-studio-p13-owner-direction-inputs-01` is a superseded P13 input kit. It holds only a pointer HANDOFF.md to this file.
- **Scratch.** Scratch trees link the real `docs`, `node_modules`, `art`, `tools` and `tests/fixtures`. Use `ln -sfn`, never write under a link, and delete with `rm -rf` on literal paths without a trailing slash.
- **Agent auth.** If an agent returns `401 OAuth access token has been revoked`, the Owner runs `/login`.
- **Commits.** None during a recorded run or its postflight. §7 and the X runs are not recorded runs, so commits are safe beside them.
- **The machine.** 4 CPUs, 8 GB RAM. Disk: 5.5 GB free at 21:39 CDT.
- **Hard limits.** Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-01 21:05 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `469a9547f1a3b53b7c9985ec53beaa55e2a65587`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 4
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-save43-sweep-broad-core-preflight.json`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-save43-sweep-broad-core.json`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-save43-sweep-broad-core.patch`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-save43-sweep-broad-core.txt`
- Last commits:
  - 469a9547 docs(handoff): sweep applied (cec3902c); recorded gates launching; P15 revisions in flight; no commits until the gates end
  - cec3902c test(p14): Save43 pin sweep, 137 files (1344-C5; review 1344-D4 ACCEPT WITH CHANGES)
  - 8896b5a0 docs(p14,p15): 1344-D4 ACCEPT WITH CHANGES, changes applied; X12 section 4; 1356-D3 NOT CONFIRMED (1356-F5); 1355-D4 CONFIRMED
  - 6427a491 docs(p15c): 1359-X reference run (route L unlawful under the founding-draft conflict; reference ranking key wrong); 1359-F3
  - 2eaacb29 docs(p15): 1356 RED r3 and 1355 RED r4 staged; both reference re-runs match their declarations (1356-X2, 1355-X2); 1356-F4
<!-- AUTO:END -->
