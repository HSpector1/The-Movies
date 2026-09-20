# 126 — bounded existing-owner replay plan review

**KEEP the architectural direction; REFINE chronology before treating125 as an executable contract.** Numerical cost bounds and exact fact/budget interfaces remain unsettled. No production authorization follows from this review.

Reviewed125 SHA256:
`b5ca23ebf1fa9d486b84cb1bfd48d841da0a39f1299621ad6e72949a34274951`.

Read the complete plan against91/94 and the named clock, tick, technology/setup, scenery, release and rival-stage owners. No files, runtime, probes, Git mutations, network or delegation.

## Required chronology clarification

125:99–114 correctly places player writing/casting completion before allocation, but its “persisted due boundaries” wording needs reconciliation with125:143–156, which places sweep transitions at `(w,step)` and takes at `(w+1,0)`.

Actual `tick.ts:251–277` completes work due at `w+1` **before** the sweep at336. Closing its background reservation at `(w+1,0)` while opening a subsequent sweep grant at `(w,k)` would create a false overlap.

Minimal clarification:

- Use one ordered logical step sequence for commands, pre-sweep completion releases, scenery arrival and sweep reservation transitions.
- Close player due-writing/casting occupancy at its actual pre-sweep logical release step; retain persisted due/completion week `w+1` separately in provenance.
- Later grants of that exact slot follow that release in the same sequence.
- Keep qualifying first-take boundaries at `(w+1,0)`.
- Do not authorize commands, greenlights or person reuse between these internal phases.
- Rival writing completion belongs after its sweep (`hollywoodTick.ts:257,316`), never at the player’s pre-sweep release step.

Require an independent discriminant with a real due background reservation and a same-slot waiting production. Its intervals must join without overlap while preserving the authoritative due week.

## Supported guidance

- **Genuine narrow views:** The proposed clock, technology, setup, scenery and release views correspond to actual field reads. Preserve nullable Hollywood/player identity, default studio selection, current-week adoption/access checks, held equipment and cancellation conditions. Rebuild branch-local collectors at the actual invocation week; do not construct fake GameState or Production records.
- **Whole-slate execution:** Reusing the shared sweep for all current productions preserves priority and cross-picture contention. One-picture calendars cannot be spliced into a joint certificate.
- **Caller order:** Player arrival makes a task ready, not scheduled. Rival assign→clear→schedule, automatic release commitment and sound selection occur before its sweep; writing completion follows. Earlier rival purchase/research/physical/decision work must be included or proved irrelevant before crossing that boundary.
- **Mandatory-change cuts:** Queue/admission, construction, installation, funding and other known changing context cannot be frozen silently. A prefix must stop before an omitted effect can alter subsequent execution. `week < nextDecisionWeek` alone does not prove rival inactivity.
- **Resource versus person occupancy:** Wrap can release stage and Set while director/cast/craft remain held through lawful release admission. `operations.ts:1265–1277` retains historical Set fields deliberately; they are not occupancy. Use ordered reservation transitions and wrapped stage/Set identity, reconcile initial/final roots, and retain wear exactly once.
- **No repeated first take:** Only the sweep’s actual5→4 return supplies a candidate event; historical first-take identity prevents an already-filmed continuation from earning another.
- **Unknown release:** A null release requires exact path-owned occupancy through effective H under94. This cannot compensate for an incomplete or incompatible wider activity context.

## Certificate and readiness limits

An `incompletePrefix` is **not** a full-H trace or a `claimsAndHolds:'complete'` certificate. Likewise, one successfully executed plan does not prove `existingCalendars` or `allOwnerTraces` complete. A positive kernel certificate requires its separate full-context and prior-optimum obligations.

The proposed before-call accounting is the correct direction, including callback dimensions, slot expansion and abandoned branches. The sweep’s bounded progress structure supports deriving a bound, but does not itself establish the numerical charge. Exact conservative costs, saturation arithmetic, zero-unreserved-call tests and useful ordinary traces within200000 work remain prerequisites—not details that may be supplied by an arbitrary multiplier.

Next: record the chronology clarification, then define the exact genuine fact views, supported-cut/result semantics and reviewed numerical accounting before independent executable replay tests or source release. Staffing extraction remains the separate immediate task.

## Parent disposition

Parent persisted the read-only report above and adopts its chronology correction.
Original125 bytes remain unchanged. Parent independently identified the same
pre-sweep due-release versus arrived-week take distinction while reading tick.
The corrected logical step convention does not change any durable timestamp or
allow a command between internal phases.125/126 are still NOT an executable
producer contract: exact views/results, safe numerical costs and independent
proof cases must be settled next. Immediate source scope remains ONLY118/121
staffing extraction after124 installation/127 actual RED.
