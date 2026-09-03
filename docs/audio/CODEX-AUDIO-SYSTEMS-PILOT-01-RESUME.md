# Project: Studio — Audio Systems Pilot 01 Resume

**Recovery authority:** `/Users/bruce/Project Studio Audio Systems Pilot 01/00_state/AUDIO-SYSTEMS-PILOT-STATE.json`

**Prototype boundary:** no production merge, no P05 collision, no Owner/shipping acceptance

## First actions after interruption

1. Read the atomic state file in full. Use its exact `phase`, error ledger, decisions, counts, Git SHAs, and `next_resumable_action`; chat memory is not an authority.
2. Confirm the documentation worktree is `/Users/bruce/The Movies - Audio Systems Pilot 01` on `codex/audio-systems-pilot-01` and the Unity worktree is `/Users/bruce/Project Studio - Audio Systems Pilot 01 Client` on `wip/audio-systems-pilot-01-client`.
3. Do not switch, reset, clean, stash, merge, or modify any P05/campaign checkout.
4. Before Unity batch work, inspect active processes. If another Unity build/test is active, do content, documentation, or tooling work and retry later; never terminate it.
5. Verify both worktrees and their exact upstream refs before producing hash-bound evidence.

## Immutable starting refs

- Era-aware direction: `f803164357ad417cea3162cb2c329890868f2b19`
- Pilot/calibration tip resolved at start: `65596e47f9e7b9de33bd9530ee573390416d329e`
- Marathon base: `c457c3a35a66b2ab4b72b0ca379f118b2f1fa1bf`
- P13/P15 roadmap: `2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f`
- Unity pre-P05 baseline: `29aea89a706a7f0961f5a460afc5bdb4d38d8395`

## Current evidence chain

Use only the versioned current chain below. Preserve earlier versions as audit history; never silently promote them back to canonical use.

```text
AudioPrototypeCatalogue.v1.json
  → AudioPrototypeCatalogue.identity-closure.v3.json

responsive-generation-register.v2.json
responsive-bundle-catalogue.v2.json
FOUR-HOUR-DENSITY-SIMULATIONS.v2.json
rendered-transition-catalogue.v4.json
living-lot-soundscape-catalogue.v3.json
management-semantic-catalogue.v4.json
STUDIO-RADIO-RUNTIME-INDEX.v2.json
ACCESSIBILITY-PRESETS.v4.json
audio-assets-index.v4.json
audio-derivative-source-register.v4.json
audio-assets-validation.v4.json
  → SYSTEM-AUDIO-ASSET-REGISTER.v5.json
  → Unity runtime / build / Audio Oracle observations
  → AUDIO-ORACLE-SUITE.v1.json
  → AUDITION-SOURCE-REGISTER.v2.json
  → 08_audition-app/v2/AUDITION-BUILD-MANIFEST.json
  → COMPLETE-AUDIO-FILE-REGISTER.v1.json
  → Desktop return package manifest
  → FINAL-VALIDATION.v2.json
```

## Clean-commit generation law

The identity and status-language builders bind their own committed bytes, and Unity hard-pins the resulting management-v4 hash. Use this acyclic order: freeze/commit/push documentation/tooling as **D**; generate identity closure and management v4 from **D**; update the Unity hard pin; freeze/commit/push Unity as **U**; run the process-gated Unity chain from **D/U**; then rerun the first two builders only as a byte-identical check before downstream generation. Any source change restarts this sequence.

```sh
cd "/Users/bruce/The Movies - Audio Systems Pilot 01"
python3 tools/audio_systems_pilot_01/build_catalogue_identity_closure.py
python3 tools/audio_systems_pilot_01/publish_metadata_status_remedies.py
python3 tools/audio_systems_pilot_01/build_audio_oracle.py
python3 tools/audio_systems_pilot_01/build_audition_source_register.py
python3 tools/audio_systems_pilot_01/build_audition_app.py
python3 tools/audio_systems_pilot_01/build_audition_app.py --verify-only
```

The hostile-index/complete-register two-pass tail is intentionally omitted here; run it only in Final close order steps 5–6 after the final Oracle/audition bytes exist. The Unity Oracle suite must also be regenerated if either Git SHA, the app executable, the v5 system register, or any bound source hash changes. Never hand-edit an Oracle event to match an expectation.

## Expected machine counts

- Catalogue: 203 entries; 191 music candidates; 12 deterministic no-randomness motif sketches; 27 provisional primaries.
- Responsive: 36 targeted candidates, 32 eligible, four excluded, 12 selected horizontal full mixes.
- Responsive endurance: 12 traces, each 14,400 seconds.
- Transitions: eight atlas boundaries; nine current renders across three representative boundaries.
- Living lot: three 600-second layers, five fixtures, three diagnostic-only bandwidth/spatial presentations, 65 scheduled semantic details.
- Management: 15 families, 45 candidates, 15 provisional picks, 15 alternates.
- Radio: 126 audited units, 108 decorative-eligible, 18 functional-template units withheld, three typed fixtures, three 660-second programmes, three 30-minute simulations, three presenters.
- Accessibility: eight isolated bus contributions and six final-sum preset renders.
- Audio Oracle: eighteen required scenarios plus two supplemental authority-compatibility scenarios; exactly two current Unity Editor offline output-processor marker renders, explicitly not runtime mix captures. State records the earlier content phase as 124 generated/113 derived files, the two Oracle markers separately, AAC audition derivatives separately, and the whole bounded total dynamically.
- Runtime system register: 122 items. The complete audio-file count is intentionally recomputed after Oracle/audition output and must match the bounded filesystem rather than a remembered number.

## Failure classification

For an ordinary failure, record it in the state ledger, form a concrete hypothesis, make the smallest root-cause correction, run focused proof, run the affected full proof, commit/push coherent source work, and continue. Do not rerun an identical failure without changing hypothesis, instrumentation, implementation, or input.

Common exact checks:

- Missing/hash/format/traversal failure: preserve file, verify the declared root/path/hash, and require a visible refusal; do not substitute.
- Stale Oracle SHA: finish and push source changes, rebuild Unity evidence, then re-verify.
- Audition preview mismatch: keep source immutable and emit a hash-named v2 derivative; never overwrite an authoritative raw.
- Return root already exists: verify/preserve it; do not recursively delete it. A replacement requires explicit recovery handling and a new versioned target.
- Unity batch unavailable: retain EditMode/static/build evidence and record PlayMode/runtime limitations honestly; never launch StudioLot or the production game.
- Optional voice/SFX route blocked: retain scripts, scheduler, captions, procedural UI, placeholders, and exact limitation.

## Final close order

1. Compile the Unity lab, regenerate its additive scene, and run focused/full EditMode and bounded PlayMode proof.
2. Run the fresh hostile architecture, honesty, history, radio, accessibility, rights, P05, and evidence reviews before freezing the return package; act on every real finding.
3. Commit and push documentation/tooling as **D**. Before regenerating any **D**-bound metadata, run `snapshot_unity_validation_run.py` to preserve the still-current successful pointer and `repair_unity_validation_archives.py` to publish/reuse the one authorized non-destructive legacy supplement. Then regenerate management v4 from **D**, update its exact Unity pin, commit and push Unity as **U**, and confirm both clean upstream identities. Do not edit either source tree afterward.
4. Re-run `tools/audio_systems_pilot_01/run_unity_lab_validation.zsh` from exact **D/U**. It process-gates and writes the exact compile/EditMode/PlayMode/build/Oracle/archive-register/validation-summary evidence paths, exports **D**, and never launches the app. Exit 75 means wait for the unrelated Unity process; never terminate it.
   A successful run is snapshotted eagerly under `09_unity-lab/CompletedRuns/`. A retry archives only the exact pointer-named bytes from that immutable snapshot through a staged, rehashed, atomic promotion. Do not remove the completed-run snapshot or rewrite an older archive. The one bounded `ArchiveSupplements` record is a hash-authenticated metadata reconstruction; the original historical archive stays intact and its `FAIL` outcome remains authoritative for that old attempt.
5. Regenerate the clean-commit identity/status/Oracle/audition chain, then build a provisional complete register and record its SHA-256.
6. Run all eight final hostile reviews against exact **D/U**, system-register, Oracle-suite, and provisional complete-register identities. If any finds a source defect, return to step 2 and regenerate every SHA-bound downstream artifact. Freeze the reports, build their index, rebuild the complete register, and require byte identity with the provisional register; otherwise repeat review against the changed register.
7. Run `python3 tools/audio_systems_pilot_01/update_final_state.py READY_FOR_PACKAGING`. It atomically sets exact `IN_PROGRESS` / `READY_FOR_PACKAGING`, upserts unique/resolved recovery records, retains unique decisions, derives scoped complete-register/audition/EditMode/PlayMode/Oracle/review counts, adds the clean-SHA completion marker, and names package creation.
8. Build and independently verify the Desktop package once, only after all review remedies are frozen. Its labelled `STATE-AT-PACKAGING.json` is a timing snapshot, not the canonical final state.
9. Run `update_final_state.py READY_FOR_FINAL_VALIDATION`, then final validation. On PASS, run `update_final_state.py COMPLETE`, retain Owner listening as the sole next action, and rerun validation once to verify the closed state. If that post-close validation records a state-closure `FAIL` while the immutable package, exact D/U, and all bound live evidence still pass, `update_final_state.py REOPEN_AFTER_FINAL_FAILURE` restores `IN_PROGRESS` / `READY_FOR_FINAL_VALIDATION` and recomputes the canonical count map. It deliberately refuses package-integrity or stale-D/U failures; preserve those artifacts for an explicitly versioned recovery rather than overwriting them.
10. Stop every owned test/server process and retain Owner listening as the sole next action.

## Required stop conditions

Stop rather than expanding authority for payment, credentials, cloud upload, new legal terms, unclear/noncommercial asset/model terms, destructive action against preserved evidence, a required collision with active P05 files, or inability to stay inside the prototype boundary.

## Completion handoff

When `FINAL-VALIDATION.v2.json` is `PASS`, both isolated branches equal their pushed upstreams, hostile-review remedies are recorded, the return manifest verifies, and all owned processes are stopped, the only next action is Owner listening:

`/Users/bruce/Desktop/Project-Studio-Audio-Systems-Pilot-01/AUDIO-LAB/START-AUDIO-LAB.command`

The Owner then listens to responsive music, transitions, the lot, management SFX, Radio, and accessibility demonstrations; rates them; exports feedback; and decides whether revisions or a separately authorized post-P05 integration checkpoint should follow. No music theory is required.
