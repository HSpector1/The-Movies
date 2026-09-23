# 742 — P14B.7 qualified checkpoint: the promise waiver

Source `d5293b1f`, clean tree. Engineering checkpoint, not Owner acceptance.

## 1 The player behaviour that now exists

A studio with an open promise it can no longer keep may offer the person a SUBSTITUTE promise in
its place. If the person accepts, the original settles `WAIVED` and the substitute binds to the
same employment contract in the same step. If the person refuses, nothing happens at all: the
original promise and the whole game state are left exactly as they were.

Before this slice a promise had one road out, and it ran through `SATISFIED` or `BROKEN`. A studio
whose picture collapsed had no way to make the person whole except to break its word.

## 2 The completion condition, and whether it is met

The waiver is accepted only when every one of nine conditions holds. Each refusal is its own
player-facing sentence, from `waiverAccepted` in `src/core/promises.ts`:

1. the promise has not already settled
2. somebody took it up, so there is a commitment to waive
3. the employment contract it rode in on is still on the record
4. the substitute is not identical to the original
5. the substitute's window opens strictly AFTER the waiver week
6. the part offered is at least as strong as the part promised
7. the substitute covers at least the count still owed
8. the person does not read `Distrusted` toward this studio
9. what remains of the contract can reasonably carry the substitute

All nine are implemented and reachable. The behaviour is complete.

## 3 The Owner's two decisions, as landed

**The remaining-obligation rule**, approved 2026-09-23: "a substitute must cover at least the
original's unfulfilled qualifying count, without erasing completed work or counting it again
toward the substitute."

Landed as `remaining = promise.predicate.count - promise.progress`, refusing when the substitute
covers less. The substitute is minted at `progress: 0` with `evidenceRefs: []`, so the original's
delivered takes are neither swept into the replacement nor erased from the original, which keeps
its own `progress` and `evidenceRefs` through the settlement.

**Private confirmation, no public announcement.** A waiver reaches no Industry surface.
`bridge/industry.ts:148` already filtered its public rows to `SATISFIED` or `BROKEN`, so the
existing public kept/broken announcements are preserved untouched, as the Owner required: private
terms do not make every outcome private. The decision is now documented at the site with its
price — `outcomeKind` is closed to `promiseKept`/`promiseBroken`
(`bridge/schema/industry-schema.ts:147`), so announcing a waiver later would widen a closed enum
and is a projection step, not a line change.

## 4 "No projection step" confirmed across consumers AND schema

The Owner refused the observation that `WAIVED` already exists in one enum. Enumerated instead:

- `bridge/schema/bridge-schema.ts:1770` `PROMISE_OUTCOMES` already listed `WAIVED` BEFORE this
  slice, verified against pre-B.7 `152ee9a4`, and `:2331` is the one place it is used.
- Every promise-outcome read in `bridge/` and `ui/` was swept. Three surfaces touch it and there
  is no fourth. There is NO `ui/` consumer of a promise outcome at all.
- `PROJECTION_VERSION` is 49 at both ends, schema identity `sha256:60af24c5…` unchanged, and
  `git diff 152ee9a4..HEAD -- generated/` is EMPTY. The wire did not move.

The three surfaces, each with a different rule: the public Industry fold excludes waivers; the
issuer's own attention row names one through a TABLE; and trust is untouched, because
`src/core/promises.ts:1081-1085` mints a driver for `SATISFIED` and `BROKEN` in an explicit
`if / else if` and for nothing else. That satisfies the companion's `WAIVED: no trust effect;
recorded and visible` (`P14-PREPARATION-COMPANION.md:379`, ruling S11 `:568`).

The mislabel hazard the sweep found is closed structurally: `bridge/trust.ts` carried a two-way
ternary with no third arm, which would have published a settlement the person ACCEPTED as
"broken". It is now `PROMISE_OUTCOME_WORD`, a partial map with no entry for `VOIDED`, so an
outcome this surface has no word for produces silence instead of a wrong word.

## 5 The save step

`LIVE_SAVE_VERSION = 32`. `ProfessionalPromiseV32` adds `supersededByPromiseId: string | null`,
recording which substitute superseded a waived promise. `migrateToV32` is the live load route,
reached from nine call sites across seven files. `convertV32ToV31` is the one allowed downgrade
and is lossless exactly when no promise names a substitute; `projectPromisesPreV32` refuses
anything else BEFORE the envelope is validated, so a world that really waived a promise is refused
as a downgrade rather than as a shape complaint about a field V31 has no schema for.

## 6 Verification

Run `739-b7-full-core-confirm`, source `d5293b1f`, `fixedSource: true`, empty-tree diff hash at
both ends, 3151.67s.

| | predicted (738) | observed (739) |
| --- | --- | --- |
| test files | 9 failed / 346 passed (355) | 10 failed / 345 passed (355) |
| cases | 24 failed / 4011 passed / 8 todo (4043) | 25 failed / 4010 passed / 8 todo (4043) |

Comparing full failure-NAME sets against run 717: **24 shared, byte-identical names; zero
vanished; exactly one new.** The one new failure is the prepared-reuse timeout, which prediction
738 named in advance as a falsifier and assigned to FU-2. Record 741 is its diagnosis.

Both B.7 suites green inside the full run: `p14b7-promise-waiver` 28, `bridge-p14b7-promise-waiver`
5, 33 total. The four sites corrected in record 737 are green inside the full run. Typecheck root
0, `tsconfig.bridge.json` 0, `ui/tsconfig.json` 0.

Suite identities at this source, hashed in the same command block as the read:
`tests/p14b7-promise-waiver.test.ts` `09c9f09bd00c4215c2a14b05e1fc45a4e263cce45e7f78e9c72dfb8a878fc66c`,
651 lines. `tests/bridge-p14b7-promise-waiver.test.ts`
`eedc23fb7cc9e3f05557dcdd317dcd7e8b16481b3f7af61a4cc2b3b43c17fa55`, 188 lines. The bridge suite's
sha MOVED from the `e6c7ae4d…`/185 recorded in records 731 and 733: the T2 sweep legitimately
edited it, carrying the genuinely-V31 fixture up through `convertV31ToV32` after the frozen
validator admits it, rather than softening `validateSaveV31`. No case was added; 5 before, 5 now.

## 7 What this checkpoint does NOT claim

- **Unity is NOT verified.** Nothing native was built, run or read. The backlog entry for this
  slice is recorded and states that no re-vendor is required, since the projection did not move.
- **The `ui` project was not run.** FU-1 has not returned, so its aggregate still carries no
  signal, and B.7 makes no UI-affecting claim.
- **The 24 inherited failures are untouched**, and none of them is B.7's.
- **FU-2 is OPEN** with its diagnosis complete (record 741). Its remaining question is a
  disposition, not a measurement, and the threshold was not moved.
- **Two coverage gaps are OPEN and briefed, not closed** (record 740). The suite proves that the
  engine refuses but not WHICH of the nine refusals fired, and two of the nine overlap on
  reachable inputs. More seriously, NOTHING asserts the slice's central law: an added
  `else if (outcome === 'WAIVED')` trust-driver arm would keep both suites green today. The
  behaviour is correct as landed and verified by reading; it is not yet pinned by a test.
- **The natural route is untested.** Every waiver case runs from the staged `genuine-v31-pre-b7`
  corpus. No fixture in this repository plays a picture forward to the point where a studio would
  genuinely need to waive.

## 8 Carried, unchanged by this slice

FU-1 (UI suite, not returned), 702-C REFINE 3-6, positive-saturation, the 6,240-week endurance
obligation, 628 R5 / G-1(A) / G-2, 637, evaluator 5 and the pre-existing
`p14b4-cast-class-capacity-evaluator5` defect expecting IMPOSSIBLE and getting FRAGILE, the B.6
projection cost, `rosterAt`/`SEAT_PAIRS` restated in `bridge/relationships.ts`.

The P14C ambiguity is now sharper rather than merely restated. The companion lists the person's
own announced retirement and profession transition under BOTH the WAIVED row and the VOIDED row.
A plausible resolution exists in the text itself: WAIVED requires the studio to PROPOSE and the
person to ACCEPT, while VOIDED follows automatically from the external event. P14C should confirm
or reject that reading rather than rediscover the collision.
