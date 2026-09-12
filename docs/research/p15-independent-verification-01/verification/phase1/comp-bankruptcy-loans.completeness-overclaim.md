# Verification memo — comp-bankruptcy-loans.md (lens: COMPLETENESS & OVERCLAIM)

**Verifier role:** adversarial, read-only. **Date:** 2026-09-11.
**Report under review:** `out/phase1/comp-bankruptcy-loans.md` (P15 comparator study: bankruptcy, distress, loans, debt).
**Method:** re-read the topic prompt and the report; spot-checked 22 claims against the underlying sources (accepted code snapshot `592e926`, manual/Prima PDFs and plain-text extractions, technical-artifact register, Steam news API, pinned OpenTTD/OpenRCT2 source, GearCity wiki raw exports, Paradox/fandom wikis, Capitalism Lab site, the FM24 feature page P15 cites, Blockbuster Inc. patch notes). Web *search* budget was exhausted before this pass; every external check below is a direct fetch of a named URL.

**Verdict: REFUTED IN PART.** The report is mostly well-evidenced and its code/original-game baseline is exact, but (1) its Football Manager finding and the §5 "correction" of P15 §7 built on it are wrong on the official source's own text; (2) one HIGH-rated OpenTTD claim is contradicted by the pinned commit the report says it read; and (3) it skipped Blockbuster Inc. (2024), a shipped The-Movies-like whose official patch notes contain the single most on-point precedent for P15B's rival dormancy state.

---

## 1. Spot-check ledger

| # | Report claim | Source re-checked | Result |
|---|---|---|---|
| 1 | Accepted code has no loan/financing mechanic (`studioRunRecap.ts:1003`) | `accepted-592e926/src/core/studioRunRecap.ts:1003` | **CONFIRMED** verbatim: "No recovery mechanic (loans/financing) exists in the current rules." |
| 2 | `canAfford` gates voluntary commitments only; unavoidable debits may push cash < 0 (`employment.ts:70-80`) | `src/core/employment.ts:70-80` | **CONFIRMED** (D-12.11 comment + reason string) |
| 3 | Runway advisory only; D-16 `insolvent` is harness classification | `economyView.ts:112-141`; `src/harness/d16/states.ts:1-15,51,98` | **CONFIRMED** ("ANALYSIS ONLY. Never imported by src/core/** or ui/src/**") |
| 4 | Manual: balance "can go into the red", debt blocks sets/certain facilities, printed p. 6–7 | `original-text/manual.txt:129-130`; PDF page 4 (Read) | **CONFIRMED**; the note is on printed p. 6 of the 6–7 spread |
| 5 | Prima "Building in Debt" exception list, **printed p. 13** | `original-text/prima.txt:769-777`; PDF page 15 (Read) | List **CONFIRMED**; **page number WRONG — printed p. 14** (footer "14" visible on PDF p. 15) |
| 6 | GameFAQs Maxx corroborates | `gamefaqs-maxx.txt:659-661` | **CONFIRMED** |
| 7 | No loan/bankrupt/game-over in the five extractions | grep of all five | **CONFIRMED** (zero hits for loan/bankrupt/"game over") |
| 8 | HA Hotfix 0.8.12EA: 100 days instead of 50; first credit $1m | Steam news API, appid 2680550, item dated 2025-04-17 | **CONFIRMED** verbatim |
| 9 | HA 0.8.51EA: Marginese "going bankrupt" borrows from player | Steam news API, 2025-09-30 | **CONFIRMED** verbatim |
| 10 | HA 0.8.71EA loan-repayment fix; 0.8.67EA rivals buy cinemas; Q&A "more brutal in Act 2" | Steam news API | **CONFIRMED** (Q&A question was literally about driving rivals into bankruptcy — answer is coy; "HIGH for intent" is fair) |
| 11 | OpenTTD trigger `money − loan < −maxLoan`, resetting counter, stages, single-player "no THE-END" (`economy.cpp:547-627`) | raw file at `96651d3` | **CONFIRMED** line-exact |
| 12 | OpenTTD interest on negative cash "to prevent cheating or abuse" (`801-829`); £10,000 steps; max 300,000; 2–4 % | `economy.cpp:801-829`; `economy_type.h:207`; `difficulty_settings.ini` | **CONFIRMED** |
| 13 | OpenTTD "Takeover adds the target's loan to yours (wiki Economy, **HIGH**)" | `economy.cpp:1982-2051` (DoAcquireCompany/CmdBuyCompany); grep `current_loan +=` across economy.cpp, company_cmd.cpp, misc_cmd.cpp | **REFUTED for the pinned commit** — see §2.B |
| 14 | GearCity Eric.B: 6 months negative; 1.23 SP4 non-resetting; changed 1.24 | Steam thread 1694922980033868934 p.2 (2018-05-30) | **CONFIRMED** verbatim |
| 15 | GearCity "Bankrupt Warning!" memo 1001 with Cut Funding / Cut Production/Funds | `wiki.gearcity.info` raw export `gamemanual:references_actionmemos` | **CONFIRMED**; also confirms "Buy Bankrupt Company" memo carries extra liabilities |
| 16 | GearCity "rate = global interest rate × credit rating" | `gamemanual:gui_financials` | **OVERSTATED** — wiki says the two variables "factor into your credit offers and interest rates"; no multiplicative formula is given |
| 17 | Prison Architect: negative balance AND negative cash-flow, 24 h, sacked | prisonarchitect.paradoxwikis.com | **CONFIRMED** |
| 18 | CS1 tiers 20K/60K/200K, 5/10/15 %, bailout at −10,000 → 50,000, once, achievements off | skylines.paradoxwikis.com/Economy | **CONFIRMED** |
| 19 | TPH tiers and −150K warn / −300K bankrupt | two-point-hospital.fandom.com (wikitext) | **CONFIRMED** (community) |
| 20 | OpenRCT2 loan raisable while in debt; defaults 10K/20K/10 % | `ParkSetLoanAction.cpp`, `Finance.cpp` at `9279d06` | **CONFIRMED** (code comment says exactly that) |
| 21 | Capitalism Lab: Declare Bankruptcy, liquidation, DLC "Continue After Bankruptcy" | capitalismlab.com/playing-without-company | **CONFIRMED**; page also says "or the company is forced under" (a forced path exists) |
| 22 | MGT2 Eggcode 2021-08-10 statements; player "conjure" exploit | Steam thread 3052863612120877620 | **CONFIRMED** |
| 23 | Software Inc. quick/bank loan figures; bankruptcy at < $0, warp to 20:00 | software-inc.fandom.com (wikitext) | **CONFIRMED** (community) |
| 24 | GDT bankruptcy wiki text; "more than 200K" | gamedevtycoon.fandom.com (wikitext) | **CONFIRMED** (community) |
| 25 | Planet Zoo official guide loan text; no bankruptcy described | one.planetzoogame.com (fetched with browser UA) | **CONFIRMED**; guide says only "you'll need to make some savings if you want to keep your zoo afloat" |
| 26 | Anno 1800 −5,000 / Blake 25,000 / second time = lose | anno1800.fandom.com Coins | **CONFIRMED** (community) |
| 27 | FM: "official feature page cited by P15 covers transfer/finance context only"; administration only community-documented; synthesis "Warning stages: none for manager" | footballmanager.com/features/smarter-transfers-squad-building-and-finance (fetched, HTTP 200) | **REFUTED** — see §2.A |

Not re-verifiable this pass: CS2 Paradox wiki (bot challenge), GameSpot retail walkthrough (HTTP 403), FM24 manual (403 per report). The report's MEDIUM ratings on CS2 are therefore neither confirmed nor refuted.

---

## 2. Refuted or overstated claims

### 2.A Football Manager — the P15-cited official page is a distress comparator, and the report says it is not (REFUTED)

Report text (§1.14, §3 row, §5 bullet 4, summary bullet 16): the FM feature page P15 cites "covers transfer/finance context only"; FM's real distress mechanic is administration, "community-documented"; synthesis row lists "Warning stages: none for manager"; §5 concludes "The atlas contains **no** management-sim distress comparator."

What the cited page actually says (fetched 2026-09-11, footballmanager.com, FM24 feature "Smarter transfers, squad building and finance"; paraphrased, ≤40-word quotes):
- Negative transfer budgets: "If you go into the red, you'll receive an inbox item" telling you to sell players or transfer clauses, with "Examples and candidates for both … included," and "a clear indication of how much money you need to recoup."
- Escalation with a deadline: "If you're unable to generate enough money within the agreed time period, your board will take control of your budget and begin to sell your players," control returning "when either the cash has been raised or the transfer window has closed."
- Administration: a news item "shows their net debt, profit and loss graphs, overall expenditure and overall income"; transfer funds withdrawn; administrators consider offers for players.
- Wage default: players' association steps in; transfer embargo "until that money has been repaid."
- Insolvency instrument: "a Company Voluntary Agreement … allows an insolvent company to pay off their creditors over a fixed period while they continue to operate."
- FFP: wage budget locked with an explanatory note in Finances.

So the page is an OFFICIAL DEV source documenting a staged ladder — warning with named remedies and a required amount → time-boxed → board takes control (a forced-sale remedy applied *to the player*) → administration/CVA — which is precisely the "warn and remedy without surprise failure" question P15 §7 attached it to. The report's §5 "QUALIFIED" of P15 §7 is therefore itself wrong, and the synthesis row's "none for manager" is wrong. The community-sourced details (9-point deduction, repeat administration, Portsmouth/Liverpool examples) remain community-tier, but the core mechanic is official. **Corrected statement:** "FM24's official feature page documents a staged distress ladder (inbox warning with candidate remedies and a recoup target → board seizes budget after an agreed period → administration with public net-debt/P&L → CVA for insolvent clubs); P15 §7's citation is apt. Points deductions and repeat-administration behaviour are community-reported only." The report's independent recommendation that GearCity's memo and OpenTTD's staged months are *additional* strong comparators still stands, but not as a replacement.

### 2.B OpenTTD "takeover adds the target's loan to yours" rated HIGH (REFUTED at the pinned commit)

At `96651d3`, `DoAcquireCompany` (`economy.cpp:1982-2007`) only transfers owned items and deletes the company; `CmdBuyCompany` (`2018-2051`) charges either `bankrupt_value` (computed with `CalculateCompanyValue(c,false)`, i.e. *excluding* the loan, line 589-591) or `CalculateHostileTakeoverValue` (`178-186`), which prices the target's loan and negative balance into what the buyer pays. No `current_loan +=` exists in `economy.cpp` or `company_cmd.cpp`; the only one is `misc_cmd.cpp:71` (the player's own increase-loan command). The wiki sentence the report relied on sits in a page that still describes share trading (removed in OpenTTD 14), so it is legacy text. **Corrected statement:** "In the pinned OpenTTD commit the acquirer does not inherit the target's loan; a hostile takeover price includes the loan and any negative balance, and a bankruptcy purchase price excludes the loan (`economy.cpp:151-159,178-186,589-591`). The wiki's 'their loan will be added to yours' describes an older build." Low P15 impact (takeover is P16+), but it is a HIGH-rated factual error sourced to the report's own pinned code.

### 2.C Prima page number (minor citation error)
"Building in Debt" is on **printed p. 14** (PDF p. 15, footer "14"), not p. 13. The text-extraction page ending at `prima.txt:789` carries footer "14". Content is otherwise exact.

### 2.D GearCity interest formula (overstated)
The wiki does not state `rate = global rate × credit rating`; it says both "factor into" offers and rates (`gui_financials` §Line of Credit/Bank Loan/Bonds). The synthesis table repeats the formula. Downgrade to "rate depends on global rate and credit rating (formula undisclosed)".

### 2.E OpenTTD stage months (internal inconsistency, not an error)
§1.7(b) says months 4/7/10 (the counter value at which each `case` fires); §2.1 and §3 say 3/6/9 (the code comments' "after N months"). Both are derivable from `economy.cpp:562-597`; the report should state the mapping once instead of using both.

### 2.F Scope wording on the original game (accurately hedged but thin)
"No inspected retail source mentions a loan…" is correctly limited to the five plain-text extractions, but the inspected set omits the GameSpot retail walkthrough (CONTEMPORARY PROFESSIONAL, listed in P15 §1.3) and the *Stunts & Effects* manual. I could not fetch GameSpot (403) either; the gap should be named rather than left implicit. The report also missed a strengthening datum it had on disk: the modded facility-INI schema flag `availableindebt=1` on exactly the core-loop facilities (`THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md:49`; `TECHNICAL-ARTIFACTS/schema_fields.csv` row TECH-SCHEMA-004) — data-level corroboration of the Prima/manual soft-debt build law.

---

## 3. What the prompt asked that the report did not answer (or answered thinly)

1. **Blockbuster Inc. (Super Sly Fox, 2024) — skipped entirely.** The prompt asked for "any strongly relevant others"; this is a studio-lot film tycoon that RPS covered as "Another new The Movies-like" (Steam news feed item 2024-03-21). Its official patch notes (Steam news API, appid 1793090) establish: **1.9.0 (2024-10-28)** "Bankruptcy Mechanic: Rival studios can go bankrupt, pausing operations for a year before returning"; Studio Charts show "studio status (active/bankrupt) and the number of bankruptcies so far"; if a studio you hold shares in goes bankrupt "you lose the shares you bought from them"; "Bank Loan Payoff Option: Instantly repay bank loans." **1.7.16.1 (2024-06-20)** "allow getting loans even if company money is below 0." The Nov-2022 dev update lists "finances, bank loans" as planned. This is a shipped **rival-only dormancy-and-return** precedent with public status display — closer to P15B's `dormant` state and to P12's terminal asymmetry than anything in the report (OpenTTD deletes AI companies; GearCity liquidates/refinances/sells). No inspected source establishes a *player* bankruptcy in Blockbuster Inc.; that must stay open. Confidence: HIGH that the rival mechanic and loans exist (official patch notes); mechanics beyond the quoted sentences not established.
2. **Moviehouse – The Film Studio Tycoon (2023)** ships loans (Patch #2, 2023-04-10: "Fixed loan repayment notification"); mechanics not established. Worth a one-line mention as a film-sim comparator.
3. **RollerCoaster Tycoon 3** — named in the prompt ("RCT 1/2/3"); not covered (only RCT1/2/OpenRCT2).
4. **Planet Coaster** — named in the prompt; not covered (report admits in §6.7).
5. **Railroad Tycoon II** — the canonical bond/credit-rating/personal-wealth model; only RRT3 covered, and only via StrategyWiki (community).
6. **Anno** — only Anno 1800 via fandom; no official source; earlier Annos not touched. Acceptable under "skip weak evidence" but should be stated.
7. **(f) "does failure feel earned"** is answered for HA, GDT, MGT2, GearCity, OpenTTD; it is missing or one-clause for Software Inc., Capitalism Lab, Prison Architect, TPH, Anno, CS1/2.
8. **Hollywood Animal completeness:** the report lists 0.8.72EA (2026-08-03) in its sources but does not use its one relevant line — a bug fix that had "prevented you from using Friends' services while your studio had a negative balance" — which shows negative balance is a gating state in HA beyond the 100-day clock. Minor.
9. **Original-game tier discipline:** the report never engages the GameSpot 2004 preview's "studio goes bust" wording that P15 §6 flags; it should say explicitly that this is PRE-RELEASE PROMISE and that retail evidence describes only a soft debt state — which is what its §5 "QUALIFIED" bullet implies but does not spell out.

---

## 4. Claims that survive as strong

- Baseline code truth (no loans; negative cash recoverable; runway advisory; D-16 label is harness-only) — exact, line-verified.
- Original 2005 soft-debt law (manual p. 6; Prima p. 14; GameFAQs; plus the unused `availableindebt` artifact) — strong; no inspected retail text mentions loans/interest/bankruptcy.
- Hollywood Animal official facts (100-day clock, $1m first credit, Marginese distress/borrow event, loan-repayment calc fix, rival aggression, Act-2 intent) — verbatim.
- OpenTTD distress law (net-position trigger, resetting counter, 3/6/9-month stages, single-player "no THE-END", interest on negative cash) — line-exact at the pinned commit.
- GearCity (dev 6-month rule, 1.23 SP4 non-reset, warning memo with inline remedies, three instruments, bailout achievement, "Can be fired" setting, bankrupt-purchase liabilities) — official wiki/dev, verbatim.
- Prison Architect two-condition trigger, CS1 tiers/bailout, OpenRCT2 loan-while-in-debt, Capitalism Lab declare/liquidate/DLC continue, MGT2 dev statements and reset exploit, TPH/Software Inc./GDT/Anno community figures (correctly labeled) — all confirmed.
- The §2.4 exploit catalogue and the §4 "best simple loan" ranking are reasonable syntheses of confirmed evidence; the P15-§16 caution (every comparator with distress ships a liquidity instrument) also holds for the skipped Blockbuster Inc.

---

## 5. Required edits before this report is relied on

1. Rewrite §1.14, the FM synthesis row, summary bullet 16, and §5 bullet 4 per §2.A above; retract "the atlas contains no management-sim distress comparator."
2. Downgrade/correct the OpenTTD takeover-loan sentence per §2.B.
3. Fix Prima page to printed p. 14; state OpenTTD months as one mapping; soften the GearCity formula.
4. Add a Blockbuster Inc. dossier (official patch notes) and a synthesis row: loans (raisable below $0, instant payoff) | rival bankruptcy = one-year pause then return | public active/bankrupt status + bankruptcy count | player bankruptcy not established | **adopt:** rival dormancy-with-return as the shipped analogue of P15B `dormant`; public status display | **reject:** share-loss-on-bankruptcy (P16+ ownership).
5. Name the uninspected sources (GameSpot walkthrough, S&E manual, RCT3, Planet Coaster, RRT2) explicitly in §6.
