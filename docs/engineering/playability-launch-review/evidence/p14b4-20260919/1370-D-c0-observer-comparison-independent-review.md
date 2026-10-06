# Independent completed-leaf audit: C0 observer comparison r2

**Verdict: ACCEPT_OBSERVATIONAL_COMPARISON_ONLY.** The pinned output `1370-c0-observer-comparison-r2-output.json` has SHA-256 `aa4b3a9b3501e2aaad1c774de4944539727b5b5604daabea6ada9b59391044d1`, classification `OBSERVATIONAL_DIFFERENCES_ONLY_NO_CAUSAL_CLAIM`, launch HEAD `ec81334589982378032bc21715c23dd09d88f201`, and completed launcher RESULT SHA `9622b578c516c12289cd43016aeb3315bbd4cb5aa636e2235a8ef823a4f2bf9a`. The launcher says `FOUR_ROUTES_RECORDED` in historical types, historical clean, modern types, modern clean order. Each child RESULT matches its launcher SHA and sidecar, reports accepted exploratory status, zero child/recorder exits, exact source guards, no timeout or survivors, and the same HEAD. This audit did not run a game or mutate the repository.

I independently reloaded the four protected JSON arrays and the 43 trace rows from both clean leaves. Each protected array's SHA matches the original 654-T historical or separately recorded modern pin in the frozen r3 manifest and child RESULT. An independent source-order occurrence calculation reproduced every field in all five output comparison objects exactly, including row counts, first identity-order and matched-field differences, unmatched identities/counts, and bounded samples.

| Array | Historical / modern rows | Changed matched | Historical-only / modern-only | First source-order difference |
|---|---:|---:|---:|---|
| Settlement | 40 / 40 | 25 | 0 / 0 | None; first matched studio change at week 208 |
| Receipts | 164 / 156 | 31 | 22 / 14 | Week 208 settlement recipient studio |
| Employment | 44 / 44 | 34 | 5 / 5 | Contract index 24, created week 208 |
| Takes | 51 / 53 | 2 | 7 / 9 | Index 39: historical first take week 101 versus modern next source row week 107 |
| Trace | 43 / 43 | 43 | 0 / 0 | None; first matched field at week 0 |

The week 0 salary row reports historical `394607` and modern `395548` for the same contract. The trace also records historical stored age `44.36540781416331` and modern `44`, and distinct provenance. At week 101, the historical trace contains the first take of `studio-aca408ec-r01:film:10`; the modern take for that same film is at week 114. At weeks 207–208, the market trace shows different financial, proposal and promise fields, and the week 208 protected settlement changes some recipient studios. These are observed differences. The trace does not prove which source change caused any downstream result or reveal unrecorded internal market decisions.

This evidence supports attribution work on the four C0 protected digest differences. It does **not** repin the protected historical values, pass the original acceptance route, close 1363, or authorize promotion to main. Keep the original and exploratory labels separate.
