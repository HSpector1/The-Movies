# H bridge addendum launch r1 — exact REFINE, unrun

This versioned correction supersedes the earlier exact ACCEPT receipt, which overlooked the outer deadline. `lane-run.sh 0` starts the supplied Python bootstrap without a whole-child timeout and logs the child exit while returning wrapper exit 0. The bootstrap authenticates files before `add_bridge.py` begins its own 180-second SIGALRM timer; therefore the frozen launch has no enforceable whole-command/recorder bound. It must not be run under the claimed 180-second route.

Keep the frozen command unrun. Version a separate bounded recorder with an explicit whole-invocation limit covering bootstrap, child and process-group cleanup, preserving the true child exit and one-shot result. Then independently review the new recorder source and exact filled command. Static source acceptance and the previous H typecheck STOP remain unchanged.
