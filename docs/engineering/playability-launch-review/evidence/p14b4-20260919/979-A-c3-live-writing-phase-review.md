# 979-A — C.3 live writing authority: phase review

Independent source-only review on the Stage A candidate following978. Parent
retains production/test execution ownership. This document is the reviewer's
only writable path; no gameplay or tests were executed. Stage B implementation
and its independent RED remain pending.

**REFINE the proposed entrypoint strategy.** Calling only
`validateProfessionHistory(state)` inside every live writing factory is neither
full malformed-state validation nor safe at every current caller's phase.
Candidate-gated full Save38 proof at a settled boundary, followed by explicit
copied-context propagation, is a suitable bounded implementation direction.

## Actual phase constraint

`tick.ts:219` validates placement on the settled input week. Later,
`tick.ts:390–417` calls `admitQueuedIntents` with a temporary
`market.tick = currentTick + 1`, after script/casting/production advancement but
before retirement/transition settlement at `tick.ts:1156`.

`queueAdmission.ts:68` calls `commitQueuedIntent`; its four branches at
`actions.ts:1733–1780` reuse the private commission, casting and greenlight
actions. Those reach `assertCurrentScriptState` (`actions.ts:1884`). A valid
transitionDue entry for the arriving week has not been consumed yet. Full
profession-history proof on this transient state would reject that due entry.

A catch returning undefined is not harmless here: loss of a needed two-episode
finishing-writer allowance makes script validation refuse, and
`commitQueuedIntent` converts non-capacity errors into `expired`
(`actions.ts:1781–1790`). `queueAdmission.ts:75–90` then removes the intent and
records its refusal. An unrelated pending career decision must not expire lawful
queued work.

## Smallest explicit propagation map

| Boundary or seam | Required treatment |
| --- | --- |
| Save38, `save.ts:10203–10213` | Factor its existing complete validation into an internal proof routine returning the validated save and copied `ProfessionValidationContext`. Keep public `validateSaveV38` returning the original validated save. Return context only after all existing delegates pass. |
| Live proof wrapper | Gate on an actual continuation candidate that needs multiple-episode selection, then prove the settled input once. Malformed proof confers no new allowance. Do not claim a caught failure validates the remaining world. |
| Tick entry, `tick.ts:193–221` | Obtain invocation-local proof from the settled source before any temporary arriving-week snapshot. Reuse it for the live placement boundary and downstream queue work. |
| Queue transport | Pass the copied context explicitly through `admitQueuedIntents` (`queueAdmission.ts:52`) and `commitQueuedIntent` (`actions.ts:1733`). The absence of proof must be distinguishable from permission to re-prove a transient snapshot. |
| Queued private actions | Thread it through `applyCommissionScript` (`actions.ts:1987`), `applyCommissionOriginalScreenplay` (`2069`), `applyStartCastingSession` (`2433`), and `applyGreenlightScriptProject` (`2307`) **plus** `applyGreenlightScriptProjectNow` (`2365`). All relevant paths end at `assertCurrentScriptState` (`1884`). |
| Exact task allowance | Call the existing `retirementWritingAuthority` with the actual phase state and proved copied profession context. Preserve its exact studio/project/writer/commission/due/week guards. Do not carry a week-W writing grant unchanged into week-W+1. |
| Ordinary actions | Prove the settled invocation input before action mutation when a candidate needs the authority; reuse invocation-local context through the same private invariant calls. Preserve all normal admission and contract checks. |
| Calendar/construction view | `studioCalendar.ts:870` → `studioConstructionView` (`placement.ts:2411`) → live placement wrapper (`1814`) reads a settled state. It may use the candidate-gated proof path. The public frozen placement validator remains unchanged. |

Physical-plan admission also receives an arriving-week snapshot
(`tick.ts:433`), but `physicalPlans.ts:217–225` calls `commitPlacement` or
`commitFacilityInstallation` directly. Those commits do not call the live
writing/placement wrapper. No additional context seam is needed there in the
current graph; do not insert full Save38 proof into that transient phase.

## Proof, cost and import constraints

`validateProfessionHistory` proves the new career authority but is only part of
Save38. The Save38 caller first validates age provenance, then validates career
history, creates writing evidence, and runs the full private37→19 and older
delegate chain. The history routine alone does not replace the old retirement
record, cohort, extension, accounting, script or Hollywood validators. Local
action/script/placement validators do not subsequently validate every career
root, so “normal validation then refuses” is not a full-state guarantee.

Using `professionChanges.length > 0` as the sole cost gate is insufficient. It
remains true forever after the first transition, while tick-entry placement runs
every week. Full history proof reconstructs past decisions and retained work;
that would introduce recurring history scans. Keep a cheap candidate predicate
separate from authority: only a real unfinished writing continuation needing
multi-episode selection should invoke full proof. A candidate predicate grants
nothing. Reuse the result only within that invocation; no global cache.

The complete save chain currently calls the **frozen** placement function at
`save.ts:4307/4482`, using explicitly supplied writing authority, and imports the
base factory at `save.ts:1`. Preserve that graph so the proof routine never calls
the live wrapper recursively. A live wrapper importing a proof helper from save
adds a module cycle through placement; there is already a
save→professionHistory→professionTransitions→worldgen→save cycle
(`worldgen.ts:85`). Function declarations and type-only context imports may remain
lazy, but no top-level proof call or eagerly evaluated cross-module binding is
acceptable. Keep the base factory free of a runtime import of save. Confirm module
initialization and the absence of recursion with the independent Stage B run.

## Required discriminating controls

- A valid two-episode finishing writer continues through ordinary actions,
  Calendar and tick, with the exact existing task and expiry receipt.
- A queued action is admitted while an unrelated person's transition is due in
  that same arriving week; the intent must not expire from a premature proof.
- Changed task/studio/writer/dates and malformed career/provenance roots confer
  no additional authority. Frozen public readers retain their prior refusals.
- A world with career changes but no relevant continuation candidate takes the
  cheap path, without repeatedly proving all career history.
- Transport the copied profession context only; recompute week-bound grants
  from each actual phase state and retain existing admission laws.

These are implementation consistency requirements under942/946, not new product
law. The historical-control mint978 and its archived-source/hash audit are
separate evidence; they do not qualify these unimplemented Stage B paths.
