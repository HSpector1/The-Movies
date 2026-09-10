# P11 — Owner acceptance receipt

**P11 OWNER ACCEPTED — KEEP FOR DELIVERED SUPPORTED SCOPE.** Howard explicitly
accepts the delivered candidate under **CURRENT OPS — P11 OWNER ACCEPTANCE AND
PRODUCER HANDOFF**. Recorded 2026-09-10. No exact Owner playtest time or detailed
Owner observations were supplied; none are inferred from the technical evidence.

This receipt supersedes the previously pending Owner status in the
[technical execution log](P11A-EXECUTION-LOG.md) and immutable candidate metadata.
Their original evidence, timestamps, failures and qualifications remain historical
facts. Owner acceptance does not turn an unimplemented requirement into a pass.

## Accepted identities

| Identity | Exact value |
|---|---|
| Accepted TypeScript product | `7ae36b44d99c505246d17dcc37beba94fa59a18a` |
| Accepted Unity product | `3a9a3f488693aa14431a6aa412d7560df8f30a89` |
| Technical documentation, direct docs-only TS successor | `e39bcbb1bf6cb13553a3b6c2425773d5f85d873a` |
| Preserved Desktop candidate | `/Users/bruce/Desktop/P11A-Finance-Candidate-7ae36b4-3a9a3f4` |
| Protocol / projection / save / outer checkpoint | `4 / 27 / V18 / 1` |
| Schema ID | `sha256:97940e51e0566bed80231b223e5b7303a45d62db8d698f693e525eb244775211` |
| Build manifest SHA-256 | `4fbcb455064ed294f08d5337d9042a519ec8090ef837d7861a7d7e791fdc4158` |
| Player executable SHA-256 | `9798fccf28f2fffd853054980a79988bf0865a695534bd06d2a09cb7219050c3` |
| Engine SHA-256 | `975fe18d1e235c0f444a7ac9a9f6c413a95c87d0223465a9ec413696737f65bb` |
| Candidate `INVENTORY.json` SHA-256 | `fc9cf9ca13fc6cf49f9afa6fa3278f5083957acba1d632d94c5c9d65609dddcb` |
| Candidate `EVIDENCE-INDEX.json` SHA-256 | `c0a1662177bf68b3defd41a3786b254c3211e935d8383400ba2330f84bdd15ba` |
| Adjacent `.launch-check.json` SHA-256 | `f74810d0cc982e14c8622d9a19df22ad331e5e6740610ec313eb7ed01f89a546` |

The index supplies the complete build, fixture and evidence identities. Existing
Gate B receipt `5117451f05f1c8636a896e09e876fdd9cd5903065dfa4abf20b96c7e5dfb71fd`
joins the 1,800 reviewed public artifacts and 23 completed runs. Existing
`ready27-final-docs-only-source-qualification.json` under
`/private/tmp/p11a-entry-20260909/` (SHA-256
`3bba96e66f6966012b31dd2406ab8ad0fed6fd6ec9bdba5c9a45c884e3001dee`)
records e39's documentation-only applicability. These are reused receipts, not
new audit, build, launch or runtime-test results.

## Scope retained

The [requirement register](../engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md)
retains all 45 IDs and dispositions: 35 PROVEN, one IMPLEMENTED-UNPROVEN,
three CONDITIONAL and six DEFERRED. **REQ-031 remains PARTIAL:** supported
absolute-week history and measured scale are proven; authoritative calendar/year/era
boundaries are absent. No 120-calendar-year claim or invented 52-week year follows.
REQ-034–036 remain CONDITIONAL; REQ-037 remains deferred to its named package;
REQ-038–039 retain DEPENDENCY-BLOCKED classifications; REQ-040–042 retain
OWNER-BLOCKED classifications. All nine remain unactivated.

The prior [P08–P10 deferred register](../operations/P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md)
and its Owner requests survive. P11's existing W0 evidence closes the recurring
facility-Opex reporting omission, AUD-008, only. Acceptance does not waive other
audit residuals or deliver roads, calendar, save-library, Builder or other deferred
systems. Technical limits remain: no physical-controller claim; 200% Cash framing
does not prove 200% point-picker usability; reused evidence retains its original
source and scope.

## Publication and ownership

Owned branch: `docs/p11-owner-acceptance-handoff-01`, based on technical documentation
e39. The immutable publication commit is the commit introducing this receipt,
resolved by `git log --diff-filter=A --format=%H -- docs/campaigns/P11-OWNER-ACCEPTANCE-RECEIPT.md`
and reported after remote publication. It is a documentation identity, not a new
product or build identity.

The [P11→P12 producer handoff](../engineering/P11-TO-P12-PRODUCER-HANDOFF.md) supplies
the delivered financial and persistence boundaries. The Desktop candidate, adjacent
launch receipt, protected profiles and rollback controls remain unchanged. This
closeout runs no new product audit, build or runtime test and installs no hooks.
No campaign/main promotion or P12 implementation is authorized by this acceptance.
Coding and runtime ownership are yielded to Current Ops with publication; no
continuing P11 coding or runtime work is queued.
