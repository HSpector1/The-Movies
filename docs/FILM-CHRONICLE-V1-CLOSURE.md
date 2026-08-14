# Film Chronicle V1 Closure

Status: **IMPLEMENTED, VALIDATED, AND CLOSED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Contract authority: `4c762160a222fb40c26a6bf9cc40ede1be8844fe`

Implementation candidate: `f59b4675a745734f721b7ec73d5bee04eb7c7813`

Implementation tree: `ddedf0641f2305e0101a6f95171621eda49cf4c9`

## Result

Film Chronicle V1 makes a released picture visibly belong to the player before asking them to
read its analysis. The release surface now pairs one deterministic studio one-sheet with the
truthful Silver Screen Gazette report. Every participant-bearing released film also has a durable
`Film Chronicle` record, distinct from its newspaper `Clipping` and the session-only mathematical
`Autopsy`.

The five-second release read now exposes the exact title, genre, locked Shape, intended audience
promise, frozen director and lead, recorded production chronology, strongest and weakest package
Fit, and critic/audience reception. The Gazette retains the existing opening-week paid versus
projected full-run accounting boundary and disclosure.

This is a presentation and pure read-model milestone. It adds no plot generator, result grade,
production incident, action, tick rule, economy rule, reception rule, career rule, save field, RNG
draw, wall-clock dependency, remote asset, or simulation clock.

## Authority and lineage

| Purpose | Commit |
| --- | --- |
| Accepted D-17B + Operation Hollywood history integration | `4432a9befef578ac3549896c2796bf0a22950ec0` |
| Final Annex compatibility authority | `8b7e95eb92f6f809522a595b4b458d4f19e26852` |
| Reviewed Week-208 observatory authority | `f16e2e0b184f6818d373d77556c5c7a1b3df7b94` |
| Frozen Film Chronicle V1 contract | `4c762160a222fb40c26a6bf9cc40ede1be8844fe` |
| Film Chronicle V1 implementation candidate | `f59b4675a745734f721b7ec73d5bee04eb7c7813` |

The governing economic status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Film Chronicle V1 neither certifies nor changes the economy.

## Pure Chronicle law delivered

`buildFilmChronicle` is one narrow deterministic projection over the exact released film and its
persisted witnesses. It receives no mutable `GameState`, current talent record, hidden actual
ability, delivered-expression surrogate, seed, RNG stream, or wall-clock value.

For an eligible released film it returns fresh values for:

- title, genre, production identity, and the existing recorded reception;
- exact locked screenplay Shape, Promise ranges, intended segments, commission week, and rewrite
  count from the one exact Produced ScriptProject;
- frozen writer, director, Lead, Antagonist, Support, and Production/Craft Lead credits;
- exact commission, greenlight, release, and elapsed-week chronology; and
- canonical strongest and weakest frozen greenlight Fit, including exact decimal values and the
  existing 70/45 newspaper boundaries.

Collection order does not affect the result. Returned shapes, ranges, participant trees, expected-
performance bands, reception records, and package records are detached from their sources.
Mutation of one result cannot mutate the save or another projection.

## Fail-closed identity and chronology

The Chronicle selects only the named production. A duplicate exact script link, writer mismatch,
director mismatch, wrong credit role, duplicate person, empty craft record, or non-finite Fit closes
the affected credit/package section rather than borrowing a person or rendering a rejected raw
credit. Newspaper callouts and visible billing consume the same validated Chronicle package and
credits.

Greenlight chronology accepts exactly one negative, finite `production` debit for the exact
production ID at an integer week, under:

```text
commissionedWeek + 1 + rewriteCount <= greenlightWeek < releaseWeek <= currentWeek
```

A missing, duplicate, non-negative, fractional, wrong-film, or impossibly dated witness produces
an explicit unavailable state. A participant-bearing older film without newer screenplay history
keeps its honest title, genre, credits, package, and result while saying that its creative brief
and detailed chronology were not recorded. A pre-participant legacy film remains ineligible; no
current roster record is used to reconstruct it.

## Player delivery

- New releases open on the poster-led Chronicle/Gazette surface.
- Dashboard Recent Releases exposes three distinct actions: `Chronicle`, `Clipping`, and
  `Autopsy`.
- Chronicle and Clipping reconstruct from persisted authority after export/import or browser
  reload.
- Autopsy remains available only when the exact pre-release snapshot survives in the current
  session. Its label never silently opens a different archived record.
- Multiple same-week releases preserve per-film association, result facts, accounting disclosure,
  and the correct Autopsy-or-Chronicle action.
- The release route resets inherited document scroll and enters keyboard focus at the film-title
  heading, except when the already-authoritative construction-completion announcement owns first
  focus.
- The Recent Releases table has its own keyboard-scroll region, so 200% zoom does not create page-
  level horizontal overflow or make trailing actions unreachable.

The one-sheet is semantic HTML/CSS with six frozen genre palettes and Shape-linked composition.
It contains no image, SVG, canvas, network call, generated asset, copyrighted mark, or random
selection. Text carries every creative, production, Fit, and reception fact; color is decorative.

## Red-team repairs incorporated

Independent adversarial review found no remaining P1, P2, or P3 issue after the implementation
closed these review findings:

- preserved Annex completion focus ownership;
- placed the film title first in semantic heading order;
- restored complete same-week release accounting and audience parity;
- displayed exact decimal Fit values without rounding across 45/70 labels;
- labelled participant status as frozen at greenlight rather than current employment;
- proved exact project/debit association and durable reconstruction;
- separated live, archived, clipping, Chronicle, and Autopsy routing; and
- prevented malformed credits or equal-Fit ties from leaking through newspaper callouts.

The focused adversarial corpus passed 76/76 tests at its final review checkpoint, with no remaining
P1-P3 finding. A separate adapter proof used three real managed releases with interleaved unrelated
Produced projects and production debits, then proved exact association, SaveFileV11 round-trip,
state non-mutation, and RNG non-mutation.

## Verification at the implementation candidate

| Gate | Result |
| --- | --- |
| `npm test -- --reporter=dot` | **PASS — 156/156 files, 1,868/1,868 tests** |
| Dedicated Chronicle files | **PASS — 44/44 tests** |
| Independent focused adversarial corpus | **PASS — 76/76 tests; no remaining P1-P3** |
| `npx vitest run --config src/harness/d16/vitest.d16.config.ts --reporter=dot` | **PASS — 10/10 files, 176/176 tests** |
| `npm run typecheck` | **PASS — root and UI TypeScript clean** |
| `npm run build` | **PASS — 131 modules transformed** |
| `git diff --check` | **PASS** |

The build retains the pre-existing large-chunk advisory. It is not a Film Chronicle build failure.
The complete repository suite includes save migration, replay, RNG isolation, action, tick,
economy, reception, career, release-accounting, multi-release, and Annex regressions. No file under
save migration, actions, tick, economy, reception, standing, career development, or production
simulation changed in this implementation commit.

SaveFileV1 through SaveFileV11 remain frozen. Projection and rendering leave the input state and
RNG streams byte-identical.

## Live acceptance

A real managed studio path commissioned and accepted *Echoes of Harvest*, ran camera tests,
assembled its team, committed its package, cleared the real Soundstage shooting commands, and
released in Week 23. The delivered Chronicle reconstructed from the live SaveFileV11 recorded:

- Romance; Slow Setup / Reversal / Bittersweet;
- Fredric Underwood, Spencer Novak, Anna Larkin, Irene Underwood, Hedy Prescott, and Norma Merrick;
- commissioned Week 13, first draft, greenlit Week 15, released Week 23, eight elapsed weeks;
- Norma Merrick as the 78 Fit standout and Hedy Prescott as the 19 Fit stretch;
- critic 47 and audience 62; and
- `$4.33M` opening-week Studio Revenue, `$11.37M` projected total Studio Revenue, `$7.26M`
  commitment, and `$4.11M` projected profit.

After browser reload, Chronicle and Clipping remained available from persisted data while Autopsy
was visibly disabled. The archived Clipping correctly offered `Open Film Chronicle`.

Real-browser layout inspection passed 1280×720, 1366×768, 1440×900, and 1920×1080 at 100% and
125%-equivalent zoom with zero page horizontal overflow. A 200%-equivalent 640×360 viewport, a
200% text-only long-title case, and keyboard access to the horizontally contained release table
also passed with zero page overflow and reachable actions. Entry focus and scroll reset were
verified at 200%. The full live path emitted no console warning or error.

Five-second human review passed the Keep gate: title, genre, chosen creative arc, director, lead,
chronology, package compromise, reception, and paid/projected distinction are legible before the
Autopsy is opened.

## Explicitly open

Film Chronicle V1 does not authorize or pretend to deliver:

- generated stills, storyboards, trailers, playable film scenes, screenplay prose, dialogue, or
  plot canon;
- persisted soundstage/set history, production incidents, delay causes, reshoots, editing choices,
  location strategy, or release/distribution strategy;
- poster collection/export, awards art, sequels, physical archive economics, or a machinima editor;
- a new Chronicle save schema or historical reconstruction of facts that were never persisted; or
- the broader facility catalogue, placement, upgrades, era systems, richer crews, departments, or
  operating resources.

The accepted D-17B residuals also remain explicitly open: cash runaway; top-studio economic
immortality; the Week-208 synchronized roster wall; P5 dominance; world-led variance; cheap-film
purpose; premium-film purpose; remaining menu breadth; and formal G12 timing.

No financing, loan, bailout, restructuring, acquisition, bankruptcy/failure ladder, arbitrary cash
injection, or arbitrary cash sink was introduced.

## Git and publication boundary

Film Chronicle V1 exists only on `operation-hollywood-autonomous-marathon`. Local `main` remains
`33eb33ae307904aa3f00db20bc695e40bf46d1e4`; accepted D-17B remains
`35d42687a410a621becf1df35c75986657f8c44e`; the Hollywood bridge authority remains
`623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`. No merge or push occurred.

No tag is created. Current repository practice reserves milestone tags for Owner-accepted or
merged milestones; this autonomous feature has not crossed that gate.

## Next marathon move

The independently generated Week-208 roster-wall corpora continue from the reviewed observatory
authority. Their closure may be recorded only after both full accepted semantic replays and their
cross-artifact comparison complete. Film Chronicle V1 does not prejudge that research result or
reclassify the roster wall.
