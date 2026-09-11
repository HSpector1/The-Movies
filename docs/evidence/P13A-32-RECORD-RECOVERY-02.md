# P13A correction 02 — actual 32-record recovery

The ordered 32-record recovery proof passed all three actual production store/coordinator runs after the fresh performance gate and native compile/tests passed. Every run migrated the entire accepted library, passed 66 whole-save comparisons, preserved all 32 record identities and their own weeks, and released its store lock. No runtime code or storage bound changed for this proof.

The fresh fixture contains **one actual accepted week-6,240 record and 31 actual accepted week-316 records**, with distinct storage UUIDs minted through the accepted library constructor. Each label states its actual week. This is a generated verification library, not a user campaign or a claim of 32 independent playthroughs. The accepted constructor also retains one working checkpoint and one original legacy checkpoint, which count toward the aggregate decoded bound.

| Measurement | Result |
| --- | ---: |
| Stored records | 32 / 32 limit |
| Accepted encoded library | 87,369,971 bytes / 268,435,456 limit |
| Accepted decoded checkpoint aggregate | 457,829,232 bytes / 1,073,741,824 limit |
| Largest accepted individual checkpoint | 105,176,458 bytes / 201,326,592 limit |
| Migrated encoded library, three runs | 87,736,879 / 87,736,911 / 87,736,895 bytes |
| Migrated decoded checkpoint aggregate, each run | 462,104,898 bytes |
| Recovery run 1 | 31,274.135 ms |
| Recovery run 2 | 31,243.185 ms |
| Recovery run 3 | 30,973.101 ms |

These are three observed recovery durations, with no warmup or percentile claim. Each interval begins before store ownership acquisition, includes governed migration of every supported current and saved slot, canonical compression and durable rewrite, and ends at the first active snapshot. Reset, full record-by-record checks, final decode and catalogue reading are outside timing. The unchanged decoder enforces the 192 MiB individual checkpoint bound as well as the unchanged 32-record, 256 MiB encoded and 1 GiB decoded aggregate bounds. The shape deliberately fits those limits; 32 full week-6,240 checkpoints are not claimed.

Fixture assembly ran **2026-09-11 19:51:12.299–19:51:44.655 UTC** against exact accepted `592e926bfbf4574df94b38fc8dd594fc5df2ac8d`, branch `wip/p13a-performance-baseline-01`, in `/Users/bruce/The Movies - P13A Accepted Baseline TS`. The emitted assembler SHA-256 is `d318e91e6409e2482a1f1689dae15118365e51acc725bd2b445110f5321e1f4a`, 1,488,105 bytes/103 inputs. The whole assembled library was validated by the exact accepted `loadCampaignLibrary` and was already canonical.

Recovery ran **19:52:14.654–19:54:02.363 UTC** on corrected `2ac73da2cd4c7a71ea54407c76a20e0a4c75cf60`, branch `wip/p13a-synchronized-sound-01-ts`, in `/Users/bruce/The Movies - P13A Synchronized Sound TS`. The emitted recovery bundle is `208d0fa204a1cdd3fe9821313976aa227837c29beb0711a90ab7e033f88b581c`, 1,642,412 bytes/113 source inputs. All 113 product inputs are identical to the passed acceptance sampler graph. The dirty source status records only ongoing evidence/harness work; all runtime inputs and bundles were checked before and after the runs. Team builds/tests/native processes were held during recovery; ordinary OS background activity remained uncontrolled. Node v26.3.1 used default arguments on Apple M3 Max, 16 logical CPUs, 128 GiB RAM, Darwin 25.6.0 arm64. No HTTP, worker transport, native responsiveness or cold-cache claim is made.

The verification harness was strengthened before running. Existing checks for studio, ledger, contracts, history/events, RNG, rival cash and every rival financial period remain. The added independent proof verifies the exact neutral technology root and each person's six research skills at actual/perceived 1/1, six ceilings at 1, research development rate 1, six genre pairs at 0/0 and work history 0. It requires identical person count and identity order, exact zero additive technology finance movement, and the approved `soundRequired=false` result. It then removes only those new roots/leaves, restores the old inert sound flag and projects the envelope version from 20 to 19 for a strict deep comparison against the complete original save. All other fields—including every Hollywood film, property field, person field, seed and broadcast cache—remain in that comparison. No migration function or runtime tuning table supplies the expected result.

Both current and saved slots of all 32 records, and both working slots, passed: **66 full-save comparisons per run, 198 total**. Each record retained its own week, UUID, label and revision. Active catalogue identity/revision, retained original legacy checkpoint and library receipts were unchanged. No Scientist or other person, technology history, research work, cash or production assignment was fabricated. Every active snapshot had digest `d968501356b5f3f007eb4c5a7b258adc1e50e422cc0d43184bafe7d6682007ef`. Encoded outputs have distinct hashes across the actual recovery runs; the authoritative save comparisons and active digest are equal. Reports completed with zero errors, processes exited zero and locks were absent.

The proof method passed independent review plus 18 bounded harness checks: one lawful manually authored additive control and 17 deliberate corruptions, including previously unchecked film/property/envelope fields, non-neutral research, an added person and a nonzero movement. This control is a helper test derived from generated accepted data, not a claimed loadable campaign. The recovery harness SHA changed from `503de4f0bc661607cb8fd4d75011861ea4025f5b29b1545ba43e0812042354e9` to `4223779fb46b89adc078ce58aa20bbc4738acb5d7b66e7acaa7b1da51461c4de`; both exact sources and the check script/report are preserved.

Evidence is under `artifacts/p13a/recovery32-02/`:

- `accepted-fixture/fixture-report.json` records all 32 UUIDs, own-week labels and checkpoint hashes. The library SHA is `519a7d6847256b0f0f056effe46f856b679e5fc4158a12b1d5835cfaf52981a5`.
- Source save hashes are accepted week 6,240 `2a8fa601d2aabda77a7b4f067a511690bebf34804c9ea7c61fb0086399b3ef71` (47,825,995 bytes) and week 316 `350d29eab350a5bd0ff06b3a363711f9437de7a7868b5e5abd0c01f79ba9e08f` (2,079,437 bytes).
- `current-recovery/recovery-report.json`, SHA `758e7171ec13b6eb3b6f46967cc64e6470ced1a04f67f54e1df4e42dc9891d1e`, contains raw durations, memory observations, output hashes and all proof counts.
- `source-proof.json`, both emitted bundles and their adjacent bindings record exact source identities; `harness-review/` retains the old/new harness and the 18-check report.
- `evidence-integrity.json` binds the reports and verifies source/fixture integrity after execution. It also confirms all 20 files in the original stopped review manifest remain unchanged, including the old, explicitly unexecuted 32-record preparations.

The quiet recovery window is released. This satisfies the bounded library recovery proof; the remaining ordered critiques and final product acceptance checks remain separate.
