# SOURCES — evidence register

Legend for **Inspection**: `VIEWED` (pixels/pages/frames actually inspected),
`READ` (text read in full), `LEAD` (search result or citation not yet opened),
`BLOCKED` (access failed; substitute noted). Confidence: `HIGH`/`MED`/`LOW`.
Evidence class per observation: *visible-in-still*, *documented-behavior*,
*observed-sequence*, *inference*, *not-verified*.

## S0 — Assignment inputs

| ID | Source | Edition/date | Locator | Inspection | Notes |
| --- | --- | --- | --- | --- | --- |
| S0-01 | Brief `docs/operations/UIUX-OPUS-R2-INDEPENDENT-DESIGN-REVIEW.md` | `05e9902e` 2026-09-12 | §1–§9 | READ | Controlling prompt. |
| S0-02 | Owner addendum (same file) | `234a36ef` 2026-09-12 | §10 | READ | Checkpoint/handoff rules. |
| S0-03 | Codex R2 package | `e564d236` | `docs/operations/uiux-visual-blueprint/r2/` (README, PACKAGE, REFERENCE-REVIEW, SPECIFICATION, ROUTING, PROTOTYPE, REVIEW, previews, evidence, ZIP) | READ + VIEWED | ZIP bytes/SHA verified; 32 states captured in an isolated Chromium run (see FINDINGS.md). |
| S0-04 | R2 `reference-manifest.json` (Owner's 25 screenshots, metadata only) | 2026-08-17 | ids R01–R25 | NOT ACCESSIBLE | Only filenames/hashes are in the repo; the pixels are not. Not counted as inspected. |

## S1 — The Movies (Lionhead, 2005) primary evidence

| ID | Source | Edition/date | Locator | Inspection | Notes |
| --- | --- | --- | --- | --- | --- |
| S1-01 | Official English manual, Steam app 7900 — `https://store.steampowered.com/manual/7900/` (resolves to `manual_english.pdf`, 1,096,447 bytes, 22 PDF spreads, QuarkXPress, created 2005-09-27) | Retail base game, 2005 | PDF spread 3 = printed pp.4–5; spread 4 = pp.6–7; spread 5 = pp.8–9 | VIEWED by Opus (pp.4–9 rendered at 80–260 dpi; crops saved in `assets/original-game/`) + full-manual pass by a research subagent (see S1-02) | Primary interaction reference. |

Observations from S1-01 (Opus, pixels inspected):

| # | Page | Class | Observation | Design lesson |
| --- | --- | --- | --- | --- |
| S1-01.a | p.5 HUD diagram (`manual-p5-hud-diagram.png`) | visible-in-still | The world fills the whole screen. There are **no container panels**: "Star Cards" are a short vertical stack of small square portrait cards floating at the left edge (3 visible + a small category button above them); "Movie Cards" are 2 small square cards floating at the right edge; a single round "Build Button" sits bottom-left; date/pause/play/FF is a tiny cluster top-left; cash balance + studio ranking top-right; a thin "Timeline" runs along the top edge. | The reference's rails are *card stacks over the world*, not opaque boxed lists. Rail chrome must recede to near-nothing. |
| S1-01.b | p.5 text | documented-behavior | "Timeline – The line along the top of the screen shows the passage of time from present day into the future, each segment representing a year… Events… will be shown… Hold your mouse cursor over an icon to get more details." "Pause… When you pause the game, you can still perform many tasks… You won't be able to pick up and drop items… when time is paused." | A timeline strip is part of the identity and the era cue; pause is a world-state, not a toolbar filter. |
| S1-01.c | p.6 Star Cards (`manual-p6-7-cards-crops.png`, left) | visible-in-still | Square card, rendered face (not silhouette), a **rank number badge top-left ("31")**, an activity/mood icon top-right ("Zz"), and a **pill-shaped bar under the portrait**. Text: "From these portraits you can see their position in the Star charts, their mood and their current activity… By using the buttons above the Star cards, you can cycle through your studio's other employees." | Portrait + two badge slots + one status bar = the compact status vocabulary; category cycling lives *above* the stack. |
| S1-01.d | p.6 tip | documented-behavior | "To locate an actor, director or any of your staff, left-click on their card to jump to them on the studio lot. To pick up… hold down the left mouse button on their card and drag them to the desired location." | Click = locate (camera jump), hold = pick up. R2's click-locates is faithful; R2's lack of camera movement is not. |
| S1-01.e | p.6 Cash / Build | documented-behavior | "Clicking on this figure takes you to the finance screen." "Build Button – The icon in the bottom left… Click on this to see sub-menus: Facilities / Sets / Landscape and Ornaments." | Cash→Finance and corner Build are confirmed; R2 KEEPs both. |
| S1-01.f | p.7 Movie Cards (`manual-p6-7-cards-crops.png`, second column) | visible-in-still | Six square cards, each a **hand-drawn stage pictogram** (writing hand; checkmark; clapper/casting; camera; film can; released with a rank number and stars) with a **genre icon top-right** and a **progress bar along the bottom**. Text: "Before filming commences, your movie card is represented by a script icon; when filming, it appears as a movie camera; and when completed, it appears as a film can… When your movie is taking money at the box office a $ sign will pulse over the movie card." | Stage is shown by *imagery* that changes, plus a bar; attention by a pulsing overlay. R2's text-only "Casting · !" is weaker than the reference. |
| S1-01.g | p.7 genre icons | visible-in-still | Five square tiles with chunky hand-drawn pictograms (fist, glasses, skull, heart, alien). | The icon language is drawn, filled, playful and consistent — not thin line glyphs. |
| S1-01.h | p.6 Studio Ranking thumbnail | visible-in-still | Full-screen "chart" panel drawn as a framed screen with a decorative tab and a starburst; list with star ratings on the left. | Deep views are framed *screens* with an identity, not neutral sheets. |
| S1-01.i | p.8 Information Bubbles | documented-behavior | Hover → bubbles appear after a wait, prioritised; **right-click → all information instantly**; click a bubble to "burst" it; red "!" = something wrong, blue "i" = info; bars show thresholds. | Hover = summary, right-click = expand; alert semantics are shape + colour ("!" vs "i"). R2's right-click-expands is faithful. |
| S1-01.j | p.8 Pips / Guiding Streams | documented-behavior | Diamond "pips" appear on screen with red/green backgrounds for negative/positive changes; picking up a Star/movie/script shows "a trail of stars leading you to… the most sensible action"; Tab jumps to the end of the highest-priority stream. | Selection is *connected to the world* by a trail; the game offers a next destination. R2's floating ring pill is the weak analogue. |
| S1-01.k | p.9 Basic Controls / Navigation | documented-behavior | Keyboard camera (WASD/arrows), Tab, Esc, Space, L attractiveness, M map, P pause; edge-scroll; middle-mouse rotate; wheel zoom. | Keyboard reach is a first-class expectation. |


## S2 — Comparators

(pending)

## S3 — Search leads not yet opened

(pending)
