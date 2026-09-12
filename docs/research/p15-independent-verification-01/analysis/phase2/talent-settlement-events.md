# P15 Package — Sections 8 & 11: Failed-Studio Talent Settlement + High-Visibility Industry Events

**Task scope:** Owner direction H (talent settlement at rival closure) and the notification/disclosure half
of direction D (staged rival failure). Read-only paper design; nothing implemented, nothing built or run.
All code citations are into `accepted-592e926` (Owner-accepted P12 R05 TypeScript, 2026-09-11). All dollar
and week figures in the worked examples are **PROVISIONAL** (hypothetical, for arithmetic legibility only).

Every prior-P15-text claim this analysis touches is tagged CONFIRMED / QUALIFIED / CORRECTED / SUPERSEDED
BY OWNER DIRECTION per the task's method rule. Corrections already made by the Phase-1 verification digest
(`phase1-verify/_DIGEST.md`) are treated as settled and are cited directly rather than re-derived — in
particular: 592e926 *does* ship a nine-studio rival ecosystem, per-studio Standing, and a quarterly
per-lane Studio Charts read with rank+movement; Capitalism Lab's "Playing Without a Company" is an
unshipped DLC preview, not a shipped pattern; OpenTTD's acquirer does not inherit the target's loan at the
pinned commit; Football Manager's distress mechanic is administration (points deduction/embargo), not the
feature-page text P15 originally cited.

---

## 1. What the code actually gives us to build on

| Fact | Citation | Confidence |
|---|---|---|
| `IndustryEmployment` interval = `{contractId, studioId, terms, endedWeek, reason}`; `reason` describes how the interval **began** | `hollywoodTypes.ts:62-68` | HIGH |
| Interval-start reason vocabulary is **closed and role-split**: player ∈ {renewal, player-contract, existing-player-contract}; rival ∈ {entry, renewal, replacement} | `hollywoodValidation.ts:165` | HIGH |
| `IndustryReceipt` kind `'employment'` carries its **own** `reason` field, a superset used for both start and end receipts: entry / renewal / replacement / expiry / termination / player-contract / existing-player-contract | `hollywoodTypes.ts:96-103` | HIGH |
| End-receipt law: `expiry` requires `endedWeek === terms.endWeekExclusive`; `termination` requires `studioId === playerStudioId` **and** `week < endWeekExclusive` — i.e. only the player may end a contract early, and only via `termination` | `hollywoodValidation.ts:357-358` | HIGH |
| An interval that ends **early** without being `termination` must be explained by a same-week `renewal` on the same person at the same studio (the "replacement renewal" rule) | `hollywoodValidation.ts:399` | HIGH |
| `IndustryReceipt` union is **closed**: unknown kinds throw `'unknown receipt kind'`; exact per-kind key table | `hollywoodValidation.ts:347-348` | HIGH |
| `StudioIdentity` has **no status field**; exact-key validated (10 fields, `exact(...)`) | `hollywoodTypes.ts:6-17`; `hollywoodValidation.ts:75` | HIGH |
| Exactly 10 identities forever; a business exists for every entered rival and only for entered rivals | `hollywoodValidation.ts:72, :331` | HIGH |
| `PersonId` is minted once, never renamed/re-minted; every credit/interval/event resolves to an existing `state.talent` id | `types.ts:107-108`; `hollywoodValidation.ts:146-147, :164, :336` | HIGH |
| Player's only termination path is `releaseTalent`: pays `0.5 × remaining guaranteed salary` from `studio.ledger`; validator requires a matching ledger row for every `termination` receipt | `actions.ts:2694-2725`; `employment.ts:172-180`; `hollywoodValidation.ts:394-395` | HIGH |
| Rivals have **no ledger** — only a private `RivalAccount.periods[]` reconciliation; `moveRivalMoney` has no lower bound and no termination-cost concept exists in rival code | `hollywoodTypes.ts:47-61`; `hollywood.ts:31-41`; grep of `hollywoodTick.ts` (no rival-side termination cost) | HIGH |
| Payroll/overhead/Opex are debited **unconditionally, every tick, regardless of cash sign**, for both player and rival | `tick.ts:912-953`; `hollywoodTick.ts:279-282` | HIGH |
| Contracts (player and rival) carry exactly `annualSalary, signingBonus, startWeek, endWeekExclusive, termWeeks (52-208)` — no guarantee/buyout/legal-consequence fields exist | `types.ts:336-343` | HIGH |
| Rival productions have **frozen participants**; production/marketing spend is fully prepaid at greenlight, no future outflow | `hollywoodValidation.ts:247-256`; `actions.ts:572-581` (player-side, same law) | HIGH |
| No code path removes, suspends, or closes a rival; a starved rival can run negative cash forever, blocked only from **new** commitments by `operatingReserve` gating | `hollywood.ts:31-42`; `hollywoodTick.ts:98, 126, 156, 176, 196-200` | HIGH |
| Additive-root save pattern is uniform V16→V19: one new root, a validator that peels it and delegates to the prior version's validator, a converter with no backfill, and downgrade refusals added to every retained load-boundary migration | `save.ts:335-368, 7228-7257` | HIGH |
| P12's own rule: do not widen a frozen recursive leaf in place; use new versioned roots | `CODEX-…PACKAGE-12.md:475` (no-widening) and `:927` (versioned roots), per digest correction | HIGH |

**Reading these together:** the vocabulary the task asks about is already partitioned exactly where a
closure event would need to insert itself. Rival contracts can only *begin* three ways and can only *end*
two ways (`expiry`, or an early end backed by a same-week `renewal`). Nothing today lets a rival contract
end early for any other reason — which is precisely why direction H needs one new, narrowly-scoped end
reason, not a widening of the existing ones.

---

## 2. Part 1 — Talent settlement at permanent studio closure

### 2.1 Do all contracts terminate immediately, at settlement week, or after active productions complete?

**Recommendation: a single settlement week for *contracts*; a longer, per-project tail for *conserved
work already in flight*.** Two different clocks, not one:

- **Employment clock:** every open interval at the closed studio ends **at the settlement week**, no
  later. There is no "wind-down" period during which contracts keep running past that week — the studio's
  ability to employ anyone ends the moment it closes. This matches the shipped precedent for *other*
  P15 terminal law: OpenTTD's `CompanyCheckBankrupt` deletes the company outright at its terminal month,
  it does not let contracts/vehicles keep operating past it (`comp-bankruptcy-loans.md` §1.7); GearCity's
  bankrupt company is "liquidated, refinanced under new ownership, or sold" as one event, not a phase-out
  (§1.5).
- **Production/release clock:** a production or theatrical run that is *already committed and already
  fully paid for* (per §2.3 below) is allowed to run to its natural conclusion under an **estate**
  administration, because it costs the closed studio nothing further and P07's frozen-result law forbids
  inventing a different outcome for work that already has a committed budget and credited participants.

This is not "termination overrides expiration" in the blanket sense the task poses it — it is closer to
"closure forces every open interval to its terminal week, and the **reason** recorded depends on whether
that week was already the interval's natural end." Concretely: an interval whose `endWeekExclusive` is
already `≤` the settlement week ends with the existing `'expiry'` reason (nothing new needed); an interval
whose `endWeekExclusive` is still in the future ends early with a **new** reason, `'employerClosed'`
(§2.6). This is a strict, minimal extension of the existing disjunction at `hollywoodValidation.ts:357-358`.

### 2.2 Do guarantees/severance exist?

**Original game:** none (no guarantee/severance/buyout concept in retail data at all).
**Real-world law (finance-logic.md, verified):** wage-priority statutes protect *unpaid, already-earned*
wages up to a cap (US 11 U.S.C. §507(a)(4) ≈ $15,150/employee/180 days; UK preferential claim ≈ £800/4
months) ahead of ordinary unsecured creditors; nothing protects the *unearned remainder* of a contract term.

**Recommendation — legible abstraction, not a waterfall:**

1. **Wages already earned are always paid in full, because the engine already guarantees this by
   construction.** Payroll is debited unconditionally every tick regardless of cash sign
   (`tick.ts:912-922`; `hollywoodTick.ts:279-282`) — there is no "payroll in arrears" state to protect
   against today, for either the player or a rival. This means the real-world "unpaid wages paid first"
   rule is **already true automatically**, with no code change, up through the settlement week. State
   this fact plainly in the closure notice rather than modeling a waterfall the engine has no data to run
   (rivals persist no asset list, no creditor list, no security interests).
2. **The unexpired remainder of the guarantee is written down to zero.** No cash crosses to the person for
   weeks not yet worked. This deliberately differs from the player's own `releaseTalent`, which pays 50%
   of the remaining guarantee (`tuning.ts:391`) — that 50% is a *discretionary buyout* a solvent employer
   chooses to pay; an insolvent estate choosing to close has, by definition, nothing left to buy anyone
   out with. Zero severance beyond wages already earned matches Capitalism Lab's "liquidated to pay off
   its debts, there's no avoiding that" (comp-bankruptcy-loans.md §1.6) and Prison Architect's "warden
   sacked" pattern (no golden parachute) more closely than any comparator's continuation path.
3. **Do not implement a priority-of-claims waterfall.** The finance-logic report's own UK/US research
   (fixed charge → costs → preferential → floating → unsecured; §507 caps) requires a persisted asset and
   creditor list this codebase does not have for rivals and is not being asked to build here. A one-line
   "unpaid wages paid; remaining guarantee written down" is the correct altitude for a headline-legible
   game system — a full waterfall belongs, if ever, to a P16+ corporate-finance slice.

### 2.3 Do active production obligations delay release of people?

**Recommendation: complete conserved work in flight under an estate label; cancel only work that never
became a committed obligation.** The dividing line is exactly the one P07's frozen-result law and the
existing "conserved projects must resolve" rule already draw:

- A production that has been **greenlit** (has a `productionId`, frozen `participants`, and fully prepaid
  production/marketing spend, `hollywoodValidation.ts:247-256`; `actions.ts:572-581`) has **no further
  cash obligation** to protect creditors from — the money is already spent. Cancelling it would (a)
  require inventing a phantom result for work that already has committed credits, violating binding law 7
  ("no retroactive fiction") and the P07 "never rewrites an already frozen result" rule, and (b) strand
  the credited people's already-earned career-event facts (`TalentCareerEvent`, `types.ts:1708-1736`) with
  no film to attach to. **Recommendation: it completes on schedule under estate administration** — the
  same `advanceManagedProductions`/`operateStage` engine already running it keeps running it, it releases
  normally, and it settles normally. Its people are **not** released until either their normal
  `endWeekExclusive` or the studio's settlement week, whichever is earlier — i.e. the production finishing
  does not, by itself, extend anyone's freedom to leave sooner, but neither does it delay them past the
  settlement week.
- A theatrical run **already in progress** is the same case: it has already fully committed its
  production, the studio has already banked its opening receipts, and the remaining weekly Studio Revenue
  the run pays out has no new cost attached to it. It **completes and settles normally** under the estate.
- A **screenplay in development with no `productionId` yet** (`p.productionId===null`, `announcedWeek ===
  null`) is a different case: it has no frozen participants, no committed budget beyond development spend
  already sunk (which is non-refundable under existing law — there is no refund mechanic for anything but
  demolition/strike, `code-finance.md` §1.2), and completing it would require the estate to make a **new**
  financial commitment (a greenlight) on behalf of an entity that no longer exists. **Recommendation: it
  is cancelled at closure.** This is an honest, legible historical fact ("this studio began developing
  *Title*, cancelled at closure"), not an erasure — the concept/script-project ID persists in history.

This resolves the task's two options directly: **cancel-all** is wrong for anything already greenlit
(it manufactures fiction and strands frozen credits); **complete-everything-under-estate** is wrong for
undeveloped concepts (it would force new spending an insolvent entity cannot make). The dividing line is
"has this already become a committed, fully-paid obligation with frozen participants?" — which is a fact
the engine already tracks per project (`RivalProjectCosts.productionId`/`.announcedWeek`).

### 2.4 Does bankruptcy override normal contract expiration?

**Yes — via the reason chosen, not via a blanket override.** Closure forces every open interval to end at
the settlement week. For an interval whose natural `endWeekExclusive` was already ≤ that week, the
existing `'expiry'` reason is simply true and needs no new mechanism. For an interval still running past
that week, closure **is** the override, expressed as a new end reason:

**`'employerClosed'`** — a new value added to the `IndustryReceipt` employment-kind `reason` union
(`hollywoodTypes.ts:97-98`), usable on *end* receipts for **either** role (player or rival), governed by:

```text
r.reason === 'employerClosed'
  ⇒ r.studioId's studioClosed receipt exists at r.week
  AND r.week ≤ interval.terms.endWeekExclusive
```

added as a third disjunct at `hollywoodValidation.ts:357-358`, alongside the existing `expiry` and
`termination` arms. The early-end-needs-a-replacement-renewal rule at `hollywoodValidation.ts:399` gets a
parallel exception: an interval ending early because of `employerClosed` does **not** need a same-week
renewal to explain it (there is no employer left to renew into).

`employerClosed` is deliberately **not** `termination`: `termination` is a discretionary act the *player*
performs and pays for, cross-checked against a ledger row (`hollywoodValidation.ts:394-395`) that rivals do
not have. Reusing `termination` for rival closure would incorrectly drag a player-only, ledger-backed
invariant onto a business object that has no ledger. Keeping `employerClosed` distinct also keeps the
closed-union discipline honest: it is one new value inside an *already-open* enum field on an existing
receipt kind, not a new kind — the smaller of the two additive moves available.

### 2.5 How may rivals/player sign former employees?

**Unchanged from today's free-agency path, at the settlement week.** `finishHollywoodWeek` already unions
expired talent into `state.freeAgents` (`hollywoodTick.ts:293-316`); the same union should run for every
person whose interval closed with `employerClosed` at the settlement week. No first-refusal for whoever
eventually acquires the closed studio's assets — the task is explicit that none exists "unless an M&A
slice says so," and direction I explicitly defers the shape of any such slice to further research (§2.9).
Once in `freeAgents`, ordinary hiring law governs: one-employer exclusivity (`hollywoodValidation.ts:168-
175`), no poaching restrictions beyond what already exists, and — if P14 exists by the time this ships —
P14's competitive-market rules for who gets first access to newly free talent.

### 2.6 Does the failed employer retain residual obligations?

**Recommendation: none, after settlement.** Once the fixed settlement receipt commits (§2.8), the
studio's account stops mutating — no further payroll, no further obligation, nothing owed. This matches
every comparator's terminal law (Capitalism Lab: "liquidated to pay off its debts... there's no avoiding
that"; GearCity: liquidate/refinance/sold, "debts don't magically disappear" *for the acquirer*, not for
the original studio). **The archive keeps the history** — `StudioId`, `FilmId`, `PersonId`, and every
credit/receipt survive forever (binding law 6, "no identity death"), which is a different thing from
retaining a live obligation: the studio's *record* is permanent, the studio's *account* is not.

### 2.7 Worked example: settlement table

Rival "Rose Lantern Films" reaches its terminal settlement at **week 1000** (PROVISIONAL). It carries its
original six-role founding roster (`writer, director, lead, antagonist, support, craft` —
`hollywoodStartingData.ts:47`) with staggered renewal history, one production shooting (tick 4 of 8), one
film in its theatrical run (week 3 of 6), and two screenplays in development.

| Row | Subject | State at closure | Disposition | End/event reason | Receipt(s) emitted | IDs that persist |
|---|---|---|---|---|---|---|
| 1 | Director contract (started wk 850, `endWeekExclusive` 1058) | active, 208-wk term | Ends early at settlement | `employerClosed` | `employment` end receipt, wk 1000 | contractId, PersonId → `freeAgents` |
| 2 | Writer contract (started wk 792, `endWeekExclusive` 1000) | already due this exact week | Ordinary expiry — closure changes nothing | `expiry` | `employment` end receipt, wk 1000 (unchanged mechanism) | contractId, PersonId → `freeAgents` |
| 3 | Lead-actor contract (started wk 900, `endWeekExclusive` 1108) | active, recently renewed | Ends early at settlement | `employerClosed` | `employment` end receipt, wk 1000 | contractId, PersonId → `freeAgents` |
| 4 | Antagonist contract (started wk 950, `endWeekExclusive` 1158) | active | Ends early at settlement | `employerClosed` | `employment` end receipt, wk 1000 | contractId, PersonId → `freeAgents` |
| 5 | Support-actor contract (started wk 792, `endWeekExclusive` 1000) | already due this exact week | Ordinary expiry | `expiry` | `employment` end receipt, wk 1000 | contractId, PersonId → `freeAgents` |
| 6 | Craft contract (started wk 844, `endWeekExclusive` 1052) | active | Ends early at settlement | `employerClosed` | `employment` end receipt, wk 1000 | contractId, PersonId → `freeAgents` |
| 7 | Production in principal photography, tick 4 of 8 (`PRODUCTION_TICKS=8`) | greenlit, fully prepaid, frozen 6-credit cast | **Completes under estate to tick 8**, releases normally | n/a (unchanged production/release law) | ordinary `filmAnnounced` (already emitted), `filmReleased` at wk 1004, `filmSettled` at natural settlement | productionId, FilmId, all 6 credit PersonIds |
| 8 | Film in theatrical run, week 3 of 6 (`THEATRICAL_WEEKS=6`) | already released, revenue-paying | **Continues weeks 4-6 under estate**, settles normally | n/a | ordinary `filmSettled` at natural settlement | FilmId |
| 9 | Screenplay A in development (no `productionId`, `announcedWeek===null`) | development spend already sunk | **Cancelled at closure** — no new commitment made on its behalf | n/a | new `projectCancelled` receipt, wk 1000 | conceptId, scriptProjectId (persist as a cancelled historical fact) |
| 10 | Screenplay B in development | same | **Cancelled at closure** | n/a | new `projectCancelled` receipt, wk 1000 | conceptId, scriptProjectId |
| 11 | Studio itself | — | Terminal transition committed | — | new `studioClosed` receipt, wk 1000, carrying the fixed settlement summary (6 contracts settled, 1 production/1 run completing under estate, 2 projects cancelled) | StudioId (permanent, row/identity unchanged) |

Rows 2 and 5 show that closure does **not** retroactively change how an already-due contract ends — the
existing `expiry` mechanism just fires on schedule, coincidentally at the same week. Rows 1/3/4/6 show the
new early-end path. Rows 7-8 show the estate-completion rule; rows 9-10 show the cancellation rule. Row 11
is the one new terminal fact the whole table hangs off.

Because a rival's roster is architecturally bounded (fixed facility capacity — Development & Casting cap
2, one Production Stage, Scenery Shop cap 2, Post Building cap 2, `hollywood.ts:98-105` — keeps concurrent
headcount in the single digits even after decades of renewals), the settlement summary can be a **single
fixed receipt with an exact subject count and digest**, per P15-BUILDER-ANNEX §12.3's allowance for a
"genuinely fixed-size result." The Annex's 100-row chunked-manifest requirement (§L.6.9) only bites for a
variable-size participant set — worth flagging for a *player*-scale failure (a fully built-out lot could
carry dozens of contracts), where the same settlement receipt shape should switch to chunked manifests
rather than assume every closure is rival-scale.

### 2.8 Dormancy: does a distressed-but-not-yet-closed rival keep paying from the estate?

**Bounded recommendation: yes, unconditionally, all the way to the terminal settlement week — nothing
about pre-terminal distress touches contracts.** This is not a new rule; it is the *existing* unconditional
weekly-debit law (`tick.ts:912-953`; `hollywoodTick.ts:279-282`) simply continuing to apply through every
pre-terminal distress rung (`active → warning → distress → recovery` per P15-PACKAGE §12.3), with the
`operatingReserve` gate (already shipped, `hollywoodTick.ts:98, 126, 176, 196-200`) doing the only real
work it already does today: blocking **new** commitments, never touching existing ones. Two authorities
converge on this:

- P15-PACKAGE §12.3, verbatim: "A single negative-cash week cannot skip directly to dormancy." Extend the
  same discipline one step further — a warning/distress *rung* cannot skip directly to *contract
  termination* either. Termination-by-closure is reserved for the terminal step alone.
- The comparator survey's own exploit catalogue (`comp-bankruptcy-loans.md` §2.4) is unanimous that
  **counters that reset on one good week/month invite gaming** (Mad Games Tycoon 2's "red digits are
  free" bug) while **non-resetting counters with no visible clock read as unfair surprises** (GearCity
  1.23's community backlash). The safest reading for a studio's *people* specifically — as opposed to its
  cash trajectory — is to make the contract-safety guarantee absolute and unconditional through every
  pre-terminal stage: nobody's job is ever at risk from a distress rung, only from the terminal event
  itself. That is a strictly stronger, more legible promise than any comparator's contract-level behavior
  (none of the tycoon-genre comparators model individual employee contracts surviving distress at all).

This also means no new mechanic is needed for the "reduce future obligations" remedy family P15-PACKAGE
§16 requires distress to offer: a distressed rival **already** stops renewing/replacing staff below its
reserve threshold (existing `staff()` gating, `hollywoodTick.ts:85-137`), which is a legitimate, already-
shipped form of attrition-based cost reduction. Nothing forces a layoff; nothing protects a renewal that
would otherwise fail the reserve gate. The dormancy question resolves to: **the estate keeps paying
everyone in full, on schedule, right up to the settlement week; the only pre-terminal effect of distress on
staffing is the existing inability to add new commitments.**

### 2.9 Additive roots and validator changes required

| Change | Kind | New save version needed? | Notes |
|---|---|---|---|
| `'employerClosed'` value added to `IndustryReceipt`'s existing `employment`-kind `reason` union | enum widening inside an already-open field | Yes — this is a schema change to an existing V19 root, so it ships as part of the same V20 bump that introduces the roots below (per the peel-and-delegate pattern, `save.ts:335-368`) | Not a "widen a frozen leaf in place" violation: it is a versioned schema change like every prior root addition, not a runtime mutation of a live V19 save |
| New receipt kind `studioClosed` `{eventId, week, studioId, kind:'studioClosed', contractsSettled, productionsCompletingUnderEstate, screenplaysCancelled}` | new kind in the closed `IndustryReceipt` union | Yes (V20) | Fixed-size summary receipt per §12.3's allowance; add validator table entry + a per-kind cross-check mirroring the existing `studioEntered` pattern (`hollywoodValidation.ts:373-376`) |
| New receipt kind `projectCancelled` `{eventId, week, studioId, conceptId, scriptProjectId, kind:'projectCancelled'}` | new kind | Yes (V20) | Records disposition of a development-stage project with no `productionId`; no existing receipt kind covers this case |
| New root `studioOperatingState: Record<studioId, {status, sinceWeek, causeReceiptId}>` (or equivalent event-log root, e.g. `corporateConditionEvents`) | brand-new root, **not** a field on `StudioIdentity` | Yes (V20) | This is the task's explicit instruction: "StudioIdentity status via versioned root, not widening." `StudioIdentity` stays exact-key-validated exactly as it is (`hollywoodValidation.ts:75`); the 10-identity invariant (`:72`) and the "businesses = entered rivals" invariant (`:331`) both continue to hold unmodified, because closure is expressed as a status *alongside* an unchanged identity/business record, never as a removal |
| Validator: `hollywoodValidation.ts:357-358` | add a third disjunct for `employerClosed` | same V20 bump | `r.reason==='employerClosed' && <studioClosed receipt exists at r.week> && r.week<=interval.terms.endWeekExclusive` |
| Validator: `hollywoodValidation.ts:399` | add an exception clause | same V20 bump | An early end explained by `employerClosed` does not require a same-week replacement `renewal` |
| Validator: `hollywoodValidation.ts:165` | **unchanged** | — | This governs interval-*start* reasons only; closure produces *end* receipts, never a new interval, so the start-reason vocabulary is untouched |
| Migration | `convertV19ToV20` initializes `studioOperatingState` with every identity `'active'` and **no invented pre-migration distress/closure history** (binding law 7) | V20 | Mirrors `initializeHollywood(state,'migration')`'s existing no-backfill discipline (`hollywood.ts:111-136`) |
| Downgrade refusals | add V20 refusal to every retained migrateToVn (V13-V19), per the corrected V19 pattern (digest correction: only V13-V18 got explicit V19 refusals, not "every older migrateToVn") | V20 | See `_DIGEST.md` line 47 correction — mirror the *actual* shipped pattern, not the overstated one |

**Package ownership:** the settlement mechanics above (employment reasons, receipt kinds, project
disposition) are **P12 registry/roster/employer authority acting inside a P15B-requested transition** —
exactly the shape P15-PACKAGE §12.3 already specifies ("P12 commits the registry transition only inside
the same validated candidate... P12 settles projects/capacity/roster/employer/exclusivity/intervals").
P15B is the requester and the public-fact/notification owner (Part 2); P11 is untouched by this task
(no loan/debt math needed for the *zero-severance* recommendation, since it requires no waterfall); P14,
if it exists by build time, owns the competitive-market rules governing who gets first access to the newly
free talent.

---

## 3. Part 2 — Information requirements for major events

### 3.1 Tiering reused from the shipped Industry Pulse grammar

Every headline below extends the exact grammar already shipped at `bridge/industry.ts:90-98`:
`studioEntered → "<Studio> joins Hollywood"`, `filmReleased → "<Studio> releases <Title>"`,
`filmAnnounced → "<Studio> announces a film"`. All are subject-first, present-tense, one clause, and every
one already routes ordinary/routine sub-reasons out of the feed (`renewal`/`entry`/`existing-player-
contract` are already dropped from Activities today, `bridge/industry.ts:93`) — the routine-noise rule in
§3.3 is not new law, it is the *same filter* extended to the new fact types.

Tiers are the four from P15-PACKAGE §21, reused verbatim (not reinterpreted): INFO (Industry Pulse; no
pause/camera move), ATTENTION (grouped item, source route, no automatic decision), DECISION (exact
consequence surface, pause; reserved for "a live legal player response window, approved P15B remedy, or
2040 post-finale choice"), BLOCKING (workflow-local stop only, e.g. a corrupted settlement receipt).

| Event | Headline grammar | Tier | Pause/camera | Source links | Facts disclosed | Must NOT disclose |
|---|---|---|---|---|---|---|
| **Studio bankruptcy** (rival) | `"<Studio> declares bankruptcy"` | **INFO**, elevated prominence within the Pulse (first/pinned card, larger treatment) — high visibility is achieved through *prominence*, not tier escalation; §21 reserves pause/camera-move for decision-bearing events only | none (non-modal, matches OpenTTD's staged non-modal "company in trouble" news) | studio profile; settlement record (`studioClosed` receipt); routes to affected people/productions via existing `talentId`/`filmId` Activity fields | studio name; settlement week; **exact** count of contracts entering free agency; count of productions completing under estate vs. cancelled; count of development projects cancelled; "historical profile preserved" | private `RivalAccount`/cash/periods (already never crosses the bridge, `bridge/industry.ts:1,50,176`); individual salaries; private policy/affinities; any project never publicly disclosed pre-closure (`announcedWeek===null` stays undisclosed, `bridge/industry.ts:150,162`); any debt figure (none is computed today; if direction F ships loans, only a publicly-settled total, never the ledger) |
| **Studio bankruptcy** (player, if direction E's terminal ending is ever separately authorized) | first-person framing, e.g. `"Your studio has closed"` | **DECISION** at the moment a remedy is offered; the terminal fact itself is a dedicated end-state screen, not a Pulse card | pause; exact consequence surface | player's own settlement record | same fact set as above, plus the player's own remaining obligations written down | n/a — it is the player's own studio |
| **Studio auction** | `"<Studio>'s assets enter settlement"` | **INFO** | none | settlement record | the same settlement counts as bankruptcy (in current code these are almost certainly the *same* event, re-surfaced) | any sale price or buyer identity — **neither exists in the current data model.** Rival "facilities" are abstract `StudioOperations` capacity, not `PlacedFacility` records with a transferable identity or value (`code-finance.md` §2.3, §2.6); an actual auction/buy-flow is P16+ scope by binding law 14. Recommend the notice say only that assets "enter settlement," never imply a purchasable listing exists yet |
| **Acquisition** (direction I, eventual, package boundary is an open research question — nothing below is a scope authorization) | completed transaction: `"<Buyer> acquires <Studio>"`; a live offer, if the eventual design has one: framed as a decision, not a headline | **DECISION** for a live offer/negotiation (matches Capitalism Lab's modal accept prompt); **INFO** for the completed-transaction historical record | pause only for the live decision, never for the historical record | buyer profile; seller's (permanently preserved) profile; settlement record | buyer, seller, settlement week; per identity law §13.2, the notice must state that **prior films/credits remain attributed to the original studio** — acquisition never rewrites historical creator/owner facts | negotiated valuation mechanics beyond whatever headline figure the eventual Owner ruling decides should be public; the acquired studio's private pre-deal ledger |
| **Loan default — player's own** | ATTENTION notice: `"Loan payment due in N weeks"` / `"<amount> in arrears"`; DECISION surface: the remedy-selection screen itself | **ATTENTION** for the notice (matches §21's own "studio enters warning" row verbatim); **DECISION** only at the moment a remedy is actually offered | none for the notice; pause for the remedy screen | player's own finance surface | exact amount/week/consequence — this is the player's own studio, full disclosure is correct | n/a |
| **Loan default — rival's own** | folded into whatever public distress-stage notice it triggers, e.g. `"<Studio> enters financial distress"` — never a line-item "missed a payment" | **INFO** | none | studio profile | only the **public corporate-condition stage** the default produced, never the missed-payment mechanism itself | the fact of a specific missed payment; the loan's terms; the rival's private ledger — matches Football Manager's board-only administration disclosure (the manager never sees the raw books, only administration's public consequences) and P15's own "public is a projection rule, not access to raw state" law (§13.3) |
| **Major restructuring** (rival recovers from distress without closing) | `"<Studio> restructures"` / `"<Studio> recovers from financial distress"` | **INFO** for a rival's recovery (comparable to "ranking published" in §21's own INFO row — a status change, not a decision); **ATTENTION** when it is the *player's own* remedy becoming available; **DECISION** only at the remedy-selection moment | none for INFO/ATTENTION; pause for the player's own DECISION | studio profile; corporate-condition history | which **typed remedy capability family** was used (P15-PACKAGE §16's own public-safe vocabulary: "reduced future obligations," "delayed/cancelled an uncommitted plan," "completed a conserved release," "entered and exited dormancy") | exact cash figures; exact obligations reduced; private policy |
| **Historic #1 Power Ranking change** | `"<Studio> takes the #1 spot"` | **INFO** — §21 names "ranking published" as an INFO example explicitly; even a dramatic #1 change stays non-modal | none | studio profile; the ranking snapshot itself (§15.3's "default row": current rank, prior comparable rank, movement, effective week, cohort, all candidate lane values, formula version, completeness, reasons) | the exact fields §15.3 already specifies; new #1 holder and the studio it displaced; effective week | private Standing internals or anything P15A.2's own design deliberately excludes (cash/valuation, private slate, technology adoption, talent popularity, client-side recomputation — §12.2) |
| **2040 finale** | ceremony framing, e.g. `"The 1920-2040 Legacy is complete"` | **its own governed one-time ceremony transition, outside the routine INFO/ATTENTION/DECISION/BLOCKING ladder** — binding law 15 ("2040 is governed... explicit, versioned, Owner-approved") and §12.4's dedicated lifecycle justify treating the trigger itself as a fifth, singular category rather than force-fitting it into a Pulse card; the subsequent **"Continue in Endless Sandbox?"** choice is explicitly named in §21's DECISION row and should pause with an exact consequence surface | pause for the ceremony's arrival and for the Endless-Sandbox choice; none for browsing the resulting dossier afterward | every archetype/lens links to its exact source record (§22, M.6) | everything §22/M.6 specify: archetype cards, defining films/people/rivals/eras, awards/technology/finance/market/resilience lenses, setbacks/recoveries, source-linked chronology; the notice should echo the shipped Industry-notice pattern verbatim in spirit — an explicit "several legacy archetypes may apply; there is no single overall score" sentence, mirroring `bridge/industry.ts:110`'s existing "there is no combined Power score" | nothing is hidden at this stage by design (direction J is maximal disclosure); the only constraint is provenance — no generated finale prose as primary truth (§22) |

### 3.2 Mock notice text

**Studio bankruptcy** (matching the worked example in §2.7, using the task's own illustrative style):

> **ROSE LANTERN FILMS DECLARES BANKRUPTCY**
> 6 contracted professionals entering free agency — 1 production and 1 theatrical release continuing to
> completion under estate administration — 2 screenplays in development cancelled — historical profile
> preserved.
> *Week of [date]. [Open Rose Lantern Films' profile] · [View settlement record]*

**Historic #1 ranking change:**

> **CRAEMMIR SIBLINGS TAKE THE #1 SPOT**
> Quarterly Power Ranking, effective [date]. Film-outcome momentum, recognition momentum, and delivery
> momentum — three independent 0-10 lanes, unweighted sum. Craemmir Siblings displaces Bellwether
> Pictures, #1 since [prior effective week].
> Several legacy archetypes may apply; there is no single overall score.
> *[Open Power Ranking] · [Why this rank?]*

### 3.3 Routine noise — must NOT notify

Per P15-PACKAGE §21, verbatim: *"Routine pressure decay, unchanged rankings, ordinary rival phase changes,
and zero-change weeks produce no notifications."* This is an extension of an **already-shipped** filter,
not a new rule — `bridge/industry.ts:93` already drops `renewal`/`entry`/`existing-player-contract`
employment reasons from the Activity feed today. The same discipline extends to every new fact type this
task introduces:

- weekly awareness drift (already folded into the `studioHistory` `routine` significance class before 52
  weeks, never an Activity — `code-standing-history-save.md` §2.1);
- a rival renewing its own staff, or a returning person filling a vacated role (existing `'renewal'`
  reason, already excluded, `bridge/industry.ts:93`);
- an ordinary quarterly Power Ranking publication in which a given studio's `movement` is `'unchanged'`
  (the value already exists, `bridge/industry.ts:83`; §21 forbids notifying on it);
- a rival entering, or moving between, distress-adjacent rungs that never cross a public disclosure
  threshold (P12A register UX-010: "distress becomes public only after an authoritative disclosure
  threshold");
- a loan payment made on schedule (no event — only a missed/late payment or a threshold crossing is
  eligible for ATTENTION/INFO);
- routine weekly payroll/overhead/facility-Opex debits (never events, by existing design);
- year-over-year Standing drift that stays within ordinary bounds.

---

## 4. Package ownership summary

- **P12** — registry/roster/employer authority: mints/commits the `studioOperatingState` transition and
  every settlement fact touching intervals, projects, capacity, and current-employer/exclusivity records,
  acting *inside* a P15B-requested candidate (P15-PACKAGE §12.3). Owns the reserved-ID/exact-10-identity
  invariant, which is unaffected by this design.
- **P15B** — requests and commits the closure transition; owns the new `studioOperatingState`/
  `corporateConditionEvents` root, the `studioClosed`/`projectCancelled` receipt kinds, and the Part-2
  notification/tiering/disclosure law.
- **P11** — untouched by the recommended zero-severance rule (no waterfall, no loan math required for
  this task); remains authoritative if/when a loan-default distress trigger is defined (direction F).
- **P14** — owns competitive-market rules for who gets first access to people newly in `freeAgents`, if it
  exists by build time; this task assumes ordinary free-agency law absent P14.
- **P15A.2** — owns the Power Ranking lifecycle and its notification content; this task only specifies the
  notification *shape* around whatever P15A.2 ultimately ships, per the Owner's still-open §12.2 ruling.
- **P16+** — owns any live acquisition/auction *mechanic* (bid flows, valuation, asset transfer); this
  task specifies only what a completed transaction's historical notice must and must not disclose.
- **P15C** — owns the 2040 finale lifecycle and dossier; this task specifies only its notification/pause
  behavior at the governance boundary.

---

## 5. Structural check against the Owner-selected direction

No serious structural problem was found in directions H or D as given. One clarification is worth naming
explicitly rather than silently assuming: direction H's phrase "3 productions affected" in the task's own
illustrative notice text implies a studio could plausibly have three *concurrent* productions in flight at
once. At 592e926 a rival's `Production Stage` capacity is exactly **one** (`hollywood.ts:98-105`
`operations:{...facilities:rivalStartingFacilities(studioId)}`, cap 1 stage), so a single rival business
can realistically have at most one production shooting plus (rarely) one prior production still in
post/theatrical-run overlap — "3 productions affected" as a headline figure is realistic only for a much
larger, player-scale operation, or by counting screenplays-in-development alongside true productions. The
worked example in §2.7 uses figures consistent with the actual shipped capacity model (1 production, 1
run, 2 screenplays) rather than the task prompt's illustrative "3 productions," and the recommendation
above (§3.2) reflects that. This is a labeling correction, not a structural objection to direction H or D.

---

## 6. Open Owner decisions this analysis leaves genuinely open

1. Whether `studioClosed`/`projectCancelled` receipts extend the *existing* `hollywood.receipts` monotone
   sequence or live in a separate P15B-owned sequence merged at read time (P15-BUILDER-ANNEX §L.6.10
   requires "source-owner sequences and frozen per-domain high-watermarks" when multiple domains merge) —
   this analysis recommends the latter for genuinely new fact *kinds* but did not receive a ruling to cite.
2. Whether a rival's public distress-stage notice (the trigger for disclosing a loan default at all) is
   itself keyed to a specific, Owner-approved public-disclosure threshold, or left to P15B's general
   warning/distress predicate design (out of this task's scope — that is the ladder itself, direction D's
   main body, likely a separate P15 deliverable).
3. Whether "3 productions affected" in a future high-visibility notice should ever be literal (requiring a
   larger concurrent-production capacity than rivals have today) or should be read as combining
   productions + development-stage projects into one "affected" count for headline purposes.
4. Whether the acquisition notice's completed-transaction record should ever surface a public consideration
   figure — left to whichever P16+ ruling eventually authorizes acquisitions at all (direction I).
5. Exact wording/threshold for "materially crowded window" (§21's ATTENTION row) as it might interact with
   a rival's release completing under estate administration post-closure — a minor edge case not resolved
   here.

---

## 7. Sources

- Code: `accepted-592e926/src/core/hollywoodTypes.ts:6-17, 47-103`; `hollywoodValidation.ts:72, 75, 165,
  331, 347-348, 353, 357-358, 373-381, 394-399`; `hollywood.ts:31-42, 98-105, 140-199`;
  `hollywoodStartingData.ts:47`; `hollywoodTick.ts:85-137, 279-316`; `tick.ts:912-953`; `types.ts:107-108,
  336-343, 1708-1736`; `actions.ts:572-581, 2694-2725`; `employment.ts:172-180`; `tuning.ts:391`;
  `save.ts:335-368, 7228-7257`; `bridge/industry.ts:1, 50, 66-98, 110, 150, 162, 176, 183-186`.
- Phase-1 reports: `code-hollywood.md`, `code-finance.md`, `code-standing-history-save.md`,
  `comp-bankruptcy-loans.md`, `finance-logic.md`, `prior-claims.md`.
- Verification digest corrections applied: nine-studio rival ecosystem confirmed at 592e926; per-studio
  Standing confirmed; quarterly per-lane Studio Charts confirmed; Capitalism Lab "Playing Without a
  Company" downgraded to unshipped DLC preview; OpenTTD acquirer-inherits-loan claim not applicable at the
  pinned commit; Football Manager's actual mechanic is administration, not the cited feature page;
  V19-downgrade-refusal pattern corrected to "V13-V18 only," mirrored above for the V20 recommendation.
- Authority: `authority/P15-PACKAGE.md` §11 (binding laws 5, 6, 7, 11, 14, 15, 16), §12.3 (P15B corporate
  fate lifecycle), §13.1 (additive roots), §13.2 (identity law), §15.2-15.4, §16 (economy consequences),
  §17 (multi-studio symmetry), §21 (attention/notifications), §22 (historical record), §23 (Owner
  decisions on acquisition/closure/player-closure/entrants); `authority/P15-BUILDER-ANNEX.md` §L.6.9-10
  (endurance invariants, chunking), §M.5 (P15B corporate view).
