# Launch receipt — browser playtest preparation (2026-10-30, 20:49 to 20:56 CDT)

Owner order: "GET THE BROWSER CANDIDATE READY FOR MY PLAYTEST" (pasted 20:49 CDT). Bounded preparation; no feature
sprint, no comprehensive review, no promotion, no Sprint 28; native Unity execution deferred, not waived.

## Recovery, once

| Reference | Order | Found | Remote |
|---|---|---|---|
| Engine p18-season-20261028 | 18c3e8cf | 18c3e8cf, clean (worktree studio-scratch/p17-continuation-20261027-wt) | 18c3e8cf |
| Playtest tag p18-sprint26-candidate-20261030 | preserved | 6ddeeb00 (object f1c483b3) | same |
| Sprint 27 tag p18-sprint27-checkpoint-20261030 | preserved | 18c3e8cf (object 4c7d9427) | same |
| Records wip/headless-program-20260916-ts | — | 716bdf68, clean | 716bdf68 |
| Unity sprint15-consumer-20261028 | — | 4c41676, clean | 4c41676 |

Nothing newer anywhere. `git diff --stat 6ddeeb00 18c3e8cf -- ui src package.json package-lock.json` is empty: the browser
game of 18c3e8cf is byte for byte the Sprint 26 playtest candidate, so the Sprint 26 browser evidence (eight Chrome
journeys at 6ddeeb00, the UI gate full-tree-s26-r1) applies to this build by source identity, within its recorded limits.
Read: HANDOFF.md item 23, INTEGRATED-REPORT.md §Launch and build, sprint21/OWNER-INVITATION.md, sprint16-playtest/
OWNER-INVITATION.md, PLAYTEST.md (historical).

## Handoff-freeze protection (before any run)

Sprint 27's lane r2 integrity stage failed because the handoff hook stamped HANDOFF.md's AUTO block during the run. Cause
read from ~/.claude/state/handoff_guard_projects.json: the engine worktree root was not in `roots`, so the HEAVY-LANE-LOCK
write blocker never applied to it (the records root was covered). Config change only (no hook code touched): the engine
worktree root added to `roots` (local/handoff_guard_projects.after.json; the prior file kept beside it as
handoff_guard_projects.json.bak-20261030). The Sprint 27 integrity failure stays recorded as it happened. No lane ran in
this task.

## Build

`npm run -s build` in the engine worktree at 18c3e8cf, clean tree, 20:51:05 CDT, exit 0 in 33 s (local/playtest-preview.log).
ui/dist: 49 files outside audio (sha256 list: local/playtest-build-manifest.txt); index.html
4f3ec83d0100b2c876adf54d22416b558e968d92f8266b1a12470f00ecf3da76; script chunk assets/index-Ck-8QeP7.js. ui/dist is
untracked and ignored; the engine tree stays clean.

## Server

`npx vite preview --config ui/vite.config.ts --host 127.0.0.1 --port 4180 --strictPort`, started 20:52:29 CDT as a
session background process (pid 37509), bound to 127.0.0.1 only. Port 4173 (vite's default) was already held by a foreign
node process (pid 33447), left alone. `curl http://127.0.0.1:4180/` → 200, 918 bytes, the same index.html sha256 as the
build. The server lives as long as this session; the copy-paste launch command is in OWNER-INVITATION.md.

## Launch check

1. Served build, isolated Chrome context (no profile, no storage; local/preview-launch-check.mjs): index sha256 equals
   the build's; the Start screen's title card, "Open the studio" and the save import box are visible; a seed and "Open the
   studio" reach the founding screen with "Found studio" visible; served chunk assets/index-Ck-8QeP7.js; zero page or
   console errors (screenshots/01-start.png, 02-founding.png).
2. The documented smoke journey (ui/e2e/smoke.spec.ts, installed Chrome, its own dev server on 5178 over the same
   source 18c3e8cf): 1 passed in 56.1 s (the full playable loop: assemble, greenlight, release, autopsy, save round-trip;
   local/playtest-smoke.log, playtest-smoke.json). Not rerun: the other seven journeys (the Sprint 26 evidence stands by source identity).
3. The two demonstration saves (sprint16-playtest/owner-saves/p18-season-world.json sha256 14b6271a…, week 428;
   p17-cameo-world.json sha256 95ed8887…, week 1872) import and validate on 18c3e8cf's engine (Save51, unchanged).

No private save was read, exported or published; the Owner's browser storage was not touched (isolated contexts only).
No repair was needed; no engine commit was made.

## Not claimed

Owner acceptance; that the game is good; a Firefox or Safari run; the native client.
