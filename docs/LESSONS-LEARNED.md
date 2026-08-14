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

---

# D-15 — Studio Run Recap and Capital Position Explainability — FINALIZED (merged, closed)

> Owner-accepted and merged (merge `152acec`, tag `d15-studio-run-recap`). Related:
> `docs/D-15-studio-run-recap-closure.md`, `docs/D-15-studio-run-recap-phase1.md`,
> `src/core/studioRunRecap.ts`, `ui/src/engine/recap-parity.test.ts`.

## O. Run-level explainability from authoritative records — **MG, BR**

- **Symptom:** the Week 86 controlled run lost ~$13.8M in film contribution across 5 heavy-loss
  films, yet the UI showed only per-screen finance metrics — no run-level recap, loss trend,
  concentration signal, or approaching-lockout warning; the player could not see *why* the studio
  declined.
- **Root cause:** individual finance cards answer "this week / this film" but never synthesize the
  whole run; there was no read-model that composed cash, ledger, films, talent, and contracts into
  one explanation.
- **Why safeguards missed it:** every finance number was individually correct and tested; nothing
  tested whether the *player could understand the run*. Correctness ≠ explainability.
- **Resolution:** one pure `studioRunRecap(state)` read-model (capital story, film slate, talent
  development, concentration, current position + recovery classification, inflection points,
  warnings) reconstructed entirely from `SaveFileV5.state` — no new persistence.
- **Coverage:** 16 core tests + 6 component tests + 3 Playwright journeys; a Week-86 real-save
  cross-check (22/22) reproduced every owner figure exactly.
- **Fastest diagnostic:** load the real save through a read-only harness, run the read-model, diff
  its outputs against the owner's stated facts.
- **Pattern:** a single pure run-recap selector fed by frozen records. **Anti-pattern:** scattering
  run-level insight across per-screen widgets. **Reuse:** MG, BR.

## P. Distinguish "cash positive" from "able to finance the next normal film" — **MG, BR**

- **Symptom:** the fixed-cost Runway read reassuring while a normal-budget film was already
  unaffordable; the player conflated a positive balance with production capacity.
- **Root cause:** cash balance and production affordability are different questions; only the former
  was surfaced prominently.
- **Resolution:** the recap computes a **cheapest legal** and **typical recent** commitment and runs
  each through the existing `commitmentPreview`/`canAfford` gate, then states plainly which is
  affordable and the exact shortfall. Recovery is classified from explicit conditions
  (healthy / constrained / severe / normal-production-unavailable / incomplete) and never promises
  success.
- **Financial-metric distinction (owner-critical):** film contribution (Studio Revenue − committed
  cost) is separated from payroll and overhead so the recap does NOT imply payroll caused a collapse
  that film losses drove.
- **Coverage:** tests assert the cash-positive-but-normal-unaffordable path and the recovery
  classes; the Week-86 check confirmed cheapest affordable / typical short by ~$1.59M.
- **Fastest diagnostic:** set cash between the cheapest and typical commitment; assert the
  distinction + the warning fire.
- **Pattern:** answer "can I act?" with the affordability gate, not the balance. **Anti-pattern:**
  a runway/balance number standing in for production capacity. **Reuse:** MG, BR.

## Q. Reconstruct from the signed ledger; do not add persistence — **BR**

- **Lesson:** the D-11/D-12 signed ledger (per-kind, per-`productionId`) plus `theatricalRuns`,
  `careerEvents`, and `contracts` already hold everything a run recap needs. Starting cash falls out
  of the reconciliation invariant (`cash − Σledger = INITIAL_CASH`); per-film commitment is a ledger
  group; per-film contribution reconciles to the total by construction.
- **Resolution:** proved sufficiency with a field-by-field source matrix before writing code — no new
  core field, no save-version bump.
- **Fastest diagnostic:** before adding a field, write the source matrix and try to derive the value
  from existing records; add persistence only when a value is provably unreconstructable.
- **Pattern:** derive-don't-store for read-models. **Anti-pattern:** persisting a recap snapshot to
  avoid ordinary selector cost (measured at ~0.07 ms/derivation — persistence would be pure debt).
  **Reuse:** BR.

## R. Keep finance rules in the pure core, not the UI — **P, BR**

- **Lesson:** the recap's money math lives in `src/core/studioRunRecap.ts` (pure, node-tested) and
  reuses `economyView`; the React screen only formats. This preserves the Engine/presentation
  boundary (the sim never reads the recap) and mirrors the D-14 rule that the UI never computes
  progression.
- **Anti-pattern avoided:** a UI-owned recap that duplicates the contribution/runway/affordability
  formulas and drifts from the engine.
- **Fastest diagnostic:** grep the screen for any arithmetic beyond formatting; business rules should
  resolve to a single core selector. **Reuse:** P (Studio boundary), BR (pattern).

## S. Break-even is a distinct player category — **MG, BR** (from the bounded revision)

- **Symptom:** a film with +$8,334 contribution on a $10.92M commitment (≈0.076%, ROI rounds to 0%) was
  labelled **Profit**, which reads as a success during ordinary play.
- **Root cause:** a strict `>0 / <0` split treats any technically-positive value as profit; economic
  negligibility was not modelled.
- **Why safeguards missed it:** the number was correct; nothing checked whether the *label* was
  meaningful.
- **Correction:** Break-even band `|contribution| ≤ max($25k, 1% × committed cost)` (documented,
  exported as `classifyContribution`); Week 86 → 3 profit / 1 break-even / 5 loss. Contribution/ROI
  values unchanged.
- **Coverage:** core tests on `classifyContribution` (near-zero, sub-floor, meaningful ±) + the Week 86
  3/1/5 acceptance.
- **Fastest diagnostic:** sort the slate by |contribution/commitment| and eyeball the near-zero tail.
- **Pattern:** classify economic outcomes by materiality, not sign. **Anti-pattern:** framing rounded-0%
  as success. Extends **P**. **Reuse:** MG, BR.

## T. Timeline semantics must be explicit — **BR** (from the bounded revision)

- **Symptom:** starting cash showed $20M, but the weekly table's "Week 0" row showed ~$9.04M and "Key
  Moments" claimed cash peaked at Week 0 — three different meanings collided on one label.
- **Root cause:** the opening balance (pre-commitment) and the end-of-week-0 close (post-ledger) were
  both rendered as "Week 0".
- **Correction:** an explicit **Opening balance** point (= `INITIAL_CASH`), end-of-week rows labelled
  **"End of Week N"**, and a `peakCash` inflection emitted only when a close exceeds the opening balance.
- **Coverage:** core tests (opening balance distinct from week-0 close; opening is the peak) + Week 86
  (no false Week-0 peak; Week 54 unaffordability).
- **Fastest diagnostic:** confirm every cash point answers "as of exactly when?" before labelling it.
- **Pattern:** name the observation instant (pre-commitment / post-ledger / end-of-week). **Anti-pattern:**
  an ambiguous shared "Week 0". **Reuse:** BR.

## U. Recaps must synthesize, not dump — **MG, BR** (from the bounded revision)

- **Symptom:** the default view exposed an 86-row weekly cash table — authoritative but spreadsheet-like,
  producing no management insight.
- **Root cause:** raw completeness was treated as the deliverable.
- **Correction:** default to a compact **SVG cash chart** (opening / current / low + accessible text
  equivalent) and a short **Key Moments** list; the full table is collapsed behind "View weekly cash
  data".
- **Coverage:** component + e2e assert the chart renders with an `aria-label`, and the 86-row table's
  `<details>` is closed by default.
- **Fastest diagnostic:** count default-visible rows; if a management screen shows dozens, collapse them.
- **Pattern:** trend + inflections by default, raw detail on demand. **Anti-pattern:** a default data dump.
  Extends **O**. **Reuse:** MG, BR.

## V. A legal action is not a reasonable recovery path — **MG, BR** (from the bounded revision)

- **Symptom:** copy said "a reasonable path exists but is constrained" while cash drained ~$39K/wk with
  no active revenue and contracts (122wk) outlasting the runway (72wk) — too optimistic and partly
  contradictory.
- **Root cause:** "a cheapest legal film is affordable" was conflated with "recovery is credible".
- **Correction:** distinguish **available action** vs **credible recovery**; state that waiting alone
  worsens the position and that contracts cannot be waited out when expiry > runway. New flags
  `waitingAloneWorsens`, `contractsOutliveRunway`; recovery copy narrowed; never promises success.
- **Coverage:** Week 86 asserts `contractsOutliveRunway`, `waitingAloneWorsens`, `recovery=severe`, and
  the reason strings.
- **Fastest diagnostic:** check whether "recovery" language survives the facts (no revenue, burn > 0,
  contracts > runway).
- **Pattern:** separate legality, credibility, and time-horizon. **Anti-pattern:** implying an affordable
  option is a safe plan. Extends **P**. **Reuse:** MG, BR.

## W. Warning hierarchy — **BR** (from the bounded revision)

- **Symptom:** eight identically-styled warning cards read like a log and buried the one decision that
  mattered.
- **Root cause:** no severity/priority; equal visual weight for every observation.
- **Correction:** `RecapWarning { severity: important|caution|observation, priority }`; the screen shows
  the **top 3** and collapses the rest under "More strategic observations"; severity shown as text (not
  colour-only).
- **Coverage:** core (sorted by priority; top = cash-positive/normal-unaffordable) + component/e2e (≤3
  primary; secondary collapsed).
- **Fastest diagnostic:** if everything is a warning, nothing is — cap the primary set.
- **Pattern:** rank + collapse. **Anti-pattern:** a flat wall of equal alerts. **Reuse:** BR.

## X. Format at the read-model/UI boundary — **BR** (from the bounded revision)

- **Symptom:** raw integers (`4422115`, `-4981667`, `39174`) appeared in Key Moments, warning evidence,
  and cash labels.
- **Root cause:** the read-model embedded pre-rounded numbers in prose strings, so the UI could not
  format them.
- **Correction:** the read-model returns **structured numbers** (and inflection *kinds* / warning
  *codes*); the React screen composes every sentence and formats every value with the shared
  `money()`/`signed()` helpers. Internal precision stays raw.
- **Coverage:** component test asserts the rendered text contains **no** 7+ digit raw run.
- **Fastest diagnostic:** grep rendered output for `\d{7,}`; any hit is an unformatted amount.
- **Pattern:** data in the model, formatting in the view. **Anti-pattern:** prose-with-baked-in-numbers
  in a read-model. Extends **R**. **Reuse:** BR.

### Final visual-polish lessons (owner review 3)

## Y. SVG annotations require boundary testing — **BR**

- **Symptom:** a correct "Opening $20.00M" chart label was clipped at the right canvas edge in the
  owner screenshot.
- **Root cause:** the annotation position accounted for the data point but **not the rendered text
  width** (left-anchored text near the right boundary spilled outside the viewBox).
- **Escaped safeguard:** unit tests checked data, not rendered geometry; the value was right, the pixels
  were not.
- **Correction:** reserve right-side padding and **right-align** edge annotations (`text-anchor="end"`
  ending inside the viewBox); position-aware anchor for the low label. No viewport-specific offsets.
- **Regression coverage:** component test (every `<text>` x within `[0, CHART_W]`; opening/current
  end-anchored); e2e bounding-box check that each label sits within the SVG at 1440×900 / 1366×768 /
  1280×720 / 125% zoom.
- **Fastest diagnostic:** capture the chart at every target viewport/zoom and inspect annotations at
  **both** edges; assert label bounding boxes ⊆ the SVG box.
- **Anti-pattern:** positioning text by its data anchor while ignoring string width; per-viewport hard-
  coded nudges. **Reuse:** BR. **Related:** `b91b026`→ polish commit, `out/d15-recap-evidence/`.

## Z. Observation count is not elapsed-time count — **BR**

- **Symptom:** the UI called 86 recorded closing balances "85 weeks", contradicting "Week 86" and the
  86-row detail table.
- **Root cause:** elapsed intervals (85) and recorded observations (86) are both valid but were not
  distinguished in player-facing language.
- **Escaped safeguard:** no test asserted a single consistent temporal convention across chart/caption/
  table/heading.
- **Correction:** name the convention explicitly — **Opening balance** (pre-commitment), **End of Week N**
  (post-ledger close), current **Week 86**; heading "Cash history through Week 86"; caption "86 recorded
  weekly closing balances, end of Week 0 → end of Week 85"; axis "End Wk 0/85"; control "View 86 weekly
  closing balances".
- **Regression coverage:** component (caption wording; no "over N weeks"); Week 86 harness (86 closes;
  Week 0→85; current Week 86).
- **Fastest diagnostic:** for every time count on screen, state whether it's an opening state, an
  end-of-period observation, or the current period — and check they agree.
- **Anti-pattern:** mixing interval counts and observation counts in one view. **Reuse:** BR.

## AA. Player UI must not expose repository paths — **BR**

- **Symptom:** the runtime methodology disclosure printed `docs/D-15-studio-run-recap-phase1.md`.
- **Root cause:** a developer cross-reference leaked into player-facing copy.
- **Escaped safeguard:** no audit for filenames/paths/dev references in owner/player screens.
- **Correction:** removed the path from the UI (the doc + formulas are unchanged); methodology explains
  the figures in plain language only.
- **Regression coverage:** component test asserts the rendered text contains no `docs/`, no `.md`, no
  source filename.
- **Fastest diagnostic:** grep rendered player UI for path/filename/commit/dev-command patterns before
  acceptance.
- **Anti-pattern:** citing repo paths or source files in gameplay UI. **Reuse:** BR.

## AB. Compact status labels require responsive testing — **BR**

- **Symptom:** the **BREAK-EVEN** result pill wrapped at the hyphen in a narrow table cell despite ample
  page width.
- **Root cause:** a hyphenated status label is breakable; the cell was narrow enough to wrap it.
- **Escaped safeguard:** labels weren't tested as indivisible units at target widths/zoom.
- **Correction:** `white-space: nowrap` on every result pill; the film table scrolls inside an
  `overflow-x:auto` container so the page never overflows.
- **Regression coverage:** component (every result pill `white-space: nowrap`); e2e (no horizontal page
  overflow at each viewport + 125% zoom).
- **Fastest diagnostic:** render semantic status labels at the smallest target width and 125% zoom and
  confirm each stays on one line without page overflow.
- **Anti-pattern:** letting a status token wrap at a hyphen; fixing wrap by widening every column.
  **Reuse:** BR.

### Authoritative-actionability lessons (owner review 4)

## AC. Actionability claims must use authoritative action rules — **BR**

- **Symptom:** the owner reported the recap said a film was affordable while they could not make one
  in gameplay.
- **Investigation (authoritative reproduction on the real Week 86 save):** the recap's cheapest value
  ($2,015,391) is in fact **greenlightable** — the real `greenlight()` action **completes** it
  (cash $2,833,923 → $818,532, a production is created). So the recap and the action **already agreed**.
  The true gap was a *definition* one: the recap headlined a **bare-minimum** package (cheapest concept,
  lowest budget, minimum marketing) as "affordable," while a **normally-funded** film ($3,544,173) is
  **not** affordable (short $710,250) — which is what the player experiences.
- **Root cause:** an actionability claim ("you can make a film") was framed around a theoretical corner
  (min-everything), not around a realistic action; and the value was computed by a **parallel formula**
  that *could* have diverged from the action even though it happened not to.
- **Escaped safeguard:** numeric reconciliation validated the estimate internally but nothing compared
  it against the **enabled/blocked** state and cost of the real greenlight action.
- **Correction:** (1) compute the cheapest package by the **same rule** the action charges
  (`totalCommittedCost` components; grouped bit-identically to `requiredNegative`), so the recap's
  all-in equals the action's to the cent; (2) add an **action-parity invariant** —
  `recap affordability == greenlight() affordability` and `recap all-in == the real cash deduction` —
  tested at exact-boundary, $1-short, and marketing-shortfall states; (3) distinguish three questions:
  **bare-minimum greenlightable package** (affordable), a **standard-budget film** (unaffordable), and a
  **recent-typical film** (unaffordable), with an all-in breakdown; (4) honest labels + recovery/warnings
  that headline "no *normally-funded* film is affordable" — never the false "no package is affordable."
- **Regression coverage:** `recap-parity.test.ts` (cost + affordability + completion parity); core
  bare-minimum-vs-standard tests; Week-86 harness (bare-minimum greenlightable, standard short $710k).
- **Fastest diagnostic:** load the same save, build the recap's claimed package, run the real action on a
  **clone**, and compare the enabled state, the reason, and the exact deduction.
- **Anti-pattern:** a plausible estimate labeled as actionable truth; a summary that claims "you can do X"
  using different rules than the action that performs X. **Reuse:** BR.
- **Related:** reproduction `out/d15-recap-week86/reproduce.mts`; `src/core/studioRunRecap.ts`
  (`cheapestPackage`/`standardPackage`); `ui/src/engine/recap-parity.test.ts`.

## Q (amended). Reconstruct authoritative behavior — not a competing approximation

Reconstruction from authoritative records (Lesson **Q**) is appropriate **only when it reconstructs the
authoritative behavior**. When a reconstructed value drives an **actionability** claim, it must use the
exact same rules as the action (see **AC**) and be **parity-tested** — a self-consistent approximation
that merely *looks* right is not sufficient.

## AD. Base need, minimum package, and normal budget are different values — **MG, BR**

- **Task/defect:** owner-facing reconciliation of several valid-but-differently-scoped production costs.
- **Symptom:** the player saw a concept card showing a **$3.14M base production need** while the recap
  said a ~**$2.02M** package was affordable — creating the impression the recap was wrong.
- **Root cause:** the UI exposed several valid but differently-scoped financial values without making
  their relationship obvious: concept **base production need**; **minimum configured** production
  commitment (0.75× of demand); **minimum marketing**; the **final all-in** greenlight package;
  the **standard-budget** package; the **recent-typical** package.
- **Why earlier safeguards missed it:** action parity verified the final all-in package, but the
  owner-facing relationship between the concept-card number and the recap number had not been tested
  through an actual **human gameplay path**.
- **Resolution:** the authoritative greenlight action *and* the owner's own gameplay confirmed the
  bare-minimum package was affordable (greenlight succeeded, cash $2.83M → $818K). The recap distinguishes
  **bare-minimum**, **standard-budget**, and **recent-typical** affordability, with a component breakdown
  (production + minimum marketing + fees) in Current Position.
- **Regression/verification coverage:** action-parity tests (`recap-parity.test.ts`); the real Week 86
  SaveFile harness (`out/d15-recap-week86/check.mts`, 38/38); the reproduction
  (`out/d15-recap-week86/reproduce.mts`); the actual owner greenlight confirmation; the Current-Position
  component breakdown.
- **Fastest future diagnostic:** (1) load the same save; (2) note the concept-card base need; (3)
  configure the minimum valid package; (4) inspect production/marketing/fee components; (5) compare the
  action preview with the recap; (6) execute the action on a **cloned** state or an owner-approved run.
- **Reusable pattern:** every displayed cost must state its **scope and lifecycle stage**.
- **Anti-pattern:** displaying multiple valid costs as though they answer the same question.
- **Reuse classification:** reusable for future management games; broadly reusable across simulations and
  transactional applications.
- **Related:** `docs/D-15-studio-run-recap-closure.md`; `d90c45d`; `ui/src/engine/recap-parity.test.ts`;
  `out/d15-recap-week86-evidence/`.

---

# D1-A — Concept A Ordinary-Player Enablement — FINALIZED (merged, closed)

> Owner-accepted and merged (merge `cf9758f`, tag `d1a-concept-a-player-enablement`), from
> `main` at `966ae6e`, candidate `0c6ff3d` on branch `art-d1a-concept-a-player-enablement`.
> Concept A — Golden Age Deco became the **default player-facing identity**; the development-review
> tooling stayed **default OFF**; approved visuals and every Engine contract were unchanged.
> Related: `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT-CLOSURE.md`,
> `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT.md`, `docs/art/D1-A-CLOSURE.md` (the earlier,
> preserved default-OFF proof closure).

## AE. Separate content-enablement from review-tooling in a visual proof — **BR, MG, P**

- **Task/defect:** Concept A — Golden Age Deco was visually approved for ordinary players, but the
  approved presentation could not be shown to a player without also enabling the development review
  interface (mode selector, performance panel, Hide/restore pill).
- **Problem:** the approved visual concept was **coupled to its development-review flag**.
- **Root cause:** proof rendering and review chrome shared **one boolean branch point** — a single
  `studioLotIdentityProofEnabled()` in `StudioLotScreen.tsx` gated *both* whether the scene rendered
  Concept A (`setIdentityMode`) *and* whether the review controls rendered.
- **Why earlier safeguards missed it:** the D1-A default-OFF core-slice review deliberately deferred
  ordinary-player enablement, so nobody had exercised a *player* path — every capture used the review
  harness. The one flag correctly protected `main`; it just wore two hats.
- **Successful correction:** split into two independent capabilities — a player-facing identity
  **content** gate (`studioLotIdentityEnabled()`, default ON, no chrome, env/LS rollback to baseline)
  distinct from the development-review **tooling** gate (`studioLotIdentityProofEnabled()`, default
  OFF). One `effectiveIdentity` derivation drives the scene for both; the chrome render gates stay on
  the dev flag. No `StudioLotSnapshot`/`GameState`/renderer/navigation/visual change.
- **Proof OFF must restore ordinary play, not a remembered review state:** `effectiveIdentity` is
  **derived per render from the two flags**, never stored, so a reviewer's temporary `baseline` /
  `fallback` / `reduced` selection cannot survive turning the dev flag off. Turning review tooling off
  returns the player to Concept A; nothing about the review session persists to `GameState`,
  `StudioLotSnapshot`, or `SaveFile`. A review mode kept in persisted state would have reintroduced the
  same coupling by another route.
- **Why the original proof was still valuable:** the default-OFF core-slice review protected `main`
  while the visual direction was evaluated and revised (labels → building-mounted landmarks) before any
  player exposure — the enablement was a small, reversible wiring change on a proven concept.
- **What failed:** treating the proof flag as **both** the content gate and the review-interface gate.
- **Evidence:** the ordinary-player review proved Concept A visually ready but identified the structural
  chrome leak; the enablement branch's `player-enablement.spec.ts` captures now show Concept A with zero
  review chrome (and a hidden-overlay proof that still leaked an `Identity review ▸` restore pill is
  what a genuine player-clean view must NOT contain).
- **Regression/verification coverage:** `ui/src/flags.test.ts` (player default ON, rollback, key
  separation); `StudioLotIdentityReview.test.tsx` (player Concept A + no chrome, rollback → baseline,
  dev-flag toggle-back leaves no stale mode); `ui/e2e/player-enablement.spec.ts` (14 player-clean
  captures + dev-review-on/off). Full: 1030 unit / 65 Playwright / build / clean console / disposal.
- **Fastest future diagnostic:** for any "show the approved art to players" ask, grep for the flag that
  gates the *content* and confirm it is NOT the same boolean that gates the *review UI*.
- **Management-camera result:** the primary hierarchy (Gate, Stage A/B, Theater) remained legible from
  1920×1080 through 1280×720 and at 125% zoom in ordinary play — the accepted hierarchy held.
- **Most decision-useful evidence:** clean **matched baseline-vs-Concept-A** captures per viewport, and
  the **1280×720 Theater-release** case (smallest-viewport marquee legibility limit).
- **Pattern (reusable rule — BR, MG):** any visual proof intended for later production adoption must
  have **separate content-enablement and review-tooling controls from the start**; keep a default-OFF
  proof gate during experimentation, but design the approved presentation so it can graduate into
  ordinary play **without carrying development chrome**. A hidden review bar that still leaves a restore
  pill is **not** a genuine player-clean view.
- **Anti-pattern:** welding player-facing content to debug selectors, performance panels, fixture
  controls, or review overlays (one flag driving both content and chrome).
- **Recurrence — Stage A H2 runtime proof (Aug 2026), a NEW surface for the same rule.** The
  doctrine above ("a hidden review bar that still leaves a restore pill is **not** a genuine
  player-clean view") was written about *player enablement*. It recurred in **evidence capture**:
  7 of 24 Stage A H2 runtime frames — including **all four masked frames whose only purpose is to
  be shown to a blind reviewer** — carried the `Identity review ▸` pill, because `.lot-review-show`
  is `position:absolute` **over** the canvas and a Playwright element screenshot of `.lot-canvas`
  captures whatever is painted on top of it. Clicking `lot-review-hide` hides the *bar* and creates
  the *pill*, so the very act of cleaning the frame contaminated it. **The generalisation:** the
  content/chrome split must also hold at the *capture* boundary — "no chrome in the DOM subtree I
  screenshotted" is not the same claim as "no chrome in the pixels I captured", and only the second
  one matters to a reviewer. **Fastest diagnostic:** sample a fixed corner crop of every frame in a
  package and compare stddev across the set — contaminated frames separated cleanly here (≈13.55 vs
  ≈0.5), which is faster and more reliable than eyeballing 24 images. **Correction:** suppressed in
  the capture harness only (`openLot()` injects `.lot-review-show{display:none!important}`), never
  in product code — hiding dev chrome must not become a reason to change what players see; the
  7 frames were re-captured and the originals preserved as
  `out/stage-a-h2-evidence-superseded-review-chrome/` rather than silently overwritten.
- **Adoption completes the split: a proof flag that becomes production content must be
  REPLACED, not re-polarised** (Stage A adoption, Aug 2026). AE's rule is "separate
  content-enablement from review-tooling **from the start**". Adoption is where that debt comes
  due, because the polarity inverts: a proof is default-OFF and opt-in; adopted content is
  default-ON with an opt-out rollback. Flipping the *meaning* of
  `studioLotStageAH2Enabled()` while keeping the *name* would have left a flag reading "H2 proof
  enabled" whose **absence also loads H2** — the reader has no way to know which era they are
  in. It was replaced wholesale with `studioLotAuthoredStageAEnabled()`, key, env var and setter
  together, character-for-character matching the sibling Stage B function that had already
  solved the same problem. **Rule:** when a proof graduates, rename the flag in the same commit
  that inverts it, and copy the shape of the building that shipped before you rather than
  inventing a second convention. **Anti-pattern:** two authored buildings with two different
  flag idioms; a "generalised authored-building framework" invented at n = 2 to avoid the
  duplication — two sibling functions are cheaper to read than one abstraction.
- **Third instance of the capture boundary, and the cheapest one to miss.** The adoption
  "selected" frame was captured by a helper that closes the details panel first — and closing it
  also calls `clearSelection()`, so the reviewer was handed an ordinary frame *labelled*
  "selected". It was a reviewer, not a test, who caught it. **Rule:** an evidence frame whose
  name asserts a STATE must be diffed against the same frame without that state before it is
  shown to anyone; if the delta is ~0, the capture is lying. Cheap to automate, and it would
  also have caught the review-chrome leak above.
- **Reuse classification:** **P** (Project: Studio implementation history above) · **BR / MG** (the
  reusable cross-project Art/UI pipeline rule: split content-enablement from review-tooling from day
  one). These are recorded together but are distinct — the P history is the specific fix; the BR/MG
  rule is what future games/projects should carry forward.
- **Related:** closure `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT-CLOSURE.md`; implementation record
  `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT.md`; `docs/art/D1-A-CLOSURE.md` (original default-OFF
  closure, **preserved unmodified**); implementation commit `33e1568`; documentation-count correction
  `0c6ff3d`; merge `cf9758f`; tag `d1a-concept-a-player-enablement`; branch
  `art-d1a-concept-a-player-enablement`; `ui/src/flags.ts`; `ui/src/lot/StudioLotScreen.tsx`; tests
  `ui/src/flags.test.ts`, `ui/src/lot/StudioLotIdentityReview.test.tsx`,
  `ui/src/lot/StudioLotScreen.test.tsx`, `ui/e2e/player-enablement.spec.ts`; Lessons **A**, **B**,
  **D** (this extends D's gate-separation from three *decisions* to two *flags*) and **AF** (the
  scope-count correction found during this milestone's review).

## AF. Durable scope counts must match Git, not a subset — **BR, MG, P**

Extends Lesson **E** (generate counts from tooling) with the failure mode E did not cover: the count
*was* generated from real files, but from the **wrong set**. E says "don't type numbers from memory";
AF says "even a correct subset count is wrong if the prose calls it the total."

- **Task/defect:** the durable Concept A enablement record stated that "only the 6 files above
  changed," while `git diff --name-only 966ae6e...0c6ff3d` reported **nine**.
- **Observable symptom:** a merge-review scope claim that disagreed with Git — a reader reconciling
  the document against the repository would find three unaccounted files.
- **Root cause:** the document counted the **code/test/spec subset** (the files a technical reviewer
  cares about) but described it as the **entire commit**. The branch also changed three documentation
  files, which the prose silently excluded from its own total.
- **Why safeguards missed it:** the technical scope list itself was accurate and complete for its
  purpose, and tests/build were green. Nothing distinguishes a *correct subset* from a *claimed
  total*, and no check compares prose counts to `git diff`. Lesson **E** had already been applied —
  the number came from files, not memory — so the existing safeguard read as satisfied.
- **Recurrence:** this is the **second** changed-file count drift on D1-A work. The first was the
  **18-versus-21** discrepancy corrected at `8e40ebf` (Lesson **E**). Different mechanism, same
  owner-facing consequence: a durable scope claim that Git contradicts. Two occurrences make this a
  pattern, not an incident.
- **Resolution:** state both explicitly and label the subset as a subset — **six code/test/spec
  files**, **three documentation files**, **nine files total**. Corrected documentation-only in
  `0c6ff3d`; the six-file technical list was preserved and re-headed as the code subset.
- **Regression / verification coverage:** at every closure, (1) compare each durable scope claim
  against `git diff --name-only <base>...<candidate>`; (2) compare the staged file list against the
  committed file list before committing; (3) count technical and documentation files separately;
  (4) include the exact full total in closure verification, not only the technically interesting
  files. Applied here: the merge, closure, and HANDOFF all state nine.
- **Fastest future diagnostic:**

  ```sh
  git diff --name-only <base>..<candidate>     # full total
  git show --name-only --format= <commit>      # per-commit total
  ```

  Then read every changed-file sentence in the durable docs and check each against that output.
- **Reusable pattern:** when documenting a subset, **label it as a subset** and state the full Git
  total separately — "six code/test/spec files and three documentation files; nine total." One
  sentence carries both the reviewer's view and the repository's view, and they cannot drift apart
  unnoticed.
- **Anti-pattern:** using the technically relevant file count as though it were the whole commit —
  and, more generally, quoting any count whose *scope* is left implicit.
- **Reuse classification:** **BR** — broadly reusable across repositories, release reviews, audit and
  compliance documentation, and any record where a stated scope is later checked against a tool ·
  **MG** — future management games · **P** — the Project: Studio history above.
- **Related:** Lesson **E** (18→21 drift, `8e40ebf`) and Lesson **J** (documentation-only correction
  discipline); correction commit `0c6ff3d`; `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT.md` §6 and §7;
  `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT-CLOSURE.md` §9; `docs/art/D1-A-CLOSURE.md` §7 (the
  earlier count correction).

---

# Asset Lab character track — 05H / 05I — CLOSED (builds rejected; human-artist handoff active)

Context: the Asset Lab character work lives in a **separate repository**
(`/Users/bruce/Project Studio - Asset Lab`, remote `backup`) and has **never** entered production `main`.
Owner ruling: the **05H provenance and the authored-base workflow are accepted** as technical and pipeline
research (accepted provenance and accepted technical workflow are **not** visual approval); the **05H visual
character build is rejected** as a production character; **05I** was the **one authorized bounded corrective
milestone**, containing **two owner-reviewed iterations** (Iteration 1 and Iteration 2) — the limit set by the
05I brief — and is **rejected as a production character foundation**. The unresolved major work is the
**human-scale face and cranial form**, **body mass and proportions**, **hand / wrist / forearm topology**, **the
skin-weighting chain that drives their deformation**, and the **concrete close-range defects already enumerated
in the handoff** (residual boot toe seam, close-range neck fold, close-range facial lumpiness, vest V-opening).
The failure is **localized**: the rig as a whole and the animation system as a whole are **not written off** —
though the **hand-chain weighting is itself a blocking defect**, and rig compatibility and manual weight
painting remain live gates. **No further autonomous or procedural character iteration is authorized**, and
autonomous procedural correction has stopped; a qualified human **character artist** and a **rigging /
weight-paint specialist** are required; **character production and Studio Lot integration remain
unauthorized**; **D1-B remains unstarted and separately governed**. *(**SUPERSEDED CURRENT-STATUS NOTE** —
at the time of this entry D1-B was unstarted. Current status is governed by the D1-B status banner in
[`docs/HANDOFF.md`](HANDOFF.md) and by Lesson **AT**: D1-B has since started **only** through the bounded
Soundstage Composer Proof, and broader D1-B remains unauthorized. Nothing else in this entry changes —
D1-B still does **not** include characters.)*

Current governing authority — the handoff packet, **merged and published** on its Asset Lab branch
(fast-forward; remote `backup`, local/remote parity) and **not** merged into production `main`:
`asset-lab-character-human-artist-handoff` @ `66b44b28d04b2fe0a1cf81abd8153ad0d2c3b1a8`
(packet **CHH-2026-08-07-R2**, revision date **2026-08-07**, packet-content SHA-256
`dbe7c8c31d80ae1218c8a01fe6326a37eb20511274d2e42eb32bd70d2fd9869e`). **R2 is complete, independently
reviewed, and merged by fast-forward into that governing branch** — not pending, deferred or unmerged. The
packet's in-document *"Supersedes Git tip"* field correctly records `7603b2f`; that is a **historical**
field and **not** the current governing branch tip.
Historical checkpoints, all at local/remote parity in one linear chain:
`asset-lab-05h-authored-base-character-proof` @ `9e3c5d7bda39f069b7dac04624584c4fea645332` →
`asset-lab-05h-final-owner-review-package` @ `ddfd69fbc22be313f9dbb548c2b16032c9802daa` →
`asset-lab-05i-corrective-character-pass` @ `8903b1e8bbbc166aa1b74a33167aea964502a1f6` →
`c9445ce55b5d83cc29def9928aec75fa4edd50ed` — the **pre-ruling checkpoint** on that branch, superseded on
current commissioning and production status → `e5a4931` — the **fifth** commit of the reconciliation chain, a
historical intermediate state → `9c0466d` — the **sixth** commit of that chain and a former branch tip, now
**historical and superseded** → `7603b2f` — the **R1 tip** (packet **CHH-2026-08-06-R1**, revision date
**2026-08-06**, digest `013b5b050d9f70698b74ec54e6c181818994c98729cdeb725e54686e9aa2a614`), now
**historical and superseded** as the governing tip → **`asset-lab-character-human-artist-handoff` @
`66b44b2`** (current branch tip; the R2 source branch `docs/character-handoff-packet-r2` points at the same
commit). Related (Asset Lab repo): `docs/ASSET-LAB-05H-FINAL-OWNER-REVIEW.md`,
`docs/ASSET-LAB-05H-FINAL-ART-PM-RECOMMENDATION.md`, `docs/ASSET-LAB-05H-MANAGEMENT-CAMERA-ASSESSMENT.md`,
`docs/ASSET-LAB-05I-FINAL-REPORT.md` (**preserved; its readiness language is superseded**),
`docs/handoff/*` **@ `66b44b2`** (the packet lives on the handoff branch — it is **not** present in the 05I
checkout), `tools/validate-handoff-packet.mjs` (**the committed R2 packet validator — Asset Lab only; it is
not present on production `main`**), `licenses/asset-lab-05h/PROVENANCE.json`.

## AG. A proof branch preserves history, not a runnable review environment — **P, BR**

- **Task/defect:** an authorized 05H owner visual + real-GPU review was **closed without review setup**.
- **Symptom:** the proof branch tip was exactly the expected candidate and the tree was clean, yet the
  proof could not be inspected — **no worktree was checked out to it**, and the repository's single
  worktree held a later milestone (05I) that the review was forbidden to displace.
- **Root cause:** milestone closure recorded the *commit*, never the *environment*. A SHA proves what the
  artifact was; it does not make the artifact runnable.
- **Why safeguards missed it:** branch-tip, parity, cleanliness and ancestry checks all passed. Nothing
  asserts that an inspectable checkout exists.
- **Resolution / coverage:** at every visual-proof closure, record **the exact review worktree path** or a
  **reproducible worktree-creation command**, and state whether creating one is pre-authorized.
- **Fastest diagnostic:** `git worktree list --porcelain` **before** promising a review; confirm a worktree
  is attached to the branch under review.
- **Pattern:** close a visual proof with branch + SHA **+ how to stand it up**. **Anti-pattern:** treating a
  preserved branch tip as a preserved review environment. **Reuse:** P, BR.

## AH. A later "owner-review package" must be diff-verified — it may carry runtime code — **P, BR**

Extends Lesson **J** (documentation-only correction discipline) to the case J did not cover: a follow-on
labelled as a review package that is **not** documentation-only.

- **Symptom:** the commits after the 05H technical candidate were expected to be documentation. `ed97e78`
  is code — it adds the **fixed-isometric management camera and review tooling**
  (`src/App.tsx`, `src/camera/CameraController.tsx`, `src/components/reviewHarness.tsx`,
  `src/lab/LabContext.tsx`, `src/lab/cameraBridge.ts`, `src/ui/DevPanel.tsx`, plus capture/perf/validate
  tools and a sprite asset). `0acb471` is evidence; only `ddfd69f` is docs-only.
- **Consequence:** the named "technical-completion candidate" **cannot produce** the management-camera review
  state the review itself requires — two defensible review bases exist where the record names one.
- **Fastest diagnostic:** `git show --name-status --format= <commit>` on every commit between the named
  candidate and the package tip; assert docs-only before accepting the label.
- **Pattern:** verify the docs-only claim by delta, per commit. **Anti-pattern:** trusting "review package"
  to mean prose. **Related:** Lesson **J**. **Reuse:** P, BR.

## AI. The management camera concealed defects that were blocker-grade at human scale — **P, MG**

The counterpart to Lesson **B**. B says judge Studio Lot visuals **at** the management camera; AI says the
management camera must not be the **only** distance a character is judged at.

- **Symptom:** at default management framing 05H and 05G were **imperceptibly different** — 05G's brighter
  hats actually read *better* — while human-scale inspection found blocker-grade failures: a ~510-vertex
  hi-vis vest rendering as torn scraps, boots whose geometry did not cover the foot (the worker rendered
  barefoot), a skin-tight shirt reading as a nude torso, and a 112-vertex open-scalp hard hat.
- **Root cause:** the framing that made the crew "read" is exactly the framing that hides close-range defects.
- **Fastest diagnostic:** for any character asset, capture **both** management distance and human-scale
  close-ups before any verdict; if the two disagree, the close range governs the asset verdict.
- **Pattern:** distance-paired character evidence. **Anti-pattern:** letting a flattering camera stand in for
  a human-scale ruling. **Related:** Lesson **B**, **AL**. **Reuse:** P, MG.
- **The converse, measured — an OFFLINE class-legibility PASS does not predict a RUNTIME one**
  (Stage A H2, Aug 2026). AI above is "the flattering camera hid a defect." This is the opposite
  direction: **the isolated render flattered, and the management camera exposed it.** The same blind
  question — *what kind of building is this?* — was asked twice, on the same pixels, with the answers
  near-mirrored:

  | Blind review | Authored H2 | Procedural control |
  |---|---|---|
  | Offline, judged on the 512×368 render | **"a sound stage" — 80%** | "warehouse / scenery shed" — 35% |
  | Runtime, judged in the lot at management distance | "warehouse / office block" — **38%** | **"sound stage" — 72%** |

  The variable was not the art; it was the **viewing condition**. Offline, the reviewer named the
  recessed elephant-door bay as the class signal. At management distance that bay reduces to a few
  pixels of shadow and stops carrying, leaving a flat-parapet box that reads as generic utility —
  while the procedural building's single oversized bright door survives the distance and keeps
  saying "stage". **Rule:** class legibility must be re-asked at the *runtime* camera before an
  authored building is treated as class-legible; an offline gate settles the art, not the read.
  **Fastest diagnostic:** ask the unprompted building-type question with a *procedural control in
  the same frame* — the control is what turns "38%" from a soft number into a regression.
  **Anti-pattern:** carrying an offline legibility PASS forward as if the runtime gate had asked it.
  **Related:** **B**, **AX**, **AL**. **Reuse:** MG, BR.
- **And the rule is ACTIONABLE, not just diagnostic — the same measurement closed it.** One bounded
  correction aimed squarely at the management camera reversed the result: authored H2 went from
  38 % "warehouse / office block" to **75 % "sound stage / production stage"**, with a fresh
  reviewer naming the production-scale opening itself as the class signal, while the procedural
  control fell from 72 % to 35 % — the two buildings swapped places on every axis, which is what
  distinguishes a real reversal from scoring drift. The correction was **form, scale and value, not
  detail**: the door became a void at 0.392 of the lit wall inside a 0.292 jamb (it had been a
  *shaded panel* at 0.67), grew +43 % in area, and three stacked horizontal bars merged into one
  lintel. Nothing was added; contrast and hierarchy were. **Rule:** when a class signal dies at the
  management camera, fix the VALUE HIERARCHY and the SIZE of the primary form before adding any
  detail — detail is what died first. **Corollary for the buff/value contract:** door and glazing
  corrections rode entirely on the `stageDoor`/glass vocabulary via the lot's own `dull()`, so the
  wall family and both measurement windows were untouched and the governed ratios came back
  **bit-identical** (0.8655 / 0.8638). Contrast work does not have to cost a value contract.

## AJ. Repeated autonomous procedural correction was not an efficient path — **P, MG**

- **Evidence:** 05I ran two authorized corrective iterations. It **did** land garments, hard hat, boots,
  proportional slimming, LODs, materials and a console-error-free runtime — but every procedural push at the
  **face** either left it heavy and lumpy or, pushed harder, produced a melting-fold result *worse* than 05H
  (recorded and reverted), and the **hands/wrists/forearms** collapsed into "wax-drip" tendrils across all six
  clips because deterministic inverse-distance skinning cannot hold finger and wrist volume under animation —
  independent of the muscularity settings, and aggravated by decimation.
- **Root cause:** face appeal, anatomy, garment fit, hand topology and deformation are **judgment** problems,
  not parameter-search problems. Iterating a generator cannot converge on them.
- **Fastest diagnostic:** if two bounded corrective passes leave the same defect class, the defect is a
  specialist problem, not a tuning problem.
- **Pattern:** cap procedural correction at a stated iteration budget and reclassify on failure.
  **Anti-pattern:** a third autonomous pass at a defect the first two could not move. **Reuse:** P, MG.

## AK. The human-artist handoff supersedes further autonomous iteration — **P**

- **Resolution:** `asset-lab-character-human-artist-handoff` @ `66b44b2` is the character-track artifact — 8
  packet documents (plus, as of R2, the committed packet validator and its two npm scripts, which live on the
  Asset Lab branch and **not** on production `main`): artist brief, technical contract (65-joint skeleton, bone names,
  orientation, scale, ground, the six accepted clips — supplied by a **locally provisioned, gitignored** rig
  library, not by the repository — and GLB/LOD/material conventions), annotated known defects with exact
  evidence paths, acceptance tests structured as **fourteen staged gates**, scope of work with non-goals,
  source and CC0 provenance chain, export/runtime guide, evidence index.
- **Which packet governs:** the `c9445ce` package is the **pre-ruling checkpoint**, and `9c0466d` and
  `7603b2f` are **superseded former branch tips**. All are **superseded on current commissioning and
  production status** by `asset-lab-character-human-artist-handoff` @
  `66b44b28d04b2fe0a1cf81abd8153ad0d2c3b1a8` (packet **CHH-2026-08-07-R2**, digest `dbe7c8c3…`), which
  **governs**. See Lesson **AS** for the rule on propagation and supersession.
- **Standing status:** commissioning is **not** authorized; character production is **not** authorized;
  character integration is **not** authorized; role-wide propagation is **not** authorized; **Gate 14 is
  conditional, separately authorized, and not authorized**; D1-B remains unstarted and unauthorized; Asset Lab
  character work remains separate from production `main`. **R2 completed the packet's governance hardening —
  it changed no ruling and authorized nothing.** *(**SUPERSEDED CURRENT-STATUS NOTE**, D1-B clause only — at
  the time of this entry D1-B was unstarted. Current status is governed by the D1-B status banner in
  [`docs/HANDOFF.md`](HANDOFF.md) and by Lesson **AT**: D1-B has since started **only** through the bounded
  Soundstage Composer Proof, and broader D1-B remains unauthorized. Every other clause in this bullet —
  commissioning, character production, character integration, role-wide propagation and Gate 14 — is
  **unchanged and still current**.)*
- **Fastest diagnostic:** before any character work, read the **active handoff packet at `66b44b2`** and the
  preserved 05I final report (`docs/ASSET-LAB-05I-FINAL-REPORT.md`) first — the latter is retained as history,
  but its readiness language is superseded, as the packet's evidence index records.
- **Anti-pattern:** resuming generator iteration while a specialist handoff is the open artifact; reading the
  pre-ruling `c9445ce` package, or the superseded `e5a4931`, `9c0466d` or `7603b2f` tips, for current
  commissioning or production status. **Reuse:** P.

## AL. Preserve both management-distance and human-scale character evidence — **BR, MG**

- **Lesson:** a character proof needs **both** distances captured and retained; neither substitutes for the
  other. Management distance answers "does this read as a crew?"; human scale answers "is this asset
  acceptable?" A pass at one is not a pass at the other.
- **Fastest diagnostic:** if an evidence package has only close-ups or only management shots, it cannot
  support a verdict — collect the missing distance before ruling.
- **Pattern:** distance-paired evidence as a deliverable. **Anti-pattern:** a single-distance package.
  **Related:** **AI**. **Reuse:** BR, MG.

## AM. Verify material data before concluding a colour defect is a material defect — **BR**

- **Symptom:** 05H's torso, arms and face all read blue; the review initially concluded "blue skin material
  bug" and a review panel relied on it.
- **Root cause of the misdiagnosis:** rendered impression was treated as evidence about the material. The GLB
  material dump is authoritative: `mat_authored_skin` = **#e8b58f warm tan** (correct); the blue torso/arms
  are `mat_h_shirt` **#475c75** on 3,540 vertices — a fitted work shirt; the face's cool cast is the harness's
  cool fill light on tan skin.
- **Resolution:** the finding was **retracted mid-review** and the retraction kept visible in the record.
- **Fastest diagnostic:** dump the GLB/glTF material assignments and read the base colours before attributing
  a perceived colour defect to a material.
- **Pattern:** authoritative asset data over rendered impression. **Anti-pattern:** diagnosing a material from
  a screenshot. **Reuse:** BR.

## AN. An isolation test must remove every known confound — **BR**

- **Symptom:** the skin-tint isolation test (`blender-stills/skin-tint-A-blue-fill` / `-B-white-fill`) changed
  the **fill light** but left a **blue-grey world** in place, so it never isolated the material. Its
  "material is blue" conclusion was withdrawn.
- **Root cause:** one variable was controlled; the remaining confound (world/environment colour) was not.
- **Fastest diagnostic:** list every input that could produce the observed effect — material, light, world,
  post-processing, tone mapping — and neutralise **all but one**.
- **Pattern:** enumerate confounds before designing the test. **Anti-pattern:** a one-variable test in a
  multi-variable environment, and citing its result as proof. **Related:** **AM**. **Reuse:** BR.

## AO. Owner-review guides must be versioned or updated when superseded — **BR**

- **Symptom:** the owner-review guide at the 05H technical candidate describes **Iteration 1 only** and asks
  for a decision that three later commits had already overtaken. A reviewer opening the branch tip reads
  instructions for a state that no longer exists.
- **Fastest diagnostic:** check the guide's date/iteration against the branch tip's; if they disagree, the
  guide is stale.
- **Pattern:** stamp a review guide with the iteration it describes and update it at each closure.
  **Anti-pattern:** a review guide left at a branch tip that documents an earlier state. **Reuse:** BR.

## AP. Do not reopen a superseded proof without reading its final ruling and successors — **BR**

- **Symptom:** an 05H owner review was commissioned for `9e3c5d7` after 05H had already received a five-lane
  Art review returning **"accept the foundation, reject this build"**, after a full corrective milestone (05I)
  had completed, and after the human-artist handoff had been cut. Setting the review up would have presented
  an already-rejected build and displaced the successor's checkout.
- **Fastest diagnostic:** before reopening any proof, list every branch that **contains** its tip
  (`git branch -a --contains <sha>`) and read the newest one's final report first.
- **Pattern:** ruling-then-successors before re-review. **Anti-pattern:** re-reviewing a superseded artifact
  because its SHA is the one on file. **Reuse:** BR.

## AQ. A technically reproducible asset is not necessarily a viable production foundation — **BR, MG**

- **Evidence:** 05H passed its validator (65 joints, correct orientation, height, grounded, no stray island),
  exported a clean 3-step LOD chain, ran console-error-free, and was fully deterministic and reproducible from
  committed source — and was still rejected as a production character on visual grounds.
- **Root cause it addresses:** technical gates measure conformance, not appeal, anatomy, or craft.
- **Fastest diagnostic:** ask what the validator **cannot** see; route that to a human reviewer.
- **Pattern:** separate the technical gate from the art gate and require both. **Anti-pattern:** reading
  "validator PASS" as "production ready" — a validator pass is not acceptance. **Reuse:** BR, MG.

## AR. Stop autonomous iteration when the remaining defects need specialist judgment — **BR, MG**

- **Lesson:** when the open defects require **sculpting, topology, rigging, or weight-paint** judgment, further
  autonomous iteration spends budget without converging. Stop, scope the specialist work precisely, and hand
  off with a technical contract, annotated defects, acceptance tests, and a provenance chain.
- **Evidence:** the 05I final report is unanimous — face and hands are "beyond what the procedural pipeline can
  reach on this CC0 base" — and the handoff package exists precisely so a specialist can execute without
  reverse-engineering the repository.
- **Fastest diagnostic:** name the discipline the fix belongs to. If no automated process owns that discipline,
  hand off.
- **Pattern:** classify the remaining work by discipline before authorising another pass. **Anti-pattern:**
  another generator iteration against a judgment problem. **Related:** **AJ**, **AK**. **Reuse:** BR, MG.

## AS. A status ruling must be propagated, not appended — **BR, MG, P**

Extends Lesson **AK** (the handoff supersedes further autonomous iteration) to the failure AK did not cover:
the handoff package itself can carry the *pre-ruling* premise in every document except the one the ruling was
written into.

- **Task/defect — Project: Studio.** The final Owner ruling on the character track was initially added **only**
  to the lead `docs/handoff/CHARACTER-ARTIST-HANDOFF-BRIEF.md` in the Asset Lab repository. The other seven
  independently distributable handoff documents kept the earlier **"finishing correction, not a redesign"** and
  polish-pass premise.
- **Symptom:** the standalone `CHARACTER-HUMAN-ARTIST-SCOPE-OF-WORK.md` — the document a producer or artist is
  most likely to receive **on its own** — still promised to *"return a production-ready character"* through
  *"a finishing correction"*, and filed body proportions under **"Minor finishing"**. An artist pricing from
  that page would have quoted **minor face-and-hand polish** against a character already **rejected as a
  production foundation**, whose real scope is a face and cranium sculpt, hand/forearm retopology, a manual
  weight-paint pass, garment refitting and a genuine reduction in body mass.
- **Root cause:** a status block protects **only the document containing it**. The ruling was appended to a
  reading order, not propagated through a packet.
- **Why safeguards missed it:** the diff was correct, documentation-only, one file, and factually accurate on
  its own terms. Branch, SHA, parity, ancestry and scope checks all passed. Nothing compared the *new status*
  against the *surrounding commissioning assumptions*.
- **Consequence in the record:** proportion severity, the count of unfinished areas, deformation language and
  review-gate structure were left inconsistent across the package — the ruling named five unresolved areas while
  the same brief still said the pipeline *"cannot finish two things"*, and the acceptance model was still a
  single end-of-job review.
- **Resolution:** the ruling was reconciled through the scope of work, the known-defects record, the acceptance
  tests, the technical contract and the evidence index. At R1, the reconciliation **was merged and published**
  on `asset-lab-character-human-artist-handoff` at `7603b2f234dfdb11ad6a0691315942c4b16cffac` (Asset Lab repo,
  remote `backup`; a fast-forward on that branch — **not** merged into production `main`) — **seven linear
  documentation-only commits** over the complete range `c9445ce..7603b2f` (`074bb80`, `1dcb263`, `b9f57a0`,
  `2967c1c`, `e5a4931`, `9c0466d`, `7603b2f`; `1dcb263` is the **second intermediate commit** of that chain and
  `e5a4931` the **fifth**, neither a final candidate — `e5a4931` was superseded as the branch tip by `9c0466d`,
  which was in turn superseded as the branch tip by `7603b2f`). The **sixth commit is `9c0466d` —
  *docs(handoff): correct D1-A and D1-B status*** (supporting example 3), now **historical**; the **seventh
  commit is `7603b2f` — *docs(handoff): disclose UAL dependency and stamp packet identity***
  (supporting example 4), the **R1 tip**, now likewise **historical**. R1 published packet
  **CHH-2026-08-06-R1** (revision date **2026-08-06**), packet-content SHA-256
  `013b5b050d9f70698b74ec54e6c181818994c98729cdeb725e54686e9aa2a614`. **The current governing commit is
  `66b44b2` and the current packet is CHH-2026-08-07-R2** — see *supporting example 5*, which records the R2
  propagation and the production amendment it forced.
  Across the R1 range (`c9445ce..7603b2f`) **eight** `docs/handoff/*.md` files changed and **0** non-documentation
  files; the D1-A/D1-B correction itself touched **three** of those eight — the brief, the scope of work and
  the evidence index — each an independently distributable document. **No historical 05H or 05I report was
  rewritten** and **no character asset or production code changed**; the evidence index now states that the
  historical reports' status language is superseded. The packet was **published through a linear
  fast-forward**, is **not merged into production `main`**, and **does not authorize execution of the
  commission**.
- **Acceptance restructured — Project: Studio.** The single end-of-job review became **fourteen total staged
  gates**, of which **thirteen are ordinarily required**: art direction and proportion target · face and
  cranial sculpt · body sculpt and silhouette · topology and edge-flow correction · hands, wrists and forearms ·
  garment construction and refit · hair and headwear · rig compatibility · manual weight painting · materials
  and lighting response · animation and deformation · human-scale final review · management-camera final
  review. The **fourteenth — multi-character scalability proof — runs only when separately authorized**, and
  passing the gates does not itself authorize integration. **No fixed loop count is promised or capped**; the
  Owner's planning expectation is that **ten or more total review loops may reasonably occur**, with fewer or
  more depending on the evidence — that is *iteration capacity*, **not** an estimate and **not** a guarantee of
  acceptance after any number of rounds.

Of the supporting examples below, the **first two** surfaced in the same propagation pass. They are not
themselves ruling-propagation failures — they teach the adjacent rule that **a documentation claim must be
verified against the repository**, and they are recorded here because the same pass and the same packet
produced them. The **third, fourth and fifth came from later passes** (`9c0466d`, `7603b2f` and `66b44b2`
respectively) and are **not** covered by that disclaimer: the fourth in particular is **the same failure mode
as this lesson's lede**, and the fifth is where the lede's rule finally had to be applied **across
repositories** — to the production record itself.

**Supporting example 1 — a gitignored dependency described as committed — Project: Studio.** The hard technical
contract called `public/assets/animation/UAL1_Standard.glb` **"the committed rig"**. It is not committed:
`.gitignore` ignores `public/assets/*` and re-includes only `public/assets/studio/`, so that file — and with it
the **43-clip UAL library** it supplies, of which this character uses **six** — is **absent from a clean
checkout**. The **65-joint accounting itself was correct**, and is independently re-derivable from the **three
committed 05I character LOD GLBs** (LOD0/LOD1/LOD2; a fourth tracked file, `_COL.glb`, is a collision proxy and
carries no skeleton); only the **delivery claim attached to it** was false. A sibling packet document
(`CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md`) had **already** described that gitignore behaviour — reviewing each
document *only in isolation*, with no cross-document reconciliation of the same asset's delivery status, is
what allowed the contradiction to survive between them. The correction now distinguishes the **committed
character GLBs and their embedded skeleton** from the **locally provisioned UAL rig and clip library**, and
requires **authorized provisioning and provenance verification** before the rigging and animation gates (as
this correction then stated them, **8 and 11**) may be **marked complete**. The absence gates *acceptance* and
blocks all **six-clip deformation evidence**; it does not block the sculpt, topology and weighting work,
because the skeleton re-derives from the committed GLBs. **That "8 and 11" enumeration under-counted the
affected set and is superseded** — supporting example 4 records the re-derived partition (**5, 8, 9, 11**
cannot pass; **6, 7, 10, 12, 13** cannot close; **1–4** may proceed; **14** conditional).

**Supporting example 2 — evidence stored at the parent path — Project: Studio.** `EVIDENCE-INDEX.md` pointed at
`proof/lab05i/iteration-01/blender/`. **That directory did not exist** — and never has, on any ref. All
**twelve** Iteration-1 Blender renders **did** exist, tracked **directly under** `proof/lab05i/iteration-01/`.
Iteration 2 stores the **same twelve filenames** one level down, in a nested `blender/`. The incorrect pointer
was created by **assuming the two iterations shared the same directory structure** — it was written as a brace
expansion, `{runtime,real-gpu,blender}/`, of which two thirds resolved correctly, which is why it read as
plausible. The corrected index now distinguishes `runtime/`, `real-gpu/`, the **twelve root-level Iteration-1
renders**, and `root-cause/` where relevant. **No evidence file needed to move.**

**Supporting example 3 — a stale status claim about another repository's milestone — Project: Studio.** The
central 05H/05I rejection ruling **had** been propagated correctly through all eight documents. What survived
was a stale **adjacent-milestone** assertion: three packet documents — `CHARACTER-ARTIST-HANDOFF-BRIEF.md`,
`CHARACTER-HUMAN-ARTIST-SCOPE-OF-WORK.md` and `EVIDENCE-INDEX.md` — still said *"D1-A and any subsequent D1-B
Studio Lot character phase remain unstarted and separately governed"*, a single grammatical subject that swept
**D1-A** into **D1-B's** status. **D1-A is owned by the production repository, not by the Asset Lab handoff
branch, and it was already merged, closed and tagged**: `docs/art/D1-A-CLOSURE.md`, merged as `af7c238`,
closed and tagged at `e87c34f` (annotated tag `d1a-studio-identity-package`), with the later ordinary-player
enablement phase closed at `9303560` (tag `d1a-concept-a-player-enablement`). The packet was therefore
**internally consistent and still wrong about an external repository's milestone** — every check that compared
the packet against itself passed, because the claim's referent lived somewhere the packet never looked. The
correction (`9c0466d`) states D1-A as **completed, merged, closed and tagged**, locates its record in the
**production** repository rather than in the handoff branch's history, records that **D1-A did not integrate
this character** and authorized **no** human-artist commissioning, **no** character production and **no**
Studio Lot character integration, and restates D1-B with a **bare subject** — *"D1-B is unstarted and is not
authorized"* — separately governed, not assumed to include characters, with any character integration proposed
under it requiring **separate authorization and acceptance evidence**. **D1-B, by contrast, is genuinely
unstarted and unauthorized**: no D1-B branch, tag or implementation exists in either repository. The
historical reports carrying the old claim — for example `docs/ASSET-LAB-05H-FINAL-ART-PM-RECOMMENDATION.md`,
which reads *"D1-A was not started, not designed, not scaffolded"* — were **superseded by notice, not
rewritten**.

**Supporting example 4 — a priced dependency disclosed only in the technical annex, and a packet with no
revision identity — Project: Studio.** The seventh commit, `7603b2f` (*docs(handoff): disclose UAL dependency
and stamp packet identity*), publishes packet **CHH-2026-08-06-R1**.

*The disclosure defect.* The specialist-facing `CHARACTER-ARTIST-HANDOFF-BRIEF.md`,
`CHARACTER-HUMAN-ARTIST-SCOPE-OF-WORK.md` and `CHARACTER-ACCEPTANCE-TESTS.md` all **required UAL-dependent
work, evidence or acceptance**, but none of them stated clearly enough that the approved dependency —
`public/assets/animation/UAL1_Standard.glb` (Quaternius **Universal Animation Library**, CC0 1.0; the
**65-joint** rig contract and a **43-clip** library of which this track uses **six**) — is **gitignored**,
**absent from a clean checkout**, **not repository-delivered**, and **Owner / authorized-operator
provisioned**. The **technical annexes already carried the correct dependency facts**; the documents a bidder
actually prices from did not. That is a real **schedule and deliverability underbidding risk**, and it is the
same failure mode as the lede of this lesson — a fact correct *somewhere* in the packet is not a fact
disclosed *where it is acted on*.

*The gate-scope defect found by the same pass.* The dependency affects **more gates than the previous
"gates 8 and 11" summary stated**. Re-derived from the actual execution and evidence paths — not copied
forward — and confirmed by primary review:

- **Gates 5, 8, 9, 11 — cannot pass or be marked complete** without approved UAL.
- **Gates 6, 7, 10, 12, 13 — may be prepared and provisionally reviewed, but cannot close** without it
  (six-clip garment and accessory anchoring; and the review harness loads the clip library unconditionally,
  so even the static runtime views cannot be captured).
- **Gates 1–4 — may proceed on Blender-side evidence**: the 65-joint skeleton is embedded in the committed
  character GLBs and independently re-derivable from them.
- **Gate 14 — conditional, separately authorized, and not authorized now.**

R1 also requires a blocked gate to be reported as **`BLOCKED — OWNER-PROVISIONED UAL DEPENDENCY NOT
AVAILABLE`**, so a **client-input block is distinguishable from a specialist failure**. Substitution of a
different rig or animation library is forbidden, as is committing or redistributing the provisioned file.

*The packet-identity defect.* The packet carried **no in-document revision identity**, so a **copied stale
packet was difficult to distinguish from the governing packet**. R1 stamps all eight documents with an
identical block: **packet name · version (`CHH-2026-08-06-R1`) · revision date (`2026-08-06`) · governing
branch · superseded-tip field (`9c0466d`, correct as R1's origin — *not* a statement that `9c0466d` still
governs) · a packet-content digest intended as a reproducible content identity
(`013b5b050d9f70698b74ec54e6c181818994c98729cdeb725e54686e9aa2a614`) · a standalone-currentness warning · an
execution-authorization warning**.

*What R1 deferred to R2 — historical, and all four items now closed.* At R1 the digest was **stable and
identical across all eight documents**, but its **canonical generation/validation method was not published in
governing packet content** and **no committed generator or validator enforced it** (**R2-1**) — a reader given
only the packet could not then re-derive the digest, because the normalization rule was unstated. Carried
forward at R1 and likewise not then fixed: blocked gates were **not yet explicitly forbidden** from being
labelled **FAILED** solely because Owner-provisioned UAL is missing, and providing the UAL was **not yet
stated everywhere** as insufficient by itself to mark a gate **PASSED** (**R2-2**); UAL disclosure coverage in
`CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md` and `CHARACTER-KNOWN-DEFECTS.md` remained an open review item
(**R2-3**); and this lesson was to be updated when R2 finalized (**R2-4**). **R2 is now complete,
independently reviewed, merged by fast-forward into the governing branch, and governing.** Supporting example
5 records how each item closed; this paragraph is retained as the historical statement of what was open at R1.

*Unchanged by R1.* No ruling, gate structure, scope or authorization moved: 05H technical/provenance research
remains **useful**, the 05H **visual build remains rejected**, 05I remains **one bounded corrective milestone**
of **two Owner-reviewed iterations** and remains **rejected as a production foundation** requiring
**substantial specialist correction, not polish**; **D1-A is completed**; **D1-B is unstarted and
unauthorized**; **commissioning, character production and integration all remain unauthorized**.

**Supporting example 5 — the ruling moved again, and the production record had to move with it — Project:
Studio.** This is the lede's failure mode applied **across repositories**. Production documentation recorded
the character handoff as packet **CHH-2026-08-06-R1** @ `7603b2f`, packet-content SHA-256
`013b5b05…`, and described R2 as **deferred**. Asset Lab then **completed R2**: packet
**CHH-2026-08-07-R2** (revision date **2026-08-07**) @ `66b44b2`, packet-content SHA-256
`dbe7c8c3…`, **independently reviewed and merged by fast-forward** into the active governing handoff branch
`asset-lab-character-human-artist-handoff` (`7603b2f..66b44b2`, three linear commits, **no merge commit**).
The moment that landed, **every production sentence that encoded the former current ruling became false** —
the governing tip, the packet version, the digest, the "deferred to R2" statements, the reading order, and the
D1-A closure's character-authority pointer. **Production status documentation therefore had to be amended
everywhere that encoded the former current ruling**, in one governed change, while **historical** references
to `7603b2f`, `9c0466d`, `e5a4931` and `c9445ce` stayed historical.

*R2 outcomes and remaining boundaries.*

- **M1 — RESOLVED.** The final validator architecture draws the line that the earlier design blurred:
  **governed identity metadata** (packet name, version, revision date, governing branch, superseded Git tip,
  the presence of the required identity block and the uniqueness of the digest field) **must pass a complete read-only
  preflight before any update-mode write**, and **repairable derived data** (the digest value itself) may be
  repaired through the sanctioned update path. Canonically: **"Digest values are repairable data; governed
  identity metadata is not."** And: **"Update mode must preflight packet identity before any write, but a
  malformed digest alone must remain repairable through the sanctioned update path."** A failed preflight
  writes **zero** files. The superseded expectation — that a malformed digest alone should fail without
  writing — is **not** revived.
- **Deterministic diagnostics.** Failure-safe governance tooling now provides **deterministic
  filesystem-read diagnostics for the corrected path**: a canonical page that is missing or that exists but
  cannot be read is reported against its **repo-relative** path with the runtime's own errno preserved, and
  machine-specific absolute paths are stripped so the diagnostic does not vary with where the packet root
  happens to live. An unreadable page is never repaired, skipped or recreated.
- **A claimed boundary that matches the implementation.** The **validator wording claims only its canonical
  eight-file enforcement boundary** — it enforces the presence and cross-page agreement of exactly those eight
  paths and defines the digest over exactly those eight and nothing else. It is explicitly **not** an
  allowlist for `docs/handoff/`: an unrelated extra file there is not hashed, not verified and not touched.
- **UAL disclosure.** **R2 closed the two identified direct UAL dependency disclosure gaps in the
  Export/Runtime Guide and Known Defects.** That closure covers **exactly those two pages**; no claim is made
  here about direct UAL disclosure on any other packet page.
- **Gate states.** The packet now carries the governing **PASSED / FAILED / BLOCKED** definitions, with the
  canonical blocked wording **`BLOCKED — OWNER-PROVISIONED UAL DEPENDENCY NOT AVAILABLE`**. **There is no
  fourth state**, and provisioning the UAL removes the block, produces no evidence by itself, marks nothing
  PASSED and authorizes no integration.
- **M2 — non-blocking note, accepted safe under-claiming.** The Export/Runtime Guide's *"what still works
  without UAL"* list does not enumerate the committed Owner-review index and PNG evidence. That under-claims
  in the **safe direction**; it authorizes no unsafe workflow and was correctly **not** treated as an R2
  blocker.
- **How the tooling was exercised.** There is **no committed validator test suite**. **The R2 review
  exercised intentional negative tests against the committed validator.**

*Scope note.* Unlike R1, **R2 is not documentation-only**: it adds `tools/validate-handoff-packet.mjs` and two
`package.json` scripts alongside the eight packet pages. That tooling lives on the **Asset Lab** branch.
**Production `main` does not contain it**, and this record documents the governing Asset Lab artifact rather
than merging or cherry-picking its history — Asset Lab and production remain separate workstream histories.

*Unchanged by R2.* No ruling, gate architecture, scope or authorization moved. The 05H **visual build remains
rejected**; 05I remains **rejected as a production character foundation**; a **qualified human character
artist** and a **rigging / weight-paint specialist** remain required; **current procedural / autonomous
character iteration remains stopped**; **technical reproducibility is still not production viability** and
**management-camera success still does not replace human-scale review**; **commissioning remains
unauthorized**; **character production remains unauthorized**; **integration remains unauthorized**;
**Gate 14 remains conditional, separately authorized, and is not authorized**; **D1-A remains complete** with
Concept A (**Golden Age Deco**) approved and published; **D1-B remains unstarted and unauthorized**. **Handoff
readiness is not production authorization**, and R2's completion does **not** start D1-B.

**Reusable rule (cross-project).** When a ruling changes an asset's **production status, severity, or scope**,
propagate it through **every independently distributable document in the same governed change**. Reconcile:
ledes · status blocks · verbs · defect counts · severity grades · scope estimates · acceptance tests · technical
contracts · review gates · evidence indexes · supersession notices · dependency status · integration
restrictions · tracked-versus-gitignored status · clean-checkout availability · provisioning responsibility ·
provenance requirements · dependency gating · exact evidence-path resolution.

- **A ruling is not fully closed until every current status surface agrees.** Publishing the ruling in its own
  repository is the *start* of the propagation, not the end of it. Enumerate every surface that states the
  **current** status — in **every** repository that routes readers to it — and move them in one governed
  change. A ruling that is correct at its source and stale in the record that points at it is still a stale
  ruling.
- **Historical references should remain historical; current-status references must move together.** Classify
  every hit before touching it: current governing status · historical record · process/lesson history ·
  unrelated. Update only the first. **Do not rewrite historical evidence merely to eliminate an old SHA** —
  and never let a superseded tip survive as the answer to "what governs now".
- Review a handoff as a **packet of standalone documents**, not only as an ordered reading experience — assume
  each page is the only page its reader receives.
- **Propagation review must validate adjacent milestone and dependency claims, not only the central ruling.**
  A packet can be **internally consistent and still be wrong about another repository**. **Cross-repository
  status claims must be checked against the repository that owns the branch, tag, closure record, or
  implementation** — never against the packet's own history, and never against a sibling document that
  inherited the same assumption. Write such claims with a **bare subject per milestone** ("X is closed",
  "Y is unstarted"), never as one predicate shared across two milestones, and **name the repository that owns
  each record** so a standalone reader can verify it.
- Keep **historical reports preserved**, but make current commissioning documents state **when historical
  readiness language is superseded**.
- When substantial **sculpting, topology, rigging, weight-painting or deformation** work remains, structure the
  commission as **repeatable gated review**, not one-shot delivery: separate gates for art direction, face and
  cranial sculpt, body sculpt, topology, hands, garments, headwear, rig compatibility, weight painting,
  materials, animation, human-scale review and management-camera review, each able to approve, reject, or
  require rework, and each able to repeat. Gate any scalability or performance proof **separately**, and do not
  let a full set of passed gates stand in for integration authorization.
- **No fixed loop count should be promised or capped**, and no single pass or fixed iteration count guarantees
  approval. State any loop expectation as *capacity*, never as an estimate.
- **A technical handoff must distinguish tracked artifacts, gitignored local dependencies, externally
  provisioned packages, and generated derivatives.** Never call an asset **committed** or
  **repository-delivered** merely because a standard local path exists. State **who provisions it**, **how
  provenance is verified**, **whether it exists in a clean checkout**, and **which acceptance work is blocked
  until it is available**.
- **Disclose a client-furnished dependency where it is acted on, not only where it is specified.** Every
  client-furnished or locally provisioned dependency that affects what a reader can **price, schedule,
  execute, review, evidence, or accept** must be disclosed **in each independently distributable document
  whose reader can act on it**. **Do not rely on a technical annex being available somewhere else** — the
  annex protects only the reader who happens to hold it.
- **Keep three states distinguishable: blocked, failed, and passed.** A **blocked client dependency** must be
  reportable as a **client-input block** that is neither **failed specialist work** nor **passed acceptance**.
  Give the blocked state an explicit label, and state that **supplying the dependency removes the block but
  passes nothing by itself**.
- **A multi-document governed packet should expose its own identity.** Publish, in every document:
  **packet/version identity**, **revision date**, **governing authority**, and a **reproducible content
  identity** — and keep **live Git-tip verification separate** from it, since a commit cannot embed its own
  future SHA. A content digest is only as useful as its **published, enforced** derivation method; ship the
  generator and validator with it, or record their absence as an open defect.
- **Separate repairable derived values from authoritative metadata.** A governed artifact holds two different
  kinds of field. **Derived values** (digests, checksums, generated indexes) are **data**: they can be
  recomputed, so they are repairable by tooling. **Authoritative metadata** (identity, version, revision date,
  governing authority, supersession) is **a decision**: it can only be changed deliberately, by the owner.
  Decide which is which **before** writing tooling that touches either.
- **Preflight authoritative metadata before mutation.** Any tool that may write must first complete a
  **read-only** pass over the authoritative metadata and abort having written **zero** files if it disagrees.
  Validate everything, then write — never validate-as-you-write, which leaves a half-repaired artifact whose
  state is worse than the one it started from.
- **Integrity-repair tooling must not repair authority metadata.** A tool built to restore a derived value
  must **refuse** to reconcile identity, version or supersession, and must say so when it stops. The moment
  repair tooling can silently rewrite authority, the artifact's identity is only as trustworthy as the last
  automated run — and a **malformed derived value alone must still remain repairable**, or the sanctioned
  repair path is unusable exactly when it is needed.
- **Failure-safe governance tooling requires deterministic diagnostics.** When a governance tool refuses to
  act, its refusal is the entire product: report the failing item by its **canonical, machine-independent**
  identifier, preserve the underlying error, and strip anything that varies with the machine or checkout
  location. Two operators on two machines must get **byte-identical** diagnostics for the same defect, and no
  failure path may escape as an unhandled exception.
- **Documentation must claim only the enforcement boundary actually implemented.** State exactly what a
  validator covers — and, explicitly, what it does not. A tool that enforces a **fixed canonical set** must
  not be described as if it policed the whole directory; over-claimed coverage converts a passing run into
  false assurance, which is worse than having no tool at all.
- **Re-derive affected gate and dependency lists from the actual execution and evidence paths** — never copy a
  prior list forward. A summary list that was right when written is the most plausible-looking way for an
  under-counted scope to survive review.
- **An evidence index must validate the exact path, not merely the presumed directory pattern.** A broken
  pointer does **not** prove the evidence is absent — inspect the **parent and sibling** structures before
  concluding anything is missing. Record the **real** location, and do **not** move historical evidence merely
  to make two iterations look symmetrical.
- A commissioned artist must be able to **estimate the real work from any standalone scope of work**, without
  relying on undocumented context.
- **Fastest diagnostic:** after any status ruling, grep the whole packet for the superseded framing
  (`finishing correction`, `polish pass`, `minor`, `production-ready`, `viable`, `all viable`) and for the
  **old defect count**; then read each commissioning-facing document **in isolation** and ask whether it alone
  would produce a correct estimate. For every asset the packet calls *committed*, confirm it with
  `git ls-tree` against a clean checkout rather than a local path; for every evidence pointer, resolve the
  **exact** path, not the pattern; and for every claim about an **adjacent milestone in another repository**,
  resolve the branch, tag or closure record **in that repository** before accepting it.
- **Pattern:** ruling propagation as part of the ruling commit — every standalone document either carries the
  ruling or prominently references it. **Anti-pattern:** appending a ruling to one lead document while leaving
  contradictory commissioning assumptions elsewhere; leaving "nearly ready", "finishing correction" or "polish
  pass" language in standalone documents after the asset has been rejected; relying on a producer or artist
  reading the packet in a specific order; collapsing sculpt, topology, garments, rigging, weight painting,
  materials, animation, human-scale review and management-camera review into one final gate; promising
  production readiness after one pass. **Related:** **AK**, **AO**, **AQ**, **AR**. **Reuse:** BR, MG, P.

## AT. Separate visual success from economic success — **BR, MG, P**

An experiment can test two hypotheses at once and get two different answers. If they are not scored
separately, the loud one rewrites the quiet one, and a failed business case gets laundered into a
success because the artefact next to it looked good.

- **Task — Project: Studio.** The **D1-B Soundstage Composer Proof**
  (`docs/art/D1-B-SOUNDSTAGE-COMPOSER-PROOF-CLOSURE.md`, branch
  `art-d1b-soundstage-composer-proof`, base `aadbd63d`, adoption **promotion** commit `a7e4847`,
  merged to production `main` at `00dfbe0`) asked whether the
  existing procedural Phaser building system could produce two coherent but genuinely distinct
  soundstages, **and** whether the second one would be materially cheaper to author once a composer
  existed. The visual hypothesis **passed**; the economic hypothesis **failed**.
- **The framing was too large before inspection.** The work was proposed as an "Art Factory" — a
  generalized asset-authoring system with Lot Stamp serialization, a runtime asset pipeline and
  placement tooling. Direct inspection of the production architecture showed most of the supposed
  tooling **already existed**: an iso projection framework, `beginBuilding`/`drawWalls`, three roof
  primitives, stage aprons, `dressStage()`, relative placement, vignette structures, a
  `displayObjects` instrument and a working evidence harness. The authorization was narrowed to a
  parameterized composer over that existing modularity, and **no** new abstraction was built.
- **Measured cost, unrepaired.** Composer parameterization ≈ **7 min**; Stage A re-expression ≈ **0
  incremental** (it reproduced existing art, which is exactly why the foundation looked cheap); Stage
  B initial incremental authoring ≈ **14 min** — roughly **2×** the foundation, against a target of
  *clearly less than half*. The later corrective pass (≈3 min active) was recorded **separately** and
  not used to move either side. These are agent wall-clock with overlapping segments, not human
  labour; they were not aggregated into a precision metric and no project-wide productivity
  percentage was derived.
- **Why the foundation looked cheap:** it only ever encoded one roof form and a plain wall, because
  that is all Stage A needed. Stage B had to author the vocabulary it used. A third stage reusing
  that vocabulary would plausibly be a spec literal — **but that was not tested, and the closure
  refuses to extrapolate it.** Adding a Stage C purely to obtain a friendlier amortization number was
  explicitly forbidden and not done.
- **Signage-masked review was load-bearing.** Each soundstage wears a large `STAGE A` / `STAGE B`
  facade plate. With signage visible, "can you tell them apart?" is not an architectural question at
  all. Masking it also proved the mask had to reach further than the plates — `Soundstage A/B` is
  additionally printed by vignette markers, activity toasts, character cards, the hover label, the
  selection panel and the companion navigation. An independent blind reviewer then returned
  *"genuinely different buildings, ~98%"* and *"same game, ~97%"* on architecture alone.
- **A control path separated pre-existing defects from introduced ones.** Closer review found Stage A's
  barrel roof reading as a flat "bullseye" decal rather than a vault. The content-rollback capture
  showed the identical artifact in the **pre-D1-B baseline**, so it was recorded as
  **PRE-EXISTING** and deliberately **not** folded into the experiment — fixing it would have
  contaminated the controlled comparison and added unrelated authoring cost. The same control
  distinguished "the images differ" from ambient noise: a second capture of the *same* configuration
  differed by more pixels (663) than rollback-vs-default did (353), which is the only reason the
  baseline-equivalence claim meant anything.
- **A bounded corrective pass prevented creep.** Exactly one pass was authorized, scoped to one
  defect: Stage B's sawtooth fascia reading as a black void. It turned out to be a
  **lighting-convention error, not a taste call** — the fascia sits on the elevation `drawWalls`
  treats as lit but was painted with a shadow tone, making it the darkest element on that face. One
  colour value moved to a lit lot-palette tone, and the field was renamed rather than added to, so the
  roof union gained no vocabulary; blind re-review confirmed *"not one dark pixel on the roof itself"*.
  Pass #2 was neither authorized nor taken, and the remaining minor Stage B notes were carried as
  known non-blocking observations.
- **The failed hypothesis still produced adoptable components,** each judged on its own merit: a
  stable presentation-only stage assignment (a real correctness fix), the StageSpec composer (clearer
  representation and testable baking, adopted explicitly *not* for productivity), the Stage B art,
  the `underDressed` treatment, and an independent camera resize-refit bug fix.
- **Two defects were only visible because of the experiment.** The **stage-assignment defect** — a
  surviving production visually migrating from Stage B to Stage A when the array compacted after a
  release — had been **hidden by the two stages looking identical**. And `underDressed` was a **dead
  existing signal**: computed by the adapter, spread onto all nine buildings, consumed nowhere, and
  unreachable from any existing fixture. Distinct art exposed the first; wiring the second cost
  almost nothing.
- **And one defect the independent review found in the fix itself — presentation memory that outlived
  its game.** The stable stage-assignment resolver correctly survived Lot unmount and re-entry, which
  is exactly what it was built for; but its initial module-level lifetime was too broad and it also
  survived **New Game** and **Load Save**. Because production ids are `prod-<tick>` and repeat across
  games, a slot held by a departed studio's film could be inherited by an unrelated new studio's film
  greenlit in the same week. Closed by ending the presentation session at the authoritative
  GameState-replacement boundaries — not by changing the resolver.
- **Reusable rule — scope presentation memory to the state it decorates.** Persistent presentation
  memory must be scoped to the identity and lifecycle of the *authoritative state it decorates*.
  "Session scoped" does not merely mean *survives component unmount*: it must also define when the
  session **ends**. Where ids can repeat across authoritative sessions, a presentation cache or
  resolver must reset at the replacement boundary, or be keyed to an authoritative session identity.
- **Fastest diagnostic:** before starting, write down each hypothesis and its own pass/fail criterion
  **and its own measurement**; at closure, score them independently and refuse to publish a single
  blended verdict. If a metric fails, record the failure and stop — do not re-baseline, do not
  re-scope the comparison, do not add another data point chosen because it will look better.
- **Pattern:** two-column verdicts (`VISUAL: PASS` / `ECONOMIC: FAIL`); an explicit "no productivity
  multiplier is claimed" statement in the closure; component-by-component adoption rulings; a control
  path retained so pre-existing defects stay attributable; blind independent review of the artefact
  with the identifying labels removed; bounded corrective passes with a hard stop; presentation caches
  whose reset is wired to the authoritative state-replacement boundary and asserted by test.
  **Anti-pattern:** collapsing multiple hypotheses into one PASS/FAIL; letting a visual win imply a
  tooling win; moving the goalposts after a metric fails; extrapolating an untested future unit cost;
  adding a third instance purely to improve amortization; building the abstraction before inspecting
  what already exists; allowing labels or signage to carry a test that is supposed to be about form;
  opportunistically fixing pre-existing defects inside a controlled experiment; declaring components
  worth shipping *because* their parent experiment needs to be called a success; defining a cache's
  lifetime only by what it must **outlive**, without defining what **ends** it.
  **Related:** **AQ**, **AR**, **AS**. **Reuse:** BR, MG, P.

---

# Authored Soundstage Pipeline Proof — Checkpoint C (proof branch `art-authored-soundstage-pipeline-proof`, base `6d08bb0`)

Context: an offline-authored (Blender) replacement for one soundstage, rendered to a 2D PNG pair and
integrated behind a proof flag that was DEFAULT-OFF while these lessons were being learned. The
procedural Stage B remains the control, the explicit rollback and the failure fallback.

**Branch and lineage state, stated precisely.** These lessons were written while Checkpoint C was
open, and originally carried "UNMERGED / production `main` unchanged". That is no longer true of the
lineage, and the distinction is worth keeping exact:

- The proof **branch** is frozen at its accepted authority `81497b4` and has not moved. It was never
  merged back into, and has never been advanced by, production.
- The accepted proof **lineage** was incorporated into production by the authorized **fast-forward**
  adoption, so `81497b4` **is an ancestor of `main`**. There is no merge commit anywhere in
  `6d08bb0..main` — the range is linear.
- `main` then advanced **past** that lineage through the production-adoption governance commit
  `5e75b8e`, which is what flipped the authored gate to DEFAULT-ON.

So on `main` today the authored Stage B is the default. Closure:
[`art/AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-CLOSURE.md`](art/AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-CLOSURE.md).

## AU. An absolute-value check cannot catch a relational visual defect — **BR, MG, P**

A metric written to answer the *previous* symptom will keep passing while the cause moves. If the
defect is "this element looks wrong **against what it sits on**", only a relational assertion can see
it — and a global bound will certify the artefact as fixed while a reviewer still sees the fault.

- **Task — Project: Studio.** The authored Stage B carried three small roof units. A blind reviewer
  reported them as reading like "flat smudges… a stain or a recess, not a box".
- **The check passed while the defect stood.** The prior corrective pass had been scoped as "lift the
  vent into the palette's darkest legitimate range", and it was verified exactly that way: darkest
  opaque tone **luma 104.3**, **zero** pixels below the scene backdrop (luma 21.7), against a control
  whose own darkest tone is 107. All true, and the item was reported **closed**. It was not.
- **Root cause of the miss.** The real defect was never absolute. The unit's *up-facing top* rendered
  at luma **152.8** against the *up-facing roof deck* it stands on at **175.5** — a **~20-luma
  inversion between two parallel planes**. The original symptom (a near-black box below the backdrop,
  luma 14.5) had been a lighting-rig bug — an on-axis key casting a degenerate infinite shadow band —
  and fixing that cause left a second, different fault in the same object that the same metric could
  not express.
- **Two reviewers disagreed, and the disagreement was the signal.** One blind reviewer called the
  units holes; the next, on the corrected asset, called them "raised boxes with a shadowed face".
  A split like that is diagnostic of a *relational read* rather than an absolute fact, and it is the
  cue to go and measure the relation rather than to pick a side.
- **One physics correction worth keeping.** The claim "two parallel surfaces under one light cannot
  differ" is only true for identical materials; the measured gap here is **albedo**, not illumination.
  Getting that right changed the severity classification, not the existence of the defect.
- **Resolution.** Reclassified as a known release-blocking Art defect and carried into Checkpoint C
  as an explicit runtime watch item, deliberately **not** fixed during integration so the runtime
  proof observed the frozen candidate.
- **AND MEASURE IT IN THE REPRESENTATION SPACE THE STANDARD WAS DEFINED IN (release-closure
  amendment).** The same proof then failed the same way a second time, on a governed relationship
  rather than an ad-hoc one. D1-B's front-to-side coherence figure (0.859-0.876) is a **displayed
  sRGB luma ratio**. It was applied in the authoring rig as a **linear irradiance** ratio, and sRGB
  encoding compressed it: the shipped asset measured **0.949** against a procedural control at
  0.8737 and Stage A at 0.8589 — roughly half the intended corner separation, present since the
  first authored render. Every check passed it, because they asserted palette *membership* (the
  shadow tone sat within tolerance of a governed constant) and never the *ratio between the two
  faces*. **Rule: never transfer a numeric threshold between linear light, encoded colour, source
  material values and the final quantised asset without re-validating in the final representation
  — and measure the governed relationship on the shipped file, not on the authoring parameter.**
- **A relational number also does not transfer across MATERIALS, not just across spaces
  (standards-hardening amendment).** The same band survived the space correction and was then
  found to be non-transferable a *third* way. `0.859-0.876` was never a universal constant: it is
  the interval spanned by the two soundstages' **own colour families** — buff (Stage A) at 0.8589
  and cream (Stage B) at 0.8737. Derive the same relationship for the other families the lot
  actually uses and they do not fit inside it: **taupe 0.8511** (Administration) and **slate 0.8424**
  (Post-production) both sit *below the entire band*. Holding an authored Administration building to
  Stage B's band would have required painting it out of family to pass its own coherence check.
  **Rule: a relational target is derived from the specific material it governs, and is re-derived
  for each one; only the tolerance around it is shared.** The value contract now lives in
  [`art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md`](art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md)
  and is recomputed from `palette.ts` on every test run, so it cannot drift back into prose.
- **A recorded hash is not a reproducible process (standards-hardening amendment).** The accepted
  Stage B PNGs were correctly declared the measurement authority and correctly hashed — and the
  quantisation that produced those exact bytes existed only as an ad-hoc command inside a session
  transcript. "PNG-8, shared palette" reads like a specification and is not one: reproduction also
  needs the quantiser and its method, the palette-sharing construction *and its input ordering*,
  alpha handling, dithering, optimization, compression level, and the library versions. Recovered,
  written down and re-proven byte-identical here. **Rule: an accepted binary asset is only as
  governed as the command that can regenerate it; record the command, not the format.**
- **The rule was re-broken by the very next building, because the METHOD moved and the tooling
  did not (RGBA export-hardening amendment).** Stage B's PNG-8 export was recovered, written
  down and proven — and then Option D (`fdfdfea`) replaced the export method entirely with a
  truecolour RGBA path developed *outside the application repository*. It shipped with exact
  SHA-256 digests in the commit message and **no runnable in-repo command**, which is precisely
  the state this lesson had just finished condemning. The repo's own instrument still described
  only the superseded path, so the standard silently documented an export production no longer
  used. Recovered here and re-proven: three clean runs of `rgba-export` reproduce both committed
  Stage B objects byte-identically, alpha bit-exact against source.
  *Reusable rule:* **when the export METHOD changes, the tooling that performs it moves into the
  application repository in the SAME commit as the bytes it produced.** A recorded hash plus an
  out-of-repo script is not a smaller version of reproducibility — it is the same gap wearing a
  digest. Adding a path also means *labelling the old one*: leaving `quantize` undifferentiated
  next to a new path is how the next author picks the wrong one.
  *Corroborating measurement, worth keeping because it is why the method changed at all:* on one
  source, indexed PNG-8 altered **98,854** alpha bytes (2,862 of them anti-aliased rim pixels)
  and displaced **29.4 %** of opaque pixels by more than 8, against **0** and **0.057 %** for the
  truecolour path. Indexing must encode RGB and alpha in one table; truecolour need not.
- **Fastest future diagnostic:** sample the element and the surface it sits on in the same render and
  compare, rather than comparing either to a global floor; and confirm which space the governing
  number lives in before using it as an input anywhere.
- **Pattern:** assert the *relation* — element vs the plane it shares an orientation with, or vs its
  immediate neighbour — whenever the complaint is about how something reads in context.
  **Anti-pattern:** closing a visual defect on a threshold the defect was never going to violate;
  reusing the previous symptom's metric as the acceptance test for its successor.
  **Related:** **AI**, **AM**, **AT**. **Reuse:** BR, MG, P.

## AV. A constrained offline render can be *more* stylised than the procedural art it replaces — **MG, BR**

The pre-registered risk for importing offline-rendered 3D into flat-shaded 2D art is that it arrives
softer, noisier and more chromatically complex than everything around it. Measured, the opposite
happened — because the render was constrained to reproduce the target's *own* shading convention
rather than a physical one.

- **Pre-registered as HIGH RISK** at Checkpoint A: AA gradients, contact shadows and material
  micro-variation that "literally no other pixel in the frame has".
- **Measured on the shipped assets:** authored **36 distinct colours** vs the procedural control's
  **230**; true soft edge (alpha 1–249) **1.72%** vs **2.73%**; 92–96% of the opaque area within
  ΔRGB 30 of a governed palette constant. The authored sprite is the flatter, harder-edged and more
  palette-disciplined of the two.
  **Both figures carry their definitions now, because their absence caused a contradiction in this
  very record.** "Distinct colours" = *distinct RGB triples over pixels with alpha > 200, normal
  finish*; "true soft edge" = *pixels with alpha 1–249 as a share of non-zero-alpha pixels*. This
  bullet first read **34** and **1.71%**. Those were not a different metric and not an error: they
  are the same definitions measured on the **pre-release-closure candidate**, before the release
  punch list removed the three roof units, one header pinstripe and the two flat wall panels. On the
  asset that actually shipped the same measurements return **36** and **1.72%** — reproducible with
  `scripts/art/authored-asset-pipeline.py measure`. The lesson inside the lesson: a bare count
  quoted without its threshold *and* its asset revision will be read back as a contradiction later.
- **What produced that.** Three white suns aligned to +X/+Y/+Z with zero ambient, at irradiance π so
  a diffuse face renders its albedo exactly, with the shadow-side sun set to the project's own
  governed front-to-side luma ratio (0.8735). This reproduces the game's orientation-based shading
  rule and gives every chamfer, slope and reveal a correct in-between tone for free — the one thing
  hand-authored 2D polygon art cannot cheaply do. No external texture was used at all.
- **The corollary that matters for scope:** at the governed management camera the whole building is
  ~222 px wide and a commodity prop occupies 6–20 px, so the cleared third-party donor geometry was
  acquired, hashed — and then **not used**, because it contributes nothing resolvable at that size
  and its material noise is precisely the failure mode above. Hero identity was authored; commodity
  reuse turned out to be optional rather than necessary.
- **Detail must COLLAPSE cleanly, not merely exist (release-closure amendment).** Runtime review of
  the integrated asset found the opposite failure to **AI**: not defects hidden by the management
  camera, but detail that is correct close up and becomes *noise* at the camera players actually use.
  Three roof units (~10x8 px at management scale) read as smudges, twin ~1px diagonal pinstripes
  aliased into a beaded chain, and two flat single-tone wall panels read as stains. All three were
  **removed**, not reinforced. The resulting rule, adopted as Art direction: a detail that only exists
  at close zoom must not damage the building at the primary management camera — it may resolve away,
  but it may not become dots, stains, smudges or broken diagonals. Note the pairing: **AI** says the
  management camera can *hide* a blocker, this says it can *manufacture* one. Both are reasons to
  review at both distances and to let the primary camera arbitrate.
- **Pattern:** constrain the offline render to the destination's shading convention and palette, and
  judge it on colour count and edge softness against the art it replaces, not on render realism; set
  the detail budget at the primary camera and delete anything that cannot survive it.
  **Anti-pattern:** assuming a 3D render must be softened *toward* the 2D target; treating "cleared
  for use" as "should be used"; keeping detail because effort went into it.
  **Related:** **AI** (its mirror image), **AT**, **AU**. **Reuse:** MG, BR.

---

# Fable Authored Environment Strike Team + Option D (merged `fdfdfea`)

Context: a Director-commissioned, fully isolated experiment (branch
`art-fable-authored-environment-spike` from frozen `9c4d060`, worktree + quarantine at
`Project Studio - Art Source Quarantine/Fable-Authored-Proof/`) testing whether donor-based,
Blender-authored, offline-rendered environment art beats the procedural lot art in the real
game frame. It ran the same day as — and independent of — the production authored-stage lane
(`032dd16`→`5e75b8e`→`4a3025e`). **The Fable branch itself was never merged.** A reconciliation
found the Fable art stronger and the production mechanism stronger; **Option D** selectively
combined them: Candidate A's art + production's integration path + production's worn-state
semantics + four regression guards, as one surgical commit (`fdfdfea`, ff-only, 4 files).
Related: `docs/art/FABLE-AUTHORED-ENVIRONMENT-SPIKE.md` (on the spike branch),
`docs/art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md`, quarantine `reports/` + `pm/DECISIONS.md`.

## AW. Reuse-first Art is component-level — donor building shells rarely survive adaptation — **MG, BR**

The project receives no extra credit for creating commodity art from scratch; that ruling was
validated. But the experiment's sharpest acquisition lesson is WHERE reuse pays.

- **Two artists, briefed independently on the same cleared hangar-class donor, both rejected the
  shell** for the same measured reasons (ground-springing Quonset massing, wrong aspect for the
  4×4 plot, ~40 ribs/m photoreal steel that aliases at management scale) and rebuilt clean. The
  winning stage retained one donor canopy and a few solid-silhouette CC0 props, re-materialled
  flat (the rejected candidate applied the same discipline, decimating its props to ≤500 tris).
  The CC0 backup shell was rejected outright (texture-baked slab).
- Reuse should happen at the level that genuinely saves effort — canopy, duct, crate, window
  family, material, massing *reference* — and a whole building only when it truly survives
  adaptation. **Do not measure success by percentage of donor geometry retained**; the AV
  corollary (donor props unnecessary at a 222 px flat target) and this result bracket the same
  truth: donor value is resolution- and style-dependent, decided per asset by the destination
  camera, never by acquisition effort.
- "Reuse-first" does NOT mean "drop premade buildings in unchanged" — Studio silhouette and art
  direction stay authoritative; the donor is raw material.
- Provenance worked without becoming bureaucracy: quarantine outside git, per-asset ledger
  (creator, URL, licence + verbatim load-bearing sentences, SHA-256, acquisition time, tier,
  intended use, disposition), raw restricted sources never entering the repo, and only rendered
  derivatives shipping. One acquisition-path judgment call was escalated, disclosed, and
  Director-ratified rather than buried. Where the Owner knows the creator, one concise
  dual-rights ask (modify + commercial derivatives) beats weeks of licence archaeology.
- Tooling stayed parked (spritesheet renderers, batch converters, material-layer systems):
  repetition had not yet justified automation. D1-B's ruling held again — make things first,
  automate observed repetition.
- **Pattern:** audit the donor with a headless inventory dump, decide shell-vs-components
  honestly, record what was actually used. **Anti-pattern:** donor-shell loyalty; equating
  "cleared" with "should be used"; provenance theatre after the art is already built.

## AX. Whole-frame, same-conditions, signage-masked judgment — and when a concept competition is worth it — **MG, BR**

- The Soundstage was accepted because the GAME improved, judged as: same state, same camera,
  same viewport, same surrounding lot, old vs new. Isolated turntable beauty was never the
  question; "did the frame become more compelling" was.
- **Signage-masked identity was the decisive discriminator** in the authored-vs-authored
  reconciliation: with lettering removed, one stage still read as a Golden-Age soundstage
  through architecture alone (vault + ridge monitor + door hierarchy); the other read as
  factory/depot. Architecture must communicate function, era and hierarchy before signage
  explains it. Keep this test for hero buildings.
- **Two serious competing concepts beat polishing the first idea.** Candidate B was rejected on
  its own measurements (7.8 points busier than the lot; its stated discriminator failed to set
  the silhouette) — cheap to learn from a parallel concept, expensive to learn by iterating one
  mediocre direction. Justified when: hero asset, alternatives are cheap, visual judgment is
  genuinely uncertain. Do not run competitions for props.
- A successful replacement **moved the weakest-object title to Stage A** — each major win
  exposes the next attack target. Raise the visual floor; do not keep polishing winners.
- **The comparison peer is itself a moving authority — re-verify it at the moment of grading
  (Stage A supersession amendment).** This lesson's "same state, same camera, same viewport,
  same surrounding lot" conditions silently assume the *neighbour* is fixed. It is not.
  *Project-specific evidence:* the authored Stage A Concept C was selected, built, measured and
  blind-reviewed against the sawtooth Stage B, and was passed at 95 % "clearly different
  buildings" with "no blocker". Production replaced Stage B with the Option D barrel-vault
  Ridge-Monitor stage **while that work was in flight** — between the proof's authority check
  and its first render. Re-reviewed against the Stage B that would actually ship beside it, the
  same frozen asset drew *"a greybox proxy or an unfinished blockout sitting next to a finished
  asset"*. Nothing about the asset changed; only its neighbour did. The concept's entire
  selection rationale — "the strongest, most differentiated silhouette against Stage B's
  sawtooth" — had evaporated before the first polygon existed.
  *Reusable rule:* **an authored building is graded against the peer that will ship beside it,
  not the peer that existed when the concept was chosen.** Pin the peer's commit in the concept
  document, and re-verify that commit is still current before grading, before blind review, and
  before adoption. A frozen authority protects *your* work from drifting; it does not stop the
  world you are matching from drifting.
  *Corollary, which is the more expensive half:* "calmer than its neighbour" is only a design
  position while the neighbour is comparable in finish. Against a richer peer the identical
  asset reads as unfinished rather than restrained — so **peer finish parity is a moving gate
  too**, and deliberate sparseness must be re-justified whenever the peer is re-authored.
  *Anti-pattern:* treating a frozen production SHA as though it froze production.
- **Differentiate a same-class peer by EMPHASIS, not by vocabulary (Stage A H2 amendment).**
  Concept C tried to differ from its neighbour by owning a *different roof*, and when the
  neighbour was re-authored with a curved roof the concept had nothing left; worse, it had spent
  nothing anywhere else, so it read as the neighbour stripped. Its successor changed axis instead
  of vocabulary: production Stage B is **roof-led** (glazed vault, clerestory monitor, compound
  skyline) and Stage A H2 is **front-led** (calm parapet roof, all investment in a monumental
  frontispiece, pylons, and an elephant door with a human door beside it for scale). Same palette,
  same projection, same Deco restraint, opposite emphasis. Blind reviewers, unprimed: Concept C
  drew *"a greybox proxy… next to a finished asset"*; H2 drew *"a sound stage"* at 80 % against
  the procedural control's *"warehouse / storage shed"* at 35 %, and *"plainer, but correctly
  plainer."*
  *Reusable rule:* **two buildings of one class read as peers when each carries comparable
  authored investment in a DIFFERENT place — not when one has a louder version of the same
  feature, and not when one simply has less.** "Calmer" survives review only if the calm is
  purchased somewhere else on the same building. Ask of any same-class pair: *what does each one
  spend its budget on, and are those the same slot?* If yes, one of them will read as the other's
  cheaper draft.
  *Anti-pattern:* differentiating on a single feature the peer might later adopt; treating
  restraint as a substitute for investment.
- **Pattern:** compare-mock composites into the live frame before integration spend; half-size
  silhouette checks; reviewer questions phrased about the frame, not the model.
  **Anti-pattern:** approving art from renders on checkerboards; polishing an accepted asset
  because attention lingers there.

## AY. Author the best art first; optimize delivery second; measure performance instead of fearing it — **MG, BR**

- Order that worked: author → validate visually → optimize delivery → **reject any optimization
  that visibly damages the win**. True PNG-8 hit production-class bytes (~23 KB pair) but
  averaged the 1-px silhouette rim and posterised tonal ramps; the alpha-lossless quantised
  export (~116 KB pair) was indistinguishable from full fidelity and shipped. Byte counts are
  not a quality metric; a ~100 KB-class hero texture is not a crisis. The +501 % payload was
  accepted deliberately, in writing.
- Performance fears were measured, not assumed: displayObjects 143 → 143 (delta 0), FPS
  unchanged, one decoded texture ≈ 0.74 MB. For pre-rendered buildings the real budget axes are
  **texture bytes, decoded memory, alpha correctness, anchoring, hit behavior** — not source
  polygon count (the 10k-poly donor's cost was authoring-side only).
- **Pattern:** encode-and-compare plates (full vs optimized, 1:1 and 2×, plus a ×-scaled
  difference map) before choosing an encoding. **Anti-pattern:** letting a byte-size contest or
  a hypothetical perf ceiling dictate weaker art; optimizing before the art has won.

## AZ. Adopt components, not branches — and authoritative state must survive better art — **P, MG**

- The reconciliation returned different winners per axis: visual (Fable lane) vs engineering
  (production lane: structurally guaranteed fallback, real-browser e2e, generic worn resolution,
  smaller delivery). The correct outcome was **not** choosing a branch — it was one surgical
  commit combining best art + best runtime path + best state behavior + best tests, and
  explicitly carrying nothing else (no experimental loader/flag, no competition machinery, no
  quarantine tooling). Branch loyalty is not an adoption criterion.
- **A prettier asset cannot erase authoritative gameplay communication.** The winning art
  initially had no worn variant; production's guard (both textures or no swap) correctly refused
  such art. The worn derivative was authored from the lot's own shipped worn transform — duller
  fields, desaturation, reduced glazing, trim dropped not darkened — with **no invented
  condition narrative** (no broken windows, damage, or abandonment the Engine never stated).
  Engine decides state; Art expresses it, at exactly the established signal strength.
- Bit-exact alpha between normal and worn means a state change can never alter the hit area —
  and adopting it fixed a latent 8,652-pixel alpha drift between the previous pair.
- **Pattern:** reconcile parallel lanes with a measured same-conditions comparison, then adopt
  per component. **Anti-pattern:** merging an experiment because it won one axis; strengthening
  or inventing state semantics because the new art could draw them.

## BA. Test the real invariant of an authored asset — measured camera, anchor math, registration, real alpha — **BR**

- **A measured camera contract beat eyeballing**: the Blender↔Phaser rig was proven with
  self-measuring gates against the game's own projection (px/tile, dimetric ratio, axis mapping
  via an asymmetric probe, anchor, shift). Renders then entered the game predictably, twice
  (spike flag-lane and production path). Calibration is DONE when the gates pass — it did not
  become its own project, and should not.
- **Depth slicing was tested and not needed**: one sprite, existing container depth, characters
  already occlude correctly. Build slicing infrastructure only when a real asset fails without
  it.
- The inherited test asserted equal `originY` between textures — true only because two assets
  coincidentally shared a height; a 4 px-taller drop would sink the building 1.37 px with
  nothing failing. Adopted guards test the *invariant*: anchor sits 128 px above the bottom edge
  (`texH × (1 − originY) = 128 ± 0.5`); on-disk IHDR must match the metadata the code assumes;
  and a **registration lock** pins the approved silhouette placement (lowest opaque row, bbox
  insets, centroid) ±1 px so future drops shift art review, not the building. Every guard was
  mutation-tested (wrong-size drop fails; 2 px shift fails; `pixelPerfect:false` fails).
- **Real alpha drives hit behavior**: authored silhouette ≠ texture rectangle. A negative click
  must land on a transparent pixel *inside* the sprite rect — the inherited outside-the-rect
  probe passed vacuously, and a bbox-based locator produced a false positive during evidence
  until replaced. State variants keep identical alpha when geometry doesn't change.
- **A manifest figure computed from GENERATOR PARAMETERS is not a measurement of the art** (added
  by the Stage A H2 bounded correction, Aug 2026). H2's personnel door — the element the concept
  names as its class signal, the human half of the two-door scale contrast — **never rendered**.
  Its leaf front face sat 0.002 BU *behind* the pylon it is set into, and +X is toward the camera,
  so the pylon occluded it completely. It survived an offline art gate, a blind offline review, a
  full runtime integration proof and a second blind review, because `MANIFEST.json` reported
  `personnel_door_px` all along — derived from the generator's own constants, never sampled from
  the output. The number was true about the *model* and false about the *image*. This is the same
  failure family as the mislabel this lesson already records (a claim measured on a synthetic
  overlay rather than the art), one level earlier: here nothing was measured at all.
  **Pattern:** for every feature a design document names as load-bearing, assert it is PRESENT IN
  THE SHIPPED PIXELS — a cheap region census (opaque count, dark-pixel count, distinct tones inside
  its bounding box) is enough, and it is what caught this. **Anti-pattern:** letting the generator
  self-report geometry into the provenance record; treating "the code places it there" as evidence
  that it draws. **Fastest diagnostic:** crop the feature's predicted screen rectangle out of the
  final asset and look at it — the occlusion was obvious in one 70×90 px crop after four gates had
  missed it.
- **Two green endpoint suites can bracket an untested span** (added by the Stage A H2 runtime
  proof, Aug 2026). The H2 unit suite proved the *flag* (default-OFF, only a literal `'1'` enables)
  and the *registry re-point* (BuildingId, grid, footprint, origin all preserved) — both endpoints,
  both green — while the four plain assignments **between** them (`flags` → `StudioLotScreen` →
  `StudioLotView` → `LotScene.init` → `preload`) had no unit coverage at all. A dropped or renamed
  prop anywhere in that span leaves every endpoint test passing while the feature silently does
  nothing in the real product; only the browser proof would have caught it, and only if someone
  looked at the right attribute. **Pattern:** when a feature is a chain of pass-throughs, test the
  *span* end-to-end and take the assertion as **behaviour at the far end** (here: which image URLs
  the real scene actually requests) rather than as a private field, and stub only the third-party
  boundary (Phaser) so every project module in the chain runs for real. **Then mutation-test the
  span, not just the guard**: deleting the prop at the view hop failed 3/3 and at the host hop
  2/3 — without that check the new test could itself have been vacuous.
- **Pattern:** derive test coordinates from the committed asset's alpha programmatically;
  mutation-test every new guard. **Anti-pattern:** constants that encode an accident of current
  assets; trusting a claim ("gates pass") measured on a synthetic overlay rather than the art —
  that mislabel survived two reviews here before an implementer re-measured the actual file.

## BB. One expensive PM, many cheap builders — with single write ownership — **BR**

- The Owner's economics (PM-tier tokens scarce; builder-tier abundant) produced the working
  model: **one PM** holding judgment, sequencing, acceptance, checkpoint rulings and synthesis;
  **parallel Opus builders** doing art, integration, evidence, provenance, review and fact
  extraction. Zero PM-tier subagents, ever. The PM reads results and decides; it does not grind
  implementation to save a builder call.
- Parallelism worked because writes never overlapped: artists owned isolated candidate
  directories, the integration engineer owned the runtime files, provenance owned the ledger,
  reviewers were read-only, and competing implementations lived in separate locations with the
  PM choosing a winner. Conflicts are prevented by ownership, not resolved by blending.
- Builders challenged the PM upward when evidence demanded it (a mislabeled measurement, an
  escalated acquisition judgment, a premise-changing discovery on main) — and were right each
  time. A lane exists so its reports can be *corrected*, not just collected.
- **Pattern:** precise bounded briefs; same-builder continuation when context compounds;
  independent review only where independence adds information. **Anti-pattern:** PM-tier
  swarms; two agents editing one file; delegating the acceptance judgment itself.

## How Track A should change Track B (Southeastern) — carried forward before any campus work

1. Audit the ENTIRE family before converting anything; classification per building
   (keep-restyle / heavily modify / harvest components / recombine / reject) with transformation
   estimates — expect component harvest, not seven whole-building conversions (AW).
2. ONE Administration concept first; it is a hero asset, so a bounded concept competition is
   justified (AX). Accumulated-studio-history reading — historic core legible under later
   annexes — is the acceptance axis.
3. Judge offline concepts composited into the live frame at the governed camera before any
   integration spend (AX); no runtime integration until the art direction passes and the
   Director authorizes it.
4. Provenance before significant transformation: the pack ships with no licence, so the
   prepared one-paragraph dual-rights creator ask precedes creator-derived work
   (`Fable-Authored-Proof/southeastern-intake/`); creator-source files preferred over anything
   reverse-extracted (AW).
5. Authoritative state boundaries unchanged: campus-derived buildings express existing Engine
   state at existing signal strength; no new condition vocabulary (AZ).
6. Reuse the measured camera contract and the asset-invariant guard patterns as-is (BA); no new
   calibration project, no slicing infrastructure, no automation until the second or third
   building demonstrates actual repetition (AW).
7. Status at time of writing: **BLOCKED — source bytes not on the machine**; intake directory
   and permission draft are ready; nothing was faked with substitute geometry.

---

# D-16 — Economy & Recovery Decision Lab — CLOSED (recommendation D accepted; analysis branch, not merged to main)

> Source: `docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md` + gitignored evidence under
> `out/d16-economy-lab/`. D-16 was accepted (recommendation D) by Owner ruling 2026-08-12 —
> see `docs/D-16-OWNER-RULINGS.md`. **BC, BD, BF, BG, BH and BI are FINAL.** BE stays DRAFT
> through D-17B (its prescribed counter-flow needs empirical validation); BJ stays DRAFT until
> the R2 persist-at-founding correction is implemented and proven (D-17A closure). BK added
> as DRAFT.

## BC. Balance certifications go stale silently — re-run the gates at HEAD — **BR, MG**

- **Symptom:** the D-12 integrated balance gates, recorded as PASS with p10 cash of $137M+,
  FAIL at today's HEAD (Y3 median cash negative for all seven strategies) — undetected across
  three merged milestones (D-12-P2, D-13, D-14).
- **Root cause:** gate results were recorded as documents, not as a re-runnable acceptance
  check; later engine-touching milestones re-ran their own tests but never the economy corpus.
- **Resolution/pattern:** a standing one-command gate corpus (`src/harness/d16/run-d16-corpus.ts`)
  re-run at every engine-touching milestone close; the numbers live in the closure, the CHECK
  lives in the repo. **Anti-pattern:** "certified in D-N" treated as a permanent property.

## BD. A condition satisfied by almost everyone is not a condition — **MG, BR**

- **Symptom:** D-13's discoverability was designed as *conditional* variance ("only unsupported
  packages"), but 90.4% of legal packages at real decision points are exposed and 77.8% of real
  states contain no immune option at any price.
- **Lesson:** a conditional lever must be validated against the REAL distribution of player
  states (decision-point corpus), not against the intended corner. Check the exposure RATE
  before accepting a "conditional" mechanic as conditional.

## BE. Feedback stocks need equilibria designed in, not tuned in — **MG, BR**

- **Symptom:** `audienceAwareness` feeds the gross that sets its own direction, has no decay,
  and therefore has NO tunable neutral point: every `AWARENESS_REACH_NEUTRAL` setting trades
  death-spiral rate directly against runaway rate (monotone frontier, measured over 5 arms ×
  1000 seeds).
- **Lesson:** any self-reinforcing stock needs a designed counter-flow (decay, asymmetric
  gain/loss, or a second input) from day one; a one-way ratchet cannot be balanced by moving
  its pivot. Extends **P** (cash-positive vs financeable) into dynamics.
- **Status:** FINALIZED at D-17B closure (2026-08-13). The production stack adds a pull-down-only
  counter-flow above A35 plus a paid low-stock inflow. In 300×208×24 production execution,
  awareness ceiling absorption is 0 across every arm; in the 180-state continuation, publicity
  changes floor absorption from 85.0% to 30.6–35.6% and creates 10.6–13.0% durable@103 recovery.
  The equilibrium is partial rather than magical: recovery remains below G8's 25% bar and cash
  runaway worsens. That separation is the empirical validation of the lesson, not a clean sweep.

## BF. Survival and recovery are separate metrics from profitability — **BR, MG**

- **Symptom:** the corpus "recovered" flag (leaving distress) is a 6-week theatrical-run blip:
  94% of "recovered" runs still end in terminal decline. Meanwhile an ORACLE finds 7.5–10.8%
  durable recovery where every player-information arm finds 0%.
- **Lesson:** measure recovery as DURABLE state at +N weeks, report player-information and
  oracle recovery separately (unfindable ≠ impossible), and never quote profitability as
  evidence of survivability. Quantifies and extends Lesson **V**.

## BG. Strategy agents must be information-disciplined by construction — **BR**

- **Pattern proven in D-16:** a whitelist `PlayerView` type consumed by `decide(view, ctx)`
  makes oracle leakage a compile error, not a review finding; oracle/exploit arms are labelled
  in the artifact schema and excluded from player headlines by construction; a leak spec
  (asserting hidden keys absent from the serialized view) guards regressions.
- **Anti-pattern:** "the policy only uses fair inputs, we checked" (the D-12-era harnesses had
  hand-copied oracle re-implementations nobody caught).

## BH. Counterfactual numbers must be unemittable without a mode tag — **BR**

- **Pattern proven in D-16:** every artifact row carries `{mode: CURRENT|COUNTERFACTUAL,
  overrides}` stamped by the experiment layer itself (`experiment.ts` tagArtifact +
  assertTuningPristine canary after every override scope); a pristine-TUNING canary runs after
  each arm. Zero mixing incidents across ~200 corpora and 78 counterfactual arms.

## BI. Tail-first statistics for economy corpora — **BR**

- The D-16 statistical review's binding rules: per-run medians, never pooled per-film tables
  (pooling sign-flipped a policy's film economics); variance shares only on a
  magnitude-stabilized transform (asinh) — raw-$ shares are hostage to ~0.7% of cells; every
  "0%" claim carries a cluster-robust (per-world) upper bound and states its true denominator;
  win-share gates phrased pairwise, not as N-way argmax; quantile definition pinned (type 7)
  repo-wide (the old fleet had two incompatible definitions that disagree exactly at the tails).

## BJ. Deriving economic law from unrelated state is an anti-pattern (the engagement cliff) — **BR, MG**

- **Symptom:** `economyEngaged ≡ (founding || contracts.length > 0)` couples the WHOLE D-12/D-13
  economy to roster size: firing everyone reverts the studio to the legacy 100%-of-gross
  economy, freezing active runs and voiding the solvency gate — a strictly dominant labelled
  exploit worth a $6.79M swing per film on the real Week-86 save.
- **Lesson:** regime membership must be an explicit, persisted, monotonic fact (set at
  founding, never derived from a fluctuating collection). Any gate that switches LAW (not just
  features) off a mutable count is a defect candidate on sight.
- **Status:** FINALIZED at D-17A closure (2026-08-12) — R2's persist-at-founding correction is
  implemented (`economyEngagedEver`, SaveFileV6) and proven: cliff-monotonicity tests on both
  the natural-expiry and fire-everyone paths, migration proof over all five save classes, and
  the 300×208 d16 corpus float-identical for every player policy while the P15 exploit
  collapsed ($146.22M median → $16.03M, 44 films → 0).

## BL. A regime-predicate split must be carried through every consumer that feeds an action — **BR, MG**

- **Symptom:** D-17A split the old single predicate into `economyEngaged` (persisted regime) and
  `employmentEngaged` (current roster). The engine's greenlight was repointed; four UI selectors
  that staff and price that same greenlight (`assemblyAvailability`, `studioPool`,
  `freelancerPool`, `assignmentProjectCost`) were "deliberately left" on the old predicate — so
  a post-cliff studio was offered the whole world's talent at retired D-1 prices while the
  engine refused every buildable package with a raw D-11.12 error (adversarial review, BLOCKER).
- **Lesson:** when one predicate becomes two, enumerate EVERY consumer and assign each to its
  predicate deliberately, by the rule "which predicate does the ACTION this surface feeds
  actually branch on?" — a consumer feeding an action must use the action's predicate.
  "Deliberately unchanged" without that per-consumer proof is the anti-pattern; the split point
  is exactly where action parity breaks silently. Extends **AC** (actionability from the
  authoritative action rules) and **BJ** (regime as an explicit fact).

## BK. A one-tail fix on a shared unstable stock is not a complete repair — **BR, MG**

- **Symptom:** the D-16 Tier-1 pair (`AWARENESS_REACH_NEUTRAL` 0.58→0.45 + `DISC_SUPPORT_EXP`
  1.5→2.5) improved the death-spiral tail (recovery|distress 78.4%→91.8%; terminal decline
  63%→46%) while roughly doubling the runaway tail (P3 6%→17%, P5 39%→54%) — both tails are
  expressions of the same equilibrium-free awareness stock, and the original package framing
  presented the trade as a shippable state with the cost "accepted, disclosed."
- **Lesson:** when both tails of an outcome distribution arise from one unstable feedback stock,
  a counterfactual that improves one tail at the other's expense is a *measurement*, not a
  *repair*; do not ship or certify it standalone. Sequence it into the milestone that installs
  the stock's counter-flow, and gate acceptance on both tails jointly. Extends **BE** (the stock
  needs a designed counter-flow) and **AT** (hypotheses scored separately — the loud metric must
  not rewrite the quiet one).
- **Status:** FINALIZED as a governing principle at D-17B closure (2026-08-13), not resolved as a
  product outcome. The counter-flow bounds the awareness ceiling at 0% absorption, while the
  14-player-arm mean cash-runaway rate rises from 11.1% to 19.6–19.7% and no-runaway worlds fall
  from 55.0% to 46.7%. “Awareness runaway fixed” is therefore explicitly not “cash runaway
  fixed”; the remaining cash tail needs a separately authorized size-scaling sink.

## BM. Corpus identity must encode every behaviorally material parameter — **BR, MG**

- **Symptom:** D-17B's first named full-stack reference set publicity `saturation: 1` while the
  formula expected a 0–100 awareness scale. Lift was effectively zero for awareness ≥1, yet the
  run could share the same publicity identity as the corrected `saturation: 100` run because the
  serialized key omitted saturation.
- **Lesson:** a run name is a label, not provenance. The machine identity must encode every
  behaviorally material parameter, and artifact validation must reject impossible scale families;
  otherwise two different mechanics can masquerade as the same experiment. Freeze bad evidence
  rather than rewriting it, correct the identity, and compare from raw rows.
- **Fastest diagnostic for fraction-vs-percent failures:** evaluate the formula at a scale sentinel
  (`awareness = 1` here) and inspect the serialized config/key beside the result. A value that
  should be near maximum but collapses to zero immediately exposes the unit mismatch; an omitted
  key field then explains why provenance did not catch it. Production now encodes saturation in
  `productionCandidateKey` and `publicityKey`, and validation rejects `saturation < 50`.

---

# Production Operations V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `1c7a33a`; engine implementation `41333f6`; save corrections `9c9acc3` and
> `e3944ef`; player delivery `0ba1775`. Related:
> `docs/PRODUCTION-OPERATIONS-V1-CONTRACT.md`,
> `docs/PRODUCTION-OPERATIONS-V1-CLOSURE.md`, and
> `docs/art/OPERATION-HOLLYWOOD-ENGINE-BRIDGE.md`.

## BN. Animation may acknowledge an authoritative command; it must never complete one — **MG, BR**

- **Risk:** a route timer, sprite arrival, or render-loop callback can become a second simulation
  clock and make a shooting task depend on frame timing, tab visibility, or reload position.
- **Resolution:** Phaser begins a director route only after the engine snapshot changes to the
  corresponding state. Coordinates and animation time are disposable presentation state; only a
  core command and weekly tick can change the task.
- **Coverage / fastest diagnostic:** load blocked, ready, scheduled, and completed saves directly;
  confirm each paints correctly without replaying an animation, then let the renderer run and assert
  the serialized core state remains byte-identical.
- **Pattern:** animate acknowledged facts. **Anti-pattern:** animation callbacks that advance law.

## BO. Event-stop systems must stop on actionable legality, not merely on bad news — **MG, BR**

- **Symptom:** treating every production blocker as an event would halt Sim repeatedly on a full
  facility even though the player has no legal command to resolve it.
- **Resolution:** the read model exposes a stop only when the exact current core command exists and
  is legal. Capacity holds remain visible and retry on the weekly simulation boundary.
- **Coverage / fastest diagnostic:** create one command blocker and one capacity blocker; Sim must
  stop for the former and continue for the latter.
- **Pattern:** interruption implies agency. **Anti-pattern:** pausing on an unresolvable condition.

## BP. Historical migration repair and current-schema validation are different contracts — **BR**

- **Symptom:** a shared normalization path repaired empty or duplicate forecast segments even in a
  claimed SaveFileV8, allowing malformed current saves to pass under compatibility logic intended
  for older schemas.
- **Resolution:** old versions may be migrated and repaired according to their known history; the
  current version must already be canonical and rejects missing, empty, duplicate, unordered, or
  invalid segment collections.
- **Coverage / fastest diagnostic:** mutate the newest schema directly, not only a legacy fixture,
  and require rejection while every supported old-version migration remains green.
- **Pattern:** permissive historical reader, strict current writer contract. **Anti-pattern:** one
  forgiving parser for every declared version.

## BQ. Facility destination identity must survive every boundary — **MG, BR**

- **Risk:** recomputing “some soundstage” in a UI or renderer can move a production from Stage 12 to
  the prettier Stage 7 plate, breaking reservations while looking plausible.
- **Resolution:** facility ID and slot are engine facts, retained across rehearsal and shooting and
  projected verbatim through the read model. An unauthored destination uses an honest inspector
  fallback; it is never substituted.
- **Coverage / fastest diagnostic:** reserve each soundstage in turn and assert Stage 7 alone starts
  the authored route while Stage 12 remains named and stationary.
- **Pattern:** explicit destination identity end to end. **Anti-pattern:** presentation choosing a
  convenient equivalent facility.

## BR. Occupied, decision-required, and recording are separate visual states — **MG**

- **Symptom:** the legacy lot treated any stage with a production reservation as actively filming,
  showing REC and door glow during rehearsal or while waiting for a player decision.
- **Resolution:** stage presentation derives a small explicit state: vacant, reserved,
  decision-required, or recording. Reserved stages retain their dressing and title, but recording
  effects require the authoritative recording phase.
- **Coverage / fastest diagnostic:** exercise the real renderer dressing path for all states and
  inspect REC, glow, equipment, title, and attention badge independently.
- **Pattern:** model visually meaningful substates. **Anti-pattern:** `occupied === active`.

## BS. Inspector context must be mutually exclusive, not merely layered — **MG, BR**

- **Symptom:** selecting a person, production, then place could leave one panel headed by a place
  while exposing another production's task or command underneath it.
- **Root cause:** each selection was added to local state without clearing incompatible selections.
- **Resolution:** person, production, and place transitions explicitly establish one coherent
  context and clear every mismatched identity, outline, task, and command.
- **Coverage / fastest diagnostic:** use at least two active productions and drive every inverse
  transition (person→place, place→production, production→other person), including callbacks captured
  before rerender.
- **Pattern:** one inspector context state machine. **Anti-pattern:** independent nullable fields
  whose combinations are assumed to be harmless.

## BT. When a command replaces itself, focus belongs to its successor or durable result — **BR**

- **Symptom:** after activation, a command button unmounted and browser focus fell back to the page,
  so keyboard and screen-reader users lost the result and next action.
- **Resolution:** each surface records the production whose command was invoked, then focuses the
  next legal command or the persistent status element after the authoritative snapshot changes. The
  status is a polite atomic live region and remains focusable without joining normal tab order.
- **Coverage / fastest diagnostic:** execute the complete command chain in a stateful component test
  and assert `document.activeElement` after every replacement, including the final scheduled state.
- **Pattern:** focus follows workflow continuity. **Anti-pattern:** relying on an announcement while
  focus disappears with the old control.

## BU. Blocker copy must name the time of the failed attempt — **MG, BR**

- **Symptom:** “No slot is available” could remain visible after another production released its
  slot because retries occur only on the next weekly tick.
- **Resolution:** persisted blocker copy states that no slot was available *when the production
  attempted* and tells the player it will retry next week. The copy stays truthful between engine
  transitions without pretending the UI can retry early.
- **Coverage / fastest diagnostic:** free the contested slot without advancing the blocked workflow;
  its sentence must still be historically true.
- **Pattern:** align prose tense with state-transition cadence. **Anti-pattern:** present-tense
  claims derived from a past failed attempt.

---

# Script Projects V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `e1a97a5`, due-week correction `2a90c20`, implementation `5e3aadf`. Related:
> `docs/SCRIPT-PROJECTS-V1-CONTRACT.md` and `docs/SCRIPT-PROJECTS-V1-CLOSURE.md`.

## BV. Delayed decisions need a persisted due boundary — **BR, MG**

- **Risk:** deriving completion from status plus the original commission week works for a first
  draft and silently fails for a rewrite requested later.
- **Resolution:** persist the exact due week only while work is active, validate its lifecycle
  correlation, and clear it atomically when the decision arrives.
- **Coverage / fastest diagnostic:** request the same rewrite at two different calendar weeks,
  save/reload both, and prove each completes on its own promised week without consuming RNG.
- **Pattern:** persist behaviorally material time. **Anti-pattern:** reconstructing delayed timing
  from an earlier event that no longer defines it.

## BW. A new authoritative value must reach every parallel consumer — **BR, MG**

- **Symptom:** persisted screenplay strength governed the headline forecast while profit,
  discoverability, marketing capacity, efficiency, or autopsy could still recompute the old
  writer/concept blend.
- **Resolution:** enumerate every selector and action that consumes script quality and pass the
  project identity or explicit strength override through all of them. Perceived strength feeds
  decisions; actual strength feeds realization.
- **Coverage / fastest diagnostic:** hold perceived strength fixed while changing actual strength,
  then invert the experiment. Every pre-greenlight dollar/forecast surface must move only with the
  former and release only with the latter.
- **Pattern:** one authority, all consumers. **Anti-pattern:** repairing only the most visible panel.

## BX. Historical identifiers outlive live entities — **BR**

- **Symptom:** allocating a production ID from active and released films alone allowed a
  same-week cancellation and re-greenlight to reuse the old ID while ledger and career history still
  retained it, merging two films' accounting identities.
- **Resolution:** allocation reserves every ID present in any durable historical or operational
  trace: films, runs, ledger, careers, broadcasts, workflows, tasks, reservations, and script links.
- **Coverage / fastest diagnostic:** greenlight, cancel, greenlight again without advancing time;
  require distinct IDs and disjoint ledger groups.
- **Pattern:** identity follows the longest-lived reference. **Anti-pattern:** allocating only from
  the current live collection.

## BY. Frozen save writers need positive projection, not negative stripping — **BR**

- **Risk:** spreading current state and deleting today's newest field lets tomorrow's unknown root
  leak into a historical schema.
- **Resolution:** each frozen save builder explicitly enumerates the exact roots its version owns;
  current-version validation remains strict while historical migration alone performs known repair.
- **Coverage / fastest diagnostic:** add an unknown root to a live object and prove every older save
  projection omits it, then mutate the newest schema and require rejection.
- **Pattern:** versioned positive allowlists. **Anti-pattern:** clone-all-then-delete-known-new-fields.

## BZ. Workflow availability must subtract already-locked credits — **MG, BR**

- **Symptom:** the Writers Room could claim a Ready package was openable because one Director was
  available, even when that same person was the locked screenplay writer and within-film uniqueness
  made Assembly reject them as Director.
- **Resolution:** project-aware staffability uses the exact roster, freelancer rotation, busy set,
  role pools, team counts, and locked-credit exclusions of the destination workflow before offering
  navigation.
- **Coverage / fastest diagnostic:** commission a cross-discipline writer who is the only member of
  another required primary-role pool; require a named shortage and no dead-end action.
- **Pattern:** availability means a complete disjoint assignment exists. **Anti-pattern:** counting
  candidates without subtracting resources the workflow has already consumed.

---

# Casting Sessions V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `efac91f`; implementation and hardening `49d9ae1`. Related:
> `docs/CASTING-SESSIONS-V1-CONTRACT.md` and
> `docs/CASTING-SESSIONS-V1-CLOSURE.md`.

## CA. Persisted observations are history, not a live truth query — **MG, BR**

- **Risk:** recomputing an audition, scouting report, or test result when a save loads can rewrite
  what the player learned after talent, tuning, or availability changes.
- **Resolution:** compute the noisy observation once from an isolated derived stream and persist
  only its narrow evidence record. Current legality is projected beside it but never edits it.
- **Coverage / fastest diagnostic:** complete a session, change the tested person's availability
  and other truth inputs, save/reload, and require byte-identical estimates/bands plus updated
  current-status copy.
- **Pattern:** immutable observation plus live context. **Anti-pattern:** a historical result that
  is secretly a selector over current state.

## CB. Multi-role candidate counts need an assignment guard — **MG, BR**

- **Risk:** two candidates for each of three roles does not by itself prove that three different
  people can fill those roles; overlapping pairs can create a slate with no legal cast.
- **Resolution:** enforce distinct people within each role pair and at least three people across the
  complete two-by-three slate. For this exact shape, that is the Hall matching guard.
- **Coverage / fastest diagnostic:** test a two-person slate reused across all roles, legal
  three-person overlap, duplicate IDs within a role, and every start-time eligibility rejection.
- **Pattern:** prove a complete disjoint assignment exists. **Anti-pattern:** validating each role
  pool independently and assuming their union can staff the workflow.

## CC. Shared capacity must be one union at every boundary — **MG, BR**

- **Symptom:** an exported availability helper initially counted screenplay work but not casting,
  while an empty casting lot cue could hide a real production reservation at the same building.
- **Resolution:** production, screenplay, and casting owners contribute exact facility-slot keys to
  one collision set; actions, invariants, ticks, read models, copy, and lot priority all consume it.
- **Coverage / fastest diagnostic:** occupy the shared facility from each owner direction, attempt
  every other allocation, and assert both rejection and the same named owner in every surface.
- **Pattern:** one resource ledger, many projections. **Anti-pattern:** each feature subtracting the
  owners it happens to know about.

## CD. UI legality is continuous, not true only when a screen opens — **MG, BR**

- **Symptom:** a planner could be legal on entry, retain a selected actor who later became busy,
  and still present Start as enabled until the core safely rejected it. The lot likewise described
  auditions as optional for a Ready project that lacked a legal Plan action.
- **Resolution:** every visible action derives from the current read model, and prepared local state
  must still be a member of the current legal candidate pools before submission. Presentation cues
  require the same legal action, not merely the presence of a domain entity.
- **Coverage / fastest diagnostic:** open a valid workflow, then rerender after capacity, candidate,
  or staffing changes while alternatives remain. Controls and lot attention must update before a
  click without discarding harmless preparation.
- **Pattern:** live legality with atomic core enforcement. **Anti-pattern:** caching permission at
  navigation time.

## CE. Acknowledgement must release the decision even when the destination closes — **MG, BR**

- **Risk:** if acknowledging evidence also requires a currently staffable package, a market or busy
  change can trap Sim forever on a review the player cannot clear.
- **Resolution:** acknowledgement changes only Review to Complete and is always legal. Navigation to
  Assembly is conditional on the separate package gate; otherwise the same screen names the blocker
  and focuses the durable completed status.
- **Coverage / fastest diagnostic:** make a session Review, remove one downstream role pool, then
  acknowledge. The decision stop must clear with no time/cash/RNG change and package navigation must
  remain unavailable for the named ordinary reason.
- **Pattern:** close the information decision independently from the next workflow. **Anti-pattern:**
  coupling acknowledgement to a volatile downstream gate.

## CF. Lifecycle validation must prove elapsed time, not only field shape — **BR**

- **Symptom:** a structurally tidy V10 Review or Complete session could initially claim the same
  current week as its start, bypassing the promised one-week consequence.
- **Resolution:** completed lifecycle classes validate `currentWeek >= startedWeek + duration` in
  addition to cleared due/reservation fields and complete evidence.
- **Coverage / fastest diagnostic:** mutate valid Review and Complete saves back to their start week
  and require strict rejection; the next elapsed week remains valid.
- **Pattern:** validate temporal causality. **Anti-pattern:** treating null due fields as proof that
  time passed.

---

# Studio Calendar & Capacity Board V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `9bd2975`; implementation and hardening `b51df45`. Related:
> `docs/STUDIO-CALENDAR-V1-CONTRACT.md` and
> `docs/STUDIO-CALENDAR-V1-CLOSURE.md`.

## CG. A planning surface composes authorities; it does not become one — **MG, BR**

- **Risk:** a studio-wide calendar can quietly duplicate decision priority, command legality,
  resource allocation, or a second clock because it sees every workflow at once.
- **Resolution:** one pure projection calls the existing `nextStudioDecision`, reads persisted due
  and accounting facts, and routes by durable identity to the owning screen. It exports no action
  and persists no UI state.
- **Coverage / fastest diagnostic:** reverse every source collection and require byte-equal output;
  then change destination legality before arrival and require the destination's live read model to
  win.
- **Pattern:** compose facts and route to owners. **Anti-pattern:** an overview that reimplements
  the systems it summarizes.

## CH. Dates need both a boundary vocabulary and a certainty class — **MG, BR**

- **Symptom:** `Week N` can mean current accounting label, visible arrival after advance, inclusive
  work week, exclusive contract end, or a conditional earliest release.
- **Resolution:** core computes each boundary; copy says what happens on the advance; typed values
  distinguish committed events from conditional outlook. Contract end is always named exclusive,
  and a release boundary always names the command/allocation assumption.
- **Coverage / fastest diagnostic:** replay every projected receipt and due event through the real
  tick, and advance the final payroll week into contract expiry.
- **Pattern:** event + boundary + certainty. **Anti-pattern:** a naked calendar number whose meaning
  changes by row.

## CI. Cross-domain dashboards should reuse complete owning invariants — **BR**

- **Symptom:** a Calendar blocker initially inspected shooting-task status without proving the task
  still belonged to the production, locked director, soundstage, and blocker that Production
  Operations requires.
- **Resolution:** invoke the complete owning operations invariant at the projection boundary, then
  format the already-valid workflow. Active screenplay and casting reservations likewise reject
  missing or wrong-capability ownership rather than disappearing.
- **Coverage / fastest diagnostic:** corrupt one correlation at a time and require failure before a
  decision or occupancy card is emitted.
- **Pattern:** validate once with the domain's whole law. **Anti-pattern:** selectively copying the
  checks needed for today's card.

## CJ. Durable navigation identity still needs a live disappearance path — **MG, BR**

- **Risk:** an item can complete, expire, or become illegal between overview and destination. Focus
  can fall to `<body>`, or the destination can paint cached permission.
- **Resolution:** navigation carries only a durable ID. The destination searches its fresh read
  model, focuses the exact live action/status when present, and otherwise focuses a visible heading
  above truthful current/empty state. Explicit focus outlines cover every fallback.
- **Coverage / fastest diagnostic:** route deliberately missing script, casting, production, run,
  and contract IDs and assert both focus and the destination's live state.
- **Pattern:** identity handoff plus live lookup plus heading fallback. **Anti-pattern:** passing a
  cached card or permission object between screens.

## CK. Current occupancy and future outlook must never share visual grammar — **MG, BR**

- **Risk:** painting future production phases like reservations makes a deterministic countdown
  look like booked capacity and turns a retry assumption into a promise.
- **Resolution:** slot cards contain only exact current reservations. Production outlook reports
  present facilities and a textually conditional release boundary, with hold consequences and no
  future slot bands.
- **Coverage / fastest diagnostic:** assert exact named facility/slot identity in every phase and
  prove no future requirement appears in the occupancy union.
- **Pattern:** current ledger beside conditional outlook. **Anti-pattern:** a Gantt chart backed by
  no reservation state.

---

# Development & Casting Annex V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Research/contract `8712b79` + clarification `035e3c4`; implementation and hardening `babfb87`.
> Related: `docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md` and
> `docs/DEVELOPMENT-CASTING-ANNEX-V1-CLOSURE.md`.

## CL. Cross-domain IDs must collide with the longest-lived identity authority — **BR**

- **Symptom:** a valid historical film identity could be renamed to the future construction project
  ID; the Annex start then created a second owner of the same canonical string in another domain.
- **Resolution:** reserve all three Annex IDs against the complete persisted production-identity set,
  including canceled-film ledger rows and every later operational/history consumer. Vacant migration
  remains readable; start and authoritative project saves reject the collision.
- **Coverage / fastest diagnostic:** parameterize all reserved IDs over a live production, then leave
  only a canceled film's durable debit and require the same immutable rejection.
- **Pattern:** identity uniqueness spans every durable consumer. **Anti-pattern:** checking only the
  collection the new feature is about to append.

## CM. Temporal authorization needs an immutable event witness — **BR**

- **Symptom:** checking only `startTick >= facilityCompletedWeek` let a forged save move both a
  reservation and its mutable start clock forward. The skip-first production week made a zero-
  progress forgery especially easy to launder.
- **Resolution:** an Annex reservation reconciles the production countdown/start clock to exactly one
  authoritative production debit at the same greenlight week, and that event must not predate Annex
  availability.
- **Coverage / fastest diagnostic:** forge both a progressed pre-completion production and a Week-12
  greenlight skipped into Week 13; change reservation + start clock and require core/save rejection.
- **Pattern:** state transition time is proved by its immutable event record. **Anti-pattern:** treating
  one editable timestamp as causality.

## CN. Capacity completion order must say whether allocation reruns — **MG, BR**

- **Risk:** “opens in Week 13” is ambiguous about actions before the advance, allocations during the
  advance, and player actions after the returned state. A hidden retry would silently manufacture
  throughput.
- **Resolution:** script, casting, and production allocation use the opening facility set; construction
  completes afterward; no allocation reruns; visible Week-13 player actions may use the new slot.
- **Coverage / fastest diagnostic:** hold both base slots through `S + 12 → S + 13`, require identical
  reservations after completion, then allocate new ordinary work to the Annex in the returned state.
- **Pattern:** define ordered boundary semantics. **Anti-pattern:** a due-date label standing in for a
  transition pipeline.

## CO. Frozen compatibility can live in exact runtime projection when an old shared type is broad — **BR**

- **Risk:** retroactively narrowing a historical `StudioOperations` type would break a committed
  research instrument, while leaving historical save boundaries implicit could leak the new Annex.
- **Resolution:** frozen state aliases exclude new construction/ledger authority statically; exact
  historical validators and positive-projection builders exclude the Annex facility at runtime.
- **Coverage / fastest diagnostic:** project live legacy/vacant state through every old builder,
  reject Building/Completed downgrades, and inject unknown future roots to prove they never leak.
- **Pattern:** preserve the real old contract and tighten the versioned envelope. **Anti-pattern:**
  rewriting history for a cosmetically narrower type.

## CP. Co-events are orthogonal payloads, not competing stop reasons — **MG, BR**

- **Risk:** construction completion on a release or other higher-priority week can be lost if only one
  enum owns the result, or duplicated if every continuation surface recomputes it.
- **Resolution:** carry one typed completion payload beside the existing stop reason, render it on the
  first post-tick owner surface, and strip it before continuation.
- **Coverage / fastest diagnostic:** combine completion with weekly summary, release, and newspaper
  paths; assert the notice appears once, keeps higher-priority navigation, and never returns.
- **Pattern:** priority controls navigation; orthogonal facts survive alongside it. **Anti-pattern:**
  squeezing simultaneous events into one mutually exclusive reason.

## CQ. Capital investment needs its own exhaustive accounting home and sign convention — **MG, BR**

- **Symptom:** the signed construction debit was initially rendered as negative “spend,” while a
  catch-all classifier could silently turn a new ledger kind into film or miscellaneous economics.
- **Resolution:** every compile-guarded ledger classifier names construction explicitly. Cash views
  retain −$780,000 movement; “money spent” surfaces display its positive magnitude; film,
  fixed-cost, recurring-burn, publicity, and `otherCash` totals exclude it.
- **Coverage / fastest diagnostic:** reconcile one capital row through cash, Finance, period summary,
  and recap, then require exhaustive classifier compilation when a future kind is added.
- **Pattern:** one economic fact, context-specific sign presentation, exhaustive ownership.
  **Anti-pattern:** deriving accounting class from note text or visual sign.

## CR. Authored-world interaction geometry is production law — **MG, BR**

- **Risk:** a plausible painted parcel can overlap another semantic hotspot, put its anchor outside
  its owner, or exist only in a canvas, making clicks ambiguous and keyboard/non-renderer paths dead.
- **Resolution:** manifest hotspots are pairwise disjoint, every anchor lies inside its polygon, the
  parcel has one fixed identity, and both canvas intent and semantic navigation route to the same
  owner screen.
- **Coverage / fastest diagnostic:** test every polygon pair and contained anchor, then click the
  physical parcel in a live build and require the focused non-canvas destination.
- **Pattern:** visual place + unambiguous hit geometry + semantic fallback. **Anti-pattern:** treating
  interaction bounds as decorative art metadata.

## CS. A stronger current invariant needs an honest historical checkpoint — **BR**

- **Symptom:** SaveFileV11's universal `INITIAL_CASH + Σ ledger` check rejected authentic played
  V1/V2 saves because those formats persist current cash but predate the ledger; their frozen
  migration truthfully retains cash and can only begin the ledger later.
- **Resolution:** persist one optional migration-only `cashLedgerCheckpoint` at the validated
  historical prefix and reconcile every later movement from it. Do not fabricate a balancing row,
  weaken suffix/capex identity, rewrite frozen validators, or reconstruct events that were never
  saved.
- **Hardening:** historical projections must prove the checkpoint is canonical, still at the ledger
  end, and representable by the target. Otherwise a builder can launder either post-checkpoint
  activity or an invalid checkpoint by dropping it and remigrating.
- **Coverage / fastest diagnostic:** migrate authentic played V1/V2 cash through every V1–V10
  descendant, then append suffix activity and adversarially alter anchor, cash, boundary, and rows;
  require exact rejection while checkpoint-free V11 remains byte-identical.
- **Pattern:** explicit carried-history boundary + strict forward suffix. **Anti-pattern:** invented
  accounting history or projection as validation bypass.

## CT. Evidence integrity requires semantic joins, not only canonical bytes — **MG, BR**

- **Risk:** a generated corpus can be canonical JSON, hash-complete, deterministic, and still be a
  convincing counterfeit if variable weekly rows, intents, boundaries, immutable entry saves, and
  conclusions are never required to agree with one another.
- **Resolution:** treat accepted evidence as a relational proof backed by deterministic execution.
  Join every intent ID and signing bonus to its exact week and ledger row; derive entry and warning
  truth from governed replay; exact-compare every campaign, continuation, player-policy, pair and
  fixture row; stream-recompute the complete typed summary and Markdown; require exact row counts,
  chronology, immutable saves and live Git authority before accepting the digest manifest.
- **Hardening lesson:** optional values need explicit null guards. An expression such as
  `optional?.delta !== 0` is true when the optional value is absent because `undefined !== 0`; that
  can falsely reject every ordinary row while looking like a strict invariant.
- **Coverage / fastest diagnostic:** mutate one internally plausible variable row while rebuilding
  every file hash, then require semantic verification to reject it. Separately generate a real
  evidence slice and compare H/D numerators, original-versus-recurrence denominators, selected-term
  obligations, player identities, and rendered representative facts to the independent source run.
- **Pattern:** immutable authority + bounded deterministic replay + independent recomputation.
  **Anti-pattern:** treating a self-consistent checksum envelope or schema-shaped summary as proof
  of simulation meaning.

---

# Film Chronicle V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `4c76216`; implementation `f59b467`. Related:
> `docs/FILM-CHRONICLE-V1-CONTRACT.md` and `docs/FILM-CHRONICLE-V1-CLOSURE.md`.

## CU. A durable artifact should project frozen event identity, not today's entity state — **MG, BR**

- **Risk:** an archived film can quietly change writer, employment, Fit, or creative identity when
  a presentation joins through the current roster or the nearest screenplay-shaped record.
- **Resolution:** associate the released film by exact production ID to one Produced screenplay and
  one immutable production debit, then bill only frozen FilmResult participants. Older missing
  history stays visibly unavailable; it is never inferred from current talent or delivered output.
- **Coverage / fastest diagnostic:** interleave two films' scripts and ledger rows, reverse every
  source array, mutate current talent, export/import, and require the exact same disjoint records.
- **Pattern:** immutable event witness + exact cross-domain ID + honest absence. **Anti-pattern:**
  reconstructing a past creative decision from current state or visual similarity.

## CV. A durable summary and a session autopsy are different products — **MG**

- **Symptom:** an `Autopsy` action silently fell back to an archived film record after reload, so
  one label described two different evidence bases.
- **Resolution:** expose Chronicle, Clipping, and Autopsy as distinct routes. Chronicle and Clipping
  rebuild from persisted authority; Autopsy is enabled only while its exact pre-release snapshot
  survives. The unavailable action explains the boundary instead of changing destination.
- **Coverage / fastest diagnostic:** release live, open all three paths, reload the save, and require
  Chronicle/Clipping to remain stable while Autopsy becomes visibly unavailable.
- **Pattern:** one label, one evidence basis, one destination. **Anti-pattern:** navigation fallback
  that preserves clickability by changing the meaning of the click.

## CW. A shared document needs explicit route-entry scroll and focus ownership — **MG**

- **Symptom:** opening a release from a deep, horizontally scrollable dashboard could preserve the
  old document position and land below the new poster; an Annex co-event could also lose its first
  announcement if every new surface focused itself unconditionally.
- **Resolution:** reset document scroll on Chronicle entry, focus the film-title heading without
  scrolling, and yield that first-focus beat when an authoritative construction-completion notice
  is present. Contain genuinely wide tables in labelled keyboard-scroll regions rather than making
  the whole page overflow.
- **Coverage / fastest diagnostic:** enter from a deep dashboard at 200% zoom, combine the route
  with a completion co-event, and assert scroll zero, the correct focus owner, and reachable trailing
  actions without page-level horizontal overflow.
- **Pattern:** explicit entry state + co-event focus priority + local overflow containment.
  **Anti-pattern:** assuming a component swap behaves like a browser navigation.

---

# Hollywood Dynamic People Role Atlas V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `b01edc2` + Camera amendment `0ee129c`; assets `471c8ef`; runtime `66f856c`.
> Related: `docs/HOLLYWOOD-DYNAMIC-PEOPLE-ROLE-ATLAS-V1-CONTRACT.md`,
> `docs/HOLLYWOOD-DYNAMIC-PEOPLE-ROLE-ATLAS-V1-EVIDENCE.md`, and
> `docs/HOLLYWOOD-DYNAMIC-PEOPLE-ROLE-ATLAS-V1-CLOSURE.md`.

## CX. Generated source pixels, not the model invocation, are asset authority — **BR**

- **Risk:** treating an image prompt or remote generation result as the compiler makes the build
  nondeterministic, unverifiable, and dependent on a service that may later change.
- **Resolution:** commit the final selected source pixels, prompts, result IDs, hashes, crop boxes,
  rights basis, and transformation rules. The local exporter is deterministic from those pixels and
  runtime never invokes a model or network.
- **Coverage / fastest diagnostic:** export three clean outputs and exact-compare PNG/JSON bytes to
  the committed runtime assets; independently hash every source named by the manifest.
- **Pattern:** frozen creative source → deterministic local derivative. **Anti-pattern:** prompt →
  live model call → build artifact.

## CY. Failure fallback assets need a disjoint runtime namespace — **BR**

- **Symptom:** the procedural Camera-person fallback reused the camera-dolly occluder's texture key,
  so atlas failure could silently produce the wrong image despite valid fallback code.
- **Resolution:** reserve distinct keys for people, occluders, vehicles, and authored atlas assets;
  exercise the real absent/invalid-asset scene, not only a pure mapper.
- **Coverage / fastest diagnostic:** intercept the manifest and PNG independently, then require all
  nine fallback people, pointer/DOM identity, route, depth, and input to remain intact.
- **Pattern:** namespace by representation and owner. **Anti-pattern:** relying on English role names
  to be globally unique across an authored scene.

## CZ. Performance evidence must sample the renderer's raw clock — **BR**

- **Symptom:** Phaser's callback delta is smoothed, so a rolling p99 and worst-frame panel built from
  it understated the actual frame-time tail while looking statistically complete.
- **Resolution:** sample `game.loop.rawDelta`, warm the complete live scene, retain a bounded rolling
  window, reset on boot/resume, and report average, 1%-low, p99, worst, update, draws, objects,
  actors, and complete decoded texture cost together.
- **Coverage / fastest diagnostic:** inject a known raw-frame spike while callback delta stays
  smoothed; require p99/worst to reflect the spike and the window to reset after resume.
- **Pattern:** raw clock + declared warm-up/window + complete scene counters. **Anti-pattern:** precise
  percentiles over a smoothed input.

## DA. Pixel validators must name the channel semantics they compare — **BR**

- **Risk:** Pillow's default RGBA `getbbox()` can evaluate alpha alone, allowing two fully opaque
  directions with different RGB pixels to look identical to a distinction check.
- **Resolution:** compare full RGBA difference bounds explicitly with `alpha_only=False`, while
  separately proving alpha, coverage, registration, and exact mirrored-West identity.
- **Coverage / fastest diagnostic:** create opaque frames with equal alpha and different RGB; the
  distinction gate must pass, while byte-equal RGB must fail it.
- **Pattern:** explicit channel semantics per invariant. **Anti-pattern:** assuming an image-library
  default means all channels.

---

# World-First Product Doctrine — OWNER RULING

## DB. The lot is the game surface; deep UI is supporting infrastructure — **MG, BR**

- **Product failure:** a beautiful district that only visualizes decisions made through menus is
  still a screen-first management application, not the intended studio tycoon.
- **Ruling:** ordinary play begins in the persistent Studio Lot. The player selects visible people,
  productions, buildings, queues, and blockages; acts there when the decision fits; opens a deep
  panel only for necessary complexity; and returns to the same live camera and context.
- **Authority:** Engine/GameState still owns results, legality, tasks, reservations, clocks, economy,
  and RNG. The lot emits intent and renders fresh truth. Animation is evidence of work, not work.
- **Coverage / fastest diagnostic:** spend several minutes selecting a real production, clicking its
  blockage, assigning or redirecting a named person, watching travel, seeing work resume, inspecting
  another inhabitant, checking construction, and reacting to an event without leaving the lot.
- **Pattern:** `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → SAME LIVE WORLD`.
  **Anti-pattern:** `MENU → MENU → MENU → OCCASIONAL LOT VIEW`.

---

# World-First Soundstage Intervention V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `001c692`; implementation `c48f8ac`. Related:
> `docs/WORLD-FIRST-SOUNDSTAGE-INTERVENTION-V1-EVIDENCE.md` and
> `docs/WORLD-FIRST-SOUNDSTAGE-INTERVENTION-V1-CLOSURE.md`.

## DC. Physical world identity must be exact at both scene and host boundaries — **MG, BR**

- **Risk:** a visible stage can select `operations[0]`, retain a stale film, or let a convenient
  Stage 12/deep-panel context masquerade as the production physically occupying Stage 7.
- **Resolution:** derive one identity-only event from the latest managed + Engine-authority + exact
  `stage-a` snapshot, then independently revalidate that full predicate and production ID in the
  React host before exposing a command. Explicit selections fail closed when their identity leaves.
- **Coverage / fastest diagnostic:** reverse two production rows, select Stage 12 first, replace the
  snapshot, then click physical Stage 7; require only the exact current Stage 7 film or ordinary
  place behavior when none exists.
- **Pattern:** latest-snapshot physical selector → identity-only event → latest-host revalidation.
  **Anti-pattern:** array order, inferred facility identity, or stale inspector fallback.

## DD. Over-canvas UI must contain native input before a global renderer sees it — **BR**

- **Symptom:** a Studio Desk command visually received the click, but Phaser's window-level
  `mousedown` selected Administration beneath it first and unmounted the command before React's
  later `click` could dispatch.
- **Resolution:** every Hollywood over-canvas surface changed by this intervention contains
  `pointerdown`, `mousedown`, and `touchstart`; every scene hit, drag start, and wheel handler
  independently accepts only an event whose native target is the actual game canvas.
- **Coverage / fastest diagnostic:** attach document/window listeners for all three down families,
  activate the real overlay command, and require no escape; separately send a foreign-target Phaser
  pointer and require no world event before proving an explicit canvas target still works.
- **Pattern:** contain at the overlay + fail closed at the renderer. **Anti-pattern:** stopping only
  React `pointerdown` while the renderer listens to mouse/touch globally.

---

# World-First Live Week Advance V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `3391528`; implementation `621e7e1`. Related:
> `docs/WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-EVIDENCE.md` and
> `docs/WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CLOSURE.md`.

## DE. Return origin must be explicit data carried through every deep branch — **MG, BR**

- **Risk:** Dashboard and lot releases share the same Gazette source, so inferring destination from
  route, current screen, or newspaper presence can return to the wrong home or hide a non-Gazette
  release.
- **Resolution:** create one discriminated Dashboard/lot return context at the tick owner and carry
  it through Newspaper, ReleaseResult, and Autopsy. Test `released.length` before Gazette
  eligibility; the latter decides presentation order, never whether a release exists.
- **Coverage / fastest diagnostic:** replay Gazette, non-Gazette, direct-Autopsy, and historic
  clipping paths from both origins and require their exact final destination and session evidence.
- **Pattern:** origin at event creation → explicit propagation → one terminal router.
  **Anti-pattern:** reconstructing intent from whichever screen happens to be mounted.

## DF. A delayed renderer must construct from latest host truth — **BR**

- **Symptom:** the dynamic lot import could begin on Week N, resolve after an App-owned tick, and
  construct its first scene from the stale mount-time state before normal snapshot delivery became
  ready.
- **Resolution:** retain the latest pure snapshot in the React host and use that reference both for
  late construction and subsequent delivery. Renderer readiness never becomes a clock or event
  owner.
- **Coverage / fastest diagnostic:** hold the dynamic import, advance one exact week, then resolve it
  and require its very first constructed snapshot to be Week N+1 with no stale frame or second tick.
- **Pattern:** async presentation readiness reads latest owner state. **Anti-pattern:** constructor
  closure captured before an authoritative transition.

## DG. Completion announcement ownership is an event, not persisted-state inference — **MG, BR**

- **Risk:** an Annex completing during a lot tick or release chain can produce an exact completion
  notice and then immediately repeat a generic “Operational” announcement derived from persisted
  building state.
- **Resolution:** the adapter's exact completion summary owns the event once. Carry a transient,
  non-serialized suppression bit through the same release chain and mount; allow the generic
  persisted-state announcement again only on a later ordinary fresh entry.
- **Coverage / fastest diagnostic:** combine release + completion, traverse every Continue/Autopsy
  branch, return to lot, advance again, then leave and freshly re-enter. Count focus and live-region
  ownership at every step.
- **Pattern:** exact event owns ceremony; persisted state owns later orientation.
  **Anti-pattern:** deriving a new event every time an already-complete state renders.

---

# World-First Annex Construction Interaction V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `6cab9c9`; implementation `7a370fd`. Related:
> `docs/WORLD-FIRST-ANNEX-CONSTRUCTION-INTERACTION-V1-EVIDENCE.md` and
> `docs/WORLD-FIRST-ANNEX-CONSTRUCTION-INTERACTION-V1-CLOSURE.md`.

## DH. World intent must fail closed unless one latest visual projection agrees with the owner read model — **MG, BR**

- **Risk:** a canonical scene identity can still be paired with an absent, duplicated, or
  lifecycle-stale visual projection. Letting that identity open or retain a command can make a
  Vacant parcel actionable while the authoritative construction view is already Building.
- **Resolution:** require exactly one latest `expansion` building and require its
  `constructionStatus` to equal the latest `studioDevelopment(state).status` at entry, retention,
  and activation. The complete transition stays `world intent → App owner → parameter-free action
  against latest GameState → one successful replacement → fresh read model/snapshot → same mounted
  world`; Phaser carries identity only.
- **Coverage / fastest diagnostic:** test absent, duplicate, wrong-status, delayed-import, and stale
  post-render projections, then require no route, owner call, mutation, or fallback command. From an
  identical valid pre-state, require the lot and deep Studio Development surfaces to produce
  byte-identical GameState, RNG, ledger, and SaveFileV11 output.
- **Pattern:** exact latest visual witness + fresh owner read + one intent. **Anti-pattern:** treating
  a once-valid scene event or a conveniently named building as durable command authority.

## DI. A world affordance is not accepted until live depth and zoom prove it remains visible — **BR**

- **Symptom:** automated identity and selection tests passed while the Annex lifecycle label at
  depth 88 could be occluded by higher-depth world content during ordinary live inspection.
- **Resolution:** move only that actionable label to depth 169, below the existing selected-place
  outline and person-nameplate priorities, and verify its physical hit, text, and selection at both
  management scale and actual maximum camera zoom. Pointer-out also restores the persistent selected
  outline instead of clearing it after a transient hover.
- **Coverage / fastest diagnostic:** inspect the governed viewport matrix and actual maximum world
  zoom in the running scene, click both polygon and visible label, and require the same exact context
  without a new display object, draw, texture, route, or decoded-byte allocation.
- **Pattern:** live compositing proof at gameplay zooms. **Anti-pattern:** equating a semantic hit
  test or isolated layer snapshot with a readable affordance in the composed world.

## DJ. Repeating an identical live-region message requires a new DOM identity — **MG, BR**

- **Symptom:** two legitimate stale-action rejections can return the same exact core error; merely
  assigning the same string again leaves the live-region DOM unchanged and may suppress the second
  assistive announcement.
- **Resolution:** retain one stable polite owner region but replace its keyed child for every
  rejection or success attempt. The serial is presentation-only, is never saved, and neither
  changes nor duplicates the authoritative error text.
- **Coverage / fastest diagnostic:** return the identical rejection twice and require one owner call
  per activation, a replaced child node, retained Annex selection/focus, and byte-identical
  GameState, RNG, ledger, save, and renderer snapshot after each rejection.
- **Pattern:** stable announcement owner + per-event DOM identity. **Anti-pattern:** assuming a state
  setter can make unchanged text observable as a second accessibility event.

---

# World-First Scenery Load-In V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `b03bb10`; implementation `3a667e0`. Related:
> `docs/WORLD-FIRST-SCENERY-LOAD-IN-V1-EVIDENCE.md` and
> `docs/WORLD-FIRST-SCENERY-LOAD-IN-V1-CLOSURE.md`.

## DK. One gesture cannot become consent to a freshly repainted successor — **MG, BR**

- **Symptom:** a real double-click or held Enter can activate Clear, receive the immediate
  blocked → ready repaint, and land its remaining native events on the new Schedule button. Both
  individual commands are legal, but the player supplied only one intent.
- **Resolution:** bind activation to the rendered state and field-exact rendered command, recheck
  both against the latest selector, synchronously mark the command pending, reject a second native
  click detail, and retain a held-key generation until keyup. Fresh Schedule needs a fresh gesture.
- **Coverage / fastest diagnostic:** run a real `dblClick` and held `{Enter>.../}` across a live
  component repaint; require one owner call, exact ready bytes, and an enabled but undispatched
  Schedule successor.
- **Pattern:** one gesture + one rendered generation + latest-owner validation. **Anti-pattern:**
  assuming a disabled old DOM node can contain native events after React replaces it.

## DL. Renderer refusal removes the outline, not the authoritative semantic action — **MG, BR**

- **Risk:** requiring a canonical scene-selection success before retaining React context makes an
  absent/malformed manifest or failed renderer erase an otherwise legal Engine action; pretending
  success instead invents a physical outline that does not exist.
- **Resolution:** scene host-selection is a truthful boolean. `false` paints nothing. React still
  owns the native exact context and existing command whenever the latest Engine selector is valid.
  Separate tests prove absent, drifted, duplicate, and malformed canonical identities return false
  before one shared semantic inspect → Clear → Schedule continuation proof.
- **Coverage / fastest diagnostic:** omit the service place, corrupt one exact literal, duplicate
  service or Stage 7, and reject renderer construction. Require no scene event/outline/throw and a
  byte-identical semantic successor.
- **Pattern:** presentation capability may fail while owner truth remains operable. **Anti-pattern:**
  using renderer readiness or asset validity as action legality.

## DM. Presentation feedback must expire against every fresh authority path — **BR**

- **Symptom:** a delivery sweep can finish and announce “ready to schedule,” then a generic Stage 7
  command or external scheduled/relocated/absent snapshot supersedes it without passing through the
  dedicated service-context cleanup. The stale toast can survive beside contradictory truth.
- **Resolution:** record the exact arrival acknowledgement only when the latest shared selector is
  truly ready. Any fresh snapshot whose exact ready identity no longer matches clears only that
  acknowledgement. Renderer callbacks independently suppress late arrival events when current
  Stage 7 truth is already scheduled.
- **Coverage / fastest diagnostic:** finish the sweep through both dedicated and generic Stage 7
  paths, then schedule locally or replace with scheduled, relocated, duplicate, or absent truth;
  require immediate feedback removal and fail-empty selection without hiding unrelated activity.
- **Pattern:** feedback identity tied to the read model it describes. **Anti-pattern:** cleanup tied
  only to the UI path that happened to create the message.

## DN. Divergent authored/runtime manifests require a consumption-only freeze — **BR**

- **Risk:** a deterministic exporter can still be destructively wrong when its authored input is
  stale relative to accepted runtime identity. Re-running it would produce reproducible bytes while
  erasing the Annex and moving accepted Stage 7/service geometry.
- **Resolution:** hash the source, runtime, exporter, plate, and every PNG; replay the exporter only
  in a clean temporary directory; pin its divergent manifest; and treat the accepted runtime as
  consumption-only until a separate reconciliation milestone owns regeneration.
- **Coverage / fastest diagnostic:** require the clean-export manifest's distinct byte/hash anchor,
  byte-freeze all accepted artifacts, and exact-validate unique service, destination, and Annex
  records before allowing the scene seam.
- **Pattern:** deterministic replay + explicit divergence + no-write boundary. **Anti-pattern:**
  treating reproducibility as proof that an exporter input still owns current product truth.

---

# World-First Studio Home V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `8d5f8dd`; implementation `0c4bd9d`.

## DO. A default-on adoption test must exercise the default, not a positive override — **BR**

- **Risk:** setting a browser harness env flag to `1` makes the test pass even if the shipped
  default regresses off; inheriting a developer-shell `0` makes the same proof non-hermetic.
- **Resolution:** scrub hostile inherited env with an absent or neutral value that resolves through
  the default branch, leave runtime storage absent for ordinary-player proof, and use explicit `0`
  only for rollback cases.
- **Pattern:** neutral inputs + default assertion + explicit rollback case. **Anti-pattern:** proving
  a default by positively enabling it.

## DP. Return origin and world selection are typed transient data with a studio lifetime — **MG, BR**

- **Risk:** reconstructing origin from the mounted screen loses the correct world focus, while
  module-level selection can leak a prior studio's building into a replacement studio.
- **Resolution:** carry one discriminated return context through every supporting branch without
  serializing it into GameState, and reset presentation memory only when a new game or accepted save
  replaces the authoritative studio. A rejected replacement keeps the live studio's context.
- **Pattern:** typed transient origin + explicit replacement reset. **Anti-pattern:** route inference,
  save-schema fields, or presentation memory that outlives its studio.

## DQ. Gitignored fixtures must regenerate and prove native save authority — **BR**

- **Risk:** a developer-local fixture can be stale or can fabricate a desired balance by rewriting
  cash, violating SaveFileV11 ledger reconciliation while the UI evidence still looks plausible.
- **Resolution:** regenerate gitignored evidence fixtures from Engine actions at test time, validate
  the native save version and ledger-derived cash before browser import, and assert the exact
  read-model outcome rather than a hand-shaped narrative.
- **Pattern:** regenerate → validate native envelope and invariants → render. **Anti-pattern:** reuse
  unknown local bytes or mutate ledger-reconciled cash to manufacture an evidence state.

---

# World-First Named Person Work & Career Inspector V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Corrected contract `c5c1679` (initial freeze `9bd075b` is historical); implementation `04f7d9d`.

## DR. Cross-model identity joins need exact authority and cardinality — **MG, BR**

- **Risk:** joining a Lot person to an operation or profile by name, title, array order, or the
  profile's primary discipline can silently transfer work between people or reject a legal
  cross-discipline assignment. A last-write-wins engagement map has the same failure in hostile
  multi-assignment state.
- **Resolution:** keep the pure Lot work join snapshot-only and require one exact person plus one
  exact operation participant across ID, name, role, picture ID/title, and provenance. Separately
  scan every GameState production role and active screenplay assignment as a zero/one/many gate,
  then require unique profile ID/name and exact assignment identity before career copy or handoff.
  The operation owns role on this picture; Talent Profile owns career-home truth.
- **Coverage / fastest diagnostic:** duplicate an operation, reuse one ID across two pictures or a
  screenplay, change one name/title/provenance field, and give a primary Writer the Director slot.
  Every ambiguous case must withhold detail while the legal cross-discipline case remains exact.
- **Pattern:** exact per-model authority + explicit cardinality + bounded join. **Anti-pattern:**
  convenient equality, first/last match, or treating career identity as assignment authority.

## DS. Modal input suspension and renderer liveness are separate concerns — **BR**

- **Risk:** focus trapping alone does not stop Phaser's global pointer, wheel, or camera-key input;
  destroying or pausing the renderer to solve that leak breaks the promise of one continuously
  inhabited Lot.
- **Resolution:** contain pointer/mouse/touch/wheel families at the modal boundary and suspend the
  existing scene input plugins, clearing held keys and drag latches on both transitions. Preserve
  the mounted view, game, canvas, animation, and ambience, and carry suspension through delayed
  renderer readiness and document visibility changes.
- **Coverage / fastest diagnostic:** attack the covered canvas directly with every input family and
  a key held across modal entry, then close and compare the canvas node/marker, camera, selection,
  save bytes, and URL. Repeat with delayed construction and hide/resume.
- **Pattern:** live renderer + inert controls + defensive DOM containment. **Anti-pattern:** assuming
  a focus trap blocks world input, or recreating the world for a supporting overlay.

## DT. A profile handoff must fail closed for its entire open lifecycle — **MG, BR**

- **Risk:** a profile that was exact when opened can become stale after a save replacement, person
  disappearance, name drift, duplicate identity, operation change, or assignment ambiguity. Keeping
  only a resolvable ID can transfer the overlay to changed identity or auto-reopen it later.
- **Resolution:** revalidate unique Lot identity, unique profile ID/name, exact work membership, and
  unambiguous assignment on every render. On any loss, clear the App-owned raw ID once, clear stale
  person/production context as applicable, and focus the named-people group or Lot heading rather
  than a detached opener. Renderer rejection still preserves the same semantic handoff; reduced
  motion changes presentation only.
- **Coverage / fastest diagnostic:** mutate or remove the selected person while the canonical drawer
  is open, then restore the old ID. Require one close, no transfer or automatic reopen, stable world
  focus, and no Engine/GameState/SaveFile/RNG/ledger change.
- **Pattern:** exact open gate + continuous revalidation + stable fallback focus. **Anti-pattern:**
  validating only at click time or letting raw ID resolvability define identity.

---

# World-First Operational Annex Work Presence V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `e2fd6df`; implementation `e14633b`. Related:
> `docs/WORLD-FIRST-OPERATIONAL-ANNEX-WORK-PRESENCE-V1-EVIDENCE.md` and
> `docs/WORLD-FIRST-OPERATIONAL-ANNEX-WORK-PRESENCE-V1-CLOSURE.md`.

## DU. A physical workplace needs one exact owner row, not parallel UI reconstruction — **MG, BR**

- **Risk:** assembling Annex occupancy independently from facilities, reservations, scripts,
  casting sessions, and productions can accept a lookalike row, transfer same-title work, or show
  Available while a canonical slot is occupied.
- **Resolution:** call the existing Calendar authority once, select the exact unique canonical
  facility ID, preserve its slot identity/counts, and join production status only to one exact
  outlook. A snapshot-only selector then revalidates lifecycle, authority, identity, counts,
  owner/activity, and status/blocker shape before either Phaser or React presents it.
- **Coverage / fastest diagnostic:** permute rows; duplicate the canonical ID; mutate name,
  capability, capacity, slot, occupied/available, owner, title, activity, and production outlook;
  require null or an invariant error rather than a first-match result.
- **Pattern:** one authoritative row → exact projection → pure shared validator. **Anti-pattern:**
  convenient joins over raw arrays in each presentation layer.

## DV. One gesture must stay bound to the world identity rendered at its start — **MG, BR**

- **Symptom:** an occupant can change between pointer/key down and click after React repaints the
  Annex; revalidating only the new button can turn the tail of a stale gesture into consent to open
  a replacement owner's deep screen.
- **Resolution:** capture the complete rendered owner context at down time, consume that latch once
  at activation, and require it and the latest shared selector to agree field-for-field. Clear
  latches across modal, selection, visibility, and renderer lifecycle boundaries.
- **Coverage / fastest diagnostic:** down on owner A, replace with owner B, then deliver click;
  repeat with double-click, held Enter/Space, modal entry, and callback rejection. Require zero
  substitution and at most one owner call.
- **Pattern:** gesture generation + rendered identity + latest authority. **Anti-pattern:** treating
  the DOM node present at click time as proof of the player's original target.

## DW. Deep-return focus targets exist only after the fresh world commits — **BR**

- **Symptom:** returning from a deep owner selects the Annex correctly but focuses `BODY` because
  the Current work heading is conditionally mounted after the first return render.
- **Resolution:** carry one typed transient return intent, rebuild the latest world context, retain
  a pending focus owner through the selection render, and focus by stable target only after mount.
  Consume the intent once; fall back to Annex status or the Lot heading when current truth no
  longer supports it.
- **Coverage / fastest diagnostic:** return to Available, same owner, replacement owner, and Held;
  repeat with delayed renderer readiness and missing/hostile truth. Require fresh copy plus one
  deterministic focus destination, never a cached occupant or destructive command.
- **Pattern:** latest-state remount → conditional target commit → consume focus. **Anti-pattern:**
  focusing a target synchronously before the render that creates it.

## DX. An inert transition can erase modal opener identity before a passive effect runs — **BR**

- **Symptom:** opening Talent Profile over the live Lot makes the Lot inert and the browser blurs
  the opener before the drawer effect reads `document.activeElement`; Escape then restores focus to
  `BODY` even though standalone drawer tests pass.
- **Resolution:** the App boundary captures the opener synchronously inside the open callback,
  before inertness. After close and inert removal, a next-frame restore requires the same epoch, no
  reopened profile, a connected opener, and no inert ancestor. Accepted studio replacement clears
  the opener and invalidates the epoch instead of focusing stale UI.
- **Coverage / fastest diagnostic:** in real Chromium open from a physical-world inspector, close
  by Escape and button, and require the exact opener. Reopen before the pending frame and replace
  the studio while open; require no stale focus.
- **Pattern:** pre-transition capture + post-transition guarded restoration. **Anti-pattern:**
  discovering the opener in a passive modal-mount effect after the underlying surface became inert.

## DY. Renderer structure is feature delta; scene population is fixture truth — **BR**

- **Risk:** calling a governed one-production `34 objects / 15 actors` tuple a universal maximum
  makes a legal two-production Annex fixture look like a renderer regression, while quoting only
  the smaller fixture can hide actual feature allocation.
- **Resolution:** freeze the reference tuple exactly, separately report each native fixture's
  population, and prove the Annex paint reuses its existing Graphics/label with zero objects,
  actors, textures, routes, or draws added. Keep wall-clock host failures visible and never infer an
  absolute performance pass from structural parity.
- **Coverage / fastest diagnostic:** measure fresh 240-sample windows for the native script fixture,
  the two-production native allocation, and the frozen one-production reference; attribute
  population differences before claiming a feature delta.
- **Pattern:** exact fixture population + explicit feature delta + separate wall clock. **Anti-
  pattern:** universalizing one reference tuple or relabelling compositor contention as a pass.

---

# World-First Selected Stage 7 Production Detail Handoff & Fresh Return V1 — CLOSED ON AUTONOMOUS MARATHON BRANCH

> Contract `05d2d44`; implementation `6a3f85f`. Related:
> `docs/WORLD-FIRST-SELECTED-STAGE-7-PRODUCTION-DETAIL-HANDOFF-FRESH-RETURN-V1-EVIDENCE.md` and
> `docs/WORLD-FIRST-SELECTED-STAGE-7-PRODUCTION-DETAIL-HANDOFF-FRESH-RETURN-V1-CLOSURE.md`.

## DZ. One physical identity needs one shared strict selector across scene and host — **MG, BR**

- **Risk:** independent `find(stage-a)` logic in Phaser and React can choose different productions,
  accept duplicate IDs, or transfer a same-title Stage 12 film into Stage 7 interaction.
- **Resolution:** one snapshot-only selector validates managed/Engine authority, exact Stage 7
  cardinality, global production-ID uniqueness, phase, identity, countdown/progress, people,
  blocker, and command shape. Both presentation layers consume that result; malformed truth paints
  and navigates nothing.
- **Coverage / fastest diagnostic:** permute operations, duplicate Stage 7 or an ID, add a same-title
  Stage 12 row, and mutate each nested discriminant independently. Scene status, physical selection,
  semantic context, and host action must all fail together.
- **Pattern:** one authority projection → many presentations. **Anti-pattern:** first plausible row
  or separately maintained validation in each layer.

## EA. Visible inspector context is not proof of world provenance — **MG, BR**

- **Risk:** a desk that auto-orients to the only production can expose a deep action even though the
  player never selected that film in the world, quietly turning the Lot into a menu with scenery.
- **Resolution:** track a separate transient provenance token granted only by physical/status/problem
  selection, its native semantic equivalent, exact same-film continuation, or typed return. Generic
  rails, people, Dashboard, and auto-selection may still show useful context but cannot claim the
  world-provenance-only action.
- **Coverage / fastest diagnostic:** load the same snapshot through every entry source and assert
  identical inspector facts but different deep-action eligibility. Then change place/person/film or
  authority and require immediate fail-empty clearing without substitution.
- **Pattern:** context can be informative while consent remains source-specific. **Anti-pattern:**
  treating whatever the inspector currently renders as proof of the player's selection intent.

## EB. Cancelled physical gestures and fresh virtual-AT clicks need different lifetimes — **BR**

- **Symptom:** pointerdown on film A, repaint, compatibility mousedown/click on film B can retarget a
  stale gesture; suppressing every next click after cancellation instead blocks a legitimate screen-
  reader `click(detail=0)`.
- **Resolution:** latch only the first accepted down identity, never replace it during compatibility
  events, and mark suppression only when a physical pointer/touch activation was actually in flight.
  Consume that token only for a later physical `detail>0` click. Own Enter/Space synchronously on
  keydown with `preventDefault`; allow a fresh virtual-AT click to validate current truth normally.
- **Coverage / fastest diagnostic:** pointerdown A → repaint → mousedown/click B; pointercancel →
  physical click; pointercancel → fresh `detail=0` click; held Enter/Space across modal, hidden-tab,
  renderer failure/readiness, and import boundaries. Require no retargeting and at most one owner
  call without excluding AT.
- **Pattern:** input-family-aware gesture generation + latest authority. **Anti-pattern:** one sticky
  “suppress next click” bit for all activation sources.

## EC. Exact deep return restores the old identity or nothing — **MG, BR**

- **Risk:** returning by selected building or current Stage 7 occupant can highlight a replacement
  film and imply continuity the player did not choose. Caching the old operation instead shows
  obsolete commands after a legitimate Board action.
- **Resolution:** carry only the mandatory old production ID in a discriminated transient return
  arm, rerun the shared selector after remount, and restore current fields/outline/focus only when
  that exact ID remains uniquely at Stage 7. Otherwise focus the neutral Lot heading. A Board
  command may change current truth; its successor is rebuilt, never replayed.
- **Coverage / fastest diagnostic:** return after same-state navigation, an accepted command,
  removal, release, relocation, replacement, duplicate ID, malformed state, unrelated Dashboard
  child navigation, and cross-studio ID collision. Require fresh exact truth or neutral fallback,
  never a substitute.
- **Pattern:** old identity token → fresh authority → exact or neutral. **Anti-pattern:** selected-
  building fallback, current-occupant fallback, or cached pre-navigation detail.
