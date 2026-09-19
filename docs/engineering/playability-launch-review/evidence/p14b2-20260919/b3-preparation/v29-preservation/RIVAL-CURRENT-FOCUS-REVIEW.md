# Final V29 current-rival focus correction — INERT / UNEXECUTED

Prepared during the parent-owned frozen B-F2 full run, session20565. No executable
source/test/config/fixture edits, runtime/probes/typechecks, Git commands, commits,
new agents or minted outputs. Only this brief and the separate inert patch exist.

Patch: `final-v29-rival-current-focus.patch.txt` (68 lines), SHA256
`c641bb96e9bffeaf7d269e7331a52eee4338185f63f337652d8d47d95a313810`.
Its future target is `tests/bridge-p14b4-mint-v29.test.ts`, not the preserved draft.
Parent must independently review before any eventual installation/application.

## Exact bounded change

The original minter focused every unbound root in `rivalFixture().open`; that
predicate includes abandoned history. A CURRENT rival attachment may coexist with
other unbound roots, particularly as more natural people become P1-eligible.
The patch instead starts from actual CURRENT rival proposal references and joins
each reference to exactly one root with the same issuer and beneficiary.

Hard guards require a real entered rival, one matching open case/current proposal,
one attachment, exact P1/count1/full-proposed-term predicate/window, unbound OPEN
status with no progress/evidence/outcome fields, an original achievable receipt
at submission week, and a unique actual proposalSubmitted receipt for that tuple.
The focused set must be nonempty and unique; no dropped or invented IDs.

Only `focusPromiseIds` changes. The actual saved state remains `rival.open`.
Full snapshot byte equality before returning scenarios and exact original receipt
equality ensure selection did not mutate any campaign fact. ALL historical roots
and their receipts remain, including unbound roots that are no longer current.
The existing shared support still verifies save/import/bridge roundtrip equality.
No shared-take, nine-case count, gate, output, timeout or support redesign.

## Preserved originals and execution limits

Original final minter remains SHA256
`609b129d87498a5090cf7fdc7a33c8d539d8346f63c8b269f8fcb0e295e6da4f`;
shared support remains SHA256
`3695a05ca60f8d87420cd237fbe40cbca0f778ae96b8a45643cc21079976c011`.
Neither original was overwritten. Existing MINTER-BRIEF remains unchanged.

All new joins/assertions are UNEXECUTED. If the actual natural current snapshot
has no matching attachment or an ambiguous submission receipt, preserve the
failure and diagnose it; do not broaden the focus back to unrelated history.
Minting remains strictly after B-F2 full qualified closeout, exact publication
verification and a parent-assigned one-shot runtime window, before the P2 writer.
The nine-save corpus and separate outgoing46 runtime checkpoint remain distinct.
