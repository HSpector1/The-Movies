# Project: Studio — Era Music Asset Provenance and Commissioning Plan 01

**Status:** DECISION-READY RESEARCH CANDIDATE
**Scope:** DOCUMENTATION ONLY
**Authority:** NO IMPLEMENTATION AUTHORIZATION
**Accepted TypeScript evidence:** `7811377cea1c1b9ddca2c17c626879504b23ed4e`
**Accepted Unity evidence:** `29aea89a706a7f0961f5a460afc5bdb4d38d8395`
**P13 research evidence:** `2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f`
**Research date:** 2026-08-31

This plan is a binding project procurement gate if the Owner adopts it. It is not formal legal advice, does not replace advice from qualified counsel in each launch territory, and authorizes no purchase, commission, generation, import, or implementation.

## 1. Procurement decision

**PROJECT: STUDIO RECOMMENDATION:** commission original, era-informed instrumental music from human composers and performers, with the composition and recording chain of title documented separately and then consolidated for the required uses. Preserve source sessions, aligned stems, edits, loop permissions, credits, releases, contracts, invoices, license snapshots, and hashes.

Stock/library music is an exception for low-risk prototypes or a narrowly approved gap, not the historical-score strategy. Public-domain compositions do not make later recordings public domain. Generative outputs may support a blinded direction-finding pilot after Owner approval; they are not presumed exclusive, copyrightable, non-infringing, or production-ready and are not the default shipping masters.

## 2. Why two rights columns are mandatory

**SOURCE-DERIVED FINDING.** A musical composition and a sound recording are separate works; ownership of one is not a substitute for the other. The U.S. Copyright Office permits combined registration only in limited same-owner circumstances. [U.S. Copyright Office composition/recording guidance](https://www.copyright.gov/register/pa-sr.html); [Circular 56A](https://copyright.gov/circs/circ56a.pdf).

For music incorporated into an audiovisual work such as a video game, the Copyright Office’s music-marketplace study describes synchronization clearance from both the musical-work owner and the sound-recording owner. [Copyright and the Music Marketplace, p.55](https://copyright.gov/docs/musiclicensingstudy/copyright-and-the-music-marketplace.pdf).

Related rights also protect performers and phonogram producers in the EU; moral rights and territorial differences require counsel rather than a US-only template. [EUR-Lex copyright overview](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=LEGISSUM%3Aeu_copyright). WIPO cautions that online availability is not public-domain status and that national exceptions differ. [WIPO copyright FAQ](https://www.wipo.int/en/web/copyright/faq-copyright).

Therefore every cue has two independent clearance statuses:

| Rights object | Minimum proof before production acceptance |
|---|---|
| Composition / musical work | Identified human author(s); split sheet; publisher/administrator/PRO status; work-for-hire analysis; present assignment or license; derivative/edit/arrangement authority; synchronization, reproduction, distribution, public performance/communication, making-available and promotional uses; territory/term/platform; registration evidence where pursued |
| Sound recording / master | Identified producer and recording owner; session and performer releases; union status; master assignment/license; editing, mixing, mastering, looping, stem recombination, compression, localization and platform conversion; synchronization, reproduction, distribution, making available, streaming/VOD, marketing, soundtrack and archival rights; territory/term/platform |

An asset is `CLEARED_FOR_IMPORT` only when both columns and every performer/session dependency are green for the intended use.

## 3. Contract policy

### 3.1 Commissioned composition and production

Every composer/producer agreement must be signed before work begins and must state:

- exact project code name, deliverables, revision rounds, schedule, fees, kill fee, payment milestones, and acceptance process;
- that no original *The Movies* audio, protected reference recording, recognizably similar theme, undisclosed sample, unlicensed loop, model output, or named-artist imitation may be used;
- original-composition warranty qualified by counsel, disclosure of all pre-existing material/tools/models/libraries, and a cure/replace obligation;
- ownership of the composition and master, with work-for-hire language where valid **and** a present backup assignment or sufficiently broad exclusive license drafted by counsel;
- synchronization with interactive visuals/gameplay; reproduction, distribution, public performance/communication, making available, adaptation, editing, arrangement, looping, crossfade, time/format conversion, stem isolation/recombination, localization, accessibility, patch/DLC, port, remaster, cloud/streaming/VOD, trailer/advertising/press, soundtrack-album, archival and preservation uses;
- worldwide territory, all approved current and future game/marketing platforms, and perpetual or copyright-term duration where commercially agreed;
- right to use approved excerpts in storefronts, trailers, social content, awards submissions, demos, events, and press without a second synchronization negotiation;
- whether a standalone soundtrack may be sold/streamed, revenue/accounting if any, metadata/credits, takedown remedies, and whether unused/rejected drafts remain restricted;
- delivery of editable session, MIDI/notation where applicable, full mix, no-limiter mix, 48 kHz/24-bit masters, aligned layer groups, tails, entries, exits, loops, alternate mixes, instrument/sample/plugin report, and checksums;
- confidentiality/embargo, attribution, approval/consultation boundaries, moral-rights consent or waiver only where lawful, representations, indemnity/limits negotiated by counsel, audit/record retention, and governing law/dispute process;
- explicit generative-AI prohibition by default, or a separately signed disclosure schedule listing model, version, provider, prompt/reference inputs, training/provenance statement, terms, output and human contributions;
- no voice, performance, or identity cloning;
- no composer, publisher, performer, distributor, library, or soundtrack partner may enroll a cue, master, stem, alternate, or derivative in Content ID/fingerprinting/claims systems without Project written approval; the agreement names registration ownership, channel whitelisting, a false-claim response/takedown SLA, Project takedown authority, and the same obligation for every downstream distributor/partner.

The U.S. Copyright Office’s work-made-for-hire circular shows why the phrase alone is unsafe: a commissioned work requires a signed writing and must fall within a statutory category unless made by an employee within employment scope. [Circular 30](https://www.copyright.gov/circs/circ30.pdf). Counsel must choose the correct structure; this plan does not declare any particular engagement legally work for hire.

### 3.2 Performer, session, and union gate

Obtain a signed release from every featured and nonfeatured musician, vocalist, announcer, actor, conductor, arranger, session producer, and other rights-bearing contributor before recording use. The release must identify session/date/deliverables and cover fixation, editing, looping, stem isolation, mix, sync, game/marketing/streaming/soundtrack uses, territory, term, credit, compensation, reuse, and approved publicity.

Union/guild coverage is an open legal and production review, never inferred from performer preference or budget. SAG-AFTRA’s ratified 2025 Interactive Media Agreement includes compensation and AI digital-replica consent/disclosure provisions; its producer guides and tiered agreements must be checked if covered voice performers are engaged. [2025 Interactive Media Agreement](https://www.sagaftra.org/contracts-industry-resources/interactive/2025-interactive-media-video-game-agreement); [Interactive producer resources](https://www.sagaftra.org/contract/interactive). AFM or other musician-union obligations, pension/health, reuse/new-use, payments, credits, and reporting must be reviewed with the relevant local/contracting body at the time of engagement. No outdated rate sheet is treated as current authority.

### 3.3 Public-domain and stock/library policy

- Verify public-domain status separately for the composition, arrangement, edition, performance, and recording in every target territory. A nineteenth-century melody recorded last year is not a free master.
- Do not rely on search-result labels, upload descriptions, “royalty-free” marketing, or online availability.
- A stock/library exception requires an archived signed/dated license and invoice; named licensor; asset ID/version; permitted interactive game, trailer, marketing, streaming/VOD, soundtrack, territory, platform, term, seat/project, redistribution and modification uses; attribution; Content ID/claim policy; indemnity; sublicensing/contractor permissions; and proof the licensor can grant composition and master rights.
- Reject subscription assets whose rights terminate with membership, whose platform/project definition excludes the intended build, whose Content ID policy can claim player streams, whose stems/loops/edits are prohibited, or whose source chain is undisclosed.
- Attribution obligations become build/store/credits acceptance items, not notes in an inbox.

### 3.4 Trailer, marketing, soundtrack, and streaming

The game license does not silently include trailers, ads, public events, influencer/VOD use, platform streams, or a soundtrack album. Each use is a checked contract field. Streamer-safe status is positive evidence that both composition and master, performer/session, and any sample/library/model terms authorize player livestreams and archived VOD; absence of a restriction is not enough for the green path.

Soundtrack-album rights require format/distributor/metadata/royalty/artist-name/artwork/PRO/neighboring-right and takedown review. If not procured, that does not block in-game use but the catalogue records `soundtrackAlbumAllowed: false`.

Every fictional station/service name, host identity, advertiser, product name, slogan, and implied endorsement must pass trademark/name/publicity/endorsement clearance before recording and again before shipment. “Fictional” is a creative description, not a clearance result.

## 4. Provenance archive

### 4.1 Required cue register

Every candidate, including rejected material, receives a stable ID and records:

- title/working title, epoch, palette family, composer/arranger/producer, performers and session;
- composition ownership/splits/publisher/PRO and agreement IDs;
- master owner, studio/engineer, session/release/union agreement IDs;
- pre-existing material, sample/library/plugin/impulse-response/model disclosures;
- source session path, application/version, export settings, sample rate/channels/bit depth/frame length;
- master, no-limiter, stem, entry, exit, loop, preview, waveform and spectrogram hashes;
- factual historical references and creative brief revision;
- similarity/cultural/listening/technical reviewers and dispositions;
- license scope: game, DLC/patch/port/remaster, trailer/marketing, streaming/VOD, soundtrack, territory, platform, term, modification/stems, attribution;
- legal status, import status, streamer-safe status, archive location, retention owner, and revocation/replacement history.

Use SHA-256 for file identity. Hashes do not grant rights; rights paperwork does not prove which binary shipped. Both are required.

### 4.2 Evidence archive

Archive immutable PDF or text snapshots of signed agreements, releases, invoices, rate/union determinations, license/terms pages, model cards, approved source lists, correspondence granting exceptions, identity documents where lawfully necessary, registrations, split sheets, session logs, cue sheets, credits, and every file-hash manifest. Access is restricted by role; personal data is not committed to the source repository.

The production repository stores only stable agreement/provenance IDs, allowed fields, source/master hashes, licenses suitable for repository inclusion, and build-facing status. Private contracts, performer details, credentials, and unreleased sessions remain in the controlled rights archive with backup/retention policy.

### 4.3 Status vocabulary

| Status | Meaning |
|---|---|
| `RESEARCH_ONLY` | Historical/reference material; never an asset candidate |
| `PROTOTYPE_ONLY` | May be heard in an isolated approved study; cannot be imported or shipped |
| `PENDING_RIGHTS` | Creative/technical candidate missing one or more legal proofs |
| `REJECTED` | Retained only for audit with reason; excluded from every build |
| `CLEARED_FOR_AUDITION` | Rights allow controlled team/Owner audition, not production import |
| `CLEARED_FOR_IMPORT` | Composition, master, performer/session, intended uses, provenance, hashes, and technical gates pass |
| `CLEARED_FOR_SHIP` | Imported asset and built use match the cleared scope; final counsel/producer sign-off recorded |
| `STREAMER_SAFE` | Positive livestream/VOD clearance for every rights layer; may coexist with `CLEARED_FOR_SHIP` |

No tool, folder name, invoice payment, or successful Unity import upgrades status automatically.

## 5. Procurement workflow

1. Audio Director issues an epoch brief with fact/interpretation/recommendation columns, prohibited clichés, motif permissions, layer/loop specs, and rights schedule.
2. Producer and counsel prequalify composer/performer/stock vendors and union path; no work begins on an email handshake.
3. Composer supplies disclosure questionnaire and reference playlist containing descriptions/traits, not audio to imitate.
4. Parties execute composition/master/session/release terms before recording.
5. Sketches receive identity, historical/cultural, famous-theme, fatigue, speech-space, and technical review. Rejected sketches remain nonproduction.
6. Accepted cue is recorded/exported from its source session with aligned layer groups and full metadata.
7. Audio QA verifies format, peaks/loudness, frame/loop alignment, summed headroom, mono, waveform/spectrogram, hashes, and metadata.
8. Rights Manager reconciles composition, master, performers, samples/tools, platform/territory/use/term, credits, and archive.
9. Only `CLEARED_FOR_IMPORT` assets may enter an authorized Unity wave; asset GUID/path/import settings and built hash join the register.
10. M7 reconciles the final build catalogue against contracts, hashes, credits, streamer routing, and the Audio Oracle before `CLEARED_FOR_SHIP`.

One owner per gate: Audio Director owns creative acceptance; Cultural/Music-History Reviewer owns cultural disposition; Audio QA Lead owns technical acceptance; Rights Manager owns documentary completeness; qualified counsel owns legal advice; Build/Release Owner owns binary reconciliation. No single green check substitutes for the others.

## 6. Commissioning briefs and budget-tier burden

### Lean

- 27 cues / 75–100 minutes across nine epochs.
- One to two separable layers when feasible, nine idents, no full radio.
- Lowest composer/session/edit/mix/master/cultural/rights workload, but high repetition and concentrated stereotype risk.
- Use only if Standard pilot evidence cannot justify the larger spend; do not hide its repetition risk.

### Standard — recommendation to price, not buy

- 36 cues / 126–162 minutes; four cues and 14–18 unique minutes per epoch.
- Three genuinely session-authored aligned layer groups per cue; nine idents; up to 72 entry/exit deliverables.
- Multiple composers/performers or specialist collaborators, cultural review for relevant idioms, full source/session archival, mix/master/loop/metadata and four-hour-per-epoch QA.
- Studio Radio remains separately gated: 171 spoken links/bulletins/ads plus 27 short ident variants = 198 radio units, with up to 27 PA/help lines making 225 total before localization.

### Premium

- 54 cues / about 200–243 minutes; six cues per epoch.
- Three to four layers, alternate mixes and denser neighbor transitions; bounded full radio/localization where separately funded.
- Highest contracting, session, edit, storage, localization, performer/union, QA, and long-term archive burden.
- Lower musical repetition does not cure repetitive hosts, idents, motif, mix or spectral profile.

Before a full Standard or Premium commitment, M3 commissions two or three deliberately distant epochs. Phase 2 below is a cheaper prototype-only tool suitability and palette study, not a substitute for M3 or a rights shortcut.

## 7. Generative-music policy

### 7.1 Default gate

No generative music ships under the default policy. A proposed exception must record model/code/weights/license revisions, training/provenance disclosure, inputs and guide audio, prompts/seeds/parameters, every output/derivative hash, human authorship and edits, similarity review, platform/store disclosure, commercial registration, revenue threshold, privacy/data transfer, and counsel decision.

The U.S. Copyright Office concluded that purely AI-generated material or material with insufficient human control is not protected, prompts alone generally do not supply sufficient control, while qualifying human-authored selection, arrangement, or modifications may be protected case by case. [Copyright and Artificial Intelligence, Part 2](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf). This is one jurisdictional source, not a universal conclusion.

### 7.2 Never-use inputs and outputs

- Original *The Movies* audio or a transcription intended to reproduce it.
- Named artist, composer, producer, song, score, recording, character voice, or trademark as a style target.
- Unowned reference/guide audio, protected samples, scraped personal recordings, or performer likeness/voice.
- Output containing intelligible/generated vocals, an identifiable person, a recognizable composition/recording/sample, or missing provenance.
- Model or weights limited to noncommercial use, unknown commercial terms, unclear training provenance, changed/unpinned revision, or unverifiable hash.

## 8. Phase 2 generation handoff

No Phase 2 command was run in this research phase. No weight was downloaded and no music was generated.

### 8.1 Recommended route and independent challenge

**PROJECT: STUDIO RECOMMENDATION:** use Stable Audio 3 Small-Music through Stability AI’s official MLX implementation for a local Apple-Silicon, 120-second palette pilot.

| Item | Exact lock |
|---|---|
| Code | [`Stability-AI/stable-audio-3`](https://github.com/Stability-AI/stable-audio-3), commit `c3909628db1ae2b57bed40a493c73c67ad674dc5`, MIT code license |
| Backend | `optimized/mlx`, native MLX/Metal; CLI `optimized/mlx/scripts/sa3_mlx.py`; do not launch Gradio because the provided wrapper defaults to a public share link. [Pinned official MLX README](https://github.com/Stability-AI/stable-audio-3/blob/c3909628db1ae2b57bed40a493c73c67ad674dc5/optimized/mlx/README.md) |
| Canonical model | `stabilityai/stable-audio-3-small-music`, revision `0fef1392cd842149a2b6d445e181c97608faac06` |
| Optimized weights | `stabilityai/stable-audio-3-optimized`, revision `b5182df73f4aca4336c5c1b642ca6c44d5b085ec` |
| Model terms | Stability AI Community License plus Gemma Terms for T5Gemma. The Community agreement requires registration for commercial use and terminates when the licensee or affiliates, individually or in aggregate, generate **more than** USD 1 million annual revenue; a separate license must then be requested and is not guaranteed. Stability pages describe the boundary with non-identical “less than/exceeding” language, so **USD 1 million exactly or any entity/affiliate uncertainty is a conservative Project stop**, not a quotation of the agreement. An authorized representative must have authority to bind the named entity to all incorporated terms. [Community agreement](https://stability.ai/community-license-agreement); [Stability license page](https://stability.ai/license); [Gemma terms](https://ai.google.dev/gemma/terms) |
| Output | Model/CLI documents stereo 44.1 kHz 16-bit PCM WAV, up to 120 seconds |
| Pilot parameters | `sm-music`, `same-s`, 120 seconds, 8 ping-pong steps, FP16 DiT, CFG `2.0`, APG `1.0`, noise level `1.0`, fixed seeds; no LoRA, guide audio, artist reference, or external sample |

Stability reports 1,278,902 training recordings: 806,284 licensed from AudioSparx and 472,618 from Freesound, subdividing the latter across CC0, CC-BY and CC-Sampling+ and describing copyright detection/filtering. [Official model card](https://huggingface.co/stabilityai/stable-audio-3-small-music). That is materially better disclosure than the alternatives reviewed, but not clip-level lineage, a non-memorization guarantee, a warranty of non-infringement, or proof that a particular output is exclusive/copyrightable.

The current Community License describes output ownership only as between the user and Stability and to the extent allowed by law; it does not supply a broad non-infringement warranty. Stability describes Enterprise coverage and possible indemnification separately. [Official model announcement](https://stability.ai/news-updates/meet-stable-audio-3-the-model-family-built-for-artistic-experimentation-with-open-weight-models); [current license page](https://stability.ai/license). Therefore all Phase 2 outputs remain `PROTOTYPE_ONLY`.

**Binding execution precondition.** The controlled rights archive must contain a Rights Manager/counsel evidence record that an authorized representative for the named legal entity accepted the exact incorporated terms and completed the affiliate/revenue analysis. Archive immutable, dated, hashed snapshots of the Stability Community Agreement dated 2024-07-05; Stability Acceptable Use Policy effective 2025-07-31; Gemma Terms modified 2026-04-01; Gemma Prohibited Use Policy; both pinned model cards; Stability’s training-attribution page; and any Hugging Face gating/privacy terms presented to the account. [Stability Community Agreement](https://stability.ai/community-license-agreement); [Stability Acceptable Use Policy](https://stability.ai/use-policy); [Gemma Terms](https://ai.google.dev/gemma/terms); [Gemma Prohibited Use Policy](https://ai.google.dev/gemma/prohibited_use_policy). A Codex generation agent must never click acceptance, register an entity, enter contact details, disclose revenue/entity facts, or purport to bind the organization.

The Rights Manager is the model-material custodian. The pilot record must set a post-listening retention decision date and a periodic license-status recheck. If either governing license terminates, the entity crosses/uncertainly meets the conservative USD 1 million stop, or an Enterprise gap appears, stop use and delete or rights-quarantine covered Stable Audio/T5Gemma weights and caches as counsel directs. Preserve hashes, generation logs, outputs where lawful, and legal snapshots—not model materials contrary to termination duties.

**Challenge result:** ACE-Step 1.5 offers longer-form, editing, and stem-oriented features with MIT-labelled code/model materials, but its paper/model card describes a roughly 27-million-item corpus without the provider, contract, license-count, and attributable inventory detail required by this policy. Its stable alternative lock is [`ace-step/ACE-Step-1.5`](https://github.com/ace-step/ACE-Step-1.5) release `v0.1.8`, commit `dce621408bee8c31b4fcf4811682eb9359e1bc94`, model `ACE-Step/Ace-Step1.5` revision `19671f406d603126926c1b7e2adc169acbcade22`. [ACE-Step paper](https://arxiv.org/html/2602.00744); [model card](https://huggingface.co/ACE-Step/Ace-Step1.5). It is rejected as the automatic fallback and remains prototype-only pending new provenance/legal evidence. MusicGen’s published model weights are noncommercial and therefore fail this commercial route. [MusicGen model card](https://huggingface.co/facebook/musicgen-small).

Stable Audio 3 Small does not generate production-aligned stems. This pilot excludes init audio, inpainting, source separation, and the unused encoder; FFmpeg makes only audition loops from the text-generated output. Frequency bands and mid/side components must never be called production stems.

### 8.2 Exact weight lock

| Weight file | Bytes | SHA-256 | Pilot disposition |
|---|---:|---|---|
| `MLX/dit_sm-music_f16.npz` | 919,193,814 | `8ed3f38e2597f361ee675051f1265d9aa2ae2fffce1c61acd2e9fe31e1db1cbc` | Required |
| `MLX/same_s_decoder_f32.npz` | 218,090,820 | `909928a8e6937c1ebe6ac4b729f0462bd3773704a11ea18278e42671dc69bfe4` | Required |
| `MLX/t5gemma_f16.npz` | 567,443,068 | `8deb20489f36d9aec539f26c9c67321f99bc5fe300d470435ed6e76be4f16bbd` | Required |
| `MLX/same_s_encoder_f32.npz` | 214,946,620 | `a48f80d81c30d74c45e2a3047082c4891f715e24c44645adb9c1f4f07afdaf0c` | Identified but **excluded**: text-only generation and FFmpeg loop construction never call the encoder |

Required download total: `1,704,727,702` bytes / approximately 1.588 GiB. The sizes and LFS hashes are pinned to the [optimized repository revision API](https://huggingface.co/api/models/stabilityai/stable-audio-3-optimized/tree/b5182df73f4aca4336c5c1b642ca6c44d5b085ec/MLX?recursive=true&expand=true). Independent challenge removed the unused encoder from the executable route; downloading it would add cost without enabling any approved pilot step.

### 8.3 Machine plan and exact install commands

Required machine:

- Apple Silicon `arm64` macOS with Metal/MLX support;
- existing Python 3.11, `git`, `ffmpeg`, and `ffprobe`;
- 8 GB unified memory minimum, 16 GB recommended;
- 12 GB free disk reserved: approximately 1.70 GB required weights plus Hub metadata/hard-link layout, environment, repository, 24 raw files, normalized/loop WAVs, previews, plots, and logs;
- no Homebrew, Xcode, administrator, system Python, `uv`, global package, paid service, or cloud upload installed by the Phase 2 agent.

The pinned official README reports Small-Music support on an 8 GB M1 and an M4 Pro measurement of about 4.12 seconds / 2.38 GB peak memory for 120 seconds. Treat those as vendor measurements, not a guarantee. Budget 5–15 minutes for 24 sequential candidates including model/process warmup, and 15–30 minutes for screening/derivatives; network download time is separate. [Pinned MLX README](https://github.com/Stability-AI/stable-audio-3/blob/c3909628db1ae2b57bed40a493c73c67ad674dc5/optimized/mlx/README.md).

After preflight and explicit Owner authorization, choose one approved parent directory outside every production repository. The two exact sibling roots are `Project Studio Music Pilot 01 Tooling/` and `Project Studio Music Pilot 01/`; stop if either already exists. From that parent, run:

```bash
mkdir "Project Studio Music Pilot 01 Tooling" "Project Studio Music Pilot 01"
cd "Project Studio Music Pilot 01 Tooling"
git clone --no-checkout https://github.com/Stability-AI/stable-audio-3.git stable-audio-3
git -C stable-audio-3 checkout --detach c3909628db1ae2b57bed40a493c73c67ad674dc5
python3.11 -m venv .phase2-venv
.phase2-venv/bin/python -m pip install mlx==0.32.2 numpy==2.5.2 sentencepiece==0.2.2 huggingface-hub==1.29.0 soundfile==0.14.0
.phase2-venv/bin/python -m pip check
.phase2-venv/bin/hf download stabilityai/stable-audio-3-optimized \
  MLX/dit_sm-music_f16.npz \
  MLX/same_s_decoder_f32.npz \
  MLX/t5gemma_f16.npz \
  --revision b5182df73f4aca4336c5c1b642ca6c44d5b085ec \
  --local-dir stable-audio-3-weights
shasum -a 256 stable-audio-3-weights/MLX/dit_sm-music_f16.npz
shasum -a 256 stable-audio-3-weights/MLX/same_s_decoder_f32.npz
shasum -a 256 stable-audio-3-weights/MLX/t5gemma_f16.npz
mkdir -p stable-audio-3/optimized/mlx/models/mlx
ln stable-audio-3-weights/MLX/dit_sm-music_f16.npz stable-audio-3/optimized/mlx/models/mlx/dit_sm-music_f16.npz
ln stable-audio-3-weights/MLX/same_s_decoder_f32.npz stable-audio-3/optimized/mlx/models/mlx/same_s_decoder_f32.npz
ln stable-audio-3-weights/MLX/t5gemma_f16.npz stable-audio-3/optimized/mlx/models/mlx/t5gemma_f16.npz
```

Before generation, export the exact Python package graph and archive package metadata and license notices for MLX, NumPy, SentencePiece, Hugging Face Hub, SoundFile, every resolved transitive dependency, and the existing FFmpeg/FFprobe build/configuration and bundled license notices. This inventory does not convert the prototype into commercially cleared material; it prevents an unrecorded toolchain from entering the provenance chain.

Do not run the repository bootstrap/install wrapper: it may install `uv` and auto-download unpinned weights. Before the real download, the Phase 2 agent may run the same `hf download` command with `--dry-run`; it must confirm exactly three files and the expected total. Compare every printed hash and `stat -f %z` byte count with Section 8.2 before making the three same-filesystem hard links. Do not download the excluded encoder, copy weights, or redownload on hard-link failure; stop. Set `HF_HUB_OFFLINE=1` on every generation subprocess. If CLI syntax, file set, revision, size, or hash differs, stop instead of improvising. [Official `hf download` reference](https://huggingface.co/docs/huggingface_hub/en/package_reference/cli).

The three expected local names are:

```text
stable-audio-3/optimized/mlx/models/mlx/dit_sm-music_f16.npz
stable-audio-3/optimized/mlx/models/mlx/same_s_decoder_f32.npz
stable-audio-3/optimized/mlx/models/mlx/t5gemma_f16.npz
```

The exact generation argv shape, invoked from `Project Studio Music Pilot 01 Tooling/`, is:

```text
[
  ".phase2-venv/bin/python",
  "stable-audio-3/optimized/mlx/scripts/sa3_mlx.py",
  "--prompt", PROMPT_REGISTER_EXACT_VALUE,
  "--negative-prompt", EPOCH_NEGATIVE_PROMPT_EXACT_VALUE,
  "--dit", "sm-music",
  "--decoder", "same-s",
  "--seconds", "120",
  "--steps", "8",
  "--seed", SEED_DECIMAL_STRING,
  "--init-noise-level", "1.0",
  "--cfg", "2.0",
  "--apg", "1.0",
  "--dit-dtype", "fp16",
  "--free-models",
  "--out", ABSOLUTE_RAW_WAV_PATH
]
```

The capitalized tokens above are defined values read from the exact prompt register and 24-row matrix, not shell placeholders: each of six prompt rows is paired in order with seeds `104729`, `130363`, `155921`, and `196613`, and its output path is the corresponding absolute `02_raw/<epoch>/<prompt-id>__seed-<seed>.wav`. Invoke with Python `subprocess.run(argv, cwd=tool_root, env={**os.environ, "HF_HUB_OFFLINE":"1"}, capture_output=True, text=True, check=False)`; never interpolate a shell command. Record the complete resolved argv in JSONL.

### 8.4 Pilot scope and parameter strategy

The two epochs are intentionally distant:

1. `acoustic_electrical_1920_1932` tests three deliberately separated pre-/post-electrical musical lanes without damage caricature.
2. `sampled_digital_1987_1999` tests separately authored hip-hop/R&B, band-led alternative/post-rock, and house/techno lanes without protected samples or retro parody.

Generate exactly three prompt families per epoch × four fixed seeds = 12 per epoch / 24 total. Every candidate is exactly 120 seconds. Seeds are `104729`, `130363`, `155921`, and `196613`, used once in every family. No rerolls, cherry-picked seeds, guide audio, LoRA, or parameter drift. Select exactly one technically passing candidate per family, producing six finalists, three per epoch. If any family has no passing candidate, stop rather than backfill it.

Shared identity text is deliberately nonmelodic: curious, industrious, humane, quietly optimistic, patient, non-triumphal, transparent midrange, restrained dynamics, and open-ended management-play phrasing. It asks for space for a later human-written motif; it does not generate the final motif.

#### Acoustic/electrical prompts

These prompts intentionally sample three internal historical slices; they do not make their late materials valid from 1920. The Phase 2 listening package displays the slice as well as the broad commissioning alias.

`FND-01 — post-1925 electrical dance-jazz`

> Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1926–1932 electrically recorded compact dance-jazz for a Hollywood studio workday, rendered as a clean modern master: cornet used sparingly, clarinet and tenor saxophone, trombone, piano, acoustic guitar or banjo pulse, upright bass, brushed snare and woodblock. 104 BPM relaxed 4/4, syncopated ensemble conversation with breathing space, song-form harmony, blue-note color and restrained chromatic passing chords, three low-contrast sections, open ending suitable for a long management loop. No dominant lead melody; leave space for a later studio motif. Era character comes from arrangement and performance, not surface noise. This family is not eligible until a future authorized contract maps sealed P13 global-era truth to post-electrical audio eligibility; it never depends on a player studio’s research/adoption state.

`FND-02 — silent-era photoplay chamber`

> Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1920–1927 silent-film photoplay chamber language for a calm studio workday: piano, violin, viola, cello, upright bass, clarinet, flute, muted horn and restrained small percussion. About 82 BPM with flexible 4/4 phrasing, modular eight-bar cue construction, lyrical but unsentimental functional, modal and mild impressionist harmony, transparent acoustic-room perspective and an open ending. No dominant lead melody; leave space for a later studio motif. Avoid talkie fanfare and constant scene-by-scene mickey-mousing.

`FND-03 — Black-led stride and blues small ensemble`

> Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1923–1929 Black American stride-and-blues-informed small ensemble treated as living musicianship, not novelty: stride piano with relaxed left-hand motion, cornet, clarinet, acoustic guitar, upright bass, brushes and woodblock. 92 BPM, blues-form and song-form variation, call-and-response, syncopated breaks, blue-note inflection, warm acoustic room, three spacious low-intensity sections and an open ending for long management play. No dominant lead melody; leave space for a later studio motif. This lane requires Black music-history and creator review before any commission.

Foundations negative prompt:

> vocals, singing, rap, spoken word, dialogue, lyrics, choir, humming, whistling, artist imitation, recognizable song, famous theme, quotation, copyrighted sample, DJ tag, producer tag, applause, crowd, trailer climax, abrupt ending, clipping, distortion, harsh mastering, excessive compression, long silence, vinyl crackle, shellac hiss, gramophone noise, radio static, slapstick chase, circus music, honky-tonk caricature, saloon piano, nonstop ragtime, cartoon mickey-mousing, minstrel-show coding, blackface-era racial caricature, novelty dialect, exoticism, modern synthesizer, electric guitar, drum machine, sub-bass

#### Sampled/digital prompts

`DFG-01 — wholly new sample-shaped hip-hop/R&B`

> Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1991–1996 Black-led hip-hop and R&B studio language using wholly generated original micro-chops and no sourced recording: dry break-shaped kick and snare, relaxed swing, warm electric bass, electric piano, muted clean guitar, short brass-color fragments and soft analog-digital atmosphere. 92 BPM, jazz-and-soul harmonic color, spacious midrange, three low-intensity sections and open-ended management phrasing. No dominant lead melody; leave space for a later studio motif. Do not imitate a performer, producer, song, flow, or recording; this lane requires relevant creator and music-history review before commission.

`DFG-02 — band-led alternative and early post-rock`

> Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1990–1996 band-led college-alternative and early post-rock studio language: human live drum kit, electric bass, two contrasting electric guitars moving between clean arpeggios, restrained overdrive and textural harmonics, with sparse electric piano. 94 BPM, dynamic ensemble breathing without arena climax, modal and suspended harmony, three evolving low-intensity sections, clear center and open ending for long management play. No dominant lead solo; leave space for a later studio motif. Avoid reducing the decade to grunge costume.

`DFG-03 — restrained house and techno lineage`

> Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1992–1998 Chicago-house- and Detroit-techno-derived instrumental studio language treated with restraint: dry original drum-machine timbres, rounded synth bass, electric-piano chord color, modest analog sequence, soft pad and one filtered percussion development. 120 BPM, steady club pulse below peak-hour intensity, syncopated accents, extended harmony, gradual three-section evolution and open-ended management phrasing. No dominant lead melody; leave space for a later studio motif. This Black American lineage requires relevant creator and music-history review before commission.

Digital-fragmentation negative prompt:

> vocals, singing, rap, spoken word, dialogue, lyrics, choir, humming, whistling, artist imitation, recognizable song, famous theme, quotation, identifiable or copyrighted sample, DJ tag, producer tag, applause, crowd, trailer climax, abrupt ending, clipping, distortion, harsh mastering, excessive compression, long silence, 2010s festival EDM drop, trap triplet hi-hats, dubstep wobble, cyberpunk cliché, cheesy General MIDI, corporate presentation music, arena-rock solo, overdone gated snare, brickwall loudness, retro parody

### 8.5 Technical screening gate

Preserve raw WAVs unchanged. Record exact tool/version/command/seed/prompt/time and hash before processing.

| Check | Exact pilot gate |
|---|---|
| Format | `pcm_s16le`, stereo, 44,100 Hz; reject mismatch |
| Duration | 120 seconds within one sample; reject mismatch |
| Nonfinite/DC | Reject NaN/infinity; reject absolute channel mean over `0.01` |
| Clipping | Flag any full-scale sample; reject three consecutive full-scale samples or over `0.01%` full-scale samples |
| Silence | Reject leading >1 s, trailing >2 s, or internal below −50 dBFS >2 s unless a human records structural acceptance |
| Raw loudness | Flag outside −26 to −12 LUFS-I; do not overwrite raw |
| Listening master | Two-pass normalize to −18 LUFS-I, LRA ≤12 LU, true peak ≤−1.5 dBTP; verify ±0.5 LU |
| Excess processing | Reject normalization needing >12 dB gain or >3 dB peak control |
| Vocals | Human reject intelligible words, speech, singing, rap, humming, whistling, mouth sounds, or producer tags; no cloud transcription |
| Duplicates | Reject byte identity; flag spectral similarity >`0.985` across ≥30 s for human review |
| Mono | Reject sustained correlation below −0.2 or mono-fold loudness loss >6 dB |
| Loop | Six-second equal-power tail/head crossfade yielding a 114-second rotated loop; reject absolute boundary discontinuity >0.05 full scale or seam first-difference >6 dB above body 99.9th percentile; human listen required |
| Artifacts | Reject metallic warble, unstable pitch, phantom vocal, rhythmic collapse, smeared transients, abrupt structural cut, whistle, obvious generated repetition |
| History/identity | Reject anachronism, parody, one-genre monopoly, famous-theme resemblance, or no space for speech/later motif |

The numerical thresholds are **pilot engineering criteria**, not loudness law or proof of artistic quality. Calibrate loop metrics against human decisions before any production gate.

Reproducibility conventions:

- Archive `ffmpeg -version` and `ffprobe -version`; all commands use that one existing build. Use NumPy exactly `2.5.2`. Decode integer PCM with no automatic normalization other than `float = int16 / 32768.0`; full scale is `[-1.0, 1.0]`, and raw full-scale samples are exactly integer `-32768` or `32767`.
- A raw file must contain exactly `5,292,000` sample frames per channel. Compute per-channel DC over all decoded frames. Silence uses `max(abs(L),abs(R)) < 10^(-50/20)` and contiguous frame runs; leading, trailing, and internal classifications are therefore independent of console text parsing.
- Pairwise similarity first rejects equal SHA-256. Otherwise decode to mono `0.5*(L+R)`, resample to 16 kHz with the archived FFmpeg build, take the first 30.0 seconds with no time shifting, compute an unpadded STFT with periodic Hann window 2,048 and hop 512, flatten `log1p(abs(STFT))`, and calculate cosine similarity. Compare every pair within a prompt family; `>0.985` is a human-review flag, not automatic plagiarism proof.
- Stereo correlation is windowed Pearson correlation after subtracting each channel’s window mean, with 48,000-sample windows and 24,000-sample hop at 48 kHz. “Sustained below −0.2 for two seconds” means at least three consecutive windows whose union spans two seconds. Mono fold is `M=0.5*(L+R)` copied to both channels; measure stereo and dual-mono integrated loudness with the same FFmpeg EBU R128 filter and reject a loss over 6 LU/dB.
- For the 114-second loop, boundary jump is `max_channel(abs(first_sample-last_sample))`. Seam first-difference is the same boundary difference; body reference is the 99.9th percentile of `abs(x[n]-x[n-1])` over both channels excluding the first and last one second. Report `20*log10((seam+1e-12)/(body_p999+1e-12))`. Both the 0.05 absolute and +6 dB gates apply.
- Loudness/LRA/true peak are the archived FFmpeg `loudnorm` JSON values. Net normalization gain is `output_i-input_i`; peak control is `max(0, input_tp + net_gain - output_tp)`, all in dB. Human review, not a detector, decides vocals, historical plausibility, artifacts, and recognizable-reference risk.

### 8.6 Processing pipeline

For each passing candidate, resolve the symbolic filenames below to absolute paths and invoke FFmpeg/FFprobe through subprocess argument arrays, never interpolated shell strings. These are the canonical command forms:

```bash
ffprobe -v error -show_entries format=duration:stream=index,codec_name,codec_type,sample_fmt,sample_rate,channels,channel_layout,duration_ts,time_base -of json RAW.wav

ffmpeg -nostdin -hide_banner -loglevel error -fflags +bitexact -i RAW.wav -map_metadata -1 -vn -ar 48000 -ac 2 -c:a pcm_s24le -flags:a +bitexact CONVERTED-48k24.wav

ffmpeg -nostdin -hide_banner -i CONVERTED-48k24.wav -af "loudnorm=I=-18:LRA=12:TP=-1.5:print_format=json" -f null -

ffmpeg -nostdin -hide_banner -loglevel error -fflags +bitexact -i CONVERTED-48k24.wav -map_metadata -1 -af "loudnorm=I=-18:LRA=12:TP=-1.5:measured_I=INPUT_I:measured_LRA=INPUT_LRA:measured_TP=INPUT_TP:measured_thresh=INPUT_THRESH:offset=TARGET_OFFSET:linear=true:print_format=json" -ar 48000 -ac 2 -c:a pcm_s24le -flags:a +bitexact NORMALIZED-48k24.wav

ffmpeg -nostdin -hide_banner -loglevel error -i NORMALIZED-48k24.wav -map_metadata -1 -vn -c:a aac -b:a 192k PREVIEW.m4a

ffmpeg -nostdin -hide_banner -loglevel error -i NORMALIZED-48k24.wav -filter_complex "showwavespic=s=1600x400:split_channels=1:colors=0x4C78A8|0xF58518" -frames:v 1 WAVEFORM.png

ffmpeg -nostdin -hide_banner -loglevel error -i NORMALIZED-48k24.wav -lavfi "showspectrumpic=s=1600x900:legend=1:scale=log:fscale=log:color=intensity" -frames:v 1 SPECTROGRAM.png

ffmpeg -nostdin -hide_banner -loglevel error -fflags +bitexact -i NORMALIZED-48k24.wav -filter_complex "[0:a]atrim=start=6:end=114,asetpts=PTS-STARTPTS[mid];[0:a]atrim=start=114:end=120,asetpts=PTS-STARTPTS[tail];[0:a]atrim=start=0:end=6,asetpts=PTS-STARTPTS[head];[tail][head]acrossfade=d=6:c1=qsin:c2=qsin[xf];[mid][xf]concat=n=2:v=0:a=1[out]" -map "[out]" -map_metadata -1 -ar 48000 -ac 2 -c:a pcm_s24le -flags:a +bitexact LOOP-114s.wav

ffmpeg -nostdin -hide_banner -loglevel error -fflags +bitexact -i LOOP-114s.wav -filter_complex "[0:a]atrim=start=108:end=114,asetpts=PTS-STARTPTS[end];[0:a]atrim=start=0:end=6,asetpts=PTS-STARTPTS[start];[end][start]concat=n=2:v=0:a=1[out]" -map "[out]" -map_metadata -1 -ar 48000 -ac 2 -c:a pcm_s24le -flags:a +bitexact SEAM-12s.wav
```

`INPUT_I`, `INPUT_LRA`, `INPUT_TP`, `INPUT_THRESH`, and `TARGET_OFFSET` are not values to type literally: parse the first-pass JSON locally with the Python standard library, reject missing/nonfinite fields, and substitute their exact decimal strings into a subprocess argument. After pass two, run `loudnorm` analysis again and archive its JSON. If any listed option/filter is unavailable in the existing FFmpeg build, stop; do not install or substitute another build.

Then:

1. Preserve raw 44.1 kHz/16-bit WAV read-only and hash it.
2. Convert to 48 kHz/24-bit PCM working master with deterministic, logged FFmpeg arguments.
3. Run two-pass EBU R128 normalization to the listening target; record measured input/output values.
4. Encode a 192 kbps AAC `.m4a` convenience preview; lossless WAV remains review authority.
5. Build the 114-second rotated loop and a 12-second seam audition containing the final six seconds followed by the first six seconds.
6. Render 1600×400 waveform and 1600×900 log-frequency spectrogram PNGs.
7. Record automated metrics, duplicate comparisons, human vocal/artifact/history/loop decisions, and rejection reason.
8. Evaluate whether roles for `foundation`, `periodColor`, and `activityPulse` are conceptually audible; record `nativeStemSupport: false`. Do not source-separate and relabel diagnostics as stems.
9. Hash every derivative and reconcile it to raw/prompt/model/machine records.

### 8.7 Owner listening package

Exact local folder, outside all production repositories:

```text
Project Studio Music Pilot 01/
├── README.md
├── 00_provenance/
│   ├── route-lock.json
│   ├── machine.json
│   ├── software-freeze.txt
│   ├── weights.sha256
│   ├── provenance-register.csv
│   └── licenses/
├── 01_prompt-register/
│   ├── prompts.csv
│   └── commands.jsonl
├── 02_raw/
│   ├── acoustic_electrical_1920_1932/
│   └── sampled_digital_1987_1999/
├── 03_screening/
│   ├── metrics.csv
│   ├── rejections.csv
│   ├── waveforms/
│   └── spectrograms/
├── 04_working/
│   ├── normalized-48k24/
│   └── loops-48k24/
├── 05_owner-listening/
│   ├── README.md
│   ├── scorecard.csv
│   ├── C01/
│   ├── C02/
│   ├── C03/
│   ├── C04/
│   ├── C05/
│   └── C06/
├── 06_feedback/
│   └── OWNER-FEEDBACK.md
└── 07_logs/
    ├── generation.jsonl
    └── processing/
```

Each blind `C01`–`C06` folder contains full normalized WAV, loop WAV, AAC preview, seam audition, waveform, spectrogram, and metadata JSON. Keep the identity key outside `05_owner-listening` for the first pass.

Scorecard columns:

```text
file_id,inferred_year_range,era_clarity_1_5,project_studio_identity_1_5,historical_plausibility_1_5,stereotype_penalty_0_3,short_term_irritation_1_5,loop_seam_1_5,mix_space_1_5,artifact_penalty_0_3,vocals_present_y_n,recognizable_reference_y_n,keep_y_n,notes
```

Owner instructions: set one comfortable playback level; listen blind once; infer the year/epoch before viewing metadata; score all six; listen to seam auditions; reveal prompt-family identities; select at most one preferred candidate and one alternate per epoch, or reject the epoch. `short_term_irritation_1_5` means 1 = no immediate irritation and 5 = stop listening; it describes one two-minute exposure and cannot clear M3/M5 endurance. A passing technical score does not require the Owner to keep anything.

### 8.8 Phase 2 rights gate

**Prototype-only:** every raw/derived output, inpainting/audio-to-audio result, algorithmic separation, and file not fully reviewed.

**Potentially commercially eligible but not cleared:** Stable Audio 3 output produced only after an authorized representative validly accepts the then-current incorporated terms for the named entity and the Rights Manager verifies registration, affiliate/revenue, and Community/Enterprise status. USD 1 million exactly or any ambiguity stops under Project policy. Even then, output still requires human authorship/arrangement analysis, similarity/musicologist review, platform/territory/store review, complete provenance, and counsel decision.

**Further review required:** authority to bind the entity; affiliate/revenue calculation and registration; Enterprise availability/need/indemnity; Stability AUP, Gemma Terms and Prohibited Use Policy; Hugging Face gating/privacy; copyrightability/human control; training-data/licensing implications; composition/master similarity; disclosure obligations; trailers, soundtrack, DLC, streaming/VOD, territory; contractor access and data privacy; and model-material retention/deletion duties.

**Never ship:** ACE-Step output absent a new provenance/legal approval; MusicGen or other noncommercial-weight output; original *The Movies* music or imitation; named-artist/song output; recognizable melody/recording/sample/vocal identity; unowned guide audio; failed-screen or incomplete-provenance file; raw generative output as the production master under the default commission policy.

**Retention/deletion:** the Rights Manager is custodian. Record a post-listening retention decision and periodic license-status recheck. On license termination, conservative USD 1 million uncertainty, or an Enterprise gap, cease use and delete or rights-quarantine covered weights/caches/hard links as counsel directs; preserve hashes and legal snapshots rather than retaining model material contrary to governing terms.

### 8.9 Stop conditions

Stop before download/generation or at the first occurrence of:

- no explicit Owner approval for the exact route, legal posture, and 1,704,727,702-byte download;
- absent authorized-representative acceptance evidence; unknown entity/affiliate qualification, registration, or Community/Enterprise status; USD 1 million exactly or uncertain under Project policy;
- paid API, payment/credit card, enterprise contract, or purchase request;
- requested three-weight download over 1.9 GB, a file size/revision/hash mismatch, unexpected file, or inadequate disk;
- missing, changed, disappeared, or unclear Stability/Gemma/Hugging Face/code/model term, incorporated policy, or toolchain license;
- any login/terms/registration/contact action not already completed by an authorized representative;
- system-level/Homebrew/Xcode/admin/global Python/`uv` installation;
- non-Apple-Silicon machine, <8 GB memory, <12 GB free disk, missing Python 3.11/`git`/`ffmpeg`/`ffprobe`;
- Gradio/public share, cloud generation/transcription/recognition, or any private-file upload;
- inability to obey a Rights Manager/counsel model-material deletion or quarantine instruction;
- model output unsuitable for commercial consideration, protected-reference resemblance, named-artist input, or unowned reference;
- no passing candidate in a prompt family, >25% outputs with vocals/imitation/severe artifacts/parody, or unacceptable 120-second coherence;
- a request for production-aligned generator stems;
- any automatic fallback to Stable Audio Medium, ACE-Step, another model, or a paid service.

If Small-Music fails, the agent stops and asks the Owner to choose between a separately researched approximately 6.88 GB Stable Audio 3 Medium path and the human-composer M3 pilot. It never switches silently.

## PHASE 2 — GENERATE THE PROJECT: STUDIO MUSIC PILOT

```text
You are Codex, Phase 2 music-pilot generation, processing, provenance, and evidence agent for Project: Studio.

AUTHORIZATION BOUNDARY

Proceed only after the Owner has explicitly approved:

1. the four-document era-aware music research package;
2. Stable Audio 3 Small-Music, the exact revisions below, and its prototype-only rights posture;
3. the exact 1,704,727,702-byte three-weight download;
4. an opaque Rights Manager evidence ID confirming that an authorized representative for the named entity accepted the exact incorporated Stability/Gemma/Hugging Face terms, completed registration where required, and verified affiliate/revenue/Community-or-Enterprise status under the conservative USD 1 million Project stop.

This prompt authorizes local pilot generation only after those approvals. Do not launch Unity, the packaged player, or Unity batch mode. Do not control the Owner’s screen. Do not import audio into Unity. Do not modify production code, schema, DTOs, saves, dependencies, P05, P06, or P13. Do not use or imitate the original The Movies soundtrack. Do not use a paid API. Do not send prompts, audio, logs, or private files to any model/cloud service. Exact prompts and redacted provenance may be pushed only to the already approved Project repository remote under REPOSITORY RECORD below. Commit only documentation and redacted text metadata; never commit audio, weights, environments, caches, plots, previews, generated binaries, contact/account data, actual revenue/entity classifications, registration records, or counsel material.

OBJECTIVE

Generate a local, prototype-only, six-finalist listening package for exactly:

1. acoustic_electrical_1920_1932
2. sampled_digital_1987_1999

Generate 24 real 120-second candidates, screen and process them, select exactly one passing candidate per prompt family, assemble six blind finalists, record full prompt/model/machine/rights provenance, commit only documentation/text metadata, push the documentation branch, and stop for Owner listening.

FIRST READ AND BASE

Read these four files on remote branch codex/era-aware-music-direction-01 in full:

docs/design/CODEX-ERA-AWARE-MUSIC-AND-STUDIO-RADIO-DIRECTION-01.md
docs/design/CODEX-ERA-AWARE-MUSIC-AND-STUDIO-RADIO-BUILDER-ANNEX-01.md
docs/design/CODEX-ERA-MUSIC-ASSET-PROVENANCE-AND-COMMISSIONING-PLAN-01.md
docs/engineering/CODEX-ERA-AWARE-MUSIC-IMPLEMENTATION-RECONNAISSANCE-01.md

Resolve and record the exact approved remote branch SHA before doing anything. Create and push an empty fresh isolated documentation worktree/branch named codex/era-aware-music-pilot-01 from that exact SHA. Use two separate custodian-controlled sibling directories outside every repository:

/Users/bruce/Project Studio Music Pilot 01
/Users/bruce/Project Studio Music Pilot 01 Tooling

If either directory already exists, stop rather than overwrite, merge, rename, or delete it.

HARD PREFLIGHT

Read-only verify and record:

- uname -m is arm64;
- Python 3.11 already exists;
- git, ffmpeg, and ffprobe already exist;
- unified memory is at least 8 GB;
- free disk is at least 12 GB;
- Owner approval explicitly covers this route and the 1,704,727,702-byte download;
- a Rights Manager provides only an opaque evidence ID and `verified` result showing that an authorized representative for the named entity accepted the exact terms, completed any commercial registration, and resolved affiliates/revenue; do not request or record actual revenue, entity structure, contacts, account IDs, registration materials, or counsel advice in the workspace;
- the controlled archive contains dated, hashed snapshots of the Stability Community Agreement (2024-07-05), Stability AUP (effective 2025-07-31), Gemma Terms (modified 2026-04-01), Gemma Prohibited Use Policy, model cards/training-attribution material, relevant Hugging Face gating/privacy terms, and code MIT license; current pages remain accessible and materially match those approved snapshots.

Stop if any check fails, if revenue is exactly USD 1 million or uncertain under Project policy, or if the agent would need to accept/click terms, register, enter contact details, or bind the entity. Do not install Homebrew, Xcode, an administrator package, system Python, global Python packages, or uv. Do not launch Gradio: the pinned repository’s Gradio wrapper defaults to a public share link.

RIGHTS PREFLIGHT

Record every generated or derived file as PROTOTYPE_ONLY. Do not claim copyrightability, exclusivity, non-infringement, production readiness, commercial clearance, or production-stem support. Stop if model/license/incorporated terms changed or are unclear, the Rights Manager verification is absent, USD 1 million/affiliate status is uncertain, or Hugging Face requires any login/terms/privacy action not already completed by an authorized representative. Never click acceptance or disclose organization/private data yourself.

ROUTE LOCK

Code repository:
https://github.com/Stability-AI/stable-audio-3.git

Detached code commit:
c3909628db1ae2b57bed40a493c73c67ad674dc5

Code license:
MIT

Use only:
optimized/mlx/scripts/sa3_mlx.py

Backend:
Apple MLX/Metal

Canonical model:
stabilityai/stable-audio-3-small-music

Canonical model revision:
0fef1392cd842149a2b6d445e181c97608faac06

Optimized weight repository:
stabilityai/stable-audio-3-optimized

Optimized weight revision:
b5182df73f4aca4336c5c1b642ca6c44d5b085ec

Do not use a repository bootstrap/install script, auto-downloader, floating main revision, Gradio, LoRA, training, guide audio, external audio, named artist/song, or another model.

ISOLATED INSTALL

Create the two exact directories only after preflight. Work in /Users/bruce/Project Studio Music Pilot 01 Tooling, never a production repository:

mkdir "/Users/bruce/Project Studio Music Pilot 01" "/Users/bruce/Project Studio Music Pilot 01 Tooling"
cd "/Users/bruce/Project Studio Music Pilot 01 Tooling"
git clone --no-checkout https://github.com/Stability-AI/stable-audio-3.git stable-audio-3
git -C stable-audio-3 checkout --detach c3909628db1ae2b57bed40a493c73c67ad674dc5
python3.11 -m venv .phase2-venv
.phase2-venv/bin/python -m pip install mlx==0.32.2 numpy==2.5.2 sentencepiece==0.2.2 huggingface-hub==1.29.0 soundfile==0.14.0
.phase2-venv/bin/python -m pip check

Do not upgrade or install anything else. Record the full pip freeze, Python version, macOS version, machine model, memory, ffmpeg/ffprobe versions/configuration/license notices, git commit, and dirty status. Archive package metadata and license notices for MLX, NumPy, SentencePiece, Hugging Face Hub, SoundFile, and every resolved transitive dependency. Stop if pip resolves a different requested version, pip check fails, or any toolchain license/notice cannot be inventoried.

MODEL LOCK

Download only these three files, using the exact optimized revision and explicit paths:

MLX/dit_sm-music_f16.npz
919193814 bytes
SHA-256 8ed3f38e2597f361ee675051f1265d9aa2ae2fffce1c61acd2e9fe31e1db1cbc

MLX/same_s_decoder_f32.npz
218090820 bytes
SHA-256 909928a8e6937c1ebe6ac4b729f0462bd3773704a11ea18278e42671dc69bfe4

MLX/t5gemma_f16.npz
567443068 bytes
SHA-256 8deb20489f36d9aec539f26c9c67321f99bc5fe300d470435ed6e76be4f16bbd

Expected total:
1704727702 bytes

The repository also contains MLX/same_s_encoder_f32.npz, 214946620 bytes, SHA-256 a48f80d81c30d74c45e2a3047082c4891f715e24c44645adb9c1f4f07afdaf0c. Do not download it: this text-only pilot and FFmpeg loop process never use init audio, inpainting, or the encoder.

From /Users/bruce/Project Studio Music Pilot 01 Tooling, first run this exact command with --dry-run appended and verify exactly three files/expected total; then run it without --dry-run:

.phase2-venv/bin/hf download stabilityai/stable-audio-3-optimized MLX/dit_sm-music_f16.npz MLX/same_s_decoder_f32.npz MLX/t5gemma_f16.npz --revision b5182df73f4aca4336c5c1b642ca6c44d5b085ec --local-dir stable-audio-3-weights

Verify with:

stat -f %z stable-audio-3-weights/MLX/dit_sm-music_f16.npz
stat -f %z stable-audio-3-weights/MLX/same_s_decoder_f32.npz
stat -f %z stable-audio-3-weights/MLX/t5gemma_f16.npz
shasum -a 256 stable-audio-3-weights/MLX/dit_sm-music_f16.npz stable-audio-3-weights/MLX/same_s_decoder_f32.npz stable-audio-3-weights/MLX/t5gemma_f16.npz

Then make same-filesystem hard links, not copies or new downloads:

mkdir -p stable-audio-3/optimized/mlx/models/mlx
ln stable-audio-3-weights/MLX/dit_sm-music_f16.npz stable-audio-3/optimized/mlx/models/mlx/dit_sm-music_f16.npz
ln stable-audio-3-weights/MLX/same_s_decoder_f32.npz stable-audio-3/optimized/mlx/models/mlx/same_s_decoder_f32.npz
ln stable-audio-3-weights/MLX/t5gemma_f16.npz stable-audio-3/optimized/mlx/models/mlx/t5gemma_f16.npz

Do not permit unpinned download fallback. Stop if hard-linking fails. The resulting exact paths are:

stable-audio-3/optimized/mlx/models/mlx/dit_sm-music_f16.npz
stable-audio-3/optimized/mlx/models/mlx/same_s_decoder_f32.npz
stable-audio-3/optimized/mlx/models/mlx/t5gemma_f16.npz

After verification, set HF_HUB_OFFLINE=1 for every generation. Stop on a revision, byte, hash, CLI-syntax, login, terms, or unexpected-download difference. Never download more than 1.9 GB for the three locked weights.

PILOT MATRIX

Generate exactly:

- two epochs;
- three prompt families per epoch;
- four fixed seeds per family;
- twelve candidates per epoch;
- twenty-four candidates total;
- 120 seconds per candidate;
- six finalists total, exactly one passing candidate per family.

Use these four seeds once in every family:

104729
130363
155921
196613

For each prompt row and seed, construct this exact resolved argv array from /Users/bruce/Project Studio Music Pilot 01 Tooling:

[".phase2-venv/bin/python", "stable-audio-3/optimized/mlx/scripts/sa3_mlx.py", "--prompt", POSITIVE, "--negative-prompt", NEGATIVE, "--dit", "sm-music", "--decoder", "same-s", "--seconds", "120", "--steps", "8", "--seed", SEED, "--init-noise-level", "1.0", "--cfg", "2.0", "--apg", "1.0", "--dit-dtype", "fp16", "--free-models", "--out", ABSOLUTE_OUTPUT]

POSITIVE is exactly one prompt below; NEGATIVE is that epoch’s exact negative prompt; SEED is one of the four decimal strings above; ABSOLUTE_OUTPUT follows /Users/bruce/Project Studio Music Pilot 01/02_raw/EPOCH/PROMPT-ID__seed-SEED.wav. These names are register columns, not text to pass literally. Use Python subprocess.run with shell=false, cwd fixed to the tooling root, and environment copied locally with HF_HUB_OFFLINE=1. Run sequentially. Before generation, inspect --help only to verify every locked flag exists; stop on disagreement. Do not use --play. Preserve resolved argv, stdout, stderr, start/end timestamps, return code, prompt ID, seed, destination and output hash in JSONL. Do not reroll, modify seeds, alter prompts/negatives, change parameters, or cherry-pick another family.

PROMPTS — ACOUSTIC_ELECTRICAL_1920_1932

FND-01 — post-1925 electrical dance-jazz

Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1926–1932 electrically recorded compact dance-jazz for a Hollywood studio workday, rendered as a clean modern master: cornet used sparingly, clarinet and tenor saxophone, trombone, piano, acoustic guitar or banjo pulse, upright bass, brushed snare and woodblock. 104 BPM relaxed 4/4, syncopated ensemble conversation with breathing space, song-form harmony, blue-note color and restrained chromatic passing chords, three low-contrast sections, open ending suitable for a long management loop. No dominant lead melody; leave space for a later studio motif. Era character comes from arrangement and performance, not surface noise. This family is not eligible until a future authorized contract maps sealed P13 global-era truth to post-electrical audio eligibility; it never depends on a player studio’s research/adoption state.

FND-02 — silent-era photoplay chamber

Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1920–1927 silent-film photoplay chamber language for a calm studio workday: piano, violin, viola, cello, upright bass, clarinet, flute, muted horn and restrained small percussion. About 82 BPM with flexible 4/4 phrasing, modular eight-bar cue construction, lyrical but unsentimental functional, modal and mild impressionist harmony, transparent acoustic-room perspective and an open ending. No dominant lead melody; leave space for a later studio motif. Avoid talkie fanfare and constant scene-by-scene mickey-mousing.

FND-03 — Black-led stride and blues small ensemble

Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1923–1929 Black American stride-and-blues-informed small ensemble treated as living musicianship, not novelty: stride piano with relaxed left-hand motion, cornet, clarinet, acoustic guitar, upright bass, brushes and woodblock. 92 BPM, blues-form and song-form variation, call-and-response, syncopated breaks, blue-note inflection, warm acoustic room, three spacious low-intensity sections and an open ending for long management play. No dominant lead melody; leave space for a later studio motif. This lane requires Black music-history and creator review before any commission.

Use this exact negative prompt for every FND candidate:

vocals, singing, rap, spoken word, dialogue, lyrics, choir, humming, whistling, artist imitation, recognizable song, famous theme, quotation, copyrighted sample, DJ tag, producer tag, applause, crowd, trailer climax, abrupt ending, clipping, distortion, harsh mastering, excessive compression, long silence, vinyl crackle, shellac hiss, gramophone noise, radio static, slapstick chase, circus music, honky-tonk caricature, saloon piano, nonstop ragtime, cartoon mickey-mousing, minstrel-show coding, blackface-era racial caricature, novelty dialect, exoticism, modern synthesizer, electric guitar, drum machine, sub-bass

PROMPTS — SAMPLED_DIGITAL_1987_1999

DFG-01 — wholly new sample-shaped hip-hop/R&B

Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1991–1996 Black-led hip-hop and R&B studio language using wholly generated original micro-chops and no sourced recording: dry break-shaped kick and snare, relaxed swing, warm electric bass, electric piano, muted clean guitar, short brass-color fragments and soft analog-digital atmosphere. 92 BPM, jazz-and-soul harmonic color, spacious midrange, three low-intensity sections and open-ended management phrasing. No dominant lead melody; leave space for a later studio motif. Do not imitate a performer, producer, song, flow, or recording; this lane requires relevant creator and music-history review before commission.

DFG-02 — band-led alternative and early post-rock

Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1990–1996 band-led college-alternative and early post-rock studio language: human live drum kit, electric bass, two contrasting electric guitars moving between clean arpeggios, restrained overdrive and textural harmonics, with sparse electric piano. 94 BPM, dynamic ensemble breathing without arena climax, modal and suspended harmony, three evolving low-intensity sections, clear center and open ending for long management play. No dominant lead solo; leave space for a later studio motif. Avoid reducing the decade to grunge costume.

DFG-03 — restrained house and techno lineage

Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1992–1998 Chicago-house- and Detroit-techno-derived instrumental studio language treated with restraint: dry original drum-machine timbres, rounded synth bass, electric-piano chord color, modest analog sequence, soft pad and one filtered percussion development. 120 BPM, steady club pulse below peak-hour intensity, syncopated accents, extended harmony, gradual three-section evolution and open-ended management phrasing. No dominant lead melody; leave space for a later studio motif. This Black American lineage requires relevant creator and music-history review before commission.

Use this exact negative prompt for every DFG candidate:

vocals, singing, rap, spoken word, dialogue, lyrics, choir, humming, whistling, artist imitation, recognizable song, famous theme, quotation, identifiable or copyrighted sample, DJ tag, producer tag, applause, crowd, trailer climax, abrupt ending, clipping, distortion, harsh mastering, excessive compression, long silence, 2010s festival EDM drop, trap triplet hi-hats, dubstep wobble, cyberpunk cliché, cheesy General MIDI, corporate presentation music, arena-rock solo, overdone gated snare, brickwall loudness, retro parody

TECHNICAL SCREENING

Preserve raw output unchanged and read-only. For every candidate record codec/sample format, channels, sample rate, exact frames/duration, SHA-256, LUFS-I, LRA, true peak, sample peak, full-scale sample count/runs, longest silence segments, channel DC offset, stereo correlation, mono-fold loss, duplicate/similarity result, waveform/spectrogram paths, and human review status.

Reject or flag exactly as follows:

- Format must be pcm_s16le, stereo, 44,100 Hz.
- Duration must be 120 seconds within one sample.
- Reject any NaN or infinity.
- Flag any full-scale sample; reject three consecutive full-scale samples or more than 0.01% full-scale samples.
- Reject absolute channel DC offset over 0.01.
- Reject leading silence over 1 second, trailing silence over 2 seconds, or internal silence below -50 dBFS over 2 seconds unless a human explicitly accepts it as structural.
- Flag raw loudness outside -26 to -12 LUFS-I.
- Human-reject any intelligible word, speech, singing, rap, humming, whistling, mouth sound, or producer tag. Do not use cloud transcription.
- Reject byte-identical duplicates; flag spectral similarity over 0.985 across at least 30 seconds for human review.
- Reject sustained stereo correlation below -0.2 or mono-fold loudness loss over 6 dB.
- Reject metallic warble, unstable pitch, phantom vocals, rhythmic collapse, smeared transients, abrupt structural cuts, high-frequency whistles, obvious generated repetition, historical anachronism, parody, one-genre stereotype, or recognizable-theme resemblance.

Use exact reproducibility conventions:

- archive ffmpeg -version and ffprobe -version; use NumPy 2.5.2;
- decode raw int16 as float=int16/32768.0, full scale [-1,1], with endpoint samples exactly -32768 or 32767;
- require exactly 5292000 frames per channel;
- silence is max(abs(L),abs(R)) < 10^(-50/20), measured as contiguous frame runs;
- similarity: SHA-256 first; then mono 0.5*(L+R), FFmpeg-resampled 16 kHz, first 30 seconds, no time shift, unpadded STFT, periodic Hann 2048/hop 512, flattened log1p magnitude, cosine over every within-family pair;
- stereo correlation: mean-removed Pearson in 48000-frame windows/hop 24000 at 48 kHz; three consecutive windows below -0.2 constitute two seconds;
- mono loss: M=0.5*(L+R), copied to both channels, same FFmpeg EBU R128 measurement versus stereo;
- loop boundary jump=max_channel(abs(first-last)); body is the two-channel 99.9th percentile abs first difference excluding first/last one second; seam ratio=20*log10((jump+1e-12)/(body+1e-12));
- loudness values come from archived loudnorm JSON; net gain=output_i-input_i and peak control=max(0,input_tp+net_gain-output_tp);
- only human review decides vocals, historical plausibility, artifacts and recognizable-reference risk.

PROCESSING

For every technically passing raw, resolve every all-caps filename/value locally and call these exact command forms as subprocess arrays. Do not type all-caps tokens literally:

ffprobe -v error -show_entries format=duration:stream=index,codec_name,codec_type,sample_fmt,sample_rate,channels,channel_layout,duration_ts,time_base -of json RAW.wav

ffmpeg -nostdin -hide_banner -loglevel error -fflags +bitexact -i RAW.wav -map_metadata -1 -vn -ar 48000 -ac 2 -c:a pcm_s24le -flags:a +bitexact CONVERTED-48k24.wav

ffmpeg -nostdin -hide_banner -i CONVERTED-48k24.wav -af loudnorm=I=-18:LRA=12:TP=-1.5:print_format=json -f null -

Parse INPUT_I, INPUT_LRA, INPUT_TP, INPUT_THRESH and TARGET_OFFSET from that JSON with the Python standard library, reject missing/nonfinite fields, and substitute their decimal strings into:

ffmpeg -nostdin -hide_banner -loglevel error -fflags +bitexact -i CONVERTED-48k24.wav -map_metadata -1 -af loudnorm=I=-18:LRA=12:TP=-1.5:measured_I=INPUT_I:measured_LRA=INPUT_LRA:measured_TP=INPUT_TP:measured_thresh=INPUT_THRESH:offset=TARGET_OFFSET:linear=true:print_format=json -ar 48000 -ac 2 -c:a pcm_s24le -flags:a +bitexact NORMALIZED-48k24.wav

ffmpeg -nostdin -hide_banner -loglevel error -i NORMALIZED-48k24.wav -map_metadata -1 -vn -c:a aac -b:a 192k PREVIEW.m4a

ffmpeg -nostdin -hide_banner -loglevel error -i NORMALIZED-48k24.wav -filter_complex showwavespic=s=1600x400:split_channels=1:colors=0x4C78A8\|0xF58518 -frames:v 1 WAVEFORM.png

ffmpeg -nostdin -hide_banner -loglevel error -i NORMALIZED-48k24.wav -lavfi showspectrumpic=s=1600x900:legend=1:scale=log:fscale=log:color=intensity -frames:v 1 SPECTROGRAM.png

Use this exact filter graph to make LOOP-114s.wav as stereo 48 kHz/24-bit PCM:

[0:a]atrim=start=6:end=114,asetpts=PTS-STARTPTS[mid];[0:a]atrim=start=114:end=120,asetpts=PTS-STARTPTS[tail];[0:a]atrim=start=0:end=6,asetpts=PTS-STARTPTS[head];[tail][head]acrossfade=d=6:c1=qsin:c2=qsin[xf];[mid][xf]concat=n=2:v=0:a=1[out]

Use this exact filter graph on LOOP-114s.wav to make SEAM-12s.wav as stereo 48 kHz/24-bit PCM:

[0:a]atrim=start=108:end=114,asetpts=PTS-STARTPTS[end];[0:a]atrim=start=0:end=6,asetpts=PTS-STARTPTS[start];[end][start]concat=n=2:v=0:a=1[out]

Add -nostdin -hide_banner -loglevel error -fflags +bitexact, map [out], strip metadata, and set -ar 48000 -ac 2 -c:a pcm_s24le -flags:a +bitexact for both filter-graph invocations. Re-run loudnorm analysis after pass two. If any option/filter is absent, stop rather than install or substitute another FFmpeg.

Then:

1. Keep the raw WAV untouched and hash it.
2. Create a stereo 48 kHz/24-bit PCM working master using deterministic logged ffmpeg arguments.
3. Two-pass normalize a listening master to -18 LUFS-I, LRA no greater than 12 LU, and true peak no greater than -1.5 dBTP.
4. Verify the normalized result within ±0.5 LU.
5. Reject normalization requiring more than 12 dB gain or more than 3 dB peak control.
6. Create a 192 kbps AAC .m4a preview.
7. Render a 1600x400 waveform PNG and 1600x900 log-frequency spectrogram PNG.
8. Create a 114-second rotated loop with a six-second equal-power crossfade between source tail and source head.
9. Render a 12-second seam audition containing loop seconds 108–114 followed by 0–6.
10. Reject an absolute loop-boundary discontinuity over 0.05 full scale or a seam first-difference over 6 dB above the body 99.9th percentile.
11. Listen to full candidate and seam; machine proof cannot accept a loop.
12. Hash every derivative and trace it to its raw file.

STEMS

Record nativeStemSupport as false. Stable Audio 3 Small-Music does not create aligned production stems. Do not call frequency bands, mid/side signals, or source-separated diagnostics stems. Score only whether the arrangement leaves conceptual room for later composer-authored foundation, periodColor, and activityPulse layer groups. Do not add a separation model or large dependency. If production-aligned generator stems become required, stop.

FINALIST SELECTION

Choose exactly one passing candidate from each FND-01, FND-02, FND-03, DFG-01, DFG-02, and DFG-03. Technical cleanliness is the first criterion; use the fixed seed order as the final tie-break. Do not reroll or backfill from a different family. If any family has no passing candidate, stop.

Create exactly six blind IDs C01 through C06. Randomize their displayed order with a recorded presentation-only seed. Keep the identity key outside the Owner listening folder.

ARTIFACT STRUCTURE

Create exactly this local structure:

Project Studio Music Pilot 01/
├── README.md
├── 00_provenance/
│   ├── route-lock.json
│   ├── machine.json
│   ├── software-freeze.txt
│   ├── weights.sha256
│   ├── provenance-register.csv
│   └── licenses/
├── 01_prompt-register/
│   ├── prompts.csv
│   └── commands.jsonl
├── 02_raw/
│   ├── acoustic_electrical_1920_1932/
│   └── sampled_digital_1987_1999/
├── 03_screening/
│   ├── metrics.csv
│   ├── rejections.csv
│   ├── waveforms/
│   └── spectrograms/
├── 04_working/
│   ├── normalized-48k24/
│   └── loops-48k24/
├── 05_owner-listening/
│   ├── README.md
│   ├── scorecard.csv
│   ├── C01/
│   ├── C02/
│   ├── C03/
│   ├── C04/
│   ├── C05/
│   └── C06/
├── 06_feedback/
│   └── OWNER-FEEDBACK.md
└── 07_logs/
    ├── generation.jsonl
    └── processing/

Each C01–C06 contains:

- normalized full WAV;
- 114-second loop WAV;
- 192 kbps AAC preview;
- 12-second seam audition;
- waveform PNG;
- spectrogram PNG;
- metadata JSON.

OWNER SCORECARD

Use exactly these columns:

file_id,inferred_year_range,era_clarity_1_5,project_studio_identity_1_5,historical_plausibility_1_5,stereotype_penalty_0_3,short_term_irritation_1_5,loop_seam_1_5,mix_space_1_5,artifact_penalty_0_3,vocals_present_y_n,recognizable_reference_y_n,keep_y_n,notes

The listening README tells the Owner:

- set one comfortable fixed playback volume;
- listen blind once before opening provenance;
- infer the year range and score all six;
- listen to every seam audition;
- then reveal the family key;
- select no more than one preferred file and one alternate per epoch, or reject all candidates;
- score `short_term_irritation_1_5` as 1 = no immediate irritation and 5 = stop listening; this two-minute response cannot clear long-session endurance;
- do not treat technical passage as an obligation to keep a cue.

PROVENANCE REGISTER

For every raw and derivative record:

- research-base branch and SHA;
- code repository/commit/license;
- canonical and optimized model IDs/revisions;
- all three required weight byte counts/SHA-256 hashes and the excluded encoder disposition;
- controlled-archive evidence IDs/hashes for Stability Community Agreement/AUP, Gemma Terms/Prohibited Use Policy, model cards/training material, and Hugging Face terms; do not copy private legal records into this folder;
- only an opaque Rights Manager evidence ID and `verified/not_verified` result; never actual revenue/entity classification, registration record, contact/account identifier, or counsel material;
- software freeze and machine/OS/tool details;
- exact positive/negative prompt, prompt ID, parameter set, seed, argv and timestamps;
- raw and derivative SHA-256 hashes;
- screening metrics, human dispositions and rejection reason;
- AI-generation disclosure;
- rights status PROTOTYPE_ONLY;
- nativeStemSupport false;
- no external reference audio and no model/cloud-service upload declaration; separately record the approved Project-remote redacted-metadata push.

RIGHTS GATE

Everything remains prototype-only. Potential commercial eligibility is not clearance. A later proposal requires current authorized-term acceptance/registration confirmation, affiliate/revenue and Community/Enterprise review, Stability/Gemma/Hugging Face incorporated-term review, human authorship/arrangement, similarity/musicologist review, platform/territory/store review, complete provenance and qualified-counsel approval.

MODEL-MATERIAL RETENTION

Name the Rights Manager as custodian and record a post-listening retention decision date plus periodic license-status recheck. If the Community/Gemma permission terminates, the conservative USD 1 million rule is met or uncertain, or Enterprise coverage has a gap, stop all model use and delete or rights-quarantine Stable Audio/T5Gemma weights, Hub caches, and hard links as the Rights Manager/counsel directs. Preserve hashes, legal snapshots, and audit logs where lawful; never retain covered weights contrary to termination duties.

Never ship:

- ACE-Step output without a new provenance/legal approval;
- MusicGen or other noncommercial-model output;
- original The Movies music or an imitation;
- named-artist, named-song or named-score imitation;
- recognizable melody, recording, sample or vocal identity;
- unowned guide/reference audio;
- a failed-screen or incomplete-provenance file;
- raw generative output as a production master under the adopted commissioning policy.

REPOSITORY RECORD

On the isolated documentation branch, create only text documentation/metadata under:

docs/audio/pilot-01/

Include only:

- pilot report;
- prompt register;
- repository-redacted provenance register containing only opaque evidence IDs/status, never controlled legal or organization data;
- screening summary;
- finalist SHA-256 register;
- Owner feedback template/instructions if text-only.

The exact prompt register may be pushed only to this approved Project remote; it must not be sent to a model/cloud service. Keep a fuller local controlled provenance register if needed, but do not commit audio, weights, WAV, M4A, images, plots, secrets, actual revenue/entity classifications, registration/contact/account records, counsel material, environments, caches, source sessions, scripts, dependencies, or production files. Use apply_patch for repository text edits. Before commit, verify the diff contains only approved text documentation/metadata.

Commit message:

docs: record era music pilot generation

Push the documentation branch, verify remote SHA equals local, leave the worktree clean, do not merge, and do not import anything into Unity.

STOP CONDITIONS

Stop immediately for Owner direction if:

- research approval or the opaque Rights Manager `verified` evidence is absent;
- USD 1 million revenue status is exact/uncertain, entity/affiliate analysis is unresolved, or authorized term acceptance/registration is not already complete;
- a paid API, payment, login/terms/registration action, enterprise contract, contact disclosure, or private/model-service upload is requested;
- the three-weight download exceeds 1.9 GB or any revision/size/hash differs;
- any Stability/Gemma/Hugging Face/code/model term, incorporated policy, snapshot, or toolchain license is missing, changed, disappeared, or unclear;
- system-level/Homebrew/Xcode/admin/global Python/uv installation is required;
- machine, memory, 12 GB disk, Python, git, ffmpeg, or ffprobe preflight fails;
- a prompt/audio/log would leave the machine except the expressly approved redacted text records pushed to the Project remote;
- model-material retention/deletion cannot follow the Rights Manager’s instruction after termination or license gap;
- any prompt family has no technically passing candidate;
- more than 25% of candidates contain vocals, recognizable imitation, severe artifacts, or historical parody;
- Small-Music cannot sustain acceptable 120-second coherence;
- aligned production stems become a requirement;
- any step would switch to Stable Audio Medium, ACE-Step, another model, or a paid service.

Do not solve a stop by changing scope, loosening a rights/screening rule, rerolling seeds, installing a different tool, or selecting another model. Report the exact blocker and preserve completed evidence.

FINAL RESPONSE

Return exactly these sections:

PHASE 2 MUSIC PILOT STATUS
COMPLETE / BLOCKED

BRANCH

COMMIT SHA

APPROVED RESEARCH BASE SHA

ARTIFACT DIRECTORY

ROUTE AND REVISIONS

WEIGHT HASH VERIFICATION

CANDIDATE COUNT

FINALISTS

TECHNICAL REJECTIONS

RIGHTS STATUS

OWNER LISTENING INSTRUCTIONS

UNITY / SCREEN ACTIVITY
None.

PRODUCTION CHANGES
None.

NEXT ACTION
Owner listens and approves, rejects, or requests one bounded revision batch.

Then stop.
```
