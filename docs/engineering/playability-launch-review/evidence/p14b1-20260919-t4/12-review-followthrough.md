# P14B.1 T4 correction review and chronology follow-through

Native contract-auditor re-reviewed the original four gates against `d19c45b` plus
`09-targeted-candidate.patch` (SHA256
`02a40e7b6913d5455f7f9d2eb850c847df151ef417a04f783ac944b324d1953a`).
Read-only review; parent persisted the report. No Claude invocation.

Three gates were MET: the lower contract-window check, deterministic committed
inputs in the feasibility digest, and the real pre-commit freeze receipt retained
in the winning binding. Exact V29 proposal/binding/outcome/evidence validation was
substantially met, with the historical window/submission-receipt compatibility
explicitly preserved. Verdict was REFINE for one remaining temporal identity edge:
a terminal promise could point to a same-pair later real employment contract which
had not started when that promise ended. The same-pair/end-edge checks alone were
insufficient to identify the contract it rode on.

The independent test-author created a lawful second settlement at week 104 after
the original promise was BROKEN at week 92, then changed only the old promise's
contractId to that actual later employment row. Its positive construction guards
passed; validation wrongly accepted the single corrupted reference. Actual RED:
`10-later-contract-red.{txt,json,patch}`, exit 1, one failed / 33 filtered by the
explicit diagnostic test-name selection, 2026-09-19T11:13:11.435Z to
11:13:18.584Z. The recorder's identical before/after diff SHA256 is
`20d86f50c95809fc964f87b23195b111dee692715751ad420630679e8dd2245d`.

Only after RED and the runtime/file handback, sim-core added five lines in the
existing validator: bound employment start is nonnegative and cannot be later
than the campaign week; a terminal outcome cannot predate that contract start.
These do not constrain the legacy lower promise-window edge or replace a
historical feasibility receipt. No test weakening, timeout change, frozen
validator edit, save version bump or projection change. `git diff --check` passed.

First candidate targeted verification (`09`) actually passed seven files,
80 tests with three existing todos; full T4 was still pending. Final corrected
candidate targeted result is recorded separately in `11`; it must not be inferred
from the reviewer verdict. T4 full verification/attribution and all previously
declared deferred catalogue, consumer, Unity/native and Owner-acceptance work remain.

## Final candidate handback

Final bounded native review: **KEEP**, no remaining blocking findings within the
assigned corrections. The reviewer confirmed both chronology guards and the
lawful single-reference mutation, without running tests or claiming a full pass.

Parent-observed `11-targeted-final-candidate` passed all seven files: **81 passed,
three existing todos**, exit 0. Start 2026-09-19T11:15:58.565Z, end
11:16:59.662Z. Exact tested candidate is `d19c45b` plus the committed `.patch`,
SHA256 `4f39af257810cb547e6b77ffe4a0706a3b72e161440a592212a873d87ca90dd8`;
before/after diff identities match. Source/tests froze after this handback.
This is the corrected-source checkpoint, **not T4 closeout**. Full serialized
verification and individual inherited/new-failure attribution are next.
