# Adversarial Verification — `rival-failure.md` — Lens: BREAK IT (game design + economics)

**Verifier pass, READ-ONLY.** Target: `<scratchpad>/out/phase2/rival-failure.md`.
Method: recompute the paper-scenario arithmetic independently; hunt for exploits, snowball paths,
degenerate strategies (player and deterministic rival), legibility failures, and edge cases (migration,
symmetry, population collapse, post-2040, save/load, ID reuse). Cross-checked against `loans.md`,
`player-failure.md`, `consolidation.md`, the verification digest, and direct reads of
`accepted-592e926/src/core/{calendar,hollywoodStartingData,hollywoodValidation}.ts`.

**Verdict: REFUTED_IN_PART.** The trigger hierarchy, settlement sequence, and package-ownership analysis
are broadly sound and most cited arithmetic is correct to the cent. But the report's flagship Scenario 1
demonstration contradicts the report's own stated Warning trigger (and its own Scenario 8 practice); the
report's central coordination claim — "exactly one substantive disagreement" among the three sibling
reports — is false, a second, unreconciled disagreement survives; and the design as written has a real
structural hole: a studio that never borrows appears to have **no path at all** into Severe Distress,
Insolvency, or Bankruptcy, which would silently recreate the exact "mechanically absorbing" trap Directions
D/E were written to eliminate. None of this invalidates the overall shape (six-stage ladder, missed-loan
default rule, settlement mechanics); it does mean the trigger hierarchy is not yet internally consistent
and needs a corrective pass before an Owner sign-off should be sought on the numbers in §2/§4.

---

## 1. Arithmetic recomputation (independent, not copy-checked)

I recomputed every loan-amortization figure the report either states directly or leans on from `loans.md`,
using the standard weekly level-payment formula `pay = P·r/(1−(1+r)^−n)`, `r = annual/52`. All of the
following check out to the dollar or the reported rounding:

| Scenario | Figure claimed | Recomputed | Match |
|---|---|---|---|
| §4.2 Scenario 2 | $6M/8%/10yr weekly payment $16,771; annual debt service $872,101; coverage 2.75× | $16,771.18; $872,101.38; 2.7520× | ✅ |
| §4.3 Scenario 3 | $8M/8%/10yr weekly $22,362; annual debt service $1,162,802; coverage 1.38×; leverage 5.0× | $22,361.57; $1,162,801.84; 1.3760×; 5.00× | ✅ |
| §4.5 Scenario 5 | $1.5M/3yr/14% weekly $11,788 | $11,788.30 | ✅ |
| §7 hazard table | `9×(1−p)^120` and `9×(1−p)^71` for p=0.1%…5% (all 12 cells) | recomputed every cell independently (python) | ✅ all 12 match exactly |

I also recomputed the loan tables `loans.md` publishes and `rival-failure.md` explicitly reuses/leans on
(Scenario A $5M/8%/10yr amortization schedule, Scenario C's $2M bullet-vs-amortizing comparison, Scenario D's
$20M coverage collapse): all check out to the dollar as well. **Conclusion: the loan mathematics itself is
sound and correctly cross-checked.** The problems below are in the *logic layered on top of* that correct
arithmetic, not in the arithmetic.

---

## 2. CONFIRMED — Scenario 1 contradicts the report's own Warning trigger (and its own Scenario 8)

**Location:** `rival-failure.md` §4.1 (lines 153–164) vs. §2's trigger table (line 104) and §4.8 (line 289).

§2's Warning row: *"`constrained`-equivalent for ≥4 consecutive weeks, **OR cash < 8 weeks of fixed costs**
(payroll+overhead+opex+debt service), OR a covenant... breach."* For Marigold, 8 weeks of the stated
$57,000/wk fixed burn = **$456,000**.

Scenario 1 starts at week 400 with cash $600,000 and burns $57,000/wk with no release until week 412.
Walking the table's own numbers week by week: cash crosses below $456,000 at **week 403** ($429,000) and
stays below it continuously through week 411 (the table's own low point, −$187,000) — **nine consecutive
weeks**, comfortably past even the stricter "≥4 consecutive weeks" reading used for the *other* disjunct in
the same row. Yet the table marks every one of these weeks "Healthy" and concludes: *"Result: never crosses
Warning... a brief negative-cash dip... is exactly what the 4-consecutive-week and 8-week thresholds are
sized to absorb."*

This is not an interpretation quibble: `rival-failure.md`'s **own §4.8** (line 289) fires Warning on
precisely this condition — *"cash < 8wk fixed costs, 4 straight constrained weeks → Warning"* — for the
terminal-decline scenario. The same report uses the same rule to produce two contradictory outcomes for the
same fact pattern. Under the trigger as literally stated, Scenario 1 **should** show Warning entered around
week 406–407 and cured at week 412 — which would still be a fine demonstration of Direction D's "one bad
movie must not bankrupt a studio" (Warning → cured, never Distress), but it is not the demonstration the
report claims to have run ("never crosses Warning").

**Smallest fix:** either (a) correct the Scenario 1 table to show Warning entered ~week 406 and cured at
week 412 (the true output of the report's own rule — still a good demonstration, just not the one written
up), or (b) if the intent was that the 8-week-fixed-costs test should also require a multi-week sustain
before firing, say so explicitly in §2's table (it currently reads as a point-in-time test, unlike the
"≥4 consecutive weeks" clause right next to it) and re-verify Scenario 1 against the corrected wording.
Either way, the current text of §2 and §4.1 cannot both be right.

---

## 3. CONFIRMED — the "exactly one disagreement" coordination claim is false

**Location:** `rival-failure.md` header (lines 9–11) and §0.2 (lines 44–69) claim: *"Exactly one substantive
disagreement was found between two of them; it is named and reconciled in §0.2, not silently picked."* The
one named is the net-worth disjunct (`player-failure.md` line 106 vs. `loans.md` §3.7) — I confirmed this
quote is accurate: `player-failure.md:106` does read *"4 missed weekly obligations (payroll, overhead, or a
loan instalment) within a rolling 13-week window, OR book net worth negative for 26 consecutive weeks."*

But that same quoted line contains a **second, unreconciled disagreement** the report never names: it lists
**"payroll, overhead, or a loan instalment"** as the three things that can be "missed" for the 4-in-13-week
count. `rival-failure.md` itself takes the opposite position, twice, in its own body: §1 states fixed costs
are *"debited unconditionally every tick regardless of cash sign"* and §4.5's Result line states plainly,
*"only the loan instalment is ever recorded as 'missed,' because that is the one obligation this design
gives a lender-facing legal consequence."* `loans.md` §3.7 agrees with `rival-failure.md` ("a loan payment
not covered by cash in its due week is missed"; payroll/overhead are handled only via the separate §3.2
sustained-negative-cash rule). So the actual split is **2-to-1** (`loans.md` + `rival-failure.md` vs.
`player-failure.md`), not the "exactly one, already named" the header promises — and this second split is
more consequential for symmetry than the one that got fixed, because it changes *what counts as an
obligation a studio can legally default on* for the player specifically (see §4 below, which shows why this
matters for more than bookkeeping tidiness).

**Smallest fix:** add one more line to §0.2 naming this second disagreement and ruling it the same direction
already chosen (loan-instalments-only, matching `loans.md` and this report's own body), so `player-failure.md`
line 106 is corrected to drop "(payroll, overhead, or..." and read "a loan instalment" only — a one-clause
edit, consistent with the reconciliation method already used for the net-worth clause.

---

## 4. CONFIRMED (structural) — a studio that never borrows has no stated path to Bankruptcy

This is the most serious finding and follows directly from §2's own trigger table, read literally:

- **Severe Distress / Event of Default** triggers *only* on "4 missed weekly **instalments**... (loan...)."
- **Insolvency** triggers *only* "automatic on an uncured Event of Default."
- **Bankruptcy** triggers *only* when the Insolvency "rescue window expires without curing."

Every rung above Distress is gated behind a missed **loan** instalment. §4.5's own Result line confirms only
loan instalments are ever "recorded as missed" — payroll/overhead/opex are, by design, always paid via the
implicit overdraft (§1), and the §3.2 distress-interest surcharge (once it starts, at 8 sustained negative
weeks) is *also* charged "unconditionally... the same way overhead is charged" per `loans.md` §3.2, which
this report adopts "without change" (§0.1) — i.e., distress-interest is explicitly **never** a "missed"
event either. §2's own parenthetical — *"(loan or, once one exists, distress-interest on sustained negative
cash)"* — appears to gesture at distress-interest as a second kind of missable instalment, but that directly
contradicts the unconditional-debit framing this same report imports from `loans.md` §3.2 one section
earlier; the phrase does not resolve to an actual second trigger path under the rules as written.

**Consequence:** a studio (player or rival) that simply never takes out a Studio Loan or Rescue loan can
sustain Warning and Distress indefinitely — the report's own §3 says exactly this is allowed ("unlimited in
principle before Severe Distress") — but has **no stated mechanism to ever escalate past Distress**, because
nothing it owes can ever be "missed." This silently reconstructs the precise failure mode Direction D/E were
written to fix: the D-16 lab's "mechanically absorbing... 99.69%" negative-cash black hole (cited by this
report's own §4.8) is fixed *only* for borrowers; a conservative or unlucky non-borrower is stuck in
permanent Distress purgatory with no legal route to either recovery-with-dignity or a clean terminal state.
It is also a discoverable **degenerate strategy** for the player: never sign a loan, and bankruptcy is
structurally unreachable no matter how catastrophic the studio's cash position becomes — exactly the kind
of "cancel-and-reannounce"-class loophole (avoid the triggering instrument entirely) the brief asks this
pass to hunt for, just at the instrument-adoption level rather than the timing level. For a **deterministic
rival**, the same hole means a rival that never qualifies for (or the policy never chooses to draw) a loan
before entering Distress can never be resolved by this ladder at all — no Bankruptcy, no settlement, no
freed-up talent, indefinitely.

**Smallest fix:** add one explicit, debt-free path from sustained Distress into Severe Distress — e.g.,
"Distress sustained for a second, longer window (a PROVISIONAL 26 or 52 weeks, deliberately longer than the
13-week Distress-entry sustain so a debt-free failure takes visibly longer than a leveraged one) with no
qualifying loan drawn and no improving trend escalates to Severe Distress on its own." This is *not* a
resurrection of the net-worth disjunct §0.2 correctly rejected (that was about a balance-sheet ratio that
can be negative while healthy); it is a pure cash-flow/duration test, exactly the kind of trigger Direction D
itself asks for ("sustained inability to meet real obligations"), just scoped to the case where no loan
exists to supply the missed-instalment fact the rest of the ladder relies on.

---

## 5. Scenario 7 invents a rule not found in the sibling document it claims to reuse

**Location:** §4.7 (lines 265–280).

The scenario's climax — the third refinance is "refused" because credit grade has degraded from Good to
Watch to "Impaired" purely from the *count* of refinances ("repeated rolls exhaust the Watch band") — has
no basis in `loans.md`'s actual credit-grade formula (§3.5): grade there is a function of *"weeks since last
missed payment (history), trailing surplus and existing debt service (capacity), and book collateral
(collateral)"* — refinance count is not an input anywhere in that formula. Nothing in the scenario
establishes that this studio ever missed a payment or fell below the coverage/leverage bands that would
legitimately move its grade. The scenario also conflates two different axes from `loans.md`: the **corporate
ladder stage** ("Stable," gating refinancing eligibility per §3.8) and the **credit grade** (Good/Watch/
Impaired, gating the interest *spread* per §3.5) — treating a stage-gate ("refinancing allowed only from
Stable") as if it were the same thing as a grade-gate ("Impaired... cannot draw a Studio Loan at all"). The
report presents this scenario as demonstrating an already-designed brake, but the brake it demonstrates
(refinance-count degrades grade) is this report's own invention, introduced without being flagged as new —
which matters because §0.1 explicitly promises "nothing here re-derives what is already settled," implying
everything not flagged as new *is* already settled.

**Smallest fix:** either (a) explicitly add "each refinance of the same obligation without an intervening
missed payment nonetheless counts against the Watch band, exhausting after two successive rolls" as a
*named, new* rule in this document (distinct from `loans.md` §3.5's formula) and flag it as an addition the
way §5's `triggerSummary` field is flagged, or (b) rewrite the scenario so the third refusal follows
directly from `loans.md`'s actual formula — e.g., the studio's trailing surplus has independently eroded
over the six years to below the coverage floor, which under the existing grade table alone is enough to
push it to Impaired without needing a refinance-count rule at all.

---

## 6. The §4.6 bridging privilege's "once per rolling window" is not well-defined

**Location:** §4.6 (lines 245–258): *"This bridging privilege may be used at most once per rolling 13-week
window per studio."*

A **rolling** window has no natural "once per window" semantics — every week defines a new 13-week window
that overlaps the last twelve almost entirely. Does a use at week 600 block another use at week 601 (whose
window [589,601] still contains week 600's use), or only within some fixed, non-overlapping 13-week block?
This is exactly the class of ambiguity the report is otherwise careful to close — §3.7's cure rule
("catching up *every* currently-missed instalment") is phrased precisely to defeat Mad Games Tycoon 2's
reset-on-one-good-week exploit, but this report's own new mechanic (§4.6, not inherited from a sibling)
gets no equivalent precision. Left ambiguous, the natural implementer's choice ("resets every 13 weeks on a
fixed calendar boundary") would let a studio time a deferral just after a boundary and use it again almost
immediately, i.e., effectively more than once per true rolling quarter — a real echo of the reset exploit
this document elsewhere takes pains to close.

**Smallest fix:** state it as a cooldown, not a per-window count: "at least 13 weeks must elapse between two
uses of this privilege by the same studio," which is unambiguous for a rolling window and matches the
precision of the rest of §3.7's language.

---

## 7. The `studioClosed.triggerSummary` enum (§6) doesn't match the report's own state machine

**Location:** §6 (lines 323–328) proposes `triggerSummary: 'missed-instalment' | 'covenant-breach' |
'uncured-distress'` so a public notice can "name *why* a specific studio failed."

Per §2's own trigger table and §4.3's own worked example (Scenario 3: a heavily leveraged-but-current studio
sits at Warning "indefinitely... never Distress, and never Severe Distress, because the missed-instalment
counter never advances"), a covenant breach **by itself can never be the terminal cause of a Bankruptcy** —
every path to Bankruptcy runs through Insolvency, which runs through an uncured Event of Default, which is
defined exclusively as a missed-instalment fact (§2, §3.7). That makes `'covenant-breach'` an enum value
that is **unreachable** as a closure cause under the rules this same document just finished establishing.
Conversely, `'uncured-distress'` — "the rescue window expired without curing" — is definitionally true of
*every* Bankruptcy (that is what Bankruptcy's own trigger row says happens), so it would be the value on
100% of closures and communicates nothing distinguishing. As written, the enum can only ever actually take
one of its three values in practice, which defeats its stated purpose (letting the Legacy dossier "name why
a specific studio failed" per Direction J, distinctly per studio).

**Smallest fix:** replace the three values with something that actually varies by case — e.g., what
*originated* the ladder entry in the first place (`'missed-loan-instalment'`, `'failed-rescue-film'`,
`'covenant-breach-preceding-default'`) rather than categories describing the mechanical shape of the
terminal event, which is the same for every studio by construction.

---

## 8. Unaddressed: adding a P12 rival-policy branch is a versioned-schema change

**Confirmed by direct code read:** `accepted-592e926/src/core/hollywoodValidation.ts:209` —
`requireFact(b.policy.version === 1,'unknown policy version'); exact(b.policy.affinities,GENRE_ORDER)` — the
rival policy object is pinned to an exact version number and an exact key set, exactly like the
`StudioIdentity`-exact-key validation this report correctly treats as load-bearing elsewhere (§6: "a new
root `studioOperatingState`, not a widened `StudioIdentity`"). §5 proposes giving rival policy "one new
deterministic branch per remedy family" for loan/dormancy/release-talent selection, but never notes that
this is itself a versioned-schema change subject to the same discipline (bump `policy.version`, extend
`exact()`'s key list, write a migration) — the phase1-verify digest flagged this exact gap for a sibling
report (`code-hollywood:completeness-overclaim`, line 43: *"any P15B distress-posture/remedy field on rival
policy is also a versioned change, like the StudioIdentity status field"*) and it was not carried into this
report even though this is the report actually proposing the policy change.

**Smallest fix:** add one sentence to §5 or §8 (Package ownership): "the new remedy-selection branch bumps
`policy.version` to 2 and extends `hollywoodValidation.ts`'s exact-key check, following the same additive
pattern as the ledger-kind and StudioIdentity precedents cited elsewhere in this report."

---

## 9. Edge cases the brief asked for that the report does not address

- **Pre-P15 save migration:** no discussion of how the rolling-13-week missed-instalment counter, the
  ≥4/≥13-consecutive-week clocks, or the 8-week distress-interest sustain are initialized when an existing
  save (with years of prior, unrecorded history) is loaded under the new law for the first time. Given the
  digest's own finding that only V13–V18 got explicit V19-refusal treatment and earlier migrations were not
  updated (digest line 48), a P15 V20 step needs the same explicit treatment *plus* an answer for these new
  clocks specifically (cold-start at zero, or reconstructed from ledger history where possible?). Not
  mentioned anywhere in this report.
- **Post-2040 (Direction K) endless sandbox:** §7's population-survivorship math is explicitly bounded "by
  2040" only; the report never states whether the missed-instalment ladder keeps running on rivals in
  endless sandbox, and if so, whether a population that reaches 0–1 rivals post-2040 (a real possibility per
  §7's own hazard table at anything above ~1%/yr) is an acceptable sandbox end-state or needs a policy this
  report should name.
- **Save/load mid-settlement:** §6 states settlement "commits... in the same week" as Bankruptcy but never
  states that this transition is computed as a single atomic tick-boundary event (as the rest of the weekly
  tick already is). Worth one sentence ruling out a stateful, multi-step settlement process that a save/load
  could interrupt partway through.
- **2-studio end state / near-monopoly:** §7 names the population-collapse risk as a thing to avoid via
  calibration ("report, don't float," per Direction G) but does not say what, if anything, changes
  operationally about the failure ladder itself (versus the shared market, out of this report's scope) if
  the count nonetheless falls to 1–2 rivals — low severity given Direction G's explicit "report don't fix"
  instruction, but worth one sentence acknowledging it is deliberately out of scope rather than silent.
- Player/rival symmetry-swap and ID-reuse are, by contrast, handled adequately: `binding law 6` (StudioId
  never recycled) is invoked correctly at the one point it is needed (§6), and the pre-terminal symmetry
  claim is not contradicted anywhere I checked in the trigger table itself (the disagreement in §4 above is
  about *what counts as missed*, not about player/rival asymmetry).

---

## 10. Minor / low-severity notes

- **§7's two hazard-rate columns carry opposite biases, unstated.** The report correctly flags that the
  120-year column (treating all 9 rivals as exposed for the full span) understates survivors — i.e., is
  pessimistically biased — for the five late entrants. It does not note that the complementary 71-year
  column (treating all 9 as if they only had 71 years, including the four 1920 incumbents that actually had
  120) is optimistically biased in the *other* direction for those four. The two columns do bracket the
  truth, which is a fine way to present it, but the report should say so explicitly rather than only
  flagging the conservative direction of one of them.
- **§4.6's 13-week nominal lookahead reads more generous than the comparators cited to justify it**
  (Hollywood Animal's 4-week screening window, GDT's 1-week pre-release window) — in practice it is bounded
  to ≤6 weeks by the reused code fact `THEATRICAL_WEEKS: 6` (only an in-progress run can supply a
  "already-scheduled" receipt, and a run only lasts 6 weeks), but the report never states this bound
  explicitly, leaving a reader to wonder why 13 weeks was chosen over a tighter, comparator-matched number.

---

## 11. What holds up

- All recomputed loan arithmetic (§1 above) is correct.
- The six-stage ladder and stage names, reused from `player-failure.md`, are consistent with that document
  as actually written (confirmed by direct read of `player-failure.md`, not just the summary given here).
- The §7 population-hazard framework is arithmetically exact and is a genuinely useful, novel
  operationalization of Direction G's "report a severe failure, don't float a floor" instruction —
  `consolidation.md` independently uses the same `reserveWeeks`/`negativeScale` spread language this report
  cites, so the cross-reference is not fabricated.
- The settlement-sequence adoption from `talent-settlement-events.md` (§6) is a faithful, unmodified reuse,
  and the one addition (`triggerSummary`) is correctly flagged as new — the *content* of that addition is
  flawed (§7 above), but the practice of flagging additions is followed correctly there.
- The package-ownership table (§8) and the deferral of the acquisition/auction mechanism to Direction I/P16+
  (§6) are appropriately scoped and do not overreach into a sibling's territory.

---

*Short quotes throughout ≤40 words. No file outside phase1/phase1-verify/authority/accepted-592e926/phase2
was read. Nothing under "/Users/bruce/The Movies" or any git repo was touched; no code was run except a
standalone Python arithmetic check in this verifier's own scratch space.*
