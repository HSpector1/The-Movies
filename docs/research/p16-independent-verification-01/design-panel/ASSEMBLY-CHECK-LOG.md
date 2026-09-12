# P16 Independent Verification Report — Addenda & Consistency Check Log

Checked `P16-INDEPENDENT-VERIFICATION-REPORT.md` against ADDENDA-AND-STYLE.md §A–D. Result: report was already substantially compliant; three small gaps found and fixed in place (minimal edits, no content removed).

## Findings and fixes

1. **§A.1 (Full Absorption as selected model) — §10 gap, fixed.** §1, §5, §6, §9, §18, §20 (after fix), Appendix B, and the closing table all already stated Full Absorption as the OWNER-SELECTED initial P16C model. §10 (Rival M&A) discussed the symmetric transaction *law* but never stated that the resulting *operating-model outcome* (Full Absorption) is likewise symmetric across player-as-buyer and AI-as-buyer deals. Added one paragraph after the symmetric-transaction-law paragraph making this explicit, cross-referencing §5/§6 and the addendum.

2. **§A.1 — §20 gap, fixed.** §20 ("Genuine remaining Owner decisions ONLY") correctly excluded the operating-model choice as an item (it's settled, not open) but never said so, which reads ambiguously against the checklist's expectation that §20 also reflect the addendum. Added a parenthetical to the section's lead sentence stating that Full Absorption is deliberately absent from the list because it is already-settled OWNER-SELECTED PRODUCT DIRECTION, not an open item.

3. **§A.2 (26-week-capped charge) — Appendix B R19, fixed.** R19's one-line rule statement said inherited staff "may then be released under ordinary, unmodified termination law" without naming the P14 26-week-capped charge the addendum requires be cited wherever the report discusses releasing inherited staff. (§6 Q4, §17, and the P14 row of the §18 ownership table already cited it correctly.) Rewrote the R19 line to name the lesser-of(remaining guaranteed salary, 26 weeks' base) charge, note it supersedes the accepted-code 50% fraction, and split its evidence-class cell into RESEARCHER RECOMMENDATION (contract transfer) / OWNER-SELECTED PRODUCT DIRECTION (26-week cap, addendum P14 §3.4).

## Verified clean (no changes needed)

- **§A.1 — no sentence anywhere presents Model D, a retained label, or a subsidiary as selected/approved for Project: Studio.** Every "Model D" / "retained label" / "subsidiary" occurrence is either (a) explicitly marked LATER OPTION — not selected / RESEARCHER RECOMMENDATION for a possible later slice, or (b) real-world/comparator evidence (Pixar, Miramax, Software Inc., MGT2, Offworld, Capitalism Lab) presented as what other games/companies did, with an explicit framing note in §15/§16 that this is comparator evidence, not a reopening of the Owner's selection.
- **§A.2 — the code's 50% fraction (`HIRING_TERMINATION_FRACTION`) is cited only as the ACCEPTED CODE FACT that the P14 26-week cap recalibrates**, never as current governing law, in §6 Q4, §17, and the corrected R19 line.
- **Evidence-class labels** — every rule, recommendation, and dollar/week/percentage figure checked carries a label; §20's own text explicitly demotes engineering constants (premium bands, holdback/cooldown lengths, reserve fractions) to Current Ops NUMERICAL/CONTENT HYPOTHESIS items rather than Owner decisions, and none of §20's eight items is an engineering constant or an already-settled item.
- **Section structure** — headings run 0–21 with no gaps or duplicates, followed by the closing table and Appendices A–C; every Contents entry's anchor matches its heading's auto-generated slug.
- **Cross-references** — R01–R32 (R04 split a/b/c) all defined once in Appendix B with no orphaned or mismatched rule numbers; evidence dossier links use the exact `evidence/NN-NAME.md` filenames specified in ADDENDA §D; inline "dossier NN" prose references (not links) are consistent with dossier numbering.
- **No scratchpad/`/Users` paths or session links** anywhere in the report; the only occurrences of the word "scratchpad" are two sentences stating that none exist.
- **No wholesale copied source text** — every original-game and real-world quotation is a single short phrase or one sentence, consistent with ADDENDA §D's "quote at most a sentence" rule.
- **Evidence-class legend** is present in §0 and cross-referenced from Appendix A.

## Files touched

- `P16-INDEPENDENT-VERIFICATION-REPORT.md` — three minimal in-place edits (§10, §20, Appendix B R19), no other content changed.
