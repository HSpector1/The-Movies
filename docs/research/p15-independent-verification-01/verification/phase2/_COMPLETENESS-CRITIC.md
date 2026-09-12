# P15 Phase-2 Completeness Critic

**Role:** completeness critic, read-only. Nothing implemented. Method: read PREAMBLE + DIRECTION A-K
+ all 11 TASKS verbatim in `_phase2-script.js`; read all 12 phase-1 reports; read `phase1-verify/_DIGEST.md`
in full; read all 11 phase-2 analyses in full; read `phase2-verify/_DIGEST2.md` in full **and**
independently read every phase2-verify memo file to check DIGEST2's own completeness (see §0 — it is
missing one file); read `REPORT-part-A.md` (draft §§2, 12). This memo does not repeat every line-item
already correctly captured in `_DIGEST2.md`; it (a) flags what DIGEST2 itself is missing, (b) states
per-deliverable-section completeness against the 16-section + final-table structure, (c) surfaces
cross-analysis contradictions that are either wholly new (found by directly cross-reading the eleven
phase-2 analyses against each other and against Direction A-K) or that DIGEST2 touched only partially,
and (d) lists explicit Owner-prompt questions no analysis answers.

---

## 0. A gap in the verification chain itself, before anything else

**`phase2-verify/_DIGEST2.md` is missing one entire verification memo: `consolidation.break-it.md`.**
22 phase2-verify files exist (11 tasks × 2 lenses); DIGEST2 contains only 21 sections. Direct read of
the omitted file shows it carries **four MAJOR findings that appear nowhere else in the corpus** and
therefore would not reach whoever compiles the final report if they worked from DIGEST2 alone:

1. **Pre-P15-save migration mass-failure risk (MAJOR, unique).** Under current code, rivals can already
   sit at large negative cash for years with zero consequence. The moment P15B's real failure law ships,
   an in-progress save's already-deeply-negative rivals could be read as "already sustained" and tip
   straight to Bankruptcy on the first post-patch tick — several studios "declare bankruptcy" the same
   week with **none** of Direction E/D's mandated warning ladder ever shown. No phase-2 analysis (not
   `consolidation.md`, not `rival-failure.md`, not `loans.md`, not `player-failure.md`) states a
   migration/grandfather rule that zeroes every new distress clock at the upgrade boundary. This is a
   more severe, more concrete finding than `consolidation.md`'s own single named "severe risk" (talent
   collapse, §12) and it is entirely absent from the deliverable as currently assembled.
2. **Genre-anchor concentration creates correlated, not independent, rival failure (MAJOR, unique).**
   `consolidation.md`'s own §2 "genre saturation" model assumes "~6 effective genre buckets, hypothetical,
   uniform." The real authored roster (`hollywoodStartingData.ts`) anchors 3 of 9 rivals each to
   romance/horror/comedy and **zero** to drama/crime. A sustained genre-specific downturn can therefore
   fail several same-genre rivals in a short window — a materially different, more dramatic event than
   the smooth "10→8→6→4→2" population-decay narrative both `consolidation.md` and its own package-owner
   summary present to the Owner. **This is also the concrete, confirmed answer to this critic's own
   assigned cross-check question ("does consolidation reuse market-window's density assumptions?") — it
   does not; `market-window.md` did not exist when `consolidation.md` was authored, and nobody went back
   to reconcile them once it did.** Recomputing §2's own formula with `market-window.md`'s real
   anchor-weighted rates shows the flat model **overstates pressure by ~62% on average and ~190% in
   drama/crime specifically** — the exact two genres with zero anchor rivals.
3. **Predatory genre-flood as a rush-to-monopoly exploit (MAJOR, unique).** Nothing in `consolidation.md`,
   `market-window.md`, or `rival-failure.md` checks whether a player can deliberately time high-marketing
   releases into a specific rival's anchor genre/window to accelerate that rival's failure well before
   the "rare, late-run, decades-out" timeframe every one of those documents assumes — and by
   `consolidation.md`'s own §8 legitimacy test ("legitimate if a surviving studio pays the same costs,
   under the same law"), this qualifies as *legitimate*, which is exactly why it needs an explicit Owner
   ruling on whether it is a sanctioned strategy.
4. **Endless Sandbox turns "possible" consolidation into a certainty (MEDIUM, unique).** Direction G's
   no-replacement rule plus any nonzero per-period rival failure probability is a pure death process with
   no births; over Direction K's unbounded post-2040 play it converges to zero rivals with probability 1.
   `finale-endless.md` never states this and `consolidation.md`'s own framing ("rare... tail outcome")
   implicitly assumes a bounded 120-year horizon throughout.

**Recommendation:** re-attach `consolidation.break-it.md` to the compiled evidence base before writing
the final report; its findings belong in sections 10, 15, and 16 (see below) and are currently invisible
to anyone working from `_DIGEST2.md`.

---

## 1. Section-by-section completeness

**1 — Executive findings (15-25 items).** **Missing entirely.** No phase-2 analysis was tasked with
writing this section and no draft exists anywhere in `out/`. It must be synthesized fresh from all 11
analyses' `key_conclusions` plus `boundaries-corrections.md`'s corrections/decisions lists. Flagged so
the compiler does not mistake "the pieces exist" for "the section exists."

**2 — Original *The Movies* reconstruction (12 items).** **Covered — draft complete.**
`REPORT-part-A.md` §2 has all 12 rows, already reflects the phase1-verify digest's page-citation
corrections (Prima pp.46/47/51, not 45-46). No material gap found. Minor: could add one line
cross-referencing the `availableindebt` TECH-SCHEMA-004 flag more explicitly to item 6 (loans/debt), but
it is already mentioned under item 5.

**3 — Shared-market/release-window recommendation.** **Covered, one Direction-A rider untested.**
`market-window.md` is thorough and internally strong (verified with only minor arithmetic/citation
caveats, no structural refutation). Gap: Direction A's own text — "No physical theater/screen allocation
market unless evidence shows a major benefit" — is never revisited by any analysis; `market-window.md`
treats the exclusion as already-settled and does not check whether any comparator's screen/exhibition
model would have offered a "major benefit" the Owner asked to be tested for. See §3 of unanswered
questions below.

**4 — Power Ranking vs Net Worth vs Valuation.** **Covered but internally inconsistent in shape.**
`ranking-vs-value.md` (Model D: qualitative 5-label Financial Standing band, never summed/ranked) and
`net-worth.md` (§7: "a banded signal, the **same 0-10 lane style** already used for the other Power
Ranking candidate lanes") describe **two different disclosure shapes** for the same fourth-lane
question — a discrete label vs. a numeric 0-10 lane, which is precisely the Model-B shape
`ranking-vs-value.md`'s own analysis argues against adopting. Both documents correctly hedge that the
final choice isn't theirs to make, so this is not a "wrong answer," but it is an unreconciled shape
mismatch a compiler must resolve, not silently average. Separately, the two documents also use **two
different illustrative Valuation formulas** for the same worked-example concept — `ranking-vs-value.md`
§4: `Net Worth + 0.5 × trailing-52-week revenue`; `net-worth.md` §4.2: `[3,6]× trailing 3-yr operating
surplus + Cash − Loan`. Both are correctly labeled PROVISIONAL, but a reader comparing the two documents'
worked tables side by side would get different numbers from different formulas with no note that they
diverge. See Contradictions §2.1-2.2.

**5 — Rival bankruptcy/failure model** and **7 — Loan/debt system.** **Covered, but the trigger
hierarchy the two documents share has three live disagreements**, only one of which
(`rival-failure.md` §0.2's net-worth-disjunct removal) is actually reconciled in the text. See
Contradictions §2.3-2.5 (Warning-trigger covenant-breach conflict; missed-instalment scope; debt-free
rival escalation dead-end; missing rival Rescue-acceptance rule for P17 symmetry — several of these are
already in DIGEST2, restated here only because they bear directly on whether Section 5/7 can be presented
as a single coherent system).

**6 — Player bankruptcy/failure model.** **Covered, but contains this package's single most consequential
unreconciled contradiction** — see Contradictions §1 below. `player-failure.md` recommends a real,
reachable terminal Bankruptcy event; `boundaries-corrections.md` §3.4 independently re-poses the same
"player terminal structure" decision under its own different A/B/C/D labels and recommends **Option B: a
permanently recoverable Administration floor where the studio "never actually stops existing"** — which
its own verifier found does not actually satisfy settled Direction E. Section 6 as currently drafted
cannot be assembled by simply appending both documents; the compiler must pick one terminal structure and
correct the loser's dependent claims.

**8 — Failed-studio talent settlement.** **Covered but with a load-bearing implementation gap.**
`talent-settlement-events.md` is thorough on contract/receipt mechanics, but per DIGEST2 (already
flagged there as CRITICAL) never gates `hollywoodTick.ts`'s per-business weekly loop — a studio marked
`closed` would, as specified, keep hiring a fresh 6-person roster and greenlighting new films forever,
since nothing in the proposal stops `staff()`/`decide()` from running against it. This is the single most
load-bearing missing implementation seam in the whole document and is not merely a citation nit.

**9 — Bankruptcy auction and M&A.** **Covered, but its package-boundary recommendation is not the one
Section 13 currently assembles from `boundaries-corrections.md`** — see Contradictions §3. Also contains
confirmed arithmetic errors (Scenario B set-refund) already in DIGEST2.

**10 — Consolidation/no-replacement analysis.** **Covered on its own terms, but materially thinner than
its own adversarial pass shows it should be** — see §0 above. As currently drafted, `consolidation.md`
tells the Owner the one severe risk is talent-market collapse; its own break-it pass found three more
severe or equally severe risks (migration mass-failure, genre-correlated failure, Endless-Sandbox
inevitability) that never made it back into the document or into DIGEST2.

**11 — Finale and Endless Sandbox.** **Covered, with one MAJOR compliance gap already in DIGEST2** (the
frozen-2040-record guarantee is only a UI convention, not an engine-level refusal — direction K's core
"must not rewrite" invariant is not actually enforced by anything the document proposes) and one
**explicitly-required correction the task handed the analyst that the analyst then failed to apply**: the
task prompt's own parenthetical instructs the analyst to use "Civ VII 1.4.0 replaced Legacy Paths with
Triumphs but kept One More Turn" — §4.4 nonetheless cites the stale 1.2.0 "grab Legacy Path achievements"
framing as if current. This is a documented case of a correction being handed to an analyst and not used,
distinct from an error the analyst introduced independently.

**12 — Comparator lessons.** **Draft exists (`REPORT-part-A.md` §12) but is now stale relative to phase-2
findings.** It predates (or was not updated against) three pieces of comparator evidence phase-2 analyses
found and phase1-verify never had: (a) Capitalism Lab's **officially shipped** "Acquire Companies Facing
Bankruptcy" Banking & Finance DLC setting (`ma-auction.md` §1 — a real, shipped Stage-1-shaped precedent,
stronger than the retracted "Playing Without a Company" DLC-preview citation the draft already correctly
downgrades); (b) GearCity's official "Monopoly Lawsuits" (>75% share) setting (`ma-auction.md` §10,
`consolidation.md` §12 — the concrete shipped anti-dominance-ceiling comparator, absent from the draft's
§12.2/§12.3); (c) the corrected GearCity takeover-price formula and the corrected OpenTTD
hostile-takeover attribution (PR #10914 vs #10709), both already applied in the draft's §12.2 table but
not cross-checked against `ma-auction.md`'s own independent re-derivation, which differs slightly in
presentation. The draft should be revised against the phase-2 corpus before being called final, not just
against phase-1.

**13 — Package boundaries.** **Covered, but contains an unresolved naming collision and a substantive
scope disagreement that directly contradict each other across sibling documents** — see Contradictions
§3. Also: `boundaries-corrections.md` row 17 flags the phase-order catalogue prerequisite
(`phaseId`/`phaseOrdinal`/`phaseOrderVersion`, confirmed zero hits at 592e926) as a blocking dependency
for "every new P15 material event" — **none of the other ten analyses that each propose new
`IndustryReceipt` kinds, new versioned roots, or new events** (`rival-failure.md`'s `studioClosed`,
`talent-settlement-events.md`'s `projectCancelled`, `loans.md`'s ledger kinds, `ma-auction.md`'s
settlement receipt, `finale-endless.md`'s `LegacyFinaleSnapshot`) states whether its own proposed event
is subject to this unmet prerequisite or exempt from it. This is a systemic completeness gap across
nearly the whole batch, not a single-document issue.

**14 — Corrections to previous P15 research.** **Covered (55-row table in `boundaries-corrections.md`
§2) but itself incomplete on the one row that matters most for Section 10.** Row 14 states "No floor
logic exists in `src/core/hollywood*.ts` today... nothing to remove, only a design commitment not to
add one" — but `consolidation.md`'s own verifier (authority-consistency lens) independently found that
`P15-BUILDER-ANNEX.md:626`, an **ACCEPTED, "implementation-ready"** design document, contains a literal
"active-count floor" edge-case row prescribing "deterministic entrant scheduling... Hollywood remains
populated." Neither `consolidation.md` nor `boundaries-corrections.md` names this row as something that
must be recorded SUPERSEDED BY OWNER DIRECTION G; it exists only inside a verification memo and has not
been folded back into either source document. The corrections table is not complete until this row is
added.

**15 — Genuine remaining Owner decisions.** **Covered (`boundaries-corrections.md` §3, 12 clusters, plus
each analysis's own list) but needs de-duplication and relabeling before presentation.** The single
"player terminal structure" decision is currently posed to the Owner under **two different A/B/C/D
lettering schemes that mean different things** (`player-failure.md` §5's A/B/C/D vs
`boundaries-corrections.md` §3.4's separately-defined A/B/C/D) — presenting both without reconciling the
labels risks the Owner approving "Option B" from one document while a builder implements "Option B" from
the other, with opposite consequences (real closure vs. no closure ever).

**16 — Remaining uncertainties.** **Covered (`boundaries-corrections.md` §4, 10 items) but does not
include the findings only visible in the dropped `consolidation.break-it.md` file** (§0 above) — those
are not tuning uncertainties, they are unaddressed structural risks, and belong in Section 15 (as Owner
decisions: "is player-engineered rival bankruptcy sanctioned?", "what migration rule applies to rivals
already deeply negative at patch time?") rather than Section 16, but as of now they are in neither.

**Final summary table** (Topic | Original evidence | Comparator lesson | Owner direction | Recommended
Project:Studio implementation principle | Remaining choice). **Not drafted anywhere.** No phase-2 analysis
produces this exact table shape; it must be assembled fresh by the compiler from the material above. Given
the contradictions in §§4, 6, 9, and 13, at least four of its rows (Net Worth/Valuation disclosure shape;
player terminal structure; M&A package boundary; Power-Ranking-vs-Financial-lane shape) cannot be filled
in until the compiler picks a side in those disagreements — they are not yet in a state where a single
"Recommended implementation principle" cell can be written without also silently overruling one sibling
analysis.

---

## 2. Contradictions between analyses (ranked by consequence)

**§1 — MAJOR, unresolved: does the player's studio ever actually, permanently close?**
`player-failure.md` §5 recommends structure **D ("C→B" in that document's own lettering)**: a bounded
13-week rescue window, and if uncured, a **real terminal Bankruptcy event** that fires settlement and
opens the postmortem/Legacy dossier — the studio genuinely stops existing as an operating entity.
`boundaries-corrections.md` §3.4, independently re-deriving the same decision under its **own**, differently
defined A/B/C/D labels, recommends **its own Option B: "Recoverable administration floor (no hard
game-over ever)"** — the player studio "never actually stops existing," Dormancy is "always re-enterable,
never archived." These are not two framings of the same answer; they are opposite answers to the single
question Section 6 exists to resolve, from the two documents most responsible for answering it. DIGEST2
(`boundaries-corrections:authority-consistency`) already caught that Option B does not satisfy Direction
E's literal text ("revises the earlier protected-continuity ruling"), but it addressed this as an
internal Direction-E-compliance problem in one document; it did not name that this is also a direct,
opposite-answer contradiction with the sibling document (`player-failure.md`) tasked with the identical
question. This cascades: it determines whether Section 11/§4.8's "yes, the player can fail post-2040" is
even a meaningful sentence (moot under Option B), and whether Section 8's zero-severance settlement
mechanics ever actually apply to the player. **This is the one finding in this whole critique that most
needs an explicit Owner ruling before Section 6 can be written as a single coherent recommendation.**

**§2.1 — Financial-strength disclosure shape.** `ranking-vs-value.md` recommends a qualitative 5-label
band, never summed or ranked; `net-worth.md` describes (conditionally) a numeric 0-10 lane "the same...
style already used for the other Power Ranking candidate lanes" — the Model-B shape `ranking-vs-value.md`
itself argues against. Both hedge the final choice as open, but present genuinely different default shapes
for the same not-yet-decided surface.

**§2.2 — Two different illustrative Valuation formulas** for the same concept (`ranking-vs-value.md` §4:
revenue-multiple; `net-worth.md` §4.2: operating-surplus-multiple), both PROVISIONAL, neither cross-
referencing the other.

**§2.3 — Warning-trigger definition disagrees across three documents.** `loans.md` §3.7 states plainly:
"[loan] acceleration... is the only event that may hand the P15B condition machine a 'Warning' trigger
sourced from finance. Sustained negative cash... is the second, independent trigger. **Nothing else in
finance may originate a Warning.**" `rival-failure.md` §2's own Warning row and its own Scenario 2 (§4.2,
labeled "Warning (covenant, not missed payment)") both use **a covenant breach** as an independent,
finance-sourced Warning trigger — directly the "nothing else" `loans.md` forbids — even though
`rival-failure.md` §0.1 states it adopts `loans.md`'s "loan products and covenant law... without change."
`player-failure.md` §2's Warning row, meanwhile, has only two disjuncts (`constrained`-4wk or
cash<8wk-fixed-costs) and never mentions covenant breach at all. Three sibling documents therefore give
three different definitions of the single condition that starts the entire ladder for player vs. rival,
and only one of the three disagreements (the net-worth-at-Severe-Distress issue) is flagged and reconciled
anywhere in the corpus.

**§2.4 — Missed-instalment scope.** `player-failure.md` §2 counts "payroll, overhead, **or** a loan
instalment" toward the 4-in-13-week default rule; `loans.md` §3.7 and `rival-failure.md` §4.5 ("only the
loan instalment is ever recorded as missed") count loan instalments only. `rival-failure.md`'s own header
claims "exactly one substantive disagreement was found" among the three sibling reports and reconciles
only the net-worth issue — this second disagreement survives unflagged in the same document that claims
completeness on exactly this point.

**§2.5 — Debt-free escalation dead-end (already in DIGEST2, restated for its Section 5/7 consequence):**
because every path from Distress to Severe Distress in `rival-failure.md`'s own §2 table requires a
missed *loan* instalment, and `loans.md` §3.2's distress-interest on sustained negative cash is charged
unconditionally and can never itself be "missed," **a studio that never borrows has no stated mechanism to
ever fail** — recreating exactly the D-16-lab "mechanically absorbing" trap Directions D/E were adopted to
fix, and creating a discoverable, permanent bankruptcy-immunity strategy ("never take a loan"). This is a
structural hole in Section 5/7 as currently drafted, not a wording nit.

**§3 — M&A package boundary: two sibling documents give different answers, plus a naming collision.**
`boundaries-corrections.md` §1 row 12 and §3.8 default label-continuation (Stage 2) fully to **P16+**,
explicitly declining to authorize it inside the P15 window ("Recommendation: default to P16+... flag that
if the Owner wants..."). `ma-auction.md` §13's own final recommendation actively **adopts a new package,
"P15D — Bankruptcy Settlement & Studio Disposal,"** that ships Stage 1 **and** autonomous-only Stage 2
now, not deferred to P16+. These are different scope recommendations for the identical decision
(§3.8/blocks #12), from the two documents most responsible for it. Separately and independently, the name
"P15D" is claimed by **two incompatible packages** across the batch: five documents
(`boundaries-corrections.md` row 4, `net-worth.md`, `ranking-vs-value.md`, `loans.md` §7) converge on
P15D = the Direction-C **valuation/net-worth** package; `ma-auction.md` §13 uses P15D for the
**bankruptcy-settlement/M&A** package. DIGEST2 (`ma-auction:authority-consistency`) already catches the
naming collision in isolation; it does not connect it to the deeper scope disagreement above, and neither
gap has been corrected in either source document.

**§4 — `consolidation.md` does not reuse `market-window.md`'s density assumptions (a direct answer to
this critic's own assigned cross-check).** Confirmed in §0.2 above: `consolidation.md` predates
`market-window.md` in its authoring order, used its own flat uniform-genre placeholder, and was never
revised once the real file existed later in the same batch — even though its own break-it pass (dropped
from DIGEST2) recomputed the correct answer and found the flat model overstates pressure by up to ~190%
in exactly the genres (drama/crime) that have zero anchor rivals.

**§5 — `ma-auction.md`'s Scenario C contradicts `talent-settlement-events.md`'s own established rival
capacity ceiling** (already in DIGEST2, restated for cross-section visibility): Scenario C uses "20
employees, 3 active projects" for a failed rival, while `talent-settlement-events.md` §5 independently
derives, from the same code (`hollywood.ts:98-105`, one Production Stage), that a rival's realistic
concurrent footprint is single-digit headcount and at most one production plus one prior run in overlap —
and explicitly notes the Owner's own illustrative "3 productions affected" notice text is unrealistic at
current rival scale for exactly this reason. Section 9's worked scenarios and Section 8's worked example
use incompatible scale assumptions for what should be the same kind of subject (a large failed rival).

**§6 — Consistency check that *passes* (for balance):** `finale-endless.md` §2.4 and `player-failure.md`
§6 independently reach the same, mutually consistent recommendation — an early (pre-2040) player-bankruptcy
ending reuses the identical P15C finale-presentation machinery, "same reducer, different trigger" — and
both correctly leave it flagged as a recommendation pending Owner confirmation rather than asserting it as
settled. No correction needed here; noted so the completeness pass is not read as purely fault-finding.

---

## 3. Explicit Owner-prompt questions no analysis answers

1. **Direction A's screen/exhibition-market rider:** "No physical theater/screen allocation market unless
   evidence shows a major benefit." No analysis tests whether any comparator's screen-allocation model
   would meet that bar; `market-window.md` treats the exclusion as pre-settled and never revisits it.
2. **Two named comparators the `player-failure.md` task explicitly required and the analysis never uses:**
   "Two Point Hospital -150k warn/-300k fail" and "Capitalism Lab Declare Bankruptcy choice" (a
   player-initiated, voluntary bankruptcy option). Both are present in the phase-1 evidence
   (`comp-bankruptcy-loans.md`) and named verbatim in the task prompt; neither appears anywhere in
   `player-failure.md`, and as a direct consequence **no analysis anywhere considers a
   player-initiated/voluntary bankruptcy declaration** as one of the terminal-experience options, despite
   the file's own central value (player agency) being the stated reason for rejecting forced automatic
   rescue.
3. **`finale-endless.md`'s task-mandated correction, handed to the analyst and not applied:** "Civ VII
   1.4.0 replaced Legacy Paths with Triumphs but kept One More Turn" — §4.4 still cites the stale 1.2.0
   framing. The specific comparator-currency question the task asked to be resolved was not resolved.
4. **Whether player-engineered rival failure (deliberately timing releases into a fragile rival's anchor
   genre to hasten its bankruptcy) is a sanctioned strategy or an exploit to bound** — raised only in the
   dropped `consolidation.break-it.md` (§0 above); no analysis in the deliverable-facing corpus poses this
   question to the Owner at all, despite it following directly from Direction A (shared market pressure)
   + Direction D (failure under "the same economic law") + Direction G ("consolidation is
   acceptable/desirable emergent history").
5. **What migration/grandfather rule applies to rivals (and the player) already deeply negative-cash or
   long-`severe`-classified in an in-progress save the first time the new failure law loads** — named as a
   requirement in the verification briefs for `player-failure.md`, `rival-failure.md`, `loans.md`, and
   `consolidation.md` alike (all four "break-it" passes independently ask for it), and answered by **none**
   of the four source documents.
6. **Whether rivals may ever accept the Rescue-tier loan** (`loans.md` defines a deterministic
   preventive-borrowing rule for rivals but never a deterministic Rescue-acceptance rule), leaving
   Direction F/P15-PACKAGE §16's "at least two legitimate recovery routes... for player and rival
   studios" symmetry requirement formally unsatisfied for the rival side of Route 2.
7. **Whether a rival's own outstanding loan survives, is written off, or transfers at closure/settlement**
   — not stated in `loans.md`, `rival-failure.md`, or `talent-settlement-events.md`, despite Direction D's
   "historic identity NEVER disappears" implying the debt fact itself needs a permanent, recorded terminal
   status rather than silent disappearance.
8. **Whether the phase-order catalogue prerequisite (`phaseId`/`phaseOrdinal`/`phaseOrderVersion`,
   confirmed unmet at 592e926) applies to, or is waived for, each of the ~6 new event/receipt kinds the
   other ten analyses individually propose** — raised once, generically, in `boundaries-corrections.md`
   row 17, and never answered per-event by any of the analyses actually proposing those events.

---

## Sources

`out/_phase2-script.js` (PREAMBLE, DIRECTION A-K, all 11 TASKS, verbatim, lines 1-129); every file in
`out/phase1/` (12 reports); `out/phase1-verify/_DIGEST.md` (full read, 389 lines); every file in
`out/phase2/` (11 analyses, full read); `out/phase2-verify/_DIGEST2.md` (full read, 237 lines) **and**
`out/phase2-verify/consolidation.break-it.md` (full direct read — absent from DIGEST2, see §0);
`out/REPORT-part-A.md` (draft §§2, 12, full read).
