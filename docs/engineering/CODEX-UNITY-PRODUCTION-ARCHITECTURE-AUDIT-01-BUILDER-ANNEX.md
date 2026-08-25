# Project: Studio — Unity Production Architecture Audit 01 — Builder Annex

**Companion to:** `CODEX-UNITY-PRODUCTION-ARCHITECTURE-AUDIT-01.md`

**Date:** 2026-08-25

**Audience:** P04A implementer, Unity/client maintainers, bridge maintainers, build/release reviewers
**Nature of this document:** implementation-oriented architecture evidence; not authorization to implement in this audit branch

## 1. Audit boundary and repository state

### Repositories inspected

| Repository/worktree | Branch | Inspected HEAD | State at audit | Treatment |
|---|---|---:|---|---|
| `/Users/bruce/Project Studio - Unity Production Convergence 80H` | `campaign/living-lot-client` | `2c8c747` | clean; seven local committed P03A/proof commits ahead of remote | read-only |
| `/Users/bruce/The Movies - Unity Production Convergence 80H` | `campaign/living-lot-ts` | `2ddf080` | clean; three local committed P03A commits ahead of remote | read-only |
| `/Users/bruce/The Movies - Github Push Test` | unrelated Package 12 documentation branch | not used as audit base | dirty with unrelated untracked owner work | untouched |
| isolated audit worktree under `/private/tmp` | `codex/unity-production-architecture-audit-01` | remote campaign baseline `1b3c527` before these docs | clean at start | only the two audit documents may change |

The active production branches were not switched, reset, stashed, merged, rebased, cleaned, imported, opened in Unity, saved, or modified. Local P03A commits were inspected because they are the actual implementation seam P04A will meet, but they were not copied into the documentation branch.

### Authority read

The main report synthesizes these current authorities:

- `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`
- `docs/adr/0002-typescript-simulation-authority.md`
- `docs/adr/0006-visual-recognizability-and-two-scale-camera.md`
- `docs/campaigns/LIVING-LOT.md`, including CP9/CP10/CP10A.1
- current convergence handoff/ledger material
- Package 02 World-First Interaction research and Builder Annex
- Package 03 Development research and Builder Annex
- Package 04 Casting research and Builder Annex
- P04A Implementation Reconnaissance
- Package 09 Studio Growth / Construction
- Package 11 Finance / Executive UX
- Package 12 Rival Studios / Hollywood Ecosystem
- actual current P03A TypeScript and Unity commits

The P04A reconnaissance statement that the accepted UI was scene/authoring plus IMGUI was accurate at its baseline and remains factually accurate in the current Unity project. The architectural recommendation changes because P04A is the first workspace whose retained, responsive, controller-aware scope would make another major IMGUI implementation predictably disposable.

## 2. Non-negotiable authority boundary

### TypeScript owns

- economy and affordability;
- RNG and seeds;
- time and calendar;
- identities and authoritative presence;
- talent, roles, films, productions, rivals, and staff state;
- legality, prerequisites, queue ordering, results, and consequences;
- campaign save/load and long-horizon history;
- quotes, digests, revisions, and accepted commands/intents.

### Unity owns

- 3D rendering, scene composition, animation, visual effects, and audio presentation;
- camera, selection raycasts, input-device translation, and controller focus;
- management UI composition and transient uncommitted form state;
- portrait/still rendering and future capture presentation;
- semantic presentation-key resolution to Unity assets;
- asset lifetime, pooling, LOD, visibility, and rendering performance.

### Forbidden seam violations

P04A C# must not calculate or persist Fit, availability, price, affordability, role legality, contract state, Screen/Camera Test outcome, Greenlight outcome, RNG, authoritative time, or save truth. It must not infer a missing person as present because an asset exists. It may format authoritative values, choose a layout, choose a visual variant permitted by the presentation catalog, and maintain local draft selection until an authoritative quote or commit occurs.

The preferred P03A protocol seam is:

```text
closed projection -> bounded query/quote -> revision/digest-bound opaque intent -> authoritative result -> refreshed projection
```

P04A should extend that pattern rather than introducing a second mutable bridge model.

## 3. Unity version and package inventory

### Editor

Evidence: `ProjectSettings/ProjectVersion.txt`

```text
m_EditorVersion: 6000.3.22f1
m_EditorVersionWithRevision: 6000.3.22f1 (1c726e1fb402)
```

Ruling: freeze this patch for the P04A feature window. Unity's [Unity 6 support page](https://unity.com/releases/unity-6/support) identifies 6.3 as LTS with support through December 2027. An editor upgrade is a separate validated change, never incidental to opening the project.

### Direct packages

Evidence: `Packages/manifest.json`; exact resolved dependencies in `Packages/packages-lock.json`.

| Package | Version/source | Use/ruling |
|---|---:|---|
| `com.coplaydev.unity-mcp` | Git tag `v10.1.2` | tooling only; no production architecture dependence |
| `com.unity.cloud.gltfast` | `6.10.3` | glTF ingestion/runtime support; keep until asset pipeline review |
| `com.unity.ai.navigation` | `2.0.14` | current navigation foundation |
| `com.unity.cinemachine` | `3.1.7` | production camera standard |
| `com.unity.ide.rider` | `3.0.40` | editor tooling |
| `com.unity.inputsystem` | `1.19.0` | production input standard; currently underused |
| `com.unity.nuget.newtonsoft-json` | `3.2.2` | bridge/JSON dependency |
| `com.unity.render-pipelines.universal` | `17.3.0` | production render pipeline |
| `com.unity.test-framework` | `1.6.0` | edit/play test foundation |
| `com.unity.timeline` | `1.8.11` | available for authored sequences/future cinematics; not a movie recorder |
| `com.unity.ugui` | `2.0.0` | installed exception UI option; no current Canvas roots |
| Unity modules | `1.0.0` | animation, audio, image conversion, JSON serialization, physics, terrain, terrain physics, UI |

Selected transitive packages include `com.unity.render-pipelines.core` `17.3.0`, Shader Graph `17.3.0`, Burst `1.8.30`, Collections `2.6.8`, and Mathematics `1.3.3`. Transitive Burst/Collections/Mathematics do **not** mean DOTS is installed. No `com.unity.entities`, `com.unity.entities.graphics`, or Addressables package is present.

## 4. Render-pipeline evidence

### Active asset chain

```text
ProjectSettings/GraphicsSettings.asset
  m_CustomRenderPipeline -> GUID of Assets/Settings/PC_RPAsset.asset

Assets/Settings/PC_RPAsset.asset
  renderer list/default -> Assets/Settings/PC_Renderer.asset

Assets/Settings/UniversalRenderPipelineGlobalSettings.asset
  RenderGraphSettings.m_EnableRenderCompatibilityMode: 0
```

This proves URP is active, the PC asset is the global default, and Render Graph compatibility mode is disabled. It is not an inference from scene appearance.

### PC pipeline asset

Evidence: `Assets/Settings/PC_RPAsset.asset`

| Setting | Serialized value / interpretation |
|---|---|
| Depth texture | enabled |
| Opaque texture | enabled |
| HDR | enabled |
| MSAA | `1` = 1x in the URP asset |
| Render scale | `1` |
| LOD crossfade | enabled |
| Main-light shadows | enabled |
| Additional-light shadows | enabled |
| Shadow atlas | 2048 |
| Shadow distance | 225 |
| Cascades | 4 |
| Soft shadows | high quality |
| SRP Batcher | enabled |
| Dynamic batching | disabled |
| GPU Resident Drawer mode | `0`, disabled |
| GPU occlusion | disabled |

### PC renderer

Evidence: `Assets/Settings/PC_Renderer.asset`

- `m_RenderingMode: 2`, the URP Forward+ renderer path;
- SSAO renderer feature enabled, intensity `0.4`, radius `0.3`;
- native render-pass support enabled;
- no evidence of a custom renderer pipeline or deferred mode.

Ruling: preserve. Forward+ is already operating and is the prerequisite rendering path for a later GPU Resident Drawer trial. Do not alter it inside P04A.

### Mobile tier

Evidence: `Assets/Settings/Mobile_RPAsset.asset` and `Assets/Settings/Mobile_Renderer.asset`

- Forward renderer (`m_RenderingMode: 0`);
- render scale `0.8`;
- HDR on;
- 1x MSAA in URP asset;
- 50 m shadow distance, one cascade;
- additional-light shadows and soft shadows disabled;
- SRP Batcher enabled;
- GPU Resident Drawer/GPU occlusion disabled.

Ruling: preserve as a secondary tier. The PC tier remains design authority.

### Quality and Player Settings

Evidence: `ProjectSettings/QualitySettings.asset` and `ProjectSettings/ProjectSettings.asset`.

- current quality index: `1`, PC;
- Standalone default: PC; Android/iPhone default: Mobile;
- linear color space (`m_ActiveColorSpace: 1`);
- new Input System only (`activeInputHandler: 1`);
- Standalone static batching enabled, dynamic batching disabled;
- GPU skinning and multithreaded rendering enabled;
- Quality Settings record anti-aliasing `4`, while the active URP asset records 1x MSAA.

The anti-aliasing mismatch must be resolved by an editor/runtime verification before a quality standard is documented. Do not assert 4x effective MSAA from Quality Settings alone; URP asset configuration is the stronger active pipeline evidence.

### Scene/render inventory

Evidence: serialized `Assets/Studio/Scenes/StudioLot.unity`, asset inventory, and project searches.

| Item | Count / state |
|---|---:|
| Scene file size | approximately 18 MB |
| GameObjects | 2,612 |
| MeshRenderers | 2,275 |
| SkinnedMeshRenderers | 128 |
| MonoBehaviours | 245 |
| LOD Groups | 27 |
| Lights | 11 |
| Cameras | 5 |
| Objects with static flags `86` | 2,172 |
| Objects with static flags `0` | 440 |
| Material assets | 75 |
| URP Lit materials | 73 |
| Custom proof shader material | 1 |
| built-in/other material | 1 |
| materials with instancing enabled | 73 |
| FBX | 10 |
| GLB | 124 |
| PNG | 26 |
| Animator Controllers | 24 |
| Prefab assets | 0 |
| Shader Graph / VFX Graph assets | 0 |

The 27 LOD Groups have no verified billboard terminal level. Texture mip streaming is disabled globally and was not enabled on the 26 PNG importers. Both are future content-scale policy items, not P04A prerequisites.

All five cameras serialize occlusion culling enabled, but no `OcclusionCullingData` asset was found. That is not proof of a baked occlusion solution. The lot is open, zoomable, and dynamically constructible; baked occlusion or GPU occlusion must be evaluated against representative views and churn.

The scene serializes 11 lights—eight type-0 directional, two spot, one point—and all 11 record `m_Lightmapping: 4` (realtime). `LightmapSettings.m_LightingDataAsset` is unassigned, so there is no verified baked-lighting data asset. Two important Volume profiles/objects include the global Golden Age volume and a local dark-stage treatment. Treat the unusual directional-light count as something to verify visually/profilingly, not silently normalize during Casting.

### Build entry

Evidence:

- `ProjectSettings/EditorBuildSettings.asset` enables only `Assets/Scenes/SampleScene.unity`;
- `Assets/Studio/Editor/Automation/StudioAutomationPaths.cs:9` defines `CanonicalSceneAssetPath = "Assets/Studio/Scenes/StudioLot.unity"`;
- `Assets/Studio/Editor/Automation/StudioAutomation.cs:135-147` validates and passes that canonical scene explicitly to `BuildPipeline.BuildPlayer` for macOS.

No Windows or Linux player-build automation was found; the only explicit target is `BuildTarget.StandaloneOSX`. Ruling: production automation is explicit and safe for its macOS lane, but interactive/default Build Settings drift and the broader PC target matrix is not yet automated. Foundation 0 must either align the scene list or clearly make automation the only supported production build entry, with a validator. Windows—and Linux if it becomes supported—needs a later clean-player proof lane. None of this requires a renderer change or blocks the Casting UI foundation. Do not change it in this audit.

### Performance proof already present

Recorded CP22 proof on M3 Max at 1440×900:

| Visible people | p95 frame | Draw calls | Additional recorded result |
|---:|---:|---:|---|
| 25 | 9.06 ms | 1,686 | — |
| 50 | 9.05 ms | 2,824 | — |
| 100 | 9.35 ms | 5,923 | 2.87 M triangles; 457 MB |

This demonstrates headroom on a high-end test machine while exposing poor draw-call scaling. It is not a target-hardware floor and does not report a portable GPU-frame budget. A much earlier visual spike recorded 32 people, 1,036 draw calls, roughly 375,000 triangles, 363.6 MB, and 119.7 FPS; it is historical context only.

## 5. UI inventory and classification

### Runtime `OnGUI` entry points

| File/class | Entry | Classification | P04A treatment |
|---|---|---|---|
| `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs` | `OnGUI` at line 1238 | workflow/memo/status; production-facing with editor diagnostics | preserve; separate debug later |
| `Assets/Studio/Runtime/Presentation/StudioHud.cs` | `OnGUI` at line 93 | selection receipt/current HUD | preserve |
| `Assets/Studio/Runtime/Presentation/StudioLivingTimeHud.cs` | `OnGUI` at line 139 | production-facing Living Time | preserve |
| `Assets/Studio/Runtime/Presentation/StudioFoundingCardHud.cs` | `OnGUI` at line 611 | production-facing founding dossier/contract/admin | preserve |
| `Assets/Studio/Runtime/Presentation/StudioDevelopmentCardHud.cs` | `OnGUI` at line 617 | P03A Department/Commission/Review | preserve; reuse protocol, not UI component |
| `Assets/Studio/Runtime/Presentation/StudioFoundingBeaconHud.cs` | `OnGUI` at line 166 | founding world/workflow affordance | preserve |
| `Assets/Studio/Runtime/Presentation/StudioCameraDirector.cs` | `OnGUI` at line 215 | inspection Back control | preserve behavior; future host may present it |

Logical meaningful player surfaces exceed the entry-point count because Founding and Development each multiplex several screens. A reasonable functional inventory is workflow/memo, selection receipt, time HUD, founding beacon, founding dossier/contract/admin layers, Development Department/Commission/Review, and inspection Back.

### Negative inventory

Project-wide serialized/source searches found:

- no `Canvas` component roots;
- no uGUI `Graphic`, `Button`, `ScrollRect`, or `EventSystem` production hierarchy;
- no TextMesh Pro runtime usage;
- no `UIDocument`, `PanelSettings`, `VisualElement`, UXML, USS, or UI Builder asset;
- no runtime UI Toolkit code;
- no gamepad focus graph or controller navigation implementation.

Legacy `TextMesh` appears on 13 static scene labels and runtime applicant/founding/Development nameplates/pennants. Preserve until a dedicated world-indicator system is justified.

### Current pointer arbitration

`Assets/Studio/Runtime/Presentation/StudioCameraInput.cs` owns `IsPointerOverUi`. It consults an EventSystem if one exists, then manually checks the screen rectangles and gesture latches exposed by current IMGUI surfaces. This is a valuable central concept but a fragile implementation boundary.

Foundation 2/3 must give the new UI host one central capture/focus signal that suspends world selection and camera gestures. Casting controllers must not add their own global rectangle checks.

### Minimum UI Toolkit production shell

This shell should contain only capabilities immediately exercised by Casting:

1. one runtime `PanelSettings` and `UIDocument`/host lifetime;
2. a shared visual token sheet for type scale, spacing, color, focus, disabled/warning/commit states, and safe areas;
3. workspace route/open/close contract;
4. explicit origin token for world/previous-workspace restoration;
5. wide/mid/narrow responsive classes around the Package 04 bands (including the 840/1200 design bands), proved at actual target resolutions;
6. keyboard/controller focus, directional navigation, default focus, focus restoration, and pointer/focus parity;
7. modal/confirmation layer and persistent action/header region;
8. scroll/list virtualization for candidate/history rows where data volume warrants it;
9. authoritative refresh/update adapter that avoids rebuilding the entire visual tree every bridge tick;
10. test hooks and stable element names without embedding gameplay law.

Do not first build a generic visual-framework package, editor theme tooling, every future chart, drag-and-drop system, or migration adapter for all legacy IMGUI. Casting is the vertical proof.

## 6. P03A collision analysis

### TypeScript seam to reuse

The local P03A TypeScript commits add `bridge/development.ts`, a commission quote route, digest/revision-bound opaque intent, and closed projection v9 behavior. The architectural reuse is the protocol shape and authority discipline.

### Unity seam to preserve but not generalize

`Assets/Studio/Runtime/Presentation/StudioDevelopmentCardHud.cs` is a substantial, feature-specific IMGUI component with local draft, quote, commit arm, Department/Commission/Review states, and Back. It does not establish a generic retained host or reusable navigation-origin service.

Therefore:

- do not subclass it for Casting;
- do not copy its IMGUI layout or input rectangles;
- do preserve its operational behavior and leave it mounted;
- do reuse/extend its authoritative quote/commit concepts at the bridge boundary;
- do use the new workspace/origin service in a way that can later host Development without requiring its immediate rewrite.

This is the critical difference between “reuse P03A” and “build P04A on P03A's UI technology.”

## 7. Camera inventory

### Authored runtime stack

Evidence: `Assets/Studio/Editor/Authoring/StudioLotAuthoring.cs` around lines 376–464 and `Assets/Studio/Scenes/StudioLot.unity`.

| Object/system | Current role | Ruling |
|---|---|---|
| `Player Management Camera` | main Camera with Cinemachine Brain | preserve |
| Cinemachine Brain | 0.85 s EaseInOut blend, unscaled time | preserve and validate workspace transitions |
| `Cinemachine Tycoon Overview` | priority 100 management virtual camera | standard overview |
| `TycoonCameraController` | pan, edge pan, orbit, zoom, Home and direct pose ownership | keep custom |
| `Cinemachine Human-Scale Inspection` | standby priority 10, promoted to 200 by director | standard inspection/focus rig |
| inspection target pivot | temporary focus/inspection target | preserve ownership/cleanup |
| `CinemachineDeoccluder` | inspection collision/occlusion | preserve; do not add blindly to management camera |
| `StudioCameraDirector` | focus, inspection, blend/state, input suppression, Back | canonical camera/origin seam |
| `StudioSelectionManager` | semantic ray selection, double activation, bounds focus fallback | canonical world selection seam |

Inspection Deoccluder settings include a mask excluding Ignore Raycast and Studio Selection, minimum target distance 1.25, camera radius 0.42, and preserve-height behavior. Normal management navigation has no equivalent collision system. That distinction is deliberate and should remain until a measured navigation problem exists.

Four disabled 1920×1080 canonical evidence/still cameras (A/B/C/D) are present in addition to the main Camera. They are proof/capture assets, not an implemented movie-camera system. A hero motion-picture camera in the lot is a world prop, not a video recorder.

### State/origin rules for P04A

- Opening Casting must record its prior workspace/world/camera origin explicitly.
- `Locate` is an explicit user action; an authoritative refresh must not move the camera.
- Locate may temporarily suspend/close the workspace, focus an authoritative-present person/building through the existing director, and preserve a Back token.
- Back from inspection restores the exact prior Casting context, selection, scroll/focus state where appropriate, and management camera state.
- If a target becomes absent or invalid, show an honest disabled/error state and retain the workspace; do not fabricate a body.
- Home remains a camera action, not an implicit workspace reset.

### Cinemachine future use

Use Cinemachine 3 virtual-camera/blend semantics for Star follow, set/production shots, premieres and awards. Keep management input and gameplay modes in project-owned controllers/orchestrators. Future film capture should bind shot definitions to dedicated virtual cameras/Timeline and capture cameras, not hijack `Player Management Camera`.

## 8. Input inventory and target maps

### Current facts

- package: Input System `1.19.0`;
- Player Settings: new Input System only;
- asset: `Assets/InputSystem_Actions.inputactions`;
- asset appears to contain template `Player` and `UI` maps/bindings;
- no runtime source/scene references consume that asset;
- `StudioCameraInput` reads `Keyboard.current`, `Mouse.current`, and `Touchscreen.current` directly;
- a compile-time legacy fallback exists but is not the selected player backend;
- no `Gamepad.current`, `PlayerInput`, serialized EventSystem, or `InputSystemUIInputModule` use was found.

### Canonical action architecture

Exact action names may be decided in implementation, but responsibilities must be centralized:

| Map/context | Example responsibilities |
|---|---|
| Global | Back/Cancel, Help, Pause, screenshot/accessibility shortcuts, device-change prompts |
| World | point/select, activate/inspect, Locate target, context action |
| Camera | pan, orbit, zoom, edge-pan enable, Home, follow/cancel-follow |
| UI | navigate, point, click, submit, cancel, tab/section, page, compare modifier |
| Debug | diagnostics/proof controls, disabled in production as appropriate |

One service owns active-map/context transitions. A modal confirmation suppresses world and camera actions except permitted Back; a full retained workspace suppresses world gestures while the pointer/focus is captured; inspection restores the prior context on exit.

Do not make each workspace enable/disable maps ad hoc. Do not make input prompts query devices directly. Rebinding and accessibility settings must serialize as player preferences, not campaign simulation state.

### Acceptance matrix

Test at minimum:

- mouse-only selection, hover, scrolling, drag/gesture conflict, Locate and Back;
- keyboard-only traversal, section changes, scrolling, confirm/cancel, focus restoration;
- Xbox-style gamepad directional navigation, submit/cancel, shoulder/tab movement, scroll/page, and prompt changes;
- device switching while Casting is open and while confirmation is armed;
- no world selection/camera movement through an occupied UI region;
- no duplicate events if UI Toolkit and a later uGUI EventSystem coexist;
- controller disconnect/reconnect with deterministic focus recovery;
- remapped actions and accessibility repeat/dead-zone settings.

## 9. RenderTexture and capture evidence

### Current portrait implementation

Evidence: `Assets/Studio/Runtime/Presentation/StudioApplicantPortraitCamera.cs`.

| Property | Current implementation |
|---|---|
| Render target | one lazy reusable `RenderTexture` |
| Dimensions | 256×320 |
| Format/depth | ARGB32, depth 16 |
| Camera | dedicated portrait Camera, FOV 26, near 0.05, far 12 |
| Isolation | layer 30; applicant child body renderers moved to that layer |
| Subject framing | actual applicant body; approximately 1.15 forward / 1.55 eye / look 1.48 |
| Idle behavior | camera disabled and texture cleared on Hide |
| Cleanup | target cleared, RT released and destroyed in `OnDestroy` |
| Concurrency | one visible portrait/channel |

The root retains selection layer 8 while child renderers are isolated. Signing/reset code restores matching layer-30 renderers to layer 0. That default-layer assumption and component-local mutation are the main correctness risks to eliminate in a shared service.

### Other capture code

Project search found six source files with RenderTexture use:

- applicant portrait camera;
- editor canonical capture;
- runtime evidence bootstrap;
- motion runner;
- stage proof runner;
- capture tests.

Some older proof paths call `Camera.Render()` manually. The stage proof runner uses `RenderPipeline.SubmitRenderRequest` with stronger lifecycle cleanup. The shared URP path should use the supported render-request API and have a compatibility fallback only if proved necessary.

No AsyncGPUReadback, VideoPlayer, Unity Recorder, video encoder, frame-sequence writer, audio capture, or movie playback implementation was found.

### Proposed `PresentationCaptureService` seam

This is an architectural contract, not prescribed class code:

```text
CaptureRequest
  kind: Portrait | FilmStill | HistoryThumbnail | Newspaper | AwardsPromo | ShotFrame
  subject/presentation key
  resolution/format/depth profile
  lighting/background/culling profile
  framing profile
  lifetime/priority

CaptureHandle
  GPU texture reference
  readiness/error/fallback state
  scoped release
```

Implementation constraints:

- bounded pool keyed by compatible descriptor;
- one owner for Camera/RenderTexture creation, loss/recreate, release, and destruction;
- no permanent layer mutation and exact restoration if temporary isolation remains necessary;
- explicit single-frame versus live-refresh policy;
- limit simultaneous capture cameras and update rates;
- do not enable post-processing or shadows by default without a profile;
- UI disposal must release handles;
- cancellation and subject disappearance must clean up deterministically;
- normal UI remains GPU-resident;
- CPU readback only behind a separately named export/encode path.

P04A needs portrait and possibly Camera Test still semantics only. Do not implement future shot-frame/audio/encoding machinery now.

## 10. Asset/content evidence and target boundary

### Current inventory

| Mechanism | Current state | Evidence/ruling |
|---|---|---|
| Addressables | absent | no package, settings, groups, labels, or API use |
| `Resources` | no content directory | only `Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf")`; acceptable built-in font lookup, not a content pipeline |
| `StreamingAssets` | `Assets/StreamingAssets/studio-lot-1948.json` | fixture/fallback data path; do not expand into production art delivery |
| AssetBundles | absent | no runtime bundle API |
| Direct scene references | dominant | acceptable for canonical convergence, not scalable catalog |
| Prefabs | zero prefab assets | production content workflow must introduce reusable prefabs rather than clone scene-embedded objects |
| ScriptableObjects | URP/Volume/settings only | no presentation catalog yet |
| `AssetDatabase` | editor authoring/validation/tests | keep editor-only |
| External sources | documented CC0 Kenney/Quaternius assets | governed by `PROVENANCE.md`; preserve source/adaptation separation |

### Presentation-key contract

TypeScript schema may include stable semantic facts:

```text
visualArchetype
era
semantic category
authoritative person/facility/film identity
allowed state such as constructed, damaged, filming, absent
```

Unity presentation catalogs may include:

```text
semantic key -> Addressable reference(s)
era/style/quality-tier eligibility
variant weights or deterministic presentation seed policy
fallback key
LOD/collider/rig/capture metadata
material/palette set
license/provenance catalog ID
```

Unity must not select a variant that changes gameplay bounds, capacity, cost, staffing, role legality, or outcomes without an authoritative semantic change. If a collider affects selection/navigation, it is presentation physics for the authoritative visual footprint, not a hidden game rule.

### Addressables grouping principles

- group by delivery/lifetime/update relationship, not solely by asset type;
- keep boot/core fallback content local and small;
- separate era/expansion content so unused decades are not automatically resident;
- avoid one bundle per asset and avoid a monolithic all-art bundle;
- label by semantic category/era/quality where useful, without making labels the TS contract;
- track dependencies and duplicate assets in CI/build analysis;
- release handles when districts/workspaces/capture subjects unload;
- test remote failure/fallback only if remote delivery is actually chosen;
- preserve stable presentation keys across vendor/source replacement.

Package installation, group creation, and mass migration are explicitly outside this audit and should not be hidden inside P04A. P04A must, however, call a resolver interface rather than hard-code production paths.

## 11. Art intake standard and visual catalog

### Required intake record

Every third-party or internally produced asset family should record:

| Category | Metadata/gate |
|---|---|
| Legal | vendor/source URL, creator, product/version, acquisition date/order evidence, license/EULA version, standard/restricted/provider terms, seat requirements, redistribution limits, attribution/third-party notices |
| Integrity | original archive/source path, hash, imported files, adaptation lineage, update/replacement history |
| Compatibility | tested Unity version, URP 17 compatibility, shaders/render features/packages, Render Graph constraints, platform/quality tier |
| Art direction | category, era range, style family, palette/material conversion, silhouette/proportion, hero/background status, allowed variants |
| Geometry | units/scale, axes, origin/pivots, bounds, topology, vertex/triangle count, submesh/material count, LOD levels and thresholds, impostor/billboard status |
| Interaction | collider type/count, navigation contribution, selection bounds, static/dynamic/construction eligibility |
| Characters | rig type, avatar, skeleton/bone count/naming, blendshapes, skin weights, animation clips/root motion, retarget proof |
| Textures/materials | maps, resolution, compression, mip streaming, estimated resident memory, texel density, shader keywords, material instances, SRP Batcher/instancing compatibility |
| Content system | semantic presentation key, Addressables group/labels, dependencies, fallback, expansion ownership |
| Review | technical reviewer, art reviewer, management/inspection/portrait captures, performance result, acceptance/exception/expiry |

### Asset-flip prevention gates

1. No direct vendor folder becomes production-visible without intake and adaptation review.
2. Source files remain preserved and adaptations remain separately attributable, continuing current `PROVENANCE.md` law.
3. Materials are converted into Project: Studio's controlled shader/material families.
4. Scale, pivots, collision, LOD, texture, rig, and memory budgets pass before catalog acceptance.
5. Art review covers both long management view and close inspection/portrait view.
6. Era fit is explicit; “old-looking” is not sufficient metadata.
7. Hero buildings/sets and recurring people require authored cohesion beyond marketplace defaults.
8. Replacements retain semantic keys so TypeScript and saves are unaffected.

## 12. Performance decision ladder

### Stage 1 — ordinary GameObject/URP discipline

Apply before adding a new runtime architecture:

- shared URP shader/material families and SRP Batcher-compatible property design;
- LOD Group/import validation by asset category;
- GPU instancing for genuinely repeated compatible meshes/materials;
- object/camera/capture pooling;
- no unbounded `Update`/`LateUpdate` per passive prop; central or event-driven updates where proven;
- Animator culling, update-rate and controller-complexity budgets;
- skinned mesh, bones, blendshape, and visible-person budgets;
- collider layer/count/shape and physics-query budgets;
- shadow-casting distance and per-quality light budgets;
- additive district/content lifetime when lot size earns streaming;
- bounded UI/bridge lists, queries, history paging, and diff/update discipline;
- mip streaming policy and texture-memory validation.

### Stage 2 — GPU Resident Drawer trial

Current state: off but supported by URP 17, PC Forward+, and compute-capable target platforms.

Trial only after representative art density exists. Compare:

1. current static batching on / GRD off;
2. static batching off / GRD on;
3. other combinations only if Unity version supports and profiler evidence warrants them.

Scenarios must include management overview, ground inspection, rapid pan/zoom, dynamic building creation/removal, 25/50/100+ visible people, vegetation/prop repetition, active portrait capture, and at least one production set. Record CPU render-thread, GPU, batches/draws, memory, build time/size, shader compatibility, and visual parity on low/mid/high PC targets.

Unity documents GRD as a BatchRendererGroup/GPU-instancing optimization for compatible MeshRenderers in large/repeated scenes, with platform, renderer, shader, and build-time constraints. See [GPU Resident Drawer](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/gpu-resident-drawer.html).

### Stage 3 — GPU occlusion trial

Only after GRD is a win. Render Graph and Forward+ are already present, but GPU occlusion additionally depends on GRD and scene/view characteristics. It may regress scenes without useful occluders. Compare open lot, dense built-out lot, street canyon/building clusters, inspection, and construction churn. See [GPU occlusion culling](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/gpu-culling.html).

### Stage 4 — isolated data-oriented renderer

Only if ordinary techniques and GPU-driven URP fail a measured target. Candidate scopes:

- distant/background crowd extras with no dossiers or individual gameplay interaction;
- repeated background traffic;
- vegetation fields;
- distant ambient set extras.

The prototype must be removable, bridge through stable semantic IDs, and not own simulation. Named people, selectable buildings, active productions, navigation authority, portraits, saves, and gameplay remain outside ECS unless a future independent audit proves otherwise.

### Explicit non-solutions

- Static batching does not solve dynamic/skinned people and can increase memory/build costs.
- Instancing-enabled material flags do not prove batches if meshes, materials, keywords, lightmaps, or render state differ.
- MaterialPropertyBlock is not a universal batching tool in SRP; it can remove SRP Batcher compatibility.
- Camera occlusion enabled does not mean baked occlusion data exists.
- RenderTexture pooling does not solve the cost of rendering extra shadowed/post-processed cameras.
- DOTS does not solve bridge payload, Animator, art-budget, or UI architecture problems by itself.

## 13. P04A implementation sequence

No implementation is authorized by this audit; this sequence is the recommended follow-on plan.

### Gate 0 — freeze and seam confirmation

1. Pin the editor/package baseline in the implementation handoff.
2. Re-run existing P03A TypeScript and Unity contract/proof tests from clean worktrees.
3. Confirm generated DTO version and exact `/quote`/intent seams.
4. Confirm whether P03A is still active before touching overlapping bootstrap/bridge/UI files.
5. Resolve ownership of shared bootstrap changes with Fable.

Proof: clean baseline and no generated DTO drift. Rollback: no production change.

### Gate 1 — minimum retained host

1. Add one UI Toolkit runtime host and PanelSettings.
2. Add tokens/theme and wide/mid/narrow root classes.
3. Add workspace lifecycle and explicit origin token.
4. Add modal layer, persistent header/action slot, and focus restoration.
5. Prove one Casting-shaped candidate-row/dossier slice with placeholder authoritative DTO data.

Proof: target widths, DPI/scaling, mouse/keyboard/controller, focus and Back. Rollback: remove/disable the new host; all IMGUI remains.

### Gate 2 — action/context input

1. Replace the template-only status with project-owned actions/maps.
2. Route camera sampling through the action adapter while preserving `StudioCameraInput` semantics.
3. Route UI navigation through the UI map.
4. Centralize world/UI/modal/inspection context changes.
5. Make pointer/focus capture visible to camera/selection arbitration.

Proof: device matrix and no leakage/duplicate events. Rollback: adapter boundary permits restoration of current camera facade while UI host is disabled.

### Gate 3 — authoritative Casting vertical slice

1. Add/extend closed Casting projection and bounded role/candidate/dossier queries.
2. Add quote/planning responses with revision/digest-bound opaque intent.
3. Bind screenplay/project header, role rail, candidate list, dossier, and comparison.
4. Add Screen/Camera Test planning/results and explicit Greenlight consequence/confirmation only as authorized by the Package 04 checkpoint boundary.
5. Never derive authority in C#.

Proof: stale revision, replay, affordability, absence, role switch, cancellation, repeated confirmation, and save/reload contract tests.

### Gate 4 — portrait capture seam

1. Extract lifecycle/pool/camera profile behind the capture-service interface.
2. Preserve current applicant framing as a regression fixture.
3. Bind the UI Toolkit dossier to a GPU texture handle.
4. Add absent/unavailable/failure fallback.
5. Add release/leak and repeated-subject tests.

Proof: image parity, layer restoration, no retained RT after close, bounded allocations. Rollback: service may delegate to the current component until parity is proven.

### Gate 5 — Locate/Back and responsive completion

1. Register Casting with the canonical camera/origin orchestration.
2. Prove Locate of building and authoritative-present candidates.
3. Restore workspace, role, candidate, comparison, scroll/focus, and camera origin through Back.
4. Complete wide/mid/narrow layouts and all device modes.

Proof: exact state-restoration matrix including target disappearance and authority refresh during inspection.

### Gate 6 — production asset resolver

1. Introduce semantic presentation-key interface and fallback behavior.
2. Add ScriptableObject-backed presentation records if chosen.
3. Install/configure Addressables only in a separately reviewed foundation change.
4. Migrate new P04 production assets first; leave existing scene/core references intact.

Proof: key replacement without TS/DTO change, missing-key fallback, dependency/lifetime/memory build analysis. Rollback: resolver maps bounded keys to direct core references until Addressables is ready.

## 14. Likely files/systems touched in implementation

This is a forecast, not permission to edit now.

### Preserve/extend carefully

- `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`
- `Assets/Studio/Runtime/Presentation/StudioBridgeBootstrap.cs`
- generated DTO sources and their generators/tests, never hand-edited generated output
- `Assets/Studio/Runtime/Presentation/StudioCameraInput.cs`
- `Assets/Studio/Runtime/Presentation/StudioCameraDirector.cs`
- `Assets/Studio/Runtime/Presentation/TycoonCameraController.cs`
- `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs`
- `Assets/Studio/Runtime/Presentation/StudioApplicantPortraitCamera.cs`
- `Assets/InputSystem_Actions.inputactions`

### New bounded systems likely required

- runtime presentation/workspace host;
- Casting UXML/USS/controllers/view models;
- action/context and prompt adapter;
- workspace-origin/navigation token;
- presentation capture service/profiles/pool;
- semantic visual-asset resolver and presentation catalogs;
- UI/input/capture/navigation tests and validators.

### Do not edit for P04A unless separately approved and proved

- `Assets/Settings/PC_RPAsset.asset`
- `Assets/Settings/PC_Renderer.asset`
- `Assets/Settings/Mobile_RPAsset.asset`
- `Assets/Settings/Mobile_Renderer.asset`
- `Assets/Settings/UniversalRenderPipelineGlobalSettings.asset`
- existing shaders/material families en masse;
- all current scene objects/prefabs through an Addressables conversion;
- current Founding/Living Time/Development IMGUI solely to share technology;
- any Golden tag or production worktree history.

## 15. Validation and proof matrix

| Concern | Required proof before acceptance |
|---|---|
| Authority | TS tests for legality/quote/commit/stale revision/replay/save; Unity tests assert display and intent only |
| DTO | generation is reproducible; C# DTOs match closed projection; unknown/missing fields fail safely |
| UI layouts | reference captures at wide ≥1200, intermediate, and narrow ≤840 design bands plus supported PC resolutions/DPI |
| UI focus | deterministic initial focus, directional graph, section/page navigation, modal trap, focus restoration |
| Input | mouse, keyboard, controller, device switch, rebinding, disconnect/reconnect, no world/camera leakage |
| Camera | overview pose preserved; Locate explicit; inspection collision; Back restores exact prior origin |
| Portrait | same authoritative body, framing parity, absent fallback, switch/open/close stress, RT/layer cleanup |
| Performance | UI update allocation/time, list virtualization, capture-camera cost, representative lot CPU/GPU/memory |
| Assets | semantic key fallback, no TS path/address, Addressables dependency/duplicate/lifetime analysis when adopted |
| Rendering | no URP/quality setting drift; screenshots and GPU timings for any later renderer toggle |
| Build | canonical scene and content catalog included by supported automation; clean-player smoke test |
| Accessibility | navigation without pointer, readable focus, scale/layout, contrast/token review, repeat/dead-zone policy |

## 16. Rollback boundaries

Every foundation change must remain independently reversible:

- **UI host:** route/feature flag can leave legacy IMGUI as the active surface; no legacy deletion in P04A.
- **Input:** action adapter feeds the existing input facade; one commit can revert source without camera rewrite.
- **Camera/origin:** additive orchestrator around the current director; no replacement of authored rigs.
- **Capture:** service can initially delegate to current portrait behavior; pool/lifecycle commits separated from visual changes.
- **Assets:** resolver interface precedes Addressables; direct fallback implementation remains until build/lifetime proof.
- **Renderer:** no P04 change. Later GRD/GPU occlusion experiments are settings/proof branches with baseline captures.
- **DOTS:** any future prototype lives behind a visual population interface and can be removed without saves or gameplay conversion.

## 17. Preservation checklist

Before P04A implementation starts, record that these behaviors remain green:

- the lot remains mounted through workspace interactions;
- Founding applicant selection, dossiers, portraits, signing, and authoritative presence remain operational;
- Living Time and workflow HUD remain operational;
- P03A Department/Commission/Review, quote, commit arm, and Back remain operational;
- selection receipt, double activation, bounds focus, inspection, Home, and camera restoration remain operational;
- authoritative absence never creates a fake body;
- bridge polling/refresh and closed projection remain the single presentation state path;
- current canonical scene validation/build/capture automation remains operational;
- current provenance/source separation remains intact.

## 18. Do-not-rebuild checklist

Reject a P04A design or code review if it introduces any of the following:

- another `OnGUI` Casting workspace;
- a Canvas-based parallel management framework without a proved UI Toolkit blocker;
- direct device polling in Casting;
- a second selection raycaster or camera director;
- implicit camera movement on projection refresh;
- local C# cost/Fit/availability/legality/RNG/outcome logic;
- mutable campaign ScriptableObjects;
- FBX/prefab/material/Addressable paths in TypeScript or DTO game semantics;
- one-off portrait RenderTextures owned independently by each dossier/card;
- PNG/JPEG portrait writes for normal UI;
- claims that film/video capture exists;
- Entities conversion of named people/buildings;
- renderer/package/editor upgrade bundled into Casting;
- deletion/migration of existing IMGUI before parity proof;
- changes to Fable's active worktrees or commits.

## 19. Architecture acceptance rulings by timing

### NOW BEFORE P04A

- freeze/verify Unity 6.3.22f1 and the current package/settings baseline;
- confirm active P03A bridge and bootstrap ownership;
- build the bounded UI Toolkit host;
- establish action-based input contexts and controller focus skeleton;
- define explicit workspace-origin Locate/Back contract;
- define semantic visual resolver and capture service interfaces.

### DURING P04A

- make Casting the first production UI Toolkit workspace;
- prove all responsive/device modes;
- extend the authoritative quote/intent protocol;
- generalize the portrait implementation behind the capture service;
- route all Casting assets through semantic presentation keys;
- use Addressables for new production art when Foundation 4 is ready, otherwise keep bounded direct fallbacks behind the resolver.

### AFTER P04A

- broad Addressables/prefab/content migration;
- opportunistic migration of an existing IMGUI surface only alongside feature value;
- target-PC quality tiers, shadow/light/texture-streaming budgets;
- shared Staff/Finance/Rivals workspace components proven from Casting rather than prebuilt speculatively;
- future film-still/history/newspaper/promotional capture channels.

### LATER IF PROFILED

- GPU Resident Drawer A/B;
- GPU occlusion after GRD success;
- impostors/additive district streaming;
- isolated Entities Graphics population;
- actual movie frame/audio capture and encoding after product requirements exist.

### REJECT

- HDRP or Built-in migration;
- PC Deferred migration without new measured evidence;
- whole-project UI rewrite;
- uGUI as the default management framework;
- IMGUI for new major workspaces;
- DOTS for named people/buildings/gameplay;
- Unity simulation authority;
- TypeScript knowledge of Unity asset paths.

## 20. Evidence index

### Project settings/assets

- `ProjectSettings/ProjectVersion.txt`
- `Packages/manifest.json`
- `Packages/packages-lock.json`
- `ProjectSettings/GraphicsSettings.asset`
- `ProjectSettings/QualitySettings.asset`
- `ProjectSettings/ProjectSettings.asset`
- `ProjectSettings/EditorBuildSettings.asset`
- `Assets/Settings/PC_RPAsset.asset`
- `Assets/Settings/PC_Renderer.asset`
- `Assets/Settings/Mobile_RPAsset.asset`
- `Assets/Settings/Mobile_Renderer.asset`
- `Assets/Settings/UniversalRenderPipelineGlobalSettings.asset`
- `Assets/Studio/Scenes/StudioLot.unity`
- `Assets/InputSystem_Actions.inputactions`
- `Assets/StreamingAssets/studio-lot-1948.json`
- `PROVENANCE.md`

### Principal runtime/editor classes

- `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`
- `Assets/Studio/Runtime/Presentation/StudioBridgeBootstrap.cs`
- `Assets/Studio/Runtime/Presentation/StudioHud.cs`
- `Assets/Studio/Runtime/Presentation/StudioLivingTimeHud.cs`
- `Assets/Studio/Runtime/Presentation/StudioFoundingCardHud.cs`
- `Assets/Studio/Runtime/Presentation/StudioDevelopmentCardHud.cs`
- `Assets/Studio/Runtime/Presentation/StudioFoundingBeaconHud.cs`
- `Assets/Studio/Runtime/Presentation/StudioApplicantPortraitCamera.cs`
- `Assets/Studio/Runtime/Presentation/StudioCameraDirector.cs`
- `Assets/Studio/Runtime/Presentation/TycoonCameraController.cs`
- `Assets/Studio/Runtime/Presentation/StudioCameraInput.cs`
- `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs`
- `Assets/Studio/Editor/Authoring/StudioLotAuthoring.cs`
- `Assets/Studio/Editor/Automation/StudioAutomation.cs`
- `Assets/Studio/Editor/Automation/StudioAutomationPaths.cs`

### Current official capability references

- [Unity 6 release support](https://unity.com/releases/unity-6/support)
- [URP Forward and Forward+ rendering paths](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/rendering/forward-rendering-paths.html)
- [URP Render Graph introduction](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/render-graph-introduction.html)
- [GPU Resident Drawer](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/gpu-resident-drawer.html)
- [GPU occlusion culling](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/gpu-culling.html)
- [UI system comparison](https://docs.unity3d.com/6000.0/Documentation/Manual/UI-system-compare.html)
- [UI Toolkit runtime event system](https://docs.unity3d.com/6000.0/Documentation/Manual/UIE-Runtime-Event-System.html)
- [UI Toolkit navigation events](https://docs.unity3d.com/6000.0/Documentation/Manual/UIE-Navigation-Events.html)
- [URP RenderTexture rendering](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/rendering-to-a-render-texture.html)
- [Addressables package](https://docs.unity3d.com/6000.0/Documentation/Manual/com.unity.addressables.html)
- [Material property batching behavior](https://docs.unity3d.com/6000.0/Documentation/Manual/DrawCallBatching-Properties.html)
- [Asset Store Terms](https://unity.com/legal/as-terms)

## 21. Builder handoff

P04A should begin only after Foundation 0 verifies the exact active P03A seam and Foundation 2 proves the smallest UI Toolkit host. It should then proceed as a vertical slice on the existing world/render/camera/bridge foundation, adding action-based input, shared capture ownership, and semantic asset resolution only to the degree Casting exercises them.

The most important implementation discipline is separation: new retained infrastructure beside preserved working IMGUI; Unity presentation beside TypeScript authority; semantic keys beside delivery addresses; frame capture beside movie encoding; ordinary GameObject rendering beside later optional high-volume accelerators. Those boundaries let Casting become the reusable pattern for Finance, Rivals, and Staff without making Casting pay for every future system in advance.
