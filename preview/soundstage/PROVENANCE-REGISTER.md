# Provenance Register (contract §4)

Classification of every pack into one of: **CC0 · ATTRIBUTION-REQUIRED · PROTOTYPE-ONLY ·
LICENSE-UNCLEAR · DO-NOT-USE**. Governing principle (§4): *a free download is not a known
production license.* Classification is driven by **evidence embedded in the archive** (the
license/readme files), not by branding or assumption. When embedded evidence is absent, the
pack is **LICENSE-UNCLEAR** by default, never assumed permissive.

This register also honours the program's standing rule (Master Roadmap): *do not copy
original protected production assets, and do not treat downloaded packs as final Project:
Studio identity art.*

---

## 1. Downtown City MegaKit → **CC0**

- **Evidence:** `License_Standard.txt` (in-archive), verbatim: *"License: CC0 1.0 Universal
  (CC0 1.0) Public Domain Dedication … Models by @Quaternius."* Confirmed identical CC0 text
  in the pack readme.
- **Author:** Quaternius (quaternius.com). This is explicitly the **free subset** ("only
  contains a portion of the models").
- **Rights:** public-domain dedication. No attribution legally required (attribution retained
  here as good practice).
- **Verdict:** **CC0 — reusable.** Safe for prototyping and, on its own license terms, for
  shipping. Program-level caveat: reusable ≠ adopt-as-identity-art. These are generic
  city-kit assets; the approved Meridian art direction is a stylised 1940s–50s Hollywood
  studio. Treat as evaluation / scaffolding, not final look.

## 2. Universal Animation Library → **CC0**

- **Evidence:** in-archive `License.txt` + `README.txt`, verbatim CC0 1.0, *"Models by
  @Quaternius."* README documents the two variants (`_RM` = baked root motion).
- **Author:** Quaternius.
- **Verdict:** **CC0 — reusable.** The 43-clip humanoid library is genuinely useful as a
  crew/background-animation source (the same spirit as the 3D spike's CC0 Kenney crew).
  Not an identity-art commitment.

## 3. FBX interior props → **LICENSE-UNCLEAR**

- **Evidence:** **none.** The archive (`FBX-20260727T232629Z-1-001.zip`) contains only
  `.fbx` files under `FBX/`. No `LICENSE`, no `README`, no author, no attribution. The
  filename is a generic bulk-export/Drive-download pattern (`…-20260727T232629Z-1-001`).
- **Reasoning:** the props visually resemble a coherent commercial/free furniture kit, but
  visual resemblance is **not** license evidence. Per §4 we do not infer a permissive
  license from "it looks like a free pack."
- **Verdict:** **LICENSE-UNCLEAR → prototype-only.** Usable for internal prototyping and
  these proofs. **Must not ship** or be treated as cleared until provenance is confirmed
  (original source + license located). Visibly tagged LICENSE-UNCLEAR in the viewer (Scene B)
  and in `manifests/runtime-assets.json` (`reuse: "prototype-only"`).

## 4. wintersets → **DO-NOT-USE**

- **Evidence:** `zapinfo/zapreadme/wintersetsreadme.txt` — a German mod readme,
  *"Zapsters-Wintersets — modded by Zapster,"* with install instructions targeting
  `C:\Programme\Lionhead Studios Ltd\The Movies` and the explicit restriction
  *"Verbreitung im Internet nur in Absprache mit Zapster, Mods & More"* (redistribution on
  the internet only by arrangement with the author).
- **Two independent blockers:**
  1. **Derivative of protected IP.** The content is built for and on Lionhead's *The Movies*
     (2005) engine: proprietary `.msh` meshes, `.dds` set textures, `.cam` camera files. This
     is exactly the "original protected production assets" the program forbids copying.
  2. **Restricted redistribution** by the mod author.
- **Verdict:** **DO-NOT-USE.** Never loaded at runtime, never converted for reuse, not placed
  in `public/assets/`. Retained **only** for format archaeology (`docs/WINTERSETS-ARCHAEOLOGY.md`)
  — understanding how the original game structured a "set," which usefully informs the
  proposed `SetPackage` schema without using any of its bytes.

---

## Summary

| Pack | Class | Runtime use | Ship? |
|---|---|---|---|
| Downtown City MegaKit | **CC0** | Scene A (reusable) | Yes on license; not as identity art |
| Universal Animation Library | **CC0** | Scene C (reusable) | Yes on license; crew/background use |
| FBX interior props | **LICENSE-UNCLEAR** | Scene B (prototype-only) | **No** until provenance confirmed |
| wintersets | **DO-NOT-USE** | none (archaeology only) | **No** |

No pack was classified **ATTRIBUTION-REQUIRED** (the two CC0 packs waive it) or a bare
**PROTOTYPE-ONLY** distinct from LICENSE-UNCLEAR; the FBX props are the prototype-only case,
gated behind the license-unclear finding.
