# Authored Soundstage Pipeline Proof — runtime-art provenance

**Status: PRODUCTION ADOPTED.** Final accepted proof authority
`81497b4229fe42d5362241c129eec33b2ef982c7`; closure in
[`AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-CLOSURE.md`](AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-CLOSURE.md).
The images below are the shipped production assets and are frozen — they were not re-rendered,
re-quantised or re-exported for adoption.

Scope: the two runtime images added by this proof branch.

| | |
|---|---|
| `ui/public/lot/b-stage-b.png` | 10,254 B · `sha256 adf413c8f88fb9aa040bcc5cdbdcdf83451d25ca74b183272b47d8064c2daa35` |
| `ui/public/lot/b-stage-b-ud.png` | 9,032 B · `sha256 3f3dc5544f6cf4cfbe40097fa28c107d66d7739807399015988f67e09bdf4347` |

Both are 512 × 374 RGBA PNG-8, quantised against a **shared** palette so the two finishes cannot
differ by a stray alpha pixel. Release-closure revision: the three roof units, one of the twin header pinstripes and the two
flat wall panels were removed after runtime review found them illegible at the management camera.
Production punch list: the header band now dies into proud entrance piers instead of ending in
mid-wall, and the existing personnel door and canopy were relocated to the shadowed elevation so
that face carries one readable architectural reason rather than reading accidentally blank.
Standards compliance: the header band now runs pier-to-pier so neither end dies in open wall,
and the front-to-shadow face ratio was corrected from 0.949 to 0.869 — inside the governed
0.859-0.876 band — after the governed ratio was found to have been applied as linear
irradiance rather than as the displayed sRGB relationship it actually describes. Both finishes
are inside the band: normal 0.8687, worn 0.8614, against a procedural control at 0.8737/0.8746
and Stage A at 0.8589. Each finish needed its own linear fill value because the worn pass
compresses the encoded gap; both were solved by measuring the shipped PNG.
Authored offline in Blender 5.2.0 LTS; the `.blend` source, render
intermediates and all acquired source archives stay outside this repository.

## What is actually in these files

**Nothing third-party.** Every pixel derives from original geometry authored for this proof, shaded
by a three-sun orientation rig using only the governed palette constants from
`ui/src/lot/scene/palette.ts`. Blender audit of the final source scene:

- image datablocks: **0** (only the internal `Render Result` buffer)
- linked libraries: **0**
- texture nodes: **0**

## CONSIDERED / CLEARED — but NOT incorporated

Three Poly Haven assets were authorised, acquired, hashed and cleared (CC0 1.0; licence page and
each asset page captured in a real browser). **They were never opened into the authoring scene and
contributed nothing to these images.** They are retained outside the repository in case a later,
closer-framing pass wants them.

| Asset | Creator | Disposition |
|---|---|---|
| `modular_pipes` | Kuutti Siitonen | CLEARED · **not incorporated** |
| `modular_airduct_rectangular_01` | James Ray Cock | CLEARED · **not incorporated** |
| `utility_box_01` | James Ray Cock | CLEARED · **not incorporated** |

Reason recorded honestly: at the governed management camera the whole building is ~222 px wide and a
commodity prop occupies 6–20 px, so photoreal donor geometry contributes nothing resolvable there,
and its material noise is the exact whole-frame cohesion failure the art direction forbids.

## NOT ACQUIRED

Three ambientCG materials were authorised but **never downloaded and never used**. The required
browser verification could not be performed: DNS resolved and TCP 443 connected, but the TLS
handshake was closed by the far end (`no peer certificate available`) for every hostname, from both
a plain client and real Chromium, while other sites reached from the same machine at the same moment
returned 200.

## Consequence

The provenance surface of the shipped runtime art is **empty**. No third-party geometry, texture,
HDRI or preview render entered these two PNGs, so no attribution, redistribution or trademark
condition travels with them.
