# C.3 live writing implementation preflight

Parent source review before B4a RED; no production edit or new execution.979-A
remains the controlling phase audit.1002-A/1006-A own the independent genuine
controls. This preflight makes the intended internal boundaries concrete without
qualifying them.

## Complete proof and fail-closed permission

Factor Save38's existing complete validation into one private proof routine
returning the same validated envelope and the copied ProfessionValidationContext.
Public validateSaveV38 still returns the original envelope by identity. An internal
export for live callers constructs the ordinary38 envelope from the settled input
and returns only its context, after provenance, profession history and every
historical delegate succeeds. Do not call makeSave from that routine or detach
malformed authority before validating it. Public old readers remain unchanged.

Keep retirementWriting.ts free of a runtime save import. A separate lazy live
wrapper may import the proof function; no top-level cross-module proof or cache.
An invocation-local context distinguishes three cases: no extra proof needed,
complete proof succeeded, and required proof failed. Failure must return no writing
authority, never retry the context-free factory to recover a legacy allowance.
The base factory always derives grants from the actual phase state and actual week;
only immutable profession facts travel across phases.

## Cheap candidate gate

First identify actual unfinished drafting writers without current employment. If
there are none, return the cheap path before scanning career history. A world that
once had a profession change does not need full history proof every idle week.
Candidate detection grants nothing and cannot replace validation.

For a relevant expired-task writer, proof is needed when that identity appears in
C3 change authority, its anchor differs from its current profession, its retirement
rows contain another profession or ambiguous/duplicate episodes, or the required
current career scaffold is malformed/missing. Do not require two valid retirement
rows: deleting the old actor row while retaining a profession change must not
recover the legacy single-row finishing grant. An original single-episode writer
retains the established880-B path when no C3 selection is needed.

The implementation must check candidate malformed-input behavior and the absence
of recurring idle history proof independently. A caught proof error is refusal of
new permission, not a statement that the rest of the world is valid.

## Explicit phase transport

Acquire an invocation context at settled tick entry before the existing placement
check. Supply it to that live check and to admitQueuedIntents, commitQueuedIntent
and the private queued commission/casting/greenlight paths, including Now. Explicit
no-proof/failed-proof transport must suppress re-proof of the temporary arriving
week. Keep physical-plan direct commit paths unchanged.

Ordinary applyActions can acquire its context once from settled input and thread
it through affected private script/placement invariant callers. A normal Calendar/
construction view obtains candidate-gated proof from its settled input. Public
frozen placement validators receive only their existing explicit authority and
never call the live wrapper recursively.

The E−1→E queue snapshot predates actual Hollywood expiry/finishing settlement.
There is then no actual expiry receipt/status from which880-B can grant permission;
C3 context must not fabricate either. This inherited phase edge is distinct from
the required settled-E→E+1 test, where actual expiry and finishing facts exist and
due must be strictly after E+1. An unrelated transition due at E+1 remains unconsumed
in the queued phase and must not cause premature full-history re-proof.

B4a first12 qualifies only its actual branches. Separate queued/arriving-due,
malformed-full-proof and idle-cost controls remain required before complete live
context qualification. No production helper is added solely for test interception.

## Independent design review

Reviewer KEEP on full-proof factoring, explicit invocation token, failed-proof
refusal and phase transport. Candidate employment must belong to the exact task
studio, matching existing script law; employment elsewhere cannot suppress needed
proof for an expired player task. Read both player and rival development owners
consistently with the base factory. Candidate over-detection may proceed to strict
proof, but malformed relevant rows/identities must not bypass it. No source/test
edit or run was performed for this review.
