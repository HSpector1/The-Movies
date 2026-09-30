"""Compare a 1321-I-attribution.py output with an earlier attribution json by identity and primary.
usage (repo root): python3 1344-I-compare.py <new-failures.json> <base-failures.json> <out.json>
Gone = identity failed in base, not in new. New = failed in new, not in base. Changed = both, primary differs."""
import sys, json, collections

new_path, base_path, out_path = sys.argv[1:4]
new = {r['identity']: r for r in json.load(open(new_path))['rows']}
base = {r['identity']: r for r in json.load(open(base_path))['rows']}
assert len(new) == len(json.load(open(new_path))['rows']), 'duplicate identity in new'
rows = []
for i, r in sorted(new.items()):
    b = base.get(i)
    status = 'NEW' if b is None else ('SAME' if b['primary'] == r['primary'] else 'CHANGED')
    rows.append({'identity': i, 'file': r['file'], 'status': status, 'primary': r['primary'],
                 'basePrimary': b['primary'] if b else None, 'timeout': r['timeout'], 'frame': r['frame']})
gone = [{'identity': i, 'file': b['file'], 'basePrimary': b['primary']} for i, b in sorted(base.items()) if i not in new]
out = {'new': new_path, 'base': base_path, 'counts': dict(collections.Counter(r['status'] for r in rows), GONE=len(gone)),
       'newByFile': dict(collections.Counter(r['file'] for r in rows if r['status'] == 'NEW').most_common()),
       'rows': rows, 'gone': gone}
json.dump(out, open(out_path, 'x'), indent=1)
print(json.dumps({k: out[k] for k in ['counts', 'newByFile']}, indent=1))
