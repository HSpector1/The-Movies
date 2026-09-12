# Source-Fidelity Verification — `phase1/orig-economy.md`

**Verifier:** adversarial verifier, lens = SOURCE FIDELITY
**Date:** 2026-09-11
**Report under test:** `<scratchpad>/out/phase1/orig-economy.md`
**Method:** for each consequential claim I went to the cited source myself — `grep`/`sed` on the plain-text extractions, `pdftotext` per PDF page to confirm printed page numbers, `sed -n` on the accepted-code files at the cited lines, `r.jina.ai` proxy fetches for the GameSpot articles (direct fetch 403s), direct fetches for forceforgood/IMDb/Eurogamer, and the Read tool on the two evidence-folder screenshots. Read-only throughout; nothing under any repository or player data was touched.

**Overall verdict: VERIFIED WITH CAVEATS.** Every load-bearing citation reproduced. The tiering (retail vs. pre-release vs. community) is correctly assigned in every case I checked. The caveats are (a) one mischaracterised code identifier that does not affect the conclusion, (b) three minor printed-page slips in the manual/Prima locators, (c) a small nuance on the IMDb "century in debt" reading, and (d) one internal Prima nuance (post-55 market-value decline described as "precipitous" on p.20 but as a gradual yearly decline on p.61) that the report smooths over.

---

## Checks performed (13 claims)

### C1 — Manual p.6 debt note (RETAIL SHIPPED, HIGH)
- **Claim:** manual p.6 says the balance can go into the red and, while in debt, the player cannot build new sets or "certain facilities and lot ornamentation"; nothing else stated.
- **Source check:** `original-text/manual.txt:129-130` contains exactly "Your balance can go into the red but when you're in debt, you won't be able to build new sets or add certain facilities and lot ornamentation." `pdftotext -f 4 -l 4` on `movies manual_english.pdf` shows the QuarkXPress slug "Page 6" at line 1 and the same note at line 25, left column → printed p.6. The PDF is 22 pages of two-page spreads (slugs Page 2…Page 42 at PDF pages 2…22), so "PDF page 4 left = p.6" is exactly right.
- **Absence check:** `grep -ci` for loan/borrow/bankrupt/"game over" in manual.txt = 0/0/0/0.
- **Verdict: CONFIRMED.** Tier correct (official manual, slug dated 9/27/05).

### C2 — Prima p.14 "Building in Debt" exception list (PRIMA, HIGH)
- **Claim:** exactly seven exceptions — Casting Office, Crew Facility, Production Office, Basic Script Office, Stage School, Stage Set, Star & Script Selling Facility.
- **Source check:** `prima.txt:769-776` — heading "Building in Debt", sentence "Most facilities and sets can't be built when your studio is in debt, but there are a few exceptions:" followed by the seven bullets verbatim. Page marker "14" at `prima.txt:786`.
- **Verdict: CONFIRMED.** Page right, list exact.

### C3 — 71 asset profiles, 7 Yes / 64 No, matching the p.14 list (PRIMA, HIGH)
- **Claim:** every profile carries a Build-in-Debt flag; 7 Yes / 64 No; the seven Yes entries are the p.14 list.
- **Source check:** `grep -o "Build in Debt: Yes" | wc -l` = 7; `grep -o "Build in Debt: No" | wc -l` = 64; total 71 (60 physical lines, 11 of which carry two flags from the two-column layout). The seven Yes lines and their owning profiles, read in context: `:833` Casting Office ($5,000, 1920); `:910` Crew Facility ($4,000, 1920); `:940` Production Office ($6,000, 1920); `:1112` Script Office: Basic ($6,000, 1920); `:1124` Stage School ($5,000, 1920); `:1177` Star & Script Selling Facility ($3,000, 1920); `:1397` Stage set ($2,000, 1920, Practice Genre Comedy, Boredom 38). Spot-checked table costs: Custom Scriptwriting Office $11,111 at `:863` vs $35,000 at `:6251` (internal Prima conflict as the report says); Publicity $44,444 `:993`; Proficient $33,333 `:1122`; First Class $66,666 `:1142`; Palatial $77,777 `:1210`.
- **Corroboration:** Maxx FAQ `gamefaqs-maxx.txt:659-663` repeats the same seven; `:1119` "This set can be built when you are in debt" under the Stage set.
- **Verdict: CONFIRMED.** The count reproduces exactly and the mapping is one-to-one.

### C4 — Studio Rating weights and the Capital curve (PRIMA p.46-47, HIGH)
- **Claim:** Capital 24 / Movies 24 / Stars 24 / Lot Prestige 14 / Awards 14; Capital = cash in bank at any given time; scale $50,000–$1,600,000; 50% point about $300,000; Prima prints the arithmetic midpoint as "$775,000" (a slip; true midpoint $825,000).
- **Source check:** `prima.txt:2790-2860` (page marker "46" at `:2860`): "measured on a scale from $50,000 (lowest rating) to $1,600,000"; "the midpoint is not directly between the two extremes ($775,000) but instead about one-fifth of maximum ($300,000)"; "To max out this factor, amass and keep more than $1,600,000 in the bank at all times"; "Capital is a measure of your studio's wealth based on the amount of money your studio has in the bank at any given time." Weights: "24% of Studio Rating" at `:2816` (Capital), `:2850` (Movies), `:2852` (Stars); "14%" at `:2889` (Lot Prestige, p.47) and `:3182` (Awards). (50,000 + 1,600,000)/2 = 825,000, so the "$775,000" is indeed not the arithmetic midpoint — the report's misprint reading holds.
- **Caveat (minor):** the Awards "14% of Studio Rating" heading sits on printed p.51 (`:3182`, between markers 50@`:3146` and 51@`:3209`), not p.46-47. The p.46 text does say "Each heading below reflects how much of the total score is governed by each factor", so the five-way split is legitimately one passage, but a reader going to p.46-47 alone will find only four of the five weights.
- **Verdict: CONFIRMED** (locator slightly loose for Awards).

### C5 — Star Market Value definition (PRIMA p.60-61, HIGH; formula LOW)
- **Claim:** market value = "the price you could get in the Star & Script Selling Facility", a function of Star rating and actual age, rising until 55 then declining yearly toward mandatory retirement at 70; full value only after 8 years with the studio; only matters for selling.
- **Source check:** `prima.txt:3826-3866` (all between markers 60@`:3805` and 61@`:3868`, i.e. printed **p.61**): "his or her market value (the price you could get in the Star & Script Selling Facility) is a function of Star rating and actual age. At age 55, the upward curve … begins its turn downward, decreasing with every year as retirement approaches"; "At the ripe old age of 70 … Stars must … retire"; "Stars must be with your studio for eight years before they can be sold for full market value … Until then, they'll fetch only a rising fraction"; "Market value is only important if you intend to make cash by selling a Star … Otherwise, it's not important." The $100,000 salary cap on Star-rating credit is also on this page ("paid, up to $100,000").
- **Nuance the report smooths over:** the facility profile on p.20 (`prima.txt:1189-1190`) says market value "drops off precipitously once the Star turns 55", whereas p.61 describes a gradual per-year decline. Both are Prima; the report cites only the p.61 shape. Worth recording as an intra-Prima wording tension (LOW consequence).
- **Verdict: CONFIRMED**; page is p.61 rather than "p.60-61" (the p.60 marker precedes the passage). Tier correct. "Formula unrecovered — LOW" is honest: no numbers anywhere.

### C6 — Star & Script Selling Facility (manual p.17; Prima p.20-21) (RETAIL/PRIMA, HIGH; UI details MEDIUM)
- **Source check (manual):** `manual.txt:428-431` "Sometimes you might want to sell off Stars or scripts to rival studios to make some quick money … drop the Star or script … into the building and you'll be rewarded with cold, hard cash." `pdftotext -f 9` shows slug "Page 16" and the passage in the right column → printed **p.17**. Correct.
- **Source check (Prima):** `:1189-1190` (p.20) "it pays to use this building to sell them to another studio rather than firing them outright"; `:1159-1161` (p.20, Staff Office Fire/Reject room) "you get nothing for releasing a Star this way, it might be better to sell an unwanted Star at the Star & Script Selling Facility"; `:1198-1199` (p.21) eight-year rule for newly hired Stars "even those hired from rival studios"; `:1203` "The market value of scripts depends on their script rating."
- **Community wording:** Maxx `:626` "auctioned off to an amount based on their rating"; Mark `:711-713` "You will be told the estimated selling price when you hover the star/script over the building." Mark `:511-512` also lists "age, star rating and their image" — the report correctly flags "image" as uncorroborated by Prima.
- **Verdict: CONFIRMED.** Tiers correct (manual/Prima = retail; FAQ UI details = community MEDIUM).

### C7 — Building sale = "depreciated portion" (Prima p.10; Maxx bomb icon) (PRIMA HIGH / schedule LOW)
- **Source check:** `prima.txt:458-459` "hold a builder over a structure's Sell Building icon to permanently demolish the building and recoup a depreciated portion of its original purchase price"; debris/attractiveness warning at `:463-467`; page marker "10" at `:482`. Maxx `:390-392` "move a builder onto the bomb icon to have the building be demolished and to gain a depreciated portion of the original price". Prima p.19 restroom tip at `:1086` "sell five Small [Restrooms]" — present.
- **Note:** the word "bomb" is Maxx's (community), not Prima's; the report's parenthetical `("bomb")` is fine but is a community label attached to an official mechanic. No source gives a depreciation schedule — the LOW is right.
- **Verdict: CONFIRMED.**

### C8 — GameSpot pre-release vs. 2005 impressions (PRE-RELEASE, HIGH)
- **2004-02-23 preview** (`r.jina.ai` fetch of `gamespot.com/articles/the-movies-preview/1100-6089840/`): byline Andrew Park, Feb 23 2004. Present verbatim: "…keeps track of time and any milestones your movies may have reached, at least until the studio goes bust"; "A wealthy socialite might offer you a pile of money to make a movie starring his talentless, spoiled-brat daughter…"; "tiny swarms of dollar bills flying off the top of your actors' heads … (a faster swarm means that your actors are costing you more)"; "rival studios may even try to steal them away"; "a small studio, a limited budget, and some restrictions".
- **2005-08-19 Updated Impressions** (`…/1100-6131571/`): byline Jason Ocampo, Aug 19 2005. Present verbatim: "if you go into debt, you will be very limited in what you can do until you get out of debt." No bust/bankruptcy/loans/selling/starting-money content.
- **E3 2002 First Look** (`…/1100-2866856/`): Sam Parker, May 22 2002; "one way to grow is to acquire your competitors" present; no debt/bankruptcy language.
- **Verdict: CONFIRMED** — dates, bylines and quotes all reproduce; all correctly quarantined as PRE-RELEASE and none promoted to retail. The "superseded before ship" inference (Feb 2004 bust → Aug 2005 lockout) is fairly drawn from these two dated GameSpot pieces.

### C9 — Accepted-code facts (`accepted-592e926`, HIGH) — one mischaracterisation
- `src/core/employment.ts:77-86`: `canAfford()` under the "D-12 solvency gate (D-12.11)" comment — "cash AFTER this immediate transaction must be ≥ 0 … Unavoidable weekly debits … may still push cash below zero." **Confirmed.**
- `src/core/tuning.ts:70`: `INITIAL_CASH: 20_000_000`. **Confirmed.**
- `src/core/tuning.ts:812-816`: `SET_DEMOLITION_REFUND_FRACTION: 0.35` with the comment naming `FACILITY_DEMOLITION_REFUND_FRACTION = 0.5` (exported at `tuning.ts:1613`). **Confirmed.**
- `grep -rni "bankrupt|insolven|gameOver"` across `src/core` (non-test): **0 hits** — supports "no bankruptcy".
- **WEAK:** the report says the only valuation-ish identifier is "`market.baseMarketValue` in `agents.ts`, a labor-market base". Not so: `baseMarketValue` is a **box-office market scale in currency** — generated once per world at `worldgen.ts:637-638` (`marketS.uniform(lo, hi)` from `WORLD_CONFIG.marketValueRange`), typed at `types.ts:280` (`baseMarketValue: number // currency`), and used as the leading factor of a film's opening at `reception.ts:698-704` (`opening = baseMarketValue * reachSum * …`) and as the awareness denominator at `standing.ts:121,154`; it also appears in `forecast.ts`, `filmPackage.ts`, `hollywoodTick.ts`, `save.ts`, `tick.ts`, not only `agents.ts`. The report's **conclusion** (it is not a per-person sale price and there is no studio valuation) still stands; only the description of what it is is wrong. Correct statement: "the only `marketValue`-named identifier is `market.baseMarketValue`, a per-world box-office scale constant (currency) that multiplies a release's opening gross; not a talent or studio valuation."

### C10 — Evidence-folder screenshots (SCREENSHOT, MEDIUM/LOW)
- `Screenshot 2026-08-17 at 11.39.16 AM.png`: HUD reads **Jan 1920**, **$145,000**; tutorial bubbles "This is your Staff Office…"; a scaffolded building under construction upper-right; captioned video frame (subtitle bar visible). **Confirmed.** The scaffolded building is *not labelled* in this frame, so "Stage School under construction" is an inference — but the next frame, `…11.39.30 AM.png` (uncited by the report), shows the same month at **$133,720** with the Facilities menu reading Casting Office "$5,000, 1 Owned", Crew Facility "$4,000, 1 Owned", Production Office "$6,000, 0 Owned", Stage School "$5,000, 1 Owned". 145,000 − 5,000 − 4,000 = 136,000; the remaining $2,280 gap is consistent with paving/salaries. This second frame strengthens the report's "$145k with Stage School already placed" reading and is worth adding.
- Caveat the report should state: this is the **tutorial**, which may pre-place buildings or use a scripted balance; it is not proof of a standard New Game constant. The report's MEDIUM (range) / LOW (constant) already reflects this.
- `Screenshot 2026-08-17 at 11.38.24 AM.png`: HUD **Jan 1953**, **$2,644,803**, "Game Paused"; Director card "50 years old / Annual Salary: $50,000 / Market Value: $63,073" (Bill Banner). **Confirmed** exactly. Google-image overlay glyph visible → web capture, as the report says.

### C11 — IMDb "century in debt" review (COMMUNITY)
- Fetched `imdb.com/title/tt0403324/reviews/`: review titled "Totally Addictive but Insanely Frustrating" present; verbatim: "The first time I restarted it was because I did so miserably in the strategy portion of the game that my studio spent a century being multi-millions in debt"; "I lost sleep trying to come up with strategies to save my studio from financial ruin"; "I only had three tiny sets to film on". No handle/date shown.
- **Nuance:** the reviewer *restarted* — the century in debt was a playthrough the player abandoned by choice. That still supports the report's point (the game let a multi-million deficit persist for ~a century without ending), but "while still playing" should be read as "the game continued; the player quit voluntarily." Tier (COMMUNITY) correct; the report does not over-weight it.
- **Verdict: CONFIRMED with nuance.**

### C12 — Contemporary/retrospective quotes
- forceforgood.co.uk (Rik, 2012-12-08): "you're not likely to lose money on a movie, even if it doesn't do as well as you'd hope, and as a consequence, capital never really seems to be an issue"; "it's pretty hard to screw things up badly". **Confirmed.**
- GameSpot review (Ryan Davis, 2005-11-09): "without a 'wrong' or a 'right' way" present; no debt/bankruptcy content. **Confirmed.**
- GameSpot walkthrough (Mathew Rorie, 2005-11-19): "relatively minor in comparison to what your actual movies bring in" (SSSF cash) present; no debt/game-over content; Certificate Three "$1,000,000 sitting in your bank account", Certificate Seven "$6,000,000". **Confirmed.**
- Eurogamer (2005-11-16, 8/10): "essentially a manufacturing business" present; no money/debt content. **Confirmed.**
- Award-threshold disagreement: Prima `:5088` "Amass at least $100,000 in funds" under Promising Studio Manager (p.79); Prima `:2461` "$500,000 cash in the bank" for the same award — this is printed **p.41** (between markers 40@`:2436` and 41@`:2507`), not p.42 as the report says; Mark `:806` "$1,000,000", `:843` "$8,000,000"; Prima `:5082` "$6,000,000". **Confirmed** (one page slip).

### C13 — Absence claims across all five extractions
- `grep -ci` loan / borrow / bankrupt / "game over" = 0 in manual.txt, prima.txt, gamefaqs-maxx.txt, gamefaqs-mark.txt, gamepressure-improving.txt. Prima "interest" (30 hits) are all genre/public/audience interest; Prima `bank` hits outside "in the bank/bank account" are only the Wild West: Bank and Urban: Modern Bank sets. Manual p.4 Sandbox "shoestring budget or a pile of cash" at `manual.txt:97` (PDF page 3 left = p.4). gamepressure `:32-33` "maintaining the high score will not allow us to make some serious investments early on." Bible §"Failure conditions (both modes)" (`…BIBLE.md:2864-2866`) is [INFERRED] as the report says; bible `:1960` carries the "5 million seems to be the limit" community claim; `ACTIVE-UNRESOLVED-QUESTIONS.csv` has Q010/Q037/Q042 as described.
- **Sandbox $100k/$1M/$10M/$100M:** I could not reach an underlying page either (GameFAQs and TV Tropes block fetch; a web-search synthesis repeats the four figures without a quotable source). The report's LOW-MEDIUM community label is the right ceiling; do not raise it.
- **Verdict: CONFIRMED.**

---

## Minor locator corrections (do not change any conclusion)

| Report says | Actual | Evidence |
|---|---|---|
| Manual "value of your studio lot" p.21 | **p.20** (left column under slug "Page 20") | `manual.txt:521`, col 5 |
| Prima Market Value "p.60-61" | **p.61** | `prima.txt:3826-3866` lie after marker 60@`:3805` |
| Prima Awards weight within "p.46-47" | Awards 14% heading is on **p.51** | `prima.txt:3182` |
| Prima "$500,000" award text p.42 | **p.41** | `prima.txt:2461`, before marker 41@`:2507` |
| `baseMarketValue` "in agents.ts, a labor-market base" | per-world **box-office scale (currency)**, used in reception/standing/forecast/filmPackage/worldgen | `reception.ts:698-704`, `worldgen.ts:637-638`, `types.ts:280` |

## Things the report could add (not errors)
1. Cite `Screenshot 2026-08-17 at 11.39.30 AM.png` ($133,720; Casting/Crew/Stage School each "1 Owned", Production Office "0 Owned") as the second data point behind the ≈$145–150k estimate, and state explicitly that both frames are from the **tutorial**, not a standard New Game.
2. Record the intra-Prima tension on the post-55 market-value decline ("precipitously", p.20 vs. "decreasing with every year", p.61).
3. Note that the IMDb reviewer restarted after the century in debt (voluntary quit, not a fail state).

## Tier audit
Every source I checked is placed in the correct tier: manual/Prima = retail-official/developer-reviewed; GameSpot review, walkthrough and Eurogamer review = contemporary professional; the three GameSpot 2002/2004 pieces and the Aug-2005 impressions = pre-release and never used as parity evidence; GameFAQs/gamepressure/forceforgood/IMDb/oldpcgaming = community. No pre-release feature is promoted to retail; every absence is phrased as "no inspected source establishes"; the one design reading (§1.5 soft lockout with recovery path) is labelled INFERENCE.

**Final verdict: VERIFIED WITH CAVEATS** — all consequential citations reproduce at source; caveats are cosmetic locator slips plus one mis-described code identifier whose conclusion survives.
