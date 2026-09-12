# Adversarial verification — player-failure.md ("Break It")

**Lens:** adversarial game designer + economist. **Target:** `scratchpad/out/phase2/player-failure.md`
(P15 §6, Direction E). **Verdict: VERIFIED WITH CAVEATS.** The recommended ladder shape (six named
stages, C→B terminal structure, reuse of `classifyRecovery`/`reasons[]`, P15C postmortem reuse) survives
attack and its code citations mostly check out on direct inspection of `accepted-592e926`. But three of
the findings below are load-bearing design defects (a live cross-report contradiction the file doesn't
know about yet, a self-contradicting exploit the file names and rejects for one stage then builds into
two others, and an arithmetic mismatch between the file's own trigger definition and its own worked
example) that should be fixed before this ships as accepted design, plus several missing edge-case
answers the task explicitly asked for.

---

## 1. A contradiction the file doesn't know it has (now resolved by a sibling report — CONFIRMED problem)

`player-failure.md` §2's table gives Severe Distress two independent triggers: "4 missed weekly
obligations… within a rolling 13-week window, **OR** book net worth negative for 26 consecutive weeks."
`loans.md` §3.7 (written the same day, same batch) states as its explicit load-bearing rule: *"an uncured
Event of Default… is the only event that may hand the P15B condition machine a 'Warning' trigger sourced
from finance… Nothing else in finance may originate a Warning"* — verified verbatim in
`scratchpad/out/phase2/loans.md:114`. `rival-failure.md` (written after both, `scratchpad/out/phase2/rival-failure.md`
§0.2) caught exactly this collision, ruled in favor of `loans.md`'s stricter rule, and gives the
concrete reason: Book Net Worth is deliberately conservative (book-after-salvage), so a heavily leveraged
but fully-current, profitable studio (its own Scenario 3/4) would be wrongly escalated to Severe Distress
purely by an accounting haircut — punishing exactly the borrowing behavior Direction F wants to encourage.

**Why this matters for verification, not just trivia:** `player-failure.md` was correct to derive its
hierarchy independently (rival-failure.md didn't exist yet, and it says so honestly). But the corpus now
contains a standing, adjudicated contradiction that traces back to this file's §2 table and its §9
corrections list, and nothing in `player-failure.md` itself has been updated to reflect the ruling against
it. Anyone reading `player-failure.md` alone (not the full sibling set) will design to the wrong rule.

**Smallest fix:** strike the "OR book net worth negative for 26 consecutive weeks" disjunct from §2's
Severe Distress row and from §9's corrections-to-prior-P15 table; add one line pointing to
`rival-failure.md` §0.2 as the adjudicating source. Book Net Worth stays as Distress-panel disclosure
(Direction C), not a stage trigger.

---

## 2. Self-contradicting exploit: the file names this failure mode, then builds it in one stage earlier

§2 explicitly **rejects** "MGT2's pre-2021-fix resetting counter (exploitable — 'be positive for one
week, counter resets' lets a player launder distress away with one lucky opening weekend)," and §2/§3
correctly harden the missed-instalment rule against it: "4 missed instalments **within a rolling 13-week
window**," cure requires catching up *every* currently-missed instalment, not just resetting on one good
week.

But the two stages that feed into that hardened rule use exactly the pattern being rejected:

> Warning: `RecoveryPosition = 'constrained'` for **≥ 4 consecutive weeks**…
> Distress: `RecoveryPosition = 'severe'` sustained **≥ 13 consecutive weeks**…

A studio that is substantively unhealthy 90% of the time but never strings together 4 (or 13) *consecutive*
bad weeks never reaches Warning (or Distress) at all under this rule, no matter how long its total time
in a bad state is. Concretely: `classifyRecovery`'s `standardOk` boolean (`studioRunRecap.ts:988-991`)
flips true the instant a standard-budget film is momentarily affordable — a single well-timed opening-week
Studio Revenue spike, or cashing in a facility-demolition refund one week before the 4th/13th consecutive
week, breaks the streak and resets the counter to zero. This is the identical "one lucky week erases the
streak" shape the file itself names as the reason to reject a naive counter for the EOD stage — just
one stage earlier, where the file does not apply its own fix.

**Smallest fix:** replace "≥4 consecutive weeks" / "≥13 consecutive weeks" with the same rolling-window
shape already used correctly for the missed-instalment rule, e.g. "`constrained` in at least 4 of the
last 6 weeks" / "`severe` in at least 13 of the last 16 weeks." This is a one-word-per-row tuning change,
not a new mechanic, and makes all three escalation rules in the ladder consistent with the file's own
stated design principle.

---

## 3. Recomputed arithmetic — 4 rows checked, 1 confirmed error of omission

| # | Row checked | My recomputation | Result |
|---|---|---|---|
| 1 | §5 timeline, week ~180: "cash < 8×(75,000+13,976) ≈ $712,000" | 8 × (15,000 + 1,500×40 + 13,976) = 8 × 88,976 = **$711,808** | Matches (rounds to $712,000). Correct. |
| 2 | §5's reused mortgage figure: "$5M facility mortgage… `$13,976/week`" (8%/10yr) | Annuity formula, weekly rate i=0.08/52=0.0015385, n=520: payment = 5,000,000×i /(1−(1+i)^−520) ≈ **$13,976.9/week** | Matches `finance-logic.md` §3.10's own figure. Correct reuse. |
| 3 | §5's "OVERHEAD_BASE 15,000 + 1,500×40 = 75,000" | 15,000 + 1,500×40 = 15,000+60,000 = **75,000** | Correct arithmetic — **but see the labeling error below.** |
| 4 | §5's cash path: $650,000 (week ~230, Distress) → −$180,000 (week ~243, EOD), 13 weeks later | At the stated $88,976/week fixed burn with zero revenue: 650,000 − 13×88,976 = 650,000 − 1,156,688 = **−$506,688**, not −$180,000 (a $326,688 gap) | **Not reconcilable from the numbers given.** The gap requires an un-stated revenue assumption (plausible — "two underperforming releases" implies *some* revenue), but the closing note claims "all numeric scenarios in §5 are… arithmetic shown," and this is the one row where it is not: only the two endpoint numbers are asserted, not derived. |

**The more consequential problem, found while checking row 1 and row 3:** row 3's $75,000 figure is
labeled "payroll/overhead-band" in the timeline's header sentence, but it is **only the overhead formula**
(`OVERHEAD_BASE + OVERHEAD_PER_EMPLOYEE × contracts`, `tick.ts:927-928`) — it contains **no payroll term
at all**. Payroll is a separate, larger unconditional weekly debit (`weeklyPayroll`, `tick.ts:919-923`) that
this worked example never computes or adds in. Nor does the $88,976 figure include facility Opex, despite
the studio in this example plainly operating at least one facility (it is servicing a $5M *facility*
mortgage). This directly contradicts §2's own trigger definition two pages earlier in the same file, which
correctly lists all three components: *"cash < 8 weeks of fixed costs (**payroll**+overhead+**facility
Opex**)."* The worked example in §5 quietly drops two of the three terms its own §2 definition requires.
For a "40 employees" studio, payroll is very likely the *dominant* term (Prima's original per-role
salary bands alone start Stars at $6,000; a modern-era studio's real weekly wage bill for 40 people would
plausibly be several times the $75,000 overhead figure) — meaning the true 8-week liquidity threshold in
this example, computed per the report's own §2 rule, is understated by a large, unstated margin, and the
whole illustrative timeline (which stands or falls on when cash crosses that threshold) is not built on
the formula the report says it uses.

**Smallest fix:** either (a) add an explicit hypothetical payroll figure and facility-Opex figure to the
§5 worked example and recompute the $712,000/timeline numbers against the full payroll+overhead+opex+debt
stack per §2's own definition, or (b) relabel the $75,000 line as "overhead only, payroll/opex omitted
for illustration" and state plainly that the real threshold is higher — either is a one-paragraph fix, but
leaving it as-is is a real inconsistency between the file's own trigger law and its own demonstration of
that law.

---

## 4. Exploits and degenerate strategies

- **Consecutive-counter reset** — covered in §2 above; the most concrete, cheapest exploit found.
- **Save-scumming the bounded rescue window.** The whole design of the one-time, 13-week Insolvency
  rescue rests on it being "a real, felt, bounded risk" (§0, §5). Nothing in the file addresses that a
  single-player sim with ordinary manual save/load lets a player reload to any point inside (or just
  before) that window and retry with different remedy choices until one succeeds — which is not
  meaningfully different from GDT's rejected "forced" bailout in terms of actual risk to the player, just
  achieved by save-scumming instead of a mechanic. The file explicitly cares about this category of
  problem (it rejects automatic bailouts for removing "agency at the exact moment agency matters most")
  but never asks what a *manual* save right before the window achieves for a player who wants the
  "meaningful… recovery first" framing to actually mean something. **Smallest fix:** one sentence in §5
  either (a) accepting this as an out-of-scope, ordinary single-player-sim caveat like every other
  tycoon-game bailout (explicit, not silent), or (b) noting that if it matters, the rescue window's
  random draws should commit at window-open (a seeded, recorded outcome) so a reload cannot re-roll them.
- **No player-initiated ("voluntary declare") bankruptcy considered.** The task's own comparator list
  names "Capitalism Lab Declare Bankruptcy choice" — confirmed in `comp-bankruptcy-loans.md`:96,208 as
  "an explicit 'declare' choice at the terminal edge (**player agency**)." The file repeatedly invokes
  player agency as its central value (rejecting forced automatic rescue for removing it) but never
  considers the mirror case: a player who wants to exit a slow-motion Warning/Distress state on their own
  terms rather than being dragged through the full ladder has no faster legal path than to simply keep
  losing until the automatic triggers fire. This is a real, evidence-backed missing option, not a
  hypothetical one. **Smallest fix:** add "voluntary bankruptcy declaration (skip the remaining ladder,
  proceed directly to settlement)" to the §4 options table alongside the existing player-agency options,
  evaluate it (it looks cheap and high-dignity — a player choosing their own ending is not exploitable
  the way an automatic mechanic is), and list its interaction with a "cancel" state if declared then
  reconsidered before settlement actually fires.
- **Two Point Hospital comparator never used.** The task instructions explicitly list "Two Point Hospital
  −150k warn/−300k fail" as one of six named comparators to use. It is entirely absent from the file
  (confirmed by search) despite being directly on-topic for §3 ("how much warning," a fixed two-tier
  numeric threshold is the simplest alternative in the whole comparator set) and present in the phase-1
  evidence the file was told to read (`comp-bankruptcy-loans.md:134-136,165,214`). A fixed-dollar
  threshold is a reasonable thing to reject given `era.costScale` currency drift across 1920–2040, but the
  file should say so rather than silently omitting the comparator. **Smallest fix:** one sentence in §3
  noting TPH's fixed-dollar two-tier warning was considered and rejected in favor of a scale-relative
  (weeks-of-fixed-cost) threshold specifically because a bare dollar constant cannot survive 120 years of
  `era.costScale` — this is a one-line addition that closes a real gap without changing the recommendation.

---

## 5. Edge cases named in the verification brief

- **Migration from pre-P15 saves — not addressed anywhere in the file.** A save created under the old
  no-bankruptcy law may already have a studio that has been cash-negative, or "severe"-classified, for
  years (the file's own §1 quotes the D-16 lab measuring exactly this: sustained negative cash with
  99.69% weekly self-transition). On first load under the new law, such a save could satisfy multiple
  stage thresholds simultaneously on tick one — jumping straight past Warning/Distress into what looks
  like an already-4-times-defaulted Severe Distress state, with no chance for the "meaningful warning…
  first" Direction E requires. §6 discusses Save-As/campaign-library interaction but not this cold-start
  problem. **Smallest fix:** one additive rule — on first tick under the new law, seed each studio's
  missed-obligation counter and consecutive-week clocks at zero from the upgrade week forward (a
  grandfather week), never retroactively evaluating pre-law history. This matches the file's own
  additive-root method (§6) and needs one sentence, not new machinery.
- **ID reuse / "what does continue mean" is flagged as open but its own code constraint is not examined.**
  §8 decision #7 correctly flags "what continue means… a fresh Founding Flip in the same world" as
  unresolved. But `hollywoodValidation.ts:72` (`requireFact(studios.size === 10 && h.identities.length
  === 10, 'exactly player plus nine reserved studios')`) hard-validates an exact, closed 10-identity
  roster (confirmed by direct inspection). Any answer to decision #7 other than "no continuation in this
  save" needs either an 11th `StudioIdentity` (breaking the exact-10 invariant) or reuse of the closed
  studio's own `StudioId` (breaking the file's own cited "no identity death" law, §5). The file's own
  open decision is therefore not merely a design preference still to be picked — one whole branch of it
  (reusing the same world) is in tension with an existing hard validator the file elsewhere cites
  correctly (`rival-failure.md` uses the same validator; `player-failure.md` never connects the two).
  **Smallest fix:** add one clause to decision #7 naming this constraint, so whoever answers it knows a
  "continue in the same world" answer requires a companion code change to the identity-count invariant,
  not just a design ruling.
- **Player/rival symmetry swap** — adequately handled: §2's cross-check note (generalize
  `classifyRecovery` rather than fork it) is sound and was subsequently validated by `rival-failure.md`
  reusing exactly this recommendation. No issue found here.
- **2-studio end state / post-2040 continuation** — correctly left to `consolidation.md` and
  `finale-endless.md` respectively; not a gap in this file's own scope, though one cross-reference
  sentence in §6 (does the terminal ladder even run in Endless Sandbox?) would have cost nothing and
  would have pre-empted a question `boundaries-corrections.md`'s remaining-decisions list has to ask
  again from scratch.

---

## 6. Code-citation spot check (sampled against `accepted-592e926`)

Directly inspected: `employment.ts:70-84` (`canAfford`), `tick.ts:915-950` (payroll/overhead/facilityOpex
unconditional debits), `studioRunRecap.ts:79-92,965-1006` (`RecoveryPosition`, `classifyRecovery`, the
"No recovery mechanic…" string at :1003), `hollywood.ts:25-45`, `hollywoodTick.ts` (`operatingReserve`),
`ui/src/engine/adapter.ts` (`cashNegative`), `actions.ts:2693-2723` (`applyReleaseTalent`),
`employment.ts:178` / `tuning.ts:391` (`terminationCost`, `HIRING_TERMINATION_FRACTION: 0.5`),
`placement.ts:1026` / `tuning.ts:1613` (`facilityDemolitionRefund`, `FACILITY_DEMOLITION_REFUND_FRACTION
= 0.5`, "Deliberately FLAT in V1" quoted verbatim and confirmed), `tuning.ts:816`
(`SET_DEMOLITION_REFUND_FRACTION = 0.35`), `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md:58-65` (the §3 quote,
confirmed verbatim), `docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md:140-141` (REQ-041/042
rows, confirmed OWNER-BLOCKED as quoted), `hollywoodValidation.ts:72` (exact-10-identity invariant).

**Result: every citation checked is substantively accurate.** Two line-number references are off by ~1
(`placement.ts:1025-1027` vs. the function's actual start at :1026; `tuning.ts:1599-1613` vs. the
constant's actual declaration at :1613 inside a comment block starting ~:1602) — cosmetic, not worth a
correction pass on their own. No fabricated citation, no misattributed quote, no citation exceeding the
40-word short-quote rule was found in this sample.

---

## 7. Strong points (survive the attack)

- The core recommendation (six-stage ladder; C→B terminal structure — bounded rescue, then postmortem;
  reuse of the existing `RecoveryPosition`/`reasons[]` selector rather than inventing a parallel one; P15C
  reducer reuse for an early-exit dossier) is sound, additive, and well-grounded in both code and
  comparators. It does not need to be reopened.
- The governance-prerequisite framing (§0: a documentation-only amendment must precede any charter) is
  exactly right and is the correct, smallest handling of a real blocker — confirmed by direct inspection
  of both `OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §3 and the two REQ rows.
- Rejection of GDT's forced bailout, Hollywood Animal's single hard clock, and the Capitalism-Lab
  "continue as employee" pattern (correctly identified as an unshipped DLC preview, matching the digest)
  are all well-reasoned and now independently corroborated by `rival-failure.md` adopting the same
  positions.
- The evaluation table in §4 (existing recovery actions: release talent, let-expire, demolish/strike,
  cheap film, advance time) is accurate against code and appropriately blunt about the cheap-film
  "recovery" being arithmetically refuted rather than re-marketed.
- Honest, well-labeled uncertainty throughout (§8's eight remaining decisions are all genuine, not padding)
  — though see §5 above for one it should have included.

---

## 8. Summary of fixes, smallest-first

1. Delete the net-worth-26-week Severe Distress disjunct (§2, §9); cite `rival-failure.md` §0.2.
2. Change "≥4/≥13 **consecutive** weeks" to a rolling-window majority test in §2.
3. Either compute §5's worked example with full payroll+overhead+opex+debt per §2's own definition, or
   relabel the $75,000 figure as overhead-only and disclose that the real threshold is higher.
4. Add one sentence on save-scumming risk in the rescue window (§5).
5. Add "voluntary bankruptcy declaration" to the §4 options table.
6. Add one sentence on Two Point Hospital's fixed-dollar warning and why it's rejected (§3).
7. Add a one-line grandfather/cold-start rule for pre-P15 saves (§6).
8. Add the exact-10-identity constraint to remaining decision #7 (§8).

None of these require reopening the settled Owner Direction or the file's central recommendation; all are
same-shape edits to tables, thresholds, and disclosure sentences already present in the document.
