# Comparator: Zoo Tycoon (2001) / Zoo Tycoon 2 (2004) — management HUD

Lens: bottom/side panel with tabbed catalogue; animal/staff lists; selected-object
info panel; compact status; camera/selection. Target transfer: 2D studio-management
HUD with left people rail / right pictures rail / central lot.

## Sources actually opened

| id | title | edition | url | inspection | notes |
|----|-------|---------|-----|------------|-------|
| S1 | Zoo Tycoon (2001) official manual, 39 pp scan | Zoo Tycoon, original 2001 release (Blue Fang/Microsoft) | https://archive.org/details/Zoo_Tycoon (PDF: https://archive.org/download/Zoo_Tycoon/Zoo_Tycoon.pdf) | READ+VIEWED | Downloaded PDF, rendered pages 26-39 (book pp. 24-37) as 150dpi PNGs and viewed them. Local: zt1_manual.pdf, zt1_pg-28.png...zt1_pg-39.png |
| S2 | Zoo Tycoon 2: Ultimate Collection official manual, 18 pp | ZT2 Ultimate Collection compile, 2008 (base ZT2 2004 + 4 expansions: Endangered Species, African Adventure, Marine Mania, Extinct Animals) | https://archive.org/details/eng-uc (PDF: https://archive.org/download/eng-uc/Eng_UC.pdf) | READ+VIEWED | Downloaded PDF, rendered all pages, viewed pp. 8-11 ("Team Zoo" staff roster, "Save Endangered Species!"/"Build an Animal Safari!") and pp. 17-18 ("Main Game Buttons"/"Main Game Panels" schematic, "Customer Support"). Local: zt2_uc_manual.pdf, zt2_early-08..12.png, zt2_pg-17.png, zt2_pg-18.png |
| S3 | Nexus Mods "Creator's Panel" mod page & search snippet | Zoo Tycoon 2 (base game UI, community mod dated to ZT2-era modding scene) | https://www.nexusmods.com/zootycoon2/mods/178 | BLOCKED (403 direct fetch) - used WebSearch result snippet only | Community-reported UI gap, not independently re-verified by viewing the live page; treat as lower-confidence, documented via secondary snippet |
| S4 | GameRant review of "Zoo Tycoon" (2013 Frontier Developments reboot) | NOT this lens's edition - Xbox One/360 2013 title, unrelated dev (Frontier, not Blue Fang) | https://gamerant.com/zoo-tycoon-review/ | READ (via WebFetch) then EXCLUDED | Confirmed via fetch this reviews the 2013 reboot, not the 2001/2004 Blue Fang games. Excluded from observations below per instructions not to attribute across editions. Recorded here only so the exclusion is auditable. |
| - | YouTube gameplay videos (searched: hMjMy2XBPfo, dEX_3AmXZrA, BsKbNiAhGGI) | ZT1/ZT2 gameplay footage | youtube.com | BLOCKED | yt_dlp returned HTTP 403 on all three candidate videos in this sandbox (tried default, --js-runtimes node, tv client) even after installing no new packages; video evidence for this lens is therefore manual-diagram-only, not moving-footage. Flagged under unverified. |
| - | MobyGames ZT2 screenshot gallery | - | mobygames.com/game/6749/zoo-tycoon-2/screenshots/ | BLOCKED | curl returned empty body, WebFetch returned HTTP 403. No MobyGames screenshots obtained. |

Because video and third-party screenshot galleries were blocked in this sandbox, the
primary visual evidence here is the official printed manuals, which for both
titles contain actual annotated screen captures of the live UI (not concept art) -
these are first-party, dated, edition-specific documentation of the real interface,
which is strong evidence for a HUD/UX study even without moving footage.

## Observations

O1. The bottom bar is one continuous strip mixing clock, money, and five status/list buttons, in that exact left-to-right order.
Evidence: S1, manual p.26 diagram (zt1_pg-28.png), viewed. The strip reads: Pause/Resume - Current Date - Available Cash - Zoo Status (with an inline mini status-bar) - Animal List (with inline happiness bar) - Guest List (with inline happiness bar) - Staff List (with inline happiness bar). Each list button has its own short colored meter fused directly onto the button, not in a separate panel.
Class: visible-in-still. Confidence: HIGH.
Lesson: collapsing "which roster" + "how healthy is that roster" into one compact button+meter unit is very information-dense for its footprint. Transfers: a left people-rail icon-button could carry an inline mini-meter the same way. Does not transfer: ZT1 fuses unrelated data (money, clock, three rosters) into one undifferentiated horizontal strip with no grouping/dividers beyond spacing; keep rail-specific status separate from global economy status.

O2. Selecting an individual (animal/guest/staff) opens the same 3-tab card template regardless of which roster it came from.
Evidence: S1, manual pp.32-36 (zt1_pg-34.png Animal Information Panel, zt1_pg-35..37.png Guest/Staff panels). Animal panel = Status/General/Thoughts tabs; Guest panel = Status/General/Thoughts tabs; Staff panel = Status/Job Assignment tabs. All three share a name field, an action-icon row, and a vertical stack of labeled meter bars.
Class: visible-in-still + documented-behavior. Confidence: HIGH.
Lesson: one reusable "selected-entity card" component scales across animal/guest/employee with only content swapped. Transfers directly to a studio HUD: one selected-person/selected-project card template for both rails. Does not transfer: ZT1's card is a thin floating palette with only a tiny circular portrait icon; a modern HUD wants real illustrated portraits, not the visual thinness.

O3. Status is shown almost entirely as unlabeled horizontal bar-meters; color-as-alert is reserved for two specific cases, not applied to every meter.
Evidence: S1 p.29 text: "If the bar is yellow, it means the guests are unhappy. If it turns red, it means the guests are angry." p.30: fence icon green=good, yellow=bad, red=worn/breached.
Class: documented-behavior. Confidence: HIGH.
Lesson: reserve red/yellow strictly for "needs your attention" alerts so color keeps its urgency signal; routine stats (happiness, hunger, health) are plain green bars of varying length in the manual's depiction. Does not transfer: don't colorize every meter in a modern HUD; ZT1's restraint is the point.

O4. The world remains visible under every panel; panels are non-modal floating overlays, and a persistent, independently-controlled minimap never gets covered.
Evidence: S1 p.25 "Map" section (zt1_pg-31.png), viewed: fixed lower-left diamond minimap with its own zoom/rotate/camera controls, separate from whichever info panel is open. Construction/Adopt/Staff panels (pp.5-21) are narrow tabbed panels beside, not over, the 3D view.
Class: visible-in-still + documented-behavior. Confidence: HIGH.
Lesson: contextual (non-modal) panels + an always-present minimap preserve spatial orientation during roster management. Transfers directly: dock rail panels beside the central lot, never over it, and keep a wayfinding element always visible.

O5. ZT2 adds an explicit "Zoo Guest Mode" / "Photo Safari Mode" - a first-person, hotkeyed camera mode that is a sibling of the top-down view, not a separate game.
Evidence: S2 p.5 "Zoo Guest Mode" text, p.30 hotkeys (G toggles Overhead View/Zoo Guest Mode, C toggles Photo/Zoo Guest Mode), and "Main Game Buttons" schematic (zt2_pg-17.png) listing Overview Map / Overhead View / Zoo Guest Mode / Photo Safari Mode as four peer camera-mode buttons.
Class: documented-behavior. Confidence: HIGH.
Lesson: Team Zoo manual text (p.14, zt2_early-09.png) frames guest mode as optional flavor ("even the busiest zoo tycoons take time" for it), never required for management tasks. Transfers: an optional "walk the lot"/cinematic camera toggle can be pure flavor without touching the core loop. Does not transfer: never make this mode load-bearing for status info - all real management stays in the top-down/panel mode in ZT2.

O6. Persistent staff/project awareness uses a fixed row of role buttons (Construction/Animals/Landscaping/Staff), separated by shape and position from a distinct "meta utility" icon grid and a separate visibility-toggle rail.
Evidence: S2 "Main Game Buttons" (zt2_pg-17.png), viewed directly: upper 2x4 grid of small square utility icons (quick stats, finances, undo, recycle, goals, photo album, fame, save/load); lower row of 4 large circular mode buttons (Construction/Animals/Landscaping/Staff) plus rotate/zoom; a vertical left-edge strip of small show/hide toggle icons (guests, buildings, fences, foliage, emoticons, view area).
Class: visible-in-still. Confidence: HIGH.
Lesson: three-tier separation (global utility / mode-select / visibility-toggle) by icon shape and screen position keeps ~20 buttons legible without one flat toolbar. Transfers: a studio HUD's rails can each carry their own small filter/visibility strip distinct from main rail content. Does not transfer: the sheer total button count (20+ chrome buttons) is a lot for 2026; consolidate the utility tier into fewer controls rather than copying the count.

O7. Catalogue panels (Construction, Adopt Animals, Landscaping) share one two-row header grammar: category tabs above a filter-icon row, above a scrollable item grid/strip.
Evidence: S2 "Main Game Panels" (zt2_pg-17.png), viewed: Construction Panel = tab row (Paths/Fences/Buildings/Donation-Benches-Scenery/Transportation/Elevated Paths/Tank Building/Show&Tank) over a "Transform Mode" filter row over a horizontal thumbnail strip. Animal Panel = Adopt-Animals/Animal-Food/Toys-Enrichment/Animal-Shelters tabs over a species thumbnail grid.
Class: visible-in-still. Confidence: HIGH.
Lesson: one reusable tab-over-filter-over-grid template serves three very different catalogues, aiding learnability. Transfers: a right pictures-rail catalogue can reuse one template across sub-catalogues (genre/era/status). Does not transfer: the manual's thumbnail grids show flat icon-scale renders with no visible secondary stat (price/size) baked into the card; a modern catalogue card typically needs at least one stat visible at grid density, which ZT2 lacks here.

O8. Community modding ("Creator's Panel") targeted a documented base-game gap: no search-by-name in the object/animal catalogue, forcing icon-grid scanning.
Evidence: S3, WebSearch snippet describing the mod: "features a search bar that can be revealed by clicking on the filter bar's second half ... allows you to find animals and objects by their display name, or by their code name." Direct page fetch was blocked (403), so this is a secondary snippet, not a viewed screenshot.
Class: documented-behavior via secondary source, not independently re-verified. Confidence: MED.
Lesson: a mod built solely to add text search to the catalogue grid is circumstantial evidence that icon-grid-plus-filter-tabs (O7) stops scaling once the catalogue grows large (ZT2 UC's combined roster is 100+ animals per its own manual, p.2/S2). Transfers: build search-by-name into a rail once the catalogue is expected to exceed roughly a screen's worth of icons.

## Unverified / could not confirm in this session
- No moving gameplay footage was viewed for either title. All three candidate YouTube videos returned HTTP 403 to yt_dlp in this sandbox even with a JS runtime supplied, so panel open/close motion, hover states, and click feedback are NOT verified; every observation above is sourced from a still diagram/screenshot or manual text describing behavior, not something watched happening.
- MobyGames' official screenshot galleries for both titles were unreachable (empty body / 403); no additional in-game screenshots beyond the manual's own captures were obtained.
- The Nexus Mods "Creator's Panel" description (O8) is from a search snippet only; the live mod page could not be read to confirm exact wording or see its own before/after screenshots.
- A Steam-review-style quote was found ("clunky interface"/"poorly configured menu" - GameRant) but confirmed via fetch to be about the unrelated 2013 Frontier Developments "Zoo Tycoon" reboot, not the Blue Fang 2001/2004 games in this lens, and was excluded rather than misattributed. No genuine Blue-Fang-era ZT1/ZT2 review/forum complaint quote was located within this session's search budget.
