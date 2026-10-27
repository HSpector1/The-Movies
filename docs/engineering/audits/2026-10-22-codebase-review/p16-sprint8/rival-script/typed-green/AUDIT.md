# Independent failed-binding postflight

Wrapper terminated normally with exit9,21:22:52–21:22:53, before child execution. Actual log is the manifest verifier's `AssertionError: HANDOFF.md`. Of1,658 source/input entries, only the relative HANDOFF.md pin mismatches; all remaining1,657 entries—including the absolute HANDOFF alias and actual game/test source—match. All six preflight pins match. HEAD remains selected `cf0e1cd47ba9974d540d3690f322c7192cc0037a`.

USED and focused.json are absent. No compiler or test child began and no compiler/runtime result exists. This is a coordinator binding mistake after the metadata update, not a game/compiler failure or repeated runtime. No owned runner/compiler/Vitest process or heavy-lane lock remains. Source freeze released for fresh correct binding.

Preserve this failed manifest and log unchanged; correct both aliases in a new run directory with fresh preflight. This audit wrote only AUDIT.md and performed no source edits or runtime.
