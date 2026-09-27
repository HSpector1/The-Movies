# 1134-B — Independent narrow type correction review

2026-09-27. **KEEP the exact typing correction.** No compiler or behavioral success is inferred; parent execution of 1134b and the first 1135 RED remains pending. Reviewer performed only source/record reads and byte comparisons.

Actual 1134 closes on `ea237c2015386bf8551216c86d0d747bea7a4bdb`, child2, fixedSource:true, empty consumed diff and no untracked source, signal or execution error. The interval is 11:28:36.500–11:29:09.927Z, **33.427 seconds**. Its sole diagnostic is TS2353 at test337:49: the inline `hollywood` property is excess against the heterogeneous old-builder call's shared `GameStateV18` shape. No production diagnostic or gameplay result is present.

The correction binds the identical per-builder cloned null-Hollywood state to `const invalid: GameState`, then passes that value to the same builder under the same general-refusal assertion. No cast, deleted authority, changed exception matcher, new route or altered timeout is introduced. The separately precise P3 refusal remains intact. Reversing only these two lines independently reconstructs the exact frozen 1133 test bytes/hash.

| Identity | Bytes | SHA-256 |
| --- | ---: | --- |
| Original test | 27,772 | `acacfbba2c0b72ab2df369b485d27e23b4a9059425adb4a0eb956c189d68f9f9` |
| Corrected test | 27,813 | `f76990d20a0b7eeef223e2638be98509aaa3e4adbcc08dc3f60bb9153cdc96b1` |
| Unchanged helper | 23,664 | `c46c50b8940787a7e76b9f7522f98dec8caa96dedbb4e29cc5c1c5e373eb4f7a` |
| Correction patch | 870 | `242d728152ec6ac8b578fcc1cc8f8f9e4278c8aa20911e82986f41314bd07022` |
| 1134-A handback | 1,894 | `f145282a696a6daed15c0393c6e5bf5abe9af50c9c140560142c77f7c19ecd52` |
| Closed compiler JSON | 634 | `6a7af0c2b7bef4bed9774d6fc2e0ed4d86ae2b1063cdddb7af36104e86378089` |
| Closed compiler raw | 507 | `0735d70b30d128b251db106c8d2590319b05d60a61f8a00c7b22f74d8add06f0` |

All listed live/correction/record identities independently match. Original failure and 1133 source records remain preserved. The same eight leaves, exact argv, 208-call maximum and 60-second local limits continue unchanged. Parent may checkpoint this narrow correction and run the declared root compiler retry; no broader review or test scope is added.
