# 1242-D — Pending-quote alias type correction

1241b actually failed once on published `99b80bc50ecb45fa3804406416425434769d7c7f`: child2/fixedSource, empty consumed diff/untracked, no signal/error; 27.966 s. Its sole diagnostic is TS2322 at `tests/bridge-p14b3-promise-command.test.ts:222:5`: DIRECTING_COUNT is not assignable to APPEARANCE_COUNT. The full raw/records and frozen1242 artifacts remain unchanged.

The prior actual-P1 helper narrowing is correct for numeric count mutations, but the existing pending-quote leaf deliberately changes the same caller-owned promise's family after quoting. This one local now declares `const wire: Payload = payload(talentId)`, using the existing public payload type. Its literal initial P1, direct same-object `.family = 'DIRECTING_COUNT'` mutation, all other mutations, quote/commit sequence, identity-retention assertions, leaf title and timeout remain exact. No replacement object, cast bypass, new behavior or expectation change occurs.

This is an unapplied one-line type annotation under evidence. Removing only `: Payload` at the named local reconstructs the entire live preimage exactly. No compiler/test/project evaluation, live source/index modification or commit occurred. Parent owns independent review/application/publication and the next compiler observation; no PASS is predicted.

- Live preimage: 35,044 bytes / `ef4d2356f78173a0685dd23f3d1c6b2408a8f9330003931982c39dfa83e4ce8d`.
- Staged postimage: 35,053 bytes / `d5213c0fe39c24e4f9fa216dbebd141ff0be0e2c278643df3b850b8f0258ea3b`.
- `1242-pending-alias.patch`: 575 bytes / `e84f477cae631a5a22b4a9be10008d5d71d7a4f3ac43e74ede28bcbda730e692`.
- `1242-pending-alias-manifest.json`: 1,820 bytes / `dc937018a582e874688e64e79be41da30c41660790ada44e5af5e20f9ce26cd9`.
