# Project: Studio — AI Music Foundry Marathon 01 Provenance

**Status:** IN PROGRESS  
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

