# Independent AG adoption archive build audit

Decision: **ACCEPT_BUILD_INPUT_TO_FROZEN_VERIFIER_ONLY**. This is a read-only static and retained-source audit. It is not an observed verifier result and does not authorize deleting source or claiming remote restoration.

- Frozen pin `/Users/zacheryspector/studio-scratch/1370-r12-ag-adoption-archive-pin-r1/PIN.json` SHA-256 `ff63ce64d711bd814982300cefa582d8b786303d7eebc2042f8b76e1243a1533`; observed adoption receipt `/Users/zacheryspector/studio-scratch/1370-ag-adoption-clean-observed-review-r12/RECEIPT.json` SHA-256 `92fb67ca3e8d954af25d840e48b7ed70aa8a3625950ebee501922f49c04fd50d`.
- Manifest `/Users/zacheryspector/studio-scratch/1370-r12-followon-ag-adoption-archive-r2/package/MANIFEST.json` SHA-256 `e07a92c662fa9ca19c5ec92baac85164bda4a2358cda27ab0e8ce56dc0253f35`. Its embedded pin equals the frozen pin, its inventory SHA matches `cd9d63d2be330d386bc1e29ff5101671aa9f4ce68431fd2d4f827c54e50efd88`, and its 232 member records equal the canonical source inventory byte-parsed as JSON.
- Independently rehashed all three regular archive parts: each size and SHA-256 matches the manifest; combined declared tar size is 146,718,720 bytes, SHA-256 `64e4591e80aa57a80c7ec5e219672a10b2be54580734b8da489ad7b208f4e099`. The frozen verifier must independently check combined tar bytes and members. Package directory contains exactly manifest and three parts.
- Independently re-read and hashed all 232 retained source entries, including the separate lane metadata file. All file bytes, types, modes, sizes, and symlink targets match the manifest. No source was removed or modified.
- Build lane metadata `/Users/zacheryspector/studio-scratch/1370-r12-followon-ag-adoption-archive-r2/build-r3.lane.log.meta` SHA-256 `f6638611eee9d3f12a034e8fb83942c9407add27c02289538886bf2a3d7af02a` records actual child 0, frozen r3 builder command, and exit 0. This does not substitute for the verifier.
- Frozen verifier command `/Users/zacheryspector/studio-scratch/1370-r12-ag-adoption-archive-pin-independent-review-r3/verify.command` SHA-256 `98c30c38e01a63ab6d247518932addeb2bfb5a57ba4cb55425f57b435d988366`; r3 verifier SHA-256 `75b13e206a46d223b2230ea7fde510b0acf36517ae3d944661f3346f5845c4b9`. Run this exact command under the one heavy lane, then separately audit its actual exit, output, package bytes, source retention, and remote byte restoration before any cleanup.

```sh
bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 '/Users/zacheryspector/studio-scratch/1370-r12-followon-ag-adoption-archive-r2/verify-r3.lane.log' python3 -I -B /Users/zacheryspector/studio-scratch/1370-r12-followon-clean-archive-proposal-r3/verify.py --pin /Users/zacheryspector/studio-scratch/1370-r12-ag-adoption-archive-pin-r1/PIN.json
```
