# Reconciliation 01 — Opus advisory against the whole-game overhaul scope, the Owner's §8 interaction choices and the Future Ops spot-check

**2026-09-13 · Opus (independent principal game UI/UX reviewer) · documentation and bounded prototype re-measurement only.**
This note corrects the advisory `UIUX-OPUS-ADVISORY-R3-AND-PLAYABILITY.md` (published at `9042807d`), reconciles it with the later controlling scope, and returns a compact corrected disposition for the existing whole-overhaul coverage register. It preserves the R3 hybrid selection and the existing design owner, assigns no work, redirects no worker, approves no budget and grants no implementation authority. No research fleet, install, upgrade, native session, game launch, bridge connection, campaign/profile access or gameplay edit was used.

## 0 · Inputs (corrected list) and method

| Input | Identity |
| --- | --- |
| Owner whole-game clarification **including §8 (1A / 2B / 3A / 4B)** — *omitted from the advisory's input list; now controlling* | `f2921730a6ff6cb5f0b8e952995978a8ecb8407f` · `docs/operations/UIUX-WHOLE-GAME-OVERHAUL-OWNER-CLARIFICATION.md` |
| Future Ops spot-check (received as a file; verbatim copy kept here) | `assets/FUTURE-OPS-SPOT-CHECK-20260913.md` · 7,714 B · SHA-256 `8dfadf203f913a0c31f517ffc634467b2857356b0e02145c36a204fc9b269fa8` |
| R3 archive measured (same bytes as the spot-check) | `STUDIO-PICTURE-CARDS-R3.zip` · 9,570,925 B · SHA-256 `b1f3f0ea125aa96de8974d96145f948b3f9d93f48c453636af217a4374073ef8` (package at `b56088d6`) |
| Advisory under correction | `9042807da122cdb6d791ecfd646e2e409c614eb4` · this folder |
| Earlier inputs (unchanged) | selection `3aa4bad9`; plan `673f4983`; handoff `9db31137`; Opus review `6b2a659b` |
| XAG pages re-read 2026-09-13 for the numbering/measurement corrections | `learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101`, `/106`, `/112` |

**Re-measurement method.** `assets/r3-remeasure.cjs` → `assets/r3-remeasure-log.json` (SHA-256 `e8c8ea89b71ac8658c58360697e2f4e43eb85f2dc63d2b23872ff6ed8e96f667`). Fresh headless Chromium 149.0.7827.55 (Playwright 1.61.0, macOS 25.6.0), device scale 1, every non-`file://` request aborted (0 blocked, 0 page errors), no storage. Every figure below names its **selector, viewport, text setting, fixture, screen, selected identity and expanded state**. Unlike the spot-check's Linux fallbacks, all four first-choice faces (Futura, Avenir Next, Avenir Next Condensed, Gill Sans) resolved locally, which explains 2–5 px height differences between the two runs. None of this is a native Unity rendering.

## 1 · The four spot-check points — corrected or refuted

| # | Spot-check point | Verdict | Corrected fact (measured) |
| --- | --- | --- | --- |
| 1 | Tab counts include five external prototype controls; per-row traversal remains | **ACCEPTED** | Tab 13 = first person, Tab 27 = first picture (reproduced); the first five stops are the demo bar (`#treatment`, `#fixture`, `#text-size`, `#outcome`, `#reset`). **In-game only: 8 Tabs to the first person, 22 to the first picture** (stops: 3 transport, cash, menu, People tab, search, then 12 person rows, filter, Find, first card). Busy fixture: 13 people / 25 pictures → Tab 28 total, 23 in-game. My "40 employees → 40+ presses" was arithmetic on the row model, not a fixture measurement. All 12 `#people-list .row.person` and 7 `#pictures-list .movie-card` have `tabIndex 0`. R3 **already has** ArrowUp/Down within a list and the `1`/`2` hotkeys (both exercised); what it lacks is list-level focus. Refinement adopted from the spot-check: a roving cursor must keep the People tabs, search, filter, Find, page controls, library link and inspector reachable, and must preserve R3's focus-versus-selection and `data-focus` return behaviour. |
| 2 | R3 already drives range and page-jumps from one scroll position | **ACCEPTED — advisory R3-2 withdrawn as a demonstrated defect** | `updateRange()` computes the range from card rectangles; page-up/down add ±0.8×`clientHeight` to `#pictures-list.scrollTop` and call the same function. Measured (1440×900, Standard, mature, `#movie-range` vs independent count): scrollTop 0 → "1–6 of 7" (fully visible 1–6, partial 7); 40 → "2–6 of 7" (partial 1 and 7); 77 = bottom → "2–7 of 7"; page-down from top → scrollTop 77, "2–7 of 7"; page-up → "1–6 of 7". No inconsistency. Residual **design assessment only**: the counter reports fully visible rows, so at scrollTop 40 rows 1 and 7 are on screen but uncounted; clearer wording is the designer's option, not a defect. |
| 3 | The logged 286×792 / 268×612 rectangles are the right picture rail, not the inspector | **ACCEPTED — advisory R3-6 numbers were wrong** | My selector `[class*=inspector],[role=dialog],[aria-label^="Picture"]` matched `aside.rail.rail-pictures.movie-dock[aria-label="Pictures"]` (re-confirmed: 1142,96 286×792 at 1440; 1000,96 268×612 at 1280). The "nine picture rows" came from `[class*=picture]` matching the rail element and the Find button in addition to the 7 cards. Corrected inspector geometry is in §1a. The 1280 Enlarged concern is **re-established with exact numbers**, and a **new 1440 Standard defect** appears (corner tool covered). |
| 4 | XAG 101 measures rendered body height, not CSS font-size; UI navigation is XAG 112, not 106 | **ACCEPTED, with one precision** | XAG 112 is *UI navigation*; XAG 106 is *Screen narration*. The two sentences I quoted ("Support a focus order that's aligned with the meaning or operation of the UI…"; end-of-list looping with a looping toggle) appear verbatim in the implementation lists of **both** 106 and 112 (re-read 2026-09-13), so the requirement was real and the label was wrong; the advisory should cite **XAG 112** (which also states "The UI is fully navigable by keyboard and controller *digital* input alone" and "Text/UI scaling shouldn't result in having to scroll in two directions"). XAG 101 defines size as **body height = ascender + x-height + descender of the rendered glyphs, measured from a screenshot** (pixels ≥ 2:1 contrast to background), stated as a *minimum default* to launch with; it is accessibility guidance, not a genre rule. My "16 / 14 / 12" presets were CSS values; see §1b for what they measure. Wroblewski's dropdown article is a mobile-forms argument: R3-3 is downgraded to a proposal to test. W3C APG roving tabindex is a behaviour reference, not a Unity implementation requirement. |

### 1a · Corrected inspector geometry (exact selectors and state)

Coverage = share of the named element's bounding box under the inspector. "Free lot" = the region between the rails below the HUD.

| Selector · state | Viewport · text | Inspector rect (x, y, w×h) | Covers located footprint (`.world svg.fp polygon`) | Covers marker (`.world .marker`) | Covers lit site label | Covers `nav.corner` | Covers free lot | Content clipped |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `section.inspector.production` · FILM-014 (Stage 07) | 1440×900 · 100 % | 366, 487.5, 680×398.5 | 0 % | 0 % | 0 % | **48 of 62 px of the Records tool (77 %)** | 38 % | no |
| `section.inspector.person` · P-004, collapsed | 1440×900 · 100 % | 366, 598.2, 680×287.8 | 0 % | 0 % | 0 % | Records 48 of 62 px | 28 % | no |
| `section.inspector.person` · P-004, expanded | 1440×900 · 100 % | 366, 463.5, 680×422.5 | 0 % | 0 % | 0 % | Records 48 of 62 px | 40 % | no |
| `section.inspector.production` · FILM-014 | 1280×720 · Enlarged | 259, 182, 730×524 | **100 %** | **100 %** | **100 %** | **100 % (both tools)** | 80 % | no |
| `section.inspector.production` · FILM-018 (waiting, Production Post) | 1280×720 · Enlarged | 259, 182, 730×524 | 100 % | 100 % | 100 % | 100 % | 80 % | no |
| `section.inspector.person` · P-004, collapsed | 1280×720 · Enlarged | 259, 280.8, 730×425.2 | 95 % | 0 % | 100 % | 100 % | 65 % | no |
| `section.inspector.person` · P-004, expanded | 1280×720 · Enlarged | 259, 94, 730×612 | 100 % | 100 % | 100 % | 100 % | 93 % | **yes** (647 / 508 px) |

Evidence: `assets/RM-A-1440-std-production-inspector-annotated.png`, `assets/RM-B-1280-enl-production-inspector-annotated.png`. The click path and the `?screen=production&id=FILM-014` URL path produce the same rectangle. The world pans the target to y≈330 on inspector screens, which is why the 1440 inspector clears it and the 1280 one cannot.

### 1b · Text sizes as XAG 101 measures them (approximate, non-native)

Canvas ink measurement of "Hhfg" (the letters in XAG's own diagram) with the resolved faces, CSS px at device scale 1. Native measurement must be taken from a screenshot of the Unity build per XAG 101.

| CSS px | Avenir Next (body stack) body height | Futura 700 (display stack) body height |
| --- | --- | --- |
| 10 / 11 / 12 | 10.1 / 11.1 / 12.1 | 11.0 / 12.1 / 13.2 |
| 13 / 14 | 13.1 / 14.1 | 14.3 / 15.4 |
| 16 / 17 / 18 | 16.1 / 17.1 / 18.1 | 17.6 / 18.7 / 19.8 |

R3 in-game text at Standard (1440×900): HUD 10 (year labels ×6), 11 (PAUSED), 12, 13 (studio name), 17, 18; People rail 12 (×29), 14 (×12), 15; Pictures rail 11 (×7 stage words), 12 (×10), 13 (×9), 14 (×8); corner tools 11; lot site labels 12. At **Enlarged the HUD and corner histograms are identical** (10 ×6, 12 ×2, 13, 17, 18; 11 ×2) — there is no `.text-200 .hud` rule; rails go to 12–19 px. **No element scrolls in two axes at Enlarged** (XAG 112 check passes in the prototype).

Consequence for my advisory: the "Standard 16 / 14 / 12" preset would measure ≈ 17.6 / 14.1 / 12.1 px body height — only the title approaches XAG 101's 18 px PC minimum. The preset is a step toward readability, **not** XAG compliance; whether XAG 101 is the floor is an Owner / Current Ops readability decision that the register should record explicitly rather than inherit from me.

## 2 · Reconciliation with the whole-game scope and the §8 choices

| Advisory item | Under `f2921730` | Disposition |
| --- | --- | --- |
| §3.1 walking-skeleton first slice; "48-hour allocation line" | §3 already starts implementation "with the selected studio view and a complete real person/production interaction"; §4 forbids fitting the outcome to the old 72-h budget | **KEEP the skeleton as the first finite increment; WITHDRAW the 48-hour reference.** Budget is Current Ops' reconciliation, not mine. |
| §3.2 RITE-style audit with 3–5 fresh players | §5 acceptance is Howard's judgement plus demonstrated evidence; the spot-check notes participants must be arranged, not assumed | **KEEP as a recommendation with a named dependency:** participant availability, access, cost, scheduling and whether it gates release are explicit decisions for Current Ops; nothing here assumes them. |
| §3.3 "UI scale, not text size" | §2 visual-system row requires readable scaling of HUD/rails/workspaces/dialogs at declared sizes | **KEEP;** measured gap: Enlarged leaves the HUD and corner tools unscaled (§1b). Acceptance measured as XAG 101 body height on native screenshots, not CSS values. |
| §3.4 digital-first input model reused for controller | **1A** desktop first; preserve existing controller paths; no controller-first overhaul; §5 forbids a legacy island | **REVISED:** the keyboard-complete model (list-level focus, single non-chorded keys, Esc, remapping — XAG 112/107) is the deliverable; existing controller paths *should reuse the same cursor model* so they do not become the incompatible island §5 forbids. No controller-first work or console port is proposed. Trackpad camera ownership (no middle button; drag threshold; edge-pan default) is an **open item** for the register's Shared-controls row. |
| — (not in the advisory) | **2B** optional lawful drag-and-drop | **ADDED as proposals only (§3, P-11).** Every drop takes exactly the ordinary route's review — the same identities, legality and commitment review, never fewer steps; where the ordinary route has no review, a drop commits with undo. Drop targets stationary; legality re-checked at drop; drop outside a target = snap back; Esc cancels; press-hold and click-pick/click-drop both supported (WCAG 2.2 SC 2.5.7 and 2.5.2 as behaviour references). Candidate routes need a legal command check: person → building; person → picture card; script card → stage; candidate → compare slot; catalogue item → lot. Unknown commands are named dependencies, not invented. |
| §3.10 "reserve a later onboarding pass (star trail)" | **3A** contextual explanations only; no guided first-film introduction | **WITHDRAWN.** Replaced by contextual layers: self-explaining states (every disabled control shows its reason, every empty list its next action, every blocker its destination), the 4B decision cues as the first-film guide, on-demand per-screen help. **Open question for Future Ops:** whether a one-time, dismissable first-visit hint counts as contextual help or as guided onboarding under 3A. |
| §3.8 single attention channel | **4B** selective attention | **KEEP, strengthened:** cues derived from current authoritative state each tick (never queued); four categories only (Decision / Warning / Wait / Event); a journal, per object and global, for retrievability; one short sound for a new Decision. No automatic pause, no simulation-time change. |
| §3.7 fonts and portraits | §3 representative portrait proof before population-wide work; spot-check: placeholders need not block a labelled behaviour prototype | **KEEP;** agreed that a provisional, clearly labelled behaviour prototype may proceed with placeholder portraits. Windows font fallback (Trebuchet) remains a decision to record. |
| §3.9 test the label "Pictures" | unchanged | **KEEP** (copy-deck item). |
| §3.5 / §3.6 tokens as USS variables; perceptual comparison | §3 shared components built once; §5 "compare against the approved visuals at appropriate scale" | **KEEP;** ARIA/DOM references are behaviour references only. |
| §1 "keep" list | §1 retains people-left / hybrid cards / lot / original-led interaction; Backlot remains the working language | **UNCHANGED.** Nothing here reopens hybrid-versus-classic or restarts genre research. |

## 3 · Corrected disposition for the whole-overhaul coverage register

Classes: **DEFECT** = demonstrated in the R3 prototype with exact selectors; **OBSERVATION** = measured fact without a demonstrated failure; **PROPOSAL** = a change to test, the designer's call; **PREFERENCE** = aesthetic judgement, no automatic action. Dispositions are inputs for the existing designer and Current Ops, not orders.

| ID | Class | Register domain | Measured fact | Suggested disposition | Uncertainty |
| --- | --- | --- | --- | --- | --- |
| R3-1 keyboard | **DEFECT** | Shared controls / navigation | Every row is a Tab stop (12 + 7 × `tabIndex 0`); 8 in-game Tabs to the first person, 22 to the first picture; arrows and `1`/`2` already work | List-level focus (roving cursor) per rail; every other control stays reachable; preserve focus ≠ selection and `data-focus` return | Native focus system ≠ DOM; verify on the build |
| R3-2 paging | **WITHDRAWN** as defect → OBSERVATION | Studio home | Single scroll position; counter and buttons agree in all sampled states | Optional wording for partially visible rows | More edge cases may exist (long lists, Enlarged) |
| R3-3 select filter | PROPOSAL | Studio home | 9-option `<select>`; counts visible only when opened; XAG 112 "more than one way to locate content" already met (filter + Find) | Test a visible `All · Decisions n · Waiting n` strip against the select in the audit; no blanket rule | Desktop dropdowns are legitimate; evidence needed |
| R3-4 rail materials | PREFERENCE | Visual system | Early fixture: left shelf 792 px tall with 441 px empty below three rows; right rail 612 px empty but floating, so invisible | Design-owner discretion; **no automatic restoration of matching shelves** | — |
| R3-5 text sizes | OBSERVATION + **DEFECT** (HUD) | Visual system / readability | Sizes in §1b; HUD 10–18 px and corner 11 px unchanged at Enlarged | Define UI scale to include HUD and tools; Owner/Current Ops to decide whether XAG 101's 18 px body height is the floor; measure natively per XAG 101 | Body heights are Chromium/macOS approximations |
| R3-6 inspector | **DEFECT** (1280 Enlarged) + **NEW DEFECT** (1440 Standard) | Studio home / Buildings | 1280 Enlarged: 100 % of footprint, marker, lit label and both corner tools under the production inspector (80 % of free lot; person expanded 93 %, content clipped). 1440 Standard: Records tool 77 % covered | Target-aware docking or bottom-sheet at small canvas; keep corner tools clear at every viewport (position or z-order); collapse "More facts" by default at 1280 | Native layout may differ; the concern, not the pixels, transfers |
| R3-7 HUD marque / timeline | **DEFECT** (1280) · OBSERVATION (1440) | Studio home / HUD | 1280: studio name overprints the "1926" label (17×7 px, reads "19W6"); 1440: labels abut the name at 0–1 px, raised 1926 label shares the name band, gold now-marker draws through it (`assets/RM-C-hud-marque-timeline-crops.png`) | Give the marque and ruler separate lines or separate columns; year labels ≥ 12 px tracked | Native typography must be re-checked |
| R3-8 people rows | OBSERVATION | People | 12 rows × 78 px (three stacked elements); 8 fully visible at 1440 Standard, 4 at 1280 Enlarged | **No automatic compression;** whether two lines read better is a test question for the audit | Density preference varies by player |
| R3-9 genre tint | PROPOSAL (low) | Pictures | Genre absent from the card face, present in the inspector | **Not automatic;** if adopted, tint is redundant with the inspector word (WCAG 1.4.1) | — |
| R3-10 tokens | **PARTLY WITHDRAWN** → OBSERVATION | Visual system | In-game radii are 4 / 8 px / 50 % only — the "3 px" was the demo bar's Reset button; three distinct in-game box-shadows (Backlot `--shadow` ×25, card ×7, stage-art ×7) | Design-owner discretion | — |
| NEW-1 corner tools under inspector at 1440 Standard | **DEFECT** | Studio home / Buildings | See R3-6 row | Included in R3-6 disposition | — |
| NEW-2 two-axis scrolling at Enlarged | PASS (retain, demonstrated) | Readability | No element scrolls horizontally at 200 % | Record as retained-demonstrated for the prototype | Native build unverified |
| P-1 … P-10 plan items | per §2 | Plan | — | KEEP 1 (minus the 48-h line), 2 (with dependency), 3, 5, 6, 7, 8 (strengthened), 9; REVISE 4; WITHDRAW 10 | — |
| P-11 drag-and-drop (2B) | PROPOSAL | Shared controls / People / Pictures / Buildings | Not in R3; not measured | Route inventory with legal-command dependencies; review-parity rule; stationary targets; drop-time legality; both gestures | Legal commands unknown to me |
| P-12 contextual help (3A) | PROPOSAL | Guidance | Not measured | Reason line, empty-state next action, blocker destination as per-surface definition of done; per-screen help; decision cues as the first-film guide | One-time hint compatibility with 3A: Future Ops to rule |
| P-13 copy deck | PROPOSAL | Visual system / guidance | — | One owner for state words (Decision / Waiting / Blocked / Ready), verbs (Hire / Assign / Cast) and the "Pictures" label | — |

## 4 · Remaining uncertainty (explicit)

1. All measurements are of the R3 design prototype in Chromium on macOS at device scale 1 with the intended faces; the spot-check's Linux run differed by 2–5 px in inspector height. The delivered Unity build is unmeasured; every disposition applies to the design target until native evidence exists.
2. XAG 101 compliance can only be judged from native screenshots (body height, ≥ 2:1 contrast pixels); the §1b canvas figures are a planning approximation.
3. The 2B route list is a candidate inventory; which routes have a lawful command is P13A/Current Ops knowledge, not mine.
4. Fresh-player participants are not arranged, budgeted or scheduled by anyone as far as this note knows.
5. Whether a one-time first-visit hint is "contextual" under 3A, and whether XAG 101's 18 px is the readability floor, are open rulings.
6. The list-level focus model and target-aware inspector are described for the DOM prototype; their native equivalents may need different mechanics for the same behaviour.

## 5 · What this note does not do

It does not reopen the hybrid selection, restore matching shelves, compress status rows, remove pointer controls, add genre colours, reintroduce a guided tutorial, omit optional lawful drag-and-drop, propose a controller-first redesign or a new research campaign, fit the outcome to the older 72-hour / 6-hour estimates, or change any file outside this advisory folder. The advisory body is retained as history with correction markers; this note is the corrected reading.
