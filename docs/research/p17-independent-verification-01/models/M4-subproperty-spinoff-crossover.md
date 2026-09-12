> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`../redteam/R3-reviewer-corrections-calc.py`](../redteam/R3-reviewer-corrections-calc.py), committed output [`../redteam/R3-output.txt`](../redteam/R3-output.txt) — **the report governs.** Superseded here: `F_sp(t0) = 0.5·F_parent` now reads the parent StoryProperty's single Fatigue scalar; a promoted crossover universe is an optional later feature (§19.4); otherwise this file is the source of report §9 and §12.

# M4 — SubProperty / Spin-off (Direction J) and Later-Scope Crossover (Direction O)

Read-only paper model. No repository edits, branches, builds, tests, or runtime touched. Engine facts cited by `file:line` per `02-project-studio-architecture-READONLY.md` (commit `13370d428f0693f3279732f6f4cc360a7fcaa4df`, "DEVELOPER/OFFICIAL (repo code @13370d42)" unless noted). Historical-franchise facts cited with source/locator/what-it-proves/confidence/tier per the CONTEXT.md source-discipline rule. Directions A–U are **not reopened**; where a serious structural problem exists it is named precisely with the smallest correction.

## 0. Scale-invariance convention (so this model does not collide with the core R/M/F model)

This document does not define the core Recognition/Momentum/Fatigue update functions — that is the sibling core-franchise-state model's job (Direction M/C). Everything below is written **scale-invariant**: every rule is a fraction of, a weighted combination of, or a repeated call to the core R/M/F update functions — never a hard-coded absolute value that assumes a particular range or decay half-life. Worked numbers below illustrate on an assumed 0–100 R/F scale (the scale every comparator in evidence uses: CCM fame capped at 100 — `03e-comparators-other-ip-sequel-tycoons.md:161` "Fixed fame not being capped at 100 as intended"; CK3 fame levels; FM reputation bands) purely for legibility; if the core model picks a different range, only the display scale changes, not any formula here.

Notation: for a StoryProperty's Franchise root, `R` = Recognition, `M` = Momentum, `F` = Fatigue (Direction C: R slow/durable, M fast/decays to neutral, F rises faster for mediocre similar output). `coreR(...)`, `coreM(...)`, `coreF(...)` denote "whatever the core model's per-installment update function is" — this model calls them, never redefines them (Law: no duplicate formulas across packages).

---

## Part A — SubProperty / Spin-off (Direction J)

### A.1 What qualifies as a SubProperty (Q1)

**Engine fact, load-bearing:** the engine has no character/organization/location entity of any kind.
- `FilmConcept = { id; title; genre; baselineStrength; originalityRaw; baseNegativeCost; requiredSlots; roleRequirements }` — **eight fields, no lineage, no character names** (`types.ts:152-163`, §b.1 "b.1 FilmConcept — eight fields, no lineage").
- The only per-film role-association record is `FilmParticipants = { writer; director; cast: Record<CastSlot, FilmParticipant>; craft: FilmParticipant[] }` where `FilmParticipant = { talentId; name /*AT GREENLIGHT*/; role; discipline; greenlightOVR; greenlightFit; greenlightEP; freelancer }` — frozen at greenlight, immutable on `FilmResult` (`types.ts:200-222`; `filmParticipants.ts:33-45`; frozen at `tick.ts:594-604`; §a.4). It records **which real person played which of the three seats in one film**, not a fictional character identity — there is no `characterName` field anywhere in this record.
- Titles are **not** permanent facts either: `FilmResult` carries no title (`types.ts:241-264`, §a.1); the live title resolves through `conceptId → state.concepts[].title` and can be **renamed after release** (`renameScreenplay`, `screenplay.ts:465-491`, §a.3 — "it does not refuse a rename after the film is released").

**Conclusion (governs everything below):** a SubProperty cannot be mined from a title, a cast slot's persona, or a concept's genre — none of those are stable, named, or fictional-identity-bearing facts in this engine. It must be an **authored, named hook**, minted explicitly by a player action (at the parent's greenlight or release) or by an authored "spin-off hook" option surfaced on a released film — and it must cite an exact, frozen, permanent record it hangs off: a `productionId` (permanent, `FilmResult.productionId`, §a.1) and, when tied to a role, the `FilmParticipant` in that film's frozen `FilmParticipants.cast[slot]`. This is the same discipline contract §15/INT-012 already states for P17 generally — "P17 may not create or infer a `StoryProperty` from title, genre, cast, release order, current studio, similar concepts, presentation copy, or array position" (`docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md:389-390`; INT-012 `02-project-studio-architecture-READONLY.md:311`) — and this model applies the identical discipline one level down, to SubProperty.

**The four kinds (Direction J's list) map onto the same authored-hook shape, differing only in what they cite:**

| Kind | What it cites | Binding |
|---|---|---|
| Character | one `FilmParticipant` in `cast[slot]` of the minting `FilmResult` | `slot ∈ CastSlot` (`types.ts:19`) |
| Organization/team | a named subset of the minting film's participants (e.g. "the ensemble," a `craft`/cast cluster) | no single slot; default weight (A.3) |
| Location | none (no location entity exists in engine) — purely an authored label attached to the concept's genre/segment context at mint time | no slot; default weight |
| Major concept | none (no concept-lineage field exists, §b.1) — an authored label ("this film's central conceit") | no slot; default weight |

Comparator grounding for keeping this to one flat level (property → SubProperty, no deeper tier): The Executive ships an IP-contains-Franchise two-level model that the developer confirms as intended design ("An IP can contain multiple franchise[s]. Everytime you make a spinoff, you spawn a new franchise within that IP" — guillaume, dev, 2025-02-14, `03d-comparators-film-media-management.md:310-312`; DEVELOPER/OFFICIAL; HIGH) — yet **even that correct two-level model reads as confusing to players months after the clarification** ("I really dislike the way IPs are implemented... it seems to only serve as an extra title for your franchise" — player review, `03d:315-318`; COMMUNITY; HIGH) and the developer's own roadmap is still trying to add a *third* "Universe" tier to explain crossovers (`03d:319-321`; PRE-RELEASE PROMISE). **Structural problem for this report to flag, smallest correction:** do not add a third tier. Keep exactly StoryProperty → SubProperty (two levels, matching Comic Company Manager's single compact franchise object as the reference size, `03e-comparators-other-ip-sequel-tycoons.md:161-166`), and let crossovers stay edge-based (Part B) rather than inventing a "Universe" object — this is what §f.2/INT-012 already require ("franchise aggregate cannot become a second property identity") and it avoids The Executive's UI confusion by construction.

### A.2 Should every film automatically mint options? (Q2)

**Recommendation: no.**

Reasons, each tied to an engine or comparator fact:
1. **Governance ban on inference-minting one level up applies with equal force one level down.** SAF-009 explicitly forbids P17 from inferring or minting P16 property authority "from film or presentation similarities" (`02-project-studio-architecture-READONLY.md:313`); an auto-minted hook on every film is exactly that kind of similarity-based, non-authored creation, just scoped to a SubProperty instead of a StoryProperty. A SubProperty is still a claim about future franchise use — Direction J's own text, "not every fictional noun is IP," is a direct instruction against this.
2. **Comparator failure mode, REJECTed explicitly in the atlas:** Game Dev Masters' "monotonic IP ratchet with no fatigue" is called out as "sequel-spam by construction" (`03e-comparators-other-ip-sequel-tycoons.md:290`, ADOPT/ADAPT/REJECT synthesis, REJECT list). Automatic, uncapped hook minting is the SubProperty-scale version of the same failure.
3. **Save-size law:** any new persisted entity must stay compact under the already-missed size budgets (Hollywood storage 37.8 MB vs 8 MB target, `02:9`, PERF-009 `02:262-267`); an unbounded per-film hook list is exactly the kind of "copy of film results" §f.2 warns against.

**Design: a bounded number of hooks per StoryProperty, minted on request, gated by an eligibility test — not by performance.**

- **Cap:** `MAX_LIVE_SUBPROPERTIES_PER_STORYPROPERTY = 3` (starting point). Chosen to match the existing "small number" bound Direction N already sets for spin-off branches, and the same order of magnitude as the engine's own bounded-array precedent for optional cast (Shape B/C: `additionalPrincipal? : FilmParticipant` singular, or "up to 2," `05-cast-scale-and-cameo-design-evidence.md:181-183`, §4.4).
- **Minting is an explicit player (or rival, via the same law) action**, not a side effect of releasing a film: "Option this character/location/concept as a spin-off hook" — offered once at the parent's greenlight (if the concept's `roleRequirements`/persona already looks distinctive — a display hint only, never a legality gate) and again at the parent's release (once the real `FilmParticipants` record and box-office reach exist to weight it, A.3–A.4).
- **Eligibility test at mint time** (starting point, all three required):
  1. The parent `StoryProperty` is not LOST/rights-blocked under P16 (a SubProperty of a property whose rights the studio does not hold cannot be minted by that studio — mirrors Direction L/K).
  2. The hook cites an exact permanent record: a `productionId` (frozen `FilmResult`) and, if character/organization-kind, an exact `FilmParticipant` inside that film's frozen `cast`/`craft` (§a.4) — never a live/mutable field like the concept's current title.
  3. The StoryProperty is under its live cap (`< 3` live, unpromoted SubProperties).
- **Explicitly NOT gated on commercial performance or reception** — Direction E is unambiguous that legality never turns on commercial success, and this model keeps that guarantee one level down: a flop's characters can still be optioned as hooks (they will simply inherit little Recognition, A.4, because the transfer formula is reach-weighted, not because minting itself is refused). This is the smallest correction that keeps Q2's "bounded, not automatic" answer from silently reintroducing a success gate Direction E forbids.

### A.3 Does popularity/role importance matter? (Q3)

Yes — a hook's importance is read from the exact cast-slot weight already in the engine, never a new "character popularity" number.

`hookWeight` at mint time:

| Hook kind | `hookWeight` source | Value |
|---|---|---|
| Character, tied to `cast[slot]` | `CAST_WEIGHT[slot]` (`tuning.ts:1657`) | lead 1.00 / antagonist 0.60 / support 0.35 |
| Organization/team, tied to a named cluster of participants | mean of the cited participants' `CAST_WEIGHT`, capped at 1.00 | typically 0.4–0.7 |
| Location / major concept (no slot exists) | `HOOK_WEIGHT_DEFAULT` — a flat starting-point constant | **0.50** (chosen as the midpoint between antagonist 0.60 and support 0.35 — "roughly supporting-cast level of centrality," a starting point, not derived) |

And a hook's inherited reach is read from the exact public box-office fact already used for fame gain — `reach01 = total/(total + 10,000,000)` (`starPower.ts:67-120` inside `computeStarPowerDelta`, cited at §c.5) — computed on the **minting film's own** `FilmResult.boxOffice.total`, not on the whole franchise's history. This reuses a formula the engine already computes for a different consumer (fame delta) rather than inventing a second reach metric — consistent with Law 2 ("no duplicate formulas").

### A.4 Parent Recognition transfer (Q4)

**Transfer fraction**, calibrated to the observed 38–65% opening-inheritance band:

```
transferFraction(hookWeight) = BASE_MIN + (BASE_MAX − BASE_MIN) · hookWeight
BASE_MIN = 0.38   BASE_MAX = 0.65        (both starting points)
```

Evidence for the band: *Rogue One* opening = 62.5% of *The Force Awakens*' opening; *Solo* opening = 38% of *The Last Jedi*'s; *Hobbs & Shaw* opening = 61% of *The Fate of the Furious*'s (`04a-real-franchises-set-A.md:250`, "Star Wars/Fast," The Numbers + Wikipedia F&F, HIGH, OBSERVED HISTORY). Summary row: "Spin-offs Inherit 38–65% of parent opening (RO 62%, Solo 38%, H&S 61%)... SubProperty inherits fractional Recognition; accrues its own; parent not consumed; inherits parent Fatigue" (`04a:352`, HIGH/MEDIUM). Bridging-association discount confirmed separately by *Furiosa*: recast lead + absent bridging character → opening −42% vs parent, "a spin-off can inherit less than half of the parent's opening when the parent's own theatrical reach was modest and the bridging associations are missing" (`04b-real-franchises-set-B.md:233`, HIGH numbers/MEDIUM causal attribution, OBSERVED HISTORY) — this is exactly what a low `hookWeight` (no strong bridging character, i.e. no lead-tied hook) produces in the formula above.

**At mint time `t0`:**

```
R_sp(t0) = transferFraction(hookWeight) · R_parent(t0)
F_sp(t0) = FATIGUE_INHERIT_FRACTION · F_parent(t0)      FATIGUE_INHERIT_FRACTION = 0.5 (starting point)
M_sp(t0) = 0                                             (Momentum never transfers — see below)
```

Worked example (illustrative 0–100 scale; script `models/m4_worked_numbers.py`, run read-only in this folder):

| hookWeight | transferFraction | R_parent | R_sp(t0) | F_parent | F_sp(t0) |
|---|---|---|---|---|---|
| 1.00 (lead-tied) | 0.650 | 72.0 | **46.8** | 40.0 | 20.0 |
| 0.60 (antagonist-tied) | 0.542 | 72.0 | 39.0 | 40.0 | 20.0 |
| 0.35 (support-tied) | 0.475 | 72.0 | **34.2** | 40.0 | 20.0 |
| 0.50 (org/location/concept default) | 0.515 | 72.0 | 37.1 | 40.0 | 20.0 |

**Why Momentum starts at zero:** Momentum is defined as fast-moving and decaying to neutral per-release (Direction C) — it is not a property of a *character*, it is a property of a *release cadence*. An unreleased hook has no releases, so it has no Momentum to inherit; it starts on its own clock the moment it gets its first installment. This also prevents an exploit: minting a hook the week after a hot release cannot "borrow" that hot Momentum for a future, unrelated film years later — only Recognition (slow, durable) transfers, and Fatigue (a liability, not an asset) partially transfers.

**Why parent R is never consumed:** confirmed directly — "The SubProperty then accrues its own Recognition and can out-grow the parent; the parent's Recognition is not consumed" (`04a:255`, DESIGN INFERENCE stated as a direct synthesis of the Rogue One/Solo/Hobbs&Shaw/Deadpool/Minions/Joker evidence, HIGH/MEDIUM). Mechanically: minting a SubProperty and its subsequent releases never write to `R_parent`; only the parent's own installments do (through the same core update function, called with the parent's own `productionId`s).

**After mint, the SubProperty accrues its own R/M/F exactly like a Franchise root does** — the *same* core per-installment update functions, called with the SubProperty's own `installmentProductionIds` instead of the parent's. No second formula; the SubProperty is a second *instance* of the same state shape and the same update law (Direction M already anticipates this: "installments, branches, subProperties" living together on one lightweight object, `02:267`).

### A.5 Can a spin-off outperform the parent? Promotion? (Q5)

**Yes, unbounded, and this is well evidenced:**
- *Deadpool* (2016, $58M budget): opening $132.4M vs parent *X-Men: Days of Future Past* $90.8M; by *Deadpool & Wolverine* (2024, $1.34B WW) the spin-off *was* the tentpole and the parent line had ended (*Dark Phoenix*, $246M) (`04a:251`, The Numbers, HIGH, OBSERVED HISTORY).
- *Minions* (2015): $115.7M opening vs *Despicable Me 2*'s $84.2M; $1.157B WW vs $975M (`04a:252`, HIGH, OBSERVED HISTORY).
- *Joker* (2019, $55M budget): $96.2M opening / $1.08B WW with no Batman on screen, exceeding the concurrent parent-continuity films (*BvS* $874M, *Justice League* $661M) (`04a:253`, HIGH, OBSERVED HISTORY).
- *Creed III* (2023): franchise-record nominal opening without the parent's lead on screen — but this took **three films and eight years**, not one (`04b:229,237`, HIGH, OBSERVED HISTORY): "**Must NOT over-generalize:** Creed's growth took three films and eight years; the game must not let a spin-off exceed the parent on its first entry by default" (`04b:237`).

So: no cap on `R_sp` relative to `R_parent`; **but no default first-film outgrowth bonus either** — outgrowth is earned the same way the parent's own R was earned, through the SubProperty's own release history via the identical core update function (A.4), not through a special "spin-off breakout" multiplier.

**Promotion to an independent StoryProperty is a P16 act, not a P17 act — this is the direct, load-bearing consequence of INT-012/contract §15**, which states P17 "may not create or infer a `StoryProperty`... may not create a right or licensing authority merely because a franchise behavior wants to use one" (`02:311,388-390`). So:

- **P17 requests; P16 mints.** P17 exposes a read-only `promotionEligible: boolean` flag (and its accrued `R_sp/M_sp/F_sp/installmentProductionIds` as a payload) once eligibility is met. A P16-owned action ("Register as its own property") consumes that payload, mints a new `StoryPropertyId`, and establishes the chain-of-title/rights record for it (P16 authority per §15: "P16 establishes the durable `StoryProperty`... origin-work relationships, chain of title, rights ownership," `02:359-361`).
- **P17's role after promotion:** re-key the SubProperty's lineage — the SubProperty id **persists as a historical handle** (`promoted: { toStoryPropertyId, atTick }`), and a new Franchise root is seeded for the new `StoryPropertyId`, carrying over the accrued R/M/F/installments as its **starting** state (not re-derived, not re-inferred — it is the literal continuation of the same accrual, just now keyed to a new, independent StoryProperty id). This satisfies §a.6's identity-walk law (nothing is re-minted or renumbered) and INT-012's "parent/child continuation-work lineage adds edges without changing work IDs" (`02:311`).
- **Eligibility test** (starting point): `installmentProductionIds.length ≥ 1` (cannot promote an unreleased hook) AND `R_sp ≥ R_PROMOTION_MIN` (a floor, tunable, not "must already exceed R_parent" — Creed shows outgrowth is not a promotion precondition, only a *possible* later outcome).

### A.6 SubProperty rights sold independently (Q6)

This is fundamentally **a P16 scope decision that P17 must not pre-empt**, and the report should say so plainly rather than pick a winner.

**Two shapes P16 might choose, and the interface that works for either without P17 caring which:**

- **(a) P16 models sub-rights.** A SubProperty can carry its own rights holder, independent of the parent StoryProperty's holder (e.g., a studio sells off the movie rights to one character while keeping the rest of the franchise). Then P17 keys spin-off legality (can this hook be greenlit right now?) to *that* holder.
- **(b) P16 does not model sub-rights.** Only StoryProperty-granularity rights exist. Then P17 keys legality to the parent StoryProperty's holder, exactly as it does for any other continuation type.

**Interface (works identically for either, and never requires P17 to be rewritten if P16's answer changes later):**

```
SubProperty.storyPropertyId: StoryPropertyId          // required, always present
SubProperty.sovereignRightsId?: RightsId               // optional; null unless/until P16 grants independent sub-rights

rightsHolderFor(sub) = P16.rightsOwner(sub.sovereignRightsId ?? sub.storyPropertyId)   // live read, never cached
```

This mirrors an existing house pattern exactly: title resolution is **live** through `conceptId → state.concepts[].title`, never a frozen copy that could go stale (§a.3) — this model applies the identical "read live, never cache" discipline to rights lookups, so a mid-franchise rights sale (Direction L) is reflected immediately without a P17 migration. **Flagged to the Owner as an open P16 decision in the output summary** — it is not resolved here.

### A.7 P18 reuse (Q7)

`SubPropertyId` is the shared, opaque, permanent handle (minted once, never reused or reassigned — mirroring the existing law for `FilmConcept.id`, "a permanent identity. It may never be removed, reassigned, or re-minted," `02:98`, `docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md:137-138`). P17 exposes it **read-only** on the public projection lane (the same pattern §f.2 describes for a franchise page: "a sibling lane on this index, not a new authority," `02:269`, referencing `bridge/industry.ts`). P18 (television/cross-media spin-offs, out of scope per Direction A) can then reference `SubPropertyId` for e.g. a TV spin-off of the same named character, without P17 gaining a single TV-specific field.

---

## Part B — Later-scope Crossover (Direction O)

### B.1 Requirements

A crossover is legal only when **every** one of these already-scoped systems clears it — P17 adds no new authority, it only reads:

| Requirement | Owning package | Engine/evidence anchor |
|---|---|---|
| Rights/control of **every** participating StoryProperty | P16 | §15/INT-012; rivals currently have **zero** rights model (`02:246-247`, "nothing in `src/` mentions rights/property" — a hard P16 dependency before ANY rival crossover is legal) |
| Cast capacity for the extra principal seats a crossover needs | P13 (era capacity) / core casting (Shape B/C) | `05-cast-scale-and-cameo-design-evidence.md:181-183`: Shape B "3 + 1 Additional Principal... enables a two-lead crossover (P17 later scope)"; Shape C "3 + up to 2 Additional Principals... three-lead crossovers" |
| Lawful talent availability for those seats | P14 | busy-set/contract law (§c.7, `05:§5.3` mechanism 3) |
| A compatible development route (the production must actually be greenlit as one film citing ≥2 StoryProperties) | P17 (this model) reading P16+P13+P14 clearances | — |

### B.2 How Recognition combines — saturating sum, not additive

**Formula** (reuses the exact rank-decay *pattern* the sibling cameo model already established for FAME VALUE — `CAMEO_RANK_DECAY ≈ 0.5`, `05-cast-scale-and-cameo-design-evidence.md:197-198` — with its own constant, since a crossover co-lead is an Additional Principal, Shape B/C, not a cameo):

```
combinedR(R_1 ≥ R_2 ≥ ... ≥ R_n) = min( Σ_i R_i · CROSSOVER_DECAY^(i−1),  R_CAP )
CROSSOVER_DECAY = 0.6      R_CAP = ceiling of the core R scale (e.g. 100)
```

Both the decay-per-participant term *and* the overall ceiling clamp are saturating mechanisms — this is the literal "capped" instruction, applied twice (per-participant diminishing **and** an absolute ceiling), which is the anti-snowball property required by the task.

**Why not additive — direct evidence:** *The Avengers* (2012) opened $207.4M vs the naive sum of its three lead solos' best prior openings ($128.1M + $65.7M + $65.1M = $258.9M) — the realized crossover came in well **below** the naive sum, at roughly 80% of it, even though it was itself a record +62% over the single best prior solo (`04a-real-franchises-set-A.md:295`, The Numbers, HIGH, OBSERVED HISTORY). *Justice League* (2017) is the explicit guard against assuming a crossover is even a **positive** multiple at all: it opened $93.8M, **below its own predecessor** *Batman v Superman* ($166.0M) and below the same year's *Wonder Woman* ($103.3M), after a poorly-received predecessor (`04a:298`, HIGH figures/MEDIUM reception, OBSERVED HISTORY) — a saturating-sum-of-R model captures this naturally: if the participating properties' own `R` is already damaged going in, `combinedR` is damaged too, and the formula never promises a floor.

**Worked numbers** (script `models/m4_worked_numbers.py`, illustrative 0–100 R scale):

| Participants (R, sorted desc) | combinedR | ratio vs top-solo R |
|---|---|---|
| 50.0, 50.0 (two comparable mid-tier properties) | **80.0** | **1.60×** |
| 60.0, 45.0 (one stronger + one weaker) | **87.0** | **1.45×** |
| 85.0, 85.0 (two already-strong properties) | 100.0 (capped) | 1.18× — *cap bites: intentional anti-snowball* |
| 55.0, 55.0, 40.0 (three-way) | 100.0 (capped) | 1.82× — *cap bites: intentional anti-snowball* |

The constants (`0.6`, cap at scale ceiling) are chosen specifically to land two *comparable, non-saturated* properties in the observed **1.5–1.7× band** the task specifies, while making the ceiling do the "diminishing further" work for already-strong or three-plus-way combinations — exactly the *Avengers*-scales-well-below-its-cast's-individual-peaks-when-they're-already-huge pattern, and exactly the *Justice League*-gets-no-guaranteed-bonus pattern, in one formula. These constants are **starting points**, not calibrated in-engine.

**Where `combinedR` is used:** it is never written to any Franchise root as a persistent value (that would create the "second FranchiseScore"/"second property identity" INT-012 explicitly forbids, `02:311`). It is computed **once, per crossover film, at greenlight**, and fed through the existing optional-input seam into `preMarketingAwarenessOf`/the forecast (§d.4's `ReceptionInputs` pattern, `reception.ts:87-103` precedent) — exactly the same seam A.4's SubProperty inheritance uses. No new P07/P08/P11 formula.

### B.3 Do both audiences contribute? Yes, capped — twice

Yes: **every** participating property's `R` feeds `combinedR` (not just the lead property's) — that is the entire point of the rank-decay sum. It is capped in two independent ways, both already shown above: (1) each participant beyond the first contributes at a **decaying** marginal weight (`CROSSOVER_DECAY^(i−1)`), and (2) the **total** is clamped at the scale ceiling regardless of how many high-R participants are combined. This double bound is the mechanical answer to "capped."

### B.4 Expectation explosion — and it must be shown to the player

`combinedR` also becomes the crossover's own forecast input (§d.3: `Production.forecastSnapshot` is what `computeStarPowerDelta.fcMult` and the newspaper's `boxDelta` judge against later, `02:189-197`) — so the crossover is *expected* to open far above any solo entry, which is exactly the mechanism behind the observed pattern: *Avengers* set a record baseline; every non-crossover MCU solo immediately after it reads as smaller by comparison, and the pattern repeats and intensifies after *Endgame* — three post-*Endgame* solos opened $80M/$75M/$71M, legacy-crossover *No Way Home* spiked to $260M, then ordinary solos fell to $106M/$46M, another crossover (*Deadpool & Wolverine*, $211M) reset the bar again, then 2025 solos opened $74–118M before *Brand New Day*'s $360M record (`04a:297`, The Numbers, HIGH, OBSERVED HISTORY). The pattern is real and the task is right to call it "raises the baseline for later solo entries."

**What this model recommends P17 actually do about it — nothing computational, one visible label:**
- Record the crossover's realized reach as a **milestone** fact on each participating Franchise root (Direction M already carries a `milestones[]` field, `02:267`) — this is a read, not a new formula.
- Surface a purely **derived, player-legible** descriptor on that property's next greenlight forecast card — e.g. `NORMAL / ELEVATED / EXTREME` "Post-Crossover Expectation" band, computed only by comparing the property's pre-crossover `R` to `combinedR` (no new P07/P11 mechanic; this is display logic over numbers that already exist, following Law 5: every recommended rule must be player-legible).
- **Do not** invent a hidden "must beat the crossover" penalty formula on the next solo's own forecast — none is evidenced, and Direction C already forbids anything resembling a fixed rule ("timing alone is not bad"); the harsher judgement the historical record shows is allowed to be an **emergent** comparison the player can see coming (via the milestone/band), not a mechanic P17 must compute.

### B.5 Fatigue interaction — a crossover is an installment of every participant, discounted

```
for each participating StoryProperty i with share_i (B.7):
    F_i(t+1) = coreF( F_i(t), FilmResult, weight = share_i, similarity = SIMILARITY_DISCOUNT )
SIMILARITY_DISCOUNT ≈ 0.5   (starting point)
```

This directly explains the *Justice League* guard mechanically, not just narratively: by November 2017, Batman had already appeared in *Man of Steel* (as setup) and *Batman v Superman* within the prior 18 months, each poorly received, accumulating Fatigue on the Batman/Superman-continuity Franchise root; *Justice League* then adds **another, discounted-but-nonzero** Fatigue contribution to both Batman's and Superman's franchises (while Wonder Woman, Flash, Aquaman, and Cyborg get their **first** installment, so no prior Fatigue exists for them yet) — which is consistent with why the "event movie" excitement failed to overcome the pre-existing damage (`04a:298`, `04b` DCEU cases). The discount (0.5, not 1.0 and not 0) reflects that "Batman in an ensemble" is not "another numbered Batman film" in the same-formula sense Fatigue otherwise penalizes (Sood & Drèze: key Fatigue to *sameness*, not raw installment count — `03e-comparators-other-ip-sequel-tycoons.md:283`, ADAPT) — but the character still appeared, and can still overexpose.

### B.6 Failure/success consequences to both — one FilmResult, shares

```
for each participating StoryProperty i with share_i:
    R_i(t+1) = coreR( R_i(t), FilmResult, weight = share_i )
    M_i(t+1) = coreM( M_i(t), FilmResult, weight = share_i )
    F_i(t+1) = coreF( F_i(t), FilmResult, weight = share_i, similarity = SIMILARITY_DISCOUNT )
```

This is literally the same per-installment update the engine already makes once per solo release, fired **N times** (once per participant) with a `share_i` multiplier — not a new formula, a repeated call. No participant is exempt: a crossover flop damages every participating franchise's M and dents every one's F, scaled down by that participant's share; a crossover hit lifts every one similarly (the "spillover" evidence: *Iron Man 3* +36%, *Thor: The Dark World* +30%, *Captain America: The Winter Soldier* +46% immediately after *The Avengers*, `04a:296`, HIGH, OBSERVED HISTORY).

### B.7 Structure: PROJECT with lineage edges, not a permanent new franchise object

**Default (recommended): a crossover is one `Production`/`FilmResult` (one `productionId`) plus a `CrossoverLineage` edge-set of ≥2 parent `StoryPropertyId` edges** — never a permanent new Franchise/StoryProperty object by default. This is the direct, minimal-footprint reading of the additive-root/edge law already established for continuation lineage generally: "lineage must be a P17 root of `(childProductionId → parentProductionId | parentFilmId, type)` edges, never a field on `FilmResult`/`FilmConcept`" (`02:378`, h.7, confirming the frozen-leaf rule) and INT-012's explicit ban on a franchise aggregate "becoming a second property identity" (`02:311`).

**Share normalization** (billing-decay weights, same `CROSSOVER_DECAY = 0.6`, normalized to sum to 1 so the per-participant M/F/R update in B.5–B.6 stays bounded and comparable in scale to a solo installment):

```
w_i = CROSSOVER_DECAY^(i−1) for rank i (by billing order)
share_i = w_i / Σ w_j
```

| n participants | shares (billing order) |
|---|---|
| 2 | 0.625, 0.375 |
| 3 | 0.510, 0.306, 0.184 |
| 4 | 0.460, 0.276, 0.165, 0.099 |

**Exception, flagged as an Owner decision (not resolved here):** if a crossover spawns its **own** sequels (an "Avengers 2/3/4" numbered continuity distinct from any single parent), it may be **promoted** to a shared-universe branch. Mechanically this is the *same* P17-requests/P16-mints interface as A.5's SubProperty promotion: P16 mints a genuinely new `StoryPropertyId` for the shared universe, and its P17 Franchise root's lineage retains permanent edges back to every original parent property (so history/P18 can still show "this universe crossed over Property X + Y + Z"). Direction N's "small number of spin-off branches" bound should be read as covering shared-universe branches too, unless the Owner says otherwise (open question, §D).

### B.8 Anti-snowball — four independent, already-evidenced mechanisms, no new cap needed

1. **Saturating combination** (B.2): a bounded ceiling plus per-participant decay — a crossover cannot be made arbitrarily more "recognizable" by piling on more properties past 2–3.
2. **Shared Fatigue** (B.5): every participant pays a discounted-but-real Fatigue cost — a crossover is never a free win for any of its franchises, and repeat crossovers of the same properties accumulate Fatigue on **all** of them simultaneously, faster than solo output would (N simultaneous hits per crossover).
3. **Capacity/salary cost through P14/P11**: Additional Principal seats (Shape B/C) are real, bounded, costed casting slots — "every enumeration site... gains an optional branch," "pairs stay at 6/10," rival permutations for optional seats must be explicitly disabled (`05:181-183`) — a crossover is expensive to cast in exactly the same currency (budget, casting capacity, star-week availability) as any large ensemble, so spamming crossovers competes with a studio's own other productions for scarce resources.
4. **No reception bonus**: `combinedR` only ever enters the awareness/forecast seam (opening reach, expectation) — never `castExecution`/craft/cohesion (mirrors the cameo model's FAME VALUE vs PERFORMANCE VALUE split exactly, `05:196-220` — reused pattern, not a new one). A big-name crossover does not make the film objectively better; *Age of Ultron* (−8% vs the first crossover) and *Justice League* (underperforming its own predecessor) are the direct evidence that hype without craft still reads as a letdown (`04a:297-298`).

---

## Part C — Minimal data shapes

```ts
// P17 root entry, keyed by an opaque, permanent id (never reused/reassigned — mirrors FilmConcept.id law, 02:98)
type SubPropertyId = string

type SubPropertyKind = 'character' | 'organization' | 'location' | 'concept'

type SubProperty = {
  id: SubPropertyId
  storyPropertyId: StoryPropertyId          // exact P16 id of the parent — required, never inferred
  kind: SubPropertyKind
  mintedAtProductionId: ProductionId        // the exact frozen FilmResult this hook cites — required
  mintedTick: number
  hookWeight: number                        // 0..1, frozen at mint (A.3)
  sovereignRightsId?: RightsId              // optional; null unless/until P16 grants independent sub-rights (A.6)
  recognition: number                       // R_sp — own accrual after mint, via the core update fn
  momentum: number                          // M_sp — own accrual after mint, starts 0
  fatigue: number                           // F_sp — own accrual after mint
  installmentProductionIds: ProductionId[]  // own releases, id-keyed, appended forward-only
  promoted?: { toStoryPropertyId: StoryPropertyId; atTick: number }   // set once by a P16 action; id persists as a historical handle
}

// Franchise root (Direction M) gains:
//   subProperties: SubPropertyId[]     // bounded: ≤ MAX_LIVE_SUBPROPERTIES_PER_STORYPROPERTY(3) unpromoted at a time

// Crossover: one FilmResult, ≥2 lineage edges — never a new Franchise object by default (B.7)
type CrossoverLineage = {
  productionId: ProductionId                          // the exact single FilmResult of the crossover film
  parentEdges: { storyPropertyId: StoryPropertyId; share: number }[]   // ≥2 entries, shares sum to 1 (B.7 table)
  mintedTick: number
  promotedToSharedUniverse?: { toStoryPropertyId: StoryPropertyId; atTick: number }   // Owner-decision path, B.7
}
```

Both roots are id-keyed scalars/lists only (never titles, never copies of `FilmParticipants`/`FilmResult`), so they satisfy §f.2's cost pattern for a new root and must join `persistedProductionIds`/`persistedConceptIds` (§a.6) the week they land, per the existing law: "every new root that can carry a production identity joins this walk in BOTH directions the week it lands" (`productionIdentity.ts:44-45`, `02:83`).

---

## Part D — UI sentences the player sees

- **Hook available (offered, not automatic):** *"Detective Mara Kessler (support, Nightshift City) could carry her own spin-off — she's recognized by part of Nightshift City's audience."*
- **Spin-off greenlight forecast card:** *"This film starts with an estimated 34/100 recognition, inherited from Nightshift City (48% of its 72/100) — and carries 20 points of Nightshift City's own overexposure."*
- **Promotion offer (P17 requests, P16 executes):** *"The Kessler Files has built its own audience — register it as its own property, independent of Nightshift City?"*
- **Crossover greenlight forecast card:** *"A team-up combines audiences: Nightshift City (50) + The Wire Room (50) → an estimated 80/100 opening recognition. Both properties will carry this film's overexposure afterward, and their next solo releases will be compared to this one."*
- **Post-crossover expectation band (next solo greenlight, elsewhere in the franchise):** *"Expectations: ELEVATED — audiences are comparing this to [Crossover Title]'s opening."*

---

## Part E — Rival rule

Rivals mint, inherit, promote, and cross over through the **identical** functions as the player (Direction K) — attached as one more bounded branch inside `hollywoodTick.ts`'s `decide()` (the same compact policy point already scoped for franchise choices generally, register SIM-009's "dormant policy dimension," `02:245-247`, §e.5), requiring `policy.version: 2`. A rival crossover requires the same rights-for-every-participant check and the same Additional Principal casting-capacity/cost as a player one — **no special-cased rival shortcut, and no rival-only relaxation of the SubProperty cap or the crossover share law.**

**Hard, pre-existing blocker, not a gap in this model:** rivals currently have **no rights model at all** — "there is **no** franchise/sequel/StoryProperty identifier anywhere in `src/` (grep: zero hits)" (`02:16`, e.1) and "rivals have no rights model at all... P16 must give rivals the same `StoryProperty` ownership before P17 can let them continue anything" (`02:247`, e.5). Until P16 extends rights to rival studios, **no rival SubProperty mint and no rival crossover is legal** — this must not be silently worked around by P17; it is a hard P16 dependency, named here rather than papered over.

---

## Part F — Exploit stress-test

| # | Exploit | Mechanism it would abuse | Smallest natural correction |
|---|---|---|---|
| 1 | **Mint-a-hook-per-film recognition farming** — option a hook on every single release, hoping a cheap few pay off later. | Unbounded, free, automatic option-minting (Q2's rejected default). | `MAX_LIVE_SUBPROPERTIES_PER_STORYPROPERTY = 3`, minted only by an explicit authored action citing one exact `productionId`/participant (A.2) — the cap is the primary defense; it is not performance-gated (would violate Direction E) so it cannot be dodged by farming flops either. |
| 2 | **Spin-off laundering of Fatigue** — spin off a healthy character out of an otherwise-fatigued franchise, hoping the SubProperty starts at zero Fatigue with none of the parent's baggage; or repeatedly re-mint "new" hooks from the same worn concept to dodge Fatigue entirely. | If `F_sp(t0)` were 0, a spin-off would be a perfect Fatigue-bypass valve. | `F_sp(t0) = FATIGUE_INHERIT_FRACTION(0.5) · F_parent(t0)` (A.4) — partial, non-zero inheritance closes most of the loophole. It cannot be closed to zero-benefit either: Direction J's own point is that a *distinct* SubProperty genuinely lowers assimilation/satiation vs a numbered sequel (Sood & Drèze, `03e:283`) — a 50% discount, not a 100% one, is the correction sized to the evidence, not to zero out the (real) benefit of diversifying. Additionally, a low-`hookWeight`/low-reach hook (the kind cheap to mint from a throwaway appearance) also inherits little Recognition (A.4), so there is no free "high-R, zero-F" hook available — high inheritance and high partial-fatigue-inheritance are coupled by the same `transferFraction`/reach terms. |
| 3 | **Crossover recognition multiplication** — repeatedly cross over the same two or three properties to keep pumping `combinedR`-driven forecasts/openings ("crossover spam," the Expendables-style ensemble-decay pattern, `04b`). | Treating a crossover as a free, repeatable Recognition multiplier with no cost. | Four independent, already-evidenced mechanisms (B.8): the crossover counts as a Fatigue-bearing installment of **every** participant simultaneously (repeat crossovers compound Fatigue on all of them at once, faster than solo spam would); `combinedR` buys awareness/opening only, never craft/reception, so a spammed crossover with unimproved craft reads exactly as a bad film would (*Age of Ultron* −8%, *Justice League* underperforming, `04a:297-298`); Additional Principal seats cost real, scarce budget/casting capacity (P14/P11/P13) every time, bounding affordability; and each subsequent crossover is judged against the **last** crossover's raised expectation baseline (D.4), not a fresh one — diminishing returns are visible to the player *before* they commit, which is exactly the *Age of Ultron* pattern already observed without any explicit anti-spam formula being needed beyond truthful expectation display. |

---

## Part G — Ownership per element

| Element | Owner |
|---|---|
| SubProperty mint eligibility (rights-not-blocked, cap check, exact-id binding) | P17 (this model) reads P16 rights + its own cap |
| `hookWeight`, `transferFraction`, `FATIGUE_INHERIT_FRACTION` formulas | P17 |
| SubProperty's own R/M/F accrual after mint | P17, via the core R/M/F update function (owned by the sibling core-franchise model) |
| Promotion decision authority (mint new StoryPropertyId, chain of title) | P16 |
| Promotion eligibility flag / payload | P17 requests; P16 executes |
| SubProperty rights granularity (whether sub-rights ever exist independent of parent) | P16 (open decision, A.6) |
| Inherited-awareness / expectation *input* into reception & forecast | P07 (reception formula) consumes; P17 supplies the value via the existing optional-input seam (§d.4) |
| Crossover legality (rights for every participant) | P16 |
| Crossover cast capacity / Additional Principal seats | P13 (era capacity) + core casting |
| Crossover talent availability / booking | P14 |
| Crossover budget / committed cost | P11 |
| `combinedR` formula, share normalization, Fatigue-similarity discount | P17 (this model) |
| Post-crossover expectation band (display only) | P17 (derived, no new formula) |
| Rival parity for all of the above | P12, via the same functions (Direction K) |
| P18 read-only reference to `SubPropertyId` | P18 (consumes only) |

---

## Part H — Structural problems found (smallest correction each)

1. **A SubProperty could easily be implemented by pattern-matching a character's name in a title or by re-reading a concept's persona fields** — both are unstable in this engine (titles are mutable post-release, §a.3; `FilmConcept` carries no character identity at all, §b.1). *Smallest correction:* require every SubProperty to bind to an exact `mintedAtProductionId` (+ exact `FilmParticipant` when character/organization-kind) at mint time, never to a title or a live concept field — already built into the data shape in Part C.
2. **The Executive comparator shows that even a *correct* two-level IP→Franchise hierarchy reads as confusing to players, and its own developer is now adding a third "Universe" tier to cope with crossovers** (`03d:307-321`). *Smallest correction:* keep exactly two levels (StoryProperty → SubProperty) and let crossovers stay edge-based rather than becoming a third persistent tier by default (B.7) — only promote to a genuinely new StoryProperty (still two levels, just a new root) if the Owner explicitly authorizes the shared-universe-branch exception.
3. **A crossover, treated as a persistent new franchise object by default, would produce "a second property identity" — the exact thing INT-012 forbids** (`02:311`). *Smallest correction:* default to `CrossoverLineage` edges on one `FilmResult` (B.7); promotion to a shared-universe branch is an explicit, rare, P16-executed exception, not the default shape.
4. **Rivals have no rights model at all today** (`02:246-247`), so any rival SubProperty or crossover is currently unimplementable, not merely unbalanced. *Smallest correction:* state this as a hard P16 prerequisite (Part E) rather than letting a future implementation silently special-case rivals around it.

---

## Part I — Open questions for the Owner (genuine decisions, not reopenings of A–U)

1. **A.6 (Q6):** does P16 ever model SubProperty-level rights independent of the parent StoryProperty, or only StoryProperty-granularity rights? This model's interface (`sovereignRightsId?`) works either way but the answer is P16's, not P17's.
2. **A.5/B.7 promotion thresholds:** exact `R_PROMOTION_MIN` and whether "own release count ≥ 1" is sufficient, or whether the Owner wants a higher bar given Creed's three-film/eight-year real-world path to outgrowth.
3. **B.7 branch-count bound:** does a promoted shared-universe branch count against the same "small number of spin-off branches" bound Direction N sets, or does the Owner want it to have its own, separate small allowance?
4. **Tuning constants** (`BASE_MIN/MAX = 0.38/0.65`, `FATIGUE_INHERIT_FRACTION = 0.5`, `HOOK_WEIGHT_DEFAULT = 0.5`, `CROSSOVER_DECAY = 0.6`, `SIMILARITY_DISCOUNT = 0.5`, `MAX_LIVE_SUBPROPERTIES_PER_STORYPROPERTY = 3`) are all starting points fit to the cited historical ranges, not calibrated in-engine — flagged as such throughout, not asserted as final.
5. **Idle/unused hooks:** should a minted-but-never-developed SubProperty ever lapse and free its slot (a secondary defense against exploit #1), or does the Owner prefer no lapse at all (simpler, and closer to Direction P's "never permanently unusable" spirit, since the slot cap alone is already the primary defense)? Not resolved here; the model works either way.
