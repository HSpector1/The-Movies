# HANDOFF

Last writer: Codex (GPT-6), 2026-10-03 14:52 CDT. Resumed after the Owner's requested three-hour wait; accepted integration ownership at Claude's published checkpoint a23a40f4.

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ the commit that carries this file (parent 7cc287478f1892b453c8a9ea2de002e63899a85d), pushed: yes. Protected main is never touched.
- E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`.
- Required reading, in order:
  1. this file;
  2. `E/1361-F` (the Save45 order of work), with `E/1361-F2` to `E/1361-F8` (F5 and its Amendment 1: what Save45 carries; F7 and F8: the sweep's rulings);
  3. `E/1361-N-save45-pin-sweep-plan.md` (the sweep plan) and `E/1361-M2` (the fallout it plans);
  4. `E/1361-X4` (the P15C dry run) and `E/1361-X5` (sweep run x1);
  5. `E/1366-O` (the Owner's answers of 2026-10-03) and `E/1363-F` (the recovery charter as adopted).

## Active order
- **Governing Owner order:** the take-over mandate (`docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`), with rulings 1340-O and 1342-O and the Owner responses 1362-O (2026-10-02) and 1366-O (2026-10-03). Do not stop after decision reports. Do not reopen settled choices.
- **In scope, in order:**
  1. **Finish and land Save45.** It carries:
     - slice 2a r2;
     - P15A.1's (a) and (b) r2: an empty `sharedMarket`, with the F3 guard;
     - P15C (a) to (c);
     - the sibling test;
     - the hygiene comment;
     - the sweep.

     Everything lands in one push with four recorded runs, then the recorded broad gates `1361-M3`.
  2. **After Save45:**
     - the rival-recovery amendment 1363, Parts A, B and C. Part C is the non-core facility disposal of 1366-O, with the Owner's safeguards; 1363-A r2 must draft it, and the loan ends cost-cutting (O6).
     - the late-founding correction 1364-A, still to draft;
     - the P15A.1 (c) tuning amendment, record 1365, which must remove b-r2's guard.

     The parent orders the three. Then: P15C's closure items (1361-F6 rulings 2 and 3), the bounded reviews (the writing-context swallow; the d16 drift), and P15B.
- **Closed, do not reopen:**
  - P14; P15 Wave 1; relationship slices A and B; the P15 Wave 2 RED landing (1360-L); numpy;
  - G2's Retune verdict; G-P;
  - the reviews 1361-D, D2 and D3;
  - Owner questions O1 and O6 (1366-O).

## State
- **Codex resume checks:** the download folder is only a pointer. Fetched in this live repo; branch/HEAD a23a40f4 matched the remote and the worktree was clean. The production tree is clean on `p15c` and has the six recorded commits. Read the required orders and accepted the existing Save45 scope; no settled choice reopened. AC power is connected.
- **Preliminary independent review:** a separate Codex reviewer (substituting for the historical Sonnet role) sampled 58 edits across every unit and S1-S10/T at x2's committed tree, finding no new sweep defect or assertion weakening. `E/1361-stage/sweep/review-x2-static.md` holds its full table. This is not final sweep approval: measurements, deferred pins and final delta review remain required.
- **Prepared, not run:** `E/1361-stage/sweep/attribute-x2.py` runs the existing parsers after x2 ends, compares d16 after normalizing only the scratch-tree prefix, and routes remaining rows to units. `observe-guards.py` and `run-guard-observers.sh` preserve each original callback and assertion while logging the three bare refusal sites, studio-events forbidden keys and five loose S9 sites in a separate `S/1361-sweep/x2-guards/tree`. The latter must run through the heavy lane after x2. Syntax checked only. Following review, the runner now requires its uninstrumented Git tree to equal x2's, and the observer rejects symlink path components.
- **Production, all reviewed PROCEED and dry-run clean:**
  - the writer's tree `S/1361-prod/tree`, branch `p15c`, clean;
  - `git -C S/1361-prod/tree log --oneline base..p15c-c-r1` gives the six landing commits: 5eccada (slice 2a r2), 39d0481 (P15A.1 a), b0b6fb0 (P15A.1 b r2), 2592aea, 5a3a532 and f4612bf (P15C a, b and c);
  - the cumulative patches are in `E/1361-stage/prod/`;
  - P15A.1's (c) c524911 is held for record 1365.
- **What the merged candidate measured:**
  - **1361-X4 and 1361-M2:** `src` is type-clean; 1359 passes 116 of 116; 1356 passes 72 of 72, with the harness at 80,483 ms of 300,000; 1355 fails exactly the 45 declared leaves in `E/1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv`;
  - **the sibling test:** 5 of 5 pass, with its RED-side baseline at b-r2;
  - **d16:** the same 12 of 176 fail as at `base`.
- **The sweep:**
  - **The plan, 1361-N, with 1361-F7 and 1361-F8.**
  - **All seven units are written:** H, G1, G2, G3, G4a, G4b and G5. Sonnet authors wrote them from `S/1361-sweep/brief-g-unit.md`. Each unit's `patch.diff`, `rows.json`, `deferred.md` and `handback.md` are in `S/1361-sweep/<unit>/` and staged in `E/1361-stage/sweep/units/`, with sha256s in `units/patch-sha256.txt`.
  - **The patches stack** in this order on HEAD, with no shared file: sibling, hygiene, H, G1, G2, G3, G4a, G4b, G5.
  - **The authoring trees are deleted.** `S/1361-sweep/build-unit-tree.sh <unit> <patch …>` rebuilds any of them.
- **Sweep run x1 (H only; `E/1361-X5`):**
  - type-gate test errors fell from 33, 4 and 9 to 28, 0 and 5;
  - core went from 938 to 614 failed, against 1358-I SAME 78, CHANGED 7, NEW 530;
  - nothing new fails that did not fail in M2;
  - the P15 files fail the 45 declared.
- **x1 complete** (12:58 CDT): UI went from 11 to 8 failed (H cleared its 3; the 8 left are G3's UI files) and d16 fails the base 12. Record `E/1361-X5`.
- **x2 complete (1361-X6):** type gates and generators all pass; core 155 failed / 5,096 passed, SAME 78 / CHANGED 7 / NEW 70 / GONE 0 against 1358-I. NEW = 45 declared 1355 leaves with identical messages + 7 environment rows + 18 deferred S9 rows in 11 files. UI 2,692 passed / 5 skipped, no failures. d16 is exactly the base 12, including full messages after scratch-prefix normalization. The tree ended clean at 14:50:06 CDT. Both named production-stop files pass.
- **r2 staged, not confirmed:** `S/1361-sweep/{G1,G4a,G4b}/patch-r2.diff` and `rows-r2.json`, mirrored in `E/1361-stage/sweep/units/`. 17 anchored pins and coverage comments across 11 files. The other units stay at `patch.diff`; the originals have not been overwritten. Independent static delta review is `E/1361-stage/sweep/review-r2-static.md`, with all comment findings corrected. Stack check passes; execution is pending.
- **In flight:** `x2-guards`, lane PID 90441, runner PID 90563, started 14:50:16 CDT. Logs are `S/1361-sweep/x2-guards/observer.txt`, `observer.meta` and `observer.patch`; lane log `S/1361-sweep/x2-guards.log`. It should finish around 14:54. Tool session 14845 belongs only to this Codex session. No recorded run is active.
- **Claims limits:**
  - x2 measures all r1 units; r2 remains unmeasured. The bare and loose guard messages are still being observed.
  - About 30 S8 and S9 pins are unmeasured: each unit's `deferred.md`, and the G4a, G4b and G5 handbacks.
  - The Bridge's post-2040 cost is unmeasured; G-L measures it.

## Next step
Standing rules:
- one heavy process at a time, through `bash S/heavy-queue/lane-run.sh 0 <log> <cmd>`, with logs outside output directories;
- never edit a running script;
- no commit or `git add` during a recorded run or its postflight;
- Node v20.20.2 first on PATH;
- delete scratch only by literal absolute paths, links first (variable paths are blocked).

1. **x2 has ended and is attributed** (`E/1361-X6-sweep-x2-all-units.md`). The commands below are retained for the next run; do not overwrite the existing x2 outputs:
   ```
   mkdir -p S/1361-sweep/x2/attr
   python3 E/1321-I-attribution.py S/1361-sweep/x2/x-core.txt S/1361-sweep/x2/attr/x2-core-failures.json
   python3 E/1344-I-compare.py S/1361-sweep/x2/attr/x2-core-failures.json E/1358-I-core-failures.json S/1361-sweep/x2/attr/x2-core-vs1358I.json
   ```
   The prepared `python3 S/1361-sweep/attribute-x2.py` performs both parser/comparison pairs and the d16 comparison, once only (its output names must not already exist).
   Do the same for UI, with `E/1317-I-attribution.py` and `E/1358-I2-ui-failures.json`. Read d16 against the base 12 (`E/1361-stage/d16/d16-base.json`). Then check:
   - **(a) The success line** (1361-N):
     - the three type gates exit 0;
     - core fails exactly 1358-I's 85 identities as re-attributed, plus the 45 declared 1355 leaves, plus the environment rows (7 `bridge-supervisor` "Fake Unity", 6 `r3n1` ENOENT);
     - UI has no NEW row;
     - d16 fails the same 12.
   - **(b) A production defect, which stops the work:** any refusal by `validateSaveV45` of a ticked save carrying Power Ranking records. The first such sites are G3's `p13a-causal-core` :49 and :91 and `v14-byte-parity.contract` :206. Report it, and do not edit the test.
   - **(c) Anything else is unit work.** Sort each remaining row to its unit by file (the classification's `unit`; G4's files per HANDOFF history: G4a has 12 files, G4b has 8).
2. **Finish the active guard observations, then confirm r2:**
   - `run-guard-observers.sh` is already running; do not start a duplicate. Read its `observer.txt`, `observer.meta` and `observer.patch`; no observer edit may land. This closes the passing-but-unattributed bare and loose guards identified in the preliminary review. Any mismatching guard gets the F7 ruling 9 treatment, not a weakened assertion.

   - **The tree.** Rebuild with `bash S/1361-sweep/build-unit-tree.sh <unit>-r2 S/1361-sweep/H/patch.diff S/1361-sweep/<unit>/patch.diff` (for H: `H-r2 S/1361-sweep/H/patch.diff`). Edit there.
   - **The edits.** Pin each measured first guard as 1361-F7 ruling 2 and the plan's S9 section say. Settle the deferred lines from x2's messages.
   - **The patch.** Regenerate it cumulatively from the unit's original state. For a G unit, `git diff HEAD~1 -- tests ui` covers its first patch plus the follow-up. Keep the old patch as `patch-r1.diff`.
   - **The rule.** An author may be an agent with `S/1361-sweep/brief-g-unit.md`, or Codex itself. Never weaken an assertion.
3. **x3.** Run `run-sweep-x.sh x3 …` with sibling, hygiene, H/patch.diff, G1/patch-r2.diff, G2/patch.diff, G3/patch.diff, G4a/patch-r2.diff, G4b/patch-r2.diff and G5/patch.diff (plus any new measured guard fixes) (copy the script if x2 still runs). Repeat until the success line holds, then record `E/1361-X7` and later.
4. **The sweep's independent review** (plan, "Units" step 5): a sample of at least 40 rows across the classes.
5. **The landing `1361-L`.** Keep the Mac on AC power, and keep at least 5 GiB free (see the warnings).
   - **The commits.** In the repo, run `git -C S/1361-prod/tree format-patch base..p15c-c-r1 -o <dir>`, then `git am` the six into the repo. Then commit, in order:
     - the sibling test (`git apply` `E/1359-stage/1359-p15c-wave2-sibling-r2.patch`);
     - the hygiene comment (`E/1361-stage/sweep/1361-hygiene-comment.patch`, record 1361-F7 ruling 1);
     - the sweep: the final unit patches, as one commit or one per unit.

     Then the type gates and the generator checks at HEAD, and push.
   - **The four recorded runs** (1361-F ruling 14), with the script prepared for them: `bash S/heavy-queue/lane-run.sh 0 S/1361-land/<mode>.log bash S/1361-land/recorded-1361.sh <mode>`, modes `p15a2-green`, `p15a2-harness`, `p15a1-green`, `p15c-green`, then `core`, `ui` and `d16` for 1361-M3. The script is staged as `E/1361-stage/land/recorded-1361.sh` and adapted from `S/1358-land/recorded3.sh`. It checks HEAD against the remote, clean source paths, at least 5 GiB free, the stem rule and the five exact output names, and that the sibling test and hygiene comment have landed. Its `d16` mode (the recorder wrapping `vitest --config`) is untested: read the recorder before relying on it. The runs:
     - `1361-p15a2-green-recorded`;
     - `1361-p15a2-harness-recorded`, alone;
     - `1361-p15a1-green-recorded`, which must fail exactly the 45 with their messages;
     - `1361-p15c-green-recorded`: 1359's three files plus `tests/p15c2-campaign-legacy-sibling.test.ts`.
   - **Then** the recorded broad gates `1361-M3`: core over the 448 files, UI, d16. Then attribution and the records `1361-L` and `1361-M3`.

## Open decisions for the Owner
- None open. 1366-O answered O1 and O6. O2 to O5 of 1363-A go to the Owner only with 1363-V's numbers.

## Blockers and warnings
- **Disk.** 3,844,920 KiB free at 14:08 CDT (about 3.67 GiB), below the 5 GiB a recorded run needs. Swap takes the space: `sysctl vm.swapusage` shows 4,096 MB allocated and 2,978 MB used, and all of `S` is under 0.7 GiB.
  - **The fix before the recorded runs:** restart the Mac after x2 and before the landing (which also clears the stuck `U` and `UE` processes), or close Chrome and VS Code. Then check `df -k /`.
  - **Scratch trees** (`S/1361-sweep/x1/tree`, `x2/tree` once read) go by literal absolute paths, links first. Never delete cited logs: the gzipped `S/1344-merge/x*-core.txt.gz` and `S/1361-m2/m2-*.txt*` back records.
- **Power.** The Mac slept overnight on 10-02 at 0% battery. Codex verified AC power and 100% charge at 14:01 on 10-03. Keep it plugged in.
- **The recorder's guards** digest HEAD, the index and stage entries. No `git add` during a recorded run or its postflight, and use plumbing only. Recorded-run scripts check exactly five output names (memory `recorder-output-exact-names`).
- **Scratch trees.** `tests/fixtures` must be a real directory of per-entry links, with `bridge-contract-union-fixtures.ts` copied. `docs` is linked whole, because the sibling test reads `E/1052-c3-endurance-A-observer-fixed/`. Never write under a link. `build-unit-tree.sh` and `run-sweep-x.sh` do all of this.
- **Never `cd` in a top-level shell command.** It rebinds the session's working directory. Use `git -C` and absolute paths (memory `no-cd-in-bash`).
- **Hanging tools.** The shell's `grep` wrapper, `pgrep -f`, and recursive scans of `docs/` can hang. Use `/usr/bin/grep` and `perl -e 'alarm N; exec @ARGV'`.
- **Legacy replay inputs** (1361-F6 ruling 2): no change to `technologyCatalogue.ts` or to `campaignLegacy.ts`'s evaluators until P15C's closure adds the catalogue-order pin and the frozen-v2-Legacy capture leaf.
- **(c)'s retune** must delete b-r2's F3 guard together with (b)'s write (1361-F5 Amendment 1).
- **The writing-context swallow** (`src/core/liveRetirementWriting.ts:21-26`) gets a bounded review after Save45.
- **Hard limits.** Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-03 11:31 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `fc8d56742a0d893cf7f4183b9746c82c7f4cade2`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 0
- Last commits:
  - fc8d5674 docs(handoff): unit H done; x1 running; G1 and G2 authoring; G3-G5 trees ready; G4 split defined
  - dc84faf0 docs(handoff): sweep unit H in progress; x1 and the hygiene patch ready
  - 5b57cfbc docs(owner): 1366-O Owner answers O1 (non-core facility disposal at the player's refund, bounded Part C of 1363 after Save45) and O6 (a loan ends cost-cutting)
  - af5ad7d1 docs(p15): 1361-F7 parent rulings on the 1361-N sweep plan (eleven questions); HANDOFF next step updated
  - d44c567e docs(handoff): full rewrite at the 95% usage trigger; 1361-N sweep plan staged with recommended rulings for 1361-F7
<!-- AUTO:END -->
