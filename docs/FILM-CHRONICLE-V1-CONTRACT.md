# Film Chronicle V1 Contract

Status: autonomous-marathon implementation contract

Date: 2026-08-14

Authority base: the marathon launch order, especially **#17 — MAKE THE PLAYER'S MOVIE
VISIBLE**; accepted D-17B; closed Production Operations V1, Script Projects V1, Casting
Sessions V1, Studio Calendar V1, and Development & Casting Annex V1; and canonical Lessons
Learned

## Purpose

Make a completed film feel like the player's movie before asking them to read its analysis.

The current release path is mechanically strong and truthful: it records the result, separates
opening-week cash from projected full-run revenue, preserves the exact cast and crew, explains
forecast variance, and carries career impact. Its first emotional surface is nevertheless a
generic dark card headed like a newspaper. The player sees a report about a film, not a visible
artifact of the title, creative choices, and people they assembled.

V1 turns that existing release/clipping route into a compact film chronicle:

- one deterministic studio one-sheet that gives the film a durable visual identity;
- one period-inspired newspaper page that keeps the existing truthful release headline;
- one short production strip showing the chronology the save actually retains; and
- one durable Film Chronicle record plus a direct route into the unchanged authoritative autopsy.

The intended five-second read is: **this is our title, this is the shape we chose, these are the
people who made it, this is the fit tradeoff we carried, and this is how it landed.**

This is presentation and read-model work. It does not add a score, change reception, generate a
plot, invent an incident, or simulate a movie inside the movie.

## Evidence that selects this slice

A live ordinary-player path on the accepted marathon build commissioned and accepted *Echoes of
Harvest*, ran camera tests, assembled its actual team, committed its exact budget and marketing,
cleared the managed Soundstage shooting commands, and released it in Week 23.

The release and autopsy proved that the underlying identity is already available:

- title and genre;
- locked screenplay Shape and Promise;
- frozen writer, director, cast, and craft credits;
- the persisted screenplay-to-greenlight-to-release chronology;
- the weakest and strongest package Fits;
- critic and audience response;
- opening-week and projected full-run economics; and
- frozen career impact.

The same live proof showed the player-facing gap. The Gazette rendered with the global dark card
grammar, no one-sheet, no visual creative signature, and no above-the-fold production story. The
autopsy was accurate but visually remained a report grid. A new simulation mechanic is not needed
to close that seam.

## Compatibility and persistence boundary

SaveFileV1 through SaveFileV11 remain frozen. SaveFileV11 remains the current save schema.

V1 adds no state root, field, migration, identifier, action, ledger entry, random draw, clock,
autosave mutation, or external asset reference. Rendering the film chronicle must leave the
input GameState byte-identical and must not advance any RNG stream.

The chronicle is reconstructed from facts already persisted on or beside the released film:

- `FilmResult` for production identity, delivered expression, reception, box office, forecast,
  and frozen participants;
- `FilmConcept` for title and genre;
- the linked Produced `ScriptProject`, when present, for the locked Shape and Promise;
- the theatrical run and ledger for the existing paid/projected financial boundary; and
- frozen career events on the already-owning career-impact surface.

No session-only pre-release snapshot is required for the one-sheet or newspaper. The same film
must therefore reconstruct the same film chronicle after export/import and browser reload.
The full mathematical autopsy may retain its existing session-snapshot limitation.

## One pure chronicle read model

Core owns one pure, narrow presentation projection associated with the existing newspaper view.
It contains no GameState reference, mutable domain object, hidden actual screenplay strength,
talent ceiling, current employment status, current talent value, seed, or RNG state.

The projection contains only:

```text
FilmChronicle
  productionId
  title
  genre
  creativeRecord: exact Shape and Promise, or explicit unavailable state
  credits: frozen writer, director, lead, supporting cast, and craft
  productionRecord: persisted commission/greenlight/release chronology, or explicit unavailable state
  packageRecord: strongest fit and tightest/weakest fit from frozen greenlight facts
  reception: recorded critic and audience verdict
```

The current financial and headline fields remain on the existing `NewspaperView`; V1 does not
duplicate or rename their accounting basis.

Input collection order and fresh object identity must not change the projection. Every output is
derived with plain deterministic mappings. Presentation palette and composition may vary by genre
and locked Shape, but never by a random or wall-clock value.

Every returned Shape, Promise range, audience array, participant credit, and package record is a
fresh value. Mutating a returned chronicle must not mutate GameState, the ScriptProject,
FilmResult, ledger, or another view built for the same film.

V1 eligibility remains bounded to a released FilmResult with the frozen D-11.A participant record.
A pre-participant legacy film retains the existing honest unavailable explanation; V1 does not
reconstruct credits from current talent or widen the old clipping route. Creative and production-
chronology fallbacks apply only inside this participant-bearing eligible class.

## Creative record

For a released film linked to a Produced managed screenplay, the chronicle displays the exact
player-owned choices:

- Opening: Immediate Action, Slow Setup, or Mystery Hook;
- Midpoint: Reversal, Escalation, or Revelation;
- Ending: Triumph, Bittersweet, Tragic, or Ambiguous;
- intended audiences; and
- the selected Intimacy, Tonal Weight, and Kinetic Energy promise ranges in player language.

The one-sheet may turn these facts into a short deterministic line such as “A slow-burn opening.
A hard reversal. A bittersweet finish.” That line is a restatement of the locked Shape, not
generated plot or authored story canon.

If no linked Produced screenplay exists, the surface must say that the creative brief was not
recorded for this older film. It may still show persisted title, genre, credits, and result. It
must not recover Shape or Promise from delivered expression, current market taste, another
project, title keywords, or genre stereotypes.

## Production record

V1 reports only the chronology that survives in SaveFileV11:

- the linked ScriptProject's exact `commissionedWeek`;
- whether the accepted screenplay was its first draft or used its one final rewrite;
- the exact greenlight week from that production's authoritative `production` ledger debit;
- the FilmResult's exact release week; and
- the resulting elapsed greenlight-to-release interval, labelled as elapsed calendar time rather
  than an on-schedule promise.

The production debit is both an accounting event and an immutable greenlight witness. The
projection accepts a greenlight week only from exactly one `kind: production` row with this exact
production ID, a strictly negative amount, and an integer week. For a Produced ScriptProject the
chronology also requires:

```text
commissionedWeek + 1 + rewriteCount <= greenlightWeek < releaseWeek <= currentWeek
```

The first inequality is the earliest legal screenplay boundary; auditions or other player delay
may make greenlight later. SaveFileV11's frozen validator does not enforce ledger-row uniqueness,
sign, or released-film chronology globally. V1 does not widen import validation and must not crash
while rendering a save that V11 accepts. A missing, duplicate, non-negative, wrong-film, or
impossibly dated witness yields an explicit `Detailed production chronology unavailable` state.
It never yields a guessed week or negative elapsed interval.

Production Operations V1 removes an active workflow and its reservations when a film releases.
Therefore V1 may not name Soundstage 7, Soundstage 12, a set, a scenery incident, a hold cause,
director-call timing, a scheduled take, Post Building occupancy, or any other released-film
operations detail. It may not reconstruct one from production ID, array order, the prettier lot
plate, current vacancy, or another film's workflow.

V1 also may not claim a reshoot, location, set design, production accident, delay cause, or
player-made production compromise that current persisted history cannot prove. Persisting varied
production incidents and exact released-film facility history remains a later contract.

An older film without the Produced-project and ledger witnesses receives an explicit `Detailed
production chronology not recorded for this film` state. The surface does not pretend every
historical film followed the newer operating loop.

## Real compromise and people identity

The one-sheet bills the frozen greenlight writer, director, lead, antagonist, support, and
Production/Craft Lead. Later hiring, firing, development, fame, or renaming must never rewrite
those credits.

Before billing anyone, the projection requires exact frozen-credit correlations: the Produced
project writer equals the participant Writer; `FilmResult.directorId` equals the participant
Director; Lead, Antagonist, Support, and Craft entries carry their exact role; and no person fills
two credits. A mismatch fails the Chronicle identity closed with an explicit unavailable state
rather than borrowing a current talent record, throwing during render, or using another film's
participant. Two released films must remain disjoint even when source arrays are reversed.

The package record uses the same frozen Project Fit values already displayed by the autopsy.
Selection is canonical by Fit, then the role rank Writer, Director, Lead, Antagonist, Support,
Production/Craft Lead, then plain talent ID for multiple Craft credits. This is display ordering,
not a new ranking rule:

- highest Fit at or above the existing newspaper standout boundary of 70 becomes `Standout fit`;
- otherwise the highest Fit is labelled neutrally as `Strongest fit`;
- lowest Fit below the existing newspaper stretch boundary of 45 becomes `Stretch fit`; and
- otherwise the lowest Fit is labelled neutrally as `Tightest fit`.

This is a visible reminder of the package the player chose, not a new quality calculation. It does
not blend reception, Fit, OVR, fame, cohesion, profit, or career growth into a master grade.

## One-sheet visual grammar

The one-sheet is code-native HTML/CSS. It uses no generated image, remote request, canvas, runtime
texture, hidden asset download, or copyrighted film mark.

Its content hierarchy is:

1. `A PROJECT: STUDIO PRODUCTION` credit;
2. dominant film title and genre;
3. the exact Shape line;
4. director and lead billing;
5. a compact audience-promise stamp;
6. a three-beat Opening / Midpoint / Final Reel strip; and
7. the conditional production-chronology and package-fit facts.

Shape line, audience-promise stamp, three-beat strip, and chronology appear only when their exact
records exist. A participant-bearing older film keeps the one-sheet, frozen credits, genre, and
result while naming missing creative or chronology history plainly.

Genre selects one of six frozen high-contrast palettes. Shape may select geometric composition,
rule direction, or typography emphasis. Those mappings communicate identity only; they are not
claims about quality, audience size, era authenticity, or box-office outcome. The poster remains
legible with CSS effects disabled and every decorative motif is hidden from assistive technology.

The player must not need color to identify genre, Shape, result, or compromise. Text carries every
fact. The title remains readable at 200% zoom and with long generated concept names.

## Newspaper page

The Silver Screen Gazette keeps its original fictional masthead and existing deterministic
headline/callout law. V1 changes its visual grammar from a generic application card to a restrained
period newspaper:

- warm paper and dark ink with sufficient contrast;
- editorial serif hierarchy;
- clear column/rule structure;
- the same Critic, Audience, opening-week paid cash, projected full-run figures, commitment, and
  projected contribution labels; and
- the same equally inspectable handling for multiple same-week releases.

Presentation must not make projected money look banked. Positive/negative color remains
supplementary to explicit `Projected profit` / `Projected loss` text. The existing disclosure stays
visible on the default page.

The primary one-sheet and primary story sit side by side on wide screens and stack in logical DOM
order on narrow screens. Secondary same-week releases retain their own result facts and Autopsy
action; a primary visual hierarchy may not make them uninspectable.

## Durable player paths

The film chronicle appears:

- once as the first surface when a new film releases; and
- again through the existing `Clipping` action for that exact film after the fact and after reload;
  and
- as the durable `Film Chronicle` record for that film from Dashboard Recent Releases.

The existing internal `FilmRecord` component may retain its filename to avoid churn, but its
player-facing identity becomes `FILM CHRONICLE`. It uses the same pure chronicle/one-sheet model as
the newspaper, then preserves the existing exact result metrics, frozen participants, and Career
Impact. Recent Releases exposes a distinct `Chronicle` action beside `Clipping` and `Autopsy`.
`Autopsy` remains the full session-snapshot explanation; it must no longer silently become a
different archived record after reload.

Autopsy navigation is session-aware. With the retained pre-release snapshot, the action reads
`Read the full autopsy` and opens that exact existing autopsy. Without the snapshot, that CTA is
replaced by `Open Film Chronicle`; it must not silently route an `Autopsy` label to a different
archived screen. `Continue` keeps its current source-sensitive destination: live release continues
to the release/development summary; an archived clipping returns to the dashboard.

Keyboard focus enters at the chronicle heading after navigation. The one-sheet is a labelled
`figure` with a concise text alternative; its visible credits and creative facts remain ordinary
text. Actions stay native buttons with visible focus. Reduced motion produces a fully static page;
V1 needs no animation to communicate meaning.

## Implementation boundary

The expected bounded implementation surface is:

- `src/core/newspaper.ts` and `src/core/index.ts` for the pure, freshly cloned Chronicle model;
- `ui/src/engine/adapter.ts` for exact film/project/ledger association;
- `ui/src/components/FilmPoster.tsx` for the shared code-native one-sheet;
- `ui/src/screens/NewspaperReveal.tsx` for the poster-led paper and session-aware CTA;
- `ui/src/screens/FilmRecord.tsx` for the player-facing Film Chronicle record;
- `ui/src/screens/Dashboard.tsx` and `ui/src/App.tsx` for distinct Chronicle, Clipping, and Autopsy
  routes; and
- scoped additions to `ui/src/styles.css`.

The focused proof belongs in `tests/d11-cycle3.test.ts`,
`ui/src/screens/d11-cycle3-ui.test.tsx`, `ui/src/screens/d11-cycle2-ui.test.tsx`,
`ui/src/screens/d17a-release-truth.test.tsx`, `ui/src/components/information-integrity.test.tsx`,
and `ui/src/App.test.tsx`, plus a dedicated Chronicle UI test when that keeps the cases clearer.
No file under save migration, reception, forecast, economy, standing, career development, actions,
or tick should change.

## Required verification

- exact title/genre/participants/result projection from the named released film;
- exact Produced ScriptProject Shape and Promise projection, plus an honest older-film fallback;
- in-production Production/ScriptProject Shape, Promise, concept, and writer equality immediately
  before release, plus byte-identical historical project fields after `mark produced`, later
  actions/ticks, and SaveFileV11 round-trip;
- exact commission/rewrite/greenlight/release chronology without a fabricated stage, set, hold,
  delay cause, or incident;
- explicit chronology-unavailable output for missing, duplicate, non-negative, wrong-film, or
  impossible-date production ledger witnesses, with no widened V11 import rejection or render
  throw;
- exact writer/director/slot/craft/unique-person credit correlations and an adversarial two-film
  no-bleed case;
- deterministic strongest/weakest frozen-Fit selection, including canonical ties and the 45 and
  70 boundaries;
- same state + film produces deep-equal chronicle data before and after SaveFileV11 export/import;
- no GameState mutation and byte-identical RNG state before/after projection and rendering;
- mutating every returned nested creative/credit value leaves the source state and a fresh second
  projection byte-identical;
- later talent rename, employment, fame, development, or roster changes cannot alter frozen
  credits or Fits;
- exact reception passthrough from the existing Newspaper Critic/Audience view, with no second
  aggregation or threshold family;
- negative assertions that hidden actual screenplay strength, live talent actuals, current
  employment, and delivered expression used as a surrogate Shape never enter the projection;
- current opening-week paid versus projected full-run money and disclosure tests remain green;
- current multi-release equality and per-film Autopsy routing remain green;
- live release, archived-clipping, durable Chronicle, and session-only Autopsy navigation/focus
  paths;
- long title, missing creative record, missing chronology, loss, mixed reception, and no-callout
  layouts;
- 1280×720, 1366×768, 1440×900, and 1920×1080 at 100% and 125%, plus 200% text zoom, with no
  horizontal page scrolling, clipping, overlap, or unreachable actions;
- semantic figure/heading/button order, keyboard-only operation, visible focus, contrast, and
  no-color-only meaning;
- real-browser captures at the governed desktop viewports and a five-second human review against
  the Keep gate; automated layout checks alone do not certify emotional readability;
- no console errors or warnings in the full commission → review → audition → package → production
  commands → release → autopsy → clipping path;
- full core/UI suite, root and UI typecheck, production build, governed D-16/D-17 harness, and
  `git diff --check`.

## Keep / kill gate

Keep V1 only if an ordinary player can identify the film's title, genre, creative arc, director,
lead, production chronology, package fit risk, and reception from the first screen without opening
the autopsy, while every displayed claim is traceable to persisted authoritative data.

Kill or narrow any element that:

- reads like generated plot the player never chose;
- implies a specific soundstage or incident the save does not retain;
- hides paid/projected accounting truth behind spectacle;
- becomes a decorative poster with no connection to Shape, Promise, or people;
- requires network availability or nondeterministic generation;
- breaks archived reconstruction, multi-release equality, accessibility, or responsive layout; or
- creates enough runtime or maintenance cost that a static truthful chronicle is no longer the
  bounded solution.

## Explicitly open after V1

- generated stills, storyboards, trailers, moving miniatures, or playable film scenes;
- screenplay prose, scene lists, dialogue, plot canon, and a machinima editor;
- persisted exact stage/set history, production incidents, delay causes, compromises, reshoots,
  editing choices, and release strategy;
- poster collection/export, awards art, physical archive/library economics, sequels, and IP value;
- alternate one-sheet campaigns, marketing creative, audience testing, and poster optimization;
- dynamic people art, Stage interiors, rivals, era progression, and awards/legacy systems; and
- any change to reception, forecast, economy, career impact, or standing.

The accepted D-17B residuals remain explicitly OPEN: cash runaway; top-studio economic
immortality; week-208 synchronized roster wall; P5 dominance; world-led variance; cheap-film
purpose; premium-film purpose; remaining menu breadth; and formal G12 timing.

No financing, loans, bailouts, restructuring, acquisition, bankruptcy/failure ladder, arbitrary
cash injection, or arbitrary cash sink is authorized by this presentation contract.
