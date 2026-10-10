import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
prior=(A/'LESSONS-r17.md').read_bytes();assert hashlib.sha256(prior).hexdigest()=='de514f44b783ba457e30b69279efd04e5d440d6bd94aa8df61707590fb6703cc'
stop=role(A/'FULLFUNCTION-R5-STOP-OBSERVED-ADOPTION.json');v=json.loads(Path(stop['path']).read_bytes());assert v['status']=='ROOT_ADOPTED_FULLFUNCTION_FEASIBILITY_ROW_BYTE_CAP_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT'
design=role(A/'OBSERVER-ROW-DIAGNOSTIC-DESIGN-ADOPTION.json');assert design['sha256']=='8b45e59bfbcf67e115f28065c475fc64ba353a96ee4c07e616472bf58b1eda90'
addition=f'''

## R18 — actual integration exposes the next independent bound; retain the earned progress

Actual fullfunction56544 ran the independently accepted R13 source under unchanged300/320/330 bounds. Recorder55.66051677400537 seconds, no timeout. Real generation passed its one test in3.915457094 seconds and reproduced the exact12,428,510-byte packet0ae4a9a261600c23b1bfd05eb860d65ef0f6769c9918670eb97bf7120b74ec62. The baseline then failed the original feasibility observer16KiB row predicate. Helper encoded2MiB success does not imply the separate observer row fits. Keep each resource bound and its evidence separate; do not treat one storage repair as general capacity acceptance.

The recorded baseline stack reaches capture-on pair at the shared synthetic opportunity loop, fullbody line85. Exact sequential source places natural author196, freeze208 and offweek paired assertions earlier; they returned before this failure. This earns bounded source-qualified progress, not a full baseline, independently timed per-pair result, universal encoded-fit claim or meaningful typed-catch mutant. The failed loop iteration, kind, byte length, family and payload were not retained. Leave those facts unknown. AFTER M0 source/dependency proofs, terminal Node result and prefix fields remain null. A later failure never supplies missing after-proofs.

Original full shared post92358 passed with reader1af7a89810d94e59fc70e043aa9c478a09feae62511d2b128fe270365d97be67 and snapshot8222e0888b5f05f82295d16b2941ac5de46e4a9269b48751d6d177d9e3b63cf0. Full immutable maps and nine strict roots match the original baseline; guard485.2248740590003 seconds/inventory389.2570975159906 seconds. All9 recorded process/group checks are ESRCH and the lane is released. Raw process/FD roles remain local hash/size only. Independent e364387908a227f5d80de1d721ee832c4c40fdbe3b1d448723bd73ea49a57f93 and root {stop['sha256']} admit the protected STOP, not gameplay acceptance. Protection can close while qualification remains failed.

Rejected hypothesis: count1001 does not expand into1001 reservation rows. Authenticated promises.ts maps one tuple per actual promise and stores predicate.count as a scalar; arithmetic sums counts. Changing that number on intuition would change the synthetic policy premise without evidence that it repairs the row. Record disproved explanations as well as wins. Opportunity inputs append full owner/project/production/resource projections and receipt embeds canonicalInputs as an escaped string; these are a plausible size mechanism, not measured attribution of the failed bytes.

Next diagnostic design cafbcdf5b12bff61c3cf1d1bef2b30a6cf9cff768c32a2cf90bf93f18ff0a74f, independently49255bea728ec37f5ae30e0819c2bc1acf598dfb986f2ef4868b64ce81a8335e and root8b45e59bfbcf67e115f28065c475fc64ba353a96ee4c07e616472bf58b1eda90, is adopted for source preparation only. Wrap the public capture boundary; original record decides refusal first. Retain first-only sticky failure and rethrow the SAME Error, even if a gameplay catch swallows it. Reconstruct exact sequence/occurrence/field order against the original public witness; cap emitted scalar metadata including framing at4096 bytes and bound canonical parsing before parse. Emit before existing reset. Independent controls must exercise actual16384/16385 boundaries, Unicode/escaping, nonzero occurrence, inputTuple/assessment, unavailable family, diagnostic failure, swallowed error, reset and unchanged GREEN rows. No cap/fixture/policy/private observer mutation is authorized by this design, and no implementation or runtime is yet admitted.

If the exact required canonical row exceeds16KiB, retaining it unchanged cannot satisfy the existing single-row predicate. Do not disguise truncation, hash-only replacement, capture suppression or compression as an unchanged rule. A smaller lawful synthetic fixture needs precise coverage and observed size proof; a different observer transport/schema needs a separately adopted amendment. Measure first. Neutral416 remains downstream of genuine fullfunction qualification, and1363 remains upstream of P16/P17/P18.

Checkpoint practice: finish owned jobs and original preservation, record actual partial wins and null proofs, freeze evidence, then update HANDOFF and publish. Publication changes operational Git/common authority, so the next runtime must bind the actual new checkpoint. Do not reuse currentAM protection after publication. The earlier lessons and all source/runtime STOPs remain immutable historical evidence.
'''
b=prior+addition.encode();p=A/'LESSONS-r18.md'
with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
