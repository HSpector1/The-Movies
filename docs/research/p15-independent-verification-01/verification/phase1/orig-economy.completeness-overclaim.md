# Verification memo — `orig-economy.md` (Original *The Movies* economy/debt/failure/selling/valuation)

**Lens:** COMPLETENESS & OVERCLAIM (adversarial)
**Verifier:** independent, read-only
**Date:** 2026-09-11
**Report under review:** `scratchpad/out/phase1/orig-economy.md`
**Verdict:** **VERIFIED WITH CAVEATS** — the load-bearing retail claims survive spot-checking against the primary texts; the weaknesses are (a) sources the prompt named that the author did not reach although an archive route existed, (b) a game-data register the author admits skipping that both corroborates and extends the findings, (c) one economic metric the original *did* track that the report says did not exist in any form, and (d) a handful of minor tier/attribution slips.

---

## 1. Method

I re-read the topic prompt, then spot-checked 20 claims directly against `original-text/manual.txt`, `original-text/prima.txt`, the two GameFAQs extractions, gamepressure, the evidence-folder screenshots, the technical-artifact and original-data CSV registers, the accepted code at `accepted-592e926/`, and live/archived web copies of GameSpot (four articles), IGN (Wayback), GameSpy (Wayback), forceforgood, IMDb and Wikipedia. Nothing under any git repository was touched; no campaign/profile data was opened. Fetched web text was cached under `out/phase1-verify/tmp-econ/`.

---

## 2. Spot-checks — claims that HOLD

| # | Report claim | Where I checked | Result |
|---|---|---|---|
| 1 | Manual p.6: balance can go into the red; in debt you cannot build new sets or "certain facilities and lot ornamentation"; nothing else stated | `manual.txt:129-130` | **Holds verbatim.** No "game over / bankrupt / lose" hits anywhere in `manual.txt`. |
| 2 | Prima p.14 exception list: Casting Office, Crew Facility, Production Office, Basic Script Office, Stage School, Stage Set, Star & Script Selling Facility | `prima.txt:769-776` | **Holds verbatim.** |
| 3 | 71 `Build in Debt` flags = 7 Yes / 64 No, and the seven Yes match the p.14 list | `grep -o` over `prima.txt` (line-count grep undercounts because of two-column layout) → 64 No + 7 Yes; Yes flags at lines 833 (Casting), 910 (Crew), 940 (Production), 1112 (Script Basic), 1124 (Stage School), 1177 (SSSF), 1397 (Stage set) | **Holds exactly.** |
| 4 | Studio Rating = Capital 24 / Movies 24 / Stars 24 / Lot Prestige 14 / Awards 14; Capital = cash in bank "at any given time"; scale $50,000–$1,600,000; 50% point ≈ $300,000; "keep more than $1,600,000 in the bank at all times" | `prima.txt:2793-2856, 2889, 3182` | **Holds.** (See caveat C2 on the "$775,000 misprint" wording.) |
| 5 | Market Value = f(Star rating, actual age); climbs, declines from 55; retirement at 70; 8-year tenure for full value; "only important if you intend to make cash by selling" | `prima.txt:1189-1199` (p.20-21), `3826-3866` (p.60-61) | **Holds.** |
| 6 | Sell Building icon: "permanently demolish… recoup a depreciated portion of its original purchase price"; debris depresses Attractiveness | `prima.txt:458-465` (p.10); Maxx `gamefaqs-maxx.txt:390-394` | **Holds.** |
| 7 | Prima tip: sell five Small Restrooms per Large built | `prima.txt:1086-1087` | **Holds verbatim.** |
| 8 | Custom Scriptwriting Office $11,111 (profile) vs $35,000 (AMM chapter) internal conflict | `prima.txt:863` vs `6251` | **Holds.** |
| 9 | Award cash-threshold conflict: Promising Studio Manager $100,000 (p.79) vs $500,000 (p.42) | `prima.txt:5088` vs `2461` | **Holds.** |
| 10 | GameSpot 2004-02-23 (Andrew Park): timeline runs "at least until the studio goes bust"; socialite cash offer; dollar-bill swarms | live fetch, `Published Time: 2004-02-23` | **Holds verbatim** for all three. |
| 11 | GameSpot 2005-08-19 (Ocampo): "if you go into debt, you will be very limited in what you can do until you get out of debt" | live fetch, `Published Time: 2005-08-19` | **Holds verbatim.** Dating argument (lockout described 3 months pre-ship) is sound. |
| 12 | GameSpot E3 2002 (Sam Parker): "one way to grow is to acquire your competitors" | live fetch, `2002-05-22` | **Holds verbatim.** |
| 13 | GameSpot walkthrough (Rorie, 2005-11-19): SSSF cash "relatively minor in comparison to what your actual movies bring in" | live fetch via proxy | **Holds.** |
| 14 | Screenshot A: Jan 1920, HUD $145,000, Staff Office bubble, one scaffolded build; provenance = video capture with caption bar | `Screenshot 2026-08-17 at 11.39.16 AM.png` viewed | **Holds.** Caption bar confirms it is a subtitled video frame, so the report's downgrade of the bible's "DIRECTLY OBSERVED / Owner's own" label is *correct and a strength*. |
| 15 | Screenshot B: Jan 1953, $2,644,803, Director card "50 years old / Annual Salary $50,000 / Market Value $63,073" | `Screenshot 2026-08-17 at 11.38.24 AM.png` viewed | **Holds.** |
| 16 | forceforgood (2012-12-08): "capital never really seems to be an issue"; "pretty hard to screw things up badly"; "not likely to lose money on a movie" | live fetch | **Holds verbatim.** |
| 17 | IMDb "Totally Addictive but Insanely Frustrating": "a century being multi-millions in debt", "three tiny sets", lost sleep over "financial ruin" | live fetch | **Holds verbatim.** (Reviewer says "the first week I owned it", i.e., a launch-window player.) |
| 18 | Code: D-12 `canAfford` gate at `employment.ts:78-86`; `INITIAL_CASH: 20_000_000` at `tuning.ts:70`; set refund 0.35 at `tuning.ts:816`, facility refund 0.5 (`tuning.ts:1613`, referenced at 812) | read directly | **Holds.** |
| 19 | Prima p.61: salary credit to Star rating caps at $100,000; star salaries begin at $6,000 | `prima.txt:3826-3833`; `prima.txt:176` | **Holds.** |
| 20 | Half Price ceremony bonus halves Star pay | `prima.txt:2775, 4043` | **Holds.** |

Bottom line: I found **no load-bearing retail claim that is false**. The report's tiering discipline (pre-release quarantined in §7, INFERENCE labelled) is good, and its correction of the bible's screenshot provenance is a genuine improvement.

---

## 3. Overclaims, mis-tiers and weak spots

### C1 — The "$5 million" Capital ceiling is re-attributed without being located (MINOR, attribution)
Report §4.1 calls the competing "$5 million seems to be the limit" figure "a GameFAQs-tier community guide … LOW". The compiled bible (line 1960) and `THE-MOVIES-2005-ORIGINAL-DATA/source_conflicts.csv` (CONFLICT_050) both attribute it to a **"GameSpot-tier walkthrough"**. The phrase is *not* in either local GameFAQs extraction, and the actual GameSpot walkthrough as fetched contains no "$5 million" — but it *does* say the amount needed to max Capital "may increase as time goes on" (Rorie, §Capital). So: the author downgraded a claim it never found, and skipped the one contemporary professional sentence that *partially* supports it (a drifting ceiling). Corrected statement: "Origin unlocated in this pass; bible attributes it to a GameSpot-tier walkthrough; Rorie's GameSpot walkthrough (CONTEMPORARY PROFESSIONAL, 2005-11-19) gives no figure but says the max-out amount may rise over time, which is itself in tension with Prima's fixed $1.6M." Prima should still govern, but the tier label "GameFAQs-tier" is unsupported.

### C2 — "$775,000 is a printing/arithmetic slip" (MINOR, overstated)
$775,000 = ($1,600,000 − $50,000)/2, i.e., the half-span of the range. Prima's sentence mislabels the half-span as the midpoint; that is an arithmetic conflation, not a "misprint". The report's substantive point (the true arithmetic midpoint is $825,000 and the curve is nonlinear) stands.

### C3 — Staff/extra salaries under-cited to COMMUNITY (MINOR, tier understated)
§5.3 attributes "$1,000/yr each staff" and "$3,000/yr extras" to the Maxx FAQ (COMMUNITY) plus Prima p.76 for personal assistants. Prima p.6 "Staff Pay" states all three directly: staff except extras $1,000/yr regardless of experience; extras $3,000; Star salaries begin at $6,000 (`prima.txt:171-176`). These are developer-reviewed, HIGH.

### C4 — Code note mischaracterises `baseMarketValue` (MINOR, code fact)
§6 says the only `marketValue` hit is "`market.baseMarketValue` in `agents.ts`, a labor-market base". It is the **box-office market base** (currency; `WORLD_CONFIG.marketValueRange: [20_000_000, 80_000_000]` in `tuning.ts:1708`; consumed by `computeBoxOffice` in `agents.ts:126-135` and by reach in `standing.ts:121`). The conclusion (no per-person sale-value concept in accepted code) is unaffected.

### C5 — §5.1 presents an inference as an observation (MINOR)
"HUD cash $145,000 with the Staff Office present and a Stage School under construction" — the scaffold in that frame is not identified in-frame. The *next* frame (`11.39.30 AM.png`, $133,720) shows the Facilities menu with Stage School "1 Owned", Casting Office "1 Owned", Crew Facility "1 Owned", Production Office "0 Owned", which makes the identification very likely but also gives a tighter bound the report did not use: $145,000 − $5,000 − $4,000 = $136,000 expected vs $133,720 observed → ≈ $2,280 of paving/other spend between frames. The bible (§19) records the full descending sequence $145,000 → $133,720 → $123,306 → $113,708; the report used one frame.

### C6 — "IGN … unfetched (403)" stops one step short (MATERIAL omission, see M1)
The 403 is real from this host, but Wikipedia's reference list links a Wayback copy that loads. See §4.

### C7 — §1.5 "guaranteed recovery path" (acceptable, but note the assumption)
Labelled INFERENCE, which is correct. It assumes (i) "Build in Debt: Yes" means the purchase may deepen the debt (Prima's wording supports this) and (ii) box-office income is never negative per film (undocumented, bible Q037). The GameSpy retail review (§4, M2) now supplies contemporary professional support for (ii); the report should cite it rather than rely on the forceforgood 2012 retrospective alone.

---

## 4. What the prompt asked that the report did not answer, or answered vaguely

### M1 — IGN retail review (named in the prompt) is reachable and is the most on-point contemporary professional source for "is there a fail state?"
Wayback `web.archive.org/web/20220903113022/https://www.ign.com/articles/2005/11/09/the-movies` (Dan Adams, IGN, **Nov 9, 2005**, CONTEMPORARY PROFESSIONAL):
- on the campaign: it is "nearly impossible to actually lose, though it's not guaranteed that you'll actually win";
- "You'll have a huge sum of money to play with and can basically move at your own pace";
- "You'll face rudimentary money management";
- "Not having to worry about losing definitely makes a difference to making the game fun";
- on Sandbox: options to "set as much money as they want, and even start with a ready-built lot".
Effect: (a) the §2 "no hard fail state" finding gets a direct contemporary professional statement instead of arguments from silence; (b) §5.4's "forgiving" side is upgraded from a 2012 community retrospective to a launch-week professional review; (c) Sandbox has a **pre-built lot** option the report never mentions (relevant to "starting cash / sandbox" reconstruction).

### M2 — GameSpy retail review (2005-11-08) reachable via Wayback; bears on open Q037
`web.archive.org/web/20210213214901/http://pc.gamespy.com/pc/the-movies/665203p1.html` (Dave Kosak, GameSpy, 2005-11-08): "you start off with an empty lot and a pile of cash"; the game is "pretty friendly … in that even a crappy movie will probably earn your studio some moolah"; p.2: "When a movie isn't making money anymore, it's lit up with a flashing icon". This is contemporary professional support for "no per-film loss in practice" (§5.4 reconciliation, §9 item 6), which the report leaves as community-only.

### M3 — PC Gamer 2005 is named in the prompt and never mentioned
Not even recorded as attempted/unreachable. Wikipedia cites a PC Gamer piece (January 2005, p.66) — pre-release by date. A one-line "not reached; Jan 2005 issue would be PRE-RELEASE tier anyway" would have closed the loop.

### M4 — Technical-artifact registers were skipped (self-admitted, §9 item 7) and they both corroborate and extend the findings
`THE-MOVIES-2005-TECHNICAL-ARTIFACTS/schema_fields.csv`:
- **TECH-SCHEMA-004** — `[blueprint] … availableindebt` flag on facility/set/prop definitions, `=1` on "a few core facilities only" (Stage School, Script Office Basic, Crew Facility, Production Office, Staff Office candidate). This is the game-data mechanism behind Prima's list: debt gating is **data-driven per blueprint**, not hardcoded — a useful fact for any successor design. (Note the register also lists a Staff Office candidate, which Prima omits because it is pre-built.)
- **TECH-SCHEMA-007** — `[studio] starratingmoneyfactor / reputationfactor / starsfactor / prestigefactor / awardsfactor = 0.239 / 0.239 / 0.239 / 0.144 / 0.144`. This is engine-level corroboration of Prima's 24/24/24/14/14 and, critically for prompt item 4, of **"Capital" being literally the money factor**. The register's own note says it is "NOT the same formula" because the factor names differ; that caution is over-cautious (the weights round exactly to Prima's and money↔Capital, reputation↔Movies is the obvious mapping) and the report could have adjudicated it.
- **TECH-SCHEMA-009** — `[awards] MoneyMakerLevel1-4 … CashRich1-4` — two *distinct* money metrics in the award tuning (cumulative earnings vs cash on hand). See M5.
- **TECH-SCHEMA-001** — `[finance] purchasecost / annualcost / dailyrate` per facility/set, with `annualcost`/`dailyrate` = 0 in every example inspected → **no per-building upkeep** in retail data as far as inspected. The report's §5.3 running-cost table never says whether buildings had upkeep; this answers it (with the register's own caveat that the channel exists but was unexercised).

### M5 — The original DID track a cumulative lifetime-earnings metric; §4 says the only economic figures were cash + rating
Prima p.79-80 Achievement Award criteria include **"Earn a total of $500,000"** (Wannabe Big Cheese, `prima.txt:5064`), **$7,000,000** (Celebrated Studio Head, `:5049`), **$15,000,000** (Big Fish, `:5079`) and **$35,000,000** (Movie-Making Legend, `:5111`) — separate from "Amass at least $X in funds". The Mark FAQ repeats the $15M/$35M lines (`gamefaqs-mark.txt:841, 858`). The engine field is `MoneyMakerLevel1-4` (TECH-SCHEMA-009; Level1 = 500000 matches). So the shipped game kept a **studio-lifetime gross counter** and surfaced it through the Achievement Awards screen (Prima p.78, `prima.txt:5044`). It is not a valuation or net worth — the report's headline is still right — but for a P15 package titled "Studio Legacy" this is the closest retail analogue to a legacy economic metric, and §4/§8 should say so instead of "the Achievement Award ladder separately uses cash thresholds".

### M6 — "Enumerate what is locked" is incomplete beyond facilities/sets
Manual p.6 locks "lot ornamentation" too. Prima's ornament profiles (pp.27-33, `prima.txt:1599-2280`) carry **no** `Build in Debt` line, so the manual is the only source and the report never states the ornament rule in its enumeration. Also unaddressed: paving/landscaping, hiring, salary raises, marketing spend, and research while in debt. The honest answer is "no inspected source establishes any non-build restriction" — that sentence is missing. Since Lot Prestige (14%) depends on ornaments, debt also indirectly freezes one rating component; worth one line.

### M7 — GameSpot walkthrough's Capital paragraph skipped (CONTEMPORARY PROFESSIONAL)
Rorie §Capital: keep it maxed by releasing quality films "after you get through the 1920's"; the max-out amount "may increase as time goes on"; if it drops, "stop spending money for a while, or produce some lower-quality films … to get your cash flow back into a positive state". This is (a) the only contemporary professional description of a *recovery* play (prompt item 1) and (b) a ceiling-drift claim relevant to C1.

### M8 — Per-film "total filming cost" figure
Manual p.12 tells the player to match marketing to "the quality rating and total filming costs of the movie" (bible §19 cites it). The report's §5.3 cost table omits that the game surfaced a per-film filming-cost figure — a small but real economic HUD element that qualifies "the economic HUD is exactly Cash Balance + Studio Ranking rosette" (§4).

### M9 — Pre-release previews: Wayback not tried for IGN/Eurogamer; developer diary not consulted
Report §7 says IGN/Eurogamer previews returned 403. Wayback was not attempted. I did fetch the GameSpy developer diary (Molyneux/Moore, 2004-07-21, Wayback `20191021174947/http://pc.gamespy.com/pc/the-movies/532487p1.html`) — it contains **no** economy content, so nothing in §7 changes, but the report should record that developer-voice sources were checked.

---

## 5. Things a hostile reviewer might raise that I checked and found NOT to be problems

- **"71 profiles" arithmetic** — verified by occurrence count (line-count grep gives 60 because the two-column layout puts two flags on one line; the author counted correctly).
- **Prima page mapping** (printed = PDF − 1) — consistent with page footers at `prima.txt:194` (p.6), `1390` (p.23), `2857` (p.46), `5090` (p.79).
- **GameSpot quote fidelity** — all seven quoted phrases in §7 are verbatim in the dated articles.
- **Screenshot provenance downgrade** — correct; the bible's "DIRECTLY OBSERVED / Owner's own" label is the one that is wrong.
- **Rival failure / acquisition absent from retail** — no retail source inspected (manual, Prima, both FAQs, gamepressure, GameSpot review + walkthrough, IGN review, GameSpy review) mentions rival bankruptcy, closure, merger or acquisition. Holds.

---

## 6. Recommended edits (surgical)

1. §2 table: add IGN (Adams, 2005-11-09, Wayback) and GameSpy (Kosak, 2005-11-08, Wayback) rows with the quotes in M1/M2; add a PC Gamer row: "not reached; Jan 2005 issue = PRE-RELEASE".
2. §4/§8: add the cumulative "Earn a total of $X" metric (Prima p.79-80; engine `MoneyMakerLevel1-4`) as a tracked lifetime-gross counter distinct from Capital; keep "no valuation/net worth" headline.
3. §4.1: replace "GameFAQs-tier community guide" with the corrected attribution in C1; add Rorie's "may increase as time goes on".
4. §1.2–1.4: add "lot ornamentation locked (manual p.6; Prima gives ornaments no flag); no inspected source restricts hiring, marketing, paving or research in debt".
5. §5.3: re-tier staff/extra salaries to Prima p.6 (HIGH); add "no per-building upkeep in retail data (TECH-SCHEMA-001 annualcost/dailyrate = 0)".
6. §1.2: cite TECH-SCHEMA-004 `availableindebt` as the data mechanism; §4.1: cite TECH-SCHEMA-007 `starratingmoneyfactor 0.239` as engine corroboration.
7. §5.1: cite the second tutorial frame ($133,720, Casting+Crew owned) and the bible's descending sequence.
8. §6: correct `baseMarketValue` to "box-office market base".
9. §4.1 wording: "$775,000 is the half-span, mislabelled as the midpoint" instead of "printing slip".

---

## 7. Verdict

**VERIFIED WITH CAVEATS.** Every retail mechanic the report asserts is supported by the cited primary text at the cited location; pre-release material is correctly quarantined; the inference labels are honest. The caveats are completeness, not correctness: the prompt-named IGN/PC Gamer coverage was reachable or at least reportable; the game-data registers the author skipped both confirm the debt gate and the money factor and add two facts (data-driven `availableindebt`; zero building upkeep); and the original's cumulative-earnings award metric is a real retail economic figure the report's "cash + rating only" framing omits.

### Files consulted (verifier)
- `scratchpad/original-text/{manual,prima,gamefaqs-maxx,gamefaqs-mark,gamepressure-improving}.txt`
- `~/Desktop/big swing art/THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` (§19 lines 2047-2100; 1958-1960; 2782; 2864-2867)
- `~/Desktop/big swing art/THE-MOVIES-2005-TECHNICAL-ARTIFACTS/{schema_fields,candidate_vanilla_values,dormant_or_unconfirmed_fields,facility_candidates}.csv`
- `~/Desktop/big swing art/THE-MOVIES-2005-ORIGINAL-DATA/{source_conflicts,ACTIVE-UNRESOLVED-QUESTIONS,achievement_certificates}.csv`
- `~/Desktop/big swing art/Screenshot 2026-08-17 at 11.39.16 AM.png`, `… 11.39.30 AM.png`, `… 11.38.24 AM.png`
- `scratchpad/accepted-592e926/src/core/{employment,tuning,agents,standing,worldgen,types}.ts`
- Web: GameSpot 1100-2866856 (2002-05-22), 1100-6089840 (2004-02-23), 1100-6131571 (2005-08-19), 1900-6139475 (2005-11-09), 1100-6140049 (2005-11-19); IGN review via Wayback 20220903113022; GameSpy review via Wayback 20210213214901 (p1, p2); GameSpy dev diary via Wayback 20191021174947; forceforgood.co.uk/strategy/the-movies/; imdb.com/title/tt0403324/reviews/; en.wikipedia.org/wiki/The_Movies_(video_game)
