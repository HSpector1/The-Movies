# Project: Studio — Era-Aware Music Implementation Reconnaissance 01

**Status:** DECISION-READY RESEARCH CANDIDATE
**Scope:** DOCUMENTATION ONLY
**Authority:** NO IMPLEMENTATION AUTHORIZATION
**Accepted TypeScript evidence:** `7811377cea1c1b9ddca2c17c626879504b23ed4e`
**Accepted Unity evidence:** `29aea89a706a7f0961f5a460afc5bdb4d38d8395`
**P13 research evidence:** `2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f`

This is a read-only reconnaissance. Unity, the packaged player, and batch mode were not launched. No code, project setting, scene, asset, dependency, DTO, schema, save, or P05/P06 surface was changed.

## 1. Executive technical finding

The accepted Unity client has no audio system to extend beyond its built-in Unity audio module, default project audio settings, and one listener in each inspected scene. It has no mixer, AudioSource, music manager, audio clip, audio setting UI, PA, ambience, radio, or audio test. The older browser/Phaser implementation is useful as design/test precedent but is not the current Unity architecture.

Native Unity remains the recommended first implementation route after an independent comparison. Unity’s DSP clock, scheduled playback, AudioMixer buses/snapshots, and the already-installed Test Framework cover the bounded first scope. FMOD and Wwise offer stronger authoring ecosystems, but add integration, banks/build workflow, licensing, listener migration, and current Unity 6.3 compatibility risk. The decision must be reopened if measured native tests fail or the approved radio/adaptive scope becomes much larger.

Prospective fields have different owners: the core scheduler owns calendar time; P13 owns global era/timeline truth; a future contract owner may map it to audio eligibility; event IDs stay in their source domains; and no owner is sealed for a closed lot-activity aggregate. The accepted live bridge is protocol 4 / projection 11 and contains `gameWeek`, but none of the proposed audio semantics. Its generated sources, contract, and active P05/P06 projection are collision surfaces and must not be edited now.

## 2. Inspection boundaries

### 2.1 Evidence roots

- TypeScript campaign repository at exact commit `7811377cea1c1b9ddca2c17c626879504b23ed4e`.
- Unity campaign repository at exact commit `29aea89a706a7f0961f5a460afc5bdb4d38d8395`.
- P13 reports `docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md` and `docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13-BUILDER-ANNEX.md` read in full from `codex/p13-p15-long-range-research-01` at research commit `2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f`.
- Unity editor version recorded in `ProjectSettings/ProjectVersion.txt:1-2`: `6000.3.22f1 (1c726e1fb402)`.

P05 is active and unsealed. P05 branch material is forward evidence, not accepted authority. No P05 content was edited or folded into recommendations as settled fact.

### 2.2 Evidence classification

- **CURRENT-CODE FINDING** is an observation at one of the exact accepted SHAs.
- **SOURCE-DERIVED FINDING** comes from one of the eight official/open-source sources in Section 6.
- **TECHNICAL INFERENCE** is a candidate architecture or tolerance that requires runtime proof.
- **PROJECT: STUDIO RECOMMENDATION** is the proposed choice, not authorization.

## 3. Accepted Unity client audit

### 3.1 Inventory

| Surface | Current-code finding | Consequence |
|---|---|---|
| Packages | `Packages/manifest.json:11,15` contains `com.unity.test-framework` `1.6.0` and built-in `com.unity.modules.audio` `1.0.0`. No FMOD, Wwise, or other audio middleware appears. | Reuse installed native/test capabilities; do not add a dependency in this package. |
| Project audio configuration | `ProjectSettings/AudioManager.asset:7-19` is effectively default: volume `1`, system/default sample rate `0`, DSP buffer `1024`, 512 virtual/32 real voices, no spatializer/ambisonic plugin, audio enabled. | **DO NOT TOUCH** until an authorized profiling wave measures a reason. These values are evidence, not target tuning. |
| Clips/mixers/sources | Exact-tree inspection found no WAV, AIFF, MP3, OGG, FLAC, M4A, `.mixer`, `AudioClip`, or `AudioSource`, and no score, ambience, PA, radio, or audio-manager component. The only audio-named repository file is the project AudioManager setting. | Audio foundation is **NEW**, not an extension of a hidden manager. |
| Listener ownership | `Assets/Studio/Scenes/StudioLot.unity:69537-69543` has one enabled `AudioListener` on the management camera. `Assets/Studio/Editor/Authoring/StudioLotAuthoring.cs:376-388` authors it; Cinemachine Brain uses `IgnoreTimeScale = true`. `Assets/Scenes/SampleScene.unity:142-148` also has one listener. | There is no demonstrated duplicate-listener bug: each scene has one. Cross-scene/co-load lifecycle remains **NEW validation**, not a current defect claim. |
| Build scenes | `ProjectSettings/EditorBuildSettings.asset:7-10` enables only `SampleScene`; the StudioLot scene is not in the pinned build list. | Future scene/audio ownership cannot be assumed from one authored scene. |
| Focus/suspend | `TycoonCameraController.cs:206-209` clears edge-pan eligibility on focus loss only. No `OnApplicationPause`, `AudioListener.pause`, audio focus owner, or resume policy was found. `ProjectSettings.asset:89-90,112-114` has `runInBackground: 0`, `muteOtherAudioSources: 0`, and `visibleInBackground: 1`. | Explicit audio lifecycle is **NEW**. Project settings alone are not a policy. |
| Simulation speed | `StudioLivingTime.cs:49-54,63-80,174-233` uses authoritative `gameWeek`, a 1×/2×/4× ladder, and `Time.unscaledDeltaTime`. `:276-280` starts living time paused after load. | Reuse the truth boundary; music MUST NOT read speed into pitch/tempo. Audio load behavior is **NEW**. |
| System menu/settings | `StudioSystemMenuHud.cs:124-166` controls the menu/input. It does not pause living time or audio and exposes no audio settings. | Audio preferences/pause semantics are **NEW** and require Owner UX decisions. |
| Saved preferences | Exact accepted-tree search found no production `PlayerPrefs` use for audio (or a production audio preference owner). | Any future audio preference store is **NEW**, presentation-only, versioned, and forbidden from entering authoritative save truth. |
| Live bridge | `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs:17-19` declares protocol `4`, projection/snapshot `11`. Exact-text inspection finds `gameWeek` but zero `calendarYear`, `musicEpochId`, `eraTransitionPhase`, `majorMilestoneId`, or `lotActivity`. | Calendar forwarding is core-owned; era mapping is **P13-DEPENDENT**; typed milestone projection is source-domain-dependent; activity is **P05/P06/P14-DEPENDENT WITH OWNER UNRESOLVED**. The generated file is **P05/P06 COLLISION — DO NOT TOUCH NOW**. |
| Offline wrapper nuance | `Assets/Studio/Runtime/Data/StudioLotSnapshot.cs:5-21,45-51` has a frozen offline `presentationContext.year`/`era` wrapper. Its comment explicitly distinguishes that fixture wrapper from generated live DTOs. | Do not promote the offline 1948 fixture into live authority. |
| Tests | The repository has a large EditMode suite and `Assets/Studio/Tests/EditMode/Studio.Tests.EditMode.asmdef`, but no audio tests. | Reuse the test assembly/conventions; add no dependency. Audio clock/transport/catalogue tests are **NEW**. |
| Provenance | `PROVENANCE.md:1-10` supplies an exact-source/license pattern but no audio entry. | **EXTEND** the policy for source sessions, clips, stems, contracts, and hashes. |

### 3.2 Audio assets and import settings

There are no accepted Unity audio assets, so there are no clip import settings to audit. `ProjectSettings/AudioManager.asset` is not an asset-provenance manifest. Any later import must document source WAV hash, imported asset GUID/path, source/import sample rate, channels, load type, compression format/quality, preload/background-load behavior, loop metadata, and built output identity.

## 4. Browser/Phaser audit — precedent, not Unity architecture

| Surface | Current-code finding at TS SHA | Reuse / reject for Unity |
|---|---|---|
| Central service | `ui/src/audio/audioService.ts:3-14,66-82` owns one product-wide service and retains desired state. | **REUSE concept:** one presentation owner and idempotent desired state. Do not port Web Audio code. |
| Music choice | `audioService.ts:153-166` chooses catalogue item `[0]`, immediately stops the old loop, immediately starts the new one; `:168-173` tears it down. | **REPLACE in future Unity:** shuffle bag, anti-repeat, scheduled boundary, continuous state. Keep existing browser code untouched. |
| Era registry | `ui/src/audio/registry.ts:19-21` has only `1948 -> music-1948.m4a`; `:29-61` falls back to nearest earlier/first row. `:7-10` contains an unsupported comment about four original-game ensembles. | Reject fixed 1948, first-track, wrong-era fallback, and unsupported comment as authority. Unknown Unity epochs fail closed. |
| Hardware seam/buses | `ui/src/audio/sink.ts:3-16` centralizes hardware and defines master/music/ambience/effects; `:42-96` provides a no-output ordered `RecordingSink`. | **REUSE concepts:** bus grammar, injectable ordered recorder. **EXTEND:** score/radio/PA/UI and DSP events. |
| Browser sink | `sink.ts:123-180,220-241,295-345` uses lazy `AudioContext`, looping `AudioBufferSourceNode`, immediate starts/stops, and silent fetch/decode failure. | **REPLACE for Unity:** native DSP scheduler and explicit failure evidence. |
| Preferences | `ui/src/prefs.ts:1-11,18-43,79-152` keeps tolerant, versioned volume/mute settings outside GameState/save. | **REUSE concept:** presentation preferences never enter gameplay save truth. Extend buses/modes. |
| Fixed presentation | `StudioLotScreen.tsx:294-300` hard-codes 1948. | Browser visual-spike fixture only; never audio era authority. |
| Speed/focus | `StudioLotScreen.tsx:4680-4727` keeps speed presentation-only. `:4750-4793` stops music/ambience when hidden and recreates them when visible, restarting music. | Reuse separation from speed; replace restart lifecycle with the explicit frozen-clock, mix-only menu, and device-reset cases below. |
| Single owner | `StudioLotView.ts:216-220` disables Phaser audio. | Reuse “one hardware owner” principle. |
| Assets/provenance | `AUDIO-PROVENANCE.md:1-44` inventories 14 arithmetic-generated, replaceable development M4As totaling exactly 975,085 bytes. | Useful provenance precedent. They are browser dev assets, not original-game evidence, Unity assets, or final music. |
| Tests | Exact relevant files include `ui/src/audio/sink.test.ts`, `ui/src/audio/wiring.test.tsx`, `ui/src/test/contracts/audio-service.contract.test.ts`, `ui/src/test/contracts/audio-provenance.contract.test.ts`, `ui/src/test/contracts/audio-hygiene.contract.test.ts`, `ui/src/test/contracts/prefs.contract.test.ts`, `ui/src/test/redteam/rt-audio-edges.redteam.test.tsx`, and `ui/src/test/redteam/rt-prefs-hostile.redteam.test.tsx`. | Reuse test intent—ordered no-output evidence, provenance/hygiene, lifecycle, mute, hostile preferences—not browser APIs. |

## 5. Seam classification

### REUSE

- Unity’s built-in audio module and existing Test Framework `1.6.0`.
- One central presentation-audio owner and one validated listener lifecycle.
- Asset IDs/catalogue metadata rather than code literals.
- Presentation preferences isolated from authoritative GameState/save.
- Provenance manifest/gate.
- No-output ordered test double and injected deterministic selection.
- Focus/background state treated as an explicit lifecycle event.

### EXTEND

- Browser bus vocabulary into Score Music, Radio Music, Ambience, SFX, UI, Milestone Stings, PA/Help, and Radio Voice.
- Provenance with composition/master/session/performer/stem/hash/import fields.
- Existing Unity test infrastructure with EditMode/PlayMode audio suites.
- Existing enabled-scene listener pattern with persistent-coordinator/co-load validation. The coordinator does not add a listener; a future persistent-listener migration would first remove/disable scene listeners under a separate sealed plan.

### REPLACE — only in a later authorized Unity design

- Browser `WebAudioSink`.
- Fixed `1948`, first-track-only choice, immediate stop/start, nearest-earlier fallback, and hidden-tab restart.
- Browser autoplay/unlock behavior with a platform-appropriate Unity lifecycle.

The accepted browser implementation itself remains **DO NOT TOUCH** in this documentation branch.

### NEW

- Unity audio director/coordinator without a new listener, music catalogue/validator, DSP transport, A/B sources per aligned layer, playlist memory, mixer/buses/context balance/independent ducking, preferences/settings UI, PA/radio/ambience layers, focus/pause/load/configuration-reset state machine, capture/Oracle instrumentation, and audio tests.

### DO NOT TOUCH

- `ProjectSettings/AudioManager.asset` absent measured profiling.
- Serialized scenes and `StudioLotAuthoring` during active P05.
- `StudioLivingTime`, system menu, accepted browser audio, and current provenance records except future authorized extension.
- P13’s inert placeholder `EraConfig`.

### P13-DEPENDENT

- Global era/overlap truth, global IndustryTimeline/technology eligibility, and any P13 `timelineMilestoneId`.
- The future mapping from sealed P13 truth to closed audio eligibility; the Audio Director’s creative aliases remain audio metadata.
- P15’s Legacy-finale truth; P14 retains ownership of its own event facts.

### CORE / OTHER-UPSTREAM DEPENDENT

- `calendarYear` belongs to the TypeScript core scheduler; P13 may consume/forward it but does not own the clock.
- Cross-package events require typed `{ownerDomain,eventId,receiptId}` identity; a bare `majorMilestoneId` is rejected.
- A closed `lotActivity` owner is **UNRESOLVED** until P05/P06/P14 seal and an authorized TypeScript presentation aggregator is assigned. Audio cannot place it in P13 or M2.

### P05/P06 COLLISION — DO NOT TOUCH NOW

- Generated bridge DTO/schema/contract.
- Current Production/activity projection.
- Live snapshot adapters, workspace/lot presentation seams, scene authoring, and all unsealed P05 forward evidence.

## 6. Eight-source technical register

Exactly eight mature official/open-source source families were inspected. No source code was copied and no dependency was added.

### 1. Unity 6.3 AudioMixer

- **Source/version:** [Unity 6.3 AudioMixer manual](https://docs.unity3d.com/6000.3/Documentation/Manual/AudioMixer.html), Unity 6.3 documentation snapshot.
- **License/terms:** Unity documentation/software terms; reference use only.
- **Relevant symbols:** `AudioMixer`, mixer groups, effects, sends/returns, snapshots, duck volume.
- **Pattern:** bus routing and mix-only state transitions.
- **Adaptation:** one mixer with score/radio/ambience/SFX/UI/voice separation and a small set of presentation snapshots.
- **Reject direct reuse:** documentation is not code; a snapshot must not encode era or gameplay truth.

### 2. Unity 6.3 scheduled playback and DSP clock

- **Sources/version:** [`AudioSource.PlayScheduled`](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/AudioSource.PlayScheduled.html) and [`AudioSettings.dspTime`](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/AudioSettings-dspTime.html), Unity 6.3.
- **License/terms:** Unity documentation/software terms; reference use only.
- **Relevant symbols:** `AudioSource.PlayScheduled(double)`, `AudioSettings.dspTime`.
- **Pattern:** absolute DSP-time, frame-independent stitching; Unity recommends starting scheduling work roughly 100–200 ms ahead. The DSP clock is sample based and pauses with audio-system suspension.
- **Adaptation:** injected absolute clock, paired A/B sources for each aligned layer, common starts, phrase-boundary queue, platform-measured lookahead.
- **Reject direct reuse:** sample scheduling cannot repair a bad asset seam, codec priming/padding, streamed-load lateness, or phase-misaligned stems; target platforms still need proof.

### 3. Unity 6.3 Audio Random Container

- **Sources/version:** [Audio Random Container manual](https://docs.unity3d.com/6000.3/Documentation/Manual/AudioRandomContainer.html) and [inspector reference](https://docs.unity3d.com/6000.3/Documentation/Manual/AudioRandomContainer-UI.html), Unity 6.3.
- **License/terms:** Unity documentation/software terms.
- **Relevant features:** shuffle and Avoid Repeating Last.
- **Pattern:** convenient variation primarily presented for SFX.
- **Adaptation:** optional ambience/SFX variation only.
- **Reject direct reuse for score:** it does not express epoch validity, transition phase, palette-family history, long dwell, context priority, injected selection proof, or Oracle logging.

### 4. Unity 6.3 clip/import inspection

- **Sources/version:** [`AudioClip.GetData`](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/AudioClip.GetData.html) and [`AudioImporterSampleSettings`](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/AudioImporterSampleSettings.html), Unity 6.3.
- **License/terms:** Unity documentation/software terms.
- **Relevant symbols:** PCM sample access; load type/compression/sample-rate/preload settings.
- **Pattern:** static source/import validation.
- **Adaptation:** validate approved source WAVs, hashes, duration, seam, stem alignment, and import metadata.
- **Reject direct reuse:** `GetData` cannot inspect streamed clips and compressed assets require compatible load settings; a static source check is not built-player scheduling proof.

### 5. Unity Test Framework

- **Source/version:** installed package `com.unity.test-framework` exactly `1.6.0`, as recorded by the accepted project manifest/lock.
- **License:** Unity Companion License identified by the installed package; use is already part of the project and must remain within its terms.
- **Relevant patterns:** EditMode and PlayMode fixtures/assertions.
- **Adaptation:** inject DSP clock, transport, catalogue, selection RNG, focus signal, and recording output; add no dependency.
- **Reject direct reuse:** existing tests contain no audio timing oracle and cannot substitute for built capture or listening.

### 6. Unity Open Project #1 / Chop Chop

- **Repository/commit:** [UnityTechnologies/open-project-1](https://github.com/UnityTechnologies/open-project-1), exact commit `608eac98df29cd97821a6115cd52dfb9027345b1`.
- **License:** Apache-2.0.
- **Relevant files/symbols:** `AudioManager.cs::AudioManager`; `AudioCueSO.cs::AudioCueSO` and `AudioClipsGroup`; `AudioCueEventChannelSO.cs`; `SoundEmitterPoolSO.cs`; `AudioConfigurationSO.cs`; `MusicPlayer.cs`; [audio-system wiki](https://github.com/UnityTechnologies/open-project-1/wiki/Audio-system).
- **Pattern:** persistent central manager, request channel, cue metadata, emitter pool.
- **Adaptation:** concepts only—one owner, typed cue metadata, explicit request boundary, pooled one-shots.
- **Reject direct reuse:** `UnityEngine.Random`, immediate-repeat avoidance only, ordinary `Play`, fixed-time/DOTween fades, no DSP/bar scheduler, linear normalized-to-dB mapping, acknowledged missing music crossfade, and unresolved TODOs. No code is copied.

### 7. FMOD for Unity

- **Source/version:** [FMOD Unity API 2.03](https://fmod.com/docs/2.03/unity/api.html), integration `2.03.14`, dated 2026-05-28; [official Unity integration welcome/supported-version page](https://www.fmod.com/docs/2.03/unity/welcome.html); [official licensing](https://www.fmod.com/licensing), checked 2026-08-31.
- **License:** proprietary FMOD EULA/project license. The current page lists Indie under USD 600k development budget (free only under the additional sub-USD-200k annual-revenue condition, otherwise USD 2,000), Basic USD 6,000, and Premium USD 18,000 per game, with registration/logo conditions. Recheck before procurement.
- **Relevant capabilities:** authored events/banks, parameters, snapshots, live update, profiling, dialogue/localization.
- **Adaptation if later selected:** author score/radio state and banks outside gameplay authority; keep P13 projection and Oracle wrappers project-owned.
- **Reason not to use now:** new runtime/listener/bank/build pipeline, integration and migration work, registration/licensing/logo burden. The official supported-version table must explicitly cover accepted Unity `6000.3.22f1` at spike time; a generic API page is not compatibility proof.

### 8. Wwise Unity Integration

- **Source/version:** [Wwise Unity Integration documentation](https://www.audiokinetic.com/en/public-library/edge/?id=index.html&source=Unity), comparator pinned to `2024.1.6`; [2024.1.6 release notes](https://www.audiokinetic.com/en/public-library/2024.1.7_8863/?id=pg_releasenotes_2024_1_6.html&source=Unity).
- **License:** proprietary SDK/project license under the [Audiokinetic SDK agreement, 2024-07-30](https://www.audiokinetic.com/download/documents/License_Agreements/Audiokinetic_SDK_Agreement_v3_2024-07-30.pdf). [Official pricing](https://www.audiokinetic.com/pricing/for-games/) checked 2026-08-31 lists Indie free through USD 250k production budget, Pro USD 8,000 first platform, Premium USD 25,000, Platinum USD 45,000; recheck before procurement.
- **Relevant capabilities:** music segments/transitions, states/switches/RTPCs, stingers, banks, non-programmer authoring and profiling.
- **Adaptation if later selected:** closed P13 values drive only authored presentation parameters.
- **Reason not to use now:** added authoring/SDK/bank/build workflow and proprietary license. The 2024.1.6 release note states a maximum supported Unity version of 6.0, below accepted `6000.3.22f1`; compatibility is not established.

## 7. Native Unity versus middleware decision

| Requirement | Native Unity | FMOD 2.03.14 | Wwise 2024.1.6 |
|---|---|---|---|
| Slow nine-epoch horizontal playback | `PlayScheduled` plus project catalogue is sufficient if tests pass | Strong | Strong |
| Three aligned layer groups | Multiple scheduled sources/mixer groups; custom metadata | Strong parameter/event authoring | Strong music/state authoring |
| Phrase/bar transitions | Custom scheduler/metadata required | Mature authoring | Mature interactive-music authoring |
| Bounded PA/radio | Custom catalogue/rotation/localization | Mature banks/dialogue workflow | Mature banks/dialogue workflow |
| Deterministic Oracle | Must be built, but fully controllable | Project wrapper still required | Project wrapper still required |
| Existing project fit | Built in; no new dependency | No current foundation; Unity 6.3 support not established | No current foundation; published Unity 6.0 ceiling is a concrete mismatch |
| Licensing/migration | Existing Unity terms; no extra runtime | Proprietary registration, pricing/logo, integration/banks | Proprietary project/platform pricing, SDK/authoring/banks |

**PROJECT: STUDIO RECOMMENDATION:** use native Unity first and prove it in a bounded M1/M3 pilot. This conclusion survived challenge because the initial state graph is small and slow, not because native is the Owner’s default hypothesis.

Reopen the decision if any of the following becomes true:

- measured native scheduling/streaming/performance cannot pass target-platform tolerances;
- a dedicated non-programmer audio team needs live authoring/profiling;
- approved design adds dense nonlinear transition matrices or hundreds of designer-authored adaptive events;
- extensive localized radio/dialogue bank management becomes a launch requirement;
- platform count and live mix profiling exceed the native team’s sustainable tooling;
- a compatible, pinned middleware spike plus signed license/cost/migration review demonstrates lower total risk.

No middleware may be added solely for hypothetical future convenience.

## 8. Provisional native architecture

This section is **TECHNICAL INFERENCE**, not production code or a final file plan.

```text
Authorized upstream projections
        │ core year; P13 era/overlap; mapped audio eligibility
        │ typed owner/event/receipt; separately sealed activity if any
        ▼
Unity projection adapter  ── rejects stale/unknown authority
        ▼
Presentation context resolver ── hysteresis/priority only
        ├── Catalogue + provenance validator
        ├── Shuffle bag / spoken cooldown memory
        └── DSP transport + injected clock/RNG
              ├── A/B scheduled sources per aligned layer
              ├── AudioMixer buses + exclusive context balance
              ├── independent speech duck / preference / menu gains
              └── Oracle event/capture recorder
```

The projection adapter does not calculate the incoming values. The context resolver may delay presentation to a musical boundary but cannot change semantic truth. The transport owns samples/time; the mixer owns gain/routing; neither owns the campaign.

### 8.1 Planned metadata

Each cue needs stable clip/cue ID, creative commissioning alias, closed upstream eligibility token/set, palette family, permitted neighbor overlap, motif exposure (`none`/`fragment`/`full`), BPM, meter, sample rate, channel count, exact integer frame length, bars/phrases, loop/entry/exit sample markers, layer group, gain trim, speech-occupancy notes, streaming/import intent, source/master hashes, and provenance/streamer-safe state.

Do not build a year-range lookup into Unity. Do not silently substitute nearest epoch. A catalogue can only answer, “Which validated assets are eligible for this already-published closed token/set?”

### 8.2 Streaming, memory, voices, scheduling, and loop proof

- Maintain a double-precision DSP timeline; never derive musical time from frame time, `Time.timeScale`, or `AudioSource.pitch`.
- Never decompress/preload the whole Standard catalogue. At 48 kHz stereo float PCM, 126–162 minutes × three full aligned layers is approximately **8.1–10.4 GiB** before overlap or overhead. The source-delivery disk equivalent at stereo 24-bit PCM is approximately **6.5–8.4 GB**, before full mixes, entries/exits, alternates, and archive sessions.
- Use a bounded **current/next working set** only. Spike `Streaming` for long score/radio music, and reserve `Decompress On Load` for short stings/idents/UI clips unless measured evidence supports another profile. Record source/build disk, resident/peak memory, read-ahead, decoder CPU p50/p95/max, underruns, and load latency per target.
- M1’s provisional native gate is no more than 512 MiB music-side resident/stream buffers for the current/next set on the lowest target, no scheduling miss/underrun in the endurance fixture, and headroom inside the current 32-real-voice project default. This is a measurement threshold, not permission to alter `AudioManager.asset`.
- Test the worst music overlap explicitly: three current layer sources plus three next/crossfading sources, with Radio Voice/PA, Radio Music where valid, representative ambience, UI/SFX, and a sting competing under the approved priority. Log physical/virtual voice counts and any starvation. Native Unity remains conditional on this test.
- Test one global speech arbiter: one voice maximum; PA/help over receipt bulletin over host/ad/ident; bounded queue/expiry/coalescing; Radio Voice ducks Radio Music/Score/Ambience; PA ducks every lower bed. Force Mono/platform-equivalent and assistive-technology speech attenuation are release gates, not optional polish.
- Schedule at least 100–200 ms ahead as a starting test point and increase lookahead based on measured streamed/platform behavior.
- Schedule every aligned layer at the identical absolute DSP start. Prefer continuously running phase-aligned layers whose gains change at a bar over starting a dormant layer mid-cue.
- Use paired A/B sources to queue the next cue before the current ending.
- Validate source PCM and importer metadata separately from built playback.
- Capture consecutive scheduled boundaries and layer transitions from a built target in M7. A correct source seam is necessary but not sufficient.
- Do not freeze one universal click threshold before composer-pilot listening. Calibrate objective discontinuity/spectral-delta metrics against blind accepted/rejected M3 loops, then seal tolerances.
- Hash the source, imported clip identity, catalogue, and captured output. Captured output hashes prove one artifact, not bit-identical playback across every device; device comparisons use measured tolerance plus listening.

### 8.3 Deterministic test injection

Wrap DSP time, presentation RNG, catalogue access, transport, focus signal, and output recorder behind injectable seams. Test selection with fixed seeds and event logs. Production may choose a fresh presentation seed, but neither test nor production seed enters GameState/save or affects outcomes.

The no-output recorder should capture ordered operations such as authority accepted, candidate set, selection, requested DSP deadline, scheduler acceptance, source/layer start/stop, exclusive context balance, independent duck/menu/preference gains, frozen-clock observation, reset/rebuild, failure/fallback, and hashes. A built engine-PCM capture separately finds the first rendered marker sample by normalized cross-correlation. Neither a frame callback nor scheduler acceptance is called “actual output”; physical-device latency requires calibrated loopback.

## 9. Audio Oracle engineering gate

The full ten-scenario definition is in the Builder Annex. Technical proof additionally requires:

- exact TS/Unity/binary/catalogue hashes and protocol/projection versions;
- output device, channel mode, sample rate, DSP buffer, import settings, and clip hashes;
- requested DSP deadline, scheduler acceptance, and engine-capture marker onset expressed in seconds and integer output samples; physical-device time only with calibrated loopback;
- phase alignment and summed headroom for every layer combination;
- ten-loop seam captures plus waveform/spectrogram analysis;
- one logical transport and one listener through scene/focus/pause/load/reset transitions; expected source count is three playing normally, three additional queued, and up to six playing during a three-layer A/B crossfade, with unintended extras rejected;
- four-hour epoch and twelve-hour cross-era logs with memory bounds;
- injected-clock deterministic unit proof and real-clock built proof;
- human listening and accessibility review.

Reject “sample-accurate” claims based only on matching WAV endpoints or a unit log. Unity scheduling removes frame gaps; it cannot repair composition, rendering, import, streaming, or hardware defects.

## 10. Collision-safe future file plan

Only after an authorized wave and a refreshed accepted base, likely new Unity-owned surfaces are:

- `Assets/Studio/Audio/` for cleared catalogues, mixer, and production assets;
- `Assets/Studio/Runtime/Audio/` for the presentation coordinator, validator, selector, DSP transport, mix/lifecycle adapter, and evidence recorder;
- `Assets/Studio/Tests/EditMode/Audio/` and `Assets/Studio/Tests/PlayMode/Audio/` for contract and playback tests;
- a presentation-settings surface owned outside gameplay save;
- an external rights/source-session archive referenced by stable IDs and hashes.

These paths are planning names only. An authorized implementation must first rescan the then-current tree for ownership/collisions. Generated bridge files are never edited by hand. Any TypeScript work follows sequential authority: the core/P13 owner first seals presentation-neutral era truth under separate authorization; only after P05/P06 acceptance may the contract owner version/generate bridge surfaces; only then may the Unity audio owner consume the mapping. This package authorizes none of those edits and assigns no activity aggregate to P13.

## 11. Technical stop conditions

Stop an implementation wave if:

- the target base is not the Owner-authorized sealed SHA;
- P05/P06 remains in collision with the proposed bridge/scene surface;
- core/P13/contract owners have not separately sealed the needed calendar, era/overlap, typed event, and mapped audio-eligibility semantics;
- no authorized upstream owner has sealed `lotActivity`, or proposed work touches P05/P06/P14 activity truth;
- listener lifetime or audio owner cannot be singularly established;
- scheduled playback misses the measured tolerance, duplicates, gaps, or clicks;
- aligned layers differ in frames/rate/phase or exceed approved headroom;
- 1×/2×/4× changes pitch/tempo or routine UI restarts a cue;
- focus/pause/load duplicates or replays stale music/milestones;
- an unknown epoch produces a false-era fallback;
- provenance/hash validation fails;
- middleware is proposed without a pinned Unity 6.3 compatibility and license/cost/migration decision;
- machine proof is offered in place of listening review.

Rollback remains presentation-only: disable the failing new audio root/catalogue and restore the last sealed presentation. No audio rollback warrants a gameplay save migration.

## 12. Reconnaissance conclusion

The codebase supports a clean boundary precisely because Unity has no existing music implementation to untangle. The safest future course is a new, isolated native presentation layer after P13 publishes closed truth, while preserving the browser system untouched as historical precedent. That conclusion authorizes nothing today.
