# Independent R05 current-core endurance continuation

**PASS: the current committed core reproduced the original final canonical bytes exactly after 6,240 ordinary ticks from the retained all-nine week-2548 checkpoint.** This is engineering continuation evidence. Native Gate A/B acceptance and the original fresh-world entry trace remain separate.

Executed 2026-09-10 16:32:59.686–16:33:31.712 UTC. Bound TypeScript commit: `6827293985a1375e8cefed745fbc4227a01aeb53`. No worktree edits, bridge imports, servers, native input, fresh-world regeneration, or original-artifact overwrites occurred.

The probe imported only 53 pure-core source files. Their hashes were unchanged before/after execution. The exact imported set differs from the prior engineering run in five files: `hollywood.ts`, `hollywoodTick.ts`, `hollywoodValidation.ts`, `save.ts`, and `worldgen.ts`. See `prior-imported-source-comparison.json`; the broader old manifest also contains two changed bridge files that were not imported here. The source-set SHA is `ebbefcac78abed86f4bf2f3d20e63b34fb8bfe2afee107979c5857bad6db1bce`; bundle SHA is `ff2cf9a304a12f5c9eacc64494e1484303e851093a1bcda201fe584cf4e78c2a`.

Input: `/tmp/p12a-engineering-8788-P6KEMm/week-2548.save.json`, 10,667,175 bytes, SHA `742a9b980b5ea43c7c72c53f8493302846c86929b1dbb9e5e8db93be448e040c`. Seed: `r05-living-hollywood`; world: `world-e26cea4b`. Strict current import and canonical export preserved these exact input bytes. The input already contained all nine businesses; the old fresh-world 0→2548 trace remains its own evidence and was not rerun.

Driver: `tick(state, { develop: true })`, matching the prior ordinary-tick driver, without player actions. Exactly 6,240 ticks advanced the world from 2548 to 8788. Every tick advanced exactly one week, preserved the player RNG, retained nine businesses, and kept every business cash value finite. There were 121 strict save validations at entry and annual boundaries through the final week. Reload/canonical round-trip and next-tick equivalence passed at weeks 2548, 5668, and 8788.

The final 38,135,529 bytes matched `/tmp/p12a-engineering-8788-P6KEMm/week-8788.save.json` byte-for-byte, SHA `cd0e3836332c4b4ffd87e637381c2d5e2d1e4c9db976c4df47b8683550de56d9`. Both original input artifacts were verified unchanged afterward. There was no rebaseline and no difference report was needed. All selected prior count comparisons passed:

| Final authority | Count |
| --- | ---: |
| Rival businesses | 9 |
| People | 84 |
| Simulated films / authored films | 2,892 / 8 |
| Career events | 17,352 |
| Employment intervals / active intervals | 894 / 18 |
| Receipts | 9,614 |
| Concepts | 2,909 |

Player RNG remained `219853229,3878288057,3773428936,3488871996`. Final reload and next ordinary tick also matched exactly; next-tick SHA was `be3d2d3937ce8d5fe551393bf2ca54e7c982e464bc1b4eb78119f94eb17aeafe`.

Pure tick time totaled 10,698.966 ms across 6,240 ticks: median 0.451 ms, p95 7.793 ms, maximum 20.520 ms. Final strict canonical export took 425.033 ms. Full run wall time was 32.026 seconds, including strict saves, checkpoint comparisons, and file evidence. These are source-engineering timings, not end-to-end application latency, and should not be compared as a percentage improvement against the old fresh-world timing distribution because the covered tick ranges differ.

Hardware: Mac15,9, Apple M3 Max, 16 logical CPUs, 137,438,953,472 bytes RAM; Darwin 25.6.0 arm64. Node v26.3.1 ran with no extra flags and default heap limit 4,395,630,592 bytes. Final checkpoint sampled RSS was 1,173,848,064 bytes, including probe comparison data. It is not a peak RSS measurement or a native/packaged-app memory measurement.

The original uncompressed 8 MB target remains MISS at 38.14 MB. Nine retained businesses do not mean all nine remain financially healthy or currently producing: only Rose Lantern, Marigold and Blackthorn retain six active employees each; the other six have negative finite cash and no active employees. The exact prior final match preserves that previously observed outcome without a bailout, closure simulation, or new policy change.

Machine-readable details: `report.json`; reproducible source/bundle: `probe-source.ts`, `probe-bundle.mjs`, `metafile.json`; bindings: `binding.json`, `source-before.json`, `source-after.json`; operation trace: `probe.log`. The new final synthetic save stays private alongside these artifacts. This proof does not activate or test the hook; its status remains explicit-checker fallback.
