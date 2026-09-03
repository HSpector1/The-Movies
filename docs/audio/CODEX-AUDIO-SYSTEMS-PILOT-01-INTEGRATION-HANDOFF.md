# Project: Studio — Audio Systems Pilot 01 Integration Handoff

**Handoff status:** PREPARED, NOT EXECUTED

**Audio Lab status:** ISOLATED PROTOTYPE

**Production API status:** PROVISIONAL / NOT FINAL

**Asset status:** `PROTOTYPE_ONLY` / `PROTOTYPE_READY_FOR_OWNER_AUDITION`

**Owner acceptance:** NONE

## Purpose

This handoff records how a successful isolated Audio Systems Pilot could later be reconciled with Project: Studio production architecture. It does not authorize a merge, import, schema change, DTO change, scene edit, setting-menu edit, or gameplay integration.

The next gate is Owner listening and review of prototype evidence. A production integration checkpoint can be considered only after P05 acceptance, current changed-path reconnaissance, P13/P05/P06 contract ownership, and an explicit rights decision.

## Starting references

- Era-aware audio direction: `f803164357ad417cea3162cb2c329890868f2b19`
- Marathon/pilot base: `c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf`
- P13 research authority: `2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f`
- Current P13 research branch tip observed during pilot reconnaissance: `137ab603e37620ce647cd728b3a57154b8e3c3fb`
- Accepted pre-P05 Unity laboratory baseline: `29aea89a706a7f0961f5a460afc5bdb4d38d8395`
- TypeScript documentation/tooling branch: `codex/audio-systems-pilot-01`
- Unity laboratory branch: `wip/audio-systems-pilot-01-client`

Exact completion SHAs belong in the final report and evidence manifest after tests/builds finish. This document does not predict them.

## Isolation and collision law

The Audio Lab is additive and disposable. Its Unity implementation lives only beneath:

`Assets/ProjectStudioAudioLab/`

with dedicated namespaces and assembly definitions. Generated audio remains outside Git under the explicitly approved Audio Systems Pilot external root.

The pilot and this handoff do not modify:

- `Assets/Studio/Scenes/StudioLot.unity`;
- production scenes, prefabs, listeners, bootstrap, current system menu, or input assets;
- `campaign/living-lot-ts` or `campaign/living-lot-client`;
- P05 WIP worktrees, Stage registry, Production workspace, or Visual Oracle;
- bridge schemas, generated bridge DTOs, protocol/projection versions, or current bridge code;
- P13 implementation surfaces or `EraConfig`;
- the Owner’s profile or authoritative saves;
- normal production build settings.

The lab scene is built through an explicit Editor method and is never added to normal production build settings. The lab branch must never be merged into `campaign/living-lot-client`, P05 WIP, or `main` as a shortcut.

## Proposed future namespaces

These names express responsibility only and are not approved APIs:

```text
ProjectStudio.Audio.Contracts
ProjectStudio.Audio.Catalogue
ProjectStudio.Audio.Decision
ProjectStudio.Audio.Transport
ProjectStudio.Audio.Mix
ProjectStudio.Audio.Ambience
ProjectStudio.Audio.Management
ProjectStudio.Audio.Radio
ProjectStudio.Audio.Accessibility
ProjectStudio.Audio.Diagnostics
```

Prototype code should retain the isolated `ProjectStudioAudioLab.*` namespace. Renaming or moving it into production is a deliberate migration after review, not a branch merge.

## Proposed ownership

| Concern | Future authoritative owner | Audio presentation responsibility |
|---|---|---|
| Absolute calendar/week/phase | Core scheduler | None; consume an approved audio-eligibility projection only |
| Global era and technology truth | P13 | Select only inside supplied eligible catalogue IDs |
| Production legality, blockers, results, milestones | Owning gameplay systems | Present typed receipts; never calculate or mutate truth |
| Broad lot activity | Owner determined after P05/P06/P14 contracts seal | Map one supplied closed activity value to presentation; never aggregate raw state privately |
| Cue, variant, gap, recent history | Audio presentation | Deterministic selection within eligible content |
| DSP schedule, loop, fade, ducking | Audio transport/mix | Full presentation ownership |
| Radio content priority | Source receipt priority plus audio arbiter | Queue, coalesce approved payloads, schedule or omit voice |
| User audio preferences | Save-independent settings owner | Read/apply levels, density, radio, captions, mono, Night, Speech First |
| Gameplay save | Existing save owners | No audio truth written; only separately versioned presentation history if authorized |

## Persistent coordinator proposal

A future `StudioAudioCoordinator` may be an application-lifetime presentation service, created by the accepted production bootstrap owner. It should:

- own catalogue validation, deterministic selection state, music transport, radio scheduler, ambience scheduler, mixer control, transcript history, and lifecycle recovery;
- receive immutable typed projections/receipts through owned seams;
- survive ordinary scene/workspace navigation without restarting score;
- expose diagnostic snapshots without exposing mutable gameplay objects;
- persist only user preference and bounded presentation history through an approved save-independent service;
- release and rebuild external/device resources safely on app lifecycle changes;
- have no `AudioListener`, camera, input authority, clock authority, game RNG, or simulation mutation methods.

The current Audio Lab coordinator proves a laboratory graph only. It is not copied wholesale into production until the bootstrap, lifetime, disposal, and test ownership are reconciled.

## Listener strategy

- Production keeps its existing accepted listener ownership.
- A future coordinator routes audio to that listener; it does not create another.
- The isolated Audio Lab scene may own exactly one lab listener because it is not a production scene.
- No prefab imported from the lab may carry an enabled listener into production.
- Automated validation should reject duplicate enabled listeners in the lab and later integration target.
- Spatialization decisions for lot detail are presentation data; the listener does not become an owner of lot activity or era truth.

## Proposed mixer and bus graph

```text
MASTER
├── SCORE
├── RADIO_MUSIC
├── AMBIENCE
├── ACTIVE_SFX
├── UI
├── RADIO_VOICE
├── PA_HELP
└── MILESTONE_STINGS
```

Required independent controls are Master, Score, Radio music, Radio voice, PA/help, Ambience, Active SFX, and UI. `MILESTONE_STINGS` is separately routed and contains no critical information.

Snapshots/presets own mix presentation only:

- Standard
- Speech First
- Night / Limited Dynamic Range
- Music Light
- Music Off
- Force Mono, implemented as a composable output route where Unity permits rather than gameplay state

No snapshot name or activation encodes active Production, blocker, era, milestone, result, pause legality, or any other authoritative fact.

## Catalogue boundary

The pilot catalogue is external:

`/Users/bruce/Project Studio Audio Systems Pilot 01/01_catalogue/AudioPrototypeCatalogue.v1.json`

That absolute path is evidence/Owner-machine context only and must not appear in production-facing code. Lab configuration resolves the approved root from `PROJECT_STUDIO_AUDIO_PILOT_ROOT` or an explicit local JSON configuration outside Git.

Minimum prototype entry fields:

- stable prototype ID and source candidate ID;
- commissioning alias, family, prompt revision, seed;
- exact model/code/weight identities;
- raw and derivative SHA-256 values;
- relative external path;
- duration, sample rate, channels, encoding, loudness;
- loop and transition metadata with confidence;
- machine disposition;
- `humanDisposition: PENDING`;
- `rightsStatus: PROTOTYPE_ONLY` or `PROTOTYPE_READY_FOR_OWNER_AUDITION`;
- permitted lab contexts.

A future production catalogue requires a new approved schema/version and only Owner/rights-authorized assets. Prototype IDs may be migration source references, not permanent runtime IDs.

## External file security

The lab loader establishes a pattern, not a production asset strategy:

1. Accept one explicit local root; reject empty or implicit roots.
2. Canonicalize root and requested relative path.
3. Require the canonical candidate to remain beneath the canonical root.
4. Reject absolute entry paths, traversal, symlink escape, network URLs, and arbitrary recursive discovery.
5. Resolve only a catalogue-declared file.
6. Validate extension/container, sample/channel metadata, exact size where recorded, and SHA-256 before playback.
7. Reject duplicate IDs or ambiguous derivatives.
8. Fail visibly with an exact reason; never silently substitute another era/context/file.
9. Do not use network access, cloud storage, credentials, tokens, or the Owner profile.

For production, approved masters should normally migrate into an authorized asset/content build pipeline rather than depend on the Owner’s external prototype root. That choice belongs to a later build/provenance owner.

## P13 eligibility seam

The audio layer may consume a future typed projection conceptually equivalent to:

```text
AudioMusicEligibilityProjection
  projectionId
  sourceRevision
  eligibleCatalogueIds
  transitionEligibility?
  issuedAtGameTime
```

This is not a DTO authorization. The final owner may choose different names and shape.

Requirements remain:

- P13 or its authorized mapper derives eligibility from global era/technology truth.
- Audio never maps raw year to a creative alias privately.
- Unknown/missing eligibility fails to approved neutral ambience or silence.
- Audio cannot widen eligibility, infer adjacent-era allowance, or persist a parallel timeline.
- `legacy_future_2030_2040` is explicitly extrapolative and cannot be selected as historical fact.

## P05/P06 lot-activity seam

The audio layer requires, at most, one bounded presentation input representing broad lot activity and optionally one explicit close inspection context. It must not inspect mutable Production collections and decide which item matters.

Conceptual lab-only fixture values are:

- `IDLE_LOT`
- `ACTIVE_PRODUCTION`
- `LOAD_IN`
- `BLOCKED_PRODUCTION`
- `CLOSE_STAGE_INSPECTION`

These are not final P05/P06 enums. A future owner must determine whether one of P05, P06, P14, or a sealed aggregator publishes the required projection. The projection must not leak blocker causes, results, or mutable domain models merely to drive ambience.

Until that contract is accepted, the Audio Lab uses records marked `LAB_FIXTURE` and cannot claim integration fidelity.

## Functional radio seam

Future functional voice consumes one resolved typed payload preserving:

```text
ownerDomain
eventId
receiptId
headline
body
priority
expiresAt
captionText
spokenText
```

The owning domain produces truth. Audio validates, schedules, ducks, captions, transcribes, coalesces through approved templates, or refuses/omits. Spoken and caption forms derive from the same resolved payload. No voice callback mutates the simulation.

Decorative radio remains separately identifiable and optional. PA/help, functional bulletin, host, advertisement, ident, and milestone sting keep distinct arbitration behavior.

## System menu and settings integration

The pilot does not modify the current system menu. After P05 acceptance and changed-path refresh, a settings owner may integrate:

- eight independent category controls;
- Full/Balanced/Sparse/Off music density;
- Radio Off/Reduced/Full and Reduce Repetitive Voice;
- Standard, Speech First, Night, Music Light, Music Off, and Force Mono presentation controls;
- captions, important-sound captions, text scale/background/opacity, transcript history;
- assistive-technology speech preference.

Every control needs keyboard/controller operation, accessible name/value, deterministic preview where safe, and persistence independent from campaign saves. Explicit user mute wins over snapshots and ducking.

## Save-independent presentation data

A versioned user-audio profile may store:

- category levels/mutes;
- accessibility and radio preferences;
- last two cue IDs, previous shuffle-bag digest, and last motif exposure;
- radio item/category/presenter cooldown timestamps;
- transcript preference and bounded local history where privacy review permits.

It must not store or infer year, era truth, Production status, receipts as authoritative facts, milestones, results, finances, game RNG, or mutable save entities. Missing/corrupt data cold-starts with captions enabled, documented accessible mix defaults, a fresh presentation bag, and no assumed milestone.

## Transport and lifecycle migration

Any future transport must retain:

- paired A/B sources and DSP-clock scheduling;
- phrase/bar scheduling only from trustworthy metadata;
- safe crossfade/natural-ending fallback;
- minimum dwell, hysteresis, density gaps, and anti-repeat bags;
- no routine UI restart;
- no speed-linked pitch/tempo change;
- focus/pause/device-reset recovery;
- missing/hash-invalid fail-closed behavior;
- one hardware/listener owner.

Prototype timings remain audition values. They become production defaults only through a separately reviewed configuration.

## Asset migration sequence

1. Owner auditions and exports ratings; no listening acceptance is inferred from machine evidence.
2. Human editorial review identifies candidate revisions and rejects weak/clichéd/fatiguing assets.
3. Rights review records permitted platform, synchronization, master, performance, editing, streaming/VOD, territory, term, attribution, and archival use.
4. Freeze an Owner-authorized source manifest with hashes and intended roles.
5. Reconcile current P05/P06/P13 production contracts and paths.
6. Design a production catalogue and import/content-delivery strategy.
7. Copy only authorized masters into the approved integration worktree or content pipeline; never move raw authority.
8. Apply approved import settings and validate hashes, loops, loudness, mono, transitions, speech, and lifecycle.
9. Run affected TypeScript/Unity/bridge/save tests plus Audio Oracle scenarios.
10. Obtain explicit integration acceptance before any campaign merge.

Generated raw WAV/AAC/MP3, model weights, caches, environments, tokens, account information, and private legal evidence remain outside Git.

## Required post-P05 changed-path refresh

Before proposing a production change list:

- resolve the accepted P05 and P06 branch SHAs;
- inspect changed scenes, prefabs, bootstrap/lifetime owners, listeners, input/menu/settings paths, Production/Stage registry, Visual Oracle, tests, bridge schema, generated DTOs, and build pipeline;
- inspect accepted P13 contracts or confirm their continued absence;
- identify the single owner for every collision-prone file;
- update the proposed dependency graph and test matrix;
- abandon any pilot assumption that conflicts with accepted production behavior;
- obtain authorization for every production path to be edited.

The old pre-P05 baseline is valid for the isolated laboratory only and cannot justify a later production patch.

## Collision analysis

| Surface | Pilot posture | Future risk | Required future action |
|---|---|---|---|
| `StudioLot.unity` | Untouched | Listener/coordinator/object collision | Inspect accepted scene; preserve listener owner; add only through authorized scene owner if needed |
| Bootstrap/persistent services | Untouched | Duplicate coordinator or lifetime mismatch | Reconcile with accepted app shell; one service owner |
| System menu/settings | Untouched | P05 UI/input conflicts | Settings owner integrates after changed-path refresh |
| Input System | Untouched | New action-map collision | Reuse accepted navigation/submit controls; no pilot action-map import |
| Bridge/schema/DTOs | Untouched | Contract/version collision | Contract owners define typed projection after P05/P06/P13 seal |
| Production/Stage registry | Untouched | Audio privately aggregating mutable state | Consume one owner-published closed projection only |
| Visual Oracle | Untouched | Evidence overlap and false authority | Keep Audio Oracle separate; reference shared build identity only |
| Build settings | Untouched | Lab scene entering production build | Continue explicit lab build; later production scenes owned by build owner |
| Audio assets | External only | Binary bloat, rights ambiguity, stale hash | Import/deliver only Owner- and rights-authorized hash manifest |
| User profile/save | Untouched | Audio presentation state contaminating save truth | Use approved save-independent preference service |

## Validation required after future integration

- Source/build/catalogue/provenance hashes match the authorized manifest.
- No excluded, missing, hash-invalid, prototype-only-without-authorization, or cross-era source is referenced.
- Existing production listener ownership remains single and valid.
- Routine UI does not restart score.
- 1×/2×/4× leaves audio pitch and tempo unchanged.
- P13 remains sole era/technology truth owner.
- P05/P06 state is consumed only through its accepted projection.
- Functional spoken/caption output matches the same receipt.
- Radio Off and Music Off lose no mechanics.
- Mono, Night, Speech First, captions, transcript, and independent buses pass.
- Save/Load, pause/focus, device reset, missing file, and deterministic replay pass.
- Existing P05/P06/P13 and save tests remain green.
- No lab scene appears in normal production build settings.

## Handoff limitation

This document prepares a boundary and migration checklist. It does not establish that the Audio Lab compiles, that any requested render exists, that Audio Oracle passes, that an API is final, or that production integration is acceptable.

Production integration is **prepared but not executed**. P05 collision is **none within this documentation handoff**. No Owner or human listening acceptance has occurred.
