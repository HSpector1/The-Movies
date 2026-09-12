# Playability and controls: comparator research and recommended interaction standard

**Date:** 2026-09-12  
**Status:** FUTURE OPS RESEARCH / RECOMMENDATIONS ONLY. No execution order, gameplay change, native-input authorization, or new numbered package.  
**Read with:** [Owner priority note](./UIUX-PLAYABILITY-NEXT-PHASE-OWNER-DIRECTION.md).

## 1. Decision summary

Use the original The Movies as the interaction anchor: a studio the player operates through its people, projects and facilities, with deeper management workspaces where comparison really needs space. Borrow complementary patterns from RollerCoaster Tycoon 2, Anno 1800, Two Point Hospital and Planet Zoo. Do not copy any title wholesale or treat popularity as measured proof of usability.

The recommended principle is **world-first, not world-only**. Keep strategic depth; remove unnecessary navigation, memory work and input ambiguity. A new palette or rounded buttons alone cannot solve a broken task route. Conversely, a functional interface need not look like office software: preserve studio identity and atmosphere without making decoration compete with reading or clicking.

The product questions are: what is selected, what is happening, what is blocking progress, what can the player do, what will the action change, and did it succeed?

## 2. Method and limits

External findings below come from official manuals, developer articles and dated developer update notes, not an asserted hands-on comparative playtest. The Movies manual's printed pp.4-9 and 12-13, and RCT2 manual's pp.14-15, 20-21 and 44-45, were inspected as rendered PDF spreads as well as extracted text. Sources and exact locators are in section 9.

The cited release notes establish particular shipped changes, not that the entire current game is bug-free or objectively the genre's best interface. Accessibility guidance is a design reference, not a claim of project compliance.

No running Project: Studio build, Unity source, user save, personal campaign or active implementation worktree was inspected or modified for this research. The Owner's reported friction is real input, but individual current-screen defects still require an authorized native audit. All examples below are proposed interactions, not invented observations or new simulation commands.

The existing priority branch was read at 40946af84569ed68853eaea28a9f4c8ae21702a4 before this publication. That is documentation ancestry, not a runtime baseline.

## 3. Evidence-to-decision table

| Reference | What the source establishes | Recommended transfer to Project: Studio | Limit / do not copy |
|---|---|---|---|
| The Movies official manual [S1] | People/movie cards expose activity and production state; bubbles prioritize information; optional guidance streams suggest next actions; facilities anchor casting and release. Some drag actions are unavailable while paused. | Persistent project/people access, compact state-first inspectors, contextual routes and optional next-step guidance. | Do not require precision dragging or pause restrictions merely for fidelity. Preserve present time law until separately authorized. |
| RCT2 official manual [S2] | Shared window conventions; list entries open their entity windows; park entrance and toolbar reach the same Park Information window; cash opens finances; recent messages remain accessible. | Local and global routes reach one consistent inspector. Summary figures lead to their explanation. | Not an instruction to recreate tiny icons or stacks of overlapping windows. |
| Anno 1800 UI developer article [S3] | The team prioritizes functional task flow before ornament, grouping related production-chain information to reduce window-hunting. | Organize around player tasks rather than internal subsystem names. | Clean does not mean featureless, and this article is design intent rather than a timed usability study. |
| Anno 1800 Update 7 [S4] | Trade menus were changed to stay open after purchases; jump-to controls, Escape behavior and contextual information were improved. | Preserve context during repeated work; make Back and Locate reliable. | Do not carry over trade or construction gameplay as new scope. |
| Two Point Hospital Room Templates [S5] | Developer interview explains saving and reusing room layouts to avoid repeatedly rebuilding solved arrangements. | Preserve filters and setup; evaluate reuse affordances only for genuine repeated tasks. | A new template platform is not a first-checkpoint dependency. Reused choices still need current legality and cost checks. |
| Planet Zoo developer updates [S6] | Diagnostic heatmaps, optional urgent-alert presentation and category controls; a later fix routed cleanliness alerts to the matching heatmap. | An alert should reveal the right cause and place. Diagnostic overlays are purposeful, optional views. | No permanent rainbow lot, routine alert flood or invented diagnostic data. |
| Xbox Accessibility Guidelines [S7-S9] | Consistent navigation, visible focus confined within dialogs, and alternatives to demanding input gestures. | One documented input contract across supported controls. | This is not authority to claim unsupported devices work or expand into a new platform port. |

These observations support a design direction, not a claim that copying their visuals will reproduce their results.

## 4. Reuse the project's existing work

The August 24 world-first blueprint at e3f51086f070fa06447be11a17e0673f2cbb11ac already recommends world-first rather than world-only interaction. The hiring companion recommends a retained-lot dossier, deliberate comparison workspace and cost beside ability. These are historical research inputs, not accepted-current-code descriptions. Their old runtime assumptions, CP9 sequencing, example fields and numeric offers must not be revived without refresh. [P1-P2]

The new pass should audit where that intent is already delivered, where later additions fragmented it, and where a new bounded interaction is needed. Do not build another navigation framework because an earlier branch used different filenames. Do not restore every earlier mockup literally.

## 5. Recommended interaction standard

All of this section is Future Ops recommendation, to be checked against actual native tasks.

### 5.1 Three levels, with stable return context

**At a glance:** the lot remains the normal operating view. Persistent date/time controls, cash and compact project/people access remain easy to find. A small number of high-value attention items expose exceptions. The selected object has a clearly distinguishable outline/marker and name.

**In context:** selecting a person, project or facility opens the same entity inspector regardless of whether the entry was a world object, roster/list row, project card or notification. Put identity, current state, actual blocker and useful next action first. A selection click never spends, signs, fires or advances time.

**In depth:** comparisons, multi-role casting, contract consequences, finance and historical analysis can use larger workspaces. Keep task and subject identity visible. A detail excursion must not discard the originating project's draft, scroll, filters, selection or camera state. The same inspector should not be duplicated into contradictory world and management versions.

The layout is a hierarchy, not three mandatory clicks for every action. A routine reversible assignment can act from the inspector when its consequences are already clear. A costly/destructive action still gets the existing authoritative review-and-commit step.

### 5.2 Cards should carry state, not just names

For a project, recommend: title, phase, active/blocked/ready state, next relevant date where supported, one primary contextual verb, and access to details. Show an actual reason such as an occupied resource rather than a generic unavailable label. For a person: name, profession, availability/current assignment, relevant player-visible ability and cost when considering a legal offer. For a facility: function, actual occupancy, construction/operational state and lawful local actions.

Do not fabricate a future completion date when the engine only supports a conditional estimate. Distinguish guaranteed dates, estimates and unresolved scheduling. Do not show backend receipt ids, schema versions or invariant language on routine player screens.

### 5.3 A blocker should carry a route, not just an error

Use **cause -> relevant object -> available remedy or honest explanation**. A blocked project may link to its occupied stage, scheduling sheet or assignment route if the accepted system actually exposes one. If the lawful choice is to wait, disclose what it is waiting for. Do not introduce a fake Assign Director command for a production whose cast is already locked, and do not automatically hire, build or spend to make a warning disappear.

Aggregate repeated downstream symptoms around the real cause where the source model supports it. One occupied resource affecting several productions should not generate an unrelated-looking error for each screen.

### 5.4 Exact controls must have a contract

| Input / state | Recommended behavior |
|---|---|
| Primary click in neutral world mode | Select/inspect the pointed object. No automatic commitment. |
| Primary action button | Name the verb and object. Preview/review material consequences before the existing commit. |
| Escape / visible Back or Cancel | Operate on the topmost transient layer or active placement tool first. Warn before discarding meaningful edits; never silently discard or commit. Only open the pause/menu layer when no nearer layer owns the input. |
| Secondary click | Cancel an active placement/targeting tool; in neutral mode a context menu may be evaluated if it adds value. State-specific behavior must be visible and consistent; no secondary-click deletion. |
| Mouse wheel | Scroll the hovered panel OR zoom the lot, never both from one event. |
| Drag-and-drop | Optional accelerated route where lawful; show valid targets and preview. Provide a click/select equivalent using the same legality and commitment rules. |
| Keyboard/controller focus | Clearly visible, predictably ordered, confined to an active modal. Restore the originating focus when returning. No invisible button activation behind an overlay. |
| Text entry / Enter | Text-entry state owns keys; completing a name must not accidentally advance time or buy/sign something. |
| Repeated click / pending command | Acknowledge the accepted input and show pending state. Do not dispatch a second purchase/save because the first is slow. Failure leaves an explicit safe retry path. |
| Time controls | Show current pause/advance state and the existing law for when actions apply. A label or UI convenience must not change simulation cadence. |

Specific bindings remain audit-time recommendations. Preserve learned safe bindings unless a change is justified; remapping and correct prompt labels are preferable to undocumented shortcuts. Clickability, selected state, disabled state and focus should be distinguishable without color alone. Drag cancellation must be safe.

### 5.5 Attention should teach priority

Propose three presentation levels using the existing attention machinery where possible: information (recorded, grouped, noninterruptive), action needed (persistent while unresolved, exact destination), and imminent material risk/deadline (prominent, with pause behavior explicitly governed). An urgent item should not be dismissed permanently while still actionable; completed items should not keep demanding attention.

A diagnostic overlay should answer a specific supported question such as which stages are occupied or which facilities provide a capability. It should open from the associated problem, include labels/legend, and close back to the normal lot. Do not require a heatmap subsystem when highlighting the exact existing object suffices.

### 5.6 Teach the grammar once, in the real task

Recommend short, state-derived, dismissible guidance attached to the first real workflow: select the subject, inspect relevant facts, review a meaningful commitment, perform it, observe change. Offer a discoverable What's next? or explanation route without requiring a runtime adviser/LLM or an automatic optimizer.

Reveal detail when needed; do not hide high-impact costs or risk behind Advanced. Founding can have limited guidance without withholding the same legal controls from experienced players. Teach how to find a reason rather than walking players through a brittle sequence of exact pixel clicks.

### 5.7 Preserve charm without losing readability

Recommend readable high-opacity decision surfaces, consistent typography, portraits matched to people, restrained studio-era motifs and brief acknowledgement sounds/animations. Distinguish state with labels and shapes as well as color. Avoid ornamental transitions that block input, a single paragraph containing all stats, and icon-only actions whose meaning must be memorized.

This is not authority for an art overhaul, new portrait generation, soundtrack system, PA narrator or theme switch per era. Use existing assets and conventions first.

## 6. Suggested first journeys (illustrative; validate available actions)

**J1: understand and progress a production.** Start at the lot; select a film via its card or actual location; identify phase and blocker; follow a link to the exact resource or existing scheduling/assignment action; resolve or understand the reason to wait; return with the original project still selected; observe the resulting authoritative state. Check a no-remedy case too. Compare against the same start state on the baseline.

**J2: choose talent without losing the project.** From a legal casting/hiring context, browse candidates with a persistent selected-person detail. Show player-visible skills, relevant availability, and actual offered cost together. Compare a small number without tab-hopping. Return to the draft without losing previous decisions. Complete one lawful commitment; show both the roster and world result. No future P14 proposal law is imported into this UX pass.

**J3: place a facility safely.** Open the current build catalogue, choose a supported item, see footprint and real cost, test valid/invalid placement and explanatory blockers, cancel with no charge, place once through the accepted action, and show construction versus operational state honestly. Repeated placement or copy is optional, not assumed scope.

**J4: resume and preserve a campaign.** Identify the active campaign name; inspect without advancing it; Save, Save As, Load, switch and return through authorized disposable fixtures. Distinguish saving/persisted/error and original/copy clearly. Never treat the Owner's live library as the test fixture.

The accepted research/adoption route becomes J5 if delivered by the pinned execution baseline. Do not invent technology progress merely to demonstrate a new screen.

## 7. Evidence to collect before and after

Record exact native build/source identities and starting state. For each agreed task, separately measure completion without coaching, time to find the action, wrong turns/backtracking, screen transitions, ambiguous/refused inputs, and waiting attributable to computation/storage. Count unnecessary interactions rather than minimizing every interaction indiscriminately.

Ask the tester to explain selected subject, present state, main blocker and expected consequence before pressing the primary action. Record mistakes rather than explaining them away. Re-test after a brief break to distinguish learned sequence memorization from understandable navigation.

Exercise supported resolutions/large text, long names, crowded lists, modal/focus transitions, scrolling over the UI, fast repeated clicks, slow responses, cancellation and stale-state refusal. Gameplay regressions remain a separate correctness gate.

Success means the agreed journeys are independently understandable, navigation/context are retained, meaningful choices remain, and no safety or truth invariant is lost. No percentage improvement or elapsed execution promise is asserted by this research.

## 8. Recommended bounded sequence and non-goals

First inspect delivered routes and observe friction. Then improve one end-to-end native journey and its highest-frequency shared controls. Only then extend the pattern to the remaining agreed journeys and add narrowly justified convenience features. Keep the three product critiques and separate correctness review from the priority note.

Do not start with: a replacement engine, a universal UI framework, a fresh full-screen management hub, dozens of radial menus, new production automation, new economic rules, a template platform, an LLM adviser, a giant tutorial rewrite, or visuals pretending a missing feature exists.

Current Ops selects the safe handoff, actual runtime/Unity build, owned worktree, execution ceiling and verification reserve. One builder and one native-input owner. Research publication does not assign them or authorize game launches. Preserve ongoing worker ownership and the explicit-checker fallback. Subsequent package preparation consumes the eventual accepted post-UX handoff.

## 9. Sources and retrieval

Accessed 2026-09-12. Dated sources are used for documented behavior at those dates, not as exhaustive claims about the latest editions. No copyrighted manuals are republished.

- **S1 — The Movies, official PC manual (2005).** https://store.steampowered.com/manual/7900/ . Printed pp.4-9 (HUD, cards, bubbles, guidance, controls) and 12-13 (casting/shooting/release). The PDF is spreads: PDF indices 2,3,4,6 respectively. Rendered spreads inspected. High confidence in documented controls; no timed usability comparison.
- **S2 — RollerCoaster Tycoon 2, official manual (2002).** https://store.steampowered.com/manual/285330/ . Printed pp.14-15 Common Window Elements/Main View, 20-21 Management/Finance/Messages, 22 Park Information, 44-45 entity lists. Rendered PDF indices 7,10,22 inspected. High confidence in documented routes.
- **S3 — Ubisoft Blue Byte, Anno 1800: DevBlog User Interface, 7 June 2018.** https://www.anno-union.com/devblog-user-interface-2/ . Sections UI and UX in a nutshell, The Anno 1800 UI design, Let's start creating. Primary developer design rationale, not proof of all shipped behavior.
- **S4 — Anno 1800 Game Update 7, 24 March 2020.** https://www.anno-union.com/updates/game-update-7-march-24-2020/ . Improvements to trade menu retention, Escape, jump-to controls, filter tips and text input. Primary published patch notes.
- **S5 — Two Point Studios, Room Templates DEEP DIVE, body dated 29 July 2020 (site migration metadata 18 January 2022).** https://community.twopointcounty.com/two-point-studios/two-point-hospital/blogs/9-room-templates-deep-dive . Interview with senior UI/UX designer Lauren Woodroffe and programmer James Gilby, Why room templates? and workflow sections. Primary developer explanation.
- **S6 — Frontier Developments, Planet Zoo official Steam update feed.** https://store.steampowered.com/news/posts/?appids=703080&enddate=1582113657&feed=steam_community_announcements . Update 1.1.0, 17 December 2019, UI section (maps, high alerts, category controls, HUD-to-map); Update 1.1.4, 11 February 2020, UI section (matching cleanliness map). Primary developer release notes.
- **S7 — Microsoft Xbox Accessibility Guideline 112, UI navigation.** https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/112 . Implementation guidelines: consistency, multiple routes, layout/focus ordering and input alternatives.
- **S8 — Microsoft Xbox Accessibility Guideline 113, UI focus handling.** https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/113 . Implementation guidelines: visible focus, no hidden focus and modal confinement.
- **S9 — Microsoft Xbox Accessibility Guideline 107, Input.** https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/107 . Implementation guidelines: single-input alternatives, remapping, path-based gestures and pointer activation.
- **P1 — Existing Project: Studio world-first blueprint.** https://github.com/HSpector1/The-Movies/blob/e3f51086f070fa06447be11a17e0673f2cbb11ac/docs/design/CODEX-WORLD-FIRST-INTERACTION-BLUEPRINT-01.md . Decision and sections B-C. Historical research only; its implementation assumptions are not current authority.
- **P2 — Existing hiring-candidate UX study.** Commit e3f51086f070fa06447be11a17e0673f2cbb11ac, docs/design/CODEX-HIRING-CANDIDATE-REVIEW-UX-01.md. Direct-answer and retained-lot dossier sections. Historical recommendation, not a shipped-surface claim.

## 10. Status

Research complete for this bounded comparator pass. Remaining work is task-specific native observation and execution scoping, not a new broad genre survey. Publication is confined to the existing documentation branch. No new gameplay, native input, user campaign mutation, hook change, merge or production promotion is authorized by this document.
