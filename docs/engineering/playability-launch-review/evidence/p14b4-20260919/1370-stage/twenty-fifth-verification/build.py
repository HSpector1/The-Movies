#!/usr/bin/env python3
"""Deterministic, exact-member 1370-K evidence archive builder; stdlib only."""
import hashlib, json, os, stat, sys, tarfile
from pathlib import Path

BASE=Path(__file__).resolve().parent
SCOPE=BASE/'SCOPE.json'; MEMBERS=BASE/'MEMBERS.json'

def digest(b): return hashlib.sha256(b).hexdigest()
def source_kind(p):
    st=p.lstat()
    if stat.S_ISLNK(st.st_mode): return 'symlink'
    if stat.S_ISDIR(st.st_mode): return 'directory'
    if stat.S_ISREG(st.st_mode): return 'file'
    raise RuntimeError(f'unsupported source object: {p}')
def scan_one(p, arc):
    kind=source_kind(p)
    if any(x in p.parts for x in ('__pycache__','.vite','.git')): raise RuntimeError(f'excluded path: {p}')
    item={'source':str(p),'archivePath':arc,'kind':kind,'mode':stat.S_IMODE(p.lstat().st_mode)}
    if kind=='file':
        data=p.read_bytes(); item.update(size=len(data),sha256=digest(data))
    elif kind=='symlink':
        target=os.readlink(p); item.update(target=target,size=len(target.encode()),sha256=digest(target.encode()))
    else: item.update(size=0)
    yield item
    if kind=='directory':
        for child in sorted(p.iterdir(),key=lambda q:q.name):
            yield from scan_one(child,arc+'/'+child.name)
def scan(scope):
    items=[]
    for root in scope['roots']:
        p=Path(root['source'])
        if not p.is_absolute() or not p.exists() and not p.is_symlink(): raise RuntimeError(f'missing root: {p}')
        if source_kind(p)!=root['kind']: raise RuntimeError(f'root kind mismatch: {p}')
        items.extend(scan_one(p,root['archivePath']))
    names=[i['archivePath'] for i in items]
    if len(names)!=len(set(names)): raise RuntimeError('duplicate archive path')
    return items
def main(out):
    scope=json.loads(SCOPE.read_text()); pinned=json.loads(MEMBERS.read_text())
    if scope['schema']!='1370-k-evidence-r1': raise RuntimeError('scope schema mismatch')
    actual=scan(scope)
    if actual!=pinned['members']: raise RuntimeError('member drift or unlisted extra/missing path')
    if pinned['scopeSha256']!=digest(SCOPE.read_bytes()): raise RuntimeError('scope hash mismatch')
    if pinned['count']!=len(actual): raise RuntimeError('count mismatch')
    out=Path(out)
    if out.resolve()==(BASE/'EVIDENCE.tar').resolve() and out.exists(): raise RuntimeError('refuse archive overwrite')
    with tarfile.open(out,'w',format=tarfile.PAX_FORMAT) as tar:
        for item in actual:
            info=tarfile.TarInfo(item['archivePath'])
            info.uid=info.gid=0; info.uname=info.gname=''; info.mtime=0; info.mode=item['mode']; info.pax_headers={}
            if item['kind']=='directory': info.type=tarfile.DIRTYPE; info.size=0; tar.addfile(info)
            elif item['kind']=='symlink': info.type=tarfile.SYMTYPE; info.linkname=item['target']; info.size=0; tar.addfile(info)
            else:
                info.type=tarfile.REGTYPE; info.size=item['size']
                with open(item['source'],'rb') as f: tar.addfile(info,f)
    print(json.dumps({'archive':str(out),'sha256':digest(out.read_bytes()),'bytes':out.stat().st_size,'members':len(actual)},sort_keys=True))
if __name__=='__main__':
    if len(sys.argv)!=2: raise SystemExit('usage: python3 -I -B build.py OUTPUT.tar')
    main(sys.argv[1])
