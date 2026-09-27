# 1158-B — Frozen case-view fixture correction

Final disposition: **KEEP for compiler and the unchanged fixed-rival selection.** This is the exact narrow correction to1157's fixture/API mismatch. No production behavior has been changed or newly qualified.

The review reads the final helper diff, public MarketCaseView/caseForTalent construction, stored-case identity fields,1158-A/manifest and original1157 first cause. Only read-only source/data operations were used; no test, compiler, project import, route or source/index mutation was performed by this reviewer.

| Final artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `tests/helpers/p14p3-fixtures.ts` | 73429 | `a1de7787c0309b2b56cdc8ccf77a237169bb80a4e4253d8ba2c899219936f179` |
| `1158-p3-case-view-correction.patch` | 1176 | `fa7da4f191778cf0e8ad80c8fe182cf0bc5805a6e74dabf80f7f9619c5d1f17f` |
| `1158-p3-case-view-correction.manifest.json` | 1357 | `7194fec2090ff02027201e2db5e0d1b1f9a67584dfd18c2c7994022c9af09b56` |
| `1158-A-p3-case-view-correction-handback.md` | 2092 | `8cb28a2177fba3cd86e4950f8bfc3b327fa188f4a22f2a40e750d81c1c7595d1` |

All identities and the exact live diff were independently measured. Replacing the one changed assertion block with its original text reconstructs the complete73077-byte helper preimage `94c1c5352d910ab797c77e73dfc1a87f045f4004bab34e730a889641294a1533`. The entire test remains77197B/`3371570a015bcc3723ec7d6f4d85f8207bbb5cba9458e0036e538037736b455d`.

The helper now requires a non-null public case view and retains discovered/opened196/decision208, adding its actual talent identity. It joins stored cases by talentId, contractId, openedWeek and subjectStudioId, requires exactly one, and asserts expiry variant plus null outcome on that actual authority. This preserves the original ordinary-expiry premise through the correct source instead of deleting it or broadening the public view. It also avoids an ambiguous latest-case or nonexistent case-id lookup.

No route, action, person, price, old body, expected gameplay pin, timeout, counter, cache behavior or production file changes. Selected cap260 and exact D07/D18 argv remain. The original1157 failed result and1157-B direct-primary attribution are unchanged. Later missing preferences/proposals/wins/work must still be reported honestly; this correction is not evidence that those premises pass.1159 types and1160 behavior require their own actual records. This review is final, with no delayed appendix.
