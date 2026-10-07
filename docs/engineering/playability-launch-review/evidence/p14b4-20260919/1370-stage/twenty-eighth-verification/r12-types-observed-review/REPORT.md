# Independent observed r12 types audit

Decision: **ACCEPT_OBSERVED_R12_TYPES_ONLY**. Scope is the four frozen TYPES_ONLY leaves; no clean simulation or ledger acceptance is claimed.

Observed UTC: 2026-10-07T23:44:35.821349+00:00

- Frozen package, launch plan, static receipts, source HEAD/tree, clean branch, and remote source pin verified.
- AG:p13a-core-causal-01: actual lane child exit 0; target and recorder STAGE_PASS; sidecars, source, environment, and cleanup verified.
- AG:p13-public-commercial-adoption: actual lane child exit 0; target and recorder STAGE_PASS; sidecars, source, environment, and cleanup verified.
- E0G:p13a-core-causal-01: actual lane child exit 0; target and recorder STAGE_PASS; sidecars, source, environment, and cleanup verified.
- E0G:p13-public-commercial-adoption: actual lane child exit 0; target and recorder STAGE_PASS; sidecars, source, environment, and cleanup verified.

- `AG:p13a-core-causal-01`: run `r12-ag-p13a-types-20261007-1830`, target `a4d0962fab7e4b1e28b535c5782aae0fce109e0460ea417ca2c445689062f507`, outer `347f463ad3782ebfae2cc7081a48a016c56f5b247ba80e3abe7c96f9f1dc2c8c`, elapsed 48.363s, free pre/post 4634476544/4628373504 bytes.
- `AG:p13-public-commercial-adoption`: run `r12-ag-adoption-types-20261007-1830`, target `4f06a8a26d4f594c6c9becefd643379b48bee4c7c6ccf936a0dcda791796c268`, outer `920267d462073965ec60652bd3431eba3f4d40ec8f982bc8d56d3816e9edb9df`, elapsed 56.689s, free pre/post 4628217856/4622508032 bytes.
- `E0G:p13a-core-causal-01`: run `r12-e0g-p13a-types-20261007-1830`, target `8f54e63a93422875963ead051a64cb256463f26e81af9e49441fbe66505076cb`, outer `411af355a2d6daea1faa2351989878d8b775089f14f21638b4d9fabfcee8d63e`, elapsed 32.388s, free pre/post 4622200832/4615962624 bytes.
- `E0G:p13-public-commercial-adoption`: run `r12-e0g-adoption-types-20261007-1830`, target `fa903e755d4bb1d9e1a90e3a3b26c25ceef3e6d80d1f831b6dbe131e18248d80`, outer `3d0da7c5993f22a33b47bac7d3ad30dd64d6b7f4394de37a8e38736559cfd874`, elapsed 34.626s, free pre/post 4615913472/4609720320 bytes.

The receipt pins only observed type-stage results. Clean route commands must independently verify it and retain all other admission guards.
