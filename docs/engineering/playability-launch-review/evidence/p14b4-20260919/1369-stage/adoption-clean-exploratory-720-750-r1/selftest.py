#!/usr/bin/env python3
"""Small adversarial readback tests; no evidence or heavy mode is run."""
import gzip
import hashlib
import io
from pathlib import Path
import tarfile
import tempfile
from archive_builder import verify_tar

GOOD = b'ok'
RECORD = {'good.txt': {'sha256': hashlib.sha256(GOOD).hexdigest(), 'bytes': len(GOOD)}}

def trial(members, expected=RECORD):
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp)/'fixture.tar.gz'
        with path.open('wb') as raw, gzip.GzipFile(filename='', mode='wb', fileobj=raw, mtime=0) as gz:
            with tarfile.open(fileobj=gz, mode='w') as tar:
                for name, kind in members:
                    info = tarfile.TarInfo(name)
                    info.type = kind
                    if kind == tarfile.REGTYPE:
                        info.size = len(GOOD)
                        tar.addfile(info, io.BytesIO(GOOD))
                    else:
                        info.linkname = 'good.txt'
                        tar.addfile(info)
        verify_tar(path, expected)

trial([('good.txt', tarfile.REGTYPE)])
for members in (
    [('good.txt', tarfile.REGTYPE), ('good.txt', tarfile.REGTYPE)],
    [('../escape', tarfile.REGTYPE)],
    [('/absolute', tarfile.REGTYPE)],
    [('good.txt', tarfile.SYMTYPE)],
    [('good.txt', tarfile.LNKTYPE)],
    [('good.txt', tarfile.CHRTYPE)],
    [('good.txt', tarfile.DIRTYPE)],
):
    try:
        trial(members)
    except ValueError:
        continue
    raise AssertionError(f'unsafe tar accepted: {members}')
print('8 safe/unsafe tar readback fixtures passed')
