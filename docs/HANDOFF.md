# Project: Studio — Engineering Handoff

> ## 📚 Lessons — read before, update after
>
> Before starting a substantial milestone, integration, audit, or meaningful bug fix, **read the
> relevant entries in [`docs/LESSONS-LEARNED.md`](LESSONS-LEARNED.md)**; before closing substantial
> work, **update it**. The **D1-A Studio Identity Package** is closed in
> [`docs/art/D1-A-CLOSURE.md`](art/D1-A-CLOSURE.md) — merged and validated, tag
> `d1a-studio-identity-package`; Concept A remains **default OFF** (ordinary-player enablement is a
> separate owner decision).
>
> **D-15 Studio Run Recap and Capital Position Explainability** is merged and **closed** —
> [`docs/D-15-studio-run-recap-closure.md`](D-15-studio-run-recap-closure.md), tag `d15-studio-run-recap`.
> A pure read-only `studioRunRecap(state)` explainer: no new persistence, no SaveFileV5 change, no economy
> retuning, and **no financing/debt/recovery mechanic**. Affordability is authoritative and action-parity
> tested (bare-minimum greenlight vs standard-budget vs recent-typical). Concept A stays **default OFF**;
> **D1-B unstarted**; **Asset Lab 05H** separate. **Economy and recovery balance remain a separate owner
> decision** — D-15 only explains the current rules.

> ## ⏱ 2026-07-26 — Phase 5.2A **cycle 2** correction (D-11.A) — latest
>
> On top of the cycle-1 milestone (`0f9d23d`), a cycle-2 correction addressed the first
> playtest's findings (see ruling **D-11.A** in `docs/rev4-open-questions.md`):
> - **Merge-blocker 1 — missing character creator: RESTORED.** The Talent Creator is
>   reachable during founding ("Create Custom Applicant"), from the Hiring Market, and the
>   Dashboard; a created talent is NOT auto-employed (founding → applicant pool; ops →
>   free agent) and must be signed. A new **Full Custom** creator mode edits all 24 skills
>   + Star Power + Work Ethic + ceilings + temperament + genre experience directly (OVR is
>   derived, never an input; Fit is never stored); Balanced mode is preserved.
> - **Merge-blocker 2 — duplicated autopsy casts: FIXED at the root.** `productionId` was
>   `prod-<startTick>`, which COLLIDED when two films were greenlit the same week
>   (concurrency 2). Now ids are unique (`-k` suffix on collision; base unchanged → M0A
>   byte-identical), and each released film carries an **immutable participant record**
>   (writer/director/cast/craft with greenlight OVR/Fit/EP + freelancer flag) frozen at
>   greenlight — the autopsy renders from the film's OWN record, immune to later talent
>   changes and surviving save/reload (post-reload shows the archived **FilmRecord**).
> - **Owner corrections:** Star Power → whole number (round), age → completed whole years
>   (floor) via centralized formatters (display-only; sim keeps full precision). Founding
>   actor minimum **5 → 3**. Participants are an **additive optional field on V3 — no V4**.
> - **Validation:** 664 tests (42 files); root+UI TS clean; build clean; all 4 Playwright
>   specs pass (incl. new two-film-autopsy regression + the owner's 21-step playtest;
>   16+ screenshots in `ui/screenshots/`). Adversarial review = SOUND; contract audit =
>   CLEAN. Cycle-2 commit sits above `0f9d23d`; still NOT merged (owner playtest).
>
> ## ⏱ 2026-07-26 — Phase 5.2A (D-11 Studio Employment) resumption banner
>
> **Branch state now (supersedes the stale §2 below):**
> - `main` = `eb9dd43` — the **Phase 5.1 merge** ("Merge Phase 5.1 talent foundation and
>   legible film assembly"; contains `f267cd9` + `3ac66bb`). Phase 5.1 IS merged.
> - `phase-5.2-studio-roster` = the **Phase 5.2A milestone** (D-11 studio employment,
>   contracts, payroll, roster, freelancer market). Implemented, tested, reviewed,
>   audited. **NOT merged** — returned for owner playtest.
> - `studio-lot-spike` (separate worktree) — untouched (`3806ef65`).
>
> **What Phase 5.2A added** (ruling **D-11** in `docs/rev4-open-questions.md`): a founding
> draft; studio contracts (1–4 yr, weekly payroll, signing bonus, renewal, early release
> with a termination cost); a deterministic rotating hiring + freelancer market; roster-
> gated film assembly (Your Studio + Available Freelancers; a required Production/Craft
> Lead); a financial **ledger** that reconciles with cash; **SaveFileV3** (V2 frozen,
> deterministic V2→V3 / V1→V3 import); and the three new UI screens (Founding, Studio
> Roster, Hiring Market) plus a Dashboard Payroll & Runway summary.
>
> **The compatibility gate (D-11.0):** employment is *engaged* only when
> `founding !== null || contracts.length > 0`. `generateWorld` stays employment-free, so
> the **protected M0A corpus and D-6 economics are byte-identical** and `standing.ts` is
> untouched. `beginFounding(generateWorld(seed))` opens the player game.
>
> **Validation at this milestone:** 634 tests pass (40 files); root+UI TypeScript clean;
> Vite build clean; both Playwright specs pass (20 screenshots); adversarial review =
> SOUND-WITH-CAVEATS (the one finding — the ledger reconciliation was `===` on floats —
> was resolved to a sub-cent tolerance); contract audit = CLEAN (two minor UI shortfalls
> closed: HiringMarket now sorts by all 7 D-11.19 keys; Dashboard shows committed signing
> bonuses).
>
> **DISCLOSED ECONOMY FINDING (not a 5.2A regression):** the dedicated balance study
> (`src/harness/run-roster-balance-study.ts`, out/roster-balance/) shows the roster
> MECHANICS create real decisions (star rosters burn more; freelancers aren't always used;
> a craft-depth-vs-concurrency tradeoff; firing everyone makes the fewest films) — but two
> desired properties FAIL: *payroll doesn't create downside pressure* and *the best
> strategy IS the highest-OVR one*. Both trace to the **disclosed limitation "Studio
> Revenue = full box-office"** (no distributor/exhibitor economics yet) — films are so
> profitable that payroll never bites. **The fix is the deferred distribution economics
> (D-11.18 records it); it is out of scope for this milestone (owner: do not redesign
> revenue).**
>
> **Future hooks recorded (D-11.20):** rival competing-offers (D-11.7), distribution
> economics (D-11.18), and **Phase 5.2B = persistent scripts & writers' rooms** (the next
> milestone after employment is proven). **Explicitly deferred / DO NOT build:** rival
> studios, competing offers, screenplay development, writers' rooms, auto-time, morale,
> agents, buyouts, loan-outs, distribution economics, studio-lot integration.

Last updated: 2026-07-26, after the **Phase 5.1 talent milestone** (uncommitted in the
working tree; see §2c). M0A is PASS (D-6); the D-9 multi-discipline talent system plus
the three 2026-07-26 owner rulings (D-10 A/B/C) and the M16.7 closure are implemented,
tested, reviewed, and audited. **Phase 6 is NOT started** and needs explicit owner
authorization. Written for a successor session with zero knowledge of prior
conversations. Read this after `CLAUDE.md`, `docs/build-contract.md` (rev. 4),
`docs/rev4-open-questions.md` (incl. rulings **D-6**, **D-9**, **D-10**, **D-11**), `M0A-REPORT.md`,
and `PLAYTEST.md`, in that order.

---

## 1. Executive Summary

**What this is.** A studio-management simulation (spiritual successor to *The
Movies*, 2005; private project, audience of two). The current milestone, **M0A**, is
a headless proving harness: one pure engine exercised over ≥1,000 seeded single-year
runs by two scripted agents, producing an instrumentation report that answers "do the
film-assembly maths produce real decisions, or is one strategy dominant?" M0A gates
M1A (a thin UI over the identical ruleset). No UI exists or may exist yet.

**Status.** All four M0A phases plus the owner-authorized **M0A.1 repair** are
complete, committed, and audited. Phase 4 delivered the §8 broadcast core, the §14
harness + eight flags over 1,000 seeds × 2 agents, the §15 tests, and
`M0A-REPORT.md` — and BLOCKED on the D-2 standing-differentiation gate. The owner
then chose Option 1 (revise §6, not relax the gate), recorded as **ruling D-6**, and
M0A.1 implemented it. **M0A verdict is now PASS:** the D-2 gate passes (profiles A/B/C
= 6.75% / 6.95% / 24.1%, ≥3 of 4 ≥5%), the awareness↔confidence correlation dropped
from 0.99 to ≤0.35 (M6 now PASS), and all 8 flags pass with no regression (the §14
harness is byte-identical; only §6 changed). D-6 drove each reputation channel from a
distinct absolute cause — awareness←reach, prestige←critics, confidence←ROI. **The
"approved for phase 5" hard stop STILL stands:** no UI/Phase-5 work has begun and none
may until the owner says those exact words. Two items remain the owner's (not blocking
M0A): the broadcast surprise-model (§3a) and, optionally, a confidence-baseline term
to make profile D reachable (§3a).

**Architecture in one paragraph.** A pure TypeScript simulation core
(`(state, actions) => state`, no React/DOM/async/IO) under `src/core/`, governed by
a written contract that is implemented *verbatim* — formulas, constants, clamps, and
names are transcribed, not designed. All randomness flows from a seeded, serializable
RNG with four isolated streams. Tests are written by a separate role that derives
expectations from the contract text only, never from the implementation, and every
phase ends with exactly one read-only clause-by-clause audit hunting for invented
behavior.

**Confidence.** High for the audited surface. **309 tests green** (Phase-4 was 320;
the D-6 rewrite replaced 28 old §6 unit tests with 17 D-6 behavioral/cause-isolation
tests), `tsc --noEmit` clean, five phase/repair audits (all CLEAN or CLEAN WITH
NOTES, zero value/behavior findings) plus two focused adversarial reviews (Phase-4:
study TRUSTWORTHY; M0A.1: D-6 SOUND, pass HONEST). The corpus is byte-reproducible
and the D-6 pass is robust (split-corpus both halves 3/4). `technical` pinned at 40
(D-4), re-validation deferred to M1A. **M0A now PASSES.**

---

## 2. Current Repository State

- **HEAD:** `f6ecfa7` on `main` (the Phase 5 / M1A commit). No remote. **The working
  tree is NOT clean:** it carries the **uncommitted Phase 5.1 talent milestone** (D-9 +
  D-10, complete, tested, reviewed, audited — see §2c), awaiting the owner's single
  commit. Only that milestone's `src/**`, `ui/**`, `tests/**`, and doc edits are present;
  no other change.
- **History:** `13f51d9` baseline docs → `86755ea` contract rev. 4 → `b1f492b` agent
  team → `444ed08` Phase 1 → `3c64959` Phase 2 → `56d5eef` handoff → `ac55902` Phase 3
  → Phase 4 (this commit).
- **Directories:**
  - `docs/` — `build-contract.md` (rev. 4 = unchanged rev. 3 body + header pointing
    at the resolutions), `rev4-open-questions.md` (**normative**; wins on conflict),
    this file.
  - `src/core/` — the pure engine. Phase 1–2: `types.ts`, `vector.ts`, `math.ts`,
    `tuning.ts`, `shape.ts`, `grid.ts`, `rng.ts`, `save.ts`, `reception.ts`,
    `forecast.ts`. Phase 3 added: `worldgen.ts` (§9), `data/wordlists.ts`,
    `actions.ts` (§3), `tick.ts` (§3), `standing.ts` (§6), `candidates.ts` +
    `agents.ts` (§13). Phase 4 added `broadcast.ts` (§8) and filled `tick.ts` step 5.
    `index.ts` is the only public import surface. **Purity note:** everything under
    `src/core/` stays pure/sync/no-IO.
  - `src/harness/` — Phase-4 **instrumentation layer** (INSIDE `src/` so the hygiene
    scan covers it, OUTSIDE `src/core/` so it may do file I/O): `run-driver.ts`,
    `measure.ts`, `aggregate.ts`, `run-corpus.ts`. Run: `npx tsc && node
    dist/src/harness/run-corpus.js`. Writes `out/m0a/` (gitignored). Never imports
    into `src/core/`; interacts with the sim only through `../core/index.js`.
  - `M0A-REPORT.md` (repo root) — the milestone deliverable (owner-facing).
  - `tests/` — 18 test files (Phase 4 added `broadcast`, `acceptance-corpus`) +
    `_fixtures.ts`. **320 tests** total.
  - `.gitignore` now also ignores `out/` (raw corpus evidence — reproducible from
    seeds, not committed).
  - `.claude/agents/` — four team-agent definitions (sim-core, test-author,
    instrumentation, contract-auditor), all `model: opus`. **Registry caveat:** they
    load only if the session's workspace root is this folder; a session rooted
    elsewhere must dispatch built-in agents explicitly pinned to Opus with the role
    file contents inlined (owner-approved fallback).
- **Deliberately untracked (gitignored, at repo root):** `design-spec.md`,
  `README.md`, `1-career-talent-market.md`, `2-historical-talent.md`,
  `3-acquisition.md`, `4-filmmaker-pitches.md`. These are **NOT FOR BUILD** design
  archive documents awaiting relocation by the owner. Never open them; never commit
  them. `.gitignore` carries a remove-when-relocated block for them.
- **Generated:** `package-lock.json` (committed). `node_modules/` local only.
  Committer identity is auto-derived (`Bruce <bruce@Mac.fritz.box>`); owner has not
  set `git config user.*`.

---

## 3. Completed Work

### Phase 1 — declarations, TUNING, seeded RNG, save validation (`444ed08`)

- **Objective:** §12 step 1. Everything the later pipelines need to exist and be
  deterministic.
- **Created:** `package.json`, `tsconfig.json` (strict), `vitest.config.ts`,
  `src/core/{types,vector,math,tuning,shape,grid,rng,save,index}.ts`, five test
  files (79 tests).
- **Systems:** all §2 types verbatim plus rev. 4 amendments (`FilmResult.conceptId`
  + `directorId` per B12; `SegmentForecast.estimate` per M7; `ForecastFactorKey`
  11-key union per B14). TUNING = §16 + eleven rev. 4 additions. §4 `SHAPE_OPTIONS`
  seed table + `specificity`. §13 grid constants. RNG (see §4 below). Save:
  `SaveFileV1`, stable sorted-key stringify, loud rejection of unknown
  `saveVersion`, envelope-seed divergence, and `broadcastCache` divergence.
- **Key decisions:** the contract's `Promise` type name is kept (shadows the TS
  global; the core is sync-only, documented); constants the contract declares
  outside §16 (`CAST_WEIGHT`, `ROLE_WEIGHT`, `SLOT_TRANSFORM`, `FORCE_VECTORS`,
  `INITIAL_STANDING`, `WORLD_CONFIG`) are named exports, not folded into TUNING.
- **Audit:** CLEAN, zero findings. One pre-audit incident: the hygiene test caught
  the literal string `Math.random` in an rng.ts *comment*; the comment was reworded.
- **Outcome:** 79/79 green, tsc clean.

### Phase 2 — reception (§5) and forecast (§7) pipelines (`3c64959`)

- **Objective:** §12 step 2, with a unit test per bounded term.
- **Modified:** `math.ts` (added `lerp`, Hermite `smoothstep`, `remap`,
  component-wise `weightedMean`, `sum`, `product`), `shape.ts` (added
  `resolveShape`), `index.ts` (exports).
- **Created:** `src/core/reception.ts`, `src/core/forecast.ts`, four test files +
  `tests/_fixtures.ts` (85 tests).
- **Systems:** full §5 pipeline as pure functions over explicit inputs, exposing
  every §5.6 intermediate in a breakdown object; `computeBoxOffice` factored out so
  forecast reuses it; `buildFilmResult` stamps `conceptId`/`directorId`. §7 forecast:
  deterministic per-segment centers (`forecastCenters`, exported for §15.6 testing),
  one film-level gaussian offset from the derived forecast stream, estimates clamped
  and stored, widths/sigmas from TUNING (B17), D-3 confidence predicates, B14
  causal/uncertainty factor rules, expected opening/total computed from the *noisy*
  estimates (B16 — this is what makes §6's commercialSurprise nonzero later).
- **Key decisions:** two transparent readings on record (see §5 below): D-3's "that
  segment" bound to `promise.intendedSegments`; the §4 budget clamp is unreachable
  by any legal shape triple.
- **Audit:** CLEAN, zero findings; the auditor explicitly verified operator
  precedence on the §5.3 originality lerp and that the critic draw is the only
  sampled term in reception.
- **Outcome:** 164/164 green, tsc clean.

### Phase 3 — worldgen, applyActions, tick/standing, candidates+agents (this commit)

- **Objective:** §12 step 3 — the pieces that turn the Phase-2 math into a running
  headless engine. Built by role-separated Opus dispatches (implementation, then
  independent contract-derived tests, then one full audit), PM-orchestrated.
- **Created:** `worldgen.ts` + `data/wordlists.ts`, `actions.ts`, `tick.ts`,
  `standing.ts`, `candidates.ts`, `agents.ts`; test files `worldgen` (25),
  `actions` (29), `tick` (9), `standing` (28), `candidates` (12), `agents` (9),
  `replay` (7) — **+119 tests (164→283)**. `rng.ts` gained an additive `'worldgen'`
  `RngPurpose`; `index.ts` gained the phase-3 exports.
- **Systems:** §9 worldgen (pure seed→GameState; talent 12/10/28/10, salaryCurve B7,
  baseNegativeCost B8, era B10, tastes from `TUNING.SEGMENT_TASTES` D-5, all
  distributions from a derived `'worldgen'` stream that never touches the sim
  stream); §3 `applyActions` (M16 validation, D-1 ledger debit, forecast snapshot at
  greenlight via the forecast stream, cancel M15, createTalent §10); §3 `tick`
  (PRODUCTION→RELEASE→RECEPTION→STANDING→BROADCAST-noop, tick++ last; reception is the
  sole sim-stream consumer, in ascending-id order; cash credit); §6 `updateStanding`
  (verbatim four deltas + caps, B12 context param); §13 `generateCandidates`
  (500-distinct sampled grid, B18/B19/B21) + `RandomAgent`/`OracleAgent` (agent stream
  vs deterministic omniscient profit argmax).
- **Settled readings recorded (see §5):** Production.id `prod-<startTick4>` (owner
  ruling #1); D-3 "that segment" = `promise.intendedSegments` (owner ruling #2, now
  settled — Phase-2's pending adjudication is closed); Oracle uses the deterministic
  noise-free pipeline (owner ruling #3); greenlight-when-`active<2` (owner ruling #4);
  candidate distinctness is index-tuple, not content (B19 reading, audit NOTE).
- **Audit:** CLEAN WITH NOTES — zero DEVIATED/INVENTED/MISSING/OUT-OF-SCOPE findings;
  one conforming provenance NOTE (the B19 index-tuple reading). Mechanical checks all
  pass; `rng.ts` change confirmed additive-only; no §11/Phase-4/UI leakage.
- **Outcome:** 283/283 green, tsc clean.

### Phase 4 — instrumentation harness, 8 flags, broadcast core, M0A report (this commit)

- **Objective:** §12 step 4 — the §14 study that answers M0A's question, the §8
  broadcast core, and `M0A-REPORT.md`. Role-separated Opus dispatches (broadcast +
  harness implementers, independent test-author, one focused adversarial reviewer,
  one full contract auditor), PM-orchestrated.
- **Created:** `src/core/broadcast.ts`; `src/harness/{run-driver,measure,aggregate,
  run-corpus}.ts`; `tests/{broadcast,acceptance-corpus}.test.ts`; `M0A-REPORT.md`.
  Modified: `tick.ts` (filled step-5 broadcast, extended the release context — steps
  1–4 unchanged), `index.ts` (broadcast exports), `.gitignore` (+`out/`). **+37 tests
  (283→320).**
- **Systems:** §8 broadcast (B22/B23/B24/M10/M14) — pure, deterministic, changes only
  `broadcastItems`; §14 harness — 1000 seeds × 2 agents, all 8 flags per exact rev.4
  defs (B25–B28, M6, M8, M10, M17, N8, N9), raw evidence to files, aggregated summary
  only to the PM; §15.1 corpus bounds + §15.2 four-quadrant (unit + corpus) + §15.7
  replay incl. broadcast copy.
- **Review:** one focused adversarial review — verdict **study TRUSTWORTHY** (corpus
  complete, byte-deterministic, RNG isolated, replay byte-identical, broadcast pure,
  D-2 FAIL independently reconfirmed). No corrections required.
- **Audit:** **CLEAN WITH NOTES** — zero DEVIATED/INVENTED/MISSING/OUT-OF-SCOPE; the
  sole note is that the D-2 hard fail is genuine and traceable to fixed §5/§6 formula
  constants outside the tuning surface (a contract-level owner matter, correctly
  caught by the instrumentation).
- **Two disclosed findings (owner decisions, not tech debt — see §9a below):**
  (1) Broadcast is inert in M0A (contract-forced magnitude≡0); (2) **D-2 BLOCKED** —
  the reputation model differentiates into ≤2 dimensions, not the 3–4 the gate needs.
- **Tuning:** 2 documented iterations (prestige-lift via COHESION_CAP/SMOOTH_LO/
  ORIGINALITY), both FAIL (max aggressive gets prestige≥60 to only 0.75%, still <5%);
  **all reverted to contract defaults** — the true levers are §5/§6 formula constants
  outside TUNING.
- **Outcome:** 320/320 green, tsc clean, corpus byte-reproducible. M0A verdict BLOCKED.

---

## 2b. Phase 5 / M1A — the playable UI (this commit)

- **Status:** PLAYABLE. A thin browser UI over the M0A-frozen engine, delivering the
  full film loop: new-game/seed → studio dashboard → assemble (concept → shape →
  promise → writer/director/cast → budget → forecast → greenlight) → advance weeks →
  release result → autopsy → talent creator → save export/import → restart.
- **Stack:** React + TypeScript + Vite + Vitest + React Testing Library + Playwright,
  plain CSS. Single-package repo (deps in root `package.json`; UI under `ui/`). No
  backend/DB/auth/LLM/state-framework.
- **Structure:** `ui/src/engine/adapter.ts` is the ONLY module importing the core, and
  ONLY via the public `src/core/index.ts` — no component reaches into `src/core`, no
  simulation formula is duplicated. `ui/src/screens/*` (Start/Dashboard/Assembly/
  ReleaseResult/Autopsy/TalentCreator/Saves), `ui/src/components/*` (ConceptCard,
  ForecastDisplay, TalentPicker, common), `App.tsx` (root state + routing).
- **Engine boundary discipline:** UI calls `generateWorld`/`applyActions`/`tick`/
  `computeForecast`/`resolveReception`/`makeSave`/`loadSave`; never mutates GameState
  outside engine actions; no `Math.random` in the UI. **The core, harness, and tests
  are byte-untouched since `279e58e`** (verified by the audit and adversarial review).
- **Information integrity:** the player sees `perceived` talent (never `actual`), the
  stored `forecastSnapshot` for active/released films (never a post-greenlight
  recompute), and no Oracle/realized info pre-release — all mutation-grade tested.
- **Autopsy:** reconstructs the full §5 breakdown by calling the public
  `resolveReception` on inputs rebuilt from a UI-only pre-tick snapshot, using the
  stored `FilmResult` for the two sampled fields (criticScore/reviewVariance — the
  random term is shown, never hidden). Films present only in an imported prior-session
  save show a plain "no full autopsy" message rather than a fabricated one.
- **Restricted-mode capability (owner-authorized, Phase-5 directive):** `ConceptCard`
  and `ForecastDisplay` accept `mode='normal'|'restricted'`; restricted genuinely hides
  precise values (qualitative bands). Adds NO filmmaker-pitch mechanic and NO GameState
  field; NOT wired into the normal game (normal play uses `mode='normal'`). This
  supports a future deferred system cheaply without building it.
- **Tests:** **383 total** (309 core, unchanged; **74 UI** — engine-boundary,
  information-integrity, assembly-legality, simulation, autopsy-fidelity, talent-creator,
  saves, determinism, hygiene). `tsc --noEmit` clean; `vite build` succeeds; Playwright
  full-loop browser smoke PASSES.
- **Adversarial review:** PLAYABLE + CONTRACT-FAITHFUL, 16/17 categories clean; the one
  LOW finding (restricted mode "looks like §11 scaffolding") is a false positive — the
  owner's Phase-5 directive explicitly required it; disposition: keep as authorized.
- **Contract audit:** **CLEAN** — 12/12 items CONFORM, zero DEVIATED/INVENTED/MISSING/
  OUT-OF-SCOPE.
- **Screenshots:** `ui/screenshots/1-start-new-game.png` … `7-talent-creator.png`
  (git-ignored, regenerate via the Playwright screenshot run on seed
  `e2e-browser-smoke`). **Playtest guide:** `PLAYTEST.md` (repo root).
- **Known limits:** Broadcast/headlines deferred (Phase 6); craft hires simplified
  (D-4 `technical`=40); desktop-first (no mobile/accessibility program); the rare
  prestige/awareness identities are uncommon by design (M0A-REPORT).
- **Phase 6 boundary (HARD STOP):** NOT started. Do not build Broadcast presentation,
  the prediction→result→revision cycle, filmmaker pitches, or any deferred system until
  the owner explicitly authorizes Phase 6. This commit does not imply that authorization.

## 2c. Phase 5.1 — the multi-discipline talent milestone (this working tree, uncommitted)

- **Status:** COMPLETE, tested, reviewed, and audited; **awaiting the owner's single
  commit**. Built the owner-authorized Phase 5.1 talent milestone: the D-9 ruling
  (`docs/rev4-open-questions.md`), owner-ratified 2026-07-26, plus the three 2026-07-26
  owner rulings recorded as **D-10 A/B/C** and the **M16.7** closure.
- **What was built:**
  - **Multi-discipline talent** — every person carries all four disciplines
    (acting/writing/directing/craft), each with six perceived/actual professional skills,
    replacing the scalar `talent.skill`.
  - **Four role OVRs** (Actor/Writer/Director/Craft OVR, 1–99, read-only display summaries
    computed from perceived skills; the sim never reads OVR) with the owner's 99/95 gates.
  - **`effectiveSkill` substitution** — the four §5 `.skill` reads now call
    `effectiveSkill(...)` (project-weighted by genre/shape/promise/slot), preserving the
    D-9.0 `[0,100]` invariant; reception reads `actual`, forecast reads `perceived`.
  - **Fit, Expected Performance, Creative Temperament** (persona-derived), **Potential**
    (hidden ceilings + a noised visible estimate that never exposes the truth), **Work
    Ethic** (affects development only, nothing on release day), and **genre experience**
    (small, capped effective-skill bonus — experience is not skill).
  - **Development-in-play** (D-10.A) — a new deterministic `tick` step on completed
    releases, from its own `'develop'` stream; per-release **development summaries** in
    the UI.
  - **SaveFileV2 + legacy import** — D-9 games save as `SaveFileV2` (`saveVersion: 2`);
    `SaveFileV1` stays immutable/readable; `convertV1ToV2` / `importLegacyV1` do a
    non-mutating, idempotent, replay-exact V1→V2 conversion.
  - **Talent Hub + redesigned Talent Creator** UI (staged flow, creation budget, no free
    superstar), **multi-hyphenate generation** (D-10.B), **FilmShape threading** through
    one shared helper (D-10.C), and the **M16.7** greenlight closure.
- **New public interface highlights** (`src/core/index.ts`): `SaveFileV2` / `SaveFile` /
  `convertV1ToV2` / `importLegacyV1`; the read-only `talentSummary` surface (`roleOVR`,
  `roleTier`, `projectFit`, `expectedPerformance`, `temperamentSummary`,
  `expectedPotentialTier/Range`, `workEthicLabel`, `developmentReport`,
  career-identity/Capable-but-Unproven); `development` step; the D-9/D-10 `TUNING`
  constants. None of the summary surface is read by §5/§7.
- **Verdicts:** **Adversarial review = SOUND-WITH-CAVEATS** (3 LOW: uncommitted work has
  no committed baseline; a non-acting-primary stream-position note; one cosmetic wording
  item). **Contract audit = CLEAN WITH NOTES** (the stale D-9.15/header prose and leaked
  chatter — now fixed in this doc pass; the ≥70/≥80 multi-hyphenate tiers are measured by
  corpus study, not unit-asserted).
- **Settled readings (new law):**
  - **SaveFileV2 overrides D-9.15's "NO SaveFileV2"** — the envelope was never frozen
    against a successor; V1 stays readable, V2 is the D-9 format (see D-9.15 as amended
    by D-10 in `rev4-open-questions.md`).
  - **Migration asserts skill-mean, not OVR** — the V1→V2 conversion centers migrated
    primary skills on the old scalar (so ability stays comparable); it does not target a
    specific migrated OVR.
  - **Development-in-play applies once only** — idempotent across export/import/V1→V2/
    replay/reload.
  - **OQ-2 stays dormant** — genre-experience → forecast confidence remains gated behind
    `CONF_EXP_THRESHOLD` (off); D-3's approved confidence corpus is untouched.
- **Verified metrics (this working tree):**
  - **547 tests pass** (439 core / 108 ui); **root + ui `tsc` clean**; **`vite build` OK**;
    **Playwright smoke passes**; screenshots `ui/screenshots/1-10`.
  - **Official M0A corpus (development OFF, role-partitioned): all 8 flags PASS, D-6
    unchanged** (`standing.ts` byte-untouched). D-2 = prestigeHigh 6.7% / awarenessHigh
    6.05% / confidenceHigh 22.9% / profile-D 0% (3/4). M6 max |r| 0.34. M8 high 83.4% /
    med 72.8% / low 62.6%. M17 random median 0.786. (See `M0A-REPORT.md`.)
  - **Shape study:** budget-neutral (aggregate talent contribution 321.18 vs 321.28 across
    36 shapes); flips the Oracle's pick on 50.3% of seeds; max shape-driven contribution
    change 8.6 pts.
  - **Multi-hyphenate study (15k talent):** 11.0% with a non-primary OVR ≥ 60; ≥ 2 usable
    1.0%; primary OVR mean 43.7 vs secondary 10.8; strongest pairing writing→directing
    6.7%; Capable-but-Unproven 32.2%; no elite inflation (primary ≥ 90 1.0%, ≥ 95 0.03%,
    == 99 0).
  - **Development-ON study (supplementary):** avg gain 1.185 pts/completed film; largest
    one-film OVR jump +5; WE-tier monotone (Poor 0.44 → Relentless 2.86); age monotone
    with no decline (young 1.77 → senior 0.23); Ability⊥WE and Potential⊥WE ≈ 0.01.
- **Milestone status:** **COMPLETE and awaiting the owner's single commit.** The Phase 6
  hard stop below still stands — no Broadcast/presentation work has begun and none may
  until the owner authorizes Phase 6.

## 2d. Phase 5.1 cycle-3 — assembly legibility (review-branch correction)

- **Status:** on `phase-5.1-talent`, **NOT merged, awaiting another owner playtest.** An
  owner playtest found film assembly **opaque** — the player could not read what a package
  actually was or why the forecast said what it said. Cycle 3 made assembly legible. It is
  presentation-only: the sim never reads any of the new surfaces, and no D-3, D-6
  (`standing.ts`), reception/forecast formula, or save-schema byte changed.
- **What cycle 3 shipped:**
  - **A persistent Film Package summary** (in assembly + greenlight review) with **four
    separate dimensions**, each from real engine values, never a hidden master score:
    - **Creative Cohesion** — talent-**independent** creative-brief coherence (shape /
      promise / audience), reusing the §5.4 expression/segment-taste metric.
    - **Talent Fit** — per-assignment (writer / director / each cast slot / crew) plus
      overall, weakest-link, severe-mismatch, and unfilled, reusing
      `projectFit` / `expectedPerformance`.
    - **Execution Confidence** — perceived-only: EP band widths + D-3 confidence tier +
      budget adequacy + unproven cross-discipline. **No D-3 change, no Work Ethic.**
    - **Commercial Outlook** — studio-revenue/profit ranges + break-even + confidence +
      upside/downside, via `computeBoxOffice` on the forecast bands.
  - **Redesigned candidate cards** — per-assignment Fit / Expected-Performance / Star Power /
    salary / genre-experience / strengths / weakness / cross-role, expandable; default-sorted
    by assignment Fit; **all 10 filters** (strengths, Fit-tier, OVR, salary, Star Power,
    genre-exp, proven/unproven, specialists, multi-hyphenates, availability).
  - **Change-preview on swap** — real `packageDelta` deltas only.
  - **Film Readiness panel** — strong / risky / judgment derived from the real dimensions;
    no secret master score.
  - **Post-release Autopsy compare** — the **LOCKED** greenlight assessment vs the actual
    result, and which risks materialized.
  - **Crew/Craft is now assignable in the assembly UI** (the concrete playtest blocker). The
    engine already accepted craft; the fix was **UI-only** (add a craft slot; stop hardcoding
    `craftIds:[]`). **The M0A corpus is unaffected** — role-partitioned, `craftIds:[]`.
- **New pure engine helpers** (`src/core/filmPackage.ts`) — read-only summaries the sim never
  reads: `creativeCohesion`, `packageFit`, `executionConfidence`, `forecastProfitRange`,
  `greenlightAssessment`, `risksMaterialized`, `packageDelta`. Additive `forecast.ts` (exported
  `DeterministicCore` type + surfaced `budgetAdequacy`). No change to D-3, D-6/`standing.ts`,
  the reception/forecast formulas, or the save schema (all byte-unchanged).
- **Two disclosed limitations (honest, not fabricated):**
  1. The engine's cohesion is **talent-persona alignment**, so the summary's **Creative
     Cohesion** is the talent-**independent** creative-brief coherence, shown separately (it
     does not claim to be the engine's cohesion term).
  2. There is **no distributor/rental split** in the D-1 model — the studio receives the
     **full box-office total**, so **"Studio Revenue" = full gross** (disclosed in the UI).
- **Verification:** **591 tests pass** (incl. a 27-test truthfulness suite + a 12-step
  Playwright browser playtest); **root + UI `tsc` clean**; **`vite build` succeeds**;
  **Playwright green.** Adversarial review = **SOUND**; contract audit = **CLEAN WITH NOTES**
  (the one flagged deviation — an incomplete filter set — is **closed**; all 10 filters now
  ship).
- **Milestone status:** on `phase-5.1-talent`, **NOT merged, awaiting another owner
  playtest.** The Phase 6 hard stop below still stands.

## 3a. M0A verdict & the decisions still owed to the owner

**Verdict: PASS** (after the D-6 repair). The reputation-differentiation gate now
passes and all 8 flags are healthy. One decision is now RESOLVED and two remain the
owner's; a successor session must NOT resolve the remaining two autonomously:

0. **RESOLVED — Reputation model (was the BLOCKED gate).** The owner chose Option 1
   (revise §6, do not relax the gate), recorded as **ruling D-6** in
   `rev4-open-questions.md`. M0A.1 redefined the three channels by meaning and drove
   each from a distinct absolute cause — awareness←reach (box office / market) + star,
   prestige←criticScore vs a reachable benchmark (45, not the old 60), confidence←ROI −
   budget discipline. The prior shared `commercialSurprise` term is deleted. Result:
   D-2 passes (A/B/C = 6.75/6.95/24.1%), awareness↔confidence correlation 0.99→≤0.35.
   Only §6 (`standing.ts`) + the ephemeral release context (`tick.ts`) + `TUNING`
   changed; the save schema and all other surfaces are untouched.
1. **Profile D (optional, still 0%).** D-2 passes on 3 of 4; profile D (confidence-low
   & awareness-high) stays ~0% because D-1's economy is almost always profitable
   (~1.6% of releases lose money) so confidence rarely falls low. Making D reachable
   would require redefining confidence as return *above an expected baseline* — a
   further product decision beyond D-6, routed to the owner rather than tuned around.
   Not adopted. Only pursue on an explicit owner ruling.
2. **Broadcast surprise model (future, before full broadcast presentation).** Broadcast
   is inert in M0A because the contracted surprise input (realized − noise-free
   forecast center) is identically 0 (audience appeal has no variance). Before full
   broadcast is built, the owner must decide whether later gameplay should (1)
   introduce genuine outcome variance, (2) define surprise relative to the studio's
   published noisy forecast, or (3) use another explicitly designed source of
   unexpected outcomes. **Do not choose among these now. Adding a human player alone
   does NOT fix it — a later mechanic or contract ruling is required.**

---

## 4. Current Architecture

**Contract-first.** The build contract is the design document; the code is its
transcription. The engineering stance that follows: when the contract is silent,
ambiguous, or contradictory, **stop and report** — never fill the gap with a
reasonable guess. Every ambiguity found so far has been resolved through the
rev. 4 process (56 items, owner-decided where it mattered) and recorded in
`rev4-open-questions.md`. That document is law; consult it before asking "what did
they mean by X."

**Purity boundary.** Everything under `src/core/` is pure and synchronous. The
harness (phase 3+) sits above it, owns IO/iteration, and interacts only through
exported functions and state values. This is what lets the same engine run headless
(M0A) and under a UI (M1A) with byte-identical behavior — §15.7's replay test
depends on it.

**Simulation pipeline (when phase 3 lands).** Each iteration:
`applyActions(state, agent.chooseActions(state))` then `tick(state)`; the tick runs
a fixed five-step order — PRODUCTION → RELEASE → RECEPTION (§5) → STANDING (§6) →
BROADCAST (§8, phase 4). Phase 2 built the §5/§7 math the pipeline will call; it
deliberately did not build the pipeline itself.

**RNG design (the most load-bearing subsystem).** `src/core/rng.ts`:
- Algorithm: sfc32 seeded via FNV-1a string hash + splitmix32 finalizer. The
  algorithm choice is contract-silent implementation freedom; tests assert
  properties (determinism, isolation, bounds), never specific bit-sequences.
- The **sim stream** is stateful and threaded through `GameState.rngState` as a
  serializable string. It carries **only reception-time sampling** — currently the
  single §5.3 critic draw. Nothing else may consume it.
- Three **derived stateless streams** — `stream(seed, purpose, key)` for
  `'candidates' | 'agent' | 'forecast'` — are recomputed on demand from the run
  seed, never saved. Forecast noise keys by `productionId`. This isolation is what
  makes §15.6 (forecast independence) hold behaviorally: consuming the sim stream
  cannot move a forecast, and forecasting cannot move the sim stream.
- `gaussian` (Box–Muller) deliberately **discards the spare deviate** — every call
  consumes exactly two uniforms, so stream advancement is fixed regardless of call
  ordering. Do not "optimize" this; replay exactness depends on it.
- `truncatedNormal` is rejection sampling, **not** clamping (settled: the contract's
  own clamp idiom on the adjacent §9 line is the deliberate contrast).

**Save model.** `SaveFileV1 { saveVersion: 1, seed, state, broadcastCache }`.
`stableStringify` (recursive key sort) gives deterministic serialization for §15.7
byte-identity. Loading loudly rejects unknown versions, `seed ≠ state.seed`, and
`broadcastCache ≠ state.broadcastItems` (M14: the duplication is kept as declared
but divergence is impossible rather than ambiguous). No migration functions, by
contract.

**Public interface.** `src/core/index.ts` is the only sanctioned import path —
the test-author role is permitted to read exactly that file and nothing else in
`src/core/`. Key exports: the §2 types, `TUNING` + named constant tables,
vector/math helpers, `specificity`, `resolveShape`, the reception surface
(craft/cohesion/critic/segment/box-office computations, full-pipeline entry,
`buildFilmResult`), the forecast surface (`computeForecast`, `forecastCenters`,
`bandOf`), RNG (`RngStream`, `stream`), and the save API.

---

## 5. Contract Decisions — settled law

**The master record is `docs/rev4-open-questions.md`** (56 items: B1–B28 blocking,
M1–M17 major, N1–N11 minor; owner decisions D-1–D-5 recorded inline with rulings
dated 2026-07-25). Do not reopen any of it. The ones a phase-3/4 engineer will hit
first:

- **Precedence:** the rev. 3 body is unchanged; where it conflicts with the
  resolutions, the resolutions win. Live example: §7's body still prints
  `CONFIDENCE_INTERVAL_WIDTH {8,15,24}`; the binding values are TUNING's `{7,11,14}`
  (B17), which also added a medium calibration band of 65–75%.
- **D-1 money:** film ledger, not an economy. `INITIAL_CASH` 20M; greenlight debits
  negative + marketing + Σ salaries; release credits `boxOffice.total`; cash may go
  negative with no consequence. `profit = total − negative − marketing − salaries`.
  Oracle EV = expected profit in currency; the §14 dominance margin is in **ROI
  percentage points**; packages costing under `ROI_COST_FLOOR` (500k) are excluded
  from ROI statistics only.
- **D-2 standing gate (the only hard fail):** end-of-run evaluation; high = ≥ 60,
  low = ≤ 40; a profile counts if it occurs in ≥ 5% of runs pooled across both
  agents; fail if fewer than 3 of 4 profiles reach that. Reachability was verified
  against the time model (10 releases/run); prestige is the binding channel (its +7
  delta cap needs criticScore 116, so practical max is +5/release). If a profile
  lands under 5% for arithmetic rather than design reasons, that goes **to the
  owner** — it is explicitly not tunable-around.
- **D-3 forecast confidence (hybrid):** `knownLeadTrackRecord` = lead.fame ≥ 60;
  `knownDirectorGenreRecord` = a prior this-run release by that director in that
  genre; `establishedSegmentHistory` = a prior this-run release scoring ≥ 60 in the
  relevant segment; `promiseIsSpecific` = specificity ≥ 0.5. The M0A report must
  include the confidence-tier distribution; tiers under 5% of the corpus are marked
  LOW SAMPLE.
- **D-4 craft hiring is out of M0A.** `technical ≡ 40` everywhere. The report must
  carry the owner's verbatim caveat about rescaled craft-weight validation.
- **D-5 segment tastes live in TUNING** (`SEGMENT_TASTES`) — the explicit owner
  grant that widened the tuning surface. Values: yA (−0.45,−0.30,+0.75), family
  (+0.55,−0.55,+0.20), adult (−0.20,+0.45,−0.15), prestige (+0.40,+0.70,−0.40).
  Closest pair adult–prestige at 0.696 — the first place to look if instrumentation
  shows segments co-moving.
- **Time model (B1/B2/B3/M1/N5):** tick = week; `TICKS_PER_YEAR` 52;
  `PRODUCTION_TICKS` 8; `MAX_CONCURRENT_PRODUCTIONS` 2; at most one greenlight per
  tick; all 30 concepts always available. `market.tick` increments as the **final**
  step of `tick()`. PRODUCTION advances only productions with
  `startTick < currentTick` (a film does not advance in its greenlight tick), so a
  film greenlit at t releases during tick t + 8 exactly. Result: releases at ticks
  8, 9, 17, 18 … 44, 45 — 10 per run, two productions unfinished at year end
  (reported, excluded from flag statistics). Same-tick multi-release resolves in
  ascending `productionId` order.
- **Validation (M15/M16):** role-type matching; one active engagement per talent;
  no actor in two slots of one film; concurrency and one-greenlight-per-tick;
  `promise.genre === concept.genre`; cancel removes the production, refunds
  nothing, touches no standing; invalid actions reject loudly (a harness abort, not
  a game event).
- **B12 data flow:** at RELEASE the production leaves `activeProductions` and a
  release context (production, cast talent, forecastSnapshot, plus mismatchPenalty
  / timelinessContribution / awarenessFactor) is threaded through STANDING and
  BROADCAST, dropped at tick end. `releasedFilms` keeps FilmResult only — which is
  why FilmResult carries `conceptId`/`directorId`.
- **M9 streams:** sim stream = critic draw only; candidates/agent streams key by
  tick; forecast stream keys by productionId. Agents cannot thread `rngState` —
  that is why the derived streams exist.
- **Candidate grid (B18/B19/B21, phase 3):** package = concept + writer + director
  + cast triple (distinct actors) + shape + per-axis promise + negative level +
  marketing level; seeded sampling down to 500 distinct packages per decision;
  identical set to both agents; `intendedSegments` = argmax expected segment
  appeal (metadata; forecast always covers all four segments).
- **Test referents:** §15.3's "score" = `cohesionContribution` (M12, with synthetic
  {0,0,0} shape injection); §15.4 orders on `boxOffice.total` with marketing pinned
  at `MARKETING_HALF_SATURATION` (M13 — on segment appeal alone, precise-met and
  vague provably tie).
- **Recorded refutations (do not relitigate):** authored talent never enters
  headless M0A runs (flag reported "not exercised"); `CoverageContext` is
  declare-only until phase 6; tuning authority = exactly the TUNING object
  (formulas, flag thresholds, §15 bounds are fixed); prestige's literal 60 anchor
  and the dormant benchmark fields are verbatim-by-design.
- **Phase-2 additions to the record:**
  1. D-3's "that segment" is bound to `promise.intendedSegments` (B21 supplies the
     antecedent). **Now SETTLED (owner ruling #2, Phase 3):** success with ≥1 segment
     in the film's `promise.intendedSegments` — an unrelated arbitrary segment is not
     sufficient. Phase-3's candidate `intendedSegments` (B21 argmax) feed this
     predicate consistently. The Phase-2 "adjudication pending" flag is closed.
  2. The §4 budget clamp [0.80, 1.40] is unreachable via legal shape triples (real
     range ≈ [0.81, 1.38]); correct defensive code that never fires. Tested as a
     range assertion over all 36 triples.
- **Phase-3 additions to the record (owner rulings, 2026-07-26 authorization):**
  1. **Production.id = `prod-<startTick zero-padded to 4>`** (ruling #1). `startTick`
     is unique per run (≤1 greenlight/tick) so the id is unique, monotonic, and
     lexically ordered = creation order; no `GameState` counter was added. Talent ids
     are `t-<role3>-NN`, concepts `c-NN`, authored talent `authored-NNNN` (delegated,
     collision-free by prefix).
  2. **OracleAgent uses the deterministic omniscient noise-free pipeline** (ruling #3,
     = HANDOFF §10.4): `forecastCenters`→`computeBoxOffice`, no critic sampling, no
     forecast gaussian, no realized outcomes; EV = expected profit (D-1); ties broken
     by ascending candidate index. This is the load-bearing wiring the §14
     dominance/dead-state flags will measure — the auditor verified it explicitly.
  3. **Greenlight policy = greenlight whenever `activeProductions.length < 2`**
     (ruling #4). This is the only policy that reproduces the D-2/B2 ten-release
     cadence (releases at ticks 8,9,17,18,26,27,35,36,44,45; two unfinished at year
     end) — verified by an independent timeline test.
  4. **Worldgen determinism** (ruling #5): all artifacts derive from the seed via a
     derived `'worldgen'` stream (never the sim stream); word lists are committed TS
     modules consumed in fixed declared order (no fs enumeration).
  5. **Candidate distinctness is index-tuple, not content** (B19 reading; audit NOTE):
     `generateCandidates` dedups the 500 on the cross-product index tuple. Because the
     8 promise triples are sampled independently, two index-distinct packages could
     carry identical content; judged CONFORMS (B19's "distinct packages" ranges over
     the sampled cross-product's cells). Recorded so the provenance is on file.

---

## 6. Testing Strategy

- **Philosophy:** tests are an independent check on the transcription, not a
  restatement of the code. The test-author role reads the two contract documents
  and `src/core/index.ts` (export names/signatures) — nothing else. Expected values
  are hand-derived from contract formulas before the assertion is written; two
  anchors were mutation-checked to prove they fail when wrong. Assertions are never
  weakened to go green — a red test is a report.
- **Auditor relationship:** testing and auditing are different roles. Tests check
  values; the read-only auditor checks *provenance* — whether any code behavior
  exists that the contract does not dictate (INVENTED), plus DEVIATES / MISSING /
  OUT-OF-SCOPE, with file:line citations both ways.
- **Conventions:** one range test per bounded term, at constructed extremes (M11
  enumerates the term list); hand-computed formula anchors (budgetAdequacy
  65.2/87.0/100, a craft value to five decimals, a full resolveShape triple);
  determinism tests assert same-seed identity and serialization round-trips;
  acceptance tests §15.3/§15.4/§15.5 are implemented at unit level per their M12/M13
  operationalizations.
- **Behavioral, not structural:** the §15.6 forecast-independence suite is
  owner-mandated to be behavioral — no module mocks, no stubbing internals, no
  coupling to call structure. It proves independence by: deterministic centers;
  draining the sim stream before forecasting changes nothing; forecasting leaves the
  sim stream's serialized state untouched; wildly different realized outcomes leave
  forecasts identical; the forecast stream reproduces the same offset for the same
  (seed, productionId).
- **Hygiene:** a test scans `src/` and `tests/` file contents for the literal
  `Math.random` (zero occurrences allowed). Scope note: it does not cover files
  outside those trees; keep harness code inside `src/`.
- **Intentionally untested:** `criticMean`, `reviewVariance`, and currency values
  (unbounded by design, M11); specific PRNG bit-sequences (properties only);
  `Talent.perceived` (dormant data this contract); `technical` variation (D-4);
  §6/§8 behavior (phases 3–4).

## 7. Audit History

Every audit and its outcome, in order:

1. **Contract audit (pre-implementation, produced rev. 4):** multi-agent audit of
   the rev. 3 contract text itself — 77 candidate issues, 56 confirmed gaps, 21
   refuted with citations. All 56 resolved via `rev4-open-questions.md`; five owner
   decisions D-1–D-5. Process notes: an orchestration bug (un-interpolated prompt
   templates) voided one verification stage and was re-run after a fix; a session
   limit killed 26 adjudications mid-run, re-run to completion on Opus. The final
   adjudications are all genuine.
2. **Phase 1 audit** (read-only, clause-by-clause vs §2/§4-declarations/§13-
   declarations/§16/§17/RNG): **CLEAN, zero findings.** Two contract-silent choices
   noted for transparency, not flagged: the sfc32 algorithm choice; distribution
   functions as stream methods rather than the contract's free-function shape.
3. **Phase 2 audit** (vs §4/§5.1–§5.6/§7 + every rev. 4 item phase 2 touches):
   **CLEAN, zero findings.** Verified the two on-record transparent readings match
   what was reported; explicitly checked the §5.3 originality operator precedence
   and single-sampled-term property.
4. **Phase 3 audit** (read-only, clause-by-clause vs §3/§6/§9/§10/§13 + the rev. 4
   items and owner rulings the phase touches; determinism/ordering, RNG stream
   isolation, replay posture, scope): **CLEAN WITH NOTES — zero
   DEVIATED/INVENTED/MISSING/OUT-OF-SCOPE findings.** One conforming NOTE recorded:
   B19's "500 distinct packages" is implemented as cross-product index-tuple
   distinctness (content-identical-but-index-distinct packages are possible), which
   the auditor judged the governing text's specified reading and an authorized
   engineering choice — CONFORMS, flagged for provenance. Mechanical checks pass; the
   `rng.ts` `'worldgen'`-purpose change verified additive-only (existing streams
   byte-identical). No correction required.
5. **Phase 4 adversarial review** (one focused Opus pass over the harness + broadcast +
   flags, actively hunting for a hidden dominant strategy, misattributed profiles,
   pooling errors, cherry-picked seeds, nondeterminism, RNG contamination, replay
   divergence, broadcast affecting results, threshold drift, corpus reduction,
   phase-5 leakage): **verdict — study TRUSTWORTHY.** Independently recomputed the
   D-2 profile rates from raw (matched exactly), ran the corpus twice (byte-identical),
   and empirically proved the proposed COHESION_CAP tuning ineffective (prestige≥60
   → 0.75%). One MEDIUM disclosure: B25/B26 signatures are blind to single-axis
   dominance (Oracle picks max-marketing 98%, bittersweet 53%) — contract-faithful
   (N9), reported. No corrections required.
6. **Phase 4 audit** (read-only, clause-by-clause vs §8/§14/§15 + B22–B28, M6, M8, M10,
   M17, N8, N9, owner rulings; determinism, corpus size/pooling, replay, scope):
   **CLEAN WITH NOTES — zero DEVIATED/INVENTED/MISSING/OUT-OF-SCOPE findings.**
   Re-ran the full suite (320/320), regenerated the corpus byte-identically. Sole
   note: the D-2 hard fail is genuine, correctly reported (not masked), and traceable
   to fixed §5/§6 formula constants outside the tuning surface — an owner matter. No
   correction required.
7. **M0A.1 (D-6) adversarial review** (one focused Opus pass over the standing rewrite,
   hunting for a hidden shared driver, semantic violations, reverse-engineered thresholds,
   saturation, agent-specific/cherry-picked/hidden-randomness, huge-gross→confidence,
   prestige-as-quality-echo, awareness upward-only, weakened tests, 7-flag regressions):
   **verdict — D-6 SOUND, the D-2 pass is HONEST.** Split-corpus robustness (both halves
   3/4; stricter 62/38 boundary still passes), three independent signals, mutation-verified
   tests, no saturation, no regressions. No high-severity findings.
8. **M0A.1 (D-6) contract audit** (read-only, vs the recorded D-6 ruling): **CLEAN WITH
   NOTES — zero value/behavioral deviations.** Implementation matches D-6 exactly (all
   formulas + 13 constants); only §6 + the ephemeral release context changed; save schema
   untouched. Two NOTES were stale `tuning.ts` comments (values already correct), corrected
   by the PM (documentation-only, no re-audit needed).

**Corrections required by any audit: none substantive.** The only corrections in project
history are two documentation touch-ups: the phase-1 `Math.random`-in-a-comment reword,
and the M0A.1 stale-comment fix in `tuning.ts` — neither changed any value, behavior, or
test outcome.

---

## 8. Technical Debt

**Acceptable debt (documented, do not "fix" without cause):**
- `gaussian` discards the Box–Muller spare — 2 uniforms per deviate, deliberate for
  fixed stream advancement.
- The §4 budget clamp never fires under legal inputs — defensive, contract-verbatim.
- `Promise` type shadows the TS global — safe in the sync core, documented.
- The hygiene scan covers `src/` + `tests/` only.
- Reception/forecast take rich explicit inputs (production data, lookups, era,
  standing); phase 3's `applyActions`/`tick` must assemble those inputs. This is a
  deliberate seam, not an accident.
- Committer identity unset (`bruce@Mac.fritz.box` auto-derived).

**Future work (known, scheduled elsewhere):**
- Craft-weight re-validation when craft hiring arrives (M1A) — owner-mandated
  report caveat exists.
- Name/title word lists for worldgen (N2) do not exist yet — phase 3 must create
  them as deterministic data files.
- `Production.id` generation scheme is not yet pinned — phase 3 must choose a
  deterministic scheme (see §10 risks).
- Archive docs at repo root await owner relocation; remove the `.gitignore` block
  when they leave.
- No CI, no linter — not requested; tests + tsc are the gate.

---

## 9. Deferred Systems

**§11 non-goals (contract decision, not oversight — build nothing, scaffold
nothing, TODO nothing):** chemistry, readable memories, production incidents,
contract negotiation, the lot, rival studios as agents, awards season, scene
composition, screenplay generation, visual output, library economics, receivership,
`SimulationFlags`, the studio economy (beyond D-1's ledger), cultural drift, aging
and career progression, late promise repositioning, competition modelling (types
exist, `competitionFactor ≡ 1.0`, `competingSlate ≡ []`), LLM integration of any
kind, onboarding, tutorial, accessibility, mobile layout.

**Deferred by phase gating:** M1A UI (phase 5 — requires the words "approved for
phase 5"); broadcast presentation and the prediction→result→revision cycle
(phase 6); full broadcast beyond the two crude release templates (phase 4 builds
only the minimal deterministic core).

**Deferred by design-archive documents (visible at root, NOT FOR BUILD, never
opened):** career & talent market (rev. 2), historical talent / development
scarcity, acquisition & discovery, filmmaker pitches, the v2 design spec. They
become contracts only after M0A reports. Wanting one of them mid-build is the
signal to stop and report, not to reconstruct it.

**Dormant in-scope surface:** `Talent.perceived` (carried, never read);
`Talent.age` (generated, never consumed); era fields other than `costScale`;
`CoverageContext`; authored talent in headless runs (implemented + tested in
phase 3 via `createTalent`, never invoked by the M0A agents).

---

## 10. Phase 3 Recommendations — COMPLETE

**STATUS: DONE (this commit).** The plan below was executed in this order; every
step landed with independent contract-derived tests, and the single Phase-3 audit
returned CLEAN WITH NOTES. The Phase-4 recommendations follow at the end of this
section. Kept for the record:

Scope was §12 step 3: `applyActions`/`tick`, §6 standing, §9 worldgen, §13 agents.
Order (each step tested before the next):

1. **Worldgen (§9 + B7/B8/B9/B10/B11/M4/N2/N3).** Pure function seed → GameState.
   Talent 12/10/28/10 across roles; salaryCurve; baseNegativeCost distribution;
   era; `requiredSlots` always all three; uniform genres; deterministic name/title
   word lists (new data files); tastes from `TUNING.SEGMENT_TASTES`; empty
   collections; tick 0. Tests: distribution bounds over many seeds, determinism,
   role counts, shares sum to 1.
2. **applyActions (§3 + M15/M16/D-1/M1).** Validation rules exactly per M16;
   ledger debits per D-1; `forecastSnapshot` computed here at greenlight (forecast
   stream, M1); `startTick`/`remainingTicks` stamped; cancel per M15;
   `createTalent` per §10. Decide and document the deterministic `Production.id`
   scheme first — N5 ordering, forecast-stream keying, and §15.7 replay all depend
   on it (sequential per run, e.g. zero-padded counter, is the obvious choice; it
   must sort ascending in creation order).
3. **tick (§3 pipeline + §6 + B12 + N5).** Steps 1–4 live; step 5 (BROADCAST) is a
   deliberate no-op until phase 4 — leave the step present but empty, documented as
   phase-4 surface, not a TODO. `updateStanding` with the B12 context; release
   credits cash; tick increments last. Tests: the exact release timeline (releases
   at ticks 8, 9, 17, 18 …; 10 per run; two unfinished), delta caps ±8/±7/±8,
   same-tick ordering, ledger arithmetic, replay (same seed + same actions →
   byte-identical serialized state).
4. **Candidate generator + agents (§13 + B18/B19/B21/M9/N6/N7).** Seeded
   construction to 500 distinct packages; both agents get the identical set;
   RandomAgent uniform via the agent stream; OracleAgent argmax by expected profit
   (D-1) using the deterministic expected pipeline. Tests: set determinism and
   identity across agents, exclusion of busy talent, distinct-actor casts,
   `promise.genre` equality, Oracle argmax determinism, no sim-stream perturbation
   by either agent.

**Risks:** (a) the `Production.id` scheme — pin it before writing `applyActions`;
(b) iteration-order determinism — always iterate segments/slots in a fixed declared
order, never object-key order; (c) performance — Oracle scores 500 packages per
decision tick; the expected pipeline is arithmetic-only but will run ~20M times in
phase 4's corpus, so keep it allocation-light (memoizing `resolveShape` over the 36
triples is cheap and safe); (d) scope temptation — broadcast belongs to phase 4.

**Expected files:** `src/core/worldgen.ts`, `src/core/actions.ts`,
`src/core/tick.ts`, `src/core/standing.ts`, `src/core/candidates.ts`,
`src/core/agents.ts`, name-list data file(s), `index.ts` exports; tests
`worldgen/actions/tick/standing/candidates/agents/replay`.

**Audit scope:** §3, §6, §9, §10, §13 plus rev. 4 items B1–B3, M1, N5, M15, M16,
M2, M3, B7–B11, M4, N2, N3, B12, B18/B19, B21, M9, N6, N7, D-1 — one full pass,
narrow closure check only if findings. *(Executed as written; CLEAN WITH NOTES.)*

### Phase 4 Recommendations — COMPLETE (this commit)

**STATUS: DONE.** The plan below was executed; the harness, §8 broadcast core, §15
Phase-4 tests, adversarial review, single audit, documented tuning attempt, and
`M0A-REPORT.md` all landed. **M0A verdict BLOCKED on D-2** (see §3a). The phase-5
hard stop stands — no UI work has begun and none may until the owner says the exact
words "approved for phase 5". Kept for the record:

Scope was §12 step 4: the §14 instrumentation harness over ≥1,000 seeded runs, the
minimal deterministic §8 broadcast core (two crude release templates only), and the
`M0A-REPORT.md`.

- **Harness / corpus (N8, §14).** A run driver: `generateWorld(m0a-NNNN)` then, for
  ticks 0–51, `applyActions(state, agent.chooseActions(state))` → `tick(state)` per
  agent (Random, Oracle), pooled per the §14 Agent column. Seeds `m0a-0001…` from a
  master seed. **Owner rule (§11):** the harness writes full output to files; the PM
  session reads only aggregated summaries (flag, pass/fail, one stat) — never per-run
  data into a session. Benchmark early: Oracle scores 500 packages/decision (~20M
  expected-pipeline calls across the corpus); the tuning loop is capped at **5
  iterations**.
- **The eight flags** with rev. 4 operationalizations: choice dominance (B25),
  strategy concentration (B26), dead cultural state (B27), standing differentiation
  (D-2 — the ONLY hard fail: ≥3 of 4 asymmetric profiles each in ≥5% of runs, 60/40
  end-of-run), standing correlation (M6, warning), forecast calibration (M8, B17
  bands 80–90/65–75/55–65, tiers <5% marked LOW SAMPLE), casting diversity (M17,
  Random, per-run median <25%), authored-talent effect (reported "not exercised").
  Flag consequences per N9 (only D-2 blocks).
- **Broadcast (§8, B22/B23/B24/M10).** Fill the `tick` BROADCAST no-op: release-topic
  candidate items only, the two `release-better`/`release-worse` templates,
  `air = rankScore ≥ BROADCAST_THRESHOLD`, `asExpected` items don't air. The B12
  release context must now also carry the broadcast-only intermediates (mismatchPenalty
  / timeliness / awareness) that Phase 3 deliberately did NOT thread (STANDING didn't
  need them). `broadcastCache ≡ state.broadcastItems` (M14).
- **Report (N8, D-3, D-4).** `M0A-REPORT.md`: one section per flag (definition,
  measured value, evidence, verdict) + §15 results; the confidence-tier distribution
  table; and the **verbatim D-4 caveat** (technical pinned at 40; craft weights
  validated at rescaled proportions; re-validation flagged for M1A).
- **Acceptance tests (§15).** §15.1 bounds over the corpus, §15.2 four-quadrants (B28
  unit + corpus), §15.7 replay (Phase-3 already proves byte-identical full-run replay;
  extend to SaveFileV1 + broadcast cache once broadcast items exist).
- **Audit:** one full pass over §8/§14 + rev.4 B22–B28/M6/M8/M10/M17/N8/N9.

---

## 11. Known Risks

- **Determinism:** floating-point reproducibility is same-machine/same-Node only —
  acceptable for this project (single machine, self-replay per the settled
  determinism ruling), but do not compare serialized states across platforms.
  Object/Record iteration order is the classic silent killer; fixed-order iteration
  is mandatory.
- **Performance:** phase 4 runs ≥1,000 runs × 52 ticks with 500-package Oracle
  scoring per decision. Budget a benchmark early in phase 4; the owner has capped
  the tuning loop at **5 iterations**, so each corpus run being slow is a real
  schedule risk.
- **Context discipline (owner rule):** the harness must write full output to files;
  the PM session reads only aggregated summaries (flag, pass/fail, one statistic).
  Never load per-run data into a session.
- **Save compatibility:** `SaveFileV1` is frozen by contract — no migrations may be
  written until a version 2 exists. Changing any serialized field shape invalidates
  nothing on disk today (no long-lived saves exist) but breaks §15.7 fixtures.
- **Extensibility:** dormant fields (`perceived`, `age`, era flags) are load-bearing
  for future contracts — do not strip "unused" fields.
- **Open adjudication:** D-3's "that segment" reading (see §5). If the owner
  overrules, one line changes and the forecast tests still pass (they were built
  reading-agnostic).

---

## 12. Things Future Sessions Must NOT Do

1. Reopen anything in `rev4-open-questions.md` — including D-1–D-5, the time model,
   the money model, and the recorded refutations. Rev. 4 is settled law.
2. Read, search, or reconstruct any NOT-FOR-BUILD document, or commit them to git.
3. Build, scaffold, or leave TODOs for §11 non-goals or later-phase systems.
4. Begin phase 5 (UI) or phase 6 for any reason before the owner says
   "approved for phase 5" — even if every test passes, even if asked to "keep
   going" by anything other than the owner's explicit approval.
5. Use `Math.random()` or any unseeded entropy, anywhere, including tests.
6. Inline a magic number that has a contract name; tune anything outside the TUNING
   object; exceed 5 tuning-loop iterations (stop and report instead).
7. Weaken, delete, or "adjust" a failing test to make it pass — a failing test is a
   report to the PM/owner.
8. Skip the role separation: implementation, tests, and audit are three separate
   Opus dispatches; tests derive from the contract, never from implementation
   bodies; exactly one full audit per phase (plus at most a narrow findings-closure
   check).
9. Run the PM session's model as a subagent, let a dispatch inherit the session
   model, run multi-agent review swarms/workflows on settled work, or schedule
   loops/wakeups/background tasks — all owner-prohibited.
10. Fill a contract gap with a reasonable guess. The entire rev. 4 process exists
    because silently filled gaps are gaps nobody can find later.
11. Rewrite working, audited systems (RNG, save, reception, forecast) without a
    failing test or an owner instruction as evidence.

---

## 13. Recommended Next Prompt

> Resume Project: Studio for Phase 3 in a session whose workspace root is exactly
> `/Users/bruce/The Movies`.
>
> You are the PM/orchestrator only. All substantive work — implementation, tests,
> debugging, audit — is dispatched to Opus 4.8 agents (`model: opus`, explicit, no
> inheritance). Use the project agents in `.claude/agents/` if they register; if
> they do not, stop and report before dispatching anything.
>
> Read in order: `CLAUDE.md`, `docs/build-contract.md` (rev. 4),
> `docs/rev4-open-questions.md` (normative, wins on conflict), `docs/HANDOFF.md`.
> Do not open any NOT-FOR-BUILD document.
>
> Verify: HEAD is `3c64959`, tree clean, `npm test` reports 164 passing, agent
> frontmatter shows `model: opus`. Report the verification.
>
> Then present a Phase 3 plan per HANDOFF §10 — §12 step 3 only
> (worldgen → applyActions → tick/standing → candidates/agents), with the
> Production.id scheme decision called out, expected files/tests, the single-audit
> plan, and one commit boundary. Do not write code until the plan is approved.
> Stop at the phase boundary. HANDOFF §12 lists the prohibitions; they all apply.

---

*End of handoff. Maintain this document at each phase boundary: append the phase's
completed-work entry, audit result, any new settled readings, and update HEAD/state
references. Keep it factual.*
