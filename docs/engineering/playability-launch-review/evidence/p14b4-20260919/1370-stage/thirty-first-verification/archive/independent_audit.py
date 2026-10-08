#!/usr/bin/env python3
"""Independent, read-only observed archive check for E0G p13a r12."""
import hashlib, json, os, stat, tarfile
from pathlib import Path

B=Path('/Users/zacheryspector/studio-scratch')
P=B/'1370-r12-followon-e0g-p13a-archive-r2'
O=B/'1370-r12-e0g-p13a-archive-observed-review-r1'
PIN=B/'1370-r12-e0g-p13a-archive-pin-r1/PIN.json'
OBS=B/'1370-e0g-p13a-clean-observed-review-r12-r2/RECEIPT.json'

def sha(b):return hashlib.sha256(b).hexdigest()
def fh(p):
 h=hashlib.sha256();n=0
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1<<20),b''):h.update(b);n+=len(b)
 return n,h.hexdigest()
class Reader:
 def __init__(self,parts):self.parts=parts;self.i=0;self.f=None;self.h=hashlib.sha256();self.n=0;self.ph=None;self.pn=0
 def read(self,size=-1):
  if size<0:size=1<<20
  out=bytearray()
  while len(out)<size and self.i<len(self.parts):
   if self.f is None:self.f=(P/'package'/self.parts[self.i]['name']).open('rb');self.ph=hashlib.sha256();self.pn=0
   b=self.f.read(min(size-len(out),1<<20))
   if b:out.extend(b);self.h.update(b);self.ph.update(b);self.n+=len(b);self.pn+=len(b)
   else:
    rec=self.parts[self.i]
    assert self.pn==rec['bytes'] and self.ph.hexdigest()==rec['sha256'],f'bad part {self.i}'
    self.f.close();self.f=None;self.i+=1
  return bytes(out)
def main():
 O.mkdir(exist_ok=False)
 mraw=(P/'package/MANIFEST.json').read_bytes();m=json.loads(mraw)
 pinraw=PIN.read_bytes();pin=json.loads(pinraw)
 assert sha(pinraw)=='ad6e3d19cc64136aecb42d754a1b01dd5d7dd9576f3fdfbdf9bc2e4e1123f372'
 assert sha(mraw)=='9eb000047b1757198120be1cf418367ef8bd7cea69999a8328f4bd0ba80ea98f'
 assert m['pin']==pin and m['pinSha256']==sha(pinraw)
 assert sha(OBS.read_bytes())==pin['observedReceiptSha256']
 assert json.loads(OBS.read_bytes())['decision']=='ACCEPT_OBSERVED_R12_E0G_P13A_CLEAN_ONLY'
 assert m['archive']['type']=='uncompressed-tar' and len(m['archive']['parts'])==3
 assert sorted(p.name for p in (P/'package').iterdir())==sorted(['MANIFEST.json']+[x['name'] for x in m['archive']['parts']])
 assert len(m['members'])==232 and len({x['path'] for x in m['members']})==232
 idx={x['path']:x for x in m['members']};seen=set()
 r=Reader(m['archive']['parts'])
 with tarfile.open(fileobj=r,mode='r|') as tf:
  for member in tf:
   x=idx[member.name];assert member.name not in seen;seen.add(member.name)
   assert member.mode==x['mode'] and member.uid==member.gid==member.mtime==0
   assert not member.uname and not member.gname
   if x['type']=='file':
    assert member.isfile() and member.size==x['bytes']
    f=tf.extractfile(member);h=hashlib.sha256();n=0
    while b:=f.read(1<<20):h.update(b);n+=len(b)
    assert (n,h.hexdigest())==(x['bytes'],x['sha256'])
   elif x['type']=='directory':assert member.isdir()
   elif x['type']=='symlink':assert member.issym() and member.linkname==x['target'] and sha(os.fsencode(member.linkname))==x['targetSha256']
   else:raise AssertionError('member kind')
 while r.read(1<<20):pass
 assert r.i==3 and len(seen)==232 and r.n==m['archive']['bytes']==112998400
 assert r.h.hexdigest()==m['archive']['sha256']=='bb1c5113a64f53b03c98ba47db94c69054ef1afb4cd2d9588db289462a4d6bfe'
 # Independently map every archived object back to its retained source path.
 for name,x in idx.items():
  prefix,rel=name.split('/',1)
  root=Path(m['sourcePaths'][prefix]) if prefix!='lane' else B
  source=root/rel if prefix!='lane' else B/rel
  st=source.lstat();assert stat.S_IMODE(st.st_mode)==x['mode']
  if x['type']=='file':assert stat.S_ISREG(st.st_mode) and fh(source)==(x['bytes'],x['sha256'])
  elif x['type']=='directory':assert stat.S_ISDIR(st.st_mode)
  else:assert stat.S_ISLNK(st.st_mode) and os.readlink(source)==x['target']
 for stem in ('build-r3','verify-r3'):
  meta=(P/f'{stem}.lane.log.meta').read_text()
  assert meta.count('end, exit 0; ')==1 and (P/f'{stem}.lane.log').is_file()
 assert json.loads((P/'verify-r3.lane.log').read_text())['status']=='PASS_LOCAL_BYTE_PRESERVATION_ONLY'
 report=f'''# Independent E0G p13a archive observed review\n\nDecision: **ACCEPT_ARCHIVE_LOCAL_ONLY**. The recorded build and verify lanes both exited 0. Independent streaming readback verified all three part hashes, combined tar SHA-256, 232 unique members and every file byte/mode/symlink target against the manifest and retained source. The manifest and pin match their fixed digests; the pin binds the accepted E0G p13a observed clean receipt. This proves local byte preservation only. It is not a remote GitHub publication or permission to remove source.\n\nManifest SHA-256: `{sha(mraw)}`. Tar SHA-256: `{r.h.hexdigest()}`. Logical tar bytes: {r.n}.\n'''
 (O/'REPORT.md').write_text(report)
 receipt={'decision':'ACCEPT_ARCHIVE_LOCAL_ONLY','manifestSha256':sha(mraw),'archiveSha256':r.h.hexdigest(),'archiveBytes':r.n,'memberCount':len(seen),'parts':len(r.parts),'pinSha256':sha(pinraw),'observedReceiptSha256':pin['observedReceiptSha256'],'reportSha256':sha((O/'REPORT.md').read_bytes())}
 (O/'RECEIPT.json').write_text(json.dumps(receipt,sort_keys=True,indent=2)+'\n')
 print(json.dumps(receipt,sort_keys=True))
if __name__=='__main__':main()
