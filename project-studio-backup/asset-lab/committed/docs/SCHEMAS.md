# Proposed Schemas (contract §10) — RECOMMENDATIONS ONLY, NON-INTEGRATED

Three proposed data shapes for *if* Project: Studio ever adopts external art assets. **These
are recommendations. They must not enter the main game.** They import nothing from `src/core`,
define no simulation behaviour, and are written here as reference TypeScript, not as shipped
code. They deliberately keep the program's load-bearing split: **presentation data never
becomes a source of simulation truth.**

The `SetPackage` shape is informed by the legacy *The Movies* `.ini` set schema recovered in
WINTERSETS-ARCHAEOLOGY (the *idea* of how a set bundles presentation + sim + gating), and by
the Quaternius asset structure this lab inventoried.

---

## 1. `AssetDefinition` — one importable art asset

```ts
/** A single runtime art asset (a building, prop, character, or set-piece). Presentation
 *  metadata only. Carries NO simulation numbers. */
export interface AssetDefinition {
  id: string                       // stable, e.g. "downtown/Building_Small_1"
  kind: 'static' | 'skinned' | 'prop' | 'setpiece'
  runtime: {
    format: 'glb'                  // GLB is the runtime standard (FBX/glTF are intake only)
    url: string                    // served path, e.g. "/assets/downtown/Building_Small_1.glb"
    fileKB: number
  }
  source: {
    pack: string                   // "downtown-city-megakit"
    originalFormat: 'gltf' | 'glb' | 'fbx'
    author?: string                // "Quaternius"
  }
  provenance: {
    license: 'CC0' | 'ATTRIBUTION-REQUIRED' | 'PROTOTYPE-ONLY' | 'LICENSE-UNCLEAR' | 'DO-NOT-USE'
    reuse: 'reusable' | 'prototype-only' | 'excluded'
    evidence?: string              // where the license was read, e.g. "License_Standard.txt (CC0)"
  }
  geometry: {
    sizeMeters: [number, number, number]   // local AABB; 1 unit = 1 m
    triangles: number
    materials: number
  }
  authoring: {
    unit: 'meter'                  // Studio requires metres; importer normalises otherwise
    up: 'y'
    grounded: boolean              // origin at base (min.y = 0) after normalisation
  }
  tags?: string[]                  // "building" | "modular" | "road" | "streetprop" | ...
}
```

Rationale: a renderer can consume this to place and display an asset; a content pipeline can
gate it by `provenance.reuse`; nothing here can be mistaken for game state. This is exactly
what `manifests/runtime-assets.json` already is, formalised.

## 2. `SetPackage` — a filmable set / lot location (presentation bundle)

Mirrors how the legacy game bundled a "set," but split so simulation fields (if any) live
elsewhere and are *referenced*, never embedded as truth here.

```ts
/** A set / location a scene can be filmed on. PRESENTATION bundle. Any economy/lifecycle
 *  numbers are references to sim-owned config, not authoritative values. */
export interface SetPackage {
  id: string                       // "set/office_1940s"
  displayName: string
  assets: {
    shell: AssetDefinition['id']           // the main set-piece asset
    dressing: AssetDefinition['id'][]       // props placed in it (each an AssetDefinition)
    backdrop?: AssetDefinition['id']
  }
  presentation: {
    introCamera?: CameraPath                // the legacy ".cam" idea: a keyframed intro pan
    thumbnail?: string                      // set-picker image
    lighting?: 'day' | 'night' | 'interior' | 'golden-hour'
    weather?: { rain?: boolean; snow?: boolean; fog?: boolean }
  }
  eraHint?: { earliestYear?: number }       // presentation-only era flavour (NOT gating)
  /** Pointer to sim-owned config; the SetPackage never stores the authoritative numbers. */
  simRef?: {
    economyKey?: string            // resolves in the engine's TUNING/economy, not here
    lifecycleKey?: string
  }
}

export interface CameraPath {
  keys: { t: number; pos: [number, number, number]; target: [number, number, number] }[]
}
```

Rationale: the legacy `.ini` proved a set needs presentation (mesh, backdrop, camera, thumb)
*and* simulation (finance, maintenance, gating, genre). Project: Studio's architecture forbids
a renderer owning sim truth, so `SetPackage` holds presentation and only **references** sim
config by key (`simRef`) — the engine remains the single source of those numbers.

## 3. `AnimationClipDefinition` — one clip from a shared library

```ts
/** One animation clip on a shared skeleton (e.g. the Quaternius UAL character). */
export interface AnimationClipDefinition {
  id: string                       // "walk"
  clipName: string                 // exact glTF clip name, e.g. "Walk_Loop"
  library: AssetDefinition['id']   // the GLB providing skeleton + clips
  role?: 'idle' | 'walk' | 'talkingIdle' | 'seated' | 'interaction' | 'repair'
  durationSeconds: number
  loop: boolean
  rootMotion: boolean              // baked-root-motion vs in-place variant
  provenance: AssetDefinition['provenance']
}
```

Rationale: matches the two-variant (in-place / root-motion) library actually shipped, maps the
six roles Studio cares about to concrete clip names, and carries provenance so a
prototype-only clip can never be shipped by accident. This is what the app's role→clip map and
`manifests/runtime-assets.json.clips` already encode, formalised.

---

## Non-integration statement

These interfaces exist only in this document. They are not exported from, imported into, or
referenced by the main game, either spike, or any contract. Adopting any of them is a separate,
owner-authorised decision.
