#!/usr/bin/env python3
"""Independent fd-based byte inventory for the retained AG adoption clean sources."""
import hashlib
import json
import os
import stat
from pathlib import Path

B = Path('/Users/zacheryspector/studio-scratch')
R = B / '1370-ag-adoption-clean-observed-review-r12'
NAME = 'ag-adoption-clean-r12-ag-adoption-clean-20261007-1850'
TARGET = B / '1370-ag-e0g-full-state-clean-recorded-r12' / NAME
OUTER = B / '1370-ag-e0g-full-state-clean-outer-recorded-r12' / NAME
LANE = B / f'1370-ag-e0g-full-state-r12-{NAME}.lane.log'
META = Path(str(LANE) + '.meta')

def digest_fd(fd):
    h = hashlib.sha256()
    size = 0
    while True:
        chunk = os.read(fd, 1 << 20)
        if not chunk: break
        h.update(chunk)
        size += len(chunk)
    return size, h.hexdigest()

def walk(fd, prefix, rel, items):
    for name in sorted(os.listdir(fd), key=os.fsencode):
        assert name not in ('', '.', '..') and '/' not in name
        sub = f'{rel}/{name}' if rel else name
        key = f'{prefix}/{sub}'
        st = os.stat(name, dir_fd=fd, follow_symlinks=False)
        entry = {'path': key, 'mode': stat.S_IMODE(st.st_mode)}
        if stat.S_ISDIR(st.st_mode):
            child = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            try:
                opened = os.fstat(child)
                assert (opened.st_dev, opened.st_ino) == (st.st_dev, st.st_ino)
                entry['type'] = 'directory'
                items.append(entry)
                walk(child, prefix, sub, items)
            finally: os.close(child)
        elif stat.S_ISLNK(st.st_mode):
            target = os.readlink(name, dir_fd=fd)
            entry.update(type='symlink', target=target,
                         targetSha256=hashlib.sha256(os.fsencode(target)).hexdigest())
            items.append(entry)
        elif stat.S_ISREG(st.st_mode):
            f = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=fd)
            try:
                before = os.fstat(f)
                assert (before.st_dev,before.st_ino,before.st_size) == (st.st_dev,st.st_ino,st.st_size)
                size, digest = digest_fd(f)
                after = os.fstat(f)
                assert size == st.st_size and before.st_mtime_ns == after.st_mtime_ns and before.st_ctime_ns == after.st_ctime_ns
                entry.update(type='file', bytes=size, sha256=digest)
                items.append(entry)
            finally: os.close(f)
        else: raise RuntimeError(f'unsupported member {key}')
        assert len(items) <= 1000

def root(path, prefix, items):
    assert stat.S_ISDIR(path.lstat().st_mode)
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try: walk(fd, prefix, '', items)
    finally: os.close(fd)

def lane_file(path, items):
    assert stat.S_ISREG(path.lstat().st_mode)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        st = os.fstat(fd)
        size, digest = digest_fd(fd)
        after = os.fstat(fd)
        assert size == st.st_size and st.st_mtime_ns == after.st_mtime_ns and st.st_ctime_ns == after.st_ctime_ns
    finally: os.close(fd)
    items.append({'path': 'lane/' + path.name, 'type': 'file',
                  'mode': stat.S_IMODE(st.st_mode), 'bytes': size, 'sha256': digest})

def main():
    items = []
    root(TARGET, 'target', items)
    root(OUTER, 'outer', items)
    lane_file(LANE, items)
    lane_file(META, items)
    items.sort(key=lambda item: os.fsencode(item['path']))
    assert len(items) == len({i['path'] for i in items}) and len(items) <= 1000
    canonical = (json.dumps(items, sort_keys=True, separators=(',', ':'), ensure_ascii=False) + '\n').encode()
    digest = hashlib.sha256(canonical).hexdigest()
    (R / 'SOURCE-INVENTORY.json').write_bytes(canonical)
    report = R / 'REPORT.md'
    prior = report.read_text()
    assert 'Canonical source inventory:' not in prior
    report.write_text(prior + f'\nCanonical source inventory: {len(items)} exact retained target/outer/lane entries; SHA-256 `{digest}`. The JSON list is sorted by UTF-8 path and retained as `SOURCE-INVENTORY.json`.\n')
    receipt_path = R / 'RECEIPT.json'
    receipt = json.loads(receipt_path.read_bytes())
    assert receipt['decision'] == 'ACCEPT_OBSERVED_R12_AG_ADOPTION_CLEAN_ONLY'
    receipt.update(sourceInventorySha256=digest, sourceInventoryMembers=len(items),
                   reportSha256=hashlib.sha256(report.read_bytes()).hexdigest())
    receipt_path.write_text(json.dumps(receipt, sort_keys=True, separators=(',', ':')) + '\n')
    print(json.dumps({'sourceInventorySha256':digest,'members':len(items),
                      'reportSha256':receipt['reportSha256'],
                      'receiptSha256':hashlib.sha256(receipt_path.read_bytes()).hexdigest()},sort_keys=True))

if __name__ == '__main__': main()
