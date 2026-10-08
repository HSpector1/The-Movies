# Adoption observed-audit r5 static review

Decision: **REFINE_UNRUN_EXACT_WHOLE_CHILD_DEADLINE**. Frozen source, plan and selfcheck hashes match the manifest; AST and synthetic selfcheck pass. The only changed logic from static-accepted r4 is bootstrap deadline inheritance, plus the output name.

The timer still has a floor that can extend the whole-child bound. With `_BOOTSTRAP_START=100.0` and `time.monotonic()=699.9999`, `600-elapsed` leaves about 0.0001 seconds, but `max(0.001, ...)` arms 0.001 seconds. Since the bootstrap alarm is already armed, the safest correction is to validate the start and leave that timer in place; alternatively arm only the exact positive remainder without a minimum. The r5 selfcheck currently expects the extension. Version a corrected source and selfcheck before any exact command. No audit was run, no Git mutation occurred, and the comparator result remains unreviewed.
