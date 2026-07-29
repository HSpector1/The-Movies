# Character Role Variants (Asset Lab 05B)

A role is a **data row**, never a new model. `character2.ROLES[role]` is a dict of costume/palette
flags; `build_character2(role, arm, overrides=, tag=)` reads it. Adding a role = adding a row.

## Role read = silhouette + costume + palette + accessory (never a tiny label)

| Role | Headwear | Torso | Legs | Accessory | Reads as |
|------|----------|-------|------|-----------|----------|
| **Production Assistant** | bare (hair) | tan shirt | brown trousers | **clipboard** on chest | runner/junior |
| **Grip / Electric crew** (Grip) | flat cap | blue work shirt | grey trousers | tool belt + **radio** | set crew |
| **Grip / Electric crew** (Electric) | **amber hard hat** | **hi-vis orange vest** over shirt | brown trousers | tool belt + radio | rigging/electrical |
| **Maintenance** | soft cap | **slate coveralls** (top=bottom) | slate coveralls | tool belt + radio | mechanic |
| **Office / Administration** | bare (grey hair) | **charcoal long coat** | grey trousers | **clipboard** | admin |

The four required production roles (PA, Grip/Electric, Maintenance, Office) each read distinctly
**without labels**. Maintenance is deliberately coveralls + soft cap (NOT hi-vis/hard-hat) so it
never collapses into the Electric silhouette — a fix applied after the iteration-3 visual review
flagged Electric ≈ Maintenance. Extra legacy roles (CameraDP, Director, Carpenter) are kept only
because they pass the same bar.

## Appearance variation (deterministic, skin NOT tied to job)

Per-instance variation is passed via `overrides` (merged onto the role row), so the same role can
be re-skinned/re-coloured deterministically at spawn:

- **Skin tones (≥5):** light → deep, `overrides={"skin": (r,g,b)}`. Assigned independently of role
  (proof: `skintones-front.png` — 5 tones all on the identical PA outfit).
- **Outfit palettes (≥5):** blue / tan / green / maroon / teal, `overrides={"shirt":…, "trousers":…}`
  (proof: `palettes-front.png` — 5 palettes on one Grip silhouette).
- **Hair (≥3 silhouettes / 4 colours):** brown / dark / grey / (tuple), plus bare vs. capped vs.
  hard-hatted head shapes (proof: `headwear-front.png`).
- **Headwear:** `hardhat` · `softcap` · `flatcap` · `fedora` — all weighted 100% to `Head` (follow
  head translation+rotation), verified attached through the deep-kneel stress pose.

Colours accept either a `config.PALETTE` key or a literal RGB tuple (`character2._col`). Skin tone
is chosen per-instance by the caller (e.g. a hash of a stable crew id) — never derived from role.

## Materials (per-character, uniquely named)

9 slots: skin · shirt · trousers · leather(boots/belt) · dark(features+accessory, fixed) ·
white(eye/paper) · hat · hi-vis · hair. `char_materials(cfg, tag)` names every material with the
per-character `tag` so a lineup of characters never shares/overwrites a material. Unused slots
(e.g. hi-vis on non-vest roles) carry no faces → no extra glTF primitive/draw call. Facial
features use a fixed dark material (slot 4) so grey-haired roles keep dark brows/mouth.
(Slot count exceeds the "≤4 where practical" guidance for role clarity; several slots are tiny and
could be texture-atlas-merged later — noted in the performance doc.)

## Accessories

`clip` (clipboard, weighted torso), `vest` (hi-vis, weighted spine), `belt` (+pouch), `radio`
(snug front-belt box, weighted pelvis — the antenna was removed after it read as a floating stick
in deep crouches), headwear (weighted Head). All accessories are part of the single skinned mesh,
so they deform with the body and cannot detach.
