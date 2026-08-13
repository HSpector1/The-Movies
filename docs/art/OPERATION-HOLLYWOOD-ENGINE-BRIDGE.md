# Operation Hollywood — Phase II engine bridge

## Result

The Studio Chronicle district now runs inside the production React + Phaser application on
`operation-hollywood-engine-bridge`, based on committed integration authority
`b3881678ea18d3ef101f5bb59c0aa0ea83340f53`.

Enable both development gates:

```bash
VITE_STUDIO_LOT_OVERVIEW=1 VITE_OPERATION_HOLLYWOOD=1 npm run dev -- --host 127.0.0.1
```

The legacy D1 lot remains available when `VITE_OPERATION_HOLLYWOOD` is absent. No existing
worktree was changed or reset.

## Architecture selected

The bridge uses a four-tier hybrid district, not a screenshot with invisible buttons and not
an object-per-prop reconstruction.

| Tier | Runtime representation | Cost in this slice |
| --- | --- | ---: |
| 0 baked world | one authored district plate | 1 display object |
| 1 state/occlusion | tight truck, camera-dolly, and gate masks; activity/selection graphics | 7–9 objects |
| 2 ambient life | pooled role sprites plus a stateful arrival car | 13 actors |
| 3 managed people | Mara/active director and a real engine talent identity | 2 actors |

The asset source is `art/hollywood/district-manifest.source.json`. The deterministic exporter
`tools/hollywood/export_district.py` validates the 1586×992 source, emits the Tier-0 plate,
crops every occluder to tight alpha bounds, and writes the runtime manifest. That manifest
owns places, polygons, anchors, affordances, activity requirements, visual states, routes,
depth bands, and decoded texture-memory cost.

The existing `StudioLotSnapshot` remains the only truth boundary. It gained narrow named-person
display facts; raw Talent objects and hidden ability values still never cross into Phaser.
Active-production directors/leads are projected from real productions. Mara Voss is explicitly
marked `district-managed`: the current GameState has no physical-task domain, so her spatial task
is presentation truth. This is the smallest honest interface until physical schedules become
save-authoritative.

## Hard depth proof

`street-to-stage-7` deliberately changes actor depth across six route anchors:

```text
street 30 -> behind truck 30 -> past truck 50 -> behind camera 56 -> past camera 78 -> stage 82
```

The environment is drawn at base `0`, truck `40`, camera dolly `70`, gate foreground `90`.
Mara is therefore actually occluded and revealed by semantic layer ordering while walking; the
effect is not a CSS mask or a pre-rendered animation.

## Interaction mapping

### Stage 7 — Shooting activity

1. Select Mara or an active-production director.
2. `Assign to Stage 7` emits accepted.
3. Mara travels with named cues: behind truck, behind camera, enter stage.
4. Stage 7 changes from HOLD to DIRECTOR CALLED.
5. The scenery bottleneck interrupts her at the camera mark with a named reason.
6. `Clear scenery load-in` changes the activity to equipment staged / ready.
7. `Call for Take 12` changes the stage to ROLLING, then TAKE 12 PRINTED.

This is the C&C chain: intent → acknowledgement → destination → movement → interruption →
player correction → visible result.

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

Because GameState is replaced by the action result, the cash, standing, ledger, and cooldown are
saved by the existing session/save system. This is the second unit proving the scene vocabulary
is not a Stage-7-only anecdote.

## Performance

Live Chromium/Phaser capture at 1280×720 on 2026-08-13:

| Metric | Measured |
| --- | ---: |
| FPS | 59–60 |
| Display objects | 30 |
| Dynamic actors | 15 |
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
production build: clean (existing large-chunk advisory only)
lot + adapter regression: 15 files / 155 tests passed
Hollywood contract: 1 file / 4 tests passed
live chain: select -> assign -> travel -> blocked -> clear -> ready -> Take 12 -> complete
live publicity: $1.2M paid, awareness +0.8, state replaced
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

## Next production move

Author one empty/construction/completed state for the Scenery Annex and one 1950s overlay pack
(cars, signage, clothes, equipment) through this exporter. If those land without scene-specific
TypeScript, the visual-state and era promises are both proven. Then replace the generated actor
textures with an offline-rendered 4-direction role atlas while retaining the same managed-person
and activity contracts.
