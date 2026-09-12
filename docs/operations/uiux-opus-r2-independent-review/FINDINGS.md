# FINDINGS — R2 register (Opus observations, 2026-09-12)

Finding IDs are stable. Usability (`U-`) and visual-craft (`V-`) findings are kept
separate on purpose: R2 largely passes the first axis and largely fails the second.
Aesthetic judgments are marked *(judgment)*. Evidence crops live in
`assets/r2-evidence/` (`A0n-*-annotated.png` = my annotated crops of the actual R2
render; `R2-nn-*.png` = raw captures from my own isolated prototype run;
`r2-exercise-log.json` = measured DOM/CSS facts from that run).

How the evidence was produced: the archive at `e564d236` was verified
(21,736,950 bytes, SHA-256 `2096b670…8fc4`), unpacked, and `index.html` was driven by
Playwright 1.61 / Chromium 149 in a fresh headless context with every non-`file://`
request aborted. Result: 0 page errors, 0 console errors/warnings, 0 attempted network
requests, 39 actionable controls on the home board. This matches Codex's author check
and is *not* a design verdict.

## Executive diagnosis (why it reads as unfinished)

Ranked by how much each cause contributes to the "unfinished" impression, using the
actual 1440×900 renders. Items 1–2 are placeholder-world problems; items 3–7 are UI
craft problems that the placeholders do not excuse.

1. **The lot is a diagram, not a studio** (`V-01`). Flat-shaded extruded boxes, roof
   text baked at odd angles, roads as grey bands with dashed centrelines, three-leaf
   palm glyphs, ellipse shadows, no people/vehicles/props/activity. Codex declares it a
   schematic placeholder; it still dominates ~55 % of the screen and sets the register
   of everything drawn over it.
2. **Portraits are one blank silhouette repeated** (`V-02`). All 12 rail avatars share
   a single SVG path set (measured: 1 unique shape of 12; only fill colours vary), and
   the comparison view uses a second, different silhouette. The original's strongest
   awareness device (a face you recognise) is absent.
3. **Everything is a nested pale-blue rounded rectangle** (`V-03`). 12 distinct
   border radii and 9 distinct box-shadows measured on one board; opaque panels with
   headers, dropdowns, search fields and footers. This is the "admin dashboard"
   grammar. The original had no container panels at all: cards float over the world.
4. **Mock and tutorial prose lives inside the game canvas** (`U-05`, `U-06`, `U-16`,
   `V-10`). A permanent "Follow your people. Follow your pictures." card, a "Original
   schematic lot · fictional data" chip, instructional captions in both rail footers
   and "PROTOTYPE RESPONSE FIXTURE" strips are rendered as if they were UI.
5. **Type has no voice and the small sizes are too small** (`V-04`). One face
   (Trebuchet MS) for everything — hierarchy exists (bold, size) but there is no distinct
   display face for the studio name or film titles; secondary rail text measured at
   10 px, status at 11 px, cash caption at 11 px.
6. **Generic glyph iconography** (`V-05`): `▱ ▦ ⌂ ? ☰ Ⅱ ×` as tool icons and thin
   line pictograms; the corner cluster reads as a form toolbar.
7. **The chrome out-colours the world** (`V-07`). Pale sky-blue chrome covers roughly a
   third of the screen against a warm olive/beige lot; the gold selection tint sits
   close to the roof beige, so selection competes with the world.

What works and must be preserved: the three-zone composition; both rails persisting
through compact inspection; exact-identity handling; honest "needs me / waiting /
library" grouping; price/footprint/weeks in the Build catalogue; no fabricated
percentages; Back restoring the originating view and offset; the state-coverage of the
component sheet.

## Usability & game-awareness axis (`U-nn`)

| ID | R2 screen / control / state | Evidence | Severity | Verdict | Finding and recommendation | Acceptance check |
| --- | --- | --- | --- | --- | --- | --- |
| U-01 | V01 composition (people left / pictures right / lot centre) | `A01` | — | **KEEP** | Correct answer to the Owner's R1 correction; the two standing questions ("who is free / where is each picture") are answered without leaving the lot. | Both rails visible in every non-modal state at 1280×720 and 1440×900. |
| U-02 | Rails persist during compact inspection (V02/V03/V05) | `A02`, `R2-11` | — | **KEEP** | Verified in my run: person, production, Post-wait and Build states keep both rails. | Same. |
| U-03 | Exact identity: duplicate "Mara Vale" P-004 / P-022; search "Mara" | `R2-03` | — | **KEEP** | Search returns both Maras with role + ID; the compact card and dossier carry the ID. Codex's guard against using P-022 in the lead draft re-observed. | Search "Mara" → 2 rows with distinct IDs; selection retains ID. |
| U-04 | Hover / focus preview | `R2-02` | Low | **REFINE** | The preview works (name, role, ID, current picture, place) but renders as a 265 px pale box over the lot, covering building labels. Make it a compact tooltip anchored to the row edge with a pointer, and show the same facts on the located building. | Preview never occludes the located marker; closes on pointer departure (already true). |
| U-05 | Locate marker on the lot (yellow ring + pill "Located · schematic worksite") | `A02` box 2 | Medium | **REFINE** | Selection is only weakly connected to the building: R2 does translate the mock world toward the target (its `.world-canvas` transform), but the building itself is not lit, the label chip stays neutral, and the ring + pill float above the roof with no footprint or trail. The original uses a guiding star trail and a camera jump (manual pp.6, 9). Recommend: light the footprint, switch the building label to the selection colour, place the located marker at the building, keep the pan. | Selecting a rail card highlights exactly one building/footprint and the label matches the card's colour state. |
| U-06 | "Follow your people. Follow your pictures." card on home | `A01` box 3, `A05` | **High** | **REDESIGN** | Present in every home state (mature, early, after Back). 390×140 px at 1440×900 (~26 % of the lot at 1280×720). It is onboarding copy rendered as a permanent game element, hides the lot and is the single most "web page" object on screen. Replace with a dismissible first-run hint or a one-line status ticker; the two quick filters belong in the rail headers. | Home board has no persistent explanatory panel; lot is unobstructed. |
| U-07 | "Original schematic lot · fictional data" chip; rail footers "Click to locate & inspect…", "Names persist through work stages"; "PROTOTYPE RESPONSE FIXTURE" strips | `A01` boxes 4 & 7, `A02` box 1 | Medium | **REFINE** | Necessary for a mock, but they should live in the demo bar / an annotation rail, not inside the proposed game surface. Every R2 preview is contaminated by them. | Game canvas contains only proposed UI; mock controls sit in the 32 px demo bar or the annotation rail. |
| U-08 | Two label systems on buildings (roof text "SCRIPT OFFICE" + chip "Script Office") | `A01` box 5 | Medium | **REFINE** | The baked roof text is half-hidden by the chip on Casting and Script Office. Keep one interactive label system; roof signage, if kept, is decoration and must not duplicate the name. | No building shows its name twice. |
| U-09 | Decision vs waiting cue on picture cards ("Casting · !" vs "Post · Waiting…") | `A01` right rail | Medium | **REFINE** | The only glance-level difference between "needs me" and "normal wait" is a 10 px "!" and wording. The original used red "!" bubbles and coloured pips (manual p.8). Recommend a shaped badge on the card edge (decision = gold tab with "!", wait = grey clock), colour-independent. | A tester identifies the two decision cards within 3 s at 1280×720 without reading. |
| U-10 | Compact inspector + Back; scroll-offset restoration | `A02` box 3, `R2-16` | — | **KEEP** | Re-observed: production → person → Back returns to the production card; compare → Leon → Back keeps the draft. | Same. |
| U-11 | Corner tools (Build/Studio/Lot/Controls) + Studio drawer | `A06` | Medium | **REFINE** | Navigation is split three ways: corner "Studio" opens a list of screens (Casting & compare, Person dossier, Finance, Industry, Film result, Campaigns), top-right "Menu" opens campaigns, cash opens Finance. "Lot" is inert when already on the lot; "Controls" is help. Recommend: corner cluster = Build + Studio (records) only; Menu keeps system/campaign; cash keeps Finance; Lot becomes "Centre studio" only when the lot is panned. | Every destination reachable from exactly one primary place; no inert tool in the default state. |
| U-12 | Keyboard order | `R2-22` | Low | **REFINE** | After 8 Tabs focus is on a lot label ("Laboratory"); the people list is reached only after HUD + lot labels. Rails should be first in the sequence after the HUD, with `[`/`]` or 1/2 to jump between rails. | Tab from the HUD reaches the first person in ≤ 2 presses. |
| U-13 | Early fixture (`?state=early`) | `A04` | Medium | **REFINE** | Rails honestly shrink (3 staff, 1 script) but the lot still shows Stage 04, Stage 07, Production Post, Laboratory, Scene Shop. The lot does not reflect the studio's state, which undermines "a useful lot". | Early fixture lot shows only the buildings that exist at that stage. |
| U-14 | Time controls (Ⅱ Paused / 1× / 2× / 4×) | `A01` | Low | **REFINE** | Four 44 px buttons; "Paused" as a highlighted yellow button reads as a selected filter. Preferable: a small transport cluster (pause/play/fast) plus a date, with the pause state as a HUD-wide cue (dimmed timeline, "PAUSED" stamp). | Pause state recognisable from any corner of the screen. |
| U-15 | Cash → Finance; campaign identity in HUD | `A01` | — | **KEEP** | Matches manual p.6 ("Clicking on this figure takes you to the finance screen"). | — |
| U-16 | Right-rail "Show" dropdown (All / Needs me / Waiting / Library) | `R2-09` | Low | **REFINE** | Filtering works, but a `<select>` hides the counts. Segmented tabs with counts ("Needs me 3") expose the decision load at a glance. | Count of decisions visible without opening a control. |
| U-17 | Rail density (72 px people rows, 66 px picture rows → 8 visible each at 1440×900) | `A01` | Low *(judgment)* | **REFINE** | Adequate for 12 people / 8 pictures; a mature 30–40 person roster will scroll constantly. The original showed a short stack and cycled categories (manual p.6). Recommend 56–60 px rows, sticky group headers, group counts, and a "busy / free" split within Talent. | ≥ 10 rows visible at 1440×900; group headers stick while scrolling. |
| U-18 | Build catalogue rows (price, footprint, weeks, explanation) | `R2-19` | — | **KEEP** | Cost/footprint/reason before placement, Cancel visible, invalid reason in the world. | — |
| U-19 | Casting building work areas (Director / Lead / Company) | `R2-13` | Low | **REFINE** | Correct idea (manual p.9: casting office lowers its walls). The three areas are plain boxes with a sentence each; they should look like places in the building (desk / stage / office), and the "Company" area should show the draft company's faces. | Each area shows the current occupant(s) as portraits, not sentences. |

## Visual craft & game identity axis (`V-nn`)

| ID | R2 element | Evidence | Severity | Verdict | Finding and recommendation | Acceptance check |
| --- | --- | --- | --- | --- | --- | --- |
| V-01 | Lot illustration (`lot.svg`) | `A01` box 1, `A04` | **High** | **PLACEHOLDER → specify** | See diagnosis 1. Not a renderer problem: the mock needs a *defined art target* (painted/textured isometric ground, buildings with materials and signage, activity sprites for the working company, parked cars/props, day lighting) so the UI can be judged against it. Do not judge the UI "finished" until the placeholder is replaced by a target of stated fidelity. | Lot proof at 1440×900 with at least: textured ground, 3 building materials, 6 animated/posed people, signage that is not the label. |
| V-02 | Portraits (rail avatar, compact card, dossier, compare) | `A01` box 2, `A03` box 1 | **High** | **REDESIGN** | One shape ×12; second silhouette system in compare; no badge slots (rank, mood, status). Specify a portrait standard: 3/4 bust, 44 px rail / 96 px card / 160 px dossier, role-coloured backplate, badge slots top-left (rank) and bottom (status bar), consistent everywhere; art dependency = 12 fixture portraits (original or licensed). | One portrait system on all four surfaces; 12 distinguishable faces. |
| V-03 | Panel / card material | `A03` box 2, `A07` | **High** | **REDESIGN** | 12 radii, 9 shadows, opaque nested boxes. Define one material system: the world is the ground; rails are card *stacks* (or one translucent dark strip) with a single card material; two radii (4 px controls, 10 px cards); one shadow; borders reserved for selection. | ≤ 2 radii and ≤ 2 shadows on the home board (measurable with the same script). |
| V-04 | Typography | `A01` box 8, `A03` box 4 | **High** | **REDESIGN** | Trebuchet MS everywhere (bold and size carry the hierarchy, but there is no *distinct* display face); 10 px role/ID, 11 px status/captions, 12–13 px buttons. Define a two-face system (display face for HUD numerals, studio name, film titles; humanist sans for body); floor 12 px at reference, 13–14 px rail body, 15–16 px inspector body; weight and case carry hierarchy, not size alone. | No text under 12 px at 1440×900; titles use the display face. |
| V-05 | Icons (corner tools, card glyphs, HUD) | `A01` box 6 | Medium | **REDESIGN** | Unicode glyphs and thin outlines. One drawn set, filled two-tone, sized 20/28/40, with the same rendering as the world (matching the manual's hand-drawn stage pictograms in spirit, not copied). | All icons from one set; no Unicode glyph icons. |
| V-06 | HUD bar | `A01` box 9 | Medium | **REFINE** | Competent but anonymous: dark teal bar, small-caps serif studio name, 11 px campaign line. Add the studio marque, the era/date as a timeline strip (manual p.5), cash with delta, and make the bar recede (thinner, darker, translucent) so the lot reads first. | HUD ≤ 56 px; timeline visible; studio identity mark present. |
| V-07 | Colour hierarchy | `A07` box 3 | Medium | **REFINE** | Pale chrome dominates; teal action buttons are the only saturated element; gold selection ≈ roof beige. Reassign roles: chrome recedes (warm dark or translucent), portraits and world carry colour, one accent for selection/decision (gold), one alert (red), one calm (blue-grey) for waiting. | Selection colour distinct from any world material by ΔE > 20. |
| V-08 | Spacing rhythm and rail header stack | `A01` | Low | **REFINE** | 130 px of header/filter/search before the first person; mixed 8/10/12/14/16 px paddings. Adopt a 4/8 grid; collapse the header to one row (title + count + filter icons) with search revealed on demand. | First person row starts ≤ 80 px below the rail top. |
| V-09 | Building label chips and "Located" pill | `A01` box 5, `A02` box 2 | Medium | **REFINE** | White pills with borders float without an anchor. Anchor labels to the building base with a pointer; selected label takes the selection colour. | Label visibly attached to its building. |
| V-10 | Prototype fixture strips inside cards | `A02` box 1 | Medium | **REFINE** | Move to the annotation rail / demo bar. | No fixture control inside the proposed UI. |
| V-11 | Response-state tiles (pending / receipt / refusal / waiting) | `A07` box 1 | Low | **REFINE** | Pastel boxes with a left border = web alert boxes. Restyle as in-world stamps/tags (e.g. "SCHEDULED" stamp, "REFUSED" stamp, "waiting" clock tag) while keeping words primary. | States distinguishable by shape and word, not only colour. |
| V-12 | 200 % text preference | `A05` | Low | **KEEP (as declared)** | Selective scaling is honest and stated; the real gap is native. | — |
| V-13 | Film-result poster placeholder (V08) | `R2` V08 | — | **KEEP / extend** *(judgment)* | The dark-green poster with gold title is the only element that says "movies". Extend that language: poster thumbnails on picture cards, a marquee for the studio name. | Picture cards carry a poster/genre mark. |
| V-14 | Phase strip in the production card (Script · Cast · Shoot · Post · Release) | `A02` box 4 | Low | **REFINE** | Thin equal segments; current phase emphasis is weak. Use the manual's stage pictograms idea: a row of stage icons with the current one lit. | Current phase identifiable at 1280×720 without reading. |

## Codex's checker claims — re-checked

- "Zero page errors, zero HTTP(S) requests": **re-observed** (0/0/0 in my isolated run).
- Four repairs (P-022 guard, casting label press, fresh-inspector scroll, Build highlight):
  P-022 guard and scroll/Back **re-observed**; Build highlight not selected during Casting
  **re-observed** (`R2-13`); pointer-down label shift not re-tested (pointer automation).
- "Sonnet was unavailable; inherited-model checker used": disclosed by Codex; noted.

## Rejected alternatives / conclusions worth preserving

- Do **not** replace the three-zone layout with a bottom control panel (Sims/Zoo Tycoon
  style): the Owner selected the left/right rails and the original's HUD confirms the
  card-stack placement.
- Do **not** make the chrome dark-and-gold by default: the problem is material and
  hierarchy, not hue. Both explorations must be judged on craft.
- A new renderer is not required to fix V-01; a stated art target is.

## Disposition

Usability axis: **PASS WITH REFINEMENTS** (no REDESIGN except the permanent tutorial
card). Visual-craft axis: **FAIL — REDESIGN of material, portraits, type and icon
systems; lot needs a specified art target.** Layout: KEEP.
