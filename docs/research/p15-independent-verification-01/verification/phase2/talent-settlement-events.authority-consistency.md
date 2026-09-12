# Verification — `phase2/talent-settlement-events.md` — Lens: Authority & Direction Consistency

**Verdict: VERIFIED_WITH_CAVEATS**

The analysis's Part 1 (talent settlement at closure) is unusually well-grounded: every accepted-code
line-number citation spot-checked against `accepted-592e926/src/core/{hollywoodTypes,hollywoodValidation,
tuning}.ts` (11 separate citations, including exact single-line ones like `hollywoodValidation.ts:165`,
`:331`, `:399`, `tuning.ts:391`) reproduced the cited text **exactly**, and it correctly applies most of
the digest's binding corrections (nine-studio ecosystem, Capitalism Lab DLC-preview downgrade, OpenTTD
non-inherited-loan, Football Manager administration-not-feature-page, V13–V18-only downgrade refusals).
It also correctly treats `StudioIdentity` as a P12 "no-widening" frozen leaf and proposes a new versioned
root instead — matching both the task's explicit instruction and P12's own no-widening law
(`CODEX-...-PACKAGE-12.md:475`). Part 2's tiering table correctly keeps private rival ledger data out of
every public notice.

However, two findings below are real authority/direction violations (one of them touching a named Owner
ruling directly, not just a design-doc preference), and two are real but lower-severity source-discipline
problems. None invalidates the Part 1 core design, which is why this is VERIFIED_WITH_CAVEATS rather than
REFUTED_IN_PART.

---

## Problems

### 1. [MAJOR] Silently re-asserts a P16+-only acquisition ruling that Owner direction I has already superseded, and self-contradicts its own correct hedge elsewhere

**Claim:** Three places in the document state or assume settled P16+ ownership of the acquisition/auction
*mechanic*:
- §3.1 "Studio auction" row: `"an actual auction/buy-flow is P16+ scope by binding law 14."`
- §4 Package ownership summary: `"**P16+** — owns any live acquisition/auction *mechanic* (bid flows,
  valuation, asset transfer); this task specifies only what a completed transaction's historical notice
  must and must not disclose."`
- §6 open-decision #4: `"...left to whichever P16+ ruling eventually authorizes acquisitions at all
  (direction I)."`

**Why it is wrong:** `P15-PACKAGE.md` binding law 14 ("Corporate transactions wait... live in P16+"), §23
("acquisition | ... | **defer to P16+**"), and §25 (explicit deferral list including "acquisition and
merger") all pre-date the new Owner direction. Even more directly, `P13-P15-OWNER-RULINGS.md` §4.2 is an
**actual dated Owner ruling**, not just a design-doc preference: *"The words Corporate Hollywood do not
authorize acquisitions, mergers, ownership stakes, subsidiaries, co-productions, or library/IP transfers.
Those systems remain P16+ successor-design possibilities."* Owner direction I (2026-09-11, SETTLED) is
explicit that it **"supersedes prior 'acquisitions unwanted/P16+ only' reading"** and that "do NOT assume
the whole M&A system belongs in core P15; research the best package boundary and shape" — i.e. the exact
owning package (P15B continuation / new P15D / P16 / other) is now a **genuinely open** question, assigned
verbatim to the sibling `ma-auction.md` task ("recommend the PACKAGE BOUNDARY: P15B continuation / new
P15D / P16 / other, with reasoning").

The document's own "Acquisition" row in the same §3.1 table gets this right — `"(direction I, eventual,
package boundary is an open research question — nothing below is a scope authorization)"` — which makes
the flat "P16+ owns"/"P16+ scope by binding law 14" statements elsewhere in the *same document*
internally inconsistent, and a failure of the task's own method rule to label touched prior-P15 text
CONFIRMED / QUALIFIED / CORRECTED / **SUPERSEDED BY OWNER DIRECTION**. As written, a reader of §4 or §6
alone would conclude the package boundary is closed, when the Owner explicitly reopened it this same day.

**Corrected statement:** P15-PACKAGE binding law 14 / §23 / §25 and `P13-P15-OWNER-RULINGS.md` §4.2's
"acquisition → P16+ only" ruling are **SUPERSEDED BY OWNER DIRECTION I** insofar as they assumed
acquisition mechanics could never be P15-owned. The owning package for any live auction/acquisition
*mechanic* is not settled and is reserved for the `ma-auction.md` package-boundary research; this
analysis should state only what a completed transaction's/settlement's public notice discloses (which it
does correctly) without asserting — in the Studio-auction row, the package-ownership summary, or the
open-decisions list — that "P16+" already owns it.

### 2. [MAJOR] Reproduces a comparator misquote the verification digest explicitly refutes, contradicting the task's binding-digest instruction

**Claim (§2.1, worked into the OpenTTD/GearCity terminal-law comparison):** *"GearCity's bankrupt company
is 'liquidated, refinanced under new ownership, or sold' as one event, not a phase-out."*

**Why it is wrong:** `phase1-verify/_DIGEST.md` contains a direct, binding correction of exactly this
phrase: *"GearCity AI bankruptcy second path described as refinanced survival 'under new ownership' (in
quotation marks) — MISQUOTE. ventdev.com pid 7643, Eric.B post #4 (24 May 2016): 'Second path is coming
out of bankruptcy through financing, such as a bank or investment firm buying them. In this path the
company still owns the company.' The phrase 'under new ownership' does not appear and contradicts the
source's own gloss. Corrected: 'refinanced survival (a bank or investment firm finances it; per the dev,
the company still owns itself)'."* The task's PREAMBLE states the digest's corrections "are binding," and
this analysis's own header explicitly claims to apply the digest's corrections (naming four others it did
apply) — but it missed this one and carried the exact debunked wording forward verbatim from the
uncorrected phase-1 draft (`comp-bankruptcy-loans.md` §1.5, which has the same uncorrected phrase).

**Corrected statement:** GearCity's AI bankruptcy has three outcomes — liquidation, **refinanced survival**
(a bank or investment firm finances the company, but per the developer "the company still owns the
company," i.e. it is *not* new ownership), or sale/takeover by another company. The phrase "under new
ownership" should not appear in this document.

### 3. [MODERATE] Misattributes a P15-PACKAGE binding rule to the Builder Annex

**Claim (§2.7):** *"...per **P15-BUILDER-ANNEX §12.3's** allowance for a 'genuinely fixed-size result.'"*

**Why it is wrong:** The quoted clause — *"A genuinely fixed-size result may use a fixed receipt only when
its schema states the hard maximum, affected count, exact subject set, and digest"* — is verbatim text
from **`P15-PACKAGE.md` §12.3**, confirmed by direct read. `P15-BUILDER-ANNEX.md` has no numbered "§12.3"
section at all — its top-level sections are lettered A through S (e.g. C.3 "P15B corporate state," L.6
"Endurance invariants," M.5 "Future P15B corporate view"), so "§12.3" cannot refer to the Annex under any
reading. Per `P15-PACKAGE.md` §1.1's authority precedence, the Package and its Annex are different-tier
documents; misattributing a Package-level rule to the Annex risks a builder looking in the wrong document
and understating which tier actually mandates the fixed-receipt allowance.

**Corrected statement:** cite `P15-PACKAGE.md` §12.3 for the fixed-size-result allowance. (The document's
separate, correct citations to `P15-BUILDER-ANNEX` §L.6.9-10 for chunking/endurance are unaffected.)

### 4. [MODERATE] Package-ownership summary omits P10, which §12.3 (quoted earlier in the same document) names as a required settlement co-signer

**Claim (§4, "Package ownership summary"):** lists P12 (registry/roster/employer), P15B (requester/owner
of the new roots and receipts), P11 ("untouched by the recommended zero-severance rule"), and P14
(competitive-market access to free agents) as the packages touched by this design. P10 is never mentioned.

**Why it is incomplete:** `P15-PACKAGE.md` §12.3 — quoted at length earlier in this very analysis — states
for dormancy/closure: *"P10 settles contracts/person references, P11 settles finance, and P12 settles
projects/capacity/roster/employer/exclusivity/intervals."* Binding law 16 makes this a hard requirement,
not a courtesy: *"A later entrant, dormancy, re-entry, or closure request cannot change P12 operating
state until P13, P10, P11, P12, and P14 each supply an idempotent initialization/settlement receipt and
the complete participant manifest commits atomically. No package's partial receipt becomes authoritative
alone."* Since this task's entire Part 1 design is precisely about what happens to Contract/Talent-facing
records (`IndustryEmployment`, `state.contracts`, `state.talent`) at closure, P10's explicit, named
settlement role over "contracts/person references" is directly on point — its omission from §4's ownership
map could lead a builder to treat the V20 closure transition as a P12+P15B-only affair and skip the
required P10 settlement receipt in the atomic manifest.

**Corrected statement:** add — "**P10** — settles the underlying `Contract`/`Talent` (person-reference)
truth at closure per §12.3 and must supply its own idempotent settlement receipt in the same atomic
manifest P15B assembles alongside P11 and P12, even where (as this design proposes) no `Contract`/`Talent`
field itself needs to change; the receipt, not the absence of a diff, is what the binding-law-16 manifest
requires."

---

## Missing items

- The document never notes that `P13-P15-OWNER-RULINGS.md` §4.2 is the specific, dated Owner ruling that
  direction I's "supersedes prior 'acquisitions unwanted/P16+ only' reading" is talking about — naming it
  would have made the required SUPERSEDED-BY-OWNER-DIRECTION labeling unambiguous (see Problem 1).
- §12.3's atomic-manifest requirement also names P13 ("P13 resolves every active research/adoption order")
  as a required closure-time signer once P13 exists; reasonable to omit today since P13 is unimplemented,
  but the document could have flagged this as a future prerequisite the same way it flags P14's (§2.9,
  package-ownership §4) — it does this for P14 but not P13.
- No cross-check against `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §3 (the other analyses' sweep found a
  player no-bankruptcy/no-loans ruling there); this task's own Part 2 "Studio bankruptcy (player)" row
  would have been strengthened by citing it directly rather than only P15-PACKAGE §23's asymmetry ruling.

## Strong points

- Every accepted-code citation spot-checked (`hollywoodTypes.ts:62-68`, `:96-103`; `hollywoodValidation.ts:
  72`, `:75`, `:165`, `:331`, `:347-348`, `:357-358`, `:395`, `:399`; `tuning.ts:391`) reproduced the cited
  source text exactly, line for line — an unusually high standard of code fidelity for a paper-design task.
- Correctly applies the digest's nine-studio-ecosystem, Capitalism-Lab-DLC-preview, OpenTTD-loan, Football-
  Manager-administration, and V13–V18-downgrade-refusal corrections rather than the stale phase-1 claims.
- Correctly keeps `StudioIdentity` un-widened (new versioned root instead of a status field), matching both
  the task's explicit instruction and P12's own frozen-leaf law (`CODEX-...-PACKAGE-12.md:475`).
- The new `employerClosed` reason is deliberately made symmetric (usable for either player or rival), so
  the zero-severance-at-closure design does not create a hidden player-only exemption (binding laws 8/17)
  — the player/rival asymmetry it does introduce (0% at closure vs. 50% at discretionary `releaseTalent`)
  is grounded in solvency state, not identity, and is correctly justified as such.
- Every public-notice row in Part 2 correctly withholds `RivalAccount`/ledger/salary/policy detail, matching
  P15's "public is a projection rule, not access to raw state" law (§13.3) and the already-shipped
  `bridge/industry.ts` disclosure boundary.
- PROVISIONAL labeling and the "3 productions" capacity-mismatch self-correction (§5) are exactly the kind
  of source discipline and non-overclaiming the task's method rule asks for.
