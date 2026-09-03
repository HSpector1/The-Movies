# Project: Studio — Audio Oracle 01

**Evidence class:** scenario-labelled Unity PlayMode observation, Unity batch policy execution, frozen-trace revalidation, and bounded Unity Editor offline output-processor marker render

**Acceptance class:** machine proof only

**Audio status:** `PROTOTYPE_ONLY`
**Human listening acceptance:** none recorded

## Purpose

Audio Oracle v1 makes the isolated Audio Lab’s decisions, transport events, mix targets, speech arbitration, captions, file refusals, and deterministic replay inspectable. It does not turn authored expectations into evidence and does not claim that metadata proves audible quality.

The canonical entry point is:

`/Users/bruce/Project Studio Audio Systems Pilot 01/07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json`

The suite binds the exact documentation SHA, Unity lab SHA, macOS executable SHA-256, v5 system-register SHA-256, runtime-observation file, fixture, seed, trace files, source-audio hashes, and the frozen twelve-trace four-hour density suite.

## Evidence chain

```text
explicit lab fixture + exact source identities
  → Unity batch external-cue policy/hash reference plus separately identified synthetic in-memory PlayMode transport observation
     OR Unity synthetic in-memory PlayMode lifecycle observation
     OR Unity batch decision/radio/file-validation execution
     OR frozen four-hour trace revalidation in Unity batch
     OR Unity Editor offline output-processor marker render
  → scenario-specific evidence-source label + assertions + DSP/event sequence
  → one current content-addressed trace pointer per scenario
  → preserved content-addressed prior trace generations plus suite manifest path/SHA-256
  → independent Python verifier
```

The verifier at `tools/audio_systems_pilot_01/build_audio_oracle.py` is intentionally misnamed for compatibility with the earlier lane: it only verifies the Unity-produced suite and cannot author a passing trace. It independently reconstructs the fixed decision inputs/replay projections and the declared PCM marker recipe, then compares the resulting hashes, fields, and samples to Unity’s output; that reconstruction is a consumer check, not a substitute runtime result.

## Required scenarios

| # | Scenario | Required proof boundary |
|---:|---|---|
| 1 | `early_era_normal` | supplied early eligibility selects a current Normal cue as policy; separately named in-memory clips prove transport scheduling/cancellation/crossfade mechanics |
| 2 | `mid_era_active` | supplied middle eligibility selects Active |
| 3 | `modern_era_blocked` | supplied modern eligibility selects Blocked |
| 4 | `normal_to_active_phrase_boundary_transition` | external cue remains a policy/hash reference while a separately named in-memory clip with a trusted synthetic grid proves the requested boundary; generated cue grids remain untrusted |
| 5 | `active_to_blocked_hysteresis` | request is held until target stability threshold is satisfied |
| 6 | `adjacent_era_transition` | explicit eligible boundary selects a hash-bound rendered prototype without audio owning era truth |
| 7 | `workspace_continuity_without_restart` | workspace presentation changes gain/density without routine transport restart |
| 8 | `radio_voice_ducking` | single speech owner and target bus gains are observed |
| 9 | `pa_interrupting_radio` | PA/help priority preempts lower radio presentation and preserves caption/transcript identity |
| 10 | `music_off_with_living_ambience` | score remains off while the supplied lot fixture remains present |
| 11 | `force_mono` | final-output processor marker preserved as stereo dual mono for independently measured channel equality |
| 12 | `night_mix` | limited-dynamic-range processor marker and offline render |
| 13 | `pause_resume` | logical playback cursor/history is retained and resumed without duplicate ownership |
| 14 | `simulated_device_reset` | sources recover from retained logical cursor with exact diagnostic |
| 15 | `four_x_simulation_unchanged_pitch_tempo` | game-speed fixture becomes 4× while audio pitch/rate remain 1.0 |
| 16 | `four_hour_anti_repeat_trace` | all twelve fixed-epoch density traces and their child hashes are independently rechecked |
| 17 | `missing_file_fail_closed` | missing identity refuses with no substitution |
| 18 | `deterministic_replay` | same exact seed and full canonical input produces identical typed/canonical decision outputs and SHA-256 fingerprints |

Two supplemental authority-compatibility scenarios exercise a 1940 Normal request without audio-owned era mapping and save/load compatibility across an era transition without audio owning authoritative save truth. They increase total scenario count without weakening or replacing the required eighteen.

## Trace record

Every trace contains, directly or through a hash-bound suite field:

- source Git SHAs and lab executable identity;
- catalogue and source-audio hashes;
- fixture and deterministic presentation seed;
- exact canonical decision-input projections, with typed input/output projections for replay;
- observed decisions and DSP/event order;
- selected cue and context/variant;
- requested/accepted transition boundary and fallback reason;
- target gains and buses;
- speech-owner events;
- caption/transcript identity where speech exists;
- refusal reason where playback is impossible;
- named assertions with pass/fail results;
- an explicit scenario-specific evidence-source class;
- optional Unity Editor offline output-processor marker-render identity.

Trace schemas and hashes are verified independently after Unity exits. The v2 runtime-observation record must name eight exact synthetic source roles, set all seven observation flags, preserve the sample-cursor relationships, match the Unity SHA/version, and bind its lowercase 32-hex nonce and generation time to one exact passed PlayMode testcase and its two exact nonce output lines. Any failed assertion, stale Git SHA, missing trace, mismatched binary/catalogue/audio hash, duplicate scenario, unrecognized or overstated evidence-source label, incomplete long-session binding, or malformed marker render fails the suite.

Every event also carries an exact `timing_basis`. The `0.0`, `0.15`, and `0.35` values on synthetic PlayMode-observation events are authored sequence coordinates used to state ordering; they are not observed DSP timestamps. Those synthetic events therefore carry a null `requested_dsp_deadline`. In this suite, only `EXTERNAL_CUE_PHRASE_POLICY_ONLY` carries a non-null deadline because that value is independently produced by the pure transport planner; decision, hysteresis, mix, radio-policy, replay, frozen-summary, lifecycle, speed, and offline-render events carry null deadlines. Four-hour events are explicitly labelled `FROZEN_TRACE_SUMMARY_AUTHORED_SEQUENCE_COORDINATE;NOT_PLAYBACK_TIMESTAMP`, while offline-marker coordinates are deterministic sample time. Only events recorded by the runtime trace recorder may claim a runtime DSP-clock-relative timing basis. The independent consumer additionally freezes every DSP-event key, JSON type, named bus, marker-field nullability, scheduler-acceptance class, and pitch/tempo field so metadata rewrites cannot graft stronger evidence onto another event class.

## Phrase-boundary honesty

Generated responsive cues carry only estimated BPM with low confidence. They do not have a trusted downbeat/bar/phrase grid. Scenario 4 therefore keeps the external cue event explicitly policy-only and uses a distinctly identified synthetic in-memory clip/grid to prove scheduling mathematics and queue behavior. Normal runtime handling for the generated files is `SAFE_CROSSFADE`; the Oracle does not claim an external source was scheduled and does not convert an estimate into phrase certainty or melodic continuity.

## Offline processor marker renders

Batch execution does not guarantee access to the Owner’s real audio device. The suite therefore retains event/assertion traces for every required scenario and adds two PCM marker renders generated offline by the Unity Editor through the final-output processor:

- Force Mono: the two-channel output preserves exact dual-mono PCM, so the independent consumer can decode and measure zero channel delta and correlation rather than inferring equality from a collapsed one-channel file.
- Night / Limited Dynamic Range: the output preserves the bounded processed marker while the event binds the exact deterministic two-channel input recipe, processor order/parameters, and input/output peaks.

The Python consumer reconstructs the exact float32 recipe and PCM16 quantization, byte-compares the capture, decodes it, and independently measures the onset frame, 997 Hz tone, channel relationship, and Night peak reduction. These small renders prove the declared output-processor recipe and file identity. They are not AudioSource, AudioMixer, built-player, or hardware-output captures; they are not musical mix approvals and do not pretend to be full mixed demonstrations for all eighteen scenarios.

## Four-hour evidence

The Oracle binds `02_music-bundles/simulations/FOUR-HOUR-DENSITY-SIMULATIONS.v2.json` plus every one of its twelve child hashes. Unity independently checks:

- the manifest's exact contained v5 system-register path and current SHA-256;
- the exact Cartesian set of three explicitly supplied fixed epochs by Full Music, Balanced, Sparse, and Off;
- exactly 14,400 seconds per trace;
- child trace hashes and event identity/order integrity;
- no immediate cue or family repeat and at least three represented cue families in music-bearing traces;
- a fixed supplied epoch and no responsive-context switching in every trace;
- pitch and tempo scale fixed at 1.0 throughout.

This is a scheduler endurance proof, not a four-hour listening test. It does not independently prove authored gap bounds, shuffle-cycle completeness, or ambience eligibility in Music Off. Irritation, fatigue, musical flow, and silence quality remain Owner/human gates.

## Evidence locations

- Suite: `07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json`
- Per-scenario traces: `07_audio-oracle/traces/`
- Offline processor marker renders: `07_audio-oracle/captures/`
- Raw Unity PlayMode observations: `09_unity-lab/RuntimeEvidence/audio-oracle-runtime-observations.json`
- Unity validation: `09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json`
- Build receipt: `09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app.build-receipt.json`
- Final independent verification: `10_provenance/FINAL-VALIDATION.v2.json`

## Limits

Audio Oracle does not establish audibility on every device, subjective transition quality, score/ambience balance, speech intelligibility, fatigue, historical or cultural correctness, accessibility conformance, rights clearance, copyrightability, exclusivity, non-infringement, Owner acceptance, or shipping readiness. The next gate is Owner listening in the isolated lab.
