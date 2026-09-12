> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`../redteam/R3-reviewer-corrections-calc.py`](../redteam/R3-reviewer-corrections-calc.py), committed output [`../redteam/R3-output.txt`](../redteam/R3-output.txt) — **the report governs.** Superseded here: a judge's hand re-runs of the three candidates; verdicts predate the synthesis, the red team and revision 02.

# M1k — RMF Judge: SYSTEMS-CORRECTNESS-AND-EXPLOITS lens

**Judge role:** independent re-derivation of the arithmetic behind M1a/M1b/M1c's worked cases, checked against the Owner directions (CONTEXT.md A–U) and the evidence corpus, looking specifically for tables that do not follow from their own stated rule, double-counting with P07/P14/P15, exploit surfaces, save-cost realism, and rival-policy compactness. Read-only; verification arithmetic run only via throwaway python in this `models/` folder (the candidates' own scripts, executed as-is, plus small standalone checks I wrote to isolate specific claims — none of it touches the repo).

Candidates read in full: `M1a-rmf-three-meters.md` (+`m1a_three_meters.py`), `M1b-rmf-derived-kernels.md` (+`m1b_derived_kernels.py`), `M1c-rmf-debt-ledger.md` (+`m1c_rmf_sim.py`). Evidence read in full for this pass: `04a-real-franchises-set-A.md`, `04b-real-franchises-set-B.md` §E/F (summary table + Part 5), `03e-comparators-other-ip-sequel-tycoons.md` §12–13.

---

## 1. Independent re-derivation — arithmetic shown

I re-ran each candidate's own script unmodified, then independently hand-recomputed selected steps from each model's **stated formula text** (not by trusting the script) to check the script matches the prose, and wrote small standalone probes to test claims the published tables gloss over. Two cases minimum per model, per the task; I did more where a discrepancy surfaced.

### 1.1 M1a — Case B (Film 1) hand check, from §2 formulas

Film 1: critic 80, aud 78, total=$480M, expectedTotal=$300M, opening=$126M, expectedOpening=$90M, similarity=0 (ORIGINAL), R=M=F=0 at start.

```
q = 0.4·80 + 0.6·78 = 78.8                                   ✓ matches table
beat = 480/300 = 1.6                                          ✓ matches table
reach01 = 480/(480+200) = 0.70588
beatMult = clamp(1+0.3·0.6, 0.8,1.3) = 1.18
gainQ = clamp((78.8-55)/30,0,1.3) = 0.7933
lossQ = clamp((60-78.8)/45,0,1.4) = 0        (negative → clamped)
room(R=0,1.3) = 1

gain_R = 48·0.70588·0.7933·1.18·1 = 31.72     dR = 31.72       ✓ EXACT match to table (dR=31.72)
openingBeat = 126/90 = 1.4 ; openingMult = clamp(1+0.5·0.4,0.6,1.8) = 1.2
gain_M = 55·0.70588·0.7933·1.2 = 36.96        dM = 36.96       ✓ EXACT match (dM=36.96)
satiation(q=78.8) = clamp((75-78.8)/35,0,1.3) = 0 (q>75)
gain_F = 80·reach·0·(0^1.2)·room = 0 ; relief_F = 0 (F=0)     dF = 0.0        ✓ EXACT match
```

Film 2 (wk52, q=80.8, beat=1.4762): decayed R-before ≈ 30.997 (floor=0.35·31.72=11.10, half-life 1000wk over 52wk); `room(30.997,1.3)=0.6174`; `gain_R = 48·0.7561·0.86·1.1429·0.6174 = 22.02` — **exact match** to the table's dR=22.02. `dM` recomputes to 41.98 (table shows the same, rounded to 42.0), `dF=0` because `satiation(q=80.8)=0` again (q>75 both times). **This is the exact mechanical reason Case B shows "Fatigue is exactly 0.0 throughout"**: `satiation(q)` is a hard 0 whenever q≥75, and both films here clear that bar — not a fudge, a genuine, reproducible consequence of the stated rule. M1a's Case B claim is **verified true**, arithmetic exact to 2 decimal places.

### 1.2 M1a — Case D (Films 1–2) hand check

Film 1: critic 57, aud 56 (q=56.4), beat=0.9, openingBeat=0.85, similarity=0 (ORIGINAL). `gain_R=1.2485→dR=1.25` ✓ exact. `dM=-2.835→-2.84` ✓ exact. `dF=0` because similarity=0 (s^1.2=0 regardless of satiation) ✓ exact.
Film 2 (wk40, similarity=0.9 now): decayed R-before=1.2275, `dR=1.1762→1.18` ✓ exact; `dM=-2.835→-2.84` (unchanged, since dM has no F/R dependence) ✓ exact; `satiation(56.4)=0.5314`, `s^1.2=0.9^1.2=0.8813`, `gain_F=80·0.5745·0.5314·0.8813·1=21.52` ✓ **exact** match to table's dF=21.52. Monotonic F climb (0→21.5→36.8→47.4) is a genuine, reproducible property of the stated rule, not a display artifact.

**M1a's core arithmetic is exact wherever I checked it.** The defects below are structural/architectural, not arithmetic-transcription errors.

### 1.3 M1b — Case B: independent probe at week 91 (one week before the spin-off's own release)

M1b's script computes `report("...spin-off...", B, [0,52,92,93], 'main')` and reports the spin-off's own branch **at week 92 — the exact week `SpinOff` itself releases** (`Installment("SpinOff", 92, ...)`, filter `release_week <= now_week`, so week 92 already includes it). I wrote a standalone probe against the model's own `recognition`/`momentum` functions to see what a genuinely **pre-release** ("about to greenlight, outcome not yet known") snapshot at week 91 would show, versus what the .md's own table (week 92) reports:

```
main week=91:  R=83.57  M=26.24  F=14.57  band=ACTIVE  expMult=1.534
main week=92:  R=94.15  M=25.49  F=14.48  band=ACTIVE  expMult=1.594   <- what the .md table prints
spin1 week=91: M=0.00   (no installments visible yet — a true cold start)
spin1 week=92: M=44.50  (SpinOff's own post-release momentum contribution)
```

**Finding:** the .md's own prose says *"Player sees (greenlighting the spin-off at week ~90): ACTIVE — 'This property is at its strongest recorded Recognition (94.2). A new spin-off inherits high awareness (0.84)...'"* — but the R=94.2 and spin1-M=44.5 numbers quoted are computed **at the exact week the spin-off already released and its own reception is known** (SpinOff's own `surprise` term, comparator 1.4, quality 0.745, contributes +44.5 to its own ledger — that IS the film's own outcome, not an inherited/pre-release value). The genuinely pre-decision numbers (week 91) are R=83.6 (11 points lower) and the spin-off's own branch M=0.00 (a cold start, not "44.5 of inherited excitement"). This is a real, verifiable **temporal leak**: the model's own worked example presents post-outcome data as if it were the input to a not-yet-made greenlight decision, which cuts against Direction G's explicit "no hidden future reception info; rivals make equivalent bets" requirement — the model's *kernels* don't violate this (a rival's actual decision-time read would correctly see week-91-style numbers), but its **own Case B narrative does**, and a reader taking the .md at face value would over-credit the model's "must not be punished for speed" demonstration, since the number doing the reassuring work (R=94.2) is not actually available before the spin-off both released and succeeded.

### 1.4 M1c — Case D & across-the-board: the "founding film accrues Fatigue" bug

Hand-tracing `m1c_rmf_sim.py`'s Case A `F` line: `F = fatigue_accrue(F, Q1, SIMILARITY["direct_sequel"])` is called on **Film 1 — the franchise's own founding/ORIGINAL release** — in Cases A, B, C, D and the self-critique spam mini-case alike (`m1c_rmf_sim.py:139,161,199,233,268`). `SIMILARITY` (`:31-37`) has no `'original'` key at all; the script silently defaults every founding film's Fatigue accrual to the **highest** bucket, `direct_sequel=0.90`, rather than to "no prior release, nothing to be similar to, s=0" as both other candidates explicitly encode (M1a §2: *"For a founding ORIGINAL release, s=0 by convention → dF=0 always: a first film cannot be 'fatiguing'"*; M1b's `fatigue()` literally slices `branch_rows[1:]` to exclude the branch's founding film from the sum). Confirmed by hand: Case A's Film 1, `Q1=0.8975`, `F = 40·(1-0.8975)·0.90 = 3.69` — exactly the script's printed `F=3.69` at week 0, i.e., **a brand-new franchise starts its life with nonzero "overexposure debt" on day one**, before anything exists to be tired of. The same default inflates the Film-1 row of every one of Cases A/B/C/D and the 8-release spam stress test (`F=20.30` for Case D's Film 1 alone). Nowhere in M1c's §0–§12 prose is this choice stated, defended, or even acknowledged as a modeling decision — it is an undocumented artifact of a missing dictionary key, not a designed feature, and it directly contradicts the shape's own §2.4 framing ("no per-count penalty… no minimum-wait check anywhere in the release path" — a founding film is not a "count" or a "wait," it is the *absence* of anything prior).

**Secondary consequence for Case D specifically:** M1c's own §8.4 narrative claims *"Fatigue climbs steadily and visibly… a clear, monotonic, player-legible signal"* and shows band=COOLING at every step. But tracing `band()` (`m1c_rmf_sim.py:90-101`): `COOLING` fires the instant `M < COOLING_M_MAX(0.0)` **regardless of F**. Film 1 alone already has `M=-7.66` (mediocre quality alone, `Q=0.436<0.5`, pushes the ledger negative), so the band is COOLING from the very first release — the same COOLING label M1b's Case D reaches only at week 80, *purely from F crossing 60 while M stays flat and positive the whole time* (M1b's own explicit, stronger demonstration of "Fatigue — not Momentum — is doing the work," which is the case's literal ask). M1c's Case D table is not wrong in isolated numbers, but its own claim that this run demonstrates "Fatigue becomes visibly important" is not actually isolable from ordinary negative-Momentum COOLING in its own band function — the case does not cleanly separate the two signals the way the case is designed to test, partly *because* the founding-film bug inflates F from turn one while M is independently already negative.

### 1.5 M1a — a more serious finding: Recognition's "shared StoryProperty root" claim is not what the reference implementation (or the worked Case F/G) actually shows

M1a's entire §1 rationale is built on a specific architectural claim: **R lives on the StoryProperty root, shared across every branch**; M and F live per-branch. The §1.1/§1.2 markdown tables are explicit and unambiguous: the `StoryProperty` table lists `R`, `rPeak`; the `Branch` table lists only `M`, `F`, `lastEventWeek`, `installments[]` — **no R field**. This split is cited as the mechanical answer to Direction H ("reboots restart continuity, keep StoryProperty recognition") and is defended at length in §1 with 04a/03e citations.

The reference implementation contradicts this. `m1a_three_meters.py`'s `class Branch` (`:83-94`) carries its **own** `R` and `RPeak` fields. In Case F/G, the reboot branches are constructed as `Branch("PropE-reboot-F", ..., R=e.R, RPeak=e.RPeak, ...)` (`:262,272`) — a **value copy** taken at fork time, not a live reference to a shared StoryProperty-level scalar. From that point forward the reboot branch's `R` and the old main branch `e`'s `R` evolve **completely independently**. The model's own §10 "Story-level isolation check" then reports this divergence as a *feature*: *"PropE-main at wk1040 (unchanged by either reboot): R=48.43… — untouched by either fork… Two rights-holders could run the successful reboot (F) and the failed one (G) as genuinely independent counterfactuals."*

But if R really were the shared, StoryProperty-level scalar §1.1 specifies, a successful reboot raising R to 65.01 (Case F) should be visible from **any** vantage on that same StoryProperty — including a query against the old main branch, or a second, later reboot attempt — not leave a stale 48.43 sitting on a different branch object of the same property forever. The demonstrated "isolation" is therefore evidence **against** what §1.1 promises, not for it: either the documented schema (R shared) is not what the worked cases actually implement, or the "untouched, isolated" framing in §10 is describing a violation of Direction H's own "keep StoryProperty recognition" requirement (a stale, out-of-date R visible from one branch after the property's real recognition has moved). This is not a rounding error — it is a genuine mismatch between what M1a's §1 argues for and what M1a's own worked Case F/G numbers demonstrate, on exactly the direction (H) the model's whole two-level split was designed to satisfy. A generous reading is that the *written* schema is the real proposal and the *script* took a shortcut that happens to falsify its own "isolation check" narrative; either way, this needs an explicit fix (a genuinely shared `storyPropertyId → R` lookup, read at query time by every branch) before this shape ships, and the report writer should not cite M1a's Case F/G "isolation" language as a demonstrated property of the shared-R design, because the numbers shown do not actually demonstrate that.

### 1.6 M1a — Case B does not actually model the spin-off it claims to

Re-reading `m1a_three_meters.py:213-224`: Case B applies exactly two events (Film 1, Film 2) to a **single** `Branch` object `b`, then calls `b.advance_weeks(40)` and `b.snapshot(...)` — no third event, no second `Branch` object, is ever created for the spin-off. The row labelled `"Spin-off greenlight eve (+40wk)"` in the printed table and in the .md's own Case B section is the **main branch's own continued state**, not a spin-off's. The .md prose (*"This spin-off is well-timed, not rushed"*, *"Rival's 3-line policy: rule 1 fires strongly (M=41)"*) narrates as if a spin-off's own type/similarity/outcome had been scored, but no spin-off input (similarity≈0.45, a SPIN_OFF continuation type) is ever fed to the model in this case at all. Compare M1b and M1c, both of which explicitly instantiate a second branch (`spin1` / a seeded `spin_ledger`) for the same case. This means M1a's Case B, as written, is silent on the one thing Direction J (SubProperty inheritance) and the 04a/04b spin-off evidence (Rogue One 62%, Solo 38%, Creed 2.4×) most directly bears on — a real coverage gap, not just a presentation nit.

### 1.7 Direction I (remake ≠ reboot) is only actually implemented by one of the three models

Direction I is explicit and non-reopenable: *"Remake vs Reboot are DISTINCT... Remake retells a specific earlier film (direct comparison matters). Reboot restarts continuity."* 04a §F / 04b §F both back this with a **specific-film comparison mechanism** (Never Say Never Again judged directly against Octopussy and the 1965 original and lost; Amazing Spider-Man 2012 punished for retelling a 10-year-old origin "too soon"; Bohnenkamp et al. 2015's finding that remake value is contingent on "the relationship between the original movie and the remake").

- **M1a**: `remake ≈ 0.65` is only a similarity-bucket value plugged into the *same* Recognition/Momentum/Fatigue formulas used for every other continuation type. No mechanic anywhere references *which specific prior film* is being remade, its age, or its own quality.
- **M1c**: `Remake | 0.60` — identically, only a similarity bucket feeding the same Fatigue-accrual formula. No specific-film comparison term exists anywhere in §0–§12.
- **M1b** (§6, the mirror-image treatment): implements a genuine, distinct `legacyComparisonPenalty = comparisonWeight · quality_ref · 2^(-age_ref/HL_M)` scoped to the **one specific prior `FilmResult`** being remade, using the *fast* half-life (HL_M, not HL_R) specifically so a remake of a still-fresh, beloved film pays hard and the same remake proposed decades later pays almost nothing — this is a direct, well-targeted mechanical translation of the NSNA/Octopussy and TASM-2012 evidence, and it is the only one of the three that actually satisfies Direction I as written rather than collapsing remake into "yet another sequel-shaped similarity bucket."

This is a genuine, evidence-backed differentiator that does not show up in any of the seven required cases (none of them exercises a REMAKE), but is directly discoverable by checking each model against Direction I and the cited evidence, which is the point of this lens.

---

## 2. Case-by-case fidelity table (A–G = the seven worked histories)

| Case | Owner requirement | M1a | M1b | M1c |
|---|---|---|---|---|
| A — breakout → fast sequel | fast follow-up rewarded, no penalty (Direction C/D) | PASS (verified) | PASS (verified) | PASS (verified) |
| B — two hits → spin-off 40wk later | must NOT be punished for speed; genuine spin-off modeled | PASS on "no penalty," **FAIL on coverage** — no spin-off branch/event is ever modeled (§1.6) | PASS on "no penalty" mechanically, **FLAW** — "greenlight eve" table computed 1 week after (i.e. AT) the spin-off's own release, leaking its outcome into a claimed pre-decision snapshot (§1.3) | PASS (verified) — genuine seeded spin-off ledger entry, no leak found |
| C — hit then flop | R stays high, M falls, salvageable | PASS (R −6.5%) | PASS (R −1.5%, strongest hold) | PASS but weakest hold (R −12.7%; see §1.5/Q-ratchet note below) |
| D — rapid mediocrity ×4 | Fatigue becomes visibly important, distinct from Momentum, no count penalty | PASS (clean ACTIVE→COOLING flip, F-driven at low M magnitude) | **PASS, best demonstration** — M stays ~flat/positive the whole run, band flips ACTIVE→COOLING purely because F crosses 60 | **FLAW** — COOLING from Film 1 onward because M<0 immediately; F's own contribution to the band is never isolated from Momentum the way the case asks (§1.4); F values inflated by the founding-film bug |
| E — 20yr dormancy | R decays slowly to a real-but-reduced value; M→0; F→0; REVIVAL CANDIDATE | PASS | PASS | PASS |
| F — successful reboot | new branch, no free R jump, real gain scored on its own merits | PASS on the branch's own numbers; **undermined by §1.5's R-sharing contradiction** at the property level | PASS (property-wide R correctly re-derived, reboot's own peak becomes new rank-1 term) | PASS |
| G — failed reboot | reboot is not a guaranteed cure; bad bets allowed; old branch untouched | PASS, but "untouched" claim is the same R-sharing issue as F (§1.5) | PASS | PASS |

**Case-failure summary (precise):**
- **M1a — Case B**: does not model the spin-off at all (no second branch, no spin-off event ever applied); the case's own narrative describes outcomes that were never computed. **M1a — Case F/G**: the "old branch untouched" claim is evidence of a Direction-H-relevant architecture bug (R implemented as a per-branch copy, not the StoryProperty-shared scalar §1.1 specifies), not a demonstrated feature.
- **M1b — Case B**: "greenlight eve" table is computed at the spin-off's own release week, not before it; the specific numbers cited in the prose (R=94.2, spin-off awareness 0.84) already assume the spin-off's own reception is known. Mechanically low-severity (doesn't flip the case's ACTIVE verdict) but is a real violation of Direction G's "no hidden future reception info" spirit in the model's own demonstration.
- **M1c — Cases A, B, C, D + spam mini-case**: founding/ORIGINAL releases silently accrue nonzero Fatigue via an undocumented default (missing `'original'` key in `SIMILARITY`, defaults to the highest bucket, 0.90). **Case D** additionally fails to isolate "Fatigue becomes visibly important" from ordinary negative-Momentum COOLING, which is the case's specific ask.

None of the three models violates a Direction outright at the level of "the band is wrong" or "a flop kills the franchise" — all three get the qualitative shape of all seven cases right. The findings above are about **whether the specific numbers shown actually follow from the stated rule and actually demonstrate what the prose claims**, which is exactly what re-running the arithmetic is for.

---

## 3. No double counting with P07/P14/P15

All three models are careful about the **formula** level (none re-derives box office, none adds a `StandingChangeSource`, none touches `computeStarPowerDelta`/`salaryCurve` directly — all route "higher expectations" through a single multiplier applied to `forecast.expectedTotal` before `fcMult`/`boxDelta` ever see it, per architecture §c.5/§d.4). All three honestly flag the resulting **compounding channel** (a hot Momentum reading raises both the awareness term feeding reach *and* the expectation multiplier feeding the bar a film is judged against) as intentional — this is literally what Direction B asks for, not a bug.

- **M1a** flags this once, cleanly (§11).
- **M1b** goes one step further and includes an actual arithmetic proof that the loop is *self-damping, not self-reinforcing* (§10/§11.2: a sequel that merely clears its own already-inflated bar contributes only ~20% of the original breakout's Momentum jolt) — this is the most rigorous treatment of the three and a good verification habit worth generalizing.
- **M1c** catches a *second*, distinct interaction the other two do not name: the awareness input (§6.1) is additive alongside the studio-level `Standing.audienceAwareness` that already reacts to reach/star, and flags that `preMarketingAwarenessOf`'s own clamp bounds the combined effect but that this is "plausible-but-untested," recommending a specific playtest (a top studio's #1 franchise at high Standing). This is the most thorough treatment of this dimension across the three.

No model duplicates a formula; all three legitimately reuse the same public signal for two purposes, and all three say so.

---

## 4. Exploit resistance

**Fast-sequel spam** — M1a argues qualitatively (Case B shows cadence costs nothing when quality holds, Case D shows repeated mediocrity is punished regardless of cadence) but never stress-tests an extended spam chain. M1b adds one worked arithmetic check (a hypothetical Film 2 that "just meets" its own raised bar nets only 20 out of the original's 92.5 Momentum). **M1c is the only one that actually ran a sustained numeric stress test** — 8 releases at 15-week cadence — showing F climbing unboundedly (21→39→56→74→92→109→127→144, no saturation on the raw debt) and *both* outputs P17 hands downstream (awareness `a`, expectation `E`) collapsing to their floors by the 5th release. This is the strongest, most concrete evidence of the three that "no per-count penalty" does not translate into "spam is free."

**Dormancy-as-free-reset** — all three give a structurally sound, non-hand-wavy argument (M1a: R decays toward a floor, M fully flatlines, nostalgia caps and saturates at the dormancy threshold; M1b: R only ever falls during dormancy and a fresh branch's clean M/F=0 slate was never gated on wait length in the first place; M1c: F pays itself down on an ordinary ~1–2yr clock regardless of dormancy length, and R only falls the longer you wait past that point). All three correctly reject "wait longer, get more." M1a additionally self-flags a real residual soft spot the other two don't name as sharply: the nostalgia bonus is a pure function of *current* R with no memory of *why* a property went dormant, so a franchise that quit on a low note gets the same eventual nostalgia bonus as one that quit at its peak (04b §E: Furiosa/Expend4bles did not benefit from dormancy) — flagged as an open tuning question, not fixed.

**Reboot-as-fatigue-cure** — all three correctly make this *not free* mechanically (a reboot still costs a full production; it does not reset the property's Recognition, only a branch's M/F). **M1c gives by far the sharpest, most honest self-diagnosis**: it runs the actual numbers (`ΔF=25.77` as a direct sequel vs `ΔF=10.02` as a reboot for the *identical* bad quality) and names this explicitly as "the weakest point of this shape," then proposes a precise, correctly-scoped fix (gate new reboot-*branch* creation on the current branch already being COOLING-or-worse — a Direction-N branch-governance rule, not a fatigue-formula patch). M1b names the same category of gap (capping reboot-branch spam per property) with equal precision. M1a does not discuss branch-spam-via-relabeling at all.

---

## 5. Save cost

All three are comfortably within budget and follow the additive-root/scalars-plus-id-lists law:

| Model | Typical franchise | Large/outlier franchise | Growth behavior |
|---|---|---|---|
| M1a | ~228 B | ~740 B (5 branches × 8 installments) | bounded — fixed-size scalars only |
| M1b | ~775 B | ~3.9 KB (MCU-scale, 35 installments) | **unbounded** — append-only installment list, self-flagged (§10.5) |
| M1c | ~450 B | ~1.3 KB (branched) | bounded — fixed-size scalars per branch |

M1b's shape is the only one whose per-franchise footprint grows without a ceiling over a multi-decade save (nothing prunes `installments[]`); the model is honest about this and proposes a non-blocking future prune, but as-specified it is the least bounded of the three. M1b also uniquely carries a real, self-flagged **per-tick compute cost** (Recognition/Momentum/Fatigue are O(installments) recomputed on every read, including every rival decision-tick under `HOLLYWOOD_DECISION_WEEKS=1`) that the other two avoid by storing the meters directly — a legitimate reason to require memoization before this shape ships, not present in M1a/M1c.

---

## 6. Rival compactness

All three attach at the identical seam (`hollywoodTick.ts` `decide()` step 2, `policy.version: 2`, `hollywoodValidation.ts` widening) with an essentially identical three-line policy shape (ACTIVE+positive-M → continue; DORMANT/REVIVAL+R-above-bar → reboot; else → fall through to the existing roulette). This is unsurprising — the brief specifies this seam directly — and none of the three adds a second forecast or a rival-only formula (Direction K satisfied by all three). The only material difference is M1b's rival read is O(installments) per query (the same recompute-cost caveat as §5), a minor real cost the other two do not pay since their rivals just read two or three stored scalars.

---

## 7. Scores (0–10 per dimension; total = sum, max 60)

| Dimension | M1a | M1b | M1c |
|---|---|---|---|
| Legibility (tooltip-predictable descriptor; two-speed idiom used) | 6.5 — scalar-only, no itemization; self-admits the `rPeak`-invisibility gap; does not differentiate DISPLAY idiom between R and M the way the evidence's ADOPT list asks for | 8.5 — every output is a literal per-installment sum, fully auditable for BOTH R and M, the strongest "show your work" of the three | 8.5 — most literal match to 03e §10.1/§12's own cited "most legible" idiom (durable level + itemized CK3-style ledger + a debt), self-admits the band-threshold-invisibility gap |
| Case fidelity (all 7 behave as required) | 6.0 — arithmetic exact where checked, but Case B never models the spin-off it claims to (§1.6), and Case F/G's "isolation" narrative contradicts §1.1's own shared-R architecture (§1.5) | 7.0 — one concrete, verified flaw (Case B's post-hoc/pre-decision leak, §1.3); otherwise exact; uniquely implements Direction I's remake-specific mechanic (§1.7) | 6.0 — a systemic, undocumented bug present in 5 of 7 test runs (founding films accrue Fatigue, §1.4); Case D doesn't isolate the signal it's meant to test; Recognition kernel has no peak/ratchet floor (structural gap vs. Direction Q, untested by the 7 cases but real) |
| No double counting w/ P07/P14/P15 | 7.5 — correct, flagged once | 8.0 — correct, plus a rigorous self-damping proof | 8.0 — correct, plus the only model to also flag the `Standing.audienceAwareness` interaction |
| Exploit resistance (spam / dormancy-reset / reboot-cure / spin-off laundering) | 7.5 — sound qualitative argument, no numeric spam stress test, no branch-spam governance discussion | 7.5 — sound, includes a small worked spam-damping check; correctly scoped branch-spam-governance flag | 8.5 — the only actual multi-release numeric spam stress test; sharpest, most actionable reboot-cure self-diagnosis and fix |
| Save cost | 9.0 — smallest, fully bounded | 7.0 — unbounded append-only growth + O(installments) recompute, both self-flagged as real | 8.5 — bounded, well-contextualized against the real 37.8 MB save overshoot |
| Rival compactness | 8.0 — identical 3-line shape, O(1) reads | 7.5 — identical shape, but O(installments) reads per rival tick (self-flagged) | 8.0 — identical 3-line shape, O(1) reads |
| **Total (/60)** | **44.5** | **45.5** | **47.5** |

---

## 8. Verdict

**Winner (this lens): M1c (Overexposure Debt + Heat Ledger).** It wins narrowly, on the strength of the most legible two-speed display idiom (the one the evidence corpus itself names as the genre's best), the most rigorous exploit self-testing (an actual sustained numeric spam stress test the other two only reason about qualitatively), and the sharpest, most actionable self-diagnosis of its own weakest point (reboot-as-cheap-fatigue-dodge, with a correctly-scoped fix tied to Direction N branch governance). It does **not** win cleanly — it carries a real, undocumented bug (founding films silently accrue Fatigue in every single one of its own worked cases) and a real structural gap (no peak/ratchet floor on Recognition) that must be fixed before this shape is adopted as-is. M1b is a close second and is the only one of the three that actually satisfies Direction I's remake-vs-reboot distinction as written; its one verified flaw (the Case B temporal leak) is more contained than M1c's founding-film bug (one case's narrative, not five). M1a is third: its core arithmetic is the most exactly reproducible of the three wherever I hand-checked it, but its Case B doesn't model what it claims to, and its worked Case F/G narrative actually undercuts the central architectural claim (shared, StoryProperty-level Recognition) that its own §1 is built around — a more structurally significant issue than either runner-up's flaw, even though it never produces a visibly "wrong" descriptor band in the seven cases as given.

**Required fixes before M1c ships as the base shape (not optional grafts — correctness fixes):**
1. Add an explicit `'original'` (and, for symmetry, a `'reboot'`-founding-film) case to the Fatigue-accrual path so a branch's founding release never accrues Fatigue against a similarity bucket that presumes a predecessor exists (mirror M1a §2 / M1b's `branch_rows[1:]` exclusion exactly).
2. Give Recognition a peak/ratchet anchor — grafted from M1a (§4's `rPeak` + `floor = 0.35·rPeak`) or M1b (§3.1's max-based rank-1 peak term, undiluted by anything lower-scoring that comes after it) — so a franchise's defining hit cannot, in principle, be eroded away by an arbitrarily long run of subsequent mediocre releases. M1c's current asymmetric target-seeking rule (rise fast / fall slow) is *directionally* right but has no permanent floor tied to the property's own history the way Direction Q's "older defining hits retain long-term Recognition" implies and the other two models both explicitly built in.

**Ideas to graft from the runners-up regardless of which base shape ships:**
- **From M1b**: the distinct `legacyComparisonPenalty` mechanic for REMAKE (§6) — scoped to one specific prior `FilmResult`, using the fast half-life so recency of the referenced film (not the franchise's aggregate state) drives the comparison pressure. This is the only implementation of Direction I found across all three candidates and should be added to whichever base shape is carried forward.
- **From M1b**: the full per-installment tooltip decomposition for *both* Recognition and Momentum (a literal, uncapped sum of named per-film terms) as the UI-facing "why is this number what it is" reference, complementing (not necessarily replacing) M1c's ≤4-entry ledger where a bounded, always-fresh display list is preferred.
- **From M1b**: the "prove the loop is self-damping, not self-reinforcing" verification habit (§10/§11.2) — a good practice for the report writer to require of whichever model's expectation-multiplier constants get tuned next.
- **From M1a**: the tight, explicit three-point structure of §7's "dormancy is neutral-to-costly, never strictly better" argument, as a template for how this claim should be written up regardless of which formula shape underlies it.
- **From M1a**: fix and then reuse the *intended* shared-StoryProperty-Recognition architecture (§1.1's schema, not §10's script) — a genuinely shared R read at query time, not a per-branch copy — as the correct pattern for Direction H compliance; this is a correction to M1a itself, but the *documented* (not implemented) shape is worth preserving as the target architecture regardless of which model's meters end up living inside it.

---

## 9. Open items for the report writer

- M1c's founding-film Fatigue bug and Recognition-ratchet gap are fix-before-ship items, not tuning nits — flag them as blocking for M1c specifically if M1c (or a hybrid built on it) is carried forward.
- M1a's Case F/G "isolation" claim should not be cited in the final report as demonstrated evidence that shared Recognition works correctly across branches — it currently demonstrates the opposite of what §1.1 promises.
- M1b's unbounded installment-list growth and O(installments) per-tick recompute cost should be resolved (a documented prune-and-memoize plan, not just a noted future concern) before any "derived, zero-mutable-meters" shape is treated as final.
- None of the three candidates' seven required cases exercises a REMAKE continuation type at all — worth adding an eighth worked case (a remake, at two different referenced-film ages) to the next modeling pass, since it is the one Owner-approved continuation type (Direction A/I) with zero worked-case coverage across all three models.
