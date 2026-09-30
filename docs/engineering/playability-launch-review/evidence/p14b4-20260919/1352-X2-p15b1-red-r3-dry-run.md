# 1352-X2: parent dry run of the P15B Wave 1 RED r3 (1352-C3)

Same scratch tree as [1352-X](1352-X-p15b1-red-r2-dry-run.md), with r2 reset away and
[1352-p15b1-red-r3.patch](1352-stage/1352-p15b1-red-r3.patch) (sha256 6a48ddd3…) applied cleanly.

[Output](1352-X2-red-r3-run.txt): **52 of 52 fail**. The reasons are the same three as in r2: missing modules, the ENOENT source read and the TUNING value. r3 adds the two leaves [1352-D](1352-D-p15b1-red-review.md) required:
- LOAN excluded outside warning and distress;
- LOAN excluded while founding.

It also chains the first-evaluation leaf into a second week. Next: a confirmation pass by the 1352-D reviewer.
