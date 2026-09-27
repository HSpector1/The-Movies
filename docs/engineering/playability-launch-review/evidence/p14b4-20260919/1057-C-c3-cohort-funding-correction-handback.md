# 1057-C — Fixed initial60M scenario handback

Frozen on published original-failure checkpoint `a3c50a384dd0f686eee4d1e3ae6c78f8e82351c2`, following parent acceptance of1057-A and independent1057-B KEEP. The author changed only the two1053 files' initial cash30M→60M, single ledger delta49M→79M, matching metadata/J1 title/financial literals, and one concise comment preserving the original1028 attempt. No other assertion, action, phase, timing or call limit changed. No test, compiler, gameplay, producer or probe was executed; no production, fixture, configuration, index or commit was changed.

| File | Original1028/1029 SHA-256 | Corrected SHA-256 | Corrected bytes |
| --- | --- | --- | ---: |
| `tests/helpers/p14c3-cohort-transition-fixtures.ts` | `8977f474ae81b9bce482fd5b3606c9e59bdd0ccb300d2ded3c2150593cb5a5ac` | `d725ef1e9f64968799f6dbca639e120021856f8da7dfd0e38ec83d5e9be74070` | 24,031 |
| `tests/p14c3-cohort-transition.test.ts` | `f4d2700e429e7f118baea5468d5a51765c1164276509ab19d35a9100f517bed2` | `6eb360074eeda2af33ee59a68ff724b421f493468c9e56dc8fbfbec2653c17f5` | 27,064 |

The exact two-file `git diff -- <helper> <test>` against a3c50a38 is3,642 bytes, SHA-256 `4c97ceb120f6e381269cf257b79350fa78d1a8cee6e690f616cb93b1086a4516`. The original1053 handback remains byte-for-byte unchanged at `f2c9f1ef114fa95b61232f69065f349ee5fba1c4973791cd86669c4fd1e3a09e`; its original complete739e1f0d patch and recorded1028/1029 results remain authoritative for the old scenario.

Original1028 observed4 PASS and5 FAIL after612 actual calls. The first cause was the third-renewal3212 D-12 refusal for a151,800 commitment; the other four failures reused that cached cause. None of the later117 weeks was executed. Original1029 root types passed. The reviewed1057-A budget supports a separate fresh initial60M/+79M attempt and explicitly distinguishes rounded refusal output from exact recorded cash; it supplies no new gameplay result.

The parent must run all nine cases fresh from the unchanged immutable2600 source, with the new single disclosed initial arrangement. No failed3212 snapshot is loaded or topped up. Exactly the existing one-route729-call maximum, all public actions/settlements/retirement/choice/release/cohort requirements, failure caches and stopping conditions remain. The new run records its own actual canonical funded hash and outcomes; the old four passes are not relabeled as passes under the new finances. No rescue or alternate amount follows from a future failed premise.

Parent-only command for fresh1030:

```sh
node_modules/.bin/vitest run --project core tests/p14c3-cohort-transition.test.ts
```

This literal/comment-only change claims no additional typecheck or gameplay execution by the author. The parent retains original1029 and the eventual final gates according to its verification plan. All consumed source is frozen pending the parent recording and independent diff review.
