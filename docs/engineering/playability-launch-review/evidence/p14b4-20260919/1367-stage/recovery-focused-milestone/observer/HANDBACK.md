# Separate S+O candidate and bounded runners

Prepared only; no runner, Node, typecheck, Vitest, simulation, fixture payload read, live source/index/HEAD write, or nested agent was executed. The original S and full A+B+C candidates remain untouched. The active recorded live mint is outside this tree and was not inspected or modified.

## Exact assembly

`candidate/` copies the exact current S inventory: all 188 source files, four root package/type configurations and the specifically authorized published tests/contracts/_contractFixtures.ts source dependency. It also copies S's vitest.config.ts and vitest.workspace.ts verbatim. Two independently reviewed patches then apply with complete exact context and no conflicts or manual resolutions:

- Observer source: `d0bd3c6bcfffb8244e98dcfd9a692bc51275f5601747fe81678df3778c561079`.
- Revised parity companion: `b6fb482b1d57c291460429f562782079d48507be0ea8f160810caf2b42e08c92`.

Only src/core/hollywoodTick.ts differs from S production. Its final SHA is `4778acf787dede707c23216f777de978592ed329fad5f1586a167533eea414e7`. Added tests are the exact approved parity test and exact control helper. The helper reversibly relocates imports from the original S tick body; it does not call or imitate the observer implementation. No migration/B/C test suite or fixture payload was copied because this lane runs only the approved generated-state parity companion. The one new tsconfig.observer-tests.json extends the unchanged root config and includes src plus those two test files with noEmit/allowImportingTsExtensions.

S-BASE-PINS.json binds every source/config/helper copied from S. CANDIDATE-PINS.json binds all 198 final regular files. APPLICATION-LOG.json records both input hashes and per-file/hunk application. inputs/ preserves both exact patches. No duplicate archive, separate P tree or dependency copy was made. The sole symlink is candidate/node_modules to the existing repository node_modules; runner pins the TypeScript/Vitest entry files and checks that exact link target.

## Prepared commands; parent executes later

From any directory:

```sh
python3 /Users/zacheryspector/studio-scratch/1367-recovery-schema-observer-candidate/run.py types r1
python3 /Users/zacheryspector/studio-scratch/1367-recovery-schema-observer-candidate/run.py parity r1
```

Run types first and attribute diagnostics before proceeding to parity. The wrapper supports only those two modes and a bounded alphanumeric attempt name. Each run creates a new exclusive runs/{mode}-{attempt} directory; an existing path or symlink refuses. Canonical real parent directories and source/test census are checked. It writes preflight.json, output.txt, postflight.json and result.json, with actual command, elapsed time, pin hashes, output hash, the single parsed bounded-child record and pre/post source equality. An unexpected source file, hash change, pin/wrapper/child-helper change, output-path collision or missing bounded-child record cannot be reported as a successful guarded run.

Both commands use pinned Node v20.20.2 and the existing bounded-child.py at 330 seconds. Parity uses only the named test, core project, one worker and no file parallelism. No new timeout, retry, policy or route expansion is introduced. Disk free bytes are logged; no new operational AC or disk threshold is invented. The parent retains the heavy-lane scheduling and active recorder source freeze.

The guard compares all copied files in original S before and after each run, independently of the new candidate hashes. It never writes there. The full recovery candidate and live repository are not execution cwd. Shared node_modules remains the preexisting dependency installation; no installer or generator runs.

## What parity measures and does not

The approved companion performs actual whole ticks for p13a-core-causal-01, weeks 0→53, with exact uninstrumented S industry, O without observer, and O with observer. It publicly admits inputs/outputs and compares full state, RNG, ordered chooser/re-search argument/result digests, forecast counts and cadence. The revised digest explicitly preserves Map insertion order and nested values, including promisedMasks; the dedicated small control distinguishes changes/order/empty maps. Snapshotting precedes the first reader. Observer facts are checked against actual branch events and scheduled decisions; the callback receives copied payloads only.

No measured equality or type success is claimed before execution. A test or spy failure is not a waiver of parity. The route does not establish every renewal/Scientist/refusal/release/natural-entry witness. Original S restrictions still apply: no disposed-state ticking, no C mutation producer, no B consumer, and no claim this intermediate build can be landed. Existing original migration/period failures and all capture/G-L/landing dispositions remain separately retained.

## Fixed preparation hashes

- CANDIDATE-PINS.json: `6d42ee6d3997500ecea0718b62882fa7c1bcc1883c9540977b06436977de2e81`.
- S-BASE-PINS.json: `351019ad8e2f454a8692836eb1980e7e7701713c19830fc6b358c1f5a4261beb`.
- run.py: `e1a890ef7f07845af1ba22ae886863b7a2b752bd3f17920e460b6eaf88c6d5e8`.
- RUNNER-PINS.json: `47c634e9ed93f30ac2d967d2f632f7dd8428179ce0958a5154efa76469c4218e`.
