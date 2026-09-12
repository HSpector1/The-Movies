> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`../redteam/R3-reviewer-corrections-calc.py`](../redteam/R3-reviewer-corrections-calc.py), committed output [`../redteam/R3-output.txt`](../redteam/R3-output.txt) — **the report governs.** Superseded here: the linear remake term `18·(q/100)·clamp(1 − age/780 wk)` (canonical: `0.5·q_ref·2^(−age/260 wk)` as an awareness discount); the reboot Fatigue seed 'γ(0.2) × decayed average of prior branches' (canonical: Fatigue is property-wide, no seed); the LIFETIME branch cap `N_MAX_BRANCHES = 8` (canonical: ≤3 open continuities, unbounded lifetime, history collapsed — report §10, Probe 6); the 104/260-week band thresholds (canonical: 150/26); the 520/26/78-week half-lives (canonical: 650/24/104); the `recognitionPeak` meter variant (canonical: §5.2 running scalars); a stored `keyAssociations[]` (canonical: derived).

# P17 Model M3 — Franchise Object, Bounded Branches, Remake/Reboot, Rights Transfer, Lifecycle, Early Greenlight

Paper model only. No repo edits, no branches, no builds, no runtime. Every engine fact below is cited
`file:line` against commit `13370d428f0693f3279732f6f4cc360a7fcaa4df` via evidence file
`02-project-studio-architecture-READONLY.md` (cited as **[02:§x]**). Real-franchise evidence is cited
against `04a-real-franchises-set-A.md` / `04b-real-franchises-set-B.md` (**[04a/04b:§x]**). Comparator
evidence against `03a`–`03e` (**[03x:§y]**). All constants are STARTING POINTS for playtesting, marked
`(STARTING POINT)`, never claimed as balanced. A throwaway numeric script that produced every worked
number below lives at `models/m3_worked_numbers.py` in this same scratchpad folder (python3; never
touched the repo).

Do NOT reopen Owner directions A–U. Two places below name a **structural correction** to how Direction M's
field list would be implemented; both are the smallest fix that keeps the direction's intent intact.

**Scope boundary against sibling models in this same batch.** This file owns the Franchise/Branch object
skeleton, the Remake-vs-Reboot state machine, rights-transfer behaviour, lifecycle bands, the no-kill rule,
and (the player side of) early-greenlight legality — none of which any other model in this batch covers.
It does **not** own the R/M/F *formula itself*: three dedicated candidate designs exist side by side in
this same `models/` folder (`m1a_three_meters.py`/Model A — impulse + pure exponential decay;
`m1b_derived_kernels.py`/Model B; `M1c-rmf-debt-ledger.md`/Model C — itemised Momentum ledger + Fatigue as
a paid-down debt), and picking among them is the report-writer's job, not this file's. §4 below therefore
offers a **self-contained, minimal illustrative mechanic** — in the same general impulse-plus-exponential-
decay shape as Model A — used only to produce this file's own worked numbers (the historical-weighting
example, the F-half-life-vs-real-dormancy-gaps check, the reboot comparison-term contrast). Every place
`Branch.momentum`/`Branch.fatigue`/`Franchise.recognition` appears in §1's shape is a **storage slot**, not
a formula commitment: swap `momentum: number` for Model C's `momentumLedger: MomentumEntry[]`, or either
meter for Model B's kernels, and nothing else in this file's branch/lineage/rights/lifecycle/legality design
changes. Similarly, M4 (SubProperty/Spin-off/Crossover) and M5 (cast continuity, rival franchise behaviour,
the *rival* side of early greenlight) go substantially deeper on those two sub-areas than the pointers given
here in §2 and §7; this file's coverage of them is what its own brief required (the branch-bounding rule and
the player-side greenlight law), not a duplicate deep-dive.

---

## 0. One-paragraph shape

A `Franchise` is created **lazily**, the first time anyone greenlights a continuation of a StoryProperty —
never at the original film's own release (most films never get one, matching Direction J's "not every
fictional noun is IP"). It stores a **property-level Recognition** (slow, peak-anchored) and a small,
**bounded list of Branches**, each carrying its own **Momentum** and **Fatigue** (fast/medium, decaying).
Lineage is a flat list of single-parent edges — a tree, never a graph, until Crossovers (Direction O) add a
second edge kind later. Everything a player or a lifecycle band needs is either one of these compact stored
scalars or a pure function of them computed at read time; nothing about a continuation's *legality* ever
reads box-office or critic score (Direction E).

---

## 1. The P17 root — TypeScript shape, every field justified, STORED vs DERIVED

### 1.1 Types

```ts
// New SaveFileV20 top-level root. Array-of-records (like FilmConcept[]/`state.concepts`), not a
// Record<id,…> map, to match house convention [02:a.6, f.1]. Absent-safe on every pre-V20 fragment
// per the productionIdentity.ts:42-43 precedent [02:f.2].
type Franchises = Franchise[]

type FranchiseId = string   // minted once at first-continuation time; never reassigned/re-minted
                             // (same permanence law as FilmConcept.id [02:b.1, "permanent identity… may
                             // never be removed, reassigned, or re-minted"])
type BranchId = string      // scoped inside one Franchise; permanent once minted
type MilestoneId =          // CLOSED, versioned enum — HIS-014 "never persist labels… without definitions"
  'firstContinuation' | 'firstReboot' | 'firstSpinoff' | 'firstCrossBranchRevival' |
  'longestDormancyBroken' | 'branchEnded'

type ContinuationType = 'sequel' | 'prequel' | 'spinoff' | 'remake' | 'reboot'  // Direction A exactly;
                                                                                 // TV/cross-media excluded (P18)
type BranchType = 'main' | 'reboot' | 'spinoff'   // Direction N
type RoleImportance = 'iconicLead' | 'majorSupporting' | 'recurringAntagonist' |
                       'signatureDirector' | 'majorCreative'   // Direction F's named tiers, closed enum

type Branch = {
  branchId: BranchId
  type: BranchType
  parentBranchId: BranchId | null      // non-null only for 'spinoff' (its origin branch); null for 'main'
                                        // and for 'reboot' (a reboot supersedes the StoryProperty's
                                        // continuity, it does not narratively branch FROM the old branch —
                                        // see §3.2 for how it still reads the old branch's history)
  subPropertyId: string | null         // P16-minted id; REQUIRED non-null iff type === 'spinoff' (Direction J)
  openedAtWeek: number                 // week of this branch's first installment; branch age = now − this
  momentum: number       // STORED — branch-scoped. Range ≈ [−50,+50], neutral 0. See §3 for why per-branch,
                          // not per-franchise: 04a Q.A/D explicitly call for tracking Momentum "per branch/
                          // SubProperty, not only per franchise" (Brand New Day 2026 set the all-time MCU
                          // opening 12mo after a soft MCU year but 55.5mo after its OWN sub-property's last
                          // film [04a:§1.1/1.2, PART2-A.5]).
  fatigue: number        // STORED — branch-scoped, range [0,100], floor 0. Branch-scoped for the same
                          // reason, plus the Terminator/Genisys/Dark Fate evidence that fatigue is a
                          // property of a CONTINUITY's track record, not a franchise-wide fog [04b:§1.4].
  lastReleaseWeek: number | null   // null = branch has a locked greenlight but no release yet (feeds G, §7)
}

type LineageEdge = {
  childProductionId: string          // FilmResult.productionId of the continuation itself
  parentProductionId: string | null  // the film it continues from/references; null ONLY for a
                                      // StoryProperty's very first modeled installment (rare — see §0's
                                      // lazy-creation rule; usually every edge has a real parent)
  type: ContinuationType
  branchId: BranchId
  similarity: number   // 0..1 input to branch Fatigue's "sameness" weight (Sood & Drèze: satiation tracks
                        // sameness, not count [03e:§0 headline, §13 ADAPT]). Type-keyed defaults
                        // (STARTING POINT): sequel/prequel 1.0, remake 0.9, reboot 0.6, spinoff 0.4.
}

type KeyAssociation = {
  talentId: string
  roleImportance: RoleImportance
  lastInstallmentId: string   // productionId of the most recent installment carrying this association —
                               // lets a "present / recast / absent" check run without re-walking every
                               // FilmParticipants record [02:a.4]
}

type Milestone = { milestoneId: MilestoneId; productionId: string; week: number }  // id-keyed only

type Franchise = {
  franchiseId: FranchiseId
  storyPropertyId: string        // exact P16 StoryProperty id — the ONLY key [02:g.1 INT-012, g.2]
  branches: Branch[]             // bounded lifetime total ≤ N_MAX_BRANCHES (STARTING POINT 8) — §2.3
  installments: LineageEdge[]    // one edge per continuation ever greenlit under this property
  subPropertyIds: string[]       // bounded named SubProperties (Direction J), P16-minted ids only
  keyAssociations: KeyAssociation[]   // soft-capped ~12, kept by (roleImportance desc, recency desc);
                                      // never hard-deleted (no-kill spirit, §8) — in practice a franchise
                                      // rarely accumulates more than a handful of these (one iconic lead,
                                      // one antagonist, one director, per branch-generation)
  milestones: Milestone[]        // id-keyed; bounded by the enum's own size, never by playthrough length
  recognition: number            // STORED — property-level, 0..100. "R_current" in §4.
  recognitionPeak: number        // STORED — property-level, 0..100, monotonic non-decreasing high-water
                                  // mark. This is the literal implementation of "Recognition anchored to
                                  // peak(s) with slow decay" (Direction Q) — see §4.
  lastReleaseWeek: number        // top-level convenience field the task's shape asks for — see §1.2, it is
                                  // DERIVED, not an independent write
}
```

### 1.2 STORED vs DERIVED — exact split

| Field | STORED | DERIVED (read model) | Why |
|---|---|---|---|
| `franchiseId`, `storyPropertyId` | ✅ | | exact-id identity law [02:g.1] |
| `branches[].{branchId,type,parentBranchId,subPropertyId,openedAtWeek}` | ✅ | | identity/config, written once |
| `branches[].{momentum,fatigue,lastReleaseWeek}` | ✅ | | fast/medium state that must survive a save round-trip and cannot be cheaply recomputed from raw film history without re-walking every release (save-size law, [02:f.2]) |
| `installments[]` | ✅ | | lineage IS the data; nothing to derive it from except itself |
| `subPropertyIds[]`, `keyAssociations[]`, `milestones[]` | ✅ | | small, bounded, id-keyed history |
| `recognition`, `recognitionPeak` | ✅ | | slow state; same non-recomputability argument as branch M/F |
| **top-level `lastReleaseWeek`** | ❌ | ✅ = `max(b.lastReleaseWeek for b in branches)` | pure mirror of branch data; storing it independently risks drift on every branch write. Kept in the type only because the task's requested shape names it — implemented as a getter, never assigned. |
| **"current rights owner"** | ❌ (see §1.3) | ✅ = P16 lookup by `storyPropertyId` at decision time | see structural correction below |
| Lifecycle band (ACTIVE/COOLING/DORMANT/…) | ❌ | ✅ = `f(branch.momentum, branch.fatigue, weeksSince(branch.lastReleaseWeek))` | Direction P: "never stored" — §6 |
| Legality of a proposed continuation | ❌ | ✅ = a pure check over P16 rights + branch/SubProperty existence, **never** over R/M/F | Direction E — §9 |
| "Is association X still exploitable" (talent availability) | ❌ | ✅ = live P14 lookup | P14 owns availability, not P17 [02:h.10] |
| UI descriptor strings, comparison-band text | ❌ | ✅ | never persisted narrative (HIS-014) |

### 1.3 Structural correction to Direction M's field list

CONTEXT.md Direction M lists **"current rights owner ref"** as a field of the lightweight Franchise
identity. Storing it literally would (a) duplicate P16's authority over rights on a second object — exactly
what INT-012 forbids ("franchise aggregate cannot become a second property identity" [02:g.2]) — and (b)
go stale the instant P16 records a sale, requiring P17 to be touched on every rights transaction it should
be inert to. **Smallest correction:** realize "current rights owner" as a **derived, zero-byte P16 lookup by
`storyPropertyId` at decision time**, never a cached id on `Franchise`. This is not a new mechanism — it is
exactly the "additive source-reference seam without claiming a property, right, owner" pattern P12 already
follows for its own P16-adjacent facts [02:g.1]. Bonus: because nothing on `Franchise` names an owner, **a
P16 sale writes zero bytes to the P17 root** (see §8), which is also the cleanest possible guard against
orphaned-owner staleness (see stress test #1, §10).

### 1.4 Byte estimate (worked)

Per-field estimates and two totals (typical vs. a Bond-scale 25-installment franchise), computed in
`models/m3_worked_numbers.py`:

```
scalars (franchiseId+storyPropertyId+recognition+recognitionPeak):        40 B
branches   (typical n=2 @ ~58B):                                         116 B
branches   (lifetime cap n=8 @ ~58B):                                    464 B
installments (typical n=10 @ ~41B):                                      410 B
installments (long-running n=40 @ ~41B):                                1640 B
subPropertyIds (typical n=2 @ ~12B):                                      24 B
keyAssociations (typical n=6 @ ~25B):                                    150 B
milestones (typical n=5 @ ~18B):                                          90 B
------------------------------------------------------------------------------
TYPICAL franchise:            ~830 B
LONG-RUNNING (Bond-scale):   ~2,542 B
```

Both figures are **smaller than one already-oversized `FilmResult`** (3,146 B average, already a qualified
miss against a 1.5 KB target [02:f.2, PERF-009]). Most `FilmConcept`s will never acquire a `Franchise`
object at all (lazy creation, §0), so P17's total footprint against a save that is already 37.8 MB over
budget [02:f.2] is negligible **provided** the bounding rules in §2.3 hold — which is exactly why they are
hard caps, not soft guidance.

---

## 2. The branch model

*(M4 additionally describes a rare, later, P16-authorized **promotion** path where an exceptionally
successful spin-off branch graduates into its own independent StoryProperty/Franchise root — carrying its
accrued R/M/F/installments over as starting state. That is compatible with, and layered on top of, the
branch model below: every spin-off starts life exactly as described here — a bounded branch inside its
parent's `Franchise` — and only the rare promoted case ever needs a second `franchiseId` minted. Nothing
below assumes promotion happens; nothing below is broken if it never does.)*

### 2.1 Shape

- **`main`** — the StoryProperty's original continuity. Created implicitly the first time any continuation
  is greenlit (see §0's lazy-creation rule); there is exactly one `main` branch per Franchise, ever.
- **`reboot`** — a new, bounded continuity restarting the StoryProperty. `parentBranchId: null` (it does not
  hang off the old branch; it supersedes it — see §3.2 for what it still reads from the old branch).
- **`spinoff`** — hangs off a **SubProperty** (Direction J: "character/organization-team/location/major
  concept" bounded and named under the parent StoryProperty), `subPropertyId` required, `parentBranchId` =
  the branch it spun off from.

### 2.2 UI: "what connects to what?" — one indented list, no graph

```
Story Property: [name resolved live from P16, never stored on P17]
├─ MAIN continuity
│   ├─ Film 1  (origin)
│   ├─ Film 2  — sequel
│   └─ Film 3  — sequel               [Momentum ▼ negative · Fatigue ▲ elevated]
├─ REBOOT continuity (opened wk 940)
│   ├─ Film 4  — reboot
│   └─ Film 5  — sequel               [Momentum ▲ · Fatigue neutral]
└─ SUB-PROPERTY: "[Character X]"
    └─ SPIN-OFF continuity
        └─ Film 6  — spinoff
Remakes attach as a leaf under whichever branch they were greenlit in — they do not get their own row
of continuity, only a distinguishing icon/label (see §3.1).
```

This is literally a depth-2 tree walk over `branches[]` and `installments[]` grouped by `branchId` — the
UI never needs a general graph layout engine. Two independent comparators flag "can the player see, at a
glance, every installment in a franchise/branch" as a shipped **failure point** when it is missing (The
Executive's IP/Franchise confusion [03d:§310-332]; Movie Tycoon's unfiltered sequel-list scroll
[03d:§620-625]) — this is adopted here as a **hard UI acceptance criterion**, not a nice-to-have
[03d:§651-659 ADOPT].

### 2.3 The anti-spaghetti rule

**`N_MAX_BRANCHES = 8` (STARTING POINT) — a lifetime cap on branches *ever created* per StoryProperty, not
on how many are concurrently active.** Choosing a *lifetime* cap rather than a *concurrent* cap is
deliberate: Direction S forbids a kill button, so there is no clean way to "retire" a branch to free a
concurrent slot without either (a) a disguised kill button or (b) letting dormant branches silently stop
counting (which reopens the door to unbounded creation over a long enough campaign). A lifetime cap of 8
sidesteps the conflict entirely — a StoryProperty gets at most 8 continuities across the entire ~120-year
Legacy horizon [02:g.2 HIS-014], which every real case in the evidence corpus comes nowhere near (Star Wars:
1 main + at most 1 more if a true reboot is ever declared; Batman: 1 main + 2 reboots + 1 spinoff (Joker) =
4; Bond: 1 continuity across 60+ years, arguably 2 if Craig's run counts as a soft reboot). 8 is generous
headroom, not a tight fit.

**Crossovers are out of scope for this root's edge shape** (Direction O). When they land, they must be a
**separate edge kind** — a symmetric multi-parent event referencing two or more *branch heads*, never a
mutation of `LineageEdge.parentProductionId` into an array. This keeps every edge written before crossovers
exist permanently valid and keeps the indented-list UI a tree forever; only the later crossover feature adds
a second, explicitly graph-shaped view. (Stress test #8, §10.)

---

## 3. REMAKE vs REBOOT

### 3.1 REMAKE

- References **exactly one** prior `FilmResult` — the retold film — via a `LineageEdge{type:'remake',
  parentProductionId: <that film's productionId>}`.
- **Does NOT open a branch.** Decision, with justification: a remake's edge is filed into **whichever
  branch was active at its own greenlight** (almost always `main`, since a remake by definition retells an
  *existing* film rather than continuing a specific ongoing continuity). If a remake later proves popular
  enough to earn its own sequel, that sequel is simply `type:'sequel', parentProductionId: <the remake's
  productionId>`, staying in the **same** branch — it does not retroactively spin the remake into its own
  branch. Two independent reasons rule out retroactive branch creation: (1) it would require rewriting a
  past edge's `branchId`, violating the forward-only, no-retroactive-rewrite save law
  [02:f.1, ADR-0004: "Migration must preserve permanent IDs… Unsupported… malformed input, and downgrade
  attempts fail loudly"]; (2) it would let every successful remake silently spend one of the 8 lifetime
  branch slots (§2.3), which the evidence does not support needing — a remake-that-got-a-sequel behaves,
  in the data, exactly like an ordinary sequel chain (no real case in 04a/04b shows a remake's own sequel
  chain needing branch-level bookkeeping distinct from an ordinary sequel).
- **Comparison term** = `f(referenced film's remembered quality, its age)`. Modeled as a bounded optional
  input (the `setUplift`/`setNovelty` seam pattern [02:d.4, reception.ts:87-103]), never a new P07 formula:

  ```
  comparisonPenalty(refQuality0to100, ageWeeks) =
      BASE_K(18) × (refQuality/100) × clamp(1 − ageWeeks/RECENCY_WINDOW(780wk≈15yr), 0, 1)
  ```

  A remake of something **recent and well-regarded** takes the full penalty (audiences judge it directly
  against a film they remember well — Never Say Never Again (1983) lost to the *same-year* incumbent Bond
  film Octopussy, $160M vs $183.7M [04a:§1.5, PART2-F]); a remake of something **old or poorly-regarded**
  takes little to none (dormancy/nostalgia helps — Direction H). **Inherits property Recognition** exactly
  like any other continuation (it reads the current `recognition` scalar for its awareness/expectation
  input, same seam as everything else).

### 3.2 REBOOT

- Creates a **new branch** (`type:'reboot'`, `parentBranchId: null`). Inherits **Recognition** (property
  level — nothing to do, it is the same scalar every branch reads). **Resets branch Momentum to exactly 0**
  at creation.
- **Fatigue does NOT reset to neutral outright** — this is the one place F crosses a branch boundary, and
  it is why "reboot is not a fatigue cure" (Terminator: three consecutive "new trilogy" reboots — Salvation
  2009, Genisys 2015, Dark Fate 2019 — each restarted continuity and each failed; Dark Fate had the
  *best* reviews of the three and lost the most money [04b:§1.4]). Rule:

  ```
  F₀(new reboot branch) = γ(0.2, STARTING POINT) × weighted-average(F at end of every prior branch of this
                            StoryProperty, each individually decayed by its own dormancy gap under the
                            normal branch-Fatigue decay law, §4)
  ```

  A single prior branch that ended cleanly (low F at dormancy, long gap) seeds next-to-nothing — this is
  why Batman Begins (2005, after one bad branch, 8-year gap) and Casino Royale (2006, after one uneven
  branch) could open clean. A **pattern** of weak branches compounds: after Salvation's and Genisys's F
  values both feed the average, Dark Fate's starting F floor is already elevated before its own reception
  even lands, which is exactly the shape of "accumulated distrust from the *second and third* mediocre
  entries" the real data shows [04b:§1.4 "the killers were consecutive weak entries," Q.C safe rule].
- **Partial comparison term, conditionally** (TASM 2012 evidence): apply `W_PARTIAL(0.4, STARTING POINT) ×
  comparisonPenalty(...)` from §3.1's formula **only if** the *old* branch's most recent installment was
  both recent (`age < RECENT_WINDOW(416wk≈8yr)`) **and** well-received (`quality ≥ STRONG_THRESHOLD(65)`).
  Worked contrast (`models/m3_worked_numbers.py`):

  | Case | Prior film age | Prior film quality | Condition met? | Comparison term |
  |---|---|---|---|---|
  | The Amazing Spider-Man (2012), retelling the 2002 origin 10yr after Raimi's trilogy, whose last entry (Spider-Man 3, 2007) was only 5yr old | 260 wk | 60 | recent=yes, strong=borderline | **2.88** (0.4 × 7.20 full-remake-shaped penalty) — TASM opened −46% vs Spider-Man 3's opening, the "too soon" press framing [04a:§1.6/Controls, PART2-F] |
  | Casino Royale (2006), after Die Another Day (2002), 4yr gap but DAD was mixed-to-weak | 209 wk | 40 | strong=no | **0** — condition fails on quality, not age; CR set a series-record gross [04a:§1.5] |

  If the old branch is **dormant, damaged, or confusing** (Direction H's stated reboot use-case),
  the condition is false and the reboot pays **no** comparison tax at all — matching Casino Royale, Batman
  Begins (after 8yr and an 11%-RT predecessor), and The Batman 2022 (after a long, JL-damaged DC gap).

---

## 4. Recognition / Momentum / Fatigue — illustrative formulas and the historical-weighting worked example (Q)

*(As flagged in the scope note at the top of this file: this section is a minimal, self-consistent stand-in
used only to drive this file's own worked numbers — the R/M/F formula itself is being decided among
Models A/B/C. Read every constant here as "whichever candidate wins, something with this shape.")*

All three read **only public `FilmResult` facts** (`criticScore`, an audience score, `boxOffice.total` vs.
the locked `forecast.expectedTotal`) [02:c.5, d.3] — never write P07/P08/P11 state (law #2).

```
qualityRaw = 0.4·(criticScore/100) + 0.3·(audienceScore/100)
           + 0.3·clamp(boxOffice.total / forecast.expectedTotal, 0, 2)/2
excitement = qualityRaw − 0.5           // 0 = "met a mediocre bar"; range ≈ [−0.5, +0.5]
```

**Momentum** (branch-scoped, decays to neutral=0, half-life 26wk STARTING POINT — "spendable within
1–3 years" [04b:§Q.A]):
```
at release:      M ← decay(M, weeksSincePriorRelease) + IMPULSE_M(60) × excitement
between releases: M(t) = M · exp(−ln2/26 · weeks)
```

**Fatigue** (branch-scoped, floor 0, half-life 78wk STARTING POINT — slower than Momentum, per
[04a:§Q.B "Fatigue decays slower than Momentum"]):
```
at release: F ← max(0, decay(F, Δwk) + IMPULSE_F(50)·similarity·max(0,−excitement)
                        − RELIEF_K(0.4)·max(0, excitement−0.15)·F)
```
A mediocre-or-worse, high-similarity release raises F; nothing about a *good* release raises it; an
*excellent* release (`excitement > 0.15`) gives partial relief (up to ~40%, never a full reset) — matching
"a single good entry after several mediocre ones should reduce Fatigue only partially, not reset it"
[04b:§Q.B].

**Recognition** (property-scoped, `recognitionPeak` a monotonic high-water mark; `recognition` relaxes
toward a floor at `FLOOR_FRAC(0.55) × recognitionPeak`, half-life 520wk≈10yr STARTING POINT — the literal
mechanism for "anchored to peak(s), slow decay," Direction Q):
```
at release: recognitionPeak ← max(recognitionPeak, recognition + IMPULSE_R(25)·max(0,excitement))
            recognition ← clamp(recognition + IMPULSE_R(25)·max(0,excitement)
                                              − PENALTY_R(4)·max(0,−excitement),
                                 FLOOR_FRAC·recognitionPeak, 100)
between releases: recognition relaxes toward FLOOR_FRAC·recognitionPeak with half-life 520wk
```
The asymmetry (`IMPULSE_R=25` on a hit vs. `PENALTY_R=4` on a flop, roughly 6:1) is what makes Recognition
behave like peak-anchoring without literally storing a list of past films: it ratchets up fast on a smash
and erodes only glacially through mediocrity.

### Worked example — "Film1 smash + Film2 dud leaves R high and M low" (Q)

Baseline: modest new property, `M=0, F=0, R=20 (Rpeak=20)`. Film1: critic 90, audience 88, box $500M vs
$300M forecast (excitement +0.374). 30 weeks pass. Film2: critic 35, audience 38, box $90M vs $280M forecast
(excitement −0.198). Computed by `models/m3_worked_numbers.py`:

| Step | M | F | R | Rpeak |
|---|---|---|---|---|
| start | 0.0 | 0.0 | 20.0 | 20.0 |
| after Film1 (smash) | **+22.4** | 0.0 | 29.4 | 29.4 |
| +30wk decay | +10.1 | 0.0 | 28.8 | 29.4 |
| after Film2 (dud) | **−1.8** | **9.9** | **28.0** | 29.4 |

Recognition drops only 29.4 → 28.0 (≈95% retained against its own new peak) while Momentum swings from
+22.4 all the way past neutral to **negative** (−1.8) and Fatigue rises off the floor (9.9) — exactly the
qualitative shape the evidence demands and matches the real Terminator pattern (openings held in a $27–44M
band — Recognition intact — while legs and financing willingness collapsed — Momentum/Fatigue moved
[04b:§1.4]).

### Cross-check — F's half-life against real dormancy gaps

```
Batman 1997→2005 (417wk, 5.3 half-lives): F 90 → 2.2   (clears; Begins succeeded clean)
Bond   1989→1995 (330wk, 4.2 half-lives): F 70 → 3.7   (clears; GoldenEye +125% WW)
Star Wars 1983→1999 (835wk,10.7 half-lives): F 40 → 0.02 (fully clears)
```
A 78-week half-life naturally explains why every real revival at a 5+ year gap in the corpus came back
clean — no case needed a "20-year lock" (Direction H is satisfied by the decay constant alone, not by a
hard rule).

---

## 5. Rights transfer mid-franchise

- The `Franchise` object hangs off `storyPropertyId`, never off a studio id — there is no `studioId`
  field anywhere on it (§1.1). A P16 sale event is therefore **invisible** to the P17 root: nothing is
  written. "Current rights owner" is always a live P16 lookup (§1.3).
- **Historical films stay attributed** to their original studio via the *existing* `studioHistory`/
  `IndustryFilm.studioId` facts [02:a.5, e.1] — P17 never touches those.
- **Recognition/Momentum/Fatigue travel with the property** (they are keyed to `storyPropertyId`/`branchId`,
  never to a studio) — "the audience does not care who owns it." Real-world confirmation: Deadpool &
  Wolverine (2024), released three years *after* Disney's 2019 acquisition of the X-Men StoryProperty from
  Fox, opened at $211.4M and grossed $1.34B [04a:§1.6 Controls] — audience recognition for the X-Men
  property plainly survived the ownership change. This is a **deliberate divergence from Software Inc.**,
  whose shipped model makes IP "popularity" NOT transfer to an acquirer, leaving it colder than under the
  seller [03d:§67-93] — the comparator is noted and explicitly rejected in favor of the owner-selected,
  real-world-confirmed rule.
- **Key talent associations travel** (they live on `Franchise.keyAssociations`, not on any studio record).
  **Contracts do not** — those are P14's exclusively [02:h.10 confirms "cannot overwrite historical
  credits or assume a person remains available"].
- **The transfer itself may leave the franchise DORMANT with zero P17 penalty.** Bond's 2021→≥2028 gap is
  driven entirely by Amazon's 2022 MGM acquisition and Feb-2025 creative-control takeover, not by audience
  rejection — the franchise is simply between owners [04a:§1.5]. Under this model that is not even a
  distinct state: the lifecycle band (§6) reads only `(M, F, weeksSinceLastRelease)`, and since nothing
  about a P16 sale writes any of those three, a franchise sitting in escrow just accrues weeks like any
  other quiet period — no special-cased "ownership dormancy" flag is needed or wanted.

---

## 6. Lifecycle bands (Direction P) — derived, never stored

```
band(M, F, w):                                   // w = weeks since branch.lastReleaseWeek
  if w ≤ 104 and M ≥ −20:            ACTIVE
  elif (104 < w ≤ 260) or (w ≤ 104 and M < −20):  COOLING
  elif w > 260 and F ≥ 25:           DORMANT
  elif w > 260 and F < 25:           REVIVAL CANDIDATE
"ACTIVE AGAIN" — a transient one-release flourish, not a fifth stored state: evaluate the SAME formula
using the branch's PRE-write `lastReleaseWeek` at the moment a new release lands; if that prior evaluation
was DORMANT or REVIVAL CANDIDATE and the new w is small, mint the existing `firstCrossBranchRevival`/
`longestDormancyBroken`-style milestone id and let the UI show "Active Again ✦" for one release cycle. No
new field.
```
Notes: thresholds are STARTING POINTS (104wk≈2yr, 260wk≈5yr). All three inputs matter — `w` sets the
coarse band, `M` demotes a *very recent* flop out of ACTIVE early (a franchise whose newest film just
bombed hard should not read identically to one that just had a hit), `F` (not `R`!) distinguishes DORMANT
from REVIVAL CANDIDATE **on purpose** — the task specifies the band formula takes only `(M,F,w)`, so
Recognition is deliberately kept as a *separate*, always-visible axis ("how strong could a revival be")
rather than folded into "whether one is due." Never permanently unusable: every band is reachable from
every other band by nothing but time and a new release; there is no terminal state (Direction P; see also
§8's no-kill rule and §9's confirmation that legality never depends on any of R/M/F).

---

## 7. Early continuation greenlight (Direction G) — legality, not a new mechanism

**Predecessor "sufficiently committed"** = a `Production` exists for it with a locked `forecastSnapshot`
[02:d.3, a.2] — i.e., it has been greenlit, whether or not it has released. This is the exact same
"locked-at-greenlight" object the engine already uses for every production; G needs no new state.

- The continuation's own greenlight-time expectation input reads **only**: (a) the predecessor's *locked*
  `Production.forecastSnapshot` (public — three scalars, already computed, already the number the
  newspaper/broadcast will judge the predecessor against [02:d.3]) and (b) the **current** branch
  `M`/`F` and property `R` *as of right now* — **never** the predecessor's actual (not-yet-existing)
  `FilmResult`. There is nothing to withhold by construction: the predecessor's `FilmResult` literally does
  not exist yet if it hasn't released.
- **Locked-at-greenlight law, confirmed unchanged**: when the predecessor later releases, the
  continuation's *own* `FilmResult.forecast` (copied from its locked `forecastSnapshot` at ITS OWN
  greenlight) is never retroactively touched [02:d.3, "forecast lock vs realized"] — this is the existing
  engine law, not a new one. What *does* update is the live `branch.momentum`/`.fatigue` and
  `franchise.recognition`, which the continuation's *own* eventual release will read fresh when it
  computes its own segment appeal/marketing efficiency later — the player sees the new descriptor band
  (§6) change under their feet between greenlight and release. This is the intended risk (Direction G).
- **Rivals make the same bet through the same policy branch**: `chooseIndustryPackage` already runs
  `computeForecast`/`marketingCapacityForInputs` over `ReceptionInputs` for every rival decision
  [02:e.3, hollywoodPolicy.ts:41-52] — the same optional-input seam this model proposes (§3.1's
  `comparisonPenalty`, and an analogous "inherited awareness" input per [02:d.4]) is automatically
  available to rival packaging with **no** rival-specific code. Adding a continuation *choice* to
  `decide()` step 2 needs `policy.version: 2` and a `hollywoodValidation.ts` widening [02:e.5] — flagged,
  not built.
- Comparator contrast: Hollywood Animal's shipped design gates sequels strictly behind the predecessor's
  *release*, and its own players independently complain about the resulting rigidity when stacked with
  other gates [03a:§92-95, ADAPT/REJECT §146] — this is the failure mode Direction G is designed to avoid,
  cited here only as confirmatory evidence, not a reason to touch G.

---

## 8. No manual kill button (Direction S)

- Dormancy is **purely a read** of §6's band formula — there is no `status` field on `Franchise` or
  `Branch` a player or system ever *sets* to "dead." A branch cannot be deleted; it can only accumulate
  weeks with no release, which the band formula reads as COOLING → DORMANT automatically.
- **P16 may sell rights** — as established in §5, this writes **zero** bytes to the P17 root (no owner
  field exists to update). A sale cannot "kill" a franchise because it cannot touch anything the lifecycle
  band reads.
- **Historical activity remains** — `installments[]`, `keyAssociations[]`, and `milestones[]` are
  append-only for the life of the save; nothing in this model ever removes an entry from them (matching the
  house-wide "never pruned" law for `Studio.releasedFilms`/`TheatricalRun` [02:a.1, a.2]).

---

## 9. Legality matrix (confirms Direction E — legality never gated on commercial success)

| Continuation type | Rights (P16, live lookup) | Predecessor state | Branch/SubProperty requirement | Era capacity (P13) |
|---|---|---|---|---|
| **Direct sequel** | current owner controls the StoryProperty | released, OR only locked-committed if greenlit early (§7, Direction G) | any existing branch | none unless requesting an era-gated cast slot (Direction T) |
| **Prequel** | same | the referenced film must exist as at least a locked Production (symmetric to G — legal to prequel an as-yet-unreleased film) | any existing branch | same |
| **Film spin-off** | same | referenced parent installment released or locked | a named **SubProperty must already exist** under the StoryProperty (Direction J) — if none exists, minting one is a precondition step, itself bounded by a small per-property cap | same |
| **Remake** | same | the referenced film **must be released** (there is nothing to retell otherwise) | none — never opens a branch (§3.1) | same |
| **Reboot** | same | none on any specific film — only requires **≥1 prior branch already exists** for this StoryProperty (nothing to reboot otherwise) | new branch, subject to the lifetime cap `N_MAX_BRANCHES=8` (§2.3) | same |

**None of the five rows tests `recognition`, `branch.momentum`, or `branch.fatigue`.** A franchise sitting
at DORMANT with deeply negative Momentum and maxed Fatigue is exactly as *legal* to continue as one at
ACTIVE with a smash hit yesterday — only the *expectation the player is warned about* differs. Confirmed
directly by the real data: Terminator: Dark Fate (2019) was greenlit and released despite two consecutive
"new trilogy" failures immediately before it, and it was perfectly legal to do so — it simply lost the most
money of the three [04b:§1.4].

**Warning text the player sees instead of a legal gate** (STARTING POINT copy, driven only by the band +
R/M/F the player can already see, never a hidden check):

> *"[StoryProperty] is legal to continue — [current rights owner] holds the rights. Its [Branch name]
> continuity is currently **DORMANT** (no release in [N] years). Recognition remains strong ([R]/100,
> near its all-time peak), but Momentum has fully decayed and this continuity's last outing left elevated
> Fatigue. Expect a reception discount versus a fresh continuity or a well-timed sequel."*

---

## 10. Stress-test list — how this state could rot, and the guard for each

1. **Orphan "current rights owner" after a P16 transfer.** *Cannot happen by construction* — §1.3's
   correction means nothing on `Franchise` ever caches an owner id to go stale. The only remaining risk is
   if a future P16 ever **splits** one StoryProperty into two (selling off a SubProperty separately, not
   evidenced today) — guard: that is a P16-authored event that must explicitly re-key or split the
   `Franchise` root atomically; P17 must fail loud validation (never silently drop) if it ever sees a
   `subPropertyId` no longer listed under the current StoryProperty.
2. **Dangling `parentProductionId`/`childProductionId` if a rival business is ever pruned.** Guard: lineage
   edges reference `productionId` only, and `FilmResult`/`IndustryFilm` rows are never deleted today
   [02:a.1, a.5, e.1] — the Franchise root must join `persistedProductionIds`/`persistedConceptIds` in both
   directions the week it lands, per the existing law [02:a.6], so an id can never be reclaimed out from
   under a live edge. Flag for future P16/P18 authors: never introduce a path that deletes an
   `IndustryFilm`/`FilmResult` row wholesale, only its containing business record.
3. **Re-mint / branchId collision after Save-As or a rolled-back timeline.** Guard: `branchId` (and
   `franchiseId`) must be minted from a monotonic ordinal counter **stored on the Franchise root itself**
   (mirroring the existing `nextOrdinal` pattern for concepts [02:b.1, h.17]), so a save that is rolled back
   also rolls the counter back consistently — two divergent timelines from the same save point can never
   collide because forward-only saves never merge two save files. The only real hazard is external tooling
   splicing P17 state between two *different* saves — guard: treat a `franchises` root exactly like any
   other root under the existing "malformed/foreign input fails loudly" law [02:f.1, ADR-0004].
4. **Projection/bridge size growth over a 120-year campaign.** Guard: the public projection exposes only
   ids + scalars (no embedded titles — those already resolve live via `conceptId` [02:a.3]); combined with
   §2.3's 8-branch lifetime cap and the byte estimate in §1.4, even a saveful of dozens of long-running
   franchises stays a rounding error against the already-blown 37.8 MB Hollywood budget [02:f.2].
5. **Milestone narrative-label creep.** Guard: `milestoneId` is a **closed, versioned enum** (§1.1) — the
   stored bytes never grow with playthrough length or invite an ad-hoc free-text field; UI strings resolve
   from the enum client-side (HIS-014 discipline).
6. **Stale talent-association assumptions.** `keyAssociations[]` never expires an entry (no-kill spirit,
   §8), but nothing about it may be read as "this talent is currently available" — that is always a live
   P14 lookup [02:h.10]. Guard: the model never lets a stored `roleImportance` substitute for a fresh
   availability/contract check at greenlight time.
7. **Branch-count blowout from spin-off spam.** Guard: the hard `N_MAX_BRANCHES=8` lifetime cap (§2.3) is
   checked as a legality precondition (§9's spin-off/reboot rows), independent of reception — a StoryProperty
   simply cannot mint a ninth branch, full stop, regardless of how well any of the first eight performed.
8. **Crossover edges silently upgrading `LineageEdge` to multi-parent and breaking the tree UI.** Guard:
   §2.3 already commits `parentProductionId` to `string | null` forever; crossovers (Direction O, later
   scope) must be modeled as an **additional, separate edge/record kind**, never a widened
   `LineageEdge`, so every edge written under this model stays valid indefinitely and the indented-list UI
   (§2.2) never needs to become a graph layout for pre-crossover data.

---

## 11. Open questions for the Owner / P16 charter (genuine unknowns, not re-litigations of A–U)

- Real Bond history shows a **split-rights** case (Never Say Never Again, a non-Eon remake made possible by
  a *separate* remake-rights holder distinct from the ongoing series' rights holder [04a:§1.5, PART2-F]).
  This model assumes P16 tracks exactly one rights-control fact per StoryProperty; if P16 ever wants to
  model a *specific* right (e.g., "remake rights" vs. "sequel rights") as separable, §9's "Rights" column
  needs a second P16 lookup shape. Flagged for the P16 charter, not decided here.
- `IMPULSE_M/F/R`, all half-lives, `γ`, `W_PARTIAL`, `RECENCY_WINDOW`, `N_MAX_BRANCHES`, and the lifecycle
  band thresholds are every one of them STARTING POINTs justified by the shape of the evidence, not by
  fitting real dollar figures — they need playtesting against P07's actual reception distribution once it
  exists, not against 2020s real-world grosses.
- Whether a `franchiseComparison`-style `ForecastFactorKey` should eventually be added for player legibility
  (law 5) is a P07/P11 charter decision — `ForecastFactorKey` is today a closed, persisted-leaf enum
  [02:c.3] and widening it is out of P17's authority to decide unilaterally.
- The soft-cap eviction rule for `keyAssociations[]` (kept by importance desc, then recency desc) is a
  DESIGN INFERENCE with no real precedent found in the comparator or real-franchise evidence; no case in
  04a/04b ever needed more than a handful of tracked associations, so the cap is believed generous but
  untested.
