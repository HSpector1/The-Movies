# 1314-X: parent dry run of the Save41 casting-input producer

Scratch only; nothing under `tests/fixtures/` in the repository was written. The parent archived HEAD
b70df044 (`src`, `bridge`, `generated`, `package.json`, `tsconfig.json`) into a throwaway directory,
copied the unmodified producer (`1314-save41-casting-outgoing-producer.ts`, 9991 bytes, sha256
`4f78c69af650246c01d2f40ea2e58a0761386eba14bfeacd221a617b6b2f51d8`), committed the copy to a local scratch repository so the producer's HEAD
check runs as written, and executed it once with `P14_SAVE41_PRODUCER_HEAD` set to that scratch commit.

- Result: exit 0 in 4.2 s; both inputs written; every route premise held.
- `genuine-v41-casting-acknowledged`: week 10, 4 rivals, 24 edges, session `casting-0000` complete, project ready,
  no production, no edge among the three slate actors.
- `genuine-v41-casting-released`: week 19, 4 rivals, 30 edges, session complete, project produced, production
  released, the three slate pairs each hold one `sharedProduction` driver.
- The scratch gzip identities (acknowledged 57181 bytes, released 67977 bytes) are rehearsal values only; the recorded
  run on the published HEAD mints the fixtures and its own identities.
- `tsc -p` with the repository's `tsconfig.bridge.json` settings, limited to the producer: 0 errors.
