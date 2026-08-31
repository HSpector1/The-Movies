# AI Music Foundry 01 — Provenance Register

**Status:** `PROTOTYPE_ONLY`; SCREENING GATE V2 HUMAN REVIEW PENDING  
**Opaque rights evidence:** `PS-MUSIC-PILOT-RIGHTS-20260831-01` — verified  
**Sensitive information included:** no

This register is a technical custody record, not a commercial-clearance or legal conclusion. Audio, weights, environments, caches, images, and binaries remain outside Git.

Committed path notation redacts the local OS username: `${PILOT_ROOT}` is the approved pilot root, `${TOOLING_ROOT}` is its sibling tooling root, and `${BOOTSTRAP_ROOT}` is the approved Python-bootstrap root.

## 1. Authority and route

| Item | Exact identity | License/status |
|---|---|---|
| Research package | `f803164357ad417cea3162cb2c329890868f2b19` | documentation authority |
| Stable Audio code | `Stability-AI/stable-audio-3` at `c3909628db1ae2b57bed40a493c73c67ad674dc5` | MIT |
| MLX writer | `optimized/mlx/scripts/sa3_mlx.py`, SHA-256 `f0804e6f33106123267a5706c038aec090ea2561ec7477686c96ab9f4388e17e` | official pinned path |
| Canonical model | `stabilityai/stable-audio-3-small-music` at `0fef1392cd842149a2b6d445e181c97608faac06` | Stability AI Community License plus incorporated terms; not cleared here |
| Optimized weights | `stabilityai/stable-audio-3-optimized` at `b5182df73f4aca4336c5c1b642ca6c44d5b085ec` | same prototype-only posture |
| Text encoder terms | T5Gemma/Gemma incorporated terms | further review required for any proposed commercial route |
| Rights evidence | `PS-MUSIC-PILOT-RIGHTS-20260831-01` | opaque verified pointer only |

Hugging Face authentication and exact gated-repository access were verified non-sensitively. No token, authentication/account username, account identifier, contact information, revenue, entity structure, affiliate information, registration material, or counsel advice was printed or stored.

## 2. Bootstrap custody

`uv`:

- version/tag `0.12.7`, source commit `61291a8ca5477a9ca653f14d2ac5665587c263fa`;
- official arm64 asset SHA-256 `127ebdda7ad953cdf198e964b570ea5771b85467ea93eb7cb6d6f8e6f55408f3`;
- installed binary SHA-256 `55936a60bff5de7ac04facb72f9e6fd0ffd9661063480224c3ab321c3f10caff`;
- installed at `${BOOTSTRAP_ROOT}/uv/uv`;
- MIT OR Apache-2.0.

Retained historical runtime:

- `cpython-3.11.16+20260825-aarch64-apple-darwin-install_only_stripped`;
- archive SHA-256 `a84adc050a29e0c7387c885ff13e6ac4b0027f9e841359e200d647313dbb5b03`;
- interpreter SHA-256 `e8896fef4a5276e345824169c6749f8eee83e4206ee7e0da204bfb00308e1514`;
- retained only as evidence of the stopped incompatible Python/NumPy preflight.

Active runtime:

- `cpython-3.12.14+20260825-aarch64-apple-darwin-install_only_stripped`;
- archive SHA-256 `8b0f1fa71eab7ca644e482c631807a1116fa848491051cd1c8d9429491de63a6`;
- interpreter SHA-256 `ac60cfe0268614638d0ffa35f3b0284fc7b3a11482723793455e17eeb278509e`;
- installed at `${BOOTSTRAP_ROOT}/python/cpython-3.12.14-macos-aarch64-none`;
- arm64, standard GIL.

Bootstrap manifest SHA-256: `9beb5ac3a8e2b48c1933f408be6042edf67f21eeb11b711bd7872d71c49801f3`.

No system Python, global package location, global PATH, shell profile, `/usr/local`, `/opt/homebrew`, or `~/.local/bin` was modified by the bootstrap.

## 3. Python wheelhouse

- Location: `${TOOLING_ROOT}/wheelhouse-py312/`.
- Wheels: 22.
- Total bytes: 79,075,942.
- Result: all binary; no source distribution or compilation.
- Top-level versions: `mlx==0.32.2`, `numpy==2.5.2`, `sentencepiece==0.2.2`, `huggingface-hub==1.29.0`, `soundfile==0.14.0`.
- `pip check`: passed.
- Import/version smoke test: passed.
- MLX/Metal deterministic smoke test: passed on GPU device 0.
- Manifest SHA-256: `181c66c11f568ab1bd0d6fcc9d7f94aca57f26ea4a97ad5de8243ae6dacaf626`.

Package notices remain part of the retained external custody set. SoundFile's bundled components must not be summarized as BSD-only; their own notices remain applicable.

## 4. Weight custody

| File | Bytes | SHA-256 |
|---|---:|---|
| `MLX/dit_sm-music_f16.npz` | 919,193,814 | `8ed3f38e2597f361ee675051f1265d9aa2ae2fffce1c61acd2e9fe31e1db1cbc` |
| `MLX/same_s_decoder_f32.npz` | 218,090,820 | `909928a8e6937c1ebe6ac4b729f0462bd3773704a11ea18278e42671dc69bfe4` |
| `MLX/t5gemma_f16.npz` | 567,443,068 | `8deb20489f36d9aec539f26c9c67321f99bc5fe300d470435ed6e76be4f16bbd` |
| **Total** | **1,704,727,702** | three approved files only |

The unused `MLX/same_s_encoder_f32.npz` is absent. The model-directory copies are same-filesystem hard links to the verified custody files.

## 5. Raw candidate register

All files are stereo PCM16, 44.1 kHz, exactly 5,292,000 frames and 120 seconds. Total raw bytes: 508,033,056.

| Candidate | Epoch | Seed | Raw SHA-256 | Unchanged non-clipping automatic status |
|---|---|---:|---|---|
| `FND-01__seed-104729` | `acoustic_electrical_1920_1932` | 104729 | `8228bd6e82131aac73b46357d57816748a18fe03a74f5219cc0cffdc5bde361d` | clear; human review pending |
| `FND-01__seed-130363` | `acoustic_electrical_1920_1932` | 130363 | `9f48682f5fef2feae4b7fafaf215d782b13cc6a96f09b0ada9083817582a7429` | clear; human review pending |
| `FND-01__seed-155921` | `acoustic_electrical_1920_1932` | 155921 | `d8d3d2865407e62b71526283d838b07eb34ff3a09acec2d5963ee733671dc28c` | clear; human review pending |
| `FND-01__seed-196613` | `acoustic_electrical_1920_1932` | 196613 | `94b77d7863ea41c3e25f4e5d20a5f9875a595b3fe526abed8f6fc508232c2fd6` | clear; human review pending |
| `FND-02__seed-104729` | `acoustic_electrical_1920_1932` | 104729 | `0ccc4d909372ee663ec73f89eb4e564589f276352953922f8b0c0cc274a98b06` | clear; human review pending |
| `FND-02__seed-130363` | `acoustic_electrical_1920_1932` | 130363 | `845f3f64e69dfc00c68df4017e21c5191d1888d8740aca45ed358e66fe498baa` | clear; human review pending |
| `FND-02__seed-155921` | `acoustic_electrical_1920_1932` | 155921 | `0f50f6054da018b6aea4b326c0f19ac7c293c221d60ae47e2303ac93deb2ddf9` | `STEREO_NEGATIVE_CORRELATION` |
| `FND-02__seed-196613` | `acoustic_electrical_1920_1932` | 196613 | `2cf1f4ff66f4a8dbd9e66d19da3426021849265b89be91f767dc552b1d24661a` | clear; human review pending |
| `FND-03__seed-104729` | `acoustic_electrical_1920_1932` | 104729 | `d86aa7452337825d16cf00ed0d120354b2415caef0cea712390b6f3cd61dc7be` | clear; human review pending |
| `FND-03__seed-130363` | `acoustic_electrical_1920_1932` | 130363 | `4771707e00bfa67d71c1daf947047f736358844a309b60fb56b28913dd53ef7b` | clear; human review pending |
| `FND-03__seed-155921` | `acoustic_electrical_1920_1932` | 155921 | `80dbbe935519e0f2b760b50a2699e14bd019235b3686f0be4ede822b6d22faaf` | clear; human review pending |
| `FND-03__seed-196613` | `acoustic_electrical_1920_1932` | 196613 | `2758952829f2eaf6593f0a6bd7689ea5f98bdc3c330b0b604b7fb77162c7f4a6` | clear; human review pending |
| `DFG-01__seed-104729` | `sampled_digital_1987_1999` | 104729 | `4e45485b694e7b8ebc511c2068a2b4b78c5a5e421ed22049af0f03aeb74377b1` | clear; human review pending |
| `DFG-01__seed-130363` | `sampled_digital_1987_1999` | 130363 | `9c7e2c319050b9b90edfc8e4dbd3cbcc899c5b63a13114bb7ac939715f79080f` | clear; human review pending |
| `DFG-01__seed-155921` | `sampled_digital_1987_1999` | 155921 | `eafcdb88f887ed9e88813460badc264b73810a451064a9cf696dd70411b5de15` | clear; human review pending |
| `DFG-01__seed-196613` | `sampled_digital_1987_1999` | 196613 | `ae1be0583540c21af16b9a137c1329eeff51801e5a604907b65cd68854502138` | clear; human review pending |
| `DFG-02__seed-104729` | `sampled_digital_1987_1999` | 104729 | `1da619261e8eb6d8badfc31ddeecde86347280a7756fa8193d230d4911c0e496` | clear; human review pending |
| `DFG-02__seed-130363` | `sampled_digital_1987_1999` | 130363 | `a1b1bfcb8a98b283d01a9444a476825f2e23326f3ef091006b70bc2806ce6d90` | clear; human review pending |
| `DFG-02__seed-155921` | `sampled_digital_1987_1999` | 155921 | `571c08c7fd8000e6a03c1ccf9dcfd415a2a17b9cfa6bc2df830d72de52cb6b27` | clear; human review pending |
| `DFG-02__seed-196613` | `sampled_digital_1987_1999` | 196613 | `24df6f6dce63c84e64be8638756bf82d24248880ae55387a68967e9df64263fa` | clear; human review pending |
| `DFG-03__seed-104729` | `sampled_digital_1987_1999` | 104729 | `3a0cb7b19b3baf7458490c76f677147eba2d153f748b8abcbeeb34da62a20622` | clear; human review pending |
| `DFG-03__seed-130363` | `sampled_digital_1987_1999` | 130363 | `c38841a0bdc0e6a5e24725951b872c0a704b2c943e2e67823383e51141f1e13e` | clear; human review pending |
| `DFG-03__seed-155921` | `sampled_digital_1987_1999` | 155921 | `efed159e0e6d18fbcb8628fd6e0ab70500be338b4905fd5ce7f4abbdb5b93d3d` | clear; human review pending |
| `DFG-03__seed-196613` | `sampled_digital_1987_1999` | 196613 | `78d5e27344ecf2f07e2423123048f5349c4d233491619345f0336542224f9866` | `TRAILING_SILENCE` |

The generation log has 24 unique output paths and 24 unique `(epoch, promptId, seed)` tuples. All return codes are zero, and all logged byte counts and hashes match the retained raw files.

## 6. Screening evidence graph

Screening Gate V1 remains immutable:

| Record | SHA-256 |
|---|---|
| `03_screening/metrics-automatic.csv` | `84871b94ac4456bcc9db34a15c0b7b39e01a504594066b3c70cbfa98a0adb24c` |
| `03_screening/rejections-automatic.csv` | `72fdac24623e1407b36ecfc3e2951f511e41b397a38d1a9d3fe0339a78978dba` |
| `03_screening/similarity.csv` | `ada93e24236ca7db63064c1d75d163b0f06488d37057d22896b6ed97abe07048` |

Screening Gate V2 adds, without replacing V1:

| Record | SHA-256/status |
|---|---|
| `03_screening/gate-v2/writer-verification.json` | `15e4f54c733ea4079d9ae28d9ebeac00316909853f74592f465136f32f5442c7` |
| `03_screening/gate-v2/writer-rail-verification.json` | `bde0688ed70fd6dafa218f800925928e304b8943fc699ffb3cb3b3a47822123e` |
| `03_screening/gate-v2/v1-preservation-manifest.json` | `89b84c699c6f4ec185dad8f4ab95daf74f47ae68db93c74ccb0c90f24e651a82` |
| `03_screening/gate-v2/metrics-objective.csv` | `cb889a3e206c4126fb35094c8b708b8d9afa7d9a9a51ed884d434706efce78cf` |
| `03_screening/gate-v2/endpoint-run-details.jsonl` | `c9916c99ed6c575c159c741a67bf6f543e7460eb46b4563ff9412ac47f986eb8` |
| `03_screening/gate-v2/review-segments.csv` | `ad44eff47b37a0a9e096a2a1c547d2972f493ea07ea6afbda6d23b801d17dfcb` |
| `03_screening/gate-v2/execution-note.json` | `35ed5515a9f5bdb3e1e8fde09b8e2695a6c175081ca5a5be21116423ea26e142` |
| `03_screening/gate-v2/v1-v2-core-derivative-equivalence.csv` | `dd7c58f3e03511863e599ccb278b3ad0dfbfca5e8f201113edf0b7d4cf29f501`; 96/96 byte-identical |
| `03_screening/gate-v2/carried-forward-gates.json` | `70ace54e4821979c43b11417efd30aca3c5b6c103203d8067fa8cf2ca77df521` |
| `03_screening/gate-v2/human-review.csv` | `d5c0ba884d9ac9a1868bfea301b8472b523c6b13e4d69676055ba2eca3238504`; 22 pending, two not required |
| `03_screening/gate-v2/final-disposition.csv` | `a7202e1eef8632d5bce23acb92fd9d057df02e6d1d3d0d17f8a0d81f07461cbe`; 22 pending, two automatic failures |
| `03_screening/gate-v2/family-status.csv` | `f484089dde2e01c6c23e2068194434a841092371d44a345a300193d51fafba60`; all six families pending |
| `03_screening/gate-v2/screening-summary.json` | `74073d73f1b50eb7cdd3e78fab282b2a5c21e6a7a1585a59ede697624bc7ee0a` |
| `03_screening/gate-v2/README.md` | `fdaaac2272faa52c5046032d67312e4ec2a85446ce346853ef3caf76faac5f18` |

Per candidate, Gate V2 retains a fresh:

- 48 kHz/24-bit converted WAV;
- two-pass loudnorm listening master targeting approximately −18 LUFS-I and true peak no higher than −1.5 dBTP;
- 192 kb/s AAC preview;
- 114-second loop audition;
- 12-second seam audition;
- waveform PNG;
- spectrogram PNG;
- six review excerpts;
- processing record with paths, hashes, measurements, and exact commands.

The execution note preserves an internal V2 correction: the first pass was stopped before aggregate publication after the negative writer rail was corrected from `-32768` to `-32767`. Twelve preflight logs remain historical evidence. The canonical rail-aware pass has 24 separate `__rail-aware-v2.json` logs and did not overwrite completed derivatives. A later metadata-only correction consistently marked the two unchanged automatic failures as not requiring finalist-eligibility listening.

No raw file was overwritten. Normalization is an audition-level comparison process and is not represented as undoing any baked waveform damage.

## 7. Rights gate

Every item remains `PROTOTYPE_ONLY`.

Potential commercial eligibility is not clearance. Any proposed use beyond this local evaluation still requires current license/registration review, affiliate/revenue review, Stability/Gemma/Hugging Face incorporated-term review, human-authorship analysis, similarity/musicologist review, platform and territory review, complete chain-of-title evidence, and qualified legal review.

Never ship:

- any candidate that fails or lacks a completed human screen;
- raw generative output as the default production master;
- a recognizable melody, recording, sample, performance identity, or protected reference;
- any output represented as exclusive, non-infringing, commercially cleared, production-ready, ship-cleared, or an aligned production stem;
- original *The Movies* music or an imitation of it.

The retained files must remain outside Git until the Owner records a retention decision.
