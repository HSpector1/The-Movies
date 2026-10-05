# Self-contained accepted witness loader defaults

Separate scratch-only patch against the current parent B candidate helper, which already allows baseline265. No payload reads, runtime or parent-candidate edits. Parent supplies fixture publication and exact binary adoption.

Normal tests with no override now load the explicitly named repository fixtures through URLs relative to the helper:

- `tests/fixtures/p14/genuine-v45-recovery-witnesses-1368`, literal independently accepted manifest SHA256 `11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5`.
- `tests/fixtures/p13b/genuine-v26-period52-1368`, literal independently accepted manifest SHA256 `8e40e51bb360ba6ff6c0d641a03e90aa8ed6f73f8c0b232a9a4b5861af358db4`.

These are the exact parent-directed paths/pins after independent capture review, not inferred hashes. The accepted five45 rows are ordinary91, calendar104, research267, baseline265 and baseline280. The original45 producer still failed because operational was absent. This helper does not remove that missing key or change its outcome; requesting an absent row still fails exactly.

Explicit controlled-scratch overrides remain possible, but root and manifest pin must be supplied together. Half overrides refuse instead of combining an arbitrary path with the default pin. Every existing full manifest identity, named-row/payload hash, symlink/canonical path, public predecessor admission, input-neutrality, real migration and exact null/zero roundtrip check is unchanged. Tests no longer require external environment values for normal broad execution after fixture publication.

Parent should apply this one-file delta after fixed review, publish the exact approved fixture bytes, refresh source/input pins, then run the normal consumers without override variables. No runtime success or publication is claimed here.
