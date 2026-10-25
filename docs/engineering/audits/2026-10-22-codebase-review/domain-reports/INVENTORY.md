# Review inventory (verified 2026-10-22, read-only)

## Refs and identities

| Item | Identity |
|---|---|
| Production checkout (R) | /Users/zacheryspector/The-Movies-headless-program, worktree of "The Movies - Unity Production Convergence 80H" |
| Branch | wip/headless-program-20260916-ts |
| Local HEAD | 0a12cbfd977ef9de9d142046b29195c3f7dedf36 "Record Studio workflow adoption while gameplay stays paused" (2026-10-18) |
| origin/wip/headless-program-20260916-ts | 84943cabbdae298a4a3acfbdc0a53435717e54c3 (PR 18 merge). Local is ONE commit ahead (0a12cbfd unpushed). Remote has nothing newer. |
| Working tree | clean (0 dirty), no stashes |
| HANDOFF AUTO block | stamped at 1e3e1916 with HANDOFF.md dirty; now superseded by clean HEAD 0a12cbfd (hook will restamp on session end) |
| Save48 landing | 2c3024e203abec74db95b8c01334723f10595ed2 (2026-10-13) |
| Tree identity | src 476b387d65a4c427dc0f6120724e946cf22d7969, bridge f089b6f15084, ui 71edd97a9f61, tests 334db2bef656, generated 78a16ed995da: IDENTICAL at 2c3024e2 and 0a12cbfd. 46 commits between them touch only docs, .agents, .claude, root instruction files and scripts/studio-workflow-setup.py (+ its test). |
| K/p16 candidate | /Users/zacheryspector/studio-specialists/p16, branch p16/save49-on-2c3024e2, HEAD 2c3024e2, 200 staged paths, 1 unstaged (HANDOFF.md), 0 untracked |
| current200 package | /Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012/p16-stopped-drafting-bridge62-integration-r1/ PATCH.diff sha256 d59d331be952e608aa4da9f89f88d71212826adb62a1f54ebbaf0cd6c4e1a1c5 (matches HANDOFF; matches `git diff --cached` of K/p16 byte-for-byte), MANIFEST.json sha256 7b16780a9573185c443d4f153ead6f98795074064136031944a36d71f224039e (matches). 200 files, +16,671/-906, 23,231 diff lines. |
| K/p17 draft | /Users/zacheryspector/studio-specialists/p17, detached at 6510c971 (2026-10-10, 80 commits behind Save48 landing), 184 unstaged, 13 untracked |
| K/p18 draft | /Users/zacheryspector/studio-specialists/p18, detached at f7d0dc0f (2026-10-10, 79 commits behind), 175 unstaged, 15 untracked (new src/core/tv*.ts) |
| Unity counterpart | HSpector1/project-studio-unity-visual-spike; local partial clone "/Users/zacheryspector/Project Studio - Unity Production Convergence 80H" branch wip/p04a2-final-convergence-client-secondary-20260828 @ 9bcd7be6c4133b22a0d6457a0cf85d7e90bfc549 (2026-08-28), clean |
| Heavy lane lock | /Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK absent |
| node_modules | ABSENT in R: no static check (tsc/vitest) can run without `npm ci` on Node 20.20.2 inside the lane |
| Other processes | codex and other claude sessions present with cwd = home; none in a Studio checkout; no vitest/tsc/ghidra/Unity running |

## Size (first-party, lines)

| Area | Lines | Files |
|---|---|---|
| src/core | 75,849 | 120 (.ts) |
| src/harness | 37,169 | research harnesses |
| bridge (.ts) | 23,197 | 64 files incl. 18.6k-line generated JSON schema |
| ui/src non-test | 85,446 | |
| ui/src tests | 79,728 | 207 files, ~2,377 it() |
| ui/e2e specs | 19,920 | 43 specs |
| tests/*.test.ts | 168,908 | 481 files, ~4,720 it() |
| scripts | 19,954 | |

Static scans at HEAD (non-test): core `as any` 0, `as unknown as` 93, ts-ignore 0, TODO/FIXME 0, console.* in core 0; empty catch blocks 1 of 346 catch sites (core+bridge+ui); core imports from ui/bridge 0; bridge imports from ui/src/engine/adapter.ts 20 sites; ui files importing src/core directly 11; skipped/todo tests 31 lines (it.skip x3, it.todo x8 with recorded reasons); explicit per-test timeouts above 5000 ms: 4 (bridge-runtime-checkpoint-prepared-reuse 20000, bridge-p12-campaign-library 20000 x2, p14c2a-consumers 30000); Date/Math.random/performance.now in core: none; in bridge: timing/log only (session.ts processingMs, server.ts startedEpochMs, lease.ts deadline).
