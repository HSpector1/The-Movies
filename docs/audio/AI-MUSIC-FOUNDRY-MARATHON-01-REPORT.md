# Project: Studio — AI Music Foundry Marathon 01 Report

**Status:** IN PROGRESS — AUTONOMOUS PROTOTYPE FOUNDRY  
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
| D — nine-epoch generation | RAW COMPLETE | 120/120 new; canonical 144 reconciled; V3 screening active |
| E/F — shortlists/refinement | PENDING | Pending |
| G/H — scripts/TTS/radio demos | IN PROGRESS | 126-unit script bank complete; speech prototypes pending |
| I — endurance/audition/return package | PENDING | Pending |

## Phase B/C — local analysis jury

One official local learned model was adopted: LAION CLAP `laion/clap-htsat-unfused` at exact revision `8fa0f1c6d0433df6e97c127f64b2a1d6c0dcda8a`, with an Apache-2.0 model card. It runs offline alongside deterministic signal analysis and is used only for relative analysis signals.

The required existing-22 table is complete at `/Users/bruce/Project Studio Audio Foundry Marathon 01/03_analysis/existing-22-machine-jury.csv`. It contains six family-level preferred labels, six alternates, nine further eligible labels, and one learned-jury rejection. The learned rejection does not rewrite the inherited V2 screening record.

## Phase G — script bank

The original fictional script bank is complete: 126 units, exactly 14 for each of nine epochs. Every unit has a stable ID, verbatim caption, function/archetype/pace/formality tags, epoch performance grammar, and `PROTOTYPE_ONLY` status. Validation found 126 unique IDs and 126 unique normalized transcripts.

## Phase D — nine-epoch canonical pool

The commissioning catalogue contains exactly 36 distinct families and four fixed primary seeds per family. The six pilot prompts are byte-identical to their source register. Sequential offline Small-Music generation produced all 120 missing candidates without a failed job or destination collision. Combined with the immutable pilot pool, the canonical library now contains 144 unique IDs and 144 unique raw hashes.

Generation used the pinned route, no guide audio, no LoRA, no network model access, no cloud generation, no named-artist prompting, and reduced process priority. Each file was generated to a temporary destination, checked as stereo 44.1 kHz PCM16 at exactly 120 seconds, atomically published, made read-only, hashed, and logged.
