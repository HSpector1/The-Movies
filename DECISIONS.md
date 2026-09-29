# Project: Studio — Current Decision Index

Updated: 2026-08-16

Branch: `operation-hollywood-autonomous-marathon`

Status: **AUTONOMOUS MARATHON SEALED — superseded by later Owner missions: the tycoon
world conversion (sealed `b58e6f8`) and the live first-movie-journey shift (branch
`first-movie-journey-v1`, see `FIRST-MOVIE-JOURNEY-LOG.md`, opened 2026-08-17 by Owner
order). Marathon-era "no successor" language below is historical.**

This is a compact routing index, not a replacement for the contracts, evidence, Owner records, or
canonical Lessons Learned.

## Owner rulings, 2026-09-29

Recorded word for word in
[1340-O](docs/engineering/playability-launch-review/evidence/p14b4-20260919/1340-O-owner-rulings-20260929.md).
The Owner said not to reopen these for routine implementation details.

- D-1329-1 rival stall: charter and implement bounded shelving of a Ready, unproduced screenplay; tuning provisional.
- D-1323-1 shared market: the 1323-A formula as amended by 1323-F; constants provisional; Wave 4 playtest.
- D-1312-1 conflict records: three distinct recorded casting competitions between the pair; evidence, not a tier.
- D-1312-2 romance ending: candidate A; sustained separation may decay the romance track and end the bond.
- HIS-014 labels: Mentor (first three qualifying pictures, one director); Professional Rivals (two competitions
  for the same casting slot). Labels decorate tiers and have no effect of their own.
- D-1339-1: the UI project's default `testTimeout` is 30,000 ms in `vitest.workspace.ts`. This stabilizes the test
  harness; it does not prove in-game performance.
- Order: the rival-stall correction and its verification come before shared-market pressure enters the live economy.

## Product doctrine

- **THE STUDIO LOT IS THE PRIMARY GAME SURFACE.** Management UI supports the world; it does not
  replace it.
- The preferred loop is `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME LIVE
  WORLD`.
- Engine/GameState owns legality, results, clock, reservations, facilities, economy, and RNG. The
  world renders that truth and emits intent; renderer motion is never simulation authority.
- Deep Dashboard, Assembly, Production Board/Calendar, Roster, Hiring, Finance, Film Autopsy,
  Writers Room, and Casting Room surfaces remain valid supporting depth.
- Same-mounted continuity is accepted only for the exact contracted paths. It is not a general
  persistent-shell promise for every screen.

## Current accepted authority

- Current accepted behavior: World-First Lot-Retained Audition Planning Workspace V1 at
  `e6426fcff8fec0744f9ce1bc9fe88f8d09d94ff9`.
- Frozen Audition contract: `d94dd4714ab6ee8e0666afba3aae9a714c578db4`.
- Prior retained Commission closure: `5cacd872a773910a18699b20cb5d4ab3c01a4821`.
- Save writer: **SaveFileV13**; import/migration supports V1–V13. (Corrected 2026-08-18: this line
  claimed V11 long after V12 and V13 shipped. Verified at `main` `1e6b422` — `makeSave` →
  `makeSaveV13`, `save.ts:4388`.)
- Protected `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`.
- Accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`.
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`.

## Economic ruling

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Open: cash runaway; top-studio economic immortality; week-208 synchronized roster wall; P5
dominance; world-led variance; cheap-film purpose; premium-film purpose; remaining menu breadth;
formal G12 timing.

Future work may investigate the week-208 roster wall and a believable size-scaling cash sink, but
must instrument the authoritative facility/capacity/construction systems first. Do not introduce
financing, loans, bailouts, restructuring, hard bankruptcy, the failure ladder, or an arbitrary
cash sink.

## Current world boundaries

- Hollywood Development/Writers, Casting, Theater, and Stage 12 remain semantic unless an accepted
  record says otherwise. Classic's established physical surfaces remain intact.
- The exact retained Package, Commission, and Audition workspaces preserve one mounted Lot. Other
  deep routes generally remount and promise only fresh authoritative return context.
- One skipped-week Engine batch exposes one final state. Do not claim skipped travel, occupancy,
  queues, rehearsal, shooting, Post, publicity, construction labor, or theatrical work was watched.
- Dynamic people are role-readable inhabitants, not unrestricted Sims autonomy or authoritative
  per-frame personal location.
- Structural parity is certified where recorded; GPU/FPS wall-clock certification is not.

## Publication ruling

The Owner authorized one normal push of `operation-hollywood-autonomous-marathon` to
`hspector-github` for durable backup. Never merge or push `main`, never force-push, and do not
push tags. Normal repository practice uses annotated tags for major closures, so the local sealed
checkpoint is tagged `operation-hollywood-marathon-sealed`.

## Future work

No future priority is implementation authority. The ranked research list is in
`NEXT-HIGHEST-LEVERAGE.md`; each successor requires fresh Owner authorization and a separately
frozen contract.
