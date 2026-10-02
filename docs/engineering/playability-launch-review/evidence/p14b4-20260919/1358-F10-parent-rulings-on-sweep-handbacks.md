# 1358-F10: parent rulings on the 1358-N sweep handbacks (revision r1)

The seven authors (H, G1 to G6) edited the census's certain rows without running anything. The parent merged their
branches as revision r1 in the scratch worktree `/Users/zacheryspector/studio-scratch/1358-sweep/merge`: 154 test files, +674/-599
with G1's N-0122 follow-up. G6's S5 draft commit is left out. These rulings settle the handbacks' questions. They also
amend [1358-F9](1358-F9-parent-rulings-on-1358-N-draft.md) ruling 1, where measurement showed it wrong.

| Group | Edited | Deferred | Patch sha256 |
|---|---:|---:|---|
| H | 58 | 7 | 8b2e33e6… |
| G1 | 83 objects (84 census rows) | 10 | 9b4104a6… (after N-0122) |
| G2 | 57 | 2 (P4) | 5dd89ed6… |
| G3 | 103 | 8 | from d698d97 |
| G4 | 120 | 4, plus 4 new observations | e4af1e3e… |
| G5 | 115 (109 certain, 2 read, 4 new) | 29 | from 35f6319 |
| G6 | 101 | 8 | from 2eaee24 (draft 49bafc6 apart) |

## Rulings

1. **S5 rows: the sweep dry run decides them, not M2. This amends F9 ruling 1.** In M2's unswept tree almost every S5
   leaf stops at an earlier version or projection pin. G3's 8 rows, H's N-0041, G5's N-0528 and N-0547, and G6's
   N-0656 are examples.
   - M2 did decide four: the p14p4p5 comparisons in `casting-reservation`, `delayed-retirement`,
     `queued-project-outcome` and `scenery-capacity` differ by exactly the two empty fields on all 24 edges
     ([1358-M2](1358-M2-rel-sliceB-fallout-measurement.md)). G6's per-file helpers land for those four.
   - The first dry run (1358-X6) runs without any S5 helper. A comparison that then fails with only the two new edge
     fields gets the per-file helper in the follow-up. G3's `s5-draft.patch` and G6's draft are the starting points.
2. **S8 covers every renamed live-validator call under a bare `.toThrow()`.** 1358-N's own S1 rule says so. The rows
   are H-new-1 (`p14c3-save-v38:116`), G6-new-4 (`p14b1-t4-regressions:86`), G6-new-5
   (`contracts/studio-events:221`), G5-new-7 (`p14c2rm-writer-continuation:345`) and the four finding-17 leaves.
   - The message probe in 1358-X6 measures each case's message (the 1344-X12 method).
   - The follow-up unit then pins each measured message with its `src` line.
3. **Loose-regex sites already masked under Save43 get no edit.** They become closure findings, as 1344 handled them.
   - The sites: G4-new-1 to G4-new-4 (`p13b-s8-save-v27` :188 and :195, `p14c2b-save-v36` :74 and :82) and G1-new-1
     (`p14c2s-scientist-retirement` :279-280).
   - Exception: if the probe shows Save44 newly masking one of these sites, or a failure appears, the site takes the
     S9 form.
4. **S9 sites behind test-side chains** (`p14p3-directing-promises` :361, :438 and :689, the p14c3 chain leaves, and
   the others in the probe) take the S9 form only if the probe shows `convertV44ToV43` firing first.
   - The S9 form: the expected message names the measured first guard, and a comment names the test that still covers
     the older guard on its own era's input.
   - When the covering test named by a 1344 masking comment is itself masked, the follow-up adds direct coverage on that
     era's input. That covering test is `p14p4p5-screenplay-status:324` for V39 and `p14c3-transitions:207` for V37.
5. **`p14b9-save-v42`, 1358-F9 ruling 3's second assertion: option (a).** The leaf stages `sharedCompetitions: 1` on
   one edge of a copy of the pre-lift V42 state. It pins `/^migrateToV41: cannot downgrade or discard a casting
   competition$/` (`src/core/relationships.ts:849`; caller `'migrateToV41'` at `src/core/save.ts:10696`). A comment
   says that no pre-Save44 engine remains to write the counter. Nothing is stripped.
6. **Census rows dropped:**
   - N-0454 and N-0455 (`p08a-w0-studio-history:398-399`): `live` there is a V18 envelope.
   - The local `Edge` type at `bridge-p14b6-e714:82` gets no edit, because it neither builds nor compares edges.
   - Other corrections are recorded in the handbacks and stand: N-0024's text, N-0007's caller count, N-0238's reasoning
     and N-0118's cause.
7. **Labels and wording:**
   - G2-new-1 (`bridge-runtime-checkpoint:439`, V43 to V44 in a guard-message regex) stays S2. The Save43 sweep called
     the same line S8; only the label differs.
   - The prior55 describe title "current56" (`bridge-p14r2r3-prior55:146`) stays, as 1309-E left "current55".
   - G4 renamed stale sentinel titles whose bodies move. F9 ruling 5 governs, so the renames stand.
   - G6's three added comment lines stay.
   - Stale line citations in comments stay as written.
8. **`p12-starting-world:55`** keeps G5's exact pin of `makeSaveV18`'s entrant-authority refusal
   (`professionHistory.ts:67`), read from source. The V19 Hollywood guard there has been masked since V38. That
   predates Save44 and sits outside the sweep.
9. **`p14d1-rival-shelving` week-93 control** (census :561, assertion :604). Before any edit, a probe counts the log
   rows and romance tracks in the candidate's week-93 state. If both are zero, the comparison takes the S5 helper. If
   either is non-zero, the leaf returns to the parent, because F9 ruling 2 forbids stripping them.
10. **The partial-clone side effect** (G2): a `git log -S` in the repository fetched blobs and set off `gc --auto`. HEAD,
    the index and the tree did not change; there are 34 packs and no garbage. Later agents are told not to run history
    searches in the repository.

## Next

1. 1358-X6 (running) measures r1: type gates, generators, slice B files, the message probe, core and UI.
2. The follow-up units take, from X6 and the probe:
   - the S5 helpers;
   - the S8 pins;
   - the S9 forms;
   - the week-93 control.
3. A confirming dry run, then the review, then the landing (1358-L).
