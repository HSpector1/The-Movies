# WALKTHROUGH — heuristic / cognitive walkthrough and prototype observations

**What this is:** a reviewer who already knows the design cannot run an uncoached
usability study. This file records (a) a cognitive walkthrough of the eight tasks the
brief names, on both the R2 prototype and the proposal prototype, (b) concrete prototype
observations from isolated Chromium runs (`assets/r2-evidence/r2-exercise.js`,
`assets/design/render.cjs`), and (c) short task scripts so the Owner can judge the design
without a narrated tour. It is not evidence of task success by real players.

Both prototypes were run only in fresh headless contexts with every non-`file://` request
aborted; both declare `connect-src 'none'`; neither touches storage, the bridge, a
campaign or the economy. R2: 0 page errors / 0 network attempts. Proposal: 0 / 0.

## A · Cognitive walkthrough (8 tasks)

Scale: **clear** = the next action is visible and its result is understandable without
reading; **readable** = achievable but requires reading small text or a second look;
**weak** = the cue is missing or ambiguous.

| # | Task | R2 (`e564d236`) | Proposal | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Locate an idle employee | **readable** — "○ Available" in 11 px grey under the name; no filter for "free"; the tutorial card offers "Find available people" as a link | **clear** — "3 free" in the rail header; "✓ Free" chip in 12 px on a light chip with the edge bar uncoloured; Talent tab narrows to actors/directors | `R2-09`, `K1` |
| 2 | Find who is on a picture | **readable** — open the picture card, then "Person: Mara Vale" button; company only in the detailed view | **clear** — "Company on this picture" face row inside the compact card; each face is a button to that exact person | `A02`, `K3`, `J5` |
| 3 | Distinguish writing from casting-ready | **readable** — both are "Scripts"; the difference is the word "Casting" and a "!" | **clear** — phase pictograms (quill lit vs clapper lit) plus the gold "!" tab; the Scripts group keeps them together on purpose | `CMP-05` picture rows |
| 4 | Identify a normal wait vs a real decision | **weak** — "Post · Waiting for Post capacity" vs "Shooting · ! Take ready to schedule": punctuation and prose | **clear** — grey clock tab and blue-grey edge vs gold "!" tab and gold edge; "Needs me 3" and "Waiting 1" counts in the tabs | `CMP-05`, `J10` |
| 5 | Inspect and return without losing context | **clear** — both rails persist; Back restores view and offset (Codex's checker + my re-run) | **clear** — same; the lot pans to the target and pans back; hotkeys 1/2 return focus to a rail | `R2-16`, `J6`, `J7` |
| 6 | Compare candidates | **clear** — two columns, numbers, availability chips; portraits are blank | **clear** — same structure with faces, fit/OVR bars beside the numbers, the retained draft shown as faces | `A03`, `K4` |
| 7 | Cancel a draft | **clear** (R2 V05 Build: Cancel placement visible) — proposal retains R2's Build/Cancel unchanged (not re-rendered) | **unchanged** — declared out of the four key screens | `R2-19` |
| 8 | Observe pending / refusal | **clear** — fixture select + strip; styled as web alerts | **clear** — pending disables the primary, receipt strip with check, refusal strip with "!"; response fixture control moved out of the game canvas (not present in the proposal prototype; states are shown on the sheet) | `J8`, `J9`, `C01` |

Keyboard (both): Tab/Shift-Tab reach every control; Enter activates; Escape backs out.
R2: first person row after ~10 Tabs (lot labels precede rails). Proposal: first person row 3
Tabs after the HUD (roving tabindex on the tab strips; `1`/`2` jump to a rail;
Up/Down move within a list).

## B · Prototype observations (proposal), with the defects I found and fixed

- Candidate inspection showed `undefined` for work/location for Leon (fixed: candidates
  carry `work`/`place`; a place with no building renders "Location unavailable — exact
  profile still inspectable", so a missing body never reads as unemployment).
- The hover peek persisted over the selected person after a click (fixed: no peek for the
  selected identity).
- At 1280 × 720 the status chip clipped on "Craft lead P-02x" rows (fixed: chip wraps under
  the role at that canvas).
- Rows in the rails could shrink under flex pressure at 200 % text (fixed: `flex: none`).
- Measured after fixes: 3 radii (4 px, 8 px, 50 %), 2 shadows, 0 reading text under
  12 px, 0 tracked labels under 10 px, 12 / 12 distinct portraits.

## C · Short task scripts for the Owner (no narration)

Open `assets/design/index.html` (from the extracted ZIP; keep the folder together).

1. **Who is free?** Look at the left rail only. Say the number of free people and one name.
2. **Where is Nora Finch?** Click her. Say the building. Press Escape.
3. **What needs you?** Look at the right rail only. Name the pictures that need a decision, then name the one that is only waiting.
4. **Schedule.** Click *The Glass Harbor*. Say what the decision is and what it costs. Click the green button. Say what changed on the right rail.
5. **Cast.** Click *The Long Way Home*. Say who is in the lead draft and why Leon cannot be assigned. Click *Inspect record* on Leon, then press Escape — is the draft intact?
6. **Compare.** Switch the Direction control to *Exploration A*, then *B*, then back to *Recommended*. Say which one you would keep and what you would change.
7. **Same data, R2 lot.** Switch World to *R2 schematic*. Say whether the rails read better or worse than R2's on the same background.
8. **Compact.** Press the small ‹ button in the People header. Say whether you would ever play in this mode.

## D · Future human / native tests (not performed)

- Uncoached 5-person think-aloud on tasks 1–5 with the native build, both viewports,
  100 % and the supported large-text setting.
- Read-distance test: 1080p TV at 2.5 m for the rail rows and decision tabs.
- Colour-vision simulation (deuteranopia/protanopia) on the status chips and the decision
  tab — the words and shapes must carry the meaning without the hue.
- Native hitbox check for the 22 px edge tabs and the 30 px transport buttons.
- Long-roster test (40+ people, 20+ pictures) for scroll, group headers and search.
