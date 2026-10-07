#!/usr/bin/env python3
"""Freeze one completed r12 clean leaf into Git-safe, exactly verifiable segments."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import tarfile

BASE = Path('/Users/zacheryspector/studio-scratch')
RUN = 'ag-p13a-clean-r12-ag-p13a-clean-20261007-1850'
SOURCES = {
    'target': BASE / '1370-ag-e0g-full-state-clean-recorded-r12' / RUN,
    'outer': BASE / '1370-ag-e0g-full-state-clean-outer-recorded-r12' / RUN,
    'lane': BASE / '1370-ag-e0g-full-state-r12-ag-p13a-clean-r12-ag-p13a-clean-20261007-1850.lane.log',
    'lane_meta': BASE / '1370-ag-e0g-full-state-r12-ag-p13a-clean-r12-ag-p13a-clean-20261007-1850.lane.log.meta',
}
OUT = BASE / '1370-r12-ag-p13a-clean-archive-r1' / 'package'
CHUNK = 48 * 1024 * 1024

def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        while b := f.read(1024 * 1024): h.update(b)
    return h.hexdigest()

def inventory():
    found = []
    for rootname in ('target', 'outer'):
        root = SOURCES[rootname]
        assert root.is_dir() and not root.is_symlink()
        for here, dirs, files in os.walk(root, followlinks=False):
            here = Path(here)
            for name in list(dirs):
                p = here / name
                if p.is_symlink():
                    dirs.remove(name)
                    found.append((f'{rootname}/{p.relative_to(root).as_posix()}', p))
            for name in files:
                p = here / name
                found.append((f'{rootname}/{p.relative_to(root).as_posix()}', p))
    found.extend([(f'lane/{SOURCES[k].name}', SOURCES[k]) for k in ('lane','lane_meta')])
    found.sort(key=lambda pair: pair[0])
    assert len({x[0] for x in found}) == len(found)
    for name,p in found:
        st = p.lstat()
        assert stat.S_ISREG(st.st_mode) or stat.S_ISLNK(st.st_mode), name
        assert '..' not in Path(name).parts and not name.startswith('/'), name
    return found

class HashedReader:
    def __init__(self, f): self.f=f; self.h=hashlib.sha256(); self.n=0
    def read(self, n=-1):
        b=self.f.read(n); self.h.update(b); self.n += len(b); return b

class SegmentWriter:
    def __init__(self, root):
        self.root=root; self.part=None; self.part_n=0; self.part_h=None
        self.parts=[]; self.total_h=hashlib.sha256(); self.total_n=0
    def _open(self):
        name=f'capture.tar.part-{len(self.parts)+1:03d}'
        self.part=self.root.joinpath(name).open('xb'); self.part_name=name
        self.part_h=hashlib.sha256(); self.part_n=0
    def _close(self):
        if self.part is not None:
            self.part.flush(); os.fsync(self.part.fileno()); self.part.close()
            self.parts.append(dict(name=self.part_name, bytes=self.part_n, sha256=self.part_h.hexdigest()))
            self.part=None
    def write(self, b):
        view=memoryview(b)
        while view:
            if self.part is None: self._open()
            n=min(len(view), CHUNK-self.part_n)
            piece=view[:n]; self.part.write(piece); self.part_h.update(piece); self.total_h.update(piece)
            self.part_n += n; self.total_n += n; view=view[n:]
            if self.part_n == CHUNK: self._close()
        return len(b)
    def flush(self):
        if self.part is not None: self.part.flush()
    def close(self): self._close()

def build():
    assert not OUT.exists(), f'output already exists: {OUT}'
    OUT.mkdir(parents=True)
    writer=SegmentWriter(OUT)
    files={}
    for name,p in inventory():
        st=p.lstat()
        if stat.S_ISLNK(st.st_mode):
            files[name]=dict(type='symlink', target=os.readlink(p))
        else:
            files[name]=dict(type='file',bytes=st.st_size)
    for name,p in inventory():
        st=p.lstat(); assert name in files
        entry=files[name]
        assert (entry['type']=='symlink') == stat.S_ISLNK(st.st_mode)
        if entry['type']=='file': assert entry['bytes']==st.st_size
        else: assert entry['target']==os.readlink(p)
    try:
        with tarfile.open(fileobj=writer,mode='w|',format=tarfile.PAX_FORMAT) as tar:
            for name,p in inventory():
                st=p.lstat(); entry=files[name]
                ti=tarfile.TarInfo(name); ti.mode=stat.S_IMODE(st.st_mode)
                ti.uid=0; ti.gid=0; ti.uname=''; ti.gname=''; ti.mtime=0
                if entry['type']=='symlink':
                    assert stat.S_ISLNK(st.st_mode) and os.readlink(p)==entry['target']
                    ti.type=tarfile.SYMTYPE; ti.linkname=entry['target']; tar.addfile(ti)
                else:
                    assert stat.S_ISREG(st.st_mode) and st.st_size==entry['bytes']
                    ti.size=st.st_size
                    with p.open('rb') as f:
                        fst=os.fstat(f.fileno())
                        assert (fst.st_dev,fst.st_ino,fst.st_size)==(st.st_dev,st.st_ino,st.st_size)
                        hr=HashedReader(f); tar.addfile(ti,hr)
                        assert hr.n==st.st_size
                        entry['sha256']=hr.h.hexdigest()
                    after=p.lstat()
                    assert (after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)==(st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns), name
    finally: writer.close()
    manifest=dict(schema='1370-r12-ag-p13a-clean-archive-r1', sourceRun=RUN,
        sourcePaths={k:str(v) for k,v in SOURCES.items()}, partLimitBytes=CHUNK,
        archive=dict(type='uncompressed-tar',bytes=writer.total_n,sha256=writer.total_h.hexdigest(),parts=writer.parts),
        files=files)
    assert len(writer.parts)>=3 and all(x['bytes']<=CHUNK for x in writer.parts)
    m=OUT/'MANIFEST.json'; m.write_text(json.dumps(manifest,sort_keys=True,indent=2)+'\n')
    print(json.dumps(dict(manifest=str(m),manifestSha256=sha(m),parts=writer.parts,archiveBytes=writer.total_n,archiveSha256=writer.total_h.hexdigest(),files=len(files)),sort_keys=True))

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('command',choices=['build']); args=p.parse_args(); build()
