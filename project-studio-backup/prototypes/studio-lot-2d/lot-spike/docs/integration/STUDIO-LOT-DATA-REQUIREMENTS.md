# Required & Optional Data Matrix

Three contract levels the host can target, at commit `8c5a18b`. Each row notes
whether the lot **degrades safely** when the data is absent, and the fallback it
uses. All fallbacks avoid inventing fake gameplay data.

## Level A — Minimum viable mount

Enough to render a usable, honest, but quiet lot.

| Data | Source field | If absent | Degrades safely? |
|------|--------------|-----------|------------------|
| Studio name | `studioName` | blank gate/top bar | yes |
| Week | `week` | shows `0` | yes |
| Standing band | `standing` | treat as `struggling` (quiet lot) | yes |
| Cash band | `cashBand` | neutral label | yes |
| Building list | `buildings` | all `available: true` | yes |
| Scene seed | `sceneSeed` | any stable string; cosmetics still deterministic per value | yes |
| Empty productions | `activeProductions: []` | both stages idle, no production vignettes | yes |
| Empty releases | `releasedFilms: []` | empty marquee, no reaction vignette | yes |

At Level A you get: the composed lot, buildings, roads, landscaping, camera,
building hover/select/action, ambient roles walking. No active stages, no vignettes
driven by productions, no marquee.

## Level B — Full current visual experience

Everything the pass-1→3 prototype demonstrates.

| Feature | Required data | Fallback when missing | Degrades safely? |
|---------|---------------|-----------------------|------------------|
| Lit/working stages | `activeProductions[].{stageId,active}` | stage shows idle (open, ready) | yes |
| Production tags (title/genre/progress/weeks) | `ProductionCard` fields | tag hidden for that stage | yes |
| Struggling vs established dressing | `standing` (`established`/`prestige` ⇒ busy) | struggling look | yes |
| Building availability dimming | `buildings[].available` | building shown available | yes |
| Closed/dark stage | stage `buildings[].available === false` | stage shown open | yes |
| Released-film marquee | `releasedFilms` | theater panel shows nothing | yes |
| production-arrival vignette | busy studio + an active stage | vignette simply never becomes eligible | yes |
| stage-preparation vignette | an active stage | not eligible | yes |
| filming-beat vignette | an active stage | not eligible | yes |
| studio-reaction vignette | a release with `weeksAgo ≤ ~6` (+ `reception` for tone) | not eligible | yes |
| Character inspection | none beyond the above (roles derive from actors) | always available when zoomed in | yes |
| Ambient density / vehicles | `standing` busy flag | fewer workers, no vehicles | yes |

**Key property:** every Level B feature is *additive*. Absence never errors — the
feature just doesn't appear. This is what makes the lot safe to mount before the
host can supply rich data.

## Level C — Optional future enrichment (NOT required for approval)

Presentation-only ideas that could improve the lot later. **Documented as future
options, not requested; none is a simulation feature.**

| Idea | Would need | Fallback today |
|------|-----------|----------------|
| Per-building "under construction" look | a presentation state distinct from `available:false` | reuse dimming |
| More than two soundstages | a host stage-slot model + more visual slots | fixed A/B (see assumptions) |
| Era / period visual skin | a host-supplied era band | single classic-Hollywood era |
| Named marquee title on the theater | pass a "now showing" title | generic marquee |
| Richer reaction tone (e.g., critical vs commercial) | a finer tone hint | current 3 tones |
| Genre-flavored stage dressing | a genre hint per production (already have `genre` string) | uniform dressing |

## Recommended fallback strategy (global)

Preferred, in order: **use a stable neutral presentation** → **hide the feature**
→ **omit the information**. The lot already follows this: unknown building ⇒
available; empty arrays ⇒ feature absent; missing optional flags ⇒ plainer look.
The lot must **never** display fabricated gameplay data (fake progress, invented
reception, placeholder cash). "Unavailable" dimming is a host policy decision, not
a lot invention — see PRESENTATION-ASSUMPTIONS.
