#!/usr/bin/env python3
"""Read and prove every byte/member of a split evidence tar without extraction."""
import hashlib
import json
from pathlib import Path
import tarfile
import sys

def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        while b:=f.read(1024*1024): h.update(b)
    return h.hexdigest()

class Parts:
    def __init__(self,root,records):
        self.root=root; self.records=records; self.i=0; self.f=None
        self.n=0; self.h=hashlib.sha256(); self.completed=[]
    def read(self,n=-1):
        if n<0: n=1024*1024
        out=bytearray()
        while len(out)<n and self.i<len(self.records):
            if self.f is None:
                record=self.records[self.i]
                name=record['name']
                assert name==f'capture.tar.part-{self.i+1:03d}' and '/' not in name and '..' not in name
                self.f=(self.root/name).open('rb'); self.part_h=hashlib.sha256(); self.part_n=0
            b=self.f.read(n-len(out))
            if b:
                out.extend(b); self.h.update(b); self.part_h.update(b)
                self.n+=len(b); self.part_n+=len(b)
            else:
                record=self.records[self.i]
                assert self.part_n==record['bytes'] and self.part_h.hexdigest()==record['sha256'],name
                self.completed.append(name); self.f.close(); self.f=None; self.i+=1
        return bytes(out)

def verify(root):
    manifest_path=root/'MANIFEST.json'
    m=json.loads(manifest_path.read_bytes())
    assert m['schema']=='1370-r12-ag-p13a-clean-archive-r1'
    assert m['archive']['type']=='uncompressed-tar'
    parts=m['archive']['parts']
    assert len(parts)>=3 and all(0<x['bytes']<=m['partLimitBytes']==48*1024*1024 for x in parts)
    reader=Parts(root,parts); seen={}
    with tarfile.open(fileobj=reader,mode='r|') as tar:
        for member in tar:
            name=member.name
            assert name in m['files'] and name not in seen and not name.startswith('/') and '..' not in Path(name).parts,name
            expected=m['files'][name]
            if member.isfile():
                assert expected['type']=='file' and member.size==expected['bytes'],name
                h=hashlib.sha256(); n=0; f=tar.extractfile(member)
                assert f is not None
                while b:=f.read(1024*1024): h.update(b); n+=len(b)
                assert n==expected['bytes'] and h.hexdigest()==expected['sha256'],name
            else:
                assert member.issym() and expected=={'type':'symlink','target':member.linkname},name
            seen[name]=True
    assert set(seen)==set(m['files']),set(m['files'])-set(seen)
    while reader.read(1024*1024): pass
    assert len(reader.completed)==len(parts)
    assert reader.n==m['archive']['bytes'] and reader.h.hexdigest()==m['archive']['sha256']
    assert set(p.name for p in root.iterdir())=={'MANIFEST.json',*(x['name'] for x in parts)}
    return dict(status='PASS',manifestSha256=sha(manifest_path),archiveSha256=reader.h.hexdigest(),archiveBytes=reader.n,parts=len(parts),files=len(seen))

if __name__=='__main__':
    root=Path(sys.argv[1]).resolve(strict=True)
    print(json.dumps(verify(root),sort_keys=True))
