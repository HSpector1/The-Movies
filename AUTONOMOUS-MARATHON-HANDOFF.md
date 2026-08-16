# Project: Studio — Autonomous Marathon Handoff

Sealed: 2026-08-16

Status: **AUTONOMOUS MARATHON SEALED**

## Recovery coordinates

- Branch: `operation-hollywood-autonomous-marathon`
- HEAD: the commit containing this handoff; resolve exactly with `git rev-parse HEAD`
- Accepted behavior implementation: `e6426fcff8fec0744f9ce1bc9fe88f8d09d94ff9`
- Remote: `hspector-github` (`https://github.com/HSpector1/The-Movies.git`)
- Remote branch: `refs/heads/operation-hollywood-autonomous-marathon`
- Local annotated closure tag: `operation-hollywood-marathon-sealed` at the sealed branch HEAD;
  keep it local unless the Owner separately authorizes tag publication.
- Publication law: local and remote branch HEAD must match; never merge/push `main` or force-push.
- Protected `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`
- Accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`

## Launch

```bash
cd "/Users/bruce/The Movies - Autonomous Marathon"
npm install
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`. Studio Lot and Operation Hollywood default on. For a clean clone,
use `npm ci`. If an old QA browser deliberately rolled either feature back, remove the
`project-studio.flags.studio-lot-overview` and `project-studio.flags.operation-hollywood`
localStorage keys and reload.

## What the game now supports

- Deterministic studio simulation with SaveFileV11, deterministic V1–V11 import/migration,
  autosave, export/import, economy, talent/careers, release results, Film Autopsy, and Chronicle.
- A premium persistent Operation Hollywood Lot with pan/zoom, physical and semantic selection,
  accessible companion controls, named role-readable inhabitants, production/company switching,
  exact Stage 7/Annex/Gate/Administration/Scenery interactions, and authoritative week cadence.
- Managed Production Operations from Development through Release Ready with soundstage/Annex
  reservations, blockers, Calendar truth, theatrical run, Script Projects, Casting Sessions, and
  the one supported Development & Casting Annex construction lifecycle.
- A same-world filmmaking chain: commission a screenplay, resolve screenplay review, plan six
  camera-test reads, inspect six audition observations, form a package, greenlight, and see the
  exact picture/company form while the accepted Lot-retained paths keep one mounted world.
- Full supporting Dashboard, Writers Room, Casting Room, Assembly, Production Board/Calendar,
  Roster, Hiring, Finance, Talent Profile/Creator, Release, Autopsy, and Chronicle surfaces.

## Current screenshots

The reviewed evidence is intentionally in ignored local output, not source control:

`out/world-first-lot-retained-audition-planning-v1/01-desktop-planner-over-live-lot.png` through
`07-480x270-dsf2-complete-planner.png`.

Regenerate all seven from a clean checkout with:

```bash
npx playwright test --config ui/playwright.config.ts \
  ui/e2e/lot-retained-audition-planning-v1.spec.ts --project=chromium
```

## Final verification

- Focused Audition authority/workspace/Lot/selector: **39/39 passed**.
- UI: **117/117 files, 1,458/1,458 tests passed**.
- Repository: **204/204 files, 2,688/2,688 tests passed**.
- Governed D-16/D-17: **10/10 files, 176/176 tests passed**.
- Audition Chromium: **4/4 passed**; adjacent retained-host Chromium: **14 passed / one explicit
  pre-existing GPU-only skip**.
- Root + UI TypeScript: **passed**.
- Production build: **passed, 155 modules**, with the existing large-chunk advisory.
- Launch smoke: a fresh strict-port Vite 6.4.3 process started in 111ms and served both `/` and
  `/src/main.tsx`; the temporary server was stopped cleanly. The ordinary launch remains
  `http://127.0.0.1:5173/`.
- Save version: **SaveFileV11**.

## Known defects and honest limits

- No known launch, typecheck, test, save, or publication blocker remains.
- The production build retains its existing large-chunk advisory; no GPU/FPS wall-clock
  certification was run. Recorded renderer evidence proves structural parity only.
- Chromium is the accepted browser matrix for the final slice; Firefox/WebKit are not certified.
- Most standalone deep screens still unmount/remount the Lot. Exact same-mounted guarantees apply
  only to the contracted retained Package, Commission, and Audition paths.
- Hollywood Writers/Casting/Stage 12 remain semantic. There is no authoritative room, personal
  location, travel, occupancy, worker queue, workload, or performed-audition simulation there.
- Skipped time remains one synchronous Engine batch and one final snapshot; intermediate travel,
  rehearsal, shooting, Post, publicity, construction labor, and theatrical work are not watched.
- The frozen `*current-break-audit.spec.ts` remains historical pre-repair evidence and is excluded
  from the default accepted post-repair Playwright suite; replay it at contract commit `d94dd47`.
- At the inherited 480×270 compact boundary, the retained workspace is keyboard-accessible and its
  controls are pointer-proven; the pre-existing Lot semantic Casting entry itself has not received
  an independent compact pointer-certification claim.
- Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
  dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
  and formal G12 timing remain open.

## Owner rulings still required

None blocks this seal. These rulings are required only before future work:

- Authorization and scope for any successor milestone; the marathon itself authorizes none.
- Any Engine contract for physical Development/Casting facilities, reservations, occupancy,
  queues, clickable blockers, named-person destinations, or performed work.
- The authoritative facility/capacity/construction/placement/cost model before any new economic
  sink or fourth-slot decision.
- Any repair for the nine open macroeconomic residuals, within the standing prohibition on
  financing, loans, bailouts, restructuring, hard bankruptcy, the failure ladder, or an arbitrary
  cash sink.
- Whether GPU wall-clock and broader browser certification are worth a separately resourced gate.

## Next five highest-value product priorities

These are research priorities, not implementation authority:

1. Replay/instrument several minutes on the accepted Commission → screenplay review → Audition
   Planning → Casting review → Package → formation Lot chain and identify the next visible
   gameplay break.
2. Research authoritative physical Development/Casting facility, reservation, occupancy, queue,
   and clickable-blockage truth before creating a Hollywood room or route.
3. Make rehearsal, shooting, Post, and publicity watchable with named-person travel only after
   Engine tasks, destinations, and completion authority exist.
4. Measure retained same-world hosting for high-value deep surfaces such as Calendar/Production
   Board and Finance where it materially reduces menu replacement.
5. Instrument richer facility/capacity/construction capital and operating costs, then remeasure
   week-208 and cash runaway before proposing a believable size-scaling sink.

## Read these first in a new Claude/Codex session

1. `CLAUDE.md`
2. `AUTONOMOUS-MARATHON-HANDOFF.md`
3. `CURRENT-BEST.md`
4. `DECISIONS.md`
5. `PROGRESS.md`
6. `NEXT-HIGHEST-LEVERAGE.md`
7. `MARATHON-LOG.md`
8. `docs/D-17B-OWNER-RULINGS.md`
9. `docs/D-17B-CLOSURE.md`
10. `docs/WORLD-FIRST-LOT-RETAINED-AUDITION-PLANNING-WORKSPACE-V1-CLOSURE.md`
11. `docs/WORLD-FIRST-LOT-RETAINED-AUDITION-PLANNING-WORKSPACE-V1-EVIDENCE.md`
12. `docs/WORLD-FIRST-LOT-RETAINED-AUDITION-PLANNING-WORKSPACE-V1-CONTRACT.md`
13. `docs/LESSONS-LEARNED.md`
14. `docs/HANDOFF.md`
15. `START-HERE.md`

Then inspect `git status --short --branch`, `git log --oneline --decorate -20`, local/remote branch
HEADs, and all uncommitted files before changing anything.

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**
