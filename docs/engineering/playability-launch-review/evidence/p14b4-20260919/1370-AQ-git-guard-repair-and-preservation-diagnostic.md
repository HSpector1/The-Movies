# 1370-AQ: Git guard repair and preservation diagnostic

This checkpoint fixes a verification helper that could rewrite Git's index during an intended read-only check. It also preserves the actual diagnostic results, the generated-HEAD correction, and all major lessons. The repaired helper is ready for integration and has not yet been used for fullfunction qualification. Production gameplay source is unchanged. Fullfunction qualification, the 1363 ledger, P16, P17 and P18 remain open; main remains unmerged.

## Verified results

- Native refusal diagnostics passed 86 controls (13 positive, 73 specific refusals), actual 58815. The added diagnostics preserve original error identity and bounded output. This proves the finite mechanism, not whole-scenario fit.
- The original-guard diagnostic wrapper passed 32 controls (9 positive, 23 specific refusals), actual 93221. It authenticates the exact original code frame and preserves the original exception even if evidence writing fails.
- The sanitizer repair passed 8 controls (7 positive, 1 specific original-defect regression), actual 13417, in 0.484306823 seconds. The original function changed a disposable index; the corrected function preserved its complete bytes and metadata. Independent review 6401e029 and root adoption 20dae623 admit this result.
- A separate read-only proof, actual 5264, matched all 20,920 current stage-zero paths, modes and blob IDs to published AP d203. Current index bytes and metadata were unchanged during that check. Independent review fe263829 and root adoption 5fa1ab74 admit only current semantic equality; current raw index and path streams remain LOCAL.

## Failures and attribution

Actual 42397 stopped in fixture generation because an inherited generated test still expected AO f2f97c62 while current operational HEAD was AP d20347b8. No fixtures, baseline, mutant or observer diagnostic ran. Held R3 corrects that one assertion; the static generated-authority audit passes for AP. A successor publication requires rebinding every current assertion to its actual HEAD. Historical source roles stay historical.

Mandatory shared postflight 54871 failed its original final immutable equality predicate. The original scanner discarded the compared map on failure. Its exact differing field remains unknown; no later observation retroactively passes or attributes it.

Fresh diagnostic 96592 preserved that original predicate and failed again, retaining a bounded full LOCAL map. Its own summary exhausted 65,536 visits and truthfully retained incomplete coverage. A separate complete comparator and independent traversal of 226,011 nodes found exactly one differing scalar: `protectedDigests/commonGit`, from 33ae2baf… to 0972dde0…. Every other retained immutable field matched, including production/source/dependency protection and strict identities. Root adoption 14017425 accepts diagnostic evidence only.

The commonGit digest covers per-path mode, size, file hashes and link targets, but the old scanner retained only its aggregate. The historical per-file map and raw index were not retained. A focused metadata check found the headless worktree index timestamp 12:11:03 inside the actual failed route's 12:10:59–12:11:44 window. Source review found that nested `clean_git_env` removed every GIT_ variable, including `GIT_OPTIONAL_LOCKS=0`, before `git status`. The disposable regression proves this write mechanism. It does not prove that the index alone accounts for the historical aggregate difference.

## Correction and recovery boundary

The fresh proof helper preserves all 35 other definitions and changes only the sanitizer: remove inherited GIT_ settings, then force GIT_OPTIONAL_LOCKS='0'. Original helper b9ff56da remains immutable; corrected current helper 6d834672 has exact inverse proof and independent source review 11e1d503. Future `CONFIG.proofMethods` can name this current derivative while preserving historical types/proofConfig/result roles. Both entry gates must authenticate the derivative's source, inverse, review and actual controls.

The operational recovery proposal requests explicit permission for a new verification baseline with the lost commonGit byte-continuity interval left unqualified. It preserves original bc21 and both failures, does not omit the index or weaken the historical predicate, and grants no game pass. All unaffected accepted private/source/dependency identities must remain exact. After any approved publication transition, the next attempt still needs independently reviewed current-HEAD bindings, fresh complete protection, original clocks/caps/fixtures, and complete postflight.

## Lessons and preservation

The cumulative AQ lessons document records 15 lessons, including generated-code authority checks, nested environment sanitization, complete versus bounded comparison coverage, independent test-author findings, callback assertions swallowed by containment, actual producer-based archive exclusions, and disposable regression scope. Earlier lessons and failures remain preserved.

The finite archive carries all selected AQ source history and measured outcomes plus the entire late AP finalization package. Raw machine PS/FD, local metadata maps, current raw index/path streams, synthetic cap padding and disposable Git fixtures are LOCAL hash/size evidence or excluded rebuildable trees, never copied as payload. Authenticated prior HEAD blobs are reused rather than duplicated. Publication readback must verify advertised branch, tracking ref, ancestry, unchanged src tree and clean working tree.

No heavy process remains active at the proposed cutoff. This is a repair/evidence checkpoint; it does not close the 1363 ledger or authorize a main merge.

Archive readback: 732 roles; 624 copied payload files totaling 19,263,510 bytes; 81 authenticated prior-HEAD roles; 27 LOCAL hash-and-size roles. The inventory contains 58,911,177 source bytes and includes all 54 files in late AP finalization.

Read the [archive manifest](1370-aq-git-guard-repair-and-preservation-diagnostic/ARCHIVE-MANIFEST.json), [15 lessons](1370-aq-git-guard-repair-and-preservation-diagnostic/payload/1370-aq-root-continuation-20261010-r1/LESSONS-r9.md), [reviewed recovery proposal](1370-aq-git-guard-repair-and-preservation-diagnostic/payload/1370-aq-root-continuation-20261010-r1/OPERATIONAL-RECOVERY-PROPOSAL.md), and [held integration plan](1370-aq-git-guard-repair-and-preservation-diagnostic/payload/1370-aq-root-continuation-20261010-r1/PROOF-SANITIZER-INTEGRATION-PLAN.md). The Owner recovery decision remains pending; elapsed time is not approval.
