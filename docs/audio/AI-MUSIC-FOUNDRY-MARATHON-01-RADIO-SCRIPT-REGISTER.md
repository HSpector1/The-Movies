# Project: Studio — AI Music Foundry Marathon 01 Radio Script Register

**Script status:** `PROTOTYPE_ONLY`

**Voiced status:** `SCRATCH_DELIVERY_PROTOTYPE / PROTOTYPE_ONLY`

**Production broadcaster authority:** NONE

## Script bank

The external bank contains exactly 126 original fictional units: 14 per epoch across all nine creative commissioning aliases. Each epoch has three station IDs, three studio-workday links, two fictional Hollywood news items, two fictional industry/technology bulletins, two fictional advertisements, one weather/traffic/city-flavor link, and one sign-off/transition.

All 126 IDs and normalized transcripts are unique. Captions match transcripts verbatim. Every row carries epoch, function, archetype, speaker role, pace target, formality, performance notes, historical interpretation boundary, future-authority substitution rule, and prototype status.

External authority:

`/Users/bruce/Project Studio Audio Foundry Marathon 01/06_radio/script-bank/`

| Artifact | SHA-256 |
|---|---|
| Script CSV | `3b21822d71ad96d80d108a1d227d9bdab01ec580b3d4c7b9d304e1e173f53ca3` |
| Script JSON | `04bf3b0838c19953f12b41dfb1d73a475cbfa34e044b3e4654e44458a2faadd8` |
| Script Markdown | `e72bf280b2b8160ff45b52acde14d697a2e922cb380b7b78cbdbc40d29186d48` |
| Validation JSON | `be31b0cc5e32d9d5ef0d6e2d7add76f96db2e7954e4f33f342af8433f5db7bd0` |

## Broadcaster performance law

Performance notes vary sentence length, syntax, diction, pace, pauses, rhetorical shape, enthusiasm, formality, humor, advertising grammar, news grammar, and station-ID grammar by period. No line asks for a universal fake Transatlantic voice, a living or historical person, a regional/racial caricature, modern podcast syntax under a filter, or constant shouting. Presentation processing is a secondary layer and never substitutes for period-aware writing/performance.

No mechanically important fact is intended to remain audio-only. Every future functional substitution requires a matching caption/transcript.

## Local speech prototypes

The selected route is macOS built-in `/usr/bin/say`, used only because the brief explicitly permits it as a fallback. The OS reports macOS 26.6.2 build 25G83; Apple does not expose independently pin-able voice-model revisions or a redistribution license through this route. Consequently these are scratch delivery tests, not proposed cast voices or redistributable production masters.

Exactly three official third-party routes were screened and none passed every hard gate. OHF Piper's engine is GPL-3.0-or-later, but its official registry makes each voice subject to a separate model card and warns that licenses vary; the bounded review did not establish a generic non-person voice pack with uniform clear provenance. Kokoro-82M is a 363,323,757-byte Apache-2.0 model, but its official English route requires `espeak-ng`, which was absent and could not be installed under the no-system-install rule. Parler-TTS Mini v1.1 is Apache-2.0 and within the size cap, but its official Apple Silicon route calls for a separate unpinned nightly PyTorch install and its checkpoint exposes named training-speaker conditioning. No third-party TTS model or dependency was downloaded.

The exact observed commits/revisions, bytes, hashes, and rejection reasons are recorded in `/Users/bruce/Project Studio Audio Foundry Marathon 01/09_provenance/local-tts-route-gate.json`, SHA-256 `6cc9058e72d3e2a73e7fedc992759a7c6a496ec5147314b4ab7913b00aa22d9d`.

- Anchor periods: E02 early network/1930s; E03 postwar personality/1950s; E06 formatted FM/digital transition/1990s
- Units: 30 total, ten per anchor with the exact required function mix
- Audio: 30 clean and 30 bounded period-presentation WAVs, mono 48 kHz/24-bit
- Generic installed voices: Samantha, Kathy, Ralph
- Personal Voice: excluded
- Voice cloning, real-person target, guide audio, download, network, and cloud TTS: none
- Manifest SHA-256: `3ba286324ec728e0ca7e1339d90537386d31c0b0c346367c7fc7054107af9169`
- Index SHA-256: `dbb78682579e588322eb68b7f04921a10a0f3d2012740647d1cd979a9bc3bb85`
- Validation SHA-256: `d130adc00969a1051690fa5d20458e011f9b45369e2c0c8776ee9fc9662a3cca`

Period versions use distinct bounded bandwidth, compression, and coloration without static, crackle, wow, pitch change, time change, or destroyed intelligibility. Clean speech is preserved. No human listening acceptance has occurred.

## Mixed radio concept reels

Three self-contained `RADIO CONCEPT PROTOTYPE` programs are complete under the authoritative corrected root:

`/Users/bruce/Project Studio Audio Foundry Marathon 01/06_radio/demos-v2/`

| Program | Duration | Master format | Integrated loudness | True peak | Master SHA-256 |
|---|---:|---|---:|---:|---|
| EARLY STUDIO BROADCAST | 304.000 s | stereo 48 kHz/24-bit WAV | -17.4 LUFS | -1.9 dBTP | `05f2ba5152b8d9a73f87f9ffc82c6611eaebec8d9acf7b32c57fa7413f9bedfe` |
| POSTWAR STUDIO BROADCAST | 304.000 s | stereo 48 kHz/24-bit WAV | -17.1 LUFS | -1.9 dBTP | `eb04e5865295fc708121837626a463a55dacbb7120962bf13887d4d61c00c34d` |
| DIGITAL-ERA STUDIO BROADCAST | 304.000 s | stereo 48 kHz/24-bit WAV | -16.9 LUFS | -1.9 dBTP | `891f58e71f57fbf25b8ce6920d83253d67b684dbfdeffaf7f03a425469e85041` |

Each reel contains three provisional music excerpts and eight speech cues: station identity, links, exactly one fictional technology/industry bulletin, exactly one fictional advertisement, transition, and sign-off. Cue sheets contain 11 rows; the eight spoken rows match eight WebVTT captions and transcript entries verbatim. Sidechain-controlled music attenuation under speech measured approximately 20.9–21.8 dB at the median.

The first preserved v1 renders exposed an FFmpeg limiter auto-level behavior that raised true peaks to 0.0 dBTP. No source was deleted or rewritten. The v2 pipeline disables that gain compensation, renders into a separate root, and validates all three corrected masters at -1.9 dBTP. Only `demos-v2` is designated for Owner audition packaging.

The reel index SHA-256 is `1eecd37e297cd6046f2e058a48b6825f08cea076034ba25a55d663d05fe9c725`. Music, script, clean-voice, period-voice, captions, transcript, cue, mix-command, and output hashes remain beside each reel.
