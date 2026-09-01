# Project: Studio — AI Music Foundry Marathon 01 Provenance

**Status:** COMPLETE PROTOTYPE PROVENANCE RECORD
**Rights status:** `PROTOTYPE_ONLY`

## Route lock

- Code: `Stability-AI/stable-audio-3`
- Code commit: `c3909628db1ae2b57bed40a493c73c67ad674dc5`
- Code license: MIT
- Backend: Apple MLX / Metal
- Model: `stabilityai/stable-audio-3-small-music`
- Canonical model revision: `0fef1392cd842149a2b6d445e181c97608faac06`
- Optimized weights revision: `b5182df73f4aca4336c5c1b642ca6c44d5b085ec`
- Python: CPython 3.12.14 in the isolated pilot environment
- Inference network mode: `HF_HUB_OFFLINE=1`
- Guide audio: none
- LoRA: none
- Artist, song, score, soundtrack, or protected-reference prompting: prohibited

Required verified weights remain external and are never committed:

| File | SHA-256 |
|---|---|
| `dit_sm-music_f16.npz` | `8ed3f38e2597f361ee675051f1265d9aa2ae2fffce1c61acd2e9fe31e1db1cbc` |
| `same_s_decoder_f32.npz` | `909928a8e6937c1ebe6ac4b729f0462bd3773704a11ea18278e42671dc69bfe4` |
| `t5gemma_f16.npz` | `8deb20489f36d9aec539f26c9c67321f99bc5fe300d470435ed6e76be4f16bbd` |

## Preserved pilot chain

- Pilot pre-calibration SHA: `c8c80c4739f54ecb990a4518aae58365dc1bc4b0`
- Calibration-preservation SHA: `65596e47f9e7b9de33bd9530ee573390416d329e`
- Live remote equality was verified after push.
- All 24 raw generation hashes match the existing generation log.
- Both existing exclusions and their V2 reasons match.

External Phase A records:

| Record | SHA-256 |
|---|---|
| `existing-24-read-only-inventory.csv` | `2f2b7cbea6b32fc12dbe1f16e2cf65ca7ee4b39761795aa4091713b38072e851` |
| `existing-24-read-only-inventory.json` | `08e85c2162c7867344cb243eb28617631116ded3a58bc0cf8e3b259beaaea835` |
| `existing-evidence-hash-manifest.csv` | `bb87a25a9b2b65c360bbafa6c60e50435669548d090f6896b954ba419667660a` |
| `phase-a-reconciliation.json` | `7ff2cf4bc2c78c0030b4c1791a9516abe6b74afc0afb6a80b0d99ccc878e9414` |

## Calibration document hashes

| Document | SHA-256 |
|---|---|
| `CODEX-AUDIO-REFERENCE-CALIBRATION-01.md` | `4aff19cd9378273200f487a85435fc2080215423ce63965806d68e543c36f5e2` |
| `CODEX-PERIOD-GAME-AUDIO-COMPARATOR-ATLAS-01.md` | `e5c91577c5231b6446bdc846d7b85360c94bccadc90e3940a08d615187fbaa4a` |
| `CODEX-HISTORICAL-BROADCAST-VOICE-BIBLE-01.md` | `8e62cdf47aa1dbc69ac8dcc9c9ec5686b9a6e7055730eb95a2faff48f5d9aa53` |
| `CODEX-GENERATED-CANDIDATE-REFERENCE-COMPARISON-01.md` | `dda937ee3aaf59e4e6a939e00acbb512b7bd12e36113b9cbe6d7a7d164455ab0` |

## Legal and evidentiary boundary

No automated model, hash, prompt register, machine score, output-ownership clause, or successful generation establishes copyrightability, exclusivity, non-infringement, commercial clearance, cultural acceptance, or human listening quality. Generated and derived assets remain `PROTOTYPE_ONLY` or, after packaging, `PROTOTYPE_READY_FOR_OWNER_AUDITION`.

## Local analysis model

- Model: `laion/clap-htsat-unfused`
- Revision: `8fa0f1c6d0433df6e97c127f64b2a1d6c0dcda8a`
- Model-card license: Apache-2.0
- Official code license: CC0-1.0
- Model files: 617,901,754 bytes, below the combined 8 GB jury cap
- Network during inference: disabled through Hugging Face and Transformers offline modes
- Classification: `ANALYSIS SIGNAL ONLY`

The external machine-jury summary contains hashes for all ten retained non-cache model files. The primary 614,525,833-byte model weight is SHA-256 `1cd3c601bc4afe0fa87be3de4c13dd2cfadd249fac1e29acf74a9b296c3219bb`.

## Marathon canonical generation

The 120 new canonical sources were generated sequentially under the same route lock. No raw pilot source was copied or regenerated.

| Record | SHA-256 |
|---|---|
| 144-row prompt catalogue CSV | `193d5f56a6b3fb6de59d89129f46b9a9e203c43ea4ea8c9be49d5c7dac49f8e5` |
| New-120 raw inventory CSV | `09ae58ebb8f01acbb75ee77ccb26fd7e823b0818cf8107164565dc9a7f15d3f2` |
| Combined canonical-144 inventory CSV | `13f2b4c2e3cc19ca568956ad7c384ba0ca621526e8eec048bb100895ac8faa95` |
| Canonical generation JSONL | `d652500c6d0ec97153f73496e1c1568cd1684f9f00dc1b393c2bd578d5e5b394` |

Every new raw WAV is read-only, exactly 120 seconds, PCM16, stereo, 44.1 kHz, and uniquely identified by SHA-256. Generation stdout/stderr and exact argv are retained per candidate under the external marathon logs.

## Preserved-evidence pointer note

The historical V2 `screening-summary.json` still contains two pointers to superseded pre-correction evidence hashes. Both named historical files remain preserved in the 428-file reconciliation manifest, and the current canonical V2 files were independently hashed. The marathon does not edit old screening history merely to refresh those pointers.

## Rescue, shortlist, and refinement chain

| Record | SHA-256 |
|---|---|
| Canonical-plus-R1 164-row inventory | `d939efff6f25119362cc63a79fbf1fe9ced3d5c50acc9467221e1a15b345a6a4` |
| R1 jury CSV | `ca8f389978ff9a61ba34d647c9f1d931f99eb9da2088a15d0831161555afbb07` |
| R1 candidate reconciliation | `38f3d7a4f43d9031653e9c8a5cb6c3447ba7737c2a6d36fc6ec58f8ada4766b6` |
| Frozen shortlist-ready jury CSV | `6e898008c3018573df8bdb172153929dc46c1d10d2a01288b090bc71c688f4c3` |
| Provisional shortlist CSV | `bc3d565e645509932e40282300a7086eb4cac7ec1765b8d80e976d94def252bb` |
| Provisional shortlist JSON | `066a5d445c4814d1be29230b06da858559ca0fb249a0d5e34e5488d590b5a87c` |
| Refinement comparison CSV | `6205e3b621eb183effd5f3f5a6de53e36bdc6f2fbb052588537a7869d05cb3e4` |
| Refinement integrity manifest | `7f236fe922faa7c1c1f660da87504c2a5ba2f6ca34c45d6a67c3fb5853db9ecb` |

The rescue inventory contains 20 immutable one-round candidates. The refinement inventory contains nine immutable one-shot candidates. Every output retains exact prompt, negative prompt, seed, route, command, source path, byte count, and SHA-256. Neither lane overwrites an original or creates a second rescue/refinement round.

## Derived audition assets

The 54-row `MusicCatalogue.provisional.json` binds each selected raw source to its normalized master, loop derivative where applicable, seam audition, preview, visualization, and metadata. Its SHA-256 is `59567f65df2e3cbda3b71f5ce9b845d37c2b12134e95eac11f53cb0774fb7407`; validation SHA-256 is `b7bdbbf0c256bd418cb4f4e77cdfb0af9580bb41fb6142b68619137f6e3183e7`. Validation rechecked 540 referenced files and hashes.

The motif register contains 12 generated shape sketches with no named-composer, famous-theme, guide-audio, or selection authority. The register CSV SHA-256 is `9031ca9008840026523719c4fa72d2a63ed81b5b9e7069f7a54cb1cdbc781b02`; validation SHA-256 is `60363fa401754a701206539af9faa2a0eee1ee8dbe14098fd225ac8b8eae0366`.

## Radio, endurance, and application provenance

- Script-bank JSON SHA-256: `04bf3b0838c19953f12b41dfb1d73a475cbfa34e044b3e4654e44458a2faadd8`
- Voice prototype manifest SHA-256: `3ba286324ec728e0ca7e1339d90537386d31c0b0c346367c7fc7054107af9169`
- Local TTS route-gate SHA-256: `6cc9058e72d3e2a73e7fedc992759a7c6a496ec5147314b4ab7913b00aa22d9d`
- Corrected radio-demo v2 index SHA-256: `1eecd37e297cd6046f2e058a48b6825f08cea076034ba25a55d663d05fe9c725`
- Endurance index SHA-256: `3b022a828edfc1430ca6ad3c103f87493f9ebee277d98ca6f33e2b8cc4ff8147`
- Audition public catalogue SHA-256: `ed40847af28481ad4463095e65fad4757de4eab6eb85a26cdffb3934c25dff85`
- Audition reveal index SHA-256: `210701cbbe5f4c36aaed732134d13d26df9d5ad089afb28fe574d74e9560147c`
- Audition asset manifest SHA-256: `be8fa3ac7dc9e21f0060f2d718c0bb9736cb166a4de3f0b425480e207c312b45`
- Audition launcher SHA-256: `41a68ebe78ab098ee8fe7168a09da03cd755da98a68da9c9a20f385230e864a5`

Speech was generated only with installed generic macOS voices as scratch delivery prototypes. The route provides no independently pin-able or redistributable voice-model revision; the clean and period versions, OS/build record, commands, transcripts, captions, and hashes therefore remain evaluation evidence rather than proposed production voice assets.

No audio, model weight, credential, token, or absolute private runtime secret is committed to Git. Large derivatives remain outside the repository.

## Optional Medium route

The official text-only Medium MLX challenge reused the pinned Stability code commit and shared T5Gemma weight. It changed only the DiT/decoder pair and recorded a separate immutable generation tuple:

- Code: `Stability-AI/stable-audio-3` at `c3909628db1ae2b57bed40a493c73c67ad674dc5`
- Backend: Apple MLX / Metal
- DiT: `medium`
- Decoder: `same-l`
- Optimized repository: `stabilityai/stable-audio-3-optimized`
- Optimized revision: `da6edc54ddba10bfd79a077102ded687f80e882b`
- Duration/steps/CFG/APG/dtype: 120 s / 8 / 2.0 / 1.0 / fp16
- Guide audio, SAME-L encoder, LoRA, cloud inference: none
- Inference network mode: `HF_HUB_OFFLINE=1`
- Raw candidates: 18, all unique and immutable

| Medium route file | Bytes | SHA-256 |
|---|---:|---|
| `dit_medium_f16.npz` | 2,907,300,946 | `f9e5647ea3225818657d47d47ae4b34afa29c0568206ca89566c1a758944a38e` |
| `same_l_decoder_f32.npz` | 1,704,311,976 | `84924be2122d3a20fce443f40b782d9cd88e8e73707476326003ac47659a2287` |
| shared `t5gemma_f16.npz` | 567,443,068 | `8deb20489f36d9aec539f26c9c67321f99bc5fe300d470435ed6e76be4f16bbd` |

The two new files total 4,611,612,922 bytes, below the 8 GB challenge cap. The public optimized repository did not require a new access gate, payment, or click-through step. The existing Stability AI Community License Agreement and Gemma terms were preserved beside the weights with hashes in the route evidence. This records the applicable materials; it does not decide commercial rights for Project: Studio.

- Route JSON SHA-256: `6c0873b24fa8d4259be9583840bec397097d34fffa8427e5b9c8c26600a774d9`
- Integrity manifest SHA-256: `206514b89edf3a88fa6ab6435089a9370c91d88bb525a00b7a1a11f64e7f9739`
