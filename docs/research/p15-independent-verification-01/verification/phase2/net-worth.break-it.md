# Adversarial Verification — "Studio Net Worth / Valuation" (net-worth.md)

**Verifier role:** adversarial game designer + economist, BREAK-IT lens. Not the author.
**Target:** `out/phase2/net-worth.md` (P15 Direction C paper analysis, 476 lines).
**Method:** recomputed the paper-scenario arithmetic independently; checked every code
citation against `accepted-592e926/`; checked the model against exploits, snowball paths,
degenerate strategies, legibility, and named edge cases (migration, player/rival symmetry,
2-studio end state, post-2040, save/load mid-settlement, ID reuse); cross-checked against
`ranking-vs-value.md` and `ma-auction.md` for consistency.

**Verdict: VERIFIED WITH CAVEATS.** The arithmetic is entirely correct (I recomputed four of
four worked examples, zero errors), the code citations I checked are accurate, and the
document properly incorporates the binding `_DIGEST.md` correction on the P11 handoff rule.
But the model has one load-bearing design gap (no rival data to compute the formula it
proposes) and one genuine, evidence-grounded exploit surface (the analysis's own Worked
Example (iii) proves Estimated Studio Value can fall *below* Book Net Worth — a "worth
more dead than alive" arbitrage — and the document never notices or guards against it).

---

## 1. Arithmetic recompute (four of four worked examples checked; zero errors found)

### Example (ii) — mid-game studio

| Line | My recompute | Document |
|---|---|---|
| Facilities book: (2.4M+1.15M+0.85M)=4.4M × 0.5 | $2,200,000 | $2,200,000 ✓ |
| Sets book: (4×$500k)=2.0M × 0.35 | $700,000 | $700,000 ✓ |
| Accrued interest: $5M × 6% × 0.5yr | $150,000 | $150,000 ✓ |
| Book NW: 6.5M+2.2M+0.7M−5.0M−0.15M | $4,250,000 | $4,250,000 ✓ |
| Obligations: 8 × (700,000/52)×100 = 8×13,461.54×100 | $10,769,231 | $10,769,231 ✓ (uses `TICKS_PER_YEAR=52`, `tuning.ts:56`, correctly) |
| Wind-Down: 4.25M − 0.5×10.769231M | −$1,134,615.5 | −$1,134,615 ✓ (rounding) |
| Operating range 3×/6× × $1.8M | $5.4M–$10.8M | $5,400,000–$10,800,000 ✓ |
| Equity range: range + 6.5M − 5.0M − 0.15M | $6.75M–$12.15M | $6,750,000–$12,150,000 ✓ |

### Example (iii) — rich-but-declining

Book NW: 35M+6M+1M = **$42,000,000** ✓. Trailing avg (900k+400k+100k)/3 = **$466,667** (doc rounds
to $467,000, immaterial). Operating range 3×/6×: **$1,400,000–$2,800,000** ✓ (exact using the
unrounded average). Equity range: +$35,000,000 → **$36,400,000–$37,800,000** ✓.

*(This scenario is also where Finding 1 below comes from — see §2.)*

### Example (iv) — hot-but-negative-equity

Facilities: $9.6M×0.5=$4.8M ✓. Sets: $4.2M×0.35=$1.47M ✓. Book NW:
2M+4.8M+1.47M−9M−0.3M = **−$1,030,000** ✓. Operating range 3×/6×$3.2M = **$9.6M–$19.2M** ✓.
Equity range: +2M−9M−0.3M → **$2,300,000–$11,900,000** ✓.

**Conclusion on arithmetic:** every dollar figure in all four worked examples, including the
compounded multi-step ones (Wind-Down Position, Equity Value Range), reproduces exactly from
the stated formulas and the cited tuning constants (`INITIAL_CASH` 20,000,000, facility refund
0.5, set refund 0.35, `HIRING_TERMINATION_FRACTION` 0.5, `TICKS_PER_YEAR` 52 — all confirmed
live in `accepted-592e926/src/core/tuning.ts:70,391,56` and `employment.ts:170-180`). No
computational error survives this pass.

---

## 2. Finding 1 (MAJOR — exploit / degenerate strategy): the model's own numbers show a
studio can be valued for *less* than it is worth dead, and nothing floors that

Worked Example (iii) computes:

- **Book Net Worth = $42,000,000** (what the studio would net if liquidated today)
- **Estimated Studio Value (equity range) = $36,400,000–$37,800,000**

The *entire* equity-value range sits **below** the liquidation figure by $4.2M–$5.6M. This is
not a rounding artifact — it falls directly out of §4.3's formula, because Estimated Studio
Value never adds facility/set book value at all; it is Cash + a multiple of trailing
operating surplus, and when trailing surplus is thin (as the scenario is explicitly built to
show), the multiple-derived component is small enough that Book Net Worth's own facility/set
lines ($7,000,000 in this example) simply aren't recovered.

This is the textbook signature economists call "trading below liquidation value" — a company
worth more shut down and sold for parts than kept running. It is not inherently wrong for a
*read-out* (real declining businesses do this), but the document's own Direction I already
names the eventual consequence: "**Owner explicitly wants an EVENTUAL ability to BUY OTHER
STUDIOS**," and §8's package-ownership table says explicitly that "P15D exporting a number
makes that later slice easier" for that acquisition system. If any future purchase-price
formula is seeded from Estimated Studio Value without a floor, a player (or, worse, a
deterministic rival policy tuned to maximize net position) gets a **repeatable, risk-free
strategy**: identify any rich-but-declining studio whose Estimated Value < Book Net Worth
(exactly the studio Example (iii) is built to describe), buy it at the quoted range, then
immediately liquidate every facility and set for the refund fractions the game already pays —
pocketing the $4–6M spread with no execution risk. Because Direction G accepts consolidation
as "acceptable/desirable emergent history," nothing in the design stops this from becoming the
dominant end-game strategy for whichever player or rival accumulates enough cash to go
shopping — a classic snowball (each liquidation funds the next acquisition).

A related, secondary risk the document also never flags: because "trailing operating surplus"
is a rolling window computed on demand, a seller (or a rival's deterministic policy) could
*window-dress* it — deferring marketing spend or idling productions in the weeks before any
future valuation snapshot to inflate the trailing average and the quoted price, the same
"dress the books before a sale" pattern real M&A due-diligence exists to catch. The document's
"display-only" framing for V1 defers this, correctly, but doesn't warn P16+ that the number it
will consume is manipulable by the seller's own recent decisions.

**Smallest fix:** add one sentence to §4.3: *"The low end of the Estimated (Equity) Value
Range must never be displayed or consumed below Book Net Worth. If the computed low end falls
below Book Net Worth, replace it with Book Net Worth and label the range 'liquidation-bound'
rather than 'earning-power-bound.'"* This is a one-line clamp, costs nothing to implement later,
and closes the arbitrage at the definition level rather than leaving it for P16+ to discover the
hard way. A second sentence noting the window-dressing risk as a guardrail for whoever builds
the consuming mechanic would close the smaller, secondary gap.

---

## 3. Finding 2 (MAJOR — player/rival symmetry break, code-grounded): the proposed formula has
no data to run against for rival studios

§3.8's Book Net Worth formula is `Cash + Σ(facility ledger capex × 0.5) + Σ(set ledger capex ×
0.35) − loan − interest`, built entirely from the **player's** `PlacedFacility[]` /
`StudioSet[]` records (`placement.ts`, `sets.ts`, `types.ts:1042-1058,1336-1356`), each of which
carries an individual `blueprintId` and a matching `constructionCapex`/`setCapex` ledger row
(invariant-checked at `placement.ts:1719-1725`).

Rival studios do not have this. Reading `accepted-592e926/src/core/hollywoodTypes.ts:79-90` and
`hollywood.ts:140-165`:

- `RivalBusiness.operations.facilities` comes from `rivalStartingFacilities()` — a
  `StudioOperations` shape ("mode, workflows, facilities"), not a `PlacedFacility[]`.
- The entire facility/office capital spend a rival ever incurs is **one lump transaction**:
  `hollywood.ts:158-160` — `capex = BASELINE_DEVELOPMENT_CASTING_CAPEX + STAGE_STANDARD_CAPEX +
  SCENERY_SHOP_CAPEX + POST_BUILDING_CAPEX`, charged once via
  `moveRivalMoney(account, 'capacity', -capex, week)` into `RivalAccount.movements.capacity` —
  a single aggregate number, never itemized by blueprint, never given an individual refund
  fraction.
- `RivalAccount` (`hollywoodTypes.ts:56-61`) is `{openingBalance, cash, periods[]}` with
  `movements: Record<RivalMoneyKind, number>` — there is no per-asset ledger to sum at all.

§7's disclosure table treats "Exact Book Net Worth / EV" for rivals as simply "HIDDEN, same
rule [as cash]," and §8 assigns "the parallel rival computation" to P15D as if it were the same
formula applied to a different studio. It is not: a rival's "Book Net Worth" can only be
approximated from the lump `capacity`/`signing`/`development` movements in its account, at a
coarser resolution than the player's per-facility sum, and the document never says so. This
matters for the task's own stated concerns (deterministic-rival compatibility, AI symmetry) —
whoever builds the "possible banded signal" in §7 needs a genuinely different formula for
rivals, not a re-run of §3's, and would otherwise discover this gap mid-implementation.

**Smallest fix:** one sentence in §7/§8: *"Rivals have no per-facility ledger (`RivalAccount`
tracks lump `capacity`/`signing`/`development` movements only, `hollywoodTypes.ts:47-61`); the
rival-side Book Net Worth proxy must be defined from those aggregate movements, not by
re-running §3's per-blueprint formula, and will necessarily be coarser than the player's own
figure."*

---

## 4. Finding 3 (MODERATE — legibility + disclosure leak at the 2-studio end state)

§6.2 recommends any cross-era or historical comparison be stated as "a ratio of the era's own
trailing baseline (e.g., '6× the era's median studio surplus'), never as a nominal dollar
rank." This is the right instinct for the *cross-era* problem it names, but it has an
unexamined failure mode at the **population sizes Direction G/H explicitly anticipate as a
normal end state** ("consolidation is acceptable/desirable emergent history," 2–3 studio
end games are named in this review's own brief).

With exactly two studios left (player + one rival), a "median" is the mean of two values.
Telling the player "your studio is 1.4× the era median" with a cohort of exactly
{you, the one rival} **mathematically discloses the sign and rough magnitude of the gap between
you and that specific rival** — even though §7's disclosure rule, two sections earlier in the
same document, promises rivals' dollar figures "stay hidden by the same rule that already hides
their cash." The ratio-to-cohort-baseline mechanic quietly reopens the disclosure hole the
document itself just closed, exactly at the game state (heavy consolidation) the Owner's
direction treats as a legitimate, expected outcome rather than an edge case to ignore.

The sibling analysis `ranking-vs-value.md` already names the identical fragility for its own
leaderboard models ("a Finance leaderboard of only 2–3 entries starts to read as a private
balance-sheet exposure," and recommends Model D specifically because it "degrades correctly as
the field consolidates") — net-worth.md's own ratio-baseline idea has the same defect and does
not cross-reference that reasoning, despite citing `ranking-vs-value.md`'s adjacent §7 material
elsewhere.

**Smallest fix:** gate any cross-era/cohort ratio display behind a minimum comparable-cohort
size (e.g., ≥4 non-player studios, mirroring the `sameCohort`/degrade-gracefully pattern already
established for Power Ranking movement in the accepted bridge). Below that floor, the callout
should read "insufficient comparable population" rather than compute a ratio at all — precisely
the treatment `ranking-vs-value.md` §"degrades gracefully" already models for a different but
structurally identical problem.

---

## 5. Finding 4 (MODERATE — legibility): the metric visibly punishes building, with no
transition messaging

Because Book Net Worth reads `ledgerCapex × refundFraction`, every dollar of capex spending
converts to only 50 cents (facility) or 35 cents (set) of book value **the instant it is
spent** — this is a deliberate, correctly-reasoned design choice (§3.2), but it means the
headline number a player is told to trust visibly *drops* every time they build anything. A
player who commissions a $2.4M soundstage watches their "wealth" figure fall by $1.2M on the
same turn, with cash converted 1:1 and asset value counted at 50%. Direction C's central
requirement is "the player must understand the number" — a number that punishes ordinary,
healthy capital investment on sight, with only a static tooltip and no purchase-time
explanation, risks reading as a bug rather than a design choice the first time it happens.

**Smallest fix:** one sentence in §8 recommending a purchase-time inline note ("Built for
$2.4M; recorded at $1.2M book value — half is recovered if demolished, the rest is what you
paid for capacity") alongside the existing static tooltip, so the drop is explained at the
moment it occurs rather than only in a hover-over a player may never open.

---

## 6. Finding 5 (MINOR — citation error, inherited)

§6 cites `era.costScale` as "(default 1.0, `calendar.ts:17` per finance-logic.md §5.2)." Checked
against `accepted-592e926`: `costScale` is declared as a field of the era/config type at
`src/core/types.ts:288`, and its default (`1.0`) is set at `src/core/worldgen.ts:662`
(`costScale: 1.0`). `calendar.ts:17` in the accepted tree falls inside the `CampaignDate` type
block (`campaignDate()`'s neighborhood) and contains no reference to `costScale` at all. This
citation is carried over unmodified from `finance-logic.md`'s own table (line 24 of that
report), which `_DIGEST.md` did not flag for correction, so it slipped through un-verified.
Correct citation: `types.ts:288` (declaration), `worldgen.ts:662` (default value).

---

## 7. Finding 6 (MINOR — UI completeness)

§3.5 introduces the Wind-Down Position specifically to prevent a player from reading a healthy
Book Net Worth while ignoring large Guaranteed Obligations (Worked Example (ii) is built to
demonstrate exactly this). But §8's "where it lives" recommendation never states that Book Net
Worth and Wind-Down Position must render in the same view. A UI that puts Wind-Down Position
behind a second tab or a click-through would silently reopen the exact misreading §3.5 was
designed to prevent.

**Smallest fix:** one sentence in §8: "Book Net Worth and Wind-Down Position must render
adjacently in the same panel by default, never one behind a separate tab or expander."

---

## 8. Exploits, edge cases, and degenerate strategies checked and found CLEAR

To be concrete about what I tried and did **not** find a problem with, so this isn't read as an
exhaustive list of only negatives:

- **Refund farming / build-then-demolish cycling:** closed by the existing invariant that both
  refund fractions are `< 1` (`FACILITY_DEMOLITION_REFUND_FRACTION=0.5`,
  `SET_DEMOLITION_REFUND_FRACTION=0.35`, `tuning.ts:1613,816`) and the tuning comment
  confirming the same fraction applies mid-construction — Book Net Worth, being defined as
  exactly this refund value, cannot be inflated by any commission/cancel sequence; every cycle
  is a strict loss in both cash and book terms. Verified clear.
- **Cancel-and-reannounce, ID reuse:** `PlacedFacility.id` and `StudioSet.id` are both
  documented monotonic/never-recycled (`types.ts:1044,1341`), and `StudioId` is Owner-mandated
  never-recycled (Direction D). No ID-reuse path into this formula. Verified clear.
- **Double-counting interest in Enterprise Value:** §4.2's "trailing operating surplus"
  definition (revenue minus payroll/overhead/facility Opex/production/marketing/publicity)
  correctly excludes interest, matching a standard EBITDA-style base, and interest is only
  subtracted once, later, in the equity bridge (§4.3). No double count. Verified clear.
- **Migration-from-pre-P15-saves:** since Book Net Worth is a new read model over existing
  ledger rows rather than new persisted state, and every currently-placed facility/set already
  carries a capex ledger row by invariant, a save migrated into a build that adds this reader
  would compute correctly from day one for the player. (Finding 2 above is the one real gap on
  the *rival* side, not the player/migration side.)
- **Save/load mid-construction:** a facility in `underConstruction` status already has its
  capex ledger row charged at `placedWeek`, and the game's own law says a half-built structure
  refunds at the same flat fraction as a finished one — so including under-construction
  placements in the Book Net Worth sum (as the formula does by reading all of
  `state.placement.facilities`) is consistent with existing law, not a hidden inconsistency.
  Verified clear (a one-line note making this explicit in §3.1 would be nice-to-have, not a
  defect).

---

## 9. Consistency with sibling phase-2 analyses

- **`ranking-vs-value.md`:** both documents independently converge on the same disclosure rule
  (exact figures for the player's own studio; banded/labeled signal only for rivals, never raw
  dollars) — a genuine, welcome consistency signal, not a coincidence given both cite the same
  `bridge/industry.ts` "no combined Power score" notice and the same visibility-table precedent.
  The one place they diverge without acknowledging it is the cohort-size fragility (Finding 3).
- **`ma-auction.md`:** raises an adjacent but distinct concern — that a *prestige/Standing*
  premium acquisition (its Shape 5) would look "absurdly cheap" if priced from refund-value
  alone, i.e., undervaluing a healthy studio. Finding 1 here is the mirror-image failure
  (overvaluing — or rather, underpricing relative to liquidation — a *declining* studio) and is
  not addressed by either document. The two documents should be read together by whoever
  eventually specs Direction I's price formula; neither alone catches both failure directions.

---

## 10. Source-fidelity spot checks (all passed)

Verified directly against `accepted-592e926/`:

| Citation in net-worth.md | Checked against | Result |
|---|---|---|
| `INITIAL_CASH 20,000,000` | `tuning.ts:70` | Exact match |
| Facility refund 0.5 / set refund 0.35 | `tuning.ts:1613`, `tuning.ts:816` | Exact match |
| Termination cost = 50% of remaining guarantee | `tuning.ts:391` `HIRING_TERMINATION_FRACTION:0.5`; `employment.ts:178-180` | Exact match |
| `guaranteedComp = weeklySalary × remainingWeeks` | `employment.ts:172-175`; `TICKS_PER_YEAR=52` at `tuning.ts:56` | Exact match |
| `ConstructionProject.capex: 780,000` (V11 legacy exception) | `types.ts:813-823` | Exact match |
| REQ-016 "not subtracted from Cash" | `bridge/finance.ts:81` | Exact match (doc cites 80-81, object literal starts at 80) |
| "there is no combined Power score" | `bridge/industry.ts:110` | Exact match — and correctly uses the `_DIGEST.md`-corrected line number (110, not the 117 the earlier reports had wrong) |
| P11 handoff "never reconstruct a purchase..." treated as narrow/extended, not binding law | `_DIGEST.md` line 22 (binding correction) | Correctly incorporated verbatim in spirit — the document explicitly says "by explicit extension, not as pre-existing law" |
| `era.costScale` at `calendar.ts:17` | `types.ts:288`, `worldgen.ts:662` | **Miscited** — see Finding 5 |

---

## Summary for the record

- **Arithmetic:** 4/4 worked examples recomputed independently; zero errors.
- **Code citations:** 8/9 spot-checked citations exact; 1 miscited (inherited, minor).
- **Structural problems found:** 2 major (arbitrage floor missing; rival-side formula has no
  data to run on), 2 moderate (cohort-size disclosure leak at consolidation; build-punishes-you
  legibility gap), 2 minor (a citation; a UI-adjacency recommendation).
- **Exploits/edge cases checked and cleared:** refund farming, ID reuse, interest double-count,
  migration-from-pre-P15-saves, save/load mid-construction.
- None of the findings invalidate the core recommendation (expose both Book Net Worth and a
  labeled Estimated Studio Value range, never merged, both display-only in V1) — all six are
  additive corrections/guardrails, each with a stated smallest fix.
