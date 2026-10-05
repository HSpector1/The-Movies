# Genuine V36 extension downgrade consumer

Prepared only in `S/1367-extension-consumer-prep`. This separate additive patch leaves `E/1367-stage/1367-downgrade-prep/own-era-tests.patch`, its inventory/review, the original historical tests, all production and all fixture files unchanged. No Node, game runtime, tests or typecheck ran. Python hashing/decompression was limited to the four exact newly generated files authorized by parent. No old fixture payload was read or scanned.

`S` is `/Users/zacheryspector/studio-scratch`; `E` is the repository evidence directory `docs/engineering/playability-launch-review/evidence/p14b4-20260919`. Parent reported the recorded capture independently approved. This preparation consumes that evidence; it is not a second claim of having executed the old engine or measured the new tests.

## Patch and exact fixture ownership

`extension-consumer.patch` adds only:

- `tests/helpers/1367-extension-fixtures.ts`: literal manifest/gzip/raw pins, historical source identity, own-era public admission and codec neutrality.
- `tests/save-v36-extension-own-era.test.ts`: standalone open and used extension downgrade guard leaves with explicit valid baselines, exact first messages, linked facts and input immutability.

Parent copies the following exact three files from `S/1367-extension-capture-prep/run-01/genuine-v36-downgrade-extension-controls/` to the previously named repository directory `tests/fixtures/p14/genuine-v36-downgrade-extension-controls/`. Keep filenames and bytes unchanged; this patch contains no fixture payload.

| File | Compressed/file bytes | SHA-256 |
|---|---:|---|
| `MANIFEST.json` | 6182 | `e62713cc60ecfce007b11ee381c5346a1fa98a430978983d47068d61addbb7ee` |
| `reproduced-v36-extension-open-week92.json.gz` | 112390 | `88293028366023ac5ffb3cf48838391a27e80ef0d7e5c95eddff8247e36f77af` |
| `reproduced-v36-extension-used-week98.json.gz` | 118267 | `69339e4af679bf39270619d2d73196b0a17958cf96e8b932b8f03015bc0bbc26` |

Decoded open bytes: 1,016,089, SHA `59fa201e30be28acac4d7406fc3bf4ab76ee995cc0e3dd8a2103d42ab8be5d1d`. Decoded used bytes: 1,076,361, SHA `37ed808d53ab76d45fdc2afbd4d4be03e2010b25b819794c2ad4db70ed6b9eba`. These pins were independently recomputed from the exact newly generated files, including decompression; they were not derived solely from the manifest assertions.

External `run-01/RESULT.json` is 157,645 bytes, SHA `244f47cb2dbca49b6ba052e18e228b22658c58edfeef7b5eed82fa35739dd520`. Static inspection found `MINTED`, exactly 46 ticks, equal source identities before/after and the matching archive digest. Its listed output hashes match the recomputed pins above. It remains external recorded evidence; the ordinary test neither copies nor loads it.

## Historical generator and projection

The genuine historical engine is Save37 at `c000479d6e888d3a02f5c2ff534f5dfcbb32af3f`. Current validation ran separately at `689a69f314a61a71c2ee4fc813fb4f16c7245ec1`. The loader hard-pins these distinct identities, producer SHA `714be0ea30e3e236b55c5e54454909adbf358264fca66e50f0de2d652d5dc77c`, config SHA `71c006047d7b2887b2f2f6fec5f75f70dd07626fc95221f84b45fcf6dd540029`, and archive inventory SHA `1583d5c7d6311cc8de99429a4ead13d8d82a4abdc73602eb436cf5dac6280816`.

The manifest pins the actual archived week-52 input and the real 46-tick route: 40 original ticks to week 92, the original proposal for `authored-0000` from `studio-d7df6c8e-player` with term 58 and premium 1.1, then six ticks to week 98. Both payloads are governed V37-to-V36 projections written through the archived codec and admitted by the current public V36 reader. They are not relabeled live Save45 states or claims of an earlier capture date.

The consumer also pins the manifest's historical pre-projection V37 canonical hashes: open `1b3024a955cd2723a05f29d3404096c0c81cd41ccc0388ac3900ca5a35611d20`, used `8672c6bcac0d39eadfbbe149bea55a5c92004f7ea2c57e0964ac5c86f63efc35`. Those are recorded generating provenance, not additional V37 payloads independently decoded by this test. Producer execution and archive/blob proof remain in the independently reviewed mint evidence.

## Valid controls and precise assertions

For each fixture, literal compressed/raw pins and metadata are checked first. The helper snapshots the parsed envelope before the first current reader, calls `validateSaveV36`, requires object identity and unchanged canonical bytes, then exercises `loadSave`, `exportSave`, `importSave` and another explicit public V36 validation. Export must equal the original canonical raw bytes; reader/codec calls must not mutate the original. It does not invoke the current writer or migrate the historical state to live gameplay before the V36 guard.

Each test calls public V36 validation again outside any refusal catcher. The first refusal is then asserted independently through both `convertV36ToV35` and `migrateToV35`, with full exact message equality and input bytes unchanged after each invocation. This ordering is essential because the production downgrade loss guard precedes its own validation. Missing files, invalid baseline, hash mismatch or an unrelated reader error cannot pass as target coverage.

The week-92 leaf requires exactly one open `retirementExtension` case for the subject, zero used records, original effective week 104, null extension origin, and the genuine old employment contract (start 0, end 98) still open and matching the player's current contract. Its exact message reports one case and zero used extensions.

The week-98 leaf requires exactly one used record **and its required settled case**. The subject's original effective week 104 moves to 156, exactly 52 weeks. The case retains the original contract identity, opened week 92 and settled/closed week 98. The old employment row ends at 98; exactly one genuine settlement row starts at 98 and ends at 156, with term 58, annual salary 75,448 and signing bonus 13,581. That row matches the current player contract. The exact downgrade message reports one case and one used extension.

The whole manifest fact row is also compared to each actual record/case/employment history. Expected refusal messages are literal test constants independently checked against the manifest, rather than accepting whatever message metadata happens to contain.

## Scope, coverage and execution limits

This closes the *prepared consumer* gap for the genuine used-extension witness identified in the earlier inventory, while adding a second genuine open-case control. Coverage is measured only after parent installation, typecheck and recorded execution of the new complete test file. The existing correct guard is expected to pass these regressions; no new production fix or fabricated initial RED is proposed. Any baseline/refusal mismatch remains a failure to investigate, not permission to strip authority or alter pins.

A valid used-extension-only state without its settled case does not exist under the public validator. This test intentionally covers the real used-first OR predicate with its inseparable case/employment authority. It does not delete a case to manufacture branch independence and does not claim a standalone case-free historical witness.

No finance-only V27 coverage, tolerance mutant, Scientist route or other masked leaf is added or claimed. The earlier inventory's finance limitation remains unchanged. Existing current-era historical-chain cases still honestly report their earlier Ranking guard; this additive own-era test does not rewrite them.

Parent should use the existing single heavy lane and recorder to run the full `tests/save-v36-extension-own-era.test.ts` after typecheck, then include it with the previously approved own-era file and original affected families as appropriate for the accepted checkpoint. No new wrapper, test timeout, archive, campaign route or runtime is needed. `SHA256.json` binds patch, handback, file contents, prior reviewed proposal and the four exact newly inspected capture files. Independent static review is still required before adopting this consumer.
