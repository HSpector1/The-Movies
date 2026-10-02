# 1358-E2: relationship slice B production, revision r2

Role: the single production writer for relationship slice B. Task: apply 1358-F8 ruling 2 to step 1's Save44
validator and rebuild steps 2 to 4 on it as cumulative patches. I ran no vitest, tsc, node, tsx or vite-node, and I
edited no test. The only programs I ran were git in the scratch tree, read-only git in the real repository, and
python that prints.

**Status: done.** Step 1 gains two refusals in `validateRelationshipsRoot` at era 44, in
`src/core/relationships.ts`, the one file that changes. Steps 2 to 4 change only by the rebase: each r2 step
differs from its first-delivery step by exactly the step 1 delta. The Bridge files and the three generated
artifacts are byte-identical to the first delivery. Per F8 ruling 3, the anchor after a gaining success needed no
change.

## The step 1 delta, in full

`git diff step1 step1-r2` (1 file, 17 insertions, 2 deletions):

```diff
diff --git a/src/core/relationships.ts b/src/core/relationships.ts
index 1cf7acf..72b02ed 100644
--- a/src/core/relationships.ts
+++ b/src/core/relationships.ts
@@ -525,7 +525,9 @@ const BOND_KEYS = ['formedWeek', 'endedWeek'] as const
  * productions can contest in one week, the parent's reading of "ascending"), distinct
  * production refs, a non-empty subset of the cast slots in slot order, and no more rows
  * than `sharedCompetitions`. Romance: an integer value 0..100 and bonds in order, only the
- * last of them open. Every week inside the recording interval, as above.
+ * last of them open, an open bond formed at or before the track's `anchorWeek`, and no
+ * person holding open bonds on two edges (1358-F8 ruling 2: no engine route writes either
+ * shape, so a save holding one is forged). Every week inside the recording interval, as above.
  */
 export function validateRelationshipsRoot(state: unknown, era: 31 | 42 | 44 = 31): void {
   const fail = (message: string): never => {
@@ -572,6 +574,7 @@ export function validateRelationshipsRoot(state: unknown, era: 31 | 42 | 44 = 31
   }
 
   const seenPairs = new Set<string>()
+  const openBonds = new Map<string, string>() // era 44: person -> the edge holding their open bond
   for (let i = 0; i < rows.length; i++) {
     const at = `state.relationships[${String(i)}]`
     const row = record(rows[i], at)
@@ -641,10 +644,11 @@ export function validateRelationshipsRoot(state: unknown, era: 31 | 42 | 44 = 31
     exact(romance, ROMANCE_KEYS, r)
     const value = integer(romance.value, `${r}.value`)
     if (value < 0 || value > 100) return fail(`${r}.value must be an integer from 0 to 100`)
-    recordedWeek(romance.anchorWeek, `${r}.anchorWeek`)
+    const anchor = recordedWeek(romance.anchorWeek, `${r}.anchorWeek`)
     const bonds = romance.bonds
     if (!Array.isArray(bonds)) return fail(`${r}.bonds is not an array`)
     let previousEnd = boundary
+    let open = false
     for (let j = 0; j < bonds.length; j++) {
       const b = `${r}.bonds[${String(j)}]`
       const bond = record(bonds[j], b)
@@ -653,11 +657,22 @@ export function validateRelationshipsRoot(state: unknown, era: 31 | 42 | 44 = 31
       if (formed < previousEnd) return fail(`${b} is out of order: it forms before the previous bond ended`)
       if (bond.endedWeek === null) {
         if (j !== bonds.length - 1) return fail(`${b} is open, but only the last bond may be open`)
+        // Formation anchors the track at its own week and every later write moves the anchor forward.
+        if (formed > anchor) return fail(`${b} is open but forms after ${r}.anchorWeek: an open bond forms at or before the track's anchor`)
+        open = true
         continue
       }
       previousEnd = recordedWeek(bond.endedWeek, `${b}.endedWeek`)
       if (previousEnd < formed) return fail(`${b}.endedWeek is before its formedWeek`)
     }
+    if (!open) continue
+    // The formation check records every third-party ending before a bond forms (1347-A §2.3).
+    const edgeId = `relationship-edge-${String(i)}`
+    for (const person of [a, b]) {
+      const held = openBonds.get(person)
+      if (held !== undefined) return fail(`${r}: ${person} holds an open romance bond on ${held} and on ${edgeId}; a person holds at most one`)
+      openBonds.set(person, edgeId)
+    }
   }
 }
```

Inside the bond loop, `b` names the bond's path. After the loop, `b` is again the edge's second person, declared
at the top of the edge loop.

## The two rules

**Rule a (finding 2): an open bond forms at or before its track's anchor.** The refusal reads
`validateSaveV44: state.relationships[<i>].romance.bonds[<j>] is open but forms after
state.relationships[<i>].romance.anchorWeek: an open bond forms at or before the track's anchor`. It runs only on
the open bond, which is already the last, so the earlier refusals keep their order. A lawful state always passes:
formation writes `formedWeek` and `anchorWeek` at the same write week, every later romance write moves the anchor to
its own week, and `recordEnding` never touches the anchor.

**Rule b (finding 3): no person holds open bonds on two edges.** "Open" means the stored last bond with
`endedWeek: null`. The rule reads no week and derives no ending. The refusal comes at the second edge and names the
person and both edges: `validateSaveV44: state.relationships[<i>].romance: <person> holds an open romance bond on
relationship-edge-<k> and on relationship-edge-<i>; a person holds at most one`. A lawful state always passes.
A bond forms only on a write whose `thirdPartyBond` check ran and found nothing open. That check records each
third-party bond that ended on read before it decides. Any other stored-open bond of either person would block the
gain, so a lawful save never stores two. Two open bonds on edges that share no person pass, which is r8's control.

Both messages contain "romance".

**What stays the same.**
- Engine routes: the rules live only in the validator.
- The RED rows (r5, r6 and r7) that pass a romance through the validator all sit in tests/p14b10-save-v44.test.ts:
  - Row 39 (:289) stages its open bond at formedWeek 100 with anchorWeek 100, and passes.
  - Row 43 (:322) stages formedWeek 10 with anchorWeek 10, passes validation, and still refuses at the downgrade.
  - Row 40 (:296) holds no open bond.
  - Rows 37 (:275) and 38 (:282) refuse on their earlier messages: out of order, and only the last bond open.
- Every staged romance carries one open bond at most, on the first edge only.
- The romance, Bridge and p14b5 leaves stage romance without the validator, through `advanceRelationshipsWeek`,
  `withEdges` or `withRoot`.

**F8 ruling 3 (finding 6): no change.** `writeRomance` sets `anchorWeek` to the write week on every write it
completes. A gaining success completes its write (step 3, `driveTake` into `writeRomance`), so r8's assertion after a
gaining success reads the write week. A success that cannot gain returns before writing (Q3).

## Patches

Each file is `git diff red-r5 step<k>-r2`: cumulative and production only. All sit in
`/Users/zacheryspector/studio-scratch/1358-prod/`.

| File | Bytes | sha256 |
|---|---:|---|
| `1358-rel-sliceB-production-step1-r2.patch` | 47,929 | `95d5a5d9083ef56174ae1a8205dfb18565897229b786817456f3ce512442a9a0` |
| `1358-rel-sliceB-production-step2-r2.patch` | 55,224 | `eaa026e2cdd071ee21bf0eefd26b618a861e1a7bb0bfa7038fc1abff4a8edd08` |
| `1358-rel-sliceB-production-step3-r2.patch` | 78,585 | `510c361bae1b076bbebfe1bbf49c84dd735009705a9fd44014bf90e8956a8c1f` |
| `1358-rel-sliceB-production-step4-r2.patch` | 314,846 | `2004b500b8d4be509f82381a0f3ab2022b28732cbe4fd3c0d79c22601c2cb96f` |

Each patch is 1,098 bytes larger than its first-delivery counterpart.

Apply check: each r2 patch passes `git apply --check` on `red-r7` (r7 applied on base with `--include='tests/*'`,
sha256 `82b5e16e…`), on `red-r6` and on `base` (HEAD with no RED). No patch touches a test file.

## Steps 2 to 4 change only by the rebase

I built the revision in git: a commit `step1-r2` on `step1`, then `git cherry-pick` of `step2`, `step3` and
`step4`. Each cherry-pick applied cleanly. A python script compared the diffs with `index` lines and hunk line
numbers removed:

- For k = 2, 3 and 4, `git diff step<k> step<k>-r2` equals the step 1 delta: one file, the same lines.
- For each increment, `git diff step<k-1>-r2 step<k>-r2` equals the first delivery's `git diff step<k-1> step<k>`.
- The step-4 Bridge files and generated artifacts keep their first-delivery blobs:

| File at step 4 | Blob (r1 and r2) |
|---|---|
| `bridge/schema/project-studio-bridge.schema.json` | `d753895d71cdf8365562120f34f491b1d159cd84` |
| `generated/unity/StudioBridgeDtos.Generated.cs` | `a155677b2cacc4ec0e1eb95475cc31d07a0e2310` |
| `generated/unity/project-studio-bridge.contract-manifest.json` | `6e9ec5159a8e9e4be34b4dac4b63f3a60cb8ceea` |
| `bridge/schema/bridge-schema.ts` | `3007ee5e13b22ffd77acad483628d0116bace49a` |
| `bridge/relationships.ts` | `5197ffd459d0f5a9634f035bb9d98d36975464d9` |
| `bridge/runtime-checkpoint.ts` | `0df9e365a44965fc75f90429af6b984e72678db1` |
| `bridge/finance-upcoming.ts` | `be472f839332f9a3bbb3626babccc48e9934fed8` |

The generator's source bundle holds no file under `src/`, so `generatorSourceSha256` stays `4aa01cd5…`. The emulator
self-check (`gen/contract.py verify`) on `step4-r2` passes all nine checks, and its bundle hash equals the manifest.
The `schemaId` stays `sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253`.

`src/core/relationships.ts` is the only file whose blob moves, at every step:

| Step | First delivery | r2 |
|---|---|---|
| 1 | `1cf7acf57a2692c346a53357fd5043daec873d12` | `72b02edb63dd3c347e002410af72893474c5419e` |
| 2 | `14b5bc2eca0d913d80766de3eaeb54c2ebb61500` | `56982db955351f67f2d20e6f493a4eeb451b254b` |
| 3 | `e1835f29e7e8ad4c6ebd405a760d779dd67297f9` | `77b60749a5d6db37918f119bdb243efd667218de` |
| 4 | `e1835f29e7e8ad4c6ebd405a760d779dd67297f9` | `77b60749a5d6db37918f119bdb243efd667218de` |

## Post-image blobs, per step

Pre-image blobs are HEAD's (`red-r5` changes only tests). A file absent from a step keeps HEAD's blob there.

| File | HEAD (pre-image) | step1-r2 | step2-r2 | step3-r2 | step4-r2 |
|---|---|---|---|---|---|
| `src/core/types.ts` | `a56cd28e79e1bfde767e35c9d58dd9bd85ec0a61` | `fb1dee30818a90eff549d95c4726debfea979182` | same as step1-r2 | same | same |
| `src/core/relationships.ts` | `8a8f526911e218d329e00a081e87ede329493ffa` | `72b02edb63dd3c347e002410af72893474c5419e` | `56982db955351f67f2d20e6f493a4eeb451b254b` | `77b60749a5d6db37918f119bdb243efd667218de` | same as step3-r2 |
| `src/core/save.ts` | `2f7006bcf34422ff2207f0e27a98fe03bfdee19e` | `818cc73f969235fa5e8b8e48ab99520c51198e78` | same as step1-r2 | same | same |
| `src/core/index.ts` | `0e6cfa3b4e50d4cb190817b93139fb52440ce97b` | `33bde0420f1d2189f8443b17e4211aebcb359564` | `2c8e93b52cf6ebbc6d34cfe1ca0f7a8a28f7cd75` | `561c200a4dcf3b6cefe88052ed860f852b5b6500` | same as step3-r2 |
| `src/core/relationshipLabels.ts` | `aacec77bd0e7778e05d3b8cc85c906934127a418` | HEAD | `b5b4e529810baa11f90709605b8bc172d1e9e3bc` | same as step2-r2 | same |
| `src/core/talentMarket.ts` | `f572d051cf073ba403a7abdf8ffa2023dc88af63` | HEAD | HEAD | `c5fd8cf73969bb14084d4cbd3a58fdfc8ecb2c95` | same as step3-r2 |
| `bridge/finance-upcoming.ts` | `0c90c2b2753b0a14dc73bfd5459903dba0e6055c` | HEAD | HEAD | `be472f839332f9a3bbb3626babccc48e9934fed8` | same as step3-r2 |
| `bridge/relationships.ts` | `b7d33e5bb93cc798853b715f1c6323d6dc82444a` | HEAD | HEAD | HEAD | `5197ffd459d0f5a9634f035bb9d98d36975464d9` |
| `bridge/runtime-checkpoint.ts` | `c8b118976d1a004c1ce6c0d187787a1f92bebecb` | HEAD | HEAD | HEAD | `0df9e365a44965fc75f90429af6b984e72678db1` |
| `bridge/schema/bridge-schema.ts` | `85a7f83de82773c8832cc4d86ee30930c0c3effb` | HEAD | HEAD | HEAD | `3007ee5e13b22ffd77acad483628d0116bace49a` |
| `bridge/schema/project-studio-bridge.schema.json` | `d4ed0f8de83dfde6affa494314e0036a86f6169b` | HEAD | HEAD | HEAD | `d753895d71cdf8365562120f34f491b1d159cd84` |
| `generated/unity/StudioBridgeDtos.Generated.cs` | `1f74b28b707ee2aac42e669c6d03ac4eb192da25` | HEAD | HEAD | HEAD | `a155677b2cacc4ec0e1eb95475cc31d07a0e2310` |
| `generated/unity/project-studio-bridge.contract-manifest.json` | `2d168e788e1270d78b2905d4e61ad6fa3aca2992` | HEAD | HEAD | HEAD | `6e9ec5159a8e9e4be34b4dac4b63f3a60cb8ceea` |

## Tree

Branch `r2` in `/Users/zacheryspector/studio-scratch/1358-prod/tree`. The first delivery stays on `main` with its
tags, so both versions remain readable.

| Tag | Commit |
|---|---|
| `step1-r2` | `f070df3` |
| `step2-r2` | `fa73839` |
| `step3-r2` | `b79a912` |
| `step4-r2` | `ef9017b` |
| `red-r7` | `9ab3e16` |

## Record correction

F8 ruling 1 stands: step 1 has 39 downward `=== 44` branches, from migrateToV4 to migrateToV42, so 1358-E's "38"
undercounted. The code is unchanged by it.

## Evidence limits

No test or type gate ran. By reading, the rules are type-clean: `anchor` and `edgeId` are read, `open` is assigned
and read, and the edge loop's `a` and `b` are in scope. The rebase claims rest on the git comparisons above. The
lawful-state claims rest on reading `writeRomance`, `recordEnding` and `thirdPartyBond` at step 4. r8 is not staged
yet, so its two forged leaves and its control are read from the coordinator's description only.
