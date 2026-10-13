# Funding refusal owner label: static review

GPT-6.1 Sol. KEEP exact test-only patch8ef4b6a361ddb161cecd913ea0c3635428c97041b93d6692490481aaa1795379 for later installation/qualification; no execution or frozen-source writes.

Source confirms live P15B/48 full admission delegates its predecessor era at save.ts:11543; validateP15BPredecessorEra aliases validateSaveV47Era, whose validateFoundingFunding call:11404 explicitly supplies validateSaveV47. Thus this spentBonus mismatch is correctly labelled by the preserved47 authority owner even when the admitted outer envelope is current48. The literal expected full message matches that owning validator; it does not retag the save or assert live version47.

Diff changes only expected refusal prefix plus explanatory comment. Historical genuine45 fixture/pins, current48 version/export assertions, exact remaining spentBonus discrepancy text, Start/Saves refusal, active-session preservation, purity and240s budget remain. No generic throw/regex broadening, reader modification or suppression. Original actual UI failure remains; downstream assertions still require actual complete-file qualification.
