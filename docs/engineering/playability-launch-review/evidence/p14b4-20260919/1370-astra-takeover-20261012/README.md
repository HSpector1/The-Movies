# Codex integration recovery — 2026-10-12

These are preserved **unlanded drafts**, not gameplay acceptance. Production was R8/Save46 at source tree `cf7d20cd585f72fd178e06c3cd2a8821bbc0c26f`; local and explicitly advertised working ref were `cac811c7c773c4d9f93ec6827c95c451d73a3e26`. No remote main update is authorized.

Each `drafts/<slice>/SOURCE.patch` records the current clone's tracked changes and untracked source against the exact base in its manifest, with every selected postimage hashed and a successful read-only reverse-application check. These snapshots preserve late work that the old package cuts did not necessarily include. They are recovery inputs, not instructions for blind replay onto a newer predecessor.

P15B's base `8cecf5aa` was a local-only stack commit: R8 plus founding r3. `drafts/p15b/BASE.bundle` preserves that exact commit and its generated founding inputs, with published `db3fc572` as prerequisite; `git bundle verify` passed. Other draft bases already belong to published history.

Full original patches, original staged-index patches, clone status, original package cuts and all excluded fixture data are retained locally in `/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012/originals/`. The manifests identify exclusions: founding's three generated fixture files, P17's predecessor pin JSON, and P15B's inherited HANDOFF. No clone, package, earlier revision, failed attempt, Owner save or private process inventory was deleted or published. Existing generated fixture provenance stays in its original manifest.

`founding-r7-recovery/` preserves the completed old broad UI run and exact command/results alongside the original report and manifest, including their stale pending marker. Actual result: 772 tests, 761 pass, 11 fail, exit 1. These are recovered historical results, not a fresh run or automatic clearance. The source candidate remains PATCH SHA256 `ed28d11295bd74e15e59316c257968512a6035de686b8d4a77129526380a26fd`; all 189 source/test postimages matched its manifest.

The current Owner takeover order replaces automatic review fan-out with one consolidated independent review and targeted verification, limits workers to two specialists and one intensive project execution, and requires controlled failure attribution. All specialists use GPT-6.1 Sol following the Owner's correction. Final integrations and cross-system acceptance remain unfinished; HANDOFF's CURRENT section gives the exact next task.
