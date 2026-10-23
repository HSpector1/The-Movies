# Project: Studio. Codebase Review, Executive Summary

Date: 2026-10-22. Scope: read-only review of the landed development branch and the identifiable unlanded work. Nothing was modified, built or executed. The full audit (sections A to G, 64 merged findings, repair sequence) sits beside this file as `AUDIT.md`; the thirteen domain reports are under `domain-reports/`.

## What was reviewed

| Item | Identity |
|---|---|
| Branch | `wip/headless-program-20260916-ts` |
| Local HEAD | `0a12cbfd977ef9de9d142046b29195c3f7dedf36` (clean; one commit ahead of origin at `84943cab`, unpushed) |
| Landed gameplay source | Save48 landing `2c3024e2`. The source, bridge, UI, test and generated trees are byte-identical between 2c3024e2 and 0a12cbfd. |
| P16 candidate | current200 in `studio-specialists/p16` (200 staged paths; `PATCH.diff` sha256 `d59d331b…c1a1c5`, MANIFEST `7b16780a…`, both matching the HANDOFF). Save 49, Bridge projection 62 in source with generated outputs still at 61. |
| P17 / P18 drafts | Detached at `6510c971` and `f7d0dc0f`, both 80 commits behind Save48; inactive. |
| Unity counterpart | Local clone at `9bcd7be6` (2026-08-28), DTO at projection 11. |
| Runtime | NOT RUN. `node_modules` is absent in the production checkout and the Owner pause is in force. Every finding is a source-reading finding. |

## Verdict

Continue on this architecture. The core is a pure, seeded, fail-closed state machine, and no reviewer found a determinism defect, a lost or duplicated dollar, a double settlement, or a path where the UI or Bridge mutates authoritative state. Persistence, replay and the Bridge coordinator are built carefully.

The serious defects are all of one kind: the validators are right and the producers disagree with them. "Who is busy", "is this business still operating", "how long must a writer's contract run" and "which installation records are live" each exist as several private copies. Ordinary play reaches states that one copy accepts and the validator refuses, and then the campaign can neither tick nor save. Eleven landed P1 findings and the most serious candidate finding share that root cause.

No P0 was found.

## Findings that matter most

**Landed, P1 (13).** Multi-week drafts that outlive the writer's contract (L-01). Auditioned actors who change profession (L-02). Payroll booked once but written as two rows against an exact cash check (L-03). Seating a person a rival still has seated (L-04). Closed rivals' frozen work still claiming released people (L-05). Three cancel-and-restart journeys in facilities and technology (L-06 to L-08). The shipped Lot renderer swallowing keyboard input page-wide and losing built-building artwork on return (L-09, L-10). No Unity consumer proven beyond projection 11 (L-11). Bridge per-command cost growing toward a 64 MiB journal cliff (L-12). CI dark since 2026-10-01 because the hygiene step crashes on committed symlinks (L-13).

**P16 candidate, P1 (7).** Write-off absorptions produce an unsaveable world (C-01). Generated Bridge contract stale at 61 against source 62 with a test pinned at 59 (C-02). Seventeen Save49 test files never ran and about sixteen tests fail by static reading (C-03). Nothing has run on current200 and the planned run covers 5 of 52 files (C-04). The R6 runner the HANDOFF names fails its own admission on a stale pin (C-05, confirmed). Thirty-one tests need captures outside the repository (C-06). P16's rights model cannot issue what P18 needs; decide before Save49 freezes (C-07).

**Drafts.** P17 collides with landed Save46 and patches a loop P16 moved. P18's television cash projection breaks the landed closure reconciliation, and a self-asserted grant is admitted with no consideration. Neither draft can be rebased mechanically.

## What is unverified

Everything at runtime: compilation, test execution, timing budgets, browser and native gameplay, Owner acceptance. Natural reachability of several soft-locks is argued from the laws, not demonstrated; the audit names one reproduction each. CI has produced no signal for 345 commits.

## Fix first

1. Rebind the P16 evidence: a reviewed R7 runner, committed Save48 captures, retire or rebuild the seventeen never-run files, then one exclusive run of all 52 added files on exactly current200.
2. One occupancy law and one operating-business law in the core (fixes L-04, L-05 and C-01 together).
3. One writer-term predicate and a profession check keyed to the session's start week (L-01, L-02).
4. One ledger booking helper and core-side validation of caller money (L-03, L-14, L-15).
5. One status-aware installation helper across the cancellation seam (L-06 to L-08).

Then: P16 rework before landing (canonical-62 from real output, C-08, C-10 to C-12, the C-07 ruling), the Bridge integration proof and identity registry, the UI and Lot shipped-world fixes, the toolchain safeguards, and measurement before any long-run acceptance. Full table in `AUDIT.md` section F.

## For the next development agent

Do not redesign. Fix the shared laws in the core, not in the callers. Nothing has run on current200, and the HANDOFF's recorded next action stops at runner admission. CI is dark; a red badge means nothing until the hygiene step is fixed, and dependabot never reaches this branch. Use Node 20.20.2 deliberately, `.venv/bin` first on PATH, `channel: 'chrome'` for Playwright on this Mac, heavy commands only through the lane after a preflight, and never re-run a historical generator or owner-profile script. Record the R4 rights decision for P18 and the continuation-versus-mint decision for P17 before Save49 freezes.
