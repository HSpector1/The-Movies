# Dossier 14 — Gap 4: Primary-source verification of "Current Future Ops recommendation" claims against the control-board documents

## Scope

Follow-up task only. Verifies, against the two named primary operations documents, three
assignment assertions that are labelled "Current Future Ops recommendation" or "Current Future
Ops view" rather than presented as settled Owner rulings:

1. §2.E — Model D ("at acquisition choose Absorb Completely, or Absorb Operations + Retain Brand
   as Label") — "Current Future Ops recommendation is MODEL D."
2. §2.T — the P16A/B/C package split — "Current Future Ops recommendation is YES."
3. §2.N — BNW ≠ valuation ≠ price, "healthy acquisition begin[s] from enterprise valuation +
   control premium, while bankruptcy auction price emerges from bids around liquidation/strategic
   value" — "Current Future Ops view: probably yes. Verify."

Also: a scan of the P08–P10 Deferred-Not-Dropped Register for any P16-relevant item (studio
ownership, library, acquisition, rights) absent from every existing dossier's open-questions list.

Not in scope: re-litigating the P16A/B/C boundary itself, re-deriving valuation mechanics, or the
P16/P17/P18 shelf-numbering question — those are covered by dossiers 02, 03, 04, 09, 10 and are
only cited here where this task's search touched them.

## Method & sources consulted

- Read in full: `p12-accepted/docs/operations/PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md` (125
  lines, Revision 03) and `p12-accepted/docs/operations/P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md`
  (77 lines).
- Targeted `grep -inE` over both files for: `model d`, `p16a`, `p16b`, `p16c`, `absorb`, `label`,
  `acqui`, `valuation`, `book net worth`, `premium`, `library`, `rights`, `storyproperty`,
  `bankrupt`, `auction`, `liquidat`, `merger`, `franchise`, `sequel`, `remake`, `ownership`, `ip\b`,
  `brand`, `subsidiar`, `corporate`, `sell`, `sale`, `sold`, `purchase`, `buy`, `bought`, `transfer`.
- For completeness (not required scope, but cheap and load-bearing for the "authority elsewhere?"
  question): the same grep against the two sibling operations docs already cited by dossier 02 for
  the P16→P17→P18 shelf sequence — `PROJECT-STUDIO-FUTURE-PACKAGE-DEPENDENCY-MAP.md` and
  `PROJECT-STUDIO-FUTURE-IMPLEMENTATION-SEQUENCE.md` — both present in the same export directory.
  Zero hits in either for any of the search terms above.
- Skimmed existing dossiers before writing: `grep -l` across `dossiers/*.md` for "control board" /
  "deferred-not-dropped" / "FUTURE-OPS-CONTROL" (hits: `02-authority-corporate.md`,
  `00-KEY-FINDINGS.md`, `09-valuation-finance.md`), then read the exact matched lines, plus a
  full-corpus grep for "Model D" / "P16A" / "P16B" / "P16C" / "Current Future Ops" across all ten
  dossiers, plus an `awk` scan of every dossier's "Open Questions" section for "control board" /
  "future ops" / "deferred". This is what "extend, don't repeat" is based on.
- Nothing failed. Both target files were short enough to read in full rather than sample; no web
  fetch was needed for this gap.

## Findings

1. **The Control Board contains exactly one line that touches P16 territory, and it is not any of
   the three claims under test.** Full-text grep of
   `PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md` for `model d|p16a|p16b|p16c|absorb|label|acqui|
   valuation|book net worth|premium|library|rights|storyproperty|bankrupt|auction|liquidat|merger|
   franchise|sequel|remake` returns one match: line 104, "Long-range sequence remains
   Library/Rights → Franchises/Continuations → Television/Cross-Media. It is not part of this
   stack." — under `## 5. Ready after this stack > ### P16–P18`.
   - Source: `p12-accepted/docs/operations/PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md:104`,
     verbatim above.
   - Proves: this document is a P08–P10 stack-authorization board (its own header: "Canonical
     planning branch: `docs/p08-p10-autonomous-stack-launch-01`"), not a P16 design authority. It
     confirms only that Library/Rights precedes Franchises and Television/Cross-Media in the
     long-range sequence (already CONFIRMED by dossier 02 at line 293/390, citing the same
     locator) — it says nothing about Model D, the A/B/C split, or valuation/premium framing.
   - Confidence: HIGH (exhaustive grep of a 125-line file, corroborated by a full manual read).
   - Prior-prose status: N/A for the three claims under test (no prior dossier cited this document
     for any of them); CONFIRMED for the P16→P17→P18 sequencing claim dossier 02 already made from
     this same line.

2. **§2.E's "Current Future Ops recommendation is MODEL D" has no corresponding passage in the
   Control Board, the Deferred Register, or either sibling ops document.** Grep for `model d` and
   `absorb` returns zero hits in `PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md`,
   `P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md`, `PROJECT-STUDIO-FUTURE-PACKAGE-DEPENDENCY-MAP.md`,
   and `PROJECT-STUDIO-FUTURE-IMPLEMENTATION-SEQUENCE.md`.
   - Source: negative grep result across all four named-authority operations documents.
   - Proves: no separately verifiable Future Ops document states or recommends "Model D." The
     claim's only textual authority is the assignment itself (§2.E). Dossier 02's "Model D" support
     (line 336 "INFERENCE — Model D ... fits the registry law") and dossier 08's "Model D is the
     observed real norm" (line 302) are the researchers' own downstream analyses of the assignment
     premise against code/registry law and real-world M&A respectively — neither claims nor found
     a prior-document source for the recommendation itself. No dossier misstates this; none claimed
     Model D came from a document. This finding closes that open door explicitly: it is confirmed
     absent, not merely unfound.
   - Confidence: HIGH.
   - Prior-prose status: N/A — this is a new negative-existence finding, not a correction of any
     dossier's claim.

3. **§2.T's "Current Future Ops recommendation is YES" (on the P16A/B/C split) also has no
   corresponding passage in either named document, or in the two sibling ops documents.** Same
   grep, same four files, zero hits for `p16a`, `p16b`, `p16c` as a proposed split with a
   recommendation attached. The Control Board's only P16-adjacent content is the single
   undifferentiated "Library/Rights" phrase at line 104 (Finding 1) — it does not subdivide P16
   into A/B/C at all.
   - Source: same as Finding 2; also re-examined dossier 02's own support chain for its "CONFIRMED"
     verdict on §2.T (line 300–302): it rests on `roadmap §20 / P15 §2, §25`, `contract §15
     Revision 02`, and `HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md §5`'s two-pillar backlog — all
     *approved documentation* or *accepted contract* sources, none of them the Control Board or the
     Deferred Register, and none of them literally proposing an "A/B/C" split (dossier 02 itself
     calls it a structural mapping: "the assignment's P16A/B/C split maps onto it exactly," i.e. an
     inference of consistency, not a quoted recommendation).
   - Proves: dossier 02's "CONFIRMED" status for §2.T is correct on its own terms (the split does
     not contradict any accepted document) but rests on inference-by-structural-fit against
     roadmap/contract prose, not on a document that itself recommends the A/B/C split — and
     specifically not on either document PATHS.md names for this exact authority question. The
     assignment's phrase "Current Future Ops recommendation" for §2.T is, like §2.E, self-referential:
     its authority is the assignment text, not a separately verifiable Future Ops artifact.
   - Confidence: HIGH that no such passage exists in the two named documents (exhaustive grep +
     full read); HIGH that dossier 02's underlying "CONFIRMED" reasoning is inference rather than
     quotation (verified by re-reading its own cited lines).
   - Prior-prose status: QUALIFIED. Dossier 02's CONFIRMED verdict for §2.T stands but should be
     read as "consistent with, not sourced from" prior documentation; it was never sourced from the
     Control Board or the Deferred Register, and no dossier claimed otherwise.

4. **§2.N's BNW/valuation/price separation and "healthy = valuation + premium, bankruptcy =
   liquidation/strategic bids" framing also has no corresponding passage in either named document.**
   Grep for `book net worth|premium|liquidat|valuation` (control board) and the same terms
   (register) returns zero hits relevant to acquisition finance in either file — the register's
   only `LATER`/`liquidat`-adjacent content is P09 land/facility material (Finding 6 below), not
   corporate valuation.
   - Source: same exhaustive grep, same four operations documents.
   - Proves: the "Current Future Ops view: probably yes. Verify." framing in §2.N is not drawn from
     the Control Board or the Deferred Register. Cross-checked dossier 09 (the dossier that
     actually answered §2.N, §09-valuation-finance.md:249–256): its "Verified YES with two
     corrections" is derived from financial-theory reasoning (control-premium literature, BPV vs SV
     mechanics) and Project: Studio's own accepted P11/P15 law, not from either control document —
     dossier 09 never cites the Control Board or Register for §2.N at all (confirmed by grep: no
     match for those two filenames anywhere in `09-valuation-finance.md` near the §2.N discussion).
   - Confidence: HIGH.
   - Prior-prose status: N/A/CONFIRMED-INDEPENDENTLY — dossier 09's verification of §2.N stands on
     its own (comparator/finance-theory) merits and does not depend on, and is not undermined by,
     the absence of a matching Control Board passage. But the assignment's own "Current Future Ops
     view" label for §2.N should not be read as "Future Ops already wrote this down somewhere
     verifiable" — it was not found written down anywhere outside the assignment.

5. **Composite conclusion for the follow-up's central question.** All three "Current Future Ops
   recommendation/view" labels in the assignment (§2.E, §2.T, §2.N) are *not* independently
   attested in the two documents PATHS.md names for exactly this authority question, nor in the two
   adjacent Future Ops planning documents in the same directory. Their only textual source is the
   assignment prompt itself. This does not mean the recommendations are wrong — dossiers 02, 08,
   and 09 each independently re-derived support for Model D, the A/B/C split, and the BNW/valuation
   framing from code law, accepted/approved documentation, and real-world/comparator evidence
   respectively, and all reached compatible conclusions by independent means. But the report's
   "genuine remaining Owner decisions" and "corrections to prior Project: Studio assumptions"
   sections should not describe these three items as if a prior Future Ops control document already
   settled them: they are the assignment's own framing, subsequently corroborated (not merely
   repeated) by independent evidence gathered in this research program. That is a meaningfully
   different provenance than a settled prior ruling, even though the practical recommendation is
   unchanged.
   - Confidence: HIGH for the negative-existence claim (no such passage exists in the named
     documents); the "independently corroborated, not independently authored" characterization is
     this dossier's own synthesis (inference) from Findings 2–4 plus the cited support chains in
     dossiers 02/08/09.
   - Prior-prose status: QUALIFIED for §2.T's CONFIRMED label in dossier 02 (see Finding 3); N/A
     for §2.E and §2.N, since no dossier asserted a Control Board/Register source for those.

6. **The Deferred-Not-Dropped Register contains no P16-relevant item (studio ownership, library,
   acquisition, rights) that any dossier's open-questions list is missing — the register is scoped
   entirely to P08 (Standing/Awards/Progression), P09 (facilities/land/construction), and P10
   (talent/people lifecycle), none of which is P16 territory.** Broadened grep for `\bIP\b|brand|
   franchise|subsidiar|corporate|sell|sale|sold|purchase|buy\b|bought|transfer|ownership|library|
   acqui|rights|storyproperty|bankrupt|auction|liquidat|merger|sequel|remake` across the full
   77-line register returns exactly two non-empty hits, both false positives on shared vocabulary
   rather than genuine P16 content:
   - `P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md:26` — `P09-REQ-035 | LATER | Land acquisition/
     property expansion waits for parcels, price, zoning/unlock, and finance authority.` — this is
     the *player's own lot* real-estate expansion (a P09 facilities matter), not M&A/studio
     acquisition. Already correctly cited for its actual (P09 land-pricing) purpose by
     `09-valuation-finance.md:105` and `:597` — not mis-scoped there, and not P16-relevant despite
     the word "acquisition."
   - `P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md:68` — `Named studio campaign/save library — Owner
     clarification retained in P08-P10-OWNER-UX-01.md | Required separate implementation: chosen
     campaign label, studio identity, recorded in-game date/save time where available, deliberate
     selection and cross-campaign isolation. Not merely named checkpoints.` — this "library" is a
     **save-file/campaign-selection UX feature** (a list of the player's saved campaigns), not a
     film library or Story Property library. No dossier cites it, correctly, because it is outside
     P16 scope; flagged here only to forestall a future keyword-matching false positive.
   - Source: exhaustive grep + full manual read of the 77-line register, cross-checked against the
     Finding-2/awk scan of every dossier's Open Questions section (no dossier references either
     line).
   - Proves: there is no missed P16-relevant register item. The negative result is itself the
     answer to the task's scan instruction — nothing to add to any dossier's open questions from
     this register.
   - Confidence: HIGH.
   - Prior-prose status: N/A (negative finding; nothing to confirm/correct).

7. **The Control Board's own update law would require an Owner/Current-Ops act, not silent
   promotion, before any P16 item in it could become approved.** Section 7 ("Control-board update
   law"): "Update this board only after: Current Ops authorizes the stack; a package technical
   checkpoint changes status; Owner acceptance changes; a blocked dependency becomes authoritative;
   implementation order changes by Current Ops/Owner ruling. Never promote a recommendation to
   approval silently."
   - Source: `PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md:115-123`, verbatim above.
   - Proves: even if this board eventually gains P16-specific content, this document's own law
     requires an explicit act to promote anything past "recommendation." This reinforces Finding 5:
     nothing in the board today authorizes treating §2.E/§2.T/§2.N as settled beyond what the
     assignment itself asserts, and the board's own process would not let a future revision quietly
     upgrade them either.
   - Confidence: HIGH.
   - Prior-prose status: NEW (not previously cited by any dossier).

## Design implications for P16 (my inference, not Owner direction)

- The final report's Genuine Remaining Owner Decisions / Corrections sections should describe
  Model D, the P16A/B/C split, and the BNW/valuation/premium framing as **assignment-originated
  design premises that this research program independently corroborated** (via code-law fit,
  approved-documentation consistency, comparator evidence, and financial-theory reasoning) — not as
  "confirmed by the Future Ops Control Board" or any other named prior authority document, because
  no such passage exists. This is a provenance-precision point, not a recommendation to reopen any
  of the three settled premises.
- Because the Control Board is explicitly a P08–P10 authorization instrument that has not been
  updated since Revision 03, and its own §7 requires an explicit act to promote any recommendation,
  a future P16 charter would be the natural place to formally register Model D / A-B-C / the BNW
  framing as accepted P16 premises — closing the gap this dossier identifies rather than leaving
  three load-bearing "Current Future Ops" labels resting solely on the assignment prompt.
- No change is implied to any existing dossier's practical recommendation on §2.E/§2.T/§2.N — only
  to how the final report should characterize the source of authority for those three labels.

## Open questions

- Should a future P16 charter/registration explicitly cite this research program (dossiers 02, 08,
  09, and this dossier) as the corroborating record for Model D / P16A-B-C / the BNW framing, given
  that no prior Future Ops document states them? (Process question, not a design question — Owner/
  Current Ops decision.)
- Is there a Control Board revision newer than Revision 03 (or a P16-specific control document)
  outside this export's `docs/operations/` directory that supersedes this finding? Not checked —
  out of the read-only export's scope as provided.

## Source table

| Topic | Source | Locator | Proves | Confidence |
|---|---|---|---|---|
| Only P16 mention in Control Board | `PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md` | line 104 | Sequence only ("Library/Rights → Franchises/Continuations → Television/Cross-Media... not part of this stack"); no Model D/A-B-C/valuation content | HIGH |
| Model D absent from both named docs + 2 siblings | Control Board; Deferred Register; Dependency Map; Implementation Sequence | exhaustive grep, all 4 files | §2.E's "Current Future Ops recommendation" has no document source outside the assignment | HIGH |
| P16A/B/C split absent from both named docs + 2 siblings | same 4 files | exhaustive grep | §2.T's "YES" is inference-by-structural-fit (dossier 02) against roadmap/contract, not a document recommendation, and not sourced from either named ops doc | HIGH |
| BNW/valuation/premium framing absent from both named docs | Control Board; Deferred Register | exhaustive grep | §2.N's "Current Future Ops view" has no document source; dossier 09's verification is independent finance-theory reasoning | HIGH |
| Register has no missed P16-relevant item | `P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md` | full read; 2 false-positive lines at :26, :68 | Register is scoped to P08/P09/P10 only; nothing P16-relevant is missing from any dossier's open questions | HIGH |
| Board's own anti-silent-promotion law | `PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md` | lines 115–123 (§7) | Even a future board revision could not silently upgrade a recommendation to approval | HIGH |
| Dossier 02's §2.T CONFIRMED chain re-verified | `02-authority-corporate.md` | lines 293, 300–302 | Its support is contract §15 / roadmap / future-proofing doc, not the Control Board or Register | HIGH |
| Dossier 09's §2.N verification chain re-verified | `09-valuation-finance.md` | lines 249–256 | Independent finance-theory derivation; does not cite either named ops document | HIGH |
