# R3 design specification and implementation routing

[Visual index](README.md). **Proposal only; one focused main-screen refinement.** Editable implementation: [movie-cards.css](movie-cards.css), [movie-cards.js](movie-cards.js), [stage artwork](art/shooting.svg), with the selectively reused Backlot sources listed in [provenance](PROVENANCE.md).

## Recommended structure

Keep the Backlot warm dark HUD/shelves, cream cardstock, gold selection and green commit button. Keep the employee side and lot art stable except the explicit status/fact/focus repairs. The movie side uses floating individual cards between a small toolbar and a separate footer. A dark, continuous right shelf and persistent Scripts / Shooting / Post section panels are removed. Filters expose those categories on demand. Source order is retained while filtering; attention does not silently reorder the list.

The old 36×48 poster and five-icon phase row repeated the same structure for every picture. In this proposal the **current stage image is the primary picture identity cue**, the title identifies the exact work, and a single stage word removes ambiguity. The status says what the player can do or what is happening. A stage image is never a progress meter. Genre remains in inspection rather than occupying another badge on every card.

| Geometry / typography | Recommended hybrid | Closer-to-original comparison |
| --- | --- | --- |
| Reference viewport | 1440×900; 32 px review bar outside the game canvas | Identical |
| HUD / rail inset | 52 px HUD; rails 12 px from HUD and outer edge | Identical |
| People rail | 258 px; 44×53 portrait; name, role and dedicated status row; minimum 78 px card | Identical |
| Picture rail | 286 px; independent scroll between toolbar/footer | 196 px |
| Picture card | Minimum 91 px, 7 px gaps, 8 px radius, 1 px edge + 3 px lower edge | Vertical card, 7/8 px internal padding; same stock and state grammar |
| Current stage image | 78×78 px, 8 px inset frame radius | 96×96 px, centered above title |
| Title | 14 px / 1.16, Futura → Avenir Next Condensed → Gill Sans → Trebuchet → sans-serif; weight 700 | 13 px centered |
| Stage / state | 11 px tracked uppercase / 12 px humanist sans; both plain language | Same stage/state sizes |
| Body face | Avenir Next → Gill Sans → Segoe UI → Trebuchet → sans-serif; system fonts only | Identical |
| Small 1280×720 | People 236 px, pictures 268 px; image 72×78 px | Right rail remains 196 px |
| Enlarged preference | Picture title 20 px (19 px at 1280), stage 15, state 16; people name 18, role 16, status 15; inspector facts 20 | Filter stacks above Find; long cards grow vertically |
| Overflow | Full titles wrap; native independent list scroll plus visible previous/next and fully visible range | Identical controls; fewer full cards fit |

The **Enlarged** selector retains the historical `text=200` query for reproducibility. It is selective enlargement, not uniform 200% scaling or browser zoom. HUD, tabs and some secondary chrome remain compact; full global scaling is outstanding. The direct prototype targets 1280×720 and 1440×900 in this pass. The 1000×650 CSS minimum is an implementation guard, not a supported-device claim.

Default inks/materials: ink `#2b221c`, secondary `#4e4238`, cardstock `#f5eddc`, secondary stock `#ece2cb`, edge `#c8b895`, green `#2e7a4d`; people shelf `rgba(26,21,16,.66)`. Movie stock grades from `#fff9e9` to `#f1e7ce`; stage wells use muted sage/slate so warm gold alerts remain distinct. The lot, portraits, Futura/Avenir direction, radii and common icon set come from Opus; the six object illustrations are original source-native SVG.

## Current-state mapping, without extra mechanics

| Existing fixture state | Stage object / word | Visible card state | Inspection and supported route |
| --- | --- | --- | --- |
| SCRIPT-019 draft; SCRIPT-020 rewrite | Quill and pages · Writing | Draft in progress / Rewrite in progress | Exact script, writer and Script Office. No schedule command. Two scripts share a facility without substituting IDs. |
| SCRIPT-021 ready to review lead | Casting sheet · Casting | **! Review lead** | Exact draft → candidate comparison → exact dossier → Back. Selection does not sign. |
| FILM-014 take ready | Camera · Shooting | **! Schedule take** | Exact Stage 07, exact company and existing-style schedule action/reason/response. Fictional pending, receipt and refusal demonstration only. |
| FILM-017 company at work | Camera · Shooting | Company at work | Exact picture and Stage 04; no invented action to accelerate progress. |
| FILM-018 waiting for Post capacity | Editing reel · Post | **Clock · Waiting · Post capacity** | Inspect Production Post; explain occupancy and unavailable immediate remedy. Inspection cannot free it. |
| FILM-023 ready for release review | Ready film can · Release ready | **! Review release** | Exact picture. The fixture has no Production Office location: say location unavailable. Do not alias it to Production Post. Release review is an explicitly static destination in this bounded prototype. |
| RELEASE-006 completed run | Archived can · Released | Completed run · in the library | Separate library route → exact record; no current worksite. Deeper result example is explicitly static here and remains in the R2 package. |

No progress fraction, elapsed/remaining duration, automatic queue completion, genre score, rating, rank, income animation, new command, hire rule or held-drag action is introduced to imitate Lionhead. Unknown native phases must receive an explicit unknown state in any future binding, not be coerced into Writing. The extra 18 busy records duplicate only existing fictional categorical states; they do not simulate new production mechanics.

## One control standard

| Control/state | Exact behavior |
| --- | --- |
| Primary click / Enter / Space | Select one exact record and open its compact inspector. Supported local location is highlighted and the schematic lot pans. Selection itself never submits an operation. |
| Selection | Gold edge/outline, warmer stock and a check-shaped selection notch; `aria-pressed` identifies it. Selection is independent of decision status. |
| Focus / hover / pressed | Keyboard focus is a blue 3 px ring; hover lightens stock; pressed darkens/insets it. Focus alone never changes the selected record. There is no essential hover-only information. |
| Decision needed | Gold exclamation attached to the stage image plus visible action words. Not all Shooting cards need a decision. |
| Normal work / waiting | Plain ongoing-work wording or slate clock plus a cause. Color alone is insufficient. A wait does not acquire a fake primary remedy. |
| Context / location | Exact ID in inspector and accessible row name; supported site link opens that facility while retaining the picture. Missing body/site stays inspectable and explicitly unavailable. Location is fixture-based, not a native camera/body claim. |
| Back / Escape | Escape first collapses expanded facts, then returns one local level. Back pops the same context stack. Restore exact selection, filters, Find text, both rail offsets, local body offset and invoking focus. New inspection starts its own body at the top. |
| Secondary click | On a person, open/expand the same exact inspector; the visible More facts button is the primary discoverable route. On pictures, inspect the same record; no hidden extra command. No hold/drag assignment. |
| List navigation | `1`/`2` focus a rail; Up/Down focus adjacent rows; Left/Right switch People tabs. Search remains owned by its rail. Escape in search returns focus to that rail's filter/tab. |
| Filters / Find | Active excludes completed records. Decisions, Waiting and stage filters are explicit. Find matches title or ID. Deliberate filter/query changes reset only the affected list; the other offset stays. Card selection does not reset either list. |
| Overflow | Wheel/trackpad, keyboard row navigation, visible previous/next buttons and a fully visible range. Boundary buttons remain focusable with `aria-disabled`, guarded against activation, to avoid dropping focus to the document. |
| Library | Footer shows completed count. Open separate completed view without displacing active cards; Back to active restores the saved origin. |
| Pending / receipt / refusal | Pending disables repeat schedule submission for FILM-014. Response belongs to that exact picture and survives excursions. Receipt never advances calendar or cash. Refusal retains subject and exposes Review current state; unavailable submit focus moves deliberately to the inspector heading. |
| Updated lists / missing record | Preserve offsets while content remains; a genuinely shorter list can clamp to its available range. Exact missing target says unavailable, never substitutes a neighbor. Native filtering and concurrent updates still require acceptance. |

The inspector is an overlay with its own scrolling body and fixed header/footer; it is not a modal that disables the rails. Native camera framing and global-tool occlusion under enlarged inspection still need design/device acceptance. Other deep screens and the static corner/HUD routes were not redesigned in this pass.

## Source-to-design and scope routing

Baseline accepted identities are retained from the original review: TS/bridge **45ca33650074ad5413c39fb9d4a5c04cd6571c3a** and Unity **6420a4d91de52db1bffca2988f2c995672e7d53e**. They are historical review anchors, not a claim that today's accepted builds are unchanged. Future Ops must refresh them before implementation. [Original exact-source appendix](https://github.com/HSpector1/The-Movies/blob/72f04f95bb00ba601d511142b9db8b231e86526b/docs/operations/UIUX-WHOLE-GAME-REVIEW-SOURCES.md).

| Proposed change | Existing source seam | Route after design review |
| --- | --- | --- |
| Single stage artwork, words, selected/decision/wait treatment | [Production rail assembly](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/6420a4d91de52db1bffca2988f2c995672e7d53e/Assets/Studio/Runtime/Presentation/StudioProductionRailHud.cs#L290-L360) | Presentation/art; bind only actual discrete states and existing legality. No gameplay law. |
| Active/filter/overflow/library | [Existing grouped scrolling](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/6420a4d91de52db1bffca2988f2c995672e7d53e/Assets/Studio/Runtime/Presentation/StudioProductionRailHud.cs#L482-L540) | Shared presentation/input; maintain exact script/project/production/result relationships, stable identities, independent scroll. |
| Exact person, work and supported location | [People HUD](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/6420a4d91de52db1bffca2988f2c995672e7d53e/Assets/Studio/Runtime/Presentation/StudioPeopleRailHud.cs#L10-L98), [contracts](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/6420a4d91de52db1bffca2988f2c995672e7d53e/Assets/Studio/Runtime/Infrastructure/StudioPeopleRailContracts.cs#L7-L78), [people projection](https://github.com/HSpector1/The-Movies/blob/45ca33650074ad5413c39fb9d4a5c04cd6571c3a/bridge/people.ts) | Safe authoritative roster/presence/Profile/body join. Missing presence is not missing employment; presence count is not a full roster. |
| Inspection → facility/person → Back, action/reason/response | Original audit F1–F3; [retained routing](https://github.com/HSpector1/The-Movies/blob/e564d236407cb3616ebc597713d5b9fa7d60b38a/docs/operations/uiux-visual-blueprint/r2/ROUTING.md) | Existing navigation/input/command owners. Preserve exact subject, legality, response identity, local context and return focus. |
| Candidate facts consistency | Exact candidate objects and [R2 fictional source](https://github.com/HSpector1/The-Movies/blob/e564d236407cb3616ebc597713d5b9fa7d60b38a/docs/operations/uiux-visual-blueprint/r2/living-studio.js) | Presentation projection from one safe exact-person object; distinguish picture fee from payroll/overhead/term. Unknowns remain unknown. |
| Common visual family | [Opus design](https://github.com/HSpector1/The-Movies/blob/6b2a659bcaa1e577c8d90a10aae390e3855a2985/docs/operations/uiux-opus-r2-independent-review/DESIGN.md) and [handoff](https://github.com/HSpector1/The-Movies/blob/6b2a659bcaa1e577c8d90a10aae390e3855a2985/docs/operations/uiux-opus-r2-independent-review/HANDOFF-TO-CODEX.md) | Selective presentation reuse; no merge, no replacement architecture and no worker direction. |
| Laboratory / deeper families | [R2 routing](https://github.com/HSpector1/The-Movies/blob/e564d236407cb3616ebc597713d5b9fa7d60b38a/docs/operations/uiux-visual-blueprint/r2/ROUTING.md) | P13B retains department workflow, research, staffing and funding. Common visual conventions only. Other family adaptation and portrait finishing remain outstanding. |

**First native improvement recommendation remains the local production action/reason/response strip**, on one exact active film and one honest waiting film, using existing command/legality owners. Include a finite picture-card selection → inspection → Back proof in that authorized slice if Future Ops chooses. The recommended visual target is the whole main-screen treatment above; this first slice is not its ceiling. This document assigns no worker, sequence, schedule or native work.
