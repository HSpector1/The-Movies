# OWNER RULING — M5 FAILED (2026-08-19)

## The ruling, verbatim in substance

M5 remains **FAILED**. The build the Owner ran still exposed "Advance one week /
Sim to next event" with no Hold/Roll transport, and the lot is "only marginally
busier" — it does not remotely meet the professional tycoon floor or compare
visually to The Movies (2005). **Do not proceed to M6.**

Weekly usage is at 90%. The continuity law (00G) remains binding.

## Root cause of the missing transport (resolved, PM)

The M5 transport IS in the build at HEAD `2957370` (`ui/src/App.tsx:4830` passes
`livingTurn` unconditionally to the Lot). The Owner's build did not have it
because the playtest sheet (`18-m5-owner-playtest.md`) said "From the repository
root" without naming WHICH worktree. The primary repo folder
(`/Users/bruce/The Movies - Github Push Test`) sits on a pre-C2 branch
(`codex-github-write-test`) whose build has no C2 work at all — launching there
shows exactly the two old verbs. The sheet is corrected in the same commit as
this ruling: the launch commands now name
`/Users/bruce/The Movies - C2 Implementation` explicitly and say how to verify
the running build is M5 (the transport is visible in the Lot topbar).

## The ordered correction wave — VISIBLE TRANSFORMATION, not infrastructure

The next Owner screenshot must be obviously different at a glance. Priorities,
in the Owner's words:

1. visibly active workers tied to real jobs;
2. construction crews visibly building;
3. stage/scenery activity readable without labels;
4. more production props/equipment/vehicles;
5. less floating debug-label dependence;
6. stronger building silhouettes and department identity;
7. significantly greater environmental density;
8. clear 1940s Hollywood character;
9. movie-making flow understandable from the lot.

**Deliverable: a screenshot/video that makes the improvement self-evident.**
Not another architecture report.

## Status consequences

- M5 acceptance: WITHDRAWN/FAILED until the Owner rules otherwise on visual
  evidence.
- M6 (Premiere at the Gate): BLOCKED.
- The three open rulings from the M5 report (ladder rank; "Sim to next event"
  copy; scenery distance dial) remain open and unanswered — they are NOT
  blockers for the correction wave.
