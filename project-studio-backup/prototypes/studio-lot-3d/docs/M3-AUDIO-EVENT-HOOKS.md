# M3 Audio-Event Hooks (readiness only)

M3 builds **no audio system** (out of scope; no music licensing / sound library
authorized). This documents the clean presentation events a future audio layer would
consume, and where each naturally fires. The visual scene must — and does — pass the
recognition tests with **no audio**. Event names are declared in
`src/env/audioEvents.ts` (`AudioEvent` + a no-op `emitAudioEvent`).

| Event | Natural fire point (deterministic) |
|---|---|
| `gate-ambience` | overview / near the gate (ambient loop) |
| `studio-ambience` | scene ready (`ready` intent) — a warm lot bed |
| `vehicle-arrival` | vignette `arrival` phase — van keyframe begins moving to the apron |
| `stage-door-move` | `doorOpen(t)` transitions (open at t≈8.5, close at t≈17) |
| `crew-gather` | vignette `gather` phase (t≈6–9) |
| `slate` | slate clap at the flash (t≈12) |
| `recording-start` | `recording` becomes true (t≈11) / red light lit |
| `performance` | vignette `take` phase (t≈12–16) |
| `wrap` | vignette `wrap` phase (t≈16+) |
| `selection` | `building-selected` / `character-selected` intents |
| `camera-transition-complete` | camera rig reaches a preset (lerp settled) |

## Design notes
- All fire points are **deterministic** (vignette phase = pure function of `t`; intents
  are user/harness driven) — no `Math.random`, so an audio layer stays replayable.
- Events are **presentation-only**; they carry no simulation truth. The audio layer
  would subscribe, exactly as a renderer does — it never mutates state.
- Reinforcement, not explanation: audio may deepen the fantasy, but the world already
  reads as a working studio without it (Gate-C recognition test is audio-off).
- Deferred: actual sound assets, mixing, spatialization, volume/ducking, an audio
  settings UI, and accessibility audio cues.
