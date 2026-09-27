# 1216-A — Actual occupancy-boundary verification

**PASS for the three new controls.** The author read the complete closed 1214/1215 raw logs, records and preflight, then performed standard-library byte/marker comparisons only. No source was changed and no project code or test was executed by the author.

Both records identify published source `e3b7e4afe9871f4d042073ff5f09dad326141913`, unchanged HEAD at closure, empty consumed diff, no untracked consumed paths, `fixedSource:true`, exit0 and no signal/error. The preflight independently records exact local/remote equality, clean consumed and whole-worktree status at that preflight, and the exact three-leaf selector. This does not assert whole-worktree cleanliness throughout later docs authoring.

| Recorded gate | Actual UTC interval | Wrapper elapsed | Result |
| --- | --- | ---: | --- |
| 1214 `tsc --noEmit` | 17:52:13.643–17:52:47.403 | 33.760s | PASS, no diagnostics |
| 1215 core `-t 'D03(?:X\|W\|R) '` | 17:53:32.023–17:53:47.138 | 15.115s | 3 PASS / 17 filtered, one file |

Actual command argv uses the regex `D03(?:X|W|R) ` with a trailing space. Vitest reports file10.694s and total14.09s; individual D03X/W/R times are4.477s,1.067s,5.148s. All retain the predeclared60s timeout. There are no failure groups, primary diagnostic bodies, printed failure frames or unhandled-error reports in this run. The seventeen skips are selector-filtered existing leaves, not newly introduced skips or evidence of their execution.

## Reached controls

All actual setup/admission/census/purity premises and final semantic assertions passed. Every receipt below is revision6; the complete untruncated factual JSON lines remain in the original raw log.

| Leaf/query | Classification and exact bottleneck | inputsDigest |
| --- | --- | --- |
| D03X vacant, query52 | IMPOSSIBLE — `promises already made to this person exhaust the window` | `304bfa6a77f90ee8` |
| D03X occupied, query52 | IMPOSSIBLE — `no filming week inside the window can reach that many pictures` | `f4976e26897b23ee` |
| D03W vacant, query52 | IMPOSSIBLE — `promises already made to this person exhaust the window` | `54c5b8ca8229d700` |
| D03W credited, query52 | IMPOSSIBLE — same exact reservation cause | `7821213778ceba93` |
| D03R vacant, query147/due162 | FRAGILE — `the schedule leaves no spare picture inside the window` | `4feadc2b22ffc6dc` |
| D03R occupied, query147/due162 | IMPOSSIBLE — `retirement leaves too few qualifying production seats inside the window` | `d6809ca21e64f8a9` |
| D03R occupied, query147/due160 | IMPOSSIBLE — `no filming week inside the window can reach that many pictures` | `b3fbd33a8eb5ce07` |

D03X queried actual entered r01 for focus `authored-0006` while retaining the genuine player count2/progress0 bound `promise-0`. The complete actual union contained only that root; the test allowed additional lawful r01 roots. The player's real production `prod-0052`, start52/remaining8, held focus as lead, and its tuple remained in the rival query's `occupiedProductionSeats`. Earliest release61/fresh take66 misses exclusive due66. This is a real player-owned seat viewed from another issuer, not rival employment or a rival market win.

D03W queried credited Writer `authored-0003`, with the same real player reservation selected through issuer membership. The independent complete company-seat census was empty for the Writer and no occupied-production input tuple appeared. Both queries retained the reservation cause; Writer credit did not impose a false physical clock. The digest change after the real greenlight was preserved, not normalized away.

D03R used **actual state112** and actual `prod-0112`, start112/remaining8, with focus as lead. Its actual Actor record is announced104/effective156, and actual contract is52–156. The selected reservation census was empty. Public requested-Director admission was null at147 and returned `retirementAnnounced` at148 and155. **147/155/160 are explicit query-time arithmetic, not attained state weeks.** The state stayed112; no clock, retirement row, contract or production countdown was edited. The hypothetical start112/term52 interval does not claim a real contract could bind through164. Occupancy moved the lower-bound admission to155; uncapped take160 fits due162 but not due160, producing the independently observed retirement and physical causes.

## Exact counters and retained byte authority

Actual total is **116 advances =65 player +51 cancelAfter**, whose branch begins at actual61 and ends112. cancelBefore, waiver, lifecycle and rival counts are all0. D03X and D03W both observed the shared52 prefix; all nine final player/cache phases completed. Counter-equality assertions establish zero additional advances after each required cache returned. No fixture or downstream semantic assertion is masked in these three leaves.

The `1133-P3-LEGACY4` line, including its LF, is exactly **851 bytes / SHA256 `182cf54d3a2fbb8bb2fc55cf74e97e220923d634ef454b816d3770d12dcb055e`**. Literal comparison against both original1135 and closed1210 lines passed. Complete old P1/P2 drafts, receipt values/digests and RNG remain unchanged; this is stronger than comparing only their classifications.

The following half-open byte spans in the unchanged 1215 raw log recover complete lines including LF:

| Marker | Byte span | Bytes | SHA256 |
| --- | --- | ---: | --- |
| LEGACY4 | [640,1491) | 851 | `182cf54d3a2fbb8bb2fc55cf74e97e220923d634ef454b816d3770d12dcb055e` |
| CROSS-ISSUER | [1491,3770) | 2279 | `4c9bf5f1adf3060f44737fc8c022079c051cda8265edc3c570d0a3e9c9e7f91f` |
| WRITER-CREDIT | [3943,6010) | 2067 | `2a0f125604b8a9ee7b47491de5126fd041ad184b6423533632e207b922677bc8` |
| RETIREMENT-FLOOR | [6206,9446) | 3240 | `1573de3c044ad23fd3eab28007b58a1ea72a14d8024da75794ff71b2abc484f4` |

| Preserved artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `1214-p3-boundary-preflight.json` | 1285 | `1dc2ddfb9cf5ab43dda2224cb54dcdf1bf5886515fa7c017da6013a00e61e08d` |
| `1214-p3-boundary-root-types.json` | 603 | `c508429f84149cab769088cccfd9403221ca35f633b8c33dcc4db235bbb146cb` |
| `1214-p3-boundary-root-types.txt` | 319 | `fcfee452c169410ba3a3749fe7b29b7c92e7e57c7eb5eef71183b834c31c5457` |
| `1215-p3-occupancy-boundaries.json` | 707 | `99370d2fedcf43769d09e5da6e09c04a9b7c0db7ce7345c01a1e2118f746d6dd` |
| `1215-p3-occupancy-boundaries.txt` | 11356 | `97f92e0e8cb5b5834d6508755137b4b5c564ac4a71489ed2ed070d1693c53093` |

Both recorded patch files are empty, SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Current complete test is98,958B/`1bcbbe03552f5815c3e88fc1f0937ef51f37d7b84ca0f3bd8fd693f5058e2e16`; helper is78,674B/`389112bde75ccaab9e2d155a1df6e6dc279b78c7d6d531a582b04f27be5fba83`; promises.ts is97,928B/`ca7a6edb1a16f30de5ed8090a49822b501922388504502c662778a44d8635b19`. All match the frozen candidate/protection identities.

This closes the three bounded controls. It does not claim the twenty-case file ran together, a genuine rival-owned occupancy witness, historical post-take cast qualification, isolated slack closure, a resource certificate, a repaired fixed-rival route, native durability or full-suite success. Prior1210's fifteen-leaf result remains separate preserved evidence. Final and frozen; no delayed appendix planned.
