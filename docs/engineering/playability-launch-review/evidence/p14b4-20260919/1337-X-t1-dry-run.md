# 1337-X: scratch dry run of the staged timing-budget repair T1

Scratch tree: an archive of HEAD fca1f700 (the author's base; `src`, `bridge`, `ui`, `generated`, `scripts`, configs,
`AUDIO-PROVENANCE.md`, `tests/` without fixture payloads), with `tests/fixtures`, `docs`, `node_modules`, `art` and
`tools` linked read-only. The tree then takes [1337-t1.patch](1337-stage/1337-t1.patch): 2 files, 2,391 bytes,
sha256 dc06e85c…, applies cleanly, 13 insertions and 2 deletions. The patch also applies to HEAD 2ef221fa in a
temporary index.

- Type gates: root and UI `tsc --noEmit` exit 0.
- `tests/bridge-p14p3-directing-promises.test.ts` whole: 3 of 3 pass. D15 62,016 ms, D16 49,075 ms, D17 38,392 ms,
  inside the new 300,000 ms `TIMEOUT` ([run](1337-X-core-run.txt)).
- `ui/src/lot/livingTurn.parity.test.tsx` whole: 7 of 7 pass. "(a) by hand at the seam" takes 3,521 ms
  ([run](1337-X-ui-run.txt)).
- The full core and UI projects were not re-run here. The recorded gates after application run both, and they are
  the confirmation 1337-B asks for.

Run by themselves, the three P3 Bridge leaves take 38-62 s. In the 1333 gate they took 117-139 s. Load roughly doubles
them, which the 300,000 ms budget covers.

Next: independent review 1337-D, then application (1337-E) and the recorded core and UI gates.
