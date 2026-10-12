# P15B modern Legacy r5 prerequisite checkpoint

This preserves the first four-file modern Legacy implementation delta and its actual failed prerequisite run. Production remains Save47; no source landing or runtime acceptance occurred.

Reconstruct r5 by applying this directory's `DELTA-vs-r4q1-red.diff` after the already published `../P15B-legacy-red/PATCH.diff` over Save47 d68d4b13b454922cf84eff5c0c73cae3e780eebe. The resulting140 postimages are in MANIFEST.json; full local r5 PATCH SHA256 is e14e9d9b2b841c49ea4e9c077a9b8f2d29264062fdb3ab2cbff47f17cf4239da. Do not apply it over production without the remaining repair/review/qualification.

Root TypeScript exited2 after64seconds. The sole TS2379 is save.ts11571:58, predecessorDowngradeRefusals calling recoveryDowngradeRefusal with a modern root. That helper reads only hollywood; narrowing its input type is the proposed fix. An earlier review misidentified the call and explicitly corrects itself. The frozen reader's exclusion of v3 remains required.

The wrapper then exited97 at its post-command live-disk check: free2,686,116KiB versus3,145,728KiB livefloor after swap grew from2GiB to3GiB. Strict pre/post source/index/input freeze matched. No verification was interrupted. The14 runtime tests never launched. The next intensive job requires the original3,670,016KiB launchfloor; no resource threshold was lowered.

Independent source review found a missing modern-official closure-before-finale sequence guard and a minor explicit-v1 builder selector issue. Author is preparing a narrow type/API repair and a distinguishing ordering RED before adding the guard. Existing139 baseline and this140 packet remain preserved. The extra-premise diagnostic is reviewed source only: late6240-migration closure and simultaneous-player/two-rival inputs remain unmeasured. No source copy, save body or new fixture is exported here.

The finite soundstage preview is independently complete on branch wip/browser-soundstage-preview at9cc684f93e0185a53d36fc39e425f4e5a360f5ba, with resources released. Main P15B→P18 work resumed; source work continues while execution waits for resource headroom. Parent preserves the same single lane and GPT-6.1 Sol author/reviewer arrangement.
