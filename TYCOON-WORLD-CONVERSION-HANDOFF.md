# Tycoon World Conversion — Handoff

Sealed: 2026-08-17. Fable-led 12-hour autonomous shift executing the Owner's Tycoon
World Conversion mission. All six milestones ruled KEEP after personal PM playtests;
independently red-teamed before seal.

## Recovery coordinates

- Branch: `tycoon-world-conversion-12h` (remote `hspector-github`); resolve HEAD with
  `git rev-parse HEAD` — local and remote must match. Base: canonical `main`
  `2be66562aa9593fee79c370ea7ce6787ac88557f`.
- Launch: `npm install && npm run dev -- --host 127.0.0.1 --port 5173` →
  `http://127.0.0.1:5173/`. Grid tycoon world default-on (`tycoon-world` flag; `0` =
  painted plate; `operation-hollywood=0` = legacy lot — both rollbacks verified).
- Save: SaveFileV12 (V1–V12 import/migration; live V11 sessions upgrade with notice).
- Promotion: two-key rule. This branch does not self-merge to `main`.

## What materially changed (player-visible)

1. **The Lot is a tycoon property**: navigable isometric grid world (TycoonScene,
   28×26), whole-studio readability with status badges, wheel zoom at cursor
   (0.32–1.9, LOD text bands), drag/WASD/edge pan, one camera grammar (selection pans,
   never zooms; "Whole property [R]" HUD control).
2. **No click ejects**: every building and parcel lands an in-world inspector (live
   status, occupancy, who's-here, quick actions, explicit "Open deep details"
   secondary). Retained Commission/Audition/Package workspaces mount over the world;
   package→greenlight lands a PICTURE FORMED receipt without unmounting it.
3. **Build mode**: 10-parcel map (8 buildable); blueprint catalog (Development &
   Casting Annex — $780k, 13 weeks, +1 shared slot, $3,500/wk opex after completion);
   ghost preview with per-cell legality and live quote; commit debits immediately and
   paints a counting-down construction site; completion swaps in an operational
   building, real capacity, calendar and sim-stop truth. Multiple annexes legal.
4. **Presence**: `studioPresence(state)` — pure, save-neutral, 10-beat weekly timeline
   from existing truth. Building signs carry "• N here"; person panels quote
   "Developing X at Development & Casting, slot 1 · credited this week as Director";
   building panels list "Who's here this week"; week advances play the commute
   (skippable; reduced-motion instant; multi-week sims never animate skipped time).
   Companies physically relocate as phases advance (witnessed live: Development "2
   here" → "Stage A • 4 here · STAGE 7 · ON SCHEDULE").
5. **Evidence chain**: dual Playwright webServers (5178 plate-pinned history, 5179
   shipped grid), zero silently-skipped specs.

## New systems (where)

Engine: `src/core/lot.ts` (parcels), `src/core/placement.ts` + V12 save arm +
`placeFacility` action + TUNING blueprint catalog + weekly completion/opex in tick;
`src/core/presence.ts` (+ `'presence-v1'` RNG purpose); `studioCalendar` placement
events. UI: `ui/src/lot/tycoon/{TycoonScene,world,assets,palette,presence,playback}.ts`,
`ui/src/lot/{buildingInspector,buildMode}.ts`, `ui/src/lot/snapshot/presenceLines.ts`,
adapter completion-stop detector on the placement root.

## Gates at seal (all measured at the sealed tree)

- Repository vitest: **222 files / 3,019 tests, 0 failed**. Root + UI tsc clean.
  Production build passing.
- Playwright chromium: **187 passed / 0 failed / 4 env-gated GPU skips / 0 not run
  (191 total)** across both origins.
- Independent red-team (pre-fix HEAD `4f53e25`): **VERIFIED WITH CAVEATS — zero P0,
  zero P1**; all gate claims reproduced exactly; adversarial 15-minute chain stayed
  in-world on a fresh seed; byte-determinism proven (presence interleaving, save
  round-trips, identical replays); no test deleted/weakened shift-wide. Its P2 camera
  finding and two P3s were fixed and verified live before seal (`b06b9a4..d922fff`).
- Structural pin: grid managed-idle Week 0 = 173 objects / 14 actors / 8,545,720
  decoded bytes / 4 draws (per-fixture tables in `ui/playwright.config.ts`).
  No GPU wall-clock certification is claimed.

## Code-mining provenance

`CODE-MINING-LEDGER.md`: CorsixTH (MIT confirmed on disk) — clean-room reimplemented,
no code copied, no notice obligation incurred; OpenRCT2 (GPLv3 confirmed) — clean-room
prose specs only, donor source never opened by implementers. No donor assets.

## Known defects and honest limits

- Facility-capacity queues are latent in the shipped config (2 productions, 2 slots
  per capability): presence renders waiting/queues and is spec-proven from configured
  states, but normal play cannot reach one. Owner ruling needed (raise concurrency or
  scarcen capacity) — intersects open P5-dominance/cash-runaway residuals.
- Placed facilities have no first-class BuildingId; non-legacy completion receipts
  fail closed to truthful neutral feedback (accepted ruling).
- One engine Development & Casting facility renders as two buildings; bodies stand at
  Development (accepted M1.5 behavior).
- Palette leans olive vs the plate's warm ochre; back-lot sparse; construction-site
  caption/ghost legibility polished but unreviewed by an art pass (deliberate deferral
  — no visual P1 found by red-team).
- Pre-existing (proven on the plate too, not this shift's regressions): Escape after a
  background click doesn't close retained workspaces (Cancel works); 480×270/DSF2
  places the world below the fold; forced-colors cannot restyle canvas (DOM companion
  carries semantics).
- `studioLotSnapshot` (now carrying presence+calendar joins) is unmemoised — measured
  harmless today; watch on growth. D-17A fixed-cost allocator does not yet fold
  `facilityOpex` (needs its own authorization). Macroeconomy residuals of D-17B remain
  open and unreclassified.
- History scar: commit `b580bef` swept a parallel agent's in-progress files
  (`git add -A`); repaired forward, history not rewritten.

## Failed experiments

None killed this shift (six KEEPs). Standing prior kills remain in force: Stage-7
plate-adjacency NO-GO, autonomous procedural-premium-art dead end, 05H/05I rejection.

## Next five highest-leverage targets

1. First-class world identity for placed facilities → rich completion receipts,
   presence anchors, inspector parity.
2. The first visible queue: Owner ruling on concurrency/capacity, then presence
   waiting becomes live gameplay; measure the economy at the new scale (D-17B charter).
3. Shooting-week theater: scenery truck route during load-in, stage-door activity —
   make the assign→clear→schedule mini-loop a visible episode.
4. Second real blueprint (third soundstage) after the concurrency ruling; catalog UI
   is ready; then remeasure week-208/cash-runaway with real capex/opex.
5. Visual warmth pass (ochre shift, back-lot systemic dressing, annex sprite
   variants) against the Hollywood-plate reference, with art review.

## Reading order for the next agent

1. `TYCOON-WORLD-CONVERSION-LOG.md` (complete shift record: frozen targets, keep/kill
   rulings, playtests 1–4, red-team verdict, incidents)
2. `CODE-MINING-LEDGER.md`  3. `docs/SHIFT-OPERATIONAL-LAWS.md`
4. `AUTONOMOUS-MARATHON-HANDOFF.md` + `CURRENT-BEST.md` (prior-era law; see the log's
   authority reconciliation for what the Owner's mission superseded)
5. `git log --oneline` on this branch, then `git status` before changing anything.
