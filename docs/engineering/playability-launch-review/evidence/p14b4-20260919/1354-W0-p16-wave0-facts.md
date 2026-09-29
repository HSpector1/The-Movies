<!-- 1354-W0: P16 Wave 0 research reconnaissance by a read-only general-purpose specialist (research at 084713980ef8, repo at 895df584/19e6f56a, docs-only moves); saved verbatim by the parent -->

# 1354 recon: P16 Wave 0 facts and the P15B interface (read-only)

Repository `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`.
Briefed HEAD `895df584`; HEAD at write time `19e6f56a` (two docs-only commits: 1352-C/1352-F2 P15B Wave 1 RED and
rulings, 1353-B/F P15C). `src/` is identical at both, so every `src` citation holds at either. 1352-C and 1352-F2 do
not change the loan law. Nothing under `tests/fixtures/`, `ui/e2e/`, `ui/public/` was read; no test ran; no repository
file changed.

**Citation keys.** Research at `084713980ef884ac4b7be44f22e97fcaaec13683` under
`docs/research/p16-independent-verification-01/` (line numbers of `git show 08471398:<path>`):
IDX = `P16-INDEPENDENT-VERIFICATION-REVIEW-INDEX.md`, R02 = `P16-RECONCILIATION-02.md`, REG =
`P16-CORRECTED-DECISION-REGISTER.md`, REP = `P16-INDEPENDENT-VERIFICATION-REPORT.md`, ANX = `P16-RULESET-ANNEX.md`,
BRIEF = `ASSIGNMENT-BRIEF.md`, MRG = `design-panel/MERGED-RULESET.md`.
P15R02′ / P15REP′ = the corrected P15 research at `c5b52b4d` (`docs/research/p15-independent-verification-01/
RECONCILIATION-02.md` / `P15-INDEPENDENT-VERIFICATION-REPORT.md`). The P16 research read the older P15 package at
`81a4aedf`; the 2c186aec correction between them changed the estate law P16 cites (Q2 row 8).
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919/`. 1342-O cited from its approved `.txt`.
CONTRACT = `docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md`.

**Authority order used.** 1342-O rulings 3, 4, 10, 11, 12 and 1340-O (Owner) > 1352-A as amended by 1352-F (adopted
P15B law) > SOURCE-INDEX / 06 handoff (current Ops pins) > CONTRACT §15 (documentation ownership) > P16 research
(never Owner authority: IDX:4, R02:3).

---

## 1. P16 scope as the research defines it; waves; status after Reconciliation 02

**Topics** (BRIEF:36-199, answered by REP §3-§19): Story Property; rights granularity; library value; individual
rights/asset sales; acquisition operating model; transfer bundle; physical property; active productions; corporate
history; rival M&A; selling player assets; healthy acquisition; distressed acquisition; book/valuation/price; premium;
anti-snowball; package boundary.

- **IP**: `StoryProperty {propertyId, conceptId, origin 'original'|'pool', creatorStudioId, createdWeek,
  titleAtCreation, works[]}` (REP:135-146); four rights R1 Property, R2 Film/Library, R3 Continuation (licence only),
  R4 Cross-Media (licence only, no grant before a P18 consumer), one `Licence {exclusive, term, consideration,
  reversion}`, no territory/media sub-splits (REP:151-161; ANX:305). Append-only single-holder `ownershipEvents`
  (R03, ANX:306). Creator never equals owner (REP:163).
- **Library value**: valuation-only read model, zero weekly cash, never a Standing/Power-Ranking input until P18 pays
  it (REP:178-186, R06). Reissue execution deferred to "P16D or P18" (REP:180).
- **Mergers**: no separate mechanic. "Merger/absorption" renders as `kind:'acquired'`, `brandRetained:false`
  (REP:280). Corporate event `{studioId, week, kind:'closed'|'acquired', successorStudioId?, brandRetained}`
  (R14, REP:272).
- **Acquisition**: full absorption only (REP:192; R11 superseded ANX:322 by REP:691).
- **Co-production, partial stakes, antitrust, debt/equity beyond loans**: excluded from P16A-C, parked "P16D or
  later" (REP:496; R31 ANX:351; REG B-7 :15).

**Waves** (REP:92, :479-492; ANX:239-243):

| Wave | Owns | Depends on (after R02) |
|---|---|---|
| P16A | StoryProperty/Film Library identity, R1-R4/Licence shape, chain of title, dated ownership history, library valuation read model | nothing in P15B; "can ship first" |
| P16B | sale/licence between two **active** studios; R04a-c locks, R08 52-week holdback, R09 sub-cost floor, R32 interval (REP:304-316) | P16A + P11/P12 typed-receipt plumbing |
| P16C | whole-studio purchase/auction, §6 transfer bundle, §9 corporate history, retention window | P16A + P16B + H5 terminal state + P15 handoff record and settlement order + P14A proposal law (+ P11 loan read models if shipped) (REP:488, :492) |

**Owner-selected per the research** (REG §1 :9-16, class B): B-1 full absorption with "priority opportunity to
retain talent, not ownership of people"; B-2 eventual ability to buy studios; B-3 no floor, no replacements; B-4
loans; B-5 rival and player failure under one law; B-6 charge `weekly × min(remaining, 26)`; B-7 brief §2 selections
(no multiple lots; healthy studio may refuse; major premium; library is valuation not cash; minimum anti-snowball;
co-productions excluded); B-8 P16→P17→P18 allocation.

**Withdrawn or corrected by R02** (R02:207-225, :231-242): R29 ≥3-rival floor WITHDRAWN; replacement entrants
WITHDRAWN; R16 "player never a target" relabelled a recommendation (R16′); R17/R18/R19 corrected (no guarantee
netting; contracts end at closing with a retention window); R26 → R26′ (enter only via P15 handoff record); R30 → R30′
("mandatory settlement" removed); R33 added (retention window); automatic facility liquidation, excess-staff release
and auto-cancel of inherited productions relabelled RESEARCHER RECOMMENDATION; "P14D placement" closed; H5 and the
P15B estate window reclassified SELECTED / NOT YET IMPLEMENTED; debt "OWNER-BLOCKED" replaced by direction F.

**Open**: class D none (REG:46). Class C recommendations C-1..C-17 (REG:26-42). Class E optional (REG:50): retained
label, player-initiated sale / inbound offers to the player, partial stakes, co-productions, dominance guard, claim
mechanism for archived rights, second-bidder primitive, remote lot, investors/financing beyond the P15 loan law.
Closing-table leftovers (REP:556-575): mint point Greenlight vs Release (row A), whether reissue ever creates cash
(C), second bidder (D), H5 enum vocabulary (I), premium magnitudes (O).

**Current authority on scope.** CONTRACT:364-370 gives P16 StoryProperty/Film Library identity, origin-work,
chain of title, rights ownership/licensing, restoration/reissue authority, dated ownership history, "ownership
transactions and acquisitions where later authorized"; mergers, valuation, stakes, labels, co-productions, contract
assumption and multi-party shares need "a separate Owner charter". 1342-O.txt:54-55: "P15 owns distress, closure and
the disposal handoff; P16 owns acquisition transactions." SOURCE-INDEX:31-34 and 06 handoff:2772: full absorption,
no second studio/label; reconcile current producer contracts before any P16 implementation; the cited 14-week estate
maximum is withdrawn. 1342-O.txt:118: P18's first season needs "Real P16 television grants". 1342-O.txt:141-146:
continue P14 → P15 → P16 → P17 → P18. P12A register:233 (SAF-009) keeps P16 out of P12A.

---

## 2. Loans, debt, failure, closure, disposal, dormancy, estates, handoff: research vs adopted P15B law

Adopted P15B law: 1352-A as amended by 1352-F (1352-F:3-5: amendments govern). Research statements are labelled
RECOMMENDATION unless noted.

| # | P16 research says | Adopted P15B law | Verdict |
|---|---|---|---|
| 1 | Two loan products from the P15 research: a Studio Loan a healthy studio may draw, 260/520-week amortizing, penalty-free early payoff, leverage/coverage caps; plus a Rescue loan "offered only in Distress+", ≤13 weeks of fixed cost (R02:54, :61; P15REP′:257-262; P15R02′:198-200) | one product `studio-loan/v1`: eligible only in `warning` or `distress`, no outstanding loan, not closed/founding, `max ≥ LOAN_AMOUNT_STEP`; stable studios cannot borrow ("growth financing stays with P16+", P15:847); principal ≤ 26 × weekly fixed cost; flat 12 %; 52 weekly installments; no early repayment, refinancing or second loan (1352-A:127-146, :158-161; 1352-F:74-76) | **CONFLICT** (product shape) |
| 2 | Loan "cure cost = principal + accrued unpaid interest"; P16 reads "principal, accrued unpaid interest, arrears, acceleration" from P11 read models (R02:54, :61); BNW subtracts "loan principal − accrued unpaid interest" (R02:117) | interest is fixed at contracting; installments are unavoidable fixed-cost debits, so no arrears, no accrual, no acceleration, no event of default (1352-A:134-138) | **GAP**: restate the debt line as the sum of remaining scheduled installments (or define principal-remaining); no arrears/acceleration facts will exist |
| 3 | Healthy purchase: the loan is "repaid from the price at closing or assumed by the acquirer under the identical law" (R02:61 (i); R18′ R02:235; C-4 REG:29) | "No early repayment, refinancing or second loan in v1" (1352-A:139) | **CONFLICT**: repayment at closing is an early repayment; assumption gives an acquirer that already carries a loan two loans |
| 4 | Post-close buyer leverage "must satisfy the same P15 caps (P15 §9.3)" (R02:61, R30′ R02:239; C-5 REG:30) | no leverage, coverage or covenant caps; only the contracting-time principal cap (1352-A:131-133) | **GAP**: the R30′ loan clause has no referent |
| 5 | "A Rescue loan can never finance an acquisition" because it exists only in Distress+ where R30′ bars bidding (R02:61 (iii)) | loan also available in `warning`; a 52-week loan outlives the stage (warning clears after 4 clear weeks; a max loan lifts cover to ~26/1.56 ≈ 16 weeks, above the 4-week warn threshold) (1352-A:84-86, :129, :152-159) | **CONFLICT**: a studio can borrow in warning, return to stable and bid with borrowed cash. R30′ needs a loan-aware reserve (cash net of outstanding installments) or a "no bid while a loan is outstanding" rule |
| 6 | Distressed path: the loan is "a claim on the estate settled by P15 before any clean purchase"; "extinguished by P15 settlement" (R02:61 (ii); REG C-4 :29) | "Closure with a balance: the unpaid remainder goes into the closure record. Nobody else pays it, and no lender entity exists." (1352-A:141-142) | **GAP**: whether estate cash or the sale price pays the loan (a money sink with no payee) before or after guarantee claims is undecided |
| 7 | Closure path taken from the P15 research ladder: Insolvency window (13 weeks), Event of Default, acceleration, Rescue offer, then Bankruptcy; transactions may close "during the Insolvency window" (R02:25, :63-65; P15R02′:221-229, :305) | closure = `distress` with `distressWeeks ≥ 26` and negative cash; earliest the 33rd consecutive negative week; `closed` absorbing (1352-A:88-91, :100-101; 1352-F:18-23; 1352-F2:18-22) | **CONFLICT** (trigger) and **GAP**: no insolvency window exists, so the pre-terminal period P16 and P15R02′ §5.6 rely on is undefined |
| 8 | Estate "bounded by construction (≤ 14 weeks after the terminal event)"; unsold lots exist only until archive (R02:67; R26′ R02:237; C-6 REG:31) | 1352-A defines no estate. P15R02′:7, :51, :297 withdrew "14 weeks" and propose a 26-week policy cap; SOURCE-INDEX:33 and 06:2772 flag the withdrawal | **CONFLICT** (stale premise); Wave 4 must define estate existence, cap and archive |
| 9 | Settlement order transaction → retention → release in the settlement tick; handoff record states release week and window (R02:65, :90; P15R02′:305-307) | Wave 4 = "typed dispositions for every open subject, the P16 disposal register, the player's end-of-run record and run-end mode", own charter (1352-A:54) | **GAP**: order not yet chartered |
| 10 | Release timing is internally inconsistent: retention happens "in the settlement tick" (R02:90, :237) but the Ridgeline ledger releases "at the end of the handoff window" (R02:178). P15R02′:301 frees people at the settlement week; P15REP′:331 requires bids collected over "a minimum-length bidding window, never same-tick" | no window, no public closure week for rivals ("Rivals disclose only the stage", 1352-A:111; 1352-F2:47) | **CONFLICT**: retention on the estate path needs bids placed before the settlement tick, which nobody can time, or people held after contracts end, which P15R02′:301 forbids |
| 11 | Guarantees at settlement: remaining guarantee becomes a per-person recorded claim, paid pro rata from estate cash **after the purchase price is received**; continuation extinguishes it; unpaid stays recorded forever (R02:101; P15R02′:267) | not chartered | **GAP**: Wave 4 must record claims per `PersonId` in a form a later retention can extinguish |
| 12 | Overdraft at failure "carried for arithmetic only (its treatment is P15's)" (R02:178, :273) | closure fires only with negative cash (1352-A:88), so every closed studio starts its estate below zero | **GAP (load-bearing)**: whether sale proceeds first fill the overdraft decides whether wages and claims ever get paid |
| 13 | Estate surplus "recorded, not distributed" (R02:180); report default "destroyed, not distributed" (REP:541) | not chartered | **GAP** |
| 14 | Facilities: settlement refunds unsold facilities into estate cash (R02:67), yet the whole-estate buyer receives the refund-basis credit at closing (R02:181; R21 ANX:335) | not chartered; rivals have no facility removal verb and no per-unit basis (1352-W0:71; `src/core/hollywood.ts:147-150`) | **GAP** (research self-inconsistent; rival capacity has no recorded refund basis) |
| 15 | Dormancy: none used; kinds are `closed`/`acquired` (R14) | dormancy "superseded, not deferred" (1352-F:86-87) | consistent. CONTRACT:341 still lists `active/dormant/closed`: documentation drift |
| 16 | H5 terminal state honored by tick loop, validator, AI bid eligibility and "studios remaining" reads, one atomic commit (R13 REP:693; REP:80, :196) | Wave 2 decides the operating-state root on the registry (1352-A:209-210); `closed` recorded as "closure due" but settles nothing until Wave 4 (1352-A:52) | **GAP**: Wave 2 vocabulary must hold `acquired` distinct from `closed` (HIS-013, REP:282) or P16C pays a second save step |
| 17 | A failed player studio's estate is disposed under the same P15/P16 law (R16′ R02:233; C-7 REG:38) | proposed Wave 4: player closure ends the run, world "browsable read-only", earlier saves untouched (1352-A:214-218) | **CONFLICT**: a read-only world runs no disposal window |
| 18 | Healthy path needs a "solvent, willing" target (R02:98-100); no bidding by a buyer "in Warning or worse" (R30′ R02:239) | "Bailouts, investors, forced sales and acquisition stay excluded" as P15B remedies (1352-A:29-30); stages are `stable, warning, distress, recovery, closed` | **GAP**: "solvent" and "Warning or worse" need a stage map (is `recovery` worse than Warning? may a `distress` target sell on the healthy path?) |
| 19 | Healthy target pays `weekly × min(remaining, 26)` for each contract not continued "as its own last act", even into negative cash (R02:100, :131, :192) | Wave 3 unifies the termination predicate for both studios (1352-A:53); today a rival release needs no seat, remaining > 26, no open promise and reserve after the charge (`src/core/hollywoodTick.ts:179-190`) | **GAP**: the closing exit needs a carve-out from the unified predicate |
| 20 | Silent on open P14 promises, open market cases/proposals issued by the target, research seats, and shelved screenplays (D-1329-1); in-flight research cancels by default (R22; REP:241, :547) | Wave 4 must give "typed dispositions for every open subject" (1352-A:54); W0 lists promises, cases, productions, runs, research (1352-W0:179) | **GAP**: one disposition table should serve closure (P15B) and absorption (P16C) |
| 21 | Uses "Rescue loan" and "Distress+" labels; P16 transaction notices reuse P15 pinned notices (R02:39) | one loan; notices at warning, distress (with countdown) and closure for the player (1352-A:215) | naming drift only |

---

## 3. Acquisition economics and the contract rules at closing (R02 §4-§5)

**Four numbers** (R02:113-122; C-3): Book Net Worth = cash + facility recorded capex × 0.50 + set recorded capex ×
0.35 − loan principal − accrued unpaid interest, guarantees shown beside it and never subtracted (P11 read model);
liquidation value = the same sum on the refund basis; operating value = `[3, 6] × three-year trailing operating
surplus (floored at 0) + cash − debt`, unfloored, display only; transaction price = what was paid. Seller's Ask =
`independence premium × (max(refund-basis tangible, operating value excluding cash) + library appraisal)`. Cash sits
in no lane and is added once at par. Guarantees sit in no lane.

**Healthy-purchase ledger law** (R02:126-139; replaces R17/R18/R19):

```text
consideration     = premium × basis excluding cash                       (paid to seller)
target exits      = Σ contracts NOT continued: weekly × min(remaining, 26), debited from target cash before transfer
cash transferred  = target cash − target exits                          (at par; may be negative)
loan              = principal + accrued interest, repaid from consideration or assumed (only when loans exist)
closing outlay    = consideration − cash transferred (+ loan repaid at closing)
later             = payroll on continued contracts; the P14 charge on any later release
```

"Guarantees are never netted from the consideration" (R02:139). The $4M case: a 104-week, $2M/yr star has guarantee
$4,000,048 and capped charge $1,000,012; the old netting handed the acquirer +$3,000,036; corrected: price reduced by
$0, the exit costs $1,000,012 once (R02:143-150). Paper ledger K0-K4 (R02:158-170): declining a person costs exactly
that person's capped charge; continuing costs nothing up front; timing tricks cost more.

**Estate-path ledger** (Ridgeline, R02:176-182; R17′ R02:234): price goes to the estate; no cash transfers; lot
reserve = liquidation basis (whole-estate lot $1,740,000 in the example); sealed one-shot comparison; claims paid
after the price arrives; each continuation extinguishes that person's claim; surplus recorded, not distributed.

**Contract rules at closing** (R02:74-107; R19′ R02:236; R33 R02:240):

- **All contracts end in the closing tick**: reason `employerAbsorbed` (healthy) or P15's `employerClosed`
  (settlement). `contractId` embeds the employer, so nothing is re-owned in place.
- **Priority retention window**: same tick, after the transaction clears, before release. The player gets one
  DECISION-tier item (P15 pause-and-deadline rule); an AI acquirer runs one deterministic pass. The acquirer sees each
  contract's remaining weeks, weekly salary, remaining guarantee, capped exit charge and the person's market ask
  (transaction-disclosed tier opened by the costed R27 due-diligence event; public tier stays UNKNOWN) (R02:88-91).
- **Default when the player does nothing**: continue every contract that fits usable capacity, in the target's own
  contract order; the rest are not retained (R02:92; a recommendation).
- **AI policy**: continue when salary ≤ market ask × (1 + small tolerance) and a role slot is open; fresh offers only
  for roles missing from `RIVAL_TEAM_ROLES` (R02:94).
- **Continuation** (healthy only): identical remaining terms, same weekly salary and `endWeekExclusive`,
  `signingBonus: 0`, new row under the acquirer with the P12 "sale/assignment" reason; no charge (R02:79).
- **Fresh offer** (both paths): ordinary P14A proposal at ≥ market ask through the studio-aware entry, with the P14
  salary floor if this acquirer released the person before (R02:80).
- **Lawful refusal**: a fresh offer goes through the P14A chooser; a continuation may be refused only for a
  P14B-defined reason (termination memory toward this acquirer, Nemesis/Enemy seating), which the research treats as
  NOT RECORDED, so acceptance is deterministic (R02:79, :271).
- **Unretained people**: the contract has ended; the person enters `freeAgents` at the end of the closing tick; no
  later reclaim by any buyer (R02:81).
- **Residual work**: an inherited production re-forms under the acquirer (R20) with participants frozen at
  greenlight. If continued, every busy-set participant must be continued or fresh-offered and accept, through
  release; otherwise cancel at the ordinary write-off. A film is never kept while its seated cast is released
  (R02:82).
- **Suspended estate production**: transferable to an acquirer that completes it, same rule; residual overhead
  becomes the acquirer's (R02:83). P15R02′:292, :309 add: resumable only if the acquirer holds every locked
  participant's employment and the capacity.
- **Guarantees**: appear exactly once, as an exit charge or a claim (R02:84, :98-103). Healthy: target pays the charge
  for contracts not continued; continued contracts cost payroll; a later release by the acquirer pays the charge and
  triggers the salary floor. Failed: settlement already ended the contract; wages to the week first; remaining
  guarantee is a pro-rata claim paid after the price; continuation on identical terms makes the person whole and
  extinguishes the claim; a fresh offer leaves it.
- **Free agency**: published after retention (R02:85).
- **No second studio or label**: target business reaches H5; Standing ends; films keep the creator (R02:86).
- **Affordability** (R30′ R02:239): ~26 weeks of post-close reserve after exits and loans; P15 loan caps; no bidding
  in Warning or worse; size-scaled and per-target cooldowns; continued headcount ≤ usable capacity.

**What P15B Wave 4 must hand P16 for this to work**: per-person claim rows keyed by `PersonId` and contract, each
extinguishable; a contract end reason `employerClosed`; the release step as a separate phase after a same-tick
transaction; the estate's cash, overdraft, facilities (with a refund basis for rival capacity), conserved and
suspended pictures, and loan remainder; the release week and window; the order wages → conserved-work cost → claims
(→ loan?) against price received.

---

## 4. Data P16 needs from earlier packages, and whether it exists at HEAD

| Need | Producer | At HEAD (`src/core`) | Planned by |
|---|---|---|---|
| StoryProperty, Film Library, `ownershipEvents`, Licence, Willingness, corporate event | P16 | **NOT FOUND** (grep for `StoryProperty`, `propertyId`, `ownershipEvents`, `FilmLibrary`, `NotForSale`, `CorporateEvent`, `successorStudioId` returns nothing) | P16A/P16C (no charter yet) |
| Studio registry, immutable ids | P12 | `StudioIdentity` `hollywoodTypes.ts:6-17` (no operating-state or exit field); `HollywoodState.identities` `:137` | operating state: 1352-A Wave 2 (:52, :209-210) |
| Creator of record | P12 | `FilmIdentity.studioId`/`conceptId` `hollywoodTypes.ts:20-27`; credit-employer check `hollywoodValidation.ts:414` | exists |
| `conceptId` anchor | P07/P12 | `productionIdentity.ts:126-129`; screenplay `origin: 'original' | 'pool'` `screenplay.ts:313` | exists |
| Films | P07/P12 | rival `hollywood.films` `hollywoodTypes.ts:142` (`IndustryFilm` :46); player `releasedFilms` `types.ts:307` | exists |
| Business bijection and weekly loop (H5 seam) | P12 | `businesses.size === entered rivals` `hollywoodValidation.ts:427`; `for(const b of h.businesses)` `hollywoodTick.ts:312` (research cited :331/:221 at 13370d42) | 1352-A Wave 2/4 |
| Employer-bound `contractId`; end reasons | P12/P14 | id form `hollywoodValidation.ts:184`; `IndustryEmployment.reason` `hollywoodTypes.ts:79` and receipt reasons `:111` lack `employerClosed`, `employerAbsorbed`, sale/assignment (the last exists only as prose, `docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md:665`) | `employerClosed`: Wave 4; P16 values: P16C |
| Exit/ownership receipts | P12 | `IndustryReceipt` kinds `hollywoodTypes.ts:108-124`: no exit, closure or ownership kind | Wave 2 events; P16C |
| Money kinds | P11/P12 | `RivalMoneyKind` closed union `hollywoodTypes.ts:58-60`; `LedgerKind` `types.ts:407+`; rival validator forces non-revenue movements ≤ 0 (1352-W0:160) | loan kinds: Wave 2; consideration/cash-transfer kinds: P16B/C |
| Refund fractions | P09 | `FACILITY_DEMOLITION_REFUND_FRACTION = 0.5` `tuning.ts:1942`; `SET_DEMOLITION_REFUND_FRACTION: 0.35` `tuning.ts:933`; rival capacity rows `hollywood.ts:147-150` (no refund basis) | rival basis: undecided |
| Book Net Worth / Guaranteed Obligations / operating value | P11 | **NOT FOUND**; only `financialStrengthBand(cash, weeklyFixedCost)` `powerRanking.ts:90` | **unowned**: 1350-A:26 assigns book net worth to "P15B and P11"; 1352-A does not build it |
| P14 charge | P14 | `terminationCost = weekly × min(remaining, HIRING_TERMINATION_CAP_WEEKS)` `employment.ts:207-210`; cap 26 `tuning.ts:409` | exists (the research called it unimplemented) |
| Salary floor after release | P14 | `releaseFloor` `talentMarket.ts:209`; `studioOffer` `:242`; `floorOffer` `:255` | exists |
| Proposal and chooser | P14A | `submitProposal` `talentMarket.ts:430`; `chooseProposal` `:938`; one-issuer extension accepted without contest `:1276-1286` (a model for continuation) | same-tick retention case: P16C |
| Refusal reasons for continuation | P14B | tiers with evidence condition `relationships.ts:47`, `:149-154`; termination memory = `releaseFloor` | P16C must name which apply |
| Free agents | P10 | `freeAgents: string[]` `types.ts:538` | exists |
| Rival termination gate | P12/P14 | `hollywoodTick.ts:179-190` | Wave 3 unification (1352-A:53) |
| Condition stage, loan, closure record, disposal register, claims | P15B | **NOT FOUND**: `corporateCondition.ts` and `studioLoan.ts` absent; Wave 1 RED staged only (1352-C:29-30, :46-50) | Wave 1 (pure law), Wave 2 (root, loans), Wave 4 (closure, register) |
| Technology knowledge and provenance | P13 | adoptions `technologyTypes.ts:93`; invention-provenance check `technology.ts:660` | exists |
| RNG purpose for bids | core | `RngPurpose` union `rng.ts:34`; stateless `stream()` `rng.ts:204` | P16C adds a literal |
| Save | core | `LIVE_SAVE_VERSION = 42` `save.ts:6553`; Save43 claimed by shelving (1352-W0:165) | each P16 root needs its own step |

Downstream consumers already waiting: P17 looks rights up through P16 (`P17-RECOVERED-SPECIFICATION-STATE.md:65-71`);
P18 needs P16 grants with "parties, media/scope, territory, term, exclusivity and consideration"
(`plans/P18-HEADLESS-CHARTER.md:41-42`; CONTRACT:402-403), while R02 of the research bans territory sub-splits and R4
grants until a P18 consumer exists (ANX:305). Ruling 10 has now authorized that consumer.

---

## 5. Open Owner decisions in the research, checked against 1340-O and 1342-O

The register lists **no class-D item** (REG:46) and names two class-C defaults the Owner may want to promote: C-1
retention default and C-9 archived-estate rights (REG:46). Earlier lists carry more: MRG:364-373 items 1-10, ANX:257-261
items 11-13, and the closing table (REP:556-575).

Answered by current authority (not candidates):
- floor and replacement entrants: ruling 4 (1342-O.txt:57-61);
- genuine player and rival failure; loans exist; P15/P16 split: ruling 3 (1342-O.txt:42-55);
- pre-offer publication of P15 condition (ANX:261 item 13; R24 ANX:341): 1122-A D3 "public distress stage plus a
  financial-strength band" (E/1122-A:11), reaffirmed by ruling 2 (1342-O.txt:37-39). Willingness may read the public
  stage;
- full absorption, no second studio/label: SOURCE-INDEX:34, 06:2772;
- P16 → P17 → P18 allocation (MRG:371): CONTRACT:350-353;
- continuation past 2026-10-06 and branch publication only: rulings 11 and 12 (1342-O.txt:141-157).

Not answered: listed under "Candidate Owner questions" at the end.

---

## 6. A sufficiently specified first slice

The research's own recommendation: **P16A first**, "No P15B dependency; can ship first" (REP:92, :486, :492;
ANX:241). It gives no RED list, save design or formula for P16A.

What a P16A charter could adopt from the research as written:
- `StoryProperty` record (REP:135-146) minted by exact ID at Greenlight, atomically with its first `ownershipEvents`
  row, holder = greenlighting studio (R01/R05 ANX:304, :310); a continuation greenlight under R3 mints nothing and
  appends to `works[]` (REP:149).
- Four rights plus one Licence; single current holder; duplicate exclusive grant refused (R02/R03 ANX:305-306).
- Pre-P16 films: lazy founding row assigning the historical creator; never bulk-minted; migration invents nothing
  (REP:165; R32 ANX:352). Until P15B Wave 4 exists no studio is closed, so the orphan branch is dormant.
- Symmetric for rivals: rival films carry `conceptId` and `studioId` (`hollywoodTypes.ts:20-27`).

What P16A still lacks before it is sufficiently specified:
1. The mint point: Greenlight vs Release is "unsettled" (REP:556 row A); REG C-15 defaults to Greenlight.
2. The library valuation formula: REP:182 names only its inputs ("count/quality of owned FilmIds and
   StoryProperties, awards where modelled"). Awards do not exist (1122-A D4a).
3. The Licence field set against P18: territory as a single fixed value or absent (ANX:305 vs CONTRACT:402-403,
   P18 charter:42), and whether R4 grants open now that ruling 10 authorizes P18.
4. A save root and version, and whether rival properties persist in the same root.
5. A consumer: nothing in `src` reads rights yet; P17/P18 contracts would be the first readers.

P16B needs P16A plus typed sale receipts (new money kinds on both finance models). P16C needs P15B Waves 2 and 4 and
must not start before the conflicts below are closed.

---

## Conflicts with P15B (must resolve before P15B Wave 2/4)

**Before Wave 2** (operating state, loan contracts, money kinds; 1352-A:52):

1. **Operating-state vocabulary.** Reserve `acquired` beside `closed` (R14; HIS-013 via REP:282) and define one
   "operating" predicate that the condition step, the tick loop (`hollywoodTick.ts:312`), the bijection
   (`hollywoodValidation.ts:427`), chart rows and technology validators all read. Otherwise P16C reopens the root.
2. **Loan record shape vs P16 transfer.** `studio-loan/v1` forbids early repayment and a second loan (1352-A:139); P16
   wants repay-at-closing or assumption (R02:61). Decide now, while the loan record is first persisted: (a) a
   healthy target with an outstanding loan is ineligible; (b) a closing payoff of the remaining installment total,
   which costs the same as continuing (an amendment to `studio-loan/v1`); or (c) assumption allowed only when the
   acquirer has no loan. The record must carry schedule and installments paid so P16 can price the remainder.
3. **Borrowed cash funding bids.** A warning-stage loan survives the return to stable (row 5). Pick the P16 guard now
   (reserve measured net of remaining installments, or no bid while a loan is outstanding) so Wave 2's rival loan
   policy and P16's R30′ agree.
4. **Leverage caps.** R30′'s "P15 loan caps" has no P15B referent (row 4). Either drop the clause or name the
   contracting cap (26 × weekly fixed cost) as the only cap.
5. **Money-kind budget.** Loan inflow/installment kinds (1352-W0:160) and P16 consideration/cash-transfer kinds all
   widen `RivalMoneyKind` and `LedgerKind`; plan them so each save step is additive and ordered.
6. **Book Net Worth owner.** 1350-A:26 points to "P15B and P11"; 1352-A does not build it; P16's four numbers need it
   (R02:117). Assign an owner and define the debt line under flat interest (row 2).

**Before Wave 4** (closure, settlement, P16 disposal register; 1352-A:54):

7. **Where retention can happen for a failed studio.** Research requires transaction → retention → release in one
   tick (R02:90) but also releases "at the end of the handoff window" (R02:178); P15REP′:331 needs a pre-resolution
   bidding window; P15B has no insolvency window and rivals show no closure week (1352-A:111). Choose one:
   (a) a public "closure due" notice opens a bidding window before the settlement tick; (b) contracts stay open to a
   later release week, with wages defined; (c) no retention on the estate path (people released at settlement, P16
   buys assets only). Options (a) and (b) touch disclosure and wage law; (c) narrows B-1 for distressed purchases.
8. **Estate existence and cap.** Drop the 14-week premise (P15R02′:7, :297; SOURCE-INDEX:33). Decide whether an
   estate exists, its cap (P15 research proposes 26 weeks), what completes (post-take pictures only, P15R02′:284-295)
   and what suspends.
9. **Claims and priority.** Record per-person guarantee claims that a continuation can extinguish (R02:101); fix the
   order wages → conserved-work cost → guarantee claims → loan remainder, and whether it runs at settlement or after
   the P16 price arrives.
10. **Negative cash at closure.** Every P15B closure has negative cash (1352-A:88). Decide whether sale proceeds first
    cover the overdraft; this decides every recovery figure (R02:178, :273).
11. **Surplus.** Recorded-not-distributed (R02:180) vs destroyed (REP:541).
12. **Facilities.** Settlement refunds them into estate cash (R02:67), or the estate holds them as lots and the buyer
    receives the refund credit (R02:181, R21). Define a refund basis for rival abstract capacity (`hollywood.ts:147-150`;
    P15REP′:311 proposes pricing from the lump `capacity` movement).
13. **End reasons.** Add `employerClosed` to `IndustryEmployment.reason`/receipt reasons (`hollywoodTypes.ts:79`,
    `:111`); consider reserving `employerAbsorbed` and the continuation reason in the same save step.
14. **Player estate vs run end.** 1352-A:214-218 makes the world read-only at player closure; R16′/C-7 dispose of the
    player's estate under P16 law (R02:233). Either settle the player's estate completely in the closure tick (assets
    archived or refunded, no buyer), or run the disposal window before run end.
15. **Shared disposition table.** Promises, open market cases/proposals, research seats and in-flight research,
    shelved screenplays, productions and runs (1352-W0:179) need typed dispositions for closure; P16C absorption
    needs the same list. The research is silent on promises, cases and shelving.
16. **Stage map for P16 eligibility.** Define "solvent target" and "Warning or worse" over `stable, warning,
    distress, recovery, closed`, and whether a `warning`/`distress` studio may sell on the healthy path, given
    1352-A:29-30 excludes acquisition as a P15B remedy.
17. **Closing exits vs the unified termination predicate** (Wave 3, 1352-A:53): P16 needs a closing-exit rule that
    bypasses the seat, promise and reserve gates of `hollywoodTick.ts:179-190`, or states which still apply.

---

## Candidate Owner questions

None of these is answered by 1340-O or 1342-O. Each gives the research's recommended option.

1. **Retention default** (REG C-1, :26, :46): when the player takes no action in the retention window, who stays?
   Research: continue every contract that fits usable capacity, in the target's contract order; the rest go to free
   agency (R02:92).
2. **Rights of archived estates** (REG C-9, :34, :46; ANX:260 item 12): do a closed studio's properties
   stay unowned forever? Research: yes, "archived, not for sale"; a claim mechanism is optional class E (R02:222).
3. **Retention for failed studios vs disclosure** (conflict 7): may a rival's imminent closure become public so
   bidders can act before release, beyond 1122-A D3's "stage only"? Research: retention in the settlement tick after
   a pre-resolution sealed-bid window (R02:90; P15REP′:331). Without disclosure, the estate path reaches assets only.
4. **Player estate after failure** (conflict 14): after the player's studio closes, does the world run long enough
   for rivals to buy its estate? Research: same law as rivals (R16′, R02:233). Ruling 3 requires only notices and a
   recoverable end-of-run record (1342-O.txt:51-53).
5. **Acquisition or growth financing**: P15B lets only warning/distress studios borrow and parks growth financing in
   "P16+" (1352-A:129-130); the P16 register calls acquisition financing optional (REG:50). Research: none; purchases
   are cash-funded under the R30′ reserve.
6. **StoryProperty mint point** (REP:556 row A): Greenlight or Release. Research: Greenlight, atomically with the
   first ownership row (R01/R05; REG C-15).
7. **Transaction-disclosed due diligence** (REG C-10, :35): may a costed, dated event reveal a rival's exact book
   figures and every contract's terms to a bidder? Research: yes, as a receipt counted as an approach (R27); P15's
   Owner D3 covers only the public tier (P15R02′:395); CONTRACT:190 allows "a later lawful disclosure".
8. **Healthy sale of a struggling studio**: may a studio in warning, distress or recovery accept a healthy-path
   offer? 1352-A:29-30 excludes acquisition as a P15B remedy. Research: healthy path only for a "solvent, willing"
   target (R02:100), otherwise the handoff route (R26′).
9. **Second bidder for ordinary sales** (ANX:259 item 11; REP:312 calls it "a genuine remaining Owner decision"; REG
   moved it to class E :50). Research: no; the sub-cost floor holds outside the sealed estate comparison.
10. **Lower priority, research defaults exist**: in-flight research successor exception to P13-OD-06 (MRG:367;
    default: in-flight orders cancel, verified partial progress survives, REP:547); inventor price-advantage
    entitlement (MRG:368; REG C-11 default: not transferred); whether the Star & Script Selling Facility belongs in
    P16B (MRG:370; never dispositioned by R02 or REG); licence territory as a field (conflict with CONTRACT:402-403;
    research default: no sub-split).
