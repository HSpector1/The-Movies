# Unit G5 handback (1361-N)

I edited 25 of the 26 files in the G5 table and no others. `patch.diff` is `git diff HEAD -- tests ui`: 800 lines, +85 and -85, uncommitted in the tree. Every edit renames `validateSaveV44` to `validateSaveV45` or `toBe(44)` to `toBe(45)`. A script compared all 85 old and new lines and found no other difference. I ran no node, vitest, tsc, npm, npx, tsx or vite-node.

## Apply check

    GIT_INDEX_FILE=/tmp/G5-index git -C <repo> read-tree HEAD && ... apply --cached <H>/patch.diff && ... apply --check --cached <G5>/patch.diff; rm -f /tmp/G5-index
    exit 0, no output

`git diff HEAD --check` is clean. All 25 edited files are regular files, so no write went through a link. No added line gains a non-ASCII character.

## What changed (HEAD line numbers; none moved)

Of the 87 planned lines I edited 85: 52 S1, 10 S2 and 23 S8.

- `c2a-m2-sets-save`: :32 (import), :52, :172, :182, :191, :200, :232, :251, :281, :291, :297.
- `cash-ledger-checkpoint-v11`: :48 (import), :225, :235, :287, :364, :461, :467, :473, :479.
- `construction-core`: :19 (import), :497, :505, :566, :664.
- `contracts/cross-owner-refusal`: :24 (import), :72, :100, :118.
- `contracts/phase-table-agreement`: :28 (import), :104, :224, :230, :246, :266.
- `contracts/studio-events`: :129, the by-name lookup `'validateSaveV45'`.
- `legacy-parcel-ground`: :49 (import), :365, :376, :404.
- `p08a-w0-studio-history`: :53 (import), :441, :450, :459, :465, :477.
- `p13a-technology-milestones`: :6 (import), :74, :79, :82.
- `p14b1-first-take` :294. `p14b1-promises` :503. `p14b2-setup-wrap-regressions` :7, :27.
- `p14b3-reservations`: :12 (import), :94, :134, :177, :201.
- `p14b4-cancel-causal-proof` :271 (toBe 45). `p14b4-cast-class-outcomes`: :20 (import), :79 (toBe 45), :355.
- `p14b4-material-evidence-core`: :17 (import), :40 (the `EnvelopeV33` alias), :109, :362.
- `p14b5-t-failure-tuning`: :57 (import), :413, :438.
- Eight p14p4p5 pins, one `admitted` line each that holds both `toBe(44)` and `validateSaveV44(`, so it takes both edits: finishing-material :64, grouped-witness :70, post-capacity :71, receipt-freeze :65, retired-acting :47, soundstage-capacity :55, stock-subject :66, writer-resources :50. Seven of them also rename a second call (finishing-material :65, grouped-witness :71, post-capacity :72, receipt-freeze :361, retired-acting :48, soundstage-capacity :56, stock-subject :67).
- `v14-migration.contract`: no edit (deferred :244).

Every S8 rename keeps its pattern. `validateRelationshipsRoot(..., 44)` in `p14b5-t-failure-tuning` (:117, :123, :433, :489) stays: it names an era, not the live writer.

## Type sites cleared (9 sites, all root gate)

- `p14b1-first-take (301,36)` TS2379: :294.
- `p14b3-reservations (96,17)` TS2379: :94.
- `p14b4-material-evidence-core`: (147,44) by the alias and :109; (293,9) TS2322, (294,7) TS2375, (409,27) and (439,65) by the alias; (364,37) by the alias and :362.
- `p14p4p5-receipt-freeze (363,17)` TS2379: :361.

## Title renames

None. No G5 file appears in the plan's T list.

## Where the plan is off

- The G5 header counts 87 edit lines. Two, `cash-ledger-checkpoint-v11:381` and `v14-migration.contract:244`, are S9 lines the plan itself predicts need no edit. I deferred both, so the planned edit count is 85.
- The census marks `c2a-m2-sets-save:200` S1 certain, but it ends the same refusal block as :182 and :191 (S8) with `toThrow(/no scenery crew|both stand on/)`. The rename is identical. P5 should print it with the other two.
- The 12 `p14b2-setup-wrap-regressions` rows and the 25 `v14-migration.contract` rows belong to H (throwing sites `helpers/p14b2-fixtures.ts:122` and `contracts/_v14Contract.ts:528`). My :7 and :27 in the first file are the V44 references those leaves meet after H. The second file needs no G5 edit.

## What I am unsure of

- The 23 S8 renames. M2 shows only the version refusal for seven of them and nothing for sixteen. `deferred.md` section B lists the guard the plan expects at each line. P5 must print every thrown message.
- The two deferred S9 lines. By reading `save.ts` I found no route for the P15 refusal to reach either one (frozen builders strip empty roots at :6197-6200, and the V11 projection copies no root). Only P4 confirms it. At `v14-migration.contract:244` the regex `/cannot downgrade/` also matches the P15 message, so P4 must print the message per cell.
- `contracts/studio-events:221` holds a bare `.toThrow()` on `validateAtOwningBoundary`. For kind `releaseCommitted` that call now reaches `validateSaveV45`. At HEAD it passes on the version refusal alone. It is not one of the three sites of ruling 9, so I left it bare. P5 should print its message for the forbidden-key cases.
- I added no comment line. `c2a-m2-sets-save:231` and :290 still read "1358-N S1: Save44 ... name validateSaveV44" above calls that now name V45. H appended 1361-N comments in its files. I followed the brief's "exactly the planned edits". Say so if you want a 1361-N line there.

## Disclosures

- python3 read the classification JSON, wrote `rows.json` (script `g5_rows.py` in the session scratchpad, not in the tree) and checked the 85 pairs. `rows.json` holds 85 entries. All 97 G5 rows (88 core, 9 type) tie to an edit through `rowIds` or `behindRowIds`.
- I read `src/core/save.ts` in my tree to ground the S8 and S9 predictions. I read the M2 logs with `/usr/bin/grep -n` only.
- Git in my tree: `diff`, `status` and one `log`. In the repository: the temporary-index check only.
- I opened no fixture and no Owner save.
