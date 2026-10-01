<!-- 1359-D3: confirmation review of 1359-C3 r3 (contract-auditor, read-only) -->

# 1359-D3: confirmation of the P15C Wave 2 RED r3 (1359-C3)

**Verdict: CONFIRMED.**

Read at HEAD 8ed00148, with no `src` or `tests` drift. I ran nothing. The r3 patch equals `git diff ad4aaa8 389d4b2`, matches the handback's sha256 (6a4eee26…) and applies at HEAD.

**Three edits only.** The staged r2-to-r3 diff holds these hunks alone (two files, +10/-7). The helpers, the sibling patch (still 6014f074…) and the reference are unchanged. `ref-1359-r3` minus r3 equals reference r2 byte for byte (9d05d26a…). In the classification, only the B6 and F1 rows changed.

| Check | Status |
|---|---|
| B6 calls `routeL().ms` | APPLIED (I:770). No `route(`, `at(` or r1 constant appears as code in the added lines of r3 or the sibling patch. |
| F1 refusal: only L:351 | APPLIED (I:1191-1192). The pattern now needs the text "must be a whole week once settled", which only L:351 emits. L:358's message ("must not precede its release week") no longer matches. The leaf now fails a law that accepts a null week on every film (refused at L:358), and one keyed on `domainId` (the campaign film keeps `industryFilms`). The reference raises the same text, so the leaf passes at GREEN. |
| Wave R header | APPLIED (:11, :53-56): seven guards, with "six original" and "six roots" kept where they are accurate. |

I = `tests/p15c2-campaign-legacy-integration.test.ts` at 389d4b2; L = landed `src/core/campaignLegacy.ts`.
