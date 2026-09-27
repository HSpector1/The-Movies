# 1106-A — Endurance C stopped on exact reload-parity mismatch

1070 closed child1/fixedSource:true, source c362bab94678a21b8d9ecb98bed5d6635a664d27,
empty consumed diff/no untracked source. Actual interval2026-09-27T04:31:47.568Z
to04:34:35.092Z (167.524s). No heavy process remains. Exclusive output
1052-c3-endurance-C-recording-v1 is immutable; no continuation, retry or D release.

C completed1352 attempted/returned ticks,247 commands/engine calls,6creators,
29commissions,28greenlights/releases,5set actions,14attachments and26read groups.
Metadata/failure report FAIL; guardFailure/artifactFailure are null. All247
recorded command semantic rows match A. Checkpoints0–1300 (26 boundaries) match
A's complete save and all40 root identities. The recorded1352 boundary differs
in careerEvents/talent/studio/studioHistory; counts and focus values match. Its
same-length1718093-byte canonical save hash is
6b499ded1228bfbd7d427367f0a4a131679dcb1d53434360023a60052e14b6aa.
The phase label week1352/command246/slot-28-commission is last execution context,
not proof that this command caused the difference. Per-tick rootsBefore contains
three counts, not hashes; equal tick rows cannot prove equal intervening states.

The first differing retained immutable film/history is prod-1303, released1311:
criticMean A66.97542585609143/C66.97542585609145 and criticScore
A52.82440066110527/C52.82440066110529. Six career events carry that changed score;
two genreExpAfter values also differ. Independent1106-B accounts for all scalar
differences and guards the bounded inference. Actual replay is needed to show
where whole-state equality first breaks, rather than inferring it from history.

Source examination identifies reception.ts393 and forecast.ts218 iterating
Object.keys(market.forces) for floating-point sums. worldgen.ts118 already defines
the canonical FORCE_ORDER, and hollywoodTick industryMarket rebuilds that order
for rival arithmetic after loads. Canonical export changes record insertion order.
This is a concrete correction candidate, not yet a production fix or GREEN result.
No float tolerance, rounding, canonical-save normalization or changed expectation
may hide it.1107 records the narrow next test/source/lineage contract.

Six retained files total5991725 bytes:

|File|Bytes|SHA256|
|---|---:|---|
|authority-failure.json|3799064|f1a7a70941b1d2804efd9173359a72d78330284c968afa53a9fbad26ecda085a|
|checkpoints.jsonl|260382|126ec59f486a544d46bf23bed244ec293076222044c4531239e059368f90aa60|
|commands.jsonl|79582|5f269de5e712452af8a0d87fe3464f5c984266174920b606984181007114ebf2|
|failure.json|428|68a6c2418c5e1ab8d4050d37cd417682fbe45c775e1d3cd685cb3923dc109110|
|metadata.json|1127977|f3bc8dd69ddba92b54fd76f42a8bb88c0f997c31031b3227ad4b65357038b4d0|
|observations.jsonl|724292|c6afcc2f16571bcabba532318e0d2221e2f63d7c489df3f0ad1a4d6c8d7db62d|

The failure authority preserves accepted last-qualified1300 raw save and explicitly
labelled unvalidated1352 state text. It is not a qualified1352 checkpoint. Original
A/B PASS records and all prior failures remain.1093/1096 stay unapplied; all final
1103 gates and native/Owner limitations remain outstanding.
