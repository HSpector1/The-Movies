# Independent postflight audit

Source HEAD `d7d4bacf1b3ac82663a6ea72ee5b48d4a514985b` and all 1,658 source/input hashes match the frozen selection. All six preflight pins match; preflight allowed launch with 7,215,916 KiB free. The selected complete file is `tests/bridge-runtime-checkpoint.test.ts`.

Actual child exit 0 and wrapper exit 0 are separately recorded; run 18:55:38–18:58:40. JSON reports 81 passed, zero failed and zero skipped. All checkpoint import, canonical encoding, journal/refusal, historical migration and authentic outgoing63 assertions in this selected file reached completion. No owned runner/Vitest process or heavy-lane lock remains. Source freeze is released.

Budget qualification remains separate: the selected core project retains the default 5,000 ms; neither this file nor runner supplies an exception. The workspace's 30,000 ms setting applies only to UI. Fourteen passing bodies exceeded 5,000 ms; the remaining 67 did not. Preserve these actual durations, without treating synchronous Vitest success as a budget waiver:

- `BridgeRuntimeCheckpointV1 forward-migrates protocol 3 by preserving both V15 slots and discarding incompatible replay bytes`: 7325.727 ms.
- `BridgeRuntimeCheckpointV1 rolls the previous protocol-4 schema forward without changing either V15 save slot`: 5694.061 ms.
- `BridgeRuntimeCheckpointV1 encodes one exact closed canonical shape with one LF and hydrates stable V15 bytes`: 7593.460 ms.
- `BridgeRuntimeCheckpointV1 requires canonical checkpoint bytes followed by exactly one LF`: 8028.525 ms.
- `BridgeRuntimeCheckpointV1 rejects missing and additional roots plus incompatible format, version, protocol, and schema`: 6192.785 ms.
- `BridgeRuntimeCheckpointV1 requires untouched canonical V15 current and explicit-save bytes with exact digests`: 15712.761 ms.
- `BridgeRuntimeCheckpointV1 validates route-specific requests, responses, identity, session, revision, and canonical JSON`: 8839.959 ms.
- `BridgeRuntimeCheckpointV1 binds exact historical bytes and rejection semantics to their original route`: 7744.401 ms.
- `BridgeRuntimeCheckpointV1 rejects duplicate identities and revision-regressing journal order`: 7094.680 ms.
- `BridgeRuntimeCheckpointV1 binds the root revision to the terminal journal response`: 7222.404 ms.
- `BridgeRuntimeCheckpointV1 returns a normalized prospective append only after identity and capacity validation`: 6602.466 ms.
- `BridgeRuntimeCheckpointV1 enforces injectable entry, journal-byte, and checkpoint-byte bounds before hydration`: 6742.257 ms.
- `BridgeRuntimeCheckpointV1 validates an accepted save response V15 payload and digest before journaling it`: 5904.532 ms.
- `C17 shipped projection57 carry-forward independently migrates two admitted Save47 slots under actual shipped57 and discards opaque prior journal`: 8346.108 ms.

No foreign Godot was observed in coordinator launch/during/post samples; these samples do not establish continuous exclusivity. This is functional qualification of the selected complete file, not the remaining consumer suite, full game gate, platform qualification or primary candidate promotion. No source change or new runtime was performed by this audit.
