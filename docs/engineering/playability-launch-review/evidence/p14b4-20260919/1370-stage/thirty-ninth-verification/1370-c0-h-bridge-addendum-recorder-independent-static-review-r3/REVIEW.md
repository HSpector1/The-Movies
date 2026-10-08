# H bridge outer recorder r3 static review — REFINE

R3 closes the r2 cleanup and receipt issues: it requires `LAUNCH_START`, separates 200 active seconds from a 210-second hard envelope, retains the hard alarm through group cleanup/result write, and rereads the one-shot final receipt through nofollow FDs. Synthetic timeout, missing-start and symlink-result-parent refusals pass. If the hard alarm interrupts receipt writing, the plan correctly treats a partial or missing receipt as STOP; lane meta/log and the mirror state require independent review.

One deadline defect remains. `START=globals()['LAUNCH_START']` accepts a future monotonic value. The subsequent `remaining_active()` and `remaining_total()` then extend both limits; a read-only synthetic import with start = now + 60 yielded approximately 260/270 seconds. Require finite numeric `START` and elapsed within `[0,ACTIVE)` before arming either timer, and add a future-start RED. Keep r3 frozen/unrun.
