# Owner ruling — rival Set/setup policy, 2026-10-27

Owner (Dale), 2026-10-27, in session, choosing option 1 of the three presented:

> "go option 1, they finish making the movie on the other set (even though the set is not real) and then I own that movie once it is finished"

## Reading
1. Rival studios do not commission Sets, pay for Sets or select production setup recipes in this candidate. No rival Set acquisition, payment or recipe-selection policy is adopted. The shared setup mechanics (P13B plan lines 979/998) remain available for a future policy; nothing is removed.
2. An acquired rival production continues on its source studio's abstract stage, without a Set binding or setup record (`requiresSetBinding: false`, `setup: null`), through the existing continued-work producers, and the buyer owns the finished film and its rights on release. This is the existing Sprint 7/8 continuation design; the ruling confirms it as the intended gameplay.
3. The continuation refusals `retainedSetupWorkflowOwnerRequired` and `retainedEarlierSetOrSelectedTechnologyOwnerRequired` (`continuedWork.ts`) stay as consistency guards. They are unreachable under this ruling because no rival production carries a setup record or Set binding.

## Effect on Sprint 8
- REMAINING-PRODUCERS row "Setup, selected Set and sound/technology continued production": CLOSED, not applicable in this candidate, by Owner ruling. Sound/technology-locked rival continuation remains governed by the existing `retainedProductionTechnologyOwnerRequired` guard; rivals lock only `silent` today.
- NEXT-DEPENDENCY.md: the Owner question is answered; the dependency is closed, not waived into a hidden producer.
- Existing dynamic witness that the buyer owns the finished film: `tests/p16-continued-work-silent-phases76.test.ts` ("native wrap preserves production identity then explicit release publishes creator film buyer rights and a replayable current save"), part of the completed market/consumer checkpoints.

## Backlog (outside Sprints 5–16)
A rival Set/setup policy (when a rival buys a Set, with which account, which Set types, how it picks a recipe) is a later gameplay feature. It needs a save version, validators and Bridge text, and changes rival economics; it is not part of the P16 technical predecessor.
