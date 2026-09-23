# 727 — CORRECTION: the published RED identity named bytes that are not the committed bytes

Record 725-T and the five header files were published naming the requirement suite as sha256
`bf5fb83a…`, 573 lines, **26 failed / 2 passed (28)**. The file actually committed at `567c4eef`
and pushed is sha256 `68c76efe…`, 619 lines, **27 failed / 2 passed (29)**.

The published evidence described a file that is not the one in the repository. That is the precise
failure this program's evidence law exists to prevent, so it is corrected here rather than quietly
restated, and the cause is recorded so the habit that produced it changes.

## What is true, measured on the committed bytes

Re-run by the parent on `68c76efe`, the exact bytes in the repository, transcript archived as
`727-red-recheck-on-committed-bytes.txt` (38072 bytes):

| quantity | value |
| --- | --- |
| file | `tests/p14b7-promise-waiver.test.ts` |
| sha256 | `68c76efea8bc96724587cde0b81791b0ab43171ac0318bfa535b0bcc6b3217b0` |
| bytes / lines | 46720 / 619 |
| result | **27 failed / 2 passed (29)**, exit 1 |
| `git diff HEAD` on the file | EMPTY; working tree, blob and remote all agree |

**Attribution re-verified on these bytes, not carried over.** 108 "RED premise" guards in the
transcript, and the count of `AssertionError`/`TypeError`/`ReferenceError`/`SyntaxError`/`Error:`
lines NOT containing "RED premise" is **zero**. Two distinct guarded symbols, `waivePromise` and
`convertV31ToV32`. Every failure is a named missing export; none is module resolution and none is
a masked `toThrow()`.

The two passing cases are premise-proving rather than pins, and one of them is worth naming:

- *"the SAME window judged the `reclassifyPromise`-buggy way (its own window as the interval) would
  wrongly accept it — the trap is real"*. That case does not assert the desired behaviour. It
  demonstrates that the §3 trap EXISTS, by showing the buggy interval substitution accepting a
  substitute the correct one refuses. A trap proven by a passing test cannot quietly stop being
  true.
- *"LIVE_SAVE_VERSION and PROJECTION_VERSION are still the frozen values this suite must not move"*.

## Cause, which is the parent's

The suite grew from 28 cases to 29 between the engineer's hand-back report and the commit. The
added case belongs to the Owner's decisions of 2026-09-23, which the parent sent as a mid-work
message; that message arrived after the hand-back was composed, the engineer resumed, added
coverage for it, and the report on file was already written against the earlier bytes.

**The engineer did the right thing and the parent published a stale identity.** The parent hashed
the file, verified the run, THEN sent a further message that resumed the agent, and then committed
without re-hashing. A hash taken before an action that can touch the tree is not a hash of what
gets staged.

## The rule this produces

Re-hash an artifact immediately before staging it, not merely before the last thing that could
have changed it. Sending a message to a live agent is such a thing: it resumes that agent inside
the same working tree. The gap between "I verified it" and "I committed it" has to contain nothing
that can write.

## What is corrected, and what is not

CORRECTED in place: record 720 §8, and the five header files, to the identity and counts above.

NOT corrected: record 725-T is left as the engineer wrote it, describing `bf5fb83a` truthfully at
the moment it was written. It is their independent report and the parent does not edit it. This
record is the reconciliation, and 725-T is to be read with it.

NOT claimed: that the committed file is worse. It is better, since it carries coverage for the
Owner's approved remaining-obligation rule that the reported file did not. The defect is in the
published identity, not in the artifact.
