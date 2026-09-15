# R3-N5 family sheet — SKELETON (people, casting contracts, build/lot tools, laboratory) · written by R3-N2-DESIGN-03

**Skeleton only.** Headings, the state list, the references. Every `TODO(N5)` is an in-phase decision by the N5 designer, made against
rendered captures and labelled `[REC]` / `[NAT]` / `[R3]`.

**Scope (plan N5 row).** `StudioProfileWorkspace`, `StudioRosterWorkspace`, `StudioPersonInspectorCard`, `StudioCastingInspectorCard`,
`StudioTalentMarketControls`, `StudioPeopleWorkspaceLayout`; `StudioBuildWorkspace`, `StudioBuildCommandHud`, `StudioBuildPlacementDriver`;
`StudioLaboratoryWorkspace`. Depends on the N3 portrait standard and the N2 shared components.

**Must read first.** `R3-N2-TEXT-RULES-ADDENDUM.md` §2 W1–W6 (note W4: `StudioBuildWorkspace` is the one surface not on the shared scroll
helper) and §3 (label/value pair, table row, long copy); `R3-N1-…-MEMO-SHEET.md` §E.1 people-rail rows, §F (focus ≠ selection);
`R3-N1-SHEET-REVISION-02.md` §R3/§R4.4 (people row stacking at 200 %); the plan's C1 portrait disposition.

## 0. Executive summary — disposition per surface
TODO(N5). Redesign / refine / retain-with-evidence for each of the nine surfaces, with the reason and the evidence cited.

## 1. Identity: one person, three renderings
TODO(N5). Rail row → inspector card → profile workspace must be recognisably **one** person: same name form, same portrait crop, same
role word, same employment-vs-assignment distinction. Duplicate names disambiguated by a stable fact, never by an internal id.

## 2. States every section must cover (state × 1280x720 / 1440x900 × 100 / 150 / 200 %)

| # | State | Surface | Must show |
|---|---|---|---|
| P1 | **Employed, unassigned** | roster, rail, profile | employment fact ≠ assignment fact |
| P2 | **Employed, assigned** | profile, production | what they are on, and until when |
| P3 | **Candidate, affordable** | talent market, casting inspector | the cost and what signing commits |
| P4 | **Candidate, refused** (funds, slot, eligibility) | talent market | the control **and** the reason, adjacent |
| P5 | **Duplicate / ambiguous name** | roster, comparison | the disambiguating fact |
| P6 | **Portrait missing** | all | labelled monogram fallback (C1), never a blank or a stranger |
| P7 | **Contract review open** | profile contract sheet | terms scroll; Confirm/Cancel never pushed off-screen |
| P8 | **Build: catalogue → placement valid** | build workspace/driver | cost, footprint, what it unlocks |
| P9 | **Build: placement invalid / occupied** | placement driver | the reason at the cursor **and** in text |
| P10 | **Build: cancel before commit** | build | nothing spent, nothing recorded |
| P11 | **Laboratory: copy law unchanged** | laboratory | the shipped copy retained verbatim |
| P12 | **Empty roster / empty market** | roster, market | the sentence and the lawful next route |

TODO(N5): per row, one rendered cell reference and the per-viewport reflow.

## 3. Comparison and the six-cell people grid
TODO(N5). How candidates compare side by side; what stacks at 200 %; what the comparison never hides (cost, refusal, identity).

## 4. Copy — action, refusal, help
TODO(N5). Backlot language; employment vs assignment wording; money always with its period; refusal = why + route. 3A contextual only.

## 5. Keyboard, focus, drag candidates
TODO(N5). Focus ring vs selection edge (addendum W6 defect 1); tab order per surface; candidate→comparison-slot and catalogue→lot-placement
marked "N8 candidate" only.

## 6. Implementation routing, provenance, evidence limits
TODO(N5). Number → owner file; commits/hashes of files read; paper-vs-rendered stated honestly.
