# Unlanded Claude drafts and independent review

Read [REVIEW.md](REVIEW.md), then the repository's `HANDOFF.md` for the active order and exact next steps. This archive preserves useful unfinished work; it does not land gameplay source or qualify P16/P17/P18.

- `CURRENT-DRAFTS.json` selects the latest snapshot for each clone. Its `SOURCE.patch` and `MANIFEST.json` contain the tracked delta **and untracked source/test modules** against that clone's named base. All six original patches and the final P16 r2 patch were reverse-checked against their actual drafts. **Use `drafts/p16-r2/` for the corrected P16 source.** `drafts/p16/` preserves rejected repair r1; its three historical-table values must not be adopted. Do not apply these mutually incompatible save-version drafts together wholesale.
- `claude-evidence/` retains the original progress reports and test/compiler results, including failures and incomplete report placeholders. Large console logs use lossless gzip; the manifest pins both original and stored bytes.
- `reviews/` contains independent findings, retained-result attribution, the bounded P16 repair before/after images and the correction to its first rationale. Historical inputs remain unchanged.
- `DRAFT-BACKUP-MANIFEST.json` describes the initial six-draft capture. `ARCHIVE-MANIFEST.json` pins every published archive payload, including later review/correction artifacts. Publication readback lives in the fresh local root review package and Git.

Fixture payloads and fixture metadata listed as LOCAL in the draft manifests remain in their exact clone paths. They were not exported by this code backup. The R8 full original patch also stays LOCAL because it contains fixture payloads; its source-only patch and original inventory are preserved here. No private saves, dependencies, process listings, caches or credentials are included.

To recover a draft, use an isolated checkout at its manifest's `baseHead`, review/apply its source patch, and restore only its named fixture dependencies using the existing qualified sources/manifests. Reconcile source versions and authority before any production landing. The actual working clones are still present; no reset, merge, cleanup or history rewrite was performed.
