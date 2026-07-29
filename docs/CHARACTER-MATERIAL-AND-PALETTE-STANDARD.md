# Character Material & Palette Standard (Asset Lab 05C)

## Slots (per character, uniquely named per instance)
skin · shirt · trousers · leather(boots/belt) · dark(features+accessory, fixed) · white(eye/paper/
reflective) · hat · hi-vis · hair (9 slots; a role uses 7–9). `char_materials(cfg, tag)` names every
material with the per-character `tag` so a lineup never shares/overwrites a material.

## Contrast rules (05C)
- **Skin vs clothes:** garment values chosen distinct from skin; the review render exposure is
  −0.55 on a **neutral mid-grey studio** (05B's warm bright sky washed skin↔clothes together).
- **Hair:** light/grey hair is auto-darkened (`sum > 1.2 → ×0.68`) so it reads on pale skin (Office
  was reading bald). Brows use the hair colour; facial features use a **fixed dark** so grey-haired
  roles keep dark brows/mouth.
- **Hi-vis:** safety orange vest + **silver reflective bands** (white slot).
- **Palettes:** 5 outfit palettes (blue/tan/green/maroon/teal); colours accept a PALETTE key or an
  RGB tuple; skin tone is per-instance and **independent of role**.

## Review presentation (fixes overexposure)
`render.neutral_world` (flat mid-grey) + `render.backdrop` (neutral studio wall behind, +Y) +
key `sun` + `fill` + `rim` (silhouette separation) + a neutral floor + AgX exposure −0.55.
Replaces the warm golden-hour sky that overexposed the crew. Applied to `build_base_char.py` and
`build_roles.py`. The Scene-G **runtime** uses the app's own lighting (unchanged; SwiftShader
capture is diagnostic — the owner's real-GPU pass is the acceptance).

## Material-count note (perf)
9 slots exceeds the "3–5 where practical" guidance; several are tiny (eye-white, reflective, hi-vis,
features). A texture-atlas merge to ~4 is documented as a future option (see performance doc) but
NOT done here — 05C prioritised visual correctness over slot count, per the brief.

## Evidence
`proof/lab05c/final/` (neutral-lit lineups, skin/palette sheets) vs `proof/lab05c/baseline/` (05B).
