# 1348-X3: parent dry run of relationship slice A RED r3 (1348-C3), and one requested change

Scratch tree from HEAD 7d61f56e (the 1327-C method). The run applies
[1348-rel-sliceA-red-r3.patch](1348-stage/1348-rel-sliceA-red-r3.patch), sha256 d81f0305…, cleanly and changes three
test files (813 insertions, 2 deletions).

## Result ([output](1348-X3-red-run.txt))

80 leaves: 25 fail and 55 pass. The failing leaves are 12 in conflict evidence, 9 in the Mentor label and 4 in
relationships, counted per `FAIL` header. The 80 are the 36 classified leaves plus 44 unchanged leaves of
`p14b5-relationships.test.ts`, and the count agrees with the handback's classification (25 fails, 11 control-passes).

## Requested change (revision 1348-C4)

The new control "2 over 0" gives rival r01 a roster member by splicing a raw `IndustryEmployment` row into
`hollywood.employment` and leaving it out of `activeEmploymentOrdinals`. The save validator rejects exactly that state:
`hollywoodValidation.ts:201` requires ordinal membership to equal `endedWeek === null && endWeekExclusive > tick` for
every row. The handback states that the leaf's state would fail `stage()` and does not re-validate it.

A reason test that stands on a state the game cannot reach shows only what the settlement code does with invalid
input. The rule "no fake data" applies to fixtures too. Revision 1348-C4 therefore:
- makes the row lawful: listed in `activeEmploymentOrdinals`, with contract terms and exclusivity that the rival may
  hold. The leaf asserts that the full validator accepts the staged state before it ticks;
- keeps the same three branch sentences and the same RED status: two controls pass, and "1 over 0" fails;
- if no lawful construction exists (for example because an invariant forbids a rival employing that person), reports
  that as a finding with the blocking check's file and line. In that case the branch moves to an exported pure accessor
  `relationshipsReasonSentence(band)`, the handback's own fallback, and the leaf goes RED on the missing export.

The other 35 leaves stand as reviewed in [1348-D2](1348-D2-rel-sliceA-red-r2-review.md) plus C3's copy test.
