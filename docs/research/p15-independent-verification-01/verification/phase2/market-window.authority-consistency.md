# Adversarial Verification — LENS: Authority & Direction Consistency

**Target:** `<scratchpad>/out/phase2/market-window.md`
**Verifier scope:** does the analysis reopen a settled Owner choice, silently convert an open decision into law, mislabel prior P15 text, assume/ignore code facts, violate package-ownership law, or overstate source discipline?

## Verdict: VERIFIED WITH CAVEATS

The analysis is well-grounded: it does not reopen Direction A's genre+window formula family, does not redesign the frozen §12.1 same-week batch/self-exclusion law, correctly excludes screens/exhibition, keeps every numeric parameter labeled PROVISIONAL, and lists a genuine, non-trivial Remaining-Owner-Decisions set rather than silently hardening ~4 weeks into law. Nearly every one of its ~20 code and Annex citations was checked byte-for-byte against `accepted-592e926/` and the Builder Annex/Package text and is accurate (tuning.ts:27/56/57/414/419-420/859-861, types.ts:9/274-281, calendar.ts:3, hollywoodStartingData.ts:8-35, hollywoodTick.ts:146/176/306, reception.ts:596/679, worldgen.ts:645, Annex C.1/D.1/D.2.1/D.3/F.3/L.3/L.4/K.1 fixture names). Two concrete defects survive, both fixable without touching the recommendation.

## Problems found

1. **Wrong file:line citation for the genre-affinity mechanism (source-fidelity / code-facts defect).**
   §2's fact table cites "Rival genre-affinity policy | per-genre weight = 5 if the genre is one of the rival's authored anchors, else 1; concept genre is a weighted random draw | `src/core/hollywoodTick.ts:160-161`". Lines 160-161 of `hollywoodTick.ts` at 592e926 are inside `computeForecast(...)`/`forecastHistoryForOwner(...)` — unrelated to genre weighting. The actual code is split across two other files:
   - the weight assignment ("5 if anchor else 1") is built in `enterRival` at `src/core/hollywood.ts:156`: `affinities:Object.fromEntries(GENRE_ORDER.map(g => [g,template.anchors.includes(g)?5:1]))`;
   - the weighted random draw of a concept's genre is at `src/core/hollywoodTick.ts:181-182`: `let roll=chooser.next()*GENRE_ORDER.reduce((sum,g)=>sum+b.policy.affinities[g],0); const genre=GENRE_ORDER.find(g=>(roll-=b.policy.affinities[g])<0)??GENRE_ORDER[0]!`.
   The substance of the claim is correct (verified independently) and the whole §3 density arithmetic correctly depends on it, so no conclusion is undermined — but the task's own method rule ("cite file:line when you rely on code") is violated at exactly the citation the density table depends on most.
   **Corrected citation:** "weight assignment: `hollywood.ts:156`; weighted genre draw: `hollywoodTick.ts:181-182`" (not `hollywoodTick.ts:160-161`).

2. **Internal mislabeling in the §12 prior-claims disposition table (authority-consistency defect).**
   §12's row "Prior-claims register A7/A9/A13 (Owner selected ~4 wk, OQ1 superseded, window is a versioned parameter)" lists **Prior label: CONFIRMED** and disposition "CONFIRMED, unchanged by this section." That is correct for A7 and A13, but **wrong for A9**: the phase-1 prior-claims register (`out/phase1/prior-claims.md:72`) records A9 (PKG §24 OQ1) with disposition **SUPERSEDED BY OWNER DIRECTION**, not CONFIRMED — and this is the *same* citation (§24 OQ1) that market-window.md's own §1 and the very first row of its own §12 table correctly label "SUPERSEDED BY OWNER DIRECTION." The document therefore gives two different, contradictory dispositions to the identical source claim within the same memo: correct in row 1 of §12, wrong when re-grouped into row 3.
   **Corrected statement:** split the grouped row — keep A7 and A13 together as "Prior label: CONFIRMED → CONFIRMED, unchanged," and list A9 separately as "Prior label: OPEN QUESTION → SUPERSEDED BY OWNER DIRECTION (Owner selected the ~4-week window family; the exact value/curve remains open)," matching both the register and the document's own row 1.

## Checks performed and passed (no violation found)

- **Does not reopen a settled choice.** §1 explicitly declines to reopen genre+window as the formula family and declines to redesign §12.1's frozen same-week batch/self-exclusion law; §11 concludes no structural problem justifies reopening ~4 weeks.
- **Does not silently convert an open decision into law.** Every numeric parameter proposed (`exposureWindowWeeks=4`, the 1.00/0.55/0.20 taper, `saturationStockWindowWeeks=26`, half-life ≈13, `contributionBounds` reach-scaling) is explicitly re-listed in §10's "Remaining genuine Owner decisions," items 1-5, so nothing is smuggled past the Owner as settled.
- **Screens/exhibition** correctly stays excluded per Direction A ("No physical theater/screen allocation market unless evidence shows a major benefit") and per P15-PACKAGE §23's own market-formula recommendation.
- **Package-ownership law.** P15A is correctly named as owner of the temporal/saturation lanes (matches P15-PACKAGE §2/§3.3.1's P12C→P15A re-homing and §12.1); P15A.2 (ranking), P12 (roster authoring), and P13 (era/taxonomy stability, OQ5) are each correctly kept out of scope rather than absorbed into this section's recommendation.
- **Binding laws 8/9 (no player-only penalty, no hidden difficulty subsidy)** are correctly invoked in §6 to block a player-only anti-spam gate, with the exact law numbers matching P15-PACKAGE §11 items 8 and 9 verbatim.
- **No fabricated code.** The analysis correctly treats `CompetingRelease`/`competingSlate` as an "inert but correctly-shaped placeholder" (types.ts:274-281, worldgen.ts:645, reception.ts:596/679 `competitionFactor ≡ 1.0`) rather than an active mechanic — consistent with the digest's correction of other phase-1 reports on this exact point (digest lines 153, 200).
- **Source discipline.** Every original-game citation (Prima p.58 saturation "two factors: time and saturation," p.82 "10 in five years," MEDIUM-HIGH confidence tag) matches both the source doc (`out/phase1/orig-rivals.md:47-49`) and the corrected page numbers in `_DIGEST.md` (lines 65, 99, 159, 213) — no page-number drift of the kind the digest flagged elsewhere.
- **Hostile-fixture numbers** (64 studios, 4,000 active releases, 512-release same-week batch, 6,240 weeks) match P15-PACKAGE §19 and Annex L.3 verbatim; the O(active exposures + due events) / no-pairwise-scan requirement is correctly cited to Annex L.4.
- **Annex entity/field names** (`exposureWindowWeeks`, `decaySchedule`, `contributionBounds` at D.1; the 64-aggregate-row cap and ≤100-row chunks at D.2.1; `inputSnapshot` "prevents later decay or retitling" at D.3; the six F.3 explainability questions; fixture names `market-cancel-before-release`/`market-delay-across-window`/`market-decay-boundaries` at K.1) are all quoted or referenced accurately, and the one new fixture name it proposes (`market-shrinking-cohort`) is clearly flagged as new, not claimed to already exist.
- **Quote length.** All direct quotes from Owner Direction, Prima, and the Annex are short (≤~15 words), respecting the ≤40-word rule.

## Missing items

- The §12 disposition table would be strengthened by citing Annex D.2 `sourceReachBandOrValue: public authoritative input only` directly, since it independently corroborates the reach-scaled `contributionBounds` recommendation in §6/§7.1 (OQ2) — not an error, just an available citation the analysis leaves on the table.

## Strong points

- Reused the frozen §12.1/Annex C.1 state machine and D.2.1/D.3 entities verbatim rather than inventing parallel structures — the single biggest way this kind of task usually goes wrong (redesigning frozen law) was avoided entirely.
- Correctly separated the "open decision" layer (window value, curve shape, OQ2, saturation-window/half-life) from the "already-Owner-settled" layer (genre+window family, screens excluded), which is exactly the distinction this lens polices most closely.
- The §5 computational-cost argument correctly derives that window size affects only the constant on the O(active exposures) term, not the complexity class — a defensible closing of Open Question 1's cost dimension without overclaiming a specific byte/time budget (correctly deferred to "measured implementation reconnaissance" per P15-PACKAGE §19).
