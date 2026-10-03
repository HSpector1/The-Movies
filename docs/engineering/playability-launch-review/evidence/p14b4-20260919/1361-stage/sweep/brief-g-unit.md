# Brief: test author for a G unit of the Save45 test pin sweep (record 1361-N)

You edit test files only, in your unit's scratch tree, and run nothing. Your unit name (G1, G2, G3, G4a, G4b or G5) is
in the message that sent you here.

## Paths
- E = /Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919
- Your tree is /Users/zacheryspector/studio-scratch/1361-sweep/<UNIT>/tree. It is a git repo with three commits:
  - `base`, an archive of the repository's HEAD;
  - `production`, the Save45 source;
  - unit H's patch, the shared helpers, already applied.

  Edit files only inside this tree. `docs`, `node_modules`, `art` and `tools` are symlinks, and every entry in
  `tests/fixtures/` is a symlink. NEVER write through a link.
- Your outputs go under /Users/zacheryspector/studio-scratch/1361-sweep/<UNIT>/, outside the tree.

## Read first
1. **The plan,** E/1361-N-save45-pin-sweep-plan.md:
   - the sections "What Save45 moves", "Classes and edit rules", "Expected value or message per class" and "Units";
   - your unit's file table under `#### <UNIT>` (G4a and G4b: your file list is in the dispatch message);
   - "Type-error sites", "S9 sites and predictions" and "S10 and the retained rows", for your files.
2. **The parent's rulings,** E/1361-F7-parent-rulings-on-1361-N.md. They bind you:
   - S5 uses a literal `withEmptyP15Roots(state, week)` in each file. Never import production's `initialP15Roots`.
   - S7 and S10 import `stripP15` and `p15Rows` from `tests/helpers/p15-roots.ts`, read-only, and add the check
     `p15Sequence.next === 1`.
   - S9 pins the measured first guard. A must-succeed chain that refuses keeps its refusal and takes an input with no
     recorded quarter.
   - No test adds a P15 root by hand. A lift that a test ticks ends at Save45 through `convertV44ToV45`.
   - The week-93 control (`p14d1-rival-shelving:618`) takes the 1358-F12 form described in ruling 5.
   - The bare `.toThrow()` probes take a pin only where the run shows a guard other than the tampered field's.
3. **Your rows:** in E/1361-stage/sweep/1361-N-classification.json, the rows whose `unit` is yours. G4a and G4b use the
   G4 rows of their own files. Each row gives file, line, class, edit, expected and measured.
4. **Unit H's work,** already in your tree. Read /Users/zacheryspector/studio-scratch/1361-sweep/H/handback.md and
   /Users/zacheryspector/studio-scratch/1361-sweep/H/rows.json so you build on H and never redo it.
5. **The measured messages:** /Users/zacheryspector/studio-scratch/1361-m2/m2-core.txt and m2-ui.txt. They are large;
   read them with `/usr/bin/grep -n` and `/usr/bin/sed -n` only. The type-error text is in E/1361-stage/m2/m2-tsc.txt.
6. **The production law** the tests now meet is in your tree's `src/`, for example `src/core/save.ts` near
   `validateSaveV45`, `convertV44ToV45`, `P15_ROOT_KEYS` and `P15_DOWNGRADE_REFUSALS`.

## The edits
Make exactly your unit's planned edits, in your unit's files only.
- **A live pin moves 44 to 45,** and `validateSaveV44` on a live envelope becomes `validateSaveV45`, with its import.
  Keep labels.
- **A frozen or historical step keeps its era.** Never move an older era's pin.
- **Never weaken an assertion.**
  - Keep exact values, and keep refusal messages exact, citing the measured message.
  - Never turn `toThrow(/x/)` into a bare `toThrow()`.
  - Never delete a leaf or skip it.
- **Title renames (class T)** follow the plan's list exactly.
- **A "measure" line** takes its measured M2 message where M2 measured it. Where only a run can settle it, leave the
  line unchanged and list it as deferred with the reason.
- **Never touch:**
  - the P15 RED files: `tests/p15*`, `tests/helpers/p15c2-*`, `tests/helpers/p15a1-market-route.ts` and
    `tests/helpers/p15-roots.ts`;
  - unit H's 16 files;
  - another unit's files;
  - `BASE_LIVE_SAVE_VERSION`;
  - anything under tests/fixtures.

## Outputs (under /Users/zacheryspector/studio-scratch/1361-sweep/<UNIT>/)
1. **`patch.diff`:** `git -C <tree> diff HEAD -- tests ui` after your edits. It holds your unit's edits only, on top of
   H. Leave them uncommitted.
2. **The apply check.** The patch must apply on top of H at the repository's HEAD:
   ```
   GIT_INDEX_FILE=/tmp/<UNIT>-index git -C /Users/zacheryspector/The-Movies-headless-program read-tree HEAD &&
   GIT_INDEX_FILE=/tmp/<UNIT>-index git -C /Users/zacheryspector/The-Movies-headless-program apply --cached /Users/zacheryspector/studio-scratch/1361-sweep/H/patch.diff &&
   GIT_INDEX_FILE=/tmp/<UNIT>-index git -C /Users/zacheryspector/The-Movies-headless-program apply --check --cached /Users/zacheryspector/studio-scratch/1361-sweep/<UNIT>/patch.diff;
   rm -f /tmp/<UNIT>-index
   ```
   It must exit 0. Paste its output in the handback.
3. **`rows.json`:** one entry per edited line, with `file`, `line`, `old`, `new`, `class`, the classification row ids
   it serves, and the measured cause or frame.
4. **`deferred.md`:** each planned line you did not edit, with its reason.
5. **`handback.md`,** at most 80 lines, in plain active voice with no em dashes. It covers:
   - the changes per file;
   - the type sites cleared;
   - any title rename, with the old and the new identity;
   - anything in the plan you found wrong;
   - anything you are unsure of.

## Rules
- Run no node, vitest, tsc, npm, npx, tsx or vite-node.
- Use `/usr/bin/grep` and `/usr/bin/sed`, never plain `grep`: it can hang.
- Never scan docs/ recursively. Do not open tests/fixtures files or any Owner save.
- Git in the repository: only the temporary-index check above. In your tree: `diff`, `show`, `log` and `status`. Never
  commit.

Reply in under 25 lines: the files and lines changed, the type sites cleared, the deferred count, the apply check's
result, and any concern.
