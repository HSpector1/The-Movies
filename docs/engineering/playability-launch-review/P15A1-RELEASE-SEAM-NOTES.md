# P15A.1 release integration — current source notes

Read-only preparation on `46c356bb71c8220232deb634489e5f5c3a8d5d0e`, 2026-09-28, while the retained specialists prepare/review P14 resource tests. No production, test, schema, fixture or policy changed; no project module or simulation ran. This is a bounded integration map, not a completed charter or runtime qualification. P14 verification remains the active task.

The program directive authorizes later P15 implementation against tested upstream producers. The reference is `docs/research/p15-independent-verification-01/RECONCILIATION-02.md` at `c5b52b4d8147d9de7d1478d12397cdface08bf70`, especially §7.1–7.3. Its research status and provisional tuning labels remain intact. The user separately selected a financial-strength band beside creative rank, public rival stage plus band, and Honors NOT RECORDED until Awards; those decisions do not choose a new competition coefficient.

The reference requires same-genre launch pressure from the pre-batch state and other actual releases in the same batch, self-excluded and symmetric across studios. Its proposed taper is1/.55/.55/.20 through R+3, a .20 handoff at R+4 to stock with13-week half-life, retired at R+26. Reach scaling and a per-studio/genre/window clamp precede aggregation. These remain tuning inputs for a concrete implementation contract; existing releases/runs must stay frozen and old saves start new pressure history at zero.

## Existing owners and the integration gap

- `tick.ts:501` collects the player's actually admitted remaining0 productions and checks equality with the release-commitment witness before reception, RNG or cash work. Its release loop starts at545, constructs `ReceptionInputs`, calls shared `resolveReception`, freezes the result and opens an engaged theatrical run. The release stamp is the week being advanced.
- `hollywoodTick.ts:267` separately advances the industry. Inside each business loop it staffs/decides, advances real operations, checks its own admitted-release witness and resolves that business's releases at317. It opens runs and settles weekly receipts in the same pass. The player calls this owner much later at `tick.ts:935`.
- Therefore current source has separate player and per-business release collections, rather than the required single pre-verdict cross-owner batch. Computing pressure independently inside each existing loop would not itself prove same-week order independence. The next contract must expose the real committed batch before any verdict consumes it, while preserving existing hiring, decision, operation, accounting and consequence order. It must not replay the scheduler or manufacture a forecasted release as an actual batch member.
- `MarketState` at `types.ts:288` has an untyped-by-genre `competingSlate` of numeric `marketPressure` rows. `reception.ts:678` currently fixes `competitionFactor` to1.0. There is no demonstrated live P15 genre/window/stock producer in these owners; filling that old slate is not enough to satisfy the new identity, boundary and lane laws.
- `resolveReception` and `forecast.ts:467` both call shared `computeBoxOffice`. The future launch assessment needs one explicit shared input with a byte-preserving absent path for historical behavior; forecast disclosure must distinguish lawful current information from a locked future actual batch. The exact input/forecast contract is still to be specified.
- `economy.ts:53` creates the fixed weekly schedule from the release's opening and legs. Weekly payments consume that schedule. Pressure belongs before the newly released result/run is frozen; it must not rescale existing schedules, paid revenue, critic scores or historical results afterwards.

Before implementation, enumerate dependencies within the current industry loop so extracting its release stage preserves every same-week read and consequence. Define actual batch identity/order, lawful public-reach input, coefficients/clamps, stored pressure authority, additive migration/cold start, and freeze/read-model boundaries. Allocate versions from the actual then-current predecessor, not from this note's current Save40/projection55.

Verification must include player/rival symmetry and same-week permutation/self-exclusion; no pressure from uncommitted or merely announced releases; exact R+3/R+4 and R+25/R+26 lane boundaries; no double counting; zero-history migration; pure preview and locked-result behavior; and ledger/run conservation under real admitted releases. Existing P07/P12 scheduler, reception, forecast, theatrical economy, save/replay and Bridge regressions remain required. No P15 code or verification is claimed here.

## Source identities read

| Path under src/core | Bytes | SHA256 |
| --- | ---: | --- |
| tick.ts | 62,182 | `cd487a1b68f1b95582895ae73a9d9fb0c1d0300a2e1a212b0d83ae6bce30dcb9` |
| hollywoodTick.ts | 30,644 | `4f5156c4cf47991936f2dd5b4a6ade9bf81609e27161fe40eb3d07d968614436` |
| releaseAuthority.ts | 9,646 | `9ab259623d3b5f5f75f1d750168e68ccb5c14d27d96f06f4656985db8064b218` |
| reception.ts | 36,818 | `bd8418a714819a1b9e4401f0cadd843ce0698615610d663b611c833c1bb9713b` |
| forecast.ts | 20,511 | `13add49ffbcf0811b56de03c3978e0122c0f901226b405a76359b8b8fda6ae04` |
| economy.ts | 4,416 | `caa6f20444be1544d64e2226f8eb89823c8d787c1460473169e0954ef15d0e10` |
| types.ts | 121,905 | `ef3251ab81c56193bacc5ed9a52e6fd55e50f9d3800b76b7c1e39df1eefc2f9b` |

These pins and cited sections are source evidence, not full-file semantic qualification. No external comparison claims, financial advice, new product decisions, acquisition behavior or television rules are adopted by this note.
