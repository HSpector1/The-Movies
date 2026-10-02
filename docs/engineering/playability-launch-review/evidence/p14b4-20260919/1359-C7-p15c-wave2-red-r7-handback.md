# 1359-C7 handback: P15C Wave 2 RED r7 (answers 1359-F6 rulings 1-2 on 1359-D5 finding 1)

**Status: staged in scratch, not run.** r7 is r6 plus one assertion block in `legacy-old-law-fixture-v1-validates-after-retune`.
I made it on 2026-10-02 and finished at 01:57 CDT. I ran no vitest, node, tsx, vite-node or tsc, `tsc --version`
included. Reference r4 and sibling r2 are unchanged and both still apply.

Notation: I :N is `tests/p15c2-campaign-legacy-integration.test.ts`, at r6 unless marked r7. T is
`/Users/zacheryspector/studio-scratch/1359-red/tree`.

| Item | Where |
|---|---|
| RED r7 patch | `1359-p15c-wave2-red-r7.patch`: `git diff ad4aaa8 main` in T, 6 files under `tests/`, cumulative from HEAD bc2f6007 |
| Classification | `1359-p15c-wave2-red-r7-classification.json`: r6's 116 rows; three fields change (below) |
| T `main` | 555c41f (RED r7): r6 8fa01ae plus one commit |
| Reference r4 | `1359-p15c-wave2-reference-r4.patch`, unchanged (T `ref-r4` 2a9c5f5) |
| Sibling r2 | `1359-p15c-wave2-sibling-r2.patch`, unchanged |

## The r6-to-r7 diff, in full (`git diff 8fa01ae 555c41f`)

```diff
diff --git a/tests/p15c2-campaign-legacy-integration.test.ts b/tests/p15c2-campaign-legacy-integration.test.ts
index dd433b0..ed43f1b 100644
--- a/tests/p15c2-campaign-legacy-integration.test.ts
+++ b/tests/p15c2-campaign-legacy-integration.test.ts
@@ -1203,7 +1203,9 @@ describe('p15c2 replay: the validator re-runs the definition the manifest names
     for (const [name, value] of Object.entries(V2.thresholds)) expect(t[name], `live ${name}`).toBe(value)
     expect(makeSave(oldLaw).saveVersion).toBe(STEP)
     // Relabelled as the other era, the same manifest refuses on replay: v2's evaluator holds the voice v1's did not.
-    refuses(asOfficial({ ...v1Official, definition: 'campaign-legacy/v2' }), 'outcome')
+    refuses(asOfficial({ ...v1Official, definition: 'campaign-legacy/v2' }), /outcome|qualifying/)
+    // Relabelled as v1, the genuine v2 manifest refuses on replay: the validator runs the frozen v1 entry (1359-F6 ruling 1).
+    refuses(asOfficial({ ...officialOf(frozen), definition: 'campaign-legacy/v1' }), /outcome|qualifying/)
     // An unbumped retune (kept from r5): every live value moved and the definition not bumped.
     const RETUNE: Record<string, number> = {
       LEGACY_CRITIC_ACCLAIM_MIN: 40, LEGACY_CRITIC_PAN_BELOW: 60, LEGACY_AUDIENCE_LIKED_MIN: 30, LEGACY_MIN_FILMS: 1,
```

- **Item 1, the reverse relabel (r7 I:1207-1208):** G6240F's own v2 manifest, relabelled `campaign-legacy/v1`, must refuse
  on replay.
- **Item 2, the token (r7 I:1206):** the existing relabel check now matches `/outcome|qualifying/`, as I:1161 does.
  `refuses` takes a pattern: its signature is `refuses(state, ...tokens: (string | RegExp)[])`, and it calls
  `toMatch` for a RegExp (`tests/helpers/p15c2-legacy.ts:112-118`).
- No other line of any file changes. The r7 patch's sections for the other five files equal r6's byte for byte. The
  route L helper keeps blob 09de4a54998340488a1ff1a5e47132b02f0e00a3.

## The classification (r6 to r7)

Three fields change, and every other field of the 116 rows is equal to r6's:
1. **`legacy-old-law-fixture-v1-validates-after-retune`, `charterClause`.** It gains: "1359-D5 finding 1 and 1359-F6
   rulings 1-2 (r7: the genuine v2 manifest relabelled as campaign-legacy/v1 refuses on replay at
   official.studios[0].archetypes[0].outcome, so the validator runs the frozen v1 entry; both relabel checks match
   /outcome|qualifying/)".
2. **The same row, `lines`:** 1175-1226 becomes 1175-1228, since the leaf grew by two lines.
3. **`legacy-law-settled-week-null-authored-only`, `lines`:** 1233-1264 becomes 1235-1266, since the leaf moved down by two lines.

Items 2 and 3 follow from the two added lines, so every span still matches its leaf.

The old-law row keeps `atRed` "fail", `atReferenceR4` "pass" and its `firstMessageAtRed`
("Error: RED: src/core/campaignLegacy.ts does not export a function named 'freezeCampaignLegacyWeek' (1359-A §3-§5)").
At the RED commit the leaf still fails at its first statement, `genuineFrozen()`.

## Expected results (unchanged totals, 1359-F6 ruling 3)

- **At the RED commit (HEAD plus r7):** 116 tests, 40 failed and 76 passed. The old-law leaf fails at its first
  statement with the message above. The root type gate exits 0, by reading:
  - `refuses` already accepts a RegExp;
  - `asOfficial` takes an `Official`, and the spread of `officialOf(frozen)` with a string `definition` is one.
- **At reference r4 (r7 plus reference r4):** 113 passed, and C2-C4 fail on FIXTURE PENDING. Both relabels refuse, by
  reading the reference.
  - The checks before the replay pass for the reverse relabel:
    - identity: `campaign-legacy/v1` is in the table, and its boundary and mode match;
    - stamp: G6240F's own;
    - bounds: the player's artistic voice cites 12 refs and counts 37;
    - sources and refs: the same rows as the v2 manifest, which validates.
  - The v1 entry's replay reads the player's artistic voice as `notHeld` (7 of 122) against the stored `held` (37). So
    `firstDifference` stops at `official.studios[0].archetypes[0].outcome`, and the message matches `/outcome|qualifying/`.
  - A validator that replays only the live era accepts this state, so the leaf now fails such a validator (1359-D5
    finding 1).
  - The root type gate shows X2's 35 errors at X2's positions, as for r6.

## Apply checks

All checks ran in `/Users/zacheryspector/studio-scratch/1359-red/applycheck-c7`. I filled it with
`git archive bc2f6007 tests src ':!tests/fixtures'`, then ran `git init`. Base tree: 9224cb7b. I did not touch the repo's
index, worktree or stash.
- `git apply --check` of RED r7 alone at HEAD: OK.
- RED r7 applied, then `--check` of **reference r4 on r7: OK.**
- `--check` of sibling r2 on r7: OK.
- `--check` of sibling r2 on r7 plus reference r4: OK.
- After applying both:
  - the 6 test files equal T `main`'s blobs;
  - the 7 `src` files equal T `ref-r4`'s;
  - reference r4 touches no test file.

## sha256

| File (in `/Users/zacheryspector/studio-scratch/1359-red/`) | sha256 |
|---|---|
| `1359-p15c-wave2-red-r7.patch` (127,937 bytes) | e3ccde792ac00b8b7c1bc343e74a1c1c7c2571c71303ea57aff716781463c5a9 |
| `1359-p15c-wave2-red-r7-classification.json` (96,443 bytes) | 9ec7b936bc3a07a1fb811d7fc4c69c717176e88e15e22e5777c43551367571bf |
| `1359-p15c-wave2-reference-r4.patch`, unchanged | 66dc946d83e3b93aa19af6a7ac8f4a9eacef56044b9584e6fd2b3e29905fa025 |
| `1359-p15c-wave2-sibling-r2.patch`, unchanged | d703e29ca9189bb06bad39985c991f99a73632f9c6feeb5549d886c0354b97f8 |
| `edit-r7.py` (the one edit) | 3c75601d280da1401780a0e5ac381af6b765144456703701c61d9fec746b444d |
| `make-classification-r7.py` (r6's rows plus the three fields) | 38f28f61c94a8a0c95a8b5161cc3d58e5665beca61b9e0ca38856e23d1642bbe |

The final report gives this handback's own hash. T commit `main` is 555c41fdb6af2f1bd98c014d7967621528e0aa8d (tree
b65b4741). The integration file at r7 is blob ed43f1b4a28ff720d366a6215aab6b3754cda706.
