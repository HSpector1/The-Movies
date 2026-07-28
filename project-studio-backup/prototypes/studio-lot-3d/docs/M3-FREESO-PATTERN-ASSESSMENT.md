# M3 — FreeSO / FreeSims Pattern Assessment

FreeSO/FreeSims studied as **architecture references only** — no source, no game data,
no proprietary assets imported. For each pattern: adopted / rejected, why, now-or-later.

## 1. Renderer / simulation separation — ADOPTED (now)
The renderer consumes a fixture `StudioLotSnapshot` and emits **intent events**
(`ready`, `building-selected`, `character-selected`, `building-action`,
`return-to-overview`); it owns no gameplay facts. Confirmed by the harness (no snapshot
mutation, no sim ownership, no `Math.random`). This is the load-bearing hybrid-
architecture pattern and stays.

## 2. Explicit routing portals — ADOPTED (now)
Building entrances are **explicit portals** tied to a visible open/closed state: the
soundstage door is a portal whose `doorOpen(t)` gates entry. Characters enter only at
the doorway waypoint and only while open; a closed door blocks the approacher (who
waits / reroutes). Routing data is authored (`layout.ts` footprints + `director.ts`
keyframes) and **inspectable/testable** — `window.__spike.validateRoutes()` asserts no
route crosses a footprint except through the open door. Preserved through the art pass.

**Gate-C extension (defect B):** static obstacles used by the composition — trees,
hedges, trailer, camera crane, lighting stands, gear, monitor — are now authored
**obstacle footprints** in `layout.ts` (`TREES`/`HEDGES`/`APRON_PROPS`, the single
source of truth for both the rendered scene and validation). `validateRoutes()` now
also asserts no ambient/vignette route and no apron-crew staging point crosses a tree/
hedge/prop footprint (`vegetationClear` / `propsClear` / `crewSpacingOk`), and enforces
apron-crew spacing. Still deterministic authored data — **not** a pathfinder.

## 3. Camera-state LOD — ASSESSED, minimal (deferred, with a hook)
The rig already exposes discrete camera states (overview / production / human), so
LOD *could* swap detail per state. **Decision: not built now**, per the brief's rule
("do not build an elaborate LOD framework unless the scene demonstrates the need"):
- The scene is small (one section, ~14 skinned crew, code-authored kit geometry, one
  shadow map). The M1 gray-box measured **~120 fps** on the owner's hardware with
  comparable cost; the M2 asset survey also held ~120 fps.
- The added M3 cost (crew + kit) is modest and **not yet measured on the owner's GPU**
  — headless software rendering is a floor only, not a verdict.
- **The honest LOD signal is the owner's M3 hardware fps.** If it falls below the
  budget (≥60, no sustained <50), the first lever is a character-proxy LOD: render the
  Kenney skinned crew only in production/human states and cheap capsule proxies at
  overview (the crew are barely legible at overview distance anyway). The
  `state.cameraGoal` / preset name is the switch point; `Crew` is already isolated so a
  proxy swap is localized.
- Rejected now: a general per-object LOD system (over-engineering for one section).

## 4. Preload & cache — ADOPTED (now)
- The only loaded runtime asset is the **Kenney character rig** (`character-a.glb`,
  ~113 KB). `useGLTF.preload(CHAR_URL)` is called at module load in `Crew.tsx`, so the
  rig + clips are fetched/parsed before the first camera transition — no first-use
  hitch on the transition the owner values.
- All hero buildings are **code-authored geometry** (no fetch/decode), so there is no
  large geometry decode during any transition.
- drei/`useGLTF` caches the GLTF; the shared rig is cloned via `SkeletonUtils.clone`
  (no re-fetch per character).
- Rejected: a bespoke asset manager — unnecessary at this asset count.

## 5. Shared character resources — ADOPTED (now)
One shared skeleton/geometry (the Kenney rig) is cloned for every crew member via
`SkeletonUtils.clone`; clips are shared; wardrobe is a per-instance material tint (not
a unique model). Materials come from the shared library. **No unique rig per background
character.** Documented per-character cost: one skinned draw + a small hat/prop + a
mixer; ~14 in the scene.

## Summary
| Pattern | Verdict | When |
|---|---|---|
| Renderer/sim separation | Adopted | now |
| Explicit routing portals | Adopted | now |
| Preload & cache | Adopted | now |
| Shared character resources | Adopted | now |
| Camera-state LOD | Assessed, deferred (hook noted) | later, iff owner hardware fps needs it |

No FreeSO/FreeSims code or data was copied — patterns only.
