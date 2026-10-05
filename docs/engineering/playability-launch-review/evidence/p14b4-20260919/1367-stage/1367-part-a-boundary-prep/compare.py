"""Read two completed probe outputs; print a bounded comparison, never open fixtures."""
import json, sys
from pathlib import Path
control, candidate = [json.loads(Path(p).read_text()) for p in sys.argv[1:]]
assert control['arm'] == 'control' and candidate['arm'] == 'part-a'
for a in (control, candidate):
    assert a['seed'] == 'p13a-core-causal-01' and a['horizon'] == 93
    assert a['inputNeutral'] and a['everyBoundaryAdmitted']
    assert [r['producedWeek'] for r in a['boundaries']] == list(range(94))
first = None
for a, b in zip(control['boundaries'], candidate['boundaries']):
    if a['stateSha256'] != b['stateSha256']:
        first = {'producedWeek': a['producedWeek'], 'changedRoots': sorted(k for k in a['roots'].keys() | b['roots'].keys() if a['roots'].get(k) != b['roots'].get(k))}
        break
print(json.dumps({'firstDivergence': first, 'controlFirstShelving': control['firstShelving'],
    'candidateFirstShelving': candidate['firstShelving'], 'candidateShelvingReceipts': candidate['shelvingReceipts'],
    'limit': 'Only boundaries0..93; null first shelving means none visible by93, not never.'}, indent=2))
