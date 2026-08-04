# D1-A — Studio Identity Package — Closure

**Status:** MERGED, VALIDATED, and CLOSED. Concept A remains **default OFF**; ordinary-player
enablement is a **separate owner decision** and was NOT taken by this merge.

> Before beginning a substantial milestone, integration, audit, or bug fix, read the relevant
> entries in [`docs/LESSONS-LEARNED.md`](../LESSONS-LEARNED.md). Before closing substantial work,
> update it. This closure records the D1-A entries there.

---

## 1. Identity of the work

| Field | Value |
|---|---|
| Milestone | **D1-A — Studio Identity Package** |
| Provisional visual direction | **Concept A — Golden Age Deco** (approved as *provisional*; not final franchise branding) |
| Authorized candidate branch | `art-d1a-studio-identity-visual-proof` |
| Final candidate SHA | `8e40ebfbed0102c2ff315b5cc6a2ceb0c9117b5a` |
| Previously reviewed implementation SHA | `7223fe2215b3deff888dafe0d40def7d6b2a3eb1` |
| Starting authoritative `main` SHA | `ceb271b51a8bad5433584a8cbce0666f1a4fdf6a` |
| Merge commit (no-fast-forward) | `af7c238a6d11f414ed86786e73ade42986c1e0fd` |
| Merge parents | `ceb271b…` (main) + `8e40ebf…` (candidate) |
| Documentation-only correction commit | `8e40ebf…` (5 Markdown files under `docs/art/`) |
| Reviewed Art history preserved | `e4d839e` → `45c6c58` → `7223fe2` → `8e40ebf` |

The merge base of `main` and the candidate was `main` itself (`ceb271b`), so the `--no-ff`
merge produced a tree **byte-identical to the reviewed candidate** (`8e40ebf`); the closure
commit adds only Markdown governance docs.

---

## 2. Bounded scope (21 files, additive only)

D1-A is a presentation-only studio-identity layer over the existing fixed-isometric Studio Lot,
**Concept A ("Golden Age Deco") only**, behind a **default-OFF** development flag.

**Documentation (7)** — `docs/art/`: `D1-A-STUDIO-IDENTITY-BRIEF.md`,
`D1-A-VISUAL-DIRECTION.md`, `D1-A-IDENTITY-MANIFEST.md`, `D1-A-CORE-SLICE-REPORT.md`,
`D1-A-VALIDATION-REPORT.md`, `D1-A-ADOPTION-AND-MERGE-READINESS.md`, `D1-A-OWNER-REVIEW-GUIDE.md`.

**Implementation / test / evidence (14)** — new identity modules
`ui/src/lot/identity/{manifest,emblem,signage}.ts`, the guarded scene layer
`ui/src/lot/scene/LotScene.ts`, `ui/src/lot/StudioLotView.ts` passthroughs, the dev-only review
selector + performance panel in `ui/src/lot/StudioLotScreen.tsx`, the default-OFF flag in
`ui/src/flags.ts`, review-bar styling in `ui/src/lot/lot.css`, the `warn` fixture in
`scripts/gen-lot-fixtures.mts`, and tests
`ui/src/lot/identity/{manifest,draw}.test.ts`, `ui/src/lot/StudioLotIdentityReview.test.tsx`,
`ui/e2e/lot-identity.spec.ts`, `ui/e2e/lot-identity-final.spec.ts`.

The package delivers: Concept A **Golden Age Deco** provisional direction; a presentation-only
**identity manifest**; a **procedural studio emblem** (original geometric Deco crest + `PS`
monogram); **Studio Gate** identity; **Stage A** and **Stage B** identifiers; **Production/Post**
signage; a **Theater marquee**; a tiered **department-sign hierarchy**; Deco **presentation
accents**; **hover, focus, selection, and attention** treatment; **reduced-motion** behavior;
**fallback** behavior; **development-only** review tooling; and tests, documentation, and
evidence tooling.

**No external art was taken in.** All marks are procedural and original — no fonts, no GLB/glTF,
no Three.js, no characters, no imitation of any commercial studio.

---

## 3. Engine / presentation boundary (the load-bearing property)

Identity, palette, signage, and branding are **presentation-only data the Phaser lot paints**.
Occupancy, production, release, title, warning, and navigation **truth** stays behind
`StudioLotSnapshot`.

- `ui/src/lot/snapshot/StudioLotSnapshot.ts` is **unchanged vs `main`** (empty diff).
- **`GameState` (the pure `src/core/*` engine) is isolated from Phaser** — no `src/core` change,
  no new engine selector, no engine-adapter change. The `StudioIdentityManifest` type deliberately
  has **no** field for stage occupancy, production titles, weeks, money, release state, unlocks, or
  player decisions; repainting an identity can never change what the sim is doing.
- **Stage occupancy is snapshot-driven** — the identity layer only labels; it never signals
  availability.
- **Theater release presence and title are snapshot-driven** — the marquee renders from the
  snapshot's release data, not from any recompute.
- **Navigation and accessibility are React-owned.** The Phaser canvas is decorative; the accessible
  truth is the React **companion navigation** — a semantic, keyboard-operable list of every
  destination with its name, state, and attention.

### Nine semantic destinations
`gate`, `admin`, `casting`, `writers`, `stage-a`, `stage-b`, `post`, `theater`, `expansion`
(the canonical building set; the identity signage carries a label for each).

### Six navigation intentions (`LotActionKind` → existing route; no money/time/mutation)
1. `open-studio-overview` → Dashboard
2. `assemble-film` → Assemble a Film
3. `browse-talent` → Roster / Talent
4. `review-productions` → Dashboard (In-Production section)
5. `view-released-films` → Dashboard (Recent-Releases section)
6. `view-expansion` → in-lot expansion info (bounded placeholder; spends nothing)

Every intention targets a screen that already exists **outside** the lot (except the bounded
expansion placeholder), so every destination stays reachable without the lot. This navigation
contract (`ui/src/lot/navigation.ts`) is **pre-existing**; D1-A did not change it.

---

## 4. Deterministic presentation, fallback, reduced motion, lazy loading

- **Deterministic presentation.** Rendering is seeded (`sceneSeed`) and free of `Math.random`
  (enforced by the UI hygiene scan, which covers `identity/`). The emblem/signage draw test asserts
  identical draw-call counts across two renders; Playwright captures are deterministic against the
  seeded fixtures.
- **Fallback contract.** `IdentityMode = 'baseline' | 'concept-a' | 'fallback'`. When identity
  rendering degrades (`fallback`), the scene renders the plain base presentation and **all nine
  destinations remain reachable** via the companion navigation — proof that no navigation or state
  is lost when identity rendering fails. If the canvas is unavailable (no WebGL / jsdom), the
  companion navigation still lists every destination.
- **Reduced-motion contract.** The marquee's decorative motion **freezes** under reduced motion
  (`reducedMotionMode: 'static'`); the bulb-chase phase runs **only** when motion is allowed. Bulb
  layout is **density-driven and width-scaled** (even, non-empty) — it is not a fixed count.
- **Phaser lazy-loading contract.** The identity code lands in the **lazy `StudioLotView` chunk**;
  the eager bundle is unchanged and the flag-off path adds nothing. With the lot flag off, **no
  Phaser is fetched** and no renderer is mounted.

---

## 5. Feature isolation

- **Concept A is default OFF.** `studioLotIdentityProofEnabled()` returns `false` unless
  `VITE_STUDIO_LOT_IDENTITY_PROOF=1` (build/dev or `.env`) or the localStorage QA key
  `project-studio.flags.studio-lot-identity-proof` is set. It is **independent** of the Studio Lot
  overview flag (a reviewer can run the plain D1 lot without identity).
- **Review controls are development-only.** The `{ baseline, concept-a, fallback, reduced }` review
  selector and the performance panel render **only** when the identity flag is on; they never leak
  into ordinary player use (unit-tested: no control renders and identity stays baseline with the
  flag off).
- This merge **does not** authorize ordinary-player enablement. That remains a **separate owner
  ruling**.

---

## 6. Evidence

Validated at the reviewed candidate (`8e40ebf`) and re-verified on integrated `main` after the
merge (actual post-merge totals are recorded in the owner return report accompanying this closure):

| Check | Command | Result |
|---|---|---|
| Root TypeScript | `tsc --noEmit` | PASS (clean) |
| UI TypeScript | `tsc -p ui/tsconfig.json --noEmit` | PASS (clean) |
| Unit / component | `npm test` (vitest, core + ui) | **984 passed / 76 files** |
| Focused identity unit | `manifest.test.ts` (9), `draw.test.ts` (6), `StudioLotIdentityReview.test.tsx` (8) | 23 PASS |
| Full Playwright | `npx playwright test` (from `ui/`) | **51 passed** |
| Identity-only Playwright | `lot-identity.spec.ts` (12) + `lot-identity-final.spec.ts` (9) | **21 passed** |
| Production build | `npm run build` | PASS (identity in the lazy chunk; eager bundle unchanged) |
| Console | all four review modes over a live release state | clean (0 errors) |
| Disposal / leak | repeated mount/unmount | 0 orphaned canvases |

`StudioLotSnapshot` empty-diff vs `main`; no `src/core` change; no new engine selector; default-OFF
flag verified; review controls dev-only.

---

## 7. Authorization & what remains

- **Owner merge authorization:** granted for merge and closure of D1-A (Concept A default OFF).
- **Documentation correction (`8e40ebf`) accepted:** a bounded, Markdown-only correction of
  verified inaccuracies (file count 18→21; unit total 982→984; focused counts; a nonexistent
  contract-section citation → the real section; bare `vite build` → `npm run build`; dropped a fixed
  marquee-bulb count in favor of the responsive description). No source, test, CSS, script, config,
  flag, or package file changed in that commit.
- **Ordinary-player enablement:** remains a **separate owner ruling** — NOT authorized here.
- **D1-B:** remains **unstarted**.

---

## Deferred Non-Blocking Follow-Ups

These were found during review, did **not** block D1-A, were **intentionally not changed** during
this merge/closure, and each requires **separate owner authorization**. See the matching entries in
[`docs/LESSONS-LEARNED.md`](../LESSONS-LEARNED.md).

1. **Stale root `CLAUDE.md` M0A-era governance language.** Not introduced by D1-A; not touched by
   this merge.
2. **Pre-existing Phaser hidden-tab pause-then-unmount disposal defect.** A deferred-destruction
   edge case when the render loop is asleep (background/hidden tab) at unmount. Pre-existing, not
   introduced by D1-A; not fixed here (ordinary mount/unmount disposal passes). See Lesson **M**.
3. **Stale `draw.test.ts` comment claiming exactly `2 × bulbDensity` bulbs.** A comment that drifted
   from the responsive, width-scaled implementation (runtime behavior is correct). Not changed here.
   See Lessons **I / L**.
4. **Silent identity-fallback catches without diagnostic logging.** The fallback `try/catch` paths
   swallow errors without a diagnostic. Behavior is correct (fallback is the intended outcome); no
   logging was added here.

---

## Cross-references

- Canonical lessons: [`docs/LESSONS-LEARNED.md`](../LESSONS-LEARNED.md) (D1-A section, Lessons A–N).
- Handoff pointer: [`docs/HANDOFF.md`](../HANDOFF.md).
- Merge-readiness & validation: `docs/art/D1-A-ADOPTION-AND-MERGE-READINESS.md`,
  `docs/art/D1-A-VALIDATION-REPORT.md`, `docs/art/D1-A-CORE-SLICE-REPORT.md`.
- Published branch: `art-d1a-studio-identity-visual-proof` @ `8e40ebf`.
- Annotated tag: `d1a-studio-identity-package` (points at the final `main` after merge + closure).

**Next owner decision required:** whether to authorize **ordinary-player enablement** of Concept A
(default-ON exposure). Until then, Concept A stays OFF and D1-B stays unstarted.
