## Completion addendum — 1361-X7, 2026-10-03

Final input: `patch-r2.diff`. x3 completed clean at `ee289de67e453ce269c98d840a48799265c62993`. All type/generator checks pass; core has exactly the baseline plus the declared 45 and seven supervisor environment failures, UI has no failures, and d16 matches its base 12 exactly. All revised S9 leaves and the writer future-announcement S8 pin pass. Guard observations cover the bare sites and loose historical chains. The 15 existing P14B.1 terminal-premise failures do not reach mutants. Twenty-six workflow-carrier observations reach existing V14 history first; this is disclosed masking, not new P15 masking or isolated workflow coverage.

The author-time pending statements below are historical and are superseded by 1361-X7 and the preserved x2 guard observations. No unresolved Save45 sweep failure remains; existing premise/masking limits remain disclosed. Independent final approval and recorded landing gates are separate requirements.

---

# Unit G4a handback (1361-N)

I edited the 12 files in the dispatch and no others. `patch.diff` is `git diff HEAD -- tests ui` on top of H: 12 files, +138 and -80 lines, uncommitted in the tree. I ran no node, vitest, tsc, npm, npx, tsx or vite-node.

## Apply check

    GIT_INDEX_FILE=/tmp/G4a-index git -C <repo> read-tree HEAD && GIT_INDEX_FILE=/tmp/G4a-index git -C <repo> apply --cached <H>/patch.diff && GIT_INDEX_FILE=/tmp/G4a-index git -C <repo> apply --check --cached <G4a>/patch.diff; rm -f /tmp/G4a-index
    exit 0, no output

Checks that need no run: `git diff HEAD --check` is clean, the added lines hold no non-ASCII character, every changed code line keeps its bracket balance (the 8 chain lines gain one balanced call each), and all 12 files are regular files with one link.

## Counts

The plan lists 75 edit lines for these files. I edited 69 code lines and added 13 comment blocks (`rows.json` holds 82 entries). I left 6 planned lines unedited (`deferred.md` section A). I inserted `convertV45ToV44` at 5 chains without pinning their first guard, because no run shows it (section B1).

## What changed

- `contracts/v14-boundary-guards`: `convertV45ToV44` joins the import (:34) and leads `historicalWorkflowCarrier` (:63). The sentinel moves to 46, with its pattern, and the S3 comment gains a 1361-N line (:322). The 4 loose `/cannot downgrade/` pins stay.
- `p06a-w1-release-authority`: import and chain take `convertV45ToV44` (:32, :406). `validateSaveV44` becomes `validateSaveV45` at the import and at :459 and :465, patterns kept.
- `p12-starting-world`: import and chain (:2, :55). The pinned `makeSaveV18` refusal is unchanged.
- `p13b-s8-save-v27`: :187 pins 45. :194 and :206 pin `/^migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter$/`, and both comments take the S9 form with the candidate's lines (`save.ts:10992`, :10895, :10849, :8986-8997, :8874, :8889). The sentinel moves to 46 and its range pattern to `/versions 1 through 45 only/` (:235, :236). Title renamed (below).
- `p14b1-t4-regressions`: import and 4 calls move to `validateSaveV45` (:12, :84, :86, :166, :306). :86 stays a bare `.toThrow()`.
- `p14c2b-save-v36`: import, :129 and the 4 tamper calls (:137, :146, :158, :171) move to V45. :177 and :183 pin 45. :83 and :98 keep their pins and gain a pending note.
- `p14c2rm-writer-continuation`: `convertV45ToV44` joins the import and leads the chain at :287 (pin kept, pending note). The import and 8 calls move to V45 (:13, :81, :236, :252, :263, :264, :311, :313, :379). :379 stays bare.
- `p14c3-canonical-rival-history`: import and 4 calls move to V45 (:10, :233, :245, :255, :256).
- `p14c3-cohort-transition`: import takes `convertV45ToV44` and `validateSaveV45`. :273, :278 and :280 rename. :288 gets the insert (pin kept, pending note).
- `p14c3-dual-extensions` (:8, :180) and `p14c3-offmenu-extensions` (:10, :237): import and insert, pin kept, pending note.
- `p14c3-profession-history`: :119 gets the insert (pin kept, pending note). 15 `save.validateSaveV44(` calls on 14 lines become `save.validateSaveV45(`.

The comment form: the 3 must-succeed chains (`v14` :63, `p06a` :406, `p12` :55) say why `convertV45ToV44` passes. The 7 chains whose first guard is still open (the 5 inserts and the 2 `liveEnvelopeV36` leaves in `p14c2b-save-v36`) carry a pending note. It names the P15 message and its lines, the predicted route, and the test that covers the masked guard on its own era's input, and it says the pin is unmeasured. Each follow-up pin replaces its note.

## Type sites cleared (9 sites, all in the root gate)

| Site | Code | Edit |
|---|---|---|
| `v14-boundary-guards(63,132)` | TS2345 | import and chain |
| `p06a(406,136)` | TS2345 | import and chain |
| `p12-starting-world(55,92)` | TS2345 | import and chain |
| `p14b1-t4-regressions(168,33)` | TS2379 | rename at :166 |
| `p14c2rm-writer-continuation(287,146)` | TS2345 | import and chain |
| `p14c3-cohort-transition(288,130)` | TS2345 | import and chain |
| `p14c3-dual-extensions(180,130)` | TS2345 | import and chain |
| `p14c3-offmenu-extensions(237,130)` | TS2345 | import and chain |
| `p14c3-profession-history(119,165)` | TS2345 | chain (namespace import) |

## Title rename (1)

Old: `tests/p13b-s8-save-v27.test.ts > P13B-S8 Save V27: genuine V26 fixtures, honest lift, conditional downgrade, validator refusals, sentinel 28 (test 7) > an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (B4 additive reader boundary; stale numbers corrected post-C.2b)`
New: the same path and describe, then `an unknown saveVersion 46 is refused, naming the handled range "1 through 45 only" (B4 additive reader boundary; stale numbers corrected post-C.2b)`.

## Where the plan is off

- The plan marks 5 chains "unknown" (`p14c2rm` :287, `p14c3` cohort, dual, off-menu, profession-history). The fixture routes cross a quarter week after the Save45 migration in all five (weeks 13 to 312, 2613 to 3276, 104 to 468, 104 to 403, and 208). I expect the P15 message at each, but I did not pin it.
- The plan treats `p13b-s8-save-v27:194` as a separate measure line. Both leaves build the identical `natural`, so M2's :206 message covers it, and the plan's row 295 says ":194 takes the same form". I pinned it and flag it for P4.
- The `p12` S9 comment still cites Save44's `save.ts` lines (6191, 6194). I left it, per "comments that cite moved lines stay".

## What I am unsure of

- The pending notes predict a P15 refusal that no run has shown. If P4 shows the romance or shelving guard, the notes need removal or rewording.
- `p14c2b-save-v36` :83 and :98 wait for P4 although the route (week 52 to 92 and 98) makes the P15 refusal near certain.
- The S8 renames assume `validateSaveV45` forwards the stripped state to the V44 chain unchanged (`save.ts:10970`). None of the 17 patterns names an envelope label, and :264 pins "validateSaveV12: save has unknown field", which V45's own `v12ExactKeys` call emits with the same text.
- The comment cites `tests/p14b10-save-v44.test.ts:356` and `tests/p14d1-rival-shelving-save-v43.test.ts:226` by HEAD line. G3 owns both files and could shift the lines.

## Disclosures

- I used python3 to read the classification JSON, to replace text in 6 test files (each replacement asserted to match exactly once) and to write `rows.json`. The script is `g4a_rows.py` in the session scratchpad.
- I listed `/Users/zacheryspector/studio-scratch/1361-sweep/x1` and checked `ps` to see whether x1 ran. I opened none of x1's output. I read the M2 logs with `grep -n` and `sed -n` only.
- I opened no file under `tests/fixtures` and no Owner save. I read helpers, other tests and `src/` inside my tree, and ran `stat` and one `grep -c` on two repository test files to confirm no hard link to the repository.
- Git in my tree: `diff`, `status`. Git in the repository: the temporary-index check only.
