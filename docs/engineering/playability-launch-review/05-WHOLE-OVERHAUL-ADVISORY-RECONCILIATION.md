# Current Ops — full-overhaul coverage and corrected advisory

**2026-09-13 · DOCUMENTATION / DESIGN-ACCEPTANCE DISPOSITION ONLY.** Incorporate into the existing Playability plan and its J1–J7 / C1–C5 coverage register. This is not another design project, runtime order, native acceptance or budget extension. No worker is notified or interrupted by publication.

## 1. Controlling sources and scope

The [Owner full-overhaul direction and §8 choices](https://github.com/HSpector1/The-Movies/blob/f2921730a6ff6cb5f0b8e952995978a8ecb8407f/docs/operations/UIUX-WHOLE-GAME-OVERHAUL-OWNER-CLARIFICATION.md) control. Read the [corrected advisory](https://github.com/HSpector1/The-Movies/blob/ba3854108bfe86b81f0ed4d5259c96101d89c887/docs/operations/uiux-opus-advisory-20260913/RECONCILIATION-01.md), not the superseded original findings. The latest Future Ops → Current Ops transmittal further corrects residual language about identical navigation steps, universal undo, first-visit hints and current-state cues versus event history; those dispositions are recorded below, not silently attributed to the reviewer.

Retain R3 HYBRID, the selected Backlot language, people left / pictures right / useful lot center, the existing designer and implementation owner, and the [existing continuation order](04-R3-HYBRID-EXECUTION-ORDER.md). The earlier 72/24 proposal and an F1–F8-only or main-screen-only endpoint do not define completion. All delivered player-facing surfaces need an explicit **redesign**, **refine**, or **retain because demonstrated to meet the shared standard** disposition. A passing happy-path screenshot or an unchanged screen opening is not that demonstration.

The advisory measured the R3 browser prototype. Its corrected geometries, key counts and canvas text estimates are not measurements of the current native game. Current Ops has read the documents; it has not rerun those prototype measurements or a native audit here. Native evidence remains required. No original failed finding is resurrected to manufacture work.

## 2. Existing coverage register — incorporated findings

Keep the source IDs below and link their evidence into the existing J/C rows. These are domain-level dispositions, not a claim that the exact live screen inventory is already complete.

| Source item | Existing coverage | Current Ops disposition | Required return / owner |
| --- | --- | --- | --- |
| R3-1 list keyboard navigation | Studio home; J1/J2/J7, C1/C5 | Support efficient list-level keyboard focus, not a mandatory Tab stop for every row. R3 already has arrows and 1/2 shortcuts; do not describe it as lacking all keyboard support. Keep tabs, search, filter, Find, paging, library, inspector and global tools reachable. Focus and selection remain distinct. | Existing designer specifies native-equivalent behavior; implementation/input owner proves entry/exit, row traversal, both lists' scroll and invoking focus, live updates and missing targets. No DOM/tabindex implementation requirement is imposed on Unity. |
| R3-6 / NEW-1 inspector coverage | Studio home, People, Buildings; J1/J2/J4/J7 | Preserve exact selected context and reachable global tools at supported sizes. Resolve tool overlap and compact/enlarged inspector obstruction through the selected layout, not an automatic camera move or universal new inspector. | Existing designer supplies affected compact/expanded states; native lead demonstrates exact target/Locate/Back, usable tools and no clipped critical content. Prototype percentages do not become native measurements. |
| R3-7 studio name / timeline | Studio home / HUD; J7 | Give studio identity and timeline non-overlapping layout regions; preserve readable date and current-time meaning. Do not carry the advisory's isolated 12px CSS suggestion as the text rule. | Test actual resolved font, long names, default/enlarged settings and supported viewports. No name/year overprinting. |
| R3-5 text / scaling | Visual system; all J1–J7, C5 | Apply the rendered-output target in §3 across HUD, rails, inspectors, dialogs, workspaces and tools. No fixed small-text island and no relabelling selective Enlarged as full scaling. | Designer supplies reflow; native lead records rendered text measurements, resolved fonts/backing scale, reachable costs/reasons/Cancel and no lost meaning. |
| R3-2 scrolling | Studio home / J7 | **WITHDRAWN as a demonstrated defect.** Preserve the working common scroll/range/page source. Partial-row wording is optional. | Normal regression coverage only; no mandatory scrolling rewrite or claim the withdrawn bug was fixed. |
| R3-3 / R3-4 / R3-8 / R3-9 / R3-10 | Studio home / Visual system | Visible filter variants, shelf symmetry, row compression, genre tint and token-style preferences are not automatic requirements. | Existing designer may justify a change within selected direction; no new hybrid vote, mandatory matching shelves or speculative defect. |
| NEW-2 two-axis scrolling | Readability / J7 | Retain the demonstrated prototype pass as prototype evidence only. | Verify native reflow independently; do not copy its PASS into native acceptance. |

These findings join the full eight-domain coverage below; they do not replace it:

| Owner coverage domain | Existing register mapping | Coverage retained |
| --- | --- | --- |
| Studio home / HUD / tracking | J1/J2/J7 | Early/busy home, both lists, current attention, search/filter, live updates, history and useful lot. |
| Complete movie-making journey | J1/J5 | Development through casting/greenlight, scheduling, blockers, filming, Post, release and results/history. |
| People / casting / contracts / assignments | J1/J2 | Exact identities, portraits, comparison/drafts, availability, employment versus assignment and lawful reviews. |
| Buildings / lot tools / delivered Laboratory | J3/J4 | Placement, construction, operation, existing research and installation; no P13B mechanics. |
| Finance / Industry / records / outcomes | J5 | Periods, comparisons, estimates, public/private boundaries and retrievable historical attribution. |
| Menu / campaigns / settings / help | J6/J7 | Entry, resume, save/copy/load/switch/quit, settings scope, contextual help and unresolved recovery. |
| Shared controls / navigation / feedback | J7 and C1–C5 | Desktop/trackpad, keyboard completeness, optional lawful drag/drop, supported controller preservation, modality and context. |
| Visual system / readability / guidance | All J rows | Shared Backlot treatment, completed layout/state coverage, portrait/icon/stage-art/font treatment, scaling and contextual explanation. |

Each actual screen/state entry must identify source/owner, disposition and rationale, exact visual reference, behavior, data/command dependency, native acceptance evidence and remaining gap. Reuse existing row IDs and append evidence; do not replace this with another independent backlog. Retained surfaces need experience evidence, not novelty edits.

## 3. Readability disposition — XAG 101 target adopted

**Current Ops adopts the default PC rendered-text target for this overhaul; this is not a new Owner vote or a claim of compliance.** Microsoft XAG 101 specifies rendered glyph body height of at least 18 pixels at 1080p and 36 pixels at 4K for PC. Measure native screenshots, not CSS/USS font-size declarations. Body height includes ascenders, x-height and descenders; use the guideline's pixel/contrast measurement procedure. Retain full 100/150/200% scaling without lost meaning or controls. Record actual output resolution, OS/backing scale and resolved/fallback font; declare intermediate/windowed-size treatment rather than inventing an XAG number. Other accessibility requirements are not certified by this text-size check. Source checked 2026-09-13: https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101

Do not import XAG console/VR certification or a controller-first redesign. The DOM examples and XAG navigation references describe behavior, not a requirement to replace the native framework. No font files are supplied by this packet; licensed asset availability and fallback remain explicit design/native dependencies.

## 4. Owner 1A / 2B / 3A / 4B — operational reconciliation

**1A: desktop/laptop first.** Mouse, complete keyboard routes and usable trackpad interaction are the priority. Keep existing supported controller routes compatible, without assigning a new console port. Inventory camera-versus-panel gesture ownership, drag threshold and alternatives to middle-button-only navigation. Do not silently introduce automatic edge-pan or simulation pause. Existing designer/input owner resolves gestures against real supported controls.

**2B: optional lawful drag-and-drop is selected for players, not optional for the team's scope register.** Inventory useful routes against existing lawful ordinary commands. Drag may remove unnecessary navigation; preserve the exact identity, legality, meaningful consequence and required commitment review, **not every ordinary click or screen**. Reject the advisory's 'never fewer steps' interpretation. No universal undo or 'commit now and undo later' substitute for a required review is authorized.

For each proposed drag route record source/target ID, ordinary click/keyboard equivalent, legal command owner, valid-target preview, drop-time recheck, consequential review, pending/refusal/receipt, invalid/outside drop, Escape and stale/missing-target behavior. Keep non-drag paths complete. Inspection/draft rearrangement is not permission to hire, assign, cast, spend or advance time. A missing lawful command is a named dependency, not permission to invent one. Proposed person→facility, person→picture, script→stage, candidate→comparison and catalogue→lot routes remain candidates until this check; their list is not blanket activation. No second mutation authority, optimistic success or generic undo history.

**3A: embedded/on-demand contextual explanations.** Use clear labels, blocker reasons, keyboard-focus/hover information, meaningful empty states and discoverable per-screen help. No guided first-film flow, forced tutorial, automatic first-visit popup or new hint-choice vote is required. Remove that advisory open question from the blocking decision list. Essential routes must work without a narrator or tutorial. Unknown dates/remedies remain unknown rather than invented help text.

**4B: selective current attention plus retrievable outcomes.** Current badges answer what needs attention now and may clear when resolved. Event/operation history answers what happened and must not disappear merely because a badge clears. Use existing authoritative events, receipts, Records/History and exact-object links; keep pending/unresolved operations recoverable through their original request owner. Inventory any important outcome with no retrievable existing source as a data/contract dependency. Do not infer durable event history from current-state badges, fabricate missed events, delete evidence, or create an unapproved journal writer/schema. Four fixed labels, a new alert sound and a particular journal layout are design proposals, not additional Owner selections. Routine progress remains quiet; no automatic pauses or changed gameplay deadlines.

## 5. Design/implementation staging and budget reconciliation

Retain one continuing implementation/native-input owner: the existing VS Code task **Read P13A source packet**. The existing designer completes affected rendered layouts/shared states and asset treatment on its owned work; Future Ops conveys choices through this plan. The independent reviewer stays stopped. No duplicate designer, broad research round, new runtime worker or immediate terminal prompt follows from this advisory.

Use these stages within the full overhaul, not as separate replacement projects:

| Stage | Required outcome and handoff |
| --- | --- |
| Selected studio experience | Preserve useful ongoing R3 work. First native review includes both rails, useful center, exact person/picture action and wait, and both-list scroll/focus return. A strip-only increment is not stage or whole-upgrade completion. |
| Shared visual/interaction system | Existing designer supplies remaining materially different layouts/risky states, full text behavior and representative portrait/font/icon treatment. Inventory and review lawful drag routes, contextual-help placement and attention/history sources. Repeated states use shared sheets, not a gallery of duplicates. |
| Full-domain adaptation | Redesign/refine/retain every delivered surface against the common standard. Carry approved art/portraits and remaining-family treatments to their declared finished coverage; a six-person sample proves a standard, not that all population art is finished. No permanent incompatible legacy islands. |
| Integrated verification and delivery | Three product critiques overall; separate C1–C5, identity/finance/persistence, matched performance and native rendered/input evidence; full workflow and art-coverage statement; Howard's new integrated verdict. No reuse of P13A KEEP as this verdict. |

**Budget status must stay honest.** The original 72 total / 24 reserve proposal is superseded. Order04 records the latest issued continuation envelope as **108 cumulative productive hours = 72 capability + 36 protected reserve**, including work already consumed. It was sized for the R3 continuation and is not evidence that all newly clarified whole-overhaul work fits. This note neither resets that ledger nor authorizes more hours, capability, native input or a new execution clock.

At the next existing safe coordination checkpoint, reconcile actual work/remaining coverage jointly with the current designer and implementation lead. Price separately: remaining layout/state design; native shared components and surface adaptation; desktop/trackpad/keyboard and lawful drag routes; help and outcome retrieval; full scaling; portrait/icon/font finishing and coverage; data-contract dependencies; integration, product critique, performance/correctness and delivery reserve. Deduct already completed reusable work and charge existing time once. Return a reasoned replacement inclusive ceiling/reserve or explicit staged authorization when the remainder exceeds current authority. Do not silently make required art/help/drag/screen coverage optional to fit 108, and never spend verification reserve on unbuilt capability.

Actual cumulative usage, the exact remaining screen inventory and design/asset effort are not available in this advisory; **full-overhaul budget fit remains OPEN** until that checkpoint. Continue already authorized nonconflicting work under its existing gates; newly required out-of-authority work needs a separate Current Ops execution amendment. Do not interrupt a live native session, force locks, reset worktrees or claim this publication was received by the terminal.

## 6. Continuation and completion boundary

The recorded accepted product reference remains P13A TS `45ca33650074ad5413c39fb9d4a5c04cd6571c3a` / Unity `6420a4d91de52db1bffca2988f2c995672e7d53e`, V20/protocol4/projection30; it is not automatically the active working pair. Order04 distinguishes later working checkpoints. Reuse actual owned progress; record the exact current paired build/DTO and disposable fixture roots at the normal checkpoint. Publication here changes documentation only and does not verify live task/process ownership or any native output.

P13A stays closed. Whole-game Playability precedes the targeted P13B refresh; P13B research mechanics and all eight Ready obligations remain separate. No hooks, new gameplay, campaign/schema changes, paid resources, PR/merge or protected-ref promotion are authorized here. Preserve existing strict command, disclosure, money, time and campaign owners, inherited performance qualifications, failed evidence and mutable Owner campaigns.

Next return: the existing plan's reconciled surface/state register and remaining budget/stage record, plus the next already-authorized native milestone when available. Not a new reviewer report, another hybrid vote or a claim that the overhaul is complete.
