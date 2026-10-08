# Adoption comparator observed-audit r2 static review

Decision: **REFINE_UNRUN_OBSERVED_AUDIT_SOURCE**. `audit.py` and `PLAN.md` match their frozen manifest hashes and Python syntax parses. Its fixed production HEAD/source, d8cb evidence tip, E0G stage32 and EBG input pins, 417-row horizon, and 30-family terminal approach are directionally correct. The following issues prevent an audit launch:

1. `P13A_STOP` names a nonexistent directory. The preserved r3 STOP is `1370-e0g-ebg-b-only-p13a-comparator-runs-r3/20261008-bonly-p13a-r1/RECEIPT.json`, SHA `03ba66a7e680b217bf3f900dd4234a9832f0657fbc3970bce4d01067be97902d`.
2. `OUT.parent` is absent and `audit.py` does not create it. Both the STOP and completed branches would fail to write their one-shot audit. A corrected design must make output creation explicit and fail closed on collision or symlink.
3. The refund assertion permits negative zero (`-0.0 == 0`), and Python equality on Save46 state and terminal rows ignores signed zero and object key order. The observed audit needs strict type/order/sign checks before claiming original-row equivalence.
4. The comparator lane `.meta` is searched as a whole for `end, exit 0;`. Parse the actual terminal event line; success and STOP must each match the recorded child exit.
5. `pinned()` lstat-checks then reopens by name without `O_NOFOLLOW` or identity recheck. For the 141 MiB captures, check AC, disk floor and the whole-run deadline during streaming reads, not just between major phases.

No heavy audit, Git mutation, or diagnostic acceptance occurred in this review. Preserve r2 and version a corrected source/manifest before an exact launch.
