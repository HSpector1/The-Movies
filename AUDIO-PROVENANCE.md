# AUDIO PROVENANCE

Every audio file committed under `ui/public/audio/` has exactly one row below, and every
row names a file that exists. This is a gate, not a courtesy: the asset-provenance test
fails the build if the disk and this document ever disagree (PF1 charter §5-M1 and §7).

**Asset policy (PF1-M1, binding).** Committed runtime audio is compressed (`.m4a` /
`.mp3` / `.ogg`), lives under `ui/public/audio/`, and is loaded by a `BASE_URL`-templated
URL. It is project-owned, properly licensed, CC0/public-domain, or generated-for-project —
nothing else may be committed. Budgets: **≤ 1.5 MB per file, ≤ 15 MB per campaign.**

**What is here now.** Every file below was synthesized from arithmetic by
`scripts/audio/generate_pf1_audio.py` (python stdlib `wave` + `math`, one fixed literal
seed, no sample library, no download, no third-party audio) and converted to AAC with
macOS `afconvert`. Re-running that script reproduces these files. They carry no licence
obligation beyond this repository.

**Replaceability.** All of it is **development audio, marked replaceable**: it exists so
the studio is a place rather than an instrument panel, and so the audio architecture ships
against real assets. When authored masters arrive they land in the private
`project-studio-art-source` repo (the §5A pipeline standard, extended to audio) and replace
these files by filename — the token table in `ui/src/audio/tokens.ts` and the era registry
in `ui/src/audio/registry.ts` are the only places a filename is written, so no call site
moves.

**Current total: 975,085 bytes (0.93 MB) across 14 files** — 6% of the 15 MB campaign
budget, largest file 0.39 MB.

| File | Duration | Channels | Bytes | Source | License | Replaceable |
| --- | --- | --- | --- | --- | --- | --- |
| `ambience-lot-1948.m4a` | 30.00 s | 2 | 408,298 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `ambience-construction.m4a` | 24.00 s | 2 | 93,863 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `music-1948.m4a` | 32.00 s | 2 | 370,793 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-select.m4a` | 0.33 s | 1 | 4,836 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-commit.m4a` | 1.25 s | 1 | 7,995 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-cancel.m4a` | 0.90 s | 1 | 6,999 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-refusal.m4a` | 0.90 s | 1 | 6,013 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-construction-started.m4a` | 1.50 s | 1 | 8,280 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-completion.m4a` | 2.00 s | 1 | 9,974 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-positive.m4a` | 1.20 s | 1 | 7,504 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-warning.m4a` | 1.50 s | 1 | 7,920 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-sting-release.m4a` | 3.00 s | 1 | 14,130 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-sting-greenlight.m4a` | 3.00 s | 1 | 14,381 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |
| `cue-sting-completion.m4a` | 3.10 s | 1 | 14,099 | Generated for Project: Studio by scripts/audio/generate_pf1_audio.py | project-owned (generated) | yes (development audio) |

## What each file is for

- **`ambience-lot-1948.m4a`** — the lot at rest: a low wind bed and a few distant birds,
  seamlessly looped. Deliberately sparse (the calm-morning law: a quiet studio is allowed
  to sound quiet). Runs while the Lot is mounted and visible.
- **`ambience-construction.m4a`** — sparse distant hammering, layered over the bed **only
  while something is actually being built** on the property. It is keyed to authoritative
  placement status, never to a timer.
- **`music-1948.m4a`** — a restrained period-flavoured bed, slow mallet/piano-ish harmony
  at roughly 60 BPM. Selected through the era registry, so C4's decade march swaps music by
  data rather than by code.
- **`cue-*.m4a`** — the eight interaction/outcome families and the three reserved stings.
  M1 ships the whole vocabulary and wires only two of them (`select`, `cancel`); the cue
  grammar in M2 decides which authoritative receipt earns which family.

## Regenerating

```
python3 scripts/audio/generate_pf1_audio.py
```

Requires macOS `afconvert`. The script prints the duration, channel count, byte size and
peak/RMS level of every file it writes — the figures in the table above are that output.
