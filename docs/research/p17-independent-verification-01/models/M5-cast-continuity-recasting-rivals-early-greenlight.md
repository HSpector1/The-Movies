> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`../redteam/R3-reviewer-corrections-calc.py`](../redteam/R3-reviewer-corrections-calc.py), committed output [`../redteam/R3-output.txt`](../redteam/R3-output.txt) — **the report governs.** Superseded here: the LEGACY (retired/deceased) carve-out is an optional refinement with no lifecycle/mortality dependency (default: ordinary recast); the 'franchise premium' is an unselected optional P14 formula, not an Owner decision (§19.4); the rival policy widening rides the next governed save version, not a numbered one.

# M5 — Cast Continuity / Recasting (F), Rival Franchise Behaviour (K), and the Rival Side of Early Continuation Greenlight (G)

Paper model. No repo edits. All engine facts cited by `file:line` at commit `13370d428f0693f3279732f6f4cc360a7fcaa4df` via `evidence/02-project-studio-architecture-READONLY.md` (tier `DEVELOPER/OFFICIAL (repo code @13370d42)` unless marked governance doc). Real-franchise and comparator evidence cited with the source-tier label carried in `evidence/04a`, `04b`, `03e`, `03a`, `05`. Every numeric constant is a **STARTING POINT** — flagged once here, not re-flagged at each occurrence. Worked numbers were computed by `models/p17_m5_calc.py` (throwaway, scratchpad-only; reuses the exact public `reach01` formula, invents nothing about box office).

---

## 0. Scope, boundary, and the two hard dependencies

This file owns three things only:

1. **Cast/creative continuity → franchise-importance association weight**, and how a next installment's recast/return choice enters P17's existing awareness/expectation seams (Direction F).
2. **A compact rival decision rule** for choosing a continuation over an original, reusing the existing `chooseIndustryPackage` scoring path unchanged (Direction K).
3. **The rival-side and shared information law for greenlighting a continuation before its predecessor releases** (Direction G).

It explicitly does **not** own: the R/M/F formulas themselves (a different M-file — this model only reads/writes R/M/F as named quantities, never redefines them); SubProperty/spin-off Recognition-inheritance sizing (Direction J — noted as an interface only, §1.7); remake comparison-pressure scoring (Direction I — out of scope, §1.7); or any P16 rights-transaction mechanic.

**Two blocking dependencies, stated up front so they are not buried:**

- **D1 — Rivals have no rights model today.** `grep` for rights/property in `src/` returns zero hits; `RivalBusiness` carries no `StoryProperty` reference at all (evidence/02 §e.5: *"Rivals have no rights model at all... P16 must give rivals the same `StoryProperty` ownership before P17 can let them continue anything"*). Everything in Part 2 and the rival half of Part 3 is written **as if** P16 has already given rivals an ownership record of the same shape as the player's; until P16 ships that, Direction K is unimplementable. This is not a P17 problem to solve here — it is the single hardest precondition, called out because it is easy to miss under a document titled "P17."
- **D2 — P14 lifecycle facts (retirement/death) are not confirmed to exist.** The task brief asks this model to make retirement/death "no-penalty," citing "(P14 lifecycle facts)." Evidence/02 does not show a `Talent.lifecycleStatus` or equivalent; §h.14 only confirms fame/credit facts. §1.6 below designs the rule assuming P14 will expose *some* public boolean/enum for "permanently unavailable." If P14 never ships this, the fallback is stated in §1.6.

---

## PART 1 — Cast Continuity / Recasting (Direction F)

### 1.1 Role importance classes

Five classes, each a **band over one continuous, deterministic weight** (§1.2) — never five separate mechanisms. Banding this way means the classes are free (no extra state), legible (one number, one cutoff table), and automatically consistent with each other.

| Class | Dominant role-family (from frozen `FilmParticipantRole`, evidence/02 §a.4 `types.ts:64`) | Gate |
|---|---|---|
| **ICONIC LEAD** | `lead` | ≥2 branch appearances **and** capped weight ≥ 1.6 |
| **CORE ENSEMBLE** | `lead` or `antagonist` | ≥2 branch appearances, weight below the ICONIC/threshold for that family (≥0.8 for antagonist-dominant) |
| **RECURRING SUPPORT** | `support` or `writer` | ≥2 branch appearances, weight ≥ 0.3 |
| **SIGNATURE DIRECTOR** | `director` | ≥2 branch appearances **and** capped weight ≥ 1.3 |
| **MINOR APPEARANCE** | anything else, including every `craft` credit and every talent below its family's gate | default |
| **LEGACY** (not a franchise-importance band — a lifecycle state, §1.6) | any | talent's P14 status is permanently-unavailable |

`craft` is **never** tracked for association weight. Direction F's own list ("iconic lead, major supporting, recurring antagonist, signature director, major recurring creative") stops at "major recurring creative"; `craft` credits are numerous, largely anonymous to the player, and evidence/05 §6 already warns that a cameo/minor credit "must never count as a 'recurring' franchise association of importance" — the same logic excludes craft outright rather than needing a threshold to suppress it.

### 1.2 The deterministic association-weight rule

**Key:** `(talentId, storyPropertyId, branchId)` — never `(talentId, franchiseId)` alone, because branch-scoping is how reboots reset (§1.7), and never a field on `FilmResult`/`FilmParticipants` (frozen-leaf rule, evidence/02 §f.1).

**Implementation shape — a derived read, not new persisted state.** `FilmParticipants` already freezes writer/director/cast/craft per film immutably (evidence/02 §a.4, `types.ts:200-222`, `filmParticipants.ts:33-45`). The Franchise root (Direction M) already needs `installments: productionId[]` per branch for other reasons (evidence/02 §f.2: "a handful of scalars + id lists per franchise"). Association weight is therefore **computed on demand** by walking those `productionId`s' already-frozen `FilmParticipants`, exactly the way `bridge/industry.ts` already builds a live index from persisted facts (evidence/02 §f.2, `bridge/industry.ts:110`). **No `FranchiseAssociation` collection is persisted.** This costs zero save bytes beyond the id-list the franchise root needs anyway — a direct answer to the save-size constraint (evidence/02 §f.2, PERF-009 already a qualified miss).

**Formula**, for a talent with appearances `i = 1..n` in role `role_i`, in a branch whose installments have public `FilmResult.boxOffice.total_i`:

```
reach01_i          = total_i / (total_i + 10,000,000)                       [EXACT reuse of starPower.ts reach01,
                                                                               evidence/02 §c.5 — no duplicate formula]
RoleWeight(role)   = ROLE_IMPORTANCE_WEIGHT[role]                            [NEW P17 constant, §1.2a]
AssociationWeight  = min( Σ_i RoleWeight(role_i) × reach01_i , CAP )
```

`ROLE_IMPORTANCE_WEIGHT` (STARTING POINT — a new P17 constant, structurally analogous to but distinct from P14's `STAR_POWER_ROLE_WEIGHTS` (`tuning.ts:571-578`); it answers a different question — "how much does this *role* anchor the franchise's identity" vs. P14's "how much does this *role* move the *occupant's* own fame" — so a shared shape with different values is deliberate, not a drifted duplicate):

| role | weight | note |
|---|---|---|
| lead | 1.0 | |
| director | 0.9 | set high, not at P14's 0.55, because evidence/04b §1.3/§G shows a *signature director* alone carried an iconic-lead recast (Fury Road: Miller returns, Hardy replaces Gibson, 97% RT, $380M WW — OBSERVED HISTORY) |
| antagonist | 0.7 | |
| support | 0.45 | |
| writer | 0.35 | |
| craft | — | excluded, §1.1 |

`CAP = 4.0` (STARTING POINT). `MIN_APPEARANCES_FOR_MAJOR = 2`, counted across **any** of lead/antagonist/support/director/writer credits in the branch; "dominant role" = the mode of `role_i` across those appearances (ties broken toward the higher `ROLE_IMPORTANCE_WEIGHT`).

**Why quality is deliberately *not* in this formula.** The task brief asks for "role × reach/quality"; this model uses **reach only** (via `reach01`) for the *association*-weight itself, and reserves quality for the *continuity-effect* multiplier at the next installment (§1.4), for a reason grounded in evidence: Hennig-Thurau (2009) measures star continuity as an *importance-weighted share of appearance*, not a quality-gated one (evidence/03e §11.1, HIGH, OBSERVED HISTORY); and the Fast & Furious 2009 reunion (29% RT) still functioned as the franchise's iconic-cast anchor (evidence/04a §1.3, HIGH, OBSERVED HISTORY). A poorly-reviewed but huge film still made its cast *known*; whether that association then *helps* the next film is exactly the separate, quality-adjacent question §1.4 answers. Folding quality into the weight itself would conflate "how famous is this pairing" with "how good was it," and would silently double-count reception (which already drives R/M/F through a different, existing channel).

### 1.3 Worked classification (proves the guards, not just the formula)

Hypothetical 4-film branch, box-office totals $90M / $210M / $260M / $140M (`reach01` 0.900 / 0.955 / 0.963 / 0.933):

| Talent | Appearances | raw weight | capped weight | Band |
|---|---|---|---|---|
| A — lead, all 4 films | 4 | 3.751 | 3.751 (capped from 3.751, cap not yet binding here) | **ICONIC LEAD** |
| B — antagonist, films 2–3 | 2 | 1.342 | 1.342 | **CORE ENSEMBLE** |
| C — support, films 1 & 4 | 2 | 0.825 | 0.825 | **RECURRING SUPPORT** |
| D — director, films 1–2 | 2 | 1.669 | 1.669 | **SIGNATURE DIRECTOR** |
| E — support, film 3 only (one-off breakout hit) | 1 | 0.433 | 0.433 | **MINOR APPEARANCE** |
| F — lead, film 3 only (one guest-starring lead credit) | 1 | 0.963 | 0.963 | **MINOR APPEARANCE** |

**The guard proves itself on E and F.** Without the `MIN_APPEARANCES_FOR_MAJOR = 2` gate, Talent E's weight (0.433) already clears the RECURRING SUPPORT gate (≥0.3) and Talent F's weight (0.963), while short of ICONIC LEAD's 1.6, would land in CORE ENSEMBLE (no separate floor exists between "not iconic" and "not tracked" for a lead-family talent) — i.e., **one single blockbuster lead credit would already read as a major franchise association**. The min-appearances rule is what the task calls for verbatim ("a single appearance never makes someone iconic... tiny roles never matter") and is kept as an **explicit, threshold-independent law**, not merely an emergent property of the weight cutoffs — future retuning of `ROLE_IMPORTANCE_WEIGHT` or the band thresholds can never silently reopen this failure mode, because the appearance count is checked first and separately.

A further consequence, stated because it is not obvious: **no talent can be a MAJOR association after only one released installment in a branch, at all** — so a sequel's cast choice can never be scored as "recast" or "returned" relative to the *first* film (nobody yet qualifies as tracked). The very first continuity credit computation that can produce anything other than a neutral 1.0 multiplier is therefore for the **third** film of a branch, once someone from films 1–2 has crossed the appearance gate. This is a direct, load-bearing side-effect of the same guard, not a separate rule.

### 1.4 The continuity effect at the next installment

**Only two seams, both already named in evidence/02 §d.4, never a third:**

| P17 quantity | Seam it feeds | Owner |
|---|---|---|
| `ContinuityCredit` (this section) | Same optional `ReceptionInputs`-style field pattern as `setUplift`/`setNovelty` (evidence/02 §d.4 row 1–2; `reception.ts:87-103`), consumed **at release** | P07 formula, P17 input |
| Same `ContinuityCredit` value | The forecast-time read at the continuation's **own** greenlight (evidence/02 §d.4 row 3; `Production.forecastSnapshot`, `actions.ts:504-520`) | P11 formula, P17 input |

No new `StandingChangeSource`, no new `ForecastFactorKey`, no change to `starDraw`/`segmentAppeal`/`criticScore` math. The discount is a **discount on the inherited-awareness/expectation input**, never a multiplier on craft, fit, or originality — those remain exactly what `reception.ts` already computes from the *current* film's actual cast/crew execution values.

**ContinuityCredit computation.** For the upcoming installment's proposed cast/crew, over every association classified as one of the four MAJOR bands (ICONIC LEAD / CORE ENSEMBLE / RECURRING SUPPORT / SIGNATURE DIRECTOR) as of the branch's most recently *released* installment (MINOR and LEGACY excluded from both sums, §1.1/§1.6):

```
PresenceMultiplier(a) =
    1.0                  if the SAME talentId fills the equivalent role class
    RECAST_RETENTION     if a DIFFERENT talentId fills it              [0.35, STARTING POINT]
    0.0                  if the role class is absent from the new concept entirely

ContinuityCredit = Σ_a [ weight(a) × PresenceMultiplier(a) ]  /  Σ_a [ weight(a) ]
```

If the tracked set is empty (no MAJOR association exists yet, §1.3's third-film consequence), `ContinuityCredit` is **undefined** and the multiplier below defaults to neutral (1.0) — a brand-new franchise's second film gets no continuity bonus *or* penalty.

**Feed into the awareness/forecast seam:**

```
InheritedAwarenessInput multiplier = 0.75 + 0.25 × ContinuityCredit        [STARTING POINT — see calibration note]
```

**Calibration note (why 0.75/0.25, not a 50/50 swing).** A harsher swing (e.g. `0.5 + 0.5×credit`) was computed and rejected: Jurassic World opened at 4× the prior franchise record with only one returning actor (evidence/04b §1.6, HIGH, OBSERVED HISTORY: "only one actor from the original film reprised their role"), and Ghostbusters (2016) still opened within $2M of Afterlife's later opening despite zero continuity cast (evidence/04b §1.5). Both show the **StoryProperty's own Recognition** — a different, larger term owned outside this model — dominates opening reach even at zero continuity. A gentle ±25% swing leaves room for that dominance while still making continuity matter at the margin, consistent with Hennig-Thurau's finding that continuity is a *significant but secondary* predictor next to awareness (β=.15 vs β=.71, evidence/03e §11.1).

### 1.5 Worked example: an excellent recast overcomes discontinuity

Branch from §1.3 releases a 5th film. The iconic lead (Talent A, weight 3.751) is **recast**; the recurring support actor (Talent C, weight 0.825) **returns**.

```
ContinuityCredit = (3.751×0.35 + 0.825×1.0) / (3.751+0.825) = 2.138 / 4.576 = 0.467
InheritedAwarenessInput multiplier = 0.75 + 0.25×0.467 = 0.867   (≈ 13% discount off full-continuity)
```

That 13% discount touches **only** the inherited-awareness input into `preMarketingAwarenessOf`/forecast (evidence/02 §d.1–d.4). It never touches `segmentAppeal`'s craft/fit/originality terms (`reception.ts:518-528`), which are computed entirely from the *current* production's actual `effectiveSkill`, `packageFit`, and `originalityRaw` — exactly the values a strong new lead, a strong script, and (per this evidence set) a **returning signature director** can still deliver at full strength. This is the Fury Road pattern precisely: Miller (SIGNATURE DIRECTOR, returns) + Hardy (recast ICONIC LEAD) → 97% RT, $380M WW, six Oscars (evidence/04b §1.3, HIGH, OBSERVED HISTORY) — the film's own craft path was unaffected by the lead recast, and the film's *own* `FilmResult` then feeds the franchise's Momentum update (a different, R/M/F-owning model) at full strength: **a strong FilmResult rebuilds M regardless of the discount taken going in.** The discount is paid once, going in; it is not a tax on the outcome.

### 1.6 Retirement, death, departure → LEGACY, no penalty

When P14 marks a talent's status as permanently unavailable (retired/deceased — dependency D2, §0), that talent's association is moved to **LEGACY** and **removed from both the numerator and the denominator** of `ContinuityCredit` for all future installments in that branch — not treated as an "absent" role (multiplier 0, counted in the denominator, dragging the ratio down), but excluded entirely, as if that slot had never been tracked for continuity-math purposes going forward.

**Worked contrast**, same branch as §1.5, but Talent A is now LEGACY instead of a live recast:

```
ContinuityCredit = (0.825×1.0) / (0.825) = 1.000   (neutral — full continuity credit)
```

versus 0.467 when the same absence is scored as an active in-branch recast. This is the "no penalty" the brief asks for, achieved by exclusion rather than by a special-cased multiplier — no new arithmetic branch, just a different membership test on the same sum. LEGACY associations remain fully visible in a franchise's history/milestone display (nothing is deleted; the derived-read-model approach of §1.2 means their historical `FilmParticipants` credits are permanent regardless) — they simply stop counting as a live continuity requirement.

**Fallback if D2 is never resolved:** if P14 never exposes a lifecycle fact, treat every departure identically to an ordinary RECAST (§1.4's default path) — strictly worse for the player/rival than the LEGACY carve-out, never better, so shipping without D2 degrades gracefully rather than silently breaking a law.

### 1.7 Rights transfer and reboot expectations

**Rights transfer.** Because the key is `(talentId, storyPropertyId, branchId)` — never `studioId` — a P16 rights transfer changes nothing about any association record; the new rights owner reads the exact same history the previous owner would have, matching Direction L and evidence/02 §h.13 ("current owner and original creator as distinguishable relationships... dated ownership history rather than destructive reassignment"). No P17 action required at a transfer event.

**Reboot.** A reboot is a **new branch** by construction (Direction N). Since association weight is scoped to `branchId`, a reboot's association weight for every talent starts at exactly zero **by key-scoping alone** — no extra decay constant is needed, and none is added. This rounds the brief's "largely resets" up to "fully resets," a deliberate simplification: no evidence in this pass quantifies a *residual* cross-branch effect (evidence/04a Part 3: "a reboot should largely reset the association... Bale 2005, Craig 2006, Pattinson 2022 all succeeded as recasts"), a full reset needs no new constant, and it matches the literal language used by both real-franchise atlases ("Reboot = new branch keeping Recognition, resetting branch Momentum/Fatigue," evidence/04a Part 5 row F; "Reboot: starts a new branch... Momentum reset to neutral, Fatigue reset partially," evidence/04b §2.F). The old branch's associations are not deleted — they remain queryable for franchise-history/milestone display (a LEGACY-like read, §1.6) — they simply do not enter the new branch's `ContinuityCredit` sums.

**Interface note, not built here — SubProperty bridging (Direction J).** Evidence shows a *bridging* association (a parent-branch MAJOR talent appearing, even in a reduced role, inside a new spin-off) measurably helped the hand-off (Creed: Stallone supporting, Oscar-nominated, 95% RT, evidence/04b §1.2/§D) while its *absence* measurably hurt one (Furiosa: neither Theron nor Hardy present, trade press named the missing bridge among the causes of a soft opening, evidence/04b §1.3/§D). The natural implementation is to run the **same** `ContinuityCredit` function once more with the parent branch's MAJOR set as the input, at a `BRIDGING_DISCOUNT` (STARTING POINT, not calibrated here) reflecting the cross-property jump. This belongs to whichever model owns Direction J's SubProperty-Recognition sizing; it is flagged here only so that model reuses this function rather than defining a second one.

**Out of scope — Direction I remakes.** A remake references one specific prior *film*, not a branch, and almost always fully recasts (comparison pressure, not continuity, is the mechanic evidence/04a/04b attach to remakes: Bohnenkamp et al. 2015, evidence/03e §11.1). No `ContinuityCredit` computation applies to a remake; its own comparison-quality model is a different P17 deliverable.

### 1.8 Three anti-lock-in guards

**(a) No mandatory cast — legality never depends on cast.** Nothing here touches the greenlight validator, which requires three *distinct* cast ids but never a *specific* talentId (evidence/02 §b.2, `actions.ts:391-411`). `ContinuityCredit` only ever scales the magnitude of an optional awareness/forecast input; it can never make a greenlight illegal, and no rule in this file reads it as a gate. This is the deliberate answer to the sibling failure mode evidence/03a documents in a live shipped game: Hollywood Animal auto-inserts previously-cast named characters into a sequel with **no recast option at all** ("recasting/role-swapping is not supported at all for named characters carried into a sequel," evidence/03a §9, COMMUNITY INFERENCE, HIGH confidence) — a story-layer mandatory-cast lock-in the same shape as the salary-layer one Direction F explicitly forbids. This model's cast choice at every installment remains a normal, fully overridable casting decision; `ContinuityCredit` is read-only telemetry about that choice's *consequence*, never a constraint on the choice itself.

**(b) Importance cap and minimum-appearances threshold.** Both defined in §1.2/§1.3: `CAP = 4.0` bounds any single association's weight (prevents an unbounded antagonist run across a 40-film branch from eventually outweighing the actual lead), and `MIN_APPEARANCES_FOR_MAJOR = 2` prevents a single breakout hit from instantly reading as a major, tracked association (proved numerically in §1.3). A third, lighter bound: only the top-K associations by weight per branch need ever be *displayed* (a query-time bound on a franchise page, not a save-size bound, since nothing is persisted) — a display recommendation, not load-bearing math, so no constant is fixed here.

**(c) Salary — P17 changes no salary and does not feed P14's offer path.**

- `salaryCurve(talent) = SALARY_BASE + SALARY_SKILL_COEF·(OVR/100)² + SALARY_FAME_COEF·(fame/100)²` = `25,000 + 150,000·s² + 600,000·f²` (`worldgen.ts:152-167`, `tuning.ts:71-73`) has **no film or franchise argument today** — it is a pure function of the person (evidence/02 §c.6). `offerForTalent` and `freelancerFee` call it **at quote time only** (`employment.ts:206-291`); `Talent.salary` itself is stamped once at creation and never re-stamped by any release path (evidence/02 §c.6, confirmed by grep). "No escalating sequel salary demand exists today — the only escalator is fame growth through `computeStarPowerDelta`" (evidence/02 §c.6, verbatim finding).
- **What P17 may do:** publish the public `(talentId, storyPropertyId, branchId) → band`classification as read-only data — usable for flavor text, a franchise page, or a future P14 "likely to accept" interest signal.
- **What P17 must never do:** pass `AssociationWeight` or its band into `salaryCurve`, `offerForTalent`, or `freelancerFee` as a price multiplier, under any name ("franchise premium," "loyalty bonus," etc.). Direction F's own escalating-salary-demand risk is exactly what Hennig-Thurau's awareness×star-continuity interaction warns is strongest for the *biggest* franchises (evidence/03e §11.1: "bigger franchises depend MORE on the iconic lead") — i.e., this is precisely where the temptation to add a franchise-premium multiplier will be strongest, which is why it is named here rather than left implicit.
- **⚑ OWNER DECISION (not built here):** if the Owner later wants a bounded "franchise premium" in P14 (e.g. `salaryCurve × (1 + FRANCHISE_PREMIUM_COEF × band)`), that is a **P14-owned** formula change reading a **P17-owned public fact** — it does not violate "P17 mints no cash" by construction, but it is a new coefficient, a new negotiation-leverage surface, and a new escalation risk that needs its own bound (e.g., capped per-film, decaying if the actor sits out an installment) before it ships. Not proposed as a value here; flagged only as a live Owner decision because the task explicitly asked for it.

### 1.9 Ownership per element (Part 1)

| Element | Owner |
|---|---|
| `FilmParticipants` frozen role history (the raw material) | P12/engine, already shipped (evidence/02 §a.4) |
| `ROLE_IMPORTANCE_WEIGHT`, band thresholds, `CAP`, `MIN_APPEARANCES_FOR_MAJOR` | P17 (new constants) |
| Association-weight/band computation (derived read, no new persisted collection) | P17 |
| `ContinuityCredit` computation | P17 |
| Optional awareness-input seam consuming it at release | P07 formula; P17 supplies the value |
| Forecast-time read consuming it at the continuation's own greenlight | P11 formula; P17 supplies the value |
| Franchise R/M/F updates from the resulting `FilmResult` | a different P17 model (not this file) |
| P14 lifecycle fact powering LEGACY | P14 (dependency D2) |
| `salaryCurve`/`offerForTalent`/`freelancerFee` | P14, untouched |
| Any future "franchise premium" multiplier | P14, pending Owner authorization |

### 1.10 Exploits considered and rejected

1. **Cheap-then-swap.** Cast an unknown as lead twice to manufacture ICONIC LEAD status cheaply, then swap them out. No payoff exists: `AssociationWeight` never feeds salary or legality (guards a/c); the only thing it discounts is a future film's *own* inherited-awareness input, and discounting your own next film's inputs is never something a rational player or rival wants to engineer.
2. **Antagonist-stacking.** Casting the same recurring antagonist actor across many installments to build CORE ENSEMBLE status cheaply (antagonist salary need not scale with fame the way a lead's does). **Not an exploit** — this is the intended, evidence-grounded behavior (a "recurring antagonist" is one of Direction F's own named examples; the Bond series' M/Q-style recurring supporting cast is the real-world analogue).
3. **Recast-everyone to dodge negative Momentum.** A full recast cannot "reset" a franchise's own bad Momentum — `ContinuityCredit` only discounts the *inherited-awareness* contribution; the franchise's R/M/F track record (owned elsewhere) is a property of the *films*, not the *cast*, and is untouched by a casting decision. There is no path from "I recast everyone" to "my franchise's Fatigue resets."
4. **Weight-cap gaming across an extremely long branch.** Bounded by `CAP = 4.0` (§1.2) regardless of installment count; a 40-film branch's lead cannot out-scale a normal one's importance-band placement, only saturate at the same ceiling.

---

## PART 2 — Rival Franchise Behaviour (Direction K)

**Depends on dependency D1 (§0): rivals must first receive a P16 `StoryProperty` ownership record of the same shape as the player's.** Everything below assumes that record exists as `RivalBusiness.ownedProperties: { storyPropertyId, branchId, recognition, momentum, fatigue }[]` (read-only from P16/P17's perspective inside `hollywoodTick`, mirroring how the player's franchise state would be read).

### 2.1 `policy.version: 2` — one new scalar, nothing else

Today's validated shape is exact-keyed: `{version:1, affinities, negativeScale, marketingRatio, reserveWeeks}` (evidence/02 §e.1, `hollywoodValidation.ts:204-211`). Direction K asks for exactly one new dimension; register row SIM-009 already calls this a *dormant* policy dimension ("later technology/franchise/recovery choices... later-authority dimensions dormant," evidence/02 §g.2/§e.5) — "dormant" is confirmed by evidence/02 to mean **absent**, not present-but-unused, so this is new surface, not an unlock.

```
policy = {
  version: 2,
  affinities, negativeScale, marketingRatio, reserveWeeks,   // unchanged
  continuationAppetite: number 0..1                          // NEW — seeded per rival, like affinities
}
```

`continuationAppetite` is seeded the same way `affinities` is today — from the authored manifest (`hollywoodStartingData.ts:8-38`), giving each of the nine studios a distinct personality (some sequel-happy, some original-focused), rather than a single global constant. No second array (e.g., a per-continuation-type affinity vector) is added: Direction K asks for "one policy dimension," and the type choice (§2.3) is resolved deterministically from the **existing** genre `affinities` plus the shared legality matrix, not a new weight table — keeping `policy`'s shape minimal, as SIM-009's own register language ("bounded policy remains core") asks.

### 2.2 The legality matrix is shared, not rival-specific

Direction K: *"Rivals obey the same franchise/rights law... outcome legality not player-only."* This model does not redefine continuation-type legality (Direction A/H/I eligibility — e.g., a reboot resetting continuity, a remake's redundancy pressure if very recent) — it is a **pure function** `legalContinuationTypes(property, currentWeek, marketState) → ContinuationType[]`, owned by whichever P17 model defines Directions A/H/I, and **both** the player's greenlight UI and the rival's `decide()` call the exact same function. This is already the architecture's existing pattern for the rest of the release chain — evidence/02 §e.4: *"Rivals (P12) resolve releases through the same `resolveReception`/`buildFilmResult`/`updateStanding`/`applyReleaseCareers` chain as the player"* — Direction K simply extends that same-law principle one step earlier, to the *commissioning* decision.

### 2.3 Decision pseudocode (≤15 lines)

Slots into `decide()` step 2's existing commission branch (evidence/02 §e.3, `hollywoodTick.ts:175-209`), which today only rolls a genre by `policy.affinities`:

```
function chooseCommission(rival, state, seed):
  candidates = rival.ownedProperties.filter(p =>
    p.momentum >= MOMENTUM_CONTINUE_THRESHOLD &&
    p.fatigue  <= FATIGUE_CONTINUE_CEILING    &&
    hasFreeCapacity(rival)                    &&
    legalContinuationTypes(p, state.week, state.market).length > 0)

  wantsContinuation = candidates.length > 0 &&
    roll(seed, rival.studioId, 'continuation-roll') < rival.policy.continuationAppetite

  if wantsContinuation:
    property = pickByWeight(candidates, p => p.momentum - p.fatigue, seed)
    type     = pickLegalType(legalContinuationTypes(property, ...), rival.policy.affinities, seed)
    inputs   = buildContinuationInputs(property, type)          // same optional field as §1.4/§3.2
    return chooseIndustryPackage(inputs, rival.policy, ctx)      // UNCHANGED scoring (hollywoodPolicy.ts:19-66)
  else:
    return originalConceptCommission(rival, state, seed)         // existing §e.3 step-2 path, unchanged
```

`chooseIndustryPackage` itself is untouched — it already scores over `ReceptionInputs` (evidence/02 §d.4 last row: *"any optional-input seam is automatically available to rival packaging"*, `hollywoodPolicy.ts:41-52`) — so `buildContinuationInputs` is the **only** new production code this section implies, and it is a pure function producing the same shape §1.4/§3.2 already define, never a second forecast/box-office model.

### 2.4 Register, validator, and migration changes this implies

- **`hollywoodValidation.ts:204-211`** widens: `exact(policy, [...v1 keys, 'continuationAppetite'])` under `policy.version === 2`, with `continuationAppetite ∈ [0,1]`; keep (or immediately migrate away) a `version === 1` branch for the transition tick.
- **A structural correction, not a free add.** `RivalBusiness.policy` lives inside the `hollywood` root, which is validated as a **frozen leaf inside the already-shipped `SaveFileV19`** (evidence/02 §f.1: V19 strips `hollywood`, validates the V18 remainder byte-for-byte, then validates `hollywood` per-leaf). Widening `policy`'s shape is therefore **not** a free in-place change to a V19 save — it is exactly the kind of frozen-leaf widening the future-proofing doctrine forbids doing quietly (evidence/02 §f.1: *"Frozen leaf shapes... are never widened in place"*). The smallest correction: bundle the `policy.version: 2` migration into the **same** `SaveFileV20` boundary that Direction M's own Franchise root already forces (evidence/02 §f.2: *"any P17 root = SaveFileV20"*) — one save-version bump carries both the new `franchises`/`storyProperties`-adjacent root **and** the widened rival policy sub-shape, rather than two separate version bumps. `convertV19ToV20` seeds every existing `RivalBusiness.policy` from version 1 to version 2 by adding `continuationAppetite` from the same manifest-seeding pattern `affinities` already uses (or a deterministic default where the manifest doesn't specify one) — mirroring `convertV18ToV19 = makeSave(initializeHollywood(state,'migration'))` (evidence/02 §f.1).
- **Identity walks (§a.6).** `RivalProjectCosts`/continuation references are id-keyed to `storyPropertyId`/`branchId`; if a new persisted field is added anywhere to carry "this rival production continues property X," it must join `persistedProductionIds`/`persistedConceptIds` the week it lands (evidence/02 §a.6, the "both directions" law) — flagged, not designed in detail here, since the exact field belongs to whichever model defines the lineage-edge root.

### 2.5 Rival early bets (predecessor locked, not released)

Rivals get the same opportunity the player gets under Direction G (Part 3): when a rival's owned property's most recent installment is **committed to release but not yet released** — i.e., past `ReleaseCommitment` (evidence/02 §a.5) or simply in-production — the rival may *also* commission its continuation early, at a smaller, appetite-scaled probability, since it is a riskier bet than the ordinary post-release case:

```
EARLY_BET_SCALE = 0.3                                    [STARTING POINT — deliberately small]
earlyBetRoll < rival.policy.continuationAppetite × EARLY_BET_SCALE
```

Worked: a rival with `continuationAppetite = 0.6` has an 18% chance per eligible decision week (`HOLLYWOOD_DECISION_WEEKS = 1`, `tuning.ts:27`) of making the early bet rather than waiting for the predecessor's release — rare enough that most early continuations remain deliberate, visible player choices rather than a background rival habit.

### 2.6 "Can own an expensive continuation nobody wants" — and the player can see it

Because a rival's early bet uses the **same** information law as the player (Part 3 — only the predecessor's public locked forecast + current R/M/F, never its unreleased `FilmResult`), a rival can legitimately commit to an expensive continuation of a property whose predecessor then bombs. This is not a bug to prevent — it is the direct, intended consequence of "rivals make equivalent bets" (Direction G) combined with "outcome legality not player-only" (Direction K). Because rival films and commitments already surface through the existing **public** projection (`bridge/industry.ts` — "public facts only... there is no combined Power score," evidence/02 §f.2, `bridge/industry.ts:110`), the player can observe, in the ordinary course of play, that Rival Studio X has committed to "Property Y, Part 3" while Part 2 is still in theaters underperforming — a legible, diegetic piece of market color (a rival's bad bet becoming visible history), not a new UI surface this model needs to invent.

### 2.7 Ownership per element (Part 2)

| Element | Owner |
|---|---|
| Rival `StoryProperty` ownership record | P16 (dependency D1, must land first) |
| `policy.version: 2` shape, `continuationAppetite` seeding | P12 (rival data model) with P17 supplying the dimension's meaning |
| `legalContinuationTypes` matrix | Whichever P17 model owns Directions A/H/I; shared, not duplicated |
| `chooseCommission`/`buildContinuationInputs` | P17 (new), calling **unchanged** `chooseIndustryPackage` (P12) |
| `hollywoodValidation.ts` widening, `SaveFileV20` migration | P12/save-layer, triggered by P17's own root landing |
| Public observability of rival continuations | Already-shipped `bridge/industry.ts` projection (P12), unchanged |

### 2.8 Exploits considered and rejected

1. **Rights-squatting via commissioning.** Could a high-`continuationAppetite` rival spam commissions of its own dormant property purely to block a player revival? No — blocking requires *rights ownership*, not production activity (P16's domain, Direction L); a rival merely producing sequels does not prevent another party from ever acquiring the property later if P16 allows a sale. Out of this model's scope, noted so it isn't mistaken for a gap here.
2. **Self-limiting spam.** A rival that commissions mediocre continuations of the same property repeatedly raises *its own* Fatigue under the same law the player faces (Direction K: same law for everyone) — eventually `legalContinuationTypes`/the momentum-fatigue gate in §2.3 stops recommending that property as a candidate at all, without any rival-specific cap being needed.
3. **Early-bet stacking.** Bounded by `EARLY_BET_SCALE = 0.3` and by capacity (`hasFreeCapacity`, already an existing constraint on rival production count) — a rival cannot early-bet on more properties than it has production slots for, so this cannot become a background flood.

---

## PART 3 — The Rival Side of Early Continuation Greenlight (Direction G)

### 3.1 The information law (identical for player and rival)

Only two inputs are legal at a continuation's greenlight, for both the player and any rival:

1. The predecessor's **public locked forecast** — `Production.forecastSnapshot` / `FilmResult.forecast` (`expectedCriticScore`, `expectedTotal`, `expectedOpening`), locked at the **predecessor's own** greenlight (evidence/02 §d.3).
2. The property's **current** R/M/F, as of the moment of the continuation's own greenlight.

**"No unreleased `FilmResult`" is close to structurally free.** `FilmResult` is only constructed at release (`buildFilmResult`, `tick.ts:594-606`, evidence/02 §a.1/§d.3); before the predecessor releases, there is no `FilmResult` in existence to leak — the rule mostly enforces itself by the data model, and the only discipline this model actually has to add is: never let anything read `Production`'s in-flight, non-public working state (script drafts, hidden persona/strength/originality) across the ownership boundary. Rivals already only ever see hidden truth about their *own* productions and perceived/estimated values for everyone else's (evidence/02 §e.3, `perceivedPlanningInputs`), so this is the existing rival-visibility law, not a new one.

### 3.2 Two separate seams — one frozen, one live — and why they must stay separate

This is the crux of the worked example, so it is stated as its own rule before the example: P17 has **two** distinct places it feeds a number into P07/P11, at two different moments, and they must not be collapsed into one:

| Seam | When it is read | What it affects | Is it frozen? |
|---|---|---|---|
| **Forecast-time** (evidence/02 §d.4 row 3) | At the continuation's **own** greenlight, via `computeForecast`'s inputs (`actions.ts:504-520`) | `Production.forecastSnapshot`, later copied verbatim to `FilmResult.forecast` | **Yes** — locked once, by existing law (§d.3), never revised |
| **Reception-time** (evidence/02 §d.4 rows 1–2) | At the continuation's **own release**, via the optional `ReceptionInputs`-style field (`reception.ts:87-103` precedent) | The film's **realized** awareness/box office | **No** — read live, the same way every other reception-time input already is |

Evidence/02 §d.3 states plainly that `FilmResult.forecast` is *the only* thing locked about a release — three scalars — and that "Standing's `ReleaseBenchmarks` parameter is dormant." Everything else about a release (marketing spend chosen close to release, awareness drift, `competitionFactor`) is computed live. Inherited awareness belongs with that second group by the architecture's own house style, not the first — treating it as a third frozen snapshot would require a **new** persisted field carried from greenlight to release (a new frozen leaf, evidence/02 §f.1) purely to freeze something nothing else about release freezes. Reading it live costs nothing new to persist, since R/M/F already have to exist as live state for every other purpose.

**This directly answers the brief's decision point: yes, read inherited awareness at release, not at greenlight — that is the fantasy**, and it is also the smaller, more consistent implementation.

### 3.3 Worked example — Film 1 bombs after Film 2 is already greenlit

At Film 2's greenlight (Film 1 still in production, uncommitted `FilmResult`):

```
Franchise state:  R=65   M=+10   F=15        (M reflects Film 0's decayed momentum — Film 1 hasn't resolved yet)
Film 2's own package would forecast expectedTotal = $250,000,000 on its own script/cast merits
Inherited multiplier at greenlight = 1.0 + 0.004·M − 0.002·F = 1.010
Film 2 LOCKS forecast.expectedTotal = 250,000,000 × 1.010 = $252,500,000
```

Film 1 then **releases and bombs**:

```
Franchise M: +10 → −35        F: 15 → 55        R barely moves (durable, evidence/03e §12/§13)
```

Film 2's locked forecast is **unchanged** — still $252,500,000, per §3.2's frozen seam. But per §3.2's **live** seam, Film 2's actual realized reception at its own release reads the **now-collapsed** M/F:

```
Inherited multiplier at Film 2's own release = 1.0 + 0.004·(−35) − 0.002·(55) = 0.750
Film 2's realized box office trends toward 250,000,000 × 0.750 = $187,500,000   (before its own craft/appeal path)
boxDelta vs. its own locked forecast ≈ −25.7%
```

The newspaper/broadcast layer already has a mechanism for exactly this: `boxDelta = deltaOf(boxOffice, expectedTotal, 10% band)` (evidence/02 §d.3, `newspaper.ts:571-574`) reports Film 2 as a clear miss against its own promise — a coherent, legible story ("this sequel missed its own forecast badly, and the franchise's collapse after Film 1 explains why") rather than a silent stat adjustment. **This is Direction G's "intentionally risky" made concrete**: greenlighting early locks a promise before the dice on the predecessor have finished rolling, and the live read at release is precisely the mechanism that lets a predecessor's failure catch up with an already-committed continuation.

### 3.4 The rival side specifically

Rivals face the **identical** law — not a parallel, weaker one:

- A rival's own continuation locks its forecast at **its own** greenlight, from **its own** property's then-current R/M/F, exactly as in §3.3.
- A rival never needs to read a **player-owned** predecessor's forecast, because a rival can only continue a property **it owns** (one current rights owner per property, Direction L) — there is structurally no scenario where a rival's early-bet decision requires seeing a player's private data, closing that exploit by construction rather than by a permission check.
- A rival's early bet (§2.5) is subject to the exact same live-read-at-release rule for its realized reception: if the rival's predecessor (also in production) later bombs, the rival's already-greenlit continuation eats the same realized shortfall the player's would — visible to the player afterward as the same kind of public market color described in §2.6.

### 3.5 The descriptor-band warning, without touching the frozen number

Direction G asks that "the descriptor band updates and the player is warned," while the locked forecast itself must not move. The answer is a **pure display read model**, in the same family as the already-shipped `receptionVerdict.ts` (evidence/02 §d.3: *"supplies display tiers only... a pure function"*): a continuation-in-production's card recomputes a risk descriptor (e.g. ON TRACK / AT RISK / OVEREXPOSED-PENDING) every tick from the property's **current** R/M/F, entirely independent of the frozen `forecastSnapshot` it's displayed next to. In §3.3's worked example, Film 2's card would flip from ON TRACK to AT RISK the same tick Film 1's `FilmResult` is built, *before* Film 2 itself ever releases — giving the player (and, symmetrically, giving the trade-press-style visibility a rival's bet gets, §2.6) a legible warning that a locked number no longer reflects the world, without ever rewriting that number.

### 3.6 Ownership per element (Part 3)

| Element | Owner |
|---|---|
| `Production.forecastSnapshot` lock mechanism | P11 (existing, unchanged) |
| Forecast-time inherited-awareness input | P17 supplies the value; P11 consumes it in the existing `computeForecast` call |
| Reception-time (live) inherited-awareness input | P17 supplies the value; P07 consumes it via the existing optional-input pattern |
| `boxDelta`/newspaper miss reporting | P08/newspaper (existing, unchanged) |
| Risk-descriptor display read model | P17 (new, display-only, no persisted state) |
| Rival-side equivalent of all the above | Same P17 seams, read through `hollywoodTick`'s existing rival release chain (P12) |

---

## Cross-cutting exploits and structural risks (all three parts)

1. **Escalating salary via franchise premium (guard 1.8c).** The single largest temptation this model identifies, because Hennig-Thurau's own data says the temptation gets *stronger* as a franchise gets bigger. Deliberately left as an explicit Owner decision rather than resolved implicitly.
2. **Frozen-leaf widening treated as free (§2.4).** The easiest mistake in implementing Direction K is to assume `policy.version: 2` is a one-line change; it is a save-version event because `hollywood` is already a validated V19 leaf. Named as a structural correction so it isn't discovered late.
3. **Collapsing the two greenlight/release seams into one (§3.2).** The second-easiest mistake: reusing one P17-computed number for both the locked forecast *and* the realized-reception input would silently make the forecast non-frozen (by making it dependent on a value that changes after greenlight) or make realized reception artificially loyal to a stale forecast. Both are wrong; they must be two reads of the same underlying R/M/F at two different times, never one cached value.
4. **Rival visibility creep.** Any temptation to let a rival's `chooseIndustryPackage` read a player-owned property's *actual* current R/M/F (as opposed to the rival's own owned properties) would break "rivals never see hidden results." Closed structurally in this design (§3.4) — rivals only ever read properties they themselves own — rather than by a runtime permission check that could later be loosened by accident.

---

## Open questions / Owner decisions

- **⚑ OWNER DECISION** — whether to ever authorize a bounded P14 "franchise premium" salary multiplier reading the public association band (§1.8c). Not built here; flagged because the task explicitly asked for the decision to be surfaced.
- **Dependency D1** — P16 must give rivals a `StoryProperty` ownership record before any part of Direction K (Part 2) or the rival side of Direction G (§3.4) can be implemented. This model assumes that shape mirrors the player's; the exact shape is P16's call.
- **Dependency D2** — confirm whether P14 will expose a public lifecycle fact (retired/deceased) for §1.6's LEGACY carve-out; a documented fallback (treat as ordinary recast) is given if not.
- **`BRIDGING_DISCOUNT` for SubProperty/spin-off continuity (§1.7)** — named as an interface for Direction J's model to consume, not calibrated here; that model should reuse `ContinuityCredit` rather than redefine it.
- **All numeric constants** (`ROLE_IMPORTANCE_WEIGHT`, band thresholds, `CAP`, `MIN_APPEARANCES_FOR_MAJOR`, `RECAST_RETENTION`, the 0.75/0.25 awareness swing, `EARLY_BET_SCALE`, the illustrative `0.004·M − 0.002·F` forecast-nudge coefficients in §3.3) are starting points for calibration against playtest data, not Owner-approved values.
- **Top-K display cap for association tracking (§1.8b)** is a UI/franchise-page decision, not fixed here.
- Whether `legalContinuationTypes` (§2.2) should also gate the *player's* UI the same tick a rival's identical property becomes illegal for the player (e.g., after a rights transfer) is a Direction L/M question, out of this file's scope.

---

## Source index (recap of tiers used above)

- `evidence/02-project-studio-architecture-READONLY.md` — `DEVELOPER/OFFICIAL (repo code @13370d42)` for every `file:line` citation; `DEVELOPER/OFFICIAL (governance doc @13370d42 / @137ab603)` for contract/register quotes; `DESIGN INFERENCE` where the sheet itself flags a seam recommendation rather than shipped code.
- `evidence/03e-comparators-other-ip-sequel-tycoons.md` §11 — `OBSERVED HISTORY` (Hennig-Thurau 2009, Basuroy & Chatterjee 2008, Sood & Drèze 2006, Bohnenkamp et al. 2015) and `CONTEMPORARY PROFESSIONAL SOURCE` (Parmley 2016).
- `evidence/04a-real-franchises-set-A.md`, `evidence/04b-real-franchises-set-B.md` — `OBSERVED HISTORY` for all dated box-office/reception ledgers (Bond, Batman, Fast & Furious, Rocky/Creed, Mad Max/Furiosa, Terminator, Ghostbusters, Jurassic Park); `CONTEMPORARY PROFESSIONAL SOURCE` for trade-press causal attribution (THR/Variety/TheWrap); `DESIGN INFERENCE` for every "safe rule"/"design inference" row.
- `evidence/03a-comparators-hollywood-animal.md` §9 — `COMMUNITY INFERENCE` (shipped-game player description) and `PRE-RELEASE PROMISE` (Act 2 dev quote).
- `evidence/05-cast-scale-and-cameo-design-evidence.md` §6 — `DESIGN INFERENCE` / `SHIPPED RETAIL` per its own labeling, used only for the cameo-exclusion boundary note in §1.1.

All numbers computed for this file: `models/p17_m5_calc.py` (scratchpad-only, not part of the repo).
