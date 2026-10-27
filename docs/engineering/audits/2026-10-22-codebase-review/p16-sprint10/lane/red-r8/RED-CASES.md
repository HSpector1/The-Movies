# RED premise at the parent a5a66c27 (worktree p17-red-20261027 at 9c9c8126: parent plus only tests/p17-p16-rights.test.ts and tests/helpers/p17-route.ts), 2026-10-27 17:32 CDT

Per-case result at the parent; the same file is GREEN 15/15 on the candidate 2c50c9df (green-r7).

- FAILED: the player's own sequel is a work of the parent property; its own concept founds no property and no R1 genesis — AssertionError: expected [ 'story-property:c-00', …(5) ] to deeply equal [ 'story-property:c-00', …(4) ]
- FAILED: the sequel's release is titled under the parent; the third installment resolves through it to the same property — AssertionError: expected [ 'story-property:c-00', …(9) ] to not include 'story-property:c-01'
- FAILED: a plain greenlight of the linked sequel's concept founds no clean title: the title holder's remake links to the parent — AssertionError: expected [ { id: 'rights-event-7', …(8) } ] to deeply equal []
- FAILED: the live save carries the franchise root at Save50 and round-trips byte for byte — AssertionError: expected 49 to be 50 // Object.is equality
- FAILED: an exclusive sequel licensee's sequel links to the rival's property and gains no title of its own — AssertionError: expected true to be false // Object.is equality
- FAILED: without the licence the player holds no sequel right in the rival's property: refused by name, nothing written — AssertionError: expected [Function] to throw an error
- FAILED: a licence that ends before the picture's earliest release week refuses at the greenlight, and the state is unchanged — AssertionError: expected [Function] to throw an error
- FAILED: a plain greenlight of the licensed sequel's concept needs the parent's remake authority, and refuses without it — AssertionError: expected [Function] to throw an error
- FAILED: committing it to release reads the grant again and refuses with P16's expiry; the tick never throws and the picture waits — AssertionError: expected [Function] to throw an error
- SKIPPED: once the parent's spin-off use is licensed away, a sequel to the spin-off film refuses naming the licensee — 
- SKIPPED: the main continuity is the title holder's sequel use and stays lawful for the player — 
- FAILED: both release that week, the sequel first; each continuity records its own release once — AssertionError: expected undefined to deeply equal [ …(3) ]
- PASSED: the release week replays byte for byte, and its save validates and round-trips — 
- FAILED: a healthy property may be rebooted (Owner choice); a fourth concurrent continuity refuses at three open and writes nothing — TypeError: Cannot read properties of undefined (reading 'properties')
- FAILED: a continuation citing an unknown film refuses before any write; a greenlight without a request writes no franchise root — AssertionError: expected [Function] to throw an error

Reading: 12 cases fail by assertion at the parent (no import-time failure); the replay case passes at the parent because the predecessor ignores the continuation request (RED only at 5a6fc0bb, as the re-review predicted); 2 cases are skipped there because their describe's premise could not be built at the parent.
