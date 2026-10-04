# 1363 Part A independent RED staging

Status: authored, not typechecked or executed. No production/repository edits, node/build/test runs, fixture payload reads or nested agents. Independent static review by `/root/sweep_review` found no other wiring/contract blocker; its A9 forecast-control correction is incorporated, pending final revision acknowledgment. Runtime preflight remains required. Reference source is parent's 95ddf564 Save45 landing; the inspected checkout advanced to db8cf523 with coordinator checkpoint work. Parent must confirm the source/test blobs stayed fixed before applying these patches.

Artifacts:
- `part-a-red.patch`: additive `tests/p14d2-binding-cash.test.ts`, A1-A7/A9 (A6 has two leaves).
- `authorized-repins.patch`: separate amendments to exactly the two old cashBlocked leaves in `p14d1-rival-shelving.test.ts`, authorized by 1363-A §7 / 1363-F P6. They now expect increments for hopeless packages with partial/no affordability. No thresholds, controls or Part B rules change.
- `tests/` contains staged file contents only; the existing pinned helper is imported and unmodified.

## Interface specified by these REDs

`searchIndustryPackages` options gain optional `diagnoseUnaffordableViability?: boolean`; enabled locked-screenplay calls return `unaffordableViable`. The property may be absent or zero on ordinary calls; tests compare the four preexisting result fields explicitly. The ordinary chooser never opts in, and its forecast calls remain exactly the affordable-candidate count. `decide()`'s refusal re-search opts in. No other callsite or commission path opts in.

A1/A2 enumerate the actual bounded candidate set independently using exported planning/forecast/menu authorities and the charter's cash-free contribution-minus-preference gate. They do not use production search outputs to define expected viability. The captured inputs are real decide inputs: week130 refused script0006 via the pinned V42 migration helper; viable script0000 at natural genesis week3. Premises are asserted. A2 covers no/partial/all affordability.

A3-A5/A7/A9 and A6 control cash at the **policy seam** by changing target-rival `cashAvailable` in both chooser and diagnostic re-search, calling the real functions. They do not forge account cash or ledger history and are explicitly not claimed to be natural low-cash campaigns. A7 supplies the old classification only in a control diagnostic by mapping skipped count to skipped-viable count; at full affordability both labels are economic and the entire resulting state must equal. A9 explicitly disables the opt-in diagnostic in the legacy control, requires strictly more computeForecast calls on the candidate, and then checks RNG equality and input immutability where the labels differ.

A6 builds synthetic shelving rows/receipts on existing genuine/current route states and validates the state before ticking. It tests oldest-hopeless retry advancement followed by the next due ordinal, plus a real viable package remaining cash-blocked. These are isolated lawful-shape cases, not historical captures or proof that those precise shelves arose naturally. Before accepting GREEN, review/run must confirm their preflight validation and their dynamically asserted viable/hopeless premises; no late guard may be waived to reach the assertion.

The two old re-pins retain their existing cash-mutant arrangement as inherited unit tests. The new cases avoid that arrangement. The mixed-sequence Part B leaf is intentionally untouched: its cash trigger only changes when Part B exists.

## A8 capture requirement — not fabricated or silently waived

A8 is not included as a skipped/TODO test claiming coverage. It blocks Part A landing until a genuine pre-amendment capture is minted and its pinned loader/test are independently reviewed.

Proposed new directory: `tests/fixtures/p14/genuine-v45-binding-cash-1363/`.
Proposed files: `genuine-v45-binding-cash-count12.json.gz`, `MANIFEST.json`, `PROVENANCE.json` (producer must follow the repo's established schema/names; if that schema uses another provenance basename, record that exact name before minting). Do not overwrite an existing path.

Search at the final Save45 production writer, before Part A, from `p13aGeneratedStudio('p13a-core-causal-01')`, natural ticks only, bounded weeks0..520. Instrument the existing chooser/re-search call boundary without altering results. For each ready script, retain current count, full independently enumerated cash-free viability, actual affordable/skipped counts, studio/script IDs and decision week. Select the earliest week/studio-order/script-ordinal state with count12, no production, a complete seatable team, v1 `cashBlocked`, skipped candidates >0 and zero viable candidates at any cash. The historical diagnosis identifies r02's frozen12 as the first bounded target; do not force it to remain true on Save45.

Capture the input immediately before that decision through actual Save45 `makeSave`/export, plus execution source identity, seed, route, tick/studio/script/count, exact byte/hash pins and the observed v1 refusal. Retain an unmodified pre-amendment tick to prove count12 stays12, while the independently forecast premise proves the amended classification would be economic. If that bounded search finds no witness, stop the mint and report the absence; no hand-editing cash, counts, receipts or schema stamps and no unbounded seed search. Parent selects any further measured search scope.

A8 then imports and migrates those pinned genuine bytes through actual public save APIs. It verifies count12/source premise, ticks Part A once and requires shelving at the threshold with exact new receipt/retry/hold and preserved accounting/history. Also prove the raw capture remains byte-identical. This belongs in the capture follow-up patch before Part A lands.

## Historical comparison prerequisite

1363-F ruling11 separately requires an earlier old-source pre-shelving control if Part A moves first shelving before the existing week93 comparison. Do not repin that old control speculatively. Proposed distinct output directory: `tests/fixtures/p14/genuine-v42-pre-shelving-1363-control/`, minted by the reviewed 1344-P2 producer on its frozen old-source archive at the measured last unchanged pre-shelving week. Retain the week93 mint. The candidate must identify its actual earlier boundary; producer and test changes receive their own review before landing. No fixture was opened or produced in this staging task.
