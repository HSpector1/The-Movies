# Sprint 19 — portable saves and responsive campaign operations (entry, 2026-10-29, 11:05 CDT)

Decision D (../ENTRY.md) and assignment §5. Start point: the retained Chrome-to-Node shared-market reconciliation failure (playtest-response/lane/measure-r3/save-cost.json: the P18 Owner route save REFUSED by Node import, "validateSaveV45: sharedMarket assessment studio-373a3bcc-r04:film:4 factor does not reconcile with p15a1-market-v2"; FIX-S13B-1 green-r6 B had met the same wall from the other side and built the P18 browser fixture in the page to get round it).

## Diagnosis (read once, measured once)

The Owner's Chrome-written P18 save (sprint16-playtest/owner-saves/p18-season-world.json, Save 51, week 428) holds 72 market assessments, all `p15a1-market-v2`. Node 20 recomputes 71 exactly; one differs: release `studio-373a3bcc-r04:film:4` at week 48, pressure 0.3752437440269083, stored factor 0.9743392133333503, Node 0.9743392133333504, one ULP. The factor is `1 − m·(1 − e^(−P/s))` and the stock weight is `0.2 · 2^(−x/13)`; both call the engine's transcendental functions (`Math.exp`, `**`), which IEEE 754 and ECMAScript do not pin to the bit, and the validator (marketIntegration.ts `reconcileLaw`) re-derives them with exact equality. Chrome 150's V8 and Node 20's V8 disagree in the last bit on this input. Every other re-derived field (`pressure`, `windowTerm`, `inputDigest`, reason values other than the stock term) uses only exact operations.

## Direction (5c: bounded permanent compatibility, smallest versioned derivation)

1. src/core/portableMath.ts: `portableExp` and `portablePow2` from basic IEEE operations only (Cody-Waite reduction, degree-13 Horner, exact power-of-two scaling); bit-identical on every engine, within one ULP of the engine's functions on the market domain (measured over 57,000 samples).
2. A new live era `p15a1-market-v3` (sharedMarket.ts): v2's seven numbers, priced through the portable functions; `MarketLaw.transcendentals` names the arithmetic; v2's seven are frozen as SHARED_MARKET_LAW_V2 with the engine's arithmetic, as v1's were at the 1365 retune. A v3 row reconciles exactly everywhere.
3. Sealed eras v1 and v2 (marketIntegration.ts): their `factor`, `stockTerm` and the GENRE_SATURATION reason value reconcile within a documented allowance, 4 × EPSILON × |expected| (two to four ULPs), no other field, era or validator; `pressure`, `windowTerm` and `inputDigest` stay exact. Not a global epsilon; no stored value trusted without recomputation; no relabelling; no transaction rewritten.
4. Verification: the Owner's Chrome-written save imported, round-tripped and continued in Node; a Node-built save imported in Chrome, re-exported byte for byte, continued two weeks identically to Node, its bytes imported back in Node, then saved and reloaded in the page (ui/e2e/astra19-portability.spec.ts).
5. Saves screen: a rejected import also tells the player the current studio is unchanged and to keep the file.
6. p12 campaign-library file measured once alone in the lane (budgets unchanged).

Out of scope, stated: history compaction, import cap changes, every browser or operating system.
