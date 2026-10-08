# H mirror independent observed source review r1

**ACCEPT_OBSERVED_H_MIRROR_SOURCE_ONLY.** The recorded materializer lane and independent full-byte readback lane each report actual child exit 0. Materializer result SHA is `b8c70f731fc730cea3ba7238674fb964fb973e6ffcf58fcb03e0dbbd139196b6`; independent readback SHA is `3f6d44077337a176a1a5d713285f26453c95559f555f69fd3a45336988bf9932`.

The readback checked all 1,342 historical Git source files (98,114,949 bytes) against commit 8708d6 Git blob OIDs and modes; checked four exact r10 overlay SHA-256/size/mode pins; and rejected any extra, missing, symlink, hardlink or special mirror entries. The finished mirror has 1,344 regular files and 98,158,847 bytes. It also checked source/result/manifest identity, AC, 3 GiB floor, clean production f8/src13880 and remote production ref. The heavy-lane lock is absent. This is source mirror admission only; full-era types, diagnostic collection, 416-tick neutrality and C0 attribution remain pending.
