# D1-A — Concept A Ordinary-Player Enablement — Closure

**Status:** MERGED, VALIDATED, and CLOSED. Concept A — Golden Age Deco is now the **default
player-facing identity**; the development-review tooling remains **default OFF**.

> Before beginning a substantial milestone, integration, audit, or bug fix, read the relevant
> entries in [`docs/LESSONS-LEARNED.md`](../LESSONS-LEARNED.md). Before closing substantial work,
> update it. This closure records Lesson **AE** (content-enablement vs review-tooling) and Lesson
> **AF** (durable scope counts must match Git) there.

**This closure does not revise the historical D1-A closure.** At D1-A closure Concept A was
correctly **default OFF** and ordinary-player enablement was explicitly deferred as a separate
owner decision. That earlier state was right for that milestone and is preserved verbatim in
[`docs/art/D1-A-CLOSURE.md`](D1-A-CLOSURE.md). This milestone is the *subsequent* decision.

---

## 1. Identity of the work

| Field | Value |
|---|---|
| Milestone | **D1-A — Concept A Ordinary-Player Enablement** |
| Visual direction | **Concept A — Golden Age Deco** (approved; **unchanged** by this milestone) |
| Authorized candidate branch | `art-d1a-concept-a-player-enablement` |
| Starting authoritative `main` | `966ae6e15f837e5cc5cbfc333759efb5224f9912` |
| Reviewed implementation commit | `33e15681a17f8647ed74224ff9dd2966ec88f799` |
| Documentation-correction commit | `0c6ff3d0ef7d47b50429fbd36bec5d2b7ea492e4` |
| Final candidate SHA | `0c6ff3d0ef7d47b50429fbd36bec5d2b7ea492e4` |
| Merge commit (no-fast-forward) | `cf9758f33dc4dafad244c20d10c0bdebe17003f2` |
| Merge parents | `966ae6e…` (main) + `0c6ff3d…` (candidate) |
| Preceding D1-A merge | `af7c238a6d11f414ed86786e73ade42986c1e0fd` (in ancestry) |
| Tag | `d1a-concept-a-player-enablement` |

The merge base of `main` and the candidate was `main` itself (`966ae6e`), so the `--no-ff` merge
produced a tree **byte-identical to the reviewed candidate** (`0c6ff3d`); this closure commit adds
only Markdown.

---

## 2. Approvals and authorization

- **Art PM visual approval:** Concept A — Golden Age Deco is visually approved **for ordinary
  players**. No visual redesign was authorized or required. The management-camera hierarchy, Gate /
  Stage A-B / Theater / signage / selection / attention / reduced-motion / fallback presentation are
  accepted. Tertiary-label and smallest-viewport marquee readability are accepted non-blocking
  hierarchy tradeoffs.
- **Engine technical merge review:** found the implementation technically clean and merge-ready —
  Concept A visuals unchanged; the ordinary-player content gate correctly separated from the
  development-review tooling; `GameState` unchanged; `StudioLotSnapshot` unchanged; no Engine
  selector added; navigation contracts unchanged; no save-format or simulation change; no
  unauthorized Art or Engine work; compatible with current `main`.
- **Sole review correction:** one inaccurate durable changed-file count (a six-file code/test/spec
  subset described as the whole commit, which is nine files). Corrected documentation-only in
  `0c6ff3d`. See Lesson **AF**.
- **Owner authorization:** granted for merge, publication, and closure.

---

## 3. The defect this milestone fixed

At `966ae6e`, Concept A rendered **only** behind the development flag `studio-lot-identity-proof`,
which was *also* the only thing that rendered the review chrome (mode selector, performance panel,
Hide/restore pill). A single boolean `identityProof` in `StudioLotScreen.tsx` gated both the
identity render and the review chrome, so published `main` could not show Concept A to a player
without also enabling development-only review behavior. The renderer already supported the split via
`setIdentityMode()`; only the player-facing wiring was missing.

---

## 4. Final ordinary-player behavior

- Concept A is the **default player-facing identity**. It renders automatically on the Studio Lot
  with **no development flag, no localStorage manipulation, and no developer tools**.
- `studioLotIdentityEnabled()` (`ui/src/flags.ts`) **defaults ON**.
- The ordinary-player identity gate:
  - selects the approved Concept A presentation;
  - requires no development flag;
  - requires no localStorage manipulation;
  - **exposes no review chrome** — no review bar, selector, performance panel, Hide control, or
    restore pill is constructed or rendered on the player path;
  - stores nothing in `GameState` or `SaveFile`;
  - retains an explicit baseline rollback.

**Scope note (unchanged):** this milestone isolates the *identity* and makes Concept A the player
default. Whether the Studio Lot *overview* itself ships to ordinary players is a separate, unchanged
gate (`studioLotOverviewEnabled()`, still **default OFF**).

---

## 5. Final development-review behavior

- `studioLotIdentityProofEnabled()` remains **default OFF** (`false` unless
  `VITE_STUDIO_LOT_IDENTITY_PROOF=1` or the localStorage key
  `project-studio.flags.studio-lot-identity-proof` is set to `'1'`).
- The development-review gate **alone** controls: the Identity Review bar, the concept/mode
  selector, the performance panel, the Hide control, the restore pill, the fixture-driven review
  selections, and the `fallback` / `reduced` review modes.
- **Proof OFF always returns the Studio Lot to ordinary-player behavior** rather than retaining a
  stale review selection: `effectiveIdentity` is derived per render from the two flags, so a
  reviewer's temporary `baseline` selection cannot survive turning the dev flag off (unit-tested:
  "dev review flag toggled back OFF leaves no stale review mode").
- The development-review flag is **not** the ordinary-player enablement source.

---

## 6. Explicit baseline rollback, precedence, and edge behavior

| Concern | Behavior |
|---|---|
| Rollback controls | Env `VITE_STUDIO_LOT_IDENTITY=0` (or `false`), build/dev or `.env`; **or** localStorage key `project-studio.flags.studio-lot-identity` set to `'0'`. |
| Effect | Forces the untouched D1 baseline for a player, with development review chrome still absent and navigation/authoritative status intact. |
| Precedence | **Env is evaluated first.** `VITE_STUDIO_LOT_IDENTITY=0`/`false` short-circuits to baseline; only if env does not request rollback is the localStorage key read. |
| Malformed / unrecognized values | Only the exact rollback tokens disable identity (env `'0'` or `'false'`; localStorage exactly `'0'`). Any other value — `'2'`, `'yes'`, `''`, absent — leaves the documented default (**identity ON**). The dev-review gate is the mirror image: only `'1'`/`'true'` (env) or exactly `'1'` (localStorage) turn it on; anything else stays **OFF**. Behavior is deterministic in both directions and fails safe. |
| Storage unavailable (private mode / sandbox) | The `localStorage` read is wrapped in `try/catch`. The **player** gate keeps its default (**identity ON**); the **dev-review** gate returns **false** (OFF). Neither throws, and no code path leaves the identity undefined. |
| Key separation | The player key (`project-studio.flags.studio-lot-identity`) and the review key (`project-studio.flags.studio-lot-identity-proof`) are **distinct** and asserted distinct by unit test. Reads are exact-match `getItem(key) === '…'`, so the shorter player key cannot be satisfied by the longer proof key. |
| Persistence | Neither key enters `GameState`, `StudioLotSnapshot`, or `SaveFile`. No identity mode is persisted anywhere. |

---

## 7. Unchanged contracts (verified empty-diff vs `966ae6e` on integrated `main`)

- `ui/src/lot/snapshot/StudioLotSnapshot.ts` — **empty diff**.
- The entire pure engine `src/core/*` (`GameState`) — **empty diff**. No Engine selector added.
- `ui/src/engine/adapter.ts` (the single UI/core boundary) — **empty diff**.
- `ui/src/lot/navigation.ts` — **empty diff**. The `LotActionKind` → route contract and the six
  navigation intentions are unchanged; all nine semantic destinations (`gate`, `admin`, `casting`,
  `writers`, `stage-a`, `stage-b`, `post`, `theater`, `expansion`) remain reachable.
- `ui/src/lot/scene/`, `ui/src/lot/StudioLotView.ts`, `ui/src/lot/identity/`, `ui/src/lot/lot.css`
  — **empty diff**. **Concept A visual output is exactly as approved.**
- `package.json` / `package-lock.json` — **empty diff**. **No dependency added.**
- Root `CLAUDE.md` — **empty diff**.
- No SaveFile, migration, persistence, simulation, or economy change.

**React retains semantic navigation ownership.** The Phaser canvas stays decorative and
`aria-hidden="true"` (`ui/src/lot/StudioLotScreen.tsx`); the accessible truth is the React companion
navigation.

---

## 8. Deterministic rendering, fallback, reduced motion, lazy loading

- **Deterministic.** Rendering stays seeded (`sceneSeed`) with no `Math.random` in any changed file;
  the UI hygiene scan and the identity draw-call determinism test are unchanged and green.
- **Fallback.** When identity rendering degrades, the scene renders the plain base presentation and
  **all nine destinations remain reachable** through the companion navigation with authoritative
  labels intact (Playwright capture `11-fallback` asserts nine navigable destinations).
- **Reduced motion.** The OS `prefers-reduced-motion` preference freezes decorative motion without
  removing the identity; the ordinary player path applies it independently of any review selection
  (`effectiveReduced`).
- **Lazy loading.** Identity code stays in the lazy `StudioLotView` chunk; the eager `index` bundle is
  unchanged. Phaser is still fetched only when the lot is opened.

---

## 9. Bounded scope — nine files

**Nine files changed in total from `966ae6e`: six code/test/spec files and three documentation
files.** (Verified with `git diff --name-only 966ae6e...0c6ff3d`; see Lesson **AF**.)

**Code / tests / specs (6):**

- `ui/src/flags.ts` — `studioLotIdentityEnabled()` (player content gate, default ON, env/LS
  rollback), `setStudioLotIdentityRollback()`, key `STUDIO_LOT_IDENTITY_PLAYER_LS_KEY`.
- `ui/src/lot/StudioLotScreen.tsx` — `effectiveIdentity` / `effectiveReduced`; one effect drives the
  scene for both the player and review paths; two-capability comment.
- `ui/src/flags.test.ts`, `ui/src/lot/StudioLotScreen.test.tsx`,
  `ui/src/lot/StudioLotIdentityReview.test.tsx` — new-contract, rollback, key-separation and
  toggle-back coverage.
- `ui/e2e/player-enablement.spec.ts` — **new** player-clean evidence spec.

**Documentation (3):**

- `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT.md` — the implementation record.
- `docs/HANDOFF.md` — current-state header + milestone entry.
- `docs/LESSONS-LEARNED.md` — Lesson **AE**.

No path entered under `src/core/`, SaveFile or migration code, `package.json`,
`package-lock.json`, Art asset directories, character directories, Asset Lab directories, Three.js
or GLB/glTF paths, D1-B paths, or the economy/recovery systems.

---

## 10. Evidence (re-run on integrated `main` after the merge)

| Check | Command | Result |
|---|---|---|
| Root TypeScript | `npx tsc --noEmit` | **PASS (clean)** |
| UI TypeScript | `npx tsc -p ui/tsconfig.json --noEmit` | **PASS (clean)** |
| Unit / component | `npm test` (vitest, core + ui) | **1030 passed / 79 files** |
| Focused D1 identity + flags | `manifest` · `draw` · `StudioLotIdentityReview` · `StudioLotScreen` · `flags` · `studio-lot-snapshot` | **55 passed / 6 files** |
| D-14 regression | `d14-star-power` · `d14-career-impact` · `d14-talent-profile` | **29 passed / 3 files** |
| D-15 regression | `studioRunRecap` · `recap-parity` · `Recap` | **41 passed / 3 files** |
| Full Playwright | `npx playwright test` (from `ui/`) | **65 passed / 0 failed** |
| Player-enablement Playwright | `player-enablement.spec.ts` (within the full run) | **11 passed / 14 captures** |
| Identity Playwright | `lot-identity.spec.ts` (12) + `lot-identity-final.spec.ts` (9) | **21 passed** |
| Base lot Playwright | `lot.spec.ts` | **14 passed** |
| Production build | `npm run build` | **PASS** |

Console cleanliness and disposal are covered inside the Playwright run and were green: *"no console
errors while cycling all review modes over a live state"*, *"repeated open/close with identity on
leaves no orphaned canvas"*, and *"L. repeated lot open/close leaves no orphaned canvas"*.

Bundle: identity stays in the lazy `StudioLotView` chunk (**1,549.55 kB**, gzip 361.27 kB); the eager
`index` bundle is **593.82 kB** (gzip 172.89 kB), unchanged from the accepted baseline.

**Player-clean evidence** — `out/player-enablement-evidence/` (untracked; `out/` is gitignored):
`01`–`04` quiet studio at 1920×1080 / 1366×768 / **1280×720** / 125% zoom; `05` one production;
`06` two productions; `07` theater release; `08` warning/attention; `09` selection; `10` reduced
motion; `11` fallback; `12` rollback baseline; `13` dev-review ON showing controls available only in
dev; `14` dev-review OFF again → clean Concept A restored. Every player-clean capture asserts zero
dev chrome (`lot-review-mode`, `lot-perf-panel`, `lot-review-hide`, `lot-review-show` all count 0).

---

## 11. Known non-blocking visual notes (unchanged, accepted)

- Tertiary department plaques are small at the management distance (the companion navigation carries
  the exact text). The released-film marquee title is small at the smallest viewports. No visual
  correction is requested.

---

## 12. Historical-record preservation

- [`docs/art/D1-A-CLOSURE.md`](D1-A-CLOSURE.md) is **unmodified**. It correctly records that D1-A
  shipped Concept A **default OFF** with ordinary-player enablement deferred as a separate owner
  decision. That statement remains true *of that milestone*.
- The two milestones are distinct and both are recorded:
  1. **D1-A Studio Identity Package** — an isolated visual proof: Concept A **default OFF**, review
     tooling development-only, the visual direction proven and revised before any player exposure.
  2. **Concept A ordinary-player enablement** (this closure) — Concept A **default ON** for ordinary
     players, review tooling **still default OFF**, approved visuals unchanged, Engine contracts
     unchanged.
- No historical document was rewritten to conceal the earlier default-OFF governance state.

---

## 13. Scope exclusions — what this milestone did NOT do

No Concept A visual change · no Studio Lot redesign · no `StudioLotSnapshot` change · no `GameState`
change · no Engine selector · no navigation-intention change · no simulation change · no SaveFile
change · no new persistence · no dependency, font, or external art · no characters, GLBs, glTFs, or
Three.js · no renderer expansion · no D-15 change · no economy retuning · no financing/debt/recovery
mechanic · no unrelated disposal or deferred-maintenance fix · no root `CLAUDE.md` edit.

**D1-B remains unstarted. Asset Lab 05H remains separate and untouched. No character integration
occurred.**

---

## Cross-references

- Implementation record: [`docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT.md`](D1-A-ORDINARY-PLAYER-ENABLEMENT.md).
- Original (preserved) proof closure: [`docs/art/D1-A-CLOSURE.md`](D1-A-CLOSURE.md).
- Canonical lessons: [`docs/LESSONS-LEARNED.md`](../LESSONS-LEARNED.md) — Lessons **AE** and **AF**
  (and **D**, which this extends from three *decisions* to two *flags*).
- Handoff pointer: [`docs/HANDOFF.md`](../HANDOFF.md).
- Published branch: `art-d1a-concept-a-player-enablement` @ `0c6ff3d`.
- Annotated tag: `d1a-concept-a-player-enablement` (points at final `main` after merge + closure).

**Next Owner decisions, each separate:** whether to authorize **D1-B**; whether to **commission** work under
the active human-artist handoff; and, **only after that commission's required gates pass**, whether to
authorize **character integration**. All three are **out of scope here** — this milestone's record above is
unchanged, and **D1-A remains closed**.

- **D1-B remains unstarted, unauthorized and separately governed**, and is **not assumed to include
  characters**.
- **Asset Lab 05H and 05I are completed, rejected character-build milestones — not unstarted future options.**
  05H was built and its **visual character build was rejected** as a production character; **05I** followed as
  **one bounded corrective milestone containing two owner-reviewed iterations** and was itself **rejected as
  the production character foundation**. The open question is therefore **not** whether to "start 05H".
- The **active character authority** is the merged and published handoff
  `asset-lab-character-human-artist-handoff` @ `9c0466d` (Asset Lab repository, remote `backup`;
  **not** merged into production `main`). It is a **commissioning specification — not permission to begin
  work, and not permission to integrate a character**.
- Any future **character production** or **Studio Lot character integration** requires **separate Owner
  authorization and acceptance evidence**.
