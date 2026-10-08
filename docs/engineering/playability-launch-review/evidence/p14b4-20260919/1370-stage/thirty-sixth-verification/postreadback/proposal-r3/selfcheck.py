#!/usr/bin/env python3
"""Synthetic, scratch-only checks; never invokes the observed readback main."""
import importlib.util, pathlib, tempfile, hashlib, os

src=pathlib.Path(__file__).with_name('check.py')
spec=importlib.util.spec_from_file_location('postreadback',src)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def expect_fail(f):
 try:f()
 except RuntimeError:return
 raise AssertionError('expected fail-closed RuntimeError')

with tempfile.TemporaryDirectory(dir=m.S) as d:
 root=pathlib.Path(d)
 good=root/'meta';good.write_text('start; synthetic\nend, exit 0; synthetic\n')
 pin=hashlib.sha256(good.read_bytes()).hexdigest()
 assert m.child_exit(good,pin)==0
 expect_fail(lambda:m.child_exit(good,'0'*64))
 good.write_text('start; synthetic\nend, exit 1; synthetic\n')
 pin=hashlib.sha256(good.read_bytes()).hexdigest()
 assert m.child_exit(good,pin)==1
 good.write_text('start; synthetic\nend, exit 0; synthetic\nnoise\n')
 pin=hashlib.sha256(good.read_bytes()).hexdigest()
 expect_fail(lambda:m.child_exit(good,pin))
 target=root/'target';target.write_text('bytes')
 link=root/'link';os.symlink(target,link)
 expect_fail(lambda:m.safe_read(link))
 assert m.safe_read(target,hashlib.sha256(b'bytes').hexdigest())==b'bytes'
 expect_fail(lambda:m.safe_read(target,'0'*64))

source=src.read_text()
assert 'argparse' not in source and '--audit-sha' not in source
assert source.index(' guard()\n for path,pin,cap')<source.index(' OUT.parent.mkdir')
assert source.index('  safe_read(path,pin,cap)\n guard()')<source.index(' OUT.parent.mkdir')
assert 'postreadback-observed-proposal-r3/check.py' in source
for literal in (m.AUDIT_SHA,m.AUDIT_META_SHA,m.COMPARATOR_META_SHA,m.EMPTY_LOG_SHA,m.COMPARATOR_RECEIPT_SHA):
 assert len(literal)==64 and all(c in '0123456789abcdef' for c in literal)
print('SYNTHETIC_PASS: pinned metadata, exit chronology, nofollow, final guard, no arbitrary audit SHA')
