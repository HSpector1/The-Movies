# 1344-X2: parent dry run of the rival-shelving RED, and the parent's decisions on its findings

## Dry run

The parent built a scratch tree at HEAD 02677d93 (1327-C method) and applied
[1344-shelving-red.patch](1344-stage/1344-shelving-red.patch): sha256 b284f465…, 4 files, 1,124 insertions. The files
are three test files and one shared, non-test fixture loader. [Run](1344-X-red-run.txt): exit 1, **38 failed, 5 passed
(43)**, 67 s wall time.

| File | Leaves | Failed | Passed | Time |
|---|---:|---:|---:|---:|
| `tests/p14d1-rival-shelving.test.ts` | 23 | 19 | 4 | 22.3 s |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 15 | 15 | 0 | 8.1 s |
| `tests/p14d1-rival-shelving-natural.test.ts` | 5 | 4 | 1 | 56.1 s |

This matches [1344-C](1344-C-shelving-red-handback.md): 38 fails and 5 control-passes. One RED reason is a real crash:
`persistedProductionIds`'s exhaustive receipt switch (`productionIdentity.ts:111`) throws on a `screenplayShelved`
receipt. That confirms 1344-A §2's reader map.

## Parent decisions on the 1344-C findings

1. **`searchIndustryPackages` counts.** Left to review 1344-D, which judges whether the `decide`-level tests suffice.
2. **Rival promise authoring (test 7c).** `authorRivalPromise` is private, and no natural route reliably reaches its
   `SPECIFIC_PROJECT` branch. Parent API decision: production exports `rivalPromiseProjectCandidates(state, studioId):
   ScriptProject[]` from `talentMarket.ts`, and `authorRivalPromise` uses it. The function returns the issuer's
   non-produced screenplays that are not shelved, sorted by id, first two. Revision 1344-C2 tests it directly.
3. **Control week (test 1).** Accepted: the shelving week's set of non-zero movement kinds equals that of the
   adjacent prior week.
4. **Test 3's second case.** Accepted as scoped: a business with a recorded greenlight and no economic rejection in
   the first 20 weeks.
5. **`makeSave` at Save43.** Confirmed: it stamps `LIVE_SAVE_VERSION` (43), as at every earlier version.
