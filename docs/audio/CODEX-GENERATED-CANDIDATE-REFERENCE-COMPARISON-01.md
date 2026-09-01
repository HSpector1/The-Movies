# CODEX — Generated Candidate Reference Comparison 01

**Status:** DECISION-READY RESEARCH CANDIDATE  
**Asset status:** `PROTOTYPE_ONLY`  
**Scope:** DOCUMENTATION AND READ-ONLY SIGNAL ANALYSIS ONLY  
**Candidate decision:** HUMAN AUDITION REQUIRED; NO FINALISTS SELECTED  
**Pilot documentation authority:** `codex/era-aware-music-pilot-01` at `c8c80c4739f54ecb990a4518aae58365dc1bc4b0`  
**Research authority:** `codex/era-aware-music-direction-01` at `f803164357ad417cea3162cb2c329890868f2b19`  
**Research date:** 2026-08-31

## 1. Decision statement

Twenty-two normalized audition sources that remain machine-eligible under Screening Gate V2 received one bounded, deterministic signal-description pass. The analysis changed no audio and ran no model inference. It produced:

- 6 `MATCH` signal proxies;
- 8 `PARTIAL MATCH` signal proxies;
- 6 `MISMATCH` signal proxies; and
- 2 `HUMAN REVIEW REQUIRED` signal proxies.

These labels answer only a narrow question: **did estimated pulse and detected large-scale section count resemble the numerical form requested by that candidate's prompt?** They are not musical-quality scores, historical verdicts, or finalist rankings. A `MISMATCH` remains eligible for listening. A `MATCH` does not establish that the requested instruments, performance language, cultural lineage, management-game function, or non-infringement condition is present.

Every candidate remains `HUMAN REVIEW REQUIRED` for:

- instrumentation and performance style;
- melodic prominence and fatigue;
- vocals, mouth-like sounds, or other generation artifacts missed by machine screening;
- era authenticity and prohibited parody;
- functional *The Movies* spirit;
- relevant period-game background suitability;
- recognizable protected-reference concern; and
- final keep/maybe/reject judgment.

The two Gate V2 automatic failures are excluded from this 22-candidate comparison:

| Candidate | Preserved Gate V2 reason | This pass |
|---|---|---|
| `FND-02__seed-155921` | sustained negative stereo correlation | not analyzed; remains excluded |
| `DFG-03__seed-196613` | excessive trailing silence | not analyzed; remains excluded |

**PROJECT: STUDIO RECOMMENDATION.** Use this document as an orientation aid behind the blind Owner worksheet, not as an automatic sorter. Do not reveal its candidate IDs before first-pass blind scoring, do not select `C01`–`C06`, and do not regenerate from these results.

## 2. Evidence language and comparison law

This report uses five deliberately different labels:

- **SOURCE-DERIVED FINDING** — supported by an external primary or professional source.
- **CURRENT-PILOT FINDING** — measured from immutable pilot evidence or read from its sealed registers.
- **TECHNICAL INFERENCE** — a bounded interpretation of signal features, not a listening conclusion.
- **ARTISTIC INTERPRETATION** — a creative criterion that requires human judgment.
- **PROJECT: STUDIO RECOMMENDATION** — proposed action after the distinction above is preserved.

`MATCH`, `PARTIAL MATCH`, and `MISMATCH` in candidate tables mean **prompt-signal status only**. `HUMAN REVIEW REQUIRED` is not a weak score. It is the correct outcome wherever the method cannot support a claim.

All references to *The Movies* mean **functional / era / design-grammar similarity**: playful but useful Hollywood-management underscore, broad cinematic vocabulary, period legibility, and enough restraint for a lot-management session. They never mean melodic, harmonic, timbral, or arrangement imitation of a Daniel Pemberton cue. No candidate should be rewarded for resembling a particular protected track, theme, chord sequence, arrangement, recording, performer, or composer.

## 3. Immutable evidence and reproducibility

### 3.1 Inputs and outputs

| Evidence | Absolute local path | SHA-256 |
|---|---|---|
| Gate V2 prompt register | `/Users/bruce/Project Studio Music Pilot 01/01_prompt-register/prompts.csv` | `6be1872172cf268ac5b618c6f019115c249503893533c61acf650f7afd0057a3` |
| Gate V2 final disposition | `/Users/bruce/Project Studio Music Pilot 01/03_screening/gate-v2/final-disposition.csv` | `a7202e1eef8632d5bce23acb92fd9d057df02e6d1d3d0d17f8a0d81f07461cbe` |
| Gate V2 objective metrics | `/Users/bruce/Project Studio Music Pilot 01/03_screening/gate-v2/metrics-objective.csv` | `cb889a3e206c4126fb35094c8b708b8d9afa7d9a9a51ed884d434706efce78cf` |
| Analysis script | `/Users/bruce/Project Studio Music Pilot 01 Tooling/analyze_reference_candidates.py` | `3c59bbb81441c4105a96ce19c904a6f6a3ace299d115b597b8b809092d7572da` |
| Feature JSON | `/Users/bruce/Project Studio Music Pilot 01/03_screening/reference-calibration-01/features.json` | `cfa67bb30cbaae1f86ec0a79ba43d906533c49fe3d5ae3e59e734a9491e2d2ff` |
| Feature CSV | `/Users/bruce/Project Studio Music Pilot 01/03_screening/reference-calibration-01/features.csv` | `a6dc8081a2b2096b399e7d5ce58063d46c83fb9a2dd55702b67a94dbd1b869c4` |

**CURRENT-PILOT FINDING.** All 22 analyzed inputs are 120.0-second, stereo, 48 kHz normalized audition derivatives. Their raw and normalized SHA-256 values are recorded per row in the feature evidence. The analysis read the normalized derivatives and the preserved Gate V2 records; it did not write, transcode, normalize, replace, or rename any candidate.

| Candidate | Preserved raw SHA-256 | Analyzed normalized-source SHA-256 |
|---|---|---|
| `DFG-01__seed-104729` | `4e45485b694e7b8ebc511c2068a2b4b78c5a5e421ed22049af0f03aeb74377b1` | `42ecc059d4472d44e2e0c3fe2d165a760399d5c712bb89507dc6b1211e34aef9` |
| `DFG-01__seed-130363` | `9c7e2c319050b9b90edfc8e4dbd3cbcc899c5b63a13114bb7ac939715f79080f` | `32cd166172e2bc68358b00df76dd2d15e3581f77dc42fb9ba68340973af5ca7b` |
| `DFG-01__seed-155921` | `eafcdb88f887ed9e88813460badc264b73810a451064a9cf696dd70411b5de15` | `39b41ac718271dd51e8bd26b21f86c6873fd291a49e28cd903cb472d759c6948` |
| `DFG-01__seed-196613` | `ae1be0583540c21af16b9a137c1329eeff51801e5a604907b65cd68854502138` | `bd7068d15ead3f08bb050d83ea1b9db13febec8012fc9f4a8444680a0c409998` |
| `DFG-02__seed-104729` | `1da619261e8eb6d8badfc31ddeecde86347280a7756fa8193d230d4911c0e496` | `a93778719f97b3de561b7c290463fcff79b734a40aadf90fec256558d7aa8ec4` |
| `DFG-02__seed-130363` | `a1b1bfcb8a98b283d01a9444a476825f2e23326f3ef091006b70bc2806ce6d90` | `bf83856760be0137b7c8abfd6b3929a915699d011a42f71f0d0003630b21b4ad` |
| `DFG-02__seed-155921` | `571c08c7fd8000e6a03c1ccf9dcfd415a2a17b9cfa6bc2df830d72de52cb6b27` | `663aecf8835926321e521e4766e7c30d14e40571a595c3a7b6dc4180ffe858e9` |
| `DFG-02__seed-196613` | `24df6f6dce63c84e64be8638756bf82d24248880ae55387a68967e9df64263fa` | `88d854e23de5855afb6d327397469ce5f127d5c0994c9335e5793e59624bf920` |
| `DFG-03__seed-104729` | `3a0cb7b19b3baf7458490c76f677147eba2d153f748b8abcbeeb34da62a20622` | `41b42402a55afc46357c1b1ddff146b5ae2a882eba0890b3033bdf2f01a60a8e` |
| `DFG-03__seed-130363` | `c38841a0bdc0e6a5e24725951b872c0a704b2c943e2e67823383e51141f1e13e` | `f9ed960e7e278d7546f442f669872fb8592911f4f1a7e136db1f54215fa72248` |
| `DFG-03__seed-155921` | `efed159e0e6d18fbcb8628fd6e0ab70500be338b4905fd5ce7f4abbdb5b93d3d` | `04fe9d1ff6ff1c553eeb7826607a445aa853c791736b2fb18fd9e67b34bbc8c3` |
| `FND-01__seed-104729` | `8228bd6e82131aac73b46357d57816748a18fe03a74f5219cc0cffdc5bde361d` | `ddd52b5ac5bf182ead6fa71077b7b472fb5ceadd7a0dcc9cd9575d4b41c2001a` |
| `FND-01__seed-130363` | `9f48682f5fef2feae4b7fafaf215d782b13cc6a96f09b0ada9083817582a7429` | `f87881c164b1ae48db572d805ecbc3344549644fbbac485709987c071268707e` |
| `FND-01__seed-155921` | `d8d3d2865407e62b71526283d838b07eb34ff3a09acec2d5963ee733671dc28c` | `9b1ff998d6cd45f7459e8f1ed5e68a6c1c978888bc7f4e4d506dc393d2974aeb` |
| `FND-01__seed-196613` | `94b77d7863ea41c3e25f4e5d20a5f9875a595b3fe526abed8f6fc508232c2fd6` | `6735bf30b21d9c5091b8e4716e068588cdf6e0e9895b56bf84d3899c3378fb38` |
| `FND-02__seed-104729` | `0ccc4d909372ee663ec73f89eb4e564589f276352953922f8b0c0cc274a98b06` | `959a9f80432b823f1d401314749412d3a0684a813e38216657554b09d87fbf1f` |
| `FND-02__seed-130363` | `845f3f64e69dfc00c68df4017e21c5191d1888d8740aca45ed358e66fe498baa` | `a8a754e288fc9532d633eed352679b0948f2e39a99719a180f4a7ea28c3e5fe9` |
| `FND-02__seed-196613` | `2cf1f4ff66f4a8dbd9e66d19da3426021849265b89be91f767dc552b1d24661a` | `e8f611dbe46d6d3b737bad5a29c0e5de53e8fca5ab95ebb06c1125516129de9b` |
| `FND-03__seed-104729` | `d86aa7452337825d16cf00ed0d120354b2415caef0cea712390b6f3cd61dc7be` | `c4f0cb1ce95c150ba2ec1101790d315d00989afdbb2b51a1269365cce67adf86` |
| `FND-03__seed-130363` | `4771707e00bfa67d71c1daf947047f736358844a309b60fb56b28913dd53ef7b` | `e4babd90c31cb4d953308530ddf0a3ac1d6ade09105069dace91943bd64f691a` |
| `FND-03__seed-155921` | `80dbbe935519e0f2b760b50a2699e14bd019235b3686f0be4ede822b6d22faaf` | `459357eb1040ae71aefe9cfff046c0a5660a06e11a1bcce794a64e42042874f5` |
| `FND-03__seed-196613` | `2758952829f2eaf6593f0a6bd7689ea5f98bdc3c330b0b604b7fb77162c7f4a6` | `5fc937a949b0c8870f6243c05d0de34e3e59b054ccd77a9b605805cbbc7a27a5` |

### 3.2 What the method computed

The method averaged stereo to mono for analysis only, used deterministic box-filter decimation to 8 kHz, and computed descriptive features from fixed FFT windows. It estimated:

- pulse by autocorrelation of an onset envelope, including half-/double-time alternatives;
- event density as retained onset peaks per minute;
- median spectral centroid, 15–85% spectral bandwidth, flatness, and high-band ratio;
- large-scale section boundaries from five-second feature-vector novelty;
- a chroma-adjacency harmonic-stability proxy and tonal-concentration proxy;
- one-second RMS percentiles; and
- relative low/medium/high cohorts within these 22 candidates for onset density, spectral bandwidth, and upper-level energy.

The prompt-signal label uses only estimated tempo and section count:

- tempo within 8% of the prompt target is `MATCH`; within 16% is `PARTIAL MATCH`; otherwise `MISMATCH`;
- a 2–4-section proxy is `MATCH`, 1 or 5 is `PARTIAL MATCH`, and more than 5 is `MISMATCH`;
- if both match, the combined label is `MATCH`; any mismatch makes it `MISMATCH`; otherwise it is `PARTIAL MATCH`; and
- a very weak tempo peak-dominance heuristic below 0.025 forces `HUMAN REVIEW REQUIRED`.

The displayed tempo confidence `h` is an internal peak-dominance heuristic from 0 to 1, **not a probability of correctness**. Every estimate remains susceptible to half-time, double-time, syncopation, rubato, weak attacks, and changing pulse.

The displayed spectral cohort comes from spectral **bandwidth**, not instrument count, mix fullness, orchestration density, or production quality. “Background-leaning” and “foreground-risk” are also only compound signal flags based on within-pilot cohorts, LRA, and section count.

### 3.3 What the method did not compute

No instrument recognizer, vocal recognizer, melody-similarity engine, chord transcriber, genre classifier, historical-style classifier, plagiarism detector, or learned music-embedding model was used. It follows that the pass cannot determine whether a candidate contains cornet, banjo, stride piano, live guitar, a drum machine, a protected-like melody, or any named style. The signal pass also cannot hear crackle, harshness, comedy, sincerity, “human feel,” annoyance, or whether transitions feel natural.

**TECHNICAL INFERENCE.** The features are useful for locating likely audition questions, not answering them. A six-section proxy can mean excess change, a false novelty trigger, or musically coherent variation; only listening distinguishes those cases.

## 4. Family intents and lawful reference anchors

### 4.1 What “The Movies spirit” means here

**SOURCE-DERIVED FINDING.** Associate Producer Brynley Gibson described roughly ninety originally composed pieces available in film post-production and said the team later put its music on the lot, then framed that presentation as a DJ service. Exact cue identity, master reuse, and routing are undocumented. [Shacknews developer interview](https://www.shacknews.com/article/39083/the-movies-interview). **ARTISTIC INTERPRETATION:** Together with the contemporary soundtrack descriptions, this suggests a useful tension between era signaling and a flexible film-music vocabulary; it is not a disclosed implementation formula. [Soundtrack catalogue/review](https://www.soundtrack.net/album/the-movies/).

**ARTISTIC INTERPRETATION.** For this pilot, functional spirit means:

- a readable era or media-production ecology within a few seconds;
- enough cinematic color to suit a Hollywood studio rather than a museum exhibit;
- a curious, industrious, humane, quietly optimistic identity;
- low enough melodic and arrangement dominance for workday management;
- modular movement rather than constant scene-by-scene “mickey-mousing”;
- humor through deft character, never racial, regional, class, or decade caricature; and
- an open form that could later accommodate a separately composed Project: Studio motif.

Historical plausibility and cinematic homage are therefore two different audition axes. A candidate may be historically suggestive but functionally dull, or theatrically persuasive but anachronistic. Neither axis authorizes imitation.

### 4.2 Family calibration matrix

| Family | Intended prompt function | Source-derived historical anchor | Functional *The Movies* / period-game question | Red flags requiring listening |
|---|---|---|---|---|
| `FND-01` | 1926–32 clean-master compact electrical dance-jazz; target 104 BPM; three low-contrast sections | Commercial electrical examples existed by 1920; Columbia and Victor implemented and introduced the process at scale in 1925, after which acoustic recording rapidly declined. Jazz is plural and rooted in Black American music; syncopation, blues language, ensemble exchange, improvisation, and dance function matter more than a stock “Roaring Twenties” costume. [LOC recording timeline](https://www.loc.gov/programs/national-recording-preservation-plan/tools-and-resources/historical-background/timeline/); [Smithsonian jazz overview](https://music.si.edu/story/jazz) | Does ensemble conversation make the lot feel active without monopolizing attention? Does cinematic polish preserve period character without fake shellac damage? | frantic Charleston shorthand; novelty banjo; constant brass lead; modern rhythm section; surface-noise cosplay; dominant tune |
| `FND-02` | 1920–27 photoplay chamber underscore; target about 82 BPM; modular, lyrical, functional, restrained | Silent-film practice included compiled scores, improvisation, cue sheets, and original scores; cue materials organized music by mood, tempo, and duration and allowed varied forces. That supports functional modularity, not one universal “silent film sound.” [LOC collection](https://www.loc.gov/collections/silent-film-scores-and-arrangements/about-this-collection/); [LOC contextual essay](https://www.loc.gov/collections/silent-film-scores-and-arrangements/articles-and-essays/a-warming-flame/) | Can it suggest film-making craft while remaining calm lot music? Is its lyricism flexible rather than narrating an unseen melodrama? | nonstop scene painting; villain-piano cliché; saccharine romance; huge talkie fanfare; hyperactive tempo changes |
| `FND-03` | 1923–29 Black American stride-and-blues-informed small ensemble; target 92 BPM; three spacious sections | Jazz and blues-derived practice cannot be reduced to a novelty rhythm or a white entertainment-industry stereotype. Call-and-response, syncopation, blues forms/inflection, collective interaction, and improvisatory character are relevant anchors; attribution and creator review remain mandatory. [Smithsonian jazz overview](https://music.si.edu/story/jazz); [Smithsonian African American Music](https://music.si.edu/spotlight/african-american-music/default) | Does it feel like living ensemble musicianship and useful studio-day motion, rather than a costume? | minstrel or dialect coding; manic stride; honky-tonk; “old-timey” exaggeration; generic big band; lead melody that becomes a jingle |
| `DFG-01` | 1991–96 wholly generated sample-shaped hip-hop/R&B; target 92 BPM; three low-intensity sections | **ARTISTIC, RIGHTS-CONSTRAINED HYBRID—not a reconstruction.** Hip-hop and R&B are distinct Black musical lineages even where 1990s production overlaps. Smithsonian accounts locate hip-hop in Black and Latino Bronx youth culture and Black, Puerto Rican/Latino, Jamaican, and other Caribbean exchange. Samplers became compositional instruments, but culture is not a device preset; this pilot forbids sourced recordings. [Smithsonian hip-hop release](https://americanhistory.si.edu/press/releases/hip-hop-comes-smithsonian); [The sazón in hip-hop](https://americanhistory.si.edu/explore/stories/sazon-hip-hop); [NMAAHC Black Music Month](https://nmaahc.si.edu/explore/stories/celebrating-black-music-month) | Does repetition create a durable work groove with small, rewarding changes? Does the cue retain musical character without mimicking a producer or recording? | identifiable sample-like fragment; rapper/mouth sound; rigid stock loop; contemporary trap markers; lead hook; culture stripped into a generic “urban” preset |
| `DFG-02` | 1990–96 band-led college-alternative / early post-rock lane; target 94 BPM; three evolving low-intensity sections | The prompt deliberately tests one band-production lane inside a plural decade. Signal analysis cannot verify live drums, bass, two guitars, electric piano, human timing, modal/suspended harmony, or restrained overdrive. | Does ensemble breathing and texture give cinematic personality without turning management play into a concert? | generic grunge costume; arena-rock climax; soloist dominance; constant wall of guitars; contemporary corporate “indie” uplift |
| `DFG-03` | 1992–98 restrained Chicago-house / Detroit-techno-derived lane; target 120 BPM; gradual three-section evolution | **ARTISTIC HYBRID informed by two distinct local traditions—not a claim to authenticate both.** Institutional holdings trace house to Chicago's Black, Latino, and queer dance communities and Detroit techno to a separate local electronic lineage; the history is social and local, not simply “four-on-the-floor plus retro synth.” [Smithsonian house-history catalogue](https://www.si.edu/object/do-you-remember-house-chicagos-queer-color-undergrounds-micah-salkind%3Asiris_sil_1160644); [Smithsonian electronic-dance history catalogue](https://www.si.edu/object/underground-massive-how-electronic-dance-music-conquered-america-michaelangelo-matos%3Asiris_sil_1105166) | Can a steady pulse sit below peak-hour intensity and support long management play? Is gradual timbral development enough to sustain interest? | 2010s festival drop; cyberpunk preset; excessive peak energy; static eight-bar loop; parody “retro” synth; cultural lineage treated as decoration |

### 4.3 Period-game comparator principles

The comparison is intentionally functional, not sonic imitation.

- *L.A. Noire* separates original non-diegetic score, licensed period recordings, newly written period-style songs, and in-world radio. Project: Studio should likewise judge lot underscore separately from later Studio Radio. [Rockstar soundtrack documentation](https://www.rockstargames.com/es/newswire/article/1748koo9ok58ok/anuncio-del-lanzamiento-de-la-banda-sonora-de-la-noire-official-.html).
- *Red Dead Redemption* used a restrained interactive score designed for long traversal, with shared musical constraints and authored transitions. The applicable lesson is patience and continuity, not Western instrumentation. [Game Developer composer interview](https://www.gamedeveloper.com/audio/myths-mavericks-and-music-of-i-red-dead-redemption-i-).
- *Fallout 4* is a deliberately ahistorical contrast, but its team described multi-day listening tests and removing songs that became annoying or disrupted flow. The transferable lesson is that endurance listening can overturn an attractive first impression. [Bethesda developer feature](https://bethesda.net/en-US/news/facing-the-music-in-fallout-4).
- *Mafia II* separates its original orchestral score from more than 120 licensed recordings distributed through in-world radios, letting world chronology do work that underscore need not do. The lesson is separation of roles, not using licensed masters in Project: Studio. [PlayStation developer Q&A](https://blog.playstation.com/2010/07/20/mafia-ii-on-ps3-your-questions-answered/), [GameSpot music-supervisor interview](https://www.gamespot.com/articles/sound-byte-mafia-ii-exclusive-soundtrack-download/1100-6283964/), [official PC manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/50130/manuals/MAFIA_II_PC_DOWNLOAD_MANUAL_ENG%5B1%5D.pdf?t=1730176761).

For every candidate below, the period-game column remains `HUMAN REVIEW REQUIRED` until the Owner can answer: does it leave room for ambience, PA, UI, and later radio; can it survive repetition; do its sections move without feeling like gameplay state thrash; and is it lot underscore rather than a foreground film scene or radio song?

## 5. Candidate signal atlas

### 5.1 Reading the table

- `BPM / h` is the preferred pulse estimate near the prompt target and its internal peak-dominance heuristic. A value may be a half-/double-time interpretation.
- `Onsets` is retained signal-onset peaks per minute, followed by the 22-track cohort.
- `Band` is median 15–85% spectral bandwidth in hertz, followed by its cohort. It is not orchestration density.
- `Sections` is a five-second novelty-based count proxy.
- `H-stab` is mean cosine similarity between adjacent two-second chroma-energy bins. It is a 0–1 harmonic-stability proxy, not chord recognition or a quality score.
- `LRA / E` is Gate V2 normalized loudness range in LU and the within-cohort upper-level energy label.
- `BG tendency` is a signal-only audition flag; it is not a suitability result.
- `Prompt signal` is the narrow combined pulse/section label described in §3.2.

#### `FND-01` — post-1925 electrical dance-jazz

| Candidate | BPM / h | Onsets | Band | Sections | H-stab | LRA / E | BG tendency | Prompt signal | Listen for |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| `FND-01__seed-104729` | ≈117.2 / .043 | 130.5, low | 188 Hz, medium | 5 | .591 | 5.2, low | mixed | `PARTIAL MATCH` | pulse may be read at ≈58.6 half-time; determine whether five-part motion is coherent or busy |
| `FND-01__seed-130363` | ≈117.2 / .116 | 153.0, high | 195 Hz, high | 4 | .661 | 6.6, medium | foreground-risk | `PARTIAL MATCH` | whether energetic bandwidth/dynamics overwhelm workday use; whether pulse actually feels too fast |
| `FND-01__seed-155921` | ≈117.2 / .054 | 129.5, low | 172 Hz, medium | 5 | .621 | 4.9, high | mixed | `PARTIAL MATCH` | low detected attack density versus high upper-level energy; whether phrasing breathes |
| `FND-01__seed-196613` | ≈117.2 / .044 | 151.5, high | 223 Hz, high | 3 | .544 | 4.5, medium | mixed | `PARTIAL MATCH` | strongest section-count fit in family, but uncertain faster pulse and denser signal need listening |

**TECHNICAL INFERENCE.** All four land above the requested 104 BPM under the chosen half/double-time resolution, so the signal pass cannot distinguish relaxed dance motion from an over-fast feel. No row proves dance-jazz instrumentation or period character.

#### `FND-02` — silent-era photoplay chamber

| Candidate | BPM / h | Onsets | Band | Sections | H-stab | LRA / E | BG tendency | Prompt signal | Listen for |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| `FND-02__seed-104729` | ≈85.2 / .039 | 107.5, low | 232 Hz, high | 4 | .490 | 5.6, medium | mixed | `MATCH` | whether slow attack rate reads as calm functional chamber writing rather than inert padding |
| `FND-02__seed-130363` | ≈85.2 / .077 | 107.0, low | 264 Hz, high | 5 | .498 | 5.5, low | mixed | `PARTIAL MATCH` | whether the extra detected section is modular variety or scene-by-scene over-narration |
| `FND-02__seed-196613` | ≈85.2 / .056 | 110.0, low | 227 Hz, high | 4 | .551 | 6.4, high | mixed | `MATCH` | large energy span despite low event density; whether swells become melodramatic or fatiguing |

**TECHNICAL INFERENCE.** All three retained candidates cluster near the requested tempo and have the cohort's lowest event densities. That combination is compatible with the calm brief but does not establish chamber instruments, modular eight-bar construction, historical plausibility, or absence of a dominant tune.

#### `FND-03` — Black-led stride and blues small ensemble

| Candidate | BPM / h | Onsets | Band | Sections | H-stab | LRA / E | BG tendency | Prompt signal | Listen for |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| `FND-03__seed-104729` | ≈93.8 / .165 | 148.5, medium | 104 Hz, low | 6 | .675 | 3.7, medium | mixed | `MISMATCH` | section detector found frequent changes; test whether they are ensemble responses or distracting churn |
| `FND-03__seed-130363` | ≈93.8 / .217 | 143.0, medium | 105 Hz, low | 4 | .662 | 2.3, medium | background-leaning | `MATCH` | whether restrained signal still carries living call-and-response and avoids flattening into a generic loop |
| `FND-03__seed-155921` | ≈93.8 / .053 | 131.5, low | 109 Hz, low | 5 | .596 | 3.1, high | mixed | `PARTIAL MATCH` | whether lower event density leaves healthy breathing room; assess cultural and instrumental claims by ear |
| `FND-03__seed-196613` | ≈93.8 / .250 | 145.5, medium | 98 Hz, low | 4 | .656 | 3.2, high | background-leaning | `MATCH` | strongest pulse confidence in family; still requires creator/history and caricature review |

**TECHNICAL INFERENCE.** The estimates cluster consistently near the 92 BPM request. The method cannot identify stride motion, blues form, blue-note inflection, call-and-response, ethnicity, authorship, or respectful treatment. Signal fit must never substitute for the mandated Black music-history and creator review.

#### `DFG-01` — wholly new sample-shaped hip-hop/R&B

| Candidate | BPM / h | Onsets | Band | Sections | H-stab | LRA / E | BG tendency | Prompt signal | Listen for |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| `DFG-01__seed-104729` | ≈93.8 / .071 | 159.5, high | 176 Hz, medium | 7 | .687 | 1.8, low | mixed | `MISMATCH` | many detected changes despite very small LRA; determine whether it is varied groove or choppy generation |
| `DFG-01__seed-130363` | ≈93.8 / .058 | 154.5, high | 203 Hz, high | 4 | .699 | 2.9, low | mixed | `MATCH` | whether high attack activity supports relaxed swing or produces nervous foreground clutter |
| `DFG-01__seed-155921` | ≈93.8 / .153 | 152.5, high | 152 Hz, medium | 5 | .553 | 3.5, medium | mixed | `PARTIAL MATCH` | whether the extra section adds long-session interest without breaking groove continuity |
| `DFG-01__seed-196613` | ≈62.5 or 125 / .112 | 132.5, low | 191 Hz, high | 4 | .772 | 4.9, low | mixed | `MISMATCH` | pronounced half/double ambiguity; judge actual pocket rather than accepting either estimate |

**TECHNICAL INFERENCE.** Three candidates have pulse estimates near the request, but none can be machine-certified as swung, sample-shaped, R&B/hip-hop-derived, or made from recognizable-reference-free material. The fourth needs a human tempo reading.

#### `DFG-02` — band-led alternative and early post-rock

| Candidate | BPM / h | Onsets | Band | Sections | H-stab | LRA / E | BG tendency | Prompt signal | Listen for |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| `DFG-02__seed-104729` | ≈117.2 / .093 | 136.0, medium | 133 Hz, medium | 5 | .631 | 5.3, low | mixed | `MISMATCH` | likely faster-than-request pulse; determine whether the music still breathes and avoids rock-show urgency |
| `DFG-02__seed-130363` | ≈78.1 / .010 | 151.0, medium | 109 Hz, low | 3 | .685 | 2.5, low | background-leaning | `HUMAN REVIEW REQUIRED` | tempo evidence is weak; verify pulse, band feel, and whether low dynamics become bland |
| `DFG-02__seed-155921` | ≈85.2 / .001 | 143.0, medium | 82 Hz, low | 5 | .669 | 4.8, medium | mixed | `HUMAN REVIEW REQUIRED` | tempo evidence is effectively indeterminate; judge section evolution and instrumental credibility directly |
| `DFG-02__seed-196613` | ≈72.1 / .094 | 141.0, medium | 133 Hz, medium | 3 | .745 | 4.6, medium | background-leaning | `MISMATCH` | much slower pulse estimate; decide whether this is useful spacious post-rock or lethargic / off-brief |

**TECHNICAL INFERENCE.** This family is the clearest warning against automated style inference: none of its reliable features can prove “live band,” guitar texture, human drumming, post-rock, or 1990s production. Two tempo estimates are explicitly unresolved and the other two differ materially from the request.

#### `DFG-03` — restrained house and techno lineage

| Candidate | BPM / h | Onsets | Band | Sections | H-stab | LRA / E | BG tendency | Prompt signal | Listen for |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| `DFG-03__seed-104729` | ≈117.2 / .118 | 164.0, high | 113 Hz, medium | 4 | .841 | 6.8, high | mixed | `MATCH` | whether energy/LRA remain below peak-hour intensity and whether stereo behavior sounds stable in context |
| `DFG-03__seed-130363` | ≈117.2 / .132 | 148.5, medium | 172 Hz, medium | 6 | .747 | 7.3, high | mixed | `MISMATCH` | frequent section proxy plus widest LRA in set; test for over-development or abrupt transitions |
| `DFG-03__seed-155921` | ≈117.2 / .139 | 176.5, high | 98 Hz, low | 5 | .832 | 3.7, high | mixed | `PARTIAL MATCH` | highest detected onset density; determine whether steady pulse remains calm or becomes fatiguing |

**TECHNICAL INFERENCE.** All retained candidates have plausible estimates near the requested 120 BPM, but their high upper-level energy makes “restrained” a listening question. Signal fit cannot establish Chicago/Detroit lineage, drum-machine timbre, extended harmony, or cultural respect.

## 6. Four-way comparison disposition for every candidate

The table below makes the uncertainty explicit rather than repeating unsupported style guesses. `Prompt` is the only machine-derived comparison. `Movies`, `period game`, and `history` all require the Owner's ears and, for culturally specific lanes, informed creator/history review.

| Candidate | Intended-family prompt signal | Original *The Movies* functional grammar | Period-game long-session grammar | Actual-period musical anchor |
|---|---|---|---|---|
| `FND-01__seed-104729` | `PARTIAL MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `FND-01__seed-130363` | `PARTIAL MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `FND-01__seed-155921` | `PARTIAL MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `FND-01__seed-196613` | `PARTIAL MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `FND-02__seed-104729` | `MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `FND-02__seed-130363` | `PARTIAL MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `FND-02__seed-196613` | `MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `FND-03__seed-104729` | `MISMATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `FND-03__seed-130363` | `MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `FND-03__seed-155921` | `PARTIAL MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `FND-03__seed-196613` | `MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-01__seed-104729` | `MISMATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-01__seed-130363` | `MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-01__seed-155921` | `PARTIAL MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-01__seed-196613` | `MISMATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-02__seed-104729` | `MISMATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-02__seed-130363` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-02__seed-155921` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-02__seed-196613` | `MISMATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-03__seed-104729` | `MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-03__seed-130363` | `MISMATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |
| `DFG-03__seed-155921` | `PARTIAL MATCH` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` | `HUMAN REVIEW REQUIRED` |

### 6.1 Strong, partial, mismatch, and unresolved queues

These are **audition-navigation queues, not rankings**.

| Signal-only queue | Candidates | Interpretation |
|---|---|---|
| `MATCH` (6) | `FND-02__seed-104729`; `FND-02__seed-196613`; `FND-03__seed-130363`; `FND-03__seed-196613`; `DFG-01__seed-130363`; `DFG-03__seed-104729` | estimated tempo and 2–4-section form both resemble prompt numbers; everything perceptual remains open |
| `PARTIAL MATCH` (8) | all four retained `FND-01` candidates; `FND-02__seed-130363`; `FND-03__seed-155921`; `DFG-01__seed-155921`; `DFG-03__seed-155921` | one numerical dimension is adjacent rather than matching; not a quality problem by itself |
| `MISMATCH` (6) | `FND-03__seed-104729`; `DFG-01__seed-104729`; `DFG-01__seed-196613`; `DFG-02__seed-104729`; `DFG-02__seed-196613`; `DFG-03__seed-130363` | tempo or section proxy differs; the estimate or the prompt itself may be less musically useful than the heard result |
| `HUMAN REVIEW REQUIRED` (2) | `DFG-02__seed-130363`; `DFG-02__seed-155921` | tempo autocorrelation was too ambiguous even for the narrow signal comparison |

No group is auditioned first, favored, rejected, or converted to finalists by this document. The blind randomized package controls first-pass order.

## 7. Human review card

For every blind candidate, the Owner should answer in this order:

1. **Broken?** Any crackle, buzz, harsh flat-top sound, strange mouth/vocal sound, abrupt structural break, or obvious generation failure?
2. **Background-safe?** Can the music coexist with management thinking, ambience, UI, PA, and future radio? Does it seize attention or become annoying within one minute?
3. **Era association?** Without trying to be academically perfect, what period does it suggest and why: instruments, rhythm, performance, harmony, production, or cliché?
4. **Hollywood-studio function?** Does it carry playful, flexible film-world character, or does it feel like documentary pastiche, a foreground scene, a generic playlist track, or a trailer?
5. **Historical respect?** Is cultural lineage treated as living music rather than stereotype? For `FND-03`, `DFG-01`, and `DFG-03`, an Owner “keep” remains provisional pending relevant creator/history review.
6. **Originality concern?** Does any melody, riff, vocal fragment, hook, arrangement, or recording gesture sound recognizably borrowed? If yes or uncertain, mark it for rights review; do not identify a reference inside first-pass blind filenames.
7. **Endurance?** Would the Owner still want it after repeated management sessions? The one-minute pass can reject obvious fatigue, but a kept candidate needs a later full-length and repeated-loop review.

`movies_spirit_1_5` means “does this capture the playful, flexible Hollywood-management musical grammar of *The Movies*?” It explicitly does **not** mean “does this sound like a copied Daniel Pemberton cue?”

## 8. Imitation and rights guardrail

This is a calibration study, not a substantial-similarity opinion or legal clearance. No metric in the feature set detects protected musical expression. Prompt-family alignment, historical plausibility, and “Movies spirit” cannot establish copyrightability, exclusivity, non-infringement, commercial clearance, production readiness, or ship clearance.

Reject any future recommendation that asks a composer, model, editor, or mixer to:

- copy or closely paraphrase a melody, bass line, riff, chord sequence, countermelody, or cue architecture;
- rebuild a distinctive *The Movies* arrangement note-for-note;
- recreate an identifiable master recording, sample, voice, performer, production signature, or named-composer style;
- use original *The Movies* audio as guide input; or
- equate a high functional score with permission to imitate.

The U.S. Copyright Office distinguishes a musical composition from its sound recording, and derivative-work protection does not legitimize unauthorized use of preexisting material. Those distinctions reinforce the procurement plan's separate composition/master and provenance gates; they are not formal legal advice. [U.S. Copyright Office copyright exhibit](https://www.copyright.gov/history/copyright-exhibit/artifacts/); [Circular 14](https://www.copyright.gov/circs/circ14.pdf).

## 9. Source register

External sources are listed with the exact claim retained here. “Primary” means official manual, archive, institutional object record, or first-party developer account; it does not imply that the source answers every question about musical history.

| ID | URL | Publisher / archive | Date | Type | Confidence | Claim supported |
|---|---|---|---|---|---|---|
| `SRC-C01` | [The Movies interview](https://www.shacknews.com/article/39083/the-movies-interview) | Shacknews; interview with Lionhead Associate Producer Brynley Gibson | 2005-10-13 | primary developer interview | high for attributed statements | roughly ninety original pieces; player-film music placed on lot and framed with DJs; broad era/cinematic concept |
| `SRC-C02` | [The Movies English manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040) | Activision / Lionhead | 2005 | primary official manual | high | official functional separation and music credits; used as context, not cue-by-cue proof |
| `SRC-C02A` | [The Movies soundtrack catalogue/review](https://www.soundtrack.net/album/the-movies/) | Soundtrack.net / Dan Goldwasser | 2005-12-20 | contemporary professional catalogue/review / secondary | medium-high for titles/timings; medium for criticism | 20-track promotional catalogue and critic-described cinematic idioms; not developer testimony or complete game catalogue |
| `SRC-C03` | [Silent Film Scores and Arrangements](https://www.loc.gov/collections/silent-film-scores-and-arrangements/about-this-collection/) | Library of Congress | collection dates 1908–1927; page undated, accessed 2026-08-31 | primary institutional collection | high | silent-film music includes published scores, cue sheets, and varied functional materials |
| `SRC-C04` | [A Warming Flame](https://www.loc.gov/collections/silent-film-scores-and-arrangements/articles-and-essays/a-warming-flame/) | Library of Congress | undated, accessed 2026-08-31 | institutional historical essay | high | compiled, improvised, and original silent-film accompaniment coexisted; practice was varied |
| `SRC-C05` | [Recorded-sound technology timeline](https://www.loc.gov/programs/national-recording-preservation-plan/tools-and-resources/historical-background/timeline/) | Library of Congress | undated, accessed 2026-08-31 | primary institutional chronology | high | commercial electrical example by 1920; Columbia/Victor scale introduction in 1925; period technology is transitional |
| `SRC-C06` | [Jazz](https://music.si.edu/story/jazz) | Smithsonian Music | undated, accessed 2026-08-31 | institutional historical overview | high at overview level | Black American roots; improvisation, syncopation, blues language, ensemble development; jazz plurality |
| `SRC-C07` | [African American Music](https://music.si.edu/spotlight/african-american-music/default) | Smithsonian Music | undated, accessed 2026-08-31 | institutional collection overview | high at overview level | African American practices are foundational across American music; rejects reduction to one genre costume |
| `SRC-C08` | [E-mu SP-12 drum machine](https://www.si.edu/object/e-mu-sp-12-drum-machine%3Anmah_1316931) | Smithsonian National Museum of American History | object introduced 1986; page undated, accessed 2026-08-31 | primary museum object record | high for object facts | 12-bit sampling drum-machine technology as a relevant pre-1990s production anchor |
| `SRC-C09` | [Five Things to See: The Technology of Hip-Hop](https://nmaahc.si.edu/explore/stories/five-things-see-technology-hip-hop) | Smithsonian NMAAHC | undated, accessed 2026-08-31 | institutional curatorial overview | high at overview level | sampling, sequencing, and drum-machine/workstation tools as creative practices in hip-hop history |
| `SRC-C10` | [Do You Remember House? catalogue record](https://www.si.edu/object/do-you-remember-house-chicagos-queer-color-undergrounds-micah-salkind%3Asiris_sil_1160644) | Smithsonian Libraries and Archives | 2019 work; accessed 2026-08-31 | institutional catalogue / secondary monograph metadata | medium-high | Chicago house emerged through overlapping Black, Latino, and queer social-dance communities; not a generic synth preset |
| `SRC-C11` | [The Underground Is Massive catalogue record](https://www.si.edu/object/underground-massive-how-electronic-dance-music-conquered-america-michaelangelo-matos%3Asiris_sil_1105166) | Smithsonian Libraries and Archives | 2015 work; accessed 2026-08-31 | institutional catalogue / secondary book metadata | medium-high | Black/gay Chicago clubs and Detroit scenes are relevant to U.S. electronic-dance history; its styles are diverse |
| `SRC-C12` | [L.A. Noire soundtrack announcement](https://www.rockstargames.com/es/newswire/article/1748koo9ok58ok/anuncio-del-lanzamiento-de-la-banda-sonora-de-la-noire-official-.html) | Rockstar Games | 2011-07-18 on retained localized page | primary developer/publisher documentation | high | mixture of original score, licensed-era recordings, and newly written period songs; official manual separately documents in-world radio |
| `SRC-C13` | [Myths, Mavericks and the Music of Red Dead Redemption](https://www.gamedeveloper.com/audio/myths-mavericks-and-music-of-i-red-dead-redemption-i-) | Game Developer/Jeriaska interviewing composers Bill Elm and Woody Jackson | 2011-11-04 | primary composer testimony in professional interview | high | restrained interactive score, authored continuity, and long-play transition considerations |
| `SRC-C18` | [Sound Byte: Mafia II](https://www.gamespot.com/articles/sound-byte-mafia-ii-exclusive-soundtrack-download/1100-6283964/) | GameSpot; music-supervisor/developer interview | 2010-11-16 | primary testimony in professional interview | high | original score plus licensed recordings, selection process, chronology looseness |
| `SRC-C19` | [Mafia II PC manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/50130/manuals/MAFIA_II_PC_DOWNLOAD_MANUAL_ENG%5B1%5D.pdf?t=1730176761) | 2K Games / Steam-hosted official manual | 2010 release; document undated | official manual / primary | high | in-world radio controls and station selection |
| `SRC-C20` | [Hip-Hop Comes to the Smithsonian](https://americanhistory.si.edu/press/releases/hip-hop-comes-smithsonian) | Smithsonian NMAH | accessed 2026-08-31 | official museum release / institutional secondary | high | Black and Latino youth context in the Bronx; hip-hop is a culture, not a device preset |
| `SRC-C21` | [The sazón in hip-hop](https://americanhistory.si.edu/explore/stories/sazon-hip-hop) | Smithsonian NMAH | accessed 2026-08-31 | museum scholarship / secondary | high | Puerto Rican/Latino, Jamaican, Caribbean, and Black community exchange |
| `SRC-C22` | [Celebrating Black Music Month](https://nmaahc.si.edu/explore/stories/celebrating-black-music-month) | NMAAHC | accessed 2026-08-31 | museum scholarship / secondary | high | breadth and distinctness of Black musical lineages including R&B and hip-hop |
| `SRC-C14` | [Facing the Music in Fallout 4](https://bethesda.net/en-US/news/facing-the-music-in-fallout-4) | Bethesda Game Studios | 2015, accessed 2026-08-31 | primary developer account | high | multi-day listening and removal of radio material that annoyed or disrupted flow |
| `SRC-C15` | [Mafia II on PS3: Your Questions Answered](https://blog.playstation.com/2010/07/20/mafia-ii-on-ps3-your-questions-answered/) | PlayStation Blog; 2K Czech responses | 2010-07-20 | primary developer Q&A | high | orchestral score separated from period radio/jukebox music; role separation is transferable |
| `SRC-C16` | [Copyright exhibit: musical works and sound recordings](https://www.copyright.gov/history/copyright-exhibit/artifacts/) | U.S. Copyright Office | undated, accessed 2026-08-31 | primary government guidance | high for legal categories | compositions and sound recordings are separate copyrighted works |
| `SRC-C17` | [Circular 14: Copyright in Derivative Works and Compilations](https://www.copyright.gov/circs/circ14.pdf) | U.S. Copyright Office | revised 2020-03 | primary government guidance | high for general doctrine | derivative-work protection covers new material and does not authorize unauthorized use; not project-specific legal advice |

### 9.1 Internal evidence register

| ID | Repository/local source | Date / revision | Type | Confidence | Claim supported |
|---|---|---|---|---|---|
| `INT-C01` | `docs/audio/AI-MUSIC-FOUNDRY-01-PROMPT-REGISTER.md` | commit `c8c80c4739f54ecb990a4518aae58365dc1bc4b0` | primary pilot record | high | exact family intent, prompts, negative prompts, seeds, parameters |
| `INT-C02` | `docs/audio/AI-MUSIC-FOUNDRY-01-REPORT.md` | commit `c8c80c4739f54ecb990a4518aae58365dc1bc4b0` | primary pilot report | high | 24 immutable raw candidates; Screening Gate V2 state and two machine failures |
| `INT-C03` | `features.json` and `features.csv` paths/hashes in §3.1 | 2026-08-31 | primary generated measurement record | high for recorded calculations; limited as §3.3 | 22-candidate descriptive features and prompt-signal labels |
| `INT-C04` | `docs/design/CODEX-ERA-AWARE-MUSIC-AND-STUDIO-RADIO-DIRECTION-01.md` | commit `f803164357ad417cea3162cb2c329890868f2b19` | accepted research synthesis | medium-high, dependent on cited sources | era plurality, original-game reconstruction, management-safe direction, provenance boundaries |

## 10. Stop line

This report authorizes no generation, reroll, finalist selection, production use, Unity import, middleware, code change, P05/P06/P13 change, or commercial-clearance claim. The next valid action is the Owner's blind 22-track audition using the separate reference guide and worksheet. Only after the completed human worksheet may a fresh authorized task determine whether each of the six families retains a passing candidate and create one finalist per family.
