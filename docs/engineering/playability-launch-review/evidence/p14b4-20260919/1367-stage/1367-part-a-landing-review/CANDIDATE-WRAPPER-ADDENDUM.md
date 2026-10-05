# Isolated Part A candidate wrapper addendum

Verdict: **suitable for the bounded candidate check, with the explicit provenance limits below.** No source/test selection defect found. No additional approval loop or automatic repeat is required merely to improve future guard declarations.

Reviewed `S/1367-part-a-candidate/run.py`, `SOURCE-PINS.json`, candidate configs, the 696 explicitly pinned non-fixture source/test files, and the existing child bounder. S is `/Users/zacheryspector/studio-scratch`. No active output was read, no runtime/typecheck/test was launched, and no candidate/live file was modified.

| Reviewed artifact | SHA-256 |
| --- | --- |
| `run.py` | `908fd1e6d3a9bc9cbd882d5ed77d85e479fcee3fce7449fcd26b9f2a312ce46d` |
| `SOURCE-PINS.json` | `ab6ce98bad2f70a19b8eaf7f19e2ff87ca05d63628a216ab12dfe7ed564c3f1b` |
| `tree/tsconfig.part-a.json` | `0647f318ace721232251f2f2375117554dc839cc149e3e324fe63d4818223208` |
| Candidate `src/core/hollywoodPolicy.ts` | `cfdde050a2aa2955bdea15f69a9600d7b57017eb09828c01109df03ea7b3695a` |
| Candidate `src/core/hollywoodTick.ts` | `21b00c62f0057786f81d1b821eb5984677f7e4251211ecaf7d5288840d5f719e` |

The last two are exactly the reviewed Part A outputs. All 696 manifest entries matched their bytes. Comparing those named files against live found only these two differences. The manifest identifies base `858cd9d24903da6fea1b59662bc154d6b9184480` and exact Part A patch `2b11a5c13259b69ddcea3476b826c6eba690b7ea82facfa11e2aff03352bd5d9`.

The focused command uses exactly the original six full test paths in the same order, `--project core`, one min/max worker, no file parallelism and verbose output. Its cwd is the isolated candidate. The 330-second bounder accepts literal `node`, creates an owned child session and uses group TERM/KILL on timeout. PATH selects the same Node v20.20.2 installation. Outputs are created beneath a new mode/run directory; existing directories refuse. The actual run labels are parent-controlled, not a general untrusted-path interface.

The type config inherits the strict root options, explicitly disables emission, permits established `.ts` imports and narrows its include to all src plus the six tests (and their imported dependencies). This is a focused candidate typecheck, not the full root/UI/bridge type gate. `src` and `tests` are real candidate directories and the changed production files are regular files. `tests/fixtures` and `node_modules` are shared links. Selected fixture consumers use read-only reads and pinned admission; no fixture payload was read by this review. An ordinary symlink does not enforce filesystem read-only access, so do not describe it as a read-only mount. No selected consumer writes through that link. Package caches may live in shared dependencies; candidate production module imports resolve from candidate files.

The wrapper verifies manifest files and the separate new-input pin map before and after, then compares live HEAD, scoped diff digest and raw index digest. It does not enforce a clean/exact live base solely from those equality checks, nor inventory all possible unlisted additions. The present explicit candidate comparison supplies the reviewed identity; this is scratch candidate evidence, not a replacement for the full recorded source protocol.

One real guard limitation was reported to the parent: the executed `tsconfig.part-a.json` is absent from SOURCE-PINS. The wrapper and child bounder themselves are also outside that candidate manifest. Current `allGuardsExact` therefore does not assert their pre/post equality. The observed config and wrapper hashes above bind this static review; the parent will pin them in a future runner revision. Do not edit active pins/wrapper or claim a retrospective automated check. This documentation limit alone does not require repeating a valid completed typecheck. Final result attribution still needs actual completed command/status/guard output.

Parent-reported follow-up facts, distinguished from independently attributed output: F6 on `858cd9d2` completed 37 PASS / the same nine Part A FAIL, with its five-mutant test passing in 7.213 seconds and exact guards; types-r3 completed exit 0 without timeout in 19.350 seconds. Types-r1 failed during setup because `.git` was assumed a directory, and types-r2 failed before Node because the bounder requires literal `node`; retain both failures and do not count them as child runtime. Focused-r1 was active at this review and no outcome is inferred. These results do not close Part A fallout, broad gates, conditional earlier-capture or the outstanding G-L disposition described in the main review.
