# Verification memo — `orig-rivals.md` (LENS: completeness & overclaim)

**Verifier:** adversarial reader, P15 research review (READ-ONLY)
**Date:** 2026-09-11
**Report under review:** `<scratchpad>/out/phase1/orig-rivals.md`
**Verdict:** **REFUTED IN PART** — the original-game reconstruction (sections 1–7) is accurate and well-located on nearly every spot-check, but the report's one bridge to the present (§8, summary claim 20: "no rival studio ... or ranking anywhere in `src/`") is false for the accepted 592e926 snapshot, and the report repeats the stale P15 §9 characterisation the prompt explicitly warned against. Several smaller overclaims and omissions are listed below.

---

## 1. Method

Spot-checked 14 claims against the plain-text extractions (`prima.txt`, `manual.txt`, `gamefaqs-maxx.txt`, `gamefaqs-mark.txt`), the Prima PDF (via `pdftotext` on PDF pp. 52, 59, 83 to confirm the printed=PDF−1 offset), the author's own cached web pages (`scratchpad/web/`), the local CSV registers, the two HUD screenshots in `big swing art`, and the accepted code at `scratchpad/accepted-592e926/`. Where the author cited a web source it did not cache (GameSpot walkthrough), I attempted retrieval through Wayback (partially successful — the guide's "Studio Rankings" chapter was subscriber-gated in the 2006–07 captures and the modern URL returns 403).

---

## 2. Spot-check table

| # | Report claim | Source checked | Result |
|---|---|---|---|
| 1 | Prima p.58: "Genre interest is ruled by two factors: time and saturation"; saturation counts "all studios, including yours" | `prima.txt` 3616–3617, 3656–3662; `pdftotext` PDF p.59 line 11 + folio "58" | **CONFIRMED verbatim**, page offset confirmed |
| 2 | Weights Capital/Movies/Stars 24, Lot Prestige 14, Awards 14 (Prima pp.46–47, 51) | `prima.txt` 2849–2851, 2893, 3180 ("14% of Studio Rating" under Awards) | **CONFIRMED** |
| 3 | Capital scale $50,000–$1,600,000, midpoint ≈ $300,000 not $775,000 | `prima.txt` 2794–2812 | **CONFIRMED** |
| 4 | Lot Prestige sub-weights 35/14/17/10/10/10/4 | `prima.txt` 2865, 3060, 3088, 3093, 3125, 3131, 3155 | **CONFIRMED** (sum 100) |
| 5 | Nine-rival table with windows and propensities | `prima.txt` 3195–3208; GameFAQs Maxx 2373–2420 | **CONFIRMED verbatim**; see caveat A (Lionear window is 1905–1907, three years, not four) |
| 6 | Prima p.82 "rivals can only release 10 in five years" | `prima.txt` 5250–5251; PDF p.83 line 73 + folio "82" | **CONFIRMED** |
| 7 | Manual p.6 / p.21 factor lists; Awards omitted; "in relation to the competition" | `manual.txt` 110–123, 126–128, 509–532 | **CONFIRMED**; see caveat B (right-click breakdown sentence is about Stars' entries) |
| 8 | Stars & Script Selling / fired Stars join rivals / rival Stars in Stage School queue / "eight years" | `prima.txt` 279–284, 300–323, 1158, 1168–1204; `manual.txt` 374–386, 427–430 | **CONFIRMED** |
| 9 | Research: "before most of the rival studios" (p.16); "So too will all the rival studios" (p.85) | `prima.txt` 918–924, 5484–5490 | **CONFIRMED** |
| 10 | Award directory cross-studio categories and bonuses; "to all studios in the industry" | `prima.txt` 4899–4906, 4969–5019 | **CONFIRMED** |
| 11 | Platinum counts (Most Prestigious Lot ×13, Highest Charting Studio ×5) | `prima.txt` 5155–5170 | **CONFIRMED**; see omission C (Prima p.45 says "five times") |
| 12 | E3 2002 First Look: "one way to grow is to acquire your competitors" | `web/gs-e3-2002-20031223073334.txt` line 105 (Wayback 2003 capture) | **CONFIRMED** |
| 13 | 2004 preview: "steal them away", "bigger, fatter contracts", "until the studio goes bust"; dated 23 Feb 2004 | `web/gs-2004-preview.html`; `web/cdx-movies.txt` line 297 (first capture 2004-02-24) | **CONFIRMED** (the live page is re-stamped "May 17, 2006"; the CDX first-capture date supports Feb 2004) |
| 14 | S&E manual: one rival mention, p.10 "an extra edge over your rival studios" | `se-manual.txt` 279–285 | **CONFIRMED** with caveat D (same paragraph also says "every major studio using stunts") |
| 15 | GameSpot review (Davis, Nov 2005) "no mention of rival studios at all" | `web/gs-review-2005.txt` line 86 | **REFUTED** — see §3.2 |
| 16 | Accepted code 592e926: "no rival studio, shared saturation, or ranking anywhere in src/, bridge/, or ui/src/engine/" | `src/core/hollywood.ts`, `hollywoodTypes.ts`, `hollywoodStartingData.ts`, `hollywoodTick.ts`, `calendar.ts`, `bridge/industry.ts` | **REFUTED** — see §3.1 |
| 17 | TECH-SCHEMA-007 `[studio]` vector 0.239/0.239/0.239/0.144/0.144 | `schema_fields.csv` line 8 | **CONFIRMED**; author's re-reading (rounds to 24/14) is reasonable and clearly labelled as the author's own |
| 18 | CSV rows: source_conflicts 24/50/51/55, Q010, dormant fields (7 rows, none rival) | files read directly | **CONFIRMED** |
| 19 | Prima p.51 screenshot: nine rows, Feb 1958, Boney present, Booboo absent | `scratchpad/prima52-charts.png` viewed | **CONFIRMED** |
| 20 | HUD capture "1" badge with star row (Apr 1935) | `Screenshot 2026-08-17 at 11.34.09 AM.png` viewed and cropped | **CONFIRMED as described**; interpretation over-confident on that evidence alone — see §3.3 |

---

## 3. Refuted or overstated claims

### 3.1 §8 / summary claim 20 — "no rival studio ... or ranking anywhere in src/" is FALSE for 592e926 (material)

The prompt warned that P15 §9 was written against 7811377 and "is NOT current code truth". The report nonetheless states that a grep "for rival-studio identifiers returned nothing" and that this "matches the P15 package's ... 'no authoritative rival market' statements". At the accepted snapshot:

- `src/core/hollywoodStartingData.ts` lines 11–35: **nine authored rival studios** (Bellwether Pictures founded 1901, Rose Lantern Films 1902, Night Orchard Productions 1906, Silver Current Pictures 1917, then Marigold, Blackthorn, Trailhead, Copper Kite, Bright Meridian), each with capital; `RIVAL_TEAM_ROLES` / `RIVAL_CREDIT_ROLES` at 46–47.
- `src/core/calendar.ts` line 3: `RIVAL_ARRIVAL_WEEKS = [0, 0, 0, 0, 520, 988, 1560, 1872, 2548]` — four rivals at start and five staggered entries (weeks 520/988/1560/1872/2548 = 1930/1939/1950/1956/1969 under the 1920-52 calendar), i.e. the midpoints of Prima's Rigormortis/Gusset/Cletus/Boney/Booboo windows.
- `src/core/hollywood.ts` lines 12–15, 31, 45–56, 81–98, 122–181: `RivalAccount`, `RivalBusiness`, `moveRivalMoney`, `rivalEmployment`, `rivalWeeklyOperatingCost`, `enterRival` (throws "Rival is not due for entry" before `eligibleWeek`).
- `src/core/hollywoodTypes.ts` line 104, 122–123: `HollywoodChartSnapshot = { week, rows: { studioId, standing, output }[] }`, `chart`, `previousChart`.
- `src/core/hollywoodTick.ts` lines 306–312: a **chart snapshot is recomputed every 13 weeks** (`week%13===0`), with `previousChart` retained; `hollywoodValidation.ts` 414–416 enforces the cadence.
- `bridge/industry.ts` lines 66–75: a `rank()` over `INDUSTRY_LANES` (1 + count of studios with a higher value) — a per-lane **studio ranking** exposed to the UI.
- `src/core/hollywoodTick.ts` 181–189: rivals choose film genres by `policy.affinities` — a rival genre-propensity analogue of Prima's table.

What IS true in §8: `src/core/reception.ts` 596/679 `competitionFactor ≡ 1.0` (rev4 N11, `docs/rev4-open-questions.md` 627–630; `docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md` 221–222 calls it "a fine placeholder for identified rival releases later"), and nothing in `reception.ts`/`filmPackage.ts` reads `state.hollywood`, so **rival output does not feed the player's reception** and there is no shared genre-saturation term. The correct statement is: *rival studios, authored arrivals, rival finances, rival film output, a quarterly chart snapshot and per-lane ranks exist in accepted code (P12 R05); what does not exist is any coupling from rival releases into genre interest or box office (competitionFactor inert) and any Prima-style five-weight composite rating.* Because P15 depends on the P12 rival model as an "UPSTREAM PACKAGE DEPENDENCY", getting this wrong misdirects the whole package's seam audit.

### 3.2 §4 table — "GameSpot review (Davis, Nov 2005): no mention of rival studios at all" is wrong and rests on an incomplete read

The author's own cache `web/gs-review-2005.txt` line 86 reads: "Talent will grow old and eventually retire (unless he or she quits or is sold to another studio before hitting the age of 70)". That is a CONTEMPORARY PROFESSIONAL corroboration of the sell-to-rival mechanic (and of Star retirement age 70) that the report's §5.2 table could have used. Further, the cached review is page 1 of 2; the page-2 fetch (`web/gs-review-2005-p2.txt`) returned "The Wayback Machine has not archived that URL", so the report's blanket "no mention" for the review was asserted without the second page.

### 3.3 §2.3 / summary claim 6 — badge = chart position asserted HIGH from evidence that cannot discriminate

A single "1" badge in Apr 1935 is equally consistent with "chart position 1" and "career/achievement level 1" — exactly the ambiguity the Bible (register line 94; Bible lines 2473, 3921) flagged and asked for a Charts-screen clip to resolve. The report declares the Bible flag "superseded by direct observation" without an observation that discriminates. The discriminating evidence was in the same folder and was not used: `Screenshot 2026-08-17 at 11.34.21 AM.png` (Dec 1983, $3,617,264, GameSpot watermark) shows badge **"9"** over a **three-lit / two-dark** star row (crop box x 560–775, y 0–70). A nine-level achievement ladder tops out at a rank requiring a five-star studio (Bible line 2025; Prima p.45 "Many of the Achievement Awards require ... five-star ratings"), so a three-star studio cannot be "level 9"; "9th of 10 on the Studio Charts in 1983" (all nine Prima rivals having arrived by 1971) is consistent. The manual also uses the same visual grammar for Stars ("The number in the top left represents their current chart position", `manual.txt` 317). With that evidence the conclusion is well-founded (HIGH); as written in the report it was an inference presented as observation. Note also both HUD captures carry a Google-Lens/GameSpot watermark — they are web-sourced press images, not an Owner playthrough, so "Owner-supplied capture" should read "Owner-supplied web image of unknown build".

### 3.4 Tier labelling inconsistent with the report's own table

§0 defines RETAIL SHIPPED MECHANIC as manual and/or Prima "corroborated where possible" and PRIMA/MANUAL EVIDENCE as "stated only in one of those two, not independently corroborated". All-studio genre saturation (§1.1), the Capital curve (§2.1), the nine-rival table (§3), the rival output cap (§1.3) and the "eight years" market-value rule are Prima-only among official sources (the manual never mentions saturation, weights, rival names, or the cap; GameFAQs Maxx is a derivative restatement). The report labels §1.1 and §2.1 RETAIL SHIPPED MECHANIC HIGH but §3 and the cap PRIMA EVIDENCE — the same evidentiary situation gets two different tiers. The prompt's own tier scheme allows Prima as retail-shipped, so this is a consistency defect, not a parity error; but the memo reader should treat every one of these as Prima-only.

### 3.5 Smaller overstatements

- **A. "exact year random within a four-year window" (summary claim 8, §3).** Prima's table gives Lionear Productions 1905–1907 (three years); the "four-year period" sentence is Prima's generalisation, not true of every row. The report reproduces the row correctly but does not flag the discrepancy.
- **B. Manual right-click breakdown (§2.2).** `manual.txt` 528–532: "Right-click on **their** entry to view a breakdown of what determines **their** ranking" follows the sentence about Stars; the manual documents the breakdown for Star entries. The per-category Studio breakdown is Prima's statement (p.46), not the manual's. The report presents it as a general chart feature from the manual.
- **C. S&E "one rival mention only" (§4, summary 18).** The same paragraph opens "With every major studio using stunts to boost their box-office results" (`se-manual.txt` 279–280) — a second, weaker implication that rivals use the expansion's stunt system.
- **D. "GameSpot walkthrough ... Awards is 'a win more' rating" (§2.1).** Not cached by the author and not retrievable by me (live 403; Wayback 2006–07 captures show the "Studio Rankings" chapter behind a GameSpot Complete paywall; other chapters retrieved). The quote is plausible but unverified in this review; the retrievable chapters do confirm "stars that attempt to join you from a rival studio" and "a star that's defected from another studio" (p-3) and "unlocking colour film ... before the other studios" (p-6), which the report does cite correctly.
- **E. "Community wikis ... conflicting rival windows" (§3).** The gamicus sentence is confirmed in the author's cache ("The game begins with four rival studios, and six studios are added later. No more studios open for business after the year 2000"); the the-movies-game.fandom.com windows are not cached and fandom is Cloudflare-gated for me, so that half of the community-conflict claim is unverified here.

---

## 4. Prompt items answered vaguely or not at all

1. **Opening rival count (prompt §3; report §3 "three or four").** Prima resolves this better than the report says. Creamboat's window is 1916–1920, i.e. it has arrived by the January 1920 start (Prima: "studios that start before 1920 are already well established"), and the Platinum walkthrough's 1925 target is "get into fifth place in the Studio Charts" / "not enough to rise above fifth place" (`prima.txt` 5216–5230) — fifth = last of five, i.e. exactly four rivals before Rigormortis (1928–1932). The gamicus "four rival studios at start" line is therefore corroborated by Prima, and the accepted code's `[0,0,0,0,…]` arrival vector already encodes it. The report leaves this as an open uncertainty (#4).
2. **Rank update cadence (prompt §2).** "No inspected source" is correct for the original; the report does not say that the accepted code has picked a cadence (quarterly, `week%13===0`), which is the relevant fact for P15's Power-Ranking discussion.
3. **Whether rivals' Stars/films are simulated entities (report open uncertainty #2).** The manual states it outright: "all Stars from all studios are listed in the Star charts" (`manual.txt` 316–317). Not cited. Combined with Prima p.77 ("Pointing to an award displays ... specifics about the winner"), this is retail evidence that rival Stars, films and award wins were named, ranked entities.
4. **Prima internal inconsistency on Platinum.** p.45 (`prima.txt` 2783–2784): "To gain the Platinum Lifetime Achievement Honor, you must win Most Prestigious Studio Lot **five** times"; p.81 (5163): "Most Prestigious Studio Lot: **13**"; p.82 (5232): "You need to win this one 13 times". The report quotes only the 13. A source-conflict row should exist for this.
5. **Chart-mechanics rule missed (prompt §2/§6).** Prima p.78 (`prima.txt` 4977–4981): "It's impossible to win Highest Charting Studio and Highest Climbing Studio in consecutive ceremonies because any studio that was number one ... can only either remain at the top or fall" — a retail statement about how chart movement is measured (position delta between ceremonies) that belongs in §6.
6. **GameFAQs Mark's per-category display (§2.1).** `gamefaqs-mark.txt` 1009–1024: Capital, Movies, Stars "rated out of five stars"; Lot Prestige and Awards "rated out of three stars". The 5:5:5:3:3 display ratio (1.67) tracks the 24:24:24:14:14 weights (1.71) and is independent community corroboration of both the weights and the Charts-screen breakdown UI. The report says only "star sub-ratings and no weights".
7. **Web search for closure (prompt §4 "Search the web too").** The report lists two fandom wikis and one retrospective. It reports no forum/Reddit/Steam search and does not name the two other GameFAQs guides on the same GameFAQs page (madbird2u 41198, LunarRyou 40166). My own search ("rival studios" + bankrupt/bust/closed) surfaced nothing relevant, so the conclusion stands, but the search breadth claimed ("every retail-tier text", "all local CSV registers") is broader than the search performed on the community tier.
8. **P15 §6 row "rival research was a full private tree — REFUTED".** The report's §5.3 addresses research but never states whether this P15 REFUTED row holds; its own finding (Prima "most of the rival studios") neither confirms nor refutes a private tree. Should be stated explicitly as "no source establishes either".
9. **Prima p.82 "your rivals can move up to three spots" (`prima.txt` 5228–5229).** A second walkthrough statement about rival chart mobility, not mentioned alongside the "10 in five years" cap.

---

## 5. Claims that survive as stated (strong)

- Prima p.58 all-studio saturation wording, and the absence of any exposure window / overlap mechanic / head-to-head box-office term in Prima's Success factor list (pp.57–58).
- Prima pp.46–47, 51 weights and Capital curve; Lot Prestige sub-weights; Awards "at the most recent award ceremony", max at ≥6.
- Manual pp.6 and 21 factor lists, omission of Awards, "in relation to the competition".
- Nine-rival table names, windows, propensities (verbatim); GameFAQs Maxx reproduces it exactly.
- Prima p.51 Studio Charts screenshot (nine rows, Feb 1958, Boney present) and its use to discount the fandom 1965–1969 window.
- Zero retail hits for bankrupt/bust/close/merge/acquire; "goes bust" (2004 preview) and "acquire your competitors" (E3 2002) are pre-release only; Prima's acquir/take over/buy hits are all non-corporate.
- Star movement table (defection to player queue scaled by Studio Rating, mistreated/fired Stars leaving, selling facility, eight-year rule).
- Award directory, ceremony cadence, Lifetime Honors structure, "reward-wise, ends" at 2005.
- CSV register rows (source_conflicts 24/50/51/55, Q010, dormant 7 rows none rival, TECH-SCHEMA-007).
- `competitionFactor ≡ 1.0` (N11) and no shared-saturation coupling in accepted code.

---

## 6. Recommended corrections to the report

1. Rewrite §8 and summary claim 20: accepted 592e926 **has** nine authored rival studios (four at start, five scheduled), rival accounts/businesses/film output, a 13-week chart snapshot and per-lane ranks (`bridge/industry.ts`); it **lacks** any rival-to-player reception coupling (`competitionFactor ≡ 1.0`, N11) and any Prima-style composite Studio Rating. Cite the file:line locations above.
2. Correct the GameSpot review row to "one mention: talent 'sold to another studio' (p.1); p.2 not retrieved".
3. Replace "superseded by direct observation" with the two-screenshot argument (badge 1/3-star in 1935; badge 9/3-star in 1983 — a 3-star studio cannot hold achievement level 9), and relabel the captures as web-sourced press images.
4. Apply one tier consistently to Prima-only facts, or drop the "corroborated" clause from the RETAIL SHIPPED MECHANIC definition.
5. Add: Prima 5-vs-13 Platinum inconsistency; the 1925 "fifth place" inference (four rivals at start); manual "all Stars from all studios are listed in the Star charts"; Mark's 5/5/5/3/3 display; Prima p.78 consecutive-award impossibility; Lionear three-year window; "every major studio using stunts".
6. Mark the GameSpot walkthrough "win more" quote as uncached/unverified or cache the chapter.
