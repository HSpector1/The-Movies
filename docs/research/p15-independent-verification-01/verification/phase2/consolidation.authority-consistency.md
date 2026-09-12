# Adversarial Verification — LENS: Authority & Direction Consistency
## Target: `out/phase2/consolidation.md` (P15 §10, Consolidation / No-Replacement)

**Verdict: VERIFIED WITH CAVEATS**

The analysis's central recommendation — no artificial active-studio floor, Direction G
stands as selected, rival loan symmetry is the real dial, market/ranking/performance all
degrade gracefully — is sound, correctly declines to reopen Direction G, and is backed by
code citations that check out almost line-for-line against `accepted-592e926`. But on the
one thing this section exists to settle — **whether a floor is needed** — its "Corrections
to prior P15 text" is materially incomplete: it misses the package's own flagship
Owner-decisions table carrying the floor language twice, and an ACCEPTED-docs design annex
that already designs a floor mechanism. Those are exactly the kind of prior commitments
Direction G supersedes and this report was chartered to catch and label. Fixing the two
major items below is required before this ships to the Owner as "settled."

---

## MAJOR — Missing correction: P15-PACKAGE.md §23 itself still recommends an active-rival
## floor, in two coupled rows, and consolidation.md never engages with §23 at all

`authority/P15-PACKAGE.md` is the flagship P15 package document — arguably more central
than the roadmap for an Owner reading this report. Its own "Owner decisions" table (§23)
contains:

- **`P15-PACKAGE.md:800`** ("later entrants / active-rival floor" row): PRELIMINARY
  RECOMMENDATION = "**deterministic bounded eligibility with P12's minimum three active AI
  rivals**; P15B assesses/requests, P12 mints/registers/commits..."
- **`P15-PACKAGE.md:798`** ("rival closure" row, same table): "**authorize staged rival
  closure only in a dedicated P15B terminal slice, with exact triggers, settlement,
  entrant floor, immutable archive, and Owner approval**" — dependency column: "P12
  projects/identity and **minimum-rival law**."

That second row is important beyond the headcount question: it makes the future
**rival-closure implementation itself** conditional on an "entrant floor"/"minimum-rival
law." Under Direction G ("NO ARTIFICIAL FLOOR... bankrupt studios do NOT trigger synthetic
replacements") that gate is void, not just the headcount preference.

Consolidation.md cites `P15-PACKAGE.md` exactly **once**, at line 158 (an unrelated
sentence about "eligible studio cohort" for Power Ranking), and never touches §23. Its
"Corrections to prior P15 text" section names only the Roadmap's `§19.3` row and the
digest-corrected P12A SIM-015/PERF-001 — it does not name the package's own §23 rows,
which are the more authoritative and more directly on-point text.

**Why this matters:** a future P12/P15B builder consulting the primary package document
(not just the roadmap) would still read "minimum three active AI rivals" as the
*recommended* answer, and would read the rival-closure slice as blocked pending an
"entrant floor" — the exact thing the Owner just forbade.

**Corrected statement to add to the analysis's "Corrections to prior P15 text":**
> SUPERSEDED BY OWNER DIRECTION G — `P15-PACKAGE.md:800` ("later entrants / active-rival
> floor," recommending "P12's minimum three active AI rivals") and `P15-PACKAGE.md:798`
> (the "rival closure" row's requirement for an "entrant floor"/"minimum-rival law" as a
> precondition of the P15B terminal/closure slice). The rival-closure implementation must
> NOT be gated on proving or maintaining any active-rival floor; §23 needs an Owner-recorded
> correction alongside the roadmap's §19.3, not just the roadmap.

---

## MAJOR — Missing correction: an ACCEPTED implementation-ready design doc already
## specifies a floor mechanism, and it lives inside the accepted-592e926 snapshot itself

`accepted-592e926/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md`
is headed **"Status: accepted implementation-ready design boundary; documentation only; no
production authorization"** — a higher-weight status than a plain research candidate. Its
State/Edge Case Matrix (§N) contains, at **line 626**:

> `| active-count floor | deterministic entrant scheduling, not cash resurrection |
> Hollywood remains populated | mass-failure stress fixture |`

This is a literal floor-preservation mechanism ("deterministic entrant scheduling" beyond
the authored schedule, purpose-stated as "Hollywood remains populated") sitting inside
accepted docs. It is exactly what Direction G forbids ("after all authored entrants
arrive... bankrupt studios do NOT trigger synthetic replacements... NO ARTIFICIAL FLOOR").

Consolidation.md never cites this file (its only "no floor exists in code" claim is a grep
of `hollywood*.ts` for "minimum/floor," which correctly finds nothing in *code* — but this
row is in the accepted *docs*, which the task's own INPUTS list as part of the accepted
snapshot to cite file:line from, and the digest independently flags this exact document's
§N as "on-topic" and previously skipped by an earlier phase-1 report over the same
floor/replacement question, `_DIGEST.md:39`).

**Corrected statement to add:**
> SUPERSEDED BY OWNER DIRECTION G —
> `docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md:626`
> ("active-count floor" edge case: "deterministic entrant scheduling... Hollywood remains
> populated"). No P12/P15B implementation should build "deterministic entrant scheduling"
> beyond the nine authored arrivals to keep the population up; the "mass-failure stress
> fixture" test obligation in that row should be re-scoped to verify graceful degradation
> of the shared-market/ranking/tick-loop surfaces (which this analysis's §2/§5/§10 already
> show degrade gracefully), not population maintenance.

---

## MODERATE — Same roadmap table, a second row also assumes the floor, and only one of
## the two was corrected

Consolidation.md correctly flags and supersedes `P13-P15-LONG-RANGE-ROADMAP.md` §19.3's
"Later entrants / active-rival floor" row. But the same §19.3 table's **"Rival closure"**
row (immediately above it) reads: "equivalent pre-terminal guards/remedies; exact staged
rival closure only in an Owner-approved P15B terminal slice with P12 registry settlement,
archive, and **active-rival-floor proof**." This clause was left uncorrected. It should be
folded into the same SUPERSEDED note as the P15-PACKAGE.md §798 finding above — it is the
identical coupling (rival-closure implementation gated on proving a floor) in a second
document.

---

## MINOR — §5 treats an unbuilt, unauthorized design annex as an already-existing
## "state machine," on par with genuine accepted-code facts

§1's "Baseline facts this analysis is built on" table lists, as a peer row to real code
facts like `RIVAL_ARRIVAL_WEEKS`: "Power Ranking state machine already anticipates a
shrinking cohort ... `archived studio → excluded/archived; history retained`" sourced to
`P15-BUILDER-ANNEX.md` §C.2. That annex is explicitly headed **"Mode: DOCUMENTATION
ONLY," "Authorization: NO PRODUCTION AUTHORIZATION,"** states "Build nothing from this
annex now," and is pinned to an older accepted base (`7811377cea...`), not `592e926`. At
592e926 itself, per the digest (`_DIGEST.md` "prior-claims" entries on L15/B1/B10/B11),
**no Power Ranking model and no archived-studio rank state exist in code** — only a
per-lane, query-time, unpersisted Standing-derived chart (`bridge/industry.ts`), which the
digest itself says is in live tension with "Standing is not rank."

§5 leans on this to conclude "it does not need to be invented, only specified" — that
understates the remaining work and mislabels a non-binding, unbuilt design sketch as
settled machinery, contrary to the METHOD instruction to mark prior P15 text
CONFIRMED/QUALIFIED/CORRECTED/SUPERSEDED. The "3 active / 7 closed" presentation is a
reasonable *target*, not something already anticipated by shipped code.

**Corrected statement:** label the §C.2 table QUALIFIED — a design proposal only, unbuilt,
unauthorized, predating both 592e926 and the archived/excluded transition's implementation;
the cohort-eligibility threshold (correctly flagged by §5 as open) is one of several open
items, not the only one — whether the archived/excluded state exists in any form at all is
also open.

---

## MINOR — two file:line citations are off by a small amount (source-discipline)

- §9: "`decide()` simply stops committing once `cash < operatingReserve`... (`hollywoodTick.ts:174`)" —
  line 174 is the preceding comment; the actual gate is `hollywoodTick.ts:176`. (Note: the
  correct line, 176, IS used correctly elsewhere in the same report's §1 table, so this is
  an internal inconsistency as well as an imprecision.)
- §7: "(`_DIGEST.md` line 31/58 — corrected to COMMUNITY/LOW-MEDIUM tier...)" — the actual
  Transport Fever 2 re-tier corrections are at `_DIGEST.md:242` and `:252`, not 31/58.
  Substance is accurate (TF2 ships with zero AI competitors as a product fact; the "deal
  breaker"/"no competitive objective" quotes are correctly attributed to the OP, not
  invented "boring"/"work against" language) — only the pointer is wrong.

Neither changes any conclusion; both should be corrected so the citation is independently
checkable without re-deriving it.

---

## Verified as accurate (no correction needed) — spot-checked against `accepted-592e926`

- `calendar.ts:3` `RIVAL_ARRIVAL_WEEKS = [0,0,0,0,520,988,1560,1872,2548]` — exact match to
  Direction G's authored schedule.
- `hollywoodStartingData.ts:9-34`: nine rivals, capital 20M–38M, `reserveWeeks`
  (13,18,20,15,15,18,13,16,12), `negativeScale` (0.94–1.20), `marketingRatio` (0.14–0.24)
  all confirmed verbatim, including which named studio sits at which extreme (Bright
  Meridian most exposed at reserveWeeks=12/negativeScale=1.20; Night Orchard most
  conservative at 20/0.94).
- `hollywood.ts:88` `rivalCapacityOpex` — exact line.
- `hollywoodTick.ts:221` `for(const b of h.businesses)` — exact line.
- `hollywoodTick.ts:280-281` unconditional weekly `moveRivalMoney` postings (overhead,
  facilityOpex) — accurate (payroll itself is the adjacent line 279, immaterial).
- No rival capacity-growth/`buildFacility`-type function exists anywhere in `hollywood*.ts`
  at 592e926 (grepped) — confirms §8's claim that rival post-entry capacity growth is
  genuinely unbuilt scope, correctly flagged as such rather than assumed.
- `P13-P15-OWNER-RULINGS.md` §4.2 (L132-135, Corporate-title clarification) and §5
  (L147-162, P16+ parking of acquisitions/mergers/valuation) — citations exact; correctly
  labeled QUALIFIED (not fully superseded) rather than over-claimed, appropriately
  deferring the M&A boundary question to the sibling `comp-ma`/P15I work.
- `P13-P15-LONG-RANGE-ROADMAP.md` §19.3 "Later entrants / active-rival floor" row and its
  "P12's minimum three active AI rivals" text — quoted and superseded correctly (just
  incomplete relative to the two MAJOR items above).
- GearCity ">75% market share triggers a monopoly lawsuit" and OpenTTD
  `max_no_competitors=0` (default) claims match `phase1/comp-ranking.md` and are not
  contradicted by any digest correction.
- Direction F package-ownership split ("P11 ledger/debt math authority... P15B may own
  distress context") is applied correctly in the Package Ownership table.
- §8's legitimate-counterweight vs. forbidden-subsidy test ("same law, same cost" vs. "free
  benefit keyed to headcount") correctly operationalizes Direction G/D's "no hidden rival
  subsidy" rule and is one of the analysis's strongest sections.
- Player-failure framing ("a monopolist player is not automatically safe") correctly avoids
  a player-only exemption and is consistent with Direction E without overclaiming settled
  design.
- The rival-loan-symmetry recommendation (§9) is correctly presented as a *recommendation*
  requiring Owner sign-off (flagged in the "must be reported to the Owner" list), not
  silently promoted to law — good practice under the METHOD rules.

---

## Summary of required corrections

1. Add to "Corrections to prior P15 text": `P15-PACKAGE.md:798,800` (§23 Owner-decisions
   table, both the "later entrants/active-rival floor" row and the "rival closure" row's
   "entrant floor"/"minimum-rival law" dependency) — SUPERSEDED BY OWNER DIRECTION G.
2. Add: `docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md:626`
   ("active-count floor" edge case) — SUPERSEDED BY OWNER DIRECTION G.
3. Add: `P13-P15-LONG-RANGE-ROADMAP.md` §19.3 "Rival closure" row's "active-rival-floor
   proof" clause — SUPERSEDED BY OWNER DIRECTION G (same note as #1/#2).
4. Re-label the `P15-BUILDER-ANNEX.md` §C.2 rank-state table as QUALIFIED design proposal
   (unbuilt, unauthorized, pre-dates 592e926), not an already-anticipated mechanism.
5. Fix two file:line citations (`hollywoodTick.ts:176` not 174; `_DIGEST.md:242,252` not
   31/58).

None of these overturn the analysis's bottom line — Direction G's "no floor" holds up
independently under the code and market/ranking/performance evidence this report gathered
itself. But an Owner-facing "no floor is needed" verdict should not ship while the
package's own primary Owner-decisions table (§23) and an accepted implementation-ready
design doc still recommend one, uncorrected.
