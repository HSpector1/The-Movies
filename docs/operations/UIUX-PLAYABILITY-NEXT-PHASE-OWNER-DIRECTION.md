# Project: Studio — next execution priority: UI/UX, playability and controls

**Date:** 2026-09-12  
**Status:** OWNER PRIORITY REQUEST RECORDED IN CONVERSATION · FUTURE OPS SCOPE RECOMMENDATION · CURRENT OPS SCHEDULING / EXECUTION ORDER REQUIRED  
**Working title:** Playability & Interaction Pass (no new numbered package assigned).

## 1. The Owner's request

The Owner reports that the current game's UI/UX and "buttonology" feel wonky and requests that the next available implementation phase focus on UI/UX, playability and controls.

Treat this as a priority change, not as an optional late-game cosmetic backlog. It does not authorize an uncontrolled rewrite or another agent taking over the current implementation worktree.

**Recommended sequence:** the currently authorized implementation slice reaches a safe closeout/handoff → Playability & Interaction Pass → the next gameplay-system package. Current Ops must confirm the actual active slice and exact safe boundary; do not infer its current status from an old planning branch. In the queue discussed with the Owner, this places the pass before P14 implementation, rather than after P17. If a later slice has already started, identify its safe handoff instead of abandoning or undoing work.

Do not delay an immediately necessary save-protection repair or hide a current acceptance blocker inside this new phase. Do not declare unfinished work accepted just to start the pass.

## 2. Reuse existing work

Reuse the existing P06 Living Studio UX, P09 facility interaction, P10 people/contract routes, P11 executive UX, P12 campaign/Industry navigation, and whatever P13 scope is actually accepted when the pass starts. Locate any existing interaction standards, UX work, open defects and prior critiques before creating duplicate preparation. Earlier UX branches are historical inputs, not automatic authorization to revive their code.

P14 preparation and P15–P17 research corrections may continue under their existing documentation-only authorizations. Do not ask those workers to redesign interfaces concurrently or add this phase to all their assignments.

## 3. Intended player outcome

The player can find the next meaningful action, understand why it is available or blocked, predict its immediate consequence, execute it once, and see a clear result—without needing a coding agent to explain which screen or obscure control to use.

This is an interaction/playability phase with an actual native result, not merely a new palette, more tooltips, a website mockup, or a headless refactor. Preserve the studio-lot experience; drill-down workspaces support it rather than replacing the game with disconnected forms.

The following scope is a Future Ops recommendation, to be bounded against observed friction.

## 4. Audit and correction priorities

### A. Navigation and task location

Make the relationship between lot selections, person/facility/project inspectors and full workspaces clear. Put actions where the player reasonably looks for them. A shortage or blocker should link to its relevant existing resolution route where one exists, then return to the original task. Preserve selection, filters and scroll position when returning from detail views. Avoid adding another hub or parallel route when an existing one can be repaired.

### B. Button behavior and interaction conventions

Use explicit action verbs and distinguish opening a view from committing an action. Standardize primary/secondary/destructive buttons, selection, hover, focus, disabled states and busy feedback. Explain disabled actions with the authoritative reason; do not invent frontend eligibility rules. Make Back, Escape, Cancel and Close predictable, including when an unfinished edit would be lost.

Prevent click-through, accidental duplicate commands, lost focus, overlapping hit targets and misleading selected states. Remove redundant confirmation layers, but keep meaningful protection for destructive actions, material spending, overwriting/deleting campaigns and other consequential commitments. Do not silently execute purchases or bypass a required review to reduce the click count.

### C. Existing end-to-end gameplay

Audit the whole movie-making route: identify/develop a script → review/cast/greenlight → inspect production → resolve an actual blocker → film → post-production → release → understand the result. Use only delivered mechanics; do not fill a missing simulation feature with a fake button.

Also cover existing people/contract tasks, build/facility tasks and the accepted research/adoption route. Clarify which decisions are strategic and which steps are needless navigation. Do not automatically remove production controls that are real game choices.

### D. Information and readability

Make current state, next action, due date and important constraints easy to see. Standardize terminology, dates, money, status labels, spacing, text hierarchy and error wording. Show detailed evidence on demand without forcing the player through it on every routine action. Check the supported window sizes, large-text settings and long names.

### E. Feedback and perceived responsiveness

Give immediate truthful acknowledgement of input, visible pending state, and an unambiguous success/refusal/failure result. Do not falsely show a save or purchase as complete before it is. Prevent repeated clicks from producing repeated effects. Measure interactions that feel unresponsive; address demonstrated bounded UI/bridge issues, not an unrelated optimization campaign. Preserve unresolved save/load and reconnect qualifications from prior handoffs.

### F. Campaign and input consistency

Verify New Game, Load, Save, Save As, switch, Quit and relaunch through the real client. Keep Save As isolation and protection against accidental overwrite. Check the currently supported mouse/keyboard/controller routes; do not assume unsupported hardware is implemented. One designated native-input owner controls the test session.

## 5. Outcome-first execution and acceptance

Start with a bounded native audit of the exact authorized build. Record the principal task, start state, route, action count, wrong turns, unclear/disabled actions, input failures and task result. Separate observed defects from proposed improvements. A brief targeted recording from the Owner is useful but is not a prerequisite to the agent auditing routine journeys.

Select the highest-friction real journey for the first visible improvement. Show the before-and-after journey in the native client, including a blocked-action case. Then apply the established interaction conventions to the remaining agreed high-priority journeys. Do not build a new universal UI framework before demonstrating a better task.

Retain three product critiques: early improved journey, completed interaction core, integrated ready scope. Review actual screens and tasks. Correctness review separately checks that the new interface preserves commands, money, identity, production state, scheduling, persistence and disclosure law.

Acceptance requires:

- The agreed journeys can be completed without undocumented instructions or an agent narrating where to click.
- High-frequency paths eliminate the observed unnecessary detours; compare measured before/after routes rather than declaring an arbitrary universal two-click target.
- Primary actions, back/cancel behavior, disabled reasons and pending/success/error feedback are consistent.
- No duplicate spending, missing effects, accidental click-through or invisible state changes.
- Supported navigation and large text work across the delivered scope.
- Save/load/Save As/restart behavior remains correct, and existing gameplay checks still pass.
- The Owner judges the integrated game materially easier and more enjoyable to operate. Remaining exclusions and known issues are explicit.

Routine evidence gathering and fixes proceed within the execution order; do not turn every small control adjustment into an Owner checkpoint. Scope changes that alter gameplay law or erase a selected feature must be surfaced explicitly.

## 6. Ownership and safety

Current Ops chooses the implementation owner and exact runtime/build baseline, including separate TypeScript, Unity source/build, evidence, schema/save/projection and campaign-library identities. Use one builder and one native-input owner; no concurrent interference with an active runtime worker.

Use disposable engineering campaigns or explicitly authorized copies. Do not overwrite, delete, rename or use the Owner's active campaigns as fixtures. Preserve campaign isolation and historical data. No hook activation, engine migration, broad economy retune, new gameplay package, protected-ref promotion or main merge is implied by this note.

Bounded shared-component/bridge changes are permissible only in the subsequent execution order and must preserve the existing authoritative owners. Cosmetic work must not disguise changes to contracts, finance, production or research rules.

## 7. Publication and downstream handoff

Current Ops should publish this priority and the bounded execution plan through the repository's existing documentation conventions, on an owned documentation branch, with one commit-pinned entry point. Keep selected Owner direction distinct from recommended scope and provisional budgets. Do not create another large research hierarchy.

The execution plan must name scope/exclusions, exact baseline, first native result, acceptance journeys, regression checks, evidence capture, execution ceiling and protected verification reserve. Do not mechanically copy another phase's budget or promise a completion time.

After the UX pass is accepted, P14 and subsequent launch preparation must refresh against the accepted **post-UX** runtime/client contracts—not only against the earlier P13 state. Refresh touched surfaces and source references; retain the already-completed research.

## 8. Source references and publication status

- Historical UX lineage, not current execution status: `HSpector1/The-Movies`, commit `13370d428f0693f3279732f6f4cc360a7fcaa4df`, `docs/operations/PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md`, P06 and P11 entries.
- Current-conversation P14 preparation reference: `8ef5246aec115cc32d01d9fb8c916e3538342dca`; documentation, not a newly accepted runtime build.

This is the GitHub publication of the revised priority note already delivered to the Owner. Publication branch: `docs/uiux-playability-priority-01`; exact documentation parent: `8ef5246aec115cc32d01d9fb8c916e3538342dca`. That parent is documentation ancestry, not a newly selected runtime/build baseline. The earlier failed publication attempt made no repository changes. This publication records the priority and recommended scope only; it does not assign a worker, start native input, authorize gameplay implementation, or confirm that Current Ops has scheduled the pass. No PR, merge or protected-ref promotion is implied.
