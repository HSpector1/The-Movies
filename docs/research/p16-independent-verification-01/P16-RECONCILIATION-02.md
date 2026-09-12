# P16 Independent Verification — Reconciliation 02 (Owner-direction and transaction reconciliation, 2026-09-12)

**Status:** INDEPENDENT RESEARCH — DOCUMENTATION ONLY · NO IMPLEMENTATION AUTHORIZATION · NOT OWNER ACCEPTANCE · **FUTURE OPS REVIEW REQUIRED**
**What this is:** the one bounded reconciliation Future Ops requested after reviewing commit `5239dc7affa2537672ff4e4714a9891797621293` of this package. It applies the five required corrections in order, re-tests the acquisition economics in one ledger, corrects the authority labels, and lists every bounded edit it made to the active report, the ruleset annex and the scenario files. The evidence dossiers (`evidence/`) and the design-panel record (`design-panel/`) are **archived analysis** and are untouched; where they say something this document supersedes, this document is the later, corrected statement.
**Newer inputs read as planning sources, not runtime:** the P14 preparation package at [`8ef5246a`](https://github.com/HSpector1/The-Movies/tree/8ef5246aec115cc32d01d9fb8c916e3538342dca) (Revision 3: companion §3 firing note, §3.5 exploits and guard, §7 decision register) and the P15 verification package at [`81a4aedf`](https://github.com/HSpector1/The-Movies/tree/81a4aedf776840c6c90e80ecf8939cb89f2e5e7a) — [`RECONCILIATION-02.md`](https://github.com/HSpector1/The-Movies/blob/81a4aedf776840c6c90e80ecf8939cb89f2e5e7a/docs/research/p15-independent-verification-01/RECONCILIATION-02.md) read before its earlier [report](https://github.com/HSpector1/The-Movies/blob/81a4aedf776840c6c90e80ecf8939cb89f2e5e7a/docs/research/p15-independent-verification-01/P15-INDEPENDENT-VERIFICATION-REPORT.md). Neither is accepted runtime; the accepted code authority remains `13370d42` (`src/` identical to `592e926`).
**Companions:** [`P16-CORRECTED-DECISION-REGISTER.md`](P16-CORRECTED-DECISION-REGISTER.md) (the concise register this reconciliation produces) · [`P16-INDEPENDENT-VERIFICATION-REPORT.md`](P16-INDEPENDENT-VERIFICATION-REPORT.md) (the active report; its bounded edits are listed in §8) · [`P16-INDEPENDENT-VERIFICATION-REVIEW-INDEX.md`](P16-INDEPENDENT-VERIFICATION-REVIEW-INDEX.md) (entry point) · [`calculations/reconciliation-02-ledger.py`](calculations/reconciliation-02-ledger.py) → [`OUTPUT`](calculations/reconciliation-02-ledger.OUTPUT.txt) (every figure in §5).

**Labels used here** (the report's §0 classes, plus the compound status Future Ops asked for):
`[OWNER DIRECTION]` the 2026-09-11 P15 direction A–K as relayed in the P15 package (binding product direction, not yet a recorded ruling: A window competition · B Power Ranking · C net worth/value shown · D rival failure · E player failure under the same law · F loans · G no replacements, no floor · H talent to free agency · I eventual ability to buy other studios · J ceremony/legacy · K Endless Sandbox) and the 2026-09-11 P14 amendment (26-week-capped early-termination charge) · `[P16 DECISION]` the Owner's full-absorption decision relayed 2026-09-12 · `[SELECTED / NOT YET IMPLEMENTED]` short for **OWNER-SELECTED PRODUCT DIRECTION / NOT YET IMPLEMENTED / PRODUCER CONTRACT AND EXECUTION AUTHORIZATION REQUIRED** — a feature the Owner has chosen that exists in no accepted code and has no charter; it is never re-asked · `[CODE]` accepted TypeScript at `13370d42`, `file:line` · `[P14 PLAN]` / `[P15 PLAN]` a recommendation in the newer planning packages · `[RECOMMENDATION]` this researcher's proposal · `[PROVISIONAL]` an illustrative number · `[OPTIONAL PROPOSAL E]` a later feature nothing requires.

---

## 1. What changed upstream, and what this reconciliation preserves

### 1.1 Preserved unchanged

`[P16 DECISION]` **Full absorption** is the selected initial acquisition model: one operating studio; no autonomous subsidiary; no retained operating label; the acquired `StudioId` and its history preserved permanently; a dated acquisition / end-of-independent-operations event; transferable assets, lawful IP/rights and verified research included according to the deal; knowledge transfers but buildings and installations do not teleport; a **priority opportunity to retain talent, not ownership of people**. `[OWNER DIRECTION]` D, E, F, G, H, I as listed above. `[P14 amendment]` the early-termination charge `weekly × min(remaining, 26)`. Every invariant the report already restates (R14/R15 identity permanence; `FilmIdentity.studioId` = creator forever; R22 knowledge-not-buildings with provenance cited; the P10/P12/P14 ownership boundaries of report §18; the P16A→P16B→P16C allocation; P17/P18 consume, never mint) is untouched.

### 1.2 What the newer packages settle that the report at `5239dc7a` still treated as open or blocked

| Report text at `5239dc7a` | Newer source | Effect here |
|---|---|---|
| "≥3-active-rival floor is a hard transaction predicate" (finding 18, §10, §17, R29); "P15B replacement entrants" as an unresolved dependency (§0, §20-7) | `[OWNER DIRECTION G]`: no artificial floor, no replacement studios, authored arrivals preserved; P15 RECONCILIATION-02 §2.4 rows 11, 16, 19 and §6.1 | **Withdrawn** (§2) |
| "No debt instrument exists … P11-REQ-041/042 remain OWNER-BLOCKED" (finding 6); "whether a genuine debt instrument is ever authorized" (§20-2); "loans remain Owner-prohibited" (§17) | `[OWNER DIRECTION F]` loans (only); P15 RECONCILIATION-02 §2.4 rows 1–4, 9 (gate exercised for loans; investors/external financing/bailouts still outside the direction) | **Reclassified** `[SELECTED / NOT YET IMPLEMENTED]` (§3) |
| "P15B pre-settlement estate window … unauthorized"; "authorize a P15B rival-closure/terminal slice (yes/no)" (finding 7, §13, §20-1); H5 as a blocking prerequisite awaiting authorization | `[OWNER DIRECTION D, E]` genuine rival and player failure; P15 RECONCILIATION-02 §1.3 (P15 owns failure/settlement and the disposal handoff; P16 owns transactions), §1.4 (bounded estate, ≤ 14 weeks), §5.4–5.6 (estate productions; talent release; transaction → retention → release order) | **Reclassified** `[SELECTED / NOT YET IMPLEMENTED]`; the P15 handoff record is adopted as the P16 interface (§3.3) |
| "All contracts transfer intact … then release under ordinary law; safe from arbitrage because R18 netted the full obligation" (§6 Q3–Q4, R18, R19, §17 (3)) | `[P16 DECISION]` priority opportunity to retain, not ownership of people; P14 Rev 3 §3.2 charge law, §3.5 E1 guard, §3.4 busy-set refusal; P15 §5.5–5.6 | **Corrected** (§4, §5) |
| "The player is never a target" as OWNER-SELECTED PRODUCT DIRECTION (finding 17, R16, §10) | Future Ops 2026-09-12: a recommendation, not an Owner approval; `[OWNER DIRECTION E]` one law for player and rivals | **Relabelled and restated** (§6) |
| Automatic liquidation, mandatory excess-staff release, automatic project cancellation carrying ACCEPTED CODE FACT / "mandatory … correction" labels | same review | **Relabelled** RESEARCHER RECOMMENDATION (§6) |
| Eight "genuine remaining Owner decisions" (§20) | same review; P15 RECONCILIATION-02 §2.2 five-class discipline | **Re-dispositioned** in the [register](P16-CORRECTED-DECISION-REGISTER.md): package ownership and recording existing decisions are planning tasks, not questionnaires |

---

## 2. Consolidation: the floor and the replacement-entrant alternative are removed from recommended initial scope

`[OWNER DIRECTION G]` permits consolidation with no artificial floor and no replacement studios. Therefore:

- **R29 is withdrawn.** No acquisition is refused for reducing the count of independently operating studios; a campaign may legitimately end with two, one or zero independent rivals, and that outcome is history, not a failure of the rules. The P15 survivorship sensitivity (RECONCILIATION-02 §6.1) already brackets how likely that is under a constant hazard; acquisitions add a second, deliberate route to the same end state and are reported the same way.
- **No replacement-entrant slice is proposed, assumed or listed as a dependency.** Authored arrivals (`RIVAL_ARRIVAL_WEEKS`, `calendar.ts:3` `[CODE]`) are preserved and are not replacements.
- **What is kept instead** — all `[RECOMMENDATION]`, none a floor: (i) the P15 new-game disclosure "this industry may consolidate" (P15 RECONCILIATION-02 D14, class C) and its pinned industry-wide notices, which P16 reuses for "X acquired by Y" as a DECISION-tier item only when the player must act (P15 §6.5 prominence-vs-deadline rule); (ii) the affordability and cooldown friction of R30 (§7 below), which is what actually paces a serial acquirer (report §17 already showed the floor never bound in Scenario E); (iii) the P15 requirement that every shared-market formula is well-defined at zero or one competitors (P15 report §3), which P16 inherits for any "how many independent studios remain" read; (iv) the H5 terminal-business state (report §5), still needed so a closed or absorbed rival is not ticked or validated as operating — a prerequisite of the failure direction, not a floor.
- The dominance guard (P15 D13) stays `[OPTIONAL PROPOSAL E]`, recommended against.

Consequential edits: report §0, findings 8 and 18, §5, §10, §13, §17 (7), §18, §20, closing-table row S, Appendix B R13/R29; annex header; scenario banners (§8).

---

## 3. Loans and genuine studio failure, reclassified

### 3.1 The compound status

Both are **OWNER-SELECTED PRODUCT DIRECTION / NOT YET IMPLEMENTED / PRODUCER CONTRACT AND EXECUTION AUTHORIZATION REQUIRED**:

| Feature | Direction | Accepted code today `[CODE]` | What P16 does with it |
|---|---|---|---|
| Studio Loan / Rescue loan | `[OWNER DIRECTION F]` — ordinary interest-bearing borrowing, repaid, can contribute to bankruptcy; loans only (investors, external financing, bailouts, arbitrary cash sinks remain outside the direction — P15 RECONCILIATION-02 §2.4 rows 1–4) | no loan, interest or debt record exists (P11 §33; `LedgerKind` closed; `RivalMoneyKind` closed) | reads loan facts through the P11 read models **when they exist** (principal, accrued unpaid interest, arrears, acceleration); until then the loan lines in every P16 ledger are `NOT RECORDED` / zero, never invented |
| Rival failure → settlement; player failure under the same law (C → B: bounded rescue → failure → settlement → preserved history) | `[OWNER DIRECTION D, E, J]`; P15 RECONCILIATION-02 §5.1 | no terminal business state (`hollywoodValidation.ts:331` requires one live business per entered rival; `hollywoodTick.ts:221` ticks every business unconditionally); no settlement week; no estate | consumes the P15 **disposal handoff record** (§3.3) as its only entry to a distressed target; never decides that a studio has failed; never executes a purchase before the handoff exists |

Neither is asked again. The only P16 task on either is planning: name the read models and the handoff record P16C consumes, and record the dependency in the P16C charter when one is written.

### 3.2 How a loan is treated inside a P16 transaction (`[RECOMMENDATION]`, contingent on the loan slice existing)

A loan is a typed obligation with an exact **cure cost = principal + accrued unpaid interest** and **no cheaper exit** (penalty-free early payoff, P15 §7.2). It is therefore the one obligation that may be priced at face without creating the arbitrage of §5: deducting it once from the transaction price and having the acquirer repay or assume it at closing are the same outlay. Rules: (i) in a healthy purchase the loan is either repaid from the price at closing or assumed by the acquirer under the identical law (its schedule continues; the acquirer's post-close leverage must satisfy the same P15 caps — the leverage-cap eligibility test of P15 §9.3 replaces the report's "cash-only economy" framing); (ii) in a distressed purchase the loan is a claim on the estate settled by P15 before any clean purchase — the acquirer never silently inherits it (P15 §9.1 shape 4; OpenTTD precedent); (iii) a Rescue loan can never finance an acquisition (it is sized to fixed costs and offered only in Distress+, where R30's "no bidding while in Warning or worse" already excludes the studio as a buyer); (iv) loan proceeds are financing rows, never operating surplus, so borrowing cannot raise the operating-value estimate or the R30 reserve test — the reserve is measured on cash **after** scheduled instalments.

### 3.3 The P15 handoff record is the P16 interface for a failed studio (`[P15 PLAN]` adopted as the P16 boundary; `[RECOMMENDATION]`)

P15 RECONCILIATION-02 §1.3 states the boundary this report's finding 7 was reaching for: P15 owns the distress ladder, the terminal event, the settlement week and a **disposal handoff record** (what the estate holds at recorded value, cash, conserved work in flight, outstanding claims, the Frozen Reference Price, the release week and the bounded window in which a transaction may close before release); P16 owns offers, bidding, closing, the ownership edge, absorption mechanics and the retention opportunity. The report's "assign-to-acquirer" settlement disposition (finding 7) is the same mechanism seen from P15's side: the settlement week applies any transaction that closed in the same tick **before** it releases talent (transaction → retention → release, P15 §5.6). Two consequences for the report's R26:

- the **estate is bounded by construction** (≤ 14 weeks after the terminal event, P15 §1.4), so R26's "unsold lots persist in a visible estate catalogue" is bounded to the handoff window — after archive, unsold facilities have already been refunded into estate cash by the settlement, films are unowned history, and rights of an archived estate stay unowned (register item C-9);
- a **suspended estate production** may be transferred to an acquirer that completes it (P15 §5.6 leaves this to P16): under R20 it re-forms under the acquirer with its frozen participants, subject to §4.4 below.

---

## 4. Full absorption and first access to talent, carried through the transfer rules

### 4.1 The reconciled transfer table (replaces report §6's "EMPLOYEE CONTRACTS — Yes, intact" and "OBLIGATIONS — subtracted at full value" rows)

| Category | At closing | Acquirer's opportunity | Person's lawful position | Money |
|---|---|---|---|---|
| **Every open contract at the target** | ends in the closing tick by operation of the transaction — reason `employerAbsorbed` (healthy purchase) or P15's `employerClosed` (settlement week); `contractId` embeds the employer (`hollywoodValidation.ts:163` `[CODE]`), so nothing is re-owned in place | a **priority retention window** in the same tick, before any release to free agency (§4.2) | nobody is employed by two studios; nobody is released and then reserved (P15 §5.6) | see §4.3 |
| **Continuation** (healthy purchase only) | the acquirer continues a contract on identical remaining terms: same weekly salary, same `endWeekExclusive`, `signingBonus: 0` (already paid and settled under the old `contractId`), new row under the acquirer's `StudioId` with the P12 "sale/assignment" reason | the acquirer chooses which contracts to continue (this **is** the priority: no competing proposal exists in that tick) | consent is presumed because the bargain is unchanged; refusal only for a P14B-defined reason (early-termination memory toward this acquirer, Nemesis/Enemy seating) — **NOT RECORDED** before P14B exists, i.e. deterministic acceptance | no charge; the guarantee continues as ordinary payroll |
| **Fresh offer** (both paths) | an ordinary P14A proposal priced by the studio-aware entry at ≥ the person's market ask, with the P14 salary floor if this acquirer previously released the person (P14 Rev 3 §3.5 guard) | available for anyone the acquirer does not continue, including every person of a failed studio (whose contracts the settlement has already ended) | the P14A person-choice rule decides; a person may decline into free agency | ordinary signing bonus; the old contract's guarantee is settled per §4.3 |
| **Not retained** | the contract has ended; the person enters `freeAgents` at the end of the closing tick under ordinary hiring law | none after the tick closes — a buyer of estate assets acquires assets, not people, and cannot reclaim anyone later (P15 §5.6) | ordinary free agent; `PersonId`, history and credits intact | healthy purchase: the capped charge (§4.3); estate: a recorded claim (§4.3) |
| **Residual work** (a person seated on an inherited production) | the production re-forms under the acquirer (R20) with participants frozen at greenlight (`hollywoodTick.ts:165` `[CODE]`; the player's greenlight likewise freezes salaries and seats, `actions.ts:16-18`) | if the acquirer **continues** the production it must continue (or fresh-offer and be accepted by) every busy-set participant through release — the same "finish current binding obligations" predicate P14 Rev 3 §3.4 uses for its busy-set refusal — or **cancel** the production at the ordinary write-off; a film is never kept while its seated cast is released mid-shoot | a participant not retained after release is an ordinary free agent; their credit is fixed at greenlight | continuation payroll through release; then ordinary law |
| **Suspended estate production** (P15 §5.4) | transferable to an acquirer who completes it; re-forms under R20 | same rule as residual work | same | the residual overhead (weeks remaining × overhead) is the acquirer's, never the estate's, once transferred |
| **Guarantees** | never an asset, never a liability of the business at book (P15 REQ-016: shown beside, not subtracted) | — | — | appear **exactly once**, as an exit charge or a claim (§4.3, §5) |
| **Free agency** | the settlement/closing publishes the release **after** retention has been applied | — | ordinary hiring law from the next tick; first listed in the hiring market as today | — |
| **No second operating studio; no retained label** | `[P16 DECISION]` — the target's business row reaches the H5 terminal state; its Standing ends with its operations; its films keep it as creator of record forever | — | — | — |

### 4.2 The priority retention window (`[RECOMMENDATION]`, implementing "a priority opportunity to retain talent")

- **When:** inside the closing tick, after the transaction has cleared and before the release step; for a distressed target this is the P15 settlement week's transaction → retention → release order; for a healthy target it is the closing week. It is one DECISION-tier item for a player acquirer (with the P15 pause-and-deadline rule) and one deterministic policy pass for an AI acquirer.
- **What the acquirer sees:** every open contract of the target with its remaining weeks, weekly salary, remaining guarantee, the capped exit charge, and the person's current market ask — these are the **transaction-disclosed** tier of P15 RECONCILIATION-02 §3.5, opened by the costed, dated due-diligence event (R27), so a bidder prices the roster before bidding; contract money stays UNKNOWN in the public tier (P14 Rev 3 §2.1.5).
- **Default when the player takes no action:** continue every contract that fits the acquirer's usable capacity, in the target's own contract order; the remainder is not retained. This default is a recommendation (it replaces R30's "mandatory automatic settlement of excess contracts", which the review correctly notes is not an Owner approval); the capacity cap itself remains a recommendation (§7 R30′).
- **Selection of specific people is the intended mechanic**, not an exploit: the earlier report and annex treated "talent cherry-picking beyond the aggregate headcount cap" as an open Owner decision (report §17 last paragraph; annex §20 item 2). The Owner's "priority opportunity to retain talent" is exactly a choice of whom to keep; its bound is the capacity cap and the ordinary economy (a continued contract costs its salary; a fresh offer costs the market ask and a bonus). The item is closed as resolved by direction.
- **AI acquirer policy (P12 authoring, class C):** continue a contract when its weekly salary ≤ the person's market ask × (1 + a small authored tolerance) and a role slot is open; otherwise do not retain; make fresh offers only for roles the acquirer's `RIVAL_TEAM_ROLES` set lacks.

### 4.3 Guarantees, exits and claims — who pays what, once

| Path | Contract the acquirer does not continue | Contract the acquirer continues | Later release by the acquirer |
|---|---|---|---|
| **Healthy purchase** (target solvent, willing) | the **target** ends it under ordinary law as its own last act, paying `weekly × min(remaining, 26)` from its own cash **before** that cash transfers at par (§5.2); the person is a free agent with the charge in hand | continues; no charge; payroll continues | the acquirer pays the capped charge under its own law on the continued contract; the P14 salary floor then applies to any re-sign by the acquirer (its own termination receipt, P14 Rev 3 §3.5) |
| **Failed studio** (P15 settlement) | the settlement has already ended it: wages to the settlement week paid first; the remaining guarantee is a **recorded claim on the estate**, paid pro rata from estate cash **after the purchase price is received**, unpaid remainder recorded as unpaid forever (P15 §5.3) — the acquirer owes nothing for people it does not retain | a continuation on identical terms makes the person whole, so that person's estate claim is extinguished (fewer claims → other creditors recover more); a fresh offer at market leaves the old claim in place | same as healthy |

Nothing here changes the Owner's cap or adds a fee: the only amounts that ever move are the P14 charge, ordinary payroll, ordinary signing bonuses and P15's pro-rata claims.

### 4.4 What "first access to talent" is worth, and why it is not a windfall

The acquirer gets, in one tick and without competition: continuation of any contract it wants (no bonus, no case, no rival proposal), and a fresh-offer right at the market ask to anyone else. It does **not** get: a price reduction for anyone's future salary (§5); a release cheaper than the P14 charge; anyone who lawfully declines; anyone after the tick closes. Every alternative a rival has (hire from free agency at the ask plus bonus) remains open to it. The advantage is time and certainty — which is what the Owner selected.

---

## 5. Acquisition economics, re-tested in one ledger

### 5.1 Four numbers, kept distinct (P15 RECONCILIATION-02 §3.1 adopted; report §14's definitions corrected)

| Concept | Made of | Who computes | Used for |
|---|---|---|---|
| **Book Net Worth** | cash + Σ facility recorded capex × 0.50 + Σ set recorded capex × 0.35 − loan principal − accrued unpaid interest; **contract guarantees are not subtracted** (REQ-016: shown beside as Guaranteed Obligations) | P11 read model | display; bands; settlement facts. *Report §14's "BNW = … − typed obligations at full value" is CORRECTED to this.* |
| **Liquidation value** | the same sum on the refund basis (`tuning.ts` 0.5 / 0.35 `[CODE]`) — equal to book under P11's liquidation basis; the FRP at settlement | P11 / P15 | reserve floor of any distressed lot; the seller's reservation in a healthy sale (a rational seller never accepts less than liquidating) |
| **Operating value** | `[3, 6] × three-year trailing operating surplus (floored at 0) + cash − debt`, **unfloored**: it may fall below book and the panel says so; never a mechanic | P11 formula, P15A.2 display | information only. *No floor is restored here.* |
| **Transaction price** | what was actually paid, per §5.2 or §5.3; the acquisition event records it | P16 | history; the acquisition event; the ledger below |

The seller's Ask in a healthy sale is `independence premium × (max(refund-basis tangible, operating value excluding cash) + library appraisal)`; the `max` is the seller's reservation price, not a floor on the displayed estimate, which stays unfloored. Cash is never inside any lane and is added once at par (R17). Library counts once (R06). Technology is buyer-private (R22). **Guarantees are in no lane at all** — they enter the ledger only as an exit charge or a claim, once.

### 5.2 The ledger law for a healthy purchase (`[RECOMMENDATION]`; replaces R17/R18/R19 as they stood)

```text
consideration        = premium × basis excluding cash                       (paid to the seller)
target exits         = Σ over contracts NOT continued of weekly × min(remaining, 26)
                       — the target's own early releases under ordinary law, debited from
                         its own cash in the closing tick, before transfer
cash transferred     = target cash − target exits                            (at par; negative if the
                                                                              target cannot cover its exits)
loan                 = principal + accrued interest, repaid from consideration or assumed
                       under the same law (only when the loan slice exists; else NOT RECORDED)
closing outlay       = consideration − cash transferred (+ loan repaid, if repaid at closing)
later                = ordinary payroll on continued contracts; the P14 charge on any later release
```

Guarantees are never netted from the consideration. The acquirer's exposure to any inherited contract is therefore bounded above by the P14 charge and below by zero, and the ledger never counts an obligation twice.

### 5.3 The explicit case: a $4M guarantee that can be terminated for $1M

Star S: annual $2,000,000 → weekly `round(2,000,000 / 52)` = $38,462 (`employment.ts:167` `[CODE]`); 104 weeks remaining → guarantee $4,000,048; capped charge 26 × $38,462 = **$1,000,012** (P14 Rev 3 §3.2; under accepted code's 50 % rule it would be $2,000,024).

| Rule | Effect on price | Then terminate S | Acquirer's gain vs. an identical target without S |
|---|---|---|---|
| Report at `5239dc7a` (R18: "obligations subtracted at full value"; R19: "safe from arbitrage") | price reduced by **$4,000,048** | pays **$1,000,012** | **+$3,000,036** — the assertion was unsupported; the same arithmetic under the 50 % code rule still yields +$2,000,024, so the report's claim was wrong under both rules |
| Corrected (§5.2) | price reduced by **$0** | the target pays the $1,000,012 charge from its own cash before transfer (or the acquirer pays it later under its own law — same outlay) | **−$1,000,012** (the acquirer bears the exit it chose) or $0 if S is continued (then it pays S's salary for S's work) |

**The proposed protection, stated plainly:** contract guarantees are never a liability in the price. They are not book liabilities (REQ-016), the cheapest lawful exit from any of them is the Owner's 26-week charge, and a price that deducts more than that charge hands the acquirer the difference. So the price ignores contracts; whoever ends a contract pays the ordinary charge, once, in the ordinary way; continuation costs nothing because the acquirer will pay the salary for the work. The cap is untouched; no balancing fee, top-up, cooldown or special acquisition-only charge is introduced; the P14 salary-floor guard (already recommended by P14) closes the remaining re-price motive because a release-then-rehire by the acquirer is priced through its own termination receipt.

### 5.4 Healthy purchase — the full ledger, five retention decisions, old rule beside corrected (all `[PROVISIONAL]`; reproduced by `calculations/reconciliation-02-ledger.py`)

Target T: cash $2,000,000; facilities recorded capex $6,000,000 (refund basis $3,000,000); sets $1,000,000 (refund basis $350,000); no loan (NOT RECORDED — the loan slice does not exist); trailing operating surplus $900,000/yr; library appraisal (P16A read model) $1,500,000; contracts: Star S as above, plus four crew C1–C4 at $260,000/yr (weekly $5,000), 60 weeks remaining (guarantee $300,000 each, charge $130,000 each). Σ guarantees $5,200,048; Σ charges $1,520,012. Willingness `Open`, premium 1.3×; basis excluding cash taken at a paper point of $5,000,000 → consideration **$6,500,000**.

The four numbers for T: **Book Net Worth $5,350,000** (2.0M + 3.35M; Guaranteed Obligations $5,200,048 shown beside it, not subtracted); **liquidation value $5,350,000**; **operating value $4.7M–$7.4M** ("range straddles book"); **transaction price** per the rows below.

| Line | Old rule (`5239dc7a`) | K0 continue none | K1 continue all | K2 continue S only | K3 continue crew only | K4 continue all, release S one week later |
|---|---:|---:|---:|---:|---:|---:|
| Consideration to seller | 6,500,000 | 6,500,000 | 6,500,000 | 6,500,000 | 6,500,000 | 6,500,000 |
| Obligations netted from price | −5,200,048 | 0 | 0 | 0 | 0 | 0 |
| Target cash before exits | 2,000,000 | 2,000,000 | 2,000,000 | 2,000,000 | 2,000,000 | 2,000,000 |
| Target's own exit charges (contracts not continued) | n/a — all assumed intact | 1,520,012 | 0 | 520,000 | 1,000,012 | 0 |
| Cash transferred at par | 2,000,000 | 479,988 | 2,000,000 | 1,480,000 | 999,988 | 2,000,000 |
| Loan repaid / assumed | NOT RECORDED | NOT RECORDED | NOT RECORDED | NOT RECORDED | NOT RECORDED | NOT RECORDED |
| **Closing outlay** | **1,299,952** | **6,020,012** | **4,500,000** | **5,020,000** | **5,500,012** | **4,500,000** |
| Acquirer's later charge under its own law | (fire all) 1,520,012 | 0 | 0 | 0 | 0 | 1,000,012 + one week's salary 38,462 |
| **Final outlay (excluding ongoing payroll)** | **2,819,964** | **6,020,012** | **4,500,000** | **5,020,000** | **5,500,012** | **5,538,474** |
| Continued payroll commitment (the cost of the work, not an outlay of the deal) | 0 after firing | 0 | 5,200,048 | 4,000,048 | 1,200,000 | 1,200,000 |
| Δ vs. an identical target with no contracts (outlay 4,500,000) | **−1,680,036 (windfall)** | +1,520,012 | 0 | +520,000 | +1,000,012 | +1,038,474 |

Reading: under the corrected law the acquirer never gains from a contract's existence; declining a person costs exactly that person's capped charge; continuing costs nothing up front and the salary thereafter; timing tricks (K4 vs. K3) cost strictly more; and the old rule's "fire everyone" windfall (−$1,680,036 at the cap; still −$600,024 at 50 %) is gone. Every guarantee appears once — as an exit charge or as payroll — and never in book, basis or consideration.

### 5.5 Failed studio — Scenario A ("Ridgeline Pictures") re-run under the P15 settlement law (`[PROVISIONAL]`)

Ridgeline at the terminal event: cash −$800,000; facilities recorded capex $3,000,000 (refund basis $1,500,000); four Story Properties appraised $75,000 each; five employees at $156,000/yr (weekly $3,000), 80 weeks remaining (guarantee $240,000 each; the P14 charge would be $78,000 each but no charge is paid at settlement).

1. **Settlement week (P15 §5.3–5.5):** every contract ends `employerClosed`; wages to the week paid first (none in arrears here); five guarantee claims of $240,000 are recorded; the overdraft is carried here as the estate's first claim of $800,000 for arithmetic only (its treatment is P15's). The **disposal handoff record**: tangible at refund basis $1,500,000; four properties (P16A appraisal $300,000; excluded from the P15 FRP, which is $700,000); cash −$800,000; claims $2,000,000; release at the end of the handoff window.
2. **P16 whole-estate lot:** reserve = liquidation basis of the lot = $1,500,000 + property floors at a paper 0.8 × appraisal ($60,000 each, R09 strictly-below-basis) = **$1,740,000**; sealed one-shot comparison; one bid at **$1,800,000**.
3. **Retention in the same tick:** the acquirer continues two people on identical terms → their claims ($480,000) are extinguished; the other three enter free agency with claims. Claims now $1,520,000 ≤ $1,800,000 → paid in full; **surplus $280,000** has no receiving party (P15's disposition; recorded, not distributed).
4. **Acquirer ledger:** price to the estate $1,800,000; **no cash transfers** (the estate's cash is the estate's — P15 shape 4, "clean purchase after creditors settle"); facilities auto-liquidate at closing into a $1,500,000 credit (R21); four properties under the R08 holdback; two continued contracts at $6,000/wk for 80 weeks (ordinary payroll, $480,000). **Net cash outlay $300,000** for four properties plus first access to two people. Clean lots would have cost the same $240,000–$300,000 for the properties with no priority over anyone (a free-agent hire would add a 0.18 signing bonus, $28,080 each, and competition).
5. **The old path is gone:** the report's "$0 floored price, absorb the overdraft, fire everyone for $600,000" (Scenario A, a $1,200,000 windfall against clean lots) cannot occur — negative cash never transfers on the estate path, guarantees are claims not charges, and Rule Gap A-7 (the "excess negative-cash burden" mechanism) closes because there is no such burden to allocate.

### 5.6 Scenario E re-run (healthy deals 1–2; `[PROVISIONAL]`)

| | Deal 1 (week 104, `Open` 1.3×) — old | Deal 1 — corrected | Deal 2 (week 260, `Reluctant` 1.6×) — old | Deal 2 — corrected |
|---|---:|---:|---:|---:|
| Consideration (basis excl. cash × premium) | 5,850,000 | 5,850,000 | 10,400,000 | 10,400,000 |
| Obligations netted | −700,000 | 0 | −1,200,000 | 0 |
| Target cash | +300,000 | +300,000 | +500,000 | +500,000 |
| Retention (capacity 40 vs. roster 30 + 12; 45 vs. 40 + 20) | 2 "mandatory-terminated" at 50 %: 80,000 | continue 10, not retained 2 → target exits 2 × (2,000 × 26) = 104,000 | 15 terminated at 50 %: 937,500 | continue 5, not retained 15 → target exits 15 × (2,500 × 26) = 975,000 |
| Cash transferred at par | 300,000 | 196,000 | 500,000 | −475,000 (the target's cash cannot cover its exits; the shortfall transfers at par) |
| **Closing outlay** | **5,230,000** | **5,654,000** | **10,137,500** | **10,875,000** |
| R30 reserve test (26 × weekly obligations after close) | pass, margin 586,000 | 8,000,000 − 5,654,000 = 2,346,000 vs. 26 × 80,000 = 2,080,000 → **pass, margin 266,000** | fail by 1,351,500 at week 260 | 11,846,000 − 10,875,000 = 971,000 vs. 26 × 92,500 = 2,405,000 → **fail by 1,434,000**; passes at week 300 after +$1,800,000 (margin 366,000) |
| Active-rival count | 9 → 8 (floor not binding) | 9 → 8 — **recorded history, no floor** | 8 → 7 | 8 → 7 — history |

Deal 3 (clean estate lot, $900,000, no people) is unchanged. R30 still paces the plan (+40 weeks); the acquirer now pays $737,500 more for Deal 2 than the old netting allowed, which is exactly the fifteen capped exits it chose.

### 5.7 What this re-test does not do

It does not change the Owner's termination cap; it does not add a fee; it does not floor the operating-value estimate; it does not net any liability twice (guarantees: once, as charge or claim; loans: once, at face; cash: once, at par; refund-basis tangible: once, as cash-equivalent at closing). Every figure is a paper hypothesis reproduced by the script.

---

## 6. Authority labels, corrected

| Item | Label at `5239dc7a` | Corrected label and statement |
|---|---|---|
| Automatic liquidation of target facilities at closing (R21; finding 15; §7) | "ACCEPTED CODE FACT, CONFIRMED" | **RESEARCHER RECOMMENDATION.** Only the refund fractions (0.5 / 0.35) are `[CODE]`; "no second managed lot" is Owner direction (assignment §2.G); the automatic conversion into a one-time credit is this researcher's proposal, not an Owner approval |
| Mandatory excess-staff release / "settlement is mandatory, not optional" (R30; finding 19; §17 (5)) | RESEARCHER RECOMMENDATION presented as a "correction" | **RESEARCHER RECOMMENDATION, restated** as the retention window's default (§4.2): continue up to capacity, the remainder not retained; nothing about it is Owner-approved |
| Automatic cancellation of a capacity-refused inherited production (R20; finding 16; §8) | "ACCEPTED CODE FACT / RESEARCHER RECOMMENDATION" | **RESEARCHER RECOMMENDATION.** The reservation-failure hazard is `[CODE]` (dossier 04 F6.3); auto-cancel at the ordinary write-off is the proposal |
| Player immunity from acquisition (R16, R28; finding 17; §10; closing row J) | "OWNER-SELECTED PRODUCT DIRECTION" | **RESEARCHER RECOMMENDATION, restated:** no operating studio — player or rival — is acquired without its consent (a healthy purchase needs the target's Willingness; the player's answer to an inbound offer is the player's own); a **failed** player studio's estate is disposed under exactly the same P15/P16 law as a rival's (`[OWNER DIRECTION E]`, one law); the initial slice generates no inbound offers to the player (its studio reads `NotForSale` by construction), and a player-initiated sale ending is `[OPTIONAL PROPOSAL E]`, not asked |
| H5 terminal business state | UNRESOLVED DEPENDENCY, "blocking prerequisite" awaiting authorization | implementation prerequisite of `[OWNER DIRECTION D, E]` — `[SELECTED / NOT YET IMPLEMENTED]`; a planning dependency, not a decision |
| P15B pre-settlement estate window | UNRESOLVED DEPENDENCY, "unauthorized" | superseded by the P15 disposal handoff record and bounded estate (§3.3) — `[SELECTED / NOT YET IMPLEMENTED]` |
| Debt instrument (finding 6; §20-2; §17 (2); §18 P11 row) | "OWNER-BLOCKED", "whether ever authorized" | `[OWNER DIRECTION F]` loans only — `[SELECTED / NOT YET IMPLEMENTED]`; investors, external financing and bailouts remain outside the direction; not re-asked |
| ≥3-active-rival floor (R29; finding 18; §10; §13; §17 (7); §20-7; closing row S) | "APPROVED DOCUMENTATION (floor intent) + RESEARCHER RECOMMENDATION" | **WITHDRAWN** — superseded by `[OWNER DIRECTION G]` |
| P15B replacement entrants (§0; §20-7) | UNRESOLVED DEPENDENCY | **WITHDRAWN** — not wanted (`[OWNER DIRECTION G]`) |
| "All contracts transfer intact"; "obligations netted at full value make immediate firing safe" (R18, R19; §6 Q2–Q4; §17 (3); §14 ladder) | RESEARCHER RECOMMENDATION (HIGH) | **CORRECTED** (§4, §5): retention window; no guarantee netting; exits at the cap, once |
| Package ownership ratification P16→P17→P18 (§20-8); where contract assumption is chartered (§20-4) | UNRESOLVED DEPENDENCY (Owner decision) | **planning / documentation tasks** — the allocation is already accepted documentation (contract §15); retention uses P14A's own proposal law plus a P16 priority window, so P14D is not involved |
| Due-diligence disclosure of target finance facts (§20-5) | UNRESOLVED DEPENDENCY (Owner decision) | RESEARCHER RECOMMENDATION consistent with P15 RECONCILIATION-02 §3.5 (transaction-disclosed tier, recorded as a receipt); the public tier is P15's D3 |
| Inherited inventor entitlement (§20-3) | UNRESOLVED DEPENDENCY (Owner decision) | P13-owned later case; P16 default: the price-advantage entitlement is personal to the inventing `StudioId` and does not transfer (knowledge does, with provenance cited) — raised only if P13 promotes it |
| Orphan-IP backlog (§20-6) | UNRESOLVED DEPENDENCY (Owner decision) | class C default: rights of a studio whose estate has archived stay unowned history (R05's "estate-held" state resolves to "archived, not for sale"); a later claim mechanism is `[OPTIONAL PROPOSAL E]` |
| Talent cherry-picking (§17 last paragraph; annex §20 item 2) | "live remaining Owner decision" | **resolved by `[P16 DECISION]`** — the retention window is a choice of specific people; bound = capacity cap (recommendation) |
| Voluntary player-sale ending (R16; finding 17; closing row J) | "separate, not-yet-authorized Owner decision" | `[OPTIONAL PROPOSAL E]` — not asked |
| Numeric constants (premium bands, 52-week holdback, 26-week reserve, reserve steps) | already demoted to Current Ops | unchanged: NUMERICAL/CONTENT HYPOTHESES for playtest, never Owner decisions |

Preserved without relabelling: historical identities (R14/R15); actual provenance on every adoption row (R22); knowledge without teleported buildings (R22; §6 Q7–Q8); the ordinary P10/P12/P14 ownership boundaries (§18) — `PersonId` and contract truth in P10/P14, `contractId` minted by P12, the corporate-status event in P12, the ownership ledger in P16A.

---

## 7. Corrected rules (replacement text; rule IDs stable — the annex body is an archived record and is not rewritten)

- **R16′.** No operating studio is acquired without its consent: a healthy purchase requires the target's Willingness State to admit it, and for the player that state is the player's own answer (`NotForSale` by construction in the initial slice, which generates no inbound offers). A failed studio's estate — player's or rival's — is disposed under the same P15/P16 law. *(RECOMMENDATION; replaces "the player is never an eligible target" as an Owner direction.)*
- **R17′.** Acquired cash transfers at par as one reconciled line with the consideration, **after** the target's own closing exits (§5.2); negative cash transfers on the healthy path only (it is the acquirer's chosen exits); on the estate path no cash transfers — the price goes to the estate and P15 settles claims. No $0 floor is needed and no "excess negative-cash burden" exists. *(RECOMMENDATION)*
- **R18′.** Obligations are priced at their lawful exit cost, once: a loan at principal + accrued interest (repaid or assumed under the same law, when loans exist); an in-flight production at its residual overhead only (its budget was debited at greenlight — `hollywoodTick.ts:169`, `actions.ts:16-18` `[CODE]` — and is recoverable work, not a liability); **a contract guarantee is never netted from the price** — it is settled only as the P14 charge by whoever ends it, or as a P15 claim. *(RECOMMENDATION; replaces "subtracted at full value".)*
- **R19′.** At closing every target contract ends; in the same tick the acquirer exercises the priority retention window of §4.2 (continuation on identical terms with `signingBonus: 0` and the P12 sale/assignment reason; or a fresh P14A offer; or nothing); a person may lawfully decline a fresh offer under the P14A chooser and a continuation only for a P14B-defined reason (NOT RECORDED before P14B); unretained people enter free agency after the release step; residual work binds a continued production's seated participants through release. *(RECOMMENDATION; replaces "transfer intact … then release under ordinary law".)*
- **R26′.** The distressed paths are entered only through the P15 disposal handoff record and close within its bounded window (transaction → retention → release in the settlement tick); lots default to clean assets at their liquidation-basis reserve; a whole-estate lot absorbs at closing; a suspended estate production may be a lot; sealed one-shot comparison; ties by highest private valuation or a fixed random tiebreak; unsold lots exist only until the estate archives. *(RECOMMENDATION; the "unauthorized P15B window" contingency is replaced by `[SELECTED / NOT YET IMPLEMENTED]`.)*
- **R29.** **WITHDRAWN** (`[OWNER DIRECTION G]`).
- **R30′.** A bid or offer is legal only if, after closing (after the target's exits and any loan repaid or assumed), the buyer would retain ~26 weeks of cash against its own plus continued weekly commitments and, when loans exist, its post-close leverage satisfies the P15 loan caps; no bidding while in Warning or worse; a size-scaled cooldown follows a completed deal and a per-target cooldown a rejected one; continued headcount is capped at the buyer's usable capacity, with the retention default of §4.2. *(RECOMMENDATION; every number PROVISIONAL; "mandatory automatic settlement" removed.)*
- **R33 (new).** The priority retention window as specified in §4.2–§4.3. *(RECOMMENDATION implementing the `[P16 DECISION]` clause "a priority opportunity to retain talent, not ownership of people".)*

R01–R15, R20–R25, R27, R28 (with R16′ in place of R16), R31 and R32 stand as in the annex, read with the report's Appendix B labels; R10–R12 remain LATER OPTION / SUPERSEDED as already recorded.

---

## 8. Bounded edits made in this pass (supersession log)

**Archive:** the pre-reconciliation package is preserved verbatim at commit [`5239dc7a`](https://github.com/HSpector1/The-Movies/tree/5239dc7affa2537672ff4e4714a9891797621293/docs/research/p16-independent-verification-01); the evidence dossiers, key-findings digest, design-panel record and assignment brief are unchanged in this commit and are archived analysis wherever this document supersedes them.

**Report (`P16-INDEPENDENT-VERIFICATION-REPORT.md`) — each edit is marked inline `[R02]` and keeps the surrounding analysis:** header (later-addenda line; pointer to this document); §0 (the UNRESOLVED DEPENDENCY definition no longer lists replacement entrants, a debt instrument or an unauthorized P15B window); findings 6, 7, 8, 11, 13, 15, 16, 17, 18, 19, 20 restated; §5 (the H5 consumer list no longer names a floor; "people" → retention opportunity); §6 (OBLIGATIONS and EMPLOYEE CONTRACTS rows; answers Q2, Q3, Q4); §8 (P15B contingency reclassified); §10 (player-as-target relabelled; the floor paragraph replaced); §12 (accepted-offer sentence); §13 (hybrid bullet; rival-bidders sentence; the structural-finding, smallest-correction and worked-illustration paragraphs reclassified); §14 (ownership sentence; BNW row; price rows; the "caveats" paragraph); §16 (the Acquire/18xx receivership cell no longer cites a "settled no-player-financing ruling"); §17 (items 2, 3, 5, 7 and the closing paragraph); §18 (P11, P14, P15/P15B and P16C rows; the four-prerequisite paragraph; the full-absorption paragraph; the "P16D or later" paragraph's debt and orphan-IP clauses); §19 (three rows added; the "debt transfers" and "§2.M auction" rows updated); §20 (replaced by a pointer to the register with the archived list noted); §21 (two Current-Ops items closed); closing-table rows F, G, H, J, L, M, N, S, T; Appendix B intro and rows R13, R16, R17, R18, R19, R26, R28, R29, R30 and a new R33 row.

**Ruleset annex (`P16-RULESET-ANNEX.md`):** a second header block records the rules superseded here (R16, R17, R18, R19, R26, R29, R30; new R33) and points to §7; the body stays verbatim as the design-panel record.

**Scenario files:** each carries a supersession banner naming the figures this document replaces (Scenario A's whole-company path and Rule Gap A-7; Scenario B's "$2.5M of guarantees netted"; Scenario E's obligation netting, 50 % terminations and R29 rows; Scenario F's floor references); their arithmetic is kept as the archived run under the earlier rules.

**Review index:** status, revision row, package map and reading order updated; this document and the register are the first two items to read.

**Not edited:** `evidence/*`, `design-panel/*`, `ASSIGNMENT-BRIEF.md`.

---

## 9. Bounded check

One read-only Sonnet check ran over this document, the register and the edited report before commit: (1) every figure in §5.3–§5.6 re-derived from the stated inputs and compared with `calculations/reconciliation-02-ledger.OUTPUT.txt`; (2) each of the five required corrections located in this document and in the report's edited passages; (3) a label sweep of the report for leftovers ("≥3", "below three", "replacement entrant", "OWNER-BLOCKED" as current status, "never a target" or "categorically excluded" as Owner direction, "mandatory" settlement, "unauthorized P15B"); (4) every package-relative link and anchor in the three documents. Its findings and their disposition are recorded in [`design-panel/RECONCILIATION-02-CHECK.md`](design-panel/RECONCILIATION-02-CHECK.md).

---

## 10. Still unverified

1. All constants are `[PROVISIONAL]`; the ledgers are reproduced, not evidence-derived.
2. The P14A person-choice rule's exact treatment of a single retention proposal with no competing case, and P14B's refusal reasons, are `[P14 PLAN]` — the "deterministic acceptance before P14B" reading follows P14 Rev 3 §2.1.7 and is not verified against a running build (none was permitted).
3. Whether a healthy target's closing exits should be debited from its cash (as here) or presented as the acquirer's own charge is a presentation choice with identical outlay; the ledger uses the former so the seller's last act is visible in its own history.
4. The estate surplus's disposition and the overdraft's treatment at settlement are P15's; the Ridgeline ledger carries both for arithmetic only.
5. The report's Appendix A/B citation limits (77 of 135 sampled claims verified, none wrong) are unchanged by this pass.
