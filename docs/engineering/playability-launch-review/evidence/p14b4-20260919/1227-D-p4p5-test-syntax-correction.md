# 1227-D — One-brace correction after the actual compiler failure

1228 ran on published `9aae8d850576851973420d94db9ceee5d388ad6d`, 18:36:58.662–18:37:05.342 UTC (6.680s), child2, fixedSource true, empty consumed diff/no untracked source, no signal/error. The complete raw contains exactly this diagnostic:

```text
tests/p14p4p5-opportunities.test.ts(326,1): error TS1005: '}' expected.
```

Raw: 412 bytes / `23de388a6f3cf447100088c297f8dd7b0ca9ecec259b5569db23432aab0d12cc`. Recorder JSON: 634 bytes / `1abfe6c36884a342f2f0c0cde09a5f314ba8ca24791cd468758de99fd86b5a8c`. Original raw, record, preflight, empty patch and all frozen 1227 artifacts remain unchanged. No runtime leaf, new-policy RED or old4/6 marker was observed.

I omitted the closing function brace for `proposed45()`. Its memo callback closes at original line147, but `attach()` begins before the function closes. The separately staged correction inserts exactly `}` plus LF after147. `draft()` already closes correctly at93 and is untouched. No test assertion, material term, fixture pin, timeout, selection, cache or tick guard changes.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| Original live and original frozen postimage | 21,701 | `d4ddf8823f951aa7aaf806da40e57d98da6e105e80138b35ee7d3d673181df89` |
| `1227-d-syntax-stage/tests/p14p4p5-opportunities.test.ts` | 21,703 | `73a358bafa523282e24abbac64748877eda4a4cdc934a40783a665c791e26005` |
| `1227-d-syntax-correction.patch` | 480 | `a3843bd68c16cf410d9cb0eff61d467d6fd9d46c73ecc493b74df58740c6773f` |
| `1227-d-syntax-correction-manifest.json` | 11,807 | `1549a654de1e776304a546605ca8f014d4a44d8b35fe741fd3acfc9be70c6687` |

Standard-library comparison proves the complete reverse edit recovers the original source. The entire four-leaf body tail, all names, 60s declarations, zero-advance guard/marker and old4/6 baseline code are byte-identical. All fourteen protected paths, nine authority documents and eight immutable inputs from the original manifest still match. The live test remains the original erroneous preimage; only new evidence artifacts were written.

I re-read the complete source and the relevant existing public signatures/types. No other concrete syntax/type issue was identified by that source inspection; it is not a compiler pass. No compiler, parser/project import, test, gameplay, index mutation or live edit was executed here. Parent will integrate only the reviewed two-byte change and run a separately numbered root compiler before the initial four-case observation. Original1228 stays failed. The later1232 shared tick-guard/counter plan is entirely outside this correction.
