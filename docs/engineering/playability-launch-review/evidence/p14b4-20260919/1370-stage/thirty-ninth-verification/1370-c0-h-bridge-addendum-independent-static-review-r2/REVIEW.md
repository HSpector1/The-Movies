# H bridge addendum r2 static review — REFINE

R2 fixes all four r1 findings: pinned parent traversal, clean Git environment and origin URL, exact failed-result dependency-link tuple, and stable nofollow result dirfd. Its H and M0 rosters and H archive mode/size fixture pass. The route remains unrun.

Two gaps remain before a destructive mirror addendum. `read_pin()` (lines 50–62) appends chunks without a cumulative cap, so a concurrently growing control can exhaust memory before pathname drift is detected. `old_mirror_proof()` and `open_dir()` (lines 84–115) do not authenticate the parent chain of MIRROR; `O_NOFOLLOW` protects only the final component and a replaced parent can redirect proof/mutation. Version r3 with incremental read cap and a stable nofollow mirror parent/root fd, including synthetic growth/symlink-parent refusals. Keep r2 frozen and unrun.
