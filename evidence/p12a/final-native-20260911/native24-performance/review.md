Run24 Save returned its compact HTTP response in **10,542.0349ms**, from02:58:48.020203 to02:58:58.562160 UTC on2026-09-11. This is one actual native request, distinct from the fixed standalone20-sample Save p95 of9,577.75375ms. The original250ms target is not reassigned to the complete Save operation.

During that send-to-response interval,41 coherent passive map observations advanced from frame35,940 to37,680 (+1,740 frames) and generation2,396 to2,512. The largest observed new-map arrival gap within that subset was255.135ms. Save was displayed disabled and Resume enabled in every observed map. This establishes observed frame progress while Save was pending; it does not establish every frame's duration or test input responsiveness. It does not support calling the entire10.54-second wait a continuous UI render freeze.

Receipt UTF8 decode was0.0128ms and strict parse0.6081ms on Unity thread1. The subsequent fresh snapshot parsed for213.3815ms on thread20 and applied stored state/synchronous subscribers for40.287ms on thread1; later layout/render is outside that application scope. A new logical session with the same week8794 and digest was first observed Live at02:58:59.301833, about739.7ms after response. Save was first observed reenabled at02:58:59.811961, about1,249.8ms after response/11,791.8ms after request start. These map transition times have sampling uncertainty. The root's later02:59:04.029 Saved capture is a separate observation, not the exact completion instant.

The existing30-second frame window was02:55:52.046355–02:56:22.050329 UTC after45seconds warmup, with4,878 frames, median5.598ms/p958.504ms/max85.573ms. It has **zero overlap with Save**. It maintained authority continuity and zero transport outages, but recorded1,368 nonLiveFrames and ended in Reconnecting; progressing joined snapshots and repeated handshakes must remain disclosed. This frame distribution is not Save-time frame evidence or an uninterrupted-Live claim.

The passive observer read only the exact approved map and existing runtime-performance report. It recorded758 coherent map observations over195.106seconds,7 read-race/parse exclusions,1,347 skipped published generations, no frame regression and no source changes. Publication every15frames and polling every250ms necessarily miss intermediate frames. The largest observed arrival gap across the entire observer span was759.164ms; file races/observer scheduling prevent interpreting that as an identified UI stall. No HTTP, screenshots, raw-save reads, native input or game/process mutation occurred.

Observer PID91669 exited automatically at02:59:26.982 UTC after app exit; session56348 returned0 and PID absence was checked. The native report independently records observation-complete/ui-quit, player exit0, clean input and clean supervisor cleanup. Final performance captured through Quit, droppedRequests0, SHA `38ea748144a5f356f31c4fca20bc890e26591f110f101917112d0b1f2c9ac119`. Aborted run23 was excluded.

Evidence:

- [Raw passive comparison](/private/tmp/p12a-native-passive-p6iumyes/passive-review.json), SHA `de3d1f8025de9110420a9dde8a122c47cdb006445e96d6cc0daadeb31e437036`.
- [Post-receipt joined-state/phase evidence](/private/tmp/p12a-native-passive-p6iumyes/post-receipt-review.json).
- [Private raw map samples](/private/tmp/p12a-native-passive-p6iumyes/maps.jsonl), [observer result](/private/tmp/p12a-native-passive-p6iumyes/observer-result.json), and [source binding](/private/tmp/p12a-native-passive-p6iumyes/source-binding.json).
- [Native run24 report](/Users/bruce/The Movies - P12A Living Hollywood Unity/Evidence/P12A/early-2026-09-11T02-54-45-401Z/report.json).

This bounded observer supports the stated Save/progress distinction. Root-owned native acceptance, later relaunch and independent campaign proof remain separate.
