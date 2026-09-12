# The Movies (2005, Lionhead/Activision) — Documented UI Behavior
Lens: DOCUMENTED BEHAVIOR + MODERNIZATION. Base game only except where noted.

## Sources actually opened

| ID | Title | URL | Inspection | Notes |
|----|-------|-----|------------|-------|
| S1 | The Movies official game manual (Retail/Steam PDF) | https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf | READ (full 22pp + 8 pages viewed as rendered images) | Primary developer source. Saved as manual_english.pdf/manual_english.txt; screenshots saved as manual_p*.png |
| S2 | The Movies — FAQ/Walkthrough by Mark_E_1990 (GameFAQs, PC) | https://gamefaqs.gamespot.com/pc/561567-the-movies/faqs/41120 (via Wayback Machine, snapshot 2018) | READ (full text) | Community documented-behavior guide, v3.0. Saved as gf_41120.txt |
| S3 | PCGamingWiki — The Movies | https://www.pcgamingwiki.com/wiki/The_Movies (via Wayback Machine, snapshot 2022-12-07) | READ | Confirms widescreen/HUD scaling bugs. Saved as pcgw_clean.txt |
| S4 | The Movies Game Wiki (Fandom) — Script Office | https://the-movies-game.fandom.com/wiki/Script_Office (Wayback snapshot 2024-09-06) | READ | Saved as script_office_wb_clean.txt |
| S5 | The Movies Game Wiki (Fandom) — Custom Scriptwriting Office | https://the-movies-game.fandom.com/wiki/Custom_Scriptwriting_Office (Wayback snapshot 2024-07-23) | READ | Saved as custom_script_wb_clean.txt |
| S6 | The Movies Game Wiki (Fandom) — Stage School | https://the-movies-game.fandom.com/wiki/Stage_School (Wayback snapshot 2024-09-07) | READ | Saved as stage_school_wb_clean.txt |
| S7 | StrategyWiki — The Movies/Walkthrough | https://strategywiki.org/wiki/The_Movies/Walkthrough | READ | Corroborates drag-to-build-a-movie sequence |
| S8 | StrategyWiki — The Movies (main) | https://strategywiki.org/wiki/The_Movies | READ | Developer/genre metadata only |
| S9 | StrategyWiki — The Movies/Movie types | https://strategywiki.org/wiki/The_Movies/Movie_types | READ | Genre scene-stage names, not UI |

Blocked/not obtained (do not treat as evidence of absence): live PCGamingWiki, GameFAQs and Fandom pages returned Cloudflare "Just a moment" challenges or 403/402 to both WebFetch and curl and had to be retrieved via Wayback Machine instead; the Fandom Casting Office, Crew Facility, Production Office, Makeover Department and Movie Quality Output pages exist (confirmed present in the wiki's own Local_Sitemap listing) but have no Wayback snapshot at all and could not be read. Casting-office UI behavior below is instead sourced from the official manual (S1) and GameFAQs (S2), which independently describe it in detail. A targeted search for Lionhead/Molyneux interviews or Edge/Eurogamer 2005 previews specifically discussing UI/art-direction rationale did not surface a fetchable primary source in the time available — not verified, flagged below, not asserted either way.

---

## Workflow traced: making and releasing one movie (documented, not observed-in-video)
Source: S1 pp.10-15 (Quick Start Tutorial) cross-checked against S2 and S7.

1. Hire builders at the Staff Office: pick a person from the queue with left-click, drag, drop into the "Create Builder" room (a room highlights blue when you hover the correct sub-area of the building). (S1 p.10)
2. Click Build icon (bottom-left) -> Facilities -> Stage School -> place footprint on the lot (footprint outline is yellow = buildable, red = obstructed) -> builders auto-walk over and construct. (S1 p.10)
3. A queue of walk-in hopefuls forms outside; drag-drop them into the Actor/Director/Extra rooms of the Stage School to hire. (S1 p.10, S2 line 430)
4. Build a Script Office; drag a scriptwriter into the room matching the desired genre; drag more writers into the shared "script pool" to speed writing. (S1 p.12, S2 line 627)
5. Build a Casting Office; left-click the building itself to "lower the walls" and reveal its interior floorplan (a distinct building-open transition, not a popup window). Drag the movie/script icon from the HUD's right-edge movie-card rail into the "Begin Casting" room; then drop actors/directors/extras/crew into their named rooms; then drag the movie icon again into "Shoot It" to start filming. (S1 p.13, S2 line 613)
6. Filming happens on a placed Set; if a required set is missing/busy/damaged its name shows in red in the movie's info bubble. (S1 p.13)
7. Drag finished movie into the Production Office's "Release" room; optionally drag onto a marketing-budget amount first if a Publicity Office exists. Dragging into "Movie Player" instead previews it uncut. (S1 p.13)
8. Release triggers an automatic Reviews screen (critics' comments) before returning control. (S1 p.13)

---

## Observations

### 1. The HUD is a fixed ornamental frame, not a floating overlay
Situation: default in-game HUD, base game.
Observation: The manual's own labeled diagram (S1 p.6, manual_p04_HUD-diagram-labeled.png) shows the entire screen bordered by a thick, curved, theater-marquee-style metal/poster frame with a star-and-ribbon logo motif at top-center. Named zones: Timeline (top edge, full width), Date/Pause/Play/Fast-Forward (top-left), Cash Balance & Studio Ranking (top-right), Star Cards (stacked down the far left edge), Movie Cards (stacked down the far right edge), Build Button (bottom-left icon). Visible-in-still, developer-authored diagram, not a fan interpretation.
Design lesson: the frame itself is doing brand work (this is a "movie prop," not a generic sim HUD) as much as the icons inside it.
Transfers: the idea of a themed ornamental frame that reinforces setting (a soundstage/clapperboard motif for a studio game) rather than a neutral flat-UI bar.
Does not transfer: the literal fixed-pixel frame — see Observation 15 (resolution/scaling failure) for why a rigid frame like this is hostile to modern arbitrary-aspect displays.
Confidence: HIGH (documented-behavior + visible-in-still, primary developer source).

### 2. Star Cards are a single-portrait "who's idle / who needs me" rail, not a roster grid
Situation: default HUD, left edge.
Observation: "Star Cards — These images represent the Stars (actors and directors) in your studio. From these portraits you can see their position in the Star charts, their mood and their current activity... By using the buttons above the Star cards, you can cycle through your studio's other employees." Only one card is shown at a time, with prev/next arrow buttons above it to page through the full roster one-by-one — not a scrolling list or grid. The visible thumbnail (S1 p.6/7, manual_p06_HUD-labels-buildmenu-starcards.png) shows a single square portrait with a star-shaped badge bearing the numeral "31" overlaid at top-left (chart rank) and a small icon at bottom-left (activity indicator). (S1 p.6)
Interaction, verbatim: "left-click on their card to jump to them on the studio lot. To pick up an actor, director or member of your staff to your current location, hold down the left mouse button on their card and drag them to the desired location." Right-click = "Display all Information Bubbles" instantly. (S1 p.7)
Design lesson: the single-card-plus-cycle-arrows pattern deliberately narrows attention to one person at a time rather than presenting a scannable roster.
Transfers: the card-as-object idea (a portrait you can grab and drag directly onto the world to relocate/reassign the person) is a strong, distinctly game-y interaction reusable for staff reassignment.
Does not transfer: one-card-at-a-time roster browsing does not scale to dozens/hundreds of staff — keep the "drag the card onto the world" affordance but back it with a searchable/filterable grid, not serial cycling.
Confidence: HIGH (documented-behavior, primary source; card visual composition is visible-in-still).

### 3. Movie Cards use six distinct icon states as the sole "what stage is this in" signal, plus a pulsing $ for revenue
Situation: right-edge HUD rail, one card per movie in production/release.
Observation, verbatim + visible-in-still (S1 p.7, manual_p07_moviecard-icons-genre-icons.png): six stacked icon thumbnails, each captioned:
- script/quill icon = "Your scriptwriters are busily working on your latest blockbuster."
- script-with-checkmark icon = "Your script is complete and ready for casting in the Casting Office."
- third icon = "Casting is complete and you are ready to shoot your movie."
- movie-camera icon = "Your movie is in the process of being filmed on your studio lot."
- film-can icon = "Your movie has now been shot and is ready for release."
- film-can-with-graphic icon = "Your movie has been released. When your movie is taking money at the box office a $ sign will pulse over the movie card. When your movie is no longer making any money, you should archive it."
A small numeral shows current chart position; a genre glyph (fist=Action, glasses=Comedy, skull=Horror, lips=Romance, alien head=Sci-fi, all visible in manual_p07...png) sits in the card's upper-right corner.
Design lesson: stage-of-production is communicated purely through icon substitution on a fixed-position card, not badges/progress bars/color alone — the one animated cue in the whole card system is a pulsing $ tied specifically to active revenue.
Transfers: icon-substitution-on-a-persistent-card as the primary stage indicator; reserving animation for the one time-and-money-sensitive moment rather than pulsing everything.
Does not transfer: the manual's grayscale-photocopy icon rendering is not necessarily representative of in-engine fidelity — a modern remake needs higher-contrast, more differentiated, colorblind-safe glyphs (script vs. script+check are subtle here).
Confidence: HIGH for text/behavior (documented-behavior); MED for exact visual fidelity in-engine (source is manual art, not a captured screenshot, so treated as inference for pixel-level fidelity).

### 4. Information Bubbles: hover-to-open, priority-sorted, glyph-coded, closable per-bubble or all-at-once
Situation: hovering/right-clicking any Star, movie, building, queue person, or card.
Observation, verbatim (S1 p.8):
- "To display information about a Star, movie or building, simply hover the mouse cursor over an item and wait for the bubbles to appear." (confirms a hover delay; exact duration not specified — not verified)
- "Right-click on an item... All information pertaining to that item will be displayed instantly" — right-click skips the hover wait.
- "To close an information bubble, just click on it and it will 'burst.' Clicking on the central bubble closes all the attached bubbles." Moving the mouse away also auto-closes them.
- "Bubbles intelligently work out which information is of the highest priority and display this first" — triaged, not an unordered dump.
- Glyph coding: "a bubble will display a red '!' symbol to let you know when something is really wrong, or a blue 'i' symbol to inform you of something."
- Bars have "thresholds" (tick marks) where crossing below has a mechanical consequence ("performance and happiness will suffer"), not just a visual warning.
- Visible-in-still (manual_p05_information-bubbles-pips-icons.png): a small screenshot shows 4-5 oval bubble-panels connected by thin lines radiating from a single walking character on the lot — bubbles are diegetic call-outs anchored to the world object, not a side-panel.
Design lesson: "burst to dismiss," "central bubble closes the group," and "priority-sorted so the worst problem shows first" together make a noisy tooltip system self-limiting.
Transfers: priority-sorted, glyph-coded (not color-only) urgency marking on hover; a group-dismiss gesture for stacked call-outs; tying a mood-bar threshold to an actual gameplay consequence.
Does not transfer: speech-bubble clusters anchored to a moving 3D figure would be hard to keep legible in a busier modern scene — likely better centralized into a persistent side panel/alert list.
Confidence: HIGH (documented-behavior, primary source, partially visible-in-still).

### 5. "Pips" — a separate, smaller, color-coded alert layer distinct from bubbles
Situation: ambient studio-status changes (not tied to hover).
Observation, verbatim (S1 p.9): "Alongside the information bubbles you'll often see additional feedback coming from pips. As areas of your studio status change, you'll see pips appearing on-screen and alerting you of the changes. The background color of a pip shows at a glance if the change is a positive or negative one for your studio—a red background is negative and a green background is positive." Visible-in-still: three small diamond-shaped icon swatches in the manual (manual_p05...png) — a filled dark diamond, a lighter diamond, and a diamond with a small inset diamond — suggesting shape/fill variation layered on the red/green background, not flat color alone.
Design lesson: the game runs two parallel ambient-notification systems at different granularities — bubbles (rich, on-demand, per-object) and pips (terse, unprompted, studio-wide) — a "toast vs. inspector panel" split still standard in modern sim UIs.
Transfers: the two-tier ambient-toast + on-demand-detail split is directly reusable.
Does not transfer: relying on red/green fill alone risks a colorblind-accessibility gap; the shape variation visible in the art partially mitigates this but isn't confirmed as fully accessible — redesign, don't copy as-is.
Confidence: MED (behavior verbatim; exact shape-coding is inference from small, low-resolution manual art, not the running game).

### 6. Universal interaction grammar: left-click-hold-drag to pick up/relocate, right-click for full info, deletion is a distinct third gesture
Situation: base interaction model for Person, Star Icon on HUD, Movie Icon on HUD, Lot Ornaments, Facilities (S1 p.10 table).
Observation, verbatim table:
- Person: Left-Click = Pick Up/Drop; Right-Click = Display all Information Bubbles
- Star Icon on HUD: Left-Click = Select to Move/Drop; Right-Click = Display all Information Bubbles
- Movie Icon on HUD: Left-Click = Select to Move/Drop; Right-Click = Display all Information Bubbles
- Lot Ornaments: Left-Click = Duplicate (into hand); Right-Click = See Move Options
- Facilities: Left-Click = Show Floorplan
Deletion is a distinct third gesture, not right-click: per GameFAQs (S2 lines 248-260, 300-301), to delete a building you "hold a building over the bomb and wait for the small squares around it to fill [then] let go" — a hold-to-confirm gesture over a dedicated bomb/trash icon, explicitly to prevent accidental deletion. To delete a loose ornament/plant: hover until highlighted -> left-click-and-hold to pick it up -> then right-click to delete it (right-click here means "destroy the held item," overloading the same button that means "inspect" when empty-handed).
Design lesson: the same physical input (right-click) is overloaded by held-item state, and destructive building removal gets extra hold-to-confirm friction that cheap ornament removal does not — friction scaled to the cost of the mistake.
Transfers: state-dependent button overloading and confirmation friction scaled to action cost are both still-current, good UX patterns.
Does not transfer: the literal "hold over a bomb icon" metaphor risks reading as "sabotage/weapon" rather than "demolish" out of context — keep the hold-to-fill affordance, use a clearer demolish/trash glyph.
Confidence: HIGH (documented-behavior, corroborated independently by primary manual and community FAQ).

### 7. Hiring/casting/assignment is drag-and-drop onto a labeled floorplan "room," never a form or dropdown
Situation: every staffing action (builders, janitors, writers, actors, directors, extras, crew).
Observation: every hiring/assignment action documented across S1 and S2 uses the identical verb pattern: pick a person up (left-click-hold) -> drag across the 3D world -> drop into a specific labeled sub-room of a building ("Create Builder room," "hire actor room," "hire director room," genre-named script rooms, "Begin Casting room," "Shoot It room," "PR room," "Reviews room," "Finance room," "Auto"/"Makeover" rooms, "Nip & Tuck"/"Liposuction"/"Implants" rooms). Casting specifically requires left-clicking the Casting Office building itself to "lower the walls" and reveal an interior floorplan showing every role as a droppable area — described nearly verbatim in both S1 p.13 and S2 line 613 independently ("left-click on it to lower the walls and view its floorplan"). GameFAQs adds a warning not in the manual: "if for any reason you have to return to the casting office at any stage whilst shooting your movie... putting actors into different roles or getting a new director will make your movie start shooting from the start. This does not happen when changing crew or extras." (S2)
Design lesson: there is no menu-based hiring UI at all — every assignment is spatial, and rules (recasting a lead resets the shoot, recasting crew doesn't) are encoded as consequences of where you drop something rather than a warning dialog.
Transfers: spatial, room-based assignment as a legible "this job belongs to this building" metaphor is worth keeping for headline actions; the recast-lead-vs-recast-crew asymmetry is worth preserving, ideally with an explicit warning this time (the original apparently gave none proactively).
Does not transfer: pure drag-and-drop for every action does not scale to hundreds of staff — keep the spatial metaphor as the primary/fun path but add a searchable list/filter fallback, a known gap in the original.
Confidence: HIGH (documented-behavior, independently corroborated by two sources).

### 8. "Guiding Streams"/"Star Trails" — an optional on-rails hint path, overlaid even on the Build menu
Situation: whenever you pick up a Star, movie, script, or queued person.
Observation, verbatim (S1 p.9): "When you pick up a Star, movie, script or a person from the queues, you'll see a trail of stars leading you to perform the most sensible action. This is only a suggestion, however, and in all cases you can ignore the guidance... These also display on the Build menu, showing you which icons and options to select next if your studio is in need of something." Keyboard Tab = "Go to the end of highest priority sparkling stream" (S1 p.9).
Design lesson: a lightweight, dismissible, world-space breadcrumb trail (literal stars, on-brand) doubles as in-world guidance and menu guidance, unifying "what next" across 3D and UI space instead of two separate tutorial systems.
Transfers: a single, ignorable suggested-next-step affordance spanning world and menu, rather than modal tutorial popups.
Does not transfer: the literal sparkling-star VFX is period/brand flavor, not the mechanic — keep the underlying "always-available optional guide-path" idea.
Confidence: HIGH (documented-behavior, primary source).

### 9. Time controls: Pause/Play/Fast-Forward with a specific pause-state carve-out (audit yes, manipulate no)
Situation: Timeline strip, top of HUD; keyboard P.
Observation, verbatim (S1 p.5): "Pause, Play and Fast Forward – Pause time, speed it up and play at normal speed. When you pause the game, you can still perform many tasks and check the status of your staff, studio and movies in production. You won't be able to pick up and drop items in the studio such as Stars, staff, movies or scripts when time is paused. When in Fast Forward mode, you can play the game as normal, except everything happens much faster." A dedicated pause icon "beneath the timeline" toggles pause without opening the full Esc pause menu (S1 p.9); P is a direct keyboard toggle. The Timeline is an always-visible year-by-year strip pre-showing future scheduled events (unlocks, award ceremonies, taste shifts, research completions), responsive to hover: "Hold your mouse cursor over an icon to get more details." (S1 p.5)
Design lesson: pausing is explicitly "look but don't touch" — you can audit information while paused but the game blocks the drag-and-drop assignment actions that are its core verb, keeping world state changes tied to flowing time.
Transfers: clearly communicating (and here, documenting) exactly what pause does/doesn't allow is good practice regardless of philosophy.
Does not transfer: blocking all drag-drop during pause, if copied literally, would frustrate players used to modern "pause-and-plan" sims — should be a deliberate, stated choice, not silent inheritance.
Confidence: HIGH (documented-behavior, primary source, verbatim).

### 10. Cash Balance is a clickable HUD figure with two independent on-ramps to the Finance/Salary screen, and a stated (undisplayed) debt penalty
Situation: top-right of HUD, beside Studio Ranking.
Observation, verbatim (S1 p.6): "Cash Balance – ...Clicking on this figure takes you to the finance screen. Your Cash Balance contributes toward your ranking in the Charts, so it is advisable to spend wisely. Note: Your balance can go into the red but when you're in debt, you won't be able to build new sets or add certain facilities and lot ornamentation." Salary adjustment needs a second click inside that screen: "Click on the Cash Balance... then click on the arrow along the right-hand edge of the Finance screen to go to the Salary screen." (S1 p.14) GameFAQs documents an alternate path to the same screen: "You can pick up your star and drop them into the finance room in the production office... The same thing happens when you place the floating information icon into the finance room." (S2 lines 273-279) — two independent routes (HUD click-through, or drag-a-Star/"I"-icon into a physical Finance room) to the identical salary screen.
Design lesson: critical numeric state is both a glanceable HUD figure and a direct portal to deeper management, deliberately duplicated across a fast click-through path and a diegetic drag-into-room path consistent with the game's overall metaphor.
Transfers: offering both a fast direct on-ramp and a diegetic physical on-ramp to the same screen is a good redundancy pattern.
Does not transfer: stating a going-into-debt penalty purely in manual text with no visible on-screen warning is a documentation/UX gap — a modern build should surface that consequence directly in the HUD (e.g., recolor the cash figure, add a persistent pip) rather than requiring the manual to be read.
Confidence: HIGH (documented-behavior, primary source + independent corroboration for the alternate route).

### 11. Studio "attention needed" cue is a literal ground-texture heatmap overlay, not an icon list
Situation: keyboard L = "View Studio Attractiveness."
Observation, verbatim (S1, "Studio Attractiveness"): "To view the current level of attractiveness of your lot, press L. You'll see shades of green and red in the area by the buildings you have constructed so far. The greener an area appears, the more attractive it is. Red areas on the other hand, need attention because they're not looking so great." Resolution is watched live: "you'll see the level of redness fade and eventually turn green as you add further flora." GameFAQs corroborates the underlying consequence: "Cleanliness – If there are only very small amounts of litter on your lot... you can expect your overall lot prestige to suffer." (S2 lines 740-745)
Design lesson: rather than flagging "this tile needs attention" via an icon badge, the game recolors the ground plane itself in a toggleable overlay — the whole lot becomes the visualization, and improvement is felt as color receding in real time as you place objects.
Transfers: a toggleable full-lot heatmap overlay (one key) for an aggregate spatial stat, rather than scattering individual icon badges — directly comparable to modern city-builders' land-value/pollution overlays, and worth reusing as-is conceptually.
Does not transfer: nothing to avoid — this is one of the cleanest, most reusable ideas found in the manual.
Confidence: HIGH (documented-behavior, primary source, corroborated).

### 12. Star mood/behavior cues layer environmental "thought bubbles," a flashing status bar, and PA-system audio — an escalation ladder for the same underlying state
Situation: Star relationships and mood, base game.
Observation, verbatim:
- "You can gain insight into their feelings and desires by the thought bubbles that appear when two Stars are interacting." (S1 p.15) GameFAQs: "You can find out if your stars are comfortable with another star in a certain place by the speech bubbles that appear above their heads. If you try to rush them into things then they will let you know." (S2 lines 493-495)
- "green bars flashing" is named by GameFAQs as a reward effect from the "Highest Charting Movie" award: "Easy to please – Stars are easier to please, you can expect to see your stars green bars flashing a lot more often when you have this award." (S2 line 908)
- "PA System – In addition to information bubbles, listen for announcements over the studio PA system that help keep you up to date with problems and interesting developments as they occur." (S1 p.9)
Design lesson: the same underlying "is this Star okay" state is exposed through three channels at three interruption levels — passive world-space thought bubbles, a HUD-level flashing bar, and PA audio that interrupts regardless of where you're looking. That reads as a deliberate ambient-to-can't-miss-it escalation ladder, not simple redundancy.
Transfers: the escalation-ladder concept (ambient world cue -> HUD status cue -> audio interrupt reserved for the most important events) is directly reusable, genre-independent.
Does not transfer: relying on a bare color change (flashing green, no accompanying shape/icon difference) repeats the colorblind-accessibility gap from Observation 5 — carry the ladder, not the specific "green flash" implementation.
Confidence: MED-HIGH — the individual facts are each documented-behavior from primary/community sources; the "three-channel escalation ladder" framing is this report's synthesis across those facts, not a claim any single source states explicitly.

### 13. Custom Scriptwriting Office tracks per-scene shot status with a green checkmark, and skips already-shot scenes on re-shoot
Situation: editing/re-shooting a movie in the Custom Scriptwriting Office (advanced facility, base game).
Observation, verbatim (S4/Fandom, Custom Scriptwriting Office): "This also allows you to edit other scripts (whether you've written them or allowed the computer to), and tweak scenes to re-shoot them. If you drop a completed movie into this, any scene that is already shot will have a small green checkmark on it. Once you exit the making screen and essentially re-cast and re-shoot the movie, the game will be smart enough to skip any scenes with that green check mark."
Design lesson: per-scene status is tracked and exposed at the individual-scene level (contrast Observation 3's whole-card status icon) inside the advanced editor specifically, nested one level below the coarse whole-movie marker shown in the main HUD.
Transfers: nesting a fine-grained per-unit-of-work status indicator inside a detailed editor, distinct from a coarse whole-object status on the main HUD card, is a clean two-level status pattern (comparable to per-shot render status in a modern production-pipeline tool).
Does not transfer: no negative transfer identified; flagged only that this is single-sourced from a community wiki, not independently corroborated by the manual or GameFAQs.
Confidence: MED (documented-behavior, single wiki source, not independently corroborated elsewhere; specific and mechanically plausible given everything else documented).

### 14. Script Office facility tiers gate maximum script quality; the top two tiers are award-locked
Situation: Script Office building, base game.
Observation, verbatim (S4/Fandom, Script Office): "Basic: Costing $6,000, this version is limited to producing 1 star scripts. Intermediate: Costing $29,000... 2 star scripts. Proficient: Costing $33,333... 3 star scripts. First Class: Costing $66,666... 4 star scripts." GameFAQs corroborates the gate: "The Proficient and First Class scriptwriting offices have to be unlocked by winning awards." The manual corroborates the cross-tool cap relationship: "The level of your Script office also determines the maximum script rating for movies you make in the Custom script office." (S2)
Design lesson: progression is expressed as physical building upgrades with hard quality ceilings, not an abstract skill/tech tree — a visible, ownable building tier raises the ceiling for both auto-written and manually-written scripts, avoiding two separate progression tracks for the same output.
Transfers: tying an abstract numeric cap to a single, visible, ownable building tier (rather than a hidden meta-currency or separate research node) keeps progression legible on the lot.
Does not transfer: nothing negative identified.
Confidence: HIGH (documented-behavior, corroborated by two independent sources).

### 15. Fixed-resolution 2005 UI does not scale to modern displays — HUD stretches and text distorts at ultrawide; some UI is frame-rate-locked
Situation: running the original engine (Steam release, app 7900) at non-4:3/non-native resolutions on modern hardware.
Observation, verbatim (S3/PCGamingWiki, "Video" table):
- Widescreen resolution: flagged as needing reference to the external WSGF (Widescreen Gaming Forum) entry — not natively clean.
- "Ultra-widescreen: Models and HUD are stretched to fit the screen, and some menu items have distorted text."
- "60 FPS" row: "Menus and some UI elements are locked to 30 FPS."
- A community "The Movies Fixer" utility (found via WebSearch only, not independently fetched/read as a source — not verified in detail) describes itself as unlocking the resolution selector, correcting FOV and 2D-interface aspect ratio, and fixing click-hit-areas to match the corrected interface — implying stock click-hit-boxes desync from the visuals once resolution changes, a functional failure beyond visual stretching.
Design lesson: a HUD built for one fixed reference resolution/aspect ratio can fail two independent ways when force-scaled — visual distortion and (per the third-party fixer's own description) misaligned click targets, the latter invisible until a player tries to click something.
Transfers: the cautionary lesson — build hit-testing and layout from the same responsive system, never hard-code click-rects against an assumed fixed canvas, so aspect-ratio/resolution changes over a game's life can't desync clickable regions from what's drawn.
Does not transfer: N/A — pure warning, not a pattern to reuse.
Confidence: HIGH for stretching/distortion and 30fps-lock (documented-behavior, direct wiki text); MED for the click-hitbox-misalignment specifics (inferred from a third-party tool's own marketing description, not independently read/verified this pass).

---

## Unverified / could not confirm this pass
- Exact hover delay (milliseconds) before an Information Bubble appears — the manual says "hover... and wait for the bubbles to appear" but never quantifies it.
- Whether the manual's small screenshots are pixel-identical to the in-engine HUD (style-consistent with the rest of the document, but not cross-checked against an independent gameplay video/screenshot this pass).
- Any developer or press commentary specifically explaining the rationale for the drag-and-drop/room-based UI (sought via WebSearch for Molyneux interviews, Edge/Eurogamer 2005 previews — none surfaced a fetchable, quotable primary source in the time available).
- Details of the Casting Office's interior floorplan UI beyond what the manual/GameFAQs describe in prose (Fandom's dedicated Casting Office page exists but has no Wayback snapshot and its live URL is Cloudflare-blocked to both WebFetch and curl).
- The Movies Fixer's "fixed click areas" claim was read only via a WebSearch snippet of its own listing page, not independently fetched/read in full — a plausible lead, not confirmed primary evidence.
- Stunts & Effects expansion-specific UI changes: only one incidental mention found (S4: stunt-school unlock lets a player "place the first scriptwriter onto the stunt icon in the genre room of the script office") — insufficient to describe expansion UI differences with confidence; everything else in this report is base-game.

## Files in this folder
- manual_english.pdf / manual_english.txt — full official manual (primary source)
- manual_p03_HUD-overview-diagram.png through manual_p18_starmaker-text.png — rendered manual pages actually viewed, descriptively named
- gf_41120.txt — full GameFAQs walkthrough text (Mark_E_1990 v3.0)
- pcgw_clean.txt — PCGamingWiki article text
- script_office_wb_clean.txt, custom_script_wb_clean.txt, stage_school_wb_clean.txt — Fandom wiki pages
- sw_The_Movies.html, sw_The_Movies_Movie_types.html — StrategyWiki pages
