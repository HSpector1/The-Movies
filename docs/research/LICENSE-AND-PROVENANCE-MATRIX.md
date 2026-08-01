# License and Provenance Matrix

*Read only research deliverable, 2026-08-01. Part of the Project Studio open source art and presentation audit. No production repository, code, or asset was modified to produce it. Full context and rulings are in ART-PRESENTATION-INTEGRATION-BLUEPRINT.md.*


Legal and provenance report for the isometric management sim reference audit (audit spec section 8 and section L). Scope: eleven external repositories studied as readability and architecture references for Project Studio Gate D1 (the Phaser studio lot over `StudioLotSnapshot`). This document is the authority on what may and may not cross into the Project Studio tree. Where the raw per repo findings and the adversarial verification verdicts disagree, the verification verdicts win, and those corrections are folded in below.

Reuse verdict vocabulary:

- STUDY_ONLY: read the behavior, reimplement nothing from the source text, copy no asset.
- CLEAN_ROOM: a specific pattern may be rebuilt in Project Studio's own TypeScript/Phaser stack from the described behavior only, never by porting source.
- ADAPT_PERMISSIVE: license permits lifting code, subject to the practical fit test in section 3.
- PROTOTYPE_ONLY: usable only in a throwaway spike, never shipped.
- REJECT: do not engage for reuse at all.

## The matrix

| Repository | Code license | Art license | Audio license | Requires retail/commercial assets? | Distributable open assets | Attribution | Share-alike | Reuse verdict | Risk |
|---|---|---|---|---|---|---|---|---|---|
| OpenRCT2 | GPL-3.0-or-later (file is `licence.txt`, British spelling) | Retail RCT2 `g1.dat`/`csg` proprietary (Chris Sawyer/Atari), not in tree; OpenRCT2 own `resources/g2/*.png` UI + selection/construction sprites are GPL-3.0 | Retail audio required; open replacement in separate OpenMusic repo | Yes (retail RCT2 files, readme line 74) | `resources/g2/*.png` (GPL-3.0), compiled to `g2.dat` at build | Yes | Yes | STUDY_ONLY (construction-ghost pattern CLEAN_ROOM) | MEDIUM |
| FreeSO | MPL-2.0 (verbatim `LICENSE.md`) | Mixed/proprietary by dependency: EA TSO art not bundled; `FSO.Content.TSO/Content` community content (450 `.iff`, 271 `.piff`, 531 avatar files) under repo MPL, self-declared provenance | Proprietary by dependency (0 bundled audio) | Yes (user-supplied EA TSO files) | None useful to Project Studio | Yes | Yes (MPL file-level) | STUDY_ONLY (slot/routing, containment, cutaway CLEAN_ROOM) | HIGH |
| CorsixTH | MIT (verbatim `LICENSE.txt`) | Two tier: homemade `CorsixTH/Bitmap/` bmps + `lose.pl8`/`winlevel.pl8` are MIT; all game graphics proprietary Theme Hospital, not in tree | MIT audio code, no bundled sound; retail TH audio required | Yes (retail Theme Hospital) | `CorsixTH/Bitmap/` MIT debug/UI art | Yes | No | STUDY_ONLY (mood-priority + build-validity CLEAN_ROOM) | MEDIUM |
| unknown-horizons | GPL-2.0-or-later | CC-BY-SA-3.0 Unported (own audiovisual); a few CC-BY-3.0 / Public Domain items | CC-BY-SA-3.0 / CC-BY-3.0 / Public Domain, all open | No | Own `content/gfx`, `content/audio` (CC-BY-SA, share-alike) | Yes | Yes | STUDY_ONLY | MEDIUM |
| OpenTTD + OpenGFX | GPL-2.0-only (both) | OpenGFX = GPL-2.0-only (not CC0); retail TTD art manifest-declared and user-supplied; OpenTTD own `openttd.grf` + fonts GPL-2.0 | Separate OpenSFX/OpenMSX (not inspected); retail audio user-supplied | Retail TTD required OR replaced by OpenGFX | OpenGFX full base set (GPL-2.0, copyleft) | Yes | Yes | STUDY_ONLY (recolour-remap branding CLEAN_ROOM) | MEDIUM |
| Augustus | AGPL-3.0-only (verbatim `LICENSE.txt`) | `res/assets/` 4217 PNGs CC-BY-SA-3.0; core tileset/walker sprites proprietary Caesar III, not in tree | Proprietary Caesar III audio, not bundled | Yes (retail Caesar III, patched 1.0.1.0) | `res/assets/` CC-BY-SA (share-alike) | Yes | Yes | STUDY_ONLY (overlay + building-state readability CLEAN_ROOM) | HIGH |
| IsoCity | MIT (verbatim, 2019 Victor Ribeiro) | One Kenney/OpenGameArt spritesheet, likely CC0 but no embedded license proof | N/A (no audio) | No | The one spritesheet (license unconfirmed in repo) | Yes | No | STUDY_ONLY (state-owning-renderer pattern REJECT) | LOW |
| GDQuest godot-2d-builder | MIT (verbatim, 2020 GDQuest) | Own SVG art under repo MIT; `BagnardSans.otf` SIL OFL 1.1 | None in repo | No | Own SVG art (MIT), font (OFL 1.1) | Yes | No | STUDY_ONLY (placement-ghost pattern CLEAN_ROOM) | LOW |
| IndustryIdle | GPL-3.0-only (`package.json` "ISC" is unpopulated boilerplate, not authoritative) | Proprietary/non-redistributable retail art (263 PNG), README-flagged do-not-redistribute | Proprietary/non-redistributable (10 mp3) | Bundles commercial retail assets (do-not-use) | None | N/A | Yes (code) | STUDY_ONLY (flow-viz + supply-chain overlay CLEAN_ROOM) | HIGH |
| Egregoria | Predominantly GPL-3.0 (root `LICENSE`); `egui-inspect` and `egui-inspect-derive` crates are MIT OR Apache-2.0 | No separate art license; ~142 LFS binaries GPL-3.0 by default; fonts third-party upstream | GPL-3.0 by default (`.ogg` not byte-inspected) | No | None cleanly reusable | Yes | Yes | STUDY_ONLY (determinism-hash helper CLEAN_ROOM) | HIGH |
| Citybound | AGPL-3.0 (verbatim `LICENSE.txt`) | No repo art license; `assets/icons` are third-party Icons8 (own terms, likely attribution); `Inter-UI` fonts SIL OFL | None in repo | No | Inter-UI fonts (OFL); Icons8 not repo-relicensable | Yes | Yes | STUDY_ONLY | HIGH |

Two verdict-driven caveats fold into the risk column above. FreeSO's HIGH risk is not only the EA dependency: it bundles a prebuilt `Mario.dll` plus `Mario.pdb` with no source or license in tree, and `SM64Component.cs`/`SM64DataContainer.cs` load a Super Mario 64 ROM at runtime with libsm64-derived comments. That optional component is a confirmed Nintendo-IP red flag and is a reason to keep FreeSO strictly at reading distance. IndustryIdle and Augustus are HIGH because they physically commit non-redistributable content (IndustryIdle's own retail art and audio; Augustus's copyleft `res/assets`), and Egregoria/Citybound are HIGH on copyleft consequence (GPL-3.0 and AGPL-3.0 respectively).

## 1. The governing rule: an open engine does not legalize the assets it loads

Every large reference here restates the same lesson, and it is the load-bearing principle for Project Studio's provenance discipline: a permissive or copyleft ENGINE license says nothing about the ART and AUDIO that engine consumes. The two are separate grants, and in these games the assets are almost always the non-free half.

The cautionary examples, all confirmed in the tree:

- OpenRCT2 ships zero retail pixels. `readme.md` line 74 states outright that OpenRCT2 requires original RollerCoaster Tycoon 2 files to play, and the tree contains no `g1.dat`/`csg` blob (the only tracked `.dat` is a test fixture). The GPL engine does not make `g1.dat` redistributable; it is simply absent.
- FreeSO's `README.md` states it depends on the original game files and "does not contain any copyrighted material in and of itself." The MPL code cannot run without user-supplied EA The Sims Online data.
- CorsixTH's `Bitmap/readme.txt` says it plainly: "Almost all graphics resources are loaded from the original Theme Hospital data files, which is why there are only a few files in this directory." The MIT engine is inert without retail EA/Bullfrog assets.
- Augustus's `README.md` requires the original Caesar III assets (graphics and sounds) patched to 1.0.1.0; the core sprites are not in the AGPL repo.
- OpenTTD encodes the rule structurally rather than only documenting it: `media/baseset/orig_win.obg` is a manifest that names retail files (`TRG1R.GRF` and siblings) by MD5 with an `[origin]` note pointing the user at their own Transport Tycoon Deluxe CD-ROM. The retail art is declared and checksummed but never shipped.

The clean-room counterexamples prove art can be a replaceable contract, but with a sharp qualifier that "open" is not the same as "free to reuse in a closed product":

- OpenGFX is a complete, independently authored base graphics set that replaces the retail TTD art and runs against the same GPL engine. It is genuinely open and redistributable, and it is GPL-2.0-only copyleft, not CC0. Folding OpenGFX pixels into a product imposes GPL on that product's art bundle.
- unknown-horizons ships fully original team-authored art and audio, sourced from OpenGameArt/Freesound/Musopen and each attributed by name and URL in `doc/LICENSE`. It is the clean opposite of the retail-reuse hazard, and it is CC-BY-SA-3.0 share-alike, so it carries its own copyleft-style obligation.
- Augustus's own `res/assets` (4217 PNGs) are CC-BY-SA-3.0: real open art, still share-alike.

Bottom line for Project Studio: the D1 lot deliberately runs on procedurally drawn placeholders in `ui/src/lot/scene/assets.ts` with no external image imports. That is the safest possible posture and it should hold through the D1-A Studio Identity Package. Any authored art that later replaces those placeholders must arrive with its own embedded license evidence, independent of whatever engine it was seen in.

## 2. DO NOT list

None of the following may enter the Project Studio tree, in any repo, regardless of how the engine around it is licensed. This is a hard list.

- Do not copy any sprite, tile, or texture from any of these repos. That includes OpenRCT2 `g1.dat`/`csg`, any EA TSO `.iff`/`.piff`/avatar file from FreeSO, any Theme Hospital sprite, any Caesar III sprite, and IndustryIdle's 263 retail PNGs (README-flagged do-not-redistribute).
- Do not copy retail-game assets even when the surrounding engine is MIT or GPL. The engine license is not the asset license (section 1).
- Do not clone building designs, silhouettes, or facade layouts closely enough to be recognizable as a specific game's building. Project Studio authors its own parametric building composers in `layout.ts`/`assets.ts` (admin, writers=Development, casting, stage-a, stage-b, post, theater, gate, expansion); those stay original.
- Do not lift animation frames or clip data. FreeSO's `.anim`/BCF/APR formats, CorsixTH's `.ani`, and Egregoria's GLB clips are all off limits. Project Studio's crew motion is derived deterministically from `sceneSeed`, not from imported frames.
- Do not reuse character designs or avatar meshes. FreeSO's Vitaboy outfits/appearances and Egregoria's `pedestrian.glb` are references for the shared-skeleton concept only; the Asset Lab authors its own characters (05H CC0-derived base, with license evidence).
- Do not import UI art, icon sets, cursors, or HUD chrome. This specifically includes Citybound's `assets/icons` (third-party Icons8, not the project's to relicense) and Augustus's cursor PNGs (CC-BY-SA).
- Do not copy sounds or music. All bundled audio here is either proprietary by dependency (FreeSO, CorsixTH, Augustus, OpenTTD retail) or copyleft (unknown-horizons CC-BY-SA, Egregoria GPL), and IndustryIdle's 10 mp3 are explicitly non-redistributable.
- Do not reuse logos, wordmarks, or brand marks. Project Studio's gate lettering and title easels are scene-drawn overlay slots (`assets.ts` notes Graphics cannot draw text); they must carry Project Studio's own identity, never a borrowed one.
- Do not treat screenshots or promo images as usable assets. Egregoria's `.jpg` screenshots and any marketing image fall under the repo's copyleft by default.
- Do not import the Kenney spritesheet from IsoCity on the assumption it is CC0. It is attributed but carries no embedded license proof in the repo, so under the Asset Lab rule it is LICENSE-UNCLEAR until the OpenGameArt CC0 page is independently confirmed. Project Studio does not need it (placeholders are procedural).
- Do not vendor the FreeSO `Mario.dll`/SM64 component or anything derived from libsm64. Nintendo-IP red flag.

## 3. ADAPT_PERMISSIVE_CODE: which repos qualify, and why clean-room still wins

Four of the eleven repos carry a license that legally permits lifting source into a non-copyleft product:

- CorsixTH: MIT (Lua game logic + C++ engine).
- IsoCity: MIT (vanilla ES6).
- GDQuest godot-2d-builder: MIT (GDScript for Godot 3.x).
- Egregoria's `egui-inspect` and `egui-inspect-derive` crates only: MIT OR Apache-2.0 (Rust). The rest of Egregoria is GPL-3.0 and is off the table.

FreeSO's MPL-2.0 is weak, file-level copyleft: technically it permits use if modified MPL files keep their source open, but that entangles any adapted file in MPL obligations, so it does not belong on the clean-adopt list for a closed product.

The benefit of ADAPT_PERMISSIVE over CLEAN_ROOM is normally that you save the reimplementation cost by copying working code. That benefit does not materialize here, for two concrete reasons tied to Project Studio's actual stack:

1. Wrong engine and language in every case. Project Studio's lot is TypeScript over Phaser 3.90 with the `iso.ts` direct 2:1 transform. CorsixTH is Lua/C++/SDL, IsoCity is Canvas 2D vanilla JS, GDQuest is GDScript/Godot, Egregoria is Rust/wgpu. There is no file you can drop in; every "adaptation" is a full rewrite anyway, at which point it is a clean-room reimplementation from behavior, which is also the safer provenance posture.
2. Project Studio already exceeds the transferable code. `iso.ts` (`gridToScreen`/`screenToGrid`, `depthFor(gx,gy,layerBias)=(gx+gy)*16+layerBias`, the `LAYER` table) is strictly more capable than IsoCity's implicit row-major sort and its renderer-owned mutable map (IsoCity's state-owning renderer is in fact the REJECT anti-pattern the D1 contract forbids). The `studioLotSnapshot` selector plus one-way immutable snapshot is a stricter boundary than even Egregoria's full-`&Simulation`-borrow renderer.

Recommendation: treat all four permissive repos as STUDY_ONLY in practice. Where a specific behavior is worth rebuilding, do it CLEAN_ROOM in Project Studio's own code, from the described behavior only, and cite the pattern (not the source) in design notes. The concrete CLEAN_ROOM candidates surfaced by the audit, each tied to real Project Studio surfaces:

- Mood/status priority resolution (CorsixTH, MIT): collapse several simultaneously-true building conditions into ONE `AttentionState` in the `studioLotSnapshot` selector, with a priority ladder where D2-only states such as `decision-required` outrank D1 states so the reservation is mechanical. Reinforces the contract rule that every attention state pairs colour with icon/shape/text, never colour alone.
- Per-cell build-validity overlay and confirm-gating (CorsixTH MIT, also OpenRCT2 GPL by study only): the reference for a FUTURE expansion/construction slice, rendered from display facts on the snapshot over a dedicated overlay `LAYER`, with the semantic React "build" control disabled unless the snapshot says valid. Construction is a section 11 non-goal today, so this is future-reference only.
- Cursor-follow placement ghost with tri-state validity (GDQuest MIT, OpenRCT2/Augustus by study): same future construction slice; reimplement the validity from snapshot fields, replace GDQuest's colour-only white/red tint (which violates the never-colour-alone rule) with a colour + icon + label chip, and mutate nothing (`navigation.ts` guarantees no lot action changes GameState).
- Recolour-by-palette-remap branding (OpenTTD/OpenGFX, GPL, STUDY only for source but the technique is CLEAN_ROOM): one placeholder art set, many studio liveries, deterministic from `studioName`/`standing`, no per-studio art duplication. Derive Project Studio's own ramps; copy none of OpenGFX's GPL ramp values.
- Determinism hash + a/b-diff test helper (Egregoria, from the GPL source so reimplement from behavior only): a small TypeScript helper that snapshots two GameStates, hashes each subsystem, and on mismatch writes `a`/`b` JSON to diff. Directly serves the M0A byte-identity work and the SaveFileV4 round-trip invariant.

## 4. Alignment with the Asset Lab Provenance Register

The Asset Lab charter's provenance classes (CC0, ATTRIBUTION-REQUIRED, PROTOTYPE-ONLY, LICENSE-UNCLEAR, DO-NOT-USE) map cleanly onto this corpus, and the corpus in turn validates the governing Lab rule that "a free download is not a known production license." Placement of each repo's assets:

- DO-NOT-USE: every retail dependency (OpenRCT2 `g1.dat`, FreeSO's EA TSO data and the SM64/`Mario.dll` component, CorsixTH's Theme Hospital art, Augustus's core Caesar III sprites, IndustryIdle's README-flagged retail art and audio). Same class as the Lab's existing DO-NOT-USE Lionhead "The Movies" mod material.
- ATTRIBUTION-REQUIRED and share-alike: unknown-horizons own art/audio (CC-BY-SA-3.0), Augustus `res/assets` (CC-BY-SA-3.0), OpenGFX (GPL-2.0 copyleft), GDQuest's `BagnardSans.otf` and Citybound's Inter-UI fonts (SIL OFL 1.1). Real open art, but the share-alike or attribution obligation makes it a poor fit for Project Studio's closed original/CC0 convention. Reference, do not import.
- LICENSE-UNCLEAR: IsoCity's Kenney spritesheet (attributed, no embedded proof), Citybound's Icons8 icons (third-party, not repo-relicensable, no in-tree license file), Egregoria's LFS binaries and third-party fonts (no separate art license; GPL-3.0 by default is itself a reason not to touch them). Default to UNCLEAR until embedded evidence proves otherwise, exactly as the Lab does.
- The Lab convention is stricter than the best "open" example here, and should stay that way. OpenGFX is the worked example: famous, free, popular, and still GPL copyleft. Project Studio's rule (original or CC0 only, per-asset evidence in `licenses/`, a `studio_base` provenance prop naming any CC0 source, as done for the 05H authored base) is safer than adopting any of these copyleft or unclear sets. The governance action is to make the Register explicitly classify GPL/AGPL/CC-BY-SA art as NON-adoptable and distinct from CC0, using OpenGFX as the named case so a future contributor cannot mistake "famous free art set" for "reusable in a non-GPL product."

Net posture for the whole corpus: read all eleven for readability and architecture, reimplement only the authorized patterns clean-room in Project Studio's own TypeScript/Phaser stack, and import zero code and zero assets. Nothing in these repos is a reason to touch the `iso.ts` renderer or to loosen the `StudioLotSnapshot` boundary; several are positive confirmation that Project Studio's existing separation is correct, and IsoCity's renderer-owned state is explicit confirmation of the boundary D1 already draws.
