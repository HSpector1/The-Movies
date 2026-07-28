# M3 Material Library

One shared, cached material set for the whole slice (`src/env/materials.ts`) — no
material-per-object-in-a-loop. Colours are the **locked Meridian palette**
(`01-ART-DIRECTION.md`); prefer importing from here over inlining a palette hex. The
`MeridianEnvironmentKit`, ground, selection ring, and the per-character carried props
all draw from the cache. A few **single-instance** equipment pieces (gear cluster,
film camera, van, trailer, production rig) use local dark-equipment materials inline —
one instance each, not looped — which is acceptable; the anti-pattern the cache
prevents is per-instance allocation across the ~14 crew (their tint + props are
handled via clones/cache with disposal).

## Why shared
Every kit building + ground + prop draws from the same `mat(color, opts)` cache
(keyed by colour+finish), so the scene resolves to a small set of
`MeshStandardMaterial`s. Fewer GPU programs, lower material churn, and a single place
to retune the palette. `disposeMaterials()` frees them on teardown.

## Palette (from `MERIDIAN`)
| Role | Hex |
|---|---|
| cream stucco / shadow | `#efe3c6` / `#c9b78e` |
| taupe Deco / brass / brass-dark | `#cdbb9a` / `#caa25a` / `#a9863f` |
| buff soundstage / shadow | `#dcc9a0` / `#b09f72` |
| terracotta roof | `#b56a4a` |
| signature red | `#b8484a` |
| sage lawn / edge | `#93a86c` / `#74894f` |
| decomposed-granite path / plaza | `#dac9a6` / `#e4d7bc` |
| warm asphalt / markings | `#6f6a63` / `#e9dcbf` |
| warm lit window / spill | `#f6e4a6` |
| glass / wood / metal | `#93a7ad` / `#8a6a44` / `#8f8a82` |
| dark interior (stage) | `#3a3226` (faint warm emissive) |

## Named roles (`M.*`)
`stucco, stuccoShadow, taupe, brass, brassDark, buff, buffShadow, terracotta, slate,
red, glass, litWindow, wood, metal, asphalt, path, plaza, lawn, darkInterior` — thin
wrappers over `mat()` for legible call sites.

## Finish conventions
- Stucco/roof/ground: `roughness ~0.9–1`, `metalness 0` (matte, painterly).
- Brass: `roughness 0.45`, `metalness 0.5` (the only semi-metallic accent).
- Lit window / stage interior: emissive for warm spill (no post-processing bloom —
  kept cheap and gameplay-legible).
- Flat-shaded foliage (trees) for a stylized low-poly read.

## Lighting it's tuned for
Golden-hour **directional key from the upper-left** (`SceneApp` `Lights`), warm; a cool
hemisphere fill; soft ambient. Contact/cast shadows from a single 2048² shadow map.
No harsh photoreal specular; matte finishes keep the stylized register.

## Selection cue
Selection/hover uses a ground **ring** (its own transient material), NOT emissive on
the shared building materials (which would highlight every building sharing a
material). brass = hover, signature red = selected.
