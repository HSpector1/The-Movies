# 1081-A — Complete bounded Save As observation

1050 ran the independently authored/reviewed1076 producer on published e6475aca
with empty consumed-source diff. Recorder closed2026-09-27T02:04:36.929Z after
28.826 seconds (start02:04:08.103Z), child0 and fixedSource=true.
Producer18,769 bytes / SHA bfd541c4e7785f960095724b309689aba9a085cc2827ac8830740525d0072806
matched independently before/after. All original R8 assertions completed;
reserved/completed advances2/2, fresh factory calls1, all cleanup/input/source
and producer guards passed. Final marker: R8_ALL_ORIGINAL_ASSERTIONS_COMPLETED.

Actual sequence: Save As A207, advance208 with both career choices, Save As B208,
exact duplicate/no additional write, advance209, actual SAVE B209 and observed
clean catalogue, requireClean Load A207, actual close/restart preserving exact
A207/B209 records and separate session/journal authority, finally close.

Driver elapsed25,392.192ms includes separate operation and inspection phases in
raw1050. Real coordinator, codecs and default limits were used with an injected
in-memory store. This qualifies the complete semantic sequence on this source;
it does not qualify a five-second test budget, real-disk durability, native
behavior or a product latency target.1033 and1043 Vitest timeouts remain FAIL.
No test timeout, assertion, command sequence or runtime limit was changed.

Independent1076-B actual-result KEEP:31 PASS phases,11 operations13,622.770ms
and20 inspections11,579.045ms. Inspection includes real snapshot/catalogue reads,
so those durations cannot all be subtracted as test-only overhead. Reviewer hash
bb978511c6a02fa09ff78a50418cd75f1766f58b019c833233bf316b63fd1ec9.
