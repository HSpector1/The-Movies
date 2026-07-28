# Asset Lab 02 — Integration Recommendation (contract §11)

**This document recommends; it integrates nothing.** No Scene-D code, material, or asset has
been merged, copied, or referenced into the main game, either spike, or any contract. Acting on
anything below is a separate, owner-authorized decision. Gate D and OC-01 remain closed.

The single most important finding: **the Lab 01 → Lab 02 jump was presentation and composition,
not asset quality or geometry.** That is good news — the levers are cheap and reusable.

## 1. Reusable pipeline improvements (durable, low-risk)

- **The vertex-color import fix** (`vertexColors=false` for engine-mask `COLOR_0`) — a real,
  general intake fix any glTF consumer should adopt (see `MATERIAL-CORRECTION.md`).
- **Canvas-texture signage** (`makeSignTexture`) — offline, readable studio identity / stage
  numbers / banners with zero external assets. Reusable technique.
- **GPU vs SwiftShader detection** in the capture tool — makes every performance figure honest.
- **The Lab 01 pipeline was unchanged** — Lab 02 consumed its output, confirming the pipeline is
  a stable, reusable foundation.

## 2. Reusable CC0 assets (license-clean)

- **Quaternius CC0 crew + 43-clip animation library** — genuinely useful as background/crew life
  (walk/talk/sit/carry/repair/wait already mapped). Reusable now.
- **Quaternius CC0 Downtown props** (bollards, planters, and the broader kit) — usable as
  greybox dressing.
- Reuse note: these are **scaffolding**, not the shipped look. The approved direction is a
  stylized 1940s–50s Hollywood studio; a generic CC0 city kit is evaluation material.

## 3. Temporary greybox geometry (throwaway target, NOT production art)

- The bespoke `Soundstage`, `ProductionOffice`, `EntranceGate`, `GuardBooth`, `WaterTower`,
  `BacklotFacade`, dressing, and landscaping in `src/components/greybox.tsx` are **greybox
  placeholders** that establish proportion, composition, and identity. They are **not** final
  architecture and must not be treated as such. Their value is the *layout and silhouette
  language*, not the meshes.

## 4. Proposed visual principles (recommendations)

1. **Studio vocabulary over generic buildings** — gate + water tower + soundstage + office +
   courtyard + backlot, with clear separation and a strong entrance.
2. **Warm golden-hour light + sky + fog**, never a black void.
3. **A small, deliberate material family** beats raw pack materials.
4. **Readable signage** for instant identity and legibility from the management camera.
5. **Visible, low-cost life** (background crew) to make the lot feel inhabited.
6. **Silhouette first** — the studio must read with geometry stripped to greybox (proven by the
   wireframe/characters-off toggles).

## 5. Features that will require bespoke production art (not attempted here)

Final soundstage/office/backlot architecture, interiors, a real set system, hero characters,
facial animation, detailed props, and a shippable skybox. All are §12 non-goals and remain
future bespoke-art work.

## 6. Must NOT enter the main game yet

Everything in this lab. Specifically: no greybox geometry, no Scene-D materials/lighting, no
`window.__lab`/viewer code, and no CC0 asset path may cross into `The Movies` or either spike.
Any presentation adoption remains gated on Gate D's entry conditions (owner-named clean
Phase-5.2 base, sim track paused, lot promoted with its own contract) and an explicit owner
decision. This milestone produces a **visual target and a set of reusable techniques**, nothing
more.

## Recommended next step

If the owner passes the look: a **short art-direction pass** that takes these *principles*
(vocabulary, light, materials, signage, life) and applies them to **one** bespoke-art facility
(e.g. a single hero soundstage) to test the style at production fidelity — still isolated, still
pre-Gate-D. If the owner does not pass: capture the specific "still generic/dated" notes and
iterate the greybox target only.
