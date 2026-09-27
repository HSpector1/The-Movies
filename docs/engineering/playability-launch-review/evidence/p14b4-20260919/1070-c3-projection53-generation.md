# 1070 — Actual projection53 generation and fixed generated checks

Parent's nine-file946/1022 implementation changes public read models, Calendar
and exact prior52 registration. No gameplay admission, retirement, save-reader,
UI stop or Finance law changes in this diff. Independent1069 review is pending.

1035 invoked only the repository TypeScript generator, with no Unity-project
argument. Child0,01:32:05.374–01:32:07.152Z,1.778s. Its fixedSource:false is the
expected intentional generation mutation, not a behavioral PASS. The before
source patch is c7df21d68115a660a7d604b4091067a1d1301f311ddec520ff1b7a580212c293;
after17c0b11392bb130ffc4622d6d8e44f6cca441a4bdf45810e7be6f5337230796e.
Both complete patches are retained. It writes exactly three generated artifacts.

| Actual artifact | Bytes | Raw SHA-256 |
| --- | ---: | --- |
| bridge/schema/project-studio-bridge.schema.json |393733|31d58dbbbf09992703dc221d7a3c3d235cb0e9b185e0212599e334d8c7219fde|
| generated/unity/StudioBridgeDtos.Generated.cs |860452|c727219216f5f71cb35e9b6116b7288da0d0343810e9cee447c5216988ce48b7|
| generated/unity/project-studio-bridge.contract-manifest.json |820|2fd375c17b183e12c714f0f6a4ee438c4cd4c890084ca33207d0c56582f4321e|

Canonical schema identity (distinct from pretty file bytes):
sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d.
Actual manifest protocol4/projection53; Save38 remains unchanged. Genuine outgoing52
f036ccdd and prior51 a690e6f9 fixtures remain frozen. Generator version/source identity
unchanged. A generated consumer-target path/hash is metadata, not a Unity copy,
build, native run or consumer qualification.

1036 generated --check PASS child0/fixedSource true,01:32:30.540–01:32:31.744Z,
1.204s.1037 fixture --check PASS child0/fixedSource true,
01:32:37.599–01:32:38.479Z,0.880s. Both use final17c0b113 source onb71d4599;
fixture output required no rewrite. Root types1038 is running on that same frozen
source; no compile or behavioral success is inferred yet.

1038 root `tsc --noEmit` PASS, child0/fixed17c0b113, no diagnostics,
01:32:48.163–01:33:20.695Z,32.532s. The recorder identifies the full frozen patch; the configured root gate checks
src and non-Bridge tests, excluding tests/bridge*.test.ts. It does not qualify
the two1068 Bridge test files or runtime/UI behavior.

1039 UI `tsc -p ui/tsconfig.json --noEmit` PASS, child0/fixed17c0b113,
no diagnostics,01:33:55.363–01:34:33.782Z,38.419s. Its configured UI/core scope
includes the new Calendar component test, not the separate Bridge test gate.

1040 Bridge `tsc -p tsconfig.bridge.json` FAIL child2/fixed17c0b113,
01:34:44.245–01:35:11.451Z,27.206s. Exactly three diagnostics are test typing:
main129 deletes a now-required professionCareer; runtime255/294 accepts literal
default limits rather than the general limits callback type. Author owns a
narrow type-only correction with1072-A handback. No production diagnostic appeared;
Bridge type PASS still requires a corrected recorded run.

1045 corrected Bridge type gate subsequently PASS, child0/fixedd53f4492,
01:45:05.896–01:45:33.635Z,27.739s, no diagnostics. It includes1072 and the
independently observed week212 busy-set correction; see1073 for actual scope.
