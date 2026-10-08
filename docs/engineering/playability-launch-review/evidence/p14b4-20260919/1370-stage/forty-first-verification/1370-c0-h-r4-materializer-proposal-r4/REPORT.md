# R4 tiny synthetic report — source only

Independent r3 REFINE receipt: SHA-256 `0cf511defa69facdd8692dbe952c7c8de8824787d691f475e41f736af46ae9ad`. Its mocked RED observed `RED_DENIED_SIGNAL_LEAVES_DIRECT_CHILD_UNREAPED` in r3. R4's `denied_signal_red.py` uses two real `/bin/sleep` scratch children in isolated groups while denying group TERM/KILL through a mock. First, real signal-zero probes permit ESRCH after direct-child fallback and reaping. Second, signal-zero is also mocked EPERM: r4 reaps the direct child but returns `STOP_GROUP_SURVIVOR`, never claiming group clear. Each test finally checks the real group is gone.

A separate r3 stand-in RED at `/Users/zacheryspector/studio-scratch/1370-c0-h-r4-dep-manifest-static-red-r1/` found `build(fixture=True)` wrote `manifest.json` inside a protected stand-in and changed its root mtime/ctime. R4's existing `selfcheck.py` now refuses protected manifest output under H, dependencies, evidence, and their ancestor; it checks no file and unchanged protected root timestamps, and refuses a symlink output parent. An allowed sibling fixture manifest still builds and matches its inventory digest.

Commands, all exit 0:

```
PYTHONDONTWRITEBYTECODE=1 python3 -B denied_signal_red.py
PASS: denied TERM/KILL still reaps direct child; EPERM probe remains STOP; real groups clear

PYTHONDONTWRITEBYTECODE=1 python3 -B selfcheck.py
PASS: tiny clone/readback; protected result and manifest placement; streaming caps, noisy-grandchild cleanup, disk STOPs, ACL loss refusal

python3 -m py_compile materialize.py run.py dependency_manifest.py safe_output.py native_metadata.py selfcheck.py denied_signal_red.py
```

Exact SHA-256 pins:

| File | SHA-256 |
| --- | --- |
| `materialize.py` | `b0dfae70f81b98182f0e54ea267d555827b1780464c873744e859041175117fc` |
| `run.py` | `15cb068f892edf58941d0cfc029d3bccffc78994077dfc48d810320939d437cf` |
| `dependency_manifest.py` | `237297eaa4145ead916c1dcae9913923bdc68348d429039ebd6cf004d4431cb1` |
| `safe_output.py` | `e71cbeeca93a630c61f64e3e9dc032a62a45a8c03c8c9f069b01c38f7ebf2bc3` |
| `native_metadata.py` | `8860457b2b2157e10dc0ea0e52b25d1205e024ebc25cd62d514a1468b31de70d` |
| `selfcheck.py` | `9b9c7eebb5f5eaa136f79d381c828e93f983eab7cb0a4fbf449a770c321b933e` |
| `denied_signal_red.py` | `5379dd11cb70dab37b99109545aeeb84190ec9f912bec9550de8607543af2b1d` |
| `BINDING-UNFILLED.json` | `6a68a9bb95031bb73cb816541dc4867ec98244241433ba1b787e7016295e44cf` |
| `PLAN.md` | `b1750f160b9bd83961e12a7c5286350f45b9ce49e3bd9270f6fc9eb5ef27cb53` |

All launched processes and temporary writes were local synthetic fixtures. No real H/dependency scan/copy, heavy game lane, production Git edit, or protected mirror mutation occurred. The unfilled binding preserves `UNFILLED_UNRUN_NO_REAL_H_OR_DEPENDENCY_COPY`; independent static and exact binding reviews remain required.
