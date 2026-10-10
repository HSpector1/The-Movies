# AP major lessons — update 1

Before publishing an evidence archive, compare the complete expected filename set from its manifest against the Git index. A successful directory-level `git add` can silently omit ignored evidence. AO independent review found three such files: two lane logs and an inventory README. The first root check authenticated all 460 staged files but wrongly treated that observed count as complete. The correct expected count was 463. Force-stage only the exact missing authenticated files, then verify complete set equality and every indexed byte. Preserve the initial incomplete verification and explicit correction.

Keep immutable patch evidence byte-exact. AO's archived forward/inverse diffs contain 26 single-space blank context lines across 14 files. Git's whitespace check flags these, but removing the spaces would change the reviewed diffs. Validate the exact bounded exceptions and report them; current HANDOFF/report whitespace checks still must pass. Do not claim an unconditional clean check.

An API specification must use the actual predecessor's exports. Review caught an invented capture-factory name before code. Read the original factory and call sites, then publish one consolidated final signature set; chained supersession paragraphs invite mismatched consumers. The observer repair needs one shared chronological error latch, while ordinary cleanup still preserves its original reset-over-end-over-body precedence when no observer failure exists.

Keep resource refusal separate from operational format failure. An exhausted count must fail before any conversion. A native sink can prove that canonical input alone exceeds its physical row capacity and preserve the original row-byte refusal before parsing; a direct codec input beyond its work bound instead reports an operational format failure. Tests must distinguish the exact predicates. First native operational errors produce no misleading row-cap diagnostic for a later resource failure.

AO lessons and evidence are frozen. New discoveries belong here and must be carried into the next published checkpoint with their actual review and runtime status.
