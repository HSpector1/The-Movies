# P12A R05 — Final Owner decisions and acceptance contract

**Order:** `OPS-P12A-LIVING-HOLLYWOOD-20260910-05`  
**Status:** IMPLEMENTATION AUTHORIZED when supplied with the R05 launch prompt to the assigned local coding session.  
**Date:** 2026-09-10. No precise decision/playtest time is asserted.

This is the complete decision attachment, not another research assignment. It preserves Howard's final rulings and makes the additional save-system requirements testable. Read it once at entry, then consult relevant sections while implementing. The companion [launch prompt](P12A-R05-LAUNCH-PROMPT.md) supplies the outcome-first execution loop. The [source index below](#appendix-pinned-source-index-and-preflight) locates the existing planning and accepted-source documents.

## 1. Authority, starting point and bounded supersession

Howard chose Living Hollywood, original-inspired fixed arrivals, authored histories for fresh-campaign incumbents, individual starting finances, independent evolving campaigns, and the simple Option-B save library without thumbnails or summaries. These are settled. Implementation details below operationalize those choices; they are not recovered original-game formulas or new claims of Owner playtesting.

| Binding | Exact source |
|---|---|
| P12 planning packet | `HSpector1/The-Movies@b51d8790354ccccd26c3c5e90819ecfafda9988c` |
| Original P12 design/Builder Annex | `HSpector1/The-Movies@a0739055c30f80fcf756340d0e0e962865aec6a4` |
| Accepted TS product | `7ae36b44d99c505246d17dcc37beba94fa59a18a` |
| Accepted Unity product | `HSpector1/project-studio-unity-visual-spike@3a9a3f488693aa14431a6aa412d7560df8f30a89` |
| TS acceptance/documentation starting base | `4caf7682b6c427b64f1ffab742f07cb4fddef2b0` |
| Incoming protocol / projection / inner save / outer checkpoint | `4 / 27 / V18 / 1` |
| Incoming schema | `sha256:97940e51e0566bed80231b223e5b7303a45d62db8d698f693e525eb244775211` |
| Incoming generated Unity DTO SHA-256 | `ecc9e0b65c493200e39d245d38de2cdad5be1953242ffc1a61a7c53fcb755476` |

Use isolated owned TS/Unity branches, preferably `wip/p12a-living-hollywood-01-ts` and `wip/p12a-living-hollywood-01-client`, descended from the accepted documentation/product bases respectively. If a name exists, inspect ownership and continuity; do not reset it. Incorporate planning documents as documents, not by merging their older product ancestry. Respect applicable repository instructions and permissions. Do not activate the separate global onboarding repair.

The published register has **130 original requirements, including 22 safeguards**, and two added process rows, OPS-001/CHK-001. Preserve all original IDs and historical fields. Record current applicability and add only genuinely new calendar, authored-history and campaign-library obligations in that same register. No duplicate task-tracking framework.

| Older instruction | R05 disposition |
|---|---|
| Three rivals are enough for completion | Superseded: nine rivals plus player and all five later arrivals must be demonstrated. |
| Week-only, evenly spaced 416-week arrivals; random-window alternative | Superseded by the fixed calendar schedule in section 3. No arrival RNG. |
| Opening companies cannot have earlier films | Superseded only for authored, fresh-campaign incumbents under section 2. |
| Migration A: already-existing invisible competitors | Superseded by migration B for genuinely pre-P12 development saves only. |
| Single-checkpoint Load; save library deferred | Superseded by the named multi-campaign library in section 4. |
| All later entry belongs to P15B | Transfer only this initial nine-studio rollout's scheduling/atomic entry into P12. Other corporate fate/churn remains P15B. |
| Generic identical 52-week-plus-two-project endowment | Feasibility aid only. Author individual starting positions with an explicit accounting basis. |
| Preparation must not execute code or hooks | This order authorizes P12 implementation and the bounded hook pilot, not unrelated configuration changes. |

R05 replaces the unsent R03/R04 execution orders. Other historical laws remain unless specifically superseded above. Preserve P11 acceptance; fixing a demonstrated regression caused by P12 is authorized, reopening P11 as another feature wave is not.

## 2. Author the initial world; simulate its future

**Fresh campaigns:** four established fictional rival companies are present at the 1920 start. Give each its own authored starting finances, lawful employees/capacity, identity/branding and a modest useful back-catalogue of earlier films with consistent credits/results. Exact fictional names, film content and money amounts are bounded authoring/tuning work, not another Owner questionnaire. Do not replace these with four empty companies or prose-only biographies.

Use one compact versioned starting-data manifest. Canonical film/person/studio records must support actual Industry, film details, career and History navigation. Mark authored provenance internally. Make chronology, person identity, historical credits, public results and current employment agree. Historical employment is not inferred from a credit. Incorporate the starter records into complete identity walkers and collision checks.

Pre-1920 dates need an explicit additive historical representation. Do not force negative values into existing nonnegative game-week fields, weaken legacy validators, or label earlier films as newly released at Week 0. The scenario can assert an earlier past without pretending the engine simulated it. Unknown details remain unknown; no invented fine-grained historical ledger is required.

Opening historical films are settled: their earlier earnings, career effects and Standing effects are already represented in the starting state, not unpaid live events. Initialization, Save/Load, reconnect and template updates must never pay them or award their credits/progression twice. Opening cash is a typed opening balance/endowment, not current-period film income. Specify whether each amount is before or after initial setup; charge capacity/signing exactly once where the chosen basis requires it. No unapproved loans or debt system.

**Later entrants:** each gets individual finite starting capital, costed lawful operating resources and genre tendencies, but no earlier company films, awards or business achievements. Before arrival its reserved identity/template is not an active employer, public studio, payroll or project. Entry commits all required state atomically, once. Its first film must be developed, staffed, produced, completed and released through the live simulation. An experienced recruit retains genuine personal credits from other studios; those do not become the new company's filmography.

**After initialization:** cash, employees, projects, films and history evolve through actual costs, decisions and receipts. No scripted victories, artificial rerolls, unlimited refills or guaranteed successful films. Starting finances may match between campaigns; their later outcomes need not. Retain the supported original genre tendencies and declared genre adaptations. Named original budget/prestige classes remain unverified. Do not invent Sci-Fi's equivalent or dynamic popularity; absent live popularity uses honest genre-affinity fallback, with the trend connection dependency-qualified.

## 3. One calendar and fixed rival arrivals

Current Ops adopts the already-approved convention for nonnegative absolute campaign week `w`:

- `year = 1920 + floor(w / 52)`.
- `weekOfYear = 1 + (w % 52)`.
- Week 0 is 1920, week 1 of that displayed year.

One shared, versioned TypeScript provider owns the mapping and emits presentation facts. Display progressing year and week, distinguishing within-year from absolute week where needed. Do not scatter date calculations into Unity. Do not change existing action durations, payroll/revenue ordering or absolute history ticks.

| Rival cohort | Arrival / initial participation | Absolute week |
|---|---|---:|
| Four incumbents, R01–R04 | Fresh-campaign opening, 1920 week 1 | 0 |
| R05 | 1930 week 1 | 520 |
| R06 | 1939 week 1 | 988 |
| R07 | 1950 week 1 | 1560 |
| R08 | 1956 week 1 | 1872 |
| R09 | 1969 week 1 | 2548 |

The five years are our fixed choices inside the original guide's documented windows, not recovered exact original dates or evidence of real-world formation booms. Dates follow each campaign's own clock, not wall time, save creation date, another campaign's progress or the player's performance. Preserve identities/policy version and process equal-date events in stable order. Loading never retimes or repeats an arrival/endowment.

This authorizes the calendar, date display and rollout only. No aging, era effects, technology unlocks, campaign ending or automatic completion of P11 annual/era Finance summaries. Its old REQ-031 limitation remains historically accurate; supplying a calendar now does not implement all remaining Finance features.

## 4. Simple independent named campaigns — required, not polish

**Player model:** play Studio A for years, save it, play Studio B for a different duration, then return to A exactly where it was saved. Support at least three independent named campaigns. No shared live Hollywood between saves and no background advance of inactive worlds.

| Control | Required behavior |
|---|---|
| New Game | Create a new independent simulation seed/world and ask for a campaign/save label. Do not overwrite another campaign or silently discard unsaved progress. |
| Save | Durably update the active campaign's existing record. Normal saving does not need a redundant overwrite prompt. |
| Save As | Ask for a new label; copy the **current** complete state/RNG into an independent durable record. Preserve the original saved record exactly. After success, the copy becomes the active save target; failure leaves the previous target/state intact. |
| Load Game | Show named records; select deliberately; validate and restore the chosen complete campaign. Failure must not silently reset it or destroy the active state. |
| Rename | Change the library label, not the studio/world/entity identities, history, simulation seed or RNG. A label collision must not silently replace another record. |
| Delete | Require confirmation identifying the selected record. Cancel changes nothing. Never delete another campaign or allow an active autosave to recreate the deleted record unintentionally. |
| Explicit overwrite | Require a deliberate target and confirmation for Save As/name collisions that replace existing data. Never silently overwrite merely because labels or filenames collide. |

Keep the list minimal: save/campaign name and authoritative year/week; existing studio name may help. No thumbnails, screenshot generation, long summaries, cloud synchronization or elaborate browser. A campaign label and in-game studio name are separate. Multiple named files rather than exactly three fixed slots are acceptable if simpler. All required controls must be reachable through the shipped native menu, not only a command-line utility.

Use standard save/discard/cancel behavior when leaving an unsaved active campaign. Never claim a save succeeded if a write failed. Use stable storage identifiers, not user labels as paths/primary keys. Validate labels without exposing path traversal. Writes, catalogue updates and deletion must fail safely; interruption/corruption should preserve or explicitly recover the last valid data, not yield an empty world represented as success. Reuse the accepted persistence boundary rather than building a new storage framework.

Each record owns its complete authoritative state: player, rival registry, scheduled/completed entries, finances, people/contracts, capacity/reservations, projects/releases, canonical film/credit/history, calendar policy/week, seed and current RNG state. There must be no cross-campaign singleton/cache/receipt contamination. Retained UI can use the existing session mechanism; do not add tab/scroll state to simulation history contrary to existing law.

**Identity and variation:** New Game receives a new saved seed. Save As is a branch from the current simulation, not a fresh start: preserve its world/entity IDs and random state under a distinct storage identity. Scope storage/caches by the active campaign record so identical IDs in a copied world cannot collide with the original. Do not remint historical people/films or seed again to make copies look different. Given identical saved state and future actions, continuation remains deterministic; independent seeds/actions can produce different histories. Every campaign need not have a forced different winner.

## 5. Legacy development-save migration is not ordinary Load

Migration B applies only when upgrading a genuine pre-P12-format checkpoint. At each saved state's own week, initialize already-due rivals as actual new entrants, with finite starting resources and no retroactive company film packs. Future rivals keep their fixed future dates. Do not import fresh-campaign incumbent histories, simulate missing past competition, or change earlier player results/finances/contracts. Entry and founding remain distinct unless the initialization law explicitly establishes both.

Migrate through the governed **outer checkpoint and canonical inner-save chain**. Preserve current and explicit saved states, their different weeks, null saved-state cases, session/revision/journal rules and rollback. Derive stable campaign origin once, not from mutable money/week. Preserve player applicants, contracts and reservations. Register real outgoing schema/version identities during implementation, not invented header replacements or preselected version numbers.

The previous single-profile checkpoint must not be silently lost when introducing a library. Retain its supported current/saved distinction in the selected record or import distinct recoverable records where necessary; label genuinely distinct recovered states honestly. This is engineering reconciliation, not permission to overwrite originals.

Ordinary P12 Load/Save As never runs new-world seeding or repeats legacy migration. An upgraded record retains its exact initialization provenance and arrived-studio history. In compatibility tests, operate on authorized copies; old binaries use untouched old backups, never upgraded bytes. No new consent to write Howard's protected original profile follows from this order.

## 6. Activated simulation, presentation and preserved boundaries

Activate the current P12 core plus all six documented P12-ready groups under their real producer conditions: richer separate-lane Charts/comparable movement; grouped public activity; observed tendencies; authoritative announcements; History adapters; paging/indexes/archive navigation/accessibility. Record exact active sub-obligations. Implement missing P12 adapters rather than declaring them absent upstream. Unavailable trend/scouting/other future producers stay qualified; no substitute fiction.

Preserve Level-2 simulation: abstract rival physical operations, not money, time, required people, capacity or causes of output. Use finite accounts, real payroll/overhead/capacity Opex, costed projects, shared reception/result meaning, legal lifecycle/commitment and exactly-once release/credits/history. No singleton `state.studio` swapping or competing financial formulas. Extend exact employer and film ownership joins, strict additive save/schema roots and complete identity walkers, including P08 History. Keep three Standing channels separate; private finances, salaries, hidden ability/policy/forecasts stay outside public rival DTOs.

The stock population cannot staff all nine while protecting the player. Add bounded deterministic P10-compatible unique people for demonstrated role deficits and coherent authored incumbent credits. Newly supplied people do not get invented live-career achievements; explicitly authored fresh-world credits remain the section-2 exception. Preserve existing player draft/assignments and one-employer exclusivity. No unlimited supply, cloned people or in-term theft.

No rival 3D lots, competitive bidding/poaching, new saturation/box-office penalties, Power Ranking, Awards simulation, P15B closure/recovery/replacement/churn, renovations, technology race, rights/franchises/TV or other future package. Businesses can succeed or struggle financially without this checkpoint claiming to implement bankruptcy/acquisition systems. Facilities modernization remains separate and is not a P12 prerequisite.

## 7. Product loop, proof and evidence applicability

Target the actual Industry preview by productive hour six, with an early native save-library task within the same implementation run. Do not spend hours drafting another plan or wait until all systems are finished to inspect the game. If the preview target is missed, record the specific blocker and continue within scope; no fake screen or fake pass.

Use the existing three product critiques: early slice, causal core/Gate A, full ready integration/Gate B; at most one additional polish round. Include actual save-name entry, switching, overwrite/cancel and context tasks at appropriate rounds. The product critic is read-only and independent of the builder; correctness review separately checks identities, money, persistence, privacy and evidence. Serial reviews are acceptable where supported; builder self-review does not replace independent proof. One native-input owner; observe existing lock/idle/owned-input safeguards and continue non-input work while the desktop is unavailable.

Preserve all substantive published candidate gates and provisional performance targets; do not mechanically rerun everything after each styling edit. Preserve one runnable Gate A control. Final Gate B covers the full R05 scope, with actual delivered launcher and independent review. Specifically include:

| Proof family | Required distinctions and cases |
|---|---|
| Authored starter history | Correct pre-start chronology, exact canonical credits/results, different financial starts, no historical receipt/progression replay, template/load idempotence. Authored films alone cannot pass a live-production test. |
| Live rival businesses | New post-start film progression for incumbents and newcomers; independent removal/restoration of cash, required talent and capacity; genuine resource constraints; exact finance/employer/release/credit/history joins. |
| Calendar/arrival | Boundary weeks and all five fixed thresholds; pre-entry absence; exact-once atomic funding/entry; all nine plus player; no player-relative timing or load reroll. |
| Campaign library | Native create/name A, advance/save; create B, advance differently/save; create C/save; reload each exact world. Save As B into an independent copy, preserve original, diverge through actions, quit/relaunch and reload all. Rename changes labels only; Delete/overwrite cancellation is inert; confirmed operations touch only the target. |
| Isolation and variation | Inactive record fingerprints unchanged; same saved state/actions resumes identically; new seeds can produce different post-start histories. Test pending and completed arrival state in multiple worlds, cache isolation and no cross-campaign money/credits. |
| Failure/migration | Safe failed/interrupted write/load/catalogue update; malformed/unknown input refusal; legacy current/saved states at different weeks; null saved state; repeated migration; protected original unchanged. |
| Public experience | Actual lot→Industry→rival→film/person/employer→Back, scrolling to real final page/row, large text/focus and honest empty/hidden states. Save library is native and discoverable. Callbacks are not real input; no physical controller claim without hardware. |
| Endurance and packaging | 6,240 additional authoritative advances with eventual nine-rival workload, save/resume equivalence and measured tick/query/serialize/validate/write/storage growth; cumulative TS/Unity/contract regressions, launch verification and exact artifact bindings. Do not delete permanent films/people/history to pass. |

Campaign-library tests cannot be replaced by a single-profile save test. Seeded films cannot certify live production; near-arrival fixtures cannot alone certify ordinary progression. Separate scenario data provenance, source/code review, synthetic checker tests, real native-input evidence and Owner enjoyment. No silent reduction to three rivals or one save.

Use one short execution log, the existing register and one generated evidence index. Bind results to order/scope, source pair, schema/consumer, delivered binaries and relevant fixtures/tasks. Reuse older evidence only with explicit checked applicability to unchanged scope/artifacts. Log meaningful failures as defect → demonstrated cause → related instances checked → countermeasure → result. Do not add repeated narrative reports.

## 8. Warning-only completion hook — one-hour pilot, not infrastructure work

Implement only a small project-local adapter to the existing milestone/register/evidence index, for **at most one productive hour total**, including tests. No external Andon installation, dependency purchase, global configuration, memory service or agent-team framework. If support/trust/time is unavailable, use an explicit milestone checker and continue safe gameplay work. Hook availability is optional; the underlying verification obligations are not.

### Real client and trust

Inspect the installed Codex client/version, active hook configuration and existing hooks before editing. Official documentation describes project-local configuration, review of exact hook definitions, concurrent matching hooks, turn-level Stop events and continuation-capable responses. Do not assume Claude configuration is interchangeable or that one hook overrides another. Preserve existing hooks and never bypass normal trust review. If Owner review is needed, provide the exact small diff and disable route; while approval is pending, use the fallback rather than stall P12.

Official behavior references checked for this order on 2026-09-10: [Codex hooks](https://developers.openai.com/codex/hooks/) (redirects to [ChatGPT Learn hooks](https://learn.chatgpt.com/docs/hooks)), especially “Review and trust hooks,” “Common output fields,” and “Stop.” Recheck the actual installed behavior at entry. Documentation and the planning kit's 17 synthetic cases do not establish local integration success.

### Decision and safety contract

Evaluate an explicit milestone-completion claim against the **R05** activated scope, not every casual use of “done,” a source-file edit, or a self-declared pass. Check required evidence kinds, outcomes, provenance, source/build/contract relation and checked reuse qualifications. Scope includes fixed calendar, authored incumbent/newcomer distinction, genuine post-start production, at least three named independent campaigns, Save As, RNG and migration isolation. All-counts-green metadata alone is not independent review.

Use supported nonblocking warning output. The documented Stop JSON `systemMessage` warning with exit 0 is a candidate transport to verify locally; return valid JSON, not unsupported plain text. Never emit `decision: "block"`, continuation requests, exit 2, or `continue: false`; this warning adapter must neither force continuation nor seize stop control. Suppress re-entry when `stop_hook_active` is set, deduplicate unchanged warnings by milestone/evidence fingerprint and permit a new warning after relevant evidence changes.

Bound runtime to two seconds and a bounded local index/attestation read set. Do not hash every binary or scan entire saves on each turn; reuse the validated binding index. No network, suites, gameplay, foreground input, recursive subprocess or execution of commands found in evidence. Report timeout/parse/IO errors visibly as `CHECKER_ERROR`, never success. Cap warnings, use a small project-local disposable dedup cache only if needed, and provide a precise rollback removing only this hook.

Truthful PARTIAL/BLOCKED, normal interruption and Owner stop remain safe. “No warning” is not certification. Do not silently weaken the independent final gates when falling back.

### Required smoke test before reporting ACTIVE

Through the actual selected client, demonstrate that a missing/mismatched R05 evidence fixture yields a visible warning, a valid applicable fixture produces no warning, and repeated unchanged warnings do not loop. Exercise a changed/malformed fixture, safe PARTIAL/BLOCKED and Owner stop, and verify existing hook behavior was not modified. Include the newly added campaign-library and authored-versus-live-production scope in checker tests. Record exact client/config/script identity and visible outcomes.

A Python decision table or directly invoking the script is a useful unit test but **not** the real-client test. If warning rendering, trust, restart requirements, error behavior or compatibility cannot be proven inside one hour, leave automatic integration inactive, report EXPLICIT-CHECKER FALLBACK and proceed. No claim of ACTIVE based on merely writing configuration.

## 9. Budget, ownership, safe stopping and delivery

Ceilings: **72 productive lead hours within 96 elapsed hours**, with **24 productive hours reserved for verification, necessary corrections and delivery**. This is the retained execution budget, not a guaranteed completion time. The added save/history/calendar scope is mandatory; if it cannot fit, the result is honestly PARTIAL, not relabelled optional. Track review/delegated effort, waits and included usage separately. Do not spend reserve on discretionary additions. No bought credits, API spend, subscriptions, paid assets or automatic ceiling increases.

Verify the Owner-selected model and maximum intended effort using actual client settings. Do not silently substitute a model/effort, rely on a previous session's exception or claim a prompt changes the setting. No permission bypass, remote service installation or global machine change is authorized. Respect interruptions/account limits; preserve resumable commits rather than imply the session will work in the background after it stops. Compaction should preserve the order pointer, active milestone and source/evidence bindings in the existing log, not restart planning.

Only one lead edits collision-prone files and owns foreground input. Preserve other worktrees, accepted Desktop candidates, private originals and protected campaign/main refs. Test fingerprinted authorized copies. Clean up only owned processes and synthetic input; do not alter locks/security settings, personal applications or the Owner's keep-awake processes. No private profiles, secrets or tokens in committed evidence.

Commit/push coherent owned P12 changes. Do not merge/promote protected branches, force-push, destructively reset, open unsolicited PRs or start P13. Deliver one recommended launch-verified native candidate containing an independent save-library test environment, short Owner playtest, exact source/build/schema identities, updated requirement dispositions and linked evidence, preserved rollback and honest limitations. Technical KEEP is not Owner acceptance.

**No more high-level product clarification is required. Verify the supplied files and accepted base, record R05, and build.**


## Appendix: pinned source index and preflight

The **two R05 Markdown files are the new handoff attachments**. The original seven planning files are already published and were reported present on the Mac in `$HOME/Desktop/P12-Living-Hollywood-Launch-Review/`, with its own `REFERENCE-INDEX.md` and `MANIFEST.json`. Another known planning checkout is `/Users/bruce/Project Studio - P12A Pre-Readiness`. Their presence on the executing Mac must be checked at entry; ChatGPT attachments do not automatically appear there.

This R05 ZIP does **not** pretend to contain a fresh full clone, the seven original source files, Unity assets, private saves, screenshots or an installed hook. It contains the complete final launch/decision documents and this exact retrieval index. Raw GitHub-file download from this ChatGPT sandbox was unavailable; connector reads verified the seven pinned file/blob identities below. Reuse the already-delivered local bundle or exact existing Git objects, rather than reauthoring source documents.

Repository: `HSpector1/The-Movies`. Planning ref: `b51d8790354ccccd26c3c5e90819ecfafda9988c`. Each path below is under `docs/engineering/`. Expected hashes are **Git blob SHA-1**, not ZIP or SHA-256 hashes.

| Source file / pinned retrieval | Git blob SHA | Read when |
|---|---|---|
| [P12A-PRE-READINESS-AND-DEPENDENCY-GATE.md](https://github.com/HSpector1/The-Movies/blob/b51d8790354ccccd26c3c5e90819ecfafda9988c/docs/engineering/P12A-PRE-READINESS-AND-DEPENDENCY-GATE.md) | `940223251f3cab89013b962592a7e7969d247d22` | Entry: exact baseline and current readiness, qualified by R05. |
| [P12A-DECISION-AND-REQUIREMENT-REGISTER.md](https://github.com/HSpector1/The-Movies/blob/b51d8790354ccccd26c3c5e90819ecfafda9988c/docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md) | `bf605467f4708f7b759563717936d441c49e41c1` | Entry: complete register; preserve original IDs and historical fields. |
| [P12A-REFERENCE-AND-PRODUCT-REVIEW-KIT.md](https://github.com/HSpector1/The-Movies/blob/b51d8790354ccccd26c3c5e90819ecfafda9988c/docs/engineering/P12A-REFERENCE-AND-PRODUCT-REVIEW-KIT.md) | `13afa7f55f066d17cddf3b5981cf09767fa29342` | Entry: actual product tasks, critiques and substantive candidate gates. |
| [P12A-PROVISIONAL-IMPLEMENTATION-CHARTER.md](https://github.com/HSpector1/The-Movies/blob/b51d8790354ccccd26c3c5e90819ecfafda9988c/docs/engineering/P12A-PROVISIONAL-IMPLEMENTATION-CHARTER.md) | `8914469c1c1232a7204a593848475c980211bb88` | Relevant subsystem: resource, scheduling, migration and storage proposals; R05 overrides final decisions. |
| [P12A-AUTHORITY-AND-CODE-RECONNAISSANCE-PLAN.md](https://github.com/HSpector1/The-Movies/blob/b51d8790354ccccd26c3c5e90819ecfafda9988c/docs/engineering/P12A-AUTHORITY-AND-CODE-RECONNAISSANCE-PLAN.md) | `db8ef0c43dabacac6f650660c646ce3f7c65f549` | Relevant subsystem: exact producer symbols, nine-row source crosswalk, people/identity findings. |
| [P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md](https://github.com/HSpector1/The-Movies/blob/b51d8790354ccccd26c3c5e90819ecfafda9988c/docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md) | `064f7c21baa2f82dc303eb5ec6a754cf9707e137` | Relevant integration: accepted finance, people, History, disclosure and later-package ownership. |
| [DRAFT-P12A-IMPLEMENTATION-PROMPT.md](https://github.com/HSpector1/The-Movies/blob/b51d8790354ccccd26c3c5e90819ecfafda9988c/docs/engineering/DRAFT-P12A-IMPLEMENTATION-PROMPT.md) | `dcd10c4eeee7f23c0b3e1d47d968c5042e271d68` | Historical process reference only: R05 replaces its launch instruction and conflicting defaults. |

Additional exact references, read as needed rather than copied into a new plan:

| Source | Ref and path |
|---|---|
| P11 acceptance | `4caf7682b6c427b64f1ffab742f07cb4fddef2b0:docs/campaigns/P11-OWNER-ACCEPTANCE-RECEIPT.md` |
| P11 financial/persistence handoff | `4caf7682b6c427b64f1ffab742f07cb4fddef2b0:docs/engineering/P11-TO-P12-PRODUCER-HANDOFF.md` |
| Original P12 design | `a0739055c30f80fcf756340d0e0e962865aec6a4:docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md` |
| Original P12 Builder Annex | Same ref, `docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md` |

Use exact source commits, not the current default branch. Verify the R05 archive manifest separately from the source bundle's manifest. Resolve pinned Git blobs and compare local document bytes with a no-filter Git object hash before use. If a required source is missing locally, fetch that pinned object through existing credentials immediately. A real access failure is a specific preflight blocker, not permission to reconstruct the source from memory or search unrelated Downloads archives. Runtime binaries, protected profiles and reference captures remain in their existing authorized locations; absence is reported at entry, not concealed. No preparatory runtime test or hook integration is claimed by this attachment.
