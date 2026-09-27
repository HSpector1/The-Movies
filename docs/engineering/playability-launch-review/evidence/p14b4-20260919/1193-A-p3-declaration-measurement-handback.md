# 1193-A — Independent projection54 declaration measurement

Source-only handback prepared at `b3061980bc8f5d128085e86dd67f31f26a310421`; no project imports were evaluated, compiler/render/gameplay run, test expectation changed, index modified or commit made by this author. Parent executes only after source review and publication. Old1075 producer and1047 outputs remain unchanged and are explicit frozen inputs.

The new producer calls the existing generator for exactly the eight positive union fixtures twice each (16 renders). It requires literal byte equality for each pair, the six original fixed hashes unchanged, and equal F10/F11 measured bytes/hashes. Only the prior whole-current body hash4ab41413… is present, taken from actual1047; the new value is deliberately absent. No expectation is copied from1190's failing assertion, and no test pin is updated here. A changed current body is required, while all fixed positive bodies stay exact.

Known inputs are projection54/protocol4, schema `sha256:9c5bba3fcc58e857fe57e33623a86f096cd04e00547bea8f2dae3a656025b302`, generated C#867,401 bytes/891b8f97…, generated schema396,058 bytes/745d9f0c…, and generated manifest ecf51c77…. These are independently read checked-in source/artifacts, not the declaration output being measured. The generated C# file hash is explicitly labelled not a declaration-body hash.

## Guards and finite output

The source manifest pins the producer, local compiler config and exactly17 inputs: generator source/CLI, schema owners, union fixtures, still-unmodified generator test, generated outputs, package metadata, old1075 and actual1047 raw/record. Its exact SHA is supplied as a separate environment argument. The producer verifies every size/hash before rendering and again after all renders, and verifies the manifest itself at both ends.

The parent supplies the actual published run HEAD through `P3_DECLARATION_EXPECTED_HEAD`. Source preparation does not hard-code the publication HEAD or index. At execution, the producer requires that HEAD, an empty consumed diff and no untracked consumed path, then compares HEAD/consumed diff/untracked paths/raw Git-index hash before and after. No Git operation refreshes the index. Producer bytes and all inputs are rechecked. A later docs-only publication is allowed if the parent supplies its actual HEAD and every pinned input still matches. Maintenance before measurement would change a pinned test and correctly refuse.

Only after all gates succeed does the producer print one bounded JSON object (at most1MiB) with the source/manifest/input/producer identities, all measured pairs, six fixed comparisons,16 renders, actualTicks0 and completion marker `ALL_EIGHT_POSITIVES_MEASURED_TWICE_SIX_FIXED_UNCHANGED`. There are no file-output writes, source changes, simulations, automatic retry or alternate fixtures. A thrown failure remains in the parent recorder without a completion result.

## Exact parent invocations

The local config extends the unchanged Bridge compiler options and names only this producer as its explicit root; imports supply its real generator/schema/fixture graph. It does not change a project configuration.

```text
node_modules/.bin/tsc --noEmit -p docs/engineering/playability-launch-review/evidence/p14b4-20260919/1193-p3-declaration-measurement.tsconfig.json --listFiles
```

Parent1195 must record the producer's inclusion in the compiler output, preserve all diagnostics and independently check the three manual producer/config/manifest pins before and after, because documentation sources lie outside recorder SOURCE. This is only a prepared command, not a compiler result.

After that gate and independent source review, parent1196 uses its actual then-published HEAD (the sole placeholder below), keeping the literal reviewed manifest SHA:

```text
P3_DECLARATION_EXPECTED_HEAD='<parent-verified-published-HEAD>' P3_DECLARATION_SOURCE_MANIFEST_SHA256='1d8a36b05ed40ebc59d2a4b86c83816e85244db59a2424876a0eb7d9a8e0d97b' node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/1193-p3-declaration-measurement.ts
```

The parent fixed-source recorder retains stdout/exit/source evidence; the producer additionally owns its docs/input/index guards. Parent must retain independent before/after producer, local-config and source-manifest hashes for both compiler and measurement even when either child fails. The producer's own postguards are reached only on its success path; a thrown failure never substitutes for the parent's failure-path manual guard record. An observed completion may support a separately reviewed1197 pin amendment. It does not qualify Unity compilation/runtime, native rendering, general generator performance, the failed neighbors or any gameplay. Neither this source nor its output can erase the failed1190 evidence.

## Frozen source identities

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `1193-p3-declaration-measurement.ts` | 9210 | `e722091ae8d0cd511b167181bf18387d4a935befcfad9087eadda56443ae37cb` |
| `1193-p3-declaration-measurement.tsconfig.json` | 179 | `f27e9f6718abcdeaae1b244b4ea5b0aa8142a2ecfbd17e2cf17a372b17d2a2f5` |
| `1193-p3-declaration-source-manifest.json` | 4291 | `1d8a36b05ed40ebc59d2a4b86c83816e85244db59a2424876a0eb7d9a8e0d97b` |
| `1075-c3-declaration-measurement.ts` | 6877 | `21188b750289ad4e51e337b2346cdfff706fbb817b79c2526a49f7b24c85c54b` |
| `1047-c3-declaration-measurement.txt` | 5257 | `f4c3ebe25248af2a48622900f0bbcb0850ec831e52855fb55ed388dad36b069e` |
| `1047-c3-declaration-measurement.json` | 718 | `40c85d11bb3edeceb4cec7ad72ee40cfc621d0eac9649168e24437718f3c3f6d` |
