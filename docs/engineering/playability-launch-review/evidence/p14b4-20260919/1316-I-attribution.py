"""Attribute a recorded broad core gate against 1302-I (identity method of 1302-I) and the 1309-X4 scratch rows.
usage (repo root): python3 attr1316.py <raw.txt> <out.json>"""
import sys, json, re, hashlib, collections
# --- parser of 1302-I (scratch parse_common.py), inlined verbatim ---
import re, hashlib

FAIL_LINE_RE = re.compile(r"^ FAIL \|(core|ui)\|\s+(.*)$", re.M)
FRAME_RE = re.compile(r"^ ❯ (.*)$", re.M)
TESTFILE_IN_FRAME_RE = re.compile(r"((?:tests|ui/src)/[^\s():]+\.test\.tsx?):(\d+):(\d+)")

def sha256_of(path):
    return hashlib.sha256(open(path,"rb").read()).hexdigest()

def load(path):
    raw = open(path,"rb").read()
    return raw, raw.decode('utf8', errors='replace')

def parse_failed_tests(data, total):
    """Returns list of blocks; each block is dict with headers(list of str), body(str), block_no(1-based index of LAST marker in block, i.e. vitest's own numbering is cumulative and only printed once per block)."""
    hdr_marker = f"Failed Tests {total} "
    idx = data.find("⎯⎯⎯⎯⎯⎯ Failed Tests")
    # verify total matches
    m = re.search(r"Failed Tests (\d+)", data[idx:idx+40])
    assert m and int(m.group(1)) == total, f"expected {total} got {m.group(0) if m else None}"
    body_all = data[idx:]
    marker_re = re.compile(r"\n⎯+\[(\d+)/%d\]⎯\n" % total)
    markers = list(marker_re.finditer(body_all))
    first_fail_idx = body_all.find(" FAIL |")
    assert first_fail_idx != -1
    cursor = first_fail_idx
    blocks = []
    for m in markers:
        block_text = body_all[cursor:m.start()+1]
        blocks.append((block_text, int(m.group(1))))
        cursor = m.end()
    trailing = body_all[cursor:]
    return blocks, trailing

def split_block(block_text):
    """Return (list_of_header_strings, body_text_after_last_header)."""
    header_matches = list(FAIL_LINE_RE.finditer(block_text))
    assert header_matches, "no FAIL header found in block: %r" % block_text[:200]
    headers = [hm.group(2).strip() for hm in header_matches]
    body_start = header_matches[-1].end()
    body = block_text[body_start:]
    return headers, body

def extract_primary_and_frame(body):
    frame_matches = list(FRAME_RE.finditer(body))
    if frame_matches:
        msg_text = body[:frame_matches[0].start()]
    else:
        msg_text = body
    # first non-empty line of msg_text
    first_line = None
    for line in msg_text.splitlines():
        line = line.strip()
        if line:
            first_line = line
            break
    # find first test-file frame
    test_frame = None
    for fm in frame_matches:
        line = fm.group(1)
        tm = TESTFILE_IN_FRAME_RE.search(line)
        if tm:
            test_frame = f"{tm.group(1)}:{tm.group(2)}:{tm.group(3)}"
            break
    is_timeout = bool(re.search(r"[Tt]est timed out in \d+ms", msg_text))
    return first_line, test_frame, is_timeout, msg_text.strip()

def identity_parts(header):
    parts = [p.strip() for p in header.split(" > ")]
    file = parts[0]
    leaf = parts[-1]
    describe = " > ".join(parts[1:-1])
    return file, describe, leaf
# --- end parser ---

E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
raw_path, out_path = sys.argv[1:3]
raw, data = load(raw_path)
data = re.sub(r'\x1b\[[0-9;]*m', '', data)
m = re.search(r'⎯+ Failed Tests (\d+) ⎯+', data)
total = int(m.group(1)) if m else 0
cases = []
if total:
    hdr = data.find(m.group(0))
    body_all = data[hdr:]
    markers = list(re.finditer(r"\n⎯+\[(\d+)/%d\]⎯\n" % total, body_all))
    cursor = body_all.find(' FAIL |')
    for mk in markers:
        headers, body = split_block(body_all[cursor:mk.start() + 1])
        primary, frame, timeout, _ = extract_primary_and_frame(body)
        for h in headers:
            f, d, leaf = identity_parts(h)
            cases.append({'file': f, 'describe': d, 'leaf': leaf, 'identity': h, 'primary': primary,
                          'frame': frame, 'timeout': timeout, 'shared_group_size': len(headers),
                          'marker_no': int(mk.group(1))})
        cursor = mk.end()
assert len(cases) == total, (len(cases), total)

base = {r['identity']: r for r in json.load(open(E + '1302-I-failures.json'))['rows']}
x4 = collections.defaultdict(list)
for r in json.load(open(E + '1309-X4-fullcore-rows.json')):
    x4[(r['file'], r['leaf'])].append(r['c1302'])
for c in cases:
    b = base.get(c['identity'])
    c['status_vs_1302'] = 'NEW' if b is None else ('RETAINED-SAME' if b['primary'] == c['primary'] else 'RETAINED-CHANGED')
    c['cluster_1302'] = b['cluster_id'] if b else None
    c['cluster_x4'] = sorted(set(x4.get((c['file'], c['leaf']), []))) or None
seen = {c['identity'] for c in cases}
vanished = [{'identity': i, 'cluster_1302': r['cluster_id']} for i, r in base.items() if i not in seen]
summary = re.findall(r'^\s+(Test Files|Tests|Errors)\s+(.*)$', data, re.M)
out = {'raw': {'path': raw_path, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()},
       'summary': dict(summary), 'failedCases': total,
       'byStatus': collections.Counter(c['status_vs_1302'] for c in cases),
       'byCluster1302': collections.Counter(c['cluster_1302'] or 'NEW' for c in cases),
       'vanishedFrom1302': len(vanished),
       'vanishedByCluster': collections.Counter(v['cluster_1302'] for v in vanished),
       'failedFiles': sorted({c['file'] for c in cases}),
       'rows': cases, 'vanished': vanished}
json.dump(out, open(out_path, 'x'), indent=1)
print(json.dumps({k: out[k] for k in ['summary', 'failedCases', 'byStatus', 'byCluster1302', 'vanishedFrom1302']}, indent=1))
for c in cases:
    if c['status_vs_1302'] == 'NEW':
        print('NEW', c['identity'][:200], '|', (c['primary'] or '')[:160], '|', c['frame'], '| x4:', c['cluster_x4'])
