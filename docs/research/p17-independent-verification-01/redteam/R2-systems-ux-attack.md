> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`R3-reviewer-corrections-calc.py`](R3-reviewer-corrections-calc.py), committed output [`R3-output.txt`](R3-output.txt) — **the report governs.** Superseded here: an attack on the PRE-correction synthesis; its findings (reboot F = 0, free type label, cameo tie-break, cross-model contradictions) were adopted as C3–C7 and its verdicts are superseded by report §16.

# R2 — Systems-Correctness & Bad-UX Adversarial Attack on P17 Franchise Design

Read-only review. No repository edits, no branches, no builds, no runtime. Scope: `CONTEXT.md`,
`MODEL-BRIEF.md`, all files in `models/` (M1a/M1b/M1c, M1j/M1k judges, `M1-final-synthesis-calc.py`;
no `M1-RMF-SYNTHESIS.md` or M7 exist — verified by `ls`), `M2`–`M6`, and evidence files
`../evidence/02-project-studio-architecture-READONLY.md`, `03a`, `03b`, `03c`, `03d`, `03e`, `04a`,
`04b`. Owner-selected directions A–U (CONTEXT.md) are treated as fixed; nothing below argues to reopen
them. One companion script already present in this folder, `redteam/R1_verify.py` (evidently another
reviewer's paper-arithmetic pass, reusing `models/M1-final-synthesis-calc.py`'s own classes), was found,
read, and **independently re-executed by this reviewer** (`python3 R1_verify.py`) to confirm its outputs
before citing them; its numbers are corroborated below and credited as R1's script but independently
verified by R2. Its own findings and this reviewer's own independent runs agree.

All severities: **BLOCKER** (breaks a design law, produces an unbounded/exploitable/desyncing outcome,
or contradicts an Owner direction in effect), **MAJOR** (a real, evidenced correctness or legibility
defect that will misbehave or confuse in ordinary play), **MINOR** (a real but narrow or easily-patched
gap, or a documentation/consistency nit).

---

## AXIS A — STATE ROT / DETERMINISM

### A1. [BLOCKER] Recognition's peak-anchored kernel ratchets to its ceiling under pure, never-a-hit mediocrity — verified by direct execution

**Claim under test:** M1b's peak-anchored Recognition kernel (adopted verbatim as the R-kernel of the
"winning" core model, `models/M1-final-synthesis-calc.py:88-124`, `Property.register_release`/`R_raw`)
was judged by both M1j and M1k as the standout implementation of Direction Q ("no full lifetime
average... a franchise's single defining hit decays on its own clock, undiluted by whatever mediocre
films came after it" — M1b-rmf-derived-kernels.md §3.1). M1j (`M1j-judge-legibility.md` §2.2) and M1k
(`M1k-judge-systems.md` §1) both independently hand-verified M1b's Case D arithmetic (R climbing
52.1→59.6→66.8→73.7 across four *sub-forecast, 0.9×-of-expected* mediocre releases) and treated this
climb as an unremarkable side-effect; neither judge scrutinized **why** R rises at all under four
releases that never beat their own forecast, and neither extended the case past four releases.

**What re-execution shows.** `redteam/R1_verify.py` (which I re-ran myself against
`models/M1-final-synthesis-calc.py` unmodified) extends the identical mediocre-spam scenario (critic 57,
audience 55, box office pinned at 0.9× forecast forever — i.e. **every single release is a forecast
miss, none is ever a hit**) to 20 releases at three cadences (8/15/40 weeks). Verified output:

```
cadence=15wk: release#1 R=52.14 -> release#5 R=82.20 -> release#8 R=100.00 (CEILING) -> release#20 R=100.00 (still pinned)
cadence=40wk: release#1 R=52.14 -> release#5 R=80.29 -> release#12 R=100.00 (CEILING) -> release#20 R=100.00 (still pinned)
```

Root cause, isolated in the same script and confirmed by reading `register_release`/`R_raw` directly
(`M1-final-synthesis-calc.py:98-119`): the "peak" comparison at registration time computes
`score = raw · 2^(+now_week/HL_R)` — an **inflation**, not a decay — then a *later* read decays the
stored value back down by `2^(-now_week/HL_R)`. For a single release evaluated at its own moment this
round-trips correctly (`raw·2^(t/HL_R)·2^(-t/HL_R) = raw`), but it means two releases of **identical**
raw quality registered at different weeks are compared unfairly: the later one's inflation exponent is
always larger, so **a later release of literally identical quality always "outbids" an earlier one and
dethrones it as the property's `bestScore`**, permanently banking the dethroned peak into
`residualScoreSum` at weight `κ_R=0.15` (verified: `bestScore` and `residualScoreSum` both grow every
single release in the isolation trace, even though the underlying `reach·quality` value is held exactly
constant at ~0.521 throughout). This is the literal mechanism by which unbroken mediocrity ratchets R to
its hard ceiling (100) purely by outlasting itself — not by ever producing a hit.

This is precisely the failure mode Direction Q is written to forbid ("no full lifetime average") and the
literal failure mode MGT2's own player base independently discovered and named: *"at some point, you
will get 5.0 IP forever anyway"* (`03b-comparators-mad-games-tycoon.md:193`, Sol, COMMUNITY, HIGH — the
evidence file this whole model batch cites approvingly elsewhere as validation of the Owner's three-factor
design, `M3-...md` §4, `05` throughout). The seven canonical worked cases in M1a/M1b/M1c never exceed four
releases, so this ratchet is invisible in every case that was actually judged; it only appears once a
run is extended past ~5-8 releases, which no model author or judge did for Recognition specifically (M1c
did stress-test Fatigue to 8 releases, §"Exploit surface"; nobody ran the equivalent test on Recognition).

**Compounding note (kappa sensitivity, same script):** lowering `κ_R` from 0.15 to 0.05 delays but does
not prevent the ceiling (R=78.22 vs 100.00 after 12 releases at the same cadence) — the ratchet mechanism
itself, not merely the residual weight, is the defect; a constant retune alone will not fix it.

**Smallest correction:** compare peak candidates at a **common reference time** (e.g. always decay both
the incumbent and the challenger to `now` before comparing, rather than inflating the challenger forward)
so that "is this installment a new all-time high" is judged on quality/reach, never on which one happened
more recently. This is a one-line fix to the comparison, not a redesign of the peak-anchoring idea, and
it should be re-verified with the exact 20-release stress test above before this kernel ships.

---

### A2. [BLOCKER] Reboot Fatigue-inheritance is specified three incompatible ways, and the code that would actually ship implements the fourth (zero) — the "reboot-as-fatigue-cure" exploit is open, not closed

Four irreconcilable positions exist simultaneously in this batch on "how much of a branch's Fatigue
survives into a brand-new reboot/spin-off branch":

1. **M3 §3.2** (the model that explicitly owns Remake/Reboot mechanics, `M3-...md` header "Scope
   boundary"): *"Fatigue does NOT reset to neutral outright... `F₀(new reboot branch) = γ(0.2) ×
   weighted-average(F at end of every prior branch of this StoryProperty, each individually decayed...)`"*
   — a deliberate, evidence-grounded **partial inheritance** (γ=0.2), justified at length against the
   Terminator Salvation/Genisys/Dark Fate pattern (`M3-...md` §3.2, `04b:§1.4`): *"a pattern of weak
   branches compounds... Dark Fate's starting F floor is already elevated before its own reception even
   lands."*
2. **M4 §A.4**: `F_sp(t0) = FATIGUE_INHERIT_FRACTION(0.5) · F_parent(t0)` for a **spin-off** SubProperty
   — a different partial-inheritance fraction (0.5, not 0.2) for a structurally analogous "new branch
   forks off an existing one" event, with no cross-reference to M3's γ or any stated reason the two
   fractions should differ 2.5×.
3. **M1a/M1b/M1c** (the three RMF core candidates) each implement Fatigue as **branch-scoped state that
   starts empty by construction** the moment a new `Branch` object is created — i.e. **zero inheritance**
   — confirmed explicitly in M1b's own prose (`M1b-...md` §6: *"A branch's own Momentum/Fatigue reset the
   instant a new branch opens... on day one of dormancy just as much as on day 7300"*) and M1c's own
   self-critique naming this as the model's *"weakest point"* (`M1c-...md` "Exploit surface": *"rebooting
   is mechanically the cheapest way to keep releasing into a franchise while accruing the least debt"*).
4. **The actual code that would ship** — `models/M1-final-synthesis-calc.py`, the file explicitly built to
   be *"the FINAL recommended RMF model"* incorporating *"the grafts specified by both judges"* (file
   header) — contains **no cross-branch Fatigue-seeding call anywhere**. Re-executed directly
   (`redteam/R1_verify.py`, "ATTACK 9/10", reproduced by me): a main branch hammered to `F=158.57`
   (COOLING) by six rapid mediocre sequels, then a brand-new reboot branch opened **the same week, zero
   elapsed dormancy**, reads `F=0.00` on its very first query. `Branch.__init__`
   (`M1-final-synthesis-calc.py:126-140`) hardcodes `self.F = 0.0` unconditionally for every new branch
   regardless of type or parent; `release()` never reads a parent branch's state.

So: the model that **owns** reboot mechanics (M3) explicitly rejected free fatigue resets and built a
named formula to prevent it, citing real evidence; the model that would actually **execute** at runtime
(the final-synthesis core, selected via the judges' own process) implements exactly the free reset M3
built γ=0.2 to prevent, with **zero** partial carryover — and neither M1j nor M1k's judging pass (which
predates the final-synthesis file) evaluated the synthesis script against M3's reboot rule at all, since
their mandate was M1a vs M1b vs M1c, not the cross-file integration. This is the single most
concretely-exploitable gap in the whole batch: a studio (player or, per §F below, potentially a rival)
facing a COOLING/high-Fatigue main branch can open a new "reboot" branch — bounded only by
`N_MAX_BRANCHES=8` lifetime (`M3-...md` §2.3) and the cost of an actual production — and receive a
complete, free Fatigue reset with **Recognition fully preserved** (Recognition is correctly property-wide
and untouched by branch creation in every model). Direction H's own rationale for reboots ("useful when
continuity stale/damaged/dormant/confusing") does not require this to be *free*; nothing in the batch
proposes charging it.

**M3's own reboot legality row does not adopt the fix its sibling models proposed.** M1c's self-critique,
independently affirmed by both judges (M1j §9 grafts list item 5; M1k §8 "required fixes" item — actually
proposed as a *governance* fix, not a formula fix), explicitly recommends: *"a new reboot branch requires
the CURRENT branch to already be COOLING or worse"* as the smallest correction. M3's own legality matrix
(`M3-...md` §9, Reboot row) requires only *"none on any specific film — only requires ≥1 prior branch
already exists for this StoryProperty"* — **no band-based gate at all**. The proposed fix from three
separate documents was never plumbed into the one document that actually defines reboot legality.

**Tension worth naming precisely, not resolving unilaterally here:** gating reboot-branch creation on the
current branch's band being COOLING-or-worse sits in mild tension with M3's own aside two sections
earlier — *"Bond: 1 continuity across 60+ years, arguably 2 if Craig's run counts as a soft reboot"*
(`M3-...md` §2.3) — where the real-world analogue was **not** obviously a damaged/COOLING franchise at
the moment of its own "reboot." A hard band-gate would make a legitimate creative reboot of a
merely-fine (not COOLING) property illegal, which direction D's "no hard cooldown, bounded continuous"
spirit would resist as much as it resists the Fatigue-laundering exploit itself.

**Smallest correction:** do not add a legality gate (avoid trading one hard-cliff problem for another).
Instead, require whichever RMF core ships to implement **one of** the two already-designed partial-
inheritance formulas (M3's γ=0.2 weighted-average for reboots; M4's 0.5 fraction for spin-offs — pick one
canonical value per branch-creation *type*, since M3 and M4 already independently argue for two different,
evidenced fractions for two different situations, and reconcile them explicitly rather than silently), and
make the inherited seed **scale with how healthy the old branch currently is**, not fixed regardless of
it — a reboot of an already-ACTIVE, low-Fatigue branch should seed near-zero new-branch Fatigue anyway (it
had little to launder), while a reboot of a COOLING/DORMANT high-Fatigue branch pays the real γ-weighted
cost M3 designed. This closes the exploit through the meter itself rather than through a new hard gate,
and requires no change to Direction E/H.

---

### A3. [MAJOR] M1c's own stored schema contradicts its own worked examples on where Recognition lives — a second, previously-uncaught R-sharing desync (parallel to the M1a bug the judges already found)

M1k (`M1k-judge-systems.md` §1.5) found and documented in detail that M1a's *documented* schema places
Recognition on a shared StoryProperty root, but M1a's own reference script implements it as a per-branch
**copy** that silently diverges after a fork — flagged clearly, "needs an explicit fix... before this
shape ships."

**A parallel, second instance exists in M1c that neither judge caught.** M1c's own stored-schema section
is explicit: *"each branch... and each SubProperty... carries **its own copy** of this same triple,
because Recognition/Momentum/Fatigue for 'the Bond films' and 'a Bond spin-off' are not the same
numbers"* (`M1c-rmf-debt-ledger.md` §1), and the `BranchState` type shown there stores
`recognition: number` **per branch**, not on a separate property-level root at all — there is no
`FranchiseState`-level Recognition field in M1c's own type shown in §1 (`FranchiseState` there carries
only `storyPropertyId`, `rightsOwnerRef`, `branches[]`). This directly contradicts Direction H ("reboots
restart continuity, **keep StoryProperty recognition**") — if R is genuinely a separate scalar per
`BranchState`, a brand-new reboot `BranchState` needs an explicit seeding rule for its **own** `recognition`
field, and **no such rule is given anywhere in M1c's §0–§12.**

Yet M1c's own worked Case F/G narrative treats R as a single, continuously-decaying, shared value that
simply carries across the branch boundary with no seeding step: *"R keeps decaying the entire time, on
its own 15-year-half-life clock (§2.2/§3)... Case F and Case G start from the identical pre-release
state... R=35.72"* (`M1c-...md` §7-8.6) — i.e. the prose assumes property-wide sharing exactly like M1b
and M3, while the stored-schema section defines per-branch storage with an unstated inheritance rule. If
implemented literally per §1's schema, a new reboot branch's own `recognition` field would need some
undefined default (0? a copy taken at fork time, which is exactly the bug M1k found in M1a?) — this is
the same desync class the task explicitly asks about ("the derived-vs-stored R/M/F choice... which one can
desync after migration"), independently reproduced in a second candidate model.

**Smallest correction:** M1c's charter should state explicitly (as M3 and M1b do) that Recognition is a
single StoryProperty-level scalar, not a `BranchState` field, and its type definition in §1 should be
corrected to match; this is a documentation/schema fix, not a formula change, since M1c's own worked
numbers already assume the corrected (shared) behavior.

---

### A4. [MAJOR] No model specifies what happens to an in-flight (locked, unreleased) Production when its StoryProperty's rights are sold mid-production

M3 §1.3/§5 correctly design "current rights owner" as a live, uncached P16 lookup (a genuinely good
fix to Direction M's literal field list — no stale owner reference is possible for **future**
greenlights). But no model — M3, M4, or M5 — states what happens to a **Production that is already
locked** (greenlit, `forecastSnapshot` frozen, not yet released) under owner A, if P16 records a rights
sale to owner B before that Production wraps and releases. Candidate resolutions not adjudicated
anywhere in the batch: (a) the in-flight Production completes and releases under the studio that
greenlit it regardless of the sale (rights only govern *future* greenlights); (b) the sale is blocked or
deferred while a Production is in flight; (c) the buyer inherits the in-flight Production. Direction L
("current rights owner controls future continuations; no historical rewrite") reads most naturally as
(a), but this is inference, not a stated rule, and the legality matrix in M3 §9 checks rights only "at
the moment of greenlight," leaving the in-flight case genuinely open. This is a real state-integrity gap
(a Production with no live rights-owner check for its whole lifetime is exactly the kind of "dangling
reference" axis A asks about) that should be closed by an explicit one-line rule before P16 ships, not
discovered as an edge case in production.

**Smallest correction:** state explicitly (most likely in the P16 charter, not P17's) that rights
apply only at greenlight time for a given Production; an in-flight Production's completion and release
are unaffected by a subsequent rights transfer, exactly mirroring the existing house rule that a locked
`forecastSnapshot` is never retroactively touched (evidence §d.3).

---

### A5. Verified-adequate (no finding) — Save-As identity collision, projection growth, milestone-label creep

M3 §10 items 3-5 (monotonic per-root ordinal counters for `branchId`/`franchiseId`; append-only,
non-pruned but small history lists; a closed, versioned `MilestoneId` enum rather than free text) are
sound, specific, and directly answer the task's Save-As/re-mint concern. Credited as adequately covered;
no correction proposed.

---

## AXIS B — DOUBLE COUNTING

### B1. [BLOCKER] M2 explicitly disclaims ownership of the R/M/F-derived seam formulas, then ships its own competing, numerically incompatible pair anyway

M2's own scope statement (`M2-expectations-model.md` §10, open question 4): *"This model does not
specify the full Recognition/Momentum/Fatigue accrual formulas themselves... it only specifies **where**
the two locked scalars (Seams A/B) come from."* Yet M2 §1.1/§1.2 does not stop at specifying *where* —
it publishes **complete, numbered formulas** for both scalars:

```
Seam A (M2 §1.1):  inheritedAwareness01 = clamp(0.25·recognition01 + 0.10·max(0,momentum01), 0, 0.35)
Seam B (M2 §1.2):  expectationMult      = clamp(1 + 0.6·recognition01 + 0.4·max(0,momentum01), 1.0, 1.6)
```

These are **mechanically different**, not just differently-tuned, from every RMF candidate's own §6
outputs and from the actual final-synthesis code:

- **Seam A is a floor-raise (M2), not an additive term (everyone else).** M2 §1.1 is explicit: *"a
  bounded floor raise on `appealReach`... not a ceiling raise"* — capped at 0.35 absolute. M1a/M1b/M1c's
  `awarenessInput`/`aware` outputs (§6.1 in each) and the final synthesis's `awareness` function
  (`M1-final-synthesis-calc.py:224`) are **additive** optional-field inputs following the
  `setUplift`/`setNovelty` precedent (`reception.ts:87-103`), ranging the *full* 0..1, with no 0.35 cap.
  These are two different mechanisms (a `max()`-style floor vs. a `+` term), not two tunings of the same
  formula — implementing both, or picking the wrong one, changes runtime behavior qualitatively, not just
  quantitatively. **This is the precise contradiction the task names** ("M2's 0.35 awareness cap vs
  M1b's `awarenessInput` formula").
- **Seam B has no Fatigue term in M2 at all, and a different floor.** M2 §1.2's `expectationMult` reads
  only `recognition01`/`momentum01`, floored at **1.0** (M2's own words: *"a dormant/damaged property...
  gets a bar near 1.0×, no penalty for being a franchise, no bonus for being forgotten"*). Every RMF
  candidate's own expectation-multiplier output (M1a §6.2, M1b §5b, M1c §6.2) and the final synthesis
  (`EXP_LO=0.7`, `M1-final-synthesis-calc.py:51`) let the bar fall **below** 1.0 — down to 0.6-0.7 — for a
  fatigued/cooling property, i.e. a struggling franchise can be judged by an *easier* bar than an original
  film would face under the RMF-family design, and by *exactly the same* bar under M2's design. Verified
  numerically (re-executed, `redteam/R1_verify.py` bottom section): at `R=0,M=0,F=0`, M1a's own centered
  form gives 0.700 (a discount vs. an implicit 1.0 non-franchise baseline) while M1b/M1c/final give exactly
  1.000 (no discount) — a genuine, previously-undocumented disagreement even *within* the RMF family, on
  top of M2's separate, no-Fatigue-term design.

This is not a case of "several models proposed slightly different constants for the same function" — it
is **at least three functionally distinct designs** (M2's floor-raise/no-F/floor-1.0; the RMF-family's
additive/with-F/floor-0.6-0.7; and M5's further multiplicative discount layered on top of whichever base
value ships, B3 below) for what design law #2 requires to be **one** seam. Whichever pair an implementer
picks, the *other* document's entire worked-numbers section (M2 §7's Case C/G arithmetic, all keyed to
M2's own Seam A/B values) becomes dead prose that does not describe what actually ships.

**Smallest correction:** M2 should be revised to genuinely stop at "where," deferring the Seam A/B
formula bodies entirely to whichever RMF core model is adopted (per its own stated scope), and its worked
Case C/G numbers should be recomputed against that model's actual `awareness`/`expect` outputs rather than
M2's own competing constants — otherwise the report's own recommended core model and its own Expectations
model describe two different games.

---

### B2. [MAJOR] Fatigue has zero effect on the box-office-facing awareness channel in the model that would actually ship — verified by direct execution, and inconsistent with two of the three original RMF candidates' own stated design

Re-executed directly (`redteam/R1_verify.py`, "ATTACK 1/9 compound," confirmed by reading
`M1-final-synthesis-calc.py:221-226` `outputs()`): forcing `branch.F` from 0 to 500 while holding R and M
fixed leaves `aware` **bit-for-bit identical** (0.4191 at every F value) — only `exp` (the expectation
bar) moves. The final synthesis's `awareness` formula (`AWARE_WR·R/100 + AWARE_WM·max(M,0)/100`, no F
term at all) is a direct, faithful copy of **M1b's** design choice, and M1b is explicit that this is
deliberate: *"Only positive Momentum adds to awareness; a franchise on a downswing does not get its
public awareness suppressed through this channel... The downside of a downswing is expressed entirely
through (b) [the expectation multiplier], never here"* (`M1b-...md` §5a).

But this is **not** what the other two original candidates designed, and the disagreement was never
adjudicated by either judge (both judges scored legibility/case-fidelity/exploit-resistance, not this
specific channel-assignment question):

- **M1a**: `awarenessInput = clamp(0.5·R/100 + 0.3·M/100 **− 0.35·F/100** + nostalgia, 0, 1)` — Fatigue
  directly suppresses the box-office-facing term (§6.1).
- **M1c**: `fatigueDamp = clamp(1 − 0.5·clamp(F/100,0,1), 0.5, 1)`, multiplied into the awareness output
  — Fatigue can cut awareness by up to 50% (§6.1).

Whether an overexposed franchise should draw **fewer real ticket-buyers** (M1a/M1c's position) or only
**face a harsher narrative/fame judgment while its raw box office is unaffected** (M1b/final's position,
which is what would actually ship) is a genuine, consequential design fork that nobody flagged as a fork
— both are individually defensible, but they produce meaningfully different gameplay (under the
model that ships, a maximally-fatigued franchise draws exactly the audience its Recognition/Momentum
would predict on their own; Fatigue only ever makes it *look* like a miss after the fact, never actually
suppresses the turnout). Given Direction C's plain language ("repeated mediocre output raises
[Fatigue]... failures reduce [excitement]"), a reading in which Fatigue never touches the thing players
most concretely experience (how well the next film actually opens) risks reading as toothless — "why
does Fatigue matter if it doesn't cost me box office" is a legitimate, foreseeable player question.

**Smallest correction:** decide this explicitly in the P17 charter rather than by default inheritance
from whichever candidate's awareness formula was copied verbatim; if the intent is Direction C's plainer
reading, port M1c's bounded `fatigueDamp` term (capped at 50%, never fully zeroing awareness) into the
adopted core model — a one-line addition, not a redesign.

---

### B3. [MAJOR] M5's cast-continuity discount is layered onto "the same optional field" as M2's and the RMF family's awareness/expectation outputs with no stated composition rule, and its own worked example uses a *third*, incompatible expectation formula

M5 §1.4 defines `InheritedAwarenessInput multiplier = 0.75 + 0.25×ContinuityCredit`, stated to feed
**both** the release-time `ReceptionInputs` seam and the greenlight-time forecast seam (§1.4's own table,
both rows). Nowhere does M5 specify whether this multiplies M2's `inheritedAwareness01`/`expectationMult`,
the RMF family's `awarenessInput`/`expectMult`, or some third, not-yet-defined base value — the composition
order (discount-then-clamp vs. clamp-then-discount) and which base function it multiplies are both
unstated, and B1 above already shows those base functions are themselves unreconciled across models.

Separately, M5's own worked example in §3.3 uses **yet a fourth formula** for the same conceptual
quantity: `Inherited multiplier at greenlight = 1.0 + 0.004·M − 0.002·F` — no Recognition term at all, and
coefficients matching neither M2's, nor any of M1a/M1b/M1c/final's. This is presented as if it were the
already-agreed expectation multiplier, when it is in fact a fifth, ad hoc, internally-inconsistent
placeholder never reconciled with M5's own §1.4 formula three sections earlier in the same file.

**Smallest correction:** M5 should state explicitly which package's canonical `awarenessInput`/
`expectMult` output it multiplies `ContinuityCredit`'s 0.75–1.0 factor into (recommend: whichever single
core model B1 above resolves the batch onto), delete its own §3.3 placeholder formula, and re-derive that
worked example against the real function once chosen.

---

### B4. Verified-clean — the single-hit/single-flop trace, per-channel

Tracing one hit and one flop through every channel M2's own audit table names (`M2-...md` §5) against
what M1/M3/M4/M5 actually build: **Opening, Legs, Awareness Standing, Fame, and Forecast** are each
entered exactly once, by exactly one seam, consistent across every model that touches them — no model
proposes a second `StandingChangeSource`, a second box-office formula, or a duplicated `fcMult`. The one
precision catch worth naming: **M1a's own §6.2 prose is ambiguous about whether `expectMult` scales
`expectedCriticScore` as well as `expectedTotal`/`expectedOpening`** (it says the multiplier is "applied...
at the point `FilmResult.forecast` is populated," and all three fields populate together at
`tick.ts:594-604`, without excluding the critic-score field) — whereas **M1b and M1c are both explicit**
that only `expectedTotal` is touched (M1b §5b: *"feeds... `expectedTotal`"*; M1c §6.2: *"raises the locked
`expectedTotal`"*), matching M2's explicit, carefully-argued rule that Direction B's "no automatic sequel
quality bonus" means `expectedCriticScore` must never be touched by any P17 input (M2 §1.2, §5 "Critic"
row). Since M1a was not the model the judges or the final synthesis carried forward, this is a MINOR,
narrow finding (M1a-specific drafting imprecision, already correctly avoided by the model that actually
ships) rather than a live double-count — flagged so the report does not accidentally resurrect M1a's
looser phrasing if any of its language is reused.

---

## AXIS C — INFORMATION LAW

### C1. Verified-clean — no hidden-reception leak found through any read model, band, or rival projection

Checked directly against architecture facts: `FilmResult` is constructed only at release
(`buildFilmResult`, `tick.ts:594-606`; evidence §a.1/§d.3) — there is no pre-release object for any P17
seam to leak from. The public projection (`bridge/industry.ts`, evidence §f.2) exposes only released
films' facts. Every model's descriptor band (M1a §5, M1b §4, M1c §5, M3 §6, M5 §3.5's risk descriptor)
is a pure function of **already-public** R/M/F plus elapsed weeks — none reads or infers an unreleased
`FilmResult`. M5 §3.2's "read inherited awareness live at release, not at greenlight" design was checked
specifically for a Direction-G violation and found sound: the live read only ever fires at a film's *own*
release, which cannot precede knowledge of its own inputs. M1a/M1c's Case F/G worked pairs correctly share
an identical pre-release state before diverging on outcome (Direction G's "no hidden future reception,
equivalent bets"), confirming the design intent is implemented correctly in every candidate checked.
"ACTIVE AGAIN" and the risk-descriptor bands were checked explicitly and reveal only already-computed,
already-public R/M/F/elapsed-time facts — no case was found where a band or descriptor telegraphs an
outcome before the event that produces it. **No BLOCKER or MAJOR finding on this axis.**

### C2. [MINOR] Display-order legibility risk for an early-greenlit continuation that releases before its own predecessor

Direction G explicitly permits greenlighting a continuation before its predecessor releases. No model
discusses the (mechanically possible, given differing production lengths) case where the **continuation
actually releases first** — e.g. a short-production spin-off greenlit early against a long-production
predecessor. M3 §2.2's indented-list UI ("Film 1 (origin) / Film 2 — sequel / Film 3 — sequel") implies
release-chronological ordering; if a declared "sequel" appears in that list **before** the film it is a
sequel to (because it released first), the UI would show a child above its own parent, which is confusing
even though nothing about the underlying data is wrong (this is a display-ordering gap, not an
information leak). **Smallest correction:** order the tree by greenlight order or by declared lineage
edge, not literal release date, so a fast-tracked continuation never displays above its own predecessor.

---

## AXIS D — LEGIBILITY / BAD UX

### D1. [MAJOR] The cross-model tally of "numbers a player must hold in their head at greenlight" is never done by any single model, and comfortably exceeds ~5 once every model's own self-critique recommendation is honored

No single model proposes an excessive card in isolation — each one's own greenlight card (M2 §6, M4 Part
D, M5 §1.5/§3.5, M1a/M1c's self-critiques) looks reasonable read alone. But every model's own *stated*
legibility fix, taken together as the report must, stacks onto one greenlight decision for an ordinary
direct-sequel continuation:

1. Descriptor band (ACTIVE/COOLING/…) — categorical, every model.
2. Raw Recognition (R) — M1c explicitly recommends showing the raw number, not just the band (§11: "show
   distance-to-next-band"); M1a's self-critique independently concludes the same is *necessary*: "a
   player who doesn't know `rPeak` exists has no way to predict why an 85-quality reboot only added 16.6
   points... recommend exposing `rPeak`... alongside R" (`M1a-...md` §11).
3. `rPeak`/decay-floor context (M1a §11, as above) — a **second** Recognition-adjacent number.
4. Raw Momentum (M) — needed to explain the band per M1b/M1c's own itemized-ledger recommendation
   (M1j §4: "the itemised CK3-style ledger is literally the idiom the comparator evidence names as
   best-in-class").
5. Raw Fatigue (F) — same source; M1c's self-critique explicitly: "the band thresholds themselves are
   invisible... show distance-to-next-band, not just the current band" (§11).
6. Distance-to-next-band / weeks-to-dormant (M1c §11's own explicit recommended addition, "F needs to
   drop by 37 more... in 64 more weeks, dormant").
7. Inherited-awareness bonus, as a percentage (M2 §6's card, "Opening floor: +X%").
8. Expectation-bar increase, as a percentage (M2 §6's card, "Expected gross bar: +Y%" — a **different**
   number from #7, both derived from the same underlying R/M state but shown as two separate lines).
9. Cast-continuity discount, if the cast changed (M5 §1.5's worked "≈13% discount" line) — a **ninth**
   number specific to recast decisions.
10. The three *pre-existing*, non-P17 base forecast numbers the multiplier is applied to
    (`expectedTotal`, `expectedCriticScore`, `expectedOpening` — already shown today, per architecture
    §d.3) are still on the same screen and now have a franchise multiplier layered on top of them,
    meaning the player is reconciling "the base number" against "the franchise-adjusted number" for at
    least the box-office lines.

No model does this tally; each treats its own added number as the one missing piece. Read together, a
franchise greenlight screen risks 7-10+ distinct values (well past axis D's ~5 guideline) even before a
spin-off's inherited-Recognition line (M4 Part D, two more numbers) or a post-crossover expectation band
(M4 §B.4, one more) are added for the relevant continuation types. This is exactly the failure mode The
Executive's own IP/Franchise confusion illustrates in a shipped game — a design that is individually
correct at every seam but collectively illegible (`03d-comparators-film-media-management.md:310-321`,
already cited by M4 §A.1 for a different, narrower point).

**Smallest correction:** the report should mandate one consolidated, *banded* (not raw-numeric) greenlight
card as the actual UI spec — collapse #2-6 into the single descriptor band plus at most one supporting
sentence naming the dominant driver (already independently proposed piecemeal by M1a/M1c's own
self-critiques, per M1j §9's grafts list item 3-4: adopt the "debt" vocabulary and a plain-language
dominant-cause sentence, not raw numbers), and collapse #7-9 into the two lines M2 §6 already proposes
(opening floor / expectation bar), folding any cast-continuity effect into the SAME expectation-bar
percentage rather than a separate line. This keeps every underlying number auditable in a tooltip
(satisfying the itemized-ledger legibility win M1j/M1k both praised) while capping what the player must
hold in their head at decision time to: band, opening-floor %, expectation-bar %, plus the pre-existing
base forecast — four items, comfortably inside axis D's ~5 guideline.

---

### D2. [MAJOR] "Similarity" is answered two incompatible ways — player-chosen free input vs. type-derived lookup — and this ambiguity is the exact surface that enables the A2 exploit

M1a (§2), M1b (§1: *"`similarity` and `type` are chosen by the player/rival at greenlight, not
derived"*), and M1c (§2.4, a similarity table with no validation logic) all treat `similarity` as an
**independently player-supplied** numeric input at greenlight, with **no stated check** that it bears any
relationship to the declared `continuationType` or to the actual shared cast/story facts of the film
being greenlit. Both judges independently name this as a **shared, unaddressed gap** across all three
candidates (M1j §6: *"who validates that a declared continuation type is honest... a shared gap across
all three models"*; M1k §1: implicitly, by never checking it).

M3's own `LineageEdge` type, by contrast, defines `similarity` as **derived from the declared type**:
*"Type-keyed defaults (STARTING POINT): sequel/prequel 1.0, remake 0.9, reboot 0.6, spinoff 0.4"*
(`M3-...md` §1.1) — a lookup table, not an independent free field. Neither position is stated as a
deliberate choice against the other; they simply disagree, and this is precisely axis D's own named
question ("Is 'similarity' player-chosen or derived, and can it be gamed or misunderstood?"). If the
RMF-family's "free input" reading ships, `continuationType` itself becomes an **unvalidated, player-
declared label with real mechanical consequences** (Fatigue-accrual bucket, branch type, N_MAX_BRANCHES
consumption) — which is the load-bearing precondition for A2's reboot-mislabeling exploit, and is the
mechanical analogue of MGT2's own shipped, community-documented escape hatch: *"You could also just
change your IP's name and make it a whole new 'brand'... Turn your The Elder Scrolls 29 into Ultima 1.
Because 'why not?'"* (`03b-comparators-mad-games-tycoon.md:184`, COMMUNITY, HIGH) — there, renaming the
IP object itself defeated its own neglect clock; here, mislabeling the *type* of an ordinary continuation
would defeat its Fatigue accrual and buy a fresh branch, for the identical underlying reason (an
unvalidated, free-text-shaped declaration governs a mechanically consequential state transition).

**Smallest correction:** make `continuationType` a **derived classification**, not a free player
declaration — computed from objective, already-available facts at greenlight (does this cite the same
branch as its most recent installment → sequel-family; does it open a new branch citing ≥1 prior branch
of the same property with no SubProperty → reboot; does it cite a SubProperty → spin-off; does it cite
exactly one specific prior `FilmResult` with no new branch → remake), with `similarity` following as
M3's type-keyed lookup. This removes the free parameter entirely rather than trying to validate it after
the fact, and is consistent with M3's own type shape, not a new mechanism.

---

### D3. [MAJOR] M6's cameo rank-decay formula: the literal tie-breaking rule silently defeats the model's own headline anti-spam argument, and the "adding a cameo can never lower the score" claim is not generally true

Independently derived and verified by this reviewer (not sourced from any evidence file — an original
arithmetic check of `M6-cast-slots-cameo-recommendation.md` §14.1's own stated formula):

**(a) Tie-breaking bug.** `rank(c) = 1 + count of named cast... with STRICTLY higher raw fame than c`
(§14.1). M6's own worked "stacking" table (§14.1, §14.3) shows **five identical fame-90 cameos** added
one at a time producing **strictly diminishing** deltas (+9.18 / +2.60 / +1.03 / +0.47 / +0.22) — this is
only possible if each successive same-fame cameo is assigned a **higher** rank than the ones before it
(rank 1, 2, 3, 4, 5, decaying `0.5^(rank-1)`). But under the formula **as literally written**, five
cameos of *identical* fame have *zero* cast members with strictly higher fame than each other, so all
five would receive rank 1 (tied) — i.e. **full, undiminished weight each**, not decaying weight. This
directly contradicts the model's own load-bearing anti-spam argument (§14.3 mechanism 1, §14.8's "sign
ten celebrities" refutation), both of which depend entirely on the rank actually decaying. The worked
table is only reproducible if ties are broken by an unstated rule (booking/billing order), which the
prose never specifies. **This is not a rounding nit — it is the difference between "stacking identical-
fame cameos is a rapidly-diminishing-returns trade" (the model's central claim) and "stacking identical-
fame cameos is free, undiminished publicity" (what the literal formula permits) — a real correctness gap
in the one mechanism the model relies on to justify shipping with "no cap needed."**

**(b) The monotonicity claim is false in general.** §14.1 claims, as a proven property: *"adding any
cameo can only raise or hold the score, never lower it, because a term whose value exceeds the current
average necessarily raises a weighted average, and `fameReach` is non-negative by construction."** This
reasoning only supports the claim **when the added term's value exceeds the current average** — which is
true of the model's own chosen example (fame 85, `fameReach≈0.630`, well above the baseline average of
~0.372) but is not guaranteed by the mechanism. Mathematically, inserting any weighted term with value
below the current running average necessarily **lowers** a weighted average — nothing in the data model
(`featured?: FilmParticipant[]`, no minimum-fame gate anywhere in §14.2) prevents a low-fame person from
occupying a Featured/Cameo slot. A player who books an unknown/low-fame "cameo" (for narrative rather
than publicity reasons — nothing forbids this) would see `starDrawOpening'` **fall** relative to not
casting them at all, directly contradicting the model's own stated guarantee and risking exactly the
"same-ish inputs, illegible/opposite output" trust failure Moviehouse's shipped design is cited
elsewhere in this batch as the cautionary tale for (`03d-comparators-film-media-management.md:218`: *"An
opaque 'the exact same choices sometimes score oppositely' outcome is the single clearest thing to avoid
in this whole atlas"*).

**Smallest correction:** (a) state the tie-break explicitly (booking order, or billing order at cast
time) so the rank-decay defense is well-defined and actually produces the diminishing series the model's
own table shows; (b) either gate the Featured/Cameo class on a minimum fame threshold (consistent with
its own stated purpose — "fame-priced attention"), or correct the model's self-description from a
universal "can only help" guarantee to the narrower, true statement ("helps when the cameo's fame exceeds
the current cast's blended level, which is the normal case for a genuine celebrity booking but is not
mechanically enforced").

---

## AXIS E — CONTRADICTIONS BETWEEN MODEL FILES

Precise catalogue, file+section, with the smallest resolution for each (several are elaborated in full
above under A/B/D and are cross-referenced rather than repeated in full):

| # | Contradiction | Files/sections | Smallest resolution |
|---|---|---|---|
| E1 | SubProperty minting authority: **P16-minted** vs **P17-minted** | M3 §1.1 (`subPropertyId: string \| null // P16-minted id`) vs M4 Part A.2/Part C (`SubProperty` is a "P17 root entry," minted by an explicit player/rival action, eligibility owned by P17) | Assign minting to **P17** (M4's design is the fully-worked one — an eligibility test citing exact `productionId`/`FilmParticipant`, a lifetime cap, no P16 charter dependency); correct M3 §1.1's comment. This is the exact contradiction named in the task brief. |
| E2 | Reboot Fatigue-seed fraction: **γ=0.2** (M3) vs **0.5** (M4, for spin-offs) vs **0.0/zero-inheritance** (M1a/M1b/M1c and the shipped final-synthesis code) | M3 §3.2; M4 §A.4; M1b §6 ("clean M/F slate... never gated on wait length"); `M1-final-synthesis-calc.py:126-140` (`Branch.__init__` hardcodes `F=0.0`) | See A2 above — the fullest treatment. Adopt one canonical partial-inheritance formula per branch-creation type and implement it in whichever RMF core ships. |
| E3 | Awareness/expectation seam formula and mechanism: floor-raise/no-F/floor-1.0 (M2) vs additive/with-F/floor-0.6–0.7 (M1-family) vs a fourth, unreconciled placeholder (M5 §3.3) | M2 §1.1-1.2; M1a §6; M1b §5; M1c §6; M5 §1.4/§3.3 | See B1/B3 above. Retire M2's competing formula bodies to "value TBD from the adopted RMF core"; delete M5 §3.3's placeholder. |
| E4 | `policy.version: 2`'s new field(s): four non-reconciled proposals | M1a §8 (hardcoded `M≥20`, no named field); M1b §7 (`continuationBar`, `revivalBar`); M1c §9 (`rivalRevivalRMin`, `rivalFatigueTolerance`); M5 §2.1/§2.3 (`continuationAppetite`, plus separately-named `MOMENTUM_CONTINUE_THRESHOLD`/`FATIGUE_CONTINUE_CEILING`) | Pick ONE canonical `policy` v2 shape before any of these ship; M5's `continuationAppetite` (a single seeded per-studio scalar, consistent with how `affinities` is already seeded) is the most economical of the four and the only one that gives each of the 9 authored rival studios a distinct personality rather than one global threshold — recommend it as the base, with the momentum/fatigue *thresholds* as fixed constants (not per-studio policy fields) unless studio-level variance in risk tolerance is specifically wanted. |
| E5 | `similarity`: player-chosen free input vs. type-derived lookup | M1a §2, M1b §1, M1c §2.4 (free input) vs M3 §1.1 `LineageEdge` ("Type-keyed defaults") | See D2 above — make `continuationType` itself derived from objective facts, with `similarity` following as M3's lookup. |
| E6 | R/M/F illustrative formula proliferation beyond the three "official" candidates | M2 §7's own placeholder RMF rule (`ΔMomentum = clamp(20·(realizedTotal/expectedTotal−1),±25)`); M3 §4's own illustrative formula (`IMPULSE_M=60`, `HL_M=26wk`, asymmetric R rise:fall 0.70:0.12); M5 §3.3's fifth formula | none — all self-labeled as illustrative/placeholder | No correction needed beyond making sure the report does not accidentally quote any of these three placeholders as if they were the adopted core — recommend an explicit "placeholder, superseded by [chosen core]" banner be added to each when the report is assembled. |
| E7 | Recognition storage location: property-wide (M1b, M3, and M1a's *documented* schema) vs per-branch (M1c's *stored* schema, contradicted by M1c's own worked cases) | M1c §1 vs M1c §7-8.6; cf. M1a's parallel, already-judge-found bug at M1k §1.5 | See A3 above. |
| E8 | Reboot legality precondition: M3's own aside about a non-damaged real-world "soft reboot" (Craig-era Bond) vs. M3's own reboot-Fatigue mechanism, which is built entirely around damaged-continuity evidence (Terminator) | M3 §2.3 vs M3 §3.2 | See A2's "tension worth naming" — resolve via a continuous, health-scaled inheritance fraction, not a hard band-gate, so a legitimate non-damaged reboot remains legal and merely seeds proportionally more Fatigue. |

---

## AXIS F — RIVAL SYMMETRY

### F1. [MINOR] Rivals cannot exploit the A2/D2 mislabeling gap the way a player deliberately could — a player-favoring, not a rival-favoring, asymmetry

M5's rival decision rule (§2.3 `chooseCommission`) picks a continuation `type` via `pickLegalType(...,
rival.policy.affinities, seed)` — a **seeded roll weighted by genre affinity**, not a deliberate,
Fatigue-minimizing choice. A rival following this policy has no code path that would notice "declaring
this a reboot instead of a sequel saves Fatigue" the way a strategic human player reading the tooltip
could. This means the A2/D2 mislabeling exploit, if it ships unfixed, is asymmetric **in the player's
favor** — a rival will not out-optimize a min-maxing player through the same loophole, but nor is it
"symmetric legality" in the sense Direction K cares about (legality is identical; *exploitation
sophistication* is not, which Direction K does not require to be identical — "compact rival decision-
making" is explicitly authorized). Flagged as MINOR because it is a real but modest fairness gap, not a
legality violation, and is exactly the kind of asymmetry direction K's own "compact" carve-out
anticipates.

### F2. [MINOR] Cast-billing/permutation asymmetry (already self-identified by M6, re-confirmed here as acceptable)

M6 §13.4 Shape C explicitly designs rivals to "fill greedily, never permute" optional cast seats while
the player retains full billing/casting choice. This is a real capability asymmetry but is explicitly
scoped and justified as a bounded-rival-complexity choice (`M6-...md` §13.4, §13.7), consistent with
Direction K's "compact rival decision-making." No correction proposed.

### F3. [MAJOR] The rival continuation-flooding question cannot actually be evaluated, because P15 market crowding — the system every model assumes will absorb it — does not exist yet

Every model in this batch that touches rival continuation volume (M1a §8, M1b §7, M1c §9, M5 Part 2)
explicitly and correctly defers "does the market get oversaturated with continuations" to P15
(`competitionFactor`, M2 §4: *"P15 market law, not P13... DO NOT TOUCH"*, confirmed hardcoded to `1.0`
today per evidence). This is the right package boundary. But it means the actual, load-bearing question
this axis asks — **"could the rival policy branch starve or flood the market"** — currently has **no
mechanical answer at all**, because the one system designed to register "too much of the same thing
releasing at once" is a stub. Nine independently-seeded rival studios (`hollywoodStartingData.ts`,
evidence §e.2), each free to commission a continuation whenever `continuationAppetite`'s roll succeeds
and capacity allows, could in principle all chase simultaneously-ACTIVE properties in the same window
with zero in-engine crowding consequence today. This is not a defect in any P17 model's own math — it is
a **sequencing dependency risk**: P17's rival design is being finalized on the assumption that P15 will
eventually supply the missing counterweight, and none of the five models that touch this explicitly says
so as a load-bearing, must-land-before-P17-rival-launch dependency (each just says "not P17's job," which
is correct but incomplete).

**Smallest correction:** the report should record this explicitly as a **launch-order dependency**
(P15's real `competitionFactor` should land before or alongside any rival continuation-appetite policy
that could plausibly flood a window), not merely as an out-of-scope boundary note, since "flood the
market" is one of the report's own named axes and currently has zero mechanical detection anywhere in
the stack.

---

## RANKED FINDINGS TABLE

| Rank | Severity | Finding | Axis |
|---|---|---|---|
| 1 | BLOCKER | Recognition's peak kernel ratchets to its ceiling under sustained mediocrity alone (verified by execution: R hits 100 by release 8-12 of a never-a-hit 0.9×-forecast spam chain) | A1 |
| 2 | BLOCKER | Reboot Fatigue-inheritance: three model-level positions (γ=0.2 / 0.5 / zero) and the shipped code implements zero — the reboot-as-fatigue-cure exploit is open in the actual final core | A2, E2 |
| 3 | BLOCKER | M2 ships a complete, incompatible competing formula for the exact seam it says it doesn't own; at least 3 functionally distinct awareness/expectation mechanisms exist across the batch | B1, E3 |
| 4 | MAJOR | `continuationType`/`similarity` is an unvalidated free player input in the RMF family but a derived lookup in M3 — this ambiguity is the mechanism that enables finding #2 | D2, E5 |
| 5 | MAJOR | M6's cameo rank-decay: literal tie-break gives identical-fame cameos undiminished (not decaying) weight, defeating the model's own anti-spam proof; "can only help, never hurt" is not generally true | D3 |
| 6 | MAJOR | Fatigue never touches the box-office-facing awareness channel in the model that would ship, contradicting two of the three original RMF candidates' explicit designs | B2 |
| 7 | MAJOR | Cross-model tally of "numbers to show at greenlight" (never done by any single model) exceeds ~5 once every self-critique's own recommended fix is honored | D1 |
| 8 | MAJOR | M1c's stored schema places Recognition per-branch, contradicting its own worked cases and Direction H — a second, previously-uncaught instance of the M1a R-sharing bug | A3, E7 |
| 9 | MAJOR | M5's cast-continuity discount composes with an unspecified base seam and introduces a fifth, unreconciled expectation formula | B3 |
| 10 | MAJOR | Rival continuation-flooding cannot be mechanically evaluated because P15 crowding (the assumed counterweight) is a stub — a sequencing dependency, not flagged as load-bearing anywhere | F3 |
| 11 | MAJOR | No model states what happens to an in-flight Production if its property's rights sell mid-production | A4 |
| 12 | MINOR | `policy.version:2` proposed with 4 non-reconciled field sets across M1a/b/c/M5 | E4 |
| 13 | MINOR | Display-order confusion if an early-greenlit continuation releases before its predecessor | C2 |
| 14 | MINOR | Player-favoring (not rival-favoring) asymmetry in exploiting the mislabeling gap | F1 |
| 15 | MINOR | Rival greedy-fill vs. player full billing choice for optional cast seats — accepted, self-scoped | F2 |
| — | CLEAN | Information law (axis C): no hidden-reception leak found anywhere in the batch | C1 |
| — | CLEAN | Single-hit/single-flop channel trace: no double-counted channel found (one M1a drafting imprecision noted, already superseded) | B4 |
| — | CLEAN | Save-As/identity-collision guards (M3 §10) are adequate as designed | A5 |

