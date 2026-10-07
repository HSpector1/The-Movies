# R12 independent RED and static review

Decision: **ACCEPT_STATIC_CLEAN_ONLY**, subject to the parent agent's adoption and creation of the exact bootstrap receipt. This is a static and synthetic review. No TypeScript, Node, Vitest, game simulation or heavy lane ran. No r12 type or clean leaf is admitted by this report.

## Frozen inputs

- `MANIFEST.json` SHA-256 `ed8826f5cdf563c4aceee2fc6a22dbe2263f6f705f43ec622cff281a52d9f703`
- `runner.py` SHA-256 `34150cd2d9261bbb5ec8477f3bcb8230691a4ef426fd842161318338c88ca92a`
- `outer.py` SHA-256 `59fb99b3fbda61817b562c9a3f107508772db3168772cd3a0faba97a114162c0`
- Exact command template SHA-256 `667f12dd71f791b6986707c3f83ad57fbe9c39dfc53c34e68bf55b30064cd442`
- Head `b995a83e5363a3843f9b902e08c2df4dd95840cb`; source tree `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`.
- Adopted operational amendment `1370-P-r11-lossless-capture-amendment.md` in the isolated evidence worktree; r11 RED failure report remains separate.

## Independent synthetic RED

`/Users/zacheryspector/studio-scratch/r12-red-synthetic.py` AST-extracts only `gzip_member_rows`, `verify_inner_row` and `verify_clean` from the frozen runner and invokes them on 417 independent gzip members. The synthetic baseline satisfies the row shape, ordered 0–416 boundaries, raw/compressed digests, eight progress weeks, two-test JSON and readback audit identity. It is a verifier exercise, not a game execution.

The baseline was accepted. The verifier rejected each isolated mutation: detached save state, owner, RNG, receipt count, proof, missing or extra field, save version, state seed, boundary order, missing or extra member, corrupt CRC, truncation, trailing junk, raw and compressed digest mismatches, asserted raw and compressed bounds, one-test JSON, and readback audit row count. The complete output is in `RED-RESULTS.txt`.

A forged `originalStateSha256` alone remains accepted by the Python verifier. This is deliberate division of work: the source-bound second Vitest test rereads every stored row in pinned Node and checks `hash(JSON.stringify(state))`, `hash(exportSave(save))`, owner projection, representation proof, RNG, receipts and terminal digests. The Python verifier requires two passed tests and an audit receipt that binds the same 417 rows and raw digest. The second test also uses `Object.is` to prove positive zero where Python JSON numeric equality would allow negative zero. No JavaScript test was run in this review; four fresh r12 TYPES_ONLY leaves must run first and a clean leaf must observe both tests pass.

## Static admission and guards

The complete package inventory equals its manifest: 409 regular files, 30 directories and two links. Eight command blocks cover AG/E0G × p13a/adoption × types/clean exactly once. Every command pins the same manifest and HEAD, authenticates package inventory before Python import, matches the review receipt to manifest/runner/outer/command SHA-256, and enters `outer.py` with isolated Python and no bytecode. Clean commands require a fresh r12 four-leaf types audit; the runner verifies each target and outer receipt, hash, status, arm, seed, manifest, source HEAD, mirror pre/post and actual child exit. R4/r11 types cannot satisfy this binding.

Each row is a complete JSON state, save, owner, RNG, receipt and representation record. Writer bounds are 16 MiB per row, 2 GiB total raw and 1 GiB compressed, with one gzip member per row and SHA-256 for both byte streams. Python checks member CRC, ordered 417 rows, every field and structural relationships; source-bound JS readback checks exact serialization and terminal projections. The original 416 natural weeks, eight progress rows, seeds, source arms, save versions, receipt-prefix tick assertions and observer probe remain. The runtime mirror is a writable copy verified byte-for-byte against the sealed arm tree before and after execution.

The reviewed caps remain 300/330 seconds for p13a and types, 720/750 exploratory for adoption; there is no timeout waiver. AC, 4.25 GiB preflight, continuous 3 GiB floor, 128 MiB combined log cap, Git clean/HEAD/remote/source-tree checks, pinned runtime/dependencies, group ownership and cleanup are present. The whole-recorder wrapper may exit zero while a child fails, so observed reviews must inspect target and outer RESULTs and the lane `.meta` actual exit. Any failure retains its own label. The r10 raw 1 GiB adoption failure is not retroactively admitted.

This review does not establish that fresh types compile, that a full capture fits the adopted caps, or that AG and E0G are neutral. Those require observed leaves and a separately reviewed gzip-aware comparator.
