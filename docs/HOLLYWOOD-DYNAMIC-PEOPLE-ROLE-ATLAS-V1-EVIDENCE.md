# Hollywood Dynamic People Role Atlas V1 Evidence

Status: **COMPLETE — KEEP GATE PASSED**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

## Evidence authority

| Purpose | Commit |
| --- | --- |
| Frozen V1 contract | `b01edc2` |
| Camera source-direction normalization ruling | `0ee129c` |
| Deterministic source and runtime assets | `471c8ef` |
| Runtime integration and final hardening | `66f856c72f2be033768cc435e556563681679d7e` |

The governing economic status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

This evidence covers presentation assets, their deterministic local transformation, and the
Engine/save/economy-neutral runtime bridge. It does not certify or change the economy.

## Asset result

The retained runtime atlas is one `384×1152` RGBA PNG containing nine rows and four directions:

```text
columns: south, east, north, west
rows:    director, talent, grip, stagehand, electrician, camera, security, publicity, extra
frames:  36 at 96×128
```

Exact retained output:

- SHA-256: `2790bf72909f0a8b76d2f6d2ca387f68499776ef7db44d847ed03ff28979712b`;
- encoded atlas: 287,917 bytes;
- decoded atlas: 1,769,472 bytes; and
- total decoded district, atlas, procedural fallback, and vehicle textures: 11,096,896 bytes,
  1,486,016 bytes below the 12 MiB V1 ceiling.

The committed source manifest records every selected source path, source hash, exact crop,
registration rule, final prompt, built-in generation/edit result ID, rights basis, and transformation.
The source pixels were copied into `art/hollywood/people/source/`; they, not an image model, are the
replay authority. Image generation is never invoked by export, build, test, or runtime. No network
or model dependency ships in the game.

The Camera source alone applies the governed `mirrorSourceForEast` normalization before West is
derived from canonical East. Every West output is then the exact horizontal pixel mirror of East.
South, East, and North are pairwise distinct for every role.

## Deterministic export proof

At asset checkpoint `471c8ef`, tree
`36d3140c70e1b03805cdc5767371813971fa3a24`, a separate clean checkout rebuilt the committed PNG
and JSON byte-identically in three replays. At final runtime candidate `66f856c`, the verifier ran
three further independent clean temporary outputs after the full-RGBA repair. Every output matched
the committed runtime files and the other replays byte for byte.

```text
roles=9
directions=4
frames=36
atlas_sha256=2790bf72909f0a8b76d2f6d2ca387f68499776ef7db44d847ed03ff28979712b
encoded_bytes=287917
decoded_atlas_bytes=1769472
decoded_total_bytes=11096896
byte_identical_replays=3
python=3.14.6
pillow=12.3.0
zlib=1.2.12
pillow_zlib=1.3.1.zlib-ng
```

The final verifier compares full RGBA bounds with `alpha_only=False`. That detail matters: Pillow's
default RGBA `getbbox()` behavior can examine alpha alone and would fail open when two opaque views
have different RGB pixels but identical alpha.

## Runtime result

- The scene validates the atlas geometry and manifest before activation. Activation is all-or-
  nothing; absent or malformed assets retain every procedural role fallback.
- One pure mapping owns role and direction frame selection for managed and ambient people.
- A zero movement vector keeps its fallback direction; the larger axis wins; ties resolve
  vertically.
- The exact director route remains `N → E → E → E → N`, then settles South at the destination.
- The routed actor still crosses the existing depth bands and occluders. Route completion changes
  no task and advances no simulation.
- Reduced motion keeps ambient people South and stationary, pauses the vehicle, and resolves the
  cosmetic route without changing authoritative state or controls.
- Atlas and fallback modes retain the same display-object and dynamic-actor counts.
- The decoded-memory readout now includes district, role atlas, generated fallbacks, and vehicle.
- Frame telemetry uses Phaser's raw loop delta after a 120-frame warm-up and a rolling 240-sample
  window. It reports average FPS, 1%-low FPS, p99 frame, worst frame, update time, worst update,
  renderer draws, objects, actors, decoded memory, and encoded atlas bytes.

One runtime namespace collision was repaired before acceptance: the decorative camera-dolly
occluder no longer shares `hollywood-camera` with the procedural Camera-person fallback. The
occluder is now `hollywood-camera-dolly-occluder`; the fallback remains the real generated `54×74`
person texture.

One input-order defect was also repaired. Invisible building and parcel zones now sit below named
people, so a pointer click on a visible person and the semantic DOM control both select the same
stable person ID.

## Visual and interaction acceptance

The complete lot was inspected at 1280×720, 1366×768, 1440×900, and 1920×1080, including maximum
camera zoom, 125%-equivalent scaling, labels hidden, grayscale, reduced motion, active production,
selected person, invalid-atlas fallback, and missing-asset fallback. A separate high-contrast
diagnostic inspected two live 1280×720 whole-lot captures at fit and the existing maximum zoom
after a deterministic 2.5× contrast transform. Text, borders, actions, Stage 7 state, and the role
silhouettes remained readable. This was a contrast-boosted image inspection, not an operating-
system forced-colors emulation claim.

The Keep gate passed:

- roles are grounded, unclipped, period-readable, and integrated with the authored district;
- Director, Talent, Camera, Electrical, Publicity, and Security remain distinguishable without
  labels or hue alone;
- Grip, Stagehand, and Extra remain separate silhouettes within one coherent crew family;
- no retained sprite contains a watermark, caption, badge lettering, logo, modern object, chroma
  halo, or forbidden 05H/05I material; and
- independent Art, asset/provenance, runtime/determinism, and contract audits all ended with no
  unresolved P1–P3 finding.

The Security source originally contained badge lettering. It was rejected and edited before
packing; the retained source has plain uniform fabric and no readable mark.

## Live authoritative-path proof

A deterministic active-production fixture exposed *The Iron Fever*, director Gloria Calloway
(`t-dir-09`), and talent Douglas Whitlock (`t-act-12`). A real pointer click and the DOM companion
both selected `t-dir-09`.

The real production command moved the Engine task from `unassigned` to `blocked`. The director then
followed the cosmetic route, settled South at the Stage 7 endpoint, and left the Engine task
blocked. The animation did not clear scenery, schedule a take, tick time, or mutate GameState.

The same path passed with an intercepted invalid atlas manifest: procedural people remained visible,
selectable, and routable. Publicity through the real keyboard path persisted the exact $1.2M
Whisper spend, +0.8 awareness result, and cooldown. Return-to-lot and full reload recovered the same
named people and active atlas with no console error.

Visual-only selection, zoom, pan, reduced-motion, and return navigation left the complete
222,479-byte SaveFileV11 and RNG state byte-identical.

## Raw performance evidence

Every row used the active-production fixture, a fresh 120-frame warm-up, and 240 raw unsmoothed
samples. Each row reported 33 display objects, 15 dynamic actors, 10.6 MB decoded textures, a
281 KB encoded atlas, one renderer draw, and an empty console/request-failure set.

| Viewport / scale | Average FPS | 1%-low FPS | p99 frame | Worst frame | Average update | Worst update |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1280×720 | 120 | 100 | 10.0 ms | 10.1 ms | 0.02 ms | 0.1 ms |
| 1366×768 | 120 | 100 | 10.0 ms | 10.1 ms | 0.02 ms | — |
| 1440×900 | 120 | 99 | 10.1 ms | 10.2 ms | 0.01 ms | 0.2 ms |
| 1920×1080 | 120 | 108 | 9.3 ms | 9.3 ms | 0.02 ms | 0.1 ms |
| 125% (1093×614 CSS / 1366×768 physical) | 120 | 98 | 10.2 ms | 10.4 ms | 0.02 ms | — |

The 1920×1080 sample clears the ≥50 FPS target and ≥30 FPS hard floor. Earlier callback-smoothed
measurements are historical diagnostics and are not cited as the final p99/worst-frame evidence.

## Automated verification

| Gate | Result |
| --- | --- |
| Focused Role Atlas/runtime corpus | **PASS — 37/37 tests** |
| Full repository suite | **PASS — 157/157 files, 1,876/1,876 tests** |
| Governed D-16/D-17 harness | **PASS — 10/10 files, 176/176 tests** |
| Root and UI TypeScript | **PASS** |
| Production build | **PASS — 132 modules transformed** |
| Three byte-identical exporter replays | **PASS** |
| `git diff --check` | **PASS** |

The production build retains the pre-existing large-chunk advisory. It is not a Role Atlas defect.

## Review findings closed before acceptance

1. Security badge lettering contradicted the no-text source rule.
2. The Camera procedural fallback shared a texture key with the camera-dolly occluder.
3. Invisible building hotspots could intercept pointer selection of named people.
4. Phaser callback delta made worst-frame telemetry look smoother than the raw loop.
5. The RGBA verifier's default bounds check could compare alpha while ignoring RGB differences.
6. Exact role-change and complete multi-segment route behavior lacked direct regression proof.

All six were corrected and reverified. No unresolved P1–P3 remains.

## Acceptance boundary

**2D Hollywood role-atlas presentation accepted; 05H/05I character production and integration
remain rejected/unauthorized.**

V1 does not add individual appearance variants, gait/action animation, close-camera hero characters,
relationships, needs, simulation autonomy, authoritative positions, 3D people, a rig, or a general
character-production pipeline. Those remain separate future work requiring their own evidence.
