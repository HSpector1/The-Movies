# Driver integration lesson

Pure cleanup-module RED/GREEN controls did not execute the driver main tail.
They therefore missed STOP becoming local when its assignment was added without
a global declaration. R1's successful method reports and useful cleanup evidence
could coexist with UnboundLocalError and a failed recorded route.

Add exact authenticated driver-tail controls with synthetic I/O and clocks.
Reproduce both refusal and clean scoping failures in r1, then cover r2's clean,
sticky-error, preexisting STOP, incomplete counts/state and late-finalization
paths. Keep the driver top-level timer unimported and preserve every failed run.

Validate each producer's own exact protocol and roster. The original 3 RED/18
GREEN module pass cannot satisfy the new 2 RED/10 GREEN integration gate.
Reuse accepted recorder ownership/cleanup code unchanged; bind fresh source
identities and output paths under a separate reviewed once-only actual grant.
