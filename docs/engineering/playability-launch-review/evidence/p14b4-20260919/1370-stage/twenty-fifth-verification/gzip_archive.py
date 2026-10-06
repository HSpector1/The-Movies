#!/usr/bin/env python3
"""Deterministically gzip a pinned 1370-K tar: no filename, mtime zero."""
import gzip, hashlib, shutil, sys
from pathlib import Path
EXPECTED_TAR_SHA256='a9cb87a253d483d609cb810a7ca5a1525c0fd438acaf5d383b73e6b9c95448f0'
def sha(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''): h.update(block)
    return h.hexdigest()
def main(inp,out):
    inp=Path(inp);out=Path(out)
    if sha(inp)!=EXPECTED_TAR_SHA256: raise RuntimeError('raw tar differs from pinned archive')
    if out.exists(): raise RuntimeError('refuse gzip overwrite')
    with open(inp,'rb') as source,open(out,'xb') as target:
        with gzip.GzipFile(fileobj=target,mode='wb',filename='',mtime=0,compresslevel=9) as gz:
            shutil.copyfileobj(source,gz,1024*1024)
    print(out, out.stat().st_size, sha(out))
if __name__=='__main__':
    if len(sys.argv)!=3: raise SystemExit('usage: python3 -I -B gzip_archive.py INPUT.tar OUTPUT.tar.gz')
    main(sys.argv[1],sys.argv[2])
