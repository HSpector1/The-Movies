# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-03 10:22 CDT, written at Claude's 95% weekly-usage trigger. If Claude stops, Codex resumes from this file.

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ the commit that carries this file (its parent is 5a6378d1), pushed: yes. Protected main is never touched.
- Resume: this session is `claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1`, run from `~/Downloads/project-studio-p13-owner-direction-inputs-01`. A fresh session starts in this repo root and says "resume from HANDOFF.md".
- E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`.
- Required reading, in order:
  1. this file;
  2. `E/1361-F` (the Save45 order of work), with `E/1361-F2` to `E/1361-F6`; F5 and its Amendment 1 define what Save45 now carries;
  3. `E/1361-M2` (the fallout) and `E/1361-N-save45-pin-sweep-plan.md` (the sweep plan, awaiting rulings);
  4. `E/1362-O` (the Owner's three responses of 2026-10-02, summarized in `DECISIONS.md`);
  5. `E/1363-F` (the recovery charter as adopted) and `E/1364-R`.

## Active order
- **Governing Owner order:** the take-over mandate (`docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`), with rulings 1340-O and 1342-O and the 2026-10-02 responses in 1362-O. Do not stop after decision reports. Do not reopen settled choices.
- **In scope, in dependency order:**
  1. **Land Save45 (1361-F).** It carries:
     - slice 2a r2 (`powerRanking`, `p15Sequence`);
     - P15A.1's (a) and (b) r2: an empty `sharedMarket`, with the F3 guard;
     - P15C (a) to (c), the frozen 2040 Legacy;
     - the sibling test;
     - the Save45 pin sweep.

     Everything lands in one push with four recorded runs, then the recorded broad gates.
  2. **After Save45:**
     - the rival-recovery amendment 1363: Parts A and B, plus Part C, the non-core facility disposal of `E/1366-O`, with 1363-A r2 to draft;
     - the late-founding correction 1364-A, with the charter still to draft;
     - P15A.1's (c) tuning amendment, record 1365. G2 read Retune.

     The parent orders the three. After them come the masked-downgrade-guard coverage repair, the replacement natural
     fixtures for the seven exceptions, G-P and G-L on the recovery tree, and P15B Wave 2.
- **Closed, do not reopen:**
  - P14 (1344-K, 1344-V); P15 Wave 1; relationship slices A and B (1358-L, 1358-M3);
  - the P15 Wave 2 RED landing (1360-L); numpy (1362-V);
  - G2's verdict (1361-G2-X, 1361-F5); G-P (1361-GP-X);
  - the reviews 1361-D, D2 and D3, all PROCEED.

## State
- **Done this session (all pushed):**
  - **Slice 2a r2:** 5eccada.
  - **P15A.1:**
    - `p15a1-a-r1` 39d0481;
    - `p15a1-b-r2` b0b6fb01: (b) plus 1361-D2 F3's guard, which refuses a tick when `sharedMarket` holds rows;
    - `p15a1-c-r1` c524911: G2's frozen candidate, now waiting for record 1365.
  - **P15C:** `p15c-a-r1` 2592aea, `p15c-b-r1` 5a3a532, `p15c-c-r1` f4612bf. All are in the writer's tree `S/1361-prod/tree`, clean on branch `p15c`. Cumulative patches are in `E/1361-stage/prod/` (`git diff base <tag>`).
  - **The measurements:**
    - **G2 (1361-G2-X): Retune.** K1 to K5 hold exactly. The K3 reading was pre-registered in 1361-F4.
    - **G-P (1361-GP-X):** no trigger, and the holder sets equal 1353-X4's.
    - **The dry run of b-r2 (1361-X3).**
    - **The dry run of P15C (1361-X4):** `src` type-clean at every tag; 1359 at 86, 98 and 116 of 116; 1356 at 72 of 72, with the harness at 80,483 ms; 1355 fails exactly the 45 declared leaves in `E/1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv`.
    - **The sibling test:** 5 of 5 pass at (c), and 5 of 5 fail by name at b-r2.
    - **d16:** the same 12 of 176 fail at `base` and at every tag.
    - **The fallout (1361-M2):** 809 Save45 pin rows in 138 core files, 11 UI pins, and 33, 4 and 9 test type-error sites.
  - **The sweep plan:** `E/1361-N-save45-pin-sweep-plan.md`, with its classification and scripts in `E/1361-stage/sweep/`. It covers 868 core rows and 11 UI rows in units H and G1 to G5. 716 rows are certain and 103 need a dry run.
  - **1363 adopted** (1363-F, with question O6 for the Owner).
- **In flight:**
  - **Unit H done** (sonnet author): `S/1361-sweep/H/{patch.diff,rows.json,deferred.md,handback.md}`, 16 files, 60 of 61 lines; 1 deferred (`p14c3-save-v38:121`, a bare `.toThrow()` per ruling 9); 11 measure lines await a run.
  - **x1** in the lane since 11:01 CDT 10-03 (`S/1361-sweep/run-sweep-x.sh x1` + sibling + hygiene + H; progress `S/1361-sweep/x1/x.meta`; outputs `x-core.txt`, `x-ui.txt`, `x-d16.json`). Type gates already match H's acceptance (root 28, UI 0, Bridge 5 test errors; src 0). Expected end about 12:50.
  - **G units** (sonnet authors, shared brief `S/1361-sweep/brief-g-unit.md`): G1 and G2 running since 11:07. Trees for G3, G4a, G4b and G5 are built (production + H). The G4 split (1361-F7 ruling 11): G4a = v14-boundary-guards, p06a-w1-release-authority, p12-starting-world, p13b-s8-save-v27, p14b1-t4-regressions, p14c2b-save-v36, p14c2rm-writer-continuation, p14c3-canonical-rival-history, p14c3-cohort-transition, p14c3-dual-extensions, p14c3-offmenu-extensions, p14c3-profession-history; G4b = p14c3-promise-digest-continuity, p14c3-queued-writing-proof, p14c3-transitions, p14p3-directing-promises, p14p4p5-opportunities, p14p4p5-screenplay-status, p14r3-save-v41, save.
  - **x2 after the G units:** `run-sweep-x.sh x2 <sibling> <hygiene> H/patch.diff G1/patch.diff G2/patch.diff G3/patch.diff G4a/patch.diff G4b/patch.diff G5/patch.diff` (each G patch is `git diff HEAD -- tests ui` on top of H, so they stack); queue it behind x1 in the lane.
  - **The hygiene comment patch** (1361-F7 ruling 1) is `S/1361-sweep/hygiene/1361-hygiene-comment.patch`, checked against HEAD.
- **Claims limits:**
  - The sweep plan rests on reading only. 103 rows and every S9 anchor must be measured in its dry run.
  - The Bridge's per-state replay cost after 2040 is unmeasured; G-L measures it (1361-F6 ruling 3).
  - The d16 drift (12 failures at `base`) is unexplained.
  - On the Save45 tree the Legacy's market lens is empty at every boundary (1361-GP-X).

## Next step
Standing rules:
- one production writer;
- one heavy process at a time: `bash S/heavy-queue/lane-run.sh 0 <log> <cmd>`, with logs outside output directories;
- no commit or `git add` during a recorded run or its postflight;
- at least 5 GiB free before a recorded run;
- recorded runs on Node v20.20.2, with stems matching `^[0-9]{3,4}[a-z0-9-]*$`;
- keep the Mac on power (below).

1. **`E/1361-F7` is written** (the eleven rulings on 1361-N, adopting the recommendations above it in this file's history): the hygiene comment is reworded by the RED's owner in its own tests-only commit; S9 follows 1358-F10 ruling 4 and 1358-F9 ruling 2; S5 uses a literal per-file `withEmptyP15Roots`; S7 and S10 import `stripP15` and `p15Rows` from `tests/helpers/p15-roots.ts`; the 1358-F12 form applies at `p14d1-rival-shelving:618`; G4 splits into G4a and G4b.
2. **Build the sweep's merge tree**, `S/1361-sweep/merge`: an archive of HEAD plus `E/1361-stage/prod/1361-p15c-production-c-r1.patch`, plus the sibling patch `E/1359-stage/1359-p15c-wave2-sibling-r2.patch`, laid out as `S/1361-m2/run-1361-M2.sh` lays out its tree. Then:
   - **Unit H:** its test author writes it first.
   - **The G units:** test authors on disjoint files, at most two agents at once, each writing the plan's edits and staging a patch.
   - **The parent** merges and dry-runs, with the type gates, core over 447 files plus the sibling file, UI and d16. Copy `run-1361-M2.sh` to a new name; never edit a running script.
   - **Iterate** until 1361-N's success line holds:
     - type gates exit 0, and both generator checks pass;
     - core fails exactly 1358-I's 85 identities as re-attributed, the 45 declared 1355 leaves and the environment rows (7 `bridge-supervisor`, 6 `r3n1`);
     - UI has 0 NEW rows;
     - d16 fails the base 12.
   - **Then** an independent review of the sweep.
3. **The landing `1361-L`.**
   - **The commits,** replayed in order from the writer's tree: `git -C S/1361-prod/tree format-patch base..p15c-c-r1` yields exactly the six landing commits 5eccada, 39d0481, b0b6fb0, 2592aea, 5a3a532 and f4612bf, which `git am` applies in the repo. Then the sibling test commit, then the hygiene-comment commit, then the sweep. One push.
   - **The four recorded runs** (1361-F ruling 14; model `S/1358-land/recorded3.sh`): `1361-p15a2-green-recorded`, `1361-p15a2-harness-recorded`, `1361-p15a1-green-recorded` (it must fail exactly the 45 with their messages) and `1361-p15c-green-recorded` (1359's three files plus the sibling file).
   - **Then** the recorded broad gates `1361-M3` (core, UI, d16 equal to the base 12), and the type gates at the landed HEAD.
4. **After the landing:**
   - the P15C closure items (1361-F6 ruling 2's two guard leaves, G-L with the post-2040 cost measurements);
   - P15A.1's integrated harness, after (c) lands;
   - the bounded reviews (the writing-context swallow; the d16 drift);
   - then 1363, 1364-A and 1365, in the order the parent sets.

## Open decisions for the Owner
- None open. On 2026-10-03 (`E/1366-O`, `DECISIONS.md`) the Owner answered:
  - **O1:** non-core facility disposal at the player's demolition refund, as a bounded Part C of 1363 after Save45, with the Owner's safeguards;
  - **O6:** a P15B loan ends cost-cutting.
- O2 to O5 of 1363-A go to the Owner only with 1363-V's numbers.

## Blockers and warnings
- **Power.** The Mac slept from 19:01 on 10-02 to 09:19 on 10-03 at 0% battery (pmset AutoPowerOff). At 10:22 it is on battery at 81%. Plug it in before any heavy or recorded run: a recorded run is void if the machine sleeps.
- **Disk.** 4.99 GiB free at 10:22. Before recorded runs, delete closed trees with literal paths, links first:
  - `S/1361-m2/tree`;
  - `S/1361-sibling/v2-c/tree` and `S/1361-sibling/v2-b/tree`;
  - `S/1358-n/tree` and `S/1358-sweep/merge`, the slice B references; 1358-L is closed.
- **Node.** Put `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin` first on PATH. The nvm default is v22.
- **The recorder's guards** digest HEAD, the index and stage entries. No `git add` while a recorded run or its postflight runs. During a run use plumbing only.
- **Recorded-run scripts** check exactly the five output names (memory `recorder-output-exact-names`).
- **Scratch trees.** `tests/fixtures` must be a real directory of per-entry links, with `bridge-contract-union-fixtures.ts` copied. Tests that read `E/1052-c3-endurance-A-observer-fixed/` need the E directory linked as well (1361-X4's first sibling run failed with ENOENT without it). Never write under a link.
- **Never `cd` in a Bash call.** It rebinds the harness's working directory (memory `no-cd-in-bash`). Use `git -C` and absolute paths.
- **Hanging tools.** The shell's `grep` wrapper, `pgrep -f`, `git grep` over docs and any recursive scan of `docs/` can hang. Use `/usr/bin/grep`, `ps -Ao pid,etime,stat,comm`, and `perl -e 'alarm N; exec @ARGV'`.
- **Legacy replay inputs** (1361-F6 ruling 2): no change to `technologyCatalogue.ts` or to `campaignLegacy.ts`'s evaluators until P15C's closure adds the catalogue-order pin and the frozen-v2-Legacy capture leaf.
- **(c)'s retune** must delete b-r2's F3 guard together with (b)'s write (1361-F5 Amendment 1).
- **The writing-context swallow** (`src/core/liveRetirementWriting.ts:21-26`) gets a bounded review after Save45 (1361-F3 ruling 3).
- **Hard limits.** Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-03 09:48 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `5a6378d13c0d9a27e5f7448419bbfd18c2226637`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 0
- Last commits:
  - 5a6378d1 docs(handoff): the Save45 sweep planner 1361-N is running
  - c0b07770 docs(p15): 1361-M2 Save45 fallout (809 pin rows in 138 files; P15 files as declared; UI 11 pins; d16 unchanged)
  - 74553102 docs(p15): 1361-D3 review of P15C (PROCEED, no change) and 1361-F6 rulings (replay-input rule and closure guard; post-2040 cost at G-L)
  - 3f68f84b docs(p15): 1361-X4 dry run of P15C (1359 116/116 at (c), no regression; sibling 5/5); review 1361-D3 and fallout 1361-M2 running
  - a0e51c93 docs(p15): 1361-E3 P15C production handback and patches staged; X4 dry run in the lane
<!-- AUTO:END -->
