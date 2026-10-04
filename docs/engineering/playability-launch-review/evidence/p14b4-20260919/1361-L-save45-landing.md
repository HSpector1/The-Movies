# 1361-L — Save45 source landing and recorded gates

2026-10-04. Parent applied the independently approved x3 candidate after verifying all seven final unit hashes and both copies of the six production format-patches. No new production or test interpretation was introduced.

## Source

Production commits, in order: `97bee4ac` (slice2a), `df8cb801` (market seam), `55084202` (sharedMarket root and held-c guard), `bdcad9b5` (Legacy root), `e4588de0` (adapter/replay), `533593ae` (2040 freeze). Then `a5fd3073` sibling r2, `c30e3de2` hygiene comment, `95ddf564f1637cffd43abe335c82440116d6f983` final seven-unit sweep. P15A.1(c) remains held for1365. These changes are published in one combined push with this checkpoint; no intermediate production version was pushed.

[Parity](1361-stage/land/landing-parity.json): 1,545 relevant source/test/config/script entries equal reviewed x3 `ee289de67e453ce269c98d840a48799265c62993`. Git blob/mode comparison covers1,544 entries. The scratch git index omits `scripts/art/authored-asset-pipeline.py`; its physical bytes and mode were independently equal to live source, and its SHA256 is preserved. Fixture payloads were not read or traversed for this check.

## Landing checks

The single heavy lane ran [this script](1361-stage/land/landing-checks.sh) on source95ddf564 with Node20.20.2 from16:02:24 to16:04:36 CDT. `set -eu` makes each following command dependent on prior success. Root/UI/Bridge TypeScript and both Bridge generator checks all passed; final exit0. [Log](1361-stage/land/landing-checks.txt), [lane metadata](1361-stage/land/landing-checks.log.meta). Source remained clean after checks.

## Recorded acceptance status

The four focused selections and broad core/UI/d16 are complete. [1361-M3](1361-M3-save45-recorded-broad-gates.md) owns exact residual attribution and unchanged-source followups. UI2692PASS/5SKIP; d16exact12FAIL/164PASS; core133FAIL/5118PASS/3SKIP/11TODO. Core includes85prior baseline identities,45declared held-c failures, and3 waits that did not reproduce in isolated full-file recorded followups. These are explicit non-green results, not waived or repinned failures. Independent core, UI/d16 and followup reviews approve the recorded-baseline checkpoint with those limitations.

The Owner-authorized npm download-cache cleanup recovered~1.31GiB; root-owned residue was retained. Recorded runs met the5GiB guard, AC was connected, and no unrelated cleanup or restart occurred. Save45 G-L/F6 closure and genuine pre-recovery captures remain before recovery behavior changes.

## Four recorded focused gates — complete

All ran at clean published19d5d06efb1227d1c2788f6119dd2e89cd3f84f5 on2026-10-04, one lane, with exact pre/postflight and fixed source. [Machine summary](1361-stage/land/focused-recorded-summary.json).

| Run | Result | Child exit |
|---|---|---|
|1361-p15a2-green-recorded|71 passed,2 files|0|
|1361-p15a2-harness-recorded|1 passed;6240weeks,480records|0|
|1361-p15a1-green-recorded|45 failed,14 passed; exact declared residual|1|
|1361-p15c-green-recorded|121 passed,4 files including sibling|0|

The harness reports campaign79,802ms, makeSave685ms and validation366ms against300,000ms ceiling; archive725,757bytes, save6,209,534bytes. P15A.1 identities and complete primary messages equal the declared TSV: missing0, extra0, changed0, no normalization ([comparison](1361-stage/land/p15a1-declared45.json)). The recorder wrapper itself exits0 even for a failed test child; this record uses actual child/postflight exits.

Broad results and followups are preserved in1361-M3. The existing type/generator/parity and focused records are unchanged. P15A.1(c) remains held pending1365, and the planned boundedP18 endpoint remains in progress.
