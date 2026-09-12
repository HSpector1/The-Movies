> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`../redteam/R3-reviewer-corrections-calc.py`](../redteam/R3-reviewer-corrections-calc.py), committed output [`../redteam/R3-output.txt`](../redteam/R3-output.txt) — **the report governs.** Superseded here: Space Jam figures ($230M / 37%) corrected in report §20 item 14 ($250.2M WW / RT 46% / CinemaScore A−); the cameo fee fraction is a provisional P14 fee-law suggestion, not a Direction R consequence.

# M6 — Cast-Slot Expansion (Direction T) and Celebrity Cameo (Direction U): Final Model

Read-only paper model. No repo edits, branches, builds, tests, or runtime touched. Engine facts cited by
`file:line` at the accepted P12 closeout commit `13370d428f0693f3279732f6f4cc360a7fcaa4df` (via
`02-project-studio-architecture-READONLY.md`, which itself re-verified every locator it quotes). Original
game facts from `01-ORIGINAL-THE-MOVIES-RECONCILED.md`. Comparator facts from `03a`/`03d`. Real-franchise
facts from `04a` Question I. Design synthesis inherited from and cross-checked against
`05-cast-scale-and-cameo-design-evidence.md`, which already carried out the primary research pass; this
file is the report's committed, corrected final recommendation built on that dossier. A companion
arithmetic script (`m6_arithmetic_check.py`, same folder) reproduces every worked number below.

Source-line convention: `source; locator; what it proves; confidence; tier`.

---

## 13. OPTIONAL CAST-SLOT EXPANSION (Owner Direction T)

### 13.0 Headline recommendation

Ship **Shape A now, Shape B as the next era step, Shape C only after B has been played and reviewed, and
never Shape D.** Gate seat *capacity* — never seat *requirement* — through a new P13 era-capability fact
`castCapacity: { additionalPrincipals: 0|1|2, featured: 0|1|2 }` (no calendar dates approved; P13 owns the
mapping from era/tech/awards to these integers, exactly as it already gates other production capability).
The three required `CastSlot` seats (`lead|antagonist|support`) stay frozen. Every additional seat is an
**optional bounded array**, never a widened `CastSlot` union — this is the one structural choice that
keeps the change linear-cost instead of combinatorial, and it is corroborated by three independent lines
of evidence: the engine's own type-surface cost (§13.2), the original game's own lifecycle precedent for
adding capability without raising the lead cap (§13.3), and film history's own cost structure for large
casts (§13.1, item 4/7/8: seat count scales cheaply only when per-seat pay is bounded).

More seats are **capacity, not requirement** — direction T's own words — which this model treats as a
load-bearing constraint, not decoration: at every shape below, `requiredSlots` stays exactly the three
seats it is today (`types.ts:161-162`; `worldgen.ts:614`; `screenplay.ts:194`), and every additional seat
is legal to leave empty.

### 13.1 Cross-checked evidence base

**Engine (`02` §b.2, §c; HIGH; DEVELOPER/OFFICIAL, repo code @13370d42):**
- `requiredSlots` is read at exactly one site (`filmPackage.ts:286`) purely to report an *unfilled* UI
  draft slot — "a display roll-up, never a validator." Every other layer enforces all three seats
  unconditionally: the `CastSlot` union itself (`types.ts:19`), `Production.cast: Record<CastSlot,string>`
  (`types.ts:233`), the greenlight validator (`actions.ts:391-411`), the casting-slate law
  (`castingSessions.ts:121-140`; `tuning.ts:1662-1663`), reception's `CAST_SLOTS` iteration
  (`reception.ts:42,236-251,320-327,496-507`), Standing's `starAttention = mean(lead,antagonist,support)`
  (`standing.ts:77-79`), rival packaging's `actors.length===3` fixed slice (`hollywoodTick.ts:148-150,
  192-194`), and Save's per-slot validators (`save.ts:1587-1601`). §b.2's own conclusion: **"today's
  engine is the opposite" of direction T's literal sentence** (three seats = requirement, not capacity) —
  see §13.5 for the correction this forces.
- There is no non-film `CreativeRole` (`writer|director|actor|craft` only, `types.ts:18,110`) — a famous
  non-actor cameo (direction U) has no talent-kind today; this is a shared prerequisite for both sections
  13 and 14 and is scoped to P14 in §13.6/§14.7.

**Original game (`01` Q12-Q14; VERY HIGH; DEVELOPER-REVIEWED PRIMA + OFFICIAL MANUAL):**
- Q12: a **hard, era-invariant cap of 3 principal/lead roles** ("There are three mannequins representing
  the three possible lead roles in your movie," manual, verbatim) plus a separate, uncapped Extras class.
- Q13: cast *capability* changed over time (Script Office tier gated how many lead roles an AI script
  called for; the Custom Scriptwriting Office let a player construct up to 3 leads early) but **no era,
  research pack, or award ever raised the 3-lead cap itself.** The one thing that *did* expand over the
  product's life was Stunts & Effects adding an entirely **new personnel category** (stuntmen) — a new
  role *tier*, not more lead slots. This is a closer real precedent for direction T/U (add tiers:
  Additional Principal, Featured/Cameo) than for widening the lead cap itself, and Q13 says so explicitly.
- Q14: extras "impact movie quality only indirectly through Script Quality" (max +0.5★), have **zero**
  Star Rating/Press/Image/Star Power, and "a Star dropped into a non-lead slot gets none of the usual
  lead-role benefits" — the shipped ancestor *discouraged* rather than rewarded a cameo pattern, and no
  cameo mechanic exists anywhere in the corpus (Q14, zero hits).

**Film history (`05` §2, ten items; OBSERVED HISTORY, HIGH unless noted):** seat count scaled from 1-2
(pre-1932 studio norm) to 5-7 (*Grand Hotel*, 1932, "all-star cast" as event) to 8-10 (1970s disaster
cycle) to 40+ (*The Longest Day*, 1962) — but **the cost structure, not the seat count, was always the
real constraint**: *Longest Day*'s ~42 stars worked at a flat $25,000 each (only Wayne got $250k);
*Ocean's Eleven* (2001) required stars to "accept pay cuts from their usual going rate" to make the
ensemble affordable at all; above-title billing "normally counts two or three names" even in a 10-star
film (*Towering Inferno*'s "staggered but equal" diagonal billing). Elberse (2007): stars move revenue,
"little influence on profitability" — MEDIUM confidence, quoted via an HBS summary after the primary
article 403'd, tier CONTEMPORARY PROFESSIONAL SOURCE, flagged in `05` §7 as an open gap.

**Comparators (`03a`/`03d`; role-count handling, quoted verbatim where the brief asked):**
- **Hollywood Animal** — Casting is not slot-capped in the same rigid way; the *risk* comparators surface
  is tier-friction, not seat count: "The A-lister, naturally, refused to share a frame with such
  peasantry" (Game8 review; CONTEMPORARY PROFESSIONAL SOURCE, MEDIUM) — a relationship/status friction
  that could later act as a natural ensemble limiter (folded into §14's anti-spam list as a non-primary
  mechanism). Professionalism-vs-script mismatch "will almost certainly decrease" quality (Outsider
  Gaming guide; COMMUNITY INFERENCE, MEDIUM) — an under-skilled cast member subtracting from quality,
  which is exactly the shape §14.2's `CAST_WEIGHT.cameo` term already gives P07.
- **Moviehouse** — no named seat cap found, but the shipped fame/skill loop is the clearest **cautionary
  tale for uncapped continuity value**: a reviewer reports "I started with the same 2 actors I ended
  with... it was just better to al[ways use the same two]" because star rating "actually make[s] the
  movies better" with **no diminishing return or fatigue counterweight found** (`03d` §2, four
  independent corroborating threads; COMMUNITY, HIGH as a recurring, undisputed report). This is a direct
  argument *for* this model's rank-decay + fee mechanism (§14.3) over any flat, uncapped fame bonus.
- **Blockbuster Inc.** — ships a fame/needs mechanic with **no capacity counterweight**: "your
  actors/directors/producers gain fame so fast that it becomes impossible to keep them happy. With only
  5 5-star resident slots... they're destined to be miserable" (Steam review; COMMUNITY, HIGH) — the
  clearest shipped negative exemplar of Owner Rule F's "unavoidable escalating demands" failure mode,
  cited here because it is the same failure mode an uncapped Featured/Cameo class would create if fee and
  availability were not tied to fame (§14.3 mechanisms 2-3 exist specifically to avoid this).
- **The Executive** — the most fame-vs-skill-explicit comparator in the batch: popularity is "a numeric
  score (0-100) attached independently to lead, supporting, and director slots," and the achievement
  **"Superstar Cameo" — "Cast a supporting actor/actress with a popularity score of at least 90"** sits
  beside "Superstar" (lead) and "Pulling Power" (director) — but critically, `03d` verifies **The
  Executive does NOT have a distinct CAMEO role class**: "'cameo' here is achievement flavor language for
  'supporting + high popularity,' not a separate role tier" (`03d` lines 371-381; DEVELOPER/OFFICIAL,
  HIGH). This means **no comparator in the researched set ships a true below-Supporting Cameo/Featured
  tier** — Shape A's Featured/Cameo class would be new relative to every comparator studied, not just
  relative to the 2005 ancestor.
- **Movies Tycoon** — its Franchise system (shipped ~6 weeks before this report) has no cast-role-count
  detail in the corpus; flagged in `03d` §10 as too new for mature critique, not evidence either way.
- Synthesis (`03d` §9 table): "Fame modeled separate from skill" is confirmed shipped for The Executive
  (popularity score) and Hollywood Mogul 4 (Sex-Appeal vs. Screen-Presence split) but **not found** for
  Moviehouse or Movies Tycoon — i.e., fame/skill separation is a real but inconsistently-adopted pattern
  in the genre, which is one more reason to keep Project: Studio's existing separation (already shipped,
  `types.ts:114`) rather than build a new one.

### 13.2 Cost dimensions — what actually gets more expensive as seats grow

All formulas and locators from `05` §4.1 (verified against `02` §b.2/§c during this pass; unchanged).

| Dimension | Formula / mechanism | Locator |
|---|---|---|
| Casting workload | audition reads = `2·n` (principals only; cameos never audition, §14.3 Q3) | `castingSessions.ts:40,121-142`; `tuning.ts:1659-1663` |
| Salary cost | each principal adds a full `25k + 150k·s² + 600k·f²` to `committedCost` → ROI → `commercialConfidence` | `worldgen.ts:161-167`; `tuning.ts:71-73`; `standing.ts:83-92` |
| Relationship pairs (future P14) | actors only `n(n-1)/2`; with director `n(n+1)/2` — roadmap requires a *sparse* graph, never N² | roadmap `:241,255` |
| Screen readability | Assembly renders `n` `TalentPicker` cards in a `grid grid-3`; slate planner `2·n` buttons; poster `<dl>` grows by `n` rows | `Assembly.tsx:1324-1349`; `CastingSlatePlanner.tsx:14-126`; `FilmPoster.tsx:41-48,119-128` |
| Save/projection size | ≈+257 B per seat per film in `participants` (stored on Production *and* frozen on `FilmResult`) | measured from `p11-core-v4/s13...save.json`; `types.ts:206-222,238,259` |
| Rival abstraction | rivals need `n` idle actors *and*, if permuted, `n!` billing permutations | `hollywoodTick.ts:148-154`; `hollywoodPolicy.ts:10-18,36-39` |
| Fame publicity denominators | `starDraw`/`starAttention` change meaning if their averaging denominator silently grows | `reception.ts:493-507`; `standing.ts:62-78` |

### 13.3 Cost table per candidate shape (numbers reproduced this pass)

Assumptions (unchanged from `05` §4.2): fame-priced example star `s=0.7, f=0.9` → $584,500; mid actor
`s=0.6, f=0.5` → $229,000 (`worldgen.ts:161-167`; `tuning.ts:71-73`).

| Shape | Reads / min people | Added salary (mid actor) | Pairs (actors / +director) | Rival permutations (if permuted) | Poster/credit rows | Save Δ/film | Type surface | Crossover value |
|---|---|---|---|---|---|---|---|---|
| **3 (status quo)** | 6 / 3 | — | 3 / 6 | 6 | 6 + craft | — | none | none |
| **4** (+1 Additional Principal) | 8 / 4 | +$229k (+$585k star) | 6 / 10 | 24 | 7 + craft | ≈+0.6 KB | array: ~15 sites; union-widen: ~96 core + 53 UI lines | two-lead crossover enabled |
| **5** (+2 Additional) | 10 / 5 | +$458k (+$1.17M stars) | 10 / 15 | 120 | 8 + craft | ≈+1.2 KB | as above; 5-card grid breaks `grid-3` | 3-lead (Avengers-shape) crossover |
| **6** (+3 Additional) | 12 / 6 | +$687k (+$1.75M stars) | 15 / 21 | 720 | 9 + craft | ≈+1.8 KB | as above; 6 cards = two full rows | none beyond 5 (Rule N bounds branching) |
| **+ Featured/Cameo (0-2)** | 0 extra reads (fee-booked, no audition) | fee = fraction of fame-priced salary (§14.3) | 0 (excluded from relationship pairs) | 0 (rivals fill greedily, never permute) | +0-2 "and {name}" rows | ≈+0.5 KB/cameo | new optional array + one `FilmParticipantRole` member | publicity + later legacy-cameo hooks |

Pairs and permutations grow **super-linearly** (n! for permutations, n(n+1)/2 for pairs) while seat-4 and
the Featured class grow **linearly**; this is the arithmetic reason Shape D is rejected outright (§13.4)
and Shape C is bounded to "last step, after review" rather than shipped alongside A/B.

Save size is *not* the binding constraint (+1.8 KB/film × 400 films ≈ 0.7 MB against a 296 KB
single-production fixture; the 9.58 s Save p95 from CONTEXT.md is driven by projection breadth, not
participant count). **The binding constraint is type surface**: every `Record<CastSlot,…>` across concept
role requirements, `ShapeEffects.cast`, `FilmParticipants.cast`, `CastingSlate`, `CastingResults`,
`StandingContext.castFames`, `ContribKey`, `ROLE_WEIGHT`, `SLOT_TRANSFORM`, `STAR_POWER_ROLE_WEIGHTS`, and
the Save V19/projection-29 migration itself — plus 24-manifest e2e golden fixtures across
`p11-core-v3/v4`, `p06-visual-oracle-v1`, `p05`, `lot-native-next-event-v1` that a union-widen would
invalidate but an additive array leaves byte-identical (`05` §4.3, confirmed by grep counts: ~96 non-test
core lines / 26 files, 53 non-test UI lines / ~20 files for `antagonist` alone).

### 13.4 The four shapes, ranked

**Shape A — "3 + Featured/Cameo (0-2)" — RECOMMENDED FIRST CHECKPOINT.**
`CastSlot` and all three required seats stay frozen exactly as today. Add `featured?: FilmParticipant[]`
(bounded 0-2) beside `craft` on `FilmParticipants`/`ShapeEffects`/`GreenlightScriptProjectPayload`; add
`'cameo'` (optionally `'featured'`) to `FilmParticipantRole`. No audition, booked by fee (§14.3). Delivers
direction U in full with near-zero type surface, byte-identical golden fixtures, and no rival-permutation
change. Cons: defers the Additional Principal seat of direction T; only one era-gating lever exists
(when Featured becomes available).
*Ownership:* capacity/era availability P13; role class/fee/availability P14; reception/awareness split
P07/P08; segment fit P15.

**Shape B — "3 + 1 Additional Principal + Featured (0-2)" — RECOMMENDED SECOND ERA STEP.**
Adds one optional `additionalPrincipal?: FilmParticipant` (or a 1-element bounded array), a
`CAST_WEIGHT` of 0.45 (between antagonist 0.6 and support 0.35), `ROLE_WEIGHT` 0.6, support's
`SLOT_TRANSFORM`, `STAR_POWER_ROLE_WEIGHTS` 0.5 — minted only when era capacity allows. Enables a
two-lead crossover (later P17 scope, direction O) and a legible "the picture got bigger" era step; pairs
stay at 6/10; rivals fill greedily (no permutation change). Cons: every enumeration site (~8 UI + ~10
core) gains one optional branch; the forecast/reception denominators change *only when the seat is
present* — a testable invariant to hold at build time.
*Ownership:* as A, plus core casting owner for the seat law, P12 for rival fill policy.

**Shape C — "3 + up to 2 Additional Principals + Featured (0-2)" — RECOMMENDED ONLY AS THE LAST ERA
STEP, AFTER A AND B SHIP AND ARE REVIEWED.**
Bounds the additional-principal array at ≤2. Enables three-lead crossovers and a legible "all-star" flag.
Cons: a 5-card Assembly grid at phone width, pairs grow to 10/15 (P14 must keep relationships sparse —
recommend scoping the pair graph to the three *required* seats plus director only, never the full
optional set), and rival permutations must be explicitly *disabled* for optional seats rather than merely
left unimplemented (a policy decision, not an oversight).

**Shape D — "6 named principal slots by widening the `CastSlot` union" — NOT RECOMMENDED, full stop.**
Touches ~96 core + 53 UI lines, every `Record<CastSlot,…>` type, the casting-slate law (12 reads, 6
distinct minimum), 720 rival permutations, and the Save V19 migration — and the ancestor itself never
raised its 3-lead cap in any era (Q13). No gameplay value beyond Shape C that the crossover/ensemble
literature (§13.1) actually asks for.

**Era gating fact (P13, no dates approved):** `castCapacity: { additionalPrincipals: 0|1|2, featured:
0|1|2 }`, consumed by core casting, `EraConfig` itself left unwidened (roadmap `:241`). Historical support
for the *shape* of the curve (not specific years): all-star principal expansion traces to the early 1930s
(*Grand Hotel*); the marketed cameo to the mid-1950s (Todd, 1956); industrialized ensembles to the
1960s-70s (*Longest Day*, disaster cycle) — pattern only, DESIGN INFERENCE built on OBSERVED HISTORY, no
date is owner-approved and none is proposed here.

### 13.5 The correction to direction T's literal sentence

Direction T states: *"A two-character drama must remain legal in 1995."* **Today no two-character film is
legal in any year** — `02` §b.2 confirms all three seats are unconditionally required at the type,
validator, casting-slate, reception, Standing, rival-packaging, and Save layers simultaneously
(`Assembly.tsx:188` returns null if any of lead/antagonist/support is missing; `castingSessions.ts:121-142`
demands all three slot-pairs). This is not a gap this model can quietly patch: making `support` (or any
required seat) optional is a change to the *frozen* three-seat law that carries M0A-class byte-identity
risk across every layer in the table above, and touches the same ~96+53 lines Shape D would touch, for a
different reason.

**Recommended reading (the smallest correction):** treat direction T as *"small-cast films must remain
legal when more seats exist"* — i.e., the optional seats introduced by Shapes B/C must never become
mandatory, and a film that fills only the three required seats must always remain exactly as legal as it
is today, at every era. This is fully satisfiable by Shapes A-C as designed (nothing about them raises the
minimum). **The literal two-hander (fewer than three named performers) is a separate, unresolved core
decision** — changing what `CastSlot` requires, not what it optionally allows — and is flagged here as an
**Owner decision**, out of P17 scope, not something this report recommends building.
Source: `02` §b.2 (all locators above); `05` §4.2 note; confidence HIGH on the current-law finding, this
paragraph's correction is DESIGN INFERENCE.

### 13.6 Named-role ceiling: recommend ≤5 named principals + ≤2 featured/cameo, and why 6+ is disproportionate

**Recommendation: cap the *sum* of required + optional named principal seats at 5 (3 required + ≤2
Additional Principal), plus ≤2 Featured/Cameo — never 6 named principals (Shape D).** The cost table
(§13.3) is the reason, read as a ceiling test rather than a shape-by-shape list:

- **Relationship pairs.** `n(n+1)/2` (with director) goes 6→10→15→21 for n=3→4→5→6. The roadmap's own
  P14 constraint is a *sparse, evidence-linked* graph, "not a full N² matrix" (`02` citing roadmap
  `:255`); 21 pairs at n=6 is the point where "sparse" stops being a meaningful description of a graph
  that is, in practice, complete over six people plus a director.
- **Rival permutations.** If ever permuted, `n!` goes 24→120→720 for n=4→5→6 — a 30x jump from 5 to 6
  that no other row in the table produces between any other adjacent pair. (The recommended policy is to
  never permute optional seats at all — §13.4 Shape C — which makes this row zero for every shape; it is
  listed here because it is the sharpest illustration of *why* 6 is qualitatively different from 5, not
  because the recommendation depends on rivals actually permuting.)
- **Screen readability.** 5 named principals is a 3+2 grid, an awkward-but-workable phone-width layout;
  6 is two full rows of 3, which the Assembly screen was never designed around (`Assembly.tsx:1324-1349`
  is a fixed 3-column grid today).
- **Historical precedent for *named, above-title* casts stops at 2-3 regardless of total cast size.**
  "The two or three top-billed actors... will usually be announced prior to the title" (`05` §2 item 6,
  Wikipedia "Billing"); even *Towering Inferno*'s 8-10-name ensemble kept top billing a 2-name contest.
  A named-principal ceiling of 5 already exceeds what film history treats as the legible "principal cast"
  in the eye of an audience; 6+ has no comparator or historical precedent asking for it (§13.1).
- **The ancestor's own ceiling never moved.** Q13: the 3-lead cap was never raised by any era, research
  pack, or award in the entire product lifecycle; the thing that *did* expand was a new role tier
  (stuntmen), not more leads — direct precedent for "add tiers, don't widen the union."

### 13.7 Package ownership matrix — Direction T elements

| Element | Owner | Why |
|---|---|---|
| Era cast capacity (`castCapacity.additionalPrincipals`) | **P13** | era/technology/production capability fact; `EraConfig` itself not widened |
| Three required seats, casting-session law, `CAST_WEIGHT` constants | **core casting owner** (frozen) | `02` §b.2, §c.1 |
| Additional Principal role class, weight constants, availability | **P14** consumes / **core casting** defines the seat law | person/contract authority vs. seat mechanism |
| `castExecution`/`starDraw`/Standing denominator changes when the seat is present | **P07 / P08** | reception owns craft & opening math; Standing owns awareness |
| Rival fill policy for optional seats (greedy, never permuted) | **P12** | bounded rival policy, register SIM-009 dormant dimension |
| Two-lead / three-lead crossover value | **P17 (later scope, direction O)** | franchise/continuation state; mints no cash, changes no salary |
| The literal two-hander (fewer than 3 required seats) | **Owner decision** (core casting charter change) | out of P17 scope; separate from capacity expansion |

---

## 14. CELEBRITY CAMEO (Owner Direction U)

### 14.0 Headline recommendation

Ship the Featured/Cameo class as **fame-priced attention with a small, honest, skill-gated performance
term** — the engine already keeps these two things separate (`Talent.fame` vs. `effectiveSkill`/`roleFit`,
`types.ts:114`; `talentSummary.ts:6-8`), so the cameo design's only job is to *name* the split and give it
one new, bounded, additive channel. No cap is needed because three independent opportunity-cost mechanisms
(§14.3) make stacking cameos a mechanically losing trade well before any hard limit would bind — matching
the design law that timing and scale act through continuous economics, never fixed rules.

### 14.1 The FAME VALUE / PERFORMANCE VALUE split

**FAME VALUE (publicity, opening-weighted, awareness-only).** The engine already has two "fame → opening"
sites: `starDraw`/`starDrawOpening` (`reception.ts:493-507,519-540`, opening variant substitutes the Hill
saturation `fameReach(fame)=f/(f+50)`, `economy.ts:17-20`, `tuning.ts:418`) and `starAttention`
(`standing.ts:62-78`, unweighted mean of the three required-seat fames, feeding `audienceAwareness` at
weight 1.2 against a reach weight of 7, `tuning.ts:108-110`). The recommended cameo formula generalizes
this *exact same weighted-average family* — it does not invent a second, differently-shaped fame formula
(no duplicate-formula risk):

```
starDrawOpening' = 100 · clamp( [Σ_slot CAST_WEIGHT[slot]·fameReach(fame_slot)] + Σ_c w_c·fameReach(fame_c)
                                 / (Σ CAST_WEIGHT + Σ_c w_c) , 0, 1 )
   where, for each Featured/Cameo entry c:
     rank(c) = 1 + count of named cast (principals + other cameos) with STRICTLY higher raw fame than c
     w_c = CAMEO_RANK_DECAY^(rank(c)-1) · segmentFit_c        (CAMEO_RANK_DECAY ≈ 0.5)
```

This is a **refinement of `05` §5.1's proposed `publicityPool`**, made for one concrete reason, verified
by arithmetic (script `m6_arithmetic_check.py`, this folder): `05`'s original formula ranks and
re-normalizes the *whole* fame-sorted cast (principals + cameos) as one pool, which has two undesirable
properties this pass found by computing it —
1. it needs a *new* normalization constant that is not obviously compatible with the existing 0-100
   `starDrawOpening` scale (a scale-mismatch risk), and
2. under a plausible normalization, inserting a highly-famous but poor-fit cameo can insert *above* the
   existing principals in rank and thereby push their own decay weight down, which can make the
   **normalized average fall** even though a strictly-positive attention source was added — a result that
   would be flatly illegible to a player ("why did adding a cameo lower my opening buzz?").

The generalized weighted-average form above avoids both: it is the *same* formula shape `starDraw`
already uses (a `Σweight·value / Σweight` average with one more term), it degenerates to today's exact
`starDrawOpening` when `featured` is empty (Σ_c term = 0), and — verified by direct computation — **adding
any cameo can only raise or hold the score, never lower it**, because a term whose value exceeds the
current average necessarily raises a weighted average, and `fameReach` is non-negative by construction.
Rank is computed on **raw fame** (not fame×fit) so that "how big a star is this, really" and "does this
star fit this film" stay two separate, separately-legible questions on the forecast card, matching Q6.

Worked check (3 principals fame 40/25/15, all fit 1.0; baseline `starDrawOpening = 37.19`; script output):

| Adding a fame-85, poor-fit (0.4) musician cameo (rank 1, most famous name in the cast) | → 41.58 (+4.39) |
| Stacking identical fame-90, perfect-fit (1.0) cameos one at a time | +9.18 / +2.60 / +1.03 / +0.47 / +0.22 (successive deltas) |

The stacking series is the *exact* "diminishing beyond the top name" law the ancestor already shipped
("each subsequently rated Star contributes a lower percentage," Prima `:3587-3598`, cited `05` §3.1) —
reproduced here from the engine's own weighted-average mechanics rather than asserted.

**PERFORMANCE VALUE (craft, cohesion) — unchanged mechanism, new small weight.**
```
castExecution = Σ_slot CAST_WEIGHT[slot]·castSlotExecution(slot) / Σ CAST_WEIGHT     [unchanged, 3 seats]
with, when a cameo is present: CAST_WEIGHT.cameo = 0.10 folded into the same weighted average
castSlotExecution(x) = 0.6·effectiveSkill(acting) + 0.4·100·roleFit(persona)          [unchanged formula, `talentSummary.ts:304-324`]
```
Cameos are **excluded from the cohesion centroid** (`ROLE_WEIGHT`, `tuning.ts:1671-1684`) — a two-minute
appearance should not move the film's delivered expression, and this keeps `computeContributions`
untouched.

Worked example, reproduced this pass (script output, principals executing 74/69/64 → baseline
`castExecution = 70.67`; a fame-90 non-actor cameo executing at 24, i.e. acting skill 20 + weak role fit
0.3): `castExecution' = 68.39` (Δ −2.28), craft falls by `0.2×2.28 = 0.46` points, criticMean by
`≈0.65×0.46 ≈ 0.30` points. Small, legible, and **opposite-signed** to the fame-value gain above — which
is exactly the shape the Beckham/Tyson/Rihanna record shows (§14.6): the same device can raise attention
and lower quality, or raise attention and cost nothing in quality, in the same formula, depending on who
is cast.

Source: `02` §c.1-c.2 (all locators); `01` Q14 (ancestor's fame≠skill precedent); `03a`/`03d` (comparator
fame≠skill precedent, esp. The Executive's independent popularity score, Hollywood Mogul 4's Sex-Appeal
vs. Screen-Presence split); confidence HIGH on engine fit and reused formula shape, MEDIUM on the specific
constants (`CAMEO_RANK_DECAY`, `CAST_WEIGHT.cameo`) — starting points, not calibrated.

### 14.2 Workload, no audition, one-week booking, credit entry

- **No audition.** Casting Sessions V1 stays exactly the three-slot law it is today
  (`CASTING_CANDIDATES_PER_ROLE=2`, `CASTING_MIN_UNIQUE_CANDIDATES=3`, `castingSessions.ts:40,121-142`).
  A cameo is booked directly by fee, never through the slate.
- **One-week booking.** Modeled as a `busy` reservation (the same `busyTalentIds` mechanism rivals'
  packaging already respects, `hollywoodTick.ts:148`) against the flat 8-tick production
  (`PRODUCTION_TICKS=8`, `tuning.ts:57`; `actions.ts:477`), not a role assignment. This is the scheduling
  half of the anti-spam design (§14.3 mechanism 3) and matches *The Longest Day*'s historical shape:
  dozens of stars worked days, not months, at flat fees (`05` §2 item 4).
- **Credit/history entry.** A new `FilmParticipantRole` member `'cameo'` records the appearance
  permanently on the frozen `FilmResult`/`FilmParticipants` exactly like any other participant
  (`types.ts:206-222,238,259`), so a cameo has a durable history entry (Q7's later "legacy cameo" hook,
  §14.7) without touching cohesion, the slate, or the audition system.

### 14.3 The three opportunity-cost anti-spam mechanisms (no arbitrary cap)

**1. Rank-decayed publicity (§14.1).** The pool cannot exceed roughly `2×` the value the single most
famous name alone would contribute (`Σ 0.5^(k-1) → 2` as k→∞), and the marginal value of the k-th famous
name is `0.5^(k-1)` of the first — transparent, inspectable on the forecast card ("publicity: 3 names, 4th
adds +2%"). Precedent: Prima `:3587-3598`.

**2. Fame-priced fee against a bounded, shrinking marginal return — worked arithmetic with the real
`salaryCurve` constants.** Fee = `CAMEO_FEE_FRACTION · salaryCurve(talent)`, `CAMEO_FEE_FRACTION ≈ 0.35`
(`salaryCurve = 25,000 + 150,000·s² + 600,000·f²`, `worldgen.ts:161-167`; `tuning.ts:71-73` — the fame
coefficient is 4× the skill coefficient, i.e. **fee is fame-dominant by construction**). For a fame-90
cameo at low acting skill (`s=0.2`): `salaryCurve = 25,000 + 150,000·0.04 + 600,000·0.81 = 517,000` →
**fee ≈ $180,950**, and this fee is the **same flat amount for every additional fame-90 name signed** (it
is a per-person price, independent of how many other famous names are already in the film). Against that
flat cost, the script's stacking series (§14.1) gives the marginal *return*:

| Cameo # | Fee (flat) | Marginal `starDrawOpening'` gain | Gain as % of the 1st cameo's gain |
|---|---|---|---|
| 1st | $180,950 | +9.18 | 100% |
| 2nd | $180,950 | +2.60 | 28% |
| 3rd | $180,950 | +1.03 | 11% |
| 4th | $180,950 | +0.47 | 5% |
| 5th | $180,950 | +0.22 | 2% |

The first cameo is a legible marketing buy if the fit and quality trade-off pencils; the **second is
already delivering little more than a quarter of the first's return for the identical fee, and every one
after that is a materially worse trade** — this is the "second/third famous cameo is a losing trade"
result the model asked for, produced by the existing fee law plus the rank-decay formula, with no new cap
required. The ledger (forecast's incremental opening vs. `committedCost`, already computed at greenlight)
is the limiter, exactly as Prima's opportunity-cost precedent intended (`:369-375`) and exactly as
Blockbuster Inc.'s uncapped fame/needs mechanic shows what happens when this counterweight is missing
(`03d`, §13.1 above).

**3. Scheduling/availability cost.** A cameo consumes one production-week of the person's `busy` window
(§14.2), so a star cameoing in one film cannot lead — or cameo in — another film that week, for the player
or for a rival (P12 faces the same `busy` law). For studio-contracted talent the cameo also consumes a
production credit under the contract (P14), so cameos compete with *real* roles for the same scarce
star-weeks — the ancestor's explicit "three top-10 Stars in one movie rather than one each in three
films" trade-off (Prima `:369-375`).

**Supporting, non-primary:** audience-fit mismatch (§14.4) makes off-segment cameos worth little even
before the fee is counted (the fame-85/fit-0.4 example in §14.1 gained only +4.39 points versus the
fame-90/fit-1.0 example's +9.18 — fit alone roughly halves the value at similar fame); Hollywood Animal's
tier friction ("the A-lister... refused to share a frame with such peasantry") is a plausible *later*
P14 relationship fact but is not recommended as a first-checkpoint mechanism.

### 14.4 Audience/segment fit

`segmentFit_c` (0..1) = overlap between the cameo's audience profile and the film's target segment shares
(`MarketState.segments`, `types.ts:281`). For film actors the profile is derivable from released-film
segment history (already tracked); for **non-actor professions** (§14.5) P14 supplies a small
profession→segment affinity table (e.g., musician → youngAdult 0.8 / adult 0.4 / family 0.3 / prestige
0.1). This directly reproduces the historical record: Beckham's footballer-in-a-medieval-epic cameo drew
attention in both directions (press coverage *and* mockery — "the worst thing about King Arthur," New
Statesman) without moving the film's underlying reception up or down (`04a` Question I, item 5b) — i.e.
fit governs how much of the raw fame-value converts to usable publicity, and mis-fit does not, by itself,
damage craft (that is what §14.1's separate performance term is for).

### 14.5 Non-actor celebrities: a P14 prerequisite, not a P17 build item

**Flag, not scope creep:** `CreativeRole = writer|director|actor|craft` (`types.ts:18,110`) has no
musician/athlete/TV-personality kind, and `02` §b.2 confirms this explicitly ("There is no
'musician/athlete/TV personality' talent kind... direction U's famous non-actor cameo has no talent type
today"). This model does **not** propose adding that kind inside P17 — P17 consumes public
franchise-role association and continuity history, and owns none of person/contract/profession law
(package-ownership rule, CONTEXT.md). **The addition of a profession/audience-profile field to
`Talent`/`CreativeRole` is a P14 prerequisite** that must land before any Featured/Cameo checkpoint can
cast a real non-actor; until then, Shape A's Featured class is fully usable for famous *actors* in small
roles (still valuable — see `05` §2 items 3-4, marketed cameo and near-cameo star roles, both actor-only),
and the D-9 24-skill profile model already lets such a person carry low acting skills and high fame with
zero `Talent` type change (`types.ts:44-60`) once the profession field exists.

No comparator in the researched batch ships this crossover mechanic either: `03d` explicitly logs it as a
confirmed gap ("No title in this entire research pass... was found to model a famous non-actor... as a
castable cameo"), so there is no shipped implementation pattern to borrow beyond the profession→affinity
table already proposed above.

### 14.6 Interaction with Direction F and P17's actual role here

Direction F requires talent continuity to matter "by FRANCHISE IMPORTANCE of the association," and
explicitly warns against "tiny-role oversized effects." A cameo is, by construction, the smallest role in
the cast — **a cameo must never count as a major franchise association**. This model recommends:

- P17's `keyRecurringTalentAssociations` (or equivalent continuity-history read) consumes only
  PRINCIPAL/SUPPORTING credits plus director/major creative — never `'cameo'` credits — for anything that
  carries expectation or salary leverage (which P17 does not mint anyway, Rule R).
- The **only** channel through which a famous cameo's history may matter to P17 at all is the
  **inherited-awareness input already named in `02` §d.4** (the `setUplift`/`setNovelty`/
  `preMarketingAwarenessOf` seam family), and only for a **returning or crossover** appearance — e.g. a
  franchise's iconic lead doing a one-scene cameo in a spin-off of the same StoryProperty. This should
  surface as a bounded **"legacy cameo" milestone** on the Franchise root (a scalar/flag among the id-list
  facts the root already carries, `02` §f.2's additive pattern) — never a second fame/salary formula, and
  never sufficient by itself to count as "iconic lead" or "major recurring creative" continuity for
  Direction F's purposes.
- **Real-world corroboration that this distinction matters and is drawn correctly by players/critics
  themselves** (`04a` Question I, cross-checked): *Deadpool & Wolverine*'s Evans-as-Human-Torch and
  Garner/Snipes cameos are legacy-flavor beats layered on top of the film's real crossover premise
  (Deadpool + Wolverine as co-leads); by contrast, *No Way Home*'s Maguire/Garfield and *The Flash*'s
  Keaton were **structural returning-lead roles, not cameos**, and `04a` explicitly warns not to conflate
  the two ("Must NOT over-generalize: Treating legacy co-leads as cameos... is a crossover/returning-icon
  effect, not a cameo effect"). Crossover/franchise value belongs to Shape B/C's Additional Principal seat
  and to P17's later crossover scope (direction O), never to the Featured/Cameo class itself.

### 14.7 Package ownership matrix — Direction U elements

| Element | Owner | Why |
|---|---|---|
| FAME VALUE (opening publicity term), PERFORMANCE VALUE (`CAST_WEIGHT.cameo`), quality-damage review note | **P07** | film reception/outcome |
| `starAttention`/`audienceAwareness` consumption of the same term | **P08** | Standing owner, single awareness channel |
| Role classes PRINCIPAL/SUPPORTING/FEATURED/CAMEO as person-facing credit categories; fame; **non-actor profession + audience-profile addition (prerequisite)**; cameo fee law; availability/`busy` window; contract credit consumption | **P14** | person/contract/relationship/Fame authority |
| Segment demand/shares used by `segmentFit` | **P15** | shared market |
| Cash, `committedCost`, ROI of fees | **P11** | money; P17 mints no cash (Rule R) |
| Rival parity (same fee law, same `busy` law, no permutation) | **P12** | bounded rival policy |
| "Legacy cameo" milestone for a returning/crossover famous cameo ONLY; never counts as major franchise association | **P17** | franchise/continuation state; consumes public association, invents no rights, changes no salary |
| Era availability of the Featured tier at all | **P13** | `castCapacity.featured` |
| TV/streaming guest cameos | **P18** | cross-media, explicitly out of this scope |

### 14.8 Dominant-strategy checks

**"Sign ten celebrities to every film."** Refuted by §14.3 mechanism 2's arithmetic directly: fee is flat
per person (fame-dominant, `600,000·f²`) while marginal `starDrawOpening'` gain collapses geometrically
(100% → 28% → 11% → 5% → 2% of the first cameo's gain for cameos 1-5). By the 3rd cameo the player is
paying the *same* $180,950 for *11%* of the value the first purchase delivered — a mechanically enforced
losing trade with no cap needed. Structurally reinforced by the bounded array itself (Featured ≤2 per
era, §13.0) as defense-in-depth, and by mechanism 3 (a 10-cameo film would need to book 10 people's
production-week `busy` windows simultaneously, competing with every other production — including the
player's own — for the same scarce star-weeks).

**"Famous non-actors dominate trained actors."** Refuted by the performance-value split itself:
`CAST_WEIGHT.cameo = 0.10` (vs. `support = 0.35`, `lead = 1.0`) means a cameo's acting skill can only ever
move `castExecution` by a small, bounded amount, and cameos are **excluded from the cohesion centroid**
entirely (`ROLE_WEIGHT`, §14.1) — so no amount of cameo casting can substitute for a well-executed
principal performance on either axis the reception model actually rewards at meaningful weight. This
mirrors the ancestor's own design (a Star placed outside a lead slot "gets none of the usual lead-role
benefits," Q12) and the historical record (Space Jam's 37% RT score alongside a $230M gross shows fame
converts to *attendance*, not to the *critical/quality* channel the cameo's low weight already isolates).

**"Cameo-spam is free publicity."** Refuted twice over: the fee is never free (§14.3 mechanism 2, a real,
fame-dominant dollar cost every time), and the rank-decay bounds the *entire pool* — no matter how many
cameo slots existed — at **≤2× the single most famous name's contribution** (`Σ_{k=1}^{∞} 0.5^{k-1} = 2`,
verified: the 5-cameo stacking series above is already at 50.69 against a single-cameo value of 46.38 and
a theoretical ceiling near 50.7-51, i.e. essentially fully converged by the 4th-5th name). Spam does not
scale the reward; it only scales the cost.

### 14.9 Worked greenlight card (what the player would actually see)

Illustrative scenario: a drama with 3 principals (lead fame 40 skill 70/fit .8, antagonist fame 25 skill
65/fit .75, support fame 15 skill 60/fit .7) considering one Featured/Cameo slot: a famous musician
(fame 85, acting skill 20, fit 0.4 — off-genre) at a proposed fee.

| Line on the forecast/greenlight card | Without cameo | With the musician cameo |
|---|---|---|
| Publicity (`starDrawOpening'`) | 37.2 | 41.6 (+4.4, "1 famous name, off-genre fit reduces the gain") |
| Craft — cast execution contribution | 70.7 | 68.4 (−2.3, "a weak-fit cameo performance") |
| Estimated critic-score effect | — | ≈ −0.3 pts |
| Cameo fee (fame-priced, `CAMEO_FEE_FRACTION 0.35`) | — | ≈ $164,000 (fame 85, skill 20: `salaryCurve≈$467,900`) |
| Booking | — | 1 production week, person marked `busy` studio-wide for that week |
| Credit | — | `FilmParticipantRole: 'cameo'`, permanent on `FilmResult` |
| Cohesion (`ROLE_WEIGHT` centroid) | unchanged | unchanged (cameo excluded) |
| Franchise/continuity effect | n/a | **none** unless this is a returning franchise figure in a bounded crossover context (§14.6) — and even then, flavor-only, never a "recurring association" for Direction F |

The card is deliberately small and legible: one positive number (publicity), one negative number (craft),
one dollar figure (fee), one schedule fact (busy week) — a player can read "is this cameo worth $164k" in
four lines, and the arithmetic behind each line is the existing engine formula family with one new,
bounded, additive term.

---

## Open questions carried forward (Owner / cross-package)

1. **The literal two-hander (§13.5).** Making any of the three required seats optional is a core-charter
   change with byte-identity risk across every layer in §13.1's table — **Owner decision**, separate from
   this report's recommended Shapes A-C, none of which require it.
2. **Exact tuning constants** (`CAMEO_RANK_DECAY 0.5`, `CAST_WEIGHT.cameo 0.10`, `CAMEO_FEE_FRACTION
   0.35`, one-week booking, `castCapacity` era thresholds) are starting points for calibration, carried
   from `05` and re-verified for internal consistency in §14.1-14.3, not owner-approved values.
3. **P14 profession/audience-profile field** (§14.5) is a hard prerequisite for any real famous-non-actor
   cameo; until it lands, Shape A is still fully valuable for famous *actors* in small roles.
4. **Elberse (2007)** star-revenue figures remain MEDIUM confidence (HBS summary only, primary 403'd,
   `05` §7) — does not change any recommendation above, which rests on engine fit + ancestor precedent +
   the historical pattern independent of that one academic figure.
5. **Rival greedy-fill policy for optional seats** (Shapes B/C, `hollywoodTick.ts:148` moving from
   `===3` to `≥3`) is a P12 register SIM-009 dormant-dimension activation, not yet designed in detail —
   flagged for P12 ownership, not resolved here.
