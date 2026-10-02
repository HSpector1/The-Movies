# 1358-N F1 handback: S9 forms, own-era cover, S5 helpers and the 1358-F11 capture feeds

Unit F1 turned the 1358-X6 message probe into test edits for five files. After dry run 1358-X7t, it applied the three
1358-F11 rulings. I ran no node, vitest, tsc, tsx, vite-node or npm process, and no history search in the repo. I read
no file under `tests/fixtures` and listed none of its directories. This round I read three files in E by exact path:
`1221-p4p5-outgoing-capture/MANIFEST.json` (with `cat`), and the captures `director-bound-week52.json.gz` and
`director-waived-week61.json.gz` (Python gunzip and JSON, read-only). `tests/helpers/p14p3-fixtures.ts` is unchanged.
The new loader imports its existing `sha` export.

- **Branch `sweep-f1`:** 492e2f0, two commits on sweep-x6 8144c0c. d20c170 is round 1 and 492e2f0 is 1358-F11.
  `patch.diff` = `git diff sweep-x6 sweep-f1 -- tests`: 5 files, +161/-17, sha256
  cfca2f8b32e9f19d0d3afa307a389f40d0fc5cd01fceb274d72921e9d994b180. It applies to sweep-x6 through a temporary index
  (`git apply --check --cached`).
- **Branch `sweep-f1-probe2`:** a0cbd75, one logging-only commit on sweep-f1. `probe2.patch` =
  `git diff sweep-f1 sweep-f1-probe2 -- tests`: 1 file, +18/-0, sha256
  33fbbf97c73bcfe0fcbc4e52eadd5b3b15626da447b33846f400e3d1ef825907. It applies to sweep-f1. `probe2-files.txt` names
  `tests/p14p3-directing-promises.test.ts`. The worktree is back on `sweep-f1`, clean.
- **Superseded:** `sweep-f1-probe` (979debe) and `probe.patch` sit on round-1 d20c170, and X7t ran them. `probe.patch`
  no longer applies to sweep-f1 (its p14p3 hunk at :395 fails). I left both in place.
- **`classification.json`:** 22 objects, 17 measured and 5 read. `line` is the sweep-f1 line; each note gives the r1
  line.

Every Save44 refusal below is `convertV44ToV43`'s romance refusal, `src/core/save.ts:10790`:
`migrateToV43: cannot downgrade or discard the romance of <edgeId>`.

## Capture versions

Both captures are Save39. The manifest (sha256 02115df5d6e7d4c33284b9a439a7c79601e1b2e807f4fa96c20149f5c84186f3, the
pin Q04 already uses) records `schema.saveVersion` 39, protocol 4 and projection 54. The Python read agrees:

| Capture | saveVersion | Week | Edges | Edges with `romance` or `competitions` | Director promises | First takes |
|---|---|---|---|---|---|---|
| `director-bound-week52` | 39 | 52 | 24 | 0 | promise-0 open | 20 |
| `director-waived-week61` | 39 | 61 | 30 | 0 | promise-0 WAIVED, promise-1 open | 25 |

Production's `convertV39ToV40` alone lifts each one to V40. Nothing is stripped.

## 1358-F11 rulings

### Loader (F1-new-4, directing-promises :102-114)

`directorCapture40(name, gzipHash, rawHash)` sits beside the S5 helpers. It:
- pins the manifest sha and the capture's gzip and raw sha256, using Q04's pins (opportunities :352-366);
- validates with `validateSaveV39` and asserts identity and the `exportSave` round trip, as Q04's `pinned39` does;
- returns `convertV39ToV40(old).state`.

It needs `readFileSync` and `gunzipSync` (:4-5) and the helper's `sha` (:25). The module constant is `EVIDENCE`. D10
declares a local `E` at :896, and the shorter name would shadow it.

### Ruling 1: D13 (r1 :387; X7t failed at :398)

- **S9 pin (:413-418).** The chain on `a.state` now expects
  `/^migrateToV43: cannot downgrade or discard the romance of relationship-edge-0$/`. The comment says Save44's
  romance refusal masks the lawful V40 projection for every route state that holds the promise. It gives the X7t
  counts: nine candidates, 19 to 21 tracks, `lifecycleAttached()` included.
- **Builders (:419-427).** `makeSaveV1`, `makeSaveV13` and `makeSaveV18` take `bound40`. Both builder assertions are
  unchanged.
- **Why the builders refuse (read from source):**
  1. Each builder runs `assertFrozenBuilderRetainsHollywood` (save.ts:6181-6196) first.
  2. On a V40 state that function calls `convertV40ToV39`, which passes. The subject facts are empty after
     `convertV39ToV40`, and the capture holds no opportunity predicate.
  3. The capture's `careerLifecycle` holds the transition-root fields, so the function validates the V39 state and
     calls `assertNoDirectorPromises` (save.ts:10556-10559).
  4. That call throws `<builder>: cannot downgrade or discard an explicit Director promise predicate`.

  The `hollywood: null` variant throws either in V40 validation or at the same check.

### Ruling 2: D12 (r1 :693; X7t failed at :713)

- **S9 pin (:744-748).** Inside the state loop, the projection chain now expects the same refusal for `change.state`
  and `done.state`. X7t measured both (19 and 21 tracks).
- **Builders (:750-756).** The builder loop moved below the state loop and takes `waived40` once. Before, it ran once
  per live state. `assertNoDirectorPromises` refuses any `directorCount` predicate whatever its outcome, so promise-0
  (WAIVED) alone triggers it.
- **futureSave pin (N-0531, :740)** stays. Its comment now cites X7t's measurement of `done.state`.

### Ruling 3: G5-new-6 (r1 :438; now :482)

The assertion pins `/^migrateToV43: cannot downgrade or discard the romance of relationship-edge-0$/`, the message X7t
logged. The comment names the masked V39 guard (save.ts:10600-10602) and its own-era cover, the last assertion of
screenplay-status Q11 `factOnly`.

### Comments refreshed from X7t

Seven round-1 comments said "read from source, not measured" or left a state unmeasured. Each now cites its X7t probe
line, and no assertion changed:
- Q04 S5 and D14 S5: all six captures equal in each;
- F1-new-1: F1-V39 logged 47 subjects for 47 first takes, cutover 0;
- F1-new-2: F1-V41 logged that the staged writer release validates and the receipt arm refuses it;
- N-0569: the movement leaf's reconciliation refusal;
- F1-new-3: F1-V27 logged week 309 and receipt industry-event-188;
- N-0531: `done.state`.

## Sites

| Site (r1 line) | sweep-f1 lines | After | Status |
|---|---|---|---|
| N-0560, screenplay-status Q11 :324 | :324-328 | romance pin, relationship-edge-18 | measured |
| F1-new-1, Q11 `factOnly` | :330-341 | V39 cover on the genuine Save40 capture | measured |
| N-0547, opportunities Q04 :374 | :379-382; helper :70-74 | S5 helper on the expected side | measured |
| N-0555, opportunities Q07 :814 | :822-827 | romance pin, relationship-edge-0 | measured |
| F1-new-4, directing-promises | :4-5, :25, :102-114 | genuine-capture loader | read; probe2 |
| G5-new-5, D13 :361 | :381-387 | romance pin | measured |
| N-0527, D13 :387 | :413-418 | romance pin on `a.state` | measured |
| N-0527, D13 :388-392 | :419-427 | builders on `director-bound-week52` | read; probe2 |
| N-0528, D14 :402 | :437-440; helper :86-90 | S5 helper on the expected side | measured |
| G5-new-6, D14 :438 | :476-482 | romance pin | measured |
| N-0531, D12 :689 | :733-740 | romance pin | measured, both states |
| N-0533, D12 :693 | :744-748 | romance pin per state | measured, both states |
| N-0533, D12 :694-695 | :750-756 | builders on `director-waived-week61` | read; probe2 |
| N-0569, p14r3 :374 | :376-381 | romance pin | measured |
| F1-new-2, p14r3 | :125, :127, :382-409 | V41 cover on a staged rival release | measured |
| G4-new-1, p13b :188 | :188-193 | romance pin | measured |
| G4-new-2, p13b :195 | :200-205 | romance pin | measured |
| F1-new-3, p13b | :206-215 | V27 cover on a genuine V26 fixture plus one S8 admission | measured |

"Measured" means an X6 or X7t probe line logged the exact message or value. N-0542 (opportunities Q03 :330) needs no
edit, because its chain passes.

## Probe2 (`sweep-f1-probe2`)

`probeCapture(id, name)` reloads the named capture, catches its own errors and logs one line per call:

| Id | Called |
|---|---|
| `F1-D13-capture[director-bound-week52]` | in D13, after `bound40` loads |
| `F1-D12-capture[director-waived-week61]` | in D12, after `waived40` loads |

Each line holds:
- `saveVersion` of the capture and `reached`, the lifted save's version;
- `edges` and `romanceOrLogKeys`: the edges on the lifted V40 state, and how many carry a `romance` or `competitions`
  key;
- `directorPromises`: the id and outcome of each `directorCount` promise;
- `liveRomance` and `liveLogs` after `migrateToLive`;
- `liveChainToV40`: the first refusal of `convertV44ToV43` through `convertV41ToV40` on that live save, or PASS;
- `roundTripEqual`: whether that chain's state equals the lifted state;
- `builders`: the three builders' messages on the lifted state, or NO-THROW.

The line follows the X6 form, `PROBE1358 <id>[<label>] "<string>"`, so the X6 README regex parses it. A failure logs
`probe failed: <message>` in the same form. Expected count: 2 lines. The patch adds 18 lines, deletes none and adds no
`Math.random`.

From source, not measured, I expect:
- saveVersion 39, reached 40;
- 24 and 30 edges, none keyed;
- liveRomance 0 and liveLogs 0;
- liveChainToV40 PASS;
- three Director-predicate refusals per capture.

I also expect `roundTripEqual` true. X7t's Q04 S5 lines show that the live migration of both captures adds only default
fields, but I have not traced the down-conversions line by line.

## Expected next dry run (read, not measured)

- **Pass in F1's files:** every site above, D13, D12 and D14 included.
- **Still fail, outside this sweep's cause:** D07 and D18 keep the fixture-premise failure X7t logged ("the same fixed
  rival really wins the later focus case", :971).
- X7t's fifth core failure, `p14c3-save-v38` A01/A02, sits outside F1's files.

## Open items for the parent

1. **D12 builder placement.** The builders now run once, below the state loop, on the capture. Both live states keep
   their two S9 pins. Say if you want the loop placed elsewhere.
2. **Staged own-era inputs (round-1 item 3).** F1-new-2 stages a rival release and F1-new-3 runs one S8 admission. X7t
   measured both as valid. Both still rest on the 1358-F10 ruling 5 staging precedent.
3. **Stale cover pointers in other units' files (round-1 item 4).** Four 1344 comments still say "(genuine V39 capture,
   week 48 take)". The V39 cover in `factOnly` is now the genuine week-110 Save40 capture.
4. **Pre-existing findings (round-1 item 5).** The p14r3 movement leaf never reaches `convertV41ToV40`'s guard; X7t
   logged its reconciliation refusal. The movement arm (save.ts:10647) and the V27 finance arm cannot fire on a valid
   save.
