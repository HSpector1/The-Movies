# Architecture — Meridian 3D Vertical Slice (M0/M1)

Isolated, throwaway experiment. Renderer-neutral by design; owns no simulation truth.

## Boundary

```
Fixture StudioLotSnapshot  (src/fixtures/meridian.ts — trimmed copy, provenance in PROVENANCE.md)
        ↓  (host feeds snapshots; renderer never mutates state)
StudioLotRenderer interface  (src/renderer/StudioLotRenderer.ts)
        ↓
ThreeStudioLotRenderer  (src/renderer/ThreeStudioLotRenderer.tsx — React root over an R3F Canvas)
        ↓
Scene · camera · interaction · deterministic vignette  →  intent events (ready / building-selected /
        character-selected / building-action / return-to-overview)
```

This is the **same** contract the 2.5D Phaser lot satisfies, so one snapshot can
drive either renderer — the hybrid architecture the experiment validates.

## Modules (`src/`)

- `types/snapshot.ts` — fixture presentation types (BuildingId, StudioLotSnapshot, CharacterInfo).
- `renderer/` — `StudioLotRenderer` interface + `ThreeStudioLotRenderer` (mount/setSnapshot/focus/destroy).
- `app/store.ts` — tiny imperative store: mutable state read per-frame (camera, vignette,
  highlight) so animation never re-renders React; overlays subscribe via `useStore.ts`.
- `app/SceneApp.tsx` — R3F `<Canvas>`, golden-hour lights, camera rig, buildings, characters,
  vignette clock, perf meter, and the DOM overlay (dev panel + character card + building badge).
- `scene/layout.ts` — world layout in metres (scale sheet), building specs, ground zones,
  stage-A anchors, camera presets.
- `scene/Buildings.tsx` — greybox building meshes (primitives), ground/road/apron, water tower;
  hover/select → intents; neutral highlight.
- `characters/Characters.tsx` — 6 ambient role figures (loops) + 5 deterministic vignette actors
  + stage FX (recording light, interior spill, take flash) + apron gear. Click → inspect.
- `camera/CameraRig.tsx` — custom spherical rig: 3 presets with smooth lerp + clamped user
  orbit/dolly (no under-ground / top-down / off-section exposure); presets can snap for capture.
- `vignette/director.ts` — pure, deterministic ~22 s filming sequence sampled by time. No RNG.
- `vignette/rng.ts` — seeded RNG (unused by the vignette itself; available for cosmetic variation).

## Determinism

The vignette is a pure function of time (`sampleVignette(t)`), and there is **no
`Math.random`** anywhere. Ambient motion is a deterministic function of the scene
clock. Same fixture + same seek ⇒ same frame.

## Lifecycle

`mount()` creates a React root and renders the Canvas; `destroy()` unmounts it.
Verified: destroy→recreate leaves exactly one `<canvas>` (no leak). Pointer/wheel
listeners are added/removed with the rig's effect.

## What it deliberately is NOT

No integration, no GameState adapter, no persistence/save, no simulation, no
economy/talent/construction. Fixture-only, isolated, throwaway.
