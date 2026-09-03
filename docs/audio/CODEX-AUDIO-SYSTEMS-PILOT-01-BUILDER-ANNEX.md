# Project: Studio — Audio Systems Pilot 01 Builder Annex

**Scope:** isolated prototype tooling and Unity Audio Lab only

**Production merge:** not authorized or executed

**Audio status:** `PROTOTYPE_ONLY` / `PROTOTYPE_READY_FOR_OWNER_AUDITION`
**Human acceptance:** none recorded

## Roots and branches

- Documentation/tooling worktree: `/Users/bruce/The Movies - Audio Systems Pilot 01`
- Documentation branch: `codex/audio-systems-pilot-01`
- Documentation base: `c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf`
- Unity worktree: `/Users/bruce/Project Studio - Audio Systems Pilot 01 Client`
- Unity branch: `wip/audio-systems-pilot-01-client`
- Unity base: `29aea89a706a7f0961f5a460afc5bdb4d38d8395`
- External evidence/audio root: `/Users/bruce/Project Studio Audio Systems Pilot 01`
- Owner return root: `/Users/bruce/Desktop/Project-Studio-Audio-Systems-Pilot-01`

All Unity changes are additive beneath `Assets/ProjectStudioAudioLab/`. No generated audio, voice, model weight, cache, private legal evidence, credential, or token belongs in Git.

## Source authorities

| Authority | Exact ref |
|---|---|
| Era-aware direction and builder annex | `f803164357ad417cea3162cb2c329890868f2b19` |
| Pilot/calibration authority | remote tip `65596e47f9e7b9de33bd9530ee573390416d329e` at pilot start |
| Audio marathon authority and branch base | `c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf` |
| P13/P15 long-range research | `2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f` |
| Accepted pre-P05 Unity baseline | `29aea89a706a7f0961f5a460afc5bdb4d38d8395` |

P13 retains era/technology truth. P05/P06 and their future accepted contracts retain lot activity and gameplay truth. Audio receives typed fixtures/projections; it never manufactures those facts.

## Rebuild order

Run from the isolated documentation worktree unless noted. The provenance-closing builders deliberately require their own bytes to be committed at current `HEAD`, so do not run them from a dirty or uncommitted implementation state.

1. Confirm the Unity-process collision gate and both isolated branches.
2. Build or verify bounded source audio with the already pinned local environments; never regenerate a broad catalogue.
3. Publish responsive v2, transition v4, living-lot v3, radio v2, accessibility v4, and system-register v5 evidence.
4. Run fresh hostile source/evidence review and apply every mechanical remedy before freezing SHA-bound artifacts.
5. Freeze, commit, and push all documentation/tooling as documentation commit **D**. Confirm that worktree is clean and equals its upstream. No documentation/tooling bytes may change after this point without restarting at this step.
6. Before changing any **D**-bound external metadata, run `python3 tools/audio_systems_pilot_01/snapshot_unity_validation_run.py` to preserve the still-current successful pointer, then run `python3 tools/audio_systems_pilot_01/repair_unity_validation_archives.py` to publish/reuse the one committed non-destructive legacy supplement. This bootstrap ordering is mandatory for the current pilot evidence; both tools require their exact bytes to be committed at **D**.
7. From clean **D**, run `build_catalogue_identity_closure.py` and `publish_metadata_status_remedies.py`. Record the exact resulting management-v4 SHA. Update the additive Unity source pin to that exact SHA, commit and push Unity as commit **U**, and confirm the Unity worktree is clean and equals its upstream. This ordering is mandatory: management v4 embeds **D**, while Unity hard-pins the resulting manifest hash.
8. From exact clean **D** and **U**, run the checked-in process-gated Unity chain below. It writes the exact final log/XML destinations expected by `AudioLabValidationSummaryWriter`, exports `PROJECT_STUDIO_AUDIO_DOCS_SHA`, builds without launching, emits the Oracle and archive register, and finally writes the validation summary. Exit 75 means another Unity process was observed and the chain must be retried without terminating it. A later Unity or documentation source change invalidates the build, observations, and Oracle and requires a restart at step 5.

The chain eagerly snapshots every current-run pointer byte only after the Unity summary is `PASS`. On the next run, a matching immutable completed-run snapshot is fully verified and reused before consulting live D-bound artifacts; archival reads only that snapshot, validates every pointer size/hash, stages the archive on the same filesystem, rehashes it, and atomically promotes it. Content-addressed management-metadata history protects the SHA-rebinding boundary; `MANAGEMENT-METADATA-HISTORY.v1.json` explicitly registers every immutable D-bound catalogue, including valid intermediate bindings, while every Unity-referenced hash must be a member of that exact registered set. A separately labelled supplement for the one pre-remedy archive inconsistency preserves the original archive unchanged, restores only its metadata pointer projection, and does not rehabilitate that historical run: its preserved Unity outcome remains `FAIL`. Later invocations reproduce that immutable supplement from its own reachable, hash-authenticated historical repair-tool binding.

```sh
tools/audio_systems_pilot_01/run_unity_lab_validation.zsh
```
9. From the same clean, pushed **D**, rerun the identity/status builders first as a byte-identical verification, then build the downstream Oracle/audition chain. Abort if either identity/status manifest changes after **U** was pinned:

```sh
python3 tools/audio_systems_pilot_01/build_catalogue_identity_closure.py
python3 tools/audio_systems_pilot_01/publish_metadata_status_remedies.py
python3 tools/audio_systems_pilot_01/build_audio_oracle.py
python3 tools/audio_systems_pilot_01/build_audition_source_register.py
python3 tools/audio_systems_pilot_01/build_audition_app.py
python3 tools/audio_systems_pilot_01/build_audition_app.py --verify-only
```

10. Build a provisional complete register after the final Oracle/audition bytes, record its SHA-256, then run all eight final independent reviews against exact **D**, **U**, system-register hash, Oracle-suite hash, and that complete-register hash. If any review finds a source defect, return to step 4; do not package stale evidence. Freeze the eight reports, build their index, rebuild the complete register, and require its SHA-256 to remain byte-identical to the provisional value. Review prose/index must not introduce audio declarations; a changed final register restarts review against the new hash.

```sh
python3 tools/audio_systems_pilot_01/build_complete_audio_file_register.py
# Record COMPLETE-AUDIO-FILE-REGISTER.v1.json SHA-256; run/freeze all eight reports here.
python3 tools/audio_systems_pilot_01/build_hostile_review_index.py
python3 tools/audio_systems_pilot_01/build_hostile_review_index.py --verify-only
python3 tools/audio_systems_pilot_01/build_complete_audio_file_register.py
# Require the complete-register SHA-256 to equal the recorded provisional hash.
```

Every final report must contain the exact standardized documentation SHA, Unity SHA, system-register SHA-256, Audio Oracle suite SHA-256, and provisional/final complete-register SHA-256 binding lines. Any later hostile-review report change invalidates the index; rebuild and verify it before packaging.
11. Atomically update `00_state/AUDIO-SYSTEMS-PILOT-STATE.json` to exact `IN_PROGRESS` / `READY_FOR_PACKAGING`, with clean **D/U**, all live counts (including `audition_items`, `unity_editmode_passed`, `unity_playmode_passed`, and `hostile_review_lanes`), unique/resolved `ERR-0001` through `ERR-0008`, unique `DEC-0001` through `DEC-0012`, a completion entry containing `clean-SHA Unity` and `Audio Oracle`, and a next action that names package creation.

```sh
python3 tools/audio_systems_pilot_01/update_final_state.py READY_FOR_PACKAGING
```

12. Create the return package once. Its preflight independently repeats Git scope/upstream, canonical manifest, Unity/build, Oracle, audition, review, complete-register, and state checks before the Desktop target is created:

```sh
python3 tools/audio_systems_pilot_01/package_owner_return.py \
  --lab-app "/Users/bruce/Project Studio Audio Systems Pilot 01/09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app"
```

13. After the package independently verifies, add its exact `return_package_files` count, set the canonical state to `IN_PROGRESS` / `READY_FOR_FINAL_VALIDATION` with final validation named as the next action, and run the fail-closed full reconciliation. On PASS, atomically close the state as `COMPLETE` / `FINAL_VALIDATION_COMPLETE`, set Owner listening as the sole next action, and run the same reconciliation once more to verify the closed state. `REOPEN_AFTER_FINAL_FAILURE` is deliberately narrow: it is available only when that post-close run records `FAIL` in state closure while the preserved immutable package, exact D/U, and every bound live artifact still pass. It restores `IN_PROGRESS` / `READY_FOR_FINAL_VALIDATION` and recomputes the canonical count map before the affected proof is repeated:

```sh
python3 tools/audio_systems_pilot_01/update_final_state.py READY_FOR_FINAL_VALIDATION
python3 tools/audio_systems_pilot_01/validate_audio_systems_pilot.py \
  --lab-app "/Users/bruce/Project Studio Audio Systems Pilot 01/09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app" \
  --return-root "/Users/bruce/Desktop/Project-Studio-Audio-Systems-Pilot-01"
python3 tools/audio_systems_pilot_01/update_final_state.py COMPLETE
python3 tools/audio_systems_pilot_01/validate_audio_systems_pilot.py \
  --lab-app "/Users/bruce/Project Studio Audio Systems Pilot 01/09_unity-lab/Builds/macOS/Project Studio Audio Systems Pilot.app" \
  --return-root "/Users/bruce/Desktop/Project-Studio-Audio-Systems-Pilot-01"
```

Only after that post-`COMPLETE` validation writes a state-closure `FAIL`, with package and D/U evidence still valid, reopen before remedy/reproof; do not run `COMPLETE` again until a fresh `READY_FOR_FINAL_VALIDATION` validation has passed:

```sh
python3 tools/audio_systems_pilot_01/update_final_state.py REOPEN_AFTER_FINAL_FAILURE
```

The package builder refuses to overwrite an existing return root. Verification is separate from creation. A package-integrity or stale-D/U failure is not eligible for the narrow reopen operation: preserve the immutable package and resolve that as an explicitly versioned recovery rather than overwriting evidence. If a failed staging directory exists, inspect the exact error; never delete preserved evidence to make a test green.

## Canonical current manifests

| Concern | Manifest |
|---|---|
| Base required catalogue | `01_catalogue/AudioPrototypeCatalogue.v1.json` |
| Identity and no-randomness closure | `01_catalogue/AudioPrototypeCatalogue.identity-closure.v3.json` |
| Responsive generation / selections | `02_music-bundles/responsive/responsive-generation-register.v2.json`; `responsive-bundle-catalogue.v2.json` |
| Long-session density | `02_music-bundles/simulations/FOUR-HOUR-DENSITY-SIMULATIONS.v2.json` |
| Era transitions | `03_transitions/rendered-transition-catalogue.v4.json` |
| Living lot | `04_living-lot/living-lot-soundscape-catalogue.v3.json` |
| Management vocabulary | `05_management-sfx/semantic-pack/management-semantic-catalogue.v4.json` |
| Runtime radio | `06_radio/STUDIO-RADIO-RUNTIME-INDEX.v2.json` |
| Accessibility renders | `07_audio-oracle/accessibility-renders-v4/ACCESSIBILITY-PRESETS.v4.json` |
| Scenario-labelled Unity Oracle | `07_audio-oracle/AUDIO-ORACLE-SUITE.v1.json` |
| Unity validation | `09_unity-lab/UNITY-AUDIO-LAB-VALIDATION.json` |
| Runtime load register | `10_provenance/SYSTEM-AUDIO-ASSET-REGISTER.v5.json` |
| Complete bounded audio inventory | `10_provenance/COMPLETE-AUDIO-FILE-REGISTER.v1.json` |
| Audition source/build | `11_return-package/AUDITION-SOURCE-REGISTER.v2.json`; `08_audition-app/v2/AUDITION-BUILD-MANIFEST.json` |
| Final reconciliation | `10_provenance/FINAL-VALIDATION.v2.json` |

Older evidence remains preserved but is not a current consumer input.

## Determinism and immutable identity

- Audio source/derivative paths are explicit; there is no arbitrary recursive runtime scan.
- Every runtime file has a stable prototype ID and exact SHA-256.
- The complete offline provenance register adds a unique path-stable file ID to every bounded audio file and explicitly discloses equal-content groups.
- Catalogue motif sketches use no randomness; their nullable seed is closed with `NOT_APPLICABLE_NO_RANDOMNESS` and a reason, not an invented number.
- Responsive candidates preserve prompt, negative prompt, seed, model revision, code revision, weight revision, raw hash, and machine/human dispositions.
- Generated responsive variants are independent horizontal full mixes. They are never called stems.
- The radio scheduler and presentation decision model consume injected seeds and presentation history, never gameplay RNG.
- Four-hour simulations remain fixed to one supplied epoch per trace and exercise Full Music, Balanced, Sparse, and Off.
- Unity Oracle traces must be scenario-labelled Unity evidence with an exact `evidence_source` and assertion results; the Python verifier cannot author events. Reserve `UNITY_PLAYMODE_OBSERVATION` for the five actually observed PlayMode scenarios. Pure policy/scheduler, external-file validation, frozen-trace revalidation, and Editor offline marker evidence keep their narrower labels.

## External loader law

The Audio Lab resolves only the v5 system-register entries beneath an explicitly approved root. It canonicalizes the root and candidate, rejects absolute catalogue-relative paths, traversal, symlink escape, unsupported formats, duplicate IDs, missing files, hash mismatch, and every network URL. A refusal is visible and exact. There is no silent substitution, token, cloud request, or directory discovery.

Management vocabulary v4 is additionally direct-pinned because it is a status-language-only successor to the v3 manifest named by asset index v4. The adapter may bypass only that stale manifest-name equality after proving the complete v4 candidate path/SHA/byte and provisional-selection projections equal v3. All other v5/index bindings remain strict.

`PROJECT_STUDIO_AUDIO_PILOT_ROOT` is lab-only configuration. No absolute Owner path is embedded in production-facing source.

## Audio and voice generation boundaries

- Stable Audio 3 responsive generation is text-only; source audio was used to write briefs, never as model guide input.
- No prompt names an artist, song, composer, game soundtrack, or protected character.
- Small-SFX is bounded to the recorded official pinned prototype route; its legal/commercial questions remain unresolved gates.
- Management sounds use deterministic procedural synthesis.
- Radio voices use generic local macOS voices, no cloning or real-person imitation. These outputs remain local scratch material with redistribution unresolved.
- Period identity is led by copy/performance grammar. Mono/bandwidth/compression/saturation are bounded presentation treatments, not a universal “old radio” claim.

## Validation layers

Pure TypeScript tests cover deterministic decision and radio scheduling. Unity EditMode covers catalogue parsing, security, selection, transport math/state, radio, accessibility policy, and controls. Bounded PlayMode covers runtime lifecycle/event observation, while Unity Editor offline processor renders exercise final-output markers where batch audio permits. The latter are not AudioSource, mixer, built-player, or hardware-output captures. Code-sign verification binds the packaged macOS app. The complete-file register and final reconciliation rehash current/preserved media and all return-package files.

No machine layer judges musical quality, era fit, historical/cultural acceptance, voice performance, long-session comfort, accessibility conformance, copyrightability, exclusivity, non-infringement, or commercial clearance.

## Collision audit

The final path audit compares both branches to their exact bases. Documentation changes must remain under `docs/audio/` and `tools/audio_systems_pilot_01/`; Unity changes must remain under `Assets/ProjectStudioAudioLab/`. It rejects committed audio and P05/production paths. It does not merge, switch, clean, reset, stash, terminate another process, launch StudioLot, access the Owner profile, or modify production build settings.
