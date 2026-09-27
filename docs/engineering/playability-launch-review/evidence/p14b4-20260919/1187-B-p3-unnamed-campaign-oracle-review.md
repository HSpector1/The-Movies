# 1187-B — Independent D17 oracle amendment review

**KEEP the exact test-only amendment and D17-only verification selection.** Read frozen1187-A/C, the complete one-hunk patch and manifest, and the unchanged campaign-library contract. The actual1185 failed expectation remains preserved by1186; this correction supplies no production persistence defect or new successful runtime result. Reviewer used read-only source/Git and standard-library byte checks only.

After the same accepted initial SAVE, the new block requires an unnamed library (`dirty:true`, null active ID, empty public records). It decodes the actual stored working checkpoint through the existing strict codec/full39 helper, checks current and saved weeks52, exact current/saved raw equality and the original bound P3 root. The original first SaveAs then establishes the named record and must report clean with its actual ID. This matches `initialCampaignLibrary`, `campaignDirty` and `withWorkingCampaignCheckpoint`; it strengthens the real save-slot proof instead of removing the failed concept of cleanliness.

The additional calls are read/inspection assertions only. Every command, command-ID allocation, order, game action, input, route/counter limit and timeout remains exact. Independently reversed the sole block to reconstruct all45,268 published baseline bytes. The complete39,644-byte prefix before D17, SHA256 `e4b76e740f7f4953c6142cb3607c070973d3fc4657003dfcea377a2008717037`, is literally unchanged, including all shared helpers and both passing D15/D16 bodies. Three declarations and three60s timeouts are unchanged. The live source diff is literally the frozen patch. All ten1179 production-manifest entries still match; no production or generated change accompanies this amendment.

The exact `-t D17` selector matches one declaration. It does not depend on D15/D16 having run: prior53 controls run first, then `bound52()` invokes captured45→attached45→bound52 itself. A complete selected run therefore still has seven session advances and two coordinator advances, expected9/hard12 with three separate headroom slots. Attachment replay plus SaveAs and post-restart LOAD replays make three expected duplicates; no waiver phase runs. No result is predicted. Root config excludes this Bridge-prefixed test and UI config does not include it; Bridge types are the relevant changed-file gate. Existing UI/root/generated check results remain separate fixed-source evidence.

| Frozen artifact | Bytes | SHA256 |
|---|---:|---|
|Test postimage|45,878|`dbc4800046353a25d75261604e944b77c05e26c43d79ae4e856e23fb4aabf86d`|
|`1187-p3-unnamed-campaign-oracle.patch`|1,622|`5b85ea88a7cc9ac1bb5b3c1f2e7894a3f147779194cabbf8261fabe2a20175cd`|
|`1187-p3-unnamed-campaign-oracle-manifest.json`|2,823|`cdd113d08a4ca9a77a84bd446b5ea7badcbdea0d4dc67d647756f9dcd6dac1e0`|
|Author1187-A|4,297|`d7bc38860120760022954684b67818bb46606d48e08358893608bf444f8827e5`|
|Parent1187-C|2,069|`ec82248a379eea810e319c7c148159b9dafbfd5ecc5fd06357e221245fbb7603`|

A/C agree on the source scope, exact filtered command and retained limitations. The separately adopted neighbor selections need their own actual attribution; their outcomes are not inferred here. The unchanged D15/D16/UI passes remain attributed to1185/1186, with D15’s63.631s versus declared60s caveat preserved. The next filtered run cannot claim a new all-three-leaf, full-suite, hosted App, disk/native or timing qualification. No compiler/test/gameplay execution or source/index edit by this reviewer. Final review frozen; no later appendix planned.
