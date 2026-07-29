# Asset Lab 05 — Owner Review Guide

A bounded milestone on branch **`asset-lab-05-blender-pipeline`**, backed up, **not merged**. This is
the gate. Please review, then rule.

## Fastest path to see it (no Blender needed)

The Blender-authored assets are committed, so the vertical slice runs on a fresh checkout:

```bash
cd "/Users/bruce/Project Studio - Asset Lab"
npm install
npm run build && npm run preview      # open http://localhost:4320  → boots on Scene G
```

In the viewer, **Scene G · Blender art (Lab05)** is the whole slice: soundstage assembled from the
modular kit + apron + dressed props, with the six Blender crew each playing a CC0 clip. Toggle
**Crew** off/on, **Wireframe** on (silhouette), and switch **A–F** to compare against the earlier
labs (all untouched).

If you have Blender 5.2 and want to see the factory regenerate everything from source:

```bash
npm run blender:factory   # build all 23 assets + hero set + asset library + validate (~15 s headless)
npm run blender:validate  # independent Node re-check of every GLB vs the manifest
```

Open `blender/libraries/studio_assets.blend` and point the **Asset Browser** at `blender/libraries/`
to drag any cataloged character / module / prop into a scene.

## What to look at (evidence, no tools)

- `proof/lab05/01-overview.png` … `07-human-scale.png` — the slice from several angles.
- `proof/lab05/03-soundstage.png`, `04-crew-working.png` — set + animated crew + props.
- `proof/lab05/08-wireframe.png`, `09-set-only.png` — silhouette + layer breakdown.
- `proof/lab05/11-anim-t0.png` vs `12-anim-t1.png` — same view, two moments → animation is live.
- `proof/lab05/thumbnails/` — the 23 per-asset thumbnails the factory auto-renders.
- `manifests/studio-assets.json` — every asset's tris, LOD tris, collision, dims, bone-compat.
- `manifests/studio-validation.json` — independent Node validation (23/23).

## The claims, so you can check them

1. **Animation compatibility** — all 6 crew GLBs carry the 65-bone UAL skeleton and play the 43 CC0
   clips unchanged. *Check:* `npm run blender:validate` (joints column = 65 for every character).
2. **Scale + budgets** — 1 u = 1 m; crew ~2–2.5 k tris, set ~4.2 k tris. *Check:* the manifest.
3. **Deterministic factory** — `npm run blender:build` rebuilds all 23 assets headless, seeded-only.
4. **Isolation** — no game logic, no protected-repo access, no section-11 non-goals. *Check:* the
   `blender/` python is asset authoring only.

## The gate — please rule

Suggested outcomes:

- **Pass** — the factory + slice are a sound foundation; authorize scaling content in a later milestone.
- **Pass with notes** — accept, with specific art/fidelity notes to fold into the next pass.
- **Revise** — a named issue must change before this is a foundation to build on.

## Explicitly NOT done (by design / awaiting your word)

- **Not merged.** Branch is backed up (`HSpector1/The-Movies`); merge is your call.
- **Not final art.** Representative slice at greybox-plus fidelity, not shipping identity characters.
- **No scaling.** Only a representative subset of the designed kit (8 of 14 modules, 9 props, 6 roles)
  — enough to prove the factory. Building the full catalog is a *future* milestone, on your go.
- **No integration.** Nothing wired into the sim or any protected repo (see the integration note).
