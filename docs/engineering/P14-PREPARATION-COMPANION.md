# P14 preparation companion

**PREPARATION PACKAGE · DOCUMENTATION AND PAPER ANALYSIS ONLY · P14 IMPLEMENTATION NOT AUTHORIZED · P13 NOT YET ACCEPTED.** Deliverables C through H of the P14 preparation package, plus the century-scale rules, the critique record and the provisional execution ceiling. Index: [P14 preparation review index](./P14-PREPARATION-REVIEW-INDEX.md). Facts: [post-P12 reconciliation](./P14-POST-P12-RECONCILIATION.md). Direction: [rulings §3.4](../design/CODEX-P13-P15-OWNER-RULINGS.md#34-p14-owner-direction-amendment--2026-09-11). Nothing here is an execution order and no number here is approved tuning.

Prepared 2026-09-11 on `docs/p14-post-p12-preparation-01`, documentation parent `4734e40`. Labels are those of rulings §3.4: **OWNER-SELECTED PRODUCT DIRECTION**, **IMPLEMENTATION RECOMMENDATION**, **NUMERICAL/CONTENT HYPOTHESIS**, **LATER FEATURE / NON-BLOCKER**, **POST-P13 REFRESH REQUIRED**. Every path and symbol cited is at accepted runtime `592e926` unless marked otherwise; the reconciliation carries the line ranges.

---

## 1. What this companion is, and how to read it

The August research (design + Builder Annex at `2a7ff0d`) remains the source of the state tables, DTO sketches, identity rules, fixtures, endurance harness, accessibility law and hostile checklist. This companion does not re-derive them. It records what the 2026-09-11 Owner direction changes, what the accepted P12 runtime changes, and the designs those two facts require: the redefined P14A (§2), the firing note (§3), the promise catalogue and feasibility service (§4), the relationship model (§5), the lifecycle model (§6), the four-class decision register (§7), the century-scale rules (§8), the critique and correctness record (§9), and the provisional ceiling (§10). Where a section says "carried", the August text governs unchanged.

---

## 2. Updated P14 design — deliverable C

The package name, the three-part shape and the full ambition are unchanged: **Package 14 — Talent Market, Relationships & Career Lifecycle**, delivered as P14A → P14B → P14C, with P14D kept only as a parking label. What changes is the content of each part under the direction, and the firm rule that P14A proves the contested market without dragging P14B/C into the first checkpoint while leaving the seams they attach to.

### 2.1 P14A — Contested Talent Market, redefined

#### 2.1.1 The outcome P14A must produce

> A known professional approaches contract expiration. The player inspects that exact person from the world or the profile. The player makes and reviews a proposal. One real rival makes a competing proposal under the same law. Known rival terms are shown where lawfully known; unknown terms say UNKNOWN. At the authoritative settlement boundary the person chooses deterministically and replayably, P10 settles the contract, P11 settles obligations, P12 settles employer, exclusivity and interval truth, and P14 records the competitive case, the choice and its reasons. Exactly one outcome occurs, and the same `PersonId` survives whichever studio wins.

No agent stands between the player and the market. No promise, relationship, retirement or profession change is required to reach that outcome. Firing is integrated as a real roster/contract action because it already exists upstream; its tuning does not consume the checkpoint.

#### 2.1.2 Market eligibility (direction 4)

| Person state | Market status | Who may propose |
|---|---|---|
| contracted, more than the renewal window remaining | `contracted_outside_window` — no case | nobody; no in-term approaches, no hidden tampering |
| contracted, inside the accepted renewal window (`renewalWindowOpen`, 12 weeks) | `renewal_window` — a case opens at the window's first week | the incumbent and any *entered* P12 rival, under the same law |
| contract expired without settlement | `free_agent` | any entered studio, including the incumbent |
| released early by the employing studio (§3) | `free_agent` immediately | any entered studio; the releasing studio under the guard of §3.5 |
| retired from the profession (P14C) | `retired_or_ineligible` | nobody, except the one extension offer of §6.2 through this same path |
| P14C profession transition committed | `free_agent` in the new profession | any entered studio |

Eligibility reads `rivalEmployment` / `studioEmployerId` and the contract window, never the `employmentStatus` string (which says `unavailable` both for rival-employed and for off-rotation people). A reserved rival (`enteredWeek === null`) cannot propose. No case opens during the founding draft. A free agent is always a case subject the week at least one studio proposes, regardless of the 13-week hiring-market rotation sample.

#### 2.1.3 The case, without an intermediary

```text
person eligibility
  ├─ contracted_outside_window
  ├─ renewal_window
  ├─ expiring_to_market
  ├─ free_agent
  ├─ retired_or_ineligible
  └─ unavailable_for_recorded_reason

market case
  discovered → accepting_proposals → proposals_open → decision_pending
            → settled | declined | expired | invalidated
```

`intermediary_contacted` is gone. Discovery is authoritative and public: a case is `discovered` the week eligibility opens, and every entered studio sees it at once, because the fact that a contract is expiring is public (the accepted Industry projection already publishes employer identity and employment transitions; the original game made rival Stars' status visible). What is not public is the content of another studio's proposal (§2.1.5).

**The one accepted behavior P14A changes.** Today the incumbent's renewal is an immediate replacement of the running contract from the current week (`applyRenewContract`), and a solvent rival renews its own people on the first week of the window (`staff()`), so a rival's person never reaches a contested expiry and the player's person can be locked before any rival sees the case. Under P14A, for a person under a case, the incumbent's renewal becomes the incumbent's **proposal**: a P10 draft whose `startWeek` is the old contract's `endWeekExclusive`, settled at the decision week with everyone else's. Outside a case the accepted immediate-renewal semantics stand unchanged. This is a SHARED GENERALIZATION with P10 (player) and P12 (rival maintenance), and it is what makes an expiry contestable at all. An "exclusive negotiating period" for the incumbent before rivals may propose was considered and rejected: it narrows the Owner's direction that outside studios may compete for people entering the approved window, and it would let a diligent player nullify the contested market for every one of their own people.

#### 2.1.4 Proposals

Carried from August in law: a proposal is a versioned reference to a P10-authored contract draft (the six accepted keys: person, start, end, term, annual salary, signing bonus) plus P14-owned facts (case, issuer, effective week, expiry, deadline, an optional attached promise set when P14B exists, and an optional, initially empty `representation` reference, §2.1.6). Material term change → new version; prior review token and submission invalid. The player submits, revises or withdraws; nobody accepts. The rival's proposal is a real record created inside its existing weekly decision (`nextDecisionWeek`), affordable under its finite Cash and reserve rule, and validated by the same guards.

**Rival terms are authored policy, not RNG.** Both studios price through the same `offerForTalent`, whose per-person jitter is keyed by `talent.id` only, so for the same person, term and week a rival's draft equals the player's byte-for-byte. Competition therefore comes from an authored, bounded rival-policy term model: a term preference (hypothesis: rivals prefer 208 weeks as today) and a bounded premium factor over the ask (hypothesis: 1.00–1.10, chosen deterministically from the rival's policy and its need), all inside the rival's existing reserve rule. This is a policy version bump plus validator branch owned by P12.

#### 2.1.5 What is lawfully known, and what says UNKNOWN

The accepted disclosure law hides every rival contract term ("Contract terms are kept private in Industry."). The Owner's "transparent competing terms" therefore needs an explicit disclosure rule authored with the proposal fact, which is this table.

| Fact | Player sees | Rival sees | Rule |
|---|---|---|---|
| that a case exists, its subject and its decision week | yes | yes | public at discovery |
| the person's public profile, credits, employer history | yes | yes | P10/P12 public projection |
| the person's ask for a chosen term | for the player's own draft | for its own draft | each studio prices its own draft; the ask function is shared law |
| that a competing proposal exists, from which studio, since when | yes | yes | public from the week of submission (hypothesis) |
| the competing proposal's term length and effective week | yes | yes | public (hypothesis) |
| the competing proposal's salary and bonus | **UNKNOWN** | **UNKNOWN** | private terms are never exposed, before or after settlement |
| the competing proposal's attached promises (P14B) | UNKNOWN | UNKNOWN | private |
| the person's ranking | no, until settlement; then the receipt's top reasons | same | no hidden dice, no exposed formula |
| after settlement: who the person joined and on what term length | yes | yes | public, as an employment transition today; salary stays private |

The comparison view always has a truthful column for the rival: known rows filled, unknown rows literally "UNKNOWN". No band, estimate or rumor is invented. Owner rulings §3.1 ("transparent competing terms") is satisfied at the level of existence, issuer, term and effective week; money stays private, which is what the P12 register (UX-011, SAF-014) and the future-consumer contract require.

#### 2.1.6 The representation seam (direction 8)

A proposal carries one optional, versioned `representation` reference, `null` in P14A and validated as `null` by the save validator. If a later Owner-authorized representation system exists, it may populate that reference with an authoritative engagement that discloses information or negotiates within a mandate. Nothing in P14A reads it. No office, marker, fee, NPC or route exists. This is the whole seam.

#### 2.1.7 The person-choice rule

Deterministic, versioned, replayable, no RNG, not a single exposed formula, and never dependent on array order, Map/Set order or `PersonId` lexical order (P12's own staffing idiom of first-match in `state.talent` order is not a precedent for a contested choice). The rule ranks valid proposals by an ordered list of public descriptors, each producing a typed reason: compensation against the person's ask; term against the person's public term preference (hypothesis: rising talent prefers shorter terms, veterans longer); opportunity (the role class the proposal names, when P14B promises exist); trust in the issuing studio (P14B; neutral in P14A); relationships at the issuing studio (P14B; neutral in P14A); studio Standing (P08 public fact, by reference); incumbency (a small, disclosed preference for the current employer at otherwise equal terms, mirroring the original's status expectations). Ties break by an authored, published total order over typed terms plus the visible issuer priority. The receipt records the top three reasons per proposal. The person may rank every proposal below a reservation and decline all, becoming a free agent.

#### 2.1.8 Settlement

One serialized scheduled phase at the decision week, a new fixed-order step inside `tick()` placed so that the incumbent's immediate renewal loop is bypassed for a person under a case, the frozen proposal set is settled before expiry removes the contract, and both the player mirror (`recordPlayerEmployment`, which otherwise runs only after actions) and the P12 signing primitive (to be exported from the module-private `staff()` logic) are invoked explicitly. It freezes the submitted set, revalidates every proposal against P10 (contract legality), P11 (the player's `canAfford` for the bonus; the rival's reserve rule), P12 (issuer entered, person not committed elsewhere, interval algebra), applies the rule, and commits through the accepted owners: P10 activates or renews the contract; P11 books the bonus; P12 closes and opens exactly one interval and appends its receipts; P14 writes the chooser receipt referencing both P12 `eventId`s and the case terminal state. If any owner refuses, nothing is written and the case records a typed refusal. Duplicate delivery consumes the same in-state idempotency key once. The P12 receipt union stays closed: the case outcome is expressed as the two accepted receipts (end at A, start at B) joined by the P14 receipt, not as a new linked `from → to` receipt (a P12 validator amendment Current Ops may still prefer; reconciliation §7).

#### 2.1.9 Firing, integrated

The accepted `releaseTalent` action becomes P14A's early-termination action under §3: charge recalibrated, refusal extended to the busy set, confirmation disclosure widened, the anti-exploit guard applied, the release recorded as a P12 `termination` receipt exactly as today, the person a free agent immediately, and any entered studio (including rivals) free to pursue them under §2.1.2. Rival early termination is symmetric in law and is Ready work rather than Core (§3.6).

#### 2.1.10 Bounded first checkpoint, restated

**P14A.1 — One Contested Expiry Core.** One immutable `PersonId`, two entered `StudioId`s (player and one rival present at week 0), one case, at most one current proposal per studio, P10 term references and version invalidation, the incumbent-renewal-as-proposal rule, explicit UNKNOWN rival terms at the core projection boundary, one expiry-only atomic decision with typed reasons, one P12 employer transition or free-agent result, the recalibrated firing action with its guard and refusal, the versioned termination rule for old saves, save/load/replay, duplicate-event refusal, honest old-save initialization. **P14A.2** bounded read side (comparison projection, paged case/career pages, the Industry view enumeration widened). **P14A.3** world/client route. The August excluded list loses "informational intermediary" and gains nothing.

**First-checkpoint pass sentence.** "The same person can receive one player and one rival proposal at an eligible expiry, see the rival's known terms and explicit unknowns, be resolved exactly once by an atomic deterministic TypeScript decision through P10/P11/P12 with readable reasons, retain the same identity and linked employer/career truth, be released early under the disclosed 26-week-capped charge without a fire-and-re-sign discount, and survive save/load/replay without a client choosing the winner."

### 2.2 P14B — Professional / Personal Bonds and Promises

Full selected experience: typed promises with feasibility (§4), professional trust (§4.5), and the Movies+ relationship model (§5): positive and negative relationships, collaboration history, friendship, romance, chemistry, decay of current closeness, durable history, growth through shared work. Attention is exception-based; the profile shows why relationships changed; every numeric effect carries a reason. P14B attaches to P14A through the promise slot on proposals, the trust and relationship descriptors in the person-choice rule, and the firing trust driver; none of these replaces a P14A structure.

### 2.3 P14C — Career Lifecycle

Full selected lifecycle (§6): derived aging for all persistent professionals, the apparent-age seam, profession-specific retirement context, announced retirement, obligations first, the one final one-year extension, alumni, deterministic replenishment, profession retirement distinct from industry retirement, Actor → Director and Actor → Writer, historical continuity. P14C attaches to P14A through the extension offer (a one-issuer proposal), through free-agent re-entry after a transition, and through retirement eligibility in the market status table.

### 2.4 P14D — parking label only

In-term approaches, rival-initiated release, buyouts, opt-out clauses, tampering. Not P14 completion scope, not entered by stealth through P14B/C, and not used to park any of the Owner-selected work above. Placement (post-P14 follow-on versus P16+) remains an Owner choice when it is raised; nothing in P14 depends on it.

### 2.5 Ownership matrix after the direction

| Fact | Owner | P14 relation |
|---|---|---|
| person identity, profile, profession, skills, aptitude, credits, contracts, ask pricing, renewal window, the release action's contract mutation | P10 | consumes; the charge law, the busy-set refusal, the case-time renewal semantics and the pricing floor are P10 contract-law changes commissioned by the P14 order; never duplicates |
| studio identity, active employers, exclusivity, intervals, transitions, receipts, rival policy/cadence/capacity/projects, rival signing | P12 | consumes; the rival proposal decision and the exported signing primitive are P12 generalizations; adds no employer state |
| cash, ledger kinds, affordability, forecasts, obligations | P11 | books the termination charge under the existing `termination` kind and the bonus under `signingBonus`; books nothing new in P14A |
| production lifecycle, first-filming seam, seats, durations, capacity | P05/P06/P09 | consumed by the feasibility service and the relationship drivers by reference |
| era/technology/timeline | P13 | consumed after acceptance (POST-P13 REFRESH REQUIRED) |
| awards, honors, Standing, history portal | P08 | consumed by reference; never computed |
| market cases, proposals, chooser receipts, promises, feasibility receipts, trust, relationships, birth provenance, lifecycle, alumni, cohorts, transitions | **P14** | owns |

---

## 3. Firing economic note — deliverable D

**Direction it realizes:** rulings §3.4.1 items 1–3. **Class:** the charge law is OWNER-SELECTED PRODUCT DIRECTION; the guard, the refusal rule and the rival path are IMPLEMENTATION RECOMMENDATION; every dollar figure is a worked example under the accepted constants and is not tuning.

### 3.1 What exists today

| Fact | Where |
|---|---|
| `weeklySalary(annual) = round(annual / 52)` | `src/core/employment.ts` `weeklySalary` |
| `guaranteedComp = weeklySalary × max(0, endWeekExclusive − week)` — base salary only, bonus excluded | `employment.ts` `guaranteedComp` |
| `terminationCost = round(0.5 × guaranteedComp)`, `HIRING_TERMINATION_FRACTION: 0.5` | `employment.ts` `terminationCost`; `src/core/tuning.ts` "Renewal / termination (D-11.7 / D-11.9)" |
| `releaseTalent` refuses with no active contract and while the person holds an active screenplay task; otherwise debits the charge as a `termination` ledger row, removes the contract and adds the person to `freeAgents`; ungated by solvency (Owner ruling R3); no active-production-seat guard; legal during founding | `src/core/actions.ts` `applyReleaseTalent` |
| P12 mirrors the early end as a `termination` receipt and the validator requires the exact ledger payment, recomputed with the **current** formula on every load | `src/core/industryEmployment.ts`; `src/core/hollywoodValidation.ts` "employment termination lacks its actual player payment" |
| The accepted confirmation copy hard-codes the rule: "Pays $X in termination now (half of the $Y still guaranteed through Week Z). N leaves the roster this week as a free agent. Recorded credits and career history stay on the record." | `bridge/contract.ts` |
| Contract = exactly six keys; no incentives, no guarantees beyond base salary | `src/core/types.ts` `Contract`; `src/core/save.ts` `v8Contract` |
| Ask: `annual = salaryCurve × 3.0 × lengthFactor{52:1.08, 104:1.0, 156:0.95, 208:0.9} × ageFactor(bell at 34, floor 0.85) × jitter(±8%, fixed per person)`; `bonus = 18%`; `salaryCurve = 25,000 + 150,000·(OVR/100)² + 600,000·(fame/100)²` | `employment.ts` `offerForTalent`; `src/core/worldgen.ts` `salaryCurve`; `tuning.ts` |
| Renewal window `0 < remaining ≤ 12`; renewal = immediate replacement at the current ask plus a renewal bonus | `employment.ts` `renewalWindowOpen`; `actions.ts` `applyRenewContract` |
| Rivals never terminate; `RivalMoneyKind` has no `termination`; the validator forbids a rival termination receipt | `src/core/hollywoodTypes.ts`; `hollywoodValidation.ts` |
| No cooldown, re-hire memory or salary floor exists; a released person is listed first in the hiring market the same week and may be re-signed in the same action batch | `employment.ts` `hiringMarketIds`; grep negative for cooldown/rehire |
| Release was used 0 times across 15,000 non-exploit harness runs under the 50% rule | `docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md` |

So the Owner's finding holds exactly: a live early-release mechanic at 50% of remaining guaranteed salary, which P14 recalibrates and integrates.

### 3.2 The selected law, stated as code-shaped rules

```text
weekly        = round(annualSalary / 52)                          (unchanged)
remaining     = max(0, endWeekExclusive − week)                    (unchanged)
guaranteed    = weekly × remaining                                 (unchanged; base salary, bonus excluded)
charge        = weekly × min(remaining, 26)                        (NEW: replaces round(0.5 × guaranteed))
earned unpaid = 0 in the accepted economy (payroll is debited weekly; the bonus was paid at signing and is sunk)
effective end = the release week (person leaves the roster now, is a free agent now)
```

Equivalently: the studio pays every remaining week up to twenty-six of them, never more. The charge equals today's at exactly 52 weeks remaining (26 = ½ × 52), is **higher** below 52 weeks (full pay instead of half), and **lower** above (capped instead of half of a growing number). It never rounds (integer × integer). "Base salary" is pinned to `guaranteedComp`'s definition, not to the D-17A "guaranteed obligation" that includes the bonus.

### 3.3 Worked examples under the accepted constants (age 34, jitter 1.0)

Annual asks at the accepted formula (two-year term basis, length factor 1.0): **LOW** (OVR 40 / fame 10) $165,000 · weekly $3,173; **MID** (60 / 40) $525,000 · $10,096; **HIGH** (80 / 80) $1,515,000 · $29,135; **STAR** (90 / 95) $2,064,000 · $39,692. The one-year ask is 8% higher, the four-year ask 10% lower; real offers also carry the ±8% jitter and an age factor in [0.85, 1.0], so the observed range is 0.78–1.08 × these figures. For scale, founding cash is $20,000,000.

| Tier | Remaining | Guaranteed | Today 50% | Discarded 5% | **Selected** | Selected as weeks of pay | Selected ÷ guaranteed |
|---|---:|---:|---:|---:|---:|---:|---:|
| LOW | 8 wk | $25,384 | $12,692 | $1,269 | **$25,384** | 8.0 | 100% |
| LOW | 26 wk | $82,498 | $41,249 | $4,125 | **$82,498** | 26.0 | 100% |
| LOW | 52 wk | $164,996 | $82,498 | $8,250 | **$82,498** | 26.0 | 50% |
| LOW | 104 wk | $329,992 | $164,996 | $16,500 | **$82,498** | 26.0 | 25% |
| LOW | 200 wk | $634,600 | $317,300 | $31,730 | **$82,498** | 26.0 | 13% |
| MID | 8 wk | $80,768 | $40,384 | $4,038 | **$80,768** | 8.0 | 100% |
| MID | 52 wk | $524,992 | $262,496 | $26,250 | **$262,496** | 26.0 | 50% |
| MID | 104 wk | $1,049,984 | $524,992 | $52,499 | **$262,496** | 26.0 | 25% |
| MID | 156 wk | $1,574,976 | $787,488 | $78,749 | **$262,496** | 26.0 | 17% |
| MID | 200 wk | $2,019,200 | $1,009,600 | $100,960 | **$262,496** | 26.0 | 13% |
| HIGH | 26 wk | $757,510 | $378,755 | $37,876 | **$757,510** | 26.0 | 100% |
| HIGH | 52 wk | $1,515,020 | $757,510 | $75,751 | **$757,510** | 26.0 | 50% |
| HIGH | 156 wk | $4,545,060 | $2,272,530 | $227,253 | **$757,510** | 26.0 | 17% |
| HIGH | 200 wk | $5,827,000 | $2,913,500 | $291,350 | **$757,510** | 26.0 | 13% |
| STAR | 8 wk | $317,536 | $158,768 | $15,877 | **$317,536** | 8.0 | 100% |
| STAR | 52 wk | $2,063,984 | $1,031,992 | $103,199 | **$1,031,992** | 26.0 | 50% |
| STAR | 104 wk | $4,127,968 | $2,063,984 | $206,398 | **$1,031,992** | 26.0 | 25% |
| STAR | 200 wk | $7,938,400 | $3,969,200 | $396,920 | **$1,031,992** | 26.0 | 13% |

Reading the table: the discarded 5% candidate would have let a studio walk away from a four-year star contract for $397k, about ten weeks of pay, which is what "nearly disposable" means. The selected cap keeps the long-contract exit at half a year's pay, one-quarter to one-eighth of what today's rule charges on the same contracts, while making a late exit cost exactly what keeping the person would have cost.

### 3.4 Effective end, refusal, disclosure and obligations

- **Effective end.** The release week, as today.
- **Refusal (recommendation R2).** The accepted refusal while a screenplay task is active is kept and extended to every busy-set seat: a director, cast member or craft lead seated on an active production (seats are reserved through release) cannot be released until wrap. Today a released actor keeps shooting because nothing re-checks the contract inside the production; the extension is world-truth hygiene, and it is the same "finish current binding obligations" rule retirement uses. A softer "notice now, effective at wrap" variant needs a pending-termination record and is Ready work. Release during the founding draft is refused.
- **Disclosure (direction 2), in the accepted confirmation's voice, two exact branches:** "Pays $X in early termination now — 26 weeks of the $Y still guaranteed through 1934 · Week 12 (cap applies: 88 weeks remain)" or "— all 19 remaining weeks of pay ($Y; fewer than 26 weeks remain, so no cap applies)". Then: remaining duration in weeks and date; remaining guaranteed compensation; the exact charge; effective employment end; "leaves the roster this week as a free agent; any studio may sign them; asks no less than $Z a year from this studio until 1934 · Week 12 (§3.5); recorded credits and career history stay on the record"; and, when P14B exists, "1 active promise will be BROKEN". The sheet already carries `currentRemainingWeeks` and `guaranteedRemaining`, so both branches can be exact.
- **Earned unpaid obligations** are none in the accepted economy; the rule is stated so that a later P11 obligation kind is included automatically. **Unearned optional incentives** do not exist in the six-key contract; the rule excludes them by name so a later contract law cannot silently add them.
- **P11 booking.** Lump sum through the existing `termination` kind, categorized as today ("Termination payments"; folded into Other Cash; never recurring cost, Upcoming or runway); the finance consequence envelope already shows the immediate cash change and the drop in guarantees. A charge paid over time would be a new finance root and an Owner gate; the package keeps lump sum.
- **Old saves.** The rule is versioned: the ledger row (or a rule stamp) records the basis under which the charge was computed, and the validator checks against the rule in force at `endedWeek`, so saves carrying a 50%-era termination still load.

### 3.5 Exploits examined, and the recommended guard

**E1 — fire, then immediately re-sign the same `PersonId` on cheaper terms.** Round-trip cost when at least 26 weeks remain: the charge (½ of the old annual) plus a fresh signing bonus (18% of the new annual). Saving: (old annual − new annual) × remaining years. With the new ask a fraction (1 − d) of the old, the round trip pays when `d > 0.68 / (Y + 0.18)`, `Y` = remaining years:

| Remaining | Break-even ask drop *d* (selected) | today's 50% | discarded 5% |
|---|---:|---:|---:|
| 8–26 weeks | never (charge = full remaining pay) | 63–77% | 30–56% |
| 52 weeks | 57.6% | 57.6% | 19.5% |
| 104 weeks | 31.2% | 54.1% | 12.8% |
| 156 weeks | 21.4% | 52.8% | 10.4% |
| 200 weeks | 16.9% | 52.2% | 9.2% |

Worked case: STAR at $2,064,000 with 200 weeks remaining, ask fallen 30% → saving $619,200 × 3.85 = $2,383,920; cost $1,031,992 + $260,064 = $1,292,056; **net gain $1,091,864**. Under today's rule the same round trip loses about $1.85M, so today's rule contains E1 by brute force and the selected cap opens it. In the accepted economy an in-term ask can fall only through fame loss (at most 4 points per released film, only on visible failures), because skills never decline and age never changes; reaching a 17–21% drop on a long deal needs three or more consecutive visible flops of a star early in the contract. The window is narrow today and **widens as soon as P14C aging exists** (the age factor alone moves an ask 15% from prime to the floor) or P13 salary scaling lets asks move. The 5% candidate opens it at 9–13% drops, inside one flop or the jitter band. Term switching alone never pays under the selected rule (a one-year 1.08× to four-year 0.90× switch is a 16.7% drop at ≤ 52 weeks remaining, where the break-even is 57.6%).

**E2 — deliberate short-contract exploitation.** With ≤ 26 weeks remaining the charge equals remaining pay, so a late release saves only the accepted $1,500/week per-employee overhead and worsens liquidity (a lump today, possibly negative cash, against weekly pay). Inside the last 12 weeks, renewal already re-prices the tail at the current ask with no charge, so fire-and-re-sign is strictly dominated by renew. Nobody games the tail. Between 27 and 51 weeks the release saves (remaining − 26) weeks of pay at the price of losing the person's work: a genuine roster decision.

**E3 — signing-bonus interaction.** The bonus is sunk at signing and never refunded; a re-sign pays it again. It is a natural friction of 0.18 × annual on every round trip and is why the break-even never reaches zero, but it is weak on long terms (it lifts the 200-week break-even only from 13% to 17%). Not a sufficient guard. The contract-then-fire-as-freelancer pattern stays 1.5× a freelancer fee under the cap (MID: $394,008 against $262,500; 1.26× if fired on the first shooting day), so the freelancer premium survives.

**E4 — rival symmetry.** Rivals never terminate today. Under symmetric law a rival that releases early pays the same charge from its finite Cash under a new `termination` movement kind and is bound by the same guard. Cost check for a MID-level six-person team: weekly operating ≈ $78,522, reserve 13–20 weeks ≈ $1.0–1.6M; a MID release on a fresh four-year deal costs $236,262 ≈ 3 team-weeks (inside the reserve), a STAR release ≈ 12 team-weeks (rich rivals only). Today's 50% rule would cost ≈ 11.6 team-weeks for a MID release (rivals could essentially never release, mirroring the harness finding that the player never does); the 5% rule ≈ 1.2 weeks (rivals would churn). The cap is the one rule under which symmetric rival release is both affordable and non-trivial. Until the movement kind lands, the asymmetry is "rivals cannot fire", which favors the person, not the player.

**E5 — late-contract weirdness.** None: `weekly × min(remaining, 26)` is continuous at 26 weeks; there is no cliff, no incentive to time a release to a week boundary, and the renewal window interaction is the benign one in E2. One presentational oddity is fixed by the two copy branches of §3.4.

**E6 — the term-choice lean: "sign everyone for four years and fire freely."** For a person of constant value a four-year deal already costs 3.76 annual-equivalents over four years against 5.10 for four rolling one-year deals, because of the accepted length factor and one bonus instead of four; the cap adds to that lean. Against an *honest* term of known length the four-year-and-fire strategy still loses (MID: +18.6% if cut after one year, +10.6% after two, +9.6% after three), so it is not a dominant strategy against honest terms (the 5% candidate would have been: 4-year-and-fire cheaper than every honest shorter term). But against rolling one-year deals it wins from the second year, and for short holds the flat cap makes the 208-week deal cheaper than the 52-week deal for **every hold ≤ 38 weeks** (the one-year's 1.08× multiplies both its pay and its own 26-week charge, and its bonus is larger). In expectation, the break-even probability of keeping a hire beyond year one falls from **46% under today's rule to 15% under the cap**. This is not an exploit against the person (they receive 26 weeks of pay and become free agents), and its driver is the P10 length factor, which keeps paying the studio a discount for tail risk the cap no longer makes it bear. The package **does not retune the cap**; it records the consequence and the playtest signal (monotone four-year signing) and names the smallest levers if the Owner ever wants the term decision to stay live: flatten `CONTRACT_LENGTH_FACTOR` (a P10 tuning matter), give the person-choice rule a term preference (§2.1.7), or, changing the selected law, make the cap term-aware (`max(26, termWeeks/4)` weeks ⇒ 26/26/39/52 for 1/2/3/4-year contracts, which restores a 34% break-even and raises the 200-week fire-and-re-sign break-even from 16.9% to 29.3%). The last is listed for completeness only; it is not recommended and not asked.

**E7 — firing to escape a promise (P14B).** A release with an active promise makes the promise BROKEN (studio-caused) and records the trust driver; the charge does not buy out a promise.

**The guard: a persistent salary expectation toward the releasing studio (recommended, R1).** For the terminated contract's original term, i.e. until its original `endWeekExclusive`, the person's ask toward the releasing `StudioId` is floored at the terminated contract's `annualSalary`: `ask = max(marketAsk, floor)`. Consequences: E1's saving is zero by construction (new annual ≥ old annual), so the round trip always loses the charge plus a bonus at every remaining term; a genuine re-hire remains legal at the old price or better ("you guaranteed me $X"); a term reset (buying down 200 guaranteed weeks into a fresh one-year deal at the old rate) is a legitimate purchase, not an arbitrage; a person whose value rose is unaffected; rivals can still hire the person at the market ask, which is the honest cost of having released them; the rule is one sentence in the confirmation and one reason line in the offer options; it is symmetric for a rival that releases; it is deterministic; and it needs **no new persisted fact**, because the memory is already in the accepted employment ledger (the player's row with `endedWeek < terms.endWeekExclusive` and its `termination` receipt) — one `max()` in `contractOffer` keyed by the offering studio, with the stateless Full-Custom preview path left floor-free. In P14B the same event also becomes a trust driver ("Terminated early by Studio X, 1931"), which is the successor to the original's Mood memory on rehire.

**Alternatives evaluated and not recommended as the primary guard.**

| Alternative | Why not |
|---|---|
| Re-sign cooldown of N weeks (26 or 52) | Does not close E1 when remaining term exceeds N: in the STAR case a 52-week cooldown still leaves ≈ $470k net gain (saving over the remaining 148 weeks $1.76M against $1.29M cost). Closing it needs N ≥ remaining term, which is the floor's duration with re-hire forbidden instead of repriced. Cruder, blocks legitimate re-hire, needs an arbitrary constant. |
| Trust/refusal consequence alone | The right P14B companion (the original's Mood memory on rehire is the parity anchor), but as the only guard it is a cooldown in narrative dress with the cooldown's weakness unless permanent, and it would pull trust into P14A. Recommended as an addition in P14B, not a substitute. |
| Anti-arbitrage top-up: charge = max(26-week cap, (old ask − new ask) × remaining) | Also closes E1 exactly, but is charged on every release including a person the studio simply no longer wants, grows as the person's market value falls (STAR: 2.3× the cap), depends on a counterfactual ask the player never sees, and re-creates the "too poor to stop paying" trap the ungated-release ruling exists to prevent. It changes the Owner's charge law rather than guarding it. |
| Combinations | The floor alone closes every price motive; adding a cooldown removes only legitimate play; adding refusal drags in P14B. |

**Does a materially different gameplay alternative remain for the Owner?** No. The floor and the top-up produce the same round-trip economics; the cooldown and the refusal are strictly less permissive without closing the exploit. The guard is therefore IMPLEMENTATION RECOMMENDATION R1, not an Owner question.

### 3.6 Severity verdict and the smallest additional guard

The selected rule produces one severe exploit, E1, and the floor closes it. No second guard is needed. Two consequences are surfaced without a guard: E6 (the term lean, a P10 tuning matter with a named playtest signal) and E4 (rivals cannot fire until the `termination` movement kind exists — a governed change to `RivalMoneyKind`, the period exact-key shape, the rival finance reconciliation, an end-reason marker and a rival decision path, recommended as **Ready** work in P14A so that the Core checkpoint does not carry a persistence widening it does not need to prove). Two implementation hazards ride with the charge change and are Core: the versioned termination rule for existing saves (§3.4) and the busy-set refusal (R2).

---

## 4. Promise catalogue and feasibility (P14B) — deliverable E

**Direction it realizes:** rulings §3.4.1 items 5, 6 and 7. **Class:** IMPLEMENTATION RECOMMENDATION throughout; every number is a NUMERICAL/CONTENT HYPOTHESIS.

### 4.1 What a promise is, in Project: Studio terms

A promise is a typed, versioned commitment from one studio (`StudioId`) to one person (`PersonId`), attached to a proposal at the market (P14A) or to a renewal, that names an objective predicate over authoritative facts the studio's own actions can satisfy, a qualifying window, and an outcome. It is never free text and never a salary term. It is evaluated only by events that can change its predicate and by its due week; it is never polled every week. The record is named `ProfessionalPromise` because `Promise` is already the accepted screenplay-promise type.

Every record carries: `promiseId` (P14-minted, in-state ordinal), `family`, `version`, `issuerStudioId`, `beneficiaryPersonId`, typed `predicate` parameters, `windowStartWeek`, `dueWeekExclusive`, the `feasibilityReceipt` (classification at offer time, inputs digest, rules version), bounded event-derived `progress`, `evidenceRefs` (production / film / assignment ids by reference), `outcome`, `outcomeWeek`, typed `outcomeCause`, and the `contractId` it rode in on.

### 4.2 The initial catalogue: five families

| Family | Predicate (objective, from authoritative facts) | Qualifying event that counts | Owner of the fact consumed | Example offer copy |
|---|---|---|---|---|
| **P1 APPEARANCE_COUNT** | the person is a cast participant on at least X distinct productions of the issuing studio whose first actual filming week falls inside the window | the production enters its `shooting` phase with the person in `cast.lead`, `cast.antagonist` or `cast.support` | production lifecycle; P10 credits | "Cast in at least 3 pictures by 1934 · Week 1" |
| **P2 LEAD_ROLE_COUNT** | as P1, restricted to `cast.lead` | shooting entry with the person as `cast.lead` | production role structure; P10 credit role | "At least 1 leading role by 1933 · Week 26" |
| **P3 DIRECTING_COUNT** | the person is the director of record on at least X productions whose first filming falls inside the window | shooting entry with the person as `directorId` | production lifecycle; P10 credit | "Direct at least 2 pictures within this contract" |
| **P4 PREFERRED_GENRE_OPPORTUNITY** | at least one qualifying seat (class chosen at offer time) on a production of genre G whose first filming falls inside the window | shooting entry of a genre-G production with the person seated | `FilmConcept.genre` (fixed at commission); production lifecycle | "A romance role within 78 weeks" |
| **P5 SPECIFIC_PROJECT** | a qualifying seat (lead / cast / director, chosen at offer time) on the named existing script project P, with first filming inside the window | shooting entry of P's production with the person in the named seat | script project / concept identity; production lifecycle | "The lead in *Harbor Lights* when it shoots" |

**Why "first actual filming week" is the qualifying event.** It is the seam P13's Owner direction already fixed as "in-flight" (rulings §2.4.1 item 8): creation, development, greenlight and queue entry lock nothing; first actual filming does. In the accepted runtime that is the entry into the `shooting` phase (remaining ticks 5), gated on the locked director being assigned, the scenery load-in cleared and the take scheduled. Counting at release would make a kept promise depend on post-production and release-commit timing the person cannot see; counting at greenlight or casting would let a studio satisfy a promise on paper and then cancel. The seat must be held when shooting starts. A production cancelled after first filming does not un-satisfy a promise already satisfied; it is recorded as evidence and is a legitimate later trust or relationship driver if the studio caused it.

**Antagonist.** Whether `cast.antagonist` counts as a "leading or significant role" for P2 is a catalogue content decision with modest gameplay effect (billing weight 0.7 against the lead's 1.0). Recommendation: P2 counts `cast.lead` only; a separate `SIGNIFICANT_ROLE_COUNT` (lead or antagonist) is a later family. Listed under §7.2, not asked.

**Writers.** A `WRITING_COUNT` family (screenplay commissions credited to the person) is the obvious sixth member and is deliberately not in the initial catalogue: the Owner listed five, and a writer's qualifying event (commission accepted versus screenplay completed versus filmed) needs the P13-refreshed development seam. LATER FEATURE / NON-BLOCKER with the shape ready.

**Not in the catalogue, by direction.** "Make me famous", "make me a bigger star", "win me an award", "top billing over person B", "a salary rise next year": the first three lack an objective lawful predicate until a later system supplies one, billing order is not a recorded fact, and salary is a contract term.

### 4.3 The feasibility service

The service answers one question at offer time: *does the studio's own authoritative schedule show a reasonable path to satisfy this promise?* It is deterministic, consumes no RNG, reads only committed state, and writes a `feasibilityReceipt` that the promise carries for its life so a later reviewer can see exactly why it was offerable.

#### 4.3.1 Inputs, all by reference to their owners

| Input | Owner | What the service reads (accepted facts) |
|---|---|---|
| Person availability | P10 contract; production lifecycle; P14C | the proposed contract's `[startWeek, endWeekExclusive)`; weeks committed to active production seats (reserved through release) and writing assignments (`busyTalentIds` sources); any announced retirement effective week; already-active promises for this person that consume the same seats |
| Window | the promise | `[windowStartWeek, dueWeekExclusive)` must lie inside the proposed contract; a window past the contract is IMPOSSIBLE by construction |
| Actual production durations | production lifecycle tuning | the fixed eight-week countdown (development 1, pre-production 1, rehearsal 1, shooting 2, post 2, release-ready 1), so first filming is the fourth week after greenlight on schedule; screenplay draft 1 week (pool) or 1–6 weeks (original); optional casting session 1 week; scenery load-in 1–5 weeks from stage acquisition; every phase may hold on a capacity blocker, so these are floors |
| Current projects | script development, queued intents, active productions | each script's status, genre and writer; each production's phase, remaining ticks, seats filled and persisted blocker; queued intents (which hold nothing and are revalidated at dequeue) |
| Facility and capacity constraints | P09 facilities; occupancy | stage slots (founding: two stages × 1), shared development-casting slots (2), scenery (2), post (2); under-construction facilities with `completesWeek`; usable standing sets per stage |
| Studio pipeline throughput | derived | the service derives its own bound: each picture occupies a stage slot for at least three consecutive weeks (rehearsal + two shooting), a development-casting slot for at least two weeks plus its draft and any audition, and a post slot for at least two; there is **no forward schedule** in the accepted runtime, so the service counts only started productions, queued intents, existing scripts, and lawful new commissions with the minimum pipeline |
| Already-active promises | P14B | seats those promises reserve inside the same window, subtracted before this promise is classified |
| Scheduling conflicts | production lifecycle | a person holds exactly one seat per production and cannot be in two active production companies; seats are counted sequentially |

#### 4.3.2 The classification rule

Let `N_max` be the largest number of qualifying events the service can schedule for this person inside the window under the inputs above, counting only paths the studio controls (commissioning, greenlighting, casting) and never a rival's action, a market outcome or an award. Let `X` be the promised count (1 for P4 and P5).

- **REASONABLY ACHIEVABLE — may be offered:** `X ≤ N_max − buffer`, where `buffer` is the safety margin (hypothesis: one event, or 25% of `N_max` rounded up, whichever is larger), **and** at least one path uses only projects and facilities that already exist. The receipt records the path.
- **THEORETICALLY POSSIBLE / FRAGILE — not offered by default:** `X ≤ N_max` but inside the buffer, or every path requires something not yet in the pipeline (a new commission, a facility under construction, a seat currently held by someone else), or the path leaves fewer than the minimum slack weeks (hypothesis: 8) before the due week.
- **IMPOSSIBLE — never offered:** `X > N_max`; or the window is outside the contract; or the retirement boundary or active promises already exhaust the seats; or (P5) the named project has begun filming with the seat filled or is already produced; or (P4) the genre is not producible in the window under any lawful path.

FRAGILE is not "offer it with a warning". The recommendation is that FRAGILE candidates are shown as "not offerable: reason" with the exact bottleneck (capacity, time, an existing promise) so the player can change the schedule and re-run the service. Whether an explicit, labeled player override for FRAGILE promises should ever exist is a genuine product question (§7.3 Q1).

#### 4.3.3 Worked examples under the accepted durations (NUMERICAL/CONTENT HYPOTHESIS)

*Example A.* A two-year renewal (104 weeks) for an actor at a founding-plant studio (two stages, two development-casting slots). Pipeline today: one production in rehearsal (first filming next week, lead seat filled by someone else, support seat open), one script ready (genre drama), one script drafting (due in 3 weeks). Seats the actor can hold sequentially: the support seat now (filming week +1); the ready script after greenlight (filming ≈ +4 weeks, but the second stage is free only after the first picture wraps, ≈ +4), so ≈ +8; the drafting script (≈ +3 draft, +1 casting, +4 to filming = +8, stage contention pushes to ≈ +11); then commissions: with two stages and a three-week stage occupancy per picture, the studio can start at most ≈ 2 × 104 ÷ 3 ≈ 69 pictures in theory, but development-casting slots (2 × 104 ÷ (2 + draft 3 + 1) ≈ 34) and the actor's own sequential seats (each ≈ 3 weeks of stage time plus the pipeline) bind first: `N_max` for one person ≈ 104 ÷ 8 ≈ 13 if everything else is idle, and far fewer once other productions compete. The service counts the existing three plus the commissions that fit with slack: say `N_max = 6`; buffer 2 → P1 with X = 3 REASONABLY ACHIEVABLE, X = 5 FRAGILE, X = 7 IMPOSSIBLE.

*Example B.* Same actor; an active promise to another actor reserves the lead in the ready script, and the actor's own active P2 promise consumes the drafting script's lead. A new P2 (lead) with X = 2 inside 104 weeks: only later commissions remain, every path needs a project not yet in the pipeline → FRAGILE. X = 1 with a 78-week window → REASONABLY ACHIEVABLE only if a commission started this week reaches first filming with ≥ 8 weeks slack (draft ≤ 6 + casting 1 + 4 = 11 weeks; 78 − 11 = 67 ≥ 8 → yes, provided a development-casting slot is free; else FRAGILE).

*Example C.* P5, the lead in an existing script already in casting whose lead seat is empty and whose first filming is expected in about five weeks; the person's contract starts next week → REASONABLY ACHIEVABLE. If the seat is already filled → IMPOSSIBLE (there is no recast verb, and replacing the person would be a studio action the service must not assume). If the project is produced → IMPOSSIBLE.

*Example D.* P3 for an actor transitioning to Director (P14C): the service counts director seats and requires the person's profession at contract start to be Director (a P10 profile fact); otherwise IMPOSSIBLE.

*Example E (rival symmetry).* A rival runs one production at a time and at most two scripts; its `N_max` for any person over 104 weeks is bounded by ≈ 104 ÷ (draft + 8 + 1) ≈ 8 and by its policy; the same rule classifies its promises.

### 4.4 Outcomes

| Outcome | Rule | Trust effect (P14B) | Who records the cause |
|---|---|---|---|
| **SATISFIED** | the predicate is met by a qualifying event before `dueWeekExclusive` | positive material-conduct driver, once | the qualifying event's own receipt |
| **BROKEN** | the due week passes unsatisfied and no VOIDED or WAIVED rule applies; includes every studio-caused shortfall: never commissioned, cast someone else, cancelled or shelved the project, ran out of capacity, released the person early | negative driver, once; the strongest single driver in the catalogue | the due-week evaluation |
| **WAIVED** | before the due week the studio proposes a waiver and the person accepts it under the deterministic acceptance rule (hypothesis: accepted when a substitute promise of equal or higher family class with a feasible receipt is attached, or when the person's own announced retirement or profession transition makes the promise moot; refused by a person whose trust record of the studio is Distrusted) | none; recorded and visible | the waiver receipt |
| **VOIDED (IMPOSSIBLE_EXTERNAL)** | the predicate became unsatisfiable through a typed cause not attributable to the studio: the person's own announced retirement effective before the window can be used; the person's profession transition; a later P15B closure or dormancy of the issuing studio under its own law; a case-time departure the person chose (prevented by construction since windows lie inside the contract, kept as a guard) | none; the record says VOIDED and why | the external event's receipt |

Outcomes are terminal and emitted once; duplicate evaluation is refused by receipt id. BROKEN never converts to VOIDED after the fact, nor VOIDED to BROKEN. Promise due weeks appear as a new committed commitment kind in the studio calendar read model, not on a second clock.

### 4.5 Trust: professional memory, not a meter

Trust is a bounded, public, evidence-backed summary derived from material conduct events between one person and one studio, plus a studio-level aggregate every person in the market can see. Its inputs are exactly: promise outcomes; early termination by the studio (a P14A event); contract renewals honored to expiry; cancellation of a production the person was seated on after first filming. Nothing else feeds it. Each input is a typed driver with a weight and a recency horizon (hypothesis: drivers older than 260 weeks leave the current tier but stay in history).

Public descriptors (hypothesis): `Reliable`, `Mixed record`, `Distrusted`, with the top three drivers listed beside the label ("Kept 2 promises · Terminated early 1931 · Broke 1 promise 1933"). Consequences: a ranked descriptor in the P14A person-choice rule; refusal to accept a promise or a waiver from a Distrusted studio; the P14B trust driver that accompanies the firing guard. Trust is per (person, studio) with a studio-level public aggregate; it is never a hidden multiplier on money, quality or luck, and it lives in the P14 root, never on `Talent`.

---

## 5. Relationship model (P14B) — deliverable F

**Direction it realizes:** rulings §3.4.1 items 12 and 13. **Class:** IMPLEMENTATION RECOMMENDATION; every threshold, weight and horizon is a NUMERICAL/CONTENT HYPOTHESIS.

### 5.1 Original *The Movies* evidence → what it establishes → how P14B carries it

| Original behavior | Evidence (local corpus, SHA-256s unchanged since the August design) | Confidence | Carried into P14B as |
|---|---|---|---|
| One pairwise 0–100 scalar per pair of Stars with seven named bands: Nemeses 0–10, Enemies 11–30, Acquaintances 31–60, Friends 61–70, then Best Friends / Soul Mates / Lovers (71–80 / 81–90 / 91–100) for different-gender pairs and Good Friends / Best Friends / Soul Mates for same-gender pairs | `relationship_levels.csv` `RELLEVEL_*`; Prima relationships chapter; `CONFLICT_001` (IGN/GameSpot less granular, not contradicting) | HIGH (developer-reviewed) | the tier ladder of §5.3, one ladder for every pair regardless of gender (direction 13) |
| Every pair starts at a random 45–55 baseline; untended relationships decay up **or** down toward that baseline, never to zero; decay rate venue-dependent (lot fastest, restaurant slowest); no numeric rate recovered | `FACT_003`, `FACT_004`; socialmod `degrade` field (schema only) | HIGH (shape), rate ABSENT | decay-to-baseline for CURRENT closeness (§5.5); the rate is a hypothesis |
| Built by directed chats and a six-venue ladder (Bar → VIP → Restaurant → VIP → Trailer); also by rehearsal, filming and casting contexts (engine schema `REHEARSE`/`FILM`/`CASTING`); people who worked together before had "marginally better relationships" (GameSpot) | `FACT_002`; technical-artifact register; Bible | HIGH for venues; schema-level for work | work-driven growth only (§5.4); venues rejected as the grind the Owner excluded |
| Relationships weighed 7% of Star Rating (engine raw 0.07); Production Quality's relationship component = average of cast relationships with the actor–director pair counted double; chemistry was that value read at production, not a separate stat | `star_rating_components.csv`; `movie_rating_pipeline.json`; `FACT_006`; `original_formulas.json` | HIGH | chemistry consequences, bounded and disclosed (§5.6); no composite rating |
| Blockers halted relationship building (addiction, stress, salary bar < 10%, image bar < 10%); fights at Nemeses/Enemies were photo-worthy; the "Free Love" award accelerated growth; Mood was affected indirectly (photo events, "easier to manage") | `FACT_005`; Photo-Worthy Events table; award directory | HIGH for events; Mood link indirect | Mood does not exist in Project: Studio; production and market consequences replace it; press/scandal is LATER FEATURE |
| No marriage, children or family simulation; no discrete dating state beyond the Lovers band; no durable relationship history | corpus absence; `Q019` open | HIGH (absence) | excluded by direction 13; durable history is the successor improvement (§5.5) |

The Owner-supplied independent review is corroborated by the corpus on every relationship finding; the corpus adds that the Mood link was indirect and that no decay rate is recoverable.

### 5.2 What Project: Studio changes, deliberately

1. **Two facts per pair, not one.** CURRENT closeness (bounded; decays toward the neutral baseline) and CAREER history (durable: collaboration counts, first and last shared work, peak tier with dates, notable events). "Legendary collaborators of the 1940s who have not worked together since 1958" is a cooled current tier over an intact history.
2. **Evidence before tier.** A pair has a retained edge only after a qualifying shared-work event. No all-pairs matrix; no weekly scan; the tick touches only pairs named by this week's typed events.
3. **Every change has a reason the player can read.** The profile shows drivers, not a number: "Worked together on 4 films · 2 recent successful collaborations · Lost the lead to her in 1936 · Long period without shared work · Current: Close Friends". Any numeric effect on production or the market carries that reason list.
4. **No social commands.** The player fosters relationships by casting people together, pairing a director with a lead, keeping collaborators under contract, and honoring commitments. Social events as a driver are LATER FEATURE / NON-BLOCKER.
5. **One ladder for all pairs.** Romance is available to any pair under the same rule; nothing about gender enters the rule.
6. **Evidence joins on employment intervals, not Industry credit rows.** The accepted Industry projection attaches the *current* employer to every credit; P14B derives "worked together at Studio X in 1934" from `FilmParticipants` / `HollywoodCredit` pairs on the same film joined to `hollywood.employment` intervals by week.

### 5.3 The ladder (CURRENT tier): evidence-backed classifications over a bounded closeness value

| Tier | Meaning in Project: Studio | Original analogue |
|---|---|---|
| **Nemeses** | open hostility on the record; disclosed production penalty when seated together; reluctance to join the same studio | Nemeses 0–10 |
| **Enemies** | recorded conflict; disclosed penalty | Enemies 11–30 |
| **Strained** | recent negative driver without a conflict record; small disclosed penalty | lower Acquaintances |
| **Acquaintances** | neutral baseline; no effect | Acquaintances 31–60 |
| **Colleagues** | productive working relationship; small disclosed chemistry bonus | upper Acquaintances / Friends |
| **Friends** | repeated positive collaboration; chemistry bonus; mild market preference for the same studio | Friends 61–70 |
| **Close Friends** | sustained collaboration and shared success; stronger bonus; market preference | Best Friends / Good Friends 71–80 |
| **Inseparable** | deep bond (Soul-Mate territory); strongest professional chemistry; strong market preference | Soul Mates 81–90 |
| **Partners** | genuine romance, reached from Inseparable under §5.4's rule; Inseparable's chemistry plus a disclosed shared-studio preference and a recorded event on formation and ending | Lovers 91–100 (any pair) |

Tiers are derived from the closeness value and the evidence record by a versioned rule; the value is never shown, the tier and drivers are. Mentorship and professional rivalry, the August classifications, survive as **evidence labels** that decorate any tier ("Mentor: directed her first three pictures"; "Rivals for the lead in 1932 and 1934"), not as tiers. Every label is defined with its evidence rule (register HIS-014).

### 5.4 Drivers: what moves closeness (shape, not values)

| Driver (typed event) | Sign | Evidence | Notes |
|---|---|---|---|
| Shared production (both seated on a production that reached first filming) | + | production reference | weight by proximity: director–lead and co-leads highest; supporting–supporting lowest; writer seats count at the lowest weight because a credit is not a set presence |
| Shared released film that succeeded (P07 result above a threshold) | + | film result reference | the "we made something good together" bond |
| Shared released film that failed | − (small) | film result reference | strain, not enmity; decays quickly |
| Repeated collaboration (Nth shared production) | + (increasing, capped) | count | the accelerator; the original venues are replaced by repetition |
| Casting competition lost (both auditioned in the same casting session for the same slot; one was chosen) | − | casting-session references | the principal source of negative relationships; explainable and studio-caused; there is no recast verb in the accepted runtime, so "replaced as lead" becomes a driver only when one exists |
| Repeated competition for the same seats | − (small) | casting references | professional-rivalry evidence |
| Production cancelled after first filming with both seated | − (small) | cancel receipt | shared setback |
| Shared award or honor (P08, when delivered) | + | award reference | consumed by reference only |
| Long period without shared work | drift toward baseline | time | §5.5 |
| Romance formation | tier change | rule | from Inseparable, when both are unpartnered under the rule, deterministic; no RNG |
| Romance ending | tier change | rule | after a sustained negative driver or a long dormancy; recorded; the pair returns to the tier its evidence supports, never below Acquaintances on ending alone |

**Compatibility prior.** The original used hidden personality to speed or slow growth. Project: Studio may use the accepted public `temperament` descriptor (derived from perceived persona) to scale driver gains by a bounded factor, disclosed in the drivers list ("Compatible temperaments"). If the Owner prefers no prior, every pair grows at the base rate. Recorded as a genuine product question (§7.3 Q2) because it changes whether any two people can become Inseparable through work alone.

### 5.5 Decay and history

- CURRENT closeness drifts toward the Acquaintances baseline over a dormancy horizon (hypothesis: no drift for 52 weeks after the last shared event, then a linear return to baseline over 260 weeks). Negative tiers drift toward baseline too, as the original did; a Nemeses pair that never works together again cools to Enemies, then Strained, then Acquaintances, and the conflict stays in history.
- CAREER history is append-only: collaboration counts, first/last shared work week, peak tier and when reached, every tier transition with its driver, every notable event. Paged, never embedded per frame.
- Partners are exempt from ordinary drift while the tier holds (ending is a rule, not decay).
- Dormant edges leave the hot index; a new qualifying event restores them from the compact summary.

### 5.6 Consequences: production chemistry and market preference

| Consumer | Effect | Disclosure |
|---|---|---|
| Production quality (owner: the production result law) | a bounded modifier from the director–lead tier and the co-lead tier, in the spirit of the original's double-weighted actor–director relationship; positive for Colleagues and above, negative for Strained and below | the production detail lists "Chemistry: director–lead Close Friends (+), co-leads Strained (−)" with drivers |
| Casting and seating | Nemeses/Enemies seated together produce the penalty above and an explicit warning before commit; no refusal in the first slice | the casting confirmation states it |
| P14A person-choice rule | a public descriptor "works with friends here" ranks a studio higher when the person's Close Friends / Inseparable / Partners already work there, lower when Enemies / Nemeses do | the chooser receipt lists it among the top reasons |
| P14A retention | a Partner or Inseparable collaborator leaving at expiry is an attention item, not a hidden penalty | attention copy names the pair |
| Star Power (P10) | none: the original's 7% relationship weight in a composite rating is not reproduced; Star Power stays a P10 commercial fact | — |

Chemistry consumption is a **SHARED GENERALIZATION** with the production result owner: P14B publishes a `pairChemistry` read-only projection with reasons; the result law decides whether and how to consume it, inside its own accepted formula, with the effect bounded by a constant the result owner sets. P14 never writes a quality number.

### 5.7 Performance and persistence shape

- Edge key: canonical `(min(PersonId), max(PersonId))`; hot index only for edges with a non-neutral current tier or a recent event; cold, paged history for everything else, at the projection layer (no segmented store exists).
- Weekly cost: proportional to the week's shared-work events, never to the population.
- The August stress envelope stands (2,500 people, 25,000 retained driver events after compaction); reconciliation §6 says what P12's disclosed qualifications imply.
- Old saves: no edges are fabricated from old credits by default. A truthful, labeled *reconstruction* of collaboration counts from existing film credits ("Worked together on 2 films (reconstructed at migration)") is a genuine product question (§7.3 Q3).

---

## 6. Career lifecycle model (P14C) — deliverable G

**Direction it realizes:** rulings §3.4.1 items 9, 10, 11 and 14. **Class:** IMPLEMENTATION RECOMMENDATION; every age, horizon and count is a NUMERICAL/CONTENT HYPOTHESIS.

### 6.1 Aging

- **Age is derived, never incremented.** Each person carries birth provenance: `authored_exact_week` for cohort entrants and newly authored people; `legacy_age_anchor { ageAtMigration, migrationWeek }` for everyone who exists in a pre-P14C save with only the stored `age` (a continuous float for worldgen people, an integer for authored ones; the UI floors it today). Current age = f(provenance, `market.tick`), computed on read through `campaignDate`; the stored leaf is preserved and stops being the authority once provenance exists.
- **Actual age advances normally** for every persistent named professional: actors, directors, writers and craft leads alike, rival employees under the same law, and any profession P13 adds (POST-P13 REFRESH REQUIRED).
- **Apparent age is a seam, not a system.** `apparentAge` = actual age unless a later, separately owned system records a dated adjustment. P14C defines the field and its provenance; it never builds cosmetic surgery (the original's Nip & Tuck is corpus evidence, not P14 scope).
- **What age may affect (direction 9).** For performers, an apparent-age fit descriptor per genre that casting and the production result may consume by reference (SHARED GENERALIZATION, bounded, disclosed). The original's developer-reviewed ideal apparent ages (Action 30, Comedy 40, Horror 37, Romance 25, Sci-Fi 28; MEDIUM confidence, single-sourced) are the parity anchor; Project: Studio's genres are comedy, drama, crime, romance, horror and adventure, so the descriptor is authored per accepted genre with the original as guidance, not copied. Market demand and value already flow through the accepted contract ask (`ageFactor`, a bell centered at 34 with a 0.85 floor), which is P10's to retune per profession; development pace already slows with age through `ageRunwayMult` and stays as is. Retirement eligibility (§6.2). Directors' and writers' fit descriptors are flat by default: the Owner-supplied review states Directors were much less affected, and the corpus neither corroborates nor contradicts it, so this is direction rather than parity.
- **What age never does:** decrement a skill, a genre experience, a ceiling, a development rate or Star Power. The accepted development law only raises actuals toward ceilings; P14C adds no decay path.

### 6.2 Retirement

**Eligibility.** Profession-specific eligibility windows (hypothesis, anchored to the original's Star retirement at 70 and market-value peak at 55: performers eligible from 60 with a hard boundary at 70; directors and writers from 65 with a hard boundary at 75; craft 62/72). The window opens a visible planning fact on the profile; it forces nothing.

**Intent.** A deterministic, versioned intent rule evaluates only at age-boundary due weeks (an in-state due-week bucket, not a scan) and considers age within the window, tenure, recent work (last qualifying event) and the hard boundary. When it fires, the person **announces** retirement with an effective week = announcement week + the announcement horizon (hypothesis: 52 weeks; never earlier than the end of any binding obligation). Announcement is a public event on the profile, the roster, the calendar's commitments and the Talent Market's attention list.

**Obligations first.** Between announcement and the effective week the person completes every binding obligation: seats on productions that have reached first filming (seats are reserved through release), active writing assignments, and the running contract. If an obligation would end after the effective week, the effective week moves to the obligation's end and the move is disclosed; nothing is abandoned and no contract is destroyed. New assignments that cannot complete before the effective week are refused with a typed reason. The predicate is the accepted busy set.

**The one final extension.** At the retirement boundary the current employer, player or rival, receives **exactly one** opportunity, open during a bounded window before the effective week (hypothesis: the last 12 weeks, the accepted renewal window's width), to offer a **one-year extension** at newly proposed compensation. The offer is a normal P10 contract draft with `termWeeks = 52` and `startWeek` = the effective week, priced from the accepted ask curve, submitted through the P14A proposal path (one issuer; no competing studios, since the person is not entering the market). The person accepts or declines under the deterministic person-choice rule with typed reasons (compensation against ask, trust, relationships at the studio, opportunity). Acceptance postpones the effective week by exactly 52 weeks and records `extensionUsed = true`; the extended year cannot be extended again. Declining, or no offer, leaves the effective week in place. A free agent in the window has no employer and no offer. Rivals take the same decision under their policy at their cadence, with the same one-extension limit.

**Settlement.** At the effective week one scheduled P14C candidate commits, all or none: P10 contract end and assignment clearance; P11 obligation-or-none (no severance, no payment: the contract ends at its boundary or was extended to it); P12 roster / employer / exclusivity / interval close with its receipt; P14 `retiredFromProfession` event with alumni status. An uncleared guard records a typed deferral and the next check; nothing partial is written.

**What retirement preserves:** `PersonId`, profile, films and credits, awards and honors, employer intervals, relationships and history, promise outcomes, career chronology. The person leaves active staffing and the market for that profession; the body leaves the lot; the profile gains an alumni summary; every cross-view link still resolves; `state.talent` is never shortened (it is append-only and order-load-bearing).

### 6.3 Profession retirement versus industry retirement

Retirement is recorded **per profession**. A person retired from acting is an alumnus of acting; whether they are retired from the industry is a separate, later fact.

**Transition evaluation.** When a profession retirement commits, and again at bounded later due weeks while the person is below the industry retirement boundary (hypothesis: the profession's hard boundary plus 5 years), the deterministic transition rule evaluates the narrow catalogue:

| Transition | Eligibility inputs (all by reference; P10-owned where marked) | Disqualifiers |
|---|---|---|
| **Actor → Director** | credited acting depth (count of first-filming events, lead count); the accepted `careerIdentity` for the directing discipline (P10: capable when perceived directing OVR ≥ the accepted capability minimum; proven when directing work history > 0); the public expected-potential band for directing (P10); recorded collaboration with directors (P14B evidence: mentorship labels, repeated director–lead work); age below the director hard boundary | not capable in directing; industry-retired; announced industry retirement |
| **Actor → Writer** | credited acting depth; `careerIdentity` and potential band for the writing discipline (P10); recorded collaboration with writers; age below the writer hard boundary | as above, for writing |

The accepted runtime already gives every person all four disciplines' skills, already allows cross-discipline assignment at greenlight, and already distinguishes proven from capable-but-unproven per discipline; there is no hidden "development focus" to consume, and none is invented. The rule is versioned and the receipt records its inputs. It is not automatic at a birthday, and nothing outside the catalogue is evaluated. When it fires, the person **chooses** under the person-choice framework (they may decline and remain an alumnus); a chosen transition commits as: a P10 profession change receipt (P10 owns `Talent.role`; no such action exists today and it is a P10 generalization — after it, the accepted casting and script read models that filter on the primary role admit the person naturally); the P14C `careerTransition` event; market eligibility as a free agent in the new profession (a P14A case can open at the next market cadence); relationships and history untouched. The intended fantasy holds by construction: the legendary actor's credits, relationships, awards and former employers are the same career the new director carries.

**Industry retirement** is the final state: no active profession, no further transition evaluation, alumni for every profession held. It is reached by the hard boundary of the last profession, by declining every transition, or by exhausting the catalogue. The person still exists and is addressable.

### 6.4 Alumni

Alumni is a presentation and eligibility state, not a record type. The profile shell (P10) shows the alumni summary tab: last profession, retirement date, extension used or not, career totals by reference, relationships (current tier frozen at retirement, history intact), promise record, honors. Alumni leave hot indexes (roster, market eligibility, relationship hot edges after dormancy) and stay in cold paged history. Alumni advisory work is LATER FEATURE / NON-BLOCKER.

### 6.5 Deterministic replenishment across the century

Unchanged from the August design in shape (P14 schedules bounded era-aware cohort requests; one-to-one receipts; hard maximum 32 per request; no emergency generation), with three refreshed facts: the August "P10 identity allocator / registration receipt" does not exist, so cohorts mint through one exported primitive owned by P10/worldgen that reuses the accepted isolated-seed idiom (`generateIndustryTalent` + `uniqueIdentity`) and appends to `state.talent`, with the cohort receipt in the P14 root; cohorts author era-appropriate ages and birth provenance (today's mint draws age from N(38, 10) regardless of year); cohorts are keyed to the delivered P12 calendar and take their era context from P13 after acceptance (POST-P13 REFRESH REQUIRED). Appending to `state.talent` changes later hiring-market samples deterministically; that is accepted behavior, not a defect. Retirement never empties the market: the cohort schedule is sized against the accepted population and the retirement law, and its counts are tuning.

### 6.6 Symmetry, isolation and old saves

- The same aging, retirement, extension and transition law applies to rival employees; rivals decide extensions under their policy at their cadence, with the same one-extension limit.
- All lifecycle state lives inside `GameState` (or in caches keyed by the `GameState` object), never in module-level maps keyed by `PersonId`, so Save As copies that share `PersonId`s cannot leak retirement decisions or due queues into one another.
- Old saves: no person starts retired because an inferred boundary already passed; migration anchors `legacy_age_anchor`, opens the lifecycle recording boundary, and applies an explicit grandfathering rule (hypothesis: anyone already past a hard boundary at migration becomes eligible with the full announcement horizon from the migration week). No past retirement, extension, transition or phase event is invented.

---

## 7. Complete decision register — deliverable H

The August design's §23 table and the roadmap's §19.2 rows are retired by this register. Four classes, no others. Nothing in classes 2 and 4 is put to the Owner.

### 7.1 OWNER DIRECTION — SETTLED (2026-09-11 unless dated otherwise)

| # | Settled direction | Source |
|---|---|---|
| S1 | Firing exists; the player may terminate a contracted employee before expiry; it is a recalibration of the existing D-11.9 release, not the parked P14D law | rulings §3.4.1 (1) |
| S2 | Early-termination charge = lesser of all remaining guaranteed base salary or 26 weeks of base salary; base salary = weekly salary, bonus excluded; earned unpaid obligations stay payable; unearned optional incentives excluded unless already guaranteed | §3.4.1 (2) |
| S3 | The 50% figure is not law; the 5% candidate is discarded | §3.4.1 (1) |
| S4 | Anti-exploit protection against fire-and-re-sign is required (mechanism: Future Ops recommendation) | §3.4.1 (3) |
| S5 | Confirmation discloses remaining duration, remaining guaranteed pay, the cap, exact charge, effective end, other consequences | §3.4.1 (2) |
| S6 | Outside studios may compete for free agents and people in the approved expiring/renewal window; no unrestricted in-term poaching; no hidden tampering; no rival exemption | §3.4.1 (4) |
| S7 | Buyouts of a safely contracted employee are not in the initial P14 market | §3.4.1 (4) |
| S8 | A released person may be pursued immediately under normal law | §3.4.1 (4) |
| S9 | Typed, objective, measurable promises approved for P14B; five initial families; salary never a promise; vague promises excluded | §3.4.1 (5) |
| S10 | No promise offered without a reasonable path; the feasibility service and its three classes are required | §3.4.1 (6) |
| S11 | Outcomes SATISFIED / BROKEN / WAIVED / VOIDED; studio-caused failure is BROKEN; external cause may be VOIDED; mutual waiver carries no penalty; trust is professional memory, not a mood meter | §3.4.1 (7) |
| S12 | No mandatory agent; direct market access; lightweight seam only | §3.4.1 (8) |
| S13 | Aging does not reduce craft/experience; age may affect apparent-age fit, role/genre suitability, image/fashion context, market demand/value, retirement eligibility; no "lose N skill at age X" | §3.4.1 (9) |
| S14 | Original evidence is a parity anchor, not automatic tuning; no cosmetic-surgery import | §3.4.1 (9) |
| S15 | All persistent named professionals age and participate in lifecycle rules | §3.4.1 (9) |
| S16 | Retirement: announced with notice; obligations completed; no silent abandonment; exactly one one-year extension opportunity for the current employer at newly proposed compensation; deterministic acceptance; one year exactly; no chain; then final for that profession | §3.4.1 (10) |
| S17 | Retirement preserves identity, profile, credits, honors, employer history, relationships, promise outcomes, chronology | §3.4.1 (10) |
| S18 | Profession retirement is not industry retirement; same `PersonId`; initial catalogue Actor → Director and Actor → Writer; not automatic; no arbitrary hopping; P10 owns profession/profile/development | §3.4.1 (11) |
| S19 | The Movies+ relationship model: positive, negative, acquaintances, friendships, close bonds, deep bonds, romance, enemies/nemeses, chemistry consequences, growth through shared work, meaningful explainable effects | §3.4.1 (12) |
| S20 | No repetitive social grind; work is the primary driver; the player encourages circumstances, never commands "talk" | §3.4.1 (12) |
| S21 | Current closeness may decay; career relationship history never disappears | §3.4.1 (12) |
| S22 | Romance eligibility regardless of gender; no marriage, children, households, lineage, inheritance, domestic needs in P14 | §3.4.1 (13) |
| S23 | P10 / P11 / P12 / P13 ownership unchanged; `PersonId` immutable across every lifecycle change; no card cloning; campaign identity scopes every cache, receipt and pending item | §3.4.1 (14) |
| S24 | P14 boundary and the P14A/B/C shape approved; P12B competitive labor market re-homed to P14A | rulings §1, §3.1 (2026-08-31); P12 → P13 handoff `13370d4` |
| S25 | No hidden poaching dice; deterministic replayable choice; offers are proposals until authoritative resolution; one-employer exclusivity; retirement preserves alumni identity; symmetric player/rival law | rulings §3.1, §4.1 (2026-08-31) |
| S26 | Advanced mobility and buyouts parked; mortality, family, needs parked | rulings §5 (2026-08-31), reaffirmed §3.4.3 |

### 7.2 IMPLEMENTATION / TUNING RECOMMENDATIONS (Future Ops decides at launch review; not Owner questions)

| # | Recommendation | Where |
|---|---|---|
| R1 | Anti-exploit guard: persistent salary expectation toward the releasing studio for the terminated contract's original term, derived from the accepted employment ledger; a P14B trust driver; cooldown, refusal and top-up rejected as primary guards | §3.5 |
| R2 | Release refused while the person is in the busy set (any active production seat or writing assignment) and during the founding draft; effective end = release week; "notice, effective at wrap" is Ready | §3.4 |
| R3 | Rival early termination under the same law as Ready work with a governed `termination` movement kind; rival release ungated as legality, reserve-bounded as strategy | §3.6 |
| R4 | The termination rule is versioned so 50%-era saves still load | §3.4 |
| R5 | Case discovery public at window open; competing-proposal existence, issuer, term and effective week public; salary, bonus and promises UNKNOWN; post-settlement term length public, salary private | §2.1.5 |
| R6 | Incumbent renewal for a person under a case is a proposal settled at expiry (start = old end week); no exclusive negotiating period | §2.1.3 |
| R7 | Rival proposal terms from an authored, bounded policy term model (term preference, premium factor) inside the reserve rule; a P12 policy version bump | §2.1.4 |
| R8 | Person-choice rule as ordered public descriptors with typed top-three reasons and an authored total-order tie rule; no RNG; no array/Map/PersonId order | §2.1.7 |
| R9 | Settlement at the exact expiry phase as a new fixed-order tick step; two unlinked P12 receipts joined by the P14 chooser receipt (no `from → to` receipt) | §2.1.8 |
| R10 | Representation seam = one optional `representation` reference, `null` and validated `null` in P14A | §2.1.6 |
| R11 | Promise qualifying event = entry into the `shooting` phase with the seat held; P2 counts `cast.lead` only; `SIGNIFICANT_ROLE_COUNT` and `WRITING_COUNT` later | §4.2 |
| R12 | Feasibility classification rule, buffer and slack (hypotheses); "not offerable: reason" presentation for FRAGILE | §4.3 |
| R13 | Waiver acceptance rule; VOIDED cause catalogue | §4.4 |
| R14 | Trust descriptors, inputs, recency horizon and consequences | §4.5 |
| R15 | Relationship ladder (nine tiers), drivers, proximity weights, decay-to-baseline shape, Partners exemption; evidence joined on employment intervals | §5.3–§5.5 |
| R16 | Chemistry as a read-only projection consumed by the production result owner within a bound it sets; casting warning for Enemies/Nemeses, no refusal | §5.6 |
| R17 | Aging derived from birth provenance; apparent age as a provenance-bearing seam; flat fit descriptors for directors and writers; ask and development age effects stay P10's | §6.1 |
| R18 | Retirement windows, hard boundaries, announcement horizon 52 weeks, extension window 12 weeks (hypotheses) | §6.2 |
| R19 | Transition eligibility inputs (`careerIdentity`, potential band, collaboration evidence) and the industry-retirement boundary hypothesis; the profession change as a P10 generalization | §6.3 |
| R20 | Cohorts through one exported P10/worldgen mint primitive; era-appropriate ages; counts tuning | §6.5 |
| R21 | Persistence: one governed inner-save step per accepted wave with the projection/schema bump; roots at top level, never inside `hollywood`; caches keyed by the `GameState` object only; receipts stamped with in-state facts only | reconciliation §6 |
| R22 | Term-choice lean under the flat cap: recorded consequence with a playtest signal; levers named (length factor, term preference); no cap retune | §3.5 E6 |
| R23 | Provisional P14A execution ceiling and reserve | §10 |
| R24 | The P14A endurance fixture and the August stress envelope, measured in the accepted encoding against the 192 MiB / 256 MiB bounds | reconciliation §6 |

### 7.3 GENUINELY UNRESOLVED PRODUCT DECISIONS (a human product choice remains; materially different gameplay per option)

| # | Question | Options and consequence | Recommendation | Blocks |
|---|---|---|---|---|
| Q1 | May the player knowingly offer a FRAGILE promise through an explicit, labeled override, or is "not offerable by default" absolute? | Override: more agency, more broken promises by choice, needs override disclosure and a trust consequence when broken. Absolute: simpler, safer, occasionally frustrating when the player intends to reshape the schedule | Absolute in P14B's first slice; revisit after playtest | P14B promises |
| Q2 | Should relationship growth use the public temperament descriptor as a compatibility prior, or grow at one base rate for every pair? | Prior: variety and chemistry surprises, one more public descriptor to explain. Uniform: any pair can become Inseparable through work alone, less texture | Prior, public and bounded | P14B relationships |
| Q3 | At migration, should collaboration counts be truthfully reconstructed from existing film credits (labeled "reconstructed at migration"), or should every migrated pair start with no history? | Reconstruct: long-running campaigns see real bonds on day one; risk of over-reading old data. None: honest silence, but decades-long collaborators show empty bonds | Reconstruct counts only (no tiers), labeled | P14B migration |
| Q4 | Should a Nemeses/Enemies pair be able to refuse a seating outright, or only incur the disclosed penalty? | Refusal: stronger drama, a hard block the player must manage. Penalty: never blocks, always explainable | Penalty first; refusal is a later escalation | P14B chemistry |

### 7.4 LATER FEATURES / NON-BLOCKERS

Opt-out and buyout clauses; in-term approaches and tampering law (P14D / P16+); a representation/agent system; social events as relationship drivers; press or scandal consequences of relationships (P08/publicity); cosmetic surgery / apparent-age manipulation; marriage, children, households, lineage, inheritance, domestic needs; addiction, injury, mortality; `SIGNIFICANT_ROLE_COUNT` and `WRITING_COUNT` promise families; profession transitions beyond the initial two; alumni advisory roles; a "notice, effective at wrap" firing variant; a term-aware cap (listed, not recommended); P15 legacy interpretation of relationship facts; a linked `from → to` P12 transition receipt if Current Ops prefers it to the joined-receipt design.

### 7.5 Retired questions (no longer asked)

Every row of the August §23 table and the roadmap §19.2 table is disposed of above: P12B placement (S24), contract breaking and compensation (S1–S5, S7), poaching scope (S6), promises and trust (S9–S11), retirement law (S16–S17), relationship scope (S19–S22), agency power (S12), settlement timing (R9), career decline (S13), competing-offer visibility (R5), offer decision law (R8), multi-case portfolio scarcity (carried as Ready work under the August §17 admission law), talent supply (R20), advanced mobility placement (S26). The August §24 open questions are disposed of in the reconciliation's stale-statement table and here: the "Star" market tier (still P10-REQ-016 OWNER-BLOCKED, not a P14 question), public preference descriptors at first contact (R8), writers under the same market law (yes; architecture role-neutral), minimum shared-work evidence (R15), mentorship as request versus emergence (emergence; a label), rivalry coexisting with collaboration (yes; labels are independent of tier), waived-promise trust (S11), retirement horizon (R18), alumni advisers (§7.4), persistence backend (answered by the accepted Node file store, reconciliation §6), P15 consumption of relationship facts (public, career-relevant outcomes only; §7.4).

---

## 8. Century scale, persistence and isolation — the rules P14 adopts

Carried from the August design §18–§19 and the Annex §G/§M except where the reconciliation corrected them, and restated here as the binding short form:

1. The 1920–2040 horizon (6,240 weekly ticks) remains the design target; every slice runs the endurance scenario before sealing.
2. P14 reuses P12's campaign and save architecture exactly: named campaigns, Save As, the strict governed migration, the atomic library write, and the additive-root template of `hollywood` (reconciliation §1.9). One governed inner-save step per accepted wave, from the then-accepted head (POST-P13), with the projection/schema bump and the outgoing schema id registered as a prior.
3. Deterministic replay: no RNG in P14A; a later Owner-authorized domain stream only through a reviewed `RngPurpose` widening, keyed by immutable ids, effective week, rule version and purpose, with a persisted outcome receipt; no dependence on array, Map/Set or `PersonId` order; no wall clock, UUID or locale in core.
4. Immutable person and studio identity within a campaign; cross-campaign isolation by construction (all state in `GameState`; caches keyed by the state object; receipts stamped with in-state facts; idempotency per lineage); honest migration boundaries with NOT RECORDED before them.
5. No fabricated pre-P14 relationships, romances, promises, trust, profession changes or retirement decisions; the one labeled exception is Q3.
6. No weekly scan of all person pairs, all career events, all offer history or all retired people; sparse, evidence-backed relationship state; due-week buckets for cases, promises and lifecycle; hot summaries bounded, long history paged at the projection layer (the only accepted paging precedent), never embedded per frame.
7. P12's disclosed performance qualifications are carried verbatim and are not claimed resolved (reconciliation §6); every P14 root is measured in the accepted encoding against the real bounds before its wave seals; P14A.1 must not measurably move Save p95.
8. Settlement, retirement and cohort commits are single state transitions (one canonicalize-and-digest each), never bursts of small commands.

---

## 9. Critique and correctness record

Three product critiques and seven correctness reviews were run over this package's documentation before publication, each finding adversarially verified by two independent skeptics, in the same outcome-first discipline P13 used. The record below is filled from that pass; findings that survived verification were applied before the final commit, and those not applied are listed with the reason.

*(This section is completed in the revision that follows the critique workflow; see the review index's revision table.)*

---

## 10. Provisional P14A execution ceiling and protected verification reserve

**Provisional until the post-P13 refresh; not copied from P12A or P13A.** P12A ran 72 productive lead hours against 96 elapsed with 24 protected; P13A recommended 80 productive (52 capability + 28 reserve) against 108 elapsed. P14A.1 is narrower in feature surface than P13A Core (one case, one chooser, one recalibrated action) but carries a cross-owner atomic settlement through three accepted authorities, a new fixed-order tick step, two P10 contract-law changes (case-time renewal, charge and floor), one P12 generalization (exported signing primitive, policy term model), a governed save step whose base version is unknown until P13 closes, and a versioned-rule migration for existing saves.

**Recommended range (provisional): 72–84 productive lead hours, of which a protected reserve of 35–40%.** The denominator states the reserve inside the total.

| Element | Hours (range) | What it may be spent on |
|---|---:|---|
| Capability and implementation work | **46–52** | Building P14A.1 Core and nothing outside it |
| Protected verification, correction and delivery reserve | **26–32** | Correctness, migration (including the versioned termination rule over a protected copy of the Owner's real library), replay and performance verification, corrections, delivery. Never new capability, never reallocated to finish a feature |
| **Productive lead total** | **72–84** | The two rows summed; this is the ceiling, not the ceiling plus the reserve |
| Elapsed ceiling | **96–112** | Wall clock at the 4:3 ratio P12A sustained, whole-hour rounded |

**Gate split, applied to the capability hours only.** Prerequisites and the early playable slice (case opens, proposals exist, UNKNOWN shows) ≈ 35%; completed causal Core (settlement through P10/P11/P12, firing with guard, versioned rule) ≈ 40%; integrated / final P14A.1 candidate (replay, migration, endurance) ≈ 25%.

**Escalation criteria (stop and return to Current Ops rather than spend the reserve):** the P13-accepted save head cannot host one additive P14 root without touching a P13 root; the incumbent-renewal-as-proposal change needs more than the bounded P10 renewal-path edit; the rival proposal needs a policy field P12 will not version; the P12 signing primitive cannot be exported without changing `staff()`'s reconciliation; the versioned termination rule cannot preserve an existing save; measured incremental save cost exceeds the retained P12 figures by a margin Current Ops sets; the reserve is reached with any acceptance level unmet.

**No completion time is promised**, and none should be inferred. The range is refreshed after P13 acceptance with the actual base version and any P13 change to the seams above.

---

## 11. Status

**P14 PREPARATION READY — POST-P13 ACCEPTANCE REFRESH REQUIRED.** Hook remains **INACTIVE / EXPLICIT-CHECKER FALLBACK**; explicit checks were used throughout and no hook was installed, repaired or activated. This package stops at preparation readiness. P14 coding requires P13 Owner acceptance, a bounded post-P13 changed-path refresh, a Future Ops launch recommendation and a separate Current Ops execution order.
