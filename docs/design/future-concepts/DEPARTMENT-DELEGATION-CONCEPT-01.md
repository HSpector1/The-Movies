# Project: Studio — Department Delegation Concept 01

> EXPLORATORY FUTURE PRODUCT RESEARCH
> OWNER INTEREST CONFIRMED — MECHANICS NOT YET APPROVED
> NOT SCHEDULED
> NOT AUTHORIZED FOR IMPLEMENTATION
> SUBJECT TO CURRENT OPS REVIEW AND FUTURE ACCEPTED-BASE REFRESH

**Concept code:** DEL
**Current-ops verdict:** routine work autonomy is substantially covered; explicit revocable authority mandates are additive and genuinely new; named department heads are a later P10/P14-dependent investment.
**Working question:** Can the player state a durable policy for routine work, see exactly who may do what within which limits, and intervene only at exceptions—without creating a second economy, invisible bonuses, weekly meetings, or an unbounded agent?

## 1. Player fantasy and journey

The player grows from personally approving every routine matter into leading a studio with trustworthy operating boundaries. Delegation is not “let the AI play.” It is a visible contract: prepare choices for me; act only on these subjects; never exceed this amount per action or in this period; preserve this cash floor; stop at this date; ask when a fact falls outside the mandate.

Three authority dispositions keep agency legible:

1. **Inform:** summarize facts and exceptions; take no decision.
2. **Prepare:** assemble a valid shortlist, quote, schedule, or recommended command; commit nothing.
3. **Act within limits:** invoke the same legal command the player could invoke, after final revalidation and only within an explicit mandate.

**Exception behavior — Escalate:** refuse or pause when authority, visible data completeness, known uncertainty, funds, or conflicts are insufficient, then explain what decision is needed.

Escalate is not a more powerful automation tier. It is the out-of-bounds behavior attached to Inform, Prepare, or Act, shaped by the mandate’s escalation policy. The player can inspect used and remaining authority, revoke future action, or perform the decision manually. Exact receipts show what occurred and why. Basic usability does not depend on employing a named character; if department heads later exist, they add voice, visible prioritization, relationships, and shortlist curation within the same limits—not secret output bonuses or broader authority.

## 2. Existing Project: Studio plan

### Already present or substantially directed

- **SOURCE FACT:** the original reference automates ordinary crew behavior and demonstrates the late-game cost of repeated manual star/need management.
- **RESEARCH/DESIGN SOURCES:** P05/P06 direct autonomous ordinary production/post work under exact holds and resources; only implemented subsets accepted at the base govern runtime.
- **PROVISIONAL / UNSEALED DIRECTION:** P08 allocates factual history/events; P09 allocates facilities, capacity, property and legality; P10 keeps ordinary crew, extras, attendance, and work autonomous, aggregates attention, and retains person/profile/contract and credited-career truth; P11 Revision 02 requires one cash truth, complete costs, one consequence authority, previews, final revalidation, and exact receipts.
- **OWNER-ACCEPTED / APPROVED PRODUCT DIRECTION, NO IMPLEMENTATION:** P12 retains employer/interval mutation; P14 may add proposals, explicit preferences, promise/trust, relationships, and lifecycle facts.
- **CURRENT CODE FACT:** the accepted base has legal command validation and an exact `repairSet` action, including affordability/refusal behavior.

### Genuinely new

- A persistent, bounded, revocable mandate authorizing some future command attempts.
- Per-action and aggregate/window limits, optional cash-floor restriction, expiry, race-safe final checks, and mandate-linked receipts.
- A responsibility/exception view that explains why a prepared or attempted action proceeded or escalated.

### Not new ownership

The allocations above use the authority tiers in the synthesis §1. Delegation does not own work simulation, cash, affordability, hiring, careers, personality, or facility consequences. It supplies narrower authority to request existing actions. No department feature may write directly around the owning command.

## 3. Real-world practice findings

Film authority is role-based, collaborative, and historically contingent. Charles Musser’s BFI account describes collaborative US teams before 1908–09 and Edison’s June 1908 separation of a second unit and studio-head role. The Library of Congress overview of the US studio era describes increasing specialization and production-head authority, while also documenting an industry whose organization and access reflected its period. ScreenSkills’ current career map distinguishes producer, director, line producer, assistant director, location manager, casting director, and other responsibilities: preparation and recommendation frequently sit apart from final approval, contracting, creative authorship, schedule control, and employer authority.

The lesson is not to install a timeless modern org chart in every era. It is to represent responsibility, recommendation, approval, and escalation explicitly, while allowing era-appropriate names and combinations later. Basic control cannot be gated behind a historically specific title.

The DGA’s 2023 agreement illustrates negotiated creative consultation and employer/director boundaries. It is one US collective-bargaining context, not a universal game rule; its useful contribution is evidence that “the director decides everything” and “the studio decides everything” are both poor abstractions.

Safety-critical and financial systems supply stronger mandate principles:

- NASA human-automation guidance calls for visible mode/responsibility, understandable recommendations and consequences, adjustable automation levels, and human override/shutdown.
- NIST least-privilege, account-lifecycle, and audit controls support narrow, expiring authority and attributable receipts.
- Stripe spending controls distinguish per-authorization from interval limits; a single-action cap does not constrain cumulative spend.
- OWASP transaction-authorization guidance calls for exact operation data, server-side/state-aware checks, limited validity, and final authorization close to execution.

These are cross-domain safety analogies, not claims that a game requires enterprise compliance. They identify failure modes a trustworthy delegation UX should avoid.

## 4. Shipped comparator findings

Football Manager’s responsibility screens expose which staff role owns categories such as friendlies, press, scouting, contracts, staffing, and set pieces, and allow reassignment. Its recruitment focus lets the player issue a scoped brief, observe progress, receive recommendations, and retain final decisions. Its set-piece coach can turn player preferences into prepared routines, maintain them, adapt to personnel, and be overridden or given fuller responsibility. These are useful separations among intent, preparation, execution, and override.

Victoria 3’s sources show a visible, separately funded autonomous construction queue whose private projects could not be canceled or reprioritized. Visibility and bounded funding are retained patterns; the warning that non-cancelable autonomy may harm agency is an inference, and that restriction is rejected for Project: Studio.

Comparator lessons retained:

- show current responsibility beside the domain it affects;
- allow preparation without act authority;
- express a scoped brief/policy rather than repeat the same order;
- surface progress, recommendations, exceptions, and reasoned refusals;
- allow override/revocation for future actions;
- do not confuse staff attributes with permission.

No comparator establishes that a named department head should provide passive numerical output bonuses. That familiar pattern is specifically excluded from the lead model.

## 5. Recommended design model

### Mandate record

A future mandate must make at least these meanings explicit, though final names/storage are unapproved:

- mandate ID and revision;
- issuer and delegate/responsibility owner;
- allowed action classes and exact subject scope;
- per-action cap;
- aggregate cap and accounting window;
- optional cash-floor restriction against the same authoritative cash balance;
- start, expiry, and revoked state;
- escalation policy;
- used/remaining/pending operation references and exact receipts.

The cash floor means “do not authorize this delegated spend if the authoritative post-action cash would fall below X.” It is not reserved money, “Available Cash,” or a second wallet. Manual or other legal spending may consume headroom; the delegate revalidates current facts at commit and escalates if the floor would now fail.

### Execution law

1. A candidate action is prepared from visible current facts.
2. The player may inspect it when the level is Prepare, or the system may attempt it when Act-within-limits is authorized.
3. The intent binds to exactly one mandate revision; an overlapping mandate is never substituted silently. Immediately before commit, the owning command rechecks subject, legality, complete cost, cash, per-action cap, aggregate cap/window, floor, expiry/revocation, conflicts, and idempotent operation identity.
4. One authoritative transition either commits the underlying cash/resource effect, exactly one mandate-usage increment, and its receipt together, or refuses with all three unchanged. The mandate never writes outcomes directly.
5. Successful attributed command receipts are the authoritative aggregate-usage facts in simulation time. A proposal, pending intent, or refusal consumes no cap unless an existing owning command explicitly establishes a reservation. The receipt names the operation, mandate/revision, action and subject, amount/resource/time facts, result, and reason. Aggregated presentation may summarize receipts without losing drill-down.

Revocation prevents future authorization; it does not secretly undo an already committed legal repair. Save/load preserves expiry, used aggregate, pending-operation identity, and receipts so a resumed request cannot double-spend or double-act.

### Player-owned decisions by default

Greenlight, cancellation, release, final casting, final hiring/firing, debt, rights and contracts, build/demolish, screenplay, `FilmShape`, and `Promise` remain player decisions unless a later concept explicitly proves an exception. The first concept proof should not test them.

### Named heads later

A basic studio policy surface exists without a named head. Later characters may curate/order a shortlist, explain visible priorities, and proactively surface options. A baseline inspect-all route still exposes every player-visible legal option, and urgent facts cannot be suppressed. Visible data completeness/known uncertainty may qualify a recommendation; no opaque competence or “confidence” bonus changes authoritative outcomes. Any person, employer, promise/trust, relationship, or lifecycle consequence posts through its P10/P12/P14 owning domain. A head cannot widen the mandate, access hidden facts, invent resources, change odds secretly, or become a mandatory menu key.

## 6. Alternatives considered

| Alternative | Advantage | Why it is not the lead recommendation |
|---|---|---|
| Global “auto-manage” toggle | Simple | Authority and consequences are invisible; too broad to trust or diagnose |
| Named head required for every control | Strong staffing fantasy | Gates baseline usability and invents a profession/era assumption |
| Passive department-head buffs | Familiar progression | Hidden multiplier, not delegation; duplicates skill/persona and encourages mandatory hires |
| Second departmental budget/wallet | Easy mental partition | Violates one cash truth and creates reconciliation/affordability contradictions |
| Per-action cap only | Compact | Repeated small actions can exceed player intent |
| Aggregate cap only | Controls total | A single outsized action can still violate intent |
| Weekly approval meeting | Predictable cadence | Turns saved attention into ritual clicks and delays urgent exceptions |
| Free-form natural-language agent | Expressive | Ambiguous authority, hard validation, nondeterminism, unsafe scope, poor accessibility |
| Non-cancelable autonomous queue | Strong consequence | Undermines override and makes changed facts feel unfair |

## 7. Meaningful choices and failures

Meaningful choices concern policy, not every routine instance: which exact Sets may be repaired; whether the system may only prepare quotes or commit repair; per-repair and declared-accounting-window aggregate limits; cash floor; expiry; and whether conflicts escalate immediately or appear in a digest.

Legitimate failures and refusals:

- a candidate action exceeds per-action cap;
- cumulative use would exceed the aggregate/window cap;
- another player/system action reduced cash, so the floor or affordability check now fails;
- the target left scope, changed state, was already handled, or is no longer legal;
- the mandate expired or was revoked;
- a pending operation is replayed after save/load and is recognized as already committed;
- two candidates race for the same remaining aggregate authority and only one can commit;
- no valid shortlist or recommendation satisfies the brief.

Each case escalates with the exact reason and viable next step: change mandate, approve once manually, replenish resources, revise scope, wait, or do nothing. The system must not weaken the rule, choose a hidden substitute, or spam repeated failures.

## 8. Anti-tedium and accessibility

- A few durable policies replace repeated approvals; no weekly renewal unless expiry is an intentional player choice.
- Consume the existing shared attention-aggregation authority: one causal event produces one cross-feature decision packet and at most one blocking prompt.
- The minimum offers a safe preset and progressive disclosure; complete internal mandate facts do not become a form the player must fill out field by field.
- Group responsibility by decision domain and show level, owner, scope, next expiry, and exceptional state.
- Default to Inform/Prepare for unfamiliar or high-impact domains.
- Aggregate successful routine receipts; interrupt only for material, time-sensitive, actionable exceptions.
- Cool down repeated identical refusals and let the player change notification priority.
- Plain-language explanations accompany caps and totals; distinguish “per action,” “this window,” and “cash after action.”
- Never rely on color, portrait mood, or animation to communicate authority.
- Support keyboard/controller navigation, scalable text, screen-reader grouping, reduced motion, undo where factually possible, and pause/inspect.
- Provide one-action manual approval without forcing permanent mandate edits.
- Always expose a global safe stop for future delegated actions, with precise effects.

## 9. Authority, economy, and data boundaries

- A mandate narrows existing authority; it never grants an action the player could not legally perform.
- Only the owning command calculates complete cost and consequences and performs the final atomic revalidation.
- One cash balance remains authoritative. Caps/floors are restrictions evaluated against it, not reserved or spendable balances.
- No optimistic UI may display committed success before the command receipt exists.
- Idempotent operation identity prevents duplicate effects across retries/save-load. The command effect, cash/resource consequence, one mandate-usage increment, and receipt commit atomically; refusal changes none. Race handling must be deterministic under the accepted simulation contract.
- Delegation cannot inspect hidden actual talent/ceilings or reveal unavailable preferences. A prepared casting list uses the same player-visible evidence and P04 Fit boundaries.
- P10 retains people/roles/work, person/profile/contract and credited-career truth; P12 direction retains employer/interval mutation; P14 direction may add proposals, explicit preferences, promise/trust, relationships, and lifecycle facts. Assignment consequences post through the owning domain rather than P14 alone.
- P08/history receives actual mandate creation/change and command receipts only if accepted future history authority calls for them; no fabricated management narrative.
- No external model, network agent, plugin, or free-form code executes studio actions.
- Hollywood Wire may summarize typed appointments, decisions, refusals, and consequences; it may not invent conflict or competence.

## 10. Prototype, fuller vision, and deferred scope

### Smallest decision prototype

Use existing `repairSet` authority in deterministic fixtures. Baseline UI can Inform and Prepare a valid repair quote for selected exact Sets. One safe, editable preset progressively discloses an optional Act-within-limits mandate for routine repair on that allowlist, with per-repair cap, aggregate/window cap, optional cash floor, expiry, revocation, and escalation. The complete record remains inspectable without requiring manual entry of every field. After a separate manual spend reduces headroom, a prepared repair must be revalidated and refused/escalated. Save/load/retry must not duplicate it. Every outcome has an exact receipt.

If any act authority is judged premature, the first proof can remain Prepare-only; however, that tests recommendation UX, not delegated execution safety.

### Fuller vision if proven

More bounded routine domains; responsibility dashboard; scheduled digests; named department heads with era-appropriate role combinations, voice and priorities; people/career consequences through their P10/P12/P14 owning domains; controlled handoff as staff change.

### Explicitly deferred

Autonomous greenlight/cancel/release/casting/hiring/firing, debt, rights/contracts, construction/demolition, screenplay/Shape/Promise; general-purpose agents; natural-language mandates; second wallets or budgets; passive buffs; hidden probability modifiers; daily/weekly meeting loops; invented profession trees; organization-chart simulation; network services; learning from player data; balance values and UI implementation.

## 11. Owner decisions

1. May the first proof execute one routine existing command, or must it remain Inform/Prepare only?
2. Is routine Set repair the right bounded/legible domain under revocable future authority, or should discovery find another existing command after Current Ops refresh?
3. Should both per-action and aggregate/window caps be mandatory for spend authority?
4. Is an optional cash-floor restriction acceptable when clearly described as a check against the same cash truth?
5. Should a global stop revoke all future act authority immediately while preserving committed outcomes?
6. Are named department heads a desired later character layer, or should delegation remain role/policy based?
7. Does DEL continue, hold, or stop after Current Ops refresh?

Approval answers discovery questions only. It does not approve mechanics, command scope, schema, staffing roles, implementation, or schedule.

## 12. Proof plan and falsification

After separate authorization, run deterministic fixture tests and a paper/clickable responsibility study. Compare configuration and attention against performing the same repairs manually:

- Can players state who can act, on what, under which caps/window/floor, and until when?
- Can they distinguish cash balance, aggregate headroom, and cash floor?
- Do Prepare and Act feel materially different?
- Does a changed-cash race refuse safely with an understandable reason?
- Does save/load preserve expiry/use and prevent duplicate repair?
- Can players stop future action and still understand why an earlier repair remains?
- Do aggregated receipts reduce attention without hiding important consequences?
- Across repeated/no-event/duplicate-event cases, record setup time, repeated inputs, blocking prompts, dismissals, backtracking, missed material exceptions, and retained understanding. Success requires lower net attention with equal or better comprehension, not merely fewer clicks.

Falsify or redesign if players mistake the floor for reserved money, must inspect every routine receipt, cannot predict escalation, believe a named head improves outcomes invisibly, or feel compelled to configure many policies before the studio works. Stop act authority if exact same-command validation and idempotence cannot be demonstrated.

No production command change, automated game execution, staffing content, schema migration, or implementation is authorized by this proof plan.

## 13. Sources and confidence

All web sources accessed 2026-09-05. Film sources establish role diversity and historical variation; safety/financial sources supply transferable authority principles, not compliance requirements; comparators show shipped representations, not guaranteed fit.

| Source | Date / locator | Retained finding | Limitation | Confidence |
|---|---|---|---|---|
| [BFI archive, Charles Musser, “Innovators 1900–1910”](https://web.archive.org/web/20250115010943/http://old.bfi.org.uk/sightandsound/feature/145) | updated 10 Feb 2012; Porter/Fleming and June 1908 Edison passages | Musser describes collaborative US teams before 1908–09, then Edison’s second unit and Porter studio-head arrangement | Archived copy because live route is unavailable; specific US/Edison history, not universal chronology | Medium–high |
| [Library of Congress, “The Studio Era”](https://guides.loc.gov/american-women-moving-image/motion-pictures/studio-era) | updated 28 May 2026; overview and linked profiles | Studio-era production increasingly specialized/codified under powerful production organizations, within unequal access structures | US-focused guide and broad periodization | High for guide facts; medium for design translation |
| [ScreenSkills, Film and TV drama career map](https://www.screenskills.com/media/iskiunqf/2756-film-and-tv-drama-career-map-interactive-feb25-final.pdf) | Feb 2025; producer/director/AD/line producer/location roles | Current production divides appointment, creative, schedule/set, budget/contracts/safety/time, and location responsibilities | UK contemporary roles; titles/authority differ by era, scale and jurisdiction | High |
| [ScreenSkills, Line producer](https://www.screenskills.com/job-profiles/browse/film-and-tv-drama/production-management/line-producer-film-and-tv-drama/) | n.d.; responsibilities/skills | Line producers translate creative plans into crew, contracts, budget, schedule, logistics and risk control | Career guidance, not a formal authority matrix | High |
| [ScreenSkills, Casting director](https://www.screenskills.com/job-profiles/browse/film-and-tv-drama/development-film-and-tv-drama-job-profiles/casting-director/) | n.d.; brief, shortlist, audition, approval/contract passages | Preparation, recommendation, shared final choice and production contracting can be distinct stages | Page access can vary; contemporary UK framing | Medium–high |
| [DGA Basic Agreement, Article 7](https://www.dga.org/contracts/creative-rights/basic-agreement-article-7) | 2023 agreement; consultation/selection/budget/employer provisions | Creative authority is negotiated and bounded, not a single absolute role | One US guild/employer agreement; successor details and other jurisdictions differ | High for cited agreement; low as universal design law |
| [Football Manager 26, “Delegating Success”](https://www.footballmanager.com/the-dugout/delegating-success-football-manager-26), Sports Interactive | 9 Jan 2026; staff responsibilities and reassignment | Shipped UI exposes responsibility ownership across concrete domains and lets players reassign it | Product guidance/marketing; current version may evolve | High for shipped behavior; medium for translation |
| [Football Manager 2023, “Recruitment Revamp”](https://www.footballmanager.com/features/recruitment-revamp), Sports Interactive | 2022 feature page; recruitment focus/progress/recommendation passages | Scoped briefs can drive staff preparation while player retains final transfer choices | Different management domain and release | High for shipped pattern |
| [Football Manager 2024, “Set Pieces Refresh…”](https://www.footballmanager.com/features/set-pieces-refresh-and-coaches-debut), Sports Interactive | 2023 feature page; preferences, coach preparation/maintenance, override/responsibility | Player intent can become prepared plans with adaptive upkeep and selectable responsibility | Different domain; not evidence for film roles or automated spending | High for shipped pattern |
| [Paradox, Victoria 3 Dev Diary #71](https://www.paradoxinteractive.com/games/victoria-3/news/dev-diary-71-autonomous-investment-in-1-2) and [Update 1.2 changelog](https://www.paradoxinteractive.com/games/victoria-3/news/dev-diary-78-update-1-2-changelog) | 18 Jan / 8 Mar 2023; developer intention/testing before Update 1.2 was scheduled for 13 Mar | Sources show a visible, separately funded autonomous queue and non-cancelable private projects; agency risk is an inference | Historical version and different economy; no measured player-effect evidence | High for source facts; medium for inference |
| [NASA-STD-3001 Vol. 2, §10.6 Crew Interfaces](https://www.nasa.gov/reference/10-0-crew-interfaces-vol-2/) | updated 22 Apr 2026; §§10.6.1–10.6.14 | Human automation should expose mode/responsibility, explain recommendations/consequences, support levels and override/shutdown | Safety-critical human-factors standard, not a game UX prescription | High for principle; medium for translation |
| [NIST SP 800-53 Rev. 5 Update 1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) | 2020, update 1; AC-2, AC-6, AU-3 | Least privilege, authorization lifecycle and attributable audit records are mature control patterns | Security control catalog; game mandates are not compliance accounts | High |
| [Stripe Issuing spending controls](https://docs.stripe.com/issuing/controls/spending-controls) | n.d. living documentation; authorization and interval limits | Per-action and aggregate/window limits solve different risks | Payment-product semantics; no endorsement of exact UI or accounting model | High |
| [OWASP Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html) | n.d. living guidance; operation-specific/state-aware/final checks | Authorization should bind exact data, be server/authority enforced, limited, and rechecked near execution | Web-security guidance; used as safety analogy | High |
| [Stripe API, Idempotent requests](https://docs.stripe.com/api/idempotent_requests) | n.d. living documentation; idempotency-key behavior | Retried operations need identity so one intended act cannot commit twice | HTTP API mechanism; Project: Studio needs its own deterministic command design | High for principle |
| [Microsoft Azure Architecture Center, Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) | n.d.; event, concurrency, idempotence passages | Immutable receipts and concurrency-aware processing aid explanation/recovery | Architecture pattern, not authorization to rewrite the existing event model | Medium–high |

Internal evidence: accepted base `2753e18ba8fb5f65b936c22cde9531646fecc6cd`; Mechanics Bible SHA-256 `1772f518ac125e39dc10012a6f240dddf4a21683e64cc9e9834592499591a768`; P05 `d5653327c17709daea5e17ba00ce164678b9ad43`; P06 `8ccd8acc253901aadaa2175656c1e0f7d1a2df23`; P08 `438708c5071097d8e1ddb2f97a3f7b6674b2a65e`; P09 `91ed234cbf6cdc22817b792564dda22a1d7c3576`; P10 `6a5d41ec233152ecbe8cc3bfc960c31514b6cded`; P11 Rev 02 SHA-256 `216e5501cd3a40779fc0ca4d5fe7bd663c1d5f9a55de501930304cdbf00d226f`; P13–P15 `137ab603e37620ce647cd728b3a57154b8e3c3fb`.

**Overall confidence:** high in same-command validation, narrow/expiring mandates, one cash truth, exact receipts, and human override; medium–high in Prepare-first plus one routine repair proof; medium on named-head player value; low and intentionally open on future role taxonomy, mandate volume, aggregate window, balance, and P14 career/relationship effects.
