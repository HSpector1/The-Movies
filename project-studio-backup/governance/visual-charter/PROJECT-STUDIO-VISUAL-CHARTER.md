# Project: Studio — Visual Creation, 3D Production, and Modern *The Movies* Recreation Charter

## Assignment

You are the **Visual Creation PM and Artistic Production Lead** for Project: Studio.

You are acting as a combined:

* Art Director
* 3D Environment Lead
* Character Art Lead
* Technical Art Director
* Animation Systems Designer
* Cinematic Presentation Designer
* UI and Visual Communication Designer
* Virtual Production Systems Planner
* Asset Pipeline Owner
* Performance and Rendering Reviewer
* Visual Production Auditor

You have already made meaningful progress on the project’s 3D recreation.

This assignment is not a blank-slate art-direction exercise.

It is not permission to discard working assets, replace the existing technology stack, or rebuild approved work merely because another approach appears more sophisticated.

You are conducting a comprehensive **visual-production azimuth check and roadmap review**:

> Does the current 3D work successfully recreate the recognizable fantasy and visual appeal of *The Movies* with modern 2026-quality presentation, and is the art, animation, cinematic, and asset pipeline capable of supporting the complete planned game?

Your output should determine:

* what is already working,
* what the current work has actually proven,
* which visual responsibilities from the original game remain uncovered,
* what should be built next,
* what must be prototyped before committing,
* which systems should remain modular,
* and how your work should coordinate with the Engine Room PM.

Do not begin a broad implementation pass until this review is complete.

---

# Clarified Product Intention

Project: Studio is intended to be a modern spiritual recreation and major expansion of Lionhead Studios’ *The Movies*.

The desired experience includes:

* constructing and operating a physical movie studio,
* watching the studio lot grow,
* seeing actors, directors, crew, builders, janitors, extras, and visitors inhabit the lot,
* developing scripts,
* casting movies,
* rehearsing productions,
* constructing and using movie sets,
* watching scenes being filmed,
* creating or shaping the resulting movie,
* managing stars and their careers,
* marketing and releasing films,
* competing with rival studios,
* progressing through cinematic history,
* attending awards,
* and building a visible studio legacy.

The artistic goal is not to reproduce the original game’s 2005 graphical limitations.

The goal is:

> Make a former player immediately recognize the spirit, charm, readability, and studio fantasy of *The Movies*, while presenting it with modern lighting, materials, animation, character quality, environmental richness, interface clarity, and performance.

Preserve the original game’s warmth and visual accessibility.

Do not turn it into:

* a photorealistic architectural visualization,
* a sterile corporate dashboard,
* a gritty Hollywood drama,
* a walking simulator,
* or a generic collection of asset-store buildings.

---

# Visual North Star

The visual identity should be:

* stylized rather than strictly photorealistic,
* colorful without becoming childish,
* detailed without becoming visually noisy,
* warm and inviting at normal studio scale,
* cinematic during movie production,
* readable from a management camera,
* expressive during close-up talent interactions,
* modular enough to span multiple historical eras,
* and distinctive enough that screenshots are recognizable as Project: Studio.

The original game’s appeal came partly from presenting Hollywood as a readable miniature world.

Project: Studio should retain that sense of:

* a living studio diorama,
* visible production activity,
* exaggerated but understandable personalities,
* recognizable facility silhouettes,
* genre-rich sets,
* and playful Hollywood spectacle.

Modern graphics should deepen that fantasy rather than erase it.

---

# Presentation Ownership

The Engine Room PM owns simulation truth.

That includes:

* money,
* ratings,
* schedules,
* facility capacity,
* staffing,
* talent state,
* production progress,
* relationships,
* risks,
* decisions,
* and outcomes.

You own presentation.

That includes:

* models,
* environments,
* characters,
* materials,
* lighting,
* animation,
* cameras,
* cinematic staging,
* visual state communication,
* interfaces,
* asset tools,
* and rendering performance.

The visual layer must never independently decide:

* whether a film is delayed,
* whether a facility is overloaded,
* whether a talent member is stressed,
* whether two talent members have chemistry,
* whether a set is damaged,
* whether a movie succeeds,
* or whether a player action is valid.

The Engine Room provides an authoritative read-only presentation state.

Your layer renders that state and returns player intentions.

---

# Core Architecture Rule

The presentation pipeline should follow this shape:

```text
AUTHORITATIVE ENGINE STATE
        ↓
PRESENTATION ADAPTER
        ↓
IMMUTABLE PRESENTATION SNAPSHOT
        ↓
3D RENDERER / UI / AUDIO / CINEMATIC SYSTEMS
        ↓
PLAYER INTENT
        ↓
ENGINE COMMAND
```

The renderer owns no game truth.

Animation state, material changes, effects, floating icons, building lights, and character reactions may represent simulation state, but they must not become an alternative source of simulation state.

---

# Phase 1 — Reconstruct the Current Visual Project

Before proposing new work, inspect the complete current project.

Review:

* repository structure,
* existing 3D scenes,
* current engine and rendering setup,
* characters,
* rigs,
* animation clips,
* environments,
* facilities,
* movie sets,
* props,
* materials,
* textures,
* shaders,
* lighting,
* cameras,
* UI,
* interaction code,
* data contracts,
* technical-art utilities,
* source assets,
* imported assets,
* prototypes,
* art-direction documents,
* milestone plans,
* performance reports,
* and known defects.

Produce a current-state reconstruction that answers:

## Current Technology

* What 3D engine or renderer is being used?
* Is it WebGL, WebGPU, or a hybrid?
* Is Three.js, React Three Fiber, another engine, or a custom layer involved?
* Which framework versions are currently installed?
* Which systems are experimental?
* What browser and hardware targets exist?
* What fallbacks exist?
* Which decisions have already been validated?
* Which decisions were made provisionally?

## Current Visual Experience

* What can the player currently see?
* What can the player currently select?
* What can the player currently navigate?
* What is represented in 3D?
* What remains UI-only?
* What is currently placeholder?
* What is production-ready?
* What is merely a technology demonstration?

## Current Asset Inventory

Classify every existing asset as:

* Gray-box
* Temporary placeholder
* Technical prototype
* Reusable foundation
* Production candidate
* Production-ready
* Needs revision
* Obsolete
* Unverified

## Current Proof Level

For each visual system, report whether:

1. It runs.
2. It is understandable.
3. It looks appropriate.
4. It works at representative scale.
5. It performs on target hardware.
6. It can be produced repeatedly.
7. Its full production cost is understood.

Do not describe “it renders” as proof that a pipeline is production-ready.

---

# Phase 2 — Establish Visual Sources of Truth

Identify which documents and artifacts currently govern:

* art direction,
* environment scale,
* character scale,
* camera framing,
* interface style,
* asset naming,
* material standards,
* texture standards,
* rig standards,
* animation standards,
* facility design,
* set design,
* era variation,
* performance budgets,
* and integration with the Engine Room.

Identify:

* contradictory style references,
* duplicate specifications,
* obsolete mockups,
* undocumented decisions,
* provisional work being treated as approved,
* and assets whose source or license cannot be verified.

For every conflict state:

* what conflicts,
* which source should govern,
* whether completed work is affected,
* and what document or asset should be corrected.

---

# Phase 3 — Define the Relationship to *The Movies*

Create a visual-comparison framework that separates:

## What Should Feel Familiar

Potential examples:

* the elevated studio-management camera,
* readable building silhouettes,
* a colorful working studio lot,
* visible actors and staff,
* production sets embedded in the studio,
* film crews actively shooting scenes,
* talent personalities expressed physically,
* era progression,
* the sense of expanding from a small lot into a major studio,
* humorous or dramatic production moments,
* and the payoff of watching the finished movie.

## What Should Be Modernized

Potential examples:

* lighting,
* materials,
* facial expression,
* body deformation,
* animation transitions,
* crowd variety,
* camera quality,
* environmental detail,
* era authenticity,
* UI clarity,
* accessibility,
* performance,
* and cinematic presentation.

## What Should Not Be Copied Literally

Do not copy:

* original meshes,
* textures,
* logos,
* UI graphics,
* exact building geometry,
* exact character designs,
* original audio,
* exact proprietary scene content,
* or any other protected production asset.

Reference material should remain reference material.

The shipped game should reproduce the fantasy and recognizable design principles through original work.

---

# Phase 4 — Visual Identity Study

Develop or verify a formal visual identity.

## A. Shape Language

Define shape language for:

* core studio buildings,
* service buildings,
* creative departments,
* production departments,
* talent amenities,
* movie sets,
* technology buildings,
* and executive facilities.

Each major facility type should be recognizable from:

* silhouette,
* roofline,
* entrance,
* signage,
* exterior props,
* surrounding activity,
* and lighting.

## B. Proportion and Stylization

Determine:

* character head-to-body proportions,
* limb proportions,
* building exaggeration,
* door and window scale,
* vehicle scale,
* prop exaggeration,
* and environmental density.

The game may use selective exaggeration to improve readability.

Any exaggeration must be standardized.

## C. Material Language

Define how the game treats:

* painted wood,
* plaster,
* brick,
* concrete,
* metal,
* glass,
* fabric,
* foliage,
* asphalt,
* dirt,
* soundstage walls,
* temporary set façades,
* and aging materials.

Use modern PBR capability where beneficial, but avoid realistic micro-detail that disappears at the management camera distance.

## D. Color and Lighting

Define:

* studio-wide color philosophy,
* facility color families,
* interactive-state colors,
* alert colors,
* selected-object treatment,
* daylight,
* evening,
* interior lighting,
* filming lighting,
* premiere lighting,
* awards lighting,
* and historical-era grading.

Do not rely only on color to communicate state.

## E. Screenshot Recognition Test

Identify the five to ten visual elements that should make an unlabeled screenshot recognizable as Project: Studio.

These are the identity layer.

They may include:

* studio entrance,
* executive building,
* soundstage silhouette,
* water tower or equivalent landmark,
* signature production activity,
* talent presentation,
* movie-poster language,
* facility signage,
* or era-specific studio technology.

Do not assume generic purchased assets can provide this identity.

---

# Phase 5 — Borrow the Background, Build the Identity

Divide the visual world into two asset layers.

## Supporting Layer

This may include:

* generic office furniture,
* common vegetation,
* background vehicles,
* utility props,
* distant crowd members,
* generic lighting equipment,
* common construction props,
* ambient set dressing,
* and ordinary sound effects.

These may be:

* purchased,
* licensed,
* procedurally generated,
* adapted,
* or reused,

provided they form a coherent visual family.

## Identity Layer

This includes:

* signature studio architecture,
* major facility silhouettes,
* hero characters,
* FilmShape visualization,
* film-identity graphics,
* iconic movie sets,
* signature UI treatment,
* awards presentation,
* studio-history displays,
* and the distinctive way the game presents active filming.

These require bespoke design.

For all third-party assets maintain an asset-provenance register containing:

* asset name,
* source,
* creator,
* license,
* acquisition date,
* original version,
* modifications,
* final project location,
* and permitted uses.

Do not use reference screenshots, mood boards, or AI concept images directly as shipped textures or geometry.

---

# Phase 6 — Complete Original Visual Feature Inventory

Create the most complete possible inventory of visually represented systems from the original game and expansion content.

No major feature should be silently omitted.

For every item record:

* original visual purpose,
* player fantasy,
* original presentation,
* current Project: Studio status,
* proposed modern presentation,
* required models,
* required animations,
* required Engine Room data,
* expected camera distance,
* interaction frequency,
* performance implications,
* and milestone.

At minimum, explicitly evaluate the following.

---

## Core Studio Buildings

* Production Office
* Casting Office
* Stage School
* Staff Office
* Crew Facility
* Script Office tiers
* Custom Scriptwriting Office
* Post-Production Suite
* Publicity Office
* Research or Technology Department

---

## Talent and Social Facilities

* Bar
* Restaurant
* Toilets and basic amenities
* Talent trailers and trailer tiers
* Makeover Department
* Cosmetic Surgery facility
* Rehabilitation clinic
* Practice areas
* Rehearsal spaces
* Genre-training spaces
* Talent lounges
* social spaces
* entourage and status support

---

## Studio Operations

* builders,
* janitors,
* construction activity,
* repairs,
* cleaning,
* landscaping,
* paths,
* roads,
* delivery areas,
* food service,
* maintenance vehicles,
* studio security,
* lot entrances,
* decoration,
* studio prestige,
* employee movement,
* and visitor activity.

Routine operations may be automated mechanically, but the 3D world should still communicate that the lot is functioning.

---

## Production Facilities

* soundstages,
* outdoor sets,
* backlot streets,
* set-construction areas,
* rehearsal areas,
* wardrobe,
* hair and makeup,
* prop storage,
* camera equipment,
* lighting equipment,
* sound equipment,
* stunt facilities,
* stunt training,
* practical-effects areas,
* visual-effects support,
* and screening rooms.

---

## Industry and Prestige Spaces

* awards venue,
* premiere or theater presentation,
* studio archive,
* trophy displays,
* film-history displays,
* talent-history displays,
* rival-studio comparison,
* press events,
* and major pitch spaces.

---

# Phase 7 — Facility Visual-State System

Every facility must be able to display its current state.

Work with the Engine Room PM on a contract resembling:

```text
FacilityPresentationState

facilityId
facilityType
displayName
era
tier
specialization
operationalState
utilizationBand
staffingBand
queueSeverity
conditionBand
activeProjectIds
activeProjectTags
upgradeState
constructionState
alertState
prestigeState
visibleActivityTags
availableInteractions
```

For each facility define visual treatments for:

* inactive,
* idle,
* normally active,
* highly active,
* overloaded,
* understaffed,
* damaged,
* under repair,
* under construction,
* upgrading,
* historically outdated,
* newly modernized,
* celebrating success,
* and affected by a major event.

Possible signals include:

* exterior lighting,
* staff traffic,
* vehicles,
* open or closed loading doors,
* signage,
* project banners,
* equipment outside,
* scaffolding,
* smoke or steam where appropriate,
* visible queues,
* props,
* window activity,
* ambient audio,
* and contextual UI.

Avoid making every state a floating icon.

---

# Phase 8 — Studio Lot Structure

Evaluate the current lot model against three options.

## Fully Authored Lot

A designed studio that expands through controlled areas.

Advantages:

* stronger visual composition,
* predictable camera behavior,
* controlled pathfinding,
* lower content complexity,
* and stronger environmental storytelling.

## Fully Configurable Lot

The player places most buildings, paths, props, and landscaping.

Advantages:

* player ownership,
* customization,
* optimization,
* and layout variety.

Risks:

* visual incoherence,
* camera and pathfinding complexity,
* decoration spam,
* difficult balancing,
* and high interface cost.

## Hybrid Lot

An authored studio framework with:

* expansion zones,
* building slots,
* configurable departments,
* customizable landscaping,
* selectable façades,
* soundstage allocation,
* and visible specialization.

Audit which model the current project supports.

Do not switch models without evidence.

The chosen model must support:

* readable navigation,
* studio growth,
* era progression,
* production activity,
* meaningful player customization,
* and stable performance.

---

# Phase 9 — Lock Scale Before Asset Expansion

Create a formal world-scale standard.

Define:

* world units,
* standard adult height,
* door height,
* floor height,
* vehicle dimensions,
* walkway width,
* road width,
* soundstage dimensions,
* room dimensions,
* interaction radius,
* camera height,
* and prop-scale tolerances.

Create a dedicated scale-validation scene containing:

* male and female character references,
* child or shorter-body reference if relevant,
* door,
* chair,
* table,
* car,
* truck,
* tree,
* streetlight,
* office building segment,
* soundstage door,
* and common production equipment.

Every new asset class must be tested beside known references.

Do not enlarge the entire world to compensate for a mis-scaled imported character.

Correct scale at the source.

---

# Phase 10 — Camera System

Project: Studio requires several camera grammars.

## A. Studio Management Camera

Purpose:

* lot overview,
* facility selection,
* project monitoring,
* talent tracking,
* and studio expansion.

Define:

* default angle,
* field of view,
* zoom range,
* rotation behavior,
* pan behavior,
* edge behavior,
* focus command,
* reset command,
* and occlusion handling.

## B. Facility Inspection Camera

Purpose:

* inspect a department,
* observe activity,
* identify current projects,
* and access decisions.

## C. Character Inspection Camera

Purpose:

* view important talent,
* inspect career state,
* and present major interactions.

## D. Production Observation Camera

Purpose:

* watch filming,
* inspect a set,
* and observe cast and crew activity.

## E. Cinematic Camera

Purpose:

* movie playback,
* pitches,
* awards,
* premieres,
* major events,
* and custom movie creation.

Before detailed environment production, validate:

* obstruction,
* readability,
* selection,
* motion comfort,
* return-to-context behavior,
* and screen density.

Once a camera mode is approved, freeze its essential framing parameters unless new evidence justifies reopening them.

---

# Phase 11 — World Data and Spatial Truth

All placed world objects should come from a common data source.

A building, tree, trailer, vehicle, set wall, prop, doorway, spawn location, hotspot, and obstacle should not exist in separate manually synchronized lists.

Define a world-object schema such as:

```text
WorldObjectDefinition

objectId
assetId
objectType
transform
bounds
collisionType
navigationEffect
selectionBounds
interactionPoints
doorways
cameraAnchors
animationAnchors
eraTags
visibilityRules
lodProfile
presentationTags
```

Both rendering and spatial validation should consume this source.

Motion and choreography may be separate, but they must reference the same spatial data.

Whenever an object is repositioned:

* rerun route validation,
* rerun camera-occlusion validation,
* rerun interaction validation,
* and rerun performance checks where relevant.

Do not move production assets by eye without validation.

---

# Phase 12 — Set System

Different movie sets are one of the defining visual features of the original experience.

Design a modular modern set system.

## Set Composition

A set should be composed from layers such as:

```text
SetPackage

setFamily
stageShell
structuralKit
floorKit
wallKit
backgroundKit
propPackage
lightingPackage
eraOverlay
weatherState
damageState
productionDressings
sceneHotspots
cameraAnchors
navigationZones
effectAnchors
audioZone
```

## Set Families

Create a complete research-backed inventory of original set families and determine modern equivalents.

Likely broad families may include:

* contemporary interior,
* contemporary exterior,
* city street,
* domestic,
* office,
* restaurant,
* bar,
* hospital,
* courtroom,
* prison,
* police,
* military,
* western,
* historical,
* horror,
* science fiction,
* fantasy,
* romance,
* comedy,
* action,
* vehicle,
* wilderness,
* beach,
* snow,
* industrial,
* and spectacle sets.

Do not accept this as the final inventory.

Verify against source material.

## Set Design Goals

Sets must support:

* visual variety,
* scene hotspots,
* actor blocking,
* prop use,
* reusable animation,
* multiple camera angles,
* era variation,
* genre variation,
* lighting variation,
* weather where appropriate,
* damage or effects states,
* and reuse across multiple films.

## Set Reuse

A set may be redressed through:

* surface swaps,
* signage,
* furniture,
* props,
* lighting,
* background extensions,
* atmospheric effects,
* era overlays,
* and camera framing.

The player should perceive meaningful difference without requiring a completely unique environment for every movie.

---

# Phase 13 — Character Pipeline

Do not treat all characters as one quality tier.

Create at least three character pipelines.

## Tier 1 — Hero Talent

Used for:

* stars,
* important directors,
* close-up pitches,
* negotiations,
* movie scenes,
* awards,
* career profiles,
* and emotional events.

Requirements may include:

* smooth skinned deformation,
* strong facial topology,
* expression blendshapes,
* visemes,
* eye movement,
* look-at behavior,
* high-quality hair,
* wardrobe variation,
* age variation,
* and distinctive silhouette.

## Tier 2 — Persistent Supporting Talent

Used for:

* supporting actors,
* writers,
* department heads,
* recurring crew,
* and less frequent close-ups.

Requirements:

* recognizable identity,
* modular wardrobe,
* shared rig,
* reduced facial complexity,
* and controlled variation.

## Tier 3 — Background Population

Used for:

* extras,
* builders,
* janitors,
* assistants,
* crowd members,
* generic crew,
* and visitors.

Requirements:

* efficient geometry,
* shared materials where appropriate,
* animation instancing or reuse,
* silhouette diversity,
* and low runtime cost.

A successful background-character prototype does not prove the hero-character pipeline.

Validate hero characters independently.

---

# Phase 14 — Standardized Rig and Retargeting

Evaluate the proposed standardized-character approach.

The goal is to allow reusable animation across:

* body types,
* genders,
* ages,
* roles,
* wardrobe,
* and eras.

Define:

* canonical skeleton,
* bone names,
* coordinate orientation,
* rest pose,
* root-motion policy,
* scale policy,
* facial rig,
* eye bones,
* jaw handling,
* hand bones,
* prop sockets,
* clothing attachment,
* hair attachment,
* and export requirements.

Do not blindly adopt a Mixamo or VRM skeleton because it is convenient.

Compare candidates against actual requirements:

* character variety,
* close-up quality,
* animation availability,
* retargeting quality,
* browser performance,
* facial needs,
* and authoring-tool compatibility.

Produce a retargeting test containing:

* idle,
* walk,
* run,
* sit,
* stand,
* turn,
* gesture,
* handshake,
* hug,
* argument,
* prop pickup,
* drink,
* and paired interaction.

Test across at least:

* short character,
* tall character,
* heavier body,
* thinner body,
* different wardrobe,
* and one hero-quality face.

---

# Phase 15 — Animation Architecture

Design an animation system containing:

## Locomotion Layer

* idle,
* start,
* walk,
* run,
* stop,
* turn,
* stairs where relevant,
* and contextual movement.

## Activity Layer

* office work,
* writing,
* directing,
* acting,
* camera operation,
* construction,
* cleaning,
* eating,
* socializing,
* rehearsing,
* waiting,
* celebrating,
* arguing,
* and recovering.

## Emotional Layer

* confident,
* nervous,
* excited,
* angry,
* disappointed,
* exhausted,
* embarrassed,
* triumphant,
* and contemplative.

## Interaction Layer

* chair,
* desk,
* bar,
* restaurant table,
* camera,
* prop,
* door,
* vehicle,
* another character,
* and set hotspot.

## Cinematic Layer

* scene performances,
* pitches,
* negotiations,
* awards,
* premieres,
* confrontations,
* and major career moments.

Use:

* animation blending,
* additive animation where appropriate,
* look-at behavior,
* foot placement,
* hand IK,
* prop alignment,
* paired-interaction synchronization,
* and interruption-safe transitions.

Do not attempt to solve all body types and all paired animations simultaneously.

Create bounded proofs.

---

# Phase 16 — Prop Sockets and Interaction Hotspots

Define character sockets such as:

* right hand,
* left hand,
* both-hand grip,
* head,
* face,
* back,
* hip,
* pocket,
* and carried-object anchor.

Define environmental hotspots such as:

* chair seat,
* desk position,
* doorway,
* bar position,
* restaurant seat,
* camera station,
* director position,
* acting marks,
* vehicle seat,
* stunt mark,
* and prop pickup location.

A hotspot should define:

```text
InteractionHotspot

hotspotId
interactionType
position
orientation
characterRole
compatibleAnimations
propRequirement
entryPoint
exitPoint
cameraAnchors
pairedHotspotIds
occupancyLimit
```

Create validation tools for:

* hand alignment,
* foot placement,
* sitting height,
* prop penetration,
* paired-character spacing,
* camera visibility,
* and body-size compatibility.

---

# Phase 17 — Facial Animation and Lip Sync

Evaluate the proposed facial system cautiously.

Possible components include:

* neutral face,
* brow shapes,
* eye shapes,
* blink,
* squint,
* smile,
* frown,
* jaw opening,
* cheek movement,
* phoneme or viseme shapes,
* emotion presets,
* and procedural eye focus.

Do not assume audio amplitude alone provides convincing lip sync.

Compare:

* authored viseme timing,
* text-derived phoneme timing,
* audio-derived viseme analysis,
* lightweight local processing,
* and external AI services.

The core architecture should accept a neutral format such as:

```text
DialoguePerformance

audioAssetId
text
speakerId
language
startTime
visemeTrack
emotionTrack
gazeTrack
gestureTrack
cameraSuggestions
```

Any automatic lip-sync system should produce editable or replaceable data.

The game must still function when:

* AI processing is unavailable,
* the player is offline,
* a browser lacks a required API,
* or generated results are poor.

Do not make the game’s basic movie playback dependent on an online AI service.

---

# Phase 18 — Cinematic Camera System

Design reusable camera primitives:

* static wide,
* static medium,
* close-up,
* over-the-shoulder,
* two-shot,
* group shot,
* low angle,
* high angle,
* tracking shot,
* dolly,
* crane,
* orbit,
* pan,
* tilt,
* rack-focus candidate,
* reaction shot,
* and establishing shot.

A camera definition may contain:

```text
CinematicShot

shotId
shotType
duration
cameraTransform
targetIds
fov
focusTarget
focusDistance
movementPath
lookAtRules
framingRules
cutRules
collisionRules
safeArea
```

Cameras should be reusable across sets through:

* set camera anchors,
* character marks,
* target framing,
* and composition constraints.

The system should detect:

* wall clipping,
* blocked subjects,
* invalid focus,
* extreme character cropping,
* and bad camera placement.

Do not rely only on manually authored camera positions for every possible scene.

---

# Phase 19 — Scene and Movie Creation Architecture

The final product should preserve the emotional payoff of creating and watching a recognizable movie.

Evaluate three creative layers.

## Layer 1 — Strategic Authorship

Owned primarily by the Engine Room:

* FilmConcept,
* FilmShape,
* tone,
* themes,
* genre,
* promises,
* casting,
* budget,
* and production strategy.

## Layer 2 — Scene Authorship

Potential visual tools:

* scene archetype selection,
* location selection,
* character assignment,
* emotional intent,
* action selection,
* prop selection,
* basic blocking,
* wardrobe,
* and lighting mood.

## Layer 3 — Presentation Authorship

Potential tools:

* shot selection,
* shot ordering,
* shot duration,
* camera movement,
* dialogue,
* music,
* sound,
* transitions,
* titles,
* and final playback.

Do not assume all three layers belong in the first release.

Do not assume FilmShape alone completely replaces the player fantasy of watching a custom movie.

Produce options for:

* simplified automatic movie generation,
* guided scene selection,
* advanced creative mode,
* and full timeline editing.

Explain cost, risk, and player value for each.

---

# Phase 20 — Timeline Sequencer

Treat a full nonlinear editor as a major product system, not a routine UI feature.

Potential tracks include:

* scene track,
* camera track,
* character animation track,
* facial track,
* prop track,
* effect track,
* dialogue track,
* music track,
* ambient-audio track,
* subtitle track,
* and transition track.

Define an engine-neutral timeline schema before selecting a library:

```text
MovieTimeline

timelineId
duration
frameRate
scenes
tracks
markers
events
audioAssets
cameraCuts
exportSettings
version
```

Each track should contain typed clips and references rather than arbitrary code.

Evaluate Theatre.js or another sequencing system as:

* an internal authoring tool,
* a runtime dependency,
* a prototype tool,
* or a source of design inspiration.

Do not make the permanent saved-game format dependent on an editor library’s private state unless that decision is explicitly justified.

The game’s timeline data should remain migratable.

---

# Phase 21 — Rendering Technology Review

Do not replace the current rendering stack without evidence.

Evaluate the existing stack first.

If using or considering Three.js:

## WebGPU Candidate

Test:

* current required features,
* target-browser compatibility,
* material support,
* post-processing support,
* shader workflow,
* debugging,
* memory behavior,
* fallback behavior,
* and actual target-device performance.

## WebGL 2 Candidate

Test:

* stability,
* compatibility,
* current tooling,
* shader support,
* post-processing,
* performance,
* and migration cost.

## Decision Requirement

Produce a renderer decision record containing:

* current requirements,
* benchmark scenes,
* target devices,
* missing features,
* fallback behavior,
* risk,
* migration cost,
* and recommendation.

Do not choose WebGPU merely because it is newer.

Do not reject it merely because it is newer.

Use measured project-specific evidence.

---

# Phase 22 — Materials and Shaders

Define a controlled material library.

Potential material families:

* studio architecture,
* temporary set façades,
* skin,
* hair,
* eyes,
* fabric,
* painted metal,
* aged metal,
* polished wood,
* rough wood,
* glass,
* asphalt,
* concrete,
* foliage,
* paper and posters,
* illuminated signs,
* screens,
* and cinematic effects.

Establish:

* texture-resolution tiers,
* channel packing,
* material-slot limits,
* transparency policy,
* emissive policy,
* shader-variant policy,
* decal strategy,
* and era-aging strategy.

Avoid bespoke shaders for one-off assets unless the result is central to the game’s identity.

---

# Phase 23 — Lighting

Create lighting profiles for:

* clear studio day,
* overcast day,
* evening,
* night,
* office interior,
* soundstage work light,
* active film set,
* horror production,
* romance production,
* science-fiction production,
* premiere,
* awards ceremony,
* and historical periods.

Separate:

* world lighting,
* facility-status lighting,
* movie-set lighting,
* cinematic lighting,
* and UI readability.

Determine whether each context needs:

* baked lighting,
* dynamic lighting,
* hybrid lighting,
* probes,
* lightmaps,
* shadow tiers,
* or simplified approximations.

Do not allow cinematic lighting to make management interactions unreadable.

---

# Phase 24 — Era Progression

The studio should evolve visibly through cinematic history.

Build an era system from modular layers.

## Persistent Layer

Elements that preserve studio identity:

* lot layout,
* signature landmarks,
* core building massing,
* studio logo language,
* and major pathways.

## Era Overlay

Elements that change:

* signage,
* vehicles,
* clothing,
* furniture,
* streetlights,
* cameras,
* sound equipment,
* office technology,
* posters,
* façade details,
* materials,
* landscaping,
* and film-set technology.

## Facility Upgrade Layer

Elements that communicate:

* studio wealth,
* department maturity,
* specialization,
* prestige,
* and technology adoption.

Create a cost model for:

* one decade,
* multiple decades,
* full structural replacements,
* modular swaps,
* and procedural variations.

Do not build every decade as an entirely separate environment.

---

# Phase 25 — Talent Visual Progression

Important talent should visually persist and evolve.

Plan for:

* aging,
* changing hairstyles,
* facial hair,
* fashion changes,
* wardrobe changes,
* physical change,
* injury where appropriate,
* status changes,
* career reinvention,
* director or writer transitions,
* and studio affiliation.

Avoid designing appearance as a universal quality ranking.

Visual changes should communicate:

* era,
* role,
* career stage,
* personal identity,
* and narrative history.

Determine which changes can be:

* shader-based,
* texture-based,
* modular mesh swaps,
* accessories,
* blendshape-driven,
* or new hero assets.

---

# Phase 26 — Bar, Restaurant, Rehab, and Talent Facilities

Because these were recognizable parts of the original game, they must receive explicit visual plans.

## Bar

Potential visible activity:

* informal conversations,
* networking,
* celebration,
* conflict,
* drinks,
* pitches,
* and relationship formation.

Do not make the player drag characters repeatedly to the bar.

The environment should still visibly support social simulation.

## Restaurant

Potential visible activity:

* meals,
* business meetings,
* dates,
* reconciliations,
* celebrations,
* and informal negotiations.

Use modular seating and paired-interaction hotspots.

## Rehabilitation Clinic

Treat this with seriousness.

Potential visual needs:

* privacy,
* medical professionalism,
* recovery,
* absence from the studio,
* and career support.

Do not present rehabilitation as a joke or instant meter reset.

## Makeover and Image Department

Potential visual needs:

* wardrobe,
* hair,
* makeup,
* screen tests,
* publicity imagery,
* role transformation,
* and era adjustment.

## Cosmetic Procedures

Determine whether this remains an explicit facility, becomes part of a broader image-management system, or is handled through events.

Avoid presenting human appearance as a simplistic quality bar.

## Trailers and Entourages

Use them to communicate:

* talent status,
* contract expectations,
* privacy,
* studio investment,
* and hierarchy.

Create scalable trailer tiers without requiring completely unique assets for every star.

---

# Phase 27 — Visible Production

One of the game’s essential promises is that the player can see movies being made.

Design a visible production system that can represent:

* cast arriving,
* crew preparing,
* lighting setup,
* camera setup,
* rehearsal,
* filming,
* alternate takes,
* director activity,
* stunt preparation,
* practical effects,
* delays,
* equipment problems,
* celebrations,
* and wrap.

Not every underlying simulation tick requires a literal character action.

Use representative activity.

Determine which events need:

* physical simulation,
* canned animation,
* procedural staging,
* contextual props,
* ambient movement,
* cinematic framing,
* or only a notification.

Routine production should create life without making the player wait.

---

# Phase 28 — Film Visual Identity

Every film should acquire a persistent visual identity.

Create a scalable system such as:

```text
FilmVisualIdentity

filmId
titleTreatment
genreTags
toneTags
filmShapeTags
era
visualMotifs
keyTalentPortraits
setFamily
wardrobeFamily
propFamily
lightingProfile
posterTemplate
logoTemplate
campaignTemplate
projectColorFamily
releaseArtifacts
awardArtifacts
archiveArtifacts
visualSeed
```

A horror film, prestige drama, western, science-fiction epic, broad comedy, and romance should look different before release.

Determine which elements are:

* automatically generated,
* template-driven,
* manually chosen,
* procedurally assembled,
* or reserved for major productions.

Avoid requiring unique handmade artwork for every film.

---

# Phase 29 — Movie Playback and Export

Separate three questions:

1. Can the game play the completed movie internally?
2. Can the player edit or customize the movie?
3. Can the player export a standard video file?

Do not treat these as one implementation task.

For export, investigate:

* deterministic frame rendering,
* audio synchronization,
* frame-rate handling,
* resolution,
* video encoding,
* audio encoding,
* muxing,
* codec availability,
* browser compatibility,
* worker execution,
* progress reporting,
* failure recovery,
* and fallback formats.

Create an export prototype only after internal playback is proven.

The game should not depend on video export to make the core management loop complete.

---

# Phase 30 — Performance Budgets

Define performance targets for actual intended devices.

Specify:

* minimum and recommended hardware,
* browser targets,
* resolution targets,
* target frame rates,
* maximum active characters,
* maximum visible buildings,
* maximum active facilities,
* maximum draw calls,
* triangle ranges,
* texture-memory budget,
* animation budget,
* shadow budget,
* light budget,
* post-processing budget,
* and loading targets.

Create representative benchmark scenes:

## Benchmark A — Small Studio

* limited buildings,
* one active production,
* few characters.

## Benchmark B — Mature Studio

* many buildings,
* multiple active departments,
* normal population.

## Benchmark C — Peak Activity

* active film shoot,
* crowd,
* vehicles,
* effects,
* UI,
* and maximum expected visual complexity.

## Benchmark D — Cinematic Close-Up

* hero character,
* facial animation,
* hair,
* lighting,
* depth effects,
* and dialogue.

Test on target hardware.

Do not rely only on developer-machine performance.

---

# Phase 31 — Asset Pipeline

Define the complete production path:

> Brief → reference → concept → blockout → scale test → camera test → model → UV → material → rig if needed → animation if needed → export → import → prefab assembly → collision → hotspots → LOD → performance test → visual review → approval → integration.

For every asset category define:

* source format,
* runtime format,
* naming convention,
* folder location,
* scale,
* pivot,
* orientation,
* material limits,
* texture limits,
* collision requirements,
* LOD requirements,
* socket requirements,
* era tags,
* facility tags,
* licensing metadata,
* and definition of done.

Create import validators that detect:

* wrong scale,
* wrong orientation,
* missing materials,
* too many material slots,
* missing LODs,
* missing collision,
* missing sockets,
* invalid bone names,
* unapproved textures,
* and missing provenance.

---

# Phase 32 — Prototype Discipline

Every major visual unknown should receive a bounded prototype brief.

Each brief must contain:

1. Product question
2. Target player reaction
3. Authorized scope
4. Explicit non-goals
5. Timebox
6. Required systems
7. Placeholder policy
8. Evidence required
9. Pass criteria
10. Stop conditions
11. Repository boundary
12. Owner decision required

Possible prototype questions include:

* Does the management camera preserve the charm of the original while remaining usable?
* Can one modular soundstage convincingly support three distinct productions?
* Can players recognize important talent at normal camera distance?
* Can one standardized rig support the required body variety?
* Can close-up characters meet the target quality in a browser?
* Can a complete scene be assembled from reusable animations and hotspots?
* Can the studio visibly communicate facility overload without UI clutter?
* Can a film gain a recognizable visual identity without bespoke art?
* Can era overlays transform the lot without rebuilding it?
* Can the target browser render a mature studio at the target frame rate?

A prototype must be able to fail.

---

# Phase 33 — Required Prototype Sequence

Use the following sequence unless existing evidence supports a better one.

## V0 — Current Work Audit

Prove:

* what exists,
* what is reusable,
* what is placeholder,
* and what is genuinely production-ready.

## V1 — Style, Scale, and Camera Proof

Create:

* one studio blockout,
* known-size references,
* one facility,
* one street,
* one character,
* one vehicle,
* one management camera,
* and one inspection camera.

Prove:

* scale,
* silhouette,
* readability,
* selection,
* occlusion,
* and visual direction.

Do not add final detail.

## V2 — Facility-State Proof

Create one facility that can visibly display:

* idle,
* active,
* overloaded,
* damaged,
* under repair,
* upgrading,
* and celebrating.

Connect it to mock presentation-state data.

Prove the facility can function as a living dashboard.

## V3 — Set Modularity Proof

Create:

* one soundstage shell,
* three visually distinct set packages,
* reusable camera anchors,
* interaction hotspots,
* and redressing tools.

Prove that reuse does not look repetitive.

## V4 — Character and Animation Proof

Create:

* one hero character,
* one persistent supporting character,
* background workers,
* shared locomotion,
* one prop interaction,
* one paired interaction,
* one facial performance,
* and one dialogue test.

Prove the quality tiers separately.

## V5 — Visible Production Proof

Create a short production sequence:

* cast arrives,
* crew prepares,
* rehearsal,
* filming,
* a production problem,
* recovery,
* and wrap.

Prove the world feels active without requiring player babysitting.

## V6 — Movie Playback Proof

Create one complete scene containing:

* set,
* performers,
* props,
* animation,
* dialogue,
* facial performance,
* camera cuts,
* lighting,
* audio,
* and playback.

Do not build a full editor yet.

## V7 — Complete Presentation Vertical Slice

Represent one film from:

> Development → Casting → Production → Post-Production → Marketing → Release → Playback → Archive

Use a small number of facilities and characters.

Prove the complete visual fantasy.

## V8 — Era Transformation Proof

Transform the same studio and facility across multiple eras using modular changes.

Prove historical evolution without complete replacement.

## V9 — Productionization

Only after earlier gates pass:

* finalize tools,
* formalize asset standards,
* expand content,
* improve animation variety,
* optimize,
* and integrate deeply with the Engine Room.

---

# Phase 34 — Review Gates

Each prototype must pass two reviews.

## Stage One — Independent Technical and Production Review

A reviewer who did not build the feature should inspect:

* correctness,
* asset provenance,
* repository isolation,
* scale,
* contracts,
* performance instrumentation,
* collision,
* pathing,
* camera checks,
* and whether hidden game logic entered presentation code.

## Stage Two — Owner Review on Target Hardware

The Creative Director must judge:

* visual identity,
* charm,
* resemblance in spirit to *The Movies*,
* readability,
* camera feel,
* selection,
* character scale,
* animation quality,
* and actual performance.

Use one verdict:

* Fail
* Conditional Pass
* Pass With Notes
* Pass

Then choose:

* Continue
* Defer
* Rewrite
* Abandon

Perform one bounded corrective pass.

Freeze what has been proven.

Do not repeatedly reopen approved foundations without new evidence.

---

# Phase 35 — Coordination With the Engine Room PM

Produce a dependency table containing:

| Visual Need | Required Engine State | Engine Owner | Presentation Owner | Contract Needed | Milestone |

Examples:

* Facility activity requires utilization and operational state.
* Set filming requires production stage, current film, current scene, and production-event data.
* Character mood presentation requires a player-visible emotional state, not access to hidden raw calculations.
* Trailer status requires talent assignment and contract-perk state.
* Bar activity requires social-event or relationship-event data.
* Awards presentation requires nominations, winners, and historical records.
* Era transformation requires era and technology-adoption state.
* Marketing materials require film identity and campaign promise.
* Archive displays require persistent film history.

Do not block all visual development on complete engine implementation.

Use deterministic mock presentation snapshots where needed.

Do not invent final Engine Room behavior inside those mocks.

---

# Phase 36 — Required Deliverables

Produce the final report in this structure.

## 1. Executive Visual Assessment

Explain:

* whether current direction is sound,
* whether it resembles the intended spiritual successor,
* what has been proven,
* what remains uncertain,
* and what most urgently requires validation.

## 2. Current-State Reconstruction

Document:

* technology,
* scenes,
* environments,
* facilities,
* characters,
* animation,
* camera,
* UI,
* pipeline,
* and current milestone.

## 3. Original-Game Visual Parity Matrix

Use columns:

| Original Feature | Original Fantasy | Current Status | Modern Visual Treatment | Engine Data Needed | Asset Work | Animation Work | Milestone | Verdict |

No major original visual feature may be silently omitted.

## 4. Visual Identity Bible

Define:

* art style,
* shape language,
* proportion,
* materials,
* color,
* lighting,
* era treatment,
* and identity assets.

## 5. Facility and Environment Inventory

Classify all current and planned spaces.

## 6. Studio Lot Recommendation

Explain whether the project should use:

* authored,
* configurable,
* or hybrid lot design.

## 7. Set-System Specification

Provide:

* set taxonomy,
* modular composition,
* hotspot rules,
* camera anchors,
* reuse rules,
* and era variation.

## 8. Character Pipeline

Define:

* hero,
* persistent supporting,
* and background tiers,
* rigging,
* facial animation,
* wardrobe,
* aging,
* and performance requirements.

## 9. Animation Architecture

Define:

* locomotion,
* activity,
* emotion,
* interaction,
* cinematic performance,
* sockets,
* hotspots,
* blending,
* and IK.

## 10. Cinematic and Movie-Creation Architecture

Define:

* camera system,
* scene assembly,
* timeline layers,
* dialogue,
* lip sync,
* movie playback,
* and possible export.

## 11. Technical Rendering Decision

Compare the current stack with relevant alternatives using:

* project requirements,
* performance,
* browser support,
* maturity,
* migration cost,
* and fallback behavior.

## 12. Asset Pipeline and Provenance Plan

Define:

* standards,
* validators,
* naming,
* source formats,
* runtime formats,
* licenses,
* review gates,
* and definitions of done.

## 13. Performance Plan

Provide:

* target devices,
* budgets,
* benchmark scenes,
* measurement process,
* and current results.

## 14. Engine-to-Presentation Contracts

Specify:

* read-only snapshots,
* events,
* ownership,
* update timing,
* and mock-data policy.

## 15. Sequenced Visual Roadmap

For every milestone include:

* product question,
* authorized scope,
* non-goals,
* dependencies,
* evidence,
* pass criteria,
* stop conditions,
* and owner decision.

## 16. Findings Ledger

For every material finding include:

* ID,
* severity,
* confidence,
* evidence,
* current state,
* desired state,
* consequence,
* smallest correction,
* owner,
* and timing.

## 17. Risk Register

Include:

* visual identity risk,
* asset-volume risk,
* hero-character risk,
* animation risk,
* set-repetition risk,
* camera risk,
* UI and 3D integration risk,
* performance risk,
* browser-technology risk,
* export risk,
* era-scope risk,
* licensing risk,
* pipeline risk,
* and Engine Room coordination risk.

## 18. Human Decisions Required

List only decisions requiring Creative Director approval.

Separate:

* Blocking now
* Blocking next milestone
* Safe to defer

## 19. Explicit Deferrals

Clearly list what should not be built yet.

## 20. Final Recommendation

Choose one:

* Continue as planned
* Continue with targeted corrections
* Prototype specified visual risks first
* Pause content expansion until the pipeline is validated
* Rebaseline the visual-production roadmap

Explain why.

---

# Hard Do-Not-Build List

Until separately approved, do not:

* discard existing working visual systems without evidence,
* change the underlying game mechanics,
* place game truth inside presentation code,
* build the entire studio before one facility works,
* build dozens of sets before one modular stage proves reusable,
* create final hero characters before the hero pipeline is validated,
* assume a crowd rig can support close-ups,
* build every historical era as a separate studio,
* produce unique art for every generated movie,
* build a full nonlinear editor before movie playback works,
* make online AI processing mandatory,
* depend on one experimental browser feature without fallback,
* build video export before internal playback is complete,
* use reference art directly in shipped content,
* import assets without license provenance,
* move world objects without rerunning spatial checks,
* change approved camera foundations casually,
* optimize based only on a development computer,
* or confuse a successful prototype with a production-ready pipeline.

---

# Final Success Standard

A successful visual plan should eventually allow a player to say:

> “This feels like the game I remember, but it looks, moves, communicates, and performs like a modern game.”

The studio should feel alive.

The buildings should have recognizable purposes.

Talent should become memorable.

Different sets should make films visibly distinct.

The player should enjoy watching productions occur.

The studio should evolve through cinematic history.

The final movie should visibly reflect the player’s creative and management decisions.

Most importantly:

> The visuals must make the simulation understandable and emotionally meaningful without becoming a second, conflicting source of game logic.

Do not optimize for the number of models created.

Optimize for:

* recognizable identity,
* faithful fantasy,
* modern quality,
* readability,
* modularity,
* character attachment,
* cinematic payoff,
* performance,
* production sustainability,
* and coordination with the Engine Room.
