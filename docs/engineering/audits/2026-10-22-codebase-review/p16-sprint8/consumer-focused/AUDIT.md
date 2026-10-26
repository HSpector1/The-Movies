# Independent consumer-focused postflight

Freeze released. All1,653 source-manifest hashes and six preflight pins match; HEADb5c11b5a570820b4c8e8ded6830294b84d57d5a2 matches selection. Root typecheck actually exited2 (17:39:10–17:40:37); wrapper exited1. Only root-types BEGIN/END exists. Selected runtime leaves and complete generator test file are UNRUN, with no test/timing result inferred.

Actual compile cause is TS5097: new Bridge/UI imports in core-owned test files pull `.ts` import paths into the root compiler, which intentionally lacks allowImportingTsExtensions. Errors include writer-continuation test imports and their Bridge/schema/UI dependencies. Preserve this failed attempt; place the consumer assertions in the existing Bridge-owned test/compiler boundary rather than weakening compiler settings or removing the assertions.

No matching owned runner/compiler or heavy-lane lock remains. No foreign Godot was reported in sampled launch/through observations; continuous exclusivity is not inferred. No source review repeated or repository edits performed.
