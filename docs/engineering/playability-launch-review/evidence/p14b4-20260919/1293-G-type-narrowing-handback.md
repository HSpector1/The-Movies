# 1293-G — Q25 observed closure-narrowing correction

The original [1294 compiler record](1294-post-capacity-types.json) failed with exactly three test diagnostics on published `e33b4b5367903ad534feec8ea8c1d0d931041b5a`. Runtime1295 did not run. This staged correction retains the assertion that `initial` exists, captures that narrowed value in `const baseline = initial`, and uses the immutable local in the three `lockedPeople` map-callback reads. No cast, assertion removal, expected value, action, tick, quote, timeout or production change is introduced.

The complete diagnostic tail is retained in [the original raw output](1294-post-capacity-types.txt), 44,452 bytes / SHA256 `7f5aba3709d4e7d67f2383d566bc4b0048738460193254f492d811aaa10c0385`:

```text
tests/p14p4p5-post-capacity.test.ts(196,32): error TS18048: 'initial' is possibly 'undefined'.
tests/p14p4p5-post-capacity.test.ts(198,83): error TS18048: 'initial' is possibly 'undefined'.
tests/p14p4p5-post-capacity.test.ts(203,55): error TS2345: Argument of type 'GameStateV40 | undefined' is not assignable to parameter of type 'Pick<GameStateV40, "talent" | "careerLifecycle">'.
  Type 'undefined' is not assignable to type 'Pick<GameStateV40, "talent" | "careerLifecycle">'.
```

The compiler ran `node_modules/.bin/tsc --noEmit -p tsconfig.json`, UTC03:15:26.432–03:16:06.136 on2026-09-28,39.704 seconds, child exit2 with no signal/recorder error. The [closed bounded postflight](1294-post-capacity-types-postflight.json) reports fixed source and `allGuardsExact:true`; complete pre/post metadata comparison matches its 1,139 allowed source files, explicit manual pins, raw index and stage entries. Fixture/e2e/public automatic exclusions remain explicit. This handback did not rehash the automatic inventory or reopen excluded payloads. No runtime premise or semantic result is inferred from the compiler failure.

Frozen correction artifacts:

| Artifact | Bytes | SHA256 |
|---|---:|---|
| [Staged postimage](1293-type-stage/tests/p14p4p5-post-capacity.test.ts) | 50,088 | `3527d3468da5cc8baf2bc30545c01eee75ca92371f0d27ac8c223e450afd4369` |
| [Exact one-hunk patch](1293-type-narrowing.patch) | 1,954 | `e411332127febb268a45343458f00cd87a21d34fa0cef0f4ff671c6843e3cd13` |
| [Correction manifest](1293-type-narrowing-manifest.json) | 14,449 | `a996ce07ea6e365ceec4109e60d7ac86e65dffe9721a58e01006a151561e225e` |

The live and original staged preimage remain50,058 bytes / `0b3907b1cd997318e55291fd33a6d580beb1c5b40eddadf70ccfe612e5bfc133`. Original C/D, original patch/manifest/stage and all1294 evidence are preserved. The complete function inverse, unchanged surrounding prefix/suffix, and all58 explicitly pinned protected source/config/test files match. The correction manifest additionally pins the four access-policy/helper artifacts and failed gate records. It does not authorize arbitrary payload reads. All Q25 leaf assertions and its60,000ms declaration remain exact; bounds stay two advances, five public actions and two explicit quotes.

After independent H, parent alone may apply/publish this exact patch, then use the unchanged bounded helpers for `1294b-post-capacity-types` (cap0). Only a successful compiler and closed guards permit `1295-post-capacity-runtime` (cap2):

```sh
node_modules/.bin/tsc --noEmit -p tsconfig.json
node_modules/.bin/vitest run --project core tests/p14p4p5-post-capacity.test.ts -t 'Q25 '
```

These are prospective commands, not author execution. No project code, compiler, test, engine, Git/index mutation or live source edit was performed for this handback. The separate1297 manual-guard task remains deferred behind this correction.
