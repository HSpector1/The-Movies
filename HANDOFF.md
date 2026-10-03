# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-03 12:44 CDT. Codex takes over at about 13:45 CDT (Owner).

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ the commit that carries this file, pushed: yes. Protected main is never touched.
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
- **In flight:**
  - **x1's UI and d16 stages** are in the lane and finish at about 13:05 CDT (`S/1361-sweep/x1/x.meta`).
  - **x2 (all units)** is queued behind x1 and starts when x1 ends: `S/1361-sweep/run-sweep-x.sh x2 <sibling> <hygiene> H G1 G2 G3 G4a G4b G5`. Its lane log is `S/1361-sweep/x2.log`, its progress `S/1361-sweep/x2/x.meta`, and its outputs `x-tsc.txt`, `x-core.txt`, `x-ui.txt` and `x-d16.json`. Expected: core finishes about 14:30, the whole run about 14:55.
- **Claims limits:**
  - No unit edit has run yet. x2 is the first measurement of G1 to G5.
  - About 30 S8 and S9 pins are unmeasured: each unit's `deferred.md`, and the G4a, G4b and G5 handbacks.
  - The Bridge's post-2040 cost is unmeasured; G-L measures it.

## Next step
Standing rules:
- one heavy process at a time, through `bash S/heavy-queue/lane-run.sh 0 <log> <cmd>`, with logs outside output directories;
- never edit a running script;
- no commit or `git add` during a recorded run or its postflight;
- Node v20.20.2 first on PATH;
- delete scratch only by literal absolute paths, links first (variable paths are blocked).

1. **When x2 ends** (`S/1361-sweep/x2/x.meta` shows `end`), attribute it:
   ```
   mkdir -p S/1361-sweep/x2/attr
   python3 E/1321-I-attribution.py S/1361-sweep/x2/x-core.txt S/1361-sweep/x2/attr/x2-core-failures.json
   python3 E/1344-I-compare.py S/1361-sweep/x2/attr/x2-core-failures.json E/1358-I-core-failures.json S/1361-sweep/x2/attr/x2-core-vs1358I.json
   ```
   Do the same for UI, with `E/1317-I-attribution.py` and `E/1358-I2-ui-failures.json`. Read d16 against the base 12 (`E/1361-stage/d16/d16-base.json`). Then check:
   - **(a) The success line** (1361-N):
     - the three type gates exit 0;
     - core fails exactly 1358-I's 85 identities as re-attributed, plus the 45 declared 1355 leaves, plus the environment rows (7 `bridge-supervisor` "Fake Unity", 6 `r3n1` ENOENT);
     - UI has no NEW row;
     - d16 fails the same 12.
   - **(b) A production defect, which stops the work:** any refusal by `validateSaveV45` of a ticked save carrying Power Ranking records. The first such sites are G3's `p13a-causal-core` :49 and :91 and `v14-byte-parity.contract` :206. Report it, and do not edit the test.
   - **(c) Anything else is unit work.** Sort each remaining row to its unit by file (the classification's `unit`; G4's files per HANDOFF history: G4a has 12 files, G4b has 8).
2. **Follow-up units:**
   - **The tree.** Rebuild with `bash S/1361-sweep/build-unit-tree.sh <unit>-r2 S/1361-sweep/H/patch.diff S/1361-sweep/<unit>/patch.diff` (for H: `H-r2 S/1361-sweep/H/patch.diff`). Edit there.
   - **The edits.** Pin each measured first guard as 1361-F7 ruling 2 and the plan's S9 section say. Settle the deferred lines from x2's messages.
   - **The patch.** Regenerate it cumulatively from the unit's original state. For a G unit, `git diff HEAD~1 -- tests ui` covers its first patch plus the follow-up. Keep the old patch as `patch-r1.diff`.
   - **The rule.** An author may be an agent with `S/1361-sweep/brief-g-unit.md`, or Codex itself. Never weaken an assertion.
3. **x3.** Run `run-sweep-x.sh x3 …` with the updated patches (copy the script if x2 still runs). Repeat until the success line holds, then record `E/1361-X6` and later.
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
- **Disk.** 3.84 GiB free at 12:43 CDT, below the 5 GiB a recorded run needs. Swap shares the container and grows during heavy runs. Before recorded runs, delete with literal absolute paths, links first:
  - the `S/1361-sweep/x1/tree` and `x2/tree` trees, once read;
  - old closed scratch: `S/1358-*`, `S/1344-*`, `S/1353-*`, and any `S/*/tree` whose record is closed.

  Gzip large closed logs in place.
- **Power.** The Mac slept overnight on 10-02 at 0% battery. It is on AC power at 12:39 on 10-03. Keep it plugged in.
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
