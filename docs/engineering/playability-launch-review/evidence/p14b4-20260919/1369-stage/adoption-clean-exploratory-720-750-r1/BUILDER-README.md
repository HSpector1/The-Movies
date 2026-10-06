# 1369 evidence archive builder

`PINS.json` is an explicit source-path, SHA-256, and byte-count pin for each of 503 members. It was snapshotted after all four exploratory RESULTs and the independent pair review closed. `prepare_pins.py` can regenerate that inventory for comparison; a regenerated file is not an independently approved pin. The builder requires the reviewed pin file with `--pins` and a new scratch directory with `--out`. It fails before writing output if any source pin, RESULT/formal relation, required review, lane file, or critical pin differs.

```sh
python3 selftest.py
python3 archive_builder.py --pins PINS.json --out /Users/zacheryspector/studio-scratch/1369-evidence-archive-output-r3
```

The build writes `evidence.tar.gz`, `MANIFEST.json`, and `SCOPE.md`. The tar contains only regular files with sorted safe relative names and fixed metadata; gzip has no filename or timestamp. The manifest is outside the tar to avoid self-reference. Its tar SHA and each member SHA/length are checked on readback. A new output path is mandatory; the builder never replaces an existing archive. The classification is `EXPLORATORY_NOT_ACCEPTANCE`; these results and the descriptive comparator do not establish observed or protected acceptance.

The pin file includes absolute source paths solely to locate the frozen evidence; raw receipts retain their historical absolute paths. The tar includes the 420-file package with its two `node_modules` symlinks excluded, four full leaves, six review folders, comparator code and report, 20 formal raw files, and eight lane log/meta files. The Node, tsc, and Vitest entrypoint digests remain in the RESULT records. Run an independent source/readback audit before copying any archive into Git.
