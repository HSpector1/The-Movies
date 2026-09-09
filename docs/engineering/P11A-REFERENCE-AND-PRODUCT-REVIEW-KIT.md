# P11A Reference and Product Review Kit

**READY FOR CURRENT OPS LAUNCH REVIEW**
**FINAL ACCEPTED-BASE REFRESH COMPLETE — PUBLICATION RECONCILED 2026-09-09**
**NOT AUTHORIZED FOR IMPLEMENTATION**

Prepared 2026-09-08 against P11 planning `328790ad8d8f859da77a13f8e8837afda4e038db`. This is a proposed execution-method change, not a new product package. The original 45 requirements, financial definitions, exclusions, and ready extensions remain controlling. Current Ops approves publication of the reviewed method under `OPS-P08P10-OWNER-CLOSEOUT-01`. Owner acceptance is recorded at closeoutf6ea836, and the final accepted-source refresh is complete at446690f. Publication reconciles both without starting P11. The separate coding order must still set scope, defaults, budget and actual model/client settings. Detailed identities and qualified source/evidence findings remain in the [readiness addendum](P11A-READINESS-AND-DEPENDENCY-GATE.md#accepted-source-addendum--2026-09-09).

## 1. Product destination and small reading map

> I can run my studio from the lot, immediately understand my money, see why it changed, and understand a decision before committing to it.

The lot is home; Administration gives the explanation; retained Finance supplies detail. The first useful preview is a real native Administration → Finance route showing actual Cash and one correctly reconciled recorded period. It is not the completed core. Do not polish a separate dashboard or simulate transactions merely for attractive screens.

| Load when | Required reading | Purpose |
|---|---|---|
| Entry | [Readiness](P11A-READINESS-AND-DEPENDENCY-GATE.md), complete [requirement register](P11A-DECISION-AND-REQUIREMENT-REGISTER.md), this kit, issued Current Ops order | Exact accepted pair, selected scope, decisions, references, environment and stopping boundaries |
| Before any financial number | [Financial truth](P11A-FINANCIAL-TRUTH-AND-CODE-RECONNAISSANCE.md) §§3–5, 10; original design §§1, 5–25 as applicable | Basis, time, visibility, inclusion/exclusion, AUD-008, cancel and Upcoming |
| Before integration | [Handoff](P08-P10-TO-P11-HANDOFF-CONTRACT.md) applicable owner rows and final recovery refresh; [charter](P11A-PROVISIONAL-IMPLEMENTATION-CHARTER.md) §§2–6 | Reuse Construction, Contracts, Profile/Roster, History, input and navigation; do not clone owners |
| Before UI/detail or extensions | Original design §§26–38 and Builder Annex relevant component/proof sections; this kit §§2–6 | Existing visual direction, original detail, full extension obligations |
| Candidate gates | This kit §6, original preserved gate requirements, final accepted producer proofs | Complete cumulative verification, not a larger reading campaign |

Original design and Builder Annex are on `codex/finance-executive-ux-research-11` at `d6c38546d19fbb23533af496e0f62b9c340b7ce5`, paths `docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md` and `…-BUILDER-ANNEX.md`. Retrieve their exact Git objects when addressing a subsystem; reference their content instead of copying it into another plan. Later accepted P07 wording and Current Ops public-information rulings qualify older conflicting sentences.

## 2. Six-entry reference kit: facts versus translation

Inspection date: 2026-09-08. R1–R4 are primary sources already selected in the P11 research, revisited narrowly here. R1 and R2 include actual inspected imagery; R3 and R4 are documented workflows, not invented screenshots. R5 is a real repository mockup with source inspection only, explicitly a candidate. R6 names the exact missing current-game capture set. No copyrighted comparator assets are imported into the game or republished in this kit.

### R1 — The Movies: cash stays with the lot

**Source:** [Official English manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040). Exact visual: PDF page index 2 (third PDF page), printed pp.4–5, right-page HUD illustration with the cash/ranking callout. Workflow: printed p.6, “Cash Balance”; printed pp.14 and 37 for Finance/Salary navigation.

**Observed:** the manual illustrates the lot HUD and describes opening Finance from the cash figure. The illustration and workflow were inspected; this is not an inspected full Finance-graphs screen.

**Retain:** immediate money awareness while operating a physical studio; deliberate optional depth. **Improve:** explicit Administration entrance, readable values, definitions and retained detail. **Do not copy:** tiny bubbles, dragging to spend, historic prices, salary jealousy or an assumed complete accounting ledger. Our Administration hierarchy is the project's translation, not a recovered original-game screen.

### R2 — Cities: Skylines II: balance to explanatory source

**Source:** [Official Economy & Production feature](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/economy-production), “Economy Panel,” Budget image. [Exact inspected image](https://images.ctfassets.net/u73tyf0fa8v1/4sNAke7dRJt1Ar3RCeibmU/8ef46f211d2beeba95ac6a0e3d9feb92/06_Budget.png?fm=webp&q=75&w=1920).

**Observed:** a Budget tab groups revenues and expenses, shows monthly balance, and places an explanation beside the selected expense. The city remains visible behind it.

**Retain:** strong summary-to-category hierarchy and explanation adjacent to selection. **Improve:** exact recorded-week reconciliation, named people/facility links and clear current-versus-historic basis; reduce category density. **Do not copy:** taxes, loans, city services, monthly law, translucent styling that harms readability, or large charts merely because the reference has them.

### R3 — Victoria 3: distinguish investment from recurring deficit

**Source:** [Official Dev Diary #61, Data Visualization](https://www.paradoxinteractive.com/games/victoria-3/news/victoria-3-dev-diary-61-data-visualization), 2022-10-05, income discussion beginning “Have any of you…” and the following construction paragraphs.

**Observed:** the developer explains why temporary construction-driven deficits and recurring fundamentals should be interpreted differently. The referenced Income image could not be retrieved reliably in this session; the evidence used here is the actual published workflow text, not a claimed screenshot inspection.

**Retain:** don't equate a large investment week with deteriorating recurring operations. **Improve:** show the named capital movement and separate operating pace, signs, dates and text. **Do not copy:** national-economic rules, color-only diagnosis or automatic “healthy/unhealthy” thresholds. P11 gets no new financial risk classifier from this reference.

### R4 — Madden NFL 24: consequences before confirmation

**Source:** [Official Franchise Deep Dive](https://www.ea.com/able/news/madden-24-franchise-mode), “Salary Cap Management → Contract Restructuring,” especially the paragraph describing player-card/Team Salaries entry and effects before confirmation.

**Observed:** EA documents showing immediate and future consequences before confirming. This is a verified workflow reference; no particular confirmation-sheet screenshot or column layout was inspected.

**Retain:** let the player understand now versus later before a material action. **Improve:** P09/P10-owned preview with exact cash now/after, recurring delta and actual onset, obligations and cancellation/refusal beside the action. **Do not copy:** salary-cap accounting, restructuring, dead money, new contractual actions or football dates.

### R5 — Project: Studio: retained workspace composition candidate

**Source:** [Visual Direction 01, Mockup C](https://github.com/HSpector1/The-Movies/blob/728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7/docs/design/mockups/visual-direction-01/C-casting-workspace.svg). Exact source commit `728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7`; Git blob `e98edbb43343d84574dd43aa6c940fd66d02600c`.

**Evidence:** actual SVG source inspected; rendered-image comparison remains for the local lead. It explicitly describes a non-production reference mockup with illustrative values. Its parent visual package is marked **REFERENCE AUTHORITY CANDIDATE**, not verified Owner-approved current styling.

**Retain as a hypothesis:** world beside a larger retained workspace, value/label hierarchy and a clear action footer. **Improve:** use the accepted Owner-UX tokens, sufficient scrolling, adaptive text and Finance-specific hierarchy. **Do not copy:** illustrative financial values, fixed pixel dimensions, placeholder portraits, always-visible runway or an unapproved global reskin. Render the actual SVG locally before treating it as visual comparison evidence; actual accepted direction takes precedence.

### R6 — Project: Studio: actual accepted Owner-UX baseline

**Publication refresh:** accepted Owner-UX captures and their exact761/qualified-carried3c6 bindings now exist in the technical closeout referenced by readiness. Reuse applicable actual evidence at coding entry; capture only missing task/state coverage on an authorized copy. The preparing session had not inspected these final captures, and this documentation publication performs no new visual/runtime proof. Earlier controls cannot silently substitute for the accepted candidate. No Owner ZIP transfer is requested.

At the initial native-environment check, reuse matching existing captures or capture on a private compatible copy:

| Capture | Exact task/state | What P11 must preserve or improve |
|---|---|---|
| `baseline-lot-administration` | Cash visible, Administration selected directly without menu/rail priming | World-first entrance, legible compact explanation, accepted palette/type/control grammar |
| `baseline-employees-scroll` | Long employee list; scroll to final real row; separate talent-pool view | Honest cohort labels, visible scroll affordance, no clipped final row; Payroll never includes everyone in the market |
| `baseline-contract-review-back` | Exact employee → material quote/cancel → Back | Useful facts beside the decision, same subject/filter/scroll after return, actual enabled action |
| `baseline-construction-review` | Operational and rising facilities; current quote then cancel | Existing site/quote owner, immediate versus future cost and reversible inspection |

Record final source/build IDs, fixture/private-copy identifier, week, viewport and text scale with these captures. Retrieve the actual approved visual-direction receipt and current style tokens at entry; this preparation makes no claim that an older candidate was approved. Capture instructions are not evidence of a passed test.

## 3. Proposed method replacements — scope and final gates retained

If Current Ops adopts this kit, the following process changes qualify the named Revision03 clauses. This is not a second specification or permission to ignore original requirements.

| Existing clause | Proposed replacement | Preserved obligation |
|---|---|---|
| Old draft §1: read all manuals, reports and histories immediately | Small entry reading map; authoritative details loaded before touching each subsystem | All 45 requirements considered at entry; applicable rules understood before implementation |
| Old draft §§7–14 / charter §7: finish full successive layers before a UI pass | Early vertical subset of W0–W3: truth → bounded projection → actual consumer → live Finance preview | All core work still completed before Gate A; no mock data or weakened contract |
| Charter §6: six lanes | One builder plus separate product and correctness review responsibilities; serial review permitted | One editor per collision-prone path and one native-input owner |
| Old per-wave stop/report wording | Ordinary failures are repaired within authorized scope; preserve coherent checkpoints and continue | Real safety/authority/environment blockers pause dependent work; mandatory failures never become passes |
| Old wave handoff / draft §22 repeated reporting | One short execution log, existing requirement register, generated final index | Exact artifact/evidence bindings, rollback and every required result remain available |
| Gates A and B / old draft §§15, 19 | No substantive gate removal; perform at candidate boundaries, not each spacing edit | Full cumulative proof for core and final candidates; rerun affected final evidence when bytes change |

This kit adds product inspection at three existing development boundaries; it does not require perpetual aesthetic re-review. Existing production rules and Current Ops execution orders outrank reference examples.

## 4. Representative tasks and six scenario families

Use real authoritative fixture data with documented setup, not hardcoded displayed numbers. Diagnostic fixtures may exercise edge cases but cannot replace the actual private-profile-copy journey. Before/after product comparisons use the same relevant state, viewport, text scale, list length, period and task. Clearly disclose when another game's imagery is only a principle comparison, not a numerically equivalent game state.

| Existing visual family | Player task and pass evidence | Important variants within the family |
|---|---|---|
| 1. Healthy/steady | Read cash from lot; enter Finance; state recorded-period movement and current recurring pace without confusing them | Cash positive but heavily committed; no meaningful finite runway |
| 2. Capital-heavy week | Identify the exact large purchase and its site; show why it is not weekly operating pace | Rising versus operational Opex at the real boundary; facility link and Back |
| 3. Operating deficit/in-red | Distinguish ongoing payroll/operations from one-time outflow; open responsible employees/facilities | Zero/negative cash; no active revenue; employee versus market membership |
| 4. Film income | Open one exact film; distinguish Gross, received Studio Revenue, projected/final Contribution and its exclusions | Same-title films, multiple runs, settled film, no current Locate; filtered/scrolled portfolio |
| 5. Incomplete history | Explain what is and is not recorded; absent earlier amounts never look like zero | Legacy imported copy, history boundary, 13/52-week charts or year summaries with coverage gaps |
| 6. Material consequence | Inspect construction/contract quote, cancel, refuse stale quote, deliberately commit once through its owner | Quote refresh; transient polling/arming recovery; actual button; double-click/retry; no new P11 hiring/clock law |

For long tables, prove wheel/trackpad and keyboard focus reach the last row and its action; scrolling inside the panel must not move the lot. Use the actual approved viewport/input matrix, including original large-text/controller requirements; inability to test one is a limitation, not a waived requirement. Baseline normal text plus 200% text is retained where required by the charter.

Context proof: Finance → exact Profile/Facility/Film → Back restores tab/filter/scroll/subject; Save/Load restores supported context and exact facts through the existing mechanism. No new simulation-history root to retain UI state. A missing approved context mechanism must be resolved explicitly, not silently omitted.

## 5. Review loop: three passes, distinct judgments

**Team:** builder owns implementation and native input; product critic consumes the references, actual images and interaction evidence; correctness reviewer independently traces facts, code changes and evidence. Reviewers remain read-only. If the client lacks delegation, arrange supported separate review sessions without changing permissions/models. Lack of independent review prevents final certification; a self-check is not a substitute.

| Round | Input | Required outcome |
|---|---|---|
| P1 — early live slice | Actual Administration/Finance screenshot, recorded period, short entry/Back interaction | Up to three largest gaps; implement high-value fixes while layout is cheap |
| P2 — complete core before Gate A | Same tasks after fixes, all six representative states, scroll/focus/consequence evidence | Verify prior fixes and remaining core usability failures; then core cumulative gate |
| P3 — ready-scope integration before Gate B | Core plus activated extensions, equivalent before/after evidence | Check added depth did not obscure hierarchy or break actions/context |
| Optional P4 | Only unresolved high-value product gaps within approved budget | Bounded final refinement; do not manufacture findings to consume the budget |

### Product/UX critic brief

Inspect the actual image/interaction evidence, not just builder explanations. Judge discoverability, hierarchy, reading effort, scroll/focus/input, decision clarity, lot context, Back and visible improvement against §2 and §4. A screenshot cannot prove scrolling or click dispatch: require the relevant interaction evidence.

Keep each critique to one concise table (normally no more than 300 words). Return at most three prioritized findings: **task + evidence path/frame + observed obstacle + player consequence + proposed remedy + exact recheck**. Say when evidence is missing. If fewer material gaps exist, do not pad the list. Record improvement as a demonstrated change (e.g., the final employee/action is reachable), not “9/10” or “beats the original.” A model-led product review remains distinct from the Owner's judgment of enjoyment.

### Correctness reviewer brief

Independently check the shared financial basis against actual debits; complete-period opening + signed movements = closing; one-time/recurring separation; no duplicate obligations/revenue; exact IDs; public-versus-hidden facts; stale/duplicate/cancel semantics; client does not recalculate financial meaning. Verify current employee membership, current contract facts, source owners, legacy results and RNG neutrality of inspection.

Inspect full durable outer-checkpoint migration, current and explicit saved slots, appropriate journal/session handling, Save/Load/reconnect/engine replacement, and actual private-copy continuity. Reusing inner save data alone is not sufficient. Validate source/player/engine/schema/generated-consumer/evidence correspondence and changed-path scope. An actual input failure is not repaired by invoking its callback directly.

Report **blocking defect / non-blocking limitation / unverified evidence**, with reason and test. Reconcile disagreements with the product critic; visual preference cannot override correctness, and correctness alone cannot certify readability.

## 6. Proportionate proof and evidence economy

| Boundary | Required checks |
|---|---|
| Iteration | Compile/typecheck affected components; focused tests and relevant consumer/input checks; real screens for changed UI. No empty test selection or skipped failures masquerading as success. |
| Core Gate A | Full required TS suite/typecheck/audit/build; schema/generator/exact-consumer checks; full Unity EditMode and required bounded runtime proof; financial reconciliation; all six visual families; actual material-input journey; complete outer-checkpoint and private-copy continuity; independent review; clean compatible source/build/evidence; preserved runnable core control. |
| Final Gate B | Cumulative required regression, exact-consumer attestation, visual/actual-input/private-copy journey, long-history performance and independent review on the delivered ready-scope candidate. Changed product bytes invalidate affected evidence; documented reuse requires exact identity and applicability. Preserve core rollback control; recommend one final Owner candidate. |

Bind reports and screenshots automatically with the existing tooling: source pair, dirty status, player/assembly/engine hashes, schema/protocol/projection/save identities, generated-contract identity, fixture, viewport, week and task. Do not duplicate hashes across narrative documents or build a new harness framework merely for P11. Missing attestation/input functionality must be a demonstrated gap and a scoped correction, not a pretext for framework replacement.

The final real-input journey remains: direct lot Administration → Finance → recorded-period explanation → employee/Back → facility/Back → exact film → construction consequence/cancel → stale refusal → one deliberate commit → capital now/Opex at onset → Save/Load/reconnect → clean menu/Esc/exit. Exercise activated contract consequences through their existing owner and verify their actual charges. Use established lock/idle infrastructure; do not contend with another session or alter Owner settings.

Long-history proof uses complete retained intervals and measured query/render/snapshot costs. Coverage disclosure and text/table chart equivalents remain mandatory. No raw full ledger or whole-save digest every frame. Tests prove their stated boundaries, not human enjoyment.

**Only three execution records:** one short log, the existing requirement register, one generated final index pointing to tests/captures/manifests and the runnable candidate. In the register retain original disposition plus execution state: REUSED, READY, IMPLEMENTED-UNPROVEN, PROVEN, CONDITIONAL, DEFERRED, with source/evidence or blocker/return condition. No new requirement IDs or feature omissions are needed for this method change.

## 7. Recommended budget and terminal conditions

**Recommendation for Current Ops adoption, not a completion promise:** 36 productive work-hours, 48 elapsed hours maximum, with an independently set usage/cost ceiling appropriate to the selected client. Track builder/review effort and runtime/tool waits separately; concurrent agent-hours still count toward usage. The earliest reached approved ceiling controls. No automatic paid-service or token-budget expansion.

| Productive interval | Intended milestone |
|---|---|
| 0–2 h | Final authority/model/runtime preflight, accepted baseline captures, AUD-008 recheck and focused truth repair |
| 2–6 h | Live engine-backed early preview and P1 critique; cash + one exact period, not all tabs |
| 6–14 h | Complete core, routes/consequences, P2 critique and fixes |
| 14–20 h | Core Gate A and preserved control; no Owner-response wait |
| 20–26 h | Revisit every authorized ready extension, integrate highest dependency-ready scope, P3 critique |
| 26–36 h | Protected ten-hour reserve for final proof, corrections, binding and candidate handoff |

These are checkpoints for replanning inside the ceiling, not forced pass deadlines. If the hour-six preview is missed, record the actual blocker and revised remaining schedule; do not substitute a mockup. Before starting an extension, account for validation cost and remaining reserve. Budget alone is not a dependency: unfinished authorized scope is PARTIAL, not silently reclassified as dependency-blocked. No mandatory core or final proof may be waived because time is short.

Stop successfully when every selected ready requirement is proven and both review responsibilities have closed mandatory gaps. Stop dependent work on genuinely unresolved authority, unsafe migration, public-information, save, environment or model/permission issues; safely continue independent authorized work. Stop the run at any approved ceiling/session limit, preserve coherent commits and partial artifacts, and report honestly. Do not imply background continuation after the client stops. Optional criticism rounds end after three scheduled passes plus at most one extra; correctness failures remain failures regardless of round count.

## 8. Launch decisions and reference limitations

Current Ops must fill the existing readiness activation record with: the already recorded Owner-UX acceptance, recovery dispositions and compatible identities; the completed P11 changed-path refresh; explicitly adopted/changed §4.B defaults; selected core/extension IDs and exceptions; productive/elapsed/usage limits; model/client/effort and access verification; actual coding order.

No new Owner economy decision is required under the original recommended defaults. Genuine choices now are activated scope/ceiling, default adoption, budget and actual launch settings; the method is already approved for publication but has no coding authorization. Hidden per-week theatrical receipts, new persistence, managerial profit allocation, loans, bankruptcy and Builder economics remain separately gated, not added to this launch.

At launch verify the newest model actually available to this Owner/client and the effective effort value using supported client/configuration evidence. Do not equate labels such as Max and xhigh without verifying the client mapping. Do not expose credentials or infer settings from the prompt. Official references checked during preparation: [model documentation](https://developers.openai.com/codex/models/) and [configuration reference](https://developers.openai.com/codex/config-reference/); these can redirect or change, so the installed client's actual supported behavior is controlling evidence. No model entitlement, supported subagent count or uninterrupted run duration is guaranteed here.

Preparation inspected public source documents, the original manual illustration and Cities Budget image. It did not inspect the final Owner-UX screenshots, render R5 locally, run native Unity, execute game tests, or establish approval of an old visual candidate. These are the original preparation-session limitations, not a claim that final Owner-UX evidence is unavailable now. Reuse the accepted evidence as R6 explains; remaining applicable entry checks do not require another ZIP or a genre-study restart.
