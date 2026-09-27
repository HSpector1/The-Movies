# 1146-B — Matched cancellation/waiver source and type review

**KEEP the frozen three-file candidate for the unchanged D08/D12 observation.** Independent read-only source review and closed compiler inspection are complete. No behavior result is claimed for this candidate; no tests, compiler, project imports or gameplay were executed by this reviewer. This record is final for these bytes, with no delayed append.

The complete production diff is10441 bytes/SHA256 `5fb6330594229322c7f1266a3cc62e3f4027d45e86e4d5bebb4983cbe1b58177`, against `32e5016537baabdbe2d84cc484369c9ecf0850fc`. Independently verified images:

| Path | Bytes | SHA256 |
| --- | ---: | --- |
| `src/core/promises.ts` | 95459 | `2318928d2c33587e8ebefabe293b4f97814ffabd9944fcb1dd446c61b768cb87` |
| `src/core/save.ts` | 468658 | `52f6e172e11ae0ae4a54324196c6f7e48d6cc506afc3316706278835f000e540` |
| `src/core/types.ts` | 120657 | `2455daf51965c3d300b3130f53ed1134e6f704934578e7776fc938d7894f4fa2` |

## Matched semantics and preserved boundaries

Cancellation dispatch now selects the recorded Director seat for explicit Director promises, retaining existing cast selection and its exact cause for older predicates. The existing post-cancel target-specific impossibility proof and settlement owner remain in place; only the Director cause text names directing. A recorded first take still prevents this pre-take-cancellation failure path. No new history or evidence is invented.

Waiver domain selection uses predicate shape. Explicit Director and cast domains refuse each other; historical count-only P3 stays in the cast domain. Same-domain Director work reaches the existing terminal, bound-contract, identical, forward-window, remaining-count, trust and achievable-feasibility guards. P1/P2 subset strength remains in the cast branch. The minted successor uses its actual receipt revision and an explicit Director predicate where applicable; unscoped legacy receipts remain revision4, while scoped scalar revision6 is retained without being misread as a Director predicate. The original outcome owner still writes the single WAIVED receipt/link and retains earned progress/evidence. Action typing adds the already-reviewed Director predicate without a new command.

The current39 relation check runs after complete delegated row, contract, evidence and frozen link admission. It requires a Director WAIVED original to name a later, uniquely linked successor of the same domain, contract, beneficiary and issuer, agreed at the waiver, with a forward window and enough remaining pictures. Its ordering and uniqueness checks match append-only public minting and permit subsequent lawful successor waivers. Legacy-to-legacy links remain governed by the frozen policy; public V32 and V38 do not call this additional checker. Existing whole-current proof and guarded old projections are unchanged.

Review identified one missing relation condition in the initial10269-byte patch `3e5c428b490b4f33abde8322ac0f57aa2230afbf82068cf0710ba09255fe7c4f`: a shape-valid non-achievable successor receipt could pass despite the public waiver requiring REASONABLY_ACHIEVABLE. The final patch adds only that classification requirement inside the current39 Director-link checker. It reads retained authority without recomputing historical feasibility. No dedicated negative test for this condition has run; that specific coverage remains pending.

The cancellation-conduct read adds the actual recorded Director to the existing cast/person test. It still emits at most the existing one driver per cancelled take, preserves studio aggregate behavior, recording/horizon filters and cast treatment, and persists no new trust state. This follows the accepted professional-conduct rule; the D08 post-take branch was masked in1145, so the change is not labelled an independently observed conduct failure or a qualified correction yet.

No retirement dispatch, rival policy, Bridge, historical fixture, test assertion, timeout or test-selection change is included. The frozen1143 helper/test identities remain `e35b1475…` / `fb96519a…`. The genuine third-target relation and all wider P3 work remain pending as previously recorded.

## Actual closed compiler

1146 ran `node_modules/.bin/tsc --noEmit`, 2026-09-27T12:52:22.253Z–12:53:05.003Z,42.750s, child0, null signal/error and no diagnostics. The recorder reports fixed HEAD and the exact final patch above at both ends, with no untracked consumed source. Independently read artifacts: JSON603 bytes/SHA256 `9ace7e9d62058f9518d61a68a51ea02d79f85faff262cdd9e9e43bea39108573`; raw319/`853ad7c2823a910eb077e26202929a3e83beac5d5edbd825faabfb9c054a8d4c`; recorded patch10441/`5fb6330594229322c7f1266a3cc62e3f4027d45e86e4d5bebb4983cbe1b58177`. The raw contains only its recorder header and no compiler diagnostics. Corrected behavioral qualification awaits the unchanged two-leaf run and actual reached assertions.
