# 1335-X: scratch dry run of the staged UI repair U1 (revision 2)

Scratch tree: an archive of HEAD 995f0fd1 (`src`, `bridge`, `ui`, `generated`, `scripts`, configs,
`AUDIO-PROVENANCE.md`, `tests/` without fixture payloads), with `tests/fixtures`, `docs`, `node_modules`, `art` and
`tools` linked read-only. Nothing outside `docs/` changed between the author's base 100000e3 and 995f0fd1. The tree
then takes [1335-ui-u1-r2.patch](1335-stage/1335-ui-u1-r2.patch): 6 UI test files, 8,330 bytes, sha256 3466694d…,
applies cleanly, 32 insertions and 12 deletions.

- UI type gate: `tsc --noEmit -p ui/tsconfig.json` exit 0.
- Whole UI project: **10 failed, 2682 passed, 5 skipped** (2697), 2 failed files
  ([extract](1335-X-ui-extract.txt), [rows](1335-X-ui-rows.json), parsed by the archived `1317-I-attribution.py`
  unchanged).
- The ten failing identities are the C3 (6) and C4 (4) rows, `python3 -c` failing without `PIL`: RETAINED-SAME
  against 1303 and present in 1331 and 1334. No other identity fails.
- Against [1334](1334-I-broad-ui-attribution.md) (26): **16 gone, 0 new**. Against [1331](1331-I-broad-ui-attribution.md)
  (34): **24 gone, 0 new**.
  - Gone against 1331: C5 (2), C2 (7), C1 (7), `livingTurn.scheduler`'s five cascade leaves, the Casting Review first
    leaf, C6 "routes canvas intent …" (not edited; it passes with its predecessor inside budget, as 1335-A cause 4
    read it) and `StudioLotScreen:930` (not edited; intermittent).
- The six touched files pass whole: NextEvent 36/36, Authority 15/15, World Inspector 28/28, Casting Review 10/10,
  the P05A W2 contract 13/13, `livingTurn.scheduler` 13/13.
- Under full-project load the budgets carry real time: the World Inspector sweep took 13,575 ms and
  `livingTurn.scheduler` "auto-pauses …" 5,773 ms, both above the 5,000 ms default and inside 30,000 ms.
- The NextEvent leaf "preserves the exact live-world reaction after a rejected import or declined restart" (1124-A,
  not in U1) passed in this run.
- Core: not run. The patch touches `ui/**` test files only; the core project includes `tests/**` only.

## Points for the independent review

1. Every edited leaf's assertions are unchanged: the diff adds only a trailing `30_000` argument, a `{ timeout: 10_000 }`
   option on three mount-helper waits, and `migrateToLive(...)` around two `loadSave` reads, with their comments.
2. C6 and `StudioLotScreen:930` pass without edits. A single run does not prove the timing reading for either. The
   recorded gate is one more observation.
3. After U1 the UI gate is expected to fail only the ten `PIL` rows (environment), plus the known intermittent 1124-A
   leaf if it fails again.

Next: independent review 1335-D, then application (1335-E) and the recorded UI gate.
