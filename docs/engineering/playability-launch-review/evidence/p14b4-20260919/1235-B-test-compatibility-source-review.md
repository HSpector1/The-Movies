# 1235-B — Independent test compatibility source review

Disposition: **KEEP for parent integration and root compiler verification.** This reviews the frozen, unapplied 25-path candidate against the actual 1233 diagnostics. No project imports, compiler, tests or gameplay ran; no live source, fixture, index or earlier evidence changed in this review. The parent-owned core integration is separate.

| Frozen artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `1235-A-test-compatibility-handback.md` | 5,711 | `cdff9102432c0165d101b68a7e2f9b86fab332984e7951ac87bcb57d0dbde78d` |
| `1235-test-compatibility.patch` | 53,344 | `31e4a909be8e224d8edfbca789cdfc67d9d6c2aa9422d21106f7bab41c72210b` |
| `1235-test-compatibility-manifest.json` | 21,695 | `f3518aac7bd692dbf00421b3d8e6101c5f5f99e60b8e2eb8aeaf43268ea2dc10` |

I read the complete original compiler output, final handback and all 25 source diffs. The closed 1233 recorder reports source `ef38cf9a24b56dc9b462eeecdab05e4c4a4a0730`, empty consumed diff at both ends, no untracked source, fixedSource true, child2 and null signal/error. It ran 19:07:48.042–19:08:21.868 UTC, 33.826 seconds. Independent parsing reproduces 43 diagnostics: 39 in exactly these 25 test paths and four parent-owned production/harness diagnostics. Every per-file diagnostic location/code matches the manifest. This failed original record is preserved; no subsequent compiler PASS is inferred.

Independent standard-library checks verified all 56 manifest identity entries, including all 50 complete pre/postimages, the original compiler evidence, unchanged 21,703-byte initial P4/P5 test and separate frozen 1232 manifest. All 77 unified hunks reconstruct the 25 staged files exactly. Declaration lines, timeout/skip tokens, fixed 64-hex literals and explicit negative-cause regexes remain identical. These byte/text checks do not establish compilation or behavior.

The changed historical crossings call public `convertV40ToV39` before the existing downgrade chain. They neither strip the subject root nor bypass its loss guards. Current save/load positives and their current-carrier mutants use strict40; historical readers remain at their actual versions. Related source-attributed guards inside the same paths are distinguished from the original compiler errors: cohort-transition control/tamper admission, writer-continuation live-envelope positive/negative controls and digest-continuity’s current-version assertion are appropriate to their actual inputs.

The two constructed fixtures retain their existing explicit38 substrates, prove whole strict38 admission and then use genuine migration. Rule-revision, acting-discipline and save-v30 expectations derive the new empty suffix independently from the historical receipt count; the writer’s input reaches current authority through real migration. Material-evidence and save-v31 finish their actual historical converter chains before entering live operations. These changes do not manufacture recorded subject facts.

Force-order retains literal immutable38 admission/export equality before migration. Its canonical-order and imported-order routes compare their current starting envelopes to the admitted migrated bytes; the old film/career/history pins and existing 24-tick/10-action bounds remain. It makes no false whole38-versus40 byte-equality claim.

Parent integration must verify all live preimages before applying the exact patch. The reviewed next check is `node_modules/.bin/tsc --noEmit -p tsconfig.json`. The manifest deliberately has no behavioral argv: direct/shared-helper consumers and their existing simulation costs need separate actual selection and attribution.

New subjects or opportunity authority may legitimately make 40→39 refuse before older downgrade arrangements or their retained domain-specific regexes. That does not qualify those older causes. Writer-continuation’s general refusal remains only a general refusal. Strict admission of the existing constructed substrates, helper consumers, current material mutants and migrated force-order continuation is still unexecuted. No regex, fixture, fixed expectation or authority deletion is supplied to hide those limits. This is a bounded compatibility source KEEP, not a full-suite or core implementation qualification.
