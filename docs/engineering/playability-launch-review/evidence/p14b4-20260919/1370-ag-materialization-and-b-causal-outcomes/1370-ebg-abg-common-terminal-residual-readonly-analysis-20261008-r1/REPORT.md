Read-only residual EBG → ABG diagnostic using existing, authenticated clean recordings. This is an analysis receipt for parent review, not ledger admission, a new capture, or a source-control/game test result. Production and Git were not changed. The analysis imported no game modules, started no subprocesses, and decoded no gzip stream. It reused the already observed E0G/EBG comparator terminal arrays and B-profile index, and read the existing ABG aggregates. Compressed EBG captures were authenticated by hashing their compressed bytes only.

For both exact seeds, every value and the complete source order agree in the full exposed terminal families. Rows were rejoined by stable identity plus zero-based source occurrence; original ordinals are recorded only as locators. Employment uses contractId, rather than the previous comparator's positional [null, ordinal] identity. Cases use contractId/variant; market uses week/talent/kind/studio; industry uses week/studio/kind/talent; first takes use production/studio. No matched-value change, unmatched identity, or order difference remains in those arrays.

| Seed | Employment | Market receipts | First takes | Cases | Industry receipts | Proposals |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| p13a-core-causal-01 | 40 | 72 | 51 | 18 | 273 | 0 |
| p13-public-commercial-adoption | 64 | 223 | 121 | 42 | 515 | 0 |

All four independently recorded source-JS digests (settlement, receipts, employment, takes) agree EBG → ABG for each seed. The analyzer does not regenerate a JS JSON.stringify digest from the Python-parsed, sorted-key comparator file. Each EBG digest is cross-bound to the existing comparator, clean RESULT, and summary; each ABG value is bound to the authenticated data/result/observed receipt. The exact strings are in RESULT.json and below.

| Seed | Family | Equal EBG / ABG SHA-256 |
| --- | --- | --- |
| p13a | employment | `7ecf8dab4483cd39bd4c2bd7583358a5a051ac9aff1fbe22891212b1c9b4b52b` |
| p13a | receipts | `b750392ef8a5770c4d94b34a915e14b4762a4ceb333af02e6396823d47effb13` |
| p13a | settlement | `829b14843b51e961daf47a9cc9d94bea77d22c05565661c6add411f92ddba6dc` |
| p13a | takes | `d55f8f63bf0b772b2bc3496df1a23d435bfc6755a526a7aa0292f496f7c03d8f` |
| adoption | employment | `73ffe90f2eb57ce1e05ab726160fc54dc20a9caac40d56b17d5ec823ab054543` |
| adoption | receipts | `c75b843d94d3211a69afb1b52fd7f693472ec2c99b1ec806e8c86a7b94191f7b` |
| adoption | settlement | `e1e3378cad797e8d842c2210cf6f984050dc6fe4afe76e31ea88466407ed6fef` |
| adoption | takes | `aff8e53eea618e5689f1b2b8a176d4a6e1c8fb312f342cb8eb638cc379d85208` |

Terminal RNG agrees for each seed. All 416 ABG weekly RNG values equal its terminal value. EBG weekly RNG was not compared because the aggregate lacks that stream. EBG and ABG weekly/full-state digest strings remain incomparable: the EBG observer hashes JSON.stringify(originalState), while ABG uses typed, sorted-key snap(state). No first full-state difference, equivalence of arbitrary state, or equivalence of 417 raw save/payload boundaries is claimed.

For every week 1–416, all four studios' recorded B `since` profiles and source order match, giving 1,664 paired studio observations per seed and zero changed weeks. ABG recovery presence/version1 is checked. Market additions (72/223 rows) and first takes (51/121 rows) also agree by event-week against ABG's recorded weekly additions. This does not compare intermediate employment/case snapshots or any other weekly owner field.

The exploratory industry timing view in RESULT.json is explicitly INCOMPARABLE. ABG newIndustryReceipts is a before/after append slice indexed by answer.market.tick; receipt.week can name the input/event week. EBG's exposed terminal rows provide only receipt.week. For example, ABG adoption's week1 slice includes week0 laboratoryCommitted receipts. Grouping EBG terminal rows by receipt.week against that slice produces locator differences, not changed row contents. Full terminal industry row values/order agree; the available aggregates cannot establish its actual boundary-by-boundary append timing.

The original ledger classifier's eight receipt-derived fields—week, eventId, kind, talentId, subjectStudioId, winner, reasons and dropped—match all 18 p13a and 42 adoption ABG recorded decision rows, including identity/occurrence, membership, contents and order. EBG's projection is derived from its observed terminal receipts and the original helper's first matching case rule, not represented as a newly observed rich EBG ledger. The fields survivors, churn, exposed and newSentences were not compared. In particular, decision-time survivor rosters and relationship bands cannot be certified from terminal arrays alone.

This suffices for the narrow residual endpoint finding: there is no unexplained EBG → ABG residual in the measured receipt-based ledger outcomes, full exposed terminal families, four digests, terminal RNG, or recorded B profiles for these two routes. The existing E0G → EBG B-bundle diagnostic reaches the same 40 → 18 p13a and 48 → 42 adoption receipt decision counts and endpoint contents measured in ABG. It does not establish equality of the complete richer ledger row schema or satisfy the approved exact ledger acceptance route. The pinned acceptance design requires fresh correctly sourced clean/observed evidence, all shared weekly/final/ledger fields and protected pin satisfaction. That remains separate; no protected pin is repinned, and no 1363 closure or general A/Save46/C-plumbing inertness is asserted.

The actual frozen production path sets are identical at 188 paths. All 376 source-file instances were authenticated directly against their maps; both ABG seeds carry the identical source map. Exactly these six paths differ, leaving 182 common production paths:

| Path | EBG SHA-256 | ABG SHA-256 |
| --- | --- | --- |
| src/core/hollywood.ts | `898788ed4998aaf29434a959caa9cce5bca641a6a20fc3884fb9e3ca23b9e191` | `7e9e26ac92689a2db5ad9e239c90b6203b4f1084b1aca8f68064c9908569a441` |
| src/core/hollywoodValidation.ts | `e8d185afe9733b785ca717fb6c9e55a17f5462e8949d4caf4ad8617f3d2ea7ea` | `ec8cf7290a63389087750967fcbe456159eaf2840770341ce3c9cf7d9f75c214` |
| src/core/index.ts | `819e31eaaee65b3c0206d3153d74cfbccd985eb3360dc0a8ed362886a1839b4f` | `25b07f15ee0fe71484faab449b5c50aa407832cae1b4f4196b70c4944244de4b` |
| src/core/rivalResearch.ts | `be3debd77b4589051c8fb977f698deadcf172f1360bf0050381a3d16a81b44ae` | `6850a7a666dd4514224020d40ddf7513c457f94e004a113244c2d019e6140ef6` |
| src/core/save.ts | `be66e4c7a1cd374d25d59024fb79df1c65a79d41ed7c1322e4d862c33d7debc9` | `cd4a1d42d02fee6280e2a658ba304448c0ab93c0e57fd8866ef5a65e0072c035` |
| src/core/types.ts | `626408149aed22a255bd1d7dc3a853fde4753f2716334ceac9a2ff91e4f915a0` | `114efba3aece83977c63fc8c5f5f77e9ce966807fcaed9b89625e608d715f9ee` |

INPUT-PINS.json records every consumed artifact's absolute path, byte length and SHA-256, including the observed receipts, EBG route manifests, clean RESULTs, summaries/readback audits, compressed capture pins, ABG data/RESULTs, comparator outputs and source/instrumentation/classifier/acceptance-design pins. RESULT.json repeats verified inputs and all frozen source-file hashes, then records joins/locators and comparisons. compare-existing.py is the complete stdlib analyzer source. Its JSON cap is 32 MiB per input; compressed files are hash-only, bounded at 160 MiB per file. The largest consumed JSON is the existing 20,634,133-byte p13a comparator. The two compressed captures total 248,292,643 bytes and were not decompressed.

Reproduction is a bounded artifact comparison, not permission to run a game: `python3 compare-existing.py INPUT-PINS.json` writes deterministic JSON to stdout. An independent reviewer may compare that stdout to the RESULT SHA in RECEIPT.json. The command expects all source/artifact pins unchanged. Parent independent review is required before adopting this diagnostic conclusion. Work stops at this report.
