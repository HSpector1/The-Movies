# AI Music Foundry 01 — Prompt Register

**Status:** EXECUTED; SCREENING GATE V2 HUMAN REVIEW PENDING  
**Rights status:** `PROTOTYPE_ONLY`  
**Research authority:** `f803164357ad417cea3162cb2c329890868f2b19`

This register records the exact six authorized prompt families. No artist, composer, song, soundtrack, recording, or franchise name was added. No prompt was rewritten, no negative prompt changed, no seed substituted, and no candidate rerolled.

## 1. Common generation lock

| Field | Exact value |
|---|---|
| Model | `stabilityai/stable-audio-3-small-music` |
| Model revision | `0fef1392cd842149a2b6d445e181c97608faac06` |
| Optimized weights | `stabilityai/stable-audio-3-optimized` |
| Optimized revision | `b5182df73f4aca4336c5c1b642ca6c44d5b085ec` |
| Code commit | `c3909628db1ae2b57bed40a493c73c67ad674dc5` |
| Script | `optimized/mlx/scripts/sa3_mlx.py` |
| DiT / decoder | `sm-music` / `same-s` |
| Duration | 120 seconds |
| Steps | 8 |
| Init noise | 1.0 |
| CFG / APG | 2.0 / 1.0 |
| DiT dtype | fp16 |
| Free models | enabled |
| Seeds | `104729`, `130363`, `155921`, `196613` |
| Generation environment | `HF_HUB_OFFLINE=1` |

## 2. Acoustic/electrical negative prompt

Used verbatim for `FND-01`, `FND-02`, and `FND-03`:

```text
vocals, singing, rap, spoken word, dialogue, lyrics, choir, humming, whistling, artist imitation, recognizable song, famous theme, quotation, copyrighted sample, DJ tag, producer tag, applause, crowd, trailer climax, abrupt ending, clipping, distortion, harsh mastering, excessive compression, long silence, vinyl crackle, shellac hiss, gramophone noise, radio static, slapstick chase, circus music, honky-tonk caricature, saloon piano, nonstop ragtime, cartoon mickey-mousing, minstrel-show coding, blackface-era racial caricature, novelty dialect, exoticism, modern synthesizer, electric guitar, drum machine, sub-bass
```

## 3. `FND-01` — post-1925 electrical dance-jazz

Epoch: `acoustic_electrical_1920_1932`

```text
Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1926–1932 electrically recorded compact dance-jazz for a Hollywood studio workday, rendered as a clean modern master: cornet used sparingly, clarinet and tenor saxophone, trombone, piano, acoustic guitar or banjo pulse, upright bass, brushed snare and woodblock. 104 BPM relaxed 4/4, syncopated ensemble conversation with breathing space, song-form harmony, blue-note color and restrained chromatic passing chords, three low-contrast sections, open ending suitable for a long management loop. No dominant lead melody; leave space for a later studio motif. Era character comes from arrangement and performance, not surface noise. This family is not eligible until a future authorized contract maps sealed P13 global-era truth to post-electrical audio eligibility; it never depends on a player studio’s research/adoption state.
```

Generated candidates: `FND-01__seed-104729`, `FND-01__seed-130363`, `FND-01__seed-155921`, `FND-01__seed-196613`.

## 4. `FND-02` — silent-era photoplay chamber

Epoch: `acoustic_electrical_1920_1932`

```text
Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1920–1927 silent-film photoplay chamber language for a calm studio workday: piano, violin, viola, cello, upright bass, clarinet, flute, muted horn and restrained small percussion. About 82 BPM with flexible 4/4 phrasing, modular eight-bar cue construction, lyrical but unsentimental functional, modal and mild impressionist harmony, transparent acoustic-room perspective and an open ending. No dominant lead melody; leave space for a later studio motif. Avoid talkie fanfare and constant scene-by-scene mickey-mousing.
```

Generated candidates: `FND-02__seed-104729`, `FND-02__seed-130363`, `FND-02__seed-155921`, `FND-02__seed-196613`.

## 5. `FND-03` — Black-led stride and blues small ensemble

Epoch: `acoustic_electrical_1920_1932`

```text
Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1923–1929 Black American stride-and-blues-informed small ensemble treated as living musicianship, not novelty: stride piano with relaxed left-hand motion, cornet, clarinet, acoustic guitar, upright bass, brushes and woodblock. 92 BPM, blues-form and song-form variation, call-and-response, syncopated breaks, blue-note inflection, warm acoustic room, three spacious low-intensity sections and an open ending for long management play. No dominant lead melody; leave space for a later studio motif. This lane requires Black music-history and creator review before any commission.
```

Generated candidates: `FND-03__seed-104729`, `FND-03__seed-130363`, `FND-03__seed-155921`, `FND-03__seed-196613`.

## 6. Sampled/digital negative prompt

Used verbatim for `DFG-01`, `DFG-02`, and `DFG-03`:

```text
vocals, singing, rap, spoken word, dialogue, lyrics, choir, humming, whistling, artist imitation, recognizable song, famous theme, quotation, identifiable or copyrighted sample, DJ tag, producer tag, applause, crowd, trailer climax, abrupt ending, clipping, distortion, harsh mastering, excessive compression, long silence, 2010s festival EDM drop, trap triplet hi-hats, dubstep wobble, cyberpunk cliché, cheesy General MIDI, corporate presentation music, arena-rock solo, overdone gated snare, brickwall loudness, retro parody
```

## 7. `DFG-01` — wholly new sample-shaped hip-hop/R&B

Epoch: `sampled_digital_1987_1999`

```text
Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1991–1996 Black-led hip-hop and R&B studio language using wholly generated original micro-chops and no sourced recording: dry break-shaped kick and snare, relaxed swing, warm electric bass, electric piano, muted clean guitar, short brass-color fragments and soft analog-digital atmosphere. 92 BPM, jazz-and-soul harmonic color, spacious midrange, three low-intensity sections and open-ended management phrasing. No dominant lead melody; leave space for a later studio motif. Do not imitate a performer, producer, song, flow, or recording; this lane requires relevant creator and music-history review before commission.
```

Generated candidates: `DFG-01__seed-104729`, `DFG-01__seed-130363`, `DFG-01__seed-155921`, `DFG-01__seed-196613`.

## 8. `DFG-02` — band-led alternative and early post-rock

Epoch: `sampled_digital_1987_1999`

```text
Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1990–1996 band-led college-alternative and early post-rock studio language: human live drum kit, electric bass, two contrasting electric guitars moving between clean arpeggios, restrained overdrive and textural harmonics, with sparse electric piano. 94 BPM, dynamic ensemble breathing without arena climax, modal and suspended harmony, three evolving low-intensity sections, clear center and open ending for long management play. No dominant lead solo; leave space for a later studio motif. Avoid reducing the decade to grunge costume.
```

Generated candidates: `DFG-02__seed-104729`, `DFG-02__seed-130363`, `DFG-02__seed-155921`, `DFG-02__seed-196613`.

## 9. `DFG-03` — restrained house and techno lineage

Epoch: `sampled_digital_1987_1999`

```text
Instrumental management-game underscore with a curious, industrious, humane and quietly optimistic Project: Studio identity; patient and non-triumphal. Specifically 1992–1998 Chicago-house- and Detroit-techno-derived instrumental studio language treated with restraint: dry original drum-machine timbres, rounded synth bass, electric-piano chord color, modest analog sequence, soft pad and one filtered percussion development. 120 BPM, steady club pulse below peak-hour intensity, syncopated accents, extended harmony, gradual three-section evolution and open-ended management phrasing. No dominant lead melody; leave space for a later studio motif. This Black American lineage requires relevant creator and music-history review before commission.
```

Generated candidates: `DFG-03__seed-104729`, `DFG-03__seed-130363`, `DFG-03__seed-155921`, `DFG-03__seed-196613`.

## 10. Execution attestation

The local `01_prompt-register/prompts.csv`, `01_prompt-register/commands.jsonl`, and `07_logs/generation.jsonl` preserve the resolved prompts and argument arrays. Generation used Python subprocess argument arrays rather than shell interpolation. The recorded environment contains only the safe flag `HF_HUB_OFFLINE=1`; no Hugging Face token or account identity was captured.

Screening Gate V2 did not modify these prompts or execute the generator again.
