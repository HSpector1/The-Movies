# Verification Memo — `phase2/net-worth.md` — LENS: Authority & Direction Consistency

**Verifier role:** adversarial verifier, key `net-worth`, read-only.
**Target:** `<scratchpad>/out/phase2/net-worth.md` (present, 476 lines).
**Verdict: VERIFIED_WITH_CAVEATS**

The analysis's core authority/direction discipline is sound: it does not reopen any settled
Direction letter, it correctly and precisely labels prior P15 text CONFIRMED / QUALIFIED /
SUPERSEDED BY OWNER DIRECTION against the actual authority-doc language (verified against the
cited files below), and its package-ownership table respects P11 ledger authority, the P16+
acquisition boundary, and P15B's distress scope without deciding any of them prematurely. Two
concrete source-discipline defects were found (one is a citation that points at code that does not
say what is claimed; one repeats a comparator claim the binding verification digest explicitly
refuted), plus one loose citation and one lower-severity design tension worth flagging to the
Owner. None of these rises to reopening a settled choice or inventing law, which is why the verdict
is CAVEATS rather than REFUTED.

---

## Violations found

### 1. Fabricated/incorrect citation for `era.costScale` (source discipline, lens item b/d)

**Location in analysis:** §6, "`era.costScale` (default 1.0, `calendar.ts:17` per finance-logic.md
§5.2) is the only field that already says 'how expensive is this era,' applied to film cost."

**Problem:** `calendar.ts:17` (accepted-592e926/src/core/calendar.ts) is
`const year = 1920 + Math.floor(absoluteWeek / 52)` inside `campaignDate()` — it has nothing to do
with `costScale`, and `costScale` is not defined anywhere in `calendar.ts` at all (confirmed by
`grep -rn costScale src/`). The attribution "per finance-logic.md §5.2" is also not what
finance-logic.md itself cites: finance-logic.md's own evidence row for this exact claim points to
`src/core/types.ts:284–289`, `src/core/hollywoodPolicy.ts:45`, `src/core/reception.ts:264`, and
`src/core/worldgen.ts:657–663` — never `calendar.ts`. The underlying fact (costScale exists,
default 1.0, is the only live era field) is TRUE and independently confirmed in the accepted
snapshot (`EraConfig.costScale: number` at `types.ts:284-288`; `costScale: 1.0` set at
`worldgen.ts:662`), so this is a citation error, not a fabricated mechanic — but it is a citation
the reader cannot trust at face value, and it invents a location not even present in the source it
claims to be quoting.

**Corrected statement:** "`era.costScale` (default 1.0) is the only live era field, per
`types.ts:284-289` (declaration) and `worldgen.ts:657-663` (default assignment), per
finance-logic.md §5.2's own citation set — not `calendar.ts:17`."

### 2. Repeats a comparator quote the binding digest already REFUTED (source discipline, lens item d)

**Location in analysis:** §1, "The original 2005 game" bullet list item on Capitalism Lab:
"bankrupt-company acquisition is priced at 'a discounted price, reflecting its distressed financial
condition' (≤40 words, `comp-ranking.md`:144)."

**Problem:** The task's own binding input, `phase1-verify/_DIGEST.md`
(`verify:comp-ranking:source-fidelity`), explicitly REFUTED this exact quote at this exact
location: *"Capitalism Lab: bankrupt AI firms trigger a modal acquisition offer at 'a discounted
price, reflecting its distressed financial condition', labelled OFFICIAL/HIGH as base behaviour...
The page ... does not contain the quoted phrase (it says 'Distressed companies are cheap') and
states the offer exists only 'With the Acquire Companies Facing Bankruptcy setting enabled ... It
is a new-game setting' under the Banking and Finance DLC ... Tier: OFFICIAL but DLC-optional,
MEDIUM."* The PREAMBLE for every P15 analyst states "you MUST respect its corrections." Net-worth.md
instead reproduces the pre-correction wording verbatim, with no caveat that it is an opt-in DLC
setting rather than Capitalism Lab's base bankrupt-acquisition behavior, and cites it as if it were
still an uncorrected `comp-ranking.md` fact. (The sibling claim two sentences later, about GearCity's
"Networth" report broken into six categories, is a *correctly* applied digest correction from the
same comp-ma verification pass — the analysis clearly knows how to apply digest corrections
elsewhere, which makes this one omission more notable as a miss than as a pattern.)

**Corrected statement:** "Capitalism Lab: market cap, financial statements, and a personal-net-worth
Billionaires list are three separate surfaces; with the optional Banking & Finance DLC's 'Acquire
Companies Facing Bankruptcy' new-game setting enabled, a bankrupt AI firm's assets can be acquired
at a reduced price ('distressed companies are cheap') — this is a DLC-gated setting, not
Capitalism Lab's base bankruptcy behavior (`_DIGEST.md` comp-ranking source-fidelity correction;
OFFICIAL-but-DLC-optional, MEDIUM, not OFFICIAL/HIGH)."

### 3. Loose citation: "Power Ranking excludes cash; `P15-PACKAGE.md`:803" (minor, source discipline)

**Location in analysis:** §7, "consistent with ... the general law that rivals cannot leak private
ledgers" bullet, and §9's SUPERSEDED entry citing `P15-PACKAGE.md`:803.

**Problem:** `P15-PACKAGE.md:803` is the "Power Ranking definition" row of the Owner-decisions
table; its actual text is "avoids Standing/valuation duplication and volume spam" — it does not say
"excludes cash" verbatim. The literal "never reads Standing, cash/valuation, private slate..."
sentence the analysis is really relying on is at `P15-PACKAGE.md` §12.2 (unnumbered inline text, a
few lines above the table cited by line 803) and verbatim at
`P13-P15-LONG-RANGE-ROADMAP.md:682`. Substance is correct and independently confirmed by both
authority documents; only the specific line pointer is imprecise.

**Corrected statement:** cite `P15-PACKAGE.md` §12.2 ("it never reads Standing, cash/valuation,
private slate...") and/or `P13-P15-LONG-RANGE-ROADMAP.md:682`, not line 803, for the "excludes
cash" claim.

---

## Flagged for Owner attention (not a violation — the analysis already hedges it)

**§4.3's Standing→multiplier-band adjustment to Estimated Studio Value** sits close to the exact
tension `prior-claims.md` (item B2, `_DIGEST.md`-consistent) already raised for Direction B's
"prestige" lane: binding law 3 in `P15-PACKAGE.md` §11 ("Standing is not rank") and the P15A.2
candidate definition's explicit "never reads Standing" clause were written to keep P08 Standing out
of any derived competitive number. Direction C's Enterprise Value is not a rank, and the task
prompt itself directed the analyst to address "brand/Standing" as a candidate input, so this is not
a violation of settled law — but the analysis's own hedge ("Exact Standing tiers were outside this
task's evidence scope... not invented here," §4.3, and listed uncertainty §11 item 2) correctly
flags it as illustrative rather than decided. Recommend the Owner treat any eventual
Standing-into-valuation feed with the same scrutiny already earmarked for Direction B's prestige
lane, since both would be reading the same persistent-reputation channels into a derived number.

---

## Checks that held up (spot-verified against accepted-592e926 and authority docs)

- **No settled Direction reopened.** Directions A, B, D–K are untouched; Direction C is applied
  exactly as scoped (book net worth + labelled range, "Book ≠ sale price," no Wall Street
  simulator); Direction F's loan math is correctly left to P11, Direction I's acquisition-mechanism
  boundary correctly left open/P16+.
- **CONFIRMED/QUALIFIED/SUPERSEDED labels in §9 check out** against the actual authority-doc text:
  `P15-PACKAGE.md` §25 does list "studio and library valuation" under P16+ deferrals (confirmed
  near line 843); `P13-P15-OWNER-RULINGS.md:151` does list "...valuation..." in the P16+ parking
  lot; `P13-P15-LONG-RANGE-ROADMAP.md:699` does list "studio valuation" in the P16+ list. Direction
  C's supersession of these, and the QUALIFIED carve-out preserving the acquisition-mechanism
  deferral, are both accurate.
- **The digest's `P11-TO-P12-PRODUCER-HANDOFF.md:37` correction is applied correctly** (§2/§3.1: the
  analysis explicitly treats the "never reconstruct a purchase from today's blueprint price" rule as
  a narrower capital-contributor-history-row rule extended by new design choice, not pre-existing
  law — matching `_DIGEST.md` verify:code-finance:source-fidelity exactly).
- **The digest's `bridge/industry.ts:110` line correction is applied correctly** (§7 cites `:110`,
  not the report's original wrong `:117`).
- **Code facts spot-checked directly against `accepted-592e926/` and confirmed accurate:**
  `INITIAL_CASH: 20_000_000` (tuning.ts~70); `FACILITY_DEMOLITION_REFUND_FRACTION = 0.5`
  (tuning.ts:1613); `SET_DEMOLITION_REFUND_FRACTION = 0.35` (tuning.ts:816);
  `HIRING_TERMINATION_FRACTION = 0.5` (tuning.ts:392); `guaranteedComp`/`terminationCost` formulas
  (employment.ts:172-180); REQ-016's "not an additional charge and are not subtracted from Cash"
  text (bridge/finance.ts:80-81, verbatim); `LotParcel.ownedFromStart: true` and "cost nothing to
  keep" founding-structure language (types.ts:864-872, ~1005-1009); `ConstructionProject.capex:
  780000` as the sole literal persisted price (types.ts:813-823) — all match the analysis's claims
  and the digest's corrected code-finance facts (nine-studio ecosystem / per-studio Standing / no
  loans / no missed-payment event / cashNegative stop reason are all correctly left untouched or
  correctly assumed-absent by this task, which does not depend on them).
- **Package-ownership table (§8) does not overreach:** the new "P15D" label is explicitly sanctioned
  by the analyst PREAMBLE's own package-name list (`P15A / P15B / P15C / new P15D / P16+`), and
  creating it is listed as remaining Owner decision #1, not asserted as settled. P11 keeps ledger
  and loan-math authority; P15B keeps distress-meaning authority; P16+ keeps the
  acquisition-mechanism/library-IP authority; P12's rival-visibility table is extended, not
  rewritten, for the new numbers (§7 table).
- **Direction B's open research question (fourth lane vs. separate ranking) is correctly left
  open** — the analysis supplies an input (a banded, non-dollar signal) and explicitly declines to
  decide adoption, consistent with "P15D supplies the number; P15A.2 decides."
- **"Do not assume wealthiest = most powerful" (Direction B) is affirmatively honored**, not just
  avoided — Worked Example (iii) is built specifically to demonstrate the failure mode the Owner
  warned against.

---

## Verdict rationale

Authority/direction consistency — the assigned lens — is fundamentally intact: nothing here
converts an open Owner question into law, nothing reopens a settled letter, and the
CONFIRMED/QUALIFIED/SUPERSEDED bookkeeping in §9 is accurate against the authority documents as
filed. The defects found are both source-discipline lapses under the same PREAMBLE ("you MUST
respect its corrections... comparator claims not overstated beyond the verified digest") rather than
authority-boundary violations, but one of them (item 2) is a direct, avoidable disregard of a
binding digest correction on a claim the analysis chose to keep as supporting evidence for its own
"more than one number" argument, which is why this is VERIFIED_WITH_CAVEATS rather than a clean
VERIFIED.
