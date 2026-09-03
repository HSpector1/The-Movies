# Project: Studio — Living-Lot Soundscape 01

**Document status:** PROTOTYPE DESIGN AUTHORITY

**Soundscape duration target:** 600 seconds per deterministic run

**Rendered audio status:** PLANNED UNTIL EVIDENCE-LINKED

**Gameplay authority:** NONE

**Human listening status:** PENDING

## Intent

The living-lot soundscape must make Project: Studio’s campus feel inhabited even when music is disabled. It presents a coherent acoustic world at three zoom/detail levels while respecting a strict rule: zoom and distance change only what the listener can hear. They do not invent Production activity, blocker status, machinery availability, era, or results.

The pilot uses five explicit lab fixtures. They are test inputs, not claims about campaign truth. A future integration must consume typed P05/P06 lot-activity and P13 eligibility projections supplied by their owners.

## Design goals

- Sustain at least ten minutes without becoming a wall of noise.
- Preserve a stable campus identity across Wide, Medium, and Close.
- Make each zoom perceptibly distinct within a few seconds without changing the underlying fixture.
- Leave intelligibility space for radio voice, PA/help, UI, and important-sound captions.
- Use silence, low event density, and masked distance as authored material.
- Avoid creating constant “busy studio” evidence when the upstream fixture is idle or blocked.
- Express era through eligible machinery, traffic, room, and production practices—not a universal noise/filter layer.
- Keep one-shot events sparse, localized, deterministic, and concurrency-limited.
- Remain satisfying in `Music Off`, `Force Mono`, `Speech First`, and Night/Limited Dynamic Range presets.

## Acoustic zoom contract

### Wide

Wide presents the lot as one campus-scale field:

- distant city and road wash;
- soft exterior air and weather-neutral environmental movement;
- sparse building ventilation and electrical plant;
- distant stage or workshop leakage only when the fixture permits it;
- occasional remote cart, delivery, or human movement;
- long quiet spans and no constant foreground transients.

Wide is not a collage of every available sound. Its average event density is the lowest of the three layers, and its transients are softened by distance, obstruction, and lower gain.

### Medium

Medium exposes zones without pretending the listener is inside each room:

- office cluster and corridor activity;
- workshop and construction leakage;
- Stage exterior/interior leakage;
- loading bay, carts, deliveries, and backlot movement;
- era-eligible machinery beds and intermittent work cycles;
- stronger lateral distinction than Wide, with fewer simultaneous zones than a literal simulation might produce.

At any moment, one or two zones may lead while others fall to bed level or silence. Zone choice is seeded and fixture-constrained.

### Close

Close presents local, material interactions:

- doors and latches;
- tools and work surfaces;
- cloth, canvas, paper, and set dressing;
- camera/support equipment handling;
- footsteps differentiated by surface rather than by invented character identity;
- carts, cases, props, and set movement;
- room-specific air and short reflections.

Close is not louder Wide ambience. It uses fewer concurrent events, more direct sound, clearer material detail, and a localized room/position. A close event requires an explicit fixture location; it cannot imply a person, task, or result that the fixture did not provide.

## Five lab fixtures

All fixture records carry `source: LAB_FIXTURE`, a stable fixture ID, a deterministic seed, and an explicit statement that they are non-authoritative.

| Fixture ID | Upstream proposition represented for testing | Wide presentation | Medium presentation | Close presentation | Forbidden inference |
|---|---|---|---|---|---|
| `LOT-IDLE-01` | No active Production fixture; routine campus availability only | City/road and campus air lead; buildings mostly quiet; rare distant movement | Office ventilation, isolated door/corridor pass, one occasional service-zone event | A few maintenance-neutral details such as paper, latch, cloth, or a single footstep pass | Do not invent filming, construction, success, distress, or a full workforce |
| `LOT-ACTIVE-PRODUCTION-01` | A broad active Production fixture supplied by the lab | Campus bed plus bounded stage/workshop leakage and remote vehicle movement | One active Stage zone, one support zone, occasional cart/delivery; deterministic rests | Camera/support handling, cloth/set movement, footsteps, door, tool events tied to the fixture location | Do not infer schedule progress, legality, quality, stars, scene content, or outcome |
| `LOT-LOAD-IN-01` | A load-in activity fixture | Distant vehicle arrival/departure and campus air; no endless engine loop | Loading bay leads; carts/cases and Stage exterior alternate; workshop mostly secondary | Wheels over surface, case latch, set handling, door, short footsteps; safe concurrency | Do not infer what Production is loading, whether it is on time, or whether placement succeeds |
| `LOT-BLOCKED-PRODUCTION-01` | A blocked Production fixture supplied upstream | Campus continues; stage leakage reduced; environmental continuity prevents dead-world silence | Reduced work cycles, paused cart/handling activity, quiet office/workshop bed | Intermittent waiting-room/material details, sparse footsteps, no alarm layer | Do not invent blocker cause, blame, danger, failure, cancellation, or resolution |
| `LOT-CLOSE-STAGE-INSPECTION-01` | Listener fixture at a close Stage inspection location | Wide bed remains faint and stable outside | Stage room/adjacent corridor dominate; exterior zones attenuate | Room air, cloth, camera/support gear, local footsteps, door and set handling with generous gaps | Do not invent authoritative Stage occupancy, specific scene action, dialogue, or inspection result |

## Ten-minute deterministic form

The soundscape is interactive, but an evidence run uses a fixed 600-second scenario so traces and renders are comparable. The example form below is a scheduler plan, not proof of a completed render.

| Time | Fixture | Default zoom | Presentation purpose |
|---|---|---|---|
| `00:00–01:15` | `LOT-IDLE-01` | Wide | Establish campus identity with music absent and restrained event density |
| `01:15–02:30` | `LOT-ACTIVE-PRODUCTION-01` | Wide → Medium | Reveal activity through permitted stage/support leakage rather than a global volume jump |
| `02:30–03:45` | `LOT-ACTIVE-PRODUCTION-01` | Medium → Close | Demonstrate material detail while preserving the same underlying fixture |
| `03:45–05:00` | `LOT-LOAD-IN-01` | Medium | Shift zone ownership to loading bay and cart/case activity, with rests |
| `05:00–06:15` | `LOT-BLOCKED-PRODUCTION-01` | Medium | Reduce work cycles without ominous scoring or false causality |
| `06:15–07:30` | `LOT-BLOCKED-PRODUCTION-01` | Wide | Show that the campus remains alive while the Production fixture is blocked |
| `07:30–09:00` | `LOT-CLOSE-STAGE-INSPECTION-01` | Close | Present room-specific Stage detail and important-sound caption examples |
| `09:00–10:00` | `LOT-IDLE-01` | Close → Medium → Wide | Return to stable campus bed and a natural open ending |

Interactive controls may change zoom or enable/disable layer families during a run. They do not change the fixture. Fixture changes occur only through an explicit lab control or future typed upstream event and are logged separately from zoom changes.

## Layer and event architecture

| Layer class | Loop/one-shot | Maximum simultaneous voices | Typical recurrence | Bus | Notes |
|---|---|---:|---|---|---|
| `CAMPUS_BED` | Long loop or deterministic tiles | 2 | Continuous with slow variation | `AMBIENCE` | Foundation; must survive Music Off without calling attention to its loop |
| `CITY_ROAD_DISTANT` | Long loop/tiles | 1 | Continuous or long rests | `AMBIENCE` | Kept low and spectrally separate from speech |
| `BUILDING_ZONE` | Loop/tiles | 2 | 20–90 second windows | `AMBIENCE` | Fixture and zoom eligible; crossfades between zones |
| `MACHINERY_CYCLE` | Loop/one-shot sequence | 1 | 30–180 seconds | `ACTIVE_SFX` or `AMBIENCE` by salience | Requires explicit P13 eligibility; never selected from date locally |
| `VEHICLE_CART` | One-shot/short sequence | 1 | 30–150 seconds | `ACTIVE_SFX` | Direction, distance, and fixture constrained |
| `DOOR_LATCH` | One-shot family | 1 | 20–120 seconds | `ACTIVE_SFX` | Important caption only when mechanically meaningful upstream |
| `TOOLS_HANDLING` | One-shot family | 2 | 10–90 seconds | `ACTIVE_SFX` | Avoid rhythmic machine-gun repetition |
| `CLOTH_SET` | One-shot family | 2 | 8–60 seconds | `ACTIVE_SFX` | Low transient, supports Close detail |
| `CAMERA_SUPPORT` | One-shot family | 1 | 20–120 seconds | `ACTIVE_SFX` | Generic equipment handling; era eligibility required for specific devices |
| `FOOTSTEPS` | Seeded short sequence | 1 sequence | 25–150 seconds | `ACTIVE_SFX` | Surface/space identity only; no invented named character |
| `ROOM_AIR` | Long loop/tiles | 1 | Continuous in Close | `AMBIENCE` | Replaces rather than stacks with excessive campus detail |

Global recommended caps are four simultaneous ambience beds and four salient active-SFX voices, with lower caps in Night and Speech First. Limits are prototype mix parameters rather than facts about how many activities exist.

## Zoom mixing behavior

Zoom is a crossfade among presentations of the same fixture, not a hard scene change.

| Parameter | Wide | Medium | Close |
|---|---:|---:|---:|
| Campus identity bed | Primary | Supporting | Faint continuity |
| Zone definition | Diffuse | Primary | One local zone only |
| Direct material detail | Rare | Occasional | Primary |
| Transient density | Low | Medium | Low-to-medium, highly separated |
| Stereo width | Broad but mono-safe | Zone-shaped | Localized and room-specific |
| Distance filtering | Strong | Moderate | Minimal, asset-dependent |
| Typical crossfade | 2–5 s | 2–5 s | 2–5 s |

Force Mono is applied at the mix output/preset layer and must not change event eligibility. Zoom must remain distinguishable in mono through density, direct-to-room ratio, spectral distance, and event choice rather than stereo position alone.

## Era and activity variants

Era variants are catalogue eligibility tags, not locally calculated years. An asset may declare compatible creative aliases and a neutral fallback class.

- Campus wind, room air, cloth, generic footsteps, and non-specific doors may be broadly eligible when provenance supports it.
- Vehicle, camera, communications, power, recording, projection, and workshop machinery require narrower eligibility.
- The soundscape scheduler receives an allowed set from P13 in a future integration; in the lab it receives an explicit fixture set.
- If no era-compatible asset is available, omit the event or use an approved materially neutral ambience. Never substitute an adjacent era silently.
- Future-facing `legacy_future_2030_2040` assets must be marked `EXTRAPOLATIVE`.

Activity only gates presentation opportunities. The absence of a sound does not mean the absence of authoritative activity, and hearing a decorative sound cannot create gameplay state.

## Source and synthesis policy

The optional official Stable Audio Small-SFX MLX route may be used only after its exact code/model/weight revisions, terms posture, required download size, hashes, and no-new-acceptance status pass the project gate. If it does not pass, the pilot continues using:

- deterministic procedural beds and UI-independent synthesis;
- clearly identified existing eligible prototype sources;
- documented silent/placeholding catalogue rows for unavailable ambience/SFX.

Every generated or derived file is external to Git and retains `PROTOTYPE_ONLY`. Raw authorities are never normalized or overwritten in place. Derivatives identify their source and exact hash.

## Scheduler rules

- Use a presentation-only seed distinct from game RNG.
- Precompute candidate event windows for the 600-second evidence run.
- Enforce fixture, zoom, era eligibility, cooldown, voice limit, and recent-history constraints before selection.
- Avoid identical event-family repetition within a configurable window.
- Vary gaps deterministically; avoid periodic “every N seconds” signatures.
- Coalesce rapid zoom changes and crossfade to the latest target.
- On pause/focus loss, freeze logical event history and resume through an explicit policy rather than replaying recent one-shots.
- On device reset, rebuild beds at deterministic phase where supported; never double-fire active one-shots.
- Speech ownership reduces or suppresses competing beds and salient transients according to mix preset.
- Radio disabled does not alter ambience scheduling.
- Music density affects score only, not the existence of the lot world.

## Silence and fatigue controls

- No layer family has a requirement to fire during every scheduling window.
- At least one zone rests at any time in Medium presentation.
- Close one-shots use category cooldowns and variation bags.
- Distant traffic and ventilation avoid prominent short loop periods.
- High-frequency tools, reversing beeps, alarms, whistles, horns, and shouting are absent from the decorative default.
- Warning sounds occur only through the management/functional system, never as ambient flavor.
- Repetition and crest-factor proxies are machine checks only; ten-minute and long-session comfort require listening.

## Captions and non-audio equivalence

Decorative ambience does not require continuous captions. Important-sound captions are emitted only when a sound represents an upstream meaningful event and must include source context, for example `[Stage door closes]` or `[PA announcement begins]`. The corresponding visual/text state must already exist or be resolved from the same typed payload.

Captions must not infer unseen people, causes, or outcomes. A decorative cart pass should not be captioned as a delivery completion. Transcript history is reserved for spoken items, while important-sound caption history may record meaningful non-speech events.

## Required evidence and acceptance

Before claiming completion, the pilot must link:

- a 600-second scheduler trace and, where feasible, mixed demonstration;
- exact catalogue and source hashes for every scheduled asset;
- separate Wide, Medium, and Close stems or event traces used only as evidence layers—not claimed as production stems;
- fixture and zoom transition timings;
- peak, loudness, voice-count, silence-window, and repetition metrics;
- Music Off, Force Mono, Night, and Speech First traces;
- missing-file and hash-mismatch fail-closed results;
- deterministic replay comparison;
- Owner feedback on ambience quality, zoom distinction, era fit, irritation, and fatigue.

This design document does not assert that those renders or tests currently exist. Machine proof cannot establish acoustic realism, historical correctness, cultural acceptance, or long-session satisfaction.
