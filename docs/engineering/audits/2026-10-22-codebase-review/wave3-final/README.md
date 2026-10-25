# Wave 3 evidence publication

Final candidate: f3b1d09d498462359365a306e53e8a0d472133ca. Source repair commit: 04ffae8948bc93874595241027f1ab9f6f1badbd; final commit corrects only the reported solo duration. Explicit remote candidate verified on 2026-10-25.

Start with OWNER-DECISIONS.md and P16-REBASE-REPORT.md. Original lane reports, including all failures, are gzip copies in lane-logs. evidence-manifest.json maps original names/paths to publication paths and checksums. The original wave3j wrapper did not finish; the separate core-recovery report completes its missing stage at the same source identity. No wrapper exit is a test result.

The correct UI classification is p16-gate2-ui-classified.json.gz against final-ui.json.gz. The earlier p16-gate2-ui.json.cause-comparison.txt was generated against the wrong core baseline and is retained only as invalid historical analysis, not evidence of UI equivalence. Name-key compare output also hides the prior55 registry regression; classified reports and actual messages take precedence.

round8-drafts contains original proposed tests and reviews, with their historical STATIC-UNRUN labels intact. Installed final tests are in the candidate commit and round8-verified.patch; the drafting receipt assertion was subsequently corrected before that patch was captured. estate-tests/RESULTS.md carries final follow-up timings. scripts preserves all lane commands and existing baselines. No original external evidence was removed.

Original current200 remains at studio-scratch/1370-astra-takeover-20261012/p16-stopped-drafting-bridge62-integration-r1: PATCH.diff SHA256 d59d331be952e608aa4da9f89f88d71212826adb62a1f54ebbaf0cd6c4e1a1c5; MANIFEST.json SHA256 7b16780a9573185c443d4f153ead6f98795074064136031944a36d71f224039e. Side ref332a742a retained; side worktree was absent on entry. No gameplay source in this records-only publication.

Publication checks: candidate source diff passes whitespace check. Raw historical patch/compare evidence intentionally retains whitespace, so an unrestricted records diff check reports those artifact lines; newly authored records pass their scoped check. Every lane evidence copy was checksum/decompression verified, and the hook-owned AUTO block matches the archived entry bytes.
