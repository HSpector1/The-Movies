# Studio Greybox Inventory (Scene D)

Everything in Scene D, tagged by origin: **bespoke greybox** (temporary original geometry),
**CC0 reusable** (pipeline assets), or **authored look** (materials/lighting/signage).

## Facilities & structures (bespoke greybox — `src/components/greybox.tsx`)

| Element | Notes |
|---|---|
| `Soundstage` | barrel/arched roof (classic stage silhouette), big ribbed loading door, personnel door, "SOUND STAGE" band + "STAGE 1" plaque, rooftop HVAC/vents |
| `ProductionOffice` | medium-rise cream office, parapet roofline, two window bands (glass), entrance canopy + brass posts + steps, "ADMINISTRATION" sign |
| `EntranceGate` | two piers + brass caps + sign beam, "MERIDIAN / PICTURES" canvas sign |
| `GuardBooth` | booth + window + canopy + boom barrier |
| `WaterTower` | splayed legs + cross-braces + tank + "MERIDIAN" band + conical roof + finial (the memorable silhouette) |
| `BacklotFacade` | painted "CAFE" storefront flat with windows + door, wooden braces behind (reads as a flat) |
| `SceneryFlat` | braced scenery flat |
| `LotGround` / `Paving` / `Road` / `Sidewalk` / `StagingMark` | authored-material ground, roads, walks, painted staging ring |

## Production dressing (bespoke greybox)

`ProductionTruck` (cab + box + MERIDIAN logo + wheels), `Cart` ×2, `FilmLight` ×3 (tripod +
head + warm emissive lens), `CrateStack` ×3, `Bench` ×2, `Banner` ×2 ("NOW FILMING",
"QUIET STAGE 1").

## Landscaping (bespoke greybox)

`Tree` ×4 (trunk + stylized icosahedron foliage), `Planter` ×3.

## CC0 reusable assets (pipeline, `public/assets/`)

| Asset | Use | Provenance |
|---|---|---|
| `downtown/Prop_Bollard` ×2 | entrance drive | CC0 (Quaternius) |
| `downtown/Prop_Planter_Single` ×2 | courtyard/gate | CC0 (Quaternius) |
| `animation/UAL1_Standard.glb` | the crew character (skinned) | CC0 (Quaternius) |

(All CC0 pieces pass through the same Lab 01 pipeline and now carry the `vertexColors=false`
fix.)

## Visible life — 9 CC0 crew (`src/components/Workers.tsx`)

Deterministic placement + clip + tint (no RNG). Clips used from the CC0 43-clip library:

| # | Activity | Clip |
|---|---|---|
| 1,2 | standing / talking (office) | `Idle_Talking_Loop` |
| 3 | sitting (bench) | `Sitting_Idle_Loop` |
| 4 | repair / maintenance (soundstage) | `Fixing_Kneeling` |
| 5 | carrying / interacting (cart) | `PickUp_Table` |
| 6 | waiting (stage door) | `Idle_Loop` |
| 7 | waiting / talking | `Idle_Talking_Loop` |
| 8 | walking (drive) | `Walk_Loop` |
| 9 | standing (entrance) | `Idle_Loop` |

Each crew member is a `SkeletonUtils.clone` with its own `AnimationMixer`, a deterministic
phase offset, and a cloned+tinted material so shirts vary. **No simulation** — no schedules,
needs, relationships, or logic.

## Authored look

- **Material family** (`src/lab/materials.ts`): asphalt, concrete, sidewalk, curb paint, brick,
  cream/warm painted walls, terracotta accent, brass, soundstage metal, dark metal, glass,
  foliage, trunk, crate, tarp, roof felt, sign — a warm golden-hour palette.
- **Signage**: `makeSignTexture` / `signMaterial` draw text to a canvas (system fonts, no
  network) → readable studio identity, stage numbers, banners, logos.
- **Lighting/atmosphere** (`src/components/env.tsx`): shared low warm sun, warm directional key
  + cool rim + warm hemisphere fill + procedural `RoomEnvironment` IBL, procedural `Sky`, warm
  fog. All offline-safe.

## Camera (`src/lab/cameraBridge.ts`, `src/camera/CameraController.tsx`)

Presets: Overview, Entrance, Soundstage, Courtyard, Human Scale, Reset.
