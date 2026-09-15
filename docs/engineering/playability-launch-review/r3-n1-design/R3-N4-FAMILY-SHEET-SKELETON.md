> **FILLED — see `R3-N4-FILM-JOURNEY-FAMILY-SHEET.md` (R3-N4-DESIGN-05, 2026-09-15).** This skeleton is retained as the record of what the
> N4 designer was asked to decide; every `TODO(N4)` below is answered there. Read the filled sheet, not this file, for the design.

# R3-N4 family sheet — SKELETON (film journey) · written by R3-N2-DESIGN-03, filled in-phase by the N4 designer

**Skeleton only.** Headings, the state list each section must cover, and the references to read. No design decision is made here; every
`TODO(N4)` is a decision the N4 designer makes *in phase*, against rendered captures, and records with a `[REC]`/`[NAT]`/`[R3]` label.

**Scope (plan N4 row).** `StudioDevelopmentCardHud`, `StudioDevelopmentPresentation`, `StudioProductionWorkspace{,.Navigation,.Remedies}`,
`StudioProductionEntryCard`, `StudioCastingWorkspace{,.CompareNavigation,.DisplayedGreenlight,.ReviewAcknowledgement}`,
`StudioReleaseResultWorkspace`, the screenplay-inspection route. TS is read-only unless a wait-cause/attention field is genuinely absent
(then: one exact delta, named, never invented).

**Must read first.** `R3-N1-COMPACT-INSPECTOR-MEMO-SHEET.md` §A (states/layout rules), §B (band), §C (compact inspector), §E (rail/band text);
`R3-N1-SHEET-REVISION-02.md` §R1 (clamp ladder), §R4 (card form), §R5 (opaque body); `R3-N2-TEXT-RULES-ADDENDUM.md` §2 W1–W6, §3, §4;
the Owner selections in `plans/R3-OVERHAUL-PLAN.md` header (R3 HYBRID cards, Backlot language, 1A/2B/3A/4B, XAG 101).

## 0. Executive summary — what changes, what is retained with evidence, what is refused
TODO(N4). State the disposition (redesign / refine / retain-with-evidence) for each of the seven surfaces below, with the reason.

## 1. The journey, as one continuous route
TODO(N4). Idea → script → casting → schedule → shoot → post → release → result, naming for each step: the entry control, the surface that
opens, the Back/Escape target, and what is preserved (scroll, focus, selection) across the step. Route preservation law: §B.6.

## 2. States every section must cover (the fill-in grid: state × 1280x720 / 1440x900 × 100 / 150 / 200 %)

| # | State | Surface | Must show |
|---|---|---|---|
| J1 | **Available** — a lawful next action exists | development card / production workspace | the action, its cost, its consequence |
| J2 | **Occupied** — the stage/person/slot is in use | production workspace | who/what occupies it, until when |
| J3 | **Waiting · cause** — lawful, nothing to do yet | entry card, workspace, rail card | the cause in words, never a fabricated remedy |
| J4 | **Actionable, with a refusal** — control present, reason present | casting, greenlight | the control, disabled, **and** the reason adjacent |
| J5 | **Missing prerequisite** | development / casting | what is missing and the lawful route to get it |
| J6 | **Stale** — the record moved under the player | all (`StillDisplayed()`) | the refusal, the re-read, no silent success |
| J7 | **In progress** — committed, running | production workspace | progress fact, the period it belongs to |
| J8 | **Result** — the release outcome | `StudioReleaseResultWorkspace` | the number, the period, what it is measured against |
| J9 | **Screenplay inspection** | inspection route | the complete title, unclamped (never tooltip-only) |
| J10 | **Empty / unknown** | all | the explicit word (C6: never "Writing" for an unknown stage) |

TODO(N4): for each row, one rendered cell reference and the per-viewport reflow (W5 clamp result, button-row form, refusal-strip placement).

## 3. The three-action record
TODO(N4). The footer/button-row law at 3+ actions (REVISION-02 §R1.4 second row; `More actions ▸` at the 1280/200 % cell), and the fixture with
a genuine 3-action record the phase requires.

## 4. Copy — action, refusal, waiting, help
TODO(N4). Backlot language. Verb-first action labels; refusal = *why* + the lawful route; waiting = the cause, never a promise; contextual
explanation only (3A — no guided first-film tutorial). One table: element → label → refusal text → help text.

## 5. Attention and retrievable outcomes (4B)
TODO(N4). Which journey states raise a persistent attention mark, what clears it, and where the outcome remains retrievable afterwards.
Never invent a journal: an outcome with no retrievable source is published as a **named data dependency**.

## 6. Keyboard, focus and drag
TODO(N4). Focus order per surface; Escape ladder (§C.8); every route completable by click **and** keyboard. Drag is N8 and optional:
list here only the routes with an existing lawful command, and mark them "N8 candidate", nothing more.

## 7. Implementation routing, provenance, evidence limits
TODO(N4). Number → owner file table; files read with commit/hash; an explicit statement of what was paper and what was rendered.
