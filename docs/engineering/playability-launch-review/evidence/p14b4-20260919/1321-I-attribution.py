"""Attribute a recorded broad UI gate against 1303 (identity method of 1302-I; both raws parsed by the same parser;
cluster ids from 1303-I). usage (repo root): python3 1317-I-attribution.py <raw.txt> <out.json>"""
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


def parse(path):
    raw, data = load(path)
    data = re.sub(r'\x1b\[[0-9;]*m', '', data)
    ms = re.search(r'⎯+ Failed Suites (\d+) ⎯+', data)
    m = re.search(r'⎯+ Failed Tests (\d+) ⎯+', data)
    suites = int(ms.group(1)) if ms else 0
    tests_failed = int(m.group(1)) if m else 0
    total = suites + tests_failed
    cases = []
    if total:
        first = ms if ms else m
        body_all = data[data.find(first.group(0)):]
        markers = list(re.finditer(r"\n⎯+\[(\d+)/%d\]⎯\n" % total, body_all))
        cursor = body_all.find(' FAIL |')
        for mk in markers:
            block = body_all[cursor:mk.start() + 1]
            block = re.sub(r'⎯+ Failed Tests \d+ ⎯+\n', '', block)
            headers, body = split_block(block)
            primary, frame, timeout, _ = extract_primary_and_frame(body)
            for h in headers:
                f, d, leaf = identity_parts(h)
                cases.append({'file': f, 'describe': d, 'leaf': leaf, 'identity': h, 'primary': primary, 'frame': frame,
                              'timeout': timeout, 'shared_group_size': len(headers), 'marker_no': int(mk.group(1)),
                              'suite': h.endswith(']') and '[ ' in h})
            cursor = mk.end()
    total = len([c for c in cases if not c['suite']]) if total else 0
    assert total == tests_failed, (total, tests_failed)
    return raw, data, cases



raw_path, out_path = sys.argv[1:3]
raw, data, cases = parse(raw_path)
base = {r['identity']: r for r in json.load(open(E + '1316-I-failures.json'))['rows']}
for c in cases:
    b = base.get(c['identity'])
    c['status_vs_1316'] = 'NEW' if b is None else ('RETAINED-SAME' if b['primary'] == c['primary'] else 'RETAINED-CHANGED')
    c['cluster_1302'] = b['cluster_1302'] if b else None
seen = {c['identity'] for c in cases}
vanished = [{'identity': i, 'cluster_1302': r['cluster_1302']} for i, r in base.items() if i not in seen]
summary = dict(re.findall(r'^\s+(Test Files|Tests|Errors)\s+(.*)$', data, re.M))
out = {'raw': {'path': raw_path, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}, 'summary': summary,
       'failedCases': len(cases), 'byStatus': collections.Counter(c['status_vs_1316'] for c in cases),
       'vanishedFrom1316': len(vanished), 'rows': cases, 'vanished': vanished}
json.dump(out, open(out_path, 'x'), indent=1)
print(json.dumps({k: out[k] for k in ['summary', 'failedCases', 'byStatus', 'vanishedFrom1316']}, indent=1))
