# 1007-B — independent live-writing preflight and first12 review

**KEEP** the1007-A design and1006-A first12 test source on published
`ea4f1b6de24436d9cb8bd6dd4cdfa9ecea9ba425`. This review used source/document
reads and identity checks only; no test, gameplay, producer or compiler was run.
Parent retains all production and execution ownership.

Reviewed SHA256 identities:

- 1007-A preflight: `3ccc2dd94abf1030b9c2d66f783ee6da1d507ae9dfe8ef9d7f3e29b6f78a17d0`.
- `tests/helpers/p14c3-second-episode-fixtures.ts`:
  `815fcebcc30f80ed424db1f2bdb731148a507323d3587bcbb9173fca07db86ca`.
- `tests/p14c3-second-episode-writing.test.ts`:
  `144c255bb98ea7729dd017bed95959deb7522f0809e4f9753240144e9d8e0d5d`.

## Implementation design

Complete Save38 proof must finish all existing delegates before its copied career
context escapes. Keep the public validator's envelope identity and frozen public
readers. The explicit invocation token must distinguish no extra proof, successful
proof and failed required proof. Required proof failure must never recover a
context-free legacy allowance. The base evidence factory remains independent of a
runtime save import and recomputes exact task grants at each actual phase week.

Candidate detection must not require two valid retirement rows: the missing-old-row
negative retains the person's C3 change and current finishing row. Conversely,
global nonempty professionChanges is not a reason to prove every idle tick.
One implementation precision remains explicit: missing current employment is
relative to the task's owning studio, matching the shared script contract check.
Employment elsewhere must not conceal a player/rival task needing permission.

Carry the immutable context from settled tick entry through queue dispatch and all
private script invariant calls; do not re-prove the temporary arriving-week world.
The same applies to ordinary action batches and their placement callers. Current
actions do not perform a profession transition; newly authored people acquire no
expired retirement-writing task inside that invocation. Preserve frozen placement
delegation in the full save chain to avoid recursive live proof.

## Twelve-case test review

W1's public price expectation agrees with `talentMarket.ts:357–364` and979:
settlement re-derives the public studio ask at260, applies premium1.25, and commits
the rounded salary and bonus. The tests require an actual market victory and exact
payment; no employer, preference, cash, date or history is substituted.

W2 requires real age75 announcement364 and carrying employment260→468, deriving
E from actual notice/intervals. The historical actor record, three original takes
and released credits, provenance, career facts and person ordering are retained.

W3 proves the genuine accepted E snapshot before inspecting live callers: actual
expiry receipt, current finishing status, draft due strictly after E+1, and an
unbusy contracted young writer with a real spare development slot. All three live
checks are mandatory soft assertions; the unrelated command must run immediately,
preserve the original project and pass full current save validation.

W4 compares canonical current save bytes for loaded and continuous completion.
W5 requires actual clearance, current-profession retirement, exactly one
noCatalogue finality and a later loaded tick with no duplicates or invented
replacement employment. Aggregate payroll is correctly not treated as an
individual writer's payroll record.

W6 begins with the genuine whole38 positive and separately removes each retirement
row while preserving the task, employment and C3 authority. Exact whole-save
causes and live contract refusals discriminate missing-current permission from
unsafe legacy fallback after removal of the old actor row. Neither malformed
snapshot is presented as naturally reachable.

## Bounds and remaining evidence

287 is the maximum single trajectory, not aggregate suite gameplay. The handback
correctly adds W4's replay tail: at most626 new-branch advances across two targets,
plus the shared genuine207→208 choice. Successful phases are cached and detached;
failed uncached phases can be repeated by later leaves and must be attributed as
such. No timeout increase or hidden extension of the dated route is accepted.

At E−1→E, queue execution precedes actual expiry receipts and finishing settlement;
C3 context cannot invent those facts. A genuine queued E→E+1 control must start
with settled expiry evidence and keep the old draft unfinished after E+1. A draft
due exactly at E+1 completes before queue admission and cannot discriminate this
allowance. First12 deliberately covers immediate unrelated actions, not queue
transport or an unrelated career decision due in the arriving week.

Queued/arriving-due behavior, independent full-malformed-proof and idle-cost
controls, real per-profession extension use, rival work and remaining971/938 scope
remain pending. This source review claims no RED/GREEN result or full B4/C.3
qualification.
