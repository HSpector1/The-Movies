# 194 — pre-execution sticky-reservation oracle correction

2026-09-20. Independent test-author approval of the parent's precise193 finding.
Only this note and a new corrected inert copy are written.193 remains frozen;
no runtime, typecheck, probe, protected edit, mutable191 inspection, Git/network
or delegation occurred.

`193-started-replay-background-command.test-draft.ts` remains SHA256
`d5ff2adb3ad95ca75336c8563401f2fe6d006037d3d833312a89574bbbaeb414`.

Corrected copy: `194-started-replay-background-command.test-draft.ts`, 328 lines,
four still-UNEXECUTED cases; SHA256
`11d607b24dc0bd22fb622a5ee0cd16a92705ce17bf4223c28a957864968d3add`.
Intended installation remains
`tests/p14b4-started-replay-background-command.test.ts`.
The copied193 provenance header is deliberately unchanged.

The old second-tick expectation incorrectly froze the WHOLE reservation record.
The adopted phase graph makes8 Development and7 Pre-production; the unchanged
owner retains the slot with `{ ...retained, phase: targetPhase }` (parent's source
finding, operations.ts388). Sticky retention preserves facility/slot identity,
not the reservation's old phase label.

Exact bounded delta:

- Add strict original `slotA.phase === 'development'` premise.
- Replace ONLY the second-tick reservation oracle `[slotA]` with
  `[{ ...slotA, phase: 'preProduction' }]`.
- Add strict second-tick workflow `phase === 'preProduction'` assertion.

The first-tick skip/new8 still requires the original complete reservation.
Second-tick complete-record equality still pins every other field, including
the exact retained facility/slot. No assertion is removed, made optional or
weakened. All remaining original assertions and default timeouts are byte-for-byte
unchanged. Read-only `diff -u` confirmed exactly these two small hunks; hash
comparison confirmed193 unchanged. This is a pre-execution oracle correction,
not an accommodation to a failing implementation or a reached passing test.

All193 fixture and budget limitations still apply. Parent may independently
review/install194 after sole191 writer handback, then record actual execution.
