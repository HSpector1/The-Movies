# Adversarial Verification — `phase1/code-hollywood.md` (lens: COMPLETENESS & OVERCLAIM)

**Verifier stance:** hostile reader, not author. Every claim below was re-checked against the extracted snapshot `scratchpad/accepted-592e926/` (line numbers re-read with `cat -n` / `sed -n`), the design/register docs inside that snapshot, the authority copies in `scratchpad/authority/`, and the Prima plain-text extraction plus PDF page 52. Nothing was modified; no build/test/game run.

**Verdict: VERIFIED WITH CAVEATS.** The code-level claims are accurate and the line citations hold (I spot-checked ~45 citations; one is wrong). The weaknesses are (a) a promised "corrections section" that does not exist, (b) the P12 BUILDER-ANNEX was mined only for two sections although the prompt asked what it says about failure/dormancy/closure/floor, (c) a handful of wordings that outrun the evidence ("insolvent", "no event", "idle" burn figure, "activeStudioCount = entered"), and (d) an omitted presentation seam (`cashNegative` stop reason / `SIM_CAP`) that bears directly on the player-bankruptcy question.

---

## 1. Spot-checks performed (claim → source → result)

| # | Report claim | Source re-read | Result |
|---|---|---|---|
| 1 | `StudioIdentity` has exactly ten fields, no status field | `src/core/hollywoodTypes.ts:6-17` | **CONFIRMED** (studioId, role, row, name, mark, color, founding, eligibleWeek, enteredWeek, recordedFromWeek) |
| 2 | Validator enforces exact keys on identity (`:75`) and on root (`:59-60`, 18 keys) | `hollywoodValidation.ts:59-60, 75` | **CONFIRMED**; 18 root keys counted |
| 3 | `RIVAL_ARRIVAL_WEEKS = [0,0,0,0,520,988,1560,1872,2548]`; `year = 1920 + floor(w/52)` | `calendar.ts:3, 17-18` | **CONFIRMED**; 520→1930, 988→1939, 1560→1950, 1872→1956, 2548→1969 (all W1; all multiples of 13, so entrants land in the same-week chart) |
| 4 | "exactly player plus nine reserved studios" (`:72`), fixed arrival (`:86`), businesses == entered rivals (`:331`) | `hollywoodValidation.ts` | **CONFIRMED** verbatim |
| 5 | `moveRivalMoney` has no lower bound; validator `number(b.account.cash)` no min | `hollywood.ts:31-42`; `hollywoodValidation.ts:212` | **CONFIRMED** |
| 6 | Payroll/overhead/opex debited unconditionally; hiring/commission reserve-gated | `hollywoodTick.ts:279-282; :98, :126, :176, :156` | **CONFIRMED** (see caveat C3 on threshold wording) |
| 7 | Only `'replacement'` (hire reason) and one `entrant` comment; no floor/closure code | grep over hollywood*/industry*/calendar/bridge | **CONFIRMED** (`hollywoodTypes.ts:67,99`; `hollywoodTick.ts:87,128,292`; `hollywoodValidation.ts:399`) |
| 8 | Termination only via `releaseTalent` (`actions.ts:2694-2727`), mirrored at `industryEmployment.ts:25`; validator forbids non-player termination (`:357-358`), rival reasons entry/renewal/replacement (`:165`), early end needs same-week renewal (`:399`) | all four files | **CONFIRMED**; also confirmed `actions.ts:2721` is the only `contracts.filter` removal in core |
| 9 | No talent is ever removed from `state.talent` | grep for talent filters/retire/death | **CONFIRMED** (only retired-construction comments match) |
| 10 | Receipt union closed: validator table (`:347-348`), bridge drops unknown (`bridge/industry.ts:90-98` → `return []` at :97), schema group enum (`industry-schema.ts:11`) | all three | **CONFIRMED** |
| 11 | Chart written when `week%13===0 || chart===null`, identity order, output = produced scripts (+2 authored fresh rows 1–4) / player releasedFilms | `hollywoodTick.ts:306-313` | **CONFIRMED**; validator `:424-426` "released before snapshot week" also confirmed |
| 12 | Bridge rank = 1 + strictly-greater count; movement only on matching cohort; sort by lane rank then studioId; "no combined Power score" | `bridge/industry.ts:67-72, :78-83, :110, :129` | **CONFIRMED** |
| 13 | `POST /industry` (`server.ts:136`), `session.industry()` (`:1312-1315`), summary on bundle (`:1413`, `snapshot-build-context.ts:116`) | all | **CONFIRMED** |
| 14 | `ui/src/engine/adapter.ts` has no Industry/chart presentation | grep | **CONFIRMED** (only Standing copy + "charter" comments) |
| 15 | `newspaper.ts` has zero hollywood references; "Industry Pulse" only at `bridge/industry.ts:184-186` | grep | **CONFIRMED** (0 hits) |
| 16 | `canAfford` comment about payroll pushing cash negative (`employment.ts:74-86`); `studio.cash` plain number (`save.ts:2242`) | both | **CONFIRMED** |
| 17 | Tick ordering: `advanceHollywoodWeek` at `:893`; tick bump `:999`; scheduled entry `:1038-1042`; `finishHollywoodWeek` `:1043` | `tick.ts` | **CONFIRMED** |
| 18 | Tuning: decision weeks 1, contract 208, negative choices 3, rental 0.52, overhead 15,000/1,500, capex 5.9M, opex 23,500 | `tuning.ts:27-31, 413, 419-420, 684-731` | **CONFIRMED** |
| 19 | P12 package `:167, :486, :869, :874-879, :885, :903` | `docs/design/CODEX-…PACKAGE-12.md` | **CONFIRMED** |
| 20 | P12 package `:475` = "Use new versioned roots" | same file | **WRONG LINE** — `:475` is the "do not widen frozen recursive leaves in place" sentence; the "new versioned roots" phrase is at `:927` |
| 21 | Register rows ID-011 `:93`, SIM-015 `:114`, UX-011 `:144`, HIS-013 `:166`, INT-005 `:192`, INT-010 `:197`, SAF-008 `:232`, SAF-014 `:238` | `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md` | **CONFIRMED** |
| 22 | R05 `:35, :65-72, :74, :76, :118` | `P12A-R05-OWNER-DECISIONS-AND-ACCEPTANCE.md` | **CONFIRMED** |
| 23 | Consumer contract `:209, :214, :256-260, :346` | `P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` | **CONFIRMED** |
| 24 | Handoff `:15` "Negative Cash alone is not bankruptcy"; `:27` no dormant/closed status field | `authority/P12-TO-P13-PRODUCER-HANDOFF.md` | **CONFIRMED** |
| 25 | Roadmap `:679` (min three active rivals), `:681` (Power Ranking cadence); Owner rulings §4.2/§5 park acquisitions in P16+ | authority copies | **CONFIRMED** |
| 26 | Prima "Rival Studios", PDF p. 52 (printed 51): arrival "can vary over a four-year period", charts "get longer and longer", pre-1920 studios "already well established"; no closure language | `original-text/prima.txt:3150-3200` + PDF page 52 rendered | **CONFIRMED** (see M2 for what the page also shows) |
| 27 | Annex "Frozen-leaf warning" `:192-198`; Power Ranking anatomy `:319-350` "Later-wave contract, deliberately absent from P12A" | `…PACKAGE-12-BUILDER-ANNEX.md` | **CONFIRMED** |

---

## 2. Overclaims / weak claims (what a hostile reviewer would strike)

### C1 — A promised section does not exist (structural)
Report line 5: "That is no longer true; see the corrections section at the end." There is no corrections section; the document ends at §9 "Summary table". The stale P15-PACKAGE §9 rows (`authority/P15-PACKAGE.md:355-366`: "rival studios/projects absent at accepted base", "accepted save generation is V15", "additive typed industry/market event root required", "bridge ADDITIVE ROOT NEEDED", "history projection `ui/src/engine/adapter.ts`") are never enumerated against 592e926, even though the prompt's framing said the package describes code at an older commit. Worse, the P15-BUILDER-ANNEX repeatedly assumes a "P12-owned durable `active | dormant | closed` registry fact" (`authority/P15-BUILDER-ANNEX.md:65, :312, :543, :545`) — the report's own central finding (no status field) directly contradicts that assumption, but the contradiction is never stated against those lines. **Corrected statement:** the corrections are only implicit in §9; P15 authors need an explicit list — save V19 not V15; `IndustryReceipt` root exists; `POST /industry` exists; Industry lives in `bridge/industry.ts` not `adapter.ts`; and there is no P12 dormant/closed registry fact for P15B to "request" transitions on.

### C2 — Wrong citation
"Use new versioned roots (`CODEX-…PACKAGE-12.md:475`)" — the phrase is at `:927` ("Record the relationships the later implementation must be able to add through new versioned roots"). Line 475 says do not widen frozen recursive leaves. Meaning is adjacent; the line number is wrong.

### C3 — "Insolvent rival … de facto zombie … no status, no event, no exit" overstates and mis-locates the threshold
The code (`hollywoodTick.ts:98, :126, :156, :176, :197`; `hollywoodPolicy.ts:50`) gates every voluntary commitment on `cash − reserve`, where reserve = `reserveWeeks × weekly operating cost` (and, for a commission, `max(reserveWeeks, draftWeeks+8+1) × weekly cost`, `:197`). So dormancy onset is **cash < reserve (+ minimum negative budget)**, i.e. well *before* insolvency — at 12–20 weeks of operating cost (`hollywoodStartingData.ts:12-36`). Once no runs remain, cash then declines monotonically. The report body says "cash-starved"; the summary says "insolvent". **Corrected statement:** an existing implicit "constrained" regime is `policy.reserveWeeks`; a rival becomes permanently inert once cash drops below its reserve with no runs in flight, long before cash < 0. Also "no event" is too strong: as the roster drains, `expiry` receipts surface publicly as "contract ended" rows in Pulse (`bridge/industry.ts:93`), so there *is* an indirect public signal, just no corporate-state event.

### C4 — "~38,500/week idle" (summary item 4) is the zero-employee floor
15,000 base + 23,500 facility opex = 38,500 only after all six entry contracts have expired. With the entry roster the burn is payroll + 24,000 overhead + 23,500 opex. The body says this correctly; the summary compresses it into a misleading number.

### C5 — Player-distress seam omitted from §7
"No `bankrupt`/`gameOver`/`receivership` symbol anywhere in `src/`, `bridge/`, or `ui/src/engine`" is literally true, but `ui/src/engine/adapter.ts` has a `cashNegative` stop reason (`:2563`; fires when `after.studio.cash < 0 && before.studio.cash >= 0`, `:2791-2792`) and a `SIM_CAP = 520` batch guard (`:2610, :2960, :3097`). The Horizon ruling the report cites (`docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md:24-25`) names `SIM_CAP` explicitly. This is the only place in the extracted code that *reacts* to player cash crossing zero — exactly the seam a P15B "pre-terminal warning" would touch. **Corrected statement:** no bankruptcy mechanic exists, but the presentation stop ladder already treats a negative-cash crossing as a governed event.

### C6 — "`activeStudioCount` (= entered)" is imprecise
`bridge/industry.ts:23` counts every identity with `enteredWeek !== null`, which includes the player (row 0). So at 1920 W1 the count is 5, not 4.

### C7 — Per-lane ranking is a query-time read model, and the report does not flag its tension with the annex
The annex cadence rule says "Do not recompute in the client or after every release" (`…BUILDER-ANNEX.md:350`). The bridge computes rank on every `industryPage` request from the stored snapshot (fine), but for `lane=output, period=recent` it re-ranks live on a trailing-52-week count (`bridge/industry.ts:115-128`), and when `h.chart` is null it synthesises `current` from live state (`:66`). Nothing is persisted as a rank. The report describes the mechanics correctly but does not say that "already partially present" means *bridge-computed, unpersisted, non-versioned* — the very properties P15A.2 needs to add.

### C8 — Origin-game labelling under-cites the primary page
§8 says the R05 years are "inside the original guide's documented windows" citing only R05 `:74`. The Prima page itself (PDF p. 52 table "Rival Studios") is the evidence and it says more than the report reports — see M2.

---

## 3. Missing items the prompt asked for or a hostile reviewer would expect

### M1 — P12 BUILDER-ANNEX mined for only two sections
Prompt item 1 asked what the BUILDER-ANNEX says about failure/dormancy/closure/floor/replacement. The report cites only the frozen-leaf warning and Power Ranking anatomy. Skipped, directly on-topic (all in `docs/design/CODEX-…PACKAGE-12-BUILDER-ANNEX.md`):
- `:609` §N "rival cash shortage — cannot greenlight unaffordable project — constrained behavior/distress later — **no negative-through-gate unless debt law exists**" (the design rule the current reserve gate implements, and the boundary unconditional payroll/opex crosses);
- `:623-626` §N rows "rival distress / rival recovery / rival closure / active-count floor — deterministic entrant scheduling, not cash resurrection — mass-failure stress fixture";
- `:447-449` §J Industry Event Matrix rows "distress disclosed / recovery / closure" with minimum typed facts (studio/status/week/public causes; settlement refs) — the exact receipt kinds §4.3 says would need adding;
- `:258` §F Disclosure Matrix "public distress state ✓ … only after authoritative disclosure threshold"; `:369, :375` §I profile "active, dormant, or historical state; public distress status only";
- `:696-703` Golden journeys 15 (distress and recovery) and 16 (closure: "settles/cancels projects, releases talent legally, exits active charts, remains inspectable").

### M2 — Prima p. 52 table content
The rendered page shows a nine-row "Rival Studios" table with an "Appears" column: Old Rope Cinema 1898–1902, Maxipack Worldwide 1898–1902, Lionear Productions 1905–1907, Creamboat Creations 1916–1920, Rigormortis Movies 1928–1932, Gusset Entertainment 1937–1941, Cletus's Shotgun Cinema 1948–1952, Boney Studios 1954–1958, Booboo & Dingo Films 1967–1971. That is **four pre-1920 + five later — the exact 4+5 split in `RIVAL_ARRIVAL_WEEKS`** — and the R05 years 1930/1939/1950/1956/1969 are the window midpoints. The page also states "much of each studio's behavior is random" and gives per-studio genre propensities (PRIMA EVIDENCE, HIGH for what it says). The report's "labelling only" section should have said this; it strengthens the parity labelling and bounds it (the *split and windows* are retail-documented; the *exact years* and deterministic policy are authored).

### M3 — Explicit staleness table for P15-PACKAGE §9 / P15-BUILDER-ANNEX (see C1)

### M4 — Other bridge projections touching rivals
Not strictly in the prompt (which named `bridge/industry.ts`), but "what is hidden" should note `bridge/people.ts:507-510` (rival-employed person → `contract: null`, status "With <studio>", `marketRatePerProduction: talent.salary`) and `:566-567` (work "undisclosed"). Consistent with the hiding claims; worth one line.

### M5 — Policy version pin
`b.policy.version === 1` and exact policy keys (`hollywoodValidation.ts:208-209`) mean any P15B "distress posture" or remedy field on policy is also a versioned change, not additive. The report lists `:208-211` among invariants but does not draw the P15 consequence as it does for `StudioIdentity`.

### M6 — Migration-origin edge for P15
For `origin === 'migration'` worlds rivals have `founding: null`, no authored films, and enter at `max(eligibleWeek, originWeek)` with validator `:99` forbidding a "fabricated migration past". Mentioned in passing; P15C Legacy needs it stated (no pre-recording history to interpret).

---

## 4. What stands (confirmed strong claims)

1. `StudioIdentity` = ten fields, exact-keyed, no status; `HollywoodState` root exact-keyed (18 keys) — any status field/sub-root is a save-version/contract change.
2. Nine fixed arrivals `[0,0,0,0,520,988,1560,1872,2548]` → 1920/1930/1939/1950/1956/1969 W1; exactly ten identities; reserved identities hold no business/money and are chart-invisible.
3. No floor/replacement/dormancy/closure/bankruptcy code path; `'replacement'` is only a hire reason.
4. Rival cash is unbounded below; weekly payroll/overhead/opex unconditional; commitments reserve-gated (with the C3 threshold correction).
5. Rivals decide weekly through a bounded, perceived-only package chooser (6×6×3×marketing menu); ≤1 production in flight; ≤2 active screenplays.
6. Rival projects run through the shared operations/reception/run/standing engines and emit announced/released/settled receipts; the validator's conservation list in §2.4 is accurate and complete as far as I re-read it.
7. Employment: one-employer exclusivity at hire and at validation; expiry → `freeAgents`; renewal/replacement reasons; no poaching of player contracts or founding applicants.
8. Termination exists only as the player's `releaseTalent`; rivals cannot terminate and nothing can terminate for them; validator rejects any early-ended rival interval without a same-week renewal.
9. `Talent.id` immutable; talent never removed; no orphan state possible because businesses are never removed.
10. `IndustryReceipt` is a real contiguous append-only event root with a closed five-kind union enforced in validator, bridge and schema.
11. Chart snapshot = unsorted quarterly observation (Standing + output), current + previous only; ranking/movement is computed in the bridge per lane; no composite Power score.
12. Industry projection hides cash/periods/salaries/policy/forecasts/unannounced scripts/capacity/studio revenue.
13. `newspaper.ts` is player-only; "Industry Pulse" is a bridge default view; no seam between them.
14. 2040 W1 = week 6240; no end-of-campaign logic; `market.tick` unbounded.
15. Prima p. 52 establishes staggered arrival windows and lengthening charts, with no closure/bankruptcy language.

---

## 5. Verdict

**VERIFIED WITH CAVEATS.** The report's code reading is reliable and its file:line citations are, with one exception, exact. It should not be presented as complete until (1) the missing corrections section is written against P15-PACKAGE §9 / P15-BUILDER-ANNEX lines, (2) the P12 BUILDER-ANNEX §§F/I/J/N/O rows on distress/closure/floor are quoted, (3) the dormancy threshold is restated as reserve-based rather than "insolvent", (4) the `cashNegative`/`SIM_CAP` presentation seam is recorded under §7, and (5) the Prima p. 52 table (4+5 split, window midpoints) is cited directly.
