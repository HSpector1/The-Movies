# 1344-X: parent dry run of the Save42 rival-stall producer

Scratch only. Nothing under `tests/fixtures/` in the repository was written. Method (the 1314-X method):
- The parent archived HEAD f5b2ab92 (`src`, `bridge`, `generated`, `package.json`, `tsconfig.json`,
  `tsconfig.bridge.json`) into a throwaway directory.
- `tests/fixtures/p14/` there is a real, empty directory, not a link to the repository's fixtures.
- The parent copied the unmodified producer ([1344-P](1344-P-save42-rival-stall-producer.ts), sha256
  9d5dd0d3…) to its evidence path inside the scratch tree, which puts the producer's `ROOT` at the scratch root.
- The copy was committed to a local scratch repository, so the producer's HEAD check runs as written.
- It ran once with `P14_SAVE42_PRODUCER_HEAD` set to that scratch commit, through `node_modules/.bin/vite-node`.

## Result ([output](1344-X-dry-run.out.txt))

Exit 0 in 6.1 s. Both inputs were written, and the week-130 premise held.

| Input | Week | Stalled rivals (no production, two active ready screenplays) | gzip bytes | decoded bytes |
|---|---:|---|---:|---:|
| `genuine-v42-rival-stall-week-100` | 100 | none | 112,887 | 1,016,421 |
| `genuine-v42-rival-stall-week-130` | 130 | `studio-aca408ec-r01`, `studio-aca408ec-r02` | 121,262 | 1,096,270 |

This agrees with 1329-A's archived route (r01 and r02 each hold two ready screenplays with no production at week 130).
These gzip identities are rehearsal values only. The recorded run on the published HEAD mints the fixtures with its
own identities.

Review [1344-PB](1344-PB-producer-review.md) returned ACCEPT and recommended this dry run.
