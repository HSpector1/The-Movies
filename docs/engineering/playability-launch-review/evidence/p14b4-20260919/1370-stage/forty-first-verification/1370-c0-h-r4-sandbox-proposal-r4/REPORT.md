# Frozen source report — sandbox bootstrap r4

Decision requested: **independent static review of source only**. No H use has occurred.

Synthetic validation on 2026-10-08:

| Command | Result |
| --- | --- |
| `python3 -B bootstrap_selfcheck.py` | PASS; ordinary exact-policy `-p` generator created and read back final profile; moved held output parent under protected stand-in returned exit 1/PermissionError and no protected profile |
| `python3 -B selfcheck.py` | PASS; existing profile and descendant canary behavior |
| `python3 -B protected_red.py` | PASS; protected/alias output refused before protected timestamp changes |
| `python3 -B noisy_red.py` | PASS; bounded pipes, noisy descendant, timeout, nonzero and group cleanup |
| `python3 -B -m py_compile bootstrap.py generate_profile.py profile.py canary.py bootstrap_selfcheck.py` | PASS syntax; created only local scratch `__pycache__` files |

Core frozen source SHA-256:

| File | SHA-256 |
| --- | --- |
| `bootstrap.py` | `34c1579d302eff7925a7e65ea7bed82c74f00a7162a60c3cc4d63e2628313cd8` |
| `generate_profile.py` | `02bbadd5d7f4845a28ac54b2f9f06d6a9752e1191e9652b7357fd275b3255f88` |
| `profile.py` | `fa2b3fb4808ccf5fedf028f1a545cd8c9dae3a3ad9b5c1921d221f8e185c2b3d` |
| `canary.py` | `759c8689b46ea983d0c39d9dce9bc63e7488afe7bd5e8c886b46a85c23f94727` |
| `bootstrap_selfcheck.py` | `79fa6691023b91da21374d4745d1cc183554e7657afc850068d04e090bd76fbe` |
| `selfcheck.py` | `f68f7941e1817cb19688ba95bfb71a2852c9844491bcf3deb40fb27c3472a4cf` |
| `protected_red.py` | `a33e5135c5828e4d51c18981bf7f39e7538c8f5bfb65268a74d49bba6e6cb7ec` |
| `noisy_red.py` | `afcfb46acdc9603166fe0df84f563ddc5a9249cc9b0df88e49ff9028c5b29874` |
| `BINDING-UNFILLED.json` | `74e1caf755c70e994eb89a8ec9f74c5c8f8b51218e4fccb21cad2f70b03fddc6` |
| `PROFILE-TEMPLATE.sb.in` | `9a2df2ea9bc59f5eba2b2a5e54e2c29374c3da4f3e68218c21ae3ea7ab18530d` |

The moved-parent synthetic pauses within `profile.freeze` after its final held-parent pathname recheck. The test parent renames that held parent into a disposable protected directory, resumes the child, and checks for `PermissionError` plus absence of the profile at its moved destination. The ordinary and moved arms use the same `bootstrap.policy` and `bootstrap.command` construction; the deliberate differences are unique one-shot paths and synthetic-only pause. The test's binding JSON and output are disposable scratch fixtures.

Remaining gaps: no filled real protected set or exact H binding; no real local `sandbox-exec` SHA recorded in a reviewed binding; no actual H/evidence/dependency/profile path generation; no real-path ACL/mount test; no independent static review of r4 yet; no per-arm final-profile canary. `bootstrap.run` is a proposal, not a recorder or permission to launch H. If any of these fail independent review, retain r3 `REFINE` and STOP.
