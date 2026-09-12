# Verification memo — comp-ma.md (Comparator study: M&A / acquisition / bankruptcy / subsidiaries)

**Lens:** COMPLETENESS & OVERCLAIM (adversarial)
**Verifier:** independent, read-only
**Date:** 2026-09-11
**Report under review:** `<scratchpad>/out/phase1/comp-ma.md`
**Method:** re-read the topic prompt; re-fetched the primary sources the report cites (OpenTTD `master` source, PR #10709 / #10914 bodies and comments via the GitHub API, 14.0/14.1 changelogs, GearCity official wiki raw exports `howto_stockmarket` and `gm_stocks`, ventdev forum thread 2895, the GearCity Steam "Company Acquisition" thread, Capitalism Lab official pages and forum index, Railroad Tycoon II Platinum manual full text, Railroad Tycoon 3 manual full text, Soren Johnson Designer Notes #17, Software Inc / Mad Games Tycoon 2 / Hollywood Animal Steam news via the ISteamNews API, LadiesGamers and Big Boss Battle Moviehouse reviews); re-grepped the retail extractions (`manual.txt`, `prima.txt`, both GameFAQs FAQs, gamepressure); re-read the cited authority lines and `src/core/hollywoodTypes.ts` in the accepted snapshot. Web search budget was exhausted mid-pass; every check below used direct fetches. No repository was modified; no player data touched.

**Bottom line:** the report's spine holds — the OpenTTD flow, the GearCity vote/first-refusal/debt-transfer rules, the RT2 manual claims, the OTC subsidiary pivot and the "no acquisition in retail The Movies" cross-check all re-verify against primary sources. But the report (a) promotes an in-development Capitalism Lab DLC feature to "OFFICIAL, HIGH … shipped pattern" and then uses it to confirm a P15 ruling; (b) misstates the GearCity takeover formula it labels a design anchor; (c) attributes Offworld's abandoned "double value" rule to the final anti-snowball design; (d) presents a GearCity newspaper display bug as evidence that AI pays "far less"; (e) makes a synthesis claim about partial-share markets that its own table contradicts; and (f) skipped three directly on-topic official sources (Capitalism Lab's bankruptcy-acquisition page, the RT3 manual, Hollywood Animal's developer Q&A/patch notes). Verdict: **REFUTED IN PART** — the recommendation section survives, but several specific claims need correction before anyone cites them.

---

## 1. What the prompt asked that the report did not answer, or answered vaguely

| # | Prompt requirement | What the report delivered | Gap severity |
|---|---|---|---|
| 1 | "Railroad Tycoon II/**3** (stock, hostile takeover, bankruptcy mergers)" | RT2 is thorough (manual, HIGH). RT3 gets one clause sourced to a Steam thread (COMMUNITY). The RT3 manual is on archive.org (`railroad-tycoon-3-manual-pc`) and documents an **"Attempt Takeover"** button ("If you control enough stock of another company, you may be able to boot out the current chairman and take the reins yourself"), an "Attempt Merger" action, and a bankruptcy rule (debts halved, bondholders receive extra shares, no new bonds). RT3's chairman-ouster-by-stock is a distinct shape from RT2's vote-at-offer-price merger and was not captured. | **Material** — a named priority game with an official manual left unread |
| 2 | "Transport Tycoon / OpenTTD … with wiki/manual citations" | Source code is cited (stronger than wiki), but the only wiki page cited (Manual/Economy) contains no bankruptcy flow (I fetched it; it covers inflation, recession, loans, share trading, maintenance). No original-TTD manual is cited, and the prompt's "N quarters" framing vs. the code's month counter is never reconciled (the code reports `CeilDiv(months,3)` — quarters — to the admin layer; the month-based switch has been stable since at least 1.10.0, which I checked). | Minor — flow is right, citation ask partly unmet |
| 3 | Capitalism Lab "bankruptcy" | The report covers hostile takeover, the 75%/100% ladder and the private-company buy button, but **misses the official page "Acquire Companies That Are Facing Bankruptcy"** (Banking and Finance DLC, released 2020 at v6.5.20 per the official forum): a new-game setting under which "a company on the brink of bankruptcy can be rescued — by you, buying all of its shares", the game pauses and offers it to the player, "Distressed companies are cheap". This is the closest thing in the comparator set to the OpenTTD bankruptcy offer inside a stock-market game — exactly the prompt's "bankruptcy auctions" ask — and it is absent. | **Material** |
| 4 | Hollywood Animal "any rival acquisition or studio-purchase? verify" | The "no inspected source establishes" phrasing is correct and I could not find an acquisition mechanic either. But the report says the roadmap "could not be read (Steam page shell only)"; the Steam ISteamNews API returns all 131 posts. Those posts contain (a) an official developer Q&A (2024-11-11) answering "Can we drive enemy studios into bankruptcy…?" with "You can hurt other studios significantly in Act 1 … things are going to get more brutal in Act 2"; (b) patch 0.8.51EA (2025-09-30): the head of a rival studio comes to borrow the player's money "when his studio was going bankrupt" — i.e. a rival-distress lending event exists; (c) 0.8.67EA (2026-01-27): "Competitors now buy cinemas more aggressively"; (d) Act 2 post (2026-04-30): "Act 1 ended with you and your competitors losing your theaters … distributors". These are OFFICIAL and directly on-topic (rival distress, no acquisition). | **Material** — best thematic comparator under-researched with an accessible official source |
| 5 | Industry Giant | One LOW community sentence on IG2; nothing on Industry Giant 1 or the 2023 Industry Giant 4.0. "Skip weak ones" covers this, but the report should say it skipped rather than present a LOW cell in the synthesis table. | Minor |
| 6 | Game Dev Tycoon "(none? verify)" | Verified only by "fan wiki via search snippet" (LOW–MEDIUM). Acceptable outcome, weak verification. | Minor |
| 7 | "whether the player can sell" per game | Table cells read "n/a", "?", "partial", "shares only" for six of twelve rows. Not answered for Software Inc (can you sell a subsidiary?), MGT2, Moviehouse. | Minor–moderate |
| 8 | "what transfers (employees, contracts …)" | Employees/contracts are not addressed for GearCity, Capitalism Lab, RT2, Railway Empire — only assets/IP/debt. | Minor |
| 9 | Software Inc. current state | Profiled as "Beta 1.8.x, 2026" without noting that the developer announced (2026-06-08 Steam post) a ~6-month hiatus to overhaul "marketing, servers and subsidiaries", and teased a "subsidiary CEO mechanic" on 2026-08-20. Anyone citing the subsidiary model as stable should know it is mid-rework. | Minor |
| 10 | Two Point / Planet Coaster | Not inspected; asserted from general knowledge. The prompt said "(none)", so acceptable, and the report is honest about it. | None |

---

## 2. Where the report asserts more than its evidence supports

### 2.1 Capitalism Lab "Playing Without a Company" — in-development DLC promoted to a shipped mechanic (**refuted**)

- Report: §2.3 "**Player loss is not game over** … (OFFICIAL, HIGH)"; §5 pattern 4 and §7: "Capitalism Lab and Offworld show a non-game-over continuation is a viable, **shipped** pattern, supporting P12's no-mandatory-hard-bankruptcy law"; summary bullet 8 [HIGH].
- Evidence: the official Capitalism Lab forum index lists "**Billionaire Life DLC (In Development)** … This forum is for posting new feature previews"; the developer's X post (2026, per search snippet) calls it "the upcoming Billionaire Life DLC"; the capitalismlab.com page itself is a feature page for that DLC (it lists the Career-tab settings and the $1M/$20M inflation-scaled founding capital exactly as the report says). The rules are described accurately; the **status** is not. This is precisely the "never promote a pre-release feature into shipped" error the prompt warns about, applied to a comparator and then used to "CONFIRM" a P15 ruling.
- Corrected statement: *Capitalism Lab has announced, for its in-development Billionaire Life DLC, a "Playing Without a Company" mode (continue after hostile takeover or bankruptcy; retain CEO role; found a new private company for $1M inflation-scaled). Source: capitalismlab.com/playing-without-company/ + capitalism2.com forum index ("In Development"). Class: DEVELOPER PRE-RELEASE FEATURE PREVIEW, not a shipped mechanic. Only Offworld's subsidiary continuation (2016) is shipped.*

### 2.2 GearCity takeover formula misstated (**refuted as written**)

- Report §2.2 / table / summary: "unprofitable targets (EPS < −0.5) at 1.1× evaluation; profitable targets at 1.2× evaluation × (1 + EPS_year/10), share price ×1.75" (MEDIUM via summariser; flagged in §8).
- Official wiki `gamemanual:gm_stocks`, section "Takeover Price" (raw export, read directly):
  - EPS_Year < −0.5: `((1.1·Eval / Shares_Needed) / 5 + 1.3·PricePerShare) · Shares_Needed · DifficultyBonus` → **0.22× evaluation + 1.3× market value of the shares needed**.
  - otherwise: `((1.2·Eval / Shares_Needed) / 2.5 + 1.75·PricePerShare) · Shares_Needed · (1 + EPS_Year/10) · DifficultyBonus` → **0.48× evaluation + 1.75× market value, scaled by EPS and difficulty**.
  - Shares_Needed == 0: `Eval / 10 · DifficultyBonus`.
- The report drops the /5 and /2.5 divisors and the 1.3× share-price term, overstating the evaluation component roughly 2.5–5×. The author's own §8 caveat ("should be re-read directly before anyone uses them as a design anchor") is correct and now discharged: the numbers in the body are wrong.

### 2.3 Offworld "buyouts cost double" attributed to the final anti-snowball design (**overclaim / misattribution**)

- Report §2.6 and table: "buyouts cost double, plus '20% extra for each share owned by a third party'; the defence is buying your own stock".
- Designer Notes #17 (read directly): "double value for all of the shares owned by other players" describes the **initial** system that was replaced ("This system worked reasonably well except for two problems"). The **final** system is: shares bought one at a time with rising price, the final five bought as a block, and "20% extra for each share owned by a third party". The diary also gives a **second** reason for the pivot the report omits: all-or-nothing buyouts made the race-winner "snowball forward", or, if buyouts were priced too high, players "saved up their money instead". Self-buyback defence is described in the original system's context; it survives in the final game but the report should not present "double price" as a shipped anti-snowball rule.

### 2.4 GearCity "Daimler buying MG for far less than the player's quoted price" (**refuted as evidence**)

- Report §2.2 "AI acquires AI: yes — the same Steam thread documents Daimler buying MG for far less than the player's quoted price."
- Steam thread (2021-07-22/23, read directly): the 176M figure came from the in-game newspaper; Eric.B replied "the information in the newspaper is incorrect … Go by the share price in the memos" and put the real price at roughly $760M. The thread does establish AI↔AI acquisitions and the developer's statement that "the player is charged more to buy out companies … to fix player exploits" — those hold. The "far less" example is a display bug and should be removed.

### 2.5 Moviehouse "professional reviews say it trivialised the money loop" (**overstated**)

- Big Boss Battle (2023-05-03, read directly) lists share-buying under "a ton of depth here … and even (super idle-genre) the chance to buy shares in your competition to create a passive income that far exceeds any costs you'd ever accrue" — presented as depth, not as a balance criticism. LadiesGamers (Difficulty section) says "invest in your rival studios, giving you a steady monthly income. You'll never have to worry about money again" — supportive of the report's reading but not framed as a complaint. Corrected: *two reviews note passive rival investment income that removes money pressure late-game; neither frames it as a flaw.* The design inference (cautionary) is reasonable, the attribution to reviewers is not.

### 2.6 Synthesis contradicts the report's own table (**internal inconsistency**)

- §5 and summary bullet 19: "every partial-share market either was removed (OpenTTD) or turned the game into a finance sim (GearCity, Capitalism Lab, RT2)". The report's own table rates **Railway Empire** (shares to 100%) "low" drift, **Software Inc.** (shares to >50%) "medium", **Mad Games Tycoon 2** (percentage stakes) "low", **Offworld** (shares) "medium". Same paragraph lists Railway Empire under "single whole-company transaction at a formula price" games — it is a share-accumulation game by the report's own description. The defensible statement is narrower: *partial-share markets with tradeable, dividend-bearing stakes (GearCity, Capitalism Lab, RT2) are finance sims; share-as-acquisition-ramp models (Railway Empire, Software Inc, OTC) stayed operational but each needed price escalation.*

### 2.7 "Decades of players never asked for it to be more complex; they asked for the share layer to be removed" (**unsupported**)

- PR #10709 body opens "a personal opinion: this feature is just the worst" (TrueBrain, maintainer). LordAro's comment lists 13 share-related issues and several fix attempts. Nothing inspected shows players requesting removal. Corrected: *the maintainers removed shares as a bug-prone, exploitable, disabled-by-default feature that "adds ABSOLUTELY NOTHING" for the player (maintainer opinion, PR body).*

### 2.8 Smaller precision issues in the OpenTTD section (all verified against `master` fetched today)

- §1.2 "stations × StationValue × 25": code sums `st->facilities.Count()` (station **facility** bits, not station count).
- §1.2 hostile takeover "2 × max(0, last four quarters' profit)": code is `Σ_quarters max(income+expenses, 0) × 2` — the floor is **per quarter**, so negative quarters do not net against positive ones.
- §1.1 "or immediately if the company had no value at month 6": that clause is a stale code comment; `CalculateCompanyValue` floors at 1 and `case 7` asserts `bankrupt_value > 0`, so the month-6 deletion path is unreachable in current code.
- §1.4 attributes the hostile-takeover replacement to PR #10709; shares were removed in #10709 (merged 2023-04-29) and hostile takeover added in **#10914** (merged 2023-06-05, motivation: "you could no longer make an AI disappear"). #10914's author also wrote that the price is "all based on an opinion … it needs some input" — a caveat worth carrying if the formula is ever used as a design reference.
- §1.5 "GitHub issue #3561" is one of LordAro's share-bug links, not an independent restatement of the flow.
- "14+ issues and 16+ fix attempts": LordAro's comment lists 13 issues; close, but the numbers are the verifier's count, not the source's.

### 2.9 "every game that allows [healthy early buyouts] needed premiums, votes or cooldowns **afterwards**" (**overgeneralised**)

- RT2's once-a-year rule and shareholder vote are in the 1998 manual — designed in, not patched in. Only GearCity's player premium is documented as a post-hoc exploit fix. Offworld's 20% tweak happened during development.

### 2.10 Stage-1 recommendation asserts a property the model does not have

- §6.1: "cannot snowball because it only fires on failure and prices are formula-frozen". OpenTTD's rotation asks the **best-performing** company first (`performance_history` descending) — the leader gets first refusal, which is itself a rich-get-richer rule. If the merit order is borrowed, the report should say whether Project: Studio would invert it or place the player last; as written the anti-snowball claim is asserted, not evidenced.

---

## 3. Counter-evidence or alternative sources skipped

1. **Capitalism Lab "Acquire Companies That Are Facing Bankruptcy"** (official, Banking and Finance DLC, shipped 2020) — the bankruptcy-offer flow inside a stock-market game; see §1 row 3.
2. **Railroad Tycoon 3 manual** (archive.org) — "Attempt Takeover" chairman ouster, "Attempt Merger", bankruptcy with bondholder share compensation; see §1 row 1.
3. **Hollywood Animal Steam news via API** — developer Q&A on driving rivals bankrupt; rival-distress loan event; AI buying cinemas; see §1 row 4.
4. **OpenTTD wiki Manual/Economy share-trading text** says a share buyout gives "vehicles, infrastructure, and cash, but also their debt" — i.e. the pre-14.0 share path **did** transfer the loan, unlike the bankruptcy path. The report cites this page but does not surface the contrast, which is the clearest "debt transfers vs. does not" comparison inside one game.
5. **Software Inc. patch history** (Steam news API): Alpha 11.7 "Fixed subsidiary price adding player stock worth twice" (shows the price is built from stock worth), Beta 1.8.12 confirmed as cited, 2026-06 subsidiary overhaul hiatus.
6. **PR #10914 body** — the hostile-takeover price rationale and the author's own uncertainty about it.

---

## 4. Spot-checks (claim → source → result)

| # | Claim (report) | Source re-read | Result |
|---|---|---|---|
| 1 | Trigger `money − loan < −maxLoan`; warn `case 4`; offer `case 7` with loan excluded; delete `case 10`; local human company never deleted | `economy.cpp` `CompanyCheckBankrupt` (master, lines 547–628) | **Confirmed** (line numbers within ±3 of report) |
| 2 | One bidder at a time in `performance_history` order; timeout quarter/(MAX_COMPANIES−1); bankrupt bidders skipped; vehicle-limit check | `company_cmd.cpp` `HandleBankruptcyTakeover` (741–795) | **Confirmed** |
| 3 | Replacement AI timer with ±12.5% jitter, capped by `max_no_competitors` | `company_cmd.cpp` 686–707, 809–830 | **Confirmed** |
| 4 | `DoAcquireCompany` deletes the company; no money/loan transfer | `economy.cpp` 1981–2004; `ChangeOwnershipOfCompanyItems` | **Confirmed** (no `money`/`current_loan` in the transfer function) |
| 5 | PR #10709 merged 2023-04-29, reasons as listed; 14.0 changelog line 166; 14.0 dated 2024-04-13 | GitHub API; cdn.openttd.org changelog | **Confirmed**, with the #10914 attribution correction above; #12594 and #12818 exist as described (fixed 2024-05/06; they do not appear in the 14.1 or 15.0 changelog text, so "15.0 changelog fixes" is unverified) |
| 6 | GearCity 50% yes-vote rule; own shares vote yes; next-turn lockout | `howto_stockmarket` raw export lines 204–210 | **Confirmed**. "Other companies' shares vote no" is **not** on the page (the report attributes it to the wiki; it may come from the Steam thread, where the dev describes a company voting its own 76% stake) |
| 7 | GearCity takeover multipliers | `gm_stocks` raw export "Takeover Price" | **Refuted as written** (§2.2) |
| 8 | GearCity bankruptcy first refusal, bonds transfer, AI checked, else liquidated; "not supposed to be a good deal" | ventdev thread 2895 (Eric.B, 2016-05-22/24) | **Confirmed** |
| 9 | GearCity player charged more than AI to close exploits | Steam thread 2021-07-22/23 | **Confirmed**; "Daimler/MG far less" **refuted** (display bug) |
| 10 | Capitalism Lab 75% direct control; 100% to privatize | capitalismlab.com subsidiary-control, privatization | **Confirmed** |
| 11 | Capitalism Lab "Playing Without a Company" OFFICIAL/HIGH shipped | page + forum index | **Rules confirmed; shipped status refuted** (In Development DLC) |
| 12 | RT2: merger once a year, more votes for higher price; bankruptcy halves debt, forfeits cash; trustees option; "chairmen are appointed, not born"; Second Century 50% dilution | RT2 Platinum manual full text | **All confirmed** verbatim |
| 13 | OTC: six shares = elimination; subsidiary run by modified AI; spiral quote; 20%/third-party share | Designer Notes #17 (2016-05-01) | **Confirmed**; "double price" as final rule **refuted** (§2.3) |
| 14 | Software Inc Beta 1.8.12 specialization + AI-limit change | Steam news 2025-01-28 | **Confirmed** |
| 15 | Software Inc official wiki Stocks page has empty "Hostile takeover"/"Subsidiary/bankrupt" sections | wiki page | **Confirmed** (note: sections sit under "old system ≤ Alpha 11.4.10", page last edited 2020) |
| 16 | MGT2 acquisitions announced 2022, controls as listed | Steam news 2022-04-28 | **Confirmed**; percentage tiers correctly flagged as community-only |
| 17 | Moviehouse reviews "trivialised" | LadiesGamers, Big Boss Battle | **Overstated** (§2.5) |
| 18 | Retail The Movies: only in-debt lockout (manual 129–130) and script/Star selling (manual 429; Prima 1202); no acquire/merge/bankrupt terms | grep of all five extractions | **Confirmed** (Prima "Build in Debt" entries run to ~line 1606, beyond the report's 769–1229 range — harmless) |
| 19 | Accepted snapshot has `StudioIdentity`, `RivalBusiness.account.cash`, `IndustryEmployment`, films with `studioId`, and no ownership/valuation/closure model | `src/core/hollywoodTypes.ts`; grep of `src/core` | **Confirmed** (report omits `row/mark/color/eligibleWeek/recordedFromWeek` fields; line ranges off by one) |
| 20 | Authority cites: P15-PACKAGE line 329 (OpenTTD reject takeover translation), 351 (P16+ additive root), 539 (no rewriting historical owner facts); OWNER-RULINGS §4.2/§5; ROADMAP 215, 260, 273, 695–703 | authority copies | **All confirmed** |

---

## 5. Items the report got right that a hostile reviewer would still accept

- The OpenTTD flow description is the most accurate primary-source account in the whole phase-1 set; the code reading is careful and the "no THE-END" single-player rule is correctly quoted.
- GearCity's marque persistence, debt-on-bankruptcy-purchase, and health-gated votes are correctly sourced to official/dev material.
- RT2 is sourced to the manual and every quote checks.
- The Movies cross-check is correct and its evidence class labelling is exact.
- The recommendation's non-negotiables (never parity; StudioId minted once; historical facts immutable; no shares) follow directly from the authority docs and are not undermined by anything found here.

---

## 6. Required corrections before the report is cited

1. Re-class Capitalism Lab "Playing Without a Company" as DEVELOPER PRE-RELEASE FEATURE PREVIEW (Billionaire Life DLC, in development); drop "shipped" from §5.4 and §7; keep Offworld as the shipped example.
2. Replace the GearCity takeover multipliers with the `gm_stocks` formulas (0.22×/0.48× evaluation + 1.3×/1.75× market value, EPS and difficulty scaling, Eval/10 when no shares needed).
3. In the OTC row/section, move "double value" to the abandoned original system and add the second pivot reason (all-or-nothing snowball / hoarding).
4. Delete the "Daimler/MG far less" example; keep the dev statement on player premium.
5. Re-word the Moviehouse line to "reviews note late-game passive income that removes money pressure" and drop "professional reviews say it trivialised".
6. Narrow the §5 partial-share synthesis to dividend-bearing/tradeable-stake markets and remove Railway Empire from the "single whole-company transaction" list.
7. Add Capitalism Lab's bankruptcy-acquisition setting (official, shipped DLC) to §2.3 and the table.
8. Add an RT3 paragraph from the manual (Attempt Takeover / Attempt Merger / bankruptcy dilution).
9. Add the Hollywood Animal developer Q&A and 0.8.51EA rival-distress loan note; keep "no acquisition established".
10. Attribute hostile takeover to PR #10914 and carry its author's "based on an opinion" caveat; fix the facility-count and per-quarter-floor wording; remove the "immediately if no value" clause.
11. Replace "players asked for removal" with the maintainer-opinion wording from the PR body.
12. In §6.1 Stage 1, state how merit-order first refusal (leader first in OpenTTD) would be handled, or drop "cannot snowball".
