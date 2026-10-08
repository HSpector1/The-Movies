# H typecheck/collection runner independent static review r3

**ACCEPT_STATIC_ONLY; unrun.** The frozen six-file inventory and Python ASTs match exact hashes. The r3 synthetic checker passed pathname-replacement refusal, an already expired 300-second deadline, and SIGTERM cleanup of a harmless child in its own session.

The two r2 REFINE defects are corrected in source: the runner installs SIGTERM/SIGINT cleanup for `CURRENT`, blocks signals across child creation and assignment, and kills/joins the independent child process group before reporting interruption; the dependency audit now compares fresh post-read pathname `lstat` with the initial path and open descriptor `fstat`. It also checks the 300-second child deadline at each directory, entry and 1 MiB content chunk. The 330-second recorder still requires actual lane child exit plus a PASS result, not wrapper exit alone.

This static acceptance permits filling a new mirror-result-bound launch only after independently accepted H materialization. The dependency tree audit is before/after content and metadata validation, not an OS-enforced read-only mount. No full-era compiler, collection, game route or neutrality result exists under this package.
