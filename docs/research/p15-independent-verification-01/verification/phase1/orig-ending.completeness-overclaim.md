# Verification memo: `phase1/orig-ending.md` — lens: COMPLETENESS & OVERCLAIM

Verifier: adversarial reader (not the author). Written 2026-09-11. READ-ONLY; nothing under any repository was touched; no player data opened. Scratch fetches were saved only under `scratchpad/verify-fetch/`.

**Verdict: VERIFIED WITH CAVEATS.** Every load-bearing factual claim I spot-checked (20 checks, 11 local and 9 web) reproduces from the underlying source. The problems are at the edges: two places where the report inverts the manual's Sandbox start-decade rule, a "new finding" that the project's own dataset already recorded, a "CORRECTED" verdict that does not actually resolve the open question it claims to correct, one date not present on the capture cited for it, a Sandbox "leaning present" inference that ignores a counter-signal in a source the report itself used, and several sources the prompt named (or the project's own registers list) that were never inspected.

---

## 1. Spot-checks performed

Method: re-read the plain-text extractions, confirmed page offsets with `pdftotext -f N -l N` on the Prima PDF (read-only), and re-fetched the Wayback/live pages the report cites with `curl` (Wayback went rate-limited/offline partway through, so a few web items are marked "not re-verified").

| # | Report claim | Source I checked | Result |
|---|---|---|---|
| 1 | Prima p.80 (PDF 81): playable past 2005, "reward-wise" ends there; 85 years tallied in Lifetime Honor; nothing for <9 Achievement Awards | `prima.txt` 5120–5147; `pdftotext -f 81` shows "LIFETIME HONORS ... play past the year 2005" with printed page number 80 | **CONFIRMED** (page offset verified) |
| 2 | Platinum: 13 per-award win counts (5/5/5/5/2/5/5/2/2/13/3/2/2); "earliest ... 1990 ceremony"; bonus credits from main menu | `prima.txt` 5148–5188 | **CONFIRMED** |
| 3 | Prima p.14 "three Lifetime Achievement awards" incl. "getting a studio to 2005" | `prima.txt` 768–790; `pdftotext -f 15` printed 14 | **CONFIRMED** |
| 4 | Prima p.98: Custom Scriptwriting Office instant in Sandbox; cross-save unlocks; full catalogue needs save to 2005 + Platinum | `prima.txt` 6225–6270; `pdftotext -f 99` printed 98 | **CONFIRMED** |
| 5 | Set catalogue: Starship Bridge 3 $56,618 "Gold Lifetime Achievement Honor" (p.23); Diner $58,804 "Platinum Lifetime Honor" (p.24) | `prima.txt` 1372–1408 | **CONFIRMED** |
| 6 | p.46 weights 24/24/(24)/14/14; p.77 "View Tally ... lifetime record of wins"; p.51 nine rivals, Booboo & Dingo 1967–1971; p.87 last unlock 1999; p.84 "After the 2005 ceremony, make a big film with the Diner set" | `prima.txt` 2805–2850, 4927–4938, 3196–3206, 5597–5603, 5428 | **CONFIRMED**. Note: the right-hand Movie-Making column's last entry is Ultimate Tech 1991; nothing in any column after 1999 |
| 7 | Manual pp.4–5 Sandbox options (seven items) | `manual.txt` 52–100 | **CONFIRMED verbatim** — but the manual says decades "30 years **beyond** what you have played"; see Finding B |
| 8 | Manual p.22: every five years; nine ranks from "Greenhorn"; prizes carry into Sandbox | `manual.txt` 540–578 | **CONFIRMED** |
| 9 | Maxx FAQ three-tier wording (PDF p.8) and Sandbox list (p.2) | `gamefaqs-maxx.txt` 145–175, 652–657 | **CONFIRMED** — wording is near-verbatim Prima p.14 (see Finding C) |
| 10 | Mark_E_1990: Sandbox "without any computer set objectives" | `gamefaqs-mark.txt` 323 | **CONFIRMED** |
| 11 | Lionhead FAQ (Nov 2005 capture): "Is there an ending in the game?" answer; Story Mode "till 2005 and beyond"; Sandbox unlocks tech "up to the year that your Sandbox game begins"; five genres; rival stars queue at Stage School | `verify-fetch/lionhead-faq-2005-11.txt` | **CONFIRMED verbatim**. Caveat: the whole page is future-tense promotional copy ("will be available this fall", "There'll be five main movie genres") — it was never rewritten post-ship |
| 12 | GameSpot E3 2002 First Look, Sam Parker, 05/21/02: "one way to grow is to acquire your competitors" | `verify-fetch/gs-2002.txt` | **CONFIRMED**, byline and POSTED date present |
| 13 | GameSpot preview, Andrew Park, 02/23/04: "at least until the studio goes bust"; "bigger, fatter contracts"; wealthy socialite; advisers (Adrian Moore); VHS/DVD royalties; ankle/first kiss; "about 100 years"; "early 21st century" | `verify-fetch/gs-2004.txt` | **CONFIRMED**, all quotes and byline/date present |
| 14 | GameSpot E3 2005 preshow: "won't be structured around a campaign game or any kind of story mode--it'll be a pure sandbox"; "and beyond" | `verify-fetch/gs-e3-2005.txt` | **CONFIRMED** text; **date NOT on capture** — the 2018 capture says "Last updated by Greg Kasavin on May 17, 2006" (see Finding E) |
| 15 | GameSpot 04/04/05, Jason Ocampo: "every seven-year period"; "unlimited amount of credit" | `verify-fetch/gs-apr2005.txt` | **CONFIRMED** |
| 16 | Eurogamer preview, Kristan Reed, 5/08/2003: auction stars online; Craven/Barrymore/Eastwood; "even the premiere event" | `verify-fetch/eg-2003.txt` | **CONFIRMED** |
| 17 | IGN review, Dan Adams, 8/10, Nov 2005: "nearly impossible to actually lose"; Sandbox options; "year 2000"; "extra options to keep the difficulty down" | `verify-fetch/ign-review.txt` (Nov 8, 2005; score 8) | **CONFIRMED** |
| 18 | GameSpot review, Ryan Davis, 8 Nov 2005: "less of a challenge and more of a suggestion"; "scale the amount of assistance"; five genres | `verify-fetch/gs-review.txt` | **CONFIRMED** — and the same review contains a Sandbox line the report omitted (Finding D) |
| 19 | IGN "The Movies Canned", 7 Feb 2006 | live IGN page (Jeremy Dunham; Activision Q3 call) | **CONFIRMED** |
| 20 | Code grep: "2040" only in comments at productionIdentity.ts:49, rng.ts:61, screenplay.ts:10–11, tuning.ts:1219–1236; "sandbox" once at ui/src/engine/session.ts:29 | grep of `accepted-592e926/src bridge ui/src/engine` | **CONFIRMED in substance**; enumeration incomplete — a fifth comment hit at `src/core/data/screenplay.ts:196` ("These read the same in 1920 and in 2040") is missed; tuning's 2040 is at line 1236 (the 2005-catalogue reference is at 1219). Bonus support the report did not cite: `src/core/blueprintRequirements.ts:65` literally says "Awards are not part of the game yet." |

Not re-verified by me (Wayback offline / site blocked when I tried): Eurogamer review (Gillen, 16 Nov 2005), Lionhead factsheet (Apr 2005), GameSpot 05/13/03, 05/19/03, 08/26/03, Molyneux Q&A 04/27/04, E3 2004 impressions, TV Tropes, Codex Gamicus, forceforgood.co.uk. None of these carries a load-bearing verdict on its own.

---

## 2. Findings — overclaims and misstatements

### A. "New finding" that is not new (overclaim of novelty)
§1.2 labels the Prima p.14 vs p.80 "three Lifetime Achievement awards" conflict a **"(new finding)"**. The project's own dataset already records exactly this: `THE-MOVIES-2005-ORIGINAL-DATA/lifetime_honors.csv`, Platinum row, notes column: "An earlier/different passage elsewhere in Prima's introductory summary describes 'three' Lifetime-Honor-granting conditions including merely reaching 2005 ... flagged as an internal Prima inconsistency, not silently resolved." The `RECONCILIATION-CHANGELOG.md` (line 107) likewise already states "a separate 2-tier Lifetime Honors system". The report's *resolution* (two rewarded tiers, MEDIUM) matches the dataset's precedence rule (specific chapter > summary). Corrected statement: "confirms the internal Prima conflict already logged in `lifetime_honors.csv`; adds the Maxx FAQ as a (probably derivative) echo."

### B. Sandbox start-decade rule inverted in two places (misstatement)
The manual (p.4, `manual.txt` 88–95) and the Maxx FAQ (`gamefaqs-maxx.txt` 149–150) both say Sandbox decades are limited to "**30 years beyond** what you have played/reached in New Game". §2.1 quotes this correctly. But §3 (row "Start in any time period...") says "only decades 30 years **behind** campaign progress", and §4 (last row) says "decades are selectable only up to 30 years **behind** campaign progress". "Behind" is the opposite direction and is not what either source says. The summary bullet ("only decades up to 30 years beyond New Game progress") is right; the two table cells are wrong and should be corrected to "up to 30 years beyond the point reached in New Game".

### C. "CORRECTED" verdict on the Sandbox starting-year range does not correct anything (overclaim)
§4 marks the mechanics bible's "Sandbox starting-year range UNRESOLVED (1920–2020 / 1920–2005 / decade list to 2000)" as **CORRECTED** on the basis of (i) the manual's 30-year rule and (ii) IGN's reviewer picking 2000. But the bible already quotes the manual's rule verbatim (Bible Sec.24, line 2486) and already lists a decade list ending at 2000 (themovies3d.com; and the source register's JPaterson FAQ 43496 entry: "Sandbox starting-year range '1930 and ending at 2000'"). The open question was the **upper bound** (is 2000 the last selectable decade, or does the ceiling keep rising to 2005/2020 with campaign progress?). The report does not answer that; it only re-attests that 2000 is selectable. Under the "30 years beyond progress" rule a player who has reached 2005 could in principle be offered 2030s decades — which the 2000-capped lists contradict — so the question is genuinely still open. Corrected statement: "NARROWED, not corrected: 2000 is attested as selectable (IGN review; JPaterson FAQ; themovies3d list); whether any decade after 2000 is ever offered remains unestablished." (Project file: `ACTIVE-UNRESOLVED-QUESTIONS.csv` Q018.)

### D. Sandbox rivals/charts "leaning present" rests on one clause and omits a counter-signal from a source the report used
§2.2's only positive evidence is IGN's "the same tycoon style play, but with extra options to keep the difficulty down." Against it the report has the manual's "without worrying about competing for awards" (dismissed as "framing") and Mark's "without any computer set objectives". It omits a third retail-era professional statement in the very GameSpot review it cites elsewhere: "the inclusion of a sandbox mode that lets you skip the 'game' part of The Movies almost entirely" (`verify-fetch/gs-review.txt` line 168). That line is ambiguous (objectives vs. simulation) but it is at least as relevant as the IGN clause and cuts the other way. Also unmentioned: the Lionhead FAQ's own label "Sandbox Mode (free play)". Corrected statement: "UNVERIFIED; no inspected source states rivals/charts/ceremonies are removed **or** retained in Sandbox; IGN implies the simulation persists, GameSpot implies the 'game' can be skipped." Drop the lean, or state it as the author's inference.

### E. E3 2005 preshow date is asserted but not on the cited capture
§3 and §7 date the Kasavin preshow report "05/18/05". The cited capture (`web.archive.org/web/20180604071305/...`) displays only "Last updated by Greg Kasavin on May 17, 2006". The May 2005 date is very plausible (it is an E3 2005 *preshow* piece and E3 2005 opened 18 May 2005), but the report presents a date its cited source does not show and does not flag GameSpot's known re-dating artefact. Corrected statement: "E3 2005 preshow report (GameSpot CMS shows a 2006 'last updated' stamp; original posting May 2005 inferred from the E3 2005 preshow framing)."

### F. Maxx FAQ treated as semi-independent corroboration of "three tiers"
§1.2 says the Maxx three-tier wording "may derive from in-game or pre-final text". The simpler explanation is that Maxx (guide started 12/20/2005, after Prima shipped) paraphrased Prima p.14: the FAQ's "running a studio into 2005, winning all nine ... by 2005, or winning all nine ... and winning each reward ceremony more than once" tracks Prima's sentence structure item for item. Treat Maxx as derivative, not as a second witness to a three-tier design.

### G. Minor precision items
- §1.2 equates the manual's "nine official ranks ... lowest rank of 'Greenhorn'" with Prima's nine Achievement Awards without noting the 9-vs-10 count tension the project already logs (`source_conflicts.csv` CONFLICT_017). Not wrong, but glossed.
- §3 "steal them away" row cites Prima p.8 for Stars leaving; p.8 covers *fired* Stars being "immediately hired by other studios". The voluntary-defection half is on Prima p.71 ("if Mood dips below this level for too long, the Star will get fed up and quit your studio", `prima.txt` 4540) and, per the project's source register, in the GameSpot retail walkthrough ("rival-studio poaching of unhappy Stars"). The PARTIAL verdict stands (contract bidding is absent), but the citation is the wrong page.
- §5 code note: "2040 appears only in comments" is true, but the file list is missing `src/core/data/screenplay.ts:196`.
- Lionhead FAQ row: "identical text in May 2005 and Nov 2005 captures" is presented as corroboration; it equally shows the page was never updated for retail. The report's own MEDIUM-as-retail-proof hedge is right; the summary bullet's bare "[HIGH as developer statement]" should carry that hedge too.

---

## 3. Findings — what the prompt asked that the report did not answer, or answered thinly

1. **Prompt item 4 named sources never inspected:** "IGN previews; ... PC Gamer; Lionhead press releases; Peter Molyneux interviews". The report's table is GameSpot-heavy (nine GameSpot items), plus one Eurogamer preview, the Lionhead FAQ/factsheet and one GameSpot-hosted Molyneux Q&A. No IGN preview, no PC Gamer, no Lionhead press release, no non-GameSpot Molyneux interview appears, and §0's method note lists only GameSpot/Eurogamer/Fandom/TV Tropes as having returned 403s — so the reader cannot tell whether IGN/PC Gamer were attempted. Consequence: the "Stock market / share trading — NOT CLAIMED" row and the "no 2003–2005 preview repeats [acquisition]" note in §3 are true only of the inspected set; the report hedges the former ("no inspected") but the latter reads as a general claim.
2. **Retail sources the project's own registers list but the report skipped:** (a) the GameSpot official retail walkthrough (`1100-6140049`, source register line 95, "DIRECTLY READ" by the project; per `source_conflicts.csv` it mentions a Sandbox "latest year" setting and rival poaching); (b) the JPaterson GameFAQs FAQ 43496 (source register line 81: full Sandbox toggle list and a decade list "1930 and ending at 2000"); (c) the *Stunts & Effects* expansion manual, which the P15 package itself cites as retail evidence against acquisition. The report's §4 "CONFIRMED" of the P15 acquisition refutation therefore rests on a narrower base than the P15 doc's own citation list; it should say so.
3. **Existing open questions not cross-referenced:** the project's `ACTIVE-UNRESOLVED-QUESTIONS.csv` already carries Q017 (do ceremonies keep firing past 2005; one uncorroborated secondary claim says they stop "after 2000") and Q018 (Sandbox year ceiling). The report's §6 items 1 and 4 restate these as if fresh and never mention the "stop after 2000" claim, which is the only contrary datum on record for the ceremony question.
4. **Prompt item 3, cash range:** answered only with a TV Tropes figure (LOW). The report should state plainly that no retail source gives the numeric bounds (it does so only obliquely in §6 item 4).
5. **Prompt item 1, "what happened at/after the 2005 ceremony":** the report establishes *reward* consequences but never says whether any source describes an on-screen presentation for the Lifetime Honor itself (message, certificate, trophy). It states no certificate is described (§1.3) — good — but does not close the loop by saying the manual is entirely silent on Lifetime Honors (grep of `manual.txt` for "lifetime": zero hits), which matters because it means Prima is the *sole* retail witness for the whole Lifetime tier.

---

## 4. Claims that hold as stated (strong)

- Prima p.80/81 Lifetime Honors structure, per-award Platinum counts, Gold/Platinum set rewards and bonus credits — verbatim, page offsets verified.
- Prima p.98 Sandbox unlock rules — verbatim.
- Manual pp.4–5 Sandbox option list — verbatim (subject to Finding B on the decade rule).
- Content horizon: last research-pack unlock 1999 (p.87), award roster complete by 1975 (p.77–78), last rival 1967–1971 (p.51) — all verified.
- Absence claims (no ending screen / final score / retrospective in inspected sources) — I found nothing contrary in Prima, manual, either FAQ, or the two reviews.
- All four GameSpot pre-release quotes (2002 acquisition; 2004 "goes bust"/contracts/socialite/advisers/royalties/ankle-kiss; 2005 seven-year/unlimited credit; E3 2005 "pure sandbox") and the Eurogamer 2003 quotes — verbatim on the captures.
- IGN and GameSpot retail-review quotes — verbatim, dates and score confirmed.
- §4 restatement of the P15 package's prior claims — accurate to `P15-PACKAGE.md` §5.5–5.6 and §6.
- Code note — substantively correct (no finale/Lifetime/Sandbox implementation; `blueprintRequirements.ts:65` even says "Awards are not part of the game yet").

---

## 5. Recommended corrections (surgical)

1. §1.2: replace "(new finding)" with "(already logged in `lifetime_honors.csv`; confirmed)"; add that Maxx's wording is derivative of Prima p.14.
2. §3 row "Start in any time period" and §4 last row: change "behind" to "beyond"; change §4's "CORRECTED" to "NARROWED — upper bound still open (Q018)"; cite JPaterson 43496 and themovies3d for the 2000-terminated decade list.
3. §2.2: add the GameSpot review's "skip the 'game' part ... almost entirely" line and the Lionhead FAQ's "(free play)" label; downgrade "leaning present" to plain UNVERIFIED or label it as inference.
4. §3/§7: annotate the E3 2005 preshow date as inferred (capture shows a 2006 CMS stamp).
5. §3 "steal them away" row: cite Prima p.71 for voluntary defection; note the GameSpot walkthrough as an uninspected retail source that reportedly corroborates poaching.
6. §0 or §6: state explicitly that IGN previews, PC Gamer, Lionhead press releases, the GameSpot retail walkthrough, JPaterson's FAQ and the S&E manual were not inspected, and scope "NOT CLAIMED"/"no 2003–2005 preview repeats it" accordingly.
7. §5: add `src/core/data/screenplay.ts:196` to the 2040-comment list; fix tuning.ts line reference (2040 is at 1236).
8. §6: cross-reference Q017/Q018 and mention the "ceremonies stop after 2000" secondary claim as the only contrary datum.
