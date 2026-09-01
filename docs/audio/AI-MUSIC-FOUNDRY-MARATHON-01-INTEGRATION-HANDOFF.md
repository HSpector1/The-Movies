# Project: Studio — AI Music Foundry Marathon 01 Integration Handoff

**Handoff status:** PREPARED, NOT EXECUTED

**Asset status:** `PROTOTYPE_READY_FOR_OWNER_AUDITION`
**Runtime authority:** NONE

## Boundary

This handoff describes a later, separately authorized Unity audition import. It does not create or modify Unity assets, `.meta` files, scenes, prefabs, AudioMixers, bridge DTOs, schemas, runtime IDs, campaign code, saves, or the Owner profile. The nine epoch names are creative commissioning aliases and are not P13 runtime IDs.

Owner listening and an explicit rights/integration ruling are prerequisites to any import. Machine screening cannot establish audible quality, historical authenticity, cultural acceptance, non-infringement, exclusivity, copyrightability, or production suitability.

## Provisional catalogue

The source-bound machine-readable catalogue is external:

`/Users/bruce/Project Studio Audio Foundry Marathon 01/11_return-package/MusicCatalogue.provisional.json`

- Schema: `project-studio-music-catalogue/v1`
- Catalogue entries: 54
- Primary provisional picks: 27
- Alternates: 27
- Epochs: 9
- Stable IDs: 54 unique
- Referenced artifact paths/hashes validated: 540
- Catalogue SHA-256: `59567f65df2e3cbda3b71f5ce9b845d37c2b12134e95eac11f53cb0774fb7407`
- Validation SHA-256: `b7bdbbf0c256bd418cb4f4e77cdfb0af9580bb41fb6142b68619137f6e3183e7`

Each record includes a stable provisional track ID, candidate/source ID, epoch alias, family ID, seed, shortlist role, source/master hashes, prompt and model provenance, BPM estimate, sample rate, duration, loop points, loudness, eligibility flags, prototype status, and suggested import settings.

## Suggested audition-import profile

These values are suggestions only and were not applied:

| Setting | Suggested value |
|---|---|
| Source | 48 kHz / 24-bit loop audition WAV |
| Load type | Streaming |
| Compression | Vorbis |
| Quality | 0.70 |
| Sample-rate setting | Preserve sample rate |
| Force mono | False |
| Normalize | False |
| Preload audio data | False |
| Load in background | True |
| AudioSource loop | True |
| Ambisonic | False |

Primary loop masters are 114 seconds at 48 kHz/24-bit stereo. Their provisional loop contract is start frame `0`, end frame exclusive `5,472,000`, with a six-second equal-power (`qsin`) construction already baked into the audition derivative. The 120-second normalized masters and 12-second seam auditions remain beside each primary for comparison.

## Proposed later integration sequence

1. The Owner listens blind in the offline audition application and exports feedback.
2. Human review confirms music quality, fatigue tolerance, period feel, Project: Studio fit, and culturally situated commissioning decisions.
3. Rights review determines the permitted use and required attribution for any candidate moving beyond prototype evaluation.
4. A P13-authorized integration owner maps approved creative aliases to actual runtime IDs and chooses the import directory.
5. Copy only the explicitly authorized masters into that directory; allow Unity to create new `.meta` files in the authorized worktree.
6. Apply or revise the suggested import profile, verify loop behavior in an isolated audition surface, and measure mixer headroom.
7. Keep machine scores, raw candidates, radio concepts, and provisional labels outside gameplay authority unless separately authorized.

## Runtime behavior still requiring design authority

- Exact mapping from the nine creative aliases to P13 runtime epochs
- Activity, normal, blocked, workspace-ducking, and silence-state rules
- Shuffle-bag state persistence and save compatibility
- AudioMixer group and ducking parameters
- Whether loop derivatives or newly commissioned human-edited masters become runtime sources
- Motif policy; no generated motif sketch is selected or authorized for systematic use
- Localization/caption binding for any future functional radio line

The deterministic four-hour simulations under `/Users/bruce/Project Studio Audio Foundry Marathon 01/08_endurance/` are implementation probes only. They do not authorize these runtime decisions or prove human fatigue tolerance.

## Required verification after any later import

- Imported source hash matches the Owner-authorized catalogue row.
- Unity import metadata matches the authorized profile.
- No rejected source or unreviewed alternate is referenced.
- Loop seam, loudness transition, pause/silence behavior, and state changes are listened to in context.
- 2×/4× simulation does not pitch-shift or time-stretch music.
- Captions remain available for every mechanically meaningful radio line.
- Existing P05/P06/P13 behavior and save data remain unchanged unless separately scoped.

## Marathon execution record

Unity was not launched. No Unity project file or production source was modified. Integration was prepared as metadata and documentation only.
