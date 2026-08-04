# Project: Studio — Canonical Lessons Learned

> **Before** beginning a substantial milestone, integration, audit, or bug fix, Builders and PMs
> **must read** the relevant entries in this record.
> **Before** closing substantial work, they **must update** it.

This is the single durable lessons record for Project: Studio and for reusable practices that
should inform future game projects. Do not create competing Engine/Art/temporary lessons files;
add entries here and cross-reference.

## How to use

Each entry captures, where applicable: task/defect · domain · symptom or risk · root cause · why
existing safeguards missed it · resolution or deferred action · regression/verification coverage ·
fastest future diagnostic · reusable pattern · anti-pattern · reuse classification · related
commits/tests/docs · open follow-up. Reuse classes: **P** = Project: Studio-specific ·
**MG** = reusable for future management games · **BR** = broadly reusable across repositories.

---

# D1-A — Studio Identity Package (merged `af7c238`, tag `d1a-studio-identity-package`)

Context: a bounded, presentation-only studio-identity visual proof (Concept A — Golden Age Deco),
default OFF, merged onto `main` at starting SHA `ceb271b`. Candidate `8e40ebf` on branch
`art-d1a-studio-identity-visual-proof`. Reviewed by an Engine technical peer review that reopened
**no** accepted visual direction or runtime scope but corrected evidence/governance artifacts.
Related: `docs/art/D1-A-CLOSURE.md`, `docs/art/D1-A-VALIDATION-REPORT.md`,
`docs/art/D1-A-CORE-SLICE-REPORT.md`.

## A. Core-slice-first validation — **MG, BR**

- **Lesson:** Validate a bounded visual **core slice** before broader production adoption.
- **Evidence:** D1-A proved identity, hierarchy, fallback, accessibility, feature isolation, and
  lazy loading on one concept (A) over the real Studio Lot **before** any ordinary-player
  enablement — a small, reversible surface carrying the risky "does the visual system work at all"
  question.
- **Root cause it addresses:** broad visual adoption commits many files and reviewer attention
  before the core visual/interaction/accessibility contract is proven.
- **Resolution / coverage:** merged default OFF with the full contract exercised (984 unit / 21
  identity Playwright / 51 full Playwright / build / console / disposal). Enablement kept as a
  separate decision.
- **Fastest diagnostic:** ask "what is the smallest slice that proves the hard part?" and gate on it.
- **Pattern:** prove identity + hierarchy + fallback + a11y + flag isolation + lazy load on one
  concept behind a flag. **Anti-pattern:** ship a whole visual system before its core is proven.
- **Related:** `D1-A-CORE-SLICE-REPORT.md`; merge `af7c238`.

## B. Management-camera hierarchy — **MG**

- **Lesson:** Judge Studio Lot visuals at the **actual fixed-isometric management camera**, target
  resolutions, and browser zoom — not only through close-up Art review.
- **Symptom:** the first core slice read as small floating labels, too subtle from the D1 baseline;
  it only became visible once judged at the management distance (owner ruled **REVISE**).
- **Root cause:** close-up Art review flatters detail the management camera never shows.
- **Resolution / coverage:** the visual-hierarchy revision made primary landmarks large and
  building-mounted (Gate banner + emblem, Stage A/B facade identifiers, Theater marquee) with tiered
  department labels; verified across 1920×1080 → 1280×720 and 125% zoom in Playwright captures.
- **Fastest diagnostic:** capture matched baseline-vs-candidate pairs at each shipping viewport +
  zoom and compare at the management camera, not zoomed in.
- **Pattern:** review at the real camera/resolutions/zoom. **Anti-pattern:** approving from
  close-ups. **Related:** `D1-A-CORE-SLICE-REPORT.md` (Revision status).

## C. Engine/presentation ownership — **P, BR**

- **Lesson:** Identity, palette, signage, and branding **data** may be presentation-only, while
  occupancy, production, release, title, warning, and navigation **truth** stays behind
  `StudioLotSnapshot`.
- **Evidence:** the `StudioIdentityManifest` type has no field for occupancy/title/money/state;
  `StudioLotSnapshot.ts` is empty-diff vs `main`; `GameState` (`src/core`) is untouched and isolated
  from Phaser; navigation/accessibility are React-owned.
- **Root cause it addresses:** presentation layers tend to accrete authoritative state, coupling the
  renderer to the sim.
- **Resolution / coverage:** unit tests assert GameState is never mutated and identity stays baseline
  with the flag off; snapshot empty-diff verified at merge.
- **Fastest diagnostic:** `git diff main -- <snapshot>` must be empty; grep the presentation type for
  any state-bearing field.
- **Pattern:** presentation reads a snapshot; truth lives behind it. **Anti-pattern:** the renderer
  owning or recomputing sim truth. **Related:** `D1-A-CLOSURE.md` §3.

## D. Default-OFF visual proofs — **BR**

- **Lesson:** Keep experimental/provisional visual packages **default OFF** until a separate owner
  ruling authorizes normal-player exposure. Separate **merge approval**, **production enablement**,
  and **later visual expansion**.
- **Evidence:** `studioLotIdentityProofEnabled()` defaults false; review controls render only with
  the flag on; the merge explicitly does not enable the feature.
- **Root cause it addresses:** conflating "reviewed and merged" with "live to players."
- **Resolution / coverage:** flag + dev-only-controls unit tests; closure records enablement as a
  separate decision.
- **Fastest diagnostic:** confirm the flag default and that no ordinary code path reads it as on.
- **Pattern:** three distinct gates (merge / enable / expand). **Anti-pattern:** a merge that also
  flips the feature live. **Related:** `ui/src/flags.ts`; `D1-A-CLOSURE.md` §5.

## E. Executable evidence over manual counts — **BR**

- **Lesson:** Generate/verify changed-file counts, test totals, commands, and evidence from **Git,
  package scripts, and test output** — never copy them by hand.
- **Symptom (what drift produced):** D1-A docs originally stated **18** files (actual **21**),
  **982** tests (actual **984**), incorrect focused-test counts, a **nonexistent** contract section,
  a non-authoritative build command, and a fixed marquee-bulb count the implementation never
  guarantees.
- **Root cause:** hand-transcribed numbers in owner-facing docs, unbacked by a command.
- **Why safeguards missed it:** tests and build were green; nothing checks prose numbers against
  reality.
- **Resolution / coverage:** corrected Markdown-only at `8e40ebf`; totals re-derived from
  `git diff --name-only … | wc -l`, `vitest` output, and `package.json` scripts.
- **Fastest diagnostic:** regenerate every count from a command before writing it; diff prose numbers
  against tool output.
- **Pattern:** cite the command, paste its output. **Anti-pattern:** typing counts from memory.
  **Related:** `8e40ebf`; `D1-A-VALIDATION-REPORT.md`.

## F. Test-category separation — **BR**

- **Lesson:** Keep these categories **explicitly separate**: unit/component; focused
  unit/component; full Playwright; focused Playwright.
- **Evidence:** D1-A reports 984 unit/component (76 files), 23 focused unit/component, 51 full
  Playwright, and 21 focused (identity) Playwright — each labeled distinctly.
- **Root cause it addresses:** merging categories hides which surface actually passed and invites
  count drift (see Lesson **E**).
- **Fastest diagnostic:** one row per category with its own command and total.
- **Pattern:** name the category + command + total. **Anti-pattern:** one blended "all tests pass"
  number. **Related:** `D1-A-VALIDATION-REPORT.md`.

## G. Contract-citation validation — **BR**

- **Lesson:** Validate owner-facing **section references** against actual headings and current
  document structure.
- **Symptom:** a doc cited a nonexistent "Section 34"; the real reference was section 11 (Explicit
  non-goals).
- **Root cause:** citations written from memory of an older document shape.
- **Resolution / coverage:** corrected in `8e40ebf`.
- **Fastest diagnostic:** open the cited section and confirm the heading text before shipping.
- **Pattern:** resolve every citation against the live doc. **Anti-pattern:** citing a remembered
  section number. **Related:** `8e40ebf`.

## H. Package-script documentation — **BR**

- **Lesson:** Document the **authoritative package script** (e.g. `npm run build`) instead of a
  bare underlying command that may not run from the repository root.
- **Symptom:** docs showed a bare `vite build`; the real, root-runnable command is `npm run build`
  (`vite build --config ui/vite.config.ts`), which matters because the repo path contains a space and
  the config lives under `ui/`.
- **Resolution / coverage:** corrected in `8e40ebf`.
- **Fastest diagnostic:** run the documented command verbatim from the repo root.
- **Pattern:** document `npm run <script>`. **Anti-pattern:** documenting the raw tool invocation.
  **Related:** `package.json`; `8e40ebf`.

## I. Comment drift — **BR**

- **Lesson:** Implementation **comments**, assertions, and owner-facing docs can drift independently
  even while runtime behavior stays correct.
- **Concrete example:** the `draw.test.ts` comment claiming exactly `2 × bulbDensity` bulbs while the
  implementation is responsive/width-scaled (the test asserts an even, non-empty set — runtime
  behavior is right; the comment is stale).
- **Why safeguards missed it:** comments are not executed; the assertion itself was already generic.
- **Resolution / deferred:** **deferred** — recorded as a non-blocking follow-up; not changed during
  the merge (requires separate owner authorization).
- **Fastest diagnostic:** search critical numeric/behavioral claims across source, tests, and docs;
  compare each claim with the actual implementation and assertion.
- **Pattern:** grep numeric claims and reconcile. **Anti-pattern:** trusting a comment as a spec.
  **Related:** `ui/src/lot/identity/draw.test.ts`; see Lesson **L**; `D1-A-CLOSURE.md` (Deferred #3).

## J. Documentation-only correction discipline — **BR**

- **Lesson:** When a correction is proven **Markdown-only**: inspect the exact Git delta, keep the
  correction narrow, verify source remains byte-identical, avoid needlessly rerunning expensive
  suites, and preserve the previously validated evidence at the exact source hash.
- **Evidence:** the `7223fe2..8e40ebf` delta is exactly 5 `docs/art/*.md` files (0 non-Markdown); the
  reviewed evidence stayed pinned at the code hash and was not regenerated.
- **Fastest diagnostic:** `git diff --name-only <a>..<b>` — assert only docs; `git diff <a>..<b>` on
  source paths must be empty.
- **Pattern:** verify docs-only by delta, then trust the pinned evidence. **Anti-pattern:** rerunning
  full suites for a proven prose fix, or letting a "docs" commit smuggle code. **Related:** `8e40ebf`.

## K. Art/Engine peer-review value — **MG, BR**

- **Lesson:** Peer technical review can **correct evidence and governance artifacts without
  reopening** accepted visual direction or runtime scope.
- **Evidence:** the Engine review of the Art candidate produced only the Markdown correction at
  `8e40ebf`; Concept A direction and all runtime code were left intact.
- **Fastest diagnostic:** scope the review to evidence/governance/boundary claims; flag scope creep
  into settled visual decisions.
- **Pattern:** cross-discipline review of evidence + boundaries. **Anti-pattern:** a peer review that
  relitigates an already-approved direction. **Related:** `D1-A-CLOSURE.md` §7.

## L. Responsive procedural presentation — **MG (UI/procedural art)**

- **Lesson:** Do **not** document fixed visual-element counts when the implementation is responsive,
  width-scaled, density-driven, or resolution-dependent.
- **Evidence:** the marquee is density-driven and width-scaled (even, non-empty); the manifest's
  `bulbDensity` is a parameter, not a guaranteed on-screen count. Docs originally implied a fixed
  count and were corrected.
- **Fastest diagnostic:** for any documented count, check whether the code scales it by width/zoom/
  density; if so, describe the rule, not a number.
- **Pattern:** describe the responsive rule. **Anti-pattern:** a literal count for a scaled element.
  **Related:** `ui/src/lot/identity/{manifest,signage}.ts`; see Lesson **I**.

## M. Phaser hidden-tab disposal — **BR (Phaser games)**

- **Lesson:** Normal open-and-close lifecycle testing may **miss deferred destruction** when a Phaser
  loop is asleep (backgrounded/hidden tab).
- **Symptom / risk:** a pre-existing edge case where unmounting the lot while the tab is hidden can
  defer teardown; ordinary mount/unmount disposal is clean (0 orphaned canvases).
- **Status:** **open maintenance lesson**, NOT a D1-A defect and not introduced by D1-A; deferred,
  requires separate owner authorization.
- **Regression/verification coverage to add:** a lifecycle test that (1) opens the Studio Lot;
  (2) backgrounds/pauses the tab; (3) unmounts the lot while hidden; (4) returns to the tab;
  (5) reopens the lot; (6) inspects canvas count, listeners, game instances, and WebGL resources.
- **Fastest diagnostic:** reproduce with the hidden-then-unmount sequence above and count live
  canvases/contexts.
- **Pattern:** test teardown while the render loop is asleep. **Anti-pattern:** trusting only
  open→close disposal. **Related:** `D1-A-CLOSURE.md` (Deferred #2).

## N. Future-game reuse — **BR (future game repositories)**

- **Lesson:** Reusable **Engine/Art boundary, evidence, lifecycle, feature-flag, and review**
  practices must be stored in a **known tracked location** and read when beginning the next game.
- **Resolution / coverage:** this file is that location; `docs/HANDOFF.md` points at it, and the
  read-before/update-before-close instruction is stated at the top.
- **Fastest diagnostic:** when starting new work, open this file first and read the relevant lessons.
- **Pattern:** one canonical, tracked, linked lessons record. **Anti-pattern:** lessons stranded in
  terminal output or scattered per-discipline files. **Related:** `docs/HANDOFF.md`;
  `docs/art/D1-A-CLOSURE.md`.
