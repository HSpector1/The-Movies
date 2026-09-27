# 1236-F — observed Bridge compiler correction

1247 failed on published `1fb180850ea7985bee9100b76dbb80d0c3356da2` with exactly one diagnostic. The compiler ran from `2026-09-27T20:03:19.863Z` to `2026-09-27T20:03:47.862Z` (27.999 seconds), child exit 2, fixedSource true, empty consumed diff and untracked source, no signal/error. Pre/post source inventory, manual inputs, raw index and staged entries are identical. No Bridge runtime result is implied.

```text
tests/bridge-p14p4p5-opportunities.test.ts(497,47): error TS2551: Property 'StudioBridgeAcceptedSaveResponse' does not exist on type '{ readonly StudioGridCellSnapshot: JsonSchema<ObjectValue<{ readonly gx: JsonSchema<number>; readonly gy: JsonSchema<number>; }>>; ... 284 more ...; readonly StudioIndustryResponse: JsonSchema<...>; }'. Did you mean 'StudioBridgeSaveResponse'?
```

The test confused the accepted response TypeScript type name with its schema definition name. The exported `$defs.StudioBridgeSaveResponse` already requires `accepted: true`. Change only that identifier at line 497; preserve the immediately preceding accepted/saveJson assertions and the complete public response parser, all request/response/replay checks, three declarations, 60-second timeouts and seven-advance cap. No cast, fallback parser or assertion relaxation is added.

The independently staged correction is unapplied. Original 1236 C/D, stage, patch and manifest remain exact. No compiler, test, imported project code, gameplay or git index operation was executed by the author. Parent owns integration and the repeated Bridge compiler before runtime.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| Live preimage | 38927 | 190da60b88054d566e2fca7cfe024515ec2ea1f5f043e37c3f3f5fd6ecb69004 |
| `1236-save-response-stage/tests/bridge-p14p4p5-opportunities.test.ts` | 38919 | 288fd844a598c1591be7a7eb079f8dd8be160469e381d5dba1eb78fea2eaeefb |
| `1236-save-response.patch` | 764 | b9d0e9c4d52e7ca740db5860c4fa4ec541957d001b61edf13e79dad39cc324d5 |
| `1236-save-response-manifest.json` | 3342 | fdfaf75f20f7ad3e874032625393e01c7b02b5e5db3b256834035ab9a7365c82 |

The manifest pins complete raw/record/pre/post evidence and the original frozen source artifacts. Replacing the sole corrected schema identifier with its original spelling reconstructs the entire live preimage byte for byte. The live test was re-read after staging and remains unchanged.

Next compiler argv is unchanged: `node_modules/.bin/tsc --noEmit -p tsconfig.bridge.json`. Runtime remains `node_modules/.bin/vitest run --project core tests/bridge-p14p4p5-opportunities.test.ts`, only after the parent's actual compiler/guard closure.
