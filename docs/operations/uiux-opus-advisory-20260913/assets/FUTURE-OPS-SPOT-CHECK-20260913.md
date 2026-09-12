# Future Ops — limited R3 advisory spot-check

Date: 2026-09-13. Review only; no game implementation or native testing.

## Inputs and scope

- Advisory: `HSpector1/The-Movies@9042807da122cdb6d791ecfd646e2e409c614eb4`, `docs/operations/uiux-opus-advisory-20260913/UIUX-OPUS-ADVISORY-R3-AND-PLAYABILITY.md` and `assets/r3-exercise-log.json`.
- Latest recorded Owner scope and interaction choices: `f2921730a6ff6cb5f0b8e952995978a8ecb8407f`, `docs/operations/UIUX-WHOLE-GAME-OVERHAUL-OWNER-CLARIFICATION.md` (including section 8).
- User-uploaded R3 archive: 9,570,925 bytes, SHA-256 `b1f3f0ea125aa96de8974d96145f948b3f9d93f48c453636af217a4374073ef8`, matching the published package receipt for R3 `b56088d63e5b8eb66c78584c7b0f40f915c08d8b`.

The advisory lists the hybrid selection, R3 package, older launch plan, and planning handoff as its inputs. It does not list the later full-overhaul clarification or section 8's 1A/2B/3A/4B choices. This establishes an input-list gap, not proof of what the author privately knew.

## Test method and limits

Bundled source was extracted to a disposable local review directory and inspected. Direct file navigation was blocked by this environment. A review-only HTML wrapper loaded the unchanged bundled JavaScript/CSS and intercepted requests for bundled images, serving those bytes locally. No external HTTP(S) requests, native game, game bridge, player profile, campaign, package installation, or repository write was used. Fresh headless Chromium, Linux font fallbacks, device scale 1; 1440x900 and 1280x720 viewports. This is not an identical macOS reproduction and cannot establish native hitboxes or text rendering.

No prototype page errors or attempted external requests were observed in the completed interactions. An end-of-script diagnostic print initially errored after the JSON/screenshots had already been written; the print expression was corrected. That harness-output error was not a prototype error.

## Results

### 1. Keyboard path: reproduced, with a qualification

The first person was reached on Tab 13 and the first picture on Tab 27, matching the advisory. The first five stops are the external prototype controls: treatment, fixture, text size, response, Reset. They are not intended in-game HUD controls. The excessive per-person tab stops remain a real design issue.

Recommendation: use a list-level focus model with arrows moving between rows, while keeping filters, search, overflow/library controls, and the inspector reachable. Preserve focus versus selection and the current return behavior. Do not interpret 'one tab stop per rail' as permission to make its other functions keyboard-inaccessible.

### 2. Scroll/paging mismatch: not reproduced in sampled cases

The current R3 source already uses a single list scroll position. In `movie-cards.js`, `updateRange()` (line 41) calculates the first and last fully visible movie card from actual element rectangles. The scroll listener (line 47) invokes it. The page controls (line 42) increment that same `scrollTop` by 80% of list height; they do not maintain a separate page number.

Observed:

| Scroll top | Displayed range | Independently counted fully visible cards |
|---:|---|---|
| 0 | 1–6 of 7 | 1,2,3,4,5,6 |
| 40 | 2–6 of 7 | 2,3,4,5,6 |
| 77 (bottom in this fixture) | 2–7 of 7 | 2,3,4,5,6,7 |
| Page-down from top | 2–7 of 7 | 2,3,4,5,6,7 |

The reviewer may still find the coexistence of scrolling and buttons confusing. That is a design assessment, not a demonstrated range inconsistency. The range counts only fully visible rows; partial edge rows could warrant clearer wording. More edge cases may exist.

### 3. Inspector measurement: the recorded rectangle matches the picture rail

The advisory's log labels a 286x792 rectangle at (1142,96) as `inspector`, and a 268x612 rectangle at y96 as `enlargedInspector`. These exactly match the right picture rail in this spot-check, not `section.inspector.production`.

| Element | Viewport / setting | Rectangle measured here |
|---|---|---|
| Right picture rail | 1440x900 Standard | x1142 y96 w286 h792 |
| Actual production inspector | 1440x900 Standard | x366 y489.53 w680 h396.47 |
| Right picture rail | 1280x720 Enlarged | x1000 y96 w268 h612 |
| Actual production inspector | 1280x720 Enlarged | x259 y187.03 w730 h518.97 |

The inspector still obscures much of the center and the selected target in this example; the design concern is reasonable. However, the cited 612-pixel inspector measurement is not supported by the logged element geometry and must be corrected. Font/platform differences mean the actual inspector can have a different height in the author's environment. Re-measure using exact selectors and record the selected person/picture, expanded state, viewport and font.

The same advisory log reports nine total/fully visible picture rows, despite the default active list containing seven actual `.movie-card` elements in this package. Element selectors should be included in any revised measurement evidence.

### 4. HUD crowding: useful finding

The title and timeline occupy overlapping vertical space in this wrapper. The studio name is y41–54; ordinary year labels are y53–63, and the current-year label is y47–57. Horizontal overlap exists with some year labels. Visual inspection confirms a crowded/colliding title/year treatment. Exact native typography must be checked separately.

## Source qualification

- XAG 101 does recommend PC/VR default text body height >=18 pixels at 1080p and scaling up to 200% without losing meaning/function. It defines measurement using rendered ascender/descender body height, not merely a CSS font-size declaration. This is accessibility guidance, not evidence of a universal genre rule or proof that suggested 16/14/12 CSS presets satisfy it.
- Current XAG UI navigation is 112; 106 is screen narration.
- W3C APG recommends roving tabindex or an active-descendant approach for composite web widgets. The behavior can inform a native UI; ARIA/DOM implementation is not itself a Unity requirement.
- Wroblewski's 'Dropdowns Should be the UI of Last Resort' article addresses mobile forms. A visible frequent-filter strip is a reasonable proposal to test, not a blanket prohibition on desktop game dropdowns.

Official references checked 2026-09-13:
https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101
https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/112
https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
https://www.lukew.com/ff/entry.asp?1950

## Disposition

Retain the advisory as useful additional feedback. Reconcile it against the complete overhaul and latest Owner choices, repair its measurement classifications, and route warranted fixes to the existing designer/Current Ops coverage register. Do not reopen hybrid selection, silently restore matching shelves, reintroduce a guided tutorial, omit optional lawful drag/drop, or make a controller-first redesign/new research campaign a prerequisite.

The revised plan should preserve full-game coverage rather than fitting the result to the old 72-hour/6-hour-audit estimates. Portraits/fonts and whole-interface readability need concrete finishing work, but missing finished portraits need not prohibit an authorized behavior prototype clearly labeled as provisional. Human newcomer testing is valuable; participant availability, access, cost, scheduling and its release-gate role must be explicitly arranged, not claimed or assumed.

This note is a limited corroboration/refutation of selected claims. It is not exhaustive review, native acceptance, a publication to GitHub, or an implementation order.
