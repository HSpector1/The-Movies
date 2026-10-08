# Independent r4 exact-review STOP

Decision: STOP; no exact approval issued. Accepted r4 source receipt remains historical, but two concrete source/runtime defects now block launch on this runtime.

1. `materialize.inventory` calls `os.listxattr`/`os.getxattr`; Python3.14Darwin exposes neither. The builder reached this failure during read-only dependency inventory. The independent current-runtime attribute observations are in FACTS.json.
2. `materialize.assert_no_protected_writable_fds` invokes `lsof -F0pfn` and checks descriptor suffix u/w. Actual macOS field output supplies descriptor f12 without access suffix; access is a separate a=u/w field only when requested. The adoption proposal repeats the same error. Read-only full-output samples and their hashes are preserved beside FACTS.json. A faithful in-memory synthetic f12/au/tREG/protected-path record passes the r4 parser, demonstrating the missing rejection without opening any protected file for write.

Minimal versioned r5 repair should use pinned no-follow CLI xattr collection and parse the existing lsof access field. Add synthetic parser REDs for u/w/r, nonnumeric descriptors, process/FD resets and protected-root exact/prefix boundaries. Preserve source roles, the5field semantic rule, original guards, supervisor timeout and override-STOP. Independently review exact r5 source bytes before fresh binding. No game, copy, heavy test, source/Git mutation or old-worker signal occurred.
