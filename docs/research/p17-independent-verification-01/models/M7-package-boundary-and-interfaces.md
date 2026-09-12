# M7 — Package-Boundary / Interface Review (Report §17)

Read-only cross-file audit. Reviewed in full: `M1-RMF-SYNTHESIS.md` (the accepted R/M/F model — M1a/b/c and
the M1j/M1k judge files are superseded by it and were not re-litigated), `M2-expectations-model.md`,
`M3-franchise-object-branches-remake-reboot-rights.md`, `M4-subproperty-spinoff-crossover.md`,
`M5-cast-continuity-recasting-rivals-early-greenlight.md`, `M6-cast-slots-cameo-recommendation.md`.
Cross-checked against `evidence/02-project-studio-architecture-READONLY.md` §d.4/§g/§h and CONTEXT.md's
package-ownership list. No repo edits; no code run. Every constant referenced below is a STARTING POINT
per the models' own convention, not re-litigated here.

---

## 1. Ownership disposition table

| # | Element | Owner package(s) | Producer → consumer interface (seam/function) | Consumer MAY read | Consumer MUST NOT |
|---|---|---|---|---|---|
| 1 | Larger cast slots (T) | P13 (era capacity) + core-casting-owner (frozen 3 seats) | `castCapacity:{additionalPrincipals,featured}` (P13, era/tech/awards-derived) → optional `additionalPrincipal?`/`featured?` arrays on `FilmParticipants`/`ShapeEffects` (M6 §13.0/13.4) | the current era's integer capacity, to decide whether to *offer* the optional seat | widen `CastSlot` union (`types.ts:19`); make an optional seat required; let rival packaging (`hollywoodTick.ts:148-154`) permute optional seats |
| 2 | Cameo Fame effects (U) | P07 (formula) / P14 (fee, booking, profession prereq) / P08 (unchanged) | P14 fame+`salaryCurve` (`worldgen.ts:161-167`) → P07's generalized `starDrawOpening'` (`reception.ts:493-507` family) + `castExecution` w/ `CAST_WEIGHT.cameo=0.10` | cameo fame, rank, `segmentFit`, acting skill | fold cameo into the `ROLE_WEIGHT` cohesion centroid (`tuning.ts:1671-1684`); let P17 count `'cameo'` credits toward `AssociationWeight` except the narrow legacy-cameo milestone (M6 §14.6) |
| 3 | Expectations (B) | P17 (R/M/F-derived multiplier, one formula — see §2 below) → P11 formula owner | optional multiplier at `computeForecast`'s engaged center (`forecast.ts:406-465`), locked to `Production.forecastSnapshot` (`actions.ts:504-520,613-627`; rival `hollywoodTick.ts:162-164`), copied to `FilmResult.forecast` (`tick.ts:594-604`/`hollywoodTick.ts:240`) | the one bounded scalar | touch `expectedCriticScore`; widen `ForecastFactorKey` (`types.ts:1881-1892`); re-derive after lock |
| 4 | Fatigue (C) | P17 exclusive | none outward except pre-composed into item 3/7's seam | — (no other package reads F directly) | feed `salaryCurve`/`offerForTalent` (M5 §1.8c); add a `StandingChangeSource`; be stored property-wide (must stay branch-scoped) |
| 5 | Spin-off recognition (J) | P17 (M4 A.3–A.4) | parent `R_parent`/`F_parent` read ONCE at mint → `SubProperty.recognition/fatigue` via `transferFraction(hookWeight)`/`0.5·F_parent` | parent R/F as of mint tick only (one-time snapshot) | keep syncing with parent after mint; inherit parent Momentum (`M_sp(t0)=0` always); decrement parent R |
| 6 | Crossover consequences (O) | P17 (`combinedR`, share law, M4 Part B) | shared `coreR`/`coreM`/`coreF` called once per participant with `weight=share_i`, `similarity≈0.5` (M4 B.5–B.6); `combinedR` feeds item 7/3's same seam | its own share-weighted delta from the one `FilmResult` | persist `combinedR` on any root (a second FranchiseScore); create a new permanent Franchise/StoryProperty by default (only `CrossoverLineage` edges, M4 B.7) |
| 7 | Inherited awareness (B seam) | P17 (composed value) → P07 formula owner | optional `ReceptionInputs` field (`reception.ts:87-103` precedent) at `reception.ts:649-652`, `marketingMenu.ts:87-96`, `reception.ts:666-676,737-741` | the one composed 0..1(-floor) scalar | add a 4th `StandingChangeSource` (`types.ts:1568-1572`); give legs/overexposure a second, separate P17 input |
| 8 | Talent continuity association (F) | P17 (`AssociationWeight`/`ContinuityCredit`, M5 Pt.1) reading P12's frozen `FilmParticipants` + P14's lifecycle flag | derived read over `installments[]`'s frozen `FilmParticipants` (`types.ts:200-222`) → `ContinuityCredit` → same seam as #7, plus a forecast-time read at the continuation's own greenlight | role/talentId/box-office per past installment (already public); P14's "permanently unavailable" flag | feed `salaryCurve`/`offerForTalent`/`freelancerFee` (M5 §1.8c); gate greenlight legality |
| 9 | Rival continuation policy (K) | P12 (`chooseIndustryPackage`, unchanged) consumes; P17 supplies `legalContinuationTypes`/`buildContinuationInputs`/`continuationAppetite`'s meaning | `decide()` step 2 (`hollywoodTick.ts:175-209`) gains `chooseCommission` (M5 §2.3) calling unchanged `chooseIndustryPackage` over `ReceptionInputs` | its OWN owned properties' R/M/F; `policy.continuationAppetite` | implement a second scoring model; read a **player-owned** property's live R/M/F (M5 §3.4) |
| 10 | Franchise lineage/branches (M/N) | P17 exclusive | none outward as a formula seam — read-only id+scalar projection (bridge/industry.ts precedent) to UI/Legacy | ids, branch types, milestone enum values, R/M/F scalars (display) | exceed `N_MAX_BRANCHES=8` lifetime (M3 §2.3); store `rightsOwnerRef`; widen `LineageEdge.parentProductionId` to an array pre-Crossover |
| 11 | SubProperty identity (J) | P17 (mint/cap/eligibility, M4 A.1–A.2) reading P16 rights + citing exact P12 ids | explicit mint action → `SubProperty{...}` (M4 Pt.C); P16's promotion action consumes P17's `promotionEligible` payload (M4 A.5) | (P18) the opaque permanent `SubPropertyId` only | infer from title/genre/cast/similarity (SAF-009); exceed cap of 3 unpromoted; self-mint the promoted StoryPropertyId |
| 12 | Rights transfer effects (L) | P16 exclusive | `rightsHolderFor(storyPropertyId \| sovereignRightsId)` — live, uncached (M3 §1.3, M4 A.6) | current owner id, at decision time only | cache an owner field on `Franchise`/`SubProperty`; let a transfer touch R/M/F/`keyAssociations`/historical studio attribution |
| 13 | Nostalgia/marketing efficiency (H) | P17 (`legacyComparisonPenalty` M1 §5.5; Seam A M2 §1.1) → P07/P11 formula owners | same seam as #7 for awareness; a separate bounded `bandWidthMult` at `CONFIDENCE_INTERVAL_WIDTH`'s application point (`forecast.ts:406-465`) | the bounded scalars only | touch `competitionFactor` (P15, DO NOT TOUCH); add a new `ForecastFactorKey` display chip without an explicit P11 schema decision |
| 14 | Early-greenlight information law (G) | Split today: M3 §7 (player-side legality) + M5 Pt.3 (seam-separation law + rival side) — **needs one named Direction-G owner in the report** | (a) forecast-time: predecessor's locked `forecastSnapshot` + current R/M/F, read once at the continuation's own greenlight (`actions.ts:504-520`); (b) reception-time: same `ReceptionInputs` field, read live at the continuation's own release | only the predecessor's PUBLIC locked forecast (3 scalars) — never its (possibly nonexistent) `FilmResult` | cache seam (a)'s value and reuse it for seam (b) (M5 §3.2); let a rival read a player-owned property's actual current R/M/F |

---

## 2. Duplicate-formula audit

**A. Genuine duplicates requiring a single-owner fix**

| # | Quantity computed more than once | Where | Single-owner resolution |
|---|---|---|---|
| A1 | "Awareness/expectation multiplier from R/M/F" — reinvented independently **three times** with different math: M1 canonical (`awareness=clamp(0.8R/100+0.2max(M,0)/100,0,1)`; `expectation=clamp(1+0.006R+0.004max(M,0)-0.005F,0.7,2.0)`), M2 (`inheritedAwareness01=clamp(0.25·rec01+0.10·max(0,mom01),0,0.35)`; `expectationMult=clamp(1+0.6·rec01+0.4·max(0,mom01),1.0,1.6)` — **omits F entirely**), M5 illustrative (`1.0+0.004·M−0.002·F`, self-flagged as illustrative) | M1 §5.5; M2 §1.1/§1.3; M5 §3.3 | The core RMF model (M1-RMF-SYNTHESIS §5.5) is the **sole owner** of the awareness/expectation formulas. M2's and M5's own numeric versions are illustrative stand-ins from when the core model didn't yet exist; both must be replaced by a call to the one owned function. Flag explicitly that M2's version is missing a Fatigue term the canonical one has — not just a recalibration gap. |
| A2 | The SAME single optional awareness field (item 7 above) has **three uncoordinated writers**: the core RMF awareness output (M1 §5.5a), M5's `ContinuityCredit` multiplier (§1.4, "0.75+0.25×credit"), and M6's "legacy cameo" milestone bump (§14.6) — no file specifies the order/merge law that combines all three into the one value actually passed to `ReceptionInputs` | M1 §5.5; M5 §1.4; M6 §14.6 | Define one `composeP17ReceptionInputs(R, M, ContinuityCredit, SubPropertyInherit, CombinedR, LegacyCameo)` owned by the RMF-core model. No sibling model writes the seam field directly; each contributes a named input to this one function. |
| A3 | Reboot Fatigue-seeding formula (`F₀ = γ(0.2) × weighted-average(prior branches' end-of-life F)`) specified **independently, verbatim-identical**, in two files | M1 §6.4 (governance fix) and M3 §3.2 | Consistent today (no drift yet) but two owners of one formula is a drift risk. Single owner = the RMF-core model (M1); M3 §3.2 should reference it, not restate it. |
| A4 | "Where does a key talent association live" — M3's `Franchise.keyAssociations[]` is **STORED** persisted state (§1.1, §1.2 table: "✅ STORED... small, bounded, id-keyed history"); M5's equivalent (`AssociationWeight`/banding) is explicitly **fully DERIVED**, computed on demand, "No `FranchiseAssociation` collection is persisted" (§1.2) | M3 §1.1/§1.2 vs M5 §1.2 | Adopt M5's derived-read approach (zero incremental save cost, no staleness). Drop M3's `keyAssociations[]` as a STORED field (or demote it to a display cache, never authoritative); all association reads route through M5's `AssociationWeight`. Shrinks M3's own §1.4 byte estimate further, reinforcing its "smaller than one FilmResult" conclusion. |
| A5 | "Where does a spin-off's own Momentum/Fatigue live" — M3's `Branch` type stores `momentum`/`fatigue` directly for every branch type **including `'spinoff'`** (§1.1, no carve-out in §1.2's STORED/DERIVED table); M4's `SubProperty` type **also** stores its own `momentum`/`fatigue`/`recognition` (Part C) | M3 §1.1/§1.2 vs M4 Part C | SubProperty (M4) is canonical — it is the identity a spin-off's continuity is actually keyed to (Direction J). A `'spinoff'`-type `Branch` record becomes a thin pointer only (`branchId`, `type`, `subPropertyId`); it must **not** carry its own `momentum`/`fatigue` fields — those live solely on the referenced `SubProperty`. |

**B. Checked and confirmed NOT duplicated (design discipline that held)**

| Pattern from the task's own examples | Verified outcome |
|---|---|
| "expectation judged in `computeStarPowerDelta` AND in Momentum" | Both independently read the same public `comparator = total/expectedTotal` (M1 §5.2.1 explicitly notes "same ratio `computeStarPowerDelta.fcMult` reads"), but write to different state (`Talent.fame` delta vs. `Branch.Momentum`) for different consumers — legitimate, per M2 §5's own audit table ("reading the same fact for a different purpose is not a re-application... to the same channel"). Not a bug. |
| "awareness added in Standing AND in the reception input" | Confirmed avoided by design: no 4th `StandingChangeSource` is ever added (M2 §5); P17's awareness value feeds only the reception-side `ReceptionInputs` seam. Standing reacts to the *realized* reach that seam already shaped, once, upstream. |
| Crossover `combinedR` (property-level R across StoryProperties) vs. cameo `starDrawOpening'` (cast-level fame within one film) | Different, already-separate engine channels (marketing-awareness/forecast seam vs. star-draw/segment-appeal seam, `reception.ts` §c.2 vs §d.2) — verified non-overlapping, not a duplicate. |
| A parallel franchise-scaled fame-loss multiplier (would double the existing talent-fame-scaled `loss` term) | Explicitly considered and rejected in M2 §2/§9 — correctly identified as a double-count and not built. |

---

## 3. P16 dependency list — what P17 needs, and the minimum charter to start against

**Facts P17 needs from P16, by model:**
- Exact, permanent `StoryPropertyId` (all six models; the sole key for every P17 root).
- A **live**, uncached `rightsHolderFor(storyPropertyId)` lookup, queryable at decision time (M3 §1.3, §5, §9; M4 A.6) — never a cached owner field on any P17 object.
- SubProperty-level rights, **if** P16 ever models them (`sovereignRightsId`) — an explicitly open P16 decision (M4 A.6, Q6) that P17's interface already accommodates either way.
- Transfer events themselves need **no explicit fact** — because the lookup is always live, a P16 sale writes zero bytes to P17 (M3 §5/§8); P16 only needs to guarantee the lookup is always answerable and that ownership history is dated (HIS-014).
- **Rivals' own `StoryProperty` ownership record**, of the same shape as the player's (`RivalBusiness.ownedProperties`) — the single hardest blocking prerequisite named across the batch (M3 §e.5 architecture note; M4 Part E; M5 §0 Dependency D1, Part 2). Without it, Direction K and the rival half of Direction G are **unimplementable**, not merely unbalanced.
- The promotion action itself ("register as its own property," minting a new `StoryPropertyId` and chain-of-title for a breakout SubProperty) is **P16-executed**; P17 only exposes a read-only `promotionEligible` flag + payload (M4 A.5).
- (Open, not required for v1) whether P16 ever splits one StoryProperty into two (the *Never Say Never Again* split-rights case) — flagged (M3 §11) as a future P16 charter question, not a P17 blocker.

**Minimum P16 charter P17 can start against (v1):**
1. A stable, never-reassigned `StoryPropertyId`.
2. A live `rightsOwner(storyPropertyId)` function returning a single current studio (or "unowned").
3. Dated ownership history (for HIS-014), even if minimal.
Everything else — rival ownership records, SubProperty sub-rights, promotion machinery, StoryProperty splits — can degrade gracefully and ship later (P17's player-side model, Direction G's player side, and SubProperty minting with default parent-only rights all work correctly under this minimum alone).

---

## 4. P18 handles exposed read-only

Only **one** is explicitly named across the batch: `SubPropertyId` — an opaque, permanent handle P17 exposes read-only on the public projection lane, so a P18 TV/cross-media spin-off of the same character/location/concept can reference it without P17 gaining any TV-specific field (M4 A.7). No file names any other P17 handle (StoryProperty-level R/M/F, Franchise/Branch ids, milestones) as needed by P18. **Gap, not resolved by any model:** whether a television property should ever "ride" a film franchise's R/M/F (e.g., a hit-movie's Recognition informing a spin-off show's own launch) is untouched by all six files — flag as an open question for the report rather than assume either answer.

---

## 5. Save/schema implication summary — sequenced

0. **Prerequisite (P16, before any of this):** `storyProperties` root + a live `rightsOwner()` lookup exist (per §3's minimum charter).
1. **`SaveFileV20` — one bundled bump, not several:** add `storyProperties` (P16) and `franchises` (P17: `Franchise`/`Branch`/`LineageEdge`/`SubProperty`/`CrossoverLineage`, all id+scalar only) **and** widen `hollywood.policy` to `version:2` (`continuationAppetite`) **in the same version step** — three independent files converge on bundling the policy widening into the same boundary the Franchise root already forces, rather than a second migration (M3 §f.2; M5 §2.4's explicit "structural correction, not a free add" — `hollywood` is a validated V19 leaf). One `convertV19ToV20` migration seeds `continuationAppetite` per rival (manifest-derived or default) and seeds an **empty** `franchises`/`storyProperties` root (no inference of past franchises, per INT-012).
2. **Identity-walk joins, same week:** every new id-bearing field (lineage edges, SubProperty mint references) joins `persistedProductionIds`/`persistedConceptIds` in **both** directions the week it lands (§a.6 law; M3 stress-test #2, M4 Part C, M5 §2.4).
3. **Bridge/projection bump:** expose the new `franchises` root read-only (ids+scalars, no titles) — projection currently at 29; needs its own bump alongside the V20 save-version step (M3 §f.2 requirement 4).
4. **Lower-risk, can ride the same bump or ship independently:** `FilmParticipantRole` gains `'cameo'` (and optionally `'featured'`); `Production`/`FilmParticipants`/`ShapeEffects` gain additive optional `additionalPrincipal?`/`featured?` (M6 Shape A/B) — these touch per-film records, not the franchise root, so they carry lower schema risk than step 1, but bundling into one release event is simpler for players and playtesters.
5. **Explicitly NOT touched by any of this** (worth stating as negative space): `ForecastFactorKey` enum, `StandingChangeSource` (still exactly 3 keys), `EraConfig`'s structural shape (`castCapacity` is P13-computed, not a new stored field, per M6 §13.4), `CastSlot` union (frozen), `salaryCurve`'s signature (P14, unchanged).
6. **Graceful-degrade path if P16's rival-rights extension isn't ready by V20:** the `policy.version:2`/`continuationAppetite` schema can still land, but rival continuation logic simply never fires (no candidate ever exists) until P16 ships `RivalBusiness.ownedProperties` — no second migration needed later, just a functional unlock.

---

## 6. Contradictions between model files — each with a resolution

| # | Contradiction | Resolution |
|---|---|---|
| 1 | **M1 vs M2 — locator for where the expectation multiplier enters.** M1 §5.5(b) cites `tick.ts:594-604`/`hollywoodTick.ts:240` — the **release-time copy** of an already-locked forecast (per architecture §d.3, these are where `FilmResult.forecast` is copied *from* `Production.forecastSnapshot`, not where it is computed). M2 §1.2 correctly cites `forecast.ts:406-465`/`actions.ts:504-520` — the **greenlight-time lock**. M1's own worked Case-A table (reading `expect=1.808` at the week-4 *greenlight decision*) is only consistent with M2's citation, not M1's own. | Adopt M2's locators as correct: the multiplier must be applied where `computeForecast`'s engaged center is formed, **before** the `Production.forecastSnapshot` lock (player: `actions.ts:504-520`/`forecast.ts:406-465`; rival: `hollywoodTick.ts:162-164`, not `:240`). Correct M1 §5.5(b)'s citation to match its own worked examples. |
| 2 | **M1/M2/M5 — three independent expectation/awareness formulas** (detailed in §2.A1). | Single RMF-core owner (M1 §5.5); M2/M5's own versions are superseded illustrations. |
| 3 | **M1/M5/M6 — uncoordinated writers to one awareness seam** (detailed in §2.A2). | One composing function, owned by the RMF-core model (§2.A2). |
| 4 | **M3 vs M4 — where a spin-off's own Momentum/Fatigue is stored** (detailed in §2.A5). | SubProperty (M4) canonical; M3's spinoff-type `Branch` becomes a thin pointer. |
| 5 | **M3 vs M4 — SubProperty rights.** M3's Direction-E legality matrix (§9) states spin-off rights are flatly "same [as parent StoryProperty owner]," with no accommodation for sub-rights. M4 A.6 explicitly leaves open, and structurally supports, an independent `sovereignRightsId` for a SubProperty, with `rightsHolderFor(sub) = P16.rightsOwner(sub.sovereignRightsId ?? sub.storyPropertyId)`. If P16 ever chooses the sub-rights shape, M3's flat rule would check the wrong owner. | M3's "Film spin-off" legality row must route through M4's `rightsHolderFor()` rather than assume parent-only ownership, so the model is not silently wrong under either future P16 answer. |
| 6 | **M3 vs M5 — persisted vs. derived key-talent-association storage** (detailed in §2.A4). | Derived (M5) wins; drop M3's stored `keyAssociations[]` field. |
| 7 | **M3 vs M6 — closed milestone enum has no slot for M6's recommendation.** M6 §14.6 recommends a "legacy cameo" milestone on the Franchise root. M3's `MilestoneId` (§1.1) is a CLOSED enum (`'firstContinuation'\|'firstReboot'\|'firstSpinoff'\|'firstCrossBranchRevival'\|'longestDormancyBroken'\|'branchEnded'`) with no cameo-related member. | Add a `'legacyCameo'` member to `MilestoneId` — a small, explicit, versioned addition consistent with M3's own HIS-014 discipline — before M6's recommendation can be implemented. |
| 8 | **M1 vs M3 — R/M/F constants differ, but M3 self-disclaims.** M3's own placeholder formulas (§4) use R half-life 520wk/floor 0.55×peak, M half-life 26wk, F half-life 78wk; the final adopted M1-RMF-SYNTHESIS uses 650wk/0.35×peak, 24wk, 104wk respectively. M3 explicitly labels its own formulas "illustrative only... swap for the real model." | Not a design contradiction requiring a decision — but the report must flag that M3's own worked numbers (§4's Q historical-weighting example, the Batman/Bond/Star Wars half-life cross-check) do **not** carry over numerically to the shipped model; only their qualitative shape does. Re-run them against M1's final constants before citing in the shipped report. |
| 9 | **Direction G has two partial owners, not a contradiction but a gap.** M3 §7 covers player-side legality; M5 Part 3 covers the frozen/live seam-separation law and the rival side. They are consistent with each other (M5 is a strict superset for this Direction) but no single section owns the whole of G. | Consolidate under one Direction-G subsection in the report, citing both M3 §7 and M5 Part 3, rather than leaving Direction G's coverage split across two files with no cross-reference. |

---

## Open items for the report writer (not resolved here, flagged by the models themselves)

- Direction F's talent-continuity signal enters R/M/F only *indirectly* (through the resulting film's own quality) — whether P17's kernel should ever carry an explicit modifier for a broken/preserved iconic association is an unresolved genuine Owner question (M1 §6.8 item 4), separate from M5's `ContinuityCredit` (which discounts *awareness*, not the R/M/F kernel itself).
- Whether a bounded P14 "franchise premium" salary multiplier should ever exist, reading P17's public association band — flagged as a live Owner decision by M5 (§1.8c, §Open Questions), not built by any model.
- SubProperty/crossover promotion-branch nesting depth and whether a promoted shared-universe branch counts against Direction N's "small number of spin-off branches" bound — unresolved by M1/M3/M4 alike.
