# r12 follow-on clean archive code r3 — independent static review request

Do not execute `package.py` or `verify.py` on any source leaf yet. R2's earlier static ACCEPT was explicitly withdrawn by the independent correction report SHA-256 `dd2b0ff509d492dcd5040fb0ebca6ec6dd0b0d031a2cd96a6e53cc209ffc44a7` and receipt SHA-256 `2ac5c722faced853cbbe78be5997ed2bfea445ca7ab784270646504f4169ad21`. R2 never built an archive. R3 is a fresh scratch-only code freeze that changes exactly one line in each r2 Python program:

```diff
-    leaf = f'{role}-clean-r12-{run}'
+    leaf = f'{role}-clean-{run}'
-    leaf = f'{role}-clean-r12-{pin["runId"]}'
+    leaf = f'{role}-clean-{pin["runId"]}'
```

The run ID already contains `r12-`. For the actually observed AG adoption run ID `r12-ag-adoption-clean-20261007-1850`, both programs must derive `ag-adoption-clean-r12-ag-adoption-clean-20261007-1850`, the existing target/outer leaf, rather than a nonexistent `...-r12-r12-...` leaf. The same role/run rule applies to E0G p13a and E0G adoption. `static_selftest.py` reads the r2/r3 source files only, asserts the exact one-line deltas and AST parsing, and checks all three leaf spellings. It ran with `python3 -I -B` and produced `STATIC-SELFTEST.json`; it did not import or execute either archiver, inspect production evidence, or mutate a source leaf.

All r2 path hardening, role/run/head/source-tree/receipt pins, 48 MiB part and 3 GiB limits, fail-closed retention, and separate heavy-lane build/verify workflow remain byte-identical except those two lines. The r2 wire schema and output naming remain deliberately unchanged because this freeze is limited to the leaf correction; all three `1370-r12-followon-<role>-archive-r2` output parents are absent at freeze time. The copied pin template retains its r2 schema. A real leaf still requires a completed independent observed receipt, an exact per-leaf pin and separate review, frozen builder/verifier runs under the recorded heavy lane with actual child-exit checks, independent archive audit, GitHub publication, fresh remote retrieval, and only then a separately reviewed raw disposition. Failure/timeout labels cannot be repinned as success.

Review exact bytes of `package.py`, `verify.py`, `PIN-TEMPLATE.json`, `static_selftest.py`, `STATIC-SELFTEST.json`, this request and `PROPOSAL-MANIFEST.json`. Recompute manifest hashes; independently verify the two-line-only source diff and one concrete AG adoption leaf. Decision should be `ACCEPT_STATIC_ARCHIVE_CODE_ONLY` or `REFINE`, with no archive execution implied.
