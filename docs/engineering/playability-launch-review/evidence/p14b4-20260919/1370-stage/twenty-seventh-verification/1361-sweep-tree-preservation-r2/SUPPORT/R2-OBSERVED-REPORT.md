# Independent observed review — staged 1361 x2/x3 preservation r2

Decision: **ACCEPT_STAGED_RESTORATION_ONLY**. The staged archive passed the frozen r2 verifier, and a separate read-only comparison found both original source trees exactly match the manifest's source-state records. This receipt does not cover remote publication, remote retrieval, or deletion.

The archive manifest SHA-256 is `2ca6045473034b1c28218ed06de30dc26e47a2ff25ca12e564edeecedc9acf11`. The frozen verifier SHA-256 is `078130d2a23a50d2b4153056dfabaf2a8d2bda1afd185d9bbe0faa5be747c801`. It ran as `python3 -I -B .../verify.py --archive .../staged-r2` under the exclusive heavy lane at 18:27:43–18:27:51 CDT. The lane's `.meta` records **actual child exit 0**; the JSON log records PASS for both complete restored checkouts. The verifier checked empty-repository bundle acceptance, full `git fsck`, normal checkout, exact refs/HEAD/tree, copied exclude bytes, clean status, all seven ignored roots and 29 entries, modes, hashes, and 15 absolute live-repository links in each tree.

| Unit | Restored HEAD | Restored tree | Bundle SHA-256 | Extras SHA-256 |
| --- | --- | --- | --- | --- |
| x2 | `838dce0218d5c940cdcfd57e01232fbcd1082bf0` | `0165274ffeedc3783ef215e68b773b7e8a6b5410` | `f6aefbf6b601fb9e24823ff0800001e6ae295e7521125a7fa630e717a1020e8f` | `cfc21cdf4ef3d29c5760eafd60670f376aa934f58dbda6fc64d0be7e8b75a8ae` |
| x3 | `ee289de67e453ce269c98d840a48799265c62993` | `d8b993bb0c078613baa07313f7845367d5e90829` | `cc8ff0e976f661f71faca52b1adff11df1d37afeebfaebf479e61fce90349133` | `cfc21cdf4ef3d29c5760eafd60670f376aa934f58dbda6fc64d0be7e8b75a8ae` |

Each bundle has one segment (~16 MB), each extras tar is 2,336,244 bytes, and each exclude file is 50 bytes. Every published data file is below 48,000,000 bytes. A separate invocation of the frozen builder's read-only `source_state` function found exact equality to every manifest source-state field for both current originals, including refs, clean status, ignored inventory, and symlink dependencies. The live work branch remained at `b995a83e5363a3843f9b902e08c2df4dd95840cb` and clean.

For deletion eligibility, publish the staged data and hashes, retrieve them by a pinned remote evidence commit into a separate location, rerun the frozen verifier on those retrieved bytes, and independently recheck each source state immediately before removing only the exact x2/x3 `tree` directories without following links. Keep sibling sweep records and measure actual free blocks. The absolute symlink targets depend on the live Movies repository at its current path.
