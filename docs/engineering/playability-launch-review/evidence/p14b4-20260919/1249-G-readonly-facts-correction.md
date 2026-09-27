# 1249-G — Three readonly-array negative constructions

Parent's source inspection found that `FirstTakeSubjects.facts` is `readonly FirstTakeSubject[]` (`src/core/types.ts:2497`). The frozen Q07 stage used `.pop()`, `.push()` and indexed array swaps. This is a static test construction issue; **1252 has not run**, and no compiler or gameplay result is claimed.

Change only those three negative constructions to replace the mutable root's `facts` property with a new array: `slice(0,-1)`, an appended spread, and swapped first entries followed by `slice(2)`. The array element type remains intact. The same omitted/extra/reordered invariants, test names, precise expected refusal expressions and all remaining source bytes are preserved. No type cast, reader relaxation or production change is used.

Apply the original reviewed `1249-retained-controls.patch` first, then this independent `1249-readonly-facts.patch`, each against its exact preimage. Original C/D/patch/manifest/stage remain frozen and retained. Removing only the three named replacements reconstructs the entire78,716-byte prior stage; the46,682-byte original live test remains a literal prefix of both stages. All ten declarations/timeouts and four-new/six-filtered selector are unchanged. Expected20/hard47 selected Q05 calls, zero Q06/extra calls; whole-file94 remains separate.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| Prior staged preimage | 78716 | `5ae434a8cdd16d2682bbf70c6c3b11667c694a7bc037495dfdacd6beb50cb9ce` |
| `1249-readonly-stage/tests/p14p4p5-opportunities.test.ts` | 78825 | `205bf41b2ee5e0f9c0f0dd9b772f07174c117cbc79ad55e0309ca54cefa52422` |
| `1249-readonly-facts.patch` | 1710 | `2ff0341545efd4892a26606572edc9a9e970a09aafbfcc3ee38c211edc3f2c61` |
| `1249-readonly-facts-manifest.json` | 3514 | `bf6c3247d30bf064a19dd1f06465b3d2c59e7eb5cdcafe8226f6014858131175` |

No live file, index, frozen source/evidence or command was changed/executed by the author. Parent remains sole integrator/executor; the unchanged1252 root compiler precedes1253's exact four-leaf selection after independent amended-source review.
