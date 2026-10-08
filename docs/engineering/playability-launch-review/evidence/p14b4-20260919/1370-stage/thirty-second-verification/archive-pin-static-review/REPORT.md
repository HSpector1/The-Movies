# E0G adoption archive pin inventory r2 — independent static review

Decision: **ACCEPT_STATIC_E0G_ADOPTION_PIN_R2**. This is static admission for one inventory attempt only; no source inventory, archive build, Git mutation or deletion was executed here.

The frozen script SHA-256 is `4802f4b114ff962ea9fa37374dddbb7e3b134e8ddb7f3f96b074565f773db99b`; PLAN SHA-256 is `e11b375466656ed1f0c3394c66f01b93dd8651163c8e65feff6723099fc99a47`. It pins the independently observed adoption receipt SHA-256 `3f833354bf9eeff08a8c4e82cd235b85a0875c323b7e30f68e8eafd9b489f8c7` and separate full-boundary review receipt SHA-256 `0a672b38e5d9c810cb82aa24fa26c47b2e5b1071b02a8daa3e9157bd0cc9196d`, with their exact decisions and source identity. The proposed output directory was absent at review.

The script binds role `e0g-adoption`, E0G arm, adoption seed, exact r12 run, exploratory `720/750` target/recorder, clean `STAGE_PASS`, type admission, source HEAD/tree, source lane child 0, and the 3 GiB floor. It walks the entire target/outer trees and both lane files through no-follow FDs, hashes regular bytes and captures directory modes and symlink targets. It sorts canonical 417-boundary capture inventory by byte-encoded path and checks observed target/outer, boundary and lane digests. The generated 22-field PIN matches the accepted r3 package.py required field set/schema; archive role/run/path and source-inventory digest rules align. Both generated build/verify commands use the reviewed r3 archive code and distinct recorded lane logs. Output creation is anchored and exclusive.

The script still requires an independent observed review of the actual SOURCE-INVENTORY, PIN and commands before archive execution. It does not promote exploratory timing into prospective acceptance.
