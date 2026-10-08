# Independent r6 source review

Decision: ACCEPT_SOURCE_ONLY_UNRUN. Narrow repair accepted; no exact binding, adoption, launch or successful copy follows.

All eight source files authenticate against SOURCE-PINS fd420aa7ae75a542ce611426f2c4bacafd62c6a09103460d0c0f75d00ceff27d and are regular single-link mode0644 files. Recorder, supervisor and inherited synthetic tests are byte-identical to r5. Historical source role, floor/allocation/inode/metadata/tool/FD/protected-root guards and whole930-second supervisor/authoritative override remain unchanged. The accepted r5 source and observed failed copy remain preserved.

The production change is limited to owned exclusive-FD fchmod before writing and a bounded physical mismatch diagnostic. write_exclusive retains O_EXCL/O_NOFOLLOW. fchmod operates on the already-owned FD inside the closing context; failure closes it and invokes existing owned-new-file cleanup. It honors requested0644 and explicit0600 regardless of inherited umask without changing process umask or chmodding an existing pathname. Its existing no-external-same-UID-renamer assumption remains necessary.

Physical source admission is equivalent: source_manifest is constructed directly from the already-validated rows; the new expected mapping has exactly those keys and identical regular/type,0644 mode,bytes,single-link,SHA rows. Complete dictionary equality therefore admits exactly the previous key-set plus per-row equality condition. Extra/missing paths and any metadata/byte mismatch still STOP. Diagnostics expose only eight sorted relative paths, capped at512characters, and type/mode/bytes/link count/SHA with total mismatch count, never file content.

Source-controls RESULT c0489472a93f790f5680b1cf9f155fb6deef6e0afa962ce6d781c31ea9e5c5c1, all four log/meta hashes, parsed raw results and unique start/end records authenticate. Through the actual accepted helper077 environment: unchangedr5 RED4/8 exit1; r6 modes GREEN8/8 exit0; inherited11 exit0; xattr/explicit-FD5 exit0. Meaningful controls exercise default/private modes under077/022, actual-helper tiny physical manifest, existing-file preservation, injected fchmod failure closure/removal with neighbor purity and bounded refusal diagnostics. Global lane lock is absent. No tests were rerun by this reviewer.

R5 actual stderr established physical checkout refusal; the cleanup removed its historical tree. Independent tiny unchanged-r5 probe and helper RED demonstrate0600 under077 and explain that refusal, but no direct historical per-file mode capture survived. PLAN's mode explanation must be read as the verified reproduction rather than recovered deleted-checkout metadata.

Separate ref correction at the preserved observed-review REF-COMPARISON-ADDENDUM.json (9af45294f0f779e66bb2f3d1edc24e49281bc78cad09e02e041edd46a0115557) withdraws an invalid remote-map/local-show-ref comparison. No ref mutation during the copy has been established; STOP and cleanup remain unchanged.

Required next: parent replacement-source scope adoption; fresh independently reviewed r6 exact binding/procedure/launch; archived original plus five-field adoption; independent adopted preflight; parent-owned recorded copy; independent observed outcome acceptance. No automatic retry or witness/digest/source-freeze admission is authorized here.
