# Design-asset provenance — `r3-n1-design/assets/`

Every file in this folder and its subfolders is **authored inside this project**. Nothing here was
downloaded, purchased, generated from a third-party model, traced from Lionhead's *The Movies*, or
copied out of the assistant's container (fonts included — see `R3-N3-VISUAL-STANDARD-SHEET.md` §1:
the game ships **no** font file at all). Licence for everything below: **project-owned**.

## Template — copy this block for each new asset

```
### <relative path>
* Source:      authored from scratch in this repository / derived from <exact in-repo path or commit>
* Author:      <agent or person> under task <TASK-ID>, <date>
* Tool:        <editor / rasteriser and version> — no Editor GUI, no external service
* Licence:     project-owned (no third-party asset, no purchased licence, no downloaded file)
* sha256:      <hash of the committed bytes>
* Rasters:     none / <path> at <N>x via <exact command>
* Notes:       <what it is for, and what it is NOT evidence of>
```

## Entries — R3-N3-DESIGN-04 (icons, authored 2026-09-15)

Common to all six: authored from scratch by the uiux-designer agent under task **R3-N3-DESIGN-04**
on **2026-09-15**; tool = plain-text authoring in this worktree (no drawing application, no external
service, no rasteriser run); licence **project-owned**; **no rasters committed** — a PNG is produced
only when an N3/N5 writer needs one, and that rasterisation gets its own entry naming the exact
`rsvg-convert` version and command, exactly as `Assets/Studio/UI/Resources/StageObjects/PROVENANCE.md`
already does for the stage sprites. Geometry: 24-unit grid, 2-unit stroke, round cap/join,
`stroke="currentColor"` so the consumer supplies a `StudioUiTokens` colour and no colour is baked in.
These are **specifications with drawable geometry**, not shipped game art: nothing in the Unity
project loads them today.

| File | sha256 | Replaces (shipped glyph) | Intended owner |
|---|---|---|---|
| `icons/attention.svg` | `d3dd8368cb40d663554dc617fbc3309b243b2171f64b221efa607a98ba3eb7b7` | `◆` U+25C6 / drawn amber mark | `StudioPeopleRailHud`, `StudioProductionRailHud`, `StudioHud` |
| `icons/waiting.svg` | `f5f1514056e553e0e35586070c6c15d4a25f089c4f7f2ff94fee5446dd9f0c5c` | `❚` U+275A (repurposed pause bar) | `StudioProductionRailHud`, `StudioLaneInspectorHud` |
| `icons/locate.svg` | `162f2a9ad251c3fdeb7fc4e7c91829dc0bd26c23271fd9c509f81c71a62d4fe6` | none — LOCATE is word-only today | `StudioPeopleRailHud`, `StudioProductionRailHud` |
| `icons/more-actions.svg` | `b9c5158c1328c57eabdeb1332ada42b71e9f55eb98677e135543f5b5bd074dd7` | `▸` U+25B8 | `StudioLaneInspectorHud`, `StudioCastingWorkspace`, `StudioHud` |
| `icons/close.svg` | `92063e4746b4ce54bb2006ca41ced361010d939942bde433c7a86a4cabbf2c83` | `✕` U+2715 | `StudioPeopleRailHud`, `StudioProductionRailHud` |
| `icons/confirmed.svg` | `246a0a957780987949d5fa12216ca5c2904c6353fe3714021a1a1b0c0a6ea3ce` | `✓` U+2713 | `StudioIndustryWorkspace`, `StudioFoundingCardHud`, both rails |

## Entries — pre-existing annotated mockups (R3-N1-DESIGN-01 / -02)

Authored in this repository by the same design lineage; hashes recorded here for the first time so a
later integrity check has a baseline. Tool: plain-text SVG authoring. Licence: project-owned.

| File | sha256 | Task |
|---|---|---|
| `01-lane-model-1280-100.svg` | `c657a92db6ab799cc7455abe6be1cd484ee5bab6e80a6628a5db947997557e52` | R3-N1-DESIGN-01 |
| `02-inspector-1440-100.svg` | `bc18e389a6c4077f4d1478ad24fb43bbb11a01e84e765895e848a4ba589fd55b` | R3-N1-DESIGN-01 |
| `03-text-200-1280.svg` | `6ec804dcfa85b0510e2bec674424d3a72a7b1696664192a36fb30b4f858eda82` | R3-N1-DESIGN-01 |
| `04-memo-sheet-1440-150.svg` | `8dd554c45bd22d674f5db75b0e3bdbef0355be00b7887214da4730ccc3504401` | R3-N1-DESIGN-02 |

## Assets referenced by this design but owned elsewhere

* **Stage sprites** — `…-Playability-Interaction Unity/Assets/Studio/UI/Resources/StageObjects/*.png`
  with their own `PROVENANCE.md` (six authored SVGs, `rsvg-convert 2.62.3`, 156 px). Not re-hashed
  here; that file is the authority and was read, not modified, by this task.
* **Fonts** — none committed anywhere in either worktree. The game draws in Unity's bundled
  `LegacyRuntime.ttf`, reached through `Resources.GetBuiltinResource<Font>`. No font file is
  redistributed by this project and none may be added from the assistant's container.
* **Portraits** — none committed. Portraits are rendered live from the in-game rig
  (`StudioApplicantPortraitCamera`); there is no portrait image asset to license or hash.

## Verifying this file

```
shasum -a 256 docs/engineering/playability-launch-review/r3-n1-design/assets/*.svg \
              docs/engineering/playability-launch-review/r3-n1-design/assets/icons/*.svg
```
Any mismatch means the committed bytes changed without a provenance update — treat that as a defect,
not a rounding error.
