# 114 — independent joint-trace source review

Disposition: **KEEP the bounded kernel candidate.** No concrete contract violation or proof-soundness defect found. This is detached finite-domain review, not owner-adapter or full P14B.4 acceptance.

## Scope and identity

Read the complete1047-line kernel, its diff against `956a17fe391892d65a8ae10bf9ce1403750bbd34`, complete112 handback, governing91/94/96, and inherited49/56. Read complete115–117 output and terminal metadata.

Independently verified:

- Kernel SHA256: `1faa6fcac443dac046bd97fa3e27c61bada80c7297f8e69ea4ebcff76d899332`.
- Protected patch: `5a6b74901273485dadf7eb3d711280eeaf7e014d81d4f972f0b90180d2a3df50`.
-115 raw: `cae947a57be13a795970326a9b62212417e29bafca7ec13de5e3d4e0ccb3a231`.
-115 metadata: `54af8345307b17ce56e722604a95786b3a98f185efcd3bdf4a36b9d36aa21d44`.

No files were written. No tests, typechecks, engine probes/imports, Git mutations, network operations or delegation were performed. Parent persists this review.

## Requirements met with source evidence

**Mode and identity separation — MET.** Lines76–106 preserve the separate public trace types. Lines327–340 reject explicit trace misuse at the optional entry. Lines387–461 validate the new mode, trace/path joins, unique occurrence identities, consistent physical-path existing status, local issuer, empty picture-owned hold arrays and forbidden background fields. Nullable release is confined to trace pictures; old optional release remains required.

**Compulsory execution and replacement authority — MET.** Lines429–447 require additions and replacements to join the correct certified trajectories. Replacement preserves fixed identity and immutable prefix. Lines468–519 construct every full ledger from all fixed holds, exact replacements and all additions, then validate compatibility before credit search. Uncredited pictures, null-event continuations and background work therefore cannot disappear. A conflicting claimed trace produces an input error, not gameplay impossibility.

**Unknown-release occupancy — MET.** Lines998–999 compute94’s effective horizon from raw horizon, target due and admitted local-prior dues; foreign source due does not extend it. Lines485–511 require each affected cast person’s exact-path continuous occupancy from `max(now,greenlight)` through that horizon. Adjacent segments compose; gaps, wrong-path coverage and missing tails fail. No hold is clipped, stretched or repaired.

**Global prior optimization — MET.** Lines544–572 create shared demands and one union of existing-event cuts across the whole domain. Lines621–685 deduplicate physical paths across variants for the optimistic componentwise prior bound. Lines904–915 optimize across exclusive branches using the same cuts and budget. Early termination requires saturation of the global upper profile; later protected probes search equivalent traces and assignments again rather than retaining the first allocation.

**Joint count and achievable proof — MET.** The shared matcher at715–900 retains exact demand counts, actual slot/window eligibility and one planning credit per person/path. Lines775–781 require the first X credited target events to be existing and the Xth to leave eight weeks’ slack. Lines929–969 keep B, X and prior protection within one joint assignment; failed protected X triggers a separate unoptimized joint search. Complete joint failure remains explicitly `jointOfferOnly`, never target-specific causal BROKEN evidence.

**Completeness and exhaustion — MET.** Positive certification requires complete claims/holds and a proved global prior optimum. The incomplete-future shortcut requires complete existing calendars and full upper-profile saturation; the zero-prior exception remains identically zero. Incomplete failed probes return UNCERTIFIED. Lines972–1035 retain one preparation/normalization/search/output budget, safe bounded count arithmetic, global trace-header-plus-path row accounting and governed limit maxima. Exhaustion cannot invent IMPOSSIBLE or a maximum.

**Witness integrity and determinism — MET.** Lines514–517 retain every executed path and effective hold identity. Lines918–925 separately expose credited picture occurrences and actual credits, without suggesting that omitted credits remove execution. Normalized semantic collections, shared cuts and canonical branch traversal precede search. Proof construction is charged. The inspected source introduces no RNG, mutable cache, owner execution callback or input mutation.

**Optional49 compatibility — MET within reviewed scope.** The optional entry still uses the original selected-alternative ledger and shared matcher. Its immutable-prefix early prune and exact selected-continuation ledger remain at727–765; a later release-only continuation is not prematurely excluded by the original full suffix. Its ALREADY_MET ordering remains unchanged. New explicit trace-tag refusals are the separately governed mode boundary, not reinterpretation of ordinary49 inputs.

## Actual recorded verification

All three records retain base956a17f and the same protected patch at both endpoints, empty untracked protected-source lists and `fixedSource:true`.

- **115:** exit0,86/86 passing across four files:38 trace cases,2 mode-separation cases and46 unchanged optional cases. Executed00:41:00.604–00:41:04.281Z; Vitest2.47s.
- **116:** root and UI typechecks exit0,00:41:21.281–00:42:33.809Z.
- **117:** bridge typecheck exit2,00:42:53.481–00:43:20.673Z. Sole diagnostic remains `tests/bridge-p14b4-cast-class.test.ts(364,20)` TS2353: future predicate `kind` is absent from live `{count:number}`. This matches the previously inspected103 obligation; it is not a new kernel diagnostic.

The inspected targeted output contains no failed-suite, unhandled-error or timeout diagnostic. These results support, but do not substitute for, the source review.

## Limits and next action

The lower kernel cannot verify that provenance strings describe actual owner execution, that supplied physical-path identities are truthful, that coverage flags exhaust real choices, or that `preparationWork` was charged before upstream work. Those remain explicit owner-adapter obligations.

No real owner-domain construction, completeness/performance measurement, live capacity integration, P2 attachment/rival policy, Save30/projection47 activation, full-suite closeout, native verification or Owner acceptance is established here. Preserve the remaining bridge diagnostic and publish only a qualified detached-kernel checkpoint before continuing the independently specified adapter work.
