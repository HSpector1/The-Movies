# Gate D1 — Studio Lot Functional-Foundation Closure

Owner-approved closure record for Gate D1. Gate D1 is approved as the functional Studio
Lot foundation. It is **not** approved as the final production art direction.

- Merged from branch: `gate-d-studio-lot-d1`
- Final D1 source HEAD: `8302490` (merge of D1 `94a1f5b` + D-13 main `9ea3dda`)
- Pre-sync recovery tag: `gate-d1-pre-d13-sync` (peels `94a1f5b`)
- Main baseline at approval: `9ea3dda`
- Studio Lot Spike reference (untouched): `studio-lot-spike @ 3806ef6`

## 1. Purpose of D1

D1 proves the technical and product foundation for a spatial Studio Lot:

```
GameState
  → authoritative adapter selector (studioLotSnapshot)
  → immutable StudioLotSnapshot
  → React host and accessible companion navigation
  → Phaser presentation
  → navigation intentions back to existing React screens
```

The point of the gate was to prove this pipeline end to end without moving any simulation
truth into the renderer, and without committing to final art.

## 2. Approved functional behavior

- fixed isometric overview;
- truthful building and stage states;
- independently keyed Stage A and Stage B;
- truthful release presence;
- presentation-only Phaser layer;
- navigation-only LotAction contract;
- lazy loading;
- feature flag;
- accessible companion navigation;
- keyboard operation;
- reduced-motion support;
- responsive fit-to-lot behavior;
- UI-session-only selection restoration;
- no simulation truth owned by Phaser.

## 3. Owner-observed functional evidence

- moving vehicles;
- decorative crew activity;
- one and two occupied productions;
- correct production titles;
- correct available/occupied restrictions;
- Theater now-showing state;
- correct React routing.

## 4. Visual classification

`Approved functional Studio Lot shell, not approved final art direction.`

## 5. Temporary visual elements

The following remain replaceable presentation assets:

- procedural building geometry;
- roads and landscaping;
- simple signs;
- decorative vehicles;
- crew silhouettes;
- stage props;
- current palette;
- current on-canvas typography;
- current ambient presentation.

## 6. Explicit non-blockers

The following do not block D1 closure:

- basic Studio sign;
- static streetlights;
- subtle or absent visible steam/exhaust;
- generic building architecture;
- lack of Asset Lab characters;
- lack of final authored props;
- lack of final production textures;
- no decision-required state, which remains deferred until truthfully supported in D2.

## 7. Future Art integration plan

Production-art integration is planned but separately governed. The future sequence is:

a. Art PM defines the approved production visual direction.
b. Art PM selects candidate assets and directs the Art Builder.
c. Engine and Art establish an integration boundary.
d. Assets pass visual, scale, performance, fallback, accessibility, and runtime-ownership
   gates.
e. Engine Builder integrates approved assets without moving simulation truth into the
   renderer.
f. Owner performs explicit visual and runtime approval before production adoption.

## 8. What D1 closure does NOT authorize

D1 closure does not authorize:

- merging or cherry-picking Art branches;
- Asset Lab 05E character integration;
- GLB runtime integration;
- renderer migration;
- free-camera exploration;
- pathfinding;
- autonomous characters;
- needs or schedules;
- facility mechanics;
- construction;
- D2 production/release presentation.

## 9. Retained technical contracts for future Art integration

Preserve:

- authoritative StudioLotSnapshot;
- React ownership of navigation and accessibility;
- renderer presentation-only behavior;
- data-driven building coordinates;
- fit-to-bounds camera behavior;
- semantic building states;
- fallback navigation without premium assets;
- reduced-motion behavior;
- proper loading, disposal, and lifecycle ownership.
