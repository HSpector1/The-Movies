# Verified duplicate archive cleanup

Owner requested removal of duplicate game files first, conditional on an exact GitHub backup and no current local need. Thirteen historical scratch archive output copies were removed after independent identity/dependency review, a fresh closed-file check, and exact pre-removal ownership/inode/hash checks. Every canonical archive remains in the production checkout and in explicitly verified GitHub commit 8cf0178da77f67a3fdd1f33cceb540823232aade. No source, original fixture, expanded result, manifest, candidate, Git object, toolchain or preview file was removed.

Logical bytes removed: 74,035,431; allocated-size estimate: 74,067,968. Actual volume free space changed from 2,656,064 to 2,718,060 KiB: **61,996 KiB (60.54 MiB) measured recovery**. APFS size estimates are not a recovery guarantee. Free space remains below the unchanged 3,670,016 KiB launch minimum by 951,956 KiB. No compiler or test was launched.

REMOVAL.json maps every removed scratch path to its retained local copy, immutable GitHub URL, Git blob and SHA256. To restore an old scratch output path, copy its retained canonical file there and verify the listed SHA256; alternatively retrieve the canonical path from the listed commit. Directories, historical producer scripts, manifests and their old output references remain unchanged. REVIEW.md records the bounded current-dependency check and its limits.

The active P15B r5q1 packet and prepared compiler/15-test runner remain unchanged. The main P15B → P18 objective is incomplete and needs restored launch reserve. Personal-file metadata and any iCloud decisions remain local and are not part of this GitHub checkpoint.
