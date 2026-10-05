# Independent six-file Save45 regression runner review

Reviewer: `/root/founding_charter`. Static review only. `bash -n run.sh` passed; no runner, recorder, guard, Node, test or typecheck was executed. No fixture payloads were read, no source/index was changed, and no additional task was undertaken.

Reviewed exact identities:

- `run.sh`: `ef9f56cc9cf429a86822f77c1d49345d4bd8b0b1debcacd93ced0e520be71029`.
- `new-input-pins.json`: `81c9387bfe5d311ffaf92fe7a42bc034686c9915c152b534cd35e183162d44e4`.
- Reused `S/1361-capture-runner/bounded-child.py`: `717d02e676d08600ffd4c5b54cb9cb5b94d3d4ddb73555ad70981e8bae406b9c`.

Initial disposition: one narrow provenance correction before execution, plus one inexpensive output preflight improvement. The selected test command, operational deadline, published-source gates and underlying recorder/guard handling have no identified blocking defect.

## Confirmed scope and behavior

The fixed selection is exactly the six requested full files: `p14d1-rival-shelving.test.ts`, `p14d2-binding-cash.test.ts`, `p14d2-a8-binding-cash.test.ts`, `p15c2-legacy-lens-shape.test.ts`, `save-masked-downgrade-own-era.test.ts` and `save-v36-extension-own-era.test.ts`, each under `tests/`. The command uses the existing core project, one worker and no file parallelism. It does not change individual test timeouts, filter out failures, or reinterpret expected behavioral REDs as passes.

The reused owned-session watchdog allows 330 seconds plus its existing five-second TERM grace before killing only its own process group. This is an operational wall-clock cap, not an amendment to adopted test or performance budgets. Child failure/timeout survives into recorder `exitCode`, postflight and final wrapper exit. The recorder's own successful exit alone cannot be mistaken for successful tests.

The wrapper checks its explicit full HEAD against local HEAD and the published branch, pins Node 20.20.2, checks five GiB free, requires the actual working directory, checks source-tree status and tracked named tests, then invokes the unchanged guard preflight with cap 0. That guard additionally covers the complete approved source roots and root configuration files, exact remote HEAD and index/stage identity. The existing automatic fixture/public/e2e exclusions and original manual input policy are unchanged.

All five recorder outputs are checked for existing paths or dangling symlinks before work. The wrapper always proceeds from a completed recorder call to postflight even when the recorded child fails. Final assertions require exact fixed-source flags, exact guards, matching start/end/head and matching child exits. No retry or source mutation is introduced.

The six additional input pins match the previously reviewed literal consumer hashes: A8 manifest, provenance and gzip; extension manifest, open gzip and used gzip. Each check reads only those named files, rejects symlink components and compares SHA-256. These extra pins stay separate from the unchanged guard's manual policy. This review compared the pin map against reviewed consumer artifacts; it did not open the fixture payloads anew.

## Corrections requested

1. Bind `new-input-pins.json` itself to its accepted identity. Currently each check rereads the external mutable JSON, and the extra report stores only `additionalInputPinsBeforeAfter: true`. A changed expected map between checks could satisfy both checks without proving the same accepted pins held before and after. Require the reviewed SHA above on both reads, or preserve/compare the original accepted bytes, and include that SHA or exact fixed map in the extra report. This supplies durable attribution outside terminal-only output.
2. Preflight `S/<stem>-extra-guards.json` for an existing file or dangling symlink before the expensive run. Its current exclusive `open('x')` prevents overwrite but discovers a naming conflict only after execution. Keep exclusive creation as the final defense.

No broader framework or watchdog change is requested. Both findings were sent directly to parent for a bounded revision.

## Execution prerequisites and limits

At inspection, the first five test paths existed; the newly approved extension test was not yet installed. The wrapper's tracked-file check correctly refuses until parent installs and publishes the sixth file. This is an installation prerequisite, not a request to widen the selected command or treat absence as a test result.

Parent owns the single heavy lane, installation/type qualification, immutable source window and actual published HEAD argument. No runtime attribution, pass/fail count, RED qualification or coverage closure is claimed by this static review. Append a fixed-hash disposition after the narrow revision is inspected.

## Final narrow revision review

Fixed `run.sh` SHA-256: `b5d03d4638e315790a28f6c257e66aaeea47e07c9dc58028157ba34ac6df4a4c`. Pin map remains `81c9387bfe5d311ffaf92fe7a42bc034686c9915c152b534cd35e183162d44e4`; the reused watchdog is unchanged. Repeated only the authorized shell syntax check and inspected the narrow correction. `bash -n` passes.

Both findings are resolved. Each before/after input check first hashes the pin-map bytes against the accepted literal hash; final report creation checks it again and persists both that SHA and the exact map. The extra report's output path now rejects an existing path or dangling symlink before execution while retaining exclusive final creation. Parent reports the extension consumer is now installed; the wrapper still requires all six tests tracked and the actual HEAD published at invocation.

Final verdict: **PROCEED** to parent-controlled recorded execution of this exact wrapper, subject to its existing source/lane/install gates. This is static runner approval only. Expected behavioral REDs remain nonzero child results; no runtime result, input coverage or implementation readiness is inferred.
