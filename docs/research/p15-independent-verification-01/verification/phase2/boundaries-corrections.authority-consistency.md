# Adversarial Verification — `phase2/boundaries-corrections.md`
**Lens:** Authority & Direction Consistency
**Verdict: VERIFIED WITH CAVEATS** (one high-severity recommendation-vs-direction mismatch;
two lower-severity citation/inference issues; the rest of the ownership map, corrections table,
and package-law handling holds up under adversarial re-check against the Owner direction, the
authority docs, the accepted-592e926 code, and the phase1-verify digest)

---

## Method

Re-read the SETTLED Owner direction (A–K) and the analyst PREAMBLE in `_phase2-script.js:1-60`,
then the target file in full (`out/phase2/boundaries-corrections.md`, 398 lines). Cross-checked
every direction-collision claim, package-boundary claim, and prior-P15-law citation against:
`accepted-592e926/docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md`, `accepted-592e926/docs/D-16-OWNER-RULINGS.md`,
`accepted-592e926/docs/D-17B-OWNER-AUTHORIZATION.md`, `authority/P13-P15-OWNER-RULINGS.md`,
`accepted-592e926/src/core/hollywoodTypes.ts`, `accepted-592e926/src/core/placement.ts`,
`accepted-592e926/docs/engineering/P11-TO-P12-PRODUCER-HANDOFF.md`, `accepted-592e926/bridge/industry.ts`,
and the full `phase1-verify/_DIGEST.md` (all 24 entries, all 388 lines).

---

## Findings

### 1. [HIGH] §3.4 "Player terminal structure" recommends an option that does not implement
   settled Owner Direction E, while stating that it does

Owner Direction E is SETTLED (not open): **"PLAYER STUDIO CAN ULTIMATELY FAIL AND GO BANKRUPT
(revises the earlier protected-continuity ruling) but with meaningful warning and recovery
first."** The dispositive clause is that ultimate failure/bankruptcy must become *possible* —
the direction exists specifically to revise away the old "the studio never legally closes"
ruling.

The report's §3.4 lists four candidate terminal structures (A–D) and recommends **B**:
"Recoverable administration floor (**no hard game-over ever**)... the worst state is permanent,
disclosed Administration..., where Dormancy for the player is *always* re-enterable, **never
archived**." The report's own text for Option A calls that same shape "**Closest to the
pre-direction-E baseline**" — i.e., B is A, formalized. The report then says B is recommended
"...while **still satisfying direction E's demand** that 'negative cash = game over' never be
the mechanism and that warning/recovery come first."

That sentence quotes only the *manner*-of-failure clause of E (not "negative cash=game over" as
the *mechanism*) and drops E's *outcome* clause (the studio **can ultimately** fail and go
bankrupt). A structure in which the player studio can *never* actually close does not implement
"ultimately fail and go bankrupt" under any ordinary reading — it reinstates, under a new label,
the exact protected-continuity ruling E was written to revise. Of the four candidates, only **C**
(full symmetric closure) and **D** (one authored second chance, then true closure) actually reach
a terminal state for the player; the report's own text concedes this obliquely ("C is the most
consequential option... requires the full P10/P11/P12/P14 settlement manifest") without ever
stating that A and B are the two options that *fail to satisfy E at all*, not merely the two
that need less machinery.

This also cuts against the package-ownership law the task brief itself asks to be checked —
**"no player-only exemption."** Under Direction D, a rival that reaches insolvency undergoes a
real terminal state (settlement/auction/closure), with identity preserved but operations ended.
Recommending Option B gives the player studio a standing exemption from that same category of
outcome: rivals can genuinely stop operating, the player structurally cannot. The report does
register (§1 row 8) that direction E "reverses the single most-repeated prior P15 law" — but
then, in the very next section, recommends the one non-D/C option that quietly un-reverses it.

**Corrected statement:** Option B does not satisfy Owner Direction E; it reproduces, reformatted
as a named ladder stage, the pre-E protected-continuity ruling that E explicitly revises. If the
Owner's genuine preference is minimal new machinery, that preference is *itself* in tension with
the already-settled E and must be surfaced as a structural conflict requiring explicit Owner
resolution ("Owner: do you want E's letter (real terminal failure, at C/D's cost) or E's spirit-lite
(B, cheaper, but not actually implementing 'can go bankrupt')?") — not resolved silently in the
recommendation by omitting E's outcome clause. The candidates that actually implement E are C and
D; B (and A) should be relabeled as **non-compliant with the settled direction**, offered only as
an explicit-tradeoff alternative, not as the recommended default.

### 2. [MEDIUM] Internal inconsistency this creates with §3.9 and §3.10

§3.9 (dormancy) reinforces the same choice: "dormancy survives as **the player's permanent
floor (B)**." §3.10 ("Whether the player can fail post-2040") then recommends "**yes,
identically**" to pre-2040 — i.e., asserts genuine failure remains possible at any point in the
timeline. But if B is adopted, the player cannot *ever* truly fail, pre- or post-2040, which
makes §3.10's question and its "yes, identically" recommendation moot rather than resolved. The
report does not flag this tension between its own §3.4/§3.9 recommendation and its own §3.10
premise. A revision should either drop the "yes, identically" framing (there is no failure to
have "identically" under B) or make clear that §3.10 presumes C/D, not B.

### 3. [MEDIUM] Citation error: wrong D-17B section cited for the loan prohibition

Ownership-map row 5 ("Loans / debt ledger"), Doc. prerequisite column: "D-16 R10 and **D-17B §8**
(`docs/D-17B-OWNER-AUTHORIZATION.md:37-38`) explicitly prohibit loans and must be superseded."

Verified directly against the file: lines 33-40 are **§4 — Authorized surface**, and the
"NOT AUTHORIZED: [loans; credit lines; co-financing; ... hard bankruptcy; soft-failure ladder...]"
text sits at lines 37-39, inside §4, not §8. **§8** ("Publicity as a decision, not a chore",
lines 58-61) is a wholly different clause about the publicity mechanic ("A distressed studio
should be able to use publicity as ONE recovery lever, not a guaranteed rescue") and says nothing
about loans. (This is a distinct slip from the one the phase1-verify digest already caught in
`finance-logic.md` for the *same* misattribution pattern — this report makes its own, separate
instance of it.)

**Corrected citation:** "D-16 R10 and D-17B **§4** (`docs/D-17B-OWNER-AUTHORIZATION.md:37-39`)
explicitly prohibit loans and must be superseded." (D-16 R10 itself — `docs/D-16-OWNER-RULINGS.md:52`
— is correctly quoted elsewhere in the report: "KEEP THE STUDIO, LOSE CONTROL... No D-17
implementation of loans, credit lines, co-financing, ... hard bankruptcy, or a forced restructuring
ladder.")

### 4. [LOW-MEDIUM] A P11 handoff sentence is presented as a binding rule for a capability it
   does not name

Ownership-map row 3 ("Net worth read model"): "must not 'reconstruct a purchase from today's
blueprint price' per **the P11 handoff rule** (`P11-TO-P12-PRODUCER-HANDOFF.md:37`) — the live
demolition refund already violates this narrowly (`placement.ts:1026`), so a book-net-worth
reader must be built on *recorded* capex, not blueprint price."

Verified: the quoted sentence exists verbatim at that line, and `facilityDemolitionRefund` at
`placement.ts:1025-1027` does compute `blueprint.capex * FACILITY_DEMOLITION_REFUND_FRACTION` —
a catalog value, not a recorded historical purchase — so the specific "already violates this"
observation is accurate and matches the phase1-verify digest's own confirmation of that pairing.
But per the digest (`verify:code-finance:source-fidelity`), the handoff sentence *in context*
governs P11's capital-contributor History rows specifically; **extending it to a not-yet-designed
book-net-worth reader is "a MEDIUM design inference, not a cited law."** The report states the
extension flatly as "the P11 handoff rule" applying to the new capability, without the digest's
hedge. This is a source-discipline slip, not a wrong conclusion (the inference is reasonable) —
the memo should say "by analogy to the P11 handoff's capital-contributor rule (an inference, not
a rule that names this capability)," not present it as settled P11 law already binding a
read-model that does not exist yet.

### 5. [LOW] Missed connection to an explicit package-law item named in the task brief

The task brief's package-ownership checklist explicitly includes **"no retroactive fiction in
migrated saves."** Ownership-map rows 15-16 (2040 finale, Endless Sandbox) discuss Direction J
("every factual claim traces to recorded evidence") and K ("must not rewrite the frozen Legacy")
but never connect either to the migration-origin guardrail that already exists in code for
exactly this failure mode: for `origin==='migration'` rivals, `founding` is `null`, there are no
authored films, and the validator (`hollywoodValidation.ts` per the phase1-verify digest, item 44
of `code-hollywood:completeness-overclaim`) already forbids fabricating a migration-origin past.
This is not a wrong statement anywhere in the report — it is a missed opportunity to cite existing
code as reinforcing evidence for J/K's "no invented history" requirement, which a builder handed
this ownership map would benefit from seeing named explicitly under row 15 or in the finale
"Doc. prerequisite" column.

---

## What holds up (checked and correct)

- **Direction supersession labels (§I, rows 1-7).** Spot-checked every direction-collision claim
  against the authority docs directly, not just the report's paraphrase:
  - `OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §3: verified verbatim — "The prior prohibition (no
    financing, loans, bailouts, restructuring, hard bankruptcy, failure ladder or arbitrary cash
    sink) remains in force **for the player's studio** and is unchanged" — matches row 6's quote
    and the report's characterization that only the *player* terminal-boundary text is what E
    revises (the rival-failure text in HORIZON §3 already anticipated distress/bankruptcy for
    rivals "when and if the Hollywood Ecosystem is authorized" — correctly read by the report as
    NOT in collision with D, since HORIZON already carved this out).
  - `P13-P15-OWNER-RULINGS.md` §4.2 ("Corporate Hollywood... do[es] not authorize acquisitions,
    mergers, ownership stakes, subsidiaries, co-productions") and §4.3 ("Post-2040 Endless Mode
    remains undecided. P15 may not silently create or authorize it.") both verified verbatim —
    match rows 4 and 5 exactly, correctly graded QUALIFIED and SUPERSEDED respectively.
  - `P13-P15-OWNER-RULINGS.md` §5's P16+ parking list explicitly names "valuation" alongside
    acquisitions — the report's row 4 correctly identifies that Direction C now requires this
    parking to be superseded for a valuation capability, and says so explicitly in its Doc.
    prerequisite column. Good catch, correctly labeled.
  - Row 14's G-cluster correction (the "minimum three active AI rivals" text was a P12A
    design/benchmark bound, SIM-015, never Owner law) matches the phase1-verify digest's own
    finding almost exactly, including tracing the actual source and downgrading the correction's
    consequence accordingly — this is the single best-sourced row in the corrections table.
- **Code facts the task explicitly named as established are used correctly, not contradicted:**
  `StudioIdentity`'s exact 10-field exact-key list (`hollywoodValidation.ts`) matches the type at
  `hollywoodTypes.ts:6-17` field-for-field; the closed 5-kind `IndustryReceipt` union
  (`studioEntered|employment|filmAnnounced|filmReleased|filmSettled`) matches `hollywoodTypes.ts:
  96-103` field-for-field; the Studio Charts per-lane rank function in `bridge/industry.ts:66-71`
  is indeed a "competition" tie rule (`1 + count(strictly greater)`, i.e. 1-1-3 skip-after-tie),
  correctly distinguished from the "dense" rule the report says a P15 candidate elsewhere
  proposes; `cashNegative`/`SIM_CAP` in `adapter.ts` and the absence of any loan/debt symbol are
  used consistently with the digest's corrections, not the stale pre-digest claims.
- **No instance found of the report silently converting a genuinely open Owner item into
  law.** Every "Recommendation:" in §3 is paired with the alternatives considered and an
  explicit "Blocks:" line: the ~4-week market window (§3.1), the financial-lane-vs-board split
  (§3.2), disclosure policy (§3.3), loan tiers/symmetry (§3.5-3.6), auction eligibility (§3.7),
  M&A package placement (§3.8), and the monopoly-consequence question (§3.12) are all correctly
  left for the Owner rather than asserted as settled.
- **No hidden-rival-subsidy, no-recycled-ID, or P07-frozen-result violation found.** Row 19's
  "rivals cannot receive secret cash" (confirmed) is correctly carried forward as a constraint on
  any future loan/rescue mechanism (§3.6); `StudioId` non-reminting is correctly treated as
  permanent (row 12); row 1's market-pressure seam is correctly scoped to apply "before result
  commit, never after," respecting frozen P07 results.
- **Source discipline is otherwise strong.** PROVISIONAL labels are used correctly and
  consistently (the loan-tier illustration in §3.5, the ~4-week window in §3.1); comparator
  claims (GearCity formula, OpenTTD loan-non-transfer, Blockbuster Inc. dormancy-with-return,
  Capitalism Lab's DLC-gated bankruptcy offer) match the phase1-verify digest's corrected versions
  rather than the pre-verification claims — the report did the work of reading the digest and
  applying its corrections rather than re-citing the refuted originals.

---

## Recommended fix list (in priority order)

1. Rewrite §3.4 to state plainly that Options A and B do not implement Direction E's "can
   ultimately fail and go bankrupt" clause; either drop B as the recommended default in favor of
   C or D, or keep B as a candidate but flag the Owner-facing conflict explicitly rather than
   asserting compliance.
2. Reconcile §3.9/§3.10 with whatever §3.4 ends up recommending.
3. Fix the D-17B section citation in row 5 from §8 to §4 (lines 37-39).
4. Soften row 3's "P11 handoff rule" framing to an explicit design inference, matching the
   digest's own grading of that extension.
5. Optionally cross-reference the migration-origin "no fabricated past" validator under rows
   15-16 to reinforce Direction J/K.

