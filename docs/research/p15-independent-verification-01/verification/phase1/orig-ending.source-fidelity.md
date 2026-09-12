# Source-fidelity verification: `phase1/orig-ending.md`

Adversarial verifier, lens = SOURCE FIDELITY. Written 2026-09-11. READ-ONLY: no repository, PDF, or player data was modified; the only writes are this memo and throwaway HTML fetches under `scratchpad/verify-fetch/`.

Report under test: `<scratchpad>/out/phase1/orig-ending.md`

Method: for each selected claim I went to the cited source myself, not to the report's paraphrase. Local sources were checked by grepping the plain-text extractions (`scratchpad/original-text/*.txt`) and then re-extracting the exact PDF page with `pdftotext -f N -l N -layout` on the read-only PDFs in `/Users/bruce/Desktop/big swing art/` to confirm printed-vs-PDF page mapping. Web sources were fetched as raw Wayback `id_` captures (or the live IGN page) with curl, stripped of markup, and searched for the quoted strings; where available I also read the page's `datePublished` metadata to check the report's dates. Code claims were re-grepped in `scratchpad/accepted-592e926/`.

Verdict summary: **VERIFIED WITH CAVEATS.** Every one of the 14 citations I re-derived reproduces at the cited location with the cited wording, and every source-tier label I checked is correct. The caveats are (a) one imprecise page citation (Studio Rating weights), (b) one paraphrase that flips a word in the manual ("beyond" rendered as "behind" in two places), (c) one internal Prima contradiction the report did not catch (Most Prestigious Studio Lot: "five times" on p.45 vs "13" on p.81), (d) a nuance on the Lionhead FAQ ("retained post-ship" is a never-updated page, not a post-ship reaffirmation), and (e) an incomplete enumeration of the code-comment hits. None of these overturn a finding.

---

## 1. Claim-by-claim checks

Confidence key: CONFIRMED = I reproduced the exact wording at the exact cited location; CONFIRMED-IMPRECISE = substance right, citation off; WEAK = could not reproduce as stated.

### C1. Prima p.80 (PDF 81): playable past 2005, "reward-wise" ends, 85 years tallied in Lifetime Honor. Report tier: PRIMA, HIGH.

- Evidence: `prima.txt` lines 5120-5123 contain "LIFETIME HONORS / Though you can play past the year 2005, the game, reward-wise, ends there. What you've done with your 85 years of film history is tallied up in your Lifetime Honor."
- Page check: `pdftotext -f 81 -l 81` of `The_Movies_Prima_Official_eGuide.pdf` reproduces the same lines, and the page footer on that PDF page reads "80". Printed 80 = PDF 81, exactly as the report states.
- "Nothing" tier: PDF 81 also carries "If you complete the 2005 awards ceremony without earning all nine Achievement Awards, you get, well, nothing."
- Tier check: Prima is a licensed retail guide; the Awards chapter credits "Tim Spencer of Lionhead" on printed p.81 (PDF 82, line 28 of the page extraction). PRIMA tier and HIGH are correct.
- Result: **CONFIRMED.**

### C2. Lionhead FAQ "Is there an ending in the game?" identical in May and Nov 2005 captures. Report tier: OFFICIAL DEVELOPER STATEMENT (pre-ship, retained post-ship), HIGH as design statement / MEDIUM as retail proof.

- Fetched `web.archive.org/web/20050513205123id_/http://www.lionhead.com/themovies/faq.html` (37 KB) and `.../20051126100150id_/...` (37 KB). After tag-stripping, the two texts are 23,140 vs 23,139 characters.
- Both carry, verbatim: "The game starts in the early 1920s and will go on until 2005. But the game won't stop there, as you can keep playing for as long as you like with all of the game's technology unlocked and available to you to play around with." The "What game modes will be available?" entry ("Story Mode ... from the early 1920s till 2005 and beyond"; Sandbox "choose which decade ... unlock all of the technology and sets that are available up to the year that your Sandbox game begins") is byte-identical across the two captures (330-char window compare = True), as is the Competition entry ("the competition can become intense").
- Nuance the report does not state: the November capture still says "The Movies will be available this fall for Windows" and still opens with "with new features being implemented all the time, this FAQ will be subject to change". The page was simply never updated after ship. "Retained post-ship" is literally true but should not be read as Lionhead re-affirming the text after release. The report's MEDIUM-as-retail-proof grade already absorbs this; I would add the wording explicitly.
- Result: **CONFIRMED**, with the stale-page caveat.

### C3. Lifetime Honor tiers, rewards, set-catalogue entries and prices (Gold = 9 awards -> Starship Bridge 3 $56,618, Prima p.23; Platinum = 9 + 13 counts -> Diner $58,804 + bonus credits, p.24, p.80-81). Report tier: PRIMA, HIGH.

- `prima.txt` 5130-5147: Gold paragraph ("all nine Achievement Awards by the end of the 2005 ceremony ... Sci-Fi: Starship Bridge 3 set"); Platinum paragraph ("won every ceremony award a designated number of times each, you earn the Suburban: Diner set and a special, otherwise unavailable credits sequence ... go the game's main menu and select Credits").
- Per-award counts: PDF 82 (printed 81) lists exactly the 13 values the report gives (Best Acting Performance 5, Best Direction 5, Best Employer 5, Highest Charting Movie 5, Highest Charting Newcomer 2, Highest Charting Star 5, Highest Charting Studio 5, Highest Climbing Star 2, Highest Climbing Studio 2, Most Prestigious Studio Lot 13, Most Prolific Star 3, Most Prolific Studio 2, Movie Quality Output 2). "The earliest you can hope to nab this award is the 1990 awards ceremony" is on the same page.
- Set catalogue: `prima.txt` 1372-1377 "Sci-Fi: Starship Bridge 3 / Cost: $56,618 / Available: Gold Lifetime Achievement Honor", page marker "23" at line 1385. Lines 1400-1405 "Suburban: Diner / Cost: $58,804 / Available: Platinum Lifetime Honor", page marker "24" at line 1438.
- Result: **CONFIRMED.** (But see C4b for a count contradiction elsewhere in Prima.)

### C4a. Prima p.14 says "three Lifetime Achievement awards" including one for "getting a studio to 2005"; Maxx GameFAQs FAQ p.8 repeats it. Report grade: MEDIUM that only two rewarded tiers exist.

- `prima.txt` 768-787 (page marker "14" at line 789): "you may be eligible for one of the three Lifetime Achievement awards. Winning each of these unlocks a coveted set. Awards are granted for getting a studio to 2005, winning all nine Achievement Awards by 2005, or winning all nine Achievement Awards and winning each award ceremony award multiple times."
- `gamefaqs-maxx.txt` 652-657, on the page whose footer reads "8/30": "There are three of these ... for running a studio into 2005, winning all nine ... or winning all nine ... and winning each reward ceremony more than once." Maxx's own set list (lines 1109, 1124) names only "Gold Lifetime Achievement Honor Award" and "Platinum Lifetime Honor Award" sets, which supports the report's two-rewarded-tiers reading.
- Result: **CONFIRMED**, and the MEDIUM grade is appropriate. Prima p.74 (line 4699) additionally says Star rating "Earns you various levels of Lifetime Achievement awards", which is consistent with either reading.

### C4b. NEW: a second internal Prima contradiction the report missed.

- `prima.txt` 2783-2784, page marker "45" at line 2789; re-extracted from PDF 46: "To gain the Platinum Lifetime Achievement Honor, you must win Most Prestigious Studio Lot five times." The Awards chapter table (p.81) says 13.
- Impact: the report presents the 13-count table as unambiguous HIGH. The p.81 table is the detailed, Lionhead-credited source and should still win, but the report should record that Prima contradicts itself on this figure (5 vs 13), the same way it records the p.14 three-tier conflict. This matters for P15 if the "13 = near-every-ceremony attrition" figure is used as a design reference.
- Result: **MISSING ITEM.**

### C5. Studio Rating composite weights "Prima p.46 weights 24/24/24/14/14"; "View Tally" lifetime record p.77. Report tier: PRIMA, HIGH.

- Weights actually appear across three pages: Movies 24%, Stars 24%, Capital 24% on printed p.46 (PDF 47, extraction lines 25, 59, 61, footer "46"); Lot Prestige 14% on printed p.47 (PDF 48, line 27 "14% of Studio Rating" under "Lot Prestige"); Awards 14% on printed p.51 (`prima.txt` 3181-3182, between page markers 50 at 3146 and 51 at 3209). p.46 does contain the sentence "Movies accounts for 24 percent of Studio rating and Lot Prestige for only 14 percent", which is probably what the author relied on.
- "View Tally": `prima.txt` 4927-4930 "Press the View Tally button to see your studio's lifetime record of wins" and 4946 "To see your lifetime awards collection, click the View Tally button", between page markers 76 (line 4876) and 77 (line 4945) -> p.77. Confirmed. "Award certificates display the requirements for the achievement and the reward" is also on p.77 (line 4949).
- Result: **CONFIRMED-IMPRECISE.** The five weights sum to 100 and are correctly stated, but citing "p.46" for all five is wrong; the correct citation is pp.46, 47 and 51.

### C6. Content stops before the horizon: last research unlock 1999 (p.87); award categories stop growing after 1975 (p.77-78); last rival 1967-1971 (p.51). Report tier: PRIMA, HIGH.

- Research chain table: `prima.txt` 5563-5604 (page markers 86 at 5561, 87 at 5618). Final row "1999 — — — — Late 1990s Costumes 1986 (2)". No row after 1999. Confirmed.
- Awards: p.77 "the first ceremony hands out only three of the coveted trophies"; p.78 (line 4947-4948, immediately after the p.77 footer) "Thereafter, a new award is added each award year through 1975." The report's "p.77-78" is right; the operative sentence is on p.78. p.77 also has "every five years beginning in 1925". Confirmed.
- Rivals: `prima.txt` 3196-3207 Rival Studios table, footer 51 at line 3209. Nine rows; last is "Booboo & Dingo Films 1967-1971". Four rows have pre-1920 windows (Old Rope, Maxipack, Lionear, Creamboat) and five are later, matching the report's "four pre-1920 plus five later". Confirmed.
- Result: **CONFIRMED.**

### C7. IGN (Dan Adams, 8/10) "nearly impossible to actually lose"; GameSpot (Ryan Davis, 8 Nov 2005) "less of a challenge and more of a suggestion". Report tier: CONTEMPORARY PROFESSIONAL, HIGH.

- IGN live page `ign.com/articles/the-movies` (curl, 266 KB): byline "By Dan Adams", score block "The Movies | 8 | ... great", `datePublished` metadata `2005-11-09T06:35:00Z`. Text contains "it's nearly impossible to actually lose, though it's not guaranteed that you'll actually win", "The trick is not to care that your studio isn't at the top of the charts", and the sandbox sentence "the same tycoon style play, but with extra options to keep the difficulty down". Also the sandbox option list ("buildings instantly constructed, to turn building decay off, keep stars from misbehaving, set as much money as they want, and even start with a ready-built lot ... even if you select to start your game in the year 2000"). All quoted lines reproduce.
- GameSpot Wayback `20140306013705id_/.../1900-6139475/`: "Ryan Davis", "Reviewed: November 8, 2005", and "as less of a challenge and more of a suggestion, the free-form (or so-called 'sandbox') nature of The Movies means you can go about your business however you see fit, without a 'wrong' or a 'right' way." The "scale the amount of assistance" line and the five-genre list (action, comedy, romance, sci-fi, horror) also reproduce.
- Result: **CONFIRMED**, tiers correct.

### C8. Manual pp.4-5 (PDF 3) Sandbox options and the "30 years" start-decade rule. Report tier: RETAIL SHIPPED MECHANIC, HIGH.

- `pdftotext -f 3 -l 3` of `movies manual_english.pdf` opens with the QXP slug "Page 4" and contains the Sandbox block; `manual.txt` 84-104 lists Game Start, Starting Money ("shoestring budget or a pile of cash"), Instant Movie-making ("still need to be cast and staffed"), Instantly Constructed Buildings; lines 54-61 (same spread) list Stars Don't Misbehave ("whether their moods will change"), Buildings Don't Decay, Start with a Ready Built Studio Lot. All seven options confirmed on the pp.4-5 spread = PDF page 3.
- The 30-year rule, verbatim: "Note when in Sandbox mode, you can only choose decades 30 years **beyond** what you have played in the New Game section of the game." Maxx (`gamefaqs-maxx.txt` 149-150): "decades thirty years **beyond** what you've reached in your New Game."
- Paraphrase drift: the report's §2.1 table quotes "beyond" correctly and the summary bullet says "up to 30 years beyond", but §3 (row "Start in any time period...") and §4 (last row) render the rule as "30 years **behind** campaign progress". The manual never says "behind"; its phrasing is ambiguous (read literally it says the opposite). The report should quote the manual and mark the meaning as unclear rather than silently resolving it.
- Manual p.22 = PDF 12: "Every five years an awards ceremony takes place"; "nine official ranks of studio owner ... lowest rank of 'Greenhorn'"; "Each special prize unlocked in New Game mode will also become available for you to use in Sandbox mode." Confirmed. Manual p.6 (PDF 4): "Your balance can go into the red but when you're in debt, you won't be able to build new sets or add certain facilities". Confirmed.
- Result: **CONFIRMED** for the options; **WEAK paraphrase** on the direction of the 30-year rule.

### C9. Prima p.98 Sandbox unlock rules (Custom Scriptwriting Office instant; campaign unlocks carry over; full content needs a 2005 Platinum save). Report tier: PRIMA, HIGH.

- `prima.txt` 6232-6268, page marker 98 at line 6271: "In Sandbox games, if an asset has been unlocked in any saved simulation game, it's available in the Sandbox regardless of the date." "The only exception is the Custom Scriptwriting Office, which is unlocked immediately in any Sandbox game." "To make movies using the entire selection of sets, costumes, etc., you must have a saved simulation that's been played through to 2005 and have won the Platinum Lifetime Honor." Also "When you reach the year of an asset's scheduled unlock ... it becomes available in the current game (whether Sandbox or simulation)."
- Result: **CONFIRMED.**

### C10. GameSpot E3 2002 First Look (Sam Parker, 05/21/02): "one way to grow is to acquire your competitors". Report tier: PRE-RELEASE PROMISE, HIGH; retail ABSENT.

- Fetched `20050903180417id_/http://www.gamespot.com/pc/strategy/movies/news_2866856.html`. Text: "Competition from other studios raises the stakes for success, and one way to grow is to acquire your competitors." Byline "Sam Parker, GameSpot, POSTED: 05/21/02 06:57 PM". The same paragraph carries "when it comes time to hand out Academy Awards".
- Retail-absence check: grep of `prima.txt`, `manual.txt`, both GameFAQs texts and the gamepressure text for acquire/merger/takeover/bust/bankrupt/game over/ending finds nothing game-level (the only "final score" hit, Prima line 2675, is a movie's score). Eurogamer's review (below) wishes for "deal-making". Absence correctly labelled as absence of evidence.
- Result: **CONFIRMED**, tier correct.

### C11. GameSpot 02/23/04 preview (Andrew Park): "at least until the studio goes bust", "bigger, fatter contracts", "steal them away", socialite challenge, advisers (Adrian Moore), VHS/DVD royalties, "about 100 years", "early 21st century", ankle/first-kiss. Report tier: PRE-RELEASE PROMISE.

- Fetched `20040224185122id_/http://www.gamespot.com/pc/strategy/movies/preview_6089840.html`. Every quoted string reproduces: "keeps track of time and any milestones your movies may have reached, at least until the studio goes bust"; "rival studios may even try to steal them away from you"; "offering bigger, fatter contracts to up-and-coming stars"; "A wealthy socialite might offer you a pile of money to make a movie starring his talentless, spoiled-brat daughter"; "According to designer Adrian Moore, these advisers will let you focus"; "further royalties on it with eventual VHS and DVD rereleases"; "starting in any time period between the early 20th century and the early 21st century. You'll have about 100 years"; "having a female star show a bit of ankle might lead to highly negative reviews ... first onscreen kiss will earn your studio fame". Byline "Andrew Park, GameSpot [POSTED: 02/23/04 03:07 PM]".
- Retail PARTIAL for star defection: Prima p.8 (`prima.txt` 280, page marker 7 at line 274 so this is p.8) "They wander off the lot and are immediately hired by other studios"; Lionhead FAQ "Movie stars from rival studios who want to work for you will queue up outside your Stage School". Confirmed.
- Result: **CONFIRMED**, tier correct.

### C12. GameSpot E3 2005 preshow (Greg Kasavin, 05/18/05): "won't be structured around a campaign game or any kind of story mode--it'll be a pure sandbox". Report: CORRECTED by retail.

- Fetched `20180604071305id_/https://www.gamespot.com/articles/the-movies-e3-2005-preshow-report/1100-6123900/`. Text reproduces exactly, including "all the way up to current-day blockbusters, and beyond". The visible byline on this migrated page reads "Last updated by Greg Kasavin on May 17, 2006", but the page's JSON-LD carries `datePublished: 2005-05-18T00:01:00Z`, so the report's 05/18/05 is right.
- Retail Story Mode: manual p.22 nine ranks, Lionhead FAQ "Story Mode and a Sandbox Mode", Prima p.79 "Achievement Awards must be completed in order" (line 5050, between markers 78 and 79). CORRECTED verdict stands.
- Result: **CONFIRMED.**

### C13. GameSpot 04/04/05 (Jason Ocampo): awards "every seven-year period"; "unlimited amount of credit". Report: CORRECTED / QUALIFIED.

- Fetched `20050409021326id_/http://www.gamespot.com/pc/strategy/movies/preview_6121588.html`. "The game will evaluate the movies made in every seven-year period, and it will dish out awards"; "you'll be given an unlimited amount of credit to run your studio in The Movies". Byline "Jason Ocampo, GameSpot, POSTED: 04/04/05 04:05 PM".
- Retail: five-year cycle (manual p.22, Prima p.77); debt allowed but build-restricted (manual p.6; Prima p.14 "Building in Debt" exceptions list at `prima.txt` 770-778). Confirmed.
- Result: **CONFIRMED.**

### C14. Eurogamer preview (Kristan Reed, 5 Aug 2003): online star auctions, real-life talent, premiere control; GameSpot 08/26/03 (Justin Calvert): "eight genres", "will not feature real names". Retail: in-game Star & Script Selling only (Prima p.8, p.20).

- Fetched `20110827084727id_/http://www.eurogamer.net/articles/p_themovies_pc`: "by Kristan Reed 5/08/2003"; "build up their stars and auction them off online"; "the hiring and firing of real life directors, cast and crew; control over the set and even the premiere event"; the Craven/Barrymore/Eastwood names appear in the writer's illustrative scenario ("Suppose you've assembled..."). Confirmed as Eurogamer's pre-release claim.
- Fetched `20030828061716id_/.../preview_6074062.html`: "selecting one of eight genres"; "the retail version of the game will not feature real names"; "Justin Calvert, GameSpot [POSTED: 08/26/03]". Confirmed.
- Retail: `prima.txt` 282-283 (p.8) "build a Star & Script Selling Facility and auction the Star off to your competitors. The value is based on the Star's rating"; lines 1168-1178 (p.20 per marker at 1193) facility entry. The only "premiere" in Prima is line 7643 "Have fun at the premiere." Confirmed.
- Eurogamer review: fetched `20090124172844id_/.../r_themovies_pc`: "by Kieron Gillen 16 November, 2005", score "8 /10", "the regular Oscars-styled ceremony where all the different companies compete", "a harder business management game (to get the sense of deal-making)". Confirmed.
- Result: **CONFIRMED.**

### C15. Code snapshot 592e926: no finale/Lifetime/Sandbox/post-horizon implementation; "2040" only in comments; "sandbox" once in `ui/src/engine/session.ts:29`. Report grade: MEDIUM, grep-level.

- Re-grep of `src bridge ui/src/engine`: "2040" hits at `src/core/tuning.ts:1236`, `src/core/productionIdentity.ts:49`, `src/core/screenplay.ts:11`, `src/core/rng.ts:61`, `src/core/data/screenplay.ts:196`. All five are inside `//` or `/** */` comments (inspected). The report names three of them (and cites tuning.ts:1219-1236 separately for the 2005-catalogue comment) and omits `src/core/data/screenplay.ts:196`. "sandbox": exactly one hit, `ui/src/engine/session.ts:29`, in a comment about localStorage. Case-insensitive grep for "lifetime honor", "finale", "platinum", "post-horizon", "endgame" finds nothing in `src/core`; the only "campaign ended" hits are harness comments about snapshot padding.
- Result: **CONFIRMED**, with an incomplete enumeration (5 comment hits, not 3). Substance unchanged.

### C16. Lionhead factsheet (captured 2005-04-09): "present day and beyond in Story Mode", "Over 30 hours of continuous gameplay".

- Fetched `20050409005953id_/http://www.lionhead.com/themovies/factsheet.htm`: "run it from the early days of cinema through present day and beyond in Story Mode"; "Over 30 hours of continuous gameplay". Note the same factsheet says of Sandbox "you can jump into any era", which sits alongside (and is less specific than) the manual's 30-year rule. Confirmed.

---

## 2. Tier-assignment audit

| Source | Report tier | Verifier view |
|---|---|---|
| Prima guide | PRIMA / RETAIL | Correct. Licensed retail guide with a named Lionhead contributor (p.81). |
| PC manual (QXP dated 9/27/05) | RETAIL SHIPPED MECHANIC | Correct. |
| Lionhead FAQ / factsheet (Wayback) | OFFICIAL DEVELOPER STATEMENT, pre-ship retained post-ship | Correct label; add that the page was never updated ("this fall", "subject to change" persist in the Nov 2005 capture). |
| IGN, GameSpot, Eurogamer reviews | CONTEMPORARY PROFESSIONAL | Correct; dates verified (IGN 2005-11-09 metadata; GameSpot "Reviewed: November 8, 2005"; Eurogamer 16 Nov 2005). |
| GameSpot 2002-2005 previews, Eurogamer 2003 preview | PRE-RELEASE PROMISE | Correct; none promoted to retail parity. |
| GameFAQs Maxx / Mark_E_1990 | retail walkthrough | Correct; the report uses them only for corroboration. |
| forceforgood, Codex Gamicus, TV Tropes | COMMUNITY INFERENCE, LOW | Correct labelling; not re-fetched (low consequence). |

No pre-release feature was promoted into retail parity anywhere in the report. Absence claims are phrased as "no inspected source", which is the required form, and my own greps of the five retail extractions for ending/game-over/bankruptcy/acquisition language came back empty, supporting them.

---

## 3. Findings

### Confirmed strong claims
1. Prima p.80 (PDF 81): "Though you can play past the year 2005, the game, reward-wise, ends there ... 85 years ... Lifetime Honor" — exact.
2. Lionhead FAQ "Is there an ending" and "game modes" entries identical in the 2005-05-13 and 2005-11-26 captures — exact.
3. Gold/Platinum requirements, rewards, set prices and catalogue pages (p.23 $56,618; p.24 $58,804; p.80-81 counts; bonus credits from main menu) — exact.
4. Prima p.14 three-tier wording and Maxx p.8 repetition — exact.
5. Last research unlock 1999 (p.87); new award each ceremony through 1975 (p.77-78); nine rivals, last 1967-1971 (p.51) — exact.
6. Manual pp.4-5 (PDF 3) seven Sandbox options; manual p.22 (PDF 12) five-year ceremony and nine ranks; manual p.6 debt rule — exact.
7. Prima p.98 Sandbox unlock rules — exact.
8. IGN "nearly impossible to actually lose" (Dan Adams, 8, published 2005-11-09) and GameSpot "less of a challenge and more of a suggestion" (Ryan Davis, 8 Nov 2005) — exact.
9. GameSpot E3 2002 "one way to grow is to acquire your competitors" (Sam Parker, 05/21/02) — exact.
10. GameSpot 02/23/04 (Andrew Park): "goes bust", "fatter contracts", socialite, advisers, VHS/DVD, "about 100 years", ankle/kiss — all exact.
11. GameSpot E3 2005 "pure sandbox" (Kasavin; datePublished 2005-05-18) and 04/04/05 "seven-year period" / "unlimited amount of credit" (Ocampo) — exact.
12. Eurogamer 2003 preview (Reed, 5/08/2003) auction/real-names/premiere; GameSpot 08/26/03 "eight genres" and "will not feature real names"; Eurogamer review (Gillen, 16 Nov 2005, 8/10) "deal-making" — exact.
13. Prima p.8 "auction the Star off to your competitors" and p.20 Star & Script Selling Facility — exact.
14. Code snapshot: no finale/Lifetime/Sandbox implementation; every "2040" hit is a comment; single "sandbox" hit is a storage comment — reproduced.

### Refuted or weak claims (none refuted; three weak)
- W1. "Prima p.46 weights 24/24/24/14/14": the 24% weights are on p.46, Lot Prestige 14% is on p.47, Awards 14% is on p.51. Corrected statement: "Studio Rating = Movies 24 + Stars 24 + Capital 24 (Prima p.46, PDF 47) + Lot Prestige 14 (p.47, PDF 48) + Awards 14 (p.51, PDF 52)."
- W2. "Decades selectable only up to 30 years behind campaign progress" (report §3 and §4): the manual (p.4) and Maxx (p.2) both say "beyond", not "behind". Corrected statement: quote the manual verbatim and flag the direction of the rule as ambiguous in the source; do not resolve it silently.
- W3. "'2040' appears only in comments (productionIdentity.ts:49, rng.ts:61, screenplay.ts:10-11)": the conclusion holds but there are five comment hits, adding `src/core/tuning.ts:1236` and `src/core/data/screenplay.ts:196`.

### Missing items
- M1. Prima contradicts itself on the Platinum "Most Prestigious Studio Lot" count: p.45 (PDF 46) says "five times", p.81 says 13. The report flags the p.14/p.80 three-vs-two-tier conflict but not this one. The p.81 table (Lionhead-credited) remains the better source, but the 13 should carry the same "internal Prima conflict" note.
- M2. The Lionhead FAQ's November 2005 capture still reads "will be available this fall" and "this FAQ will be subject to change" — the page is stale, not re-affirmed. Worth one sentence next to the "retained post-ship" label.
- M3. The Lionhead factsheet says Sandbox lets you "jump into any era", which the report cites for Story Mode but does not reconcile with the manual's 30-year start-decade rule (a second, official, looser statement of the Sandbox start range).

---

## 4. Verdict

**VERIFIED WITH CAVEATS.** All fourteen consequential citations reproduce at the cited page, line, or URL with the quoted wording, the printed-vs-PDF page mapping for both PDFs is correct, the review and preview dates check against page metadata, and every source tier is assigned correctly. The caveats are citation precision (W1), a paraphrase that reverses a word in the manual (W2), an incomplete grep enumeration (W3), one missed intra-Prima contradiction (M1), and two small nuances on the official Lionhead pages (M2, M3). No headline conclusion of the report changes.

Files fetched for this check (throwaway, scratchpad only): `scratchpad/verify-fetch/lionhead-faq-20050513.html`, `lionhead-faq-20051126.html`, `lionhead-factsheet.html`, `gs-e3-2002.html`, `gs-aug-2003.html`, `gs-feb-2004.html`, `gs-apr-2005.html`, `gs-e3-2005.html`, `gs-review.html`, `ign-review.html`, `eg-preview-2003.html`, `eg-review-2005.html`.
