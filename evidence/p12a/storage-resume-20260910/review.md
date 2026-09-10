# Independent R05 recovered storage continuation

**Engineering continuation: PASS for the bounded assertions below. Native acceptance, packaged-app memory acceptance, and the original uncompressed storage/performance targets remain OPEN or MISS.**

Executed 2026-09-10 16:11:32–16:14:49 UTC by the read-only recovered-storage reviewer. Root remained the sole worktree editor and native-input owner. No worktree edits, native input, HTTP server, full-endurance regeneration, or original-fixture overwrite occurred.

The source fixture was a private copy of `/tmp/p12a-storage-integration-6s4KkV/library.storage.json`, SHA-256 `d10a8187935b12d7e5bcb5e05a01e76c0649cbf3abc176228f7842b6785730df`. The original fixture was verified unchanged afterward. It contained three separate Save As records from the same synthetic world: A at week 8788, B at 8789, C saved at 8790, with active working progress at 8791. This does not prove three independently seeded New Game campaigns or native UI behavior.

The esbuild bundle binds 106 imported source files. Every before/after source SHA matched. Combined source manifest SHA-256: `8e23a07418050ba553a9fde2cb1fc0892e23964f55c5a972ac083b75f69772e2`. Bundle SHA-256: `41d9edb105dafd60d4217852e8bac1faa7e2d47f5ffee15c37c3a59418ce4f5d`. See `binding.json`, `source-before.json`, `source-after.json`, `metafile.json`, and `probe-source.ts`.

The source used a 192 MiB decoded checkpoint bound and 64 MiB journal bound, retaining 512 journal entries, 32 named records, 256 MiB encoded library capacity, and 1 GiB aggregate decoded storage capacity. These are representation/capacity settings; receipt bodies, current/saved authority, inner V19, and outer checkpoint 1 were unchanged.

Assertions completed without any fatal error:

- Recovered the exact three named records and distinct current/saved slot hashes without rewriting already canonical storage.
- Completed the previously failing campaign Save at week 8791. Its current and saved bytes matched exactly; A and B remained byte-identical.
- Advanced through actual available `advanceWeek` intents to 8792 and 8793, preserving the saved slot and player RNG.
- Exercised ordinary `/save` at the journal bound. It explicitly returned `SESSION_MISMATCH`, durably rolled the logical session, and preserved both unequal slots. A request using the refreshed session then saved the exact current state.
- Replayed that `/save` after a later tick and again after restart: exact canonical response SHA `91a52975de200584e04e0e13d80016063cd89490c03a6ed2de2d78b063ceda71`, historical week 8792 retained, `firstSeen=false`, no disk write or authority change.
- Injected a campaign Save precommit write failure. Rejection was `STORAGE_UNAVAILABLE`; complete disk hash, logical session, catalogue revision, both slots, and every named record remained unchanged. Retrying the exact campaign request after storage recovered succeeded.
- Restarted and replayed that campaign Save's exact durable receipt, again without changing the library.
- Loaded A, B, and C and compared both authoritative slot digests to their selected record, retaining all record bytes. Final dates were 8788, 8789, and 8793 respectively.

The synthetic store used file write, file fsync, rename, and directory fsync. It deliberately injected a precommit failure. It did not exercise the production checkpoint store's ownership lock or uncertain-restoration branch; separate existing store tests are needed for those boundaries.

Observed timings under contention:

| Operation | Seconds |
| --- | ---: |
| Initial three-record recovery | 17.744 |
| Campaign Save at week 8791 | 18.603 |
| Two later advances | 8.075 / 7.488 |
| Ordinary Save session rollover, then retry | 8.130 / 5.579 |
| Restart retaining save receipt and later current | 20.740 |
| Injected failed campaign Save | 22.617 |
| Exact Save retry after storage recovery | 22.133 |
| Restart after durable campaign Save | 18.542 |
| Load A / B / C | 10.011 / 7.606 / 8.080 |

Node was v26.3.1 with `execArgv=[]`, no explicit GC, and default heap limit 4,395,630,592 bytes. Maximum RSS sampled at operation boundaries was 4,998,578,176 bytes; this is a lower bound on process peak, not a full sampler maximum. It includes the probe's comparison work and buffers, and is not packaged-app RSS. Concurrent vitest workers were observed; root could also run Unity EditMode, whose precise overlap was not independently timestamped. These measurements do not establish isolated performance acceptance.

The final encoded library occupied 63,025,258 bytes; the intermediate saved-receipt/unequal-slot library occupied 70,789,884 bytes. Retaining the accepted Save receipt increased the working decoded checkpoint to 134,753,428 bytes, directly exceeding the old 128 MiB checkpoint limit. The new bounds remove the observed capacity failure without dropping exact receipts or permanent game history. Original 8 MB/uncompressed-per-film targets must remain visibly MISS unless an explicit measured rebaseline is recorded; this review does not turn those targets into a pass.

Timeout implications remain concrete: observed advances exceed the previous 5-second ordinary POST deadline; campaign Saves exceed the previous 15-second deadline; recovery exceeds the packaged supervisor's previous 20-second startup deadline and the native runner's effective ~10-second readiness loop. A bounded 60-second mutation/readiness allowance and a 90-second runner Quit allowance are reasonable compatibility corrections for this measured fixture, retaining exact retry identity, fresh authority joins, explicit timeout reporting, and Quit only after its own matching durable receipt. They do not substitute for real-client large-world latency and memory evidence.

The surviving `report.json` is the machine-readable result; `probe.log` records each operation. `library.storage.json` and `ordinary-save.response.json` are synthetic private evidence and should not be published with a candidate. The hook remains explicit-checker fallback; this engineering run provides no hook activation evidence.
