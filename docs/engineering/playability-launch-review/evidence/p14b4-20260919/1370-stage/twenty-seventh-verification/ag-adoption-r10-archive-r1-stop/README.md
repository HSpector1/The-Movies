# r10 AG adoption archive r1: stopped at storage bound

The independently static-reviewed r1 builder stopped with actual child exit 1 at its own 64 MiB xz-output cap. It produced no complete archive or manifest. The exact build log, lane metadata, builder, request, static review and failure assessment are here. Its invalid 65,930,164-byte `.partial` had SHA-256 `41a8ed256a5b6b2ac0fcd381a435b417a60fc2509a2aaeffc26cf3050e305c32`; that temporary was removed only after exact hash verification to recover disk reserve. The original failed game leaf was untouched, then successfully archived under the separate reviewed r2 path.

The r1 stop is operational evidence only. No r1 archive was accepted, and no game-run result was relabeled.
