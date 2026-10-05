# Independent review: genuine Save45 predecessor capture

**PROCEED to use these two named captures as the genuine Save45 inputs for the reviewed recovery migration controls.** Their compressed, raw and state pins match; provenance and the completed public Save45 writer/reader checks are supported by the recorded execution. This does not establish any future Save46 migration result, behavioral RED/GREEN or Part C disposal eligibility.

Scope: decoded only the two newly authorized files in this directory, read their manifest/result, the five completed `E/1367-save45-predecessor-mint*` recorder artifacts, and narrowly relevant producer/runner/source. No original fixture payloads, engine replay, Node, typecheck, tests or live/index writes. `E` is the repository's `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.

## Source and completed execution

- Actual generating HEAD is `689a69f314a61a71c2ee4fc813fb4f16c7245ec1`. Its `src` tree is `88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837`, independently equal to the original published Save45 HEAD `2eaa697effc38538c37da28b486786ce267a2284`. The manifest distinguishes generating HEAD from original source HEAD correctly.
- The seven named producer/config/harness/save/tick/package inputs in `MANIFEST.json.files` match their committed bytes at the generating HEAD. Producer SHA is `7c94086ca4787a931f0bd61b7eb94cacee3062ec14973a7132799f37036eebac`; config SHA is `7b935bef9808c4bae3371515c31ee3fb25bc78744070decab92e7c995a28abff`. The recorded runner hash independently matches `b587ca59134a5f5e7459ae84418505c816027e59d4a8ddda89891cc6ebfbf36a`.
- The actual child reports exit 0, `timedOut: false`, with a 300-second bound and 8,286.594 ms elapsed. Its emitted `MINTED` object exactly equals `RESULT.json`. The recorder also reports exit 0, no signal/error and fixed source.
- Producer source identities before/after are equal. Independently compared recorder pre/post HEAD, guard scope, source paths, 1,203-file source inventory, manual inputs, index and stage entries: all equal. The recorded diff and patch are empty. The postflight hashes/sizes for recorder JSON, raw log and patch match the actual files; `allGuardsExact` is true. Node was v20.20.2.

The exact route is `p13aGeneratedStudio('p13a-core-causal-01')`, then **53 calls to `tick(state, {develop:true})`**, capturing at states 0 and 53. This is the actual installed producer's declared route; it must not be relabeled as the no-options natural G-P/K3 route. The producer loop checks each state's week and advances only while `week < 53`, with no fixture input, migration, repair, additional action or horizon extension. The existing genesis helper performs its normal world generation, operating activation and fresh Hollywood initialization (`src/harness/p13a/fixtures.ts:9–12`). Genesis state equality and 53-tick generation are supported by that source and its completed guarded run, not by an independent replay in this review.

## Byte and state verification

Both envelopes contain `saveVersion: 45`, seed `p13a-core-causal-01` in both envelope and state, and the expected `market.tick`. Python gzip decompression independently reproduced the following exact pins and byte counts. State hashes were computed directly from the canonical serialized `state` value inside the raw envelope, with JSON parsing confirming the extracted value. This avoids Python float reserialization changing JavaScript number text.

| State week | Gzip bytes | Raw bytes | Gzip SHA-256 |
|---|---:|---:|---|
| 0 | 48,875 | 402,008 | `4bded8663feb1cd20d7425405d7daf4864a3f3b5a840e9deaf86b09ce45bb8ae` |
| 53 | 90,405 | 774,318 | `fd4b8f0986453d1b735dda8410ffd05c841289d0fd51d9fe1a6707128947dc68` |

| State week | Raw SHA-256 | State SHA-256 |
|---|---|---|
| 0 | `eb0aa9897e964ec56ffe287d2dba7853c953689f50d7348aaadc9330348e4f7b` | `ee4f81b834c726f0dc0166786ecd2cdc95ffa98856db238a1b41bf59dabc38e0` |
| 53 | `d66a6809c3fc3dacf6a83386cad320d94c70264384f47e5f83a0bd0320768d07` | `dc973949b9ae006ec113a76727511ecf0d69f53d623356a57c4ec6e555112abe` |

The manifest hash is `0cee53cb3c0a09d3b1afef8e9200f26a570423533a468864a9233cf6ce85001d`, matching `RESULT.json.manifestSha256`; result hash is `e925662f88abfe4895ec1dff003aac66b947124e3e2848556e7a8fd31c425a74`. Both documents carry identical capture lists.

## Actual predecessor premises

Both saves contain four rival businesses, `studio-aca408ec-r01` through `r04`. At week 0 each has its actual initial period `[fromWeek: 0, throughWeek: 0]`. At week 53 **all four**, not merely one, have two periods: `[0, 51]` and `[52, 52]`. Every period has the original 15 movement keys; the second period opens at the first period's exact closing balance. This satisfies the producer's multi-period witness requirement using generated history.

Directly checked every business and every retained period in both decoded states: no `costCutting` field, no `facilityDemolitionRefund` movement key, and no Hollywood receipt with kind `facilityDisposed`. Existing histories remain present. Week-53 receipt kinds include actual film and laboratory commitment/operational history; their presence alone is not a disposal eligibility proof.

## Writer neutrality and current public validation

For each capture, the executed producer asserts live version 45, records canonical input state, calls `makeSave`, calls public `validateSaveV45`, and compares the input state with its original canonical bytes. It then uses `exportSave`, `importSave`, and public `validateSaveV45` again, checking complete reloaded-envelope equality before compressing. The inspected Save45 writer validates before detachment (`src/core/save.ts:6590–6594`); exporter/importer also use the public validation path (`:6607–6630`). Successful `MINTED` completion proves those assertions completed on these exact output bytes. No independent engine validator was run by this reviewer.

The producer writes captures only after its postflight, to the pre-named external directory with exclusive file creation and an ancestor canonical-path check. The original fixtures remain outside this review and are not replaced. The next gates still require actual Save46 source, the reviewed migration/refusal tests and valid controls; in particular these predecessor bytes cannot establish a later valid-disposal/tombstone aggregate control without its own admitted state and observed eligibility.
