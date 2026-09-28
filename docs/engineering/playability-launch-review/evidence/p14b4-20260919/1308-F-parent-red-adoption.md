# 1308-F: parent disposition of 1308-D and the 1308-X dry-run defects

The parent read [1308-D](1308-D-combined-red-review.md) (REFINE, one required change) and its own scratch dry run
[1308-X](1308-X-parent-draft-dry-run.md). One test-author revision (1308-C2) applies all of the following to the
1308-stage files; nothing else changes.

1. **1308-D required change 1.** `bridge-p14r2r3-prior55.test.ts` pins the untouched prior roster as B55-3 does:
   every `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` entry except the new outgoing55 id, sorted by id, has length 43 and
   `sha256(canonicalJson(older)) = 11ec9999e052d8e6ce6dbdbb08060d57ad3a7dbb45335182c85806c4d88e4e51`. Measured on the
   unchanged engine and on the draft, identical: [1308-R](1308-R-prior-roster-probe.txt).
2. **Bridge seated fixture (1308-X defect 1).** `seatedFixture` must reach an active production without a managed
   screenplay requirement, using the route the core file already uses (`p13aGeneratedStudio` plus signed hires, then
   greenlight). The five seated leaves keep their assertions.
3. **Scientist premise (1308-X defect 2).** In `p14r3-rival-release.test.ts` "Scientists are never R3-surplus", the
   natural state with four employed Scientists is `advanceTo(…, 266)`, not 265 ([1308-Q](1308-Q-scientist-deficit-probe.txt)).
4. **Scientist witness (1308-X defect 2; 1308-D check 7 superseded by measurement).** `p13b-rival-scientist-staffing`
   measures from state week 266, when hiring has happened, over the measured window through week 420, and fails only
   if an affordable rival employs fewer Scientists than `min(capacity, demanded)`. On the measured route it is expected
   to pass: the hypothesis is recorded as not witnessed and no production correction follows.
5. **Save41 downgrade (1308-X defect 3).** The receipt-only tamper is not a valid V41 and every house converter
   validates first. Replace that leaf with the lawful route: the one labeled role rewrite, one tick (production
   releases the person), the original role restored, `makeSave`. Assert that save validates under V41 with the
   `termination` movement equal to the charge, that the frozen V40 validator refuses it, and that `convertV41ToV40`
   refuses it with a message matching `/termination/i`. The movement-half downgrade leaf and both `validateSaveV41`
   forgery leaves stay.
6. **Non-blocking, adopted.** `p14r3-rival-release.test.ts:45-46`: R2 binds rivals for production and writing seats;
   the research-seat exclusion is strategy (1305-A), not law. The neighbor handback phrasing about `state.relationships`
   is tightened.
7. **Carried to the pin sweep, not this revision.** `tests/p13b-s7-announcements.test.ts:87` (1305-D change 3) and
   every class-a row of 1302-I/1303-I.

After 1308-C2, a short independent re-review (1308-D2) precedes the parent's move into `tests/` and the RED gate.
