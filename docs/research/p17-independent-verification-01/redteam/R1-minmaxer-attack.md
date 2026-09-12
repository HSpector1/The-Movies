> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`R3-reviewer-corrections-calc.py`](R3-reviewer-corrections-calc.py), committed output [`R3-output.txt`](R3-output.txt) — **the report governs.** Superseded here: an attack on the PRE-correction synthesis (it drives `models/M1-final-synthesis-calc.py` via `R1_verify.py`); its root-cause findings were adopted (C1, C2) and its verdicts are superseded by report §16, which also adds Probe 6 (revision 02).

# R1 — Dominant-Strategy Red Team: P17 Franchise Design (min-maxer / speedrunner lens)

**Role:** adversarial reviewer, READ-ONLY. No repo edits, no branches, no builds, no runtime. Goal:
maximize studio cash/standing per game-year using the models' own stated rules and starting
constants, exactly as written — not what they intended.

**Target of attack.** The task named `M1-RMF-SYNTHESIS.md` as the object to attack "if it exists by
the time you start." It does not exist as a document; `models/M1-final-synthesis-calc.py` is the
actual final-recommended RMF core (M1b's derived-kernel shape as base, reformulated to O(1), plus
the grafts both judges (M1j/M1k) specified from M1a and M1c — its own docstring says so explicitly).
**This file is therefore the primary attack surface for R/M/F**, cross-checked against M1a/M1b/M1c/
M1j/M1k where the final file is silent, plus M2 (expectations), M3 (franchise object/branches/
remake/reboot/rights), M4 (SubProperty/crossover), M5 (cast continuity/rivals/early greenlight), M6
(cast slots/cameo). No M7 file exists. All arithmetic below is reproduced by
`redteam/R1_verify.py` (this folder; imports and drives `M1-final-synthesis-calc.py`'s own classes
unmodified — nothing hand-waved, nothing hand-rounded) plus the models' own scripts
(`m4_worked_numbers.py`, `m6_arithmetic_check.py`) for the parts that touch M4/M6.

Owner directions A–U are treated as fixed. Nothing below argues to reopen them; every finding is
"this specific formula, as written, does X" and every correction is scoped to be the smallest one
that preserves every direction.

---

## 0. Headline: two root-cause defects drive most of the "dominant strategy" findings below

Before the 14-item list, two mechanical facts, verified by running the actual final-synthesis code,
explain roughly two-thirds of what follows. Every later attack that cites "root cause A" or "root
cause B" is invoking one of these.

### Root cause A — Recognition ratchets with RELEASE COUNT, not quality (a real bug, not a design choice)

`Property.register_release()` compares releases using a **time-inflated** score,
`score = raw * 2**(now_week/HL_R)` (`raw = reach01 * quality`), against a stored `bestScore` in the
same time-inflated units. Because `2**(t/HL_R)` is strictly increasing in `t`, **any later release
with positive `raw` — regardless of whether its quality is higher, equal, or lower than every prior
release — always numerically "outbids" the current peak and becomes the new peak**, and the
displaced old peak is permanently banked into `residualScoreSum` at weight `KAPPA_R = 0.15`. Since
`residualScoreSum` only decays at the *slow* R half-life (650 weeks) between releases, at any
realistic release cadence it is essentially additive: **Recognition becomes a running, weakly-decayed
SUM over installment count**, not a peak-anchored, quality-gated value — the exact opposite of
Direction Q's "no full lifetime average" and the literal GDM "monotonic ratchet... sequel-spam by
construction" failure mode the evidence atlas explicitly names as a REJECT (`03e §13`).

Verified (`R1_verify.py`, "Root-cause isolation"): eight releases of **identical, held-constant,
mediocre quality** (critic 57 / audience 55, box office 0.9× forecast, i.e. every single one an
under-performing film) at 15-week cadence drive Recognition from 52.1 → **100.0 (the hard cap)** by
the 8th release. This happens at three tested cadences (8wk, 15wk, 40wk) and is **not sensitive to
`KAPPA_R`** in the qualitative sense — even at `KAPPA_R=0.05` (a third of the shipped starting value),
12 mediocre releases still reach R=78.2; at the shipped 0.15 they reach the R=100 cap.

None of M1a/M1b/M1c/M1j/M1k's own worked Case D tables **name** this as a defect, even though M1b's
own published Case D numbers show it happening in plain sight (R climbs 52.1→59.6→66.8→73.7 across
four *mediocre* films while the judges' commentary discusses only the Fatigue/band story). This is a
genuine gap in the prior analysis passes, not a re-litigation of them — the Evidence Completeness
Critic itself flagged that no one had yet "turned around" the comparator exploit-hunting method and
pointed it at the Owner's own formulas (`00-EVIDENCE-COMPLETENESS-CRITIC.md:84,97`); this file is
that pass.

### Root cause B — Fatigue never touches the one channel that produces real cash

`Branch.outputs()`:
```
awareness = clamp(AWARE_WR*(R/100) + AWARE_WM*(max(M,0)/100), 0, 1)      # NO F term
expect    = clamp(1 + EXP_A*R + EXP_B*max(M,0) - EXP_C*F, EXP_LO, EXP_HI) # F only lives here
```
`awareness` is the value that plugs into P07's `preMarketingAwarenessOf` (M2 Seam A) — the seam that
raises **real, realized box office** via marketing efficiency. `expect` only raises the **bar**
(`forecast.expectedTotal`) that `computeStarPowerDelta.fcMult` (fame, capped ±15% on the *gain* side
only, per architecture §c.5) and the newspaper's `boxDelta` (narrative "hit/miss" framing) judge the
film against. **Fatigue therefore has zero effect on the metric a cash-maximizing player actually
optimizes.** Verified directly (`R1_verify.py`, "does Fatigue reduce the CASH-facing awareness term"):
forcing `F` from 0 to 500 leaves `aware` bit-for-bit identical (0.4191 in every case); only `expect`
moves, and it floors at `EXP_LO=0.7` and stays there — a fixed, modest, one-time 30% haircut to a
*narrative* bar, never a growing cost.

This was not an oversight the model authors were blind to in isolation — M1j explicitly **praised**
this exact choice in M1b ("Only positive Momentum adds to awareness; a franchise on a downswing does
not get its public awareness suppressed through this channel... The downside... is expressed
entirely through [the expectation multiplier], never here") as the correct reading of Direction C
("failures reduce excitement," not "erase recognition"). That reasoning is defensible for a genuine
*downswing* (negative M); it was never tested against **sustained overexposure at merely-mediocre-but-
not-negative M** (Root cause A shows M can even be flat-to-slightly-positive throughout a mediocre
spam run, e.g. M≈1.0–4.8 throughout the 8-week-cadence run above) — which is exactly the gap the
Evidence Completeness Critic flagged and exactly what this pass tests.

**Combined effect:** a player who ignores Fatigue entirely and just wants cash is not leaving value on
the table by ignoring it — Fatigue, as currently wired, is **purely a narrative/fame-adjacent
readout with no cash consequence**, while Recognition (which *does* drive cash, via Seam A) can be
farmed to its ceiling by sheer release count regardless of quality. This is the single most
important finding of this pass and the mechanism behind attacks #1–#4, #9, #10, and (compounded
with M4) #5, #11, #13 below.

---

## 1. Every hit immediately gets sequel spam

**(a) Play sequence.** Release any film with `reach01 * quality > 0` (i.e., anything that opens
above ~$10–20M, hit or not). Immediately begin producing a same-branch continuation at the fastest
producible cadence (bounded only by production time, not by anything R/M/F-related — legality never
reads R/M/F, architecture §b.2/M3 §9). Repeat indefinitely, quality irrelevant.

Numbers (`R1_verify.py`, 15-week cadence, mediocre 0.9×-forecast quality held constant throughout —
**not even hits**): Recognition 52.1→59.8→67.4→74.9→82.2→**100.0 by release 8**; `aware`
0.419→0.482→0.543→0.604→0.663→**0.806 by release 8** and stable thereafter; internal Fatigue climbs
past 300 with **zero effect on `aware`** (root cause B). A genuine hit sequence (M1a/M1b/M1c Case B,
two real smashes) reaches R≈94 and `aware≈0.84` in just two releases — even faster.

**(b) Verdict: DOMINANT.** Confirmed by direct execution against the actual final-synthesis code, at
three cadences, with the weakest possible input (mediocre, forecast-missing films) — not merely a
hit-chasing strategy but a **content-quality-independent** one.

**(c) Bounding mechanism today:** none, on the cash-relevant channel. `Direction D`'s "production
capacity/opportunity cost is real" is the only thing that slows this down at all, and it only
throttles *how fast*, never *whether*.

**(d) Smallest correction:** two surgical changes, both additive (no new caps, no cooldowns —
consistent with "prefer opportunity cost over arbitrary caps"):
1. Route Fatigue into the awareness formula too: `awareness = clamp(AWARE_WR*(R/100) + AWARE_WM*max(M,0)/100 - AWARE_WF*(F/100), 0, 1)`, `AWARE_WF ≈ 0.3–0.4` (starting point). This gives overexposure a **real, continuous, cash-relevant opportunity cost** — exactly the "repeated mediocre output raises Fatigue faster... Fatigue rises faster for mediocre than excellent" promise of Direction C, applied to the metric that matters, not just the narrative one.
2. Cap Recognition's non-peak contribution to a small, fixed **number of most-recent-or-highest residual installments** (e.g., top 3, mirroring M1c's own ≤4-entry ledger idea for Momentum, applied here to Recognition's residual term) instead of an ever-growing `residualScoreSum`. This restores "no full lifetime average" as a literal property (a franchise's Recognition can never again out-earn a *specific number of good films*, only genuinely good ones) rather than a description that the current formula only satisfies for the *peak* term while quietly violating it for the residual term.

**(e) Confidence: HIGH.** Verified by direct execution of the shipped final-synthesis code at three
cadences and three `KAPPA_R` values; not a hypothetical.

---

## 2. Fastest possible sequel is always optimal

**(a) Play sequence.** Given Direction G (early greenlight, no predecessor-release gate) and
`PRODUCTION_TICKS=8` (architecture/M6 §14.2 — the flat minimum production window), a player can
greenlight the sequel's production **concurrently** with the predecessor's, so the two release only
~8 weeks apart rather than waiting for the predecessor to finish its run first. Momentum's half-life
is 24 weeks (fast); Recognition's residual accumulation (root cause A) is essentially cadence-blind
(the sensitivity table above shows R=100 is reached at 8, 15, *and* 40-week cadence — only the
*number of releases needed* to reach it changes, never whether it's reachable). So: releasing as
fast as physically producible (a) captures the freshest, least-decayed Momentum for the *next* film's
own live-read awareness (M2 §3.2, "read inherited awareness at release, not at greenlight" — this is
explicitly recommended and correctly implemented) and (b) simply fits more $-generating releases into
the same calendar time.

**(b) Verdict: DOMINANT, bounded only by production capacity.** At 8-week cadence, 20 releases land
by week 152; at 40-week cadence, the same 20 releases take until week 760 — a 5× difference in total
elapsed time for an **identical** cumulative box-office and Recognition-ratchet outcome. There is no
tested cadence, from 8 to 40 weeks, where slower is ever better for cash. This is the mechanical
version of the exact strategy Hollywood Animal's shipped "Trash King" achievement players
independently discovered and industrialized ("batch-produce 3 films across 3 soundstages... In 6
months you have released 6 sequels," `03a-comparators-hollywood-animal.md:25`) — a live comparator
confirming this is a real, discoverable, and actually-played strategy in the genre, not a paper
hypothetical.

**(c) Bounding mechanism today:** production capacity (real, but the only one) — no R/M/F-based
disincentive exists for speed itself (confirmed: Case B in all three RMF candidates explicitly
verifies "must not be punished for speed," and the final synthesis inherits that). This is Direction
D working exactly as specified; the problem is not that speed goes unpunished (that's intentional)
but that *nothing else* (root causes A/B) creates a genuine quality-vs-speed tradeoff either.

**(d) Smallest correction:** the same fix as #1(d)(1) — once Fatigue has a real cash cost, the
fastest-cadence strategy starts trading off against a genuine, continuous, opportunity-cost-shaped
counterweight (faster cadence at mediocre quality now visibly erodes the very `aware` term that speed
was trying to maximize), without adding any cooldown or hard timer (avoiding the GDT/MGT2 failure
modes the evidence explicitly rejects, `00-EVIDENCE-COMPLETENESS-CRITIC.md:84`).

**(e) Confidence: HIGH** on the mechanism; **MEDIUM** on exactly how much production-parallelism a
studio can realistically run (that's a P11/P13 capacity question this pass didn't model).

---

## 3. Franchises dominate originals permanently (why ever make an original?)

**(a) Play sequence.** Compare, for a fixed studio budget slot: (i) a brand-new original (R=M=F=0,
`aware=0`, `expect=1.0`) vs (ii) a continuation of any already-ratcheted property (per root cause A,
trivially achievable — `aware≈0.42–0.81`, real, from the very first sequel onward). Because `aware`
feeds **real box office** through P07's marketing-efficiency chain (M2 §1.1) with the *only* offsetting
cost being a modestly harsher `expect` bar that (root cause B) doesn't touch box office at all and
only softly compresses fame *upside* (never creates fame *downside* — `starPower.ts`'s `loss` term
never reads `fcMult`, confirmed at M2 §2, "fcMult... appears only inside gain"), a continuation is
**strictly better** for cash than an original of identical underlying quality, every single time.

**(b) Verdict: DOMINANT for cash-per-slot, bounded only by the bootstrapping requirement that some
original had to exist once.** Once a studio owns even one property (or, per §8 below, can buy one),
there is no cash-rational reason in these formulas to ever greenlight a *new* original again — the
only thing an original can ever offer that a continuation cannot is the *chance* to become a new
property to farm, which is itself dominated by farming an existing one (a known R=52+ property beats
a new R=0 property on expected value from film one).

**(c) Bounding mechanism today:** none, structurally — Direction E/M already accept this is the
premise ("successful properties start with an audience... higher expectations and bigger
reputational downside," Direction B) but the "bigger downside" clause is not actually mechanically
true for real cash (root cause B), so the trade the design intends (real upside, real downside) is
currently real-upside/narrative-downside only.

**(d) Smallest correction:** the same #1(d)(1)/(2) fixes close most of this gap by making the
downside real; no additional mechanism is needed or recommended (adding a direct "originals bonus"
would violate Direction B's "no automatic sequel quality bonus" read in reverse and is not the
smallest correction available).

**(e) Confidence: HIGH** that the current formulas produce this incentive; **MEDIUM** on whether the
fix above fully closes it versus merely narrows it (a full closure would need enough Fatigue-to-
awareness coupling to actually make some quality bar of continuation net-negative vs. an original,
which is a tuning question, not a shape question).

---

## 4. Famous IP becomes impossible to dislodge

**(a) Play sequence.** Run root cause A's spam sequence to `rPeak=100` (achievable, per §1, with
eight purely mediocre films — no hit required). `R_reported = max(R_raw, FLOOR_FRAC*rPeak)`,
`FLOOR_FRAC=0.35`. Verified (`R1_verify.py`, "permanent floor" test): after the spam run, Recognition
sits at a **permanent floor of 35.0** — even after **2,080 weeks (40 years) of total silence**, R
never falls below 35.0, because the floor is a fraction of `rPeak`, and `rPeak` only ever ratchets
up, never down (§2.2 of M1a, ported into the final synthesis unchanged).

**(b) Verdict: DOMINANT/near-unkillable, and the "fame" was never earned.** The property that hit
this floor was built entirely from eight forecast-missing films (0.9× expected total each) — not a
single genuine hit. Direction Q's "older defining hits retain long-term Recognition" is being
satisfied by a property that never had a defining hit, only a defining *count*.

**(c) Bounding mechanism today:** none — `rPeak` inherits root cause A's count-sensitivity with no
separate quality gate of its own.

**(d) Smallest correction:** gate `rPeak`'s ratchet on **peak quality of a single installment**, not
on the (already-corrupted) running `R` value — e.g. `rPeak` only advances when the releasing
installment's own `quality ≥ Q_DEFINING (~0.75, same threshold as the satiation gate already used
elsewhere in this file)`, so a "defining hit" requires an *actually good film*, not merely the
Nth mediocre one. This is a one-line, opportunity-cost-neutral gate (it changes what counts as a
peak, not how many peaks are allowed) and directly resolves both this item and half of §13 below.

**(e) Confidence: HIGH.** Verified by direct execution; the floor mechanic itself (once a real peak
is earned) is explicitly intentional and correct per Direction Q — the defect is only that the peak
can be manufactured without quality.

---

## 5. Spin-offs generate infinite Recognition

**(a) Play sequence.** Mint a cheap SubProperty from a low-`hookWeight` character (support-tied,
`transferFraction≈0.475`, per M4 §A.4's worked table) off a modest R_parent≈72 property. `R_sp(t0)`
starts low (~34) but "after mint, the SubProperty accrues its own R/M/F exactly like a Franchise
root does — the *same* core per-installment update functions" (M4 §A.4) — i.e., the SubProperty's
own accrual is subject to **root cause A** exactly like any StoryProperty. Spam mediocre
spin-off-branded sequels of it (similarity 0.4–0.5, per the type table — even *lower* Fatigue
accrual per release than a direct sequel, and Fatigue doesn't matter for cash anyway per root cause
B) to ratchet `R_sp` to whatever cap applies.

**(b) Verdict: PROFITABLE-BUT-BOUNDED for "infinite," but genuinely DOMINANT for "unbounded relative
to input quality."** M4's own cap (`R_CAP=100` for crossovers, and R's own 0–100 clamp generally)
means it is not literally infinite — but it is **entirely disconnected from quality**, which is the
substantive form of the attack.

**(c) Bounding mechanism today:** `MAX_LIVE_SUBPROPERTIES_PER_STORYPROPERTY = 3` bounds *how many*
hooks can be farmed concurrently per parent property, but nothing bounds how far *each one's own*
Recognition can be inflated once minted — the cap is on breadth, not on depth.

**(d) Smallest correction:** the same fix as §4(d) (gate `rPeak` advancement on real per-installment
quality) applies identically to a SubProperty's own `rPeak`, since it is "a second instance of the
same state shape and the same update law" (M4 §A.4) — no separate mechanism needed.

**(e) Confidence: HIGH**, contingent on §4's root-cause fix landing (this is a direct corollary, not
an independent bug).

---

## 6. Cameo-spam gives free awareness

**(a) Play sequence.** Book N famous, off-fit cameos into a single film hoping the accumulated
publicity swamps the fee cost.

**(b) Verdict: NOT-VIABLE — this is the one attack the existing design genuinely, quantitatively
defeats.** Verified via `m6_arithmetic_check.py` (re-run, unmodified): stacking identical fame-90,
perfect-fit cameos gives successive `starDrawOpening'` deltas of **+9.18, +2.60, +1.03, +0.47,
+0.22** — 100%, 28%, 11%, 5%, 2% of the first cameo's marginal value — against a **flat, identical**
per-person fee of ≈$180,950 each (fame-dominant `salaryCurve`, `600,000·f²`). By the 3rd cameo the
player pays the same $180,950 for 11% of the first purchase's value. The rank-decay sum itself
converges to at most **2× the single most famous name's contribution**
(`Σ_{k=1}^∞ 0.5^{k-1} = 2`), and cameos are excluded from the cohesion/craft centroid entirely
(`CAST_WEIGHT.cameo=0.10`, excluded from `ROLE_WEIGHT`), so no amount of cameo stacking can substitute
for principal-cast execution on the quality axis either. Scheduling (`busy` window) additionally
bounds how many *distinct* famous people can be booked into overlapping productions at once.

**(c) Bounding mechanism:** three independent opportunity-cost mechanisms (flat fame-dominant fee vs.
geometrically-collapsing marginal return; rank-decay convergent sum; scheduling/`busy` scarcity) —
exactly the kind of "opportunity cost over arbitrary cap" design this task asks the report writer to
prefer, already present.

**(d) Smallest correction:** none needed. This is presented as a clean pass, not a finding to fix.

**(e) Confidence: HIGH.**

---

## 7. Returning-star continuity makes one actor mandatory

**(a) Play sequence.** Try to force the same lead actor into every installment forever to avoid a
recast "penalty," or conversely try to prove a rational player is *forced* to overpay to retain one.

**(b) Verdict: NOT-VIABLE today, with one live, explicitly-flagged future risk.** `ContinuityCredit`
only ever discounts the **inherited-awareness input** (max swing ±25% of that one term, not of the
whole film) and never gates legality (M5 §1.8a: "No mandatory cast — legality never depends on
cast"). The worked example (M5 §1.5) shows a **recast** lead plus a returning signature director
still nets only a 13% discount on inherited awareness, fully recoverable through ordinary craft
(exactly the real Mad Max: Fury Road pattern — Hardy replaces Gibson, Miller returns — 97% RT, $380M
WW). Salary is untouched (`salaryCurve` has no film/franchise argument; M5 §1.8c, verified against
architecture §c.6). **This directly refutes the failure mode Hollywood Animal ships live**
("recasting/role-swapping is not supported at all for named characters carried into a sequel,"
`03a-comparators-hollywood-animal.md` §9-region evidence cited in M5 §1.8a) — P17's design is a
deliberate, correct rejection of that comparator's mistake.

**(c) Bounding mechanism:** the ±25% cap on the awareness-only swing, plus the explicit legality/
salary firewall (M5 §1.8a/c).

**(d) Smallest correction:** none needed *today*. **Live risk, not yet built:** M5 §1.8c itself flags
that a future P14 "franchise premium" salary multiplier reading the public `AssociationWeight` band
is exactly the mechanism that *would* recreate mandatory lock-in, and names it as the single
temptation Hennig-Thurau's own data says gets *stronger* for bigger franchises. **Recommendation for
whoever eventually builds that P14 feature (not P17):** any such multiplier must decay if the actor
sits out an installment and must be capped per-film — restated here because it is exactly the kind of
decision this red-team pass exists to flag before it is built, not after.

**(e) Confidence: HIGH** on the current state; the flagged future risk is **MEDIUM** (depends on a
feature that does not exist yet).

---

## 8. Buying famous IP under P16 instantly wins

**(a) Play sequence.** Identify a rival-owned (or NPC-abandoned) property that has been spam-ratcheted
(by anyone, including the rival's own ordinary play) to R≈100/floor≈35 or a genuine hit peak.
Acquire its rights via a P16 sale/acquisition mechanic. Per M3 §5 (verified against the model's own
explicit design law): **the Franchise root hangs off `storyPropertyId`, never `studioId` — "a P16
sale event is therefore invisible to the P17 root: nothing is written."** Recognition/Momentum/
Fatigue **travel with the property, not the studio**, confirmed against real evidence (Deadpool &
Wolverine, released 3 years after Disney's X-Men acquisition, still opened $211.4M / grossed $1.34B —
"audience recognition for the X-Men property plainly survived the ownership change," M3 §5).

**(b) Verdict: PROFITABLE-BUT-BOUNDED — real, but bounded by a mechanism P17 does not own.** The
acquired R/M/F state transfers **instantly and at zero P17-side integration cost or friction** —
there is no "assimilation penalty," no re-accrual period, nothing. This is not "instantly win the
whole game" (the acquisition *price* is a P11/P16 concern, entirely outside this pass's scope, and
could in principle be set high enough to capture the full value), but it is a genuine structural fact
worth surfacing: **P17's own design choice (zero-byte, frictionless rights transfer) means the entire
value of a franchise's accrued R/M/F is a pure function of the property, and none of it is protected
by any P17-side "cost of ownership" mechanism.** If P16's eventual pricing formula does not itself
price in the current R/M/F state (which P17 does not require it to, and which P16 does not yet
exist to confirm), acquiring an already-maxed property (including one maxed via root cause A's
zero-quality spam, which a rival could produce cheaply and then be bought out of, deliberately or not)
is free money.

**(c) Bounding mechanism today:** none inside P17; the *only* possible bound is a P16/P11 pricing
formula that does not yet exist.

**(d) Smallest correction:** not a P17 fix — a **flag for the P16 charter**: rights-acquisition
pricing must read the target's current R/M/F state (a live P17 read, exactly the same "additive
source-reference seam" pattern P17 already uses for everything else), or a rights market becomes a
pure arbitrage instrument once root cause A makes cheap Recognition manufacturing possible. This
report should hand this finding to whoever eventually charters P16 pricing, not attempt to fix it
here (P17 must not invent P16 pricing authority, per INT-011/012).

**(e) Confidence: MEDIUM** — the *mechanism* (frictionless R/M/F transfer) is verified HIGH; the
*severity* depends entirely on an unbuilt P16 pricing formula this pass cannot inspect.

---

## 9. Reboot removes all failure consequences

**(a) Play sequence.** Hammer a main branch with six rapid mediocre sequels (verified: R=89.4, M=2.6,
**F=158.6**, band=COOLING, all at the *same week*, zero elapsed time). Immediately open a **reboot**
branch of the same property, same week, zero dormancy.

Verified (`R1_verify.py`, "reboot Fatigue reset" test):
```
main branch (6 rapid mediocre sequels, wk75): R=89.42  M=2.63   F=158.57  band=COOLING
new REBOOT, SAME WEEK, zero dormancy:          R=89.42  M=0.00   F=0.00    band=NEW
```
**F resets to exactly 0.00 with zero elapsed time and zero partial inheritance.**

**(b) Verdict: DOMINANT, and it directly contradicts a sibling model's own explicit design.** M3 §3.2
specifies, at length, with real-world justification (Terminator's three consecutive "new trilogy"
reboots all failing, the *third* worst because it inherited accumulated distrust): **a reboot's
Fatigue should NOT reset to zero** — `F₀(new reboot) = γ(0.2) × weighted-average(F at end of every
prior branch, each individually decayed)`. **This formula is not implemented anywhere in the actual
final-synthesis `Branch` class** — `Branch.__init__` hardcodes `self.F = 0.0` unconditionally for
*every* new branch, main or reboot, with no code path that ever reads a parent's Fatigue. This is a
genuine, load-bearing **contradiction between M3 and the code that was actually carried into the
final synthesis** (see §15 below) — not merely "M1c's candidate reboot bug" that M1k already caught
(that bug was in a *rejected* candidate; this is in the *surviving* one).

Combined with root cause B (Fatigue is cash-irrelevant anyway), reboot-as-fatigue-launder is doubly
free: even in the (currently false) event that Fatigue mattered for cash, a reboot would erase it
instantly and for free.

**(c) Bounding mechanism today:** the lifetime `N_MAX_BRANCHES=8` cap (M3 §2.3) bounds how many times
*this specific correction-dodge* can be pulled per property — but 8 reboots is generous headroom
("every real case in the evidence corpus comes nowhere near" it, per M3's own text), so the cap does
not bind in practice.

**(d) Smallest correction:** implement M3's own already-specified, already-evidenced reboot-Fatigue
partial-inheritance formula in the actual `Branch` constructor (a completeness fix, not a new design
decision — the formula already exists and is already justified against real data). Pair with §1(d)(1)
so that the inherited Fatigue actually costs something once inherited.

**(e) Confidence: HIGH.** Verified by direct execution of the actual shipped final-synthesis code.

---

## 10. Dormancy becomes a free fatigue reset (park-and-revive)

**(a) Play sequence.** Let a fatigued franchise sit idle for years, hoping to "reset" and cash in.

**(b) Verdict: NOT-VIABLE as literally posed, but MOOT rather than well-defended.** All three RMF
candidates and the final synthesis correctly show Recognition only ever *falls* during dormancy
(never rises from waiting) and Momentum fully flatlines to neutral — there is no reward for waiting
*longer than it takes Fatigue to clear on its own* (verified across M1a/M1b/M1c's Case E and the
final synthesis's own Case E: R falls monotonically with elapsed weeks at every tested gap). This
part of the design genuinely works as intended.

However: given §9's finding, **a player never needs to wait at all** — an instant, zero-dormancy
reboot achieves the identical F=0 reset that "park-and-revive" was trying to buy with time, for free,
with no Recognition decay cost either (Recognition is StoryProperty-wide and untouched by opening a
new branch). "Dormancy is correctly not a free reset" is therefore true but **irrelevant** — the real
free reset is reboot-on-demand (§9), which strictly dominates waiting.

**(c) Bounding mechanism today:** genuine and correct for literal dormancy (R's monotonic decay, M's
full flatline); moot in practice because of §9.

**(d) Smallest correction:** §9(d)'s fix (implement M3's own reboot-Fatigue-inheritance rule). No
separate dormancy-specific correction is needed once §9 is fixed.

**(e) Confidence: HIGH.**

---

## 11. Crossovers multiply recognition infinitely

**(a) Play sequence.** Cross over two properties each independently spam-ratcheted (§1/§4) to
R=100. Repeat the same pairing as a fresh, standalone crossover film as often as budget allows.

**(b) Verdict: PROFITABLE-BUT-BOUNDED for "infinite," but the COUNT of repeats is genuinely
uncapped.** Verified (`m4_worked_numbers.py` + `R1_verify.py`): `combinedR(100,100) = min(100 +
0.6·100, 100) = 100.0` — the per-crossover ceiling **genuinely bites** (M4's saturating-sum design is
correct and well-evidenced against real Avengers/Justice League data). But M4 Part B.7 is explicit
that a crossover defaults to **one `Production`/`FilmResult` plus lineage edges — "never a permanent
new Franchise object by default"** — it is **not a branch**, so `N_MAX_BRANCHES=8` (M3 §2.3's
anti-spaghetti rule) **does not bound it**. Nothing in M4 states a cap on how many times the *same*
two (or three) properties can be crossed over again later.

**(c) Bounding mechanism today:** Fatigue is charged to every participant on every crossover (M4 §B.5,
correctly discounted, correctly modeled) — but per root cause B, **this cost is currently cash-
irrelevant**, so the only real bound left is cast-capacity/budget (Additional Principal seats, P11/
P13/P14) — a real cost, but one that scales with a studio's general production budget, not with
crossover-specific fatigue.

**(d) Smallest correction:** none crossover-specific is needed — this **self-resolves once §1(d)(1)
lands** (Fatigue routed into the awareness formula), because M4 already correctly charges every
participant a discounted-but-real Fatigue hit per crossover (§B.5); once that Fatigue actually
suppresses the crossover's own and each participant's future awareness, repeat-crossover spam between
the same pair becomes self-limiting exactly the way M4's own design intended, with zero new
mechanism.

**(e) Confidence: HIGH** on the "no count cap" finding (directly from M4's own text); **HIGH** that
the general fix resolves it (the mechanism is already correctly wired, just currently inert).

---

## 12. Early-greenlight information games

**(a) Play sequence tried:** (i) greenlight a sequel before the predecessor's forecast locks, hoping
to see the predecessor's real reception first; (ii) exploit the frozen-forecast/live-awareness split
(M5 §3.2) to lock a cheap bar early while still capturing a later, hotter live-read awareness.

**(b) Verdict: NOT-VIABLE — genuinely well-designed, verified by construction, not merely by
argument.** (i) is structurally impossible: `FilmResult` (the only place reception facts live) is
constructed **atomically at release** (`buildFilmResult`, `tick.ts:594-606`) — "there is nothing to
withhold by construction" (M3 §7) — before release there is no partial signal of any kind to leak,
for the player or a rival. (ii): the two-seam design (locked forecast bar vs. live-read-at-release
awareness) is genuinely **symmetric risk**, not an exploit — worked through explicitly: if the
predecessor later succeeds, early greenlight locks a *lower* bar than a late greenlight would have
(a real upside), but if the predecessor bombs, early greenlight locks a bar using now-stale, too-
optimistic R/M (a real, matching downside) — this is precisely Direction G's "intentionally risky...
no hidden future reception info" working as specified, confirmed numerically in M5 §3.3's worked
example (Film 2's locked forecast $252.5M stays frozen; its *realized* trajectory collapses toward
$187.5M once the live-read reflects Film 1's bomb — a −25.7% miss the newspaper correctly reports).
The one genuine defect found in this area (M1k's audit: M1b's own *Case B narrative*, not the
mechanism, computed a "pre-decision" snapshot one week too late, at the spin-off's own release) was
already caught by the judges and **already fixed** in the final synthesis's own demo output
(explicitly labeled "temporal-leak FIXED: greenlight read wk91, pre-outcome" in
`M1-final-synthesis-calc.py`'s own print statements, verified against the re-run output above).

**(c) Bounding mechanism:** the engine's own data model (no `FilmResult` exists before release) plus
the deliberate two-seam separation (M5 §3.2) — both already correct.

**(d) Smallest correction:** none needed.

**(e) Confidence: HIGH.**

---

## 13. SubProperty promotion laundering

**(a) Play sequence.** Mint a cheap SubProperty (§5). Spam mediocre spin-off-branded sequels of it,
exploiting root cause A to ratchet `R_sp` upward independent of quality. Once `R_sp ≥
R_PROMOTION_MIN`, request promotion to an independent StoryProperty (M4 §A.5: eligibility is just
`installmentProductionIds.length ≥ 1 AND R_sp ≥ R_PROMOTION_MIN` — **no quality gate at all**). The
new, independent property carries over its accrued (root-cause-A-inflated) R/M/F/installments as
**starting state** for a brand-new, permanent StoryProperty with its own future `rPeak` floor (§4).
Repeat with each of the 3 concurrent SubProperty slots, freeing a slot on each promotion, to run this
as an assembly line manufacturing "prestige" IP from cheap, low-effort content.

**(b) Verdict: DOMINANT, and the exact bar that would stop it is explicitly unresolved in the source
material.** M4 itself flags, as an open Owner decision (Part I, item 2): "exact `R_PROMOTION_MIN` and
whether the Owner wants a higher bar given Creed's three-film/eight-year real-world path to
outgrowth" — i.e., **the model authors themselves identified this exact gap as unresolved**, which
this red-team pass confirms is not merely a cosmetic open question but a live exploit surface once
root cause A is in the picture (Creed's real path to outgrowth took three films and eight years of
*genuine* quality; a spam path could hit the same numeric `R_sp` threshold in a handful of forecast-
missing films with no calendar-time cost at all, if `R_PROMOTION_MIN` is set anywhere near the
REVIVAL_R_BAR-scale thresholds (~25–40) used elsewhere in these models).

**(c) Bounding mechanism today:** the `MAX_LIVE_SUBPROPERTIES_PER_STORYPROPERTY = 3` cap bounds
*concurrent* farming per parent, but promotion **frees the slot**, so it does not bound the total
number of properties a studio can eventually manufacture this way over a long campaign — only the
rate.

**(d) Smallest correction:** the same fix as §4(d) (gate `rPeak`/promotion-eligible peak advancement
on a genuine per-installment quality threshold, e.g. `quality ≥ 0.70`, not on the raw, count-
inflatable `R_sp` number) — this is the literal mechanical answer to M4's own open question, sized to
the evidence M4 already cites (Creed/Deadpool/Minions/Joker all promoted/out-grew on the strength of
at least one genuinely excellent, high-quality installment, never on volume alone).

**(e) Confidence: HIGH** that the gap exists (directly from M4's own self-flagged open question);
**HIGH** that it becomes exploitable once root cause A is considered (this pass's own contribution).

---

## 14. Rival asymmetry

**(a) Two distinct asymmetries found, of very different severity.**

**Asymmetry 1 — structural, not tunable: rivals cannot participate in this economy at all yet.**
Every part of the franchise system that a rival would need to compete on (owning a StoryProperty,
minting a SubProperty, rebooting, crossing over) is explicitly gated on a P16 rights record rivals do
not have: **"rivals have no rights model at all... there is no franchise/sequel/StoryProperty
identifier anywhere in `src/` (grep: zero hits)"** (architecture §e.5, repeated verbatim as
"dependency D1" in M5 §0, M4 Part E, and M3's own text). Until P16 ships this, **every exploit in
this report is available to the player with zero rival counter-pressure or competition** — Direction
K's "rivals obey the same law" is currently vacuously true because rivals cannot enter the game at
all. This is the single most consequential asymmetry in the whole design: not a subtle rule
difference, but a **wholesale missing prerequisite** that, if P17 ships its player-facing mechanics
before P16 delivers rival rights (a real, plausible sequencing risk given P16 is not yet chartered),
hands the entire franchise-exploitation surface to the player uncontested.

**Asymmetry 2 — real once rivals exist, and it favors the player over a "correctly behaving" rival.**
The designed rival policy (identical across all three RMF candidates and the final synthesis) is
`IF band ACTIVE/ACTIVE-AGAIN and M above a bar → continue; ELIF REVIVAL CANDIDATE and R above a bar →
reboot (probabilistic); ELSE → stand down.` This heuristic is calibrated to **respect** Fatigue/
Momentum as if they were genuine quality signals — a rival correctly "stands down" once its own
property goes COOLING. But per root cause B, Fatigue and negative-narrative-band status **do not
actually cost real cash** for a player willing to ignore them. **A disciplined rival AI following its
own designed policy will systematically leave a fatigued-but-still-cash-positive franchise unexploited
that an adversarial player will keep milking anyway** — the rival's conservatism, designed to model
"good taste," actually costs it real revenue under the current formulas, while the player suffers no
equivalent restraint. This is a genuine, quantifiable disadvantage for the rival relative to an
optimal player, not merely "the player has more information" — it is the *rival's own correctly-
implemented intent* (respect Fatigue) working against it because the underlying formulas don't back
that intent up.

**(b) Verdict: Asymmetry 1 is a BLOCKING structural gap (not a tuning issue); Asymmetry 2 is
DOMINANT for the player once rivals exist, and it is a direct corollary of root cause B.**

**(c) Bounding mechanism:** none for Asymmetry 1 (it's a missing dependency, not a bounded system);
Asymmetry 2 is bounded only by whatever conservatism the rival's own policy happens to encode, which
is exactly the thing that makes the rival lose relative to an unconstrained player.

**(d) Smallest correction:** Asymmetry 1 — a sequencing/scope recommendation, not a formula: P17's
player-facing franchise mechanics should not ship ahead of P16's rival-rights extension by more than
one release cycle, or the exploit window should be treated as a known, time-boxed gap rather than a
silent one. Asymmetry 2 — self-resolves once §1(d)(1) lands (Fatigue becomes a real cost for the
player too, closing the gap between "what the rival's policy respects" and "what actually costs
money").

**(e) Confidence: HIGH** on Asymmetry 1 (directly, repeatedly stated across three separate model
files and the architecture sheet); **HIGH** on Asymmetry 2's mechanism, **MEDIUM** on its magnitude
(depends on exact rival policy thresholds, which are all explicitly unset starting points).

---

## 15. Contradictions found between model files (exploitable ambiguity)

1. **Reboot Fatigue inheritance — M3 vs. the actual final-synthesis code (HIGH confidence,
   load-bearing).** M3 §3.2 specifies `F₀(reboot) = 0.2 × weighted-avg(prior branch F's)`, evidenced
   against Terminator's three-reboot failure pattern, as the central defense against "reboot is a
   free fatigue cure." The actual `Branch` class in `M1-final-synthesis-calc.py` (the file that
   carries the winning RMF shape forward) hardcodes `F=0.0` for every new branch unconditionally —
   M3's formula is not implemented anywhere in the surviving code. See §9 above.

2. **Expectation-multiplier centering — M1a vs. M1b/M1c/FINAL (MEDIUM confidence, real but narrow
   effect).** M1a centers Recognition around 50 (`0.006*(R-50)`), so a brand-new property (R=0) gets
   a **discounted** 0.7× bar. M1b, M1c, and the final synthesis all use raw R (`0.006*R`), so the
   same brand-new property gets exactly 1.0× — **no originals discount**. Verified numerically
   (`R1_verify.py`): at R=M=F=0, M1a gives 0.700, M1b/FINAL give 1.000. This is a genuine,
   undocumented resolution of a real disagreement between sibling candidates — nothing in the
   surviving text explains why the final synthesis silently adopted M1b's convention over M1a's on
   this specific point, and it materially affects §3's "why ever make an original" finding (a
   centered convention would have given originals a small, structural cash-relevant advantage that
   the shipped convention does not).

3. **M-clamping in the expectation multiplier — M1c vs. M1b/FINAL (LOW-MEDIUM confidence, narrow
   effect).** M1c's own document uses signed `M` unclamped (`+0.004*M`, can reduce the bar below 1.0
   on negative Momentum); M1b and the final synthesis use `max(M,0)` (negative Momentum can never
   raise the bar, but also never further lowers it below what R/F alone would set). Verified: at
   R=0,M=-50,F=0, M1c gives 0.800, M1b/FINAL gives 1.000. Minor in isolation, but combined with
   finding #2 shows the final synthesis consistently chose the *least* discount-friendly convention
   at every fork, without documenting why.

4. **SubProperty minting authority — checked, NOT a live contradiction.** The task flagged this as a
   thing to check ("whether SubProperty is P16- or P17-minted"). M4 is internally consistent and
   consistent with M3: the SubProperty **identity** is P17-minted (Part C: "New P17 root entry, keyed
   by an opaque, permanent id"); only **promotion to an independent StoryProperty** and any future
   **sub-property-specific rights** are P16 authority (M4 §A.5/§A.6). No contradiction found here.

5. **Fatigue inheritance fractions across continuation types — checked, NOT a contradiction, but
   worth naming.** M3's reboot fraction (γ=0.2, weighted-average of *all* prior branches) and M4's
   spin-off fraction (`FATIGUE_INHERIT_FRACTION=0.5`, of the *parent's current* Fatigue only) are
   different values for different mechanisms by design (a reboot is meant to be more of a fresh start
   than a spin-off) — not a disagreement. The real issue is #1 above: neither fraction is actually
   implemented in the surviving RMF core at all.

---

## 16. Ranked table

| # | Attack | Verdict | Bounding mechanism | Smallest correction | Confidence |
|---|---|---|---|---|---|
| 1 | Every hit gets sequel spam | **DOMINANT** | none on the cash channel (only production capacity) | Route F into `awareness` (Seam A); cap Recognition's residual to top-K installments, not an unbounded sum | HIGH |
| 4 | Famous IP impossible to dislodge | **DOMINANT** | none (rPeak inherits count-ratchet) | Gate `rPeak` advancement on real per-installment quality (≥0.75), not on the corrupted running R | HIGH |
| 9 | Reboot removes failure consequences | **DOMINANT** | `N_MAX_BRANCHES=8` (doesn't bind in practice) | Implement M3's own already-designed γ=0.2 reboot-F-inheritance formula (currently missing from code) | HIGH |
| 13 | SubProperty promotion laundering | **DOMINANT** | `MAX_LIVE_SUBPROPERTIES=3` (bounds rate, not total) | Gate promotion/`rPeak` on genuine peak quality, not raw R_sp (same fix as #4) | HIGH |
| 2 | Fastest sequel always optimal | **DOMINANT**, bounded only by production capacity | production capacity (real, but only) | Same as #1 — F-into-awareness creates a genuine speed/quality tradeoff | HIGH |
| 14a | Rival asymmetry — rivals can't play the game at all yet | **BLOCKING structural gap** | none (missing P16 dependency) | Sequence P17 player-facing franchise mechanics no more than one cycle ahead of P16 rival-rights | HIGH |
| 3 | Franchises dominate originals permanently | **DOMINANT for cash-per-slot** | none real (only narrative-cost is charged today) | Same as #1 (real Fatigue cost restores the intended real downside) | HIGH |
| 14b | Rival asymmetry — disciplined rival loses to reckless player | **DOMINANT for the player** | rival's own (currently miscalibrated) conservatism | Self-resolves once #1's fix lands | HIGH (mechanism) / MEDIUM (magnitude) |
| 5 | Spin-offs generate "infinite" Recognition | **PROFITABLE-BUT-BOUNDED** (capped at 100, but quality-independent) | 0–100 clamp only | Same as #4 | HIGH |
| 11 | Crossovers multiply recognition infinitely | **PROFITABLE-BUT-BOUNDED** (per-crossover capped; repeat-count uncapped) | saturating sum cap (real); Fatigue cost (currently inert) | Self-resolves once #1's fix lands (M4's own Fatigue-sharing design becomes real) | HIGH |
| 8 | Buying famous IP under P16 instantly wins | **PROFITABLE-BUT-BOUNDED** (bounded only by an unbuilt P16 price) | none inside P17; depends entirely on future P16 pricing | Flag for the P16 charter: price acquisitions against live R/M/F, don't fix in P17 | MEDIUM |
| 10 | Dormancy as free fatigue reset | **NOT-VIABLE as posed, but MOOT** (reboot dominates waiting) | R's monotonic decay + M's flatline (both genuine) | Same as #9 (once reboot is fixed, dormancy's correctness becomes actually load-bearing again) | HIGH |
| 7 | Returning-star continuity mandatory | **NOT-VIABLE today** | ±25% awareness-only cap + legality/salary firewall | None needed now; flag future P14 "franchise premium" risk before it's built | HIGH (now) / MEDIUM (future risk) |
| 6 | Cameo-spam free awareness | **NOT-VIABLE** | flat fame-dominant fee vs. geometric marginal decay; rank-decay cap at 2×; scheduling scarcity | None needed | HIGH |
| 12 | Early-greenlight info games | **NOT-VIABLE** | atomic `FilmResult` construction (no partial info exists); symmetric two-seam risk design | None needed | HIGH |

---

## 17. Note on method and files

All numbers above were produced by `redteam/R1_verify.py`, which imports and drives the actual
classes in `models/M1-final-synthesis-calc.py` unmodified (its own top-level demo output is
suppressed, not altered), plus direct re-execution of `models/m4_worked_numbers.py` and
`models/m6_arithmetic_check.py` unmodified. Nothing in this file is a hand-derivation the models'
own code disagrees with; every load-bearing number is either a direct script printout or a one-line
hand-check reproduced from a formula quoted verbatim from its source model file. No repository file
was read, edited, or executed; no branch, build, or runtime was touched.
