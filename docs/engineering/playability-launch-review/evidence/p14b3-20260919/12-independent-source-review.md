# P14B.3 independent source review — KEEP

2026-09-19. Native contract-auditor bounded review; parent explicitly authorized
this evidence-document write after the read-only review. No production/test edit,
engine execution, test/typecheck run, network access, delegation or commit by this
reviewer. Parent owns serialized verification and publication.

## Exact candidate and scope

Base/HEAD: `f4e1230639552f8a496562ec97b3e5aa3ec5a156`.
Candidate patch SHA256:
`6129b77df0e3b4c4b1111b2ee226860ee6e3538de95b3c3a3bdf6e3805026ba6`.
The reviewer hashed the actual `06-candidate-target.patch`,
`07-candidate-typecheck.patch` and `08-candidate-bridge-typecheck.patch`; all three
have that identity, matching their before/after recorder metadata.

Production review covered the complete diff in ONLY:

- `src/core/promises.ts`: 22 additions / 16 deletions.
- `bridge/contract.ts`: 77 additions / 38 deletions.
- `bridge/session.ts`: 14 additions / 12 deletions.

Relevant unchanged callers, promise projection and session guards were read as
needed. The two separately authorized neighboring test changes are covered by
`05-neighbour-review.md`: real-current Example B and a historical poach comment.
No chooser, save, schema, generated artifact, candidate pool or B-F2 eligibility
change is present in the inspected production diff.

The 34 new independent cases remain byte-identical to the base. Direct diff of
their three files is empty; independently computed current SHA256s are:

| File | Cases | SHA256 |
| --- | ---: | --- |
| `tests/p14b3-reservations.test.ts` | 9 | `bb104d96af97c55e9385c332e080c287c953b088721b08134a65b6b5b5dd19ba` |
| `tests/bridge-p14b3-promise-command.test.ts` | 19 | `2074c9616e3d1a306109e8780fb0af87a549a569cbdf308c1a79c6cd8d1934de` |
| `tests/p14b3-rule-revision.test.ts` | 6 | `ef9e0caa7933ac9e502849c064f6adcc53f62a44189b190379fbfe7cea65403e` |

The third identity is the installed, genuinely artifact-pinned T1 test, not its
earlier unpinned external draft. No historical fixture bytes were rewritten.

## Contract verdict — MET WITH SOURCE EVIDENCE

Authority: the dated P14 plan B3 expansion and traceability amendment;
`../p14b2-20260919/12-b3-expansion-draft.md`; companion sections 4.1–4.4 and R5.

1. **Shared active membership.** `promises.ts:269–282` selects OPEN roots that are
   bound OR referenced by a CURRENT proposal. It preserves self-exclusion,
   beneficiary matching, half-open overlap, root order and nonnegative
   count-minus-progress arithmetic. The digest uses the SAME filter at line 318.
   Abandoned unbound roots remain stored but no longer reserve or perturb this
   input list. There is no issuer filter or optimization that would silently
   remove competing CURRENT cross-issuer reservations; that separate policy is
   unchanged.
2. **Version/history boundary.** Evaluator revision 2 at `promises.ts:39–42`
   stamps new evaluations and newly minted roots. No load or historical-record
   rewrite was introduced. Existing settlement still updates the feasibility
   receipt/binding, not the original root version. Save29 remains unchanged;
   positive historical versions are not repurposed as future predicate tags.
3. **Atomic route.** Shared `prepareMarketProposal` at `contract.ts:443–478`
   performs the real submit/revise replacement first, then reads feasibility on
   that exact intermediate immutable state and calls real attachment only when
   offerable. A refusal or exception returns no `next`; temporary proposal,
   receipt and ordinal effects never escape as a partial commit. Removal and
   withdrawal retain their real reducer paths. Proposal submission moves no
   signing money; actual winning settlement alone binds the contract.
4. **Retained values and deterministic apply.** Canonical payload conversion and
   engine conversion independently copy nested promise values
   (`contract.ts:358–360`, `589–597`). Session quote identity and private pending
   authorization use a detached payload (`session.ts:1903–1924`). The
   module-level apply function retains shared function identity while preparing
   against CURRENT state, rather than publishing a cached quoted successor.
5. **Whole-quote refusal.** `contract.ts:552–584` combines base legality with the
   nested promise verdict. Nonofferable promises expose outer `ok:false`, the
   exact engine-owned nested classification/message and null unrelated base
   refusal fields. `session.ts:1912` refuses registration before preflight or
   pending-map insertion; commit also checks the live nested verdict at 1673.
6. **Existing authorization/isolation controls.** Player issuer identity remains
   engine-owned. Current-state digest equality and reconversion, session and
   revision guards, command replay handling, the existing 16-entry pending-map
   cap, and command/load invalidation remain intact. No new shared pending state,
   persistence of pending authorization or bypass of those controls was added.

No concrete blocking source defect was found. This KEEP is bounded to B3, not
approval of the separately recorded primary-role eligibility defect, broader
reservation policy, P2 families or all P14 work.

## Completed evidence actually inspected

The reviewer read both metadata and raw output for these parent-run checks:

- `06-candidate-target`: 5 files / 54 tests passed, exit 0;
  `2026-09-19T16:36:45.929Z`–`16:38:03.054Z`. Includes all 34 new cases plus
  B1 promises and B2 fixture preconditions. Raw Vitest duration 75.64 seconds.
- `07-candidate-typecheck`: root plus UI TypeScript checks, exit 0;
  `16:38:31.405Z`–`16:40:03.292Z`.
- `08-candidate-bridge-typecheck`: bridge TypeScript check, exit 0;
  `16:43:06.109Z`–`16:43:42.897Z`.

All three record the exact base and candidate patch above at both ends,
`fixedSource:true`, no untracked source, no signal and no runner error. These
observed results are separate from the source-review reasoning; this reviewer
did not execute them.

## Remaining verification and label limits

The parent's 22-file neighbor run `09` is ongoing at this handback; its result
was not inspected or inferred. The remaining contract checks, committed full
core/bridge boundary, exact failure attribution, qualified closeout and remote
publication are not established by this report. Parent will record separate
candidate disposition after `09`–`11`.

No wholly green full suite, B3 closeout, B-F2 correction, P2 implementation,
Unity/rendering/native verification or Owner acceptance is claimed.
