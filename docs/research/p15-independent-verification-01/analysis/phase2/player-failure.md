# P15 — Section 6: Player Failure / Bankruptcy Model

**Analyst pass, READ-ONLY research.** Date 2026-09-11. Scope: Owner Direction E ("the player studio
can ultimately fail and go bankrupt... with meaningful warning and recovery first") and its five named
sub-questions. Every recommendation states what it adopts, what it rejects, which package would own
it, and which Owner decisions remain open. `rival-failure.md` does not yet exist in
`scratchpad/out/phase2/` at the time of writing, so the symmetric trigger hierarchy below is derived
independently from code evidence and the comparator set, and flagged for reconciliation once that
report lands.

---

## 0. Governance prerequisite — read this before any of the rest

**docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md §3** (recorded 2026-08-18, `main@1e6b422`) states in
writing: *"The existing no-hard-bankruptcy / no-receivership ruling applies to the player's studio…
The prior prohibition (no financing, loans, bailouts, restructuring, hard bankruptcy, failure ladder or
arbitrary cash sink) remains in force for the player's studio and is unchanged."* **P11-REQ-041**
("Loans/investors/external financing require separate Owner gate") and **P11-REQ-042**
("Bankruptcy/failure or structured recovery requires separate Owner gate") are both recorded
**OWNER-BLOCKED** in `docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md:140-141`, each citing
"Owner ruling absent — unchanged."

Owner Direction E is exactly the "separate Owner gate" both requirements ask for, but **it exists here
only as a conversational instruction to this research pass — it is not yet a recorded ruling in the
repository.** §3's own framing pattern ("newer Owner authority supersedes historical milestone
exclusions… authorizes no implementation") is the correct model to reuse: a short, dated
documentation-only amendment to §3 (and a status flip on REQ-041/042 from OWNER-BLOCKED to
"Owner-authorized, scoped per Direction E/F") must be recorded and merged **before** any P11/P15B
charter references this package as authorized. This is a **documentation change, not a code
change** — zero runtime risk — and it is the one blocking action every other recommendation below
depends on. **SUPERSEDED BY OWNER DIRECTION**, pending that recorded amendment: HORIZON §3 in full,
and REQ-041/042's OWNER-BLOCKED disposition.

---

## 1. Insolvency vs. ordinary negative cash

| | Original (2005) | Accepted code (592e926) |
|---|---|---|
| Consequence of cash < 0 | Build lockout on new sets/facilities except an exception list (Casting Office, Crew Facility, Production Office, Basic Script Office, Stage School, Stage Set, Star & Script Selling Facility — Prima eGuide printed p.14/PDF p.15; `original-text/prima.txt:769-777`) | `canAfford` (`src/core/employment.ts:70-80`) refuses any **voluntary** commitment whose immediate effect would leave cash negative. Unavoidable weekly debits (payroll, overhead, facility Opex) are **not** gated and run unconditionally (`tick.ts:919-946`) |
| Interest / lender | None documented in any of five retail extractions (manual, Prima, GameFAQs Maxx/Mark, gamepressure) | None. `studioRunRecap.ts:1003`: *"No recovery mechanic (loans/financing) exists in the current rules."* |
| Terminal state | None documented | None. No `gameOver`, `bankrupt`, or `maxWeek` anywhere in `src/` (confirmed independently in `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` lines 16-26) |
| Rival equivalent | N/A (no rivals modeled) | `RivalAccount.cash` has no floor (`hollywood.ts:31-42`); rivals stop **new** commitments below an `operatingReserve` (`weeklyOperatingCost × reserveWeeks`, 12–20 wk; `hollywoodTick.ts:98,126,176`) but keep paying payroll/overhead/Opex forever — a rival "can run negative forever" (`code-finance.md:228`, HIGH) |

**So "insolvency" is not currently a game concept for either side — it is a harness label.** The D-16
lab's `states.ts:9,51,98` classifies `cash < 0` as `"insolvent"` for measurement purposes only; the
digest is explicit that this must not be read as shipped game law. What the lab *did* measure, with
real weight, is the reason a terminal state and a rescue mechanism must ship together:

> Insolvency (cash < 0) is **mechanically absorbing**: weekly self-transition 99.69%, and **0 of 4,700
> oracle-policy continuations ever escape it** (comp-bankruptcy-loans.md:100, corroborating
> `D-16-ECONOMY-RECOVERY-DECISION-LAB.md` gates G8/G11). Durable recovery from the milder distressed
> states (constrained/bareMinOnly/noProduction) is reachable in 5%/0%/0% of 124,200 real player
> continuations — an *oracle* (perfect-information policy) manages only 7.5–10.8% from the same states,
> so recovery is **unfindable with the tools currently in the player's hands, not structurally
> impossible.** The designed recovery tool for this exact state, the cheap bare-minimum film, is
> **arithmetically refuted**: from the Owner's own Week-86 save the best possible cheap-film outcome has
> **P(profit) = 0 exactly** (best Studio Revenue $1.91M vs. $2.02M cost, 102/250 luck draws hitting the
> 1.8× ceiling and still losing).

This is the strongest evidence in the whole file for the shape of Direction E. **It does not undermine
E — it explains why E bundles a terminal state with loans rather than proposing either alone.** A
terminal state with no rescue mechanism is Hollywood Animal's criticized trap; a rescue mechanism with
no terminal state is the current death spiral (overhead compounds forever, nothing ever resolves). The
recommendation below (§2–§5) is built to give the player a **real** escape (a loan, sized and priced so
it is felt but survivable) before the clock that leads to the terminal state starts, and to make the
clock itself survivable exactly once.

**Adopts:** negative cash remains non-terminal and recoverable, matching original retail law and
current code (`negativeCashOnly` in Annex, `P15-PACKAGE.md` law 5 "Negative cash is not bankruptcy").
**Rejects:** any reading of "insolvent" (D-16 harness or otherwise) as itself a failure state — it
is one input among several, per §2. **Owns:** definitional; no package change required to adopt this
half, it is already true. **CONFIRMED** against prior P15 text (`P15-PACKAGE.md` §6, Roadmap §5.3).

---

## 2. Trigger hierarchy: symmetric pre-terminal law

`scratchpad/out/phase2/rival-failure.md` does not exist yet at the time of this analysis. The
hierarchy below is derived independently from (a) the **existing** P15-PACKAGE §12.3 corporate-fate
lifecycle, which already specifies `active → warning → distress → recovery → active ↘ dormant →
recovery` with the explicit design rule *"the same warning/distress/recovery/dormancy predicates and
equivalent typed remedy capability families… for player and rivals; only presentation and selection
mechanism may differ"* (§12.3, verbatim), and (b) the comparator trigger taxonomy in
`comp-bankruptcy-loans.md` §2.1. **The smallest correction, not a new design, is to extend that
existing five-state diagram with the terminal branch it already anticipated in prose** (*"a separately
approved rival path may add `dormant → closure-settlement → archived`, while the player graph remains
recoverable dormancy unless the Owner separately authorizes a player terminal ending"* — §12.3). Owner
Direction E is precisely that separate authorization. Nothing about the pre-terminal shape needs to
change; only the last edge needs to exist for both sides now.

**Recommended six-name ladder** (keeps the four inherited names, adds two):

```
healthy → warning → distress → severe distress → insolvency → bankruptcy
                                                                  ↘ settlement/auction/closure
              ↖_____________ recovery _____________↗
```

| Stage | Trigger (recommend) | Code hook available today | New? |
|---|---|---|---|
| **Healthy** | `RecoveryPosition = 'healthy'` (standard + typical-recent film both affordable, cash not shrinking) | `studioRunRecap.ts:79-92, 991-992` — **existing selector, reusable as-is** | No |
| **Warning** | `RecoveryPosition = 'constrained'` for ≥ 4 consecutive weeks, OR cash < 8 weeks of fixed costs (payroll+overhead+facility Opex) | `classifyRecovery` (`:970-1005`) already returns `'constrained'` with sourced `reasons[]` text; the 8-week liquidity line is `finance-logic.md` §3.7's own covenant candidate ("≥ 8 weeks of payroll + overhead") | Threshold only |
| **Distress** | `RecoveryPosition = 'severe'` sustained ≥ 13 consecutive weeks (one quarter), OR (once loans exist) a covenant breach uncured 8 weeks | `'severe'` branch already exists (`:1005`, `!standardOk && !hasActiveRevenue && !waitingHelps`); the 8-week covenant cure is `finance-logic.md` §3.9's own proposal | Threshold + covenant plumbing |
| **Severe distress / Event of Default** | 4 missed weekly obligations (payroll, overhead, or a loan instalment) within a rolling 13-week window, OR book net worth negative for 26 consecutive weeks | New — needs a missed-payment counter and the Book Net Worth read-model (`finance-logic.md` §1.5, currently un-authorized as a P11 change) | Yes |
| **Insolvency (bounded rescue)** | Automatic entry on an uncured Event of Default; a fixed-length administration/rescue window opens | New — this is the terminal question's Stage C, see §5 | Yes |
| **Bankruptcy (terminal)** | Rescue window expires without the studio returning to at least a cured Distress position | New — settlement, then the postmortem dossier (§5–§6) | Yes |

**A genuine cross-check worth naming, not a problem with the Owner's direction:** the player-side
condition assessment above (`classifyRecovery`) and the rival-side gate (`operatingReserve`) are
**currently two unrelated functions** reading different account shapes (`GameState.studio` vs.
`RivalAccount`). P15-PACKAGE §12.3's own symmetry rule requires "equivalent" predicates for both, not
identical code paths — so the correct build-time move (for whichever package eventually implements
this) is to **generalize `classifyRecovery`'s inputs to also accept a `RivalAccount` projection**,
rather than write a second, independently-tuned distress classifier that could silently drift out of
sync with the player's. This is a reuse note for the rival-failure report and P15B, not a structural
objection to Direction D/G.

**Adopts:** reuse of the existing `RecoveryPosition` selector and its `reasons[]` array as the
Warning/Distress seed (zero new state, only threshold values); OpenTTD's "net position over a rolling
window, not one bad week" trigger shape (`money − loan < −maxLoan` for 3/6/9 months); Prison Architect's
two-condition trigger (stock **and** flow) generalized as "missed obligations **or** sustained negative
net worth," never single-week cash sign. **Rejects:** Software Inc.'s instant-at-$0 same-day trigger
(too harsh, no cure window); MGT2's pre-2021-fix resetting counter (exploitable — "be positive for one
week, counter resets" lets a player launder distress away with one lucky opening weekend).
**Owns:** P15B (condition-assessment law), reading P11 conserved finance truth; the missed-payment
counter and Book Net Worth figure are additive P11 selectors P15B consumes, not computes.

---

## 3. How much warning

| Stage transition | Recommended clock (PROVISIONAL) | What the player must see | Comparator basis |
|---|---|---|---|
| → Warning | none (persistent status only) | Cause list from `classifyRecovery`'s existing `reasons[]` (already sourced, e.g. *"A standard-budget film is NOT affordable"*); current cash; weekly burn; runway weeks | GearCity's inline-remedy memo pattern; matches P15 law "every… fact links to typed facts" |
| → Distress | 13-week visible countdown starts once `'severe'` persists | All of the above, plus: due obligations this quarter (payroll, overhead, any loan instalment — reuse `bridge/finance.ts`'s existing per-employee wire shape), and the remedy menu (§4) becomes a persistent panel, not a one-off dialog | Two-stage warn→fail is the comparator norm (TPH, OpenTTD, Prison Architect, GearCity — `comp-bankruptcy-loans.md` §2.2); reject Hollywood Animal's single 100-day clock (criticized as a trap in the assigned task and in HA's own player threads) in favor of a **longer, two-clock** structure |
| Event of Default → Insolvency (rescue) | automatic, immediate | A single, unambiguous, large notice: what defaulted, why, and that a bounded rescue window has opened, with its exact end date | Prison Architect's CEO-warning pattern (visible, dated) over GearCity's "Bankrupt Warning!" memo (has typed remedy buttons — reuse the *pattern*, not the memo itself) |
| Insolvency → Bankruptcy | 13-week rescue window (PROVISIONAL), one-time, not repeatable | Remaining days/weeks, the exact cure condition (return to at least cured Distress), and that failure to cure ends active play | Combines GDT's "one honest second chance" framing (do NOT make the rescue automatic/forced — task flags GDT bailout as "death or glory," i.e. a forced one-shot is itself a trap) with Cities:Skylines 1's one-time, non-repeating bailout |

**Why 13 weeks (a quarter) rather than Hollywood Animal's ~14-week clock or MGT2's ~6-month window:**
this is explicitly a PROVISIONAL tuning choice, not a finding — pick a number, ship it, and let real
playtest data move it. It is chosen here because it is already the project's own unit (P15's Power
Ranking is quarterly per Direction B) and matches `finance-logic.md`'s own Event-of-Default proposal
("N = 4 missed weekly instalments within 13 weeks… long enough to survive one bad release week, short
enough to matter"). The Distress-stage 13-week sustain requirement (before Insolvency can even trigger)
is deliberately **longer** than Hollywood Animal's single clock precisely because HA's clock is the
task's own named trap comparator — the ladder here front-loads a full quarter of *visible,
consequence-free* warning before the first clock with teeth even starts.

**Adopts:** a visible, dated clock at every stage past Warning (never a hidden counter — MGT2's
pre-fix hidden non-resetting counter drew the strongest "unfair" complaints in the comparator set);
sourced causes reusing the existing `reasons[]` pattern; counting scheduled receipts before declaring
distress (`P11` already exposes `pipelineRunRevenue` — HA and GDT's "money-in-flight" complaints are
the cited reason). **Rejects:** a single one-stage clock (HA); a resetting counter (MGT2 pre-fix).
**Owns:** P15B (clock/notice orchestration), reading P11 obligation and receipt truth.

---

## 4. Legal recovery actions — evaluation

| Action | Status | Exploitability | Dignity | Verdict |
|---|---|---|---|---|
| Release talent (50% of remaining guarantee) | **Existing**, intentionally ungated (`actions.ts:2693-2723`; D-16 R3 `D-16-OWNER-RULINGS.md:45`) | Low — cost is real and immediate, no loop | High — matches real severance economics | Keep as-is; surface prominently in the Distress remedy panel |
| Let contracts expire | **Existing**, free | None | High | Keep, but flag as **too slow** for Distress-stage remedy: contracts run 52–208 weeks; a studio already in Distress cannot wait that long — the panel should say so explicitly rather than let the player rely on it |
| Demolish facility (50% refund) / strike set (35% refund) | **Existing**, flat, no age curve, "deliberately FLAT in V1" (`placement.ts:1025-1027`; `tuning.ts:1599-1613`); refund always strictly less than capex | None — it is a straight, invariant-enforced loss, not a loop | Medium-high — a legible "fire sale" action, not a trick | Keep; relabel/surface as a Distress-stage remedy ("liquidate an asset"), not just a construction-menu icon |
| Cheap/bare-minimum film | **Existing**, but **arithmetically refuted as a Distress-stage recovery tool** (§1: P(profit)=0 exactly at the Owner's own distressed save) | N/A — it doesn't work, so it can't be exploited, but presenting it as "the" recovery path (as D-12.12 originally did) is a false promise | Low if mis-marketed | **Do not re-market this as a rescue mechanism.** It remains a legitimate ordinary production choice; the remedy panel must not imply it cures Distress |
| Advance time (do nothing) | **Existing**, passive | None | N/A | Not a remedy — fixed costs compound; the panel should say waiting alone worsens position (the `reasons[]` text already says this: *"Waiting alone worsens the position"*) |
| **New:** Loan, Tiers A–C (operating line, facility mortgage, production bridge) | New | Bounded by LTV ≤60% of book value, leverage ≤3× trailing surplus, interest coverage ≥3× — `finance-logic.md` §3.6-3.7 already designs the covenant set that prevents a borrow-invest-borrow loop | High — standard, transparent business financing, felt-but-survivable at current tuning ($1–5M loans; a $20M loan at 8%/10yr would add 3.7× base overhead and should be covenant-refused per the same report) | **Adopt as the primary NEW Warning/Distress remedy** |
| **New:** Loan, Tier D (Rescue) | New | Available **only** inside the bounded rescue window, small, creditor-dictated terms, symmetric for rivals (`finance-logic.md` §3.6) | Medium — a real cost, not a free escape, but exactly bounded to the one-time rescue window so it cannot be farmed | Adopt, gated to Insolvency stage only |
| **New:** Sell a facility/set to another studio (true inter-studio asset sale, not demolition-for-refund) | New, but **out of this section's scope** | Unknown — pricing, buyer selection, and contract law all depend on the M&A/asset-transfer boundary Direction I asks a different analysis to define | N/A yet | **Defer** to the Direction I package-boundary research; the plain demolition-refund liquidation above is already lawful today and should ship as the Distress-stage "sell" affordance in the meantime |
| **New:** Restructure/administration with an imposed remedy menu | New | Low if bounded and one-time (see below) | High if transparent — FM24's official staged ladder (budget deficit → board-controlled sale window → administration with visible net-debt/P&L graphs → embargo → Company Voluntary Agreement) is the strongest shipped precedent for exactly this shape (`comp-bankruptcy-loans.md` digest correction: the official FM24 feature page, not merely community text, documents this) | **This is the Insolvency stage itself** — see §5 |
| **New:** Voluntary dormancy (stop new commitments, let the studio idle) | New in name, **not new mechanically** — already achievable today by simply not renewing/greenlighting | None — it is inaction with a label | High — pure player agency, no forced state | Adopt as a **labeled, encouraged** option at Warning/Distress, not a new mechanic |
| **New:** Automatic/forced rescue offer (bailout) | New | **Reject.** Game Dev Tycoon's forced one-shot bailout is explicitly the task's own "death or glory" comparator — a forced rescue removes player agency at the exact moment agency matters most, and a second bad month after a forced bailout reads as double jeopardy | — | **Reject** as an automatic mechanic; the player-**initiated** Tier D loan above is the dignified substitute |

**Adopts:** typed, visible remedies at the warning/distress stage (GearCity's Cut Funding/Cut Production
memo pattern, generalized); a covenant-bounded loan ladder (`finance-logic.md` §3.6-3.9, already fully
designed and awaiting only this Owner authorization); one-time, bounded, player-initiated rescue
financing. **Rejects:** forced/automatic bailouts (GDT); re-marketing the cheap film as a cure;
inter-studio asset sale as part of this section (belongs to Direction I's boundary research).
**Owns:** loan ledger mechanics = **P11**; remedy-menu surfacing, dormancy labeling, and the rescue
window's imposed-remedy grammar = **P15B**; any true inter-studio sale = **new P15D or P16+**,
undetermined pending Direction I's own package-boundary analysis.

---

## 5. The terminal experience

| Option | Shape | Verdict |
|---|---|---|
| **A. Hard campaign-over screen** | Play stops, a static end card shown | **Reject.** Matches Hollywood Animal's criticized pattern (hard game-over forcing reload/restart after a 50/100-day clock) and directly contradicts `OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §1's spirit ("no hard calendar game-over") now extended by Direction E to corporate failure; also forecloses Direction J/K's "every failure is acknowledged evidence" requirement |
| **B. Immediate postmortem/Legacy dossier** | Bankruptcy fires, active play ends, the P15C interpretation machinery runs immediately with an early trigger | Right *destination*, wrong if used **alone** — arriving here with no prior rescue chance is functionally Option A with better production values |
| **C. One bounded rescue/administration state before terminal** | A single, fixed-length, non-repeating administration window (§2's Insolvency stage) with an imposed remedy menu, then either cure (→ Distress) or expiry (→ terminal) | Right *bridge* — this is what makes Direction E's "meaningful… recovery first" true in a way the D-16 evidence (§1) can actually support, because it adds the one thing the death spiral currently lacks: a bounded, real, player-agency-preserving exit |
| **D. Superior combined structure (recommended): C → B** | Insolvency (bounded rescue, one-time) → if uncured, terminal bankruptcy event fires → **same P15C finale reducer**, different trigger, launched immediately | **Adopt** |

**Rejected variants of D, with reasons:**

- *"Keep the studio, lose control"* — creditors run the studio for N quarters, player may regain it.
  Real-world analogue is Football Manager's administration, but FM's administration is board-owned
  (the manager is not sacked, the club persists under someone else's authority) and — per the digest's
  own correction — the official FM24 feature page documents it as an **indefinite, repeatable** state
  ("clubs can re-enter administration repeatedly"), not a bounded, regain-able one. Building an AI
  policy to operate the player's studio for a fixed span is real machinery (a second rival-grade AI
  loop, plus a rejoin transition) with no clean shipped precedent for the "regain it later" half.
  Consistent with Direction I's own caution against assuming a whole subsystem belongs in P15 core:
  **defer to P16+ if ever wanted**; it is not required to satisfy Direction E.
- *Capitalism-Lab-style "continue as employee/found a new company"* — the Owner's own digest
  correction is explicit that this pattern ("Playing Without a Company") is an **unshipped DLC
  preview**, not a shipped mechanic. **Reject** as a P15 pattern to adopt; there is nothing proven to
  copy.

**Recommended stage names and durations (all PROVISIONAL, arithmetic shown, HYPOTHETICAL values):**

| Stage | Name | Duration | Note |
|---|---|---|---|
| 4 | Insolvency (bounded rescue / administration) | 13 weeks, one-time, non-repeatable | Imposed remedy menu (loans Tier D, mandatory talent release above a cap, forced dormancy); FM24-style visible net-obligations display |
| 5 | Bankruptcy (terminal event) | instantaneous | Settlement receipts fire: contracts/talent → free agency (Direction H's notice grammar, generalized to the player), assets → the existing demolition-refund liquidation path or, if Direction I ships first, an asset auction, historic identity **preserved forever** (StudioId never recycled — Direction D/P15-PACKAGE law "No identity death") |
| — | Postmortem / Legacy dossier | opens immediately, no additional wait | **Same P15C reducer** (`not-due → 2040-eligible → source-snapshot-frozen → interpretation-built → presented → archive-browsable`, `P15-PACKAGE.md` §12.4) with an **early-exit trigger substituted for `2040-eligible`** — every other state name and the "no single overall Legacy score, multiple archetypes may apply, every claim traces to evidence" rules (Direction J) apply unchanged |

**Illustrative PROVISIONAL timeline** (hypothetical studio, 40 employees, one $5M/8%/10yr facility
mortgage, weekly fixed costs `OVERHEAD_BASE 15,000 + 1,500×40 = 75,000` payroll/overhead-band plus the
mortgage's `$13,976/week` — this exact loan-cost figure is `finance-logic.md` §3.10's own worked
number, not re-derived here):

| Week (relative) | Cash | Stage | Why |
|---|---|---|---|
| 0 | $20,000,000 | Healthy | Standard + typical-recent film both affordable |
| ~180 | $2,400,000 | Warning | `constrained` for 4 straight weeks after two underperforming releases; cash < 8×(75,000+13,976) ≈ $712,000 threshold is not yet crossed, but the sustained `constrained` reading fires first |
| ~230 | $650,000 | Distress | `severe` sustained 13 weeks; visible clock starts; remedy panel opens (loan, release talent, demolish, dormancy) |
| ~243 | −$180,000 | Severe distress / Event of Default | 4th missed weekly mortgage instalment inside a 13-week window | 
| ~243 | −$180,000 | Insolvency (rescue opens) | Imposed remedy menu; Tier D rescue loan offered; 13-week clock to cure |
| ~256 | (no cure achieved) | Bankruptcy (terminal) | Settlement fires; postmortem dossier opens |

This is a single hypothetical path shown to make the arithmetic legible, not a tuning proposal — real
values depend on Owner-approved loan tiers, era `costScale`, and playtest data.

**Adopts:** OpenTTD's precedent for **terminal asymmetry with identical pre-terminal law** — in
OpenTTD's single-player mode the human company is never deleted while AI companies are, using the same
staged months up to that point (`economy.cpp:547-627`; single-player exemption at `:606-611`). Here the
asymmetry runs the other way by Owner design (Direction E specifically **removes** the player's
protection that OpenTTD's human enjoys), but the **method** — same predicates and stages for both
sides, differing only at the final edge — is exactly what P15-PACKAGE §12.3 already specifies and what
OpenTTD demonstrates is buildable. **Rejects:** Option A outright; Option D's "administration runs the
studio" and Capitalism-Lab "continue as employee" variants, both for the reasons above.
**Owns:** the Insolvency/Bankruptcy stages and settlement receipts = **P15B**; the postmortem dossier
content and interpretation = **P15C**, unchanged except for its trigger; the historic-identity
preservation invariant (StudioId, films, people, awards remain accessible forever) = **P12**, already a
standing law (`P15-PACKAGE.md` law 6 "No identity death") that this section only exercises, not amends.

---

## 6. Interaction with Save As branching and the 2040 finale

**Save As gap.** `bridge/runtime/campaign-library.ts` defines `CAMPAIGN_LIBRARY_FORMAT` and the Save
As mechanism (`P12-TO-P13-PRODUCER-HANDOFF.md:16`: *"Save As branches the current complete
world/IDs/RNG under a new storage ID, preserving the original record; it is not a fresh seed"*), but
**carries no read-only/archived/frozen flag on any saved slot.** This matters for two reasons this
section touches directly:

1. Direction K requires the 2040 finale to **freeze** the official Legacy interpretation while allowing
   continued Endless Sandbox play that must not rewrite it. A terminal player bankruptcy produces
   exactly the same requirement at a much smaller scale: once the postmortem dossier is presented, that
   save's interpretation should not silently keep changing if the player reopens it.
2. Unlike 2040 (where play can continue in Endless Sandbox because there is still an operating studio),
   a bankrupt player studio has **no operating studio left to continue with** in the same save —
   whatever "continue" means post-bankruptcy (a fresh Founding Flip? a frozen archive-only view?) is an
   open design question this section does not resolve; see remaining decisions below.

**Recommendation:** an additive, boolean-or-enum field on the campaign-library entry (e.g.
`recordStatus: 'active' | 'frozen'`), set once when either a 2040 finale or a terminal bankruptcy
commits its snapshot. This is a pure additive root exactly matching the save format's own documented
pattern (V19, "uniform additive-root migration" — no existing field changes shape) and P15-PACKAGE
§13.1's own rule ("use additive relation/event/index roots… do not widen frozen recursive historical
leaves"). **Owns: P12** (campaign-library/save-format is its authority per the Producer Handoff table);
P15B/P15C would each request the flag be set at their respective commit points, not implement the field
themselves.

**2040 finale reuse.** The task's own framing is exactly right and needs no correction: *"a player who
fails in 1975 gets a postmortem dossier — same P15C reducer, different trigger."* Concretely, this
means P15C's lifecycle gains a second entry point alongside `2040-eligible` — an `early-exit-eligible`
state carrying the same downstream stages (`source-snapshot-frozen → interpretation-built → presented →
archive-browsable`). Every Direction J requirement (biggest films/failures/legendary
people/collaborations/rivalries/awards/financial highs and crises/technology/growth/bankruptcies and
recoveries — note: **the player's own** bankruptcy is now itself one of the dossier's named subjects,
not only rivals'/dominance periods/acquisitions if any/Legacy archetypes, no single score, every claim
sourced) applies unchanged to an early dossier; the only difference is how much history exists to draw
from, which is inherently smaller for a studio that failed in 1975 than one that reached 2040. That is
a content-richness difference, not a rules difference, and needs no special-casing.

**Adopts:** a single additive save-record-status field, set by whichever of P15B/P15C commits first, no
new persistence model. **Rejects:** any bespoke "bankruptcy save format" or a second finale reducer.
**Owns:** P12 (field), P15B (bankruptcy-triggered commit), P15C (early-exit lifecycle entry point).

---

## 7. Package ownership summary

| Component | Owner | Basis |
|---|---|---|
| Loan principal/interest/amortization ledger, missed-payment counter, Book Net Worth read-model | **P11** | "P11 likely stays authoritative for ledger/debt math" (Direction F); Book Net Worth is a P11 selector per `finance-logic.md` §1.5, now more clearly in-scope given Direction C |
| Condition-assessment ladder (healthy→…→insolvency), remedy-menu orchestration, rescue-window imposed remedies, terminal bankruptcy event + settlement receipts | **P15B** | Extends the existing §12.3 lifecycle already in `P15-PACKAGE.md`; this section's central recommendation |
| Talent free-agency + large industry notice on player failure | **P15B**, consuming P10/P14 contract truth | Generalizes Direction H's rival-failure notice grammar to the player case (open decision below: exact wording/visibility parity) |
| Postmortem/Legacy dossier content, early-exit lifecycle entry point | **P15C** | Same reducer named in the task; only the trigger is new |
| StudioId/film/person historic-identity preservation | **P12** (standing law, unchanged) | "No identity death," already governing |
| Save-record-status flag | **P12** | Save-format/campaign-library authority per Producer Handoff |
| True inter-studio asset sale / acquisition of a failed rival | **Undetermined — new P15D or P16+** | Explicitly out of this section's scope; depends on Direction I's separate package-boundary research |
| Advanced corporate finance (equity, investors, bonds, IPO) | **P16+** | Unchanged; Direction F authorizes only "a simple system" now |
| Governance prerequisite (§0 amendment) | **No package — a documentation-only Owner ruling** | Must precede any of the above being charterable |

---

## 8. Remaining Owner decisions

1. **Record the §0 amendment** to `OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §3 and flip P11-REQ-041/042's
   disposition — the one blocking prerequisite.
2. Approve the six-stage ladder and its names (this report keeps the four inherited P15-PACKAGE names
   and adds two), or direct different naming/state count.
3. Approve or revise every PROVISIONAL duration: 4-week constrained-warning floor, 13-week
   severe-distress sustain, 4-missed-in-13-weeks default rule, 26-week net-worth test, 13-week rescue
   window. None of these are evidence-derived; all need real playtest tuning.
4. Approve the loan product tiers A–D from `finance-logic.md` §3.6 (sizes, rates, covenants) — a
   shared decision with whatever package ultimately authors the loan charter.
5. Confirm the terminal structure choice (C→B, this report's recommendation) over a pure B, or direct
   the fuller "creditors run the studio" D-variant despite its missing shipped precedent.
6. Whether a failed **player** studio fires the same large, high-visibility public notice Direction H
   specifies for failed rivals (who is the audience — remaining rivals? a post-bankruptcy sandbox
   continuation, if any?) — genuinely open, not resolved here.
7. What "continue" means, if anything, in the same save after a terminal player bankruptcy — a fresh
   Founding Flip in the same world, an archive-only view, or nothing until a new campaign — not
   resolved here and flagged as the one real gap in the Save-As interaction (§6).
8. Whether the missed-payment/net-worth Event-of-Default test should also gate the exact P16+
   acquisition boundary (i.e., can only a *bankrupt* rival be acquired, or a merely-distressed one too)
   — belongs to Direction I's research, flagged here only because this section's triggers would be its
   input.

---

## 9. Corrections to prior P15 text

| Prior text | Status | Correction |
|---|---|---|
| `OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §3: no-hard-bankruptcy ruling "applies to the player's studio… unchanged" | **SUPERSEDED BY OWNER DIRECTION** | Direction E is the "separate Owner gate" the ruling itself said would be required; needs a recorded documentation amendment (§0) before it takes effect |
| P11-REQ-041 "Loans… require separate Owner gate" — OWNER-BLOCKED | **QUALIFIED / PARTIALLY SUPERSEDED** | Direction F authorizes a *simple* studio-scale loan system now; investor/equity/advanced-financing instruments remain OWNER-BLOCKED pending P16+ |
| P11-REQ-042 "Bankruptcy/failure… require separate Owner gate" — OWNER-BLOCKED | **SUPERSEDED BY OWNER DIRECTION**, pending §0 amendment | Direction E is that gate for the player side |
| P15-PACKAGE §12.3: "the player graph remains recoverable dormancy unless the Owner separately authorizes a player terminal ending" | **CONFIRMED as still-accurate prose, now exercised** | The diagram's pre-terminal shape is reused unchanged (§2); only the terminal branch, which the prose already anticipated, is newly authorized |
| `P12A-R05-OWNER-DECISIONS-AND-ACCEPTANCE.md:118`: "Businesses can succeed or struggle financially without this checkpoint claiming to implement bankruptcy/acquisition systems" | **CONFIRMED**, historically accurate for P12A's scope at the time | Not contradicted — P12A correctly declined to build this; P15B is the follow-on package Direction D/E now authorize |
| `finance-logic.md` §1.5: "Book Net Worth… still a P11 read-model change and thus needs its own authorization; nothing here authorizes it" | **CORRECTED** | Direction C's explicit requirement for a meaningful, understandable net-worth display, plus this section's use of Book Net Worth as a §2 trigger input, together constitute the authorization that report withheld judgment on |
| D-16 R10 / D-17B: prohibition on loans and a failure ladder | **SUPERSEDED BY OWNER DIRECTION** (E, F) | Both were correct dispositions under the prior ruling; Direction E/F is the new ruling |
| `comp-bankruptcy-loans.md` original draft: FM's finance context described as "transfer/finance context only," no staged distress comparator | **CORRECTED per the phase1-verify digest** | The official FM24 feature page documents a real staged ladder (deficit inbox → board-controlled sale window → administration with debt/P&L graphs → embargo → CVA); this section relies on the corrected reading |

---

*Word count target 2,000–5,000 met. All numeric scenarios in §3 and §5 are labeled PROVISIONAL/
HYPOTHETICAL and are not tuning proposals. Short quotes throughout are ≤40 words and cite file:line or
document:section. No file outside this analyst's assigned output path was modified.*
