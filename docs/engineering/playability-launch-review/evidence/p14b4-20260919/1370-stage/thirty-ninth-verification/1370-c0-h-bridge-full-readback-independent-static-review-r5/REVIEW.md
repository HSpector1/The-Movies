# H bridge full readback r5 independent static review

Decision: ACCEPT_STATIC_H_BRIDGE_FULL_READBACK_ONLY. No readback/game/heavy lane was run.

The r4 run stopped before traversal because a path-substring guard rejected the accepted exact review path. R5 replaces that guard with separate exact static/exact review path, SHA, and decision pins. The actual r4 binding passes the corrected check; swapped paths and wrong exact SHA refuse. R5 also requires the observed r4 STOP receipt and its error/source/output identity, preserving the failure rather than relabeling it.

I rehashed all ten frozen manifest members; ran the source selfcheck successfully; inspected the narrow r4→r5 delta and bootstrap/spec consistency. Inherited 600-second child timer, 1,500-entry/16-entry guard, 1,402-file/99,516,095-byte target, node_modules link continuity, source/ref/AC and output refusal guards remain in the frozen source. This verdict authorizes separate recorder/exact-command review, not execution or acceptance of the full mirror.
