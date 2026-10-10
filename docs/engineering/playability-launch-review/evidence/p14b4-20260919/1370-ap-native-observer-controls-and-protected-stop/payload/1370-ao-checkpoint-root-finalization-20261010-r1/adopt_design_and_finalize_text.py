import hashlib, json
from pathlib import Path

S = Path('/Users/zacheryspector/studio-scratch')
R = Path('/Users/zacheryspector/The-Movies-headless-program')
D = Path(__file__).parent
A = S / '1370-ao-root-continuation-20261010-r1'

def role(path, expected=None):
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if expected is not None:
        assert digest == expected, str(path)
    return dict(path=str(path), bytes=len(data), sha256=digest)

contract = role(S/'1370-ao-native-canonical-observer-row-design-20261010-r3/CONTRACT.json', '5f77e8b607e6636701af88e042725f79a3e194e1aaae5f417fd6bd450b6579e6')
design = role(S/'1370-ao-native-canonical-observer-row-design-20261010-r3/DESIGN.md', 'df74b69024f1a1a266ab08cf2d9f2cae9e78264370aa60ff3c1743bdf91d84a1')
review = role(S/'1370-ao-native-canonical-observer-row-design-independent-review-20261010-r1/RECEIPT.json', '005dde7ebc073ffa8141721007aca377524940f1c8a3103df43bd093a827c696')
v = json.loads(Path(review['path']).read_bytes())
assert v['decision'] == 'ACCEPT_SOURCE_ONLY_NATIVE_CANONICAL_OBSERVER_ROW_REPRESENTATION_DESIGN'
assert v['contract'] == contract and v['design'] == design and not v['concreteFindings']
for item in v['authenticatedContractRoles']:
    assert role(Path(item['path'])) == item

adoption = {
    'schema': '1370-root-native-canonical-observer-design-adoption/v1',
    'status': 'ROOT_ADOPTED_EXPLICIT_NATIVE_CANONICAL_REPRESENTATION_AND_ACCOUNTING_AMENDMENT_SOURCE_ONLY',
    'contract': contract, 'design': design, 'independentReview': review,
    'authority': 'Existing Owner authorization to resolve verification blockers, independently reviewed delegated technical rules and parent adoption; published AN explicitly requires separately adopted observer transport amendments. No new Owner approval is required for this technical representation choice.',
    'publicSourcePreparationAuthorized': True,
    'dependentImplementationRequiresFinalAPIReviewAndRootAdoption': True,
    'executionAuthorization': False, 'fullQualificationAccepted': False, 'game': False,
    'actualNewSchemaFitMeasured': False,
    'storageSchema': 'c0-m0-promise-feasibility/v3-native-canonical',
    'physicalCapsIncludingFramingAndNewlines': {'rows': 512, 'rowBytes': 16384, 'totalBytes': 2097152},
    'legacyExpandedAccountingExplicitlyAmended': True,
    'legacyExpandedRowMayExceed16384': True,
    'legacyExpandedTotalMayExceed2097152': True,
    'payloadContract': 'One complete native tuple per original inputTuple row; exact original canonical text roundtrip, inputBytes and digest; unchanged source slots, ordering, multiplicity, context and all other detail payloads. No truncation, filtering, payload substitution, extra rows or fixture changes.',
    'boundedWork': {'preparseUtf8': 16384, 'depth': 64, 'nodesPlusProperties': 16384, 'legacyViewBound': 'L <= 2P + 2 <= 32770', 'concurrentDecodedRows': 2, 'expandedTraceCacheAllowed': False},
    'resourceOrder': ['COUNT', 'ROW', 'TOTAL'],
    'operationalFailureContract': 'Shared chronological first operational error is sticky before throw, fatal after swallowed catches, and preserved by identity through later body, end, reset and writer failures; ordinary no-error cleanup semantics remain.',
    'unchangedPremises': ['Original gameplay and evaluator', 'Canonical producer and digest', 'Natural and synthetic fixtures', 'Game horizon', 'Original fullfunction 300/320/330 limits', 'Original mandatory protection and meaningful typed-catch mutant'],
    'historicalFailuresPreserved': True,
    'productionHeadAtAdoption': '0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4',
    'productionSourceTree': '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554',
    'nextStep': 'Complete exact AP API and independent review; root adopt before one public implementation writer and independent specific controls. Fresh actual controls and fullfunction qualification determine fit, never this design receipt.'
}
p = A/'NATIVE-CANONICAL-OBSERVER-DESIGN-ADOPTION.json'
with p.open('x') as f:
    json.dump(adoption, f, sort_keys=True, indent=2); f.write('\n')
ar = role(p)

lesson = '''# AO major lessons — update 11

The diagnostic is a completed, independently reviewed result. The first refused observer row is 17,305 bytes against a 16,384-byte limit: a 921-byte excess. Its canonical input is 15,360 bytes; the complete detail is 16,733 bytes and the context is 468 bytes. The detail alone exceeds the whole-row limit by 349 bytes. Context trimming cannot solve this failure. The count of 1,001 is a scalar, not 1,001 expanded tuples. Record measurements before changing a fixture or pursuing a size hypothesis.

The 48 diagnostic controls passed, and the genuine fullfunction run retained its original failure. Full postflight then proved complete protected-state equality, nine strict roots, all nine recorded process/group absences and a released lane. This closes the diagnosis as protected evidence. It does not accept the failed baseline, run its mutant, invent missing M0 AFTER proofs or finish P17/P18.

An original Error stack records creation, not every later propagation site. Its truncated frames did not identify the fixture iteration. Root rejected an initial off-arm attribution after checking that capture is disabled in that arm. Preserve the erroneous receipt and explicit correction. The earned claim is a capture-enabled week-196 opportunity row; natural versus synthetic remains unknown. Earlier checks from a differently instrumented historical run cannot establish current progress.

The native-tuple repair is now independently reviewed and explicitly adopted for source preparation. It retains complete canonical data, digest, context, order and multiplicity while preserving the actual physical row/count/total caps. It explicitly changes the accounting of reconstructed legacy strings, which may be larger than the former expanded limits. Name that change directly; equal numeric physical caps do not prove unchanged expanded accounting. Separate helper-codec authority cannot authorize observer-format changes.

Bound work before allocation: incrementally count canonical UTF8 before parsing, then validate depth and nodes/properties before stringifying. Count exhaustion must precede conversion work. Preserve the first operational error through swallowed catches and later cleanup failures. Decode at most two rows concurrently; never retain a second expanded trace. The derived legacy-view bound is L <= 2P + 2 <= 32,770 serialized UTF8 bytes, not a fixed JavaScript heap claim.

Authenticate operative references as well as summary metadata. The substantive R2 design had correct bounds but its contract still linked R1; independent review stopped it. R3 fixes only the stale binding and is the accepted authority. This repeats the earlier lesson from a route with 18 correct aliases but stale non-map recipe fields: all producer-consumer role fields need a complete check before sealing. Preserve rejected sources instead of silently rewriting evidence.

Keep design, API, implementation, controls and actual qualification distinct. The accepted design does not prove that the new representation fits this row, every later row or the full route. The final API must resolve a shared first-error latch before dependent code. Fresh specific controls and genuine baseline/mutant runs remain necessary. Reuse successful unchanged evidence only within its exact source scope; do not rerun completed diagnosis merely to reconstruct state.

This update complements immutable AO lessons 1–10. All failures, corrections and original evidence remain available. Publication ends the AN Git/common metadata freeze; the next actual route must bind the new published HEAD and fresh operational protection. Source preparation continues in AP so AO evidence stays fixed.
'''
lp = A/'LESSONS-r11.md'
with lp.open('x') as f: f.write(lesson)
lr = role(lp)

native_text = ('Native canonical representation R3 contract5f77e8b6/design df74b690 passed independent design review005dde7e; root adoption '+ar['sha256']+' explicitly authorizes source preparation. Physical caps512/16384/2097152 include all framing/newlines; old expanded-string accounting is explicitly amended. Exact canonical roundtrip and digest/context/order/multiplicity remain mandatory. Work bounds are canonical UTF8<=16384 before parse, depth<=64, nodes+properties<=16384, at most two decoded rows with L<=2P+2<=32770 each. No fit, implementation or runtime acceptance is claimed. Final API review and root adoption precede dependent code in AP.')
claim = (D/'ROOT-FINAL-CLAIM-DRAFT.txt').read_text()
start = claim.index('NATIVE REPAIR DESIGN STATUS MUST')
end = claim.index('\n\nMajor lessons', start)
claim = claim[:start]+native_text+claim[end:]
claim += '\nFinal lessons: '+lr['path']+'; '+str(lr['bytes'])+' bytes; SHA256 '+lr['sha256']+'.\n'
with (D/'ROOT-FINAL-CLAIM.txt').open('x') as f: f.write(claim)

body = (D/'HANDOFF-BODY-DRAFT.md').read_text().replace('at this draft cutoff', 'at the AO checkpoint')
start = body.index('- NATIVE REPAIR DESIGN FINAL STATUS')
end = body.index('\n\nIn flight:', start)
body = body[:start]+'- '+native_text+body[end:]
body = body.replace('AO report and archive manifest (final links/pins pending in this draft); AO latest lessons (final pin pending);', '[AO report](docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-AO-observer-row-diagnostic-closure.md); [AO archive manifest](docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-ao-observer-row-diagnostic-closure/ARCHIVE-MANIFEST.json); [AO lessons 11](docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-ao-observer-row-diagnostic-closure/payload/1370-ao-root-continuation-20261010-r1/LESSONS-r11.md), '+str(lr['bytes'])+' bytes SHA256 '+lr['sha256']+';')
body = body.replace('Archive and lessons final pins must be inserted before publication; preserve AUTO exactly.', 'Final archive pins belong in the AO report; preserve AUTO exactly.')
body = body.replace('In flight: none at the AO checkpoint.', 'In flight: no recorded runtime jobs. GPT-6.1 Sol is preparing the exact native observer API in AP with an independent reviewer; source preparation only, no implementation or execution grant yet.')
body = body.replace('Read final native representation design/review/root adoption and exact API when supplied below.', 'Read native R3 design/review and root NATIVE-CANONICAL-OBSERVER-DESIGN-ADOPTION.json in the archived AO root package. AP API draft is at /Users/zacheryspector/studio-scratch/1370-ap-native-observer-api-source-20261010-r1/API.md (d9ee0bbe); final shared first-error latch and independent review remain in progress. Do not treat the draft as adopted.')
old = (R/'HANDOFF.md').read_text()
begin = old.index('<!-- AUTO:BEGIN')
end = old.index('<!-- AUTO:END -->', begin)+len('<!-- AUTO:END -->')
auto = old[begin:end]
assert hashlib.sha256(auto.encode()).hexdigest() == '39c20c726e9779c2f8ba73dd37ba55476302ac7b17040bf3d5e487f5c7268a4d'
(R/'HANDOFF.md').write_text(body.rstrip()+'\n'+auto+'\n')
(D/'HANDOFF-BODY-FINAL.txt').write_text(body)
print(json.dumps({'adoption':ar, 'lessons':lr, 'handoff':role(R/'HANDOFF.md'), 'claim':role(D/'ROOT-FINAL-CLAIM.txt'), 'freezeEndedForPublication':True}, indent=2))
