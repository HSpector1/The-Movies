# Presentation-Only Assumptions

Assumptions the prototype makes that are **not** guaranteed to be game truth. Each
must be understood at integration so no one mistakes a presentation choice for a
gameplay fact. Commit `8c5a18b`.

> ⚠️ **The central warning:** the lot dims/darkens buildings and stages when a
> `BuildingState.available` flag is `false`. In the fixtures this stands in for
> "not yet open." **Do not treat UI incompleteness as gameplay progression.**
> `available` is a *host presentation policy*, not a simulation state. The host
> must decide, honestly and explicitly, what (if anything) "unavailable" means —
> or set everything `available: true` and let the lot show a uniformly open lot.

| # | Assumption | What it does now | Cosmetic? | May stay host-derived? | Must become real game fact? | Remove at production? |
|---|------------|------------------|-----------|------------------------|-----------------------------|-----------------------|
| 1 | **Fixed Stage A / Stage B slots** | Exactly two soundstages; productions map to `stage-a`/`stage-b` | yes | yes (host assigns) | no | no — but document that >2 productions can't all show |
| 2 | **Deterministic stage assignment** | Host/fixture picks which production is on which stage | yes (presentation policy) | yes | no | no |
| 3 | **Fixed building layout** | 9 buildings at authored grid positions (`layout.ts`) | yes | yes (layout is lot-owned) | no | no |
| 4 | **`standing` → busy lot** | `established`/`prestige` ⇒ more ambient life, vehicles, banners, arrival vignette | yes | yes (host maps standing→band) | no | no |
| 5 | **struggling/established categories** | 4 display bands drive dressing | yes | yes | no (bands are display) | no |
| 6 | **Production-scale dressing** | Active stage gets gear/crew/van/title-board | yes | derived from `active` | no | no |
| 7 | **Release-reaction recency** | Release within ~6 weeks triggers a reaction; tone from `reception` | yes (threshold is lot-owned) | yes | no | no |
| 8 | **Staff-role labels** | "Grip", "Director", "Office Staff", etc. on inspection | yes (lot-authored copy) | yes | no | no — but host may override copy |
| 9 | **Ambient activity descriptions** | "On set", "Between stage and storage", etc. | yes (lot-authored copy) | yes | no | no |
| 10 | **Cosmetic actor routes** | Authored walking paths + dwell points (`vignettes.ts`, `LotScene.buildAgents`) | yes | yes (lot-owned) | no | no |
| 11 | **Vignette scheduling** | Seeded order, cooldowns, one-at-a-time | yes | yes (lot-owned) | no | no |
| 12 | **Studio gate identity** | Gate shows `studioName` uppercased; generic arch | yes | yes | no | no |
| 13 | **Fixed department buildings** | admin/writers/casting/post/theater are always present | yes | yes | no | no — but if the game lacks a department, host can mark it `available:false` |
| 14 | **Buildings dimmed for an unavailable prototype feature** | `available:false` greys a building/stage | **presentation policy** | must be a **deliberate host decision** | **clarify semantics** | **address at integration** (assumption #⚠️ above) |
| 15 | **`week` is an integer** | Top bar shows "Week N" | yes | host maps calendar→week | no | revisit if the game uses dates |
| 16 | **`genre` is a free display string** | Shown verbatim on tags | yes | host maps sim enum→label | no | no |
| 17 | **`progress01` / `weeksRemaining` are presentation arithmetic** | Progress bar + label | yes | host computes from stored fields | no | no |

## Guidance

- Everything except #14 is safely **cosmetic and host-derived** and can remain so.
- #14 (availability dimming) is the one place a viewer could read a *presentation*
  state as *gameplay progression*. At integration, the host must map `available`
  to something true (e.g., "this department is not part of this game/era") or set
  all `available: true`. The lot should never be the source of "you haven't
  unlocked this yet" unless the game genuinely models that.
- None of these assumptions require a new game system. They are display choices the
  host either derives from existing facts or leaves at neutral defaults.
