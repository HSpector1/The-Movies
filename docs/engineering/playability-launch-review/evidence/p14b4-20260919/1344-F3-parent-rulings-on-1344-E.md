# 1344-F3: parent rulings on the shelving production handback (1344-E), and the week-93 input

[1344-E](1344-E-shelving-production-handback.md) returned PARTIAL. The five-step production passes 44 of the 51 RED r2
leaves, and the writer edited no test. The parent's dry run reproduces exactly that: 7 fail and 44 pass in 55.1 s, the
same seven leaves ([output](1344-X4-red-r2-over-step5.txt), step 5 sha256 567ccec3…).

## Checks by the parent

- **Chart output counts authored films.** `hollywoodValidation.ts:600-602` counts a rival's films with provenance
  `authored-start/v1` plus released live films. Correction 7 holds: r01's output is 12 (10 produced, 2 authored).
- **`staff()` runs before `decide()` in one pass** (`hollywoodTick.ts:362-369`). Ending an actor's employment alone
  does not block a week, because `staff()` re-hires before `decide()` reads the roster. Corrections 2 and 3 hold.
- **The genesis route shelves in the tick after week 93.** r01's `script-0006` gathers 13 evaluated economic
  rejections at weeks 57-60, 69-72, 81-84 and 93, with production weeks between, which leave the count unchanged.
  That follows 1344-A §3.1, and it frees the slot 17 weeks before the stall 1329-A dated at about week 110. The
  shelving law does what D-1329-1 asks, earlier than the stall. The §7 verification attributes every natural-route
  movement at or after week 93.

## Rulings on the seven corrections (RED r3, test-author revision 1344-C3)

1. Stalled route: match receipts by studio and screenplay id. Screenplay ids repeat across studios.
2. and 3. Staffing-blocked weeks: construct an unseatable week that survives `staff()`. The writer's construction, r01
   cash at reserve + 1 so the re-hire fails, is acceptable if the revision shows it through the real tick. Cash then
   blocks the hire, not the package, so the counts stay unchanged for a staffing reason.
4. The viable control (1344-F Amendment 2): compare at week 93 against a new genuine input minted at the last Save42
   writer. The route runs from genesis to week 93 on the candidate, with `screenplayShelving` deleted from every
   business. The migrated genuine week-93 input, with the same deletion, must match byte for byte, with identical
   receipts. The leaf also asserts its own premise from the candidate's receipts: the first `screenplayShelved` receipt
   falls after week 93. It never hard-codes a shelving week.
5. Promise guard: count only r01's named screenplay. Other screenplays lawfully shelve that week.
6. Opportunity paths: shelve the screenplay with the file's `markShelved` helper before asking. The helper builds a
   validator-lawful state (1344-D2 §5).
7. Chart output: expected output = produced films + authored films, as the validator defines it.

Every corrected leaf keeps its assertion strength. The revision derives each expected value from receipts or from
source, and it confirms each leaf fails RED on unchanged HEAD for the right reason.

## The new genuine input

- The producer is [1344-P2](1344-P2-save42-week93-producer.ts): 1344-P with the week list, the output directory and
  the record fields changed, and nothing else. `diff` against 1344-P shows only those lines.
- Scratch dry run ([output](1344-X4-p2-producer-dry-run.out.txt)): real directories, exit 0 in 11 s. At week 93 r01
  holds `script-0006` ready with no production.
- The recorded mint at e62c944f, the published HEAD and still the last Save42 writer ([txt](1344-save42-week93-mint.txt),
  [json](1344-save42-week93-mint.json), pre/postflight): exit 0, `fixedSource` true, `allGuardsExact` true. The gzip
  sha256 is 14c41c2c…, identical to the dry run.
- The fixtures are in `tests/fixtures/p14/genuine-v42-pre-shelving-week93/`, with a MANIFEST and provenance.

The re-review of r3 (1344-D3) also covers the producer change.
