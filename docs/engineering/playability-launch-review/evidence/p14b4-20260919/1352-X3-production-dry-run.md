# 1352-X3: parent dry run of P15B Wave 1 production (1352-E)

The scratch tree is built from HEAD c614b7e9, which includes Save43. RED r3 applies to it, then
[1352-p15b1-production.patch](1352-stage/1352-p15b1-production.patch) (sha256 4d711580…) adds three files and 301
lines.

Result: **52 of 52 pass** in 2.59 s ([output](1352-X3-red-r3-over-production.txt)).

The writer's reference check is kept as [1352-E-refcheck.ts](1352-E-refcheck.ts) (sha256 0eafe420…). It compares
an independent transcription of the transition table with the production code over 4.3 M random steps, and it fails
when a defect is injected. The writer authored both sides, so it is supporting evidence, not independent.

Findings from [1352-E](1352-E-p15b1-production-handback.md), each carried to the Wave 2 RED:
1. `remedies` throws for a closed studio. The parent keeps this, because a closed studio is never evaluated. Wave 2
   pins that no closed studio reaches the step or `remedies`.
2. `contractLoan` checks only the amount. Wave 2's `takeLoan` and the rival policy call `loanEligible` first, and a
   Wave 2 leaf refuses a loan for a stable, founding or closed studio at the action level.
3. Cover is a float division. Wave 2 passes integer cash only, and a leaf pins the exact threshold week with integer
   inputs.

Next: independent implementation review 1352-J, then landing through the index. Landing waits for the Save43 broad
measurement to end, because commits are frozen while it runs.
