# 952 — outgoing T0 parity failure: causal attribution and preservation decision

2026-09-26. Source1f44aa505c0d677430451ab5fcacaf5e0ce205d6, consumed source
byte-identical to qualified9afae887. No production/test changes. Existing C.2-RM
qualification936 remains bounded by its own executed coverage; this is a newly
exposed old-source defect, not a retroactive all-green claim.

945 ran original944: child1, fixedExistingSource:true, zero outputs.948 ran bounded
diagnostic947: same failure, fixedExistingSource:true, zero outputs. Both reached
actual film releases17/26/35, announcement104, retirement208 and the public runtime
advance207→208. Failed producers/raw evidence remain unchanged.

950 ran read-only949 (SHA256999995103c1cf8b830f31228fb5abade714f68234bdb33481bdf5b34d7961f2a)
from19:07:45.950Z to19:08:00.229Z,14.279seconds. Child1 preserves the original exact
equality failure. fixedSource:true, empty consumed patch/untracked set at both ends;
no fixtures were written. Parent shell84587 closed. The recorder's shell0 means
source stayed fixed; it does not relabel child1 as a test pass.

| Controlled continuation207→208 | Exact save equality | Parsed differences |
| --- | --- | --- |
| Raw default tick vs raw develop:true | true |0|
| Raw develop:true vs only-negative-zero-normalized develop:true |true|0|
| Imported develop:true vs actual BridgeSession advance |true|0|
| Raw develop:true vs imported develop:true |false|12|
| Only-negative-zero-normalized develop:true vs imported develop:true |false|12|
| Actual BridgeSession vs original continuous default tick |false|12|

All12 differences are promise feasibilityReceipt.inputsDigest. Promise ids are
1,3,5,7,9,11,24,26,37,43,45,47. All other parsed save facts agree. The continuous208
save hash is7de879a5c7a5ab4ffdac819734957572aa58349c5d59768c572c249339739a7f;
actual runtime208 is414b3491ad4d6a7244c9af71e24a7bbe491106d9cf290e1ee30cb9a62b57fb84.
Both are1695188bytes. The actual saved207 hash is
d6ad88d432b3ec75fbf6a2843493240d4007892c8230aea1f9a2350adc8c1045.

Pre207 serialization normalizes exactly3 negative zeros, but that control has no
effect on208. Parsed207 and Bridge import values/order agree. Raw/imported207 have
9376 object-key order differences and zero different key sets. Native serialization
hashes differ; canonical JSON hashes agree. The six observed raw feasibility-owner
containers differ only in key order: production casts and workflows for rivals
r01,r02,r03. Post208 retains those order differences, with no owner-value difference.
No player picture releases at208, explaining why develop mode has no effect here.

Source attribution: save.ts stableStringify/build sorts object keys. promises.ts
receipt227 hashes JSON.stringify(inputs), while feasibilityInputs retains raw cast,
workflow, reservation and queue objects. Reordering equivalent input object fields
therefore changes this digest. These observations isolate serialization order as
the cause of this continuation mismatch. They do not establish a defect in the
separate detached capacity adapter, which remains outside this demonstrated path.

## Preserve the actual outgoing writer before correction

951 is an explicitly revised preservation producer, not a claim that failed parity
has passed. It will retain the original continuous scenario and its actual snapshots,
add the separate actual runtime208 Save37, and use that actual runtime current slot
in the real checkpoint with saved207 and one accepted journal command. It must prove
the exact known12 digest-only difference, retain both hashes and mark parity FAIL.
All normal save validation, codec/reopen/duplicate replay and no-overwrite/source
integrity checks remain. No receipt is repaired, no imported value is substituted
into the continuous state, and no failed artifact is overwritten.

The original scenario uses the supported tick default develop:false, including its
earlier releases; it proves actual takes/credits/retirement, not normal-play player
development. The runtime advance uses the real develop:true adapter. Their existing
distinction remains in the manifest. C.3's normal-play acceptance still requires
actual current-path work and continuation under the corrected writer.

After genuine baseline preservation/publication: independent requirement RED for
object-key-invariant promise input identity and actual save/reload continuation;
minimal production correction, separate stable review and focused checks. Existing
classification/reservation/ranking, receipt history and rule4 meaning stay intact;
no evaluator5 activation or capacity-kernel change is authorized by this finding.
Any version implication discovered by review must be resolved explicitly first.
Then proceed C.3 contract freeze/RED and implementation, carrying this regression
into matched full verification. No new Owner product decision is identified.

Independent read-only review by c2rm_contract_review supported the attribution and
both-output preservation decision. It classified the correction as serialization
determinism, not new product law. It also identified the compatibility limit:
newly computed persisted digests/state hashes may change. Preserve stored receipts
verbatim; do not claim unchanged same-schema journal compatibility without proof.
Final outgoing52→53 cutover must exercise its existing replay-authority reset;
any interim52 corrective checkpoint remains explicitly unqualified on this point
until tested. No production change has been made at this record.

Budget: C.3 reconciliation began after the18:26 C.2-RM gates. As of19:12 this remains
inside937's1–2h reconciliation/T0 allowance; the10–15h checkpoint and protected3–4h
verification reserve are unchanged. Earlier usage/overruns are not reset.
