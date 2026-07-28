# M3 Asset Inventory (tiers)

Every M3 asset by tier (per the prompt's asset-tier strategy). Hero effort goes to
Tier 1; background dressing does not.

## Tier 1 — Hero (original / substantially custom) — define studio identity
Code-authored in the **MeridianEnvironmentKit** (`src/env/kit.tsx`); no external
models. These are the identity landmarks and get the most design/review attention.

| Asset | Module | Identity cue |
|---|---|---|
| Meridian gate + "MERIDIAN PICTURES" lettering | `GateBuilding` | arrival + name |
| Meridian crest (brass M on red shield) | `MeridianCrest` | recurring mark (gate, admin, water tower, van) |
| Deco administration + stepped crown + fins | `AdminBuilding` | prestige anchor |
| Buff barrel-vault soundstage + STAGE sign + elephant door | `Soundstage` | the dominant studio silhouette |
| Water tower + crest | `WaterTower` | tallest landmark |
| Hero backlot street façades + rear bracing | `Backlot` | backlot identity |
| Screening theater + marquee + blade sign | `Theater` | premiere cue |
| Recurring Deco trim (fins, cornices, string courses) | kit primitives | cohesion |

All original, code-authored — no provenance concerns, no external files.

## Tier 2 — Gameplay (repeatedly visible, in the vignette)
| Asset | Source | Customization |
|---|---|---|
| Crew characters (director, actors, grip, office, driver, photographer, apron crew) | Kenney Blocky Characters (CC0), normalized ~0.67→1.8 m | per-role wardrobe tint + hats + carried props + clip/stance |
| Production van | code-authored box (`Van`) | Meridian red body + cream cab + crest panel |
| Talent trailer | code-authored (`Trailer`) | Meridian cream + red stripe |
| Film camera on tripod + reel | code-authored (`FilmCamera`) | dark equipment |
| Gear (cases, light stand, cones) | code-authored (`Gear`) | dark equipment / red cones |
| Slate | code-authored (vignette actor prop) | — |
| Stage doors (open/closed leaves) | code-authored (`StageFx`) | routing-coupled portal |
| Route/door markers | authored waypoints (`layout.ts` / `director.ts`) | — |

## Character-quality classification (Gate-C owner ruling, 2026-07-26)

The owner's real-hardware review found the current Kenney characters read "somewhat
like Roblox." Production decision recorded:

- **Accepted PROVISIONALLY** for **background crew, drivers, and distant/supporting
  roles** in this slice.
- **NOT approved** as the final quality target for **hero actors, directors, stars,
  pitch meetings, or close cinematic presentation.**
- **Hero-character asset selection + pipeline validation remain future work** (out of
  scope here; not this defect pass — the family was explicitly not to be replaced now).
- The current characters are **not** production-ready hero talent.

## Tier 3 — Supporting (style-normalized)
| Asset | Source |
|---|---|
| Trees / sage foliage | code-authored flat-shaded cones (sage palette) |
| Hedges | code-authored boxes (sage) |
| Fountain (admin plaza) | code-authored |

(The Kenney vehicle/prop/tree GLBs from M2 remain available under `public/m2-assets/`
for future dressing, but the M3 hero composition uses code-authored dressing for a
single coherent palette.)

## Tier 4 — Temporary
None inside the hero composition. The M2 survey page (`m2.html`) and the scale-
reference (`m3-scale.html`) are separate validation harnesses, not part of the slice.

## Provenance
- Tier 1 / 3 and the van/trailer/camera/gear: 100% original code-authored geometry —
  no external assets, no provenance risk.
- Tier 2 characters: Kenney Blocky Characters, **CC0** — recorded in `PROVENANCE.md`.
- No assets from *The Movies* / other games; concept renders are reference-only.
