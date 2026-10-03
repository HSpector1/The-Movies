# HANDOFF

Last writer: Codex (GPT-6), 2026-10-03 17:02 CDT. Resumed after the Owner's requested three-hour wait; Claude's published checkpoint a23a40f4 was preserved.

## Where the work is
- Repo: `/Users/zacheryspector/The-Movies-headless-program` (the Downloads folder is only a pointer).
- Branch: `wip/headless-program-20260916-ts`, HEAD is the commit carrying this handoff (parent `d645e70062db9c1581bf8e90445c701ba2416233`), pushed: yes. Main is protected and untouched. This branch has no upstream; verify the remote explicitly.
- E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`; S = `/Users/zacheryspector/studio-scratch`.
- Required reading, in order: this file; repo `CLAUDE.md` and the coordinator/source-index rules; `E/1361-F` through `E/1361-F8`; `E/1361-N-save45-pin-sweep-plan.md`; `E/1361-X7-sweep-x3-confirmation.md`; `E/1361-stage/sweep/review-x3-final.md`; `E/1366-O` and `E/1363-F`. `E/1361-X6` carries the x2 guard attribution and disclosed limits. Records with short IDs are filenames beginning with that ID, not literal filenames.

## Active order
- Governing Owner order: `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, rulings 1340-O/1342-O, Owner responses 1362-O and 1366-O. Continue the authorized program; do not reopen settled choices.
- In scope, in order:
  1. Finish and land Save45: slice 2a r2; P15A.1 (a) and (b) r2 with an empty sharedMarket and the F3 guard; P15C (a)–(c); sibling r2; hygiene comment; final sweep. One landing push, four recorded P15 runs, then recorded core/UI/d16 gates and 1361-L/M3.
  2. After Save45: 1363 rival recovery Parts A/B/C (O1 non-core facility disposal with Owner safeguards, O6 loan ends cost-cutting); 1364 late founding; 1365 P15A.1 (c) retune, removing b-r2's guard.
  3. Then P15C closure items (F6 rulings 2/3), bounded writing-context swallow and d16 reviews, then P15B.
- Closed: P14; P15 Wave 1; relationship slices A/B; Wave 2 RED landing 1360-L; numpy; G2 Retune verdict and G-P; reviews 1361-D/D2/D3; Owner O1/O6 (1366-O).

## State
- Resume checks matched Claude's a23a40f4 checkpoint and remote. AC power and 100% battery verified. No settled scope changed.
- Production remains in clean `S/1361-prod/tree`, branch `p15c`. Six commits `base..p15c-c-r1`: 5eccada, 39d0481, b0b6fb0, 2592aea, 5a3a532, f4612bf. P15A.1 (c) c524911 is held for 1365. Production has NOT landed in the live repo.
- Six production `format-patch` files are prepared in `S/1361-land/production/` and preserved in `E/1361-stage/land/production/`. Reviewed cumulative production remains in `E/1361-stage/prod/`; c-r1 SHA-256 is `a7a70ad959ee2eb7fc7f0e7200ee693f3a28edfb66ffbc8fc327fd077ef7c221`.
- Final sweep inputs: `patch-r2.diff` for H, G1, G4a, G4b; `patch.diff` for G2, G3, G5. Scratch: `S/1361-sweep/<unit>/`; preserved: `E/1361-stage/sweep/units/`. Exact hashes: `final-candidate-sha256.txt`. Apply sibling then hygiene then H/G1/G2/G3/G4a/G4b/G5. All patches stack without shared unit files.
- **x3 COMPLETE and clean**, 2026-10-03 15:01:16–16:55:24 CDT. Candidate `ee289de67e453ce269c98d840a48799265c62993` in `S/1361-sweep/x3/tree`, built from repo archive 8719cde1. All three type checks and both generator checks pass. Core 137 failed / 5,114 passed / 3 skipped / 11 todo (5,265, 448 files); UI 2,692 passed / 5 skipped (2,697, 204 files), no failures/unhandled errors; d16 12 failed / 164 passed (176).
- **Exact attribution PASSES:** core against 1358-I SAME78 / CHANGED7 / NEW52 / GONE0. NEW = the 45 declared P15A.1 identities and primary messages exactly + seven supervisor Fake Unity environment failures. CHANGED = C20 version digit + six existing r3n1 ENOENT paths. UI NEW0 and the historical three numpy rows GONE. d16 matches all 12 identities and full messages after only absolute scratch-prefix normalization. Compared with x2, exactly the 18 S9 failures disappear; nothing else is added or changes primary message after tree-prefix normalization. Both production-stop files pass (causal8/8, byte-parity6/6).
- Evidence: `E/1361-X7-sweep-x3-confirmation.md`, `E/1361-stage/sweep/x3/` (compressed raw logs, hashes, JSON, metadata, attribution); raw scratch logs remain. `attribute-x3.py` is preserved; do not rerun over its existing output names.
- Guard diagnostics complete: x2-guards recorded 343 assertion-preserving calls, 17 known failures / 219 passes. Four precise S8 pins (three H, one writer case across four callers) and 17 S9 pins are now confirmed by x3. Unit deferred/handback addenda and r2 metadata reflect completion, retaining original author notes as historical provenance.
- Independent review: prior 58-edit sample, all r2 deltas, guard messages, and final measured candidate reviewed. Final verdict: PROCEED for sweep landing, subject to disk precondition and later recorded gates. See `E/1361-stage/sweep/review-x3-final.md`.
- Cleanup completed: closed H-r2, G1-r2, G4a-r2, G4b-r2, x1 and x2-guards trees removed by literal paths, links first. Patches/logs/observations preserved. x2/tree, x3/tree and production tree remain.
- In flight: NONE. x3 tool session 38877 finished exit 0; its core/d16 expected test exits were 1, as attributed. No recorded run has started.
- Claims limits: 15 P14B.1 terminal premise failures never reach mutants; 26 workflow-carrier observations first reach existing V14 history guards, not new P15 masking. Four exact S8 cases disclose earlier guards rather than claim isolated masked-invariant coverage. Other standing fixture failures still block later assertions. No production, fixture payload or P15 RED assertion changed in the sweep. Bridge post-2040 cost remains unmeasured (G-L). Dry runs do not satisfy recorded gates.

## Next step
1. **Resolve the disk precondition before landing/recorded runs.** Last measured 4,059,864 KiB (~3.87 GiB), below 5 GiB. At least ~1.2 GiB more must be available, with headroom. Completed authorized scratch cleanup did not meet it. Coordinate with the Owner for unrelated file cleanup or a restart/closing their applications; do not close them or restart without direction. No test is running now. Then verify `df -k /`, AC, local/remote HEAD and clean source.
2. **Land the reviewed candidate without reopening it.** Verify final review and input hashes. Apply the six prepared production format-patches in order with `git am`. Then commit sibling (`E/1359-stage/1359-p15c-wave2-sibling-r2.patch`), hygiene (`E/1361-stage/sweep/1361-hygiene-comment.patch`), and final unit patches in order. Check source diff matches the reviewed candidate; run three type gates and both generator checks at landed HEAD; one push for the landing. Update handoff at checkpoint commits under the skill; do not push intermediate production commits separately.
3. **Four recorded P15 runs**, each through `bash S/heavy-queue/lane-run.sh 0 S/1361-land/<mode>.log bash S/1361-land/recorded-1361.sh <mode>`: `p15a2-green`, `p15a2-harness` (alone), `p15a1-green`, `p15c-green`. P15A.1 must retain the exact declared 45; the P15C selection includes the sibling. Script and format-patches are preserved under `E/1361-stage/land/`. Codex read the recorder and wrapper; d16 mode wraps vitest's config command correctly, but no recorded mode has yet run here. Inspect recorder guards, exits and postflight, not only wrapper exit.
4. Then recorded `core`, `ui`, `d16` modes for 1361-M3. Core is 448 files including sibling and excludes the six owner-input files per1296-A. Attribute against the established baselines; do not waive the 45 or any new failure. Finish 1361-L/M3, handoff checkpoint, then continue the ordered recovery/founding/retune program.

Standing execution rules:
- One heavy job, always through the lane; logs outside output dirs. Node `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin` first on PATH.
- Never edit an active tree/script. No `git add` or commits during a recorded run or its postflight; use plumbing there. Recorder output must have exactly the five allowed names; HEAD/index are digested.
- No top-level `cd`; use tool workdir, absolute paths and `git -C`.
- Scratch deletion uses literal absolute paths and removes symlinks first. `rm -f` style commands were automatically rejected; the completed cleanup safely used `find -P ... -type l -delete` then `rm -r` on those literal closed-tree paths.

## Open decisions for the Owner
- Machine storage: free enough space to meet the recorded runner's 5 GiB requirement (recommend at least 1.5 GiB additional headroom), or coordinate a restart after saving other work. All task jobs are finished and evidence is preserved.
- No product decision is open. O1/O6 are answered; O2–O5 of1363-A wait for1363-V's measured numbers.

## Blockers and warnings
- Disk is the present blocker; do not waive the 5 GiB guard. Earlier swap was 4,096 MB allocated / 2,978 MB used, so restarting may release space, but requires Owner coordination. Current free space must be measured anew.
- Keep the Mac on AC. It previously slept at 0% battery; heavy scripts run caffeinate.
- `tests/fixtures` in scratch must be a real directory of per-entry links, with `bridge-contract-union-fixtures.ts` copied. `docs` is linked whole for sibling evidence. Never write through links or scan fixture payloads.
- Shell `grep` wrapper and `pgrep -f` may hang; use `/usr/bin/grep`, targeted `rg`, `ps`, or bounded Python. Avoid recursive docs content scans.
- Legacy replay inputs: no technologyCatalogue.ts or campaignLegacy evaluator change until F6 closure adds catalogue-order and frozen-v2-Legacy pins. 1365 must remove b-r2's F3 guard with (c). Bounded writing-context swallow review stays after Save45.
- Hard limits: no Owner saves, fixture-tree scans, force pushes, or launching Codex. No unrelated app closure/restart without direction.

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
