# AI Music Foundry 01 — Execution Report

**Status:** BLOCKED — SCREENING GATE V2 HUMAN REVIEW PENDING  
**Rights status:** `PROTOTYPE_ONLY`  
**Research authority:** `codex/era-aware-music-direction-01` at `f803164357ad417cea3162cb2c329890868f2b19`  
**Pilot branch:** `codex/era-aware-music-pilot-01`  
**Opaque rights evidence:** `PS-MUSIC-PILOT-RIGHTS-20260831-01` — verified; no sensitive details recorded

Committed path notation redacts the local OS username: `${PILOT_ROOT}` is the approved pilot root, `${TOOLING_ROOT}` is its sibling tooling root, and `${BOOTSTRAP_ROOT}` is the approved Python-bootstrap root.

## 1. Outcome

The pinned Stable Audio 3 MLX route generated all 24 authorized 120-second candidates without a reroll, prompt change, seed change, parameter change, model change, or weight change. The 24 raw WAVs remain outside Git at:

`${PILOT_ROOT}/02_raw/`

Screening Gate V1 rejected 24/24 under its original PCM-endpoint rule. The Owner then authorized a bounded Screening Gate V2 correction for this exact writer. Gate V2 preserved every raw byte and all V1 evidence, created a fresh set of 48 kHz/24-bit derivatives, recomputed the format, nonfinite, DC, silence, stereo, mono-fold and loudness gates, and carried forward the remaining unchanged gates only where raw hashes or byte-identical V1/V2 derivatives made the V1 evidence applicable.

Gate V2 currently has:

- 22 candidates clear of the unchanged automatic non-clipping gates but awaiting required audible and musical review;
- one retained stereo-correlation failure: `FND-02__seed-155921`;
- one retained trailing-silence failure: `DFG-03__seed-196613`;
- zero candidates certified as fully passing, because this Codex runtime explicitly reports that it does not support audio input;
- zero selected finalists and no populated blind Owner package.

Machine measurements cannot substitute for the required judgments about audible clipping, crackle, distortion, vocals, protected-reference resemblance, historical plausibility, stereotype, fatigue, musical quality, management-game suitability, or seam audibility. Those fields remain explicitly pending rather than inferred.

## 2. Dependency Erratum

The original research specified Python 3.11 and NumPy 2.5.2. NumPy 2.5.2 requires Python 3.12 or newer, so the first attempt stopped correctly. CPython 3.12.14 replaced only the Python runtime. Every package, model, prompt, seed, parameter, weight, and hash pin remained unchanged. CPython 3.11.16 was retained for audit. No audio or weight was produced under the invalid environment.

The active Phase 2 environment used:

- CPython `3.12.14`, standard GIL, arm64;
- `mlx==0.32.2`;
- `numpy==2.5.2`;
- `sentencepiece==0.2.2`;
- `huggingface-hub==1.29.0`;
- `soundfile==0.14.0`;
- 22 verified binary wheels, 79,075,942 bytes, and no source build.

The retained bootstrap manifest is:

`${BOOTSTRAP_ROOT}/bootstrap-manifest.json`

SHA-256: `9beb5ac3a8e2b48c1933f408be6042edf67f21eeb11b711bd7872d71c49801f3`.

## Screening Erratum — Stable Audio MLX PCM Endpoint Clipping

Screening Gate V1 rejected 24/24 because its `+32767/-32768` detector rejected a run of at least three detected samples or occupancy over `0.01%`. The pinned official Stable Audio MLX writer was subsequently verified to clip float decoder output to `[-1, 1]` before PCM16 serialization. That detector missed the writer's negative rail `-32767`, although all 24 candidates still triggered its positive-rail run branch. Endpoint contact alone was not a valid generator-independent reject criterion. Raw files and V1 evidence were preserved unchanged. Screening Gate V2 evaluates material waveform or audible degradation rather than endpoint equality alone. No generation parameter, seed, prompt, model weight, or raw candidate byte changed.

The exact source is `optimized/mlx/scripts/sa3_mlx.py` at code commit `c3909628db1ae2b57bed40a493c73c67ad674dc5`, file SHA-256 `f0804e6f33106123267a5706c038aec090ea2561ec7477686c96ab9f4388e17e`:

- lines 233–235 reject nonfinite samples;
- line 236 applies `np.clip(audio, -1.0, 1.0)`;
- line 237 applies `(audio * 32767.0).astype(np.int16)`;
- lines 238–242 serialize the PCM16 WAV.

The multiplication means this writer's actual serialization rails are `-32767` and `+32767`; `-32768` is not the negative clamp endpoint. Gate V2 measures both actual rails. The pinned `np.clip` path together with all 24 generation-log pre-serialization peak readings above 1.0 establishes that clamping occurred. Rail counts or runs alone do not establish material audible distortion and are not by themselves a V2 failure.

The V1 raw-endpoint reject rule is classified:

> **INCOMPATIBLE WITH THIS APPROVED GENERATOR OUTPUT CONTRACT**

This ruling applies only to the pinned Stable Audio 3 MLX writer and is not generalized to another generator, writer, codec, or master-delivery gate.

## 3. Generation record

- Route: Stability AI Stable Audio 3 Small-Music through the official MLX script.
- Code commit: `c3909628db1ae2b57bed40a493c73c67ad674dc5`.
- Canonical model revision: `0fef1392cd842149a2b6d445e181c97608faac06`.
- Optimized-weight revision: `b5182df73f4aca4336c5c1b642ca6c44d5b085ec`.
- Backend: Apple MLX / Metal on Apple M3 Max, arm64.
- Generation mode after weight verification: `HF_HUB_OFFLINE=1`.
- Candidates: 12 `acoustic_electrical_1920_1932`, 12 `sampled_digital_1987_1999`.
- Seeds per family: `104729`, `130363`, `155921`, `196613`.
- Duration: exactly 120 seconds each.
- Parameters: `sm-music`, `same-s`, 8 steps, init noise 1.0, CFG 2.0, APG 1.0, DiT fp16, free-model release enabled.
- Raw format: stereo PCM16, 44.1 kHz, 5,292,000 frames.
- Raw total: 24 files, 508,033,056 bytes.
- Generation wall time: 91.01 seconds.
- Rerolls: none.

## 4. Weight verification

Exactly three approved weight files were downloaded and retained, totaling 1,704,727,702 bytes:

| File | Bytes | SHA-256 |
|---|---:|---|
| `MLX/dit_sm-music_f16.npz` | 919,193,814 | `8ed3f38e2597f361ee675051f1265d9aa2ae2fffce1c61acd2e9fe31e1db1cbc` |
| `MLX/same_s_decoder_f32.npz` | 218,090,820 | `909928a8e6937c1ebe6ac4b729f0462bd3773704a11ea18278e42671dc69bfe4` |
| `MLX/t5gemma_f16.npz` | 567,443,068 | `8deb20489f36d9aec539f26c9c67321f99bc5fe300d470435ed6e76be4f16bbd` |

`MLX/same_s_encoder_f32.npz` was not downloaded.

## 5. Screening Gate V1

Gate V1 result: 0 passed, 24 rejected. Every candidate tripped the original endpoint-run rule. One candidate also failed stereo correlation and one also failed trailing silence. That result remains preserved as the honest historical disposition under the then-sealed rule:

- `03_screening/metrics-automatic.csv` — SHA-256 `84871b94ac4456bcc9db34a15c0b7b39e01a504594066b3c70cbfa98a0adb24c`;
- `03_screening/rejections-automatic.csv` — SHA-256 `72fdac24623e1407b36ecfc3e2951f511e41b397a38d1a9d3fe0339a78978dba`;
- `03_screening/similarity.csv` — SHA-256 `ada93e24236ca7db63064c1d75d163b0f06488d37057d22896b6ed97abe07048`.

## 6. Screening Gate V2

Gate V2 recomputed, for every raw candidate:

- positive and negative writer-rail contacts;
- rail occupancy, distinct runs, per-channel maximum runs, run-duration distribution, and five-millisecond-gap clusters;
- near-full identical-sample runs and diagnostic transient clustering;
- RMS, crest factor, LUFS-I, LRA, true peak, DC, silence, stereo correlation, and mono-fold loss;
- normalized output verification;
- exact review coordinates for first 30 seconds, loudest section, longest rail-run neighborhood, quiet section, an automatically selected RMS-change proxy, ending, and seam.

Gate V2 carried forward rather than recomputed V1's byte-duplicate/similarity, excess-gain/peak-control, loop-boundary and seam-ratio results. All 24 raw hashes remain unchanged, and 96 independent comparisons establish that every V2 converted WAV, normalized WAV, loop and seam is byte-identical to its V1 counterpart. The equivalence register has SHA-256 `dd7c58f3e03511863e599ccb278b3ad0dfbfca5e8f201113edf0b7d4cf29f501`; the carried-forward-gates manifest has SHA-256 `70ace54e4821979c43b11417efd30aca3c5b6c103203d8067fa8cf2ca77df521`.

Observed diagnostic ranges were:

| Measure | Range |
|---|---:|
| Writer-rail channel samples | 112–13,898 |
| Writer-rail channel-sample occupancy | 0.001058%–0.131311% |
| Distinct channel-local rail runs | 12–5,332 |
| Longest individual channel-local rail run | 0.249–3.039 ms |
| Five-millisecond-gap cluster span | 0.590–89.773 ms |
| Raw RMS | −17.037 to −12.819 dBFS |
| Crest factor | 12.818–17.037 dB |
| Raw LUFS-I | −14.69 to −10.97 LUFS |
| Generator pre-serialization peak | 1.160–3.075, three-decimal values reported by `generation.jsonl` |
| Normalized LUFS-I | −18.01 to −17.99 LUFS |
| Normalized true peak | −6.81 to −3.30 dBTP |

These ranges describe the signals; they are not a replacement rejection threshold.

During the first V2 pass, an independent audit established that this writer's negative rail is `-32767`, not the generic PCM16 minimum `-32768`. The pass was interrupted before any aggregate V2 metric was published. Twelve historical preflight candidate logs and all completed derivatives were preserved. The corrected rail-aware pass reused those immutable derivatives, created only missing derivatives, and published canonical logs for all 24 candidates without overwriting a raw or derivative. This execution history is recorded in `execution-note.json`, SHA-256 `35ed5515a9f5bdb3e1e8fde09b8e2695a6c175081ca5a5be21116423ea26e142`.

Gate V2 files are retained under:

- `${PILOT_ROOT}/03_screening/gate-v2/`;
- `${PILOT_ROOT}/04_working/gate-v2/`;
- `${PILOT_ROOT}/07_logs/screening-gate-v2/`.

The canonical objective register is `metrics-objective.csv`, SHA-256 `cb889a3e206c4126fb35094c8b708b8d9afa7d9a9a51ed884d434706efce78cf`.

## 7. Required human review and block

The runtime returned `audio content omitted because you do not support audio input` to independent reviewers. Consequently:

- clipping class A, pass after listening: 0 established;
- clipping class B, human review required for finalist eligibility: 22;
- not required because an unchanged automatic gate already failed: 2;
- clipping class C, material distortion failure: 0 established, which is not a finding that the files are clean;
- candidates clear of automatic non-clipping gates and still pending human review: 22;
- candidates failed by unchanged non-clipping gates: 2.

Every family remains blocked pending an audio-capable human review. The review worksheet is:

`${PILOT_ROOT}/03_screening/gate-v2/human-review.csv`

No C01–C06 identity mapping exists and `${PILOT_ROOT}/05_owner-listening/` remains an empty scaffold.

## 8. Family status

| Family | Automatic non-clipping clear | Automatic failure | Human review pending | Finalist |
|---|---:|---:|---:|---|
| `FND-01` | 4 | 0 | 4 | none |
| `FND-02` | 3 | 1 (`FND-02__seed-155921`, stereo correlation) | 3 | none |
| `FND-03` | 4 | 0 | 4 | none |
| `DFG-01` | 4 | 0 | 4 | none |
| `DFG-02` | 4 | 0 | 4 | none |
| `DFG-03` | 3 | 1 (`DFG-03__seed-196613`, trailing silence) | 3 | none |

## 9. Rights and scope

Every raw file and derivative remains `PROTOTYPE_ONLY`. This report makes no claim of copyrightability, exclusivity, non-infringement, commercial clearance, production readiness, ship clearance, or production-stem support. The pilot does not replace the recommended human-composer and independently cleared shipping route.

No token, account identity, contact detail, revenue/entity classification, registration evidence, or legal advice is recorded. The opaque rights evidence ID is the only acceptance pointer.

No Unity import, TypeScript change, schema/save change, P05/P06/P13 change, model training, LoRA, cloud generation, paid API, guide audio, source separation, or production integration occurred.

## 10. Stop condition and next action

The six-family finalist law cannot be satisfied until an audio-capable human completes all required review fields and each family has at least one candidate passing every gate. The Owner or a designated audio-capable reviewer should complete Gate V2 against the prepared excerpts. No reroll is authorized by this report.
