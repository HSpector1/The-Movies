# Independent completed natural G-L subset review

Disposition: PASS for the measured natural K3/G-P comparison and reported natural-route measurements. Full G-L/F6 closure remains incomplete: the separate lawful post-2040 player-release route is not measured here. No retune trigger was found by this probe's adopted two-seed rule.

## Identity and evidence

- Source HEAD: `d5e2dad1e23183f1a94fe7b7d30e65ed88617f34`
- Source tree: `88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837`, equal to the 1367-K type-qualified archive source tree.
- Result out/gl.json SHA256: `7ddb636898d9aed1bf518c29cf7de3db678944cdc396b61d96f48227b6b3995a`
- Probe SHA256: `1a57343fe78e1e8d2c4de290c4725201f20b03be0e4e59f68c7db21689e74476`
- Adapter SHA256: `71faf4d254370acfb3ebdb00d88014e0b7541b05f87323e1678fa5660fd40f62`
- G-P reference SHA256: `5ca908b3d4d9ff538d2b17cdd4fd7db6703e1d40c369751daf0acdb7383882d9`
- Reviewed wrapper SHA256: `4332fcde7dcf8ef2adbedf8693480cf2bf0127cdb8e7f7b29c96658a7d9ff483`

run.meta records 2026-10-04T23:51:51Z through 2026-10-05T00:05:44Z, child exit0. Parent separately confirms the wrapper session closed exit0. This distinction matters because run.meta writes completion before wrapper source postchecks. Static wrapper inspection confirms pre/post HEAD and clean bounded-source checks, archive-only execution, disk guard and power logging. This is the reviewed scratch measurement wrapper, not a claim that it emits the five-file bounded-source recorder set.

Independently verified all 191 archived source/config files against the named Git object's blob identities, plus copied probe/adapter/reference hashes and GP-SOURCE.txt against the preserved hash manifest. Runtime node_modules is shared infrastructure; this review does not establish whole dependency-tree byte immutability. No fixture tree was traversed.

## K3 comparisons and bounds

Both routes reached week6240 and report equality with the historical G-P canonical manifest and with the independent adapter on the same state. I independently recomputed each canonical SHA and byte count, compared the full canonical strings to the preserved historical reference, removed exactly the five declared stamp fields from the stamped result and checked equality, and recomputed structural caps, domain tables and holder membership from the retained manifests. The independent-adapter comparison is an execution assertion in the reviewed probe; it was not rerun by this reviewer and the full game state is not retained here for a second reconstruction.

| Natural seed | Canonical manifest bytes | Stamped bytes | Freeze tick ms | Total refs |
| --- | ---: | ---: | ---: | ---: |
| p13a-core-causal-01 | 42,495 | 42,623 | 49.103 | 332 |
| seed-b | 67,304 | 67,432 | 249.331 | 666 |

Both have ten source domains, ten studios, eight archetypes per studio, at most twelve references per archetype side/lens, and the remaining lens/count-key caps pass. Approximate 140 KB prose is not treated as a hard acceptance threshold. Both manifests preserve corporateCondition and marketAssessments as notRecorded, not zero-valued recorded achievements.

Canonical hashes are `9651de7f1cc71f8e353f670a2560e8540f1c2b58d95e7930bfe7466e3ba3d432` and `e34f8023276f93a8d9eef326440092ba2f23892c3897a0b035a0b5044d04f560`, respectively.

## Save-call samples and limits

Each row below has three actual samples. Independently checked sample count, positive measured values and combined = makeSave + additional validation. Medians are separate column medians, not a sum of medians.

| seed-b week | makeSave median ms | Additional validateSaveV45 median ms | Combined median ms | Serialized save bytes |
| --- | ---: | ---: | ---: | ---: |
| 6240 | 3,903.865 | 1,555.147 | 5,684.208 | 33,541,463 |
| 8791 | 7,859.726 | 2,737.762 | 10,882.878 | 41,261,217 |

makeSave ranges are 3,528.488–5,013.491 ms and 7,821.112–8,402.775 ms. Additional validation ranges are 1,396.022–1,780.343 ms and 2,281.242–3,023.151 ms. Combined maxima are 6,409.513 and 11,140.537 ms. makeSave already validates and detaches; the second call is extra validation. Size serialization is outside those timers. These observations are not full Bridge-step qualification and must be assessed against actual applicable execution budgets without inventing or relaxing a threshold.

The seed-b extension reaches8791 with the official stamped Legacy unchanged. It has zero player contracts, active productions and releases, cash −111,865,000, founding closed and managed operations. That route cannot satisfy the postrelease requirement merely by reaching a late week.

## Retune and closure disposition

Recomputed holder counts across both manifests agree with the emitted retune table. There are no triggers under the reviewed rule. Resilient-survivor is explicitly exempt because corporateCondition is notRecorded; awards-dynasty also has no recorded outcome in either seed and is not turned into a false zero-holder achievement. The result does not claim these absent domains have been exercised.

The emitted measuredSubsetPassed=true, closureComplete=false and post2040PlayerRelease=not-measured are mutually consistent. Preserve them in downstream evidence. A separately qualified operating trial/full route must establish a real post-2040 player release, frozen official continuity and paired timing evidence. Its activity cannot retroactively broaden this natural subset.

No new runtime, Node, tests, types, fixture payload reads/scans, production source/index/HEAD writes or nested agents were used for this review. Lightweight Python parsing, hashing, arithmetic and read-only Git object inspection only; this authorized scratch report is the sole write.
