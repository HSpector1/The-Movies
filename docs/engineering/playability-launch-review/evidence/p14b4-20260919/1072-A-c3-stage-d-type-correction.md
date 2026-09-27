# 1072-A — Stage D type-only correction

Parent1040 recorded bridge typecheck exit2 on fixed source
`17c0b11392bb130ffc4622d6d8e44f6cca441a4bdf45810e7be6f5337230796e`.
Its three diagnostics were confined to the two independent Stage D test files:
one required-property delete and the same overly narrow callback argument at
coordinator startup/restart. Root/UI type scopes were separately recorded by
the parent. No production diagnostic was reported by this bridge run.

The parent released only these two type repairs. The missing-field schema
negative now declares its actual cloned malformed DTO as `Partial<typeof good>`
before deleting `professionCareer`. The actual deletion and missing-required-field
wire refusal remain unchanged; the test does not manufacture a valid typed DTO.
The runtime fresh-session callback accepts the exported general
`BridgeRuntimeCheckpointLimits`, rather than the type of the default constant
whose `maxJournalEntries` member is the literal512. The coordinator still passes
its real limits unchanged. No timeout, command, fixture, runtime assertion or
production implementation changed.

| Path | Frozen1068 SHA-256 | Corrected SHA-256 | Bytes |
| --- | --- | --- | ---: |
| `tests/bridge-p14c3-read-models.test.ts` | `f22036172d0534e5a98d8f9957e1c6950a6ec201eaf57e09edb74c8a8d9c7c62` | `f061f492de2794e6caa75406a2a35af048a89b4a0cb307650c4968800b805ab1` | 25,864 |
| `tests/bridge-p14c3-runtime.test.ts` | `f04e2d62630b434e9910f3924d610a002204afc50a05ec7724403b3a2c1416b2` | `6e276c73d64206f2e65cd167a40d98d572afa771e8369154acff142149c5950b` | 21,791 |

The other four1065 source identities are unchanged. The six-source ordered
new-file patch in1065 order, from concatenated
`git diff --no-index -- /dev/null <path>`, is77,695 bytes, SHA-256
`15a0f4f8655d1872c9c12414c5b0f2256494002b702dc9e93e89992191d6adfd`.
All sources are frozen again. Original1065/1068 handbacks and1033/1040 records
remain unchanged. This author executed no test, compiler, producer or gameplay;
new type qualification belongs to the parent's next fixed-source record.
