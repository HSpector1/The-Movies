# AI Music Foundry 01 — Integration Handoff

**Status:** NO INTEGRATION AUTHORIZATION — SCREENING GATE V2 HUMAN REVIEW PENDING  
**Rights status:** `PROTOTYPE_ONLY`

Committed path notation redacts the local OS username: `${PILOT_ROOT}` is the approved pilot root, `${TOOLING_ROOT}` is its sibling tooling root, and `${BOOTSTRAP_ROOT}` is the approved Python-bootstrap root.

## 1. Current disposition

The generation phase produced the exact 24 authorized raw candidates. For the pinned writer only, Screening Gate V2 replaced V1's `+32767/-32768` predicate—which rejected a run of at least three detected samples or occupancy over `0.01%`—with model-aware material-distortion review. V1 missed the writer's negative rail `-32767`, although all 24 candidates still triggered its positive-rail run branch. Gate V2 did not regenerate, rewrite, repair, or select any music.

No family currently has a certified winner because the required audible and musical review could not be performed in this runtime. Six blind finalists do not exist. The Owner listening folder remains an empty scaffold:

`${PILOT_ROOT}/05_owner-listening/`

This document must not be read as authorization to import an audio file, write production code, modify a catalogue, change a schema/save, add middleware, or touch P05/P06/P13.

## 2. Gate V2 review handoff

An audio-capable human reviewer must use:

- instructions: `${PILOT_ROOT}/03_screening/gate-v2/README.md`;
- worksheet: `${PILOT_ROOT}/03_screening/gate-v2/human-review.csv`;
- review clips: `${PILOT_ROOT}/03_screening/gate-v2/review-clips/`;
- seam auditions: `${PILOT_ROOT}/04_working/gate-v2/seams/`;
- normalized full files: `${PILOT_ROOT}/04_working/gate-v2/normalized-48k24/`;
- objective metrics: `${PILOT_ROOT}/03_screening/gate-v2/metrics-objective.csv`;
- family status: `${PILOT_ROOT}/03_screening/gate-v2/family-status.csv`.

For each candidate that has not already failed an unchanged gate, the reviewer must audition:

1. first 30 seconds;
2. loudest measured section;
3. longest writer-rail-run neighborhood;
4. at least one quiet section;
5. the automatically selected RMS-change proxy, followed by a real major-section transition located by the reviewer if the proxy is not one;
6. ending;
7. seam audition.

The worksheet requires:

- `AUDIBLE CLIPPING`: YES / NO / UNCERTAIN;
- `DIGITAL CRACKLE`: YES / NO;
- `HARSH FLAT-TOP DISTORTION`: YES / NO;
- `OTHER GENERATION ARTIFACT`: YES / NO plus description;
- `MUSICALLY LISTENABLE`: YES / NO;
- vocals/speech, protected-reference concern, historical plausibility, parody/stereotype, management-game suitability, fatigue, and seam judgments.

Endpoint equality, writer-rail counts, or pre-serialization peak alone must not determine the audible result. Conversely, normalization must not be described as removing baked distortion.

## 3. Unchanged failures

The following non-clipping failures reproduced independently and remain excluded unless a later authorized investigation proves the original implementation defective:

| Candidate | Failure | Evidence |
|---|---|---|
| `FND-02__seed-155921` | `STEREO_NEGATIVE_CORRELATION` | three consecutive one-second windows below −0.2; minimum approximately −0.53115 |
| `DFG-03__seed-196613` | `TRAILING_SILENCE` | approximately 3.00864 seconds below the −50 dBFS silence criterion |

Their sibling candidates remain available for human review, so neither family currently requires a reroll.

## 4. Family completion law

After the human worksheet is complete:

1. Exclude every candidate with an unchanged automatic failure or a material audible/waveform failure.
2. Confirm each of `FND-01`, `FND-02`, `FND-03`, `DFG-01`, `DFG-02`, and `DFG-03` has at least one fully passing candidate.
3. Rank only the passing candidates within their own prompt family.
4. Select exactly one candidate per family.
5. If a family has no pass, stop and report that exact family. Do not backfill, reroll, or change a threshold without new Owner authorization.
6. If all six families pass, assign `C01`–`C06` and create the blind package without family or epoch identity in filenames or finalist metadata.

The identity key must live outside `05_owner-listening/`. The first-pass listening folders must contain only normalized full WAV, loop audition, seam audition, AAC preview, waveform, spectrogram, and redacted metadata JSON.

## 5. Owner decision after six finalists exist

The Owner should:

1. listen blind;
2. guess the era;
3. score musical quality, era feel, fatigue, annoyance, repetition, personality, management-game suitability, and seam quality;
4. reveal identities only after the first pass;
5. choose at most one preferred candidate and one alternate per epoch, or reject either whole epoch.

No favorite-based regeneration, extension, inpainting, audio-to-audio, motif derivation, source separation, or Unity integration is authorized before that decision.

## 6. Future technical boundary

If the Owner later authorizes an implementation wave, TypeScript/P13 remains authoritative for year, era, technology availability, milestones, production truth, blockers, and saved gameplay outcomes. Unity may eventually own only presentation details such as valid-catalogue track selection, anti-repeat rotation, DSP scheduling, aligned stems supplied by a commissioned source, mixer snapshots, local volume preferences, presentation randomness, and suspend/resume.

These generated prototypes provide no production-aligned stems and must not be represented as doing so.

## 7. Explicit prohibitions

Until a new Owner authorization:

- no Unity launch or import;
- no production code or data change;
- no TypeScript/Unity bridge change;
- no schema or save change;
- no P05, P06, P13, P14, or P15 implementation;
- no audio middleware or dependency addition;
- no regeneration, reroll, prompt/seed/parameter change, or model fallback;
- no cloud upload, paid API, training, LoRA, guide audio, inpainting, or audio-to-audio;
- no claim of copyrightability, exclusivity, non-infringement, commercial clearance, production readiness, ship clearance, or production stems.

## 8. Rollback and retention

Git rollback consists only of reverting the four documentation files in this pilot commit. No generated binary is tracked by Git.

Do not delete the bootstrap Python, `uv`, wheelhouse, virtual environments, weights, caches, raw WAVs, derivatives, or Gate V1/V2 evidence until the Owner records a retention decision and any license/custodian requirement is applied.

## 9. Next action

An audio-capable human completes Screening Gate V2. Only after all six families have a verified passing candidate may a fresh agent create the blind C01–C06 Owner package. Implementation remains unauthorized.
