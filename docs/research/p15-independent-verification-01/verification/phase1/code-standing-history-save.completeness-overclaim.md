# Verification memo — `phase1/code-standing-history-save.md`
**Lens:** COMPLETENESS & OVERCLAIM (adversarial)
**Verifier:** independent, read-only; all checks made directly against `scratchpad/accepted-592e926/`, the authority copies, and the original-text extractions. No git, build, test, or player-data access.
**Report under review:** `scratchpad/out/phase1/code-standing-history-save.md` (author's 20-claim summary attached to the task).

## Verdict: VERIFIED WITH CAVEATS

The report's core code findings are sound. I spot-checked fourteen distinct claims against the snapshot files and every one of the load-bearing mechanics (Standing formulas, rival symmetry, Awards stub, `classifyRecovery` predicates, `canAfford` gating, absence of any tick cash predicate or calendar end, the V18→V19 migration pattern, Save As semantics, newspaper scope, history kinds, register rows, original-game debt rule) reads exactly as the report says. What a hostile reviewer would find is (a) one HIGH-confidence claim that is overstated in a way that would mislead a P15 builder copying the pattern, (b) four citation line-slips, (c) an understatement of what the Studio Charts already ship (rank movement), and (d) a §6 register sweep and an original-game cross-check that are materially incomplete relative to what the prompt asked for.

---

## 1. Spot-checks performed (14; all against the snapshot or the named source)

| # | Claim (report §) | Source inspected | Result |
|---|---|---|---|
| 1 | Three channels, 0..100 clamp, INITIAL 40/40/50, formula version string | `types.ts:267-271`; `tuning.ts:1698-1702`; `standing.ts:99, 143-207` | CONFIRMED verbatim (Δ formulas, pivots 0.45/0.58, caps ±6/±10/±5, cost floor 500k) |
| 2 | Weekly awareness drift engaged-only, κ 0.04, anchor 35 | `tick.ts:825-878`; `tuning.ts:120-121` | CONFIRMED (`if (engaged)` at `tick.ts:846`) |
| 3 | Rival `updateStanding` on release with `engaged:true`, `filmReleased` receipt with before/after; rival drift | `hollywoodTick.ts:249-253, 277-278` | CONFIRMED — but see caveat F (rival drift is NOT engaged-gated) |
| 4 | Chart snapshot every 13 weeks, only `chart`/`previousChart` | `hollywoodTick.ts:306-313`; `hollywoodTypes.ts:104, 122-123` | CONFIRMED |
| 5 | No composite; bridge notice "no combined Power score" | grep of `src/core`, `bridge`, adapter; `bridge/industry.ts` | CONFIRMED in substance; the notice is at **`:110`, not `:117`** (caveat B) |
| 6 | Awards = blueprint stub only, copy "Awards are not part of the game yet." | `types.ts:918-919`; `blueprintRequirements.ts:62-66, 117-118`; full grep for award/ceremon/nominat/trophy/oscar/academy | CONFIRMED; the only extra hit is `placement.ts:1276-1277` (award-id non-empty validation), no simulation |
| 7 | `classifyRecovery` predicates and the "No recovery mechanic (loans/financing)" reason | `studioRunRecap.ts:79-84, 962-1007` | CONFIRMED verbatim |
| 8 | `canAfford` = cash − amount ≥ 0; seven `actions.ts` gates; `releaseTalent` ungated | `employment.ts:70-86`; `actions.ts:572,1421,1607,1625,2629,2674,2790, 2710-2725, 17-18` | CONFIRMED (see caveat I on placement/sets refusal codes) |
| 9 | No tick cash predicate; only three throws; calendar has no end week | `tick.ts:182-215` (+ grep `throw`: `:143,:475,:506`); `calendar.ts:13-21` | CONFIRMED |
| 10 | `moveRivalMoney` no floor; reserve gates; rivals keep paying | `hollywood.ts:31-41`; `hollywoodTick.ts:98,126,176,280-282` | CONFIRMED |
| 11 | `validateSaveV19` peel-and-delegate; `convertV18ToV19`; `migrateToV19`; `assertFrozenBuilderRetainsHollywood`; exact-key state validators | `save.ts:363-368, 5675-5679, 7228-7257, 4936-4960`; `v12ExactKeys(state, …)` at `:3943,4128,4579,4700` | CONFIRMED — **but "every older migrateToVn" is overstated** (caveat A) |
| 12 | Save As branches under new UUID, refuses active overwrite, 32 records / 256 MiB, no frozen flag | `campaign-library.ts:14-18, 181, 229-235, 40` | CONFIRMED |
| 13 | Newspaper is player-film-only, browser-only, DISCLOSURE text | `newspaper.ts:1-10, 30, 401-402`; `ui/src/engine/adapter.ts:5965-5990`; grep of `bridge/` | CONFIRMED |
| 14 | Register rows P08-REQ-003/022–029/035/039; P11-REQ-023/041/042 + §4.E; P12A GOV-005/006, INT-009/010, SAF-004/008/009/016; original-game debt rule | register line numbers as cited; `manual.txt:129-130`; `prima.txt:769-775`; `gamefaqs-maxx.txt:659` | CONFIRMED line-for-line |

Also confirmed: `StudioIdentity` has no status field (`hollywoodTypes.ts:6-17`); `careerMilestone` has consumers/validators (`bridge/history.ts:367`, `hollywoodValidation.ts:442`, `save.ts:4915,4929`) but no producer in any core producer file; `GameStateV19 = GameStateV18 & { hollywood }` (`types.ts:1689`); protocol 4 / projection 29 / checkpoint 1; the three seam files `ledger.ts`/`theatrical.ts`/`events.ts` do not exist (note `src/core/economy.ts`, also named in the annex, *does* exist — the report's correction row only lists the three that are missing, which is accurate).

---

## 2. Overclaims and errors (ordered by consequence)

### A. "every older `migrateToVn` refuses to downgrade V19" — OVERSTATED (claim 14, rated HIGH)
Only six functions carry the explicit V19 refusal: `migrateToV15` (`save.ts:7072`), `V18` (`:7139`), `V17` (`:7147`), `V16` (`:7160`), `V14` (`:7176`), `V13` (`:7202`). The report cites exactly these six lines and then generalizes to "every older". `migrateToV12` (`:7047`) refuses only versions 13–18 by name; `migrateToV11` (`:7024-7045`) refuses 12–18; `migrateToV4..V10` were not updated for V19 at all. A V19 save handed to `migrateToV12` falls through `convertV11ToV12(migrateToV11(save))` down the chain and fails only at a V1/V2 shape check with a non-specific error, not with a deliberate "cannot downgrade V19" refusal.
**Corrected statement:** "The V19 step added explicit V19-downgrade refusals to the six retained load-boundary migrations `migrateToV13..V18` (and `V15`); the pre-V13 chain was not touched." **Consequence:** the report's "what an additive P15 root would need" list (§5.2 step 5, claim 15) says "V20-downgrade refusals in every older `migrateToVn`" — the actual established pattern is narrower (add V20 refusals to `migrateToV13..V19`). A builder following the report literally would over-scope.

### B. Citation slip: `bridge/industry.ts:117` for the "no combined Power score" notice
The notice string is at `bridge/industry.ts:110`. Line 117 is inside the `lane==='output' && q.period==='recent'` branch (see D). The claim itself is true.

### C. Citation slips in §7 (corrections table)
- "current accepted code has no authoritative rival market, Power Ranking, corporate-state, acquisition, co-production, or 2040 finale model" is at `P15-PACKAGE.md:368-369`, not `:376-377` (those lines are prose about "a once-dominant company struggles, becomes dormant").
- "no mandatory hard-bankruptcy game-over" in the annex is at `P15-BUILDER-ANNEX.md:127`, not `:625` (that line is the "bridge session" seam row). The package cites `:94` and `:393` are correct.

### D. Understatement: Studio Charts already ship per-lane rank MOVEMENT and a 52-week "recent" output period (claim 4)
The report says lanes are "each ranked independently" and calls this "a seam for P15A.2". It omits that each `StudioIndustryLane` already carries `rank`, `priorRank`, `movement: 'new'|'unavailable'|'up'|'down'|'unchanged'`, `movementLabel` ("Up N since <date>"), `snapshotWeek`, `priorWeek` (`bridge/industry.ts:74-84`; `industry-schema.ts:7`), plus a `period==='recent'` branch that recomputes the output lane as "Released Films · Last 52 weeks" from film release weeks, not the snapshot (`bridge/industry.ts:115-127`). This matters because SAF-004 (P12A register `:228`) prohibits "formula, weights, **movement**, reasons, or weekly ranks" for Power Ranking. The resolution exists in the register — UX-005 (`:138`) records "Separate-lane comparable movement, periods, cohorts, ties and player anchor implemented" — i.e., per-lane movement is sanctioned as Studio Charts and only the *aggregate* is Power Ranking. A P15A.2 reader needs that boundary drawn explicitly; the report leaves it implicit and its "no ranking archive beyond two quarters" framing understates how much comparative machinery is already live.

### E. "The only comparative structure is HollywoodChartSnapshot" — slightly too strong (claim 4)
The bridge also builds a live fallback chart when `h.chart === null` (`bridge/industry.ts:66`), derives the recent-output counts from `filmsByStudio` (D above), and emits per-studio `tendencies` ("Observed release genres", "Observed release pace", `:155-156`). None is an archive, so the report's P15A.2 conclusion stands, but "only" is inaccurate.

### F. "Rivals receive the same weekly awareness drift" — same formula, different gate (claim 3)
Player drift runs only `if (engaged)` (`tick.ts:846`). Rival drift at `hollywoodTick.ts:277-278` is unconditional; `advanceHollywoodWeek` (`:213-215`) is gated only on `state.hollywood` being non-null, and `tick.ts:893` calls it every tick. The report's §8.5 flags the `engaged:true` pivot hard-code but not the drift-gate asymmetry. For a P15 symmetry proof both belong in the same note.

### G. §6 register sweep is incomplete against the prompt's own keyword list (claim 18)
The prompt asked for rows on "loans, bankruptcy, distress, net worth, valuation, acquisition, Power Ranking, finale, endless mode, minimum rivals". My keyword grep of the P12A register hits 15 row IDs; the report lists 11 and omits:
- **SIM-015** (`:114`) — the direct "minimum rivals" row: "treat roughly 6–10 active AI rivals as later operating target and 12 as stress, not Owner law … later P15B mass-failure floor proof remains deferred." The report's line "the only related phrase is INT-010's 'active-floor/cap'" is therefore wrong.
- **SAF-012** (`:236`) — "Do not recreate the original universal Studio Rating or average the three Standing channels; do not add a fourth field to frozen Standing." This is the *current, active* composite prohibition and the leaf guardrail; the report cites only the historical P08-REQ-003.
- **UX-003 / UX-004 / UX-005** (`:136-138`) — chart lanes, "never ship an Overall industry score", and the sanctioned per-lane movement (see D). UX-003's current cell: "Later aggregate Power Ranking remains excluded."
- **UX-010** (`:143`) — "…distress, and similar facts become public only after an authoritative announcement/disclosure/event threshold; absence remains unknown/private, not false." Directly governs any P15B distress notice on the Pulse seam the report proposes in §4.2.
- **HIS-007** (`:160`) — never invent "…awards, rankings, chart peaks, market pressure, distress stories…" for pre-migration rivals (complements SAF-016).
- **HIS-014** (`:167`) — "Preserve Legacy-ready 1920–2040 facts: … peak/final Standing, durable films/records/awards/milestones … later Power summaries …" — the closest thing to a "finale"/Legacy row and the natural anchor for §2.2.
- **INT-011** (`:198`) — acquisitions/ownership transactions are P16-owned; relevant to the prompt's "acquisition" keyword.
The P08–P10 and P11A sweeps are complete as far as my grep shows.

### H. Original-game cross-check skips the most relevant retail evidence on the same manual page
§3.4 cites manual p.6 for the debt rule (`manual.txt:129-130`) but not the "Studio Ranking" paragraph immediately above it (`manual.txt:110-125`): rank "is determined by a number of factors, such as your cash balance, the quality of movies … the quality of Stars … how well connected and laid out your studio is and even how clean and tidy you keep the place", and "Your Cash Balance contributes toward your ranking in the Charts." This is RETAIL SHIPPED MECHANIC evidence that the original game *had* a cash-weighted composite — precisely what P08-REQ-003/SAF-012 reject and what §1.4 proves absent. Prima `prima.txt:767-780` likewise establishes Lifetime Achievement Awards "for getting a studio to 2005" (a retail end-of-campaign recognition relevant to the Awards/2040-Legacy question). Neither is cited; the omission does not falsify any code claim, but the report's evidence-discipline header promised the retail-vs-project distinction and §1.4/§2.3 would be stronger with it. (My grep of all five extractions for game-over/bankruptcy/"you lose"/out-of-business found nothing, so "no inspected retail source establishes a bankruptcy game-over" stands.)

### I. Minor: gate enumeration
The `canAfford` list omits the quote-time gates the actions call into: `placement.ts:636` (`insufficientFunds` refusal code), `sets.ts:467, 536`. Substantively harmless — the `actions.ts` callers cited are the entry points — but "the only cash-gated actions … at actions.ts:…" should say the gates live in `placement.ts`/`sets.ts` and are surfaced through those actions.

---

## 3. What the prompt asked that the report did not answer, or answered vaguely

1. **Prompt §6 keyword sweep** — incomplete on "minimum rivals", "acquisition", "Power Ranking", and "finale" (see G). The prompt asked to "quote row IDs and dispositions verbatim (short)" for *any* rows on those topics.
2. **Prompt §1 "how rival standing is updated on filmReleased"** — answered, but the gating asymmetries (pivot hard-code AND drift not engaged-gated) are split between §1.3 and §8.5 and the second is missing (F).
3. **Prompt §3 "is any of it surfaced to the player"** — honestly rated LOW for the browser screen (not in snapshot); acceptable, and the bridge answer is precise.
4. **Prompt §4 "whether it can carry an industry-wide headline"** — answered (no) and the Pulse seam is correct; but the disclosure law UX-010 that would govern a P15B "distress" notice on that seam is not cited (G).
5. Everything else in the prompt (channels/ranges/rules, history roots, Awards, recap predicates, game-over proof, DISCLOSURE, V19 chain, additive-root recipe, Save As) is answered with correct citations.

---

## 4. Things the report got right that a hostile reviewer would try and fail to break
- Awards: exhaustive — the grep space (`award|ceremon|honor|nominat|trophy|oscar|academy`) yields only the blueprint stub, a validation guard, a name string, and a copy line. No award state anywhere.
- Game-over: the `throw` inventory of `tick.ts` is complete (3 sites, none cash-related); payroll/overhead/opex debit unconditionally; `campaignDate` accepts any safe non-negative integer.
- Save As: `CampaignRecord = {id,label,revision,checkpointJson}` has no frozen/readonly attribute; `saveAs` refuses `overwrite.id === activeCampaignId`.
- `classifyRecovery`: the five verdict predicates are quoted with exact logic; the loans/financing reason string is verbatim.
- Migration recipe: peel-then-delegate with exact-key state validation is exactly how V16–V19 were added; the "no backfill" observation matches `initializeHollywood(state,'migration')` (`hollywood.ts:111-136`: `founding:null`, `enteredWeek:null` for not-yet-due rivals, player `recordedFromWeek` from history).

---

## 5. Corrected statements (for the consolidator)

| Report statement | Corrected statement | Source |
|---|---|---|
| "every older `migrateToVn` refuses to downgrade V19" | Explicit V19 refusals exist in `migrateToV13, V14, V15, V16, V17, V18` only; `migrateToV4..V12` refuse only V13–V18 by name. A P15 V20 step should mirror that: add V20 refusals to `migrateToV13..V19`. | `save.ts:7024-7048, 7072, 7139, 7147, 7160, 7176, 7202` |
| notice at `bridge/industry.ts:117` | `bridge/industry.ts:110` | direct read |
| P15-PACKAGE `:376-377` / annex `:625` | `P15-PACKAGE.md:368-369` / `P15-BUILDER-ANNEX.md:127` | direct read |
| "four separate lanes … ranked independently … no ranking archive beyond two quarters" | Four lanes each carry rank, priorRank, movement (up/down/unchanged/new/unavailable) and a dated movement label; the output lane has a 'recent' 52-week period computed from film weeks; sanctioned by UX-005 as Studio Charts, distinct from the SAF-004-prohibited aggregate Power Ranking. Two-snapshot retention stands. | `bridge/industry.ts:66-86, 115-127`; P12A `:138, :228` |
| "Rivals receive the same weekly awareness drift" | Same formula; player drift is engaged-gated, rival drift runs whenever `hollywood` exists. | `tick.ts:846`; `hollywoodTick.ts:213-215, 277-278` |
| "'Minimum rivals': the only related phrase is INT-010's 'active-floor/cap'" | SIM-015 states 6–10 active rivals as later operating target, 12 as stress, "not Owner law", and defers a P15B mass-failure floor proof. | P12A `:114` |
| §6.2 row list | Add SAF-012, UX-003/004/005, UX-010, HIS-007, HIS-014, INT-011. | P12A `:136-138, 143, 160, 167, 198, 236` |
| §3.4 original-game context | Add: retail manual p.6 describes a cash-weighted composite "Studio Ranking" (the thing SAF-012 rejects); Prima lists Lifetime Achievement Awards for reaching 2005. | `manual.txt:110-125`; `prima.txt:767-780` |

No claim in the report promotes a pre-release feature to retail parity, treats a design doc as code, or generalizes a forum post; the retail/community labels in §3.4 are applied correctly.
