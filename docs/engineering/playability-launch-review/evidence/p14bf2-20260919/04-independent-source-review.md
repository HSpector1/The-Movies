# B-F2 independent frozen-candidate source review

Date: 2026-09-19. Native `contract-auditor`. **KEEP — bounded source review.**
No concrete remaining defect found in the three-hunk production correction.
Completed targeted evidence is separately recorded below. This is not full
verification or B-F2 closeout.

## Exact candidate and scope

Base/RED checkpoint: `957d2de13cef957cf97ee8e3dd746b51d0e9d200`, following
accepted B3 publication `58b4c2ed82898cfd8354b569c97bc6a8e0920d39`.
Current HEAD independently reads the RED checkpoint. The protected-path diff
against HEAD names only `src/core/promises.ts`; executable tests remain the
committed independent RED candidate. No source/test/config writer was used by
this reviewer while the parent owns serial runtime verification.

Candidate `src/core/promises.ts` SHA256:
`de64e957381b1b33bf1d2789d976326fc3f54277035fc2059a2c3d5ea0899a0a`.
Exact `git diff HEAD --binary -- src/core/promises.ts` SHA256:
`9145160c243937f2eae0abd119a670b60f8a2690dc7f0b42e2c7aef6777c14cc`.

Inspected the complete actual diff, surrounding evaluator/digest/receipt/root
code, existing validation and winner-binding paths, existing rival authoring,
the assignment legality function, D9 resolution, the dated B-F2 plan and the
parent's `02-red-attribution.md`. No unrelated project audit was performed.

## Requirements and findings

**Settled has-discipline law — MET BY SOURCE.** `actions.ts:299` maps actor to
acting; `requireRole` at line307 rejects exactly an undefined corresponding
skill profile. Greenlight calls that function for every cast slot at line403.
The candidate's `promises.ts:378` uses exactly
`person.skills.acting === undefined`, after retaining the unknown-person refusal
at line377. It introduces no skill threshold, profession conversion or new
assignment permission. The correction follows D9 OQ-1 in
`docs/rev4-open-questions.md` (PM resolutions, settled2026-07-26), companion
§4.2 line327 and the dated B-F2 authority reconciliation in the headless plan.
The former primary-role gate was a misreading of the caller, not an Owner-selected
exception. The stale explanatory comment is corrected with the predicate.

**Bounded, relevant digest fact — MET BY SOURCE.** `promises.ts:303` now records
one scalar: null for absent person, false for missing acting profile, true for
present acting profile. This matches the actual eligibility branch, distinguishes
unknown from ineligible, and removes primary role as an irrelevant direct gate.
It adds no profile skill numbers, hidden preference, RNG, clock, I/O, mutable
cache or additional traversal. Existing immutable-state inputs and hashing at
line212 are unchanged. Different capacity/employment/pipeline facts may still
legitimately change the digest; only the obsolete direct role input is removed.

**Other feasibility and policy controls — MET BY DIFF.** Family refusal,
integer/count/window bounds, sequential capacity, buffer/slack, existing-path
requirements, B3 reservation membership/self-exclusion and all later outcomes
are unchanged. `talentMarket.ts:1237` still authors exactly one full-term P1,
count1, iff its real feasibility is achievable. It contains no primary-role
filter and is untouched. A writer may therefore newly receive a promise through
that existing policy; this is a consequence of correcting eligibility, not a
new writer-specific authoring or casting policy. Existing candidate/read-model
pools, staffing, actual seating and assignment guards are not broadened here.

**Version and historical preservation — MET BY SOURCE.** The shared revision
at `promises.ts:42` moves2→3. Only newly evaluated receipts (line212) and newly
minted roots (line487) take it. Existing validators at lines879/903 retain their
positive historical-version checks and are not changed to require the current
revision or recompute old receipts. No save/load migration or repair code is
modified. A later real freeze can store a new evaluator3 receipt while retaining
the original root.version: winner binding at `talentMarket.ts:1088` still spreads
the old root and changes only its contractId and supplied frozen receipt.
Old erroneous refusal text/digest/version remain historical evidence on load;
fresh evaluation is allowed to disagree without rewriting that past.

**Scope/privacy boundary — MET BY DIFF.** Only the three declared hunks changed.
No save validator, schema, bridge DTO, generated artifact, client intent, chooser,
test, harness or configuration change is part of this production candidate.
Save29/protocol4/projection46 therefore remains the existing shape; this review
does not substitute for the parent's scheduled contract/type checks.

## Execution limits and next gate

The parent RED report records11 actual assertion failures/19 passes/2 unchanged
todos before this correction. Its then-unreached guards are not retroactively
credited as RED coverage. Subsequently, this reviewer read the complete verbose
`03-candidate-target.txt` and sealed `03-candidate-target.json`:3 files,
30 passes/2 unchanged todos, exit0, fixedSource:true,18:43:20.802Z–18:43:59.984Z.
Both endpoints retain the exact RED checkpoint and candidate patch hash above;
both untracked-source lists are empty. All13 B-F2 cases,6 revision cases and
11 chooser cases actually pass. The completed evidence includes real winning
writer binding and scheduled take satisfaction, the missing-profile digest
guard, genuine old receipt preservation and the actual evaluator3 natural
non-achievable zero-attachment witness. A missing-profile probe remains
deliberately malformed pure input, not a newly supported lawful save.

Both typechecks, applicable neighbors/full verification and qualified publication
remain separate pending gates; this review claims none of their outcomes. New failures
must be investigated without changing default timeouts, weakening assertions or
relaxing validators. Unity/native/rendering and Owner acceptance remain deferred.

Reviewer activity was read-only source/evidence inspection and hashing plus this
sole authorized documentation write. No engine/tests/probes/typechecks, network,
installs, source/test/config edits, commits or delegation were performed.
