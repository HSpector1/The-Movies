import hashlib,os
from pathlib import Path
A=Path(__file__).parent
b=(A/'LESSONS-r11.md').read_bytes()
assert hashlib.sha256(b).hexdigest()=='0e87f9c872525e276a168abdd29585c7e3fe0acd93c850ac1ed2edf51fa02f58'
addition='''

## R12 - preserve phase wins and diagnose the first lost trace row

The R2 generated-suite parsing failure is now independently accepted as a protected STOP by5bee4c5f/root1d69df63 after full shared post38091. The original failure remains; successful protection does not replace absent M0 afterproofs.

The authenticated canonical TypeScript transform repair now has a real operational win. Fresh prelaunch24607 was independently admitted98e6/root6cea, R10 sourceeb43 was independently reviewed6b9c, and actual40169 passed its real generation test in4.665353006 seconds. It created the natural pre-market196/197/208 packet at tick.before.advanceTalentMarketWeek:12,428,510 bytes, SHA0ae4a9a261600c23b1bfd05eb860d65ef0f6769c9918670eb97bf7120b74ec62. This packet fits the approved64MiB bound; that is a measured fit for this exact packet, not a promise about arbitrary saves or future states. The generation phase succeeded even though its receipt remains GENERATED_UNADMITTED pending the complete qualification.

Baseline then failed the first capture-off author196 arm because its helper/RNG probe reported overflow. Recorder53.14937154 seconds was inside the original300/320/330 limits. One baseline test failed; no intended catch-mutant RED, full fixture qualification or neutral416 acceptance exists. Terminal actualGameplayPrefixExecuted, aggregate natural boundaries and source/dependency AFTER proofs remain null. Do not overwrite these with inferred successful aggregate fields merely because the separately authenticated generation phase succeeded.

Mandatory shared post71517 completed0, guard496.504474776 seconds/inventory393.703561673 seconds. Full immutable map and nine strict roots matched, all five recorded PIDs/four groups were absent, and the lane was released. Independent e689fdf9/root80f45b59 admit the earned generation evidence plus protected baseline STOP. Complete M0 BEFORE proofs match the qualified types authority; the shared post does not manufacture missing M0 AFTER proofs.

Source inspection narrows the overflow flag to three unchanged helper-probe bounds:16,384 combined entries,65,536 bytes in the next serialized row, or2,097,152 total retained bytes. The actual failed report did not capture which predicate was true, the counts, or the first offending row size. Serialization exceptions throw separately. Do not assume the total cap is too small, filter calls, increase caps, or accept truncated evidence without knowing the failure. These helper-probe limits are distinct from the original observer512-row/16KiB-row/2MiB contract.

The independently reviewed diagnostic proposal54cdeea9/independentd2da/rootb926 records only the first overflow's scalar predicates, entry counts, retained bytes and next-row bytes, then retains the same overflow flag and fatal assertion. Its bounded source acceptance is not runtime authority. Continue with fresh current protection and one recorded diagnostic route to identify the exact resource predicate before selecting a repair. Keep all original caps, full functions, source identity, guards and cleanup.

Operational lesson: stop arguing from generic framework messages once a bounded real phase result is available. Pin the installed loader behavior, fix its exact boundary, and retain both the successful phase and the next concrete failure. This produces cumulative progress without rewriting history or replaying already admitted controls.
'''
p=A/'LESSONS-r12.md'
with p.open('xb') as f:f.write(b+addition.encode());f.flush();os.fsync(f.fileno())
p.chmod(0o444)
print(str(p),p.stat().st_size,hashlib.sha256(p.read_bytes()).hexdigest())
