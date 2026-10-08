# H r4 preloader proposal r2 — scratch only, unrun

R1 is frozen at preloader SHA-256 `4f4b48aa3c73e5fee4332eaace523443ea9e2283624f9a38193095c2349c6062` and independent `REFINE_STATIC_UNRUN` receipt SHA-256 `b1642f5a0c17ae80ae4f709dcc2c4a96f01b4a9de884d27acc10d21d51e89f19`. This r2 addresses the demonstrated symlinked log-parent write into the observed root. It does not run H, Vitest, a heavy lane, or Git.

The preloader now requires absolute `H_ATTRIBUTION_ROOT`, `H_ATTRIBUTION_DEP_ROOT`, `H_ATTRIBUTION_PROTECTED_H`, `H_ATTRIBUTION_PRODUCTION_ROOT`, `H_ATTRIBUTION_NATIVE_ADDON`, and external `H_ATTRIBUTION_LOG` base paths. The `secure_log.c` N-API addon walks each protected directory and every log-parent component from a held directory file descriptor using `openat(O_DIRECTORY|O_NOFOLLOW)`. It compares device/inode identities of the log-parent ancestors to all four protected roots, opens a unique per-PID/thread regular log file with `openat(O_EXCL|O_NOFOLLOW|O_APPEND)`, and re-walks the paths after opening to detect replacement. The preloader brackets log creation with source-root device/inode/mode/link/mtime/ctime checks and records the addon binary SHA at startup. The native FD is written with captured original `fs.writeSync`; event hooks remain r1 behavior.

This design chose an addon over a recorder-passed FD. Node child processes do not inherit arbitrary FD 3 with ordinary `spawn` defaults, while workers and children both load this addon and create their own unique logs in the synthetic test. A recorder-passed FD would require a separate reviewed launcher or patching child spawn behavior and fail closed if an FD did not propagate. The addon is a larger review surface, so exact source, compiled binary, Node/header/toolchain and loader paths must be pinned before any real run.

Build command (scratch output only):

```text
clang -std=c11 -Wall -Wextra -Werror -fPIC -bundle -undefined dynamic_lookup -I/usr/local/include/node secure_log.c -o secure_log.node
```

Apple clang 14.0.0, target x86_64-apple-darwin21.6.0; Node v22.23.2 x86_64; `/usr/local/include/node/node_api.h` SHA-256 `cf2446da4783a707dc9399321cff3ea28dce86fafdf38746fc47f1b293f5a040`. The compiler returned zero with the macOS linker warning that `-undefined dynamic_lookup` may not work with chained fixups; the compiled Mach-O addon loaded in positive and RED synthetic processes. Binary and source hashes are in the companion parent message or can be recomputed locally. No package install or network access was used.

`node --check preloader.cjs` passed. `python3 test_synthetic.py` passed: three parent/worker/child startup attestations, 24 balanced operations, unchanged callback ENOENT, selected sync/callback/promise/FileHandle/stream/fd and root metadata APIs, and a `LOG_CAP_REACHED` marker within a 4096-byte per-process cap. Four RED cases pointed the log parent through a symlink into source, isolated deps, protected H, and production; each Node child failed with `H_SECURE_LOG` before startup, left no log file under the target, and left watched source mtime/ctime unchanged. See `TEST-RESULT.json`. Tests use only self-created temporary fixtures inside this proposal and remove those fixtures on exit.

Remaining limits and required recorder contract:

- The 4 MiB setting is **per process/thread**, not aggregate. The future recorder must enforce a 4 MiB **aggregate** event-log cap, a reviewed maximum process/thread count, unique log paths, complete startup attestations, and STOP if any log is missing, partial, capped, or has a write error. It must verify its exact allowed one-shot log root and keep evidence/other accepted receipts outside write grants.
- Path walks and rechecks detect preexisting symlinks and observed replacements; they cannot provide an atomic guarantee against an adversarial directory rename after the final recheck. The sandbox boundary, unique scratch ownership, root tuple guards, and STOP on any mismatch remain necessary. A detected post-open race can leave a log file in its held parent directory; the proposal does not delete it because that could create another mutation through a moved directory.
- Native/addon/shell actors can bypass Node fs hooks; uninstrumented descendants, ambiguous FD reuse, symlinked *operation* paths, overlapping operations, or missing attestations remain `UNATTRIBUTED_STOP`. The addon itself must receive independent C/JS static review and exact launch binding. No exclusive historical causal claim follows from these synthetics.
