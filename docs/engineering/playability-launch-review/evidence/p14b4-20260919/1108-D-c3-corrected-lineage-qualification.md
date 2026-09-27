# 1108-D — corrected endurance lineage readiness

The reviewed 1108 source passed its compiler and data-only verification gates on
published `d41a337b7bd6cadb0824abd9818f686879c34608`. This qualifies the adapter
for a fresh corrected C attempt; it does not claim any corrected endurance result.
The bounded production correction and its actual RED/GREEN remain in 1107.

| Recorded gate | Actual UTC interval | Duration | Result |
| --- | --- | ---: | --- |
| 1082-c3-corrected-lineage-types | 2026-09-27 05:14:18.805–05:14:52.877 | 34.072 s | Child 0; 386 roots, 727 source files, zero diagnostics, no emission |
| 1083-c3-corrected-lineage-verification | 2026-09-27 05:15:03.836–05:15:12.477 | 8.641 s | Child 0; complete reconstruction, both historical inventories and 36 refusal controls pass |

Sessions 72541 and 50843 are CLOSED. Both recorder results have fixedSource:true,
the same full d41a337b HEAD, empty consumed diff (SHA256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855)
and no untracked consumed source. Original raw logs and records are preserved.
The compiler marker records actual guarded input bytes before and after. The
verifier rechecks the consumed index, all declared inputs and both inventories.
It performed zero simulation ticks, zero simulation commands and zero artifact
writes. Its synthetic predecessor controls remain admission-only evidence.

The exact corrected index is 157,480 bytes / SHA256
`7c48ac7a48da588183cba0b971ef09fa087482d7cdbcce473976115aa20fa179`.
All 1,660 original files are reconstructed from 1,661 corrected entries by reversing
only the four reviewed production changes and removing the single pinned test.
The eight adapter hunks reconstruct all 69,157 original 1098 producer bytes; its
unchanged proof reconstructs original 1052. The complete 43,293-byte Endurance
policy and observation codec remain unchanged. Exact supporting identities are
in frozen 1108-A/B and the actual 1082/1083 markers.

Executing producer: 70,857 bytes / SHA256
`eaeb7c077e4dfeff1398e4cc5f22cb484db82d18848950dc836d05187819588e`.
Correction provenance: 1,061,030 bytes / SHA256
`ae8a5d0be192bd3373a993345b69785d49013b7bd57139934786a9fe794c9453`.

After independent actual-gate review in 1108-C and a recoverable GitHub checkpoint,
the parent runs only fresh C in `1052-c3-endurance-C-force-order-v1`, with original
A as the exact baseline and original B as the historical predecessor. Its actual
publication HEAD must be supplied explicitly. Freeze that HEAD, index, consumed
bytes, producer/proof/dependencies and all reference artifacts for the whole run.
No maintenance patch is applied. D requires actual C PASS and independent artifact
review, and uses the exclusive `1052-c3-endurance-D-force-order-v1` output.
Docs-only publication between C and D is allowed with exact consumed identity.

All original A/B/failed-C and both forensic attempts remain immutable. The final
claim will be mixed-source: original historical A/B plus corrected C/D, each
matching original A's exact commands and complete authority. No old failure is
relabelled. Final 1103 qualification, inherited limits and native deferral remain.
