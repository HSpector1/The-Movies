# Independent old-era period capture review

Initial reviewed patch: `6ac52171a8b712d63cc8f752c7571a9b1781f2e32f1f4607d13915e8dee34bd9`.
Initial producer: `0ad3f8b34d628cded4f0f3b92dadc3e7790b0e8866e6b6bb54bfce9e4d6c947d`.
Initial handback: `e6ac270973465a4df70b689dabd4d4c4ef0aa87c30168efd21dceed6a54483c1`.

Disposition: one narrow reader-neutrality evidence correction requested; otherwise the bounded preparation is consistent with the stated route and consumer. No execution or witness is approved as already observed.

## Required correction

The first archived validateSaveV26 is called before inputBytes is captured. A mutation during that call would become the baseline rather than fail neutrality. Parse once, snapshot the parsed value before archived validation, and compare after archived and current validation; assert the validated reference is the original parsed object.

Likewise validateBoundary currently records envelopeBytes after explicit archived validation. Snapshot immediately after makeSave and compare after each reader. Preserve a before/after envelope snapshot around final readers and exporters too. Existing makeSave input-state checks and per-tick input checks should remain. These corrections strengthen the claimed evidence without changing the three-tick route.

## Static checks and source findings

The exact archived source `ce6945d58257f70c1b222a8c00e06038db73f6e4` exposes LIVE_SAVE_VERSION 26, makeSave, public26 validation, stableStringify, exportSave/importSave, and tick(state, optional options). The producer invokes only the archived default tick three times, to 310, 311 and 312, starting at the pinned week309 input. The current Save45 module is used for public26 validation/export only, not tick, makeSave or migration. Original and current source roles are separately recorded.

Archive validation compares the entire named src inventory with original ordinary Git blob entries and checks each blob identity. The external archive digest binds ordered path/blob/SHA rows; pre/post checks repeat archive verification. Automatic recursion is confined to archive src. The exact two named payload/provenance inputs are separately pinned; no fixture discovery is introduced.

Current source identity binds accepted HEAD, bounded clean diff, untracked consumed source, index and staged entries. Explicit named scripts/inputs must be tracked ordinary files without symlink ancestors, and script hashes are supplied independently. The original recorder still must supply remote publication, disk, lane and outer pre/post guards; the producer does not independently perform a remote fetch or replace those requirements. Dependency package metadata hashes are retained, not a claim that every installed dependency byte was independently pinned.

Output is one fixed fresh external directory, disjoint from both source trees. lstat detects existing dangling symlinks; ancestor symlinks refuse; directory creation and each file write are exclusive. Successful output names are exactly the capture gzip, MANIFEST.json and RESULT.json. Gzip and manifest bytes are rehashed; result binds the manifest digest. Parent must independently pin result artifacts before adoption. No cleanup/overwrite fallback exists.

The manifest matches the reviewed consumer's historical generating HEAD, format, input raw hash, three-tick interval, producer/archive digests and capture name/hash fields. Last-period evidence proves only the old-period boundary premise. It does not prove the separate test can afford a lawful V27 admission. ABSENT remains exit2, errors exit1, external timeout exit124; none permits artifact adoption.

The dedicated config introduces no gameplay aliases/plugins. The TypeScript project explicitly includes producer/config and inherits strict root settings; actual type checking remains required. Archived module shape annotations are assertions requiring runtime verification, not compile-time proof of that archived source.

The watchdog accepts only the exact named command, starts an owned child session, uses a 300-second bound, sends group TERM, polls/reaps the leader while checking the group, then sends group KILL after at most five seconds even if the leader already exited. It does not target unrelated groups. The final wait reaps the leader. Outer recorder remains responsible for timeout/postflight evidence and must stay alive. No relaxed game/test acceptance deadline is introduced.

## Limits

No Node, test, type check, producer/watchdog execution, archive generation, fixture payload read, fixture scan, active G-L output read, production source/index change or nested agent was performed. Only named source/code and archived Git source were inspected. The exact raw/gzip/provenance pins and actual route still need parent-controlled validation; no capture or affordable admission result is claimed.

## Final corrected revision

Disposition: PROCEED with bounded execution preparation; the requested neutrality correction is resolved.

- Patch: `2e28d9245e761b945d5bdad80e7cf430078cc6f834d98d07eff57671c5f22b17`
- Producer: `84643aa7517682b1c090fd74581419c30fa5e3bed02a52f30ff96536ba53ef86`
- HANDBACK.md: `b9da1587248b9da4059086ed71d01dad2ca6ee7a5ac1d911818e2c3244ee5f9e`

All manifest hashes match the current artifacts. Config, type project and watchdog hashes remain unchanged. The parsed input is now snapshotted before its first archived reader; each explicit archived/current reader checks returned identity and unchanged bytes. Boundary envelopes are snapshotted immediately after makeSave. Final writer, readers, exports and re-imported envelope checks retain their own before/after comparisons. The original three default ticks, named inputs, output scope and no-repair policy are unchanged.

All prior limits remain: installation/type checking, independent input/archive pins, exact published current Save45 HEAD, sole lane/disk/outer recorder gates, actual route capture, zero exit and postflight, independent output review, and the separate affordable V27 admission premise still require parent-controlled work. No runtime or fixture payload inspection occurred in this recheck.
