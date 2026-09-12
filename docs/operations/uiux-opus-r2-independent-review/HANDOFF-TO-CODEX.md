# HANDOFF TO CODEX — prioritized, presentation vs interaction, dependencies, boundaries

Codex remains the author of R2. This is a reviewer's recommendation for what deserves to
be built, ordered by how much each item improves the main studio experience. It is not an
execution order, a schedule, or an assignment to any worker; Current Ops owns the
planning handoff and the selected sequence (Playability & Interaction before the targeted
P13B refresh) is unchanged.

## P1 · Presentation changes (no read-model or rule change)

| # | Change | Finding | Where in the proposal |
| --- | --- | --- | --- |
| 1 | Replace the panel material: translucent warm-dark shelf behind each rail; cream card stock rows; two radii (4/8 px); two shadows; selection by outline | V-03, V-07 | `design.css` tokens; `.rail`, `.row` |
| 2 | Remove all mock/tutorial prose from the game canvas: the "Follow your people…" card, the "Original schematic lot" chip, both rail-footer captions, the fixture strips (keep them in the demo bar / annotation rail) | U-06, U-07, V-10 | `index.html` demo bar; annotation rail |
| 3 | Typography: display face for HUD numerals, names, titles; humanist sans body; floor 12 px reading / 10 px tracked labels | V-04 | sheet §2 |
| 4 | One drawn icon set; corner cluster reduced to Build + Records; Lot/Controls removed | V-05, U-11 | `ICON` in `app.js`; `.corner` |
| 5 | Picture cards: genre poster tile with the stage pictogram; five phase pictograms with the current one lit; gold "!" edge tab for decisions, grey clock for waits; group headers with counts; tabs with counts | U-09, U-16, V-14 | `pictureRow`, `.tab`, `.phases` |
| 6 | People cards: portrait standard (44 px, badge slots), name in display face, role + ID + status chip on line 2, status colour on the left edge; "N free" in the header | V-02, U-17 | `personRow`, `portraits.js` |
| 7 | HUD: 52 px, transport cluster + date + PAUSED stamp; year timeline with event pins; cash with delta; rank; Menu | V-06, U-14 | `hud()` |
| 8 | Site labels anchored to the building base with a pointer; selected label goes gold; footprint outline on the selected building; located marker above it | U-05, U-08, V-09 | `.site`, `.fp`, `.marker` |
| 9 | Response strips styled as strips with icon + bold sentence + consequence (not web alerts) | V-11 | sheet §7 |
| 10 | Compact rail mode (portrait/poster stacks) as a player option | — | `?rails=compact` |

## P2 · Interaction changes (input/navigation; no new game rules)

| # | Change | Finding |
| --- | --- | --- |
| 1 | Focus order: HUD → people tab strip (one stop, arrows) → search → rows; `1` / `2` jump to a rail; Up/Down within a list; Escape backs out | U-12 |
| 2 | Locate pans the lot to the target (R2 already translates the mock world; keep, and light the footprint) | U-05 |
| 3 | Company-face row inside the compact production card (click → exact person) | task 2 |
| 4 | Hover peek suppressed for the currently selected identity; right-click = "More facts" in place | U-04 |
| 5 | Navigation consolidated: cash → Finance; Menu → campaigns/help; Records → the deep views; no inert tool on the default screen | U-11 |

## P3 · Safe read-model dependencies (unchanged from R2's routing; restated)

- Complete employee discovery still requires authoritative roster membership joined to
  presence / Profile / locatable-body data (R2 ROUTING A1/A7). The proposal's "N free"
  count and company-face rows are derived from the fixture's `work`/`status` fields and
  need the same join. Presence counts are not employee counts; a missing body shows
  "Location unavailable" with the exact profile still inspectable (implemented in the
  proposal's inspector).
- Phase pictograms map to existing discrete phases; no percentage is computed.
- Rank badges, the "#7 of 12" studio rank, the cash delta and the timeline event pins are
  illustrative devices; each needs a real owner before it appears natively, or it is
  omitted.

## P4 · P13B boundaries

Laboratory workflow, staffing, funding and research remain P13B-owned. The proposal
shows only shared visual conventions (site label, building material, strip styles) that
P13B may adopt; no Laboratory screen was re-drawn.

## P5 · Native-verification gaps (carried from R2's A1–A8, plus)

- Real hitboxes for 22 px edge tabs and 30 px transport buttons on supported devices.
- Rail density with 40+ people and 20+ pictures; sticky group headers under native scroll.
- Type rendering with the licensed faces at 1280×720 / 1440×900 / 1920×1080 and the
  supported large-text setting (the prototype's 200 % is selective, as R2's was).
- Colour-vision and read-distance checks on chips and tabs.
- The lot art target is an art deliverable; nothing here changes the renderer.
