# 1240-D — Independent closed Bridge55 static gates

Disposition: **KEEP these four bounded PASS results.** I read each complete raw output, recorder JSON and pre/postflight pair using standard-library data operations only. No compiler, tests, generator or project code ran in this review.

All four gates consumed the same published39d9546256ae542eb1b4a42c4d38df27207fa865 source. Each closed child0/fixedSource with empty consumed diff, no untracked consumed files and null signal/error. The pre/post HEAD, source paths,1679-file inventory aggregate,41 manual pins,raw index and stage entries agree exactly, and agree across all four gates. All44 nested file identities per postflight (41 manual plus record/raw/patch) were independently reread. Each preflight explicitly has advanceCap0.

| Gate | Exact command | UTC interval | Recorder elapsed |
| --- | --- | --- | ---: |
| 1243 root types | node_modules/.bin/tsc --noEmit -p tsconfig.json | 19:47:37.526–19:48:11.870 | 34.344s |
| 1244 UI types | node_modules/.bin/tsc --noEmit -p ui/tsconfig.json | 19:48:31.889–19:49:16.480 | 44.591s |
| 1245 local contract | npm run check:bridge-contract | 19:50:01.449–19:50:03.184 | 1.735s |
| 1246 local fixtures | npm run check:bridge-contract:fixtures | 19:50:19.229–19:50:20.407 | 1.178s |

The two compiler raw outputs contain no diagnostics. The contract check reports verification of the generated schema JSON, C# declarations and contract manifest; the fixture check reports verification of the generated union-fixture C# file. These are checks, distinct from earlier1240 generation. They do not execute or attest the Unity/native consumer.

| Raw evidence | Bytes | SHA256 |
| --- | ---: | --- |
| 1243-bridge55-root-types.txt | 340 | a9d4f6cd3ef533183030faff45f3d7556def34429f67bc846d14619276059d1f |
| 1244-bridge55-ui-types.txt | 343 | b9888423769c61655976116dfd2756c2b1efe292da22813be95b67320a0ebba7 |
| 1245-bridge55-contract-check.txt | 760 | 5d0b4a96675cc84d7965464cb1d0f9de37feb0ae8001da89b6e96f99f67792ab |
| 1246-bridge55-fixture-check.txt | 575 | 6d9c6947dc2c2e0919d66be56781defb948373a875f966143d7e016ff405c66e |

The corresponding recorder JSON hashes are respectively dac2e084052bb8e239b84bdbca66a588df085f84f1d19d2a2ce5f5061701fd07,3777684a1c7de7d8d134dfb743a1e699aadda85b78fb330813ac540fb524f0f2,efa5a7b35dd8fe0d02dd5a8a2c5ef06e70619b4b1f97597eac8a697bb1810983 and522be79b99b6133708fbb505130362022aa2ac1ab137e44278e14b10d07fc58b.

The subsequently applied1242 three-test compatibility patch is outside these runs’ source boundary. These PASS results do not replace the failed1241 Bridge compiler or qualify its corrected graph; that is a separate gate. The new Bridge55 and component controls are still staged preparation at this boundary. No new material quote/waiver/runtime behavior, whole-suite result, elapsed guarantee or historical endurance rerun is claimed.
