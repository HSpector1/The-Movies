# Authored Soundstage Pipeline Proof — runtime-art provenance

Scope: the two runtime images added by this proof branch.

| | |
|---|---|
| `ui/public/lot/b-stage-b.png` | 10,698 B · `sha256 1af7f85224a36fd9f1d481f556fa5bafd14285d7195f69d99160dee547fdeb7c` |
| `ui/public/lot/b-stage-b-ud.png` | 9,355 B · `sha256 7b2454223e737e0241780a0dfd70e3845915dbc36c681165e5b0323032227187` |

Both are 512 × 374 RGBA PNG-8, quantised against a **shared** palette so the two finishes cannot
differ by a stray alpha pixel. Authored offline in Blender 5.2.0 LTS; the `.blend` source, render
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
