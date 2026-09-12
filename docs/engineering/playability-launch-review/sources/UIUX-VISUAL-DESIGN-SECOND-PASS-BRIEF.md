# Project: Studio — visual design and interaction blueprint

**Date:** 2026-09-12  
**Status:** FUTURE OPS FOLLOW-UP FOR OWNER DISPATCH — DESIGN / PROTOTYPE ONLY. Publication does not start a worker or authorize production implementation.  
**Recipient:** the existing whole-game UI/UX reviewer. Continue the same session and owned branch; do not commission another general research survey.

## 1. Continue the existing work; raise the deliverable standard

Repository: `HSpector1/The-Movies`  
Owned review branch: `docs/uiux-whole-game-review-01`  
Reviewed commit: `72f04f95bb00ba601d511142b9db8b231e86526b`

Read the latest remote head first and preserve newer authorized work. Retain:
- `docs/operations/UIUX-WHOLE-GAME-REVIEW.md`
- `docs/operations/UIUX-WHOLE-GAME-REVIEW-SOURCES.md`

The eight findings, three journeys and source appendix are a useful diagnosis. The Owner now requests an actual visual proposal showing where the interface belongs and how it behaves, at the standard expected of an experienced game UI/UX designer. The next delivery must not be another prose-only critique or simply a nicer action strip.

**Produce one coherent recommended whole-game visual/interaction blueprint, rendered mockups, and a small clickable design prototype.** Show the intended experience before a builder has to invent its layout. F1 may remain the first implementation recommendation; it is not the ceiling on the design proposal.

Carry forward the existing original-The-Movies-led, world-first/not-world-only direction. Preserve a visibly usable lot, substantial readable retained-lot dossiers, and deliberate larger workspaces for real comparison. Keep identity/portrait, relevant skill, availability and contract consequences together. Avoid tiny text, repeated memo panels as the main cockpit, and a generic enterprise-dashboard aesthetic. These are design goals, not claims that the delivered client currently fails all of them.

## 2. Scope and permissions

This authorizes documentation and non-production design assets: SVG/PNG, HTML/CSS and minimal JavaScript for a standalone, fictional-data navigation prototype, plus rendering and exercising that prototype in an isolated browser context. Keep them under a clearly named documentation/design folder on your existing review branch.

This is the narrow extension of the previous read-only review: **prototype markup is permitted; production gameplay implementation is not.** Browser preview/rendering of these standalone artifacts is permitted. Starting the real game, connecting to its bridge, running the Unity editor/player, game builds/tests or native-input automation remains prohibited.

No edits to production TypeScript, bridge schemas, Unity C#/UXML/USS/scenes/prefabs/assets, project manifests, lockfiles, hooks, saves, campaign libraries or player preferences. No runtime imports, network calls, authentication, analytics, external font requests, paid assets, new dependencies, public deployment, PR, merge or protected-ref promotion. No browser/game profile may be reused. Prototype state is fictional and in memory, resettable, with no real filesystem, storage or financial operations.

You are not the P13B planner. Laboratory entry and common component styling may be illustrated, but do not redesign staffing, research choices, funding law or the department workspace independently of P13B. Route interface recommendations through Future Ops; do not direct another worker. No P14–P17 feature implementation or placeholder future-feature controls.

## 3. Source and evidence discipline

Use the review's source appendix and existing comparator research; follow exact pinned references rather than current main. Your inspected design baseline remains:
- Delivered TypeScript/bridge: `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`, `HSpector1/The-Movies`.
- Delivered Unity: `6420a4d91de52db1bffca2988f2c995672e7d53e`, `HSpector1/project-studio-unity-visual-spike`.
- P13A closeout: `45a3916862a6e98fcb7e9c6908cb2b31f1e8b588`.
- Existing comparator/priority notes: `fe4d22ce60505ccce27543d7201c69d46d42a368`.
- P13B preparation supplement: `9f48d79c2ec73e32930ff73c12dc9b99985457ec`.

These are reference identities, not the eventual implementation baseline. Do not inspect mutable implementation worktrees. Preserve the review's distinction between source-verified facts, Owner-reported friction, historical captures, design inference and native-verification requirements.

The existing review has no inspected accepted-P13A opening/mature captures. Do not present its P06C historical image as the current build or fabricate a before screenshot. Use correctly attributed permitted existing imagery, or a clearly labeled schematic lot backdrop. A source-reconstructed before wireframe must say exactly that. Missing current captures do not prevent designing the proposal; list the precise captures needed later to validate it.

Every new picture must visibly identify **PROPOSED DESIGN / MOCK DATA — NOT IMPLEMENTED**. Hypothetical names, amounts and states should be internally consistent but are not tuning. Every important field/action must map to an existing published fact/command/navigation destination or be marked as a proposed presentation/read-model dependency. Do not invent executable remedies for locked productions.

## 4. Establish the visual direction before multiplying screens

Briefly assess the existing screens, eight findings and historical visual references. Produce two small alternatives for the overall lot/HUD/panel composition, then select one recommended direction yourself with a short rationale. Do not pause for an Owner vote unless a real gameplay choice is involved. Develop the full package in that single direction, not two complete competing systems.

Show the resulting screen map: normal home, inspectors, larger workspaces, modal layers and return routes. Explain what stays visible, what replaces another panel, what is scrollable and what is pinned. Different routes to the same entity must share facts and a common inspector rather than duplicate interfaces.

The target is a movie-studio management game with readable, restrained studio-era character. Choose an actual palette, typography hierarchy, density and icon treatment; do not hand the builder only adjectives such as clean, intuitive or cinematic. Use original/licensed existing assets or clearly labeled placeholders; do not reproduce another game's UI artwork. Preserve space for the lot and avoid noisy transparency behind numbers.

## 5. Render the key screens, not just boxes or a mood board

Provide high-fidelity, readable reference boards for these eight screen families. Shared layouts and component sheets should reduce repetition; this is not a request for dozens of unrelated screens.

| Board | Required proposed view and purpose |
| --- | --- |
| V01 — Lot and persistent HUD | Early/simple and mature/multi-project variants: time/date and pause state, cash, active campaign identity, people/project access, attention, selected object and context action. Show density growth without making the lot disappear. |
| V02 — Production | Exact selected film, phase/progress, company, worksite links and persistent action/reason/response strip. Show one actionable state and one normal-wait/blocked state; include the profile/remedy excursion and return context. |
| V03 — Person / talent dossier | Readable portrait-or-silhouette/identity, perceived relevant ability, availability and financial consequences, with deeper details separated. Include inspection and contract-review variants; selection never signs. |
| V04 — Casting and comparison | Role context, chosen company/draft, persistent candidate detail and two-to-four-person comparison. Show the route back to the selected candidate and the intact casting draft; unavailable candidates remain inspection-only. |
| V05 — Building / facility | Catalogue-to-placement and selected facility: footprint, cost, valid/invalid placement, reason, cancel, review/commit, construction vs operational state. A Lab card can demonstrate the shared action hierarchy without a competing research redesign. |
| V06 — Finance / Industry | Representative finance overview and Industry drill-down using one visual language; period/coverage/estimate labels, explanation and exact return path. No invented loan, net-worth, private-rival or later-package data. |
| V07 — Campaigns / preferences | Active vs selected campaign; unnamed-progress leave → Save As; naming/overwrite review; operation-specific pending and unresolved/retry states; cancellation and explicit return to the original leave task. Include text-preference treatment. |
| V08 — Film result / history | Legible outcome hierarchy, actual-versus-forecast labeling where supported, meaningful explanation and links back to the exact work/people/history. Preserve historical attribution and distinguish unavailable evidence from zero. |

For each board deliver a clean presentation view and an annotated view or annotation overlay. PNG previews must be immediately viewable in the GitHub index. Keep editable source (SVG and/or the HTML/CSS that renders it). ASCII diagrams alone, placeholder rectangles, unrendered source files and a giant prose report do not fulfill the visual deliverable.

Use the reference viewport established by the inspected evidence; 1440×900 is acceptable as an explicitly chosen design canvas, not a claim of the Owner's current setup. Exercise a 1920×1080 larger canvas and a 1280×720 stress canvas on the highest-risk layouts. Demonstrate text scaling up to the reviewed 200% setting without hiding price, blocker or Cancel. Label these prototype configurations, not supported-native-platform claims.

## 6. Annotate enough for a builder to reproduce the design

Give stable screen/component/state IDs. For each major region specify logical-pixel dimensions at the reference size plus anchors, min/max constraints and reflow rules. Document gutters, padding, column behavior, line height, type sizes, button hit areas, panel opacity, hierarchy, layer/input ownership, truncation/wrapping and tooltip placement. Pixel values describe a reference layout; they must not substitute for resizing behavior.

One compact component/token sheet should cover colors with semantic meaning, typography, spacing, borders, icons-with-labels, selection, focus and motion. Record contrast measurements for the proposed key text/control pairs without claiming broad accessibility compliance. Use color redundantly with words/shapes.

Show a component state sheet: idle, hover, keyboard focus, pressed, selected, disabled-with-reason, pending, authoritative success, refusal, disconnected/unresolved, and safe retry. State which elements actually need each state. Microcopy must be written, including full action labels, confirmation consequences, absent-data messages and errors. No lorem ipsum in the decision-critical regions.

Distinguish inspector Open/Locate, routine reversible draft changes, commitment reviews, and destructive actions. Do not make every harmless action a confirmation, or reduce clicks by removing the review of meaningful costs or loss.

## 7. Specify behavior as well as appearance

For important controls map: screen/state → input → action/navigation → expected visible response → what is preserved → cancel/back → stale/pending/refusal behavior → authoritative owner/source.

Cover primary/secondary click, top-layer Escape/Back/Cancel, typing/Enter ownership, panel-scroll versus camera zoom, tool cancellation versus cancellation of already-submitted work, visible focus and return focus. Show that a modal blocks background actions while keeping the lot visually understandable. Supported keyboard/controller mappings may be specified; a mock prototype is not physical-device validation.

Record time-state handling explicitly: whether inspection obscures or preserves the existing time control and which layer owns input. No new auto-pause, simulation cadence, production cancellation or hiring rule is authorized to make the UI easier to draw.

Exercise long names, duplicate names with exact IDs, large lists, no relevant candidates, unavailable records, a moved/deleted target, overlapping constraints, slow responses and returning from a nested profile. Never replace a missing person/project with the next list row.

## 8. Build a small clickable design prototype

Deliver a self-contained `index.html` with bundled styles/images and minimal JavaScript. It should open locally without installing packages, running a game server, logging in or contacting a network. Make only design-state/navigation changes using labeled fixtures; do not recreate the simulation, economy or persistence logic. Add Reset Demo and a discreet always-visible mockup label.

Implement at least these three linked journeys:
1. Lot/film → production state → supported remedy or company profile → Back to the same film/scroll → staged action → pending → success or refusal. Include a no-remedy/waiting branch.
2. Script/casting context → compare candidates → review exact candidate → return to preserved draft → consequence review → staged commit/refusal. A fixture selection is not a real contract.
3. Unnamed progress → leave review → Save As → naming/consequence review → simulated durable receipt OR unresolved timeout/retry → explicit continuation review. Distinguish closing the dialog from canceling a submitted operation.

Render the board previews from the same layout/components where possible so the screenshots and clickable design do not contradict each other. Each visible actionable control in the demo either works as described, opens a clearly labeled static example, or explains that it is outside prototype coverage. Do not use dead buttons that appear functional or success animations standing in for real evidence.

The prototype demonstrates appearance, navigation and interaction intent only. Measure its own layout/focus behavior if useful; do not call it a native usability pass or proof of game performance, hitboxes, controller support, financial correctness or campaign safety.

## 9. Keep the design bold and the implementation plan bounded

Provide the full coherent target rather than restricting every board to today's component limitations. Where a stronger design needs a new safe read model or shared presentation behavior, name that requirement and its owner instead of inventing data or hiding the improvement.

In a compact implementation routing table distinguish:
- visual/presentation-only changes;
- shared navigation/input/preferences work;
- bridge/read-model dependencies preserving gameplay law;
- P13B-owned Laboratory work;
- larger follow-on visual refinements;
- unselected gameplay/future-package features excluded from this proposal.

Map F1–F8 to boards, prototype states and acceptance tasks. Preserve valid current conventions; identify deliberate changes so implementation does not become a wholesale rewrite. Recommend one first vertical slice and a finite integration sequence, but do not schedule it, assign a runtime worker, copy an old phase budget or authorize production edits.

## 10. Inspect the rendered result before declaring it ready

Author first, then run one bounded independent read-only design check (Sonnet where available under the existing review preference; disclose unavailable checker capability rather than claiming a check). No reviewer fleet.

The checker must look at the rendered boards and exercise the standalone prototype, not merely grep prose. Check composition, legibility, consistent components, task clarity, important cost/risk visibility, panel density, navigation, reachable Back/Cancel, text scaling, missing/disabled/pending states, valid routes and source/authority labels. Record concrete issues and repair the final candidate. This is prototype review, never native playtesting.

The pass is not complete merely because F1 is repaired in a mockup. Ask whether a newcomer can identify what is selected, what is happening, what is blocking them, the useful next action and its consequence across the full proposed interface.

## 11. Delivery and publication

Continue the existing review branch. Use one compact design-assets directory under the existing documentation organization; link it from `UIUX-WHOLE-GAME-REVIEW.md`. Preserve the old audit/source appendix and record a clear follow-up/supersession note rather than erasing its evidence limits.

Deliver:
- one GitHub-first visual review index with inline preview images and recommended reading order;
- eight screen-family boards with editable source and annotations;
- the compact component, state and interaction specification;
- the functioning standalone prototype and its short instructions;
- the source-to-design/implementation-routing matrix and bounded reviewer disposition;
- one complete ZIP containing the actual files, with exact reviewed commit, file manifest, byte counts and checksums.

No private Figma/session/Desktop link may be the only way to view essential work. Existing design tools may help but are not a paid-access prerequisite. Do not redistribute fonts or copyrighted manual pages; identify permitted fonts/assets and their provenance. Keep private sessions, credentials, real personal campaign data and machine-specific paths out of published artifacts.

Verify remote head, complete assets, relative links, image previews, local prototype opening and ZIP contents. Do not claim a SHA is embedded in itself; distinguish the content commit from a later index/checksum pin where needed. Do not deliver an empty folder, screenshot generator or promise that the designs will be made later.

Return:
**UI/UX VISUAL BLUEPRINT PUBLISHED — FUTURE OPS / OWNER DESIGN REVIEW REQUIRED**
Exact branch and commit; one visual index; the actual ZIP; the three highest-impact design changes; genuine unresolved product choices only; and an honest list of native checks still pending.

Then stop. Design acceptance, Current Ops scheduling and gameplay implementation remain separate decisions.
