# Approved cache reclaim, 2026-10-08

The exact candidate manifest is `candidate-manifest.json`; the observed result is `result.json`. This run removed 11,446 regular, one-link, user-owned cache files: 1,473,088,506 logical bytes and 1,499,508,736 allocated bytes. Available space rose from 3,303,759,872 to 4,809,109,504 bytes (an observed increase of 1,505,349,632 bytes). The materializer's 3,758,096,384-byte threshold now has 1,051,013,120 bytes of headroom at the post-run measurement.

| Exact root | Removed files | Logical bytes | Allocated bytes |
| --- | ---: | ---: | ---: |
| `~/Library/Caches/Google` (Chrome disk, code, image cache only) | 6,038 | 425,288,443 | 440,377,344 |
| `~/Library/Application Support/Code/CachedExtensionVSIXs` (two top-level installers) | 2 | 122,463,823 | 122,466,304 |
| `~/Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage` | 5,274 | 759,013,802 | 770,117,632 |
| `~/.npm/_cacache` | 6 | 163,028,636 | 163,045,376 |
| `~/Library/Application Support/Code/logs` (inactive dated directories) | 126 | 3,293,802 | 3,502,080 |

Chrome was already closed, so no quit or reopen occurred. No npm process was active. `lsof +D` saw no open descriptors in the four cache roots; 38 descriptors in the active VS Code log directory. The same checks were repeated before deletion. Path ancestry, file type, ownership, link count, device/inode, size, and modification time were checked; no symlink was followed. No deletion errors occurred.

Skipped: the complete active VS Code log directory `20260925T171054` (46 regular files, 38,732,072 logical bytes); two small `.trash` VSIX signatures (25,355 logical bytes); and four root-owned npm subdirectories containing four files (65,011,867 logical bytes). The GoogleUpdater `crx_cache` contains only `metadata.json` and was left alone. Chrome profile history, bookmarks, passwords, Service Worker `Database`, and all repo/project files were outside the deletion roots. Repo HEAD remained `a39150b8827178b3797aa76f416df4a6416502a9` with a clean working tree.

Free-space readings are point-in-time; other system activity can change them. The difference between summed allocated bytes and observed free-space gain reflects filesystem accounting and concurrent activity.
