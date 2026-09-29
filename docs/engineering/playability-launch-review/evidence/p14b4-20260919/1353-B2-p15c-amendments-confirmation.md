<!-- 1353-B2: confirmatory pass (contract-auditor, read-only) on 1353-F, saved verbatim by the parent from the agent's final text -->

# Independent review 1353-B2

Confirmatory pass, read-only, same scope as 1353-B. Checked against repo HEAD and `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1353-F-parent-p15c-charter-adoption.md`.

**VERDICT: ACCEPT**

## (1) Amendments 1-4 — exact, unambiguous, no new asymmetry or cross-studio read

- **Amendment 1** (`2 × liked ≥ scored`) and **Amendment 2** (`2 × genreCount > n`) are now integer inequalities matching the same "one exact product" convention already used by the money-based predicates. Both read only counts already scoped to a single studio's own releases. Resolved cleanly.
- **Amendment 3** (decade = `floor(year/10)`, `year = 1920 + floor(releaseWeek/52)`): verified the cited line directly — `src/core/calendar.ts:17` reads `const year = 1920 + Math.floor(absoluteWeek / 52)`, an exact match. The block math checks out: 1920 through 2039 covers `floor(year/10)` values 192..203, i.e. exactly twelve calendar decades before B, consistent with the original TUNING rationale ("Forty years" for `LEGACY_AUDIENCE_MIN_DECADES`/4), which only makes sense under a calendar-block reading — so this amendment isn't just a fix, it's the reading the TUNING table always implied. The partition is a pure global function of `releaseWeek`, applied identically to every studio's own releases; no cross-studio read.
- **Amendment 4** (`technology-pioneer` contrary side: "S's own earliest operational, non-cancelled adoption... never the industry's first adoption"): this is exactly the disambiguation I asked for, and it adds a needed extra precision (excluding a cancelled-then-abandoned adoption from being used as the reference point) that the original text hadn't even raised. Reads only S's own adoption records plus the shared, studio-independent catalogue `commercialWeek` constant.

None of the four amendments introduce a new cross-studio read, a role flag, or a floating-point comparison. All four are now safe to hand to a test author without risk of a writer/test-author reconciliation mismatch.

## (2) Adopted notes — cover the non-blocking points

- **13th-lens refusal** (RED 9 addition) — covers the gap I flagged (only ninth-archetype/seventeenth-domain over-cap cases were named before).
- **`legacy-closed-before-boundary`** — covers exactly the untested case I named: a studio closed before B stays in the roll call, registry order, with pre-closure facts, closure week, and held archetypes.
- **§7 dependency on P15B Wave 4** — the parent didn't paper over this; it names the exact gap (C is proposed in 1352-A §7, not yet adopted) and gates Wave 5 behind the future P15B Wave 4 charter explicitly adopting C. This is the right way to carry an open cross-charter dependency rather than assuming it's settled.
- **Ceremony presentation** — resolves my forward-looking UX flag precisely: Wave 4 must present the ceremony content at the stop the first time (not leave it purely browsable-later), while still asking for no decision — correctly threading the needle between "don't invent a forced click-through" and "don't let a ceremony be silently skippable."
- **Authored-film citation → 1351-F** — the attribution nit is fixed.
- **Annex bounds** — the parent used `git show 2a7ff0d9:` (tool access I don't have) and quotes the builder annex directly at D.6/E.6: "maximum 16 domains", "complete authored set; hard maximum 8", "maximum 12 each" for qualifying/contrary links, "hard maximum 12" for lens summaries. This is a materially stronger sourcing standard than the prior second-hand W0 paraphrase. I still cannot personally re-verify this quote (no git tool in my toolset, and `2a7ff0d9` is a historical commit not present in the working tree my `Read`/`Grep` can reach), so I'm marking it **NOT VERIFIED BY ME** rather than confirmed — but it is now a properly located, directly quoted claim rather than a vague one, and the RED list's own over-cap refusal tests (8th/9th archetype, 16th/17th domain, 13th lens) will empirically enforce whatever the true bound is regardless of whether my review personally re-confirmed the quote.

## (3) Anything still blocking Wave R / Wave 1 RED staging

None found. I re-derived the decade partition arithmetic myself against the cited source line rather than taking the charter's word for it, and it holds. The four predicate amendments are each independently exact, symmetric, and privacy-safe. The remaining open item (annex-bounds quote unverified by me personally) is not blocking: it's a citation-provenance gap, not a design defect, and is self-checking via the RED list's own bound tests once written.

## Next action
Proceed to Wave R and Wave 1 RED staging (1353-C) with a test author, using 1353-A as amended by 1353-F (§5.3 amendments 1-4 govern over the original text). No further review pass is needed before that handoff on my end.

Files read for this pass:
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1353-F-parent-p15c-charter-adoption.md`
- `/Users/zacheryspector/The-Movies-headless-program/src/core/calendar.ts` (re-confirmed line 17 against Amendment 3's citation)
