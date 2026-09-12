# P15 Section 4 — Power Ranking vs Studio Net Worth vs Studio Valuation

**Analyst:** independent research reviewer (read-only), package P15
**Date:** 2026-09-11
**Scope:** deliverable section 4 (high priority) — should Power Ranking, Net Worth, and Valuation remain distinct, and if so, which presentation model should ship them.

---

## 0. Answer up front

**Yes — keep all three distinct.** They are three different mathematical objects answering three different player questions, and the accepted code already keeps two of them apart on purpose (see §2). Collapsing any pair loses real information, and the worked example in §4 shows a case (a hot, leveraged studio vs. a wealthy, cold one) where the wrong collapse would visibly mislead the player.

**Recommended model: D — "Power Ranking stays creative; financial strength rides beside it as a disclosed band, not a rank."** Power Ranking keeps the Owner's three candidate lanes (recent commercial performance, prestige/honors, output/reliability), computed and tied exactly the way the shipped Studio Charts already compute and tie Standing lanes. Financial strength is represented, as the Owner asked, by a plain-language band (Thriving/Stable/Leveraged/Strained/Distressed) shown in the same quarterly table but never summed into the rank and never itself ordered into a "richest first" leaderboard. Exact Net Worth and the derived Valuation number live on each studio's own detail page — full precision for the player's own studio, band-only for rivals, matching the disclosure rule the game already uses everywhere else.

This is the smallest correction to the already-shipped surface, it satisfies every governing rule already frozen into the P12A register (§2), and it is the only one of the four models that cannot be read by a player as "the rich studio is winning" while still making financial risk visible every quarter.

---

## 1. Three different questions

| Surface | Question it answers | Kind of number | Needs a cohort? | Changes how? |
|---|---|---|---|---|
| **P08 Standing** (`audienceAwareness`, `industryPrestige`, `commercialConfidence`) | "How is this studio generally regarded, right now, in isolation?" | A persistent 0–100 reputation scalar per channel | No — meaningful for one studio alone | Continuous drift, driven only by that studio's own releases (`src/core/standing.ts`) plus a weekly awareness-decay term (`hollywoodTick.ts` `AWARENESS_DRIFT_ANCHOR/RATE`) |
| **Power Ranking** (new, P15A.2) | "Who is strongest/hottest **right now, compared to the current field**?" | A periodic **relative position** inside a bounded, dated cohort | Yes — undefined without other studios | Snapshot every quarter; can move even if the studio's own Standing didn't, because rivals moved |
| **Studio Net Worth** (new, P15D) | "What does this studio literally own minus what it literally owes, today?" | An absolute balance-sheet quantity, in dollars | No — a studio can know its own net worth with zero rivals in the game | Moves with every cash/asset/liability event; it is bookkeeping, not opinion |
| **Studio Valuation** (new, P15D) | "What might this studio be worth **if a transaction happened**?" | A **derived, situational** dollar estimate — closer to an opinion than a fact | Sometimes (a sale price is set against a buyer) | Recomputed only when asked (detail page, later an offer flow); never a standing "worth" |

The accepted code already treats the first two as separate on purpose. `bridge/industry.ts:110` ships this exact notice on every Industry page today: *"Public facts only. Standing channels and film measures have separate meanings; **there is no combined Power score**."* That sentence is the thing the Owner's direction B partially reverses (a Power Ranking is now authorized) — but it does **not** license collapsing Standing, Power Ranking, Net Worth and Valuation into one number. The governing law in the P12A register is explicit and still binding (see §2): no averaged composite, no fourth field bolted onto frozen Standing.

---

## 2. What already exists, and what already forbids a single number

### 2.1 The shipped surface (`592e926`)

- **Standing** — three fields only (`audienceAwareness`, `industryPrestige`, `commercialConfidence`), computed by `updateStanding` (`src/core/standing.ts:150-207`) for the **player and every rival identically** — `RivalBusiness.standing` and `state.studio.standing` are both `Standing` values run through the same pure function. This is the existing AI-symmetry precedent (see §7).
- **Quarterly chart** — `finishHollywoodWeek` rebuilds `HollywoodState.chart`/`previousChart` every 13 weeks (`hollywoodTick.ts:306-312`), one row per entered studio: `{studioId, standing, output}`. `output` = released-film count (with a small authored-history offset for the four founding rivals).
- **Per-lane rank/movement** — `bridge/industry.ts` computes, for **each of four lanes independently** (`audienceAwareness`, `industryPrestige`, `commercialConfidence`, `output` — `INDUSTRY_LANES`, `industry-schema.ts:3`), a `rank`, `priorRank`, and a typed `movement` (`new`/`unavailable`/`up`/`down`/`unchanged`) with a dated label ("Up 2 since March 1923"). This is the "Studio Charts" view (`result.title='Studio Charts'`, `bridge/industry.ts:129`).
- **Tie rule, as shipped** — `rank = 1 + count(rows with a strictly greater value)` (`bridge/industry.ts:71-73`, and the `output`/`recent` variant at `:121-123`). That is **competition ranking** (1-1-3): two tied leaders both show rank 1, the next distinct value shows rank 3, nobody shows rank 2.
- **No cash anywhere on this surface.** `StudioIndustryStudio` (`bridge/schema/industry-schema.ts:7`) has no cash, account, or debt field. `RivalAccount`/`RivalBusiness.account` (`hollywoodTypes.ts`) is never read by `bridge/industry.ts`. Rival cash is fully private today.

### 2.2 Governing rules already frozen (P12A Decision & Requirement Register)

| Rule | Text | Bearing on this task |
|---|---|---|
| **UX-004** | "Never ship an Overall industry score by averaging the three Standing channels." | Bars folding Net Worth (or anything) into Standing itself. Not a bar on a *separate* Power Ranking sum, which is a different surface. |
| **SAF-012** | "Do not recreate the original universal Studio Rating or average the three Standing channels; **do not add a fourth field to frozen Standing.**" | Explicitly forbids the most tempting shortcut: adding a `financialStrength` field to the `Standing` type. Any financial lane must live on the Power Ranking surface, never on Standing. |
| **UX-005** | "...ties share rank with stable studioId display order, entrants are 'new,' closed studios leave current charts but remain historical." | The shipped tie behavior (competition ranking) and the closed-studio rule the failure ladder (Owner direction D) will need — see §8. |
| **UX-003** | "...Later aggregate Power Ranking remains excluded; final Gate B disposition stays open." | Confirms Power Ranking was deliberately deferred, not rejected — the Owner's direction B is that deferred gate opening, not a reopening of a settled "no." |
| **SAF-004** | "Do not ship Power Ranking in P12A... until sufficient comparative public history and P15A.2 TypeScript authority." | A *when*, not a *whether* — satisfied once P15A.1 shared-market history exists, exactly as P15-PACKAGE §26 anticipated. |
| **INT-009** | "P15A.2 or current accepted equivalent owns Power Ranking... quarterly current/prior snapshots **and annual summaries**." | Confirms package ownership and flags annual summaries as in-scope but **not yet built** (only two snapshots — current/previous — are retained today; see §8). |

**Original-game anchor, for contrast (SUPERSEDED BY OWNER DIRECTION as a design, cited for comparison only):** the retail *Studio Rating* blended Capital 24% + Movies 24% + Stars 24% + Lot Prestige 14% + Awards 14% into one number (Prima pp. 45–46, 51; GameFAQs corroboration). Capital was literal cash on a $50,000–$1,600,000 concave scale (Prima p. 46) — diminishing returns above roughly $300,000, not linear. The current P15 direction is a **deliberate departure** from that blend, and every model below is evaluated against that departure, not against retail parity.

---

## 3. Comparator evidence (how other games keep these apart)

| Comparator | Ranking mechanism | Wealth inside the rank? | Book value vs. sale/enterprise value | Disclosure |
|---|---|---|---|---|
| **OpenTTD** (source-read, `economy.cpp:92-318`) | 9 published linear components, `(value/needed)` shown per row, summed to 1000 | Yes, but small: Money 5% + Loan 5% = 10% of 1000 | **Company Value** (`assets − loan + cash`) graphed **separately**; bankruptcy-sale value drops the loan; hostile-takeover price adds 2 years of profit — three distinct formulas, all published in source | Everything public except the hostile-takeover price |
| **Simutrans** (source-read, `player_ranking_frame.cc:20-108`) | **Single-criterion** sortable window — pick one of nine lanes (Revenue, Cash, Net Wealth, etc.) | No — Cash and Net Wealth are lanes *beside* performance lanes, never merged into one score | No blended score at all | All lanes visible to all players |
| **Capitalism Lab** | Separate Forbes-style rankings: Revenue Ranking, Profit Ranking, Market Cap Ranking, **personal** Billionaires Ranking | No — corporate rankings and the personal wealth list are explicitly separate surfaces | Financial statements (book) vs. market cap (market) shown on different reports | Rankings are public by construction |
| **GearCity** | Company Directory (funds/revenue/expenses) + Market Cap Table, no composite | No | **Evaluation** (asset-at-cost book value) feeds **share price** (a market formula, floored at 0.7× Evaluation) feeds a separate **acquisition-cost premium** — three numbers, three formulas, all wiki-published | Directory and Market Cap Table both public |
| ***The Movies* (2005), retail** | One blended Studio Rating | **Yes — Capital was 24% of the blend**, capped/concave | No valuation concept existed | Per-category breakdown was shown on right-click, but only as an explanation of one final number |

**Pattern:** every modern comparator that still shows a competitive rank keeps wealth either (a) out of the rank entirely (Simutrans, Capitalism Lab, GearCity) or (b) inside it at a small, capped weight with the real money number graphed separately (OpenTTD). None of them recreate the original's 24%-of-the-rank treatment of cash. That is the strongest single piece of comparator evidence against any model that gives Net Worth a large or unbounded weight inside Power Ranking.

---

## 4. Worked example — four hypothetical studios (PROVISIONAL)

All figures below are **illustrative only**, chosen to be plausible against established facts (`INITIAL_CASH` 20,000,000; rival opening capital 20M–38M; weekly overhead 15,000 + 1,500/employee; soundstage capex up to 2.4M) but not derived from any tuning table. They exist to make the model comparison concrete, not to propose real balances.

| Studio | Cash | Facility+Set book assets | Loan principal outstanding | **Net Worth** (cash+assets−loan) | Trailing 52-wk revenue | **Valuation*** |
|---|---|---|---|---|---|---|
| Silver Current (steady) | 9.0M | 6.0M | 2.0M | **13.0M** | 14.0M | 20.0M |
| Bellwether (**wealthy, cold**) | 30.0M | 4.0M | 0 | **34.0M** | 2.0M | 35.0M |
| Rose Lantern (**hot, leveraged**) | 1.5M | 9.5M | 8.0M | **3.0M** | 22.0M | 14.0M |
| Your Studio (player, middle) | 11.0M | 5.0M | 0 | **16.0M** | 9.0M | 20.5M |

*Valuation formula used here, PROVISIONAL: `Net Worth + 0.5 × trailing-52-week revenue` — a simple capitalized-earnings adjustment so an actively-releasing studio is worth more than its book value alone, and an idle cash pile is not. This is illustrative, not a proposal; a real formula needs P15D research and is explicitly out of scope for P15A/P15A.2. (A full enterprise valuation with library/IP value stays P16+, per INT-011.)

**Power Ranking lanes** (0–10 each, PROVISIONAL banding of the Owner's three candidate lanes — commercial performance, prestige/honors, output/reliability):

| Studio | Commercial | Prestige | Output | **Sum /30** | **Power Rank (competition)** |
|---|---|---|---|---|---|
| Rose Lantern | 10 | 8 | 6 | **24** | **1** |
| Silver Current | 7 | 6 | 6 | **19** | **2** |
| Your Studio | 6 | 6 | 5 | **17** | **3** |
| Bellwether | 2 | 4 | 2 | **8** | **4** |

**Financial Standing band** (debt/asset ratio + runway, PROVISIONAL bands: Thriving <20% debt/assets & strong reserve · Stable <40% · Leveraged 40–70% or thin reserve · Strained >70% · Distressed net worth ≤ 0):

| Studio | Assets | Debt/Assets | **Band** |
|---|---|---|---|
| Bellwether | 34.0M | 0% | **Thriving** |
| Your Studio | 16.0M | 0% | **Stable** |
| Silver Current | 15.0M | 13.3% | **Stable** |
| Rose Lantern | 11.0M | 72.7% | **Leveraged** |

**This is the whole argument in one table pair.** Rose Lantern is **#1 on Power Ranking** and simultaneously has the **lowest Net Worth of the four** and a Leveraged band. Bellwether is **dead last on Power Ranking** and simultaneously has by far the **largest Net Worth and Valuation**. Any model that sums money into the ranking risks dragging Rose Lantern down (or pulling Bellwether up) for reasons that have nothing to do with what the Owner defined Power Ranking to mean ("strongest/hottest right now"), and any model that hides the financial picture entirely leaves the player unable to see that the studio currently "winning" is one bad quarter from trouble. Both failure modes are visible in this one dataset — which is exactly why §5 recommends a model that shows both without merging them.

---

## 5. Four presentation models

### Model A — Two fully separate leaderboards

**What the player sees:** the existing Studio Charts / Power Ranking table (3 lanes, no money) **and**, on a separate tab, a Finance leaderboard listing Net Worth, trailing revenue, profit, and debt per studio, sortable by any column (Simutrans/GearCity/Capitalism Lab pattern) — no blended score anywhere.

Using the worked data: Power Ranking is exactly the table in §4. The Finance leaderboard, sorted by Net Worth descending, reads **Bellwether (34.0M) → Your Studio (16.0M) → Silver Current (13.0M) → Rose Lantern (3.0M)** — the *reverse* of the Power Ranking order.

**Strength:** cleanest separation; zero risk of UX-004/SAF-012 exposure; matches three of five comparators exactly.
**Weakness:** a sortable rival Net Worth *leaderboard* is itself an ordered "richest wins" table. Even with no formula connecting it to Power Ranking, a meaningful fraction of players will read "#1 on Finance" as a second Power Ranking, which is close to the "assume wealthiest = most powerful" reading the Owner explicitly warned against — the *presentation*, not the math, causes the confusion. It also requires disclosing near-exact rival Net Worth figures to rank them at all, the largest new disclosure exposure of the four models (see §7).

### Model B — Fourth lane inside Power Ranking, Valuation separate

**What the player sees:** Power Ranking now has four capped 0–10 lanes (Commercial, Prestige, Output, Financial Strength), summed to a single rank out of 40; Valuation appears only on the studio detail page, not in the ranking table.

Using the worked data, converting each studio's debt/asset position to a capped 0–10 Financial Strength lane (Bellwether 9, Your Studio 7, Silver Current 6, Rose Lantern 2) and adding it to the §4 sums:

| Studio | Commercial+Prestige+Output | +Financial Strength | **Sum /40** | **Rank** |
|---|---|---|---|---|
| Rose Lantern | 24 | +2 | **26** | 1 |
| Silver Current | 19 | +6 | **25** | 2 |
| Your Studio | 17 | +7 | **24** | 3 |
| Bellwether | 8 | +9 | **17** | 4 |

Rose Lantern still wins here (the gap is large enough), but note how much the gap to Silver Current **closed** — 5 points down from 5, i.e. unchanged in this instance, but only because the weight (10 of 40, 25%) happens to be small; at OpenTTD's real-world weight (10%) or lower it would matter less, at a naive "equal fourth lane" weight (25%, as modeled) a closer creative contest would already flip on wealth. This is the structural risk: **the moment money is inside the sum, the ranking's meaning becomes contingent on a weight the Owner would have to keep re-tuning**, and any weight above roughly OpenTTD's 10% starts to let cash decide close creative contests — the exact failure mode the Owner named.

**Strength:** closest to OpenTTD's precedent; "financial strength represented inside Power Ranking" literally matches the Owner's first candidate phrasing.
**Weakness:** reintroduces a live tuning knob (the weight) directly into the number the Owner said must not let "wealthiest = most powerful"; also risks SAF-012's spirit even though it technically targets Standing, not Power Ranking — a fourth summed lane inside the *headline* ranking is the shape SAF-012 exists to prevent from creeping back.

### Model C — Power Ranking pure creative; Valuation is the primary financial number

**What the player sees:** Power Ranking unchanged from the shipped three lanes (no money at all, ever). Studio Valuation becomes the single prominent financial number, shown on every studio's detail page and positioned as the number a future acquisition system (Owner direction I, P16+/P15D-gated) would use. No rival Net Worth leaderboard exists at all — Net Worth stays an input to the one Valuation figure, never its own ranked comparison.

Using the worked data: Power Ranking is again exactly §4. Valuation is visible per-studio only (Bellwether 35.0M, Your Studio 20.5M, Silver Current 20.0M, Rose Lantern 14.0M) — never assembled into a table that orders studios by wealth.

**Strength:** structurally the safest against "richest is winning" misreadings — there is no financial ranking of any kind, only a single number per studio.
**Weakness:** under-serves the Owner's explicit ask that financial strength be represented "somewhere **meaningful**" on the *quarterly* surface. A player who never opens a rival's detail page never learns that the studio currently #1 on Power Ranking is thin on cash — precisely the information Owner direction D (rival failure) and F (loans) later depend on players being able to notice before a bankruptcy headline surprises them.

### Model D (recommended) — Power Ranking stays creative; a disclosed band rides beside it

**What the player sees:** the exact §4 Power Ranking table, quarterly, unchanged math — **plus one extra column in the same table**, a plain-language Financial Standing band (Thriving/Stable/Leveraged/Strained/Distressed), computed from the same underlying ratios as Model B's lane but **never summed into the rank and never itself sorted into an ordered leaderboard**. Exact Net Worth and the derived Valuation number live only on each studio's own detail page (full precision for the player's own studio, band-only for rivals).

| Rank | Studio | Commercial | Prestige | Output | Sum/30 | **Financial Standing** |
|---|---|---|---|---|---|---|
| 1 | Rose Lantern | 10 | 8 | 6 | 24 | **Leveraged** |
| 2 | Silver Current | 7 | 6 | 6 | 19 | Stable |
| 3 | Your Studio | 6 | 6 | 5 | 17 | Stable |
| 4 | Bellwether | 2 | 4 | 2 | 8 | **Thriving** |

A player reading this one table sees, without opening anything else, that the current #1 is Leveraged and the current #4 is Thriving — the entire tension the Owner asked to surface, in one glance, with **zero** risk that the band changes the rank (it mathematically cannot; it is not part of the sum) and **zero** risk that "richest" reads as "winning" (there is no financial *order*, only five fixed labels, and a studio that is #1 in cash gets no numeric or positional credit for it here).

**Strength:** satisfies the Owner's "represented somewhere meaningful" test directly in the quarterly view; keeps Power Ranking's math and tie rule completely untouched (reuses the shipped `rank()` byte-for-byte, see §6); smallest new disclosure surface of the four models (a 5-label band, never a dollar figure, for rivals); cannot structurally produce "wealthiest = most powerful," because wealth never enters an order at all, only a label.
**Weakness:** a band is coarser than a leaderboard — two Leveraged studios cannot be told apart from this table alone (their detail pages can). This is judged an acceptable trade given the Owner's own caution against over-weighting wealth.

### Model comparison

| | A | B | C | **D (recommended)** |
|---|---|---|---|---|
| Money inside Power Ranking's math | No | **Yes** | No | No |
| Financial info in the *quarterly* view | Yes (separate ranked table) | Yes (inside the rank) | **No** | Yes (band, not ranked) |
| Risk of "wealthiest = most powerful" misread | Medium (separate but still ordered) | **High** (literally inside the order) | Low | **Lowest** |
| New rival disclosure required | Near-exact dollar figures | Banded/capped lane value | Single Valuation number only | Band only, no dollars |
| Reuses shipped tie rule unchanged | Yes | Yes (extended lane) | Yes | **Yes, byte-identical** |
| Answers Owner's "somewhere meaningful" ask | Partially (separate tab) | Yes | Weakly | **Yes, in the same table** |

---

## 6. Reconciling the tie rule: shipped competition ranking vs. the P15A.2 dense-tie candidate

The shipped Studio Charts use **competition ranking** (1-1-3): `rank = 1 + count(strictly greater)` (`bridge/industry.ts:71-73, 121-123`). The pre-Owner-direction P15-PACKAGE §23 candidate for Power Ranking's *composite sum* proposed **dense ranking** (1-1-2) instead — but that choice was never Owner-ruled (P15-PACKAGE §12.2/B7: "Owner must approve/revise/reject... dense-tie law before P15A.2"). No dense-rank code exists anywhere in the accepted snapshot; competition ranking is the only tie semantic the codebase has ever shipped or tested.

**Recommendation: retire the dense-tie proposal; adopt competition ranking everywhere, including any new Power Ranking lane or sum.** Reasons:

1. **Zero new code.** Every model above can reuse `bridge/industry.ts`'s existing `rank()` function unchanged — it already handles the exact shape (`{studioId, value}[]` → rank). A second tie semantic means two rank utilities, two sets of tests, and a real risk the two surfaces disagree on an identical tie.
2. **Player-facing convention.** Public leaderboards (sports "Power Rankings," OpenTTD's League Table) conventionally skip after a tie (1-1-3); dense ranking (1-1-2, no skip) is a database/reporting convention (SQL `DENSE_RANK`) that reads as a bug to players expecting "two studios tied for 3rd means the next one is 5th."
3. **UX-005 already only commits to "ties share rank with stable studioId display order"** — it does not name a skip rule, so adopting competition ranking is not a reversal of any frozen law, only a completion of one that was left open.

Worked demonstration, using the Output lane values from §4's rank-1 tier (Rose Lantern = Silver Current = 6, Your Studio = 5, Bellwether = 2):

| Studio | Output value | Competition rank (shipped, recommended) | Dense rank (superseded proposal) |
|---|---|---|---|
| Rose Lantern | 6 | **1** | 1 |
| Silver Current | 6 | **1** | 1 |
| Your Studio | 5 | **3** | 2 |
| Bellwether | 2 | **4** | 3 |

This is a genuine sub-decision the Owner never formally closed (B7), so it is listed in §9 as an outstanding decision — but it is a light one, since the recommendation is simply "keep doing what already ships," not a new design.

---

## 7. Disclosure rule and AI symmetry

**Baseline fact:** rival cash is fully private today. `StudioIndustryStudio` carries no cash/account/debt field; `RivalAccount` is never read by `bridge/industry.ts`; even the player's **own** in-flight theatrical run explicitly withholds "future receipts, costs and studio revenue" (`bridge/industry.ts` `businessNotice` text) until settlement. No financial fact about any studio, player included, has ever been made public mid-flight in the shipped design. UX-010 ("facts become public only after an authoritative announcement/disclosure/event threshold; absence remains unknown/private, not false") is the closest existing law, and any new financial disclosure needs an equivalent threshold defined for it — this has never existed for money before and is a genuinely new decision, not an extension of an existing one.

**Recommended disclosure rule (serves Model D, and is the minimum viable rule for A/B/C too):**

- The player's **own** studio shows exact Net Worth, exact Valuation, and the full P11 finance detail it already has — no change.
- **Every rival** shows only the 5-label Financial Standing band, computed from the same ratios, never a dollar figure, never a precise rank position by wealth. (Models A and B require strictly more disclosure than this — see the model comparison table — and should be weighed against that cost.)
- The band recomputes on the same quarterly cadence as the chart, using the same `sameCohort`/`comparable` machinery already used for movement, so a band can legitimately read "no comparable prior data" the same way a rank can today.

**AI symmetry.** Three separate claims, and they hold at different levels:

1. **Computation symmetry (already true and must stay true):** `updateStanding` and the output-count already run identically for `RivalBusiness.standing` and `state.studio.standing` — no separate "easy mode" curve for AI studios. Any new Net Worth/loan-interest law must be written once and applied to `RivalAccount` and the player's ledger identically, exactly like Standing. This is a genuine build dependency for whichever package ships loans (Owner direction F; P11 for the ledger math): if a rival's borrowing uses a different rate or repayment law than the player's, the Financial Standing band becomes an unfair comparison even though it looks like a fair one.
2. **Decision-access symmetry (already true and expected to stay true):** the AI's own decision code obviously has full read access to its own account, exactly as the player's own client has full access to the player's own P11 report. This is not a leak — it's the same "own studio sees itself in full" rule Model D's disclosure rule already states for the player.
3. **Disclosure symmetry (the new rule above):** what becomes *public* about any studio — player or rival — must be governed by the same threshold. The player does not get to see rival dollars any more than a rival's public profile shows the player's dollars. This is what actually answers "what would leak": under Model D, nothing beyond a coarse band ever leaks about anyone; under Model A, near-exact rival wealth would need to leak to make the Finance leaderboard orderable at all.

---

## 8. Behavior under consolidation to 2–3 studios

The existing cohort machinery degrades gracefully in the arithmetic sense: `rank = 1 + count(greater)` and `sameCohort` (`current.rows.length === prior.rows.length && every row matches`) both work correctly for any cohort size down to one. A Financial Standing band needs no cohort at all — it is meaningful for a single studio (Model D therefore degrades better than a ranked Finance leaderboard, which starts to look absurd or falsely dramatic with only 2–3 entries).

**One structural gap worth flagging, with the smallest correction.** The chart-row builder that feeds every model above currently filters only `identities.filter(s => s.enteredWeek !== null)` (`hollywoodTick.ts:306`) — there is **no exclusion for a closed/insolvent studio**, because `StudioIdentity` has no status field yet (confirmed: exact-key validated, no `status`). Per Owner direction D and the existing UX-005 law ("closed studios leave current charts but remain historical"), a bankrupt studio must stop appearing in the *live* Power Ranking cohort the quarter it closes, while its historical rows must remain permanently viewable. **Smallest correction:** whichever package implements the failure ladder (most likely P15B, per the existing P15-PACKAGE placement of "active, warning, distressed, dormant, recovered, archived studio filters") must add one symmetric condition to this filter — e.g. `&& s.closedWeek === null` — mirroring the `enteredWeek !== null` check that already exists in the exact same line. This is not a P15A.2 blocker (Power Ranking can ship correctly against the current all-active cohort first), but it must land before rival failure (direction D) ships, or a bankrupt studio would appear to keep "competing" in the Power Ranking forever, contradicting direction G's own "no artificial floor / report severe failure, don't hide it" instinct.

Two secondary, non-blocking effects on consolidation, both already handled correctly by existing code and listed for completeness:

- **Movement legitimately goes quiet the quarter a rival exits.** `sameCohort` goes false the instant the roster shrinks, so every surviving studio's `movement` correctly reads "no comparable prior cohort" for one quarter rather than showing a misleading up/down arrow caused only by the roster change. No design gap here — it is worth a UI copy note distinguishing "cohort changed because of a failure" from "cohort changed because of an ordinary new entrant," but that is a P15B polish item, not a structural fix.
- **A 2–3 studio Power Ranking stays informative** (it is still "who's #1 of 3"), but a Model A/B Finance leaderboard of only 2–3 entries starts to read as a private balance-sheet exposure rather than a competitive feature — another point in Model D's favor as the field consolidates, which the Owner's own G/H direction (no synthetic floor, consolidation is acceptable emergent history) makes a realistic end state to plan for.

---

## 9. How this stays distinct from P08 Standing — extend, don't retire

The task's own framing is the right question: is the shipped `HollywoodChartSnapshot` + per-lane `rank()`/`movement` surface **extended, renamed, or retired** by P15A.2?

**Recommendation: extend, and rename the public framing — never retire, never fork a parallel data model.**

- The Owner's three candidate Power Ranking lanes already map almost onto the shipped lanes: `industryPrestige` ≈ "prestige/honors" and `output` ≈ "studio output/reliability" are near-exact matches; "recent commercial performance" is closest to `commercialConfidence` (explicitly defined in code as realized ROI/budget discipline, `standing.ts` header) rather than to `audienceAwareness` (fame/visibility). This mapping decision — which shipped lane(s) count toward Power Ranking, and whether `audienceAwareness` stays a visible-but-uncounted fourth informational lane or gets folded in — is itself a small remaining Owner decision (§10).
- What must change: the notice text at `bridge/industry.ts:110` ("there is no combined Power score") is now false the moment Power Ranking ships and needs an update; the view's public framing/title can now legitimately say "Power Ranking" where it currently says "Studio Charts" for the ranked view, while the underlying per-lane comparison can keep the "Studio Charts" name for the non-ranked, all-lanes-shown browse view — these can coexist as two labels over the same data, exactly as Simutrans does (one sortable window, many lane choices).
- What is genuinely new, not an extension: (a) the Financial Standing band (Model D) or any financial surface at all — zero precedent exists; (b) annual summary snapshots, named in INT-009 but not built — only two snapshots (`chart`/`previousChart`) are retained today, so a multi-quarter Power Ranking *history/trend* view is new storage, not a UI change; (c) deciding whether a single summed rank position is published at all, or only per-lane ranks as today (the Owner's "transparent multi-factor" language is compatible with either; this analysis leans toward keeping per-lane display primary, with a sum shown as one more transparent number beside it rather than the headline, to avoid re-litigating lane weights the way Model B's weakness illustrates).
- **P08 Standing itself is untouched by all of the above** — SAF-012 stays satisfied because nothing here adds a field to the `Standing` type; Power Ranking continues to read a *copy* of `standing` frozen into each chart row, never the live value, preserving the existing "snapshot vs. persistent" distinction the code already encodes structurally, not just by convention.

---

## 10. Recommendation, package ownership, and what remains for the Owner

**Recommend Model D.** It is the only one of the four that (a) cannot structurally produce a "wealthiest = most powerful" misread, because no financial ordering of any kind exists in it; (b) still puts financial risk in front of the player every quarter, in the same table, unprompted; (c) requires the least new rival disclosure of the three financially-aware models; (d) leaves Power Ranking's math, tie rule, and governing law (SAF-012, UX-004) completely undisturbed; and (e) degrades correctly as the field consolidates toward 2–3 studios, unlike a Finance leaderboard.

### Package ownership

| Piece | Owner | What it adopts | What it rejects |
|---|---|---|---|
| Power Ranking (3 creative lanes, quarterly, per-lane + optional shown sum) | **P15A.2** | Extends the shipped `HollywoodChartSnapshot`/`bridge/industry.ts` lane machinery; reuses the shipped competition-ranking tie rule unchanged; renames public framing | The pre-direction dense-tie candidate (§6); folding money into the lane set (Model B) |
| Financial Standing band | **new P15D** (parallel to P15A.2, not a sub-slice of it — it is a different data domain, balance-sheet not reputation) | A 5-label disclosed band computed from Net Worth/debt ratios, shown beside Power Ranking, never summed or ranked | A rival Net Worth/Finance leaderboard (Model A); a raw-dollar public field for rivals |
| Net Worth (exact, own studio) / Loan ledger math | **P11** (ledger/debt authority, per Owner direction F) for the player; **P15D** for the parallel rival computation and any cross-studio presentation | Assets-minus-liabilities from existing ledger categories (`financeReport.ts` `FINANCE_CATEGORIES` already tracks capex/demolition-refund lines this would extend) | Any change to `Standing`'s shape (SAF-012) |
| Valuation (derived, situational) | **P15D**, feeding **P16+** once M&A (Owner direction I) is scoped | Book Net Worth plus a simple, disclosed earnings adjustment (§4's illustrative formula, not a proposal) | A market-cap/share-price stock simulator; any full enterprise value that requires library/IP ownership (stays P16+, per INT-011) |
| Closed-studio cohort exclusion in the chart builder | **P15B** (failure ladder), one-line addition to `hollywoodTick.ts:306` before shipping direction D | A `closedWeek === null` condition symmetric to the existing `enteredWeek !== null` check | Leaving bankrupt studios visibly "competing" forever |

### Remaining genuine Owner decisions

1. **Confirm Model D** (or explicitly choose A/B/C instead) as the presentation model — this is the central open call this section exists to inform.
2. **Confirm the disclosure rule**: band-only for rival financial state, never raw dollars, as stated in §7 — this is a brand-new disclosure boundary with no existing precedent to fall back on, so it needs explicit sign-off, not inference.
3. **Confirm competition ranking (not dense ranking)** as the tie rule for any new Power Ranking surface, closing the open B7 item with "keep what already ships."
4. **Rule on the lane-mapping question in §9**: does `audienceAwareness` count toward Power Ranking, stay a visible fourth informational lane, or drop from the ranked view entirely?
5. **Rule on whether a single summed rank position is published at all**, or whether per-lane ranking (as today) remains primary with no headline sum — a judgment call this analysis leans against summing but does not treat as settled.
6. **Whether the illustrative Valuation formula in §4 is worth researching further for P15D**, or whether Valuation should ship *unformulated* (Net Worth only) until a P16+ M&A system needs a real sale-price number.

---

*All dollar figures, lane scores, and bands in this document are labelled PROVISIONAL and exist solely to compare presentation models; none are a tuning proposal.*
