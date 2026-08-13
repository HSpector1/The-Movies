# Operation Hollywood — Phase II engine bridge

## Result

The Studio Chronicle district now runs inside the production React + Phaser application on
`operation-hollywood-autonomous-marathon`. Its integration authority is merge
`4432a9befef578ac3549896c2796bf0a22950ec0`, which joins the accepted D-17B economy state to the
Operation Hollywood source without rewriting either history.

Enable both development gates:

```bash
VITE_STUDIO_LOT_OVERVIEW=1 VITE_OPERATION_HOLLYWOOD=1 npm run dev -- --host 127.0.0.1
```

The legacy D1 lot remains available when `VITE_OPERATION_HOLLYWOOD` is absent. The marathon worktree
is isolated; no protected source worktree was switched, reset, or cleaned.

## Architecture selected

The bridge uses a four-tier hybrid district, not a screenshot with invisible buttons and not
an object-per-prop reconstruction.

| Tier | Runtime representation | Cost in this slice |
| --- | --- | ---: |
| 0 baked world | one authored district plate | 1 display object |
| 1 state/occlusion | tight truck, camera-dolly, and gate masks; activity/selection graphics | 7–9 objects |
| 2 ambient life | pooled role sprites plus a stateful arrival car | 13 actors |
| 3 managed people | real contracted or active-production identities from the lot snapshot | snapshot-dependent |

The asset source is `art/hollywood/district-manifest.source.json`. The deterministic exporter
`tools/hollywood/export_district.py` validates the 1586×992 source, emits the Tier-0 plate,
crops every occluder to tight alpha bounds, and writes the runtime manifest. That manifest
owns places, polygons, anchors, affordances, activity requirements, visual states, routes,
depth bands, and decoded texture-memory cost.

`StudioLotSnapshot` remains the only truth boundary. Raw Talent objects and hidden ability values
still never cross into Phaser. Production Operations V1 now projects the authoritative film,
phase, countdown, facility, director, shooting-task status, blocker, progress, and currently legal
command. Managed studios expose only people attached to a real active production; the bridge no
longer fabricates Mara Voss or a picture when the studio is idle. Legacy studios remain explicitly
labelled and read-only in this surface.

## Hard depth proof

`street-to-stage-7` deliberately changes actor depth across six route anchors:

```text
street 30 -> behind truck 30 -> past truck 50 -> behind camera 56 -> past camera 78 -> stage 82
```

The environment is drawn at base `0`, truck `40`, camera dolly `70`, gate foreground `90`.
An authoritative production's routed director is therefore actually occluded and revealed by
semantic layer ordering while walking; the effect is not a CSS mask or a pre-rendered animation.

## Interaction mapping

### Soundstage 7 — authoritative shooting activity

The React host renders the exact Production Operations snapshot and dispatches only its
`currentCommand`. Core accepts or rejects that command; the application replaces and autosaves the
whole state only after success. The next snapshot then repaints both React and Phaser.

An exact engine reservation for Soundstage 7 maps to the authored Stage 7 district. When the
snapshot changes from `unassigned` to `blocked`, Phaser may animate that production's real director
along the authored route as visual acknowledgement. Route position and wall-clock time never alter
the engine task. Blocked, ready, scheduled, and completed saves load directly into their persisted
visual state, and no render-loop timer can complete a take.

An exact Soundstage 12 reservation remains Soundstage 12 in the production inspector. Because this
district plate contains only Stage 7, Soundstage 12 uses an honest inspector fallback and never
starts the Stage 7 route. With no managed production, the scene says the lot is idle.

### Administration/Publicity — second reusable activity

The same manifest vocabulary stages Publicity from data: place, publicity affordance, talent,
publicist, photographer, queue-forming/flash/press-moving visual states. Its command invokes the
real D-17B `publicity` core action through `ui/src/engine/adapter.ts`. A verified live run changed:

```text
cash       $20,000,000 -> $18,800,000
awareness  40.0 -> 40.8
ledger     + one studio-level publicity entry
cooldown   publicity.lastUsedWeek / byTier.whisper updated
```

Because GameState is replaced by the action result, cash, standing, ledger, cooldown, and V8
production operations are saved by the existing session/save system. This is the second unit
proving the scene vocabulary is not a Stage-7-only anecdote.

## Performance

Final live Chromium/Phaser acceptance at 1920×1080 on 2026-08-13:

| Metric | Measured |
| --- | ---: |
| FPS | 106 |
| Display objects | 26 |
| Dynamic actors | 13 |
| Decoded authored texture memory | 8.7 MB |
| Static authored environment draws | 4 |
| Target / hard floor | ≥50 / ≥30 |

The runtime panel also records rolling frame, worst frame, update, worst update, render estimate,
and renderer draw-count when Phaser exposes it. The overlay keeps the player-facing readout terse.
The engine bridge clears both the aspirational target and hard floor in the acceptance session.

## Evidence

- `out/operation-hollywood/HOLLYWOOD-NORTHSTAR.png`
- `out/operation-hollywood/HOLLYWOOD-PRODUCTION.png`
- `out/operation-hollywood/HOLLYWOOD-NORTHSTAR-vs-PRODUCTION.png`
- `ui/src/lot/hollywood/hollywood-bridge.test.ts`

Verification:

```text
typecheck: clean
production build: clean, 118 modules transformed (existing large-chunk advisory only)
full repository suite: 120 files / 1,557 tests passed
UI suite: 61 files / 558 tests passed
D-16 governed harness: 10 files / 176 tests passed
authoritative chain: snapshot command -> core action -> successful state replacement -> fresh snapshot
cosmetic route: exact Soundstage 7 unassigned -> blocked transition only; never advances core
live publicity: $1.2M paid, awareness +0.8, state replaced
live production: director called -> scenery cleared -> take scheduled -> SaveFileV8 reload -> release
```

## Five largest remaining parity losses

1. Dynamic people are readable 54×74 period sprites, but lack the facial/cloth fidelity of the
   north-star’s baked figures at closer zoom.
2. Stage entry currently resolves at the threshold; there is no separately authored stage
   interior transition/cell.
3. One authored district camera is proven; parcel placement and alternate camera quadrants need
   additional compatible plates/cells.
4. Construction/upgrade/era evolution is supported by manifest visual states but only the
   shooting and publicity variants are authored here.
5. Lighting is rich because it is baked; time-of-day variants and animated light spill need
   alternate authored plates or overlay maps.

## Remaining visual move

Author one empty/construction/completed state for the Scenery Annex and one 1950s overlay pack
(cars, signage, clothes, equipment) through this exporter. If those land without scene-specific
TypeScript, the visual-state and era promises are both proven. Then replace the generated actor
textures with an offline-rendered 4-direction role atlas while retaining the same managed-person
and activity contracts.

The next engine-owned marathon slice is Script Projects V1. That work is separate from this visual
recommendation and must preserve the snapshot boundary established here.
