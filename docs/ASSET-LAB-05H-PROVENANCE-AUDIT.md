# Asset Lab 05H — Provenance & License Audit

**Verdict: PASS.** One verified CC0 asset; source, license, hash, and date preserved.
Machine-readable record: `licenses/asset-lab-05h/PROVENANCE.json`. License text:
`licenses/asset-lab-05h/CC0-1.0.txt`.

## Asset
- **Bundle:** Human Base Meshes Bundle v1.0.0 — **Blender Studio (Blender Foundation)**
- **Object used:** `GEO-body_male_stylized` (stylized male body; neutral geometry only)
- **Source:** https://archive.org/details/human-base-meshes-bundle-v1.0.0 (mirror of the
  blender.org demo-files bundle) · **Downloaded:** 2026-07-31

## License — CC0 1.0 Universal (public domain)
Verified three independent ways (not assumed from the option text):
1. **Embedded in the .blend:** 10 asset datablocks carry `asset_data.license == "CC0"`
   (read headlessly from the bundle).
2. **Archive metadata:** the archive.org item is licensed `creativecommons.org/publicdomain/zero/1.0`.
3. **Publisher:** Blender Studio distributes the bundle under CC0 on blender.org.

CC0 grants: commercial use ✓, modification ✓, redistribution incl. committing the modified
result to this public GitHub repo ✓, no attribution required ✓, no account required ✓. No
marketplace / editorial / personal-use / non-commercial terms apply.

## Hashes
- Source zip sha256 `46a912c0524072ac3b78c35d5d2471df7b8df102394a050ca8cd7184e3393648`
  (35 MB; preserved under gitignored `sources/asset-lab-05h/`, hash recorded here).
- Extracted mesh sha256 `04c12fe3e6f62b8b41ade08d2a99609d05244f2acae21e0c52cbcc4db03cda03`
  (`licenses/asset-lab-05h/human_base_male_stylized_cc0.glb`, committed).

## Imported vs rejected
- **Imported:** the body geometry only (welded to a 12,502-vertex all-quad cage).
- **Rejected / NOT imported:** any rig, animation, texture, hair, clothing; all photoreal
  `realistic_*` meshes; separate head/hand/foot/eye/skull meshes.

## Prohibited-source check
Not MakeHuman / MetaHuman / Mixamo; not a ripped game asset; no real-person likeness; nothing
account-bound or non-commercial. **Safe to commit and back up.**
