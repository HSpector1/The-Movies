# 1225-F — Assignment-owner clarifications

Implementation mapping exposed two existing admission facts that the new
opportunity path reader must preserve. The review owner independently checked
the source; these refine 1225-C/E without changing old evaluator4/6 behavior.

Active writing is distinct from credit. `activeScriptWriterAssignments` reads
every pooled writer of actual drafting/rewriting projects. Their committed
dueWeek supplies a fresh-assignment floor; Review and finished screenplay credit
do not. The new opportunity reader accounts for these owner-labelled active
writing tasks across player and rival owners, alongside the already selected
cross-owner production floor. That is an explicit conservative quote policy.
It is not a claim that the existing player greenlight gate scans rival work:
the player gate deliberately uses its narrower player production/writing owners.
No admission owner or old quote law is changed by this clarification.

Do not silently introduce a universal research-assignment gate. Player
`applyGreenlight` explicitly excludes additional industry/research busy categories;
rival `decide` uses the broader `busyTalentIds`. Preserve that distinction. Where
the actual rival owner blocks a person on another assignment without a supported
finite release bound, a fresh opportunity remains FRAGILE with an availability
reason. Do not invent a research completion week or add a research scheduler.
Actual already-held qualifying production seats retain their own clock.

Permanent Writer credit is not occupancy, but the same person cannot be both
the target picture's credited writer and its cast member. The shared
`resolveGreenlightStaffing` collision rule explicitly includes writerId. Therefore
an unproduced named screenplay whose writerId is the beneficiary is not a lawful
P5 cast path. P4 must choose another lawful genre-matching path; the existing
credit cannot be rewritten or ignored to certify that picture. This is separate
from pooled writers' active work and from being credited on some other picture.

These facts belong in the selected path's material feasibility inputs and in
separate controls. The Ready week45 fixture can support a zero-advance same-target
Writer-collision control. Active pooled-writing and rival research availability
still need actual owner premises before they can be claimed verified. No new
execution, hiring, campaign route or production activation is released here.
