# H bridge addendum r3 static review — ACCEPT, source only

The frozen r3 script and inventory match their stated SHA pins. The tiny static selfcheck passes H 58-file/1,357,248-byte and M0 63-file/1,517,743-byte Git rosters and H tar headers. It also rejects wrong pinned SHA, symlinked parent/leaf, growth beyond the read cap, and a replaced mirror parent.

R1 and r2 blockers are closed in source: pinned controls use nofollow stable parent dirfds and bounded reads; ambient Git variables are removed and origin URL plus source/remote refs are checked; the old full mirror proof and exact prior dependency-link tuple are bound to immutable results; the mirror root is held by a stable fd and rechecked through archive writes; the one-shot sibling receipt uses O_EXCL through a stable dirfd. Failure after bridge creation records STOP and leaves partial files for review. The 180-second deadline, AC/3.5 GiB preflight/3 GiB continuous floor and single lane remain.

This review accepts only static source. An exact launch must pin production HEAD `9651546af98c44f04e8b6b2714d10d67dadb8f9c` and the exact script/receipt. After execution, independently read back 1,402 regular files/99,516,095 bytes and the sole dependency symlink before any new H typecheck. The previous H typecheck STOP remains intact.
