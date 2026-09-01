# Project: Studio — AI Music Foundry Marathon 01 Machine Jury

**Classification:** `ANALYSIS SIGNAL ONLY`

**Asset status:** `PROTOTYPE_ONLY`

**Human/Owner listening represented:** NONE

## Adopted local model

- Model: `laion/clap-htsat-unfused`
- Exact Hugging Face revision: `8fa0f1c6d0433df6e97c127f64b2a1d6c0dcda8a`
- Model-card license: Apache-2.0
- Official code: LAION-AI/CLAP, CC0-1.0
- Retained model files: 617,901,754 bytes across ten non-cache files
- Runtime: CPython 3.12.14, `torch==2.13.0`, `transformers==5.16.1`, `librosa==1.0.0`, `soundfile==0.14.0`
- Execution: local only with `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`, and telemetry disabled
- Cloud upload, payment, voice/identity recognition, reference-audio database, and production-repository dependency: none

The model snapshot and its complete per-file SHA-256 manifest are external under:

`/Users/bruce/Project Studio Audio Foundry Marathon 01/03_analysis/models/laion-clap-htsat-unfused`

Two other routes were researched but not adopted. YAMNet duplicated the broad-classification lane and introduced a TensorFlow/Keras compatibility surface. AST offered another broad audio embedding but did not add enough independent capability to justify a second download and runtime. The marathon therefore uses one learned model plus deterministic signal analysis, within the two-model and 8 GB limits.

## Analysis protocol

For every candidate, CLAP receives six fixed ten-second windows beginning at 5, 25, 45, 65, 85, and 105 seconds. Normalized window embeddings are averaged. Relative text-association signals cover prompt/family/era language, broad instrument families, voice/speech, foreground/background tendency, melodic prominence, and parody/caricature association.

The deterministic lane measures or estimates tempo, beat stability, onset density, coarse section changes, spectral centroid/bandwidth/rolloff/flatness, dynamic range, crest factor, chroma repetition, long static regions, and loop-boundary discontinuity. Existing V2 loudness and technical evidence is joined without rewriting it.

An initial calibration pass showed that CLAP systematically favored a short generic foreground label over the deliberately specific management-background sentence. The severe mismatch rule was narrowed to require an extreme foreground signal *and* corroborating prompt-alignment failure. Raw signals remain in the CSV. This correction changed interpretation only; it did not change any audio, prompt, or inherited screening evidence.

## Existing 22 result

Output:

`/Users/bruce/Project Studio Audio Foundry Marathon 01/03_analysis/existing-22-machine-jury.csv`

- Candidate rows: 22
- `MACHINE-PREFERRED`: 6
- `MACHINE-ALTERNATE`: 6
- `MACHINE-ELIGIBLE`: 9
- `MACHINE-REJECTED`: 1
- CSV SHA-256: `83abc6a4fc4fa4c21148d1ab3c71b75347ffa6a5cd61d9f0d7f5dd8747da93db`
- Summary SHA-256: `026bf9067edeb66e4e368b7812005cadcea14c739870093b7a8bd7a0283f3a55`

`FND-02__seed-196613` receives the learned-jury label `MACHINE-REJECTED` for the corroborated `SEVERE_FOREGROUND_AND_PROMPT_MISMATCH_SIGNAL`. This does not alter its inherited V2 technical status. The two historical V2 exclusions remain excluded for their original unchanged reasons and do not appear in the 22-row jury output.

## Canonical and R1 result

The canonical jury processed the 122 sources that cleared V3 technical screening. It retained 113 without severe machine mismatch and marked nine `MACHINE-REJECTED`. The five sub-threshold families received their sole R1 rescue round.

The R1 jury processed only the 11 technically eligible rescue sources, using a 41-row comparison register containing the 36 canonical prompt families plus five R1 revisions. It marked seven eligible and four rejected for severe mismatch. Joined with the nine technical R1 rejections, the R1 result is seven eligible, thirteen rejected, and zero pending. Four families pass after R1; `NHY-04` remains `FAMILY NEEDS OWNER / HUMAN AUDIO DIRECTION`.

- R1 jury CSV: `/Users/bruce/Project Studio Audio Foundry Marathon 01/03_analysis/rescue-r1-machine-jury.csv`
- R1 jury CSV SHA-256: `ca8f389978ff9a61ba34d647c9f1d931f99eb9da2088a15d0831161555afbb07`
- R1 reconciliation SHA-256: `38f3d7a4f43d9031653e9c8a5cb6c3447ba7737c2a6d36fc6ec58f8ada4766b6`
- R1 family status SHA-256: `319d416785fc1b5d362b2c6e0d4acd75e8df2aa55500edc8c410d0e9987833fd`

## Limitations

The numeric fields are ranking signals, not calibrated probabilities. CLAP association cannot establish historical authenticity, instrumentation fact, audible artifact severity, originality, protected-reference safety, cultural acceptance, or long-session quality. The protected-reference field is only a prompt-wording check; it is explicitly not a copyright detector. No automated result establishes copyrightability, exclusivity, non-infringement, commercial clearance, Owner approval, or readiness for production import.
