# Project: Studio — AI Music Foundry Marathon 01 Report

**Status:** COMPLETE — AUTONOMOUS PROTOTYPE FOUNDRY
**Asset status:** `PROTOTYPE_ONLY`  
**Production authority:** NONE  
**Unity integration:** NOT AUTHORIZED / NOT EXECUTED

## Time window

- Start: `2026-09-01T20:10:56Z` (`2026-09-01T22:10:56+02:00`, Europe/Paris)
- Deadline: `2026-09-05T14:10:56Z`
- New-large-generation cutoff: `2026-09-05T08:10:56Z`

The external recovery authority is `/Users/bruce/Project Studio Audio Foundry Marathon 01/00_state/MARATHON-STATE.json`. Chat history is not a recovery dependency.

## Branch and collision boundary

- Documentation branch: `codex/era-aware-audio-marathon-01`
- Exact base after calibration preservation: `65596e47f9e7b9de33bd9530ee573390416d329e`
- Prior pilot tip: `c8c80c4739f54ecb990a4518aae58365dc1bc4b0`
- Research authority: `f803164357ad417cea3162cb2c329890868f2b19`
- External marathon root: `/Users/bruce/Project Studio Audio Foundry Marathon 01`
- Documentation worktree: `/Users/bruce/The Movies - Audio Marathon 01`

The dirty shared checkout and every P05/P06/P13/Unity worktree are untouched. Unity, the packaged Project: Studio player, HID, screen control, bridge/schema/DTO surfaces, scenes, prefabs, AudioMixer, saves, and the Owner profile are outside this work.

## Phase A — preserve and reconcile

Result: **PASS**.

- All 24 existing raw WAV files were re-hashed against the immutable generation log.
- All 24 byte counts and SHA-256 values match.
- The authoritative V1 preservation manifest's four source records match exactly.
- 428 files across the existing V1/V2 screening and derivative evidence surfaces received a fresh read-only SHA-256 manifest.
- The 22 automatic-gate-eligible candidates remain eligible for machine-jury analysis, not human-approved.
- `FND-02__seed-155921` remains excluded for `STEREO_NEGATIVE_CORRELATION`.
- `DFG-03__seed-196613` remains excluded for `TRAILING_SILENCE`.
- No existing raw audio was copied, renamed, edited, or deleted.

External evidence:

- `/Users/bruce/Project Studio Audio Foundry Marathon 01/09_provenance/phase-a-reconciliation.json`
- `/Users/bruce/Project Studio Audio Foundry Marathon 01/09_provenance/existing-evidence-hash-manifest.csv`
- `/Users/bruce/Project Studio Audio Foundry Marathon 01/01_catalogue/existing-24-read-only-inventory.csv`

## Calibration preservation

The four calibration documents were found intact but untracked on the pilot branch. They were committed and pushed as `65596e47f9e7b9de33bd9530ee573390416d329e` before the marathon branch was created. Their content hashes are recorded in the provenance report.

## Evidence limitations

Technical and learned-model analysis is `ANALYSIS SIGNAL ONLY`. It cannot establish musical quality, historical authenticity, cultural acceptance, similarity clearance, non-infringement, copyrightability, exclusivity, or suitability for shipment. All selections in this marathon are provisional machine shortlists pending Owner listening and later rights review.

## Phase ledger

| Phase | Status | Evidence |
|---|---|---|
| A — preserve/reconcile | PASS | External inventories and reconciliation JSON |
| B/C — machine jury/existing 22 | PASS | 22-row external CSV; one learned-jury rejection; inherited V2 history unchanged |
| D — nine-epoch generation | SCREENED + R1 CLOSED | 120/120 new; canonical 144 reconciled; 20/20 bounded R1 rescue raws; 35/36 families pass |
| E/F — shortlists/refinement | PASS | 27 primaries, 27 alternates, complete primary derivative sets; nine one-shot refinements retained without automatic replacement |
| Optional Medium challenge | PASS | 18/18 comparisons; 15 technical passes, three rejections; no Small shortlist replacement |
| G/H — scripts/TTS/radio demos | PASS | 126-unit script bank; 30 clean/period scratch voice pairs; three corrected 304-second mixed reels |
| I — endurance/audition/return package | PASS | Nine four-hour simulations and rendered demos; offline app; Desktop Owner package with complete hash manifest |

## Phase B/C — local analysis jury

One official local learned model was adopted: LAION CLAP `laion/clap-htsat-unfused` at exact revision `8fa0f1c6d0433df6e97c127f64b2a1d6c0dcda8a`, with an Apache-2.0 model card. It runs offline alongside deterministic signal analysis and is used only for relative analysis signals.

The required existing-22 table is complete at `/Users/bruce/Project Studio Audio Foundry Marathon 01/03_analysis/existing-22-machine-jury.csv`. It contains six family-level preferred labels, six alternates, nine further eligible labels, and one learned-jury rejection. The learned rejection does not rewrite the inherited V2 screening record.

## Phase G — script bank

The original fictional script bank is complete: 126 units, exactly 14 for each of nine epochs. Every unit has a stable ID, verbatim caption, function/archetype/pace/formality tags, epoch performance grammar, and `PROTOTYPE_ONLY` status. Validation found 126 unique IDs and 126 unique normalized transcripts.

## Phase D — nine-epoch canonical pool

The commissioning catalogue contains exactly 36 distinct families and four fixed primary seeds per family. The six pilot prompts are byte-identical to their source register. Sequential offline Small-Music generation produced all 120 missing candidates without a failed job or destination collision. Combined with the immutable pilot pool, the canonical library now contains 144 unique IDs and 144 unique raw hashes.

Generation used the pinned route, no guide audio, no LoRA, no network model access, no cloud generation, no named-artist prompting, and reduced process priority. Each file was generated to a temporary destination, checked as stereo 44.1 kHz PCM16 at exactly 120 seconds, atomically published, made read-only, hashed, and logged.

Screening V3 found 122/144 canonical sources technically eligible and 113/144 eligible after the learned-jury mismatch gate. Five families therefore received their single authorized R1 prompt revision and four fixed rescue seeds. All 20 R1 renders completed. Eleven cleared technical V3; seven of those also cleared the jury mismatch gate. Four weak families passed after R1. `NHY-04` did not and is frozen as `FAMILY NEEDS OWNER / HUMAN AUDIO DIRECTION`; no second rescue round exists.

At `2026-09-01T21:07Z`, a radio-mixer self-test cleanup bug emptied only this isolated documentation worktree. External raw audio and evidence were outside the affected path and remained intact. The tracked tree was restored from pushed SHA `6d83a382a7da7ddac99dca0c574f978dbc084812`; bounded uncommitted marathon tools were reconstructed from agent context, and the offending recursive cleanup path was removed before any further use. The incident and recovery remain recorded in the external state rather than being hidden.

## Phase E — provisional shortlists and derivatives

The final reconciled jury pool contains 120 shortlist-eligible candidates from the 164-source canonical-plus-rescue pool. Diversity-constrained selection produced 27 primary provisional picks and 27 alternates, exactly six per epoch. All nine primary sets use three distinct prompt families, and no technically or machine-rejected source appears.

Every primary received a normalized 48 kHz/24-bit WAV, a 114-second loop-ready audition WAV, a 12-second seam audition, AAC preview, waveform, spectrogram, complete metadata, prompt/provenance pointer, and machine-score explanation. Source WAVs remain unchanged. The provisional shortlist CSV SHA-256 is `bc3d565e645509932e40282300a7086eb4cac7ec1765b8d80e976d94def252bb`.

The motif lane produced 12 isolated mono 48 kHz/24-bit `MOTIF SHAPE SKETCHES`, each 5–8 notes and approximately 4.5–5.8 seconds. They are unranked, unselected, not embedded in era tracks, and do not establish a Project: Studio motif.

## Phase F — bounded refinement

Exactly nine one-shot 120-second refinement candidates were generated, one per epoch, with fresh fixed seeds and one documented correction for the selected weakest machine dimension. Eight passed technical V3; `LFU-03-F1__seed-1400033` failed for negative stereo correlation. The eight passing candidates received the same offline CLAP analysis with no severe mismatch. Three showed a clean target-signal improvement, three showed mixed tradeoffs, two showed no machine improvement, and one was technically rejected. Originals and revisions remain preserved, and the provisional picks were not automatically replaced.

## Phases G/H — radio prototypes

The bank contains exactly 126 original fictional units—14 for each epoch—with full captions and performance grammar. The macOS built-in speech fallback rendered 30 scratch delivery units for the three requested anchor periods, preserving 30 clean and 30 distinct period-presentation WAVs. No voice cloning, real-person target, guide voice, cloud TTS, or paid API was used.

Three corrected mixed programs are authoritative under `/Users/bruce/Project Studio Audio Foundry Marathon 01/06_radio/demos-v2/`: EARLY STUDIO BROADCAST, POSTWAR STUDIO BROADCAST, and DIGITAL-ERA STUDIO BROADCAST. Each is 304 seconds, stereo 48 kHz/24-bit, captioned, transcribed, cue-sheeted, and labeled `RADIO CONCEPT PROTOTYPE`. A preserved v1 limiter behavior was corrected in the separate v2 root; all authoritative masters measure -1.9 dBTP.

## Phase I — endurance and offline audition

Nine deterministic four-hour schedules and nine approximately 30-minute compressed demonstrations are complete. All structural checks pass for repeat interval, family distribution, loudness discontinuity proxy, transitions, motif cooldown, silence, adjacency, asset presence, and seed replay. This is not proof of human fatigue tolerance.

The local Sites-based audition application contains 57 playable entries: 27 primaries, 27 alternates, and three radio reels. It stores ratings and notes only in local browser storage, exports CSV/JSON, binds only to `127.0.0.1`, has no telemetry or external runtime assets, and separates blind-safe catalogue data from the reveal index. Identity is revealed through the normal blind UI only after a verdict; this UI convention is not a security boundary against direct file inspection. Lint, static build, 168 asset checks, localhost smoke tests, and token scanning passed; the test server was stopped.

## Optional Medium challenge

The official pinned Medium MLX route passed its access, license-file, download-size, process-collision, and disk gates. Exactly 18 comparisons were rendered: the PICK-01 prompt family from each epoch with two fixed seeds. Fifteen cleared technical V3; three were rejected. The offline jury found no severe mismatch among the 15 eligible sources, with nine individual Medium rows exceeding their matched Small PICK-01 composite. The best eligible Medium result exceeded Small in six epochs, while E09 produced no technically eligible Medium result. Small remains the authoritative provisional shortlist; no model substitution was made.

The combined raw music count is 191: 144 canonical Small candidates, 20 R1 rescue candidates, nine one-shot Small refinements, and 18 Medium comparisons. Motif sketches and speech prototypes are separate prototype classes and are not included in this raw music-candidate count.

## Owner return package

The Owner-ready review package is:

`/Users/bruce/Desktop/Project-Studio-Audio-Return-Package-01/`

It contains 27 primary pick sets under E01–E09, three corrected radio demos, the complete offline audition application, machine rankings, epoch summaries, provenance/rights boundaries, integration handoff, rejection register, resume state, validation JSON, and a complete SHA-256 manifest. It contains no raw generation, model weights, package dependency tree, build cache, token, or credential.

Launch the packaged application by double-clicking:

`/Users/bruce/Desktop/Project-Studio-Audio-Return-Package-01/AUDITION-APP/START-AUDITION.command`

Then open `http://127.0.0.1:8765/`. The server does not open a browser automatically and binds only to localhost.

## Completion boundary and known limitations

- No human or Owner listening acceptance occurred.
- Machine analysis does not prove musical quality, historical authenticity, cultural acceptance, non-infringement, copyrightability, exclusivity, commercial clearance, or long-session comfort.
- `NHY-04` remains `FAMILY NEEDS OWNER / HUMAN AUDIO DIRECTION` after its only rescue round.
- E09 has no technically eligible Medium comparison.
- macOS speech outputs are scratch delivery prototypes with no independently pin-able or redistributable voice-model license exposed by the system route.
- The blind audition UI conceals identity during ordinary use but is not a security boundary against a technically sophisticated user reading the local reveal file.
- The isolated worktree recovery incident described above and an immediately corrected ignored-tool path placement are retained in `MARATHON-STATE.json`; neither changed production, P05, Unity, or authoritative audio.

All audio remains `PROTOTYPE_ONLY` or `PROTOTYPE_READY_FOR_OWNER_AUDITION`. Unity integration is prepared as metadata/documentation and was not executed. Production changes are none.
