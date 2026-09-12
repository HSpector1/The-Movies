# Adversarial verification — "ranking-vs-value" (Power Ranking vs Net Worth vs Valuation)

**Lens:** AUTHORITY & DIRECTION CONSISTENCY.
**Verifying:** `<scratchpad>/out/phase2/ranking-vs-value.md`

**Verdict: VERIFIED WITH CAVEATS.** The analysis does not reopen any settled Owner-direction letter (A–K), does not silently convert an open decision into law, and every accepted-code fact I independently re-checked against `accepted-592e926` held up exactly as claimed. Package-ownership assignments track existing law (INT-009, SAF-004, SAF-012, Direction B/F) correctly. The real problems are process/labeling gaps: the file skips the PREAMBLE-mandated CONFIRMED/QUALIFIED/CORRECTED/SUPERSEDED-BY-OWNER-DIRECTION tagging on the single prior-P15 claim most central to its own topic, invents an authority-doc citation label that does not exist, and drifts from one binding digest correction on a comparator page number. None of these overturn the recommended Model D or its package boundaries.

---

## 1. Violations found

### 1.1 [MODERATE] Missing required CONFIRMED/QUALIFIED/CORRECTED/SUPERSEDED label on the exact prior-P15 claim Direction B reopens

The PREAMBLE's METHOD requires: "Distinguish CONFIRMED / QUALIFIED / CORRECTED / SUPERSEDED BY OWNER DIRECTION when you touch prior P15 claims." The single most on-point piece of prior P15 text for this task is `P15-PACKAGE.md` §12.2 (line 439-458) / §23 (line 803, verified by direct read): a "PRELIMINARY RECOMMENDATION" that Power Ranking be "three independent public 0–10 lanes" that "never reads Standing, cash/valuation, private slate, technology adoption, talent popularity, or a client calculation," with "Candidate ranking points [as] the unweighted lane sum (0–30). Equal totals share a dense rank." This is precisely the prior text Direction B's "research question: fourth lane vs separate Valuation/Net Worth ranking beside it vs partial vs other" reopens.

The analysis's §2.2 table quotes UX-003/UX-004/UX-005/SAF-004/SAF-012/INT-009 accurately (all verified verbatim against `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md`, see §2 below) but never quotes or labels the §12.2/§23 "never reads... cash/valuation" clause or its "unweighted sum, dense ties" candidate with any of the four required tags — a `grep -i` for "never reads", "excludes.*valuation", "cash/valuation" and for CONFIRMED/QUALIFIED/CORRECTED/SUPERSEDED against the file returns exactly one use of the vocabulary, applied only to the *original 2005 retail game's* Studio Rating (line 53), never to this P15-PACKAGE clause.

This is not a hypothetical omission: two sibling phase-2 analyses, working from the same authority corpus, did this labeling exercise for this exact clause —
- `net-worth.md`:409-412: *"**SUPERSEDED BY OWNER DIRECTION (pending replacement)** — `P15-PACKAGE.md`:803 / `P13-P15-LONG-RANGE-ROADMAP.md`:682, prior Power Ranking recommendation explicitly 'excludes Standing, cash/valuation.' Direction B reopens this as a live research question... full exclusion is no longer settled, but no replacement is decided either."*
- `boundaries-corrections.md`:87: *"Power Ranking definition = three lanes only (commercial/prestige/delivery), explicitly excludes cash/valuation (`P15-PACKAGE.md` §23, §12.2) | **SUPERSEDED BY OWNER DIRECTION (B), partially**..."*

ranking-vs-value.md's substance is compatible with this (it correctly treats the fourth-lane question as open, per §0 and §10 item 1), so this is a completeness/labeling gap rather than a substantive contradiction — but it is exactly the check this verification lens exists to make ("label prior P15 text correctly as CONFIRMED/QUALIFIED/CORRECTED/SUPERSEDED BY OWNER DIRECTION"), on the one piece of prior text most central to the file's own subject.

**Corrected statement to add (near §2.2 or §6):** *"P15-PACKAGE §12.2/§23's 'never reads Standing, cash/valuation...' clause is SUPERSEDED BY OWNER DIRECTION B, partially: the categorical exclusion of any financial signal from Power Ranking is reopened as a live research question (this is what §4-§5 answer); the same clause's engineering discipline — never read live/raw state, only versioned/disclosed facts — survives and is honored by every model in §5. The clause's 'unweighted 0–30 sum, dense ties' candidate is addressed separately in §6 and is QUALIFIED, not confirmed: never Owner-ruled, and this analysis recommends against the dense-tie half of it (see §6) while remaining agnostic on whether any headline sum ships at all (§10 item 5)."*

### 1.2 [MODERATE] Fabricated/misattributed citation label "B7"

§6 states: *"that choice was never Owner-ruled (P15-PACKAGE §12.2/B7: 'Owner must approve/revise/reject... dense-tie law before P15A.2')"* and §10 item 3 refers to "closing the open B7 item." This presents "B7" as if it is a label used inside `P15-PACKAGE.md` itself.

Verified: `grep -n "B7\b"` against `P15-PACKAGE.md`, `P15-BUILDER-ANNEX.md`, `P13-P15-OWNER-RULINGS.md`, `P13-P15-LONG-RANGE-ROADMAP.md`, and `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md` returns **zero matches**. The only place "B7" exists anywhere in the reviewed corpus is `phase1/prior-claims.md:93` — a **phase-1 analyst's own internal claim-tracking row ID**: `"| B7 | B | PKG §12.2 (L456–458); §26 P15A.2 | Owner must approve/revise/reject lanes, bands, four-film cap, 52-week window, unweighted sum, dense-tie law before P15A.2... | OWNER DECISION REQUIRED |"`.

The underlying fact (Owner never ruled on the dense-tie candidate) is correct and the P15-PACKAGE quote itself is accurate (verified verbatim against P15-PACKAGE.md:457-458). But citing "B7" as a `P15-PACKAGE` reference conflates a downstream evidence-tracking artifact with the authority document itself — a reader who goes looking for "item B7" inside P15-PACKAGE.md (as the phrasing invites) will not find it there, and could reasonably (and wrongly) conclude the Owner has a numbered open-items list that includes it.

**Corrected statement:** cite it as *"phase1/prior-claims.md's own tracking item B7, itself referencing P15-PACKAGE §12.2 (lines 456–458)"* — never as a P15-PACKAGE label.

### 1.3 [MINOR, digest-binding] Prima page citation drifts from the digest's explicit correction

§2.2 cites the retail Studio Rating weights as "(Prima pp. 45–46, 51)". The phase1-verify `_DIGEST.md` preamble lists as one of its binding, must-respect corrections: *"Prima weights are on pp.46/47/51... saturation p.58, Lifetime Honors p.80."* The analysis's "45–46" range reintroduces the page-45 slip the digest specifically corrected (Capital/Movies/Stars are on p.46; Lot Prestige — cited by the analysis's own "Capital 24% + Movies 24% + Stars 24% + Lot Prestige 14% + Awards 14%" breakdown — is on p.47, not covered by "45–46" at all). This is a source-discipline violation of the explicit rule that "its corrections are binding." (Independently also caught, in more detail, by the sibling `ranking-vs-value.break-it.md` §3 — noted here only because checking digest compliance is squarely inside this lens too.)

**Corrected citation:** "Prima pp. 46 (Capital/Movies/Stars), 47 (Lot Prestige), 51 (Awards)."

---

## 2. Code-fact and package-law spot checks that held up (verified directly, not just trusted)

- `bridge/industry.ts:110` notice text — verified verbatim: `notice:'Public facts only. Standing channels and film measures have separate meanings; there is no combined Power score.'`. The analysis correctly uses the digest-corrected line number (110, not the :117 several other phase-1 reports mis-cited).
- Competition-rank formula `1+snapshot.rows.filter(r=>value(r)>value(own)).length` — confirmed at `bridge/industry.ts:71` (cited range 71-73 is close; function starts at line 68 — trivial, substance correct) and the "recent" output-lane variant `1+rows.filter(...)` at line 122 (cited 121-123, correct in substance).
- `INDUSTRY_LANES` = `['audienceAwareness','industryPrestige','commercialConfidence','output']` at `bridge/schema/industry-schema.ts:3` — exact match. `StudioIndustryStudio` (line 7) carries no cash/account/debt field — confirmed, no such field exists.
- `HollywoodChartSnapshot`/`previousChart` two-snapshot-only retention — confirmed in `hollywoodTypes.ts` (`chart: HollywoodChartSnapshot | null; previousChart: HollywoodChartSnapshot | null`, no history array).
- The chart snapshot's `output` field (`hollywoodTick.ts:310`, `b.development.projects.length-b.activeScriptOrdinals.length+...`) is characterized as "released-film count" — traced through `scriptDevelopment.ts`/`hollywoodValidation.ts:262` (`activeScriptOrdinals` excludes exactly the projects with `status==='produced'`) and `hollywoodTick.ts:247/253` (a rival's film enters `h.films` via a `filmReleased` receipt at the same tick its script becomes `'produced'`). Confirmed: for rivals, "produced" and "released" are the same event, so the characterization is accurate.
- `commercialConfidence` defined as "realized PROFITABILITY (ROI on committed cost) and BUDGET DISCIPLINE" — confirmed verbatim in the `standing.ts` header comment (D-6 channel-meanings block).
- `updateStanding` runs identically for player and rival — confirmed: called at `hollywoodTick.ts:250` for `RivalBusiness.standing` and `tick.ts:783` for the player, same function.
- `FINANCE_CATEGORIES` in `financeReport.ts:6-13` — confirmed it literally includes `constructionCapex`, `facilityDemolitionRefund`, `setCapex`, `setDemolitionRefund` as claimed.
- Package-law quotes UX-003 (P12A register line 136), UX-004 (137), UX-005 (138), SAF-004 (228), SAF-012 (236), INT-009 (196), UX-010 (143) — every one checked verbatim against `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md` and matches exactly as quoted (all ≤ 40 words, within the short-quote rule).
- The analysis correctly avoids the specific comparator errors the phase1-verify digest flagged elsewhere in the corpus: it does not use GearCity's incorrect "Takeover Price" formula (that error lives in `ma-auction.md`, not here), does not misstate Simutrans's tie-break direction (not discussed here), and does not repeat the "Capitalism Lab 'Playing Without a Company' is shipped" error (not discussed here). Its own GearCity figures (Evaluation, share-price floor at "0.7× Evaluation") and Capitalism Lab figures (Revenue/Profit/Market-Cap Ranking vs. personal Billionaires Ranking) both check out against `phase1/comp-ranking.md`.

## 3. Cross-analysis consistency (not this lens's primary job, but checked since sibling files were an input)

`net-worth.md` independently arrives at the same package boundary (new **P15D** for Book Net Worth/Valuation) and the same disclosure rule (rivals get a banded signal, never a raw dollar figure) as this analysis's Model D — no contradiction found between the two files on the questions they share.

## 4. Direction-consistency checks that found no problem

- Does not reopen any settled Owner-direction letter (A–K). Direction B is explicitly framed by the Owner as an open "research question" (fourth lane vs. separate ranking vs. partial vs. other) and the analysis answers it as research, listing "Confirm Model D" as remaining Owner decision #1 rather than treating its own recommendation as final.
- Does not add a field to `Standing` (SAF-012) — the Financial Standing band is explicitly kept off the `Standing` type and assigned to a new P15D domain.
- Does not resurrect an averaged "Overall industry score" from the three Standing channels (UX-004) — the worked "Sum/30" in §5 sums three *lane* values (one of which, Output, is not a Standing channel at all), matching the shape P15-PACKAGE §23 itself already anticipates as a *candidate*, and the analysis correctly leaves "whether a summed rank ships at all" as remaining decision #5, not settled fact.
- Correctly treats "no artificial floor"/Direction G language ("report a severe failure... rather than silently adding a floor") accurately in §8's closed-studio cohort-exclusion discussion, and correctly identifies the real code gap (`StudioIdentity` has no status field) with a minimal, additive proposed fix consistent with the P15-PACKAGE's own placement of that filter change under P15B.
- AI/player computation symmetry (§7) is stated correctly and ties it to a genuine build dependency (a future rival loan law must match the player's) rather than glossing over the risk.

---

## Summary

| # | Finding | Severity | Fix |
|---|---|---|---|
| 1 | No CONFIRMED/QUALIFIED/CORRECTED/SUPERSEDED label applied to P15-PACKAGE §12.2/§23's Power-Ranking exclusion clause and dense-tie candidate — the prior text most central to this file's own topic, and one two sibling analyses did label | Moderate | Add the labeling sentence given in §1.1 |
| 2 | "B7" cited as if it is a P15-PACKAGE label; it is actually phase1/prior-claims.md's own tracking ID | Moderate | Re-attribute per §1.2 |
| 3 | Prima page citation ("pp. 45–46, 51") drifts from the digest's binding "pp.46/47/51" correction | Minor (digest-binding) | "pp. 46, 47, 51" |
| — | Several file:line citations off by a few lines from the exact operative statement (`standing.ts:150-207` vs. function starting at 143; `industry.ts:71-73` vs. function starting at 68) | Trivial | Substance independently verified correct in every case; listed for completeness only |

None of these findings touch the recommended Model D, its worked examples, its package-ownership table, or its list of remaining Owner decisions — all of which are internally consistent with the settled Owner direction and with the accepted-code facts I independently re-checked.
