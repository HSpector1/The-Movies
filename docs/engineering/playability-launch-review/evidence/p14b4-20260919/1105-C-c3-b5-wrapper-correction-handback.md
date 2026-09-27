# 1105-C — separately reviewed wrapper correction: frozen source handback

Prepared under parent-adopted1105-A and independent1105-B. This is the explicitly approved one-pass harness amendment, not an automatic retry. Original1100 sources, stopped1068 result,1069 guards and snapshot remain unchanged. This lane authored files and inspected byte transformations only: **no matcher-controls execution, compiler, snapshot preparation, project import, gameplay or pin update**. Parent alone executes after the active lane closes.

## Frozen files

All paths are under `docs/engineering/playability-launch-review/evidence/p14b4-20260919` (E).

| New file | Bytes | SHA256 |
| --- | ---: | --- |
| `1105-c3-b5-forensic.ts` | 34,641 | `1faf5cbbf1f1a61da12422f51d04c07e1653d5b65810723f8028e35f264f9d6d` |
| `1105-c3-b5-forensic-prepare.mjs` | 6,372 | `be2cc9ae7e55b3eedb26f875907478163f9c066e2c7ba1ed0b94309986f7e78e` |
| `1105-c3-b5-forensic-typecheck.mjs` | 2,921 | `f2cfb7908a2621beb050e3f1e2a9cd0911735246455d2507f038c9217055ef9b` |
| `1105-c3-b5-forensic-verification.mjs` | 12,682 | `c862b1cdc3e3efea88e27b800ff6d7b4ce1787af60d4045eaa5e766d9b618559` |
| `1105-c3-b5-forensic-provenance.json` | 370,462 | `c5cd62ccb9c23ea1b8eb07216eebe4e5dbbfd57070f1c3f26e537d8f17e575e8` |
| `1105-c3-b5-assignment-matcher.mjs` | 1,310 | `f439df4275359cb54c5812c6e5b3296f55578503bc8157340baca5ed32d211f2` |
| `1105-c3-b5-assignment-matcher.d.mts` | 281 | `7e35295f38ae0624ccabc6a02efb87c24df640b4543250440d67cee41e072d2e` |
| `1105-c3-b5-assignment-matcher-controls.mjs` | 4,871 | `d466748e1175e6416c133ababb16076866a1d526d49d91f3d3255aa5e7515cea` |

## Exact behavior and reconstruction

The forensic producer has only two adapter hunks beyond1100→1105 record/path renaming: import the pure matcher, and replace the bare anchored regex/extraction with its returned exact census person ID. The original `assert.ok` reason and every subsequent production/draft/boundary guard remain. All seed/tick/options, early-save and prefix comparisons,0/208/211/212/416 admissions, original expected pins, terminal joins, work/receipt collection, invalid status, result limits and failure behavior remain byte-identical outside those named hunks.

The pure `.mjs` matcher has no imports or side effects. It concatenates the twelve exact unchanged validator frames and the actual candidate person's Hollywood suffix, then compares the **entire message by string equality**. Exactly one census row must match. No whitespace normalization, substring/suffix matching, unbounded prefix, repeated-frame removal or fixed-person shortcut is present. Its adjacent `.d.mts` declares the same string/readonly-person-list→string-or-null boundary; it contains no runtime implementation. The copied Bridge type graph must include that declaration and the forensic producer; compiler proof is still pending.

Provenance records the original and revised identity of all four producer/prep/typecheck/verifier files, every named exact old/new hunk, the unchanged source-list/intervention/treatment, and all explicit extras. `verifyAmendment` verifies complete forward construction and reverse reconstruction of each file, plus the complete original provenance bytes. Mechanical changes are limited to1100→1105 record/path references, the exclusive `studio-c3-b5-forensic-wrapper-*` directory label, the matcher import/adaptation, required declaration graph reporting, and invocation of the added file-only reconstruction/input guards. No other changed byte is accepted.

The author lane independently reconstructed those four original file texts and original provenance using file-only string/JSON transformations. This is an authoring consistency check, not execution of the new verifier or matcher. Parent's pending controls and source review must establish their actual behavior. Original provenance remains357,587 bytes/SHA `c45ac0cc411df724aca1dbc603d622d2b9301a7855c5b6fef32ae6a7b877a1eb`; original producer remains34,595 bytes/SHA `c5025008944e1f8ad00b679f1a2db45d466fc3f371e3f1370971db94521ca7b9`.

## Explicit copied-extra amendment

Copied source counts stay **1,660 total /1,659 unchanged**,112,446,454 original bytes, under the same2000-source-file/256MiB complete-copy caps. The single semantic intervention remains the copied hollywoodTick import/comment/loop removal: original SHA `55bccdc4e2a0c62c1769ebcaf9e8d72f40cbf30d86729581ecc7d7a2ae93ddbe`, transformed SHA `056f90c91095eba0fa89905e881e8967928bf8c571da32b6414fc7e6c98a21ac`, exact patch SHA `c0aeb39e4a9dd651bb896cc6ff22ca2eeb62791f49f797884d3645c2d7d028fb`.

Copied **extras increase8→10**. The unchanged original1052 driver,654 evidence and1062 treatment stay; the four1100 program helpers are replaced by their separate1105 names; the two new matcher implementation/declaration files are added; the new provenance is the explicitly recorded self-extra. The original source totals do not include these extras. There is no other copied module or data change and no additional symlink beyond installed node_modules.

The matcher-controls file and original stopped1100 result are **host-only pinned inputs**, not copied into the gameplay snapshot. Original1100 producer/helper/provenance files are also read as immutable reconstruction baselines from their explicit manifest paths; they are never imported by the new diagnostic. `verifyAmendment` checks those originals, new files and the two host-only inputs before/after snapshot work. Thus the snapshot verifier's Node file reads include pinned host documentation evidence, while every evaluated simulation module still resolves within the copy. Shared installed dependencies remain the only project-import exception.

The stopped result's pin is1,148,663 bytes/SHA `388b1450b3047884a6ddd85c79b646d3e62805c6e186f8b1c91ed316a30ffbb7`. The actual valid1062 treatment is unchanged748,010 bytes/SHA `10620ee9105e1ef2b01c31a576de4dc6a860da4ffff761187431ed9e50abad8a`; it is not rerun. The original212 completed calls stay separately recorded. This new pass may add at most416, for at most628 total across the two attempts, never relabelled one416-call run.

## Data-only controls and parent-only sequence

The controls import only Node libraries, the pure matcher and the file-only verification module. They admit the exact recorded212 refusal against its real two-person census, prove independence from census traversal order, and assert15 named refusals: bare error, missing/duplicate/reordered wrapper, extra prefix/suffix, final newline, changed punctuation, other law, unknown person, empty/different census, duplicate matching row, invented V29 frame and invented V38 frame. They compare original message/census/input bytes afterward, run full file reconstruction before/after, write no artifact, and emit only a bounded completion record. No simulation modules are imported or evaluated. The two positives are parser controls, not another proof of downstream gameplay or causal sufficiency.

After independent source review, parent records these serially. Replace E below with its full relative directory; `<actual frozen HEAD>` is the then-current published host identity, not a reset to the old1100 HEAD. The consumed1660 source bytes must still equal the pinned source set. Current host checkpoint during authoring was `c362bab94678a21b8d9ecb98bed5d6635a664d27`; if a later docs-only publication occurs, record its actual identity and keep it frozen throughout preparation/compiler/run/final guards.

```text
node E/1105-c3-b5-assignment-matcher-controls.mjs --provenance-sha c5cd62ccb9c23ea1b8eb07216eebe4e5dbbfd57070f1c3f26e537d8f17e575e8
node E/1105-c3-b5-forensic-prepare.mjs --source-sha <actual frozen HEAD>
node E/1105-c3-b5-forensic-typecheck.mjs --snapshot-root <new retained copy> --manifest-sha <new manifest SHA>
```

The unchanged compiler options emit nothing and verify all project imports stay in the copy, including the original1052 observer type dependency and new matcher declaration. A matcher/compiler failure stops before gameplay. From the new snapshot cwd, exactly once:

```text
node_modules/.bin/vite-node --script E/1105-c3-b5-forensic.ts --manifest-sha <new manifest SHA>
```

Then parent retains final verification regardless of collected/stopped outcome:

```text
node E/1105-c3-b5-forensic-verification.mjs --snapshot-root <new retained copy> --manifest-sha <new manifest SHA> --allow-result true
```

Exclusive result is `E/1105-c3-b5-forensic-result.json`; snapshot manifest is `1105-snapshot-manifest.json`; semantic patch is `1105-semantic-intervention.patch`. Preserve the old temp directory and every old artifact; mirror new result/manifest/patch under distinct repository evidence names only after final guards close. Do not copy or rename the old212 state into a resume fixture.

Successful raw collection remains `FORENSIC_COLLECTED`, `gameplayValid:false`. Any unrelated failure stops with partial evidence; no further automatic pass follows. Original B5 pins remain held until completed comparisons and independent causal review, regardless of parser success or recovered hashes. No current production, staged maintenance, endurance source/reference or historical qualification is changed by this source handback.
