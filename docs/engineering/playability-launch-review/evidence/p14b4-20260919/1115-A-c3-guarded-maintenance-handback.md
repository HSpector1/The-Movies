# 1115-A — guarded application helper handback

Prepared only. The parent may use this helper after corrected D closes and the
reviewed maintenance becomes the active integration task. No mode has been
executed, including preflight or argv extraction. No syntax check, compiler,
test, gameplay, live source change, index operation or commit was performed by
the author. Original stages and their evidence remain unchanged.

The single new Node standard-library helper is
`1115-c3-guarded-maintenance.mjs`: **18,400 bytes**, SHA256
`5e6ecf38bfbbda091d5d43d9534ed42edd893e08c5f0e4a0d159bcafd84bbbf1`.
It implements 1103's sequence with the separately reviewed 1110 amendment.
It imports no project modules and does not launch verification commands.

## Parent invocation and application order

Invoke from the existing repository. The helper locates that repository from
its own path, requires an explicit mode and uses a single fresh output prefix
for the complete sequence. It records the actual HEAD and index at each
operation; it never resets to a stage's historical HEAD. Different docs-only
HEADs between operations are permitted if the complete consumed source remains
exact. HEAD and index must stay fixed within each operation.

For example, these shell variables only abbreviate paths:

```sh
maintenance_helper=docs/engineering/playability-launch-review/evidence/p14b4-20260919/1115-c3-guarded-maintenance.mjs
maintenance_prefix=docs/engineering/playability-launch-review/evidence/p14b4-20260919/1115-application-01
```

Run each operation separately under the parent's recorder; inspect its actual
exit and audit before the next operation. The helper never advances the sequence
automatically:

```sh
node "$maintenance_helper" --mode preflight --output-prefix "$maintenance_prefix"
node "$maintenance_helper" --mode apply1093 --output-prefix "$maintenance_prefix"
node "$maintenance_helper" --mode apply1096 --output-prefix "$maintenance_prefix"
node "$maintenance_helper" --mode apply1110 --output-prefix "$maintenance_prefix"
node "$maintenance_helper" --mode verify-final --output-prefix "$maintenance_prefix"
```

Keep all consumed changes unstaged through `verify-final`; the helper refuses a
staged consumed delta. This preserves the actual cumulative diff against the
current published source. Staging and checkpoint publication remain parent
operations after the final audit. Documentation activity outside consumed source
does not require cleaning, discarding or overwriting newer work.

The three applying modes invoke only the selected frozen patch through ordinary
`git apply --check`, recheck exact live preimages and guarded inputs, then use
ordinary `git apply`. They never use `--3way`, `--index`, force, reset, a patch
repair or replacement file copies. A failure stops the helper. It records the
actual remaining delta where readable and does not roll anything back or retry.
If an application changed bytes before a later guard failed, preserve and
attribute that state instead of starting the whole chain on assumed old bytes.

## Byte and path guards

Each mode admits all three exact manifest/patch pairs and every copied baseline
and candidate, then repeats their guards before its final audit:

| Stage | Manifest SHA256 | Patch SHA256 |
| --- | --- | --- |
| 1093 | `68a42bbae2a04d92f8778621e5e37efc7e891cf1ea62f5a738108c22497a57ea` | `c1ee31f0059ca11b6c94b7bb72469683ee4193782e1f3f78bc9e840cd061f00b` |
| 1096 | `b8bb99baaa1a904059850f4778bce112affdfff9e0b6f2c8c54021013116f78a` | `91307a13f624a797c1bfff4909bc73fd74f5928edc5b9fc668a754b5099cb17e` |
| 1110 | `d56d265f76a060be9ae07734b43cf1208e9001d4a5e8fe8f155e6d374ad572a4` | `223f9dd43767b4d592160118b68901a231773339acc283a56c720dd9a690efa8` |

The helper independently verifies the 37 first-stage files, 62 second-stage
copies with 60 changes, nine overlaps, 53 other baselines and 90-path union.
Each overlap must name the exact 1093 candidate and retain its original live
identity. Both unchanged 1096 copies remain 1093 changes. The 1110 baseline must
equal the exact 1096 B5 candidate; replacing only the three uniquely occurring
same-length literals at their declared byte offsets must reconstruct the entire
1110 candidate. Every other B5 byte is therefore preserved.

Patch headers must name exactly the measured changed test paths, with identical
old/new names. Creation, deletion, rename, copy, binary and mode-change patches
are refused. Relative paths cannot traverse directories or symlinks. The helper
also pins 1110's recorded causal authority files and the exact 914 and 1084
selection artifacts.

Preflight requires all 90 original live preimages and no consumed delta or
untracked consumed input. It captures the recorder's existing source-path set:
`src`, `bridge`, `tests`, `generated`, `ui`, `scripts`, package files, the three
root compiler configurations and both Vitest configurations. Every subsequent
operation checks the same tracked inventory and every non-target file against
that preflight. Qualified force-order production files and the independent
`p14c3-force-order.test.ts` additionally have explicit immutable byte pins.

Expected live postimages are derived from the admitted layers, not from a
blanket count. The actual consumed diff paths must equal those derived sets:
zero at preflight, 37 after 1093, 90 after 1096 and the same 90 after 1110.
All target postimages, remaining first-stage-only paths, non-target bytes, actual
HEAD and index are checked again through the final diff capture. This preserves
production, generated declarations, fixtures, UI, unrelated tests and the newer
force-order correction.

## Exact verification argv extraction

The optional `argv` mode extracts data only; it runs no command:

```sh
node "$maintenance_helper" --mode argv --output-prefix "$maintenance_prefix"
```

Its final audit and completion line contain six `groups` with the unchanged
`argv` array and exact manifest/member provenance:

1. `1086/1052`: the single cash historical-carrier leaf.
2. `1048`: the exact 30-file metadata selector, including its original nested
   Node launcher and 914 pin.
3. `1049`: the seven whole runtime files.
4. `1051`: the whole process-restart file.
5. `1053`: the remaining 61-file command, also required to equal 1084's exact
   command array.
6. `1110`: the existing B5 natural-chain leaf for the three maintained pins.

The parent recorder should pass the selected array directly to its existing
child launcher. Do not reassemble the regex or shell-quote the nested launcher.
All manifest/selection pins are checked before and after extraction. The first
five groups retain 1103's ordering; the separate B5 leaf retains its independently
required focused qualification. No files, names, filters, timeouts, exclusions
or expected failure thresholds are added. Ordinary full type/generated/fixture,
core and UI commands remain exactly those in 1103; this helper does not replace
their recorders or run them implicitly.

## Exclusive records and remaining limits

Each mode writes only these three exclusive evidence outputs:

```text
<prefix>.<mode>.started.json
<prefix>.<mode>.patch
<prefix>.<mode>.json
```

An existing output causes refusal. The started record establishes the producer,
mode and prefix before admission; the final record links it, records actual
source identities, input guards, commands invoked, the cumulative patch and
PASS or FAIL. Application and final verification require all preceding PASS
audits under the same producer/prefix and recheck their linked bytes. A crash
may leave only a started record; that is incomplete evidence, never a success.
The completion marker is `C3_REVIEWED_MAINTENANCE`.

Source-level review is the only qualification claimed in this handback. A helper
PASS will establish its observed application/byte guards, not test behavior.
Retain all earlier failures, the 23 inherited diagnostics, canonical 098 L1/L2
positive-premise gap, the original R8 timeouts and separate in-memory semantic
result, and the original versus causally maintained B5 results. Real paired/full
outcomes remain to be measured at the final candidate; no all-green claim or
new product authorization follows from preparing these patches.

## Application recording clarification

This appendix clarifies the earlier instruction to run each operation under the
parent's recorder. Its original handback identity was 8,234 bytes / SHA256
`0bdb225337fe45d531030aa91c910de921a0b7b0b3a5c676bc1df953639ddc3e`.
The helper source remains frozen at the identity stated above.

The preferred procedure is to invoke `apply1093`, `apply1096` and `apply1110`
directly and retain each helper's exclusive started record, before/after audit
and exact resulting patch. Those modes intentionally change consumed source.
Their own exact preimage, permitted path-set, postimage, protected-file and
HEAD/index guards establish successful application; they cannot establish an
unchanged-source run.

`preflight`, `verify-final` and `argv` may use the standard fixed-source
recorder because they do not modify consumed files. If an apply mode is instead
wrapped by that recorder, disclose the expected source drift and its resulting
recorder status separately from the actual helper audit. Never describe such
an application as a fixed-source PASS or suppress the recorder's drift result.
This changes recording semantics only. No helper mode, test or other operation
was executed to make this clarification.
