# 1323-A: P15A.1 Wave 0 reconnaissance and the Wave 1 (pure law) charter

Parent proposal at HEAD 05dfe33d, source-only. Authority read: P15 package and builder annex at 2a7ff0d9
(`docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15{,-BUILDER-ANNEX}.md`), RECONCILIATION-02 at c5b52b4d
(§1, §2, §7.1-7.3, §9), `docs/engineering/p14-preparation-8ef5246a/CODEX-P13-P15-OWNER-RULINGS.md` §4,
[1122-A](1122-A-p15-owner-presentation-decisions.md), `P15A1-RELEASE-SEAM-NOTES.md`/`-REVIEW.md` and
`P15A1-ORDERING-INVENTORY.md`.

## 1. Authority, and the one tension it carries

- Owner-approved (rulings §4.1): one symmetric shared market; frozen same-week batches with exact self-exclusion;
  genre and release pressure with decay; one law for player and rivals. P15A is bounded to "two same-genre releases,
  one frozen pre-batch snapshot, exact self-exclusion, pressure and decay, typed source reasons, and deterministic
  player/rival symmetry proof."
- Rulings §4.3 lists "the exact shared-market formula" as an open Owner decision. The later relayed Owner Direction A
  (2026-09-11, RECONCILIATION-02 §1.1, §7.1) settles genre plus release-window competition with a working window of
  about four weeks and leaves "exact window/curve" as open tuning; RECONCILIATION-02 §2.2 classes the taper and
  constants as C (charter authors and playtest) and §9 lists no formula item among the remaining Owner choices, whose
  presentation items D2/D3/D4a were answered on 2026-09-27 (1122-A).
- This charter therefore proposes the curve and constants as class-C hypotheses under Direction A. Wave 1 is pure,
  unexported to saves and integrations, and reversible; the annex's Wave 4 Owner playtest (KEEP/REVISE/REJECT) keeps
  the formula decision with the Owner. If the Owner reads §4.3 as still requiring an explicit formula selection before
  any code, Wave 1 stops at this record and the constants below are the proposal put to them.

## 2. Wave 0 reconnaissance (source facts at 05dfe33d)

1. **Player release set.** `src/core/tick.ts:502` collects productions at `remainingTicks === 0` after the operations
   advance and checks the set against the commitment witness (`:506-519`) before any reception, RNG or cash work.
   Reception (`:625`) is the only consumer of the simulation RNG stream (one critic draw per release, ascending id);
   discoverability uses the isolated `stream(seed,'discovery-v1',id)`. Reception inputs read the start-of-tick state
   (`state.market`, start-of-tick standing), so deferring the verdict within the week does not change its inputs or
   its drawn values while nothing else draws from that stream.
2. **Rival release sets.** `src/core/hollywoodTick.ts:312-392`: per business, in roster order: sound, `staff`, plans,
   research, `decide`, `operateStage`, release commitments, production technology, `advanceManagedProductions`, then
   the same pass resolves each release (`:340`, derived streams `hollywood-v1:<id>:reception`, `discovery-v1`),
   appends `h.films`, opens the run, updates standing, appends globally sequenced receipts, pays run weeks, payroll,
   overhead and script work. A later business's `decide` reads `forecastHistoryForOwner` over `h.films`
   (`:237`), including earlier businesses' same-week films. A single pre-verdict batch therefore changes what a later
   business reads in the release week and the receipt sequence; that chronology change belongs to the Wave 2 charter
   with measured controls, not to Wave 1.
3. **P07 boundary.** `computeBoxOffice` (`src/core/reception.ts:596-706`) fixes `competitionFactor = 1.0` (`:678`) and
   multiplies it into the opening (`:697-703`), so it scales the total and leaves legs untouched. `setNoveltyFactor`
   beside it already shows the house form of a bounded optional multiplier defaulting to exactly 1 (a byte-identical
   absent path). `resolveReception` and `forecast.ts:467` share `computeBoxOffice`.
4. **Market state.** `MarketState.competingSlate` (`types.ts:293`) holds untyped numeric pressure rows and is always
   empty; it cannot carry the studio/genre/week/lane identity the law needs.
5. **Theatrical runs.** `economy.ts:53` fixes each run's weekly schedule at release; pressure must act before the
   result is frozen and never rescale an existing run.
6. **Phase identity.** No `phasePrecision` or phase catalogue exists in source. RECONCILIATION-02 finding 3 and the
   ordering inventory scope phase identity to the slice (domain-local), not a repository-wide prerequisite; Wave 2
   defines it with the batch.
7. **Genres.** Six (`types.ts:9`); the authored rival anchors make drama and crime about 40% as busy as romance
   (P15 market-window analysis §3), a legibility fact to disclose, not to correct.

No prerequisite for pure law is absent. The Wave 2 prerequisites (the batch extraction, its chronology change, the P07
seam, persistence and phase identity) are named above and stay out of Wave 1.

## 3. Wave 1 law (definition `p15a1-market-v1`)

All pure: `(inputs) => outputs`, no RNG, no `GameState` mutation, no save, Bridge or UI code.

- **Eligibility.** A release is eligible when it is an authoritative release (a batch member supplied by the caller)
  with a genre in the six-genre catalogue. Different genre contributes nothing and yields a typed ineligibility reason.
- **Lanes** (RECONCILIATION-02 §7.1, class C). A release at week `R` weighs, at week `t`:
  window `[R, R+4)`: 1.00, 0.55, 0.55, 0.20 by offset; stock `[R+4, R+26)`: `0.20 · 2^(−(t−(R+4))/13)`; retired at
  `t ≥ R+26`. Exactly one lane per week; the hand-off is continuous (0.20 at `R+4`, about 0.065 at `R+25`).
- **Contribution.** `c = 1` per eligible release in v1. Reach scaling waits for a lawful public pre-verdict reach fact
  (P15 open question 2); the scaling seam is one named function returning 1 in v1.
- **Batch and self-exclusion.** A batch is `{week W, members[]}`; each member is `{releaseId, studioId, genre}`. The
  pre-batch state is the set of exposures from releases before `W`. For subject `s` of genre `g`:
  - window term: for each studio `k`, `Wk = Σ` window weights of `k`'s active genre-`g` exposures `+ Σ 1.00` for `k`'s
    other genre-`g` batch members (excluding `s`); clamped `min(Wk, 1.0)` per (studio, genre) — one studio cannot flood
    a window;
  - stock term: `Σ` stock weights of all genre-`g` exposures (unclamped: saturation counts volume);
  - `P = Σk min(Wk, 1.0) + stock`.
- **Factor.** `f(P) = 1 − 0.25 · (1 − e^(−P/2))`: monotone, bounded in `(0.75, 1]`, `f(0) = 1` exactly; about 0.90 for
  one same-window competitor, 0.84 for two, 0.78 for four. Constants `FACTOR_MAX_PENALTY 0.25`, `PRESSURE_SCALE 2`
  live in `TUNING` as named hypotheses.
- **Assessment.** Per subject: `{subject, week, definitionVersion, pressure, factor, windowTerm, stockTerm,
  inputDigest, reasons}`; reasons are typed codes with source release ids and values, at most five:
  `SAME_WEEK_RELEASES`, `WINDOW_RELEASES`, `GENRE_SATURATION`, `STUDIO_CLAMPED`, `NO_PRESSURE`.
- **Order and symmetry.** Members are canonicalized by `(week, releaseId)` before any arithmetic; no studio flag,
  owner or enumeration order enters the formula. Swapping two studios' ids or two films' ids swaps the normalized
  outputs exactly.
- **Exposure reducer.** After a batch, each member becomes an exposure `{releaseId, studioId, genre, releaseWeek W}`;
  the reducer drops exposures at `t ≥ R+26` and reports lane transitions. Nothing activates before the whole batch is
  assessed.

## 4. Wave 1 tests (RED first, test-author; annex K.1 pure subset and L.3)

`market-one-player-one-rival`, `market-owner-swap`, `market-id-swap`, `market-order-reversal`,
`market-same-week-batch` (both see one pre-batch snapshot plus each other, neither early), `market-different-genre`,
`market-decay-boundaries` (R+3/R+4 and R+25/R+26 exactly, no double count, one lane per week), the factor's bounds and
`f(0) = 1` exactly, the per-studio clamp, reasons capped at five, and `market-large-batch-linear-storage` in pure form
(512 same-week releases, 64 studios, dense overlap: assessment size independent of batch size, no co-batch list per
assessment). A pure 6,240-week harness drives a normal stream (nine rivals at about two releases a year plus the
player) and the hostile stream (64 studios, a 512-release batch, 4,000 active exposures) and asserts bounded active
set, O(active + due) work per week and determinism across two runs. Integration fixtures (P07 seam, save/replay, old
save, cancel/delay previews, disclosure) are Wave 2.

## 5. Order

Independent review (1323-B), parent adoption (1323-F), RED staging (test-author), parent dry run and review, recorded
RED on unchanged production, parent production (`src/core/sharedMarket.ts` plus the two `TUNING` constants and one
index export), GREEN, implementation review, harness record. Then the Wave 2 charter: the batch extraction and its
enumerated chronology change with before/after controls, the P07 input defaulting to exactly 1, persistence (a new
root and save version allocated from the then-current version), domain-local phase identity, cold start.
