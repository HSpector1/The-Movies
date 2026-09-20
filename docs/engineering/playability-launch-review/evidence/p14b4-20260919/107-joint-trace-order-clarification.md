# 107 — independent author approval of one pre-execution ordering correction

APPROVED, native test-author. No runtime or live/draft-test edit in this task.
Frozen95 original remains SHA-256
`b094de96394d4478d000c79ec7600643fcff0b63872c460cf9fa190fe94ada99`.

Independent98 correctly identified an overconstraint in the writing-release case.
91 requires the complete executed-path membership and deterministic canonical
results across input permutations; it does not legislate lexical path order.

Authorize exactly this single-line installation delta, besides the parent's
provenance comment:

```diff
-    expect(result.countWitness.executedPathKeys).toEqual(['G', 'W'])
+    expect(sorted(result.countWitness.executedPathKeys)).toEqual(['G', 'W'])
```

This still requires both and only G/W, including uncredited writing background W;
sorting neither removes duplicates nor permits omission/addition. The independent
full witness checker already requires exact complete-path membership and unique
path count. Full-result permutation tests still compare the unsorted returned
proof arrays and workUsed exactly, so canonical output remains enforced.

No credit, ledger, profile, status, completeness or runtime assertion is removed.
This is a requirement-backed pre-execution correction, not a response to a
failing implementation or permission to normalize returned results elsewhere.
No additional concern in this exact delta. Parent will install a byte-asserted
derived variant; original95 and all execution evidence remain distinct.
