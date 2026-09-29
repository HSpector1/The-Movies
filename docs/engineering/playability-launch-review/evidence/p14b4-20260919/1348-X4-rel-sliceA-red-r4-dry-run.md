# 1348-X4: parent dry run of relationship slice A RED r4 (1348-C4)

Scratch tree from HEAD 1071b25d (the 1327-C method). [1348-rel-sliceA-red-r4.patch](1348-stage/1348-rel-sliceA-red-r4.patch)
applies cleanly.

[Output](1348-X4-red-run.txt): 80 leaves, 26 fail and 54 pass, in 42.5 s. The fails are 12 in conflict evidence, 9 in
the Mentor label and 5 in relationships. Against r3 ([1348-X3](1348-X3-rel-sliceA-red-r3-dry-run.md)), one control
became RED, as the handback states.

## What 1348-C4 found

[1348-C4](1348-C4-rel-sliceA-red-lawful-roster.md) made the rival employment row lawful. The save accepts it
(`makeSave` at V42, no throw) once the row carries:
- a well-formed `contractId` (`hollywoodValidation.ts:176-177`);
- `activeEmploymentOrdinals` membership (`:201`);
- a matching receipt (`:522-523`).

The row still cannot survive a tick. The rival `staff()` surplus loop (`hollywoodTick.ts:182-195`) terminates any rival
employee outside the canonical team roles and not seated, in the same week. So no lawful state reaches the
"2 over 0" settlement with a rival roster member of that kind. The branch moved to the fallback named in 1348-X3: the
exported pure accessor `relationshipsReasonSentence(band: 0|1|2): string` in `src/core/relationships.ts`. It is a
per-leaf dynamic import that fails RED on the missing export. The "2 over 1" and "1 over 0" settlement leaves are
byte-unchanged.

This parent adopts the accessor as an API decision for slice A production. `chooseProposal` takes the relationships
reason from it, keyed by the winner's band (1348-F2).

Next: re-review 1348-D3 of the r3→r4 change.
