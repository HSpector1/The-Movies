# 1358-F: parent rulings on the slice B RED handback (1358-C)

[1358-C](1358-C-rel-sliceB-red-handback.md) returned PARTIAL. It stages 81 leaves over the slice A candidate. 69 are
measured RED or controls. 12 romance growth, formation and ending leaves were not executed under the parent's
machine-load hold, and one migration leaf waits for the genuine V43 fixture. The author named one disputed reading and
two API seams without choosing. The parent rules on each.

## 1. The disputed reading: Reading B

1347-F's adopted note says growth and formation both require Friends or above and "no open bond for either person with
anyone". The question is whether a pair's own bond blocks its own growth.

**Ruling: Reading B. "Anyone" excludes the pair's own partner.** An already-partnered pair keeps growing under the
same drivers, up to the 0-100 bound. Evidence: 1347-A §3 prices the bond's lifetime as "a bond at 75 ends about 229
weeks after the last shared picture; a bond at 100 ends after about 263". A bond can only reach 100 if growth
continues after formation at 75. The note's purpose, from 1347-B, is to stop a person with an open bond from building
romance with a third party. It was not written to freeze a couple.

RED r2 adds `romance-partnered-pair-keeps-growing`: after formation, a shared success raises the pair's value, capped
at 100. A third party's open bond still blocks, as the staged leaf asserts.

## 2. The write seam

Growth, formation and the recorded ending run in `advanceRelationshipsWeek(state, delta, week)`
(`relationships.ts:310`). That is the existing tick seam, which already reads the week's takes and releases (1347-A
§2.3 "at the tick seam, from the week's changes only"). The 12 leaves keep their target.

## 3. The drift-exemption read site

`currentCloseness` takes a strict `Pick<RelationshipEdge, 'closeness' | 'lastEventWeek' | 'romance'>`. It holds
closeness while `romanceStatus(edge, week) === 'partners'`, and after the ending counts dormancy from
`max(lastEventWeek, endedWeek)`. The field is required, not optional, following slice A's strict
`sharedCompetitions` (1348-F4 item 2): a caller that omits it fails to compile rather than quietly drifting. Callers
that build partial edges gain `romance: null`, a type-only edit, in the slice B sweep. `currentTier` widens its `Pick`
the same way.

## 4. The findings

- **F1 and F2 are Save43 fallout, not slice B defects.** The 19 root type errors and
  `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17` (`toBe(42)`) belong to the Save43 pin sweep (1344), classes
  S1/S2. The sweep plan names them. Slice A's `tests/p14b10-mentor-label.test.ts` depends on the same helper, and the
  parent's slice A dry run (1348-X5) will show it.
- **F3.** Accepted as fixed.
- **F4.** The 12 leaves run in the parent's dry run 1358-X after the measurement. Any leaf that fails for a reason
  other than the missing API goes back to the author with r2.
- **Stray links.** The three untracked self-links the author reported (`art/art`, `docs/docs`,
  `tests/fixtures/fixtures`) were five: `node_modules/node_modules` and `tools/tools` too, all created at 04:16:20.
  A second plain `ln -s` through an existing scratch link wrote them into the real repo. The parent removes them by
  literal path after the measurement's postflight. Scratch briefs now use `ln -sfn`.

## 5. The genuine V43 input

`1358-stage/1358-P-save43-producer.ts` runs as a recorded mint after the measurement, at the last Save43 writer (HEAD
before any Save44 production), into `tests/fixtures/p14/genuine-v43-pre-romance/`, with sha256 provenance.

## Next

1358-X: parent dry run of the r1 RED, the 12 held leaves included, plus the producer's dry run in a scratch tree
without symlinked roots. Then RED r2 from the author with §1-§3 and any dry-run fixes. Then review 1358-D.
