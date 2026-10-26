# Declaration measurement postflight audit

The actual declaration child and lane wrapper both exited 0. HEAD matches selected `0e0cdfde48d5dca06437c711e03a4f9f1a37360f`. Independent read-only hashing verified all 45 source/input pins and all six preflight pins, including the separately pinned metadata-adjusted producer. Launch was allowed at 10,769,228 KiB free. No owned measurement runtime or heavy-lane lock remained at audit.

Measurement reports eight identities rendered twice (16 renders), deterministic for each, with all six fixed historical positives unchanged and zero gameplay ticks. F10 and F11 each measured 473,809 declaration-body bytes, SHA-256 `df9a088d4edd52652fc4eab583a83b36c667a50d3fd14d0be4715eadeb2a6f74`. This is distinct from the complete generated C# file hash. The measured protocol 4 / projection 63 schema identity is `sha256:23a3092f1aadae0a5796fcfab93af36fe5551260685cdc2df128a93e670e24c1`; schema, generated C#, and manifest file hashes match the frozen source manifest.

No measurement blocker found; release this checkpoint freeze for the coordinator to align the generator-test pins with these measured identities. This is producer identity evidence, not full consumer-suite or native execution acceptance. No tests, compiler, generator, or source modifications were performed by the reviewer.
