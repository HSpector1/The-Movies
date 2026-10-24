# PR19 follow-up: filming lifecycle and Advanced Movie-Making

24 October 2026. Answers to the two research questions relayed by the owner. **Useful contracts are established below; a continuous equipment lifecycle and original unsaved-edit persistence are still unverified. Neither is a reason to delay P16 or stabilization.**

## Scope and evidence baseline

Project: Studio source inspected at `342e9a903bc2ffec563c58ea8f511a67c3e4f994`; PR19 previously at `b513fdeb3b9df677150ee98d5d7c5066041e3f9c`. Read-only source/design comparison, one disjoint GPT 6.1 Sol audit, and root checks of decisive phase, shooting-task and Chronicle clauses. No engine, tests, gameplay, coordinator HANDOFF, assets, local Git state or workers changed. Test references below are inspected assertions, not newly executed passes.

This is Project: Studio, not the separate Godot reconstruction. Their implementations and adopted designs must not be conflated. A historical feature is evidence for a design decision, not automatic authorization to expand Studio's accepted scope.

Sources reused:

- [Official English PC manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf), retail base-game documentation. Retained file `artifacts/reference/the-movies-pc-manual-steam.pdf`, SHA-256 `d9b3d66f2ca4893b0ccd1ddf27dab4a382c27a4839d534af21503452269164d4`. Printed page numbers below; PDF spread indexes are zero-based. Manual claims have high confidence as documented behavior, not observed execution.
- [Pinned manual reconciliation](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/9da7919e9180fec210a2598f489bd9c6f73f960b/docs/research/video-evidence-20261024/MANUAL-GUIDE-DELTA.md), including costume/import ambiguities and evidence identity.
- [Pinned coordinator evidence and coverage limits](https://github.com/HSpector1/the-movies-rea-research-20261014/blob/9da7919e9180fec210a2598f489bd9c6f73f960b/docs/research/video-evidence-20261024/COORDINATOR-ANSWERS.md), with episode notes and frame manifests in the same directory. The 43-video pass was sampled still review plus available automatic captions, not continuous viewing or audio listening. No new footage downloaded for this follow-up.

## 1. Complete filming and equipment lifecycle

### What can be answered

| Question | Original-game evidence | Conclusion and limit |
|---|---|---|
| How does a film reach shooting? | Manual printed p12, PDF index6, Hire Your Crew/Casting | Inspect completed script for required Stars/crew; put film in Casting Office Begin Casting; assign roles to corresponding rooms; move film to Shoot It when prompted. Required counts are film-specific; no universal number is recovered. |
| What blocks a required set? | p13, index6, Shooting Your Movie | A red required set can mean unowned, needing repair, or occupied by another production. Build missing sets; cast and crew assemble and shoot when requirements are satisfied. This does not recover queue priority or the precise next-tick resumption rule. |
| Is crew actually required? | p17, index8, Crew Facility | The manual states all movies require crew to begin shooting. It does not specify every runtime assignment/refusal predicate. |
| What does crew do with equipment? | p18, index9, Film Crew | Crew sets equipment up on set and operates cameras and microphones during shooting. Exact spawn, carrying, placement and teardown moments remain unknown. |
| Does distance between sets matter? | p39, index19, Hints & Tips | Travel between distant sets increases production time and cost. No movement speed, cost equation or per-person travel policy follows. |
| Can authoring reference a missing set? | p24, index12, Choosing Your Sets | Yes. Owned sets are listed first, unowned sets may be chosen, and the needed set must exist before its scenes can be filmed. Authoring validity differs from shooting readiness; do not invent a whole-film admission rule from this. |
| Can the player inspect an active shoot? | p39, index19 | Double-left-click an idle set for fly-by; a filming set enters director view with sliders/backdrop adjustment. Commit timing, cancellation and effect on already-recorded material are not established. |

These are retail-base **documented facts**. They answer the operational sequence, but not the requested uninterrupted physical demonstration.

### What the footage actually establishes

- [Flabaliki episode1, 13:40–15:40](https://www.youtube.com/watch?v=EALqGBsuoQ8&t=820s): 120 one-second sampled frames. Film is held over Shoot It around13:48–49; the player then moves away to decorate. No complete assembly/shoot/teardown witness. Reported base installation, not independently authenticated.
- [Geekism episode6, 18:00–19:15](https://www.youtube.com/watch?v=KKMXXE9nosY&t=1080s): 75 one-second sampled frames cover casting, desert-set movement/orbit and maintenance. No uninterrupted lifecycle. Reported base-game series; settings history remains in episode notes.
- [Foredoomer, 2:32:00–2:32:06](https://www.youtube.com/watch?v=_BRrABJXZCA&t=9120s): six retained720p samples show a held boom while the worker's position/posture changes. Expansion installation is established by the opening menu. This is a local visual observation, not base-game confirmation, a stationary-camera witness or evidence about bones/attachments.

**Still unknown:** when camera/boom props first appear relative to arrival; carried versus stationary transitions; whether every crew member travels between every scene; teardown/disappearance; missing-crew and occupied-set wait labels; recovery order and exact resumption. Do not fill the gaps from narrator commentary or a native matrix hypothesis.

The promising Foredoomer16–19minute interval remains unreviewed at useful density. Earlier guarded acquisition attempts stopped, with no inspected new frames; the partial was removed after hashing. Do not automatically retry or recheck the two closed negative candidates.

### Comparison with current Studio

Studio already has [managed phases and capability requirements](https://github.com/HSpector1/The-Movies/blob/342e9a903bc2ffec563c58ea8f511a67c3e4f994/src/core/productionPhases.ts#L36): rehearsal, shooting and Post are distinct; shooting requires stage and scenery. `retainedCapabilitiesFor` retains the rehearsal stage into shooting. These are Studio rules, not recovered original-game timings.

[operations.ts:684–806](https://github.com/HSpector1/The-Movies/blob/342e9a903bc2ffec563c58ea8f511a67c3e4f994/src/core/operations.ts#L684) already implements `assignShootingDirector`, a scenery-load-in blocker, `clearSceneryLoadIn`, geometry-driven `arriveDueScenery`, and readiness-checked `scheduleShootingTake`. The authoritative tick owns arrival. Original-game research must not create a second renderer-driven scheduler.

[technologyAdoption.ts:170](https://github.com/HSpector1/The-Movies/blob/342e9a903bc2ffec563c58ea8f511a67c3e4f994/src/core/technologyAdoption.ts#L170) already selects reusable owned equipment or prices acquisition. [installationCancellation.ts:291](https://github.com/HSpector1/The-Movies/blob/342e9a903bc2ffec563c58ea8f511a67c3e4f994/src/core/installationCancellation.ts#L291) retains and unholds equipment on cancellation. `tests/p13b-s5-equipment.test.ts:69–92` and `tests/p13b-s6-equipment.test.ts:43–105` assert asset identity, prototype entitlement and cancellation/reuse. These durable economic assets are distinct from the visible on-set equipment lifecycle being researched. Do not replace them or infer new camera-cart expenses.

**Actionable consequence:** reuse existing phase/task/asset authority when future lot work depicts arrival, setup, operation and departure. Missing visual behavior is not evidence that production or equipment ownership is absent. Preserve the adopted company/Engine ownership boundaries in `CURRENT-BEST.md:184–211`.

### Smallest remaining investigation and acceptance proposal

Request one authorized **retail-base, uncut, normal-speed recording** of the same two-set film: show film identity/requirements, Shoot It gesture, cast/crew arrival, equipment first appearance, active shooting, set transition and final departure. Keep the relevant worker/set continuously in view. Then perform separate controlled missing-crew and occupied-set trials with readable messages and the recovery action; do not introduce both blockers simultaneously. Record edition/settings and timestamps, and stop once the transitions are visible or mark any off-camera transition unknown. No retail acquisition or native-session takeover is authorized here.

For future Studio acceptance, independently verify existing readiness/refusal before testing visuals: assign the locked director, observe load-in, attempt shooting while blocked, allow arrival, schedule the ready take, then observe phase release. Save/reload at blocked and ready states should preserve authoritative identity; repeated/stale input must not duplicate equipment or tasks. Add original-style carry/teardown assertions only after a witness and an adopted visual contract exist. This is a proposed acceptance route, not a passed test or a demand to change P16.

## 2. Advanced Movie-Making and postproduction

### Retail-base behavior established by the manual

| Area | Locator | Documented behavior / uncertainty |
|---|---|---|
| Script and scene selection | pp24–25, index12 | Name/genre, structure templates or Freeform, set selection, searchable/filterable scenes and descriptors for length, actors and adjustable options. Three principal mannequins belong to this authoring interface, not a universal film staffing rule. |
| Actors and costumes | p24 index12; p26 index13 | Assign roles by dragging cards/roles. Scene performer changes affect that scene; a Star card/main-role choice supplies global costume context. p24 describes future-scene defaults while p26 describes whole-movie scope: retroactive override precedence is unresolved. |
| Scene presentation | pp25–26, indexes12–13 | Props/dressing, weather/lighting, backdrop and scene-specific sliders. These do not establish an arbitrary movable camera or expansion FreeCam as a base-game feature. |
| Editing | p28, index14 | Split at the timeline position; resulting pieces behave separately in this screen; reorder and delete scenes. Frame rounding, minimum lengths and audio/subtitle retiming remain unknown. |
| Sound and voice | p27, index13 | Separate Music, Sounds and Dialogue tracks; place/move items; record during playback, Stop creates an item; assign dialogue to role/cast Star for lip-sync. Exact mixing/import behavior is not recovered. |
| Text | p28, index14 | Subtitles have text/font controls; title-style controls credits style/text. Separate these authoring operations. |
| Save versus export | pp26–28, indexes13–14 | Save/Load differs from Export. Editable `.trl` can be reopened via Movie Player; rendered `.wmv` is for external playback. Low/Medium/High/Online presets and chosen-frame thumbnail are documented. Codec parameters, actual artifacts, implicit save on export and unsaved exit/return behavior are not proved. |

Import caveat: the general paragraph names `Sounds` and literally `oog`; the specific dialogue recipe names `Movie Sounds` and short16-bit PCM WAV. Do not silently resolve these inconsistencies into a verified decoder/path policy. See the pinned manual packet for exact distinctions.

### Independent visual corroboration and its limits

[Flabaliki4, 23:10–23:45](https://www.youtube.com/watch?v=tOEsrY44--c&t=1390s), 35 one-second360p samples, reported base installation: preview/shot strip at23:12; audio options23:21; Title Style23:25; Thumbnail23:30; Advanced Features23:34; expanded tracks23:35; Save hover23:38; Export hover23:39–40; back on lot/Post Production floor23:42. These establish visible controls and navigation, **not successful save/export or persistence**. Nominal timestamp alignment can vary about one second.

The23:21–23:23 stills show Sound Effects/Ambience/Mumbling checked, then dialog close; playback clock stays00:00:00. No audio toggle or audible effect is established. This pass still contains zero direct listening.

[Flabaliki12](https://www.youtube.com/watch?v=O7P2VjYc_q4&t=1515s) around25:15 shows wardrobe and return to the working draft; duplicate/delete discussion32:08–35 is caption-only evidence. This episode is expansion-enabled and cannot settle retail-base persistence. The existing episode notes retain these modality distinctions; no additional broad episode pass is justified.

### Comparison with current Studio and adopted design

A Post-production phase does not mean Studio already has a film editor. The inspected sources contain managed Post capability and a synchronized-sound stage/Post chain; they do not establish shot editing, voice recording, audiovisual playback or video encoding.

The decisive adopted boundary is [FILM-CHRONICLE-V1-CONTRACT.md:356–365](https://github.com/HSpector1/The-Movies/blob/342e9a903bc2ffec563c58ea8f511a67c3e4f994/docs/FILM-CHRONICLE-V1-CONTRACT.md#L356): machinima editor, scene lists/dialogue, playable scenes, editing choices and several visual/export artifacts are explicitly open after V1. Its current deliverable is a deterministic one-sheet/newspaper/retained-fact production strip, not a movie inside the movie. Existing `src/core/filmPackage.ts` cohesion/fit/economics helpers do not supply a timeline editor. Save export is not film export.

**Actionable consequence:** retain this evidence as the source contract for a separately adopted filmmaking capability. Do not classify editor implementation as a P16 defect or import the other repository's Godot editor claims. This bounded source audit found no shipped scene-level editor/exporter; it is not an exhaustive absence proof or a fresh runtime result.

### Smallest next checks and future acceptance

1. **Persistence:** in a qualified base-game editor, make a distinctive two-scene change, preview and return, exit without saving, reopen, explicitly save, then cold-reopen. Record each boundary separately. Stop once saved versus unsaved behavior is established; do not infer it from hovering Save.
2. **Costumes/camera:** give scene1 a local costume override, change the global default, inspect scene1 and a newly added scene2, then reopen. Demonstrate each camera/scene slider actually available; exclude expansion FreeCam. Stop with a per-control result, not a guessed universal camera model.
3. **Export:** export one short known film, retain preset/thumbnail choice, verify the output file plays outside the game and compare scene order/title/credits. Do not claim preset bitrates, codec identity or interoperability without inspecting the artifact.

If Studio later adopts this scope, its first acceptance should distinguish editable storage from rendered output: author → reorder/split/delete → preview → save/cold-reopen → export → external playback. Add cancelled export, duplicate commands and stale draft ownership to that existing workflow's tests. Keep multitrack edits, role-bound speech and audible playback separate from volume-control tests. Until a concrete scope is adopted, avoid speculative schemas/frameworks or an implementation sprint estimate.

## Coordinator disposition

- Ready now: use documented admission/authoring distinctions and current-source reuse points; do not rebuild equipment economics or production phases.
- Highest unresolved evidence need: one continuous qualified base-game filming witness, then a small editor persistence/costume/export demonstration. Current evidence cannot truthfully close those questions.
- P16/stabilization proceeds under the existing coordinator. Finance edge cases, broad staff AI, audio and long-term fun/frustration remain deferred here. No repeated marketing-selection/debit investigation and no claim of complete reverse engineering.
