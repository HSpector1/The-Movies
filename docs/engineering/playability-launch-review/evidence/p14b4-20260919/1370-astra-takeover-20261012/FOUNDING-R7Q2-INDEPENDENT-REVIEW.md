# Founding r7q2 one-line independent review

Reviewer: GPT-6.1 Sol, Codex-native specialist `founding_review_sol`, 2026-10-12.

KEEP the corrected one-line test delta. Reviewed `/Users/zacheryspector/studio-specialists/founding/tests/p14d1-rival-shelving.test.ts:659`, on clone HEAD/base `db3fc57242669d5c752d87a49ce0a87938324b6b` with the uncommitted r7q2 candidate. The assertion reads `before.promises` and inserts `'kind' in p.predicate` before reading `p.predicate.kind` and `p.predicate.scriptProjectId`.

The guard narrows the predicate union's plain-count member before discriminant/property access instead of casting it. It preserves the no-open-named-promise assertion at the actual shelving decision input, matching `hollywoodTick.ts:297`; it changes no runtime/gameplay source or test requirement.

The parent's r7q1 gate compiler reported two TS2339 errors at that access; this review confirms the source correction by inspection only. No reviewer tests/compiler or source edits were performed. A fresh compiler prerequisite and the parent whole-file focused run remain required; KEEP is not a measured pass. Earlier r7q1 package and failed evidence remain preserved. This report was written only at the parent's explicit request in the assigned scratch directory.
