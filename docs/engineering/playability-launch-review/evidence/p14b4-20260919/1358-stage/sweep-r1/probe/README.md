# 1358 probe: message logging at the S8/S9 sites

The probe is temporary. It measures which guard refuses first at each site in
`probe-sites.json`, and it never lands.

## What it does

Each probed site gets one new line directly ahead of its unchanged assertion, in
the 1344-X12 form (section 2). The line runs the assertion's own thrown
expression once more, with the same inputs, and logs the result:

```ts
try { <expression>; console.log('PROBE1358 <logId> NO-THROW') } catch (e) { console.log('PROBE1358 <logId> ' + JSON.stringify(e instanceof Error ? e.message : String(e))) }
```

- Base: `sweep-merge` 3c7b83a (step4 plus `sweep-r1.patch`, sha256 20398175...).
  Commit on `sweep-probe` in the 1358-n scratch repo.
- 34 of 35 sites probed, 1 skipped, in 19 files. The patch adds 35 lines and
  deletes none: one per probed site, plus one sibling line at G1-new-1 (below).
- No assertion, title, import or other line changed. The probe adds no test and
  no `Math.random`.
- No site needed a clone. Every probed expression reads its input without
  writing it: the validators only read, while `makeSave` and every
  `convertVnnToVmm` validate and then detach through JSON. The tests' own
  non-mutation checks still run after the probe (for example
  p14b5-relationships r1 :1432, p14c2s-scientist-retirement r1 :281,
  p14c2rm-writer-continuation r1 :255, p14p4p5-opportunities r1 :815).
- No site is async, so none needed the `await` form.

## Skipped

- **G3-new-1** (bridge-p14c3-runtime r1 :178). The assertion expects success:
  `expect(exportSave(convertV38ToV37(migrateToV38(saved)))).toBe(f.value[slot])`.
  It has no throw matcher, and the row's reason predicts the chain succeeds. If
  convertV44ToV43 refused, R2 would fail and vitest would print that message as
  the failure. The probe leaves the file alone, so `probe-files.txt` omits it.

## Placement notes

- **G1-new-1.** The row's reason covers r1 :279 (`migrateToV36(live)`) and :280
  (`migrateToV35(live)`), and 1344-X12 section 4 measured both. The probe logs
  :279 as `G1-new-1` and adds a second line ahead of :280 that logs
  `G1-new-1[:280]`. `probe-map.json` records it under `alsoProbed`. Ignore the
  line if you want the 35 listed sites only.
- **N-0560.** The site (`expect(message).toBe(...)`, r1 :324) asserts on a
  message the test caught itself in the r1 :320 try block. The probe reruns
  that block ahead of :324. If the chain stops throwing, r1 :323
  `expect(error).toBeInstanceOf(Error)` fails before the probe runs. The test's
  own emit at r1 :322 then prints `1254-P4P5-FACT-ONLY-REFUSAL` with
  `"message":"undefined"`.
- **G6-new-5.** The assertion spans r1 :218-:221. The probe sits ahead of the
  statement's first line; `assertionLine` names the post-image `.toThrow()`
  line.

## Case labels

Sites inside a loop, an `it.each` or a shared helper log one line per case,
with the label in brackets:

| Site | Label | Lines at most |
|---|---|---|
| H-new-1 | `<vitest test name> > <row.name>` (rejectMutations, 11 tests) | 102 |
| N-0096 | `<vitest test name> > <pattern>` (expectRefused, 13 tests) | 20 |
| N-0102 | `older.name`: migrateToV29, V28, V27, V26 | 4 |
| N-0468 | `<vitest test name>`, which carries the it.each case name | 18 |
| G5-new-7 | `<vitest test name>`: 4 callers x 8 rows | 32 |
| N-0493, N-0496 | `target`: director, writer | 2 each |
| N-0498 | `kind`: createTalent, createCustomTalent, createBalancedTalent | 3 |
| N-0531 | `change.state` or `done.state` | 2 |
| G5-new-5 | index in `positives`: 0 attached, 1 bound, 2 firstFilm, 3 secondFilm | 4 |
| G6-new-4 | `<vitest test name>` (rejects, one call per test) | 15 |
| G6-new-5 | `<kind>/<forbidden>`: 12 kinds x seen, consumed | 24 |

The test name comes from `expect.getState().currentTestName` (vitest 2.1.9),
which joins describe and test titles with ` > `. The probe uses it where the
callback does not bind the case name.

- N-0096: three closeness calls (r1 :1336 to :1338: 101, -1, 50.5) share test
  and pattern. Their order in the output tells them apart.
- G6-new-4: the 14 retained 1348-I rows at r1 :309-:346 throw at :283 inside
  `sharedTakeOutcomes()` before `rejects()` runs, by the row's reason. They log
  nothing, which leaves 15 lines.
- G6-new-5: only `releaseCommitted/seen` and `releaseCommitted/consumed` reach
  `validateSaveV44`, the S8 call. The other 22 lines come from the frozen V14
  validator and serve as context.

If every test reaches its probe, the run logs 251 lines: 228 from the table and
23 from the single-line sites (22 sites plus `G1-new-1[:280]`).

## Running it

`run-1358-sweep-dry.sh` takes the probe as its optional third and fourth
arguments:

```sh
run-1358-sweep-dry.sh <run-name> <sweep-patch> out/probe/probe.patch out/probe/probe-files.txt
```

The runner applies the patch after the slice B files and runs
`vitest run --project core --no-cache --reporter=verbose` over
`probe-files.txt` into `probe.txt`. It counts `PROBE1358 ` lines in
`run.meta`, reverses the patch, and stops if `git status --porcelain` is not
empty afterwards.

The probe touches no file that `sweep-x6` (8144c0c, p14b9-save-v42 only)
changes, so it also applies on that base.

## Reading the output

```sh
grep -a 'PROBE1358 ' probe.txt
```

Each line reads `PROBE1358 <logId> "<message>"` or `PROBE1358 <logId> NO-THROW`.
`JSON.stringify` encodes the message. Labels can hold spaces and ` > `, and messages can
hold `]`, so parse with a lazy label:

```
^PROBE1358 (?P<id>[A-Za-z0-9-]+)(?:\[(?P<label>.*?)\])? (?P<result>NO-THROW|".*")$
```

- Each message comes from the first guard that refuses that input. Compare
  it with the `expects` text in `probe-map.json`.
- `NO-THROW` means the expression returned. The assertion after it then fails.
- A missing id means the test ended before the probe line. The verbose
  reporter shows where.

## Side effects checked

- vitest 2.1.9 starts a test's timeout timer only after a synchronous test
  function returns (`withTimeout` in `@vitest/runner`). Every probed test is
  synchronous, so the second run of a long chain cannot trip a timeout.
- The spies in these files (tick guards, promiseFeasibility,
  validateHollywood, fnv1a64, advanceTalentMarketWeek) either belong to other
  tests and restore in `finally`, or wrap calls the probed expressions never
  make. No probed file uses `expect.assertions`.
- At N-0522 and N-0524 the probe calls `envelope38`, which runs one `expect`
  of its own. That adds an assertion call and changes no outcome.
- I wrote the probe to typecheck under `tsconfig.json` but did not run tsc.
  The runner applies the probe after its tsc gates, so tsc never reads it.

## Files

- `probe.patch`: `git diff sweep-merge -- tests` from the probe worktree.
- `probe-files.txt`: the 19 probed test files.
- `probe-map.json`: one entry per site, with `id`, `file`, `probeLine` and
  `assertionLine` (post-image), `assertionLineR1`, `expression`, `expects`,
  `skipped`, `logId`, and `cases` or `note` where they apply.
