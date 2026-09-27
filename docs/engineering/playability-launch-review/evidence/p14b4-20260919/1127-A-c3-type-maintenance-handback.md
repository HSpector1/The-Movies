# 1127-A — Two observed test-only typing corrections

Closed 1104 ran `node_modules/.bin/tsc --noEmit` at published `ab9f4923c40c6b9d93da5831b03b128aa83b4efe`, empty consumed diff, fixedSource:true, 2026-09-27 10:24:00.959–10:24:34.739 UTC (33.780 seconds), child 2. The complete diagnostics are:

```text
tests/c2a-m2-sets-save.test.ts(287,11): error TS6133: 'migrated' is declared but its value is never read.
tests/casting-sessions-save-v10.test.ts(325,22): error TS2552: Cannot find name 'GameState'. Did you mean 'GameStateV10'?
```

The candidate removes only the unused local alias in the second historical M2 branch; its actual `migratedSave` and `migrateToCurrentControl` calls and all assertions remain. It changes only the colliding old V10 fixture's type annotation to `GameStateV10`, matching the already admitted actual old substrate and other fixture annotations. No runtime value, command, tick, leaf, negative cause, timeout, compiler option or declaration changes. This is not a production correction.

Original 1123 staging, its manifest/patch and the failed 1104 record remain exact. These two new copied candidates live under `1127-c3-type-maintenance-stage`; their manifest records every live preimage and staged postimage. Parent may apply only after the current type series closes and exact preimages are checked. This author made no live source/index edit and ran no compiler or test.

Patch: 1,105 bytes / SHA256 `92779d40a431b9d7afd76a067f7fee002e315c79bd0575c1fb4286f53a6550f8`. Manifest: 1,385 bytes / `de1c103caa349b75774e2a3368c137a17dd1fec4685e6722dacab916af82b8e5`.

- `tests/c2a-m2-sets-save.test.ts`: 13,002 / `9dc028bd0db60dc1ead881616cd65380a53797fe6638954b89337a0743b3479b` → 12,962 / `d4f64a69f5445afee21c9901d468400d582db4a8aa073652a9e6efb6960b3841`.
- `tests/casting-sessions-save-v10.test.ts`: 11,872 / `8251dc249980306d9b1bff54370d1db3dcff716cdac001272a0135df165c1b32` → 11,875 / `3382a3c74b4a16b6d3e705a39323cb2871c6b79e926f469d36ae8d1bc442acb3`.
