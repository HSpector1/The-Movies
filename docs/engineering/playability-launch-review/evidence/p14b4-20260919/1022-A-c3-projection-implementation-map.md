# 1022-A — Projection53 implementation map

Parent source inspection on published87d1449c, while the independent test owner
implements1018's core evidence batch. This is implementation preparation under
frozen942/946, not a new product contract or source release. No production change,
generator, typecheck, gameplay or test was executed for this document. The parent
retains the production writer and heavy lane. Independent StageD tests and their
recorded first failures precede matching implementation.

## Concrete dependency set

- bridge/schema/bridge-schema.ts: advance projection52 to53 once; retain protocol4.
  Add the three946 definitions StudioProfessionRetirement, StudioProfessionChange,
  StudioPersonCareer, register definitions and inferred public types. Add required
  profile professionCareer while preserving the existing development career block.
  Add the two career attention causes to the closed enumeration.
- bridge/schema/industry-schema.ts: add the five946 person fields, retain existing
  current-profession lifecycle/retiredWeek, and add optional careerKind to activity.
- bridge/lifecycle.ts: derive the four career statuses and ordered completed
  profession histories from actual records; safe public last-change copy derives
  from the linked typed decision. personAlumni selects latest actual completed
  profession, so working former actors keep historical alumni. News retains actual
  events for13 weeks with finishing/announcement priority preserved.
- bridge/people.ts: update the locally declared profile type and profile builder
  together with the schema. Existing career, discipline, credit, employer, trust,
  presence and current lifecycle meanings remain intact.
- bridge/relationships.ts: working careers use current relationships. Waiting,
  pending and final careers use latest actual completed profession retirement asOf,
  preserving current counterpart disclosure and the unavailable historical-tier
  notice. Later industry reconciliation must not move asOf forward.
- bridge/industry.ts: add career fields to the immutable per-state person index;
  alumni selects any completed profession and sorts that date descending/id.
  Publish actual career activity with null employer/film and exact946 ids. Apply
  explicit13-week career retention; a null studio must not inherit the permanent
  technology-announcement exception. No per-studio employment/history entry is
  invented. Existing query paging and group/week/id ordering remain.
- src/core/studioCalendar.ts: add exact946 careerEvents alongside commitments,
  with actual facts only, nonfuture13-week filter and week-desc/id ordering. Keep
  counts, next committed week and automatic advance decisions unchanged. A small
  pure recent-event builder can be shared with bridge activity without invoking
  the complete Calendar/placement validator merely to retrieve events.
- ui/src/screens/StudioCalendar.tsx: render recent career events and reuse the
  existing profile navigation callback, focus restoration and person identity.
  There is no new unread state or automatic stop. The required React change is
  this surface; the reviewed profile/read-model contract remains bridge-owned.
- bridge/runtime-checkpoint.ts: register exact outgoing52 schema identity alongside
  the53 bump. Historical current208/saved207 slots independently migrate to38;
  incompatible old session/revision/journal authority follows the existing prior
  schema path. Current53 replay/restart must not reapply gameplay.

Current production already exports latestCompletedRetirement from careerLifecycle
and preserves separate old/current records. An active, announced or finishing
current profession is a working career even with an old actor retirement. An
actual industryRetirement alone selects retired. A completed actor with a live
future due is awaitingTransition; migrated nonactors pending first reconciliation
and dormant retired people are pendingReconciliation. Null-Hollywood actors with
no active due queue must not claim an active transition. Recording copy states
its actual prospective boundary without backdating missing career decisions.

The former-profession array is date/role ordered and at most two under current
law. The line/reason fields never publish raw question inputs, witnesses, hidden
ceilings, rival terms or relationship magnitudes. Profile history survives news
expiration. Finance receives no career cash entry.

## Independent test seams to release separately

The test owner should define exact leaves before source release, using actual
qualified current38 worlds plus the immutable953/Scientist artifacts. Proposed
separate ownership paths are bridge-p14c3-read-models.test.ts,
bridge-p14c3-runtime.test.ts, a bridge-only helper if needed, and
ui/src/screens/StudioCalendar.career.test.tsx. Core Calendar coverage may remain
in a core-only file. Reuse actual small continuations; do not silently rerun a
large B4 helper in every isolated file or claim a cross-file cache saves ticks.

Required distinctions include working former actor versus current lifecycle;
pending nonactor versus genuinely deferred actor; final reconciliation date versus
actual retirement asOf; both profession retirements; public safe copy and unchanged
existing career; one paged alumni identity with current employer/new role; current
relationships after real new work;13-week boundaries at0/12/13; permanent technology
rows surviving while career rows expire; commitment/Finance/stop invariance;
Calendar exact profile route/focus; and complete current DTO schema acceptance.

Runtime tests must consume the real outgoing52 current208/saved207 checkpoint,
retain its known old promise-digest mismatch and bytes, migrate each slot without
inventing past choices, then use actual current commands across prospective choice.
The interim955 assertion that52 is current must receive explicitly attributed
maintenance at this cutover, not be silently left as current law. Preserve its
historical recorded pass/failure evidence. Scientist51 remains a separate genuine
prior-schema control with two real dates. Current53 restart, duplicate command,
wrong identity/corruption and real public campaign-library Save As through a test
store are distinct requirements. Detached copies alone do not prove Save As.

## Generation and verification

The observed outgoing52 schema id is
sha256:f036ccdd62c4ac2a700a27796631e1c4f8c85f9cccfb14ac6850083fb8dba5f2.
It is already pinned by genuine953; never regenerate or relabel that corpus.
Run the existing repository generator only after schema source is complete, with
no --unity-project argument. Capture its intentional before/after source identities
as generation evidence, then run fixed-source --check and generated-fixture gates.
A source-mutating generator is not a fixed-source behavioral PASS. Independently
measure generated53 schema/C# identities before any new current pin maintenance.
No Unity consumer repository or native execution is included.

Final validation includes focused new behavior, attributed compatible neighbors,
root/UI/bridge types, generated checks, independent stable-diff review, runtime
restart/Save As and the later matched full regression/endurance gates. Existing
full927 failures and all new/changed failures retain cause-based attribution.
Core evidence or a generated C# artifact alone is not native qualification.
