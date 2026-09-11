# P12 R05 — Owner acceptance receipt

**P12 R05 — OWNER ACCEPTED — KEEP FOR DELIVERED, TESTED SCOPE.**

Authority: `OPS-P12A-R05-OWNER-CLOSEOUT-20260911-01`, Current Ops Owner acceptance and closeout. Recorded **2026-09-11 08:49:18 UTC / 2026-09-11 10:49:18 Europe/Paris**. Exact Owner playtest time was not supplied; this is the recording time.

Howard reports all five requested checks **PASS**:

1. Named campaigns load correctly.
2. Industry → rival/film/person/employer → Back works.
3. Save As and original-campaign preservation work.
4. Quit/relaunch and independent saved-state restoration work.
5. Large-text, scrolling and interaction checks work.

These are Howard's reported passes, without additional inferred observations. They do not claim he replayed every arrival date, long-horizon test, migration case, financial calculation or input device. Existing technical evidence retains its own provenance.

## Accepted identities

Candidate: `$HOME/Desktop/P12A-Living-Hollywood-Candidate-592e926-deca395/` (locally `/Users/bruce/Desktop/P12A-Living-Hollywood-Candidate-592e926-deca395/`). Launcher: `PLAY_PROJECT_STUDIO.command`.

| Identity | Exact accepted value |
|---|---|
| TypeScript runtime | `592e926bfbf4574df94b38fc8dd594fc5df2ac8d` |
| Unity observed/source-manifest HEAD, including later Tools changes | `2bc8d304b79a72bf20fda1d462ec3d96df253992` |
| Actual Unity player-build source | `deca39521da1baeca61898d156a43f4ae6a7e035` |
| Published technical evidence | `d4e1915ba075b4e4c1c9a6c880c8b0d4257659c0` |
| Protocol / projection / inner save / outer checkpoint | `4 / 29 / V19 / 1` |
| Schema | `sha256:8b2569b1f925bedf214ee556841fe28b61e544f1f13bb4741c84a0a318e81a85` |
| Generated DTO SHA-256 | `ae20ea85ba03e97101a3e4df7c2ceafa2da357d0560ed63f2041a960db1ebfe9` |
| Package checksum-file SHA-256 | `25facdbc105674ed86153568ac27b1e60558679431288ca7f9261b37a7c0ac64` |
| Build-manifest SHA-256 | `c99a53f9926b1fec161b0c62b8c6709a730b689548fdef2b5cd4f57568f1ffcd` |
| Launcher SHA-256 | `f866c468e9ac68c49bd27b73d58d282056c6e7be0871e35cd12ab3f6a7f3ed93` |

The closeout verified all **197 immutable payload files** against the existing package checksum manifest, matched the build/paired-contract/source-applicability manifests to the published [technical index](../../evidence/p12a/EVIDENCE-INDEX.json), and verified the declared equal Unity product trees against local Git objects. The remote implementation/evidence branch still pointed to d4e1915, which descends from runtime 592e926. No rebuild or runtime test was performed. This documentation successor is a separate identity and is not a new runtime, player or tools build.

## Qualifications remain open

- Large-world complete Save p95 remains **9.58 seconds** (9,577.75375ms; 20 measured samples after three excluded warmups). Native Save response remains **10.54 seconds**; Save was first observed reenabled around 11.79 seconds. Rendering progressed, but **UI-unresponsiveness duration was not measured**. Completion latency is not a measured freeze duration.
- Original serialize-plus-digest p95 199.524ms exceeds 100ms; Hollywood storage 37,829,874 bytes exceeds 8MB; average film 3,146.433 bytes exceeds 1.5KB. The documented, independently accepted current-reference rebaseline remains qualified; neither improvement nor Owner acceptance passes those original targets.
- Future 12-active/48-project/4,000-film/50-archived-studio stress and isolated write-worker handoff/queue/ack remain unrun. The measured already-encoded durable-write p95 53.5645ms covers its documented component, not the complete Save path. Load-ready p95 13.415s and standalone 4.821GB high-water memory remain reference costs.
- Intermittent **Reconnecting** observations remain recorded despite no recorded transport outages. Separate frame samples do not establish Save-time input responsiveness or an exhaustive stall bound. All other [performance qualifications](../../evidence/p12a/final-native-20260911/performance-attestation.md), [correctness limitations](../../evidence/p12a/final-native-20260911/final-correctness-applicability.json) and [requirement dispositions](../engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md) survive.

## Preservation and closeout

Bounded documentation checks passed: six allowed Markdown paths only, all 39 added local links resolve, all 136 requirement rows are byte-identical to d4e1915, and original status bodies and technical evidence are preserved. No product test suite was rerun.

This receipt supersedes pending Owner-acceptance statements in the existing execution/register/handoff snapshots and immutable technical evidence, solely for the delivered, tested scope. Historical failures, prior verdicts, original timestamps and technical artifacts are unchanged. Deferred features and downstream ownership are not activated.

Howard has now used the save library. His **current post-playtest campaigns and named copies are authoritative mutable user data**, not the earlier engineering fixture. Closeout did not open, hash, replace, reset or otherwise modify that profile, and did not require it to match pre-playtest hashes. The application, launcher and immutable payload remain unchanged. Private campaigns/credentials remain private; P11 rollback and earlier controls are preserved. No running application was launched, stopped or interrupted.

Publication uses isolated owned branch `docs/p12-r05-owner-acceptance-closeout-01`, descending directly from d4e1915. The acceptance/handoff commit is the commit introducing this receipt (`git log --diff-filter=A --format=%H -- docs/campaigns/P12-R05-OWNER-ACCEPTANCE-RECEIPT.md`), reported after normal publication. [P12→P13 producer handoff](../engineering/P12-TO-P13-PRODUCER-HANDOFF.md) reuses delivered records and preserves downstream boundaries.

Hook remains **INACTIVE / EXPLICIT-CHECKER FALLBACK**, unchanged. There are no gameplay edits, rebuilds, repeated suites, broad audits, main/campaign promotions, facilities implementation or P13 coding. With publication, implementation/runtime ownership is yielded to Current Ops; no continuing coding/runtime queue remains.
