# Interrupted consumer remainder audit

Independent hashing verified all 1,641 source/input manifest entries and all preflight pins unchanged. HEAD matches `5a730f42d5a66d22cba4808b5c642510c2f068bb`. Lane metadata records exit 143. Owned root PID 66427 and descendants 66562, 66566, 66569, 66570, 66571 are absent; no selected runner remains and the heavy-lane lock is absent.

The complete UI child exited 0 and its JSON reports 20 passed, zero failed/skipped across all three selected files. Maximum measured test bodies by file: LotScriptReviewPanel 1,293.502 ms; StudioLotScreen.script-review-receipt 3,534.209 ms; WorldFirstLotNativeScriptReviewAppAuthority 8,348.793 ms. These are measured functional results, not exclusive-environment timing qualification. The subsequent selected core/Bridge remainder started, then was interrupted without a terminal child result or complete JSON. No complete remainder result may be inferred from partial output.

Foreign Godot PID 66490 was observed at 20.1% CPU at 11:52:55, elapsed 50 seconds, overlapping the UI stage. Preserve the UI assertion success while withholding exclusive/timing qualification. Do not infer specific slowdown causality from the observation. Private process and host-sample inventories remain LOCAL.

Release the stopped checkpoint freeze to the sole coordinator. Repeating the completed UI assertions is not necessary to recover the unfinished core selection; any further runtime is separately controlled by fresh prerequisites and the user's exclusive-window instructions. This audit launched no runtime and modified no repository files.
