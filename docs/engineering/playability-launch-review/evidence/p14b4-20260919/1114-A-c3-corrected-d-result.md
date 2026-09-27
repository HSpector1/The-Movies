# 1114-A — corrected D completed with exact historical A parity

Corrected D passed the full 6,240-week continuous/read-stress route on published
`c1a6654a859e528bd719cd39c62d850a51f59eee`. Recorder 1085 ran from
2026-09-27 05:57:39.652Z to 07:55:49.437Z: **7,089.785 seconds**. Session 62605
is CLOSED, child 0, fixedSource:true, with no signal/error, empty consumed diff
and no untracked consumed source. Metadata records driver elapsed time of
7,083,144.153098 ms; the later completion marker records 7,083,163.053014 ms.
These are observed scopes, not performance thresholds or a timing comparison.

## Actual route and equality

Actual counters: 6,240 attempted and completed ticks; 1,072 commands and engine
calls; six creators; 122 commissions, greenlights and releases; 19 set-maintenance
commands; 75 promise attachments; **600 read groups**; zero runtime-store samples.
D is the continuous route with the original 13-week/first-decision read policy,
coalesced when due together. Metadata retains all 600 read weeks and 119 decision
blocks. Final lastQualifiedWeek is 6240; failure, guardFailure and artifactFailure
are all null. Source/HEAD/index, producer, dependency and reference guards pass.

The parent independently compared every one of the 1,072 command rows, excluding
only elapsedMs, and all 121 complete checkpoint value trees, excluding only
rss/maxRSS. Every remaining field matches original A and corrected C exactly,
including all 40 root identities at all 121 checkpoints. This checks the original
exact oracle without normalizing failure or authority values.

Initial checkpoint strings are literally equal across A, corrected C and D:
430,333 bytes / SHA256
`597997206fa098ec8664e58b797db30dee30ccd2063cdce371762f5c4159e614`.
Retained 3,120 and 6,240 raw files are also literally equal. Actual read checks are
within-run purity assertions; fresh-session response envelopes are not claimed
byte-equal across runs. Independent 1114-B supplies complete artifact/read/codec
and cadence review before publication releases maintenance.

## Frozen lineage and actual artifacts

Consumed index: 157,480 bytes / SHA256
`7c48ac7a48da588183cba0b971ef09fa087482d7cdbcce473976115aa20fa179`.
Producer: 70,857 bytes / SHA256
`eaeb7c077e4dfeff1398e4cc5f22cb484db82d18848950dc836d05187819588e`.
Correction proof: 1,061,030 bytes / SHA256
`ae8a5d0be192bd3373a993345b69785d49013b7bd57139934786a9fe794c9453`.
1108-A/B/C/D retain full reconstruction and closed compiler/verifier qualification.
The complete Endurance policy and original observation codec remain unchanged.
Save 38 / projection 53 / protocol 4 and schema d59e144e remain.

Seven actual files total **21,202,513 bytes** in the exclusive directory
`1052-c3-endurance-D-force-order-v1`:

| File | Bytes | SHA256 |
| --- | ---: | --- |
| authority-3120.json | 3,644,208 | `5fea7fc04ef6a16a636f376fcc4791f75f77926ead08ae0b598e566db9091050` |
| authority-6240.json | 6,720,108 | `c9bfb1428cf27dad13c26b6f135f3cd3ee00b9303c45076e97abecb357c8aab1` |
| checkpoints.jsonl | 1,199,770 | `e9a9576e968902310e335a689607d86d71add918c0c888ff54c82430d5df6c04` |
| commands.jsonl | 352,979 | `f406c54aaa4e82e534687b0c58c73d58af524ef7e47a34a6d91c2aecfe431a85` |
| failure.json | 314 | `427cd26d78925724101f2626fefa9db17aa2c69836124fbf2f9ac941a518d52e` |
| metadata.json | 1,135,769 | `a34c2f07f084cd68cb627dfe83c007ddb1eed9d685a822d0d41d2f4f4c3d5384` |
| observations.jsonl | 8,149,365 | `579943ea8c400af8b48561f5c0cbcf21a3d9417fbf41f74bbff6b451b5563dd0` |

Observed tick timing: median 13.900319 ms, p95 28.030987 ms, p99 35.459785 ms,
maximum 233.986765 ms at invocation 2. Sample peak RSS is 747,520,000 bytes;
process maxRSS is 897,604 KiB. These measurements do not establish a latency,
scale or platform requirement.

## Limits and next authorized work

Original A/B remain qualified at their historical source; the original C failure
remains immutable. Corrected C/D use the narrowly proved force-order source and
match historical A's commands/save/root authority. This is mixed-source
qualification, never four runs at one source or a relabelling of failed C.
Only A's three samples support the separate real-disk scope. Funding, scale,
native, canonical098 Writer-work and R8 timeout limitations remain unchanged.

After independent 1114-B KEEP, publish the closed D checkpoint and verify GitHub.
Then execute reviewed 1115's guarded 1093→1096→1110 application, keeping consumed
changes unstaged through verify-final. Apply modes use their own mutation audits;
read-only modes may use the fixed-source recorder. Independently review the final
applied diff, retain a recoverable candidate, then run the B5 focused leaf and all
exact 1103 paired/final gates with 1113's failure-reference index. Final current
regression and honest bounded C.3 qualification remain required.

1112-A/B/C/D/E and 1116/1117 are later P3 preparation only. The amended rival Actor
strategy has source-plan review; actual public directing credit, rival win,
affordability, lawful crew/pipeline and the bounded route remain unproved. No P3
source is released before C.3 qualification. P15 D2/D3/D4a remain unanswered.

Independent final 1114-B KEEP is frozen at 13,084 bytes / SHA256
`57e922c00650a31c6da489259406c6143edc9ba01293481b80673b1434ff4b50`.
It verifies all 600 reads (481 regular + 119 decision, no overlap), 2,400 exact
within-group repeated Industry pairs, all source/reference identities and complete
lossless decoding. Parent adopts this bounded qualification and releases the
reviewed maintenance sequence after publication of this closed checkpoint.
