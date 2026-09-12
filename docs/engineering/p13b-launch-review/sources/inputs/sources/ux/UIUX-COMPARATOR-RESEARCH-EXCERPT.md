# Exact selected excerpts — UI/UX comparator research

**Source:** HSpector1/The-Movies, commit `fe4d22ce60505ccce27543d7201c69d46d42a368`, `docs/operations/UIUX-PLAYABILITY-COMPARATOR-RESEARCH.md`. Source Git blob: `9e64d588ef90d40bef6f3e4e143240a4bb3a3581`.

**Status:** selected text excerpts, NOT the full file. Source headings identify the extracted passages below. This copy is an input to preparation, not new Owner law or current-build observation. The earlier research's source checks were not repeated in assembling this packet.

Full pinned source:
https://github.com/HSpector1/The-Movies/blob/fe4d22ce60505ccce27543d7201c69d46d42a368/docs/operations/UIUX-PLAYABILITY-COMPARATOR-RESEARCH.md

## Source §1 — Decision summary

Use the original The Movies as the interaction anchor: a studio the player operates through its people, projects and facilities, with deeper management workspaces where comparison really needs space. Borrow complementary patterns from RollerCoaster Tycoon 2, Anno 1800, Two Point Hospital and Planet Zoo. Do not copy any title wholesale or treat popularity as measured proof of usability.

The recommended principle is **world-first, not world-only**. Keep strategic depth; remove unnecessary navigation, memory work and input ambiguity. A new palette or rounded buttons alone cannot solve a broken task route. Conversely, a functional interface need not look like office software: preserve studio identity and atmosphere without making decoration compete with reading or clicking.

The product questions are: what is selected, what is happening, what is blocking progress, what can the player do, what will the action change, and did it succeed?

## Source §5.1 — Three levels, with stable return context

**At a glance:** the lot remains the normal operating view. Persistent date/time controls, cash and compact project/people access remain easy to find. A small number of high-value attention items expose exceptions. The selected object has a clearly distinguishable outline/marker and name.

**In context:** selecting a person, project or facility opens the same entity inspector regardless of whether the entry was a world object, roster/list row, project card or notification. Put identity, current state, actual blocker and useful next action first. A selection click never spends, signs, fires or advances time.

**In depth:** comparisons, multi-role casting, contract consequences, finance and historical analysis can use larger workspaces. Keep task and subject identity visible. A detail excursion must not discard the originating project's draft, scroll, filters, selection or camera state. The same inspector should not be duplicated into contradictory world and management versions.

The layout is a hierarchy, not three mandatory clicks for every action. A routine reversible assignment can act from the inspector when its consequences are already clear. A costly/destructive action still gets the existing authoritative review-and-commit step.

## Source §5.3 — A blocker should carry a route, not just an error

Use **cause -> relevant object -> available remedy or honest explanation**. A blocked project may link to its occupied stage, scheduling sheet or assignment route if the accepted system actually exposes one. If the lawful choice is to wait, disclose what it is waiting for. Do not introduce a fake Assign Director command for a production whose cast is already locked, and do not automatically hire, build or spend to make a warning disappear.

Aggregate repeated downstream symptoms around the real cause where the source model supports it. One occupied resource affecting several productions should not generate an unrelated-looking error for each screen.

## Source §5.4 — Exact controls must have a contract

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

## Source §7 — Evidence to collect before and after

Record exact native build/source identities and starting state. For each agreed task, separately measure completion without coaching, time to find the action, wrong turns/backtracking, screen transitions, ambiguous/refused inputs, and waiting attributable to computation/storage. Count unnecessary interactions rather than minimizing every interaction indiscriminately.

Ask the tester to explain selected subject, present state, main blocker and expected consequence before pressing the primary action. Record mistakes rather than explaining them away. Re-test after a brief break to distinguish learned sequence memorization from understandable navigation.

Exercise supported resolutions/large text, long names, crowded lists, modal/focus transitions, scrolling over the UI, fast repeated clicks, slow responses, cancellation and stale-state refusal. Gameplay regressions remain a separate correctness gate.

Success means the agreed journeys are independently understandable, navigation/context are retained, meaningful choices remain, and no safety or truth invariant is lost. No percentage improvement or elapsed execution promise is asserted by this research.
