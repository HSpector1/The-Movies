# Code-Mining Ledger

Donor archaeology for the tycoon world conversion. Every entry records provenance and a
license ruling BEFORE any donor-derived implementation lands. Standing law: GPL/unclear →
CLEAN-ROOM REIMPLEMENT (learn behavior, never paste); permissive (MIT/BSD) → ADAPT allowed
with attribution recorded here; no proprietary/decompiled/leaked source; no donor art.

Entries are appended by research agents and accepted by Fable.

---

(entries pending — camera/zoom [OpenRCT2], placement/footprint [OpenRCT2 + CorsixTH],
task/occupancy/queue [CorsixTH] squads dispatched at shift start)

---

## Entry 1 — Workplace task/occupancy/queue spine

**PROBLEM** Authoritative workplace spine: TASK → DESTINATION → TRAVEL → ARRIVAL →
OCCUPANCY/QUEUE → WORK → COMPLETION for named people, pure deterministic TS engine,
weekly outer tick, renderer interpolates. No Sims autonomy.

**DONOR** CorsixTH (Theme Hospital reimplementation), clone at
`3aa4adae516aaa186b3605d223130765e9366f1e` (2026-08-12), inspected in scratch only.

**LICENSE / NOTICE** `CorsixTH/LICENSE.txt`: ~120 copyright lines (2009–2026) followed by
the verbatim MIT permission/disclaimer body (L130–146). MIT confirmed on disk; 297/298
Lua files carry the block. LGPL items in the notice attach to the C++/binary layer only,
not the mined Lua. Original Theme Hospital assets are not in the repo.

**FILES / MODULES** Action queue: `Lua/entities/humanoid.lua` (L584–704 start/queue/
finish/setNextAction; teardown L626–656), `Lua/humanoid_action.lua`. Single-timer:
`Lua/entity.lua` L183–260. Clock: `Lua/world.lua` L722–996, `Lua/date.lua` L49 (50 h/day).
Dispatcher: `Lua/calls_dispatcher.lua` (whole file). Travel: `Lua/humanoid_actions/walk.lua`.
Rooms: `Lua/room.lua` (occupancy L316–658, advance L549–565). Queue: `Lua/queue.lua`,
`Lua/humanoid_actions/queue.lua`. Door mutex: `Lua/objects/door.lua`. Work phases:
`Lua/humanoid_actions/use_object.lua`. Availability: `Lua/entities/humanoids/staff.lua`
L514–575. Examples: `Lua/rooms/gp.lua`, `Lua/rooms/ward.lua`, `Lua/objects/reception_desk.lua`.
Pathfinder: `Src/th_pathfind.{h,cpp}` (A*, Manhattan, unit cost).

**MECHANISM (essence to reimplement)**
1. Per-person `action_queue`; `[1]` executes. Four ops only: start / queueAction /
   finishAction (shift+start) / setNextAction (tear down non-must_happen tail). Teardown
   MUST release: queue membership, object reservation, room expectation. Interruption is
   two-phase cooperative (`todo_interrupt`), never forced mid-flight.
2. Dispatcher: `Call = {target, key, verification(p), priority(p), execute(p)}`, identity
   `(target,key)` idempotent; push (new call → best worker) and pull (idle worker → best
   call) both min-score folds; preemption when a better-scored worker appears. Scores in
   units of walking distance (tiles): `path − 5·queueLen − 40·fatigue − 50·inRoomBonus …`.
3. Availability is ONE bit (`isIdle`); workers have no desires. The dispatcher decides.
4. Completion = a CHECKPOINT no-op action reaching queue front; if torn down instead, its
   on_remove re-dispatches the call. Completion-as-queue-position survives interruption.
5. Room: `occupants` + `enroute` (committed, not arrived) + two capacity axes (crew
   criteria min/max; subjects ≤ maxSubjects). Admission predicate single function;
   membership announced by the traveller on tile-set, never polled.
6. Queue lives on the DOOR (mixed traffic incl. leavers), priority tiers 1–6 with stable
   insert; `reported_size` counts only player-relevant tiers and is exactly the array
   tail; three-state membership EXPECTED→QUEUED→ADMITTED so demand counts at commit time;
   advancement is event-driven pull (`tryAdvanceQueue` on state changes), no polling;
   `door.reserved_for` is the mutex; queue world-position derived, never stored.
7. Time: one tick = one hour, 50 h/day fixed inner loop; presentation speed is a separate
   dial. One timer per entity, owned by the current action ("the whole scheduler").
   Travel = 8 ticks/tile constant; sprite slaved to the timer.
8. Work = integer phase machine (−6…0…6, only phase 0 loops); progress is a countdown in
   the loop callback; durations from skill (GP: 3–18 ticks, p(done)=0.7+0.3·skill;
   reception desk: 4–54 ticks/customer).

**WHY USEFUL** A shipped, battle-tested implementation of exactly our spine with our
authority model (pushed tasks, one availability bit, no autonomy).

**RULING** CLEAN-ROOM REIMPLEMENT (recommended; donor entangled with mutable graphs,
serialized closures, anim-derived durations, scattered math.random — all forbidden here).
MIT permits ADAPT with attribution: ship LICENSE.txt L3–128 (all names) + L130–146
verbatim in a THIRD-PARTY-NOTICES file. If any literal constant tables survive (priority
tiers, weight sets), add the notice regardless as cheap insurance. No donor code/assets
enter the build.

**PROJECT: STUDIO APPLICATION**
- Keep week as the only authoritative outer tick; add fixed integer BEATS_PER_WEEK = 10
  inner loop inside `tick()` (mirrors World:onTick). Beats are engine-internal; the week
  remains the save/reporting boundary. The tick emits a deterministic beat timeline the
  renderer plays back over wall time — travel/work become watchable without a second clock.
- One timer per person: single `beatsRemaining` field owned by the current step.
- Data model: Task {targetId, key, kind, requiredRole, label, assignedTo} (verification/
  priority/execute as pure functions switched on `kind`, never closures in state); Step
  union SEEK/TRAVEL/QUEUE/WORK/IDLE/CHECKPOINT/LEAVE with envelope flags; Person {at,
  steps[], beatsRemaining, onTask, inFacility}; Facility {requiredCrew, maxCrew,
  maxSubjects, occupants, enroute, admitting, queue}; Queue {entries priority-ordered,
  expected, reportedCount = tail}.
- Travel: authored lot node graph + Floyd–Warshall all-pairs matrix; TRAVEL.beats =
  matrix lookup; NO A*, no tile pathfinding — largest simplification available.
- Ten invariants to unit-test verbatim (steps never empty; occupants⟺inFacility;
  task⟺person one-to-one; admitting ≤1; crew/subject caps; one queue, expected XOR
  entries; beatsRemaining positive-int decrement-by-1; completion only via CHECKPOINT;
  TRAVEL.beats = matrix; teardown releases queue+reservation+enroute — test interruption
  at every pipeline stage).
