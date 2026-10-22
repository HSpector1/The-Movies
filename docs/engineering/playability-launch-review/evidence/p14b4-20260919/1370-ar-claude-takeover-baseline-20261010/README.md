# 1370-AR: core test baseline on the Claude takeover HEAD

Parent: Claude (Fable 5.1), 2026-10-10. Purpose: a complete `core` project run on the unchanged source tree so every later landing (R8, 1364/1365, P15B, P16, P17, P18) can attribute each failing test as SAME, NEW, GONE or CHANGED against an exact predecessor. This is a parent measurement, not a recorded heavy-lane run: no lane lock, no recorder, no source guards.

## Identity

| Item | Value |
| --- | --- |
| HEAD | `6510c971bed8079f7ca02e528b224988de092c87` |
| `HEAD:src` | `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554` |
| Command | `nice -n 15 npx vitest run --project core --reporter=json --outputFile=core-6510c971.json` in `/Users/zacheryspector/The-Movies-headless-program` |
| Node | v22.23.2 (the parent shell's nvm default). The recorded lanes and the R8 gate chain pin v20.20.2 via `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin`; this run did not. Treat Node-version-sensitive differences as environment, not source. |
| vitest | 2.1.9, three workers |
| Start / end (UTC) | 2026-10-10T20:20:32Z / 2026-10-10T22:34:15Z (2 h 13 min 43 s) |
| Exit | 1 (failures present, as expected) |

## Result

| Metric | Count |
| --- | --- |
| Test suites | 1,819 (85 with failures) |
| Tests | 5,412 |
| Passed | 5,239 |
| Failed | 159 |
| Skipped | 3 |
| Todo | 11 |

The raw vitest JSON report (SHA-256 `e649068befaccd7910520790810e408a6ec0ac902b07d72a35f1fdf85a820f06`, 2,621,214 bytes) is preserved once, by the Codex review, at `../1370-as-claude-review-and-draft-backup/reviews/r8-results/predecessor/core-6510c971.json`; this package does not duplicate it. `core-6510c971-failures.txt` here (SHA-256 `ad7cf800c76fadc6b32ab211a2e1bbe00ba13b6be094b61818022e4b09465ddf`) lists the 159 failing assertions as `file :: full test name`, sorted by file, derived from that JSON.

Largest failing files: `p15a1-market-integration.test.ts` 40 (the declared held P15A.1(c) market failures scheduled under 1365), `p14b4-rival-seating-preference.test.ts` 17, `p14b1-t4-regressions.test.ts` 15, `bridge-p12-campaign-library.test.ts` 11, `p14b4-cast-class-outcomes.test.ts` 9, `bridge-p14b2-trust.test.ts` 8, `p14d2-binding-cash.test.ts` 6, `bridge-p14b5-relationships.test.ts` 5.

## Claim limits

The run shared a 4-CPU / 8 GB machine with six concurrent implementation specialists (load average 18 to 27); vitest used three workers at reduced priority. Timing-sensitive tests (supervisor, Save As, stale-schedule takes) may therefore fail here and pass in isolation, as 1361-M3 already observed for the recorded Save45 gate. The recorded Save45 broad gate (1361-M3, at `2eaa697e`, 133 core failures) is not the same tree: 56 files under src/tests changed between it and this HEAD, which is why this fresh measurement was taken. Compare identities (file plus full name), not counts.
